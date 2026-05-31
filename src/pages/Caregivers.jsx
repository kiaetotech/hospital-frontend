import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Caregivers = () => {
  const navigate = useNavigate();
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    radius: 10,
    gender: 'any',
    serviceType: '',
    minRating: '',
    minExperience: '',
    maxHourlyRate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    fetchCaregivers();
  }, [filters, userLocation, currentPage]);

  const fetchCaregivers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
      }
      params.append('radius', filters.radius);
      if (filters.gender !== 'any') params.append('gender', filters.gender);
      if (filters.serviceType) params.append('serviceType', filters.serviceType);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.minExperience) params.append('minExperience', filters.minExperience);
      if (filters.maxHourlyRate) params.append('maxHourlyRate', filters.maxHourlyRate);
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      
      const res = await api.get(`/caregivers/search?${params.toString()}`);
      setCaregivers(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceTypeIcon = (type) => {
    if (type === 'personal') return '🩺 Personal Care';
    if (type === 'skilled') return '💉 Skilled Nursing';
    return '🤝 Both';
  };

  const getRatingStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '⭐'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading caregivers...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a' }}>👵 Find a Caregiver</h1>
        <p style={{ marginBottom: '1rem' }}>Connect with trusted caregivers for in-home care services</p>

        {/* Filters Row */}
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={filters.serviceType} onChange={(e) => setFilters({...filters, serviceType: e.target.value})} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
            <option value="">All Services</option>
            <option value="personal">Personal Care Only</option>
            <option value="skilled">Skilled Nursing Only</option>
            <option value="both">Both</option>
          </select>
          
          <select value={filters.gender} onChange={(e) => setFilters({...filters, gender: e.target.value})} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
            <option value="any">Any Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          
          <select value={filters.minExperience} onChange={(e) => setFilters({...filters, minExperience: e.target.value})} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
            <option value="">Any Experience</option>
            <option value="2">2+ years</option>
            <option value="5">5+ years</option>
            <option value="10">10+ years</option>
          </select>
          
          <select value={filters.minRating} onChange={(e) => setFilters({...filters, minRating: e.target.value})} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
            <option value="">Any Rating</option>
            <option value="4">4★ & up</option>
            <option value="4.5">4.5★ & up</option>
          </select>
          
          <input type="number" placeholder="Max hourly rate ₹" value={filters.maxHourlyRate} onChange={(e) => setFilters({...filters, maxHourlyRate: e.target.value})} style={{ width: '150px', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          
          <select value={filters.radius} onChange={(e) => setFilters({...filters, radius: e.target.value})} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="20">Within 20 km</option>
            <option value="50">Within 50 km</option>
          </select>
          
          <button onClick={fetchCaregivers} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Apply Filters</button>
        </div>

        {/* Caregiver Cards Grid */}
        {caregivers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
            <p>No caregivers found matching your criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
            {caregivers.map(c => (
              <div key={c._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <img src={c.photo} alt={c.fullName} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{c.fullName}</h3>
                      {c.isVerified && <span style={{ color: '#10b981', fontSize: '0.75rem' }}>✓ Verified</span>}
                    </div>
                    <div>{getRatingStars(c.ratings.average)} ({c.ratings.count} reviews)</div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{c.experienceYears} years exp • {getServiceTypeIcon(c.serviceType)}</p>
                    {c.distance && <p style={{ fontSize: '0.875rem', color: '#3b82f6' }}>📍 {c.distance} km away</p>}
                    <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#10b981' }}>₹{c.pricing.personal?.hourly || c.pricing.skilled?.hourly}/hour</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button onClick={() => navigate(`/caregivers/${c._id}`)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>View Profile</button>
                      <button onClick={() => navigate(`/book-caregiver/${c._id}`)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Book Now</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
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

export default Caregivers;