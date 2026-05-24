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
  const [userLocation, setUserLocation] = useState(null);
  const [sortBy, setSortBy] = useState('emergency');

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

  useEffect(() => {
    if (searchQuery) {
      fetchEmergencyHospitals();
    }
  }, [searchQuery, userLocation, sortBy]);

  const fetchEmergencyHospitals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('disease', searchQuery);
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
      }
      params.append('sortBy', sortBy);
      
      const res = await api.get(`/hospitals/emergency-search?${params.toString()}`);
      setHospitals(res.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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

  const getAmbulanceETA = (distance) => {
    if (!distance) return 'N/A';
    const minutes = Math.round(distance * 2);
    return `${minutes} min`;
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Searching for hospitals near you...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🚨 Emergency: {searchQuery}</h1>
          <p>Showing hospitals that can handle your emergency.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => setSortBy('emergency')} style={{ padding: '0.5rem 1rem', backgroundColor: sortBy === 'emergency' ? '#dc2626' : '#e5e7eb', color: sortBy === 'emergency' ? 'white' : 'black', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>🚨 Emergency Ready First</button>
          <button onClick={() => setSortBy('distance')} style={{ padding: '0.5rem 1rem', backgroundColor: sortBy === 'distance' ? '#dc2626' : '#e5e7eb', color: sortBy === 'distance' ? 'white' : 'black', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>📍 Nearest First</button>
          <button onClick={() => setSortBy('rating')} style={{ padding: '0.5rem 1rem', backgroundColor: sortBy === 'rating' ? '#dc2626' : '#e5e7eb', color: sortBy === 'rating' ? 'white' : 'black', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>⭐ Highest Rated</button>
        </div>

        {hospitals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
            <p>No hospitals found for "{searchQuery}".</p>
            <p>Try: "fever", "chest pain", "accident", "heart attack"</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {hospitals.map((hospital) => {
              const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, hospital.location?.lat, hospital.location?.lng) : null;
              const eta = getAmbulanceETA(distance);
              
              return (
                <div key={hospital._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap' }}>
                    <div style={{ flex: 2 }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{hospital.name}</h2>
                      <p style={{ color: '#6b7280' }}>{hospital.address?.city}, {hospital.address?.state}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {hospital.has24x7ER && <span style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem' }}>🚨 24/7 Emergency</span>}
                        {hospital.beds?.icu_available > 0 && <span style={{ backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem' }}>🛏️ ICU: {hospital.beds.icu_available} beds</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '150px' }}>
                      {distance && <p style={{ fontWeight: 'bold' }}>📍 {distance} km away</p>}
                      {eta && <p style={{ color: '#dc2626', fontWeight: 'bold' }}>🚑 Ambulance: {eta}</p>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                    <button onClick={() => navigate(`/hospitals/${hospital._id}`)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>View Details</button>
                    <button onClick={() => navigate(`/ambulance/book?hospitalId=${hospital._id}`)} style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>🚑 Book Ambulance</button>
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