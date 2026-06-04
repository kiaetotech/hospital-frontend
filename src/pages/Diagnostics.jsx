import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DiagnosticsCustomPackage from './DiagnosticsCustomPackage';

const healthPackages = [
  { id: 1, name: 'Full Body Checkup', provider: 'ABC Diagnostics', description: 'Complete health checkup', mrp: 2500, price: 1299, homeCollection: true, reportTime: '24 hours', popular: true },
  { id: 2, name: 'Cardiac Care Package', provider: 'ABC Diagnostics', description: 'Heart health checkup', mrp: 1800, price: 999, homeCollection: true, reportTime: '12 hours', popular: true },
  { id: 3, name: 'Diabetes Profile', provider: 'HealthCare Diagnostics', description: 'Complete diabetes screening', mrp: 1200, price: 699, homeCollection: true, reportTime: '8 hours', popular: true }
];

const testCategories = [
  // MRI - Complete
  { code: 'MRI', name: '🧠 MRI (Magnetic Resonance Imaging)', icon: '🧠', color: '#8e44ad', tests: ['MRI Brain', 'MRI Spine', 'MRI Joints', 'MRI Abdomen / MRCP', 'MRI Pelvis', 'MRI Cardiac', 'MRI Angiography (MRA)', 'MRI Breast', 'MRI Orbit / IAC', 'MRI Soft tissue', 'MR Venography (MRV)'] },
  
  // CT - Complete
  { code: 'CT', name: '📷 CT (Computed Tomography)', icon: '📷', color: '#3498db', tests: ['CT Head', 'CT Chest', 'CT Abdomen + Pelvis', 'CT Angiography (CTA)', 'CT Spine', 'CT Facial bones / Sinus', 'CT Temporal bone', 'CT Urogram', 'CT Virtual colonoscopy', 'CT Perfusion', 'CT Guided biopsy'] },
  
  // X-ray - Complete
  { code: 'XR', name: '🦴 X-ray (Radiography)', icon: '🦴', color: '#e67e22', tests: ['Chest X-ray', 'X-ray Spine', 'X-ray Limbs', 'X-ray Legs', 'X-ray Pelvis / Hip', 'X-ray Shoulder', 'X-ray Skull', 'X-ray Sinus', 'X-ray Abdomen (KUB)', 'X-ray Joints', 'X-ray Dental (OPG)', 'X-ray Mammogram', 'X-ray Barium studies', 'X-ray DEXA'] },
  
  // Ultrasound - Complete
  { code: 'USG', name: '🔊 Ultrasound (Sonography)', icon: '🔊', color: '#1abc9c', tests: ['USG Abdomen', 'USG Pelvis', 'USG Transvaginal', 'USG Transrectal', 'USG Thyroid', 'USG Breast', 'USG Scrotum', 'USG Musculoskeletal', 'USG Vascular Doppler', 'USG Lower limb (DVT)', 'USG Upper limb', 'USG Renal Doppler', 'USG Hepatobiliary Doppler', 'USG Neonatal brain', 'USG KUB', 'USG Guided procedures', 'ECHO (Echocardiography)', 'Obstetric USG'] },
  
  // Hematology - Complete
  { code: 'HEM', name: '🩸 Hematology', icon: '🩸', color: '#e74c3c', tests: ['Complete Blood Count (CBC)', 'Hemoglobin (Hb)', 'Hematocrit (HCT)', 'RBC count', 'WBC count (TLC, DLC)', 'Platelet count', 'Peripheral smear', 'ESR', 'CRP', 'Coagulation profile (PT, INR, aPTT)', 'Bleeding time', 'Clotting time', 'D-Dimer', 'Fibrinogen', 'Hb electrophoresis', 'Reticulocyte count', 'Blood grouping + Rh typing'] },
  
  // Biochemistry - Complete
  { code: 'BIO', name: '🧪 Biochemistry', icon: '🧪', color: '#f39c12', tests: ['Blood glucose (Fasting, PP, Random)', 'HbA1c', 'Liver Function Test (LFT)', 'Renal Function Test (RFT)', 'Electrolytes (Na, K, Cl, Ca, Mg, P)', 'Lipid profile', 'Cardiac enzymes (CK-MB, Troponin, LDH)', 'Pancreatic enzymes (Amylase, Lipase)', 'Iron studies (Serum iron, TIBC, Ferritin)', 'Vitamin B12', 'Vitamin D', 'Folate', 'Homocysteine', 'Ammonia', 'Lactate', 'Blood gas (ABG / VBG)'] },
  
  // Serology / Immunology - Complete
  { code: 'SER', name: '🦠 Serology / Immunology', icon: '🦠', color: '#9b59b6', tests: ['HIV (1+2)', 'HBsAg (Hepatitis B)', 'Anti-HBs, Anti-HBc', 'Hepatitis C antibody', 'Hepatitis A IgM', 'Hepatitis E IgM', 'Syphilis (VDRL, TPHA)', 'Dengue (NS1 antigen, IgM, IgG)', 'Chikungunya IgM/IgG', 'Malaria (rapid antigen, smear)', 'Typhoid (Widal, Typhidot)', 'Rheumatoid factor (RF)', 'Anti-CCP (ACPA)', 'ANA + ENA profile', 'Anti-dsDNA', 'ANCA (c-ANCA, p-ANCA)', 'Anti-phospholipid antibodies', 'Complement C3, C4', 'Serum protein electrophoresis (SPEP)', 'Quantitative immunoglobulins', 'Total IgE', 'RAST test', 'hs-CRP', 'Procalcitonin', 'Tumor markers (AFP, CEA, CA-125, CA 19-9, CA 15-3, PSA)'] },
  
  // Hormones / Endocrine - Complete
  { code: 'HOR', name: '⚖️ Hormones / Endocrine', icon: '⚖️', color: '#16a085', tests: ['Thyroid profile (TSH, Free T3, Free T4)', 'Cortisol (morning/evening)', 'ACTH', 'Prolactin', 'LH, FSH', 'Estradiol (E2)', 'Progesterone', 'Testosterone (total/free)', 'DHEA-S', 'Aldosterone / Renin ratio', 'Metanephrines', 'Parathyroid hormone (PTH)', 'Insulin, C-peptide', 'Growth hormone (GH) + IGF-1', 'Anti-Mullerian hormone (AMH)'] },
  
  // Urine Tests - Complete
  { code: 'URN', name: '💧 Urine Tests', icon: '💧', color: '#2980b9', tests: ['Urinalysis (routine & microscopy)', 'Urine glucose, ketones', 'Urine protein (spot, 24-hour)', 'Urine microalbumin / creatinine ratio', 'Urine culture & sensitivity', 'Urine Gram stain', 'Urine pregnancy test (β-hCG)', 'Urine electrolytes (Na, K, Cl)', 'Urine osmolality', 'Urine creatinine', 'Urine urea nitrogen', 'Urine calcium (24-hour)', 'Urine uric acid', 'Urine porphobilinogen', 'Urine catecholamines / metanephrines', 'Urine cortisol (free)', 'Urine 5-HIAA', 'Urine drug screen', 'Urine Bence Jones protein'] },
  
  // Stool Tests - Complete
  { code: 'STL', name: '🧫 Stool Tests', icon: '🧫', color: '#27ae60', tests: ['Stool routine & microscopy', 'Occult blood (FOBT / FIT)', 'Stool culture & sensitivity', 'Stool for ova, cyst, parasite', 'Stool antigen tests (Giardia, Cryptosporidium, H.pylori)', 'Stool PCR for pathogens', 'Calprotectin', 'Stool reducing substances', 'Stool fat (quantitative/qualitative)', 'Stool elastase', 'Stool pH'] },
  
  // ECG / Cardiac - Complete
  { code: 'ECG', name: '❤️ ECG / Cardiac Electrophysiology', icon: '❤️', color: '#e74c3c', tests: ['ECG (12-lead, resting)', 'Stress ECG (Treadmill test - TMT)', 'Holter monitoring (24/48-hour)', 'Event recorder', 'Signal-averaged ECG'] },
  
  // EEG / Neurophysiology - Complete
  { code: 'EEG', name: '🧠 EEG / Neurophysiology', icon: '🧠', color: '#9b59b6', tests: ['Routine EEG', 'Sleep-deprived EEG', 'Video-EEG monitoring', 'Ambulatory EEG', 'Evoked potentials (VEP, BAER, SSEP)', 'Electromyography (EMG)', 'Nerve conduction studies (NCS)', 'Repetitive nerve stimulation'] },
  
  // Pulmonary Function Tests - Complete
  { code: 'PFT', name: '🫁 Pulmonary Function Tests', icon: '🫁', color: '#1abc9c', tests: ['Spirometry (FEV1, FVC, FEV1/FVC)', 'Bronchodilator reversibility test', 'Lung volumes (plethysmography)', 'Diffusing capacity (DLCO)', '6-minute walk test', 'Fractional exhaled nitric oxide (FeNO)', 'Methacholine challenge test', 'Maximal respiratory pressures (MIP/MEP)', 'Nocturnal oximetry'] },
  
  // Endoscopy - Complete
  { code: 'END', name: '🔬 Endoscopy', icon: '🔬', color: '#2c3e50', tests: ['Upper GI endoscopy (EGD)', 'Colonoscopy', 'Sigmoidoscopy', 'Bronchoscopy', 'Cystoscopy', 'Hysteroscopy', 'Laparoscopy', 'Arthroscopy', 'ERCP', 'Capsule endoscopy', 'Enteroscopy', 'EUS'] },
  
  // Nuclear Medicine / PET - Complete
  { code: 'NUC', name: '⚛️ Nuclear Medicine / PET', icon: '⚛️', color: '#16a085', tests: ['PET-CT (whole body, cardiac, brain)', 'Bone scan (Tc-99m)', 'Thyroid scan (I-123, Tc-99m)', 'Renal scan (DTPA, MAG3, DMSA)', 'V/Q scan (lung)', 'HIDA scan (gallbladder)', 'Myocardial perfusion scan (MIBI, Thallium)', 'Parathyroid scan (Sestamibi)', 'Octreotide scan', 'MIBG scan', 'Gallium scan', 'White cell scan', 'Gastric emptying scan', 'Meckel\'s scan'] },
  
  // Special Tests - Complete
  { code: 'SPL', name: '⭐ Special Tests', icon: '⭐', color: '#7f8c8d', tests: ['Sweat chloride test', 'Genetic testing (DNA/RNA sequencing)', 'Karyotype / FISH / Microarray', 'Single gene sequencing', 'NGS panel / Whole exome', 'NIPT', 'HLA typing', 'Paternity testing', 'CSF analysis', 'Synovial fluid analysis', 'Peritoneal fluid analysis', 'Pleural fluid analysis', 'Amniotic fluid analysis', 'Skin biopsy', 'Muscle biopsy', 'Nerve biopsy', 'Bone marrow aspirate & biopsy', 'Fine needle aspiration cytology (FNAC)', 'Pap smear', 'Semen analysis'] }
];

