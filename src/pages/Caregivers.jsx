// D:\hospital-frontend\src\pages\Caregivers.jsx
// Home Care Hub — Production Ready

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    subType: '',
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

  const careCategories = {
    personal: {
      label: '🩺 Personal Care',
      types: [
        { id: 'elderly', icon: '👴', label: 'Elderly Care', desc: 'Daily assistance & companionship', skills: 'elder care, companionship, mobility support, feeding assistance' },
        { id: 'child', icon: '👶', label: 'Child Care', desc: 'Newborn & pediatric care', skills: 'newborn care, postnatal, pediatric, child care' },
        { id: 'post-surgery', icon: '🏥', label: 'Post-Surgery', desc: 'Recovery assistance at home', skills: 'post-surgery, medication, rest care, mobility' },
        { id: 'disability', icon: '♿', label: 'Disability Support', desc: 'Daily living assistance', skills: 'mobility support, feeding assistance, bathing assistance' },
        { id: 'dementia', icon: '🧠', label: 'Dementia Care', desc: 'Memory & safety support', skills: 'dementia, memory care, safety supervision' },
        { id: 'palliative', icon: '🙏', label: 'Palliative Care', desc: 'Comfort & dignity care', skills: 'palliative, hospice, comfort care' }
      ]
    },
    skilled: {
      label: '💉 Skilled Nursing',
      types: [
        { id: 'injection', icon: '💉', label: 'Injections & IV', desc: 'Medication administration', skills: 'injection, IV, intravenous, medication administration' },
        { id: 'wound', icon: '🩹', label: 'Wound Care', desc: 'Dressing & wound management', skills: 'wound care, dressing, bed sore management' },
        { id: 'tracheostomy', icon: '🫁', label: 'Tracheostomy Care', desc: 'Tube management & suction', skills: 'tracheostomy, tracheostomy care, suction' },
        { id: 'diabetes', icon: '🩸', label: 'Diabetes Management', desc: 'Sugar monitoring & insulin', skills: 'diabetes care, blood sugar, insulin, BP monitoring' },
        { id: 'physio', icon: '🦵', label: 'Physiotherapy', desc: 'Rehabilitation exercises', skills: 'physiotherapy, rehabilitation, mobility support' },
        { id: 'catheter', icon: '🏥', label: 'Catheter Care', desc: 'Catheter management', skills: 'catheter care, catheter management' }
      ]
    }
  };

  // Fetch caregivers
  const fetchCaregivers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page, limit: ITEMS_PER_PAGE,
        ...(filters.serviceType && { serviceType: filters.serviceType }),
        ...(filters.gender !== 'any' && { gender: filters.gender }),
        ...(filters.minExperience && { minExperience: filters.minExperience }),
        ...(filters.minRating && { minRating: filters.minRating }),
        ...(filters.city && { city: filters.city })
      };

      const response = await getCaregivers(params);

      if (response.data.success) {
        let data = response.data.data || [];

        if (filters.maxHourlyRate) {
          data = data.filter(c => {
            const rate = c.pricing?.personal?.hourly || c.pricing?.skilled?.hourly || 0;
            return rate <= parseInt(filters.maxHourlyRate);
          });
        }

        if (filters.specializations) {
          const terms = filters.specializations.toLowerCase().split(',').map(s => s.trim().filter(Boolean));
          if (terms.length > 0) {
            data = data.filter(c => c.specializations?.some(s => terms.some(t => s.toLowerCase().includes(t))));
          }
        }

        if (filters.subType) {
          const subtypeSkills = [...(careCategories.personal.types || []), ...(careCategories.skilled.types || [])]
            .find(t => t.id === filters.subType)?.skills;
          if (subtypeSkills) {
            const terms = subtypeSkills.split(',').map(s => s.trim());
            data = data.filter(c => c.specializations?.some(s => terms.some(t => s.toLowerCase().includes(t))));
          }
        }

        if (filters.language) {
          data = data.filter(c => c.languages?.some(l => l.toLowerCase().includes(filters.language.toLowerCase())));
        }

        if (filters.schedule && filters.schedule !== 'any') {
          const scheduleMap = { '12-hour': '12-Hour', '24-hour': '24-Hour', 'visit': 'Visit-Based', 'live-in': 'Live-In' };
          data = data.filter(c => c.serviceTypes?.includes(scheduleMap[filters.schedule]));
        }

        // Sort
        if (sortBy === 'rating') data.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
        if (sortBy === 'experience') data.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
        if (sortBy === 'price-low') data.sort((a, b) => (a.pricing?.personal?.hourly || a.pricing?.skilled?.hourly || 0) - (b.pricing?.personal?.hourly || b.pricing?.skilled?.hourly || 0));
        if (sortBy === 'price-high') data.sort((a, b) => (b.pricing?.personal?.hourly || b.pricing?.skilled?.hourly || 0) - (a.pricing?.personal?.hourly || a.pricing?.skilled?.hourly || 0));

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
    if (!aiMatchData.careType || !aiMatchData.city) { alert('Please enter care type and city'); return; }
    setLoading(true); setShowAIMatch(false);
    try {
      const response = await getAICaregiverMatch({
        careType: aiMatchData.careType, city: aiMatchData.city,
        serviceType: aiMatchData.serviceType || undefined,
        languages: aiMatchData.languages ? aiMatchData.languages.split(',').map(l => l.trim()) : [],
        genderPreference: aiMatchData.genderPreference !== 'any' ? aiMatchData.genderPreference : undefined,
        maxBudget: aiMatchData.maxBudget || undefined,
        skillsRequired: aiMatchData.skillsRequired ? aiMatchData.skillsRequired.split(',').map(s => s.trim()) : []
      });
      if (response.data.success) { setCaregivers(response.data.data || []); setTotalPages(1); }
    } catch { fetchCaregivers(); } finally { setLoading(false); }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters(prev => ({ ...prev, specializations: searchQuery, city: location || prev.city }));
      setCurrentPage(1);
    }
  };

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
    if (s.type === 'city') { setLocation(s.text || s.label); setFilters(prev => ({ ...prev, city: s.text || s.label })); }
    else { setSearchQuery(s.text || s.label); setFilters(prev => ({ ...prev, specializations: prev.specializations ? prev.specializations + ', ' + (s.text || s.label) : (s.text || s.label) })); }
    setShowSuggestions(false);
  };

  const handleSubTypeClick = (typeId, skills) => {
    setFilters(prev => ({ ...prev, subType: typeId, specializations: skills }));
    setCurrentPage(1);
  };

  const handleFilter = (key, value) => { setFilters(prev => ({ ...prev, [key]: value })); setCurrentPage(1); };

  const resetFilters = () => {
    setFilters({ serviceType: '', subType: '', schedule: '', gender: 'any', minExperience: '', minRating: '', maxHourlyRate: '', language: '', specializations: '', city: '' });
    setSearchQuery(''); setLocation(''); setSortBy('relevance'); setCurrentPage(1);
  };

  useEffect(() => { fetchCaregivers(currentPage); }, [currentPage, fetchCaregivers]);

  const getInitials = (n) => n?.split(' ').map(w => w[0]).join('').toUpperCase() || 'CG';
  const getStars = (r) => '⭐'.repeat(Math.floor(r || 0)) + '☆'.repeat(5 - Math.floor(r || 0));
  const getHourlyRate = (c) => c.pricing?.personal?.hourly || c.pricing?.skilled?.hourly || 'N/A';
  const paginatedCaregivers = caregivers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'any').length;

  const css = {
    section: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
    card: { background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', transition: 'all 0.25s ease', cursor: 'pointer' },
    select: { padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#334155', background: 'white', outline: 'none', minWidth: '120px', cursor: 'pointer', fontWeight: '500' },
    input: { padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#334155', outline: 'none', width: '100px', fontWeight: '500' },
    btnPrimary: { padding: '12px 24px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap' },
    btnGhost: { padding: '12px 24px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap' },
    btnOutline: { padding: '8px 16px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
    btnGreen: { padding: '8px 16px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
    btnReset: { padding: '10px 18px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" }}>

      {/* ================================================================
          HERO
      ================================================================ */}
      <section style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)', padding: '48px 20px 56px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ maxWidth: '850px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span style={{ display: 'inline-block', padding: '6px 20px', borderRadius: '24px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '13px', fontWeight: '600', marginBottom: '20px', letterSpacing: '0.5px' }}>
              🏠 India's Most Trusted Home Care Platform
            </span>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: '800', marginBottom: '12px', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
              Find a Trusted Caregiver<br />for Your Loved Ones
            </h1>
            <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '28px', maxWidth: '550px', margin: '0 auto 28px', lineHeight: 1.5 }}>
              AI-powered matching with verified, background-checked home care professionals across India
            </p>

            {/* Search Bar */}
            <form onSubmit={handleHeroSearch} style={{ maxWidth: '680px', margin: '0 auto 16px' }}>
              <div style={{ display: 'flex', background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', position: 'relative' }}>
                <div ref={searchRef} style={{ flex: 2.5, display: 'flex', alignItems: 'center', paddingLeft: '16px' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>🔍</span>
                  <input type="text" value={searchQuery} onChange={(e) => handleSearchInput(e.target.value)} onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search by skill, condition, or caregiver name..." style={{ width: '100%', padding: '15px 12px', border: 'none', outline: 'none', fontSize: '15px', color: '#1e293b', background: 'transparent' }} />
                  {showSuggestions && suggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '0 0 14px 14px', boxShadow: '0 15px 40px rgba(0,0,0,0.15)', zIndex: 100, textAlign: 'left', overflow: 'hidden' }}>
                      {suggestions.map((s, i) => (
                        <div key={i} onMouseDown={() => handleSuggestionClick(s)} style={{ padding: '13px 20px', cursor: 'pointer', fontSize: '14px', color: '#334155', borderBottom: i < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                          <span>{s.type === 'city' ? '📍' : '🎯'}</span> {s.text || s.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ width: '1px', background: '#e2e8f0', margin: '10px 0' }} />
                <div style={{ flex: 1.5, display: 'flex', alignItems: 'center', paddingLeft: '12px' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>📍</span>
                  <input type="text" value={location} onChange={(e) => { setLocation(e.target.value); setFilters(prev => ({ ...prev, city: e.target.value })); }}
                    placeholder="City / Location" style={{ width: '100%', padding: '15px 12px', border: 'none', outline: 'none', fontSize: '15px', color: '#1e293b', background: 'transparent' }} />
                </div>
                <button type="submit" style={{ padding: '15px 28px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '15px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🔍 Search
                </button>
              </div>
            </form>

            {/* AI Match & Quick Stats Row */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', flexWrap: 'wrap', marginTop: '20px' }}>
              <button onClick={() => setShowAIMatch(true)} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🤖 AI Quick Match
              </button>
              {[{ v: '200+', l: 'Verified Caregivers' }, { v: '50+', l: 'Cities Across India' }, { v: '4.8 ⭐', l: 'Average Rating' }].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: 'white' }}>{s.v}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          CARE TYPE CATEGORIES
      ================================================================ */}
      <section style={{ ...css.section, marginTop: '-20px', position: 'relative', zIndex: 2 }}>
        {/* Personal Care */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px 24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e40af', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🩺 Personal Care (Non-Medical)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
            {careCategories.personal.types.map(type => (
              <div key={type.id} onClick={() => handleSubTypeClick(type.id, type.skills)}
                style={{ padding: '14px 12px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', background: filters.subType === type.id ? '#eff6ff' : '#f8fafc', border: filters.subType === type.id ? '2px solid #3b82f6' : '1px solid #e2e8f0', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (filters.subType !== type.id) { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; } }}
                onMouseLeave={e => { if (filters.subType !== type.id) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; } }}>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>{type.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>{type.label}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{type.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skilled Nursing */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px 24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#9d174d', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💉 Skilled Nursing (Medical Care)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
            {careCategories.skilled.types.map(type => (
              <div key={type.id} onClick={() => handleSubTypeClick(type.id, type.skills)}
                style={{ padding: '14px 12px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', background: filters.subType === type.id ? '#fdf2f8' : '#f8fafc', border: filters.subType === type.id ? '2px solid #db2777' : '1px solid #e2e8f0', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (filters.subType !== type.id) { e.currentTarget.style.background = '#fdf2f8'; e.currentTarget.style.borderColor = '#f9a8d4'; } }}
                onMouseLeave={e => { if (filters.subType !== type.id) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; } }}>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>{type.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>{type.label}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{type.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          FILTERS BAR — Always Visible
      ================================================================ */}
      <section style={{ ...css.section, marginTop: '24px', marginBottom: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '700', fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🔍 Filters
            {activeFilterCount > 0 && <span style={{ background: '#3b82f6', color: 'white', borderRadius: '10px', padding: '1px 8px', fontSize: '11px' }}>{activeFilterCount}</span>}
          </span>

          <select value={filters.serviceType} onChange={(e) => handleFilter('serviceType', e.target.value)} style={css.select}>
            <option value="">All Service Types</option>
            <option value="personal">🩺 Personal Care</option>
            <option value="skilled">💉 Skilled Nursing</option>
          </select>

          <select value={filters.schedule} onChange={(e) => handleFilter('schedule', e.target.value)} style={css.select}>
            <option value="">Any Schedule</option>
            <option value="12-hour">🕐 12-Hour</option>
            <option value="24-hour">🕛 24-Hour</option>
            <option value="visit">🏠 Visit-Based</option>
            <option value="live-in">🏡 Live-In</option>
          </select>

          <select value={filters.gender} onChange={(e) => handleFilter('gender', e.target.value)} style={{ ...css.select, minWidth: '100px' }}>
            <option value="any">⚤ Any Gender</option>
            <option value="male">♂ Male</option>
            <option value="female">♀ Female</option>
          </select>

          <select value={filters.minExperience} onChange={(e) => handleFilter('minExperience', e.target.value)} style={{ ...css.select, minWidth: '110px' }}>
            <option value="">Any Experience</option>
            <option value="2">📅 2+ Years</option>
            <option value="5">📅 5+ Years</option>
            <option value="10">📅 10+ Years</option>
          </select>

          <select value={filters.minRating} onChange={(e) => handleFilter('minRating', e.target.value)} style={{ ...css.select, minWidth: '100px' }}>
            <option value="">Any Rating</option>
            <option value="4">⭐ 4+</option>
            <option value="4.5">⭐ 4.5+</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', borderRadius: '8px', padding: '0 8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>₹</span>
            <input type="number" placeholder="Max/hr" value={filters.maxHourlyRate} onChange={(e) => handleFilter('maxHourlyRate', e.target.value)} style={{ ...css.input, border: 'none', background: 'transparent', width: '70px', padding: '10px 4px' }} />
          </div>

          <select value={filters.language} onChange={(e) => handleFilter('language', e.target.value)} style={{ ...css.select, minWidth: '110px' }}>
            <option value="">🗣 Any Language</option>
            <option value="hindi">Hindi</option>
            <option value="english">English</option>
            <option value="tamil">Tamil</option>
            <option value="telugu">Telugu</option>
            <option value="bengali">Bengali</option>
            <option value="marathi">Marathi</option>
            <option value="gujarati">Gujarati</option>
          </select>

          <input type="text" placeholder="📍 City" value={filters.city} onChange={(e) => handleFilter('city', e.target.value)} style={{ ...css.input, width: '90px' }} />

          <div style={{ flex: 1 }} />
          <button onClick={resetFilters} style={css.btnReset}>✕ Reset All</button>
        </div>
      </section>

      {/* ================================================================
          RESULTS SECTION
      ================================================================ */}
      <section style={{ ...css.section, paddingBottom: '40px' }}>
        {/* Results Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px', margin: 0 }}>
            {loading ? 'Searching caregivers...' : `${caregivers.length} Caregiver${caregivers.length !== 1 ? 's' : ''} Found`}
          </p>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={css.select}>
            <option value="relevance">Sort: Relevance</option>
            <option value="rating">⭐ Rating: High to Low</option>
            <option value="experience">📅 Experience: High to Low</option>
            <option value="price-low">💰 Price: Low to High</option>
            <option value="price-high">💰 Price: High to Low</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ ...css.card, animation: 'pulse 1.5s infinite' }}>
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e2e8f0', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: '18px', background: '#e2e8f0', borderRadius: '6px', width: '55%', marginBottom: '8px' }} />
                    <div style={{ height: '14px', background: '#e2e8f0', borderRadius: '6px', width: '35%', marginBottom: '8px' }} />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div style={{ height: '22px', background: '#e2e8f0', borderRadius: '10px', width: '50px' }} />
                      <div style={{ height: '22px', background: '#e2e8f0', borderRadius: '10px', width: '70px' }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', borderRadius: '16px', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ color: '#dc2626', marginBottom: '8px', fontSize: '18px' }}>{error}</h3>
            <button onClick={() => fetchCaregivers()} style={css.btnPrimary}>Try Again</button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && caregivers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>🏠</div>
            <h3 style={{ color: '#1e293b', marginBottom: '6px', fontSize: '20px', fontWeight: '700' }}>No Caregivers Found</h3>
            <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px' }}>Try adjusting your filters, expanding your search area, or check back soon as new caregivers join daily.</p>
            <button onClick={resetFilters} style={css.btnPrimary}>Reset All Filters</button>
          </div>
        )}

        {/* Caregiver Cards Grid */}
        {!loading && !error && caregivers.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
              {paginatedCaregivers.map(c => {
                const rate = getHourlyRate(c);
                const isPersonal = c.serviceType === 'personal' || c.serviceType === 'both';
                const isSkilled = c.serviceType === 'skilled' || c.serviceType === 'both';
                return (
                  <motion.div key={c._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ ...css.card, cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}>

                    <div style={{ display: 'flex', gap: '14px' }}>
                      {/* Avatar */}
                      <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '20px', flexShrink: 0, position: 'relative' }}>
                        {c.photo && c.photo.includes('http') && !c.photo.includes('placehold') ? (
                          <img src={c.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : getInitials(c.fullName)}
                        {c.isVerified && (
                          <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '22px', height: '22px', borderRadius: '50%', background: '#10b981', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white' }}>✓</span>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Name + Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{c.fullName}</h3>
                          {isPersonal && <span style={{ padding: '2px 8px', background: '#dbeafe', color: '#1e40af', borderRadius: '10px', fontSize: '10px', fontWeight: '600' }}>🩺 Personal</span>}
                          {isSkilled && <span style={{ padding: '2px 8px', background: '#fce7f3', color: '#9d174d', borderRadius: '10px', fontSize: '10px', fontWeight: '600' }}>💉 Skilled</span>}
                        </div>

                        {/* Rating */}
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
                          <span style={{ color: '#f59e0b' }}>{getStars(c.ratings?.average || 0)}</span>
                          <span style={{ fontWeight: '600', color: '#334155', marginLeft: '6px' }}>{(c.ratings?.average || 0).toFixed(1)}</span>
                          <span> ({c.ratings?.count || c.totalReviews || 0} reviews) • {c.experienceYears} yrs</span>
                        </div>

                        {/* Skills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
                          {c.specializations?.slice(0, 4).map((s, i) => (
                            <span key={i} style={{ padding: '3px 10px', background: '#f1f5f9', color: '#475569', borderRadius: '10px', fontSize: '11px', fontWeight: '500' }}>{s}</span>
                          ))}
                        </div>

                        {/* Location & Price */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>📍 {c.location?.city || 'Available'}{c.distance ? ` • ${c.distance}km` : ''}</span>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '20px', fontWeight: '800', color: '#059669' }}>₹{rate}</span>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '400' }}>/hour</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/caregiver-profile/${c._id}`, { state: { caregiver: c } }); }}
                            style={css.btnOutline}>📋 View Profile</button>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/book-caregiver/${c._id}`, { state: { caregiver: c } }); }}
                            style={css.btnGreen}>📅 Book Now</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', background: currentPage === 1 ? '#e2e8f0' : '#3b82f6', color: currentPage === 1 ? '#94a3b8' : 'white', fontWeight: '700', fontSize: '14px' }}>← Previous</button>
                <span style={{ color: '#475569', fontWeight: '600', fontSize: '14px' }}>Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', background: currentPage === totalPages ? '#e2e8f0' : '#3b82f6', color: currentPage === totalPages ? '#94a3b8' : 'white', fontWeight: '700', fontSize: '14px' }}>Next →</button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ================================================================
          TRUST BADGES
      ================================================================ */}
      <section style={{ background: 'white', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '36px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', textAlign: 'center' }}>
          {[{ icon: '🛡️', title: 'Background Verified', desc: 'All caregivers undergo thorough background checks' }, { icon: '🎓', title: 'Trained & Certified', desc: 'Qualified with relevant healthcare certifications' }, { icon: '⭐', title: 'Rated by Families', desc: 'Real reviews from families like yours' }, { icon: '📞', title: '24/7 Support', desc: 'Help available whenever you need it' }].map((b, i) => (
            <div key={i} style={{ maxWidth: '180px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{b.icon}</div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', marginBottom: '4px' }}>{b.title}</div>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          CAREGIVER CTA
      ================================================================ */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)', padding: '44px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '44px', marginBottom: '12px' }}>👨‍⚕️</div>
          <h2 style={{ color: 'white', fontWeight: '800', fontSize: '24px', marginBottom: '8px' }}>Are You a Caregiver?</h2>
          <p style={{ color: '#93c5fd', fontSize: '15px', marginBottom: '24px', lineHeight: 1.5 }}>Join 200+ verified caregivers on India's most trusted platform.<br />Set your own rates, schedule, and service areas.</p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/caregiver/register" style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)' }}>
              📝 Register as Caregiver
            </Link>
            <Link to="/caregiver/login" style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.12)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', border: '2px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)' }}>
              🔑 Caregiver Login
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          DISCLAIMER
      ================================================================ */}
      <section style={{ padding: '24px 20px', textAlign: 'center', background: '#f8fafc' }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
          ⚠️ HealthCare Hub is a technology platform connecting patients with independent caregivers. We do not employ caregivers or provide medical services. No health data is stored on our platform. All care services are provided directly by the caregiver. We earn a commission for bookings made through our platform.
        </p>
      </section>

      {/* ================================================================
          AI MATCH MODAL
      ================================================================ */}
      <AnimatePresence>
        {showAIMatch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0 }}>🤖 AI Caregiver Match</h3>
                <button onClick={() => setShowAIMatch(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>✕</button>
              </div>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Tell us your needs and our AI will find the most compatible caregivers for you.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#374151', marginBottom: '4px' }}>Care Type *</label>
                  <select value={aiMatchData.careType} onChange={e => setAIMatchData(p => ({ ...p, careType: e.target.value }))} style={css.select}>
                    <option value="">Select care type</option>
                    <option>Elderly Care</option><option>Post-Surgery Care</option><option>Paralysis Care</option>
                    <option>Dementia Care</option><option>Physiotherapy</option><option>Pediatric Care</option>
                    <option>Palliative Care</option><option>Wound Care</option><option>Diabetes Care</option>
                    <option>Newborn Care</option><option>Disability Support</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#374151', marginBottom: '4px' }}>City *</label>
                  <input type="text" value={aiMatchData.city} onChange={e => setAIMatchData(p => ({ ...p, city: e.target.value }))} style={{ ...css.input, width: '100%' }} placeholder="e.g. Mumbai" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#374151', marginBottom: '4px' }}>Service Type</label>
                    <select value={aiMatchData.serviceType} onChange={e => setAIMatchData(p => ({ ...p, serviceType: e.target.value }))} style={css.select}>
                      <option value="">Any</option><option value="personal">Personal Care</option><option value="skilled">Skilled Nursing</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#374151', marginBottom: '4px' }}>Gender</label>
                    <select value={aiMatchData.genderPreference} onChange={e => setAIMatchData(p => ({ ...p, genderPreference: e.target.value }))} style={css.select}>
                      <option value="any">Any</option><option value="male">Male</option><option value="female">Female</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#374151', marginBottom: '4px' }}>Languages (comma separated)</label>
                  <input type="text" value={aiMatchData.languages} onChange={e => setAIMatchData(p => ({ ...p, languages: e.target.value }))} style={{ ...css.input, width: '100%' }} placeholder="Hindi, English, Tamil" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#374151', marginBottom: '4px' }}>Max Budget (₹/hour)</label>
                  <input type="number" value={aiMatchData.maxBudget} onChange={e => setAIMatchData(p => ({ ...p, maxBudget: e.target.value }))} style={{ ...css.input, width: '100%' }} placeholder="e.g. 500" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#374151', marginBottom: '4px' }}>Required Skills (comma separated)</label>
                  <input type="text" value={aiMatchData.skillsRequired} onChange={e => setAIMatchData(p => ({ ...p, skillsRequired: e.target.value }))} style={{ ...css.input, width: '100%' }} placeholder="wound care, injection, physio" />
                </div>
                <button onClick={handleAIMatch} style={{ ...css.btnPrimary, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', width: '100%', padding: '14px', marginTop: '4px', fontSize: '16px' }}>
                  🤖 Find Best Matches with AI
                </button>
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '11px', margin: 0 }}>🔒 Real-time analysis. No data stored.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
};

export default Caregivers;