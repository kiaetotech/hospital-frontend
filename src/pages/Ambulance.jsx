import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Ambulance = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('hospital');
  const [hospitals, setHospitals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [manualHospital, setManualHospital] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(5);
  const [ambulanceType, setAmbulanceType] = useState('basic');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const ambulanceTypes = {
    basic: { name: 'Basic Ambulance', basePrice: 500, pricePerKm: 20, icon: '🚑', desc: 'Basic life support, first aid' },
    icu: { name: 'ICU Ambulance', basePrice: 800, pricePerKm: 30, icon: '🚨', desc: 'ICU equipped, ventilator' },
    cardiac: { name: 'Cardiac Ambulance', basePrice: 1000, pricePerKm: 40, icon: '❤️', desc: 'Cardiac care, defibrillator' }
  };

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => setDistance(5)
      );
    }
  }, []);

  // Search hospitals
  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(() => {
        searchHospitals();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const searchHospitals = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/hospitals/search?q=${searchQuery}`);
      setHospitals(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 5;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  const handleSelectHospital = (hospital) => {
    if (userLocation && hospital.location) {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, hospital.location.lat, hospital.location.lng);
      setDistance(dist);
    }
    setSelectedHospital(hospital);
    setStep('ambulance');
  };

  const handleManualHospitalSubmit = () => {
    if (manualHospital.trim()) {
      setSelectedHospital({ name: manualHospital, isManual: true });
      setStep('ambulance');
    }
  };

  const calculateFare = () => {
    const type = ambulanceTypes[ambulanceType];
    const total = type.basePrice + (distance * type.pricePerKm);
    const discount = Math.round(total * 0.1);
    return { total, discount, final: total - discount };
  };

  const handleConfirmBooking = () => {
    if (!patientName || !patientPhone || !pickupAddress) {
      alert('Please fill all fields');
      return;
    }
    const fare = calculateFare();
    const bookingData = {
      ambulanceType: ambulanceType,
      ambulanceName: ambulanceTypes[ambulanceType].name,
      hospitalName: selectedHospital.name,
      distance: distance,
      originalAmount: fare.total,
      discount: fare.discount,
      amount: fare.final,
      patientName,
      patientPhone,
      pickupAddress
    };
    navigate('/ambulance-confirmation', { state: { booking: bookingData } });
  };

  // Step 1: Select Hospital
  if (step === 'hospital') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e3a8a' }}>🚑 Book Ambulance</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Select the hospital you want to go to</p>

          {/* Search for hospitals */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem' }}>
            <h3>Search for a hospital</h3>
            <input
              type="text"
              placeholder="Type hospital name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem', marginBottom: '1rem' }}
            />
            {loading && <p>Searching...</p>}
            {hospitals.length > 0 && (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {hospitals.map(h => (
                  <div key={h._id} onClick={() => handleSelectHospital(h)} style={{ padding: '0.75rem', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                    <strong>🏥 {h.name}</strong>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{h.address?.city}, {h.address?.state}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manual hospital entry */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <h3>Or enter hospital manually</h3>
            <input
              type="text"
              placeholder="Enter hospital name and address"
              value={manualHospital}
              onChange={(e) => setManualHospital(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem', marginBottom: '1rem' }}
            />
            <button onClick={handleManualHospitalSubmit} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
              Continue with this hospital
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Select Ambulance Type
  if (step === 'ambulance') {
    const fare = calculateFare();
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
          <button onClick={() => setStep('hospital')} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
          
          <h2>Select Ambulance Type</h2>
          <p style={{ marginBottom: '1rem' }}>
            🏥 <strong>Destination:</strong> {selectedHospital.name}<br />
            📍 <strong>Distance:</strong> {distance} km from your location
          </p>

          {Object.keys(ambulanceTypes).map(type => {
            const t = ambulanceTypes[type];
            const total = t.basePrice + (distance * t.pricePerKm);
            const discount = Math.round(total * 0.1);
            const finalPrice = total - discount;
            return (
              <label key={type} style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: ambulanceType === type ? '#d1fae5' : '#f9fafb', borderRadius: '0.5rem', marginBottom: '0.75rem', cursor: 'pointer', border: ambulanceType === type ? '2px solid #10b981' : '1px solid #e5e7eb' }}>
                <input type="radio" name="ambulance" checked={ambulanceType === type} onChange={() => setAmbulanceType(type)} />
                <div style={{ flex: 1 }}>
                  <strong>{t.icon} {t.name}</strong>
                  <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}>{t.desc}</p>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>Base: ₹{t.basePrice} + ₹{t.pricePerKm}/km</p>
                  <p style={{ fontWeight: 'bold', color: '#10b981', margin: '0.25rem 0 0 0' }}>₹{finalPrice} <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontWeight: 'normal' }}>₹{total}</span> (Save ₹{discount})</p>
                </div>
              </label>
            );
          })}

          <button onClick={() => setStep('booking')} style={{ width: '100%', backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
            Continue to Booking
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Patient Details
  if (step === 'booking') {
    const fare = calculateFare();
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
          <button onClick={() => setStep('ambulance')} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
          
          <h2>Patient Details</h2>
          
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <p><strong>{ambulanceTypes[ambulanceType].icon} {ambulanceTypes[ambulanceType].name}</strong></p>
            <p><strong>🏥 Destination:</strong> {selectedHospital.name}</p>
            <p><strong>📍 Distance:</strong> {distance} km</p>
            <p><strong>💰 Original Amount:</strong> ₹{fare.total}</p>
            <p><strong>🎉 Discount (10%):</strong> -₹{fare.discount}</p>
            <p><strong style={{ color: '#10b981' }}>Total Payable:</strong> ₹{fare.final}</p>
          </div>

          <input type="text" placeholder="Patient Full Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem', marginBottom: '1rem' }} />
          <input type="tel" placeholder="Phone Number" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem', marginBottom: '1rem' }} />
          <textarea placeholder="Pickup Address (Your location)" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} rows="2" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem', marginBottom: '1rem' }} />

          <button onClick={handleConfirmBooking} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Confirm Booking - ₹{fare.final}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Ambulance;