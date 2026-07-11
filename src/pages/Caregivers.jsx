// D:\hospital-frontend\src\pages\Caregivers.jsx
// Home Care Hub — Production Ready

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCaregivers, getAICaregiverMatch, getCaregiverSuggestions } from '../services/api';

const Caregivers = () => {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAIMatch, setShowAIMatch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  const [aiSearching, setAiSearching] = useState(false);

  const [filters, setFilters] = useState({
    careCategory: '',
    schedule: '',
    gender: 'any',
    minExperience: '',
    minRating: '',
    maxHourlyRate: '',
    language: '',
    city: ''
  });

  const ITEMS_PER_PAGE = 12;

  // ================================================================
  // ALL CARE TYPES
  // ================================================================
  const careTypes = [
    { value: 'elderly', label: '👴 Elderly Care', category: 'personal' },
    { value: 'child', label: '👶 Child Care', category: 'personal' },
    { value: 'post-surgery', label: '🏥 Post-Surgery', category: 'personal' },
    { value: 'disability', label: '♿ Disability Support', category: 'personal' },
    { value: 'dementia', label: '🧠 Dementia Care', category: 'personal' },
    { value: 'palliative', label: '🙏 Palliative Care', category: 'personal' },
    { value: 'injection', label: '💉 Injections & IV', category: 'skilled' },
    { value: 'wound', label: '🩹 Wound Care', category: 'skilled' },
    { value: 'tracheostomy', label: '🫁 Tracheostomy', category: 'skilled' },
    { value: 'diabetes', label: '🩸 Diabetes Management', category: 'skilled' },
    { value: 'physio', label: '🦵 Physiotherapy', category: 'skilled' },
    { value: 'catheter', label: '🏥 Catheter Care', category: 'skilled' },
    { value: 'ventilator', label: '💨 Ventilator Care', category: 'skilled' },
    { value: 'bed-sore', label: '🛏️ Bed Sore Management', category: 'skilled' },
    { value: 'general', label: '🏠 General Home Care', category: 'personal' }
  ];

  const scheduleTypes = [
    { value: '', label: '⏰ Any Schedule' },
    { value: '12-hour', label: '🕐 12-Hour (Day/Night)' },
    { value: '24-hour', label: '🕛 24-Hour (Full Day)' },
    { value: 'visit', label: '🏠 Visit-Based (2-4 hrs)' },
    { value: 'live-in', label: '🏡 Live-In (Monthly)' }
  ];

  const experienceLevels = [
    { value: '', label: '📅 Any Experience' },
    { value: '1', label: '1+ Year' },
    { value: '3', label: '3+ Years' },
    { value: '5', label: '5+ Years' },
    { value: '10', label: '10+ Years' }
  ];

  const ratingOptions = [
    { value: '', label: '⭐ Any Rating' },
    { value: '4', label: '⭐ 4.0 & Above' },
    { value: '4.5', label: '⭐ 4.5 & Above' }
  ];

  const languageOptions = [
    { value: '', label: '🗣 Any Language' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'english', label: 'English' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'bengali', label: 'Bengali' },
    { value: 'marathi', label: 'Marathi' },
    { value: 'gujarati', label: 'Gujarati' },
    { value: 'malayalam', label: 'Malayalam' },
    { value: 'kannada', label: 'Kannada' }
  ];

  // ================================================================
  // AI-POWERED SEARCH
  // ================================================================
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    setAiSearching(true);
    setLoading(true);
    setError(null);

    try {
      const matchedType = careTypes.find(t => 
        searchQuery.toLowerCase().includes(t.label.toLowerCase()) ||
        t.value.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const response = await getAICaregiverMatch({
        careType: matchedType?.label || searchQuery || 'General Home Care',
        city: location || filters.city || 'Mumbai',
        serviceType: matchedType?.category || undefined,
        genderPreference: filters.gender !== 'any' ? filters.gender : undefined,
        maxBudget: filters.maxHourlyRate || undefined,
        languages: filters.language ? [filters.language] : [],
        skillsRequired: searchQuery ? searchQuery.split(/[, ]+/).filter(s => s.length > 2) : [],
        experienceMin: filters.minExperience ? parseInt(filters.minExperience) : 0,
        ratingMin: filters.minRating ? parseFloat(filters.minRating) : 0
      });

      if (response.data.success && response.data.data?.length > 0) {
        let data = response.data.data;
        if (filters.schedule) {
          const map = { '12-hour': '12-Hour', '24-hour': '24-Hour', 'visit': 'Visit-Based', 'live-in': 'Live-In' };
          data = data.filter(c => c.serviceTypes?.includes(map[filters.schedule]));
        }
        applySorting(data);
      } else {
        fetchCaregivers(1);
      }
    } catch (err) {
      fetchCaregivers(1);
    } finally {
      setLoading(false);
      setAiSearching(false);
    }
  };

  // ================================================================
  // REGULAR FETCH
  // ================================================================
  const fetchCaregivers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page, limit: ITEMS_PER_PAGE,
        ...(filters.gender !== 'any' && { gender: filters.gender }),
        ...(filters.minExperience && { minExperience: filters.minExperience }),
        ...(filters.minRating && { minRating: filters.minRating }),
        ...(filters.city && { city: filters.city }),
        ...(location && !filters.city && { city: location }),
        ...(filters.careCategory && { serviceType: careTypes.find(t => t.value === filters.careCategory)?.category })
      };

      const response = await getCaregivers(params);

      if (response.data.success) {
        let data = response.data.data || [];

        // Category filter
        if (filters.careCategory) {
          const categorySkills = careTypes.find(t => t.value === filters.careCategory)?.label.toLowerCase() || '';
          data = data.filter(c => 
            c.specializations?.some(s => s.toLowerCase().includes(categorySkills.split(' ')[1] || categorySkills)) ||
            c.specializations?.some(s => filters.careCategory.includes(s.toLowerCase().replace(/\s/g, '-')))
          );
        }

        // Price filter
        if (filters.maxHourlyRate) {
          const max = parseInt(filters.maxHourlyRate);
          data = data.filter(c => (c.pricing?.personal?.hourly || c.pricing?.skilled?.hourly || 99999) <= max);
        }

        // Language filter
        if (filters.language) {
          data = data.filter(c => c.languages?.some(l => l.toLowerCase().includes(filters.language.toLowerCase())));
        }

        // Schedule filter
        if (filters.schedule) {
          const map = { '12-hour': '12-Hour', '24-hour': '24-Hour', 'visit': 'Visit-Based', 'live-in': 'Live-In' };
          data = data.filter(c => c.serviceTypes?.includes(map[filters.schedule]));
        }

        applySorting(data);
      }
    } catch (err) {
      if (err.response?.status !== 404) setError('Unable to load caregivers. Please try again.');
      setCaregivers([]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [filters, sortBy, location]);

  const applySorting = (data) => {
    let sorted = [...data];
    if (sortBy === 'rating') sorted.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
    else if (sortBy === 'experience') sorted.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
    else if (sortBy === 'price-low') sorted.sort((a, b) => (a.pricing?.personal?.hourly || a.pricing?.skilled?.hourly || 999) - (b.pricing?.personal?.hourly || b.pricing?.skilled?.hourly || 999));
    else if (sortBy === 'price-high') sorted.sort((a, b) => (b.pricing?.personal?.hourly || b.pricing?.skilled?.hourly || 0) - (a.pricing?.personal?.hourly || a.pricing?.skilled?.hourly || 0));
    setCaregivers(sorted);
    setTotalPages(Math.ceil(sorted.length / ITEMS_PER_PAGE) || 1);
  };

  // Initial load
  useEffect(() => { fetchCaregivers(1); }, []);

  // Refetch on filter change
  useEffect(() => {
    if (!initialLoad) fetchCaregivers(1);
  }, [filters.careCategory, filters.schedule, filters.gender, filters.minExperience, filters.minRating, filters.maxHourlyRate, filters.language, filters.city, sortBy]);

  // ================================================================
  // SUGGESTIONS
  // ================================================================
  const handleSearchInput = async (value) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      try {
        const res = await getCaregiverSuggestions(value);
        if (res.data.success) { setSuggestions(res.data.data || []); setShowSuggestions(true); }
      } catch { 
        const filtered = careTypes.filter(t => t.label.toLowerCase().includes(value.toLowerCase())).slice(0, 6);
        setSuggestions(filtered.map(t => ({ type: 'skill', text: t.label })));
        setShowSuggestions(filtered.length > 0);
      }
    } else { setSuggestions([]); setShowSuggestions(false); }
  };

  const handleSuggestionClick = (s) => {
    const val = s.text || s.label;
    if (s.type === 'city') { setLocation(val); setFilters(p => ({ ...p, city: val })); }
    else { setSearchQuery(val); }
    setShowSuggestions(false);
  };

  // ================================================================
  // HELPERS
  // ================================================================
  const handleFilter = (key, value) => setFilters(p => ({ ...p, [key]: value }));
  
  const resetFilters = () => {
    setFilters({ careCategory: '', schedule: '', gender: 'any', minExperience: '', minRating: '', maxHourlyRate: '', language: '', city: '' });
    setSearchQuery(''); setLocation(''); setSortBy('relevance');
  };

  const getInitials = (n) => n?.split(' ').map(w => w[0]).join('').toUpperCase() || 'CG';
  const getStars = (r) => '★'.repeat(Math.floor(r || 0)) + '☆'.repeat(5 - Math.floor(r || 0));
  const getRate = (c) => c.pricing?.personal?.hourly || c.pricing?.skilled?.hourly || 'N/A';
  const paginated = caregivers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const activeFilters = Object.values(filters).filter(v => v && v !== 'any').length + (location ? 1 : 0);

  // ================================================================
  // RENDER
  // ================================================================
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 100%)', padding: '32px 20px 40px', textAlign: 'center', color: 'white' }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.3px' }}>
              Find a Trusted Caregiver for Your Family
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '18px' }}>
              AI-powered matching with verified, background-checked professionals
            </p>

            <form onSubmit={handleSearch} style={{ maxWidth: '650px', margin: '0 auto 12px' }}>
              <div style={{ display: 'flex', background: 'white', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.25)', position: 'relative' }}>
                <div ref={searchRef} style={{ flex: 2, display: 'flex', alignItems: 'center', paddingLeft: '18px' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>🔍</span>
                  <input type="text" value={searchQuery} onChange={(e) => handleSearchInput(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                    placeholder="Search condition, skill, or caregiver type..."
                    style={{ width: '100%', padding: '13px 10px', border: 'none', outline: 'none', fontSize: '14px', color: '#1e293b', background: 'transparent' }} />
                  
                  {showSuggestions && suggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '0 0 20px 20px', boxShadow: '0 12px 30px rgba(0,0,0,0.12)', zIndex: 100, textAlign: 'left', overflow: 'hidden' }}>
                      {suggestions.map((sug, i) => (
                        <div key={i} onMouseDown={() => handleSuggestionClick(sug)}
                          style={{ padding: '11px 18px', cursor: 'pointer', fontSize: '13px', color: '#334155', borderBottom: i < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                          {sug.type === 'city' ? '📍' : '🎯'} {sug.text || sug.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ width: '1px', background: '#e2e8f0', margin: '8px 0' }} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '10px' }}>
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>📍</span>
                  <input type="text" value={location} onChange={(e) => { setLocation(e.target.value); setFilters(p => ({ ...p, city: e.target.value })); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                    placeholder="City" style={{ width: '100%', padding: '13px 8px', border: 'none', outline: 'none', fontSize: '14px', color: '#1e293b', background: 'transparent' }} />
                </div>
                <button type="submit" disabled={aiSearching}
                  style={{ padding: '13px 24px', background: aiSearching ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', border: 'none', cursor: aiSearching ? 'wait' : 'pointer', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                  {aiSearching ? '⏳' : '🤖'} AI Search
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', marginTop: '14px' }}>
              {[{ v: '200+', l: 'Verified' }, { v: '50+', l: 'Cities' }, { v: '4.8★', l: 'Rating' }].map((st, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{st.v}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>{st.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FILTERS BAR */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', background: 'white', borderRadius: '16px', padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
          
          <span style={{ fontWeight: '700', fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap' }}>Filters</span>

          {/* Care Type */}
          <select value={filters.careCategory} onChange={(e) => handleFilter('careCategory', e.target.value)}
            style={selectStyle}>
            <option value="">🩺 All Care Types</option>
            <optgroup label="── Personal Care ──">
              {careTypes.filter(t => t.category === 'personal').map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </optgroup>
            <optgroup label="── Skilled Nursing ──">
              {careTypes.filter(t => t.category === 'skilled').map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </optgroup>
          </select>

          {/* Schedule */}
          <select value={filters.schedule} onChange={(e) => handleFilter('schedule', e.target.value)} style={selectStyle}>
            {scheduleTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          {/* Gender */}
          <select value={filters.gender} onChange={(e) => handleFilter('gender', e.target.value)} style={{ ...selectStyle, minWidth: '100px' }}>
            <option value="any">⚤ Any Gender</option>
            <option value="male">♂ Male</option>
            <option value="female">♀ Female</option>
          </select>

          {/* Experience */}
          <select value={filters.minExperience} onChange={(e) => handleFilter('minExperience', e.target.value)} style={selectStyle}>
            {experienceLevels.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          {/* Rating */}
          <select value={filters.minRating} onChange={(e) => handleFilter('minRating', e.target.value)} style={{ ...selectStyle, minWidth: '90px' }}>
            {ratingOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          {/* Price */}
          <div style={pillBoxStyle}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>₹</span>
            <input type="number" placeholder="Max/hr" value={filters.maxHourlyRate} onChange={(e) => handleFilter('maxHourlyRate', e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '13px', fontWeight: '600', color: '#475569', width: '65px', padding: '8px 4px', background: 'transparent' }} />
          </div>

          {/* Language */}
          <select value={filters.language} onChange={(e) => handleFilter('language', e.target.value)} style={selectStyle}>
            {languageOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          {/* City */}
          <input type="text" placeholder="📍 City" value={filters.city} onChange={(e) => handleFilter('city', e.target.value)}
            style={{ ...inputPillStyle, width: '85px' }} />

          <div style={{ flex: 1 }} />

          {activeFilters > 0 && (
            <button onClick={resetFilters} style={resetBtnStyle}>
              ✕ Clear ({activeFilters})
            </button>
          )}

          <button onClick={handleSearch} disabled={aiSearching}
            style={searchBtnStyle}>
            {aiSearching ? '⏳' : '🔍'} Search
          </button>
        </div>
      </section>

      {/* RESULTS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px', margin: 0 }}>
            {loading ? 'Searching...' : `${caregivers.length} Caregiver${caregivers.length !== 1 ? 's' : ''} Found`}
          </p>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectStyle}>
            <option value="relevance">Sort: Relevance</option>
            <option value="rating">⭐ Rating ↑</option>
            <option value="experience">📅 Experience ↑</option>
            <option value="price-low">💰 Price ↓</option>
            <option value="price-high">💰 Price ↑</option>
          </select>
        </div>

        {loading && <SkeletonGrid />}

        {!loading && error && <ErrorState message={error} onRetry={() => fetchCaregivers(1)} />}

        {!loading && !error && caregivers.length === 0 && <EmptyState onReset={resetFilters} />}

        {!loading && !error && caregivers.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '14px' }}>
              {paginated.map(c => (
                <CaregiverCard key={c._id} caregiver={c} getInitials={getInitials} getStars={getStars} getRate={getRate}
                  onProfile={() => navigate(`/caregiver-profile/${c._id}`, { state: { caregiver: c } })}
                  onBook={() => navigate(`/book-caregiver/${c._id}`, { state: { caregiver: c } })} />
              ))}
            </div>

            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
          </>
        )}
      </section>

      {/* TRUST BADGES */}
      <section style={{ background: 'white', borderTop: '1px solid #f1f5f9', padding: '24px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '36px', flexWrap: 'wrap', textAlign: 'center' }}>
          {[{ i: '🛡️', t: 'Background Verified' }, { i: '🎓', t: 'Trained & Certified' }, { i: '⭐', t: 'Rated by Families' }, { i: '📞', t: '24/7 Support' }].map((b, i) => (
            <div key={i}><div style={{ fontSize: '24px', marginBottom: '4px' }}>{b.i}</div><div style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>{b.t}</div></div>
          ))}
        </div>
      </section>

      {/* CAREGIVER CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a8a, #312e81)', padding: '24px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>👨‍⚕️ Are You a Caregiver?</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/caregiver/register" style={{ padding: '10px 20px', borderRadius: '24px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', textDecoration: 'none', fontWeight: '700', fontSize: '13px' }}>Register</Link>
            <Link to="/caregiver/login" style={{ padding: '10px 20px', borderRadius: '24px', background: 'rgba(255,255,255,0.15)', color: 'white', textDecoration: 'none', fontWeight: '700', fontSize: '13px', border: '1.5px solid rgba(255,255,255,0.3)' }}>Login</Link>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section style={{ padding: '16px 20px', textAlign: 'center', background: '#f8fafc' }}>
        <p style={{ color: '#94a3b8', fontSize: '11px', maxWidth: '650px', margin: '0 auto', lineHeight: 1.5 }}>
          ⚠️ We connect patients with independent caregivers. We don't employ caregivers or store health data. Commission earned on bookings.
        </p>
      </section>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
};

// ================================================================
// COMPONENTS
// ================================================================

const CaregiverCard = ({ caregiver: c, getInitials, getStars, getRate, onProfile, onBook }) => (
  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
    style={{ background: 'white', borderRadius: '14px', padding: '18px', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s' }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '18px', flexShrink: 0, position: 'relative' }}>
        {c.photo && c.photo.includes('http') && !c.photo.includes('placehold') 
          ? <img src={c.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          : getInitials(c.fullName)}
        {c.isVerified && <span style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '18px', height: '18px', borderRadius: '50%', background: '#10b981', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'white' }}>✓</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{c.fullName}</h3>
          {c.serviceType === 'personal' && <span style={{ padding: '1px 6px', background: '#dbeafe', color: '#1e40af', borderRadius: '8px', fontSize: '9px', fontWeight: '600' }}>Personal</span>}
          {c.serviceType === 'skilled' && <span style={{ padding: '1px 6px', background: '#fce7f3', color: '#9d174d', borderRadius: '8px', fontSize: '9px', fontWeight: '600' }}>Skilled</span>}
        </div>
        <div style={{ fontSize: '12px', color: '#f59e0b', marginBottom: '4px' }}>
          {getStars(c.ratings?.average || 0)}
          <span style={{ color: '#64748b', fontWeight: '500', marginLeft: '4px' }}>{(c.ratings?.average || 0).toFixed(1)} ({c.ratings?.count || 0}) • {c.experienceYears}y</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
          {c.specializations?.slice(0, 3).map((sk, i) => (
            <span key={i} style={{ padding: '2px 8px', background: '#f8fafc', color: '#475569', borderRadius: '8px', fontSize: '11px', fontWeight: '500', border: '1px solid #f1f5f9' }}>{sk}</span>
          ))}
          {c.specializations?.length > 3 && <span style={{ fontSize: '11px', color: '#94a3b8', padding: '2px 4px' }}>+{c.specializations.length - 3}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>📍 {c.location?.city || 'N/A'}{c.distance ? ` • ${c.distance}km` : ''}</span>
          <div style={{ textAlign: 'right' }}><span style={{ fontSize: '18px', fontWeight: '800', color: '#059669' }}>₹{getRate(c)}</span><span style={{ fontSize: '11px', color: '#64748b' }}>/hr</span></div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button onClick={(e) => { e.stopPropagation(); onProfile(); }} style={btnOutlineStyle}>Profile</button>
          <button onClick={(e) => { e.stopPropagation(); onBook(); }} style={btnGreenStyle}>Book Now</button>
        </div>
      </div>
    </div>
  </motion.div>
);

const SkeletonGrid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '20px', animation: 'pulse 1.5s infinite' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e2e8f0', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: '16px', background: '#e2e8f0', borderRadius: '6px', width: '50%', marginBottom: '8px' }} />
            <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '6px', width: '35%' }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div style={{ textAlign: 'center', padding: '48px', background: 'white', borderRadius: '14px', border: '1px solid #fecaca' }}>
    <div style={{ fontSize: '40px', marginBottom: '8px' }}>⚠️</div>
    <p style={{ color: '#dc2626', fontWeight: '600', marginBottom: '12px' }}>{message}</p>
    <button onClick={onRetry} style={{ padding: '10px 24px', borderRadius: '24px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Try Again</button>
  </div>
);

const EmptyState = ({ onReset }) => (
  <div style={{ textAlign: 'center', padding: '48px', background: 'white', borderRadius: '14px', border: '2px dashed #e2e8f0' }}>
    <div style={{ fontSize: '44px', marginBottom: '8px' }}>🏠</div>
    <h3 style={{ color: '#1e293b', fontWeight: '700', marginBottom: '4px', fontSize: '18px' }}>No Caregivers Found</h3>
    <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Try different filters or check back soon.</p>
    <button onClick={onReset} style={{ padding: '10px 24px', borderRadius: '24px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Reset Filters</button>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '28px' }}>
    <button onClick={() => onPageChange(p => Math.max(1, p - 1))} disabled={currentPage === 1}
      style={{ padding: '8px 20px', borderRadius: '24px', border: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', background: currentPage === 1 ? '#e2e8f0' : '#3b82f6', color: currentPage === 1 ? '#94a3b8' : 'white', fontWeight: '700', fontSize: '13px' }}>← Prev</button>
    <span style={{ color: '#475569', fontWeight: '600', fontSize: '13px' }}>{currentPage} / {totalPages}</span>
    <button onClick={() => onPageChange(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
      style={{ padding: '8px 20px', borderRadius: '24px', border: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', background: currentPage === totalPages ? '#e2e8f0' : '#3b82f6', color: currentPage === totalPages ? '#94a3b8' : 'white', fontWeight: '700', fontSize: '13px' }}>Next →</button>
  </div>
);

// ================================================================
// STYLES
// ================================================================
const selectStyle = {
  padding: '9px 14px', borderRadius: '22px', border: '1px solid #e2e8f0', background: 'white',
  fontSize: '13px', color: '#475569', fontWeight: '600', outline: 'none', cursor: 'pointer', minWidth: '95px', maxWidth: '200px'
};

const pillBoxStyle = {
  display: 'flex', alignItems: 'center', gap: '2px', border: '1px solid #e2e8f0', borderRadius: '22px', padding: '0 12px', background: 'white'
};

const inputPillStyle = {
  padding: '9px 14px', borderRadius: '22px', border: '1px solid #e2e8f0', background: 'white',
  fontSize: '13px', color: '#475569', fontWeight: '500', outline: 'none'
};

const resetBtnStyle = {
  padding: '8px 14px', borderRadius: '22px', border: '1px solid #fecaca', background: '#fef2f2',
  color: '#dc2626', fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap'
};

const searchBtnStyle = {
  padding: '9px 20px', borderRadius: '22px', border: 'none',
  background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', fontWeight: '700', fontSize: '13px',
  cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
};

const btnOutlineStyle = {
  flex: 1, padding: '7px', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#eff6ff',
  color: '#1e40af', fontWeight: '600', fontSize: '12px', cursor: 'pointer'
};

const btnGreenStyle = {
  flex: 1, padding: '7px', borderRadius: '8px', border: 'none',
  background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: '600', fontSize: '12px', cursor: 'pointer'
};

export default Caregivers;
