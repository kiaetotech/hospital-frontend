import React from 'react';

const Ambulance = () => {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1 style={{ color: 'green' }}>Ambulance Page</h1>
      <p>This page is working!</p>
      <button onClick={() => window.location.href = '/#/hospitals'}>
        Back to Hospitals
      </button>
    </div>
  );
};

export default Ambulance;