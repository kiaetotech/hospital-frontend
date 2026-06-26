import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorLogin } from '../../services/onlineDoctorApi';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await doctorLogin(form);
      localStorage.setItem('doctorToken', response.data?.token);
      localStorage.setItem('doctorData', JSON.stringify(response.data?.doctor));
      navigate('/online-doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-gray-800">Doctor Login</h1>
            <p className="text-gray-500 mt-2">Access your consultation dashboard</p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email Address" className="w-full border-2 rounded-2xl px-5 py-4 outline-none focus:border-blue-400 transition" required />
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full border-2 rounded-2xl px-5 py-4 outline-none focus:border-blue-400 transition" required />
            <button type="submit" disabled={loading} className={`w-full py-4 rounded-2xl font-bold text-white transition shadow-lg ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Not registered? <Link to="/online-doctor/register" className="text-blue-600 hover:underline font-medium">Register as Doctor</Link>
          </p>
          <p className="text-center mt-2">
            <Link to="/online-doctor" className="text-gray-400 text-sm hover:underline">← Back to Online Doctor</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;