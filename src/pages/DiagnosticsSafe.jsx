import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DiagnosticsSafe = () => {
  const navigate = useNavigate();
  const [allTests, setAllTests] = useState([]);
  const [displayedTests, setDisplayedTests] = useState([]);
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
      console.log('API Response:', res.data);
      
      let testsData = [];
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        testsData = res.data.data;
      } else if (res.data && Array.isArray(res.data)) {
        testsData = res.data;
      }
      
      setAllTests(testsData);
      setDisplayedTests(testsData);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  // FIX 1: Search - filters displayedTests based on searchTerm
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setDisplayedTests(allTests);
      return;
    }
    const filtered = allTests.filter(test => 
      test.test_name && test.test_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDisplayedTests(filtered);
    // Reset selected tests when searching
    setSelectedTests([]);
  };

  // FIX 2: Reset search
  const handleReset = () => {
    setSearchTerm('');
    setDisplayedTests(allTests);
    setSelectedTests([]);
  };

  // FIX 3: Toggle selection for compare
  const toggleSelect = (id) => {
    if (selectedTests.includes(id)) {
      setSelectedTests(selectedTests.filter(i => i !== id));
    } else if (selectedTests.length < 4) {
      setSelectedTests([...selectedTests, id]);
    } else {
      alert('You can compare up to 4 tests');
    }
  };

  // FIX 4: Compare button - navigates to compare page
  const handleCompare = () => {
    if (selectedTests.length < 2) {
      alert('Please select at least 2 tests to compare');
      return;
    }
    const ids = selectedTests.join(',');
    navigate(`/diagnostics-compare?type=tests&ids=${ids}`);
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
      <h1>🔬 Diagnostics</h1>
      <p>Found {displayedTests.length} tests {displayedTests.length !== allTests.length && `(filtered from ${allTests.length})`}</p>

      {/* Search Bar */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search tests (e.g., CBC, Blood, Thyroid)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 2, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}
        />
        <button onClick={handleSearch} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
          🔍 Search
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
        <p>No tests found matching "{searchTerm}".</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {displayedTests.map(test => {
            const originalPrice = test.min_price || test.price || 0;
            const discountedPrice = Math.round(originalPrice * 0.9);
            return (
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
                    <div style={{ marginTop: '0.25rem' }}>
                      <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.875rem' }}>₹{originalPrice}</span>
                      <span style={{ color: '#10b981', fontWeight: 'bold', marginLeft: '0.5rem' }}>₹{discountedPrice}</span>
                      <span style={{ fontSize: '0.7rem', color: '#10b981', marginLeft: '0.25rem' }}>(Save {Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)}%)</span>
                    </div>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.7rem', color: '#6b7280' }}>🏥 {test.provider_count || 0} labs offering</p>
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