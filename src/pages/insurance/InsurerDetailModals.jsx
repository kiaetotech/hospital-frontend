// D:\hospital-frontend\src\pages\insurance\InsurerDetailModals.jsx
// ============================================
// INSURER DETAIL MODALS
// PolicyDetailModal • ClaimDetailModal
// ============================================
// Self-contained. No external deps beyond React.
// Both modals are controlled by parent via `open`, `onClose`.

import React, { useEffect, useState } from 'react';

// ============================================
// PDF download helper — fetches with auth and triggers browser download
// ============================================
const downloadPdf = async (url, filename) => {
  try {
    const token = localStorage.getItem('providerToken');
    const API = process.env.REACT_APP_API_URL || 'https://hospital-backend-ilhi.onrender.com';
    const r = await fetch(`${API}${url}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      alert(err.message || 'Failed to download PDF');
      return;
    }
    const blob = await r.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (e) {
    alert('Download failed: ' + e.message);
  }
};

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtDate = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const fmtDateOnly = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

// ============================================
// SHARED
// ============================================
const Backdrop = ({ children, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.55)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: 'white',
        borderRadius: '1rem',
        width: '100%',
        maxWidth: '780px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
      }}
    >
      {children}
    </div>
  </div>
);

const Header = ({ icon, title, subtitle, onClose, badge }) => (
  <div style={{
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
  }}>
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <span style={{ fontSize: '1.75rem' }}>{icon}</span>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{title}</h2>
        {subtitle && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>{subtitle}</div>}
      </div>
      {badge}
    </div>
    <button
      onClick={onClose}
      style={{
        background: '#f1f5f9',
        border: 'none',
        borderRadius: '0.5rem',
        width: '32px',
        height: '32px',
        cursor: 'pointer',
        fontSize: '1rem',
        color: '#475569',
      }}
      aria-label="Close"
    >
      ✕
    </button>
  </div>
);

const Body = ({ children }) => (
  <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>{children}</div>
);

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '1.25rem' }}>
    <h3 style={{
      fontSize: '0.75rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#64748b',
      marginBottom: '0.65rem',
    }}>{title}</h3>
    {children}
  </div>
);

const Grid = ({ children, cols = 2 }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gap: '0.75rem 1.25rem',
  }}>{children}</div>
);

const Field = ({ label, value, mono }) => (
  <div>
    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>{label}</div>
    <div style={{ fontSize: '0.9rem', color: '#1e293b', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-word' }}>
      {value ?? '—'}
    </div>
  </div>
);

const StatusPill = ({ status }) => {
  const palette = {
    active:            { bg: '#dcfce7', color: '#166534' },
    approved:          { bg: '#dcfce7', color: '#166534' },
    settled:           { bg: '#dcfce7', color: '#166534' },
    completed:         { bg: '#dcfce7', color: '#166534' },
    verified:          { bg: '#dcfce7', color: '#166534' },
    pending:           { bg: '#fef3c7', color: '#92400e' },
    submitted:         { bg: '#fef3c7', color: '#92400e' },
    under_review:      { bg: '#dbeafe', color: '#1e40af' },
    pending_verification: { bg: '#dbeafe', color: '#1e40af' },
    document_uploaded: { bg: '#dbeafe', color: '#1e40af' },
    rejected:          { bg: '#fee2e2', color: '#991b1b' },
    cancelled:         { bg: '#f1f5f9', color: '#475569' },
    expired:           { bg: '#f1f5f9', color: '#475569' },
    partially_settled: { bg: '#ede9fe', color: '#5b21b6' },
    suspended:         { bg: '#fee2e2', color: '#991b1b' },
    inactive:          { bg: '#f1f5f9', color: '#475569' },
  }[status] || { bg: '#f1f5f9', color: '#475569' };

  return (
    <span style={{
      padding: '0.25rem 0.65rem',
      borderRadius: '999px',
      fontSize: '0.7rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
      background: palette.bg,
      color: palette.color,
    }}>{String(status || '').replace(/_/g, ' ')}</span>
  );
};

// ============================================
// POLICY DETAIL MODAL
// ============================================
export function PolicyDetailModal({ open, onClose, policy, insurerHeaders }) {
  const [fullPolicy, setFullPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !policy) return;
    // If the row already has full data (unlikely from list), use it. Otherwise fetch details.
    const hasDetails = policy.planId && typeof policy.planId === 'object' && policy.planId.planName;
    if (hasDetails) { setFullPolicy(policy); return; }

    const load = async () => {
      setLoading(true); setError('');
      try {
        const API = process.env.REACT_APP_API_URL || 'https://hospital-backend-ilhi.onrender.com';
        const token = localStorage.getItem('providerToken');
        const r = await fetch(`${API}/api/insurance/company/policies/${policy._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await r.json();
        if (d.success) setFullPolicy(d.data);
        else setError(d.message || 'Failed to load policy');
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    load();
  }, [open, policy]);

  if (!open || !policy) return null;

  const p = fullPolicy || policy;

  return (
    <Backdrop onClose={onClose}>
      <Header
        icon="📄"
        title={p.policyNumber || 'Policy Details'}
        subtitle={p.policyName || p.planName || 'Insurance Policy'}
        onClose={onClose}
        badge={<StatusPill status={p.status} />}
      />
      <Body>
        {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading policy details…</div>}
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}

        {!loading && (
          <>
            <Section title="Policy">
              <Grid>
                <Field label="Policy Number" value={p.policyNumber} mono />
                <Field label="Status" value={<StatusPill status={p.status} />} />
                <Field label="Plan" value={p.planName || p.planId?.planName || '—'} />
                <Field label="Plan Type" value={p.planType || p.planId?.planType || '—'} />
                <Field label="Sum Insured" value={inr(p.sumInsured)} />
                <Field label="Premium Paid" value={inr(p.premiumAmount)} />
                <Field label="Start Date" value={fmtDateOnly(p.startDate)} />
                <Field label="End Date" value={fmtDateOnly(p.endDate)} />
              </Grid>
            </Section>

            <Section title="Customer">
              <Grid>
                <Field label="Name" value={p.primaryInsured?.name || p.userId?.name} />
                <Field label="Email" value={p.primaryInsured?.email || p.userId?.email} />
                <Field label="Phone" value={p.primaryInsured?.phone || p.userId?.phone} />
                <Field label="Age" value={p.primaryInsured?.age} />
                <Field label="Gender" value={p.primaryInsured?.gender} />
                <Field label="Address" value={p.primaryInsured?.address || p.userId?.address} />
              </Grid>
            </Section>

            {(p.nominee?.name || p.nominee?.relation) && (
              <Section title="Nominee">
                <Grid>
                  <Field label="Name" value={p.nominee?.name} />
                  <Field label="Relation" value={p.nominee?.relation} />
                  <Field label="Phone" value={p.nominee?.phone} />
                </Grid>
              </Section>
            )}

            <Section title="Policy Meta">
              <Grid>
                <Field label="Created" value={fmtDate(p.createdAt)} />
                <Field label="Last Updated" value={fmtDate(p.updatedAt)} />
                <Field label="Policy ID" value={p._id} mono />
              </Grid>
            </Section>
          </>
        )}
      </Body>

      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', background: '#f8fafc' }}>
        <button
          onClick={() => {
            const rows = [
              ['Field', 'Value'],
              ['Policy Number', p.policyNumber || ''],
              ['Status', p.status || ''],
              ['Plan', p.planName || p.planId?.planName || ''],
              ['Sum Insured', p.sumInsured || ''],
              ['Premium', p.premiumAmount || ''],
              ['Customer', p.primaryInsured?.name || p.userId?.name || ''],
              ['Email', p.primaryInsured?.email || p.userId?.email || ''],
              ['Phone', p.primaryInsured?.phone || p.userId?.phone || ''],
              ['Start Date', fmtDateOnly(p.startDate)],
              ['End Date', fmtDateOnly(p.endDate)],
            ];
            const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `${p.policyNumber || 'policy'}.csv`; a.click();
            URL.revokeObjectURL(url);
          }}
                    style={{ padding: '0.55rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >⬇️ Export CSV</button>
        <button
          onClick={() => downloadPdf(`/api/insurance/company/policies/${p._id}/pdf`, `${p.policyNumber || 'policy'}.pdf`)}
          style={{ padding: '0.55rem 1rem', background: '#1565C0', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >📄 Download PDF</button>
        <button
          onClick={onClose}
          style={{ padding: '0.55rem 1rem', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >Close</button>
      </div>
    </Backdrop>
  );
}

// ============================================
// CLAIM DETAIL MODAL
// ============================================
export function ClaimDetailModal({ open, onClose, claim, onStatusChange }) {
  const [fullClaim, setFullClaim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionStatus, setActionStatus] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [actionAmount, setActionAmount] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!open || !claim) return;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const API = process.env.REACT_APP_API_URL || 'https://hospital-backend-ilhi.onrender.com';
        const token = localStorage.getItem('providerToken');
        const r = await fetch(`${API}/api/insurance/company/claims/${claim._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await r.json();
        if (d.success) setFullClaim(d.data);
        else setError(d.message || 'Failed to load claim');
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    load();
    setActionStatus('');
    setActionNote('');
    setActionAmount('');
  }, [open, claim]);

  if (!open || !claim) return null;

  const c = fullClaim || claim;

  const doUpdate = async (status) => {
    setUpdating(true);
    try {
      const API = process.env.REACT_APP_API_URL || 'https://hospital-backend-ilhi.onrender.com';
      const token = localStorage.getItem('providerToken');
      const body = { status };
      if (actionNote.trim()) body.note = actionNote.trim();
      if (actionAmount && !Number.isNaN(Number(actionAmount))) body.amount = Number(actionAmount);

      const r = await fetch(`${API}/api/insurance/company/claims/${c._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.success) {
        if (onStatusChange) onStatusChange();
        onClose();
      } else {
        setError(d.message || 'Failed to update');
      }
    } catch (e) { setError(e.message); }
    finally { setUpdating(false); }
  };

  const timeline = c.timeline || c.statusHistory || [];

  return (
    <Backdrop onClose={onClose}>
      <Header
        icon="📋"
        title={c.claimNumber || c.claimId || 'Claim Details'}
        subtitle={`Policy: ${c.policyId?.policyNumber || c.policyNumber || '—'}`}
        onClose={onClose}
        badge={<StatusPill status={c.status} />}
      />
      <Body>
        {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading claim details…</div>}
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}

        {!loading && (
          <>
            <Section title="Claim">
              <Grid>
                <Field label="Claim Number" value={c.claimNumber || c.claimId} mono />
                <Field label="Status" value={<StatusPill status={c.status} />} />
                <Field label="Claim Amount" value={inr(c.amount)} />
                <Field label="Approved Amount" value={c.approvedAmount ? inr(c.approvedAmount) : '—'} />
                <Field label="Settled Amount" value={c.settlementAmount ? inr(c.settlementAmount) : '—'} />
                <Field label="Submitted" value={fmtDate(c.createdAt)} />
              </Grid>
            </Section>

            <Section title="Customer">
              <Grid>
                <Field label="Name" value={c.userId?.name} />
                <Field label="Email" value={c.userId?.email} />
                <Field label="Phone" value={c.userId?.phone} />
              </Grid>
            </Section>

            {c.description && (
              <Section title="Reason / Description">
                <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.85rem', fontSize: '0.9rem', color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                  {c.description}
                </div>
              </Section>
            )}

            {c.documents && c.documents.length > 0 && (
              <Section title={`Documents (${c.documents.length})`}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {c.documents.map((doc, i) => {
                    const url = typeof doc === 'string' ? doc : (doc.url || doc.fileUrl);
                    const name = typeof doc === 'string' ? `Document ${i + 1}` : (doc.name || doc.label || `Document ${i + 1}`);
                    if (!url) return null;
                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: '0.4rem 0.75rem', background: '#eff6ff', color: '#1e40af', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}
                      >📎 {name} ↗</a>
                    );
                  })}
                </div>
              </Section>
            )}

            {timeline.length > 0 && (
              <Section title="Timeline">
                <div style={{ position: 'relative', paddingLeft: '1.25rem' }}>
                  <div style={{ position: 'absolute', left: '6px', top: '8px', bottom: '8px', width: '2px', background: '#e2e8f0' }} />
                  {timeline.slice().reverse().map((t, i) => (
                    <div key={i} style={{ position: 'relative', marginBottom: '0.85rem' }}>
                      <div style={{ position: 'absolute', left: '-1.25rem', top: '4px', width: '14px', height: '14px', borderRadius: '50%', background: '#2563eb', border: '3px solid white', boxShadow: '0 0 0 2px #dbeafe' }} />
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                        {String(t.status || '').replace(/_/g, ' ')}
                      </div>
                      {t.note && <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.15rem' }}>{t.note}</div>}
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>{fmtDate(t.at || t.createdAt || t.timestamp)}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {!['settled', 'rejected', 'cancelled', 'partially_settled'].includes(c.status) && (
              <Section title="Take Action">
                <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>New Status</div>
                      <select
                        value={actionStatus}
                        onChange={(e) => setActionStatus(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.9rem', background: 'white' }}
                      >
                        <option value="">— choose status —</option>
                        <option value="under_review">Under Review</option>
                        <option value="pending_verification">Pending Verification</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="settled">Settled</option>
                        <option value="partially_settled">Partially Settled</option>
                      </select>
                    </div>

                    {['approved', 'settled', 'partially_settled'].includes(actionStatus) && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Amount (₹) — optional, defaults to claim amount</div>
                        <input
                          type="number"
                          value={actionAmount}
                          onChange={(e) => setActionAmount(e.target.value)}
                          placeholder={String(c.amount || '')}
                          style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.9rem' }}
                        />
                      </div>
                    )}

                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Note (visible to customer)</div>
                      <textarea
                        value={actionNote}
                        onChange={(e) => setActionNote(e.target.value)}
                        rows={2}
                        placeholder="Optional note about this decision…"
                        style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.9rem', resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        disabled={!actionStatus || updating}
                        onClick={() => doUpdate(actionStatus)}
                        style={{
                          padding: '0.6rem 1.25rem',
                          background: !actionStatus || updating ? '#94a3b8' : '#2563eb',
                          color: 'white', border: 'none', borderRadius: '0.5rem',
                          cursor: !actionStatus || updating ? 'not-allowed' : 'pointer',
                          fontWeight: 700, fontSize: '0.85rem',
                        }}
                      >{updating ? 'Saving…' : 'Apply Update'}</button>
                    </div>
                  </div>
                </div>
              </Section>
            )}

            <Section title="Meta">
              <Grid>
                <Field label="Claim ID" value={c._id} mono />
                <Field label="Last Updated" value={fmtDate(c.updatedAt)} />
              </Grid>
            </Section>
          </>
        )}
      </Body>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', background: '#f8fafc' }}>
        <button
          onClick={() => downloadPdf(`/api/insurance/company/claims/${c._id}/settlement-receipt`, `settlement-${c.claimNumber || c._id}.pdf`)}
          style={{ padding: '0.55rem 1rem', background: '#1565C0', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >📄 Settlement PDF</button>
        <button
          onClick={onClose}
          style={{ padding: '0.55rem 1rem', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >Close</button>
      </div>
    </Backdrop>
  );
}