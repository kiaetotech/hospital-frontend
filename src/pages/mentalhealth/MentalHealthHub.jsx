import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaUserMd, FaStar, FaCheckCircle, FaClock, FaShieldAlt, FaHeart, FaCommentDots, FaBookOpen, FaBuilding, FaClipboardList, FaSearch, FaBrain, FaUserPlus, FaSignInAlt } from 'react-icons/fa';

const MentalHealthHub = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featuredTherapists, setFeaturedTherapists] = useState([]);
  const [stats, setStats] = useState({ totalTherapists: 50, totalSessions: 5000, satisfactionRate: 96, averageResponseTime: '24 hrs' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [featuredRes, statsRes] = await Promise.all([
        axios.get('/api/mentalhealth/therapists/featured'),
        axios.get('/api/mentalhealth/stats')
      ]);
      if (featuredRes.data?.success) setFeaturedTherapists(featuredRes.data.data || []);
      if (statsRes.data?.success) setStats(prev => ({ ...prev, ...statsRes.data.data }));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: <FaSearch size={24} />, label: 'Find a Therapist', desc: 'Browse all licensed professionals', route: '/mentalhealth/therapists', color: '#7c3aed', bg: '#f5f3ff' },
    { icon: <FaBrain size={24} />, label: 'Smart Match', desc: 'AI match by language, budget & concern', route: '/mentalhealth/therapists?match=true', color: '#f97316', bg: '#fff7ed', badge: 'AI' },
    { icon: <FaClipboardList size={24} />, label: 'Depression Screening', desc: 'PHQ-9 self-assessment test', route: '/mentalhealth/screening/depression', color: '#2563eb', bg: '#eff6ff' },
    { icon: <FaClipboardList size={24} />, label: 'Anxiety Screening', desc: 'GAD-7 self-assessment test', route: '/mentalhealth/screening/anxiety', color: '#059669', bg: '#ecfdf5' },
    { icon: <FaCommentDots size={24} />, label: 'Anonymous Chat', desc: 'Talk freely without identity', route: '/mentalhealth/chat', color: '#f59e0b', bg: '#fffbeb' },
    { icon: <FaBookOpen size={24} />, label: 'Mood Journal', desc: 'Daily tracking + AI analysis', route: '/mentalhealth/journal', color: '#0891b2', bg: '#ecfeff', badge: 'NEW' },
    { icon: <FaBuilding size={24} />, label: 'Corporate EAP', desc: 'Employee wellness programs', route: '/mentalhealth/corporate', color: '#475569', bg: '#f8fafc' },
    { icon: <FaShieldAlt size={24} />, label: 'Crisis Support', desc: '24/7 emergency helplines', route: '/mentalhealth/crisis', color: '#dc2626', bg: '#fef2f2' },
  ];

  const trustFeatures = [
    { icon: <FaShieldAlt size={24} />, title: '100% Confidential', desc: 'Your privacy is our priority. All sessions encrypted end-to-end.' },
    { icon: <FaUserMd size={24} />, title: 'Licensed Therapists', desc: 'Every therapist is verified, experienced & background-checked.' },
    { icon: <FaHeart size={24} />, title: 'Judgment-Free Zone', desc: 'Safe space to share. No stigma, no judgment, just support.' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%)', padding: '44px 20px 52px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 60%, rgba(99,102,241,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(139,92,246,0.15) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '750px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.12)' }}>
              🧠 Confidential • Professional • Supportive
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: '800', marginBottom: '8px', lineHeight: '1.15' }}>
            Mental Health & Wellness
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', marginBottom: '22px' }}>
            Professional, confidential support from licensed therapists — from the comfort of your home
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/mentalhealth/crisis')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '13px 24px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 18px rgba(220,38,38,0.3)' }}>
              🆘 Crisis Support
            </button>
            <button onClick={() => navigate('/mentalhealth/therapists')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '13px 24px', background: 'white', color: '#4338ca', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              🔍 Find a Therapist
            </button>
            <button onClick={() => navigate('/mentalhealth/therapist/register')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '13px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              👨‍⚕️ Are You a Therapist?
            </button>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ maxWidth: '950px', margin: '-24px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {[
            { icon: <FaUserMd size={20} />, value: `${stats.totalTherapists}+`, label: 'Therapists', color: '#7c3aed' },
            { icon: <FaCheckCircle size={20} />, value: `${stats.totalSessions}+`, label: 'Sessions', color: '#059669' },
            { icon: <FaStar size={20} />, value: `${stats.satisfactionRate}%`, label: 'Satisfaction', color: '#f59e0b' },
            { icon: <FaClock size={20} />, value: stats.averageResponseTime, label: 'Response', color: '#3b82f6' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: 'white', borderRadius: '14px', padding: '16px 10px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
              <div style={{ color: s.color, marginBottom: '5px' }}>{s.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>How Can We Help?</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Choose a service that fits your needs</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
          {quickActions.map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => navigate(item.route)}
              style={{ background: item.bg, borderRadius: '14px', padding: '20px 14px', textAlign: 'center', cursor: 'pointer', border: `1.5px solid ${item.color}20`, transition: 'all 0.25s', position: 'relative' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = item.color; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${item.color}20`; }}>
              <div style={{ color: item.color, marginBottom: '8px', display: 'inline-block', position: 'relative' }}>
                {item.icon}
                {item.badge && (
                  <span style={{ position: 'absolute', top: '-8px', right: '-18px', background: item.badge === 'AI' ? '#f97316' : '#059669', color: 'white', padding: '2px 7px', borderRadius: '8px', fontSize: '9px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    {item.badge}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '3px' }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 20px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {trustFeatures.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ textAlign: 'center', padding: '22px 16px', background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ color: '#7c3aed', marginBottom: '8px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px' }}>{f.title}</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.4' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED THERAPISTS */}
      {featuredTherapists.length > 0 && (
        <section style={{ background: 'white', padding: '28px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0 }}>⭐ Featured Therapists</h2>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '2px 0 0' }}>Top-rated licensed professionals</p>
              </div>
              <Link to="/mentalhealth/therapists" style={{ color: '#7c3aed', fontWeight: '600', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {featuredTherapists.slice(0, 3).map((t) => (
                <div key={t._id} onClick={() => navigate(`/mentalhealth/therapist/${t._id}`)}
                  style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', flexShrink: 0 }}>👤</div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{t.name}</h3>
                      <p style={{ fontSize: '12px', color: '#7c3aed', margin: '2px 0' }}>{t.specializations?.slice(0, 2).join(', ')}</p>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '3px' }}>
                        <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>⭐ {t.rating || 0}</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>₹{t.pricing?.consultation || 500}/session</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* THERAPIST CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1e1b4b, #4338ca)', padding: '32px 20px' }}>
        <div style={{ maxWidth: '550px', margin: '0 auto', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '34px', marginBottom: '8px' }}>👨‍⚕️</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 6px' }}>Are You a Therapist?</h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '0 0 16px' }}>Join 50+ licensed therapists. Set your own hours and fees. Earn what you deserve.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/mentalhealth/therapist/register')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '13px 26px', background: 'white', color: '#4338ca', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              <FaUserPlus size={16} /> Register Now
            </button>
            <button onClick={() => navigate('/mentalhealth/therapist/login')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '13px 26px', background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              <FaSignInAlt size={16} /> Therapist Login
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MentalHealthHub;