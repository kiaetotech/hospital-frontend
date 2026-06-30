import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const AmbulanceRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    vehicleNumber: '', type: 'basic', model: '', year: '', capacity: 1,
    equipment: [],
    driverName: '', driverPhone: '', driverLicense: '', driverExperience: '',
    baseFare: '', perKmRate: '', waitingCharge: '', nightCharge: '',
    serviceArea: [],
    password: '', confirmPassword: '', email: ''
  });

  const steps = ['Vehicle', 'Equipment', 'Driver', 'Pricing', 'Area', 'Account'];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const addItem = (field, inputId) => {
    const input = document.getElementById(inputId);
    if (input?.value?.trim()) {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], input.value.trim()] }));
      input.value = '';
    }
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ambulance/register', formData);
      if (res.data?.success) {
        setSuccess('Registration submitted! Redirecting to login...');
        setTimeout(() => navigate('/ambulance/login'), 2000);
      } else {
        setError(res.data?.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ambulanceTypes = [
    { value: 'basic', label: 'Basic Life Support' },
    { value: 'cardiac', label: 'Cardiac' },
    { value: 'ventilator', label: 'Ventilator' },
    { value: 'neonatal', label: 'Neonatal' },
    { value: 'wheelchair', label: 'Wheelchair' },
  ];

  const renderStep = () => {
    switch(currentStep) {
      case 0: return (
        <div>
          <h3 style={stepTitleStyle}>🚑 Vehicle Details</h3>
          <div style={gridStyle}>
            <input placeholder="Vehicle Number *" value={formData.vehicleNumber} onChange={e => handleChange('vehicleNumber', e.target.value)} style={inputStyle} />
            <select value={formData.type} onChange={e => handleChange('type', e.target.value)} style={inputStyle}>
              {ambulanceTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input placeholder="Model (e.g., Force Traveller)" value={formData.model} onChange={e => handleChange('model', e.target.value)} style={inputStyle} />
            <input placeholder="Year (e.g., 2024)" value={formData.year} onChange={e => handleChange('year', e.target.value)} style={inputStyle} />
          </div>
        </div>
      );
      case 1: return (
        <div>
          <h3 style={stepTitleStyle}>🛠️ Equipment</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input id="equipInput" placeholder="Equipment name" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={() => addItem('equipment', 'equipInput')} style={addBtnStyle}>Add</button>
          </div>
          {formData.equipment.map((item, i) => (
            <div key={i} style={tagStyle}>{item} <span onClick={() => removeItem('equipment', i)} style={{ cursor: 'pointer', color: '#e53935' }}>✕</span></div>
          ))}
        </div>
      );
      case 2: return (
        <div>
          <h3 style={stepTitleStyle}>👨‍✈️ Driver Details</h3>
          <div style={gridStyle}>
            <input placeholder="Driver Name *" value={formData.driverName} onChange={e => handleChange('driverName', e.target.value)} style={inputStyle} />
            <input placeholder="Phone *" value={formData.driverPhone} onChange={e => handleChange('driverPhone', e.target.value)} style={inputStyle} />
            <input placeholder="License Number *" value={formData.driverLicense} onChange={e => handleChange('driverLicense', e.target.value)} style={inputStyle} />
            <input placeholder="Experience (years)" value={formData.driverExperience} onChange={e => handleChange('driverExperience', e.target.value)} style={inputStyle} />
          </div>
        </div>
      );
      case 3: return (
        <div>
          <h3 style={stepTitleStyle}>💰 Pricing (You Set Your Own Rates)</h3>
          <div style={gridStyle}>
            <input placeholder="Base Fare (₹) *" type="number" value={formData.baseFare} onChange={e => handleChange('baseFare', e.target.value)} style={inputStyle} />
            <input placeholder="Per KM Rate (₹) *" type="number" value={formData.perKmRate} onChange={e => handleChange('perKmRate', e.target.value)} style={inputStyle} />
            <input placeholder="Waiting Charge (₹)" type="number" value={formData.waitingCharge} onChange={e => handleChange('waitingCharge', e.target.value)} style={inputStyle} />
            <input placeholder="Night Charge (₹)" type="number" value={formData.nightCharge} onChange={e => handleChange('nightCharge', e.target.value)} style={inputStyle} />
          </div>
        </div>
      );
      case 4: return (
        <div>
          <h3 style={stepTitleStyle}>📍 Service Areas</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input id="areaInput" placeholder="City or area name" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={() => addItem('serviceArea', 'areaInput')} style={addBtnStyle}>Add</button>
          </div>
          {formData.serviceArea.map((item, i) => (
            <div key={i} style={tagStyle}>📍 {item} <span onClick={() => removeItem('serviceArea', i)} style={{ cursor: 'pointer', color: '#e53935' }}>✕</span></div>
          ))}
        </div>
      );
      case 5: return (
        <div>
          <h3 style={stepTitleStyle}>🔑 Account Setup</h3>
          <div style={gridStyle}>
            <input placeholder="Email *" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} style={inputStyle} />
            <input placeholder="Password *" type="password" value={formData.password} onChange={e => handleChange('password', e.target.value)} style={inputStyle} />
            <input placeholder="Confirm Password *" type="password" value={formData.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} style={inputStyle} />
          </div>
          {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p style={{ color: '#e53935', fontSize: '12px' }}>Passwords do not match</p>
          )}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={() => navigate('/ambulance')} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>←</button>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#1a1a1a' }}>🚑 Ambulance Registration</h2>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              flex: 1, textAlign: 'center', padding: '8px 4px',
              borderRadius: '8px', fontSize: '10px', fontWeight: 600,
              background: i <= currentStep ? '#e53935' : '#e0e0e0',
              color: i <= currentStep ? '#fff' : '#888'
            }}>{s}</div>
          ))}
        </div>

        {/* Error / Success */}
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>{error}</div>}
        {success && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>{success}</div>}

        {/* Step Content */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', marginBottom: '15px' }}>
          {renderStep()}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {currentStep > 0 && (
            <button onClick={() => setCurrentStep(prev => prev - 1)} style={{ flex: 1, padding: '14px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>← Previous</button>
          )}
          {currentStep < steps.length - 1 ? (
            <button onClick={() => setCurrentStep(prev => prev + 1)} style={{ flex: 1, padding: '14px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Next →</button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '14px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>{loading ? 'Submitting...' : 'Submit Registration'}</button>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#888' }}>
          Already registered? <Link to="/ambulance/login" style={{ color: '#e53935', fontWeight: 600, textDecoration: 'none' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

const stepTitleStyle = { fontSize: '16px', fontWeight: 700, color: '#333', marginBottom: '14px' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' };
const inputStyle = { width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const addBtnStyle = { padding: '12px 16px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' };
const tagStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '6px', fontSize: '13px' };

export default AmbulanceRegister;