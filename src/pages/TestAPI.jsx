import React, { useEffect, useState } from 'react';
import api from '../services/api';

const TestAPI = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/diagnostics/tests')
      .then(res => {
        console.log('Success:', res.data);
        setData(res.data);
      })
      .catch(err => {
        console.error('Error:', err);
        setError(err.message);
      });
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>API Test Page</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  );
};

export default TestAPI;