import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DiagnosticsList = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTests, setSelectedTests] = useState([]);

  useEffect(() => {
    api.get('/diagnostics/tests')
      .then(res => {
        if (res.data && res.data.data) setTests(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
      alert('Please select at least 2 tests');
      return;
    }
    navigate(`/diagnostics-compare-result?ids=${selectedTests.join(',')}`);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🔬 Diagnostics - Lab Tests</h1>
      {selectedTests.length >= 2 && (
        <button onClick={handleCompare} style={{ marginBottom: '1rem', backgroundColor: 'blue', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Compare Selected ({selectedTests.length})
        </button>
      )}
      {tests.map(test => (
        <div key={test._id} style={{ border: '1px solid #ccc', margin: '0.5rem 0', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={selectedTests.includes(test._id)} onChange={() => toggleSelect(test._id)} />
          <div>
            <strong>{test.test_name}</strong>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>{test.major_category_name}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiagnosticsList;