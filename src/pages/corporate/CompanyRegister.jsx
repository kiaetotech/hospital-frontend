import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-f1b1.up.railway.app';

const serviceOptions = [
  { key: 'hospitals', label: 'Hospitals', icon: '🏥', desc: 'OPD, health checkups, bed booking' },
  { key: 'onlineDoctors', label: 'Online Doctors', icon: '📱', desc: 'Video consultations, prescriptions' },
  { key: 'diagnostics', label: 'Lab Tests', icon: '🔬', desc: 'Diagnostic packages, home collection' },
  { key: 'mentalHealth', label: 'Mental Wellness', icon: '🧠', desc: 'Therapy, counseling, EAP' },
  { key: 'ayurveda', label: 'Ayurveda', icon: '🧘', desc: 'Panchakarma, wellness programs' },
  { key: 'homeopathy', label: 'Homeopathy', icon: '🌿', desc: 'Consultation, naturopathy' },
  { key: 'caregivers', label: 'Home Care', icon: '🏠', desc: 'Elder care, post-surgery care' },
  { key: 'ambulance', label: 'Ambulance', icon: '🚑', desc: 'Emergency & scheduled transport' },
];

const CompanyRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    companyName: '', companyGST: '', companyPAN: '', employeeCount: '', city: '', state: '',
    selectedServices: [],
    budgetPerEmployee: '',
    hrName: '', hrEmail: '', hrPhone: '', hrPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleService = (key) => {
    const selected = formData.selectedServices.includes(key)
      ? formData.selectedServices.filter(s => s !== key)
      : [...formData.selectedServices, key];
    setFormData({ ...formData, selectedServices: selected });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/corporate/company/register`, formData);
      if (res.data.success) {
        localStorage.setItem('hrToken', res.data.data.token);
        localStorage.setItem('corporateToken', res.data.data.token);
        localStorage.setItem('companyData', JSON.stringify(res.data.data));
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => navigate('/corporate/hr/dashboard'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Company Details' },
    { num: 2, title: 'Select Services' },
    { num: 3, title: 'HR Account' },
    { num: 4, title: 'Review' },
  ];

  const labelStyle = { display: 'block', fontWeight: '500', marginBottom: '0.35rem', fontSize: '0.9rem', color: '#374151' };
  const inputStyle = { width: '100%', padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.95rem', boxSizing: 'border-box' };
  const primaryBtn = { padding: '0.7rem 2rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' };
  const secondaryBtn = { padding: '0.7rem 2rem', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a5f' }}>Register Your Company</h1>
          <p style={{ color: '#6b7280' }}>Get corporate healthcare benefits for your employees in 5 minutes</p>
        </div>

        {/* Steps Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '0.5rem', flexWrap: 'wrap' }}>
          {steps.map((s) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: step >= s.num ? '#2563eb' : '#e5e7eb',
                color: step >= s.num ? 'white' : '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '0.9rem'
              }}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span style={{ fontSize: '0.85rem', color: step >= s.num ? '#2563eb' : '#9ca3af', fontWeight: step === s.num ? 'bold' : 'normal' }}>
                {s.title}
              </span>
              {s.num < 4 && <div style={{ width: '30px', height: '2px', backgroundColor: step > s.num ? '#2563eb' : '#e5e7eb' }} />}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          
          {error && <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', color: '#dc2626' }}>{error}</div>}
          {success && <div style={{ backgroundColor: '#d1fae5', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', color: '#065f46' }}>{success}</div>}

          {/* Step 1: Company Details */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>🏢 Company Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Company Name *</label>
                  <input name="companyName" value={formData.companyName} onChange={handleChange} style={inputStyle} placeholder="e.g. TechCorp India Pvt Ltd" />
                </div>
                <div>
                  <label style={labelStyle}>GST Number</label>
                  <input name="companyGST" value={formData.companyGST} onChange={handleChange} style={inputStyle} placeholder="22AAAAA0000A1Z5" />
                </div>
                <div>
                  <label style={labelStyle}>PAN Number</label>
                  <input name="companyPAN" value={formData.companyPAN} onChange={handleChange} style={inputStyle} placeholder="AAAAA0000A" />
                </div>
                <div>
                  <label style={labelStyle}>Number of Employees *</label>
                  <input name="employeeCount" type="number" value={formData.employeeCount} onChange={handleChange} style={inputStyle} placeholder="e.g. 100" />
                </div>
                <div>
                  <label style={labelStyle}>Budget Per Employee (₹)</label>
                  <input name="budgetPerEmployee" type="number" value={formData.budgetPerEmployee} onChange={handleChange} style={inputStyle} placeholder="e.g. 2000" />
                </div>
                <div>
                  <label style={labelStyle}>City *</label>
                  <input name="city" value={formData.city} onChange={handleChange} style={inputStyle} placeholder="e.g. Mumbai" />
                </div>
                <div>
                  <label style={labelStyle}>State</label>
                  <input name="state" value={formData.state} onChange={handleChange} style={inputStyle} placeholder="e.g. Maharashtra" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Services */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>📋 Select Services</h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Choose which healthcare services your employees can access</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {serviceOptions.map((svc) => (
                  <div
                    key={svc.key}
                    onClick={() => toggleService(svc.key)}
                    style={{
                      padding: '1rem', borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 0.2s',
                      border: formData.selectedServices.includes(svc.key) ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      backgroundColor: formData.selectedServices.includes(svc.key) ? '#eff6ff' : 'white',
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{svc.icon}</div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{svc.label}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{svc.desc}</div>
                    {formData.selectedServices.includes(svc.key) && (
                      <div style={{ marginTop: '0.5rem', color: '#2563eb', fontSize: '0.85rem', fontWeight: 'bold' }}>✓ Selected</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: HR Account */}
          {step === 3 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>👤 HR Admin Account</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Full Name *</label>
                  <input name="hrName" value={formData.hrName} onChange={handleChange} style={inputStyle} placeholder="e.g. Priya Sharma" />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input name="hrEmail" type="email" value={formData.hrEmail} onChange={handleChange} style={inputStyle} placeholder="hr@company.com" />
                </div>
                <div>
                  <label style={labelStyle}>Phone *</label>
                  <input name="hrPhone" value={formData.hrPhone} onChange={handleChange} style={inputStyle} placeholder="+91 9876543210" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Password *</label>
                  <input name="hrPassword" type="password" value={formData.hrPassword} onChange={handleChange} style={inputStyle} placeholder="Create a strong password" />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>✅ Review & Submit</h3>
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}><strong>Company:</strong> {formData.companyName}</div>
                <div style={{ marginBottom: '1rem' }}><strong>Employees:</strong> {formData.employeeCount}</div>
                <div style={{ marginBottom: '1rem' }}><strong>Budget/Employee:</strong> ₹{formData.budgetPerEmployee || '0'}</div>
                <div style={{ marginBottom: '1rem' }}><strong>City:</strong> {formData.city}</div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Services Selected:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {formData.selectedServices.map(s => {
                      const svc = serviceOptions.find(o => o.key === s);
                      return <span key={s} style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem' }}>{svc?.icon} {svc?.label}</span>;
                    })}
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}><strong>HR Contact:</strong> {formData.hrName} ({formData.hrEmail})</div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} style={secondaryBtn}>← Back</button>
            ) : <div />}
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} disabled={step === 2 && formData.selectedServices.length === 0} style={primaryBtn}>
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={primaryBtn}>
                {loading ? 'Submitting...' : '✅ Register Company'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegister;