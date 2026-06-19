import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const dummyPackages = {
  'PKG001': { name: '7-Day Panchakarma Detox', price: 25000, duration: 7, centerName: 'AyurVeda Retreat Rishikesh' },
  'PKG002': { name: '14-Day Rejuvenation', price: 45000, duration: 14, centerName: 'AyurVeda Retreat Rishikesh' },
  'PKG003': { name: '21-Day Complete Transformation', price: 65000, duration: 21, centerName: 'AyurVeda Retreat Rishikesh' },
  'PKG004': { name: '5-Day Kerala Detox', price: 18000, duration: 5, centerName: 'Kerala Ayurveda Kendra' },
  'PKG005': { name: '10-Day Panchakarma', price: 35000, duration: 10, centerName: 'Kerala Ayurveda Kendra' },
  'PKG006': { name: '3-Day Wellness Weekend', price: 12000, duration: 3, centerName: 'Dhanvantari Wellness Center' },
  'PKG007': { name: '7-Day Stress Relief', price: 28000, duration: 7, centerName: 'Dhanvantari Wellness Center' },
  'PKG008': { name: '14-Day Complete Detox', price: 50000, duration: 14, centerName: 'Dhanvantari Wellness Center' },
};

const BookPanchakarmaPackage = () => {
  const { centerId, packageId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    email: '',
    startDate: '',
    persons: 1,
    medicalHistory: '',
    accommodation: 'shared'
  });

  const pkg = dummyPackages[packageId] || { name: 'Custom Package', price: 20000, duration: 7, centerName: 'Center' };
  const commission = pkg.price * 0.20;
  const totalAmount = pkg.price;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      // Generate booking ID
      const bookingId = 'AYB' + Date.now();
      navigate(`/ayurveda/payment/panchakarma/${bookingId}`, {
        state: {
          bookingId,
          ...formData,
          packageName: pkg.name,
          packageId,
          centerId,
          centerName: pkg.centerName,
          amount: totalAmount,
          commission: commission,
          duration: pkg.duration
        }
      });
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
      {/* Progress Steps */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        {[1, 2].map(s => (
          <div key={s} style={{
            width: '40px', height: '40px', borderRadius: '50%',
            backgroundColor: step >= s ? '#FF9800' : '#e2e8f0',
            color: step >= s ? 'white' : '#64748b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', margin: '0 0.5rem'
          }}>
            {step > s ? '✅' : s}
          </div>
        ))}
      </div>

      {/* Package Summary */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem',
        borderLeft: '4px solid #FF9800'
      }}>
        <h2 style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>{pkg.name}</h2>
        <p style={{ color: '#64748b' }}>🏨 {pkg.centerName}</p>
        <p style={{ color: '#64748b' }}>📅 {pkg.duration} Days</p>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#FF9800' }}>₹{totalAmount.toLocaleString()}</span>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Incl. 20% platform fee</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 ? (
          /* Step 1: Patient Details */
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>Patient Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required placeholder="Full Name" value={formData.patientName} 
                onChange={(e) => setFormData({...formData, patientName: e.target.value})} style={inputStyle} />
              <input required placeholder="Phone Number" value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
              <input required type="email" placeholder="Email" value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})} style={inputStyle} />
              <input required type="date" placeholder="Preferred Start Date" value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})} style={inputStyle} />
              <select value={formData.persons}
                onChange={(e) => setFormData({...formData, persons: e.target.value})} style={inputStyle}>
                <option value="1">1 Person</option>
                <option value="2">2 Persons</option>
              </select>
              <textarea placeholder="Medical History / Special Requirements" value={formData.medicalHistory}
                onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})} 
                style={{...inputStyle, height: '80px'}} />
            </div>
          </div>
        ) : (
          /* Step 2: Review */
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>Review Booking</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                ['Package', pkg.name],
                ['Center', pkg.centerName],
                ['Duration', `${pkg.duration} Days`],
                ['Patient', formData.patientName],
                ['Phone', formData.phone],
                ['Start Date', formData.startDate],
                ['Persons', formData.persons],
                ['Total Amount', `₹${totalAmount.toLocaleString()}`],
              ].map(([label, value], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>{label}</span>
                  <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          {step === 2 && (
            <button type="button" onClick={() => setStep(1)}
              style={{ flex: 1, padding: '1rem', backgroundColor: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
              ← Back
            </button>
          )}
          <button type="submit"
            style={{ flex: 1, padding: '1rem', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
            {step === 1 ? 'Continue to Review →' : `Proceed to Pay ₹${totalAmount.toLocaleString()}`}
          </button>
        </div>
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

export default BookPanchakarmaPackage;