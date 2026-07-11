import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserMd, FaLeaf, FaShoppingBag, FaVideo, FaStar, FaCheckCircle, FaUserPlus, FaSignInAlt, FaBrain } from 'react-icons/fa';

const HomeopathyHub = () => {
  const navigate = useNavigate();

  const services = [
    { icon: '👨‍⚕️', title: 'Find a Homeopath', desc: 'Consult verified BHMS/MD doctors', route: '/homeopathy/doctors', color: '#7c3aed', bg: '#f5f3ff' },
    { icon: '🤖', title: 'Remedy Matcher AI', desc: 'AI-powered remedy suggestion', route: '/homeopathy/remedy-matcher', color: '#f97316', bg: '#fff7ed', badge: 'AI' },
    { icon: '🌿', title: 'Naturopathy Centers', desc: 'Drugless natural healing programs', route: '/homeopathy/centers', color: '#059669', bg: '#ecfdf5' },
    { icon: '💊', title: 'Pharmacy', desc: 'Order potentized remedies online', route: '/homeopathy/pharmacy', color: '#dc2626', bg: '#fef2f2' },
    { icon: '📞', title: 'Online Consult', desc: 'Video/audio consultation', route: '/homeopathy/doctors?mode=online', color: '#2563eb', bg: '#eff6ff' },
  ];

  const stats = [
    { icon: <FaUserMd size={20} />, value: '100+', label: 'Homeopaths', color: '#7c3aed' },
    { icon: <FaLeaf size={20} />, value: '50+', label: 'Naturopathy Centers', color: '#059669' },
    { icon: <FaStar size={20} />, value: '4.8', label: 'Avg Rating', color: '#f59e0b' },
    { icon: <FaVideo size={20} />, value: '24/7', label: 'Online Consult', color: '#2563eb' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 30%, #7c3aed 60%, #059669 100%)', padding: '40px 20px 52px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 60%, rgba(124,58,237,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(5,150,105,0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '5px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.12)' }}>
              🌿 Natural Healing • Scientific Approach • Verified Practitioners
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: '800', marginBottom: '6px', lineHeight: '1.15' }}>
            Homeopathy & Naturopathy
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginBottom: '20px' }}>
            Gentle, natural remedies for lasting healing — consult verified practitioners
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/homeopathy/doctors')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 22px', background: 'white', color: '#7c3aed', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              👨‍⚕️ Find a Doctor
            </button>
            <button onClick={() => navigate('/homeopathy/remedy-matcher')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 22px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              🤖 AI Remedy Matcher
            </button>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ maxWidth: '900px', margin: '-24px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: 'white', borderRadius: '12px', padding: '14px 10px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
              <div style={{ color: s.color, marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ maxWidth: '950px', margin: '0 auto', padding: '28px 20px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>Our Services</h2>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Everything you need for natural healing</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '10px' }}>
          {services.map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => navigate(item.route)}
              style={{ background: item.bg, borderRadius: '12px', padding: '18px 12px', textAlign: 'center', cursor: 'pointer', border: `1.5px solid ${item.color}20`, transition: 'all 0.25s', position: 'relative' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = item.color; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${item.color}20`; }}>
              <div style={{ color: item.color, marginBottom: '8px', display: 'inline-block', position: 'relative' }}>
                <span style={{ fontSize: '28px' }}>{item.icon}</span>
                {item.badge && (
                  <span style={{ position: 'absolute', top: '-8px', right: '-18px', background: '#f97316', color: 'white', padding: '2px 7px', borderRadius: '8px', fontSize: '9px', fontWeight: '700' }}>{item.badge}</span>
                )}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>{item.title}</div>
              <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.3' }}>{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section style={{ maxWidth: '950px', margin: '0 auto', padding: '16px 20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { icon: <FaCheckCircle size={22} />, title: 'BHMS/MD Verified', desc: 'All doctors verified' },
            { icon: <FaLeaf size={22} />, title: 'Natural Remedies', desc: 'No side effects' },
            { icon: <FaStar size={22} />, title: 'Personalized Care', desc: 'Constitutional treatment' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ textAlign: 'center', padding: '18px 14px', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ color: '#7c3aed', marginBottom: '6px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 2px' }}>{f.title}</h3>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOMEOPATH CTA */}
      <section style={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed)', padding: '28px 20px' }}>
        <div style={{ maxWidth: '550px', margin: '0 auto', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '30px', marginBottom: '6px' }}>👨‍⚕️</div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px' }}>Are You a Homeopath?</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: '0 0 14px' }}>Join 100+ practitioners. Set your own fees and hours.</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/homeopathy/doctor/register')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '11px 22px', background: 'white', color: '#7c3aed', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              <FaUserPlus size={14} /> Register Now
            </button>
            <button onClick={() => navigate('/homeopathy/doctor/login')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '11px 22px', background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              <FaSignInAlt size={14} /> Doctor Login
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeopathyHub;
