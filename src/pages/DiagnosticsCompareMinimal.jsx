import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

const DiagnosticsCompareMinimal = () => {
  const location = useLocation();
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
    
    api.post('/diagnostics/compare', { type: 'tests', ids })
      .then(res => {
        if (res.data && res.data.data) {
          setItems(res.data.data);
        } else {
          setError('No data received');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [ids]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading comparison...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <a href="/diagnostics-minimal">← Back to Tests</a>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No items to compare.</p>
        <a href="/diagnostics-minimal">← Back to Tests</a>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <a href="/diagnostics-minimal">← Back to Tests</a>
      <h1>Compare Lab Tests</h1>
      {items.map((item, idx) => (
        <div key={idx} style={{ border: '1px solid #ccc', margin: '1rem 0', padding: '1rem', borderRadius: '8px' }}>
          <h3>{item.test_name}</h3>
          <p>Category: {item.major_category_name}</p>
          <p>Price: ₹{Math.round((item.min_price || item.price || 0) * 0.9)}</p>
          <p>Report Time: {item.turnaround_time_default_hours || 24} hours</p>
          <p>Home Collection: {item.home_collection_possible ? 'Yes' : 'No'}</p>
          <p>Fasting Required: {item.requires_fasting ? 'Yes' : 'No'}</p>
          <button onClick={() => alert(`Booking ${item.test_name}`)} style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
            Book Now
          </button>
        </div>
      ))}
    </div>
  );
};

export default DiagnosticsCompareMinimal;