const ComparisonResults = ({ selectedTests, onBack }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockProviders = [
      { provider_name: 'ABC Diagnostics', rating: 4.5, distance: '2.5 km', home_collection: true, report_time_hours: 24, total_price: 0, individual_prices: {} },
      { provider_name: 'HealthCare Diagnostics', rating: 4.7, distance: '3.8 km', home_collection: true, report_time_hours: 24, total_price: 0, individual_prices: {} },
      { provider_name: 'Metropolis Healthcare', rating: 4.6, distance: '5.2 km', home_collection: true, report_time_hours: 48, total_price: 0, individual_prices: {} },
      { provider_name: 'Dr Lal PathLabs', rating: 4.8, distance: '1.2 km', home_collection: true, report_time_hours: 24, total_price: 0, individual_prices: {} },
      { provider_name: 'Apollo Diagnostic', rating: 4.9, distance: '4.0 km', home_collection: true, report_time_hours: 12, total_price: 0, individual_prices: {} }
    ];
    selectedTests.forEach(test => {
      mockProviders.forEach(provider => {
        const price = Math.floor(Math.random() * 500) + 100;
        provider.individual_prices[test] = price;
        provider.total_price += price;
      });
    });
    setProviders(mockProviders.sort((a, b) => a.total_price - b.total_price));
    setLoading(false);
  }, [selectedTests]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: '20px', cursor: 'pointer' }}>← Back</button>
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
            <tr style={{ backgroundColor: '#e5e7eb' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>⭐ Rating</td>
              {providers.map((p, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.rating} ★</td>
              ))}
            <tr>
            <tr style={{ backgroundColor: '#e5e7eb' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>📏 Distance</td>
              {providers.map((p, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.distance}</td>
              ))}
            </tr>
            <tr style={{ backgroundColor: '#e5e7eb' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>🏠 Home Collection</td>
              {providers.map((p, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.home_collection ? '✅ Yes' : '❌ No'}</td>
              ))}
            </tr>
            <tr style={{ backgroundColor: '#e5e7eb' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>⏱️ Report Time</td>
              {providers.map((p, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.report_time_hours} hours</td>
              ))}
            </tr>
            {selectedTests.map(test => (
              <tr key={test}>
                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{test}</td>
                {providers.map((p, idx) => (
                  <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>₹{p.individual_prices[test]}</td>
                ))}
              </tr>
            ))}
            <tr style={{ backgroundColor: '#fef3c7', fontWeight: 'bold' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>💰 Total Price</td>
              {providers.map((p, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>₹{p.total_price}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>📅 Action</td>
              {providers.map((p, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  <button onClick={() => alert(`Booking ${p.provider_name}\nTotal: ₹${p.total_price}`)} style={{ backgroundColor: idx === 0 ? '#10b981' : '#3b82f6', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Book</button>
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
  const [maxDistance, setMaxDistance] = useState('');
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [directSearchResults, setDirectSearchResults] = useState([]);
  const [showDirectResults, setShowDirectResults] = useState(false);

  useEffect(() => {
    if (useMyLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => alert('Unable to get location')
      );
    }
  }, [useMyLocation]);

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
      alert('Select at least 2 tests');
    }
  };

  const handleSingleCompare = (testName) => {
    setSelectedTests([testName]);
    setShowComparison(true);
  };

  const resetFilters = () => {
    setCityFilter('');
    setMinRating('');
    setMaxPrice('');
    setHomeCollectionOnly(false);
    setMaxDistance('');
    setUseMyLocation(false);
    setSearchTerm('');
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
            <input type="text" placeholder="🔍 Search any test (e.g., MRI Brain, CBC, X-ray)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px', marginBottom: '10px' }} />
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <input type="text" placeholder="📍 City (e.g., Mumbai, Delhi)" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              <select value={minRating} onChange={(e) => setMinRating(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="">⭐ Rating (Any)</option>
                <option value="4">4★ & above</option>
                <option value="4.5">4.5★ & above</option>
                <option value="4.8">4.8★ & above</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="number" placeholder="💰 Max Price (₹)" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: '130px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="number" placeholder="📏 Max Distance (km)" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} style={{ width: '140px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'white', padding: '0 10px', borderRadius: '4px', height: '42px' }}>
                <input type="checkbox" checked={homeCollectionOnly} onChange={(e) => setHomeCollectionOnly(e.target.checked)} />
                🏠 Home Collection Only
              </label>
              <button onClick={() => setUseMyLocation(true)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📍 Use My Location</button>
              <button onClick={resetFilters} style={{ backgroundColor: '#6b7280', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset Filters</button>
            </div>
            
            {userLocation && <p style={{ fontSize: '12px', marginTop: '10px', color: '#10b981' }}>📍 Location detected: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>}
            {searchTerm && <p style={{ fontSize: '12px', marginTop: '10px' }}>Found {directSearchResults.length} tests matching "{searchTerm}"</p>}
          </div>

          {/* Search Results */}
          {showDirectResults && searchTerm && (
            <div style={{ marginBottom: '20px' }}>
              <h3>🔍 Search Results ({directSearchResults.length})</h3>
              {directSearchResults.map((result, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'white', border: `1px solid ${result.color}`, borderRadius: '8px', marginBottom: '8px' }}>
                  <div><strong>{result.testName}</strong> <span style={{ fontSize: '12px', color: '#6b7280' }}>{result.icon} {result.category}</span></div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input type="checkbox" checked={selectedTests.includes(result.testName)} onChange={() => toggleTest(result.testName)} /> Select
                    </label>
                    <button onClick={() => handleSingleCompare(result.testName)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '5px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Compare</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Categories View */}
          {!searchTerm && (
            <div>
              {testCategories.map(category => (
                <div key={category.code} style={{ marginBottom: '15px', border: `1px solid ${category.color}`, borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: category.color, color: 'white', padding: '12px 15px', fontWeight: 'bold' }}>{category.icon} {category.name}</div>
                  <div style={{ padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px', backgroundColor: '#f9fafb' }}>
                    {category.tests.map(test => (
                      <div key={test} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <input type="checkbox" checked={selectedTests.includes(test)} onChange={() => toggleTest(test)} /> {test}
                        </label>
                        <button onClick={() => handleSingleCompare(test)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '4px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Compare</button>
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
        <div>
          <h2>🏥 Preventive Health Check Packages</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {healthPackages.map(pkg => (
              <div key={pkg.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
                {pkg.popular && <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>🔥 Popular</span>}
                <h3>{pkg.name}</h3>
                <p>{pkg.description}</p>
                <p>Provider: {pkg.provider}</p>
                <p><span style={{ textDecoration: 'line-through' }}>₹{pkg.mrp}</span> <strong style={{ fontSize: '24px', color: '#10b981' }}>₹{pkg.price}</strong></p>
                <button onClick={() => alert(`Booking ${pkg.name}`)} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Book Now</button>
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