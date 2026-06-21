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
    { name: 'Hospitals', path: '/hospitals', desc: 'Compare price, rating, beds & insurance' },
    { name: 'Ambulance', path: '/ambulance', desc: 'Live tracking, instant ETA' },
    { name: 'Health Insurance', path: '/insurance', desc: 'Compare plans & buy online' },
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
    { name: 'Caregiver', path: '/caregivers', desc: 'Elder care, nursing at home' },
    { name: 'Health EMI', path: '/financing', desc: 'No‑cost EMI for treatments' },
    { name: 'Online Doctor', path: '/teleconsult', desc: 'Video consult, prescription' },
    { name: 'Corporate', path: '/corporate', desc: 'Employee wellness plans' },
    { name: 'Diagnostics', path: '/diagnostics', desc: 'Lab tests & health checkups' },
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
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
                cursor: 'pointer', 
                transition: 'transform 0.2s',
                position: 'relative',
                border: tag.isNew ? '2px solid #4CAF50' : 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {tag.isNew && (
                <span style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  🆕 NEW
                </span>
              )}
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: tag.isNew ? '#4CAF50' : '#1e293b' }}>
                {tag.isNew && '🌿 '}{tag.name}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{tag.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;