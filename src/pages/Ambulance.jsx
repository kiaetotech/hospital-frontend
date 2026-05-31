import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Ambulance = () => {
  const [step, setStep] = useState('search');
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [selectedAmbulanceType, setSelectedAmbulanceType] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('distance');
  const itemsPerPage = 5;
  
  // Booking form state
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [requiresAttendant, setRequiresAttendant] = useState(false);

  // Ambulance types with pricing
  const ambulanceTypes = {
    basic: { name: 'Basic Ambulance', basePrice: 500, perKm: 20, icon: '🚑', description: 'Basic life support, first aid' },
    icu: { name: 'ICU Ambulance', basePrice: 800, perKm: 30, icon: '🚨', description: 'ICU equipped, ventilator' },
    cardiac: { name: 'Cardiac Ambulance', basePrice: 1000, perKm: 40, icon: '❤️', description: 'Cardiac care, defibrillator' }
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
    const delayDebounce = setTimeout(() => {
      if (hospitalSearch.length > 2) {
        searchHospitals();
      } else {
        setHospitals([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [hospitalSearch]);

  const searchHospitals = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/hospitals/search?q=${hospitalSearch}`);
      setHospitals(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Mock ambulances based on hospital city
  const getAmbulancesByCity = (city) => {
    const ambulancesByCity = {
      'Mumbai': [
        { id: 1, name: 'City Ambulance Service', rating: 4.8, totalTrips: 1240, types: ['basic', 'icu'], vehicles: { basic: { driver: 'Ramesh', phone: '9876543210', vehicle: 'MH-01-AB-1234', eta: 4 }, icu: { driver: 'Suresh', phone: '9876543211', vehicle: 'MH-01-AB-1235', eta: 6 } } },
        { id: 2, name: 'LifeLine Ambulance', rating: 4.9, totalTrips: 890, types: ['basic', 'icu', 'cardiac'], vehicles: { basic: { driver: 'Rajesh', phone: '9876543212', vehicle: 'MH-02-CD-5678', eta: 8 }, icu: { driver: 'Mahesh', phone: '9876543213', vehicle: 'MH-02-CD-5679', eta: 10 }, cardiac: { driver: 'Sanjay', phone: '9876543214', vehicle: 'MH-02-CD-5680', eta: 12 } } },
        { id: 3, name: 'Medic Rescue', rating: 4.9, totalTrips: 720, types: ['basic', 'icu', 'cardiac'], vehicles: { basic: { driver: 'Santosh', phone: '9876543219', vehicle: 'MH-03-IJ-7890', eta: 18 }, icu: { driver: 'Dinesh', phone: '9876543220', vehicle: 'MH-03-IJ-7891', eta: 20 }, cardiac: { driver: 'Ashok', phone: '9876543221', vehicle: 'MH-03-IJ-7892', eta: 22 } } }
      ],
      'Delhi': [
        { id: 4, name: 'FastTrack Ambulance', rating: 4.7, totalTrips: 560, types: ['basic', 'cardiac'], vehicles: { basic: { driver: 'Vikram', phone: '9876543215', vehicle: 'DL-01-EF-9012', eta: 12 }, cardiac: { driver: 'Ravi', phone: '9876543216', vehicle: 'DL-01-EF-9013', eta: 15 } } }
      ],
      'Bangalore': [
        { id: 5, name: 'Saver Ambulance', rating: 4.6, totalTrips: 340, types: ['basic', 'icu'], vehicles: { basic: { driver: 'Prakash', phone: '9876543217', vehicle: 'KA-01-GH-3456', eta: 15 }, icu: { driver: 'Naveen', phone: '9876543218', vehicle: 'KA-01-GH-3457', eta: 18 } } }
      ],
      'Hyderabad': [
        { id: 6, name: 'Care Ambulance', rating: 4.7, totalTrips: 450, types: ['basic', 'icu'], vehicles: { basic: { driver: 'Kiran', phone: '9876543222', vehicle: 'TS-01-AB-1234', eta: 10 }, icu: { driver: 'Pavan', phone: '9876543223', vehicle: 'TS-01-AB-1235', eta: 12 } } }
      ],
      'Kolkata': [
        { id: 7, name: 'HelpLine Ambulance', rating: 4.5, totalTrips: 320, types: ['basic'], vehicles: { basic: { driver: 'Sourav', phone: '9876543224', vehicle: 'WB-01-AB-1234', eta: 14 } } }
      ]
    };
    return ambulancesByCity[city] || [];
  };

  const handleSelectHospital = (hospital) => {
    setSelectedHospital(hospital);
    const city = hospital.address?.city;
    const ambulances = getAmbulancesByCity(city);
    setSelectedAmbulance(ambulances.length > 0 ? ambulances[0] : null);
    setStep('ambulance');
  };

  const handleTypeSelect = (ambulanceId, type) => {
    setSelectedAmbulanceType(prev => ({ ...prev, [ambulanceId]: type }));
  };

  const handleSelectAmbulanceForBooking = (ambulance) => {
    const selectedType = selectedAmbulanceType[ambulance.id] || ambulance.types[0];
    setSelectedAmbulance({ ...ambulance, selectedType });
    setStep('booking');
  };

  const calculateFare = (type, distance = 5) => {
    const t = ambulanceTypes[type];
    const total = t.basePrice + (distance * t.perKm);
    const discount = Math.round(total * 0.1);
    return { total, discount, final: total - discount };
  };

  const handleBookingSubmit = () => {
    if (!patientName || !patientPhone || !pickupAddress) {
      alert('Please fill all required fields');
      return;
    }
    const fare = calculateFare(selectedAmbulance.selectedType);
    alert(`✅ Ambulance Booked Successfully!\n\nHospital: ${selectedHospital.name}\nAmbulance: ${selectedAmbulance.name}\nType: ${selectedAmbulance.selectedType.toUpperCase()}\nDriver: ${selectedAmbulance.vehicles[selectedAmbulance.selectedType].driver}\nPhone: ${selectedAmbulance.vehicles[selectedAmbulance.selectedType].phone}\nPickup: ${pickupAddress}\nTotal Amount: ₹${fare.final} (10% discount applied)`);
    window.location.href = '/';
  };

  // Step 1: Search Hospital
  if (step === 'search') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a' }}>🚑 Book Ambulance</h1>
          <p style={{ marginBottom: '1rem' }}>Search for the hospital you want to go to</p>

          <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem' }}>
            <input
              type="text"
              placeholder="Search hospital by name..."
              value={hospitalSearch}
              onChange={(e) => setHospitalSearch(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem', marginBottom: '1rem' }}
            />
            
            {loading && <p>Searching hospitals...</p>}
            
            {hospitals.length > 0 && (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {hospitals.map(h => (
                  <div
                    key={h._id}
                    onClick={() => handleSelectHospital(h)}
                    style={{ padding: '0.75rem', borderBottom: '1px solid #eee', cursor: 'pointer', hover: { backgroundColor: '#f3f4f6' } }}
                  >
                    <strong>{h.name}</strong>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{h.address?.city}, {h.address?.state}</p>
                  </div>
                ))}
              </div>
            )}
            
            {hospitalSearch.length > 2 && hospitals.length === 0 && !loading && (
              <p>No hospitals found. Try a different name.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Select Ambulance
  if (step === 'ambulance' && selectedHospital) {
    const city = selectedHospital.address?.city;
    let ambulances = getAmbulancesByCity(city);
    
    // Sort by rating
    if (sortBy === 'rating') {
      ambulances.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price') {
      ambulances.sort((a, b) => ambulanceTypes[a.types[0]].basePrice - ambulanceTypes[b.types[0]].basePrice);
    }
    
    const paginatedAmbulances = ambulances.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(ambulances.length / itemsPerPage);

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <button onClick={() => setStep('search')} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back to Hospitals</button>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Select Ambulance</h2>
          <p>Hospital: <strong>{selectedHospital.name}</strong> ({city})</p>
          <p>Your location: {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Detecting...'}</p>

          {/* Sort Options */}
          <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.5rem', margin: '1rem 0', display: 'flex', gap: '1rem' }}>
            <span>Sort by:</span>
            <button onClick={() => setSortBy('rating')} style={{ backgroundColor: sortBy === 'rating' ? '#10b981' : '#e5e7eb', color: sortBy === 'rating' ? 'white' : 'black', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}>Rating</button>
            <button onClick={() => setSortBy('price')} style={{ backgroundColor: sortBy === 'price' ? '#10b981' : '#e5e7eb', color: sortBy === 'price' ? 'white' : 'black', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}>Price (Low to High)</button>
          </div>

          {/* Ambulance Cards */}
          {paginatedAmbulances.map(amb => {
            const defaultType = selectedAmbulanceType[amb.id] || amb.types[0];
            return (
              <div key={amb.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{amb.name}</h3>
                  <div>⭐ {amb.rating} ({amb.totalTrips} trips)</div>
                </div>

                {/* Radio buttons for ambulance type */}
                <div style={{ margin: '0.5rem 0' }}>
                  <strong>Select Type:</strong>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {amb.types.map(type => {
                      const fare = calculateFare(type);
                      const isSelected = (selectedAmbulanceType[amb.id] || amb.types[0]) === type;
                      return (
                        <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: isSelected ? '#d1fae5' : '#f3f4f6', borderRadius: '0.375rem', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name={`type_${amb.id}`}
                            checked={isSelected}
                            onChange={() => handleTypeSelect(amb.id, type)}
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

                {/* Driver details for selected type */}
                {amb.vehicles[defaultType] && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                    <p><strong>Driver:</strong> {amb.vehicles[defaultType].driver} | 📞 {amb.vehicles[defaultType].phone}</p>
                    <p><strong>Vehicle:</strong> {amb.vehicles[defaultType].vehicle} | ETA: {amb.vehicles[defaultType].eta} min</p>
                  </div>
                )}

                <button onClick={() => handleSelectAmbulanceForBooking(amb)} style={{ marginTop: '0.5rem', width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
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

  // Step 3: Booking Form
  if (step === 'booking' && selectedAmbulance && selectedHospital) {
    const fare = calculateFare(selectedAmbulance.selectedType);
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
          <button onClick={() => setStep('ambulance')} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Patient Details</h2>
          
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <p><strong>Hospital:</strong> {selectedHospital.name}</p>
            <p><strong>Ambulance:</strong> {selectedAmbulance.name} ({selectedAmbulance.selectedType.toUpperCase()})</p>
            <p><strong>Driver:</strong> {selectedAmbulance.vehicles[selectedAmbulance.selectedType].driver}</p>
            <p><strong>Amount:</strong> ₹{fare.final} (10% discount applied)</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Patient Name *</label>
            <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
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
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Require Medical Attendant?</label>
            <label style={{ marginRight: '1rem' }}><input type="radio" name="attendant" checked={requiresAttendant === true} onChange={() => setRequiresAttendant(true)} /> Yes</label>
            <label><input type="radio" name="attendant" checked={requiresAttendant === false} onChange={() => setRequiresAttendant(false)} /> No</label>
          </div>

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