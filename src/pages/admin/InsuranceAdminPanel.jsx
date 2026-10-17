// D:\hospital-frontend\src\pages\admin\InsuranceAdminPanel.jsx
// ============================================
// INSURANCE ADMIN PANEL — 13 TABS
// ============================================
// Mirrors AyurvedaAdminPanel.jsx structure
// Tabs: Overview, Companies, Plans, Policies, Claims, Pending,
//       Settlements, Reviews, Complaints, KYC, Suspended, Corporate, Advertising
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Use a fresh axios instance so no global interceptors hijack our requests
const adminAxios = axios.create();
import {
  FaSync, FaArrowLeft, FaEye, FaCheck, FaTimes, FaBan,
  FaChartBar, FaBell, FaExclamationTriangle, FaStar, FaIdCard,
  FaBuilding, FaRupeeSign, FaFileAlt, FaClipboardList, FaBullhorn
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-e2d5.up.railway.app';
// Admin auth uses JWT from localStorage (adminToken). No hardcoded key.

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'companies', label: '🏢 Companies' },
  { id: 'plans', label: '📋 Plans' },
  { id: 'policies', label: '📄 Policies' },
  { id: 'claims', label: '📋 Claims' },
  { id: 'pending', label: '⏳ Pending' },
  { id: 'settlements', label: '💰 Settlements' },
  { id: 'reviews', label: '⭐ Reviews' },
  { id: 'complaints', label: '🚨 Complaints' },
  { id: 'kyc', label: '📋 KYC' },
  { id: 'suspended', label: '🚫 Suspended' },
  { id: 'corporate', label: '🏢 Corporate' },
  { id: 'advertising', label: '📢 Advertising' }
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// ============================================
// MAIN COMPONENT
// ============================================

