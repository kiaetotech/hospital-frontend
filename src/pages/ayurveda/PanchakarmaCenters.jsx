// Location: D:\hospital-frontend\src\pages\ayurveda\PanchakarmaCenters.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const centers = [
  { id: 'AYC001', name: 'AyurVeda Retreat', location: 'Rishikesh, Uttarakhand', rating: 4.9, packages: ['7-Day Panchakarma (₹25,000)', '14-Day Rejuvenation (₹45,000)'], facilities: ['AC Rooms', 'Organic Food', 'Yoga Hall'] },
  { id: 'AYC002', name: 'Kerala Ayurveda Kendra', location: 'Kochi, Kerala', rating: 4.8, packages: ['5-Day Detox (₹18,000)', '10-Day Panchakarma (₹35,000)'], facilities: ['Traditional Therapies', 'Beach Proximity', 'Organic Meals'] },
];

const PanchakarmaCenters = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>🏨 Panchakarma Centers</h1>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {centers.map(center => (
          <div key={center.id} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>{center.name}</h2>
            <p style={{ color: '#64748b' }}>📍 {center.location} | ⭐ {center.rating}</p>
            <div style={{ marginTop: '1rem' }}>
              <strong>Packages:</strong>
              <ul>{center.packages.map((pkg, i) => <li key={i}>{pkg}</li>)}</ul>
            </div>
            <button onClick={() => navigate(`/ayurveda/center/${center.id}`)} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
              View Details →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PanchakarmaCenters;