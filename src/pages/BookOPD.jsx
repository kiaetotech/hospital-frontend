import React from 'react';

function BookOPD() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1 style={{ color: 'green' }}>Book OPD Page</h1>
      <p>This page is working!</p>
      <button onClick={() => window.location.href = '/hospitals'}>← Back to Hospitals</button>
    </div>
  );
}

export default BookOPD;