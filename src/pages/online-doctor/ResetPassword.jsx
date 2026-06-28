import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/online-doctor/doctor/reset-password/${token}`, { password });
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/online-doctor/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 mt-2">Enter your new password</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 text-sm flex items-center gap-3"><span>⚠️</span><span>{error}</span></div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl mb-6 text-sm flex items-center gap-3"><span>✅</span><span>{success}</span></div>}

          {!success && (
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters" autoComplete="new-password"
                    className="w-full border-2 border-gray-200 rounded-2xl pl-12 pr-14 py-4 outline-none focus:border-blue-500 transition" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password" autoComplete="new-password"
                  className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition" />
              </div>
              <button type="submit" disabled={loading}
                className={`w-full py-4 rounded-2xl font-bold text-white transition shadow-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-xl'}`}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="text-center mt-6">
            <Link to="/online-doctor/login" className="text-gray-500 hover:text-gray-700 text-sm">← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;