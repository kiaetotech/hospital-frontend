import React, { useState } from 'react';
import DiagnosticsCustomPackage from './DiagnosticsCustomPackage';
import CategorizedTests from './CategorizedTests';

const Diagnostics = () => {
  const [activeTab, setActiveTab] = useState('labtests');
  const [selectedTests, setSelectedTests] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

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

  const handleCompare = () => {
    if (selectedTests.length >= 2) {
      setShowCompare(true);
    } else {
      alert('Please select at least 2 tests to compare');
    }
  };

  if (showCompare) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        <button 
          onClick={() => setShowCompare(false)} 
          style={{ marginBottom: '20px', cursor: 'pointer', padding: '8px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          ← Back to Test Selection
        </button>
        <DiagnosticsCustomPackage preselectedTests={selectedTests} />
      </div>
    );
  }

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

      {activeTab === 'labtests' && (
        <CategorizedTests 
          selectedTests={selectedTests}
          setSelectedTests={setSelectedTests}
          onCompare={handleCompare}
        />
      )}
      {activeTab === 'packages' && <PreventivePackages />}
      {activeTab === 'custom' && <DiagnosticsCustomPackage />}
    </div>
  );
};

// Preventive Health Check Packages Component
const PreventivePackages = () => {
  const [packages] = useState([
    { id: 1, name: 'Full Body Checkup', provider: 'ABC Diagnostics', description: 'Complete health checkup with 65+ tests', mrp: 2500, price: 1299, homeCollection: true, reportTime: '24 hours', popular: true },
    { id: 2, name: 'Cardiac Care Package', provider: 'ABC Diagnostics', description: 'Heart health checkup with lipid profile, ECG', mrp: 1800, price: 999, homeCollection: true, reportTime: '12 hours', popular: true },
    { id: 3, name: 'Diabetes Profile', provider: 'HealthCare Diagnostics', description: 'Complete diabetes screening', mrp: 1200, price: 699, homeCollection: true, reportTime: '8 hours', popular: true },
    { id: 4, name: 'Women Health Package', provider: 'ABC Diagnostics', description: 'Comprehensive health checkup for women', mrp: 2200, price: 1199, homeCollection: true, reportTime: '24 hours', popular: false },
    { id: 5, name: 'Senior Citizen Package', provider: 'ABC Diagnostics', description: 'Health checkup for elderly', mrp: 2000, price: 1099, homeCollection: true, reportTime: '24 hours', popular: false },
    { id: 6, name: 'Liver Profile', provider: 'ABC Diagnostics', description: 'Complete liver function tests', mrp: 1500, price: 799, homeCollection: true, reportTime: '8 hours', popular: false }
  ]);

  const handleBook = (pkg) => {
    alert(`Booking ${pkg.name} with ${pkg.provider}\nPrice: ₹${pkg.price}`);
  };

  return (
    <div>
      <h2>Preventive Health Check Packages</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {packages.map(pkg => (
          <div key={pkg.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', backgroundColor: 'white' }}>
            {pkg.popular && <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>🔥 Popular</span>}
            <h3>{pkg.name}</h3>
            <p style={{ color: '#6b7280' }}>{pkg.description}</p>
            <p>🏥 {pkg.provider}</p>
            <div><span style={{ textDecoration: 'line-through' }}>₹{pkg.mrp}</span> <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>₹{pkg.price}</span></div>
            <button onClick={() => handleBook(pkg)} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}>Book Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Diagnostics;