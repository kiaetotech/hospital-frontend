import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookCaregiver = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { caregiver } = location.state || {};
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: '',
    patientPhone: '',
    serviceAddress: '',
    startDate: '',
    startTime: '',
    duration: 4,
    requirements: ''
  });

  if (!caregiver) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>No caregiver selected. <button onClick={() => navigate('/caregivers')}>Back to Caregivers</button></div>;
  }

  const hourlyRate = caregiver.pricing?.personal?.hourly || caregiver.pricing?.skilled?.hourly || 300;
  const totalAmount = hourlyRate * formData.duration;
  const platformFee = Math.min(totalAmount * 0.05, 500);
  const finalAmount = totalAmount + platformFee;

  const handleSubmit = (e) => {
    e.preventDefault();
    const bookingData = {
      bookingType: 'caregiver',
      caregiverName: caregiver.fullName,
      patientName: formData.patientName,
      patientPhone: formData.patientPhone,
      serviceAddress: formData.serviceAddress,
      startDate: formData.startDate,
      startTime: formData.startTime,
      duration: formData.duration,
      originalAmount: totalAmount,
      platformFee: platformFee,
      finalAmount: finalAmount
    };
    navigate('/payment', { state: { bookingData } });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Book {caregiver.fullName}</h2>
        
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
          <p><strong>Caregiver:</strong> {caregiver.fullName} ⭐ {caregiver.ratings.average}</p>
          <p><strong>Hourly Rate:</strong> ₹{hourlyRate}/hour</p>
          <p><strong>Experience:</strong> {caregiver.experienceYears} years</p>
          <p><strong>Specializations:</strong> {caregiver.specializations.join(', ')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Patient Name *</label>
            <input type="text" value={formData.patientName} onChange={(e) => setFormData({...formData, patientName: e.target.value})} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Patient Age</label>
            <input type="number" value={formData.patientAge} onChange={(e) => setFormData({...formData, patientAge: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Phone Number *</label>
            <input type="tel" value={formData.patientPhone} onChange={(e) => setFormData({...formData, patientPhone: e.target.value})} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Service Address *</label>
            <textarea value={formData.serviceAddress} onChange={(e) => setFormData({...formData, serviceAddress: e.target.value})} rows="2" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Start Date *</label>
            <input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Start Time *</label>
            <input type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Duration (hours) *</label>
            <input type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})} min="1" max="24" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Special Requirements</label>
            <textarea value={formData.requirements} onChange={(e) => setFormData({...formData, requirements: e.target.value})} rows="2" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <p><strong>Service Charges:</strong> ₹{totalAmount} ({formData.duration} hours @ ₹{hourlyRate}/hr)</p>
            <p><strong>Platform Fee (5%):</strong> ₹{platformFee}</p>
            <p><strong style={{ color: '#10b981' }}>Total Payable:</strong> ₹{finalAmount}</p>
          </div>
          
          <button type="submit" style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookCaregiver;