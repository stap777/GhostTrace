import React, { useState, useEffect, useRef } from 'react';
import { executeOrbitCommand, type TerminalOutputLine } from '@ghost-trace/shared';

const MAX_TRANSCRIPT_ENTRIES = 500;

export const TerminalPage: React.FC = () => {
  const [transcript, setTranscript] = useState<TerminalOutputLine[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'ORBIT DIAGNOSTIC TERMINAL // KERNEL v4.19-ORBIT-SEC'
    },
    {
      id: 'init-2',
      type: 'system',
      text: 'Environment: ORBIT Campus | Mode: SIMULATED'
    },
    {
      id: 'init-3',
      type: 'warning',
      text: 'NOTICE: This simulated diagnostic console operates on fictional campus data only.'
    },
    {
      id: 'init-4',
      type: 'output',
      text: "Type 'orbit help' for available diagnostic tools and command manual."
    }
  ]);

  const [inputCommand, setInputCommand] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of terminal output
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Focus input automatically on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleTerminalAreaClick = () => {
    // Keep focus in input when clicking anywhere in the terminal transcript
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;

      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputCommand(commandHistory[nextIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;

      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setInputCommand('');
      } else {
        setHistoryIndex(nextIndex);
        setInputCommand(commandHistory[nextIndex] || '');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const commandToExecute = inputCommand.trim();

    if (!commandToExecute) {
      return;
    }

    // Add to command history
    setCommandHistory((prev) => [...prev, commandToExecute]);
    setHistoryIndex(-1);
    setInputCommand('');

    // Execute through virtual dispatcher
    const result = executeOrbitCommand(commandToExecute);

    if (result.clear) {
      setTranscript([]);
      return;
    }

    const newLines: TerminalOutputLine[] = [
      {
        id: `cmd-${Date.now()}-${Math.random()}`,
        type: 'command',
        text: `ghost@orbit:~$ ${commandToExecute}`
      }
    ];

    for (const text of result.lines) {
      let type: TerminalOutputLine['type'] = 'output';
      if (
        text.startsWith('Error:') ||
        text.startsWith('Unknown command:') ||
        text.includes('CRITICAL') ||
        text.includes('SIGKILL') ||
        text.includes('Failed password') ||
        text.includes('crashed:')
      ) {
        type = 'error';
      } else if (
        text.startsWith('Notice:') ||
        text.startsWith('Did you mean:') ||
        text.startsWith('[!]') ||
        text.includes('warning:') ||
        text.includes('Warning:') ||
        text.includes('STATUS DEGRADED') ||
        text.includes('UNSTABLE') ||
        text.includes('COMPROMISED') ||
        text.includes('Connection flood') ||
        text.includes('anomalous')
      ) {
        type = 'warning';
      } else if (
        text.startsWith('#') ||
        text.startsWith('--- START') ||
        text.startsWith('--- END') ||
        text.startsWith('Usage:') ||
        text.startsWith('Hint:')
      ) {
        type = 'system';
      } else if (text.includes('====') || text.includes('----')) {
        type = 'table';
      }

      newLines.push({
        id: `out-${Date.now()}-${Math.random()}`,
        type,
        text
      });
    }

    setTranscript((prev) => {
      const combined = [...prev, ...newLines];
      if (combined.length > MAX_TRANSCRIPT_ENTRIES) {
        return combined.slice(combined.length - MAX_TRANSCRIPT_ENTRIES);
      }
      return combined;
    });
  };

  return (
    <div className="terminal-workspace" onClick={handleTerminalAreaClick}>
      {/* Terminal Title Bar */}
      <div className="terminal-topbar">
        <div className="terminal-topbar-left">
          <div className="terminal-controls-dots" aria-hidden="true">
            <span className="dot dot-red"></span>
            <span className="dot dot-amber"></span>
            <span className="dot dot-green"></span>
          </div>
          <span className="terminal-title mono">ORBIT DIAGNOSTIC TERMINAL</span>
        </div>
        <div className="terminal-topbar-right mono">
          <span>Environment: ORBIT Campus</span>
          <span className="bar-separator">|</span>
          <span className="mode-simulated">Mode: SIMULATED</span>
        </div>
      </div>

      {/* Terminal Disclaimer Banner */}
      <div className="terminal-disclaimer mono">
        <span>[!] RESTRICTED VIRTUAL CONSOLE · ALL COMMANDS OPERATE ON PREDEFINED DIAGNOSTIC ARTIFACTS</span>
      </div>

      {/* Terminal Transcript Window */}
      <div
        className="terminal-transcript"
        role="log"
        aria-label="ORBIT diagnostic terminal transcript"
        aria-live="polite"
      >
        {transcript.map((line) => {
          let className = 'terminal-line mono';
          if (line.type === 'command') className += ' terminal-command-line';
          else if (line.type === 'error') className += ' terminal-error-line';
          else if (line.type === 'warning') className += ' terminal-warning-line';
          else if (line.type === 'table') className += ' terminal-table-line';
          else if (line.type === 'system') className += ' terminal-system-line';

          return (
            <div key={line.id} className={className}>
              {line.text}
            </div>
          );
        })}
        <div ref={transcriptEndRef} />
      </div>

      {/* Terminal Prompt & Input */}
      <form className="terminal-input-row" onSubmit={handleSubmit} noValidate>
        <label htmlFor="terminal-command-input" className="terminal-prompt mono">
          ghost@orbit:~$
        </label>
        <input
          id="terminal-command-input"
          ref={inputRef}
          type="text"
          className="terminal-input mono"
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
          aria-label="Terminal command input"
        />
      </form>
    </div>
  );
};
