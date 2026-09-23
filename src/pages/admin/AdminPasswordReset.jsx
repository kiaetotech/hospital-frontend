import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-e2cf.up.railway.app';

const AdminPasswordReset = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/forgot-password`, { email });
      if (res.data.success) {
        setInfo(res.data.message);
        setStep('otp');
      } else {
        setError(res.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/verify-reset-otp`, { email, otp });
      if (res.data.success) {
        setResetToken(res.data.resetToken);
        setInfo('OTP verified. Please set your new password.');
        setStep('password');
      } else {
        setError(res.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/reset-password`, {
        resetToken, newPassword
      });
      if (res.data.success) {
        setStep('done');
        setTimeout(() => navigate('/admin/login'), 2500);
      } else {
        setError(res.data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '420px', width: '100%', backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🔐</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0.5rem 0 0.25rem' }}>
            {step === 'email' && 'Forgot Password'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'password' && 'Set New Password'}
            {step === 'done' && 'Password Reset'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            {step === 'email' && 'Enter your admin email'}
            {step === 'otp' && 'Enter the 6-digit OTP sent to you'}
            {step === 'password' && 'Choose a strong new password'}
            {step === 'done' && 'Redirecting to login...'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>
        )}
        {info && step !== 'done' && (
          <div style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{info}</div>
        )}

        {step === 'email' && (
          <form onSubmit={handleSendOtp}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Admin Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '1rem' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Enter OTP</label>
            <input type="text" required value={otp} maxLength={6} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="6-digit code" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '1rem', letterSpacing: '8px', textAlign: 'center', fontSize: '1.3rem' }} />
            <button type="submit" disabled={loading || otp.length !== 6} style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleResetPassword}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', fontSize: '0.9rem' }}>New Password</label>
            <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '1rem' }} />
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Confirm Password</label>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '1rem' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ color: '#059669', fontWeight: 600 }}>✅ Password reset successful!</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a href="/admin/login" style={{ color: '#8b5cf6', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default AdminPasswordReset;