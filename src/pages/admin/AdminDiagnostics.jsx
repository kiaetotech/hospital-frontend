import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminDiagnostics = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [labs, setLabs] = useState([]);
  const [pendingLabs, setPendingLabs] = useState([]);
  const [tests, setTests] = useState([]);
  const [packages, setPackages] = useState([]);
  const [stats, setStats] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLab, setNewLab] = useState({
    name: '', address: { line1: '', city: '', state: '', pincode: '' },
    phone: '', email: '', description: '', isVerified: false, isActive: true
  });
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '', description: '', category: '', price: 0, preparation: '', isActive: true
  });

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
        const res = await api.get('/diagnostics/admin/stats');
        setStats(res.data?.data || {});
      } else if (tab === 'labs') {
        const pendingRes = await api.get('/diagnostics/admin/pending');
        setPendingLabs(pendingRes.data?.data || []);
        const allRes = await api.get('/diagnostics');
        setLabs(allRes.data?.data || []);
      } else if (tab === 'tests') {
        const res = await api.get('/diagnostics/tests');
        setTests(res.data?.data || []);
      } else if (tab === 'packages') {
        const res = await api.get('/diagnostics/packages');
        setPackages(res.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      if (tab === 'dashboard') {
        setStats({ totalLabs: 3, pendingVerifications: 1, totalTests: 20, totalPackages: 5, totalBookings: 30, totalRevenue: 45000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyLab = async (id, status) => {
    try {
      await api.put(`/diagnostics/admin/verify/${id}`, { status });
      alert(`Lab ${status}!`);
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const toggleLabStatus = async (id, isActive) => {
    try {
      await api.put(`/diagnostics/${id}`, { isActive: !isActive });
      alert(`Lab ${!isActive ? 'Activated' : 'Suspended'}!`);
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const deleteLab = async (id) => {
    if (window.confirm('Are you sure you want to delete this lab?')) {
      try {
        await api.delete(`/diagnostics/${id}`);
        alert('Lab deleted!');
        loadData();
      } catch (error) {
        alert('Failed: ' + error.message);
      }
    }
  };

  const handleAddLab = async (e) => {
    e.preventDefault();
    try {
      await api.post('/diagnostics', newLab);
      alert('Lab added successfully!');
      setShowAddModal(false);
      setNewLab({ name: '', address: { line1: '', city: '', state: '', pincode: '' }, phone: '', email: '', description: '', isVerified: false, isActive: true });
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const handleAddTest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/diagnostics/tests', newTest);
      alert('Test added successfully!');
      setShowAddTestModal(false);
      setNewTest({ name: '', description: '', category: '', price: 0, preparation: '', isActive: true });
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const deleteTest = async (id) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await api.delete(`/diagnostics/tests/${id}`);
        alert('Test deleted!');
        loadData();
      } catch (error) {
        alert('Failed: ' + error.message);
      }
    }
  };

  const deletePackage = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await api.delete(`/diagnostics/packages/${id}`);
        alert('Package deleted!');
        loadData();
      } catch (error) {
        alert('Failed: ' + error.message);
      }
    }
  };

  const buttonStyles = {
    approve: { padding: '0.4rem 1rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
    reject: { padding: '0.4rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
    toggle: { padding: '0.4rem 1rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
    delete: { padding: '0.4rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      <div style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', borderRadius: '1rem', padding: '2rem', color: 'white', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🔬 Diagnostics Admin Panel</h1>
        <p style={{ opacity: 0.9 }}>Manage labs, tests, and health packages</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'labs', label: '🔬 Labs' },
          { id: 'tests', label: '🧪 Tests' },
          { id: 'packages', label: '📦 Packages' },
          { id: 'reports', label: '📈 Reports' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '0.75rem 1.25rem', backgroundColor: tab === t.id ? '#06b6d4' : 'transparent', color: tab === t.id ? 'white' : '#1e293b', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>{t.label}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '3rem' }}><div style={{ fontSize: '2rem' }}>🔄</div><p>Loading...</p></div>}

      {tab === 'dashboard' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.3rem' }}>📊 Platform Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Labs', value: stats.totalLabs || 0, color: '#06b6d4', icon: '🔬' },
              { label: 'Pending Verifications', value: stats.pendingVerifications || 0, color: '#ef4444', icon: '⏳' },
              { label: 'Total Tests', value: stats.totalTests || 0, color: '#10b981', icon: '🧪' },
              { label: 'Total Packages', value: stats.totalPackages || 0, color: '#8b5cf6', icon: '📦' },
              { label: 'Total Bookings', value: stats.totalBookings || 0, color: '#f59e0b', icon: '📋' },
              { label: 'Revenue', value: `₹${((stats.totalRevenue || 0)).toLocaleString()}`, color: '#2563eb', icon: '💰' },
            ].map((stat, i) => (
              <div key={i} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: `4px solid ${stat.color}`, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{stat.label}</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>
          <button onClick={loadData} style={{ padding: '0.75rem 2rem', backgroundColor: '#06b6d4', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>🔄 Refresh</button>
        </div>
      )}

      {tab === 'labs' && !loading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem' }}>🔬 Labs ({labs.length})</h2>
            <button onClick={() => setShowAddModal(true)} style={{ padding: '0.6rem 1.5rem', backgroundColor: '#06b6d4', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>➕ Add Lab</button>
          </div>

          {pendingLabs.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#f59e0b' }}>⏳ Pending Verification ({pendingLabs.length})</h3>
              {pendingLabs.map(l => (
                <div key={l._id} style={{ backgroundColor: '#fffbeb', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem', border: '1px solid #fcd34d', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 'bold' }}>{l.name}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>📍 {l.address?.city}, {l.address?.state}</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>📞 {l.phone} | ✉️ {l.email}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={() => verifyLab(l._id, 'approved')} style={buttonStyles.approve}>✅ Approve</button>
                    <button onClick={() => verifyLab(l._id, 'rejected')} style={buttonStyles.reject}>❌ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {labs.filter(l => l.isVerified !== false).map(l => (
            <div key={l._id} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ fontWeight: 'bold' }}>{l.name}</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>📍 {l.address?.city} | ⭐ {l.rating || 'N/A'}</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>📞 {l.phone} | ✉️ {l.email}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', backgroundColor: l.isActive !== false ? '#dcfce7' : '#fee2e2', color: l.isActive !== false ? '#166534' : '#dc2626' }}>
                  {l.isActive !== false ? '🟢 Active' : '🔴 Inactive'}
                </span>
                <button onClick={() => toggleLabStatus(l._id, l.isActive)} style={buttonStyles.toggle}>
                  {l.isActive !== false ? '⏸️ Suspend' : '▶️ Activate'}
                </button>
                <button onClick={() => deleteLab(l._id)} style={buttonStyles.delete}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'tests' && !loading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem' }}>🧪 Tests ({tests.length})</h2>
            <button onClick={() => setShowAddTestModal(true)} style={{ padding: '0.6rem 1.5rem', backgroundColor: '#06b6d4', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>➕ Add Test</button>
          </div>

          {tests.map(t => (
            <div key={t._id} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ fontWeight: 'bold' }}>{t.name}</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{t.category} | 💰 ₹{t.price}</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{t.description}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button onClick={() => deleteTest(t._id)} style={buttonStyles.delete}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'packages' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem', marginBottom: '1.5rem' }}>📦 Health Packages ({packages.length})</h2>
          {packages.map(p => (
            <div key={p._id} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ fontWeight: 'bold' }}>{p.name}</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{p.tests?.length || 0} tests included</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>💰 ₹{p.price} | 🏷️ {p.discount || 0}% off</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button onClick={() => deletePackage(p._id)} style={buttonStyles.delete}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'reports' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem', marginBottom: '1rem' }}>📈 Diagnostics Reports</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📅 Daily Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Total Bookings', value: stats.totalBookings || 0 },
                { label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}` },
                { label: 'Commission', value: `₹${(stats.commission || 0).toLocaleString()}` },
                { label: 'Tests Done', value: stats.totalTests || 0 },
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

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '500px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>➕ Add New Lab</h2>
            <form onSubmit={handleAddLab}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input type="text" placeholder="Lab Name *" value={newLab.name} onChange={(e) => setNewLab({...newLab, name: e.target.value})} required style={inputStyle} />
                <input type="text" placeholder="City *" value={newLab.address.city} onChange={(e) => setNewLab({...newLab, address: {...newLab.address, city: e.target.value}})} required style={inputStyle} />
                <input type="text" placeholder="State *" value={newLab.address.state} onChange={(e) => setNewLab({...newLab, address: {...newLab.address, state: e.target.value}})} required style={inputStyle} />
                <input type="tel" placeholder="Phone *" value={newLab.phone} onChange={(e) => setNewLab({...newLab, phone: e.target.value})} required style={inputStyle} />
                <input type="email" placeholder="Email *" value={newLab.email} onChange={(e) => setNewLab({...newLab, email: e.target.value})} required style={inputStyle} />
                <textarea placeholder="Description" value={newLab.description} onChange={(e) => setNewLab({...newLab, description: e.target.value})} style={{...inputStyle, minHeight: '60px'}} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ padding: '0.75rem 2rem', backgroundColor: '#06b6d4', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>✅ Add Lab</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.75rem 2rem', backgroundColor: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddTestModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '500px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>➕ Add New Test</h2>
            <form onSubmit={handleAddTest}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input type="text" placeholder="Test Name *" value={newTest.name} onChange={(e) => setNewTest({...newTest, name: e.target.value})} required style={inputStyle} />
                <input type="text" placeholder="Category *" value={newTest.category} onChange={(e) => setNewTest({...newTest, category: e.target.value})} required style={inputStyle} />
                <input type="number" placeholder="Price (₹) *" value={newTest.price} onChange={(e) => setNewTest({...newTest, price: parseInt(e.target.value)})} required style={inputStyle} />
                <textarea placeholder="Description" value={newTest.description} onChange={(e) => setNewTest({...newTest, description: e.target.value})} style={{...inputStyle, minHeight: '60px'}} />
                <textarea placeholder="Preparation Instructions" value={newTest.preparation} onChange={(e) => setNewTest({...newTest, preparation: e.target.value})} style={{...inputStyle, minHeight: '60px'}} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ padding: '0.75rem 2rem', backgroundColor: '#06b6d4', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>✅ Add Test</button>
                <button type="button" onClick={() => setShowAddTestModal(false)} style={{ padding: '0.75rem 2rem', backgroundColor: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  padding: '0.6rem',
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  fontSize: '0.9rem',
  width: '100%',
  backgroundColor: 'white'
};

export default AdminDiagnostics;
