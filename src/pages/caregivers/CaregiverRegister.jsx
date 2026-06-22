import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderRegistrationLayout from '../../components/ProviderRegistrationLayout';
import api from '../../services/api';

const CaregiverRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    name: '',
    gender: 'female',
    age: '',
    phone: '',
    email: '',
    address: '',
    
    // Step 2: Qualifications
    specialization: 'elder_care',
    experience: '',
    qualifications: [],
    
    // Step 3: Services
    services: [],
    
    // Step 4: Pricing
    hourlyRate: '',
    dailyRate: '',
    
    // Step 5: Availability
    availableTimings: '24x7',
    serviceArea: [],
    
    // Step 6: Documents
    documents: [],
    
    // Step 7: Password
    password: '',
    confirmPassword: ''
  });

  const steps = [
    'Personal Info',
    'Qualifications',
    'Services',
    'Pricing',
    'Availability',
    'Documents',
    'Password'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayAdd = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], item]
    }));
  };

  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await api.post('/caregivers/register', formData);
      if (response.data.success) {
        alert('Registration submitted! Please wait for verification.');
        navigate('/caregiver/login');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 0:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>👤 Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🎓 Qualifications & Experience</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Specialization *</label>
                <select name="specialization" value={formData.specialization} onChange={handleChange} style={inputStyle}>
                  <option value="elder_care">Elder Care</option>
                  <option value="child_care">Child Care</option>
                  <option value="patient_care">Patient Care</option>
                  <option value="disability_care">Disability Care</option>
                  <option value="post_surgery">Post-Surgery Care</option>
                  <option value="dementia_care">Dementia Care</option>
                  <option value="palliative_care">Palliative Care</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Experience (years)</label>
                <input type="number" name="experience" value={formData.experience} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Qualifications / Certifications</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" placeholder="e.g., B.Sc Nursing" id="qualification" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => {
                  const val = document.getElementById('qualification').value;
                  if (val) { handleArrayAdd('qualifications', val); document.getElementById('qualification').value = ''; }
                }} style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Add</button>
              </div>
              {formData.qualifications.length > 0 && formData.qualifications.map((q, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span>✅ {q}</span>
                  <button onClick={() => handleArrayRemove('qualifications', i)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📋 Services Offered</h3>
            <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Select services you provide</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {['24x7 Care', 'Day Care', 'Night Care', 'Hourly Care', 'Live-in Care', 'Live-out Care', 'Respite Care', 'Companionship', 'Medication Management', 'Vital Monitoring', 'Mobility Assistance', 'Feeding Assistance', 'Bathing Assistance', 'Housekeeping'].map(service => (
                <label key={service} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.services.includes(service)} onChange={(e) => {
                    if (e.target.checked) handleArrayAdd('services', service);
                    else handleArrayRemove('services', formData.services.indexOf(service));
                  }} />
                  {service}
                </label>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>💰 Pricing</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Hourly Rate (₹) *</label>
                <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Daily Rate (₹) *</label>
                <input type="number" name="dailyRate" value={formData.dailyRate} onChange={handleChange} style={inputStyle} required />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📍 Availability & Service Area</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Available Timings</label>
                <select name="availableTimings" value={formData.availableTimings} onChange={handleChange} style={inputStyle}>
                  <option value="24x7">24x7</option>
                  <option value="day">Day (6 AM - 6 PM)</option>
                  <option value="night">Night (6 PM - 6 AM)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Service Area</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" placeholder="City/Area" id="caregiverArea" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => {
                  const val = document.getElementById('caregiverArea').value;
                  if (val) { handleArrayAdd('serviceArea', val); document.getElementById('caregiverArea').value = ''; }
                }} style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Add</button>
              </div>
              {formData.serviceArea.map((area, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span>📍 {area}</span>
                  <button onClick={() => handleArrayRemove('serviceArea', i)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Complete remaining steps...</div>;
    }
  };

  return (
    <ProviderRegistrationLayout
      title="Caregiver Registration"
      subtitle="Register as a caregiver on our platform"
      icon="🏠"
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      loading={loading}
      onSubmit={handleSubmit}
    >
      {renderStep()}
    </ProviderRegistrationLayout>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.6rem',
  borderRadius: '0.5rem',
  border: '1px solid #e5e7eb',
  fontSize: '0.9rem',
  backgroundColor: 'white',
  outline: 'none',
  transition: 'border-color 0.2s'
};

export default CaregiverRegister;