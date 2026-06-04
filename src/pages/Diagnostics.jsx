import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DiagnosticsCustomPackage from './DiagnosticsCustomPackage';

// Health Packages Data
const healthPackages = [
  { id: 1, name: 'Full Body Checkup', provider: 'ABC Diagnostics', description: 'Complete health checkup with 65+ tests', mrp: 2500, price: 1299, homeCollection: true, reportTime: '24 hours', popular: true },
  { id: 2, name: 'Cardiac Care Package', provider: 'ABC Diagnostics', description: 'Heart health checkup', mrp: 1800, price: 999, homeCollection: true, reportTime: '12 hours', popular: true },
  { id: 3, name: 'Diabetes Profile', provider: 'HealthCare Diagnostics', description: 'Complete diabetes screening', mrp: 1200, price: 699, homeCollection: true, reportTime: '8 hours', popular: true }
];

const ComparisonResults = ({ selectedTests, onBack }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Mock data for immediate comparison (since database doesn't have all tests yet)
    const mockProviders = [
      {
        provider_name: 'ABC Diagnostics',
        rating: 4.5,
        distance: '2.5',
        home_collection: true,
        report_time_hours: 24,
        total_price: 0,
        individual_prices: {}
      },
      {
        provider_name: 'HealthCare Diagnostics',
        rating: 4.7,
        distance: '3.8',
        home_collection: true,
        report_time_hours: 24,
        total_price: 0,
        individual_prices: {}
      },
      {
        provider_name: 'Metropolis Healthcare',
        rating: 4.6,
        distance: '5.2',
        home_collection: true,
        report_time_hours: 48,
        total_price: 0,
        individual_prices: {}
      }
    ];

    // Generate random prices for each test and provider
    selectedTests.forEach(test => {
      mockProviders.forEach(provider => {
        const price = Math.floor(Math.random() * 500) + 100;
        provider.individual_prices[test] = price;
        provider.total_price += price;
      });
    });

    // Sort by total price
    const sorted = [...mockProviders].sort((a, b) => a.total_price - b.total_price);
    setProviders(sorted);
    setLoading(false);
  }, [selectedTests]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading comparison data...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}<br /><button onClick={onBack} style={{ marginTop: '10px', cursor: 'pointer' }}>← Back</button></div>;

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: '20px', cursor: 'pointer' }}>← Back to Tests</button>
      <h2>Comparison Results</h2>
      <p style={{ marginBottom: '15px', color: '#6b7280' }}>Showing providers sorted by cheapest total package price.</p>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', minWidth: '150px' }}>Test / Provider</th>
              {providers.map((p, idx) => (
                <th key={idx} style={{ padding: '12px', border: '1px solid #ddd', minWidth: '180px', backgroundColor: idx === 0 ? '#d1fae5' : '#f3f4f6' }}>
                  {p.provider_name}
                  {idx === 0 && <span style={{ display: 'block', fontSize: '11px', color: '#10b981' }}>⭐ Cheapest</span>}
                </th>
              ))}
            </tr>
            <tr style={{ backgroundColor: '#e5e7eb' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Details</th>
              {providers.map((p, idx) => (
                <th key={idx} style={{ padding: '8px', border: '1px solid #ddd', fontSize: '12px' }}>
                  ⭐ {p.rating} | 📏 {p.distance} km | 🏠 {p.home_collection ? 'Yes' : 'No'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedTests.map(testName => (
              <tr key={testName}>
                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                  {testName}
                </td>
                {providers.map((provider, idx) => (
                  <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#10b981' }}>₹{provider.individual_prices[testName]}</span>
                  </td>
                ))}
              </tr>
            ))}
            <tr style={{ backgroundColor: '#fef3c7', fontWeight: 'bold' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>💰 Total Package Price</td>
              {providers.map((provider, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', backgroundColor: idx === 0 ? '#d1fae5' : '#fef3c7' }}>
                  <span style={{ fontSize: '16px' }}>₹{provider.total_price}</span>
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>⏱️ Report Time</td>
              {providers.map((provider, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {provider.report_time_hours} hours
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>📅 Action</td>
              {providers.map((provider, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  <button onClick={() => alert(`Booking ${provider.provider_name}\nTotal: ₹${provider.total_price}`)} style={{ backgroundColor: idx === 0 ? '#10b981' : '#3b82f6', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Book Now</button>
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
  // ========== 1. MRI (Magnetic Resonance Imaging) ==========
  {
    code: 'MRI',
    name: '🧠 MRI (Magnetic Resonance Imaging)',
    icon: '🧠',
    color: '#8e44ad',
    tests: [
      'MRI Brain (with/without contrast)',
      'MRI Spine (cervical, thoracic, lumbar)',
      'MRI Joints (shoulder, knee, hip, wrist, ankle)',
      'MRI Abdomen / MRCP',
      'MRI Pelvis (uterus, prostate, rectum)',
      'MRI Cardiac',
      'MRI Angiography (MRA)',
      'MRI Breast',
      'MRI Orbit / IAC',
      'MRI Soft tissue',
      'MR Venography (MRV)'
    ]
  },
  // ========== 2. CT (Computed Tomography) ==========
  {
    code: 'CT',
    name: '📷 CT (Computed Tomography)',
    icon: '📷',
    color: '#3498db',
    tests: [
      'CT Head (with/without contrast)',
      'CT Chest',
      'CT Abdomen + Pelvis',
      'CT Angiography (CTA)',
      'CT Spine',
      'CT Facial bones / Sinus',
      'CT Temporal bone',
      'CT Urogram',
      'CT Virtual colonoscopy',
      'CT Perfusion',
      'CT Guided biopsy'
    ]
  },
  // ========== 3. X-ray (Radiography) ==========
  {
    code: 'XR',
    name: '🦴 X-ray (Radiography)',
    icon: '🦴',
    color: '#e67e22',
    tests: [
      'Chest X-ray (CXR)',
      'X-ray Spine (cervical, thoracic, lumbar, sacrum)',
      'X-ray Limbs (arm, forearm, hand, fingers)',
      'X-ray Legs (thigh, knee, leg, ankle, foot)',
      'X-ray Pelvis / Hip',
      'X-ray Shoulder / Clavicle / Scapula',
      'X-ray Skull / Facial bones',
      'X-ray Sinus',
      'X-ray Abdomen (KUB)',
      'X-ray Joints (elbow, wrist, knee, ankle)',
      'X-ray Dental (OPG)',
      'X-ray Mammogram',
      'X-ray Barium swallow / meal / enema',
      'X-ray DEXA'
    ]
  },
  // ========== 4. Ultrasound (Sonography) ==========
  {
    code: 'USG',
    name: '🔊 Ultrasound (Sonography)',
    icon: '🔊',
    color: '#1abc9c',
    tests: [
      'USG Abdomen',
      'USG Pelvis (transabdominal)',
      'USG Transvaginal',
      'USG Transrectal',
      'USG Thyroid / Neck',
      'USG Breast',
      'USG Scrotum',
      'USG Musculoskeletal',
      'USG Vascular Doppler',
      'USG Lower limb (DVT)',
      'USG Upper limb (AV fistula)',
      'USG Renal Doppler',
      'USG Hepatobiliary Doppler',
      'USG Neonatal brain',
      'USG KUB',
      'USG Guided procedures',
      'ECHO (Echocardiography)',
      'Obstetric USG'
    ]
  },
  // ========== 5. Blood Tests - Hematology ==========
  {
    code: 'HEM',
    name: '🩸 Hematology',
    icon: '🩸',
    color: '#e74c3c',
    tests: [
      'Complete Blood Count (CBC) + differential',
      'Hemoglobin (Hb)',
      'Hematocrit (HCT)',
      'RBC count, MCV, MCH, MCHC, RDW',
      'WBC count (TLC, DLC)',
      'Platelet count',
      'Peripheral smear',
      'ESR',
      'CRP',
      'Coagulation profile (PT, INR, aPTT)',
      'Bleeding time, Clotting time',
      'D-Dimer',
      'Fibrinogen',
      'Hb electrophoresis',
      'Reticulocyte count',
      'Blood grouping + Rh typing'
    ]
  },
  // ========== 6. Blood Tests - Biochemistry ==========
  {
    code: 'BIO',
    name: '🧪 Biochemistry',
    icon: '🧪',
    color: '#f39c12',
    tests: [
      'Blood glucose (Fasting, Postprandial, Random)',
      'HbA1c',
      'Liver Function Test (LFT)',
      'Renal Function Test (RFT)',
      'Electrolytes (Na, K, Cl, Ca, Mg, P)',
      'Lipid profile',
      'Cardiac enzymes (CK-MB, Troponin I/T, LDH)',
      'Pancreatic enzymes (Amylase, Lipase)',
      'Iron studies (Serum iron, TIBC, Ferritin)',
      'Vitamin B12, Folate',
      'Vitamin D (25-hydroxy)',
      'Homocysteine',
      'Ammonia',
      'Lactate',
      'Blood gas (ABG / VBG)'
    ]
  },
  // ========== 7. Blood Tests - Serology / Immunology ==========
  {
    code: 'SER',
    name: '🦠 Serology / Immunology',
    icon: '🦠',
    color: '#9b59b6',
    tests: [
      'HIV (1+2)',
      'HBsAg (Hepatitis B)',
      'Anti-HBs, Anti-HBc',
      'Hepatitis C antibody / HCV RNA',
      'Hepatitis A IgM, Hepatitis E IgM',
      'Syphilis (VDRL, TPHA)',
      'Dengue (NS1 antigen, IgM, IgG)',
      'Chikungunya IgM/IgG',
      'Malaria (rapid antigen, smear)',
      'Typhoid (Widal, Typhidot)',
      'Rheumatoid factor (RF)',
      'Anti-CCP (ACPA)',
      'ANA + ENA profile',
      'Anti-dsDNA',
      'ANCA (c-ANCA, p-ANCA)',
      'Anti-phospholipid antibodies',
      'Complement C3, C4',
      'Serum protein electrophoresis (SPEP)',
      'Quantitative immunoglobulins (IgG, IgA, IgM, IgE)',
      'Total IgE',
      'RAST test',
      'hs-CRP',
      'Procalcitonin',
      'Tumor markers (AFP, CEA, CA-125, CA 19-9, CA 15-3, PSA, β-hCG)'
    ]
  },
  // ========== 8. Hormones / Endocrine ==========
  {
    code: 'HOR',
    name: '⚖️ Hormones / Endocrine',
    icon: '⚖️',
    color: '#16a085',
    tests: [
      'Thyroid profile (TSH, Free T3, Free T4)',
      'Cortisol (morning/evening)',
      'ACTH',
      'Prolactin',
      'LH, FSH',
      'Estradiol (E2)',
      'Progesterone',
      'Testosterone (total/free)',
      'DHEA-S',
      'Aldosterone / Renin ratio',
      'Metanephrines',
      'Parathyroid hormone (PTH)',
      'Insulin, C-peptide',
      'Growth hormone (GH) + IGF-1',
      'Anti-Mullerian hormone (AMH)'
    ]
  },
  // ========== 9. Urine Tests ==========
  {
    code: 'URN',
    name: '💧 Urine Tests',
    icon: '💧',
    color: '#2980b9',
    tests: [
      'Urinalysis (routine & microscopy)',
      'Urine glucose, ketones',
      'Urine protein (spot, 24-hour)',
      'Urine microalbumin / creatinine ratio',
      'Urine culture & sensitivity',
      'Urine pregnancy test (β-hCG)',
      'Urine electrolytes (Na, K, Cl)',
      'Urine osmolality',
      'Urine creatinine',
      'Urine calcium (24-hour)',
      'Urine uric acid',
      'Urine catecholamines / metanephrines',
      'Urine cortisol (free)',
      'Urine drug screen',
      'Urine Bence Jones protein'
    ]
  },
  // ========== 10. Stool Tests ==========
  {
    code: 'STL',
    name: '🧫 Stool Tests',
    icon: '🧫',
    color: '#27ae60',
    tests: [
      'Stool routine & microscopy',
      'Occult blood (FOBT / FIT)',
      'Stool culture & sensitivity',
      'Stool for ova, cyst, parasite',
      'Stool antigen tests (Giardia, Cryptosporidium, H.pylori)',
      'Calprotectin',
      'Stool reducing substances',
      'Stool fat',
      'Stool elastase'
    ]
  },
  // ========== 11. ECG / Cardiac Electrophysiology ==========
  {
    code: 'ECG',
    name: '❤️ ECG / Cardiac Electrophysiology',
    icon: '❤️',
    color: '#e74c3c',
    tests: [
      'ECG (12-lead, resting)',
      'Stress ECG (Treadmill test - TMT)',
      'Holter monitoring (24/48-hour)',
      'Event recorder',
      'Signal-averaged ECG'
    ]
  },
  // ========== 12. EEG / Neurophysiology ==========
  {
    code: 'EEG',
    name: '🧠 EEG / Neurophysiology',
    icon: '🧠',
    color: '#9b59b6',
    tests: [
      'Routine EEG',
      'Sleep-deprived EEG',
      'Video-EEG monitoring',
      'Ambulatory EEG',
      'Evoked potentials (VEP, BAER, SSEP)',
      'Electromyography (EMG)',
      'Nerve conduction studies (NCS)',
      'Repetitive nerve stimulation'
    ]
  },
  // ========== 13. Pulmonary Function Tests (PFT) ==========
  {
    code: 'PFT',
    name: '🫁 Pulmonary Function Tests',
    icon: '🫁',
    color: '#1abc9c',
    tests: [
      'Spirometry (FEV1, FVC, FEV1/FVC)',
      'Bronchodilator reversibility test',
      'Lung volumes (plethysmography)',
      'Diffusing capacity (DLCO)',
      '6-minute walk test',
      'Fractional exhaled nitric oxide (FeNO)',
      'Methacholine challenge test'
    ]
  },
  // ========== 14. Endoscopy ==========
  {
    code: 'END',
    name: '🔬 Endoscopy',
    icon: '🔬',
    color: '#2c3e50',
    tests: [
      'Upper GI endoscopy (EGD)',
      'Colonoscopy',
      'Sigmoidoscopy',
      'Bronchoscopy',
      'Cystoscopy',
      'Hysteroscopy',
      'Laparoscopy',
      'Arthroscopy',
      'ERCP',
      'Capsule endoscopy'
    ]
  },
  // ========== 15. Nuclear Medicine / PET ==========
  {
    code: 'NUC',
    name: '⚛️ Nuclear Medicine / PET',
    icon: '⚛️',
    color: '#16a085',
    tests: [
      'PET-CT (whole body, cardiac, brain)',
      'Bone scan (Tc-99m)',
      'Thyroid scan',
      'Renal scan (DTPA, MAG3, DMSA)',
      'V/Q scan',
      'HIDA scan',
      'Myocardial perfusion scan (MIBI, Thallium)',
      'Parathyroid scan',
      'Octreotide scan',
      'MIBG scan',
      'Gallium scan',
      'Gastric emptying scan',
      'Meckel\'s scan'
    ]
  },
  // ========== 16. Special / Other Tests ==========
  {
    code: 'SPL',
    name: '⭐ Special / Other Tests',
    icon: '⭐',
    color: '#7f8c8d',
    tests: [
      'Sweat chloride test',
      'Genetic testing (DNA/RNA sequencing, karyotype, FISH)',
      'Paternity testing',
      'HLA typing',
      'CSF analysis',
      'Synovial fluid analysis',
      'Peritoneal fluid analysis',
      'Pleural fluid analysis',
      'Amniotic fluid analysis',
      'Chorionic villus sampling',
      'Skin biopsy',
      'Muscle biopsy',
      'Nerve biopsy',
      'Bone marrow aspirate & biopsy',
      'Fine needle aspiration cytology (FNAC)',
      'Pap smear',
      'Semen analysis',
      'Swabs (throat, nasal, wound, genital)'
    ]
  }
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
    <div>
      <span style={{ fontWeight: 'bold' }}>{result.testName}</span>
      <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '10px' }}>{result.icon} {result.category}</span>
    </div>
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        <input type="checkbox" checked={selectedTests.includes(result.testName)} onChange={() => toggleTest(result.testName)} />
        Select
      </label>
      <button 
        onClick={() => { setSelectedTests([result.testName]); setShowComparison(true); }} 
        style={{ backgroundColor: '#3b82f6', color: 'white', padding: '5px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
      >
        Compare
      </button>
    </div>
  </div>
))}

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