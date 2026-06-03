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
const AllLabTests = () => {
  const [allTests, setAllTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTests, setSelectedTests] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

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

  // Group by major_category
  const grouped = {};
  allTests.forEach(test => {
    const cat = test.major_category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(test);
  });

  const categoryNames = {
    'BLD': '🩸 Blood Tests',
    'IMG': '📷 Medical Imaging',
    'CRD': '❤️ Cardiac Diagnostics',
    'URN': '💧 Urine Tests',
    'STL': '🧫 Stool Tests',
    'NEU': '🧠 Neurodiagnostics',
    'PFT': '🫁 Pulmonary Function',
    'END': '🔬 Endoscopy',
    'CSF': '💧 Body Fluids',
    'CYT': '🔬 Pathology/Biopsy',
    'GEN': '🧬 Genetic Tests',
    'MIC': '🦠 Microbiology',
    'SPL': '⭐ Special Tests'
  };

  return (
    <div>
      <p>Select 2 or more tests to compare prices. Total tests: {allTests.length}</p>
      
      {Object.keys(grouped).map(cat => (
        <div key={cat} style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <div style={{ backgroundColor: '#f0f0f0', padding: '10px', fontWeight: 'bold' }}>
            {categoryNames[cat] || cat}
          </div>
          <div style={{ padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {grouped[cat].map(test => (
              <label key={test._id} style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '200px' }}>
                <input type="checkbox" checked={selectedTests.includes(test._id)} onChange={() => toggleTest(test)} />
                {test.test_name}
              </label>
            ))}
          </div>
        </div>
      ))}
      
      {selectedTests.length >= 2 && (
        <button onClick={handleCompare} style={{ position: 'fixed', bottom: 20, right: 20, backgroundColor: '#10b981', color: 'white', padding: '15px 30px', border: 'none', borderRadius: 50, cursor: 'pointer' }}>
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