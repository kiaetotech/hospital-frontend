import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminAmbulance = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [ambulances, setAmbulances] = useState([]);
  const [pendingAmbulances, setPendingAmbulances] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAmbulance, setNewAmbulance] = useState({
    vehicleNumber: '',
    type: 'basic',
    capacity: 1,
    equipment: [],
    baseFare: 0,
    perKmRate: 0,
    location: { lat: 0, lng: 0, address: '' },
    isAvailable: true,
    isVerified: false
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
        const res = await api.get('/ambulance/admin/stats');
        setStats(res.data?.data || {});
      } else if (tab === 'ambulances') {
        const pendingRes = await api.get('/ambulance/admin/pending');
        setPendingAmbulances(pendingRes.data?.data || []);
        const allRes = await api.get('/ambulance');
        setAmbulances(allRes.data?.data || []);
      } else if (tab === 'drivers') {
        const res = await api.get('/ambulance/admin/drivers');
        setDrivers(res.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      if (tab === 'dashboard') {
        setStats({ totalAmbulances: 3, pendingVerifications: 1, totalDrivers: 4, totalBookings: 20, totalRevenue: 35000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyAmbulance = async (id, status) => {
    try {
      await api.put(`/ambulance/admin/verify/${id}`, { status });
      alert(`Ambulance ${status}!`);
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const toggleAvailability = async (id, isAvailable) => {
    try {
      await api.put(`/ambulance/${id}`, { isAvailable: !isAvailable });
      alert(`Ambulance ${!isAvailable ? 'Available' : 'Unavailable'}!`);
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const deleteAmbulance = async (id) => {
    if (window.confirm('Are you sure you want to delete this ambulance?')) {
      try {
        await api.delete(`/ambulance/${id}`);
        alert('Ambulance deleted!');
        loadData();
      } catch (error) {
        alert('Failed: ' + error.message);
      }
    }
  };

  const handleAddAmbulance = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ambulance', newAmbulance);
      alert('Ambulance added successfully!');
      setShowAddModal(false);
      setNewAmbulance({
        vehicleNumber: '', type: 'basic', capacity: 1, equipment: [],
        baseFare: 0, perKmRate: 0, location: { lat: 0, lng: 0, address: '' },
        isAvailable: true, isVerified: false
      });
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

  return (
    <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🚑 Ambulance Admin Panel</h1>
        <p style={{ opacity: 0.9 }}>Manage ambulances, drivers, and bookings</p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        backgroundColor: 'white',
        padding: '0.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'ambulances', label: '🚑 Ambulances' },
          { id: 'drivers', label: '👨‍✈️ Drivers' },
          { id: 'reports', label: '📈 Reports' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: tab === t.id ? '#f59e0b' : 'transparent',
              color: tab === t.id ? 'white' : '#1e293b',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem' }}>🔄</div>
          <p>Loading...</p>
        </div>
      )}

      {/* DASHBOARD */}
      {tab === 'dashboard' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.3rem' }}>📊 Platform Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Ambulances', value: stats.totalAmbulances || 0, color: '#f59e0b', icon: '🚑' },
              { label: 'Pending Verifications', value: stats.pendingVerifications || 0, color: '#ef4444', icon: '⏳' },
              { label: 'Total Drivers', value: stats.totalDrivers || 0, color: '#10b981', icon: '👨‍✈️' },
              { label: 'Total Bookings', value: stats.totalBookings || 0, color: '#8b5cf6', icon: '📋' },
              { label: 'Revenue', value: `₹${((stats.totalRevenue || 0)).toLocaleString()}`, color: '#2563eb', icon: '💰' },
            ].map((stat, i) => (
              <div key={i} style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderTop: `4px solid ${stat.color}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{stat.label}</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>
          <button onClick={loadData} style={{ padding: '0.75rem 2rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>🔄 Refresh</button>
        </div>
      )}

      {/* AMBULANCES */}
      {tab === 'ambulances' && !loading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem' }}>🚑 Ambulances ({ambulances.length})</h2>
            <button onClick={() => setShowAddModal(true)} style={{ padding: '0.6rem 1.5rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>➕ Add Ambulance</button>
          </div>

          {pendingAmbulances.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#f59e0b' }}>⏳ Pending Verification ({pendingAmbulances.length})</h3>
              {pendingAmbulances.map(a => (
                <div key={a._id} style={{ backgroundColor: '#fffbeb', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem', border: '1px solid #fcd34d', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 'bold' }}>🚑 {a.vehicleNumber}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{a.type} | Capacity: {a.capacity}</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>📍 {a.location?.address || 'N/A'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={() => verifyAmbulance(a._id, 'approved')} style={buttonStyles.approve}>✅ Approve</button>
                    <button onClick={() => verifyAmbulance(a._id, 'rejected')} style={buttonStyles.reject}>❌ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {ambulances.filter(a => a.isVerified !== false).map(a => (
            <div key={a._id} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ fontWeight: 'bold' }}>🚑 {a.vehicleNumber}</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{a.type} | Capacity: {a.capacity} | 💰 ₹{a.baseFare} + ₹{a.perKmRate}/km</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>📍 {a.location?.address || 'N/A'}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', backgroundColor: a.isAvailable ? '#dcfce7' : '#fee2e2', color: a.isAvailable ? '#166534' : '#dc2626' }}>
                  {a.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                </span>
                <button onClick={() => toggleAvailability(a._id, a.isAvailable)} style={buttonStyles.toggle}>
                  {a.isAvailable ? '⏸️ Unavailable' : '▶️ Available'}
                </button>
                <button onClick={() => deleteAmbulance(a._id)} style={buttonStyles.delete}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DRIVERS */}
      {tab === 'drivers' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem', marginBottom: '1.5rem' }}>👨‍✈️ Drivers ({drivers.length})</h2>
          {drivers.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No drivers registered</p>
          ) : (
            drivers.map(d => (
              <div key={d._id} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ fontWeight: 'bold' }}>👨‍✈️ {d.name}</h4>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>📞 {d.phone} | 📋 {d.licenseNumber}</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>🚑 {d.ambulance?.vehicleNumber || 'N/A'}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', backgroundColor: d.isActive ? '#dcfce7' : '#fee2e2', color: d.isActive ? '#166534' : '#dc2626' }}>
                    {d.isActive ? '🟢 Active' : '🔴 Inactive'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* REPORTS */}
      {tab === 'reports' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem', marginBottom: '1rem' }}>📈 Ambulance Reports</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '1rem' }}>
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

      {/* ADD MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '500px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>➕ Add New Ambulance</h2>
            <form onSubmit={handleAddAmbulance}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input type="text" placeholder="Vehicle Number *" value={newAmbulance.vehicleNumber} onChange={(e) => setNewAmbulance({...newAmbulance, vehicleNumber: e.target.value})} required style={inputStyle} />
                <select value={newAmbulance.type} onChange={(e) => setNewAmbulance({...newAmbulance, type: e.target.value})} style={inputStyle}>
                  <option value="basic">Basic</option>
                  <option value="icu">ICU</option>
                  <option value="oxygen">Oxygen</option>
                  <option value="advanced">Advanced Life Support</option>
                </select>
                <input type="number" placeholder="Capacity" value={newAmbulance.capacity} onChange={(e) => setNewAmbulance({...newAmbulance, capacity: parseInt(e.target.value)})} style={inputStyle} />
                <input type="number" placeholder="Base Fare *" value={newAmbulance.baseFare} onChange={(e) => setNewAmbulance({...newAmbulance, baseFare: parseInt(e.target.value)})} required style={inputStyle} />
                <input type="number" placeholder="Per KM Rate *" value={newAmbulance.perKmRate} onChange={(e) => setNewAmbulance({...newAmbulance, perKmRate: parseInt(e.target.value)})} required style={inputStyle} />
                <input type="text" placeholder="Location Address" value={newAmbulance.location.address} onChange={(e) => setNewAmbulance({...newAmbulance, location: {...newAmbulance.location, address: e.target.value}})} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ padding: '0.75rem 2rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>✅ Add Ambulance</button>
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

export default AdminAmbulance;