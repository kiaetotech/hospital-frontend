import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-f1b1.up.railway.app';

const CorporateHub = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProviders: 0 });
  const [activeTag, setActiveTag] = useState('all');
  const [city, setCity] = useState('');
  const [minEmployees, setMinEmployees] = useState('');
  const [compareList, setCompareList] = useState([]);
  const [calcEmployees, setCalcEmployees] = useState(100);
  const [calcServices, setCalcServices] = useState(4);
  const [faqOpen, setFaqOpen] = useState(null);
  const [showCalc, setShowCalc] = useState(false);

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

  const toggleCompare = (pkg) => setCompareList(prev => prev.find(x => x._id === pkg._id) ? prev.filter(x => x._id !== pkg._id) : prev.length < 3 ? [...prev, pkg] : prev);
  const fmt = (n) => n ? '₹' + n.toLocaleString('en-IN') : '₹0';
  const tagLabel = (t) => ({ hospitals:'Hospital', onlineDoctors:'Online Doctor', diagnostics:'Lab Tests', mentalHealth:'Mental Wellness', ayurveda:'Ayurveda', homeopathy:'Homeopathy', caregivers:'Home Care', ambulance:'Ambulance' }[t] || t);
  const traditionalCost = calcEmployees * 15000;
  const ourCost = calcEmployees * calcServices * 1800;
  const savings = traditionalCost - ourCost;
  const savingsPct = traditionalCost > 0 ? Math.round((savings / traditionalCost) * 100) : 0;

  const tags = ['all','hospitals','onlineDoctors','diagnostics','mentalHealth','ayurveda','homeopathy','caregivers','ambulance'];
  const tagMeta = { all:{l:'All',i:'🏢'}, hospitals:{l:'Hospitals',i:'🏥'}, onlineDoctors:{l:'Doctors',i:'📱'}, diagnostics:{l:'Labs',i:'🔬'}, mentalHealth:{l:'Mental',i:'🧠'}, ayurveda:{l:'Ayurveda',i:'🧘'}, homeopathy:{l:'Homeopathy',i:'🌿'}, caregivers:{l:'Home Care',i:'🏠'}, ambulance:{l:'Ambulance',i:'🚑'} };

  const faqs = [
    { q:'How does pay-per-use work?', a:'You load a wallet with budget. Employees use services. We deduct only for actual usage. No wasted premiums.' },
    { q:'Can we add/remove employees anytime?', a:'Yes. Upload via CSV or add manually. Deactivate employees instantly. No lock-in contracts.' },
    { q:'What services are included?', a:'Hospitals, online doctors, lab tests, mental wellness, Ayurveda, Homeopathy, home care, and ambulance.' },
    { q:'How much can we save vs insurance?', a:'Companies save 30-40% on average. Use our calculator above for a custom estimate.' },
    { q:'Is there a minimum employee count?', a:'Most packages start at 10 employees. Custom plans available for larger organizations.' },
    { q:'How do employees book services?', a:'They get login credentials, browse approved services, and book directly.' },
    { q:'Do you provide reports?', a:'Yes. Real-time dashboard + monthly PDF reports with utilization and spend insights.' },
    { q:'Is our data secure?', a:'ISO certified, encrypted storage. We never share employee health data.' },
  ];

  const S = {
    hero: { background:'linear-gradient(160deg,#0a0f1e 0%,#13203d 40%,#1a3a6b 100%)', padding:'100px 24px 80px', textAlign:'center', color:'#fff', position:'relative', overflow:'hidden' },
    section: { padding:'80px 24px', maxWidth:1200, margin:'0 auto' },
    sectionGray: { padding:'80px 24px', backgroundColor:'#f8fafc' },
    h2: { fontSize:'2rem', fontWeight:800, textAlign:'center', color:'#0f172a', marginBottom:12 },
    sub: { fontSize:'1.1rem', color:'#64748b', textAlign:'center', maxWidth:600, margin:'0 auto 48px' },
    card: { background:'#fff', borderRadius:16, padding:28, border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', transition:'all .3s' },
    btnYellow: { padding:'15px 34px', background:'#f59e0b', color:'#0f172a', border:'none', borderRadius:12, fontWeight:700, fontSize:'1rem', cursor:'pointer', boxShadow:'0 4px 20px rgba(245,158,11,0.4)', display:'inline-flex', alignItems:'center', gap:8 },
    btnBlue: { padding:'15px 34px', background:'#2563eb', color:'#fff', border:'none', borderRadius:12, fontWeight:700, fontSize:'1rem', cursor:'pointer' },
    btnGhost: { padding:'15px 34px', background:'rgba(255,255,255,0.08)', border:'2px solid rgba(255,255,255,0.25)', borderRadius:12, color:'#fff', fontWeight:700, fontSize:'1rem', cursor:'pointer' },
    btnGreen: { padding:'15px 34px', background:'#25D366', color:'#fff', border:'none', borderRadius:12, fontWeight:700, fontSize:'1rem', textDecoration:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 },
    tag: (active) => ({ padding:'10px 18px', borderRadius:30, border:active?'2px solid #2563eb':'1px solid #e2e8f0', background:active?'#2563eb':'#fff', color:active?'#fff':'#475569', fontSize:'0.9rem', cursor:'pointer', fontWeight:active?700:400, whiteSpace:'nowrap', transition:'all .2s' }),
    input: { padding:'12px 18px', border:'2px solid #e2e8f0', borderRadius:12, fontSize:'0.95rem', outline:'none', width:200 },
  };

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", color:'#1e293b', lineHeight:1.6 }}>

      {/* ==================== HERO ==================== */}
      <section style={S.hero}>
        <div style={{ position:'absolute', top:-100, right:-100, width:500, height:500, background:'radial-gradient(circle,rgba(37,99,235,0.25) 0%,transparent 70%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:-80, left:-80, width:400, height:400, background:'radial-gradient(circle,rgba(245,158,11,0.15) 0%,transparent 70%)', borderRadius:'50%' }} />
        <div style={{ maxWidth:850, margin:'0 auto', position:'relative', zIndex:1 }}>
          <span style={{ background:'rgba(245,158,11,0.15)', color:'#fbbf24', padding:'6px 20px', borderRadius:30, fontSize:'0.85rem', fontWeight:600, display:'inline-block', marginBottom:24 }}>🇮🇳 India's Most Comprehensive Corporate Healthcare Platform</span>
          <h1 style={{ fontSize:'clamp(2.2rem,5vw,3.5rem)', fontWeight:900, lineHeight:1.15, marginBottom:20 }}>Corporate Healthcare That <span style={{ color:'#fbbf24' }}>Actually Saves Money</span></h1>
          <p style={{ fontSize:'1.2rem', opacity:0.85, maxWidth:650, margin:'0 auto 36px', lineHeight:1.7 }}>8 services. Pay-per-use. Zero waste. Starting at ₹499/employee/year. See your savings in 10 seconds.</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => { setShowCalc(true); setTimeout(() => document.getElementById('calculator')?.scrollIntoView({ behavior:'smooth' }), 100); }} style={S.btnYellow}>💰 Calculate Your Savings</button>
            <button onClick={() => navigate('/corporate/register')} style={S.btnBlue}>🚀 Register Company</button>
            <button onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior:'smooth' })} style={S.btnGhost}>📋 Browse Packages</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, maxWidth:700, margin:'48px auto 0', padding:'24px 0', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
            {[{v:stats.totalProviders||0,l:'Providers'},{v:8,l:'Services'},{v:'30-40%',l:'Avg Savings'},{v:'5 min',l:'Setup'}].map((s,i)=>(<div key={i}><div style={{ fontSize:'2rem', fontWeight:800 }}>{s.v}</div><div style={{ fontSize:'0.85rem', opacity:0.7 }}>{s.l}</div></div>))}
          </div>
        </div>
      </section>

      {/* ==================== TRUST BAR ==================== */}
      <div style={{ borderBottom:'1px solid #e2e8f0', padding:'16px 24px', background:'#fff', textAlign:'center' }}>
        <span style={{ color:'#94a3b8', fontWeight:600, fontSize:'0.85rem', letterSpacing:1 }}>TRUSTED BY COMPANIES ACROSS INDIA</span>
        <span style={{ marginLeft:32, fontWeight:600, fontSize:'0.9rem' }}>🔒 ISO Certified</span>
        <span style={{ marginLeft:24, fontWeight:600, fontSize:'0.9rem' }}>✅ NABH Accredited</span>
        <span style={{ marginLeft:24, fontWeight:600, fontSize:'0.9rem' }}>🛡️ Data Secure</span>
        <span style={{ marginLeft:24, fontWeight:600, fontSize:'0.9rem' }}>🇮🇳 Pan India</span>
      </div>

      {/* ==================== BENEFITS BAR ==================== */}
      <div style={{ background:'#2563eb', padding:'20px 24px', color:'#fff' }}>
        <div style={{ maxWidth:1000, margin:'0 auto', display:'flex', justifyContent:'center', gap:'clamp(1rem,5vw,4rem)', flexWrap:'wrap', textAlign:'center', fontWeight:600, fontSize:'0.95rem' }}>
          <span>✅ No Medical Tests</span><span>⚡ Instant Activation</span><span>🇮🇳 Pan India Coverage</span><span>🔄 Free Cancellation</span><span>👨‍👩‍👧‍👦 Family Cover</span>
        </div>
      </div>

      {/* ==================== CALCULATOR ==================== */}
      {showCalc && (
        <section id="calculator" style={{ padding:'60px 24px', background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
          <div style={{ maxWidth:800, margin:'0 auto' }}>
            <h2 style={{ ...S.h2, marginBottom:8 }}>💰 Savings Calculator</h2>
            <p style={S.sub}>See how much you save vs traditional group insurance</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:20, marginBottom:28 }}>
              <div><label style={{ display:'block', fontWeight:600, marginBottom:8 }}>👥 Employees: {calcEmployees}</label><input type="range" min="10" max="1000" value={calcEmployees} onChange={e => setCalcEmployees(+e.target.value)} style={{ width:'100%', accentColor:'#2563eb' }} /></div>
              <div><label style={{ display:'block', fontWeight:600, marginBottom:8 }}>📋 Services: {calcServices} of 8</label><input type="range" min="1" max="8" value={calcServices} onChange={e => setCalcServices(+e.target.value)} style={{ width:'100%', accentColor:'#2563eb' }} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, textAlign:'center' }}>
              <div style={{ ...S.card, borderTop:'4px solid #ef4444' }}><div style={{ fontWeight:700, color:'#ef4444' }}>Traditional Insurance</div><div style={{ fontSize:'1.8rem', fontWeight:800, color:'#ef4444', margin:'8px 0' }}>{fmt(traditionalCost)}</div><div style={{ fontSize:'0.8rem', color:'#64748b' }}>~₹15,000/employee/year</div></div>
              <div style={{ ...S.card, borderTop:'4px solid #10b981' }}><div style={{ fontWeight:700, color:'#10b981' }}>HealthCare Hub</div><div style={{ fontSize:'1.8rem', fontWeight:800, color:'#10b981', margin:'8px 0' }}>{fmt(ourCost)}</div><div style={{ fontSize:'0.8rem', color:'#64748b' }}>Pay only for what's used</div></div>
              <div style={{ ...S.card, borderTop:'4px solid #2563eb', background:'linear-gradient(135deg,#2563eb,#1d4ed8)', color:'#fff' }}><div style={{ fontWeight:700 }}>Your Savings</div><div style={{ fontSize:'2rem', fontWeight:800, margin:'8px 0' }}>{fmt(savings)}</div><div style={{ fontSize:'1.2rem', fontWeight:700 }}>{savingsPct}% less</div></div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== HOW IT WORKS ==================== */}
      <section style={S.section}>
        <h2 style={S.h2}>How It Works</h2>
        <p style={S.sub}>Simple 5-step process to get your employees covered</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:24, textAlign:'center' }}>
          {[{i:'🔍',t:'1. Browse',d:'Explore packages from 8 service categories'},{i:'✅',t:'2. Select',d:'Pick services your employees need'},{i:'💳',t:'3. Add Funds',d:'Load your company wallet'},{i:'👥',t:'4. Invite',d:'Upload CSV — employees get access'},{i:'📊',t:'5. Track',d:'Real-time dashboard. Pay per use'}].map((x,i)=>(<div key={i} style={{ padding:28, background:'#f8fafc', borderRadius:16 }}><div style={{ fontSize:'2.5rem', marginBottom:12 }}>{x.i}</div><h3 style={{ fontWeight:700, marginBottom:6 }}>{x.t}</h3><p style={{ color:'#64748b', fontSize:'0.9rem' }}>{x.d}</p></div>))}
        </div>
      </section>

      {/* ==================== PACKAGES ==================== */}
      <section id="packages" style={{ ...S.sectionGray, borderTop:'1px solid #e2e8f0' }}>
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <h2 style={S.h2}>Corporate Healthcare Packages</h2>
          <p style={S.sub}>Compare packages across 8 service categories</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginBottom:24 }}>
            {tags.map(t => <button key={t} onClick={() => { setActiveTag(t); fetchPackages(t); }} style={S.tag(activeTag===t)}>{tagMeta[t].i} {tagMeta[t].l}</button>)}
          </div>
          <div style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:32, flexWrap:'wrap' }}>
            <input placeholder="📍 City" value={city} onChange={e => setCity(e.target.value)} style={S.input} />
            <input placeholder="👥 Min Employees" type="number" value={minEmployees} onChange={e => setMinEmployees(e.target.value)} style={{...S.input, width:170}} />
            <button onClick={() => fetchPackages(activeTag)} style={S.btnBlue}>🔍 Search</button>
          </div>
          {compareList.length > 0 && (
            <div style={{ background:'#fff', padding:16, borderRadius:12, marginBottom:24, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', border:'2px solid #2563eb' }}>
              <span style={{ fontWeight:700 }}>Comparing {compareList.length}/3:</span>
              {compareList.map(p => <span key={p._id} style={{ background:'#eff6ff', padding:'4px 12px', borderRadius:20, fontSize:'0.85rem' }}>{p.packageName} <span onClick={() => toggleCompare(p)} style={{ cursor:'pointer', marginLeft:6 }}>×</span></span>)}
            </div>
          )}
          {loading ? <div style={{ textAlign:'center', padding:60 }}>⏳ Loading...</div> : packages.length === 0 ? (
            <div style={{ textAlign:'center', padding:60, ...S.card }}>
              <div style={{ fontSize:'4rem', marginBottom:12 }}>📦</div>
              <h3 style={{ fontWeight:700 }}>No packages found</h3>
              <p style={{ color:'#64748b' }}>Providers haven't listed packages yet. <a href="mailto:corporate@healthcarehub.com" style={{ color:'#2563eb' }}>Contact us</a> for custom plans.</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:20 }}>
              {packages.map(pkg => (
                <div key={pkg._id} style={S.card} onMouseEnter={e => e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.1)'} onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                    <span style={{ padding:'5px 14px', borderRadius:20, fontSize:'0.8rem', fontWeight:700, background:'#eff6ff', color:'#2563eb' }}>{tagLabel(pkg.tag)}</span>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => toggleCompare(pkg)} style={{ padding:'4px 10px', borderRadius:20, fontSize:'0.75rem', border:'1px solid #e2e8f0', background:compareList.find(x=>x._id===pkg._id)?'#2563eb':'#fff', color:compareList.find(x=>x._id===pkg._id)?'#fff':'#64748b', cursor:'pointer' }}>⇆ Compare</button>
                      {pkg.discountedPricePerEmployee && <span style={{ padding:'4px 10px', borderRadius:20, fontSize:'0.75rem', fontWeight:700, background:'#ecfdf5', color:'#059669' }}>{Math.round((1-pkg.discountedPricePerEmployee/pkg.pricePerEmployee)*100)}% OFF</span>}
                    </div>
                  </div>
                  <h3 style={{ fontWeight:700, fontSize:'1.15rem', marginBottom:8 }}>{pkg.packageName}</h3>
                  <p style={{ color:'#64748b', fontSize:'0.9rem', marginBottom:16 }}>{pkg.description || 'Comprehensive corporate healthcare package.'}</p>
                  <div style={{ background:'#f8fafc', padding:14, borderRadius:10, marginBottom:16 }}>
                    <span style={{ fontSize:'1.8rem', fontWeight:800, color:'#2563eb' }}>{fmt(pkg.discountedPricePerEmployee||pkg.pricePerEmployee)}</span>
                    <span style={{ color:'#94a3b8' }}> /employee</span>
                  </div>
                  <div style={{ fontSize:'0.85rem', color:'#475569', marginBottom:16 }}>
                    <div>🏥 {pkg.providerName} {pkg.providerCity && `· ${pkg.providerCity}`}</div>
                    <div>👥 Min {pkg.minEmployees || 10} employees</div>
                  </div>
                  <button onClick={() => navigate('/corporate/register')} style={{ width:'100%', padding:12, background:'#2563eb', color:'#fff', border:'none', borderRadius:10, fontWeight:700, cursor:'pointer' }}>Enquire Now</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== WHY DIFFERENT ==================== */}
      <section style={S.section}>
        <h2 style={S.h2}>Why We're Different</h2>
        <p style={S.sub}>What sets us apart from traditional corporate healthcare platforms</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20 }}>
          {[{i:'💰',t:'Pay Per Use',d:'No premiums. No claims. Load wallet, pay only for actual usage. 30-40% cost savings.'},{i:'🧘',t:'Ayurveda + Homeopathy',d:'Only platform with corporate Panchakarma, Homeopathy & Naturopathy.'},{i:'🧠',t:'Mental Wellness Built-in',d:'EAP, therapy, stress management, PHQ-9/GAD-7 screening.'},{i:'📊',t:'Real-time Analytics',d:'Live dashboard — utilization, spend, wellness scores.'},{i:'🔌',t:'8 Services, 1 Platform',d:'Hospitals, doctors, labs, mental health, ayurveda, homeopathy, home care, ambulance.'},{i:'🚀',t:'5-Minute Setup',d:'Register, select services, upload employee list. Instant access.'}].map((x,i)=>(<div key={i} style={{ padding:24, borderRadius:16, border:'1px solid #f1f5f9', background:'#fafbfc' }}><div style={{ fontSize:'2.25rem', marginBottom:10 }}>{x.i}</div><h3 style={{ fontWeight:700, marginBottom:6 }}>{x.t}</h3><p style={{ color:'#64748b', fontSize:'0.95rem', lineHeight:1.7 }}>{x.d}</p></div>))}
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section style={{ ...S.sectionGray, borderTop:'1px solid #e2e8f0' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <h2 style={S.h2}>Trusted by HR Leaders</h2>
          <p style={S.sub}>See why companies are switching to our platform</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:24 }}>
            {[{q:'Switching from traditional insurance saved us 35% in the first year.',n:'Priya M.',r:'HR Director, TechCorp',a:'👩‍💼'},{q:'The real-time dashboard gives us complete visibility into utilization and spend.',n:'Rajesh K.',r:'VP People, InnovateTech',a:'👨‍💼'},{q:'Setup was incredibly fast. 200 employees via CSV, live in minutes.',n:'Anita S.',r:'HR Manager, GrowthLab',a:'👩‍💻'}].map((t,i)=>(<div key={i} style={{ ...S.card, padding:32 }}><div style={{ fontSize:'3rem', marginBottom:12 }}>{t.a}</div><p style={{ fontSize:'1.05rem', fontStyle:'italic', color:'#334155', lineHeight:1.8, marginBottom:20 }}>"{t.q}"</p><div style={{ borderTop:'1px solid #e2e8f0', paddingTop:16 }}><div style={{ fontWeight:700 }}>{t.n}</div><div style={{ color:'#64748b', fontSize:'0.85rem' }}>{t.r}</div></div></div>))}
          </div>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section style={S.section}>
        <h2 style={S.h2}>Frequently Asked Questions</h2>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          {faqs.map((f,i)=>(<div key={i} style={{ background:'#fff', borderRadius:12, marginBottom:8, border:'1px solid #e2e8f0' }}><button onClick={() => setFaqOpen(faqOpen===i?null:i)} style={{ width:'100%', padding:'18px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'none', border:'none', cursor:'pointer', fontWeight:600, fontSize:'1rem', textAlign:'left' }}>{f.q}<span>{faqOpen===i?'▲':'▼'}</span></button>{faqOpen===i && <div style={{ padding:'0 24px 18px', color:'#475569', lineHeight:1.7 }}>{f.a}</div>}</div>))}
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section style={{ background:'linear-gradient(160deg,#0f172a 0%,#1e3a5f 100%)', padding:'80px 24px', textAlign:'center', color:'#fff' }}>
        <h2 style={{ fontSize:'2rem', fontWeight:800, marginBottom:12 }}>Ready to Save on Employee Healthcare?</h2>
        <p style={{ opacity:0.85, marginBottom:32, fontSize:'1.1rem' }}>Setup in 5 minutes. No commitment. Cancel anytime.</p>
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('/corporate/register')} style={S.btnYellow}>🚀 Register Now — Free</button>
          <a href="https://wa.me/919876543210?text=Hi%20HealthCare%20Hub%20Corporate" target="_blank" rel="noreferrer" style={S.btnGreen}>💬 WhatsApp Us</a>
          <a href="mailto:corporate@healthcarehub.com?subject=Demo%20Request" style={{ ...S.btnGhost, textDecoration:'none' }}>📞 Request Demo</a>
        </div>
      </section>

    </div>
  );
};

export default CorporateHub;