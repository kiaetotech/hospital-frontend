// D:\hospital-frontend\src\pages\insurance\InsurerAdSlots.jsx
// ============================================
// INSURER AD SLOTS MANAGER
// Create / edit / preview / pause ad campaigns
// Backend: /api/insurance/company/ads/* (from providerApi.insuranceApi)
// ============================================

import React, { useEffect, useState, useMemo } from 'react';
import { insuranceApi } from '../../services/providerApi';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-e2cf.up.railway.app';
const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const PLACEMENTS = [
  { value: 'homepage_banner',  label: '🏠 Homepage Banner',  hint: 'Top of marketplace home' },
  { value: 'search_top',       label: '🔍 Search Top',       hint: 'Above search results' },
  { value: 'search_inline',    label: '📋 Search Inline',    hint: 'Between result cards' },
  { value: 'plan_sidebar',     label: '📌 Plan Sidebar',     hint: 'Right column on plan pages' },
  { value: 'category_page',    label: '📂 Category Page',    hint: 'Top of category listings' },
  { value: 'dashboard_widget', label: '📊 Dashboard Widget', hint: 'Inside user dashboard' },
  { value: 'mobile_feed',      label: '📱 Mobile Feed',      hint: 'Scroll feed on mobile' },
  { value: 'checkout_upsell',  label: '💳 Checkout Upsell',  hint: 'Checkout page slot' },
];

