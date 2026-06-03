import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DiagnosticsSafe = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/diagnostics/tests');
      console.log('Full response:', res);
      console.log('Data:', res.data);
      
      // Safe data extraction
      let testsData = [];
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        testsData = res.data.data;
      } else if (res.data && Array.isArray(res.data)) {
        testsData = res.data;
      } else if (Array.isArray(res.data)) {
        testsData = res.data;
      } else {
        console.warn('Unexpected data format:', res.data);
        testsData = [];
      }
      
      setTests(testsData);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      fetchTests();
      return;
    }
    // Filter locally
    const filtered = tests.filter(test => 
      test.test_name && test.test_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setTests(filtered);
  };

  const toggleSelect = (id) => {
    if (selectedTests.includes(id)) {
      setSelectedTests(selectedTests.filter(i => i !== id));
    } else if (selectedTests.length < 4) {
      setSelectedTests([...selectedTests, id]);
    } else {
      alert('You can compare up to 4 tests');
    }
  };

  const handleCompare = () => {
    if (selectedTests.length < 2) {
      alert('Please select at least 2 tests');
      return;
    }
    alert(`Comparing tests: ${selectedTests.join(', ')}`);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={fetchTests}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🔬 Diagnostics (Safe Mode)</h1>
      <p>Found {tests.length} tests</p>

      {/* Search */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}
        />
        <button onClick={handleSearch} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
          Search
        </button>
        <button onClick={fetchTests} style={{ backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
          Reset
        </button>
      </div>

      {/* Compare Button */}
      {selectedTests.length >= 2 && (
        <button onClick={handleCompare} style={{ marginBottom: '1rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
          Compare Selected ({selectedTests.length})
        </button>
      )}

      {/* Test List */}
      {tests.length === 0 ? (
        <p>No tests found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {tests.map(test => (
            <div key={test._id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  checked={selectedTests.includes(test._id)}
                  onChange={() => toggleSelect(test._id)}
                />
                <div style={{ flex: 1 }}>
                  <strong>{test.test_name || 'Unknown Test'}</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{test.major_category_name || 'General'}</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold', color: '#10b981' }}>
                    ₹{Math.round((test.min_price || test.price || 0) * 0.9)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiagnosticsSafe;