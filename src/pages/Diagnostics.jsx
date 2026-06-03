import axios from 'axios';
import React, { useState } from 'react';
import DiagnosticsCustomPackage from './DiagnosticsCustomPackage';
import DiagnosticsList from './DiagnosticsList';

const Diagnostics = () => {
  const [activeTab, setActiveTab] = useState('labtests');

  const tabStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'transparent',
    fontWeight: 'bold',
    marginRight: '10px'
  };

  const activeTabStyle = {
    ...tabStyle,
    borderBottom: '3px solid #10b981',
    color: '#10b981'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>🔬 Diagnostics</h1>
      
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('labtests')} style={activeTab === 'labtests' ? activeTabStyle : tabStyle}>
          📋 Lab Tests
        </button>
        <button onClick={() => setActiveTab('packages')} style={activeTab === 'packages' ? activeTabStyle : tabStyle}>
          🏥 Health Packages
        </button>
        <button onClick={() => setActiveTab('custom')} style={activeTab === 'custom' ? activeTabStyle : tabStyle}>
          ✨ Build Custom Package
        </button>
      </div>

      {activeTab === 'labtests' && <AllLabTests />}
      {activeTab === 'packages' && <PreventivePackages />}
      {activeTab === 'custom' && <DiagnosticsCustomPackage />}
    </div>
  );
};

// Component to show ALL tests with categories
// Component to show ALL tests with MAIN CATEGORIES and SUBCATEGORIES
const AllLabTests = () => {
  const [allTests, setAllTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTests, setSelectedTests] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [expandedMainCat, setExpandedMainCat] = useState({});
  const [expandedSubCat, setExpandedSubCat] = useState({});

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  React.useEffect(() => {
    axios.get(`${API_URL}/diagnostics/tests`)
      .then(res => {
        if (res.data?.data) setAllTests(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggleMainCategory = (cat) => {
    setExpandedMainCat(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleSubCategory = (mainCat, subCat) => {
    const key = `${mainCat}_${subCat}`;
    setExpandedSubCat(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTest = (test) => {
    if (selectedTests.find(t => t._id === test._id)) {
      setSelectedTests(selectedTests.filter(t => t._id !== test._id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handleCompare = () => {
    if (selectedTests.length >= 2) {
      setShowCompare(true);
    } else {
      alert('Select at least 2 tests');
    }
  };

  if (showCompare) {
    return <DiagnosticsCustomPackage preselectedTests={selectedTests} />;
  }

  if (loading) return <div>Loading tests...</div>;

  // Group by main category first, then by subcategory
  const groupedByMainCat = {};
  allTests.forEach(test => {
    const mainCat = test.major_category || 'OTHER';
    const subCat = test.sub_category || 'General';
    
    if (!groupedByMainCat[mainCat]) {
      groupedByMainCat[mainCat] = {};
    }
    if (!groupedByMainCat[mainCat][subCat]) {
      groupedByMainCat[mainCat][subCat] = [];
    }
    groupedByMainCat[mainCat][subCat].push(test);
  });

  const mainCategoryNames = {
    'BLD': '🩸 Blood Tests',
    'IMG': '📷 Medical Imaging',
    'CRD': '❤️ Cardiac Diagnostics',
    'URN': '💧 Urine Tests',
    'STL': '🧫 Stool Tests',
    'NEU': '🧠 Neurodiagnostics',
    'PFT': '🫁 Pulmonary Function',
    'NM': '⚛️ Nuclear Medicine',
    'END': '🔬 Endoscopy',
    'CSF': '💧 Body Fluids',
    'CYT': '🔬 Pathology/Biopsy',
    'GEN': '🧬 Genetic Tests',
    'MIC': '🦠 Microbiology',
    'SPL': '⭐ Special Tests'
  };

  const categoryColors = {
    'BLD': '#e74c3c',
    'IMG': '#3498db',
    'CRD': '#e67e22',
    'URN': '#f39c12',
    'STL': '#27ae60',
    'NEU': '#9b59b6',
    'PFT': '#1abc9c',
    'NM': '#16a085',
    'END': '#2c3e50',
    'CSF': '#8e44ad',
    'CYT': '#c0392b',
    'GEN': '#2980b9',
    'MIC': '#d35400',
    'SPL': '#7f8c8d'
  };

  return (
    <div>
      <p style={{ marginBottom: '15px' }}>Total {allTests.length} tests. Select 2 or more to compare prices.</p>
      
      {Object.keys(groupedByMainCat).map(mainCat => {
        const mainCatName = mainCategoryNames[mainCat] || mainCat;
        const bgColor = categoryColors[mainCat] || '#6b7280';
        const subCategories = groupedByMainCat[mainCat];
        
        return (
          <div key={mainCat} style={{ marginBottom: '15px', border: `1px solid ${bgColor}`, borderRadius: '8px', overflow: 'hidden' }}>
            {/* Main Category Header */}
            <div
              onClick={() => toggleMainCategory(mainCat)}
              style={{
                backgroundColor: bgColor,
                color: 'white',
                padding: '12px 15px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              <span>{mainCatName}</span>
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
                        padding: '8px 15px',
                        backgroundColor: '#f3f4f6',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        borderLeft: `4px solid ${bgColor}`
                      }}
                    >
                      <span>📂 {subCat} ({subCategories[subCat].length} tests)</span>
                      <span>{expandedSubCat[`${mainCat}_${subCat}`] ? '▼' : '▶'}</span>
                    </div>
                    
                    {/* Tests */}
                    {expandedSubCat[`${mainCat}_${subCat}`] && (
                      <div style={{ padding: '10px 15px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {subCategories[subCat].map(test => (
                          <label key={test._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '220px', padding: '5px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={!!selectedTests.find(t => t._id === test._id)}
                              onChange={() => toggleTest(test)}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '14px' }}>{test.test_name}</span>
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
        <button
          onClick={handleCompare}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#10b981',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '50px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000
          }}
        >
          Compare {selectedTests.length} Tests
        </button>
      )}
    </div>
  );
};

// Health Packages Component
const PreventivePackages = () => {
  const [packages] = useState([
    { id: 1, name: 'Full Body Checkup', provider: 'ABC Diagnostics', price: 1299, original: 2500 },
    { id: 2, name: 'Cardiac Care Package', provider: 'ABC Diagnostics', price: 999, original: 1800 },
    { id: 3, name: 'Diabetes Profile', provider: 'HealthCare Diagnostics', price: 699, original: 1200 }
  ]);

  return (
    <div>
      <h2>Health Packages</h2>
      {packages.map(pkg => (
        <div key={pkg.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
          <h3>{pkg.name}</h3>
          <p>Provider: {pkg.provider}</p>
          <p><span style={{ textDecoration: 'line-through' }}>₹{pkg.original}</span> <strong>₹{pkg.price}</strong></p>
          <button style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Book Now</button>
        </div>
      ))}
    </div>
  );
};

export default Diagnostics;