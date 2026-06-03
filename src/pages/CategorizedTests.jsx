import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategorizedTests = ({ selectedTests, setSelectedTests, onCompare }) => {
  const [allTests, setAllTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMainCat, setExpandedMainCat] = useState({});
  const [expandedSubCat, setExpandedSubCat] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  // Main Category Display
  const mainCategories = {
    'BLD': { name: '🩸 Blood Tests', color: '#e74c3c', order: 1 },
    'IMG': { name: '📷 Medical Imaging', color: '#3498db', order: 2 },
    'CRD': { name: '❤️ Cardiac Diagnostics', color: '#e67e22', order: 3 },
    'URN': { name: '💧 Urine Tests', color: '#f39c12', order: 4 },
    'STL': { name: '🧫 Stool Tests', color: '#27ae60', order: 5 },
    'NEU': { name: '🧠 Neurodiagnostics', color: '#9b59b6', order: 6 },
    'PFT': { name: '🫁 Pulmonary Function', color: '#1abc9c', order: 7 },
    'NM': { name: '⚛️ Nuclear Medicine', color: '#16a085', order: 8 },
    'END': { name: '🔬 Endoscopy', color: '#2c3e50', order: 9 },
    'CSF': { name: '💧 Body Fluids', color: '#8e44ad', order: 10 },
    'CYT': { name: '🔬 Pathology/Biopsy', color: '#c0392b', order: 11 },
    'GEN': { name: '🧬 Genetic Tests', color: '#2980b9', order: 12 },
    'MIC': { name: '🦠 Microbiology', color: '#d35400', order: 13 },
    'SPL': { name: '⭐ Special Tests', color: '#7f8c8d', order: 14 }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const res = await axios.get(`${API_URL}/diagnostics/tests`);
      console.log('API Response:', res.data);
      if (res.data?.data) {
        setAllTests(res.data.data);
        console.log('Tests loaded:', res.data.data.length);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMainCategory = (cat) => {
    setExpandedMainCat(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const toggleSubCategory = (mainCat, subCat) => {
    const key = `${mainCat}_${subCat}`;
    setExpandedSubCat(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleTest = (test) => {
    if (selectedTests.find(t => t._id === test._id)) {
      setSelectedTests(selectedTests.filter(t => t._id !== test._id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  // Group tests by major_category and sub_category
  const groupTests = () => {
    const grouped = {};
    
    allTests.forEach(test => {
      const mainCat = test.major_category || 'OTHER';
      const subCat = test.sub_category || 'General';
      
      if (!grouped[mainCat]) {
        grouped[mainCat] = {};
      }
      if (!grouped[mainCat][subCat]) {
        grouped[mainCat][subCat] = [];
      }
      grouped[mainCat][subCat].push(test);
    });
    
    return grouped;
  };

  const groupedTests = groupTests();

  // Filter by search term
  const getFilteredGroups = () => {
    if (!searchTerm) return groupedTests;
    
    const filtered = {};
    Object.keys(groupedTests).forEach(mainCat => {
      Object.keys(groupedTests[mainCat]).forEach(subCat => {
        const filteredTests = groupedTests[mainCat][subCat].filter(test =>
          test.test_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filteredTests.length > 0) {
          if (!filtered[mainCat]) filtered[mainCat] = {};
          filtered[mainCat][subCat] = filteredTests;
        }
      });
    });
    return filtered;
  };

  const displayedGroups = getFilteredGroups();

  // Sort categories by order
  const sortedCategories = Object.keys(displayedGroups).sort((a, b) => {
    const orderA = mainCategories[a]?.order || 999;
    const orderB = mainCategories[b]?.order || 999;
    return orderA - orderB;
  });

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;
  }

  if (allTests.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No tests found. Please run master catalog import.</p>
        <button 
          onClick={() => window.open('https://hospital-backend-production-8de3.up.railway.app/api/diagnostics/create-master-catalog', '_blank')}
          style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}
        >
          Click to Import Master Catalog
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        placeholder="🔍 Search tests (CBC, MRI, ECG, Thyroid, X-ray...)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '16px' }}
      />

      <p style={{ marginBottom: '15px', color: '#6b7280' }}>
        Total {allTests.length} tests. Select 2 or more to compare prices.
      </p>

      {sortedCategories.map(mainCat => {
        const catInfo = mainCategories[mainCat] || { name: mainCat, color: '#6b7280', order: 999 };
        const subCategories = displayedGroups[mainCat];
        const totalTestsInCat = Object.values(subCategories).reduce((sum, arr) => sum + arr.length, 0);
        
        return (
          <div key={mainCat} style={{ marginBottom: '15px', border: `1px solid ${catInfo.color}`, borderRadius: '8px', overflow: 'hidden' }}>
            {/* Main Category Header */}
            <div
              onClick={() => toggleMainCategory(mainCat)}
              style={{
                backgroundColor: catInfo.color,
                color: 'white',
                padding: '15px 20px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              <span>{catInfo.name} ({totalTestsInCat} tests)</span>
              <span>{expandedMainCat[mainCat] ? '▼' : '▶'}</span>
            </div>
            
            {/* Subcategories */}
            {expandedMainCat[mainCat] && (
              <div style={{ backgroundColor: '#f9fafb' }}>
                {Object.keys(subCategories).map(subCat => (
                  <div key={subCat} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    {/* Subcategory Header */}
                    <div
                      onClick={() => toggleSubCategory(mainCat, subCat)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#f3f4f6',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        borderLeft: `4px solid ${catInfo.color}`
                      }}
                    >
                      <span>📂 {subCat} ({subCategories[subCat].length} tests)</span>
                      <span>{expandedSubCat[`${mainCat}_${subCat}`] ? '▼' : '▶'}</span>
                    </div>
                    
                    {/* Tests */}
                    {expandedSubCat[`${mainCat}_${subCat}`] && (
                      <div style={{ padding: '10px 20px' }}>
                        {subCategories[subCat].map(test => (
                          <label key={test._id} style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', backgroundColor: 'white' }}>
                            <input
                              type="checkbox"
                              checked={!!selectedTests.find(t => t._id === test._id)}
                              onChange={() => toggleTest(test)}
                              style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ flex: 1 }}>{test.test_name}</span>
                            {test.requires_fasting === true && (
                              <span style={{ fontSize: '11px', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '4px', color: '#92400e' }}>
                                🌙 Fasting Required
                              </span>
                            )}
                            <span style={{ fontSize: '12px', color: '#10b981', marginLeft: '10px' }}>
                              Price N/A
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
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