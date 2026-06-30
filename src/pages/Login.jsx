import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const redirectPath = new URLSearchParams(window.location.search).get('redirect') || '/';
  const [activeTab, setActiveTab] = useState('mobile');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const handleSendOTP = async () => {
    if (!mobile || mobile.length < 10) { setError('Enter valid 10-digit mobile number'); return; }
    try {
      await api.post('/otp/send', { phone: `+91${mobile}` });
      setOtpSent(true);
      setOtpCountdown(30);
      setError('');
    } catch (err) { setError('Failed to send OTP'); }
  };

  const handleLoginWithOTP = async () => {
    if (!otp || otp.length !== 6) { setError('Enter valid 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await api.post('/otp/verify', { phone: `+91${mobile}`, otp });
      if (res.data?.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate(redirectPath);
      } else { setError(res.data?.message || 'Invalid OTP'); }
    } catch (err) { setError('Invalid OTP'); }
    setLoading(false);
  };

  const handleLoginWithPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const loginData = activeTab === 'mobile'
        ? { phone: `+91${mobile}`, password, role: 'patient' }
        : { email, password, role: 'patient' };
      const res = await api.post('/auth/login', loginData);
      if (res.data?.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate(redirectPath);
      } else { setError(res.data?.message || 'Login failed'); }
    } catch (err) { setError('Login failed. Check credentials.'); }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { ...registerForm, role: 'patient', phone: `+91${registerForm.phone}` });
      if (res.data?.success) {
        setSuccess('Registration successful!');
        setTimeout(() => { setIsRegister(false); setSuccess(''); }, 1500);
      } else { setError(res.data?.message || 'Registration failed'); }
    } catch (err) { setError('Registration failed'); }
    setLoading(false);
  };

  if (isRegister) {
    return (
      <div style={s.page}><div style={s.card}>
        <button onClick={() => setIsRegister(false)} style={s.back}>← Back</button>
        <div style={s.logo}><span>📝</span><h2>Create Account</h2><p>Join HealthCare Hub</p></div>
        {error && <div style={s.error}>{error}</div>}{success && <div style={s.success}>{success}</div>}
        <form onSubmit={handleRegister}>
          <input placeholder="Full Name *" value={registerForm.name} onChange={e => setRegisterForm(p => ({ ...p, name: e.target.value }))} style={s.input} required />
          <input placeholder="Email *" type="email" value={registerForm.email} onChange={e => setRegisterForm(p => ({ ...p, email: e.target.value }))} style={s.input} required />
          <div style={s.phoneRow}><span style={s.cc}>+91</span><input placeholder="Mobile *" value={registerForm.phone} onChange={e => setRegisterForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} style={{ ...s.input, flex: 1, marginBottom: 0 }} required /></div>
          <input placeholder="Password *" type="password" value={registerForm.password} onChange={e => setRegisterForm(p => ({ ...p, password: e.target.value }))} style={s.input} required />
          <input placeholder="Confirm Password *" type="password" value={registerForm.confirmPassword} onChange={e => setRegisterForm(p => ({ ...p, confirmPassword: e.target.value }))} style={s.input} required />
          <button type="submit" disabled={loading} style={s.btn}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p style={s.link}>Already have account? <span onClick={() => setIsRegister(false)} style={s.linkRed}>Login</span></p>
      </div></div>
    );
  }

  return (
    <div style={s.page}><div style={s.card}>
      <button onClick={() => navigate('/')} style={s.back}>←</button>
      <div style={s.logo}><span>🏥</span><h2>Patient Login</h2><p>Access your healthcare services</p></div>
      <div style={s.tabs}>
        {[{ k: 'mobile', i: '📱', l: 'Mobile' }, { k: 'email', i: '✉️', l: 'Email' }, { k: 'qr', i: '📷', l: 'QR' }].map(t => (
          <button key={t.k} onClick={() => { setActiveTab(t.k); setError(''); setOtpMode(false); }} style={{ ...s.tab, background: activeTab === t.k ? '#e53935' : 'transparent', color: activeTab === t.k ? '#fff' : '#666' }}>{t.i} {t.l}</button>
        ))}
      </div>
      {error && <div style={s.error}>{error}</div>}{success && <div style={s.success}>{success}</div>}

      {activeTab === 'qr' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ width: '150px', height: '150px', margin: '0 auto 15px', background: '#f5f5f5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #ddd' }}>
            <span style={{ fontSize: '50px' }}>📱</span>
          </div>
          <p style={{ fontSize: '13px', color: '#888' }}>Scan QR from mobile app for quick login</p>
        </div>
      )}

      {(activeTab === 'mobile' || activeTab === 'email') && (
        <form onSubmit={handleLoginWithPassword}>
          {activeTab === 'mobile' && (
            <div style={{ marginBottom: '14px' }}><label style={s.label}>📱 Mobile Number</label>
              <div style={s.phoneRow}><span style={s.cc}>+91</span><input type="tel" placeholder="Enter mobile number" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} style={{ ...s.input, flex: 1, marginBottom: 0 }} /></div>
            </div>
          )}
          {activeTab === 'email' && (
            <div style={{ marginBottom: '14px' }}><label style={s.label}>✉️ Email</label><input type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} style={s.input} /></div>
          )}
          {!otpMode ? (
            <>
              <div style={{ marginBottom: '10px' }}><label style={s.label}>🔒 Password</label>
                <div style={{ position: 'relative' }}><input type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...s.input, paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>{showPassword ? '🙈' : '👁️'}</button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <button type="button" onClick={() => setOtpMode(true)} style={{ background: 'none', border: 'none', color: '#2196f3', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>📱 Login with OTP</button>
                <Link to="/forgot-password" style={{ fontSize: '13px', color: '#e53935', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading} style={s.btn}>{loading ? 'Logging in...' : 'Login'}</button>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '14px' }}><label style={s.label}>📱 Enter OTP</label><input type="text" placeholder="6-digit OTP" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} style={{ ...s.input, letterSpacing: '8px', textAlign: 'center', fontSize: '20px' }} />{otpSent && <p style={{ fontSize: '12px', color: '#4caf50', margin: '6px 0 0' }}>✅ OTP sent to +91{mobile}</p>}</div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <button type="button" onClick={handleSendOTP} disabled={otpCountdown > 0} style={{ flex: 1, padding: '12px', background: otpCountdown > 0 ? '#ccc' : '#2196f3', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: otpCountdown > 0 ? 'not-allowed' : 'pointer' }}>{otpCountdown > 0 ? `Resend ${otpCountdown}s` : 'Send OTP'}</button>
                <button type="button" onClick={() => { setOtpMode(false); setOtpSent(false); setOtp(''); }} style={{ padding: '12px 16px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Use Password</button>
              </div>
              <button type="button" onClick={handleLoginWithOTP} disabled={loading || otp.length !== 6} style={{ ...s.btn, background: '#4caf50' }}>{loading ? 'Verifying...' : 'Login with OTP'}</button>
            </>
          )}
        </form>
      )}
      <div style={{ textAlign: 'center', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
        <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Don't have an account? <span onClick={() => setIsRegister(true)} style={{ color: '#e53935', fontWeight: 700, cursor: 'pointer' }}>Register here</span></p>
      </div>
    </div></div>
  );
};

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #e53935, #c62828)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  card: { width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '20px', padding: '25px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  back: { fontSize: '16px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', marginBottom: '10px', color: '#333' },
  logo: { textAlign: 'center', marginBottom: '20px' },
  tabs: { display: 'flex', background: '#f5f5f5', borderRadius: '12px', padding: '4px', marginBottom: '20px' },
  tab: { flex: 1, padding: '12px', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' },
  input: { width: '100%', padding: '13px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' },
  phoneRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
  cc: { padding: '13px 10px', background: '#f5f5f5', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#555' },
  btn: { width: '100%', padding: '14px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' },
  error: { background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px', textAlign: 'center' },
  success: { background: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px', textAlign: 'center' },
  link: { textAlign: 'center', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #eee', fontSize: '13px', color: '#888' },
  linkRed: { color: '#e53935', fontWeight: 700, cursor: 'pointer' }
};

export default Login;