import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminReports } from '../../services/adminApi';

const AdminCommission = () => {
  const navigate = useNavigate();
  const [commissionData, setCommissionData] = useState({ summary: {}, lenderWise: [] });
  const [loading, setLoading] = useState(true);
  const [selectedLender, setSelectedLender] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchCommissionData();
  }, [navigate, selectedLender]);

  const fetchCommissionData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedLender) params.lenderId = selectedLender;
      const response = await adminReports.getCommission(params);
      setCommissionData(response.data);
    } catch (error) {
      console.error('Error fetching commission data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (applicationIds) => {
    if (!window.confirm('Mark these commissions as paid?')) return;
    try {
      await adminReports.payCommission({ applicationIds });
      alert('✅ Commissions marked as paid!');
      fetchCommissionData();
    } catch (error) {
      alert('Failed to mark as paid: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem', textAlign: 'center' }}>
        <p>Loading commission data...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Commission Report</h1>
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={{ backgroundColor: '#e5e7eb', color: '#374151', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Commission</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>₹{commissionData.summary?.totalCommission?.toLocaleString() || 0}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Paid Commission</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>₹{commissionData.summary?.paidCommission?.toLocaleString() || 0}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Pending Commission</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>₹{commissionData.summary?.pendingCommission?.toLocaleString() || 0}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Loans Disbursed</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{commissionData.summary?.totalDisbursedLoans || 0}</p>
          </div>
        </div>

        {/* Lender-wise Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Lender-wise Commission</h2>
          
          {commissionData.lenderWise?.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No commission data available</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Lender</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', color: '#6b7280' }}>Total Loans</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', color: '#6b7280' }}>Total Amount</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', color: '#6b7280' }}>Commission</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', color: '#6b7280' }}>Paid</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', color: '#6b7280' }}>Pending</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {commissionData.lenderWise.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}><strong>{item.lenderName}</strong></td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>{item.totalLoans}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>₹{item.totalAmount?.toLocaleString() || 0}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 'bold', color: '#8b5cf6' }}>₹{item.commission?.toLocaleString() || 0}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', color: '#10b981' }}>₹{item.commissionPaid?.toLocaleString() || 0}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', color: '#ef4444' }}>₹{item.commissionPending?.toLocaleString() || 0}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {item.commissionPending > 0 && (
                        <button
                          onClick={() => handleMarkPaid([item.applicationIds])}
                          style={{ backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          Mark Paid
                        </button>
                      )}
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

export default AdminCommission;