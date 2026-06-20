import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <button onClick={() => navigate(-1)} style={{ padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1.5rem' }}>← Back</button>
      
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>Privacy Policy</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Last updated: June 2026</p>

      <div style={{ lineHeight: '1.8', color: '#334155' }}>
        <h3>1. Information We Collect</h3>
        <p>We collect: Name, phone number, email, age, gender, medical symptoms, Prakriti assessment results, booking history, and payment information. For doctors/centers: AYUSH registration, qualifications, bank details.</p>

        <h3>2. How We Use Information</h3>
        <p>Patient data is shared only with the booked doctor/center for treatment purposes. Contact information is used for booking confirmations and reminders. Payment data is processed through Razorpay (PCI-DSS compliant).</p>

        <h3>3. Data Storage</h3>
        <p>Data is stored on MongoDB Atlas cloud servers with encryption at rest and in transit. We retain patient records for 7 years as per medical guidelines.</p>

        <h3>4. Data Sharing</h3>
        <p>We DO NOT sell patient data. Data is shared only with: (a) The treating doctor/center, (b) Payment processor (Razorpay), (c) SMS/Email service providers for notifications.</p>

        <h3>5. Patient Rights</h3>
        <p>Patients can: Request access to their data, request deletion (subject to legal requirements), opt-out of marketing communications, request correction of inaccurate data.</p>

        <h3>6. Security</h3>
        <p>All data transmission uses SSL/TLS encryption. Passwords are hashed using bcrypt. Payment information is never stored on our servers.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;