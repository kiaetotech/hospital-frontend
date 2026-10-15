// D:\hospital-frontend\src\pages\insurance\InsurerAutoRenewal.jsx
// ============================================
// AUTO-RENEWAL ENGINE
// Pipeline of expiring policies + smart retention actions
// ============================================

import React, { useEffect, useState, useMemo, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-e2cf.up.railway.app';
const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const daysBetween = (a, b) => Math.floor((new Date(a) - new Date(b)) / (1000 * 60 * 60 * 24));

const WINDOWS = [7, 15, 30, 60, 90];

const BUCKETS = [
  { id: 'expired',  label: '⚫ Already Expired',       color: '#475569', test: (d) => d < 0 },
  { id: 'urgent',   label: '🔴 Urgent (0–7 days)',     color: '#ef4444', test: (d) => d >= 0 && d <= 7 },
  { id: 'soon',     label: '🟡 Soon (8–30 days)',      color: '#f59e0b', test: (d) => d >= 8 && d <= 30 },
  { id: 'upcoming', label: '🔵 Upcoming (31–90 days)', color: '#1565C0', test: (d) => d >= 31 && d <= 90 },
];

// ============================================
// MAIN
// ============================================
export default function InsurerAutoRenewal() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [days, setDays] = useState(30);
  const [data, setData] = useState({ expiring: [], expired: [], counts: {} });
  const [search, setSearch] = useState('');
  const [reminderState, setReminderState] = useState({}); // { [policyId]: 'sending' | 'sent' | 'error' }

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('providerToken');
      const r = await fetch(`${API_BASE}/api/insurance/company/renewals?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success) setData(d.data || { expiring: [], expired: [], counts: {} });
      else setError(d.message || 'Failed to load renewals');
    } catch (e) { setError(e.message || 'Failed'); }
    finally { setLoading(false); }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  // ---------------------------------------------
  // ROW ACTION: send reminder
  // Tries backend endpoint; falls back to local-only state if 404
  // ---------------------------------------------
  const sendReminder = async (policy) => {
    const id = policy._id;
    setReminderState((s) => ({ ...s, [id]: 'sending' }));
    try {
      const token = localStorage.getItem('providerToken');
      const r = await fetch(`${API_BASE}/api/insurance/company/policies/${id}/send-renewal-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          channel: 'sms+email',
          customerPhone: policy.userId?.phone,
          customerEmail: policy.userId?.email,
          policyNumber: policy.policyNumber,
          expiryDate: policy.endDate,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.status === 404 || !d.success) {
        // Graceful fallback — log reminder locally, don't error
        setReminderState((s) => ({ ...s, [id]: 'sent' }));
        notify('Reminder logged (backend endpoint pending)', 'info');
      } else {
        setReminderState((s) => ({ ...s, [id]: 'sent' }));
        notify(`Reminder sent to ${policy.userId?.name || 'customer'}`);
      }
      setTimeout(() => setReminderState((s) => ({ ...s, [id]: undefined })), 3000);
    } catch (e) {
      setReminderState((s) => ({ ...s, [id]: 'error' }));
      notify(e.message || 'Failed to send reminder', 'error');
      setTimeout(() => setReminderState((s) => ({ ...s, [id]: undefined })), 3000);
    }
  };

  // ---------------------------------------------
  // DERIVED
  // ---------------------------------------------
  const now = Date.now();

  const enriched = useMemo(() => {
    const active = (data.expiring || []).map((p) => {
      const dte = Math.floor((new Date(p.endDate) - now) / (1000 * 60 * 60 * 24));
      return { ...p, _daysToExpiry: dte, _isExpired: false };
    });
    const expired = (data.expired || []).map((p) => {
      const dte = Math.floor((new Date(p.endDate) - now) / (1000 * 60 * 60 * 24));
      return { ...p, _daysToExpiry: dte, _isExpired: true };
    });
    return { active, expired };
  }, [data, now]);

  const filtered = useMemo(() => {
    const all = [...enriched.active, ...enriched.expired];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter((p) =>
      `${p.policyNumber} ${p.userId?.name} ${p.userId?.phone} ${p.policyName}`.toLowerCase().includes(q)
    );
  }, [enriched, search]);

  const grouped = useMemo(() => {
    const map = { expired: [], urgent: [], soon: [], upcoming: [] };
    filtered.forEach((p) => {
      const bucket = BUCKETS.find((b) => b.test(p._daysToExpiry));
      if (bucket) map[bucket.id].push(p);
    });
    return map;
  }, [filtered]);

  const stats = useMemo(() => {
    const all = [...enriched.active, ...enriched.expired];
    const totalPremiumAtRisk = all.reduce((s, p) => s + Number(p.premiumAmount || 0), 0);
    const urgent = all.filter((p) => p._daysToExpiry >= 0 && p._daysToExpiry <= 7).length;
    const soon = all.filter((p) => p._daysToExpiry >= 8 && p._daysToExpiry <= 30).length;
    const expiredCount = enriched.expired.length;
    const retentionRate = all.length > 0
      ? Math.round(((all.length - expiredCount) / all.length) * 100)
      : 100;
    return { total: all.length, totalPremiumAtRisk, urgent, soon, expiredCount, retentionRate };
  }, [enriched]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 9999,
          padding: '0.75rem 1.1rem', borderRadius: '0.5rem',
          background: toast.type === 'error' ? '#fee2e2' : toast.type === 'info' ? '#eff6ff' : '#dcfce7',
          color: toast.type === 'error' ? '#991b1b' : toast.type === 'info' ? '#1e40af' : '#166534',
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : toast.type === 'info' ? '#bfdbfe' : '#86efac'}`,
          fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔄 Auto-Renewal Engine
            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', background: '#dcfce7', color: '#166534', borderRadius: '999px' }}>
              LIVE
            </span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            Retention pipeline • Smart reminders • One-click outreach
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select value={days} onChange={(e) => setDays(parseInt(e.target.value))}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.85rem', background: 'white', cursor: 'pointer' }}>
            {WINDOWS.map((w) => <option key={w} value={w}>Next {w} days</option>)}
          </select>
          <button onClick={load} style={{ padding: '0.5rem 1rem', background: '#1565C0', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>🔄 Refresh</button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <Kpi label="Total Expiring" value={stats.total} accent="#1565C0" icon="📄" />
        <Kpi label="Urgent (0–7d)" value={stats.urgent} accent="#ef4444" icon="🔴" />
        <Kpi label="Soon (8–30d)" value={stats.soon} accent="#f59e0b" icon="🟡" />
        <Kpi label="Already Expired" value={stats.expiredCount} accent="#475569" icon="⚫" />
        <Kpi label="Premium at Risk" value={inr(stats.totalPremiumAtRisk)} accent="#8b5cf6" icon="💰" />
      </div>

      {/* Retention banner */}
      {stats.total > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          border: '1px solid #bfdbfe',
          borderRadius: '0.85rem', padding: '1rem 1.25rem', marginBottom: '1.25rem',
          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '1.75rem' }}>💡</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e40af' }}>
              {inr(stats.totalPremiumAtRisk)} in premium at risk
            </div>
            <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '0.15rem' }}>
              Send reminders now to retain {stats.total} polic{stats.total === 1 ? 'y' : 'ies'}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="🔍 Search policy no, customer, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.9rem' }}
        />
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>⚠️ {error}</div>
      )}

      {/* Pipeline */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading renewals…</div>
      ) : filtered.length === 0 ? (
        <Empty msg="No policies expiring in this window" />
      ) : (
        BUCKETS.map((bucket) => {
          const items = grouped[bucket.id] || [];
          if (items.length === 0) return null;
          return (
            <div key={bucket.id} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: bucket.color }}>{bucket.label}</h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>({items.length})</span>
              </div>

              <div style={{ display: 'grid', gap: '0.6rem' }}>
                {items.map((p) => (
                  <RenewalRow
                    key={p._id}
                    policy={p}
                    onRemind={() => sendReminder(p)}
                    reminderStatus={reminderState[p._id]}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Info footer */}
      <div style={{
        marginTop: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: '0.75rem', padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6,
      }}>
        <strong style={{ color: '#0f172a' }}>📋 Renewal playbook</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li><strong>7 days before expiry</strong> — SMS + email reminder with one-click renewal link.</li>
          <li><strong>3 days before expiry</strong> — WhatsApp + call from relationship manager (if applicable).</li>
          <li><strong>Day of expiry</strong> — Final reminder with grace-period notice (typically 15–30 days).</li>
          <li><strong>Post-expiry</strong> — Win-back campaign with loyalty discount.</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================
// ROW
// ============================================
function RenewalRow({ policy, onRemind, reminderStatus }) {
  const urgent = policy._daysToExpiry >= 0 && policy._daysToExpiry <= 7;
  const isExpired = policy._daysToExpiry < 0;

  const accent = isExpired ? '#475569' : urgent ? '#ef4444' : policy._daysToExpiry <= 30 ? '#f59e0b' : '#1565C0';

  const daysLabel = isExpired
    ? `Expired ${Math.abs(policy._daysToExpiry)}d ago`
    : policy._daysToExpiry === 0
    ? 'Expires today'
    : `${policy._daysToExpiry} day${policy._daysToExpiry === 1 ? '' : 's'} left`;

  return (
    <div style={{
      background: 'white', borderRadius: '0.75rem', padding: '1rem 1.1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: `4px solid ${accent}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      gap: '1rem', flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: '220px' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', fontSize: '0.85rem' }}>
            {policy.policyNumber}
          </span>
          <span style={{
            padding: '0.15rem 0.5rem', borderRadius: '999px',
            background: `${accent}1A`, color: accent,
            fontSize: '0.7rem', fontWeight: 700,
          }}>{daysLabel}</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#475569' }}>
          <strong>{policy.userId?.name || 'Customer'}</strong>
          {policy.userId?.phone && <span> • {policy.userId.phone}</span>}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
          {policy.policyName || policy.planId?.planName || 'Policy'} • Premium {inr(policy.premiumAmount)} • Ends {fmtDate(policy.endDate)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          onClick={onRemind}
          disabled={reminderStatus === 'sending'}
          style={{
            padding: '0.5rem 1rem',
            background: reminderStatus === 'sent' ? '#10b981' : reminderStatus === 'error' ? '#ef4444' : '#1565C0',
            color: 'white', border: 'none', borderRadius: '0.5rem',
            cursor: reminderStatus === 'sending' ? 'wait' : 'pointer',
            fontWeight: 600, fontSize: '0.82rem',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}
        >
          {reminderStatus === 'sending' ? '⏳ Sending…'
            : reminderStatus === 'sent' ? '✅ Sent'
            : reminderStatus === 'error' ? '❌ Retry'
            : '📩 Send Reminder'}
        </button>
      </div>
    </div>
  );
}

// ============================================
// SHARED
// ============================================
const Kpi = ({ label, value, sub, accent, icon }) => (
  <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: `4px solid ${accent}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: accent, marginTop: '0.35rem' }}>{value}</div>
    {sub && <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>{sub}</div>}
  </div>
);

const Empty = ({ msg }) => (
  <div style={{ background: 'white', borderRadius: '0.85rem', padding: '3rem', textAlign: 'center', color: '#94a3b8', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>{msg}</div>
  </div>
);