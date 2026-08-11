import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { hospitalApi } from '../../services/providerApi';
import { sendOTP, verifyOTP } from '../../services/api';

const HospitalLogin = () => {
  const navigate = useNavigate();
  
  // Login method toggle
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' or 'email'
  const [step, setStep] = useState('login'); // 'login', 'otp', 'forgot'
  
  // Form data
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    otp: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Send OTP
  const handleSendOTP = async () => {
    const contact = loginMethod === 'phone' ? formData.phone : formData.email;
    if (!contact) {
      setError(`Please enter your ${loginMethod === 'phone' ? 'phone number' : 'email'}`);
      return;
    }
    
    setLoading(true);
    try {
      const res = await sendOTP({
        [loginMethod]: contact,
        type: 'login'
      });
      
      if (res.data.success) {
        setOtpSent(true);
        setStep('otp');
        setSuccess('OTP sent successfully!');
        
        // Start resend timer (30 seconds)
        setResendTimer(30);
        const timer = setInterval(() => {
          setResendTimer(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & Login
  const handleOTPLogin = async () => {
    if (!formData.otp || formData.otp.length < 4) {
      setError('Please enter valid OTP');
      return;
    }
    
    setLoading(true);
    try {
      const contact = loginMethod === 'phone' ? formData.phone : formData.email;
      
      // Verify OTP
      const verifyRes = await verifyOTP({
        [loginMethod]: contact,
        otp: formData.otp,
        type: 'login'
      });
      
      if (verifyRes.data.success) {
        // Login after OTP verification
        const loginRes = await hospitalApi.login({
          [loginMethod]: contact,
          otpVerified: true
        });
        
        if (loginRes.data.success) {
          localStorage.setItem('providerToken', loginRes.data.token);
          localStorage.setItem('providerType', 'hospital');
          localStorage.setItem('providerId', loginRes.data.hospitalId);
          navigate('/hospital/dashboard');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    
    const contact = loginMethod === 'phone' ? formData.phone : formData.email;
    if (!contact || !formData.password) {
      setError('Please fill all fields');
      return;
    }
    
    setLoading(true);
    try {
      const res = await hospitalApi.login({
        [loginMethod]: contact,
        password: formData.password
      });
      
      if (res.data.success) {
        localStorage.setItem('providerToken', res.data.token);
        localStorage.setItem('providerType', 'hospital');
        localStorage.setItem('providerId', res.data.hospitalId);
        navigate('/hospital/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const handleForgotPassword = async () => {
    const contact = loginMethod === 'phone' ? formData.phone : formData.email;
    if (!contact) {
      setError(`Please enter your ${loginMethod === 'phone' ? 'phone number' : 'email'}`);
      return;
    }
    
    setLoading(true);
    try {
      const res = await sendOTP({
        [loginMethod]: contact,
        type: 'forgot_password'
      });
      
      if (res.data.success) {
        setStep('otp');
        setOtpSent(true);
        setSuccess('OTP sent for password reset');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Reset Password after OTP
  const handleResetPassword = async () => {
    if (!formData.otp || !formData.password) {
      setError('Please enter OTP and new password');
      return;
    }
    
    setLoading(true);
    try {
      const contact = loginMethod === 'phone' ? formData.phone : formData.email;
      const res = await hospitalApi.updateProfile({
        [loginMethod]: contact,
        otp: formData.otp,
        newPassword: formData.password
      });
      
      if (res.data.success) {
        setSuccess('Password reset successfully! Please login.');
        setStep('login');
        setFormData({ ...formData, otp: '', password: '' });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0fdf4', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '1rem'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '440px', 
        backgroundColor: 'white', 
        borderRadius: '1rem', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #10b981, #059669)', 
          padding: '2rem', 
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏥</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
            {step === 'forgot' ? 'Reset Password' : 'Hospital Login'}
          </h1>
          <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            {step === 'forgot' ? 'Enter your details to reset password' : 
             step === 'otp' ? 'Enter OTP to verify' : 
             'Access your hospital dashboard'}
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          
          {/* Error Message */}
          {error && (
            <div style={{ 
              backgroundColor: '#fee2e2', 
              color: '#dc2626', 
              padding: '0.75rem', 
              borderRadius: '0.5rem', 
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              ❌ {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{ 
              backgroundColor: '#d1fae5', 
              color: '#065f46', 
              padding: '0.75rem', 
              borderRadius: '0.5rem', 
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              ✅ {success}
            </div>
          )}

          {/* Login Method Toggle */}
          {step === 'login' && (
            <div style={{ 
              display: 'flex', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '0.5rem', 
              padding: '0.25rem',
              marginBottom: '1.5rem'
            }}>
              <button
                onClick={() => setLoginMethod('phone')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  backgroundColor: loginMethod === 'phone' ? '#10b981' : 'transparent',
                  color: loginMethod === 'phone' ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  fontWeight: loginMethod === 'phone' ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                📱 Phone
              </button>
              <button
                onClick={() => setLoginMethod('email')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  backgroundColor: loginMethod === 'email' ? '#10b981' : 'transparent',
                  color: loginMethod === 'email' ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  fontWeight: loginMethod === 'email' ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                ✉️ Email
              </button>
            </div>
          )}

          {/* LOGIN FORM */}
          {step === 'login' && (
            <form onSubmit={handlePasswordLogin}>
              {/* Phone/Email Input */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                  {loginMethod === 'phone' ? '📱 Phone Number' : '✉️ Email Address'}
                </label>
                <input
                  type={loginMethod === 'phone' ? 'tel' : 'email'}
                  name={loginMethod}
                  value={loginMethod === 'phone' ? formData.phone : formData.email}
                  onChange={handleChange}
                  placeholder={loginMethod === 'phone' ? '+91 Enter phone number' : 'Enter your email'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                  🔒 Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Forgot Password Link */}
              <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={() => { setStep('forgot'); setError(''); setSuccess(''); }}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#3b82f6', 
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: loading ? '#a7f3d0' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '0.75rem'
                }}
              >
                {loading ? 'Logging in...' : '🔐 Login with Password'}
              </button>

              {/* OR Divider */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                margin: '1rem 0',
                color: '#9ca3af',
                fontSize: '0.875rem'
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                <span style={{ padding: '0 1rem' }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
              </div>

              {/* Login with OTP Button */}
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  color: '#10b981',
                  border: '2px solid #10b981',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                📱 Login with OTP
              </button>
            </form>
          )}

          {/* OTP VERIFICATION */}
          {step === 'otp' && (
            <div>
              <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }}>
                OTP sent to <strong>{loginMethod === 'phone' ? formData.phone : formData.email}</strong>
              </p>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                  🔢 Enter OTP
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength="6"
                  placeholder="Enter 4-6 digit OTP"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1.25rem',
                    textAlign: 'center',
                    letterSpacing: '0.5rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Forgot Password: New Password Field */}
              {step === 'otp' && formData.phone === '' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    🔒 New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              <button
                onClick={step === 'forgot' ? handleResetPassword : handleOTPLogin}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: loading ? '#a7f3d0' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '0.75rem'
                }}
              >
                {loading ? 'Verifying...' : step === 'forgot' ? '🔒 Reset Password' : '✅ Verify & Login'}
              </button>

              {/* Resend OTP */}
              <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                {resendTimer > 0 ? (
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    Resend OTP in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#3b82f6', 
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    📤 Resend OTP
                  </button>
                )}
              </div>

              {/* Change login method */}
              <button
                type="button"
                onClick={() => { setStep('login'); setOtpSent(false); }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                ← Back to Login
              </button>
            </div>
          )}

          {/* FORGOT PASSWORD */}
          {step === 'forgot' && !otpSent && (
            <div>
              <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }}>
                Enter your {loginMethod === 'phone' ? 'phone number' : 'email'} to receive password reset OTP
              </p>
              
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type={loginMethod === 'phone' ? 'tel' : 'email'}
                  name={loginMethod}
                  value={loginMethod === 'phone' ? formData.phone : formData.email}
                  onChange={handleChange}
                  placeholder={loginMethod === 'phone' ? 'Phone number' : 'Email address'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                onClick={handleForgotPassword}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: loading ? '#a7f3d0' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '0.75rem'
                }}
              >
                {loading ? 'Sending...' : '📤 Send OTP'}
              </button>

              <button
                onClick={() => { setStep('login'); setError(''); }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                ← Back to Login
              </button>
            </div>
          )}

          {/* Register Link */}
          {step === 'login' && (
            <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Don't have an account?{' '}
                <Link to="/hospital/register" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'none' }}>
                  Register Your Hospital
                </Link>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default HospitalLogin;

