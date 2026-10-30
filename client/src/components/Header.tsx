import React from 'react';

interface HeaderProps {
  username: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ username, onLogout }) => {
  return (
    <header className="dashboard-header">
      <div className="header-brand">
        <div className="brand-badge-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v4" />
            <path d="M12 17v4" />
            <path d="M3 12h4" />
            <path d="M17 12h4" />
          </svg>
        </div>
        <div className="brand-text">
          <div className="brand-main">
            <span className="brand-name">ORBIT CAMPUS</span>
            <span className="brand-divider">/</span>
            <span className="brand-sub">SYSTEM ADMINISTRATION</span>
          </div>
          <span className="brand-cluster mono">CENTRAL GATEWAY · NODE 01</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Persistent Incident Indicator */}
        <div className="incident-badge" role="status" aria-label="Incident status: Incident Active">
          <span className="incident-dot pulse"></span>
          <span className="incident-text mono">Incident Active</span>
        </div>

        <div className="user-profile">
          <span className="user-label mono">{username}</span>
          <button
            type="button"
            className="btn-logout"
            onClick={onLogout}
            title="Terminate challenge session and log out"
            aria-label="Log out of ORBIT Campus"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
