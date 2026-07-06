import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaSearch, FaUserMd, FaStar, FaVideo, FaShieldAlt, 
  FaBrain, FaArrowRight, FaHeart, FaCheckCircle, FaClock,
  FaUserPlus, FaSignInAlt
} from 'react-icons/fa';
import api from '../../services/api';
import { motion } from 'framer-motion';

const OnlineDoctorHub = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);

  const topSpecialties = [
    { name: 'General Physician', icon: '🩺', color: '#3b82f6' },
    { name: 'Cardiologist', icon: '❤️', color: '#ef4444' },
    { name: 'Gynecologist', icon: '👩‍⚕️', color: '#ec4899' },
    { name: 'Pediatrician', icon: '👶', color: '#f59e0b' },
    { name: 'Dermatologist', icon: '🔬', color: '#8b5cf6' },
    { name: 'Neurologist', icon: '🧠', color: '#6366f1' },
    { name: 'Orthopedic', icon: '🦴', color: '#14b8a6' },
    { name: 'Psychiatrist', icon: '🧘', color: '#10b981' },
  ];

  const allSpecialties = [
    ...topSpecialties,
    { name: 'ENT Specialist', icon: '👂', color: '#06b6d4' },
    { name: 'Gastroenterologist', icon: '🔍', color: '#f97316' },
    { name: 'Endocrinologist', icon: '💊', color: '#a855f7' },
    { name: 'Urologist', icon: '🩸', color: '#dc2626' },
    { name: 'Ophthalmologist', icon: '👁️', color: '#0891b2' },
    { name: 'Dentist', icon: '🦷', color: '#059669' },
    { name: 'Pulmonologist', icon: '🫁', color: '#7c3aed' },
    { name: 'Rheumatologist', icon: '🦵', color: '#e11d48' },
    { name: 'Nephrologist', icon: '🩻', color: '#be123c' },
    { name: 'Oncologist', icon: '🎗️', color: '#db2777' },
    { name: 'Nutritionist', icon: '🥗', color: '#65a30d' },
    { name: 'Physiotherapist', icon: '💪', color: '#0284c7' },
    { name: 'Sexologist', icon: '🔞', color: '#9333ea' },
    { name: 'Diabetologist', icon: '💉', color: '#2563eb' },
    { name: 'Ayurvedic Doctor', icon: '🧘‍♂️', color: '#d97706' },
    { name: 'Homeopathic Doctor', icon: '🌿', color: '#15803d' },
    { name: 'General Surgeon', icon: '🔪', color: '#475569' },
    { name: 'Plastic Surgeon', icon: '✨', color: '#c026d3' },
    { name: 'Radiologist', icon: '📊', color: '#0e7490' },
    { name: 'Hematologist', icon: '🩸', color: '#b91c1c' },
    { name: 'Sleep Specialist', icon: '😴', color: '#6366f1' },
    { name: 'Pain Management', icon: '💊', color: '#ea580c' },
    { name: 'Sports Medicine', icon: '🏃', color: '#16a34a' },
    { name: 'Geriatrician', icon: '👴', color: '#78716c' },
    { name: 'Addiction Psychiatrist', icon: '🚭', color: '#7c3aed' },
    { name: 'Neonatologist', icon: '👼', color: '#f43f5e' },
    { name: 'Infectious Disease', icon: '🦠', color: '#0891b2' },
    { name: 'Occupational Therapist', icon: '🛠️', color: '#0d9488' },
    { name: 'Speech Therapist', icon: '🗣️', color: '#6366f1' },
    { name: 'Chiropractor', icon: '🦴', color: '#0891b2' },
    { name: 'Pathologist', icon: '🔬', color: '#475569' },
  ];

  const stats = [
    { icon: <FaUserMd size={20} />, value: '500+', label: 'Verified Doctors', color: '#3b82f6' },
    { icon: <FaCheckCircle size={20} />, value: '50K+', label: 'Consultations', color: '#10b981' },
    { icon: <FaStar size={20} />, value: '4.6', label: 'Average Rating', color: '#f59e0b' },
    { icon: <FaClock size={20} />, value: '3 min', label: 'Avg Wait Time', color: '#8b5cf6' }
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/online-doctor/doctors/featured');
        if (res.data?.success) setFeaturedDoctors(res.data.data?.slice(0, 3) || []);
      } catch (err) {}
    };
    fetchFeatured();
  }, []);

  // ============================================
  // SMART SEARCH — Symptom → Triage, Other → Search
  // ============================================
  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    
    // Map common disease/condition keywords to specialties using medical knowledge
    const diseaseToSpecialty = {
      // Heart
      'heart': 'Cardiologist', 'chest pain': 'Cardiologist', 'bp': 'Cardiologist', 'blood pressure': 'Cardiologist',
      'palpitation': 'Cardiologist', 'cholesterol': 'Cardiologist', 'angiogram': 'Cardiologist',
      // Brain
      'migraine': 'Neurologist', 'seizure': 'Neurologist', 'epilepsy': 'Neurologist', 'paralysis': 'Neurologist',
      'stroke': 'Neurologist', 'tremor': 'Neurologist', 'parkinson': 'Neurologist', 'memory': 'Neurologist',
      'numbness': 'Neurologist', 'tingling': 'Neurologist',
      // Bones
      'fracture': 'Orthopedic', 'back pain': 'Orthopedic', 'knee pain': 'Orthopedic', 'joint pain': 'Orthopedic',
      'arthritis': 'Orthopedic', 'spine': 'Orthopedic', 'neck pain': 'Orthopedic', 'shoulder': 'Orthopedic',
      'sciatica': 'Orthopedic', 'spondylitis': 'Orthopedic', 'gout': 'Orthopedic', 'osteoporosis': 'Orthopedic',
      // Skin
      'acne': 'Dermatologist', 'pimple': 'Dermatologist', 'eczema': 'Dermatologist', 'psoriasis': 'Dermatologist',
      'ringworm': 'Dermatologist', 'fungal': 'Dermatologist', 'hair loss': 'Dermatologist', 'dandruff': 'Dermatologist',
      'mole': 'Dermatologist', 'melanoma': 'Dermatologist',
      // Women
      'pregnancy': 'Gynecologist', 'pregnant': 'Gynecologist', 'period': 'Gynecologist', 'menstrual': 'Gynecologist',
      'pcos': 'Gynecologist', 'fibroids': 'Gynecologist', 'menopause': 'Gynecologist', 'endometriosis': 'Gynecologist',
      'infertility': 'Gynecologist', 'ivf': 'Gynecologist', 'pap smear': 'Gynecologist',
      // Children
      'child': 'Pediatrician', 'baby': 'Pediatrician', 'infant': 'Pediatrician', 'vaccination': 'Pediatrician',
      'growth': 'Pediatrician', 'newborn': 'Pediatrician',
      // Stomach
      'acidity': 'Gastroenterologist', 'gas': 'Gastroenterologist', 'bloating': 'Gastroenterologist',
      'constipation': 'Gastroenterologist', 'diarrhea': 'Gastroenterologist', 'jaundice': 'Gastroenterologist',
      'hepatitis': 'Gastroenterologist', 'ulcer': 'Gastroenterologist', 'hernia': 'Gastroenterologist',
      'appendicitis': 'Gastroenterologist', 'gallstones': 'Gastroenterologist', 'ibs': 'Gastroenterologist',
      'fatty liver': 'Gastroenterologist', 'cirrhosis': 'Gastroenterologist', 'gerd': 'Gastroenterologist',
      // Lungs
      'asthma': 'Pulmonologist', 'wheezing': 'Pulmonologist', 'bronchitis': 'Pulmonologist',
      'pneumonia': 'Pulmonologist', 'tuberculosis': 'Pulmonologist', 'tb': 'Pulmonologist', 'copd': 'Pulmonologist',
      'sleep apnea': 'Pulmonologist', 'snoring': 'Sleep Specialist',
      // Diabetes/Hormones
      'diabetes': 'Endocrinologist', 'sugar': 'Endocrinologist', 'thyroid': 'Endocrinologist',
      'weight gain': 'Endocrinologist', 'weight loss': 'Endocrinologist', 'obesity': 'Endocrinologist',
      'hba1c': 'Endocrinologist', 'glucose': 'Endocrinologist', 'insulin': 'Endocrinologist',
      // Kidney/Urine
      'kidney stone': 'Urologist', 'urine': 'Urologist', 'burning urination': 'Urologist',
      'frequent urination': 'Urologist', 'prostate': 'Urologist', 'bladder': 'Urologist',
      'dialysis': 'Nephrologist', 'renal': 'Nephrologist', 'kidney failure': 'Nephrologist',
      // Eye
      'cataract': 'Ophthalmologist', 'glaucoma': 'Ophthalmologist', 'vision': 'Ophthalmologist',
      'blurry': 'Ophthalmologist', 'eye pain': 'Ophthalmologist', 'red eye': 'Ophthalmologist',
      // ENT
      'ear pain': 'ENT Specialist', 'hearing': 'ENT Specialist', 'tinnitus': 'ENT Specialist',
      'sinus': 'ENT Specialist', 'tonsils': 'ENT Specialist', 'vertigo': 'ENT Specialist',
      'dizziness': 'ENT Specialist', 'nose bleed': 'ENT Specialist',
      // Dental
      'tooth': 'Dentist', 'teeth': 'Dentist', 'gum': 'Dentist', 'cavity': 'Dentist', 'dental': 'Dentist',
      // Mental
      'anxiety': 'Psychiatrist', 'depression': 'Psychiatrist', 'stress': 'Psychiatrist',
      'insomnia': 'Psychiatrist', 'panic': 'Psychiatrist', 'ocd': 'Psychiatrist', 'bipolar': 'Psychiatrist',
      'addiction': 'Addiction Psychiatrist', 'alcohol': 'Addiction Psychiatrist', 'smoking': 'Addiction Psychiatrist',
      // Cancer
      'cancer': 'Oncologist', 'tumor': 'Oncologist', 'lump': 'Oncologist', 'chemotherapy': 'Oncologist',
      // Blood
      'anemia': 'Hematologist', 'blood disorder': 'Hematologist', 'clotting': 'Hematologist', 'leukemia': 'Hematologist',
      // Infections
      'dengue': 'Infectious Disease', 'malaria': 'Infectious Disease', 'typhoid': 'Infectious Disease',
      'covid': 'Infectious Disease', 'chickenpox': 'Infectious Disease', 'hiv': 'Infectious Disease',
      // Other
      'allergy': 'General Physician', 'fever': 'General Physician', 'cold': 'General Physician',
      'cough': 'General Physician', 'flu': 'General Physician', 'headache': 'General Physician',
      'body ache': 'General Physician', 'weakness': 'General Physician', 'fatigue': 'General Physician',
      'sore throat': 'General Physician', 'infection': 'General Physician',
      'diet': 'Nutritionist', 'nutrition': 'Nutritionist', 'physiotherapy': 'Physiotherapist',
      'rehab': 'Physiotherapist', 'sports injury': 'Sports Medicine', 'ayurveda': 'Ayurvedic Doctor',
      'homeopathy': 'Homeopathic Doctor', 'sex': 'Sexologist', 'std': 'Sexologist',
      'surgery': 'General Surgeon', 'plastic': 'Plastic Surgeon', 'cosmetic': 'Plastic Surgeon',
      'xray': 'Radiologist', 'mri': 'Radiologist', 'ct scan': 'Radiologist', 'ultrasound': 'Radiologist',
      'elderly': 'Geriatrician', 'dementia': 'Geriatrician', 'alzheimer': 'Geriatrician',
      'speech': 'Speech Therapist', 'stammering': 'Speech Therapist', 'lab test': 'Pathologist',
      'biopsy': 'Pathologist', 'blood test': 'Pathologist'
    };

    const qLower = q.toLowerCase();
    let matchedSpecialty = null;
    let matchedKey = '';

    // Find longest matching keyword
    for (const [key, specialty] of Object.entries(diseaseToSpecialty)) {
      if (qLower.includes(key) && key.length > matchedKey.length) {
        matchedSpecialty = specialty;
        matchedKey = key;
      }
    }

    if (matchedSpecialty) {
      navigate(`/online-doctor/search?specialty=${encodeURIComponent(matchedSpecialty)}&q=${encodeURIComponent(q)}`);
    } else {
      navigate(`/online-doctor/search?q=${encodeURIComponent(q)}`);
    }
  };

  const handleSpecialtyClick = (specialty) => {
    navigate(`/online-doctor/search?specialty=${encodeURIComponent(specialty)}`);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ============================================
          HERO — Compact
      ============================================ */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #1e40af 100%)', padding: '36px 20px 44px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.12) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '750px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '5px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.12)' }}>
              ⚡ 500+ Verified Doctors • 50,000+ Consultations • 4.6★
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '800', marginBottom: '6px', lineHeight: '1.15' }}>
            Consult Top Doctors in 5 Minutes
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginBottom: '18px' }}>
            Video or audio consultation with verified doctors at your price.
          </motion.p>

          {/* SEARCH + BUTTONS ROW */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ display: 'flex', gap: '10px', maxWidth: '650px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '280px', display: 'flex', alignItems: 'center', background: 'white', borderRadius: '10px', overflow: 'hidden' }}>
              <FaSearch style={{ color: '#94a3b8', marginLeft: '12px', fontSize: '14px', flexShrink: 0 }} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search specialty, doctor, or symptom..."
                style={{ width: '100%', padding: '12px 12px', border: 'none', outline: 'none', fontSize: '14px', color: '#1e293b' }} />
              <button onClick={handleSearch} style={{ padding: '12px 20px', background: '#2563eb', color: 'white', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Search</button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => navigate('/online-doctor/search')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '12px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}>
                <FaVideo size={14} /> Consult Now
              </button>
              <button onClick={() => navigate('/online-doctor/triage')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '12px 20px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <FaBrain size={14} /> AI Symptom Check
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          STATS + SPECIALTIES — Compact
      ============================================ */}
      <section style={{ maxWidth: '1000px', margin: '-20px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '28px' }}>
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} style={{ background: 'white', borderRadius: '12px', padding: '14px 10px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
              <div style={{ color: stat.color, marginBottom: '4px' }}>{stat.icon}</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>{stat.value}</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Section Title */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>Consult by Specialty</h2>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Top specialties — 38+ medical fields available</p>
        </div>

        {/* TOP 8 — Big Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {topSpecialties.map((spec, i) => (
            <motion.div key={spec.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => handleSpecialtyClick(spec.name)}
              style={{ background: 'white', borderRadius: '14px', padding: '22px 12px 18px', textAlign: 'center', cursor: 'pointer', border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.03)', transition: 'all 0.25s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = spec.color; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}>
              <div style={{ fontSize: '36px', marginBottom: '6px', lineHeight: '1' }}>{spec.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{spec.name}</div>
            </motion.div>
          ))}
        </div>

        {/* VIEW ALL BUTTON */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => setShowAllSpecialties(!showAllSpecialties)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 28px', background: 'white', color: '#2563eb', border: '2px solid #2563eb', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#2563eb'; }}>
            {showAllSpecialties ? 'Show Less ▲' : 'View All 38 Specialties ▼'}
          </button>
        </div>

        {/* ALL SPECIALTIES — Expandable */}
        {showAllSpecialties && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
            {allSpecialties.map((spec) => (
              <div key={spec.name} onClick={() => handleSpecialtyClick(spec.name)}
                style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px 8px', textAlign: 'center', cursor: 'pointer', border: '1.5px solid #e2e8f0', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563eb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                <div style={{ fontSize: '20px', marginBottom: '3px' }}>{spec.icon}</div>
                <div style={{ fontSize: '10px', fontWeight: '600', color: '#1e293b' }}>{spec.name}</div>
              </div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ============================================
          TRUST + FEATURED DOCTORS — Compact Row
      ============================================ */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { icon: <FaShieldAlt size={24} />, title: '100% Verified', desc: 'MCI/State Council verified' },
            { icon: <FaHeart size={24} />, title: 'Transparent Pricing', desc: 'No hidden charges ever' },
            { icon: <FaUserMd size={24} />, title: 'Privacy First', desc: 'Your data belongs to you' }
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ textAlign: 'center', padding: '18px 14px', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ color: '#2563eb', marginBottom: '6px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 2px' }}>{f.title}</h3>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================
          TOP RATED DOCTORS — If Available
      ============================================ */}
      {featuredDoctors.length > 0 && (
        <section style={{ background: 'white', padding: '24px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>⭐ Top Rated Doctors</h2>
              <Link to="/online-doctor/search" style={{ color: '#2563eb', fontWeight: '600', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>View All <FaArrowRight size={10} /></Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
              {featuredDoctors.map((doc) => (
                <div key={doc._id} onClick={() => navigate(`/online-doctor/doctor/${doc._id}`)}
                  style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', flexShrink: 0 }}>👨‍⚕️</div>
                    <div>
                      <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Dr. {doc.name}</h3>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '1px 0' }}>{doc.specialization} • {doc.experience} yrs</p>
                      <span style={{ fontSize: '12px', color: '#f59e0b' }}>⭐ {doc.ratingSummary?.averageRating?.toFixed(1) || 'New'}</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', marginLeft: '8px' }}>₹{doc.consultationFee}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          DOCTOR CTA
      ============================================ */}
      <section style={{ background: 'linear-gradient(135deg, #1e40af, #7c3aed)', padding: '28px 20px' }}>
        <div style={{ maxWidth: '550px', margin: '0 auto', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '30px', marginBottom: '6px' }}>👨‍⚕️</div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px' }}>Are You a Doctor?</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: '0 0 14px' }}>Set your own fee, your own hours. Pay only when you earn.</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/online-doctor/register')} style={{ padding: '11px 22px', background: 'white', color: '#2563eb', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              <FaUserPlus size={14} style={{ marginRight: '4px', display: 'inline' }} /> Register Now
            </button>
            <button onClick={() => navigate('/online-doctor/login')} style={{ padding: '11px 22px', background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              <FaSignInAlt size={14} style={{ marginRight: '4px', display: 'inline' }} /> Doctor Login
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OnlineDoctorHub;