import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DiagnosticsCustomPackage from './DiagnosticsCustomPackage';

// ALL 12 MAIN CATEGORIES WITH SUBCATEGORIES
const testCategories = [
  {
    code: 'BLD',
    name: '🩸 Blood Tests',
    color: '#e74c3c',
    icon: '🩸',
    subcategories: [
      { name: 'Hematology', tests: ['Complete Blood Count', 'Hemoglobin', 'White Blood Cell Count', 'Platelet Count', 'ESR', 'CRP', 'Peripheral Smear', 'Hb Electrophoresis', 'Reticulocyte Count'] },
      { name: 'Coagulation', tests: ['PT/INR', 'aPTT', 'D-Dimer', 'Fibrinogen', 'Factor Assays', 'Protein C/S', 'Antithrombin III'] },
      { name: 'Biochemistry', tests: ['Glucose Fasting', 'HbA1c', 'Liver Function Test', 'Kidney Function Test', 'Electrolytes', 'Calcium', 'Magnesium', 'Phosphate', 'Uric Acid', 'Lipid Profile', 'Amylase', 'Lipase', 'LDH', 'Troponin', 'CK-MB'] },
      { name: 'Iron Studies', tests: ['Serum Iron', 'TIBC', 'Ferritin', 'Transferrin Saturation'] },
      { name: 'Vitamins', tests: ['Vitamin B12', 'Vitamin D', 'Folate'] },
      { name: 'Hormones', tests: ['TSH', 'T3', 'T4', 'Cortisol', 'ACTH', 'Prolactin', 'LH', 'FSH', 'Estradiol', 'Progesterone', 'Testosterone', 'DHEA-S', 'PTH', 'Insulin', 'C-peptide'] },
      { name: 'Tumor Markers', tests: ['AFP', 'CEA', 'CA-125', 'CA 19-9', 'CA 15-3', 'PSA', 'β-hCG', 'Calcitonin', 'Thyroglobulin'] },
      { name: 'Serology/Immunology', tests: ['HIV', 'HBsAg', 'Anti-HCV', 'Syphilis', 'Dengue', 'Malaria', 'Typhoid', 'Rheumatoid Factor', 'ANA', 'Anti-dsDNA', 'ANCA', 'Anti-CCP'] }
    ]
  },
  {
    code: 'IMG',
    name: '📷 Medical Imaging',
    color: '#3498db',
    icon: '📷',
    subcategories: [
      { name: 'X-ray', tests: ['Chest X-ray', 'Limb X-ray', 'Spine X-ray', 'KUB', 'Mammogram', 'DEXA', 'OPG', 'Barium Studies'] },
      { name: 'CT Scan', tests: ['CT Head', 'CT Chest', 'CT Abdomen/Pelvis', 'CT Spine', 'CT Angiography', 'CT Urogram', 'CT Virtual Colonoscopy'] },
      { name: 'MRI', tests: ['MRI Brain', 'MRI Spine', 'MRI Joints', 'MRI Abdomen/MRCP', 'MRI Breast', 'MRA/MRV'] },
      { name: 'Ultrasound', tests: ['USG Abdomen', 'USG Pelvis', 'USG Thyroid', 'USG Scrotum', 'Doppler Studies', 'Echocardiography', 'Obstetric USG'] }
    ]
  },
  {
    code: 'CRD',
    name: '❤️ Cardiac Diagnostics',
    color: '#e67e22',
    icon: '❤️',
    subcategories: [
      { name: 'ECG', tests: ['ECG 12-lead', 'Stress ECG (TMT)', 'Holter Monitor', 'Event Recorder', 'Tilt Table Test'] },
      { name: 'Echocardiography', tests: ['2D Echo', 'Stress Echo', 'Transesophageal Echo', 'Fetal Echo'] },
      { name: 'Vascular', tests: ['Ankle-Brachial Index', 'Pulse Volume Recording', 'Carotid Doppler'] }
    ]
  },
  {
    code: 'URN',
    name: '💧 Urine Tests',
    color: '#f39c12',
    icon: '💧',
    subcategories: [
      { name: 'Routine', tests: ['Urinalysis', 'Urine Glucose', 'Urine Ketones', 'Urine Microscopy'] },
      { name: 'Culture', tests: ['Urine Culture & Sensitivity', 'Urine AFB'] },
      { name: 'Chemistry', tests: ['Urine Protein', 'Urine Microalbumin/Creatinine Ratio', 'Urine Electrolytes', 'Urine Osmolality'] },
      { name: 'Hormones', tests: ['Urine Pregnancy Test', 'Urine Cortisol', 'Urine Catecholamines'] }
    ]
  },
  {
    code: 'STL',
    name: '🧫 Stool Tests',
    color: '#27ae60',
    icon: '🧫',
    subcategories: [
      { name: 'Routine', tests: ['Stool Routine', 'Stool Microscopy'] },
      { name: 'Occult Blood', tests: ['FOBT', 'FIT'] },
      { name: 'Culture', tests: ['Stool Culture & Sensitivity'] },
      { name: 'Parasites', tests: ['Ova/Cyst Examination', 'Giardia', 'Cryptosporidium'] }
    ]
  },
  {
    code: 'NEU',
    name: '🧠 Neurodiagnostics',
    color: '#9b59b6',
    icon: '🧠',
    subcategories: [
      { name: 'EEG', tests: ['Routine EEG', 'Sleep Deprived EEG', 'Video EEG', 'Ambulatory EEG'] },
      { name: 'Nerve Studies', tests: ['EMG', 'Nerve Conduction Studies', 'Repetitive Nerve Stimulation'] },
      { name: 'Evoked Potentials', tests: ['Visual Evoked Potentials', 'Brainstem Auditory Evoked Potentials', 'Somatosensory Evoked Potentials'] }
    ]
  },
  {
    code: 'PFT',
    name: '🫁 Pulmonary Function',
    color: '#1abc9c',
    icon: '🫁',
    subcategories: [
      { name: 'Spirometry', tests: ['Spirometry', 'Bronchodilator Reversibility'] },
      { name: 'Lung Volumes', tests: ['Lung Volumes', 'Diffusing Capacity (DLCO)'] },
      { name: 'Other', tests: ['FeNO', 'Methacholine Challenge', '6-Minute Walk Test'] }
    ]
  },
  {
    code: 'NM',
    name: '⚛️ Nuclear Medicine',
    color: '#16a085',
    icon: '⚛️',
    subcategories: [
      { name: 'PET', tests: ['PET-CT Whole Body', 'PET-CT Cardiac', 'PET-CT Brain'] },
      { name: 'Bone Scan', tests: ['Tc-99m Whole Body Bone Scan'] },
      { name: 'Cardiac Nuclear', tests: ['Myocardial Perfusion Scan'] },
      { name: 'Thyroid Nuclear', tests: ['Thyroid Uptake and Scan'] }
    ]
  },
  {
    code: 'END',
    name: '🔬 Endoscopy',
    color: '#2c3e50',
    icon: '🔬',
    subcategories: [
      { name: 'Upper GI', tests: ['EGD', 'ERCP', 'Capsule Endoscopy', 'Enteroscopy'] },
      { name: 'Lower GI', tests: ['Colonoscopy', 'Sigmoidoscopy'] },
      { name: 'Other', tests: ['Bronchoscopy', 'Cystoscopy', 'Hysteroscopy'] }
    ]
  },
  {
    code: 'CYT',
    name: '🔬 Pathology/Biopsy',
    color: '#c0392b',
    icon: '🔬',
    subcategories: [
      { name: 'Exfoliative Cytology', tests: ['Pap Smear', 'Urine Cytology', 'Sputum Cytology'] },
      { name: 'FNAC', tests: ['Thyroid FNAC', 'Lymph Node FNAC', 'Breast FNAC'] },
      { name: 'Core Biopsy', tests: ['Breast Biopsy', 'Liver Biopsy', 'Kidney Biopsy', 'Prostate Biopsy'] }
    ]
  },
  {
    code: 'GEN',
    name: '🧬 Genetic Tests',
    color: '#2980b9',
    icon: '🧬',
    subcategories: [
      { name: 'Chromosome Analysis', tests: ['Karyotype', 'FISH', 'Chromosomal Microarray'] },
      { name: 'Sequencing', tests: ['Single Gene Sequencing', 'Gene Panel (NGS)', 'Whole Exome Sequencing'] },
      { name: 'Prenatal', tests: ['NIPT', 'Amniocentesis', 'CVS'] }
    ]
  },
  {
    code: 'SPL',
    name: '⭐ Special Tests',
    color: '#7f8c8d',
    icon: '⭐',
    subcategories: [
      { name: 'Other', tests: ['Sweat Chloride Test', 'Newborn Screening', 'Toxicology Screen', 'Heavy Metals', 'Therapeutic Drug Monitoring', 'Sleep Studies'] }
    ]
  }
];

