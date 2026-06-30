import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ambulanceLogin, sendOTP, verifyOTP } from '../../services/api';

const AmbulanceLogin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('email');
  const [form, setForm] = useState({ email: '', phone: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSendOTP = async () => {
    if (!form.phone || form.phone.length < 10) {
      setError('Enter valid 10-digit mobile number');
      return;
    }
    try {
      await sendOTP({ phone: `+91${form.phone}` });
      setOtpSent(true);
      setOtpCountdown(30);
      setError('');
    } catch (err) {
      setError('Failed to send OTP');
    }
  };

  React.useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (activeTab === 'email') {
        if (!form.email || !form.password) {
          setError('Please fill all fields');
          setLoading(false);
          return;
        }
        res = await ambulanceLogin({ email: form.email, password: form.password });
      } else {
        if (!form.phone || !form.otp) {
          setError('Please enter phone and OTP');
          setLoading(false);
          return;
        }
        res = await verifyOTP({ phone: `+91${form.phone}`, otp: form.otp });
      }

      if (res.data?.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/ambulance/dashboard');
      } else {
        setError(res.data?.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e53935, #c62828)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', background: '#fff',
        borderRadius: '20px', padding: '30px 24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Back Button */}
        <button onClick={() => navigate('/ambulance')} style={{
          background: 'none', border: 'none', fontSize: '20px',
          cursor: 'pointer', padding: '4px 8px', marginBottom: '10px'
        }}>← Back</button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '44px', display: 'block' }}>🚑</span>
          <h2 style={{ margin: '8px 0 0', fontSize: '20px', fontWeight: 800, color: '#1a1a1a' }}>Ambulance Login</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>Login to manage your fleet & accept emergencies</p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: '#f5f5f5', borderRadius: '12px',
          padding: '4px', marginBottom: '20px'
        }}>
          <button onClick={() => { setActiveTab('email'); setError(''); }}
            style={{
              flex: 1, padding: '12px', border: 'none', borderRadius: '10px',
              background: activeTab === 'email' ? '#e53935' : 'transparent',
              color: activeTab === 'email' ? '#fff' : '#666',
              fontWeight: 600, fontSize: '13px', cursor: 'pointer'
            }}>✉️ Email</button>
          <button onClick={() => { setActiveTab('phone'); setError(''); }}
            style={{
              flex: 1, padding: '12px', border: 'none', borderRadius: '10px',
              background: activeTab === 'phone' ? '#e53935' : 'transparent',
              color: activeTab === 'phone' ? '#fff' : '#666',
              fontWeight: 600, fontSize: '13px', cursor: 'pointer'
            }}>📱 Mobile OTP</button>
        </div>

        {error && (
          <div style={{
            background: '#ffebee', color: '#c62828', padding: '10px',
            borderRadius: '8px', fontSize: '13px', marginBottom: '15px', textAlign: 'center'
          }}>{error}</div>
        )}

        <form onSubmit={handleLogin}>
          {activeTab === 'email' ? (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Email Address</label>
                <input type="email" placeholder="Enter your email"
                  value={form.email} onChange={e => handleChange('email', e.target.value)}
                  style={inputStyle} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password} onChange={e => handleChange('password', e.target.value)}
                    style={{ ...inputStyle, paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '10px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', fontSize: '18px', cursor: 'pointer'
                    }}>{showPassword ? '🙈' : '👁️'}</button>
                </div>
              </div>
              <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                <Link to="/ambulance/forgot-password" style={{
                  fontSize: '12px', color: '#e53935', textDecoration: 'none', fontWeight: 600
                }}>Forgot password?</Link>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Mobile Number</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    padding: '13px 10px', background: '#f5f5f5',
                    border: '2px solid #e0e0e0', borderRadius: '10px',
                    fontSize: '14px', fontWeight: 600, color: '#555'
                  }}>+91</span>
                  <input type="tel" placeholder="Enter mobile number"
                    value={form.phone}
                    onChange={e => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={{ ...inputStyle, flex: 1 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <button type="button" onClick={handleSendOTP}
                  disabled={otpCountdown > 0}
                  style={{
                    padding: '12px 16px',
                    background: otpCountdown > 0 ? '#ccc' : '#2196f3',
                    color: '#fff', border: 'none', borderRadius: '10px',
                    fontSize: '12px', fontWeight: 600,
                    cursor: otpCountdown > 0 ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap'
                  }}>{otpCountdown > 0 ? `Resend ${otpCountdown}s` : 'Send OTP'}</button>
                {otpSent && (
                  <input type="text" placeholder="6-digit OTP"
                    value={form.otp}
                    onChange={e => handleChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    style={{
                      ...inputStyle, flex: 1, letterSpacing: '6px',
                      textAlign: 'center', fontSize: '18px'
                    }} />
                )}
              </div>
            </>
          )}

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px', background: '#e53935',
              color: '#fff', border: 'none', borderRadius: '12px',
              fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              marginTop: '8px', opacity: loading ? 0.7 : 1
            }}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>

        <div style={{
          textAlign: 'center', marginTop: '18px',
          paddingTop: '16px', borderTop: '1px solid #eee'
        }}>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            Don't have an account?{' '}
            <Link to="/ambulance/register" style={{
              color: '#e53935', fontWeight: 700, textDecoration: 'none'
            }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '13px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

export default AmbulanceLogin;