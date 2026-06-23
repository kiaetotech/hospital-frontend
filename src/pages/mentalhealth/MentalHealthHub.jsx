import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MentalHealthHub = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featuredTherapists, setFeaturedTherapists] = useState([]);
  const [stats, setStats] = useState({
    totalTherapists: 0,
    totalSessions: 0,
    satisfactionRate: 0,
    averageResponseTime: '24 hours'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [featuredRes, statsRes] = await Promise.all([
        axios.get('/api/mentalhealth/therapists/featured'),
        axios.get('/api/mentalhealth/stats')
      ]);

      if (featuredRes.data.success) setFeaturedTherapists(featuredRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScreening = (type) => {
    navigate(`/mentalhealth/screening/${type}`);
  };

  const handleTherapistSearch = () => {
    navigate('/mentalhealth/therapists');
  };

  const handleEmergency = () => {
    navigate('/mentalhealth/crisis');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #4A90D9 0%, #357ABD 100%)',
        padding: '4rem 2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🧠</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Mental Health & Counseling
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          Professional, confidential support for your mental well-being. 
          Talk to licensed therapists from the comfort of your home.
        </p>
        
        {/* Emergency Button */}
        <button
          onClick={handleEmergency}
          style={{
            padding: '12px 32px',
            backgroundColor: '#dc2626',
            border: 'none',
            borderRadius: '50px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: 'pointer',
            marginTop: '1rem',
            animation: 'pulse 2s infinite'
          }}
        >
          🆘 Crisis Support
        </button>
      </section>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        maxWidth: '1000px',
        margin: '-2rem auto 2rem',
        padding: '0 1rem'
      }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4A90D9' }}>{stats.totalTherapists}+</div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Licensed Therapists</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4A90D9' }}>{stats.totalSessions}+</div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Sessions Completed</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.satisfactionRate}%</div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Satisfaction Rate</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.averageResponseTime}</div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Avg Response Time</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {[
            { icon: '🔍', label: 'Find a Therapist', action: handleTherapistSearch, color: '#4A90D9' },
            { icon: '📋', label: 'Depression Screening', action: () => handleScreening('depression'), color: '#8b5cf6' },
            { icon: '📋', label: 'Anxiety Screening', action: () => handleScreening('anxiety'), color: '#10b981' },
            { icon: '💬', label: 'Anonymous Chat', action: () => navigate('/mentalhealth/chat'), color: '#f59e0b' },
            { icon: '📝', label: 'Journal', action: () => navigate('/mentalhealth/journal'), color: '#06b6d4' },
            { icon: '🏢', label: 'Corporate EAP', action: () => navigate('/mentalhealth/corporate'), color: '#1e3a5f' },
          ].map((item) => (
            <div
              key={item.label}
              onClick={item.action}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderTop: `4px solid ${item.color}`,
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
              <div style={{ fontWeight: 'bold' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Featured Therapists */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>⭐ Featured Therapists</h2>
        {loading ? (
          <p>Loading...</p>
        ) : featuredTherapists.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No featured therapists available</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {featuredTherapists.map((therapist) => (
              <div
                key={therapist._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    👤
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 'bold' }}>{therapist.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      {therapist.specializations?.slice(0, 2).join(', ')}
                    </p>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                    ⭐ {therapist.rating || 0}
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                  {therapist.experience} years experience • {therapist.languages?.join(', ')}
                </p>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '0.75rem' }}>
                  ₹{therapist.pricing?.consultation || 500}/session
                </div>
                <button
                  onClick={() => navigate(`/mentalhealth/therapist/${therapist._id}`)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#4A90D9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default MentalHealthHub;