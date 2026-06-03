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

  const handleCustomPackage = () => {
    navigate('/diagnostics-custom-package');
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header with two buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>🔬 Diagnostics - Lab Tests</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleCustomPackage}
            style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            ✨ Build Custom Package
          </button>
        </div>
      </div>
      
      <p style={{ marginBottom: '1rem' }}>Click "Compare Prices" to see which lab offers the best price for each test.</p>
      
      {tests.map(test => (
        <div key={test._id} style={{ border: '1px solid #ccc', margin: '0.5rem 0', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', borderRadius: '8px' }}>
          <div>
            <strong>{test.test_name}</strong>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{test.major_category_name}</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#10b981' }}>Starting from ₹{Math.round((test.min_price || test.price || 0) * 0.9)}</p>
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