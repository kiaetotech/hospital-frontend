// D:\hospital-frontend\src\pages\HomePage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaHospital, FaAmbulance, FaShieldAlt, FaLeaf, FaSpa, 
  FaUserMd, FaMoneyBillWave, FaVideo, FaBuilding, FaFlask,
  FaBrain, FaSearch, FaPhoneAlt, FaUser, FaUserTie, FaLock,
  FaBars, FaTimes, FaChevronDown, FaStar, FaArrowRight,
  FaHeart, FaUsers, FaClock, FaThumbsUp, FaShieldAlt as FaShield,
  FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube,
  FaApple, FaGooglePlay, FaMapMarkerAlt, FaEnvelope, FaPhone as FaPhoneIcon,
  FaCalendarAlt
} from 'react-icons/fa';

const HomePage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);

  const services = [
    { id: 'hospitals', icon: <FaHospital />, label: 'Hospitals', desc: '1,200+ Providers', color: '#3b82f6', path: '/hospitals', badge: null },
    { id: 'ambulance', icon: <FaAmbulance />, label: 'Ambulance', desc: '500+ Vehicles', color: '#f59e0b', path: '/ambulance', badge: 'Live' },
    { id: 'insurance', icon: <FaShieldAlt />, label: 'Health Insurance', desc: 'Compare & Buy', color: '#10b981', path: '/insurance', badge: '⭐' },
    { id: 'homeopathy', icon: <FaLeaf />, label: 'Homeopathy', desc: '300+ Doctors', color: '#059669', path: '/homeopathy', badge: 'NEW' },
    { id: 'ayurveda', icon: <FaSpa />, label: 'Ayurveda', desc: '450+ Doctors', color: '#8b5cf6', path: '/ayurveda', badge: 'NEW' },
    { id: 'caregiver', icon: <FaUserMd />, label: 'Caregiver', desc: '200+ Providers', color: '#ec4899', path: '/caregivers', badge: null },
    { id: 'emi', icon: <FaMoneyBillWave />, label: 'Health EMI', desc: '0% EMI', color: '#6366f1', path: '/financing', badge: null },
    { id: 'online', icon: <FaVideo />, label: 'Online Doctor', desc: '24/7 Consult', color: '#14b8a6', path: '/teleconsult', badge: null },
    { id: 'corporate', icon: <FaBuilding />, label: 'Corporate', desc: 'For 50+ Employees', color: '#64748b', path: '/corporate', badge: 'LIVE' },
    { id: 'diagnostics', icon: <FaFlask />, label: 'Diagnostics', desc: '1,000+ Tests', color: '#06b6d4', path: '/diagnostics', badge: null },
    { id: 'mentalhealth', icon: <FaBrain />, label: 'Mental Health', desc: '150+ Therapists', color: '#8b5cf6', path: '/mentalhealth', badge: 'NEW' }
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&loc=${encodeURIComponent(location)}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ========== NAVIGATION ========== */}
      <nav style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px', fontWeight: '700', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🏥 HealthCare Hub
            </span>
          </div>

          <div style={{ display: 'none', alignItems: 'center', gap: '16px' }} className="desktop-nav">
            <Link to="/" style={{ color: '#475569', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>Home</Link>
            <div style={{ position: 'relative' }} onMouseEnter={() => setShowServicesDropdown(true)} onMouseLeave={() => setShowServicesDropdown(false)}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontWeight: '500', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}>
                Services <FaChevronDown style={{ fontSize: '10px' }} />
              </button>
              {showServicesDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, width: '220px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', padding: '8px 0' }}>
                  {services.map((s) => (
                    <Link key={s.id} to={s.path} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', textDecoration: 'none', fontSize: '14px', color: '#334155' }}>
                      <span style={{ color: s.color }}>{s.icon}</span> {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link to="/about" style={{ color: '#475569', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>About</Link>
            <Link to="/blog" style={{ color: '#475569', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>Blog</Link>
            <Link to="/contact" style={{ color: '#475569', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>Contact</Link>

            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." style={{ padding: '6px 12px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '8px 0 0 8px', outline: 'none', width: '120px' }} />
              <button type="submit" style={{ padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0 8px 8px 0', cursor: 'pointer' }}><FaSearch /></button>
            </form>

            <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: '500', color: '#2563eb', background: '#eff6ff', borderRadius: '8px', textDecoration: 'none' }}>
              <FaUser /> Patient
            </Link>

            <div style={{ position: 'relative' }} onMouseEnter={() => setShowProviderDropdown(true)} onMouseLeave={() => setShowProviderDropdown(false)}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: '500', color: '#7c3aed', background: '#f5f3ff', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                <FaUserTie /> Provider <FaChevronDown style={{ fontSize: '10px' }} />
              </button>
              {showProviderDropdown && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, width: '220px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', padding: '8px 0' }}>
                  {providerRoles.map((role) => (
                    <Link key={role.path} to={role.path} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', textDecoration: 'none', fontSize: '14px', color: '#334155' }}>
                      <span>{role.icon}</span> {role.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/admin/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: '500', color: '#dc2626', background: '#fef2f2', borderRadius: '8px', textDecoration: 'none' }}>
              <FaLock /> Admin
            </Link>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ display: 'block', padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }} className="mobile-menu-btn">
            {isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>

        {isMenuOpen && (
          <div style={{ background: 'white', borderTop: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/" style={{ color: '#334155', textDecoration: 'none', fontSize: '15px' }}>Home</Link>
            {services.map((s) => (
              <Link key={s.id} to={s.path} style={{ color: '#475569', textDecoration: 'none', fontSize: '14px', paddingLeft: '12px' }}>{s.icon} {s.label}</Link>
            ))}
            <Link to="/about" style={{ color: '#334155', textDecoration: 'none', fontSize: '15px' }}>About</Link>
            <Link to="/blog" style={{ color: '#334155', textDecoration: 'none', fontSize: '15px' }}>Blog</Link>
            <Link to="/contact" style={{ color: '#334155', textDecoration: 'none', fontSize: '15px' }}>Contact</Link>
            <Link to="/login" style={{ padding: '10px', background: '#2563eb', color: 'white', borderRadius: '8px', textDecoration: 'none', textAlign: 'center' }}>👤 Patient Login</Link>
            <Link to="/admin/login" style={{ padding: '10px', background: '#dc2626', color: 'white', borderRadius: '8px', textDecoration: 'none', textAlign: 'center' }}>🔑 Admin Login</Link>
          </div>
        )}
      </nav>

      {/* ========== HERO - COMPACT ========== */}
      <section style={{
        background: 'linear-gradient(135deg, #1e40af, #7c3aed)',
        padding: '40px 20px 36px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ background: '#ef4444', padding: '2px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>🚨 Emergency?</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Need Help Now?</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '6px' }}>Your Health, Our Priority</h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.85)', marginBottom: '20px' }}>India's Most Trusted Healthcare Marketplace</p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', maxWidth: '650px', margin: '0 auto', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, display: 'flex', alignItems: 'center', background: 'white', borderRadius: '10px', overflow: 'hidden' }}>
              <FaSearch style={{ color: '#94a3b8', marginLeft: '14px' }} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for Hospitals, Doctors, Services..." style={{ width: '100%', padding: '12px 14px', border: 'none', outline: 'none', fontSize: '14px', color: '#1e293b' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'white', borderRadius: '10px', overflow: 'hidden' }}>
              <FaMapMarkerAlt style={{ color: '#94a3b8', marginLeft: '14px' }} />
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" style={{ width: '100%', padding: '12px 14px', border: 'none', outline: 'none', fontSize: '14px', color: '#1e293b' }} />
            </div>
            <button type="submit" style={{ padding: '12px 28px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              Find Help
            </button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxWidth: '600px', margin: '16px auto 0' }}>
            {[
              { icon: <FaPhoneAlt />, label: 'Emergency', path: '/emergency-search' },
              { icon: <FaCalendarAlt />, label: 'Book Now', path: '/my-bookings' },
              { icon: <FaFlask />, label: 'Lab Tests', path: '/diagnostics' },
              { icon: <FaHeart />, label: 'Helpline', path: '/mentalhealth/crisis' }
            ].map((item) => (
              <div key={item.label} onClick={() => navigate(item.path)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                {item.icon} {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SERVICES - 11 TAGS ========== */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>💡 Healthcare Services</h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Compare, choose, book – all in minutes</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
          {services.map((service) => (
            <div key={service.id} onClick={() => navigate(service.path)} style={{
              background: 'white',
              borderRadius: '14px',
              padding: '18px 10px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}>
              <div style={{ fontSize: '28px', color: service.color, marginBottom: '4px' }}>{service.icon}</div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{service.label}</h3>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>{service.desc}</p>
              {service.badge && (
                <span style={{
                  display: 'inline-block',
                  fontSize: '9px',
                  fontWeight: '700',
                  padding: '1px 8px',
                  borderRadius: '10px',
                  marginTop: '4px',
                  background: service.badge === 'NEW' ? '#d1fae5' : service.badge === 'LIVE' ? '#fee2e2' : '#fef3c7',
                  color: service.badge === 'NEW' ? '#065f46' : service.badge === 'LIVE' ? '#991b1b' : '#92400e'
                }}>
                  {service.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========== WHY CHOOSE US ========== */}
      <section style={{ background: 'white', padding: '36px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b' }}>🌟 Why HealthCare Hub?</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Trusted by millions</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { icon: <FaShield style={{ color: '#3b82f6', fontSize: '28px' }} />, title: 'Verified Providers', desc: 'Trusted healthcare partners' },
              { icon: <FaThumbsUp style={{ color: '#10b981', fontSize: '28px' }} />, title: 'Best Price', desc: 'Compare & save money' },
              { icon: <FaClock style={{ color: '#8b5cf6', fontSize: '28px' }} />, title: '24/7 Service', desc: 'Emergency support anytime' },
              { icon: <FaUsers style={{ color: '#f59e0b', fontSize: '28px' }} />, title: 'Easy Booking', desc: 'Book in 60 seconds' }
            ].map((item, index) => (
              <div key={index} style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ marginBottom: '8px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer style={{ background: '#0f172a', color: 'white', padding: '32px 20px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>🏥 HealthCare Hub</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>India's Most Trusted Marketplace</p>
              <p style={{ color: '#64748b', fontSize: '11px', marginTop: '12px' }}>© 2024 All Rights Reserved</p>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Patients</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><Link to="/hospitals" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Find Doctors</Link></li>
                <li><Link to="/diagnostics" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Book Tests</Link></li>
                <li><Link to="/my-bookings" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>My Bookings</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Providers</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><Link to="/provider/choose-role" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Register</Link></li>
                <li><Link to="/provider/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>About</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><Link to="/about" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Our Story</Link></li>
                <li><Link to="/blog" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Blog</Link></li>
                <li><Link to="/contact" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>Contact</Link></li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '14px' }}>
              <a href="#" style={{ color: '#94a3b8' }}><FaFacebook /></a>
              <a href="#" style={{ color: '#94a3b8' }}><FaTwitter /></a>
              <a href="#" style={{ color: '#94a3b8' }}><FaInstagram /></a>
              <a href="#" style={{ color: '#94a3b8' }}><FaLinkedin /></a>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#94a3b8' }}>
              <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy</Link>
              <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms</Link>
              <Link to="/refund" style={{ color: '#94a3b8', textDecoration: 'none' }}>Refund</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;