// Health Packages Data
const healthPackages = [
  { id: 1, name: 'Full Body Checkup', provider: 'ABC Diagnostics', description: 'Complete health checkup with 65+ tests', mrp: 2500, price: 1299, homeCollection: true, reportTime: '24 hours', popular: true, tests: ['Complete Blood Count', 'Liver Function Test', 'Kidney Function Test', 'Lipid Profile', 'Blood Sugar Fasting'] },
  { id: 2, name: 'Cardiac Care Package', provider: 'ABC Diagnostics', description: 'Heart health checkup', mrp: 1800, price: 999, homeCollection: true, reportTime: '12 hours', popular: true, tests: ['Lipid Profile', 'ECG 12-lead', 'Troponin'] },
  { id: 3, name: 'Diabetes Profile', provider: 'HealthCare Diagnostics', description: 'Complete diabetes screening', mrp: 1200, price: 699, homeCollection: true, reportTime: '8 hours', popular: true, tests: ['Glucose Fasting', 'HbA1c', 'Insulin'] },
  { id: 4, name: 'Women Health Package', provider: 'ABC Diagnostics', description: 'Health checkup for women', mrp: 2200, price: 1199, homeCollection: true, reportTime: '24 hours', popular: false, tests: ['Pap Smear', 'Complete Blood Count', 'Thyroid Profile'] }
];

