import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AyurvedaBookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {};

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2E7D32', marginBottom: '0.5rem' }}>
        Booking Confirmed!
      </h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Your booking has been confirmed. You will receive a confirmation on your phone.
      </p>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'left',
        marginBottom: '1.5rem'
      }}>
        {[
          ['Booking ID', data.bookingId],
          ['Type', data.packageName || 'Doctor Consultation'],
          ['Provider', data.centerName || data.doctorName],
          ['Patient', data.patientName],
          ['Amount Paid', `₹${(data.amount || 0).toLocaleString()}`],
          ['Transaction ID', data.transactionId],
          ['Date', new Date(data.paidAt).toLocaleString()],
        ].map(([label, value], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b' }}>{label}</span>
            <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{value || 'N/A'}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={() => navigate('/ayurveda')}
          style={{ flex: 1, padding: '0.75rem', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
          🏠 Go to Ayurveda Hub
        </button>
        <button onClick={() => navigate('/my-bookings')}
          style={{ flex: 1, padding: '0.75rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
          📋 My Bookings
        </button>
      </div>
    </div>
  );
};

export default AyurvedaBookingConfirmation;
