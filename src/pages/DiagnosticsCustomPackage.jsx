import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DiagnosticsCustomPackage = ({ preselectedTests = [] }) => {
  const navigate = useNavigate();
  const [allTests, setAllTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [providers, setProviders] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => {}
      );
    }
    loadTests();
  }, []);

  useEffect(() => {
    if (preselectedTests && preselectedTests.length > 0) {
      setSelectedTests(preselectedTests);
      handleCompare(preselectedTests);
    }
  }, [preselectedTests]);

  const loadTests = async () => {
    try {
      const res = await axios.get(`${API_URL}/diagnostics/tests`);
      if (res.data?.data) setAllTests(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTest = (test) => {
    let newSelected;
    if (selectedTests.find(t => t._id === test._id)) {
      newSelected = selectedTests.filter(t => t._id !== test._id);
      setSelectedTests(newSelected);
      if (newSelected.length >= 2) handleCompare(newSelected);
      else setProviders([]);
    } else {
      newSelected = [...selectedTests, test];
      setSelectedTests(newSelected);
      if (newSelected.length >= 2) handleCompare(newSelected);
    }
  };

  const handleCompare = async (tests) => {
    if (tests.length < 2) return;
    setComparing(true);
    try {
      const testIds = tests.map(t => t._id);
      const res = await axios.post(`${API_URL}/diagnostics/compare-package`, { 
        testIds,
        lat: userLocation?.lat,
        lng: userLocation?.lng
      });
      if (res.data.providers) {
        const sorted = [...res.data.providers].sort((a, b) => {
          const totalA = tests.reduce((s, t) => s + (a.individual_prices[t._id] || 0), 0);
          const totalB = tests.reduce((s, t) => s + (b.individual_prices[t._id] || 0), 0);
          return totalA - totalB;
        });
        setProviders(sorted);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setComparing(false);
    }
  };

  const handleBook = (provider) => {
    const total = selectedTests.reduce((sum, test) => sum + (provider.individual_prices[test._id] || 0), 0);
    alert(`Booking ${provider.provider_name}\nTotal: ₹${total}`);
  };

  const filteredTests = allTests.filter(test =>
    test.test_name?.toLowerCase().includes('')
  );

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate('/diagnostics-list')}>← Back</button>
      <h1>Build Custom Package</h1>
      <p>Select 2 or more tests to compare prices.</p>
      
      <div style={{ marginBottom: '1rem' }}>
        {filteredTests.map(test => (
          <label key={test._id} style={{ display: 'block', padding: '0.5rem' }}>
            <input type="checkbox" checked={!!selectedTests.find(t => t._id === test._id)} onChange={() => toggleTest(test)} />
            {test.test_name}
          </label>
        ))}
      </div>
      
      {comparing && <p>Comparing...</p>}
      
      {providers.length > 0 && selectedTests.length >= 2 && (
        <div>
          <h2>Results - Cheapest Provider First</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Provider</th>
                {selectedTests.map(test => (
                  <th key={test._id} style={{ border: '1px solid #ddd', padding: '8px' }}>{test.test_name}</th>
                ))}
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Total</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider, idx) => {
                const total = selectedTests.reduce((sum, test) => sum + (provider.individual_prices[test._id] || 0), 0);
                return (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{provider.provider_name} {idx === 0 && '⭐'}</td>
                    {selectedTests.map(test => (
                      <td key={test._id} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                        ₹{provider.individual_prices[test._id] || 'N/A'}
                      </td>
                    ))}
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}><strong>₹{total}</strong></td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                      <button onClick={() => handleBook(provider)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Book
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsCustomPackage;