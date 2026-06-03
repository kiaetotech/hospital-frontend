import React, { useState } from 'react';
import DiagnosticsCustomPackage from './DiagnosticsCustomPackage';

// Categories defined directly in this file
const testCategories = [
  {
    code: 'BLD',
    name: '🩸 Blood Tests',
    color: '#e74c3c',
    icon: '🩸',
    subcategories: [
      { name: 'Hematology', tests: ['Complete Blood Count', 'Hemoglobin', 'White Blood Cell Count', 'Platelet Count'] },
      { name: 'Biochemistry', tests: ['Glucose Fasting', 'HbA1c', 'Liver Function Test', 'Kidney Function Test'] },
      { name: 'Hormones', tests: ['TSH', 'T3', 'T4', 'Cortisol'] }
    ]
  },
  {
    code: 'IMG',
    name: '📷 Medical Imaging',
    color: '#3498db',
    icon: '📷',
    subcategories: [
      { name: 'X-ray', tests: ['Chest X-ray', 'Limb X-ray', 'Spine X-ray'] },
      { name: 'CT', tests: ['CT Head', 'CT Chest', 'CT Abdomen'] },
      { name: 'MRI', tests: ['MRI Brain', 'MRI Spine', 'MRI Joints'] }
    ]
  },
  {
    code: 'CRD',
    name: '❤️ Cardiac Diagnostics',
    color: '#e67e22',
    icon: '❤️',
    subcategories: [
      { name: 'ECG', tests: ['ECG 12-lead', 'Stress ECG (TMT)', 'Holter Monitor'] }
    ]
  }
];

const Diagnostics = () => {
  const [activeTab, setActiveTab] = useState('labtests');
  const [selectedTests, setSelectedTests] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [expandedMainCat, setExpandedMainCat] = useState({});
  const [expandedSubCat, setExpandedSubCat] = useState({});

  const toggleMainCategory = (code) => {
    setExpandedMainCat(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleSubCategory = (mainCode, subName) => {
    const key = `${mainCode}_${subName}`;
    setExpandedSubCat(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTest = (testName) => {
    if (selectedTests.includes(testName)) {
      setSelectedTests(selectedTests.filter(t => t !== testName));
    } else {
      setSelectedTests([...selectedTests, testName]);
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

  const tabStyle = { padding: '10px 20px', fontSize: '16px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontWeight: 'bold', marginRight: '10px' };
  const activeTabStyle = { ...tabStyle, borderBottom: '3px solid #10b981', color: '#10b981' };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>🔬 Diagnostics</h1>
      
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('labtests')} style={activeTab === 'labtests' ? activeTabStyle : tabStyle}>📋 Lab Tests</button>
        <button onClick={() => setActiveTab('packages')} style={activeTab === 'packages' ? activeTabStyle : tabStyle}>🏥 Health Packages</button>
        <button onClick={() => setActiveTab('custom')} style={activeTab === 'custom' ? activeTabStyle : tabStyle}>✨ Build Custom Package</button>
      </div>

      {activeTab === 'labtests' && (
        <div>
          {testCategories.map(category => (
            <div key={category.code} style={{ marginBottom: '15px', border: `1px solid ${category.color}`, borderRadius: '8px' }}>
              <div onClick={() => toggleMainCategory(category.code)} style={{ backgroundColor: category.color, color: 'white', padding: '12px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{category.icon} {category.name}</span>
                <span>{expandedMainCat[category.code] ? '▼' : '▶'}</span>
              </div>
              
              {expandedMainCat[category.code] && (
                <div style={{ backgroundColor: '#f9fafb', padding: '10px' }}>
                  {category.subcategories.map(sub => (
                    <div key={sub.name} style={{ marginBottom: '10px' }}>
                      <div onClick={() => toggleSubCategory(category.code, sub.name)} style={{ padding: '8px', backgroundColor: '#f3f4f6', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                        <span>📂 {sub.name} ({sub.tests.length} tests)</span>
                        <span>{expandedSubCat[`${category.code}_${sub.name}`] ? '▼' : '▶'}</span>
                      </div>
                      
                      {expandedSubCat[`${category.code}_${sub.name}`] && (
                        <div style={{ padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {sub.tests.map(test => (
                            <label key={test} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '220px' }}>
                              <input type="checkbox" checked={selectedTests.includes(test)} onChange={() => toggleTest(test)} />
                              {test}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'packages' && <div><h2>Health Packages</h2><p>Coming soon</p></div>}
      {activeTab === 'custom' && <DiagnosticsCustomPackage />}

      {selectedTests.length >= 2 && (
        <button onClick={handleCompare} style={{ position: 'fixed', bottom: 20, right: 20, backgroundColor: '#10b981', color: 'white', padding: '15px 30px', border: 'none', borderRadius: 50, cursor: 'pointer' }}>
          Compare {selectedTests.length} Tests
        </button>
      )}
    </div>
  );
};

export default Diagnostics;