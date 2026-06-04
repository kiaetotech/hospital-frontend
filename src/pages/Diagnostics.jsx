import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DiagnosticsCustomPackage from './DiagnosticsCustomPackage';

// Health Packages Data
const healthPackages = [
  { id: 1, name: 'Full Body Checkup', provider: 'ABC Diagnostics', description: 'Complete health checkup with 65+ tests', mrp: 2500, price: 1299, homeCollection: true, reportTime: '24 hours', popular: true },
  { id: 2, name: 'Cardiac Care Package', provider: 'ABC Diagnostics', description: 'Heart health checkup', mrp: 1800, price: 999, homeCollection: true, reportTime: '12 hours', popular: true },
  { id: 3, name: 'Diabetes Profile', provider: 'HealthCare Diagnostics', description: 'Complete diabetes screening', mrp: 1200, price: 699, homeCollection: true, reportTime: '8 hours', popular: true }
];

// Comparison Results Component
const ComparisonResults = ({ selectedTests, onBack }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  useEffect(() => {
    const fetchComparison = async () => {
      setLoading(true);
      try {
        const res = await axios.post(`${API_URL}/diagnostics/compare-package`, { testIds: selectedTests });
        if (res.data.providers && res.data.providers.length > 0) {
          const sorted = [...res.data.providers].sort((a, b) => a.total_price - b.total_price);
          setProviders(sorted);
        } else {
          setError('No labs found offering all selected tests');
        }
      } catch (err) {
        setError('Error fetching comparison data');
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [selectedTests]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading comparison data...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}<br /><button onClick={onBack}>← Back</button></div>;

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: '20px', cursor: 'pointer' }}>← Back to Tests</button>
      <h2>Comparison Results</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Test / Provider</th>
              {providers.map((p, idx) => (
                <th key={idx} style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: idx === 0 ? '#d1fae5' : '#f3f4f6' }}>
                  {p.provider_name}
                  {idx === 0 && <span style={{ display: 'block', fontSize: '11px', color: '#10b981' }}>⭐ Cheapest</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedTests.map(test => (
              <tr key={test}>
                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>{test}</td>
                {providers.map((p, idx) => (
                  <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    ₹{p.individual_prices?.[test] || 'N/A'}
                  </td>
                ))}
              </tr>
            ))}
            <tr style={{ backgroundColor: '#fef3c7', fontWeight: 'bold' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Total</td>
              {providers.map((p, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>₹{p.total_price}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Rating</td>
              {providers.map((p, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>⭐ {p.rating}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Action</td>
              {providers.map((p, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  <button style={{ backgroundColor: '#10b981', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => alert(`Booking ${p.provider_name}`)}>Book</button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Diagnostics = () => {
  const [activeTab, setActiveTab] = useState('labtests');
  const [selectedTests, setSelectedTests] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [homeCollectionOnly, setHomeCollectionOnly] = useState(false);
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [maxDistance, setMaxDistance] = useState('');
  const [directSearchResults, setDirectSearchResults] = useState([]);
  const [showDirectResults, setShowDirectResults] = useState(false);

  // All test categories
  const testCategories = [
    { code: 'BLD', name: 'Blood Tests', icon: '🩸', color: '#e74c3c', tests: ['Complete Blood Count', 'Hemoglobin', 'Platelet Count', 'ESR', 'Glucose Fasting', 'HbA1c', 'Liver Function Test', 'Kidney Function Test', 'Lipid Profile', 'TSH', 'T3', 'T4', 'Vitamin B12', 'Vitamin D'] },
    { code: 'IMG', name: 'Medical Imaging', icon: '📷', color: '#3498db', tests: ['Chest X-ray', 'Limb X-ray', 'CT Head', 'CT Chest', 'MRI Brain', 'MRI Spine', 'USG Abdomen', 'USG Pelvis'] },
    { code: 'CRD', name: 'Cardiac Diagnostics', icon: '❤️', color: '#e67e22', tests: ['ECG 12-lead', 'Stress ECG', 'Holter Monitor', '2D Echo'] },
    { code: 'URN', name: 'Urine Tests', icon: '💧', color: '#f39c12', tests: ['Urinalysis', 'Urine Culture', 'Urine Protein', 'Urine Pregnancy Test'] },
    { code: 'STL', name: 'Stool Tests', icon: '🧫', color: '#27ae60', tests: ['Stool Routine', 'FOBT', 'Stool Culture'] },
    { code: 'NEU', name: 'Neurodiagnostics', icon: '🧠', color: '#9b59b6', tests: ['Routine EEG', 'Sleep Deprived EEG', 'EMG', 'Nerve Conduction Study'] },
    { code: 'PFT', name: 'Pulmonary Function', icon: '🫁', color: '#1abc9c', tests: ['Spirometry', 'Bronchodilator Reversibility', 'Lung Volumes'] },
    { code: 'END', name: 'Endoscopy', icon: '🔬', color: '#2c3e50', tests: ['EGD', 'Colonoscopy', 'ERCP'] },
    { code: 'CYT', name: 'Pathology/Biopsy', icon: '🔬', color: '#c0392b', tests: ['Pap Smear', 'FNAC', 'Biopsy'] },
    { code: 'GEN', name: 'Genetic Tests', icon: '🧬', color: '#2980b9', tests: ['Karyotype', 'FISH', 'NIPT'] },
    { code: 'MIC', name: 'Microbiology', icon: '🦠', color: '#d35400', tests: ['Blood Culture', 'Sputum Culture', 'Wound Culture'] },
    { code: 'SPL', name: 'Special Tests', icon: '⭐', color: '#7f8c8d', tests: ['Sweat Chloride Test', 'Newborn Screening', 'Toxicology Screen'] }
  ];

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setShowDirectResults(false);
      setDirectSearchResults([]);
      return;
    }
    const lowerSearch = searchTerm.toLowerCase();
    const results = [];
    testCategories.forEach(category => {
      category.tests.forEach(test => {
        if (test.toLowerCase().includes(lowerSearch)) {
          results.push({ testName: test, category: category.name, icon: category.icon, color: category.color });
        }
      });
    });
    setDirectSearchResults(results);
    setShowDirectResults(true);
  }, [searchTerm]);

  const toggleTest = (testName) => {
    if (selectedTests.includes(testName)) {
      setSelectedTests(selectedTests.filter(t => t !== testName));
    } else {
      setSelectedTests([...selectedTests, testName]);
    }
  };

  const handleCompare = () => {
    if (selectedTests.length >= 2) {
      setShowComparison(true);
    } else {
      alert('Please select at least 2 tests to compare');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCityFilter('');
    setMinRating('');
    setMaxPrice('');
    setHomeCollectionOnly(false);
    setMaxDistance('');
    setUseMyLocation(false);
  };

  if (showComparison) {
    return <ComparisonResults selectedTests={selectedTests} onBack={() => setShowComparison(false)} />;
  }

  const tabStyle = { padding: '10px 20px', fontSize: '16px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontWeight: 'bold', marginRight: '10px' };
  const activeTabStyle = { ...tabStyle, borderBottom: '3px solid #10b981', color: '#10b981' };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>🔬 Diagnostics</h1>
      
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
        <button onClick={() => { setActiveTab('labtests'); setShowComparison(false); }} style={activeTab === 'labtests' ? activeTabStyle : tabStyle}>📋 Lab Tests</button>
        <button onClick={() => setActiveTab('packages')} style={activeTab === 'packages' ? activeTabStyle : tabStyle}>🏥 Health Packages</button>
        <button onClick={() => setActiveTab('custom')} style={activeTab === 'custom' ? activeTabStyle : tabStyle}>✨ Build Custom Package</button>
      </div>

      {activeTab === 'labtests' && (
        <div>
          {/* Search and Filter Bar */}
          <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <input type="text" placeholder="🔍 Search any test (e.g., CBC, Vitamin D, X-ray)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 3, padding: '12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }} />
              <input type="text" placeholder="📍 City" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} style={{ flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }} />
              <select value={minRating} onChange={(e) => setMinRating(e.target.value)} style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="">⭐ Rating</option>
                <option value="4">4★ & above</option>
                <option value="4.5">4.5★ & above</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="number" placeholder="💰 Max Price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: '120px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="number" placeholder="📏 Max Distance (km)" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} style={{ width: '140px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'white', padding: '0 10px', borderRadius: '4px' }}>
                <input type="checkbox" checked={homeCollectionOnly} onChange={(e) => setHomeCollectionOnly(e.target.checked)} />
                🏠 Home Collection
              </label>
              <button onClick={() => setUseMyLocation(true)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📍 My Location</button>
              <button onClick={resetFilters} style={{ backgroundColor: '#6b7280', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
            </div>
          </div>

          {/* Direct Search Results */}
          {showDirectResults && searchTerm && (
            <div style={{ marginBottom: '20px' }}>
              <h3>🔍 Search Results for "{searchTerm}" ({directSearchResults.length} tests)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {directSearchResults.map((result, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'white', border: `1px solid ${result.color}`, borderRadius: '8px' }}>
                    <div><span style={{ fontWeight: 'bold' }}>{result.testName}</span><span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '10px' }}>{result.icon} {result.category}</span></div>
                    <div><label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={selectedTests.includes(result.testName)} onChange={() => toggleTest(result.testName)} /> Select</label></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories View */}
          {!searchTerm && (
            <div>
              <p>Select 2 or more tests to compare. Click on categories to browse.</p>
              {testCategories.map(category => (
                <div key={category.code} style={{ marginBottom: '15px', border: `1px solid ${category.color}`, borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: category.color, color: 'white', padding: '12px 15px', fontWeight: 'bold' }}>{category.icon} {category.name}</div>
                  <div style={{ padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px', backgroundColor: '#f9fafb' }}>
                    {category.tests.map(test => (
                      <div key={test} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb', width: 'calc(33% - 10px)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}><input type="checkbox" checked={selectedTests.includes(test)} onChange={() => toggleTest(test)} />{test}</label>
                        <button onClick={() => { setSelectedTests([test]); setShowComparison(true); }} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '5px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Compare</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {selectedTests.length >= 2 && (
            <button onClick={handleCompare} style={{ position: 'fixed', bottom: 20, right: 20, backgroundColor: '#10b981', color: 'white', padding: '15px 30px', border: 'none', borderRadius: 50, cursor: 'pointer', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              Compare Selected ({selectedTests.length} Tests)
            </button>
          )}
        </div>
      )}

      {activeTab === 'packages' && (
        <div><h2>🏥 Health Packages</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {healthPackages.map(pkg => (
              <div key={pkg.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', backgroundColor: 'white' }}>
                {pkg.popular && <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>🔥 Popular</span>}
                <h3>{pkg.name}</h3>
                <p>{pkg.description}</p>
                <p>🏥 {pkg.provider}</p>
                <div><span style={{ textDecoration: 'line-through' }}>₹{pkg.mrp}</span> <strong style={{ fontSize: '24px', color: '#10b981' }}>₹{pkg.price}</strong></div>
                <button onClick={() => alert(`Booking ${pkg.name}\nPrice: ₹${pkg.price}`)} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}>Book Now</button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'custom' && <DiagnosticsCustomPackage />}
    </div>
  );
};

export default Diagnostics;