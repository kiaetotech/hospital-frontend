import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

// ─── Branding map — one entry per provider type ───
const PROVIDER_CONFIG = {
  patient:              { label: 'Patient',            icon: '👤', primary: '#e53935', gradient: 'linear-gradient(135deg, #e53935, #c62828)', login: '/login' },
  homeopathy_doctor:    { label: 'Homeopathy Doctor',  icon: '🌿', primary: '#059669', gradient: 'linear-gradient(135deg, #4c1d95, #059669)', login: '/homeopathy/doctor/login' },
  homeopathy_center:    { label: 'Naturopathy Center', icon: '🏥', primary: '#7c3aed', gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)', login: '/homeopathy/center/login' },
  homeopathy_pharmacy:  { label: 'Homeopathy Pharmacy',icon: '💊', primary: '#dc2626', gradient: 'linear-gradient(135deg, #7c3aed, #dc2626)', login: '/homeopathy/pharmacy/login' },
  ayurveda_doctor:      { label: 'Ayurveda Doctor',    icon: '🌱', primary: '#d97706', gradient: 'linear-gradient(135deg, #78350f, #d97706)', login: '/ayurveda/doctor/login' },
  ayurveda_center:      { label: 'Wellness Center',    icon: '🧘', primary: '#d97706', gradient: 'linear-gradient(135deg, #78350f, #d97706)', login: '/ayurveda/wellness-center/login' },
  online_doctor:        { label: 'Online Doctor',      icon: '🩺', primary: '#2563eb', gradient: 'linear-gradient(135deg, #1e3a8a, #2563eb)', login: '/online-doctor/doctor/login' },
  mental_therapist:     { label: 'Therapist',          icon: '🧠', primary: '#7c3aed', gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)', login: '/mentalhealth/therapist/login' },
  ambulance_provider:   { label: 'Ambulance Provider', icon: '🚑', primary: '#dc2626', gradient: 'linear-gradient(135deg, #7f1d1d, #dc2626)', login: '/ambulance/login' },
  caregiver:            { label: 'Caregiver',          icon: '👨‍⚕️', primary: '#0891b2', gradient: 'linear-gradient(135deg, #164e63, #0891b2)', login: '/caregivers/login' },
  hospital:             { label: 'Hospital',           icon: '🏥', primary: '#0284c7', gradient: 'linear-gradient(135deg, #0c4a6e, #0284c7)', login: '/hospitals/login' },
  diagnostics:          { label: 'Diagnostics Provider',icon: '🔬', primary: '#7c3aed', gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)', login: '/diagnostics/login' },
  insurance_company:    { label: 'Insurance Company',  icon: '🛡️', primary: '#0369a1', gradient: 'linear-gradient(135deg, #0c4a6e, #0369a1)', login: '/insurance/company/login' },
  lender:               { label: 'Lender',             icon: '💰', primary: '#16a34a', gradient: 'linear-gradient(135deg, #14532d, #16a34a)', login: '/lender/login' },
  corporate_hr:         { label: 'Corporate HR',       icon: '🏢', primary: '#4f46e5', gradient: 'linear-gradient(135deg, #312e81, #4f46e5)', login: '/corporate/hr/login' },
  corporate_employee:   { label: 'Employee',           icon: '👤', primary: '#4f46e5', gradient: 'linear-gradient(135deg, #312e81, #4f46e5)', login: '/corporate/employee/login' },
};

const ProviderForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'patient';
  const config = PROVIDER_CONFIG[userType] || PROVIDER_CONFIG.patient;

  const [step, setStep] = useState('contact');
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const contactBody = () => {
    const isEmail = contact.includes('@');
    return isEmail
      ? { email: contact.trim().toLowerCase(), userType }
      : { phone: contact.trim(), userType };
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', contactBody());
      if (res.data?.success) {
        setMessage(res.data.message || 'OTP sent.');
        setStep('otp');
      } else {
        setError(res.data?.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/verify-reset-otp', { ...contactBody(), otp: otp.trim() });
      if (res.data?.success) {
        setResetToken(res.data.resetToken);
        setStep('password');
        setMessage('OTP verified. Set your new password.');
      } else {
        setError(res.data?.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { resetToken, newPassword });
      if (res.data?.success) {
        setStep('done');
        setTimeout(() => navigate(config.login), 2500);
      } else {
        setError(res.data?.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{ background: config.gradient, fontFamily: 'system-ui, sans-serif' }}>
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl">
        <button onClick={() => navigate(config.login)} className="text-sm text-slate-600 bg-transparent border-none cursor-pointer mb-3 p-0">
          ← Back to Login
        </button>

        <div className="text-center mb-6">
          <span className="text-5xl block">{step === 'done' ? '✅' : config.icon}</span>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-800">
            {step === 'contact' && 'Forgot Password?'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'password' && 'Set New Password'}
            {step === 'done' && 'Password Reset'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {step === 'contact' && `Enter your phone or email for ${config.label}`}
            {step === 'otp' && 'Enter the 6-digit OTP sent to you'}
            {step === 'password' && 'Choose a strong new password'}
            {step === 'done' && 'Redirecting to login...'}
          </p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center font-medium">{error}</div>}
        {message && step !== 'done' && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center font-medium">{message}</div>}

        {step === 'contact' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Phone or Email</label>
              <input type="text" placeholder="9876543210 or you@example.com" value={contact}
                onChange={(e) => { setContact(e.target.value); setError(''); }}
                className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-500 transition-colors" required />
            </div>
            <button type="submit" disabled={loading || !contact.trim()}
              className="w-full py-3.5 rounded-xl text-white font-bold text-base"
              style={{ backgroundColor: loading ? '#a7f3d0' : config.primary, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Sending...' : 'Send Reset OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Enter OTP</label>
              <input type="text" inputMode="numeric" placeholder="6-digit OTP" value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                maxLength={6}
                className="w-full p-3 border-2 border-slate-200 rounded-xl text-center text-2xl tracking-widest outline-none focus:border-green-500 transition-colors" required />
            </div>
            <button type="submit" disabled={loading || otp.length !== 6}
              className="w-full py-3.5 rounded-xl text-white font-bold text-base"
              style={{ backgroundColor: loading ? '#a7f3d0' : config.primary, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">New Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Minimum 8 characters" value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  className="w-full p-3 pr-12 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-500 transition-colors" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg bg-transparent border-none cursor-pointer">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Uppercase, lowercase and a number required</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Confirm Password</label>
              <input type="password" placeholder="Re-enter password" value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-500 transition-colors" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-base"
              style={{ backgroundColor: loading ? '#a7f3d0' : config.primary, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="text-center py-5">
            <p className="text-green-700 font-semibold mb-3">Password reset successful!</p>
            <Link to={config.login} className="font-bold" style={{ color: config.primary }}>Go to Login →</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderForgotPassword;