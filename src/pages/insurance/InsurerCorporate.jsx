// D:\hospital-frontend\src\pages\insurance\InsurerCorporate.jsx
// ============================================
// INSURER CORPORATE TAB
// Corporate wellness toggle • Group packages • Corporate enquiries pipeline
// Uses providerApi.insuranceApi (auth via providerToken)
// ============================================

import React, { useEffect, useState, useMemo } from 'react';
import { insuranceApi } from '../../services/providerApi';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const STAGES = [
  { id: 'new',         label: '🆕 New',          color: '#3b82f6' },
  { id: 'contacted',   label: '📞 Contacted',    color: '#8b5cf6' },
  { id: 'negotiating', label: '🤝 Negotiating',  color: '#f59e0b' },
  { id: 'converted',   label: '✅ Converted',    color: '#10b981' },
  { id: 'lost',        label: '❌ Lost',         color: '#94a3b8' },
];

const EMPLOYEE_RANGES = [
  { value: '1-50',      label: '1–50 employees' },
  { value: '51-200',    label: '51–200 employees' },
  { value: '201-500',   label: '201–500 employees' },
  { value: '501-2000',  label: '501–2,000 employees' },
  { value: '2000+',     label: '2,000+ employees' },
];

// ============================================
// MAIN
// ============================================
export default function InsurerCorporate() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const [profile, setProfile] = useState(null);
  const [packages, setPackages] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  const [activeSubTab, setActiveSubTab] = useState('packages');
  const [enquiryFilter, setEnquiryFilter] = useState('all');

  const [showCreatePkg, setShowCreatePkg] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [profRes, pkgRes, enqRes] = await Promise.all([
        insuranceApi.getProfile().catch(() => ({ data: { data: null } })),
        insuranceApi.getCorporatePackages().catch(() => ({ data: { data: [] } })),
        insuranceApi.getCorporateEnquiries().catch(() => ({ data: { data: [] } })),
      ]);
      setProfile(profRes.data?.data || null);
      setPackages(pkgRes.data?.data || []);
      setEnquiries(enqRes.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load corporate data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // ---------------------------------------------
  // ACTIONS
  // ---------------------------------------------
  const handleToggleCorporate = async () => {
    const currentlyOn = profile?.offersCorporateWellness || false;
    const enable = !currentlyOn;
    try {
      await insuranceApi.toggleCorporate({ enable });
      notify(enable ? 'Corporate wellness enabled' : 'Corporate wellness disabled');
      loadAll();
    } catch (e) {
      notify(e.response?.data?.message || 'Failed to toggle', 'error');
    }
  };

  const handleCreatePkg = async (payload) => {
    try {
      // Reuse the corporate packages endpoint via a simple POST
      const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-ilhi.onrender.com';
      const token = localStorage.getItem('providerToken');
      const r = await fetch(`${API_BASE}/api/insurance/company/corporate/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (d.success) {
        notify('Corporate package created');
        setShowCreatePkg(false);
        loadAll();
      } else {
        notify(d.message || 'Failed to create package', 'error');
      }
    } catch (e) {
      notify(e.message || 'Failed', 'error');
    }
  };

  const handleUpdatePkg = async (pkgId, payload) => {
    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-ilhi.onrender.com';
      const token = localStorage.getItem('providerToken');
      const r = await fetch(`${API_BASE}/api/insurance/company/corporate/packages/${pkgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (d.success) {
        notify('Corporate package updated');
        setEditingPkg(null);
        loadAll();
      } else {
        notify(d.message || 'Failed to update', 'error');
      }
    } catch (e) {
      notify(e.message || 'Failed', 'error');
    }
  };

  const handleDeletePkg = async (pkgId) => {
    if (!window.confirm('Delete this corporate package?')) return;
    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-ilhi.onrender.com';
      const token = localStorage.getItem('providerToken');
      const r = await fetch(`${API_BASE}/api/insurance/company/corporate/packages/${pkgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success) {
        notify('Package deleted');
        loadAll();
      } else {
        notify(d.message || 'Failed', 'error');
      }
    } catch (e) {
      notify(e.message || 'Failed', 'error');
    }
  };

  const handleUpdateEnquiryStage = async (enquiryId, stage) => {
    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-ilhi.onrender.com';
      const token = localStorage.getItem('providerToken');
      const r = await fetch(`${API_BASE}/api/insurance/company/corporate/enquiries/${enquiryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stage }),
      });
      const d = await r.json();
      if (d.success) {
        notify(`Enquiry moved to ${stage}`);
        loadAll();
      } else {
        notify(d.message || 'Failed', 'error');
      }
    } catch (e) {
      notify(e.message || 'Failed', 'error');
    }
  };

  // ---------------------------------------------
  // DERIVED
  // ---------------------------------------------
  const corporateEnabled = profile?.offersCorporateWellness || false;

  const enquiryCounts = useMemo(() => {
    const counts = { all: enquiries.length };
    STAGES.forEach((s) => { counts[s.id] = enquiries.filter((e) => e.stage === s.id).length; });
    return counts;
  }, [enquiries]);

  const filteredEnquiries = useMemo(() => {
    if (enquiryFilter === 'all') return enquiries;
    return enquiries.filter((e) => e.stage === enquiryFilter);
  }, [enquiries, enquiryFilter]);

  // ---------------------------------------------
  // RENDER
  // ---------------------------------------------
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
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>🏢 Corporate Wellness</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            Offer group insurance to companies • Manage B2B enquiries
          </p>
        </div>
        <button
          onClick={handleToggleCorporate}
          style={{
            padding: '0.55rem 1rem',
            background: corporateEnabled ? '#10b981' : '#e2e8f0',
            color: corporateEnabled ? 'white' : '#334155',
            border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}
        >
          {corporateEnabled ? '✅ Corporate ON' : '⚪ Corporate OFF'}
          <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.85 }}>
            (click to {corporateEnabled ? 'disable' : 'enable'})
          </span>
        </button>
      </div>

      {/* Info banner if disabled */}
      {!corporateEnabled && (
        <div style={{
          background: '#fef3c7', border: '1px solid #fcd34d', color: '#92400e',
          borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.25rem',
          fontSize: '0.875rem', lineHeight: 1.6,
        }}>
          <strong>⚠️ Corporate wellness is OFF.</strong> Turn it on to start creating group insurance packages for companies. Once enabled, HR managers from companies can discover your packages and reach out with enquiries.
        </div>
      )}

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <Kpi label="Corporate Packages" value={packages.length} accent="#1565C0" icon="📦" />
        <Kpi label="Total Enquiries" value={enquiries.length} accent="#8b5cf6" icon="📨" />
        <Kpi label="New (unread)" value={enquiryCounts.new || 0} accent="#f59e0b" icon="🆕" />
        <Kpi label="Converted" value={enquiryCounts.converted || 0} accent="#10b981" icon="✅" />
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', borderBottom: '2px solid #f1f5f9' }}>
        <SubTab active={activeSubTab === 'packages'} onClick={() => setActiveSubTab('packages')}>
          📦 Packages ({packages.length})
        </SubTab>
        <SubTab active={activeSubTab === 'enquiries'} onClick={() => setActiveSubTab('enquiries')}>
          📨 Enquiries ({enquiries.length})
        </SubTab>
      </div>

      {/* PACKAGES VIEW */}
      {activeSubTab === 'packages' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Your Corporate Packages</h3>
            <button
              onClick={() => setShowCreatePkg(true)}
              disabled={!corporateEnabled}
              style={{
                padding: '0.5rem 1rem',
                background: corporateEnabled ? '#1565C0' : '#cbd5e1',
                color: 'white', border: 'none', borderRadius: '0.5rem',
                cursor: corporateEnabled ? 'pointer' : 'not-allowed',
                fontWeight: 600, fontSize: '0.85rem',
              }}
            >➕ Create Package</button>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading packages…</div>
          ) : packages.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '0.85rem', padding: '3rem', textAlign: 'center', color: '#94a3b8', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>No corporate packages yet</div>
              <div style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
                {corporateEnabled ? 'Create your first B2B package' : 'Enable corporate wellness to start'}
              </div>
              {corporateEnabled && (
                <button
                  onClick={() => setShowCreatePkg(true)}
                  style={{ padding: '0.55rem 1.25rem', background: '#1565C0', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >➕ Create Package</button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.85rem' }}>
              {packages.map((pkg) => (
                <div key={pkg._id} style={{
                  background: 'white', borderRadius: '0.85rem', padding: '1.1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: '4px solid #1565C0',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{pkg.packageName || pkg.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Created {fmtDate(pkg.createdAt)}</div>
                    </div>
                    <StatusPill status={pkg.approvalStatus || 'pending'} />
                  </div>

                  {pkg.description && (
                    <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                      {pkg.description.slice(0, 120)}{pkg.description.length > 120 ? '…' : ''}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#475569', marginBottom: '0.75rem' }}>
                    <div><strong>Sum Insured:</strong> {inr(pkg.sumInsured)}</div>
                    <div><strong>Per Employee:</strong> {inr(pkg.perEmployeePremium)}</div>
                    <div><strong>Min Employees:</strong> {pkg.minEmployees || '—'}</div>
                    <div><strong>Coverage:</strong> {pkg.coverageTypes?.length || 0} items</div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => setEditingPkg(pkg)}
                      style={{ flex: 1, padding: '0.4rem 0.75rem', background: '#eff6ff', color: '#1e40af', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                    >✏️ Edit</button>
                    <button
                      onClick={() => handleDeletePkg(pkg._id)}
                      style={{ padding: '0.4rem 0.75rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                    >🗑 Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ENQUIRIES VIEW */}
      {activeSubTab === 'enquiries' && (
        <>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <FilterPill active={enquiryFilter === 'all'} onClick={() => setEnquiryFilter('all')} color="#475569">
              All ({enquiryCounts.all || 0})
            </FilterPill>
            {STAGES.map((s) => (
              <FilterPill key={s.id} active={enquiryFilter === s.id} onClick={() => setEnquiryFilter(s.id)} color={s.color}>
                {s.label} ({enquiryCounts[s.id] || 0})
              </FilterPill>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading enquiries…</div>
          ) : filteredEnquiries.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '0.85rem', padding: '3rem', textAlign: 'center', color: '#94a3b8', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📨</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
                {enquiryFilter === 'all' ? 'No corporate enquiries yet' : `No enquiries in "${enquiryFilter}" stage`}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {filteredEnquiries.map((enq) => (
                <div key={enq._id} style={{
                  background: 'white', borderRadius: '0.75rem', padding: '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: `4px solid ${STAGES.find(s => s.id === enq.stage)?.color || '#94a3b8'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                        {enq.companyName || enq.corporateName || 'Company'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                        {enq.contactName && <span>👤 {enq.contactName}</span>}
                        {enq.email && <span> • 📧 {enq.email}</span>}
                        {enq.phone && <span> • 📞 {enq.phone}</span>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.5rem' }}>
                        {enq.employeeCount && <span><strong>Employees:</strong> {enq.employeeCount} </span>}
                        {enq.estimatedValue && <span>• <strong>Est. Value:</strong> {inr(enq.estimatedValue)}</span>}
                      </div>
                      {enq.message && (
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.4rem', fontStyle: 'italic' }}>
                          "{enq.message.slice(0, 200)}{enq.message.length > 200 ? '…' : ''}"
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{fmtDate(enq.createdAt)}</div>
                      <select
                        value={enq.stage || 'new'}
                        onChange={(e) => handleUpdateEnquiryStage(enq._id, e.target.value)}
                        style={{
                          padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0',
                          borderRadius: '0.5rem', fontSize: '0.8rem', background: 'white',
                          cursor: 'pointer', fontWeight: 600, color: '#334155',
                        }}
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Info footer */}
      <div style={{
        marginTop: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: '0.75rem', padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6,
      }}>
        <strong style={{ color: '#0f172a' }}>💡 How corporate wellness works</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>Enable corporate wellness → your packages become visible to companies on the platform.</li>
          <li>Create packages → set sum insured, per-employee premium, coverage, min employees.</li>
          <li>Admin reviews → approves or rejects within 24 hours.</li>
          <li>HR managers discover you → submit enquiries from the corporate portal.</li>
          <li>Track enquiries → move through pipeline: New → Contacted → Negotiating → Converted.</li>
        </ul>
      </div>

      {/* MODALS */}
      {showCreatePkg && (
        <PackageModal
          onClose={() => setShowCreatePkg(false)}
          onSubmit={handleCreatePkg}
        />
      )}
      {editingPkg && (
        <PackageModal
          initial={editingPkg}
          onClose={() => setEditingPkg(null)}
          onSubmit={(payload) => handleUpdatePkg(editingPkg._id, payload)}
        />
      )}
    </div>
  );
}

// ============================================
// SHARED UI
// ============================================
const Kpi = ({ label, value, accent, icon }) => (
  <div style={{
    background: 'white', borderRadius: '0.75rem', padding: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: `4px solid ${accent}`,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: accent, marginTop: '0.35rem' }}>{value}</div>
  </div>
);

const SubTab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: '0.65rem 1rem',
      background: 'transparent',
      border: 'none',
      borderBottom: `2px solid ${active ? '#1565C0' : 'transparent'}`,
      color: active ? '#1565C0' : '#64748b',
      fontWeight: active ? 700 : 500,
      cursor: 'pointer',
      fontSize: '0.85rem',
      marginBottom: '-2px',
    }}
  >{children}</button>
);

const FilterPill = ({ active, onClick, color, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: '0.35rem 0.75rem',
      background: active ? color : '#f1f5f9',
      color: active ? 'white' : '#475569',
      border: 'none', borderRadius: '999px',
      cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
    }}
  >{children}</button>
);

const StatusPill = ({ status }) => {
  const map = {
    approved: { bg: '#dcfce7', color: '#166534' },
    pending:  { bg: '#fef3c7', color: '#92400e' },
    rejected: { bg: '#fee2e2', color: '#991b1b' },
  };
  const c = map[status] || map.pending;
  return (
    <span style={{
      padding: '0.2rem 0.55rem', borderRadius: '999px',
      fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.03em',
      background: c.bg, color: c.color, textTransform: 'uppercase',
    }}>{status}</span>
  );
};

// ============================================
// PACKAGE MODAL
// ============================================
function PackageModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(initial || {
    packageName: '',
    description: '',
    sumInsured: 500000,
    perEmployeePremium: 12000,
    minEmployees: 10,
    coverageTypes: ['Hospitalization', 'OPD', 'Day Care'],
    validityMonths: 12,
  });
  const [newCoverage, setNewCoverage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addCoverage = () => {
    if (!newCoverage.trim()) return;
    set('coverageTypes', [...form.coverageTypes, newCoverage.trim()]);
    setNewCoverage('');
  };
  const removeCoverage = (idx) => {
    set('coverageTypes', form.coverageTypes.filter((_, i) => i !== idx));
  };

  const canSubmit = form.packageName.trim() && form.sumInsured > 0 && form.perEmployeePremium > 0;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await onSubmit({
      packageName: form.packageName.trim(),
      description: form.description.trim(),
      sumInsured: Number(form.sumInsured),
      perEmployeePremium: Number(form.perEmployeePremium),
      minEmployees: Number(form.minEmployees),
      coverageTypes: form.coverageTypes,
      validityMonths: Number(form.validityMonths),
    });
    setSubmitting(false);
  };

  return (
    <ModalShell onClose={onClose} title={initial ? '✏️ Edit Corporate Package' : '➕ Create Corporate Package'} wide>
      <div style={{ display: 'grid', gap: '0.85rem' }}>
        <Field label="Package Name *">
          <input value={form.packageName} onChange={(e) => set('packageName', e.target.value)}
            placeholder="e.g. Premium Group Health — 5L Cover" style={inputStyle} />
        </Field>

        <Field label="Description">
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3}
            placeholder="Brief description of the group plan…" style={{ ...inputStyle, resize: 'vertical' }} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Field label="Sum Insured (₹) *">
            <input type="number" value={form.sumInsured} onChange={(e) => set('sumInsured', e.target.value)} min={50000} step={50000} style={inputStyle} />
          </Field>
          <Field label="Per Employee Premium (₹/yr) *">
            <input type="number" value={form.perEmployeePremium} onChange={(e) => set('perEmployeePremium', e.target.value)} min={1000} step={500} style={inputStyle} />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Field label="Minimum Employees">
            <input type="number" value={form.minEmployees} onChange={(e) => set('minEmployees', e.target.value)} min={1} style={inputStyle} />
          </Field>
          <Field label="Validity (months)">
            <select value={form.validityMonths} onChange={(e) => set('validityMonths', e.target.value)} style={inputStyle}>
              <option value={12}>12 months</option>
              <option value={24}>24 months</option>
              <option value={36}>36 months</option>
            </select>
          </Field>
        </div>

        <Field label="Coverage Types">
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <input value={newCoverage} onChange={(e) => setNewCoverage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCoverage())}
              placeholder="e.g. Hospitalization" style={{ ...inputStyle, flex: 1 }} />
            <button type="button" onClick={addCoverage}
              style={{ padding: '0.6rem 1rem', background: '#334155', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
              Add
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {form.coverageTypes.map((c, i) => (
              <span key={i} style={{
                padding: '0.3rem 0.6rem', background: '#eff6ff', color: '#1e40af',
                borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              }}>
                {c}
                <button type="button" onClick={() => removeCoverage(i)}
                  style={{ background: 'none', border: 'none', color: '#1e40af', cursor: 'pointer', padding: 0, fontSize: '0.9rem' }}>×</button>
              </span>
            ))}
          </div>
        </Field>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <button onClick={onClose}
          style={{ padding: '0.55rem 1rem', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
          Cancel
        </button>
        <button onClick={submit} disabled={!canSubmit || submitting}
          style={{
            padding: '0.55rem 1.25rem',
            background: !canSubmit || submitting ? '#94a3b8' : '#1565C0',
            color: 'white', border: 'none', borderRadius: '0.5rem',
            cursor: !canSubmit || submitting ? 'not-allowed' : 'pointer',
            fontWeight: 700, fontSize: '0.85rem',
          }}>
          {submitting ? 'Saving…' : initial ? 'Save Changes' : 'Create Package'}
        </button>
      </div>
    </ModalShell>
  );
}

// ============================================
// HELPERS
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
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'white', borderRadius: '1rem',
        width: '100%', maxWidth: wide ? '640px' : '480px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
      }}>
        <div style={{
          padding: '1.1rem 1.5rem', borderBottom: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
          <button onClick={onClose} style={{
            background: '#f1f5f9', border: 'none', borderRadius: '0.5rem',
            width: '30px', height: '30px', cursor: 'pointer', color: '#475569', fontSize: '0.9rem',
          }}>✕</button>
        </div>
        <div style={{ padding: '1.25rem 1.5rem' }}>{children}</div>
      </div>
    </div>
  );
}