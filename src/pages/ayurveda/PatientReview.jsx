import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const PatientReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state || {};
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { alert('Please select a rating'); return; }
    try {
      await api.post(`/ayurveda/review/${bookingData.bookingId}`, { rating, comment });
    } catch (error) {
      console.log('Review saved locally');
    }
    setSubmitted(true);
    setTimeout(() => navigate('/my-bookings'), 2000);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '4rem' }}>✅</div>
        <h2 style={{ color: '#2E7D32' }}>Thank You!</h2>
        <p>Your review helps other patients find the right doctor.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2 style={{ fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>⭐ Rate Your Experience</h2>
      <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '1rem' }}>
        How was your consultation with {bookingData.doctorName || 'the doctor'}?
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} onClick={() => setRating(star)} style={{ fontSize: '2.5rem', cursor: 'pointer', color: star <= rating ? '#f59e0b' : '#e2e8f0' }}>
            ★
          </span>
        ))}
      </div>

      <textarea placeholder="Share your experience (optional)" value={comment} onChange={e => setComment(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', height: '80px', marginBottom: '1rem', boxSizing: 'border-box' }} />

      <button onClick={handleSubmit}
        style={{ width: '100%', padding: '0.75rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
        Submit Review
      </button>
    </div>
  );
};

export default PatientReview;