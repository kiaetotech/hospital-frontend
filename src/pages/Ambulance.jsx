import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Ambulance = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [bookingStep, setBookingStep] = useState('list');
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');

  // Mock ambulance data
  const ambulances = [
    {
      id: 1,
      providerName: 'City Ambulance Service',
      vehicleNumber: 'MH-01-AB-1234',
      type: 'basic',
      driverName: 'Ramesh Kumar',
      driverPhone: '9876543210',
      driverRating: 4.8,
      basePrice: 500,
      pricePerKm: 20,
      city: 'Mumbai',
      distance: '2.3 km'
    },
    {
      id: 2,
      providerName: 'LifeLine Ambulance',
      vehicleNumber: 'MH-02-CD-5678',
      type: 'icu',
      driverName: 'Suresh Patil',
      driverPhone: '9876543211',
      driverRating: 4.9,
      basePrice: 800,
      pricePerKm: 30,
      city: 'Mumbai',
      distance: '3.1 km'
    },
    {
      id: 3,
      providerName: 'FastTrack Ambulance',
      vehicleNumber: 'DL-01-EF-9012',
      type: 'cardiac',
      driverName: 'Rajesh Singh',
      driverPhone: '9876543212',
      driverRating: 4.7,
      basePrice: 1000,
      pricePerKm: 40,
      city: 'Delhi',
      distance: '1.8 km'
    },
    {
      id: 4,
      providerName: 'Saver Ambulance',
      vehicleNumber: 'KA-01-GH-3456',
      type: 'basic',
      driverName: 'Prakash Rao',
      driverPhone: '9876543213',
      driverRating: 4.6,
      basePrice: 450,
      pricePerKm: 18,
      city: 'Bangalore',
      distance: '4.2 km'
    }
  ];

  const filteredAmbulances = city ? ambulances.filter(a => a.city.toLowerCase().includes(city.toLowerCase())) : ambulances;

  const handleSelectAmbulance = (amb) => {
    setSelectedAmbulance(amb);
    setBookingStep('form');
  };

  const handleBook = () => {
    if (!patientName || !patientPhone || !pickupAddress || !dropAddress) {
      alert('Please fill all fields');
      return;
    }
    const estimatedDistance = 5;
    const total = selectedAmbulance.basePrice + (estimatedDistance * selectedAmbulance.pricePerKm);
    const discount = Math.round(total * 0.1);
    const finalAmount = total - discount;
    
    alert(`✅ Ambulance booked successfully!\n\n🚑 ${selectedAmbulance.providerName}\n👨‍✈️ Driver: ${selectedAmbulance.driverName}\n📞 ${selectedAmbulance.driverPhone}\n💰 Amount: ₹${finalAmount} (10% discount applied)\n\nAmbulance is on its way!`);
    navigate('/');
  };

  const getTypeIcon = (type) => {
    if (type === 'icu') return '🚨';
    if (type === 'cardiac') return '❤️';
    return '🚑';
  };

  if (bookingStep === 'form' && selectedAmbulance) {
    const estimatedDistance = 5;
    const total = selectedAmbulance.basePrice + (estimatedDistance * selectedAmbulance.pricePerKm);
    const discount = Math.round(total * 0.1);
    const finalAmount = total - discount;

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
          <button onClick={() => setBookingStep('list')} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Book Ambulance</h2>
          
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <p><strong>{getTypeIcon(selectedAmbulance.type)} {selectedAmbulance.providerName}</strong></p>
            <p>Type: {selectedAmbulance.type.toUpperCase()}</p>
            <p>Driver: {selectedAmbulance.driverName} ⭐ {selectedAmbulance.driverRating}</p>
            <p>Vehicle: {selectedAmbulance.vehicleNumber}</p>
            <p>Base Price: ₹{selectedAmbulance.basePrice} + ₹{selectedAmbulance.pricePerKm}/km</p>
            <p><strong>Estimated Total: ₹{finalAmount}</strong> (10% discount included)</p>
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
          
          <button onClick={handleBook} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Confirm Booking - ₹{finalAmount}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a' }}>🚑 Book Ambulance</h1>
        
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', margin: '1rem 0' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Enter city (Mumbai, Delhi, Bangalore)" 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              style={{ flex: 2, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} 
            />
            <button onClick={() => setCity(city)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Search</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAmbulances.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
              <p>No ambulances available in {city || 'your area'}.</p>
            </div>
          ) : (
            filteredAmbulances.map(amb => (
              <div key={amb.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{getTypeIcon(amb.type)} {amb.providerName}</h2>
                  <span style={{ backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem' }}>Available Now</span>
                </div>
                <p>Type: {amb.type.toUpperCase()} Ambulance</p>
                <p>⭐ Driver: {amb.driverName} ({amb.driverRating})</p>
                <p>📞 {amb.driverPhone}</p>
                <p>🚗 {amb.vehicleNumber}</p>
                <p>💰 Base: ₹{amb.basePrice} + ₹{amb.pricePerKm}/km</p>
                <p>📍 {amb.distance} away</p>
                <button onClick={() => handleSelectAmbulance(amb)} style={{ marginTop: '0.5rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                  Select & Book
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Ambulance;
