import React, { useState } from 'react';
import DiagnosticsList from './DiagnosticsList';
import DiagnosticsCustomPackage from './DiagnosticsCustomPackage';

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
      
      {/* Tab Buttons */}
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('labtests')}
          style={activeTab === 'labtests' ? activeTabStyle : tabStyle}
        >
          📋 Lab Tests
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          style={activeTab === 'packages' ? activeTabStyle : tabStyle}
        >
          🏥 Preventive Health Check Packages
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          style={activeTab === 'custom' ? activeTabStyle : tabStyle}
        >
          ✨ Build Custom Package
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'labtests' && <DiagnosticsList />}
      {activeTab === 'packages' && <PreventivePackages />}
      {activeTab === 'custom' && <DiagnosticsCustomPackage />}
    </div>
  );
};

// Preventive Health Check Packages Component
const PreventivePackages = () => {
  const [packages, setPackages] = useState([
    {
      id: 1,
      name: 'Full Body Checkup',
      provider: 'ABC Diagnostics',
      description: 'Complete health checkup with 65+ tests',
      mrp: 2500,
      price: 1299,
      homeCollection: true,
      reportTime: '24 hours',
      tags: ['fullbody', 'annual'],
      popular: true
    },
    {
      id: 2,
      name: 'Cardiac Care Package',
      provider: 'ABC Diagnostics',
      description: 'Heart health checkup with lipid profile, ECG, and more',
      mrp: 1800,
      price: 999,
      homeCollection: true,
      reportTime: '12 hours',
      tags: ['cardiac', 'heart'],
      popular: true
    },
    {
      id: 3,
      name: 'Diabetes Profile',
      provider: 'HealthCare Diagnostics',
      description: 'Complete diabetes screening with HbA1c, fasting, post meal',
      mrp: 1200,
      price: 699,
      homeCollection: true,
      reportTime: '8 hours',
      tags: ['diabetes', 'sugar'],
      popular: true
    },
    {
      id: 4,
      name: 'Women Health Package',
      provider: 'ABC Diagnostics',
      description: 'Comprehensive health checkup for women',
      mrp: 2200,
      price: 1199,
      homeCollection: true,
      reportTime: '24 hours',
      tags: ['women', 'female'],
      popular: false
    },
    {
      id: 5,
      name: 'Senior Citizen Package',
      provider: 'ABC Diagnostics',
      description: 'Health checkup for elderly with age-specific tests',
      mrp: 2000,
      price: 1099,
      homeCollection: true,
      reportTime: '24 hours',
      tags: ['senior', 'elderly'],
      popular: false
    },
    {
      id: 6,
      name: 'Liver Profile',
      provider: 'ABC Diagnostics',
      description: 'Complete liver function tests',
      mrp: 1500,
      price: 799,
      homeCollection: true,
      reportTime: '8 hours',
      tags: ['liver', 'hepatic'],
      popular: false
    }
  ]);

  const handleBook = (pkg) => {
    alert(`Booking ${pkg.name} with ${pkg.provider}\nPrice: ₹${pkg.price}\nProceeding to payment...`);
  };

  return (
    <div>
      <h2>Preventive Health Check Packages</h2>
      <p>Choose from our curated health packages at discounted prices</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {packages.map(pkg => (
          <div key={pkg.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            {pkg.popular && <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', marginBottom: '10px', display: 'inline-block' }}>🔥 Popular</span>}
            <h3 style={{ margin: '10px 0' }}>{pkg.name}</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '10px' }}>{pkg.description}</p>
            <p style={{ fontSize: '14px', color: '#4b5563' }}>🏥 {pkg.provider}</p>
            <div style={{ margin: '10px 0' }}>
              <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{pkg.mrp}</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginLeft: '10px' }}>₹{pkg.price}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '12px', color: '#6b7280' }}>
              <span>🏠 {pkg.homeCollection ? 'Home Collection Available' : 'Lab Visit Required'}</span>
              <span>⏱️ {pkg.reportTime}</span>
            </div>
            <button
              onClick={() => handleBook(pkg)}
              style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', marginTop: '10px' }}
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Diagnostics;