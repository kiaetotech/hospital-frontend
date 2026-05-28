import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // In real implementation, fetch from backend
      // For now, using sample data
      const sampleBookings = [
        {
          _id: '1',
          hospitalName: 'Apollo Hospital Mumbai',
          bookingType: 'opd',
          date: '2026-06-01',
          timeSlot: '10:00 AM',
          amount: 1080,
          status: 'confirmed',
          doctorName: 'Dr. Priya Sharma'
        },
        {
          _id: '2',
          hospitalName: 'Fortis Hospital Delhi',
          bookingType: 'admission',
          date: '2026-06-05',
          roomType: 'General Ward',
          estimatedDays: 3,
          amount: 5400,
          status: 'pending'
        }
      ];
      setBookings(sampleBookings);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => 
    activeTab === 'upcoming' ? b.status === 'confirmed' || b.status === 'pending' : b.status === 'completed'
  );

  const getStatusBadge = (status) => {
    if (status === 'confirmed') return { color: '#10b981', text: '✅ Confirmed' };
    if (status === 'pending') return { color: '#f59e0b', text: '⏳ Pending' };
    if (status === 'completed') return { color: '#3b82f6', text: '✓ Completed' };
    return { color: '#6b7280', text: status };
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your bookings...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>My Bookings</h1>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <button 
            onClick={() => setActiveTab('upcoming')}
            style={{ padding: '0.5rem 1rem', borderBottom: activeTab === 'upcoming' ? '2px solid #10b981' : 'none', color: activeTab === 'upcoming' ? '#10b981' : '#6b7280', background: 'none', cursor: 'pointer' }}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            style={{ padding: '0.5rem 1rem', borderBottom: activeTab === 'past' ? '2px solid #10b981' : 'none', color: activeTab === 'past' ? '#10b981' : '#6b7280', background: 'none', cursor: 'pointer' }}
          >
            Past
          </button>
        </div>

        {filteredBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
            <p>No bookings found.</p>
            <button onClick={() => navigate('/hospitals')} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>Book a Hospital</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredBookings.map((booking) => {
              const statusBadge = getStatusBadge(booking.status);
              return (
                <div key={booking._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{booking.hospitalName}</h3>
                    <span style={{ backgroundColor: statusBadge.color, color: 'white', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>{statusBadge.text}</span>
                  </div>
                  
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    {booking.bookingType === 'opd' ? '📋 OPD Consultation' : '🏥 Admission'}
                  </p>
                  
                  {booking.bookingType === 'opd' ? (
                    <>
                      <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {booking.timeSlot}</p>
                      <p><strong>Doctor:</strong> {booking.doctorName}</p>
                    </>
                  ) : (
                    <>
                      <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                      <p><strong>Room Type:</strong> {booking.roomType}</p>
                      <p><strong>Estimated Days:</strong> {booking.estimatedDays}</p>
                    </>
                  )}
                  
                  <p><strong>Amount Paid:</strong> ₹{booking.amount}</p>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button onClick={() => navigate(`/booking-details/${booking._id}`)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>View Details</button>
                    {booking.status === 'confirmed' && (
                      <button style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
