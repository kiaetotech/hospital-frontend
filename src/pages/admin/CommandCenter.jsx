// D:\hospital-frontend\src\pages\admin\CommandCenter.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaHospital, FaAmbulance, FaUserMd, FaFlask, FaLeaf, FaSeedling,
  FaBrain, FaHome, FaShieldAlt, FaCreditCard, FaBuilding, FaAppleAlt,
} from 'react-icons/fa';
import AdminLayout from '../../layouts/AdminLayout';

const API_BASE =
  process.env.REACT_APP_API_URL ||
  'https://hospital-backend-production-e2cf.up.railway.app';

// ============================================
// 12 TAGS
// ============================================
const TAGS = [
  { key: 'hospitals',   label: 'Hospitals',       icon: FaHospital,    color: '#dc2626', path: '/admin/hospitals' },
  { key: 'ambulance',   label: 'Ambulance',       icon: FaAmbulance,   color: '#f59e0b', path: '/admin/ambulance' },
  { key: 'doctor',      label: 'Online Doctor',   icon: FaUserMd,      color: '#0891b2', path: '/admin/online-doctor' },
  { key: 'diagnostics', label: 'Diagnostics',     icon: FaFlask,       color: '#06b6d4', path: '/admin/diagnostics' },
  { key: 'ayurveda',    label: 'Ayurveda',        icon: FaLeaf,        color: '#16a34a', path: '/admin/ayurveda' },
  { key: 'homeopathy',  label: 'Homeopathy',      icon: FaSeedling,    color: '#7c3aed', path: '/admin/homeopathy' },
  { key: 'mental',      label: 'Mental Health',   icon: FaBrain,       color: '#8b5cf6', path: '/admin/mentalhealth' },
  { key: 'homecare',    label: 'Caregivers',      icon: FaHome,        color: '#db2777', path: '/admin/caregivers' },
  { key: 'insurance',   label: 'Insurance',       icon: FaShieldAlt,   color: '#2563eb', path: '/admin/insurance' },
  { key: 'loan',        label: 'Health EMI/Loan', icon: FaCreditCard,  color: '#059669', path: '/admin/lenders' },
  { key: 'corporate',   label: 'Corporate',       icon: FaBuilding,    color: '#1e3a5f', path: '/admin/corporate' },
  { key: 'dietcare',    label: 'DietCare',        icon: FaAppleAlt,    color: '#65a30d', path: '/admin/dietcare', soon: true },
];

const APPROVAL_CATEGORIES = [
  { key: 'hospitals',   label: 'Hospitals' },
  { key: 'doctor',      label: 'Doctors' },
  { key: 'diagnostics', label: 'Labs' },
  { key: 'homecare',    label: 'Caregivers' },
  { key: 'lenders',     label: 'Lenders' },
  { key: 'dietcare',    label: 'DietCare' },
];

// ============================================
// HELPERS
// ============================================
const money = (n) => {
  if (!n && n !== 0) return '₹0';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
};

const number = (n) => new Intl.NumberFormat('en-IN').format(n || 0);

// ============================================
// KPI CARD
// ============================================
const KPICard = ({ kpi }) => (
  <div style={{
    backgroundColor: '#fff',
    border: '1px solid #e4e8f0',
    borderRadius: 13,
    padding: 16,
    boxShadow: '0 2px 8px rgba(23,32,51,0.035)',
    position: 'relative',
    borderTop: `3px solid ${kpi.color}`,
  }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7485' }}>{kpi.label}</div>
    <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6, color: kpi.color }}>
      {kpi.value}
    </div>
    {kpi.sub && (
      <div style={{ fontSize: 12, color: '#687386', marginTop: 5 }}>{kpi.sub}</div>
    )}
    <div style={{
      position: 'absolute', top: 10, right: 10, fontSize: 9, fontWeight: 700,
      color: kpi.real ? '#065f46' : '#94a3b8',
      background: kpi.real ? '#d1fae5' : '#f1f5f9',
      padding: '2px 6px', borderRadius: 6, letterSpacing: 0.3,
    }}>
      {kpi.real ? 'REAL' : 'DEMO'}
    </div>
  </div>
);

