import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CaregiverProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { caregiver } = location.state || {};

  if (!caregiver) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>No caregiver information found. <button onClick={() => navigate('/caregivers')}>Back</button></div>;
  }

  const getRatingStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '⭐'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
        <button onClick={() => navigate('/caregivers')} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <img src={caregiver.photo} alt={caregiver.fullName} style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{caregiver.fullName}</h1>
            <div>{getRatingStars(caregiver.ratings.average)} ({caregiver.ratings.count} reviews)</div>
            <p>📞 {caregiver.phone}</p>
            <p>📧 {caregiver.email}</p>
            <p>📍 {caregiver.location.city} • {caregiver.distance} km away</p>
            {caregiver.isVerified && <p style={{ color: '#10b981' }}>✓ Verified Caregiver</p>}
          </div>
        </div>

        <hr style={{ margin: '1.5rem 0' }} />

        <h3>About</h3>
        <p><strong>{caregiver.experienceYears} years of experience</strong></p>
        <p><strong>Service Type:</strong> {caregiver.serviceType === 'personal' ? '🩺 Personal Care' : caregiver.serviceType === 'skilled' ? '💉 Skilled Nursing' : '🤝 Both'}</p>
        
        <h3>Certifications</h3>
        <ul>{caregiver.certifications.map(c => <li key={c}>{c}</li>)}</ul>
        
        <h3>Specializations</h3>
        <ul>{caregiver.specializations.map(s => <li key={s}>{s}</li>)}</ul>
        
        <h3>Pricing</h3>
        {caregiver.pricing.personal && <p>Personal Care: ₹{caregiver.pricing.personal.hourly}/hour</p>}
        {caregiver.pricing.skilled && <p>Skilled Nursing: ₹{caregiver.pricing.skilled.hourly}/hour</p>}
        
        <h3>Availability</h3>
        <p>{caregiver.availableDays.join(', ')}</p>
        
        <button onClick={() => navigate(`/book-caregiver/${caregiver._id}`, { state: { caregiver } })} style={{ marginTop: '1rem', width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          Book This Caregiver
        </button>
      </div>
    </div>
  );
};

export default CaregiverProfile;