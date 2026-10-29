import React, { useEffect, useState } from 'react';
import type { HealthResponse } from '@ghost-trace/shared';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      // Proxied through Vite dev server to backend /api/health
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data: HealthResponse = await response.json();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown communication error');
      setHealth(null);
    } finally {
      setLoading(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <span className="tagline mono">SYSTEM INITIALIZATION // PHASE 1</span>
        <h1 className="title">
          <span>🛡️</span> OPERATION: GHOST TRACE
        </h1>
        <p className="subtitle">
          Cybersecurity Investigation Simulation Framework — Infrastructure Verification
        </p>
      </header>

      <main>
        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 className="card-title" style={{ margin: 0 }}>
              Backend API Status
            </h2>
            {loading ? (
              <span className="badge badge-connecting">
                <span className="pulse-dot"></span> Polling API...
              </span>
            ) : health?.status === 'ok' ? (
              <span className="badge badge-online">
                <span className="pulse-dot"></span> Connected
              </span>
            ) : (
              <span className="badge badge-offline">
                <span className="pulse-dot"></span> Disconnected
              </span>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Verifying the communication channel between the React client and the Express API server via the Vite reverse proxy (<code>/api</code>).
          </p>

          <div className="grid-stats">
            <div className="stat-item">
              <div className="stat-label">Endpoint</div>
              <div className="stat-value mono">GET /api/health</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Service Identifier</div>
              <div className="stat-value mono">{health?.service ?? (loading ? 'Detecting...' : 'Unavailable')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">API Version</div>
              <div className="stat-value mono">{health?.version ?? (loading ? '...' : 'N/A')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Server Timestamp</div>
              <div className="stat-value mono" style={{ fontSize: '0.8rem' }}>
                {health?.timestamp ?? (loading ? '...' : 'N/A')}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px', color: '#fca5a5', fontSize: '0.85rem' }}>
              <strong>Communication Error:</strong> {error}
            </div>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn" onClick={checkHealth} disabled={loading}>
              {loading ? 'Checking...' : 'Re-verify Link'}
            </button>
            {lastChecked && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Client Check: {lastChecked}
              </span>
            )}
          </div>
        </section>

        <section className="card" style={{ borderStyle: 'dashed' }}>
          <h2 className="card-title">Architecture Status: Phase 1 Active</h2>
          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', paddingLeft: '1.25rem', lineHeight: '1.8' }}>
            <li><code>client/</code>: React + TypeScript + Vite initialized with <code>/api</code> proxy.</li>
            <li><code>server/</code>: Express + TypeScript API operational without persistent database.</li>
            <li><code>shared/</code>: Clean contract boundary with shared public DTOs.</li>
            <li>No puzzle stages, secrets, or shell commands initialized.</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default App;
