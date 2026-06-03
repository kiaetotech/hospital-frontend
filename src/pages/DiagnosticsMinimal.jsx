import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DiagnosticsMinimal = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    api.get('/diagnostics/tests')
      .then(res => {
        console.log('API Response:', res.data);
        if (res.data && res.data.data) {
          setTests(res.data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else if (selected.length < 4) {
      setSelected([...selected, id]);
    } else {
      alert('You can compare up to 4 tests');
    }
  };

  const handleCompare = () => {
    if (selected.length < 2) {
      alert('Please select at least 2 tests to compare');
      return;
    }
    const ids = selected.join(',');
    window.location.href = `/diagnostics-compare-minimal?ids=${ids}`;
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🔬 Diagnostics - Lab Tests</h1>
      <p>Total tests available: {tests.length}</p>
      
      {selected.length >= 2 && (
        <button 
          onClick={handleCompare} 
          style={{ marginBottom: '1rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
        >
          Compare Selected ({selected.length})
        </button>
      )}
      
      <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
        {tests.map(test => (
          <div key={test._id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="checkbox"
              checked={selected.includes(test._id)}
              onChange={() => toggleSelect(test._id)}
            />
            <div>
              <strong>{test.test_name}</strong>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{test.major_category_name}</p>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold', color: '#10b981' }}>₹{Math.round((test.min_price || test.price || 0) * 0.9)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiagnosticsMinimal;