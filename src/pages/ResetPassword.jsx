import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = ({
  userType: userTypeProp,
  loginPath: loginPathProp,
  forgotPath: forgotPathProp,
  themeColor = '#e53935',
}) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('otp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const storedContact = sessionStorage.getItem('resetContact') || '';
  const storedUserType = sessionStorage.getItem('resetUserType') || '';
  const storedLoginPath = sessionStorage.getItem('resetLoginPath') || '';

  const userType = storedUserType || userTypeProp || 'patient';
  const loginPath = storedLoginPath || loginPathProp || '/login';
  const forgotPath = forgotPathProp || '/forgot-password';

  useEffect(() => {
    if (!storedContact) {
      navigate(forgotPath);
    }
  }, [storedContact, navigate, forgotPath]);

  const getContactBody = () => {
    const isEmail = storedContact.includes('@');
    return isEmail
      ? { email: storedContact.toLowerCase().trim() }
      : { phone: storedContact.trim() };
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = {
        ...getContactBody(),
        otp: otp.trim(),
        userType,
      };
      const res = await api.post('/auth/verify-reset-otp', body);
      if (res.data.success) {
        setResetToken(res.data.resetToken);
        setStep('password');
        setMessage('OTP verified. Please set your new password.');
      } else {
        setError(res.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { resetToken, newPassword });
      if (res.data.success) {
        setStep('done');
        sessionStorage.removeItem('resetContact');
        sessionStorage.removeItem('resetUserType');
        sessionStorage.removeItem('resetLoginPath');
        setTimeout(() => navigate(loginPath), 2500);
      } else {
        setError(res.data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...s.page, background: `linear-gradient(135deg, ${themeColor}, #b71c1c)` }}>
      <div style={s.card}>
        <button onClick={() => navigate(loginPath)} style={s.back}>← Back to Login</button>

        <div style={s.logo}>
          <span style={{ fontSize: '3rem' }}>{step === 'done' ? '✅' : '🔐'}</span>
          <h2 style={s.h2}>
            {step === 'otp' && 'Verify OTP'}
            {step === 'password' && 'Set New Password'}
            {step === 'done' && 'Password Reset'}
          </h2>
          <p style={s.subtitle}>
            {step === 'otp' && 'Enter the 6-digit OTP sent to your phone/email'}
            {step === 'password' && 'Enter your new password below'}
            {step === 'done' && 'Redirecting to login...'}
          </p>
        </div>

        {error && <div style={s.error}>{error}</div>}
        {message && step !== 'done' && <div style={s.success}>{message}</div>}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: '16px' }}>
              <label style={s.label}>Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                style={{ ...s.input, letterSpacing: '8px', textAlign: 'center', fontSize: '22px' }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              style={{ ...s.btn, background: themeColor }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '14px' }}>
              <label style={s.label}>New Password</label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={s.input}
                required
              />
              <p style={s.hint}>Must contain uppercase, lowercase, and a number</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={s.label}>Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={s.input}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ ...s.btn, background: themeColor }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ color: '#2e7d32', fontWeight: 600, fontSize: '1rem' }}>
              Password reset successful!
            </p>
            <Link to={loginPath} style={{ color: themeColor, fontWeight: 700 }}>
              Go to Login →
            </Link>
          </div>
        )}
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
  hint: { fontSize: '12px', color: '#94a3b8', marginTop: '4px' }
};

export default ResetPassword;