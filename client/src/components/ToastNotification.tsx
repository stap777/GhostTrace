import React, { useEffect, useState } from 'react';

interface ToastNotificationProps {
  visible: boolean;
  onDismiss: () => void;
  onViewMessages: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  visible,
  onDismiss,
  onViewMessages
}) => {
  const [closing, setClosing] = useState<boolean>(false);

  useEffect(() => {
    if (!visible) return;

    // Auto-dismiss after 8 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onDismiss();
      setClosing(false);
    }, 200);
  };

  const handleClickView = () => {
    onDismiss();
    onViewMessages();
  };

  return (
    <div
      className={`toast-container ${closing ? 'toast-fade-out' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="toast-card">
        <div className="toast-icon-wrap" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <div className="toast-body">
          <div className="toast-header-row">
            <span className="toast-title mono">INCOMING DISPATCH</span>
            <button
              type="button"
              className="toast-close-btn"
              onClick={handleClose}
              aria-label="Dismiss transmission alert"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <p className="toast-message">
            New transmission received from <strong>GHOST</strong> in Fake Messages.
          </p>
          <div className="toast-actions">
            <button type="button" className="toast-action-btn" onClick={handleClickView}>
              Open Inbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
