import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderRegistrationLayout from '../../components/ProviderRegistrationLayout';
import api from '../../services/api';

const HospitalRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    registrationNumber: '',
    type: 'multi_specialty',
    establishedYear: '',
    description: '',
    
    // Step 2: Contact
    email: '',
    phone: '',
    website: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    
    // Step 3: Facilities
    facilities: [],
    specialties: [],
    bedCount: 0,
    emergencyServices: false,
    ambulanceAvailable: false,
    
    // Step 4: Timings
    opdTimings: { start: '09:00', end: '17:00' },
    weekendTimings: { start: '10:00', end: '14:00' },
    
    // Step 5: Doctors
    doctors: [],
    
    // Step 6: Room Types
    roomTypes: [],
    
    // Step 7: Insurance Tie-ups
    insuranceTieups: [],
    
    // Step 8: Documents
    documents: [],
    
    // Step 9: Password
    password: '',
    confirmPassword: ''
  });

  const steps = [
    'Basic Info',
    'Contact Details',
    'Facilities',
    'Timings',
    'Doctors',
    'Room Types',
    'Insurance',
    'Documents',
    'Password'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
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
      const response = await api.post('/hospitals/register', formData);
      if (response.data.success) {
        alert('Registration submitted! Please wait for verification.');
        navigate('/hospital/login');
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
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🏥 Hospital Basic Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Hospital Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Registration Number *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Hospital Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="multi_specialty">Multi-Specialty</option>
                  <option value="super_specialty">Super-Specialty</option>
                  <option value="general">General Hospital</option>
                  <option value="nursing_home">Nursing Home</option>
                  <option value="clinic">Clinic</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Established Year</label>
                <input
                  type="number"
                  name="establishedYear"
                  value={formData.establishedYear}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="e.g., 1983"
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={{ ...inputStyle, minHeight: '80px' }}
                  placeholder="Describe your hospital, facilities, and services..."
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📞 Contact Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="https://www.yourhospital.com"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Address Line 1 *</label>
                <input
                  type="text"
                  name="address.line1"
                  value={formData.address.line1}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Address Line 2</label>
                <input
                  type="text"
                  name="address.line2"
                  value={formData.address.line2}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>City *</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>State *</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Pincode *</label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🏥 Facilities & Services</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Beds</label>
                <input
                  type="number"
                  name="bedCount"
                  value={formData.bedCount}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    name="emergencyServices"
                    checked={formData.emergencyServices}
                    onChange={handleChange}
                  />
                  Emergency Services (24x7)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    name="ambulanceAvailable"
                    checked={formData.ambulanceAvailable}
                    onChange={handleChange}
                  />
                  Ambulance Available
                </label>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Facilities (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., ICU, OT, Laboratory, Pharmacy, Blood Bank, Radiology"
                  value={formData.facilities.join(', ')}
                  onChange={(e) => {
                    const values = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setFormData(prev => ({ ...prev, facilities: values }));
                  }}
                  style={inputStyle}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Specialties (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., Cardiology, Neurology, Orthopedics, Pediatrics"
                  value={formData.specialties.join(', ')}
                  onChange={(e) => {
                    const values = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setFormData(prev => ({ ...prev, specialties: values }));
                  }}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>⏰ Timings & Availability</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>OPD Start Time</label>
                <input
                  type="time"
                  name="opdTimings.start"
                  value={formData.opdTimings.start}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>OPD End Time</label>
                <input
                  type="time"
                  name="opdTimings.end"
                  value={formData.opdTimings.end}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Weekend Start Time</label>
                <input
                  type="time"
                  name="weekendTimings.start"
                  value={formData.weekendTimings.start}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Weekend End Time</label>
                <input
                  type="time"
                  name="weekendTimings.end"
                  value={formData.weekendTimings.end}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>👨‍⚕️ Doctors</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Add doctors who work at your hospital</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Doctor Name"
                id="docName"
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Specialization"
                id="docSpecialization"
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Consultation Fee"
                id="docFee"
                style={inputStyle}
              />
              <button
                onClick={() => {
                  const name = document.getElementById('docName').value;
                  const specialization = document.getElementById('docSpecialization').value;
                  const consultationFee = document.getElementById('docFee').value;
                  if (name && specialization) {
                    handleArrayAdd('doctors', { name, specialization, consultationFee: parseInt(consultationFee) || 0 });
                    document.getElementById('docName').value = '';
                    document.getElementById('docSpecialization').value = '';
                    document.getElementById('docFee').value = '';
                  }
                }}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
              >
                Add
              </button>
            </div>

            {formData.doctors.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                {formData.doctors.map((doc, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', marginBottom: '0.25rem' }}>
                    <span><strong>{doc.name}</strong> - {doc.specialization} (₹{doc.consultationFee})</span>
                    <button
                      onClick={() => handleArrayRemove('doctors', index)}
                      style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🛏️ Room Types & Pricing</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Add room types available at your hospital</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Room Type"
                id="roomType"
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Price per Day"
                id="roomPrice"
                style={inputStyle}
              />
              <button
                onClick={() => {
                  const name = document.getElementById('roomType').value;
                  const price = document.getElementById('roomPrice').value;
                  if (name && price) {
                    handleArrayAdd('roomTypes', { name, pricePerDay: parseInt(price) });
                    document.getElementById('roomType').value = '';
                    document.getElementById('roomPrice').value = '';
                  }
                }}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
              >
                Add
              </button>
            </div>

            {formData.roomTypes.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                {formData.roomTypes.map((room, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', marginBottom: '0.25rem' }}>
                    <span><strong>{room.name}</strong> - ₹{room.pricePerDay}/day</span>
                    <button
                      onClick={() => handleArrayRemove('roomTypes', index)}
                      style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🛡️ Insurance Tie-ups</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>List insurance companies you have tie-ups with</p>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Insurance Company Name"
                id="insuranceCompany"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => {
                  const name = document.getElementById('insuranceCompany').value;
                  if (name) {
                    handleArrayAdd('insuranceTieups', { name, cashless: true });
                    document.getElementById('insuranceCompany').value = '';
                  }
                }}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
              >
                Add
              </button>
            </div>

            {formData.insuranceTieups.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                {formData.insuranceTieups.map((ins, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', marginBottom: '0.25rem' }}>
                    <span>{ins.name}</span>
                    <button
                      onClick={() => handleArrayRemove('insuranceTieups', index)}
                      style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 7:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📄 Documents</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Upload required documents for verification</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Registration Certificate</label>
                <input type="file" style={inputStyle} onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleArrayAdd('documents', { name: 'Registration Certificate', file: file.name });
                  }
                }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>PAN Card</label>
                <input type="file" style={inputStyle} onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleArrayAdd('documents', { name: 'PAN Card', file: file.name });
                  }
                }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>GST Certificate</label>
                <input type="file" style={inputStyle} onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleArrayAdd('documents', { name: 'GST Certificate', file: file.name });
                  }
                }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>NOC Certificate</label>
                <input type="file" style={inputStyle} onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleArrayAdd('documents', { name: 'NOC Certificate', file: file.name });
                  }
                }} />
              </div>
            </div>
          </div>
        );

      case 8:
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
      title="Hospital Registration"
      subtitle="Register your hospital on our platform"
      icon="🏥"
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

export default HospitalRegister;