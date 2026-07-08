// D:\hospital-frontend\src\pages\HomePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaHospital, FaAmbulance, FaShieldAlt, FaLeaf, FaSpa, 
  FaUserMd, FaMoneyBillWave, FaVideo, FaBuilding, FaFlask,
  FaBrain, FaSearch, FaPhoneAlt, FaUser, FaUserTie, FaLock,
  FaBars, FaTimes, FaChevronDown, FaStar, FaArrowRight,
  FaHeart, FaUsers, FaClock, FaThumbsUp,
  FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube,
  FaApple, FaGooglePlay, FaMapMarkerAlt, FaEnvelope
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    const providerToken = localStorage.getItem('providerToken');
    if (token || adminToken || providerToken) {
      setIsLoggedIn(true);
    }

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const services = [
    { id: 'hospitals', icon: <FaHospital />, label: 'Find Hospitals', desc: '1,200+ Providers', color: '#3b82f6', bg: '#eff6ff', path: '/hospitals' },
    { id: 'ambulance', icon: <FaAmbulance />, label: 'Book Ambulance', desc: '500+ Vehicles', color: '#f59e0b', bg: '#fffbeb', path: '/ambulance' },
    { id: 'online', icon: <FaVideo />, label: 'Online Doctor', desc: '24/7 Consult', color: '#14b8a6', bg: '#f0fdfa', path: '/online-doctor' },
    { id: 'diagnostics', icon: <FaFlask />, label: 'Lab Tests & Packages', desc: '1,000+ Tests', color: '#06b6d4', bg: '#ecfeff', path: '/diagnostics' },
    { id: 'ayurveda', icon: <FaSpa />, label: 'Ayurveda & Wellness', desc: '450+ Doctors', color: '#8b5cf6', bg: '#f5f3ff', path: '/ayurveda' },
    { id: 'homeopathy', icon: <FaLeaf />, label: 'Homeopathy Care', desc: '300+ Doctors', color: '#059669', bg: '#ecfdf5', path: '/homeopathy' },
    { id: 'mentalhealth', icon: <FaBrain />, label: 'Mental Wellness', desc: '150+ Therapists', color: '#8b5cf6', bg: '#f5f3ff', path: '/mentalhealth' },
    { id: 'caregiver', icon: <FaUserMd />, label: 'Home Care', desc: '200+ Providers', color: '#ec4899', bg: '#fdf2f8', path: '/caregivers' },
    { id: 'insurance', icon: <FaShieldAlt />, label: 'Health Insurance', desc: 'Compare & Buy', color: '#10b981', bg: '#ecfdf5', path: '/insurance' },
    { id: 'emi', icon: <FaMoneyBillWave />, label: 'Health on EMI', desc: '0% EMI Available', color: '#6366f1', bg: '#eef2ff', path: '/financing' },
    { id: 'corporate', icon: <FaBuilding />, label: 'Corporate Health', desc: 'For Companies', color: '#64748b', bg: '#f8fafc', path: '/corporate' }
  ];

  const providerRoles = [
    { icon: '🧠', label: 'Therapist', path: '/mentalhealth/therapist/login' },
    { icon: '🏥', label: 'Hospital', path: '/hospital/login' },
    { icon: '🚑', label: 'Ambulance', path: '/ambulance/login' },
    { icon: '🏠', label: 'Caregiver', path: '/caregiver/login' },
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&loc=${encodeURIComponent(location)}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ================================================================
          NAVBAR - Clean, No Extra Links
      ================================================================ */}
      <nav style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid #e2e8f0',
        height: '52px'
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
          {/* Logo */}
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '18px', fontWeight: '700', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🏥 HealthCare Hub
            </span>
          </div>

          {/* Center: Search Bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: '400px', margin: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <FaSearch style={{ color: '#94a3b8', marginLeft: '12px', fontSize: '14px', flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospitals, doctors, tests..."
                style={{ width: '100%', padding: '8px 12px', border: 'none', outline: 'none', fontSize: '14px', color: '#1e293b', background: 'transparent' }}
              />
              <button type="submit" style={{ padding: '8px 14px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                <FaSearch size={14} />
              </button>
            </div>
          </form>

          {/* Right: Login Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Patient Login */}
            <Link to="/login" style={{
              display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 16px', fontSize: '13px', fontWeight: '600',
              color: 'white', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '7px', textDecoration: 'none', whiteSpace: 'nowrap'
            }}>
              <FaUser size={12} /> Patient Login
            </Link>

            {/* Provider Login Dropdown */}
            <div style={{ position: 'relative' }} onMouseEnter={() => setShowProviderDropdown(true)} onMouseLeave={() => setShowProviderDropdown(false)}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 16px', fontSize: '13px', fontWeight: '600',
                color: '#7c3aed', background: '#f5f3ff', borderRadius: '7px', border: '1.5px solid #7c3aed', cursor: 'pointer', whiteSpace: 'nowrap'
              }}>
                <FaUserTie size={12} /> Provider <FaChevronDown style={{ fontSize: '9px' }} />
              </button>
              {showProviderDropdown && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', width: '220px', background: 'white', borderRadius: '10px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', padding: '6px 0', zIndex: 100 }}>
                  {providerRoles.map((role) => (
                    <Link key={role.path} to={role.path} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px', textDecoration: 'none', fontSize: '13px', color: '#334155' }}>
                      <span>{role.icon}</span> {role.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Admin */}
            <Link to="/admin/login" style={{
              display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', fontSize: '12px', fontWeight: '600',
              color: '#dc2626', background: '#fef2f2', borderRadius: '6px', textDecoration: 'none', border: '1px solid #fecaca', whiteSpace: 'nowrap'
            }}>
              <FaLock size={11} /> Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ display: 'none', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div style={{ background: 'white', borderTop: '1px solid #e2e8f0', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Link to="/login" style={{ padding: '10px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', borderRadius: '8px', textDecoration: 'none', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>👤 Patient Login</Link>
            <Link to="/admin/login" style={{ padding: '10px', background: '#dc2626', color: 'white', borderRadius: '8px', textDecoration: 'none', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>🔑 Admin Login</Link>
          </div>
        )}
      </nav>

      {/* ================================================================
          HERO BANNER - Compact
      ================================================================ */}
      <section style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #db2777 100%)',
        padding: '16px 20px 12px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ background: '#ef4444', padding: '3px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}>
                🚨 Emergency?
              </span>
            </div>
            
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '2px' }}>
              Your Health, Our Priority
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '12px' }}>
              India's Most Trusted Healthcare Marketplace
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', maxWidth: '600px', margin: '0 auto 10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ flex: 2, minWidth: '180px', display: 'flex', alignItems: 'center', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                <FaSearch style={{ color: '#94a3b8', marginLeft: '12px', fontSize: '14px', flexShrink: 0 }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for Hospitals, Doctors, Services..."
                  style={{ width: '100%', padding: '10px 12px', border: 'none', outline: 'none', fontSize: '14px', color: '#1e293b' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                <FaMapMarkerAlt style={{ color: '#94a3b8', marginLeft: '10px', fontSize: '14px', flexShrink: 0 }} />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  style={{ width: '100%', padding: '10px 12px', border: 'none', outline: 'none', fontSize: '14px', color: '#1e293b' }}
                />
              </div>
            </form>

            {/* 4 Quick Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { icon: '🚨', label: 'Emergency', path: '/emergency-search', color: '#DC2626' },
                { icon: '📋', label: 'Book Now', path: '/my-bookings', color: '#2563EB' },
                { icon: '💊', label: 'Lab Tests', path: '/diagnostics', color: '#059669' },
                { icon: '📞', label: '24/7 Help', path: '/mentalhealth/crisis', color: '#EA580C' }
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                    background: item.color, color: 'white', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', transition: 'all 0.2s ease'
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
          11 SERVICE CARDS - 2 Rows (6 + 5 centered)
      ================================================================ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b' }}>💡 Healthcare Services</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Compare, choose, book — all in minutes</p>
        </div>

        {/* Row 1: 6 Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '12px' }}>
          {services.slice(0, 6).map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              onClick={() => navigate(service.path)}
              style={{
                background: 'white', borderRadius: '12px', padding: '14px 10px', textAlign: 'center',
                cursor: 'pointer', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9',
                transition: 'all 0.3s ease', position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = service.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#f1f5f9';
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: service.color, borderRadius: '3px 3px 0 0' }} />
              <div style={{ fontSize: '28px', color: service.color, marginBottom: '4px' }}>{service.icon}</div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0', letterSpacing: '0.01em' }}>{service.label}</h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>{service.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Row 2: 5 Cards Centered */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {services.slice(6, 11).map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: (index + 6) * 0.04 }}
              onClick={() => navigate(service.path)}
              style={{
                background: 'white', borderRadius: '12px', padding: '14px 10px', textAlign: 'center',
                cursor: 'pointer', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9',
                transition: 'all 0.3s ease', position: 'relative',
                width: 'calc((100% - 48px) / 5)', minWidth: '130px', maxWidth: '170px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = service.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#f1f5f9';
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: service.color, borderRadius: '3px 3px 0 0' }} />
              <div style={{ fontSize: '28px', color: service.color, marginBottom: '4px' }}>{service.icon}</div>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: '0' }}>{service.label}</h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================================================================
          WHY CHOOSE US - Compact
      ================================================================ */}
      <section style={{ background: 'white', padding: '28px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>🌟 Why HealthCare Hub?</h2>
            <p style={{ color: '#64748b', fontSize: '13px' }}>Trusted by millions of Indians</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { icon: <FaShieldAlt style={{ color: '#3b82f6', fontSize: '28px' }} />, title: 'Verified Providers', desc: 'Trusted healthcare partners' },
              { icon: <FaThumbsUp style={{ color: '#10b981', fontSize: '28px' }} />, title: 'Best Price', desc: 'Compare and save money' },
              { icon: <FaClock style={{ color: '#8b5cf6', fontSize: '28px' }} />, title: '24/7 Service', desc: 'Emergency support always' },
              { icon: <FaUsers style={{ color: '#f59e0b', fontSize: '28px' }} />, title: 'Easy Booking', desc: 'Book in 60 seconds' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}
              >
                <div style={{ marginBottom: '6px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0' }}>{item.title}</h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS - 4 Steps
      ================================================================ */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 20px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>
          📋 How It Works
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
          {[
            { icon: '🔍', title: 'Search & Find', desc: 'Find best hospitals, doctors, labs near you' },
            { icon: '📊', title: 'Compare Prices', desc: 'Compare ratings & prices side by side' },
            { icon: '📅', title: 'Book Instantly', desc: 'Book your appointment in 60 seconds' },
            { icon: '✅', title: 'Get Treated', desc: 'Pay online or at facility' }
          ].map((step, i) => (
            <div key={i} style={{ textAlign: 'center', width: '140px' }}>
              <div style={{ fontSize: '32px', marginBottom: '6px' }}>{step.icon}</div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '0' }}>{step.title}</h4>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          HEALTH INSIGHTS - Compact Blog Cards
      ================================================================ */}
      <section style={{ background: 'white', padding: '28px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: '0' }}>📰 Health Insights</h2>
              <p style={{ color: '#64748b', fontSize: '12px', margin: '2px 0 0 0' }}>Expert articles to keep you informed</p>
            </div>
            <Link to="/blog" style={{ color: '#2563eb', fontWeight: '600', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              View All <FaArrowRight size={12} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {articles.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => navigate('/blog')}
                style={{
                  background: '#f8fafc', borderRadius: '12px', overflow: 'hidden',
                  border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)' }}>
                  {article.image}
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#2563eb', background: '#eff6ff', padding: '2px 10px', borderRadius: '8px' }}>{article.category}</span>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '6px 0 0 0' }}>{article.title}</h3>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '3px 0 0 0' }}>By {article.author} • {article.date}</p>
                  <span style={{ display: 'inline-block', marginTop: '6px', color: '#2563eb', fontWeight: '600', fontSize: '12px' }}>Read More →</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          TESTIMONIALS - Compact Carousel
      ================================================================ */}
      <section style={{ background: 'linear-gradient(135deg, #1e40af, #7c3aed)', padding: '28px 20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '2px' }}>💬 What Our Users Say</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '12px' }}>Real stories from real people</p>

          <div style={{ position: 'relative', minHeight: '120px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
                  borderRadius: '14px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <div style={{ fontSize: '18px', color: '#fbbf24', marginBottom: '6px' }}>
                  {'⭐'.repeat(testimonials[currentTestimonial].rating)}
                </div>
                <p style={{ fontSize: '15px', color: 'white', lineHeight: '1.5', fontStyle: 'italic', margin: '0' }}>
                  "{testimonials[currentTestimonial].text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{testimonials[currentTestimonial].icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', margin: '0' }}>{testimonials[currentTestimonial].name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '0' }}>{testimonials[currentTestimonial].location}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  style={{
                    width: '8px', height: '8px', borderRadius: '50%', border: 'none',
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
          DOWNLOAD APP - Small Banner
      ================================================================ */}
      <section style={{ background: 'white', padding: '20px 20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: '0' }}>📱 Download Our App</h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '2px 0 8px 0' }}>
              Book appointments, track health, get reminders
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => window.open('https://play.google.com', '_blank')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
              >
                <FaGooglePlay size={16} /> Play Store
              </button>
              <button
                onClick={() => window.open('https://www.apple.com/app-store/', '_blank')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
              >
                <FaApple size={16} /> App Store
              </button>
            </div>
          </div>
          <div style={{ fontSize: '48px', opacity: 0.7 }}>📱</div>
        </div>
      </section>

      {/* ================================================================
          FOOTER - 5 Parallel Columns + Social + Legal + Contact
      ================================================================ */}
      <footer style={{ background: '#0f172a', color: 'white', padding: '24px 20px 14px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* 5 Equal Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '16px' }}>
            
            {/* Column 1: For Patients */}
            <div>
              <h4 style={{ fontWeight: '600', margin: '0 0 8px 0', fontSize: '13px', color: '#e2e8f0' }}>For Patients</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><Link to="/hospitals" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Find Hospitals</Link></li>
                <li><Link to="/ambulance" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Book Ambulance</Link></li>
                <li><Link to="/online-doctor" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Online Doctor</Link></li>
                <li><Link to="/diagnostics" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Lab Tests</Link></li>
                <li><Link to="/my-bookings" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>My Bookings</Link></li>
                <li><Link to="/emergency-search" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Emergency</Link></li>
              </ul>
            </div>

            {/* Column 2: For Providers */}
            <div>
              <h4 style={{ fontWeight: '600', margin: '0 0 8px 0', fontSize: '13px', color: '#e2e8f0' }}>For Providers</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><Link to="/provider/choose-role" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Register</Link></li>
                <li><Link to="/provider/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Login</Link></li>
                <li><Link to="/provider/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Dashboard</Link></li>
                <li><Link to="/partner" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Partner With Us</Link></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 style={{ fontWeight: '600', margin: '0 0 8px 0', fontSize: '13px', color: '#e2e8f0' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><Link to="/about" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>About Us</Link></li>
                <li><Link to="/blog" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Blog</Link></li>
                <li><Link to="/contact" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Contact</Link></li>
                <li><Link to="/careers" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Careers</Link></li>
                <li><Link to="/press" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Press</Link></li>
              </ul>
            </div>

            {/* Column 4: Support */}
            <div>
              <h4 style={{ fontWeight: '600', margin: '0 0 8px 0', fontSize: '13px', color: '#e2e8f0' }}>Support</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><Link to="/help" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Help Center</Link></li>
                <li><Link to="/faq" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>FAQ</Link></li>
                <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Live Chat</a></li>
                <li><Link to="/grievance" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Grievance</Link></li>
              </ul>
            </div>

            {/* Column 5: Resources */}
            <div>
              <h4 style={{ fontWeight: '600', margin: '0 0 8px 0', fontSize: '13px', color: '#e2e8f0' }}>Resources</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><Link to="/directory" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Healthcare Directory</Link></li>
                <li><Link to="/pcs-terms" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>PCS T&C</Link></li>
                <li><Link to="/developers" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Developers</Link></li>
                <li><Link to="/api-docs" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>API Docs</Link></li>
              </ul>
            </div>
          </div>

          {/* Social Icons Row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', marginBottom: '12px', paddingTop: '12px', borderTop: '1px solid #1e293b' }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', fontSize: '16px' }} title="Facebook"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', fontSize: '16px' }} title="Twitter"><FaTwitter /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', fontSize: '16px' }} title="LinkedIn"><FaLinkedin /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', fontSize: '16px' }} title="Instagram"><FaInstagram /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', fontSize: '16px' }} title="YouTube"><FaYoutube /></a>
            <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', fontSize: '16px', textDecoration: 'none' }} title="GitHub">🐙</a>
          </div>

          {/* Legal Links Row */}
          <div style={{ textAlign: 'center', paddingTop: '10px', borderTop: '1px solid #1e293b', marginBottom: '10px' }}>
            <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '11px', margin: '0 8px' }}>Privacy Policy</Link>
            <span style={{ color: '#475569' }}>•</span>
            <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '11px', margin: '0 8px' }}>Terms & Conditions</Link>
            <span style={{ color: '#475569' }}>•</span>
            <Link to="/refund" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '11px', margin: '0 8px' }}>Refund Policy</Link>
            <span style={{ color: '#475569' }}>•</span>
            <Link to="/cancellation" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '11px', margin: '0 8px' }}>Cancellation</Link>
            <span style={{ color: '#475569' }}>•</span>
            <Link to="/disclaimer" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '11px', margin: '0 8px' }}>Disclaimer</Link>
          </div>

          {/* Bottom Contact + Copyright */}
          <div style={{ textAlign: 'center', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 3px 0' }}>
              📧 support@healthcarehub.com &nbsp;•&nbsp; 📞 +91-XXXXXXXXXX &nbsp;•&nbsp; 📍 Mumbai, India
            </p>
            <p style={{ color: '#475569', fontSize: '11px', margin: '0' }}>
              © 2025 HealthCare Hub — India's Most Trusted Healthcare Marketplace
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;