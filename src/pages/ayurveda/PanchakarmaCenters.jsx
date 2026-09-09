import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPanchakarmaCenters } from '../../services/ayurvedaApi';
import {
  FaStar, FaMapMarkerAlt, FaBed, FaBuilding, FaSearch,
  FaFilter, FaArrowLeft, FaShieldAlt, FaUserMd,
  FaClock, FaCheckCircle, FaTimes, FaPhone, FaEnvelope
} from 'react-icons/fa';

const PanchakarmaCenters = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minDuration, setMinDuration] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  
  const [compareList, setCompareList] = useState([]);
  const [showCompareBar, setShowCompareBar] = useState(false);

  const cities = ['Mumbai', 'Delhi', 'Pune', 'Nagpur', 'Kochi', 'Rishikesh', 'Bengaluru', 'Hyderabad', 'Chennai', 'Jaipur'];
  const facilitiesList = ['AC Rooms', 'Organic Food', 'Yoga Hall', 'WiFi', 'Pickup/Drop', 'Garden', 'Meditation Hall'];
  const durations = [3, 5, 7, 10, 14, 21];

  useEffect(() => {
    fetchCenters();
  }, []);

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

  const getMinPrice = (center) => {
    const prices = center.packages?.map(p => p.discountPrice || p.price) || [];
    if (prices.length === 0) return 0;
    return Math.min(...prices);
  };

  const getTotalPackages = (center) => {
    return center.packages?.filter(p => p.isActive !== false).length || 0;
  };

  const filteredCenters = useMemo(() => {
    let result = [...centers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        c.name?.toLowerCase().includes(q) ||
        c.address?.city?.toLowerCase().includes(q) ||
        c.packages?.some(p => p.name?.toLowerCase().includes(q))
      );
    }

    if (selectedCity) {
      result = result.filter(c => c.address?.city === selectedCity);
    }

    if (minPrice) {
      result = result.filter(c => getMinPrice(c) >= parseInt(minPrice));
    }
    if (maxPrice) {
      result = result.filter(c => getMinPrice(c) <= parseInt(maxPrice));
    }

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price_low':
        result.sort((a, b) => getMinPrice(a) - getMinPrice(b));
        break;
      case 'price_high':
        result.sort((a, b) => getMinPrice(b) - getMinPrice(a));
        break;
      case 'packages':
        result.sort((a, b) => getTotalPackages(b) - getTotalPackages(a));
        break;
      default:
        break;
    }

    return result;
  }, [centers, searchQuery, selectedCity, minPrice, maxPrice, sortBy]);

  const toggleCompare = (center) => {
    if (compareList.find(c => c._id === center._id)) {
      const updated = compareList.filter(c => c._id !== center._id);
      setCompareList(updated);
      if (updated.length === 0) setShowCompareBar(false);
    } else if (compareList.length < 3) {
      setCompareList([...compareList, center]);
      setShowCompareBar(true);
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

  const handleBookPackage = (center, pkg) => {
    navigate(`/ayurveda/center/${center._id}/book/${pkg._id}`, { 
      state: { center, package: pkg } 
    });
  };

  const handleViewCenter = (center) => {
    navigate(`/ayurveda/center/${center._id}`, { state: { center } });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FaStar key={i} className={i < Math.floor(rating || 0) ? 'text-yellow-400' : 'text-gray-300'} />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button 
            onClick={() => navigate('/ayurveda')} 
            className="flex items-center gap-2 text-green-100 hover:text-white mb-4 transition-colors text-sm"
          >
            <FaArrowLeft /> Back to Ayurveda
          </button>
          
          <h1 className="text-3xl font-bold mb-1">Panchakarma & Wellness Centers</h1>
          <p className="text-green-100 mb-6">Book authentic Ayurvedic detox programs at verified centers</p>
          
          {/* SEARCH BAR */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[280px] relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search by center name, city, or therapy..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-green-300 text-gray-800 bg-white"
              />
            </div>
            
            <select 
              value={selectedCity} 
              onChange={e => setSelectedCity(e.target.value)}
              className="px-4 py-3 rounded-lg border-none text-gray-700 bg-white"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                showFilters ? 'bg-white text-green-700' : 'bg-green-800/40 text-white hover:bg-green-800/60'
              }`}
            >
              <FaFilter /> Filters
            </button>
            
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-lg border-none text-gray-700 bg-white"
            >
              <option value="rating">⭐ Highest Rated</option>
              <option value="price_low">💰 Price: Low to High</option>
              <option value="price_high">💰 Price: High to Low</option>
              <option value="packages">📦 Most Packages</option>
            </select>
          </div>
        </div>
      </div>

      {/* FILTERS PANEL */}
      {showFilters && (
        <div className="bg-white shadow-md border-b">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Filters</h3>
              <button 
                onClick={clearFilters}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Clear All Filters
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₹)</label>
                <div className="flex gap-3">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice} 
                    onChange={e => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice} 
                    onChange={e => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Duration (Days)</label>
                <select 
                  value={minDuration} 
                  onChange={e => setMinDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Any Duration</option>
                  {durations.map(d => (
                    <option key={d} value={d}>{d}+ Days</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CENTERS LIST */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {filteredCenters.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Centers Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
            <button 
              onClick={() => navigate('/ayurveda/center/register')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Register Your Center
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCenters.map(center => {
              const minPackagePrice = getMinPrice(center);
              const totalPackages = getTotalPackages(center);
              const isCompared = compareList.find(c => c._id === center._id);
              
              return (
                <div key={center._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
                  {/* CENTER HEADER */}
                  <div className="p-6">
                    <div className="flex gap-5 flex-wrap">
                      {/* Center Icon */}
                      <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center text-white text-3xl flex-shrink-0 shadow-lg">
                        <FaBuilding />
                      </div>
                      
                      {/* Center Info */}
                      <div className="flex-1 min-w-[250px]">
                        <div className="flex items-start justify-between flex-wrap gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="text-xl font-bold text-gray-800">{center.name}</h2>
                              {center.verificationStatus === 'approved' && (
                                <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                  <FaShieldAlt /> Verified
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 flex items-center gap-1 mt-1">
                              <FaMapMarkerAlt /> {center.address?.city}, {center.address?.state}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => toggleCompare(center)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                              isCompared 
                                ? 'bg-green-600 text-white border-green-600' 
                                : 'bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-600'
                            }`}
                          >
                            {isCompared ? '✓ Added' : '+ Compare'}
                          </button>
                        </div>
                        
                        {/* Rating & Stats */}
                        <div className="flex items-center gap-5 mt-3 flex-wrap text-sm">
                          <span className="flex items-center gap-1.5">
                            <div className="flex">{renderStars(center.rating)}</div>
                            <span className="font-semibold text-gray-700">{center.rating || 'New'}</span>
                            <span className="text-gray-400">({center.totalReviews || 0})</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <FaBed /> {center.bedCount || 'N/A'} Beds
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <FaUserMd /> {center.doctorCount || 0} Doctors
                          </span>
                        </div>
                      </div>
                      
                      {/* Price & CTA */}
                      <div className="text-right flex flex-col items-end justify-center min-w-[140px]">
                        {totalPackages > 0 ? (
                          <>
                            <p className="text-xs text-gray-500">Starting from</p>
                            <p className="text-2xl font-bold text-green-600">₹{minPackagePrice.toLocaleString()}</p>
                            <p className="text-xs text-gray-400 mb-2">{totalPackages} package{totalPackages > 1 ? 's' : ''}</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400 mb-2">No packages yet</p>
                        )}
                        <button
                          onClick={() => handleViewCenter(center)}
                          className="px-5 py-2 border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* FACILITIES */}
                  {center.facilities && center.facilities.length > 0 && (
                    <div className="px-6 py-3 border-t border-gray-100 flex flex-wrap gap-2">
                      {center.facilities.slice(0, 6).map((facility, i) => (
                        <span key={i} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                          <FaCheckCircle /> {facility}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* PACKAGES */}
                  {totalPackages > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                      <h4 className="font-semibold text-gray-800 mb-3">Available Packages</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {center.packages.filter(p => p.isActive !== false).map(pkg => (
                          <div 
                            key={pkg._id} 
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-400 hover:shadow-lg transition-all"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-gray-800">{pkg.name}</h5>
                              {pkg.discountPrice && pkg.discountPrice < pkg.price && (
                                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                  {Math.round((1 - pkg.discountPrice / pkg.price) * 100)}% OFF
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-500 mb-3">📅 {pkg.duration} Days</p>
                            
                            {pkg.therapies && pkg.therapies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {pkg.therapies.slice(0, 3).map((therapy, i) => (
                                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    {therapy}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                              <div>
                                {pkg.discountPrice ? (
                                  <>
                                    <p className="text-lg font-bold text-green-600">₹{pkg.discountPrice.toLocaleString()}</p>
                                    <p className="text-xs text-gray-400 line-through">₹{pkg.price.toLocaleString()}</p>
                                  </>
                                ) : (
                                  <p className="text-lg font-bold text-green-600">₹{pkg.price.toLocaleString()}</p>
                                )}
                              </div>
                              <button 
                                onClick={() => handleBookPackage(center, pkg)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COMPARE BAR */}
      {showCompareBar && compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white rounded-xl shadow-2xl z-50 px-6 py-4 flex items-center gap-6">
          <span className="font-medium">
            {compareList.length} center{compareList.length > 1 ? 's' : ''} selected
          </span>
          <button 
            onClick={() => navigate('/ayurveda/compare-centers', { state: { centers: compareList } })}
            className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Compare Now
          </button>
          <button 
            onClick={() => {
              setCompareList([]);
              setShowCompareBar(false);
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default PanchakarmaCenters;