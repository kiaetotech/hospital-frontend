import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const EmployeeLogin = () => {
  const [step, setStep] = useState(1); // 1 = enter ID, 2 = enter OTP
  const [form, setForm] = useState({ employeeId: '', phone: '', otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.employeeId || !form.phone) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/employee/send-otp', { employeeId: form.employeeId, phone: form.phone });
      if (res.data.success) {
        setStep(2);
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Employee not found or phone mismatch');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.otp) {
      setError('Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/employee/verify-otp', { employeeId: form.employeeId, phone: form.phone, otp: form.otp });
      if (res.data.success) {
        localStorage.setItem('employeeToken', res.data.token);
        localStorage.setItem('employeeData', JSON.stringify(res.data.employee));
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await api.post('/employee/send-otp', { employeeId: form.employeeId, phone: form.phone });
      setError('OTP resent successfully');
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e8eaf6, #bbdefb)', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '440px', width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
        
        {/* Company branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>🏢</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a237e', marginBottom: '6px' }}>Employee Portal</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Access your corporate health benefits</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', background: step === 1 ? '#1976d2' : '#e8f5e9', color: step === 1 ? 'white' : '#2e7d32' }}>1</div>
          <div style={{ width: '40px', height: '2px', background: step === 2 ? '#1976d2' : '#e0e0e0', alignSelf: 'center' }}></div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', background: step === 2 ? '#1976d2' : '#f5f5f5', color: step === 2 ? 'white' : '#999' }}>2</div>
        </div>

        {error && (
          <div style={{ background: error.includes('resent') ? '#e8f5e9' : '#fff0f0', color: error.includes('resent') ? '#2e7d32' : '#d32f2f', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Step 1: Employee ID + Phone */}
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Employee ID</label>
              <input type="text" required placeholder="e.g. EMP12345" value={form.employeeId}
                onChange={e => setForm({ ...form, employeeId: e.target.value })}
                style={inputStyle} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Registered Phone Number</label>
              <input type="tel" required placeholder="e.g. 9876543210" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                style={inputStyle} />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#ccc' : '#1976d2', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '14px', color: '#666' }}>
              OTP sent to <strong>+91 {form.phone}</strong>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Enter OTP</label>
              <input type="text" required placeholder="Enter 6-digit OTP" maxLength={6} value={form.otp}
                onChange={e => setForm({ ...form, otp: e.target.value })}
                style={{ ...inputStyle, textAlign: 'center', fontSize: '22px', letterSpacing: '8px', fontWeight: '700' }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#ccc' : '#1976d2', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '12px' }}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <div style={{ textAlign: 'center' }}>
              <button type="button" onClick={handleResendOTP}
                style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                Resend OTP
              </button>
              <span style={{ color: '#ccc', margin: '0 8px' }}>|</span>
              <button type="button" onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '14px' }}>
                Change Number
              </button>
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0f0f0', fontSize: '14px', color: '#666' }}>
          Don't have credentials? <span style={{ color: '#1976d2', fontWeight: '500' }}>Contact your HR department</span>
        </div>
        <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '13px' }}>
          <Link to="/corporate/hr/login" style={{ color: '#999', textDecoration: 'none' }}>HR Login →</Link>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  border: '2px solid #e0e0e0',
  borderRadius: '10px',
  fontSize: '16px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};

export default EmployeeLogin;