import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Ambulance = () => {
  const navigate = useNavigate();
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [bookingStep, setBookingStep] = useState('list'); // list, form, confirmation
  
  // Booking form state
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [distance, setDistance] = useState(5); // default 5km
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => {}
      );
    }
  }, []);

  // Fetch ambulances
  useEffect(() => {
    fetchAmbulances();
  }, [city, userLocation]);

  const fetchAmbulances = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
      }
      const res = await api.get(`/ambulance/available?${params.toString()}`);
      setAmbulances(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAmbulances();
  };

  const calculateEstimatedPrice = (ambulance, dist) => {
    const total = ambulance.basePrice + (dist * ambulance.pricePerKm);
    const discount = Math.round(total * 0.1);
    return total - discount;
  };

  const handleSelectAmbulance = (ambulance) => {
    setSelectedAmbulance(ambulance);
    const price = calculateEstimatedPrice(ambulance, distance);
    setEstimatedPrice(price);
    setBookingStep('form');
  };

  const handleBook = async () => {
    if (!patientName || !patientPhone || !pickupAddress || !dropAddress) {
      alert('Please fill all fields');
      return;
    }
    
    try {
      const bookingData = {
        ambulanceId: selectedAmbulance._id,
        patientName,
        patientPhone,
        pickupAddress,
        dropAddress,
        distance,
        pickupLocation: userLocation || { lat: 0, lng: 0 },
        dropLocation: { lat: 0, lng: 0 }
      };
      
      const res = await api.post('/ambulance/book', bookingData);
      alert(res.data.message);
      navigate(`/ambulance-tracking/${res.data.data._id}`);
    } catch (error) {
      alert('Booking failed. Please try again.');
    }
  };

  const getAmbulanceTypeIcon = (type) => {
    if (type === 'icu') return '🚨';
    if (type === 'cardiac') return '❤️';
    return '🚑';
  };

  if (bookingStep === 'form' && selectedAmbulance) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
          <button onClick={() => setBookingStep('list')} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Book Ambulance</h2>
          
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <p><strong>{selectedAmbulance.providerName}</strong></p>
            <p>🚑 {selectedAmbulance.type.toUpperCase()} Ambulance</p>
            <p>Driver: {selectedAmbulance.driverName} ⭐ {selectedAmbulance.driverRating}</p>
            <p>Vehicle: {selectedAmbulance.vehicleNumber}</p>
            <p>Base Price: ₹{selectedAmbulance.basePrice} + ₹{selectedAmbulance.pricePerKm}/km</p>
            <p><strong>Estimated Total: ₹{estimatedPrice}</strong> (10% discount included)</p>
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
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Destination Hospital</label>
            <textarea value={dropAddress} onChange={(e) => setDropAddress(e.target.value)} rows="2" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Estimated Distance (km)</label>
            <input type="number" value={distance} onChange={(e) => {
              setDistance(e.target.value);
              setEstimatedPrice(calculateEstimatedPrice(selectedAmbulance, e.target.value));
            }} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <button onClick={handleBook} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Confirm Booking - ₹{estimatedPrice}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a' }}>🚑 Book Ambulance</h1>
        
        <form onSubmit={handleSearch} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', margin: '1rem 0', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} style={{ flex: 2, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Search</button>
        </form>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading ambulances...</div>
        ) : ambulances.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
            <p>No ambulances available in your area.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {ambulances.map(amb => (
              <div key={amb._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{getAmbulanceTypeIcon(amb.type)} {amb.providerName}</h2>
                  <span style={{ backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem' }}>Available Now</span>
                </div>
                <p>🚑 {amb.type.toUpperCase()} Ambulance</p>
                <p>⭐ Driver: {amb.driverName} ({amb.driverRating})</p>
                <p>📞 {amb.driverPhone}</p>
                <p>🚗 {amb.vehicleNumber}</p>
                <p>💰 Base: ₹{amb.basePrice} + ₹{amb.pricePerKm}/km</p>
                {amb.distance && <p>📍 {amb.distance} km away</p>}
                <button onClick={() => handleSelectAmbulance(amb)} style={{ marginTop: '0.5rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                  Select & Book
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ambulance;