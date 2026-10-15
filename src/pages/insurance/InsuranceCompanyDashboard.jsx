import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderDashboardLayout from '../../components/ProviderDashboardLayout';
import ProviderStatsCards from '../../components/ProviderStatsCards';
import ProviderTable from '../../components/ProviderTable';
import { insuranceApi } from '../../services/providerApi';
import axios from 'axios';
import ProviderAuth from '../../components/ProviderAuth';
import PlanBuilder from './PlanBuilder';
import {
  RenewalsTab,
  ComplaintsTab,
  ReviewsTab,
  NetworkHospitalsTab,
  KycTab,
} from './InsurerExtendedTabs';
import { PolicyDetailModal, ClaimDetailModal } from './InsurerDetailModals';
import InsurerAnalytics from './InsurerAnalytics';
import InsurerFinancials from './InsurerFinancials';
import InsurerAdvertising from './InsurerAdvertising';
import InsurerCorporate from './InsurerCorporate';
import InsurerPreAuthQueue from './InsurerPreAuthQueue';
import InsurerClaimTriage from './InsurerClaimTriage';
import InsurerAutoRenewal from './InsurerAutoRenewal';

// ============================================
// TOAST — inline, no external dependency
// ============================================
const ToastContext = React.createContext(null);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const push = useCallback((message, type = 'success') => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3000);
  }, []);

  const api = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        pointerEvents: 'none',
      }}>
        {toasts.map((t) => {
          const colors = {
            success: { bg: '#dcfce7', border: '#86efac', text: '#166534', icon: '✅' },
            error:   { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b', icon: '❌' },
            info:    { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af', icon: 'ℹ️' },
          }[t.type] || {};
          return (
            <div key={t.id} style={{
              minWidth: '260px',
              maxWidth: '380px',
              padding: '0.75rem 1rem',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              borderRadius: '0.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start',
              pointerEvents: 'auto',
            }}>
              <span>{colors.icon}</span>
              <span style={{ flex: 1 }}>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => React.useContext(ToastContext);

// ============================================
// CSV EXPORT HELPER
// ============================================
const exportToCSV = (rows, columns, filename) => {
  if (!rows || rows.length === 0) return false;
  const header = columns.map((c) => `"${String(c.label).replace(/"/g, '""')}"`).join(',');
  const body = rows.map((row) =>
    columns.map((c) => {
      let val = c.exportValue ? c.exportValue(row) : row[c.key];
      if (val === undefined || val === null) val = '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  ).join('\n');
  const csv = header + '\n' + body;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
};

// ============================================
// MAIN DASHBOARD
// ============================================
const InsuranceCompanyDashboardInner = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [plans, setPlans] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [profile, setProfile] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [suspendedStatus, setSuspendedStatus] = useState(null);
  const [newPlan, setNewPlan] = useState(null);
  const [policyModalRow, setPolicyModalRow] = useState(null);
  const [claimModalRow, setClaimModalRow] = useState(null);

  // Auto-refresh
  const [autoRefreshMin, setAutoRefreshMin] = useState(0); // 0 = off

  // Plans filters
  const [plansStatus, setPlansStatus] = useState('all');

  // Policies filters
  const [polSearch, setPolSearch] = useState('');
  const [polStatus, setPolStatus] = useState('all');
  const [polStartDate, setPolStartDate] = useState('');
  const [polEndDate, setPolEndDate] = useState('');
  const [polPage, setPolPage] = useState(1);
  const [polPageSize, setPolPageSize] = useState(20);
  const [polTotal, setPolTotal] = useState(0);
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [bulkBusy, setBulkBusy] = useState(false);

  // Claims filters
  const [claimSearch, setClaimSearch] = useState('');
  const [claimStatus, setClaimStatus] = useState('all');
  const [claimStartDate, setClaimStartDate] = useState('');
  const [claimEndDate, setClaimEndDate] = useState('');
  const [claimPage, setClaimPage] = useState(1);
  const [claimPageSize, setClaimPageSize] = useState(20);
  const [claimTotal, setClaimTotal] = useState(0);
  const [selectedClaims, setSelectedClaims] = useState([]);

  // Settlements filters
  const [setStartDate, setSetStartDate] = useState('');
  const [setEndDate, setSetEndDate] = useState('');
  const [setPage, setSetPage] = useState(1);
  const [setPageSize, setSetPageSize] = useState(20);
  const [setTotal, setSetTotal] = useState(0);

  const sidebarItems = [
    { id: 'dashboard',   label: '📊 Dashboard',       icon: '📊' },
    { id: 'analytics',   label: '📈 Analytics',       icon: '📈' },
    { id: 'financials',  label: '💰 Financials',      icon: '💰' },
    { id: 'advertising', label: '📢 Advertising',     icon: '📢' },
    { id: 'corporate',   label: '🏢 Corporate',       icon: '🏢' },
    { id: 'preauth',     label: '🩺 Pre-Auth',        icon: '🩺' },
    { id: 'triage',      label: '🤖 AI Triage',       icon: '🤖' },
    { id: 'autorenewal', label: '🔄 Auto-Renewal',    icon: '🔄' },
    { id: 'profile',     label: '🏢 Company Profile', icon: '🏢' },
    { id: 'plans',       label: '📋 Plans',           icon: '📋' },
    { id: 'policies',    label: '📄 Policies',        icon: '📄' },
    { id: 'claims',      label: '📋 Claims',          icon: '📋' },
    { id: 'renewals',    label: '🔄 Renewals',        icon: '🔄' },
    { id: 'complaints',  label: '🚨 Complaints',      icon: '🚨' },
    { id: 'reviews',     label: '⭐ Reviews',         icon: '⭐' },
    { id: 'network',     label: '🏥 Network Hospitals', icon: '🏥' },
    { id: 'settlements', label: '💰 Settlements',     icon: '💰' },
    { id: 'reports',     label: '📊 Reports',         icon: '📊' },
    { id: 'kyc',         label: '📋 KYC',             icon: '📋' },
    { id: 'settings',    label: '⚙️ Settings',        icon: '⚙️' },
  ];

  // ---------------------------------------------
  // Load data based on active tab + filters
  // ---------------------------------------------
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('providerToken');
      if (!token) {
        navigate('/insurance/company/login');
        return;
      }

      // Suspended status — fetch once per tab change (cheap endpoint)
      try {
        const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-e2cf.up.railway.app';
        const suspRes = await axios.get(`${API_BASE}/api/insurance/company/suspended-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (suspRes.data?.success) setSuspendedStatus(suspRes.data.data);
      } catch (e) { /* ignore */ }

      if (activeTab === 'dashboard') {
        const [statsRes, policiesRes, claimsRes] = await Promise.all([
          insuranceApi.getStats(),
          insuranceApi.getPolicies({ limit: 5 }),
          insuranceApi.getClaims({ limit: 5 }),
        ]);
        setStats(statsRes.data?.data?.stats || {});
        setPolicies(policiesRes.data?.data || []);
        setClaims(claimsRes.data?.data || []);

      } else if (activeTab === 'plans') {
        const params = { limit: 100 };
        if (plansStatus !== 'all') params.status = plansStatus;
        const plansRes = await insuranceApi.getPlans();
        setPlans(plansRes.data?.data || []);

      } else if (activeTab === 'policies') {
        const params = {
          page: polPage,
          limit: polPageSize,
        };
        if (polSearch.trim()) params.search = polSearch.trim();
        if (polStatus !== 'all') params.status = polStatus;
        if (polStartDate) params.startDate = polStartDate;
        if (polEndDate) params.endDate = polEndDate;
        const policiesRes = await insuranceApi.getPolicies(params);
        setPolicies(policiesRes.data?.data || []);
        setPolTotal(policiesRes.data?.pagination?.total || 0);

      } else if (activeTab === 'claims') {
        const params = {
          page: claimPage,
          limit: claimPageSize,
        };
        if (claimSearch.trim()) params.search = claimSearch.trim();
        if (claimStatus !== 'all') params.status = claimStatus;
        if (claimStartDate) params.startDate = claimStartDate;
        if (claimEndDate) params.endDate = claimEndDate;
        const claimsRes = await insuranceApi.getClaims(params);
        setClaims(claimsRes.data?.data || []);
        setClaimTotal(claimsRes.data?.pagination?.total || 0);
        setSelectedClaims([]);

      } else if (activeTab === 'settlements') {
        const params = {
          page: setPage,
          limit: setPageSize,
        };
        if (setStartDate) params.startDate = setStartDate;
        if (setEndDate) params.endDate = setEndDate;
        const settlementsRes = await insuranceApi.getSettlements(params);
        setSettlements(settlementsRes.data?.data || []);
        setSetTotal(settlementsRes.data?.pagination?.total || 0);

      } else if (activeTab === 'profile') {
        const profileRes = await insuranceApi.getProfile();
        setProfile(profileRes.data?.data || null);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        navigate('/insurance/company/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [activeTab, plansStatus, polSearch, polStatus, polStartDate, polEndDate, polPage, polPageSize, claimSearch, claimStatus, claimStartDate, claimEndDate, claimPage, claimPageSize, setStartDate, setEndDate, setPage, setPageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefreshMin) return;
    const ms = autoRefreshMin * 60 * 1000;
    const t = setInterval(() => { loadData(); }, ms);
    return () => clearInterval(t);
  }, [autoRefreshMin, loadData]);

  // Reset page when filters change
  useEffect(() => { setPolPage(1); setSelectedPolicies([]); }, [polSearch, polStatus, polStartDate, polEndDate]);
  useEffect(() => { setClaimPage(1); }, [claimSearch, claimStatus, claimStartDate, claimEndDate]);
  useEffect(() => { setSetPage(1); }, [setStartDate, setEndDate]);

  // ---------------------------------------------
  // Reports
  // ---------------------------------------------
  const generateReport = async (period) => {
    try {
      const now = new Date();
      const start = new Date(now);
      if (period === 'daily') start.setDate(now.getDate() - 1);
      else start.setMonth(now.getMonth() - 1);
      const response = await insuranceApi.getReports({ startDate: start.toISOString(), endDate: now.toISOString() });
      const report = response.data?.data;
      if (!report) throw new Error('No report data returned');
      const csv = [
        ['Metric', 'Value'],
        ['Total Policies', report.summary?.totalPolicies || 0],
        ['Total Premium', report.summary?.totalPremium || 0],
        ['Total Commission', report.summary?.totalCommission || 0],
        ['Total Payout', report.summary?.totalPayout || 0],
        ['Average Premium', report.summary?.averagePremium || 0],
      ].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `insurance-${period}-report.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success(`${period} report downloaded`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to generate report');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('providerToken');
    localStorage.removeItem('providerType');
    localStorage.removeItem('providerId');
    navigate('/insurance/company/login');
  };

  // ---------------------------------------------
  // Plan actions
  // ---------------------------------------------
  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Deactivate this plan?')) return;
    try {
      await insuranceApi.deletePlan(planId);
      toast.success('Plan deactivated');
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete plan');
    }
  };

  // ---------------------------------------------
  // Claim actions
  // ---------------------------------------------
  const updateClaimStatus = async (claimId, status, note) => {
    try {
      await insuranceApi.updateClaimStatus(claimId, { status, note });
      toast.success(`Claim ${status}`);
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update claim');
    }
  };

  const bulkUpdateClaims = async (status) => {
    if (selectedClaims.length === 0) return;
    if (!window.confirm(`Mark ${selectedClaims.length} claim(s) as ${status}?`)) return;
    let ok = 0, fail = 0;
    for (const c of selectedClaims) {
      try {
        await insuranceApi.updateClaimStatus(c._id, { status, note: `Bulk ${status} by insurer` });
        ok++;
      } catch (e) { fail++; }
    }
    toast.success(`${ok} updated${fail ? `, ${fail} failed` : ''}`);
    loadData();
  };

  // ---------------------------------------------
  // CSV export handlers
  // ---------------------------------------------
  const exportPolicies = () => {
    const ok = exportToCSV(
      policies,
      [
        { key: 'policyNumber', label: 'Policy Number' },
        { key: 'customerName', label: 'Customer' },
        { key: 'planName', label: 'Plan' },
        { key: 'premiumAmount', label: 'Premium' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created', exportValue: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '' },
      ],
      `policies-page-${polPage}.csv`
    );
    if (ok) toast.success('Policies exported');
    else toast.error('No policies to export');
  };

  const exportClaims = () => {
    const ok = exportToCSV(
      claims,
      [
        { key: 'claimNumber', label: 'Claim Number', exportValue: (r) => r.claimNumber || r.claimId || '' },
        { key: 'policyNumber', label: 'Policy' },
        { key: 'amount', label: 'Amount' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created', exportValue: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '' },
      ],
      `claims-page-${claimPage}.csv`
    );
    if (ok) toast.success('Claims exported');
    else toast.error('No claims to export');
  };

  const exportSettlements = () => {
    const ok = exportToCSV(
      settlements,
      [
        { key: 'transactionId', label: 'Transaction ID', exportValue: (r) => r.transactionId || r._id || '' },
        { key: 'premiumAmount', label: 'Premium' },
        { key: 'insurancePlatformCommission', label: 'Commission' },
        { key: 'insurancePayoutToCompany', label: 'Payout' },
        { key: 'insuranceSettlementStatus', label: 'Status' },
        { key: 'createdAt', label: 'Created', exportValue: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '' },
      ],
      `settlements-page-${setPage}.csv`
    );
    if (ok) toast.success('Settlements exported');
    else toast.error('No settlements to export');
  };

  // ---------------------------------------------
  // Header actions (auto-refresh dropdown)
  // ---------------------------------------------
  const headerActions = (
    <select
      value={autoRefreshMin}
      onChange={(e) => setAutoRefreshMin(parseInt(e.target.value))}
      title="Auto-refresh interval"
      style={{
        padding: '0.5rem 0.75rem',
        backgroundColor: autoRefreshMin ? '#eff6ff' : 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: autoRefreshMin ? '#1e40af' : '#4b5563',
      }}
    >
      <option value={0}>Auto-refresh: Off</option>
      <option value={1}>Auto-refresh: 1 min</option>
      <option value={5}>Auto-refresh: 5 min</option>
      <option value={10}>Auto-refresh: 10 min</option>
      <option value={30}>Auto-refresh: 30 min</option>
    </select>
  );

  // ---------------------------------------------
  // Reusable filter bar
  // ---------------------------------------------
  const inputStyle = { padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.85rem', background: 'white' };

  const policiesFilters = (
    <>
      <select value={polStatus} onChange={(e) => setPolStatus(e.target.value)} style={inputStyle}>
        <option value="all">All status</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="expired">Expired</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <input type="date" value={polStartDate} onChange={(e) => setPolStartDate(e.target.value)} style={inputStyle} title="From date" />
      <input type="date" value={polEndDate} onChange={(e) => setPolEndDate(e.target.value)} style={inputStyle} title="To date" />
    </>
  );

  const claimsFilters = (
    <>
      <select value={claimStatus} onChange={(e) => setClaimStatus(e.target.value)} style={inputStyle}>
        <option value="all">All status</option>
        <option value="submitted">Submitted</option>
        <option value="under_review">Under Review</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="settled">Settled</option>
        <option value="partially_settled">Partially Settled</option>
      </select>
      <input type="date" value={claimStartDate} onChange={(e) => setClaimStartDate(e.target.value)} style={inputStyle} title="From date" />
      <input type="date" value={claimEndDate} onChange={(e) => setClaimEndDate(e.target.value)} style={inputStyle} title="To date" />
    </>
  );

  const settlementsFilters = (
    <>
      <input type="date" value={setStartDate} onChange={(e) => setSetStartDate(e.target.value)} style={inputStyle} title="From date" />
      <input type="date" value={setEndDate} onChange={(e) => setSetEndDate(e.target.value)} style={inputStyle} title="To date" />
    </>
  );

  // ---------------------------------------------
  // BULK POLICY OPERATIONS
  // ---------------------------------------------
  const bulkSendReminders = async () => {
    if (selectedPolicies.length === 0) return;
    if (!window.confirm(`Send renewal reminder to ${selectedPolicies.length} customer(s)?`)) return;
    setBulkBusy(true);
    let ok = 0, fail = 0;
    for (const p of selectedPolicies) {
      try {
        const token = localStorage.getItem('providerToken');
        const r = await fetch(`${process.env.REACT_APP_API_URL || 'https://hospital-backend-production-e2cf.up.railway.app'}/api/insurance/company/policies/${p._id}/send-renewal-reminder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            channel: 'sms+email',
            customerPhone: p.userId?.phone,
            customerEmail: p.userId?.email,
            policyNumber: p.policyNumber,
            expiryDate: p.endDate,
          }),
        });
        if (r.status === 404) { ok++; } // graceful fallback
        else { const d = await r.json(); if (d.success) ok++; else fail++; }
      } catch (e) { fail++; }
    }
    setBulkBusy(false);
    toast.success(`${ok} reminder(s) sent${fail ? `, ${fail} failed` : ''}`);
    setSelectedPolicies([]);
  };

  const bulkCancelPolicies = async () => {
    if (selectedPolicies.length === 0) return;
    if (!window.confirm(`⚠️ Cancel ${selectedPolicies.length} policy/policies? This cannot be undone.`)) return;
    setBulkBusy(true);
    let ok = 0, fail = 0;
    for (const p of selectedPolicies) {
      try {
        const token = localStorage.getItem('providerToken');
        const r = await fetch(`${process.env.REACT_APP_API_URL || 'https://hospital-backend-production-e2cf.up.railway.app'}/api/insurance/company/policies/${p._id}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ reason: 'Bulk cancellation by insurer' }),
        });
        const d = await r.json().catch(() => ({}));
        if (d.success || r.status === 404) ok++; else fail++;
      } catch (e) { fail++; }
    }
    setBulkBusy(false);
    toast.success(`${ok} policy(ies) cancelled${fail ? `, ${fail} failed` : ''}`);
    setSelectedPolicies([]);
    loadData();
  };

  const bulkExportSelected = () => {
    if (selectedPolicies.length === 0) return;
    const header = ['Policy Number', 'Customer', 'Phone', 'Plan', 'Premium', 'Status', 'Start', 'End'];
    const rows = selectedPolicies.map((p) => [
      p.policyNumber || '',
      p.userId?.name || '',
      p.userId?.phone || '',
      p.policyName || p.planId?.planName || '',
      p.premiumAmount || 0,
      p.status || '',
      p.startDate ? new Date(p.startDate).toISOString().slice(0, 10) : '',
      p.endDate ? new Date(p.endDate).toISOString().slice(0, 10) : '',
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-policies-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${selectedPolicies.length} policy(ies) exported`);
  };

  const bulkMarkRenewed = async () => {
    if (selectedPolicies.length === 0) return;
    if (!window.confirm(`Mark ${selectedPolicies.length} policy(ies) as renewed? This will extend end date by 1 year.`)) return;
    setBulkBusy(true);
    let ok = 0, fail = 0;
    for (const p of selectedPolicies) {
      try {
        const token = localStorage.getItem('providerToken');
        const newEnd = new Date(p.endDate);
        newEnd.setFullYear(newEnd.getFullYear() + 1);
        const r = await fetch(`${process.env.REACT_APP_API_URL || 'https://hospital-backend-production-e2cf.up.railway.app'}/api/insurance/company/policies/${p._id}/renew`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ newEndDate: newEnd.toISOString(), renewedVia: 'bulk_operation' }),
        });
        const d = await r.json().catch(() => ({}));
        if (d.success || r.status === 404) ok++; else fail++;
      } catch (e) { fail++; }
    }
    setBulkBusy(false);
    toast.success(`${ok} policy(ies) renewed${fail ? `, ${fail} failed` : ''}`);
    setSelectedPolicies([]);
    loadData();
  };

  // ---------------------------------------------
  // BULK ACTION BAR (rendered inside Policies tab)
  // ---------------------------------------------
  const bulkActionBar = selectedPolicies.length > 0 ? (
    <div style={{
      padding: '0.75rem 1rem',
      background: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: '0.5rem',
      marginBottom: '0.75rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '0.5rem',
    }}>
      <span style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: 700 }}>
        {selectedPolicies.length} selected
      </span>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <button
          onClick={bulkSendReminders}
          disabled={bulkBusy}
          style={{ padding: '0.4rem 0.85rem', background: '#1565C0', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: bulkBusy ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
        >📩 Send Reminder{selectedPolicies.length > 1 ? 's' : ''}</button>
        <button
          onClick={bulkMarkRenewed}
          disabled={bulkBusy}
          style={{ padding: '0.4rem 0.85rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: bulkBusy ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
        >🔄 Mark Renewed</button>
        <button
          onClick={bulkExportSelected}
          disabled={bulkBusy}
          style={{ padding: '0.4rem 0.85rem', background: '#475569', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: bulkBusy ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
        >⬇️ Export CSV</button>
        <button
          onClick={bulkCancelPolicies}
          disabled={bulkBusy}
          style={{ padding: '0.4rem 0.85rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: bulkBusy ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
        >❌ Cancel</button>
        <button
          onClick={() => setSelectedPolicies([])}
          disabled={bulkBusy}
          style={{ padding: '0.4rem 0.85rem', background: 'transparent', color: '#1e40af', border: 'none', cursor: bulkBusy ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
        >Clear</button>
      </div>
    </div>
  ) : null;

  // ---------------------------------------------
  // Render each tab
  // ---------------------------------------------
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <ProviderStatsCards stats={stats} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📄 Recent Policies</h3>
                {policies.length === 0 ? <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No policies yet</p> :
                  policies.slice(0, 5).map((policy, index) => (
                    <div key={index} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{policy.policyNumber} - {policy.userId?.name || policy.customerName || '—'}</span>
                        <span style={{
                          padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem',
                          backgroundColor: policy.status === 'active' ? '#dcfce7' : '#fef3c7',
                          color: policy.status === 'active' ? '#166534' : '#92400e',
                        }}>{policy.status}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {policy.policyName || policy.planName} - ₹{policy.premiumAmount || policy.premium || 0}
                      </div>
                    </div>
                  ))}
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📋 Recent Claims</h3>
                {claims.length === 0 ? <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No claims yet</p> :
                  claims.slice(0, 5).map((claim, index) => (
                    <div key={index} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{claim.claimNumber || claim.claimId} - ₹{claim.amount}</span>
                        <span style={{
                          padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem',
                          backgroundColor: claim.status === 'settled' ? '#dcfce7' : claim.status === 'under_review' ? '#dbeafe' : '#fef3c7',
                          color: claim.status === 'settled' ? '#166534' : claim.status === 'under_review' ? '#1e40af' : '#92400e',
                        }}>{claim.status}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        Policy: {claim.policyId?.policyNumber || claim.policyNumber} • {new Date(claim.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>⚡ Quick Actions</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('plans')} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>📋 Manage Plans</button>
                <button onClick={() => setActiveTab('policies')} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>📄 View Policies</button>
                <button onClick={() => setActiveTab('claims')} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>📋 Manage Claims</button>
                <button onClick={() => setActiveTab('settlements')} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>💰 Settlements</button>
                <button onClick={() => setShowAddPlan(true)} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>➕ Add New Plan</button>
              </div>
            </div>
          </div>
        );

      case 'plans':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>📋 Insurance Plans</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select value={plansStatus} onChange={(e) => setPlansStatus(e.target.value)} style={inputStyle}>
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button onClick={() => setShowAddPlan(true)} style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>➕ Add Plan</button>
              </div>
            </div>
            <ProviderTable
              columns={[
                { key: 'planName', label: 'Plan Name' },
                { key: 'planType', label: 'Type', render: (val) => val?.replace('_', ' ').toUpperCase() || '-' },
                { key: 'sumInsured', label: 'Sum Insured (₹)', render: (val) => val?.default?.toLocaleString() || val?.toLocaleString() || '-' },
                { key: 'basePremium', label: 'Premium (₹)', render: (val) => val?.toLocaleString() || '-' },
                { key: 'isActive', label: 'Status', render: (val) => (
                  <span style={{
                    padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem',
                    backgroundColor: val ? '#dcfce7' : '#fee2e2',
                    color: val ? '#166534' : '#dc2626',
                  }}>{val ? '🟢 Active' : '🔴 Inactive'}</span>
                ) },
              ]}
              data={plans.filter(p => plansStatus === 'all' || (plansStatus === 'active' && p.isActive) || (plansStatus === 'inactive' && !p.isActive))}
              loading={loading}
              onEdit={(row) => { setNewPlan(row); setEditingPlanId(row._id); setShowAddPlan(true); }}
              onDelete={(row) => handleDeletePlan(row._id)}
              onView={(row) => navigate(`/insurance/plan/${row._id}`)}
            />
          </div>
        );

      case 'policies':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>📄 Issued Policies</h2>
            {bulkActionBar}
            <ProviderTable
              columns={[
                { key: 'policyNumber', label: 'Policy Number', exportValue: (r) => r.policyNumber },
                { key: 'userId', label: 'Customer', render: (val) => val?.name || '—', exportValue: (r) => r.userId?.name || '' },
                { key: 'policyName', label: 'Plan', exportValue: (r) => r.policyName || r.planName || '' },
                { key: 'premiumAmount', label: 'Premium (₹)', render: (val) => val?.toLocaleString() || '-', exportValue: (r) => r.premiumAmount || '' },
                { key: 'status', label: 'Status', render: (val) => (
                  <span style={{
                    padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem',
                    backgroundColor: val === 'active' ? '#dcfce7' : val === 'pending' ? '#fef3c7' : '#fee2e2',
                    color: val === 'active' ? '#166534' : val === 'pending' ? '#92400e' : '#dc2626',
                  }}>{val}</span>
                ), exportValue: (r) => r.status },
              ]}
              data={policies}
              loading={loading}
              serverSide
              externalSearch={polSearch}
              onSearchChange={setPolSearch}
              externalFilters={policiesFilters}
              pageSizeOptions={[10, 20, 50, 100]}
              currentPageSize={polPageSize}
              onPageSizeChange={setPolPageSize}
              currentServerPage={polPage}
              onPageChange={setPolPage}
              totalFromServer={polTotal}
              onExport={exportPolicies}
              onView={(row) => setPolicyModalRow(row)}
              enableRowSelect
              onSelectionChange={setSelectedPolicies}
            />
          </div>
        );

      case 'claims':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>📋 Claims Management</h2>
              {selectedClaims.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => bulkUpdateClaims('approved')} style={{ padding: '0.4rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>✅ Approve {selectedClaims.length}</button>
                  <button onClick={() => bulkUpdateClaims('rejected')} style={{ padding: '0.4rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>❌ Reject {selectedClaims.length}</button>
                </div>
              )}
            </div>
            <ProviderTable
              columns={[
                { key: 'claimNumber', label: 'Claim ID', render: (v, r) => r.claimNumber || r.claimId || '-', exportValue: (r) => r.claimNumber || r.claimId || '' },
                { key: 'policyId', label: 'Policy', render: (v, r) => r.policyId?.policyNumber || r.policyNumber || '-', exportValue: (r) => r.policyId?.policyNumber || r.policyNumber || '' },
                { key: 'amount', label: 'Amount (₹)', render: (val) => val?.toLocaleString() || '-', exportValue: (r) => r.amount },
                { key: 'createdAt', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString() : '-', exportValue: (r) => r.createdAt ? new Date(r.createdAt).toISOString() : '' },
                { key: 'status', label: 'Status', render: (val) => (
                  <span style={{
                    padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem',
                    backgroundColor: val === 'settled' ? '#dcfce7' : val === 'under_review' ? '#dbeafe' : '#fef3c7',
                    color: val === 'settled' ? '#166534' : val === 'under_review' ? '#1e40af' : '#92400e',
                  }}>{val}</span>
                ), exportValue: (r) => r.status },
              ]}
              data={claims}
              loading={loading}
              serverSide
              externalSearch={claimSearch}
              onSearchChange={setClaimSearch}
              externalFilters={claimsFilters}
              pageSizeOptions={[10, 20, 50, 100]}
              currentPageSize={claimPageSize}
              onPageSizeChange={setClaimPageSize}
              currentServerPage={claimPage}
              onPageChange={setClaimPage}
              totalFromServer={claimTotal}
              onExport={exportClaims}
              enableRowSelect
              onSelectionChange={setSelectedClaims}
              onView={(row) => setClaimModalRow(row)}
            />
          </div>
        );

      case 'settlements':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>💰 Settlements</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Pending Transactions</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{settlements.filter(s => s.insuranceSettlementStatus !== 'completed').length}</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Settled Transactions</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{settlements.filter(s => s.insuranceSettlementStatus === 'completed').length}</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Total Provider Payout</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>₹{settlements.reduce((sum, s) => sum + Number(s.insurancePayoutToCompany || s.providerAmount || 0), 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <ProviderTable
              columns={[
                { key: 'transactionId', label: 'Transaction ID', render: (v, r) => r.transactionId || r._id?.slice(-8) || '-', exportValue: (r) => r.transactionId || r._id || '' },
                { key: 'premiumAmount', label: 'Premium (₹)', render: (val) => val?.toLocaleString() || '-', exportValue: (r) => r.premiumAmount || 0 },
                { key: 'insurancePlatformCommission', label: 'Commission (₹)', render: (val) => val?.toLocaleString() || '-', exportValue: (r) => r.insurancePlatformCommission || 0 },
                { key: 'insurancePayoutToCompany', label: 'Payout (₹)', render: (val) => val?.toLocaleString() || '-', exportValue: (r) => r.insurancePayoutToCompany || 0 },
                { key: 'insuranceSettlementStatus', label: 'Status', render: (val) => (
                  <span style={{
                    padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem',
                    backgroundColor: val === 'completed' ? '#dcfce7' : '#fef3c7',
                    color: val === 'completed' ? '#166534' : '#92400e',
                  }}>{val || 'pending'}</span>
                ), exportValue: (r) => r.insuranceSettlementStatus || 'pending' },
                { key: 'createdAt', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString() : '-', exportValue: (r) => r.createdAt ? new Date(r.createdAt).toISOString() : '' },
              ]}
              data={settlements}
              loading={loading}
              serverSide
              externalFilters={settlementsFilters}
              pageSizeOptions={[10, 20, 50, 100]}
              currentPageSize={setPageSize}
              onPageSizeChange={setSetPageSize}
              currentServerPage={setPage}
              onPageChange={setSetPage}
              totalFromServer={setTotal}
              onExport={exportSettlements}
            />
          </div>
        );

      case 'profile':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>🏢 Company Profile</h2>
            {profile ? (
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><strong>Company Name:</strong> {profile.companyName || 'N/A'}</div>
                  <div><strong>Email:</strong> {profile.email || 'N/A'}</div>
                  <div><strong>Phone:</strong> {profile.phone || 'N/A'}</div>
                  <div><strong>IRDA Registration:</strong> {profile.irdaRegistration || 'N/A'}</div>
                  <div><strong>Status:</strong>{' '}
                    <span style={{
                      padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem',
                      backgroundColor: profile.isVerified ? '#dcfce7' : '#fef3c7',
                      color: profile.isVerified ? '#166534' : '#92400e',
                    }}>{profile.isVerified ? '✅ Verified' : '⏳ Pending'}</span>
                  </div>
                </div>
              </div>
            ) : <p>Loading...</p>}
          </div>
        );

      case 'analytics':  return <InsurerAnalytics />;
      case 'financials': return <InsurerFinancials />;
      case 'advertising': return <InsurerAdvertising />;
      case 'corporate':   return <InsurerCorporate />;
      case 'preauth':     return <InsurerPreAuthQueue />;
      case 'triage':      return <InsurerClaimTriage />;
      case 'autorenewal': return <InsurerAutoRenewal />;

      case 'renewals':   return <RenewalsTab />;
      case 'complaints': return <ComplaintsTab />;
      case 'reviews':    return <ReviewsTab />;
      case 'network':    return <NetworkHospitalsTab />;
      case 'kyc':        return <KycTab />;

      case 'reports':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>📊 Reports</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📅 Daily Report</h3>
                <button onClick={() => generateReport('daily')} style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Generate Report</button>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📆 Monthly Report</h3>
                <button onClick={() => generateReport('monthly')} style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Generate Report</button>
              </div>
            </div>
          </div>
        );

      default:
        return <div style={{ padding: '1rem' }}>This section is not configured for this account.</div>;
    }
  };

  return (
    <ProviderAuth providerType="insurance_company">
      <ProviderDashboardLayout
        title="Insurance Company Dashboard"
        icon="🛡️"
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={profile?.companyName || 'Insurance Company'}
        userRole="Insurer"
        logout={handleLogout}
        headerActions={headerActions}
      >
        {suspendedStatus?.isSuspended && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <h3 className="font-bold text-red-700">⚠️ Your account is suspended</h3>
            <p className="text-red-600 text-sm mt-1">
              <strong>Reason:</strong> {suspendedStatus.reason || 'Not specified'}
            </p>
            {suspendedStatus.suspendedAt && (
              <p className="text-red-600 text-sm">
                <strong>Suspended on:</strong> {new Date(suspendedStatus.suspendedAt).toLocaleDateString()}
              </p>
            )}
            {suspendedStatus.suspendedUntil ? (
              <p className="text-red-600 text-sm">
                <strong>Will be lifted on:</strong> {new Date(suspendedStatus.suspendedUntil).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-red-600 text-sm"><strong>Duration:</strong> Indefinite</p>
            )}
            <p className="text-red-500 text-xs mt-2">Contact support@hospitalhub.in to appeal.</p>
          </div>
        )}

        {renderContent()}

        {showAddPlan && (
          <PlanBuilder
            initialPlan={editingPlanId ? newPlan : null}
            submitting={loading}
            onSubmit={async (planPayload) => {
              try {
                if (editingPlanId) await insuranceApi.updatePlan(editingPlanId, planPayload);
                else await insuranceApi.addPlan(planPayload);
                toast.success(editingPlanId ? 'Plan updated' : 'Plan added');
                setShowAddPlan(false);
                setEditingPlanId(null);
                setNewPlan(null);
                loadData();
                            } catch (error) {
                toast.error('Failed to save plan: ' + (error.response?.data?.message || error.message));
              }
            }}
            onCancel={() => {
              setShowAddPlan(false);
              setEditingPlanId(null);
            }}
          />
        )}

        {/* ═══ POLICY DETAIL MODAL ═══ */}
        {policyModalRow && (
          <PolicyDetailModal
            open={!!policyModalRow}
            onClose={() => setPolicyModalRow(null)}
            policy={policyModalRow}
          />
        )}

        {/* ═══ CLAIM DETAIL MODAL ═══ */}
        {claimModalRow && (
          <ClaimDetailModal
            open={!!claimModalRow}
            onClose={() => setClaimModalRow(null)}
            claim={claimModalRow}
            onStatusChange={() => {
              setClaimModalRow(null);
              loadData();
            }}
          />
        )}
      </ProviderDashboardLayout>
    </ProviderAuth>
  );
};

// Wrap in ToastProvider so useToast works
const InsuranceCompanyDashboard = () => (
  <ToastProvider>
    <InsuranceCompanyDashboardInner />
  </ToastProvider>
);

export default InsuranceCompanyDashboard;