const STATUS_META = {
  draft:            { bg: '#f1f5f9', color: '#475569', label: 'Draft' },
  pending_approval: { bg: '#fef3c7', color: '#92400e', label: 'Pending Approval' },
  active:           { bg: '#dcfce7', color: '#166534', label: 'Active' },
  paused:           { bg: '#fef3c7', color: '#92400e', label: 'Paused' },
  rejected:         { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  completed:        { bg: '#dbeafe', color: '#1e40af', label: 'Completed' },
  exhausted:        { bg: '#f1f5f9', color: '#475569', label: 'Budget Exhausted' },
};

// ============================================
// MAIN
// ============================================
export default function InsurerAdSlots() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await insuranceApi.getAdCampaigns({ limit: 100 });
      setCampaigns(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ---------------------------------------------
  // CRUD
  // ---------------------------------------------
  const createCampaign = async (payload) => {
    try {
      await insuranceApi.createAdCampaign(payload);
      notify('Campaign created — awaiting admin approval');
      setShowCreate(false);
      load();
    } catch (e) {
      notify(e.response?.data?.message || 'Failed to create', 'error');
    }
  };

  const updateCampaign = async (id, payload) => {
    try {
      // If backend has updateCampaign, use it; else recreate via delete + create
      if (insuranceApi.updateAdCampaign) {
        await insuranceApi.updateAdCampaign(id, payload);
      } else {
        // Fallback: delete + create
        await insuranceApi.deleteAdCampaign(id);
        await insuranceApi.createAdCampaign(payload);
      }
      notify('Campaign updated');
      setEditing(null);
      load();
    } catch (e) {
      notify(e.response?.data?.message || 'Failed to update', 'error');
    }
  };

  const pauseCampaign = async (id) => {
    if (!window.confirm('Pause this campaign?')) return;
    try {
      await insuranceApi.pauseAdCampaign(id);
      notify('Campaign paused');
      load();
    } catch (e) { notify(e.response?.data?.message || 'Failed', 'error'); }
  };

  const resumeCampaign = async (id) => {
    try {
      await insuranceApi.resumeAdCampaign(id);
      notify('Campaign resumed');
      load();
    } catch (e) { notify(e.response?.data?.message || 'Failed', 'error'); }
  };

  const deleteCampaign = async (id) => {
    if (!window.confirm('Delete this campaign permanently?')) return;
    try {
      await insuranceApi.deleteAdCampaign(id);
      notify('Campaign deleted');
      load();
    } catch (e) { notify(e.response?.data?.message || 'Failed', 'error'); }
  };

  // ---------------------------------------------
  // Derived
  // ---------------------------------------------
  const filtered = useMemo(() => {
    if (filter === 'all') return campaigns;
    return campaigns.filter((c) => c.status === filter);
  }, [campaigns, filter]);

  const stats = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter((c) => c.status === 'active').length;
    const pending = campaigns.filter((c) => c.status === 'pending_approval').length;
    const spent = campaigns.reduce((s, c) => s + (c.metrics?.spend || 0), 0);
    const impressions = campaigns.reduce((s, c) => s + (c.metrics?.impressions || 0), 0);
    const clicks = campaigns.reduce((s, c) => s + (c.metrics?.clicks || 0), 0);
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
    return { total, active, pending, spent, impressions, clicks, ctr };
  }, [campaigns]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div>
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
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>🎨 Ad Slots</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            Design creatives • Choose placement • Track impressions & clicks
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ padding: '0.55rem 1rem', background: '#1565C0', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
        >➕ New Campaign</button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <Kpi label="Total Campaigns" value={stats.total} accent="#1565C0" icon="📢" />
        <Kpi label="Active" value={stats.active} accent="#10b981" icon="▶️" sub={`${stats.pending} pending approval`} />
        <Kpi label="Impressions" value={stats.impressions.toLocaleString('en-IN')} accent="#06b6d4" icon="👁️" />
        <Kpi label="Clicks" value={stats.clicks.toLocaleString('en-IN')} accent="#8b5cf6" icon="🖱️" sub={`CTR ${stats.ctr}%`} />
        <Kpi label="Total Spent" value={inr(stats.spent)} accent="#f59e0b" icon="💸" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
        {[
          { id: 'all', label: '📋 All' },
          { id: 'active', label: '▶️ Active' },
          { id: 'pending_approval', label: '⏳ Pending' },
          { id: 'paused', label: '⏸ Paused' },
          { id: 'draft', label: '📝 Draft' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '0.4rem 0.85rem', border: 'none', borderRadius: '999px',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              background: filter === f.id ? '#1565C0' : '#f1f5f9',
              color: filter === f.id ? 'white' : '#475569',
            }}
          >{f.label}</button>
        ))}
        <button
          onClick={load}
          style={{ marginLeft: 'auto', padding: '0.4rem 0.85rem', background: '#e2e8f0', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}
        >🔄 Refresh</button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Campaign cards */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading campaigns…</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '0.85rem', padding: '3rem', textAlign: 'center', color: '#94a3b8', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎨</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
            {filter === 'all' ? 'No campaigns yet' : `No campaigns in "${filter}" state`}
          </div>
          <div style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>Create your first campaign to start advertising</div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ padding: '0.55rem 1.25rem', background: '#1565C0', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
          >➕ Create Campaign</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.85rem' }}>
          {filtered.map((c) => (
            <CampaignCard
              key={c._id}
              campaign={c}
              onPause={() => pauseCampaign(c._id)}
              onResume={() => resumeCampaign(c._id)}
              onEdit={() => setEditing(c)}
              onDelete={() => deleteCampaign(c._id)}
            />
          ))}
        </div>
      )}

      {/* Info footer */}
      <div style={{
        marginTop: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: '0.75rem', padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6,
      }}>
        <strong style={{ color: '#0f172a' }}>💡 How ad slots work</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li><strong>Create campaign</strong> → pick placement, budget, dates, and creative.</li>
          <li><strong>Admin approval</strong> → within 24 hours (typically instant for verified insurers).</li>
          <li><strong>Live ads</strong> → render on marketplace automatically.</li>
          <li><strong>Impression</strong> = ₹0.02 charged. <strong>Click</strong> = ₹1.50 charged.</li>
          <li><strong>Budget exhausted</strong> → campaign pauses automatically.</li>
        </ul>
      </div>

      {/* Modals */}
      {showCreate && (
        <CampaignModal
          onClose={() => setShowCreate(false)}
          onSubmit={createCampaign}
        />
      )}
      {editing && (
        <CampaignModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={(payload) => updateCampaign(editing._id, payload)}
        />
      )}
    </div>
  );
}

