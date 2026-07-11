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

  const handleSearch = (e) => { e.preventDefault(); document.getElementById('packages')?.scrollIntoView({ behavior:'smooth' }); fetchPackages(activeTag); };
  const toggleCompare = (p) => setCompareList(prev => prev.find(x=>x._id===p._id) ? prev.filter(x=>x._id!==p._id) : prev.length<3 ? [...prev,p] : prev);
  const fmt = (n) => n ? '₹'+n.toLocaleString('en-IN') : '₹0';
  const tagLabel = (t) => ({ hospitals:'Hospital', onlineDoctors:'Online Doctor', diagnostics:'Lab Tests', mentalHealth:'Mental Wellness', ayurveda:'Ayurveda', homeopathy:'Homeopathy', caregivers:'Home Care', ambulance:'Ambulance' }[t]||t);
  const traditionalCost = calcEmployees * 15000;
  const ourCost = calcEmployees * calcServices * 1800;
  const savings = traditionalCost - ourCost;
  const savingsPct = traditionalCost>0 ? Math.round((savings/traditionalCost)*100) : 0;

  const tags = ['all','hospitals','onlineDoctors','diagnostics','mentalHealth','ayurveda','homeopathy','caregivers','ambulance'];
  const tagMeta = { all:{l:'All',i:'🏢'}, hospitals:{l:'Hospitals',i:'🏥'}, onlineDoctors:{l:'Doctors',i:'📱'}, diagnostics:{l:'Labs',i:'🔬'}, mentalHealth:{l:'Mental',i:'🧠'}, ayurveda:{l:'Ayurveda',i:'🧘'}, homeopathy:{l:'Homeopathy',i:'🌿'}, caregivers:{l:'Home Care',i:'🏠'}, ambulance:{l:'Ambulance',i:'🚑'} };
  const faqs = [
    { q:'How does pay-per-use work?', a:'Load wallet with budget. Employees use services. We deduct only for actual usage. No premiums, no waste.' },
    { q:'Can we add/remove employees anytime?', a:'Yes. Upload CSV or add manually. Deactivate instantly. No lock-in contracts.' },
    { q:'What services are included?', a:'Hospitals, online doctors, lab tests, mental wellness, Ayurveda, Homeopathy, home care, ambulance.' },
    { q:'How much can we save vs insurance?', a:'30-40% on average. Use the calculator above for your estimate.' },
  ];
  const popularSearches = ['Health Checkup','Doctor Consult','Lab Tests','Mental Wellness','Ayurveda'];

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", color:'#1e293b', lineHeight:1.5 }}>

      {/* ===== HERO ===== */}
      <section style={{ background:'linear-gradient(160deg,#0a0f1e,#13203d,#1a3a6b)', padding:'56px 24px 40px', textAlign:'center', color:'#fff', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:300, height:300, background:'radial-gradient(circle,rgba(37,99,235,0.2),transparent 70%)', borderRadius:'50%' }} />
        <div style={{ maxWidth:720, margin:'0 auto', position:'relative', zIndex:1 }}>
          <span style={{ background:'rgba(245,158,11,0.12)', color:'#fbbf24', padding:'4px 16px', borderRadius:20, fontSize:'0.78rem', fontWeight:600, display:'inline-block', marginBottom:16 }}>🇮🇳 India's Most Comprehensive Corporate Healthcare Platform</span>
          <h1 style={{ fontSize:'clamp(1.6rem,4vw,2.2rem)', fontWeight:900, lineHeight:1.15, marginBottom:10 }}>Corporate Healthcare That <span style={{ color:'#fbbf24' }}>Saves Money</span></h1>
          <p style={{ fontSize:'0.95rem', opacity:0.85, maxWidth:550, margin:'0 auto 24px' }}>8 services. Pay-per-use. Corporate-negotiated rates. Zero waste.</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={()=>{setShowCalc(true);setTimeout(()=>document.getElementById('calculator')?.scrollIntoView({behavior:'smooth'}),100)}} style={{ padding:'11px 22px', background:'#f59e0b', color:'#0f172a', border:'none', borderRadius:8, fontWeight:700, fontSize:'0.88rem', cursor:'pointer', boxShadow:'0 3px 15px rgba(245,158,11,0.3)' }}>💰 Calculate Savings</button>
            <button onClick={()=>navigate('/corporate/register')} style={{ padding:'11px 22px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:'0.88rem', cursor:'pointer' }}>🚀 Register Company</button>
            <button onClick={()=>document.getElementById('packages')?.scrollIntoView({behavior:'smooth'})} style={{ padding:'11px 22px', background:'rgba(255,255,255,0.08)', border:'2px solid rgba(255,255,255,0.2)', borderRadius:8, color:'#fff', fontWeight:700, fontSize:'0.88rem', cursor:'pointer' }}>📋 Browse Packages</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, maxWidth:560, margin:'32px auto 0', padding:'16px 0 0', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
            {[{v:stats.totalProviders||0,l:'Providers'},{v:8,l:'Services'},{v:'30-40%',l:'Avg Savings'},{v:'5 min',l:'Setup'}].map((s,i)=>(<div key={i}><div style={{ fontSize:'1.4rem', fontWeight:800 }}>{s.v}</div><div style={{ fontSize:'0.75rem', opacity:0.7 }}>{s.l}</div></div>))}
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <div style={{ borderBottom:'1px solid #e2e8f0', padding:'10px 24px', background:'#fff', textAlign:'center', fontSize:'0.8rem', fontWeight:600, color:'#475569' }}>
        <span style={{ color:'#94a3b8' }}>TRUSTED BY COMPANIES</span>
        <span style={{ marginLeft:20 }}>🔒 ISO</span><span style={{ marginLeft:14 }}>✅ NABH</span><span style={{ marginLeft:14 }}>🛡️ Secure</span><span style={{ marginLeft:14 }}>🇮🇳 Pan India</span>
      </div>

      {/* ===== BENEFITS BAR ===== */}
      <div style={{ background:'#2563eb', padding:'10px 24px', color:'#fff', textAlign:'center', fontWeight:600, fontSize:'0.82rem' }}>
        ✅ No Medical Tests &nbsp;|&nbsp; ⚡ Instant Activation &nbsp;|&nbsp; 🇮🇳 Pan India &nbsp;|&nbsp; 🔄 Free Cancellation &nbsp;|&nbsp; 👨‍👩‍👧‍👦 Family Cover
      </div>

      {/* ===== SEARCH BAR ===== */}
      <section style={{ padding:'20px 24px', background:'#fff', borderBottom:'1px solid #e2e8f0' }}>
        <div style={{ maxWidth:620, margin:'0 auto' }}>
          <form onSubmit={handleSearch} style={{ display:'flex', gap:6, background:'#f8fafc', padding:5, borderRadius:10, border:'2px solid #e2e8f0' }}>
            <input placeholder="🔍 Search services, packages, providers..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{ flex:1, padding:'10px 14px', border:'none', background:'transparent', fontSize:'0.9rem', outline:'none' }} />
            <button type="submit" style={{ padding:'10px 20px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:'0.88rem' }}>Search</button>
          </form>
          <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:8, flexWrap:'wrap', fontSize:'0.8rem' }}>
            <span style={{ color:'#94a3b8' }}>Popular:</span>
            {popularSearches.map(s=><span key={s} onClick={()=>{setSearchTerm(s);fetchPackages(activeTag)}} style={{ color:'#2563eb', cursor:'pointer', fontWeight:500 }}>{s}</span>)}
          </div>
        </div>
      </section>

      {/* ===== CALCULATOR ===== */}
      {showCalc && (
        <section id="calculator" style={{ padding:'32px 24px', background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
          <div style={{ maxWidth:720, margin:'0 auto' }}>
            <h2 style={{ fontSize:'1.3rem', fontWeight:800, textAlign:'center', marginBottom:4 }}>💰 Savings Calculator</h2>
            <p style={{ fontSize:'0.9rem', color:'#64748b', textAlign:'center', marginBottom:20 }}>See how much you save vs traditional insurance</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12, marginBottom:20 }}>
              <div><label style={{ display:'block', fontWeight:600, marginBottom:4, fontSize:'0.85rem' }}>👥 Employees: {calcEmployees}</label><input type="range" min="10" max="1000" value={calcEmployees} onChange={e=>setCalcEmployees(+e.target.value)} style={{ width:'100%', accentColor:'#2563eb' }} /></div>
              <div><label style={{ display:'block', fontWeight:600, marginBottom:4, fontSize:'0.85rem' }}>📋 Services: {calcServices} of 8</label><input type="range" min="1" max="8" value={calcServices} onChange={e=>setCalcServices(+e.target.value)} style={{ width:'100%', accentColor:'#2563eb' }} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10, textAlign:'center' }}>
              <div style={{ background:'#fff', borderRadius:10, padding:16, borderTop:'3px solid #ef4444' }}><div style={{ fontWeight:700, color:'#ef4444', fontSize:'0.9rem' }}>Traditional Insurance</div><div style={{ fontSize:'1.3rem', fontWeight:800, color:'#ef4444', margin:'4px 0' }}>{fmt(traditionalCost)}</div><div style={{ fontSize:'0.7rem', color:'#64748b' }}>~₹15,000/emp/yr</div></div>
              <div style={{ background:'#fff', borderRadius:10, padding:16, borderTop:'3px solid #10b981' }}><div style={{ fontWeight:700, color:'#10b981', fontSize:'0.9rem' }}>HealthCare Hub</div><div style={{ fontSize:'1.3rem', fontWeight:800, color:'#10b981', margin:'4px 0' }}>{fmt(ourCost)}</div><div style={{ fontSize:'0.7rem', color:'#64748b' }}>Pay per use</div></div>
              <div style={{ background:'linear-gradient(135deg,#2563eb,#1d4ed8)', borderRadius:10, padding:16, color:'#fff' }}><div style={{ fontWeight:700, fontSize:'0.9rem' }}>You Save</div><div style={{ fontSize:'1.4rem', fontWeight:800, margin:'4px 0' }}>{fmt(savings)}</div><div style={{ fontSize:'1rem', fontWeight:700 }}>{savingsPct}% less</div></div>
            </div>
          </div>
        </section>
      )}

      {/* ===== PACKAGES ===== */}
      <section id="packages" style={{ padding:'40px 24px', background:'#f8fafc', borderTop:'1px solid #e2e8f0' }}>
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <h2 style={{ fontSize:'1.3rem', fontWeight:800, textAlign:'center', marginBottom:4 }}>Corporate Healthcare Packages</h2>
          <p style={{ fontSize:'0.88rem', color:'#64748b', textAlign:'center', marginBottom:20 }}>Compare packages across 8 service categories</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, justifyContent:'center', marginBottom:16 }}>
            {tags.map(t=><button key={t} onClick={()=>{setActiveTag(t);fetchPackages(t)}} style={{ padding:'7px 14px', borderRadius:20, border:activeTag===t?'2px solid #2563eb':'1px solid #e2e8f0', background:activeTag===t?'#2563eb':'#fff', color:activeTag===t?'#fff':'#475569', fontSize:'0.8rem', cursor:'pointer', fontWeight:activeTag===t?700:400, whiteSpace:'nowrap' }}>{tagMeta[t].i} {tagMeta[t].l}</button>)}
          </div>
          <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:20, flexWrap:'wrap' }}>
            <input placeholder="📍 City" value={city} onChange={e=>setCity(e.target.value)} style={{ padding:'9px 14px', border:'2px solid #e2e8f0', borderRadius:8, fontSize:'0.85rem', outline:'none', width:150 }} />
            <input placeholder="👥 Min Employees" type="number" value={minEmployees} onChange={e=>setMinEmployees(e.target.value)} style={{ padding:'9px 14px', border:'2px solid #e2e8f0', borderRadius:8, fontSize:'0.85rem', outline:'none', width:140 }} />
            <button onClick={()=>fetchPackages(activeTag)} style={{ padding:'9px 18px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>🔍 Filter</button>
          </div>
          {compareList.length>0 && (
            <div style={{ background:'#fff', padding:10, borderRadius:8, marginBottom:16, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', border:'2px solid #2563eb', fontSize:'0.85rem' }}>
              <span style={{ fontWeight:700 }}>Comparing {compareList.length}/3:</span>
              {compareList.map(p=><span key={p._id} style={{ background:'#eff6ff', padding:'2px 8px', borderRadius:14, fontSize:'0.8rem' }}>{p.packageName} <span onClick={()=>toggleCompare(p)} style={{ cursor:'pointer', marginLeft:4 }}>×</span></span>)}
            </div>
          )}
          {loading ? <div style={{ textAlign:'center', padding:40 }}>⏳ Loading...</div> : packages.length===0 ? (
            <div style={{ textAlign:'center', padding:40, background:'#fff', borderRadius:12 }}>
              <div style={{ fontSize:'2.5rem', marginBottom:4 }}>📦</div>
              <h3 style={{ fontWeight:700, fontSize:'1rem' }}>No packages found</h3>
              <p style={{ color:'#64748b', fontSize:'0.85rem' }}><a href="mailto:corporate@healthcarehub.com" style={{ color:'#2563eb' }}>Contact us</a> for custom plans.</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
              {packages.map(pkg=>(
                <div key={pkg._id} style={{ background:'#fff', borderRadius:12, padding:20, border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow='0 6px 24px rgba(0,0,0,0.08)'} onMouseLeave={e=>e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ padding:'3px 10px', borderRadius:14, fontSize:'0.72rem', fontWeight:700, background:'#eff6ff', color:'#2563eb' }}>{tagLabel(pkg.tag)}</span>
                    <div style={{ display:'flex', gap:4 }}>
                      <button onClick={()=>toggleCompare(pkg)} style={{ padding:'2px 7px', borderRadius:14, fontSize:'0.68rem', border:'1px solid #e2e8f0', background:compareList.find(x=>x._id===pkg._id)?'#2563eb':'#fff', color:compareList.find(x=>x._id===pkg._id)?'#fff':'#64748b', cursor:'pointer' }}>⇆</button>
                      {pkg.discountedPricePerEmployee && <span style={{ padding:'2px 7px', borderRadius:14, fontSize:'0.68rem', fontWeight:700, background:'#ecfdf5', color:'#059669' }}>{Math.round((1-pkg.discountedPricePerEmployee/pkg.pricePerEmployee)*100)}%</span>}
                    </div>
                  </div>
                  <h3 style={{ fontWeight:700, fontSize:'1rem', marginBottom:4 }}>{pkg.packageName}</h3>
                  <p style={{ color:'#64748b', fontSize:'0.82rem', marginBottom:12 }}>{pkg.description||'Comprehensive corporate healthcare package.'}</p>
                  <div style={{ background:'#f8fafc', padding:10, borderRadius:8, marginBottom:12 }}>
                    <span style={{ fontSize:'1.3rem', fontWeight:800, color:'#2563eb' }}>{fmt(pkg.discountedPricePerEmployee||pkg.pricePerEmployee)}</span>
                    <span style={{ color:'#94a3b8', fontSize:'0.8rem' }}> /employee</span>
                  </div>
                  <div style={{ fontSize:'0.78rem', color:'#475569', marginBottom:12 }}>🏥 {pkg.providerName} {pkg.providerCity&&`· ${pkg.providerCity}`} · 👥 Min {pkg.minEmployees||10}</div>
                  <button onClick={()=>navigate('/corporate/register')} style={{ width:'100%', padding:10, background:'#2563eb', color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>Enquire Now</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ padding:'36px 24px', background:'#fff' }}>
        <h2 style={{ fontSize:'1.3rem', fontWeight:800, textAlign:'center', marginBottom:16 }}>How It Works</h2>
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'clamp(8px,3vw,20px)', flexWrap:'wrap', textAlign:'center', fontSize:'0.85rem' }}>
          {[{i:'🔍',t:'Browse'},{i:'✅',t:'Select'},{i:'💳',t:'Add Funds'},{i:'👥',t:'Invite'},{i:'📊',t:'Pay Per Use'}].map((x,i)=>(
            <span key={i} style={{ display:'flex', alignItems:'center', gap:6, fontWeight:600 }}>{x.i} {x.t}{i<4&&<span style={{ marginLeft:8, color:'#cbd5e1' }}>→</span>}</span>
          ))}
        </div>
      </section>

      {/* ===== WHY DIFFERENT ===== */}
      <section style={{ padding:'36px 24px', background:'#f8fafc' }}>
        <h2 style={{ fontSize:'1.3rem', fontWeight:800, textAlign:'center', marginBottom:16 }}>Why We're Different</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:12 }}>
          {[{i:'💰',t:'Pay Per Use',d:'No premiums. 30-40% savings.'},{i:'🧘',t:'Ayurveda+Homeo',d:'Only platform with both.'},{i:'🧠',t:'Mental Wellness',d:'EAP, therapy, screening.'},{i:'📊',t:'Real Analytics',d:'Live dashboard & reports.'},{i:'🔌',t:'8 in 1',d:'All services, one platform.'},{i:'🚀',t:'5-Min Setup',d:'Register, upload, done.'}].map((x,i)=>(<div key={i} style={{ padding:14, borderRadius:10, border:'1px solid #f1f5f9', background:'#fff' }}><div style={{ fontSize:'1.4rem', marginBottom:4 }}>{x.i}</div><h3 style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:2 }}>{x.t}</h3><p style={{ color:'#64748b', fontSize:'0.8rem' }}>{x.d}</p></div>))}
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section style={{ padding:'36px 24px', background:'#fff' }}>
        <h2 style={{ fontSize:'1.3rem', fontWeight:800, textAlign:'center', marginBottom:12 }}>Frequently Asked Questions</h2>
        <div style={{ maxWidth:700, margin:'0 auto' }}>
          {faqs.map((f,i)=>(<div key={i} style={{ background:'#fff', borderRadius:8, marginBottom:4, border:'1px solid #e2e8f0' }}><button onClick={()=>setFaqOpen(faqOpen===i?null:i)} style={{ width:'100%', padding:'12px 16px', display:'flex', justifyContent:'space-between', background:'none', border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.9rem', textAlign:'left' }}>{f.q}<span>{faqOpen===i?'▲':'▼'}</span></button>{faqOpen===i&&<div style={{ padding:'0 16px 12px', color:'#475569', fontSize:'0.85rem' }}>{f.a}</div>}</div>))}
          <div style={{ textAlign:'center', marginTop:8 }}>
            <a href="mailto:corporate@healthcarehub.com" style={{ color:'#2563eb', fontWeight:600, fontSize:'0.85rem', textDecoration:'none' }}>More questions? Contact us →</a>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ background:'linear-gradient(160deg,#0f172a,#1e3a5f)', padding:'36px 24px', textAlign:'center', color:'#fff' }}>
        <h2 style={{ fontSize:'1.3rem', fontWeight:800, marginBottom:6 }}>Ready to Save on Employee Healthcare?</h2>
        <p style={{ opacity:0.85, marginBottom:20, fontSize:'0.9rem' }}>Setup in 5 minutes. Cancel anytime.</p>
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={()=>navigate('/corporate/register')} style={{ padding:'11px 24px', background:'#f59e0b', color:'#0f172a', border:'none', borderRadius:8, fontWeight:700, fontSize:'0.9rem', cursor:'pointer' }}>🚀 Register Free</button>
          <a href="https://wa.me/919876543210?text=Hi%20HealthCare%20Hub%20Corporate" target="_blank" rel="noreferrer" style={{ padding:'11px 24px', background:'#25D366', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:'0.9rem', textDecoration:'none', cursor:'pointer' }}>💬 WhatsApp</a>
          <a href="mailto:corporate@healthcarehub.com?subject=Demo" style={{ padding:'11px 24px', background:'rgba(255,255,255,0.08)', border:'2px solid rgba(255,255,255,0.2)', borderRadius:8, color:'#fff', fontWeight:700, fontSize:'0.9rem', textDecoration:'none' }}>📞 Demo</a>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background:'#0f172a', padding:'14px 24px', textAlign:'center', color:'#94a3b8', fontSize:'0.78rem' }}>
        © 2026 HealthCare Hub · <a href="/privacy" style={{ color:'#94a3b8' }}>Privacy</a> · <a href="/terms" style={{ color:'#94a3b8' }}>Terms</a> · <a href="/refund" style={{ color:'#94a3b8' }}>Refund</a> · 📧 corporate@healthcarehub.com
      </footer>

    </div>
  );
};

export default CorporateHub;