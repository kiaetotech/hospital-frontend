import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const DiagnosticsCompareResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const idsParam = queryParams.get('ids') || '';
  const ids = idsParam ? idsParam.split(',') : [];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ids.length === 0) {
      setError('No tests selected');
      setLoading(false);
      return;
    }
    
    console.log('Fetching comparison for IDs:', ids);
    
    api.post('/diagnostics/compare', { type: 'tests', ids })
      .then(res => {
        console.log('API Response:', res.data);
        if (res.data && res.data.data) {
          setItems(res.data.data);
        } else {
          setError('No data received from server');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [ids]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading comparison...</h2>
        <p>Please wait while we fetch the data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={() => navigate('/diagnostics-list')}>← Back to Tests</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No data to compare.</p>
        <button onClick={() => navigate('/diagnostics-list')}>← Back to Tests</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/diagnostics-list')}>← Back to Tests</button>
      <h1>Comparison Results</h1>
      <p>Found {items.length} tests to compare.</p>
      
      {items.map((item, idx) => (
        <div key={idx} style={{ border: '1px solid #ddd', margin: '1rem 0', padding: '1rem', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>{item.test_name}</h3>
          <p><strong>Category:</strong> {item.major_category_name}</p>
          <p><strong>Original Price:</strong> ₹{item.min_price || item.price || 0}</p>
          <p><strong>Discounted Price (10% off):</strong> ₹{Math.round((item.min_price || item.price || 0) * 0.9)}</p>
          <p><strong>Report Time:</strong> {item.turnaround_time_default_hours || 24} hours</p>
          <p><strong>Home Collection:</strong> {item.home_collection_possible ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Fasting Required:</strong> {item.requires_fasting ? '✅ Yes' : '❌ No'}</p>
          <button 
            onClick={() => alert(`Booking ${item.test_name} - Proceed to payment`)}
            style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '0.5rem' }}
          >
            Book Now
          </button>
        </div>
      ))}
    </div>
  );
};

export default DiagnosticsCompareResult;