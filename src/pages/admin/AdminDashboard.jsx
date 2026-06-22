import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLenders } from '../../services/adminApi';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    lenders: { total: 0, pending: 0, active: 0, suspended: 0 },
    commission: { total: 0, paid: 0, pending: 0 }
  });
  const [recentLenders, setRecentLenders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Insurance state
  const [insuranceStats, setInsuranceStats] = useState({
    companies: { total: 0, pending: 0, verified: 0 },
    plans: { total: 0, active: 0, inactive: 0 },
    policies: { total: 0, active: 0, pending: 0, expired: 0 },
    settlements: { pending: 0, completed: 0, totalAmount: 0 }
  });
  const [recentInsuranceCompanies, setRecentInsuranceCompanies] = useState([]);
  const [pendingSettlements, setPendingSettlements] = useState([]);
  const [activeTab, setActiveTab] = useState('lenders');

  // 🆕 Quick stats for all modules
  const [moduleStats, setModuleStats] = useState({
    hospitals: { total: 0, pending: 0 },
    ambulance: { total: 0, pending: 0 },
    caregivers: { total: 0, pending: 0 },
    diagnostics: { total: 0, pending: 0 }
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
    fetchInsuranceData();
    fetchModuleStats();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, lendersRes] = await Promise.all([
        adminLenders.getStats(),
        adminLenders.getAll({ limit: 5 })
      ]);
      setStats(statsRes.data.stats);
      setRecentLenders(lendersRes.data.lenders || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsuranceData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const companiesRes = await axios.get('/api/insurance-admin/companies', config);
      const settlementsRes = await axios.get('/api/insurance-admin/settlements/pending', config);
      const summaryRes = await axios.get('/api/insurance-admin/reports/summary', config);

      const companies = companiesRes.data.data || [];
      const settlements = settlementsRes.data.data || [];
      const summary = summaryRes.data.data || {};

      const totalCompanies = companies.length;
      const pendingCompanies = companies.filter(c => !c.isVerified).length;
      const verifiedCompanies = companies.filter(c => c.isVerified).length;

      const totalPlans = summary.totalPlans || 0;
      const activePlans = summary.activePlans || 0;
      const totalPolicies = summary.totalPolicies || 0;
      const activePolicies = summary.activePolicies || 0;
      const pendingSettlementsCount = settlements.length;
      const totalSettlementAmount = settlements.reduce((sum, s) => sum + (s.providerAmount || 0), 0);

      setInsuranceStats({
        companies: { total: totalCompanies, pending: pendingCompanies, verified: verifiedCompanies },
        plans: { total: totalPlans, active: activePlans, inactive: totalPlans - activePlans },
        policies: { 
          total: totalPolicies, 
          active: activePolicies, 
          pending: summary.pendingPolicies || 0,
          expired: summary.expiredPolicies || 0
        },
        settlements: { 
          pending: pendingSettlementsCount, 
          completed: summary.completedSettlements || 0,
          totalAmount: totalSettlementAmount
        }
      });

      setRecentInsuranceCompanies(companies.slice(0, 5));
      setPendingSettlements(settlements.slice(0, 5));

    } catch (error) {
      console.error('Error fetching insurance data:', error);
    }
  };

  // 🆕 Fetch module stats for quick overview
  const fetchModuleStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      // Fetch stats for each module
      const [hospitalsRes, ambulanceRes, caregiversRes, diagnosticsRes] = await Promise.all([
        axios.get('/api/hospitals/admin/stats', config).catch(() => ({ data: { data: {} } })),
        axios.get('/api/ambulance/admin/stats', config).catch(() => ({ data: { data: {} } })),
        axios.get('/api/caregivers/admin/stats', config).catch(() => ({ data: { data: {} } })),
        axios.get('/api/diagnostics/admin/stats', config).catch(() => ({ data: { data: {} } })),
      ]);

      setModuleStats({
        hospitals: {
          total: hospitalsRes.data?.data?.totalHospitals || 0,
          pending: hospitalsRes.data?.data?.pendingVerifications || 0
        },
        ambulance: {
          total: ambulanceRes.data?.data?.totalAmbulances || 0,
          pending: ambulanceRes.data?.data?.pendingVerifications || 0
        },
        caregivers: {
          total: caregiversRes.data?.data?.totalCaregivers || 0,
          pending: caregiversRes.data?.data?.pendingVerifications || 0
        },
        diagnostics: {
          total: diagnosticsRes.data?.data?.totalLabs || 0,
          pending: diagnosticsRes.data?.data?.pendingVerifications || 0
        }
      });

    } catch (error) {
      console.error('Error fetching module stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  // 🆕 Navigate to admin panel
  const goToAdminPanel = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem', textAlign: 'center' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/admin/verify-lenders')}
              style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
              Verify Lenders
            </button>
            <button
              onClick={() => navigate('/admin/commission')}
              style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
              Commission Report
            </button>
            <button
              onClick={() => navigate('/admin/finance')}
              style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
              💰 Finance
            </button>
            <button
              onClick={() => navigate('/admin/ayurveda')}
              style={{ backgroundColor: '#4CAF50', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
              🧘 Ayurveda
            </button>
            <button
              onClick={() => navigate('/admin/homeopathy')}
              style={{ backgroundColor: '#7C3AED', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
              🌿 Homeopathy
            </button>
            <button
              onClick={handleLogout}
              style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* ============================================
            🆕 QUICK ACCESS - ALL ADMIN PANELS
            ============================================ */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '0.75rem',
          marginBottom: '2rem'
        }}>
          {[
            { label: '🏥 Hospitals', path: '/admin/hospitals', color: '#2563eb' },
            { label: '🚑 Ambulance', path: '/admin/ambulance', color: '#f59e0b' },
            { label: '🏠 Caregivers', path: '/admin/caregivers', color: '#8b5cf6' },
            { label: '🔬 Diagnostics', path: '/admin/diagnostics', color: '#06b6d4' },
            { label: '💰 Financing', path: '/admin/financing', color: '#10b981' },
            { label: '👥 Users', path: '/admin/users', color: '#6b7280' },
            { label: '🛡️ Insurance', path: '/admin/dashboard?tab=insurance', color: '#2563eb' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => goToAdminPanel(item.path)}
              style={{
                padding: '0.75rem',
                backgroundColor: 'white',
                border: `2px solid ${item.color}`,
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: item.color,
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = item.color;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = item.color;
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* ============================================
            MODULE STATS CARDS
            ============================================ */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {[
            { label: '🏥 Hospitals', total: moduleStats.hospitals.total, pending: moduleStats.hospitals.pending, color: '#2563eb' },
            { label: '🚑 Ambulance', total: moduleStats.ambulance.total, pending: moduleStats.ambulance.pending, color: '#f59e0b' },
            { label: '🏠 Caregivers', total: moduleStats.caregivers.total, pending: moduleStats.caregivers.pending, color: '#8b5cf6' },
            { label: '🔬 Diagnostics', total: moduleStats.diagnostics.total, pending: moduleStats.diagnostics.pending, color: '#06b6d4' },
          ].map((mod) => (
            <div key={mod.label} style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              borderLeft: `4px solid ${mod.color}`
            }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{mod.label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{mod.total}</p>
              {mod.pending > 0 && (
                <p style={{ fontSize: '0.75rem', color: '#f59e0b' }}>⏳ {mod.pending} pending</p>
              )}
            </div>
          ))}
        </div>

        {/* ============================================
            TAB NAVIGATION
            ============================================ */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('lenders')}
            style={{
              padding: '0.5rem 1.5rem',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'lenders' ? '#3b82f6' : 'transparent',
              color: activeTab === 'lenders' ? 'white' : '#6b7280',
              fontWeight: activeTab === 'lenders' ? 'bold' : 'normal'
            }}
          >
            💰 Lenders & Commission
          </button>
          <button
            onClick={() => setActiveTab('insurance')}
            style={{
              padding: '0.5rem 1.5rem',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'insurance' ? '#2563eb' : 'transparent',
              color: activeTab === 'insurance' ? 'white' : '#6b7280',
              fontWeight: activeTab === 'insurance' ? 'bold' : 'normal'
            }}
          >
            🛡️ Insurance Module
          </button>
        </div>

        {/* ============================================
            TAB 1: LENDERS & COMMISSION
            ============================================ */}
        {activeTab === 'lenders' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Lenders</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.lenders.total}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#f59e0b', fontSize: '0.875rem' }}>Pending Verification</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.lenders.pending}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Active Lenders</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.lenders.active}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#8b5cf6', fontSize: '0.875rem' }}>Total Commission</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>₹{stats.commission.total.toLocaleString()}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Commission Paid</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>₹{stats.commission.paid.toLocaleString()}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Commission Pending</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>₹{stats.commission.pending.toLocaleString()}</p>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Recent Lenders</h2>
              {recentLenders.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No lenders registered yet</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Lender ID</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Business Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Email</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLenders.map((lender) => (
                      <tr key={lender.lenderId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{lender.lenderId}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{lender.businessName}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{lender.email}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ 
                            backgroundColor: lender.status === 'active' ? '#10b981' : lender.status === 'pending' ? '#f59e0b' : '#ef4444',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem'
                          }}>
                            {lender.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <button
                            onClick={() => navigate(`/admin/lenders/${lender.lenderId}`)}
                            style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ============================================
            TAB 2: INSURANCE MODULE
            ============================================ */}
        {activeTab === 'insurance' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #2563eb' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>🏢 Insurance Companies</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{insuranceStats.companies.total}</p>
                <p style={{ fontSize: '0.75rem', color: '#f59e0b' }}>{insuranceStats.companies.pending} pending verification</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #7c3aed' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>📋 Insurance Plans</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{insuranceStats.plans.total}</p>
                <p style={{ fontSize: '0.75rem', color: '#10b981' }}>{insuranceStats.plans.active} active</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #059669' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>📄 Policies Issued</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{insuranceStats.policies.total}</p>
                <p style={{ fontSize: '0.75rem', color: '#10b981' }}>{insuranceStats.policies.active} active</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>⏳ Pending Settlements</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{insuranceStats.settlements.pending}</p>
                <p style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>₹{insuranceStats.settlements.totalAmount.toLocaleString()}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>✅ Settlements Completed</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{insuranceStats.settlements.completed}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <button onClick={() => navigate('/admin/insurance/companies')} style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>🏢 Manage Companies</button>
              <button onClick={() => navigate('/admin/insurance/plans')} style={{ backgroundColor: '#7c3aed', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>📋 Manage Plans</button>
              <button onClick={() => navigate('/admin/insurance/policies')} style={{ backgroundColor: '#059669', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>📄 View Policies</button>
              <button onClick={() => navigate('/admin/insurance/settlements')} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>💰 Settlements</button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>🏢 Recent Insurance Companies</h2>
                <button onClick={() => navigate('/admin/insurance/companies')} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>View All →</button>
              </div>
              {recentInsuranceCompanies.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No insurance companies registered yet</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Company Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Email</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>IRDA Registration</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInsuranceCompanies.map((company) => (
                      <tr key={company._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: '500' }}>{company.companyName || company.name}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{company.email}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{company.irdaRegistration || 'N/A'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ backgroundColor: company.isVerified ? '#10b981' : '#f59e0b', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                            {company.isVerified ? '✅ Verified' : '⏳ Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <button onClick={() => navigate(`/admin/insurance/companies/${company._id}`)} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>💰 Pending Settlements</h2>
                <button onClick={() => navigate('/admin/insurance/settlements')} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>View All →</button>
              </div>
              {pendingSettlements.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No pending settlements</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Policy</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Premium</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Commission</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Payout</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSettlements.map((settlement) => (
                      <tr key={settlement._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{settlement.bookingId?.insurancePlanName || 'N/A'}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 'bold' }}>₹{settlement.totalPremium?.toLocaleString() || 0}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#8b5cf6' }}>₹{settlement.platformCommission?.toLocaleString() || 0}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 'bold', color: '#059669' }}>₹{settlement.providerAmount?.toLocaleString() || 0}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <button style={{ backgroundColor: '#059669', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Process</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;