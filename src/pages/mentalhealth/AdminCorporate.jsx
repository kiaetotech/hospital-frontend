import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminCorporate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingPlans, setPendingPlans] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [tab, setTab] = useState('pending');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (tab === 'pending') {
        const res = await axios.get('/api/corporate/admin/pending', config);
        setPendingPlans(res.data.data || []);
      } else {
        const res = await axios.get('/api/corporate/admin/all', config);
        setAllPlans(res.data.data || []);
      }
    } catch (error) {
      console.error('Error loading corporate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPlan = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put(`/api/corporate/admin/verify/${id}`, { status }, config);
      alert(`✅ Plan ${status}!`);
      loadData();
    } catch (error) {
      alert('❌ Failed to verify plan: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { backgroundColor: '#fef3c7', color: '#92400e' },
      active: { backgroundColor: '#dcfce7', color: '#166534' },
      expired: { backgroundColor: '#fee2e2', color: '#dc2626' },
      cancelled: { backgroundColor: '#fee2e2', color: '#dc2626' }
    };
    const style = styles[status] || styles.pending;
    return (
      <span style={{ 
        padding: '0.25rem 0.75rem', 
        borderRadius: '20px', 
        fontSize: '0.75rem',
        backgroundColor: style.backgroundColor,
        color: style.color,
        fontWeight: 'bold'
      }}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          🏢 Corporate Health & Insurance - Admin
        </h1>
        <p style={{ opacity: 0.9 }}>Manage corporate health plans, verify enrollments, and track corporate clients</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setTab('pending')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: tab === 'pending' ? '#f59e0b' : 'transparent',
            color: tab === 'pending' ? 'white' : '#1e293b',
            border: tab === 'pending' ? 'none' : '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ⏳ Pending ({pendingPlans.length})
        </button>
        <button
          onClick={() => setTab('all')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: tab === 'all' ? '#1e3a5f' : 'transparent',
            color: tab === 'all' ? 'white' : '#1e293b',
            border: tab === 'all' ? 'none' : '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📋 All Plans ({allPlans.length})
        </button>
        <button
          onClick={() => navigate('/admin/dashboard')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔄</div>
          <p>Loading corporate plans...</p>
        </div>
      ) : tab === 'pending' ? (
        pendingPlans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
            <p style={{ color: '#6b7280' }}>No pending corporate plans</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {pendingPlans.map((plan) => (
              <div key={plan._id} style={{ 
                backgroundColor: 'white', 
                borderRadius: '1rem', 
                padding: '1.5rem', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #f59e0b'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{plan.planName}</h3>
                      {getStatusBadge(plan.status)}
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>🏢 {plan.companyName}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <div>
                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Employees</span>
                        <div style={{ fontWeight: 'bold' }}>{plan.employeeCount || 0}</div>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Total Premium</span>
                        <div style={{ fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(plan.totalPremium || 0)}</div>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Submitted</span>
                        <div style={{ fontWeight: 'bold' }}>{new Date(plan.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>HR Contact</span>
                        <div style={{ fontWeight: 'bold' }}>{plan.hrContact?.name || 'N/A'}</div>
                      </div>
                    </div>
                    {plan.employees && plan.employees.length > 0 && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                        👥 {plan.employees.length} employees enrolled
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', minWidth: '150px' }}>
                    <button
                      onClick={() => verifyPlan(plan._id, 'approved')}
                      style={{
                        padding: '0.6rem 1.5rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to reject this plan?')) {
                          verifyPlan(plan._id, 'rejected');
                        }
                      }}
                      style={{
                        padding: '0.6rem 1.5rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      ❌ Reject
                    </button>
                    <button
                      onClick={() => navigate(`/corporate/plan/${plan._id}`)}
                      style={{
                        padding: '0.6rem 1.5rem',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      👁️ View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        allPlans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#6b7280' }}>No corporate plans found</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase' }}>Company</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase' }}>Plan</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase' }}>Employees</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase' }}>Premium</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {allPlans.map((plan) => (
                  <tr key={plan._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>{plan.companyName}</td>
                    <td style={{ padding: '0.75rem' }}>{plan.planName}</td>
                    <td style={{ padding: '0.75rem' }}>{plan.employeeCount || 0}</td>
                    <td style={{ padding: '0.75rem', color: '#2563eb', fontWeight: 'bold' }}>{formatCurrency(plan.totalPremium || 0)}</td>
                    <td style={{ padding: '0.75rem' }}>{getStatusBadge(plan.status)}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => navigate(`/corporate/plan/${plan._id}`)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default AdminCorporate;