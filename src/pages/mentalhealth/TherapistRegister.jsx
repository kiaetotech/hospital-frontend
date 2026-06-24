import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TherapistRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    licenseCouncil: '',
    specializations: [],
    experience: '',
    education: '',
    about: '',
    languages: [],
    city: '',
    state: '',
    consultationFee: '',
    consultationTypes: { video: true, audio: true, text: true, anonymous: true }
  });

  const specializationsList = [
    'Anxiety Disorders', 'Depression', 'Stress Management', 'Relationship Counseling',
    'Career Counseling', 'Trauma Therapy', 'PTSD', 'OCD', 'Panic Disorder', 'Phobias',
    'Eating Disorders', 'Substance Abuse', 'Grief & Loss', 'Anger Management',
    'Parenting Counseling', 'Family Therapy', 'Couples Therapy', 'Child Psychology',
    'Adolescent Psychology', 'Geriatric Psychology', 'Workplace Stress', 'Burnout',
    'LGBTQ+ Support', 'Life Coaching', 'Mindfulness', 'Sleep Disorders'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: type === 'checkbox' ? checked : value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSpecializationToggle = (spec) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  // ============================================
  // ✅ FIXED handleSubmit - sends correct data format
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const consultationFeeNum = parseInt(formData.consultationFee) || 0;

      const submitData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        licenseNumber: formData.licenseNumber,
        specializations: formData.specializations,
        experience: parseInt(formData.experience) || 0,
        about: formData.about || '',
        city: formData.city || '',
        state: formData.state || '',
        education: formData.education || '',
        languages: formData.languages || [],
        consultationTypes: formData.consultationTypes || { video: true, audio: true, text: true, anonymous: true },
        // ✅ consultationFee as top-level (required by validation)
        consultationFee: consultationFeeNum,
        // ✅ pricing as object with consultation (required by model)
        pricing: {
          consultation: consultationFeeNum
        }
      };

      console.log('📤 Submitting:', JSON.stringify(submitData, null, 2));

      const res = await axios.post(`${API_URL}/api/mentalhealth/therapist/register`, submitData);

      if (res.data.success) {
        alert('✅ Registration submitted! Please wait for verification.');
        navigate('/mentalhealth/therapist/login');
      } else {
        alert(res.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', borderRadius: '1rem', padding: '2rem', color: 'white', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>🧠 Therapist Registration</h1>
          <p style={{ opacity: 0.9 }}>Join our platform and help people with their mental health</p>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            {['Profile', 'License', 'Details'].map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  backgroundColor: step > i ? '#10b981' : step === i + 1 ? '#8b5cf6' : '#e5e7eb',
                  color: step > i || step === i + 1 ? 'white' : '#6b7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>{i + 1}</div>
                <span style={{ fontSize: '0.85rem', fontWeight: step === i + 1 ? 'bold' : 'normal' }}>{label}</span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>👤 Personal Information</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <input type="text" name="name" placeholder="Full Name *" value={formData.name} onChange={handleChange} style={inputStyle} required />
                <input type="tel" name="phone" placeholder="Phone Number *" value={formData.phone} onChange={handleChange} style={inputStyle} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} style={inputStyle} />
                <input type="password" name="password" placeholder="Password *" value={formData.password} onChange={handleChange} style={inputStyle} required />
                <input type="password" name="confirmPassword" placeholder="Confirm Password *" value={formData.confirmPassword} onChange={handleChange} style={inputStyle} required />
                <input type="text" name="city" placeholder="City *" value={formData.city} onChange={handleChange} style={inputStyle} required />
                <input type="text" name="state" placeholder="State *" value={formData.state} onChange={handleChange} style={inputStyle} required />
                <input type="number" name="experience" placeholder="Years of Experience *" value={formData.experience} onChange={handleChange} style={inputStyle} required />
                <input type="number" name="consultationFee" placeholder="Consultation Fee (₹) *" value={formData.consultationFee} onChange={handleChange} style={inputStyle} required />
                <textarea name="about" placeholder="About Yourself" value={formData.about} onChange={handleChange} style={{ ...inputStyle, minHeight: '80px' }} />
              </div>
              <button onClick={() => setStep(2)} style={{ marginTop: '1.5rem', padding: '10px 24px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Next →</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📜 License & Credentials</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <input type="text" name="licenseNumber" placeholder="License Number *" value={formData.licenseNumber} onChange={handleChange} style={inputStyle} required />
                <input type="text" name="licenseCouncil" placeholder="Licensing Council (e.g., RCI)" value={formData.licenseCouncil} onChange={handleChange} style={inputStyle} />
                <input type="text" name="education" placeholder="Education (e.g., PhD, Masters)" value={formData.education} onChange={handleChange} style={inputStyle} />
                <input type="text" name="languages" placeholder="Languages (comma separated)" value={formData.languages.join(', ')} onChange={(e) => setFormData({ ...formData, languages: e.target.value.split(',').map(s => s.trim()) })} style={inputStyle} />
              </div>
              <button onClick={() => setStep(3)} style={{ marginTop: '1.5rem', padding: '10px 24px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Next →</button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🔬 Specializations</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {specializationsList.map((spec) => (
                  <label key={spec} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.specializations.includes(spec)} onChange={() => handleSpecializationToggle(spec)} />
                    <span style={{ fontSize: '0.85rem' }}>{spec}</span>
                  </label>
                ))}
              </div>

              <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Consultation Types</h4>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {['video', 'audio', 'text', 'anonymous'].map((type) => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name={`consultationTypes.${type}`}
                      checked={formData.consultationTypes[type]}
                      onChange={handleChange}
                    />
                    <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{type}</span>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setStep(2)} style={{ padding: '10px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>← Back</button>
                <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '10px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {loading ? 'Submitting...' : '✅ Submit Registration'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.6rem',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  fontSize: '0.9rem',
  backgroundColor: 'white',
  outline: 'none'
};

export default TherapistRegister;