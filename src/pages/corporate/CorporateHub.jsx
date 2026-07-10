import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-8de3.up.railway.app';

const CorporateHub = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTag, setActiveTag] = useState('all');
  const [city, setCity] = useState('');
  const [minEmployees, setMinEmployees] = useState('');

  useEffect(() => {
    fetchStats();
    fetchPackages();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/corporate-hub/stats`);
      if (res.data?.success) setStats(res.data.data);
    } catch (err) {
      setStats({
        totalProviders: 0,
        breakdown: { hospitals: 0, onlineDoctors: 0, diagnostics: 0, mentalHealth: 0, ayurveda: 0, homeopathy: 0, caregivers: 0, ambulance: 0 }
      });
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
      if (res.data?.success) {
        setPackages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTagChange = (tag) => {
    setActiveTag(tag);
    fetchPackages(tag);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPackages(activeTag);
  };

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

  const formatPrice = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const getTagColor = (tag) => {
    const colors = {
      hospitals: 'bg-blue-100 text-blue-700',
      onlineDoctors: 'bg-green-100 text-green-700',
      diagnostics: 'bg-purple-100 text-purple-700',
      mentalHealth: 'bg-pink-100 text-pink-700',
      ayurveda: 'bg-orange-100 text-orange-700',
      homeopathy: 'bg-teal-100 text-teal-700',
      caregivers: 'bg-cyan-100 text-cyan-700',
      ambulance: 'bg-red-100 text-red-700',
    };
    return colors[tag] || 'bg-gray-100 text-gray-700';
  };

  const getTagLabel = (tag) => {
    const labels = {
      hospitals: 'Hospital',
      onlineDoctors: 'Online Doctor',
      diagnostics: 'Diagnostics',
      mentalHealth: 'Mental Wellness',
      ayurveda: 'Ayurveda',
      homeopathy: 'Homeopathy',
      caregivers: 'Home Care',
      ambulance: 'Ambulance',
    };
    return labels[tag] || tag;
  };

  // Loading state
  if (loading && packages.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#6b7280' }}>Loading corporate packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* ============================================
          HERO SECTION
      ============================================ */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        padding: '4rem 2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🏢</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Employee Healthcare, <span style={{ color: '#fbbf24' }}>Simplified</span>
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '650px', margin: '0 auto 1.5rem' }}>
          Give your employees access to 8 healthcare services — doctors, labs, mental wellness, 
          ayurveda & more at corporate-negotiated rates. Pay only for what your employees use.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/corporate/register')}
            style={{ padding: '12px 32px', backgroundColor: '#f59e0b', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            Register Your Company
          </button>
          <button
            onClick={() => document.getElementById('packages-section').scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '12px 32px', backgroundColor: 'transparent', border: '2px solid white', borderRadius: '8px', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            Browse Packages
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1.5rem',
            maxWidth: '800px',
            margin: '2rem auto 0'
          }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalProviders || 0}+</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Corporate-Ready Providers</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{(stats.breakdown?.hospitals || 0) + (stats.breakdown?.diagnostics || 0)}+</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Hospitals & Labs</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {(stats.breakdown?.mentalHealth || 0) + (stats.breakdown?.ayurveda || 0) + (stats.breakdown?.homeopathy || 0)}+
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Wellness Providers</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>8</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Service Categories</div>
            </div>
          </div>
        )}
      </section>

      {/* ============================================
          HOW IT WORKS
      ============================================ */}
      <section style={{ padding: '3rem 1rem', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2.5rem' }}>
            How It Works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            {[
              { step: '1', icon: '🔍', title: 'Browse', desc: 'Explore corporate packages from verified providers' },
              { step: '2', icon: '✅', title: 'Select', desc: 'Choose services your employees need' },
              { step: '3', icon: '💳', title: 'Load Wallet', desc: 'Add funds to your company wallet' },
              { step: '4', icon: '👨‍💼', title: 'Employees Book', desc: 'Employees access approved services' },
              { step: '5', icon: '📊', title: 'Pay Per Use', desc: 'Only pay for what gets used' },
            ].map((item, i) => (
              <div key={i}>
                <div style={{
                  width: '56px', height: '56px', backgroundColor: '#2563eb', color: 'white',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', margin: '0 auto 0.75rem'
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{item.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          PACKAGES SECTION
      ============================================ */}
      <section id="packages-section" style={{ padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.5rem' }}>
            Corporate Healthcare Packages
          </h2>
          <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '2rem' }}>
            Browse packages from verified providers across India
          </p>

          {/* Tag Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {tags.map((tag) => (
              <button
                key={tag.key}
                onClick={() => handleTagChange(tag.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '24px',
                  border: activeTag === tag.key ? '2px solid #2563eb' : '1px solid #d1d5db',
                  backgroundColor: activeTag === tag.key ? '#2563eb' : 'white',
                  color: activeTag === tag.key ? 'white' : '#374151',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: activeTag === tag.key ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                {tag.icon} {tag.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="City (e.g. Mumbai)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', width: '180px' }}
            />
            <input
              type="number"
              placeholder="Min Employees"
              value={minEmployees}
              onChange={(e) => setMinEmployees(e.target.value)}
              style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', width: '150px' }}
            />
            <button
              type="submit"
              style={{ padding: '8px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🔍 Filter
            </button>
          </form>

          {/* Packages Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
              <p style={{ color: '#6b7280' }}>Loading packages...</p>
            </div>
          ) : packages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📦</div>
              <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>No corporate packages found</p>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Try different filters or check back later</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    transition: 'box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'}
                >
                  {/* Tag + Discount Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      backgroundColor: getTagColor(pkg.tag).includes('blue') ? '#dbeafe' : 
                                       getTagColor(pkg.tag).includes('green') ? '#d1fae5' :
                                       getTagColor(pkg.tag).includes('purple') ? '#ede9fe' :
                                       getTagColor(pkg.tag).includes('pink') ? '#fce7f3' :
                                       getTagColor(pkg.tag).includes('orange') ? '#ffedd5' :
                                       getTagColor(pkg.tag).includes('teal') ? '#ccfbf1' :
                                       getTagColor(pkg.tag).includes('cyan') ? '#cffafe' :
                                       getTagColor(pkg.tag).includes('red') ? '#fee2e2' : '#f3f4f6',
                      color: getTagColor(pkg.tag).includes('blue') ? '#1e40af' :
                             getTagColor(pkg.tag).includes('green') ? '#065f46' :
                             getTagColor(pkg.tag).includes('purple') ? '#6b21a8' :
                             getTagColor(pkg.tag).includes('pink') ? '#9d174d' :
                             getTagColor(pkg.tag).includes('orange') ? '#9a3412' :
                             getTagColor(pkg.tag).includes('teal') ? '#115e59' :
                             getTagColor(pkg.tag).includes('cyan') ? '#155e75' :
                             getTagColor(pkg.tag).includes('red') ? '#991b1b' : '#374151'
                    }}>
                      {getTagLabel(pkg.tag)}
                    </span>
                    {pkg.discountedPricePerEmployee && (
                      <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {Math.round((1 - pkg.discountedPricePerEmployee / pkg.pricePerEmployee) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{pkg.packageName}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                    {pkg.description || 'Corporate healthcare package'}
                  </p>

                  {/* Price */}
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                      {formatPrice(pkg.discountedPricePerEmployee || pkg.pricePerEmployee)}
                    </span>
                    <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}> /employee</span>
                    {pkg.discountedPricePerEmployee && (
                      <span style={{ color: '#9ca3af', fontSize: '0.8rem', textDecoration: 'line-through', marginLeft: '0.5rem' }}>
                        {formatPrice(pkg.pricePerEmployee)}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <span>Provider:</span>
                      <span style={{ fontWeight: '500', color: '#374151' }}>{pkg.providerName}</span>
                    </div>
                    {pkg.providerCity && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>City:</span>
                        <span>{pkg.providerCity}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <span>Min Employees:</span>
                      <span>{pkg.minEmployees || 10}</span>
                    </div>
                    {pkg.sessionsPerEmployee && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>Sessions:</span>
                        <span>{pkg.sessionsPerEmployee}</span>
                      </div>
                    )}
                    {pkg.consultationLimitPerEmployee && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>Consults/Year:</span>
                        <span>{pkg.consultationLimitPerEmployee}</span>
                      </div>
                    )}
                  </div>

                  {/* Services Included */}
                  {pkg.servicesIncluded?.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>INCLUDES:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {pkg.servicesIncluded.slice(0, 4).map((s, i) => (
                          <span key={i} style={{ backgroundColor: '#f3f4f6', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', color: '#374151' }}>
                            {s}
                          </span>
                        ))}
                        {pkg.servicesIncluded.length > 4 && (
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>+{pkg.servicesIncluded.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => navigate('/corporate/register')}
                    style={{
                      width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white',
                      border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem'
                    }}
                  >
                    Enquire Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          WHY CHOOSE US
      ============================================ */}
      <section style={{ padding: '3rem 1rem', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '2rem' }}>
            Why Companies Choose Us
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            <div>
              <div style={{ fontSize: '2.5rem' }}>💰</div>
              <h3 style={{ fontWeight: 'bold', margin: '0.5rem 0' }}>Pay Per Use</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No wasted premiums. Pay only for services your employees actually use.</p>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem' }}>🏥</div>
              <h3 style={{ fontWeight: 'bold', margin: '0.5rem 0' }}>8 Services Unified</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>One platform for doctors, labs, mental health, ayurveda & more.</p>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem' }}>📊</div>
              <h3 style={{ fontWeight: 'bold', margin: '0.5rem 0' }}>Full Visibility</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Real-time dashboard tracks every booking and spend.</p>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem' }}>🔧</div>
              <h3 style={{ fontWeight: 'bold', margin: '0.5rem 0' }}>Flexible</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Add or remove employees anytime. No lock-in contracts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA
      ============================================ */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        padding: '3rem 1rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Ready to Give Your Employees Better Healthcare?
        </h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          Register your company today. Setup takes 5 minutes.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/corporate/register')}
            style={{ padding: '12px 32px', backgroundColor: '#f59e0b', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            Register Now
          </button>
          <button
            style={{ padding: '12px 32px', backgroundColor: 'transparent', border: '2px solid white', borderRadius: '8px', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            Talk to Us
          </button>
        </div>
      </section>
    </div>
  );
};

export default CorporateHub;