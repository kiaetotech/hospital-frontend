import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DiagnosticsList = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTests, setSelectedTests] = useState([]);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/diagnostics/tests');
      if (res.data && res.data.data) {
        setTests(res.data.data);
      }
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (testId) => {
    if (selectedTests.includes(testId)) {
      setSelectedTests(selectedTests.filter(id => id !== testId));
    } else if (selectedTests.length < 4) {
      setSelectedTests([...selectedTests, testId]);
    } else {
      alert('You can compare up to 4 tests');
    }
  };

  const handleCompare = () => {
    if (selectedTests.length < 2) {
      alert('Please select at least 2 tests to compare');
      return;
    }
    // Pass IDs as query parameter
    navigate(`/diagnostics-compare-result?ids=${selectedTests.join(',')}`);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>🔬 Diagnostics - Lab Tests</h1>
      
      {selectedTests.length >= 2 && (
        <button
          onClick={handleCompare}
          style={{
            marginBottom: '1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Compare Selected ({selectedTests.length})
        </button>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {tests.map(test => {
          const price = test.min_price || test.price || 0;
          const discounted = Math.round(price * 0.9);
          return (
            <div
              key={test._id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1rem',
                backgroundColor: selectedTests.includes(test._id) ? '#d1fae5' : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <input
                type="checkbox"
                checked={selectedTests.includes(test._id)}
                onChange={() => toggleSelect(test._id)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '1rem' }}>{test.test_name}</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>{test.major_category_name}</p>
                <div style={{ marginTop: '4px' }}>
                  <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{price}</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold', marginLeft: '0.5rem' }}>₹{discounted}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiagnosticsList;