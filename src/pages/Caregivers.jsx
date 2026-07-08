// D:\hospital-frontend\src\pages\Caregivers.jsx
// Home Care Hub — Production Ready with AI Matching

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaUserMd, FaMapMarkerAlt, FaStar, FaShieldAlt,
  FaClock, FaUsers, FaHeart, FaHandHoldingHeart, FaCalendarCheck,
  FaLanguage, FaMoneyBillWave, FaFilter, FaTimes, FaChevronDown,
  FaUserPlus, FaSignInAlt, FaArrowRight, FaPhone, FaEnvelope
} from 'react-icons/fa';
import { getCaregivers, getAICaregiverMatch, getCaregiverSuggestions } from '../services/api';

const Caregivers = () => {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // State
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAIMatch, setShowAIMatch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid | list

  const [filters, setFilters] = useState({
    serviceType: '',
    gender: 'any',
    minExperience: '',
    minRating: '',
    maxHourlyRate: '',
    specializations: '',
    city: '',
    language: ''
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

  const ITEMS_PER_PAGE = 9;

  // Service Categories for Hub
  const serviceCategories = [
    { id: 'elderly', icon: '👴', title: 'Elderly Care', desc: 'Compassionate care for seniors', color: '#f59e0b', skills: ['elder care', 'mobility support', 'companionship'] },
    { id: 'post-surgery', icon: '🏥', title: 'Post-Surgery', desc: 'Recovery assistance at home', color: '#3b82f6', skills: ['post-surgery', 'wound care', 'medication'] },
    { id: 'nursing', icon: '💉', title: 'Skilled Nursing', desc: 'Professional medical care', color: '#8b5cf6', skills: ['wound care', 'ventilator', 'tracheostomy', 'injection'] },
    { id: 'physio', icon: '🦵', title: 'Physiotherapy', desc: 'Rehabilitation & therapy', color: '#10b981', skills: ['physiotherapy', 'mobility support'] },
    { id: 'dementia', icon: '🧠', title: 'Dementia Care', desc: 'Specialized memory care', color: '#ec4899', skills: ['dementia', 'palliative'] },
    { id: 'child', icon: '👶', title: 'Child Care', desc: 'Newborn & pediatric care', color: '#06b6d4', skills: ['newborn care', 'postnatal', 'pediatric'] },
  ];

  // Stats
  const stats = [
    { icon: <FaUserMd />, value: '200+', label: 'Verified Caregivers', color: '#3b82f6' },
    { icon: <FaMapMarkerAlt />, value: '50+', label: 'Cities Covered', color: '#10b981' },
    { icon: <FaStar />, value: '4.8', label: 'Average Rating', color: '#f59e0b' },
    { icon: <FaClock />, value: '24/7', label: 'Service Available', color: '#8b5cf6' },
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

        if (filters.specializations) {
          const specTerms = filters.specializations.toLowerCase().split(',').map(s => s.trim());
          data = data.filter(c =>
            c.specializations?.some(spec =>
              specTerms.some(term => spec.toLowerCase().includes(term))
            )
          );
        }

        if (filters.maxHourlyRate) {
          const maxRate = parseInt(filters.maxHourlyRate);
          data = data.filter(c => {
            const rate = c.pricing?.personal?.hourly || c.pricing?.skilled?.hourly || 0;
            return rate <= maxRate;
          });
        }

        if (filters.language) {
          data = data.filter(c =>
            c.languages?.some(lang =>
              lang.toLowerCase().includes(filters.language.toLowerCase())
            )
          );
        }

        setCaregivers(data);
        setTotalPages(response.data.pagination?.total || Math.ceil(data.length / ITEMS_PER_PAGE));
      } else {
        setCaregivers([]);
        setTotalPages(1);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setCaregivers([]);
      } else {
        setError('Unable to load caregivers. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // AI Quick Match
  const handleAIMatch = async () => {
    if (!aiMatchData.careType || !aiMatchData.city) {
      alert('Please select care type and city');
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
    } catch (err) {
      alert('AI matching unavailable. Showing all caregivers.');
      fetchCaregivers();
    } finally {
      setLoading(false);
    }
  };

  // Search suggestions
  const handleSearchInput = async (value) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      try {
        const response = await getCaregiverSuggestions(value);
        if (response.data.success) {
          setSuggestions(response.data.data || []);
          setShowSuggestions(true);
        }
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'city') {
      setFilters(prev => ({ ...prev, city: suggestion.text || suggestion.label }));
    } else {
      setFilters(prev => ({
        ...prev,
        specializations: prev.specializations
          ? prev.specializations + ', ' + (suggestion.text || suggestion.label)
          : (suggestion.text || suggestion.label)
      }));
    }
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleCategoryClick = (category) => {
    setFilters(prev => ({
      ...prev,
      specializations: category.skills.join(', ')
    }));
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchCaregivers(currentPage);
  }, [currentPage, fetchCaregivers]);

  const resetFilters = () => {
    setFilters({
      serviceType: '',
      gender: 'any',
      minExperience: '',
      minRating: '',
      maxHourlyRate: '',
      specializations: '',
      city: '',
      language: ''
    });
    setCurrentPage(1);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CG';

  const getRatingStars = (rating) => {
    const full = Math.floor(rating || 0);
    return '⭐'.repeat(full) + '☆'.repeat(5 - full);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ================================================================
          HERO SECTION
      ================================================================ */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #312e81 100%)',
        padding: '40px 20px 60px',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            
            {/* Badge */}
            <span style={{
              display: 'inline-block', padding: '6px 20px', borderRadius: '20px',
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)', fontSize: '14px', fontWeight: '600',
              marginBottom: '16px'
            }}>
              🏠 India's Trusted Home Care Platform
            </span>

            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '800', marginBottom: '12px',
              lineHeight: 1.2, background: 'linear-gradient(to right, #fff, #e2e8f0)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              Find Trusted Caregivers<br />for Your Loved Ones
            </h1>
            <p style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '28px', maxWidth: '600px', margin: '0 auto 28px' }}>
              AI-powered matching with verified, background-checked home care professionals
            </p>

            {/* Search Bar */}
            <div ref={searchRef} style={{
              maxWidth: '700px', margin: '0 auto 24px', position: 'relative'
            }}>
              <div style={{
                display: 'flex', gap: '0', background: 'white', borderRadius: '16px',
                overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '18px' }}>
                  <FaSearch style={{ color: '#94a3b8', fontSize: '18px' }} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search by skill, city, or caregiver name..."
                  style={{
                    flex: 1, padding: '16px 14px', border: 'none', outline: 'none',
                    fontSize: '16px', color: '#1e293b', background: 'transparent'
                  }}
                />
                <button
                  onClick={() => setShowAIMatch(true)}
                  style={{
                    padding: '16px 24px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700',
                    fontSize: '15px', whiteSpace: 'nowrap'
                  }}
                >
                  🤖 AI Match
                </button>
              </div>

              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: '8px', right: '8px',
                  background: 'white', borderRadius: '12px', marginTop: '6px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.2)', zIndex: 100,
                  overflow: 'hidden', textAlign: 'left'
                }}>
                  {suggestions.map((s, i) => (
                    <div key={i} onMouseDown={() => handleSuggestionClick(s)}
                      style={{
                        padding: '12px 20px', cursor: 'pointer', color: '#1e293b',
                        fontSize: '14px', borderBottom: i < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                        display: 'flex', alignItems: 'center', gap: '10px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      {s.type === 'city' ? '📍' : '🎯'} {s.text || s.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap'
            }}>
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ fontSize: '24px', color: stat.color, marginBottom: '4px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}>{stat.value}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          SERVICE CATEGORIES
      ================================================================ */}
      <section style={{ maxWidth: '1200px', margin: '-30px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px'
        }}>
          {serviceCategories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              onClick={() => handleCategoryClick(cat)}
              style={{
                background: 'white', borderRadius: '16px', padding: '20px 16px',
                textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                border: '1px solid #f1f5f9', transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>{cat.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px' }}>
                {cat.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0', lineHeight: 1.4 }}>
                {cat.desc}
              </p>
              <div style={{
                marginTop: '10px', fontSize: '12px', color: cat.color, fontWeight: '600'
              }}>
                Find Caregivers →
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS
      ================================================================ */}
      <section style={{ maxWidth: '1000px', margin: '48px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
            📋 How It Works
          </h2>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Find the perfect caregiver in 3 simple steps</p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px'
        }}>
          {[
            { step: '01', icon: '🔍', title: 'Search & Filter', desc: 'Tell us your needs — care type, location, budget, and preferences' },
            { step: '02', icon: '🤖', title: 'AI Matching', desc: 'Our AI analyzes skills, experience, and compatibility to find the best match' },
            { step: '03', icon: '📅', title: 'Book & Relax', desc: 'Book instantly. Caregiver contacts you directly. Pay securely online.' }
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                textAlign: 'center', padding: '28px 20px',
                background: 'white', borderRadius: '16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9',
                position: 'relative'
              }}
            >
              <div style={{
                position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)',
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '800', fontSize: '14px'
              }}>
                {step.step}
              </div>
              <div style={{ fontSize: '40px', marginBottom: '12px', marginTop: '8px' }}>{step.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0', lineHeight: 1.5 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================================================================
          TRUST BADGES
      ================================================================ */}
      <section style={{ background: 'white', padding: '40px 20px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
          {[
            { icon: <FaShieldAlt style={{ color: '#10b981', fontSize: '28px' }} />, title: 'Background Verified', desc: 'All caregivers undergo background checks' },
            { icon: <FaStar style={{ color: '#f59e0b', fontSize: '28px' }} />, title: 'Rated & Reviewed', desc: 'Real reviews from real families' },
            { icon: <FaHeart style={{ color: '#ef4444', fontSize: '28px' }} />, title: 'Compassionate Care', desc: 'Trained in patient-centered care' }
          ].map((badge, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '8px' }}>{badge.icon}</div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px' }}>{badge.title}</h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          SEARCH RESULTS SECTION
      ================================================================ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        
        {/* Section Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '20px', flexWrap: 'wrap', gap: '12px'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0' }}>
              🔍 Available Caregivers
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
              {loading ? 'Searching...' : `${caregivers.length} caregiver${caregivers.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* View Toggle */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
              <button onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px 14px', border: 'none', cursor: 'pointer',
                  background: viewMode === 'grid' ? '#3b82f6' : 'transparent',
                  color: viewMode === 'grid' ? 'white' : '#64748b',
                  fontWeight: '600', fontSize: '13px'
                }}>⊞ Grid</button>
              <button onClick={() => setViewMode('list')}
                style={{
                  padding: '8px 14px', border: 'none', cursor: 'pointer',
                  background: viewMode === 'list' ? '#3b82f6' : 'transparent',
                  color: viewMode === 'list' ? 'white' : '#64748b',
                  fontWeight: '600', fontSize: '13px'
                }}>≡ List</button>
            </div>

            {/* Filter Toggle */}
            <button onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '8px 16px', background: showFilters ? '#eff6ff' : '#f8fafc',
                border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
                fontWeight: '600', fontSize: '13px', color: '#3b82f6',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
              <FaFilter size={14} /> Filters
              {Object.values(filters).some(v => v && v !== 'any') && (
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#ef4444', display: 'inline-block'
                }} />
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            style={{
              background: 'white', borderRadius: '12px', padding: '20px',
              marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0', overflow: 'hidden'
            }}
          >
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px'
            }}>
              <FilterSelect label="Service Type" value={filters.serviceType}
                onChange={(v) => setFilters(p => ({ ...p, serviceType: v }))}
                options={[['', 'All'], ['personal', '🩺 Personal Care'], ['skilled', '💉 Skilled Nursing']]} />
              
              <FilterSelect label="Gender" value={filters.gender}
                onChange={(v) => setFilters(p => ({ ...p, gender: v }))}
                options={[['any', 'Any'], ['male', 'Male'], ['female', 'Female']]} />
              
              <FilterSelect label="Experience" value={filters.minExperience}
                onChange={(v) => setFilters(p => ({ ...p, minExperience: v }))}
                options={[['', 'Any'], ['2', '2+ Years'], ['5', '5+ Years'], ['10', '10+ Years']]} />
              
              <FilterSelect label="Rating" value={filters.minRating}
                onChange={(v) => setFilters(p => ({ ...p, minRating: v }))}
                options={[['', 'Any'], ['4', '⭐ 4+'], ['4.5', '⭐ 4.5+']]} />
              
              <FilterInput label="Max Rate (₹/hr)" value={filters.maxHourlyRate}
                onChange={(v) => setFilters(p => ({ ...p, maxHourlyRate: v }))}
                type="number" placeholder="e.g. 500" />
              
              <FilterInput label="City" value={filters.city}
                onChange={(v) => setFilters(p => ({ ...p, city: v }))}
                placeholder="e.g. Mumbai" />
              
              <FilterInput label="Language" value={filters.language}
                onChange={(v) => setFilters(p => ({ ...p, language: v }))}
                placeholder="e.g. Hindi" />
              
              <FilterInput label="Skills" value={filters.specializations}
                onChange={(v) => setFilters(p => ({ ...p, specializations: v }))}
                placeholder="e.g. wound care, elderly" />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button onClick={resetFilters}
                style={{
                  padding: '10px 20px', background: '#f1f5f9', border: '1px solid #e2e8f0',
                  borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#64748b', fontSize: '14px'
                }}>Reset All</button>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'list' ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '16px'
          }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <SkeletonCard key={i} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{
            textAlign: 'center', padding: '48px 24px', background: 'white',
            borderRadius: '16px', border: '1px solid #fecaca'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>{error}</h3>
            <button onClick={() => fetchCaregivers()}
              style={{
                padding: '12px 28px', background: '#3b82f6', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
              }}>Try Again</button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && caregivers.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '48px 24px', background: 'white',
            borderRadius: '16px', border: '2px dashed #e2e8f0'
          }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>🏠</div>
            <h3 style={{ color: '#1e293b', marginBottom: '8px', fontSize: '20px' }}>
              No Caregivers Found
            </h3>
            <p style={{ color: '#64748b', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px' }}>
              No caregivers match your current filters. Try expanding your search or check back soon.
            </p>
            <button onClick={resetFilters}
              style={{
                padding: '10px 24px', background: '#3b82f6', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
              }}>Reset Filters</button>
          </div>
        )}

        {/* Caregiver Cards */}
        {!loading && !error && caregivers.length > 0 && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'list' ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '16px'
            }}>
              {caregivers.map(c => (
                <CaregiverCard
                  key={c._id}
                  caregiver={c}
                  viewMode={viewMode}
                  getInitials={getInitials}
                  getRatingStars={getRatingStars}
                  onViewProfile={() => navigate(`/caregiver-profile/${c._id}`, { state: { caregiver: c } })}
                  onBook={() => navigate(`/book-caregiver/${c._id}`, { state: { caregiver: c } })}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                gap: '16px', marginTop: '32px'
              }}>
                <PageButton onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  ← Previous
                </PageButton>
                <span style={{ color: '#64748b', fontWeight: '500', fontSize: '14px' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <PageButton onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Next →
                </PageButton>
              </div>
            )}
          </>
        )}
      </section>

      {/* ================================================================
          CAREGIVER CTA SECTION
      ================================================================ */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a8a, #312e81)',
        padding: '40px 20px', marginTop: '32px'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍⚕️</div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
            Are You a Caregiver?
          </h2>
          <p style={{ fontSize: '16px', color: '#93c5fd', marginBottom: '24px', lineHeight: 1.5 }}>
            Join 200+ verified caregivers on India's most trusted home care platform.<br />
            Set your own rates, schedule, and service areas.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/caregiver/register"
              style={{
                padding: '14px 32px', background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white', borderRadius: '12px', textDecoration: 'none',
                fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
              }}>
              <FaUserPlus /> Register as Caregiver
            </Link>
            <Link to="/caregiver/login"
              style={{
                padding: '14px 32px', background: 'rgba(255,255,255,0.15)',
                color: 'white', borderRadius: '12px', textDecoration: 'none',
                fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                border: '2px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)'
              }}>
              <FaSignInAlt /> Caregiver Login
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          DISCLAIMER
      ================================================================ */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 20px', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6 }}>
          ⚠️ HealthCare Hub is a technology platform connecting patients with independent caregivers.
          We do not employ caregivers or provide medical services. We earn a commission for bookings made through our platform.
          No health data is stored. All care is provided directly by the caregiver.
        </p>
      </section>

      {/* ================================================================
          AI MATCH MODAL
      ================================================================ */}
      {showAIMatch && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '20px', backdropFilter: 'blur(4px)'
        }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'white', borderRadius: '20px', padding: '32px',
              maxWidth: '520px', width: '100%', maxHeight: '90vh', overflow: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>
                🤖 AI Caregiver Matching
              </h3>
              <button onClick={() => setShowAIMatch(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>
                <FaTimes />
              </button>
            </div>

            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
              Our AI analyzes your requirements and matches you with the most compatible caregivers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ModalField label="Care Type *">
                <select value={aiMatchData.careType}
                  onChange={(e) => setAIMatchData(p => ({ ...p, careType: e.target.value }))}
                  style={selectStyle}>
                  <option value="">Select care type</option>
                  <option value="Elderly Care">Elderly Care</option>
                  <option value="Post-Surgery Care">Post-Surgery Care</option>
                  <option value="Paralysis Care">Paralysis Care</option>
                  <option value="Dementia Care">Dementia Care</option>
                  <option value="Physiotherapy">Physiotherapy</option>
                  <option value="Pediatric Care">Pediatric/Newborn Care</option>
                  <option value="Palliative Care">Palliative Care</option>
                  <option value="Wound Care">Wound Care</option>
                  <option value="Diabetes Care">Diabetes Care</option>
                </select>
              </ModalField>

              <ModalField label="City *">
                <input type="text" placeholder="e.g. Mumbai"
                  value={aiMatchData.city}
                  onChange={(e) => setAIMatchData(p => ({ ...p, city: e.target.value }))}
                  style={inputStyle} />
              </ModalField>

              <ModalField label="Service Type">
                <select value={aiMatchData.serviceType}
                  onChange={(e) => setAIMatchData(p => ({ ...p, serviceType: e.target.value }))}
                  style={selectStyle}>
                  <option value="">Any</option>
                  <option value="personal">Personal Care</option>
                  <option value="skilled">Skilled Nursing</option>
                </select>
              </ModalField>

              <ModalField label="Preferred Languages">
                <input type="text" placeholder="Hindi, English, Tamil"
                  value={aiMatchData.languages}
                  onChange={(e) => setAIMatchData(p => ({ ...p, languages: e.target.value }))}
                  style={inputStyle} />
              </ModalField>

              <ModalField label="Gender Preference">
                <select value={aiMatchData.genderPreference}
                  onChange={(e) => setAIMatchData(p => ({ ...p, genderPreference: e.target.value }))}
                  style={selectStyle}>
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </ModalField>

              <ModalField label="Max Budget (₹/hour)">
                <input type="number" placeholder="e.g. 500"
                  value={aiMatchData.maxBudget}
                  onChange={(e) => setAIMatchData(p => ({ ...p, maxBudget: e.target.value }))}
                  style={inputStyle} />
              </ModalField>

              <ModalField label="Required Skills">
                <input type="text" placeholder="wound care, injection, physio"
                  value={aiMatchData.skillsRequired}
                  onChange={(e) => setAIMatchData(p => ({ ...p, skillsRequired: e.target.value }))}
                  style={inputStyle} />
              </ModalField>

              <button onClick={handleAIMatch}
                style={{
                  padding: '14px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white', border: 'none', borderRadius: '12px',
                  fontWeight: '700', fontSize: '16px', cursor: 'pointer', marginTop: '8px'
                }}>
                🤖 Find Best Matches
              </button>

              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                🔒 AI analysis is real-time. No data stored.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// ================================================================
// HELPER COMPONENTS
// ================================================================

const CaregiverCard = ({ caregiver: c, viewMode, getInitials, getRatingStars, onViewProfile, onBook }) => {
  const hourlyRate = c.pricing?.personal?.hourly || c.pricing?.skilled?.hourly || 'N/A';
  const isGrid = viewMode === 'grid';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white', borderRadius: '16px', padding: isGrid ? '20px' : '16px 20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9',
        cursor: 'pointer', transition: 'all 0.2s',
        display: isGrid ? 'block' : 'flex', gap: '16px', alignItems: 'center'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Avatar */}
      <div style={{
        width: isGrid ? '70px' : '56px', height: isGrid ? '70px' : '56px',
        borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: '700', fontSize: isGrid ? '20px' : '16px',
        flexShrink: 0, marginBottom: isGrid ? '12px' : '0'
      }}>
        {c.photo && c.photo !== 'https://placehold.co/400x400/e2e8f0/1e293b?text=Caregiver' ? (
          <img src={c.photo} alt={c.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        ) : getInitials(c.fullName)}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px' }}>
              {c.fullName}
              {c.isVerified && (
                <span style={{
                  marginLeft: '8px', padding: '2px 8px', background: '#d1fae5', color: '#065f46',
                  borderRadius: '12px', fontSize: '11px', fontWeight: '600'
                }}>✓ Verified</span>
              )}
            </h3>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
              {getRatingStars(c.ratings?.average || 0)}
              <span style={{ marginLeft: '6px' }}>({c.ratings?.count || c.totalReviews || 0})</span>
              <span style={{ margin: '0 8px' }}>•</span>
              {c.experienceYears} yrs exp
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#059669' }}>₹{hourlyRate}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>per hour</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0' }}>
          {c.specializations?.slice(0, 3).map((s, i) => (
            <span key={i} style={{
              padding: '4px 10px', background: '#eff6ff', color: '#1e40af',
              borderRadius: '12px', fontSize: '12px', fontWeight: '500'
            }}>{s}</span>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            📍 {c.location?.city || 'Available'} {c.distance && `• ${c.distance}km`}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={(e) => { e.stopPropagation(); onViewProfile(); }}
              style={{
                padding: '8px 16px', background: '#eff6ff', color: '#1e40af',
                border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer',
                fontWeight: '600', fontSize: '13px'
              }}>Profile</button>
            <button onClick={(e) => { e.stopPropagation(); onBook(); }}
              style={{
                padding: '8px 16px', background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontWeight: '600', fontSize: '13px'
              }}>Book Now</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SkeletonCard = ({ viewMode }) => (
  <div style={{
    background: 'white', borderRadius: '16px', padding: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)', animation: 'pulse 1.5s infinite'
  }}>
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#e2e8f0', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: '20px', background: '#e2e8f0', borderRadius: '6px', width: '60%', marginBottom: '8px' }} />
        <div style={{ height: '16px', background: '#e2e8f0', borderRadius: '6px', width: '40%', marginBottom: '12px' }} />
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ height: '24px', background: '#e2e8f0', borderRadius: '12px', width: '60px' }} />
          <div style={{ height: '24px', background: '#e2e8f0', borderRadius: '12px', width: '80px' }} />
        </div>
      </div>
    </div>
  </div>
);

const FilterSelect = ({ label, value, onChange, options }) => (
  <div>
    <label style={{ display: 'block', fontWeight: '600', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
      {options.map(([val, txt]) => <option key={val} value={val}>{txt}</option>)}
    </select>
  </div>
);

const FilterInput = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label style={{ display: 'block', fontWeight: '600', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
  </div>
);

const ModalField = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#374151', marginBottom: '4px' }}>{label}</label>
    {children}
  </div>
);

const PageButton = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    style={{
      padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      fontWeight: '600', fontSize: '14px', background: disabled ? '#e2e8f0' : '#3b82f6',
      color: disabled ? '#94a3b8' : 'white'
    }}>{children}</button>
);

// Shared Styles
const selectStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
  borderRadius: '8px', fontSize: '14px', color: '#1e293b',
  background: 'white', outline: 'none'
};

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
  borderRadius: '8px', fontSize: '14px', color: '#1e293b', outline: 'none'
};

// Animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`;
document.head.appendChild(styleSheet);

export default Caregivers;