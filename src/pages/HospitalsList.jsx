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
    'ayushman': 'Ayushman Bharat (PM-JAY)',
    'cghs': 'CGHS', 'esi': 'ESI', 'echs': 'ECHS',
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => {}
      );
    }
    fetchMedicalData();
  }, []);

  useEffect(() => { const timer = setTimeout(() => setCity(cityInput), 700); return () => clearTimeout(timer); }, [cityInput]);
  useEffect(() => { const timer = setTimeout(() => setDebouncedFilters(filters), 500); return () => clearTimeout(timer); }, [filters]);
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

  const fetchHospitalStatuses = async (hospitalIds) => {
    try {
      const res = await api.post('/hospital-status/bulk', { hospitalIds });
      if (res.data?.data) setHospitalStatuses(res.data.data);
    } catch (err) {}
  };

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
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const toggleInsurance = (id) => setExpandedInsurance(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSchemes = (id) => setExpandedSchemes(prev => ({ ...prev, [id]: !prev[id] }));

  const getSpecializationFromQuery = (query) => {
    const q = query.toLowerCase();
    if (q.includes('heart') || q.includes('cardiac') || q.includes('chest')) return 'cardiologist';
    if (q.includes('brain') || q.includes('stroke') || q.includes('neuro') || q.includes('migraine')) return 'neurologist';
    if (q.includes('bone') || q.includes('joint') || q.includes('ortho') || q.includes('knee')) return 'orthopedic';
    if (q.includes('kidney') || q.includes('stone') || q.includes('renal')) return 'nephrologist';
    if (q.includes('cancer') || q.includes('tumor') || q.includes('oncology')) return 'oncologist';
    if (q.includes('skin') || q.includes('rash')) return 'dermatologist';
    if (q.includes('eye') || q.includes('vision')) return 'ophthalmologist';
    if (q.includes('ear') || q.includes('throat') || q.includes('nose')) return 'ent';
    if (q.includes('pregnant') || q.includes('women') || q.includes('lady')) return 'gynecologist';
    if (q.includes('child') || q.includes('baby') || q.includes('pediatric')) return 'pediatrician';
    if (q.includes('diabetes') || q.includes('sugar')) return 'endocrinologist';
    if (q.includes('lung') || q.includes('breathing') || q.includes('asthma')) return 'pulmonologist';
    if (q.includes('mental') || q.includes('depression') || q.includes('anxiety')) return 'psychiatrist';
    if (q.includes('stomach') || q.includes('gas') || q.includes('acidity')) return 'gastroenterologist';
    if (q.includes('teeth') || q.includes('dental')) return 'dentist';
    return null;
  };

  const getMatchingDoctors = (hospital) => {
    if (!searchQuery) return [];
    const targetSpec = getSpecializationFromQuery(searchQuery);
    if (!targetSpec) return hospital.doctors || [];
    const doctors = hospital.doctors || [];
    const matching = doctors.filter(doc => doc.specialization.toLowerCase().includes(targetSpec));
    return matching.length > 0 ? matching : doctors;
  };

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
            
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>💠 Government Scheme</label>
              <select value={filters.scheme} onChange={(e) => setFilters(prev => ({...prev, scheme: e.target.value}))} style={selectStyle}>
                {schemeOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>🛡️ Insurance Provider</label>
              <select value={filters.insurance} onChange={(e) => setFilters(prev => ({...prev, insurance: e.target.value}))} style={selectStyle}>
                {insuranceOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>🏅 Accreditation</label>
              <select value={filters.accreditation} onChange={(e) => setFilters(prev => ({...prev, accreditation: e.target.value}))} style={selectStyle}>
                {accreditationOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>🏥 Specialty</label>
              <select value={filters.specialty} onChange={(e) => setFilters(prev => ({...prev, specialty: e.target.value}))} style={selectStyle}>
                <option value="">All Specialties</option>
                {specialtyList.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>🦠 Disease/Condition</label>
              <select value={filters.disease} onChange={(e) => setFilters(prev => ({...prev, disease: e.target.value}))} style={selectStyle}>
                <option value="">All Diseases</option>
                {Object.entries(diseaseCategories).map(([category, diseases]) => (
                  <optgroup key={category} label={category}>
                    {diseases.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>⭐ Min Rating: {filters.minRating > 0 ? filters.minRating + ' ★' : 'Any'}</label>
              <input type="range" min="0" max="5" step="0.5" value={filters.minRating} onChange={(e) => setFilters(prev => ({...prev, minRating: parseFloat(e.target.value)}))} style={{ width: '100%', accentColor: '#f59e0b' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#9ca3af', padding: '0 2px' }}><span>Any</span><span>3★</span><span>5★</span></div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#6b7280' }}>💰 OPD Fee Range (₹)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="number" placeholder="Min" value={filters.opdFeeMin} onChange={(e) => setFilters(prev => ({...prev, opdFeeMin: e.target.value}))} style={{ flex: 1, padding: '0.5rem', border: '2px solid #e5e7eb', borderRadius: '0.4rem', fontSize: '0.85rem', outline: 'none', minWidth: '60px' }} />
                <span style={{ color: '#9ca3af', fontSize: '0.85rem', flexShrink: 0 }}>—</span>
                <input type="number" placeholder="Max" value={filters.opdFeeMax} onChange={(e) => setFilters(prev => ({...prev, opdFeeMax: e.target.value}))} style={{ flex: 1, padding: '0.5rem', border: '2px solid #e5e7eb', borderRadius: '0.4rem', fontSize: '0.85rem', outline: 'none', minWidth: '60px' }} />
              </div>
            </div>

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
            const status = hospitalStatuses[h._id];
            const isStale = status?.isStale !== false;
            const sc = { accepting: { icon: '🟢', label: 'Accepting', color: '#10b981', bg: '#d1fae5' }, limited: { icon: '🟡', label: 'Limited', color: '#f59e0b', bg: '#fef3c7' }, full: { icon: '🔴', label: 'Full', color: '#ef4444', bg: '#fee2e2' }, unknown: { icon: '❓', label: 'Call', color: '#6b7280', bg: '#f3f4f6' } };
            const cfg = sc[status?.status] || sc.unknown;
            const p = h.pricing || {};
            const rooms = [];
            if (p.general_bed_per_day) rooms.push(`Gen ₹${p.general_bed_per_day}`);
            if (p.semi_private_per_day) rooms.push(`Semi ₹${p.semi_private_per_day}`);
            if (p.private_per_day) rooms.push(`Pvt ₹${p.private_per_day}`);
            if (p.icu_bed_per_day) rooms.push(`ICU ₹${p.icu_bed_per_day}`);
            const facs = (h.facilities || []).slice(0, 4).map(f => typeof f === 'string' ? f : f.name).filter(Boolean).join(' • ');
            const moreFacs = Math.max(0, (h.facilities || []).length - 4);

            return (
              <div key={h._id} style={card.container}>
                <div style={card.header}>
                  <div>
                    <h2 style={card.name}>{h.name}</h2>
                    <div style={card.badges}>{(h.accreditations || []).map(a => <span key={a} style={card.badge}>{a}</span>)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>⭐ {h.ratings?.average || 'N/A'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>({h.ratings?.count || 0} reviews)</div>
                    {h.cashless_available && <span style={card.cashlessBadge}>💳 Cashless</span>}
                  </div>
                </div>
                <p style={{ color: '#6b7280', margin: '4px 0', fontSize: '0.85rem' }}>📍 {h.address?.city}, {h.address?.state} {distance && <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>• {distance} km</span>}</p>

                <div style={{ ...card.statusBar, backgroundColor: isStale ? '#fef3c7' : cfg.bg }}>
                  <span style={{ color: isStale ? '#92400e' : cfg.color, fontWeight: 'bold', fontSize: '0.8rem' }}>{isStale ? '⚠️ Unverified' : `${cfg.icon} ${cfg.label}`}</span>
                  {status?.updatedAt && <span style={{ fontSize: '0.65rem', color: '#888' }}>{new Date(status.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
                  {waitTimes[h._id] && <span style={{ fontSize: '0.7rem', color: '#6366f1' }}>⏱️ {waitTimes[h._id]}min</span>}
                  <a href={`tel:${h.emergency_contact || h.contact?.phone || ''}`} style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: 'bold', textDecoration: 'none' }}>📞 Call</a>
                </div>

                {schList.length > 0 && (
                  <div style={card.expand}>
                    <button onClick={() => toggleSchemes(h._id)} style={card.expandBtn}>💠 {schList.length} Schemes {showSch ? '▲' : '▼'}</button>
                    <div style={card.tagRow}>
                      {(showSch ? schList : schList.slice(0, 3)).map((s, i) => <span key={i} style={card.tag}>{schemeDisplayNames[s] || s}</span>)}
                      {!showSch && schList.length > 3 && <button onClick={() => toggleSchemes(h._id)} style={card.moreTag}>+{schList.length - 3}</button>}
                    </div>
                  </div>
                )}

                {searchQuery && matchingDocs.length > 0 && (
                  <div style={card.doctorSection}>
                    <strong style={{ fontSize: '0.85rem' }}>👨‍⚕️ {matchingDocs.length} Doctor{matchingDocs.length > 1 ? 's' : ''} matching</strong>
                    {matchingDocs.map(doc => (
                      <label key={doc.name} style={{ ...card.doctorRow, border: selectedDoctor[h._id] === doc.name ? '2px solid #10b981' : '1px solid #e5e7eb', backgroundColor: selectedDoctor[h._id] === doc.name ? '#f0fdf4' : '#fff' }}>
                        <input type="radio" name={`doc_${h._id}`} checked={selectedDoctor[h._id] === doc.name} onChange={() => setSelectedDoctor(prev => ({ ...prev, [h._id]: doc.name }))} />
                        <div style={{ flex: 1 }}><strong>{doc.name}</strong> - {doc.specialization}<br /><span style={{ fontSize: '0.7rem', color: '#6b7280' }}>📜 {doc.qualification} • ⭐ {doc.rating} ({doc.reviewCount}) • 🗣️ {(doc.languages || []).join(', ')}</span></div>
                        <div style={{ textAlign: 'right' }}><span style={{ fontWeight: 'bold', color: '#10b981' }}>₹{doc.consultation_fee}</span></div>
                      </label>
                    ))}
                  </div>
                )}

                <div style={{ margin: '8px 0', fontSize: '0.8rem' }}>🧪 Lab: {h.lab_tests_available ? '✅ In-house Available' : '🔗 Partner Lab'}</div>

                {insList.length > 0 && (
                  <div style={card.expand}>
                    <button onClick={() => toggleInsurance(h._id)} style={card.expandBtn}>🛡️ {insList.length} Insurance {showIns ? '▲' : '▼'}</button>
                    <div style={card.tagRow}>
                      {(showIns ? insList : insList.slice(0, 3)).map((ins, i) => <span key={i} style={{ ...card.tag, backgroundColor: '#eff6ff', color: '#1e40af' }}>{ins}</span>)}
                      {!showIns && insList.length > 3 && <button onClick={() => toggleInsurance(h._id)} style={card.moreTag}>+{insList.length - 3}</button>}
                    </div>
                    {h.cashless_available && <span style={{ fontSize: '0.7rem', color: '#10b981' }}>💳 Cashless</span>}
                    {h.tpa_desk_available && <span style={{ fontSize: '0.7rem', color: '#3b82f6', marginLeft: '8px' }}>🏧 TPA Desk</span>}
                  </div>
                )}

                {rooms.length > 0 && (
                  <div style={card.summaryRow}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>🛏️ Rooms: </span>
                    <span style={{ fontSize: '0.78rem', color: '#555' }}>{rooms.join(' | ')}</span>
                  </div>
                )}
                {facs && (
                  <div style={card.summaryRow}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>🏗️ Facilities: </span>
                    <span style={{ fontSize: '0.78rem', color: '#555' }}>{facs}{moreFacs > 0 && <button onClick={() => navigate(`/hospital-info/${h._id}`)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.75rem' }}> +{moreFacs} more</button>}</span>
                  </div>
                )}

                {h.ratings?.breakdown && (
                  <div style={card.ratingsRow}>
                    <span>Doc: {h.ratings.breakdown.doctor_communication || h.ratings.breakdown.doctor || 'N/A'}</span>
                    <span>Staff: {h.ratings.breakdown.staff_behavior || h.ratings.breakdown.staff || 'N/A'}</span>
                    <span>Clean: {h.ratings.breakdown.cleanliness || h.ratings.breakdown.clean || 'N/A'}</span>
                    <span>Wait: {h.ratings.breakdown.wait_time || h.ratings.breakdown.wait || 'N/A'}</span>
                    <span>Value: {h.ratings.breakdown.value_for_money || h.ratings.breakdown.value || 'N/A'}</span>
                  </div>
                )}
                {h.featured_review?.text && (
                  <div style={card.review}>💬 "{h.featured_review.text}" - {h.featured_review.author}</div>
                )}

                <div style={card.actions}>
                  <a href={`tel:${h.emergency_contact || h.contact?.phone || ''}`} style={card.callBtn}>📞 Call</a>
                  <button onClick={() => { const d = selectedDoctor[h._id] ? `?doctor=${encodeURIComponent(selectedDoctor[h._id])}` : ''; navigate(`/book-opd/${h._id}${d}`); }} style={card.opdBtn}>📋 Book OPD</button>
                  <button onClick={() => navigate(`/book-admission/${h._id}`)} style={card.admitBtn}>🏥 Book Admission</button>
                  <button onClick={() => navigate('/ambulance')} style={card.ambBtn}>🚑</button>
                  <button onClick={() => navigate(`/hospital-info/${h._id}`)} style={card.detailBtn}>View Details →</button>
                </div>

                {h.has24x7ER && (
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ backgroundColor: '#dc2626', color: 'white', padding: '2px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 'bold' }}>🚨 24/7 Emergency</span>
                    <button onClick={() => { const m = prompt('How many minutes did you wait? (Optional - helps other patients)'); if (m && !isNaN(m)) reportWaitTime(h._id, parseInt(m)); }} style={{ marginLeft: '8px', fontSize: '0.65rem', color: '#6366f1', background: 'none', border: '1px dashed #6366f1', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px' }}>+ Report Wait</button>
                  </div>
                )}
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

const card = {
  container: { backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' },
  header: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '4px' },
  name: { fontSize: '1.15rem', fontWeight: 'bold', margin: 0 },
  badges: { display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' },
  badge: { backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 'bold' },
  cashlessBadge: { backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 'bold', marginTop: '4px', display: 'inline-block' },
  statusBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', margin: '8px 0', flexWrap: 'wrap', gap: '4px' },
  expand: { margin: '6px 0' },
  expandBtn: { cursor: 'pointer', fontSize: '0.8rem', color: '#6366f1', fontWeight: '600', background: 'none', border: 'none', padding: 0, marginBottom: '4px' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
  tag: { backgroundColor: '#f3e8ff', color: '#5b21b6', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.65rem' },
  moreTag: { color: '#6366f1', fontSize: '0.65rem', cursor: 'pointer', padding: '2px 8px', background: 'none', border: 'none' },
  doctorSection: { margin: '8px 0', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' },
  doctorRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '8px', marginTop: '6px', cursor: 'pointer' },
  summaryRow: { margin: '6px 0', lineHeight: '1.5' },
  ratingsRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '6px 0', color: '#888', fontSize: '0.7rem' },
  review: { backgroundColor: '#fef3c7', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#92400e', margin: '6px 0', fontStyle: 'italic' },
  actions: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' },
  callBtn: { padding: '8px 14px', backgroundColor: '#fef3c7', color: '#92400e', border: '2px solid #f59e0b', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'none' },
  opdBtn: { padding: '8px 14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' },
  admitBtn: { padding: '8px 14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' },
  ambBtn: { padding: '8px 10px', backgroundColor: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' },
  detailBtn: { padding: '8px 14px', backgroundColor: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }
};

export default HospitalsList;