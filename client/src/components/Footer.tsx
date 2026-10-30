import React from 'react';

interface FooterProps {
  sessionRef?: string;
}

export const Footer: React.FC<FooterProps> = ({ sessionRef }) => {
  return (
    <footer className="dashboard-footer">
      <div className="footer-content">
        <span className="footer-auth-notice">
          ORBIT CAMPUS SYSTEMS · AUTHORIZED ACCESS ONLY
        </span>
        {sessionRef && (
          <span className="footer-session-ref mono">
            SESSION REF: <strong>{sessionRef}</strong>
          </span>
        )}
      </div>
    </footer>
  );
};
