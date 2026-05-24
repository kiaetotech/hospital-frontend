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

  const handleBooking = async () => {
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
        <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>

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
            <h2>Hospital Information</h2>
            <p><strong>Consultation Fee:</strong> ₹{hospital.pricing?.consultation || 'N/A'}</p>
            <p><strong>Specialties:</strong> {hospital.specialties?.join(', ') || 'N/A'}</p>
            <p><strong>ICU Beds:</strong> {hospital.beds?.icu || 'N/A'}</p>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <h2>Book Appointment</h2>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
              {timeSlots.map((slot, idx) => (
                <button key={idx} onClick={() => setSelectedSlot(slot)} style={{ padding: '0.5rem', backgroundColor: selectedSlot === slot ? '#10b981' : '#e5e7eb', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>{slot}</button>
              ))}
            </div>
            <button onClick={handleBooking} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>Proceed to Book</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetails;