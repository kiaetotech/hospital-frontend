import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLenders } from '../../services/adminApi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    lenders: { total: 0, pending: 0, active: 0, suspended: 0 },
    commission: { total: 0, paid: 0, pending: 0 }
  });
  const [recentLenders, setRecentLenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
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
              onClick={handleLogout}
              style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
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

        {/* Recent Lenders */}
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
      </div>
    </div>
  );
};

export default AdminDashboard;