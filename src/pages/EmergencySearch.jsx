import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EmergencySearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('emergency');

  useEffect(() => {
    if (searchQuery) {
      fetchHospitals();
    }
  }, [searchQuery, sortBy]);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      // Use the same search endpoint that works on the hospitals page
      const params = new URLSearchParams();
      params.append('q', searchQuery);
      params.append('sort_by', sortBy);
      
      const res = await api.get(`/hospitals/search?${params.toString()}`);
      console.log('Emergency search response:', res.data);
      setHospitals(res.data.data || []);
    } catch (error) {
      console.error('Error:', error);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (type) => {
    setSortBy(type);
  };

  // Helper to get nested values safely
  const getNestedValue = (obj, path, defaultValue = 'N/A') => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Searching for hospitals near you...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Emergency Header */}
        <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🚨 Emergency: {searchQuery}</h1>
          <p>Showing hospitals that can handle your emergency.</p>
        </div>

        {/* Sort Options */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => handleSort('priority')} style={{ padding: '0.5rem 1rem', backgroundColor: sortBy === 'priority' ? '#dc2626' : '#e5e7eb', color: sortBy === 'priority' ? 'white' : 'black', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>🏆 Priority First</button>
          <button onClick={() => handleSort('price')} style={{ padding: '0.5rem 1rem', backgroundColor: sortBy === 'price' ? '#dc2626' : '#e5e7eb', color: sortBy === 'price' ? 'white' : 'black', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>💰 Lowest Price</button>
          <button onClick={() => handleSort('rating')} style={{ padding: '0.5rem 1rem', backgroundColor: sortBy === 'rating' ? '#dc2626' : '#e5e7eb', color: sortBy === 'rating' ? 'white' : 'black', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>⭐ Highest Rated</button>
        </div>

        {hospitals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
            <p>No hospitals found for "{searchQuery}".</p>
            <p>Try: "heart attack", "chest pain", "fever", "accident", "stroke"</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {hospitals.map((hospital) => {
              const consultationFee = getNestedValue(hospital, 'pricing.consultation', 500);
              const discountAmount = Math.round(consultationFee * 0.1);
              const discountedPrice = consultationFee - discountAmount;
              const diseases = getNestedValue(hospital, 'address.diseases_treated', []);
              const rating = getNestedValue(hospital, 'ratings.average', 'N/A');
              const reviewCount = getNestedValue(hospital, 'ratings.count', 0);
              
              return (
                <div key={hospital._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{hospital.name}</h2>
                    <div>
                      <span>⭐ {rating} ({reviewCount} reviews)</span>
                    </div>
                  </div>
                  
                  <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>{hospital.address?.city}, {hospital.address?.state}</p>
                  
                  {diseases.length > 0 && (
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
                      🩺 Treats: {diseases.slice(0, 3).join(', ')}{diseases.length > 3 && ` +${diseases.length - 3}`}
                    </div>
                  )}
                  
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
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate(`/book-opd/${hospital._id}`)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                      📋 Book OPD
                    </button>
                    <button onClick={() => navigate(`/book-admission/${hospital._id}`)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                      🏥 Book Admission
                    </button>
                    <button onClick={() => navigate(`/hospital-info/${hospital._id}`)} style={{ backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                      View Details
                    </button>
                    <button onClick={() => navigate('/ambulance')} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                      🚑 Ambulance
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {hospital.has24x7ER === 'true' && <span style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>🚨 24/7 Emergency</span>}
                    {hospital.ambulance_available === 'true' && <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>🚑 Ambulance</span>}
                    <span style={{ backgroundColor: '#10b981', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>💰 10% Discount</span>
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

export default EmergencySearch;

