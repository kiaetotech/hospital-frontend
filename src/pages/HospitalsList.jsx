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
  const [expandedSchemes, setExpandedSchemes] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Government schemes display names
  const schemeDisplayNames = {
    'ayushman': 'Ayushman Bharat (PM-JAY)',
    'cghs': 'CGHS',
    'esi': 'ESI',
    'echs': 'ECHS',
    'state_scheme': 'State Scheme',
    'senior_citizen': 'Senior Citizen',
    'disability': 'Disability Scheme',
    'pmjay': 'PM-JAY',
    'rsby': 'RSBY'
  };

  const getSpecializationFromQuery = (query) => {
    const q = query.toLowerCase();
    if (q.includes('heart') || q.includes('cardiac') || q.includes('chest pain') || q.includes('chest') || q.includes('angioplasty')) return 'cardiologist';
    if (q.includes('brain') || q.includes('stroke') || q.includes('neuro') || q.includes('migraine')) return 'neurologist';
    if (q.includes('bone') || q.includes('joint') || q.includes('ortho') || q.includes('fracture') || q.includes('knee')) return 'orthopedic';
    if (q.includes('kidney') || q.includes('stone') || q.includes('renal') || q.includes('dialysis')) return 'nephrologist';
    if (q.includes('cancer') || q.includes('tumor') || q.includes('oncology')) return 'oncologist';
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

  const toggleSchemes = (id) => {
    setExpandedSchemes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getBedUpdateBadge = (lastUpdated) => {
    if (!lastUpdated) return { text: 'Unknown', color: '#9ca3af', bg: '#f3f4f6' };
    const hours = (new Date() - new Date(lastUpdated)) / (1000 * 60 * 60);
    if (hours < 1) return { text: '🟢 Live', color: '#10b981', bg: '#d1fae5' };
    if (hours < 4) return { text: '🟡 Recent', color: '#f59e0b', bg: '#fef3c7' };
    if (hours < 12) return { text: '🟠 Today', color: '#f97316', bg: '#ffedd5' };
    return { text: '🔴 Old', color: '#ef4444', bg: '#fee2e2' };
  };

  const getAvailabilityBadge = (status) => {
    switch(status) {
      case 'available': return { text: '🟢 Available', color: '#10b981', bg: '#d1fae5' };
      case 'limited': return { text: '🟡 Few Slots', color: '#f59e0b', bg: '#fef3c7' };
      case 'full': return { text: '🔴 Full', color: '#ef4444', bg: '#fee2e2' };
      default: return { text: 'Check', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const handleBookOPD = (hospital, doctor = null) => {
    const url = doctor 
      ? `/book-opd/${hospital._id}?doctor=${encodeURIComponent(doctor.name)}`
      : `/book-opd/${hospital._id}`;
    window.location.href = url;
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
            const schemesList = h.schemes_accepted || [];
            const showAllInsurance = expandedInsurance[h._id];
            const showAllSchemes = expandedSchemes[h._id];
            const matchingDoctors = getMatchingDoctors(h);
            const hasMultipleMatching = matchingDoctors.length > 1;
            const singleMatching = matchingDoctors.length === 1;
            const bedBadge = getBedUpdateBadge(h.beds?.last_updated);
            
            if (singleMatching && !selectedDoctor[h._id]) {
              setSelectedDoctor(prev => ({ ...prev, [h._id]: matchingDoctors[0].name }));
            }
            
            const selectedDoc = matchingDoctors.find(d => d.name === selectedDoctor[h._id]) || (singleMatching ? matchingDoctors[0] : null);
            const opdFee = selectedDoc ? selectedDoc.consultation_fee : (h.pricing?.consultation || 0);
            const discountAmount = Math.round(opdFee * 0.1);

            return (
              <div key={h._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{h.name}</h2>
                    <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                      {h.accreditations?.map(acc => (
                        <span key={acc} style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontSize: '0.6rem', fontWeight: 'bold' }}>{acc}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div>⭐ {h.ratings?.average || 'N/A'} ({h.ratings?.count || 0} reviews)</div>
                    {h.cashless_available && (
                      <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 'bold' }}>💳 Cashless</span>
                    )}
                  </div>
                </div>
                <p style={{ color: '#6b7280', margin: '0.25rem 0' }}>{h.address?.city}, {h.address?.state} {distance && `📍 ${distance} km away`}</p>

                {/* Schemes Section */}
                {schemesList.length > 0 && (
                  <div style={{ margin: '0.5rem 0' }}>
                    <div onClick={() => toggleSchemes(h._id)} style={{ cursor: 'pointer' }}>
                      <strong>💠 Schemes:</strong> <span style={{ color: '#8b5cf6', fontSize: '0.875rem' }}>{showAllSchemes ? '▲' : '▼'} {schemesList.length} accepted</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                      {(showAllSchemes ? schemesList : schemesList.slice(0, 3)).map((scheme, idx) => (
                        <span key={idx} style={{ backgroundColor: '#f3e8ff', color: '#5b21b6', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem' }}>
                          {schemeDisplayNames[scheme] || scheme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctors Section */}
                {searchQuery && hasMultipleMatching && (
                  <div style={{ margin: '0.5rem 0' }}>
                    <strong>👨‍⚕️ Select Doctor ({matchingDoctors.length} available):</strong>
                    {matchingDoctors.map(doc => {
                      const availBadge = getAvailabilityBadge(doc.availability?.status);
                      return (
                        <label key={doc.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: selectedDoctor[h._id] === doc.name ? '#d1fae5' : '#f3f4f6', borderRadius: '0.375rem', marginBottom: '0.25rem', cursor: 'pointer' }}>
                          <input type="radio" name={`doc_${h._id}`} checked={selectedDoctor[h._id] === doc.name} onChange={() => setSelectedDoctor(prev => ({ ...prev, [h._id]: doc.name }))} />
                          <div style={{ flex: 1 }}>
                            <strong>{doc.name}</strong> - {doc.specialization}<br />
                            <span style={{ fontSize: '0.7rem' }}>📜 {doc.qualification}</span>
                            {doc.experience && <span style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>📅 {doc.experience}</span>}<br />
                            <span style={{ fontSize: '0.7rem' }}>⭐ {doc.rating} ({doc.reviewCount} reviews)</span>
                            {doc.languages?.length > 0 && <span style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>🗣️ {doc.languages.join(', ')}</span>}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1rem' }}>₹{doc.consultation_fee}</span>
                            {doc.availability?.slots_available > 0 && (
                              <div style={{ fontSize: '0.65rem', color: availBadge.color }}>{availBadge.text} ({doc.availability.slots_available} slots)</div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {searchQuery && singleMatching && (
                  <div style={{ margin: '0.5rem 0', padding: '0.5rem', backgroundColor: '#e0e7ff', borderRadius: '0.375rem' }}>
                    <strong>👨‍⚕️ Doctor:</strong> {matchingDoctors[0].name} - {matchingDoctors[0].specialization}<br />
                    <span style={{ fontSize: '0.75rem' }}>📜 {matchingDoctors[0].qualification}</span>
                    {matchingDoctors[0].experience && <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem' }}>📅 {matchingDoctors[0].experience}</span>}<br />
                    <span style={{ fontSize: '0.75rem' }}>⭐ {matchingDoctors[0].rating} ({matchingDoctors[0].reviewCount} reviews) | Fee: ₹{matchingDoctors[0].consultation_fee}</span>
                  </div>
                )}

                {searchQuery && matchingDoctors.length === 0 && (
                  <div style={{ margin: '0.5rem 0' }}>
                    <strong>👨‍⚕️ Available Doctors:</strong>
                    {(h.doctors || []).slice(0, 3).map(doc => (
                      <div key={doc.name} style={{ padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{doc.name}</strong> - {doc.specialization}<br />
                            <span style={{ fontSize: '0.7rem' }}>📜 {doc.qualification} | ⭐ {doc.rating} | 💰 ₹{doc.consultation_fee}</span>
                          </div>
                          <button onClick={() => handleBookOPD(h, doc)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.35rem 0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Lab Tests */}
                <div style={{ margin: '0.25rem 0' }}>
                  🧪 <strong>Lab Tests:</strong> {h.lab_tests_available ? '✅ Available' : h.lab_tests_available === false ? '🔗 Linked' : '❓ Unknown'}
                </div>

                {/* Insurance Section */}
                <div>
                  <div onClick={() => toggleInsurance(h._id)} style={{ cursor: 'pointer' }}>
                    <strong>🛡️ Insurance:</strong> <span style={{ color: '#3b82f6', fontSize: '0.875rem' }}>{showAllInsurance ? '▲' : '▼'} +{insuranceList.length} accepted</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                    {(showAllInsurance ? insuranceList : insuranceList.slice(0, 3)).map((ins, idx) => (
                      <span key={idx} style={{ backgroundColor: '#e0e7ff', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem' }}>{ins}</span>
                    ))}
                  </div>
                </div>

                {/* Pricing & Beds */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '0.5rem 0', backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem' }}>
                  <div>
                    <strong>📋 OPD</strong><br />
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>₹{opdFee}</span>
                    {selectedDoc && <span style={{ fontSize: '0.65rem', color: '#059669', display: 'block' }}>Save ₹{discountAmount} online</span>}
                  </div>
                  <div>
                    <strong>🏥 Admission/day</strong><br />
                    <span style={{ fontSize: '0.8rem' }}>ICU: ₹{h.pricing?.icu_bed_per_day?.toLocaleString() || 'N/A'}</span><br />
                    <span style={{ fontSize: '0.8rem' }}>General: ₹{h.pricing?.general_bed_per_day?.toLocaleString() || 'N/A'}</span>
                  </div>
                </div>

                {/* Bed Availability */}
                <div style={{ margin: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>🛏️ {h.beds?.available || 0} beds available</span>
                  {h.beds?.icu_available > 0 && <span style={{ fontSize: '0.75rem' }}>| ICU: {h.beds.icu_available}</span>}
                  <span style={{ backgroundColor: bedBadge.bg, color: bedBadge.color, padding: '0.1rem 0.4rem', borderRadius: '9999px', fontSize: '0.6rem' }}>{bedBadge.text}</span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <button onClick={() => handleBookOPD(h, selectedDoc)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    📋 Book OPD (Save ₹{discountAmount})
                  </button>
                  <button onClick={() => handleBookAdmission(h)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    🏥 Book Admission
                  </button>
                  <button onClick={() => handleViewDetails(h)} style={{ backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                    View Details
                  </button>
                  <button onClick={handleAmbulance} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                    🚑 Ambulance
                  </button>
                </div>

                {/* Emergency Badge */}
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
 
