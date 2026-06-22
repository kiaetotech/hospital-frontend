import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [emergencyQuery, setEmergencyQuery] = useState('');

  const handleEmergencySearch = (e) => {
    e.preventDefault();
    if (emergencyQuery.trim()) {
      navigate(`/hospitals?q=${encodeURIComponent(emergencyQuery)}`);
    }
  };

  const serviceTags = [
    { 
      name: 'Hospitals', 
      path: '/hospitals', 
      desc: 'Compare price, rating, beds & insurance' 
    },
    { 
      name: 'Ambulance', 
      path: '/ambulance', 
      desc: 'Live tracking, instant ETA' 
    },
    { 
      name: 'Health Insurance', 
      path: '/insurance', 
      desc: 'Compare plans & buy online',
      isNew: true,
      isInsurance: true
    },
    { 
      name: 'Homeopathy & Naturopathy', 
      path: '/homeopathy', 
      desc: 'Homeopathy doctors • Naturopathy • Natural remedies',
      isNew: true 
    },
    { 
      name: 'Ayurveda & Wellness Hub', 
      path: '/ayurveda', 
      desc: 'Ancient healing, modern access • Doctors • Panchakarma • Prakriti',
      isNew: true 
    },
    { 
      name: 'Caregiver', 
      path: '/caregivers', 
      desc: 'Elder care, nursing at home' 
    },
    { 
      name: 'Health EMI', 
      path: '/financing', 
      desc: 'No‑cost EMI for treatments' 
    },
    { 
      name: 'Online Doctor', 
      path: '/teleconsult', 
      desc: 'Video consult, prescription' 
    },
    { 
      name: 'Corporate Health & Insurance', 
      path: '/corporate', 
      desc: 'Group Insurance • Wellness • Checkups',
      isNew: true,
      isCorporate: true 
    },
    { 
      name: 'Diagnostics', 
      path: '/diagnostics', 
      desc: 'Lab tests & health checkups' 
    },
  ];

  return (
    <div>
      {/* Emergency Section */}
      <div style={{ backgroundColor: '#dc2626', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>🚨 Emergency? Need Help Now?</h1>
        <p style={{ color: 'white', marginTop: '0.5rem' }}>Type your disease or symptom – we'll find the nearest hospital</p>
        <form onSubmit={handleEmergencySearch} style={{ marginTop: '1rem' }}>
          <input
            type="text"
            placeholder="Type disease or symptom (e.g., 'heart attack', 'chest pain', 'fever')"
            value={emergencyQuery}
            onChange={(e) => setEmergencyQuery(e.target.value)}
            style={{ width: '60%', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontSize: '1rem' }}
          />
          <button type="submit" style={{ marginLeft: '0.5rem', backgroundColor: 'white', color: '#dc2626', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            🚨 Find Help Now
          </button>
        </form>
      </div>

      {/* 10 Service Tags */}
      <div style={{ padding: '3rem 2rem', backgroundColor: '#f8fafc', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>Healthcare services at your fingertips</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Compare, choose, book – all in minutes</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', maxWidth: '1200px', margin: '2rem auto' }}>
          {serviceTags.map((tag, idx) => (
            <div 
              key={idx} 
              onClick={() => navigate(tag.path)} 
              style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '1rem', 
                boxShadow: tag.isInsurance ? '0 4px 12px rgba(37, 99, 235, 0.3)' : '0 4px 6px rgba(0,0,0,0.1)', 
                cursor: 'pointer', 
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative',
                border: tag.isInsurance ? '2px solid #2563eb' : (tag.isNew ? '2px solid #4CAF50' : 'none'),
                transform: tag.isCorporate ? 'scale(1.02)' : (tag.isInsurance ? 'scale(1.02)' : 'scale(1)')
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = tag.isInsurance || tag.isCorporate ? '0 8px 24px rgba(37, 99, 235, 0.4)' : '0 8px 16px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = tag.isInsurance || tag.isCorporate ? 'scale(1.02)' : 'translateY(0)';
                e.currentTarget.style.boxShadow = tag.isInsurance ? '0 4px 12px rgba(37, 99, 235, 0.3)' : (tag.isCorporate ? '0 4px 12px rgba(30, 58, 95, 0.3)' : '0 4px 6px rgba(0,0,0,0.1)');
              }}
            >
              {/* NEW Badge */}
              {tag.isNew && (
                <span style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  backgroundColor: tag.isInsurance ? '#2563eb' : (tag.isCorporate ? '#1e3a5f' : '#4CAF50'),
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  animation: 'pulse 2s infinite'
                }}>
                  {tag.isInsurance ? '🛡️ LIVE' : (tag.isCorporate ? '🏢 LIVE' : '🆕 NEW')}
                </span>
              )}

              {/* Corporate or Insurance Icon */}
              {(tag.isInsurance || tag.isCorporate) && (
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: tag.isInsurance ? '#2563eb' : '#1e3a5f',
                  color: 'white',
                  padding: '2px 16px',
                  borderRadius: '20px',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
                  {tag.isInsurance ? '⭐ Trusted' : '🏢 For Companies'}
                </div>
              )}

              {/* Tag Name with Icon */}
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem', 
                color: tag.isInsurance ? '#2563eb' : (tag.isCorporate ? '#1e3a5f' : (tag.isNew ? '#4CAF50' : '#1e293b')),
                marginTop: (tag.isInsurance || tag.isCorporate) ? '8px' : '0'
              }}>
                {tag.isInsurance && '🛡️ '}
                {tag.isCorporate && '🏢 '}
                {tag.isNew && !tag.isInsurance && !tag.isCorporate && '🌿 '}
                {tag.name}
              </h3>

              {/* Description */}
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{tag.desc}</p>

              {/* Insurance-specific badge */}
              {tag.isInsurance && (
                <div style={{
                  marginTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    fontSize: '0.6rem',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    Compare Plans
                  </span>
                  <span style={{
                    fontSize: '0.6rem',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    Best Price
                  </span>
                  <span style={{
                    fontSize: '0.6rem',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    Instant Policy
                  </span>
                </div>
              )}

              {/* Corporate-specific badge */}
              {tag.isCorporate && (
                <div style={{
                  marginTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    fontSize: '0.6rem',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    Group Insurance
                  </span>
                  <span style={{
                    fontSize: '0.6rem',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    Wellness
                  </span>
                  <span style={{
                    fontSize: '0.6rem',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    HR Dashboard
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animation for pulse effect */}
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

export default HomePage;