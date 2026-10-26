import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = ({
  userType = 'patient',
  loginPath = '/login',
  resetPath = '/reset-password',
  title = 'Forgot Password?',
  subtitle = 'Enter your phone or email to receive a reset OTP',
  icon = '🔐',
  themeColor = '#e53935',
}) => {
  const navigate = useNavigate();
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const isEmail = contact.includes('@');
      const body = {
        ...(isEmail
          ? { email: contact.trim().toLowerCase() }
          : { phone: contact.trim() }),
        userType,
      };

      const res = await api.post('/auth/forgot-password', body);

      if (res.data.success) {
        setMessage(res.data.message || 'If an account exists, an OTP has been sent.');
        sessionStorage.setItem('resetContact', contact);
        sessionStorage.setItem('resetUserType', userType);
        sessionStorage.setItem('resetLoginPath', loginPath);
        setTimeout(() => navigate(resetPath), 1800);
      } else {
        setError(res.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...s.page, background: `linear-gradient(135deg, ${themeColor}, #b71c1c)` }}>
      <div style={s.card}>
        <button onClick={() => navigate(loginPath)} style={s.back}>← Back to Login</button>
        <div style={s.logo}>
          <span style={{ fontSize: '3rem' }}>{icon}</span>
          <h2 style={s.h2}>{title}</h2>
          <p style={s.subtitle}>{subtitle}</p>
        </div>

        {error && <div style={s.error}>{error}</div>}
        {message && <div style={s.success}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={s.label}>Phone or Email</label>
            <input
              type="text"
              placeholder="e.g. 9876543210 or user@example.com"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              style={s.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !contact.trim()}
            style={{ ...s.btn, background: themeColor }}
          >
            {loading ? 'Sending...' : 'Send Reset OTP'}
          </button>
        </form>

        <p style={s.footer}>
          Remember your password?{' '}
          <Link to={loginPath} style={{ ...s.link, color: themeColor }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' },
  card: { width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '20px', padding: '25px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  back: { fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', marginBottom: '10px', color: '#333' },
  logo: { textAlign: 'center', marginBottom: '20px' },
  h2: { margin: '10px 0 4px', fontSize: '1.4rem', color: '#1e293b' },
  subtitle: { margin: 0, fontSize: '0.85rem', color: '#64748b' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' },
  input: { width: '100%', padding: '13px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '14px', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' },
  error: { background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px', textAlign: 'center' },
  success: { background: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px', textAlign: 'center' },
  footer: { textAlign: 'center', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #eee', fontSize: '13px', color: '#888' },
  link: { fontWeight: 700, textDecoration: 'none' }
};

export default ForgotPassword;