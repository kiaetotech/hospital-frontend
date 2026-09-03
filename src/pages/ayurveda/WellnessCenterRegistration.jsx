import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { FaBuilding, FaPhone, FaEnvelope, FaLock, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const WellnessCenterRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'Wellness Center',
    description: '',
    city: '',
    state: '',
    bedCount: '',
    panchakarmaRooms: '',
    doctorCount: '',
    facilities: [],
    nearestAirport: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!form.name || form.name.length < 3) return 'Center name must be at least 3 characters';
    if (!form.phone || form.phone.length !== 10) return 'Enter valid 10-digit phone number';
    if (!form.email || !form.email.includes('@')) return 'Enter valid email';
    if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    if (!form.city) return 'City is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/ayurveda-centers/register', {
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        type: form.type,
        description: form.description,
        address: {
          city: form.city,
          state: form.state || form.city
        },
        bedCount: parseInt(form.bedCount) || 0,
        panchakarmaRooms: parseInt(form.panchakarmaRooms) || 0,
        doctorCount: parseInt(form.doctorCount) || 0,
        facilities: form.facilities,
        nearestAirport: form.nearestAirport
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/ayurveda/center/login'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <FaCheckCircle className="text-6xl text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Registration Submitted!</h1>
          <p className="text-gray-600 mb-4">Your center will be verified within 24-48 hours.</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <button onClick={() => navigate('/ayurveda')} className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6">
          <FaArrowLeft /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-700 to-green-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <FaBuilding className="text-4xl" />
              <div>
                <h1 className="text-2xl font-bold">Wellness Center Registration</h1>
                <p className="text-green-100 text-sm">Join HospitalHub Ayurveda Network</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Center Name *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="e.g., AyurVeda Retreat" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input type="tel" name="phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value.replace(/\D/g,'').slice(0,10)})} className="w-full p-2.5 border rounded-lg" placeholder="10-digit mobile" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select name="type" value={form.type} onChange={handleChange} className="w-full p-2.5 border rounded-lg">
                  <option value="Wellness Center">Wellness Center</option>
                  <option value="Retreat">Retreat</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Panchakarma Center">Panchakarma Center</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input type="text" name="state" value={form.state} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Beds</label>
                <input type="number" name="bedCount" value={form.bedCount} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Panchakarma Rooms</label>
                <input type="number" name="panchakarmaRooms" value={form.panchakarmaRooms} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="3" className="w-full p-2.5 border rounded-lg" placeholder="Describe your center..." />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400">
              {loading ? 'Submitting...' : 'Register Center'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already registered? <Link to="/ayurveda/center/login" className="text-green-600 font-semibold">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WellnessCenterRegistration;