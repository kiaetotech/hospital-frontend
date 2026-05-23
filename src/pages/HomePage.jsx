import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const serviceTags = [
    { name: 'Hospitals', path: '/hospitals', desc: 'Compare price, rating, beds & insurance' },
    { name: 'Ambulance', path: '/ambulance', desc: 'Live tracking, instant ETA' },
    { name: 'Health Insurance', path: '/insurance', desc: 'Compare plans & buy online' },
    { name: 'Lab Tests', path: '/lab-tests', desc: 'Price, home collection, reports' },
    { name: 'Preventive', path: '/preventive', desc: 'Full body, cardiac, wellness' },
    { name: 'Caregiver', path: '/caregivers', desc: 'Elder care, nursing at home' },
    { name: 'Health EMI', path: '/financing', desc: 'No‑cost EMI for treatments' },
    { name: 'Online Doctor', path: '/teleconsult', desc: 'Video consult, prescription' },
    { name: 'Corporate', path: '/corporate', desc: 'Employee wellness plans' },
  ];

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #0f3b5c 0%, #1e7e6c 100%)', color: 'white', padding: '4rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Compare & book healthcare services<br />all in one place</h1>
        <p style={{ marginTop: '1rem', opacity: 0.9 }}>Hospitals, ambulances, lab tests, insurance, caregivers – transparent comparison, real patient reviews, instant booking.</p>
      </div>
     
      <div style={{ padding: '3rem 2rem', backgroundColor: '#f8fafc', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>Healthcare services at your fingertips</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Compare, choose, book – all in minutes</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', maxWidth: '1200px', margin: '2rem auto' }}>
          {serviceTags.map((tag, idx) => (
            <div key={idx} onClick={() => navigate(tag.path)} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.2s' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{tag.name}</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{tag.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;