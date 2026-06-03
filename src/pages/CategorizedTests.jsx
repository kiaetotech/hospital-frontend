import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategorizedTests = ({ selectedTests, setSelectedTests, onCompare }) => {
  const [allTests, setAllTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      console.log('Fetching tests...');
      const res = await axios.get(`${API_URL}/diagnostics/tests`);
      console.log('Response:', res.data);
      if (res.data?.data) {
        setAllTests(res.data.data);
        console.log('Tests loaded:', res.data.data.length);
      } else if (res.data?.tests) {
        setAllTests(res.data.tests);
        console.log('Tests loaded:', res.data.tests.length);
      }
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTest = (test) => {
    if (selectedTests.find(t => t._id === test._id)) {
      setSelectedTests(selectedTests.filter(t => t._id !== test._id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const filteredTests = allTests.filter(test =>
    test.test_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;
  }

  if (allTests.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No tests found in database.</p>
        <p>Please run the import endpoint first:</p>
        <code style={{ backgroundColor: '#f3f4f6', padding: '10px', display: 'block', marginTop: '10px' }}>
          https://hospital-backend-production-8de3.up.railway.app/api/diagnostics/import-all
        </code>
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        placeholder="🔍 Search tests (CBC, MRI, ECG, Thyroid...)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '16px' }}
      />

      <p style={{ marginBottom: '15px', color: '#6b7280' }}>
        Found {allTests.length} tests. Select 2 or more to compare prices.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredTests.map(test => (
          <label key={test._id} style={{ display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'white' }}>
            <input
              type="checkbox"
              checked={!!selectedTests.find(t => t._id === test._id)}
              onChange={() => toggleTest(test)}
              style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ flex: 1 }}>{test.test_name}</span>
            <span style={{ fontSize: '12px', color: '#888' }}>{test.major_category_name || test.major_category || 'Lab Test'}</span>
          </label>
        ))}
      </div>

      {selectedTests.length >= 2 && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
          <button
            onClick={onCompare}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '15px 30px',
              border: 'none',
              borderRadius: '50px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            Compare {selectedTests.length} Tests
          </button>
        </div>
      )}
    </div>
  );
};

export default CategorizedTests;