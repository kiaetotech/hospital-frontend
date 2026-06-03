import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DiagnosticsList = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/diagnostics/tests')
      .then(res => {
        if (res.data && res.data.data) setTests(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleComparePrices = (testId, testName) => {
    navigate(`/diagnostics-compare-providers?testId=${testId}&testName=${encodeURIComponent(testName)}`);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🔬 Diagnostics - Lab Tests</h1>
      <p>Click "Compare Prices" to see which lab offers the best price for each test.</p>
      
      {tests.map(test => (
        <div key={test._id} style={{ border: '1px solid #ccc', margin: '0.5rem 0', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', borderRadius: '8px' }}>
          <div>
            <strong>{test.test_name}</strong>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{test.major_category_name}</p>
          </div>
          <button
            onClick={() => handleComparePrices(test._id, test.test_name)}
            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Compare Prices
          </button>
        </div>
      ))}
    </div>
  );
};

export default DiagnosticsList;