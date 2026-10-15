import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ProviderDashboardLayout
 * -----------------------
 * Backwards-compatible dashboard shell used by ALL provider portals.
 *
 * Existing props (unchanged):
 *   title, icon, children, sidebarItems, activeTab, onTabChange,
 *   userName, userRole, logout
 *
 * NEW optional props (opt-in — old usage behaves identically):
 *   - headerActions: ReactNode            -> slot next to Refresh button
 *   - statusPills: Array<{label,color}>   -> pills under title (like Ayurveda)
 *   - notifications: Array<{id,text,time,read}> -> bell + dropdown
 *   - onNotificationsRead: () => void     -> fires when user opens bell
 */
const ProviderDashboardLayout = ({
  title,
  icon,
  children,
  sidebarItems,
  activeTab,
  onTabChange,
  userName,
  userRole,
  logout,

  // NEW (all optional)
  headerActions,
  statusPills,
  notifications,
  onNotificationsRead,
}) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleNotifications = () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next && onNotificationsRead) onNotificationsRead();
  };

  const colorMap = {
    green: { bg: '#dcfce7', color: '#166534' },
    blue: { bg: '#dbeafe', color: '#1e40af' },
    grey: { bg: '#e5e7eb', color: '#4b5563' },
    amber: { bg: '#fef3c7', color: '#92400e' },
    red: { bg: '#fee2e2', color: '#b91c1c' },
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '80px',
        backgroundColor: 'white',
        boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
        transition: 'width 0.3s',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer'
        }}
        onClick={() => navigate('/')}>
          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
          {sidebarOpen && <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{title}</span>}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
          {sidebarItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                if (item.action) item.action();
              }}
              style={{
                padding: '0.75rem 1.5rem',
                margin: '0.25rem 0.5rem',
                borderRadius: '0.5rem',
                backgroundColor: activeTab === item.id ? '#eff6ff' : 'transparent',
                color: activeTab === item.id ? '#2563eb' : '#4b5563',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s',
                fontWeight: activeTab === item.id ? 'bold' : 'normal'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </div>
          ))}
        </nav>

        {/* User Info */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {userName?.charAt(0) || 'U'}
          </div>
          {sidebarOpen && (
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{userName || 'User'}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{userRole || 'Provider'}</div>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={logout}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#ef4444',
                fontSize: '1.2rem'
              }}
            >
              🚪
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: sidebarOpen ? '280px' : '80px',
        flex: 1,
        padding: '2rem',
        transition: 'margin-left 0.3s'
      }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
              {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            {/* Status pills (Ayurveda-style) */}
            {statusPills && statusPills.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {statusPills.map((pill, i) => {
                  const c = colorMap[pill.color] || colorMap.grey;
                  return (
                    <span key={i} style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: c.bg,
                      color: c.color,
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      {pill.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Header actions slot (auto-refresh, export, etc.) */}
            {headerActions}

            {/* Notifications bell */}
            {notifications && (
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  onClick={toggleNotifications}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    position: 'relative',
                    fontSize: '1.1rem',
                  }}
                  title="Notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      minWidth: '18px',
                      height: '18px',
                      padding: '0 4px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      borderRadius: '999px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                    zIndex: 200,
                  }}>
                    <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '0.9rem' }}>
                      Notifications
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid #f3f4f6',
                            background: n.read ? 'white' : '#eff6ff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <div style={{ color: '#1e293b' }}>{n.text}</div>
                          {n.time && (
                            <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                              {n.time}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: '0.5rem',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default ProviderDashboardLayout;