import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const DiagnosticsCustomPackage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectIds = queryParams.get('preselect')?.split(',') || [];
  
  const [allTests, setAllTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [comparing, setComparing] = useState(false);
  const [providers, setProviders] = useState([]);
  const [sortBy, setSortBy] = useState('price');

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (preselectIds.length > 0 && allTests.length > 0) {
      const preselected = allTests.filter(t => preselectIds.includes(t._id));
      setSelectedTests(preselected);
    }
  }, [allTests, preselectIds]);

  const loadTests = async () => {
    try {
      const res = await api.get('/diagnostics/tests');
      if (res.data?.data) setAllTests(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTest = (test) => {
    if (selectedTests.find(t => t._id === test._id)) {
      setSelectedTests(selectedTests.filter(t => t._id !== test._id));
      setProviders([]);
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
      const res = await api.post('/diagnostics/compare-package', { testIds });
      setProviders(res.data.providers || []);
    } catch (error) {
      console.error('Compare error:', error);
      alert('Error comparing packages');
    } finally {
      setComparing(false);
    }
  };

  const handleBook = (provider) => {
    alert(`Booking custom package with ${provider.provider_name} for ₹${provider.total_price}`);
  };

  const getSortedProviders = () => {
    const sorted = [...providers];
    if (sortBy === 'price') sorted.sort((a, b) => a.total_price - b.total_price);
    else if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  };

  const filteredTests = allTests.filter(test =>
    test.test_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <button onClick={() => navigate('/diagnostics-list')} style={{ marginBottom: '1rem', cursor: 'pointer' }}>← Back to Tests</button>
      
      <h1>✨ Build Your Custom Package</h1>
      <p>Select multiple tests to compare prices across different labs.</p>
      
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1rem' }}
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', padding: '0.5rem', borderRadius: '8px' }}>
          {filteredTests.map(test => (
            <label key={test._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem' }}>
              <input
                type="checkbox"
                checked={!!selectedTests.find(t => t._id === test._id)}
                onChange={() => toggleTest(test)}
              />
              <span>{test.test_name}</span>
            </label>
          ))}
        </div>
      </div>
      
      {selectedTests.length > 0 && (
        <div style={{ backgroundColor: '#e0e7ff', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <strong>Selected Tests ({selectedTests.length}):</strong>
          {selectedTests.map(t => (
            <span key={t._id} style={{ display: 'inline-block', backgroundColor: '#3b82f6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', margin: '0.25rem', fontSize: '0.75rem' }}>
              {t.test_name}
              <button onClick={() => toggleTest(t)} style={{ background: 'none', border: 'none', color: 'white', marginLeft: '0.25rem', cursor: 'pointer' }}>×</button>
            </span>
          ))}
          {selectedTests.length >= 2 && (
            <button onClick={handleCompare} disabled={comparing} style={{ marginLeft: '0.5rem', backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
              {comparing ? 'Comparing...' : `Compare Prices (${selectedTests.length} tests)`}
            </button>
          )}
        </div>
      )}
      
      {providers.length > 0 && (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span><strong>Sort by:</strong></span>
            <button onClick={() => setSortBy('price')} style={{ backgroundColor: sortBy === 'price' ? '#10b981' : '#e5e7eb', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Price (Low to High)</button>
            <button onClick={() => setSortBy('rating')} style={{ backgroundColor: sortBy === 'rating' ? '#10b981' : '#e5e7eb', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Rating (High to Low)</button>
          </div>
          
          {getSortedProviders()[0] && (
            <div style={{ backgroundColor: '#d1fae5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <h3>🏆 Best Option: {getSortedProviders()[0].provider_name}</h3>
              <p>Total Price: ₹{getSortedProviders()[0].total_price} | Rating: ⭐ {getSortedProviders()[0].rating}</p>
              <button onClick={() => handleBook(getSortedProviders()[0])} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Book This Package
              </button>
            </div>
          )}
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Test / Provider</th>
                  {getSortedProviders().map((provider, idx) => (
                    <th key={idx} style={{ padding: '12px', border: '1px solid #ddd' }}>{provider.provider_name}<br /><span style={{ fontSize: '0.75rem' }}>⭐ {provider.rating}</span></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: '#d1fae5' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Total Price</td>
                  {getSortedProviders().map((provider, idx) => (
                    <td key={idx} style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', color: '#10b981' }}>₹{provider.total_price}</td>
                  ))}
                </tr>
                {selectedTests.map(test => (
                  <tr key={test._id}>
                    <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{test.test_name}</td>
                    {getSortedProviders().map((provider, idx) => (
                      <td key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>₹{provider.individual_prices[test._id] || 'N/A'}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Action</td>
                  {getSortedProviders().map((provider, idx) => (
                    <td key={idx} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <button onClick={() => handleBook(provider)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Book</button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsCustomPackage;