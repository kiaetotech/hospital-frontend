// D:\hospital-frontend\src\components\NotificationCenter.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBell, FaExclamationCircle, FaCheck } from 'react-icons/fa';
import api from '../services/api';

// ============================================
// NOTIFICATION CENTER (combined banner + full page)
// ============================================
// One component, two variants:
//
//   <NotificationCenter variant="banner" />
//     → compact red banner at top of patient pages
//     → shows only highest-priority unread action_required notification
//     → hidden entirely if nothing needs attention
//     → renders nothing on non-patient pages (safe to mount in layout)
//
//   <NotificationCenter variant="full" />
//     → full-page list at /notifications
//     → shows all notifications, filters (all / unread / action_required)
//     → mark-read buttons, action CTAs, expiry countdowns
//
// Shared:
//   - Single API client (api.js — role-aware auth)
//   - Silent fail on network errors (never blocks the page)
//   - Refetch on route change + every 60s
//   - React hooks only — no new dependencies
// ============================================

const NotificationCenter = ({ variant = 'banner' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(variant === 'full');
  const [filter, setFilter] = useState('all');
  const [counts, setCounts] = useState({ unread: 0, actionRequired: 0 });
  const cancelledRef = useRef(false);

  // ─── Data fetching ───
  useEffect(() => {
    cancelledRef.current = false;

    const fetchData = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('patientToken');
      if (!token) {
        if (!cancelledRef.current) {
          setItems([]);
          setLoading(false);
        }
        return;
      }

      try {
        if (variant === 'banner') {
          // Banner mode: only unread action_required (max 3)
          const res = await api.get('/loan/patient/notifications', {
            params: { unread: 'true', priority: 'action_required', limit: 3 },
          });
          if (!cancelledRef.current && res.data?.success) {
            setItems(res.data.notifications || []);
          }
        } else {
          // Full mode: get counts + filtered list
          const [countRes, listRes] = await Promise.all([
            api.get('/loan/patient/notifications', { params: { count_only: 'true' } }),
            api.get('/loan/patient/notifications', {
              params: {
                limit: 100,
                ...(filter === 'unread' ? { unread: 'true' } : {}),
                ...(filter === 'action_required' ? { priority: 'action_required' } : {}),
              },
            }),
          ]);

          if (!cancelledRef.current) {
            if (countRes.data?.success) {
              setCounts({
                unread: countRes.data.unread || 0,
                actionRequired: countRes.data.actionRequired || 0,
              });
            }
            if (listRes.data?.success) {
              setItems(listRes.data.notifications || []);
            }
            setLoading(false);
          }
        }
      } catch (err) {
        if (!cancelledRef.current) {
          setItems([]);
          setLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);

    return () => {
      cancelledRef.current = true;
      clearInterval(interval);
    };
  }, [location.pathname, filter, variant]);

  // ─── Actions ───
    const handleAction = (item) => {
    if (item.actionUrl) {
      // Use window.location.href to guarantee hash fragment is preserved.
      // React Router's navigate() can strip hash in some configurations.
      // For deep-links like /financing#offer/APP_XXX, full URL navigation is safer.
      const url = item.actionUrl;
      if (url.includes('#')) {
        // Force full-page navigation for hash links — ensures hash reaches target page
        window.location.href = url;
      } else {
        navigate(url);
      }
    } else {
      navigate('/notifications');
    }
  };

  const markRead = async (notificationId) => {
    try {
      await api.patch(`/loan/patient/notifications/${notificationId}/read`);
      setItems((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId
            ? { ...n, readAt: new Date().toISOString(), status: 'read' }
            : n
        )
      );
      setCounts((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (err) {
      console.warn('[NotificationCenter] markRead failed:', err?.message);
    }
  };

  // ═══════════════════════════════════════════════════
  // RENDER — BANNER MODE
  // ═══════════════════════════════════════════════════
  if (variant === 'banner') {
    if (items.length === 0) return null;

    const top = items[0];
    const extra = items.length > 1 ? ` (+${items.length - 1} more)` : '';

    return (
      <div
        style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderLeft: '4px solid #dc2626',
          borderRadius: 8,
          padding: '12px 16px',
          margin: '12px auto',
          maxWidth: 900,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
        role="alert"
      >
        <FaExclamationCircle
          style={{ color: '#dc2626', fontSize: 22, flexShrink: 0 }}
          aria-hidden="true"
        />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#92400e' }}>
            {top.subject}
            <span style={{ fontWeight: 400, fontSize: 12, color: '#78350f' }}>{extra}</span>
          </div>
          <div style={{ fontSize: 13, color: '#78350f', marginTop: 2 }}>{top.message}</div>
          {top.expiresAt && (
            <div style={{ fontSize: 11, color: '#92400e', marginTop: 4, fontWeight: 600 }}>
              ⏰ Expires{' '}
              {new Date(top.expiresAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              style={{
                padding: '8px 14px',
                background: 'transparent',
                color: '#92400e',
                border: '1px solid #92400e',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12,
                whiteSpace: 'nowrap',
              }}
            >
              View all
            </button>
          )}
          <button
            type="button"
            onClick={() => handleAction(top)}
            style={{
              padding: '8px 18px',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
          >
            {top.actionLabel || 'View'} →
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // RENDER — FULL MODE
  // ═══════════════════════════════════════════════════
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h1 style={{ fontSize: 24, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FaBell style={{ color: '#059669' }} /> Notifications
          {counts.unread > 0 && (
            <span
              style={{
                background: '#dc2626',
                color: 'white',
                borderRadius: 12,
                padding: '2px 10px',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {counts.unread} unread
            </span>
          )}
        </h1>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            color: '#059669',
            border: '1px solid #059669',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          ← Dashboard
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: `Unread (${counts.unread})` },
          { key: 'action_required', label: `Action Required (${counts.actionRequired})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              cursor: 'pointer',
              border: filter === tab.key ? 'none' : '1px solid #d1d5db',
              background: filter === tab.key ? '#059669' : 'transparent',
              color: filter === tab.key ? 'white' : '#374151',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Loading…</p>
      ) : items.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 60,
            background: '#f9fafb',
            borderRadius: 12,
            border: '1px dashed #d1d5db',
          }}
        >
          <FaBell style={{ fontSize: 48, color: '#d1d5db', marginBottom: 16 }} />
          <p style={{ color: '#6b7280', margin: 0, fontSize: 15 }}>
            No notifications{filter !== 'all' ? ` for "${filter.replace('_', ' ')}"` : ''}.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((n) => {
            const isActionRequired = n.priority === 'action_required';
            const isUnread = !n.readAt;
            return (
              <div
                key={n.notificationId}
                style={{
                  background: isUnread ? '#f0f9ff' : 'white',
                  border: '1px solid #e5e7eb',
                  borderLeft: `4px solid ${
                    isActionRequired ? '#dc2626' : isUnread ? '#3b82f6' : '#d1d5db'
                  }`,
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 15, color: '#111827' }}>{n.subject}</strong>
                      {isActionRequired && (
                        <span
                          style={{
                            padding: '2px 8px',
                            background: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: 10,
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          ACTION REQUIRED
                        </span>
                      )}
                      {isUnread && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#3b82f6',
                            display: 'inline-block',
                          }}
                          title="Unread"
                        />
                      )}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, color: '#4b5563' }}>{n.message}</div>
                    {n.applicationId && (
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 11,
                          color: '#94a3b8',
                          fontFamily: 'monospace',
                        }}
                      >
                        {n.applicationId}
                      </div>
                    )}
                    <div style={{ marginTop: 6, fontSize: 11, color: '#94a3b8' }}>
                      {new Date(n.createdAt).toLocaleString()}
                      {n.channel === 'email' && n.status === 'failed' && (
                        <span style={{ marginLeft: 8, color: '#dc2626' }}>⚠ email delivery failed</span>
                      )}
                      {n.expiresAt && (
                        <span style={{ marginLeft: 8, color: '#f59e0b' }}>
                          expires {new Date(n.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      flexShrink: 0,
                    }}
                  >
                    {n.actionUrl && (
                      <button
                        onClick={() => handleAction(n)}
                        style={{
                          padding: '6px 14px',
                          background: '#059669',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {n.actionLabel || 'Open'} →
                      </button>
                    )}
                    {isUnread && (
                      <button
                        onClick={() => markRead(n.notificationId)}
                        style={{
                          padding: '6px 14px',
                          background: 'transparent',
                          color: '#6b7280',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          justifyContent: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <FaCheck size={10} /> Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;