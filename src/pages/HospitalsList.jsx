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
  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [city, setCity] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [sortBy, setSortBy] = useState('distance');
  const [selectedDoctor, setSelectedDoctor] = useState({});
  const [expandedInsurance, setExpandedInsurance] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const hospitalDoctors = {
    'Apollo Hospital Mumbai': [
      { name: 'Dr. Priya Sharma', specialization: 'Cardiologist', qualification: 'MBBS, MD (Cardiology), DM', consultation_fee: 1200, rating: 4.9, reviewCount: 340 },
      { name: 'Dr. Rajesh Mehta', specialization: 'Neurologist', qualification: 'MBBS, MD (Neurology), DM', consultation_fee: 1300, rating: 4.8, reviewCount: 210 },
      { name: 'Dr. Sunil Patil', specialization: 'Orthopedic', qualification: 'MBBS, MS (Ortho)', consultation_fee: 1100, rating: 4.7, reviewCount: 180 }
    ],
    'Fortis Hospital Delhi': [
      { name: 'Dr. Anil Kumar', specialization: 'Cardiologist', qualification: 'MBBS, MD (Cardiology)', consultation_fee: 1500, rating: 4.7, reviewCount: 180 },
      { name: 'Dr. Neha Gupta', specialization: 'Orthopedic', qualification: 'MBBS, DNB (Ortho)', consultation_fee: 1400, rating: 4.6, reviewCount: 150 }
    ],
    'Manipal Hospital Bangalore': [
      { name: 'Dr. Sunita Reddy', specialization: 'Neurologist', qualification: 'MBBS, MD (Neurology), DM', consultation_fee: 1000, rating: 4.9, reviewCount: 310 },
      { name: 'Dr. Vikram Singh', specialization: 'Oncologist', qualification: 'MBBS, MD (Oncology)', consultation_fee: 1200, rating: 4.8, reviewCount: 190 }
    ],
    'Medicover Hospital Hyderabad': [
      { name: 'Dr. Ajay Kumar', specialization: 'Cardiologist', qualification: 'MBBS, MD (Cardiology)', consultation_fee: 1100, rating: 4.7, reviewCount: 200 },
      { name: 'Dr. Meera Reddy', specialization: 'Nephrologist', qualification: 'MBBS, MD (Nephrology)', consultation_fee: 1000, rating: 4.8, reviewCount: 170 }
    ],
    'Narayana Health Kolkata': [
      { name: 'Dr. S. Chatterjee', specialization: 'Cardiologist', qualification: 'MBBS, MD (Cardiology)', consultation_fee: 900, rating: 4.6, reviewCount: 160 },
      { name: 'Dr. R. Banerjee', specialization: 'Oncologist', qualification: 'MBBS, MD (Oncology)', consultation_fee: 950, rating: 4.7, reviewCount: 130 }
    ]
  };

  const getSpecializationFromQuery = (query) => {
    const q = query.toLowerCase();
    if (q.includes('heart') || q.includes('cardiac') || q.includes('chest pain') || q.includes('chest')) return 'cardiologist';
    if (q.includes('brain') || q.includes('stroke') || q.includes('neuro')) return 'neurologist';
    if (q.includes('bone') || q.includes('joint') || q.includes('ortho')) return 'orthopedic';
    if (q.includes('kidney') || q.includes('stone')) return 'nephrologist';
    if (q.includes('cancer') || q.includes('tumor')) return 'oncologist';
    return null;
  };

  const getMatchingDoctors = (hospital) => {
    if (!searchQuery) return [];
    const targetSpec = getSpecializationFromQuery(searchQuery);
    if (!targetSpec) return hospital.doctors || [];
    const doctors = hospital.doctors || [];
    const matching = doctors.filter(doc => 
      doc.specialization.toLowerCase().includes(targetSpec)
    );
    return matching.length > 0 ? matching : doctors;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => {}
      );
    }
  }, []);

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
      const res = await api.get(`/hospitals/search?${params.toString()}`);
      let hospitalsData = res.data.data || [];
      
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
    setSearchQuery(inputQuery);
    setCurrentPage(1);
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

  const handleBookOPD = (hospital) => {
  window.location.href = `/book-opd/${hospital._id}`;
};

