import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const AmbulanceRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.password) {
      setError('Name, phone, and password are required');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email || `${formData.phone}@ambulance.medhub`,
        phone: `+91${formData.phone}`,
        password: formData.password,
        role: 'ambulance_provider'
      });
      if (res.data?.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/ambulance/login'), 2000);
      } else {
        setError(res.data?.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <button onClick={() => navigate('/ambulance')} style={backBtnStyle}>← Back</button>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '40px', display: 'block' }}>🚑</span>
          <h2 style={{ margin: '8px 0 0', fontSize: '20px', fontWeight: 800, color: '#1a1a1a' }}>Register Ambulance</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>Quick registration</p>
        </div>
        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Provider Name *</label>
          <input placeholder="Company or provider name" value={formData.name} onChange={e => handleChange('name', e.target.value)} style={inputStyle} required />
          <label style={labelStyle}>Email Address (optional)</label>
          <input placeholder="Email for password recovery" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} style={inputStyle} />
          <label style={labelStyle}>Mobile Number *</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <span style={countryCodeStyle}>+91</span>
            <input placeholder="10-digit mobile number" value={formData.phone} onChange={e => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} required />
          </div>
          <label style={labelStyle}>Password *</label>
          <input placeholder="Min 6 characters" type="password" value={formData.password} onChange={e => handleChange('password', e.target.value)} style={inputStyle} required />
          <label style={labelStyle}>Confirm Password *</label>
          <input placeholder="Re-enter password" type="password" value={formData.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} style={inputStyle} required />
          <button type="submit" disabled={loading} style={submitBtnStyle}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#888' }}>
          Already registered? <Link to="/ambulance/login" style={{ color: '#e53935', fontWeight: 600, textDecoration: 'none' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

const pageStyle = { minHeight: '100vh', background: 'linear-gradient(135deg, #e53935, #c62828)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' };
const cardStyle = { width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '20px', padding: '25px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' };
const backBtnStyle = { fontSize: '16px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', marginBottom: '10px', color: '#333' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '13px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' };
const countryCodeStyle = { padding: '13px 10px', background: '#f5f5f5', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#555' };
const submitBtnStyle = { width: '100%', padding: '14px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginTop: '8px' };
const errorStyle = { background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px', textAlign: 'center' };
const successStyle = { background: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px', textAlign: 'center' };

export default AmbulanceRegister;

