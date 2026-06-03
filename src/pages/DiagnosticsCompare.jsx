import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const DiagnosticsCompare = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const ids = queryParams.get('ids')?.split(',') || [];
  const type = queryParams.get('type') || 'tests';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ids.length > 0) {
      fetchCompare();
    } else {
      setLoading(false);
      setError('No items selected for comparison');
    }
  }, [ids]);

  const fetchCompare = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/diagnostics/compare', { type, ids });
      console.log('Compare data received:', res.data);
      if (res.data.success && res.data.data) {
        setItems(res.data.data);
      } else {
        setError('No data received');
      }
    } catch (err) {
      console.error('Compare error:', err);
      setError(err.message || 'Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (item) => {
    const originalPrice = item.min_price || item.price || 0;
    const discountedPrice = Math.round(originalPrice * 0.9);
    navigate('/diagnostics-booking', {
      state: {
        itemType: type === 'tests' ? 'test' : 'package',
        itemId: item._id,
        itemName: item.test_name || item.package_name,
        originalPrice: originalPrice,
        discountedPrice: discountedPrice
      }
    });
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
        <button onClick={() => navigate('/diagnostics-safe')}>Go Back</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No items to compare.</p>
        <button onClick={() => navigate('/diagnostics-safe')}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem' }}>
        <button 
          onClick={() => navigate('/diagnostics-safe')} 
          style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
        >
          ← Back to Tests
        </button>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Compare {type === 'tests' ? 'Lab Tests' : 'Packages'}
        </h2>
        
        {items.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e5e7eb' }}>Feature</th>
                  {items.map((item, idx) => (
                    <th key={item._id || idx} style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e5e7eb', minWidth: '150px' }}>
                      {item.test_name || item.package_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Category */}
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Category</td>
                  {items.map((item, idx) => (
                    <td key={idx} style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>
                      {item.major_category_name || '-'}
                    </td>
                  ))}
                </tr>
                
                {/* Original Price */}
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Original Price</td>
                  {items.map((item, idx) => {
                    const price = item.min_price || item.price || 0;
                    return (
                      <td key={idx} style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>
                        ₹{price}
                      </td>
                    );
                  })}
                </tr>
                
                {/* Discounted Price */}
                <tr style={{ backgroundColor: '#d1fae5' }}>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>Discounted Price (10% off)</td>
                  {items.map((item, idx) => {
                    const price = item.min_price || item.price || 0;
                    const discounted = Math.round(price * 0.9);
                    return (
                      <td key={idx} style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 'bold', color: '#10b981' }}>
                        ₹{discounted}
                      </td>
                    );
                  })}
                </tr>
                
                {/* You Save */}
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>You Save</td>
                  {items.map((item, idx) => {
                    const price = item.min_price || item.price || 0;
                    const discounted = Math.round(price * 0.9);
                    const saving = price - discounted;
                    const percent = price > 0 ? Math.round((saving / price) * 100) : 0;
                    return (
                      <td key={idx} style={{ padding: '0.75rem', border: '1px solid #e5e7eb', color: '#10b981' }}>
                        ₹{saving} ({percent}% off)
                      </td>
                    );
                  })}
                </tr>
                
                {/* Report Time */}
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Report Time</td>
                  {items.map((item, idx) => (
                    <td key={idx} style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>
                      {item.turnaround_time_default_hours || 24} hours
                    </td>
                  ))}
                </tr>
                
                {/* Home Collection */}
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Home Collection</td>
                  {items.map((item, idx) => (
                    <td key={idx} style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>
                      {item.home_collection_possible ? '✅ Yes' : '❌ No'}
                    </td>
                  ))}
                </tr>
                
                {/* Fasting Required */}
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Fasting Required</td>
                  {items.map((item, idx) => (
                    <td key={idx} style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>
                      {item.requires_fasting ? '✅ Yes' : '❌ No'}
                    </td>
                  ))}
                </tr>
                
                {/* Labs Offering */}
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Labs Offering</td>
                  {items.map((item, idx) => (
                    <td key={idx} style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>
                      {item.provider_count || 0} labs
                    </td>
                  ))}
                </tr>
                
                {/* Book Button */}
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Action</td>
                  {items.map((item, idx) => (
                    <td key={idx} style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                      <button
                        onClick={() => handleBook(item)}
                        style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                      >
                        Book Now
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticsCompare;