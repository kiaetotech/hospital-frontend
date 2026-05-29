import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const Ambulance = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedHospital = queryParams.get('hospital') || '';
  const preselectedHospitalId = queryParams.get('hospitalId') || '';

  const [step, setStep] = useState('hospital'); // hospital, ambulance, booking, confirmation
  const [hospitals, setHospitals] = useState([]);
  const [searchHospitalQuery, setSearchHospitalQuery] = useState(preselectedHospital);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [manualHospital, setManualHospital] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [selectedAmbulanceType, setSelectedAmbulanceType] = useState('basic');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Ambulance types with pricing
  const ambulanceTypes = {
    basic: { name: 'Basic Ambulance', basePrice: 500, pricePerKm: 20, icon: '🚑', description: 'Basic life support, first aid' },
    icu: { name: 'ICU Ambulance', basePrice: 800, pricePerKm: 30, icon: '🚨', description: 'ICU equipped, ventilator' },
    cardiac: { name: 'Cardiac Ambulance', basePrice: 1000, pricePerKm: 40, icon: '❤️', description: 'Cardiac care, defibrillator' }
  };

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => {}
      );
    }
  }, []);

  // Search hospitals
  useEffect(() => {
    if (searchHospitalQuery.length > 2) {
      searchHospitals();
    }
  }, [searchHospitalQuery]);

  const searchHospitals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('q', searchHospitalQuery);
      const res = await api.get(`/hospitals/search?${params.toString()}`);
      setHospitals(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance and fare when hospital or location changes
  useEffect(() => {
    if (selectedHospital && userLocation && selectedHospital.location) {
      const dist = calculateDistance(
        userLocation.lat, userLocation.lng,
        selectedHospital.location.lat, selectedHospital.location.lng
      );
      setDistance(dist);
    }
  }, [selectedHospital, userLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 5; // default 5km
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  const calculateFare = (type) => {
    const ambulance = ambulanceTypes[type];
    const dist = distance || 5;
    const total = ambulance.basePrice + (dist * ambulance.pricePerKm);
    const discount = Math.round(total * 0.1);
    return {
      total: total,
      discounted: total - discount,
      discount: discount,
      distance: dist
    };
  };

  const handleSelectHospital = (hospital) => {
    setSelectedHospital(hospital);
    setStep('ambulance');
  };

  const handleManualHospitalSubmit = () => {
    if (manualHospital.trim()) {
      setSelectedHospital({ name: manualHospital, address: { city: '' }, isManual: true });
      setStep('ambulance');
    }
  };

  const handleProceedToBooking = () => {
    setStep('booking');
  };

  const handleConfirmBooking = () => {
    if (!patientName || !patientPhone || !pickupAddress) {
      alert('Please fill all fields');
      return;
    }
    const fare = calculateFare(selectedAmbulanceType);
    const bookingData = {
      ambulanceType: selectedAmbulanceType,
      ambulanceName: ambulanceTypes[selectedAmbulanceType].name,
      hospitalName: selectedHospital.name,
      distance: fare.distance,
      originalAmount: fare.total,
      discount: fare.discount,
      amount: fare.discounted,
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1rem' }}>🚑 Book Ambulance</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Select the hospital you want to go to</p>

          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Search for a hospital</h3>
            <input
              type="text"
              placeholder="Type hospital name..."
              value={searchHospitalQuery}
              onChange={(e) => setSearchHospitalQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem', marginBottom: '1rem' }}
            />
            {loading && <p>Searching...</p>}
            {hospitals.length > 0 && (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {hospitals.map(h => (
                  <div key={h._id} onClick={() => handleSelectHospital(h)} style={{ padding: '0.75rem', borderBottom: '1px solid #eee', cursor: 'pointer', hover: { backgroundColor: '#f3f4f6' } }}>
                    <strong>{h.name}</strong>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{h.address?.city}, {h.address?.state}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Or enter hospital manually</h3>
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
  if (step === 'ambulance' && selectedHospital) {
    const fareBasic = calculateFare('basic');
    const fareIcu = calculateFare('icu');
    const fareCardiac = calculateFare('cardiac');

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={() => setStep('hospital')} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
          
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '0.5rem' }}>Select Ambulance Type</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Destination: <strong>{selectedHospital.name}</strong><br />
            Distance: <strong>{fareBasic.distance} km</strong> from your location
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Basic Ambulance */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', backgroundColor: selectedAmbulanceType === 'basic' ? '#d1fae5' : 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
              <input type="radio" name="ambulanceType" value="basic" checked={selectedAmbulanceType === 'basic'} onChange={() => setSelectedAmbulanceType('basic')} style={{ marginTop: '0.25rem' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{ambulanceTypes.basic.icon}</span>
                  <strong style={{ fontSize: '1.125rem' }}>{ambulanceTypes.basic.name}</strong>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>{ambulanceTypes.basic.description}</p>
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem' }}>Base fare: ₹{ambulanceTypes.basic.basePrice} + ₹{ambulanceTypes.basic.pricePerKm}/km</p>
                  <p style={{ fontWeight: 'bold', color: '#10b981' }}>Total: ₹{fareBasic.discounted} <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#9ca3af' }}>₹{fareBasic.total}</span> (Save ₹{fareBasic.discount})</p>
                </div>
              </div>
            </label>

            {/* ICU Ambulance */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', backgroundColor: selectedAmbulanceType === 'icu' ? '#d1fae5' : 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
              <input type="radio" name="ambulanceType" value="icu" checked={selectedAmbulanceType === 'icu'} onChange={() => setSelectedAmbulanceType('icu')} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{ambulanceTypes.icu.icon}</span>
                  <strong style={{ fontSize: '1.125rem' }}>{ambulanceTypes.icu.name}</strong>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>{ambulanceTypes.icu.description}</p>
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem' }}>Base fare: ₹{ambulanceTypes.icu.basePrice} + ₹{ambulanceTypes.icu.pricePerKm}/km</p>
                  <p style={{ fontWeight: 'bold', color: '#10b981' }}>Total: ₹{fareIcu.discounted} <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#9ca3af' }}>₹{fareIcu.total}</span> (Save ₹{fareIcu.discount})</p>
                </div>
              </div>
            </label>

            {/* Cardiac Ambulance */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', backgroundColor: selectedAmbulanceType === 'cardiac' ? '#d1fae5' : 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
              <input type="radio" name="ambulanceType" value="cardiac" checked={selectedAmbulanceType === 'cardiac'} onChange={() => setSelectedAmbulanceType('cardiac')} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{ambulanceTypes.cardiac.icon}</span>
                  <strong style={{ fontSize: '1.125rem' }}>{ambulanceTypes.cardiac.name}</strong>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>{ambulanceTypes.cardiac.description}</p>
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem' }}>Base fare: ₹{ambulanceTypes.cardiac.basePrice} + ₹{ambulanceTypes.cardiac.pricePerKm}/km</p>
                  <p style={{ fontWeight: 'bold', color: '#10b981' }}>Total: ₹{fareCardiac.discounted} <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{fareCardiac.total}</span> (Save ₹{fareCardiac.discount})</p>
                </div>
              </div>
            </label>
          </div>

          <button onClick={handleProceedToBooking} style={{ width: '100%', backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '1.5rem' }}>
            Continue to Booking
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Patient Details Form
  if (step === 'booking') {
    const fare = calculateFare(selectedAmbulanceType);
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
          <button onClick={() => setStep('ambulance')} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Patient Details</h2>
          
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <p><strong>🚑 {ambulanceTypes[selectedAmbulanceType].name}</strong></p>
            <p><strong>🏥 Destination:</strong> {selectedHospital.name}</p>
            <p><strong>📍 Distance:</strong> {fare.distance} km</p>
            <p><strong>💰 Total Amount:</strong> ₹{fare.discounted} <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{fare.total}</span> (Save ₹{fare.discount})</p>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Patient Name</label>
            <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Patient Phone</label>
            <input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Pickup Address</label>
            <textarea value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} rows="2" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <button onClick={handleConfirmBooking} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Confirm Booking - ₹{fare.discounted}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Ambulance;
