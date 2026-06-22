import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderRegistrationLayout from '../../components/ProviderRegistrationLayout';
import api from '../../services/api';

const DiagnosticsRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    type: 'diagnostic_lab',
    email: '',
    phone: '',
    address: { line1: '', city: '', state: '', pincode: '' },
    facilities: [],
    tests: [],
    packages: [],
    password: '',
    confirmPassword: ''
  });

  const steps = ['Lab Details', 'Contact', 'Facilities', 'Tests', 'Packages', 'Password'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await api.post('/diagnostics/register', formData);
      if (response.data.success) {
        alert('Lab registration submitted! Please wait for verification.');
        navigate('/diagnostics/login');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProviderRegistrationLayout
      title="Diagnostics Lab Registration"
      subtitle="Register your diagnostic lab"
      icon="🔬"
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem' }}>Lab Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem' }}>Registration Number *</label>
            <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} style={inputStyle} required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem' }}>Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem' }}>Phone *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} required />
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

export default DiagnosticsRegister;