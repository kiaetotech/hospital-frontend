import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const AmbulanceTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
    const interval = setInterval(fetchBooking, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/ambulance/booking/${id}`);
      setBooking(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = (status) => {
    switch(status) {
      case 'pending': return '⏳ Searching for ambulance...';
      case 'accepted': return '✅ Ambulance assigned! Driver is coming.';
      case 'enroute': return '🚑 Ambulance is on the way!';
      case 'arrived': return '📍 Ambulance has arrived at your location';
      case 'completed': return '🎉 Trip completed! Thank you for using our service.';
      case 'cancelled': return '❌ Booking cancelled.';
      default: return status;
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tracking info...</div>;

  if (!booking) return <div style={{ padding: '2rem', textAlign: 'center' }}>Booking not found</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Ambulance Tracking</h2>
        
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
          <p style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{getStatusMessage(booking.status)}</p>
        </div>
        
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
          <p><strong>🚑 Ambulance:</strong> {booking.vehicleNumber}</p>
          <p><strong>👨‍✈️ Driver:</strong> {booking.driverName} - {booking.driverPhone}</p>
          <p><strong>📍 Pickup:</strong> {booking.pickupAddress}</p>
          <p><strong>🏥 Destination:</strong> {booking.dropAddress}</p>
          <p><strong>💰 Amount:</strong> ₹{booking.totalAmount} (10% discount applied)</p>
          <p><strong>📅 Booked on:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
        </div>
        
        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={() => navigate('/')} style={{ backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Go Home</button>
          </div>
        )}
        
        {(booking.status === 'completed' || booking.status === 'cancelled') && (
          <button onClick={() => navigate('/')} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
};

export default AmbulanceTracking;

