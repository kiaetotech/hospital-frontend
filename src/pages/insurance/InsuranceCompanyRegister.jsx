import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderRegistrationLayout from '../../components/ProviderRegistrationLayout';
import api from '../../services/api';

const InsuranceCompanyRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    registrationNumber: '',
    irdaRegistration: '',
    gstNumber: '',
    panNumber: '',
    email: '',
    phone: '',
    website: '',
    address: { line1: '', city: '', state: '', pincode: '' },
    commissionRate: '15',
    password: '',
    confirmPassword: ''
  });

  const steps = ['Company Details', 'Contact', 'Commission', 'Password'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await api.post('/insurance/company/register', formData);
      if (response.data.success) {
        alert('Insurance company registration submitted! Please wait for verification.');
        navigate('/insurance/company/login');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProviderRegistrationLayout
      title="Insurance Company Registration"
      subtitle="Register your insurance company"
      icon="🛡️"
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem' }}>Company Name *</label>
            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} style={inputStyle} required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem' }}>Registration Number *</label>
            <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} style={inputStyle} required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem' }}>IRDA Registration *</label>
            <input type="text" name="irdaRegistration" value={formData.irdaRegistration} onChange={handleChange} style={inputStyle} required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem' }}>GST Number</label>
            <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem' }}>Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem' }}>Phone *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem' }}>Website</label>
            <input type="url" name="website" value={formData.website} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem' }}>Commission Rate (%)</label>
            <input type="number" name="commissionRate" value={formData.commissionRate} onChange={handleChange} style={inputStyle} />
          </div>
        </div>
      </div>
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
  outline: 'none'
};

export default InsuranceCompanyRegister;

