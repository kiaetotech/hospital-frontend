// Location: D:\hospital-frontend\src\pages\ayurveda\BookAyurvedaConsult.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookAyurvedaConsultation } from '../../services/ayurvedaApi';

const BookAyurvedaConsult = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patientName: '',
    phone: '',
    date: '',
    time: '',
    symptoms: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await bookAyurvedaConsultation({ ...form, doctorId });
      setSuccess(true);
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (error) {
      alert('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h1 style={{ color: '#4CAF50', fontSize: '2rem' }}>✅ Booking Confirmed!</h1>
        <p>Redirecting to My Bookings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        📞 Book Ayurvedic Consultation
      </h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input required placeholder="Your Name" value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} style={inputStyle} />
        <input required placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={inputStyle} />
        <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={inputStyle} />
        <select required value={form.time} onChange={e => setForm({...form, time: e.target.value})} style={inputStyle}>
          <option value="">Select Time</option>
          <option value="10:00 AM">10:00 AM</option>
          <option value="2:00 PM">2:00 PM</option>
          <option value="5:00 PM">5:00 PM</option>
        </select>
        <textarea placeholder="Describe your symptoms (optional)" value={form.symptoms} onChange={e => setForm({...form, symptoms: e.target.value})} style={{...inputStyle, height: '100px'}} />
        <button type="submit" disabled={loading} style={{ padding: '1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
          {loading ? 'Booking...' : 'Confirm Booking - ₹500'}
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  padding: '0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  fontSize: '1rem'
};

export default BookAyurvedaConsult;