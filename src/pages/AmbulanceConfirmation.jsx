import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AmbulanceConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking } = location.state || {};

  // If no booking data, show error and redirect option
  if (!booking) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>⚠️</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>No Booking Found</h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>We couldn't find your booking information.</p>
          <button 
            onClick={() => navigate('/ambulance')} 
            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
          >
            Book Ambulance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
        
        {/* Success Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '4rem' }}>🚑</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.5rem' }}>Booking Confirmed!</h2>
          <p style={{ color: '#6b7280' }}>Your ambulance has been booked successfully</p>
        </div>
        
        {/* Ambulance Details */}
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🚑 Ambulance Details</h3>
          <p style={{ margin: '0.25rem 0' }}><strong>Type:</strong> {booking.ambulanceName}</p>
          <p style={{ margin: '0.25rem 0' }}><strong>Distance:</strong> {booking.distance} km</p>
        </div>

        {/* Hospital Details */}
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🏥 Hospital Details</h3>
          <p style={{ margin: '0.25rem 0' }}><strong>Name:</strong> {booking.hospitalName}</p>
        </div>

        {/* Patient Details */}
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>👤 Patient Details</h3>
          <p style={{ margin: '0.25rem 0' }}><strong>Name:</strong> {booking.patientName}</p>
          <p style={{ margin: '0.25rem 0' }}><strong>Phone:</strong> {booking.patientPhone}</p>
          <p style={{ margin: '0.25rem 0' }}><strong>Pickup Address:</strong> {booking.pickupAddress}</p>
        </div>

        {/* Payment Details */}
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>💰 Payment Details</h3>
          <p style={{ margin: '0.25rem 0' }}><strong>Original Amount:</strong> ₹{booking.originalAmount}</p>
          <p style={{ margin: '0.25rem 0', color: '#10b981' }}><strong>Discount (10%):</strong> -₹{booking.discount}</p>
          <p style={{ margin: '0.25rem 0', fontSize: '1.1rem' }}><strong>Total Paid:</strong> ₹{booking.amount}</p>
        </div>

        {/* Estimated Arrival */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0 }}>🚨 <strong>Estimated Arrival Time:</strong> {Math.max(5, Math.round(booking.distance * 2))} minutes</p>
          <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0 0', color: '#1e40af' }}>Driver will contact you shortly</p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🏠 Go to Home
          </button>
          <button 
            onClick={() => window.print()} 
            style={{ flex: 1, backgroundColor: '#6b7280', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🖨️ Print Receipt
          </button>
        </div>

        {/* Share Options */}
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Booking ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Thank you for choosing KiaetoCare</p>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceConfirmation;
