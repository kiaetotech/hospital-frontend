import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BulkEmployeeUpload from '../../components/corporate/BulkEmployeeUpload';

const CorporateHRDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalPremium: 0,
    totalClaims: 0,
    pendingClaims: 0,
    planStatus: 'pending',
    planName: 'No active plan'
  });
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check authentication on load
  useEffect(() => {
    const token = localStorage.getItem('corporateToken');
    if (!token) {
      navigate('/corporate/hr/login');
      return;
    }
    loadData();
  }, [activeTab]);

  // Load data based on active tab
  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('corporateToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (activeTab === 'dashboard') {
        // Fetch dashboard stats
        const statsRes = await axios.get('/api/corporate/hr/dashboard', config);
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }

        // Fetch employees
        const empRes = await axios.get('/api/corporate/hr/employees', config);
        if (empRes.data.success) {
          setEmployees(empRes.data.data);
        }
      } else if (activeTab === 'employees') {
        // Fetch only employees
        const empRes = await axios.get('/api/corporate/hr/employees', config);
        if (empRes.data.success) {
          setEmployees(empRes.data.data);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('corporateToken');
        navigate('/corporate/hr/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('corporateToken');
    localStorage.removeItem('corporateId');
    navigate('/corporate');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Get status badge color
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

  // Loading skeleton
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* ============================================
          HEADER
          ============================================ */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        padding: '1.5rem 2rem',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🏢 HR Dashboard</h1>
          <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>Manage your corporate health benefits</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{
            padding: '0.25rem 1rem',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '20px',
            fontSize: '0.85rem'
          }}>
            Plan: {stats.planName}
          </span>
          {getStatusBadge(stats.planStatus)}
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ============================================
          TAB NAVIGATION
          ============================================ */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '0.5rem 2rem',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'employees', label: '👨‍💼 Employees' },
          { id: 'bulk', label: '📤 Bulk Upload' },
          { id: 'claims', label: '📋 Claims' },
          { id: 'tax', label: '💰 Tax Benefits' },
          { id: 'reports', label: '📊 Reports' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: activeTab === tab.id ? '#2563eb' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#1e293b',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================
          CONTENT AREA
          ============================================ */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* ============================================
            TAB 1: DASHBOARD
            ============================================ */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #2563eb'
              }}>
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>👥 Total Employees</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalEmployees || 0}</p>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #10b981'
              }}>
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>✅ Active Employees</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.activeEmployees || 0}</p>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #8b5cf6'
              }}>
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>💰 Total Premium</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{formatCurrency(stats.totalPremium)}</p>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #f59e0b'
              }}>
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>📋 Total Claims</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.totalClaims || 0}</p>
                <p style={{ fontSize: '0.75rem', color: '#dc2626' }}>{stats.pendingClaims || 0} pending</p>
              </div>
            </div>

            {/* Recent Employees Table */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 'bold' }}>📋 Recent Employees</h3>
                <button
                  onClick={() => setActiveTab('employees')}
                  style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  View All →
                </button>
              </div>

              {employees.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  No employees added yet.
                  <button
                    onClick={() => setActiveTab('bulk')}
                    style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginLeft: '0.5rem' }}
                  >
                    Add your first employee
                  </button>
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Name</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Email</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Department</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.slice(0, 5).map((emp, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '0.75rem', fontWeight: '500' }}>{emp.name}</td>
                          <td style={{ padding: '0.75rem' }}>{emp.email}</td>
                          <td style={{ padding: '0.75rem' }}>{emp.department || '-'}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              backgroundColor: emp.isActive ? '#dcfce7' : '#fee2e2',
                              color: emp.isActive ? '#166534' : '#dc2626',
                              fontWeight: 'bold'
                            }}>
                              {emp.isActive ? '✅ Active' : '❌ Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ============================================
            TAB 2: EMPLOYEES
            ============================================ */}
        {activeTab === 'employees' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>👨‍💼 All Employees ({employees.length})</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveTab('bulk')}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  📤 Bulk Upload
                </button>
                <button
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                  onClick={() => alert('Add employee form coming soon')}
                >
                  ➕ Add Employee
                </button>
              </div>
            </div>

            {employees.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No employees found</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Email</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Phone</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Department</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Designation</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{emp.name}</td>
                        <td style={{ padding: '0.75rem' }}>{emp.email}</td>
                        <td style={{ padding: '0.75rem' }}>{emp.phone}</td>
                        <td style={{ padding: '0.75rem' }}>{emp.department || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>{emp.designation || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            backgroundColor: emp.isActive ? '#dcfce7' : '#fee2e2',
                            color: emp.isActive ? '#166534' : '#dc2626',
                            fontWeight: 'bold'
                          }}>
                            {emp.isActive ? '✅ Active' : '❌ Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================
            TAB 3: BULK UPLOAD
            ============================================ */}
        {activeTab === 'bulk' && (
          <BulkEmployeeUpload onUploadComplete={() => {
            loadData();
            setActiveTab('employees');
          }} />
        )}

        {/* ============================================
            TAB 4: CLAIMS
            ============================================ */}
        {activeTab === 'claims' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>📋 Claims Management</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Track and manage employee claims</p>

            {stats.totalClaims === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No claims filed yet</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Employee</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Amount</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Date</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.75rem' }}>John Doe</td>
                      <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>₹15,000</td>
                      <td style={{ padding: '0.75rem' }}>2024-01-15</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          Pending
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================
            TAB 5: TAX BENEFITS
            ============================================ */}
        {activeTab === 'tax' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>💰 Tax Benefit Calculator</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Calculate tax savings on health insurance premiums</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Annual Premium (₹)</label>
                <input
                  type="number"
                  id="premiumInput"
                  placeholder="e.g., 15000"
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Tax Slab (%)</label>
                <select
                  id="slabSelect"
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="5">5%</option>
                  <option value="10">10%</option>
                  <option value="20">20%</option>
                  <option value="30">30%</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                const premium = document.getElementById('premiumInput').value;
                const slab = document.getElementById('slabSelect').value;
                if (!premium || premium <= 0) {
                  alert('Please enter a valid premium amount');
                  return;
                }
                const saving = (parseFloat(premium) * parseFloat(slab)) / 100;
                alert(`💰 Tax Savings: ₹${saving.toFixed(2)} per year`);
              }}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              Calculate Savings
            </button>
          </div>
        )}

        {/* ============================================
            TAB 6: REPORTS
            ============================================ */}
        {activeTab === 'reports' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>📊 Reports & Analytics</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Generate and download reports</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ fontWeight: 'bold' }}>👥 Employee Report</h4>
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>List of all employees</p>
                <button style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Download PDF</button>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ fontWeight: 'bold' }}>💰 Financial Report</h4>
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Premium and claims summary</p>
                <button style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Download PDF</button>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ fontWeight: 'bold' }}>📋 Claims Report</h4>
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Claims filed and status</p>
                <button style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Download PDF</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};


