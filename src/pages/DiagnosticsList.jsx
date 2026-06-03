import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DiagnosticsList = () => {
  const navigate = useNavigate();
  const [allTests, setAllTests] = useState([]);
  const [displayedTests, setDisplayedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/diagnostics/tests');
      if (res.data && res.data.data) {
        setAllTests(res.data.data);
        setDisplayedTests(res.data.data);
      }
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  // FIX 1: Search function
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setDisplayedTests(allTests);
      return;
    }
    const filtered = allTests.filter(test =>
      test.test_name && test.test_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDisplayedTests(filtered);
    setSelectedTests([]); // Clear selections when searching
  };

  // FIX 2: Reset search
  const handleReset = () => {
    setSearchTerm('');
    setDisplayedTests(allTests);
    setSelectedTests([]);
  };

  // FIX 3: Toggle selection for compare
  const toggleSelect = (testId) => {
    if (selectedTests.includes(testId)) {
      setSelectedTests(selectedTests.filter(id => id !== testId));
    } else if (selectedTests.length < 4) {
      setSelectedTests([...selectedTests, testId]);
    } else {
      alert('You can compare up to 4 tests');
    }
  };

  // FIX 4: Compare selected tests
  const handleCompare = () => {
    if (selectedTests.length < 2) {
      alert('Please select at least 2 tests to compare');
      return;
    }
    // Navigate to custom package builder with selected tests
    navigate(`/diagnostics-custom-package?preselect=${selectedTests.join(',')}`);
  };

  const handleComparePrices = (testId, testName) => {
    navigate(`/diagnostics-compare-providers?testId=${testId}&testName=${encodeURIComponent(testName)}`);
  };

  const handleCustomPackage = () => {
    navigate('/diagnostics-custom-package');
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header with two buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>🔬 Diagnostics - Lab Tests</h1>
        <button
          onClick={handleCustomPackage}
          style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          ✨ Build Custom Package
        </button>
      </div>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search tests (e.g., CBC, Blood, Thyroid)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 2, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button onClick={handleSearch} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          🔍 Search
        </button>
        <button onClick={handleReset} style={{ backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Reset
        </button>
      </div>
      
      {/* Compare Button */}
      {selectedTests.length >= 2 && (
        <button
          onClick={handleCompare}
          style={{ marginBottom: '1rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Compare Selected ({selectedTests.length})
        </button>
      )}
      
      {/* Test List */}
      {displayedTests.length === 0 ? (
        <p>No tests found for "{searchTerm}".</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {displayedTests.map(test => {
            const price = test.min_price || test.price || 0;
            const discounted = Math.round(price * 0.9);
            const isSelected = selectedTests.includes(test._id);
            return (
              <div
                key={test._id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  backgroundColor: isSelected ? '#d1fae5' : 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(test._id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <div>
                    <strong>{test.test_name}</strong>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{test.major_category_name}</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#10b981' }}>
                      ₹{discounted} <span style={{ textDecoration: 'line-through', color: '#9ca3af', marginLeft: '0.25rem' }}>₹{price}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleComparePrices(test._id, test.test_name)}
                  style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Compare Prices
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Results count */}
      <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
        Showing {displayedTests.length} of {allTests.length} tests
      </p>
    </div>
  );
};

export default DiagnosticsList;