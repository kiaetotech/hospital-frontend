import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderDashboardLayout from '../../components/ProviderDashboardLayout';
import ProviderStatsCards from '../../components/ProviderStatsCards';
import ProviderTable from '../../components/ProviderTable';
import { insuranceApi } from '../../services/providerApi';
import ProviderAuth from '../../components/ProviderAuth';

const InsuranceCompanyDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [plans, setPlans] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [profile, setProfile] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [claimStatus, setClaimStatus] = useState('all');
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [newPlan, setNewPlan] = useState({
    planName: '',
    planType: 'individual',
    sumInsured: { min: 100000, max: 10000000, default: 500000, options: [300000,500000,1000000,2500000,5000000,10000000] },
    basePremium: 10000,
    features: [],
    inclusions: [],
    exclusions: [],
    isActive: true
  });

  const sidebarItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'profile', label: '🏢 Company Profile', icon: '🏢' },
    { id: 'plans', label: '📋 Plans', icon: '📋' },
    { id: 'policies', label: '📄 Policies', icon: '📄' },
    { id: 'claims', label: '📋 Claims', icon: '📋' },
    { id: 'settlements', label: '💰 Settlements', icon: '💰' },
    { id: 'reports', label: '📊 Reports', icon: '📊' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
  ];

  useEffect(() => {
    loadData();
  }, [activeTab, claimStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('providerToken');
      if (!token) {
        navigate('/insurance/company/login');
        return;
      }

      if (activeTab === 'dashboard') {
        const statsRes = await insuranceApi.getStats();
        setStats(statsRes.data?.data?.stats || {});
        const policiesRes = await insuranceApi.getPolicies();
        setPolicies(policiesRes.data?.data || []);
        const claimsRes = await insuranceApi.getClaims();
        setClaims(claimsRes.data?.data || []);
      } else if (activeTab === 'plans') {
        const plansRes = await insuranceApi.getPlans();
        setPlans(plansRes.data?.data || []);
      } else if (activeTab === 'policies') {
        const policiesRes = await insuranceApi.getPolicies();
        setPolicies(policiesRes.data?.data || []);
      } else if (activeTab === 'claims') {
        const claimsRes = await insuranceApi.getClaims();
        const allClaims = claimsRes.data?.data || [];
        setClaims(claimStatus === 'pending' ? allClaims.filter(c => ['submitted', 'under_review'].includes(c.status)) : claimStatus === 'all' ? allClaims : allClaims.filter(c => c.status === claimStatus));
      } else if (activeTab === 'settlements') {
        const settlementsRes = await insuranceApi.getSettlements();
        setSettlements(settlementsRes.data?.data || []);
      } else if (activeTab === 'reports') {
      } else if (activeTab === 'profile') {
        const profileRes = await insuranceApi.getProfile();
        setProfile(profileRes.data?.data || null);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        navigate('/insurance/company/login');
      }
    } finally {
      setLoading(false);
    }
  };


  const generateReport = async (period) => {
    try {
      const now = new Date();
      const start = new Date(now);
      if (period === 'daily') start.setDate(now.getDate() - 1);
      else start.setMonth(now.getMonth() - 1);
      const response = await insuranceApi.getReports({ startDate: start.toISOString(), endDate: now.toISOString() });
      const report = response.data?.data;
      if (!report) throw new Error('No report data returned');
      const csv = [
        ['Metric', 'Value'],
        ['Total Policies', report.summary?.totalPolicies || 0],
        ['Total Premium', report.summary?.totalPremium || 0],
        ['Total Commission', report.summary?.totalCommission || 0],
        ['Total Payout', report.summary?.totalPayout || 0],
        ['Average Premium', report.summary?.averagePremium || 0]
      ].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `insurance-${period}-report.csv`; a.click(); URL.revokeObjectURL(url);
    } catch (error) { alert(error.response?.data?.message || error.message || 'Failed to generate report'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('providerToken');
    localStorage.removeItem('providerType');
    localStorage.removeItem('providerId');
    navigate('/insurance/company/login');
  };

  const handleAddPlan = async () => {
    try {
      if (editingPlanId) await insuranceApi.updatePlan(editingPlanId, newPlan);
      else await insuranceApi.addPlan(newPlan);
      alert(editingPlanId ? 'Plan updated successfully!' : 'Plan added successfully!');
      setShowAddPlan(false);
      setEditingPlanId(null);
      setNewPlan({
        planName: '',
        planType: 'individual',
        sumInsured: { min: 100000, max: 10000000, default: 500000, options: [300000,500000,1000000,2500000,5000000,10000000] },
        basePremium: 10000,
        features: [],
        inclusions: [],
        exclusions: [],
        isActive: true
      });
      loadData();
    } catch (error) {
      alert('Failed to add plan: ' + error.message);
    }
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await insuranceApi.deletePlan(id);
        alert('Plan deleted!');
        loadData();
      } catch (error) {
        alert('Failed to delete plan: ' + error.message);
      }
    }
  };

  const handleTogglePlanStatus = async (id, isActive) => {
    try {
      await insuranceApi.updatePlan(id, { isActive: !isActive });
      alert(`Plan ${!isActive ? 'activated' : 'deactivated'}!`);
      loadData();
    } catch (error) {
      alert('Failed to update plan: ' + error.message);
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div>
            <ProviderStatsCards stats={stats} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Recent Policies */}
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📄 Recent Policies</h3>
                {policies.slice(0, 5).map((policy, index) => (
                  <div key={index} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{policy.policyNumber} - {policy.customerName}</span>
                      <span style={{ 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '10px', 
                        fontSize: '0.7rem',
                        backgroundColor: policy.status === 'active' ? '#dcfce7' : '#fef3c7',
                        color: policy.status === 'active' ? '#166534' : '#92400e'
                      }}>
                        {policy.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      {policy.planName} - ₹{policy.premium}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Claims */}
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📋 Recent Claims</h3>
                {claims.slice(0, 5).map((claim, index) => (
                  <div key={index} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{claim.claimId} - ₹{claim.amount}</span>
                      <span style={{ 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '10px', 
                        fontSize: '0.7rem',
                        backgroundColor: claim.status === 'settled' ? '#dcfce7' : claim.status === 'under_review' ? '#dbeafe' : '#fef3c7',
                        color: claim.status === 'settled' ? '#166534' : claim.status === 'under_review' ? '#1e40af' : '#92400e'
                      }}>
                        {claim.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      Policy: {claim.policyNumber} • {claim.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: '1.5rem', backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>⚡ Quick Actions</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('plans')} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>📋 Manage Plans</button>
                <button onClick={() => setActiveTab('policies')} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>📄 View Policies</button>
                <button onClick={() => setActiveTab('claims')} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>📋 Manage Claims</button>
                <button onClick={() => setActiveTab('settlements')} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>💰 Settlements</button>
                <button onClick={() => setShowAddPlan(true)} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>➕ Add New Plan</button>
              </div>
            </div>
          </div>
        );

      case 'plans':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>📋 Insurance Plans</h2>
              <button onClick={() => setShowAddPlan(true)} style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>➕ Add Plan</button>
            </div>
            <ProviderTable
              columns={[
                { key: 'planName', label: 'Plan Name' },
                { key: 'planType', label: 'Type', render: (val) => val?.replace('_', ' ').toUpperCase() || '-' },
                { key: 'sumInsured', label: 'Sum Insured (₹)', render: (val) => val?.default?.toLocaleString() || val?.toLocaleString() || '-' },
                { key: 'basePremium', label: 'Premium (₹)', render: (val) => val?.toLocaleString() || '-' },
                { key: 'isActive', label: 'Status', render: (val) => (
                  <span style={{ 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '10px', 
                    fontSize: '0.7rem',
                    backgroundColor: val ? '#dcfce7' : '#fee2e2',
                    color: val ? '#166534' : '#dc2626'
                  }}>
                    {val ? '🟢 Active' : '🔴 Inactive'}
                  </span>
                )}
              ]}
              data={plans}
              loading={loading}
              onEdit={(row) => { setNewPlan({ ...row, sumInsured: row.sumInsured || { min: 100000, max: 10000000, default: 500000 } }); setEditingPlanId(row._id); setShowAddPlan(true); }}
              onDelete={(row) => handleDeletePlan(row._id)}
              onView={(row) => navigate(`/insurance/plan/${row._id}`)}
            />
          </div>
        );

      case 'policies':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>📄 Issued Policies</h2>
            <ProviderTable
              columns={[
                { key: 'policyNumber', label: 'Policy Number' },
                { key: 'customerName', label: 'Customer' },
                { key: 'planName', label: 'Plan' },
                { key: 'premium', label: 'Premium (₹)' },
                { key: 'status', label: 'Status', render: (val) => (
                  <span style={{ 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '10px', 
                    fontSize: '0.7rem',
                    backgroundColor: val === 'active' ? '#dcfce7' : val === 'pending' ? '#fef3c7' : '#fee2e2',
                    color: val === 'active' ? '#166534' : val === 'pending' ? '#92400e' : '#dc2626'
                  }}>
                    {val}
                  </span>
                )}
              ]}
              data={policies}
              loading={loading}
              onView={(row) => navigate(`/insurance/my-policies/${row._id}`)}
            />
          </div>
        );

      case 'claims':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>📋 Claims Management</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setClaimStatus('pending')} style={{ padding: '0.25rem 1rem', backgroundColor: claimStatus === 'pending' ? '#d97706' : '#f59e0b', color: 'white', border: 'none', borderRadius: '1rem', cursor: 'pointer' }}>Pending</button>
                <button onClick={() => setClaimStatus('settled')} style={{ padding: '0.25rem 1rem', backgroundColor: claimStatus === 'settled' ? '#059669' : '#10b981', color: 'white', border: 'none', borderRadius: '1rem', cursor: 'pointer' }}>Settled</button>
                <button onClick={() => setClaimStatus('all')} style={{ padding: '0.25rem 1rem', backgroundColor: claimStatus === 'all' ? '#475569' : '#94a3b8', color: 'white', border: 'none', borderRadius: '1rem', cursor: 'pointer' }}>All</button>
              </div>
            </div>
            <ProviderTable
              columns={[
                { key: 'claimId', label: 'Claim ID' },
                { key: 'policyNumber', label: 'Policy' },
                { key: 'amount', label: 'Amount (₹)', render: (val) => val?.toLocaleString() || '-' },
                { key: 'date', label: 'Date' },
                { key: 'status', label: 'Status', render: (val) => (
                  <span style={{ 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '10px', 
                    fontSize: '0.7rem',
                    backgroundColor: val === 'settled' ? '#dcfce7' : val === 'under_review' ? '#dbeafe' : '#fef3c7',
                    color: val === 'settled' ? '#166534' : val === 'under_review' ? '#1e40af' : '#92400e'
                  }}>
                    {val}
                  </span>
                )}
              ]}
              data={claims}
              loading={loading}
              onView={(row) => { setActiveTab('claims'); setClaimStatus('all'); }}
            />
          </div>
        );

      case 'settlements':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>💰 Settlements</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Pending Transactions</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{settlements.filter(s => s.commissionStatus !== 'paid').length}</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Settled Transactions</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{settlements.filter(s => s.commissionStatus === 'paid').length}</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Total Provider Payout</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>₹{settlements.reduce((sum, s) => sum + Number(s.insurancePayoutToCompany || s.providerAmount || 0), 0).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => loadData()} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Refresh Settlements</button>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>🏢 Company Profile</h2>
            {profile ? (
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><strong>Company Name:</strong> {profile.companyName || 'N/A'}</div>
                  <div><strong>Email:</strong> {profile.email || 'N/A'}</div>
                  <div><strong>Phone:</strong> {profile.phone || 'N/A'}</div>
                  <div><strong>IRDA Registration:</strong> {profile.irdaRegistration || 'N/A'}</div>
                  <div><strong>Status:</strong> 
                    <span style={{ 
                      padding: '0.15rem 0.5rem', 
                      borderRadius: '10px', 
                      fontSize: '0.7rem',
                      backgroundColor: profile.isVerified ? '#dcfce7' : '#fef3c7',
                      color: profile.isVerified ? '#166534' : '#92400e'
                    }}>
                      {profile.isVerified ? '✅ Verified' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        );

      case 'reports':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>📊 Reports</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📅 Daily Report</h3>
                <button onClick={() => generateReport('daily')} style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Generate Report</button>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📆 Monthly Report</h3>
                <button onClick={() => generateReport('monthly')} style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Generate Report</button>
              </div>
            </div>
          </div>
        );

      default:
        return <div style={{ padding: '1rem' }}>This section is not configured for this account.</div>;
    }
  };

  return (
    <ProviderAuth providerType="insurance">
      <ProviderDashboardLayout
        title="Insurance Company Dashboard"
        icon="🛡️"
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={profile?.companyName || 'Insurance Company'}
        userRole="Insurer"
        logout={handleLogout}
      >
        {renderContent()}
        
        {/* Add Plan Modal */}
        {showAddPlan && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '600px',
              width: '95%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>➕ Add New Insurance Plan</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Plan Name *"
                  value={newPlan.planName}
                  onChange={(e) => setNewPlan({ ...newPlan, planName: e.target.value })}
                  style={inputStyle}
                />
                <select
                  value={newPlan.planType}
                  onChange={(e) => setNewPlan({ ...newPlan, planType: e.target.value })}
                  style={inputStyle}
                >
                  <option value="individual">Individual</option>
                  <option value="family_floater">Family Floater</option>
                  <option value="critical_illness">Critical Illness</option>
                  <option value="senior_citizen">Senior Citizen</option>
                  <option value="maternity">Maternity</option>
                </select>
                <input
                  type="number"
                  placeholder="Sum Insured (₹) *"
                  value={newPlan.sumInsured}
                  onChange={(e) => setNewPlan({ ...newPlan, sumInsured: parseInt(e.target.value) })}
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="Base Premium (₹) *"
                  value={newPlan.basePremium}
                  onChange={(e) => setNewPlan({ ...newPlan, basePremium: parseInt(e.target.value) })}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Features (comma separated)"
                  onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value.split(',').map(s => s.trim()) })}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Inclusions (comma separated)"
                  onChange={(e) => setNewPlan({ ...newPlan, inclusions: e.target.value.split(',').map(s => s.trim()) })}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Exclusions (comma separated)"
                  onChange={(e) => setNewPlan({ ...newPlan, exclusions: e.target.value.split(',').map(s => s.trim()) })}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button
                  onClick={handleAddPlan}
                  style={{ padding: '0.75rem 2rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}
                >
                  ✅ Add Plan
                </button>
                <button
                  onClick={() => setShowAddPlan(false)}
                  style={{ padding: '0.75rem 2rem', backgroundColor: '#e5e7eb', color: '#1e293b', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </ProviderDashboardLayout>
    </ProviderAuth>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.6rem',
  borderRadius: '0.5rem',
  border: '1px solid #e5e7eb',
  fontSize: '0.9rem',
  backgroundColor: 'white',
  outline: 'none'
};

export default InsuranceCompanyDashboard;

