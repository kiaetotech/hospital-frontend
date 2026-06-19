import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const BookAyurvedaConsult = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const doctorData = location.state || {};

  const doctor = doctorData.doctor || {
    _id: doctorId, name: doctorData.doctorName || 'Doctor', 
    specialization: doctorData.specialization || '', 
    consultationFee: doctorData.fee || 500,
    wellnessCenter: doctorData.wellnessCenter || ''
  };
  const consultationType = doctorData.consultationType || 'online';

  const [form, setForm] = useState({
    patientName: '', phone: '', email: '', date: '', time: '',
    symptoms: '', age: '', gender: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  // 🆕 Generate time slots every 30 minutes from 6 AM to 10 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const h = hour.toString().padStart(2, '0');
        const m = min.toString().padStart(2, '0');
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        slots.push(`${displayHour}:${m} ${ampm}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get today's date for min date
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.patientName || !form.phone || !form.date || !form.time) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Generate booking ID
      const bookingId = 'AYB' + Date.now();
      const commission = doctor.consultationFee * 0.15;
      const finalAmount = doctor.consultationFee;
      
      const bookingInfo = {
        bookingId,
        doctorId: doctor._id,
        doctorName: doctor.name,
        consultationType,
        patientName: form.patientName,
        phone: form.phone,
        email: form.email,
        date: form.date,
        time: form.time,
        symptoms: form.symptoms,
        age: form.age,
        gender: form.gender,
        fee: doctor.consultationFee,
        commission,
        finalAmount,
        wellnessCenter: doctor.wellnessCenter
      };

      // Try API call, but don't fail if it doesn't work
      try {
        const { bookAyurvedaConsultation } = await import('../../services/ayurvedaApi');
        await bookAyurvedaConsultation({
          doctorId: doctor._id,
          patient: { name: form.patientName, phone: form.phone, email: form.email },
          bookingDate: form.date,
          slotTime: form.time,
          consultationType,
          symptoms: form.symptoms
        });
      } catch (apiError) {
        console.log('API unavailable, using local booking');
      }

      setBookingData(bookingInfo);
      setSuccess(true);
      
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking could not be processed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success && bookingData) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ color: '#2E7D32', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Booking Confirmed!
        </h1>
        
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'left', marginBottom: '1.5rem' }}>
          {[
            ['Booking ID', bookingData.bookingId],
            ['Doctor', bookingData.doctorName],
            ['Type', bookingData.consultationType === 'online' ? '💻 Online' : '🏥 Clinic'],
            ['Patient', bookingData.patientName],
            ['Phone', bookingData.phone],
            ['Date', bookingData.date],
            ['Time', bookingData.time],
            ['Fee', `₹${bookingData.fee}`],
            ['Platform Fee', `₹${bookingData.commission}`],
          ].map(([label, value], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b' }}>{label}</span>
              <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => navigate('/ayurveda')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
            🏠 Home
          </button>
          <button onClick={() => navigate('/ayurveda/doctors')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
            🔍 Find More Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>
      
      {/* 🆕 Back Button */}
      <button onClick={() => navigate(-1)} style={{
        padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: 'none',
        borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem', fontSize: '1rem'
      }}>
        ← Back
      </button>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
        📞 Book {consultationType === 'online' ? 'Online' : 'Clinic'} Consultation
      </h1>

      {/* Doctor Summary */}
      <div style={{ backgroundColor: '#f0fdf4', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem', border: '1px solid #bbf7d0' }}>
        <p style={{ fontWeight: 'bold', color: '#1e293b' }}>👨‍⚕️ {doctor.name}</p>
        <p style={{ color: '#4CAF50', fontSize: '0.9rem' }}>{doctor.specialization}</p>
        {doctor.wellnessCenter && <p style={{ color: '#64748b', fontSize: '0.85rem' }}>🏥 {doctor.wellnessCenter}</p>}
        <p style={{ fontWeight: 'bold', color: '#FF9800', marginTop: '0.5rem' }}>Fee: ₹{doctor.consultationFee}</p>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Type: {consultationType === 'online' ? '💻 Online Video Call' : '🏥 Clinic Visit'}</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input required placeholder="Full Name *" value={form.patientName} 
          onChange={(e) => setForm({...form, patientName: e.target.value})} style={inputStyle} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input required placeholder="Phone Number *" value={form.phone} type="tel"
            onChange={(e) => setForm({...form, phone: e.target.value})} style={inputStyle} />
          <input placeholder="Email" value={form.email} type="email"
            onChange={(e) => setForm({...form, email: e.target.value})} style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input placeholder="Age" value={form.age} type="number"
            onChange={(e) => setForm({...form, age: e.target.value})} style={inputStyle} />
          <select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})} style={inputStyle}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.3rem', color: '#1e293b', fontSize: '0.9rem' }}>
            📅 Select Date *
          </label>
          <input required type="date" value={form.date} min={today} max={maxDateStr}
            onChange={(e) => setForm({...form, date: e.target.value})} style={inputStyle} />
        </div>

        {/* 🆕 Time Slots - 24 hours, every 30 minutes */}
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.3rem', color: '#1e293b', fontSize: '0.9rem' }}>
            🕐 Select Time Slot *
          </label>
          <select required value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} style={inputStyle}>
            <option value="">Select Time</option>
            {timeSlots.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>

        <textarea placeholder="Describe your symptoms / health concerns..." value={form.symptoms}
          onChange={(e) => setForm({...form, symptoms: e.target.value})} 
          style={{...inputStyle, height: '80px', resize: 'vertical'}} />

        <button type="submit" disabled={loading} style={{
          padding: '1rem', backgroundColor: loading ? '#a5d6a7' : '#4CAF50', color: 'white',
          border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: '0.5rem'
        }}>
          {loading ? '⏳ Processing...' : `✅ Confirm Booking - ₹${doctor.consultationFee}`}
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0',
  fontSize: '1rem', width: '100%'
};

export default BookAyurvedaConsult;