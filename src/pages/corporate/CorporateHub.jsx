import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-f1b1.up.railway.app';

const CorporateHub = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [stats, setStats] = useState({ totalProviders: 0, breakdown: {} });
  const [activeTag, setActiveTag] = useState('all');
  const [city, setCity] = useState('');
  const [minEmployees, setMinEmployees] = useState('');
  const [compareList, setCompareList] = useState([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcInputs, setCalcInputs] = useState({ employees: 100, avgAge: 35, services: 4 });
  const [faqOpen, setFaqOpen] = useState(null);

  useEffect(() => { fetchStats(); fetchPackages(); }, []);

  const fetchStats = async () => {
    try { const r = await axios.get(`${API_BASE}/api/corporate-hub/stats`); if (r.data?.success) setStats(r.data.data); } catch(e){}
  };

  const fetchPackages = async (tag = 'all') => {
    setLoading(true);
    try {
      const p = {}; if (tag !== 'all') p.tag = tag; if (city) p.city = city; if (minEmployees) p.minEmployees = minEmployees;
      const r = await axios.get(`${API_BASE}/api/corporate-hub/packages`, { params: p });
      if (r.data?.success) setPackages(r.data.data);
    } catch(e){} finally { setLoading(false); }
  };

  const toggleCompare = (pkg) => {
    setCompareList(prev => prev.find(x => x._id === pkg._id) ? prev.filter(x => x._id !== pkg._id) : prev.length < 3 ? [...prev, pkg] : prev);
  };

  const fmt = (n) => n ? '₹' + n.toLocaleString('en-IN') : '₹0';
  const tagLabel = (t) => ({ hospitals:'Hospital', onlineDoctors:'Online Doctor', diagnostics:'Lab Tests', mentalHealth:'Mental Wellness', ayurveda:'Ayurveda', homeopathy:'Homeopathy', caregivers:'Home Care', ambulance:'Ambulance' }[t] || t);

  const tags = [
    { key: 'all', label: 'All', icon: '🏢' }, { key: 'hospitals', label: 'Hospitals', icon: '🏥' },
    { key: 'onlineDoctors', label: 'Doctors', icon: '📱' }, { key: 'diagnostics', label: 'Labs', icon: '🔬' },
    { key: 'mentalHealth', label: 'Mental', icon: '🧠' }, { key: 'ayurveda', label: 'Ayurveda', icon: '🧘' },
    { key: 'homeopathy', label: 'Homeopathy', icon: '🌿' }, { key: 'caregivers', label: 'Home Care', icon: '🏠' },
    { key: 'ambulance', label: 'Ambulance', icon: '🚑' },
  ];

  const faqs = [
    { q: 'How does pay-per-use work?', a: 'You load a wallet with budget. Employees use services. We deduct only for actual usage. No wasted premiums.' },
    { q: 'Can we add/remove employees anytime?', a: 'Yes. Upload via CSV or add manually. Deactivate employees instantly. No lock-in contracts.' },
    { q: 'What services are included?', a: 'Hospitals, online doctors, lab tests, mental wellness, Ayurveda, Homeopathy, home care, and ambulance.' },
    { q: 'How much can we save vs insurance?', a: 'Companies save 30-40% on average. Use our calculator above for a custom estimate.' },
    { q: 'Is there a minimum employee count?', a: 'Most packages start at 10 employees. Custom plans available for larger organizations.' },
    { q: 'How do employees book services?', a: 'They get login credentials, browse approved services, and book directly — just like any app.' },
    { q: 'Do you provide reports?', a: 'Yes. Real-time dashboard + monthly PDF reports with utilization, spend, and wellness insights.' },
    { q: 'Is our data secure?', a: 'Yes. ISO certified, HIPAA-compliant storage, encrypted data. We never share employee health data.' },
  ];

  /* Calculator logic */
  const traditionalCost = calcInputs.employees * 15000;
  const ourCost = calcInputs.employees * calcInputs.services * 1800;
  const savings = traditionalCost - ourCost;
  const savingsPercent = Math.round((savings / traditionalCost) * 100);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b' }}>

      {/* ===== HERO ===== */}
      <section style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #13203d 50%, #1a3a6b 100%)', padding: '6rem 2rem', textAlign: 'center', color: '#fff', position: 'relative' }}>
        <div style={{ maxWidth: 850, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', padding: '6px 16px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600, display: 'inline-block', marginBottom: 20 }}>🇮🇳 India's Most Comprehensive Corporate Healthcare Platform</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
            Corporate Healthcare That <span style={{ color: '#fbbf24' }}>Actually Saves Money</span>
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.85, maxWidth: 650, margin: '0 auto 32px', lineHeight: 1.7 }}>
            8 services. Pay-per-use. Zero waste. See exactly how much you'll save with our calculator.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => { setShowCalculator(true); setTimeout(() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' }), 100); }} style={{ padding: '14px 32px', background: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}>💰 Calculate Your Savings</button>
            <button onClick={() => navigate('/corporate/register')} style={{ padding: '14px 32px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>🚀 Register Company</button>
            <button onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })} style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>📋 Browse Packages</button>
          </div>
        </div>
      </section>

      {/* ===== SAVINGS CALCULATOR ===== */}
      {showCalculator && (
        <section id="calculator" style={{ padding: '3rem 2rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>💰 Savings Calculator</h2>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 32 }}>See how much you save vs traditional group insurance</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div><label style={lbl}>Number of Employees</label><input type="range" min="10" max="1000" value={calcInputs.employees} onChange={e => setCalcInputs({...calcInputs, employees: +e.target.value})} style={{ width: '100%' }} /><div style={{ textAlign: 'center', fontWeight: 700 }}>{calcInputs.employees}</div></div>
              <div><label style={lbl}>Services Needed</label><input type="range" min="1" max="8" value={calcInputs.services} onChange={e => setCalcInputs({...calcInputs, services: +e.target.value})} style={{ width: '100%' }} /><div style={{ textAlign: 'center', fontWeight: 700 }}>{calcInputs.services} of 8</div></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, textAlign: 'center' }}>
              <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}><div style={{ color: '#ef4444', fontWeight: 700 }}>Traditional Insurance</div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>{fmt(traditionalCost)}</div><div style={{ fontSize: '0.8rem', color: '#64748b' }}>~₹15,000/employee/year</div></div>
              <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}><div style={{ color: '#10b981', fontWeight: 700 }}>HealthCare Hub</div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{fmt(ourCost)}</div><div style={{ fontSize: '0.8rem', color: '#64748b' }}>Pay only for what's used</div></div>
              <div style={{ background: '#2563eb', padding: 20, borderRadius: 12, color: '#fff' }}><div style={{ fontWeight: 700 }}>Your Savings</div><div style={{ fontSize: '2rem', fontWeight: 800 }}>{fmt(savings)}</div><div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{savingsPercent}% less</div></div>
            </div>
          </div>
        </section>
      )}

      {/* ===== STATS ===== */}
      <section style={{ padding: '3rem 2rem', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, textAlign: 'center' }}>
          {[{ v: stats.totalProviders || 0, l: 'Providers' },{ v: 8, l: 'Services' },{ v: '30-40%', l: 'Avg Savings' },{ v: '5 min', l: 'Setup Time' }].map((s,i) => (
            <div key={i}><div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb' }}>{s.v}</div><div style={{ color: '#64748b', fontSize: '0.9rem' }}>{s.l}</div></div>
          ))}
        </div>
      </section>

      {/* ===== PACKAGES ===== */}
      <section id="packages" style={{ padding: '4rem 2rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>Corporate Healthcare Packages</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 32 }}>Compare packages across 8 service categories</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
            {tags.map(t => <button key={t.key} onClick={() => { setActiveTag(t.key); fetchPackages(t.key); }} style={{ padding: '8px 16px', borderRadius: 20, border: activeTag===t.key ? '2px solid #2563eb' : '1px solid #e2e8f0', background: activeTag===t.key ? '#2563eb' : '#fff', color: activeTag===t.key ? '#fff' : '#475569', fontSize: '0.85rem', cursor: 'pointer', fontWeight: activeTag===t.key ? 700 : 400, whiteSpace: 'nowrap' }}>{t.icon} {t.label}</button>)}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
            <input placeholder="📍 City" value={city} onChange={e => setCity(e.target.value)} style={inp} />
            <input placeholder="👥 Min Employees" type="number" value={minEmployees} onChange={e => setMinEmployees(e.target.value)} style={{...inp, width:160}} />
            <button onClick={() => fetchPackages(activeTag)} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>🔍 Search</button>
          </div>

          {/* Compare bar */}
          {compareList.length > 0 && (
            <div style={{ background: '#fff', padding: 16, borderRadius: 12, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', border: '2px solid #2563eb' }}>
              <span style={{ fontWeight: 700 }}>Comparing {compareList.length}/3:</span>
              {compareList.map(p => <span key={p._id} style={{ background: '#eff6ff', padding: '4px 12px', borderRadius: 20, fontSize: '0.85rem' }}>{p.packageName} <span onClick={() => toggleCompare(p)} style={{ cursor: 'pointer', marginLeft: 6 }}>×</span></span>)}
              {compareList.length >= 2 && <button onClick={() => document.getElementById('comparison-table')?.scrollIntoView({ behavior: 'smooth' })} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>View Comparison</button>}
            </div>
          )}

          {/* Comparison Table */}
          {compareList.length >= 2 && (
            <div id="comparison-table" style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 32, overflowX: 'auto' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📊 Package Comparison</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '2px solid #e2e8f0' }}><th style={th}>Feature</th>{compareList.map(p => <th key={p._id} style={th}>{p.packageName}</th>)}</tr></thead>
                <tbody>
                  {['Price/Employee','Provider','City','Min Employees','Services'].map((row,i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={td}>{row}</td>
                      {compareList.map(p => <td key={p._id} style={td}>{row==='Price/Employee'?fmt(p.discountedPricePerEmployee||p.pricePerEmployee):row==='Provider'?p.providerName:row==='City'?p.providerCity||'-':row==='Min Employees'?p.minEmployees||10:row==='Services'?(p.servicesIncluded||[]).slice(0,3).join(', '):''}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Package Cards */}
          {loading ? <div style={{ textAlign: 'center', padding: 60 }}>⏳ Loading...</div> : packages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16 }}>📦 No packages found. <a href="mailto:corporate@healthcarehub.com" style={{ color: '#2563eb' }}>Contact us</a> for custom plans.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {packages.map(pkg => (
                <div key={pkg._id} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #f1f5f9', position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, background: '#eff6ff', color: '#2563eb' }}>{tagLabel(pkg.tag)}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => toggleCompare(pkg)} style={{ padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', border: '1px solid #e2e8f0', background: compareList.find(x=>x._id===pkg._id)?'#2563eb':'#fff', color: compareList.find(x=>x._id===pkg._id)?'#fff':'#64748b', cursor: 'pointer' }}>⇆ Compare</button>
                      {pkg.discountedPricePerEmployee && <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: '#ecfdf5', color: '#059669' }}>{Math.round((1-pkg.discountedPricePerEmployee/pkg.pricePerEmployee)*100)}% OFF</span>}
                    </div>
                  </div>
                  <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{pkg.packageName}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 16 }}>{pkg.description || 'Comprehensive corporate healthcare package.'}</p>
                  <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, marginBottom: 16 }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb' }}>{fmt(pkg.discountedPricePerEmployee||pkg.pricePerEmployee)}</span>
                    <span style={{ color: '#94a3b8' }}> /employee</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: 16 }}>
                    <div>🏥 {pkg.providerName} {pkg.providerCity && `· ${pkg.providerCity}`}</div>
                    <div>👥 Min {pkg.minEmployees || 10} employees</div>
                  </div>
                  <button onClick={() => navigate('/corporate/register')} style={{ width: '100%', padding: 12, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Enquire Now</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== ADVANTAGES ===== */}
      <section style={{ padding: '4rem 2rem', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>Why We're Different</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 40 }}>What sets us apart from traditional corporate healthcare platforms</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              { i:'💰', t:'Pay Per Use', d:'No premiums. No claims. Load wallet, pay only for actual usage. 30-40% cost savings vs traditional insurance.' },
              { i:'🧘', t:'Ayurveda + Homeopathy', d:'Only platform offering corporate Panchakarma, Homeopathy & Naturopathy — not just allopathy.' },
              { i:'🧠', t:'Mental Wellness Built-in', d:'EAP, therapy sessions, stress management, PHQ-9/GAD-7 screening — all in one platform.' },
              { i:'📊', t:'Real-time Analytics', d:'Live dashboard shows utilization, spend per department, wellness scores.' },
              { i:'🔌', t:'8 Services, 1 Platform', d:'Hospitals, doctors, labs, mental health, ayurveda, homeopathy, home care, ambulance.' },
              { i:'🚀', t:'5-Minute Setup', d:'Register, select services, upload employee list. Your team gets access instantly.' },
            ].map((x,i) => (
              <div key={i} style={{ padding: 24, borderRadius: 16, border: '1px solid #f1f5f9', background: '#fafbfc' }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>{x.i}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 6 }}>{x.t}</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.7 }}>{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section style={{ padding: '4rem 2rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: 32 }}>Frequently Asked Questions</h2>
          {faqs.map((f, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, marginBottom: 8, border: '1px solid #e2e8f0' }}>
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', textAlign: 'left' }}>
                {f.q}<span>{faqOpen === i ? '▲' : '▼'}</span>
              </button>
              {faqOpen === i && <div style={{ padding: '0 20px 16px', color: '#475569', fontSize: '0.95rem', lineHeight: 1.7 }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', padding: '4rem 2rem', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>Ready to Save on Employee Healthcare?</h2>
        <p style={{ opacity: 0.85, marginBottom: 28 }}>Setup in 5 minutes. No commitment. Cancel anytime.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/corporate/register')} style={{ padding: '14px 36px', background: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer' }}>🚀 Register Now — Free</button>
          <a href="https://wa.me/919876543210?text=Hi%20HealthCare%20Hub%20Corporate" target="_blank" rel="noreferrer" style={{ padding: '14px 36px', background: '#25D366', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none', cursor: 'pointer' }}>💬 WhatsApp Us</a>
          <a href="mailto:corporate@healthcarehub.com?subject=Demo%20Request" style={{ padding: '14px 36px', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none' }}>📞 Request Demo</a>
        </div>
      </section>

    </div>
  );
};

const th = { padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: '0.9rem' };
const td = { padding: '10px 16px', fontSize: '0.9rem' };
const lbl = { display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' };
const inp = { padding: '10px 16px', border: '2px solid #e2e8f0', borderRadius: 10, fontSize: '0.95rem', outline: 'none', width: 180 };

export default CorporateHub;