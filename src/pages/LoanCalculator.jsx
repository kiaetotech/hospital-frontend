// D:\hospital-frontend\src\pages\LoanCalculator.jsx
// ============================================
// PUBLIC HEALTHCARE LOAN EMI CALCULATOR
// ============================================
// No login required. Standalone top-of-funnel page.
// Reuses the exact EMI math from Financing.jsx (calculateEMI, calculateFullBreakdown).
// Fetches public loan products from GET /api/loan/products/public (no auth).
// CTA links to /financing for full application.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

// ============================================
// EMI MATH — copied verbatim from Financing.jsx
// (do not change — this must match the wizard exactly)
// ============================================
const calculateEMI = (principal, rate, months) => {
  if (!principal || !months || principal <= 0) return 0;
  if (rate === 0) return Math.round(principal / months);
  const monthlyRate = rate / 100 / 12;
  return Math.round(
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
};

const calculateFullBreakdown = (product, principal, tenure) => {
  if (!product || !principal || !tenure) return null;
  const rate = product.interestRate || 0;
  const emi = calculateEMI(principal, rate, tenure);
  const totalRepayment = emi * tenure;
  const totalInterest = totalRepayment - principal;
  const pf = product.processingFee || 2;
  const rawPF = Math.round((principal * pf) / 100);
  const processingFee = Math.max(200, Math.min(rawPF, 5000));
  const gstOnPF = Math.round((processingFee * 18) / 100);
  const docCharge = product.documentationCharge || 500;
  const stampDuty = Math.round((principal * (product.stampDutyPercent || 0.1)) / 100);
  const totalCharges = processingFee + gstOnPF + docCharge + stampDuty;
  const totalLoan = principal + totalCharges;
  return {
    emi,
    totalRepayment,
    totalInterest,
    processingFee,
    gstOnPF,
    docCharge,
    stampDuty,
    totalCharges,
    totalLoan,
  };
};

const formatINR = (n) => '₹' + (n || 0).toLocaleString('en-IN');

// ============================================
// MAIN COMPONENT
// ============================================
const LoanCalculator = () => {
  const [amount, setAmount] = useState(50000);
  const [tenure, setTenure] = useState(12);
  const [cibil, setCibil] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Fetch public loan products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/loan/products/public');
        const list = res.data?.products || res.data?.data || [];
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('[LoanCalculator] product fetch error:', err.message);
        setFetchError('Could not load lender offers. You can still calculate EMI below.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products by amount range + CIBIL
  const eligibleProducts = products.filter((p) => {
    const minL = p.minAmount || 5000;
    const maxL = p.maxAmount || 10000000;
    if (amount < minL || amount > maxL) return false;
    if (cibil && p.minCibilScore && parseInt(cibil) < p.minCibilScore) return false;
    return true;
  });

  // Compute EMI for each eligible product
  const productCalculations = eligibleProducts.map((p) => ({
    product: p,
    breakdown: calculateFullBreakdown(p, amount, tenure),
  }));

  // Best EMI for the top summary
  const bestEMI = productCalculations.length > 0
    ? Math.min(...productCalculations.map((c) => c.breakdown.emi).filter((x) => x > 0))
    : null;

  // ============================================
  // INLINE STYLES
  // ============================================
  const s = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: "'Inter', system-ui, sans-serif",
    },
    hero: {
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      color: 'white',
      padding: '3rem 1.5rem',
      textAlign: 'center',
    },
    heroTitle: { fontSize: '2rem', fontWeight: 800, margin: 0, marginBottom: '0.5rem' },
    heroSubtitle: { opacity: 0.95, fontSize: '1rem', margin: 0 },
    content: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' },
    twoCol: {
      display: 'grid',
      gridTemplateColumns: 'minmax(300px, 400px) 1fr',
      gap: '1.5rem',
      marginBottom: '1.5rem',
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      border: '1px solid #f1f5f9',
    },
    label: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '1rem',
      color: '#1e293b',
      outline: 'none',
      boxSizing: 'border-box',
    },
    rangeRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' },
    rangeBtn: (active) => ({
      padding: '0.5rem 0.9rem',
      border: active ? '2px solid #4f46e5' : '1px solid #e2e8f0',
      background: active ? '#eef2ff' : 'white',
      color: active ? '#4338ca' : '#475569',
      borderRadius: '8px',
      fontSize: '0.85rem',
      fontWeight: active ? 700 : 500,
      cursor: 'pointer',
    }),
    summaryCard: {
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      color: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
    },
    summaryLabel: { fontSize: '0.8rem', opacity: 0.85, margin: 0 },
    summaryValue: { fontSize: '2rem', fontWeight: 800, margin: '0.2rem 0 1rem' },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid rgba(255,255,255,0.2)',
    },
    summaryItemLabel: { fontSize: '0.75rem', opacity: 0.8, margin: 0 },
    summaryItemValue: { fontSize: '1rem', fontWeight: 700, margin: '0.2rem 0 0' },
    productCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '1.25rem',
      marginBottom: '0.9rem',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      border: '1px solid #f1f5f9',
    },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' },
    lenderName: { fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 },
    rateBadge: {
      display: 'inline-block',
      padding: '0.25rem 0.6rem',
      background: '#eef2ff',
      color: '#4338ca',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 700,
      marginLeft: '0.4rem',
    },
    emiBig: { fontSize: '1.4rem', fontWeight: 800, color: '#059669', margin: 0 },
    emiSmall: { fontSize: '0.75rem', color: '#64748b', margin: '0.15rem 0 0' },
    table: { width: '100%', marginTop: '0.75rem', fontSize: '0.85rem' },
    tableRow: { display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', color: '#475569' },
    tableRowBold: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.4rem 0',
      fontWeight: 700,
      color: '#1e293b',
      borderTop: '1px solid #e2e8f0',
      marginTop: '0.2rem',
    },
    applyBtn: {
      display: 'inline-block',
      marginTop: '0.75rem',
      padding: '0.65rem 1.25rem',
      background: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 700,
      textDecoration: 'none',
      fontSize: '0.9rem',
    },
    ctaBanner: {
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      color: 'white',
      borderRadius: '16px',
      padding: '2rem 1.5rem',
      textAlign: 'center',
      marginTop: '1.5rem',
    },
    ctaBtn: {
      display: 'inline-block',
      marginTop: '1rem',
      padding: '0.85rem 2rem',
      background: 'white',
      color: '#4f46e5',
      border: 'none',
      borderRadius: '10px',
      fontWeight: 800,
      textDecoration: 'none',
      fontSize: '1rem',
    },
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={s.container}>
      {/* HERO */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>Healthcare Loan EMI Calculator</h1>
        <p style={s.heroSubtitle}>
          Calculate your monthly EMI, total interest, and full cost breakdown — no login required.
        </p>
      </div>

      <div style={s.content}>
        {/* INPUT + SUMMARY GRID */}
        <div style={s.twoCol}>
          {/* LEFT: Inputs */}
          <div style={s.card}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>
              Your Details
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={s.label}>Treatment Cost (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                min="5000"
                max="10000000"
                style={s.input}
              />
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                Min ₹5,000 · Max ₹1,00,00,000
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={s.label}>Loan Tenure (months)</label>
              <div style={s.rangeRow}>
                {[3, 6, 12, 24, 36, 48, 60].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTenure(t)}
                    style={s.rangeBtn(tenure === t)}
                  >
                    {t}m
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={s.label}>CIBIL Score (optional)</label>
              <input
                type="number"
                value={cibil}
                onChange={(e) => setCibil(e.target.value)}
                placeholder="e.g. 750"
                min="300"
                max="900"
                style={s.input}
              />
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                Enter to filter lenders by eligibility
              </div>
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div style={s.summaryCard}>
            <p style={s.summaryLabel}>Best Monthly EMI</p>
            <p style={s.summaryValue}>
              {bestEMI !== null ? formatINR(bestEMI) : '—'}
            </p>
            <p style={{ ...s.summaryLabel, fontSize: '0.9rem' }}>
              for {formatINR(amount)} over {tenure} months
            </p>

            {productCalculations.length > 0 && (
              <div style={s.summaryGrid}>
                <div>
                  <p style={s.summaryItemLabel}>Lowest Rate</p>
                  <p style={s.summaryItemValue}>
                    {Math.min(...productCalculations.map((c) => c.product.interestRate || 0))}%
                  </p>
                </div>
                <div>
                  <p style={s.summaryItemLabel}>Lenders Available</p>
                  <p style={s.summaryItemValue}>{productCalculations.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ERROR / LOADING */}
        {fetchError && (
          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', color: '#92400e', fontSize: '0.9rem' }}>
            ⚠️ {fetchError}
          </div>
        )}
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            Loading lender offers…
          </div>
        )}

        {/* LENDER COMPARISON */}
        {!loading && productCalculations.length > 0 && (
          <div style={s.card}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>
              Compare Lenders ({productCalculations.length})
            </h2>

            {productCalculations.map(({ product, breakdown }) => (
              <div key={product.productId || product._id || product.id} style={s.productCard}>
                <div style={s.row}>
                  <div>
                    <p style={s.lenderName}>
                      {product.lenderName || product.productName || 'Lender'}
                      <span style={s.rateBadge}>{product.interestRate || 0}% p.a.</span>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.3rem 0 0' }}>
                      {product.productName && product.lenderName ? product.productName + ' · ' : ''}
                      {product.minTenureMonths || 3}–{product.maxTenureMonths || 60} months
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={s.emiBig}>{formatINR(breakdown.emi)}</p>
                    <p style={s.emiSmall}>per month × {tenure}</p>
                  </div>
                </div>

                <div style={s.table}>
                  <div style={s.tableRow}>
                    <span>Treatment Cost</span>
                    <span>{formatINR(amount)}</span>
                  </div>
                  <div style={s.tableRow}>
                    <span>Processing Fee</span>
                    <span>{formatINR(breakdown.processingFee)}</span>
                  </div>
                  <div style={s.tableRow}>
                    <span>GST on Processing</span>
                    <span>{formatINR(breakdown.gstOnPF)}</span>
                  </div>
                  <div style={s.tableRow}>
                    <span>Documentation</span>
                    <span>{formatINR(breakdown.docCharge)}</span>
                  </div>
                  <div style={s.tableRow}>
                    <span>Stamp Duty</span>
                    <span>{formatINR(breakdown.stampDuty)}</span>
                  </div>
                  <div style={s.tableRowBold}>
                    <span>Total Loan Amount</span>
                    <span>{formatINR(breakdown.totalLoan)}</span>
                  </div>
                  <div style={s.tableRow}>
                    <span>Total Interest</span>
                    <span style={{ color: '#dc2626' }}>{formatINR(breakdown.totalInterest)}</span>
                  </div>
                  <div style={s.tableRowBold}>
                    <span>Total Repayment</span>
                    <span>{formatINR(breakdown.totalRepayment)}</span>
                  </div>
                </div>

                <Link
                  to={`/financing?amount=${amount}&tenure=${tenure}`}
                  style={s.applyBtn}
                >
                  Apply with {product.lenderName || 'this lender'} →
                </Link>
              </div>
            ))}
          </div>
        )}

        {!loading && productCalculations.length === 0 && !fetchError && (
          <div style={{ ...s.card, textAlign: 'center', padding: '2.5rem' }}>
            <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '0.5rem' }}>
              No lenders match ₹{amount.toLocaleString('en-IN')} for {tenure} months.
            </p>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              Try a different amount or tenure above.
            </p>
          </div>
        )}

        {/* CTA BANNER */}
        <div style={s.ctaBanner}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
            Ready to apply?
          </h3>
          <p style={{ opacity: 0.9, fontSize: '0.95rem', margin: '0.5rem 0 0' }}>
            Get instant offers from RBI-compliant healthcare lenders.
          </p>
          <Link
            to={`/financing?amount=${amount}&tenure=${tenure}`}
            style={s.ctaBtn}
          >
            Start Application →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;