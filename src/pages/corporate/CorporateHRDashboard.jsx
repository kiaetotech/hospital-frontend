import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CorporateHRDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('corporateToken');
    if (!token) {
      navigate('/corporate/hr/login');
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('corporateToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (activeTab === 'dashboard') {
        const statsRes = await axios.get('/api/corporate/hr/dashboard', config);
        setStats(statsRes.data.data);
        const empRes = await axios.get('/api/corporate/hr/employees', config);
        setEmployees(empRes.data.data);
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

  const handleLogout = () => {
    localStorage.removeItem('corporateToken');
    localStorage.removeItem('corporateId');
    navigate('/corporate');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🏢 HR Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'dashboard' ? '#2563eb' : 'transparent', color: activeTab === 'dashboard' ? 'white' : '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal' }}>📊 Dashboard</button>
          <button onClick={() => setActiveTab('employees')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'employees' ? '#2563eb' : 'transparent', color: activeTab === 'employees' ? 'white' : '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: activeTab === 'employees' ? 'bold' : 'normal' }}>👨‍💼 Employees</button>
          <button onClick={() => setActiveTab('add')} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>➕ Add Employee</button>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {activeTab === 'dashboard' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280' }}>Total Employees</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalEmployees || 0}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280' }}>Active Employees</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.activeEmployees || 0}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280' }}>Total Premium</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(stats.totalPremium || 0)}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280' }}>Claims</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.totalClaims || 0}</p>
              </div>
            </div>

            {/* Employees Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Recent Employees</h3>
              {employees.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No employees added yet. <button onClick={() => setActiveTab('add')} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Add your first employee</button></p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Department</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.slice(0, 10).map((emp, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '8px' }}>{emp.name}</td>
                        <td style={{ padding: '8px' }}>{emp.email}</td>
                        <td style={{ padding: '8px' }}>{emp.department || '-'}</td>
                        <td style={{ padding: '8px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', backgroundColor: emp.isActive ? '#dcfce7' : '#fee2e2', color: emp.isActive ? '#166534' : '#dc2626' }}>
                            {emp.isActive ? 'Active' : 'Inactive'}
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
      </div>
    </div>
  );
};

export default CorporateHRDashboard;