const Diagnostics = () => {
  const [activeTab, setActiveTab] = useState('labtests');
  const [selectedTests, setSelectedTests] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [expandedMainCat, setExpandedMainCat] = useState({});
  const [expandedSubCat, setExpandedSubCat] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [homeCollectionOnly, setHomeCollectionOnly] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [maxDistance, setMaxDistance] = useState('');
  const [providerPrices, setProviderPrices] = useState({});

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  // Get user location
  useEffect(() => {
    if (useMyLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => alert('Unable to get location')
      );
    }
  }, [useMyLocation]);

  // Load provider prices
  useEffect(() => {
    loadProviderPrices();
  }, []);

  const loadProviderPrices = async () => {
    try {
      const res = await axios.get(`${API_URL}/diagnostics/tests`);
      if (res.data?.data) {
        const priceMap = {};
        res.data.data.forEach(test => {
          priceMap[test.test_name] = {
            price: test.discounted_price || test.min_price || test.price || 'N/A',
            rating: test.rating || 4.0,
            city: test.city || 'Mumbai',
            home_collection: test.home_collection_available !== false,
            distance: test.distance || Math.floor(Math.random() * 20) + 1
          };
        });
        setProviderPrices(priceMap);
      }
    } catch (error) {
      console.error('Error loading prices:', error);
    }
  };

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

  const handleCompareMultiple = () => {
    if (selectedTests.length >= 2) {
      setShowCompare(true);
    } else {
      alert('Please select at least 2 tests to compare');
    }
  };

  const handleSingleTestCompare = (testName) => {
    setSelectedTests([testName]);
    setShowCompare(true);
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

  if (showCompare) {
    return <DiagnosticsCustomPackage preselectedTests={selectedTests} />;
  }

  // Filter tests based on all criteria
  const getFilteredCategories = () => {
    let filtered = testCategories;
    
    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.map(category => ({
        ...category,
        subcategories: category.subcategories.map(sub => ({
          ...sub,
          tests: sub.tests.filter(test => test.toLowerCase().includes(lowerSearch))
        })).filter(sub => sub.tests.length > 0)
      })).filter(cat => cat.subcategories.length > 0);
    }
    
    // Filter by city, rating, price, home collection
    if (cityFilter || minRating || maxPrice || homeCollectionOnly || maxDistance) {
      filtered = filtered.map(category => ({
        ...category,
        subcategories: category.subcategories.map(sub => ({
          ...sub,
          tests: sub.tests.filter(test => {
            const priceData = providerPrices[test];
            if (!priceData) return true;
            
            if (cityFilter && !priceData.city?.toLowerCase().includes(cityFilter.toLowerCase())) return false;
            if (minRating && priceData.rating < parseFloat(minRating)) return false;
            if (maxPrice && priceData.price !== 'N/A' && parseFloat(priceData.price) > parseFloat(maxPrice)) return false;
            if (homeCollectionOnly && !priceData.home_collection) return false;
            if (maxDistance && priceData.distance > parseFloat(maxDistance)) return false;
            
            return true;
          })
        })).filter(sub => sub.tests.length > 0)
      })).filter(cat => cat.subcategories.length > 0);
    }
    
    return filtered;
  };

  const filteredCategories = getFilteredCategories();
  const totalTests = testCategories.reduce((sum, cat) => sum + cat.subcategories.reduce((s, sub) => s + sub.tests.length, 0), 0);
  const filteredCount = filteredCategories.reduce((sum, cat) => sum + cat.subcategories.reduce((s, sub) => s + sub.tests.length, 0), 0);

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
          {/* Search and Filter Bar */}
          <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="🔍 Search test name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <input
                type="text"
                placeholder="📍 City (e.g., Mumbai, Delhi)"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <select value={minRating} onChange={(e) => setMinRating(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="">⭐ Rating (Any)</option>
                <option value="4">4★ & above</option>
                <option value="4.5">4.5★ & above</option>
                <option value="4.8">4.8★ & above</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="number"
                placeholder="💰 Max Price (₹)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ width: '150px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <input
                type="number"
                placeholder="📏 Max Distance (km)"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                style={{ width: '150px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'white', padding: '0 10px', borderRadius: '4px' }}>
                <input type="checkbox" checked={homeCollectionOnly} onChange={(e) => setHomeCollectionOnly(e.target.checked)} />
                🏠 Home Collection Only
              </label>
              <button onClick={() => setUseMyLocation(true)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                📍 Use My Location
              </button>
              <button onClick={resetFilters} style={{ backgroundColor: '#6b7280', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Reset Filters
              </button>
            </div>
            
            {userLocation && (
              <p style={{ fontSize: '12px', marginTop: '10px', color: '#10b981' }}>
                📍 Location detected: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            )}
            
            {searchTerm && (
              <p style={{ fontSize: '12px', marginTop: '10px', color: '#6b7280' }}>
                Found {filteredCount} tests matching "{searchTerm}"
              </p>
            )}
          </div>

          <p>Total {totalTests} tests. Select tests using checkboxes or click "Compare Prices" on any test.</p>
          
          {filteredCategories.map(category => (
            <div key={category.code} style={{ marginBottom: '15px', border: `1px solid ${category.color}`, borderRadius: '8px', overflow: 'hidden' }}>
              <div onClick={() => toggleMainCategory(category.code)} style={{ backgroundColor: category.color, color: 'white', padding: '12px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{category.icon} {category.name}</span>
                <span>{expandedMainCat[category.code] ? '▼' : '▶'}</span>
              </div>
              
              {expandedMainCat[category.code] && (
                <div style={{ backgroundColor: '#f9fafb', padding: '10px' }}>
                  {category.subcategories.map(sub => (
                    <div key={sub.name} style={{ marginBottom: '10px' }}>
                      <div onClick={() => toggleSubCategory(category.code, sub.name)} style={{ padding: '8px', backgroundColor: '#f3f4f6', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderRadius: '4px' }}>
                        <span>📂 {sub.name} ({sub.tests.length} tests)</span>
                        <span>{expandedSubCat[`${category.code}_${sub.name}`] ? '▼' : '▶'}</span>
                      </div>
                      
                      {expandedSubCat[`${category.code}_${sub.name}`] && (
                        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {sub.tests.map(test => {
                            const priceData = providerPrices[test];
                            return (
                              <div key={test} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 2 }}>
                                  <input type="checkbox" checked={selectedTests.includes(test)} onChange={() => toggleTest(test)} />
                                  <span>{test}</span>
                                </label>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                                  {priceData && (
                                    <>
                                      {priceData.city && <span style={{ fontSize: '11px', color: '#6b7280' }}>📍 {priceData.city}</span>}
                                      {priceData.rating && <span style={{ fontSize: '11px', color: '#f59e0b' }}>⭐ {priceData.rating}</span>}
                                      {priceData.distance && <span style={{ fontSize: '11px', color: '#3b82f6' }}>📏 {priceData.distance} km</span>}
                                      {priceData.home_collection && <span style={{ fontSize: '11px', color: '#10b981' }}>🏠 Home</span>}
                                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹{priceData.price}</span>
                                    </>
                                  )}
                                  <button 
                                    onClick={() => handleSingleTestCompare(test)}
                                    style={{ backgroundColor: '#3b82f6', color: 'white', padding: '5px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                  >
                                    Compare
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {selectedTests.length >= 2 && (
            <button onClick={handleCompareMultiple} style={{ position: 'fixed', bottom: 20, right: 20, backgroundColor: '#10b981', color: 'white', padding: '15px 30px', border: 'none', borderRadius: 50, cursor: 'pointer', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              Compare Selected ({selectedTests.length} Tests)
            </button>
          )}
        </div>
      )}

      {activeTab === 'packages' && (
        <div>
          <h2>🏥 Preventive Health Check Packages</h2>
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