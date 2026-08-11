import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const HospitalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  const timeSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

  useEffect(() => {
    fetchHospitalDetails();
  }, [id]);

  const fetchHospitalDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/hospitals/${id}`);
      setHospital(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }
    navigate(`/payment?hospitalId=${hospital._id}&date=${selectedDate}&slot=${selectedSlot}&amount=${hospital.pricing?.consultation || 500}`);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading hospital details...</div>;
  }

  if (!hospital) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Hospital not found</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
          ← Back to Hospitals
        </button>

        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{hospital.name}</h1>
          <p>{hospital.address?.city}, {hospital.address?.state}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#fbbf24' }}>⭐</span>
            <span>{hospital.ratings?.average || 'N/A'}</span>
            <span>({hospital.ratings?.count || 0} reviews)</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Hospital Information</h2>
            <p><strong>Consultation Fee:</strong> ₹{hospital.pricing?.consultation || 'N/A'}</p>
            <p><strong>Specialties:</strong> {hospital.specialties?.join(', ') || 'N/A'}</p>
            <p><strong>ICU Beds Available:</strong> {hospital.beds?.icu_available || 'N/A'}</p>
            <p><strong>Emergency:</strong> {hospital.has24x7ER ? '✅ 24/7 Available' : '❌ Not 24/7'}</p>
            <p><strong>Ambulance:</strong> {hospital.ambulance_available ? '✅ Available' : '❌ Not Available'}</p>
            <p><strong>Insurance Accepted:</strong> {hospital.insurance_accepted?.join(', ') || 'N/A'}</p>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Book Appointment</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Select Date</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Select Time Slot</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {timeSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: selectedSlot === slot ? '2px solid #10b981' : '1px solid #d1d5db',
                      backgroundColor: selectedSlot === slot ? '#d1fae5' : 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
              <p><strong>Payment Summary</strong></p>
              <p>Consultation Fee: ₹{hospital.pricing?.consultation || 500}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>You pay at the hospital after visit.</p>
            </div>

            <button
              onClick={handleBooking}
              style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Proceed to Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetails;


