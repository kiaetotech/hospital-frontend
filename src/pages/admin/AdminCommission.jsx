import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminReports } from '../../services/adminApi';
import { 
  FaMoneyBillWave, 
  FaChartLine, 
  FaUsers, 
  FaBuilding,
  FaUserMd,
  FaBrain,
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaArrowLeft,
  FaTabs,
  FaList,
  FaChartPie
} from 'react-icons/fa';
import axios from 'axios';

const AdminCommission = () => {
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('lender'); // 'lender' or 'mentalhealth'
  
  // ============================================
  // LENDER COMMISSION STATE (EXISTING)
  // ============================================
  const [lenderData, setLenderData] = useState({ summary: {}, lenderWise: [] });
  const [loadingLender, setLoadingLender] = useState(true);
  const [selectedLender, setSelectedLender] = useState('');

  // ============================================
  // MENTAL HEALTH COMMISSION STATE (NEW)
  // ============================================
  const [mentalHealthData, setMentalHealthData] = useState(null);
  const [loadingMentalHealth, setLoadingMentalHealth] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    search: ''
  });

  // ============================================
  // AUTH CHECK
  // ============================================
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  // ============================================
  // FETCH LENDER DATA (EXISTING)
  // ============================================
  useEffect(() => {
    if (activeTab === 'lender') {
      fetchLenderData();
    }
  }, [selectedLender, activeTab]);

  const fetchLenderData = async () => {
    setLoadingLender(true);
    try {
      const params = {};
      if (selectedLender) params.lenderId = selectedLender;
      const response = await adminReports.getCommission(params);
      setLenderData(response.data);
    } catch (error) {
      console.error('Error fetching lender commission data:', error);
    } finally {
      setLoadingLender(false);
    }
  };

  // ============================================
  // FETCH MENTAL HEALTH DATA (NEW)
  // ============================================
  useEffect(() => {
    if (activeTab === 'mentalhealth') {
      fetchMentalHealthData();
    }
  }, [filters, activeTab]);

  const fetchMentalHealthData = async () => {
    setLoadingMentalHealth(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/commission-report`,
        {
          params: {
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
            status: filters.status !== 'all' ? filters.status : undefined,
            search: filters.search || undefined
          },
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }
      );
      setMentalHealthData(response.data.data);
    } catch (error) {
      console.error('Error fetching mental health commission data:', error);
      setMentalHealthData({
        summary: { totalRevenue: 0, totalCommission: 0, platformEarnings: 0, totalSessions: 0 },
        bookings: []
      });
    } finally {
      setLoadingMentalHealth(false);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleMarkPaid = async (applicationIds) => {
    if (!window.confirm('Mark these commissions as paid?')) return;
    try {
      await adminReports.payCommission({ applicationIds });
      alert('✅ Commissions marked as paid!');
      fetchLenderData();
    } catch (error) {
      alert('Failed to mark as paid: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDownloadMentalHealthReport = async () => {
    try {
      window.open(
        `${process.env.REACT_APP_API_URL}/api/admin/commission-report/export?${new URLSearchParams(filters).toString()}`,
        '_blank'
      );
    } catch (error) {
      alert('Failed to download report');
    }
  };

  // ============================================
  // RENDER LOADING
  // ============================================
  if (loadingLender && activeTab === 'lender') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem', textAlign: 'center' }}>
        <p>Loading commission data...</p>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>💰 Commission Reports</h1>
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={{ backgroundColor: '#e5e7eb', color: '#374151', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <button
            onClick={() => setActiveTab('lender')}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: activeTab === 'lender' ? '#8b5cf6' : 'transparent',
              color: activeTab === 'lender' ? 'white' : '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <FaBuilding /> Lender Commission
          </button>
          <button
            onClick={() => setActiveTab('mentalhealth')}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: activeTab === 'mentalhealth' ? '#8b5cf6' : 'transparent',
              color: activeTab === 'mentalhealth' ? 'white' : '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <FaBrain /> Mental Health Commission
          </button>
        </div>

        {/* ============================================
            TAB 1: LENDER COMMISSION (EXISTING)
        ============================================ */}
        {activeTab === 'lender' && (
          <>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Commission</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>₹{lenderData.summary?.totalCommission?.toLocaleString() || 0}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Paid Commission</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>₹{lenderData.summary?.paidCommission?.toLocaleString() || 0}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Pending Commission</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>₹{lenderData.summary?.pendingCommission?.toLocaleString() || 0}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Loans Disbursed</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{lenderData.summary?.totalDisbursedLoans || 0}</p>
              </div>
            </div>

            {/* Lender-wise Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', overflowX: 'auto' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Lender-wise Commission</h2>
              
              {lenderData.lenderWise?.length === 0 ? (
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
                    {lenderData.lenderWise.map((item, idx) => (
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
          </>
        )}

        {/* ============================================
            TAB 2: MENTAL HEALTH COMMISSION (NEW)
        ============================================ */}
        {activeTab === 'mentalhealth' && (
          <>
            {/* Filters */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Search</label>
                  <input
                    type="text"
                    placeholder="Search therapist or patient..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleDownloadMentalHealthReport}
                  style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <FaDownload /> Export Report
                </button>
              </div>
            </div>

            {loadingMentalHealth ? (
              <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', textAlign: 'center' }}>
                <p>Loading mental health commission data...</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Revenue</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>₹{mentalHealthData?.summary?.totalRevenue?.toLocaleString() || 0}</p>
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Commission</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>₹{mentalHealthData?.summary?.totalCommission?.toLocaleString() || 0}</p>
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Platform Earnings</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>₹{mentalHealthData?.summary?.platformEarnings?.toLocaleString() || 0}</p>
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Sessions</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{mentalHealthData?.summary?.totalSessions || 0}</p>
                  </div>
                </div>

                {/* Booking Table */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', overflowX: 'auto' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Session-wise Commission</h2>
                  
                  {mentalHealthData?.bookings?.length === 0 ? (
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No bookings found</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Booking ID</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Therapist</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Patient</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Date</th>
                          <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', color: '#6b7280' }}>Amount</th>
                          <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', color: '#6b7280' }}>Commission</th>
                          <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', color: '#6b7280' }}>Rate</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mentalHealthData?.bookings.map((booking, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                              {booking._id?.slice(-8)}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{booking.therapistName || 'Unknown'}</td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{booking.patientName || 'Unknown'}</td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                              {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>₹{booking.amount?.toFixed(2) || 0}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 'bold', color: '#f59e0b' }}>₹{booking.commission?.toFixed(2) || 0}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>{booking.commissionRate}%</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                backgroundColor: booking.status === 'paid' ? '#d1fae5' : booking.status === 'pending' ? '#fef3c7' : '#fee2e2',
                                color: booking.status === 'paid' ? '#065f46' : booking.status === 'pending' ? '#92400e' : '#991b1b'
                              }}>
                                {booking.status || 'Unknown'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCommission;
