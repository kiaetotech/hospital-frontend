// D:\hospital-frontend\src\pages\insurance\InsurerClaimTriage.jsx
// ============================================
// AI CLAIM TRIAGE
// Auto-scores claims by fraud risk + urgency
// Rule-based engine (AI integration ready)
// ============================================

import React, { useEffect, useState, useMemo } from 'react';
import { insuranceApi } from '../../services/providerApi';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

// ============================================
// HEURISTIC SCORING
// Runs client-side. Mirrors market-standard fraud rules.
// ============================================
function scoreClaim(claim) {
  let riskScore = 0;
  const flags = [];

  const amt = Number(claim.amount || 0);
  const sumInsured = Number(claim.policyId?.sumInsured || 0);

  // Rule 1: High claim relative to sum insured
  if (sumInsured > 0) {
    const pct = (amt / sumInsured) * 100;
    if (pct > 80) {
      riskScore += 30;
      flags.push({ level: 'high', msg: `Claim is ${Math.round(pct)}% of sum insured` });
    } else if (pct > 50) {
      riskScore += 15;
      flags.push({ level: 'medium', msg: `Claim is ${Math.round(pct)}% of sum insured` });
    }
  }

  // Rule 2: Filed too soon after policy start
  const policyStart = claim.policyId?.startDate ? new Date(claim.policyId.startDate) : null;
  const filed = claim.createdAt ? new Date(claim.createdAt) : null;
  if (policyStart && filed) {
    const days = Math.floor((filed - policyStart) / (1000 * 60 * 60 * 24));
    if (days < 30) {
      riskScore += 25;
      flags.push({ level: 'high', msg: `Filed only ${days} days after policy start` });
    } else if (days < 90) {
      riskScore += 10;
      flags.push({ level: 'medium', msg: `Filed ${days} days after policy start` });
    }
  }

  // Rule 3: No supporting documents
  if (!claim.documents || claim.documents.length === 0) {
    riskScore += 25;
    flags.push({ level: 'high', msg: 'No supporting documents attached' });
  } else if (claim.documents.length < 2) {
    riskScore += 10;
    flags.push({ level: 'medium', msg: 'Only one document attached' });
  }

  // Rule 4: Round-number amount (a known fraud indicator)
  if (amt > 0 && amt % 10000 === 0) {
    riskScore += 8;
    flags.push({ level: 'low', msg: 'Suspiciously round amount' });
  }

  // Rule 5: Weekend / holiday filing
  if (filed && (filed.getDay() === 0 || filed.getDay() === 6)) {
    riskScore += 5;
    flags.push({ level: 'low', msg: 'Filed on weekend' });
  }

  // Rule 6: Very high value (>5L) needs senior review regardless
  if (amt > 500000) {
    riskScore += 15;
    flags.push({ level: 'high', msg: 'High-value claim needs senior review' });
  }

  // Urgency (independent of risk)
  let urgency = 'normal';
  if (amt > 500000) urgency = 'critical';
  else if (amt > 100000) urgency = 'high';
  else if (amt > 25000) urgency = 'medium';

  // Ageing increases urgency
  const ageHours = filed ? Math.round((Date.now() - filed.getTime()) / (1000 * 60 * 60)) : 0;
  if (ageHours > 48 && urgency !== 'critical') urgency = 'high';
  if (ageHours > 120) urgency = 'critical';

  return {
    riskScore: Math.min(100, riskScore),
    riskLevel: riskScore >= 60 ? 'high' : riskScore >= 30 ? 'medium' : 'low',
    flags,
    urgency,
    ageHours,
  };
}

