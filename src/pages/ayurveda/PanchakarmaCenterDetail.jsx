// Location: D:\hospital-frontend\src\pages\ayurveda\PanchakarmaCenterDetail.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

const PanchakarmaCenterDetail = () => {
  const { id } = useParams();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>🏨 Center Details</h1>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <p style={{ color: '#64748b' }}>Center ID: {id}</p>
        <p>Full center details coming soon...</p>
      </div>
    </div>
  );
};

export default PanchakarmaCenterDetail;