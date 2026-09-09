import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPanchakarmaCenters } from '../../services/ayurvedaApi';
import {
  FaStar, FaMapMarkerAlt, FaBed, FaBuilding, FaSearch,
  FaFilter, FaArrowLeft, FaShieldAlt, FaUserMd,
  FaClock, FaCheckCircle, FaTimes, FaChevronRight,
  FaRupeeSign, FaBox, FaHeart, FaRegHeart, FaBookmark,
  FaRegBookmark, FaPhone, FaEnvelope, FaWifi, FaUtensils,
  FaSwimmingPool, FaParking, FaSpa, FaLeaf, FaSun, FaMoon,
  FaUsers, FaCalendarCheck, FaTrophy, FaChevronDown, FaChevronUp,
  FaMapPin, FaDirections, FaStarHalfAlt
} from 'react-icons/fa';

const PanchakarmaCenters = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [minDuration, setMinDuration] = useState('');
  const [selectedTherapy, setSelectedTherapy] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  
  // UI State
  const [compareList, setCompareList] = useState([]);
  const [savedCenters, setSavedCenters] = useState([]);
  const [showCompareBar, setShowCompareBar] = useState(false);
  const [expandedCenter, setExpandedCenter] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PER_PAGE = 5;

  const cities = ['Mumbai', 'Delhi', 'Pune', 'Nagpur', 'Kochi', 'Rishikesh', 'Bengaluru', 'Hyderabad', 'Chennai', 'Jaipur', 'Varanasi', 'Udaipur'];
  const therapies = ['Abhyanga', 'Shirodhara', 'Basti', 'Nasya', 'Virechana', 'Vamana', 'Pizhichil', 'Udvartana'];
  const durations = [3, 5, 7, 10, 14, 21, 28];

  useEffect(() => {
    fetchCenters();
    const saved = JSON.parse(localStorage.getItem('savedAyurvedaCenters') || '[]');
    setSavedCenters(saved);
  }, []);

  const fetchCenters = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPanchakarmaCenters();
      const centersData = response.data?.data || response.data || [];
      setCenters(Array.isArray(centersData) ? centersData : []);
    } catch (err) {
      setError('Failed to load centers');
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

  const toggleSave = (centerId) => {
    let updated;
    if (savedCenters.includes(centerId)) {
      updated = savedCenters.filter(id => id !== centerId);
    } else {
      updated = [...savedCenters, centerId];
    }
    setSavedCenters(updated);
    localStorage.setItem('savedAyurvedaCenters', JSON.stringify(updated));
  };

  const filteredCenters = useMemo(() => {
    let result = [...centers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        c.name?.toLowerCase().includes(q) ||
        c.address?.city?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.packages?.some(p => 
          p.name?.toLowerCase().includes(q) || 
          p.therapies?.some(t => t.toLowerCase().includes(q))
        )
      );
    }

    if (selectedCity) {
      result = result.filter(c => c.address?.city === selectedCity);
    }

    if (minPrice > 0) {
      result = result.filter(c => getMinPrice(c) >= minPrice);
    }
    if (maxPrice < 50000) {
      result = result.filter(c => getMinPrice(c) <= maxPrice);
    }

    if (minDuration) {
      result = result.filter(c => 
        c.packages?.some(p => p.duration >= parseInt(minDuration))
      );
    }

    if (selectedTherapy) {
      result = result.filter(c => 
        c.packages?.some(p => p.therapies?.includes(selectedTherapy))
      );
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
      case 'reviews':
        result.sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0));
        break;
      default:
        break;
    }

    const total = Math.ceil(result.length / PER_PAGE);
    setTotalPages(Math.max(total, 1));
    
    const start = (page - 1) * PER_PAGE;
    return result.slice(start, start + PER_PAGE);
  }, [centers, searchQuery, selectedCity, minPrice, maxPrice, minDuration, selectedTherapy, sortBy, page]);

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
    setMinPrice(0);
    setMaxPrice(50000);
    setMinDuration('');
    setSelectedTherapy('');
    setSortBy('rating');
    setPage(1);
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
    const fullStars = Math.floor(rating || 0);
    const hasHalf = (rating || 0) - fullStars >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO HEADER */}
      <div className="bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <button 
            onClick={() => navigate('/ayurveda')} 
            className="flex items-center gap-2 text-green-100 hover:text-white mb-6 transition-colors text-sm"
          >
            <FaArrowLeft /> Back to Ayurveda
          </button>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Panchakarma & Wellness Centers</h1>
            <p className="text-green-100 text-lg">Authentic Ayurvedic detox programs at AYUSH-verified centers across India</p>
          </div>
          
          {/* TRUST BADGES */}
          <div className="flex justify-center gap-8 mb-8 flex-wrap">
            <div className="text-center">
              <p className="text-3xl font-bold">50+</p>
              <p className="text-green-100 text-sm">Verified Centers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-green-100 text-sm">Therapy Programs</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">4.8★</p>
              <p className="text-green-100 text-sm">Average Rating</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">10k+</p>
              <p className="text-green-100 text-sm">Happy Patients</p>
            </div>
          </div>
          
          {/* SEARCH BAR */}
          <div className="bg-white rounded-xl p-4 shadow-xl max-w-4xl mx-auto">
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[250px] relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Search by center, city, therapy, or package..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 text-gray-800"
                />
              </div>
              
              <select 
                value={selectedCity} 
                onChange={e => setSelectedCity(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-200 text-gray-700"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-200 text-gray-700"
              >
                <option value="rating">⭐ Highest Rated</option>
                <option value="price_low">💰 Price: Low to High</option>
                <option value="price_high">💰 Price: High to Low</option>
                <option value="packages">📦 Most Packages</option>
                <option value="reviews">📝 Most Reviewed</option>
              </select>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors border ${
                  showFilters 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-green-400'
                }`}
              >
                <FaFilter /> Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* THERAPY QUICK FILTERS */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 whitespace-nowrap">
            <button
              onClick={() => setSelectedTherapy('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTherapy === '' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Therapies
            </button>
            {therapies.map(therapy => (
              <button
                key={therapy}
                onClick={() => setSelectedTherapy(selectedTherapy === therapy ? '' : therapy)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTherapy === therapy ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {therapy}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FILTERS PANEL */}
      {showFilters && (
        <div className="bg-white shadow-md border-b">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Advanced Filters</h3>
              <button 
                onClick={clearFilters}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range: ₹{minPrice} - ₹{maxPrice}</label>
                <input 
                  type="range" 
                  min="0" 
                  max="50000" 
                  step="1000"
                  value={minPrice} 
                  onChange={e => setMinPrice(parseInt(e.target.value))}
                  className="w-full"
                />
                <input 
                  type="range" 
                  min="0" 
                  max="50000" 
                  step="1000"
                  value={maxPrice} 
                  onChange={e => setMaxPrice(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Duration (Days)</label>
                <select 
                  value={minDuration} 
                  onChange={e => setMinDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBuilding className="text-4xl text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Centers Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
            <button 
              onClick={clearFilters}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors mr-3"
            >
              Clear Filters
            </button>
            <button 
              onClick={() => navigate('/ayurveda/center/register')}
              className="border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
            >
              Register Your Center
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-6">
              Showing {filteredCenters.length} of {centers.length} centers
            </p>
            
            <div className="space-y-6">
              {filteredCenters.map(center => {
                const minPackagePrice = getMinPrice(center);
                const totalPackages = getTotalPackages(center);
                const isCompared = compareList.find(c => c._id === center._id);
                const isSaved = savedCenters.includes(center._id);
                const isExpanded = expandedCenter === center._id;
                
                return (
                  <div key={center._id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden">
                    {/* CENTER HEADER */}
                    <div className="p-6">
                      <div className="flex gap-5 flex-wrap">
                        {/* Center Icon */}
                        <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center text-white text-3xl flex-shrink-0 shadow-md relative">
                          <FaBuilding />
                          {center.verificationStatus === 'approved' && (
                            <span className="absolute -bottom-2 -right-2 bg-white rounded-full p-1">
                              <FaShieldAlt className="text-green-600 text-sm" />
                            </span>
                          )}
                        </div>
                        
                        {/* Center Info */}
                        <div className="flex-1 min-w-[250px]">
                          <div className="flex items-start justify-between flex-wrap gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-bold text-gray-800 hover:text-green-600 cursor-pointer" onClick={() => handleViewCenter(center)}>
                                  {center.name}
                                </h2>
                                {center.verificationStatus === 'approved' && (
                                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                    AYUSH Verified
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-500 flex items-center gap-1 mt-1">
                                <FaMapMarkerAlt /> {center.address?.city}, {center.address?.state}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {/* Save Button */}
                              <button
                                onClick={() => toggleSave(center._id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isSaved ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                                }`}
                              >
                                {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                              </button>
                              
                              {/* Compare Button */}
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
                          </div>
                          
                          {/* Rating & Stats */}
                          <div className="flex items-center gap-5 mt-3 flex-wrap text-sm">
                            <span className="flex items-center gap-1.5">
                              <div className="flex">{renderStars(center.rating)}</div>
                              <span className="font-semibold text-gray-700">{center.rating || 'New'}</span>
                              <span className="text-gray-400">({center.totalReviews || 0} reviews)</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-600">
                              <FaBed /> {center.bedCount || 'N/A'} Beds
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-600">
                              <FaUserMd /> {center.doctorCount || 0} Doctors
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-600">
                              <FaCalendarCheck /> {center.stats?.totalBookings || 0} Bookings
                            </span>
                          </div>
                        </div>
                        
                        {/* Price & CTA */}
                        <div className="text-right flex flex-col items-end justify-center min-w-[160px]">
                          {totalPackages > 0 ? (
                            <>
                              <p className="text-xs text-gray-500">Starting from</p>
                              <p className="text-2xl font-bold text-green-600">₹{minPackagePrice.toLocaleString()}</p>
                              <p className="text-xs text-gray-400 mb-2">{totalPackages} packages</p>
                              <button
                                onClick={() => handleBookPackage(center, center.packages.find(p => p.isActive !== false))}
                                className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                              >
                                Book Now
                              </button>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-gray-400 mb-2">No packages yet</p>
                              <button
                                onClick={() => handleViewCenter(center)}
                                className="border-2 border-green-600 text-green-600 px-5 py-2.5 rounded-lg font-medium hover:bg-green-50 transition-colors text-sm"
                              >
                                View Details
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* DESCRIPTION */}
                    {center.description && (
                      <div className="px-6 pb-4">
                        <p className="text-sm text-gray-500 line-clamp-2">{center.description}</p>
                      </div>
                    )}
                    
                    {/* PACKAGES PREVIEW */}
                    {totalPackages > 0 && (
                      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-800">Available Packages</h4>
                          <button
                            onClick={() => setExpandedCenter(isExpanded ? null : center._id)}
                            className="text-green-600 text-sm font-medium flex items-center gap-1"
                          >
                            {isExpanded ? 'Show Less' : 'View All'} 
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {center.packages
                            .filter(p => p.isActive !== false)
                            .slice(0, isExpanded ? undefined : 3)
                            .map(pkg => (
                              <div 
                                key={pkg._id} 
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-400 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => handleBookPackage(center, pkg)}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-semibold text-gray-800">{pkg.name}</h5>
                                  {pkg.discountPrice && pkg.discountPrice < pkg.price && (
                                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                      {Math.round((1 - pkg.discountPrice / pkg.price) * 100)}% OFF
                                    </span>
                                  )}
                                </div>
                                
                                <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                                  <FaClock /> {pkg.duration} Days
                                  {pkg.maxCapacity && (
                                    <span className="ml-2 text-xs text-gray-400">
                                      ({pkg.maxCapacity - (pkg.currentBookings || 0)} slots left)
                                    </span>
                                  )}
                                </p>
                                
                                {pkg.therapies && pkg.therapies.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {pkg.therapies.slice(0, 2).map((therapy, i) => (
                                      <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
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
                                  <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                    Book <FaChevronRight className="text-xs" />
                                  </span>
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
            
            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      page === i + 1 ? 'bg-green-600 text-white' : 'border'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
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