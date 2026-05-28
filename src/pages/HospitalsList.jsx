import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const [showAllInsurance, setShowAllInsurance] = useState(null);
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

  // Get user location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  }, []);

  // Fetch hospitals when search changes
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
      console.log('API Response:', res.data);
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

  // Helper to get nested values safely
  const getNestedValue = (obj, path, defaultValue = 'N/A') => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
  };

  // Calculate distance between two coordinates
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

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading hospitals...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1.5rem' }}>🏥 KiaetoCare Hospitals</h1>
        
        <form onSubmit={handleSearch} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="Search by disease, pain, symptom (e.g., heart attack, chest pain, fever)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 3, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' }}
            />
            <input 
              type="text" 
              placeholder="City (optional)" 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' }}
            />
            <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              🔍 Search
            </button>
          </div>
        </form>

        {!loading && hospitals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
            <p>No hospitals found for "{searchQuery}".</p>
            <p>Try: heart attack, chest pain, fever, accident, stroke, kidney stone</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {hospitals.map((hospital) => {
              const consultationFee = getNestedValue(hospital, 'pricing.consultation', 500);
              const discountAmount = Math.round(consultationFee * 0.1);
              const discountedPrice = consultationFee - discountAmount;
              const rating = getNestedValue(hospital, 'ratings.average', 'N/A');
              const reviewCount = getNestedValue(hospital, 'ratings.count', 0);
              const insuranceCount = hospital.insurance_accepted?.length || 0;
              
              // Calculate distance
              let distance = null;
              if (userLocation && hospital.location) {
                distance = calculateDistance(userLocation.lat, userLocation.lng, hospital.location.lat, hospital.location.lng);
              } else if (userLocation && hospital.address?.coordinates) {
                distance = calculateDistance(userLocation.lat, userLocation.lng, hospital.address.coordinates.lat, hospital.address.coordinates.lng);
              }
              
              return (
                <div key={hospital._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  
                  {/* Hospital Name and Rating Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{hospital.name}</h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span>⭐ {rating} ({reviewCount} reviews)</span>
                    </div>
                  </div>
                  
                  {/* Location and Distance */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <p style={{ color: '#6b7280', margin: 0 }}>{hospital.address?.city}, {hospital.address?.state}</p>
                    {distance && <span style={{ color: '#3b82f6', fontSize: '0.875rem' }}>📍 {distance} km away</span>}
                  </div>
                  
                  {/* Doctors List */}
                  <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
                    👨‍⚕️ <strong>Doctors:</strong> {hospital.doctors?.map(d => d.name).join(', ') || 'Information not available'}
                  </div>
<div style={{ marginBottom: '0.75rem' }}>
  <strong>👨‍⚕️ Select Doctor:</strong>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
    {hospital.doctors?.map((doctor, idx) => (
      <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: selectedDoctor === doctor.name ? '#d1fae5' : '#f3f4f6', borderRadius: '0.375rem', cursor: 'pointer' }}>
        <input 
          type="radio" 
          name={`doctor_${hospital._id}`} 
          value={doctor.name}
          checked={selectedDoctor === doctor.name}
          onChange={() => setSelectedDoctor(doctor.name)}
        />
        <div style={{ flex: 1 }}>
          <strong>{doctor.name}</strong> - {doctor.specialization}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <span>⭐ {doctor.rating || '4.5'}</span>
            <span style={{ color: '#6b7280' }}>({doctor.reviewCount || '120'} reviews)</span>
          </div>
        </div>
        <span style={{ fontWeight: 'bold', color: '#10b981' }}>₹{doctor.consultation_fee}</span>
      </label>
    ))}
  </div>
</div>
                  
                  {/* Lab Test and Insurance Row - Aligned */}
                  <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.875rem' }}>
                      🧪 <strong>Lab Tests:</strong> {hospital.lab_tests_available ? '✅ Available' : '🔗 Linked'}
                    </div>
                    // Insurance Section with Expand/Collapse
<div style={{ marginBottom: '0.75rem' }}>
  <div 
    onClick={() => setShowAllInsurance(showAllInsurance === hospital._id ? null : hospital._id)} 
    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
  >
    <strong>🛡️ Insurance Accepted:</strong>
    <span style={{ color: '#3b82f6', fontSize: '0.875rem' }}>
      {showAllInsurance === hospital._id ? '▲ Show less' : `▼ +${hospital.insurance_accepted?.length} more`}
    </span>
  </div>
  
  {showAllInsurance === hospital._id ? (
    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {hospital.insurance_accepted?.map((ins, idx) => (
        <span key={idx} style={{ backgroundColor: '#e0e7ff', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
          {ins}
        </span>
      ))}
    </div>
  ) : (
    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {hospital.insurance_accepted?.slice(0, 2).map((ins, idx) => (
        <span key={idx} style={{ backgroundColor: '#e0e7ff', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
          {ins}
        </span>
      ))}
      {hospital.insurance_accepted?.length > 2 && (
        <span style={{ color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer' }}>+{hospital.insurance_accepted.length - 2} more</span>
      )}
    </div>
  )}
</div>

                  
                  {/* Pricing Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem' }}>
                    <div>
                      <strong>📋 OPD Consultation</strong><br />
                      <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{consultationFee}</span><br />
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹{discountedPrice}</span>
                      <span style={{ fontSize: '0.75rem', color: '#10b981' }}> (Save ₹{discountAmount})</span>
                    </div>
                    <div>
                      <strong>🏥 Admission (per day)</strong><br />
                      ICU: ₹{getNestedValue(hospital, 'pricing.icu_bed_per_day', 'N/A')}<br />
                      General: ₹{getNestedValue(hospital, 'pricing.general_bed_per_day', 'N/A')}<br />
                      <span style={{ fontSize: '0.75rem' }}>🛏️ {getNestedValue(hospital, 'beds.available', 0)} beds available</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate(`/book-opd/${hospital._id}`)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                      📋 Book OPD (Save ₹{discountAmount})
                    </button>
                    <button onClick={() => navigate(`/book-admission/${hospital._id}`)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                      🏥 Book Admission (Save 10%)
                    </button>
                    <button onClick={() => navigate(`/hospital-info/${hospital._id}`)} style={{ backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                      View Details
                    </button>
                    <button onClick={() => navigate('/ambulance')} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                      🚑 Book Ambulance
                    </button>
                  </div>
                  
                  {/* Emergency Badges (without discount tag) */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {hospital.has24x7ER === 'true' && <span style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>🚨 24/7 Emergency</span>}
                    {hospital.ambulance_available === 'true' && <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>🚑 Ambulance</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {!loading && hospitals.length > 0 && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.5rem 1rem', backgroundColor: page === 1 ? '#e5e7eb' : '#3b82f6', color: page === 1 ? '#9ca3af' : 'white', border: 'none', borderRadius: '0.375rem', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Previous</button>
            <span style={{ padding: '0.5rem 1rem' }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '0.5rem 1rem', backgroundColor: page === totalPages ? '#e5e7eb' : '#3b82f6', color: page === totalPages ? '#9ca3af' : 'white', border: 'none', borderRadius: '0.375rem', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

const [selectedDoctor, setSelectedDoctor] = useState('');

export default HospitalsList;
