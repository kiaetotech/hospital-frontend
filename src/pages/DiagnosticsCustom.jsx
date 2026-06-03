import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DiagnosticsCustom = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/diagnostics/tests?limit=50');
      setTests(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTestSelection = (test) => {
    if (selectedTests.find(t => t._id === test._id)) {
      setSelectedTests(selectedTests.filter(t => t._id !== test._id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handleCompare = async () => {
    if (selectedTests.length < 2) {
      alert('Please select at least 2 tests to compare');
      return;
    }
    
    setComparing(true);
    try {
      const testIds = selectedTests.map(t => t._id);
      const res = await api.post('/diagnostics/compare', { type: 'tests', ids: testIds });
      setResults(res.data.data || []);
    } catch (error) {
      console.error(error);
      alert('Error comparing tests');
    } finally {
      setComparing(false);
    }
  };

  const handleBook = (test) => {
    const originalPrice = test.min_price || test.price || 0;
    const discountedPrice = Math.round(originalPrice * 0.9);
    navigate('/diagnostics-booking', {
      state: {
        itemType: 'test',
        itemId: test._id,
        itemName: test.test_name,
        originalPrice: originalPrice,
        discountedPrice: discountedPrice
      }
    });
  };

  const filteredTests = tests.filter(test => 
    test.test_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button onClick={() => navigate('/diagnostics')} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
        
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '0.5rem' }}>✨ Build Your Own Package</h1>
        <p style={{ marginBottom: '1rem' }}>Select multiple tests to create a custom package and compare prices across labs</p>

        {/* Search */}
        <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          <input type="text" placeholder="Search tests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
        </div>

        {/* Selected Tests Summary */}
        {selectedTests.length > 0 && (
          <div style={{ backgroundColor: '#e0e7ff', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            <strong>Selected Tests ({selectedTests.length}):</strong>
            {selectedTests.map(t => (
              <span key={t._id} style={{ display: 'inline-block', backgroundColor: '#3b82f6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', margin: '0.25rem', fontSize: '0.75rem' }}>
                {t.test_name}
                <button onClick={() => toggleTestSelection(t)} style={{ background: 'none', border: 'none', color: 'white', marginLeft: '0.25rem', cursor: 'pointer' }}>×</button>
              </span>
            ))}
            {selectedTests.length >= 2 && (
              <button onClick={handleCompare} style={{ marginLeft: '0.5rem', backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Compare Prices</button>
            )}
          </div>
        )}

        {/* Test List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {filteredTests.map(test => {
            const price = test.min_price || test.price || 0;
            const isSelected = selectedTests.find(t => t._id === test._id);
            return (
              <div key={test._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold' }}>{test.test_name}</span>
                  <input type="checkbox" checked={isSelected} onChange={() => toggleTestSelection(test)} />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{test.major_category_name}</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>₹{price} onwards</p>
              </div>
            );
          })}
        </div>

        {/* Comparison Results */}
        {comparing && <div style={{ textAlign: 'center', padding: '2rem' }}>Comparing prices across labs...</div>}

        {results.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Comparison Results</h3>
            {results.map(test => (
              <div key={test._id} style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem 0' }}>
                <strong>{test.test_name}</strong>
                <p>Best Price: ₹{Math.round((test.min_price || test.price) * 0.9)} (10% discount applied)</p>
                <button onClick={() => handleBook(test)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Book Now</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticsCustom;