// D:\hospital-frontend\src\components\HeaderNotificationBell.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import api from '../services/api';

// ============================================
// HEADER NOTIFICATION BELL
// ============================================
// Self-contained badge for patient pages. Polls unread count every 60s
// and on every route change. Click → /notifications.
//
// - Uses the shared api.js axios instance (role-aware token selection)
// - Fails silently (no UI error) if backend unavailable — production-safe
// - Renders nothing for unauthenticated users (safe on public pages)
// ============================================

const HeaderNotificationBell = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [count, setCount] = useState(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    const fetchCount = async () => {
      // Skip if no patient token — the api interceptor handles auth, but
      // we avoid even firing the request on public pages.
      const token = localStorage.getItem('token') || localStorage.getItem('patientToken');
      if (!token) {
        if (!cancelledRef.current) setCount(0);
        return;
      }

      try {
        const res = await api.get('/loan/patient/notifications', {
          params: { count_only: 'true' },
        });
        if (!cancelledRef.current && res.data?.success) {
          setCount(res.data.unread || 0);
        }
      } catch (err) {
        // Silent — never surface to UI. Backend may be cold-starting.
        if (!cancelledRef.current) {
          console.warn('[HeaderNotificationBell] count fetch failed:', err?.message);
        }
      }
    };

    fetchCount();

    // Refetch on every route change (patient navigated somewhere)
    const interval = setInterval(fetchCount, 60000);

    return () => {
      cancelledRef.current = true;
      clearInterval(interval);
    };
  }, [location.pathname]); // route change triggers refetch

  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className || 'p-2 rounded hover:bg-gray-100 relative'}
      aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`}
      title={count > 0 ? `${count} unread notification${count > 1 ? 's' : ''}` : 'Notifications'}
    >
      <FaBell className="text-gray-600" />
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            minWidth: 18,
            height: 18,
            padding: '0 4px',
            borderRadius: 9,
            background: '#dc2626',
            color: '#ffffff',
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            boxShadow: '0 0 0 2px #ffffff',
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

export default HeaderNotificationBell;