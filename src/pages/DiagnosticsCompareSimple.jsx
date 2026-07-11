import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const DiagnosticsCompareSimple = () => {
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
    setError('');
    try {
      console.log('Sending request with IDs:', ids);
      const response = await api.post('/diagnostics/compare', { 
        type: 'tests', 
        ids: ids 
      });
      console.log('Response:', response.data);
      
      if (response.data && response.data.success) {
        setItems(response.data.data || []);
      } else {
        setError(response.data?.message || 'Failed to load comparison data');
      }
    } catch (err) {
      console.error('Compare error:', err);
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading comparison...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={() => navigate('/diagnostics-safe')}>← Back to Tests</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No data to compare.</p>
        <button onClick={() => navigate('/diagnostics-safe')}>← Back to Tests</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/diagnostics-safe')}>← Back to Tests</button>
      <h1>Compare Lab Tests</h1>
      
      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Feature</th>
              {items.map((item, idx) => (
                <th key={idx} style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>
                  {item.test_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Category</td>
              {items.map((item, idx) => (
                <td key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>{item.major_category_name}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Original Price</td>
              {items.map((item, idx) => {
                const price = item.min_price || item.price || 0;
                return <td key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>₹{price}</td>;
              })}
            </tr>
            <tr style={{ backgroundColor: '#e8f5e9' }}>
              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Discounted (10% off)</td>
              {items.map((item, idx) => {
                const price = item.min_price || item.price || 0;
                const discounted = Math.round(price * 0.9);
                return <td key={idx} style={{ padding: '8px', border: '1px solid #ddd', color: '#2e7d32', fontWeight: 'bold' }}>₹{discounted}</td>;
              })}
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Report Time</td>
              {items.map((item, idx) => (
                <td key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>{item.turnaround_time_default_hours || 24} hours</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Home Collection</td>
              {items.map((item, idx) => (
                <td key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>{item.home_collection_possible ? '✅ Yes' : '❌ No'}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Fasting Required</td>
              {items.map((item, idx) => (
                <td key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>{item.requires_fasting ? '✅ Yes' : '❌ No'}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Labs Offering</td>
              {items.map((item, idx) => (
                <td key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>{item.provider_count || 0} labs</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => alert(`Booking ${item.test_name}`)}
            style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Book {item.test_name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiagnosticsCompareSimple;
