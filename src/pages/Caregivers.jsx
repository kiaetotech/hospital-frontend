// D:\hospital-frontend\src\pages\Caregivers.jsx
// Home Care Hub — Competitive Production Build

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCaregivers, getAICaregiverMatch, getCaregiverSuggestions } from '../services/api';

const Caregivers = () => {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // State
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
    serviceType: '',
    schedule: '',
    gender: 'any',
    minRating: '',
    maxHourlyRate: '',
    language: '',
    city: ''
  });

  const ITEMS_PER_PAGE = 12;

  // ================================================================
  // AI-POWERED SEARCH
  // ================================================================
  const handleAISearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() && !location.trim() && !Object.values(filters).some(v => v && v !== 'any')) {
      fetchCaregivers(1);
      return;
    }

    setAiSearching(true);
    setLoading(true);
    setError(null);

    try {
      const response = await getAICaregiverMatch({
        careType: searchQuery || 'General Care',
        city: location || filters.city || 'Mumbai',
        serviceType: filters.serviceType || undefined,
        genderPreference: filters.gender !== 'any' ? filters.gender : undefined,
        maxBudget: filters.maxHourlyRate || undefined,
        languages: filters.language ? [filters.language] : [],
        skillsRequired: searchQuery ? searchQuery.split(',').map(s => s.trim()) : []
      });

      if (response.data.success && response.data.data?.length > 0) {
        let data = response.data.data;
        setCaregivers(data);
        setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE) || 1);
      } else {
        // Fallback to regular search
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
        ...(filters.serviceType && { serviceType: filters.serviceType }),
        ...(filters.gender !== 'any' && { gender: filters.gender }),
        ...(filters.minRating && { minRating: filters.minRating }),
        ...(filters.city && { city: filters.city }),
        ...(location && { city: location })
      };

      const response = await getCaregivers(params);

      if (response.data.success) {
        let data = response.data.data || [];

        if (filters.maxHourlyRate) {
          const max = parseInt(filters.maxHourlyRate);
          data = data.filter(c => (c.pricing?.personal?.hourly || c.pricing?.skilled?.hourly || 0) <= max);
        }
        if (filters.language) {
          data = data.filter(c => c.languages?.some(l => l.toLowerCase().includes(filters.language.toLowerCase())));
        }
        if (filters.schedule && filters.schedule !== 'any') {
          const map = { '12-hour': '12-Hour', '24-hour': '24-Hour', 'visit': 'Visit-Based', 'live-in': 'Live-In' };
          data = data.filter(c => c.serviceTypes?.includes(map[filters.schedule]));
        }

        // Sort
        if (sortBy === 'rating') data.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
        else if (sortBy === 'experience') data.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
        else if (sortBy === 'price-low') data.sort((a, b) => (a.pricing?.personal?.hourly || a.pricing?.skilled?.hourly || 999) - (b.pricing?.personal?.hourly || b.pricing?.skilled?.hourly || 999));
        else if (sortBy === 'price-high') data.sort((a, b) => (b.pricing?.personal?.hourly || b.pricing?.skilled?.hourly || 0) - (a.pricing?.personal?.hourly || a.pricing?.skilled?.hourly || 0));

        setCaregivers(data);
        setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE) || 1);
      }
    } catch (err) {
      if (err.response?.status !== 404) setError('Unable to load caregivers. Please try again.');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [filters, sortBy, location]);

  // Initial load
  useEffect(() => { fetchCaregivers(1); }, []);

  // Refetch on filter/sort change
  useEffect(() => {
    if (!initialLoad) fetchCaregivers(1);
  }, [filters.serviceType, filters.schedule, filters.gender, filters.minRating, filters.maxHourlyRate, filters.language, filters.city, sortBy]);

  // ================================================================
  // SUGGESTIONS
  // ================================================================
  const handleSearchInput = async (value) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      try {
        const res = await getCaregiverSuggestions(value);
        if (res.data.success) { setSuggestions(res.data.data || []); setShowSuggestions(true); }
      } catch { setSuggestions([]); }
    } else { setSuggestions([]); setShowSuggestions(false); }
  };

  const handleSuggestionClick = (s) => {
    const val = s.text || s.label;
    if (s.type === 'city') { setLocation(val); setFilters(p => ({ ...p, city: val })); }
    else { setSearchQuery(val); }
    setShowSuggestions(false);
    handleAISearch();
  };

  // ================================================================
  // HELPERS
  // ================================================================
  const handleFilter = (key, value) => setFilters(p => ({ ...p, [key]: value }));
  const resetFilters = () => {
    setFilters({ serviceType: '', schedule: '', gender: 'any', minRating: '', maxHourlyRate: '', language: '', city: '' });
    setSearchQuery(''); setLocation(''); setSortBy('relevance');
  };

  const getInitials = (n) => n?.split(' ').map(w => w[0]).join('').toUpperCase() || 'CG';
  const getStars = (r) => '★'.repeat(Math.floor(r || 0)) + '☆'.repeat(5 - Math.floor(r || 0));
  const getRate = (c) => c.pricing?.personal?.hourly || c.pricing?.skilled?.hourly || 'N/A';
  const paginated = caregivers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const activeFilters = Object.values(filters).filter(v => v && v !== 'any').length + (location ? 1 : 0);

  // ================================================================
  // SHARED STYLES
  // ================================================================
  const s = {
    pill: (active) => ({
      padding: '8px 16px', borderRadius: '24px', border: active ? '2px solid #3b82f6' : '1px solid #e2e8f0',
      background: active ? '#eff6ff' : 'white', color: active ? '#1e40af' : '#475569',
      fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
      display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s'
    }),
    selectPill: {
      padding: '9px 16px', borderRadius: '24px', border: '1px solid #e2e8f0', background: 'white',
      fontSize: '13px', color: '#475569', fontWeight: '600', outline: 'none', cursor: 'pointer', minWidth: '90px'
    },
    inputPill: {
      padding: '9px 16px', borderRadius: '24px', border: '1px solid #e2e8f0', background: 'white',
      fontSize: '13px', color: '#475569', fontWeight: '500', outline: 'none', width: '85px'
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      {/* ================================================================
          HERO — Compact, AI-Powered
      ================================================================ */}
      <section style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 100%)', padding: '28px 20px 36px', textAlign: 'center', color: 'white' }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.3px' }}>
              Find a Trusted Caregiver for Your Family
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '18px' }}>
              AI-powered matching with verified, background-checked professionals
            </p>

            {/* AI Search Bar */}
            <form onSubmit={handleAISearch} style={{ maxWidth: '650px', margin: '0 auto 12px' }}>
              <div style={{ display: 'flex', background: 'white', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.25)', position: 'relative' }}>
                <div ref={searchRef} style={{ flex: 2, display: 'flex', alignItems: 'center', paddingLeft: '18px' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>🔍</span>
                  <input type="text" value={searchQuery} onChange={(e) => handleSearchInput(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAISearch(e)}
                    placeholder="Search symptoms, skills, or condition..."
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
                    onKeyDown={(e) => e.key === 'Enter' && handleAISearch(e)}
                    placeholder="City" style={{ width: '100%', padding: '13px 8px', border: 'none', outline: 'none', fontSize: '14px', color: '#1e293b', background: 'transparent' }} />
                </div>
                <button type="submit" disabled={aiSearching}
                  style={{ padding: '13px 24px', background: aiSearching ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', border: 'none', cursor: aiSearching ? 'wait' : 'pointer', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                  {aiSearching ? '⏳ ...' : '🤖 AI Search'}
                </button>
              </div>
            </form>

            {/* Quick Stats */}
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

      {/* ================================================================
          FILTERS — Pill Style with Search Button
      ================================================================ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Service Type */}
          <select value={filters.serviceType} onChange={(e) => handleFilter('serviceType', e.target.value)} style={s.selectPill}>
            <option value="">🩺 All Types</option>
            <option value="personal">Personal Care</option>
            <option value="skilled">Skilled Nursing</option>
          </select>

          {/* Schedule */}
          <select value={filters.schedule} onChange={(e) => handleFilter('schedule', e.target.value)} style={s.selectPill}>
            <option value="">⏰ Any Schedule</option>
            <option value="12-hour">12-Hour</option>
            <option value="24-hour">24-Hour</option>
            <option value="visit">Visit</option>
            <option value="live-in">Live-In</option>
          </select>

          {/* Gender */}
          <select value={filters.gender} onChange={(e) => handleFilter('gender', e.target.value)} style={{ ...s.selectPill, minWidth: '80px' }}>
            <option value="any">⚤ Any</option>
            <option value="male">♂ Male</option>
            <option value="female">♀ Female</option>
          </select>

          {/* Rating */}
          <select value={filters.minRating} onChange={(e) => handleFilter('minRating', e.target.value)} style={{ ...s.selectPill, minWidth: '80px' }}>
            <option value="">⭐ Any</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
          </select>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '0 12px', background: 'white' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>₹</span>
            <input type="number" placeholder="Max/hr" value={filters.maxHourlyRate} onChange={(e) => handleFilter('maxHourlyRate', e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '13px', fontWeight: '600', color: '#475569', width: '65px', padding: '9px 4px', background: 'transparent' }} />
          </div>

          {/* Language */}
          <select value={filters.language} onChange={(e) => handleFilter('language', e.target.value)} style={s.selectPill}>
            <option value="">🗣 Any Language</option>
            <option value="hindi">Hindi</option>
            <option value="english">English</option>
            <option value="tamil">Tamil</option>
            <option value="telugu">Telugu</option>
            <option value="bengali">Bengali</option>
            <option value="marathi">Marathi</option>
          </select>

          {/* City */}
          <input type="text" placeholder="📍 City" value={filters.city} onChange={(e) => handleFilter('city', e.target.value)}
            style={{ ...s.inputPill, width: '80px' }} />

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Active filter count + Reset */}
          {activeFilters > 0 && (
            <button onClick={resetFilters}
              style={{ padding: '8px 14px', borderRadius: '24px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              ✕ Clear ({activeFilters})
            </button>
          )}

          {/* SEARCH BUTTON */}
          <button onClick={handleAISearch} disabled={aiSearching}
            style={{
              padding: '9px 20px', borderRadius: '24px', border: 'none',
              background: aiSearching ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: 'white', fontWeight: '700', fontSize: '13px', cursor: aiSearching ? 'wait' : 'pointer',
              whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
            }}>
            {aiSearching ? '⏳' : '🔍'} Search
          </button>
        </div>
      </section>

      {/* ================================================================
          RESULTS
      ================================================================ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px', margin: 0 }}>
            {loading ? 'Searching...' : `${caregivers.length} Caregiver${caregivers.length !== 1 ? 's' : ''} Found`}
          </p>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={s.selectPill}>
            <option value="relevance">Sort: Relevance</option>
            <option value="rating">Rating ↑</option>
            <option value="experience">Experience ↑</option>
            <option value="price-low">Price ↓</option>
            <option value="price-high">Price ↑</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
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
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '48px', background: 'white', borderRadius: '14px', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>⚠️</div>
            <p style={{ color: '#dc2626', fontWeight: '600', marginBottom: '12px' }}>{error}</p>
            <button onClick={() => fetchCaregivers(1)} style={{ padding: '10px 24px', borderRadius: '24px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Try Again</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && caregivers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', background: 'white', borderRadius: '14px', border: '2px dashed #e2e8f0' }}>
            <div style={{ fontSize: '44px', marginBottom: '8px' }}>🏠</div>
            <h3 style={{ color: '#1e293b', fontWeight: '700', marginBottom: '4px', fontSize: '18px' }}>No Caregivers Found</h3>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Try different filters or check back soon.</p>
            <button onClick={resetFilters} style={{ padding: '10px 24px', borderRadius: '24px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Reset Filters</button>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && caregivers.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '14px' }}>
              {paginated.map(c => {
                const rate = getRate(c);
                return (
                  <motion.div key={c._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'white', borderRadius: '14px', padding: '18px', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {/* Avatar */}
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '18px', flexShrink: 0, position: 'relative' }}>
                        {c.photo && c.photo.includes('http') && !c.photo.includes('placehold') 
                          ? <img src={c.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          : getInitials(c.fullName)}
                        {c.isVerified && <span style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '18px', height: '18px', borderRadius: '50%', background: '#10b981', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'white' }}>✓</span>}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{c.fullName}</h3>
                          {c.serviceType === 'personal' && <span style={{ padding: '1px 6px', background: '#dbeafe', color: '#1e40af', borderRadius: '8px', fontSize: '9px', fontWeight: '600' }}>Personal</span>}
                          {c.serviceType === 'skilled' && <span style={{ padding: '1px 6px', background: '#fce7f3', color: '#9d174d', borderRadius: '8px', fontSize: '9px', fontWeight: '600' }}>Skilled</span>}
                        </div>

                        {/* Rating */}
                        <div style={{ fontSize: '12px', color: '#f59e0b', marginBottom: '4px' }}>
                          {getStars(c.ratings?.average || 0)}
                          <span style={{ color: '#64748b', fontWeight: '500', marginLeft: '4px' }}>
                            {(c.ratings?.average || 0).toFixed(1)} ({c.ratings?.count || 0}) • {c.experienceYears}y
                          </span>
                        </div>

                        {/* Skills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                          {c.specializations?.slice(0, 3).map((sk, i) => (
                            <span key={i} style={{ padding: '2px 8px', background: '#f8fafc', color: '#475569', borderRadius: '8px', fontSize: '11px', fontWeight: '500', border: '1px solid #f1f5f9' }}>{sk}</span>
                          ))}
                          {c.specializations?.length > 3 && <span style={{ fontSize: '11px', color: '#94a3b8', padding: '2px 4px' }}>+{c.specializations.length - 3}</span>}
                        </div>

                        {/* Bottom Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>📍 {c.location?.city || 'N/A'}{c.distance ? ` • ${c.distance}km` : ''}</span>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '18px', fontWeight: '800', color: '#059669' }}>₹{rate}</span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>/hr</span>
                          </div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/caregiver-profile/${c._id}`, { state: { caregiver: c } }); }}
                            style={{ flex: 1, padding: '7px', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1e40af', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>Profile</button>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/book-caregiver/${c._id}`, { state: { caregiver: c } }); }}
                            style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>Book Now</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '28px' }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  style={{ padding: '8px 20px', borderRadius: '24px', border: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', background: currentPage === 1 ? '#e2e8f0' : '#3b82f6', color: currentPage === 1 ? '#94a3b8' : 'white', fontWeight: '700', fontSize: '13px' }}>← Prev</button>
                <span style={{ color: '#475569', fontWeight: '600', fontSize: '13px' }}>{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  style={{ padding: '8px 20px', borderRadius: '24px', border: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', background: currentPage === totalPages ? '#e2e8f0' : '#3b82f6', color: currentPage === totalPages ? '#94a3b8' : 'white', fontWeight: '700', fontSize: '13px' }}>Next →</button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ================================================================
          TRUST BADGES — Compact
      ================================================================ */}
      <section style={{ background: 'white', borderTop: '1px solid #f1f5f9', padding: '24px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '36px', flexWrap: 'wrap', textAlign: 'center' }}>
          {[{ i: '🛡️', t: 'Background Verified' }, { i: '🎓', t: 'Trained & Certified' }, { i: '⭐', t: 'Rated by Families' }, { i: '📞', t: '24/7 Support' }].map((b, i) => (
            <div key={i}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{b.i}</div>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>{b.t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          CAREGIVER CTA — Compact
      ================================================================ */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a8a, #312e81)', padding: '24px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>👨‍⚕️ Are You a Caregiver?</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/caregiver/register" style={{ padding: '10px 20px', borderRadius: '24px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', textDecoration: 'none', fontWeight: '700', fontSize: '13px' }}>Register</Link>
            <Link to="/caregiver/login" style={{ padding: '10px 20px', borderRadius: '24px', background: 'rgba(255,255,255,0.15)', color: 'white', textDecoration: 'none', fontWeight: '700', fontSize: '13px', border: '1.5px solid rgba(255,255,255,0.3)' }}>Login</Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          DISCLAIMER
      ================================================================ */}
      <section style={{ padding: '16px 20px', textAlign: 'center', background: '#f8fafc' }}>
        <p style={{ color: '#94a3b8', fontSize: '11px', maxWidth: '650px', margin: '0 auto', lineHeight: 1.5 }}>
          ⚠️ We connect patients with independent caregivers. We don't employ caregivers or store health data. Commission earned on bookings.
        </p>
      </section>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
};

export default Caregivers;