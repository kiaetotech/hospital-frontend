import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategorizedTests = ({ selectedTests, setSelectedTests, onCompare }) => {
  const [allTests, setAllTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  // Category display mapping
  const categoryDisplay = {
    'BLD': { name: 'Blood Tests', icon: '🩸', color: '#e74c3c' },
    'IMG': { name: 'Medical Imaging', icon: '📷', color: '#3498db' },
    'CRD': { name: 'Cardiac Diagnostics', icon: '❤️', color: '#e67e22' },
    'URN': { name: 'Urine Tests', icon: '💧', color: '#f39c12' },
    'STL': { name: 'Stool Tests', icon: '🧫', color: '#27ae60' },
    'NEU': { name: 'Neurodiagnostics', icon: '🧠', color: '#9b59b6' },
    'PFT': { name: 'Pulmonary Function', icon: '🫁', color: '#1abc9c' },
    'NM': { name: 'Nuclear Medicine', icon: '⚛️', color: '#16a085' },
    'END': { name: 'Endoscopy', icon: '🔬', color: '#2c3e50' },
    'CSF': { name: 'Body Fluids', icon: '💧', color: '#8e44ad' },
    'CYT': { name: 'Pathology/Biopsy', icon: '🔬', color: '#c0392b' },
    'GEN': { name: 'Genetic Tests', icon: '🧬', color: '#2980b9' },
    'MIC': { name: 'Microbiology', icon: '🦠', color: '#d35400' },
    'SPL': { name: 'Special Tests', icon: '⭐', color: '#7f8c8d' }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const res = await axios.get(`${API_URL}/diagnostics/tests`);
      console.log('Full API Response:', res.data);
      
      let tests = [];
      if (res.data?.data) {
        tests = res.data.data;
      } else if (res.data?.tests) {
        tests = res.data.tests;
      }
      
      console.log('Tests count:', tests.length);
      console.log('First test object:', tests[0]);
      
      // Log what categories exist
      const categories = [...new Set(tests.map(t => t.major_category))];
      console.log('Categories found:', categories);
      
      setAllTests(tests);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };

  const toggleTest = (test) => {
    if (selectedTests.find(t => t._id === test._id)) {
      setSelectedTests(selectedTests.filter(t => t._id !== test._id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  // Group tests by major_category
  const groupedTests = {};
  allTests.forEach(test => {
    let cat = test.major_category || test.major_category_name || 'Other';
    if (cat === 'BLD') cat = 'BLD';
    if (cat === 'Blood Tests') cat = 'BLD';
    
    if (!groupedTests[cat]) {
      groupedTests[cat] = [];
    }
    groupedTests[cat].push(test);
  });

  // Filter by search
  let filteredGroups = {};
  Object.keys(groupedTests).forEach(cat => {
    const filtered = groupedTests[cat].filter(test =>
      test.test_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      filteredGroups[cat] = filtered;
    }
  });

  const getCategoryInfo = (catCode) => {
    return categoryDisplay[catCode] || { name: catCode, icon: '📋', color: '#6b7280' };
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;
  }

  if (allTests.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No tests found. Please run import:</p>
        <code>https://hospital-backend-production-8de3.up.railway.app/api/diagnostics/import-all</code>
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        placeholder="🔍 Search tests..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '16px' }}
      />

      <p>Total Tests: {allTests.length} | Categories: {Object.keys(filteredGroups).length}</p>

      {Object.keys(filteredGroups).map(category => {
        const catInfo = getCategoryInfo(category);
        return (
          <div key={category} style={{ marginBottom: '15px', border: `1px solid ${catInfo.color}`, borderRadius: '8px', overflow: 'hidden' }}>
            <div
              onClick={() => toggleCategory(category)}
              style={{
                backgroundColor: catInfo.color,
                color: 'white',
                padding: '15px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{catInfo.icon} {catInfo.name} ({filteredGroups[category].length} tests)</span>
              <span>{expandedCategory === category ? '▼' : '▶'}</span>
            </div>
            
            {expandedCategory === category && (
              <div style={{ padding: '15px', backgroundColor: '#f9fafb' }}>
                {filteredGroups[category].map(test => (
                  <label key={test._id} style={{ display: 'flex', alignItems: 'center', padding: '8px', borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!selectedTests.find(t => t._id === test._id)}
                      onChange={() => toggleTest(test)}
                      style={{ marginRight: '12px', width: '18px', height: '18px' }}
                    />
                    <span>{test.test_name}</span>
                    <span style={{ marginLeft: '10px', fontSize: '11px', color: '#888' }}>{test.sub_category || ''}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}

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