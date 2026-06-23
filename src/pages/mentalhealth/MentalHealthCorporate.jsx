import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MentalHealthCorporate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    employeeCount: '',
    hrName: '',
    hrEmail: '',
    hrPhone: '',
    budget: '',
    requirements: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would send to backend
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        padding: '3rem 2rem',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🏢 Corporate EAP</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Employee Assistance Program for mental health & counseling</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🧠 Why Corporate EAP?</h2>
          <ul style={{ paddingLeft: '1.2rem', lineHeight: '2' }}>
            <li>✅ Reduce employee stress and burnout</li>
            <li>✅ Improve productivity and engagement</li>
            <li>✅ Confidential mental health support for employees</li>
            <li>✅ 24/7 access to licensed therapists</li>
            <li>✅ Anonymous counseling sessions</li>
            <li>✅ Corporate wellness programs</li>
          </ul>
        </div>

        {submitted ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>Thank You!</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>We'll contact you within 24 hours to discuss the EAP plan for your organization.</p>
            <button
              onClick={() => navigate('/mentalhealth')}
              style={{ padding: '0.5rem 1.5rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              ← Back to Hub
            </button>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📝 Get a Quote for Your Company</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Company Name *</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} style={inputStyle} required />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Number of Employees *</label>
                <input type="number" name="employeeCount" value={formData.employeeCount} onChange={handleChange} style={inputStyle} required />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>HR Contact Name *</label>
                <input type="text" name="hrName" value={formData.hrName} onChange={handleChange} style={inputStyle} required />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>HR Email *</label>
                <input type="email" name="hrEmail" value={formData.hrEmail} onChange={handleChange} style={inputStyle} required />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>HR Phone *</label>
                <input type="tel" name="hrPhone" value={formData.hrPhone} onChange={handleChange} style={inputStyle} required />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Budget Range</label>
                <select name="budget" value={formData.budget} onChange={handleChange} style={inputStyle}>
                  <option value="">Select budget range</option>
                  <option value="10k-25k">₹10,000 - ₹25,000</option>
                  <option value="25k-50k">₹25,000 - ₹50,000</option>
                  <option value="50k-1lakh">₹50,000 - ₹1 Lakh</option>
                  <option value="1lakh-5lakh">₹1 Lakh - ₹5 Lakhs</option>
                  <option value="5lakh+">₹5 Lakhs+</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Requirements</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Any specific requirements or preferences..."
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                />
              </div>
              <button
                type="submit"
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
              >
                📩 Request Quote
              </button>
            </form>
          </div>
        )}
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

export default MentalHealthCorporate;