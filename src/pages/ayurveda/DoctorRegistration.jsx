import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  FaUserMd, FaPhone, FaEnvelope, FaLock, FaGraduationCap,
  FaCertificate, FaCity, FaRupeeSign, FaBuilding, FaStar,
  FaCheckCircle, FaArrowLeft, FaUpload, FaFileImage, FaIdCard
} from 'react-icons/fa';

const DoctorRegistration = () => {
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
    specialization: 'General Ayurveda',
    experience: '',
    education: '',
    ayushRegNo: '',
    city: '',
    state: '',
    consultationFee: '',
    clinicName: '',
    languages: ['Hindi', 'English'],
    about: ''
  });

  // Use ref for immediate access
  const uploadedUrlsRef = useRef({});
  const [uploadedUrls, setUploadedUrls] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  const specializations = [
    'Panchakarma', 'General Ayurveda', 'Kerala Ayurveda',
    'Ayurvedic Dermatology', 'Kayachikitsa', 'Rasayana Therapy',
    'Shalya Tantra', 'Shalakya Tantra', 'Prasuti & Stri Roga',
    'Bal Roga', 'Swasthavritta'
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (field, file) => {
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError(`${field} file is too large. Maximum 2MB allowed.`);
      return;
    }
    
    setUploadProgress(prev => ({ ...prev, [field]: 0 }));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target.result;
      // Update both ref and state
      uploadedUrlsRef.current = { ...uploadedUrlsRef.current, [field]: base64String };
      setUploadedUrls(prev => ({ ...prev, [field]: base64String }));
      setUploadProgress(prev => ({ ...prev, [field]: 100 }));
      console.log(`✅ ${field} uploaded, length: ${base64String.length}`);
    };
    reader.onerror = () => {
      setError(`Failed to read ${field} file`);
      setUploadProgress(prev => ({ ...prev, [field]: -1 }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!form.name || form.name.length < 3) return 'Name must be at least 3 characters';
    if (!form.phone || form.phone.length !== 10) return 'Enter valid 10-digit phone number';
    if (!form.email || !form.email.includes('@')) return 'Enter valid email address';
    if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    if (!form.specialization) return 'Select specialization';
    if (!form.experience || form.experience < 0) return 'Enter valid experience';
    if (!form.education) return 'Education is required';
    if (!form.ayushRegNo) return 'AYUSH Registration Number is required';
    if (!form.city) return 'City is required';
    if (!form.consultationFee || form.consultationFee < 100) return 'Consultation fee must be at least ₹100';
    if (!form.clinicName) return 'Clinic name is required';
    
    // Check documents from ref (not state)
    const docs = uploadedUrlsRef.current;
    if (!docs.ayushCertificate || docs.ayushCertificate.length < 10) {
      return 'AYUSH Certificate is required. Please upload again.';
    }
    if (!docs.idProof || docs.idProof.length < 10) {
      return 'ID Proof is required. Please upload again.';
    }
    
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
      // Get documents from ref (most current)
      const docs = uploadedUrlsRef.current;
      
      const registrationData = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        specialization: form.specialization,
        experience: parseInt(form.experience),
        education: form.education,
        ayushRegNo: form.ayushRegNo,
        consultationFee: parseInt(form.consultationFee),
        city: form.city,
        state: form.state || form.city,
        clinicName: form.clinicName,
        languages: form.languages,
        about: form.about,
        documents: {
          ayushCertificate: docs.ayushCertificate || '',
          degreeCertificate: docs.degreeCertificate || '',
          idProof: docs.idProof || '',
          photo: docs.photo || '',
          clinicLicense: docs.clinicLicense || '',
          panCard: ''
        }
      };

      console.log('📤 Sending registration data...');
      console.log('Documents:', {
        ayushCertificate: docs.ayushCertificate ? '✅ Present' : '❌ Missing',
        idProof: docs.idProof ? '✅ Present' : '❌ Missing',
        degreeCertificate: docs.degreeCertificate ? '✅ Present' : '❌ Missing',
        photo: docs.photo ? '✅ Present' : '❌ Missing'
      });

      const response = await api.post('/ayurveda/doctor/register', registrationData);

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/ayurveda/doctor/login');
        }, 3000);
      } else {
        setError(response.data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const DocumentUploadField = ({ field, label, required, icon: Icon }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      <div className="relative">
        <input
          type="file"
          onChange={(e) => handleFileChange(field, e.target.files[0])}
          accept="image/*,.pdf"
          className="hidden"
          id={`file-${field}`}
        />
        <label
          htmlFor={`file-${field}`}
          className={`flex items-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
            uploadedUrls[field] 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-green-500'
          }`}
        >
          <Icon className={`text-xl ${uploadedUrls[field] ? 'text-green-600' : 'text-gray-400'}`} />
          <span className="text-sm flex-1">
            {uploadedUrls[field] 
              ? '✅ Uploaded successfully' 
              : uploadProgress[field] > 0 
              ? `Uploading... ${uploadProgress[field]}%` 
              : `Click to upload ${label}`}
          </span>
          {!uploadedUrls[field] && <FaUpload className="text-gray-400" />}
        </label>
      </div>
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <FaCheckCircle className="text-6xl text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h1>
          <p className="text-gray-600 mb-4">
            Your application has been submitted for verification.
            You'll be notified once approved (usually within 24-48 hours).
          </p>
          <p className="text-sm text-gray-500 mb-6">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <button
          onClick={() => navigate('/ayurveda')}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6"
        >
          <FaArrowLeft /> Back to Ayurveda
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
            <div className="flex items-center gap-3">
              <FaUserMd className="text-4xl" />
              <div>
                <h1 className="text-2xl font-bold">Doctor Registration</h1>
                <p className="text-green-100 text-sm">Join HospitalHub Ayurveda Network</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Dr. Full Name"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="10-digit mobile"
                    maxLength="10"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="doctor@email.com"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="border-t pt-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Professional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                  <select
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years) *</label>
                  <input
                    type="number"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="e.g., 10"
                    min="0"
                    max="60"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Education *</label>
                  <input
                    type="text"
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                    placeholder="BAMS, MD (Panchakarma)"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AYUSH Registration Number *</label>
                  <input
                    type="text"
                    name="ayushRegNo"
                    value={form.ayushRegNo}
                    onChange={handleChange}
                    placeholder="AYUSH-XX-YYYY-XXXXX"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="border-t pt-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Required Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DocumentUploadField field="ayushCertificate" label="AYUSH Certificate" required icon={FaCertificate} />
                <DocumentUploadField field="idProof" label="ID Proof (Aadhaar/PAN)" required icon={FaIdCard} />
                <DocumentUploadField field="degreeCertificate" label="Degree Certificate" icon={FaGraduationCap} />
                <DocumentUploadField field="photo" label="Profile Photo" icon={FaFileImage} />
              </div>
            </div>

            {/* Clinic Information */}
            <div className="border-t pt-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Clinic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name *</label>
                  <input
                    type="text"
                    name="clinicName"
                    value={form.clinicName}
                    onChange={handleChange}
                    placeholder="Your Clinic Name"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="e.g., Mumbai"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="e.g., Maharashtra"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹) *</label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={form.consultationFee}
                    onChange={handleChange}
                    placeholder="e.g., 500"
                    min="100"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">About You (Optional)</label>
                <textarea
                  name="about"
                  value={form.about}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Brief description of your expertise..."
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting Application...' : 'Submit Registration'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already registered?{' '}
              <Link to="/ayurveda/doctor/login" className="text-green-600 font-semibold hover:text-green-700">
                Login Here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegistration;