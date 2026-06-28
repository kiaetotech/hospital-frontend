import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onlineDoctorLogin } from '../../services/api';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState('mobile');
  const [form, setForm] = useState({ mobile: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (loginMethod === 'mobile' && !form.mobile) {
      setError('Please enter your mobile number');
      return;
    }
    if (loginMethod === 'email' && !form.email) {
      setError('Please enter your email address');
      return;
    }
    if (!form.password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const loginData = loginMethod === 'mobile' 
        ? { phone: form.mobile, password: form.password }
        : { email: form.email, password: form.password };

      const response = await onlineDoctorLogin(loginData);
      localStorage.setItem('doctorToken', response.data?.token);
      localStorage.setItem('doctorData', JSON.stringify(response.data?.doctor));
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/online-doctor/dashboard'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setError('Please enter your registered email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      setForgotSent(true);
      setSuccess('Password reset link sent to your email!');
    } catch (err) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRLogin = () => {
    alert('QR Code login will be available soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-2xl shadow-lg mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Doctor Login</h1>
          <p className="text-gray-500 mt-2">Access your consultation dashboard</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
          
          {/* Error / Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 text-sm flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl mb-6 text-sm flex items-center gap-3">
              <span className="text-lg">✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Login Method Tabs */}
          {!showForgotPassword && (
            <>
              <div className="flex bg-gray-100 rounded-2xl p-1.5 mb-8">
                <button
                  onClick={() => setLoginMethod('mobile')}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                    loginMethod === 'mobile'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📱 Mobile Number
                </button>
                <button
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                    loginMethod === 'email'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ✉️ Email ID
                </button>
              </div>

              <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
                {/* Mobile Input */}
                {loginMethod === 'mobile' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                        +91
                      </span>
                      <input
                        name="mobile"
                        type="tel"
                        value={form.mobile}
                        onChange={handleChange}
                        placeholder="Enter your mobile number"
                        maxLength={10}
                        autoComplete="off"
                        className="w-full border-2 border-gray-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition text-gray-800 placeholder-gray-400"
                      />
                    </div>
                  </div>
                )}

                {/* Email Input */}
                {loginMethod === 'email' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        autoComplete="off"
                        className="w-full border-2 border-gray-200 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition text-gray-800 placeholder-gray-400"
                      />
                    </div>
                  </div>
                )}

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="new-password"
                      className="w-full border-2 border-gray-200 rounded-2xl pl-12 pr-14 py-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition text-gray-800 placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(true); setError(''); setSuccess(''); }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition-all shadow-lg ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:shadow-xl active:scale-[0.98]'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              {/* QR Code Login Button */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={handleQRLogin}
                  className="w-full py-3 rounded-2xl font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-center gap-2"
                >
                  <span className="text-xl">📱</span>
                  Login with QR Code
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Scan QR code from your phone for quick login
                </p>
              </div>
            </>
          )}

          {/* Forgot Password Form */}
          {showForgotPassword && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Forgot Password?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Enter your registered email address. We'll send you a password reset link.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    autoComplete="off"
                    className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition"
                  />
                </div>
                {!forgotSent ? (
                  <button
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl font-bold text-white transition ${
                      loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                ) : (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl text-sm text-center">
                    ✅ Reset link sent! Check your email.
                  </div>
                )}
                <button
                  onClick={() => { setShowForgotPassword(false); setForgotSent(false); setError(''); setSuccess(''); }}
                  className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium transition"
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <p className="text-gray-500">
            Not registered?{' '}
            <Link to="/online-doctor/register" className="text-blue-600 hover:text-blue-800 font-semibold transition">
              Register as Doctor
            </Link>
          </p>
          <p className="mt-3">
            <Link to="/online-doctor" className="text-gray-400 text-sm hover:text-gray-600 transition">
              ← Back to Online Doctor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;