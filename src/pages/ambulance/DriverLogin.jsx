import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DriverLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) { setError('Enter valid phone'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/otp/send', { phone: `+91${phone}`, type: 'login' });
      setOtpSent(true);
    } catch (e) { setError('Failed to send OTP'); }
    setLoading(false);
  };

    const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) { setError('Enter OTP'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/otp/verify', { phone: `+91${phone}`, otp, type: 'login' });
      if (res.data?.success) {
        const driverRes = await api.post('/ambulance/driver-login', { phone: `+91${phone}` });
        if (driverRes.data?.token) {
                    localStorage.clear();
          localStorage.setItem('driverId', driverRes.data.driver.id);
          localStorage.setItem('driverPhone', phone);
          localStorage.setItem('driverName', driverRes.data.driver.name);
          localStorage.setItem('userType', 'ambulance_driver');
          localStorage.setItem('token', driverRes.data.token);
          localStorage.setItem('driverToken', driverRes.data.token);
          
          // Remove any patient token that may have been set during OTP
          localStorage.removeItem('patientToken');
          
          navigate('/ambulance/driver/app');
        } else {
          setError('Driver not found');
        }
      } else {
        setError('Invalid OTP');
      }
    } catch (e) {
      setError('Verification failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', padding: 20, fontFamily: 'Arial' }}>
      <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
        <button onClick={() => navigate('/ambulance')} style={{ background: 'none', border: 'none', color: '#e53935', fontSize: 14, cursor: 'pointer', display: 'block', marginBottom: 30 }}>← Back</button>
        <span style={{ fontSize: 50, display: 'block' }}>🚑</span>
        <h1 style={{ color: '#fff', fontSize: 22, margin: '10px 0' }}>Driver Login</h1>
        <p style={{ color: '#888', fontSize: 13 }}>Enter your registered phone number</p>

        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 15 }}>{error}</div>}

        {!otpSent ? (
          <>
            <input 
              type="tel" 
              placeholder="Phone Number" 
              value={phone} 
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              style={{ width: '100%', padding: 14, border: '2px solid #333', borderRadius: 10, fontSize: 16, background: '#1a1a2e', color: '#fff', textAlign: 'center', marginBottom: 15, boxSizing: 'border-box' }}
            />
            <button onClick={handleSendOTP} disabled={loading} style={{ width: '100%', padding: 14, background: '#e53935', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <input 
              type="text" 
              placeholder="Enter OTP" 
              value={otp} 
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              style={{ width: '100%', padding: 14, border: '2px solid #333', borderRadius: 10, fontSize: 20, background: '#1a1a2e', color: '#fff', textAlign: 'center', letterSpacing: 10, marginBottom: 15, boxSizing: 'border-box' }}
            />
            <button onClick={handleVerifyOTP} disabled={loading} style={{ width: '100%', padding: 14, background: '#4caf50', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DriverLogin;