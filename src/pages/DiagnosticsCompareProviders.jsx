import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const DiagnosticsCompareProviders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const testId = queryParams.get('testId');
  const testName = queryParams.get('testName') || 'Test';
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    if (testId) {
      fetchProviders();
    } else {
      setError('No test selected');
      setLoading(false);
    }
  }, [testId, userLocation]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/diagnostics/tests/${testId}/providers`);
      console.log('Providers response:', res.data);
      setProviders(res.data.providers || []);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (provider) => {
    alert(`Booking ${testName} with ${provider.provider_id.provider_name} for ₹${provider.discounted_price}`);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading providers...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={() => navigate('/diagnostics-list')}>← Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate('/diagnostics-list')}>← Back to Tests</button>
      <h1>Compare {testName} - Prices from Different Labs</h1>
      
      {providers.length === 0 ? (
        <p>No providers found for this test.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Lab Name</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Price</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Rating</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Distance</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Home Collection</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Report Time</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider, idx) => {
                const p = provider.provider_id;
                const distance = provider.distance || (userLocation ? 'Auto' : 'N/A');
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      <strong>{p.provider_name}</strong>
                      {p.is_nabl_accredited && <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>✓ NABL</span>}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{provider.mrp}</span><br />
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹{provider.discounted_price}</span>
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      ⭐ {p.rating} ({p.total_reviews} reviews)
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      {distance !== 'N/A' ? `${distance} km` : 'N/A'}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      {provider.home_collection_available ? '✅ Yes' : '❌ No'}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      {provider.report_time_hours} hours
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <button
                        onClick={() => handleBook(provider)}
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
      )}
    </div>
  );
};

export default DiagnosticsCompareProviders;
