import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { login, sendOTP, verifyOTP, register } from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  // Active tab
  const [activeTab, setActiveTab] = useState('mobile');

  // Form fields
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // QR state
  const [qrCode, setQrCode] = useState('');

  // Loading & error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Register mode
  const [isRegister, setIsRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const handleSendOTP = async () => {
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendOTP({ phone: `+91${mobile}` });
      setOtpSent(true);
      setOtpCountdown(30);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await verifyOTP({ phone: `+91${mobile}`, otp });
      if (res.data?.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate(redirectPath);
      } else {
        setError(res.data?.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (activeTab === 'mobile' && (!mobile || mobile.length < 10)) {
      setError('Please enter a valid mobile number');
      setLoading(false);
      return;
    }
    if (activeTab === 'email' && !email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      const loginData = activeTab === 'mobile'
        ? { phone: `+91${mobile}`, password, role: 'patient' }
        : { email, password, role: 'patient' };

      const res = await login(loginData);
      if (res.data?.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate(redirectPath);
      } else {
        setError(res.data?.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = () => {
    const sessionId = 'QR' + Date.now() + Math.random().toString(36).substr(2, 9);
    setQrCode(sessionId);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await register({
        name: registerForm.name,
        email: registerForm.email,
        phone: `+91${registerForm.phone}`,
        password: registerForm.password,
        role: 'patient'
      });
      if (res.data?.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          setIsRegister(false);
          setSuccess('');
        }, 2000);
      } else {
        setError(res.data?.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============ REGISTER VIEW ============
  if (isRegister) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <button onClick={() => navigate('/')} style={backBtnStyle}>←</button>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '40px', display: 'block' }}>📝</span>
            <h2 style={{ margin: '8px 0 0', fontSize: '20px', fontWeight: 800, color: '#1a1a1a' }}>Create Account</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>Join HealthCare Hub</p>
          </div>

          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}

          <form onSubmit={handleRegister}>
            <input placeholder="Full Name *" value={registerForm.name} onChange={e => setRegisterForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} required />
            <input placeholder="Email Address *" type="email" value={registerForm.email} onChange={e => setRegisterForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} required />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <span style={{ padding: '13px 10px', background: '#f5f5f5', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#555' }}>+91</span>
              <input placeholder="Mobile Number *" value={registerForm.phone} onChange={e => setRegisterForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} required />
            </div>
            <input placeholder="Password *" type="password" value={registerForm.password} onChange={e => setRegisterForm(p => ({ ...p, password: e.target.value }))} style={inputStyle} required />
            <input placeholder="Confirm Password *" type="password" value={registerForm.confirmPassword} onChange={e => setRegisterForm(p => ({ ...p, confirmPassword: e.target.value }))} style={inputStyle} required />

            <button type="submit" disabled={loading} style={submitBtnStyle}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#888' }}>
            Already have an account?{' '}
            <span onClick={() => setIsRegister(false)} style={{ color: '#e53935', fontWeight: 700, cursor: 'pointer' }}>Login here</span>
          </p>
        </div>
      </div>
    );
  }

  // ============ LOGIN VIEW ============
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <button onClick={() => navigate('/')} style={backBtnStyle}>←</button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '40px', display: 'block' }}>🏥</span>
          <h2 style={{ margin: '8px 0 0', fontSize: '20px', fontWeight: 800, color: '#1a1a1a' }}>Patient Login</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>Access your healthcare services</p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: '#f5f5f5', borderRadius: '12px',
          padding: '4px', marginBottom: '20px'
        }}>
          {[
            { key: 'mobile', icon: '📱', label: 'Mobile' },
            { key: 'email', icon: '✉️', label: 'Email' },
            { key: 'qr', icon: '📷', label: 'QR Code' }
          ].map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setError(''); setOtpMode(false); }}
              style={{
                flex: 1, padding: '12px 6px', border: 'none', borderRadius: '10px',
                background: activeTab === tab.key ? '#e53935' : 'transparent',
                color: activeTab === tab.key ? '#fff' : '#666',
                fontWeight: 600, fontSize: '12px', cursor: 'pointer'
              }}>
              <span style={{ display: 'block', fontSize: '16px' }}>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}

        {/* QR CODE */}
        {activeTab === 'qr' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div onClick={handleGenerateQR} style={{
              width: '160px', height: '160px', margin: '0 auto 15px',
              background: qrCode ? '#1a1a1a' : '#f5f5f5',
              borderRadius: '16px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', border: '2px dashed #ddd'
            }}>
              {qrCode ? (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '50px', display: 'block' }}>📱</span>
                  <span style={{ fontSize: '10px', color: '#fff', display: 'block', marginTop: '6px' }}>Scan with app</span>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '40px', display: 'block' }}>📷</span>
                  <span style={{ fontSize: '12px', color: '#888', display: 'block', marginTop: '6px' }}>Tap to generate</span>
                </div>
              )}
            </div>
            <p style={{ fontSize: '13px', color: '#888' }}>Scan QR code from your phone for quick login</p>
          </div>
        )}

        {/* MOBILE / EMAIL FORM */}
        {(activeTab === 'mobile' || activeTab === 'email') && (
          <form onSubmit={handleLoginWithPassword}>
            {activeTab === 'mobile' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>📱 Mobile Number</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ padding: '13px 10px', background: '#f5f5f5', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#555' }}>+91</span>
                  <input type="tel" placeholder="Enter your mobile number" value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>✉️ Email ID</label>
                <input type="email" placeholder="Enter your email address" value={email}
                  onChange={e => setEmail(e.target.value)} style={inputStyle} />
              </div>
            )}

            {!otpMode ? (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <label style={labelStyle}>🔒 Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password"
                      value={password} onChange={e => setPassword(e.target.value)}
                      style={{ ...inputStyle, paddingRight: '40px' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <button type="button" onClick={() => setOtpMode(true)}
                    style={{ background: 'none', border: 'none', color: '#2196f3', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    📱 Login with OTP
                  </button>
                  <Link to="/forgot-password" style={{ fontSize: '13px', color: '#e53935', fontWeight: 600, textDecoration: 'none' }}>
                    Forgot password?
                  </Link>
                </div>

                <button type="submit" disabled={loading} style={submitBtnStyle}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>📱 Enter OTP</label>
                  <input type="text" placeholder="6-digit OTP" value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6} style={{ ...inputStyle, letterSpacing: '8px', textAlign: 'center', fontSize: '20px' }} />
                  {otpSent && <p style={{ fontSize: '12px', color: '#4caf50', margin: '6px 0 0' }}>✅ OTP sent to +91{mobile}</p>}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <button type="button" onClick={handleSendOTP} disabled={otpCountdown > 0 || loading}
                    style={{ flex: 1, padding: '12px', background: otpCountdown > 0 ? '#ccc' : '#2196f3', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: otpCountdown > 0 ? 'not-allowed' : 'pointer' }}>
                    {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Send OTP'}
                  </button>
                  <button type="button" onClick={() => { setOtpMode(false); setOtpSent(false); setOtp(''); }}
                    style={{ padding: '12px 16px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    Use Password
                  </button>
                </div>

                <button type="button" onClick={handleLoginWithOTP} disabled={loading || otp.length !== 6}
                  style={{ ...submitBtnStyle, background: '#4caf50', opacity: (loading || otp.length !== 6) ? 0.7 : 1 }}>
                  {loading ? 'Verifying...' : 'Login with OTP'}
                </button>
              </>
            )}
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            Don't have an account?{' '}
            <span onClick={() => setIsRegister(true)} style={{ color: '#e53935', fontWeight: 700, cursor: 'pointer' }}>Register here</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// Styles
const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e53935 0%, #c62828 50%, #8e0000 100%)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
};
const cardStyle = {
  width: '100%', maxWidth: '420px', background: '#fff',
  borderRadius: '20px', padding: '25px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
};
const backBtnStyle = {
  fontSize: '20px', background: 'none', border: 'none',
  cursor: 'pointer', padding: '4px 8px', marginBottom: '10px', color: '#333'
};
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '13px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' };
const submitBtnStyle = { width: '100%', padding: '14px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' };
const errorStyle = { background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px', textAlign: 'center' };
const successStyle = { background: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px', textAlign: 'center' };

export default Login;