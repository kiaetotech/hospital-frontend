import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-7d0f.up.railway.app';

const CorporateHub = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProviders: 0 });
  const [activeTag, setActiveTag] = useState('all');
  const [city, setCity] = useState('');
  const [minEmployees, setMinEmployees] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [compareList, setCompareList] = useState([]);
  const [calcEmployees, setCalcEmployees] = useState(100);
  const [calcServices, setCalcServices] = useState(4);
  const [faqOpen, setFaqOpen] = useState(null);
  const [showCalc, setShowCalc] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => { fetchStats(); fetchPackages(); }, []);

  const fetchStats = async () => {
    try { const r = await axios.get(`${API_BASE}/api/corporate-hub/stats`); if (r.data?.success) setStats(r.data.data); } catch(e){}
  };

  const fetchPackages = async (tag = 'all') => {
    setLoading(true);
    try {
      const p = {}; if (tag !== 'all') p.tag = tag; if (city) p.city = city; if (minEmployees) p.minEmployees = minEmployees; if (searchTerm) p.search = searchTerm;
      const r = await axios.get(`${API_BASE}/api/corporate-hub/packages`, { params: p });
      if (r.data?.success) { setAllPackages(r.data.data); applySorting(r.data.data, sortBy); }
      else { setAllPackages([]); setPackages([]); }
    } catch(e){ setAllPackages([]); setPackages([]); }
    finally { setLoading(false); setVisibleCount(6); }
  };

  const applySorting = (data, sort) => {
    let sorted = [...data];
    if (sort === 'price_low') sorted.sort((a,b) => (a.discountedPricePerEmployee||a.pricePerEmployee) - (b.discountedPricePerEmployee||b.pricePerEmployee));
    else if (sort === 'price_high') sorted.sort((a,b) => (b.discountedPricePerEmployee||b.pricePerEmployee) - (a.discountedPricePerEmployee||a.pricePerEmployee));
    else if (sort === 'rating') sorted.sort((a,b) => (b.providerRating||0) - (a.providerRating||0));
    setPackages(sorted);
  };

  const handleSort = (s) => { setSortBy(s); applySorting(allPackages, s); setVisibleCount(6); };
  const handleSearch = (e) => { e.preventDefault(); document.getElementById('packages')?.scrollIntoView({ behavior:'smooth' }); fetchPackages(activeTag); };
  const loadMore = () => setVisibleCount(prev => prev + 6);
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
  const visiblePackages = packages.slice(0, visibleCount);
  const hasMore = packages.length > visibleCount;

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", color:'#1e293b', lineHeight:1.45, background:'#fff' }}>

      {/* ===== HERO ===== */}
      <section style={{ background:'linear-gradient(160deg,#0a0f1e,#13203d,#1a3a6b)', padding:'32px 20px 28px', textAlign:'center', color:'#fff' }}>
        <div style={{ maxWidth:640, margin:'0 auto' }}>
          <span style={{ background:'rgba(245,158,11,0.12)', color:'#fbbf24', padding:'3px 12px', borderRadius:16, fontSize:'0.7rem', fontWeight:600, display:'inline-block', marginBottom:10 }}>🇮🇳 India's Most Comprehensive Corporate Healthcare Platform</span>
          <h1 style={{ fontSize:'1.4rem', fontWeight:900, lineHeight:1.2, marginBottom:6 }}>Corporate Healthcare That <span style={{ color:'#fbbf24' }}>Saves Money</span></h1>
          <p style={{ fontSize:'0.85rem', opacity:0.85, maxWidth:480, margin:'0 auto 18px' }}>8 services. Pay-per-use. Corporate-negotiated rates. Zero waste.</p>
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={()=>{setShowCalc(true);setTimeout(()=>document.getElementById('calculator')?.scrollIntoView({behavior:'smooth'}),100)}} style={{ padding:'9px 18px', background:'#f59e0b', color:'#0f172a', border:'none', borderRadius:6, fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>💰 Calculate Savings</button>
            <button onClick={()=>navigate('/corporate/register')} style={{ padding:'9px 18px', background:'#2563eb', color:'#fff', border:'none', borderRadius:6, fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>🚀 Register Company</button>
            <button onClick={()=>document.getElementById('packages')?.scrollIntoView({behavior:'smooth'})} style={{ padding:'9px 18px', background:'rgba(255,255,255,0.08)', border:'2px solid rgba(255,255,255,0.2)', borderRadius:6, color:'#fff', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>📋 Browse Packages</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, maxWidth:480, margin:'20px auto 0' }}>
            {[{v:stats.totalProviders||0,l:'Providers'},{v:8,l:'Services'},{v:'30-40%',l:'Avg Savings'},{v:'5 min',l:'Setup'}].map((s,i)=>(<div key={i}><div style={{ fontSize:'1.1rem', fontWeight:800 }}>{s.v}</div><div style={{ fontSize:'0.7rem', opacity:0.7 }}>{s.l}</div></div>))}
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <div style={{ borderBottom:'1px solid #e2e8f0', padding:'8px 20px', background:'#fff', textAlign:'center', fontSize:'0.73rem', fontWeight:600, color:'#64748b' }}>
        TRUSTED BY COMPANIES &nbsp; 🔒 ISO &nbsp; ✅ NABH &nbsp; 🛡️ Secure &nbsp; 🇮🇳 Pan India
      </div>

      {/* ===== BENEFITS BAR ===== */}
      <div style={{ background:'#2563eb', padding:'8px 20px', color:'#fff', textAlign:'center', fontWeight:600, fontSize:'0.75rem' }}>
        ✅ No Medical Tests &nbsp;|&nbsp; ⚡ Instant Activation &nbsp;|&nbsp; 🇮🇳 Pan India &nbsp;|&nbsp; 🔄 Free Cancellation
      </div>

      {/* ===== SEARCH BAR ===== */}
      <section style={{ padding:'16px 20px', background:'#fff', borderBottom:'1px solid #e2e8f0' }}>
        <div style={{ maxWidth:560, margin:'0 auto' }}>
          <form onSubmit={handleSearch} style={{ display:'flex', gap:5, background:'#f8fafc', padding:4, borderRadius:8, border:'2px solid #e2e8f0' }}>
            <input placeholder="🔍 Search services, packages..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{ flex:1, padding:'9px 12px', border:'none', background:'transparent', fontSize:'0.85rem', outline:'none' }} />
            <button type="submit" style={{ padding:'9px 16px', background:'#2563eb', color:'#fff', border:'none', borderRadius:6, fontWeight:700, cursor:'pointer', fontSize:'0.82rem' }}>Search</button>
          </form>
          <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:6, flexWrap:'wrap', fontSize:'0.75rem' }}>
            <span style={{ color:'#94a3b8' }}>Popular:</span>
            {popularSearches.map(s=><span key={s} onClick={()=>{setSearchTerm(s);fetchPackages(activeTag)}} style={{ color:'#2563eb', cursor:'pointer', fontWeight:500 }}>{s}</span>)}
          </div>
        </div>
      </section>

      {/* ===== CALCULATOR ===== */}
      {showCalc && (
        <section id="calculator" style={{ padding:'24px 20px', background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
          <div style={{ maxWidth:660, margin:'0 auto' }}>
            <h2 style={{ fontSize:'1.15rem', fontWeight:800, textAlign:'center', marginBottom:2 }}>💰 Savings Calculator</h2>
            <p style={{ fontSize:'0.82rem', color:'#64748b', textAlign:'center', marginBottom:16 }}>See how much you save vs traditional insurance</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10, marginBottom:16 }}>
              <div><label style={{ display:'block', fontWeight:600, marginBottom:3, fontSize:'0.8rem' }}>👥 Employees: {calcEmployees}</label><input type="range" min="10" max="1000" value={calcEmployees} onChange={e=>setCalcEmployees(+e.target.value)} style={{ width:'100%', accentColor:'#2563eb' }} /></div>
              <div><label style={{ display:'block', fontWeight:600, marginBottom:3, fontSize:'0.8rem' }}>📋 Services: {calcServices} of 8</label><input type="range" min="1" max="8" value={calcServices} onChange={e=>setCalcServices(+e.target.value)} style={{ width:'100%', accentColor:'#2563eb' }} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:8, textAlign:'center' }}>
              <div style={{ background:'#fff', borderRadius:8, padding:14, borderTop:'3px solid #ef4444' }}><div style={{ fontWeight:700, color:'#ef4444', fontSize:'0.85rem' }}>Traditional</div><div style={{ fontSize:'1.1rem', fontWeight:800, color:'#ef4444' }}>{fmt(traditionalCost)}</div></div>
              <div style={{ background:'#fff', borderRadius:8, padding:14, borderTop:'3px solid #10b981' }}><div style={{ fontWeight:700, color:'#10b981', fontSize:'0.85rem' }}>HealthCare Hub</div><div style={{ fontSize:'1.1rem', fontWeight:800, color:'#10b981' }}>{fmt(ourCost)}</div></div>
              <div style={{ background:'#2563eb', borderRadius:8, padding:14, color:'#fff' }}><div style={{ fontWeight:700, fontSize:'0.85rem' }}>You Save</div><div style={{ fontSize:'1.2rem', fontWeight:800 }}>{fmt(savings)}</div><div style={{ fontSize:'0.9rem', fontWeight:700 }}>{savingsPct}%</div></div>
            </div>
          </div>
        </section>
      )}

      {/* ===== PACKAGES ===== */}
      <section id="packages" style={{ padding:'28px 20px', background:'#f8fafc', borderTop:'1px solid #e2e8f0' }}>
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <h2 style={{ fontSize:'1.15rem', fontWeight:800, textAlign:'center', marginBottom:2 }}>Corporate Healthcare Packages</h2>
          <p style={{ fontSize:'0.8rem', color:'#64748b', textAlign:'center', marginBottom:14 }}>Compare packages across 8 service categories</p>

          {/* Tag filters */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:4, justifyContent:'center', marginBottom:12 }}>
            {tags.map(t=><button key={t} onClick={()=>{setActiveTag(t);fetchPackages(t)}} style={{ padding:'6px 12px', borderRadius:16, border:activeTag===t?'2px solid #2563eb':'1px solid #e2e8f0', background:activeTag===t?'#2563eb':'#fff', color:activeTag===t?'#fff':'#475569', fontSize:'0.75rem', cursor:'pointer', fontWeight:activeTag===t?700:400, whiteSpace:'nowrap' }}>{tagMeta[t].i} {tagMeta[t].l}</button>)}
          </div>

          {/* Filter bar with Sort */}
          <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
            <input placeholder="📍 City" value={city} onChange={e=>setCity(e.target.value)} style={{ padding:'8px 12px', border:'2px solid #e2e8f0', borderRadius:6, fontSize:'0.8rem', outline:'none', width:130 }} />
            <input placeholder="👥 Min Employees" type="number" value={minEmployees} onChange={e=>setMinEmployees(e.target.value)} style={{ padding:'8px 12px', border:'2px solid #e2e8f0', borderRadius:6, fontSize:'0.8rem', outline:'none', width:120 }} />
            <select value={sortBy} onChange={e=>handleSort(e.target.value)} style={{ padding:'8px 10px', border:'2px solid #e2e8f0', borderRadius:6, fontSize:'0.8rem', outline:'none', background:'#fff', cursor:'pointer' }}>
              <option value="default">Best Match</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            <button onClick={()=>fetchPackages(activeTag)} style={{ padding:'8px 16px', background:'#2563eb', color:'#fff', border:'none', borderRadius:6, fontWeight:700, cursor:'pointer', fontSize:'0.8rem' }}>🔍 Filter</button>
          </div>

          {/* Compare bar */}
          {compareList.length>0 && (
            <div style={{ background:'#fff', padding:8, borderRadius:6, marginBottom:12, display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', border:'2px solid #2563eb', fontSize:'0.8rem' }}>
              <span style={{ fontWeight:700 }}>Compare {compareList.length}/3:</span>
              {compareList.map(p=><span key={p._id} style={{ background:'#eff6ff', padding:'2px 6px', borderRadius:12, fontSize:'0.75rem' }}>{p.packageName} <span onClick={()=>toggleCompare(p)} style={{ cursor:'pointer' }}>×</span></span>)}
            </div>
          )}

          {/* Package cards */}
          {loading ? <div style={{ textAlign:'center', padding:32 }}>⏳ Loading...</div> : packages.length===0 ? (
            <div style={{ textAlign:'center', padding:32, background:'#fff', borderRadius:10 }}>
              <div style={{ fontSize:'2rem', marginBottom:4 }}>📦</div>
              <h3 style={{ fontWeight:700, fontSize:'0.95rem' }}>No packages found</h3>
              <p style={{ color:'#64748b', fontSize:'0.8rem' }}><a href="mailto:corporate@healthcarehub.com" style={{ color:'#2563eb' }}>Contact us</a> for custom plans.</p>
            </div>
          ) : (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
                {visiblePackages.map(pkg=>(
                  <div key={pkg._id} style={{ background:'#fff', borderRadius:10, padding:16, border:'1px solid #f1f5f9', boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}
                    onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.07)'} onMouseLeave={e=>e.currentTarget.style.boxShadow='0 1px 2px rgba(0,0,0,0.04)'}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ padding:'2px 8px', borderRadius:12, fontSize:'0.68rem', fontWeight:700, background:'#eff6ff', color:'#2563eb' }}>{tagLabel(pkg.tag)}</span>
                      <div style={{ display:'flex', gap:3 }}>
                        <button onClick={()=>toggleCompare(pkg)} style={{ padding:'1px 6px', borderRadius:12, fontSize:'0.65rem', border:'1px solid #e2e8f0', background:compareList.find(x=>x._id===pkg._id)?'#2563eb':'#fff', color:compareList.find(x=>x._id===pkg._id)?'#fff':'#64748b', cursor:'pointer' }}>⇆</button>
                        {pkg.discountedPricePerEmployee && <span style={{ padding:'1px 6px', borderRadius:12, fontSize:'0.65rem', fontWeight:700, background:'#ecfdf5', color:'#059669' }}>{Math.round((1-pkg.discountedPricePerEmployee/pkg.pricePerEmployee)*100)}%</span>}
                      </div>
                    </div>
                    <h3 style={{ fontWeight:700, fontSize:'0.92rem', marginBottom:3 }}>{pkg.packageName}</h3>
                    <p style={{ color:'#64748b', fontSize:'0.78rem', marginBottom:10, lineHeight:1.4 }}>{pkg.description||'Comprehensive corporate healthcare package.'}</p>
                    <div style={{ background:'#f8fafc', padding:8, borderRadius:6, marginBottom:10 }}>
                      <span style={{ fontSize:'1.15rem', fontWeight:800, color:'#2563eb' }}>{fmt(pkg.discountedPricePerEmployee||pkg.pricePerEmployee)}</span>
                      <span style={{ color:'#94a3b8', fontSize:'0.75rem' }}> /employee</span>
                    </div>
                    <div style={{ fontSize:'0.73rem', color:'#475569', marginBottom:10 }}>🏥 {pkg.providerName} {pkg.providerCity&&`· ${pkg.providerCity}`} · 👥 Min {pkg.minEmployees||10}</div>
                    <button onClick={()=>navigate('/corporate/register')} style={{ width:'100%', padding:8, background:'#2563eb', color:'#fff', border:'none', borderRadius:6, fontWeight:700, cursor:'pointer', fontSize:'0.8rem' }}>Enquire Now</button>
                  </div>
                ))}
              </div>

              {/* Load More + Count */}
              <div style={{ textAlign:'center', marginTop:16 }}>
                <span style={{ fontSize:'0.8rem', color:'#64748b', marginRight:16 }}>
                  Showing {visiblePackages.length} of {packages.length} packages
                </span>
                {hasMore && (
                  <button onClick={loadMore} style={{ padding:'8px 20px', background:'#fff', color:'#2563eb', border:'2px solid #2563eb', borderRadius:6, fontWeight:700, cursor:'pointer', fontSize:'0.82rem' }}>
                    Load More Packages ↓
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ padding:'24px 20px', background:'#fff' }}>
        <h2 style={{ fontSize:'1.15rem', fontWeight:800, textAlign:'center', marginBottom:12 }}>How It Works</h2>
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10, flexWrap:'wrap', textAlign:'center', fontSize:'0.8rem', fontWeight:600, color:'#475569' }}>
          🔍 Browse → ✅ Select → 💳 Add Funds → 👥 Invite Employees → 📊 Pay Per Use
        </div>
      </section>

      {/* ===== WHY DIFFERENT ===== */}
      <section style={{ padding:'24px 20px', background:'#f8fafc' }}>
        <h2 style={{ fontSize:'1.15rem', fontWeight:800, textAlign:'center', marginBottom:12 }}>Why We're Different</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))', gap:10 }}>
          {[{i:'💰',t:'Pay Per Use',d:'No premiums. 30-40% savings.'},{i:'🧘',t:'Ayurveda+Homeo',d:'Only platform with both.'},{i:'🧠',t:'Mental Wellness',d:'EAP, therapy, screening.'},{i:'📊',t:'Real Analytics',d:'Live dashboard & reports.'},{i:'🔌',t:'8 in 1',d:'All services, one platform.'},{i:'🚀',t:'5-Min Setup',d:'Register, upload, done.'}].map((x,i)=>(<div key={i} style={{ padding:12, borderRadius:8, border:'1px solid #f1f5f9', background:'#fff' }}><div style={{ fontSize:'1.2rem', marginBottom:3 }}>{x.i}</div><h3 style={{ fontWeight:700, fontSize:'0.82rem', marginBottom:2 }}>{x.t}</h3><p style={{ color:'#64748b', fontSize:'0.75rem', lineHeight:1.4 }}>{x.d}</p></div>))}
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section style={{ padding:'24px 20px', background:'#fff' }}>
        <h2 style={{ fontSize:'1.15rem', fontWeight:800, textAlign:'center', marginBottom:10 }}>Frequently Asked Questions</h2>
        <div style={{ maxWidth:640, margin:'0 auto' }}>
          {faqs.map((f,i)=>(<div key={i} style={{ borderRadius:6, marginBottom:3, border:'1px solid #e2e8f0' }}><button onClick={()=>setFaqOpen(faqOpen===i?null:i)} style={{ width:'100%', padding:'10px 14px', display:'flex', justifyContent:'space-between', background:'#fff', border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.85rem', textAlign:'left' }}>{f.q}<span>{faqOpen===i?'▲':'▼'}</span></button>{faqOpen===i&&<div style={{ padding:'0 14px 10px', color:'#475569', fontSize:'0.8rem', lineHeight:1.5 }}>{f.a}</div>}</div>))}
          <div style={{ textAlign:'center', marginTop:6 }}>
            <a href="mailto:corporate@healthcarehub.com" style={{ color:'#2563eb', fontWeight:600, fontSize:'0.8rem', textDecoration:'none' }}>More questions? Contact us →</a>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ background:'linear-gradient(160deg,#0f172a,#1e3a5f)', padding:'28px 20px', textAlign:'center', color:'#fff' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:800, marginBottom:4 }}>Ready to Save on Employee Healthcare?</h2>
        <p style={{ opacity:0.85, marginBottom:16, fontSize:'0.85rem' }}>Setup in 5 minutes. Cancel anytime.</p>
        <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={()=>navigate('/corporate/register')} style={{ padding:'10px 20px', background:'#f59e0b', color:'#0f172a', border:'none', borderRadius:6, fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>🚀 Register Free</button>
          <a href="https://wa.me/919876543210?text=Hi%20HealthCare%20Hub%20Corporate" target="_blank" rel="noreferrer" style={{ padding:'10px 20px', background:'#25D366', color:'#fff', border:'none', borderRadius:6, fontWeight:700, fontSize:'0.85rem', textDecoration:'none', cursor:'pointer' }}>💬 WhatsApp</a>
          <a href="mailto:corporate@healthcarehub.com?subject=Demo" style={{ padding:'10px 20px', background:'rgba(255,255,255,0.08)', border:'2px solid rgba(255,255,255,0.2)', borderRadius:6, color:'#fff', fontWeight:700, fontSize:'0.85rem', textDecoration:'none' }}>📞 Demo</a>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background:'#0f172a', padding:'12px 20px', textAlign:'center', color:'#94a3b8', fontSize:'0.73rem' }}>
        © 2026 HealthCare Hub · <a href="/privacy" style={{ color:'#94a3b8' }}>Privacy</a> · <a href="/terms" style={{ color:'#94a3b8' }}>Terms</a> · <a href="/refund" style={{ color:'#94a3b8' }}>Refund</a> · 📧 corporate@healthcarehub.com
      </footer>

    </div>
  );
};

export default CorporateHub;