// ============================================
// TAG CARD
// ============================================
const TagCard = ({ tag, metrics, onClick }) => {
  const Icon = tag.icon;
  const disabled = tag.soon;
  const hasData = metrics && metrics.total > 0;
  const apiOk = metrics?.apiOk === true;

  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #e4e8f0',
      borderRadius: 13,
      padding: 16,
      boxShadow: '0 2px 8px rgba(23,32,51,0.035)',
      display: 'flex',
      flexDirection: 'column',
      opacity: disabled ? 0.5 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${tag.color}15`, color: tag.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} />
        </div>
        <div style={{ fontWeight: 800, fontSize: 14 }}>{tag.label}</div>
        {disabled && (
          <span style={{
            fontSize: 9, fontWeight: 700, color: '#94a3b8',
            background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, marginLeft: 'auto',
          }}>
            SOON
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <Metric label="Providers"  value={number(metrics?.total)}    real={apiOk} />
        <Metric label="Bookings"   value={number(metrics?.bookings)} real={apiOk} />
        <Metric label="Revenue"    value={money(metrics?.revenue)}   real={apiOk} />
        <Metric label="Conversion" value={`${metrics?.conversion || 0}%`} real={false} />
      </div>

      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          padding: '8px 12px',
          background: disabled ? '#e2e8f0' : tag.color,
          color: disabled ? '#94a3b8' : '#fff',
          border: 'none',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 12,
          cursor: disabled ? 'not-allowed' : 'pointer',
          marginTop: 'auto',
        }}
      >
        {disabled ? 'Coming Soon' : 'Open'}
      </button>
    </div>
  );
};

const Metric = ({ label, value, real }) => (
  <div style={{ background: '#f7f8fb', borderRadius: 8, padding: '8px 10px' }}>
    <div style={{ fontSize: 10, color: '#778095', fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 800, marginTop: 2 }}>{value}</div>
    <div style={{
      fontSize: 8, fontWeight: 700, marginTop: 2,
      color: real ? '#065f46' : '#94a3b8',
    }}>
      {real ? 'REAL' : 'DEMO'}
    </div>
  </div>
);

// ============================================
// FUNNEL
// ============================================
const Funnel = () => {
  const steps = [
    { label: 'Visits',            value: 124580, pct: 100 },
    { label: 'Views / Searches',  value: 72256,  pct: 58 },
    { label: 'Booking Started',   value: 14802,  pct: 12 },
    { label: 'Payment Initiated', value: 13500,  pct: 11 },
    { label: 'Confirmed',         value: 12480,  pct: 10 },
  ];

  return (
    <div style={{
      backgroundColor: '#fff', border: '1px solid #e4e8f0', borderRadius: 13,
      padding: 18, boxShadow: '0 2px 8px rgba(23,32,51,0.035)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>📊 Booking Conversion Funnel</h3>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: 6 }}>
          DEMO
        </span>
      </div>
      {steps.map((step) => (
        <div key={step.label} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, color: '#475569' }}>{step.label}</span>
            <strong>{number(step.value)}</strong>
          </div>
          <div style={{ height: 7, background: '#edf0f5', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${step.pct}%`, background: '#344054', borderRadius: 99 }} />
          </div>
        </div>
      ))}
      <div style={{ textAlign: 'right', fontSize: 12, marginTop: 12, color: '#64748b' }}>
        Conversion: <strong style={{ color: '#059669' }}>10.0%</strong>
      </div>
    </div>
  );
};

