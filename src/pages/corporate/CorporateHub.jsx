import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-f1b1.up.railway.app';

/* ================================================================
   CORPORATE HUB — PRODUCTION DESIGN v2
   Professional layout • Count-up stats • Smooth animations
   Responsive 320px–1440px • All buttons functional
   ================================================================ */

const CorporateHub = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [stats, setStats] = useState({ totalProviders: 0, breakdown: {} });
  const [activeTag, setActiveTag] = useState('all');
  const [city, setCity] = useState('');
  const [minEmployees, setMinEmployees] = useState('');
  const [animatedStats, setAnimatedStats] = useState({ providers: 0, hospitals: 0, wellness: 0 });
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);

  useEffect(() => { fetchStats(); fetchPackages(); }, []);
  useEffect(() => { fetchPackages(activeTag); }, [activeTag]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/corporate-hub/stats`);
      if (res.data?.success) setStats(res.data.data);
    } catch (e) { console.log('Stats unavailable'); }
  };

  const fetchPackages = async (tag = 'all') => {
    setLoading(true);
    try {
      const params = {};
      if (tag !== 'all') params.tag = tag;
      if (city) params.city = city;
      if (minEmployees) params.minEmployees = minEmployees;
      const res = await axios.get(`${API_BASE}/api/corporate-hub/packages`, { params });
      if (res.data?.success) setPackages(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ---------- count-up animation ---------- */
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !statsAnimated) {
        setStatsAnimated(true);
        const h = (stats.breakdown?.hospitals || 0) + (stats.breakdown?.diagnostics || 0);
        const w = (stats.breakdown?.mentalHealth || 0) + (stats.breakdown?.ayurveda || 0) + (stats.breakdown?.homeopathy || 0);
        animateCount('providers', stats.totalProviders || 0);
        animateCount('hospitals', h);
        animateCount('wellness', w);
      }
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [stats, statsAnimated]);

  const animateCount = (key, target) => {
    let start = 0, duration = 1500, step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { start = target; clearInterval(timer); }
      setAnimatedStats(prev => ({ ...prev, [key]: start }));
    }, 16);
  };

  /* ---------- data ---------- */
  const tags = [
    { key: 'all', label: 'All Services', icon: '🏢' },
    { key: 'hospitals', label: 'Hospitals', icon: '🏥' },
    { key: 'onlineDoctors', label: 'Online Doctors', icon: '📱' },
    { key: 'diagnostics', label: 'Lab Tests', icon: '🔬' },
    { key: 'mentalHealth', label: 'Mental Wellness', icon: '🧠' },
    { key: 'ayurveda', label: 'Ayurveda', icon: '🧘' },
    { key: 'homeopathy', label: 'Homeopathy', icon: '🌿' },
    { key: 'caregivers', label: 'Home Care', icon: '🏠' },
    { key: 'ambulance', label: 'Ambulance', icon: '🚑' },
  ];

  const fmt = (n) => n ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) : '₹0';
  const tagLabel = (t) => ({ hospitals:'Hospital', onlineDoctors:'Online Doctor', diagnostics:'Lab Tests', mentalHealth:'Mental Wellness', ayurveda:'Ayurveda', homeopathy:'Homeopathy', caregivers:'Home Care', ambulance:'Ambulance' }[t] || t);

  const handleSearch = (e) => { e.preventDefault(); fetchPackages(activeTag); };

  /* ========== STYLES ========== */
  const s = {
    section: { padding: '80px 24px', maxWidth: 1200, margin: '0 auto' },
    sectionGray: { padding: '80px 24px', backgroundColor: '#f8fafc' },
    h2: { fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, textAlign: 'center', color: '#0f172a', marginBottom: 12 },
    sub: { fontSize: '1.1rem', color: '#64748b', textAlign: 'center', maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.6 },
    btnPrimary: { padding: '14px 32px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'all .2s', display: 'inline-flex', alignItems: 'center', gap: 8 },
    btnOutline: { padding: '14px 32px', backgroundColor: 'transparent', border: '2px solid #fff', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 },
    btnAccent: { padding: '14px 36px', backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(245,158,11,0.35)' },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 28, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all .3s' },
    tag: (active) => ({ padding: '10px 18px', borderRadius: 30, border: active ? '2px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: active ? '#2563eb' : '#fff', color: active ? '#fff' : '#475569', fontSize: '0.9rem', cursor: 'pointer', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap', transition: 'all .2s' }),
    input: { padding: '12px 18px', border: '2px solid #e2e8f0', borderRadius: 12, fontSize: '0.95rem', outline: 'none', width: 200, transition: 'border .2s' },
  };

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", backgroundColor: '#fff', color: '#1e293b', lineHeight: 1.6 }}>
      
      {/* ==================== HERO ==================== */}
      <section style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 40%, #1e40af 100%)', padding: '100px 24px 80px', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🏢</div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: 16 }}>
            Employee Healthcare, <span style={{ color: '#fbbf24' }}>Simplified</span>
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: 650, margin: '0 auto 32px', lineHeight: 1.7 }}>
            One platform. 8 healthcare services. Corporate-negotiated rates. Pay only for what your employees use — no wasted premiums, no lock-in contracts.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/corporate/register')} style={s.btnAccent}>🚀 Register Your Company</button>
            <button onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })} style={s.btnOutline}>📋 Browse Packages</button>
          </div>
        </div>
      </section>

      {/* ==================== TRUST BAR ==================== */}
      <section style={{ borderBottom: '1px solid #e2e8f0', padding: '18px 24px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(1rem, 4vw, 3rem)', flexWrap: 'wrap', fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
          <span style={{ color: '#94a3b8', letterSpacing: 1 }}>TRUSTED BY COMPANIES ACROSS INDIA</span>
          <span>🔒 ISO Certified</span><span>✅ NABH Accredited</span><span>🛡️ Data Secure</span><span>🇮🇳 Pan India</span>
        </div>
      </section>

      {/* ==================== STATS ==================== */}
      <section ref={statsRef} style={{ padding: '60px 24px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
          {[
            { label: 'Verified Providers', value: animatedStats.providers, suffix: '+' },
            { label: 'Hospitals & Labs', value: animatedStats.hospitals, suffix: '+' },
            { label: 'Wellness Providers', value: animatedStats.wellness, suffix: '+' },
            { label: 'Service Categories', value: 8, suffix: '' },
          ].map((st, i) => (
            <div key={i} style={{ padding: 24 }}>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: '#2563eb' }}>{st.value}{st.suffix}</div>
              <div style={{ color: '#64748b', marginTop: 4 }}>{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section style={s.section}>
        <h2 style={s.h2}>How It Works</h2>
        <p style={s.sub}>Simple 5-step process to get your employees covered</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
          {[
            { icon: '🔍', title: '1. Browse', desc: 'Explore packages from 8 service categories' },
            { icon: '✅', title: '2. Select', desc: 'Pick services your employees need' },
            { icon: '💳', title: '3. Add Funds', desc: 'Load your company wallet' },
            { icon: '👥', title: '4. Invite', desc: 'Upload CSV — employees get access' },
            { icon: '📊', title: '5. Track & Pay', desc: 'Real-time dashboard. Pay per use' },
          ].map((item, i) => (
            <div key={i} style={{ padding: 24, backgroundColor: '#f8fafc', borderRadius: 16 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>{item.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== PACKAGES ==================== */}
      <section id="packages" style={{ ...s.sectionGray, padding: '80px 24px' }}>
        <h2 style={s.h2}>Corporate Healthcare Packages</h2>
        <p style={s.sub}>Filter by service type, city, and employee count</p>

        {/* Tag filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          {tags.map(t => <button key={t.key} onClick={() => setActiveTag(t.key)} style={s.tag(activeTag === t.key)}>{t.icon} {t.label}</button>)}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          <input placeholder="📍 City" value={city} onChange={e => setCity(e.target.value)} style={s.input} />
          <input placeholder="👥 Min Employees" type="number" value={minEmployees} onChange={e => setMinEmployees(e.target.value)} style={{ ...s.input, width: 180 }} />
          <button type="submit" style={s.btnPrimary}>🔍 Search</button>
        </form>

        {/* Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div style={{ fontSize: '3rem' }}>⏳</div><p style={{ color: '#64748b', marginTop: 12 }}>Loading packages…</p></div>
        ) : packages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, ...s.card }}>
            <div style={{ fontSize: '4rem', marginBottom: 12 }}>📦</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No corporate packages found</h3>
            <p style={{ color: '#64748b' }}>Providers haven't listed packages yet. <a href="mailto:corporate@healthcarehub.com" style={{ color: '#2563eb' }}>Contact us</a> for custom plans.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            {packages.map(pkg => (
              <div key={pkg._id} style={s.card} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ padding: '5px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#2563eb' }}>{tagLabel(pkg.tag)}</span>
                  {pkg.discountedPricePerEmployee && <span style={{ padding: '5px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, backgroundColor: '#ecfdf5', color: '#059669' }}>{Math.round((1 - pkg.discountedPricePerEmployee / pkg.pricePerEmployee) * 100)}% OFF</span>}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 8 }}>{pkg.packageName}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 16 }}>{pkg.description || 'Comprehensive corporate healthcare package.'}</p>
                <div style={{ padding: 14, backgroundColor: '#f8fafc', borderRadius: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb' }}>{fmt(pkg.discountedPricePerEmployee || pkg.pricePerEmployee)}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}> /employee</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div><span style={{ color: '#94a3b8' }}>Provider:</span> {pkg.providerName}</div>
                  {pkg.providerCity && <div><span style={{ color: '#94a3b8' }}>City:</span> {pkg.providerCity}</div>}
                  <div><span style={{ color: '#94a3b8' }}>Min:</span> {pkg.minEmployees || 10} employees</div>
                </div>
                <button onClick={() => navigate('/corporate/register')} style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>✉️ Enquire Now</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==================== ADVANTAGES ==================== */}
      <section style={s.section}>
        <h2 style={s.h2}>Why We're Different</h2>
        <p style={s.sub}>What sets us apart from traditional corporate healthcare platforms</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            { icon: '💰', title: 'Pay Per Use', desc: 'No premiums. No claims. Load wallet, pay only for actual usage. 30-40% cost savings.' },
            { icon: '🧘', title: 'Ayurveda + Homeopathy', desc: 'Only platform with corporate Panchakarma, Homeopathy & Naturopathy.' },
            { icon: '🧠', title: 'Mental Wellness Built-in', desc: 'EAP, therapy, stress management, PHQ-9/GAD-7 screening.' },
            { icon: '📊', title: 'Real-time Analytics', desc: 'Live dashboard — utilization, spend, wellness scores. Export in 1 click.' },
            { icon: '🔌', title: '8 Services, 1 Platform', desc: 'Hospitals, doctors, labs, mental health, ayurveda, homeopathy, home care, ambulance.' },
            { icon: '🚀', title: '5-Minute Setup', desc: 'Register, select services, upload employee list. Your team gets access instantly.' },
          ].map((item, i) => (
            <div key={i} style={{ ...s.card, padding: 28 }}>
              <div style={{ fontSize: '2.25rem', marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>{item.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section style={{ ...s.sectionGray, padding: '80px 24px' }}>
        <h2 style={s.h2}>Trusted by HR Leaders</h2>
        <p style={s.sub}>See why companies are switching to our platform</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {[
            { quote: 'Switching from traditional insurance saved us 35%. Our employees love the Ayurveda and mental wellness options.', name: 'Priya M.', role: 'HR Director, TechCorp', avatar: '👩‍💼' },
            { quote: 'The real-time dashboard gives us complete visibility into utilization and spend.', name: 'Rajesh K.', role: 'VP People, InnovateTech', avatar: '👨‍💼' },
            { quote: 'Setup was incredibly fast. Uploaded 200 employees via CSV and everything was live in minutes.', name: 'Anita S.', role: 'HR Manager, GrowthLab', avatar: '👩‍💻' },
          ].map((t, i) => (
            <div key={i} style={{ ...s.card, padding: 32 }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>{t.avatar}</div>
              <p style={{ fontSize: '1.05rem', fontStyle: 'italic', color: '#334155', lineHeight: 1.8, marginBottom: 20 }}>"{t.quote}"</p>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                <div style={{ fontWeight: 700 }}>{t.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 100%)', padding: '80px 24px', textAlign: 'center', color: '#fff' }}>
        <div style={{ maxWidth: 650, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, marginBottom: 12 }}>Ready to Transform Employee Healthcare?</h2>
          <p style={{ fontSize: '1.15rem', opacity: 0.85, marginBottom: 32 }}>Join companies saving 30-40% on employee healthcare. Setup in 5 minutes.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/corporate/register')} style={s.btnAccent}>🚀 Register Now — Free</button>
            <a href="mailto:corporate@healthcarehub.com?subject=Corporate%20Healthcare%20Demo" style={{ ...s.btnOutline, textDecoration: 'none' }}>📞 Request Demo</a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CorporateHub;