// ============================================
// CAMPAIGN CARD
// ============================================
function CampaignCard({ campaign, onPause, onResume, onEdit, onDelete }) {
  const c = campaign.creative || {};
  const m = campaign.metrics || {};
  const statusMeta = STATUS_META[campaign.status] || STATUS_META.draft;
  const impressions = m.impressions || 0;
  const clicks = m.clicks || 0;
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
  const spent = m.spend || 0;
  const budget = campaign.budget?.total || 0;
  const budgetPct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

  return (
    <div style={{
      background: 'white', borderRadius: '0.85rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      border: '1px solid #f1f5f9',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Preview header */}
      <div style={{
        padding: '0.75rem 1rem',
        background: `linear-gradient(135deg, ${c.accentColor || '#1565C0'}22, ${c.accentColor || '#1565C0'}08)`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{
          padding: '0.2rem 0.55rem', borderRadius: '999px',
          fontSize: '0.68rem', fontWeight: 700,
          background: statusMeta.bg, color: statusMeta.color,
          textTransform: 'uppercase', letterSpacing: '0.03em',
        }}>{statusMeta.label}</span>
        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
          {PLACEMENTS.find(p => p.value === campaign.placement)?.label || campaign.placement}
        </span>
      </div>

      {/* Preview body */}
      <div style={{ padding: '1rem' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
          {c.headline || campaign.name || 'Untitled'}
        </div>
        {c.bodyText && (
          <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.5rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {c.bodyText}
          </div>
        )}
        {c.ctaText && (
          <div style={{
            display: 'inline-block',
            padding: '0.3rem 0.7rem',
            background: c.accentColor || '#1565C0', color: 'white',
            borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 700,
          }}>{c.ctaText} →</div>
        )}
      </div>

      {/* Metrics */}
      <div style={{
        padding: '0.85rem 1rem',
        borderTop: '1px solid #f1f5f9',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
      }}>
        <MiniStat label="Impressions" value={impressions.toLocaleString('en-IN')} />
        <MiniStat label="Clicks" value={clicks.toLocaleString('en-IN')} />
        <MiniStat label="CTR" value={`${ctr}%`} />
      </div>

      {/* Budget bar */}
      {budget > 0 && (
        <div style={{ padding: '0 1rem 0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>
            <span>Spent {inr(spent)}</span>
            <span>Budget {inr(budget)}</span>
          </div>
          <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${budgetPct}%`, background: budgetPct >= 90 ? '#ef4444' : '#10b981', transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{
        padding: '0.6rem 1rem 1rem',
        display: 'flex',
        gap: '0.4rem',
        flexWrap: 'wrap',
      }}>
        {campaign.status === 'active' && (
          <ActionBtn onClick={onPause} color="#f59e0b">⏸ Pause</ActionBtn>
        )}
        {campaign.status === 'paused' && (
          <ActionBtn onClick={onResume} color="#10b981">▶️ Resume</ActionBtn>
        )}
        <ActionBtn onClick={onEdit} color="#1565C0">✏️ Edit</ActionBtn>
        <ActionBtn onClick={onDelete} color="#ef4444">🗑 Delete</ActionBtn>
      </div>
    </div>
  );
}

// ============================================
// CAMPAIGN MODAL
// ============================================
function CampaignModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(initial ? {
    name: initial.name || '',
    placement: initial.placement || 'homepage_banner',
    headline: initial.creative?.headline || '',
    bodyText: initial.creative?.bodyText || '',
    imageUrl: initial.creative?.imageUrl || '',
    ctaText: initial.creative?.ctaText || 'Learn More',
    ctaUrl: initial.creative?.ctaUrl || '',
    accentColor: initial.creative?.accentColor || '#1565C0',
    budgetTotal: initial.budget?.total || 10000,
    budgetDaily: initial.budget?.daily || 1000,
    startDate: initial.schedule?.startDate ? new Date(initial.schedule.startDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    endDate: initial.schedule?.endDate ? new Date(initial.schedule.endDate).toISOString().slice(0, 10) : new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  } : {
    name: '',
    placement: 'homepage_banner',
    headline: '',
    bodyText: '',
    imageUrl: '',
    ctaText: 'Learn More',
    ctaUrl: '',
    accentColor: '#1565C0',
    budgetTotal: 10000,
    budgetDaily: 1000,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  });

  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canSubmit = form.name.trim() && form.headline.trim() && form.budgetTotal >= 500 && form.budgetDaily >= 100;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      placement: form.placement,
      creative: {
        headline: form.headline.trim(),
        bodyText: form.bodyText.trim(),
        imageUrl: form.imageUrl.trim(),
        ctaText: form.ctaText.trim() || 'Learn More',
        ctaUrl: form.ctaUrl.trim(),
        accentColor: form.accentColor,
      },
      budget: { total: Number(form.budgetTotal), daily: Number(form.budgetDaily) },
      schedule: { startDate: form.startDate, endDate: form.endDate },
    };
    await onSubmit(payload);
    setSubmitting(false);
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'white', borderRadius: '1rem',
        width: '100%', maxWidth: '720px', maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
      }}>
        <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{initial ? '✏️ Edit Campaign' : '➕ New Ad Campaign'}</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '0.5rem', width: '30px', height: '30px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gap: '1rem' }}>
          <Field label="Campaign Name *">
            <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Health Plus — Summer 2026" style={inputStyle} />
          </Field>

          <Field label="Placement *">
            <select value={form.placement} onChange={(e) => set('placement', e.target.value)} style={inputStyle}>
              {PLACEMENTS.map((p) => (
                <option key={p.value} value={p.value}>{p.label} — {p.hint}</option>
              ))}
            </select>
          </Field>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
              Creative
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <Field label="Headline *">
                <input value={form.headline} onChange={(e) => set('headline', e.target.value)} placeholder="e.g. Get ₹5L health cover from ₹449/month" style={inputStyle} />
              </Field>
              <Field label="Body Text">
                <textarea value={form.bodyText} onChange={(e) => set('bodyText', e.target.value)} rows={2} placeholder="Supporting copy…" style={{ ...inputStyle, resize: 'vertical' }} />
              </Field>
              <Field label="Image URL">
                <input value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} placeholder="https://res.cloudinary.com/…" style={inputStyle} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                <Field label="CTA Text">
                  <input value={form.ctaText} onChange={(e) => set('ctaText', e.target.value)} style={inputStyle} />
                </Field>
                <Field label="CTA Link">
                  <input value={form.ctaUrl} onChange={(e) => set('ctaUrl', e.target.value)} placeholder="/insurance/plan/xyz" style={inputStyle} />
                </Field>
                <Field label="Accent">
                  <input type="color" value={form.accentColor} onChange={(e) => set('accentColor', e.target.value)} style={{ ...inputStyle, padding: '0.15rem', height: '38px', cursor: 'pointer' }} />
                </Field>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
              Budget & Schedule
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Total Budget (₹) *">
                <input type="number" value={form.budgetTotal} onChange={(e) => set('budgetTotal', e.target.value)} min={500} step={500} style={inputStyle} />
              </Field>
              <Field label="Daily Budget (₹) *">
                <input type="number" value={form.budgetDaily} onChange={(e) => set('budgetDaily', e.target.value)} min={100} step={100} style={inputStyle} />
              </Field>
              <Field label="Start Date">
                <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} style={inputStyle} />
              </Field>
              <Field label="End Date">
                <input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} style={inputStyle} />
              </Field>
            </div>
          </div>

          {/* Live preview */}
          {form.headline && (
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                Live Preview
              </div>
              <div style={{ background: 'white', border: `1px solid ${form.accentColor}22`, borderRadius: '0.75rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.7rem', color: form.accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.4rem' }}>
                  Sponsored
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {form.headline}
                </div>
                {form.bodyText && (
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.6rem', lineHeight: 1.5 }}>{form.bodyText}</div>
                )}
                <div style={{ display: 'inline-block', padding: '0.4rem 0.9rem', background: form.accentColor, color: 'white', borderRadius: '0.5rem', fontSize: '0.78rem', fontWeight: 700 }}>
                  {form.ctaText || 'Learn More'} →
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', background: '#f8fafc' }}>
          <button onClick={onClose} style={{ padding: '0.55rem 1rem', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
            Cancel
          </button>
          <button onClick={submit} disabled={!canSubmit || submitting} style={{
            padding: '0.55rem 1.25rem',
            background: !canSubmit || submitting ? '#94a3b8' : '#1565C0',
            color: 'white', border: 'none', borderRadius: '0.5rem',
            cursor: !canSubmit || submitting ? 'not-allowed' : 'pointer',
            fontWeight: 700, fontSize: '0.85rem',
          }}>
            {submitting ? 'Saving…' : initial ? 'Save Changes' : 'Create Campaign'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SHARED UI
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

const MiniStat = ({ label, value }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</div>
    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>{value}</div>
  </div>
);

const ActionBtn = ({ onClick, color, children }) => (
  <button onClick={onClick} style={{
    padding: '0.4rem 0.75rem',
    background: `${color}15`, color: color,
    border: 'none', borderRadius: '0.4rem',
    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
  }}>{children}</button>
);

const Field = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>{label}</label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0',
  borderRadius: '0.5rem', fontSize: '0.9rem', background: 'white', boxSizing: 'border-box',
};