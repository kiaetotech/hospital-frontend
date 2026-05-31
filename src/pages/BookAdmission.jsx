import React from 'react';

function BookAdmission() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1 style={{ color: 'green' }}>Book Admission Page</h1>
      <p>This page is working!</p>
      <button onClick={() => window.location.href = '/hospitals'}>← Back to Hospitals</button>
    </div>
  );
}

export default BookAdmission;