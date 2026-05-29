import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Ambulance = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('hospital');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [manualHospital, setManualHospital] = useState('');
  const [ambulanceType, setAmbulanceType] = useState('basic');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');

  const ambulanceTypes = {
    basic: { name: 'Basic Ambulance', price: 500, perKm: 20, icon: '🚑' },
    icu: { name: 'ICU Ambulance', price: 800, perKm: 30, icon: '🚨' },
    cardiac: { name: 'Cardiac Ambulance', price: 1000, perKm: 40, icon: '❤️' }
  };

  const hospitalsList = [
    'Apollo Hospital Mumbai',
    'Fortis Hospital Delhi',
    'Manipal Hospital Bangalore',
    'Medicover Hospital Hyderabad',
    'Narayana Health Kolkata'
  ];

  const distance = 5; // fixed 5km for demo
  const selectedType = ambulanceTypes[ambulanceType];
  const total = selectedType.price + (distance * selectedType.perKm);
  const discount = Math.round(total * 0.1);
  const finalAmount = total - discount;

  // Step 1: Select Hospital
  if (step === 'hospital') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e3a8a' }}>🚑 Book Ambulance</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Select the hospital you want to go to</p>

          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem' }}>
            <h3>Select from list</h3>
            {hospitalsList.map(h => (
              <div key={h} onClick={() => { setSelectedHospital(h); setStep('ambulance'); }} style={{ padding: '0.75rem', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                🏥 {h}
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <h3>Or enter hospital manually</h3>
            <input type="text" placeholder="Enter hospital name" value={manualHospital} onChange={(e) => setManualHospital(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem', marginBottom: '1rem' }} />
            <button onClick={() => { setSelectedHospital(manualHospital); setStep('ambulance'); }} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Continue</button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Select Ambulance Type
  if (step === 'ambulance') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
          <button onClick={() => setStep('hospital')} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
          
          <h2>Select Ambulance Type</h2>
          <p>Destination: <strong>{selectedHospital}</strong> | Distance: 5 km</p>

          {Object.keys(ambulanceTypes).map(type => {
            const t = ambulanceTypes[type];
            const price = t.price + (distance * t.perKm);
            const discounted = price - Math.round(price * 0.1);
            return (
              <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: ambulanceType === type ? '#d1fae5' : '#f9fafb', borderRadius: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="ambulance" checked={ambulanceType === type} onChange={() => setAmbulanceType(type)} />
                <div>
                  <strong>{t.icon} {t.name}</strong>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>₹{t.price} + ₹{t.perKm}/km</p>
                  <p style={{ fontWeight: 'bold', color: '#10b981', margin: 0 }}>₹{discounted} (Save ₹{Math.round(price * 0.1)})</p>
                </div>
              </label>
            );
          })}

          <button onClick={() => setStep('booking')} style={{ width: '100%', backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>Continue</button>
        </div>
      </div>
    );
  }

  // Step 3: Patient Details
  if (step === 'booking') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
          <button onClick={() => setStep('ambulance')} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
          
          <h2>Patient Details</h2>
          
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <p><strong>🚑 {ambulanceTypes[ambulanceType].name}</strong></p>
            <p><strong>🏥 Destination:</strong> {selectedHospital}</p>
            <p><strong>💰 Amount:</strong> ₹{finalAmount} (10% discount applied)</p>
          </div>

          <input type="text" placeholder="Patient Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem', marginBottom: '1rem' }} />
          <input type="tel" placeholder="Phone Number" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem', marginBottom: '1rem' }} />
          <textarea placeholder="Pickup Address" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} rows="2" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem', marginBottom: '1rem' }} />

          <button onClick={() => alert(`✅ Ambulance booked!\n\nDestination: ${selectedHospital}\nAmbulance: ${ambulanceTypes[ambulanceType].name}\nPatient: ${patientName}\nAmount: ₹${finalAmount}`)} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Confirm Booking - ₹{finalAmount}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Ambulance;