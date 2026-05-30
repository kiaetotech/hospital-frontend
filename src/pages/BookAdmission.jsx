import React from 'react';
import { useParams } from 'react-router-dom';

const BookAdmission = () => {
  const { id } = useParams();
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Book Admission Page</h2>
      <p>Hospital ID: {id}</p>
      <p>This page is working!</p>
    </div>
  );
};

export default BookAdmission;