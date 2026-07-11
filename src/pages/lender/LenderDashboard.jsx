import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLender } from '../../contexts/LenderContext';
import { lenderApplications } from '../../services/lenderApi';

const LenderDashboard = () => {
  const navigate = useNavigate();
  const { lender, logout } = useLender();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    underReview: 0,
    approvedApplications: 0,
    disbursedApplications: 0,
    rejectedApplications: 0,
    totalDisbursedAmount: 0,
    totalCommission: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lender) {
      navigate('/lender/login');
      return;
    }
    fetchDashboardData();
  }, [lender, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        lenderApplications.getStats(),
        lenderApplications.getAll({ status: 'all', limit: 5 })
      ]);
      setStats(statsRes.data);
      setRecentApplications(appsRes.data.applications || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'submitted': '#f59e0b',
      'under_review': '#8b5cf6',
      'approved': '#10b981',
      'rejected': '#ef4444',
      'disbursed': '#06b6d4',
      'document_pending': '#f97316'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'submitted': '⏳ Submitted',
      'under_review': '🔍 Under Review',
      'approved': '👍 Approved',
      'rejected': '❌ Rejected',
      'disbursed': '💰 Disbursed',
      'document_pending': '📄 Document Pending'
    };
    return labels[status] || status;
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Welcome, {lender?.businessName}</h1>
            <p style={{ color: '#6b7280' }}>Lender ID: {lender?.lenderId}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/lender/login'); }}
            style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Applications</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalApplications}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#f59e0b', fontSize: '0.875rem' }}>Pending</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pendingApplications}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Approved</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.approvedApplications}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#06b6d4', fontSize: '0.875rem' }}>Disbursed</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06b6d4' }}>{stats.disbursedApplications}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Disbursed</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{stats.totalDisbursedAmount.toLocaleString()}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#8b5cf6', fontSize: '0.875rem' }}>Commission Earned</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>₹{stats.totalCommission.toLocaleString()}</p>
          </div>
        </div>

        {/* Recent Applications */}
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Recent Applications</h2>
            <button
              onClick={() => navigate('/lender/applications')}
              style={{ color: '#8b5cf6', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View All →
            </button>
          </div>
          
          {recentApplications.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No applications yet</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Application ID</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Patient</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Amount</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Treatment</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app) => (
                    <tr key={app.applicationId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{app.applicationId}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{app.patientDetails?.fullName || 'N/A'}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>₹{(app.estimatedAmount || app.requestedAmount || 0).toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{app.treatmentType || 'N/A'}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ 
                          backgroundColor: getStatusColor(app.status),
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem'
                        }}>
                          {getStatusLabel(app.status)}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <button
                          onClick={() => navigate(`/lender/applications/${app.applicationId}`)}
                          style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LenderDashboard;