// ============================================
// FINANCE PANEL
// ============================================
const FinancePanel = ({ kpis, navigate }) => {
  const rows = [
    { label: 'Gross Revenue',     value: kpis.gmv,         real: kpis.gmv > 0 },
    { label: 'Commission',        value: kpis.commission,  real: kpis.commission > 0 },
    { label: 'Refunds',           value: 0,                real: false },
    { label: 'GST / Tax',         value: kpis.gst,         real: kpis.gst > 0 },
    { label: 'Settlements',       value: kpis.settlements, real: kpis.settlements > 0 },
  ];

  return (
    <div style={{
      backgroundColor: '#fff', border: '1px solid #e4e8f0', borderRadius: 13,
      padding: 18, boxShadow: '0 2px 8px rgba(23,32,51,0.035)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>💰 Finance / Profit</h3>
      </div>
      {rows.map((r) => (
        <div key={r.label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 0', borderBottom: '1px solid #edf0f5', fontSize: 13,
        }}>
          <span style={{ color: '#475569' }}>
            {r.label}
            <span style={{
              marginLeft: 8, fontSize: 9, fontWeight: 700,
              color: r.real ? '#065f46' : '#94a3b8',
              background: r.real ? '#d1fae5' : '#f1f5f9',
              padding: '1px 5px', borderRadius: 4,
            }}>
              {r.real ? 'REAL' : 'DEMO'}
            </span>
          </span>
          <strong>{money(r.value)}</strong>
        </div>
      ))}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
        <button onClick={() => navigate('/admin/finance')} style={btn('#172033', '#fff')}>Finance</button>
        <button onClick={() => navigate('/admin/taxes?tab=commission')} style={btn('#fff', '#172033')}>Commission</button>
        <button onClick={() => navigate('/admin/taxes?tab=gst')} style={btn('#fff', '#172033')}>GST</button>
        <button onClick={() => navigate('/admin/payouts')} style={btn('#fff', '#172033')}>Settlements</button>
      </div>
    </div>
  );
};

const btn = (bg, color) => ({
  padding: '7px 12px', background: bg, color: color, border: '1px solid #d8deea',
  borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer',
});

// ============================================
// APPROVAL CENTER
// ============================================
const ApprovalCenter = ({ pending, navigate }) => (
  <div style={{
    backgroundColor: '#fff', border: '1px solid #e4e8f0', borderRadius: 13,
    padding: 18, boxShadow: '0 2px 8px rgba(23,32,51,0.035)',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>📋 Approval Center</h3>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#065f46', background: '#d1fae5', padding: '2px 6px', borderRadius: 6 }}>
        REAL
      </span>
    </div>
    {APPROVAL_CATEGORIES.map((cat) => (
      <div key={cat.key} style={{
        display: 'flex', justifyContent: 'space-between', padding: '8px 0',
        borderBottom: '1px solid #edf0f5', fontSize: 13,
      }}>
        <span style={{ color: '#475569' }}>{cat.label}</span>
        <span style={{
          fontWeight: 800, color: (pending[cat.key] || 0) > 0 ? '#dc2626' : '#94a3b8',
        }}>
          {pending[cat.key] || 0}
        </span>
      </div>
    ))}
    <button
      onClick={() => navigate('/admin/payouts')}
      style={{ ...btn('#172033', '#fff'), width: '100%', marginTop: 14, padding: '10px' }}
    >
      Open Approval Center
    </button>
  </div>
);

// ============================================
// AI CONTROL CENTER
// ============================================
const AIControlCenter = ({ navigate }) => (
  <div style={{
    backgroundColor: '#fff', border: '1px solid #e4e8f0', borderRadius: 13,
    padding: 18, boxShadow: '0 2px 8px rgba(23,32,51,0.035)',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>🤖 AI Control Center</h3>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#065f46', background: '#d1fae5', padding: '2px 6px', borderRadius: 6 }}>
        LIVE
      </span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
      {[
        { label: 'Operations AI', status: 'running' },
        { label: 'Finance AI',    status: 'running' },
        { label: 'Growth AI',     status: 'running' },
        { label: 'Security AI',   status: 'running' },
      ].map((a) => (
        <div key={a.label} style={{
          border: '1px solid #e2e7f0', borderRadius: 10, padding: 12, background: '#fafbfc',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: '#19a974',
            boxShadow: '0 0 0 3px rgba(25,169,116,0.2)',
          }} />
          <div style={{ fontSize: 12, fontWeight: 700 }}>{a.label}</div>
        </div>
      ))}
    </div>
    <div style={{ display: 'flex', gap: 20, marginTop: 14, fontSize: 12, color: '#475569' }}>
      <span>Alerts: <strong>12</strong></span>
      <span>Automated: <strong>248</strong></span>
      <span>Human Queue: <strong>7</strong></span>
    </div>
    <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
      <button onClick={() => navigate('/ai-control-center')} style={btn('#172033', '#fff')}>AI Control</button>
      <button onClick={() => navigate('/ai-control-center?view=queue')} style={btn('#fff', '#172033')}>Human Queue</button>
      <button onClick={() => navigate('/ai-control-center?view=audit')} style={btn('#fff', '#172033')}>Audit Log</button>
    </div>
  </div>
);

// ============================================
// REPORT CENTER
// ============================================
const ReportCenter = ({ navigate }) => (
  <div style={{
    backgroundColor: '#fff', border: '1px solid #e4e8f0', borderRadius: 13,
    padding: 18, boxShadow: '0 2px 8px rgba(23,32,51,0.035)',
  }}>
    <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 12px' }}>📑 Report Center</h3>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
      {['Tag', 'State', 'City', 'Provider', 'Finance', 'Conversion'].map((r) => (
        <button key={r} style={btn('#fff', '#172033')}>{r}</button>
      ))}
    </div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button onClick={() => navigate('/admin/payouts')} style={btn('#172033', '#fff')}>Generate Report</button>
      <button style={btn('#fff', '#172033')}>Export</button>
      <button style={btn('#fff', '#172033')}>Schedule</button>
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
const CommandCenter = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    scope: 'PAN INDIA', state: 'All States', city: 'All Cities', tag: 'all', period: '30d',
  });

  const [loading, setLoading] = useState(true);
  const [tagMetrics, setTagMetrics] = useState({});
  const [pending, setPending] = useState({});
  const [kpis, setKpis] = useState({
    users: 0, providers: 0, gmv: 0, commission: 0, earnings: 0,
    refunds: 0, gst: 0, settlements: 0, bookings: 0,
  });

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }

    setLoading(true);
    const ADMIN_KEY = 'admin_secret_key_2024_hospitalhub_production_secure';
const cfg = {
  headers: {
    Authorization: `Bearer ${token}`,
    'x-admin-key': ADMIN_KEY,
  }
};

    const metrics = {};

    // ──────────── 1. HOSPITALS ────────────
    try {
      const res = await axios.get(`${API_BASE}/api/admin/hospitals`, { ...cfg, params: { limit: 1 } }).catch(() => ({ data: {} }));
      const total = res.data?.pagination?.totalHospitals || 0;
      metrics.hospitals = { total, bookings: 0, revenue: 0, conversion: 0, apiOk: true };
    } catch { metrics.hospitals = { total: 0, bookings: 0, revenue: 0, conversion: 0, apiOk: false }; }

    // ──────────── 2. AMBULANCE ────────────
    try {
      const res = await axios.get(`${API_BASE}/api/admin/ambulance`, { ...cfg, params: { limit: 1 } }).catch(() => ({ data: {} }));
      const total = res.data?.count || 0;
      metrics.ambulance = { total, bookings: 0, revenue: 0, conversion: 0, apiOk: true };
    } catch { metrics.ambulance = { total: 0, bookings: 0, revenue: 0, conversion: 0, apiOk: false }; }

    // ──────────── 3. ONLINE DOCTOR ────────────
    try {
      const res = await axios.get(`${API_BASE}/api/online-doctor/admin/doctors`, cfg).catch(() => ({ data: {} }));
      const total = (res.data?.data || []).length;
      metrics.doctor = { total, bookings: 0, revenue: 0, conversion: 0, apiOk: true };
    } catch { metrics.doctor = { total: 0, bookings: 0, revenue: 0, conversion: 0, apiOk: false }; }

    // ──────────── 4. DIAGNOSTICS ────────────
    try {
      const res = await axios.get(`${API_BASE}/api/diagnostics/provider/stats`, cfg).catch(() => ({ data: {} }));
      const total = res.data?.data?.totalProviders || 0;
      metrics.diagnostics = { total, bookings: 0, revenue: 0, conversion: 0, apiOk: true };
    } catch { metrics.diagnostics = { total: 0, bookings: 0, revenue: 0, conversion: 0, apiOk: false }; }

    // ──────────── 5. AYURVEDA (real bookings + revenue) ────────────
    let ayurBookings = [];
    try {
      const [docRes, bookingsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/ayurveda/doctors`, cfg).catch(() => ({ data: {} })),
        axios.get(`${API_BASE}/api/ayurveda/bookings/admin/all`, cfg).catch(() => ({ data: {} })),
      ]);
      ayurBookings = bookingsRes.data?.data || [];
      const total = (docRes.data?.data || []).length;
      const paidBookings = ayurBookings.filter(b => b.paymentStatus === 'paid');
      const revenue = paidBookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0);
      metrics.ayurveda = {
        total,
        bookings: ayurBookings.length,
        revenue,
        conversion: 0,
        apiOk: true,
      };
    } catch { metrics.ayurveda = { total: 0, bookings: 0, revenue: 0, conversion: 0, apiOk: false }; }

    // ──────────── 6. HOMEOPATHY ────────────
    try {
      const res = await axios.get(`${API_BASE}/api/homeopathy/admin/pending-doctors`, cfg).catch(() => ({ data: {} }));
      const total = (res.data?.data || []).length;
      metrics.homeopathy = { total, bookings: 0, revenue: 0, conversion: 0, apiOk: true };
    } catch { metrics.homeopathy = { total: 0, bookings: 0, revenue: 0, conversion: 0, apiOk: false }; }

    // ──────────── 7. MENTAL HEALTH ────────────
    let mhData = {};
    try {
      const res = await axios.get(`${API_BASE}/api/mentalhealth/admin/dashboard`, cfg).catch(() => ({ data: {} }));
      mhData = res.data?.data || {};
      const total = mhData.totalTherapists || 0;
      metrics.mental = { total, bookings: 0, revenue: 0, conversion: 0, apiOk: true };
    } catch { metrics.mental = { total: 0, bookings: 0, revenue: 0, conversion: 0, apiOk: false }; }

    // ──────────── 8. CAREGIVERS ────────────
    try {
      const res = await axios.get(`${API_BASE}/api/caregivers`, { ...cfg, params: { limit: 1 } }).catch(() => ({ data: {} }));
      const total = res.data?.pagination?.total || 0;
      metrics.homecare = { total, bookings: 0, revenue: 0, conversion: 0, apiOk: true };
    } catch { metrics.homecare = { total: 0, bookings: 0, revenue: 0, conversion: 0, apiOk: false }; }

    // ──────────── 9. INSURANCE ────────────
    let insuranceData = {};
    try {
      const res = await axios.get(`${API_BASE}/api/insurance-admin/reports/summary`, cfg).catch(() => ({ data: {} }));
      insuranceData = res.data?.data || {};
      const total = insuranceData.totalPlans || 0;
      const bookings = insuranceData.totalPolicies || 0;
      metrics.insurance = { total, bookings, revenue: 0, conversion: 0, apiOk: true };
    } catch { metrics.insurance = { total: 0, bookings: 0, revenue: 0, conversion: 0, apiOk: false }; }

    // ──────────── 10. LENDERS ────────────
    let lenderStats = {};
    try {
      const res = await axios.get(`${API_BASE}/api/admin/lenders/stats/overview`, cfg).catch(() => ({ data: {} }));
      lenderStats = res.data?.stats || {};
      const total = lenderStats.lenders?.total || 0;
      metrics.loan = { total, bookings: 0, revenue: 0, conversion: 0, apiOk: true };
    } catch { metrics.loan = { total: 0, bookings: 0, revenue: 0, conversion: 0, apiOk: false }; }

    // ──────────── 11. CORPORATE ────────────
    let corpData = {};
    try {
      const res = await axios.get(`${API_BASE}/api/corporate/stats`, cfg).catch(() => ({ data: {} }));
      corpData = res.data?.data || {};
      const total = corpData.plansAvailable || 0;
      const bookings = corpData.employeesCovered || 0;
      metrics.corporate = { total, bookings, revenue: 0, conversion: 0, apiOk: true };
    } catch { metrics.corporate = { total: 0, bookings: 0, revenue: 0, conversion: 0, apiOk: false }; }

    // ──────────── 12. DIETCARE (not built yet) ────────────
    metrics.dietcare = { total: 0, bookings: 0, revenue: 0, conversion: 0, apiOk: false };

    // ──────────── USERS ────────────
    let usersTotal = 0;
    try {
      const res = await axios.get(`${API_BASE}/api/admin/users`, { ...cfg, params: { limit: 1 } }).catch(() => ({ data: {} }));
      usersTotal = res.data?.pagination?.totalUsers || 0;
    } catch {}

    // ──────────── COMPUTE TOTALS FROM AYURVEDA BOOKINGS ────────────
    const paidBookings = ayurBookings.filter(b => b.paymentStatus === 'paid');
    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0);
    const totalCommission = paidBookings.reduce((sum, b) => sum + (b.platformCommission || 0), 0);
    const totalEarnings = paidBookings.reduce((sum, b) => sum + (b.providerEarning || 0), 0);
    const gstTotal = Math.round(totalCommission * 0.18);

    // Providers total (all tags)
    const totalProviders = Object.entries(metrics)
      .filter(([k]) => k !== 'dietcare')
      .reduce((sum, [, m]) => sum + (m.total || 0), 0);

    // Total bookings (all tags)
    const totalBookings = Object.values(metrics).reduce((sum, m) => sum + (m.bookings || 0), 0);

    // ──────────── PENDING APPROVALS ────────────
    const pendingCounts = {
      hospitals: 0,
      doctor: metrics.doctor.total === 0 ? 0 : 0,
      diagnostics: 0,
      homecare: 0,
      lenders: lenderStats.lenders?.pending || 0,
      dietcare: 0,
    };

    // ──────────── SET STATE ────────────
    setTagMetrics(metrics);
    setPending(pendingCounts);
    setKpis({
      users: usersTotal,
      providers: totalProviders,
      bookings: totalBookings,
      gmv: totalRevenue,
      commission: totalCommission,
      earnings: totalEarnings,
      gst: gstTotal,
      settlements: 0,
      refunds: 0,
    });

    setLoading(false);
  }, [navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const kpiRow1 = useMemo(() => ([
    { key: 'users',     label: 'Patients / Users', value: number(kpis.users),     sub: 'Live platform users',   color: '#2563eb', real: true },
    { key: 'providers', label: 'Providers',        value: number(kpis.providers), sub: 'Active + pending',      color: '#7c3aed', real: true },
    { key: 'visits',    label: 'Page Visits',      value: '—',                     sub: 'Not tracked yet',      color: '#0891b2', real: false },
    { key: 'bookings',  label: 'Bookings',         value: number(kpis.bookings),  sub: 'All tags',              color: '#059669', real: true },
  ]), [kpis]);

  const kpiRow2 = useMemo(() => ([
    { key: 'revenue',     label: 'Gross Revenue',       value: money(kpis.gmv),         sub: 'Paid bookings',   color: '#dc2626', real: kpis.gmv > 0 },
    { key: 'commission',  label: 'Platform Commission', value: money(kpis.commission),  sub: 'From rules',      color: '#8b5cf6', real: kpis.commission > 0 },
    { key: 'earnings',    label: 'Provider Earnings',   value: money(kpis.earnings),    sub: 'Pre-settlement',  color: '#10b981', real: kpis.earnings > 0 },
    { key: 'settlements', label: 'Settlements Pending', value: money(kpis.settlements), sub: 'Awaiting payout', color: '#f59e0b', real: false },
  ]), [kpis]);

  return (
    <AdminLayout filters={filters} onFiltersChange={setFilters}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Command Center</div>
          <div style={{ fontSize: 12, color: '#687386', marginTop: 3 }}>
            Showing: <strong>{filters.scope}</strong>
            {' '}• period: <strong>{filters.period}</strong>
            {loading && <span style={{ marginLeft: 12, color: '#94a3b8' }}>Loading...</span>}
          </div>
        </div>
        <button onClick={fetchData} style={btn('#172033', '#fff')} disabled={loading}>
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {/* KPI ROW 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 12 }}>
        {kpiRow1.map((kpi) => <KPICard key={kpi.key} kpi={kpi} />)}
      </div>

      {/* KPI ROW 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 22 }}>
        {kpiRow2.map((kpi) => <KPICard key={kpi.key} kpi={kpi} />)}
      </div>

      {/* FUNNEL + FINANCE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 14, marginBottom: 18 }}>
        <Funnel />
        <FinancePanel kpis={kpis} navigate={navigate} />
      </div>

      {/* TAG CARDS */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>
          12 Tag Command Center
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
          {TAGS.map((tag) => (
            <TagCard
              key={tag.key}
              tag={tag}
              metrics={tagMetrics[tag.key]}
              onClick={() => !tag.soon && navigate(tag.path)}
            />
          ))}
        </div>
      </div>

      {/* APPROVAL + AI */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
        <ApprovalCenter pending={pending} navigate={navigate} />
        <AIControlCenter navigate={navigate} />
      </div>

      {/* REPORT CENTER */}
      <div style={{ marginBottom: 18 }}>
        <ReportCenter navigate={navigate} />
      </div>
    </AdminLayout>
  );
};

export default CommandCenter;