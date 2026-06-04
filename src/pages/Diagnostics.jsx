import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DiagnosticsCustomPackage from './DiagnosticsCustomPackage';

const healthPackages = [
  { id: 1, name: 'Full Body Checkup', provider: 'ABC Diagnostics', description: 'Complete health checkup', mrp: 2500, price: 1299, homeCollection: true, reportTime: '24 hours', popular: true },
  { id: 2, name: 'Cardiac Care Package', provider: 'ABC Diagnostics', description: 'Heart health checkup', mrp: 1800, price: 999, homeCollection: true, reportTime: '12 hours', popular: true },
  { id: 3, name: 'Diabetes Profile', provider: 'HealthCare Diagnostics', description: 'Complete diabetes screening', mrp: 1200, price: 699, homeCollection: true, reportTime: '8 hours', popular: true }
];

const testCategories = [
  // MRI
  { code: 'MRI', name: '🧠 MRI (Magnetic Resonance Imaging)', icon: '🧠', color: '#8e44ad', tests: ['MRI Brain', 'MRI Spine', 'MRI Joints', 'MRI Abdomen / MRCP', 'MRI Pelvis', 'MRI Cardiac', 'MRI Angiography (MRA)', 'MRI Breast', 'MRI Orbit / IAC', 'MRI Soft tissue', 'MR Venography (MRV)'] },
  // CT
  { code: 'CT', name: '📷 CT (Computed Tomography)', icon: '📷', color: '#3498db', tests: ['CT Head', 'CT Chest', 'CT Abdomen + Pelvis', 'CT Angiography (CTA)', 'CT Spine', 'CT Facial bones / Sinus', 'CT Temporal bone', 'CT Urogram', 'CT Virtual colonoscopy', 'CT Perfusion', 'CT Guided biopsy'] },
  // X-ray
  { code: 'XR', name: '🦴 X-ray (Radiography)', icon: '🦴', color: '#e67e22', tests: ['Chest X-ray', 'X-ray Spine', 'X-ray Limbs', 'X-ray Legs', 'X-ray Pelvis / Hip', 'X-ray Shoulder', 'X-ray Skull', 'X-ray Sinus', 'X-ray Abdomen (KUB)', 'X-ray Joints', 'X-ray Dental (OPG)', 'X-ray Mammogram', 'X-ray Barium studies', 'X-ray DEXA'] },
  // Ultrasound
  { code: 'USG', name: '🔊 Ultrasound (Sonography)', icon: '🔊', color: '#1abc9c', tests: ['USG Abdomen', 'USG Pelvis', 'USG Transvaginal', 'USG Transrectal', 'USG Thyroid', 'USG Breast', 'USG Scrotum', 'USG Musculoskeletal', 'USG Vascular Doppler', 'USG Lower limb (DVT)', 'USG Renal Doppler', 'USG Neonatal brain', 'USG KUB', 'USG Guided procedures', 'ECHO', 'Obstetric USG'] },
  // Hematology
  { code: 'HEM', name: '🩸 Hematology', icon: '🩸', color: '#e74c3c', tests: ['Complete Blood Count (CBC)', 'Hemoglobin (Hb)', 'Hematocrit (HCT)', 'RBC count', 'WBC count', 'Platelet count', 'Peripheral smear', 'ESR', 'CRP', 'Coagulation profile (PT, INR, aPTT)', 'D-Dimer', 'Fibrinogen', 'Hb electrophoresis', 'Reticulocyte count', 'Blood grouping'] },
  // Biochemistry
  { code: 'BIO', name: '🧪 Biochemistry', icon: '🧪', color: '#f39c12', tests: ['Blood glucose (Fasting, PP)', 'HbA1c', 'Liver Function Test (LFT)', 'Renal Function Test (RFT)', 'Electrolytes', 'Lipid profile', 'Cardiac enzymes', 'Pancreatic enzymes', 'Iron studies', 'Vitamin B12', 'Vitamin D', 'Folate', 'Homocysteine', 'Ammonia', 'Lactate', 'Blood gas (ABG)'] },
  // Serology / Immunology
  { code: 'SER', name: '🦠 Serology / Immunology', icon: '🦠', color: '#9b59b6', tests: ['HIV', 'HBsAg (Hepatitis B)', 'Hepatitis C', 'Hepatitis A', 'Syphilis (VDRL)', 'Dengue', 'Chikungunya', 'Malaria', 'Typhoid', 'Rheumatoid factor (RF)', 'Anti-CCP', 'ANA', 'Anti-dsDNA', 'ANCA', 'Complement C3, C4', 'Serum protein electrophoresis', 'Tumor markers (AFP, CEA, CA-125, PSA)'] },
  // Hormones
  { code: 'HOR', name: '⚖️ Hormones', icon: '⚖️', color: '#16a085', tests: ['Thyroid profile (TSH, T3, T4)', 'Cortisol', 'ACTH', 'Prolactin', 'LH, FSH', 'Estradiol (E2)', 'Progesterone', 'Testosterone', 'DHEA-S', 'Aldosterone / Renin', 'Parathyroid hormone (PTH)', 'Insulin, C-peptide', 'Growth hormone (GH)', 'Anti-Mullerian hormone (AMH)'] },
  // Urine Tests
  { code: 'URN', name: '💧 Urine Tests', icon: '💧', color: '#2980b9', tests: ['Urinalysis', 'Urine glucose, ketones', 'Urine protein', 'Urine microalbumin', 'Urine culture & sensitivity', 'Urine pregnancy test', 'Urine electrolytes', 'Urine osmolality', 'Urine creatinine', 'Urine calcium', 'Urine uric acid', 'Urine catecholamines', 'Urine cortisol', 'Urine drug screen', 'Urine Bence Jones protein'] },
  // Stool Tests
  { code: 'STL', name: '🧫 Stool Tests', icon: '🧫', color: '#27ae60', tests: ['Stool routine & microscopy', 'Occult blood (FOBT)', 'Stool culture & sensitivity', 'Stool for ova, cyst, parasite', 'Stool antigen tests', 'Calprotectin', 'Stool reducing substances', 'Stool fat', 'Stool elastase'] },
  // ECG / Cardiac
  { code: 'ECG', name: '❤️ ECG / Cardiac', icon: '❤️', color: '#e74c3c', tests: ['ECG 12-lead', 'Stress ECG (TMT)', 'Holter monitoring', 'Event recorder', 'Signal-averaged ECG'] },
  // EEG / Neurophysiology
  { code: 'EEG', name: '🧠 EEG / Neurophysiology', icon: '🧠', color: '#9b59b6', tests: ['Routine EEG', 'Sleep-deprived EEG', 'Video-EEG', 'Ambulatory EEG', 'Evoked potentials (VEP, BAER)', 'Electromyography (EMG)', 'Nerve conduction studies (NCS)', 'Repetitive nerve stimulation'] },
  // Pulmonary Function Tests
  { code: 'PFT', name: '🫁 Pulmonary Function Tests', icon: '🫁', color: '#1abc9c', tests: ['Spirometry', 'Bronchodilator reversibility', 'Lung volumes', 'Diffusing capacity (DLCO)', '6-minute walk test', 'FeNO', 'Methacholine challenge'] },
  // Endoscopy
  { code: 'END', name: '🔬 Endoscopy', icon: '🔬', color: '#2c3e50', tests: ['Upper GI endoscopy (EGD)', 'Colonoscopy', 'Sigmoidoscopy', 'Bronchoscopy', 'Cystoscopy', 'Hysteroscopy', 'Laparoscopy', 'Arthroscopy', 'ERCP', 'Capsule endoscopy'] },
  // Nuclear Medicine / PET
  { code: 'NUC', name: '⚛️ Nuclear Medicine / PET', icon: '⚛️', color: '#16a085', tests: ['PET-CT whole body', 'Bone scan', 'Thyroid scan', 'Renal scan', 'V/Q scan', 'HIDA scan', 'Myocardial perfusion scan', 'Parathyroid scan', 'Octreotide scan', 'MIBG scan', 'Gallium scan', 'Gastric emptying scan'] },
  // Special Tests
  { code: 'SPL', name: '⭐ Special Tests', icon: '⭐', color: '#7f8c8d', tests: ['Sweat chloride test', 'Genetic testing', 'Paternity testing', 'HLA typing', 'CSF analysis', 'Synovial fluid analysis', 'Peritoneal fluid analysis', 'Pleural fluid analysis', 'Amniotic fluid analysis', 'Skin biopsy', 'Muscle biopsy', 'Bone marrow biopsy', 'FNAC', 'Pap smear', 'Semen analysis'] }
];

