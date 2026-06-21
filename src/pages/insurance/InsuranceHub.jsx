import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const InsuranceHub = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featuredPlans, setFeaturedPlans] = useState([]);
  const [popularPlans, setPopularPlans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalPlans: 0,
    totalCompanies: 0,
    policiesIssued: 0,
    claimSettlementRate: 0
  });

  // Fetch data on load
  useEffect(() => {
    fetchInsuranceData();
  }, []);

  const fetchInsuranceData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured plans
      const featuredRes = await axios.get('/api/insurance/plans?isFeatured=true&limit=6');
      if (featuredRes.data.success) {
        setFeaturedPlans(featuredRes.data.data);
      }

      // Fetch popular plans
      const popularRes = await axios.get('/api/insurance/plans?limit=8&sort=popular');
      if (popularRes.data.success) {
        setPopularPlans(popularRes.data.data);
      }

      // Fetch stats
      const statsRes = await axios.get('/api/insurance/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

    } catch (error) {
      console.error('Error fetching insurance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/insurance/list?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handlePlanTypeClick = (typeId) => {
    if (typeId === 'all') {
      navigate('/insurance/list');
    } else {
      navigate(`/insurance/list?type=${typeId}`);
    }
  };

  // Plan types for filtering
  const planTypes = [
    { id: 'all', label: 'All Plans', icon: '📋' },
    { id: 'individual', label: 'Individual', icon: '👤' },
    { id: 'family_floater', label: 'Family Floater', icon: '👨‍👩‍👧‍👦' },
    { id: 'critical_illness', label: 'Critical Illness', icon: '❤️' },
    { id: 'senior_citizen', label: 'Senior Citizen', icon: '👴' },
    { id: 'maternity', label: 'Maternity', icon: '👶' }
  ];

  // Loading skeleton
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading insurance plans...</p>
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
        backgroundColor: '#1e3a5f', 
        padding: '4rem 2rem', 
        textAlign: 'center', 
        color: 'white' 
      }}>
        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🛡️</div>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Compare & Buy Health Insurance
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          opacity: 0.9, 
          maxWidth: '600px', 
          margin: '0 auto 2rem' 
        }}>
          Compare 50+ health insurance plans from top insurers. Get the best coverage at the lowest premium.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            borderRadius: '8px', 
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
          }}>
            <input
              type="text"
              placeholder="Search plans by name, coverage, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                flex: 1, 
                padding: '14px 20px', 
                border: 'none', 
                fontSize: '16px',
                outline: 'none'
              }}
            />
            <button 
              type="submit" 
              style={{ 
                padding: '14px 32px', 
                backgroundColor: '#f59e0b', 
                border: 'none', 
                color: 'white', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🔍 Search Plans
            </button>
          </div>
        </form>

        {/* Quick Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '1.5rem', 
          maxWidth: '900px', 
          margin: '2rem auto 0'
        }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalPlans || 50}+</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Insurance Plans</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalCompanies || 20}+</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Insurance Companies</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.policiesIssued || 10000}+</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Policies Issued</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.claimSettlementRate || 95}%</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Claim Settlement Ratio</div>
          </div>
        </div>
      </section>

      {/* ============================================
          PLAN TYPES QUICK ACCESS
          ============================================ */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '-2rem auto 2rem', 
        padding: '0 1rem'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '1rem'
        }}>
          {planTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => handlePlanTypeClick(type.id)}
              style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem 1rem', 
                borderRadius: '12px', 
                textAlign: 'center', 
                cursor: 'pointer', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ fontSize: '2rem' }}>{type.icon}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{type.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================
          FEATURED PLANS
          ============================================ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>⭐ Featured Plans</h2>
            <p style={{ color: '#6b7280' }}>Most popular and highly rated insurance plans</p>
          </div>
          <button 
            onClick={() => navigate('/insurance/list')} 
            style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            View All →
          </button>
        </div>

        {featuredPlans.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {featuredPlans.map((plan) => (
              <div key={plan._id} style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                padding: '1.5rem', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderTop: '4px solid #f59e0b',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{plan.companyId?.name || 'Insurance Company'}</div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: '4px 0' }}>{plan.planName}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                    <span>⭐</span>
                    <span>{plan.rating || 0}</span>
                  </div>
                </div>
                
                <div style={{ margin: '12px 0' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>₹{plan.basePremium?.toLocaleString()}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>per year incl. GST</div>
                </div>

                <div style={{ margin: '8px 0', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {(plan.features || []).slice(0, 3).map((feature, idx) => (
                    <span key={idx} style={{ 
                      fontSize: '0.7rem', 
                      backgroundColor: '#f3f4f6', 
                      padding: '2px 10px', 
                      borderRadius: '12px',
                      color: '#4b5563'
                    }}>
                      ✅ {typeof feature === 'string' ? feature : feature.title}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button 
                    onClick={() => navigate(`/insurance/plan/${plan._id}`)} 
                    style={{ 
                      flex: 1, 
                      padding: '10px', 
                      backgroundColor: '#2563eb', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => navigate(`/insurance/apply/${plan._id}`)} 
                    style={{ 
                      flex: 1, 
                      padding: '10px', 
                      backgroundColor: '#f59e0b', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '12px' }}>
            <p style={{ color: '#6b7280' }}>No featured plans available</p>
          </div>
        )}
      </section>

      {/* ============================================
          WHY CHOOSE US
          ============================================ */}
      <section style={{ backgroundColor: 'white', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem' }}>
            Why Choose Our Insurance Marketplace?
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem' }}>🛡️</div>
              <h3 style={{ fontWeight: 'bold', margin: '0.5rem 0' }}>Trusted Platform</h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Compare plans from 20+ IRDAI approved insurance companies</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem' }}>💰</div>
              <h3 style={{ fontWeight: 'bold', margin: '0.5rem 0' }}>Best Prices</h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Get the lowest premiums with exclusive online discounts</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem' }}>⏱️</div>
              <h3 style={{ fontWeight: 'bold', margin: '0.5rem 0' }}>Quick Process</h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Get policy issued in minutes. No medical tests required</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem' }}>🏆</div>
              <h3 style={{ fontWeight: 'bold', margin: '0.5rem 0' }}>Expert Support</h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Dedicated claims assistance and 24/7 customer support</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section style={{ 
        backgroundColor: '#1e3a5f', 
        padding: '3rem 1rem', 
        textAlign: 'center', 
        color: 'white'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Ready to Protect Your Health?
        </h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          Get the best health insurance plan tailored to your needs. Compare, choose, and buy in minutes.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/insurance/list')} 
            style={{ 
              padding: '12px 32px', 
              backgroundColor: '#f59e0b', 
              border: 'none', 
              borderRadius: '8px', 
              color: 'white', 
              fontWeight: 'bold', 
              fontSize: '16px', 
              cursor: 'pointer'
            }}
          >
            Compare Plans Now
          </button>
          <button 
            onClick={() => navigate('/insurance/list')} 
            style={{ 
              padding: '12px 32px', 
              backgroundColor: 'transparent', 
              border: '2px solid white', 
              borderRadius: '8px', 
              color: 'white', 
              fontWeight: 'bold', 
              fontSize: '16px', 
              cursor: 'pointer'
            }}
          >
            Explore All Plans
          </button>
        </div>
      </section>
    </div>
  );
};

export default InsuranceHub;