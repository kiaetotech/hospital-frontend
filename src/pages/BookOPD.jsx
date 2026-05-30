import React from 'react';
import { useParams } from 'react-router-dom';

const BookOPD = () => {
  const { id } = useParams();
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Book OPD Page</h2>
      <p>Hospital ID: {id}</p>
      <p>This page is working!</p>
    </div>
  );
};

export default BookOPD;