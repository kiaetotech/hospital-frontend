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
  const [cityInput, setCityInput] = useState('');
  const [city, setCity] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [sortBy, setSortBy] = useState('distance');
  const [selectedDoctor, setSelectedDoctor] = useState({});
  const [expandedInsurance, setExpandedInsurance] = useState({});
  const [expandedSchemes, setExpandedSchemes] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [savedHospitals, setSavedHospitals] = useState({});
  const [hospitalStatuses, setHospitalStatuses] = useState({});
  const [waitTimes, setWaitTimes] = useState({});
  const [specialtyList, setSpecialtyList] = useState([]);
  const [diseaseCategories, setDiseaseCategories] = useState({});
  const itemsPerPage = 5;

  const [filters, setFilters] = useState({
    scheme: '', insurance: '', accreditation: '', specialty: '', disease: '',
    minRating: 0, opdFeeMin: '', opdFeeMax: '',
    emergency: false, cashless: false, bedsAvailable: false
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const schemeDisplayNames = {
    'ayushman': 'Ayushman Bharat', 'cghs': 'CGHS', 'esi': 'ESI', 'echs': 'ECHS',
    'state_scheme': 'State Scheme', 'senior_citizen': 'Senior Citizen', 'disability': 'Disability Scheme'
  };

  const schemeOptions = [
    { value: '', label: 'All Schemes' },
    { value: 'ayushman', label: 'Ayushman Bharat (PM-JAY)' },
    { value: 'cghs', label: 'CGHS' }, { value: 'esi', label: 'ESI' },
    { value: 'echs', label: 'ECHS' }, { value: 'state_scheme', label: 'State Health Scheme' },
    { value: 'senior_citizen', label: 'Senior Citizen Scheme' }
  ];

  const insuranceOptions = [
    { value: '', label: 'All Insurance Providers' },
    { value: 'Star Health', label: 'Star Health' },
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
    { value: 'SBI General', label: 'SBI General' },
    { value: 'Tata AIG', label: 'Tata AIG' }
  ];

  const accreditationOptions = [
    { value: '', label: 'All Accreditations' },
    { value: 'NABH', label: 'NABH' },
    { value: 'JCI', label: 'JCI' },
    { value: 'NABL', label: 'NABL' },
    { value: 'ISO', label: 'ISO' }
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
    fetchMedicalData();
    const saved = JSON.parse(localStorage.getItem('savedHospitals') || '{}');
    setSavedHospitals(saved);
  }, []);

  useEffect(() => { const t = setTimeout(() => setCity(cityInput), 700); return () => clearTimeout(t); }, [cityInput]);
  useEffect(() => { const t = setTimeout(() => setDebouncedFilters(filters), 500); return () => clearTimeout(t); }, [filters]);
  useEffect(() => { fetchHospitals(); }, [searchQuery, city, userLocation, sortBy, debouncedFilters]);

  const fetchMedicalData = async () => {
    try {
      const res = await api.get('/hospitals/medical-data');
      if (res.data?.data) {
        setSpecialtyList(res.data.data.specialties || []);
        setDiseaseCategories(res.data.data.diseases || {});
      }
    } catch(e) {}
  };

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (city) params.append('city', city);
      if (userLocation) { params.append('lat', userLocation.lat); params.append('lng', userLocation.lng); }
      if (debouncedFilters.scheme) params.append('scheme', debouncedFilters.scheme);
      if (debouncedFilters.insurance) params.append('insurance', debouncedFilters.insurance);
      if (debouncedFilters.accreditation) params.append('accreditation', debouncedFilters.accreditation);
      if (debouncedFilters.specialty) params.append('specialty', debouncedFilters.specialty);
      if (debouncedFilters.disease) params.append('disease', debouncedFilters.disease);
      if (debouncedFilters.cashless) params.append('cashless', 'true');
      if (debouncedFilters.emergency) params.append('emergency', 'true');
      if (debouncedFilters.bedsAvailable) params.append('beds_available', 'true');
      if (debouncedFilters.minRating > 0) params.append('min_rating', debouncedFilters.minRating);
      if (debouncedFilters.opdFeeMin) params.append('opd_fee_min', debouncedFilters.opdFeeMin);
      if (debouncedFilters.opdFeeMax) params.append('opd_fee_max', debouncedFilters.opdFeeMax);
      const res = await api.get(`/hospitals/search?${params.toString()}`);
      const data = res.data.data || [];
      setHospitals(data);
      if (data.length > 0) { fetchHospitalStatuses(data.map(h => h._id)); }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  // 🟢 RESTORED: Hospital Status (Green Light System)
  const fetchHospitalStatuses = async (hospitalIds) => {
    try {
      const res = await api.post('/hospital-status/bulk', { hospitalIds });
      if (res.data?.data) setHospitalStatuses(res.data.data);
    } catch (err) {}
  };

  // 🟢 RESTORED: Wait Time Reporting
  const reportWaitTime = async (hospitalId, waitMinutes) => {
    try {
      await api.post(`/hospital-status/${hospitalId}/wait-time`, { waitMinutes });
      setWaitTimes(prev => ({ ...prev, [hospitalId]: waitMinutes }));
    } catch (err) {}
  };

  const handleSearch = (e) => { e.preventDefault(); setSearchQuery(inputQuery); setCurrentPage(1); };

  const clearFilters = () => {
    setFilters({ scheme: '', insurance: '', accreditation: '', specialty: '', disease: '', minRating: 0, opdFeeMin: '', opdFeeMax: '', emergency: false, cashless: false, bedsAvailable: false });
  };

  const activeFilterCount = [filters.scheme, filters.insurance, filters.accreditation, filters.specialty, filters.disease, filters.emergency, filters.cashless, filters.bedsAvailable, filters.minRating > 0, filters.opdFeeMin, filters.opdFeeMax].filter(v => v && v !== false && v !== 0 && v !== '').length;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  const toggleInsurance = (id) => setExpandedInsurance(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSchemes = (id) => setExpandedSchemes(prev => ({ ...prev, [id]: !prev[id] }));

  const toggleSaveHospital = (id) => {
    const updated = { ...savedHospitals, [id]: !savedHospitals[id] };
    setSavedHospitals(updated);
    localStorage.setItem('savedHospitals', JSON.stringify(updated));
  };

  const getSpecializationFromQuery = (query) => {
    const q = query.toLowerCase();
    if (q.includes('heart') || q.includes('cardiac')) return 'cardiologist';
    if (q.includes('brain') || q.includes('stroke') || q.includes('neuro')) return 'neurologist';
    if (q.includes('bone') || q.includes('joint') || q.includes('ortho')) return 'orthopedic';
    if (q.includes('kidney') || q.includes('renal')) return 'nephrologist';
    if (q.includes('cancer') || q.includes('oncology')) return 'oncologist';
    if (q.includes('skin') || q.includes('derma')) return 'dermatologist';
    if (q.includes('eye') || q.includes('ophtha')) return 'ophthalmologist';
    if (q.includes('ear') || q.includes('throat') || q.includes('ent')) return 'ent';
    if (q.includes('pregnant') || q.includes('women') || q.includes('gyne')) return 'gynecologist';
    if (q.includes('child') || q.includes('baby') || q.includes('pedi')) return 'pediatrician';
    if (q.includes('diabetes') || q.includes('sugar')) return 'endocrinologist';
    if (q.includes('lung') || q.includes('asthma')) return 'pulmonologist';
    if (q.includes('mental') || q.includes('depression')) return 'psychiatrist';
    if (q.includes('stomach') || q.includes('gas')) return 'gastroenterologist';
    return null;
  };

  const getMatchingDoctors = (hospital) => {
    if (!searchQuery) return hospital.doctors || [];
    const target = getSpecializationFromQuery(searchQuery);
    if (!target) return hospital.doctors || [];
    const docs = (hospital.doctors || []).filter(d => (d.specialization || '').toLowerCase().includes(target));
    return docs.length > 0 ? docs : hospital.doctors || [];
  };

  const getBedTimestampBadge = (hospital) => {
    const lastUpdated = hospital.beds?.last_updated;
    if (!lastUpdated) return { text: 'Not updated', color: '#ef4444', bg: '#fee2e2' };
    const mins = Math.floor((new Date() - new Date(lastUpdated)) / 60000);
    if (mins < 30) return { text: `🟢 Updated ${mins} mins ago`, color: '#10b981', bg: '#d1fae5' };
    if (mins < 120) return { text: `🟡 Updated ${Math.floor(mins/60)}h ago`, color: '#f59e0b', bg: '#fef3c7' };
    return { text: `🔴 Updated ${Math.floor(mins/60)}h ago`, color: '#ef4444', bg: '#fee2e2' };
  };

  const getSlotBadge = (slots) => {
    if (slots >= 4) return { text: `${slots} slots available today`, color: '#10b981', bg: '#d1fae5', dot: '🟢' };
    if (slots >= 1) return { text: `${slots} slots left today`, color: '#f59e0b', bg: '#fef3c7', dot: '🟡' };
    return { text: 'Available Tomorrow', color: '#ef4444', bg: '#fee2e2', dot: '🔴' };
  };

  const paginatedHospitals = hospitals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(hospitals.length / itemsPerPage);

  const selectStyle = { width: '100%', padding: '0.55rem 0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.85rem', backgroundColor: 'white', outline: 'none', cursor: 'pointer' };
  const toggleStyle = (active) => ({ padding: '0.55rem 1rem', backgroundColor: active ? '#dbeafe' : '#f3f4f6', border: active ? '2px solid #3b82f6' : '2px solid #e5e7eb', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: active ? 'bold' : 'normal', color: active ? '#1e40af' : '#374151', transition: 'all 0.2s', whiteSpace: 'nowrap' });

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏥</div>
        <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>Searching hospitals...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '0.25rem' }}>🏥 Find Hospitals</h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>Search, compare, and book appointments at India's top hospitals</p>

        {/* Filter Panel */}
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
          
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input type="text" placeholder="🔍 Search disease, symptom, specialty, or hospital name..." value={inputQuery} onChange={(e) => setInputQuery(e.target.value)} style={{ flex: 3, minWidth: '250px', padding: '0.75rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none' }} />
              <input type="text" placeholder="📍 City" value={cityInput} onChange={(e) => setCityInput(e.target.value)} style={{ flex: 1, minWidth: '120px', padding: '0.75rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none' }} />
              <button type="submit" style={{ padding: '0.75rem 2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>🔍 Search</button>
            </div>
          </form>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontWeight: '600', color: '#374151', fontSize: '0.85rem', marginRight: '0.25rem' }}>Sort:</span>
            {[{ value: 'distance', label: '📍 Nearest' },{ value: 'fee', label: '💰 Lowest Fee' },{ value: 'rating', label: '⭐ Highest Rated' },{ value: 'beds', label: '🛏️ Most Beds' }].map(opt => (
              <button type="button" key={opt.value} onClick={() => setSortBy(opt.value)} style={{ padding: '0.45rem 0.9rem', backgroundColor: sortBy === opt.value ? '#10b981' : '#f3f4f6', color: sortBy === opt.value ? 'white' : '#374151', border: sortBy === opt.value ? 'none' : '1px solid #e5e7eb', borderRadius: '2rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: sortBy === opt.value ? 'bold' : 'normal', transition: 'all 0.2s' }}>{opt.label}</button>
            ))}
            <div style={{ flex: 1 }}></div>
            {activeFilterCount > 0 && (
              <button type="button" onClick={clearFilters} style={{ padding: '0.45rem 1rem', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>✕ Clear All ({activeFilterCount})</button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <button type="button" onClick={() => setFilters(prev => ({...prev, emergency: !prev.emergency}))} style={toggleStyle(filters.emergency)}>{filters.emergency ? '🚨' : ''} 24/7 Emergency</button>
            <button type="button" onClick={() => setFilters(prev => ({...prev, bedsAvailable: !prev.bedsAvailable}))} style={toggleStyle(filters.bedsAvailable)}>{filters.bedsAvailable ? '🛏️' : ''} Beds Available</button>
            <button type="button" onClick={() => setFilters(prev => ({...prev, cashless: !prev.cashless}))} style={toggleStyle(filters.cashless)}>{filters.cashless ? '💳' : ''} Cashless Only</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div><label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>💠 Government Scheme</label><select value={filters.scheme} onChange={(e) => setFilters(prev => ({...prev, scheme: e.target.value}))} style={selectStyle}>{schemeOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
            <div><label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>🛡️ Insurance Provider</label><select value={filters.insurance} onChange={(e) => setFilters(prev => ({...prev, insurance: e.target.value}))} style={selectStyle}>{insuranceOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
            <div><label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>🏅 Accreditation</label><select value={filters.accreditation} onChange={(e) => setFilters(prev => ({...prev, accreditation: e.target.value}))} style={selectStyle}>{accreditationOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
            <div><label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>🏥 Specialty</label><select value={filters.specialty} onChange={(e) => setFilters(prev => ({...prev, specialty: e.target.value}))} style={selectStyle}><option value="">All Specialties</option>{specialtyList.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
            <div><label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>🦠 Disease/Condition</label><select value={filters.disease} onChange={(e) => setFilters(prev => ({...prev, disease: e.target.value}))} style={selectStyle}><option value="">All Diseases</option>{Object.entries(diseaseCategories).map(([cat, diseases]) => (<optgroup key={cat} label={cat}>{diseases.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</optgroup>))}</select></div>
            <div><label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>⭐ Min Rating: {filters.minRating > 0 ? filters.minRating + ' ★' : 'Any'}</label><input type="range" min="0" max="5" step="0.5" value={filters.minRating} onChange={(e) => setFilters(prev => ({...prev, minRating: parseFloat(e.target.value)}))} style={{ width: '100%', accentColor: '#f59e0b' }} /></div>
            <div><label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>💰 OPD Fee Range (₹)</label><div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><input type="number" placeholder="Min" value={filters.opdFeeMin} onChange={(e) => setFilters(prev => ({...prev, opdFeeMin: e.target.value}))} style={{ flex: 1, padding: '0.5rem', border: '2px solid #e5e7eb', borderRadius: '0.4rem', fontSize: '0.85rem', outline: 'none', minWidth: '60px' }} /><span>—</span><input type="number" placeholder="Max" value={filters.opdFeeMax} onChange={(e) => setFilters(prev => ({...prev, opdFeeMax: e.target.value}))} style={{ flex: 1, padding: '0.5rem', border: '2px solid #e5e7eb', borderRadius: '0.4rem', fontSize: '0.85rem', outline: 'none', minWidth: '60px' }} /></div></div>
          </div>
        </div>

        <p style={{ color: '#6b7280', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
          {hospitals.length > 0 ? <><strong>{hospitals.length}</strong> hospital{hospitals.length !== 1 ? 's' : ''} found{searchQuery && ` for "${searchQuery}"`}</> : 'No hospitals found. Try adjusting filters.'}
        </p>

        {paginatedHospitals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
            <h3>No hospitals match your criteria</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Try changing your search terms or filters</p>
            <button type="button" onClick={clearFilters} style={{ padding: '0.6rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>Clear All Filters</button>
          </div>
        ) : (
          paginatedHospitals.map(h => {
            const distance = userLocation && h.location ? calculateDistance(userLocation.lat, userLocation.lng, h.location.lat, h.location.lng) : null;
            const insList = h.insurance_accepted || [];
            const schList = h.schemes_accepted || [];
            const showIns = expandedInsurance[h._id];
            const showSch = expandedSchemes[h._id];
            const matchingDocs = getMatchingDoctors(h);
            const selDoc = matchingDocs.find(d => d.name === selectedDoctor[h._id]) || matchingDocs[0] || null;
            const p = h.pricing || {};
            const beds = h.beds || {};
            const facs = h.facilities || [];
            const bedBadge = getBedTimestampBadge(h);
            const isSaved = savedHospitals[h._id];
            
            // 🟢 RESTORED: Green Light Status
            const status = hospitalStatuses[h._id];
            const isStale = status?.isStale !== false;
            const sc = { 
              accepting: { icon: '🟢', label: 'Accepting Patients', color: '#10b981', bg: '#d1fae5' }, 
              limited: { icon: '🟡', label: 'Limited Capacity', color: '#f59e0b', bg: '#fef3c7' }, 
              full: { icon: '🔴', label: 'Currently Full', color: '#ef4444', bg: '#fee2e2' }, 
              unknown: { icon: '❓', label: 'Status Unknown', color: '#6b7280', bg: '#f3f4f6' } 
            };
            const cfg = sc[status?.status] || sc.unknown;

            return (
              <div key={h._id} style={cardStyles.container}>

                {/* ═══ HEADER ROW ═══ */}
                <div style={cardStyles.headerRow}>
                  <div style={{ flex: 1 }}>
                    <h2 style={cardStyles.hospitalName}>{h.name}</h2>
                    <div style={cardStyles.accreditationRow}>
                      {(h.accreditations || []).map((a, i) => {
  const label = typeof a === 'string' ? a : (a.name || a.issuing_body || a.body || 'Accredited');
  return <span key={i} style={cardStyles.accreditationBadge}>{label}</span>;
})}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={cardStyles.ratingRow}>
                      <span style={{ color: '#f59e0b', fontSize: '1.2rem' }}>⭐</span>
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{h.ratings?.average || 'N/A'}</span>
                      <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>({h.ratings?.count || 0} reviews)</span>
                    </div>
                    {h.cashless_available && (
                      <span style={cardStyles.cashlessBadge}>💳 Cashless Available</span>
                    )}
                  </div>
                </div>

                {/* ═══ LOCATION ROW ═══ */}
                <div style={cardStyles.locationRow}>
                  📍 {h.address?.city}, {h.address?.state}
                  {distance && <span style={{ fontWeight: 'bold', color: '#3b82f6' }}> • {distance} km away</span>}
                </div>

                {/* 🟢 RESTORED: Green Light Status Bar */}
                <div style={{ ...cardStyles.statusBar, backgroundColor: isStale ? '#fef3c7' : cfg.bg, border: `1px solid ${isStale ? '#f59e0b' : cfg.color}` }}>
                  <span style={{ color: isStale ? '#92400e' : cfg.color, fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {isStale ? '⚠️ Status Unverified' : `${cfg.icon} ${cfg.label}`}
                  </span>
                  {status?.updatedAt && (
                    <span style={{ fontSize: '0.65rem', color: '#888' }}>
                      Last updated: {new Date(status.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {waitTimes[h._id] && (
                    <span style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 'bold' }}>
                      ⏱️ Avg Wait: {waitTimes[h._id]} min
                    </span>
                  )}
                </div>

                {/* ═══ SCHEMES ROW ═══ */}
                {schList.length > 0 && (
                  <div style={cardStyles.section}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>💠 Schemes:</span>
                    <div style={{ ...cardStyles.pillRow, marginLeft: '6px' }}>
                      {(showSch ? schList : schList.slice(0, 3)).map((s, i) => (
                        <span key={i} style={cardStyles.schemePill}>{schemeDisplayNames[s] || s}</span>
                      ))}
                      {schList.length > 3 && (
                        <button onClick={() => toggleSchemes(h._id)} style={cardStyles.expandPillBtn}>
                          {showSch ? '▲ Less' : `▼ +${schList.length - 3} more`}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ═══ DOCTORS SECTION ═══ */}
                {matchingDocs.length > 0 && (
                  <div style={cardStyles.doctorSection}>
                    <div style={cardStyles.doctorSectionHeader}>
                      👨‍⚕️ Select Doctor ({matchingDocs.length} {matchingDocs[0]?.specialization || 'Doctor'}{matchingDocs.length > 1 ? 's' : ''} available):
                    </div>
                    {matchingDocs.map(doc => {
                      const slotInfo = getSlotBadge(doc.availability?.slots_available || 0);
                      const isSelected = selectedDoctor[h._id] === doc.name;
                      return (
                        <label key={doc.name} style={{ ...cardStyles.doctorCard, borderColor: isSelected ? '#10b981' : '#e5e7eb', backgroundColor: isSelected ? '#f0fdf4' : '#fff' }}>
                          <input type="radio" name={`doc_${h._id}`} checked={isSelected} onChange={() => setSelectedDoctor(prev => ({ ...prev, [h._id]: doc.name }))} style={{ marginRight: '10px', transform: 'scale(1.2)', cursor: 'pointer' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{doc.name} - {doc.specialization}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                              📜 {doc.qualification} | 📅 {doc.experience} exp
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              ⭐ {doc.rating} ({doc.reviewCount} reviews) | 🗣️ {(doc.languages || []).join(', ')}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.1rem' }}>₹{doc.consultation_fee}</div>
                            <span style={{ ...cardStyles.slotBadge, backgroundColor: slotInfo.bg, color: slotInfo.color }}>
                              {slotInfo.dot} {slotInfo.text}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* ═══ LAB TESTS ROW ═══ */}
                <div style={cardStyles.section}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>🧪 Lab Tests:</span>
                  {h.lab_tests_available ? (
                    <span style={{ color: '#10b981', fontWeight: '600', marginLeft: '6px' }}>
                      ✅ In-house ({facs.filter(f => ['MRI', 'CT', 'Cath Lab', 'X-Ray', 'Ultrasound'].some(eq => (f.name || f).includes(eq))).map(f => f.name || f).join(', ') || 'Full Lab'})
                    </span>
                  ) : (
                    <span style={{ color: '#f59e0b', fontWeight: '600', marginLeft: '6px' }}>🔗 Partner Lab</span>
                  )}
                </div>

                {/* ═══ INSURANCE ROW ═══ */}
                {insList.length > 0 && (
                  <div style={cardStyles.section}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>🛡️ Insurance:</span>
                      <div style={cardStyles.pillRow}>
                        {(showIns ? insList : insList.slice(0, 3)).map((ins, i) => (
                          <span key={i} style={cardStyles.insurancePill}>{ins}</span>
                        ))}
                        {insList.length > 3 && (
                          <button onClick={() => toggleInsurance(h._id)} style={cardStyles.expandPillBtn}>
                            {showIns ? '▲ Less' : `▼ +${insList.length - 3} more`}
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                      {h.cashless_available && <span style={{ color: '#10b981' }}>💳 Cashless: Yes</span>}
                      {h.tpa_desk_available && <span style={{ color: '#3b82f6', marginLeft: '12px' }}>🏧 TPA Desk: Yes</span>}
                    </div>
                  </div>
                )}

                {/* ═══ PRICING GRID ═══ */}
                <div style={cardStyles.pricingGrid}>
                  <div style={cardStyles.pricingLeft}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>📋 OPD Consultation</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#10b981' }}>
                      ₹{p.consultation || 'N/A'}
                      {p.consultation > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#059669', marginLeft: '6px' }}>
                          (Save ₹{Math.round(p.consultation * 0.1)} = ₹{Math.round(p.consultation * 0.9)})
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={cardStyles.pricingRight}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>🏥 Admission/day</div>
                    <div style={{ fontSize: '0.85rem', color: '#374151' }}>
                      {p.icu_bed_per_day && <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>ICU ₹{p.icu_bed_per_day}</span>}
                      {p.general_bed_per_day && <span> | General ₹{p.general_bed_per_day}</span>}
                      {p.semi_private_per_day && <span> | Semi-Pvt ₹{p.semi_private_per_day}</span>}
                      {p.private_per_day && <span> | Private ₹{p.private_per_day}</span>}
                    </div>
                  </div>
                </div>

                {/* ═══ BEDS ROW ═══ */}
                <div style={cardStyles.bedsRow}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    🛏️ {beds.available || 0} beds available
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    | ICU: {beds.icu_available || 0} | Vent: {beds.ventilator_available || 0}
                  </span>
                  <span style={{ ...cardStyles.bedTimestampBadge, backgroundColor: bedBadge.bg, color: bedBadge.color }}>
                    {bedBadge.text}
                  </span>
                </div>

                {/* ═══ FACILITIES ROW ═══ */}
                {facs.length > 0 && (
                  <div style={cardStyles.facilitiesRow}>
                    {facs.slice(0, 6).map((f, i) => {
                      const name = typeof f === 'string' ? f : f.name;
                      return (
                        <span key={i} style={cardStyles.facilityIcon}>
                          {name.includes('MRI') ? '🔬' : name.includes('CT') ? '🩻' : name.includes('Cath') ? '❤️' : name.includes('X-Ray') ? '🦴' : name.includes('Parking') ? '🅿️' : '✅'} {name}
                        </span>
                      );
                    })}
                    {facs.length > 6 && <span style={{ fontSize: '0.75rem', color: '#3b82f6', cursor: 'pointer' }} onClick={() => navigate(`/hospital-info/${h._id}`)}>+{facs.length - 6} more</span>}
                  </div>
                )}

                {/* 🟢 RESTORED: Ratings Breakdown */}
                {h.ratings?.breakdown && (
                  <div style={cardStyles.ratingsBreakdown}>
                    <span>👨‍⚕️ Doctor: {h.ratings.breakdown.doctor_communication || h.ratings.breakdown.doctor || 'N/A'}</span>
                    <span>👥 Staff: {h.ratings.breakdown.staff_behavior || h.ratings.breakdown.staff || 'N/A'}</span>
                    <span>🧹 Clean: {h.ratings.breakdown.cleanliness || h.ratings.breakdown.clean || 'N/A'}</span>
                    <span>⏱️ Wait: {h.ratings.breakdown.wait_time || h.ratings.breakdown.wait || 'N/A'}</span>
                    <span>💰 Value: {h.ratings.breakdown.value_for_money || h.ratings.breakdown.value || 'N/A'}</span>
                  </div>
                )}

                {/* 🟢 RESTORED: Featured Review */}
                {h.featured_review?.text && (
                  <div style={cardStyles.featuredReview}>
                    💬 "{h.featured_review.text}" - {h.featured_review.author}
                  </div>
                )}

                {/* ═══ ACTION BUTTONS ═══ */}
                <div style={cardStyles.actionRow}>
                  <button onClick={() => { const d = selectedDoctor[h._id] ? `?doctor=${encodeURIComponent(selectedDoctor[h._id])}` : ''; navigate(`/book-opd/${h._id}${d}`); }} style={cardStyles.bookOpdBtn}>📋 Book OPD</button>
                  <button onClick={() => navigate(`/book-admission/${h._id}`)} style={cardStyles.bookAdmissionBtn}>🏥 Book Admission</button>
                  <button onClick={() => navigate(`/hospital-info/${h._id}`)} style={cardStyles.viewDetailsBtn}>View Details →</button>
                  <button onClick={() => navigate('/ambulance')} style={cardStyles.ambulanceBtn}>🚑 Ambulance</button>
                </div>

                {/* ═══ EMERGENCY ROW ═══ */}
                <div style={cardStyles.emergencyRow}>
                  {h.has24x7ER && <span style={cardStyles.emergencyBadge}>🚨 24/7 Emergency</span>}
                  <span style={{ fontSize: '0.8rem', color: '#374151' }}>
                    📞 {h.emergency_contact || h.contact?.phone || 'N/A'}
                  </span>
                  <a href={`tel:${h.emergency_contact || h.contact?.phone || ''}`} style={cardStyles.callNowBtn}>📞 Call Now</a>
                  <button onClick={() => toggleSaveHospital(h._id)} style={cardStyles.saveBtn}>
                    {isSaved ? '🔖 Saved' : '🔖 Save'}
                  </button>
                  {/* 🟢 RESTORED: Report Wait Time Button */}
                  <button onClick={() => { const m = prompt('How many minutes did you wait? (Optional - helps other patients)'); if (m && !isNaN(m)) reportWaitTime(h._id, parseInt(m)); }} style={cardStyles.reportWaitBtn}>
                    + Report Wait
                  </button>
                </div>

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

const cardStyles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.25rem 1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '4px',
  },
  hospitalName: { fontSize: '1.25rem', fontWeight: 'bold', color: '#1e3a8a', margin: 0, lineHeight: 1.3 },
  accreditationRow: { display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' },
  accreditationBadge: { backgroundColor: '#e0e7ff', color: '#3730a3', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid #c7d2fe' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' },
  cashlessBadge: { backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 'bold', marginTop: '4px', display: 'inline-block' },
  locationRow: { color: '#6b7280', fontSize: '0.85rem', marginTop: '8px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' },
  // 🟢 RESTORED: Status Bar
  statusBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', borderRadius: '8px', margin: '8px 0', flexWrap: 'wrap', gap: '6px' },
  section: { marginTop: '8px', display: 'flex', alignItems: 'center', flexWrap: 'wrap' },
  pillRow: { display: 'inline-flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' },
  schemePill: { backgroundColor: '#f3e8ff', color: '#5b21b6', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '600' },
  insurancePill: { backgroundColor: '#e0e7ff', color: '#1e40af', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '600' },
  expandPillBtn: { color: '#6366f1', fontSize: '0.7rem', cursor: 'pointer', background: 'none', border: 'none', fontWeight: '600', padding: '2px 8px' },
  doctorSection: { marginTop: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' },
  doctorSectionHeader: { fontWeight: 'bold', fontSize: '0.9rem', color: '#374151', marginBottom: '8px' },
  doctorCard: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', marginTop: '6px', cursor: 'pointer', border: '2px solid #e5e7eb', transition: 'all 0.15s' },
  slotBadge: { fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '9999px', display: 'inline-block', marginTop: '4px' },
  pricingGrid: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' },
  pricingLeft: { flex: '1 1 40%', minWidth: '180px' },
  pricingRight: { flex: '1 1 55%', minWidth: '250px' },
  bedsRow: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '10px', padding: '8px 0' },
  bedTimestampBadge: { fontSize: '0.7rem', fontWeight: 'bold', padding: '3px 10px', borderRadius: '9999px', marginLeft: 'auto' },
  facilitiesRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f3f4f6' },
  facilityIcon: { fontSize: '0.78rem', color: '#374151', backgroundColor: '#f3f4f6', padding: '4px 10px', borderRadius: '6px', fontWeight: '500' },
  // 🟢 RESTORED: Ratings Breakdown
  ratingsBreakdown: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px', padding: '8px 0', fontSize: '0.72rem', color: '#6b7280', borderTop: '1px solid #f3f4f6' },
  // 🟢 RESTORED: Featured Review
  featuredReview: { backgroundColor: '#fef3c7', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#92400e', marginTop: '10px', fontStyle: 'italic', borderLeft: '3px solid #f59e0b' },
  actionRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px', paddingTop: '12px', borderTop: '2px solid #f3f4f6' },
  bookOpdBtn: { padding: '10px 18px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', flex: '1 1 auto', minWidth: '130px' },
  bookAdmissionBtn: { padding: '10px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', flex: '1 1 auto', minWidth: '130px' },
  viewDetailsBtn: { padding: '10px 18px', backgroundColor: '#fff', color: '#374151', border: '2px solid #d1d5db', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', flex: '1 1 auto', minWidth: '130px' },
  ambulanceBtn: { padding: '10px 14px', backgroundColor: '#fef3c7', color: '#92400e', border: '2px solid #f59e0b', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' },
  emergencyRow: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #fee2e2', backgroundColor: '#fef2f2', padding: '10px 12px', borderRadius: '8px' },
  emergencyBadge: { backgroundColor: '#dc2626', color: 'white', padding: '3px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' },
  callNowBtn: { padding: '6px 14px', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'none' },
  saveBtn: { padding: '6px 14px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', marginLeft: 'auto' },
  // 🟢 RESTORED: Report Wait Time Button
  reportWaitBtn: { fontSize: '0.65rem', color: '#6366f1', background: 'none', border: '1px dashed #6366f1', borderRadius: '6px', cursor: 'pointer', padding: '4px 10px', fontWeight: '500' },
};

export default HospitalsList;