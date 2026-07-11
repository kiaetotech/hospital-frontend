import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EmployeePortal = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [dependents, setDependents] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('employeeToken');
    if (!token) {
      navigate('/corporate/employee/login');
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('employeeToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (activeTab === 'dashboard') {
        const empRes = await axios.get('/api/corporate/employee/profile', config);
        setEmployee(empRes.data.data);
        const plansRes = await axios.get('/api/corporate/employee/plans', config);
        setPlans(plansRes.data.data);
      } else if (activeTab === 'claims') {
        const claimsRes = await axios.get('/api/corporate/employee/claims', config);
        // Handle claims data
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
      if (error.response?.status === 401) {
        navigate('/corporate/employee/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId) => {
    try {
      const token = localStorage.getItem('employeeToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/api/corporate/employee/select-plan/${planId}`, {}, config);
      alert('Plan selected successfully!');
      loadData();
    } catch (error) {
      alert('Failed to select plan: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>👤 Employee Portal</h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Welcome, {employee?.name}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'dashboard' ? '#2563eb' : 'transparent', color: activeTab === 'dashboard' ? 'white' : '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal' }}>📊 Dashboard</button>
            <button onClick={() => setActiveTab('plans')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'plans' ? '#2563eb' : 'transparent', color: activeTab === 'plans' ? 'white' : '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: activeTab === 'plans' ? 'bold' : 'normal' }}>🛡️ Plans</button>
            <button onClick={() => setActiveTab('claims')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'claims' ? '#2563eb' : 'transparent', color: activeTab === 'claims' ? 'white' : '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: activeTab === 'claims' ? 'bold' : 'normal' }}>📋 Claims</button>
            <button onClick={() => setActiveTab('profile')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'profile' ? '#2563eb' : 'transparent', color: activeTab === 'profile' ? 'white' : '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: activeTab === 'profile' ? 'bold' : 'normal' }}>👤 Profile</button>
            <button onClick={() => { localStorage.removeItem('employeeToken'); navigate('/corporate/employee/login'); }} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {activeTab === 'dashboard' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280' }}>👨‍👩‍👧‍👦 Dependents</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{employee?.dependents?.length || 0}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280' }}>🛡️ Coverage</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(employee?.coverageAmount || 0)}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280' }}>📋 Claims Filed</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{employee?.claims?.length || 0}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280' }}>✅ Status</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{employee?.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>⚡ Quick Actions</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('plans')} style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🛡️ View Plans</button>
                <button onClick={() => setActiveTab('claims')} style={{ padding: '8px 16px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>📋 File a Claim</button>
                <button onClick={() => setActiveTab('profile')} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>👤 Update Profile</button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'plans' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>🛡️ Available Plans</h2>
            {plans.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No plans available</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {plans.map((plan) => (
                  <div key={plan._id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: '4px solid #2563eb' }}>
                    <h3 style={{ fontWeight: 'bold' }}>{plan.planName}</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{plan.companyName}</p>
                    <div style={{ margin: '12px 0' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(plan.premiumPerEmployee)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>per year</div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1rem' }}>
                      {(plan.features || []).slice(0, 3).map((f, i) => (
                        <span key={i} style={{ fontSize: '0.65rem', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '10px' }}>✅ {f}</span>
                      ))}
                    </div>
                    <button onClick={() => handleSelectPlan(plan._id)} style={{ width: '100%', padding: '8px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Select Plan</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePortal;
