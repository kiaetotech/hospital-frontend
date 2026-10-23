// D:\hospital-frontend\src\pages\insurance\InsurerFinancials.jsx
// ============================================
// INSURER FINANCIALS TAB
// Commission breakdown • TDS/GST • Invoice generator • CSV export
// ============================================

import React, { useEffect, useState, useMemo } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-ilhi.onrender.com';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

// ============================================
// MAIN
// ============================================
export default function InsurerFinancials() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settlements, setSettlements] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('providerToken') : null;

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('limit', '200');
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const r = await fetch(`${API_BASE}/api/insurance/company/settlements?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success) setSettlements(d.data || []);
      else setError(d.message || 'Failed to load financials');
    } catch (e) {
      setError(e.message || 'Failed to load financials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
    else setError('Not authenticated');
    // eslint-disable-next-line
  }, []);

  // ============================================
  // DERIVED
  // ============================================
  const filtered = useMemo(() => {
    if (!search.trim()) return settlements;
    const q = search.toLowerCase();
    return settlements.filter((s) => {
      const hay = `${s.transactionId || ''} ${s._id || ''} ${s.policyNumber || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [settlements, search]);

  const totals = useMemo(() => {
    let grossPremium = 0;
    let commission = 0;
    let payout = 0;
    let tds = 0;
    let gst = 0;
    filtered.forEach((s) => {
      const prem = Number(s.premiumAmount || 0);
      const comm = Number(s.insurancePlatformCommission || 0);
      const pay = Number(s.insurancePayoutToCompany || 0);
      grossPremium += prem;
      commission += comm;
      payout += pay;
      // TDS: 5% on commission (industry standard for insurance commission)
      tds += Number(s.tdsAmount || comm * 0.05);
      // GST: 18% on commission (services)
      gst += Number(s.gstAmount || comm * 0.18);
    });
    return { grossPremium, commission, payout, tds, gst, count: filtered.length };
  }, [filtered]);

  // ============================================
  // EXPORT CSV
  // ============================================
  const exportCsv = () => {
    if (!filtered.length) return;
    const header = ['Transaction ID', 'Policy/Ref', 'Date', 'Gross Premium', 'Commission', 'TDS (5%)', 'GST (18%)', 'Net Payout', 'Status'];
    const rows = filtered.map((s) => [
      s.transactionId || s._id || '',
      s.policyNumber || s.bookingId?.policyNumber || '',
      s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : '',
      s.premiumAmount || 0,
      s.insurancePlatformCommission || 0,
      s.tdsAmount || (Number(s.insurancePlatformCommission || 0) * 0.05).toFixed(2),
      s.gstAmount || (Number(s.insurancePlatformCommission || 0) * 0.18).toFixed(2),
      s.insurancePayoutToCompany || 0,
      s.insuranceSettlementStatus || 'pending',
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financials_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================
  // INVOICE PRINT (opens print dialog with a formatted invoice)
  // ============================================
  const printInvoice = (txn) => {
    const comm = Number(txn.insurancePlatformCommission || 0);
    const tds = Number(txn.tdsAmount || comm * 0.05);
    const gst = Number(txn.gstAmount || comm * 0.18);
    const payout = Number(txn.insurancePayoutToCompany || 0);
    const prem = Number(txn.premiumAmount || 0);

    const html = `
      <html>
      <head>
        <title>Invoice ${txn.transactionId || txn._id || ''}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #0f172a; }
          .head { display: flex; justify-content: space-between; border-bottom: 3px solid #1565C0; padding-bottom: 16px; margin-bottom: 24px; }
          .brand { font-size: 22px; font-weight: 900; color: #1565C0; }
          .meta { font-size: 12px; color: #64748b; }
          h2 { font-size: 16px; margin: 24px 0 12px; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background: #f8fafc; font-weight: 700; color: #475569; font-size: 11px; text-transform: uppercase; }
          .right { text-align: right; }
          .total-row td { font-weight: 800; font-size: 14px; background: #eff6ff; color: #1e40af; border-top: 2px solid #1565C0; }
          .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="head">
          <div>
            <div class="brand">🛡️ HealthCare Hub — Insurance</div>
            <div class="meta">GST-Compliant Commission Invoice</div>
          </div>
          <div class="meta" style="text-align:right;">
            <div><strong>Invoice No:</strong> INV-${String(txn.transactionId || txn._id || '').slice(-10).toUpperCase()}</div>
            <div><strong>Date:</strong> ${fmtDate(txn.createdAt || new Date())}</div>
          </div>
        </div>

        <h2>Transaction Details</h2>
        <table>
          <tbody>
            <tr><th style="width:35%;">Transaction ID</th><td>${txn.transactionId || txn._id || '—'}</td></tr>
            <tr><th>Policy / Booking</th><td>${txn.policyNumber || txn.bookingId?.policyNumber || '—'}</td></tr>
            <tr><th>Gross Premium Collected</th><td>${inr(prem)}</td></tr>
            <tr><th>Settlement Status</th><td>${txn.insuranceSettlementStatus || 'pending'}</td></tr>
          </tbody>
        </table>

        <h2>Financial Breakdown</h2>
        <table>
          <thead>
            <tr><th>Description</th><th class="right">Amount (₹)</th></tr>
          </thead>
          <tbody>
            <tr><td>Gross Premium</td><td class="right">${inr(prem)}</td></tr>
            <tr><td>Platform Commission</td><td class="right">${inr(comm)}</td></tr>
            <tr><td>TDS Deducted (5%)</td><td class="right">-${inr(tds)}</td></tr>
            <tr><td>GST on Commission (18%)</td><td class="right">${inr(gst)}</td></tr>
            <tr class="total-row"><td>Net Payout to Insurer</td><td class="right">${inr(payout)}</td></tr>
          </tbody>
        </table>

        <h2>Computation</h2>
        <table>
          <tbody>
            <tr><th>Net Payout Formula</th><td>Premium − Commission + GST − TDS</td></tr>
            <tr><th>Commission Base</th><td>${inr(comm)}</td></tr>
            <tr><th>TDS Rate</th><td>5% (Sec 194D — Insurance Commission)</td></tr>
            <tr><th>GST Rate</th><td>18% (Services)</td></tr>
          </tbody>
        </table>

        <div class="footer">
          This is a computer-generated invoice. For queries, contact finance@hospitalhub.in<br/>
          Generated on ${new Date().toLocaleString('en-IN')}
        </div>
      </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) { alert('Please allow popups to view the invoice'); return; }
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 300);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem', color: '#0f172a' }}>
        💰 Financials
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Commission, tax, and net payouts across all settlements
      </p>

      {/* KPI ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Kpi label="Gross Premium"     value={inr(totals.grossPremium)} accent="#1565C0" icon="💵" sub={`${totals.count} transactions`} />
        <Kpi label="Commission"         value={inr(totals.commission)}   accent="#8b5cf6" icon="📈" sub="Platform fees" />
        <Kpi label="TDS Deducted (5%)"  value={inr(totals.tds)}          accent="#f59e0b" icon="🏛️" sub="Sec 194D" />
        <Kpi label="GST (18%)"          value={inr(totals.gst)}          accent="#06b6d4" icon="🧾" sub="Output tax" />
        <Kpi label="Net Payout"         value={inr(totals.payout)}       accent="#10b981" icon="🏦" sub="To your account" />
      </div>

      {/* FILTERS BAR */}
      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.6rem',
        alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="🔍 Search transaction ID or policy…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '220px', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.85rem' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>From</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.85rem' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>To</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.85rem' }} />
        </div>
        <button
          onClick={loadData}
          style={{ padding: '0.5rem 1rem', background: '#1565C0', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >Apply</button>
        <button
          onClick={exportCsv}
          disabled={!filtered.length}
          style={{ padding: '0.5rem 1rem', background: filtered.length ? '#10b981' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: filtered.length ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.85rem' }}
        >⬇️ Export CSV</button>
      </div>

      {/* TABLE */}
      <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading financials…</div>
        ) : error ? (
          <div style={{ padding: '1.5rem', color: '#991b1b', background: '#fee2e2' }}>⚠️ {error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
            No financial records {search ? 'match your search' : 'yet'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr>
                  <Th>Transaction</Th>
                  <Th>Policy / Ref</Th>
                  <Th align="right">Premium</Th>
                  <Th align="right">Commission</Th>
                  <Th align="right">TDS (5%)</Th>
                  <Th align="right">GST (18%)</Th>
                  <Th align="right">Net Payout</Th>
                  <Th>Status</Th>
                  <Th align="center">Invoice</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const comm = Number(s.insurancePlatformCommission || 0);
                  const tds = Number(s.tdsAmount || comm * 0.05);
                  const gst = Number(s.gstAmount || comm * 0.18);
                  return (
                    <tr key={s._id || s.transactionId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <Td>
                        <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {String(s.transactionId || s._id || '').slice(-12)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{fmtDate(s.createdAt)}</div>
                      </Td>
                      <Td>
                        <div style={{ fontSize: '0.85rem' }}>{s.policyNumber || s.bookingId?.policyNumber || '—'}</div>
                      </Td>
                      <Td align="right">{inr(s.premiumAmount)}</Td>
                      <Td align="right">{inr(comm)}</Td>
                      <Td align="right" style={{ color: '#b45309' }}>-{inr(tds)}</Td>
                      <Td align="right" style={{ color: '#0891b2' }}>{inr(gst)}</Td>
                      <Td align="right"><strong>{inr(s.insurancePayoutToCompany)}</strong></Td>
                      <Td><Pill status={s.insuranceSettlementStatus || 'pending'} /></Td>
                      <Td align="center">
                        <button
                          onClick={() => printInvoice(s)}
                          title="Generate invoice"
                          style={{
                            padding: '0.35rem 0.65rem',
                            background: '#eff6ff',
                            color: '#1e40af',
                            border: '1px solid #bfdbfe',
                            borderRadius: '0.4rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >🧾 Print</button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TAX DISCLAIMER */}
      <div style={{
        marginTop: '1.25rem',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        fontSize: '0.8rem',
        color: '#475569',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: '#0f172a' }}>📋 Tax Notes</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li><strong>TDS 5%</strong> is deducted on insurance commission under Section 194D of the Income Tax Act.</li>
          <li><strong>GST 18%</strong> applies to insurance-related services.</li>
          <li>Net Payout = Gross Premium − Commission + GST − TDS</li>
          <li>Invoices are computer-generated. For disputes, contact <strong>finance@hospitalhub.in</strong>.</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================
// SHARED UI
// ============================================
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
    padding: '0.7rem 0.9rem',
    textAlign: align,
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    background: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  }}>{children}</th>
);

const Td = ({ children, align = 'left', style }) => (
  <td style={{
    padding: '0.7rem 0.9rem',
    textAlign: align,
    fontSize: '0.85rem',
    color: '#1e293b',
    verticalAlign: 'middle',
    ...(style || {}),
  }}>{children}</td>
);

const Pill = ({ status }) => {
  const map = {
    completed: { bg: '#dcfce7', color: '#166534', label: 'PAID' },
    pending:   { bg: '#fef3c7', color: '#92400e', label: 'PENDING' },
    failed:    { bg: '#fee2e2', color: '#991b1b', label: 'FAILED' },
  };
  const c = map[status] || map.pending;
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.2rem 0.55rem',
      borderRadius: '999px',
      fontSize: '0.68rem',
      fontWeight: 700,
      letterSpacing: '0.03em',
      background: c.bg,
      color: c.color,
    }}>{c.label}</span>
  );
};