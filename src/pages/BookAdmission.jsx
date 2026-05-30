import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BookAdmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h2>Book Admission</h2>
      <p>Hospital ID: {id}</p>
      <button 
        onClick={() => navigate('/hospitals')} 
        style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        ← Back to Hospitals
      </button>
    </div>
  );
};

export default BookAdmission;