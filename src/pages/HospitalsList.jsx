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

  const [filters, setFilters] = useState({
    scheme: '',
    insurance: '',
    accreditation: '',
    specialty: '',
    minRating: 0,
    opdFeeMin: '',
    opdFeeMax: '',
    emergency: false,
    cashless: false,
    bedsAvailable: false
  });

  const schemeDisplayNames = {
    'ayushman': 'Ayushman Bharat (PM-JAY)',
    'cghs': 'CGHS',
    'esi': 'ESI',
    'echs': 'ECHS',
    'state_scheme': 'State Scheme',
    'senior_citizen': 'Senior Citizen',
    'disability': 'Disability Scheme'
  };

  const schemeOptions = [
    { value: '', label: 'All Schemes' },
    { value: 'ayushman', label: 'Ayushman Bharat (PM-JAY)' },
    { value: 'cghs', label: 'CGHS' },
    { value: 'esi', label: 'ESI' },
    { value: 'echs', label: 'ECHS' },
    { value: 'state_scheme', label: 'State Health Scheme' },
    { value: 'senior_citizen', label: 'Senior Citizen Scheme' }
  ];

  const insuranceOptions = [
    { value: '', label: 'All Insurance Providers' },
    { value: 'Star Health', label: 'Star Health Insurance' },
    { value: 'ICICI Lombard', label: 'ICICI Lombard' },
    { value: 'HDFC Ergo', label: 'HDFC Ergo' },
    { value: 'Bajaj Allianz', label: 'Bajaj Allianz' },
    { value: 'Max Bupa', label: 'Max Bupa' },
    { value: 'Religare Care', label: 'Religare Care' },
    { value: 'New India Assurance', label: 'New India Assurance' },
    { value: 'Oriental Insurance', label: 'Oriental Insurance' },
    { value: 'United India Insurance', label: 'United India Insurance' },
    { value: 'National Insurance', label: 'National Insurance' },
    { value: 'Aditya Birla Health', label: 'Aditya Birla Health' },
    { value: 'ManipalCigna', label: 'ManipalCigna' },
    { value: 'Digit Health', label: 'Digit Health' },
    { value: 'SBI General', label: 'SBI General Insurance' },
    { value: 'Tata AIG', label: 'Tata AIG' }
  ];

  const accreditationOptions = [
    { value: '', label: 'All Accreditations' },
    { value: 'NABH', label: 'NABH Accredited' },
    { value: 'JCI', label: 'JCI Accredited' },
    { value: 'NABL', label: 'NABL Certified Lab' },
    { value: 'ISO', label: 'ISO Certified' }
  ];

  const specialtyOptions = [
    { value: '', label: 'All Specialties' },
    { value: 'Cardiology', label: '🫀 Cardiology' },
    { value: 'Neurology', label: '🧠 Neurology' },
    { value: 'Orthopedics', label: '🦴 Orthopedics' },
    { value: 'Oncology', label: '🎗️ Oncology' },
    { value: 'Nephrology', label: '🫘 Nephrology' },
    { value: 'Gastroenterology', label: '🔬 Gastroenterology' },
    { value: 'Pediatrics', label: '👶 Pediatrics' },
    { value: 'Gynecology', label: '🤰 Gynecology' },
    { value: 'Dermatology', label: '🧴 Dermatology' },
    { value: 'ENT', label: '👂 ENT' },
    { value: 'Ophthalmology', label: '👁️ Ophthalmology' },
    { value: 'Psychiatry', label: '🧠 Psychiatry' },
    { value: 'Dentistry', label: '🦷 Dentistry' }
  ];

  const getSpecializationFromQuery = (query) => {
    const q = query.toLowerCase();
    if (q.includes('heart') || q.includes('cardiac') || q.includes('chest')) return 'cardiologist';
    if (q.includes('brain') || q.includes('stroke') || q.includes('neuro') || q.includes('migraine')) return 'neurologist';
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
      if (userLocation) { params.append('lat', userLocation.lat); params.append('lng', userLocation.lng); }
      if (filters.scheme) params.append('scheme', filters.scheme);
      if (filters.insurance) params.append('insurance', filters.insurance);
      if (filters.accreditation) params.append('accreditation', filters.accreditation);
      if (filters.specialty) params.append('specialty', filters.specialty);
      if (filters.cashless) params.append('cashless', 'true');
      if (filters.emergency) params.append('emergency', 'true');
      if (filters.bedsAvailable) params.append('beds_available', 'true');
      if (filters.minRating > 0) params.append('min_rating', filters.minRating);
      if (filters.opdFeeMin) params.append('opd_fee_min', filters.opdFeeMin);
      if (filters.opdFeeMax) params.append('opd_fee_max', filters.opdFeeMax);
      const res = await api.get(`/hospitals/search?${params.toString()}`);
      setHospitals(res.data.data || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); setSearchQuery(inputQuery); setCurrentPage(1); };

  const clearFilters = () => {
    setFilters({ scheme: '', insurance: '', accreditation: '', specialty: '', minRating: 0, opdFeeMin: '', opdFeeMax: '', emergency: false, cashless: false, bedsAvailable: false });
  };

  const activeFilterCount = [filters.scheme, filters.insurance, filters.accreditation, filters.specialty, filters.emergency, filters.cashless, filters.bedsAvailable, filters.minRating > 0, filters.opdFeeMin, filters.opdFeeMax].filter(v => v && v !== false && v !== 0 && v !== '').length;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
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
    window.location.href = doctor ? `/book-opd/${hospital._id}?doctor=${encodeURIComponent(doctor.name)}` : `/book-opd/${hospital._id}`;
  };
  const handleBookAdmission = (hospital) => window.location.href = `/book-admission/${hospital._id}`;
  const handleViewDetails = (hospital) => window.location.href = `/hospital-info/${hospital._id}`;
  const handleAmbulance = () => window.location.href = '/ambulance';

  const paginatedHospitals = hospitals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(hospitals.length / itemsPerPage);

  const selectStyle = { width: '100%', padding: '0.55rem 0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.85rem', backgroundColor: 'white', outline: 'none', cursor: 'pointer' };

  const toggleStyle = (active) => ({ padding: '0.55rem 1rem', backgroundColor: active ? '#dbeafe' : '#f3f4f6', border: active ? '2px solid #3b82f6' : '2px solid #e5e7eb', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: active ? 'bold' : 'normal', color: active ? '#1e40af' : '#374151', transition: 'all 0.2s', whiteSpace: 'nowrap' });

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading hospitals...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '0.25rem' }}>🏥 Find Hospitals</h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>Search, compare, and book appointments at India's top hospitals</p>

        {/* SEARCH + FILTER BAR */}
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
          
          {/* Row 1: Search Input */}
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input type="text" placeholder="🔍 Search disease, symptom, specialty, or hospital name..." value={inputQuery} onChange={(e) => setInputQuery(e.target.value)} style={{ flex: 3, minWidth: '250px', padding: '0.75rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none' }} />
              <input type="text" placeholder="📍 City" value={city} onChange={(e) => setCity(e.target.value)} style={{ flex: 1, minWidth: '120px', padding: '0.75rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none' }} />
              <button type="submit" style={{ padding: '0.75rem 2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>🔍 Search</button>
            </div>
          </form>

          {/* Row 2: Sort Options */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontWeight: '600', color: '#374151', fontSize: '0.85rem', marginRight: '0.25rem' }}>Sort:</span>
            {[{ value: 'distance', label: '📍 Nearest' },{ value: 'fee', label: '💰 Lowest Fee' },{ value: 'rating', label: '⭐ Highest Rated' },{ value: 'beds', label: '🛏️ Most Beds' }].map(opt => (
              <button key={opt.value} onClick={() => setSortBy(opt.value)} style={{ padding: '0.45rem 0.9rem', backgroundColor: sortBy === opt.value ? '#10b981' : '#f3f4f6', color: sortBy === opt.value ? 'white' : '#374151', border: sortBy === opt.value ? 'none' : '1px solid #e5e7eb', borderRadius: '2rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: sortBy === opt.value ? 'bold' : 'normal', transition: 'all 0.2s' }}>{opt.label}</button>
            ))}
            <div style={{ flex: 1 }}></div>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} style={{ padding: '0.45rem 1rem', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>✕ Clear All ({activeFilterCount})</button>
            )}
          </div>

          {/* Row 3: Quick Toggles */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <button onClick={() => setFilters({...filters, emergency: !filters.emergency})} style={toggleStyle(filters.emergency)}>{filters.emergency ? '🚨' : ''} 24/7 Emergency</button>
            <button onClick={() => setFilters({...filters, bedsAvailable: !filters.bedsAvailable})} style={toggleStyle(filters.bedsAvailable)}>{filters.bedsAvailable ? '🛏️' : ''} Beds Available</button>
            <button onClick={() => setFilters({...filters, cashless: !filters.cashless})} style={toggleStyle(filters.cashless)}>{filters.cashless ? '💳' : ''} Cashless Only</button>
          </div>

          {/* Row 4: Dropdown Filters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>💠 Government Scheme</label>
              <select value={filters.scheme} onChange={(e) => setFilters({...filters, scheme: e.target.value})} style={selectStyle}>
                {schemeOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>🛡️ Insurance Provider</label>
              <select value={filters.insurance} onChange={(e) => setFilters({...filters, insurance: e.target.value})} style={selectStyle}>
                {insuranceOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>🏅 Accreditation</label>
              <select value={filters.accreditation} onChange={(e) => setFilters({...filters, accreditation: e.target.value})} style={selectStyle}>
                {accreditationOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>🏥 Specialty</label>
              <select value={filters.specialty} onChange={(e) => setFilters({...filters, specialty: e.target.value})} style={selectStyle}>
                {specialtyOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>⭐ Min Rating: {filters.minRating > 0 ? filters.minRating + ' ★' : 'Any'}</label>
              <input type="range" min="0" max="5" step="0.5" value={filters.minRating} onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#f59e0b' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#9ca3af', padding: '0 2px' }}><span>Any</span><span>3★</span><span>5★</span></div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>💰 OPD Fee Range (₹)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="number" placeholder="Min" value={filters.opdFeeMin} onChange={(e) => setFilters({...filters, opdFeeMin: e.target.value})} style={{ flex: 1, padding: '0.5rem', border: '2px solid #e5e7eb', borderRadius: '0.4rem', fontSize: '0.85rem', outline: 'none', minWidth: '60px' }} />
                <span style={{ color: '#9ca3af', fontSize: '0.85rem', flexShrink: 0 }}>—</span>
                <input type="number" placeholder="Max" value={filters.opdFeeMax} onChange={(e) => setFilters({...filters, opdFeeMax: e.target.value})} style={{ flex: 1, padding: '0.5rem', border: '2px solid #e5e7eb', borderRadius: '0.4rem', fontSize: '0.85rem', outline: 'none', minWidth: '60px' }} />
              </div>
            </div>

          </div>

        </div>

        {/* Results Count */}
        <p style={{ color: '#6b7280', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
          {hospitals.length > 0 ? <><strong>{hospitals.length}</strong> hospital{hospitals.length !== 1 ? 's' : ''} found{searchQuery && ` for "${searchQuery}"`}</> : 'No hospitals found. Try adjusting filters.'}
        </p>

        {/* HOSPITAL CARDS */}
        {paginatedHospitals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
            <h3>No hospitals match your criteria</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Try changing your search terms or filters</p>
            <button onClick={clearFilters} style={{ padding: '0.6rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>Clear All Filters</button>
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
            
            if (singleMatching && !selectedDoctor[h._id]) setSelectedDoctor(prev => ({ ...prev, [h._id]: matchingDoctors[0].name }));
            
            const selectedDoc = matchingDoctors.find(d => d.name === selectedDoctor[h._id]) || (singleMatching ? matchingDoctors[0] : null);
            const opdFee = selectedDoc ? selectedDoc.consultation_fee : (h.pricing?.consultation || 0);
            const discountAmount = Math.round(opdFee * 0.1);

            return (
              <div key={h._id} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0 }}>{h.name}</h2>
                    <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      {h.accreditations?.map(acc => (<span key={acc} style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 'bold' }}>{acc}</span>))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>⭐ {h.ratings?.average || 'N/A'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>({h.ratings?.count || 0} reviews)</div>
                    {h.cashless_available && (<span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 'bold', marginTop: '0.25rem', display: 'inline-block' }}>💳 Cashless</span>)}
                  </div>
                </div>

                <p style={{ color: '#6b7280', margin: '0.25rem 0', fontSize: '0.85rem' }}>📍 {h.address?.city}, {h.address?.state} {distance && <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>• {distance} km</span>}</p>

                {schemesList.length > 0 && (
                  <div style={{ margin: '0.5rem 0' }}>
                    <span onClick={() => toggleSchemes(h._id)} style={{ cursor: 'pointer', fontSize: '0.8rem', color: '#8b5cf6', fontWeight: '600' }}>💠 {schemesList.length} Scheme{schemesList.length > 1 ? 's' : ''} {showAllSchemes ? '▲' : '▼'}</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginTop: '0.2rem' }}>
                      {(showAllSchemes ? schemesList : schemesList.slice(0, 3)).map((scheme, idx) => (<span key={idx} style={{ backgroundColor: '#f3e8ff', color: '#5b21b6', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem' }}>{schemeDisplayNames[scheme] || scheme}</span>))}
                      {!showAllSchemes && schemesList.length > 3 && (<span onClick={() => toggleSchemes(h._id)} style={{ color: '#8b5cf6', fontSize: '0.65rem', cursor: 'pointer', padding: '0.15rem 0.5rem' }}>+{schemesList.length - 3} more</span>)}
                    </div>
                  </div>
                )}

                {searchQuery && hasMultipleMatching && (
                  <div style={{ margin: '0.75rem 0', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <strong style={{ fontSize: '0.85rem' }}>👨‍⚕️ Select Doctor ({matchingDoctors.length}):</strong>
                    {matchingDoctors.map(doc => {
                      const availBadge = getAvailabilityBadge(doc.availability?.status);
                      return (
                        <label key={doc.name} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem', backgroundColor: selectedDoctor[h._id] === doc.name ? '#d1fae5' : 'white', borderRadius: '0.5rem', marginTop: '0.4rem', cursor: 'pointer', border: selectedDoctor[h._id] === doc.name ? '2px solid #10b981' : '1px solid #e5e7eb' }}>
                          <input type="radio" name={`doc_${h._id}`} checked={selectedDoctor[h._id] === doc.name} onChange={() => setSelectedDoctor(prev => ({ ...prev, [h._id]: doc.name }))} />
                          <div style={{ flex: 1 }}><strong>{doc.name}</strong> - {doc.specialization}<br /><span style={{ fontSize: '0.7rem', color: '#6b7280' }}>📜 {doc.qualification} {doc.experience && `• 📅 ${doc.experience}`}</span><br /><span style={{ fontSize: '0.7rem' }}>⭐ {doc.rating} ({doc.reviewCount}) {doc.languages?.length > 0 && `• 🗣️ ${doc.languages.join(', ')}`}</span></div>
                          <div style={{ textAlign: 'right' }}><span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1rem' }}>₹{doc.consultation_fee}</span>{doc.availability?.slots_available > 0 && (<div style={{ fontSize: '0.65rem', color: availBadge.color, fontWeight: 'bold' }}>{availBadge.text}</div>)}</div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {searchQuery && singleMatching && (
                  <div style={{ margin: '0.5rem 0', padding: '0.6rem', backgroundColor: '#e0e7ff', borderRadius: '0.5rem', fontSize: '0.85rem' }}><strong>👨‍⚕️ {matchingDoctors[0].name}</strong> - {matchingDoctors[0].specialization}<br /><span style={{ fontSize: '0.75rem' }}>📜 {matchingDoctors[0].qualification} • ⭐ {matchingDoctors[0].rating} • 💰 ₹{matchingDoctors[0].consultation_fee}</span></div>
                )}

                <div style={{ display: 'flex', gap: '1.5rem', margin: '0.5rem 0', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                  <span>🧪 Lab: {h.lab_tests_available ? '✅ Yes' : '🔗 Partner'}</span>
                  <span onClick={() => toggleInsurance(h._id)} style={{ cursor: 'pointer' }}>🛡️ Insurance: <span style={{ color: '#3b82f6' }}>{insuranceList.length} {showAllInsurance ? '▲' : '▼'}</span></span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', margin: '0.6rem 0', backgroundColor: '#f9fafb', padding: '0.6rem', borderRadius: '0.5rem' }}>
                  <div><div style={{ fontSize: '0.7rem', color: '#6b7280' }}>📋 OPD Fee</div><div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#10b981' }}>₹{opdFee}</div></div>
                  <div><div style={{ fontSize: '0.7rem', color: '#6b7280' }}>🏥 Admission</div><div style={{ fontSize: '0.75rem' }}>ICU: ₹{h.pricing?.icu_bed_per_day?.toLocaleString() || 'N/A'}</div><div style={{ fontSize: '0.75rem' }}>Gen: ₹{h.pricing?.general_bed_per_day?.toLocaleString() || 'N/A'}</div></div>
                  <div><div style={{ fontSize: '0.7rem', color: '#6b7280' }}>🛏️ Beds Available</div><div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{h.beds?.available || 0}</div><span style={{ backgroundColor: bedBadge.bg, color: bedBadge.color, padding: '0.1rem 0.4rem', borderRadius: '9999px', fontSize: '0.6rem' }}>{bedBadge.text}</span></div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={() => handleBookOPD(h, selectedDoc)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.55rem 1.1rem', borderRadius: '0.4rem', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>📋 Book OPD</button>
                  <button onClick={() => handleBookAdmission(h)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.55rem 1.1rem', borderRadius: '0.4rem', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>🏥 Book Admission</button>
                  <button onClick={() => handleViewDetails(h)} style={{ backgroundColor: '#fff', color: '#374151', padding: '0.55rem 1.1rem', borderRadius: '0.4rem', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.85rem' }}>Details →</button>
                  <button onClick={handleAmbulance} style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.55rem 0.8rem', borderRadius: '0.4rem', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>🚑</button>
                </div>

                {h.has24x7ER && (<div style={{ marginTop: '0.5rem' }}><span style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 'bold' }}>🚨 24/7 Emergency</span></div>)}
              </div>
            );
          })
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
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