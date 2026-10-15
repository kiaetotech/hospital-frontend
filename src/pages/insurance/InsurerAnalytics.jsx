// D:\hospital-frontend\src\pages\insurance\InsurerAnalytics.jsx
// ============================================
// INSURER ANALYTICS TAB
// Charts, funnel, claim ratio, top plans
// Uses Recharts (already installed in project)
// ============================================

import React, { useEffect, useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-e2cf.up.railway.app';

const COLORS = ['#1565C0', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const inrShort = (n) => {
  const v = Number(n || 0);
  if (v >= 10000000) return '₹' + (v / 10000000).toFixed(2) + 'Cr';
  if (v >= 100000) return '₹' + (v / 100000).toFixed(2) + 'L';
  if (v >= 1000) return '₹' + (v / 1000).toFixed(1) + 'K';
  return '₹' + v;
};

// ============================================
// MAIN
// ============================================
export default function InsurerAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [plans, setPlans] = useState([]);
  const [policies, setPolicies] = useState([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('providerToken') : null;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const h = { Authorization: `Bearer ${token}` };

        const [dashRes, plansRes, polRes] = await Promise.all([
          fetch(`${API_BASE}/api/insurance/company/dashboard`, { headers: h }).then(r => r.json()),
          fetch(`${API_BASE}/api/insurance/company/plans?limit=100`, { headers: h }).then(r => r.json()),
          fetch(`${API_BASE}/api/insurance/company/policies?limit=100`, { headers: h }).then(r => r.json()),
        ]);

        if (dashRes.success) setDashboard(dashRes.data);
        if (plansRes.success) setPlans(plansRes.data || []);
        if (polRes.success) setPolicies(polRes.data || []);
      } catch (e) {
        setError(e.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
    else setError('Not authenticated');
  }, [token]);

  // ============================================
  // DERIVED DATA
  // ============================================

  // Monthly trend: premium + claims count by month
  const monthlyTrend = useMemo(() => {
    const raw = dashboard?.monthlyData || [];
    // Build a 12-month rolling window
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1, // 1..12
        label: `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`,
        premium: 0,
        commission: 0,
        payout: 0,
        policies: 0,
      });
    }
    raw.forEach((r) => {
      const idx = months.findIndex((m) => m.year === r._id?.year && m.month === r._id?.month);
      if (idx >= 0) {
        months[idx].premium = r.premium || 0;
        months[idx].commission = r.commission || 0;
        months[idx].payout = r.payout || 0;
        months[idx].policies = r.count || 0;
      }
    });
    return months;
  }, [dashboard]);

  // Claims pie
  const claimsPie = useMemo(() => {
    const s = dashboard?.stats || {};
    return [
      { name: 'Approved',  value: s.approvedClaims || 0, color: '#1565C0' },
      { name: 'Settled',   value: s.settledClaims  || 0, color: '#10b981' },
      { name: 'Pending',   value: s.pendingClaims  || 0, color: '#f59e0b' },
      {
        name: 'Other',
        value: Math.max(0, (s.totalClaims || 0) - (s.approvedClaims || 0) - (s.settledClaims || 0) - (s.pendingClaims || 0)),
        color: '#94a3b8',
      },
    ].filter(x => x.value > 0);
  }, [dashboard]);

  // Plan type distribution
  const planTypePie = useMemo(() => {
    const counts = {};
    plans.forEach((p) => {
      const t = p.planType || p.planCategory || 'other';
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], i) => ({
      name: name.replace(/_/g, ' '),
      value,
      color: COLORS[i % COLORS.length],
    }));
  }, [plans]);

  // Claim ratio: claims amount / premium amount (approx from available data)
  const claimRatio = useMemo(() => {
    const s = dashboard?.stats || {};
    const totalPremium = s.totalPremium || 0;
    // We don't have a total claims amount in stats, so estimate using settled claims count * avg premium (rough proxy)
    // Better: use pending+approved+settled count * average policy premium (if derivable)
    const totalClaims = s.totalClaims || 0;
    if (!totalPremium || !totalClaims) return null;
    const avgPremium = totalPremium / Math.max(1, s.totalPolicies || 1);
    const approxClaimsAmt = totalClaims * avgPremium * 0.6; // 60% avg payout assumption
    return {
      premium: totalPremium,
      approxClaims: approxClaimsAmt,
      ratio: Math.min(999, (approxClaimsAmt / totalPremium) * 100),
    };
  }, [dashboard]);

  // Top plans by policy count
  const topPlans = useMemo(() => {
    if (!policies.length) return [];
    const counts = {};
    policies.forEach((p) => {
      const name = p.policyName || p.planId?.planName || p.planName || 'Unknown';
      if (!counts[name]) counts[name] = { name, count: 0, premium: 0 };
      counts[name].count += 1;
      counts[name].premium += Number(p.premiumAmount || 0);
    });
    return Object.values(counts).sort((a, b) => b.premium - a.premium).slice(0, 5);
  }, [policies]);

  // Funnel (simple derived from stats)
  const funnel = useMemo(() => {
    const s = dashboard?.stats || {};
    const policies = s.totalPolicies || 0;
    const active = s.activePolicies || 0;
    const claims = s.totalClaims || 0;
    // Approximate upstream counts (real funnel would need view/quote events — not in current backend)
    return [
      { stage: 'Plans Live', value: s.activePlans || 0 },
      { stage: 'Policies Issued', value: policies },
      { stage: 'Active Policies', value: active },
      { stage: 'Claims Filed', value: claims },
    ];
  }, [dashboard]);

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
        Loading analytics…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem' }}>
        ⚠️ {error}
      </div>
    );
  }

  const s = dashboard?.stats || {};

  return (
    <div>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem', color: '#0f172a' }}>
        📊 Analytics & Insights
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Performance overview • {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}
      </p>

      {/* KPI ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Kpi label="Total Premium" value={inr(s.totalPremium)} accent="#1565C0" icon="💰" />
        <Kpi label="Commission Earned" value={inr(s.totalCommission)} accent="#8b5cf6" icon="📈" />
        <Kpi label="Payout to Companies" value={inr(s.totalPayout)} accent="#10b981" icon="🏦" />
        <Kpi label="Active Policies" value={s.activePolicies || 0} accent="#06b6d4" icon="📄" sub={`of ${s.totalPolicies || 0} total`} />
        <Kpi label="Pending Claims" value={s.pendingClaims || 0} accent="#f59e0b" icon="⏳" sub={`of ${s.totalClaims || 0} total`} />
      </div>

      {/* MONTHLY TREND */}
      <Section title="📈 Premium Trend (Last 12 Months)" hint="Monthly premium collected across all policies">
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" fontSize={11} stroke="#64748b" />
              <YAxis tickFormatter={inrShort} fontSize={11} stroke="#64748b" />
              <Tooltip formatter={(v) => inr(v)} />
              <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
              <Line type="monotone" dataKey="premium"    name="Premium"    stroke="#1565C0" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="commission" name="Commission" stroke="#8b5cf6" strokeWidth={2}   dot={{ r: 2 }} />
              <Line type="monotone" dataKey="payout"     name="Payout"     stroke="#10b981" strokeWidth={2}   dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* TWO-COLUMN: Claims pie + Plan type pie */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <Section title="📋 Claims Distribution" hint={`${s.totalClaims || 0} claims filed`}>
          <div style={{ height: 260 }}>
            {claimsPie.length === 0 ? (
              <Empty msg="No claims yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={claimsPie}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {claimsPie.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v} claims`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Section>

        <Section title="🧩 Plans by Type" hint={`${plans.length} plans`}>
          <div style={{ height: 260 }}>
            {planTypePie.length === 0 ? (
              <Empty msg="No plans yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planTypePie}
                    cx="50%" cy="50%"
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {planTypePie.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v} plans`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Section>
      </div>

      {/* FUNNEL + CLAIM RATIO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <Section title="🔻 Conversion Funnel" hint="Plans → Policies → Active → Claims">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.5rem 0' }}>
            {funnel.map((f, i) => {
              const max = Math.max(...funnel.map(x => x.value), 1);
              const pct = (f.value / max) * 100;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{f.stage}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{f.value}</span>
                  </div>
                  <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: COLORS[i % COLORS.length],
                      borderRadius: '999px',
                      transition: 'width 0.5s',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="📉 Claim Ratio" hint="Approximate claims-to-premium ratio">
          {claimRatio ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: 900,
                color: claimRatio.ratio > 100 ? '#ef4444' : claimRatio.ratio > 70 ? '#f59e0b' : '#10b981',
                lineHeight: 1,
              }}>
                {claimRatio.ratio.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.75rem' }}>
                Approx claims {inr(claimRatio.approxClaims)} vs premium {inr(claimRatio.premium)}
              </div>
              <div style={{
                display: 'inline-block',
                marginTop: '0.75rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: claimRatio.ratio > 100 ? '#fee2e2' : claimRatio.ratio > 70 ? '#fef3c7' : '#dcfce7',
                color: claimRatio.ratio > 100 ? '#991b1b' : claimRatio.ratio > 70 ? '#92400e' : '#166534',
              }}>
                {claimRatio.ratio > 100 ? '⚠️ Above Premium' : claimRatio.ratio > 70 ? '⚡ Watch Closely' : '✅ Healthy'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                * Approximation based on average policy premium (precise ratio requires claim amounts vs premium collected)
              </div>
            </div>
          ) : (
            <Empty msg="Not enough data for claim ratio" />
          )}
        </Section>
      </div>

      {/* TOP PLANS TABLE */}
      <Section title="🏆 Top Performing Plans" hint="Ranked by premium collected" style={{ marginTop: '1rem' }}>
        {topPlans.length === 0 ? (
          <Empty msg="No policies issued yet" />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <Th>#</Th>
                <Th>Plan</Th>
                <Th align="right">Policies</Th>
                <Th align="right">Premium</Th>
                <Th align="right">Share</Th>
              </tr>
            </thead>
            <tbody>
              {topPlans.map((p, i) => {
                const total = topPlans.reduce((sum, x) => sum + x.premium, 0) || 1;
                const share = (p.premium / total) * 100;
                return (
                  <tr key={p.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <Td>{i + 1}</Td>
                    <Td><strong>{p.name}</strong></Td>
                    <Td align="right">{p.count}</Td>
                    <Td align="right">{inr(p.premium)}</Td>
                    <Td align="right">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 60, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <span style={{ display: 'block', width: `${share}%`, height: '100%', background: COLORS[i % COLORS.length] }} />
                        </span>
                        {share.toFixed(1)}%
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  );
}

// ============================================
// SHARED UI
// ============================================
const Section = ({ title, hint, children, style }) => (
  <div style={{
    background: 'white',
    borderRadius: '0.85rem',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
    ...(style || {}),
  }}>
    <div style={{ marginBottom: '0.85rem' }}>
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
      {hint && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>{hint}</div>}
    </div>
    {children}
  </div>
);

const Kpi = ({ label, value, sub, accent, icon }) => (
  <div style={{
    background: 'white',
    borderRadius: '0.75rem',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    borderLeft: `4px solid ${accent}`,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: accent, marginTop: '0.35rem' }}>{value}</div>
    {sub && <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>{sub}</div>}
  </div>
);

const Th = ({ children, align = 'left' }) => (
  <th style={{
    padding: '0.6rem 0.75rem',
    textAlign: align,
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '2px solid #e2e8f0',
  }}>{children}</th>
);

const Td = ({ children, align = 'left' }) => (
  <td style={{ padding: '0.6rem 0.75rem', textAlign: align, fontSize: '0.85rem', color: '#1e293b' }}>
    {children}
  </td>
);

const Empty = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '180px', color: '#94a3b8', fontSize: '0.9rem' }}>
    {msg}
  </div>
);