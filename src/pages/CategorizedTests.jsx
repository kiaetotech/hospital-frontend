import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategorizedTests = ({ selectedTests, setSelectedTests, onCompare }) => {
  const [allTests, setAllTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = 'https://hospital-backend-production-7d0f.up.railway.app/api';

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      console.log('Fetching tests...');
      const res = await axios.get(`${API_URL}/diagnostics/tests`);
      console.log('Full Response:', res.data);
      
      if (res.data?.data) {
        setAllTests(res.data.data);
        console.log('Tests count:', res.data.data.length);
        console.log('First test:', res.data.data[0]);
      } else {
        setError('No data array in response');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
  }

  if (allTests.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No tests found in database.</p>
        <button 
          onClick={() => window.open('https://hospital-backend-production-7d0f.up.railway.app/api/diagnostics/create-master-catalog', '_blank')}
          style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Click to Import Tests
        </button>
      </div>
    );
  }

  // Show what categories exist
  const categories = [...new Set(allTests.map(t => t.major_category))];
  const subCategories = [...new Set(allTests.map(t => t.sub_category))];

  return (
    <div>
      <h3>Debug Info:</h3>
      <p>Total Tests: {allTests.length}</p>
      <p>Categories found: {categories.join(', ')}</p>
      <p>SubCategories found: {subCategories.join(', ')}</p>
      
      <h3>First 5 Tests:</h3>
      <ul>
        {allTests.slice(0, 5).map(t => (
          <li key={t._id}>{t.test_name} - Category: {t.major_category} - Sub: {t.sub_category}</li>
        ))}
      </ul>
    </div>
  );
};

export default CategorizedTests;