const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-f1b1.up.railway.app';

const CorporateHRDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalPremium: 0,
    walletBalance: 0,
    utilization: {},
    totalClaims: 0,
    pendingClaims: 0,
    planStatus: 'pending',
    planName: 'No active plan',
    recentBookings: []
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('corporateToken') || localStorage.getItem('hrToken');
    if (!token) {
      navigate('/corporate/hr/login');
      return;
    }
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('corporateToken') || localStorage.getItem('hrToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [statsRes, empRes] = await Promise.all([
        axios.get(`${API_BASE}/api/corporate/hr/dashboard`, config),
        axios.get(`${API_BASE}/api/corporate/hr/employees`, config)
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (empRes.data?.success) setEmployees(empRes.data.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/corporate/hr/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('corporateToken');
    localStorage.removeItem('hrToken');
    localStorage.removeItem('corporateId');
    navigate('/corporate');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'employees', label: '👨‍💼 Employees' },
    { id: 'bulk', label: '📤 Bulk Upload' },
    { id: 'bookings', label: '📋 Bookings & Claims' },
    { id: 'tax', label: '💰 Tax Benefits' },
    { id: 'reports', label: '📊 Reports' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        padding: '1.5rem 2rem',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🏢 HR Dashboard</h1>
          <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>Manage your corporate health benefits</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* 🆕 Wallet Balance */}
          <div style={{ padding: '0.5rem 1.25rem', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>💰 Wallet: </span>
            <span style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{formatCurrency(stats.walletBalance || 0)}</span>
          </div>
          <span style={{ padding: '0.25rem 1rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.85rem' }}>
            Plan: {stats.planName}
          </span>
          {getStatusBadge(stats.planStatus)}
          <button onClick={handleLogout} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '0.5rem 2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', overflowX: 'auto' }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => {}} style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: 'transparent',
            color: '#1e293b',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 'normal',
            whiteSpace: 'nowrap'
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* DASHBOARD TAB */}
        <div id="tab-dashboard">
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #2563eb' }}>
              <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>👥 Total Employees</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalEmployees || 0}</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
              <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>✅ Active Employees</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.activeEmployees || 0}</p>
            </div>
            {/* 🆕 Wallet Balance Card */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid '#8b5cf6' }}>
              <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>💰 Wallet Balance</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{formatCurrency(stats.walletBalance || 0)}</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid '#f59e0b' }}>
              <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>📋 Total Claims</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.totalClaims || 0}</p>
              <p style={{ fontSize: '0.75rem', color: '#dc2626' }}>{stats.pendingClaims || 0} pending</p>
            </div>
          </div>

          {/* 🆕 Service Utilization */}
          {stats.utilization && Object.keys(stats.utilization).length > 0 && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📊 Service Utilization</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                {Object.entries(stats.utilization).map(([key, val]) => (
                  <div key={key} style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{val}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Employees Table */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 'bold' }}>📋 Recent Employees</h3>
              <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '0.9rem' }}>View All →</span>
            </div>
            {employees.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No employees added yet. Use Bulk Upload to add your first employee.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Email</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Department</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.slice(0, 5).map((emp, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{emp.name}</td>
                        <td style={{ padding: '0.75rem' }}>{emp.email}</td>
                        <td style={{ padding: '0.75rem' }}>{emp.department || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', backgroundColor: emp.isActive ? '#dcfce7' : '#fee2e2', color: emp.isActive ? '#166534' : '#dc2626', fontWeight: 'bold' }}>
                            {emp.isActive ? '✅ Active' : '❌ Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 🆕 Recent Bookings */}
          {stats.recentBookings && stats.recentBookings.length > 0 && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🕐 Recent Bookings</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Employee</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Service</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Provider</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Amount</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.map((b, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem' }}>{b.employeeName || b.patientName || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>{b.serviceType || b.bookingType || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>{b.providerName || b.doctorName || '-'}</td>
                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{formatCurrency(b.amount || b.finalAmount || 0)}</td>
                        <td style={{ padding: '0.75rem' }}>{getStatusBadge(b.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* EMPLOYEES TAB */}
        <div id="tab-employees" style={{ display: 'none' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>👨‍💼 All Employees ({employees.length})</h2>
            {employees.length === 0 ? <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No employees found</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Email</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Phone</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Department</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Designation</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{emp.name}</td>
                        <td style={{ padding: '0.75rem' }}>{emp.email}</td>
                        <td style={{ padding: '0.75rem' }}>{emp.phone}</td>
                        <td style={{ padding: '0.75rem' }}>{emp.department || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>{emp.designation || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', backgroundColor: emp.isActive ? '#dcfce7' : '#fee2e2', color: emp.isActive ? '#166534' : '#dc2626', fontWeight: 'bold' }}>
                            {emp.isActive ? '✅ Active' : '❌ Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* BULK UPLOAD TAB */}
        <div id="tab-bulk" style={{ display: 'none' }}>
          <BulkEmployeeUpload onUploadComplete={() => loadDashboard()} />
        </div>

        {/* BOOKINGS & CLAIMS TAB */}
        <div id="tab-bookings" style={{ display: 'none' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>📋 Bookings & Claims</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Track employee service usage and claims</p>
            {stats.recentBookings && stats.recentBookings.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Employee</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Service</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Provider</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Amount</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Date</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.map((b, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem' }}>{b.employeeName || b.patientName || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>{b.serviceType || b.bookingType || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>{b.providerName || b.doctorName || '-'}</td>
                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{formatCurrency(b.amount || b.finalAmount || 0)}</td>
                        <td style={{ padding: '0.75rem' }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                        <td style={{ padding: '0.75rem' }}>{getStatusBadge(b.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No bookings yet</p>
            )}
          </div>
        </div>

        {/* TAX BENEFITS TAB */}
        <div id="tab-tax" style={{ display: 'none' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>💰 Tax Benefit Calculator</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Calculate tax savings on health insurance premiums</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Annual Premium (₹)</label>
                <input type="number" id="premiumInput" placeholder="e.g., 15000" style={{ width: '100%', padding: '0.6rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '1rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Tax Slab (%)</label>
                <select id="slabSelect" style={{ width: '100%', padding: '0.6rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '1rem' }}>
                  <option value="5">5%</option><option value="10">10%</option><option value="20">20%</option><option value="30">30%</option>
                </select>
              </div>
            </div>
            <button onClick={() => {
              const premium = document.getElementById('premiumInput').value;
              const slab = document.getElementById('slabSelect').value;
              if (!premium || premium <= 0) { alert('Please enter a valid premium amount'); return; }
              const saving = (parseFloat(premium) * parseFloat(slab)) / 100;
              alert(`💰 Tax Savings: ₹${saving.toFixed(2)} per year`);
            }} style={{ padding: '0.75rem 2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
              Calculate Savings
            </button>
          </div>
        </div>

        {/* REPORTS TAB */}
        <div id="tab-reports" style={{ display: 'none' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>📊 Reports & Analytics</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Generate and download reports</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ fontWeight: 'bold' }}>👥 Employee Report</h4>
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>List of all employees</p>
                <button style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Download PDF</button>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ fontWeight: 'bold' }}>💰 Financial Report</h4>
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Premium and claims summary</p>
                <button style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Download PDF</button>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ fontWeight: 'bold' }}>📋 Claims Report</h4>
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Claims filed and status</p>
                <button style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Download PDF</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CorporateHRDashboard;
