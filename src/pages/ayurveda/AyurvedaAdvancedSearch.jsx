import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchDoctors, getNearbyDoctors } from '../../services/ayurvedaApi';

const AyurvedaAdvancedSearch = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search filters
  const [filters, setFilters] = useState({
    specialization: '',
    radius: 10, // km
    maxFee: '',
    sortBy: 'distance',
    consultationType: 'both'
  });

  // 🆕 Get User's Current Location
  const getUserLocation = () => {
    setLocationLoading(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationLoading(false);
        // Auto-search with location
        handleSearch({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        setLocationError('Unable to retrieve your location. Please enter manually.');
        setLocationLoading(false);
        // Default to Delhi if location denied
        setUserLocation({ lat: 28.6139, lng: 77.2090 });
      }
    );
  };

  // 🆕 Search with Filters
  const handleSearch = async (locationOverride) => {
    const searchLocation = locationOverride || userLocation;
    
    if (!searchLocation) {
      alert('Please enable location or enter city manually');
      return;
    }

    setLoading(true);
    try {
      const params = {
        lat: searchLocation.lat,
        lng: searchLocation.lng,
        radius: filters.radius,
        specialization: filters.specialization,
        maxFee: filters.maxFee || undefined,
        sortBy: filters.sortBy,
        limit: 20
      };

      const response = await searchDoctors(params);
      
      // Handle response
      let doctors = [];
      if (response.data?.data) {
        doctors = Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      setSearchResults(doctors);
    } catch (error) {
      console.error('Search failed:', error);
      // Use nearby endpoint as fallback
      try {
        const nearbyResponse = await getNearbyDoctors(searchLocation.lat, searchLocation.lng);
        setSearchResults(nearbyResponse.data?.data || []);
      } catch (fallbackError) {
        setSearchResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Search Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          📍 Find Ayurvedic Doctors Near You
        </h1>
        
        {/* Location Bar */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: '#333',
          marginBottom: '1rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>📍</span>
          {locationLoading ? (
            <span>Detecting your location...</span>
          ) : userLocation ? (
            <span>
              ✅ Location detected (Lat: {userLocation.lat}, Lng: {userLocation.lng})
            </span>
          ) : (
            <span>⚠️ {locationError || 'Location not set'}</span>
          )}
          <button 
            onClick={getUserLocation}
            style={{ 
              marginLeft: 'auto',
              padding: '0.5rem 1rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            {locationLoading ? 'Detecting...' : '📍 Refresh Location'}
          </button>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <select 
            value={filters.specialization}
            onChange={(e) => setFilters({...filters, specialization: e.target.value})}
            style={filterInputStyle}
          >
            <option value="">All Specializations</option>
            <option value="Panchakarma">Panchakarma</option>
            <option value="General Ayurveda">General Ayurveda</option>
            <option value="Kerala Ayurveda">Kerala Ayurveda</option>
            <option value="Ayurvedic Dermatology">Dermatology</option>
            <option value="Kayachikitsa">Kayachikitsa</option>
          </select>

          <select 
            value={filters.radius}
            onChange={(e) => setFilters({...filters, radius: e.target.value})}
            style={filterInputStyle}
          >
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="20">Within 20 km</option>
            <option value="50">Within 50 km</option>
          </select>

          <select 
            value={filters.sortBy}
            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            style={filterInputStyle}
          >
            <option value="distance">Sort by: Nearest</option>
            <option value="rating">Sort by: Rating</option>
            <option value="fee">Sort by: Fee (Low to High)</option>
            <option value="experience">Sort by: Experience</option>
          </select>

          <input 
            type="number" 
            placeholder="Max Fee (₹)" 
            value={filters.maxFee}
            onChange={(e) => setFilters({...filters, maxFee: e.target.value})}
            style={filterInputStyle}
          />
        </div>

        <button 
          onClick={() => handleSearch()}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? '🔍 Searching...' : '🔍 Search Doctors'}
        </button>
      </div>

      {/* Results */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
          {searchResults.length > 0 
            ? `📍 ${searchResults.length} Ayurvedic Doctors Found` 
            : '🔍 Search for doctors near you'}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem' }}>🔄</div>
            <p>Searching for the best Ayurvedic doctors near you...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {searchResults.map((doctor, index) => (
              <div
                key={doctor._id || index}
                onClick={() => navigate(`/ayurveda/doctor/${doctor._id}`)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'center',
                  borderLeft: doctor.distance <= 5 ? '4px solid #4CAF50' : '4px solid #2196F3'
                }}
              >
                {/* Doctor Avatar */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#e8f5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  flexShrink: 0
                }}>
                  👨‍⚕️
                </div>

                {/* Doctor Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1e293b' }}>
                        {doctor.name}
                      </h3>
                      <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                        {doctor.specialization}
                      </p>
                    </div>
                    {/* Distance Badge */}
                    {doctor.distance !== undefined && (
                      <span style={{
                        backgroundColor: doctor.distance <= 5 ? '#e8f5e9' : '#e3f2fd',
                        color: doctor.distance <= 5 ? '#2E7D32' : '#1565C0',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        📍 {doctor.distance} km
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', color: '#64748b' }}>
                    <span>⭐ {doctor.rating}</span>
                    <span>📅 {doctor.experience} yrs</span>
                    <span>📍 {doctor.address?.city}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.1rem' }}>
                      ₹{doctor.consultationFee}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/ayurveda/book/${doctor._id}`);
                      }}
                      style={{
                        padding: '0.5rem 1.5rem',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && searchResults.length === 0 && userLocation && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Doctors Found</h3>
            <p>Try expanding your search radius or changing filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

const filterInputStyle = {
  padding: '0.5rem',
  borderRadius: '0.25rem',
  border: '1px solid rgba(255,255,255,0.3)',
  backgroundColor: 'rgba(255,255,255,0.9)',
  color: '#333',
  fontSize: '0.9rem'
};

export default AyurvedaAdvancedSearch;