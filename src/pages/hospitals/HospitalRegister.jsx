import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const HospitalRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', city: '', state: '', type: 'multi_specialty'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      return setError('Name, email, phone and password are required');
    }
    setLoading(true);
    try {
      const res = await api.post('/hospitals/provider/register', form);
      if (res.data.success) {
        alert('Registered! Redirecting to login...');
        navigate('/hospital/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '36px', maxWidth: '480px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px' }}>🏥</div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '8px 0' }}>Register Hospital</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>Fill details later from dashboard</p>
        </div>
        {error && <div style={{ background: '#fff0f0', color: '#d32f2f', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[
            { label: 'Hospital Name *', name: 'name', type: 'text', placeholder: 'Apollo Hospital' },
            { label: 'Email *', name: 'email', type: 'email', placeholder: 'hospital@email.com' },
            { label: 'Phone *', name: 'phone', type: 'tel', placeholder: '9876543210' },
            { label: 'Password *', name: 'password', type: 'password', placeholder: 'Min 6 characters' },
            { label: 'City', name: 'city', type: 'text', placeholder: 'Mumbai' },
            { label: 'State', name: 'state', type: 'text', placeholder: 'Maharashtra' }
          ].map(f => (
            <div key={f.name} style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px', color: '#333' }}>{f.label}</label>
              <input {...f} value={form[f.name]} onChange={handleChange}
                style={{ width: '100%', padding: '11px 14px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px', color: '#333' }}>Type</label>
            <select name="type" value={form.type} onChange={handleChange}
              style={{ width: '100%', padding: '11px 14px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}>
              <option value="multi_specialty">Multi-Specialty</option>
              <option value="super_specialty">Super-Specialty</option>
              <option value="general">General Hospital</option>
              <option value="clinic">Clinic</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#ccc' : '#1976d2', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Registering...' : 'Register Hospital'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#666' }}>
          Already registered? <Link to="/hospital/login" style={{ color: '#1976d2', fontWeight: '600' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default HospitalRegister;