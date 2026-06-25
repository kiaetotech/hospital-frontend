// D:\hospital-frontend\src\pages\HomePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaHospital, FaAmbulance, FaShieldAlt, FaLeaf, FaSpa, 
  FaUserMd, FaMoneyBillWave, FaVideo, FaBuilding, FaFlask,
  FaBrain, FaSearch, FaPhoneAlt, FaUser, FaUserTie, FaLock,
  FaBars, FaTimes, FaChevronDown, FaStar, FaArrowRight,
  FaHeart, FaUsers, FaClock, FaThumbsUp, FaShieldAlt as FaShield,
  FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube,
  FaApple, FaGooglePlay, FaMapMarkerAlt, FaEnvelope, FaPhone as FaPhoneIcon,
  FaCalendarAlt, FaQrcode, FaMobileAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
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
    { id: 'hospitals', icon: <FaHospital />, label: 'Hospitals', desc: '1,200+ Providers', color: '#3b82f6', bg: '#eff6ff', path: '/hospitals', badge: null },
    { id: 'ambulance', icon: <FaAmbulance />, label: 'Ambulance', desc: '500+ Vehicles', color: '#f59e0b', bg: '#fffbeb', path: '/ambulance', badge: 'Live' },
    { id: 'insurance', icon: <FaShieldAlt />, label: 'Health Insurance', desc: 'Compare & Buy', color: '#10b981', bg: '#ecfdf5', path: '/insurance', badge: '⭐ Trusted' },
    { id: 'homeopathy', icon: <FaLeaf />, label: 'Homeopathy', desc: '300+ Doctors', color: '#059669', bg: '#ecfdf5', path: '/homeopathy', badge: 'NEW' },
    { id: 'ayurveda', icon: <FaSpa />, label: 'Ayurveda', desc: '450+ Doctors', color: '#8b5cf6', bg: '#f5f3ff', path: '/ayurveda', badge: 'NEW' },
    { id: 'caregiver', icon: <FaUserMd />, label: 'Caregiver', desc: '200+ Providers', color: '#ec4899', bg: '#fdf2f8', path: '/caregivers', badge: null },
    { id: 'emi', icon: <FaMoneyBillWave />, label: 'Health EMI', desc: '0% EMI Available', color: '#6366f1', bg: '#eef2ff', path: '/financing', badge: null },
    { id: 'online', icon: <FaVideo />, label: 'Online Doctor', desc: '24/7 Consult', color: '#14b8a6', bg: '#f0fdfa', path: '/teleconsult', badge: null },
    { id: 'corporate', icon: <FaBuilding />, label: 'Corporate Health', desc: 'For 50+ Employees', color: '#64748b', bg: '#f8fafc', path: '/corporate', badge: 'LIVE' },
    { id: 'diagnostics', icon: <FaFlask />, label: 'Diagnostics', desc: '1,000+ Tests', color: '#06b6d4', bg: '#ecfeff', path: '/diagnostics', badge: null },
    { id: 'mentalhealth', icon: <FaBrain />, label: 'Mental Health', desc: '150+ Therapists', color: '#8b5cf6', bg: '#f5f3ff', path: '/mentalhealth', badge: 'NEW' }
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
          NAVIGATION BAR - WITH LOGIN BUTTONS VISIBLE
      ================================================================ */}
      <nav style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          {/* Logo */}
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: '700', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🏥 HealthCare Hub
            </span>
          </div>

          {/* ============================================================
              DESKTOP NAVIGATION - LOGIN BUTTONS ARE HERE
          ============================================================ */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <Link to="/" style={{ color: '#475569', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>Home</Link>
            
            <div style={{ position: 'relative' }} onMouseEnter={() => setShowServicesDropdown(true)} onMouseLeave={() => setShowServicesDropdown(false)}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontWeight: '500', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}>
                Services <FaChevronDown style={{ fontSize: '10px' }} />
              </button>
              {showServicesDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 2, width: '220px', background: 'white', borderRadius: '10px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: '6px 0' }}>
                  {services.map((s) => (
                    <Link key={s.id} to={s.path} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', textDecoration: 'none', fontSize: '14px', color: '#334155' }}>
                      <span style={{ color: s.color }}>{s.icon}</span> {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/about" style={{ color: '#475569', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>About</Link>
            <Link to="/blog" style={{ color: '#475569', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>Blog</Link>
            <Link to="/contact" style={{ color: '#475569', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>Contact</Link>

            {/* Search */}
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                style={{ padding: '6px 12px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '8px 0 0 8px', outline: 'none', width: '120px' }}
              />
              <button type="submit" style={{ padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0 8px 8px 0', cursor: 'pointer' }}>
                <FaSearch size={14} />
              </button>
            </form>

            {/* 👤 PATIENT LOGIN - VISIBLE */}
            <Link to="/login" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              borderRadius: '8px',
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)'
            }}>
              <FaUser size={14} /> Patient Login
            </Link>

            {/* 🔐 PROVIDER LOGIN - VISIBLE */}
            <div style={{ position: 'relative' }} onMouseEnter={() => setShowProviderDropdown(true)} onMouseLeave={() => setShowProviderDropdown(false)}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#7c3aed',
                background: '#f5f3ff',
                borderRadius: '8px',
                border: '2px solid #7c3aed',
                cursor: 'pointer'
              }}>
                <FaUserTie size={14} /> Provider Login <FaChevronDown style={{ fontSize: '10px' }} />
              </button>
              {showProviderDropdown && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 2, width: '240px', background: 'white', borderRadius: '10px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: '6px 0' }}>
                  {providerRoles.map((role) => (
                    <Link key={role.path} to={role.path} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', textDecoration: 'none', fontSize: '14px', color: '#334155' }}>
                      <span>{role.icon}</span> {role.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 🔑 ADMIN LOGIN - VISIBLE */}
            <Link to="/admin/login" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#dc2626',
              background: '#fef2f2',
              borderRadius: '6px',
              textDecoration: 'none',
              border: '1px solid #fecaca'
            }}>
              <FaLock size={14} /> Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ display: 'block', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
            {isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div style={{ background: 'white', borderTop: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/" style={{ color: '#334155', textDecoration: 'none', fontSize: '15px' }}>Home</Link>
            {services.map((s) => (
              <Link key={s.id} to={s.path} style={{ color: '#475569', textDecoration: 'none', fontSize: '14px', padding: '2px 8px' }}>{s.icon} {s.label}</Link>
            ))}
            <Link to="/about" style={{ color: '#334155', textDecoration: 'none', fontSize: '15px' }}>About</Link>
            <Link to="/blog" style={{ color: '#334155', textDecoration: 'none', fontSize: '15px' }}>Blog</Link>
            <Link to="/contact" style={{ color: '#334155', textDecoration: 'none', fontSize: '15px' }}>Contact</Link>
            <Link to="/login" style={{ padding: '12px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', borderRadius: '8px', textDecoration: 'none', textAlign: 'center', fontWeight: '600' }}>👤 Patient Login</Link>
            <Link to="/admin/login" style={{ padding: '12px', background: '#dc2626', color: 'white', borderRadius: '8px', textDecoration: 'none', textAlign: 'center', fontWeight: '600' }}>🔑 Admin Login</Link>
          </div>
        )}
      </nav>

      {/* ================================================================
          HERO BANNER
      ================================================================ */}
      <section style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #db2777 100%)',
        padding: '40px 20px 32px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ background: '#ef4444', padding: '4px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                🚨 Emergency?
              </span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px' }}>Need Help Now?</span>
            </div>
            
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '4px' }}>Your Health, Our Priority</h1>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', marginBottom: '20px' }}>
              India's Most Trusted Healthcare Marketplace
            </p>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', maxWidth: '650px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ flex: 2, minWidth: '200px', display: 'flex', alignItems: 'center', background: 'white', borderRadius: '10px', overflow: 'hidden' }}>
                <FaSearch style={{ color: '#94a3b8', marginLeft: '14px', fontSize: '16px' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for Hospitals, Doctors, Services..."
                  style={{ width: '100%', padding: '12px 14px', border: 'none', outline: 'none', fontSize: '15px', color: '#1e293b' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center', background: 'white', borderRadius: '10px', overflow: 'hidden' }}>
                <FaMapMarkerAlt style={{ color: '#94a3b8', marginLeft: '14px', fontSize: '16px' }} />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  style={{ width: '100%', padding: '12px 14px', border: 'none', outline: 'none', fontSize: '15px', color: '#1e293b' }}
                />
              </div>
              <button
                type="submit"
                style={{ padding: '12px 32px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
              >
                Find Help
              </button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxWidth: '550px', margin: '18px auto 0' }}>
              {[
                { icon: <FaPhoneAlt size={14} />, label: '🚨 Emergency', path: '/emergency-search' },
                { icon: <FaCalendarAlt size={14} />, label: '📋 Book Now', path: '/my-bookings' },
                { icon: <FaFlask size={14} />, label: '💊 Lab Tests', path: '/diagnostics' },
                { icon: <FaHeart size={14} />, label: '📞 24/7 Helpline', path: '/mentalhealth/crisis' }
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                >
                  {item.icon} {item.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          11 BIG ATTRACTIVE SERVICES
      ================================================================ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>💡 Healthcare Services</h2>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Compare, choose, book – all in minutes</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              onClick={() => navigate(service.path)}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.10)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: service.color, borderRadius: '4px 4px 0 0' }} />
              <div style={{ fontSize: '36px', color: service.color, marginBottom: '6px' }}>{service.icon}</div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e293b' }}>{service.label}</h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>{service.desc}</p>
              {service.badge && (
                <span style={{
                  display: 'inline-block',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 12px',
                  borderRadius: '12px',
                  marginTop: '6px',
                  background: service.badge === 'NEW' ? '#d1fae5' : service.badge === 'LIVE' ? '#fee2e2' : '#fef3c7',
                  color: service.badge === 'NEW' ? '#065f46' : service.badge === 'LIVE' ? '#991b1b' : '#92400e'
                }}>
                  {service.badge}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================================================================
          WHY CHOOSE US
      ================================================================ */}
      <section style={{ background: 'white', padding: '36px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b' }}>🌟 Why HealthCare Hub?</h2>
            <p style={{ color: '#64748b', fontSize: '15px' }}>Trusted by millions of Indians</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {[
              { icon: <FaShield style={{ color: '#3b82f6', fontSize: '32px' }} />, title: 'Verified Providers', desc: 'Trusted healthcare partners with verified credentials' },
              { icon: <FaThumbsUp style={{ color: '#10b981', fontSize: '32px' }} />, title: 'Best Price', desc: 'Compare and save money on healthcare services' },
              { icon: <FaClock style={{ color: '#8b5cf6', fontSize: '32px' }} />, title: '24/7 Service', desc: 'Emergency support available around the clock' },
              { icon: <FaUsers style={{ color: '#f59e0b', fontSize: '32px' }} />, title: 'Easy Booking', desc: 'Book appointments in 60 seconds' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                style={{ textAlign: 'center', padding: '24px', background: '#f8fafc', borderRadius: '14px' }}
              >
                <div style={{ marginBottom: '8px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          HEALTH INSIGHTS
      ================================================================ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>📰 Health Insights</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Expert articles to keep you informed</p>
          </div>
          <Link to="/blog" style={{ color: '#2563eb', fontWeight: '600', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <FaArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {articles.map((article, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => navigate('/blog')}
              style={{
                background: 'white',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; }}
            >
              <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)' }}>
                {article.image}
              </div>
              <div style={{ padding: '16px 20px' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#2563eb', background: '#eff6ff', padding: '2px 12px', borderRadius: '10px' }}>{article.category}</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginTop: '8px' }}>{article.title}</h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>By {article.author} • {article.date}</p>
                <span style={{ display: 'inline-block', marginTop: '8px', color: '#2563eb', fontWeight: '600', fontSize: '14px' }}>Read More →</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================================================================
          TESTIMONIALS
      ================================================================ */}
      <section style={{ background: 'linear-gradient(135deg, #1e40af, #7c3aed)', padding: '36px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>💬 What Our Users Say</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', marginBottom: '16px' }}>Real stories from real people</p>

          <div style={{ position: 'relative', minHeight: '160px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '18px',
                  padding: '28px 32px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <div style={{ fontSize: '24px', color: '#fbbf24', marginBottom: '8px' }}>
                  {'⭐'.repeat(testimonials[currentTestimonial].rating)}
                </div>
                <p style={{ fontSize: '18px', color: 'white', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{testimonials[currentTestimonial].text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
                  <span style={{ fontSize: '32px' }}>{testimonials[currentTestimonial].icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>{testimonials[currentTestimonial].name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{testimonials[currentTestimonial].location}</p>
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
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: 'none',
                    background: index === currentTestimonial ? 'white' : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          APP DOWNLOAD
      ================================================================ */}
      <section style={{ background: 'white', padding: '36px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>📱 Download Our App</h2>
            <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '350px' }}>
              Book appointments, track health, get reminders, and more.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => window.open('https://play.google.com', '_blank')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
              >
                <FaGooglePlay size={20} /> Play Store
              </button>
              <button
                onClick={() => window.open('https://www.apple.com/app-store/', '_blank')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
              >
                <FaApple size={20} /> App Store
              </button>
            </div>
          </div>
          <div style={{ fontSize: '64px', opacity: 0.8 }}>📱</div>
        </div>
      </section>

      {/* ================================================================
          FOOTER
      ================================================================ */}
      <footer style={{ background: '#0f172a', color: 'white', padding: '32px 20px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '24px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>🏥 HealthCare Hub</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>India's Most Trusted Marketplace</p>
              <p style={{ color: '#64748b', fontSize: '11px', marginTop: '12px' }}>© 2024 All Rights Reserved</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <a href="#" style={{ color: '#94a3b8' }}><FaFacebook size={16} /></a>
                <a href="#" style={{ color: '#94a3b8' }}><FaTwitter size={16} /></a>
                <a href="#" style={{ color: '#94a3b8' }}><FaInstagram size={16} /></a>
                <a href="#" style={{ color: '#94a3b8' }}><FaLinkedin size={16} /></a>
              </div>
            </div>

            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>For Patients</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><Link to="/hospitals" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Find Doctors</Link></li>
                <li><Link to="/diagnostics" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Book Tests</Link></li>
                <li><Link to="/emergency-search" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Emergency</Link></li>
                <li><Link to="/my-bookings" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>My Bookings</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>For Providers</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><Link to="/provider/choose-role" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Register</Link></li>
                <li><Link to="/provider/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>About Us</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><Link to="/about" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Our Story</Link></li>
                <li><Link to="/blog" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Blog</Link></li>
                <li><Link to="/contact" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Contact Us</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '13px' }}>
                  <FaPhoneIcon size={14} /> +91-XXXXXXXXXX
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '13px' }}>
                  <FaEnvelope size={14} /> support@healthcarehub.com
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '13px' }}>
                  <FaMapMarkerAlt size={14} /> Mumbai, India
                </li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ color: '#64748b', fontSize: '13px' }}>© 2024 HealthCare Hub. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
              <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms & Conditions</Link>
              <Link to="/refund" style={{ color: '#94a3b8', textDecoration: 'none' }}>Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;