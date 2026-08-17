import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PatientProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    city: '', line1: '', state: '', pincode: '',
    lat: '', lng: ''
  });

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    api.get('/auth/patient/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const d = res.data?.data || {};
        setForm({
          name: d.name || '',
          email: d.email || '',
          phone: d.phone || '',
          city: d.patientAddress?.city || '',
          line1: d.patientAddress?.line1 || '',
          state: d.patientAddress?.state || '',
          pincode: d.patientAddress?.pincode || '',
          lat: d.patientLocation?.lat || '',
          lng: d.patientLocation?.lng || ''
        });
      })
      .catch(() => {});
  }, [token, navigate]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/auth/patient/profile', {
        name: form.name,
        phone: form.phone,
        patientAddress: {
          city: form.city,
          line1: form.line1,
          state: form.state,
          pincode: form.pincode
        },
        patientLocation: {
          lat: Number(form.lat) || undefined,
          lng: Number(form.lng) || undefined
        }
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Profile updated!');
      navigate('/ambulance');
    } catch (e) {
      alert('Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f2f4f7', padding: 20, fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <button onClick={() => navigate('/ambulance')} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>← Back</button>
        <h1 style={{ fontSize: 22, margin: '10px 0' }}>👤 My Profile</h1>
        <div style={{ background: '#fff', borderRadius: 14, padding: 20 }}>
          <label style={label}>Name</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inp} />
          <label style={label}>Email</label>
          <input value={form.email} disabled style={{...inp, background: '#f5f5f5'}} />
          <label style={label}>Phone</label>
          <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={inp} />
          <label style={label}>Address</label>
          <input value={form.line1} onChange={e => setForm({...form, line1: e.target.value})} placeholder="House, street" style={inp} />
          <label style={label}>City</label>
          <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} style={inp} />
          <label style={label}>State</label>
          <input value={form.state} onChange={e => setForm({...form, state: e.target.value})} style={inp} />
          <label style={label}>Pincode</label>
          <input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} style={inp} />
          <label style={label}>Latitude (optional)</label>
          <input value={form.lat} onChange={e => setForm({...form, lat: e.target.value})} style={inp} />
          <label style={label}>Longitude (optional)</label>
          <input value={form.lng} onChange={e => setForm({...form, lng: e.target.value})} style={inp} />
          <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: 14, background: '#e53935', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 10 }}>
            {loading ? 'Saving...' : '💾 Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

const label = { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, marginTop: 10 };
const inp = { width: '100%', padding: 11, border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' };

export default PatientProfile;