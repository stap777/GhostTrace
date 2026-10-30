import React, { useEffect } from 'react';
import type { GhostMessage } from '@ghost-trace/shared';

interface FakeMessagesPageProps {
  message: GhostMessage;
  isRead: boolean;
  onMarkAsRead: () => void;
}

export const FakeMessagesPage: React.FC<FakeMessagesPageProps> = ({
  message,
  isRead,
  onMarkAsRead
}) => {
  // Automatically mark as read when team navigates to and opens the message view
  useEffect(() => {
    if (!isRead) {
      onMarkAsRead();
    }
  }, [isRead, onMarkAsRead]);

  return (
    <div className="messages-page" aria-label="Campus Administrative Mail Interface">
      <div className="messages-top-bar">
        <div>
          <h2 className="messages-title">Internal Administrative Dispatch</h2>
          <p className="messages-subtitle">Secure mailbox: Admin Group (Distribution List)</p>
        </div>
        <div className="inbox-status-tag mono">
          <span>INBOX: 1 MESSAGE</span>
          {!isRead && <span className="unread-pill">NEW</span>}
        </div>
      </div>

      <div className="email-container">
        {/* Email Header */}
        <div className="email-header">
          <div className="email-subject-row">
            <h3 className="email-subject">{message.subject}</h3>
            <span className="email-priority-tag mono">UNVERIFIED ORIGIN</span>
          </div>

          <div className="email-metadata-grid">
            <div className="meta-field">
              <span className="meta-label">From:</span>
              <span className="meta-value sender-highlight mono">{message.from}</span>
              <span className="unverified-badge">External Identity / Spoofed</span>
            </div>
            <div className="meta-field">
              <span className="meta-label">To:</span>
              <span className="meta-value mono">{message.to}</span>
            </div>
            <div className="meta-field">
              <span className="meta-label">Timestamp:</span>
              <span className="meta-value mono">{message.timestamp}</span>
            </div>
            <div className="meta-field">
              <span className="meta-label">Routing:</span>
              <span className="meta-value mono">SMTP RELAY · RELAY-NODE-03 (Intercepted)</span>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="email-body">
          <div className="email-text-content mono">
            {message.body.split('\n\n').map((paragraph, index) => (
              <p key={index} className="email-paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Read Status Footer */}
        <div className="email-footer-bar">
          <div className="read-status-indicator">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="read-status-text">Message marked as read for this session</span>
          </div>
          <span className="reply-disabled-text mono">
            [REPLY DISABLED — EXTERNAL ROUTING IS TERMINATED]
          </span>
        </div>
      </div>
    </div>
  );
};
