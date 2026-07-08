import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCaregivers, getAICaregiverMatch, getCaregiverSuggestions } from '../services/api';

const Caregivers = () => {
  const navigate = useNavigate();
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [showAIMatch, setShowAIMatch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userLocation, setUserLocation] = useState(null);
  
  const [filters, setFilters] = useState({
    serviceType: '',
    gender: 'any',
    minExperience: '',
    minRating: '',
    maxHourlyRate: '',
    specializations: '',
    city: '',
    radius: 10
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

  const ITEMS_PER_PAGE = 6;

  // Fetch caregivers from API
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
        ...(filters.maxHourlyRate && { maxHourlyRate: filters.maxHourlyRate }),
        ...(filters.city && { city: filters.city })
      };

      const response = await getCaregivers(params);
      
      if (response.data.success) {
        let data = response.data.data;
        
        // Client-side specialization filter
        if (filters.specializations) {
          const specTerms = filters.specializations.toLowerCase().split(',').map(s => s.trim());
          data = data.filter(c => 
            c.specializations?.some(spec => 
              specTerms.some(term => spec.toLowerCase().includes(term))
            )
          );
        }
        
        setCaregivers(data);
        setTotalPages(response.data.pagination?.total || Math.ceil(data.length / ITEMS_PER_PAGE));
      }
    } catch (err) {
      setError('Failed to load caregivers. Please try again.');
      console.error('Fetch caregivers error:', err);
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
        setCaregivers(response.data.data);
        setTotalPages(1);
      }
    } catch (err) {
      alert('AI matching failed. Showing all caregivers instead.');
      fetchCaregivers();
    } finally {
      setLoading(false);
    }
  };

  // Search with suggestions
  const handleSearchInput = async (value) => {
    setSearchQuery(value);
    
    if (value.length >= 2) {
      try {
        const response = await getCaregiverSuggestions(value);
        if (response.data.success) {
          setSuggestions(response.data.data);
          setShowSuggestions(true);
        }
      } catch (err) {
        // Silently fail for suggestions
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'city') {
      setFilters(prev => ({ ...prev, city: suggestion.text }));
    } else if (suggestion.type === 'skill') {
      setFilters(prev => ({ 
        ...prev, 
        specializations: prev.specializations 
          ? prev.specializations + ', ' + suggestion.text 
          : suggestion.text 
      }));
    }
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          console.log('Location access denied');
        }
      );
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCaregivers(currentPage);
  }, [currentPage, fetchCaregivers]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      serviceType: '',
      gender: 'any',
      minExperience: '',
      minRating: '',
      maxHourlyRate: '',
      specializations: '',
      city: '',
      radius: 10
    });
    setCurrentPage(1);
  };

  const getServiceTypeBadge = (type) => {
    if (type === 'personal') return { icon: '🩺', text: 'Personal Care', color: '#dbeafe' };
    if (type === 'skilled') return { icon: '💉', text: 'Skilled Nursing', color: '#fce7f3' };
    return { icon: '🤝', text: 'Both', color: '#d1fae5' };
  };

  const getRatingStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '⭐'.repeat(full) + (half ? '½' : '');
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CG';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          🏠 Find Trusted Caregivers
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>
          AI-powered matching with verified home care professionals
        </p>
        
        {/* Search Bar */}
        <div style={{ 
          maxWidth: '700px', 
          margin: '0 auto', 
          position: 'relative' 
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            backgroundColor: 'white', 
            borderRadius: '3rem', 
            padding: '0.5rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <input
              type="text"
              placeholder="Search by skill, city, or caregiver name..."
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '3rem',
                fontSize: '1rem',
                outline: 'none',
                color: '#1e293b'
              }}
            />
            <button
              onClick={() => setShowAIMatch(true)}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '3rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '0.95rem'
              }}
            >
              🤖 AI Quick Match
            </button>
          </div>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '1rem',
              right: '1rem',
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              marginTop: '0.5rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              zIndex: 100,
              overflow: 'hidden'
            }}>
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onMouseDown={() => handleSuggestionClick(s)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    color: '#1e293b',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  {s.type === 'city' ? '📍' : '🎯'} {s.text}
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: 'auto' }}>
                    {s.type === 'city' ? 'City' : 'Skill'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Filters Panel */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '1rem', 
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: showFilters ? '1rem' : '0'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>
              🔍 Filter Caregivers
            </h3>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              {showFilters ? '▲ Hide Filters' : '▼ Show Filters'}
            </button>
          </div>
          
          {showFilters && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
              gap: '0.75rem' 
            }}>
              <select 
                value={filters.serviceType} 
                onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                style={filterSelectStyle}
              >
                <option value="">All Service Types</option>
                <option value="personal">🩺 Personal Care</option>
                <option value="skilled">💉 Skilled Nursing</option>
              </select>
              
              <select 
                value={filters.gender} 
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                style={filterSelectStyle}
              >
                <option value="any">Any Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              
              <select 
                value={filters.minExperience} 
                onChange={(e) => handleFilterChange('minExperience', e.target.value)}
                style={filterSelectStyle}
              >
                <option value="">Any Experience</option>
                <option value="2">2+ Years</option>
                <option value="5">5+ Years</option>
                <option value="10">10+ Years</option>
              </select>
              
              <select 
                value={filters.minRating} 
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                style={filterSelectStyle}
              >
                <option value="">Any Rating</option>
                <option value="4">⭐ 4.0 & above</option>
                <option value="4.5">⭐ 4.5 & above</option>
              </select>
              
              <input
                type="number"
                placeholder="Max hourly rate (₹)"
                value={filters.maxHourlyRate}
                onChange={(e) => handleFilterChange('maxHourlyRate', e.target.value)}
                style={filterInputStyle}
              />
              
              <input
                type="text"
                placeholder="City"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                style={filterInputStyle}
              />
              
              <input
                type="text"
                placeholder="Skills (comma separated)"
                value={filters.specializations}
                onChange={(e) => handleFilterChange('specializations', e.target.value)}
                style={filterInputStyle}
              />
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={resetFilters}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.85rem'
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <p style={{ color: '#64748b', fontWeight: '500' }}>
            {loading ? 'Searching...' : `Found ${caregivers.length} caregivers`}
          </p>
          
          {/* CTA for Caregivers */}
          <button
            onClick={() => navigate('/caregiver/register')}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: '#1e3a8a',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            Register as Caregiver →
          </button>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '1rem' 
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                animation: 'pulse 1.5s infinite'
              }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    backgroundColor: '#e2e8f0' 
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: '20px', backgroundColor: '#e2e8f0', borderRadius: '0.25rem', marginBottom: '0.5rem', width: '60%' }} />
                    <div style={{ height: '16px', backgroundColor: '#e2e8f0', borderRadius: '0.25rem', marginBottom: '0.5rem', width: '40%' }} />
                    <div style={{ height: '16px', backgroundColor: '#e2e8f0', borderRadius: '0.25rem', width: '80%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '1rem',
            border: '1px solid #fecaca'
          }}>
            <p style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '1.1rem' }}>⚠️ {error}</p>
            <button 
              onClick={() => fetchCaregivers()}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && caregivers.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            backgroundColor: 'white',
            borderRadius: '1rem'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>No Caregivers Found</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Try adjusting your filters or search criteria
            </p>
            <button 
              onClick={resetFilters}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Caregiver Cards Grid */}
        {!loading && !error && caregivers.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '1rem' 
          }}>
            {caregivers.map(c => {
              const badge = getServiceTypeBadge(c.serviceType);
              return (
                <div 
                  key={c._id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Match Score Badge (if AI matched) */}
                  {c.matchScore && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      backgroundColor: c.matchScore > 80 ? '#10b981' : c.matchScore > 60 ? '#f59e0b' : '#6b7280',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {c.matchScore}% Match
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {/* Avatar */}
                    {c.photo && c.photo !== 'https://placehold.co/400x400/e2e8f0/1e293b?text=Caregiver' ? (
                      <img 
                        src={c.photo} 
                        alt={c.fullName}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #e2e8f0'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        border: '3px solid #e2e8f0'
                      }}>
                        {getInitials(c.fullName)}
                      </div>
                    )}
                    
                    <div style={{ flex: 1 }}>
                      {/* Name + Verified Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                          {c.fullName}
                        </h3>
                        {c.isVerified && (
                          <span style={{
                            backgroundColor: '#d1fae5',
                            color: '#065f46',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.7rem',
                            fontWeight: '600'
                          }}>
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      
                      {/* Rating */}
                      <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        {getRatingStars(c.ratings?.average || 0)}
                        <span style={{ color: '#64748b', marginLeft: '0.25rem' }}>
                          ({c.ratings?.count || c.totalReviews || 0} reviews)
                        </span>
                      </div>
                      
                      {/* Experience + Service Type */}
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.25rem' }}>
                        {c.experienceYears} years exp • 
                        <span style={{
                          display: 'inline-block',
                          backgroundColor: badge.color,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          marginLeft: '0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {badge.icon} {badge.text}
                        </span>
                      </p>
                      
                      {/* Specializations */}
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.5rem' }}>
                        🎯 {c.specializations?.slice(0, 3).join(', ') || 'General Care'}
                      </p>
                      
                      {/* Location */}
                      <p style={{ fontSize: '0.85rem', color: '#3b82f6', margin: '0 0 0.5rem' }}>
                        📍 {c.location?.city || 'Available'}
                        {c.distance && ` • ${c.distance} km away`}
                      </p>
                      
                      {/* Price */}
                      <p style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 'bold', 
                        color: '#059669',
                        margin: '0 0 0.75rem'
                      }}>
                        ₹{c.pricing?.personal?.hourly || c.pricing?.skilled?.hourly || 'N/A'}/hour
                      </p>
                      
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => navigate(`/caregiver-profile/${c._id}`, { state: { caregiver: c } })}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            backgroundColor: '#eff6ff',
                            color: '#1e40af',
                            border: '1px solid #bfdbfe',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem'
                          }}
                        >
                          View Profile
                        </button>
                        <button 
                          onClick={() => navigate(`/book-caregiver/${c._id}`, { state: { caregiver: c } })}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem'
                          }}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: '1rem',
            marginTop: '2rem',
            padding: '1rem'
          }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: currentPage === 1 ? '#e2e8f0' : '#3b82f6',
                color: currentPage === 1 ? '#94a3b8' : 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: '600'
              }}
            >
              ← Previous
            </button>
            <span style={{ color: '#64748b', fontWeight: '500' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: currentPage === totalPages ? '#e2e8f0' : '#3b82f6',
                color: currentPage === totalPages ? '#94a3b8' : 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontWeight: '600'
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* AI Match Modal */}
      {showAIMatch && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                🤖 AI Caregiver Match
              </h2>
              <button 
                onClick={() => setShowAIMatch(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '1.5rem', 
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Tell us your requirements and our AI will find the best matches.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={modalLabelStyle}>Care Type *</label>
                <select 
                  value={aiMatchData.careType} 
                  onChange={(e) => setAIMatchData(prev => ({ ...prev, careType: e.target.value }))}
                  style={filterSelectStyle}
                >
                  <option value="">Select care type</option>
                  <option value="Elderly Care">Elderly Care</option>
                  <option value="Post-Surgery Care">Post-Surgery Care</option>
                  <option value="Paralysis Care">Paralysis Care</option>
                  <option value="Dementia Care">Dementia Care</option>
                  <option value="Physiotherapy">Physiotherapy</option>
                  <option value="Pediatric Care">Pediatric Care</option>
                  <option value="Palliative Care">Palliative Care</option>
                  <option value="Wound Care">Wound Care</option>
                  <option value="Diabetes Care">Diabetes Care</option>
                  <option value="Newborn Care">Newborn/Postnatal Care</option>
                </select>
              </div>
              
              <div>
                <label style={modalLabelStyle}>City *</label>
                <input 
                  type="text" 
                  placeholder="Enter city"
                  value={aiMatchData.city}
                  onChange={(e) => setAIMatchData(prev => ({ ...prev, city: e.target.value }))}
                  style={filterInputStyle}
                />
              </div>
              
              <div>
                <label style={modalLabelStyle}>Service Type</label>
                <select 
                  value={aiMatchData.serviceType} 
                  onChange={(e) => setAIMatchData(prev => ({ ...prev, serviceType: e.target.value }))}
                  style={filterSelectStyle}
                >
                  <option value="">Any</option>
                  <option value="personal">Personal Care</option>
                  <option value="skilled">Skilled Nursing</option>
                </select>
              </div>
              
              <div>
                <label style={modalLabelStyle}>Preferred Languages (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="Hindi, English, Tamil"
                  value={aiMatchData.languages}
                  onChange={(e) => setAIMatchData(prev => ({ ...prev, languages: e.target.value }))}
                  style={filterInputStyle}
                />
              </div>
              
              <div>
                <label style={modalLabelStyle}>Gender Preference</label>
                <select 
                  value={aiMatchData.genderPreference} 
                  onChange={(e) => setAIMatchData(prev => ({ ...prev, genderPreference: e.target.value }))}
                  style={filterSelectStyle}
                >
                  <option value="any">Any Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              
              <div>
                <label style={modalLabelStyle}>Max Budget (₹/hour)</label>
                <input 
                  type="number" 
                  placeholder="e.g., 500"
                  value={aiMatchData.maxBudget}
                  onChange={(e) => setAIMatchData(prev => ({ ...prev, maxBudget: e.target.value }))}
                  style={filterInputStyle}
                />
              </div>
              
              <div>
                <label style={modalLabelStyle}>Required Skills (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="wound care, injection, physio"
                  value={aiMatchData.skillsRequired}
                  onChange={(e) => setAIMatchData(prev => ({ ...prev, skillsRequired: e.target.value }))}
                  style={filterInputStyle}
                />
              </div>
              
              <button 
                onClick={handleAIMatch}
                style={{
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                🤖 Find Best Matches with AI
              </button>
            </div>
            
            <p style={{ 
              marginTop: '1rem', 
              fontSize: '0.75rem', 
              color: '#94a3b8', 
              textAlign: 'center' 
            }}>
              🔒 AI analysis is real-time. No health data stored.
            </p>
          </div>
        </div>
      )}

      {/* Add keyframe animation for skeleton */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

// Shared styles
const filterSelectStyle = {
  padding: '0.6rem',
  border: '1px solid #e2e8f0',
  borderRadius: '0.5rem',
  fontSize: '0.85rem',
  backgroundColor: 'white',
  color: '#1e293b',
  outline: 'none',
  width: '100%'
};

const filterInputStyle = {
  padding: '0.6rem',
  border: '1px solid #e2e8f0',
  borderRadius: '0.5rem',
  fontSize: '0.85rem',
  backgroundColor: 'white',
  color: '#1e293b',
  outline: 'none',
  width: '100%'
};

const modalLabelStyle = {
  display: 'block',
  fontWeight: '600',
  marginBottom: '0.25rem',
  fontSize: '0.85rem',
  color: '#374151'
};

export default Caregivers;