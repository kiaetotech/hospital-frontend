import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFeaturedDoctors } from '../../services/ayurvedaApi';

const AyurvedaHub = () => {
  const navigate = useNavigate();
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await getFeaturedDoctors();
        setFeaturedDoctors(response.data || []);
      } catch (error) {
        // Use dummy data if API fails
        setFeaturedDoctors([
          { _id: 'AYD001', name: 'Dr. Rajesh Sharma', specialization: 'Panchakarma Specialist', experience: '15 years', rating: 4.8, consultationFee: 500, available: true },
          { _id: 'AYD002', name: 'Dr. Priya Gupta', specialization: 'Ayurvedic Physician', experience: '12 years', rating: 4.9, consultationFee: 400, available: true },
          { _id: 'AYD003', name: 'Dr. Amit Verma', specialization: 'Kerala Ayurveda Expert', experience: '20 years', rating: 4.7, consultationFee: 600, available: false },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const services = [
    {
      id: 'doctors',
      icon: '📞',
      title: 'Online Ayurvedic Consultation',
      subtitle: 'Consult verified Ayurvedic doctors',
      description: 'Video consultation with AYUSH-registered practitioners. Get personalized diet, lifestyle & treatment plans.',
      route: '/ayurveda/doctors',
      color: '#FF9800',
      stats: '50+ Doctors',
      cta: 'Find Doctor'
    },
    {
      id: 'centers',
      icon: '🏨',
      title: 'Panchakarma Centers',
      subtitle: 'Book authentic detox programs',
      description: 'Discover certified Panchakarma centers. Compare packages, pricing & book residential detox programs.',
      route: '/ayurveda/centers',
      color: '#2196F3',
      stats: '25+ Centers',
      cta: 'Explore Centers'
    },
    {
      id: 'prakriti',
      icon: '🧬',
      title: 'AI Prakriti Analysis',
      subtitle: 'Know your body constitution',
      description: '15-question AI-powered quiz to discover your Dosha (Vata/Pitta/Kapha). Free personalized wellness report.',
      route: '/ayurveda/prakriti',
      color: '#9C27B0',
      isFree: true,
      stats: '2 min quiz',
      cta: 'Start Free Quiz'
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        borderRadius: '1rem',
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          🕉️ Ayurveda & Wellness Hub
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
          Ancient wisdom meets modern healthcare — Your journey to holistic wellness starts here
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/ayurveda/prakriti')}
            style={{
              backgroundColor: 'white',
              color: '#2E7D32',
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            🧬 Start Free Prakriti Analysis
          </button>
          <button 
            onClick={() => navigate('/ayurveda/doctors')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              border: '2px solid white',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            📞 Consult Doctor Now
          </button>
        </div>
      </div>

      {/* 3 Main Services */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {services.map(service => (
          <div
            key={service.id}
            onClick={() => navigate(service.route)}
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderTop: `4px solid ${service.color}`,
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            {service.isFree && (
              <span style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                FREE
              </span>
            )}
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{service.icon}</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: service.color }}>
              {service.title}
            </h3>
            <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {service.subtitle}
            </p>
            <p style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              {service.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{service.stats}</span>
              <button style={{
                backgroundColor: service.color,
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                {service.cta} →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Doctors Section */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b' }}>
          👨‍⚕️ Featured Ayurvedic Doctors
        </h2>
        {loading ? (
          <p>Loading featured doctors...</p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {featuredDoctors.slice(0, 3).map(doctor => (
              <div
                key={doctor._id}
                onClick={() => navigate(`/ayurveda/doctor/${doctor._id}`)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  transition: 'box-shadow 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#e8f5e9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                  }}>
                    👨‍⚕️
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 'bold', color: '#1e293b' }}>{doctor.name}</h3>
                    <p style={{ color: '#4CAF50', fontSize: '0.875rem' }}>{doctor.specialization}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: '#64748b' }}>⭐ {doctor.rating}</span>
                  <span style={{ color: '#64748b' }}>📅 {doctor.experience}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: '#1e293b' }}>₹{doctor.consultationFee}/consult</span>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem',
                    backgroundColor: doctor.available ? '#e8f5e9' : '#fff3e0',
                    color: doctor.available ? '#2E7D32' : '#E65100'
                  }}>
                    {doctor.available ? '🟢 Available' : '🟡 Busy'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Why Ayurveda Section */}
      <div style={{
        backgroundColor: '#f0fdf4',
        borderRadius: '1rem',
        padding: '3rem 2rem',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '2rem' }}>
          🌿 Why Choose Our Ayurveda Platform?
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '2rem',
          textAlign: 'center'
        }}>
          {[
            { icon: '✅', title: 'Verified Doctors', desc: 'All practitioners are AYUSH-registered & verified' },
            { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden charges. Pay only consultation fee' },
            { icon: '🔒', title: 'Secure Platform', desc: 'Your health data is encrypted & private' },
            { icon: '🎯', title: 'Personalized Care', desc: 'AI-powered Prakriti analysis for tailored treatment' }
          ].map((item, idx) => (
            <div key={idx}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e293b' }}>{item.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AyurvedaHub;