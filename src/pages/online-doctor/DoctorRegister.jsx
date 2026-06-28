import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onlineDoctorRegister } from '../../services/api';

const DoctorRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  
  const [form, setForm] = useState({
    // Step 1: Personal
    name: '', mobile: '', email: '', password: '', confirmPassword: '', gender: 'Male',
    // Step 2: Professional
    specialization: '', qualification: '', experience: '', registrationNumber: '',
    consultationFee: '', languages: '',
    // Step 3: About
    about: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
    
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[!@#$%^&*]/.test(pass)) strength++;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  const handleSendOTP = async () => {
    if (!form.mobile || form.mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    try {
      // await api.post('/otp/send', { phone: form.mobile });
      setOtpSent(true);
      setSuccess('OTP sent to your mobile number! (Use 123456 for testing)');
    } catch (err) {
      setError('Failed to send OTP');
    }
  };

  const handleVerifyOTP = () => {
    if (otp === '123456' || otp.length === 6) {
      setOtpVerified(true);
      setSuccess('Mobile number verified!');
      setError('');
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const validateStep1 = () => {
    if (!form.name || form.name.length < 3) {
      setError('Full name is required (minimum 3 characters)');
      return false;
    }
    if (!form.mobile || form.mobile.length !== 10) {
      setError('Valid 10-digit mobile number is required');
      return false;
    }
    if (!otpVerified) {
      setError('Please verify your mobile number with OTP');
      return false;
    }
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      setError('Valid email address is required');
      return false;
    }
    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.specialization) {
      setError('Specialization is required');
      return false;
    }
    if (!form.qualification) {
      setError('Qualification is required');
      return false;
    }
    if (!form.registrationNumber) {
      setError('Registration number is required');
      return false;
    }
    if (!form.consultationFee || parseInt(form.consultationFee) <= 0) {
      setError('Valid consultation fee is required');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    setSuccess('');
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    setError('');
    setSuccess('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = {
        name: form.name,
        email: form.email,
        phone: form.mobile,
        password: form.password,
        specialization: form.specialization,
        qualification: form.qualification,
        experience: parseInt(form.experience) || 0,
        registrationNumber: form.registrationNumber,
        consultationFee: parseInt(form.consultationFee),
        languages: form.languages.split(',').map(l => l.trim()).filter(l => l),
        gender: form.gender,
        about: form.about
      };
      await onlineDoctorRegister(data);
      setSuccess('Registration submitted! Redirecting to login...');
      setTimeout(() => navigate('/online-doctor/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const specialtiesList = [
    'General Physician', 'Dermatologist', 'Gynecologist', 'Pediatrician',
    'Cardiologist', 'Neurologist', 'Orthopedic', 'ENT Specialist',
    'Psychiatrist', 'Gastroenterologist', 'Endocrinologist', 'Nephrologist',
    'Oncologist', 'Pulmonologist', 'Rheumatologist', 'Urologist',
    'Ophthalmologist', 'Dentist', 'Physiotherapist', 'Nutritionist'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">👨‍⚕️</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Join as Doctor</h1>
          <p className="text-gray-500 mt-2">Start consulting patients online in minutes</p>
        </div>

        {/* Step Progress */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            {['Personal', 'Professional', 'Review'].map((label, index) => (
              <div key={label} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                  step > index + 1 ? 'bg-green-500 text-white' :
                  step === index + 1 ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > index + 1 ? '✓' : index + 1}
                </div>
                <span className={`ml-2 text-xs font-medium hidden sm:block ${
                  step === index + 1 ? 'text-blue-600' : 'text-gray-400'
                }`}>{label}</span>
                {index < 2 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition ${
                    step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 rounded-full h-2 transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
          
          {/* Error / Success */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 text-sm flex items-center gap-3">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl mb-6 text-sm flex items-center gap-3">
              <span>✅</span><span>{success}</span>
            </div>
          )}

          {/* STEP 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">1</span>
                Personal Information
              </h2>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Dr. Your Full Name"
                  className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition" />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <div className="flex gap-3">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button key={g} type="button" onClick={() => setForm({ ...form, gender: g })}
                      className={`flex-1 py-3 rounded-2xl font-medium text-sm transition border-2 ${
                        form.gender === g ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>{g}</button>
                  ))}
                </div>
              </div>

              {/* Mobile with OTP */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">+91</span>
                    <input name="mobile" type="tel" value={form.mobile} onChange={handleChange}
                      placeholder="10-digit number" maxLength={10} disabled={otpVerified}
                      className="w-full border-2 border-gray-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500 transition disabled:bg-gray-50" />
                  </div>
                  {!otpSent ? (
                    <button type="button" onClick={handleSendOTP}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-4 rounded-2xl font-semibold text-sm transition whitespace-nowrap">
                      Send OTP
                    </button>
                  ) : !otpVerified ? (
                    <button type="button" onClick={handleSendOTP}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-4 rounded-2xl font-semibold text-sm transition whitespace-nowrap">
                      Resend
                    </button>
                  ) : (
                    <span className="bg-green-100 text-green-700 px-4 py-4 rounded-2xl font-semibold text-sm whitespace-nowrap">✓ Verified</span>
                  )}
                </div>
              </div>

              {/* OTP Input */}
              {otpSent && !otpVerified && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
                  <div className="flex gap-2">
                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                      placeholder="6-digit OTP" maxLength={6}
                      className="flex-1 border-2 border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition text-center text-2xl tracking-widest" />
                    <button type="button" onClick={handleVerifyOTP}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-2xl font-semibold transition">
                      Verify
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Use 123456 for testing</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="doctor@example.com"
                  className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition" />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange}
                    placeholder="Min 6 characters" minLength={6}
                    className="w-full border-2 border-gray-200 rounded-2xl px-5 pr-14 py-4 outline-none focus:border-blue-500 transition" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= passwordStrength ? getPasswordStrengthColor() : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${passwordStrength <= 2 ? 'text-red-500' : passwordStrength <= 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {getPasswordStrengthText()}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                <div className="relative">
                  <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full border-2 border-gray-200 rounded-2xl px-5 pr-14 py-4 outline-none focus:border-blue-500 transition" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl">
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <p className="text-green-500 text-xs mt-1">✓ Passwords match</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Professional Details */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">2</span>
                Professional Details
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization *</label>
                <select name="specialization" value={form.specialization} onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition">
                  <option value="">Select Specialization</option>
                  {specialtiesList.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification *</label>
                <input name="qualification" value={form.qualification} onChange={handleChange}
                  placeholder="e.g., MBBS, MD (Dermatology)"
                  className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Experience (Years)</label>
                  <input name="experience" type="number" value={form.experience} onChange={handleChange}
                    placeholder="e.g., 10" min="0" max="60"
                    className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Fee (₹) *</label>
                  <input name="consultationFee" type="number" value={form.consultationFee} onChange={handleChange}
                    placeholder="e.g., 500" min="0"
                    className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Number *</label>
                <input name="registrationNumber" value={form.registrationNumber} onChange={handleChange}
                  placeholder="MCI / State Medical Council Registration Number"
                  className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Languages</label>
                <input name="languages" value={form.languages} onChange={handleChange}
                  placeholder="e.g., Hindi, English, Tamil (comma separated)"
                  className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition" />
              </div>
            </div>
          )}

          {/* STEP 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">3</span>
                Review Your Profile
              </h2>

              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500">Name</span>
                  <span className="font-semibold text-gray-800">Dr. {form.name}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500">Mobile</span>
                  <span className="font-semibold text-gray-800">+91 {form.mobile} ✓</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500">Email</span>
                  <span className="font-semibold text-gray-800">{form.email}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500">Specialization</span>
                  <span className="font-semibold text-gray-800">{form.specialization}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500">Qualification</span>
                  <span className="font-semibold text-gray-800">{form.qualification}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500">Experience</span>
                  <span className="font-semibold text-gray-800">{form.experience || '0'} years</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500">Consultation Fee</span>
                  <span className="font-semibold text-green-600">₹{form.consultationFee}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500">Reg. Number</span>
                  <span className="font-semibold text-gray-800">{form.registrationNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500">Languages</span>
                  <span className="font-semibold text-gray-800">{form.languages || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gender</span>
                  <span className="font-semibold text-gray-800">{form.gender}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">About Yourself (Optional)</label>
                <textarea name="about" value={form.about} onChange={handleChange}
                  placeholder="Tell patients about your experience and approach..."
                  rows={4} className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition resize-none" />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={handleBack}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 rounded-2xl font-bold transition">
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition shadow-lg">
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className={`flex-1 py-4 rounded-2xl font-bold text-white transition shadow-lg ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                }`}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : '✓ Complete Registration'}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 mt-6">
          Already registered?{' '}
          <Link to="/online-doctor/login" className="text-blue-600 hover:text-blue-800 font-semibold transition">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default DoctorRegister;