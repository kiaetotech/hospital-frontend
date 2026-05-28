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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHospitals, setTotalHospitals] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState({});
  const [expandedInsurance, setExpandedInsurance] = useState({});

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.error('Location error:', error)
      );
    }
  }, []);

  // Fetch hospitals
  useEffect(() => {
    fetchHospitals();
  }, [searchQuery, city, page, userLocation]);

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
      params.append('page', page);
      params.append('limit', 10);
      
      const res = await api.get(`/hospitals/search?${params.toString()}`);
      setHospitals(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotalHospitals(res.data.pagination?.totalHospitals || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHospitals();
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const toggleInsurance = (hospitalId) => {
    setExpandedInsurance(prev => ({ ...prev, [hospitalId]: !prev[hospitalId] }));
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading hospitals...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1.5rem' }}>🏥 KiaetoCare Hospitals</h1>
        
        <form onSubmit={handleSearch} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input type="text" placeholder="Search by disease, pain, symptom (e.g., heart attack, chest pain, fever)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 3, padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
            <input type="text" placeholder="City (optional)" value={city} onChange={(e) => setCity(e.target.value)} style={{ flex: 1, padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
            <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>🔍 Search</button>
          </div>
        </form>

        {hospitals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
            <p>No hospitals found for "{searchQuery}".</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {hospitals.map(hospital => {
              const distance = userLocation && hospital.location ? calculateDistance(userLocation.lat, userLocation.lng, hospital.location.lat, hospital.location.lng) : null;
              const discountAmount = Math.round((hospital.pricing?.consultation || 0) * 0.1);
              const discountedPrice = (hospital.pricing?.consultation || 0) - discountAmount;
              
              return (
                <div key={hospital._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{hospital.name}</h2>
                    <div>⭐ {hospital.ratings?.average} ({hospital.ratings?.count} reviews)</div>
                  </div>
                  <p style={{ color: '#6b7280' }}>{hospital.address?.city}, {hospital.address?.state} {distance && `📍 ${distance} km away`}</p>
                  
                  {/* Doctors with radio buttons and ratings */}
                  <div style={{ margin: '0.5rem 0' }}>
                    <strong>👨‍⚕️ Select Doctor:</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {hospital.doctors?.map((doc, idx) => (
                        <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: selectedDoctor[hospital._id] === doc.name ? '#d1fae5' : '#f3f4f6', borderRadius: '0.375rem', cursor: 'pointer' }}>
                          <input type="radio" name={`doctor_${hospital._id}`} value={doc.name} checked={selectedDoctor[hospital._id] === doc.name} onChange={() => setSelectedDoctor(prev => ({ ...prev, [hospital._id]: doc.name }))} />
                          <div style={{ flex: 1 }}><strong>{doc.name}</strong> - {doc.specialization}<div style={{ fontSize: '0.75rem' }}>⭐ {doc.rating || '4.5'} ({doc.reviewCount || 100} reviews)</div></div>
                          <span style={{ fontWeight: 'bold', color: '#10b981' }}>₹{doc.consultation_fee}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Lab Tests */}
                  <div style={{ margin: '0.5rem 0' }}>🧪 <strong>Lab Tests:</strong> {hospital.lab_tests_available ? '✅ Available' : '🔗 Linked'}</div>
                  
                  {/* Insurance with expandable */}
                  <div style={{ margin: '0.5rem 0' }}>
                    <div onClick={() => toggleInsurance(hospital._id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>🛡️ Insurance Accepted:</strong>
                      <span style={{ color: '#3b82f6' }}>{expandedInsurance[hospital._id] ? '▲ Show less' : `▼ +${hospital.insurance_accepted?.length} more`}</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(expandedInsurance[hospital._id] ? hospital.insurance_accepted : hospital.insurance_accepted?.slice(0, 2)).map((ins, idx) => (
                        <span key={idx} style={{ backgroundColor: '#e0e7ff', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem' }}>{ins}</span>
                      ))}
                      {!expandedInsurance[hospital._id] && hospital.insurance_accepted?.length > 2 && (
                        <span style={{ color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer' }} onClick={() => toggleInsurance(hospital._id)}>+{hospital.insurance_accepted.length - 2} more</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Pricing */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '0.75rem 0', backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem' }}>
                    <div><strong>📋 OPD Consultation</strong><br /><span style={{ textDecoration: 'line-through' }}>₹{hospital.pricing?.consultation}</span><br /><span style={{ color: '#10b981', fontWeight: 'bold' }}>₹{discountedPrice}</span> <span style={{ fontSize: '0.75rem' }}>(Save ₹{discountAmount})</span></div>
                    <div><strong>🏥 Admission (per day)</strong><br />ICU: ₹{hospital.pricing?.icu_bed_per_day}<br />General: ₹{hospital.pricing?.general_bed_per_day}<br />🛏️ {hospital.beds?.available} beds available</div>
                  </div>
                  
                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate(`/book-opd/${hospital._id}`)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>📋 Book OPD (Save ₹{discountAmount})</button>
                    <button onClick={() => navigate(`/book-admission/${hospital._id}`)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>🏥 Book Admission (Save 10%)</button>
                    <button onClick={() => navigate(`/hospital-info/${hospital._id}`)} style={{ backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>View Details</button>
                    <button onClick={() => navigate('/ambulance')} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>🚑 Book Ambulance</button>
                  </div>
                  
                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {hospital.has24x7ER && <span style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>🚨 24/7 Emergency</span>}
                    {hospital.ambulance_available && <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>🚑 Ambulance</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalsList;
