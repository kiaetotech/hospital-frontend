import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaIdCard, FaCheck, FaTimes, FaUpload, FaSpinner } from 'react-icons/fa';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-e2cf.up.railway.app';

// Field config per provider type
const FIELD_CONFIGS = {
  doctor: {
    title: 'Doctor KYC',
    endpoint: '/api/homeopathy/doctor/kyc/submit',
    statusEndpoint: (id) => `/api/homeopathy/doctor/kyc/${id}`,
    idField: 'doctorId',
    fields: [
      { key: 'panNumber', label: 'PAN Number', type: 'text', required: true, placeholder: 'ABCDE1234F' },
      { key: 'panImage', label: 'PAN Card Image', type: 'file', required: true },
      { key: 'aadhaarNumber', label: 'Aadhaar Number (last 4 digits)', type: 'text', required: true, placeholder: '9012' },
      { key: 'aadhaarImage', label: 'Aadhaar Image', type: 'file', required: true },
      { key: 'selfie', label: 'Selfie', type: 'file', required: true },
      { key: 'degreeCertificate', label: 'Degree Certificate', type: 'file', required: true },
      { key: 'registrationCertificate', label: 'Registration Certificate', type: 'file', required: true }
    ]
  },
  center: {
    title: 'Center KYC',
    endpoint: '/api/homeopathy/center/kyc/submit',
    statusEndpoint: () => '/api/homeopathy/center/kyc',
    idField: 'centerId',
    authHeader: 'center',
    fields: [
      { key: 'panNumber', label: 'PAN Number', type: 'text', required: true, placeholder: 'ABCDE1234F' },
      { key: 'panImage', label: 'PAN Image', type: 'file', required: true },
      { key: 'gstNumber', label: 'GST Number (optional)', type: 'text', required: false, placeholder: '27AAAAA0000A1Z5' },
      { key: 'gstImage', label: 'GST Certificate (optional)', type: 'file', required: false },
      { key: 'ownerName', label: 'Owner Name', type: 'text', required: true },
      { key: 'ownerAadhaarNumber', label: 'Owner Aadhaar (last 4)', type: 'text', required: true, placeholder: '9012' },
      { key: 'ownerAadhaarImage', label: 'Owner Aadhaar Image', type: 'file', required: true },
      { key: 'businessRegistrationNumber', label: 'Business Registration Number', type: 'text', required: true },
      { key: 'businessRegistrationImage', label: 'Business Registration Image', type: 'file', required: true },
      { key: 'premisesPhoto', label: 'Premises Photo', type: 'file', required: true },
      { key: 'selfie', label: 'Selfie', type: 'file', required: true }
    ]
  },
  pharmacy: {
    title: 'Pharmacy KYC',
    endpoint: '/api/homeopathy/pharmacy/kyc/submit',
    statusEndpoint: (id) => `/api/homeopathy/pharmacy/kyc/${id}`,
    idField: 'pharmacyId',
    fields: [
      { key: 'panNumber', label: 'PAN Number', type: 'text', required: true, placeholder: 'ABCDE1234F' },
      { key: 'panImage', label: 'PAN Image', type: 'file', required: true },
      { key: 'gstNumber', label: 'GST Number (optional)', type: 'text', required: false },
      { key: 'gstImage', label: 'GST Certificate (optional)', type: 'file', required: false },
      { key: 'ownerName', label: 'Owner Name', type: 'text', required: true },
      { key: 'ownerAadhaarNumber', label: 'Owner Aadhaar (last 4)', type: 'text', required: true, placeholder: '9012' },
      { key: 'ownerAadhaarImage', label: 'Owner Aadhaar Image', type: 'file', required: true },
      { key: 'drugLicenseNumber', label: 'Drug License Number', type: 'text', required: true },
      { key: 'drugLicenseImage', label: 'Drug License Image', type: 'file', required: true },
            { key: 'shopPhoto', label: 'Shop Photo', type: 'file', required: true },
      { key: 'selfie', label: 'Selfie', type: 'file', required: true }
    ]
  },
  ayurveda_doctor: {
    title: 'Ayurveda Doctor KYC',
    uploadPath: '/api/ayurveda/kyc/upload',
    endpoint: '/api/ayurveda/doctor/kyc/submit',
    statusEndpoint: (id) => `/api/ayurveda/doctor/kyc/${id}`,
    idField: 'doctorId',
    fields: [
      { key: 'panNumber', label: 'PAN Number', type: 'text', required: true, placeholder: 'ABCDE1234F' },
      { key: 'panCard', label: 'PAN Card Image', type: 'file', required: true },
      { key: 'aadhaarNumber', label: 'Aadhaar Number (last 4 digits)', type: 'text', required: true, placeholder: '9012' },
      { key: 'idProof', label: 'Aadhaar / ID Proof Image', type: 'file', required: true },
      { key: 'selfie', label: 'Selfie', type: 'file', required: true },
      { key: 'degreeCertificate', label: 'Degree Certificate', type: 'file', required: true },
      { key: 'ayushCertificate', label: 'AYUSH Certificate', type: 'file', required: true },
      { key: 'clinicLicense', label: 'Clinic License', type: 'file', required: false },
      { key: 'photo', label: 'Profile Photo', type: 'file', required: false }
    ]
  },
  ayurveda_center: {
    title: 'Wellness Center KYC',
    uploadPath: '/api/ayurveda/kyc/upload',
    endpoint: '/api/ayurveda/center/kyc/submit',
    statusEndpoint: (id) => `/api/ayurveda/center/kyc/${id}`,
    idField: 'centerId',
    fields: [
      { key: 'panNumber', label: 'PAN Number', type: 'text', required: true, placeholder: 'ABCDE1234F' },
      { key: 'panCard', label: 'PAN Image', type: 'file', required: true },
      { key: 'gstNumber', label: 'GST Number (optional)', type: 'text', required: false },
      { key: 'gstCertificate', label: 'GST Certificate (optional)', type: 'file', required: false },
      { key: 'ownerName', label: 'Owner Name', type: 'text', required: true },
      { key: 'aadhaarNumber', label: 'Owner Aadhaar (last 4)', type: 'text', required: true, placeholder: '9012' },
      { key: 'businessRegistrationNumber', label: 'Business Registration Number', type: 'text', required: true },
      { key: 'license', label: 'Center License', type: 'file', required: true },
      { key: 'registration', label: 'Business Registration', type: 'file', required: true },
      { key: 'premisesPhoto', label: 'Premises Photo', type: 'file', required: true },
      { key: 'selfie', label: 'Selfie', type: 'file', required: true }
    ]
  }
};

