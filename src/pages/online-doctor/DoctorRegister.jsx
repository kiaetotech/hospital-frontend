import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorRegister } from '../../services/onlineDoctorApi';

const DoctorRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    specialization: '', qualification: '', experience: '', registrationNumber: '',
    consultationFee: '', languages: '', gender: 'Male', about: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validateStep1 = () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError('Please fill all required fields');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.specialization || !form.qualification || !form.registrationNumber || !form.consultationFee) {
      setError('Please fill all required professional details');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = {
        name: form.name, email: form.email, phone: form.phone, password: form.password,
        specialization: form.specialization, qualification: form.qualification,
        experience: parseInt(form.experience) || 0, registrationNumber: form.registrationNumber,
        consultationFee: parseInt(form.consultationFee),
        languages: form.languages.split(',').map(l => l.trim()).filter(l => l),
        gender: form.gender, about: form.about
      };
      await doctorRegister(data);
      setSuccess('Registration submitted! Redirecting to login...');
      setTimeout(() => navigate('/online-doctor/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">👨‍⚕️</div>
            <h1 className="text-3xl font-bold text-gray-800">Join as Doctor</h1>
            <p className="text-gray-500 mt-2">Start consulting patients online</p>
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`w-10 h-1.5 rounded-full transition ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-4 text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-4 rounded-2xl mb-4 text-sm">{success}</div>}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-700">Personal Information</h2>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name *" className="input-field" required />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email Address *" className="input-field" required />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number *" className="input-field" required />
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password *" className="input-field" required />
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password *" className="input-field" required />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-700">Professional Details</h2>
              <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="Specialization (e.g., Dermatologist) *" className="input-field" required />
              <input name="qualification" value={form.qualification} onChange={handleChange} placeholder="Qualification (e.g., MBBS, MD) *" className="input-field" required />
              <input name="experience" type="number" value={form.experience} onChange={handleChange} placeholder="Years of Experience" className="input-field" />
              <input name="registrationNumber" value={form.registrationNumber} onChange={handleChange} placeholder="MCI/State Registration Number *" className="input-field" required />
              <input name="consultationFee" type="number" value={form.consultationFee} onChange={handleChange} placeholder="Consultation Fee (₹) *" className="input-field" required />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-700">Additional Info</h2>
              <input name="languages" value={form.languages} onChange={handleChange} placeholder="Languages (comma separated: Hindi, English)" className="input-field" />
              <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <textarea name="about" value={form.about} onChange={handleChange} placeholder="About yourself (optional)" rows={4} className="input-field resize-none" />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 rounded-2xl font-bold transition">
                Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={handleNext} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition shadow-lg">
                Continue
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className={`flex-1 py-4 rounded-2xl font-bold text-white transition shadow-lg ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
              }`}>
                {loading ? 'Submitting...' : 'Complete Registration'}
              </button>
            )}
          </div>

          <p className="text-center text-gray-500 mt-6">
            Already registered? <Link to="/online-doctor/login" className="text-blue-600 hover:underline font-medium">Login</Link>
          </p>
        </div>
      </div>

      <style>{`.input-field { width: 100%; border: 2px solid #e5e7eb; border-radius: 1rem; padding: 0.875rem 1.25rem; outline: none; transition: border-color 0.2s; } .input-field:focus { border-color: #3b82f6; }`}</style>
    </div>
  );
};

export default DoctorRegister;