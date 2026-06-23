import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MentalHealthTherapists = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [therapists, setTherapists] = useState([]);
  const [filters, setFilters] = useState({
    city: '',
    specialization: '',
    minRating: '',
    maxPrice: '',
    consultationType: 'all'
  });

  useEffect(() => {
    fetchTherapists();
  }, [filters]);

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.specialization) params.append('specializations', filters.specialization);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.consultationType && filters.consultationType !== 'all') {
        params.append('consultationType', filters.consultationType);
      }

      const res = await axios.get(`/api/mentalhealth/therapists?${params.toString()}`);
      if (res.data.success) {
        setTherapists(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching therapists:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/mentalhealth')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🧠 Find a Therapist</h1>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Filters */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'flex-end'
        }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>City</label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="e.g., Mumbai"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Specialization</label>
            <input
              type="text"
              value={filters.specialization}
              onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
              placeholder="e.g., Anxiety"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Min Rating</label>
            <input
              type="number"
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
              placeholder="4.0"
              style={inputStyle}
              step="0.1"
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Max Price</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="1000"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Consultation Type</label>
            <select
              value={filters.consultationType}
              onChange={(e) => setFilters({ ...filters, consultationType: e.target.value })}
              style={inputStyle}
            >
              <option value="all">All Types</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="text">Text</option>
              <option value="anonymous">Anonymous</option>
            </select>
          </div>
          <button
            onClick={fetchTherapists}
            style={{ padding: '0.6rem 1.5rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Search
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem' }}>Loading therapists...</p>
        ) : therapists.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px' }}>
            <p style={{ color: '#6b7280' }}>No therapists found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {therapists.map((therapist) => (
              <div key={therapist._id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderTop: '4px solid #8b5cf6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👤</div>
                  <div>
                    <h4 style={{ fontWeight: 'bold' }}>{therapist.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>{therapist.specializations?.slice(0, 2).join(', ')}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                    ⭐ {therapist.rating || 0}
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                  {therapist.experience} years experience • {therapist.languages?.join(', ')}
                </p>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '0.75rem' }}>
                  {formatCurrency(therapist.pricing?.consultation || 500)}/session
                </div>
                <button
                  onClick={() => navigate(`/mentalhealth/therapist/${therapist._id}`)}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle = {
  width: '180px',
  padding: '0.6rem',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  fontSize: '0.9rem',
  backgroundColor: 'white',
  outline: 'none'
};

export default MentalHealthTherapists;