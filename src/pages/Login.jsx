import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { login, sendOTP, verifyOTP } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  // Tab state
  const [activeTab, setActiveTab] = useState('mobile'); // mobile | email | qr

  // Form state
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Loading & error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // QR state
  const [qrCode, setQrCode] = useState('');

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
      setError('');
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
        ? { phone: `+91${mobile}`, password }
        : { email, password };

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
    // Generate a temporary session token for QR login
    const sessionId = 'QR' + Date.now() + Math.random().toString(36).substr(2, 9);
    setQrCode(sessionId);
    // In production: Send this to backend and show actual QR code
    // For now: Show a simulated QR display
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e53935 0%, #c62828 50%, #8e0000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#fff',
        borderRadius: '20px',
        padding: '35px 25px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <span style={{ fontSize: '48px', display: 'block' }}>🏥</span>
          <h2 style={{ margin: '8px 0 0', fontSize: '22px', fontWeight: 800, color: '#1a1a1a' }}>Patient Login</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>Access your healthcare services</p>
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          background: '#f5f5f5',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '25px'
        }}>
          {[
            { key: 'mobile', icon: '📱', label: 'Mobile' },
            { key: 'email', icon: '✉️', label: 'Email' },
            { key: 'qr', icon: '📷', label: 'QR Code' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setError(''); setOtpMode(false); }}
              style={{
                flex: 1,
                padding: '12px 8px',
                border: 'none',
                borderRadius: '10px',
                background: activeTab === tab.key ? '#e53935' : 'transparent',
                color: activeTab === tab.key ? '#fff' : '#666',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ display: 'block', fontSize: '18px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '13px',
            marginBottom: '18px',
            border: '1px solid #ffcdd2'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* QR Code Tab */}
        {activeTab === 'qr' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              onClick={handleGenerateQR}
              style={{
                width: '180px',
                height: '180px',
                margin: '0 auto 15px',
                background: qrCode ? '#1a1a1a' : '#f5f5f5',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px dashed #ddd'
              }}
            >
              {qrCode ? (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '60px', display: 'block' }}>📱</span>
                  <span style={{ fontSize: '10px', color: '#fff', display: 'block', marginTop: '8px' }}>Scan with mobile app</span>
                  <span style={{ fontSize: '9px', color: '#aaa', display: 'block', marginTop: '4px' }}>{qrCode.slice(-8)}</span>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '50px', display: 'block' }}>📷</span>
                  <span style={{ fontSize: '12px', color: '#888', display: 'block', marginTop: '6px' }}>Tap to generate<br/>QR Code</span>
                </div>
              )}
            </div>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Scan QR code from your phone for quick login</p>
            <p style={{ fontSize: '11px', color: '#aaa', margin: '4px 0 0' }}>Open HealthCare Hub app → Profile → Scan QR</p>
          </div>
        )}

        {/* Mobile / Email Form */}
        {(activeTab === 'mobile' || activeTab === 'email') && (
          <form onSubmit={handleLoginWithPassword}>
            {/* Mobile Input */}
            {activeTab === 'mobile' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>📱 Mobile Number</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    padding: '14px 12px',
                    background: '#f5f5f5',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#555',
                    display: 'flex',
                    alignItems: 'center'
                  }}>+91</span>
                  <input
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={{
                      flex: 1,
                      padding: '14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            {activeTab === 'email' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>✉️ Email ID</label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {/* Password OR OTP */}
            {!otpMode ? (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>🔒 Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '14px 45px 14px 14px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '10px',
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                        color: '#888'
                      }}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <button
                    type="button"
                    onClick={() => setOtpMode(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2196f3',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    📱 Login with OTP
                  </button>
                  <Link to="/forgot-password" style={{
                    fontSize: '13px',
                    color: '#e53935',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}>
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: '#e53935',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>📱 Enter OTP</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="6-digit OTP"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      style={{
                        flex: 1,
                        padding: '14px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '10px',
                        fontSize: '20px',
                        letterSpacing: '8px',
                        textAlign: 'center',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  {otpSent && (
                    <p style={{ fontSize: '12px', color: '#4caf50', margin: '6px 0 0' }}>
                      ✅ OTP sent to +91{mobile}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={otpCountdown > 0 || loading}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: otpCountdown > 0 ? '#ccc' : '#2196f3',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: otpCountdown > 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Send OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpMode(false); setOtpSent(false); setOtp(''); }}
                    style={{
                      padding: '12px 16px',
                      background: '#f5f5f5',
                      color: '#666',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Use Password
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleLoginWithOTP}
                  disabled={loading || otp.length !== 6}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: '#4caf50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: (loading || otp.length !== 6) ? 0.7 : 1
                  }}
                >
                  {loading ? 'Verifying...' : 'Login with OTP'}
                </button>
              </>
            )}
          </form>
        )}

        {/* Register Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          paddingTop: '18px',
          borderTop: '1px solid #eee'
        }}>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            Don't have an account?{' '}
            <Link
              to={`/register?redirect=${encodeURIComponent(redirectPath)}`}
              style={{ color: '#e53935', fontWeight: 700, textDecoration: 'none' }}
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;