import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { FaUserMd, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.phone || form.phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (!form.password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      // Backend endpoint: POST /api/ayurveda/doctor/login
      // Uses phone + password (not email)
      const response = await api.post('/ayurveda/doctor/login', {
        phone: form.phone,
        password: form.password
      });

      if (response.data.success) {
        // Clear any existing patient session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('patientToken');
        localStorage.removeItem('center');
        localStorage.removeItem('centerToken');
        localStorage.removeItem('providerToken');
        localStorage.removeItem('providerId');
        localStorage.removeItem('providerType');
        
        // Save doctor session with SEPARATE keys
        localStorage.setItem('doctorToken', response.data.token);
        localStorage.setItem('doctor', JSON.stringify({
          id: response.data.doctor.id,
          name: response.data.doctor.name,
          specialization: response.data.doctor.specialization
        }));
        
        // Navigate to dashboard
        navigate('/ayurveda/doctor/dashboard');
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/ayurveda')}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4"
        >
          <FaArrowLeft /> Back to Ayurveda
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaUserMd className="text-3xl" />
            </div>
            <h1 className="text-2xl font-bold">Doctor Login</h1>
            <p className="text-green-100 text-sm mt-1">Access your Ayurveda dashboard</p>
          </div>

          <div className="p-6">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400 font-medium">+91</span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    className="w-full pl-12 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/ayurveda/doctor/register" className="text-green-600 font-semibold hover:text-green-700">
                  Register Here
                </Link>
              </p>
            </div>

            {/* Help */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
              <p className="text-xs text-gray-600">
                New registrations are verified within 24-48 hours.
                <br />
                For help, contact support@hospitalhub.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;