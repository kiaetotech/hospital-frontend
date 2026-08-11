import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminCaregivers = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [caregivers, setCaregivers] = useState([]);
  const [pendingCaregivers, setPendingCaregivers] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCaregiver, setNewCaregiver] = useState({
    name: '', age: '', gender: 'male', phone: '', email: '', address: '',
    specialization: 'elder_care', experience: 0, certifications: [],
    hourlyRate: 0, dailyRate: 0, isAvailable: true, isVerified: false
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
        const res = await api.get('/caregivers/admin/stats');
        setStats(res.data?.data || {});
      } else if (tab === 'caregivers') {
        const pendingRes = await api.get('/caregivers/admin/pending');
        setPendingCaregivers(pendingRes.data?.data || []);
        const allRes = await api.get('/caregivers');
        setCaregivers(allRes.data?.data || []);
      } else if (tab === 'services') {
        const res = await api.get('/caregivers/admin/services');
        setServices(res.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      if (tab === 'dashboard') {
        setStats({ totalCaregivers: 4, pendingVerifications: 1, totalServices: 3, totalBookings: 15, totalRevenue: 20000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyCaregiver = async (id, status) => {
    try {
      await api.put(`/caregivers/admin/verify/${id}`, { status });
      alert(`Caregiver ${status}!`);
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const toggleAvailability = async (id, isAvailable) => {
    try {
      await api.put(`/caregivers/${id}`, { isAvailable: !isAvailable });
      alert(`Caregiver ${!isAvailable ? 'Available' : 'Unavailable'}!`);
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const deleteCaregiver = async (id) => {
    if (window.confirm('Are you sure you want to delete this caregiver?')) {
      try {
        await api.delete(`/caregivers/${id}`);
        alert('Caregiver deleted!');
        loadData();
      } catch (error) {
        alert('Failed: ' + error.message);
      }
    }
  };

  const handleAddCaregiver = async (e) => {
    e.preventDefault();
    try {
      await api.post('/caregivers', newCaregiver);
      alert('Caregiver added successfully!');
      setShowAddModal(false);
      setNewCaregiver({ name: '', age: '', gender: 'male', phone: '', email: '', address: '', specialization: 'elder_care', experience: 0, certifications: [], hourlyRate: 0, dailyRate: 0, isAvailable: true, isVerified: false });
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const buttonStyles = {
    approve: { padding: '0.4rem 1rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
    reject: { padding: '0.4rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
    toggle: { padding: '0.4rem 1rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
    delete: { padding: '0.4rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }
  };

  const specializationLabels = {
    elder_care: 'Elder Care',
    child_care: 'Child Care',
    patient_care: 'Patient Care',
    disability_care: 'Disability Care',
    post_surgery: 'Post-Surgery Care'
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', borderRadius: '1rem', padding: '2rem', color: 'white', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🏠 Caregivers Admin Panel</h1>
        <p style={{ opacity: 0.9 }}>Manage caregivers, services, and bookings</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'caregivers', label: '🏠 Caregivers' },
          { id: 'services', label: '📋 Services' },
          { id: 'reports', label: '📈 Reports' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '0.75rem 1.25rem', backgroundColor: tab === t.id ? '#8b5cf6' : 'transparent', color: tab === t.id ? 'white' : '#1e293b', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>{t.label}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '3rem' }}><div style={{ fontSize: '2rem' }}>🔄</div><p>Loading...</p></div>}

      {tab === 'dashboard' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.3rem' }}>📊 Platform Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Caregivers', value: stats.totalCaregivers || 0, color: '#8b5cf6', icon: '🏠' },
              { label: 'Pending Verifications', value: stats.pendingVerifications || 0, color: '#ef4444', icon: '⏳' },
              { label: 'Total Services', value: stats.totalServices || 0, color: '#10b981', icon: '📋' },
              { label: 'Total Bookings', value: stats.totalBookings || 0, color: '#f59e0b', icon: '📅' },
              { label: 'Revenue', value: `₹${((stats.totalRevenue || 0)).toLocaleString()}`, color: '#2563eb', icon: '💰' },
            ].map((stat, i) => (
              <div key={i} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: `4px solid ${stat.color}`, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{stat.label}</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>
          <button onClick={loadData} style={{ padding: '0.75rem 2rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>🔄 Refresh</button>
        </div>
      )}

      {tab === 'caregivers' && !loading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem' }}>🏠 Caregivers ({caregivers.length})</h2>
            <button onClick={() => setShowAddModal(true)} style={{ padding: '0.6rem 1.5rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>➕ Add Caregiver</button>
          </div>

          {pendingCaregivers.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#f59e0b' }}>⏳ Pending Verification ({pendingCaregivers.length})</h3>
              {pendingCaregivers.map(c => (
                <div key={c._id} style={{ backgroundColor: '#fffbeb', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem', border: '1px solid #fcd34d', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 'bold' }}>{c.name}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{specializationLabels[c.specialization] || c.specialization} | 📞 {c.phone}</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>💰 ₹{c.hourlyRate}/hr | ₹{c.dailyRate}/day</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={() => verifyCaregiver(c._id, 'approved')} style={buttonStyles.approve}>✅ Approve</button>
                    <button onClick={() => verifyCaregiver(c._id, 'rejected')} style={buttonStyles.reject}>❌ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {caregivers.filter(c => c.isVerified !== false).map(c => (
            <div key={c._id} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ fontWeight: 'bold' }}>{c.name}</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{specializationLabels[c.specialization] || c.specialization} | 📞 {c.phone}</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>💰 ₹{c.hourlyRate}/hr | ₹{c.dailyRate}/day | ⭐ {c.rating || 'N/A'}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', backgroundColor: c.isAvailable ? '#dcfce7' : '#fee2e2', color: c.isAvailable ? '#166534' : '#dc2626' }}>
                  {c.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                </span>
                <button onClick={() => toggleAvailability(c._id, c.isAvailable)} style={buttonStyles.toggle}>
                  {c.isAvailable ? '⏸️ Unavailable' : '▶️ Available'}
                </button>
                <button onClick={() => deleteCaregiver(c._id)} style={buttonStyles.delete}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'services' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem', marginBottom: '1.5rem' }}>📋 Services</h2>
          {services.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No services configured</p>
          ) : (
            services.map(s => (
              <div key={s._id} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h4 style={{ fontWeight: 'bold' }}>{s.name}</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{s.description}</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>💰 ₹{s.price} | ⏱️ {s.duration} mins</p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'reports' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem', marginBottom: '1rem' }}>📈 Caregiver Reports</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📅 Daily Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Total Bookings', value: stats.totalBookings || 0 },
                { label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}` },
                { label: 'Commission', value: `₹${(stats.commission || 0).toLocaleString()}` },
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
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>➕ Add New Caregiver</h2>
            <form onSubmit={handleAddCaregiver}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input type="text" placeholder="Name *" value={newCaregiver.name} onChange={(e) => setNewCaregiver({...newCaregiver, name: e.target.value})} required style={inputStyle} />
                <input type="number" placeholder="Age *" value={newCaregiver.age} onChange={(e) => setNewCaregiver({...newCaregiver, age: e.target.value})} required style={inputStyle} />
                <select value={newCaregiver.gender} onChange={(e) => setNewCaregiver({...newCaregiver, gender: e.target.value})} style={inputStyle}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <input type="tel" placeholder="Phone *" value={newCaregiver.phone} onChange={(e) => setNewCaregiver({...newCaregiver, phone: e.target.value})} required style={inputStyle} />
                <input type="email" placeholder="Email" value={newCaregiver.email} onChange={(e) => setNewCaregiver({...newCaregiver, email: e.target.value})} style={inputStyle} />
                <input type="text" placeholder="Address" value={newCaregiver.address} onChange={(e) => setNewCaregiver({...newCaregiver, address: e.target.value})} style={inputStyle} />
                <select value={newCaregiver.specialization} onChange={(e) => setNewCaregiver({...newCaregiver, specialization: e.target.value})} style={inputStyle}>
                  <option value="elder_care">Elder Care</option>
                  <option value="child_care">Child Care</option>
                  <option value="patient_care">Patient Care</option>
                  <option value="disability_care">Disability Care</option>
                  <option value="post_surgery">Post-Surgery Care</option>
                </select>
                <input type="number" placeholder="Experience (years) *" value={newCaregiver.experience} onChange={(e) => setNewCaregiver({...newCaregiver, experience: parseInt(e.target.value)})} required style={inputStyle} />
                <input type="number" placeholder="Hourly Rate (₹) *" value={newCaregiver.hourlyRate} onChange={(e) => setNewCaregiver({...newCaregiver, hourlyRate: parseInt(e.target.value)})} required style={inputStyle} />
                <input type="number" placeholder="Daily Rate (₹) *" value={newCaregiver.dailyRate} onChange={(e) => setNewCaregiver({...newCaregiver, dailyRate: parseInt(e.target.value)})} required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ padding: '0.75rem 2rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>✅ Add Caregiver</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.75rem 2rem', backgroundColor: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
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

export default AdminCaregivers;

