import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DiagnosticsSafe = () => {
  const navigate = useNavigate();
  const [allTests, setAllTests] = useState([]);
  const [displayedTests, setDisplayedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/diagnostics/tests');
      let testsData = [];
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        testsData = res.data.data;
      }
      setAllTests(testsData);
      setDisplayedTests(testsData);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setDisplayedTests(allTests);
      return;
    }
    const filtered = allTests.filter(test => 
      test.test_name && test.test_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDisplayedTests(filtered);
    setSelectedTests([]);
  };

  const handleReset = () => {
    setSearchTerm('');
    setDisplayedTests(allTests);
    setSelectedTests([]);
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
      alert('Please select at least 2 tests to compare');
      return;
    }
    // Pass IDs as comma-separated string
    const idsParam = selectedTests.join(',');
    navigate(`/diagnostics-compare-simple?ids=${idsParam}`);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🔬 Diagnostics</h1>
      <p>Found {displayedTests.length} tests</p>

      {/* Search Bar */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 2, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}
        />
        <button onClick={handleSearch} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
          Search
        </button>
        <button onClick={handleReset} style={{ backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
          Reset
        </button>
      </div>

      {/* Compare Button */}
      {selectedTests.length >= 2 && (
        <button 
          onClick={handleCompare} 
          style={{ marginBottom: '1rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
        >
          Compare Selected ({selectedTests.length})
        </button>
      )}

      {/* Test List */}
      {displayedTests.length === 0 ? (
        <p>No tests found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {displayedTests.map(test => {
            const price = test.min_price || test.price || 0;
            const discounted = Math.round(price * 0.9);
            return (
              <div key={test._id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test._id)}
                    onChange={() => toggleSelect(test._id)}
                  />
                  <div style={{ flex: 1 }}>
                    <strong>{test.test_name}</strong>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{test.major_category_name}</p>
                    <div>
                      <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{price}</span>
                      <span style={{ color: '#10b981', fontWeight: 'bold', marginLeft: '0.5rem' }}>₹{discounted}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DiagnosticsSafe;