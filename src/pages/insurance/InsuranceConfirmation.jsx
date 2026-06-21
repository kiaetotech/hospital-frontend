import React from 'react';
import { useNavigate } from 'react-router-dom';

const InsuranceConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '64px', marginBottom: '1rem' }}>✅</div>
      <h1 style={{ color: '#10b981' }}>Application Submitted!</h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        Your insurance application has been submitted successfully.
      </p>
      <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'left' }}>
        <p><strong>Application ID:</strong> INS-{Date.now()}</p>
        <p><strong>Status:</strong> <span style={{ color: '#f59e0b' }}>Pending Verification</span></p>
        <p><strong>Next Steps:</strong> We will review your application and get back to you within 24 hours.</p>
      </div>
      <button 
        onClick={() => navigate('/my-bookings')}
        style={{ 
          padding: '12px 24px', 
          backgroundColor: '#2563eb', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px', 
          cursor: 'pointer',
          marginRight: '10px',
          fontWeight: 'bold'
        }}
      >
        View My Policies
      </button>
      <button 
        onClick={() => navigate('/insurance')}
        style={{ 
          padding: '12px 24px', 
          backgroundColor: '#6b7280', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px', 
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Browse More Plans
      </button>
    </div>
  );
};

export default InsuranceConfirmation;