import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Caregivers = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('loading');
  const [filters, setFilters] = useState({
    radius: 10,
    gender: 'any',
    serviceType: '',
    minRating: '',
    minExperience: '',
    maxHourlyRate: '',
    specializations: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const itemsPerPage = 6;

  // Complete caregiver data
  const allCaregivers = [
    {
      _id: '1',
      fullName: 'Priya Sharma',
      photo: 'https://placehold.co/100x100/e2e8f0/1e293b?text=PS',
      gender: 'female',
      serviceType: 'both',
      experienceYears: 8,
      certifications: ['RN', 'CPR', 'BLS'],
      specializations: ['dementia', 'post-surgery', 'bedridden'],
      pricing: { personal: { hourly: 350 }, skilled: { hourly: 500 } },
      ratings: { average: 4.8, count: 124 },
      isVerified: true,
      distance: 2.5,
      location: { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    {
      _id: '2',
      fullName: 'Rajesh Kumar',
      photo: 'https://placehold.co/100x100/e2e8f0/1e293b?text=RK',
      gender: 'male',
      serviceType: 'personal',
      experienceYears: 5,
      certifications: ['CNA', 'CPR'],
      specializations: ['elder care', 'mobility support'],
      pricing: { personal: { hourly: 250 } },
      ratings: { average: 4.6, count: 89 },
      isVerified: true,
      distance: 3.8,
      location: { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Saturday', 'Sunday']
    },
    {
      _id: '3',
      fullName: 'Sunita Reddy',
      photo: 'https://placehold.co/100x100/e2e8f0/1e293b?text=SR',
      gender: 'female',
      serviceType: 'skilled',
      experienceYears: 12,
      certifications: ['RN', 'BLS', 'ACLS'],
      specializations: ['wound care', 'ventilator', 'tracheostomy'],
      pricing: { skilled: { hourly: 650 } },
      ratings: { average: 4.9, count: 210 },
      isVerified: true,
      distance: 5.2,
      location: { city: 'Navi Mumbai', lat: 19.0330, lng: 73.0297 },
      availability: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    {
      _id: '4',
      fullName: 'Anita Desai',
      photo: 'https://placehold.co/100x100/e2e8f0/1e293b?text=AD',
      gender: 'female',
      serviceType: 'personal',
      experienceYears: 3,
      certifications: ['BLS'],
      specializations: ['newborn care', 'postnatal'],
      pricing: { personal: { hourly: 200 } },
      ratings: { average: 4.5, count: 45 },
      isVerified: true,
      distance: 4.5,
      location: { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      availability: ['Monday', 'Friday', 'Saturday', 'Sunday']
    },
    {
      _id: '5',
      fullName: 'Vikram Singh',
      photo: 'https://placehold.co/100x100/e2e8f0/1e293b?text=VS',
      gender: 'male',
      serviceType: 'both',
      experienceYears: 15,
      certifications: ['RN', 'CPR', 'ACLS', 'BLS'],
      specializations: ['dementia', 'palliative', 'hospice'],
      pricing: { personal: { hourly: 600 }, skilled: { hourly: 800 } },
      ratings: { average: 4.9, count: 320 },
      isVerified: true,
      distance: 6.0,
      location: { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    {
      _id: '6',
      fullName: 'Meera Joshi',
      photo: 'https://placehold.co/100x100/e2e8f0/1e293b?text=MJ',
      gender: 'female',
      serviceType: 'skilled',
      experienceYears: 7,
      certifications: ['RN', 'CPR'],
      specializations: ['diabetes care', 'wound care'],
      pricing: { skilled: { hourly: 550 } },
      ratings: { average: 4.7, count: 98 },
      isVerified: true,
      distance: 3.2,
      location: { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      availability: ['Monday', 'Tuesday', 'Thursday', 'Friday']
    }
  ];

  const [filteredCaregivers, setFilteredCaregivers] = useState(allCaregivers);
  const [loading, setLoading] = useState(false);

  // Get user location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationStatus('success');
        },
        (error) => {
          console.error('Location error:', error);
          setLocationStatus('error');
        }
      );
    } else {
      setLocationStatus('unsupported');
    }
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    applyFilters();
  }, [filters]);

  const applyFilters = () => {
    setLoading(true);
    let filtered = [...allCaregivers];
    
    // Filter by service type
    if (filters.serviceType) {
      if (filters.serviceType === 'personal') {
        filtered = filtered.filter(c => c.serviceType === 'personal' || c.serviceType === 'both');
      } else if (filters.serviceType === 'skilled') {
        filtered = filtered.filter(c => c.serviceType === 'skilled' || c.serviceType === 'both');
      }
    }
    
    // Filter by gender
    if (filters.gender && filters.gender !== 'any') {
      filtered = filtered.filter(c => c.gender === filters.gender);
    }
    
    // Filter by min experience
    if (filters.minExperience) {
      filtered = filtered.filter(c => c.experienceYears >= parseInt(filters.minExperience));
    }
    
    // Filter by min rating
    if (filters.minRating) {
      filtered = filtered.filter(c => c.ratings.average >= parseFloat(filters.minRating));
    }
    
    // Filter by max hourly rate
    if (filters.maxHourlyRate) {
      const maxRate = parseInt(filters.maxHourlyRate);
      filtered = filtered.filter(c => {
        const rate = c.serviceType === 'personal' ? c.pricing.personal?.hourly : c.pricing.skilled?.hourly;
        return rate <= maxRate;
      });
    }
    
    // Filter by specializations
    if (filters.specializations) {
      const specTerms = filters.specializations.toLowerCase().split(',').map(s => s.trim());
      filtered = filtered.filter(c => 
        c.specializations.some(spec => specTerms.some(term => spec.toLowerCase().includes(term)))
      );
    }
    
    // Filter by radius (simulated distance)
    if (userLocation && filters.radius) {
      const maxDist = parseInt(filters.radius);
      filtered = filtered.filter(c => c.distance <= maxDist);
    }
    
    setFilteredCaregivers(filtered);
    setCurrentPage(1);
    setLoading(false);
  };

  const resetFilters = () => {
    setFilters({
      radius: 10,
      gender: 'any',
      serviceType: '',
      minRating: '',
      minExperience: '',
      maxHourlyRate: '',
      specializations: ''
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const getServiceTypeText = (type) => {
    if (type === 'personal') return '🩺 Personal Care';
    if (type === 'skilled') return '💉 Skilled Nursing';
    return '🤝 Both';
  };

  const getRatingStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '⭐'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  };

  // Pagination
  const paginatedCaregivers = filteredCaregivers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredCaregivers.length / itemsPerPage);

  if (locationStatus === 'loading') {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Detecting your location...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a' }}>👵 Find a Caregiver</h1>
          <p style={{ color: '#6b7280' }}>Connect with trusted caregivers for in-home care services</p>
          {locationStatus === 'success' && userLocation && (
            <p style={{ fontSize: '0.875rem', color: '#10b981' }}>📍 Location detected! Showing caregivers near you.</p>
          )}
        </div>

        {/* Filters Section */}
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontWeight: 'bold' }}>🔍 Filter Caregivers</h3>
            <button onClick={() => setShowFilters(!showFilters)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
              {showFilters ? '▲ Hide Filters' : '▼ Show Filters'}
            </button>
          </div>
          
          {showFilters && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              <select value={filters.serviceType} onChange={(e) => handleFilterChange('serviceType', e.target.value)} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
                <option value="">All Services</option>
                <option value="personal">Personal Care Only</option>
                <option value="skilled">Skilled Nursing Only</option>
              </select>
              
              <select value={filters.gender} onChange={(e) => handleFilterChange('gender', e.target.value)} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
                <option value="any">Any Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              
              <select value={filters.minExperience} onChange={(e) => handleFilterChange('minExperience', e.target.value)} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
                <option value="">Experience</option>
                <option value="2">2+ years</option>
                <option value="5">5+ years</option>
                <option value="10">10+ years</option>
              </select>
              
              <select value={filters.minRating} onChange={(e) => handleFilterChange('minRating', e.target.value)} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
                <option value="">Rating</option>
                <option value="4">4★ & up</option>
                <option value="4.5">4.5★ & up</option>
              </select>
              
              <input type="number" placeholder="Max hourly rate (₹)" value={filters.maxHourlyRate} onChange={(e) => handleFilterChange('maxHourlyRate', e.target.value)} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
              
              <select value={filters.radius} onChange={(e) => handleFilterChange('radius', e.target.value)} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="20">Within 20 km</option>
                <option value="50">Within 50 km</option>
              </select>
              
              <input type="text" placeholder="Specializations (comma separated)" value={filters.specializations} onChange={(e) => handleFilterChange('specializations', e.target.value)} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={applyFilters} style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '0.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Apply</button>
                <button onClick={resetFilters} style={{ flex: 1, backgroundColor: '#6b7280', color: 'white', padding: '0.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Reset</button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>Found {filteredCaregivers.length} caregivers</p>

        {/* Caregiver Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading caregivers...</div>
        ) : paginatedCaregivers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
            <p>No caregivers found matching your criteria.</p>
            <button onClick={resetFilters} style={{ marginTop: '1rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Reset Filters</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
            {paginatedCaregivers.map(c => (
              <div key={c._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <img src={c.photo} alt={c.fullName} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{c.fullName}</h3>
                      {c.isVerified && <span style={{ backgroundColor: '#10b981', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '9999px', fontSize: '0.7rem' }}>✓ Verified</span>}
                    </div>
                    <div style={{ fontSize: '0.875rem' }}>{getRatingStars(c.ratings.average)} ({c.ratings.count} reviews)</div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0' }}>
                      {c.experienceYears} years • {getServiceTypeText(c.serviceType)}
                    </p>
                    {c.specializations && c.specializations.length > 0 && (
                      <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>🎯 {c.specializations.slice(0, 2).join(', ')}</p>
                    )}
                    {c.distance && <p style={{ fontSize: '0.875rem', color: '#3b82f6' }}>📍 {c.distance} km away</p>}
                    <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#10b981' }}>
                      ₹{c.pricing?.personal?.hourly || c.pricing?.skilled?.hourly}/hour
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button onClick={() => navigate(`/caregiver-profile/${c._id}`)} style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white', padding: '0.4rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>View Profile</button>
                      <button onClick={() => navigate(`/book-caregiver/${c._id}`)} style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '0.4rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>Book Now</button>
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