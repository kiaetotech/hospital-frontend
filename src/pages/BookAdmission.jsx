import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const BookAdmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomType, setRoomType] = useState('general');
  const [estimatedDays, setEstimatedDays] = useState(3);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [reason, setReason] = useState('');

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
    if (!patientName || !patientPhone || !reason) {
      alert('Please fill all fields');
      return;
    }
    alert('Admission booking confirmed! Hospital will contact you.');
    navigate('/');
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  const icuRate = hospital?.pricing?.icu_bed_per_day || 5000;
  const generalRate = hospital?.pricing?.general_bed_per_day || 2000;
  const total = (roomType === 'icu' ? icuRate : generalRate) * estimatedDays;
  const discountedTotal = Math.round(total * 0.9);

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
      <h2>Book Hospital Admission</h2>
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
        <label>Reason for Admission</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="3" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ccc', borderRadius: '0.25rem' }} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label>Room Type</label>
        <select value={roomType} onChange={(e) => setRoomType(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ccc', borderRadius: '0.25rem' }}>
          <option value="general">General Ward - ₹{generalRate}/day</option>
          <option value="icu">ICU - ₹{icuRate}/day</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label>Estimated Days</label>
        <input type="number" value={estimatedDays} onChange={(e) => setEstimatedDays(e.target.value)} min="1" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ccc', borderRadius: '0.25rem' }} />
      </div>
      
      <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <p><strong>Price Details:</strong></p>
        <p>Estimated Total: ₹{total}</p>
        <p style={{ color: '#10b981' }}>KiaetoCare Discount (10%): -₹{total - discountedTotal}</p>
        <p><strong>You Pay: ₹{discountedTotal}</strong></p>
      </div>
      
      <button onClick={handleBooking} style={{ width: '100%', backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Confirm Admission</button>
    </div>
  );
};

export default BookAdmission;
