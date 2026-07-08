// D:\hospital-frontend\src\pages\Caregivers.jsx
// Home Care — Production Hub

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCaregivers, getAICaregiverMatch, getCaregiverSuggestions } from '../services/api';

const Caregivers = () => {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAIMatch, setShowAIMatch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');

  const [filters, setFilters] = useState({
    serviceType: '',
    schedule: '',
    gender: 'any',
    minExperience: '',
    minRating: '',
    maxHourlyRate: '',
    language: '',
    specializations: '',
    city: ''
  });

  const [aiMatchData, setAIMatchData] = useState({
    careType: '',
    city: '',
    serviceType: '',
    languages: '',
    genderPreference: 'any',
    maxBudget: '',
    skillsRequired: ''
  });

  const ITEMS_PER_PAGE = 12;

  const quickCategories = [
    { id: 'elderly', icon: '👴', label: 'Elderly Care', skills: 'elder care, mobility support, companionship' },
    { id: 'post-surgery', icon: '🏥', label: 'Post-Surgery', skills: 'post-surgery, wound care, medication' },
    { id: 'nursing', icon: '💉', label: 'Nursing', skills: 'wound care, injection, ventilator, tracheostomy' },
    { id: 'physio', icon: '🦵', label: 'Physiotherapy', skills: 'physiotherapy, mobility support' },
    { id: 'dementia', icon: '🧠', label: 'Dementia', skills: 'dementia, palliative, hospice' },
    { id: 'child', icon: '👶', label: 'Child Care', skills: 'newborn care, postnatal, pediatric' },
  ];

  // Fetch caregivers
  const fetchCaregivers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        ...(filters.serviceType && { serviceType: filters.serviceType }),
        ...(filters.gender !== 'any' && { gender: filters.gender }),
        ...(filters.minExperience && { minExperience: filters.minExperience }),
        ...(filters.minRating && { minRating: filters.minRating }),
        ...(filters.city && { city: filters.city })
      };

      const response = await getCaregivers(params);

      if (response.data.success) {
        let data = response.data.data || [];

        // Client-side filters
        if (filters.maxHourlyRate) {
          data = data.filter(c => {
            const rate = c.pricing?.personal?.hourly || c.pricing?.skilled?.hourly || 0;
            return rate <= parseInt(filters.maxHourlyRate);
          });
        }

        if (filters.specializations) {
          const terms = filters.specializations.toLowerCase().split(',').map(s => s.trim());
          data = data.filter(c =>
            c.specializations?.some(s => terms.some(t => s.toLowerCase().includes(t)))
          );
        }

        if (filters.language) {
          data = data.filter(c =>
            c.languages?.some(l => l.toLowerCase().includes(filters.language.toLowerCase()))
          );
        }

        if (filters.schedule && filters.schedule !== 'any') {
          const scheduleMap = {
            '12-hour': '12-Hour',
            '24-hour': '24-Hour',
            'visit': 'Visit-Based',
            'live-in': 'Live-In'
          };
          data = data.filter(c => c.serviceTypes?.includes(scheduleMap[filters.schedule]));
        }

        // Sort
        if (sortBy === 'rating') data.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
        if (sortBy === 'experience') data.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
        if (sortBy === 'price-low') {
          data.sort((a, b) => {
            const rateA = a.pricing?.personal?.hourly || a.pricing?.skilled?.hourly || 0;
            const rateB = b.pricing?.personal?.hourly || b.pricing?.skilled?.hourly || 0;
            return rateA - rateB;
          });
        }
        if (sortBy === 'price-high') {
          data.sort((a, b) => {
            const rateA = a.pricing?.personal?.hourly || a.pricing?.skilled?.hourly || 0;
            const rateB = b.pricing?.personal?.hourly || b.pricing?.skilled?.hourly || 0;
            return rateB - rateA;
          });
        }

        setCaregivers(data);
        setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE) || 1);
      }
    } catch (err) {
      setError('Unable to load caregivers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);

  // AI Match
  const handleAIMatch = async () => {
    if (!aiMatchData.careType || !aiMatchData.city) {
      alert('Please enter care type and city');
      return;
    }
    setLoading(true);
    setShowAIMatch(false);
    try {
      const response = await getAICaregiverMatch({
        careType: aiMatchData.careType,
        city: aiMatchData.city,
        serviceType: aiMatchData.serviceType || undefined,
        languages: aiMatchData.languages ? aiMatchData.languages.split(',').map(l => l.trim()) : [],
        genderPreference: aiMatchData.genderPreference !== 'any' ? aiMatchData.genderPreference : undefined,
        maxBudget: aiMatchData.maxBudget || undefined,
        skillsRequired: aiMatchData.skillsRequired ? aiMatchData.skillsRequired.split(',').map(s => s.trim()) : []
      });
      if (response.data.success) {
        setCaregivers(response.data.data || []);
        setTotalPages(1);
      }
    } catch {
      fetchCaregivers();
    } finally {
      setLoading(false);
    }
  };

  // Hero search
  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters(prev => ({
        ...prev,
        specializations: searchQuery,
        city: location || prev.city
      }));
      setCurrentPage(1);
    }
  };

  // Suggestions
  const handleSearchInput = async (value) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      try {
        const res = await getCaregiverSuggestions(value);
        if (res.data.success) {
          setSuggestions(res.data.data || []);
          setShowSuggestions(true);
        }
      } catch { setSuggestions([]); }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (s) => {
    if (s.type === 'city') {
      setLocation(s.text || s.label);
      setFilters(prev => ({ ...prev, city: s.text || s.label }));
    } else {
      setSearchQuery(s.text || s.label);
      setFilters(prev => ({
        ...prev,
        specializations: prev.specializations ? prev.specializations + ', ' + (s.text || s.label) : (s.text || s.label)
      }));
    }
    setShowSuggestions(false);
  };

  // Quick category click
  const handleCategoryClick = (cat) => {
    setFilters(prev => ({ ...prev, specializations: cat.skills }));
    setCurrentPage(1);
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  // Filter change
  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      serviceType: '', schedule: '', gender: 'any', minExperience: '',
      minRating: '', maxHourlyRate: '', language: '', specializations: '', city: ''
    });
    setSearchQuery('');
    setLocation('');
    setSortBy('relevance');
    setCurrentPage(1);
  };

  useEffect(() => { fetchCaregivers(currentPage); }, [currentPage, fetchCaregivers]);

  const getInitials = (n) => n?.split(' ').map(w => w[0]).join('').toUpperCase() || 'CG';
  const getStars = (r) => '⭐'.repeat(Math.floor(r || 0)) + '☆'.repeat(5 - Math.floor(r || 0));
  const getHourlyRate = (c) => c.pricing?.personal?.hourly || c.pricing?.skilled?.hourly || 'N/A';

  const paginatedCaregivers = caregivers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const S = {
    filterSelect: { padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', color: '#334155', background: 'white', outline: 'none', minWidth: '110px', cursor: 'pointer' },
    filterInput: { padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', color: '#334155', outline: 'none', width: '100px' },
    btnReset: { padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' },
    btnPrimary: { padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
    btnOutline: { padding: '10px 20px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
    btnGreen: { padding: '10px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ================================================================
          HERO
      ================================================================ */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', padding: '36px 20px 40px', textAlign: 'center', color: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{ display: 'inline-block', padding: '5px 16px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
              🏠 India's Trusted Home Care Platform
            </span>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '800', marginBottom: '8px' }}>
              Find a Trusted Caregiver for Your Family
            </h1>
            <p style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '20px' }}>
              AI-powered matching with verified, background-checked professionals
            </p>

            {/* Search Form */}
            <form onSubmit={handleHeroSearch} style={{ maxWidth: '650px', margin: '0 auto 12px', display: 'flex', gap: '0', background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', position: 'relative' }}>
              <div ref={searchRef} style={{ flex: 2, display: 'flex', alignItems: 'center', paddingLeft: '14px' }}>
                <span style={{ color: '#94a3b8', fontSize: '16px' }}>🔍</span>
                <input type="text" value={searchQuery} onChange={(e) => handleSearchInput(e.target.value)} onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search by skill, condition, or name..." style={{ width: '100%', padding: '13px 10px', border: 'none', outline: 'none', fontSize: '14px', color: '#1e293b', background: 'transparent' }} />
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '0 0 10px 10px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 100, textAlign: 'left' }}>
                    {suggestions.map((s, i) => (
                      <div key={i} onMouseDown={() => handleSuggestionClick(s)} style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: i < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                        {s.type === 'city' ? '📍' : '🎯'} {s.text || s.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ width: '1px', background: '#e2e8f0', margin: '8px 0' }} />
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '10px' }}>
                <span style={{ color: '#ef4444', fontSize: '14px' }}>📍</span>
                <input type="text" value={location} onChange={(e) => { setLocation(e.target.value); setFilters(prev => ({ ...prev, city: e.target.value })); }}
                  placeholder="Location" style={{ width: '100%', padding: '13px 10px', border: 'none', outline: 'none', fontSize: '14px', color: '#1e293b', background: 'transparent' }} />
              </div>
              <button type="submit" style={{ padding: '13px 24px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap' }}>🔍 Search</button>
            </form>

            <button onClick={() => setShowAIMatch(true)} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)' }}>
              🤖 AI Quick Match
            </button>

            {/* Quick Stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '16px', flexWrap: 'wrap' }}>
              {[{ v: '200+', l: 'Verified Caregivers' }, { v: '50+', l: 'Cities' }, { v: '4.8', l: 'Avg Rating' }].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800' }}>{s.v}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          QUICK CATEGORIES
      ================================================================ */}
      <section style={{ maxWidth: '1200px', margin: '-16px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {quickCategories.map(cat => (
            <div key={cat.id} onClick={() => handleCategoryClick(cat)}
              style={{ padding: '10px 18px', background: 'white', borderRadius: '20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '600', color: '#334155', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
              {cat.icon} {cat.label}
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          FILTERS BAR — Always Visible
      ================================================================ */}
      <section style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
        <div style={{ background: 'white', borderRadius: '10px', padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '600', fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap' }}>🔍 Filters:</span>

          <select value={filters.serviceType} onChange={(e) => handleFilter('serviceType', e.target.value)} style={S.filterSelect}>
            <option value="">All Care Types</option>
            <option value="personal">🩺 Personal Care</option>
            <option value="skilled">💉 Skilled Nursing</option>
          </select>

          <select value={filters.schedule} onChange={(e) => handleFilter('schedule', e.target.value)} style={S.filterSelect}>
            <option value="">Any Schedule</option>
            <option value="12-hour">12-Hour</option>
            <option value="24-hour">24-Hour</option>
            <option value="visit">Visit-Based</option>
            <option value="live-in">Live-In</option>
          </select>

          <select value={filters.gender} onChange={(e) => handleFilter('gender', e.target.value)} style={S.filterSelect}>
            <option value="any">Any Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <select value={filters.minExperience} onChange={(e) => handleFilter('minExperience', e.target.value)} style={S.filterSelect}>
            <option value="">Any Experience</option>
            <option value="2">2+ Years</option>
            <option value="5">5+ Years</option>
            <option value="10">10+ Years</option>
          </select>

          <select value={filters.minRating} onChange={(e) => handleFilter('minRating', e.target.value)} style={S.filterSelect}>
            <option value="">Any Rating</option>
            <option value="4">⭐ 4+</option>
            <option value="4.5">⭐ 4.5+</option>
          </select>

          <input type="number" placeholder="Max ₹/hr" value={filters.maxHourlyRate} onChange={(e) => handleFilter('maxHourlyRate', e.target.value)} style={S.filterInput} />

          <select value={filters.language} onChange={(e) => handleFilter('language', e.target.value)} style={S.filterSelect}>
            <option value="">Any Language</option>
            <option value="hindi">Hindi</option>
            <option value="english">English</option>
            <option value="tamil">Tamil</option>
            <option value="telugu">Telugu</option>
            <option value="bengali">Bengali</option>
            <option value="marathi">Marathi</option>
          </select>

          <input type="text" placeholder="City" value={filters.city} onChange={(e) => handleFilter('city', e.target.value)} style={{ ...S.filterInput, width: '80px' }} />

          <button onClick={resetFilters} style={S.btnReset}>✕ Reset</button>
        </div>
      </section>

      {/* ================================================================
          RESULTS
      ================================================================ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 32px' }}>
        {/* Results Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <p style={{ fontWeight: '600', color: '#1e293b', fontSize: '15px', margin: 0 }}>
            {loading ? 'Searching...' : `${caregivers.length} caregiver${caregivers.length !== 1 ? 's' : ''} found`}
          </p>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={S.filterSelect}>
            <option value="relevance">Sort: Relevance</option>
            <option value="rating">Rating: High to Low</option>
            <option value="experience">Experience: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', animation: 'pulse 1.5s infinite' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e2e8f0' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: '18px', background: '#e2e8f0', borderRadius: '4px', width: '60%', marginBottom: '8px' }} />
                    <div style={{ height: '14px', background: '#e2e8f0', borderRadius: '4px', width: '40%', marginBottom: '8px' }} />
                    <div style={{ height: '14px', background: '#e2e8f0', borderRadius: '4px', width: '80%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>⚠️</div>
            <p style={{ color: '#dc2626', marginBottom: '12px' }}>{error}</p>
            <button onClick={() => fetchCaregivers()} style={S.btnPrimary}>Try Again</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && caregivers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏠</div>
            <h3 style={{ color: '#1e293b', marginBottom: '4px' }}>No Caregivers Found</h3>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>Try adjusting your filters or search criteria</p>
            <button onClick={resetFilters} style={S.btnPrimary}>Reset Filters</button>
          </div>
        )}

        {/* Cards Grid */}
        {!loading && !error && caregivers.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
              {paginatedCaregivers.map(c => {
                const rate = getHourlyRate(c);
                return (
                  <motion.div key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ background: 'white', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {/* Photo */}
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '18px', flexShrink: 0 }}>
                        {c.photo && c.photo.includes('http') && !c.photo.includes('placehold') ? <img src={c.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : getInitials(c.fullName)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Name & Verified */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.fullName}</h3>
                          {c.isVerified && <span style={{ padding: '1px 7px', background: '#d1fae5', color: '#065f46', borderRadius: '10px', fontSize: '10px', fontWeight: '700', flexShrink: 0 }}>✓</span>}
                        </div>

                        {/* Rating */}
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          {getStars(c.ratings?.average || 0)}
                          <span style={{ marginLeft: '4px' }}>({c.ratings?.count || c.totalReviews || 0}) • {c.experienceYears}yrs</span>
                        </div>

                        {/* Skills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                          {c.specializations?.slice(0, 3).map((s, i) => (
                            <span key={i} style={{ padding: '2px 8px', background: '#eff6ff', color: '#1e40af', borderRadius: '8px', fontSize: '11px', fontWeight: '500' }}>{s}</span>
                          ))}
                        </div>

                        {/* Location & Price Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>📍 {c.location?.city || 'Available'}{c.distance ? ` • ${c.distance}km` : ''}</span>
                          <span style={{ fontSize: '18px', fontWeight: '800', color: '#059669' }}>₹{rate}<span style={{ fontSize: '11px', fontWeight: '400', color: '#64748b' }}>/hr</span></span>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/caregiver-profile/${c._id}`, { state: { caregiver: c } }); }}
                            style={{ flex: 1, padding: '8px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>View Profile</button>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/book-caregiver/${c._id}`, { state: { caregiver: c } }); }}
                            style={{ flex: 1, padding: '8px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>Book Now</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', background: currentPage === 1 ? '#e2e8f0' : '#3b82f6', color: currentPage === 1 ? '#94a3b8' : 'white', fontWeight: '600', fontSize: '13px' }}>← Prev</button>
                <span style={{ color: '#64748b', fontSize: '13px' }}>Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', background: currentPage === totalPages ? '#e2e8f0' : '#3b82f6', color: currentPage === totalPages ? '#94a3b8' : 'white', fontWeight: '600', fontSize: '13px' }}>Next →</button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ================================================================
          TRUST BADGES
      ================================================================ */}
      <section style={{ background: 'white', borderTop: '1px solid #f1f5f9', padding: '28px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', textAlign: 'center' }}>
          {[{ icon: '🛡️', t: 'Background Verified', d: 'All caregivers undergo verification' }, { icon: '🎓', t: 'Trained & Certified', d: 'Qualified healthcare professionals' }, { icon: '⭐', t: 'Rated by Families', d: 'Real reviews from real people' }, { icon: '📞', t: '24/7 Support', d: 'Help whenever you need it' }].map((b, i) => (
            <div key={i}>
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>{b.icon}</div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{b.t}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{b.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          CAREGIVER CTA
      ================================================================ */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a8a, #312e81)', padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>👨‍⚕️</div>
          <h2 style={{ color: 'white', fontWeight: '800', fontSize: '22px', marginBottom: '6px' }}>Are You a Caregiver?</h2>
          <p style={{ color: '#93c5fd', fontSize: '14px', marginBottom: '16px' }}>Join 200+ caregivers. Set your own rates and schedule.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/caregiver/register" style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>📝 Register as Caregiver</Link>
            <Link to="/caregiver/login" style={{ padding: '12px 28px', background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '14px', border: '2px solid rgba(255,255,255,0.3)' }}>🔑 Caregiver Login</Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          DISCLAIMER
      ================================================================ */}
      <section style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', maxWidth: '700px', margin: '0 auto', lineHeight: 1.5 }}>
          ⚠️ HealthCare Hub is a technology platform connecting patients with independent caregivers. We do not employ caregivers or provide medical services. No health data is stored. All care is provided directly by the caregiver.
        </p>
      </section>

      {/* ================================================================
          AI MATCH MODAL
      ================================================================ */}
      {showAIMatch && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px', backdropFilter: 'blur(4px)' }}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ background: 'white', borderRadius: '16px', padding: '28px', maxWidth: '480px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>🤖 AI Caregiver Match</h3>
              <button onClick={() => setShowAIMatch(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Field label="Care Type *">
                <select value={aiMatchData.careType} onChange={e => setAIMatchData(p => ({ ...p, careType: e.target.value }))} style={S.filterSelect}>
                  <option value="">Select</option>
                  <option>Elderly Care</option><option>Post-Surgery Care</option><option>Paralysis Care</option><option>Dementia Care</option><option>Physiotherapy</option><option>Pediatric Care</option><option>Palliative Care</option><option>Wound Care</option>
                </select>
              </Field>
              <Field label="City *"><input type="text" value={aiMatchData.city} onChange={e => setAIMatchData(p => ({ ...p, city: e.target.value }))} style={S.filterInput} placeholder="e.g. Mumbai" /></Field>
              <Field label="Service Type">
                <select value={aiMatchData.serviceType} onChange={e => setAIMatchData(p => ({ ...p, serviceType: e.target.value }))} style={S.filterSelect}>
                  <option value="">Any</option><option value="personal">Personal Care</option><option value="skilled">Skilled Nursing</option>
                </select>
              </Field>
              <Field label="Languages"><input type="text" value={aiMatchData.languages} onChange={e => setAIMatchData(p => ({ ...p, languages: e.target.value }))} style={S.filterInput} placeholder="Hindi, English" /></Field>
              <Field label="Gender">
                <select value={aiMatchData.genderPreference} onChange={e => setAIMatchData(p => ({ ...p, genderPreference: e.target.value }))} style={S.filterSelect}>
                  <option value="any">Any</option><option value="male">Male</option><option value="female">Female</option>
                </select>
              </Field>
              <Field label="Max Budget (₹/hr)"><input type="number" value={aiMatchData.maxBudget} onChange={e => setAIMatchData(p => ({ ...p, maxBudget: e.target.value }))} style={S.filterInput} placeholder="500" /></Field>
              <Field label="Skills Needed"><input type="text" value={aiMatchData.skillsRequired} onChange={e => setAIMatchData(p => ({ ...p, skillsRequired: e.target.value }))} style={S.filterInput} placeholder="wound care, injection" /></Field>
              <button onClick={handleAIMatch} style={{ ...S.btnPrimary, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', width: '100%', padding: '14px', marginTop: '8px' }}>🤖 Find Best Matches</button>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontWeight: '600', fontSize: '12px', color: '#374151', marginBottom: '3px' }}>{label}</label>
    {children}
  </div>
);

export default Caregivers;