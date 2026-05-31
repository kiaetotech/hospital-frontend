import React, { useState, useEffect } from 'react';

const Ambulance = () => {
  const [step, setStep] = useState('search');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Booking form state
  const [bookingType, setBookingType] = useState('emergency');
  const [requiresAttendant, setRequiresAttendant] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Ambulance types with pricing
  const ambulanceTypes = {
    basic: { name: 'Basic Ambulance', basePrice: 500, perKm: 20, icon: '🚑', description: 'Basic life support, first aid' },
    icu: { name: 'ICU Ambulance', basePrice: 800, perKm: 30, icon: '🚨', description: 'ICU equipped, ventilator' },
    cardiac: { name: 'Cardiac Ambulance', basePrice: 1000, perKm: 40, icon: '❤️', description: 'Cardiac care, defibrillator' }
  };

  // Mock nearby ambulances (replace with API call)
  const nearbyAmbulances = [
    { id: 1, providerName: 'City Ambulance Service', type: 'basic', distance: 1.2, rating: 4.8, totalTrips: 1240, driverName: 'Ramesh Kumar', driverPhone: '9876543210', vehicleNumber: 'MH-01-AB-1234', hasAttendant: true, eta: 4 },
    { id: 2, providerName: 'LifeLine Ambulance', type: 'icu', distance: 2.5, rating: 4.9, totalTrips: 890, driverName: 'Suresh Patil', driverPhone: '9876543211', vehicleNumber: 'MH-02-CD-5678', hasAttendant: true, eta: 8 },
    { id: 3, providerName: 'FastTrack Ambulance', type: 'cardiac', distance: 3.8, rating: 4.7, totalTrips: 560, driverName: 'Rajesh Singh', driverPhone: '9876543212', vehicleNumber: 'DL-01-EF-9012', hasAttendant: false, eta: 12 },
    { id: 4, providerName: 'Saver Ambulance', type: 'basic', distance: 4.2, rating: 4.6, totalTrips: 340, driverName: 'Prakash Rao', driverPhone: '9876543213', vehicleNumber: 'KA-01-GH-3456', hasAttendant: true, eta: 15 },
    { id: 5, providerName: 'Medic Rescue', type: 'icu', distance: 5.0, rating: 4.9, totalTrips: 720, driverName: 'Santosh Patil', driverPhone: '9876543214', vehicleNumber: 'MH-03-IJ-7890', hasAttendant: true, eta: 18 }
  ];

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const calculateFare = (ambulance, distance = 5) => {
    const type = ambulanceTypes[ambulance.type];
    const total = type.basePrice + (distance * type.perKm);
    const discount = Math.round(total * 0.1);
    return { total, discount, final: total - discount };
  };

  const paginatedAmbulances = nearbyAmbulances.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(nearbyAmbulances.length / itemsPerPage);

  const handleSelectAmbulance = (ambulance) => {
    setSelectedAmbulance(ambulance);
    setStep('booking');
  };

  const handleBookingSubmit = () => {
    if (!patientName || !patientPhone || !pickupAddress || !dropAddress) {
      alert('Please fill all required fields');
      return;
    }
    const fare = calculateFare(selectedAmbulance);
    alert(`✅ Ambulance Booked Successfully!\n\nProvider: ${selectedAmbulance.providerName}\nType: ${selectedAmbulance.type.toUpperCase()}\nDriver: ${selectedAmbulance.driverName}\nPhone: ${selectedAmbulance.driverPhone}\nPickup: ${pickupAddress}\nDestination: ${dropAddress}\nTotal Amount: ₹${fare.final} (10% discount applied)\n\nYou will receive confirmation shortly.`);
    window.location.href = '/';
  };

  // Step 1: Search and Compare Ambulances
  if (step === 'search') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a' }}>🚑 Ambulance Services</h1>
          {userLocation && <p>📍 Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>}
          <p>Showing {nearbyAmbulances.length} ambulances near you</p>

          {/* Ambulance Cards - Row by Row for Comparison */}
          {paginatedAmbulances.map(amb => {
            const fare = calculateFare(amb);
            return (
              <div key={amb.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{ambulanceTypes[amb.type].icon} {amb.providerName}</h2>
                  <div>⭐ {amb.rating} ({amb.totalTrips} trips)</div>
                </div>
                
                <p>📍 {amb.distance} km away | ETA: {amb.eta} minutes</p>
                <p>🚑 Type: {amb.type.toUpperCase()} | Driver: {amb.driverName} | 📞 {amb.driverPhone}</p>
                <p>🚗 Vehicle: {amb.vehicleNumber}</p>
                <p>👨‍⚕️ Attendant: {amb.hasAttendant ? '✅ Available' : '❌ Not Available'}</p>
                
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                  <p><strong>Fare Details:</strong></p>
                  <p>Base Price: ₹{ambulanceTypes[amb.type].basePrice} + ₹{ambulanceTypes[amb.type].perKm}/km</p>
                  <p>Estimated for 5km: ₹{fare.total}</p>
                  <p style={{ color: '#10b981' }}>After 10% Discount: ₹{fare.final}</p>
                </div>
                
                <button onClick={() => handleSelectAmbulance(amb)} style={{ marginTop: '0.5rem', width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                  Select & Book
                </button>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '0.5rem 1rem', backgroundColor: currentPage === 1 ? '#ccc' : '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Previous</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '0.5rem 1rem', backgroundColor: currentPage === totalPages ? '#ccc' : '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Next</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Booking Form
  if (step === 'booking' && selectedAmbulance) {
    const fare = calculateFare(selectedAmbulance);
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
          <button onClick={() => setStep('search')} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Book Ambulance</h2>
          
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <p><strong>{ambulanceTypes[selectedAmbulance.type].icon} {selectedAmbulance.providerName}</strong></p>
            <p>Type: {selectedAmbulance.type.toUpperCase()}</p>
            <p>Driver: {selectedAmbulance.driverName} ⭐ {selectedAmbulance.rating}</p>
            <p>Vehicle: {selectedAmbulance.vehicleNumber}</p>
            <p>Estimated Fare: ₹{fare.final} (10% discount applied)</p>
          </div>

          {/* Booking Type */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Booking Type *</label>
            <select value={bookingType} onChange={(e) => setBookingType(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
              <option value="emergency">🚨 Emergency</option>
              <option value="non-emergency">🚑 Non-Emergency</option>
            </select>
          </div>

          {/* Attendant */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Require Medical Attendant?</label>
            <label style={{ marginRight: '1rem' }}><input type="radio" name="attendant" checked={requiresAttendant === true} onChange={() => setRequiresAttendant(true)} /> Yes (+₹200)</label>
            <label><input type="radio" name="attendant" checked={requiresAttendant === false} onChange={() => setRequiresAttendant(false)} /> No</label>
          </div>

          {/* Patient Details */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Patient Name *</label>
            <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Patient Age</label>
            <input type="number" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Patient Gender</label>
            <select value={patientGender} onChange={(e) => setPatientGender(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Phone Number *</label>
            <input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>

          {/* Pickup & Drop */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Pickup Address *</label>
            <textarea value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} rows="2" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Destination Hospital *</label>
            <textarea value={dropAddress} onChange={(e) => setDropAddress(e.target.value)} rows="2" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>

          {/* Scheduled Time for Non-Emergency */}
          {bookingType === 'non-emergency' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Scheduled Date & Time</label>
              <input type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
            </div>
          )}

          <button onClick={handleBookingSubmit} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Confirm Booking - ₹{fare.final}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Ambulance;