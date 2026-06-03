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
  const [userLocation, setUserLocation] = useState(null);

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {}
      );
    }
    loadTests();
  }, []);

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

  const filteredTests = allTests.filter(t =>
    t.test_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', overflowX: 'auto' }}>
      <button onClick={() => navigate('/diagnostics-list')} style={{ marginBottom: '1rem', cursor: 'pointer' }}>← Back</button>
      <h1>Build Your Custom Package</h1>
      <p>Select 2 or more tests. Cheapest provider will appear in first column.</p>

      <input
        type="text"
        placeholder="Search tests..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '1rem', border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '8px' }}>
        {filteredTests.map(test => (
          <label key={test._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!selectedTests.find(t => t._id === test._id)} onChange={() => toggleTest(test)} />
            {test.test_name}
          </label>
        ))}
      </div>

      {selectedTests.length >= 2 && (
        <button onClick={() => handleCompare(selectedTests)} disabled={comparing} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '1rem' }}>
          {comparing ? 'Comparing...' : `Compare ${selectedTests.length} Tests`}
        </button>
      )}

      {providers.length > 0 && selectedTests.length >= 2 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', marginTop: '1rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', minWidth: '150px' }}></th>
              {providers.map((p, idx) => (
                <th key={idx} style={{ padding: '12px', border: '1px solid #ddd', minWidth: '120px', backgroundColor: idx === 0 ? '#d1fae5' : '#f3f4f6' }}>
                  {p.provider_name}
                  {idx === 0 && <div style={{ fontSize: '11px', color: '#10b981' }}>★ Cheapest</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Distance Row */}
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Distance</td>
              {providers.map((p, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.distance ? `${p.distance} km` : 'N/A'}</td>
              ))}
            </tr>
            {/* Rating Row */}
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Rating</td>
              {providers.map((p, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>⭐ {p.rating} ({p.total_reviews || 0})</td>
              ))}
            </tr>
            {/* Home Collection Row */}
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Home Collection</td>
              {providers.map((p, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.home_collection ? '✅ Yes' : '❌ No'}</td>
              ))}
            </tr>
            {/* Report Time Row */}
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Report Time</td>
              {providers.map((p, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.report_time_hours || 24} hours</td>
              ))}
            </tr>
            {/* Book Button Row */}
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Book</td>
              {providers.map((p, idx) => {
                const total = selectedTests.reduce((sum, t) => sum + (p.individual_prices[t._id] || 0), 0);
                return (
                  <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button onClick={() => alert(`Booking ${p.provider_name}\nTotal: ₹${total}`)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Book</button>
                  </td>
                );
              })}
            </tr>
            {/* Test Price Rows */}
            {selectedTests.map(test => (
              <tr key={test._id}>
                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>{test.test_name}</td>
                {providers.map((p, idx) => (
                  <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>₹{p.individual_prices[test._id] || 'N/A'}</td>
                ))}
              </tr>
            ))}
            {/* Total Row */}
            <tr style={{ backgroundColor: '#fef3c7', fontWeight: 'bold' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Price</td>
              {providers.map((p, idx) => {
                const total = selectedTests.reduce((sum, t) => sum + (p.individual_prices[t._id] || 0), 0);
                return (
                  <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', backgroundColor: idx === 0 ? '#d1fae5' : '#fef3c7' }}>₹{total}</td>
                );
              })}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DiagnosticsCustomPackage;