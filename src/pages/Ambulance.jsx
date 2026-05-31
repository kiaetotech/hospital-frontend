import React, { useState, useEffect } from 'react';

const Ambulance = () => {
  const [step, setStep] = useState('search');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [selectedAmbulanceType, setSelectedAmbulanceType] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [useMyLocation, setUseMyLocation] = useState(true);
  const [manualLocation, setManualLocation] = useState('');
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

  // Agencies with their ambulance types
  const agencies = [
    { 
      id: 1, 
      name: 'City Ambulance Service', 
      rating: 4.8, 
      totalTrips: 1240, 
      location: 'Mumbai',
      types: ['basic', 'icu'],
      vehicles: {
        basic: { driverName: 'Ramesh Kumar', driverPhone: '9876543210', vehicleNumber: 'MH-01-AB-1234', hasAttendant: true, eta: 4 },
        icu: { driverName: 'Suresh Patil', driverPhone: '9876543211', vehicleNumber: 'MH-01-AB-1235', hasAttendant: true, eta: 6 }
      },
      distance: 1.2
    },
    { 
      id: 2, 
      name: 'LifeLine Ambulance', 
      rating: 4.9, 
      totalTrips: 890, 
      location: 'Mumbai',
      types: ['basic', 'icu', 'cardiac'],
      vehicles: {
        basic: { driverName: 'Rajesh Singh', driverPhone: '9876543212', vehicleNumber: 'MH-02-CD-5678', hasAttendant: true, eta: 8 },
        icu: { driverName: 'Mahesh Gupta', driverPhone: '9876543213', vehicleNumber: 'MH-02-CD-5679', hasAttendant: true, eta: 10 },
        cardiac: { driverName: 'Sanjay Mehta', driverPhone: '9876543214', vehicleNumber: 'MH-02-CD-5680', hasAttendant: true, eta: 12 }
      },
      distance: 2.5
    },
    { 
      id: 3, 
      name: 'FastTrack Ambulance', 
      rating: 4.7, 
      totalTrips: 560, 
      location: 'Delhi',
      types: ['basic', 'cardiac'],
      vehicles: {
        basic: { driverName: 'Vikram Singh', driverPhone: '9876543215', vehicleNumber: 'DL-01-EF-9012', hasAttendant: false, eta: 12 },
        cardiac: { driverName: 'Ravi Sharma', driverPhone: '9876543216', vehicleNumber: 'DL-01-EF-9013', hasAttendant: true, eta: 15 }
      },
      distance: 3.8
    },
    { 
      id: 4, 
      name: 'Saver Ambulance', 
      rating: 4.6, 
      totalTrips: 340, 
      location: 'Bangalore',
      types: ['basic', 'icu'],
      vehicles: {
        basic: { driverName: 'Prakash Rao', driverPhone: '9876543217', vehicleNumber: 'KA-01-GH-3456', hasAttendant: true, eta: 15 },
        icu: { driverName: 'Naveen Kumar', driverPhone: '9876543218', vehicleNumber: 'KA-01-GH-3457', hasAttendant: true, eta: 18 }
      },
      distance: 4.2
    },
    { 
      id: 5, 
      name: 'Medic Rescue', 
      rating: 4.9, 
      totalTrips: 720, 
      location: 'Mumbai',
      types: ['basic', 'icu', 'cardiac'],
      vehicles: {
        basic: { driverName: 'Santosh Patil', driverPhone: '9876543219', vehicleNumber: 'MH-03-IJ-7890', hasAttendant: true, eta: 18 },
        icu: { driverName: 'Dinesh Yadav', driverPhone: '9876543220', vehicleNumber: 'MH-03-IJ-7891', hasAttendant: true, eta: 20 },
        cardiac: { driverName: 'Ashok Kumar', driverPhone: '9876543221', vehicleNumber: 'MH-03-IJ-7892', hasAttendant: true, eta: 22 }
      },
      distance: 5.0
    }
  ];

  // Get user location
  useEffect(() => {
    if (useMyLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => {}
      );
    }
  }, [useMyLocation]);

  // Filter and sort agencies
  let filteredAgencies = [...agencies];
  
  // Search filter
  if (searchTerm) {
    filteredAgencies = filteredAgencies.filter(a => 
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Sort
  if (sortBy === 'distance') {
    filteredAgencies.sort((a, b) => a.distance - b.distance);
  } else if (sortBy === 'price') {
    filteredAgencies.sort((a, b) => {
      const priceA = ambulanceTypes[a.types[0]].basePrice;
      const priceB = ambulanceTypes[b.types[0]].basePrice;
      return priceA - priceB;
    });
  } else if (sortBy === 'rating') {
    filteredAgencies.sort((a, b) => b.rating - a.rating);
  }

  const paginatedAgencies = filteredAgencies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredAgencies.length / itemsPerPage);

  const calculateFare = (type, distance = 5) => {
    const t = ambulanceTypes[type];
    const total = t.basePrice + (distance * t.perKm);
    const discount = Math.round(total * 0.1);
    return { total, discount, final: total - discount };
  };

  const handleTypeSelect = (agencyId, type) => {
    setSelectedAmbulanceType(prev => ({ ...prev, [agencyId]: type }));
  };

  const handleSelectAmbulance = (agency) => {
    const selectedType = selectedAmbulanceType[agency.id] || agency.types[0];
    const vehicle = agency.vehicles[selectedType];
    setSelectedAmbulance({ ...agency, selectedType, vehicle });
    setStep('booking');
  };

  const handleBookingSubmit = () => {
    if (!patientName || !patientPhone || !pickupAddress || !dropAddress) {
      alert('Please fill all required fields');
      return;
    }
    const fare = calculateFare(selectedAmbulance.selectedType);
    alert(`✅ Ambulance Booked Successfully!\n\nProvider: ${selectedAmbulance.name}\nType: ${selectedAmbulance.selectedType.toUpperCase()}\nDriver: ${selectedAmbulance.vehicle.driverName}\nPhone: ${selectedAmbulance.vehicle.driverPhone}\nPickup: ${pickupAddress}\nDestination: ${dropAddress}\nTotal Amount: ₹${fare.final} (10% discount applied)\n\nYou will receive confirmation shortly.`);
    window.location.href = '/';
  };

  // Step 1: Search and Compare Ambulances
  if (step === 'search') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a' }}>🚑 Ambulance Services</h1>
          
          {/* Search and Filter Bar */}
          <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Search by agency name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 2, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}
              />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
                <option value="distance">Sort by Distance (Nearest)</option>
                <option value="price">Sort by Price (Low to High)</option>
                <option value="rating">Sort by Rating (High to Low)</option>
              </select>
            </div>
            
            {/* Location Option */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label>
                <input type="radio" name="location" checked={useMyLocation} onChange={() => setUseMyLanguage(true)} /> Use My Location
              </label>
              <label>
                <input type="radio" name="location" checked={!useMyLocation} onChange={() => setUseMyLocation(false)} /> Enter Manually
              </label>
              {!useMyLocation && (
                <input
                  type="text"
                  placeholder="Enter your location"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}
                />
              )}
            </div>
          </div>

          {/* Ambulance Cards */}
          {paginatedAgencies.map(agency => {
            const defaultType = selectedAmbulanceType[agency.id] || agency.types[0];
            return (
              <div key={agency.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{agency.name}</h2>
                  <div>⭐ {agency.rating} ({agency.totalTrips} trips)</div>
                </div>
                
                <p>📍 {agency.distance} km away | Location: {agency.location}</p>
                
                {/* Radio buttons for ambulance type selection */}
                <div style={{ margin: '0.5rem 0' }}>
                  <strong>Select Ambulance Type:</strong>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {agency.types.map(type => {
                      const fare = calculateFare(type);
                      const isSelected = (selectedAmbulanceType[agency.id] || agency.types[0]) === type;
                      return (
                        <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: isSelected ? '#d1fae5' : '#f3f4f6', borderRadius: '0.375rem', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name={`type_${agency.id}`}
                            checked={isSelected}
                            onChange={() => handleTypeSelect(agency.id, type)}
                          />
                          <div>
                            <strong>{ambulanceTypes[type].icon} {ambulanceTypes[type].name}</strong>
                            <p style={{ margin: 0, fontSize: '0.75rem' }}>Base: ₹{ambulanceTypes[type].basePrice} + ₹{ambulanceTypes[type].perKm}/km</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#10b981' }}>Est. ₹{fare.final} (Save ₹{fare.discount})</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
                
                {/* Vehicle and driver details for selected type */}
                {agency.vehicles[defaultType] && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                    <p><strong>Driver:</strong> {agency.vehicles[defaultType].driverName} | 📞 {agency.vehicles[defaultType].driverPhone}</p>
                    <p><strong>Vehicle:</strong> {agency.vehicles[defaultType].vehicleNumber} | ETA: {agency.vehicles[defaultType].eta} min</p>
                    <p><strong>Attendant:</strong> {agency.vehicles[defaultType].hasAttendant ? '✅ Available' : '❌ Not Available'}</p>
                  </div>
                )}
                
                <button onClick={() => handleSelectAmbulance(agency)} style={{ marginTop: '0.5rem', width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
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
    const fare = calculateFare(selectedAmbulance.selectedType);
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
          <button onClick={() => setStep('search')} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Book Ambulance</h2>
          
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <p><strong>{ambulanceTypes[selectedAmbulance.selectedType].icon} {selectedAmbulance.name}</strong></p>
            <p>Type: {selectedAmbulance.selectedType.toUpperCase()}</p>
            <p>Driver: {selectedAmbulance.vehicle.driverName} ⭐ {selectedAmbulance.rating}</p>
            <p>Vehicle: {selectedAmbulance.vehicle.vehicleNumber}</p>
            <p>Estimated Fare: ₹{fare.final} (10% discount applied)</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Booking Type *</label>
            <select value={bookingType} onChange={(e) => setBookingType(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
              <option value="emergency">🚨 Emergency</option>
              <option value="non-emergency">🚑 Non-Emergency</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Require Medical Attendant?</label>
            <label style={{ marginRight: '1rem' }}><input type="radio" name="attendant" checked={requiresAttendant === true} onChange={() => setRequiresAttendant(true)} /> Yes</label>
            <label><input type="radio" name="attendant" checked={requiresAttendant === false} onChange={() => setRequiresAttendant(false)} /> No</label>
          </div>

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

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Pickup Address *</label>
            <textarea value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} rows="2" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Destination Hospital *</label>
            <textarea value={dropAddress} onChange={(e) => setDropAddress(e.target.value)} rows="2" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>

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