import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DiagnosticsCustomPackage = () => {
  const navigate = useNavigate();
  const [allTests, setAllTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [comparing, setComparing] = useState(false);
  const [providers, setProviders] = useState([]);

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const res = await axios.get(`${API_URL}/diagnostics/tests`);
      if (res.data?.data) {
        setAllTests(res.data.data);
      }
    } catch (error) {
      console.error('Error loading tests:', error);
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

  const handleCompare = async (tests) => {
    if (tests.length < 2) return;
    
    setComparing(true);
    try {
      const testIds = tests.map(t => t._id);
      const res = await axios.post(`${API_URL}/diagnostics/compare-package`, { testIds });
      setProviders(res.data.providers || []);
    } catch (error) {
      console.error('Compare error:', error);
      alert('Error comparing packages');
    } finally {
      setComparing(false);
    }
  };

  const filteredTests = allTests.filter(test =>
    test.test_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate('/diagnostics-list')} style={{ marginBottom: '1rem', cursor: 'pointer' }}>← Back to Tests</button>
      
      <h1>Build Your Custom Package</h1>
      <p>Select 2 or more tests to compare prices across labs.</p>
      
      <input
        type="text"
        placeholder="Search tests..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}
      />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
        {filteredTests.map(test => (
          <label key={test._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!selectedTests.find(t => t._id === test._id)}
              onChange={() => toggleTest(test)}
            />
            {test.test_name}
          </label>
        ))}
      </div>
      
      {selectedTests.length >= 2 && (
        <div style={{ marginBottom: '1rem' }}>
          <button 
            onClick={() => handleCompare(selectedTests)} 
            disabled={comparing}
            style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {comparing ? 'Comparing...' : `Compare ${selectedTests.length} Tests`}
          </button>
        </div>
      )}
      
      {providers.length > 0 && (
        <div>
          <h2>Comparison Results</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Lab</th>
                  {selectedTests.map(test => (
                    <th key={test._id} style={{ padding: '12px', border: '1px solid #ddd' }}>{test.test_name}</th>
                  ))}
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Total</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Rating</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider, idx) => {
                  const total = selectedTests.reduce((sum, test) => sum + (provider.individual_prices[test._id] || 0), 0);
                  return (
                    <tr key={idx}>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}><strong>{provider.provider_name}</strong></td>
                      {selectedTests.map(test => (
                        <td key={test._id} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                          ₹{provider.individual_prices[test._id] || 'N/A'}
                        </td>
                      ))}
                      <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}><strong>₹{total}</strong></td>
                      <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>⭐ {provider.rating}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                        <button 
                          onClick={() => alert(`Booking ${provider.provider_name}\nTotal: ₹${total}`)}
                          style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Book
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {providers.length === 0 && selectedTests.length >= 2 && !comparing && (
        <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
          No labs found that offer all selected tests. Try different combination.
        </div>
      )}
    </div>
  );
};

export default DiagnosticsCustomPackage;