// ============================================
// MAIN
// ============================================
export default function InsurerClaimTriage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await insuranceApi.getClaims({ limit: 100 });
      setClaims(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Score all
  const scored = useMemo(() => claims.map((c) => ({ ...c, _triage: scoreClaim(c) })), [claims]);

  const filtered = useMemo(() => {
    let list = scored;

    if (filter === 'pending') {
      list = list.filter((c) => ['submitted', 'under_review', 'pending_verification'].includes(c.status));
    } else if (filter === 'high_risk') {
      list = list.filter((c) => c._triage.riskLevel === 'high');
    } else if (filter === 'urgent') {
      list = list.filter((c) => ['critical', 'high'].includes(c._triage.urgency));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        `${c.claimNumber} ${c.policyId?.policyNumber} ${c.userId?.name}`.toLowerCase().includes(q)
      );
    }

    // Sort: highest risk first, then urgency, then age
    const urgencyRank = { critical: 4, high: 3, medium: 2, normal: 1 };
    return [...list].sort((a, b) => {
      if (b._triage.riskScore !== a._triage.riskScore) return b._triage.riskScore - a._triage.riskScore;
      if (urgencyRank[b._triage.urgency] !== urgencyRank[a._triage.urgency]) return urgencyRank[b._triage.urgency] - urgencyRank[a._triage.urgency];
      return b._triage.ageHours - a._triage.ageHours;
    });
  }, [scored, filter, search]);

  const stats = useMemo(() => {
    const pending = scored.filter((c) => ['submitted', 'under_review', 'pending_verification'].includes(c.status));
    const highRisk = pending.filter((c) => c._triage.riskLevel === 'high').length;
    const critical = pending.filter((c) => c._triage.urgency === 'critical').length;
    const avgRisk = pending.length > 0 ? Math.round(pending.reduce((s, c) => s + c._triage.riskScore, 0) / pending.length) : 0;
    const totalAmount = pending.reduce((s, c) => s + Number(c.amount || 0), 0);
    return { pending: pending.length, highRisk, critical, avgRisk, totalAmount };
  }, [scored]);

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
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🤖 AI Claim Triage
          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', background: '#eff6ff', color: '#1e40af', borderRadius: '999px' }}>
            BETA
          </span>
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
          Auto-scored by fraud risk + urgency • Rules engine (AI integration ready)
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <Kpi label="Pending Claims" value={stats.pending} accent="#1565C0" icon="⏳" />
        <Kpi label="High Risk" value={stats.highRisk} accent="#ef4444" icon="🚨" sub="manual review needed" />
        <Kpi label="Critical Urgency" value={stats.critical} accent="#f59e0b" icon="⚡" sub="SLA breach imminent" />
        <Kpi label="Avg Risk Score" value={`${stats.avgRisk}/100`} accent="#8b5cf6" icon="📊" />
        <Kpi label="Amount at Risk" value={inr(stats.totalAmount)} accent="#06b6d4" icon="💰" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="🔍 Search claim no, policy, patient…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '240px', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.85rem' }}
        />
        {[
          { id: 'pending',   label: '⏳ Pending' },
          { id: 'high_risk', label: '🚨 High Risk' },
          { id: 'urgent',    label: '⚡ Urgent' },
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

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading claims…</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '0.85rem', padding: '3rem', textAlign: 'center', color: '#94a3b8', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>No claims match this filter</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filtered.map((c) => (
            <ClaimCard key={c._id} claim={c} onClick={() => setSelected(c)} />
          ))}
        </div>
      )}

      {/* Info footer */}
      <div style={{
        marginTop: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: '0.75rem', padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6,
      }}>
        <strong style={{ color: '#0f172a' }}>🤖 How AI Triage works</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>Scores each claim from 0–100 based on 6 fraud/risk indicators.</li>
          <li>Classifies urgency: normal → medium → high → critical.</li>
          <li>Surfaces top flags so you decide in seconds, not minutes.</li>
          <li>Risk thresholds: <strong>60+ = high risk</strong> (escalate), <strong>30–59 = medium</strong> (verify), <strong>&lt;30 = low</strong> (auto-approve eligible).</li>
        </ul>
      </div>

      {/* Detail drawer */}
      {selected && (
        <DetailDrawer
          claim={selected}
          onClose={() => setSelected(null)}
          onUpdated={load}
          notify={notify}
        />
      )}
    </div>
  );
}

