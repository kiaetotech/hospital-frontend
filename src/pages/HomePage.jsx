// D:\hospital-frontend\src\pages\HomePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaHospital, FaAmbulance, FaShieldAlt, FaLeaf, FaSpa, 
  FaUserMd, FaMoneyBillWave, FaVideo, FaBuilding, FaFlask,
  FaBrain, FaSearch, FaPhoneAlt, FaUser, FaUserTie, FaLock,
  FaBars, FaTimes, FaChevronDown, FaStar, FaArrowRight,
  FaHeart, FaUsers, FaClock, FaThumbsUp, FaShield,
  FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube,
  FaApple, FaGooglePlay, FaMapMarkerAlt, FaEnvelope, FaPhone as FaPhoneIcon,
  FaCalendarAlt
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const HomePage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);

  // Services Data
  const services = [
    { 
      id: 'hospitals', 
      icon: <FaHospital />, 
      label: 'Hospitals', 
      desc: '1,200+ Providers',
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      textColor: 'text-blue-600',
      path: '/hospitals', 
      badge: null 
    },
    { 
      id: 'ambulance', 
      icon: <FaAmbulance />, 
      label: 'Ambulance', 
      desc: '500+ Vehicles',
      color: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50',
      textColor: 'text-orange-600',
      path: '/ambulance', 
      badge: 'Live Tracking' 
    },
    { 
      id: 'insurance', 
      icon: <FaShieldAlt />, 
      label: 'Health Insurance', 
      desc: 'Compare & Buy',
      color: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
      textColor: 'text-green-600',
      path: '/insurance', 
      badge: '⭐ Trusted' 
    },
    { 
      id: 'homeopathy', 
      icon: <FaLeaf />, 
      label: 'Homeopathy', 
      desc: '300+ Doctors',
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      path: '/homeopathy', 
      badge: 'NEW' 
    },
    { 
      id: 'ayurveda', 
      icon: <FaSpa />, 
      label: 'Ayurveda', 
      desc: '450+ Doctors',
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      textColor: 'text-purple-600',
      path: '/ayurveda', 
      badge: 'NEW' 
    },
    { 
      id: 'caregiver', 
      icon: <FaUserMd />, 
      label: 'Caregiver', 
      desc: '200+ Providers',
      color: 'from-pink-500 to-pink-600',
      bg: 'bg-pink-50',
      textColor: 'text-pink-600',
      path: '/caregivers', 
      badge: null 
    },
    { 
      id: 'emi', 
      icon: <FaMoneyBillWave />, 
      label: 'Health EMI', 
      desc: '0% EMI Available',
      color: 'from-indigo-500 to-indigo-600',
      bg: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      path: '/financing', 
      badge: null 
    },
    { 
      id: 'online', 
      icon: <FaVideo />, 
      label: 'Online Doctor', 
      desc: '24/7 Consult',
      color: 'from-teal-500 to-teal-600',
      bg: 'bg-teal-50',
      textColor: 'text-teal-600',
      path: '/teleconsult', 
      badge: null 
    },
    { 
      id: 'corporate', 
      icon: <FaBuilding />, 
      label: 'Corporate Health', 
      desc: 'For 50+ Employees',
      color: 'from-slate-500 to-slate-600',
      bg: 'bg-slate-50',
      textColor: 'text-slate-600',
      path: '/corporate', 
      badge: 'LIVE' 
    },
    { 
      id: 'diagnostics', 
      icon: <FaFlask />, 
      label: 'Diagnostics', 
      desc: '1,000+ Tests',
      color: 'from-cyan-500 to-cyan-600',
      bg: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      path: '/diagnostics', 
      badge: null 
    },
    { 
      id: 'mentalhealth', 
      icon: <FaBrain />, 
      label: 'Mental Health', 
      desc: '150+ Therapists',
      color: 'from-violet-500 to-violet-600',
      bg: 'bg-violet-50',
      textColor: 'text-violet-600',
      path: '/mentalhealth', 
      badge: 'NEW' 
    }
  ];

  // Provider Roles
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&loc=${encodeURIComponent(location)}`);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: 'Arial, sans-serif'
    }}>
      
      {/* ============================================
          NAVIGATION BAR (MATCHES YOUR EXISTING STYLE)
      ============================================ */}
      <nav style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          {/* Logo */}
          <div 
            onClick={() => navigate('/')} 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🏥 HealthCare Hub
            </span>
          </div>

          {/* Desktop Navigation */}
          <div style={{ display: 'none', alignItems: 'center', gap: '20px' }} className="desktop-nav">
            <Link to="/" style={{ color: '#4b5563', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>Home</Link>

            {/* Services Dropdown */}
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => setShowServicesDropdown(true)}
              onMouseLeave={() => setShowServicesDropdown(false)}
            >
              <button style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                color: '#4b5563', 
                fontWeight: '500', 
                fontSize: '14px', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer' 
              }}>
                Services <FaChevronDown style={{ fontSize: '10px' }} />
              </button>
              {showServicesDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 0,
                  width: '240px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  border: '1px solid #e5e7eb',
                  padding: '8px 0'
                }}>
                  {services.map((service) => (
                    <Link
                      key={service.id}
                      to={service.path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 16px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        color: '#374151'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span style={{ color: service.textColor }}>{service.icon}</span>
                      <span>{service.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/about" style={{ color: '#4b5563', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>About</Link>
            <Link to="/blog" style={{ color: '#4b5563', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>Blog</Link>
            <Link to="/contact" style={{ color: '#4b5563', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>Contact</Link>

            {/* Search */}
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                style={{
                  padding: '6px 12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px 0 0 8px',
                  outline: 'none',
                  width: '140px'
                }}
              />
              <button 
                type="submit"
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0 8px 8px 0',
                  cursor: 'pointer'
                }}
              >
                <FaSearch />
              </button>
            </form>

            {/* Patient Login */}
            <Link
              to="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                textDecoration: 'none'
              }}
            >
              <FaUser /> Patient Login
            </Link>

            {/* Provider Login Dropdown */}
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => setShowProviderDropdown(true)}
              onMouseLeave={() => setShowProviderDropdown(false)}
            >
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#7c3aed',
                backgroundColor: '#f5f3ff',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer'
              }}>
                <FaUserTie /> Provider Login <FaChevronDown style={{ fontSize: '10px' }} />
              </button>
              {showProviderDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 0,
                  width: '240px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  border: '1px solid #e5e7eb',
                  padding: '8px 0'
                }}>
                  <p style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                    Select Your Role
                  </p>
                  {providerRoles.map((role) => (
                    <Link
                      key={role.path}
                      to={role.path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 16px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        color: '#374151'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span>{role.icon}</span>
                      <span>{role.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Login */}
            <Link
              to="/admin/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#dc2626',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                textDecoration: 'none'
              }}
            >
              <FaLock /> Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: 'block',
              padding: '8px',
              borderRadius: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            className="mobile-menu-btn"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div style={{
            backgroundColor: 'white',
            borderTop: '1px solid #e5e7eb',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/" style={{ color: '#374151', textDecoration: 'none', fontSize: '16px' }}>Home</Link>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#6b7280' }}>Services</p>
                {services.map((service) => (
                  <Link
                    key={service.id}
                    to={service.path}
                    style={{ display: 'block', padding: '4px 12px', fontSize: '14px', color: '#4b5563', textDecoration: 'none' }}
                  >
                    {service.icon} {service.label}
                  </Link>
                ))}
              </div>
              <Link to="/about" style={{ color: '#374151', textDecoration: 'none', fontSize: '16px' }}>About</Link>
              <Link to="/blog" style={{ color: '#374151', textDecoration: 'none', fontSize: '16px' }}>Blog</Link>
              <Link to="/contact" style={{ color: '#374151', textDecoration: 'none', fontSize: '16px' }}>Contact</Link>
              <Link to="/login" style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', textDecoration: 'none', textAlign: 'center' }}>
                👤 Patient Login
              </Link>
              <Link to="/admin/login" style={{ padding: '12px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', textDecoration: 'none', textAlign: 'center' }}>
                🔑 Admin Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ============================================
          HERO BANNER - ATTRACTIVE & MODERN
      ============================================ */}
      <section style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #db2777 100%)',
        padding: '60px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{
              backgroundColor: '#ef4444',
              padding: '4px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold',
              animation: 'pulse 2s infinite'
            }}>
              🚨 Emergency?
            </span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>Need Help Now?</span>
          </div>
          
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '12px' }}>
            Your Health, Our Priority
          </h1>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.85)', marginBottom: '32px' }}>
            India's Most Trusted Healthcare Marketplace
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <FaSearch style={{ color: '#9ca3af', marginLeft: '16px' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for Hospitals, Doctors, Services, Tests..."
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '16px',
                    color: '#1f2937'
                  }}
                />
              </div>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <FaMapMarkerAlt style={{ color: '#9ca3af', marginLeft: '16px' }} />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter Location"
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '16px',
                    color: '#1f2937'
                  }}
                />
              </div>
            </div>
            <button
              type="submit"
              style={{
                padding: '16px 32px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              <FaSearch style={{ marginRight: '8px' }} /> Find Help Now
            </button>
          </form>

          {/* Quick Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            maxWidth: '700px',
            margin: '32px auto 0'
          }}>
            {[
              { icon: <FaPhoneAlt />, label: '🚨 Emergency', path: '/emergency-search' },
              { icon: <FaCalendarAlt />, label: '📋 Book Now', path: '/my-bookings' },
              { icon: <FaFlask />, label: '💊 Lab Tests', path: '/diagnostics' },
              { icon: <FaHeart />, label: '📞 24/7 Helpline', path: '/mentalhealth/crisis' }
            ].map((item) => (
              <div
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SERVICES SECTION - ALL 11 VISIBLE WITHOUT SCROLLING
      ============================================ */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
            💡 Choose Your Healthcare Service
          </h2>
          <p style={{ color: '#6b7280', fontSize: '18px', marginTop: '8px' }}>
            Compare, choose, book – all in minutes
          </p>
        </div>

        {/* Grid - 6 in first row, 5 in second row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '16px',
          marginBottom: '16px'
        }}>
          {services.slice(0, 6).map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(service.path)}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '20px 12px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #f3f4f6',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              {/* Gradient Background on Hover */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(to right, ${service.color})`
              }} />
              
              <div style={{
                fontSize: '40px',
                color: service.textColor,
                marginBottom: '8px',
                display: 'block'
              }}>
                {service.icon}
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '4px'
              }}>
                {service.label}
              </h3>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '6px'
              }}>
                {service.desc}
              </p>
              {service.badge && (
                <span style={{
                  display: 'inline-block',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  backgroundColor: 
                    service.badge === 'NEW' ? '#d1fae5' :
                    service.badge === '⭐ Trusted' ? '#fef3c7' :
                    service.badge === 'Live Tracking' ? '#dbeafe' :
                    service.badge === 'LIVE' ? '#fee2e2' :
                    '#f3f4f6',
                  color:
                    service.badge === 'NEW' ? '#065f46' :
                    service.badge === '⭐ Trusted' ? '#92400e' :
                    service.badge === 'Live Tracking' ? '#1e40af' :
                    service.badge === 'LIVE' ? '#991b1b' :
                    '#4b5563'
                }}>
                  {service.badge}
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Second Row - 5 services */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px'
        }}>
          {services.slice(6).map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 6) * 0.05 }}
              onClick={() => navigate(service.path)}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '20px 12px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #f3f4f6',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(to right, ${service.color})`
              }} />
              
              <div style={{
                fontSize: '40px',
                color: service.textColor,
                marginBottom: '8px',
                display: 'block'
              }}>
                {service.icon}
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '4px'
              }}>
                {service.label}
              </h3>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '6px'
              }}>
                {service.desc}
              </p>
              {service.badge && (
                <span style={{
                  display: 'inline-block',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  backgroundColor: 
                    service.badge === 'NEW' ? '#d1fae5' :
                    service.badge === '⭐ Trusted' ? '#fef3c7' :
                    service.badge === 'Live Tracking' ? '#dbeafe' :
                    service.badge === 'LIVE' ? '#fee2e2' :
                    '#f3f4f6',
                  color:
                    service.badge === 'NEW' ? '#065f46' :
                    service.badge === '⭐ Trusted' ? '#92400e' :
                    service.badge === 'Live Tracking' ? '#1e40af' :
                    service.badge === 'LIVE' ? '#991b1b' :
                    '#4b5563'
                }}>
                  {service.badge}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================
          WHY CHOOSE US
      ============================================ */}
      <section style={{
        backgroundColor: 'white',
        padding: '48px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
              🌟 Why Choose HealthCare Hub?
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginTop: '8px' }}>
              Trusted by millions of Indians
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px'
          }}>
            {[
              { icon: <FaShieldAlt style={{ fontSize: '40px', color: '#2563eb' }} />, title: 'Verified Providers', desc: 'Trusted healthcare partners with verified credentials' },
              { icon: <FaThumbsUp style={{ fontSize: '40px', color: '#059669' }} />, title: 'Best Price', desc: 'Compare and save money on healthcare services' },
              { icon: <FaClock style={{ fontSize: '40px', color: '#7c3aed' }} />, title: '24/7 Service', desc: 'Emergency support available around the clock' },
              { icon: <FaUsers style={{ fontSize: '40px', color: '#ea580c' }} />, title: 'Easy Booking', desc: 'Book appointments in 60 seconds' }
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER
      ============================================ */}
      <footer style={{
        backgroundColor: '#111827',
        color: 'white',
        padding: '48px 20px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '32px',
            marginBottom: '32px'
          }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>🏥 HealthCare Hub</h3>
              <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '8px' }}>
                India's Most Trusted Healthcare Marketplace
              </p>
              <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '16px' }}>© 2024 All Rights Reserved</p>
            </div>

            <div>
              <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>For Patients</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><Link to="/hospitals" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Find Doctors</Link></li>
                <li><Link to="/diagnostics" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Book Tests</Link></li>
                <li><Link to="/emergency-search" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Emergency</Link></li>
                <li><Link to="/my-bookings" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>My Bookings</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>For Providers</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><Link to="/provider/choose-role" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Register</Link></li>
                <li><Link to="/provider/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Login</Link></li>
                <li><Link to="/provider/dashboard" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>About Us</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><Link to="/about" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Our Story</Link></li>
                <li><Link to="/blog" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Blog</Link></li>
                <li><Link to="/careers" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Careers</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Contact Us</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '14px' }}><FaPhoneIcon /> +91-XXXXXXXXXX</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '14px' }}><FaEnvelope /> support@healthcarehub.com</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '14px' }}><FaMapMarkerAlt /> Mumbai, India</li>
              </ul>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" style={{ color: '#9ca3af', transition: 'color 0.3s' }}><FaFacebook size={20} /></a>
              <a href="#" style={{ color: '#9ca3af', transition: 'color 0.3s' }}><FaTwitter size={20} /></a>
              <a href="#" style={{ color: '#9ca3af', transition: 'color 0.3s' }}><FaInstagram size={20} /></a>
              <a href="#" style={{ color: '#9ca3af', transition: 'color 0.3s' }}><FaLinkedin size={20} /></a>
              <a href="#" style={{ color: '#9ca3af', transition: 'color 0.3s' }}><FaYoutube size={20} /></a>
            </div>
            <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#9ca3af' }}>
              <Link to="/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link to="/terms" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms & Conditions</Link>
              <Link to="/refund" style={{ color: '#9ca3af', textDecoration: 'none' }}>Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;