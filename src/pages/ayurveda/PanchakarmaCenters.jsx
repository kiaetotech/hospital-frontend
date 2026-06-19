import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPanchakarmaCenters } from '../../services/ayurvedaApi';

const PanchakarmaCenters = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    duration: '',
    maxPrice: ''
  });

  const dummyCenters = [
    {
      _id: 'AYC001',
      name: 'AyurVeda Retreat Rishikesh',
      location: 'Rishikesh, Uttarakhand',
      rating: 4.9,
      totalReviews: 128,
      image: '🏔️',
      description: 'Nestled in the Himalayas, offering authentic Panchakarma with Ganges view',
      facilities: ['AC Rooms', 'Organic Food', 'Yoga Hall', 'Herbal Garden', 'WiFi', 'Ganges View'],
      packages: [
        { _id: 'PKG001', name: '7-Day Panchakarma Detox', price: 25000, duration: 7, therapies: ['Abhyanga', 'Shirodhara', 'Virechana', 'Basti'] },
        { _id: 'PKG002', name: '14-Day Rejuvenation', price: 45000, duration: 14, therapies: ['Full Panchakarma', 'Rasayana', 'Yoga Therapy', 'Meditation'] },
        { _id: 'PKG003', name: '21-Day Complete Transformation', price: 65000, duration: 21, therapies: ['Panchakarma', 'Rasayana', 'Diet Consultation', 'Lifestyle Coaching'] }
      ],
      doctors: 5,
      beds: 25,
      established: 2010,
      nearestAirport: 'Dehradun (35 km)'
    },
    {
      _id: 'AYC002',
      name: 'Kerala Ayurveda Kendra',
      location: 'Kochi, Kerala',
      rating: 4.8,
      totalReviews: 96,
      image: '🌴',
      description: 'Traditional Kerala Ayurveda with beach-side therapy rooms',
      facilities: ['Beach Access', 'Traditional Therapies', 'Organic Meals', 'AC Rooms', 'Swimming Pool'],
      packages: [
        { _id: 'PKG004', name: '5-Day Kerala Detox', price: 18000, duration: 5, therapies: ['Abhyanga', 'Kizhi', 'Nasya'] },
        { _id: 'PKG005', name: '10-Day Panchakarma', price: 35000, duration: 10, therapies: ['Full Panchakarma', 'Pizhichil', 'Sirovasthi'] }
      ],
      doctors: 3,
      beds: 15,
      established: 2005,
      nearestAirport: 'Kochi (15 km)'
    },
    {
      _id: 'AYC003',
      name: 'Dhanvantari Wellness Center',
      location: 'Pune, Maharashtra',
      rating: 4.7,
      totalReviews: 85,
      image: '🏥',
      description: 'Premium Ayurvedic hospital with modern amenities and traditional treatments',
      facilities: ['Luxury Rooms', 'Organic Restaurant', 'Yoga Studio', 'Library', 'Garden', 'Pickup/Drop'],
      packages: [
        { _id: 'PKG006', name: '3-Day Wellness Weekend', price: 12000, duration: 3, therapies: ['Abhyanga', 'Shirodhara', 'Yoga'] },
        { _id: 'PKG007', name: '7-Day Stress Relief', price: 28000, duration: 7, therapies: ['Panchakarma Mini', 'Meditation', 'Diet Plan'] },
        { _id: 'PKG008', name: '14-Day Complete Detox', price: 50000, duration: 14, therapies: ['Full Panchakarma', 'Rasayana', 'Yoga', 'Lifestyle Coaching'] }
      ],
      doctors: 8,
      beds: 40,
      established: 2015,
      nearestAirport: 'Pune (10 km)'
    }
  ];

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await getPanchakarmaCenters();
        const centersData = response.data?.data || response.data || [];
        setCenters(Array.isArray(centersData) && centersData.length > 0 ? centersData : dummyCenters);
      } catch (error) {
        setCenters(dummyCenters);
      } finally {
        setLoading(false);
      }
    };
    fetchCenters();
  }, []);

  const filteredCenters = centers.filter(center => {
    if (filters.location && !center.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.maxPrice) {
      const hasAffordablePackage = center.packages.some(pkg => pkg.price <= parseInt(filters.maxPrice));
      if (!hasAffordablePackage) return false;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #FF9800 0%, #E65100 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          🏨 Panchakarma & Wellness Centers
        </h1>
        <p style={{ opacity: 0.9 }}>
          Book authentic Ayurvedic detox programs at verified centers
        </p>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', gap: '1rem', flexWrap: 'wrap', 
        marginBottom: '2rem', padding: '1rem',
        backgroundColor: 'white', borderRadius: '0.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <input 
          placeholder="📍 Search by location..." 
          value={filters.location}
          onChange={(e) => setFilters({...filters, location: e.target.value})}
          style={filterStyle}
        />
        <select 
          value={filters.duration}
          onChange={(e) => setFilters({...filters, duration: e.target.value})}
          style={filterStyle}
        >
          <option value="">All Durations</option>
          <option value="3">3-5 Days</option>
          <option value="7">7-10 Days</option>
          <option value="14">14+ Days</option>
        </select>
        <input 
          type="number" 
          placeholder="Max Budget (₹)" 
          value={filters.maxPrice}
          onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
          style={filterStyle}
        />
      </div>

      {/* Centers List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading centers...</div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {filteredCenters.map(center => (
            <div 
              key={center._id}
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/ayurveda/center/${center._id}`)}
            >
              {/* Center Header */}
              <div style={{ 
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: '1rem'
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '3rem' }}>{center.image}</span>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                      {center.name}
                    </h2>
                    <p style={{ color: '#64748b' }}>📍 {center.location}</p>
                    <p style={{ color: '#f59e0b' }}>⭐ {center.rating} ({center.totalReviews} reviews)</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>👨‍⚕️ {center.doctors} Doctors</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>🛏️ {center.beds} Beds</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>✈️ {center.nearestAirport}</p>
                </div>
              </div>

              {/* Center Details */}
              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#475569', marginBottom: '1rem' }}>{center.description}</p>
                
                {/* Facilities */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <strong style={{ color: '#1e293b' }}>Facilities:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {center.facilities.map((facility, i) => (
                      <span key={i} style={{
                        padding: '4px 12px',
                        backgroundColor: '#e8f5e9',
                        color: '#2E7D32',
                        borderRadius: '20px',
                        fontSize: '0.8rem'
                      }}>
                        ✅ {facility}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Packages */}
                <div>
                  <strong style={{ color: '#1e293b' }}>Available Packages:</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    {center.packages.map(pkg => (
                      <div 
                        key={pkg._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/ayurveda/center/${center._id}/book/${pkg._id}`);
                        }}
                        style={{
                          padding: '1rem',
                          border: '2px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          transition: 'border-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FF9800'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      >
                        <h4 style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
                          {pkg.name}
                        </h4>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                          📅 {pkg.duration} Days
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                          {pkg.therapies.slice(0, 3).map((therapy, i) => (
                            <span key={i} style={{
                              fontSize: '0.7rem', padding: '2px 8px',
                              backgroundColor: '#fef3c7', borderRadius: '10px'
                            }}>
                              {therapy}
                            </span>
                          ))}
                          {pkg.therapies.length > 3 && <span style={{ fontSize: '0.7rem' }}>+{pkg.therapies.length - 3} more</span>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', color: '#FF9800', fontSize: '1.1rem' }}>
                            ₹{pkg.price.toLocaleString()}
                          </span>
                          <button style={{
                            padding: '0.4rem 1rem',
                            backgroundColor: '#FF9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}>
                            Book Now
                          </button>
                        </div>
                      </div>
                    ))}
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

const filterStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  fontSize: '0.9rem',
  minWidth: '200px'
};

export default PanchakarmaCenters;