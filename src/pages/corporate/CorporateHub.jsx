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
  const [searchTerm, setSearchTerm] = useState('');
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
      const p = {}; if (tag !== 'all') p.tag = tag; if (city) p.city = city; if (minEmployees) p.minEmployees = minEmployees; if (searchTerm) p.search = searchTerm;
      const r = await axios.get(`${API_BASE}/api/corporate-hub/packages`, { params: p });
      if (r.data?.success) setPackages(r.data.data);
    } catch(e){} finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); fetchPackages(activeTag); };

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
    { q:'How does pay-per-use work?', a:'Load a wallet with budget. Employees use services. We deduct only for actual usage. No premiums. No waste.' },
    { q:'Can we add/remove employees anytime?', a:'Yes. Upload via CSV or add manually. Deactivate instantly. No contracts.' },
    { q:'What services are included?', a:'Hospitals, online doctors, lab tests, mental wellness, Ayurveda, Homeopathy, home care, ambulance.' },
    { q:'How much can we save vs insurance?', a:'30-40% on average. Use the calculator above for your custom estimate.' },
    { q:'Minimum employee count?', a:'Most packages start at 10. Custom plans for larger organizations.' },
    { q:'How do employees book?', a:'They get login credentials, browse approved services, and book directly from the app.' },
    { q:'Do you provide reports?', a:'Real-time dashboard + monthly PDF reports with utilization, spend, and wellness insights.' },
    { q:'Is data secure?', a:'ISO certified, encrypted storage. We never share employee health data with employers.' },
  ];

  const popularSearches = ['Health Checkup', 'Doctor Consult', 'Lab Tests', 'Mental Wellness', 'Ayurveda', 'OPD Subscription'];

  const S = {
    hero: { background:'linear-gradient(160deg,#0a0f1e 0%,#13203d 40%,#1a3a6b 100%)', padding:'80px 24px 64px', textAlign:'center', color:'#fff', position:'relative', overflow:'hidden' },
    section: { padding:'56px 24px', maxWidth:1200, margin:'0 auto' },
    gray: { padding:'56px 24px', backgroundColor:'#f8fafc' },
    h2: { fontSize:'1.75rem', fontWeight:800, textAlign:'center', color:'#0f172a', marginBottom:8 },
    sub: { fontSize:'1rem', color:'#64748b', textAlign:'center', maxWidth:560, margin:'0 auto 36px' },
    card: { background:'#fff', borderRadius:14, padding:24, border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', transition:'all .25s' },
    btnY: { padding:'14px 30px', background:'#f59e0b', color:'#0f172a', border:'none', borderRadius:10, fontWeight:700, fontSize:'0.95rem', cursor:'pointer', boxShadow:'0 4px 18px rgba(245,158,11,0.35)', display:'inline-flex', alignItems:'center', gap:8 },
    btnB: { padding:'14px 30px', background:'#2563eb', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:'0.95rem', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 },
    btnG: { padding:'14px 30px', background:'rgba(255,255,255,0.08)', border:'2px solid rgba(255,255,255,0.2)', borderRadius:10, color:'#fff', fontWeight:700, fontSize:'0.95rem', cursor:'pointer' },
    btnGr: { padding:'14px 30px', background:'#25D366', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:'0.95rem', textDecoration:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 },
    tag: (a) => ({ padding:'9px 16px', borderRadius:24, border:a?'2px solid #2563eb':'1px solid #e2e8f0', background:a?'#2563eb':'#fff', color:a?'#fff':'#475569', fontSize:'0.85rem', cursor:'pointer', fontWeight:a?700:400, whiteSpace:'nowrap', transition:'all .2s' }),
    inp: { padding:'11px 16px', border:'2px solid #e2e8f0', borderRadius:10, fontSize:'0.9rem', outline:'none', width:180 },
  };

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", color:'#1e293b', lineHeight:1.55 }}>

      {/* ===== HERO ===== */}
      <section style={S.hero}>
        <div style={{ position:'absolute', top:-80, right:-80, width:400, height:400, background:'radial-gradient(circle,rgba(37,99,235,0.2) 0%,transparent 70%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:-60, left:-60, width:300, height:300, background:'radial-gradient(circle,rgba(245,158,11,0.12) 0%,transparent 70%)', borderRadius:'50%' }} />
        <div style={{ maxWidth:800, margin:'0 auto', position:'relative', zIndex:1 }}>
          <span style={{ background:'rgba(245,158,11,0.12)', color:'#fbbf24', padding:'5px 18px', borderRadius:24, fontSize:'0.8rem', fontWeight:600, display:'inline-block', marginBottom:20 }}>🇮🇳 India's Most Comprehensive Corporate Healthcare Platform</span>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3rem)', fontWeight:900, lineHeight:1.1, marginBottom:16 }}>Corporate Healthcare That <span style={{ color:'#fbbf24' }}>Actually Saves Money</span></h1>
          <p style={{ fontSize:'1.1rem', opacity:0.85, maxWidth:600, margin:'0 auto 28px', lineHeight:1.6 }}>8 services. Pay-per-use. Zero waste. Starting at ₹499/employee/year.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => { setShowCalc(true); setTimeout(() => document.getElementById('calculator')?.scrollIntoView({ behavior:'smooth' }), 100); }} style={S.btnY}>💰 Calculate Your Savings</button>
            <button onClick={() => navigate('/corporate/register')} style={S.btnB}>🚀 Register Company</button>
            <button onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior:'smooth' })} style={S.btnG}>📋 Browse Packages</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, maxWidth:640, margin:'40px auto 0', padding:'20px 0 0', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
            {[{v:stats.totalProviders||0,l:'Providers'},{v:8,l:'Services'},{v:'30-40%',l:'Avg Savings'},{v:'5 min',l:'Setup'}].map((s,i)=>(<div key={i}><div style={{ fontSize:'1.8rem', fontWeight:800 }}>{s.v}</div><div style={{ fontSize:'0.8rem', opacity:0.7 }}>{s.l}</div></div>))}
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <div style={{ borderBottom:'1px solid #e2e8f0', padding:'14px 24px', background:'#fff', textAlign:'center', fontSize:'0.85rem', fontWeight:600, color:'#475569' }}>
        <span style={{ color:'#94a3b8', letterSpacing:0.5 }}>TRUSTED BY COMPANIES ACROSS INDIA</span>
        <span style={{ marginLeft:28 }}>🔒 ISO Certified</span>
        <span style={{ marginLeft:20 }}>✅ NABH Accredited</span>
        <span style={{ marginLeft:20 }}>🛡️ Data Secure</span>
        <span style={{ marginLeft:20 }}>🇮🇳 Pan India</span>
      </div>

      {/* ===== BENEFITS BAR ===== */}
      <div style={{ background:'#2563eb', padding:'16px 24px', color:'#fff', textAlign:'center', fontWeight:600, fontSize:'0.9rem' }}>
        ✅ No Medical Tests &nbsp;&nbsp;|&nbsp;&nbsp; ⚡ Instant Activation &nbsp;&nbsp;|&nbsp;&nbsp; 🇮🇳 Pan India &nbsp;&nbsp;|&nbsp;&nbsp; 🔄 Free Cancellation &nbsp;&nbsp;|&nbsp;&nbsp; 👨‍👩‍👧‍👦 Family Cover
      </div>

      {/* ===== SEARCH BAR ===== */}
      <section style={{ padding:'28px 24px', background:'#fff', borderBottom:'1px solid #e2e8f0' }}>
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <form onSubmit={handleSearch} style={{ display:'flex', gap:8, background:'#f8fafc', padding:6, borderRadius:14, border:'2px solid #e2e8f0' }}>
            <input placeholder="🔍 Search services, packages, providers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex:1, padding:'12px 16px', border:'none', background:'transparent', fontSize:'0.95rem', outline:'none' }} />
            <button type="submit" style={{ padding:'12px 24px', background:'#2563eb', color:'#fff', border:'none', borderRadius:10, fontWeight:700, cursor:'pointer' }}>Search</button>
          </form>
          <div style={{ display:'flex', gap:14, justifyContent:'center', marginTop:10, flexWrap:'wrap', fontSize:'0.85rem' }}>
            <span style={{ color:'#94a3b8' }}>Popular:</span>
            {popularSearches.map(s => <span key={s} onClick={() => { setSearchTerm(s); fetchPackages(activeTag); }} style={{ color:'#2563eb', cursor:'pointer', fontWeight:500 }}>{s}</span>)}
          </div>
        </div>
      </section>

      {/* ===== CALCULATOR ===== */}
      {showCalc && (
        <section id="calculator" style={{ padding:'48px 24px', background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
          <div style={{ maxWidth:780, margin:'0 auto' }}>
            <h2 style={{ ...S.h2, marginBottom:6 }}>💰 Savings Calculator</h2>
            <p style={S.sub}>See how much you save vs traditional group insurance</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:24 }}>
              <div><label style={{ display:'block', fontWeight:600, marginBottom:6, fontSize:'0.9rem' }}>👥 Employees: {calcEmployees}</label><input type="range" min="10" max="1000" value={calcEmployees} onChange={e => setCalcEmployees(+e.target.value)} style={{ width:'100%', accentColor:'#2563eb' }} /></div>
              <div><label style={{ display:'block', fontWeight:600, marginBottom:6, fontSize:'0.9rem' }}>📋 Services: {calcServices} of 8</label><input type="range" min="1" max="8" value={calcServices} onChange={e => setCalcServices(+e.target.value)} style={{ width:'100%', accentColor:'#2563eb' }} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, textAlign:'center' }}>
              <div style={{ ...S.card, borderTop:'4px solid #ef4444' }}><div style={{ fontWeight:700, color:'#ef4444' }}>Traditional Insurance</div><div style={{ fontSize:'1.6rem', fontWeight:800, color:'#ef4444', margin:'6px 0' }}>{fmt(traditionalCost)}</div><div style={{ fontSize:'0.75rem', color:'#64748b' }}>~₹15,000/employee/year</div></div>
              <div style={{ ...S.card, borderTop:'4px solid #10b981' }}><div style={{ fontWeight:700, color:'#10b981' }}>HealthCare Hub</div><div style={{ fontSize:'1.6rem', fontWeight:800, color:'#10b981', margin:'6px 0' }}>{fmt(ourCost)}</div><div style={{ fontSize:'0.75rem', color:'#64748b' }}>Pay only for what's used</div></div>
              <div style={{ ...S.card, borderTop:'4px solid #2563eb', background:'linear-gradient(135deg,#2563eb,#1d4ed8)', color:'#fff' }}><div style={{ fontWeight:700 }}>Your Savings</div><div style={{ fontSize:'1.8rem', fontWeight:800, margin:'6px 0' }}>{fmt(savings)}</div><div style={{ fontSize:'1.1rem', fontWeight:700 }}>{savingsPct}% less</div></div>
            </div>
          </div>
        </section>
      )}

      {/* ===== HOW IT WORKS ===== */}
      <section style={S.section}>
        <h2 style={S.h2}>How It Works</h2>
        <p style={S.sub}>Simple 5-step process to get your employees covered</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:20, textAlign:'center' }}>
          {[{i:'🔍',t:'1. Browse',d:'Explore packages'},{i:'✅',t:'2. Select',d:'Pick services'},{i:'💳',t:'3. Add Funds',d:'Load wallet'},{i:'👥',t:'4. Invite',d:'Upload CSV'},{i:'📊',t:'5. Track',d:'Pay per use'}].map((x,i)=>(<div key={i} style={{ padding:20, background:'#f8fafc', borderRadius:14 }}><div style={{ fontSize:'2rem', marginBottom:8 }}>{x.i}</div><h3 style={{ fontWeight:700, marginBottom:4, fontSize:'0.95rem' }}>{x.t}</h3><p style={{ color:'#64748b', fontSize:'0.85rem' }}>{x.d}</p></div>))}
        </div>
      </section>

      {/* ===== PACKAGES ===== */}
      <section id="packages" style={{ ...S.gray, borderTop:'1px solid #e2e8f0' }}>
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <h2 style={S.h2}>Corporate Healthcare Packages</h2>
          <p style={S.sub}>Compare packages across 8 service categories</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', marginBottom:20 }}>
            {tags.map(t => <button key={t} onClick={() => { setActiveTag(t); fetchPackages(t); }} style={S.tag(activeTag===t)}>{tagMeta[t].i} {tagMeta[t].l}</button>)}
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:28, flexWrap:'wrap' }}>
            <input placeholder="📍 City" value={city} onChange={e => setCity(e.target.value)} style={S.inp} />
            <input placeholder="👥 Min Employees" type="number" value={minEmployees} onChange={e => setMinEmployees(e.target.value)} style={{...S.inp, width:160}} />
            <button onClick={() => fetchPackages(activeTag)} style={S.btnB}>🔍 Filter</button>
          </div>
          {compareList.length > 0 && (
            <div style={{ background:'#fff', padding:14, borderRadius:10, marginBottom:20, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', border:'2px solid #2563eb', fontSize:'0.9rem' }}>
              <span style={{ fontWeight:700 }}>Comparing {compareList.length}/3:</span>
              {compareList.map(p => <span key={p._id} style={{ background:'#eff6ff', padding:'3px 10px', borderRadius:16, fontSize:'0.85rem' }}>{p.packageName} <span onClick={() => toggleCompare(p)} style={{ cursor:'pointer', marginLeft:4 }}>×</span></span>)}
            </div>
          )}
          {loading ? <div style={{ textAlign:'center', padding:48 }}>⏳ Loading...</div> : packages.length === 0 ? (
            <div style={{ textAlign:'center', padding:48, ...S.card }}>
              <div style={{ fontSize:'3rem', marginBottom:8 }}>📦</div>
              <h3 style={{ fontWeight:700, marginBottom:4 }}>No packages found</h3>
              <p style={{ color:'#64748b', fontSize:'0.9rem' }}><a href="mailto:corporate@healthcarehub.com" style={{ color:'#2563eb' }}>Contact us</a> for custom plans.</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:18 }}>
              {packages.map(pkg => (
                <div key={pkg._id} style={S.card} onMouseEnter={e => e.currentTarget.style.boxShadow='0 8px 30px rgba(0,0,0,0.08)'} onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ padding:'4px 12px', borderRadius:16, fontSize:'0.75rem', fontWeight:700, background:'#eff6ff', color:'#2563eb' }}>{tagLabel(pkg.tag)}</span>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => toggleCompare(pkg)} style={{ padding:'3px 8px', borderRadius:16, fontSize:'0.7rem', border:'1px solid #e2e8f0', background:compareList.find(x=>x._id===pkg._id)?'#2563eb':'#fff', color:compareList.find(x=>x._id===pkg._id)?'#fff':'#64748b', cursor:'pointer' }}>⇆</button>
                      {pkg.discountedPricePerEmployee && <span style={{ padding:'3px 8px', borderRadius:16, fontSize:'0.7rem', fontWeight:700, background:'#ecfdf5', color:'#059669' }}>{Math.round((1-pkg.discountedPricePerEmployee/pkg.pricePerEmployee)*100)}%</span>}
                    </div>
                  </div>
                  <h3 style={{ fontWeight:700, fontSize:'1.05rem', marginBottom:6 }}>{pkg.packageName}</h3>
                  <p style={{ color:'#64748b', fontSize:'0.85rem', marginBottom:14 }}>{pkg.description || 'Comprehensive corporate healthcare package.'}</p>
                  <div style={{ background:'#f8fafc', padding:12, borderRadius:8, marginBottom:14 }}>
                    <span style={{ fontSize:'1.5rem', fontWeight:800, color:'#2563eb' }}>{fmt(pkg.discountedPricePerEmployee||pkg.pricePerEmployee)}</span>
                    <span style={{ color:'#94a3b8', fontSize:'0.85rem' }}> /employee</span>
                  </div>
                  <div style={{ fontSize:'0.8rem', color:'#475569', marginBottom:14 }}>🏥 {pkg.providerName} {pkg.providerCity && `· ${pkg.providerCity}`} · 👥 Min {pkg.minEmployees||10}</div>
                  <button onClick={() => navigate('/corporate/register')} style={{ width:'100%', padding:11, background:'#2563eb', color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:'0.9rem' }}>Enquire Now</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== WHY DIFFERENT ===== */}
      <section style={S.section}>
        <h2 style={S.h2}>Why We're Different</h2>
        <p style={S.sub}>What sets us apart from traditional corporate healthcare platforms</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:18 }}>
          {[{i:'💰',t:'Pay Per Use',d:'No premiums. Load wallet, pay only for actual usage. 30-40% savings.'},{i:'🧘',t:'Ayurveda + Homeopathy',d:'Only platform with corporate Panchakarma, Homeopathy & Naturopathy.'},{i:'🧠',t:'Mental Wellness Built-in',d:'EAP, therapy, stress management, PHQ-9/GAD-7 screening.'},{i:'📊',t:'Real-time Analytics',d:'Live dashboard — utilization, spend, wellness scores.'},{i:'🔌',t:'8 Services, 1 Platform',d:'Hospitals, doctors, labs, mental health, ayurveda, homeopathy, home care, ambulance.'},{i:'🚀',t:'5-Minute Setup',d:'Register, select services, upload employee list. Instant access.'}].map((x,i)=>(<div key={i} style={{ padding:20, borderRadius:14, border:'1px solid #f1f5f9', background:'#fafbfc' }}><div style={{ fontSize:'1.8rem', marginBottom:8 }}>{x.i}</div><h3 style={{ fontWeight:700, marginBottom:4, fontSize:'1rem' }}>{x.t}</h3><p style={{ color:'#64748b', fontSize:'0.9rem', lineHeight:1.6 }}>{x.d}</p></div>))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section style={{ ...S.gray, borderTop:'1px solid #e2e8f0' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <h2 style={S.h2}>Trusted by HR Leaders</h2>
          <p style={S.sub}>See why companies are switching to our platform</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            {[{q:'Switching from insurance saved us 35% in the first year.',n:'Priya M.',r:'HR Director, TechCorp',a:'👩‍💼'},{q:'Real-time dashboard gives complete visibility into spend.',n:'Rajesh K.',r:'VP People, InnovateTech',a:'👨‍💼'},{q:'200 employees via CSV. Live in minutes.',n:'Anita S.',r:'HR Manager, GrowthLab',a:'👩‍💻'}].map((t,i)=>(<div key={i} style={{ ...S.card, padding:28 }}><div style={{ fontSize:'2.5rem', marginBottom:10 }}>{t.a}</div><p style={{ fontStyle:'italic', color:'#334155', lineHeight:1.7, marginBottom:16 }}>"{t.q}"</p><div style={{ borderTop:'1px solid #e2e8f0', paddingTop:14 }}><div style={{ fontWeight:700 }}>{t.n}</div><div style={{ color:'#64748b', fontSize:'0.8rem' }}>{t.r}</div></div></div>))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section style={S.section}>
        <h2 style={S.h2}>Frequently Asked Questions</h2>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          {faqs.map((f,i)=>(<div key={i} style={{ background:'#fff', borderRadius:10, marginBottom:6, border:'1px solid #e2e8f0' }}><button onClick={() => setFaqOpen(faqOpen===i?null:i)} style={{ width:'100%', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'none', border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.95rem', textAlign:'left' }}>{f.q}<span>{faqOpen===i?'▲':'▼'}</span></button>{faqOpen===i && <div style={{ padding:'0 20px 16px', color:'#475569', fontSize:'0.9rem', lineHeight:1.7 }}>{f.a}</div>}</div>))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section style={{ background:'linear-gradient(160deg,#0f172a 0%,#1e3a5f 100%)', padding:'60px 24px', textAlign:'center', color:'#fff' }}>
        <h2 style={{ fontSize:'1.75rem', fontWeight:800, marginBottom:8 }}>Ready to Save on Employee Healthcare?</h2>
        <p style={{ opacity:0.85, marginBottom:28, fontSize:'1rem' }}>Setup in 5 minutes. No commitment. Cancel anytime.</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('/corporate/register')} style={S.btnY}>🚀 Register Now — Free</button>
          <a href="https://wa.me/919876543210?text=Hi%20HealthCare%20Hub%20Corporate" target="_blank" rel="noreferrer" style={S.btnGr}>💬 WhatsApp Us</a>
          <a href="mailto:corporate@healthcarehub.com?subject=Demo%20Request" style={{ ...S.btnG, textDecoration:'none' }}>📞 Request Demo</a>
        </div>
      </section>

    </div>
  );
};

export default CorporateHub;