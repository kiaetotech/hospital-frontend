// D:\hospital-frontend\src\pages\insurance\InsurerPreAuthQueue.jsx
// ============================================
// INSURER PRE-AUTH QUEUE
// Receive + respond to cashless pre-auth requests from patients
// Includes SLA countdown per IRDAI rules:
//   - Emergency admission: 30 minutes SLA
//   - Planned admission: 24 hours SLA
// ============================================

import React, { useEffect, useState, useMemo, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-ilhi.onrender.com';
const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

// ---------------------------------------------
// SLA calculation
// ---------------------------------------------
const SLA_HOURS = { emergency: 0.5, planned: 24, default: 24 };

const computeSLA = (preauth) => {
  if (!preauth.submittedAt) return null;
  const submitted = new Date(preauth.submittedAt).getTime();
  const slaHours = SLA_HOURS[preauth.admissionType] ?? SLA_HOURS.default;
  const deadline = submitted + slaHours * 60 * 60 * 1000;
  const now = Date.now();
  const remainingMs = deadline - now;
  const remainingMins = Math.floor(remainingMs / (1000 * 60));
  const elapsedMins = Math.floor((now - submitted) / (1000 * 60));

  let state = 'ok';
  if (remainingMs < 0) state = 'breached';
  else if (remainingMins <= 60) state = 'warning';

  return {
    deadline,
    remainingMins,
    elapsedMins,
    state,
    slaHours,
    label: remainingMs < 0
      ? `Breached by ${Math.abs(remainingMins)} min`
      : remainingMins >= 60
      ? `${Math.floor(remainingMins / 60)}h ${remainingMins % 60}m left`
      : `${remainingMins}m left`,
  };
};

// ============================================
// MAIN
// ============================================
export default function InsurerPreAuthQueue() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [preauths, setPreauths] = useState([]);

  const [filter, setFilter] = useState('pending'); // pending | breached | emergency | all
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null); // drawer

  const [selectedIds, setSelectedIds] = useState([]);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ============================================
  // LOAD
  // ============================================
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('providerToken');
      const r = await fetch(`${API_BASE}/api/insurance-preauth/insurer/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success) setPreauths(d.data || []);
      else setError(d.error?.message || d.message || 'Failed to load pre-auths');
    } catch (e) { setError(e.message || 'Failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ============================================
  // DECIDE
  // ============================================
  const decide = async (id, action, extra = {}) => {
    try {
      const token = localStorage.getItem('providerToken');
      const r = await fetch(`${API_BASE}/api/insurance-preauth/insurer/${id}/decide`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, ...extra }),
      });
      const d = await r.json();
      if (d.success) {
        const msgMap = { approve: 'Approved', reject: 'Rejected', query: 'Query raised' };
        notify(`${msgMap[action]} — ${d.data?.preAuthNumber || ''}`, 'success');
        setSelected(null);
        setSelectedIds([]);
        load();
        return true;
      } else {
        notify(d.error?.message || 'Failed', 'error');
        return false;
      }
    } catch (e) {
      notify(e.message || 'Failed', 'error');
      return false;
    }
  };

  const bulkApprove = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Approve ${selectedIds.length} pre-auth(s) with requested amounts?`)) return;
    let ok = 0, fail = 0;
    for (const id of selectedIds) {
      const item = preauths.find((p) => p._id === id);
      const okFlag = await decide(id, 'approve', { approvedAmount: item?.requestedAmount });
      if (okFlag) ok++; else fail++;
    }
    notify(`${ok} approved${fail ? `, ${fail} failed` : ''}`, 'success');
  };

  // ============================================
  // DERIVED
  // ============================================
  const scored = useMemo(() => preauths.map((p) => ({ ...p, _sla: computeSLA(p) })), [preauths]);

  const filtered = useMemo(() => {
    let list = scored;

    if (filter === 'pending') list = list.filter((p) => ['submitted', 'under_review', 'query_raised'].includes(p.status));
    else if (filter === 'breached') list = list.filter((p) => p._sla?.state === 'breached' || p._sla?.state === 'warning');
    else if (filter === 'emergency') list = list.filter((p) => p.admissionType === 'emergency');

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        `${p.preAuthNumber} ${p.hospitalName} ${p.userId?.name} ${p.policyId?.policyNumber}`.toLowerCase().includes(q)
      );
    }

    return list;
  }, [scored, filter, search]);

  const stats = useMemo(() => {
    const pending = scored.filter((p) => ['submitted', 'under_review', 'query_raised'].includes(p.status));
    const breached = pending.filter((p) => p._sla?.state === 'breached').length;
    const warning = pending.filter((p) => p._sla?.state === 'warning').length;
    const emergency = pending.filter((p) => p.admissionType === 'emergency').length;
    const totalRequested = pending.reduce((s, p) => s + Number(p.requestedAmount || 0), 0);
    return { pending: pending.length, breached, warning, emergency, totalRequested };
  }, [scored]);

  const toggleSelect = (id) => {
    setSelectedIds((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };

  const toggleAll = () => {
    const ids = filtered.map((p) => p._id);
    const allSelected = ids.every((id) => selectedIds.includes(id));
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(ids);
  };

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
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🩺 Pre-Auth Queue
          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', background: '#dbeafe', color: '#1e40af', borderRadius: '999px' }}>
            IRDAI SLA
          </span>
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
          Cashless pre-authorization requests • Emergency 30 min SLA • Planned 24 hr SLA
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <Kpi label="Pending Pre-Auths" value={stats.pending} accent="#1565C0" icon="⏳" />
        <Kpi label="SLA Breached" value={stats.breached} accent="#ef4444" icon="🚨" sub="respond immediately" />
        <Kpi label="Approaching SLA" value={stats.warning} accent="#f59e0b" icon="⚠️" sub="within 60 minutes" />
        <Kpi label="Emergency Cases" value={stats.emergency} accent="#dc2626" icon="🚑" sub="30 min SLA" />
        <Kpi label="Amount in Queue" value={inr(stats.totalRequested)} accent="#8b5cf6" icon="💰" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="🔍 Search pre-auth no, hospital, patient…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '240px', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.85rem' }}
        />
        {[
          { id: 'pending',   label: '⏳ Pending' },
          { id: 'breached',  label: '🚨 SLA Alert' },
          { id: 'emergency', label: '🚑 Emergency' },
          { id: 'all',       label: '📋 All' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '0.45rem 0.9rem', border: 'none', borderRadius: '999px',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              background: filter === f.id ? '#1565C0' : '#f1f5f9',
              color: filter === f.id ? 'white' : '#475569',
            }}
          >{f.label}</button>
        ))}
        <button onClick={load} style={{ padding: '0.45rem 0.9rem', border: 'none', borderRadius: '0.5rem', background: '#e2e8f0', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>🔄 Refresh</button>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div style={{
          padding: '0.65rem 1rem', marginBottom: '0.75rem',
          background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600 }}>
            {selectedIds.length} selected
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={bulkApprove}
              style={{ padding: '0.4rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
            >✅ Bulk Approve</button>
            <button
              onClick={() => setSelectedIds([])}
              style={{ padding: '0.4rem 1rem', background: 'transparent', color: '#1e40af', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
            >Clear</button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading pre-auths…</div>
      ) : filtered.length === 0 ? (
        <Empty msg={filter === 'pending' ? '✅ No pending pre-auths. Great work!' : 'No pre-auths match this filter'} />
      ) : (
        <div style={{ background: 'white', borderRadius: '0.85rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '960px' }}>
              <thead>
                <tr>
                  <Th width="36">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && filtered.every((p) => selectedIds.includes(p._id))}
                      onChange={toggleAll}
                    />
                  </Th>
                  <Th>Pre-Auth No</Th>
                  <Th>Patient</Th>
                  <Th>Hospital</Th>
                  <Th align="right">Requested</Th>
                  <Th align="center">SLA</Th>
                  <Th>Status</Th>
                  <Th align="center">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <Row
                    key={p._id}
                    p={p}
                    selected={selectedIds.includes(p._id)}
                    onToggle={() => toggleSelect(p._id)}
                    onClick={() => setSelected(p)}
                    onQuickApprove={() => decide(p._id, 'approve', { approvedAmount: p.requestedAmount })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info footer */}
      <div style={{
        marginTop: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: '0.75rem', padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6,
      }}>
        <strong style={{ color: '#0f172a' }}>📋 How it works</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li><strong>Emergency</strong> pre-auths must be decided within <strong>30 minutes</strong> (IRDAI norm).</li>
          <li><strong>Planned</strong> pre-auths must be decided within <strong>24 hours</strong>.</li>
          <li>SLA counter starts the moment the patient submits.</li>
          <li>Raising a query pauses the SLA — patient gets 24 hr to respond.</li>
          <li>Approved pre-auths are valid for <strong>15 days</strong> from the admission date.</li>
        </ul>
      </div>

      {/* Drawer */}
      {selected && (
        <DetailDrawer
          preauth={selected}
          onClose={() => setSelected(null)}
          onDecide={decide}
        />
      )}
    </div>
  );
}

// ============================================
// ROW
// ============================================
function Row({ p, selected, onToggle, onClick, onQuickApprove }) {
  const sla = p._sla || {};
  const slaColor = {
    breached: '#ef4444',
    warning: '#f59e0b',
    ok: '#10b981',
  }[sla.state] || '#94a3b8';

  const statusPalette = {
    submitted:        { bg: '#fef3c7', color: '#92400e' },
    under_review:     { bg: '#dbeafe', color: '#1e40af' },
    query_raised:     { bg: '#fed7aa', color: '#9a3412' },
    approved:         { bg: '#dcfce7', color: '#166534' },
    rejected:         { bg: '#fee2e2', color: '#991b1b' },
    expired:          { bg: '#f1f5f9', color: '#475569' },
  };
  const sc = statusPalette[p.status] || statusPalette.expired;

  return (
    <tr style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={onClick}>
      <Td>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
        />
      </Td>
      <Td>
        <div style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.preAuthNumber}</div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{fmtDateTime(p.submittedAt)}</div>
      </Td>
      <Td>
        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.userId?.name || '—'}</div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{p.userId?.phone || p.userId?.email || ''}</div>
      </Td>
      <Td>
        <div style={{ fontSize: '0.85rem' }}>{p.hospitalName}</div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
          {p.admissionType === 'emergency' ? '🚑 Emergency' : '📅 Planned'} • Adm: {fmtDate(p.admissionDate)}
        </div>
      </Td>
      <Td align="right">
        <div style={{ fontWeight: 700 }}>{inr(p.requestedAmount)}</div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Est: {inr(p.estimatedCost)}</div>
      </Td>
      <Td align="center">
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
          <span style={{
            padding: '0.15rem 0.5rem', borderRadius: '999px',
            background: `${slaColor}1A`, color: slaColor,
            fontSize: '0.7rem', fontWeight: 700,
          }}>
            {sla.state === 'breached' ? '🚨' : sla.state === 'warning' ? '⚠️' : '✅'} {sla.label}
          </span>
        </div>
      </Td>
      <Td>
        <span style={{
          padding: '0.2rem 0.55rem', borderRadius: '999px',
          background: sc.bg, color: sc.color,
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em',
        }}>{String(p.status || '').replace(/_/g, ' ')}</span>
      </Td>
      <Td align="center">
        <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
          {['submitted', 'under_review', 'query_raised'].includes(p.status) && (
            <button
              onClick={(e) => { e.stopPropagation(); onQuickApprove(); }}
              title="Approve with requested amount"
              style={{
                padding: '0.3rem 0.65rem', background: '#10b981', color: 'white',
                border: 'none', borderRadius: '0.4rem', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 600,
              }}
            >✅</button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            title="Open details"
            style={{
              padding: '0.3rem 0.65rem', background: '#eff6ff', color: '#1e40af',
              border: 'none', borderRadius: '0.4rem', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: 600,
            }}
          >View</button>
        </div>
      </Td>
    </tr>
  );
}

// ============================================
// DETAIL DRAWER
// ============================================
function DetailDrawer({ preauth, onClose, onDecide }) {
  const [action, setAction] = useState(null); // 'approve' | 'reject' | 'query' | null
  const [approvedAmount, setApprovedAmount] = useState(preauth.requestedAmount);
  const [note, setNote] = useState('');
  const [queryMessage, setQueryMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const sla = computeSLA(preauth);
  const slaColor = { breached: '#ef4444', warning: '#f59e0b', ok: '#10b981' }[sla?.state] || '#94a3b8';

  const submit = async () => {
    if (!action) return;
    setBusy(true);
    const extra = {};
    if (action === 'approve') extra.approvedAmount = Number(approvedAmount) || preauth.requestedAmount;
    if (action === 'approve' || action === 'reject') extra.note = note.trim();
    if (action === 'query') extra.queryMessage = queryMessage.trim() || 'Please provide additional documents';
    await onDecide(preauth._id, action, extra);
    setBusy(false);
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 1000,
      display: 'flex', justifyContent: 'flex-end',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'white', width: '100%', maxWidth: '620px', height: '100%',
        overflowY: 'auto', boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                {preauth.preAuthNumber}
              </span>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                background: `${slaColor}1A`, color: slaColor, borderRadius: '999px',
              }}>
                {sla?.label}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {preauth.admissionType === 'emergency' ? '🚑 Emergency' : '📅 Planned'} • Submitted {fmtDateTime(preauth.submittedAt)}
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '0.5rem', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', flex: 1 }}>
          <Section title="Patient">
            <Field label="Name" value={preauth.userId?.name} />
            <Field label="Phone" value={preauth.userId?.phone} />
            <Field label="Email" value={preauth.userId?.email} />
          </Section>

          <Section title="Policy">
            <Field label="Policy Number" value={preauth.policyId?.policyNumber} mono />
            <Field label="Plan" value={preauth.policyId?.policyName} />
            <Field label="Sum Insured" value={inr(preauth.policyId?.sumInsured)} />
            <Field label="Ends On" value={fmtDate(preauth.policyId?.endDate)} />
          </Section>

          <Section title="Hospital & Admission">
            <Field label="Hospital" value={preauth.hospitalName} />
            <Field label="Address" value={preauth.hospitalAddress} />
            <Field label="Admission Date" value={fmtDate(preauth.admissionDate)} />
            <Field label="Admission Type" value={preauth.admissionType === 'emergency' ? '🚑 Emergency' : '📅 Planned'} />
          </Section>

          <Section title="Medical Details">
            <Field label="Diagnosis" value={preauth.diagnosis} />
            <Field label="Treatment" value={preauth.treatment} />
            <Field label="Estimated Cost" value={inr(preauth.estimatedCost)} />
            <Field label="Requested Amount" value={<strong style={{ fontSize: '1.05rem', color: '#1565C0' }}>{inr(preauth.requestedAmount)}</strong>} />
          </Section>

          {preauth.documents && preauth.documents.length > 0 && (
            <Section title={`Documents (${preauth.documents.length})`}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {preauth.documents.map((doc, i) => {
                  const url = typeof doc === 'string' ? doc : (doc.url || doc.fileUrl);
                  if (!url) return null;
                  return (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      style={{ padding: '0.4rem 0.75rem', background: '#eff6ff', color: '#1e40af', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                      📎 Document {i + 1}
                    </a>
                  );
                })}
              </div>
            </Section>
          )}

          {preauth.queryMessage && (
            <Section title="Previous Query">
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.85rem', color: '#9a3412' }}>
                <strong>Insurer asked:</strong> {preauth.queryMessage}
                {preauth.queryResponse && (
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #fdba74', color: '#c2410c' }}>
                    <strong>Patient replied:</strong> {preauth.queryResponse}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* DECISION PANEL */}
          {['submitted', 'under_review', 'query_raised'].includes(preauth.status) && (
            <Section title="Take Action">
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {[
                  { id: 'approve', label: '✅ Approve', color: '#10b981' },
                  { id: 'query',   label: '❓ Ask Query', color: '#f59e0b' },
                  { id: 'reject',  label: '❌ Reject', color: '#ef4444' },
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAction(a.id)}
                    style={{
                      flex: 1, padding: '0.6rem 0.75rem',
                      background: action === a.id ? a.color : '#f1f5f9',
                      color: action === a.id ? 'white' : '#475569',
                      border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.8rem',
                    }}
                  >{a.label}</button>
                ))}
              </div>

              {action === 'approve' && (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>Approved Amount (₹)</label>
                    <input type="number" value={approvedAmount} onChange={(e) => setApprovedAmount(e.target.value)}
                      style={inputStyle} />
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      Defaults to requested amount: {inr(preauth.requestedAmount)}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Note (optional)</label>
                    <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)}
                      placeholder="Any note for the patient…" style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                </div>
              )}

              {action === 'reject' && (
                <div>
                  <label style={labelStyle}>Rejection Reason *</label>
                  <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Not eligible for cashless at this hospital…" style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              )}

              {action === 'query' && (
                <div>
                  <label style={labelStyle}>Query Message *</label>
                  <textarea rows={3} value={queryMessage} onChange={(e) => setQueryMessage(e.target.value)}
                    placeholder="e.g. Please upload discharge summary and pre-op reports…" style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              )}

              {action && (
                <button
                  onClick={submit}
                  disabled={busy || (action === 'reject' && !note.trim()) || (action === 'query' && !queryMessage.trim())}
                  style={{
                    marginTop: '1rem', width: '100%',
                    padding: '0.7rem 1rem',
                    background: busy ? '#94a3b8' : ({ approve: '#10b981', reject: '#ef4444', query: '#f59e0b' }[action]),
                    color: 'white', border: 'none', borderRadius: '0.5rem',
                    cursor: busy ? 'not-allowed' : 'pointer',
                    fontWeight: 800, fontSize: '0.9rem',
                  }}
                >
                  {busy ? 'Processing…' : (
                    action === 'approve' ? `✅ Approve ${inr(approvedAmount)}` :
                    action === 'reject' ? '❌ Reject Pre-Auth' :
                    '❓ Send Query'
                  )}
                </button>
              )}
            </Section>
          )}
        </div>
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

const Th = ({ children, align = 'left', width }) => (
  <th style={{
    padding: '0.7rem 0.9rem', textAlign: align,
    fontSize: '0.7rem', fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.04em',
    background: '#f8fafc', borderBottom: '2px solid #e2e8f0',
    width,
  }}>{children}</th>
);

const Td = ({ children, align = 'left' }) => (
  <td style={{ padding: '0.7rem 0.9rem', textAlign: align, fontSize: '0.85rem', color: '#1e293b', verticalAlign: 'middle' }}>
    {children}
  </td>
);

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '1.25rem' }}>
    <h4 style={{ margin: 0, marginBottom: '0.65rem', fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h4>
    {children}
  </div>
);

const Field = ({ label, value, mono }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', gap: '1rem' }}>
    <span style={{ color: '#64748b' }}>{label}</span>
    <span style={{ fontWeight: 600, color: '#1e293b', fontFamily: mono ? 'monospace' : 'inherit', textAlign: 'right', wordBreak: 'break-word' }}>{value || '—'}</span>
  </div>
);

const Empty = ({ msg }) => (
  <div style={{ background: 'white', borderRadius: '0.85rem', padding: '3rem', textAlign: 'center', color: '#94a3b8', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>{msg}</div>
  </div>
);

const inputStyle = {
  width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0',
  borderRadius: '0.5rem', fontSize: '0.9rem', background: 'white',
};
const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' };