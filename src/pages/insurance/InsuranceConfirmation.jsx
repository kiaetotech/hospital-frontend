import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const InsuranceConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingId, setBookingId] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setBookingId(params.get('bookingId') || '');
    setPolicyNumber(params.get('policyNumber') || '');
  }, [location]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '500px', backgroundColor: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
          Application Submitted!
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Your insurance application has been submitted successfully.
        </p>

        <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '8px', textAlign: 'left', marginBottom: '1.5rem' }}>
          {bookingId && (
            <p><strong>Application ID:</strong> {bookingId}</p>
          )}
          {policyNumber && (
            <p><strong>Policy Number:</strong> {policyNumber}</p>
          )}
          <p><strong>Status:</strong> <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Pending Verification</span></p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
            We will review your application and get back to you within 24 hours.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
          <button
            onClick={() => navigate('/my-bookings')}
            style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            View My Policies
          </button>
          <button
            onClick={() => navigate('/insurance')}
            style={{ padding: '12px', backgroundColor: 'transparent', color: '#2563eb', border: '2px solid #2563eb', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Browse More Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsuranceConfirmation;

