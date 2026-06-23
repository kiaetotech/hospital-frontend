import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const MentalHealthBooking = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState(null);
  const [bookingData, setBookingData] = useState({
    bookingType: 'video',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    isAnonymous: false,
    isEmergency: false,
    emergencyLevel: 'low',
    crisisNotes: '',
    emergencyContact: { name: '', phone: '', relation: '' }
  });

  useEffect(() => {
    fetchTherapist();
  }, [id]);

  const fetchTherapist = async () => {
    try {
      const res = await axios.get(`/api/mentalhealth/therapists/${id}`);
      if (res.data.success) {
        setTherapist(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching therapist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEmergencyContactChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [name]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to book');
        navigate('/login');
        return;
      }

      const res = await axios.post('/api/mentalhealth/book', {
        therapistId: id,
        ...bookingData,
        scheduledDate: bookingData.scheduledDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        navigate(`/payment?orderId=${res.data.data.orderId}&bookingId=${res.data.data.bookingId}&amount=${res.data.data.amount}`);
      }
    } catch (error) {
      alert('Booking failed: ' + error.response?.data?.message || 'Please try again');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', borderRadius: '1rem', padding: '2rem', color: 'white', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>📋 Book Session</h1>
          <p style={{ opacity: 0.9 }}>with {therapist?.name}</p>
          <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{formatCurrency(therapist?.pricing?.consultation || 500)}/session</p>
        </div>

        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Session Type</label>
            <select name="bookingType" value={bookingData.bookingType} onChange={handleChange} style={inputStyle}>
              <option value="video">🎥 Video Call</option>
              <option value="audio">🎧 Audio Call</option>
              <option value="text">💬 Text Therapy</option>
              <option value="anonymous">🔒 Anonymous Chat</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Date</label>
            <input type="date" name="scheduledDate" value={bookingData.scheduledDate} onChange={handleChange} style={inputStyle} required />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Time</label>
            <input type="time" name="scheduledTime" value={bookingData.scheduledTime} onChange={handleChange} style={inputStyle} required />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Duration (minutes)</label>
            <select name="duration" value={bookingData.duration} onChange={handleChange} style={inputStyle}>
              <option value="30">30 min</option>
              <option value="60">60 min</option>
              <option value="90">90 min</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" name="isAnonymous" checked={bookingData.isAnonymous} onChange={handleChange} />
              Stay Anonymous
            </label>
          </div>

          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" name="isEmergency" checked={bookingData.isEmergency} onChange={handleChange} />
              🆘 This is an Emergency
            </label>
            {bookingData.isEmergency && (
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>Emergency Level</label>
                <select name="emergencyLevel" value={bookingData.emergencyLevel} onChange={handleChange} style={inputStyle}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <textarea name="crisisNotes" placeholder="Describe the situation..." value={bookingData.crisisNotes} onChange={handleChange} style={{ ...inputStyle, minHeight: '60px', marginTop: '0.5rem' }} />
                <div style={{ marginTop: '0.5rem' }}>
                  <h5 style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Emergency Contact</h5>
                  <input type="text" name="name" placeholder="Contact Name" value={bookingData.emergencyContact.name} onChange={handleEmergencyContactChange} style={inputStyle} />
                  <input type="tel" name="phone" placeholder="Phone Number" value={bookingData.emergencyContact.phone} onChange={handleEmergencyContactChange} style={{ ...inputStyle, marginTop: '0.5rem' }} />
                  <input type="text" name="relation" placeholder="Relation" value={bookingData.emergencyContact.relation} onChange={handleEmergencyContactChange} style={{ ...inputStyle, marginTop: '0.5rem' }} />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            style={{ width: '100%', padding: '12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
          >
            💳 Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.6rem',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  fontSize: '0.9rem',
  backgroundColor: 'white',
  outline: 'none'
};

export default MentalHealthBooking;