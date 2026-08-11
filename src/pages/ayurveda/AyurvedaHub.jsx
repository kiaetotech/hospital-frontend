import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getFeaturedDoctors } from '../../services/ayurvedaApi';
import { motion } from 'framer-motion';
import { FaArrowRight, FaStar, FaCheckCircle, FaClock, FaUserMd, FaLeaf, FaChartLine, FaUserPlus, FaSignInAlt, FaHospital } from 'react-icons/fa';

const AyurvedaHub = () => {
  const navigate = useNavigate();
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await getFeaturedDoctors();
        const doctorsData = response.data?.data || response.data || [];
        const doctorsArray = Array.isArray(doctorsData) ? doctorsData : [];
        setFeaturedDoctors(doctorsArray);
      } catch (error) {
        setFeaturedDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const stats = [
    { icon: <FaUserMd size={20} />, value: '50+', label: 'Verified Doctors', color: '#4CAF50' },
    { icon: <FaCheckCircle size={20} />, value: '25+', label: 'Panchakarma Centers', color: '#2196F3' },
    { icon: <FaStar size={20} />, value: '4.8', label: 'Average Rating', color: '#FF9800' },
    { icon: <FaClock size={20} />, value: '2 min', label: 'Prakriti Quiz', color: '#9C27B0' },
  ];

  const services = [
    { icon: '📞', title: 'Online Consultation', desc: 'Video consult with AYUSH-registered doctors', route: '/ayurveda/doctors', color: '#FF9800', bg: '#fff7ed' },
    { icon: '🏨', title: 'Panchakarma Centers', desc: 'Book authentic detox & rejuvenation programs', route: '/ayurveda/centers', color: '#2196F3', bg: '#eff6ff' },
    { icon: '🧬', title: 'Prakriti Analysis', desc: 'AI quiz to discover your Dosha body type', route: '/ayurveda/prakriti', color: '#9C27B0', bg: '#faf5ff' },
    { icon: '🌿', title: 'Wellness Store', desc: 'Personalized products based on your Prakriti', route: '/ayurveda/commerce', color: '#059669', bg: '#ecfdf5', badge: 'NEW' },
    { icon: '🔄', title: 'Treatment Tracker', desc: 'Track your Panchakarma journey day-by-day', route: '/ayurveda/panchakarma-tracker', color: '#0D9488', bg: '#f0fdfa', badge: 'NEW' },
    { icon: '🌸', title: 'Seasonal Wellness', desc: 'Ritu-based diet & lifestyle recommendations', route: '/ayurveda/seasonal-wellness', color: '#EC4899', bg: '#fdf2f8', badge: 'NEW' },
  ];

  const trustFeatures = [
    { icon: <FaCheckCircle size={24} />, title: 'AYUSH Verified', desc: 'All doctors registered & verified' },
    { icon: <FaLeaf size={24} />, title: 'Authentic Ayurveda', desc: 'Traditional protocols & genuine herbs' },
    { icon: <FaChartLine size={24} />, title: 'Track Progress', desc: 'Monitor your wellness journey' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 30%, #047857 60%, #059669 100%)', padding: '40px 20px 52px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 60%, rgba(52,211,153,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(167,243,208,0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '750px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '5px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.12)' }}>
              🕉️ Ancient Wisdom • Modern Science • Holistic Healing
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800', marginBottom: '6px', lineHeight: '1.15' }}>
            Ayurveda & Wellness Hub
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginBottom: '20px' }}>
            Discover your Dosha • Consult Ayurvedic doctors • Book Panchakarma • Shop wellness products
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/ayurveda/prakriti')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 22px', background: 'white', color: '#065f46', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
              🧬 Free Prakriti Analysis
            </button>
            <button onClick={() => navigate('/ayurveda/doctors')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 22px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              📞 Consult Doctor Now
            </button>
            <button onClick={() => navigate('/ayurveda/commerce')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 22px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              🌿 Wellness Store
            </button>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ maxWidth: '950px', margin: '-24px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: 'white', borderRadius: '12px', padding: '14px 10px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
              <div style={{ color: stat.color, marginBottom: '4px' }}>{stat.icon}</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>{stat.value}</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>Our Services</h2>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Everything you need for holistic wellness</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
          {services.map((service, i) => (
            <motion.div key={service.route} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => navigate(service.route)}
              style={{ background: service.bg, borderRadius: '12px', padding: '18px 12px', textAlign: 'center', cursor: 'pointer', border: `1.5px solid ${service.color}20`, transition: 'all 0.25s', position: 'relative' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = service.color; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${service.color}20`; }}>
              {service.badge && (
                <span style={{ position: 'absolute', top: '8px', right: '8px', background: '#059669', color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '9px', fontWeight: '700' }}>{service.badge}</span>
              )}
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{service.icon}</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>{service.title}</div>
              <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.3' }}>{service.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED DOCTORS */}
      {featuredDoctors.length > 0 && (
        <section style={{ background: 'white', padding: '28px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0 }}>👨‍⚕️ Featured Ayurvedic Doctors</h2>
                <p style={{ color: '#64748b', fontSize: '12px', margin: '2px 0 0' }}>Top-rated AYUSH-registered practitioners</p>
              </div>
              <Link to="/ayurveda/doctors" style={{ color: '#059669', fontWeight: '600', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <FaArrowRight size={10} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
              {featuredDoctors.slice(0, 3).map((doctor) => (
                <div key={doctor._id} onClick={() => navigate(`/ayurveda/doctor/${doctor._id}`)}
                  style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #059669, #047857)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', flexShrink: 0 }}>👨‍⚕️</div>
                    <div>
                      <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Dr. {doctor.name}</h3>
                      <p style={{ fontSize: '11px', color: '#059669', margin: '1px 0' }}>{doctor.specialization}</p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', color: '#f59e0b' }}>⭐ {doctor.rating}</span>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b' }}>₹{doctor.consultationFee}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TRUST */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {trustFeatures.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ textAlign: 'center', padding: '18px 14px', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ color: '#059669', marginBottom: '6px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 2px' }}>{f.title}</h3>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRACTITIONER CTA */}
      <section style={{ background: 'linear-gradient(135deg, #064e3b, #047857)', padding: '28px 20px' }}>
        <div style={{ maxWidth: '550px', margin: '0 auto', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '30px', marginBottom: '6px' }}>👨‍⚕️</div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px' }}>Are You an Ayurvedic Practitioner?</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: '0 0 14px' }}>Join 50+ doctors & wellness centers. Set your own fees and hours.</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/ayurveda/doctor/register')}
              style={{ padding: '11px 22px', background: 'white', color: '#065f46', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              📝 Register as Doctor
            </button>
            <button onClick={() => navigate('/ayurveda/doctor/login')}
              style={{ padding: '11px 22px', background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              🔐 Doctor Login
            </button>
            <button onClick={() => navigate('/ayurveda/center/register')}
              style={{ padding: '11px 22px', background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              🏨 Register Center
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AyurvedaHub;

