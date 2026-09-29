import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.phone || !form.password) {
      setError('Please enter phone and password');
      return;
    }

    setLoading(true);
    try {
      // Homeopathy-specific login (matches backend routes/homeopathy-advanced.js)
      const res = await api.post('/homeopathy/doctor/login', {
        phone: form.phone.trim(),
        password: form.password
      });

      if (!res.data?.success || !res.data?.token || !res.data?.doctor) {
        setError(res.data?.error || res.data?.message || 'Login failed');
        setLoading(false);
        return;
      }

      // Store using Ayurveda-style keys (doctorToken + doctor JSON)
      const doctor = {
        _id: res.data.doctor.id || res.data.doctor._id,
        id: res.data.doctor.id || res.data.doctor._id,
        name: res.data.doctor.name,
        specialization: res.data.doctor.specialization
      };

      localStorage.setItem('doctorToken', res.data.token);
      localStorage.setItem('doctor', JSON.stringify(doctor));
      localStorage.setItem('providerType', 'homeopathy_doctor');

      navigate('/homeopathy/doctor/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const c = '#059669'; // Homeopathy green (matches Hub / Doctors / Pharmacy)

  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{ background: 'linear-gradient(135deg, #4c1d95, #059669)', fontFamily: 'system-ui, sans-serif' }}>
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <span className="text-5xl block">🌿</span>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-800">Homeopathy Doctor Login</h2>
          <p className="text-sm text-slate-500 mt-1">Access your doctor dashboard</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Phone Number</label>
            <input
              type="tel"
              placeholder="10-digit phone number"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
              className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-500 transition-colors"
              autoComplete="tel"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full p-3 pr-12 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-500 transition-colors"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg bg-transparent border-none cursor-pointer"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-bold text-base transition-opacity"
            style={{ backgroundColor: loading ? '#a7f3d0' : c, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/homeopathy/doctor/register" className="text-green-600 font-bold no-underline">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;