export default function InsuranceAdminPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Data stores
  const [overview, setOverview] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [pending, setPending] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [kycPending, setKycPending] = useState([]);
  const [suspended, setSuspended] = useState([]);
  const [corporatePending, setCorporatePending] = useState([]);
  const [adCampaigns, setAdCampaigns] = useState([]);
  const [adRevenue, setAdRevenue] = useState(null);

  // Modals
  const [rejectModal, setRejectModal] = useState(null); // { type, id, label }
  const [suspendModal, setSuspendModal] = useState(null); // { id, label }
  const [selectedItem, setSelectedItem] = useState(null);

  // Helpers
    const headers = useMemo(() => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}, []);

  const addNotification = useCallback((message, type = 'info') => {
    setNotifications(prev => [{ id: Date.now(), message, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
  }, []);

  // ============================================
  // DATA LOADING
  // ============================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      switch (tab) {
        case 'overview': {
          const res = await adminAxios.get(`${API_BASE}/api/insurance/admin/overview`, { headers });
          setOverview(res.data?.data || null);
          break;
        }
        case 'companies': {
          const res = await adminAxios.get(`${API_BASE}/api/insurance/admin/companies`, { headers });
          setCompanies(res.data?.data || []);
          break;
        }
        case 'plans': {
          const res = await adminAxios.get(`${API_BASE}/api/insurance/admin/plans`, { headers });
          setPlans(res.data?.data || []);
          break;
        }
        case 'policies': {
          const res = await adminAxios.get(`${API_BASE}/api/insurance/admin/policies`, { headers });
          setPolicies(res.data?.data || []);
          break;
        }
        case 'claims': {
          const res = await adminAxios.get(`${API_BASE}/api/insurance/admin/claims`, { headers });
          setClaims(res.data?.data || []);
          break;
        }
        case 'pending': {
          const res = await adminAxios.get(`${API_BASE}/api/insurance/admin/pending`, { headers });
          setPending(res.data?.data || null);
          break;
        }
        case 'settlements': {
          const res = await adminAxios.get(`${API_BASE}/api/insurance/admin/settlements`, { headers });
          setSettlements(res.data?.data || []);
          break;
        }
        case 'reviews': {
          const res = await adminAxios.get(`${API_BASE}/api/insurance/admin/reviews`, { headers });
          setReviews(res.data?.data || []);
          break;
        }
        case 'complaints': {
          const res = await adminAxios.get(`${API_BASE}/api/insurance/admin/complaints`, { headers });
          setComplaints(res.data?.data || []);
          break;
        }
        case 'kyc': {
          const res = await adminAxios.get(`${API_BASE}/api/insurance/admin/kyc/pending`, { headers });
          setKycPending(res.data?.data || []);
          break;
        }
        case 'suspended': {
          const res = await adminAxios.get(`${API_BASE}/api/insurance/admin/suspended`, { headers });
          setSuspended(res.data?.data || []);
          break;
        }
        case 'corporate': {
          const res = await adminAxios.get(`${API_BASE}/api/insurance/admin/corporate/pending`, { headers });
          setCorporatePending(res.data?.data || []);
          break;
        }
        case 'advertising': {
          const [camps, rev] = await Promise.all([
            axios.get(`${API_BASE}/api/insurance/admin/ads/campaigns`, { headers }).catch(() => ({ data: { data: [] } })),
            axios.get(`${API_BASE}/api/insurance/admin/ads/revenue`, { headers }).catch(() => ({ data: { data: null } }))
          ]);
          setAdCampaigns(camps.data?.data || []);
          setAdRevenue(rev.data?.data || null);
          break;
        }
        default:
          break;
      }
    } catch (e) {
      console.error('Load error:', e);
      setError(e.response?.data?.error?.message || e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [tab, headers]);

  useEffect(() => { loadData(); }, [loadData]);

  // ============================================
  // ACTIONS
  // ============================================

  const action = useCallback(async (fn, successMsg) => {
    try {
      await fn();
      addNotification(successMsg || 'Done', 'success');
      loadData();
    } catch (e) {
      addNotification(e.response?.data?.error?.message || e.message || 'Failed', 'error');
    }
  }, [addNotification, loadData]);

  const approveCompany = (id) => action(
    () => axios.post(`${API_BASE}/api/insurance/admin/companies/${id}/approve`, {}, { headers }),
    'Company approved'
  );

  const rejectCompany = async (id, reason) => {
    await action(
      () => axios.post(`${API_BASE}/api/insurance/admin/companies/${id}/reject`, { reason }, { headers }),
      'Company rejected'
    );
    setRejectModal(null);
  };

  const suspendCompany = async (id, reason, until) => {
  try {
    await axios.post(
      `${API_BASE}/api/insurance/admin/companies/${id}/suspend`,
      { reason, until },
      { headers }
    );
    addNotification('Company suspended', 'success');
    setSuspendModal(null);
    // Force reload both the current tab and the suspended tab data
    await loadData();
  } catch (e) {
    addNotification(e.response?.data?.message || e.message || 'Suspend failed', 'error');
  }
};

  const unsuspendCompany = (id) => action(
    () => axios.post(`${API_BASE}/api/insurance/admin/companies/${id}/unsuspend`, {}, { headers }),
    'Company unsuspended'
  );

  const approvePlan = (id) => action(
    () => axios.post(`${API_BASE}/api/insurance/admin/plans/${id}/approve`, {}, { headers }),
    'Plan approved'
  );

  const rejectPlan = async (id, reason) => {
    await action(
      () => axios.post(`${API_BASE}/api/insurance/admin/plans/${id}/reject`, { reason }, { headers }),
      'Plan rejected'
    );
    setRejectModal(null);
  };

  const togglePlan = (id) => action(
    () => axios.post(`${API_BASE}/api/insurance/admin/plans/${id}/toggle`, {}, { headers }),
    'Plan toggled'
  );

  const forceCancelPolicy = async (id) => {
    const reason = window.prompt('Reason for force-cancel?');
    if (!reason) return;
    action(
      () => axios.post(`${API_BASE}/api/insurance/admin/policies/${id}/force-cancel`, { reason }, { headers }),
      'Policy cancelled'
    );
  };

  const escalateComplaint = (id) => {
    const note = window.prompt('Escalation note (optional):') || 'Escalated by admin';
    action(
      () => axios.post(`${API_BASE}/api/insurance/admin/complaints/${id}/escalate`, { note }, { headers }),
      'Complaint escalated'
    );
  };

  const verifyKyc = (id) => action(
    () => axios.post(`${API_BASE}/api/insurance/admin/kyc/${id}/verify`, {}, { headers }),
    'KYC verified'
  );

  const rejectKyc = (id) => {
    const reason = window.prompt('Rejection reason:');
    if (!reason) return;
    action(
      () => axios.post(`${API_BASE}/api/insurance/admin/kyc/${id}/reject`, { reason }, { headers }),
      'KYC rejected'
    );
  };

  const flagReview = (policyId) => {
    const reason = window.prompt('Flag reason:') || 'Flagged by admin';
    action(
      () => axios.post(`${API_BASE}/api/insurance/admin/reviews/${policyId}/flag`, { reason }, { headers }),
      'Review flagged'
    );
  };

  const hideReview = (policyId) => {
    const reason = window.prompt('Hide reason:') || 'Hidden by admin';
    action(
      () => axios.post(`${API_BASE}/api/insurance/admin/reviews/${policyId}/hide`, { reason }, { headers }),
      'Review hidden'
    );
  };

  const approveAdCampaign = (id) => action(
    () => axios.post(`${API_BASE}/api/insurance/admin/ads/campaigns/${id}/approve`, {}, { headers }),
    'Campaign approved'
  );

  const rejectAdCampaign = (id) => {
    const reason = window.prompt('Rejection reason:');
    if (!reason) return;
    action(
      () => axios.post(`${API_BASE}/api/insurance/admin/ads/campaigns/${id}/reject`, { reason }, { headers }),
      'Campaign rejected'
    );
  };

  const pauseAdCampaign = (id) => action(
    () => axios.post(`${API_BASE}/api/insurance/admin/ads/campaigns/${id}/pause`, {}, { headers }),
    'Campaign paused'
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={() => navigate('/admin')} style={styles.backBtn} title="Back to Admin">
            <FaArrowLeft />
          </button>
          <h1 style={styles.title}>🛡️ Insurance Admin Panel</h1>
        </div>
        <div style={styles.headerRight}>
          <button onClick={loadData} style={styles.actionBtn}>
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div style={styles.notifBar}>
          {notifications.slice(0, 3).map(n => (
            <div key={n.id} style={{ ...styles.notifItem, color: n.type === 'error' ? '#dc2626' : '#059669' }}>
              {n.message}
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabBar}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{ ...styles.tabBtn, ...(tab === t.id ? styles.tabBtnActive : {}) }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {loading && <p style={styles.loading}>Loading…</p>}
        {error && <p style={styles.error}>⚠️ {error}</p>}
        {!loading && !error && (
          <>
            {tab === 'overview' && <OverviewTab data={overview} />}
            {tab === 'companies' && (
              <CompaniesTab
                companies={companies}
                onApprove={approveCompany}
                onReject={(id) => setRejectModal({ type: 'company', id, label: 'company' })}
                onSuspend={(id) => setSuspendModal({ id })}
                onUnsuspend={unsuspendCompany}
              />
            )}
            {tab === 'plans' && (
              <PlansTab
                plans={plans}
                onApprove={approvePlan}
                onReject={(id) => setRejectModal({ type: 'plan', id, label: 'plan' })}
                onToggle={togglePlan}
              />
            )}
            {tab === 'policies' && (
              <PoliciesTab policies={policies} onForceCancel={forceCancelPolicy} />
            )}
            {tab === 'claims' && <ClaimsTab claims={claims} />}
            {tab === 'pending' && <PendingTab data={pending} />}
            {tab === 'settlements' && <SettlementsTab settlements={settlements} />}
            {tab === 'reviews' && (
              <ReviewsTab reviews={reviews} onFlag={flagReview} onHide={hideReview} />
            )}
            {tab === 'complaints' && (
              <ComplaintsTab complaints={complaints} onEscalate={escalateComplaint} />
            )}
            {tab === 'kyc' && (
              <KycTab companies={kycPending} onVerify={verifyKyc} onReject={rejectKyc} />
            )}
            {tab === 'suspended' && (
              <SuspendedTab companies={suspended} onUnsuspend={unsuspendCompany} />
            )}
            {tab === 'corporate' && <CorporateTab plans={corporatePending} onApprove={approvePlan} />}
            {tab === 'advertising' && (
              <AdvertisingTab
                campaigns={adCampaigns}
                revenue={adRevenue}
                onApprove={approveAdCampaign}
                onReject={rejectAdCampaign}
                onPause={pauseAdCampaign}
              />
            )}
          </>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <RejectModal
          label={rejectModal.label}
          onCancel={() => setRejectModal(null)}
          onConfirm={(reason) => {
            if (rejectModal.type === 'company') rejectCompany(rejectModal.id, reason);
            if (rejectModal.type === 'plan') rejectPlan(rejectModal.id, reason);
          }}
        />
      )}

      {/* Suspend Modal */}
      {suspendModal && (
        <SuspendModal
          onCancel={() => setSuspendModal(null)}
          onConfirm={(reason, until) => suspendCompany(suspendModal.id, reason, until)}
        />
      )}
    </div>
  );
}

// ============================================
// TAB COMPONENTS
// ============================================

function OverviewTab({ data }) {
  if (!data) return <p>No data yet.</p>;

  const { companies, plans, policies, claims, revenue, trend } = data;

  const chartData = (trend || []).map(t => ({
    date: t._id?.slice(5) || '',
    policies: t.policies || 0,
    premium: t.premium || 0
  }));

  const claimsPie = [
    { name: 'Pending', value: claims?.pending || 0, color: '#f59e0b' },
    { name: 'Approved', value: claims?.approved || 0, color: '#3b82f6' },
    { name: 'Settled', value: claims?.settled || 0, color: '#10b981' },
    { name: 'Rejected', value: claims?.rejected || 0, color: '#ef4444' }
  ].filter(d => d.value > 0);

  return (
    <div>
      {/* Top stat cards */}
      <div style={styles.statsGrid}>
        <StatCard label="Companies" value={companies?.total || 0} sub={`${companies?.active || 0} active • ${companies?.pending || 0} pending`} color="#3b82f6" />
        <StatCard label="Plans" value={plans?.total || 0} sub={`${plans?.active || 0} active • ${plans?.pending || 0} pending`} color="#10b981" />
        <StatCard label="Policies" value={policies?.total || 0} sub={`${policies?.active || 0} active • ${policies?.pending || 0} pending`} color="#8b5cf6" />
        <StatCard label="Claims" value={claims?.total || 0} sub={`${claims?.pending || 0} pending • ${claims?.settled || 0} settled`} color="#f59e0b" />
        <StatCard label="Total Premium" value={`₹${(revenue?.totalPremium || 0).toLocaleString('en-IN')}`} color="#10b981" />
        <StatCard label="Commission" value={`₹${(revenue?.totalCommission || 0).toLocaleString('en-IN')}`} color="#8b5cf6" />
        <StatCard label="Payout to Companies" value={`₹${(revenue?.totalPayout || 0).toLocaleString('en-IN')}`} color="#3b82f6" />
      </div>

      {/* Charts */}
      <div style={styles.chartsRow}>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>📈 Last 30 Days Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="policies" fill="#3b82f6" name="Policies Sold" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={styles.empty}>No trend data yet.</p>}
        </div>

        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>📊 Claims Distribution</h3>
          {claimsPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={claimsPie} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                  {claimsPie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={styles.empty}>No claims yet.</p>}
        </div>
      </div>
    </div>
  );
}

function CompaniesTab({ companies, onApprove, onReject, onSuspend, onUnsuspend }) {
  if (!companies?.length) return <p style={styles.empty}>No companies found.</p>;

  return (
    <div>
      <h2 style={styles.tabTitle}>🏢 Companies ({companies.length})</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>IRDAI Reg</Th>
            <Th>Email</Th>
            <Th>Phone</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {companies.map(c => {
            const s = c.verificationStatus || c.status || '';
            const isPending = ['pending', 'pending_verification', 'pending_approval'].includes(s);
            const isVerified = ['verified', 'active', 'approved'].includes(s);
            const isSuspended = s === 'suspended';
            const isInactive = s === 'inactive' || s === 'rejected';

            return (
              <tr key={c._id} style={styles.tr}>
                <Td><strong>{c.companyName}</strong></Td>
                <Td>{c.irdaRegistration || '—'}</Td>
                <Td>{c.email || '—'}</Td>
                <Td>{c.phone || '—'}</Td>
                <Td><StatusBadge status={s} /></Td>
                <Td>
                  {isPending && (
                    <>
                      <button onClick={() => onApprove(c._id)} style={styles.okBtn} title="Approve"><FaCheck /> Approve</button>
                      <button onClick={() => onReject(c._id)} style={styles.errBtn} title="Reject"><FaTimes /> Reject</button>
                    </>
                  )}
                  {isVerified && (
                    <button onClick={() => onSuspend(c._id)} style={styles.warnBtn} title="Suspend"><FaBan /> Suspend</button>
                  )}
                  {isSuspended && (
                    <button onClick={() => onUnsuspend(c._id)} style={styles.okBtn} title="Unsuspend">✓ Unsuspend</button>
                  )}
                  {isInactive && (
                    <button onClick={() => onApprove(c._id)} style={styles.okBtn} title="Reactivate"><FaCheck /> Activate</button>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PlansTab({ plans, onApprove, onReject, onToggle }) {
  if (!plans?.length) return <p style={styles.empty}>No plans found.</p>;

  return (
    <div>
      <h2 style={styles.tabTitle}>📋 Plans ({plans.length})</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <Th>Plan Name</Th>
            <Th>Company</Th>
            <Th>Type</Th>
            <Th>Premium</Th>
            <Th>Verified</Th>
            <Th>Active</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {plans.map(p => (
            <tr key={p._id} style={styles.tr}>
              <Td><strong>{p.planName}</strong></Td>
              <Td>{p.companyId?.companyName || '—'}</Td>
              <Td>{p.planType}</Td>
              <Td>₹{(p.basePremium || 0).toLocaleString('en-IN')}</Td>
              <Td>{p.isVerified ? '✅' : '⏳'}</Td>
              <Td>{p.isActive ? '🟢' : '🔴'}</Td>
              <Td>
                {!p.isVerified && (
                  <>
                    <button onClick={() => onApprove(p._id)} style={styles.okBtn}><FaCheck /></button>
                    <button onClick={() => onReject(p._id)} style={styles.errBtn}><FaTimes /></button>
                  </>
                )}
                {p.isVerified && (
                  <button onClick={() => onToggle(p._id)} style={styles.warnBtn}>Toggle</button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PoliciesTab({ policies, onForceCancel }) {
  if (!policies?.length) return <p style={styles.empty}>No policies found.</p>;

  return (
    <div>
      <h2 style={styles.tabTitle}>📄 Policies ({policies.length})</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <Th>Policy No</Th>
            <Th>Customer</Th>
            <Th>Plan</Th>
            <Th>Premium</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {policies.map(p => (
            <tr key={p._id} style={styles.tr}>
              <Td>{p.policyNumber}</Td>
              <Td>{p.primaryInsured?.name || '—'}</Td>
              <Td>{p.planId?.planName || '—'}</Td>
              <Td>₹{(p.premiumAmount || 0).toLocaleString('en-IN')}</Td>
              <Td><StatusBadge status={p.status} /></Td>
              <Td>
                {p.status === 'active' && (
                  <button onClick={() => onForceCancel(p._id)} style={styles.errBtn}>Force Cancel</button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClaimsTab({ claims }) {
  if (!claims?.length) return <p style={styles.empty}>No claims found.</p>;

  return (
    <div>
      <h2 style={styles.tabTitle}>📋 Claims ({claims.length})</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <Th>Claim No</Th>
            <Th>Policy</Th>
            <Th>Customer</Th>
            <Th>Amount</Th>
            <Th>Hospital</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {claims.map(c => (
            <tr key={c._id} style={styles.tr}>
              <Td>{c.claimNumber}</Td>
              <Td>{c.policyId?.policyNumber || '—'}</Td>
              <Td>{c.userId?.name || '—'}</Td>
              <Td>₹{(c.amount || 0).toLocaleString('en-IN')}</Td>
              <Td>{c.hospitalName || '—'}</Td>
              <Td><StatusBadge status={c.status} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PendingTab({ data }) {
  if (!data) return <p>No pending data.</p>;

  const total = data.totalPending || 0;
  if (total === 0) return <p style={styles.empty}>✅ All caught up — nothing pending.</p>;

  return (
    <div>
      <h2 style={styles.tabTitle}>⏳ Pending Queue ({total})</h2>

      {data.companies?.length > 0 && (
        <div style={styles.pendingSection}>
          <h3 style={styles.pendingTitle}>🏢 Companies ({data.companies.length})</h3>
          {data.companies.map(c => (
            <div key={c._id} style={styles.pendingItem}>
              <strong>{c.companyName}</strong> — {c.email} — {c.phone}
            </div>
          ))}
        </div>
      )}

      {data.plans?.length > 0 && (
        <div style={styles.pendingSection}>
          <h3 style={styles.pendingTitle}>📋 Plans ({data.plans.length})</h3>
          {data.plans.map(p => (
            <div key={p._id} style={styles.pendingItem}>
              <strong>{p.planName}</strong> — {p.companyId?.companyName}
            </div>
          ))}
        </div>
      )}

      {data.kyc?.length > 0 && (
        <div style={styles.pendingSection}>
          <h3 style={styles.pendingTitle}>📋 KYC ({data.kyc.length})</h3>
          {data.kyc.map(k => (
            <div key={k._id} style={styles.pendingItem}>
              <strong>{k.companyName}</strong> — submitted {k.documents?.submittedAt ? new Date(k.documents.submittedAt).toLocaleDateString() : '—'}
            </div>
          ))}
        </div>
      )}

      {data.claims?.length > 0 && (
        <div style={styles.pendingSection}>
          <h3 style={styles.pendingTitle}>📋 Claims ({data.claims.length})</h3>
          {data.claims.map(cl => (
            <div key={cl._id} style={styles.pendingItem}>
              <strong>{cl.claimNumber}</strong> — ₹{(cl.amount || 0).toLocaleString('en-IN')} — {cl.policyId?.policyNumber}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettlementsTab({ settlements }) {
  if (!settlements?.length) return <p style={styles.empty}>No pending settlements.</p>;

  return (
    <div>
      <h2 style={styles.tabTitle}>💰 Pending Settlements ({settlements.length})</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <Th>Txn ID</Th>
            <Th>Company</Th>
            <Th>Amount</Th>
            <Th>Commission</Th>
            <Th>Net Payout</Th>
            <Th>Date</Th>
          </tr>
        </thead>
        <tbody>
          {settlements.map(s => (
            <tr key={s._id} style={styles.tr}>
              <Td>{s.transactionId?.slice(0, 12)}…</Td>
              <Td>{s.providerId?.companyName || s.providerId?.name || '—'}</Td>
              <Td>₹{(s.premiumAmount || 0).toLocaleString('en-IN')}</Td>
              <Td>₹{(s.insurancePlatformCommission || 0).toLocaleString('en-IN')}</Td>
              <Td><strong>₹{(s.insurancePayoutToCompany || 0).toLocaleString('en-IN')}</strong></Td>
              <Td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReviewsTab({ reviews, onFlag, onHide }) {
  if (!reviews?.length) return <p style={styles.empty}>No reviews.</p>;

  return (
    <div>
      <h2 style={styles.tabTitle}>⭐ Reviews ({reviews.length})</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <Th>Policy</Th>
            <Th>Company</Th>
            <Th>Rating</Th>
            <Th>Comment</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {reviews.map(r => (
            <tr key={r.policyId} style={styles.tr}>
              <Td>{r.policyNumber}</Td>
              <Td>{r.companyName}</Td>
              <Td>⭐ {r.rating}/5</Td>
              <Td style={{ maxWidth: 260 }}>{(r.comment || '').slice(0, 80)}{(r.comment || '').length > 80 ? '…' : ''}</Td>
              <Td>
                {r.isHidden && <StatusBadge status="hidden" />}
                {!r.isHidden && r.isFlagged && <StatusBadge status="flagged" />}
                {!r.isHidden && !r.isFlagged && <StatusBadge status="visible" />}
              </Td>
              <Td>
                {!r.isFlagged && !r.isHidden && (
                  <button onClick={() => onFlag(r.policyId)} style={styles.warnBtn}>🚩 Flag</button>
                )}
                {!r.isHidden && (
                  <button onClick={() => onHide(r.policyId)} style={styles.errBtn}>🙈 Hide</button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComplaintsTab({ complaints, onEscalate }) {
  if (!complaints?.length) return <p style={styles.empty}>No complaints.</p>;

  return (
    <div>
      <h2 style={styles.tabTitle}>🚨 Complaints ({complaints.length})</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <Th>Policy</Th>
            <Th>Category</Th>
            <Th>Description</Th>
            <Th>Priority</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {complaints.map(c => (
            <tr key={c._id} style={styles.tr}>
              <Td>{c.policyId?.policyNumber || '—'}</Td>
              <Td>{c.category}</Td>
              <Td style={{ maxWidth: 260 }}>{(c.description || '').slice(0, 80)}…</Td>
              <Td>{c.priority}</Td>
              <Td><StatusBadge status={c.status} /></Td>
              <Td>
                {c.status !== 'escalated' && c.status !== 'resolved' && (
                  <button onClick={() => onEscalate(c._id)} style={styles.errBtn}>⚠️ Escalate</button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KycTab({ companies, onVerify, onReject }) {
  if (!companies?.length) return <p style={styles.empty}>✅ No pending KYC.</p>;

  return (
    <div>
      <h2 style={styles.tabTitle}>📋 Pending KYC ({companies.length})</h2>
      {companies.map(c => (
        <div key={c._id} style={styles.kycCard}>
          <div style={styles.kycHeader}>
            <strong>{c.companyName}</strong>
            <span>📧 {c.email} • 📞 {c.phone}</span>
          </div>
          <div style={styles.kycBody}>
            <div><strong>PAN:</strong> {c.documents?.panNumber || '—'}</div>
            <div><strong>GST:</strong> {c.documents?.gstNumber || '—'}</div>
            <div style={styles.kycDocs}>
              {c.documents?.irdaCertificate && <a href={c.documents.irdaCertificate} target="_blank" rel="noreferrer">📄 IRDAI</a>}
              {c.documents?.gstCertificate && <a href={c.documents.gstCertificate} target="_blank" rel="noreferrer">📄 GST</a>}
              {c.documents?.panCard && <a href={c.documents.panCard} target="_blank" rel="noreferrer">📄 PAN</a>}
              {c.documents?.bankProof && <a href={c.documents.bankProof} target="_blank" rel="noreferrer">📄 Bank</a>}
            </div>
          </div>
          <div style={styles.kycActions}>
            <button onClick={() => onVerify(c._id)} style={styles.okBtn}><FaCheck /> Verify</button>
            <button onClick={() => onReject(c._id)} style={styles.errBtn}><FaTimes /> Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SuspendedTab({ companies, onUnsuspend }) {
  if (!companies?.length) return <p style={styles.empty}>✅ No suspended companies.</p>;

  return (
    <div>
      <h2 style={styles.tabTitle}>🚫 Suspended ({companies.length})</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <Th>Company</Th>
            <Th>Phone</Th>
            <Th>Suspended On</Th>
            <Th>Until</Th>
            <Th>Reason</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {companies.map(c => (
            <tr key={c._id} style={styles.tr}>
              <Td><strong>{c.companyName}</strong></Td>
              <Td>{c.phone || '—'}</Td>
              <Td>{c.suspendedAt ? new Date(c.suspendedAt).toLocaleDateString() : '—'}</Td>
              <Td>{c.suspendedUntil ? new Date(c.suspendedUntil).toLocaleDateString() : 'Indefinite'}</Td>
              <Td>{c.suspendedReason || '—'}</Td>
              <Td>
                <button onClick={() => onUnsuspend(c._id)} style={styles.okBtn}>Unsuspend</button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CorporateTab({ plans, onApprove }) {
  if (!plans?.length) return <p style={styles.empty}>No pending corporate plans.</p>;

  return (
    <div>
      <h2 style={styles.tabTitle}>🏢 Pending Corporate Plans ({plans.length})</h2>
      {plans.map(p => (
        <div key={p._id} style={styles.pendingItem}>
          <strong>{p.planName}</strong> — {p.companyId?.companyName}
          <button onClick={() => onApprove(p._id)} style={{ ...styles.okBtn, marginLeft: 12 }}>
            <FaCheck /> Approve
          </button>
        </div>
      ))}
    </div>
  );
}

function AdvertisingTab({ campaigns, revenue, onApprove, onReject, onPause }) {
  return (
    <div>
      {revenue && (
        <div style={styles.statsGrid}>
          <StatCard label="Total Ad Revenue" value={`₹${(revenue.total?.totalRevenue || 0).toLocaleString('en-IN')}`} color="#10b981" />
          <StatCard label="Total Events" value={(revenue.total?.totalEvents || 0).toLocaleString('en-IN')} color="#3b82f6" />
        </div>
      )}

      <h2 style={styles.tabTitle}>📢 Campaigns ({campaigns?.length || 0})</h2>
      {!campaigns?.length ? (
        <p style={styles.empty}>No campaigns.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <Th>Campaign</Th>
              <Th>Company</Th>
              <Th>Type</Th>
              <Th>Budget</Th>
              <Th>Spent</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(c => (
              <tr key={c._id} style={styles.tr}>
                <Td><strong>{c.name}</strong></Td>
                <Td>{c.companyId?.companyName || '—'}</Td>
                <Td>{c.type}</Td>
                <Td>₹{(c.budget?.total || 0).toLocaleString('en-IN')}</Td>
                <Td>₹{(c.metrics?.spend || 0).toLocaleString('en-IN')}</Td>
                <Td><StatusBadge status={c.status} /></Td>
                <Td>
                  {c.status === 'pending_approval' && (
                    <>
                      <button onClick={() => onApprove(c._id)} style={styles.okBtn}><FaCheck /></button>
                      <button onClick={() => onReject(c._id)} style={styles.errBtn}><FaTimes /></button>
                    </>
                  )}
                  {c.status === 'active' && (
                    <button onClick={() => onPause(c._id)} style={styles.warnBtn}>⏸</button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ============================================
// SHARED COMPONENTS
// ============================================

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
      <p style={styles.statLabel}>{label}</p>
      <p style={{ ...styles.statValue, color }}>{value}</p>
      {sub && <p style={styles.statSub}>{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();
  let bg = '#f1f5f9', color = '#475569';
  if (['active', 'approved', 'verified', 'visible', 'settled'].includes(s)) { bg = '#dcfce7'; color = '#166534'; }
  else if (['pending', 'pending_approval', 'pending_verification', 'submitted', 'under_review', 'flagged'].includes(s)) { bg = '#fef3c7'; color = '#92400e'; }
  else if (['rejected', 'suspended', 'failed', 'hidden', 'cancelled', 'inactive'].includes(s)) { bg = '#fee2e2'; color = '#dc2626'; }
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: bg, color }}>{s.replace(/_/g, ' ')}</span>;
}
function Th({ children }) {
  return <th style={styles.th}>{children}</th>;
}
function Td({ children, style }) {
  return <td style={{ ...styles.td, ...(style || {}) }}>{children}</td>;
}

function RejectModal({ label, onCancel, onConfirm }) {
  const [reason, setReason] = useState('');
  return (
    <ModalShell onCancel={onCancel}>
      <h3 style={{ marginBottom: 12 }}>❌ Reject {label}</h3>
      <textarea
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="Reason for rejection…"
        rows={4}
        style={styles.textarea}
      />
      <div style={styles.modalActions}>
        <button onClick={() => onConfirm(reason)} disabled={!reason.trim()} style={styles.okBtn}>Confirm Reject</button>
        <button onClick={onCancel} style={styles.cancelBtn}>Cancel</button>
      </div>
    </ModalShell>
  );
}

function SuspendModal({ onCancel, onConfirm }) {
  const [reason, setReason] = useState('');
  const [until, setUntil] = useState('');
  return (
    <ModalShell onCancel={onCancel}>
      <h3 style={{ marginBottom: 12 }}>🚫 Suspend Company</h3>
      <textarea
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="Reason for suspension…"
        rows={3}
        style={styles.textarea}
      />
      <label style={{ display: 'block', marginTop: 12, fontSize: '0.85rem' }}>Until (optional):</label>
      <input type="date" value={until} onChange={e => setUntil(e.target.value)} style={styles.input} />
      <div style={styles.modalActions}>
        <button onClick={() => onConfirm(reason, until || undefined)} disabled={!reason.trim()} style={styles.errBtn}>Suspend</button>
        <button onClick={onCancel} style={styles.cancelBtn}>Cancel</button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, onCancel }) {
  return (
    <div style={styles.modalBackdrop} onClick={onCancel}>
      <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ============================================
// STYLES
// ============================================

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc', padding: '1.5rem 2rem', fontFamily: 'system-ui, -apple-system, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerRight: { display: 'flex', gap: 8 },
  title: { fontSize: '1.5rem', fontWeight: 800, margin: 0 },
  backBtn: { padding: '0.5rem 0.75rem', background: '#e2e8f0', border: 'none', borderRadius: 8, cursor: 'pointer' },
  actionBtn: { padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 },
  notifBar: { position: 'fixed', top: 12, right: 12, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 6 },
  notifItem: { padding: '0.5rem 1rem', background: 'white', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.85rem', fontWeight: 600 },
  tabBar: { display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0.5rem', background: 'white', borderRadius: 10, marginBottom: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  tabBtn: { padding: '0.55rem 1rem', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#475569', whiteSpace: 'nowrap' },
  tabBtnActive: { background: '#3b82f6', color: 'white', fontWeight: 700 },
  content: { background: 'transparent' },
  loading: { textAlign: 'center', color: '#64748b', padding: '3rem' },
  error: { background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: 8 },
  empty: { textAlign: 'center', color: '#64748b', padding: '2rem', background: 'white', borderRadius: 10 },
  tabTitle: { fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', background: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#1e293b' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' },
  statCard: { background: 'white', borderRadius: 10, padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  statLabel: { margin: 0, fontSize: '0.78rem', color: '#64748b', fontWeight: 600 },
  statValue: { margin: '6px 0 0', fontSize: '1.4rem', fontWeight: 800 },
  statSub: { margin: '4px 0 0', fontSize: '0.72rem', color: '#94a3b8' },
  chartsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' },
  chartBox: { background: 'white', padding: '1.25rem', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  chartTitle: { margin: 0, marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 700 },
  okBtn: { padding: '0.4rem 0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', marginRight: 4, fontWeight: 600, fontSize: '0.78rem' },
  errBtn: { padding: '0.4rem 0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', marginRight: 4, fontWeight: 600, fontSize: '0.78rem' },
  warnBtn: { padding: '0.4rem 0.75rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', marginRight: 4, fontWeight: 600, fontSize: '0.78rem' },
  cancelBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  pendingSection: { background: 'white', padding: '1rem', borderRadius: 10, marginBottom: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  pendingTitle: { margin: 0, marginBottom: 8, fontSize: '0.95rem', fontWeight: 700 },
  pendingItem: { padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' },
  kycCard: { background: 'white', padding: '1.25rem', borderRadius: 10, marginBottom: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: '4px solid #3b82f6' },
  kycHeader: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '0.75rem' },
  kycBody: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem' },
  kycDocs: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 },
  kycActions: { marginTop: '0.75rem', display: 'flex', gap: 6 },
  modalBackdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
  modalBox: { background: 'white', padding: '1.5rem', borderRadius: 12, maxWidth: 480, width: '100%' },
  textarea: { width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.9rem', fontFamily: 'inherit' },
  input: { width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.9rem', marginTop: 4 },
  modalActions: { display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }
};