import React from 'react';
import type { ServiceCardData, RecentActivityItem } from '@ghost-trace/shared';
import { computeSystemSummary } from '../data/dashboardData';

interface OverviewPageProps {
  services: ServiceCardData[];
  activityItems: RecentActivityItem[];
  onSelectService: (service: ServiceCardData) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  services,
  activityItems,
  onSelectService
}) => {
  const summary = computeSystemSummary(services);

  return (
    <div className="overview-page">
      {/* Top Banner Alert */}
      <section className="incident-banner" aria-label="Incident Alert Summary">
        <div className="incident-banner-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div className="incident-banner-content">
          <h2 className="banner-title">ACTIVE CAMPUS CYBER INCIDENT REPORTED</h2>
          <p className="banner-desc">
            Campus IT infrastructure telemetry indicates synchronized service degradation and perimeter authentication anomalies. Multiple core subsystems report offline or compromised states.
          </p>
        </div>
      </section>

      {/* A. System Summary */}
      <section className="summary-section" aria-label="System Health Summary">
        <div className="summary-grid">
          <div className="summary-stat-card">
            <span className="stat-label">System Health</span>
            <div className="stat-value-group">
              <span className="stat-value-primary mono">{summary.healthPercentage}%</span>
              <span className="stat-subtext">Compromised</span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill progress-critical"
                style={{ width: `${summary.healthPercentage}%` }}
                role="progressbar"
                aria-valuenow={summary.healthPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>

          <div className="summary-stat-card">
            <span className="stat-label">Operational Services</span>
            <div className="stat-value-group">
              <span className="stat-value-primary stat-operational mono">{summary.operationalCount}</span>
              <span className="stat-subtext">of {summary.totalCount} active</span>
            </div>
            <span className="stat-note">Zero nodes fully healthy</span>
          </div>

          <div className="summary-stat-card">
            <span className="stat-label">Failed Services</span>
            <div className="stat-value-group">
              <span className="stat-value-primary stat-failed mono">{summary.failedCount}</span>
              <span className="stat-subtext">critical failures</span>
            </div>
            <span className="stat-note">Immediate attention required</span>
          </div>

          <div className="summary-stat-card">
            <span className="stat-label">Impaired Services</span>
            <div className="stat-value-group">
              <span className="stat-value-primary stat-impaired mono">{summary.impairedCount}</span>
              <span className="stat-subtext">degraded or unstable</span>
            </div>
            <span className="stat-note">Operating under restrictions</span>
          </div>
        </div>
      </section>

      {/* Main Grid: B. Service Cards & C. Recent Activity */}
      <div className="content-split-grid">
        {/* B. Five Service Cards */}
        <section className="services-column" aria-label="Campus Services Status">
          <div className="section-header-row">
            <div>
              <h3 className="subsystem-title">Core Campus Services</h3>
              <p className="subsystem-desc">Select a service to inspect incident telemetry and status</p>
            </div>
            <span className="service-count-tag mono">5 Monitored</span>
          </div>

          <div className="service-cards-list">
            {services.map((service) => {
              const severityClass =
                service.severity === 'failed'
                  ? 'card-failed'
                  : service.severity === 'impaired'
                  ? 'card-impaired'
                  : 'card-operational';

              const pillClass =
                service.severity === 'failed'
                  ? 'badge-failed'
                  : service.severity === 'impaired'
                  ? 'badge-impaired'
                  : 'badge-operational';

              return (
                <button
                  key={service.id}
                  type="button"
                  className={`service-card ${severityClass}`}
                  onClick={() => onSelectService(service)}
                  aria-haspopup="dialog"
                  aria-label={`Inspect ${service.name}, status is ${service.status}`}
                >
                  <div className="service-card-top">
                    <div className="service-card-header">
                      <h4 className="service-name">{service.name}</h4>
                      <span className={`status-pill ${pillClass}`}>
                        <span className="status-dot"></span>
                        {service.status}
                      </span>
                    </div>
                    <p className="service-summary-text">{service.description}</p>
                  </div>

                  <div className="service-card-footer">
                    <span className="service-update-time mono">
                      Updated {service.lastUpdated}
                    </span>
                    <span className="service-inspect-link">
                      <span>Inspect Details</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* C. Recent Activity Panel */}
        <aside className="activity-column" aria-label="Incident Activity Feed">
          <div className="section-header-row">
            <div>
              <h3 className="subsystem-title">Recent Telemetry Activity</h3>
              <p className="subsystem-desc">Incident event timeline</p>
            </div>
            <span className="live-pulse-badge mono">
              <span className="pulse-dot"></span> RECORDED
            </span>
          </div>

          <div className="activity-feed-panel">
            <ol className="activity-list">
              {activityItems.map((item) => (
                <li key={item.id} className="activity-item">
                  <div className="activity-meta">
                    <span className="activity-timestamp mono">{item.timestamp}</span>
                    <span className="activity-service mono">{item.service}</span>
                  </div>
                  <p className="activity-event-text">{item.event}</p>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
};
