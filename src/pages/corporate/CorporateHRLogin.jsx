import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CorporateHRLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/corporate/hr/login', formData);
      if (res.data.success) {
        localStorage.setItem('corporateToken', res.data.data.token);
        localStorage.setItem('corporateId', res.data.data.id);
        navigate('/corporate/hr/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '2.5rem', maxWidth: '420px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏢</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>HR Login</h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Manage your corporate health benefits</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#4b5563' }}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="hr@yourcompany.com"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#4b5563' }}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              style={inputStyle}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Don't have an account?{' '}
          <span onClick={() => navigate('/corporate/enroll')} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>
            Enroll Your Company
          </span>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #e5e7eb',
  borderRadius: '0.5rem',
  fontSize: '1rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  backgroundColor: 'white'
};

export default CorporateHRLogin;