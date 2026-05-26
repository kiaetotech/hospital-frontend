import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const BookOPD = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');

  const timeSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

  useEffect(() => {
    fetchHospital();
  }, [id]);

  const fetchHospital = async () => {
    try {
      const res = await api.get(`/hospitals/${id}`);
      setHospital(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !patientName || !patientPhone || !patientAge) {
      alert('Please fill all fields');
      return;
    }
    alert('Booking confirmed! Redirecting to payment...');
    navigate('/payment');
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  const consultationFee = hospital?.pricing?.consultation || 500;
  const discountedPrice = Math.round(consultationFee * 0.9);

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
      <h2>Book OPD Consultation</h2>
      <p><strong>Hospital:</strong> {hospital?.name}</p>
      
      <div style={{ marginBottom: '1rem' }}>
        <label>Patient Name</label>
        <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ccc', borderRadius: '0.25rem' }} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label>Phone Number</label>
        <input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ccc', borderRadius: '0.25rem' }} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label>Age</label>
        <input type="number" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ccc', borderRadius: '0.25rem' }} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label>Select Date</label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ccc', borderRadius: '0.25rem' }} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label>Select Time Slot</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
          {timeSlots.map((slot, idx) => (
            <button key={idx} onClick={() => setSelectedSlot(slot)} style={{ padding: '0.5rem', backgroundColor: selectedSlot === slot ? '#10b981' : '#f3f4f6', border: '1px solid #ddd', borderRadius: '0.25rem', cursor: 'pointer' }}>{slot}</button>
          ))}
        </div>
      </div>
      
      <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <p><strong>Price Details:</strong></p>
        <p>Original Fee: ₹{consultationFee}</p>
        <p style={{ color: '#10b981' }}>KiaetoCare Discount (10%): -₹{consultationFee - discountedPrice}</p>
        <p><strong>You Pay: ₹{discountedPrice}</strong></p>
      </div>
      
      <button onClick={handleBooking} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Confirm Booking</button>
    </div>
  );
};

export default BookOPD;
