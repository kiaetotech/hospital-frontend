import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const HospitalsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [city, setCity] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [sortBy, setSortBy] = useState('distance');
  const [selectedDoctor, setSelectedDoctor] = useState({});
  const [expandedInsurance, setExpandedInsurance] = useState({});

  // Hardcoded doctors for each hospital
  const hospitalDoctors = {
    'Apollo Hospital Mumbai': [
      { name: 'Dr. Priya Sharma', specialization: 'Cardiologist', consultation_fee: 1200, rating: 4.9, reviewCount: 340 },
      { name: 'Dr. Rajesh Mehta', specialization: 'Cardiologist', consultation_fee: 1300, rating: 4.8, reviewCount: 210 },
      { name: 'Dr. Sunil Patil', specialization: 'Orthopedic', consultation_fee: 1100, rating: 4.7, reviewCount: 180 }
    ],
    'Fortis Hospital Delhi': [
      { name: 'Dr. Anil Kumar', specialization: 'Cardiologist', consultation_fee: 1500, rating: 4.7, reviewCount: 180 },
      { name: 'Dr. Neha Gupta', specialization: 'Orthopedic', consultation_fee: 1400, rating: 4.6, reviewCount: 150 }
    ],
    'Manipal Hospital Bangalore': [
      { name: 'Dr. Sunita Reddy', specialization: 'Neurologist', consultation_fee: 1000, rating: 4.9, reviewCount: 310 },
      { name: 'Dr. Vikram Singh', specialization: 'Oncologist', consultation_fee: 1200, rating: 4.8, reviewCount: 190 }
    ],
    'Medicover Hospital Hyderabad': [
      { name: 'Dr. Ajay Kumar', specialization: 'Cardiologist', consultation_fee: 1100, rating: 4.7, reviewCount: 200 },
      { name: 'Dr. Meera Reddy', specialization: 'Nephrologist', consultation_fee: 1000, rating: 4.8, reviewCount: 170 }
    ],
    'Narayana Health Kolkata': [
      { name: 'Dr. S. Chatterjee', specialization: 'Cardiologist', consultation_fee: 900, rating: 4.6, reviewCount: 160 },
      { name: 'Dr. R. Banerjee', specialization: 'Oncologist', consultation_fee: 950, rating: 4.7, reviewCount: 130 }
    ]
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

  // Fetch hospitals
  useEffect(() => {
    fetchHospitals();
  }, [searchQuery, city, userLocation, sortBy]);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (city) params.append('city', city);
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
      }
      params.append('sort_by', sortBy);
      const res = await api.get(`/hospitals/search?${params.toString()}`);
      let hospitalsData = res.data.data || [];
      
      // Attach hardcoded doctors to each hospital
      hospitalsData = hospitalsData.map(h => ({
        ...h,
        doctors: hospitalDoctors[h.name] || []
      }));
      
      setHospitals(hospitalsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHospitals();
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const toggleInsurance = (id) => {
    setExpandedInsurance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Get doctors that match the searched disease
  const getRelevantDoctors = (hospital) => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    const doctors = hospital.doctors || [];
    
    // Filter doctors whose specialization matches the search
    return doctors.filter(doc => {
      const spec = doc.specialization.toLowerCase();
      if (q.includes('heart') || q.includes('cardiac')) return spec.includes('cardiologist');
      if (q.includes('brain') || q.includes('stroke') || q.includes('neuro')) return spec.includes('neurologist');
      if (q.includes('bone') || q.includes('joint') || q.includes('ortho')) return spec.includes('orthopedic');
      if (q.includes('kidney') || q.includes('stone')) return spec.includes('nephrologist');
      if (q.includes('cancer') || q.includes('tumor')) return spec.includes('oncologist');
      return false;
    });
  };

  const getSelectedDoctorObj = (hospital) => {
    const relevant = getRelevantDoctors(hospital);
    if (relevant.length === 0) return null;
    if (relevant.length === 1) {
      const only = relevant[0];
      if (selectedDoctor[hospital._id] !== only.name) {
        setSelectedDoctor(prev => ({ ...prev, [hospital._id]: only.name }));
      }
      return only;
    }
    const selectedName = selectedDoctor[hospital._id];
    if (selectedName) {
      const found = relevant.find(d => d.name === selectedName);
      if (found) return found;
    }
    const first = relevant[0];
    setSelectedDoctor(prev => ({ ...prev, [hospital._id]: first.name }));
    return first;
  };

  const handleBookOPD = (hospital) => {
    const doctor = getSelectedDoctorObj(hospital);
    if (!doctor) {
      alert('Please select a doctor');
      return;
    }
    const fee = doctor.consultation_fee;
    const discount = Math.round(fee * 0.1);
    const finalFee = fee - discount;
    navigate(`/book-opd/${hospital._id}?doctor=${encodeURIComponent(doctor.name)}&fee=${finalFee}&original=${fee}`);
  };

  const handleBookAdmission = (hospital) => {
    navigate(`/book-admission/${hospital._id}`);
  };

  const handleViewDetails = (hospital) => {
    navigate(`/hospital-info/${hospital._id}`);
  };

  const handleAmbulance = () => {
    navigate('/ambulance');
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading hospitals...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a' }}>🏥 KiaetoCare Hospitals</h1>

        <form onSubmit={handleSearch} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', margin: '1rem 0' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Disease, symptom, or hospital name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 2, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}
            />
            <input
              type="text"
              placeholder="City (optional)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}
            />
            <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
              Search
            </button>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>Sort by:</span>
            <label><input type="radio" name="sort" checked={sortBy === 'distance'} onChange={() => setSortBy('distance')} /> Distance</label>
            <label><input type="radio" name="sort" checked={sortBy === 'fee'} onChange={() => setSortBy('fee')} /> Fee (low to high)</label>
            <label><input type="radio" name="sort" checked={sortBy === 'rating'} onChange={() => setSortBy('rating')} /> Rating (high to low)</label>
          </div>
        </form>

        {hospitals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>No hospitals found.</div>
        ) : (
          hospitals.map(h => {
            const distance = userLocation && h.location ? calculateDistance(userLocation.lat, userLocation.lng, h.location.lat, h.location.lng) : null;
            const insuranceList = h.insurance_accepted || [];
            const showAll = expandedInsurance[h._id];
            const relevantDoctors = getRelevantDoctors(h);
            const hasMultipleRelevant = relevantDoctors.length > 1;
            const selectedDoctorObj = getSelectedDoctorObj(h);
            const opdFee = selectedDoctorObj ? selectedDoctorObj.consultation_fee : (h.pricing?.consultation || 0);
            const discountAmount = Math.round(opdFee * 0.1);
            const canBookOPD = !searchQuery || (relevantDoctors.length > 0 && selectedDoctorObj !== null);

            return (
              <div key={h._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{h.name}</h2>
                  <div>⭐ {h.ratings?.average} ({h.ratings?.count} reviews)</div>
                </div>
                <p style={{ color: '#6b7280' }}>{h.address?.city}, {h.address?.state} {distance && `📍 ${distance} km away`}</p>

                {searchQuery && hasMultipleRelevant && (
                  <div style={{ margin: '0.5rem 0' }}>
                    <strong>👨‍⚕️ Select Doctor:</strong>
                    <div style={{ marginTop: '0.25rem' }}>
                      {relevantDoctors.map(doc => (
                        <label key={doc.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: selectedDoctor[h._id] === doc.name ? '#d1fae5' : '#f3f4f6', borderRadius: '0.375rem', marginBottom: '0.25rem', cursor: 'pointer' }}>
                          <input type="radio" name={`doc_${h._id}`} checked={selectedDoctor[h._id] === doc.name} onChange={() => setSelectedDoctor(prev => ({ ...prev, [h._id]: doc.name }))} />
                          <div style={{ flex: 1 }}>
                            <strong>{doc.name}</strong> - {doc.specialization}
                            <div style={{ fontSize: '0.75rem' }}>⭐ {doc.rating} ({doc.reviewCount} reviews)</div>
                          </div>
                          <span style={{ fontWeight: 'bold', color: '#10b981' }}>₹{doc.consultation_fee}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ margin: '0.5rem 0' }}>🧪 <strong>Lab Tests:</strong> {h.lab_tests_available ? '✅ Available' : '🔗 Linked'}</div>

                <div style={{ margin: '0.5rem 0' }}>
                  <div onClick={() => toggleInsurance(h._id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>🛡️ Insurance Accepted:</strong>
                    <span style={{ color: '#3b82f6' }}>{showAll ? '▲ Show less' : `▼ +${insuranceList.length} more`}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {(showAll ? insuranceList : insuranceList.slice(0, 2)).map((ins, idx) => (
                      <span key={idx} style={{ backgroundColor: '#e0e7ff', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem' }}>{ins}</span>
                    ))}
                    {!showAll && insuranceList.length > 2 && (
                      <span onClick={() => toggleInsurance(h._id)} style={{ color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer' }}>+{insuranceList.length - 2} more</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '0.5rem 0', backgroundColor: '#f9fafb', padding: '0.5rem', borderRadius: '0.5rem' }}>
                  <div><strong>📋 OPD Consultation</strong><br />₹{opdFee}</div>
                  <div><strong>🏥 Admission (per day)</strong><br />ICU: ₹{h.pricing?.icu_bed_per_day}<br />General: ₹{h.pricing?.general_bed_per_day}<br />🛏️ {h.beds?.available} beds available</div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <button onClick={() => handleBookOPD(h)} disabled={!canBookOPD} style={{ backgroundColor: canBookOPD ? '#10b981' : '#9ca3af', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: canBookOPD ? 'pointer' : 'not-allowed' }}>
                    📋 Book OPD {canBookOPD && discountAmount > 0 ? `(Save ₹${discountAmount})` : ''}
                  </button>
                  <button onClick={() => handleBookAdmission(h)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                    🏥 Book Admission (Save 10%)
                  </button>
                  <button onClick={() => handleViewDetails(h)} style={{ backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                    View Details
                  </button>
                  <button onClick={handleAmbulance} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                    🚑 Ambulance
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {h.has24x7ER && <span style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>🚨 24/7 Emergency</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HospitalsList;