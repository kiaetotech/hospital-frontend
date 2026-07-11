import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-f1b1.up.railway.app';

const CorporateHub = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTag, setActiveTag] = useState('all');
  const [city, setCity] = useState('');
  const [minEmployees, setMinEmployees] = useState('');

  useEffect(() => { fetchStats(); fetchPackages(); }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/corporate-hub/stats`);
      if (res.data?.success) setStats(res.data.data);
    } catch (err) {
      setStats({ totalProviders: 0, breakdown: { hospitals: 0, onlineDoctors: 0, diagnostics: 0, mentalHealth: 0, ayurveda: 0, homeopathy: 0, caregivers: 0, ambulance: 0 } });
    }
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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleTagChange = (tag) => { setActiveTag(tag); fetchPackages(tag); };
  const handleSearch = (e) => { e.preventDefault(); fetchPackages(activeTag); };

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

  const formatPrice = (a) => a ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(a) : '₹0';
  
  const getTagLabel = (tag) => {
    const m = { hospitals: 'Hospital', onlineDoctors: 'Online Doctor', diagnostics: 'Diagnostics', mentalHealth: 'Mental Wellness', ayurveda: 'Ayurveda', homeopathy: 'Homeopathy', caregivers: 'Home Care', ambulance: 'Ambulance' };
    return m[tag] || tag;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #2563eb 100%)', padding: '5rem 2rem', textAlign: 'center', color: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ fontSize: '56px', marginBottom: '1rem' }}>🏢</div>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.2 }}>
            Employee Healthcare, <span style={{ color: '#fbbf24' }}>Simplified</span>
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '650px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            One platform. 8 healthcare services. Corporate-negotiated rates. Pay only for what your employees use — no wasted premiums, no lock-in contracts.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/corporate/register')} style={{ padding: '14px 36px', backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,158,11,0.4)' }}>
              🚀 Register Your Company
            </button>
            <button onClick={() => document.getElementById('packages-section').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '14px 36px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '10px', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
              📋 Browse Packages
            </button>
          </div>
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', maxWidth: '800px', margin: '3rem auto 0' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>{stats.totalProviders || 0}+</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Verified Providers</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>8</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Service Categories</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>💰</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Pay Per Use</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>📊</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Real-time Dashboard</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* TRUST BADGES */}
      <section style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1.5rem 1rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          <span style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 'bold' }}>TRUSTED BY COMPANIES ACROSS INDIA</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#374151' }}>🔒 ISO Certified</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#374151' }}>✅ NABH Accredited</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#374151' }}>🛡️ Data Secure</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#374151' }}>🇮🇳 Pan India</span>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '4rem 1rem', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.5rem' }}>How It Works</h2>
          <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '3rem' }}>Simple 5-step process to get your employees covered</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            {[
              { icon: '🔍', title: '1. Browse', desc: 'Explore corporate packages from 8 service categories' },
              { icon: '✅', title: '2. Select', desc: 'Pick services your employees actually need' },
              { icon: '💳', title: '3. Add Funds', desc: 'Load your company wallet with budget' },
              { icon: '👥', title: '4. Invite Employees', desc: 'Upload CSV or add manually — employees get access' },
              { icon: '📊', title: '5. Track & Pay', desc: 'Real-time dashboard. Pay only for what gets used' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1rem' }}>{item.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section id="packages-section" style={{ padding: '4rem 1rem', backgroundColor: '#f1f5f9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.5rem' }}>Corporate Healthcare Packages</h2>
          <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '2rem' }}>Filter by service type, city, and employee count</p>
          
          {/* Tag Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {tags.map((tag) => (
              <button key={tag.key} onClick={() => handleTagChange(tag.key)} style={{ padding: '10px 20px', borderRadius: '30px', border: activeTag === tag.key ? '2px solid #2563eb' : '1px solid #d1d5db', backgroundColor: activeTag === tag.key ? '#2563eb' : 'white', color: activeTag === tag.key ? 'white' : '#374151', fontSize: '0.9rem', cursor: 'pointer', fontWeight: activeTag === tag.key ? 'bold' : 'normal', transition: 'all 0.2s' }}>
                {tag.icon} {tag.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <input type="text" placeholder="📍 City (e.g. Mumbai)" value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '10px 18px', border: '1px solid #d1d5db', borderRadius: '10px', width: '200px', fontSize: '0.95rem' }} />
            <input type="number" placeholder="👥 Min Employees" value={minEmployees} onChange={(e) => setMinEmployees(e.target.value)} style={{ padding: '10px 18px', border: '1px solid #d1d5db', borderRadius: '10px', width: '170px', fontSize: '0.95rem' }} />
            <button type="submit" style={{ padding: '10px 28px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}>🔍 Search</button>
          </form>

          {/* Package Cards */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}><div style={{ fontSize: '3rem' }}>⏳</div><p style={{ color: '#6b7280', marginTop: '1rem' }}>Loading packages...</p></div>
          ) : packages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
              <p style={{ color: '#374151', fontSize: '1.2rem', fontWeight: 'bold' }}>No corporate packages found</p>
              <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Providers haven't listed corporate packages yet. Check back soon or <a href="mailto:corporate@healthcarehub.com" style={{ color: '#2563eb' }}>contact us</a> for custom plans.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {packages.map((pkg) => (
                <div key={pkg._id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: '#eff6ff', color: '#2563eb' }}>{getTagLabel(pkg.tag)}</span>
                    {pkg.discountedPricePerEmployee && (
                      <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {Math.round((1 - pkg.discountedPricePerEmployee / pkg.pricePerEmployee) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.15rem', marginBottom: '0.5rem', color: '#0f172a' }}>{pkg.packageName}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>{pkg.description || 'Comprehensive corporate healthcare package tailored for your team.'}</p>
                  
                  {/* Price */}
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2563eb' }}>{formatPrice(pkg.discountedPricePerEmployee || pkg.pricePerEmployee)}</span>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>/employee</span>
                    </div>
                    {pkg.discountedPricePerEmployee && <span style={{ color: '#9ca3af', fontSize: '0.85rem', textDecoration: 'line-through' }}>{formatPrice(pkg.pricePerEmployee)}</span>}
                  </div>
                  
                  {/* Details */}
                  <div style={{ fontSize: '0.88rem', color: '#4b5563', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🏥 Provider:</span><span style={{ fontWeight: '500' }}>{pkg.providerName}</span></div>
                    {pkg.providerCity && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>📍 City:</span><span>{pkg.providerCity}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>👥 Min:</span><span>{pkg.minEmployees || 10} employees</span></div>
                    {pkg.providerRating && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>⭐ Rating:</span><span>{pkg.providerRating}/5</span></div>}
                  </div>
                  
                  <button onClick={() => navigate('/corporate/register')} style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', transition: 'background 0.2s' }}>✉️ Enquire Now</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* COMPETITIVE ADVANTAGES */}
      <section style={{ padding: '4rem 1rem', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.5rem' }}>Why We're Different</h2>
          <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '3rem' }}>What sets us apart from traditional corporate healthcare platforms</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '💰', title: 'Pay Per Use', desc: 'No premiums. No claims. Load wallet, employees use services, pay only for actual usage. 30-40% cost savings vs traditional insurance.' },
              { icon: '🧘', title: 'Ayurveda + Homeopathy', desc: 'Only platform offering corporate Ayurveda, Panchakarma, Homeopathy & Naturopathy — not just allopathy.' },
              { icon: '🧠', title: 'Mental Wellness Built-in', desc: 'EAP, therapy sessions, stress management, PHQ-9/GAD-7 screening — all in one platform.' },
              { icon: '📊', title: 'Real-time Analytics', desc: 'Live dashboard shows utilization, spend per department, wellness scores. Export reports in 1 click.' },
              { icon: '🔌', title: '8 Services, 1 Platform', desc: 'Hospitals, doctors, labs, mental health, ayurveda, homeopathy, home care, ambulance — unified.' },
              { icon: '🚀', title: '5-Minute Setup', desc: 'Register, select services, upload employee list, load wallet. Your team gets access instantly.' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '1.75rem', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#0f172a' }}>{item.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '4rem 1rem', backgroundColor: '#f1f5f9' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '3rem' }}>Trusted by HR Leaders</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              { quote: 'Switching from traditional insurance saved us 35% in the first year. Our employees love the Ayurveda and mental wellness options.', name: 'Priya M.', role: 'HR Director, TechCorp', logo: '🏢' },
              { quote: 'The real-time dashboard gives us complete visibility. We can see exactly which services employees use and optimize our budget.', name: 'Rajesh K.', role: 'VP People, InnovateTech', logo: '🏢' },
              { quote: 'Setup was incredibly fast. Uploaded our 200 employees via CSV, loaded the wallet, and everything was live in minutes.', name: 'Anita S.', role: 'HR Manager, GrowthLab', logo: '🏢' },
            ].map((t, i) => (
              <div key={i} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'left' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{t.logo}</div>
                <p style={{ color: '#374151', fontSize: '1rem', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '1.5rem' }}>"{t.quote}"</p>
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{t.name}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '4rem 1rem', textAlign: 'center', color: 'white' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Ready to Transform Employee Healthcare?</h2>
          <p style={{ fontSize: '1.15rem', opacity: 0.85, marginBottom: '2rem' }}>Join companies already saving 30-40% on employee healthcare costs. Setup takes 5 minutes.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/corporate/register')} style={{ padding: '16px 40px', backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}>🚀 Register Now — Free</button>
            <a href="mailto:corporate@healthcarehub.com?subject=Corporate%20Healthcare%20Demo%20Request" style={{ padding: '16px 40px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '12px', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', textDecoration: 'none', display: 'inline-block' }}>📞 Request Demo</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CorporateHub;