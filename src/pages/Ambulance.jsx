import React, { useState } from 'react';

const Ambulance = () => {
  const [step, setStep] = useState(1);
  const [hospital, setHospital] = useState('');
  const [ambulanceType, setAmbulanceType] = useState('basic');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');

  const ambulanceTypes = {
    basic: { name: 'Basic Ambulance', price: 500, perKm: 20, icon: '🚑' },
    icu: { name: 'ICU Ambulance', price: 800, perKm: 30, icon: '🚨' },
    cardiac: { name: 'Cardiac Ambulance', price: 1000, perKm: 40, icon: '❤️' }
  };

  const distance = 5;
  const selected = ambulanceTypes[ambulanceType];
  const total = selected.price + (distance * selected.perKm);
  const discount = Math.round(total * 0.1);
  const finalAmount = total - discount;

  // Step 1: Enter Hospital Name
  if (step === 1) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1>🚑 Book Ambulance</h1>
        <p>Which hospital do you want to go to?</p>
        <input
          type="text"
          placeholder="Enter hospital name"
          value={hospital}
          onChange={(e) => setHospital(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', margin: '1rem 0', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button
          onClick={() => setStep(2)}
          disabled={!hospital.trim()}
          style={{ width: '100%', padding: '0.5rem', backgroundColor: hospital.trim() ? '#007bff' : '#ccc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Continue
        </button>
      </div>
    );
  }

  // Step 2: Select Ambulance Type
  if (step === 2) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <button onClick={() => setStep(1)} style={{ marginBottom: '1rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>← Back</button>
        <h2>Select Ambulance Type</h2>
        <p>Destination: <strong>{hospital}</strong> | Distance: 5 km</p>

        {Object.keys(ambulanceTypes).map(type => {
          const t = ambulanceTypes[type];
          const price = t.price + (distance * t.perKm);
          const disc = Math.round(price * 0.1);
          const final = price - disc;
          return (
            <label key={type} style={{ display: 'block', padding: '0.5rem', margin: '0.5rem 0', backgroundColor: ambulanceType === type ? '#d1fae5' : '#f9fafb', borderRadius: '4px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="ambulance"
                checked={ambulanceType === type}
                onChange={() => setAmbulanceType(type)}
              />
              <strong>{t.icon} {t.name}</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>Base: ₹{t.price} + ₹{t.perKm}/km</p>
              <p style={{ fontWeight: 'bold', color: '#10b981', margin: 0 }}>₹{final} (Save ₹{disc})</p>
            </label>
          );
        })}

        <button onClick={() => setStep(3)} style={{ width: '100%', padding: '0.5rem', marginTop: '1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Continue to Booking
        </button>
      </div>
    );
  }

  // Step 3: Patient Details
  if (step === 3) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <button onClick={() => setStep(2)} style={{ marginBottom: '1rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>← Back</button>
        
        <h2>Patient Details</h2>
        
        <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
          <p><strong>{ambulanceTypes[ambulanceType].icon} {ambulanceTypes[ambulanceType].name}</strong></p>
          <p><strong>Destination:</strong> {hospital}</p>
          <p><strong>Amount:</strong> ₹{finalAmount} (10% discount applied)</p>
        </div>

        <input
          type="text"
          placeholder="Patient Full Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', margin: '1rem 0', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={patientPhone}
          onChange={(e) => setPatientPhone(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', margin: '1rem 0', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <textarea
          placeholder="Pickup Address"
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
          rows="2"
          style={{ width: '100%', padding: '0.5rem', margin: '1rem 0', border: '1px solid #ccc', borderRadius: '4px' }}
        />

        <button
          onClick={() => {
            if (!patientName || !patientPhone || !pickupAddress) {
              alert('Please fill all fields');
              return;
            }
            alert(`✅ Ambulance Booked!\n\nHospital: ${hospital}\nAmbulance: ${ambulanceTypes[ambulanceType].name}\nPatient: ${patientName}\nAmount: ₹${finalAmount}`);
            window.location.href = '/';
          }}
          style={{ width: '100%', padding: '0.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Confirm Booking - ₹{finalAmount}
        </button>
      </div>
    );
  }

  return null;
};

export default Ambulance;