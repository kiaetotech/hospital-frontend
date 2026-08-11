// D:\hospital-frontend\src\pages\HomePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaHospital, FaAmbulance, FaShieldAlt, FaLeaf, FaSpa,
  FaUserMd, FaMoneyBillWave, FaVideo, FaBuilding, FaFlask,
  FaBrain, FaSearch, FaUser, FaUserTie, FaLock,
  FaBars, FaTimes, FaChevronDown, FaStar, FaArrowRight,
  FaUsers, FaClock, FaThumbsUp,
  FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube,
  FaApple, FaGooglePlay, FaMapMarkerAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProviderDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const services = [
    { id: 'hospitals', icon: <FaHospital />, label: 'Find Hospitals', desc: '1,200+ Providers', color: '#3b82f6', bg: '#eff6ff', path: '/hospitals' },
    { id: 'ambulance', icon: <FaAmbulance />, label: 'Book Ambulance', desc: '500+ Vehicles', color: '#f59e0b', bg: '#fffbeb', path: '/ambulance' },
    { id: 'online', icon: <FaVideo />, label: 'Online Doctor', desc: '24/7 Consult', color: '#14b8a6', bg: '#f0fdfa', path: '/online-doctor' },
    { id: 'diagnostics', icon: <FaFlask />, label: 'Lab Tests & Packages', desc: '1,000+ Tests', color: '#06b6d4', bg: '#ecfeff', path: '/diagnostics' },
    { id: 'ayurveda', icon: <FaSpa />, label: 'Ayurveda & Wellness', desc: '450+ Doctors', color: '#8b5cf6', bg: '#f5f3ff', path: '/ayurveda' },
    { id: 'homeopathy', icon: <FaLeaf />, label: 'Homeopathy Care', desc: '300+ Doctors', color: '#059669', bg: '#ecfdf5', path: '/homeopathy' },
    { id: 'mentalhealth', icon: <FaBrain />, label: 'Mental Wellness', desc: '150+ Therapists', color: '#8b5cf6', bg: '#f5f3ff', path: '/mentalhealth' },
    { id: 'homecare', icon: <FaUserMd />, label: 'Home Care', desc: '200+ Caregivers', color: '#ec4899', bg: '#fdf2f8', path: '/caregivers' },
    { id: 'insurance', icon: <FaShieldAlt />, label: 'Health Insurance', desc: 'Compare & Buy', color: '#10b981', bg: '#ecfdf5', path: '/insurance' },
    { id: 'emi', icon: <FaMoneyBillWave />, label: 'Health on EMI', desc: '0% EMI Available', color: '#6366f1', bg: '#eef2ff', path: '/financing' },
    { id: 'corporate', icon: <FaBuilding />, label: 'Corporate Health', desc: 'For Companies', color: '#64748b', bg: '#f8fafc', path: '/corporate' }
  ];

  const providerRoles = [
    { icon: '🧠', label: 'Therapist', path: '/mentalhealth/therapist/login' },
    { icon: '🏥', label: 'Hospital', path: '/hospital/login' },
    { icon: '🚑', label: 'Ambulance', path: '/ambulance/login' },
    { icon: '🏠', label: 'Home Care', path: '/caregiver/login' },
    { icon: '🔬', label: 'Diagnostics Lab', path: '/diagnostics/login' },
    { icon: '💰', label: 'Lender', path: '/lender/login' },
    { icon: '🛡️', label: 'Insurance', path: '/insurance/company/login' },
    { icon: '🧘', label: 'Ayurveda Doctor', path: '/ayurveda/doctor/login' },
    { icon: '🌿', label: 'Homeopathy Doctor', path: '/homeopathy/doctor/login' },
    { icon: '🏢', label: 'Corporate HR', path: '/corporate/hr/login' }
  ];

  const testimonials = [
    { name: 'Rajesh K.', location: 'Mumbai', rating: 5, text: 'Found the best hospital for my mother\'s surgery within minutes. The platform is a lifesaver!', icon: '👨‍💼' },
    { name: 'Priya M.', location: 'Delhi', rating: 5, text: 'Ambulance arrived in 5 minutes during emergency. The tracking feature gave us peace of mind.', icon: '👩‍💼' },
    { name: 'Aditya S.', location: 'Bangalore', rating: 5, text: 'Mental health counseling changed my life. I found the perfect therapist through this platform.', icon: '👨‍💻' },
    { name: 'Sunita R.', location: 'Pune', rating: 5, text: 'The health insurance comparison saved me ₹15,000 on my family policy. Highly recommended!', icon: '👩‍🏫' },
    { name: 'Vikram P.', location: 'Hyderabad', rating: 5, text: 'Booked a full body checkup for my parents. The process was smooth and results were quick.', icon: '👨‍💼' }
  ];

  const articles = [
    { title: '12 Coronavirus Myths and Facts', category: 'Coronavirus', author: 'Dr. Diana Borgio', image: '🦠', date: 'Dec 15, 2024' },
    { title: 'Eating Right to Build Immunity Against Cold', category: 'Vitamins & Supplements', author: 'Dr. Diana Borgio', image: '🥗', date: 'Dec 12, 2024' },
    { title: 'Mental Health in the Digital Age', category: 'Mental Health', author: 'Dr. Sarah Johnson', image: '🧠', date: 'Dec 10, 2024' }
  ];

  // AI-Powered Hospital Search with Location
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    const q = searchQuery.toLowerCase().trim();
    const loc = location.trim();

    try {
      // Call backend AI service for smart search
      const api = (await import('../services/api')).default;
      const response = await api.post('/caregivers/ai-match', {
        careType: searchQuery,
        city: loc || 'Mumbai'
      }).catch(() => null);

      // Route based on AI or keyword matching
      if (q.includes('hospital') || q.includes('clinic') || q.includes('bed') || q.includes('icu') || q.includes('ward')) {
        navigate(`/hospitals${loc ? `?city=${encodeURIComponent(loc)}` : ''}`);
      } else if (q.includes('doctor') || q.includes('physician') || q.includes('specialist') || q.includes('consult')) {
        navigate(`/online-doctor${loc ? `?city=${encodeURIComponent(loc)}` : ''}`);
      } else if (q.includes('lab') || q.includes('test') || q.includes('blood') || q.includes('xray') || q.includes('mri') || q.includes('scan') || q.includes('checkup')) {
        navigate(`/diagnostics${loc ? `?city=${encodeURIComponent(loc)}` : ''}`);
      } else if (q.includes('ambulance') || q.includes('emergency')) {
        navigate(`/ambulance`);
      } else if (q.includes('caregiver') || q.includes('nurse') || q.includes('home care') || q.includes('attendant')) {
        navigate(`/caregivers${loc ? `?city=${encodeURIComponent(loc)}` : ''}`);
      } else if (q.includes('ayurveda') || q.includes('ayurvedic') || q.includes('panchakarma') || q.includes('prakriti')) {
        navigate(`/ayurveda`);
      } else if (q.includes('homeopathy') || q.includes('homeopathic') || q.includes('remedy')) {
        navigate(`/homeopathy`);
      } else if (q.includes('mental') || q.includes('therapy') || q.includes('counseling') || q.includes('depression') || q.includes('anxiety')) {
        navigate(`/mentalhealth`);
      } else if (q.includes('insurance') || q.includes('policy') || q.includes('cover')) {
        navigate(`/insurance`);
      } else if (q.includes('emi') || q.includes('loan') || q.includes('finance') || q.includes('installment')) {
        navigate(`/financing`);
      } else if (q.includes('corporate') || q.includes('company') || q.includes('employee') || q.includes('hr')) {
        navigate(`/corporate`);
      } else {
        // Default: search hospitals with query
        navigate(`/hospitals${loc ? `?city=${encodeURIComponent(loc)}&search=${encodeURIComponent(searchQuery)}` : `?search=${encodeURIComponent(searchQuery)}`}`);
      }
    } catch (err) {
      navigate(`/hospitals`);
    } finally {
      setIsSearching(false);
    }
  };

  // Search suggestions
  const handleSearchInput = (value) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      const commonSearches = [
        { type: 'service', text: 'Hospitals with ICU near me' },
        { type: 'service', text: 'Cardiac hospitals' },
        { type: 'service', text: 'Online Doctor Consultation' },
        { type: 'service', text: 'Full Body Checkup' },
        { type: 'service', text: 'Ambulance Service' },
        { type: 'service', text: 'Home Care Services' },
        { type: 'service', text: 'Ayurveda Treatment' },
        { type: 'service', text: 'Health Insurance Plans' }
      ].filter(s => s.text.toLowerCase().includes(value.toLowerCase()));
      setAiSuggestions(commonSearches);
      setShowSuggestions(commonSearches.length > 0);
    } else {
      setAiSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    handleSearch({ preventDefault: () => {} });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ================================================================
          NAVBAR - Single line, no search bar
      ================================================================ */}
      <nav style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid #e2e8f0',
        height: '56px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '100%'
        }}>
          {/* Logo Only - No Search Bar */}
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <span style={{
              fontSize: '20px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🏥 HealthCare Hub
            </span>
          </div>

          {/* Right Side Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <Link to="/login" style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '14px', fontWeight: '600',
              color: 'white', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap'
            }}>
              <FaUser size={13} /> Patient Login
            </Link>

            {/* Provider Dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                onMouseEnter={() => setShowProviderDropdown(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '14px', fontWeight: '600',
                  color: '#7c3aed', background: '#f5f3ff', borderRadius: '8px', border: '1.5px solid #7c3aed', cursor: 'pointer', whiteSpace: 'nowrap'
                }}
              >
                <FaUserTie size={13} /> Provider <FaChevronDown style={{ fontSize: '10px' }} />
              </button>
              {showProviderDropdown && (
                <div
                  onMouseLeave={() => setShowProviderDropdown(false)}
                  style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '6px', width: '240px',
                    background: 'white', borderRadius: '10px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    border: '1px solid #e2e8f0', padding: '8px 0', zIndex: 1000
                  }}
                >
                  {providerRoles.map((role) => (
                    <Link
                      key={role.path}
                      to={role.path}
                      onClick={() => setShowProviderDropdown(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px',
                        textDecoration: 'none', fontSize: '14px', color: '#334155', cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: '16px' }}>{role.icon}</span> {role.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/admin/login" style={{
              display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', fontSize: '13px', fontWeight: '600',
              color: '#dc2626', background: '#fef2f2', borderRadius: '8px', textDecoration: 'none', border: '1px solid #fecaca', whiteSpace: 'nowrap'
            }}>
              <FaLock size={12} /> Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* ================================================================
          HERO BANNER with AI Search + Location
      ================================================================ */}
      <section style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #db2777 100%)',
        padding: '32px 20px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            {/* Emergency Badge */}
            <div style={{ marginBottom: '8px' }}>
              <span
                onClick={() => navigate('/ambulance')}
                style={{
                  background: '#ef4444', padding: '5px 18px', borderRadius: '20px',
                  fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block'
                }}
              >
                🚨 Emergency? Click Here
              </span>
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '6px' }}>
              Your Health, Our Priority
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', marginBottom: '20px' }}>
              India's Most Trusted Healthcare Marketplace
            </p>

            {/* AI Search Form */}
            <form onSubmit={handleSearch} style={{
              display: 'flex', gap: '0', maxWidth: '700px', margin: '0 auto 16px',
              background: 'white', borderRadius: '12px', overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
              {/* Search Input */}
              <div ref={searchRef} style={{ flex: 2, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: '16px' }}>
                  <FaSearch style={{ color: '#94a3b8', fontSize: '16px', flexShrink: 0 }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder="Search hospitals, doctors, tests, treatments..."
                    style={{
                      width: '100%', padding: '14px 12px', border: 'none', outline: 'none',
                      fontSize: '15px', color: '#1e293b', background: 'transparent'
                    }}
                  />
                </div>
                {/* Suggestions Dropdown */}
                {showSuggestions && aiSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, background: 'white',
                    borderRadius: '0 0 12px 12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    zIndex: 100, overflow: 'hidden', textAlign: 'left', border: '1px solid #e2e8f0'
                  }}>
                    {aiSuggestions.map((s, i) => (
                      <div
                        key={i}
                        onClick={() => handleSuggestionClick(s)}
                        style={{
                          padding: '12px 20px', cursor: 'pointer', color: '#1e293b', fontSize: '14px',
                          borderBottom: i < aiSuggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                          display: 'flex', alignItems: 'center', gap: '10px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        🔍 {s.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div style={{ width: '1px', backgroundColor: '#e2e8f0', margin: '8px 0' }} />

              {/* Location Input */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '12px' }}>
                <FaMapMarkerAlt style={{ color: '#ef4444', fontSize: '16px', flexShrink: 0 }} />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City / Location"
                  style={{
                    width: '100%', padding: '14px 12px', border: 'none', outline: 'none',
                    fontSize: '15px', color: '#1e293b', background: 'transparent'
                  }}
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                disabled={isSearching}
                style={{
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white', border: 'none', cursor: 'pointer',
                  fontSize: '16px', fontWeight: '700', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                {isSearching ? (
                  <>⏳ Searching...</>
                ) : (
                  <><FaSearch size={16} /> Search</>
                )}
              </button>
            </form>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { icon: '🚨', label: 'Emergency', path: '/ambulance', color: '#DC2626' },
                { icon: '📋', label: 'Book Doctor', path: '/online-doctor', color: '#2563EB' },
                { icon: '💉', label: 'Lab Tests', path: '/diagnostics', color: '#059669' },
                { icon: '📞', label: '24/7 Helpline', path: '/mentalhealth/crisis', color: '#EA580C' }
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px',
                    background: item.color, color: 'white', borderRadius: '10px', cursor: 'pointer',
                    fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {item.icon} {item.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          11 SERVICE CARDS
      ================================================================ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>💡 Healthcare Services</h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Compare, choose, book — all in minutes</p>
        </div>

        {/* Row 1: 6 Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '14px' }}>
          {services.slice(0, 6).map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              onClick={() => navigate(service.path)}
              style={{
                background: 'white', borderRadius: '14px', padding: '18px 12px', textAlign: 'center',
                cursor: 'pointer', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9',
                transition: 'all 0.3s ease', position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = service.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#f1f5f9';
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: service.color, borderRadius: '4px 4px 0 0' }} />
              <div style={{ fontSize: '32px', color: service.color, marginBottom: '8px' }}>{service.icon}</div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px' }}>{service.label}</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0', fontWeight: '500' }}>{service.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Row 2: 5 Cards Centered */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {services.slice(6, 11).map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: (index + 6) * 0.04 }}
              onClick={() => navigate(service.path)}
              style={{
                background: 'white', borderRadius: '14px', padding: '18px 12px', textAlign: 'center',
                cursor: 'pointer', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9',
                transition: 'all 0.3s ease', position: 'relative',
                width: 'calc((100% - 56px) / 5)', minWidth: '145px', maxWidth: '185px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = service.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#f1f5f9';
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: service.color, borderRadius: '4px 4px 0 0' }} />
              <div style={{ fontSize: '32px', color: service.color, marginBottom: '8px' }}>{service.icon}</div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px' }}>{service.label}</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0', fontWeight: '500' }}>{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================================================================
          WHY CHOOSE US
      ================================================================ */}
      <section style={{ background: 'white', padding: '32px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b' }}>🌟 Why HealthCare Hub?</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Trusted by millions of Indians</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {[
              { icon: <FaShieldAlt style={{ color: '#3b82f6', fontSize: '32px' }} />, title: 'Verified Providers', desc: 'All healthcare partners are background verified' },
              { icon: <FaThumbsUp style={{ color: '#10b981', fontSize: '32px' }} />, title: 'Best Price Guaranteed', desc: 'Compare prices and save on healthcare' },
              { icon: <FaClock style={{ color: '#8b5cf6', fontSize: '32px' }} />, title: '24/7 Support', desc: 'Emergency assistance available round the clock' },
              { icon: <FaUsers style={{ color: '#f59e0b', fontSize: '32px' }} />, title: 'Easy Booking', desc: 'Book appointments in under 60 seconds' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '14px' }}
              >
                <div style={{ marginBottom: '8px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: '0 0 4px' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS
      ================================================================ */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
          📋 How It Works
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
          {[
            { icon: '🔍', title: 'Search & Find', desc: 'Find the best healthcare providers near you' },
            { icon: '📊', title: 'Compare Prices', desc: 'Compare ratings and prices side by side' },
            { icon: '📅', title: 'Book Instantly', desc: 'Book your appointment in 60 seconds' },
            { icon: '✅', title: 'Get Treated', desc: 'Pay online or at the facility' }
          ].map((step, i) => (
            <div key={i} style={{ textAlign: 'center', width: '160px' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>{step.icon}</div>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 4px' }}>{step.title}</h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          HEALTH INSIGHTS
      ================================================================ */}
      <section style={{ background: 'white', padding: '32px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: '0' }}>📰 Health Insights</h2>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>Expert articles to keep you informed</p>
            </div>
            <Link to="/blog" style={{ color: '#2563eb', fontWeight: '600', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              View All <FaArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
            {articles.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => navigate('/blog')}
                style={{
                  background: '#f8fafc', borderRadius: '14px', overflow: 'hidden',
                  border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)' }}>
                  {article.image}
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#2563eb', background: '#eff6ff', padding: '3px 12px', borderRadius: '10px' }}>{article.category}</span>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '8px 0 4px' }}>{article.title}</h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0' }}>By {article.author} • {article.date}</p>
                  <span style={{ display: 'inline-block', marginTop: '8px', color: '#2563eb', fontWeight: '600', fontSize: '13px' }}>Read More →</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          TESTIMONIALS
      ================================================================ */}
      <section style={{ background: 'linear-gradient(135deg, #1e40af, #7c3aed)', padding: '32px 20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>💬 What Our Users Say</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '16px' }}>Real stories from real people</p>
          <div style={{ position: 'relative', minHeight: '130px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
                  borderRadius: '16px', padding: '24px 28px', border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <div style={{ fontSize: '20px', color: '#fbbf24', marginBottom: '8px' }}>
                  {'⭐'.repeat(testimonials[currentTestimonial].rating)}
                </div>
                <p style={{ fontSize: '16px', color: 'white', lineHeight: '1.6', fontStyle: 'italic', margin: '0' }}>
                  "{testimonials[currentTestimonial].text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
                  <span style={{ fontSize: '28px' }}>{testimonials[currentTestimonial].icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ color: 'white', fontWeight: '700', fontSize: '15px', margin: '0' }}>{testimonials[currentTestimonial].name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0' }}>{testimonials[currentTestimonial].location}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  style={{
                    width: '10px', height: '10px', borderRadius: '50%', border: 'none',
                    background: index === currentTestimonial ? 'white' : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer', transition: 'all 0.3s', padding: 0
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          DOWNLOAD APP
      ================================================================ */}
      <section style={{ background: 'white', padding: '24px 20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px' }}>📱 Download Our App</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 12px' }}>Book appointments, track health, get reminders</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => window.open('https://play.google.com', '_blank')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                <FaGooglePlay size={18} /> Play Store
              </button>
              <button onClick={() => window.open('https://www.apple.com/app-store/', '_blank')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                <FaApple size={18} /> App Store
              </button>
            </div>
          </div>
          <div style={{ fontSize: '56px', opacity: 0.8 }}>📱</div>
        </div>
      </section>

      {/* ================================================================
          FOOTER
      ================================================================ */}
      <footer style={{ background: '#0f172a', color: 'white', padding: '28px 20px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '20px' }}>
            <div>
              <h4 style={{ fontWeight: '600', margin: '0 0 10px 0', fontSize: '14px', color: '#e2e8f0' }}>For Patients</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><Link to="/hospitals" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Find Hospitals</Link></li>
                <li><Link to="/ambulance" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Book Ambulance</Link></li>
                <li><Link to="/online-doctor" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Online Doctor</Link></li>
                <li><Link to="/diagnostics" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Lab Tests</Link></li>
                <li><Link to="/my-bookings" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>My Bookings</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', margin: '0 0 10px 0', fontSize: '14px', color: '#e2e8f0' }}>For Providers</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><Link to="/caregiver/register" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Register as Provider</Link></li>
                <li><Link to="/caregiver/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Provider Login</Link></li>
                <li><Link to="/partner" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Partner With Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', margin: '0 0 10px 0', fontSize: '14px', color: '#e2e8f0' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><Link to="/about" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>About Us</Link></li>
                <li><Link to="/blog" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Blog</Link></li>
                <li><Link to="/contact" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Contact Us</Link></li>
                <li><Link to="/careers" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', margin: '0 0 10px 0', fontSize: '14px', color: '#e2e8f0' }}>Support</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><Link to="/help" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Help Center</Link></li>
                <li><Link to="/faq" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>FAQ</Link></li>
                <li><Link to="/grievance" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Grievance Redressal</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', margin: '0 0 10px 0', fontSize: '14px', color: '#e2e8f0' }}>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Privacy Policy</Link></li>
                <li><Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Terms & Conditions</Link></li>
                <li><Link to="/refund" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Refund Policy</Link></li>
                <li><Link to="/disclaimer" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Disclaimer</Link></li>
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', fontSize: '18px' }}><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', fontSize: '18px' }}><FaTwitter /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', fontSize: '18px' }}><FaLinkedin /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', fontSize: '18px' }}><FaInstagram /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', fontSize: '18px' }}><FaYoutube /></a>
          </div>

          <div style={{ textAlign: 'center', paddingTop: '14px', borderTop: '1px solid #1e293b' }}>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 4px 0' }}>
              📧 support@healthcarehub.com &nbsp;•&nbsp; 📞 +91-XXXXXXXXXX &nbsp;•&nbsp; 📍 Mumbai, India
            </p>
            <p style={{ color: '#475569', fontSize: '12px', margin: '0' }}>
              © 2025 HealthCare Hub — India's Most Trusted Healthcare Marketplace
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

