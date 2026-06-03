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
    fetchCompareData();
  }, [ids]);

  const fetchCompareData = async () => {
    setLoading(true);
    try {
      const response = await api.post('/diagnostics/compare', { type: 'tests', ids });
      if (response.data && response.data.success) {
        setItems(response.data.data || []);
      } else {
        setError(response.data?.message || 'Failed to load comparison');
      }
    } catch (err) {
      setError(err.message || 'Network error');
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
      <h1>Compare Lab Tests</h1>
      {items.map((item, idx) => (
        <div key={idx} style={{ border: '1px solid #ccc', margin: '1rem 0', padding: '1rem', borderRadius: '8px' }}>
          <h3>{item.test_name}</h3>
          <p>Category: {item.major_category_name}</p>
          <p>Price: ₹{Math.round((item.min_price || item.price || 0) * 0.9)}</p>
          <button onClick={() => alert(`Booking ${item.test_name}`)}>Book Now</button>
        </div>
      ))}
    </div>
  );
};

export default DiagnosticsCompareResult;