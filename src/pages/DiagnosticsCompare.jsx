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

  useEffect(() => {
    if (ids.length > 0) {
      fetchCompare();
    } else {
      setLoading(false);
    }
  }, [ids]);

  const fetchCompare = async () => {
    setLoading(true);
    try {
      const res = await api.post('/diagnostics/compare', { type, ids });
      setItems(res.data.data || []);
    } catch (error) {
      console.error('Compare error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading comparison...</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No items to compare.</p>
        <button onClick={() => navigate('/diagnostics')}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem' }}>
        <button onClick={() => navigate('/diagnostics')} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Compare {type === 'tests' ? 'Tests' : 'Packages'}</h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e5e7eb' }}>Feature</th>
                {items.map(item => (
                  <th key={item._id} style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e5e7eb' }}>{item.test_name || item.package_name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>Category</td>
                {items.map(item => <td key={item._id} style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>{item.major_category_name || '-'}</td>)}
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>Price</td>
                {items.map(item => <td key={item._id} style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>₹{Math.round((item.min_price || item.price) * 0.9)}</td>)}
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>Report Time</td>
                {items.map(item => <td key={item._id} style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>{item.turnaround_time_default_hours || 24} hours</td>)}
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>Home Collection</td>
                {items.map(item => <td key={item._id} style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>{item.home_collection_possible ? '✅ Yes' : '❌ No'}</td>)}
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>Fasting Required</td>
                {items.map(item => <td key={item._id} style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>{item.requires_fasting ? '✅ Yes' : '❌ No'}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsCompare;