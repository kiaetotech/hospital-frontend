import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPanchakarmaCenters } from '../../services/ayurvedaApi';
import {
  FaStar, FaMapMarkerAlt, FaBed, FaBuilding, FaSearch,
  FaFilter, FaSortAmountDown, FaCheckCircle, FaHeart,
  FaUserMd, FaClock, FaRupeeSign, FaArrowLeft
} from 'react-icons/fa';

const PanchakarmaCenters = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minDuration, setMinDuration] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  
  // Compare
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const cities = ['Mumbai', 'Delhi', 'Pune', 'Nagpur', 'Kochi', 'Rishikesh', 'Bengaluru', 'Hyderabad'];
  const facilitiesList = ['AC Rooms', 'Organic Food', 'Yoga Hall', 'WiFi', 'Swimming Pool', 'Garden', 'Pickup/Drop', 'Beach Access'];
  const durations = [3, 5, 7, 10, 14, 21];

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPanchakarmaCenters();
      const centersData = response.data?.data || [];
      setCenters(Array.isArray(centersData) ? centersData : []);
    } catch (err) {
      setError('Failed to load centers');
      setCenters([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = useMemo(() => {
    let result = [...centers];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name?.toLowerCase().includes(q) ||
        c.address?.city?.toLowerCase().includes(q) ||
        c.type?.toLowerCase().includes(q) ||
        c.packages?.some(p => p.name?.toLowerCase().includes(q))
      );
    }

    // City filter
    if (selectedCity) {
      result = result.filter(c => c.address?.city === selectedCity);
    }

    // Price filter
    if (minPrice) {
      result = result.filter(c => 
        c.packages?.some(p => (p.discountPrice || p.price) >= parseInt(minPrice))
      );
    }
    if (maxPrice) {
      result = result.filter(c => 
        c.packages?.some(p => (p.discountPrice || p.price) <= parseInt(maxPrice))
      );
    }

    // Duration filter
    if (minDuration) {
      result = result.filter(c => 
        c.packages?.some(p => p.duration >= parseInt(minDuration))
      );
    }

    // Facilities filter
    if (selectedFacilities.length > 0) {
      result = result.filter(c => 
        selectedFacilities.every(f => c.facilities?.includes(f))
      );
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price_low':
        result.sort((a, b) => 
          Math.min(...(a.packages?.map(p => p.discountPrice || p.price) || [0])) - 
          Math.min(...(b.packages?.map(p => p.discountPrice || p.price) || [0]))
        );
        break;
      case 'price_high':
        result.sort((a, b) => 
          Math.max(...(b.packages?.map(p => p.discountPrice || p.price) || [0])) - 
          Math.max(...(a.packages?.map(p => p.discountPrice || p.price) || [0]))
        );
        break;
      default:
        break;
    }

    return result;
  }, [centers, searchQuery, selectedCity, minPrice, maxPrice, minDuration, selectedFacilities, sortBy]);

  const toggleFacility = (facility) => {
    if (selectedFacilities.includes(facility)) {
      setSelectedFacilities(selectedFacilities.filter(f => f !== facility));
    } else {
      setSelectedFacilities([...selectedFacilities, facility]);
    }
  };

  const toggleCompare = (center) => {
    if (compareList.find(c => c._id === center._id)) {
      setCompareList(compareList.filter(c => c._id !== center._id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, center]);
    } else {
      alert('Maximum 3 centers for comparison');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setMinPrice('');
    setMaxPrice('');
    setMinDuration('');
    setSelectedFacilities([]);
    setSortBy('rating');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #EA580C, #C2410C)', padding: '2rem', color: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <button onClick={() => navigate('/ayurveda')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FaArrowLeft /> Back to Ayurveda
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>🏨 Panchakarma & Wellness Centers</h1>
          <p style={{ opacity: 0.9 }}>Book authentic Ayurvedic detox programs at verified centers</p>
          
          {/* SEARCH BAR */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: 12, top: 14, color: '#94a3b8' }} />
              <input
                placeholder="Search by center name, city, or therapy..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 8, border: 'none', fontSize: '0.95rem' }}
              />
            </div>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: 8, border: 'none', fontSize: '0.9rem' }}>
              <option value="">All Cities</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
            <button onClick={() => setShowFilters(!showFilters)}
              style={{ padding: '0.75rem 1.25rem', borderRadius: 8, border: 'none', background: showFilters ? '#fff' : 'rgba(255,255,255,0.2)', color: showFilters ? '#C2410C' : 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaFilter /> Filters
            </button>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: 8, border: 'none', fontSize: '0.9rem' }}>
              <option value="rating">⭐ Highest Rated</option>
              <option value="price_low">💰 Price: Low to High</option>
              <option value="price_high">💰 Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* FILTERS PANEL */}
      {showFilters && (
        <div style={{ background: 'white', padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Price Range (₹)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                    style={{ width: '50%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6 }} />
                  <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                    style={{ width: '50%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6 }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Min Duration (Days)</label>
                <select value={minDuration} onChange={e => setMinDuration(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6 }}>
                  <option value="">Any Duration</option>
                  {durations.map(d => <option key={d} value={d}>{d}+ Days</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Facilities</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {facilitiesList.map(f => (
                    <button key={f} onClick={() => toggleFacility(f)}
                      style={{
                        padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', cursor: 'pointer',
                        background: selectedFacilities.includes(f) ? '#EA580C' : '#f1f5f9',
                        color: selectedFacilities.includes(f) ? 'white' : '#475569',
                        border: 'none'
                      }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={clearFilters} style={{ padding: '0.5rem 1.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* COMPARE BAR */}
      {compareList.length > 0 && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: 'white', padding: '1rem 1.5rem', borderRadius: 12, zIndex: 100, display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>{compareList.length} center(s) selected</span>
          <button onClick={() => navigate('/ayurveda/compare-centers', { state: { centers: compareList } })}
            style={{ padding: '0.5rem 1rem', background: '#EA580C', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Compare Now
          </button>
          <button onClick={() => setCompareList([])} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* CENTERS LIST */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem' }}>🔄</div>
            <p>Loading centers...</p>
          </div>
        ) : filteredCenters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 16 }}>
            <div style={{ fontSize: '3rem' }}>🏨</div>
            <h3 style={{ color: '#1e293b' }}>No Centers Found</h3>
            <p style={{ color: '#64748b' }}>Try adjusting your filters</p>
            <button onClick={() => navigate('/ayurveda/center/register')}
              style={{ padding: '0.75rem 1.5rem', background: '#EA580C', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, marginTop: '1rem' }}>
              Register Your Center
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {filteredCenters.map(center => {
              const minPackagePrice = Math.min(...(center.packages?.map(p => p.discountPrice || p.price) || [0]));
              const totalPackages = center.packages?.length || 0;
              
              return (
                <div key={center._id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  {/* CENTER HEADER */}
                  <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ width: 100, height: 100, background: 'linear-gradient(135deg, #EA580C, #C2410C)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', flexShrink: 0 }}>
                      🏨
                    </div>
                    <div style={{ flex: 1, minWidth: 250 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>{center.name}</h2>
                          <p style={{ color: '#64748b', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <FaMapMarkerAlt /> {center.address?.city}, {center.address?.state}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button onClick={() => toggleCompare(center)}
                            style={{
                              padding: '0.4rem 0.8rem', borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer',
                              background: compareList.find(c => c._id === center._id) ? '#EA580C' : '#f1f5f9',
                              color: compareList.find(c => c._id === center._id) ? 'white' : '#475569',
                              border: 'none', fontWeight: 600
                            }}>
                            {compareList.find(c => c._id === center._id) ? '✓ Added' : '+ Compare'}
                          </button>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FaStar style={{ color: '#f59e0b' }} /> {center.rating || 'New'} ({center.totalReviews || 0} reviews)
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FaBed /> {center.bedCount || 'N/A'} Beds
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FaBuilding /> {center.type || 'Wellness Center'}
                        </span>
                        {totalPackages > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <FaClock /> {totalPackages} Packages from ₹{minPackagePrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FACILITIES */}
                  {center.facilities && center.facilities.length > 0 && (
                    <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {center.facilities.map((facility, i) => (
                        <span key={i} style={{ padding: '4px 12px', background: '#fef3c7', color: '#92400e', borderRadius: 20, fontSize: '0.75rem' }}>
                          ✓ {facility}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* PACKAGES */}
                  {center.packages && center.packages.length > 0 && (
                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9' }}>
                      <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>Available Packages</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                        {center.packages.map(pkg => (
                          <div key={pkg._id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#EA580C'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                            onClick={() => navigate(`/ayurveda/center/${center._id}/book/${pkg._id}`, { state: { center, package: pkg } })}>
                            <h5 style={{ fontWeight: 700, margin: 0, color: '#1e293b' }}>{pkg.name}</h5>
                            <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0' }}>📅 {pkg.duration} Days</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                              {pkg.therapies?.slice(0, 3).map((therapy, i) => (
                                <span key={i} style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#f1f5f9', borderRadius: 10 }}>{therapy}</span>
                              ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 700, color: '#EA580C', fontSize: '1.1rem' }}>₹{(pkg.discountPrice || pkg.price).toLocaleString()}</span>
                              <button style={{ padding: '0.4rem 1rem', background: '#EA580C', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                                Book Now
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VIEW DETAILS */}
                  <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center' }}>
                    <button onClick={() => navigate(`/ayurveda/center/${center._id}`, { state: { center } })}
                      style={{ padding: '0.5rem 2rem', background: 'none', border: '1.5px solid #EA580C', color: '#EA580C', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                      View Center Details
                    </button>
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

export default PanchakarmaCenters;