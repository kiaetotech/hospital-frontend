import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const WellnessCenterLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.phone || form.phone.length !== 10) {
      setError('Please enter valid 10-digit phone number');
      setLoading(false);
      return;
    }
    if (!form.password) {
      setError('Please enter password');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/ayurveda-centers/login', {
        phone: form.phone,
        password: form.password
      });

      if (res.data?.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('center', JSON.stringify({
          id: res.data.center.id,
          name: res.data.center.name,
          type: res.data.center.type
        }));
        navigate('/ayurveda/center/dashboard');
      } else {
        setError(res.data?.error || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const c = '#E65100';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #E65100, #BF360C)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '20px', padding: '30px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '44px', display: 'block' }}>🏛️</span>
          <h2 style={{ margin: '8px 0 0', fontSize: '22px', fontWeight: 800 }}>Center Login</h2>
          <p style={{ fontSize: '13px', color: '#888' }}>Ayurveda Wellness Center</p>
        </div>

        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '14px' }}>
            <label style={ls}>Phone Number</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={cc}>+91</span>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                style={{ ...is, flex: 1 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={ls}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                style={{ ...is, paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: c, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            Don't have an account?{' '}
            <Link to="/ayurveda/center/register" style={{ color: c, fontWeight: 700, textDecoration: 'none' }}>
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const ls = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' };
const is = { width: '100%', padding: '13px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' };
const cc = { padding: '13px 10px', background: '#f5f5f5', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#555' };

export default WellnessCenterLogin;