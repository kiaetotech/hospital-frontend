import React from 'react';
import { useNavigate } from 'react-router-dom';

const RefundPolicy = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <button onClick={() => navigate(-1)} style={{ padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1.5rem' }}>← Back</button>
      
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>Refund & Cancellation Policy</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Last updated: June 2026</p>

      <div style={{ lineHeight: '1.8', color: '#334155' }}>
        <h3>1. Cancellation by Patient</h3>
        <p><strong>Free cancellation:</strong> Up to 24 hours before appointment time - 100% refund.<br/>
        <strong>Late cancellation:</strong> 12-24 hours before - 50% refund.<br/>
        <strong>No-show:</strong> Less than 12 hours - No refund.</p>

        <h3>2. Cancellation by Doctor/Center</h3>
        <p>If a doctor or center cancels, patient receives 100% refund + a discount code for next booking.</p>

        <h3>3. Refund Process</h3>
        <p>Refunds are processed within 5-7 business days to the original payment method (UPI/Card/Bank). Platform service fee is non-refundable in case of patient cancellation.</p>

        <h3>4. Panchakarma Package Cancellation</h3>
        <p>7+ days before: 100% refund. 3-7 days: 50% refund. Less than 3 days: No refund.</p>

        <h3>5. Dispute Resolution</h3>
        <p>For any disputes, contact support@ayurvedawellnesshub.com. Resolution within 48 hours.</p>
      </div>
    </div>
  );
};

export default RefundPolicy;

