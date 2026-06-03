import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

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
  const [error, setError] = useState('');

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (preselectIds.length > 0 && allTests.length > 0) {
      const preselected = allTests.filter(t => preselectIds.includes(t._id));
      setSelectedTests(preselected);
      if (preselected.length >= 2) {
        handleCompare(preselected);
      }
    }
  }, [allTests, preselectIds]);

  const loadTests = async () => {
    try {
      const res = await axios.get(`${API_URL}/diagnostics/tests`);
      console.log('Tests loaded:', res.data);
      if (res.data?.data) {
        setAllTests(res.data.data);
      }
    } catch (error) {
      console.error('Error loading tests:', error);
      setError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const toggleTest = (test) => {
    let newSelected;
    if (selectedTests.find(t => t._id === test._id)) {
      newSelected = selectedTests.filter(t => t._id !== test._id);
      setSelectedTests(newSelected);
      if (newSelected.length >= 2) {
        handleCompare(newSelected);
      } else {
        setProviders([]);
      }
    } else {
      newSelected = [...selectedTests, test];
      setSelectedTests(newSelected);
      if (newSelected.length >= 2) {
        handleCompare(newSelected);
      }
    }
  };

  const handleCompare = async (tests = selectedTests) => {
    if (tests.length < 2) {
      alert('Please select at least 2 tests to compare');
      return;
    }
    
    setComparing(true);
    setError('');
    try {
      const testIds = tests.map(t => t._id);
      console.log('Sending testIds:', testIds);
      
      const res = await axios.post(`${API_URL}/diagnostics/compare-package`, { testIds });
      console.log('Response:', res.data);
      
      if (res.data.providers && res.data.providers.length > 0) {
        setProviders(res.data.providers);
      } else {
        setError('No labs found that offer all selected tests');
        setProviders([]);
      }
    } catch (error) {
      console.error('Compare error:', error);
      setError(error.response?.data?.message || 'Error comparing packages');
      setProviders([]);
    } finally {
      setComparing(false);
    }
  };

  const handleBook = (provider) => {
    const total = selectedTests.reduce((sum, test) => {
      return sum + (provider.individual_prices[test._id] || 0);
    }, 0);
    alert(`Booking package with ${provider.provider_name}\nTotal: ₹${total}`);
  };

  const filteredTests = allTests.filter(test =>
    test.test_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <button onClick={() => navigate('/diagnostics-list')} style={{ marginBottom: '1rem', cursor: 'pointer' }}>← Back to Tests</button>
      
      <h1>✨ Build Your Custom Package</h1>
      <p>Select multiple tests to compare prices across different labs.</p>
      
      {/* Test Selection Area */}
      <div style={{ marginBottom: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
        <h3>Select Tests to Compare:</h3>
        <input
          type="text"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1rem' }}
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
          {filteredTests.map(test => (
            <label key={test._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem', cursor: 'pointer' }}>
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
      
      {/* Selected Tests Summary */}
      {selectedTests.length > 0 && (
        <div style={{ backgroundColor: '#e0e7ff', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <strong>Selected Tests ({selectedTests.length}):</strong>
          {selectedTests.map(t => (
            <span key={t._id} style={{ display: 'inline-block', backgroundColor: '#3b82f6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', margin: '0.25rem', fontSize: '0.75rem' }}>
              {t.test_name}
              <button onClick={() => toggleTest(t)} style={{ background: 'none', border: 'none', color: 'white', marginLeft: '0.25rem', cursor: 'pointer' }}>×</button>
            </span>
          ))}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', color: '#dc2626' }}>
          {error}
        </div>
      )}
      
      {/* Loading */}
      {comparing && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading comparison data...</div>
      )}
      
      {/* Comparison Results */}
      {providers.length > 0 && selectedTests.length >= 2 && (
        <div>
          <h2>Comparison Results</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '12px', border: '1px solid #ddd', minWidth: '150px' }}>Test / Lab</th>
                  {providers.map((provider, idx) => (
                    <th key={idx} style={{ padding: '12px', border: '1px solid #ddd', minWidth: '150px', backgroundColor: idx === 0 ? '#d1fae5' : '#f3f4f6' }}>
                      {provider.provider_name}
                      {idx === 0 && <span style={{ display: 'block', fontSize: '0.75rem', color: '#10b981' }}>⭐ Cheapest</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedTests.map(test => (
                  <tr key={test._id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                      {test.test_name}
                    </td>
                    {providers.map((provider, idx) => (
                      <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>
                          ₹{provider.individual_prices?.[test._id] || 'N/A'}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
                
                <tr style={{ backgroundColor: '#fef3c7', fontWeight: 'bold' }}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Price</td>
                  {providers.map((provider, idx) => {
                    const total = selectedTests.reduce((sum, test) => sum + (provider.individual_prices?.[test._id] || 0), 0);
                    return (
                      <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', backgroundColor: idx === 0 ? '#d1fae5' : '#fef3c7' }}>
                        <strong>₹{total}</strong>
                      </td>
                    );
                  })}
                </tr>
                
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>Rating</td>
                  {providers.map((provider, idx) => (
                    <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      ⭐ {provider.rating}
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>Action</td>
                  {providers.map((provider, idx) => (
                    <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleBook(provider)} 
                        style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Book Now
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {providers.length === 0 && selectedTests.length >= 2 && !comparing && !error && (
        <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
          <p>No labs found that offer all selected tests. Try selecting different tests.</p>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsCustomPackage;