import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const AmbulanceLogin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('email');
  const [form, setForm] = useState({ email: '', phone: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotMethod, setForgotMethod] = useState('phone');
  const [forgotStep, setForgotStep] = useState(1);

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const resetAll = () => {
    setIsForgotPassword(false);
    setForgotStep(1);
    setForm({ email: '', phone: '', password: '', otp: '' });
    setError('');
    setSuccess('');
    setOtpSent(false);
  };

  // === LOGIN ===
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (activeTab === 'email') {
        if (!form.email || !form.password) { setError('Please fill all fields'); setLoading(false); return; }
        res = await api.post('/auth/login', { email: form.email, password: form.password, role: 'ambulance' });
      } else {
        if (!form.phone || !form.otp) { setError('Please enter phone and OTP'); setLoading(false); return; }
        res = await api.post('/otp/verify', { phone: `+91${form.phone}`, otp: form.otp });
      }
      if (res.data?.success) {
        localStorage.setItem('providerToken', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('providerType', 'ambulance');
        navigate('/ambulance/dashboard');
      } else {
        setError(res.data?.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Check credentials.');
    } finally { setLoading(false); }
  };

  const handleSendOTP = async () => {
    if (!form.phone || form.phone.length < 10) { setError('Enter valid 10-digit mobile number'); return; }
    try {
      await api.post('/otp/send', { phone: `+91${form.phone}` });
      setOtpSent(true);
      setOtpCountdown(30);
      setError('');
    } catch (err) { setError('Failed to send OTP'); }
  };

  // === FORGOT PASSWORD ===
  const handleForgotSendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      if (forgotMethod === 'phone') {
        if (!form.phone || form.phone.length < 10) { setError('Enter valid 10-digit mobile number'); setLoading(false); return; }
        await api.post('/otp/send', { phone: `+91${form.phone}` });
      } else {
        if (!form.email) { setError('Enter email address'); setLoading(false); return; }
        await api.post('/auth/forgot-password', { email: form.email });
      }
      setForgotStep(2);
      setOtpCountdown(30);
    } catch (err) { setError('Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleForgotVerifyOTP = async () => {
    if (!form.otp || form.otp.length < 4) { setError('Enter valid OTP'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/otp/verify', { 
        phone: forgotMethod === 'phone' ? `+91${form.phone}` : undefined,
        email: forgotMethod === 'email' ? form.email : undefined,
        otp: form.otp 
      });
      if (res.data?.success) { setForgotStep(3); }
      else { setError('Invalid OTP'); }
    } catch (err) { setError('OTP verification failed'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    if (!form.password || form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/reset-password', {
        [forgotMethod === 'phone' ? 'phone' : 'email']: forgotMethod === 'phone' ? `+91${form.phone}` : form.email,
        otp: form.otp,
        newPassword: form.password
      });
      if (res.data?.success) {
        setSuccess('Password reset successful! Redirecting...');
        setTimeout(resetAll, 2000);
      } else { setError(res.data?.message || 'Reset failed'); }
    } catch (err) { setError('Password reset failed'); }
    finally { setLoading(false); }
  };

  const handleChange = (field, value) => { setForm(prev => ({ ...prev, [field]: value })); setError(''); };

  // ============ FORGOT PASSWORD VIEW ============
  if (isForgotPassword) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <button onClick={resetAll} style={backBtnStyle}>← Back to Login</button>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '40px', display: 'block' }}>🔐</span>
            <h2 style={{ margin: '8px 0 0', fontSize: '20px', fontWeight: 800, color: '#1a1a1a' }}>Reset Password</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>
              {forgotStep === 1 && 'Verify via phone or email'}
              {forgotStep === 2 && 'Enter OTP sent to your ' + forgotMethod}
              {forgotStep === 3 && 'Set your new password'}
            </p>
          </div>
          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}

          {forgotStep === 1 && (
            <>
              <div style={{ display: 'flex', marginBottom: '14px' }}>
                <button onClick={() => { setForgotMethod('phone'); setError(''); }} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px 0 0 8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', background: forgotMethod === 'phone' ? '#e53935' : '#f5f5f5', color: forgotMethod === 'phone' ? '#fff' : '#666' }}>📱 Phone</button>
                <button onClick={() => { setForgotMethod('email'); setError(''); }} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '0 8px 8px 0', fontWeight: 600, fontSize: '13px', cursor: 'pointer', background: forgotMethod === 'email' ? '#e53935' : '#f5f5f5', color: forgotMethod === 'email' ? '#fff' : '#666' }}>✉️ Email</button>
              </div>
              {forgotMethod === 'phone' ? (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <span style={countryCodeStyle}>+91</span>
                  <input type="tel" placeholder="Registered mobile number" value={form.phone} onChange={e => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
                </div>
              ) : (
                <input type="email" placeholder="Registered email address" value={form.email} onChange={e => handleChange('email', e.target.value)} style={inputStyle} />
              )}
              <button onClick={handleForgotSendOTP} disabled={loading} style={submitBtnStyle}>{loading ? 'Sending...' : 'Send OTP'}</button>
            </>
          )}

          {forgotStep === 2 && (
            <>
              <label style={labelStyle}>Enter OTP</label>
              <input type="text" placeholder="6-digit OTP" value={form.otp} onChange={e => handleChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} style={{ ...inputStyle, letterSpacing: '6px', textAlign: 'center', fontSize: '18px' }} />
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button onClick={handleForgotVerifyOTP} disabled={loading} style={{ ...submitBtnStyle, flex: 1 }}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
                <button onClick={handleForgotSendOTP} disabled={otpCountdown > 0} style={{ ...submitBtnStyle, flex: 1, background: otpCountdown > 0 ? '#ccc' : '#2196f3' }}>{otpCountdown > 0 ? `Resend ${otpCountdown}s` : 'Resend'}</button>
              </div>
            </>
          )}

          {forgotStep === 3 && (
            <>
              <label style={labelStyle}>New Password</label>
              <input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => handleChange('password', e.target.value)} style={inputStyle} />
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} style={inputStyle} />
              <button onClick={handleResetPassword} disabled={loading} style={submitBtnStyle}>{loading ? 'Resetting...' : 'Reset Password'}</button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ============ LOGIN VIEW ============
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <button onClick={() => navigate('/ambulance')} style={backBtnStyle}>← Back</button>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '40px', display: 'block' }}>🚑</span>
          <h2 style={{ margin: '8px 0 0', fontSize: '20px', fontWeight: 800, color: '#1a1a1a' }}>Ambulance Login</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>Login to manage your fleet</p>
        </div>
        <div style={tabContainerStyle}>
          <button onClick={() => { setActiveTab('email'); setError(''); }} style={{ ...tabStyle, background: activeTab === 'email' ? '#e53935' : 'transparent', color: activeTab === 'email' ? '#fff' : '#666' }}>✉️ Email</button>
          <button onClick={() => { setActiveTab('phone'); setError(''); }} style={{ ...tabStyle, background: activeTab === 'phone' ? '#e53935' : 'transparent', color: activeTab === 'phone' ? '#fff' : '#666' }}>📱 Mobile OTP</button>
        </div>
        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}
        <form onSubmit={handleLogin}>
          {activeTab === 'email' ? (
            <>
              <label style={labelStyle}>Email Address</label>
              <input type="email" placeholder="Enter your email" value={form.email} onChange={e => handleChange('email', e.target.value)} style={inputStyle} />
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={e => handleChange('password', e.target.value)} style={{ ...inputStyle, paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={passwordToggleStyle}>{showPassword ? '🙈' : '👁️'}</button>
              </div>
              <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                <span onClick={() => { setIsForgotPassword(true); setForgotStep(1); setForgotMethod('email'); setError(''); }} style={{ fontSize: '12px', color: '#e53935', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</span>
              </div>
            </>
          ) : (
            <>
              <label style={labelStyle}>Mobile Number</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <span style={countryCodeStyle}>+91</span>
                <input type="tel" placeholder="Enter mobile number" value={form.phone} onChange={e => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <button type="button" onClick={handleSendOTP} disabled={otpCountdown > 0} style={{ padding: '12px 16px', background: otpCountdown > 0 ? '#ccc' : '#2196f3', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: otpCountdown > 0 ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>{otpCountdown > 0 ? `Resend ${otpCountdown}s` : 'Send OTP'}</button>
                {otpSent && (
                  <input type="text" placeholder="6-digit OTP" value={form.otp} onChange={e => handleChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} style={{ ...inputStyle, flex: 1, letterSpacing: '6px', textAlign: 'center', fontSize: '18px', marginBottom: 0 }} />
                )}
              </div>
              <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                <span onClick={() => { setIsForgotPassword(true); setForgotStep(1); setForgotMethod('phone'); setError(''); }} style={{ fontSize: '12px', color: '#e53935', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</span>
              </div>
            </>
          )}
          <button type="submit" disabled={loading} style={submitBtnStyle}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            Don't have an account? <Link to="/ambulance/register" style={{ color: '#e53935', fontWeight: 700, textDecoration: 'none' }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const pageStyle = { minHeight: '100vh', background: 'linear-gradient(135deg, #e53935, #c62828)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' };
const cardStyle = { width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '20px', padding: '25px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' };
const backBtnStyle = { fontSize: '16px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', marginBottom: '10px', color: '#333' };
const tabContainerStyle = { display: 'flex', background: '#f5f5f5', borderRadius: '12px', padding: '4px', marginBottom: '20px' };
const tabStyle = { flex: 1, padding: '12px', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '13px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' };
const countryCodeStyle = { padding: '13px 10px', background: '#f5f5f5', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#555' };
const passwordToggleStyle = { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' };
const submitBtnStyle = { width: '100%', padding: '14px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' };
const errorStyle = { background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px', textAlign: 'center' };
const successStyle = { background: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px', textAlign: 'center' };

export default AmbulanceLogin;

