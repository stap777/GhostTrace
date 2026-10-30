import React from 'react';

export type ActiveTab = 'overview' | 'messages' | 'terminal' | 'attack-map';

interface NavigationProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  unreadMessagesCount: number;
}

interface NavItemConfig {
  id: string;
  label: string;
  isAvailable: boolean;
  tabKey?: ActiveTab;
  badge?: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  unreadMessagesCount
}) => {
  const navItems: NavItemConfig[] = [
    {
      id: 'overview',
      label: 'Overview',
      isAvailable: true,
      tabKey: 'overview'
    },
    {
      id: 'services',
      label: 'Services',
      isAvailable: false
    },
    {
      id: 'messages',
      label: 'Fake Messages',
      isAvailable: true,
      tabKey: 'messages',
      badge: unreadMessagesCount > 0 ? (
        <span className="unread-counter-badge" aria-label={`${unreadMessagesCount} unread message`}>
          {unreadMessagesCount}
        </span>
      ) : null
    },
    {
      id: 'terminal',
      label: 'Terminal',
      isAvailable: true,
      tabKey: 'terminal'
    },
    {
      id: 'attack-map',
      label: 'Attack Map',
      isAvailable: true,
      tabKey: 'attack-map'
    },
    {
      id: 'system-logs',
      label: 'System Logs',
      isAvailable: false
    },
    {
      id: 'recovery',
      label: 'Recovery',
      isAvailable: false
    }
  ];

  return (
    <nav className="dashboard-nav" aria-label="Campus administration navigation">
      <ul className="nav-list">
        {navItems.map((item) => {
          if (item.isAvailable && item.tabKey) {
            const isActive = currentTab === item.tabKey;
            return (
              <li key={item.id} className="nav-item">
                <button
                  type="button"
                  id={`nav-${item.id}`}
                  className={`nav-button ${isActive ? 'active' : ''}`}
                  onClick={() => onTabChange(item.tabKey!)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="nav-label">{item.label}</span>
                  {item.badge}
                </button>
              </li>
            );
          }

          // Disabled Coming Soon navigation item
          return (
            <li key={item.id} className="nav-item">
              <div
                className="nav-button nav-button-disabled"
                title={`${item.label} module will be available in future phases`}
                aria-disabled="true"
              >
                <span className="nav-label">{item.label}</span>
                <span className="coming-soon-pill">Coming soon</span>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
