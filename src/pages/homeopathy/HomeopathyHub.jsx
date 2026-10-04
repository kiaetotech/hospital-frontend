import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUserMd, FaLeaf, FaStar, FaCheckCircle, FaUserPlus, FaSignInAlt,
  FaSearch, FaMapMarkerAlt, FaVideo, FaClinicMedical, FaFlask, FaShoppingBag,
  FaUser, FaBaby, FaHeart, FaFemale, FaBolt, FaShieldAlt, FaClock,
  FaChevronRight, FaStethoscope
} from 'react-icons/fa';
import api from '../../services/api';

const HomeopathyHub = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [city, setCity] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingCenters, setLoadingCenters] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Fetch doctors
    api.get('/homeopathy/doctors', { params: { limit: 6 } })
      .then(res => {
        if (!mounted) return;
        const list = res.data?.data || [];
        setDoctors(list.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoadingDoctors(false); });

    // Fetch centers
    api.get('/homeopathy/centers')
      .then(res => {
        if (!mounted) return;
        const list = res.data?.data || [];
        setCenters(list.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoadingCenters(false); });

    return () => { mounted = false; };
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (city.trim()) params.set('city', city.trim());
    navigate(`/homeopathy/doctors${params.toString() ? '?' + params.toString() : ''}`);
  };

  const services = [
    { icon: '👨‍⚕️', title: 'Consult a Doctor', desc: 'Verified BHMS/MD homeopaths', route: '/homeopathy/doctors', color: '#7c3aed', bg: '#f5f3ff' },
    { icon: '💻', title: 'Online Consult', desc: 'Video call from home', route: '/homeopathy/doctors?mode=online', color: '#2563eb', bg: '#eff6ff' },
    { icon: '🏥', title: 'Naturopathy Centers', desc: 'Drugless natural healing', route: '/homeopathy/centers', color: '#059669', bg: '#ecfdf5' },
    { icon: '💊', title: 'Pharmacy', desc: 'Order remedies online', route: '/homeopathy/pharmacy', color: '#dc2626', bg: '#fef2f2' },
    { icon: '🤖', title: 'AI Remedy Matcher', desc: 'Smart remedy suggestion', route: '/homeopathy/remedy-matcher', color: '#f97316', bg: '#fff7ed', badge: 'AI' },
    ];

  const conditions = [
    { name: 'Acne & Pimples', slug: 'acne' },
    { name: 'Hair Fall', slug: 'hair-fall' },
    { name: 'Thyroid', slug: 'thyroid' },
    { name: 'Digestion', slug: 'digestion' },
    { name: 'Allergies', slug: 'allergy' },
    { name: 'Skin Issues', slug: 'skin' },
    { name: 'Arthritis', slug: 'arthritis' },
    { name: 'Migraine', slug: 'migraine' },
    { name: 'PCOS / Periods', slug: 'pcos' },
    { name: 'Stress & Anxiety', slug: 'stress' },
    { name: 'Child Immunity', slug: 'child-care' },
    { name: 'Respiratory', slug: 'respiratory' },
  ];

  const segments = [
    { icon: <FaFemale size={20} />, title: 'Women', desc: 'PCOS, periods, fertility', route: '/homeopathy/doctors?segment=women' },
    { icon: <FaBaby size={20} />, title: 'Kids', desc: 'Immunity, colic, teething', route: '/homeopathy/doctors?segment=kids' },
    { icon: <FaHeart size={20} />, title: 'Seniors', desc: 'Arthritis, BP, diabetes', route: '/homeopathy/doctors?segment=seniors' },
    { icon: <FaVideo size={20} />, title: 'Online Only', desc: 'Consult from home', route: '/homeopathy/doctors?mode=online' },
  ];

  const realStats = [
    { icon: <FaUserMd size={20} />, value: doctors.length ? `${doctors.length}+` : '0', label: 'Homeopaths', color: '#7c3aed' },
    { icon: <FaLeaf size={20} />, value: centers.length ? `${centers.length}+` : '0', label: 'Centers', color: '#059669' },
    { icon: <FaVideo size={20} />, value: '24/7', label: 'Online', color: '#2563eb' },
    { icon: <FaShieldAlt size={20} />, value: 'Verified', label: 'BHMS/MD', color: '#f59e0b' },
  ];

      const userCity = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return (u.patientAddress?.city || u.city || '').trim().toLowerCase();
    } catch { return ''; }
  })();

  const doctorsInCity = userCity
    ? doctors.filter(d => (d.address?.city || d.city || '').trim().toLowerCase() === userCity)
    : [];
  const centersInCity = userCity
    ? centers.filter(c => (c.address?.city || c.city || '').trim().toLowerCase() === userCity)
    : [];

  const doctorsSubLabel = userCity
    ? `${doctorsInCity.length} doctor${doctorsInCity.length !== 1 ? 's' : ''} in ${userCity.charAt(0).toUpperCase() + userCity.slice(1)}`
    : 'Set your city to see nearby doctors';
  const centersSubLabel = userCity
    ? `${centersInCity.length} center${centersInCity.length !== 1 ? 's' : ''} in ${userCity.charAt(0).toUpperCase() + userCity.slice(1)}`
    : 'Set your city to see nearby centers';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 30%, #7c3aed 60%, #059669 100%)', padding: '40px 20px 52px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 60%, rgba(124,58,237,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(5,150,105,0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '760px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '5px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, marginBottom: '14px', border: '1px solid rgba(255,255,255,0.12)' }}>
              🌿 Natural Healing • Scientific Approach • Verified Practitioners
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, marginBottom: '6px', lineHeight: 1.15 }}>
            Homeopathy & Naturopathy
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginBottom: '20px' }}>
            Gentle, natural remedies for lasting healing — consult verified practitioners
          </motion.p>

          {/* SEARCH BAR */}
          <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', gap: '8px', background: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', maxWidth: '620px', margin: '0 auto 14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px', paddingLeft: '8px' }}>
              <FaSearch style={{ color: '#7c3aed', fontSize: '14px' }} />
              <input
                type="text"
                placeholder="Search doctor or condition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', padding: '8px 0', color: '#1e293b' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 140px', paddingLeft: '8px', borderLeft: '1px solid #e2e8f0' }}>
              <FaMapMarkerAlt style={{ color: '#7c3aed', fontSize: '14px' }} />
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', padding: '8px 0', color: '#1e293b' }}
              />
            </div>
            <button type="submit"
              style={{ padding: '10px 22px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
              Search
            </button>
          </motion.form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/homeopathy/doctors?mode=online')}
              style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              💻 Online Consult
            </button>
            <button onClick={() => navigate('/homeopathy/centers')}
              style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              🏥 Naturopathy Centers
            </button>
          </motion.div>
        </div>
      </section>

      {/* REAL STATS */}
      <section style={{ maxWidth: '900px', margin: '-24px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {realStats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: 'white', borderRadius: '12px', padding: '14px 10px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
              <div style={{ color: s.color, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ maxWidth: '950px', margin: '0 auto', padding: '28px 20px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>Our Services</h2>
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
                  <span style={{ position: 'absolute', top: '-8px', right: '-18px', background: '#f97316', color: 'white', padding: '2px 7px', borderRadius: '8px', fontSize: '9px', fontWeight: 700 }}>{item.badge}</span>
                )}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{item.title}</div>
              <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.3 }}>{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CONDITIONS */}
      <section style={{ maxWidth: '950px', margin: '0 auto', padding: '16px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>Consult for Your Condition</h2>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Homeopathy treats the root cause — not just symptoms</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
          {conditions.map((c, i) => (
            <motion.button key={c.slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              onClick={() => navigate(`/homeopathy/doctors?condition=${c.slug}`)}
              style={{ padding: '12px 14px', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#1e293b', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = '#f5f3ff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}>
              <span>{c.name}</span>
              <FaChevronRight style={{ color: '#7c3aed', fontSize: '10px' }} />
            </motion.button>
          ))}
        </div>
      </section>

      {/* TOP DOCTORS */}
      {(loadingDoctors || doctors.length > 0) && (
        <section style={{ maxWidth: '950px', margin: '0 auto', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Our Homeopaths</h2>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '2px 0 0' }}>{doctorsSubLabel}</p>
            </div>
            <button onClick={() => navigate('/homeopathy/doctors')}
              style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <FaChevronRight style={{ fontSize: '10px' }} />
            </button>
          </div>
          {loadingDoctors ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px', height: '140px', border: '1px solid #f1f5f9', opacity: 0.5 }} />
              ))}
            </div>
                    ) : doctorsInCity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 20px', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 12px' }}>
                {userCity ? `No homeopaths in ${userCity.charAt(0).toUpperCase() + userCity.slice(1)} yet.` : 'Set your city to see homeopaths near you.'}
              </p>
              <button onClick={() => navigate('/homeopathy/doctors')}
                style={{ padding: '10px 20px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                Browse all homeopaths →
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
              {doctorsInCity.map((doc, i) => (
                <motion.div key={doc._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/homeopathy/doctor/${doc._id}`)}
                  style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: 700, flexShrink: 0 }}>
                      {doc.name?.charAt(0)?.toUpperCase() || 'D'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</h3>
                        {doc.verifiedKyc && <FaCheckCircle style={{ color: '#10b981', fontSize: '11px', flexShrink: 0 }} />}
                      </div>
                      <p style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600, margin: '0 0 4px' }}>{doc.specialization}</p>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 4px' }}>
                        {doc.experience} yrs • {doc.address?.city || 'N/A'}
                      </p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {doc.consultationTypes?.online && (
                          <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', fontWeight: 600 }}>💻 Online</span>
                        )}
                        {doc.consultationTypes?.clinic && (
                          <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', fontWeight: 600 }}>🏥 Clinic</span>
                        )}
                        {doc.isAvailable && (
                          <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '8px', background: '#dcfce7', color: '#166534', fontWeight: 600 }}>🟢 Available</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>₹{doc.consultationFee}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/homeopathy/doctor/${doc._id}`); }}
                      style={{ padding: '6px 14px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                      Book
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* NEARBY CENTERS */}
      {(loadingCenters || centers.length > 0) && (
        <section style={{ maxWidth: '950px', margin: '0 auto', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Naturopathy Centers</h2>
               <p style={{ color: '#64748b', fontSize: '13px', margin: '2px 0 0' }}>{centersSubLabel}</p>>
            </div>
            <button onClick={() => navigate('/homeopathy/centers')}
              style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <FaChevronRight style={{ fontSize: '10px' }} />
            </button>
          </div>
          {loadingCenters ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {[1, 2].map(i => (
                <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px', height: '120px', border: '1px solid #f1f5f9', opacity: 0.5 }} />
              ))}
            </div>
                    ) : centersInCity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 20px', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 12px' }}>
                {userCity ? `No naturopathy centers in ${userCity.charAt(0).toUpperCase() + userCity.slice(1)} yet.` : 'Set your city to see centers near you.'}
              </p>
              <button onClick={() => navigate('/homeopathy/centers')}
                style={{ padding: '10px 20px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                Browse all centers →
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {centersSorted.map((center, i) => (
                <motion.div key={center._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/homeopathy/center/${center._id}`)}
                  style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(5,150,105,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{center.name}</h3>
                    <FaCheckCircle style={{ color: '#10b981', fontSize: '12px', flexShrink: 0 }} />
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 4px' }}>
                    <FaMapMarkerAlt style={{ fontSize: '9px', marginRight: '4px' }} />
                    {center.address?.city}, {center.address?.state}
                  </p>
                  {center.tagline && (
                    <p style={{ fontSize: '11px', color: '#059669', margin: '0 0 8px', fontStyle: 'italic' }}>{center.tagline}</p>
                  )}
                  <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: '#64748b', paddingTop: '8px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                    {center.established && <span>Est. {center.established}</span>}
                    {center.therapyRooms > 0 && <span>• {center.therapyRooms} therapy rooms</span>}
                    {center.packages?.length > 0 && <span>• {center.packages.length} package{center.packages.length > 1 ? 's' : ''}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* SEGMENTS */}
      <section style={{ maxWidth: '950px', margin: '0 auto', padding: '16px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>Consult for</h2>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Specialized care for every stage of life</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
          {segments.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => navigate(s.route)}
              style={{ background: 'white', borderRadius: '12px', padding: '18px 14px', textAlign: 'center', cursor: 'pointer', border: '1px solid #f1f5f9', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ color: '#7c3aed', marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: '0 0 2px' }}>{s.title}</h3>
              <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: '950px', margin: '0 auto', padding: '16px 20px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>How It Works</h2>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Three simple steps to start your healing journey</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {[
            { step: '1', title: 'Choose a Doctor', desc: 'Browse verified homeopaths. Filter by city, speciality, or availability.', icon: <FaUserMd /> },
            { step: '2', title: 'Book & Pay Securely', desc: 'Pick a time slot. Pay online with UPI, card, or netbanking.', icon: <FaShieldAlt /> },
            { step: '3', title: 'Consult & Heal', desc: 'Show your OTP to the doctor. Get prescription & follow-up.', icon: <FaStethoscope /> },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: 'white', borderRadius: '12px', padding: '22px 18px', border: '1px solid #f1f5f9', textAlign: 'center', position: 'relative' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', margin: '0 auto 12px' }}>
                {s.icon}
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>
                {s.step}. {s.title}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section style={{ maxWidth: '950px', margin: '0 auto', padding: '0 20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { icon: <FaCheckCircle size={22} />, title: 'BHMS/MD Verified', desc: 'Every doctor is KYC-verified' },
            { icon: <FaLeaf size={22} />, title: 'Natural Remedies', desc: 'Gentle & side-effect free' },
            { icon: <FaStar size={22} />, title: 'Personalized Care', desc: 'Constitutional treatment' },
            { icon: <FaClock size={22} />, title: '24/7 Booking', desc: 'Book anytime, anywhere' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ textAlign: 'center', padding: '18px 14px', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ color: '#7c3aed', marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>{f.icon}</div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: '0 0 2px' }}>{f.title}</h3>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: '750px', margin: '0 auto', padding: '16px 20px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>Frequently Asked Questions</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { q: 'Is online homeopathy consultation effective?', a: 'Yes. Homeopathy is constitutional — the doctor asks about your history, symptoms, and lifestyle over video call. Prescriptions can be couriered or picked up from a local pharmacy.' },
            { q: 'How do I know the doctor is genuine?', a: 'Every doctor on our platform is KYC-verified. We check BHMS/MD degrees, medical registration numbers, and clinic details before listing them.' },
            { q: 'What is the consultation OTP for?', a: 'The OTP is a security code sent to you after booking. Share it with your doctor at the start of the consultation to confirm you are the patient who booked.' },
            { q: 'Can I reschedule or cancel?', a: 'Yes. You can reschedule up to 2 times for free. Cancellations follow the refund policy — 90% refund if cancelled more than 24 hours before the appointment.' },
            { q: 'Do you deliver homeopathy medicines?', a: 'Yes, homeopathy pharmacies on our platform deliver potentized remedies to your address. Track delivery from My Bookings.' },
          ].map((f, i) => (
            <details key={i} style={{ background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px 18px', cursor: 'pointer' }}>
              <summary style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {f.q}
                <FaChevronRight style={{ color: '#7c3aed', fontSize: '10px' }} />
              </summary>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '10px 0 0', lineHeight: 1.6 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* DOCTOR CTA */}
      <section style={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed)', padding: '32px 20px' }}>
        <div style={{ maxWidth: '550px', margin: '0 auto', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '30px', marginBottom: '6px' }}>👨‍⚕️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px' }}>Are You a Homeopath?</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: '0 0 14px' }}>Join our growing network of verified practitioners. Set your own fees and hours.</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/homeopathy/doctor/register')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '11px 22px', background: 'white', color: '#7c3aed', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
              <FaUserPlus size={14} /> Register Now
            </button>
            <button onClick={() => navigate('/homeopathy/doctor/login')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '11px 22px', background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
              <FaSignInAlt size={14} /> Doctor Login
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeopathyHub;