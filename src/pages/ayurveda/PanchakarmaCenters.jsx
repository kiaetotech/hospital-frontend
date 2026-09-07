import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPanchakarmaCenters } from '../../services/ayurvedaApi';

const PanchakarmaCenters = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    duration: '',
    maxPrice: ''
  });

  useEffect(() => {
    const fetchCenters = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getPanchakarmaCenters();
        const centersData = response.data?.data || response.data || [];
        setCenters(Array.isArray(centersData) ? centersData : []);
      } catch (err) {
        setError('Failed to load centers. Please try again.');
        setCenters([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCenters();
  }, []);

  const filteredCenters = centers.filter(center => {
    if (filters.location && !center.location?.toLowerCase().includes(filters.location.toLowerCase()) && !center.address?.city?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.maxPrice && center.packages) {
      const hasAffordablePackage = center.packages.some(pkg => (pkg.discountPrice || pkg.price) <= parseInt(filters.maxPrice));
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
        <input 
          type="number" 
          placeholder="Max Budget (₹)" 
          value={filters.maxPrice}
          onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
          style={filterStyle}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Centers List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading centers...</div>
      ) : filteredCenters.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</p>
          <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>No Centers Available</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Currently there are no verified Panchakarma centers listed.
          </p>
          <button
            onClick={() => navigate('/ayurveda/center/register')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Register Your Center
          </button>
        </div>
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
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                    {center.name}
                  </h2>
                  <p style={{ color: '#64748b' }}>📍 {center.address?.city}, {center.address?.state}</p>
                  <p style={{ color: '#f59e0b' }}>⭐ {center.rating || 'New'} ({center.totalReviews || 0} reviews)</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>🛏️ {center.bedCount || 'N/A'} Beds</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>🏥 {center.type || 'Wellness Center'}</p>
                </div>
              </div>

              {/* Center Details */}
              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#475569', marginBottom: '1rem' }}>{center.description}</p>
                
                {/* Facilities */}
                {center.facilities && center.facilities.length > 0 && (
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
                )}

                {/* Packages */}
                {center.packages && center.packages.length > 0 && (
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
                            {pkg.therapies?.slice(0, 3).map((therapy, i) => (
                              <span key={i} style={{
                                fontSize: '0.7rem', padding: '2px 8px',
                                backgroundColor: '#fef3c7', borderRadius: '10px'
                              }}>
                                {therapy}
                              </span>
                            ))}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#FF9800', fontSize: '1.1rem' }}>
                              ₹{(pkg.discountPrice || pkg.price)?.toLocaleString()}
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
                )}
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