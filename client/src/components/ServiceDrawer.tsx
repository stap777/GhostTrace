import React, { useEffect, useRef } from 'react';
import type { ServiceCardData } from '@ghost-trace/shared';

interface ServiceDrawerProps {
  service: ServiceCardData | null;
  onClose: () => void;
}

export const ServiceDrawer: React.FC<ServiceDrawerProps> = ({ service, onClose }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!service) return;

    // Focus close button on open for keyboard accessibility
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [service, onClose]);

  if (!service) return null;

  const severityBadgeClass =
    service.severity === 'failed'
      ? 'badge-failed'
      : service.severity === 'impaired'
      ? 'badge-impaired'
      : 'badge-operational';

  return (
    <div className="drawer-overlay" onClick={onClose} aria-hidden="false">
      <div
        ref={drawerRef}
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div className="drawer-title-group">
            <span className="drawer-eyebrow mono">SERVICE STATUS DETAIL</span>
            <h2 id="drawer-title" className="drawer-title">
              {service.name}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close service status drawer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="drawer-content">
          {/* Status Indicator Banner */}
          <div className="drawer-status-box">
            <span className="drawer-status-label">Current State</span>
            <div className="drawer-status-row">
              <span className={`status-pill ${severityBadgeClass}`}>
                <span className="status-dot"></span>
                {service.status}
              </span>
              <span className="drawer-timestamp mono">
                Telemetry Log: {service.lastUpdated}
              </span>
            </div>
          </div>

          {/* Service Description */}
          <section className="drawer-section">
            <h3 className="section-heading">Operational Role</h3>
            <p className="section-text">{service.description}</p>
          </section>

          {/* Impact Summary */}
          <section className="drawer-section">
            <h3 className="section-heading">Incident Impact Assessment</h3>
            <div className="impact-callout">
              <p className="impact-text">{service.impactSummary}</p>
            </div>
          </section>

          {/* Investigation Evidence Section (Locked) */}
          <section className="drawer-section evidence-section">
            <div className="evidence-header">
              <h3 className="section-heading" style={{ margin: 0 }}>
                Investigation Evidence
              </h3>
              <span className="evidence-lock-pill mono">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                {service.evidenceStageLabel}
              </span>
            </div>

            <div className="evidence-locked-card">
              <div className="lock-icon-container" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="locked-card-text">
                <h4 className="locked-title">Forensic Artifacts Restricted</h4>
                <p className="locked-description">{service.evidenceDescription}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="drawer-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