const ComparisonResults = ({ selectedTests, onBack }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockProviders = [
      { provider_name: 'ABC Diagnostics', rating: 4.5, distance: '2.5', home_collection: true, report_time_hours: 24, total_price: 0, individual_prices: {} },
      { provider_name: 'HealthCare Diagnostics', rating: 4.7, distance: '3.8', home_collection: true, report_time_hours: 24, total_price: 0, individual_prices: {} },
      { provider_name: 'Metropolis Healthcare', rating: 4.6, distance: '5.2', home_collection: true, report_time_hours: 48, total_price: 0, individual_prices: {} }
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
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{test}</td>
              {providers.map((p, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>₹{p.individual_prices[test] || 'N/A'}</td>
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
                <button onClick={() => alert(`Booking ${p.provider_name}\nTotal: ₹${p.total_price}`)} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Book</button>
              </td>
            ))}
           </tr>
        </tbody>
      </table>
    </div>
  );
};

const Diagnostics = () => {
  const [activeTab, setActiveTab] = useState('labtests');
  const [selectedTests, setSelectedTests] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [directSearchResults, setDirectSearchResults] = useState([]);
  const [showDirectResults, setShowDirectResults] = useState(false);

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
          <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <input type="text" placeholder="🔍 Search any test (e.g., MRI Brain, CBC, X-ray)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }} />
          </div>

          {showDirectResults && searchTerm && (
            <div style={{ marginBottom: '20px' }}>
              <h3>Search Results ({directSearchResults.length})</h3>
              {directSearchResults.map((result, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'white', border: `1px solid ${result.color}`, borderRadius: '8px', marginBottom: '8px' }}>
                  <span><strong>{result.testName}</strong> <span style={{ fontSize: '12px', color: '#6b7280' }}>{result.icon} {result.category}</span></span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><input type="checkbox" checked={selectedTests.includes(result.testName)} onChange={() => toggleTest(result.testName)} /> Select</label>
                    <button onClick={() => handleSingleCompare(result.testName)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '5px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Compare</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searchTerm && (
            <div>
              {testCategories.map(category => (
                <div key={category.code} style={{ marginBottom: '15px', border: `1px solid ${category.color}`, borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: category.color, color: 'white', padding: '12px 15px', fontWeight: 'bold' }}>{category.icon} {category.name}</div>
                  <div style={{ padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px', backgroundColor: '#f9fafb' }}>
                    {category.tests.map(test => (
                      <div key={test} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                        <label><input type="checkbox" checked={selectedTests.includes(test)} onChange={() => toggleTest(test)} /> {test}</label>
                        <button onClick={() => handleSingleCompare(test)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '4px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Compare</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTests.length >= 2 && (
            <button onClick={handleCompare} style={{ position: 'fixed', bottom: 20, right: 20, backgroundColor: '#10b981', color: 'white', padding: '15px 30px', border: 'none', borderRadius: 50, cursor: 'pointer', zIndex: 1000 }}>
              Compare Selected ({selectedTests.length})
            </button>
          )}
        </div>
      )}

      {activeTab === 'packages' && (
        <div>
          <h2>Health Packages</h2>
          {healthPackages.map(pkg => (
            <div key={pkg.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
              <h3>{pkg.name}</h3>
              <p>{pkg.description}</p>
              <p>Provider: {pkg.provider}</p>
              <p><span style={{ textDecoration: 'line-through' }}>₹{pkg.mrp}</span> <strong>₹{pkg.price}</strong></p>
              <button onClick={() => alert(`Booking ${pkg.name}`)} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Book Now</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'custom' && <DiagnosticsCustomPackage />}
    </div>
  );
};

export default Diagnostics;