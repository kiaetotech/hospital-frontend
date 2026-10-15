// D:\hospital-frontend\src\pages\insurance\InsurerAdvertising.jsx
// ============================================
// INSURER ADVERTISING TAB
// Wallet top-up • Campaign CRUD • Performance analytics
// Uses providerApi.insuranceApi (auth via providerToken)
// ============================================

import React, { useEffect, useState, useMemo } from 'react';
import { insuranceApi } from '../../services/providerApi';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const PLACEMENTS = [
  { value: 'homepage_banner',  label: '🏠 Homepage Banner' },
  { value: 'search_top',       label: '🔍 Search Top' },
  { value: 'plan_sidebar',     label: '📋 Plan Sidebar' },
  { value: 'dashboard_widget', label: '📊 Dashboard Widget' },
  { value: 'category_page',    label: '📂 Category Page' },
];

// ============================================
// MAIN
// ============================================
export default function InsurerAdvertising() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const [wallet, setWallet] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showTopup, setShowTopup] = useState(false);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ============================================
  // LOAD
  // ============================================
  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [wRes, cRes, aRes] = await Promise.all([
        insuranceApi.getAdWallet().catch(() => ({ data: { data: null } })),
        insuranceApi.getAdCampaigns({ limit: 100 }).catch(() => ({ data: { data: [] } })),
        insuranceApi.getAdAnalytics({}).catch(() => ({ data: { data: null } })),
      ]);
      setWallet(wRes.data?.data || null);
      setCampaigns(cRes.data?.data || []);
      setAnalytics(aRes.data?.data || null);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load advertising data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // ============================================
  // ACTIONS
  // ============================================
  const handleTopup = async (amount, method) => {
    try {
      await insuranceApi.topupAdWallet({ amount, method });
      notify(`Wallet topped up with ${inr(amount)}`);
      setShowTopup(false);
      loadAll();
    } catch (e) {
      notify(e.response?.data?.message || 'Top-up failed', 'error');
    }
  };

  const handleCreate = async (payload) => {
    try {
      await insuranceApi.createAdCampaign(payload);
      notify('Campaign created — awaiting approval');
      setShowCreate(false);
      loadAll();
    } catch (e) {
      notify(e.response?.data?.message || 'Failed to create campaign', 'error');
    }
  };

  const handlePause = async (id) => {
    if (!window.confirm('Pause this campaign?')) return;
    try {
      await insuranceApi.pauseAdCampaign(id);
      notify('Campaign paused');
      loadAll();
    } catch (e) { notify(e.response?.data?.message || 'Failed', 'error'); }
  };

  const handleResume = async (id) => {
    try {
      await insuranceApi.resumeAdCampaign(id);
      notify('Campaign resumed');
      loadAll();
    } catch (e) { notify(e.response?.data?.message || 'Failed', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign permanently?')) return;
    try {
      await insuranceApi.deleteAdCampaign(id);
      notify('Campaign deleted');
      loadAll();
    } catch (e) { notify(e.response?.data?.message || 'Failed', 'error'); }
  };

  // ============================================
  // DERIVED
  // ============================================
  const stats = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter(c => c.status === 'active').length;
    const pending = campaigns.filter(c => c.status === 'pending_approval' || c.status === 'draft').length;
    const spent = campaigns.reduce((s, c) => s + (c.metrics?.spend || 0), 0);
    const impressions = campaigns.reduce((s, c) => s + (c.metrics?.impressions || 0), 0);
    const clicks = campaigns.reduce((s, c) => s + (c.metrics?.clicks || 0), 0);
    const conversions = campaigns.reduce((s, c) => s + (c.metrics?.conversions || 0), 0);
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
    return { total, active, pending, spent, impressions, clicks, conversions, ctr };
  }, [campaigns]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 9999,
          padding: '0.75rem 1.1rem', borderRadius: '0.5rem',
          background: toast.type === 'error' ? '#fee2e2' : '#dcfce7',
          color: toast.type === 'error' ? '#991b1b' : '#166534',
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
          fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>📢 Advertising</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            Promote your plans on the marketplace and reach more customers
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowTopup(true)}
            style={{ padding: '0.55rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
          >💳 Top Up Wallet</button>
          <button
            onClick={() => setShowCreate(true)}
            style={{ padding: '0.55rem 1rem', background: '#1565C0', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
          >➕ New Campaign</button>
        </div>
      </div>

      {/* Wallet + KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <Kpi label="Wallet Balance" value={inr(wallet?.balance)} accent="#10b981" icon="💳" sub={`Updated ${fmtDate(wallet?.updatedAt)}`} />
        <Kpi label="Active Campaigns" value={stats.active} accent="#1565C0" icon="▶️" sub={`${stats.pending} pending approval`} />
        <Kpi label="Total Spent" value={inr(stats.spent)} accent="#8b5cf6" icon="💸" sub={`${stats.total} campaigns total`} />
        <Kpi label="Impressions" value={stats.impressions.toLocaleString('en-IN')} accent="#06b6d4" icon="👁️" sub={`${stats.clicks.toLocaleString('en-IN')} clicks`} />
        <Kpi label="CTR" value={`${stats.ctr}%`} accent="#f59e0b" icon="📈" sub={`${stats.conversions} conversions`} />
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Campaigns Table */}
      <div style={{ background: 'white', borderRadius: '0.85rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Your Campaigns ({campaigns.length})</h3>
          <button onClick={loadAll} style={{ padding: '0.35rem 0.75rem', background: '#f1f5f9', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>🔄 Refresh</button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading campaigns…</div>
        ) : campaigns.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📢</div>
            <div style={{ fontSize: '0.95rem', marginBottom: '0.25rem', fontWeight: 600, color: '#475569' }}>No campaigns yet</div>
            <div style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>Create your first campaign to start advertising</div>
            <button
              onClick={() => setShowCreate(true)}
              style={{ padding: '0.55rem 1.25rem', background: '#1565C0', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
            >➕ Create Campaign</button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr>
                  <Th>Campaign</Th>
                  <Th>Placement</Th>
                  <Th align="right">Budget</Th>
                  <Th align="right">Spent</Th>
                  <Th align="right">Impressions</Th>
                  <Th align="right">Clicks</Th>
                  <Th align="right">CTR</Th>
                  <Th>Status</Th>
                  <Th align="center">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const impressions = c.metrics?.impressions || 0;
                  const clicks = c.metrics?.clicks || 0;
                  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
                  return (
                    <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <Td>
                        <div style={{ fontWeight: 700 }}>{c.name || 'Untitled'}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Created {fmtDate(c.createdAt)}</div>
                      </Td>
                      <Td>
                        <span style={{ padding: '0.15rem 0.5rem', background: '#eff6ff', color: '#1e40af', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600 }}>
                          {PLACEMENTS.find(p => p.value === c.placement)?.label || c.placement || '—'}
                        </span>
                      </Td>
                      <Td align="right">{inr(c.budget?.total)}</Td>
                      <Td align="right">{inr(c.metrics?.spend)}</Td>
                      <Td align="right">{impressions.toLocaleString('en-IN')}</Td>
                      <Td align="right">{clicks.toLocaleString('en-IN')}</Td>
                      <Td align="right"><strong>{ctr}%</strong></Td>
                      <Td><Pill status={c.status} /></Td>
                      <Td align="center">
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                          {c.status === 'active' && (
                            <IconBtn title="Pause" onClick={() => handlePause(c._id)} color="#f59e0b">⏸</IconBtn>
                          )}
                          {c.status === 'paused' && (
                            <IconBtn title="Resume" onClick={() => handleResume(c._id)} color="#10b981">▶️</IconBtn>
                          )}
                          <IconBtn title="Delete" onClick={() => handleDelete(c._id)} color="#ef4444">🗑</IconBtn>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analytics Section (if returned from backend) */}
      {analytics && (
        <div style={{ marginTop: '1.25rem', background: 'white', borderRadius: '0.85rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>📊 Performance Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            <MiniStat label="Total Impressions" value={(analytics.impressions || 0).toLocaleString('en-IN')} />
            <MiniStat label="Total Clicks" value={(analytics.clicks || 0).toLocaleString('en-IN')} />
            <MiniStat label="Total Conversions" value={(analytics.conversions || 0).toLocaleString('en-IN')} />
            <MiniStat label="Avg CPC" value={analytics.cpc ? inr(analytics.cpc) : '—'} />
            <MiniStat label="Total Spend" value={inr(analytics.spend)} />
            <MiniStat label="ROI" value={analytics.roi ? `${analytics.roi}%` : '—'} />
          </div>
        </div>
      )}

      {/* Info footer */}
      <div style={{
        marginTop: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: '0.75rem', padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6,
      }}>
        <strong style={{ color: '#0f172a' }}>📌 How it works</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>Top up your wallet → funds are used to pay for campaign impressions.</li>
          <li>Create a campaign → choose placement, budget, and duration.</li>
          <li>Admin reviews → approve or reject within 24 hours.</li>
          <li>Live campaigns → metrics update in real-time as customers view/click.</li>
          <li>Pause anytime → budget stops being consumed.</li>
        </ul>
      </div>

      {/* MODALS */}
      {showTopup && (
        <TopupModal
          onClose={() => setShowTopup(false)}
          onSubmit={handleTopup}
        />
      )}

      {showCreate && (
        <CreateCampaignModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
          walletBalance={wallet?.balance || 0}
        />
      )}
    </div>
  );
}

// ============================================
// SHARED UI
// ============================================
const Kpi = ({ label, value, sub, accent, icon }) => (
  <div style={{
    background: 'white', borderRadius: '0.75rem', padding: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: `4px solid ${accent}`,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: accent, marginTop: '0.35rem' }}>{value}</div>
    {sub && <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>{sub}</div>}
  </div>
);

const MiniStat = ({ label, value }) => (
  <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.75rem' }}>
    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{value}</div>
  </div>
);

const Th = ({ children, align = 'left' }) => (
  <th style={{
    padding: '0.7rem 0.9rem', textAlign: align,
    fontSize: '0.7rem', fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.04em',
    background: '#f8fafc', borderBottom: '2px solid #e2e8f0',
  }}>{children}</th>
);

const Td = ({ children, align = 'left' }) => (
  <td style={{ padding: '0.7rem 0.9rem', textAlign: align, fontSize: '0.85rem', color: '#1e293b', verticalAlign: 'middle' }}>
    {children}
  </td>
);

const IconBtn = ({ children, onClick, title, color = '#475569' }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      padding: '0.3rem 0.5rem', background: `${color}1A`, color: color,
      border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.85rem',
    }}
  >{children}</button>
);

const Pill = ({ status }) => {
  const map = {
    active:            { bg: '#dcfce7', color: '#166534' },
    paused:            { bg: '#fef3c7', color: '#92400e' },
    pending_approval:  { bg: '#dbeafe', color: '#1e40af' },
    draft:             { bg: '#f1f5f9', color: '#475569' },
    rejected:          { bg: '#fee2e2', color: '#991b1b' },
    completed:         { bg: '#dcfce7', color: '#166534' },
    exhausted:         { bg: '#f1f5f9', color: '#475569' },
  };
  const c = map[status] || map.draft;
  return (
    <span style={{
      padding: '0.2rem 0.55rem', borderRadius: '999px',
      fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.03em',
      background: c.bg, color: c.color, textTransform: 'uppercase',
    }}>{String(status || '').replace(/_/g, ' ')}</span>
  );
};

// ============================================
// TOPUP MODAL
// ============================================
function TopupModal({ onClose, onSubmit }) {
  const [amount, setAmount] = useState(5000);
  const [submitting, setSubmitting] = useState(false);

  const presets = [1000, 5000, 10000, 25000, 50000];

  const submit = async () => {
    if (!amount || amount < 500) return;
    setSubmitting(true);
    await onSubmit(Number(amount), 'razorpay');
    setSubmitting(false);
  };

  return (
    <ModalShell onClose={onClose} title="💳 Top Up Ad Wallet">
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>Amount (₹)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={500}
          step={500}
          style={{
            width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #e2e8f0',
            borderRadius: '0.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => setAmount(p)}
            style={{
              padding: '0.4rem 0.75rem',
              background: Number(amount) === p ? '#1565C0' : '#f1f5f9',
              color: Number(amount) === p ? 'white' : '#475569',
              border: 'none', borderRadius: '999px',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            }}
          >{inr(p)}</button>
        ))}
      </div>

      <div style={{
        padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem',
        fontSize: '0.8rem', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.6,
      }}>
        💡 Funds are used to pay for campaign impressions. Minimum top-up: ₹500.
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{ padding: '0.55rem 1rem', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
        >Cancel</button>
        <button
          onClick={submit}
          disabled={submitting || !amount || amount < 500}
          style={{
            padding: '0.55rem 1.25rem',
            background: submitting || !amount || amount < 500 ? '#94a3b8' : '#10b981',
            color: 'white', border: 'none', borderRadius: '0.5rem',
            cursor: submitting || !amount || amount < 500 ? 'not-allowed' : 'pointer',
            fontWeight: 700, fontSize: '0.85rem',
          }}
        >{submitting ? 'Processing…' : `Pay ${inr(amount)}`}</button>
      </div>
    </ModalShell>
  );
}

// ============================================
// CREATE CAMPAIGN MODAL
// ============================================
function CreateCampaignModal({ onClose, onSubmit, walletBalance }) {
  const [form, setForm] = useState({
    name: '',
    placement: 'homepage_banner',
    budgetTotal: 10000,
    dailyBudget: 1000,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    targetCities: [],
    targetTags: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canSubmit = form.name.trim() && form.budgetTotal >= 1000 && form.dailyBudget >= 100;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await onSubmit({
      name: form.name.trim(),
      placement: form.placement,
      budget: { total: Number(form.budgetTotal), daily: Number(form.dailyBudget) },
      schedule: { startDate: form.startDate, endDate: form.endDate },
      targeting: { cities: form.targetCities, tags: form.targetTags },
    });
    setSubmitting(false);
  };

  return (
    <ModalShell onClose={onClose} title="➕ New Ad Campaign" wide>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <Field label="Campaign Name *">
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Health Plus — Summer 2026"
            style={inputStyle}
          />
        </Field>

        <Field label="Placement *">
          <select value={form.placement} onChange={(e) => set('placement', e.target.value)} style={inputStyle}>
            {PLACEMENTS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Field label="Total Budget (₹) *">
            <input
              type="number"
              value={form.budgetTotal}
              onChange={(e) => set('budgetTotal', e.target.value)}
              min={1000}
              step={500}
              style={inputStyle}
            />
          </Field>
          <Field label="Daily Budget (₹) *">
            <input
              type="number"
              value={form.dailyBudget}
              onChange={(e) => set('dailyBudget', e.target.value)}
              min={100}
              step={100}
              style={inputStyle}
            />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Field label="Start Date">
            <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="End Date">
            <input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} style={inputStyle} />
          </Field>
        </div>

        <div style={{
          padding: '0.75rem', background: walletBalance >= form.budgetTotal ? '#dcfce7' : '#fef3c7',
          color: walletBalance >= form.budgetTotal ? '#166534' : '#92400e',
          borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600,
        }}>
          {walletBalance >= form.budgetTotal
            ? `✅ Wallet balance ${inr(walletBalance)} covers this budget`
            : `⚠️ Wallet balance ${inr(walletBalance)} — top up at least ${inr(form.budgetTotal - walletBalance)} more`}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <button
          onClick={onClose}
          style={{ padding: '0.55rem 1rem', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
        >Cancel</button>
        <button
          onClick={submit}
          disabled={!canSubmit || submitting}
          style={{
            padding: '0.55rem 1.25rem',
            background: !canSubmit || submitting ? '#94a3b8' : '#1565C0',
            color: 'white', border: 'none', borderRadius: '0.5rem',
            cursor: !canSubmit || submitting ? 'not-allowed' : 'pointer',
            fontWeight: 700, fontSize: '0.85rem',
          }}
        >{submitting ? 'Creating…' : 'Create Campaign'}</button>
      </div>
    </ModalShell>
  );
}

// ============================================
// MODAL SHELL + FIELDS
// ============================================
const inputStyle = {
  width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0',
  borderRadius: '0.5rem', fontSize: '0.9rem', background: 'white',
};

const Field = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>{label}</label>
    {children}
  </div>
);

function ModalShell({ children, onClose, title, wide }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: '1rem',
          width: '100%', maxWidth: wide ? '640px' : '480px',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{
          padding: '1.1rem 1.5rem', borderBottom: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: '0.5rem',
              width: '30px', height: '30px', cursor: 'pointer', color: '#475569', fontSize: '0.9rem',
            }}
          >✕</button>
        </div>
        <div style={{ padding: '1.25rem 1.5rem' }}>{children}</div>
      </div>
    </div>
  );
}