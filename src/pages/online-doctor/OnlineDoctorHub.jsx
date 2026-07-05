import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaSearch, FaUserMd, FaStar, FaVideo, FaPhone, FaShieldAlt, 
  FaBrain, FaArrowRight, FaHeart, FaCheckCircle, FaClock,
  FaStethoscope, FaUserPlus, FaSignInAlt, FaClinicMedical,
  FaPhoneAlt, FaCalendarCheck
} from 'react-icons/fa';
import api from '../../services/api';
import { motion } from 'framer-motion';

const OnlineDoctorHub = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const specialties = [
    { name: 'General Physician', icon: '🩺', color: '#3b82f6', bg: '#eff6ff' },
    { name: 'Dermatologist', icon: '🔬', color: '#8b5cf6', bg: '#f5f3ff' },
    { name: 'Gynecologist', icon: '👩‍⚕️', color: '#ec4899', bg: '#fdf2f8' },
    { name: 'Pediatrician', icon: '👶', color: '#f59e0b', bg: '#fffbeb' },
    { name: 'Cardiologist', icon: '❤️', color: '#ef4444', bg: '#fef2f2' },
    { name: 'Neurologist', icon: '🧠', color: '#6366f1', bg: '#eef2ff' },
    { name: 'Orthopedic', icon: '🦴', color: '#14b8a6', bg: '#f0fdfa' },
    { name: 'ENT Specialist', icon: '👂', color: '#06b6d4', bg: '#ecfeff' },
    { name: 'Psychiatrist', icon: '🧘', color: '#10b981', bg: '#ecfdf5' },
    { name: 'Gastroenterologist', icon: '🔍', color: '#f97316', bg: '#fff7ed' },
    { name: 'Endocrinologist', icon: '💊', color: '#a855f7', bg: '#faf5ff' },
    { name: 'Urologist', icon: '🩸', color: '#dc2626', bg: '#fef2f2' }
  ];

  const stats = [
    { icon: <FaUserMd size={24} />, value: '500+', label: 'Verified Doctors', color: '#3b82f6' },
    { icon: <FaCheckCircle size={24} />, value: '50K+', label: 'Consultations', color: '#10b981' },
    { icon: <FaStar size={24} />, value: '4.6', label: 'Average Rating', color: '#f59e0b' },
    { icon: <FaClock size={24} />, value: '3 min', label: 'Avg Wait Time', color: '#8b5cf6' }
  ];

  const trustFeatures = [
    { icon: <FaShieldAlt size={32} />, title: '100% Verified', desc: 'All doctors verified with MCI/State Medical Council credentials' },
    { icon: <FaHeart size={32} />, title: 'Transparent Pricing', desc: 'Doctor sets their fee. You see total before booking. No hidden charges.' },
    { icon: <FaUserMd size={32} />, title: 'Privacy First', desc: 'Your health data belongs to you. We never share without consent.' }
  ];

  useEffect(() => {
    fetchFeaturedDoctors();
  }, []);

  const fetchFeaturedDoctors = async () => {
    try {
      const res = await api.get('/online-doctor/doctors/featured');
      if (res.data?.success) {
        setFeaturedDoctors(res.data.data?.slice(0, 6) || []);
      }
    } catch (err) {
      console.error('Error fetching featured doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/online-doctor/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSpecialtyClick = (specialty) => {
    navigate(`/online-doctor/search?specialty=${encodeURIComponent(specialty)}`);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ============================================
          HERO SECTION
      ============================================ */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #1e40af 100%)',
        padding: '50px 20px 60px',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              padding: '8px 20px',
              borderRadius: '30px',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '20px',
              border: '1px solid rgba(255,255,255,0.15)'
            }}>
              ⚡ 500+ Verified Doctors • 50,000+ Consultations • 4.6★ Rating
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: '800',
              marginBottom: '12px',
              lineHeight: '1.2',
              background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Consult Top Doctors<br />in 5 Minutes
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: '17px',
              color: 'rgba(255,255,255,0.8)',
              marginBottom: '28px',
              maxWidth: '600px',
              margin: '0 auto 28px'
            }}
          >
            India's fastest growing teleconsultation platform. Video or audio consultation with verified doctors at your price.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              display: 'flex',
              gap: '10px',
              maxWidth: '650px',
              margin: '0 auto 24px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            <div style={{
              flex: 1,
              minWidth: '280px',
              display: 'flex',
              alignItems: 'center',
              background: 'white',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
              <FaSearch style={{ color: '#94a3b8', marginLeft: '16px', fontSize: '16px', flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by specialty, doctor name, or symptom..."
                style={{
                  width: '100%',
                  padding: '15px 16px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px',
                  color: '#1e293b'
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  padding: '15px 24px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Search
              </button>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <button
              onClick={() => navigate('/online-doctor/search')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <FaVideo size={18} /> Consult Now
            </button>
            <button
              onClick={() => navigate('/online-doctor/triage')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.25)',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            >
              <FaBrain size={18} /> AI Symptom Check
            </button>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          STATS BAR
      ============================================ */}
      <section style={{
        maxWidth: '1000px',
        margin: '-30px auto 0',
        padding: '0 20px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px'
        }}>
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px 16px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                border: '1px solid #f1f5f9'
              }}
            >
              <div style={{ color: stat.color, marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================
          SPECIALTIES GRID
      ============================================ */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
            Consult by Specialty
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Choose from 12+ specialties — find the right doctor instantly</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '12px'
        }}>
          {specialties.map((spec, i) => (
            <motion.div
              key={spec.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              onClick={() => handleSpecialtyClick(spec.name)}
              style={{
                background: spec.bg,
                borderRadius: '14px',
                padding: '20px 14px',
                textAlign: 'center',
                cursor: 'pointer',
                border: `1.5px solid ${spec.color}20`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${spec.color}20`;
                e.currentTarget.style.borderColor = spec.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = `${spec.color}20`;
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{spec.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{spec.name}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================
          TOP RATED DOCTORS
      ============================================ */}
      {featuredDoctors.length > 0 && (
        <section style={{ background: 'white', padding: '48px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0' }}>⭐ Top Rated Doctors</h2>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Highest rated by patients</p>
              </div>
              <Link to="/online-doctor/search" style={{ color: '#2563eb', fontWeight: '600', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <FaArrowRight size={12} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {featuredDoctors.map((doc) => (
                <motion.div
                  key={doc._id}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/online-doctor/doctor/${doc._id}`)}
                  style={{
                    background: '#f8fafc',
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{
                      width: '56px', height: '56px',
                      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      borderRadius: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '22px', flexShrink: 0
                    }}>
                      👨‍⚕️
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0' }}>Dr. {doc.name}</h3>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0' }}>{doc.specialization}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ fontSize: '13px', color: '#f59e0b' }}>⭐ {doc.ratingSummary?.averageRating?.toFixed(1) || 'New'}</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>₹{doc.consultationFee}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          TRUST FEATURES
      ============================================ */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {trustFeatures.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              style={{
                textAlign: 'center',
                padding: '28px 20px',
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ color: '#2563eb', marginBottom: '12px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e293b', margin: '0 0 6px 0' }}>{feature.title}</h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================
          DOCTOR CTA
      ============================================ */}
      <section style={{
        background: 'linear-gradient(135deg, #1e40af, #7c3aed)',
        padding: '40px 20px',
        margin: '0 0 0 0'
      }}>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>👨‍⚕️</div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 8px 0' }}>Are You a Doctor?</h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.85)', margin: '0 0 20px 0' }}>
            Join 500+ doctors already consulting online. Set your own fee, your own hours. Pay only when you earn.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/online-doctor/register')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '14px 28px',
                background: 'white',
                color: '#2563eb',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <FaUserPlus size={18} /> Register Now
            </button>
            <button
              onClick={() => navigate('/online-doctor/login')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '14px 28px',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <FaSignInAlt size={18} /> Doctor Login
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OnlineDoctorHub; 
