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
      console.log('Sending IDs to compare:', ids);
      const response = await api.post('/diagnostics/compare', {
        type: 'tests',
        ids: ids
      });
      console.log('Compare response:', response.data);
      
      if (response.data && response.data.success) {
        setItems(response.data.data || []);
      } else {
        setError(response.data?.message || 'Failed to load comparison');
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
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate('/diagnostics-list')} style={{ marginBottom: '1rem', cursor: 'pointer' }}>← Back to Tests</button>
      <h1 style={{ marginBottom: '1rem' }}>Compare Lab Tests</h1>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Feature</th>
              {items.map((item, idx) => (
                <th key={idx} style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', minWidth: '150px' }}>
                  {item.test_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Category</td>
              {items.map((item, idx) => (
                <td key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>{item.major_category_name || '-'}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Original Price</td>
              {items.map((item, idx) => {
                const price = item.min_price || item.price || 0;
                return <td key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>₹{price}</td>;
              })}
            </tr>
            <tr style={{ backgroundColor: '#d1fae5' }}>
              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Discounted Price (10% off)</td>
              {items.map((item, idx) => {
                const price = item.min_price || item.price || 0;
                const discounted = Math.round(price * 0.9);
                return <td key={idx} style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', color: '#10b981' }}>₹{discounted}</td>;
              })}
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>You Save</td>
              {items.map((item, idx) => {
                const price = item.min_price || item.price || 0;
                const discounted = Math.round(price * 0.9);
                const saving = price - discounted;
                return <td key={idx} style={{ padding: '8px', border: '1px solid #ddd', color: '#10b981' }}>₹{saving} ({Math.round((saving/price)*100)}% off)</td>;
              })}
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Report Time</td>
              {items.map((item, idx) => (
                <td key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>{item.turnaround_time_default_hours || 24} hours</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Home Collection</td>
              {items.map((item, idx) => (
                <td key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>{item.home_collection_possible ? '✅ Yes' : '❌ No'}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Fasting Required</td>
              {items.map((item, idx) => (
                <td key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>{item.requires_fasting ? '✅ Yes' : '❌ No'}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Action</td>
              {items.map((item, idx) => (
                <td key={idx} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                  <button
                    onClick={() => alert(`Booking ${item.test_name} - Proceed to payment`)}
                    style={{ backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.75rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
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
  );
};

export default DiagnosticsCompareResult;