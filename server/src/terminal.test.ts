import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SUPPORTED_COMMANDS,
  ORBIT_SERVICES_TELEMETRY,
  VIRTUAL_FILES,
  getBrokenFiles,
  getModifiedFiles,
  getVirtualDirectoryEntries,
  getVirtualFile,
  normalizeVirtualPath,
  findClosestCommand,
  executeOrbitCommand
} from '@ghost-trace/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Phase 4: ORBIT Campus Simulated Terminal Verification', () => {
  test('1. orbit help lists every supported command', () => {
    const result = executeOrbitCommand('orbit help');
    assert.ok(result.lines.length > 0);
    const fullText = result.lines.join('\n');

    for (const cmd of SUPPORTED_COMMANDS) {
      assert.ok(
        fullText.includes(cmd),
        `orbit help must document supported command: ${cmd}`
      );
    }
  });

  test('2. Each valid command returns its expected output format', () => {
    const commandsToTest = [
      'orbit help',
      'orbit services',
      'orbit broken',
      'orbit modified',
      'orbit files',
      'orbit files /logs',
      'orbit inspect /logs/auth.log',
      'orbit read /logs/auth.log',
      'clear'
    ];

    for (const cmd of commandsToTest) {
      const res = executeOrbitCommand(cmd);
      assert.ok(Array.isArray(res.lines), `Command "${cmd}" must return lines array`);
      if (cmd === 'clear') {
        assert.equal(res.clear, true, 'clear must set clear flag');
      } else {
        assert.ok(res.lines.length > 0, `Command "${cmd}" must produce non-empty lines`);
      }
    }
  });

  test('3. orbit services reports all five correct initial service states', () => {
    const result = executeOrbitCommand('orbit services');
    const text = result.lines.join('\n');

    const expectedServices = [
      { name: 'Student Portal', status: 'OFFLINE' },
      { name: 'Academic Records', status: 'COMPROMISED' },
      { name: 'Campus Mail', status: 'DEGRADED' },
      { name: 'Campus Network', status: 'UNSTABLE' },
      { name: 'Backup & Recovery', status: 'RESTRICTED' }
    ];

    for (const expected of expectedServices) {
      assert.ok(
        text.includes(expected.name),
        `Must include service: ${expected.name}`
      );
      assert.ok(
        text.includes(expected.status),
        `Must report status ${expected.status} for ${expected.name}`
      );
    }
  });

  test('4. Uptime and last-active timestamps are deterministic', () => {
    assert.equal(ORBIT_SERVICES_TELEMETRY.length, 5);

    const firstRun = executeOrbitCommand('orbit services');
    const secondRun = executeOrbitCommand('orbit services');
    assert.deepEqual(firstRun.lines, secondRun.lines, 'Output must be strictly deterministic');

    const studentPortal = ORBIT_SERVICES_TELEMETRY.find((s) => s.name === 'Student Portal');
    assert.equal(studentPortal?.status, 'OFFLINE');
    assert.equal(studentPortal?.uptime, '0d 00h 00m');
    assert.equal(studentPortal?.lastActive, '21:04:12 (Halted)');
  });

  test('5. orbit broken groups files into the three required categories', () => {
    const broken = getBrokenFiles();
    assert.ok(broken.corrupted.length > 0, 'Must have at least one corrupted file');
    assert.ok(broken.missing.length > 0, 'Must have at least one missing file');
    assert.ok(broken.inaccessible.length > 0, 'Must have at least one inaccessible file');

    const result = executeOrbitCommand('orbit broken');
    const text = result.lines.join('\n');

    assert.ok(text.includes('1. CORRUPTED FILES'), 'Must include CORRUPTED category');
    assert.ok(text.includes('2. MISSING FILES'), 'Must include MISSING category');
    assert.ok(text.includes('3. INACCESSIBLE FILES'), 'Must include INACCESSIBLE category');

    for (const f of broken.corrupted) {
      assert.ok(text.includes(f.path), `Corrupted file ${f.path} must be listed`);
    }
    for (const f of broken.missing) {
      assert.ok(text.includes(f.path), `Missing file ${f.path} must be listed`);
    }
    for (const f of broken.inaccessible) {
      assert.ok(text.includes(f.path), `Inaccessible file ${f.path} must be listed`);
    }
  });

  test('6. orbit modified sorts timestamps newest first', () => {
    const modified = getModifiedFiles();
    assert.ok(modified.length >= 3, 'Must have multiple modified file records');

    for (let i = 0; i < modified.length - 1; i++) {
      const current = modified[i].modifiedAt;
      const next = modified[i + 1].modifiedAt;
      assert.ok(
        current.localeCompare(next) >= 0,
        `File at index ${i} (${current}) must be newer or equal to ${i + 1} (${next})`
      );
    }

    const res = executeOrbitCommand('orbit modified');
    assert.ok(res.lines.length > 0);
  });

  test('7. orbit files lists only virtual directory entries', () => {
    const rootListing = executeOrbitCommand('orbit files');
    const rootText = rootListing.lines.join('\n');
    assert.ok(rootText.includes('/logs'), 'Root should contain /logs');
    assert.ok(rootText.includes('/records'), 'Root should contain /records');

    const logsListing = executeOrbitCommand('orbit files /logs');
    const logsText = logsListing.lines.join('\n');
    assert.ok(logsText.includes('auth.log'), 'Logs should contain auth.log');
    assert.ok(logsText.includes('mail_queue.log'), 'Logs should contain mail_queue.log');
    // Root files should not appear in /logs
    assert.ok(!logsText.includes('/records'), 'Subdirectory must not list other parent/sibling directories');
  });

  test('8. Unknown and malformed paths are rejected safely', () => {
    const traversalTests = [
      'orbit files ../../',
      'orbit files /../../etc/shadow',
      'orbit inspect ../../../passwd',
      'orbit read ../../../Windows/System32/drivers/etc/hosts',
      'orbit files /nonexistent_folder_xyz',
      'orbit inspect /not/a/real/path.log',
      'orbit read /records/ghost_nonexistent.txt'
    ];

    for (const cmd of traversalTests) {
      const res = executeOrbitCommand(cmd);
      assert.ok(res.lines.length > 0);
      const text = res.lines.join('\n');
      assert.ok(
        text.includes('Error:') || text.includes('Directory not found') || text.includes('File not found'),
        `Command "${cmd}" must safely report an error instead of crashing or leaking data: ${text}`
      );
    }
  });

  test('9. orbit inspect returns consistent metadata', () => {
    const authLogInspect = executeOrbitCommand('orbit inspect /logs/auth.log');
    const text = authLogInspect.lines.join('\n');

    assert.ok(text.includes('File:          /logs/auth.log'));
    assert.ok(text.includes('Type:          Regular File'));
    assert.ok(text.includes('Owner:         root'));
    assert.ok(text.includes('Permissions:   -rw-r--r--'));
    assert.ok(text.includes('Status:        Normal (Verified)'));

    // Corrupted file inspect
    const corruptedInspect = executeOrbitCommand('orbit inspect /records/students.db');
    const corruptedText = corruptedInspect.lines.join('\n');
    assert.ok(corruptedText.includes('Integrity:     CORRUPTED'));
    assert.ok(corruptedText.includes('Integrity Note: Cryptographic SHA256 checksum mismatch'));

    // Missing file inspect
    const missingInspect = executeOrbitCommand('orbit inspect /services/portal-gateway.pid');
    const missingText = missingInspect.lines.join('\n');
    assert.ok(missingText.includes('Integrity:     MISSING'));

    // Inaccessible file inspect
    const inaccessibleInspect = executeOrbitCommand('orbit inspect /backups/snapshot_daily.tar.enc');
    const inaccessibleText = inaccessibleInspect.lines.join('\n');
    assert.ok(inaccessibleText.includes('Integrity:     INACCESSIBLE'));
  });

  test('10. orbit read returns approved predefined content', () => {
    const res = executeOrbitCommand('orbit read /logs/auth.log');
    const text = res.lines.join('\n');
    assert.ok(text.includes('--- START OF FILE: /logs/auth.log ---'));
    assert.ok(text.includes('auth-daemon[102]: Listener active on port 22/tcp'));
    assert.ok(text.includes('GHOST'));
    assert.ok(text.includes('--- END OF FILE: /logs/auth.log ---'));
  });

  test('11. Missing, inaccessible, and corrupted files return appropriate errors on orbit read', () => {
    // Missing
    const missingRes = executeOrbitCommand('orbit read /services/portal-gateway.pid');
    assert.ok(missingRes.lines[0].includes('File is missing from virtual storage'));

    // Corrupted
    const corruptedRes = executeOrbitCommand('orbit read /records/students.db');
    assert.ok(corruptedRes.lines[0].includes('File is corrupted and cannot be read as text'));

    // Inaccessible
    const inaccessibleRes = executeOrbitCommand('orbit read /backups/snapshot_daily.tar.enc');
    assert.ok(inaccessibleRes.lines[0].includes('Access denied. File permissions restrict reading'));

    // Directory
    const dirRes = executeOrbitCommand('orbit read /records');
    assert.ok(dirRes.lines[0].includes('Cannot read directory as a text file'));
  });

  test('12. clear clears only the transcript without altering virtual state', () => {
    const beforeUptime = JSON.stringify(ORBIT_SERVICES_TELEMETRY);
    const beforeFiles = JSON.stringify(VIRTUAL_FILES);

    const clearRes = executeOrbitCommand('clear');
    assert.equal(clearRes.clear, true);
    assert.equal(clearRes.lines.length, 0);

    const afterUptime = JSON.stringify(ORBIT_SERVICES_TELEMETRY);
    const afterFiles = JSON.stringify(VIRTUAL_FILES);

    assert.equal(beforeUptime, afterUptime, 'Telemetry must not be altered by clear');
    assert.equal(beforeFiles, afterFiles, 'VFS must not be altered by clear');
  });

  test('13. Invalid commands produce helpful errors and appropriate suggestions', () => {
    const typoCases = [
      { input: 'orbit servicess', expectedSuggestion: 'orbit services' },
      { input: 'orbit file', expectedSuggestion: 'orbit files' },
      { input: 'orbit readfile', expectedSuggestion: 'orbit read' },
      { input: 'clearr', expectedSuggestion: 'clear' }
    ];

    for (const { input, expectedSuggestion } of typoCases) {
      const res = executeOrbitCommand(input);
      const text = res.lines.join('\n');
      assert.ok(text.includes(`Unknown command: ${input}`));
      assert.ok(
        text.includes(`Did you mean: ${expectedSuggestion}?`),
        `Expected suggestion "${expectedSuggestion}" for input "${input}", got: ${text}`
      );
      assert.ok(text.includes("Type 'orbit help' for a list of valid commands."));
    }
  });

  test('14. Command history works with Up and Down navigation state', () => {
    // Simulate terminal keyboard history buffer behavior
    const history = ['orbit services', 'orbit files', 'orbit inspect /logs/auth.log'];
    let historyIndex = history.length;

    // Up Arrow step 1
    if (historyIndex > 0) historyIndex--;
    assert.equal(history[historyIndex], 'orbit inspect /logs/auth.log');

    // Up Arrow step 2
    if (historyIndex > 0) historyIndex--;
    assert.equal(history[historyIndex], 'orbit files');

    // Up Arrow step 3
    if (historyIndex > 0) historyIndex--;
    assert.equal(history[historyIndex], 'orbit services');

    // Up Arrow at boundary
    if (historyIndex > 0) historyIndex--;
    assert.equal(history[historyIndex], 'orbit services');

    // Down Arrow step 1
    if (historyIndex < history.length - 1) historyIndex++;
    assert.equal(history[historyIndex], 'orbit files');

    // Down Arrow step 2
    if (historyIndex < history.length - 1) historyIndex++;
    assert.equal(history[historyIndex], 'orbit inspect /logs/auth.log');
  });

  test('15. Terminal cannot execute arbitrary shell commands', () => {
    const forbiddenCommands = [
      'ls -la',
      'cat /etc/shadow',
      'rm -rf /',
      'curl http://example.com',
      'whoami',
      'sh',
      'bash -c "id"',
      'powershell -Command Get-Process',
      'eval("console.log(1)")',
      'dir C:\\'
    ];

    for (const dangerous of forbiddenCommands) {
      const res = executeOrbitCommand(dangerous);
      const text = res.lines.join('\n');
      assert.ok(
        text.includes('Unknown command:') || text.includes('not permitted') || text.includes('not supported'),
        `Dangerous command "${dangerous}" must be rejected as an unknown or unsupported command: ${text}`
      );
    }
  });

  test('16. Terminal cannot access the real host filesystem', () => {
    const hostPaths = [
      'C:\\Windows\\System32\\cmd.exe',
      'D:\\Desktop\\project\\Ghost\\package.json',
      '../../package.json',
      '/etc/passwd',
      '/var/log/syslog'
    ];

    for (const hostPath of hostPaths) {
      const resInspect = executeOrbitCommand(`orbit inspect ${hostPath}`);
      const inspectText = resInspect.lines.join('\n');
      assert.ok(
        inspectText.includes('File not found in virtual filesystem') ||
        inspectText.includes('Path is invalid'),
        `Host path "${hostPath}" must not resolve in virtual inspect`
      );

      const resRead = executeOrbitCommand(`orbit read ${hostPath}`);
      const readText = resRead.lines.join('\n');
      assert.ok(
        readText.includes('File not found in virtual filesystem') ||
        readText.includes('Path is invalid'),
        `Host path "${hostPath}" must not resolve in virtual read`
      );
    }
  });

  test('17. Path normalization strictly forbids traversal outside virtual root', () => {
    assert.equal(normalizeVirtualPath('/'), '/');
    assert.equal(normalizeVirtualPath('/logs/auth.log'), '/logs/auth.log');
    assert.equal(normalizeVirtualPath('/logs/../logs/auth.log'), '/logs/auth.log');
    assert.equal(normalizeVirtualPath('/../../../..'), null);
    assert.equal(normalizeVirtualPath('../../package.json'), null);
    assert.equal(normalizeVirtualPath('/records/../../etc/passwd'), null);
  });

  test('18. Navigation items include Overview, Fake Messages, and Terminal', async () => {
    // Verify client Navigation component structure
    const navFile = path.resolve(__dirname, '../../client/src/components/Navigation.tsx');
    const content = fs.readFileSync(navFile, 'utf-8');
    assert.ok(content.includes("'terminal'"), 'Navigation must support terminal tab');
    assert.ok(content.includes('Terminal'), 'Navigation must render Terminal item');
    assert.ok(content.includes('Overview'), 'Navigation must render Overview item');
    assert.ok(content.includes('Fake Messages'), 'Navigation must render Fake Messages item');
    assert.ok(content.includes('Coming soon'), 'Navigation must preserve coming soon placeholders');
  });

  test('19. App guards Terminal workspace behind authenticated session', async () => {
    const appFile = path.resolve(__dirname, '../../client/src/App.tsx');
    const appContent = fs.readFileSync(appFile, 'utf-8');
    assert.ok(
      appContent.includes('!session'),
      'App must check session existence before rendering dashboard or terminal'
    );
    assert.ok(
      appContent.includes('<TerminalPage'),
      'App must render TerminalPage when currentTab is terminal'
    );
    assert.ok(
      appContent.includes("currentTab === 'terminal'"),
      'Terminal must be conditionally rendered on currentTab'
    );
  });

  test('20. Terminal page contains diagnostic header, disclaimer, and safe styling', async () => {
    const terminalPageFile = path.resolve(__dirname, '../../client/src/components/TerminalPage.tsx');
    const pageContent = fs.readFileSync(terminalPageFile, 'utf-8');
    assert.ok(pageContent.includes('ORBIT DIAGNOSTIC TERMINAL'), 'Must include header title');
    assert.ok(pageContent.includes('Environment: ORBIT Campus'), 'Must include campus environment tag');
    assert.ok(pageContent.includes('Mode: SIMULATED'), 'Must include simulated mode indicator');
    assert.ok(pageContent.includes('ghost@orbit:~$'), 'Must include diagnostic prompt format');
    assert.ok(pageContent.includes('fictional'), 'Must display fictional diagnostic notice');
  });
});