const handleBookAdmission = (hospital) => {
  window.location.href = `/book-admission/${hospital._id}`;
};

  const handleViewDetails = (hospital) => {
    window.location.href = `/hospital-info/${hospital._id}`;
  };

  const handleAmbulance = () => {
    window.location.href = '/ambulance';
  };

  const paginatedHospitals = hospitals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(hospitals.length / itemsPerPage);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading hospitals...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a' }}>🏥 KiaetoCare Hospitals</h1>

        <form onSubmit={handleSearch} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', margin: '1rem 0' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <input type="text" placeholder="Disease, symptom, or hospital name" value={inputQuery} onChange={(e) => setInputQuery(e.target.value)} style={{ flex: 2, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
            <input type="text" placeholder="City (optional)" value={city} onChange={(e) => setCity(e.target.value)} style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
            <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Search</button>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>Sort by:</span>
            <label><input type="radio" name="sort" checked={sortBy === 'distance'} onChange={() => setSortBy('distance')} /> Distance</label>
            <label><input type="radio" name="sort" checked={sortBy === 'fee'} onChange={() => setSortBy('fee')} /> Fee (low to high)</label>
            <label><input type="radio" name="sort" checked={sortBy === 'rating'} onChange={() => setSortBy('rating')} /> Rating (high to low)</label>
          </div>
        </form>

        {paginatedHospitals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>No hospitals found.</div>
        ) : (
          paginatedHospitals.map(h => {
            const distance = userLocation && h.location ? calculateDistance(userLocation.lat, userLocation.lng, h.location.lat, h.location.lng) : null;
            const insuranceList = h.insurance_accepted || [];
            const showAll = expandedInsurance[h._id];
            const matchingDoctors = getMatchingDoctors(h);
            const hasMultipleMatching = matchingDoctors.length > 1;
            const singleMatching = matchingDoctors.length === 1;
            
            if (singleMatching && !selectedDoctor[h._id]) {
              setSelectedDoctor(prev => ({ ...prev, [h._id]: matchingDoctors[0].name }));
            }
            
            const selectedDoc = matchingDoctors.find(d => d.name === selectedDoctor[h._id]) || (singleMatching ? matchingDoctors[0] : null);
            const opdFee = selectedDoc ? selectedDoc.consultation_fee : (h.pricing?.consultation || 0);
            const discountAmount = Math.round(opdFee * 0.1);

            return (
              <div key={h._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{h.name}</h2>
                  <div>⭐ {h.ratings?.average} ({h.ratings?.count} reviews)</div>
                </div>
                <p style={{ color: '#6b7280' }}>{h.address?.city}, {h.address?.state} {distance && `📍 ${distance} km away`}</p>

                {searchQuery && hasMultipleMatching && (
                  <div style={{ margin: '0.5rem 0' }}>
                    <strong>👨‍⚕️ Select Doctor ({matchingDoctors.length} available):</strong>
                    {matchingDoctors.map(doc => (
                      <label key={doc.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: selectedDoctor[h._id] === doc.name ? '#d1fae5' : '#f3f4f6', borderRadius: '0.375rem', marginBottom: '0.25rem', cursor: 'pointer' }}>
                        <input type="radio" name={`doc_${h._id}`} checked={selectedDoctor[h._id] === doc.name} onChange={() => setSelectedDoctor(prev => ({ ...prev, [h._id]: doc.name }))} />
                        <div>
                          <strong>{doc.name}</strong> - {doc.specialization}<br />
                          <span style={{ fontSize: '0.75rem' }}>📜 {doc.qualification}</span><br />
                          <span style={{ fontSize: '0.75rem' }}>⭐ {doc.rating} ({doc.reviewCount} reviews)</span>
                        </div>
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>₹{doc.consultation_fee}</span>
                      </label>
                    ))}
                  </div>
                )}

                {searchQuery && singleMatching && (
                  <div style={{ margin: '0.5rem 0', padding: '0.5rem', backgroundColor: '#e0e7ff', borderRadius: '0.375rem' }}>
                    <strong>👨‍⚕️ Doctor:</strong> {matchingDoctors[0].name} - {matchingDoctors[0].specialization}<br />
                    📜 {matchingDoctors[0].qualification}<br />
                    ⭐ {matchingDoctors[0].rating} ({matchingDoctors[0].reviewCount} reviews) | Fee: ₹{matchingDoctors[0].consultation_fee}
                  </div>
                )}

                {searchQuery && matchingDoctors.length === 0 && (
                  <div style={{ margin: '0.5rem 0' }}>
                    <strong>👨‍⚕️ Available Doctors at this hospital:</strong>
                    {(h.doctors || []).map(doc => (
                      <div key={doc.name} style={{ padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', marginBottom: '0.5rem' }}>
                        <strong>{doc.name}</strong> - {doc.specialization}<br />
                        📜 {doc.qualification}<br />
                        ⭐ {doc.rating} ({doc.reviewCount} reviews) | Fee: ₹{doc.consultation_fee}
                        <button onClick={() => handleBookOPD(h)} style={{ marginLeft: '0.5rem', backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}>Book This Doctor</button>
                      </div>
                    ))}
                  </div>
                )}

                <div>🧪 <strong>Lab Tests:</strong> {h.lab_tests_available ? '✅ Available' : '🔗 Linked'}</div>

                <div>
                  <div onClick={() => toggleInsurance(h._id)} style={{ cursor: 'pointer' }}>
                    <strong>🛡️ Insurance Accepted:</strong> <span style={{ color: '#3b82f6' }}>{showAll ? '▲ Show less' : `▼ +${insuranceList.length} more`}</span>
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

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={() => handleBookOPD(h)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>📋 Book OPD (Save ₹{discountAmount})</button>
                  <button onClick={() => handleBookAdmission(h)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>🏥 Book Admission (Save 10%)</button>
                  <button onClick={() => handleViewDetails(h)} style={{ backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>View Details</button>
                  <button onClick={handleAmbulance} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>🚑 Ambulance</button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {h.has24x7ER && <span style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>🚨 24/7 Emergency</span>}
                </div>
              </div>
            );
          })
        )}

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
};

export default HospitalsList;