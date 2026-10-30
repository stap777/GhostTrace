import React, { useState, useEffect, useCallback } from 'react';
import type { ServiceCardData, SessionValidateResponse } from '@ghost-trace/shared';
import { Header } from './components/Header';
import { Navigation, type ActiveTab } from './components/Navigation';
import { OverviewPage } from './components/OverviewPage';
import { FakeMessagesPage } from './components/FakeMessagesPage';
import { TerminalPage } from './components/TerminalPage';
import { AttackMapPage } from './components/AttackMapPage';
import { ServiceDrawer } from './components/ServiceDrawer';
import { ToastNotification } from './components/ToastNotification';
import { Footer } from './components/Footer';
import { LoginForm } from './components/LoginForm';
import { INITIAL_SERVICES, RECENT_ACTIVITY_ITEMS, GHOST_MESSAGE } from './data/dashboardData';
import { clearAttackMapState } from './data/attackMapStorage';

const SESSION_STORAGE_KEY = 'orbit_session';

interface BrowserSessionState {
  sessionId: string;
  sessionRef: string;
  username: string;
  messageRead: boolean;
  toastShown: boolean;
}

export const App: React.FC = () => {
  const [session, setSession] = useState<BrowserSessionState | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<ActiveTab>('overview');
  const [selectedService, setSelectedService] = useState<ServiceCardData | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);

  // Validate existing browser-session state on initial mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) {
          setIsInitializing(false);
          return;
        }

        const stored: Partial<BrowserSessionState> = JSON.parse(raw);
        if (!stored.sessionId || !stored.sessionRef) {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          setIsInitializing(false);
          return;
        }

        // Validate session with the Express server
        const res = await fetch('/api/auth/session', {
          headers: {
            'x-session-id': stored.sessionId
          }
        });

        if (res.ok) {
          const data: SessionValidateResponse = await res.json();
          if (data.valid) {
            setSession({
              sessionId: stored.sessionId,
              sessionRef: data.sessionRef || stored.sessionRef,
              username: data.authenticatedUser || stored.username || 'ghost',
              messageRead: Boolean(stored.messageRead),
              toastShown: true // toast not repeated on page refresh
            });
          } else {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
          }
        } else {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } finally {
        setIsInitializing(false);
      }
    };

    initSession();
  }, []);

  const handleLoginSuccess = (sessionId: string, sessionRef: string, username: string) => {
    const newSession: BrowserSessionState = {
      sessionId,
      sessionRef,
      username,
      messageRead: false,
      toastShown: true
    };

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
    setCurrentTab('overview');
    setSelectedService(null);
    setShowToast(true); // Display arrival notification once per attempt
  };

  const handleLogout = async () => {
    if (session?.sessionId) {
      clearAttackMapState(session.sessionId);
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-id': session.sessionId
          },
          body: JSON.stringify({ sessionId: session.sessionId })
        });
      } catch {
        // Continue clearing client state even if network fails
      }
    }

    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    setCurrentTab('overview');
    setSelectedService(null);
    setShowToast(false);
  };

  const handleMarkAsRead = useCallback(() => {
    if (!session) return;
    if (session.messageRead) return;

    const updatedSession: BrowserSessionState = {
      ...session,
      messageRead: true
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
    setSession(updatedSession);
  }, [session]);

  const handleToastDismiss = () => {
    setShowToast(false);
  };

  const handleViewMessagesFromToast = () => {
    setShowToast(false);
    setCurrentTab('messages');
  };

  if (isInitializing) {
    return (
      <div className="portal-loading-screen" role="status" aria-live="polite">
        <div className="loading-box">
          <div className="spinner"></div>
          <span className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Verifying ORBIT Security Context...
          </span>
        </div>
      </div>
    );
  }

  // Not authenticated: render Login Form
  if (!session) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Authenticated: render Dashboard Shell
  const unreadCount = session.messageRead ? 0 : 1;

  return (
    <div className="dashboard-app-layout">
      {/* Toast Notification (First Arrival Only) */}
      <ToastNotification
        visible={showToast}
        onDismiss={handleToastDismiss}
        onViewMessages={handleViewMessagesFromToast}
      />

      {/* Top Header */}
      <Header username={session.username} onLogout={handleLogout} />

      {/* Main Body with Navigation and Content */}
      <div className="dashboard-body">
        <div className="dashboard-nav-wrapper">
          <Navigation
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            unreadMessagesCount={unreadCount}
          />
        </div>

        <main className="dashboard-main-content">
          {currentTab === 'overview' && (
            <OverviewPage
              services={INITIAL_SERVICES}
              activityItems={RECENT_ACTIVITY_ITEMS}
              onSelectService={(service) => setSelectedService(service)}
            />
          )}

          {currentTab === 'messages' && (
            <FakeMessagesPage
              message={GHOST_MESSAGE}
              isRead={session.messageRead}
              onMarkAsRead={handleMarkAsRead}
            />
          )}

          {currentTab === 'terminal' && (
            <TerminalPage />
          )}

          {currentTab === 'attack-map' && (
            <AttackMapPage sessionId={session.sessionId} />
          )}
        </main>
      </div>

      {/* Service Status Drawer */}
      <ServiceDrawer
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />

      {/* Dashboard Footer */}
      <Footer sessionRef={session.sessionRef} />
    </div>
  );
};

export default App;
