import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPanchakarmaCenters } from '../../services/ayurvedaApi';
import {
  FaStar, FaMapMarkerAlt, FaBed, FaBuilding, FaSearch,
  FaFilter, FaArrowLeft, FaShieldAlt, FaUserMd,
  FaClock, FaTimes, FaChevronRight,
  FaBookmark, FaRegBookmark, FaCalendarCheck,
  FaChevronDown, FaChevronUp, FaStarHalfAlt,
  FaSpa, FaLeaf, FaUtensils, FaPlane, FaTrain,
  FaPhone, FaWhatsapp
} from 'react-icons/fa';

const PER_PAGE = 6;

const PanchakarmaCenters = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [maxPrice, setMaxPrice] = useState(null);
  const [minDuration, setMinDuration] = useState('');
  const [selectedTherapy, setSelectedTherapy] = useState('');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  // UI
  const [compareList, setCompareList] = useState([]);
  const [savedCenters, setSavedCenters] = useState([]);
  const [expandedCenter, setExpandedCenter] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCenters();
    try {
      const saved = JSON.parse(localStorage.getItem('savedAyurvedaCenters') || '[]');
      setSavedCenters(saved);
    } catch {
      setSavedCenters([]);
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCity, maxPrice, minDuration, selectedTherapy, onlyVerified, sortBy]);

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

  // ============================================
  // DYNAMIC FILTER OPTIONS (from real data)
  // ============================================
  const allCities = useMemo(() => {
    const cities = new Set();
    centers.forEach(c => {
      if (c.address?.city) cities.add(c.address.city);
    });
    return [...cities].sort();
  }, [centers]);

  const allTherapies = useMemo(() => {
    const therapies = new Set();
    centers.forEach(c =>
      (c.packages || []).forEach(p =>
        (p.therapies || []).forEach(t => t && therapies.add(t))
      )
    );
    return [...therapies].sort();
  }, [centers]);

  const allDurations = useMemo(() => {
    const durations = new Set();
    centers.forEach(c =>
      (c.packages || []).forEach(p => p.duration && durations.add(p.duration))
    );
    return [...durations].sort((a, b) => a - b);
  }, [centers]);

  const priceRange = useMemo(() => {
    const prices = centers.flatMap(c =>
      (c.packages || [])
        .filter(p => p.isActive !== false)
        .map(p => p.discountPrice || p.price)
        .filter(Boolean)
    );
    if (!prices.length) return { min: 0, max: 50000 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [centers]);

  // Set initial max price when centers load
  useEffect(() => {
    if (priceRange.max > 0 && maxPrice === null) {
      setMaxPrice(priceRange.max);
    }
  }, [priceRange.max, maxPrice]);

  // ============================================
  // HELPERS
  // ============================================
  const getActivePackages = (center) =>
    (center.packages || []).filter(p => p.isActive !== false);

  const getMinPrice = (center) => {
    const prices = getActivePackages(center)
      .map(p => p.discountPrice || p.price)
      .filter(Boolean);
    return prices.length ? Math.min(...prices) : 0;
  };

  const getStartingDuration = (center) => {
    const durations = getActivePackages(center).map(p => p.duration).filter(Boolean);
    return durations.length ? Math.min(...durations) : 0;
  };

  const isVerified = (center) => center.verificationStatus === 'approved';
  const hasRealRating = (center) => (center.totalReviews || 0) > 0;

  const getInclusionIcons = (pkg) => {
    const icons = [];
    if (pkg.includesConsultation) icons.push({ icon: FaUserMd, label: 'Consultation' });
    if (pkg.includesAccommodation) icons.push({ icon: FaBed, label: 'Stay' });
    if (pkg.includesMeals) icons.push({ icon: FaUtensils, label: 'Meals' });
    if (pkg.includesMedicines) icons.push({ icon: FaLeaf, label: 'Medicines' });
    if (pkg.includesYoga) icons.push({ icon: FaSpa, label: 'Yoga' });
    if (pkg.includesAirportTransfer) icons.push({ icon: FaPlane, label: 'Transfer' });
    if (pkg.includesFollowUp) icons.push({ icon: FaCalendarCheck, label: 'Follow-up' });
    return icons.slice(0, 4);
  };

  const toggleSave = (centerId) => {
    const updated = savedCenters.includes(centerId)
      ? savedCenters.filter(id => id !== centerId)
      : [...savedCenters, centerId];
    setSavedCenters(updated);
    localStorage.setItem('savedAyurvedaCenters', JSON.stringify(updated));
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
    setMaxPrice(priceRange.max);
    setMinDuration('');
    setSelectedTherapy('');
    setOnlyVerified(false);
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

  const handleWhatsApp = (e, center) => {
    e.stopPropagation();
    const phone = center.contact?.whatsapp || center.phone;
    if (!phone) return;
    const clean = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Hi, I'm interested in Panchakarma programs at ${center.name}. Please share details.`);
    window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
  };

  const handleCall = (e, center) => {
    e.stopPropagation();
    const phone = center.contact?.primaryPhone || center.phone;
    if (phone) window.location.href = `tel:${phone}`;
  };

  // ============================================
  // FILTERING & SORTING
  // ============================================
  const filteredCenters = useMemo(() => {
    let result = [...centers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.address?.city?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.tagline?.toLowerCase().includes(q) ||
        getActivePackages(c).some(p =>
          p.name?.toLowerCase().includes(q) ||
          (p.therapies || []).some(t => t.toLowerCase().includes(q))
        )
      );
    }

    if (selectedCity) result = result.filter(c => c.address?.city === selectedCity);
    if (onlyVerified) result = result.filter(c => isVerified(c));

    if (maxPrice !== null && maxPrice < priceRange.max) {
      result = result.filter(c => getMinPrice(c) <= maxPrice && getMinPrice(c) > 0);
    } else {
      result = result.filter(c => getMinPrice(c) > 0);
    }

    if (minDuration) {
      result = result.filter(c =>
        getActivePackages(c).some(p => p.duration >= parseInt(minDuration))
      );
    }

    if (selectedTherapy) {
      result = result.filter(c =>
        getActivePackages(c).some(p => (p.therapies || []).includes(selectedTherapy))
      );
    }

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => {
          if (!hasRealRating(a) && hasRealRating(b)) return 1;
          if (hasRealRating(a) && !hasRealRating(b)) return -1;
          return (b.rating || 0) - (a.rating || 0);
        });
        break;
      case 'price_low':
        result.sort((a, b) => getMinPrice(a) - getMinPrice(b));
        break;
      case 'price_high':
        result.sort((a, b) => getMinPrice(b) - getMinPrice(a));
        break;
      case 'packages':
        result.sort((a, b) => getActivePackages(b).length - getActivePackages(a).length);
        break;
      case 'reviews':
        result.sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0));
        break;
      case 'established':
        result.sort((a, b) => (a.established || 9999) - (b.established || 9999));
        break;
      default:
        break;
    }

    return result;
  }, [centers, searchQuery, selectedCity, maxPrice, minDuration, selectedTherapy, onlyVerified, sortBy, priceRange.max]);

  const totalPages = Math.max(1, Math.ceil(filteredCenters.length / PER_PAGE));
  const pagedCenters = filteredCenters.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const hasActiveFilters =
    searchQuery || selectedCity || (maxPrice !== null && maxPrice < priceRange.max) ||
    minDuration || selectedTherapy || onlyVerified;

  const renderStars = (rating = 0) =>
    [1, 2, 3, 4, 5].map(i => {
      if (i <= Math.floor(rating)) return <FaStar key={i} className="text-yellow-400" />;
      if (i - rating < 1 && i - rating > 0) return <FaStarHalfAlt key={i} className="text-yellow-400" />;
      return <FaStar key={i} className="text-gray-300" />;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-green-800 to-green-600 py-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="h-10 bg-white/20 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-white/20 rounded w-1/3"></div>
          </div>
        </div>
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
      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <button
            onClick={() => navigate('/ayurveda')}
            className="flex items-center gap-2 text-green-100 hover:text-white mb-6 text-sm"
          >
            <FaArrowLeft /> Back to Ayurveda
          </button>

          <h1 className="text-4xl font-bold mb-2">Panchakarma & Wellness Centers</h1>
          <p className="text-green-100 text-lg mb-8">
            Verified Ayurvedic centers offering authentic detox & wellness programs
          </p>

          {/* SEARCH BAR */}
          <div className="bg-white rounded-xl p-4 shadow-xl">
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[250px] relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Search center, city, therapy, or package..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 text-gray-800"
                />
              </div>

              {allCities.length > 0 && (
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="px-4 py-3 rounded-lg border border-gray-200 text-gray-700 bg-white"
                >
                  <option value="">All Cities</option>
                  {allCities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              )}

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-200 text-gray-700 bg-white"
              >
                <option value="rating">⭐ Highest Rated</option>
                <option value="price_low">💰 Price: Low to High</option>
                <option value="price_high">💰 Price: High to Low</option>
                <option value="packages">📦 Most Packages</option>
                <option value="reviews">📝 Most Reviewed</option>
                <option value="established">🏛️ Oldest First</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-lg font-medium flex items-center gap-2 border transition-colors ${
                  showFilters
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-green-400'
                }`}
              >
                <FaFilter /> Filters
                {hasActiveFilters && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">!</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* THERAPY QUICK FILTERS */}
      {allTherapies.length > 0 && (
        <div className="bg-white border-b shadow-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto">
            <div className="flex gap-2 whitespace-nowrap">
              <button
                onClick={() => setSelectedTherapy('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedTherapy ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Therapies
              </button>
              {allTherapies.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTherapy(selectedTherapy === t ? '' : t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTherapy === t ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
              {priceRange.max > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price: ₹{(maxPrice || priceRange.max).toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    step={Math.max(1000, Math.floor((priceRange.max - priceRange.min) / 50))}
                    value={maxPrice || priceRange.max}
                    onChange={e => setMaxPrice(parseInt(e.target.value))}
                    className="w-full accent-green-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>₹{priceRange.min.toLocaleString()}</span>
                    <span>₹{priceRange.max.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {allDurations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Duration</label>
                  <select
                    value={minDuration}
                    onChange={e => setMinDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Any Duration</option>
                    {allDurations.map(d => <option key={d} value={d}>{d}+ Days</option>)}
                  </select>
                </div>
              )}

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    checked={onlyVerified}
                    onChange={e => setOnlyVerified(e.target.checked)}
                    className="w-4 h-4 accent-green-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Only AYUSH-Verified Centers</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CENTERS LIST */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchCenters} className="text-red-700 font-medium underline">Retry</button>
          </div>
        )}

        {filteredCenters.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBuilding className="text-4xl text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Centers Found</h3>
            <p className="text-gray-500 mb-6">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Centers are being onboarded'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-6">
              Showing {pagedCenters.length} of {filteredCenters.length} center{filteredCenters.length > 1 ? 's' : ''}
            </p>

            <div className="space-y-6">
              {pagedCenters.map(center => {
                const activePackages = getActivePackages(center);
                const minPackagePrice = getMinPrice(center);
                const startingDuration = getStartingDuration(center);
                const isCompared = compareList.some(c => c._id === center._id);
                const isSaved = savedCenters.includes(center._id);
                const isExpanded = expandedCenter === center._id;
                const verified = isVerified(center);
                const hasRating = hasRealRating(center);

                return (
                  <div key={center._id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden">

                    {/* PHOTO / HERO */}
                    <div className="relative h-48 bg-gradient-to-br from-green-600 to-green-500 overflow-hidden">
                      {center.coverPhoto ? (
                        <img src={center.coverPhoto} alt={center.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaBuilding className="text-white text-7xl opacity-30" />
                        </div>
                      )}

                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          onClick={() => toggleSave(center._id)}
                          className={`p-2.5 rounded-full backdrop-blur bg-white/90 shadow hover:bg-white transition ${
                            isSaved ? 'text-red-500' : 'text-gray-500'
                          }`}
                        >
                          {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                        </button>
                      </div>

                      {verified && (
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                          <FaShieldAlt className="text-green-600 text-sm" />
                          <span className="text-xs font-semibold text-green-700">AYUSH Verified</span>
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="p-6">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div className="flex-1 min-w-[250px]">
                          <h2
                            className="text-xl font-bold text-gray-800 hover:text-green-600 cursor-pointer"
                            onClick={() => handleViewCenter(center)}
                          >
                            {center.name}
                          </h2>

                          {center.tagline && (
                            <p className="text-sm text-gray-600 mt-1 italic">{center.tagline}</p>
                          )}

                          <p className="text-gray-500 flex items-center gap-1 mt-2 text-sm">
                            <FaMapMarkerAlt /> {center.address?.city}, {center.address?.state}
                            {center.established && (
                              <span className="ml-3 text-gray-400">· Since {center.established}</span>
                            )}
                          </p>

                          <div className="flex items-center gap-5 mt-3 flex-wrap text-sm">
                            <span className="flex items-center gap-1.5">
                              {hasRating ? (
                                <>
                                  <div className="flex">{renderStars(center.rating)}</div>
                                  <span className="font-semibold text-gray-700">{center.rating.toFixed(1)}</span>
                                  <span className="text-gray-400">({center.totalReviews})</span>
                                </>
                              ) : (
                                <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded">New Center</span>
                              )}
                            </span>

                            {center.bedCount > 0 && (
                              <span className="flex items-center gap-1.5 text-gray-600">
                                <FaBed /> {center.bedCount} Beds
                              </span>
                            )}
                            {center.doctorCount > 0 && (
                              <span className="flex items-center gap-1.5 text-gray-600">
                                <FaUserMd /> {center.doctorCount} Doctors
                              </span>
                            )}
                            {center.panchakarmaRooms > 0 && (
                              <span className="flex items-center gap-1.5 text-gray-600">
                                <FaSpa /> {center.panchakarmaRooms} Therapy Rooms
                              </span>
                            )}
                          </div>

                          {(center.distanceFromAirport || center.distanceFromRailway) && (
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              {center.distanceFromAirport && (
                                <span className="flex items-center gap-1">
                                  <FaPlane /> {center.distanceFromAirport} km from airport
                                </span>
                              )}
                              {center.distanceFromRailway && (
                                <span className="flex items-center gap-1">
                                  <FaTrain /> {center.distanceFromRailway} km from railway
                                </span>
                              )}
                            </div>
                          )}

                          {center.facilities?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {center.facilities.slice(0, 5).map((f, i) => (
                                <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                                  {f}
                                </span>
                              ))}
                              {center.facilities.length > 5 && (
                                <span className="text-xs text-gray-400 px-2 py-1">
                                  +{center.facilities.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* PRICE + CTA */}
                        <div className="text-right flex flex-col items-end justify-between min-w-[170px]">
                          <div>
                            {activePackages.length > 0 ? (
                              <>
                                <p className="text-xs text-gray-500">Starting from</p>
                                <p className="text-2xl font-bold text-green-600">
                                  ₹{minPackagePrice.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {startingDuration} day{startingDuration > 1 ? 's' : ''} · {activePackages.length} package{activePackages.length > 1 ? 's' : ''}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-gray-400 mb-2">No packages yet</p>
                            )}
                          </div>

                          <div className="mt-4 flex flex-col gap-2 w-full">
                            {activePackages.length > 0 && (
                              <button
                                onClick={() => handleBookPackage(center, activePackages[0])}
                                className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 text-sm"
                              >
                                Book Now
                              </button>
                            )}
                            <button
                              onClick={() => handleViewCenter(center)}
                              className="border-2 border-green-600 text-green-600 px-5 py-2.5 rounded-lg font-medium hover:bg-green-50 text-sm"
                            >
                              View Details
                            </button>

                            <div className="flex gap-2">
                              {center.phone && (
                                <button
                                  onClick={(e) => handleCall(e, center)}
                                  className="flex-1 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-1"
                                >
                                  <FaPhone className="text-xs" /> Call
                                </button>
                              )}
                              {(center.contact?.whatsapp || center.phone) && (
                                <button
                                  onClick={(e) => handleWhatsApp(e, center)}
                                  className="flex-1 border border-green-200 text-green-700 px-3 py-2 rounded-lg hover:bg-green-50 text-sm flex items-center justify-center gap-1"
                                >
                                  <FaWhatsapp /> WhatsApp
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action row */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => toggleCompare(center)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                            isCompared
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-600'
                          }`}
                        >
                          {isCompared ? '✓ Added to Compare' : '+ Add to Compare'}
                        </button>

                        {activePackages.length > 3 && (
                          <button
                            onClick={() => setExpandedCenter(isExpanded ? null : center._id)}
                            className="text-green-600 text-sm font-medium flex items-center gap-1"
                          >
                            {isExpanded ? 'Show Less' : `View All ${activePackages.length} Packages`}
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* PACKAGES GRID */}
                    {activePackages.length > 0 && (
                      <div className="px-6 py-5 border-t border-gray-100 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {activePackages
                            .slice(0, isExpanded ? undefined : 3)
                            .map(pkg => {
                              const hasDiscount = pkg.discountPrice && pkg.discountPrice < pkg.price;
                              const slotsLeft = pkg.maxCapacity
                                ? pkg.maxCapacity - (pkg.currentBookings || 0)
                                : null;
                              const inclusionIcons = getInclusionIcons(pkg);
                              const isSoldOut = slotsLeft !== null && slotsLeft <= 0;

                              return (
                                <div
                                  key={pkg._id}
                                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-400 hover:shadow-md transition-all"
                                >
                                  <div className="flex justify-between items-start mb-2 gap-2">
                                    <h5 className="font-semibold text-gray-800 text-sm">{pkg.name}</h5>
                                    {hasDiscount && (
                                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                                        {Math.round((1 - pkg.discountPrice / pkg.price) * 100)}% OFF
                                      </span>
                                    )}
                                  </div>

                                  {pkg.shortDescription && (
                                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{pkg.shortDescription}</p>
                                  )}

                                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                    <FaClock /> {pkg.duration} Days
                                    {slotsLeft !== null && slotsLeft > 0 && slotsLeft <= 5 && (
                                      <span className="text-orange-600 font-medium ml-auto">
                                        Only {slotsLeft} left
                                      </span>
                                    )}
                                    {isSoldOut && (
                                      <span className="text-red-600 font-medium ml-auto">Sold Out</span>
                                    )}
                                  </div>

                                  {inclusionIcons.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                      {inclusionIcons.map((inc, i) => (
                                        <span key={i} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                                          <inc.icon className="text-xs" /> {inc.label}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {pkg.therapies?.length > 0 && !inclusionIcons.length && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                      {pkg.therapies.slice(0, 3).map((t, i) => (
                                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  <div className="flex justify-between items-end mt-3 pt-3 border-t border-gray-100">
                                    <div>
                                      {hasDiscount ? (
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
                                      disabled={isSoldOut}
                                      className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                      Book <FaChevronRight className="text-xs" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600 text-sm">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* COMPARE BAR */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white rounded-xl shadow-2xl z-50 px-6 py-4 flex items-center gap-6">
          <span className="font-medium">
            {compareList.length} center{compareList.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => navigate('/ayurveda/compare-centers', { state: { centers: compareList } })}
            className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700"
          >
            Compare Now
          </button>
          <button
            onClick={() => setCompareList([])}
            className="text-gray-400 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default PanchakarmaCenters;