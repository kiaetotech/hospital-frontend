import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const DiagnosticsCompareSimple = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const ids = queryParams.get('ids')?.split(',') || [];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ids && ids.length > 0) {
      fetchCompare();
    } else {
      setError('No items selected. Please go back and select tests.');
    }
  }, [ids]);

  const fetchCompare = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching comparison for IDs:', ids);
      const res = await api.post('/diagnostics/compare', { type: 'tests', ids });
      console.log('Response:', res.data);
      
      if (res.data && res.data.success && res.data.data) {
        setItems(res.data.data);
      } else {
        setError('No data received from server');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading comparison...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/diagnostics-safe')}>← Back to Tests</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No items to compare.</p>
        <button onClick={() => navigate('/diagnostics-safe')}>← Back to Tests</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/diagnostics-safe')}>← Back to Tests</button>
      <h1>Comparison Results</h1>
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.test_name}</h3>
            <p><strong>Category:</strong> {item.major_category_name}</p>
            <p><strong>Original Price:</strong> ₹{item.min_price || item.price || 0}</p>
            <p><strong>Discounted Price (10% off):</strong> ₹{Math.round((item.min_price || item.price || 0) * 0.9)}</p>
            <p><strong>Report Time:</strong> {item.turnaround_time_default_hours || 24} hours</p>
            <p><strong>Home Collection:</strong> {item.home_collection_possible ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Fasting Required:</strong> {item.requires_fasting ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Labs Offering:</strong> {item.provider_count || 0}</p>
            <button 
              onClick={() => alert(`Booking ${item.test_name}`)} 
              style={{ marginTop: '0.5rem', backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiagnosticsCompareSimple;