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
  const [expandedDoctors, setExpandedDoctors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [savedHospitals, setSavedHospitals] = useState({});
  const [hospitalStatuses, setHospitalStatuses] = useState({});
  const [waitTimes, setWaitTimes] = useState({});
  const [specialtyList, setSpecialtyList] = useState([]);
  const [diseaseCategories, setDiseaseCategories] = useState({});
  const itemsPerPage = 5;

  const [compareList, setCompareList] = useState([]);

  const toggleCompare = (hospitalId) => {
    setCompareList(prev => {
      if (prev.includes(hospitalId)) {
        return prev.filter(id => id !== hospitalId);
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 hospitals');
        return prev;
      }
      return [...prev, hospitalId];
    });
  };

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
      // Only send lat/lng if both are valid numbers
      if (userLocation && !isNaN(userLocation.lat) && !isNaN(userLocation.lng) && userLocation.lat !== 0 && userLocation.lng !== 0) { 
        params.append('lat', userLocation.lat); 
        params.append('lng', userLocation.lng); 
      }
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
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  const toggleInsurance = (id) => setExpandedInsurance(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSchemes = (id) => setExpandedSchemes(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleDoctors = (id) => setExpandedDoctors(prev => ({ ...prev, [id]: !prev[id] }));

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

  // Get lowest doctor fee for pricing display
  const getLowestDoctorFee = (hospital) => {
    const docs = getMatchingDoctors(hospital);
    if (docs.length === 0) return null;
    return Math.min(...docs.map(d => d.consultation_fee || 0));
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
    if (slots >= 4) return { text: `${slots} slots today`, color: '#10b981', bg: '#d1fae5', dot: '🟢' };
    if (slots >= 1) return { text: `${slots} left today`, color: '#f59e0b', bg: '#fef3c7', dot: '🟡' };
    return { text: 'Tomorrow', color: '#ef4444', bg: '#fee2e2', dot: '🔴' };
  };

  // Check if ratings breakdown has any real data
  const hasRatings = (breakdown) => {
    if (!breakdown) return false;
    const vals = [breakdown.doctor_communication, breakdown.doctor, breakdown.staff_behavior, breakdown.staff, breakdown.cleanliness, breakdown.clean, breakdown.wait_time, breakdown.wait, breakdown.value_for_money, breakdown.value];
    return vals.some(v => v > 0);
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
            
            <button 
              onClick={() => compareList.length >= 2 && navigate('/compare-hospitals', { state: { hospitalIds: compareList } })}
              disabled={compareList.length < 2}
              style={{
                padding: '0.5rem 1.2rem',
                backgroundColor: compareList.length >= 2 ? '#6366f1' : '#e5e7eb',
                color: compareList.length >= 2 ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: '2rem',
                cursor: compareList.length >= 2 ? 'pointer' : 'not-allowed',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}>
              ⚖️ Compare ({compareList.length}/3)
            </button>
            
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1rem' }}>
          {paginatedHospitals.map(h => {
            const distance = userLocation && h.location ? calculateDistance(userLocation.lat, userLocation.lng, h.location.lat, h.location.lng) : null;
            const insList = h.insurance_accepted || [];
            const schList = h.schemes_accepted || [];
            const showIns = expandedInsurance[h._id];
            const showSch = expandedSchemes[h._id];
            const showDocs = expandedDoctors[h._id];
            const matchingDocs = getMatchingDoctors(h);
            const selDoc = matchingDocs.find(d => d.name === selectedDoctor[h._id]) || matchingDocs[0] || null;
            const lowestFee = getLowestDoctorFee(h);
            const p = h.pricing || {};
            const beds = h.beds || {};
            const facs = h.facilities || [];
            const bedBadge = getBedTimestampBadge(h);
            const isSaved = savedHospitals[h._id];
            const isCompared = compareList.includes(h._id);
            
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
              <div key={h._id} style={{
                ...cardStyles.container,
                marginBottom: '0',
                position: 'relative',
                border: isCompared ? '2px solid #6366f1' : '1px solid #e5e7eb',
                boxShadow: isCompared ? '0 0 0 2px rgba(99,102,241,0.2)' : '0 2px 8px rgba(0,0,0,0.06)'
              }}>

                {/* ═══ HEADER ROW ═══ */}
                <div style={cardStyles.headerRow}>
                  <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2 }}>
                    <label style={{ 
                      display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', 
                      fontSize: '0.7rem', color: isCompared ? '#6366f1' : '#9ca3af', 
                      fontWeight: isCompared ? 'bold' : 'normal',
                      backgroundColor: isCompared ? '#eef2ff' : '#f9fafb',
                      padding: '3px 8px', borderRadius: '4px', border: isCompared ? '1px solid #6366f1' : '1px solid #e5e7eb'
                    }}>
                      <input type="checkbox" checked={isCompared} onChange={() => toggleCompare(h._id)} style={{ transform: 'scale(1.1)', accentColor: '#6366f1', cursor: 'pointer' }} />
                      {isCompared ? 'Selected' : 'Compare'}
                    </label>
                  </div>
                  <div style={{ flex: 1, marginLeft: '85px' }}>
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

                {/* 🟢 Status Bar */}
                <div style={{ ...cardStyles.statusBar, backgroundColor: isStale ? '#fef3c7' : cfg.bg, border: `1px solid ${isStale ? '#f59e0b' : cfg.color}` }}>
                  <span style={{ color: isStale ? '#92400e' : cfg.color, fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {isStale ? '⚠️ Status Unverified' : `${cfg.icon} ${cfg.label}`}
                  </span>
                  {status?.updatedAt && (
                    <span style={{ fontSize: '0.65rem', color: '#888' }}>
                      Updated: {new Date(status.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {waitTimes[h._id] && (
                    <span style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 'bold' }}>⏱️ {waitTimes[h._id]}min wait</span>
                  )}
                </div>

                {/* ═══ PRICING GRID - Balanced fonts ═══ */}
                <div style={cardStyles.pricingGrid}>
                  <div style={cardStyles.pricingLeft}>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '2px' }}>📋 OPD Fee (from)</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#10b981' }}>
                      {lowestFee ? `₹${lowestFee}` : 'N/A'}
                    </div>
                  </div>
                  <div style={cardStyles.pricingRight}>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '2px' }}>🏥 Admission/day</div>
                    <div style={{ fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>
                      {p.ipd_icu && <span style={{ color: '#3b82f6' }}>ICU ₹{p.ipd_icu}</span>}
                      {p.ipd_general_ward && <span> | General ₹{p.ipd_general_ward}</span>}
                      {p.ipd_semi_private && <span> | Semi-Pvt ₹{p.ipd_semi_private}</span>}
                      {p.ipd_private_room && <span> | Pvt ₹{p.ipd_private_room}</span>}
                    </div>
                  </div>
                </div>

                {/* ═══ BEDS + FACILITIES ROW ═══ */}
                <div style={cardStyles.bedsRow}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    🛏️ {beds.available || 0} beds | ICU: {beds.icu_available || 0} | Vent: {beds.ventilator_available || 0}
                  </span>
                  <span style={{ ...cardStyles.bedTimestampBadge, backgroundColor: bedBadge.bg, color: bedBadge.color }}>
                    {bedBadge.text}
                  </span>
                </div>

                {/* Facilities - icon row */}
                {facs.length > 0 && (
                  <div style={cardStyles.facilitiesRow}>
                    {facs.slice(0, 5).map((f, i) => {
                      const name = typeof f === 'string' ? f : (f.name || '');
                      const icon = name.toLowerCase().includes('mri') ? '🔬' : name.toLowerCase().includes('ct') ? '🩻' : name.toLowerCase().includes('cath') ? '❤️' : name.toLowerCase().includes('x-ray') ? '🦴' : name.toLowerCase().includes('lab') ? '🧪' : name.toLowerCase().includes('pharmacy') ? '💊' : name.toLowerCase().includes('parking') ? '🅿️' : '✅';
                      return <span key={i} style={cardStyles.facilityIcon}>{icon} {name}</span>;
                    })}
                    {facs.length > 5 && <span style={{ fontSize: '0.75rem', color: '#3b82f6', cursor: 'pointer' }} onClick={() => navigate(`/hospital-info/${h._id}`)}>+{facs.length - 5} more</span>}
                  </div>
                )}

                {/* ═══ LAB TESTS ROW ═══ */}
                <div style={cardStyles.section}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>🧪 Lab:</span>
                  {h.lab_tests_available ? (
                    <span style={{ color: '#10b981', fontWeight: '600', marginLeft: '6px' }}>✅ In-house</span>
                  ) : (
                    <span style={{ color: '#f59e0b', fontWeight: '600', marginLeft: '6px' }}>🔗 Partner Lab</span>
                  )}
                </div>

                {/* ═══ DOCTORS SECTION - Compact ═══ */}
                {matchingDocs.length > 0 && (
                  <div style={cardStyles.doctorSectionCompact}>
                    <button onClick={() => toggleDoctors(h._id)} style={cardStyles.doctorToggleBtn}>
                      👨‍⚕️ {matchingDocs.length} Doctor{matchingDocs.length > 1 ? 's' : ''} ({matchingDocs[0]?.specialization || 'Available'}) — from ₹{Math.min(...matchingDocs.map(d => d.consultation_fee || 0))} {showDocs ? '▲' : '▼'}
                    </button>
                    {showDocs && matchingDocs.map(doc => {
                      const slotInfo = getSlotBadge(doc.availability?.slots_available || 0);
                      const isSelected = selectedDoctor[h._id] === doc.name;
                      return (
                        <label key={doc.name} style={{ ...cardStyles.doctorCardCompact, borderColor: isSelected ? '#10b981' : '#e5e7eb', backgroundColor: isSelected ? '#f0fdf4' : '#fff' }}>
                          <input type="radio" name={`doc_${h._id}`} checked={isSelected} onChange={() => setSelectedDoctor(prev => ({ ...prev, [h._id]: doc.name }))} style={{ marginRight: '6px', cursor: 'pointer' }} />
                          <span style={{ flex: 1, fontWeight: isSelected ? 'bold' : 'normal', fontSize: '0.85rem' }}>{doc.name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280', marginRight: '8px' }}>⭐{doc.rating} • {doc.experience}</span>
                          <span style={{ fontWeight: 'bold', color: '#10b981', marginRight: '8px', fontSize: '0.9rem' }}>₹{doc.consultation_fee}</span>
                          <span style={{ ...cardStyles.slotBadge, backgroundColor: slotInfo.bg, color: slotInfo.color, fontSize: '0.65rem' }}>{slotInfo.dot} {slotInfo.text}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

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

                {/* ═══ INSURANCE ROW ═══ */}
                {insList.length > 0 && (
                  <div style={cardStyles.section}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>🛡️ Insurance:</span>
                    <div style={{ ...cardStyles.pillRow, marginLeft: '6px' }}>
                      {(showIns ? insList : insList.slice(0, 3)).map((ins, i) => (
                        <span key={i} style={cardStyles.insurancePill}>{ins}</span>
                      ))}
                      {insList.length > 3 && (
                        <button onClick={() => toggleInsurance(h._id)} style={cardStyles.expandPillBtn}>
                          {showIns ? '▲ Less' : `▼ +${insList.length - 3} more`}
                        </button>
                      )}
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                      {h.cashless_available && <span style={{ color: '#10b981' }}>💳 Cashless: Yes</span>}
                      {h.tpa_desk_available && <span style={{ color: '#3b82f6', marginLeft: '12px' }}>🏧 TPA: Yes</span>}
                    </div>
                  </div>
                )}

                {/* 🟢 Ratings - only if has real data */}
                {h.ratings?.breakdown && hasRatings(h.ratings.breakdown) && (
                  <div style={cardStyles.ratingsBreakdown}>
                    <span style={{ fontWeight: 'bold', color: '#374151' }}>⭐ Rating:</span>
                    <span>👨‍⚕️ {h.ratings.breakdown.doctor_communication || h.ratings.breakdown.doctor || 'N/A'}</span>
                    <span>👥 {h.ratings.breakdown.staff_behavior || h.ratings.breakdown.staff || 'N/A'}</span>
                    <span>🧹 {h.ratings.breakdown.cleanliness || h.ratings.breakdown.clean || 'N/A'}</span>
                    <span>⏱️ {h.ratings.breakdown.wait_time || h.ratings.breakdown.wait || 'N/A'}</span>
                    <span>💰 {h.ratings.breakdown.value_for_money || h.ratings.breakdown.value || 'N/A'}</span>
                  </div>
                )}

                {/* 🟢 Featured Review */}
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
                  <button onClick={() => navigate('/ambulance')} style={cardStyles.ambulanceBtn}>🚑</button>
                </div>

                {/* ═══ EMERGENCY ROW ═══ */}
                <div style={cardStyles.emergencyRow}>
                  {h.has24x7ER && <span style={cardStyles.emergencyBadge}>🚨 24/7 Emergency</span>}
                  <span style={{ fontSize: '0.8rem', color: '#374151' }}>
                    📞 {h.emergency_contact || h.contact?.phone || 'N/A'}
                  </span>
                  <a href={`tel:${h.emergency_contact || h.contact?.phone || ''}`} style={cardStyles.callNowBtn}>📞 Call</a>
                  <button onClick={() => toggleSaveHospital(h._id)} style={cardStyles.saveBtn}>
                    {isSaved ? '🔖 Saved' : '🔖 Save'}
                  </button>
                  <button onClick={() => { const m = prompt('How many minutes did you wait? (Optional - helps other patients)'); if (m && !isNaN(m)) reportWaitTime(h._id, parseInt(m)); }} style={cardStyles.reportWaitBtn}>+ Report Wait</button>
                </div>

              </div>
            );
          })}
          </div>
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
  container: { backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' },
  hospitalName: { fontSize: '1.15rem', fontWeight: 'bold', color: '#1e3a8a', margin: 0, lineHeight: 1.3 },
  accreditationRow: { display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' },
  accreditationBadge: { backgroundColor: '#e0e7ff', color: '#3730a3', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid #c7d2fe' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' },
  cashlessBadge: { backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 'bold', marginTop: '4px', display: 'inline-block' },
  locationRow: { color: '#6b7280', fontSize: '0.85rem', marginTop: '8px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' },
  statusBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', borderRadius: '8px', margin: '8px 0', flexWrap: 'wrap', gap: '6px' },
  pricingGrid: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '10px', padding: '10px 12px', backgroundColor: '#f9fafb', borderRadius: '8px' },
  pricingLeft: { flex: '1 1 35%', minWidth: '140px' },
  pricingRight: { flex: '1 1 60%', minWidth: '200px' },
  bedsRow: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '8px', padding: '6px 0' },
  bedTimestampBadge: { fontSize: '0.7rem', fontWeight: 'bold', padding: '3px 10px', borderRadius: '9999px', marginLeft: 'auto' },
  facilitiesRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #f3f4f6' },
  facilityIcon: { fontSize: '0.75rem', color: '#374151', backgroundColor: '#f3f4f6', padding: '3px 8px', borderRadius: '5px', fontWeight: '500' },
  section: { marginTop: '6px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' },
  pillRow: { display: 'inline-flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' },
  schemePill: { backgroundColor: '#f3e8ff', color: '#5b21b6', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: '600' },
  insurancePill: { backgroundColor: '#e0e7ff', color: '#1e40af', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: '600' },
  expandPillBtn: { color: '#6366f1', fontSize: '0.68rem', cursor: 'pointer', background: 'none', border: 'none', fontWeight: '600', padding: '2px 6px' },
  // Compact Doctors
  doctorSectionCompact: { marginTop: '6px', padding: '0' },
  doctorToggleBtn: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', color: '#065f46', width: '100%', textAlign: 'left' },
  doctorCardCompact: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', borderRadius: '6px', marginTop: '4px', cursor: 'pointer', border: '1px solid #e5e7eb', fontSize: '0.8rem' },
  slotBadge: { fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '9999px', display: 'inline-block' },
  ratingsBreakdown: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px', padding: '6px 0', fontSize: '0.72rem', color: '#6b7280', borderTop: '1px solid #f3f4f6' },
  featuredReview: { backgroundColor: '#fef3c7', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#92400e', marginTop: '8px', fontStyle: 'italic', borderLeft: '3px solid #f59e0b' },
  actionRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px', paddingTop: '10px', borderTop: '2px solid #f3f4f6' },
  bookOpdBtn: { padding: '8px 14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '7px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', flex: '1 1 auto', minWidth: '110px' },
  bookAdmissionBtn: { padding: '8px 14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '7px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', flex: '1 1 auto', minWidth: '110px' },
  viewDetailsBtn: { padding: '8px 14px', backgroundColor: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '7px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', flex: '1 1 auto', minWidth: '100px' },
  ambulanceBtn: { padding: '8px 10px', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b', borderRadius: '7px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' },
  emergencyRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #fee2e2', backgroundColor: '#fef2f2', padding: '8px 10px', borderRadius: '8px' },
  emergencyBadge: { backgroundColor: '#dc2626', color: 'white', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 'bold' },
  callNowBtn: { padding: '5px 12px', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b', borderRadius: '5px', fontWeight: 'bold', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'none' },
  saveBtn: { padding: '5px 12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '5px', fontSize: '0.78rem', cursor: 'pointer', marginLeft: 'auto' },
  reportWaitBtn: { fontSize: '0.65rem', color: '#6366f1', background: 'none', border: '1px dashed #6366f1', borderRadius: '5px', cursor: 'pointer', padding: '3px 8px', fontWeight: '500' },
};

export default HospitalsList;