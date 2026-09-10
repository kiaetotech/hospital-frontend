import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPanchakarmaCenters } from '../../services/ayurvedaApi';
import {
  FaStar, FaMapMarkerAlt, FaBed, FaBuilding, FaSearch, FaFilter,
  FaArrowLeft, FaShieldAlt, FaUserMd, FaClock, FaCheckCircle, FaTimes,
  FaChevronRight, FaRupeeSign, FaBox, FaHeart, FaShareAlt, FaMapMarkedAlt,
  FaCalendarAlt, FaLeaf, FaInfoCircle, FaSlidersH, FaTimesCircle, FaUtensils, FaHome, FaClipboardCheck, FaPhoneAlt, FaQuestionCircle
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
  const [sortBy, setSortBy] = useState('recommended');
  const [showFilters, setShowFilters] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyWithPackages, setOnlyWithPackages] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [showCompareBar, setShowCompareBar] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const cities = ['Mumbai', 'Delhi', 'Pune', 'Nagpur', 'Kochi', 'Rishikesh', 'Bengaluru', 'Hyderabad', 'Chennai', 'Jaipur'];
  const durations = [3, 5, 7, 10, 14, 21, 28];

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
      setError(err.response?.data?.message || 'Failed to load wellness centers. Please try again.');
      setCenters([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivePackages = (center) =>
    Array.isArray(center?.packages) ? center.packages.filter(p => p.isActive !== false) : [];

  const getMinPrice = (center) => {
    const prices = getActivePackages(center)
      .map(p => Number(p.discountPrice || p.price))
      .filter(Number.isFinite);
    return prices.length ? Math.min(...prices) : 0;
  };

  const getMaxPrice = (center) => {
    const prices = getActivePackages(center)
      .map(p => Number(p.discountPrice || p.price))
      .filter(Number.isFinite);
    return prices.length ? Math.max(...prices) : 0;
  };

  const getImage = (center) => {
    const candidates = [
      center?.image,
      center?.imageUrl,
      center?.coverImage,
      ...(Array.isArray(center?.images) ? center.images : []),
      ...(Array.isArray(center?.gallery) ? center.gallery : [])
    ];
    return candidates.find(v => typeof v === 'string' && v.trim());
  };

  const getTotalPackages = (center) => getActivePackages(center).length;

  const filteredCenters = useMemo(() => {
    let result = [...centers];
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.address?.city?.toLowerCase().includes(q) ||
        c.address?.state?.toLowerCase().includes(q) ||
        c.type?.toLowerCase().includes(q) ||
        c.description?.toLowerCase?.().includes(q) ||
        getActivePackages(c).some(p =>
          p.name?.toLowerCase().includes(q) ||
          (Array.isArray(p.therapies) && p.therapies.some(t => String(t).toLowerCase().includes(q)))
        )
      );
    }

    if (selectedCity) {
      result = result.filter(c => c.address?.city?.toLowerCase() === selectedCity.toLowerCase());
    }
    if (minPrice) result = result.filter(c => getMaxPrice(c) >= Number(minPrice));
    if (maxPrice) result = result.filter(c => getMinPrice(c) <= Number(maxPrice));
    if (minDuration) {
      result = result.filter(c => getActivePackages(c).some(p => Number(p.duration) >= Number(minDuration)));
    }
    if (onlyVerified) result = result.filter(c => c.verificationStatus === 'approved');
    if (onlyWithPackages) result = result.filter(c => getTotalPackages(c) > 0);

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        break;
      case 'price_low':
        result.sort((a, b) => getMinPrice(a) - getMinPrice(b));
        break;
      case 'price_high':
        result.sort((a, b) => getMinPrice(b) - getMinPrice(a));
        break;
      case 'reviews':
        result.sort((a, b) => Number(b.totalReviews || 0) - Number(a.totalReviews || 0));
        break;
      case 'packages':
        result.sort((a, b) => getTotalPackages(b) - getTotalPackages(a));
        break;
      default:
        result.sort((a, b) => {
          const av = a.verificationStatus === 'approved' ? 1 : 0;
          const bv = b.verificationStatus === 'approved' ? 1 : 0;
          return bv - av || Number(b.rating || 0) - Number(a.rating || 0);
        });
    }
    return result;
  }, [centers, searchQuery, selectedCity, minPrice, maxPrice, minDuration, sortBy, onlyVerified, onlyWithPackages]);

  const activeFilterCount = [selectedCity, minPrice, maxPrice, minDuration, onlyVerified, onlyWithPackages]
    .filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setMinPrice('');
    setMaxPrice('');
    setMinDuration('');
    setSortBy('recommended');
    setOnlyVerified(false);
    setOnlyWithPackages(false);
  };

  const toggleWishlist = (centerId) => {
    setWishlist(prev => prev.includes(centerId) ? prev.filter(id => id !== centerId) : [...prev, centerId]);
  };

  const toggleCompare = (center) => {
    if (compareList.some(c => c._id === center._id)) {
      const updated = compareList.filter(c => c._id !== center._id);
      setCompareList(updated);
      setShowCompareBar(updated.length > 0);
    } else if (compareList.length < 3) {
      const updated = [...compareList, center];
      setCompareList(updated);
      setShowCompareBar(true);
    } else {
      alert('You can compare up to 3 centers.');
    }
  };

  const shareCenter = async (center) => {
    const url = `${window.location.origin}/ayurveda/center/${center._id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: center.name, text: `Explore ${center.name} on HospitalHub`, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert('Center link copied.');
      }
    } catch (err) {
      // User cancelled native sharing; no action required.
    }
  };

  const openMap = (center) => {
    const query = [center.name, center.address?.city, center.address?.state].filter(Boolean).join(', ');
    if (query) window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  };

  const handleBookPackage = (center, pkg) => {
    navigate(`/ayurveda/center/${center._id}/book/${pkg._id}`, { state: { center, package: pkg } });
  };

  const handleViewCenter = (center) => {
    navigate(`/ayurveda/center/${center._id}`, { state: { center } });
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(Number(rating) || 0);
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar key={i} className={i < fullStars ? 'text-yellow-400' : 'text-gray-300'} />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">Finding verified Ayurveda & wellness centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Premium marketplace header */}
      <header className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <button onClick={() => navigate('/ayurveda')} className="flex items-center gap-2 text-green-100 hover:text-white mb-5 text-sm">
            <FaArrowLeft /> Back to Ayurveda
          </button>
          <div className="max-w-3xl">
            <p className="text-green-200 text-sm font-semibold uppercase tracking-wider">HospitalHub Ayurveda Marketplace</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">Find the right Panchakarma & wellness retreat</h1>
            <p className="text-green-100 mt-2">Compare centers, programmes, prices and verified information before you book.</p>
          </div>

          <div className="mt-6 bg-white rounded-xl p-2 shadow-xl text-gray-800">
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  aria-label="Search wellness centers"
                  placeholder="Search center, city, therapy or programme..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="px-4 py-3 rounded-lg bg-gray-50 border border-gray-200">
                <option value="">All cities</option>
                {cities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-3 rounded-lg bg-gray-50 border border-gray-200">
                <option value="recommended">Recommended</option>
                <option value="rating">Highest rated</option>
                <option value="price_low">Price: low to high</option>
                <option value="price_high">Price: high to low</option>
                <option value="reviews">Most reviewed</option>
                <option value="packages">Most programmes</option>
              </select>
              <button onClick={() => setShowFilters(v => !v)} className="px-5 py-3 rounded-lg bg-green-700 text-white font-semibold flex items-center justify-center gap-2">
                <FaSlidersH /> Filters {activeFilterCount > 0 && <span className="bg-white text-green-700 rounded-full px-2 text-xs">{activeFilterCount}</span>}
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-2">
            {['Panchakarma retreats', 'Doctor-led care', 'Accommodation', 'Ayurvedic meals', 'Yoga & meditation'].map((item) => (
              <span key={item} className="bg-white/10 border border-white/10 rounded-full px-3 py-2 text-xs md:text-sm text-center text-green-50">{item}</span>
            ))}
          </div>

          <div className="mt-5 bg-white/10 rounded-xl p-4 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="font-semibold">Choose with confidence</p>
                <p className="text-xs md:text-sm text-green-100 mt-1">Compare programmes, treatment details, stay information and provider data before booking.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-1"><FaClipboardCheck /> Programme details</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-1"><FaHome /> Stay options</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-1"><FaUtensils /> Meals & inclusions</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 text-sm">
            <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2"><FaShieldAlt /> Verified centers</div>
            <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2"><FaUserMd /> Doctor information</div>
            <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2"><FaBox /> Programme comparison</div>
            <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2"><FaCalendarAlt /> Direct booking flow</div>
          </div>
        </div>
      </header>

      {/* Advanced filters */}
      {showFilters && (
        <section className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-gray-800">Refine your search</h2>
                <p className="text-xs text-gray-500 mt-1">Use only filters that match your requirements.</p>
              </div>
              <button onClick={clearFilters} className="text-red-600 text-sm font-medium">Clear all</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <label className="text-sm text-gray-700">Minimum programme price
                <input type="number" min="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="₹ Any" className="mt-1 w-full border rounded-lg px-3 py-2" />
              </label>
              <label className="text-sm text-gray-700">Maximum programme price
                <input type="number" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="₹ Any" className="mt-1 w-full border rounded-lg px-3 py-2" />
              </label>
              <label className="text-sm text-gray-700">Minimum stay
                <select value={minDuration} onChange={e => setMinDuration(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2">
                  <option value="">Any duration</option>
                  {durations.map(d => <option key={d} value={d}>{d}+ days</option>)}
                </select>
              </label>
              <div className="space-y-2 pt-5">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyVerified} onChange={e => setOnlyVerified(e.target.checked)} /> Verified centers only</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyWithPackages} onChange={e => setOnlyWithPackages(e.target.checked)} /> Centers with bookable programmes</label>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs md:text-sm text-gray-600">
            <div className="flex items-center gap-2"><FaShieldAlt className="text-green-600" /> Provider verification</div>
            <div className="flex items-center gap-2"><FaUserMd className="text-green-600" /> Doctor information</div>
            <div className="flex items-center gap-2"><FaCalendarAlt className="text-green-600" /> Programme duration</div>
            <div className="flex items-center gap-2"><FaHome className="text-green-600" /> Accommodation data</div>
            <div className="flex items-center gap-2"><FaQuestionCircle className="text-green-600" /> Clear booking information</div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-7">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3">
            <FaTimesCircle className="mt-1" />
            <div className="flex-1"><p className="font-medium">Unable to load centers</p><p className="text-sm mt-1">{error}</p></div>
            <button onClick={fetchCenters} className="font-semibold underline">Retry</button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-green-700">HospitalHub care journey</p>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mt-1">Discover → compare → review programme → book</h2>
              <p className="text-sm text-gray-500 mt-1">Use the provider's published information for treatment, stay, inclusions and booking decisions. Medical suitability should be confirmed with a qualified practitioner.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="px-3 py-2 bg-gray-50 rounded-lg">1. Shortlist</span>
              <span className="px-3 py-2 bg-gray-50 rounded-lg">2. Compare</span>
              <span className="px-3 py-2 bg-gray-50 rounded-lg">3. Review details</span>
              <span className="px-3 py-2 bg-gray-50 rounded-lg">4. Book</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5">
          <div>
            <p className="text-sm text-gray-500">{filteredCenters.length} center{filteredCenters.length !== 1 ? 's' : ''} found</p>
            <h2 className="text-2xl font-bold text-gray-800">Explore wellness stays</h2>
          </div>
          {(searchQuery || activeFilterCount > 0) && (
            <button onClick={clearFilters} className="text-sm text-green-700 font-semibold">Reset search & filters</button>
          )}
        </div>

        {filteredCenters.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <FaSearch className="mx-auto text-4xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">No matching centers</h3>
            <p className="text-gray-500 mt-2 mb-6">Try a broader search, another city or fewer filters.</p>
            <button onClick={clearFilters} className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold">Clear filters</button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCenters.map(center => {
              const packages = getActivePackages(center);
              const minPackagePrice = getMinPrice(center);
              const isVerified = center.verificationStatus === 'approved';
              const isCompared = compareList.some(c => c._id === center._id);
              const isSaved = wishlist.includes(center._id);
              const image = getImage(center);
              const facilities = Array.isArray(center.facilities) ? center.facilities : [];

              return (
                <article key={center._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
                    <div className="relative min-h-[190px] bg-gradient-to-br from-green-700 to-emerald-500">
                      {image ? (
                        <img src={image} alt={center.name || 'Wellness center'} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-6xl"><FaBuilding /></div>
                      )}
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                        {isVerified && <span className="bg-white text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FaShieldAlt /> Verified</span>}
                      </div>
                      <button onClick={() => toggleWishlist(center._id)} aria-label={isSaved ? 'Remove from saved' : 'Save center'} className="absolute top-3 right-3 bg-white/95 p-2 rounded-full shadow text-red-500">
                        <FaHeart className={isSaved ? '' : 'opacity-40'} />
                      </button>
                    </div>

                    <div className="p-5 md:p-6">
                      <div className="flex flex-col xl:flex-row xl:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{center.name || 'Wellness Center'}</h3>
                              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><FaMapMarkerAlt /> {center.address?.city || 'Location not specified'}{center.address?.state ? `, ${center.address.state}` : ''}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button onClick={() => shareCenter(center)} className="p-2 border rounded-lg text-gray-500 hover:text-green-700" title="Share"><FaShareAlt /></button>
                              <button onClick={() => openMap(center)} className="p-2 border rounded-lg text-gray-500 hover:text-green-700" title="Open map"><FaMapMarkedAlt /></button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                            <span className="flex items-center gap-1"><span className="flex">{renderStars(center.rating)}</span><b>{center.rating || 'New'}</b> <span className="text-gray-400">({center.totalReviews || 0})</span></span>
                            <span className="text-gray-600 flex items-center gap-1"><FaBed /> {center.bedCount || 'N/A'} beds</span>
                            <span className="text-gray-600 flex items-center gap-1"><FaUserMd /> {center.doctorCount || 0} doctors</span>
                            <span className="text-gray-600 flex items-center gap-1"><FaBox /> {packages.length} programmes</span>
                          </div>

                          {center.description && <p className="text-sm text-gray-600 mt-3 line-clamp-2">{center.description}</p>}

                          {facilities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {facilities.slice(0, 5).map((facility, i) => <span key={i} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1"><FaCheckCircle /> {facility}</span>)}
                              {facilities.length > 5 && <span className="text-xs text-gray-500 px-2 py-1">+{facilities.length - 5} more</span>}
                            </div>
                          )}
                        </div>

                        <div className="xl:w-48 xl:border-l xl:pl-5 flex xl:block items-center justify-between gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Starting from</p>
                            <p className="text-2xl font-bold text-green-700">{minPackagePrice ? `₹${minPackagePrice.toLocaleString()}` : 'Contact center'}</p>
                            {minPackagePrice > 0 && <p className="text-xs text-gray-400">per package shown</p>}
                          </div>
                          <button onClick={() => handleViewCenter(center)} className="mt-3 px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg font-semibold text-sm">View center <FaChevronRight className="inline ml-1" /></button>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                          {isVerified && <span className="flex items-center gap-1"><FaShieldAlt className="text-green-600" /> Verification shown</span>}
                          {center.doctorCount > 0 && <span className="flex items-center gap-1"><FaUserMd className="text-green-600" /> Doctor information</span>}
                          <span className="flex items-center gap-1"><FaLeaf className="text-green-600" /> Ayurveda programmes</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => toggleCompare(center)} className={`px-3 py-2 rounded-lg text-sm font-semibold border ${isCompared ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-700'}`}>
                            {isCompared ? '✓ Compared' : '+ Compare'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {packages.length > 0 && (
                    <div className="border-t bg-gray-50 p-5 md:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div><h4 className="font-bold text-gray-900">Programmes & packages</h4><p className="text-xs text-gray-500 mt-1">Review duration, therapies and price before booking.</p></div>
                        <button onClick={() => handleViewCenter(center)} className="text-sm text-green-700 font-semibold">View all</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {packages.slice(0, 3).map(pkg => {
                          const discounted = Number(pkg.discountPrice) > 0 && Number(pkg.discountPrice) < Number(pkg.price);
                          const pkgPrice = Number(pkg.discountPrice || pkg.price || 0);
                          return (
                            <div key={pkg._id} className="bg-white border border-gray-200 rounded-xl p-4">
                              <div className="flex justify-between gap-3">
                                <h5 className="font-semibold text-gray-900">{pkg.name || 'Ayurveda Programme'}</h5>
                                {discounted && <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full whitespace-nowrap">Offer</span>}
                              </div>
                              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                                {pkg.duration && <span className="flex items-center gap-1"><FaClock /> {pkg.duration} days</span>}
                                {pkg.maxCapacity && <span className="flex items-center gap-1"><FaBed /> Up to {pkg.maxCapacity}</span>}
                              </div>
                              {Array.isArray(pkg.therapies) && pkg.therapies.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3">{pkg.therapies.slice(0, 3).map((t, i) => <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">{t}</span>)}{pkg.therapies.length > 3 && <span className="text-xs text-gray-400 px-1 py-1">+{pkg.therapies.length - 3}</span>}</div>}
                              <div className="flex items-end justify-between gap-3 mt-4 pt-3 border-t">
                                <div><p className="text-xs text-gray-400">Package price</p><p className="text-xl font-bold text-green-700">{pkgPrice ? `₹${pkgPrice.toLocaleString()}` : 'Contact'}</p>{discounted && <p className="text-xs line-through text-gray-400">₹{Number(pkg.price).toLocaleString()}</p>}</div>
                                <div className="flex gap-2">
                                  <button onClick={() => setSelectedPackage({ center, pkg })} className="px-3 py-2 border rounded-lg text-sm font-semibold">Details</button>
                                  <button onClick={() => handleBookPackage(center, pkg)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold">Book</button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Compare bar */}
      {showCompareBar && compareList.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl bg-gray-900 text-white rounded-2xl shadow-2xl p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div><b>{compareList.length} center{compareList.length > 1 ? 's' : ''} selected</b><p className="text-xs text-gray-300">Compare before making a booking decision.</p></div>
            <div className="flex gap-2">
              <button onClick={() => navigate('/ayurveda/compare-centers', { state: { centers: compareList } })} className="bg-green-600 px-5 py-2 rounded-lg font-semibold">Compare now</button>
              <button onClick={() => { setCompareList([]); setShowCompareBar(false); }} className="px-3 py-2 text-gray-300"><FaTimes /></button>
            </div>
          </div>
        </div>
      )}

      {/* Package details modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b flex items-start justify-between gap-4">
              <div><p className="text-xs text-green-700 font-semibold uppercase">Programme details</p><h2 className="text-xl font-bold mt-1">{selectedPackage.pkg.name}</h2><p className="text-sm text-gray-500 mt-1">{selectedPackage.center.name}</p></div>
              <button onClick={() => setSelectedPackage(null)} className="p-2 text-gray-500"><FaTimes /></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-gray-500">Duration</p><p className="font-bold">{selectedPackage.pkg.duration || '—'} days</p></div>
                <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-gray-500">Price</p><p className="font-bold text-green-700">₹{Number(selectedPackage.pkg.discountPrice || selectedPackage.pkg.price || 0).toLocaleString()}</p></div>
              </div>
              {selectedPackage.pkg.description && <div><h3 className="font-semibold mb-1">About this programme</h3><p className="text-sm text-gray-600 whitespace-pre-line">{selectedPackage.pkg.description}</p></div>}
              {Array.isArray(selectedPackage.pkg.therapies) && selectedPackage.pkg.therapies.length > 0 && <div><h3 className="font-semibold mb-2">Therapies</h3><div className="flex flex-wrap gap-2">{selectedPackage.pkg.therapies.map((t, i) => <span key={i} className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full">{t}</span>)}</div></div>}
              {Array.isArray(selectedPackage.pkg.inclusions) && selectedPackage.pkg.inclusions.length > 0 && <div><h3 className="font-semibold mb-2">Inclusions</h3><ul className="space-y-2">{selectedPackage.pkg.inclusions.map((item, i) => <li key={i} className="text-sm text-gray-600 flex gap-2"><FaCheckCircle className="text-green-600 mt-0.5" /> {item}</li>)}</ul></div>}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800 flex gap-2"><FaInfoCircle className="mt-0.5" /> Treatment suitability and final treatment schedules should be confirmed with the center's qualified practitioner before admission.</div>
              <button onClick={() => { const { center, pkg } = selectedPackage; setSelectedPackage(null); handleBookPackage(center, pkg); }} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold">Continue to booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanchakarmaCenters;
