import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CorporateHub = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [checkupPackages, setCheckupPackages] = useState([]);
  const [stats, setStats] = useState({
    companiesServed: 0,
    employeesCovered: 0,
    plansAvailable: 0,
    satisfactionRate: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch corporate insurance plans
      const plansRes = await axios.get('/api/corporate/plans?limit=4');
      if (plansRes.data.success) setPlans(plansRes.data.data);

      // Fetch corporate health checkup packages
      const checkupRes = await axios.get('/api/diagnostics/packages?type=corporate&limit=4');
      if (checkupRes.data.success) setCheckupPackages(checkupRes.data.data);

      // Fetch stats
      const statsRes = await axios.get('/api/corporate/stats');
      if (statsRes.data.success) setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching corporate data:', error);
      // Set fallback stats
      setStats({
        companiesServed: 150,
        employeesCovered: 12500,
        plansAvailable: 25,
        satisfactionRate: 96
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const sections = [
    {
      id: 'insurance',
      icon: '🛡️',
      title: 'Group Health Insurance',
      description: 'Customizable insurance plans for 10+ employees. Save up to 25% on group premiums.',
      path: '/corporate/plans',
      color: '#2563eb'
    },
    {
      id: 'checkups',
      icon: '🏥',
      title: 'Corporate Health Checkups',
      description: 'Bulk diagnostic packages for your entire team. Preventive health screening.',
      path: '/corporate/checkups',
      color: '#10b981'
    },
    {
      id: 'wellness',
      icon: '🌿',
      title: 'Employee Wellness Programs',
      description: 'Ayurveda, Homeopathy, Mental Health, and Stress Management for your employees.',
      path: '/corporate/wellness',
      color: '#8b5cf6'
    },
    {
      id: 'hr',
      icon: '📊',
      title: 'HR Dashboard',
      description: 'Manage employee enrollment, track claims, and generate reports.',
      path: '/corporate/hr/dashboard',
      color: '#f59e0b'
    }
  ];

  // Loading skeleton
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading corporate benefits...</div>
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
          Corporate Health & Insurance
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          Employee health insurance, wellness programs, and corporate health checkups — all in one place.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/corporate/plans')}
            style={{ padding: '12px 32px', backgroundColor: '#f59e0b', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            View Insurance Plans →
          </button>
          <button
            onClick={() => navigate('/corporate/enroll')}
            style={{ padding: '12px 32px', backgroundColor: 'transparent', border: '2px solid white', borderRadius: '8px', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            Enroll Your Company
          </button>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '2rem',
          maxWidth: '800px',
          margin: '2rem auto 0'
        }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.companiesServed}+</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Companies Served</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.employeesCovered.toLocaleString()}+</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Employees Covered</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.plansAvailable}+</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Plans Available</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.satisfactionRate}%</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTIONS GRID
          ============================================ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem' }}>
          Complete Employee Health Benefits
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => {
                if (section.id === 'hr') {
                  const token = localStorage.getItem('corporateToken');
                  if (!token) {
                    navigate('/corporate/hr/login');
                  } else {
                    navigate(section.path);
                  }
                } else {
                  navigate(section.path);
                }
              }}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                borderTop: `4px solid ${section.color}`,
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{ fontSize: '2.5rem' }}>{section.icon}</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: '0.75rem 0' }}>{section.title}</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{section.description}</p>
              <button style={{ marginTop: '1rem', color: section.color, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                Learn More →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================
          FEATURED INSURANCE PLANS
          ============================================ */}
      {plans.length > 0 && (
        <section style={{ backgroundColor: 'white', padding: '3rem 1rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🛡️ Popular Group Plans</h2>
                <p style={{ color: '#6b7280' }}>Most trusted by companies like yours</p>
              </div>
              <button
                onClick={() => navigate('/corporate/plans')}
                style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                View All →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <h4 style={{ fontWeight: 'bold' }}>{plan.planName}</h4>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{plan.companyName}</p>
                  <div style={{ margin: '12px 0' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
                      {formatCurrency(plan.premiumPerEmployee)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>per employee/year</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6b7280' }}>
                    <span>👥 {plan.employeeCount || 10}+ employees</span>
                    <span>🏥 {plan.coverageAmount ? formatCurrency(plan.coverageAmount) : 'Custom'}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/corporate/plan/${plan._id}`)}
                    style={{ width: '100%', marginTop: '1rem', padding: '8px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          WHY CORPORATE HEALTH
          ============================================ */}
      <section style={{ padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '2rem' }}>
            Why Choose Corporate Health & Insurance?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div>
              <div style={{ fontSize: '2.5rem' }}>💰</div>
              <h3 style={{ fontWeight: 'bold', margin: '0.5rem 0' }}>Save 25%</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Volume discounts on group premiums</p>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem' }}>👨‍👩‍👧‍👦</div>
              <h3 style={{ fontWeight: 'bold', margin: '0.5rem 0' }}>Family Coverage</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Cover employees and dependents</p>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem' }}>🏥</div>
              <h3 style={{ fontWeight: 'bold', margin: '0.5rem 0' }}>10,000+ Hospitals</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Cashless treatment across India</p>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem' }}>📊</div>
              <h3 style={{ fontWeight: 'bold', margin: '0.5rem 0' }}>HR Dashboard</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Manage everything in one place</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA
          ============================================ */}
      <section style={{
        backgroundColor: '#1e3a5f',
        padding: '3rem 1rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Ready to Enroll Your Company?
        </h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          Get started with corporate health benefits for your employees today.
        </p>
        <button
          onClick={() => navigate('/corporate/enroll')}
          style={{ padding: '12px 32px', backgroundColor: '#f59e0b', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
        >
          Enroll Now →
        </button>
      </section>
    </div>
  );
};

export default CorporateHub;