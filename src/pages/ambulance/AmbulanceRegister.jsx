import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderRegistrationLayout from '../../components/ProviderRegistrationLayout';
import api from '../../services/api';

const AmbulanceRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Vehicle Details
    vehicleNumber: '',
    type: 'basic',
    model: '',
    year: '',
    capacity: 1,
    
    // Step 2: Equipment
    equipment: [],
    
    // Step 3: Driver
    driverName: '',
    driverPhone: '',
    driverLicense: '',
    driverExperience: '',
    
    // Step 4: Pricing
    baseFare: '',
    perKmRate: '',
    waitingCharge: '',
    nightCharge: '',
    
    // Step 5: Service Area
    serviceArea: [],
    
    // Step 6: Documents
    documents: [],
    
    // Step 7: Password
    password: '',
    confirmPassword: ''
  });

  const steps = [
    'Vehicle Details',
    'Equipment',
    'Driver Details',
    'Pricing',
    'Service Area',
    'Documents',
    'Password'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      const response = await api.post('/ambulance/register', formData);
      if (response.data.success) {
        alert('Ambulance registration submitted! Please wait for verification.');
        navigate('/ambulance/login');
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
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🚑 Vehicle Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Vehicle Number *</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Ambulance Type *</label>
                <select name="type" value={formData.type} onChange={handleChange} style={inputStyle}>
                  <option value="basic">Basic Ambulance</option>
                  <option value="oxygen">Oxygen Ambulance</option>
                  <option value="icu">ICU Ambulance</option>
                  <option value="advanced">Advanced Life Support</option>
                  <option value="neonatal">Neonatal Ambulance</option>
                  <option value="bariatric">Bariatric Ambulance</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="e.g., Mercedes-Benz Sprinter"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Year</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="e.g., 2023"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Patient Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  style={inputStyle}
                  min="1"
                  max="4"
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🛠️ Equipment</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>List equipment available in your ambulance</p>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Equipment Name"
                id="equipment"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => {
                  const name = document.getElementById('equipment').value;
                  if (name) {
                    handleArrayAdd('equipment', name);
                    document.getElementById('equipment').value = '';
                  }
                }}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
              >
                Add
              </button>
            </div>

            {formData.equipment.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                {formData.equipment.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', marginBottom: '0.25rem' }}>
                    <span>✅ {item}</span>
                    <button onClick={() => handleArrayRemove('equipment', index)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>👨‍✈️ Driver Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Driver Name *</label>
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Phone *</label>
                <input
                  type="tel"
                  name="driverPhone"
                  value={formData.driverPhone}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>License Number *</label>
                <input
                  type="text"
                  name="driverLicense"
                  value={formData.driverLicense}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Experience (years)</label>
                <input
                  type="number"
                  name="driverExperience"
                  value={formData.driverExperience}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>💰 Pricing</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Base Fare (₹) *</label>
                <input
                  type="number"
                  name="baseFare"
                  value={formData.baseFare}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                  placeholder="e.g., 500"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Per KM Rate (₹) *</label>
                <input
                  type="number"
                  name="perKmRate"
                  value={formData.perKmRate}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                  placeholder="e.g., 50"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Waiting Charge (₹ per 30 min)</label>
                <input
                  type="number"
                  name="waitingCharge"
                  value={formData.waitingCharge}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="e.g., 100"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Night Charge (₹) (10 PM - 6 AM)</label>
                <input
                  type="number"
                  name="nightCharge"
                  value={formData.nightCharge}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="e.g., 150"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📍 Service Area</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>List cities/areas where you provide service</p>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="City/Area"
                id="serviceArea"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => {
                  const name = document.getElementById('serviceArea').value;
                  if (name) {
                    handleArrayAdd('serviceArea', name);
                    document.getElementById('serviceArea').value = '';
                  }
                }}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
              >
                Add
              </button>
            </div>

            {formData.serviceArea.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                {formData.serviceArea.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', marginBottom: '0.25rem' }}>
                    <span>📍 {item}</span>
                    <button onClick={() => handleArrayRemove('serviceArea', index)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📄 Documents</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Vehicle Registration</label>
                <input type="file" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Insurance Certificate</label>
                <input type="file" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Pollution Certificate</label>
                <input type="file" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Driver License</label>
                <input type="file" style={inputStyle} />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🔑 Account Setup</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>Passwords do not match</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <ProviderRegistrationLayout
      title="Ambulance Registration"
      subtitle="Register your ambulance service"
      icon="🚑"
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

export default AmbulanceRegister;