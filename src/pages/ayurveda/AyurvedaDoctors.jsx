import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AyurvedaDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [consultMode, setConsultMode] = useState('all');
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    specialization: '',
    minRating: '',
    maxFee: '',
    sortBy: 'rating'
  });

  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Kochi', 'Chandigarh', 'Indore', 'Bhopal', 'Nagpur', 'Surat', 'Vadodara', 'Patna', 'Guwahati', 'Bhubaneswar', 'Dehradun', 'Rishikesh', 'Haridwar', 'Varanasi', 'Goa', 'Mysore', 'Coimbatore', 'Trivandrum', 'Raipur', 'Ranchi', 'Ludhiana', 'Amritsar', 'Nashik', 'Mangalore', 'Madurai', 'Shimla', 'Manali', 'Udaipur', 'Jodhpur', 'Agra'].sort();

  const specializations = ['Panchakarma', 'General Ayurveda', 'Kerala Ayurveda', 'Ayurvedic Dermatology', 'Kayachikitsa', 'Rasayana Therapy', 'Shalya Tantra', 'Prasuti & Stri Roga', 'Bal Roga', 'Swasthavritta'];

  // ============================================
  // Fetch doctors from REAL API
  // ============================================
  useEffect(() => {
    fetchDoctors();
    getUserLocation();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/ayurveda/doctors');
      if (res.data?.success && res.data?.data?.length > 0) {
        setDoctors(res.data.data);
        setFilteredDoctors(res.data.data);
      } else {
        setDoctors([]);
        setFilteredDoctors([]);
        setError('No doctors available yet. Please check back later.');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setDoctors([]);
      setFilteredDoctors([]);
      setError('Unable to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10;
  };

  // ============================================
  // Apply filters
  // ============================================
  useEffect(() => {
    let result = [...doctors];
    if (result.length === 0) { setFilteredDoctors([]); return; }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(d =>
        (d.name && d.name.toLowerCase().includes(term)) ||
        (d.specialization && d.specialization.toLowerCase().includes(term)) ||
        (d.address?.city && d.address.city.toLowerCase().includes(term)) ||
        (d.languages && d.languages.some(l => l.toLowerCase().includes(term)))
      );
    }

    if (consultMode === 'online') result = result.filter(d => d.consultationTypes?.online);
    if (consultMode === 'clinic') result = result.filter(d => d.consultationTypes?.clinic);
    if (filters.city) result = result.filter(d => d.address?.city === filters.city);
    if (filters.specialization) result = result.filter(d => d.specialization === filters.specialization);
    if (filters.minRating) result = result.filter(d => (d.rating || 0) >= parseFloat(filters.minRating));
    if (filters.maxFee) result = result.filter(d => (d.consultationFee || 0) <= parseInt(filters.maxFee));

    if (userLocation) {
      result = result.map(d => ({
        ...d,
        distance: d.address?.coordinates ? calculateDistance(userLocation.lat, userLocation.lng, d.address.coordinates[1], d.address.coordinates[0]) : null
      }));
    }

    switch(filters.sortBy) {
      case 'distance': result.sort((a, b) => (a.distance || 9999) - (b.distance || 9999)); break;
      case 'fee-low': result.sort((a, b) => (a.consultationFee || 0) - (b.consultationFee || 0)); break;
      case 'fee-high': result.sort((a, b) => (b.consultationFee || 0) - (a.consultationFee || 0)); break;
      case 'experience': result.sort((a, b) => (b.experience || 0) - (a.experience || 0)); break;
      default: result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    }

    setFilteredDoctors(result);
  }, [searchTerm, filters, doctors, userLocation, consultMode]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({ city: '', specialization: '', minRating: '', maxFee: '', sortBy: 'rating' });
    setConsultMode('all');
  };

  const handleBook = (e, doctor, type) => {
    e.stopPropagation();
    navigate(`/ayurveda/book/${doctor._id}`, { state: { doctor, consultationType: type } });
  };

  const handleViewProfile = (doctor) => {
    navigate(`/ayurveda/doctor/${doctor._id}`, { state: { doctor } });
  };

  const selectStyle = { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', backgroundColor: 'white', color: '#1e293b' };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/ayurveda')} style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>← Back</button>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0 }}>👨‍⚕️ Ayurvedic Doctors {!loading && `(${filteredDoctors.length})`}</h1>
      </div>

      {/* Search + Filters */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', marginBottom: '12px' }}>
        <input type="text" placeholder="🔍 Search doctor name, city, specialty..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', marginBottom: '10px' }} />

        {/* 🆕 Online/Clinic Toggle */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
          {[
            { mode: 'all', label: 'All', color: '#4CAF50' },
            { mode: 'online', label: '💻 Online', color: '#2196F3' },
            { mode: 'clinic', label: '🏥 Clinic Visit', color: '#FF9800' },
          ].map(({ mode, label, color }) => (
            <button key={mode} onClick={() => setConsultMode(mode)}
              style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                border: consultMode === mode ? `2px solid ${color}` : '1px solid #e2e8f0',
                background: consultMode === mode ? (mode === 'all' ? '#e8f5e9' : mode === 'online' ? '#e3f2fd' : '#fff7ed') : 'white', color: '#1e293b' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Filter Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
          <select value={filters.city} onChange={(e) => setFilters({...filters, city: e.target.value})} style={selectStyle}>
            <option value="">📍 All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.specialization} onChange={(e) => setFilters({...filters, specialization: e.target.value})} style={selectStyle}>
            <option value="">🏥 All Specialties</option>
            {specializations.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.minRating} onChange={(e) => setFilters({...filters, minRating: e.target.value})} style={selectStyle}>
            <option value="">⭐ Any Rating</option>
            <option value="4.5">4.5+</option><option value="4.0">4.0+</option>
          </select>
          <select value={filters.maxFee} onChange={(e) => setFilters({...filters, maxFee: e.target.value})} style={selectStyle}>
            <option value="">💰 Any Fee</option>
            <option value="300">Up to ₹300</option><option value="500">Up to ₹500</option><option value="700">Up to ₹700</option><option value="1000">Up to ₹1000</option>
          </select>
          <select value={filters.sortBy} onChange={(e) => setFilters({...filters, sortBy: e.target.value})} style={selectStyle}>
            <option value="rating">Top Rated</option><option value="distance">Nearest</option><option value="fee-low">Fee: Low-High</option><option value="fee-high">Fee: High-Low</option><option value="experience">Most Experienced</option>
          </select>
          <button onClick={clearAllFilters} style={{ padding: '8px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>🔄 Clear</button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>⏳ Loading doctors...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🕉️</div>
          <p style={{ color: '#64748b', fontSize: '15px' }}>{error}</p>
          <button onClick={() => navigate('/ayurveda/doctor/register')} style={{ marginTop: '12px', padding: '10px 24px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
            Register as Ayurvedic Doctor →
          </button>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
          <p style={{ color: '#64748b', fontSize: '15px' }}>No doctors match your filters</p>
          <button onClick={clearAllFilters} style={{ marginTop: '10px', color: '#4CAF50', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>Clear filters</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {filteredDoctors.map((doctor, i) => (
            <div key={doctor._id || i} onClick={() => handleViewProfile(doctor)}
              style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', cursor: 'pointer', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', transition: 'box-shadow 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)'}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #059669, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '22px', flexShrink: 0 }}>👨‍⚕️</div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', margin: '0 0 2px' }}>{doctor.name}</h3>
                      <p style={{ color: '#059669', fontWeight: '600', fontSize: '12px', margin: '0 0 2px' }}>{doctor.specialization}</p>
                      <p style={{ color: '#64748b', fontSize: '11px', margin: 0 }}>
                        {doctor.address?.city}{doctor.address?.area ? `, ${doctor.address.area}` : ''}
                        {doctor.distance && <span style={{ marginLeft: '6px', color: '#2196F3', fontWeight: '600' }}>📍 {doctor.distance} km</span>}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>₹{doctor.consultationFee}</p>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>⭐ {doctor.rating || 'New'} • {doctor.experience || 0} yrs</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {doctor.consultationTypes?.online && (
                      <button onClick={(e) => handleBook(e, doctor, 'online')}
                        style={{ padding: '6px 14px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}>💻 Online Consult</button>
                    )}
                    {doctor.consultationTypes?.clinic && (
                      <button onClick={(e) => handleBook(e, doctor, 'clinic')}
                        style={{ padding: '6px 14px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}>🏥 Clinic Visit</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AyurvedaDoctors;

