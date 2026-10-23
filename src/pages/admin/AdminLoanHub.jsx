// D:\hospital-frontend\src\pages\admin\AdminLoanHub.jsx
// ============================================
// ADMIN LOAN HUB — Task 19 Part 1
// ============================================
// Tabbed admin interface: Overview, Lenders, Commission, Refunds, Reconciliation, Audit

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminLenders,
  adminLoanApplications,
  adminLoanDashboard,
  adminLoanCommission,
} from '../../services/adminApi';

const AdminLoanHub = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Overview state
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({ status: 'all', page: 1, limit: 20 });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Lenders state
  const [pendingLenders, setPendingLenders] = useState([]);
  const [allLenders, setAllLenders] = useState([]);
  const [selectedLender, setSelectedLender] = useState(null);

  // Commission state
  const [commissionData, setCommissionData] = useState(null);
  const [commissionFilters, setCommissionFilters] = useState({ startDate: '', endDate: '', lenderId: '' });

  // ============================================
  // FETCHERS
  // ============================================
  const fetchStats = useCallback(async () => {
    try {
      const res = await adminLoanDashboard.stats();
      setStats(res.data);
    } catch (err) {
      setError('Failed to load stats: ' + (err.response?.data?.error || err.message));
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await adminLoanApplications.list(filters);
      setApplications(res.data.applications || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError('Failed to load applications: ' + (err.response?.data?.error || err.message));
    }
  }, [filters]);

  const fetchLenders = useCallback(async () => {
  try {
    const [pendingRes, allRes] = await Promise.all([
      adminLenders.getPending().catch(() => ({ data: { lenders: [] } })),
      adminLenders.getAll().catch(() => ({ data: { lenders: [] } })),
    ]);
    setPendingLenders(pendingRes.data?.lenders || []);
    setAllLenders(allRes.data?.lenders || []);
  } catch (err) {
    setError('Failed to load lenders: ' + (err.response?.data?.error || err.message));
  }
}, []);

  const fetchCommission = useCallback(async () => {
    try {
      const res = await adminLoanDashboard.commissionReport(commissionFilters);
      setCommissionData(res.data);
    } catch (err) {
      setError('Failed to load commission: ' + (err.response?.data?.error || err.message));
    }
  }, [commissionFilters]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchApplications(), fetchLenders()]);
      setLoading(false);
    })();
  }, [fetchStats, fetchApplications, fetchLenders]);

  useEffect(() => {
    if (activeTab === 'commission' && !commissionData) {
      fetchCommission();
    }
  }, [activeTab, commissionData, fetchCommission]);

  // ============================================
  // TAB HANDLERS
  // ============================================
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSelectedApplication(null);
    setSelectedLender(null);
  };

  const handleVerifyLender = async (lenderId, status) => {
    const commissionRate = status === 'active' ? parseFloat(window.prompt('Commission rate (%)?', '2') || '2') : null;
    try {
      await adminLenders.verify(lenderId, {
        status,
        commissionRate,
        adminNote: status === 'active' ? 'Verified by admin' : 'Rejected by admin',
      });
      alert(`Lender ${status}`);
      await fetchLenders();
      setSelectedLender(null);
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSuspendLender = async (lenderId) => {
    const reason = window.prompt('Suspension reason?');
    if (!reason) return;
    try {
      await adminLenders.suspend(lenderId, { reason });
      alert('Lender suspended');
      await fetchLenders();
      setSelectedLender(null);
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handlePayCommission = async () => {
    const input = window.prompt('Enter application IDs (comma-separated)?');
    if (!input) return;
    const ids = input.split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length === 0) return;
    try {
      const res = await adminLoanCommission.pay(ids);
      alert(`Commission marked paid: ${res.data.modifiedCount} applications`);
      await fetchCommission();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  // ============================================
  // STYLES
  // ============================================
  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
    header: { background: 'linear-gradient(135deg, #1e293b, #334155)', color: 'white', padding: '1.5rem 2rem' },
    headerTitle: { fontSize: '1.75rem', fontWeight: 800, margin: 0 },
    headerSubtitle: { opacity: 0.9, fontSize: '0.9rem', marginTop: '4px' },
    tabsBar: { backgroundColor: 'white', padding: '0.75rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 100 },
    tabButton: (isActive) => ({ padding: '0.6rem 1.25rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: isActive ? 700 : 500, background: isActive ? '#1e293b' : 'transparent', color: isActive ? 'white' : '#475569', whiteSpace: 'nowrap' }),
    content: { padding: '2rem', maxWidth: '1500px', margin: '0 auto' },
    card: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
    cardTitle: { fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' },
    statCard: (color) => ({ backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}` }),
    input: { width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', marginBottom: '0.75rem' },
    buttonPrimary: { padding: '0.6rem 1.25rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
    buttonSecondary: { padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', fontSize: '0.85rem' },
    buttonSuccess: { padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', fontSize: '0.85rem' },
    buttonDanger: { padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', fontSize: '0.85rem' },
    errorBox: { background: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
    th: { textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' },
    td: { padding: '0.75rem', borderBottom: '1px solid #f1f5f9', color: '#475569' },
    statusBadge: (status) => {
      const colors = {
        draft: { bg: '#f1f5f9', color: '#64748b' },
        active: { bg: '#d1fae5', color: '#065f46' },
        pending: { bg: '#fef3c7', color: '#92400e' },
        suspended: { bg: '#fee2e2', color: '#991b1b' },
        rejected: { bg: '#fee2e2', color: '#991b1b' },
        submitted: { bg: '#dbeafe', color: '#1e40af' },
        under_review: { bg: '#fef3c7', color: '#92400e' },
        offer_issued: { bg: '#dbeafe', color: '#1e40af' },
        approved: { bg: '#d1fae5', color: '#065f46' },
        disbursed: { bg: '#d1fae5', color: '#065f46' },
        completed: { bg: '#d1fae5', color: '#065f46' },
      };
      const c = colors[status] || { bg: '#f1f5f9', color: '#64748b' };
      return { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, background: c.bg, color: c.color };
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>🔧 Admin Loan Hub</h1>
          <p style={styles.headerSubtitle}>Loading...</p>
        </div>
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={styles.headerTitle}>🔧 Admin Loan Hub</h1>
            <p style={styles.headerSubtitle}>Oversee lenders, applications, commission, refunds, reconciliation</p>
          </div>
          <button onClick={() => navigate('/admin/command-center')} style={{ ...styles.buttonSecondary, background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            ← Command Center
          </button>
        </div>
      </div>

      <div style={styles.tabsBar}>
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'lenders', label: `🏦 Lenders (${allLenders.length})` },
          { id: 'commission', label: '💰 Commission Ledger' },
          { id: 'refunds', label: '💸 Refunds' },
          { id: 'reconciliation', label: '🔄 Reconciliation' },
          { id: 'audit', label: '📋 Audit Logs' },
        ].map(tab => (
          <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={styles.tabButton(activeTab === tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        {/* ============================================
            TAB 1: OVERVIEW
            ============================================ */}
        {activeTab === 'overview' && (
          <div>
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={styles.statCard('#3b82f6')}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Applications</p>
                  <p style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6' }}>{stats.loans?.totalApplications || 0}</p>
                </div>
                <div style={styles.statCard('#10b981')}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Disbursed</p>
                  <p style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{stats.loans?.totalDisbursed || 0}</p>
                </div>
                <div style={styles.statCard('#8b5cf6')}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Disbursed</p>
                  <p style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#8b5cf6' }}>₹{(stats.loans?.totalDisbursedAmount || 0).toLocaleString()}</p>
                </div>
                <div style={styles.statCard('#f59e0b')}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Commission</p>
                  <p style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>₹{(stats.loans?.totalCommission || 0).toLocaleString()}</p>
                </div>
                <div style={styles.statCard('#ec4899')}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Active Lenders</p>
                  <p style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#ec4899' }}>{stats.lenders?.active || 0}</p>
                </div>
                <div style={styles.statCard('#ef4444')}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Pending Lenders</p>
                  <p style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#ef4444' }}>{stats.lenders?.pending || 0}</p>
                </div>
              </div>
            )}

            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={styles.cardTitle}>📋 All Applications ({total})</h2>
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })} style={{ ...styles.input, width: 'auto', marginBottom: 0 }}>
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="offer_issued">Offer Issued</option>
                  <option value="approved">Approved</option>
                  <option value="pending_disbursal">Pending Disbursal</option>
                  <option value="disbursed">Disbursed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Application</th>
                    <th style={styles.th}>Lender</th>
                    <th style={styles.th}>Patient</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Commission</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.applicationId}>
                      <td style={styles.td}><code>{app.applicationId}</code></td>
                      <td style={styles.td}>{app.lenderId?.businessName || 'N/A'}</td>
                      <td style={styles.td}>{app.patientDetails?.fullName || 'N/A'}</td>
                      <td style={styles.td}>₹{(app.estimatedAmount || 0).toLocaleString()}</td>
                      <td style={styles.td}><span style={styles.statusBadge(app.status)}>{app.status}</span></td>
                      <td style={styles.td}>₹{(app.platformCommission || 0).toLocaleString()}</td>
                      <td style={styles.td}>
                        <button onClick={() => setSelectedApplication(app)} style={styles.buttonSecondary}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  <button onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })} disabled={filters.page === 1} style={styles.buttonSecondary}>Prev</button>
                  <span style={{ padding: '0.5rem 1rem' }}>Page {filters.page} of {totalPages}</span>
                  <button onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })} disabled={filters.page === totalPages} style={styles.buttonSecondary}>Next</button>
                </div>
              )}
            </div>

            {selectedApplication && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>
                  Application {selectedApplication.applicationId}
                  <button onClick={() => setSelectedApplication(null)} style={{ ...styles.buttonSecondary, float: 'right' }}>Close</button>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div><strong>Lender:</strong> {selectedApplication.lenderId?.businessName}</div>
                  <div><strong>Patient:</strong> {selectedApplication.patientDetails?.fullName}</div>
                  <div><strong>Treatment:</strong> {selectedApplication.treatmentType}</div>
                  <div><strong>Hospital:</strong> {selectedApplication.hospitalName}</div>
                  <div><strong>Sanctioned:</strong> ₹{(selectedApplication.sanctionedAmount || 0).toLocaleString()}</div>
                  <div><strong>Disbursed:</strong> ₹{(selectedApplication.disbursedAmount || 0).toLocaleString()}</div>
                  <div><strong>Commission:</strong> ₹{(selectedApplication.platformCommission || 0).toLocaleString()}</div>
                  <div><strong>Commission Paid:</strong> {selectedApplication.commissionPaid ? '✅' : '⏳ Pending'}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================
            TAB 2: LENDERS
            ============================================ */}
        {activeTab === 'lenders' && (
          <div>
            {pendingLenders.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>⏳ Pending Verification ({pendingLenders.length})</h2>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Business Name</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Phone</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLenders.map(lender => (
                      <tr key={lender.lenderId}>
                        <td style={styles.td}><strong>{lender.businessName}</strong></td>
                        <td style={styles.td}>{lender.lenderType}</td>
                        <td style={styles.td}>{lender.email}</td>
                        <td style={styles.td}>{lender.phone}</td>
                        <td style={styles.td}>
                          <button onClick={() => handleVerifyLender(lender.lenderId, 'active')} style={{ ...styles.buttonSuccess, marginRight: '0.25rem' }}>✅ Approve</button>
                          <button onClick={() => handleVerifyLender(lender.lenderId, 'rejected')} style={styles.buttonDanger}>❌ Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🏦 All Lenders ({allLenders.length})</h2>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Business Name</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Commission</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allLenders.map(lender => (
                    <tr key={lender.lenderId}>
                      <td style={styles.td}><strong>{lender.businessName}</strong></td>
                      <td style={styles.td}>{lender.lenderType}</td>
                      <td style={styles.td}>{lender.commissionRate}%</td>
                      <td style={styles.td}><span style={styles.statusBadge(lender.status)}>{lender.status}</span></td>
                      <td style={styles.td}>
                        <button onClick={() => setSelectedLender(lender)} style={styles.buttonSecondary}>View</button>
                        {lender.status === 'active' && (
                          <button onClick={() => handleSuspendLender(lender.lenderId)} style={{ ...styles.buttonDanger, marginLeft: '0.25rem' }}>Suspend</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedLender && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>
                  Lender {selectedLender.businessName}
                  <button onClick={() => setSelectedLender(null)} style={{ ...styles.buttonSecondary, float: 'right' }}>Close</button>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div><strong>Lender ID:</strong> {selectedLender.lenderId}</div>
                  <div><strong>Type:</strong> {selectedLender.lenderType}</div>
                  <div><strong>Email:</strong> {selectedLender.email}</div>
                  <div><strong>Phone:</strong> {selectedLender.phone}</div>
                  <div><strong>Commission:</strong> {selectedLender.commissionRate}%</div>
                  <div><strong>Status:</strong> <span style={styles.statusBadge(selectedLender.status)}>{selectedLender.status}</span></div>
                  <div><strong>Registered:</strong> {selectedLender.createdAt ? new Date(selectedLender.createdAt).toLocaleDateString() : 'N/A'}</div>
                  <div><strong>Verified:</strong> {selectedLender.verifiedAt ? new Date(selectedLender.verifiedAt).toLocaleDateString() : 'Not yet'}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================
            TAB 3: COMMISSION LEDGER
            ============================================ */}
        {activeTab === 'commission' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>💰 Commission Ledger</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', marginBottom: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Start Date</label>
                  <input type="date" value={commissionFilters.startDate} onChange={(e) => setCommissionFilters({ ...commissionFilters, startDate: e.target.value })} style={styles.input} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>End Date</label>
                  <input type="date" value={commissionFilters.endDate} onChange={(e) => setCommissionFilters({ ...commissionFilters, endDate: e.target.value })} style={styles.input} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Lender ID</label>
                  <input value={commissionFilters.lenderId} onChange={(e) => setCommissionFilters({ ...commissionFilters, lenderId: e.target.value })} placeholder="Optional" style={styles.input} />
                </div>
                <button onClick={fetchCommission} style={styles.buttonPrimary}>Load</button>
              </div>

              {commissionData && commissionData.summary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Total Disbursed</p>
                    <p style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 800 }}>₹{(commissionData.summary.totalDisbursedAmount || 0).toLocaleString()}</p>
                  </div>
                  <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Total Commission</p>
                    <p style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>₹{(commissionData.summary.totalCommission || 0).toLocaleString()}</p>
                  </div>
                  <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Pending Commission</p>
                    <p style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>₹{(commissionData.summary.pendingCommission || 0).toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <button onClick={handlePayCommission} style={styles.buttonPrimary}>💰 Mark Selected as Paid</button>
              </div>

              {commissionData && commissionData.lenderWise && commissionData.lenderWise.length > 0 ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Lender</th>
                      <th style={styles.th}>Total Loans</th>
                      <th style={styles.th}>Total Amount</th>
                      <th style={styles.th}>Commission</th>
                      <th style={styles.th}>Paid</th>
                      <th style={styles.th}>Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissionData.lenderWise.map((lender, i) => (
                      <tr key={i}>
                        <td style={styles.td}><strong>{lender.lenderName}</strong></td>
                        <td style={styles.td}>{lender.totalLoans}</td>
                        <td style={styles.td}>₹{(lender.totalAmount || 0).toLocaleString()}</td>
                        <td style={styles.td}><strong>₹{(lender.commission || 0).toLocaleString()}</strong></td>
                        <td style={styles.td} style={{ color: '#059669' }}>₹{(lender.commissionPaid || 0).toLocaleString()}</td>
                        <td style={styles.td} style={{ color: '#dc2626' }}>₹{(lender.commissionPending || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Click "Load" to fetch commission data.</p>
              )}
            </div>
          </div>
        )}

        {/* ============================================
            TAB 4: REFUNDS
            ============================================ */}
        {activeTab === 'refunds' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>💸 Refund Review</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Review lender-initiated refunds. Approve or reject with reason.
              </p>

              {selectedApplication ? (
                <div>
                  <button onClick={() => setSelectedApplication(null)} style={{ ...styles.buttonSecondary, marginBottom: '1rem' }}>
                    ← Back to List
                  </button>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Refunds for {selectedApplication.applicationId}
                  </h3>
                  <div style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    <strong>Patient:</strong> {selectedApplication.patientDetails?.fullName}<br />
                    <strong>Lender:</strong> {selectedApplication.lenderId?.businessName}<br />
                    <strong>Disbursed:</strong> ₹{(selectedApplication.disbursedAmount || 0).toLocaleString()}<br />
                    <strong>Status:</strong> <span style={styles.statusBadge(selectedApplication.status)}>{selectedApplication.status}</span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    Refund requests are tracked per transaction. Use the Commission Ledger to identify disputed transactions, then contact the lender for refund initiation.
                  </p>
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Application</th>
                      <th style={styles.th}>Patient</th>
                      <th style={styles.th}>Lender</th>
                      <th style={styles.th}>Disbursed</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.filter(a => ['disbursed', 'completed', 'pending_disbursal'].includes(a.status)).map(app => (
                      <tr key={app.applicationId}>
                        <td style={styles.td}><code>{app.applicationId}</code></td>
                        <td style={styles.td}>{app.patientDetails?.fullName || 'N/A'}</td>
                        <td style={styles.td}>{app.lenderId?.businessName || 'N/A'}</td>
                        <td style={styles.td}>₹{(app.disbursedAmount || 0).toLocaleString()}</td>
                        <td style={styles.td}><span style={styles.statusBadge(app.status)}>{app.status}</span></td>
                        <td style={styles.td}>
                          <button onClick={() => setSelectedApplication(app)} style={styles.buttonSecondary}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!selectedApplication && applications.filter(a => ['disbursed', 'completed', 'pending_disbursal'].includes(a.status)).length === 0 && (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                  No disbursed applications eligible for refund yet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ============================================
            TAB 5: RECONCILIATION
            ============================================ */}
        {activeTab === 'reconciliation' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🔄 Reconciliation</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Match disbursements against bank statements. Flag mismatches.
              </p>

              <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                <strong>How reconciliation works:</strong>
                <ol style={{ margin: '0.5rem 0 0', paddingLeft: '1.5rem' }}>
                  <li>Lender marks a disbursement as "confirmed" after money is sent</li>
                  <li>Admin matches disbursement UTR against bank statement</li>
                  <li>Mark as "reconciled" when matched</li>
                  <li>Flag mismatches for investigation</li>
                </ol>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Application</th>
                    <th style={styles.th}>Disbursed Amount</th>
                    <th style={styles.th}>UTR</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.filter(a => ['disbursed', 'pending_disbursal'].includes(a.status)).map(app => (
                    <tr key={app.applicationId}>
                      <td style={styles.td}><code>{app.applicationId}</code></td>
                      <td style={styles.td}>₹{(app.disbursedAmount || 0).toLocaleString()}</td>
                      <td style={styles.td}>{app.disbursalUtrNumber || 'Pending'}</td>
                      <td style={styles.td}><span style={styles.statusBadge(app.status)}>{app.status}</span></td>
                      <td style={styles.td}>
                        <button onClick={() => setSelectedApplication(app)} style={styles.buttonSecondary}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {applications.filter(a => ['disbursed', 'pending_disbursal'].includes(a.status)).length === 0 && (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                  No disbursements to reconcile yet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ============================================
            TAB 6: AUDIT LOGS
            ============================================ */}
        {activeTab === 'audit' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📋 Audit Logs</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Full event history for any application. Select an application to view its complete audit trail.
              </p>

              <select
                onChange={(e) => {
                  const app = applications.find(a => a.applicationId === e.target.value);
                  if (app) setSelectedApplication(app);
                }}
                style={{ ...styles.input, marginBottom: '1rem' }}
                defaultValue=""
              >
                <option value="" disabled>Select application</option>
                {applications.map(app => (
                  <option key={app.applicationId} value={app.applicationId}>
                    {app.applicationId} - {app.patientDetails?.fullName || 'N/A'} - {app.status}
                  </option>
                ))}
              </select>

              {selectedApplication ? (
                <div>
                  <div style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    <strong>Application:</strong> {selectedApplication.applicationId}<br />
                    <strong>Patient:</strong> {selectedApplication.patientDetails?.fullName}<br />
                    <strong>Lender:</strong> {selectedApplication.lenderId?.businessName}<br />
                    <strong>Current Status:</strong> <span style={styles.statusBadge(selectedApplication.status)}>{selectedApplication.status}</span>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Status History ({(selectedApplication.statusHistory || []).length} events)
                  </h3>

                  {(selectedApplication.statusHistory || []).length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                      No status history yet.
                    </p>
                  ) : (
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {(selectedApplication.statusHistory || []).map((event, idx) => (
                        <div
                          key={idx}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            borderLeft: '4px solid #3b82f6',
                            fontSize: '0.875rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <span style={styles.statusBadge(event.status)}>{event.status}</span>
                            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                              {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div style={{ color: '#475569' }}>
                            {event.note || event.reason || 'Status changed'}
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px' }}>
                            By: {event.updatedBy || 'system'} ({event.updatedByRole || 'system'})
                            {event.fromStatus && ` • ${event.fromStatus} → ${event.status}`}
                          </div>
                          {event.metadata && Object.keys(event.metadata).length > 0 && (
                            <details style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                              <summary style={{ cursor: 'pointer', color: '#64748b' }}>Metadata</summary>
                              <pre style={{ backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '4px', marginTop: '4px', overflowX: 'auto' }}>
                                {JSON.stringify(event.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedApplication(null)}
                    style={{ ...styles.buttonSecondary, marginTop: '1rem' }}
                  >
                    ← Back
                  </button>
                </div>
              ) : (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                  Select an application to view its audit history.
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminLoanHub;