import React, { useState } from 'react';
import type { LoginRequest, LoginResponse } from '@ghost-trace/shared';

interface LoginFormProps {
  onLoginSuccess: (sessionId: string, sessionRef: string, username: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload: LoginRequest = {
        username: username.trim(),
        password
      };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data: LoginResponse = await response.json();

      if (response.ok && data.success && data.sessionId && data.sessionRef) {
        onLoginSuccess(data.sessionId, data.sessionRef, data.authenticatedUser || username.trim());
      } else {
        // Generic failure message from backend; username is preserved
        setErrorMessage(data.message || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMessage('Unable to reach authentication gateway. Please check network link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="portal-layout">
      {/* Top Status Bar */}
      <div className="portal-top-bar">
        <div className="status-badge mono">
          <span className="status-dot"></span>
          RESTRICTED SYSTEM ACCESS
        </div>
        <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          SEC-ID: ORBIT-ADMIN
        </span>
      </div>

      {/* Main Content Area */}
      <main className="portal-main">
        <div className="login-card">
          <div className="brand-section">
            <div className="brand-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v4" />
                <path d="M12 17v4" />
                <path d="M3 12h4" />
                <path d="M17 12h4" />
              </svg>
            </div>
            <h1 className="brand-title">ORBIT CAMPUS</h1>
            <p className="brand-subtitle">Information Technology &amp; Systems Administration</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {errorMessage && (
              <div className="alert-error" role="alert" aria-live="assertive">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Campus Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="form-input"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                placeholder="Enter campus username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <span>Administrative Password</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-toggle"
                  autoComplete="current-password"
                  placeholder="Enter security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner" aria-hidden="true"></span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="portal-footer">
        <p className="footer-text">
          ORBIT CAMPUS SYSTEMS · AUTHORIZED ACCESS ONLY
        </p>
      </footer>
    </div>
  );
};
