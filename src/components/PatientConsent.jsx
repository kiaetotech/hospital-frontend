import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PatientConsent = ({ serviceType, onConsentChange }) => {
  const [consents, setConsents] = useState({
    medical: false,
    data: false,
    terms: false,
    emergency: false,
  });

  const handleChange = (key) => {
    const updated = { ...consents, [key]: !consents[key] };
    setConsents(updated);
    const allAccepted = Object.values(updated).every(v => v);
    onConsentChange && onConsentChange(allAccepted);
  };

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginTop: 16, backgroundColor: '#f8fafc' }}>
      <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>📋 Consent & Acknowledgments</h4>

      <label style={checkboxStyle}>
        <input type="checkbox" checked={consents.medical} onChange={() => handleChange('medical')} style={{ marginRight: 8 }} />
        I understand that HealthCare Hub is a technology platform connecting me with independent healthcare providers. The platform does not provide medical advice.
      </label>

      <label style={checkboxStyle}>
        <input type="checkbox" checked={consents.data} onChange={() => handleChange('data')} style={{ marginRight: 8 }} />
        I consent to sharing my health information with the selected provider for the purpose of this {serviceType || 'service'}. My data will be handled per the <Link to="/privacy" style={{ color: '#2563eb' }}>Privacy Policy</Link>.
      </label>

      <label style={checkboxStyle}>
        <input type="checkbox" checked={consents.terms} onChange={() => handleChange('terms')} style={{ marginRight: 8 }} />
        I agree to the <Link to="/terms" style={{ color: '#2563eb' }}>Terms & Conditions</Link> and <Link to="/refund" style={{ color: '#2563eb' }}>Refund Policy</Link>.
      </label>

      <label style={checkboxStyle}>
        <input type="checkbox" checked={consents.emergency} onChange={() => handleChange('emergency')} style={{ marginRight: 8 }} />
        <strong>Emergency Acknowledgment:</strong> I understand this is not for medical emergencies. In an emergency, I will call 108 or visit the nearest hospital.
      </label>

      <div style={{ marginTop: 12, padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: '0.82rem', color: '#92400e' }}>
        ⚠️ <strong>Important:</strong> By proceeding, you confirm that you have read the <Link to="/disclaimer" style={{ color: '#92400e', fontWeight: 700 }}>Medical Disclaimer</Link>.
      </div>
    </div>
  );
};

const checkboxStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  padding: '8px 0',
  fontSize: '0.85rem',
  color: '#475569',
  cursor: 'pointer',
  lineHeight: 1.5,
};

export default PatientConsent;

