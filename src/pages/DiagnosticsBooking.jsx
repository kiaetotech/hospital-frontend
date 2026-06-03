import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DiagnosticsBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemType, itemId, itemName, originalPrice, discountedPrice } = location.state || {};
  
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: '',
    patientPhone: '',
    address: '',
    appointmentDate: '',
    timeSlot: ''
  });

  if (!itemId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No booking information found.</p>
        <button onClick={() => navigate('/diagnostics')}>Go Back</button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.patientPhone || !formData.address || !formData.appointmentDate) {
      alert('Please fill all required fields');
      return;
    }
    
    const bookingData = {
      bookingType: 'diagnostics',
      itemType,
      itemId,
      itemName,
      originalPrice,
      discountedPrice,
      patientName: formData.patientName,
      patientAge: formData.patientAge,
      patientGender: formData.patientGender,
      patientPhone: formData.patientPhone,
      address: formData.address,
      appointmentDate: formData.appointmentDate,
      timeSlot: formData.timeSlot
    };
    
    navigate('/payment', { state: { bookingData } });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Book {itemName}</h2>
        
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
          <p><strong>Item:</strong> {itemName}</p>
          <p><strong>Original Price:</strong> ₹{originalPrice}</p>
          <p><strong>Discounted Price:</strong> ₹{discountedPrice}</p>
          <p><strong>You Save:</strong> ₹{originalPrice - discountedPrice} (10% off)</p>
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
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Patient Gender</label>
            <select value={formData.patientGender} onChange={(e) => setFormData({...formData, patientGender: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Phone Number *</label>
            <input type="tel" value={formData.patientPhone} onChange={(e) => setFormData({...formData, patientPhone: e.target.value})} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Address *</label>
            <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows="2" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Appointment Date *</label>
            <input type="date" value={formData.appointmentDate} onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})} required min={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Preferred Time Slot</label>
            <select value={formData.timeSlot} onChange={(e) => setFormData({...formData, timeSlot: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
              <option value="">Select</option>
              <option value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</option>
              <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
              <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
              <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
              <option value="3:00 PM - 4:00 PM">3:00 PM - 4:00 PM</option>
            </select>
          </div>
          
          <button type="submit" style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Proceed to Payment - ₹{discountedPrice}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DiagnosticsBooking;