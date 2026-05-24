import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const HospitalsList = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [disease, setDisease] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, [city, disease]);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (disease) params.append('disease', disease);
      const res = await api.get(`/hospitals/search?${params.toString()}`);
      setHospitals(res.data.data || []);
    } catch (error) {
      console.error('Error:', error);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHospitals();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1.5rem' }}>Find Hospitals</h1>
        
        <form onSubmit={handleSearch} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
          <input type="text" placeholder="Disease / Specialty" value={disease} onChange={(e) => setDisease(e.target.value)} style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
          <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Search</button>
        </form>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : hospitals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No hospitals found. Try a different city.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {hospitals.map((hospital) => (
              <div key={hospital._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <img src={hospital.image || 'https://placehold.co/600x200/e2e8f0/1e293b?text=Hospital'} alt={hospital.name} style={{ width: '100%', height: '192px', objectFit: 'cover' }} />
                <div style={{ padding: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{hospital.name}</h2>
                  <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>{hospital.address?.city}, {hospital.address?.state}</p>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#fbbf24' }}>⭐</span>
                    <span style={{ marginLeft: '0.25rem' }}>{hospital.ratings?.average || 'N/A'}</span>
                    <span style={{ marginLeft: '0.25rem', color: '#6b7280' }}>({hospital.ratings?.count || 0} reviews)</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/hospitals/${hospital._id}`)}
                    style={{ width: '100%', backgroundColor: '#1e3a8a', color: 'white', padding: '0.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalsList;
