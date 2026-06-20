import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <button onClick={() => navigate(-1)} style={{ padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1.5rem' }}>← Back</button>
      
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>Terms & Conditions</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Last updated: June 2026</p>

      <div style={{ lineHeight: '1.8', color: '#334155' }}>
        <h3>1. Platform Role</h3>
        <p>Ayurveda Wellness Hub is a technology platform connecting patients with AYUSH-registered Ayurvedic practitioners and wellness centers. We do not provide medical advice. All treatments are provided by independent practitioners.</p>

        <h3>2. Doctor/Center Verification</h3>
        <p>All practitioners are verified through AYUSH registration certificates. However, patients should verify credentials before treatment. The platform is not liable for any medical outcomes.</p>

        <h3>3. Booking & Payment</h3>
        <p>Bookings are confirmed upon successful payment. Platform charges a service fee (commission) as displayed during payment. Consultation fees are set by doctors/centers independently.</p>

        <h3>4. Cancellation & Refund</h3>
        <p>Free cancellation up to 24 hours before appointment. Late cancellations may incur charges. Refunds are processed within 5-7 business days to the original payment method.</p>

        <h3>5. Privacy & Data</h3>
        <p>Patient health data is stored securely and shared only with the treating doctor/center. We do not sell or share data with third parties. See our Privacy Policy for details.</p>

        <h3>6. Commission Structure</h3>
        <p>For Doctors: 15% on first consultation, 5% on repeat consultations. For Panchakarma Centers: 20% on package bookings. Payouts are processed weekly.</p>

        <h3>7. Liability</h3>
        <p>The platform acts solely as a facilitator. Any disputes regarding treatment quality, outcomes, or fees must be resolved directly between patient and practitioner.</p>

        <h3>8. Contact</h3>
        <p>For any queries: support@ayurvedawellnesshub.com | +91-XXXXXXXXXX</p>
      </div>
    </div>
  );
};

export default TermsAndConditions;