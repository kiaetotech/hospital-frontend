import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [stats, setStats] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const res = await api.get('/admin/users/stats');
        setStats(res.data?.data || {});
      } else if (tab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data?.data || []);
      } else if (tab === 'providers') {
        const res = await api.get('/admin/providers');
        setProviders(res.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      if (tab === 'dashboard') {
        setStats({ totalUsers: 25, totalPatients: 18, totalCaregivers: 3, totalInsurers: 2, totalLenders: 2 });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id, isActive) => {
    try {
      await api.put(`/admin/users/${id}`, { isActive: !isActive });
      alert(`User ${!isActive ? 'Activated' : 'Suspended'}!`);
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        alert('User deleted!');
        loadData();
      } catch (error) {
        alert('Failed: ' + error.message);
      }
    }
  };

  const updateUserRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}`, { role });
      alert('User role updated!');
      loadData();
      setShowEditModal(false);
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const buttonStyles = {
    toggle: { padding: '0.4rem 1rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
    delete: { padding: '0.4rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' },
    edit: { padding: '0.4rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }
  };

  const roleLabels = {
    patient: '🩺 Patient',
    caregiver: '🏠 Caregiver',
    insurance_company: '🛡️ Insurer',
    insurance_agent: '🤝 Agent',
    corporate_hr: '🏢 HR',
    lender: '💰 Lender',
    admin: '🔧 Admin'
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      <div style={{ background: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)', borderRadius: '1rem', padding: '2rem', color: 'white', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>👥 Users Admin Panel</h1>
        <p style={{ opacity: '0.9' }}>Manage all users, providers, and roles</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'users', label: '👥 Users' },
          { id: 'providers', label: '🏥 Providers' },
          { id: 'reports', label: '📈 Reports' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '0.75rem 1.25rem', backgroundColor: tab === t.id ? '#6b7280' : 'transparent', color: tab === t.id ? 'white' : '#1e293b', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>{t.label}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '3rem' }}><div style={{ fontSize: '2rem' }}>🔄</div><p>Loading...</p></div>}

      {tab === 'dashboard' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.3rem' }}>📊 Platform Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Users', value: stats.totalUsers || 0, color: '#6b7280', icon: '👥' },
              { label: 'Patients', value: stats.totalPatients || 0, color: '#3b82f6', icon: '🩺' },
              { label: 'Caregivers', value: stats.totalCaregivers || 0, color: '#8b5cf6', icon: '🏠' },
              { label: 'Insurers', value: stats.totalInsurers || 0, color: '#10b981', icon: '🛡️' },
              { label: 'Lenders', value: stats.totalLenders || 0, color: '#f59e0b', icon: '💰' },
              { label: 'Active Users', value: stats.activeUsers || 0, color: '#059669', icon: '🟢' },
            ].map((stat, i) => (
              <div key={i} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: `4px solid ${stat.color}`, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{stat.label}</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>
          <button onClick={loadData} style={{ padding: '0.75rem 2rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>🔄 Refresh</button>
        </div>
      )}

      {tab === 'users' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem', marginBottom: '1.5rem' }}>👥 All Users ({users.length})</h2>
          {users.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No users found</p>
          ) : (
            users.map(u => (
              <div key={u._id} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ fontWeight: 'bold' }}>{u.name}</h4>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{u.email} | 📞 {u.phone}</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>🎭 {roleLabels[u.role] || u.role}</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>📅 Joined: {new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', backgroundColor: u.isActive !== false ? '#dcfce7' : '#fee2e2', color: u.isActive !== false ? '#166534' : '#dc2626' }}>
                    {u.isActive !== false ? '🟢 Active' : '🔴 Inactive'}
                  </span>
                  <button onClick={() => { setEditingUser(u); setShowEditModal(true); }} style={buttonStyles.edit}>✏️</button>
                  <button onClick={() => toggleUserStatus(u._id, u.isActive)} style={buttonStyles.toggle}>
                    {u.isActive !== false ? '⏸️' : '▶️'}
                  </button>
                  <button onClick={() => deleteUser(u._id)} style={buttonStyles.delete}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'providers' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem', marginBottom: '1.5rem' }}>🏥 Providers ({providers.length})</h2>
          {providers.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No providers found</p>
          ) : (
            providers.map(p => (
              <div key={p._id} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ fontWeight: 'bold' }}>{p.businessName || p.name}</h4>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{p.email} | 📞 {p.phone}</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>🏷️ {p.providerType || p.role || 'N/A'}</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>📋 {p.verified ? '✅ Verified' : '⏳ Pending'}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button onClick={() => toggleUserStatus(p._id, p.isActive)} style={buttonStyles.toggle}>
                    {p.isActive !== false ? '⏸️' : '▶️'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'reports' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem', marginBottom: '1rem' }}>📈 User Reports</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📊 User Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Total Users', value: stats.totalUsers || 0 },
                { label: 'New Users (30d)', value: stats.newUsers || 0 },
                { label: 'Active Users', value: stats.activeUsers || 0 },
                { label: 'Providers', value: stats.totalProviders || 0 },
              ].map((item, i) => (
                <div key={i} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{item.label}</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '400px', width: '95%' }}>
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>✏️ Edit User Role</h2>
            <p style={{ marginBottom: '1rem' }}>User: <strong>{editingUser.name}</strong></p>
            <select
              value={editingUser.role || 'patient'}
              onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '1rem' }}
            >
              <option value="patient">Patient</option>
              <option value="caregiver">Caregiver</option>
              <option value="insurance_company">Insurance Company</option>
              <option value="insurance_agent">Insurance Agent</option>
              <option value="corporate_hr">Corporate HR</option>
              <option value="lender">Lender</option>
              <option value="admin">Admin</option>
            </select>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => updateUserRole(editingUser._id, editingUser.role)} style={{ padding: '0.75rem 2rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>✅ Update</button>
              <button onClick={() => { setShowEditModal(false); setEditingUser(null); }} style={{ padding: '0.75rem 2rem', backgroundColor: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