// ============================================
// CLAIM CARD
// ============================================
function ClaimCard({ claim, onClick }) {
  const t = claim._triage;
  const riskColor = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }[t.riskLevel];
  const urgColor = { critical: '#ef4444', high: '#f59e0b', medium: '#1565C0', normal: '#10b981' }[t.urgency];

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white', borderRadius: '0.85rem', padding: '1.1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderLeft: `4px solid ${riskColor}`,
        cursor: 'pointer', transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
              {claim.claimNumber || claim.claimId || 'Claim'}
            </span>
            <span style={{
              padding: '0.15rem 0.5rem', borderRadius: '999px',
              background: `${riskColor}1A`, color: riskColor,
              fontSize: '0.7rem', fontWeight: 700,
            }}>
              Risk {t.riskScore}
            </span>
            <span style={{
              padding: '0.15rem 0.5rem', borderRadius: '999px',
              background: `${urgColor}1A`, color: urgColor,
              fontSize: '0.7rem', fontWeight: 700,
              textTransform: 'uppercase',
            }}>
              {t.urgency}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              {t.ageHours}h old
            </span>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.35rem' }}>
            <strong>{inr(claim.amount)}</strong>
            {claim.policyId?.policyNumber && <span> • Policy {claim.policyId.policyNumber}</span>}
            {claim.userId?.name && <span> • {claim.userId.name}</span>}
          </div>

          {t.flags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
              {t.flags.slice(0, 3).map((f, i) => (
                <span key={i} style={{
                  fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '999px',
                  background: f.level === 'high' ? '#fee2e2' : f.level === 'medium' ? '#fef3c7' : '#f1f5f9',
                  color: f.level === 'high' ? '#991b1b' : f.level === 'medium' ? '#92400e' : '#475569',
                }}>
                  {f.level === 'high' ? '🚩' : f.level === 'medium' ? '⚠️' : '•'} {f.msg}
                </span>
              ))}
              {t.flags.length > 3 && (
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>+{t.flags.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Submitted</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{fmtDateTime(claim.createdAt)}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DETAIL DRAWER
// ============================================
function DetailDrawer({ claim, onClose, onUpdated, notify }) {
  const t = claim._triage;
  const [busy, setBusy] = useState(false);

  const act = async (status, note) => {
    setBusy(true);
    try {
      await insuranceApi.updateClaimStatus(claim._id, { status, note });
      notify(`Claim marked ${status}`);
      onUpdated && onUpdated();
      onClose();
    } catch (e) {
      notify(e.response?.data?.message || 'Failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 1000,
      display: 'flex', justifyContent: 'flex-end',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'white', width: '100%', maxWidth: '560px', height: '100%',
        overflowY: 'auto', boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>🤖 AI Triage Analysis</h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem', fontFamily: 'monospace' }}>
              {claim.claimNumber || claim.claimId}
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '0.5rem', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', flex: 1 }}>
          <Section title="Claim">
            <Field label="Claim ID" value={claim.claimNumber || claim.claimId} mono />
            <Field label="Amount" value={<strong>{inr(claim.amount)}</strong>} />
            <Field label="Policy" value={claim.policyId?.policyNumber} />
            <Field label="Patient" value={claim.userId?.name} />
            <Field label="Hospital" value={claim.hospitalName} />
            <Field label="Status" value={String(claim.status || '').replace(/_/g, ' ')} />
            <Field label="Age" value={`${t.ageHours} hours`} />
          </Section>

          <Section title="Risk Assessment">
            <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1rem' }}>
              <Gauge label="Risk Score" value={t.riskScore} max={100}
                color={t.riskLevel === 'high' ? '#ef4444' : t.riskLevel === 'medium' ? '#f59e0b' : '#10b981'} />
              <Gauge label="Urgency" value={{ critical: 100, high: 75, medium: 50, normal: 25 }[t.urgency] || 25} max={100}
                color={t.urgency === 'critical' ? '#ef4444' : t.urgency === 'high' ? '#f59e0b' : '#1565C0'} />
            </div>
          </Section>

          <Section title={`Detected Flags (${t.flags.length})`}>
            {t.flags.length === 0 ? (
              <div style={{ padding: '0.85rem', background: '#dcfce7', color: '#166534', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                ✅ No red flags detected — safe for standard approval
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {t.flags.map((f, i) => (
                  <div key={i} style={{
                    padding: '0.7rem 0.85rem', borderRadius: '0.5rem',
                    background: f.level === 'high' ? '#fee2e2' : f.level === 'medium' ? '#fef3c7' : '#f1f5f9',
                    color: f.level === 'high' ? '#991b1b' : f.level === 'medium' ? '#92400e' : '#475569',
                    fontSize: '0.85rem', fontWeight: 600,
                    borderLeft: `3px solid ${f.level === 'high' ? '#dc2626' : f.level === 'medium' ? '#f59e0b' : '#94a3b8'}`,
                  }}>
                    {f.level === 'high' ? '🚩 ' : f.level === 'medium' ? '⚠️ ' : '• '}{f.msg}
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Recommended Action">
            <div style={{
              padding: '0.9rem 1rem', background: t.riskLevel === 'high' ? '#fef2f2' : t.riskLevel === 'medium' ? '#fffbeb' : '#f0fdf4',
              color: t.riskLevel === 'high' ? '#991b1b' : t.riskLevel === 'medium' ? '#92400e' : '#166534',
              borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.6,
              borderLeft: `3px solid ${t.riskLevel === 'high' ? '#dc2626' : t.riskLevel === 'medium' ? '#f59e0b' : '#10b981'}`,
            }}>
              {t.riskLevel === 'high'
                ? '🚨 Escalate to senior underwriter. Request additional documents. Consider field investigation.'
                : t.riskLevel === 'medium'
                ? '⚠️ Verify hospital records. Request supporting documents before approving.'
                : '✅ Low risk. Proceed with standard approval flow.'}
            </div>
          </Section>

          {/* Quick actions */}
          {['submitted', 'under_review', 'pending_verification'].includes(claim.status) && (
            <Section title="Quick Actions">
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <button
                  onClick={() => act('approved', `AI Triage: ${t.riskLevel} risk, score ${t.riskScore}`)}
                  disabled={busy}
                  style={{ padding: '0.65rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: busy ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                >✅ Approve Claim</button>
                <button
                  onClick={() => act('under_review', 'Escalated for senior review')}
                  disabled={busy}
                  style={{ padding: '0.65rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: busy ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                >⚠️ Escalate for Review</button>
                <button
                  onClick={() => act('rejected', 'AI Triage: high risk — rejected')}
                  disabled={busy}
                  style={{ padding: '0.65rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: busy ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                >❌ Reject Claim</button>
              </div>
            </Section>
          )}

          <Section title="AI Backend Status">
            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6 }}>
              Scoring is currently <strong>rule-based</strong> (heuristics). To enable full AI scoring (LLM-based document + narrative analysis), wire the existing{' '}
              <code style={{ background: '#e2e8f0', padding: '0.1rem 0.35rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                ai-core/agents/business/InsuranceAgent.js
              </code>{' '}
              to a new backend endpoint.
            </div>
          </Section>
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

const Gauge = ({ label, value, max, color }) => {
  const pct = (value / max) * 100;
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: '0.35rem' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color, lineHeight: 1, marginBottom: '0.35rem' }}>
        {value}<span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/{max}</span>
      </div>
      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 0.5s' }} />
      </div>
    </div>
  );
};