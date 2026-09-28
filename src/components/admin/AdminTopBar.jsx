// src/components/admin/AdminTopBar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCog, FaUser, FaSearch, FaSignOutAlt } from 'react-icons/fa';

const AdminTopBar = ({ adminData }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const displayName =
    adminData?.name || adminData?.email?.split('@')[0] || 'Admin';

  return (
    <header style={{
      backgroundColor: '#fff',
      borderBottom: '1px solid #e5e9f2',
      padding: '14px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 20,
      flexWrap: 'wrap',
    }}>
      {/* TITLE */}
      <div style={{ minWidth: 200 }}>
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.2 }}>
          HOSPITALHUB ADMIN
        </div>
        <div style={{ fontSize: 11.5, color: '#687386', marginTop: 2 }}>
          Command Center
        </div>
      </div>

      {/* SEARCH */}
      <form
        onSubmit={handleSearch}
        style={{
          flex: 1,
          minWidth: 240,
          maxWidth: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          border: '1px solid #dce2ed',
          borderRadius: 10,
          padding: '8px 12px',
          backgroundColor: '#f8fafc',
        }}
      >
        <FaSearch size={13} color="#94a3b8" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search patients / providers / bookings / transactions..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 13,
          }}
        />
      </form>

      {/* STATUS INDICATORS */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: '#19a974',
            boxShadow: '0 0 0 3px rgba(25,169,116,0.2)',
          }} />
          <span style={{ fontWeight: 700, color: '#19a974' }}>AI LIVE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: '#19a974',
            boxShadow: '0 0 0 3px rgba(25,169,116,0.2)',
          }} />
          <span style={{ fontWeight: 700, color: '#19a974' }}>HEALTHY</span>
        </div>
      </div>

      {/* ICONS */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto', position: 'relative' }}>
        <button
          onClick={() => setShowNotifications((v) => !v)}
          style={iconBtnStyle}
          title="Notifications"
        >
          <FaBell size={14} />
        </button>
        <button
          onClick={() => navigate('/admin/settings')}
          style={iconBtnStyle}
          title="Settings"
        >
          <FaCog size={14} />
        </button>
        <button
          onClick={() => setShowUserMenu((v) => !v)}
          style={{
            ...iconBtnStyle,
            backgroundColor: '#eef2f7',
            padding: '6px 10px',
            gap: 6,
            display: 'flex',
            alignItems: 'center',
          }}
          title={displayName}
        >
          <FaUser size={12} />
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
            {displayName}
          </span>
        </button>

        {/* NOTIFICATIONS DROPDOWN */}
        {showNotifications && (
          <div style={dropdownStyle}>
            <div style={{ padding: '10px 14px', fontWeight: 700, borderBottom: '1px solid #e5e9f2', fontSize: 12 }}>
              🔔 Notifications
            </div>
            <div style={{ padding: '16px 14px', color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>
              No new notifications
            </div>
          </div>
        )}

        {/* USER MENU */}
        {showUserMenu && (
          <div style={{ ...dropdownStyle, minWidth: 200 }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #e5e9f2' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{displayName}</div>
              <div style={{ fontSize: 11, color: '#687386', marginTop: 2 }}>
                {adminData?.email || 'admin@hospitalhub'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                fontSize: 12.5,
                color: '#dc2626',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 600,
              }}
            >
              <FaSignOutAlt size={12} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

const iconBtnStyle = {
  width: 34,
  height: 34,
  borderRadius: 8,
  border: '1px solid #e5e9f2',
  background: '#fff',
  color: '#475569',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const dropdownStyle = {
  position: 'absolute',
  top: 44,
  right: 0,
  backgroundColor: '#fff',
  border: '1px solid #e5e9f2',
  borderRadius: 10,
  boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
  minWidth: 240,
  zIndex: 100,
};

export default AdminTopBar;