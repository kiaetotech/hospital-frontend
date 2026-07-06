import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaSearch, FaUserMd, FaStar, FaVideo, FaPhone, FaShieldAlt, 
  FaBrain, FaArrowRight, FaHeart, FaCheckCircle, FaClock,
  FaStethoscope, FaUserPlus, FaSignInAlt
} from 'react-icons/fa';
import api from '../../services/api';
import { motion } from 'framer-motion';

const OnlineDoctorHub = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const specialties = [
    { name: 'General Physician', icon: '🩺', color: '#3b82f6', bg: '#eff6ff', desc: 'Fever, cold, flu, general checkup' },
    { name: 'Dermatologist', icon: '🔬', color: '#8b5cf6', bg: '#f5f3ff', desc: 'Skin, hair, acne, rash, allergy' },
    { name: 'Gynecologist', icon: '👩‍⚕️', color: '#ec4899', bg: '#fdf2f8', desc: 'Women health, pregnancy, PCOS' },
    { name: 'Pediatrician', icon: '👶', color: '#f59e0b', bg: '#fffbeb', desc: 'Child health, vaccination, growth' },
    { name: 'Cardiologist', icon: '❤️', color: '#ef4444', bg: '#fef2f2', desc: 'Heart, blood pressure, chest pain' },
    { name: 'Neurologist', icon: '🧠', color: '#6366f1', bg: '#eef2ff', desc: 'Brain, nerves, migraine, epilepsy' },
    { name: 'Orthopedic', icon: '🦴', color: '#14b8a6', bg: '#f0fdfa', desc: 'Bones, joints, back pain, fracture' },
    { name: 'ENT Specialist', icon: '👂', color: '#06b6d4', bg: '#ecfeff', desc: 'Ear, nose, throat, sinus, hearing' },
    { name: 'Psychiatrist', icon: '🧘', color: '#10b981', bg: '#ecfdf5', desc: 'Anxiety, depression, stress, sleep' },
    { name: 'Gastroenterologist', icon: '🔍', color: '#f97316', bg: '#fff7ed', desc: 'Stomach, digestion, liver, acidity' },
    { name: 'Endocrinologist', icon: '💊', color: '#a855f7', bg: '#faf5ff', desc: 'Diabetes, thyroid, hormones, metabolism' },
    { name: 'Urologist', icon: '🩸', color: '#dc2626', bg: '#fef2f2', desc: 'Kidney, urine, prostate, bladder' },
    { name: 'Ophthalmologist', icon: '👁️', color: '#0891b2', bg: '#ecfeff', desc: 'Eye, vision, cataract, glasses' },
    { name: 'Dentist', icon: '🦷', color: '#059669', bg: '#ecfdf5', desc: 'Teeth, gum, cavity, dental pain' },
    { name: 'Pulmonologist', icon: '🫁', color: '#7c3aed', bg: '#f5f3ff', desc: 'Lungs, asthma, cough, TB, breathing' },
    { name: 'Rheumatologist', icon: '🦵', color: '#e11d48', bg: '#fff1f2', desc: 'Arthritis, joint swelling, autoimmune' },
    { name: 'Nephrologist', icon: '🩻', color: '#be123c', bg: '#fff1f2', desc: 'Kidney disease, dialysis, renal failure' },
    { name: 'Oncologist', icon: '🎗️', color: '#db2777', bg: '#fdf2f8', desc: 'Cancer care, chemotherapy, tumors' },
    { name: 'Nutritionist/Dietitian', icon: '🥗', color: '#65a30d', bg: '#f7fee7', desc: 'Diet plan, weight loss, nutrition' },
    { name: 'Physiotherapist', icon: '💪', color: '#0284c7', bg: '#f0f9ff', desc: 'Pain relief, rehab, sports injury' },
    { name: 'Sexologist', icon: '🔞', color: '#9333ea', bg: '#faf5ff', desc: 'Sexual health, infertility, STDs' },
    { name: 'Diabetologist', icon: '💉', color: '#2563eb', bg: '#eff6ff', desc: 'Diabetes management, sugar control' },
    { name: 'Ayurvedic Doctor', icon: '🧘‍♂️', color: '#d97706', bg: '#fffbeb', desc: 'Ayurveda, herbs, panchakarma' },
    { name: 'Homeopathic Doctor', icon: '🌿', color: '#15803d', bg: '#f0fdf4', desc: 'Homeopathy, natural remedies' },
    { name: 'General Surgeon', icon: '🔪', color: '#475569', bg: '#f8fafc', desc: 'Surgery consultation, hernia, appendix' },
    { name: 'Plastic Surgeon', icon: '✨', color: '#c026d3', bg: '#faf5ff', desc: 'Cosmetic surgery, reconstruction' },
    { name: 'Radiologist', icon: '📊', color: '#0e7490', bg: '#ecfeff', desc: 'X-ray, MRI, CT scan, ultrasound' },
    { name: 'Hematologist', icon: '🩸', color: '#b91c1c', bg: '#fef2f2', desc: 'Blood disorders, anemia, clotting' },
    { name: 'Sleep Specialist', icon: '😴', color: '#6366f1', bg: '#eef2ff', desc: 'Insomnia, sleep apnea, snoring' },
    { name: 'Pain Management', icon: '💊', color: '#ea580c', bg: '#fff7ed', desc: 'Chronic pain, back pain, migraine' },
    { name: 'Sports Medicine', icon: '🏃', color: '#16a34a', bg: '#f0fdf4', desc: 'Sports injury, fitness, performance' },
    { name: 'Geriatrician', icon: '👴', color: '#78716c', bg: '#fafaf9', desc: 'Elderly care, aging, dementia' },
    { name: 'Addiction Psychiatrist', icon: '🚭', color: '#7c3aed', bg: '#f5f3ff', desc: 'De-addiction, alcohol, smoking, drugs' },
    { name: 'Neonatologist', icon: '👼', color: '#f43f5e', bg: '#fff1f2', desc: 'Newborn care, premature baby, NICU' },
    { name: 'Infectious Disease', icon: '🦠', color: '#0891b2', bg: '#ecfeff', desc: 'COVID, dengue, malaria, infections' },
    { name: 'Occupational Therapist', icon: '🛠️', color: '#0d9488', bg: '#f0fdfa', desc: 'Daily skills, rehab, disability' },
    { name: 'Speech Therapist', icon: '🗣️', color: '#6366f1', bg: '#eef2ff', desc: 'Speech delay, stammering, voice' },
    { name: 'Chiropractor', icon: '🦴', color: '#0891b2', bg: '#ecfeff', desc: 'Spine alignment, posture, back pain' },
    { name: 'Pathologist', icon: '🔬', color: '#475569', bg: '#f8fafc', desc: 'Lab tests, biopsy, blood report' },
  ];

  const stats = [
    { icon: <FaUserMd size={22} />, value: '500+', label: 'Verified Doctors', color: '#3b82f6' },
    { icon: <FaCheckCircle size={22} />, value: '50K+', label: 'Consultations Done', color: '#10b981' },
    { icon: <FaStar size={22} />, value: '4.6', label: 'Average Rating', color: '#f59e0b' },
    { icon: <FaClock size={22} />, value: '3 min', label: 'Avg Wait Time', color: '#8b5cf6' }
  ];

  const trustFeatures = [
    { icon: <FaShieldAlt size={28} />, title: '100% Verified', desc: 'All doctors verified with MCI/State Medical Council. We check every credential.' },
    { icon: <FaHeart size={28} />, title: 'Transparent Pricing', desc: 'Doctor sets their fee. You see total price before booking. No hidden charges ever.' },
    { icon: <FaUserMd size={28} />, title: 'Privacy First', desc: "We don't store your medical history. Your health data belongs to you, always." }
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
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
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '850px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          
          {/* Top Badge */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
              padding: '7px 18px', borderRadius: '30px', fontSize: '13px', fontWeight: '500',
              marginBottom: '18px', border: '1px solid rgba(255,255,255,0.15)'
            }}>
              ⚡ 500+ Verified Doctors • 50,000+ Consultations • 4.6★ Rating
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            style={{ fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: '800', marginBottom: '10px', lineHeight: '1.15' }}>
            Consult Top Doctors<br />in 5 Minutes
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', margin: '0 auto 24px', maxWidth: '550px' }}>
            India's fastest growing teleconsultation platform. Video or audio consultation with verified doctors at your price.
          </motion.p>

          {/* Search Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: 'flex', gap: '8px', maxWidth: '600px', margin: '0 auto 22px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
              <FaSearch style={{ color: '#94a3b8', marginLeft: '14px', fontSize: '15px', flexShrink: 0 }} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by specialty, doctor name, or symptom..."
                style={{ width: '100%', padding: '14px 14px', border: 'none', outline: 'none', fontSize: '14px', color: '#1e293b' }} />
              <button onClick={handleSearch}
                style={{ padding: '14px 22px', background: '#2563eb', color: 'white', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Search
              </button>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/online-doctor/search')}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '13px 28px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 18px rgba(37,99,235,0.4)', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <FaVideo size={16} /> Consult Now
            </button>
            <button onClick={() => navigate('/online-doctor/triage')}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '13px 28px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}>
              <FaBrain size={16} /> AI Symptom Check
            </button>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          STATS BAR
      ============================================ */}
      <section style={{ maxWidth: '950px', margin: '-28px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }}
              style={{ background: 'white', borderRadius: '14px', padding: '18px 12px', textAlign: 'center', boxShadow: '0 3px 15px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              <div style={{ color: stat.color, marginBottom: '6px' }}>{stat.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================
          SPECIALTIES GRID
      ============================================ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '44px 20px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>Consult by Specialty</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Choose from 38 specialties — find the right doctor instantly</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
          {specialties.map((spec, i) => (
            <motion.div key={spec.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.015 }}
              onClick={() => handleSpecialtyClick(spec.name)}
              style={{ background: spec.bg, borderRadius: '12px', padding: '16px 10px', textAlign: 'center', cursor: 'pointer', border: `1.5px solid ${spec.color}20`, transition: 'all 0.25s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${spec.color}20`; e.currentTarget.style.borderColor = spec.color; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${spec.color}20`; }}>
              <div style={{ fontSize: '26px', marginBottom: '5px' }}>{spec.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>{spec.name}</div>
              <div style={{ fontSize: '9px', color: '#94a3b8', lineHeight: '1.3' }}>{spec.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================
          TOP RATED DOCTORS
      ============================================ */}
      {featuredDoctors.length > 0 && (
        <section style={{ background: 'white', padding: '40px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: '0' }}>⭐ Top Rated Doctors</h2>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '3px 0 0 0' }}>Highest rated by patients</p>
              </div>
              <Link to="/online-doctor/search" style={{ color: '#2563eb', fontWeight: '600', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <FaArrowRight size={11} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {featuredDoctors.map((doc) => (
                <motion.div key={doc._id} whileHover={{ y: -3 }}
                  onClick={() => navigate(`/online-doctor/doctor/${doc._id}`)}
                  style={{ background: '#f8fafc', borderRadius: '14px', padding: '18px', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', flexShrink: 0 }}>👨‍⚕️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0' }}>Dr. {doc.name}</h3>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0' }}>{doc.specialization} • {doc.experience} yrs</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                        <span style={{ fontSize: '12px', color: '#f59e0b' }}>⭐ {doc.ratingSummary?.averageRating?.toFixed(1) || 'New'}</span>
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
      <section style={{ maxWidth: '950px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {trustFeatures.map((feature, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }}
              style={{ textAlign: 'center', padding: '24px 18px', background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ color: '#2563eb', marginBottom: '10px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 5px 0' }}>{feature.title}</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================
          DOCTOR CTA
      ============================================ */}
      <section style={{ background: 'linear-gradient(135deg, #1e40af, #7c3aed)', padding: '36px 20px' }}>
        <div style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>👨‍⚕️</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0' }}>Are You a Doctor?</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', margin: '0 0 18px 0' }}>
            Join 500+ doctors already consulting online. Set your own fee, your own hours. Pay only when you earn.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/online-doctor/register')}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '13px 26px', background: 'white', color: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
              <FaUserPlus size={16} /> Register Now
            </button>
            <button onClick={() => navigate('/online-doctor/login')}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '13px 26px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
              <FaSignInAlt size={16} /> Doctor Login
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OnlineDoctorHub; 
