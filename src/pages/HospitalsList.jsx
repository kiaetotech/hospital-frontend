import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const HospitalsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [city, setCity] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [sortBy, setSortBy] = useState('distance');
  const [selectedDoctor, setSelectedDoctor] = useState({});
  const [expandedInsurance, setExpandedInsurance] = useState({});
  const [expandedSchemes, setExpandedSchemes] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 🆕 Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    scheme: '',
    insurance: '',
    cashless: false,
    emergency: false,
    bedsAvailable: false,
    minRating: 0,
    accreditation: '',
    specialty: '',
    opdFeeMin: '',
    opdFeeMax: ''
  });

  const schemeDisplayNames = {
    'ayushman': 'Ayushman Bharat (PM-JAY)',
    'cghs': 'CGHS',
    'esi': 'ESI',
    'echs': 'ECHS',
    'state_scheme': 'State Scheme',
    'senior_citizen': 'Senior Citizen',
    'disability': 'Disability Scheme',
    'pmjay': 'PM-JAY',
    'rsby': 'RSBY'
  };

  const schemeOptions = [
    { value: '', label: 'All Schemes' },
    { value: 'ayushman', label: 'Ayushman Bharat' },
    { value: 'cghs', label: 'CGHS' },
    { value: 'esi', label: 'ESI' },
    { value: 'echs', label: 'ECHS' },
    { value: 'state_scheme', label: 'State Scheme' }
  ];

  const insuranceOptions = [
    { value: '', label: 'All Insurance' },
    { value: 'Star Health', label: 'Star Health' },
    { value: 'ICICI Lombard', label: 'ICICI Lombard' },
    { value: 'HDFC Ergo', label: 'HDFC Ergo' },
    { value: 'Bajaj Allianz', label: 'Bajaj Allianz' },
    { value: 'Max Bupa', label: 'Max Bupa' },
    { value: 'Religare Care', label: 'Religare Care' }
  ];

  const accreditationOptions = [
    { value: '', label: 'All' },
    { value: 'NABH', label: 'NABH' },
    { value: 'JCI', label: 'JCI' },
    { value: 'NABL', label: 'NABL' },
    { value: 'ISO', label: 'ISO' }
  ];

  const specialtyOptions = [
    { value: '', label: 'All Specialties' },
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Neurology', label: 'Neurology' },
    { value: 'Orthopedics', label: 'Orthopedics' },
    { value: 'Oncology', label: 'Oncology' },
    { value: 'Nephrology', label: 'Nephrology' },
    { value: 'Gastroenterology', label: 'Gastroenterology' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Gynecology', label: 'Gynecology' }
  ];

  const getSpecializationFromQuery = (query) => {
    const q = query.toLowerCase();
    if (q.includes('heart') || q.includes('cardiac') || q.includes('chest')) return 'cardiologist';
    if (q.includes('brain') || q.includes('stroke') || q.includes('neuro')) return 'neurologist';
    if (q.includes('bone') || q.includes('joint') || q.includes('ortho') || q.includes('knee')) return 'orthopedic';
    if (q.includes('kidney') || q.includes('stone') || q.includes('renal')) return 'nephrologist';
    if (q.includes('cancer') || q.includes('tumor') || q.includes('oncology')) return 'oncologist';
    return null;
  };

  const getMatchingDoctors = (hospital) => {
    if (!searchQuery) return [];
    const targetSpec = getSpecializationFromQuery(searchQuery);
    if (!targetSpec) return hospital.doctors || [];
    const doctors = hospital.doctors || [];
    const matching = doctors.filter(doc => 
      doc.specialization.toLowerCase().includes(targetSpec)
    );
    return matching.length > 0 ? matching : doctors;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [searchQuery, city, userLocation, sortBy, filters]);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (city) params.append('city', city);
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
      }
      // Add filter params
      if (filters.scheme) params.append('scheme', filters.scheme);
      if (filters.insurance) params.append('insurance', filters.insurance);
      if (filters.cashless) params.append('cashless', 'true');
      if (filters.emergency) params.append('emergency', 'true');
      if (filters.bedsAvailable) params.append('beds_available', 'true');
      if (filters.minRating > 0) params.append('min_rating', filters.minRating);
      if (filters.accreditation) params.append('accreditation', filters.accreditation);
      if (filters.specialty) params.append('specialty', filters.specialty);
      if (filters.opdFeeMin) params.append('opd_fee_min', filters.opdFeeMin);
      if (filters.opdFeeMax) params.append('opd_fee_max', filters.opdFeeMax);

      const res = await api.get(`/hospitals/search?${params.toString()}`);
      let hospitalsData = res.data.data || [];
      setHospitals(hospitalsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(inputQuery);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      scheme: '', insurance: '', cashless: false, emergency: false,
      bedsAvailable: false, minRating: 0, accreditation: '', specialty: '',
      opdFeeMin: '', opdFeeMax: ''
    });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const toggleInsurance = (id) => setExpandedInsurance(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSchemes = (id) => setExpandedSchemes(prev => ({ ...prev, [id]: !prev[id] }));

  const getBedUpdateBadge = (lastUpdated) => {
    if (!lastUpdated) return { text: 'Unknown', color: '#9ca3af', bg: '#f3f4f6' };
    const hours = (new Date() - new Date(lastUpdated)) / (1000 * 60 * 60);
    if (hours < 1) return { text: '🟢 Live', color: '#10b981', bg: '#d1fae5' };
    if (hours < 4) return { text: '🟡 Recent', color: '#f59e0b', bg: '#fef3c7' };
    if (hours < 12) return { text: '🟠 Today', color: '#f97316', bg: '#ffedd5' };
    return { text: '🔴 Old', color: '#ef4444', bg: '#fee2e2' };
  };

  const getAvailabilityBadge = (status) => {
    switch(status) {
      case 'available': return { text: '🟢 Available', color: '#10b981', bg: '#d1fae5' };
      case 'limited': return { text: '🟡 Few Slots', color: '#f59e0b', bg: '#fef3c7' };
      case 'full': return { text: '🔴 Full', color: '#ef4444', bg: '#fee2e2' };
      default: return { text: 'Check', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const handleBookOPD = (hospital, doctor = null) => {
    const url = doctor 
      ? `/book-opd/${hospital._id}?doctor=${encodeURIComponent(doctor.name)}`
      : `/book-opd/${hospital._id}`;
    window.location.href = url;
  };

  const handleBookAdmission = (hospital) => window.location.href = `/book-admission/${hospital._id}`;
  const handleViewDetails = (hospital) => window.location.href = `/hospital-info/${hospital._id}`;
  const handleAmbulance = () => window.location.href = '/ambulance';

  const paginatedHospitals = hospitals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(hospitals.length / itemsPerPage);

  const activeFilterCount = Object.values(filters).filter(v => v && v !== false && v !== 0 && v !== '').length;

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading hospitals...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '0.5rem' }}>🏥 Find Hospitals</h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Search, compare, and book - all in one place</p>

        {/* 🔍 SEARCH BAR */}
        <form onSubmit={handleSearch} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <input type="text" placeholder="🔍 Disease, symptom, specialty, or hospital name..." value={inputQuery} onChange={(e) => setInputQuery(e.target.value)} style={{ flex: 3, padding: '0.75rem 1rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none' }} />
            <input type="text" placeholder="📍 City (optional)" value={city} onChange={(e) => setCity(e.target.value)} style={{ flex: 1, padding: '0.75rem 1rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none' }} />
            <button type="submit" style={{ padding: '0.75rem 2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
              🔍 Search
            </button>
          </div>

          {/* Quick Filter Toggles */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Sort by:</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="radio" name="sort" checked={sortBy === 'distance'} onChange={() => setSortBy('distance')} /> Distance
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="radio" name="sort" checked={sortBy === 'fee'} onChange={() => setSortBy('fee')} /> Fee ↓
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="radio" name="sort" checked={sortBy === 'rating'} onChange={() => setSortBy('rating')} /> Rating ↑
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="radio" name="sort" checked={sortBy === 'beds'} onChange={() => setSortBy('beds')} /> Beds Available
            </label>

            <div style={{ flex: 1 }}></div>

            <button type="button" onClick={() => setShowFilters(!showFilters)} style={{ padding: '0.5rem 1rem', backgroundColor: showFilters ? '#3b82f6' : '#f3f4f6', color: showFilters ? 'white' : '#374151', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
              ⚙️ Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            {activeFilterCount > 0 && (
              <button type="button" onClick={clearFilters} style={{ padding: '0.5rem 1rem', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                ✕ Clear
              </button>
            )}
          </div>

          {/* 🆕 ADVANCED FILTERS PANEL */}
          {showFilters && (
            <div style={{ marginTop: '1rem', padding: '1.25rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem', border: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              
              {/* Quick Toggles */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 1rem', backgroundColor: filters.emergency ? '#fee2e2' : '#f3f4f6', borderRadius: '0.5rem', border: filters.emergency ? '2px solid #ef4444' : '1px solid #e5e7eb' }}>
                  <input type="checkbox" checked={filters.emergency} onChange={(e) => setFilters({...filters, emergency: e.target.checked})} /> 🚨 24/7 Emergency
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 1rem', backgroundColor: filters.bedsAvailable ? '#d1fae5' : '#f3f4f6', borderRadius: '0.5rem', border: filters.bedsAvailable ? '2px solid #10b981' : '1px solid #e5e7eb' }}>
                  <input type="checkbox" checked={filters.bedsAvailable} onChange={(e) => setFilters({...filters, bedsAvailable: e.target.checked})} /> 🛏️ Beds Available
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 1rem', backgroundColor: filters.cashless ? '#dbeafe' : '#f3f4f6', borderRadius: '0.5rem', border: filters.cashless ? '2px solid #3b82f6' : '1px solid #e5e7eb' }}>
                  <input type="checkbox" checked={filters.cashless} onChange={(e) => setFilters({...filters, cashless: e.target.checked})} /> 💳 Cashless Only
                </label>
              </div>

              {/* Scheme Filter */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.8rem' }}>💠 Government Scheme</label>
                <select value={filters.scheme} onChange={(e) => setFilters({...filters, scheme: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.85rem' }}>
                  {schemeOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Insurance Filter */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.8rem' }}>🛡️ Insurance</label>
                <select value={filters.insurance} onChange={(e) => setFilters({...filters, insurance: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.85rem' }}>
                  {insuranceOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Accreditation Filter */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.8rem' }}>🏅 Accreditation</label>
                <select value={filters.accreditation} onChange={(e) => setFilters({...filters, accreditation: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.85rem' }}>
                  {accreditationOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Specialty Filter */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.8rem' }}>🏥 Specialty</label>
                <select value={filters.specialty} onChange={(e) => setFilters({...filters, specialty: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.85rem' }}>
                  {specialtyOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.8rem' }}>⭐ Min Rating: {filters.minRating || 'Any'}</label>
                <input type="range" min="0" max="5" step="0.5" value={filters.minRating} onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})} style={{ width: '100%' }} />
              </div>

              {/* OPD Fee Range */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.8rem' }}>💰 OPD Fee Range (₹)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" placeholder="Min" value={filters.opdFeeMin} onChange={(e) => setFilters({...filters, opdFeeMin: e.target.value})} style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.85rem' }} />
                  <input type="number" placeholder="Max" value={filters.opdFeeMax} onChange={(e) => setFilters({...filters, opdFeeMax: e.target.value})} style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.85rem' }} />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Results count */}
        {hospitals.length > 0 && (
          <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Found <strong>{hospitals.length}</strong> hospital{hospitals.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        )}

        {/* HOSPITAL CARDS */}
        {paginatedHospitals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.75rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No hospitals found</h3>
            <p style={{ color: '#6b7280' }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          paginatedHospitals.map(h => {
            const distance = userLocation && h.location ? calculateDistance(userLocation.lat, userLocation.lng, h.location.lat, h.location.lng) : null;
            const insuranceList = h.insurance_accepted || [];
            const schemesList = h.schemes_accepted || [];
            const showAllInsurance = expandedInsurance[h._id];
            const showAllSchemes = expandedSchemes[h._id];
            const matchingDoctors = getMatchingDoctors(h);
            const hasMultipleMatching = matchingDoctors.length > 1;
            const singleMatching = matchingDoctors.length === 1;
            const bedBadge = getBedUpdateBadge(h.beds?.last_updated);
            
            if (singleMatching && !selectedDoctor[h._id]) {
              setSelectedDoctor(prev => ({ ...prev, [h._id]: matchingDoctors[0].name }));
            }
            
            const selectedDoc = matchingDoctors.find(d => d.name === selectedDoctor[h._id]) || (singleMatching ? matchingDoctors[0] : null);
            const opdFee = selectedDoc ? selectedDoc.consultation_fee : (h.pricing?.consultation || 0);
            const discountAmount = Math.round(opdFee * 0.1);

            return (
              <div key={h._id} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>{h.name}</h2>
                    <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      {h.accreditations?.map(acc => (
                        <span key={acc} style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 'bold' }}>{acc}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>⭐ {h.ratings?.average || 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>({h.ratings?.count || 0} reviews)</div>
                    {h.cashless_available && (
                      <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 'bold', marginTop: '0.25rem', display: 'inline-block' }}>💳 Cashless</span>
                    )}
                  </div>
                </div>

                <p style={{ color: '#6b7280', margin: '0.25rem 0', fontSize: '0.9rem' }}>
                  📍 {h.address?.city}, {h.address?.state} {distance && <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>• {distance} km away</span>}
                </p>

                {/* Schemes */}
                {schemesList.length > 0 && (
                  <div style={{ margin: '0.5rem 0' }}>
                    <div onClick={() => toggleSchemes(h._id)} style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                      <strong>💠 Schemes:</strong> <span style={{ color: '#8b5cf6' }}>{showAllSchemes ? '▲' : '▼'} {schemesList.length} accepted</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                      {(showAllSchemes ? schemesList : schemesList.slice(0, 3)).map((scheme, idx) => (
                        <span key={idx} style={{ backgroundColor: '#f3e8ff', color: '#5b21b6', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>
                          {schemeDisplayNames[scheme] || scheme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctors */}
                {searchQuery && hasMultipleMatching && (
                  <div style={{ margin: '0.75rem 0', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>👨‍⚕️ Select Doctor ({matchingDoctors.length} available):</strong>
                    {matchingDoctors.map(doc => {
                      const availBadge = getAvailabilityBadge(doc.availability?.status);
                      return (
                        <label key={doc.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', backgroundColor: selectedDoctor[h._id] === doc.name ? '#d1fae5' : 'white', borderRadius: '0.5rem', marginTop: '0.5rem', cursor: 'pointer', border: selectedDoctor[h._id] === doc.name ? '2px solid #10b981' : '1px solid #e5e7eb' }}>
                          <input type="radio" name={`doc_${h._id}`} checked={selectedDoctor[h._id] === doc.name} onChange={() => setSelectedDoctor(prev => ({ ...prev, [h._id]: doc.name }))} />
                          <div style={{ flex: 1 }}>
                            <strong>{doc.name}</strong> - {doc.specialization}<br />
                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>📜 {doc.qualification} {doc.experience && `• 📅 ${doc.experience}`}</span><br />
                            <span style={{ fontSize: '0.75rem' }}>⭐ {doc.rating} ({doc.reviewCount} reviews) {doc.languages?.length > 0 && `• 🗣️ ${doc.languages.join(', ')}`}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.1rem' }}>₹{doc.consultation_fee}</span>
                            {doc.availability?.slots_available > 0 && (
                              <div style={{ fontSize: '0.7rem', color: availBadge.color, fontWeight: 'bold' }}>{availBadge.text} ({doc.availability.slots_available} slots)</div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {searchQuery && singleMatching && (
                  <div style={{ margin: '0.5rem 0', padding: '0.75rem', backgroundColor: '#e0e7ff', borderRadius: '0.5rem' }}>
                    <strong>👨‍⚕️ Doctor:</strong> {matchingDoctors[0].name} - {matchingDoctors[0].specialization}<br />
                    <span style={{ fontSize: '0.8rem' }}>📜 {matchingDoctors[0].qualification} {matchingDoctors[0].experience && `• 📅 ${matchingDoctors[0].experience}`} • ⭐ {matchingDoctors[0].rating} | Fee: ₹{matchingDoctors[0].consultation_fee}</span>
                  </div>
                )}

                {searchQuery && matchingDoctors.length === 0 && (h.doctors || []).length > 0 && (
                  <div style={{ margin: '0.5rem 0', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <strong style={{ fontSize: '0.85rem' }}>👨‍⚕️ Available Doctors:</strong>
                    {(h.doctors || []).slice(0, 3).map(doc => (
                      <div key={doc.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.375rem', marginTop: '0.5rem' }}>
                        <div>
                          <strong>{doc.name}</strong> - {doc.specialization}<br />
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>📜 {doc.qualification} | ⭐ {doc.rating} | 💰 ₹{doc.consultation_fee}</span>
                        </div>
                        <button onClick={() => handleBookOPD(h, doc)} style={{ padding: '0.4rem 0.75rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Select</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Lab & Insurance */}
                <div style={{ display: 'flex', gap: '1.5rem', margin: '0.5rem 0', fontSize: '0.85rem' }}>
                  <div>🧪 <strong>Lab:</strong> {h.lab_tests_available ? '✅ Available' : '🔗 Linked'}</div>
                  <div onClick={() => toggleInsurance(h._id)} style={{ cursor: 'pointer' }}>
                    <strong>🛡️ Insurance:</strong> <span style={{ color: '#3b82f6' }}>{showAllInsurance ? '▲' : '▼'} +{insuranceList.length}</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                      {(showAllInsurance ? insuranceList : insuranceList.slice(0, 3)).map((ins, idx) => (
                        <span key={idx} style={{ backgroundColor: '#e0e7ff', padding: '0.15rem 0.4rem', borderRadius: '9999px', fontSize: '0.65rem' }}>{ins}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing & Beds */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', margin: '0.75rem 0', backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>📋 OPD</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>₹{opdFee}</div>
                    {discountAmount > 0 && <div style={{ fontSize: '0.65rem', color: '#059669' }}>Save ₹{discountAmount} online</div>}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>🏥 Admission/day</div>
                    <div style={{ fontSize: '0.8rem' }}>ICU: ₹{h.pricing?.icu_bed_per_day?.toLocaleString() || 'N/A'}</div>
                    <div style={{ fontSize: '0.8rem' }}>General: ₹{h.pricing?.general_bed_per_day?.toLocaleString() || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>🛏️ Beds</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{h.beds?.available || 0}</div>
                    <span style={{ backgroundColor: bedBadge.bg, color: bedBadge.color, padding: '0.1rem 0.4rem', borderRadius: '9999px', fontSize: '0.6rem' }}>{bedBadge.text}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={() => handleBookOPD(h, selectedDoc)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    📋 Book OPD
                  </button>
                  <button onClick={() => handleBookAdmission(h)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    🏥 Book Admission
                  </button>
                  <button onClick={() => handleViewDetails(h)} style={{ backgroundColor: '#fff', color: '#374151', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.9rem' }}>
                    View Details →
                  </button>
                  <button onClick={handleAmbulance} style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.6rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                    🚑
                  </button>
                </div>

                {/* Emergency Badge */}
                {h.has24x7ER && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>🚨 24/7 Emergency</span>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '0.5rem 1.5rem', backgroundColor: currentPage === 1 ? '#e5e7eb' : '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>← Previous</button>
            <span style={{ padding: '0.5rem', fontWeight: 'bold' }}>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '0.5rem 1.5rem', backgroundColor: currentPage === totalPages ? '#e5e7eb' : '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalsList;