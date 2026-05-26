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

  const PaginationControls = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.5rem 1rem', backgroundColor: page === 1 ? '#e5e7eb' : '#3b82f6', color: page === 1 ? '#9ca3af' : 'white', border: 'none', borderRadius: '0.375rem', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>◀ Previous</button>
      <span style={{ padding: '0.5rem 1rem' }}>Page {page} of {totalPages}</span>
      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '0.5rem 1rem', backgroundColor: page === totalPages ? '#e5e7eb' : '#3b82f6', color: page === totalPages ? '#9ca3af' : 'white', border: 'none', borderRadius: '0.375rem', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Next ▶</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1.5rem' }}>🏥 KiaetoCare Hospitals</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '1rem' }}>
            <input type="text" placeholder="Search by disease, pain, symptom, surgery (e.g., heart attack, chest pain, fever)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' }} />
            <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>🔍 Search</button>
          </div>
          <div>
            <input type="text" placeholder="City (optional)" value={city} onChange={(e) => setCity(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
          </div>
        </form>

        {/* Results Count */}
        {!loading && hospitals.length > 0 && (
          <div style={{ marginBottom: '1rem', color: '#6b7280' }}>Showing {Math.min(page * 10, totalHospitals)} of {totalHospitals} hospitals</div>
        )}

        {/* Hospital Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading hospitals...</div>
        ) : hospitals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
            <p>No hospitals found for "{searchQuery}".</p>
            <p>Try: heart attack, chest pain, fever, accident, stroke, kidney stone</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {hospitals.map((hospital) => {
              const discountAmount = Math.round((hospital.pricing?.consultation || 0) * 0.1);
              const discountedPrice = (hospital.pricing?.consultation || 0) - discountAmount;
              
              return (
                <div key={hospital._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  
                  {/* Hospital Name & Distance */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{hospital.name}</h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span>⭐ {hospital.ratings?.average} ({hospital.ratings?.count} reviews)</span>
                      {hospital.distance && <span>📍 {hospital.distance} km away</span>}
                    </div>
                  </div>
                  
                  {/* Location */}
                  <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>{hospital.address?.city}, {hospital.address?.state}</p>
                  
                  {/* Lab Test Tag - Available or Linked */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem' }}>
                      🧪 Lab Tests: {hospital.lab_tests_available ? '✅ Available' : '🔗 Linked'}
                    </span>
                  </div>
                  
                  {/* Doctors for Disease Search */}
                  <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
                    👨‍⚕️ Doctors: {hospital.doctors?.slice(0, 3).map(d => d.name).join(', ')}
                    {hospital.doctors?.length > 3 && ` +${hospital.doctors.length - 3} more`}
                  </div>
                  
                  {/* Pricing Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem' }}>
                    <div>
                      <strong>📋 OPD Consultation</strong><br />
                      <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{hospital.pricing?.consultation}</span><br />
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹{discountedPrice}</span>
                      <span style={{ fontSize: '0.75rem', color: '#10b981' }}> (Save ₹{discountAmount})</span>
                    </div>
                    <div>
                      <strong>🏥 Admission (per day)</strong><br />
                      ICU: ₹{hospital.pricing?.icu_bed_per_day}<br />
                      General: ₹{hospital.pricing?.general_bed_per_day}<br />
                      <span style={{ fontSize: '0.75rem', color: hospital.beds?.available > 0 ? '#10b981' : '#ef4444' }}>🛏️ {hospital.beds?.available} beds available</span>
                    </div>
                  </div>
                  
                  {/* Insurance Accepted */}
                  <div style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                    <strong>🛡️ Insurance:</strong> {hospital.insurance_accepted?.join(', ')}
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem }}>
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
                  
                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {hospital.has24x7ER && <span style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>🚨 24/7 Emergency</span>}
                    {hospital.ambulance_available && <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>🚑 Ambulance</span>}
                    <span style={{ backgroundColor: '#10b981', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>💰 10% Discount</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {!loading && hospitals.length > 0 && <PaginationControls />}
      </div>
    </div>
  );
};

export default HospitalsList;
