import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProviderDashboardLayout = ({
  title,
  icon,
  children,
  sidebarItems,
  activeTab,
  onTabChange,
  userName,
  userRole,
  logout
}) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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