const KycUploadForm = ({ providerType, providerId, token, tokenKey }) => {
  const config = FIELD_CONFIGS[providerType];
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

    const authHeader = () => {
    return { Authorization: `Bearer ${token}` };
  };

  // Load existing KYC
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE}${config.statusEndpoint(providerId)}`, {
          headers: authHeader()
        });
        if (res.data?.success) setKyc(res.data.data);
      } catch (e) {
        console.warn('KYC load failed:', e.message);
      } finally {
        setLoading(false);
      }
    };
    if (providerId) load();
  }, [providerId]);

  const handleFileUpload = async (fieldKey, file) => {
    setUploading(prev => ({ ...prev, [fieldKey]: true }));
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', fieldKey);
      fd.append('folder', 'kyc_documents');

      const res = await axios.post(`${API_BASE}${config.uploadPath || '/api/homeopathy/kyc/upload'}`, fd, {
        headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setFormData(prev => ({ ...prev, [fieldKey]: res.data.url }));
        setMessage(`✅ ${fieldKey} uploaded`);
      } else {
        setMessage(`❌ Upload failed: ${res.data?.message || 'Unknown'}`);
      }
    } catch (e) {
      setMessage(`❌ Upload error: ${e.response?.data?.message || e.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [fieldKey]: false }));
    }
  };

    const handleSubmit = async () => {
    setSubmitting(true);
    setMessage('');
    try {
      // Start with existing values, then override with changed fields
      const mergedData = {};
      config.fields.forEach(f => {
        mergedData[f.key] = formData[f.key] ?? kyc?.[f.key] ?? '';
      });
      const body = { [config.idField]: providerId, ...mergedData };
      const res = await axios.post(`${API_BASE}${config.endpoint}`, body, {
        headers: authHeader()
      });
      if (res.data?.success) {
        setMessage('✅ KYC submitted for review');
        setKyc(res.data.data);
      } else {
        setMessage(`❌ ${res.data?.message || 'Submission failed'}`);
      }
    } catch (e) {
      setMessage(`❌ ${e.response?.data?.message || e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading KYC...</div>;

  // Already verified
  if (kyc?.kycStatus === 'verified') {
    return (
      <div className="bg-white rounded-xl shadow p-8">
        <div className="text-center">
          <FaCheck className="text-green-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">KYC Verified</h2>
          <p className="text-gray-500 mt-2">Your KYC has been verified on {kyc.verifiedAt ? new Date(kyc.verifiedAt).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
    );
  }

  // Submitted — pending review
  if (kyc?.kycStatus === 'submitted') {
    return (
      <div className="bg-white rounded-xl shadow p-8">
        <div className="text-center">
          <FaSpinner className="text-yellow-500 text-6xl mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-800">Under Review</h2>
          <p className="text-gray-500 mt-2">Your KYC was submitted on {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString() : 'N/A'}</p>
          <p className="text-gray-500">Our team will review it shortly.</p>
        </div>
      </div>
    );
  }

  // Rejected
  const isRejected = kyc?.kycStatus === 'rejected';

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
        <FaIdCard /> {config.title}
      </h2>

      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <FaTimes className="text-red-500 mt-1" />
            <div>
              <strong className="text-red-700">Previous submission rejected</strong>
              <p className="text-red-600 text-sm">{kyc.rejectionReason || 'No reason provided'}</p>
              <p className="text-gray-500 text-xs mt-1">Please correct and resubmit.</p>
            </div>
          </div>
        </div>
      )}

      {message && <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config.fields.map((f) => (
          <div key={f.key} className={f.type === 'file' ? '' : 'md:col-span-1'}>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {f.label} {f.required && <span className="text-red-500">*</span>}
            </label>

            {f.type === 'text' && (
              <input
                type="text"
                placeholder={f.placeholder || ''}
                value={formData[f.key] ?? kyc?.[f.key] ?? ''}
                onChange={(e) => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            )}

            {f.type === 'file' && (
              <div>
                {(formData[f.key] || kyc?.[f.key]) && (
                  <div className="mb-2 flex items-center gap-2 text-sm">
                    <FaCheck className="text-green-500" />
                    <a
                      href={formData[f.key] || kyc?.[f.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 underline"
                    >
                      View uploaded file
                    </a>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer border-2 border-dashed border-gray-300">
                  {uploading[f.key] ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                  <span className="text-sm">{uploading[f.key] ? 'Uploading...' : 'Choose file'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleFileUpload(f.key, e.target.files[0])}
                  />
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
        >
          {submitting ? <><FaSpinner className="animate-spin" /> Submitting...</> : <>Submit KYC</>}
        </button>
      </div>
    </div>
  );
};

export default KycUploadForm;