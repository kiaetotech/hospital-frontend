import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminHospitals = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // State variables
  const [hospitals, setHospitals] = useState([]);
  const [pendingHospitals, setPendingHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  
  // New Hospital Form
  const [newHospital, setNewHospital] = useState({
    name: '',
    address: { line1: '', city: '', state: '', pincode: '' },
    phone: '',
    email: '',
    description: '',
    facilities: [],
    rating: 0,
    bedCount: 0,
    emergencyServices: false,
    ambulanceAvailable: false,
    opdTimings: { start: '09:00', end: '17:00' },
    isActive: true,
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
        const res = await api.get('/hospitals/admin/stats');
        setStats(res.data?.data || {});
      } else if (tab === 'hospitals') {
        const pendingRes = await api.get('/hospitals/admin/pending');
        setPendingHospitals(pendingRes.data?.data || []);
        const allRes = await api.get('/hospitals');
        setHospitals(allRes.data?.data || []);
      } else if (tab === 'doctors') {
        const pendingRes = await api.get('/hospitals/admin/pending-doctors');
        setPendingDoctors(pendingRes.data?.data || []);
        const allRes = await api.get('/hospitals/doctors');
        setDoctors(allRes.data?.data || []);
      } else if (tab === 'slots') {
        const res = await api.get('/hospitals/admin/slots');
        setSlots(res.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // Set fallback data for demo
      if (tab === 'dashboard') {
        setStats({ totalHospitals: 5, pendingVerifications: 2, totalDoctors: 15, totalBookings: 45, totalRevenue: 75000 });
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HOSPITAL CRUD OPERATIONS
  // ============================================

  const verifyHospital = async (id, status) => {
    try {
      await api.put(`/hospitals/admin/verify/${id}`, { status });
      alert(`Hospital ${status}!`);
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const toggleHospitalStatus = async (id, isActive) => {
    try {
      await api.put(`/hospitals/${id}`, { isActive: !isActive });
      alert(`Hospital ${!isActive ? 'Activated' : 'Suspended'}!`);
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const deleteHospital = async (id) => {
    if (window.confirm('Are you sure you want to delete this hospital?')) {
      try {
        await api.delete(`/hospitals/${id}`);
        alert('Hospital deleted!');
        loadData();
      } catch (error) {
        alert('Failed: ' + error.message);
      }
    }
  };

  // ============================================
  // DOCTOR CRUD OPERATIONS
  // ============================================

  const verifyDoctor = async (id, status) => {
    try {
      await api.put(`/hospitals/admin/verify-doctor/${id}`, { status });
      alert(`Doctor ${status}!`);
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const deleteDoctor = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await api.delete(`/hospitals/doctors/${id}`);
        alert('Doctor deleted!');
        loadData();
      } catch (error) {
        alert('Failed: ' + error.message);
      }
    }
  };

  // ============================================
  // ADD/EDIT HOSPITAL
  // ============================================

  const handleAddHospital = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hospitals', newHospital);
      alert('Hospital added successfully!');
      setShowAddModal(false);
      setNewHospital({
        name: '', address: { line1: '', city: '', state: '', pincode: '' },
        phone: '', email: '', description: '', facilities: [], rating: 0,
        bedCount: 0, emergencyServices: false, ambulanceAvailable: false,
        opdTimings: { start: '09:00', end: '17:00' },
        isActive: true, isVerified: false
      });
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const buttonStyles = {
    approve: { padding: '0.4rem 1rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
    reject: { padding: '0.4rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
    toggle: { padding: '0.4rem 1rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
    delete: { padding: '0.4rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' },
    edit: { padding: '0.4rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🏥 Hospitals Admin Panel</h1>
        <p style={{ opacity: 0.9 }}>Manage hospitals, doctors, slots, and reports</p>
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
          { id: 'hospitals', label: '🏥 Hospitals' },
          { id: 'doctors', label: '👨‍⚕️ Doctors' },
          { id: 'slots', label: '⏰ Slots' },
          { id: 'reports', label: '📈 Reports' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: tab === t.id ? '#2563eb' : 'transparent',
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

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem' }}>🔄</div>
          <p>Loading...</p>
        </div>
      )}

      {/* ============================================ */}
      {/* DASHBOARD TAB */}
      {/* ============================================ */}
      {tab === 'dashboard' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.3rem' }}>
            📊 Platform Statistics
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Hospitals', value: stats.totalHospitals || 0, color: '#2563eb', icon: '🏥' },
              { label: 'Pending Verifications', value: stats.pendingVerifications || 0, color: '#f59e0b', icon: '⏳' },
              { label: 'Total Doctors', value: stats.totalDoctors || 0, color: '#10b981', icon: '👨‍⚕️' },
              { label: 'Total Bookings', value: stats.totalBookings || 0, color: '#8b5cf6', icon: '📋' },
              { label: 'Revenue', value: `₹${((stats.totalRevenue || 0)).toLocaleString()}`, color: '#ef4444', icon: '💰' },
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

          <button onClick={loadData} style={{
            padding: '0.75rem 2rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            🔄 Refresh Statistics
          </button>
        </div>
      )}

      {/* ============================================ */}
      {/* HOSPITALS TAB */}
      {/* ============================================ */}
      {tab === 'hospitals' && !loading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem' }}>
              🏥 Hospitals ({hospitals.length})
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '0.6rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ➕ Add Hospital
            </button>
          </div>

          {/* Pending Hospitals */}
          {pendingHospitals.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>⏳ Pending Verification ({pendingHospitals.length})</h3>
              {pendingHospitals.map(h => (
                <div key={h._id} style={{
                  backgroundColor: '#fffbeb',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '0.5rem',
                  border: '1px solid #fcd34d',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div>
                    <h4 style={{ fontWeight: 'bold' }}>{h.name}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>📍 {h.address?.city}, {h.address?.state}</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>📞 {h.phone} | ✉️ {h.email}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={() => verifyHospital(h._id, 'approved')} style={buttonStyles.approve}>✅ Approve</button>
                    <button onClick={() => verifyHospital(h._id, 'rejected')} style={buttonStyles.reject}>❌ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active Hospitals List */}
          {hospitals.filter(h => h.isVerified !== false).map(h => (
            <div key={h._id} style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '0.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div>
                <h4 style={{ fontWeight: 'bold' }}>{h.name}</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>📍 {h.address?.city} | ⭐ {h.rating || 'N/A'} | 🛏️ {h.bedCount || 0} beds</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>📞 {h.phone} | ✉️ {h.email}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  backgroundColor: h.isActive !== false ? '#dcfce7' : '#fee2e2',
                  color: h.isActive !== false ? '#166534' : '#dc2626'
                }}>
                  {h.isActive !== false ? '🟢 Active' : '🔴 Inactive'}
                </span>
                <button onClick={() => toggleHospitalStatus(h._id, h.isActive)} style={buttonStyles.toggle}>
                  {h.isActive !== false ? '⏸️ Suspend' : '▶️ Activate'}
                </button>
                <button onClick={() => deleteHospital(h._id)} style={buttonStyles.delete}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================ */}
      {/* DOCTORS TAB */}
      {/* ============================================ */}
      {tab === 'doctors' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem', marginBottom: '1.5rem' }}>
            👨‍⚕️ Doctors ({doctors.length})
          </h2>

          {pendingDoctors.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>⏳ Pending Verification ({pendingDoctors.length})</h3>
              {pendingDoctors.map(d => (
                <div key={d._id} style={{
                  backgroundColor: '#fffbeb',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '0.5rem',
                  border: '1px solid #fcd34d',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div>
                    <h4 style={{ fontWeight: 'bold' }}>{d.name}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{d.specialization} | 📞 {d.phone}</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>🏥 {d.hospital?.name || 'N/A'} | Fee: ₹{d.consultationFee || 0}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={() => verifyDoctor(d._id, 'approved')} style={buttonStyles.approve}>✅ Approve</button>
                    <button onClick={() => verifyDoctor(d._id, 'rejected')} style={buttonStyles.reject}>❌ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {doctors.filter(d => d.isVerified !== false).map(d => (
            <div key={d._id} style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '0.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div>
                <h4 style={{ fontWeight: 'bold' }}>{d.name}</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{d.specialization} | 📞 {d.phone}</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>🏥 {d.hospital?.name} | Fee: ₹{d.consultationFee || 0}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button onClick={() => deleteDoctor(d._id)} style={buttonStyles.delete}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================ */}
      {/* SLOTS TAB */}
      {/* ============================================ */}
      {tab === 'slots' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem', marginBottom: '1.5rem' }}>
            ⏰ Available Slots
          </h2>
          {slots.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No slots available</p>
          ) : (
            slots.map(s => (
              <div key={s._id} style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '0.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <p><strong>🏥 {s.hospital?.name}</strong> | 👨‍⚕️ {s.doctor?.name}</p>
                <p>📅 {s.day} | ⏰ {s.startTime} - {s.endTime}</p>
                <p>📋 {s.bookedCount || 0}/{s.totalSlots || 10} booked</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* REPORTS TAB */}
      {/* ============================================ */}
      {tab === 'reports' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem', marginBottom: '1rem' }}>
            📈 Hospital Reports
          </h2>
          
          {/* Daily Report */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📅 Daily Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Total Bookings', value: stats.totalBookings || 0 },
                { label: 'Confirmed', value: stats.confirmedBookings || 0 },
                { label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}` },
                { label: 'Commission', value: `₹${(stats.commission || 0).toLocaleString()}` },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{item.label}</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Report */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📆 Monthly Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Total Revenue', value: `₹${(stats.monthlyRevenue || 0).toLocaleString()}` },
                { label: 'Platform Commission', value: `₹${(stats.monthlyCommission || 0).toLocaleString()}` },
                { label: 'Total Bookings', value: stats.monthlyBookings || 0 },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{item.label}</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* ADD HOSPITAL MODAL */}
      {/* ============================================ */}
      {showAddModal && (
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
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>➕ Add New Hospital</h2>
            <form onSubmit={handleAddHospital}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Hospital Name *"
                  value={newHospital.name}
                  onChange={(e) => setNewHospital({...newHospital, name: e.target.value})}
                  required
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Address Line 1 *"
                  value={newHospital.address.line1}
                  onChange={(e) => setNewHospital({...newHospital, address: {...newHospital.address, line1: e.target.value}})}
                  required
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="City *"
                  value={newHospital.address.city}
                  onChange={(e) => setNewHospital({...newHospital, address: {...newHospital.address, city: e.target.value}})}
                  required
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="State *"
                  value={newHospital.address.state}
                  onChange={(e) => setNewHospital({...newHospital, address: {...newHospital.address, state: e.target.value}})}
                  required
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Pincode *"
                  value={newHospital.address.pincode}
                  onChange={(e) => setNewHospital({...newHospital, address: {...newHospital.address, pincode: e.target.value}})}
                  required
                  style={inputStyle}
                />
                <input
                  type="tel"
                  placeholder="Phone *"
                  value={newHospital.phone}
                  onChange={(e) => setNewHospital({...newHospital, phone: e.target.value})}
                  required
                  style={inputStyle}
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={newHospital.email}
                  onChange={(e) => setNewHospital({...newHospital, email: e.target.value})}
                  required
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="Total Beds"
                  value={newHospital.bedCount}
                  onChange={(e) => setNewHospital({...newHospital, bedCount: parseInt(e.target.value)})}
                  style={inputStyle}
                />
                <textarea
                  placeholder="Description"
                  value={newHospital.description}
                  onChange={(e) => setNewHospital({...newHospital, description: e.target.value})}
                  style={{...inputStyle, minHeight: '60px'}}
                />
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={newHospital.emergencyServices}
                      onChange={(e) => setNewHospital({...newHospital, emergencyServices: e.target.checked})}
                    />
                    Emergency Services
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={newHospital.ambulanceAvailable}
                      onChange={(e) => setNewHospital({...newHospital, ambulanceAvailable: e.target.checked})}
                    />
                    Ambulance Available
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  flex: 1
                }}>
                  ✅ Add Hospital
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#e2e8f0',
                    color: '#1e293b',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
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

export default AdminHospitals;

