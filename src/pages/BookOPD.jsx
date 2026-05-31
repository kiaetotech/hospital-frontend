import React from 'react';

const BookOPD = () => {
  // Get the hospital ID from the URL
  const path = window.location.hash;
  const id = path.split('/')[2] || 'unknown';
  
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Book OPD Consultation</h1>
      <p>Hospital ID: {id}</p>
      <button 
        onClick={() => window.location.href = '/#/hospitals'}
        style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        ← Back to Hospitals
      </button>
    </div>
  );
};

export default BookOPD;