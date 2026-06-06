import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Same test categories as Lab Tests
const testCategories = [
  { code: 'MRI', name: '🧠 MRI (Magnetic Resonance Imaging)', icon: '🧠', color: '#8e44ad', tests: ['MRI Brain', 'MRI Spine', 'MRI Joints', 'MRI Abdomen / MRCP', 'MRI Pelvis', 'MRI Cardiac', 'MRI Angiography (MRA)', 'MRI Breast', 'MRI Orbit / IAC', 'MRI Soft tissue', 'MR Venography (MRV)'] },
  { code: 'CT', name: '📷 CT (Computed Tomography)', icon: '📷', color: '#3498db', tests: ['CT Head', 'CT Chest', 'CT Abdomen + Pelvis', 'CT Angiography (CTA)', 'CT Spine', 'CT Facial bones / Sinus', 'CT Temporal bone', 'CT Urogram', 'CT Virtual colonoscopy', 'CT Perfusion', 'CT Guided biopsy'] },
  { code: 'XR', name: '🦴 X-ray (Radiography)', icon: '🦴', color: '#e67e22', tests: ['Chest X-ray', 'X-ray Spine', 'X-ray Limbs', 'X-ray Legs', 'X-ray Pelvis / Hip', 'X-ray Shoulder', 'X-ray Skull', 'X-ray Sinus', 'X-ray Abdomen (KUB)', 'X-ray Joints', 'X-ray Dental (OPG)', 'X-ray Mammogram', 'X-ray Barium studies', 'X-ray DEXA'] },
  { code: 'USG', name: '🔊 Ultrasound (Sonography)', icon: '🔊', color: '#1abc9c', tests: ['USG Abdomen', 'USG Pelvis', 'USG Transvaginal', 'USG Transrectal', 'USG Thyroid', 'USG Breast', 'USG Scrotum', 'USG Musculoskeletal', 'USG Vascular Doppler', 'USG Lower limb (DVT)', 'USG Upper limb', 'USG Renal Doppler', 'USG Hepatobiliary Doppler', 'USG Neonatal brain', 'USG KUB', 'USG Guided procedures', 'ECHO (Echocardiography)', 'Obstetric USG'] },
  { code: 'HEM', name: '🩸 Hematology', icon: '🩸', color: '#e74c3c', tests: ['Complete Blood Count (CBC)', 'Hemoglobin (Hb)', 'Hematocrit (HCT)', 'RBC count', 'WBC count (TLC, DLC)', 'Platelet count', 'Peripheral smear', 'ESR', 'CRP', 'Coagulation profile (PT, INR, aPTT)', 'Bleeding time', 'Clotting time', 'D-Dimer', 'Fibrinogen', 'Hb electrophoresis', 'Reticulocyte count', 'Blood grouping + Rh typing'] },
  { code: 'BIO', name: '🧪 Biochemistry', icon: '🧪', color: '#f39c12', tests: ['Blood glucose (Fasting, PP, Random)', 'HbA1c', 'Liver Function Test (LFT)', 'Renal Function Test (RFT)', 'Electrolytes (Na, K, Cl, Ca, Mg, P)', 'Lipid profile', 'Cardiac enzymes (CK-MB, Troponin, LDH)', 'Pancreatic enzymes (Amylase, Lipase)', 'Iron studies (Serum iron, TIBC, Ferritin)', 'Vitamin B12', 'Vitamin D', 'Folate', 'Homocysteine', 'Ammonia', 'Lactate', 'Blood gas (ABG / VBG)'] },
  { code: 'SER', name: '🦠 Serology / Immunology', icon: '🦠', color: '#9b59b6', tests: ['HIV (1+2)', 'HBsAg (Hepatitis B)', 'Anti-HBs, Anti-HBc', 'Hepatitis C antibody', 'Hepatitis A IgM', 'Hepatitis E IgM', 'Syphilis (VDRL, TPHA)', 'Dengue (NS1 antigen, IgM, IgG)', 'Chikungunya IgM/IgG', 'Malaria (rapid antigen, smear)', 'Typhoid (Widal, Typhidot)', 'Rheumatoid factor (RF)', 'Anti-CCP (ACPA)', 'ANA + ENA profile', 'Anti-dsDNA', 'ANCA (c-ANCA, p-ANCA)', 'Anti-phospholipid antibodies', 'Complement C3, C4', 'Serum protein electrophoresis (SPEP)', 'Quantitative immunoglobulins', 'Total IgE', 'RAST test', 'hs-CRP', 'Procalcitonin', 'Tumor markers (AFP, CEA, CA-125, CA 19-9, CA 15-3, PSA)'] },
  { code: 'HOR', name: '⚖️ Hormones / Endocrine', icon: '⚖️', color: '#16a085', tests: ['Thyroid profile (TSH, Free T3, Free T4)', 'Cortisol (morning/evening)', 'ACTH', 'Prolactin', 'LH, FSH', 'Estradiol (E2)', 'Progesterone', 'Testosterone (total/free)', 'DHEA-S', 'Aldosterone / Renin ratio', 'Metanephrines', 'Parathyroid hormone (PTH)', 'Insulin, C-peptide', 'Growth hormone (GH) + IGF-1', 'Anti-Mullerian hormone (AMH)'] },
  { code: 'URN', name: '💧 Urine Tests', icon: '💧', color: '#2980b9', tests: ['Urinalysis (routine & microscopy)', 'Urine glucose, ketones', 'Urine protein (spot, 24-hour)', 'Urine microalbumin / creatinine ratio', 'Urine culture & sensitivity', 'Urine Gram stain', 'Urine pregnancy test (β-hCG)', 'Urine electrolytes (Na, K, Cl)', 'Urine osmolality', 'Urine creatinine', 'Urine urea nitrogen', 'Urine calcium (24-hour)', 'Urine uric acid', 'Urine porphobilinogen', 'Urine catecholamines / metanephrines', 'Urine cortisol (free)', 'Urine 5-HIAA', 'Urine drug screen', 'Urine Bence Jones protein'] },
  { code: 'STL', name: '🧫 Stool Tests', icon: '🧫', color: '#27ae60', tests: ['Stool routine & microscopy', 'Occult blood (FOBT / FIT)', 'Stool culture & sensitivity', 'Stool for ova, cyst, parasite', 'Stool antigen tests (Giardia, Cryptosporidium, H.pylori)', 'Stool PCR for pathogens', 'Calprotectin', 'Stool reducing substances', 'Stool fat (quantitative/qualitative)', 'Stool elastase', 'Stool pH'] },
  { code: 'ECG', name: '❤️ ECG / Cardiac Electrophysiology', icon: '❤️', color: '#e74c3c', tests: ['ECG (12-lead, resting)', 'Stress ECG (Treadmill test - TMT)', 'Holter monitoring (24/48-hour)', 'Event recorder', 'Signal-averaged ECG'] },
  { code: 'EEG', name: '🧠 EEG / Neurophysiology', icon: '🧠', color: '#9b59b6', tests: ['Routine EEG', 'Sleep-deprived EEG', 'Video-EEG monitoring', 'Ambulatory EEG', 'Evoked potentials (VEP, BAER, SSEP)', 'Electromyography (EMG)', 'Nerve conduction studies (NCS)', 'Repetitive nerve stimulation'] },
  { code: 'PFT', name: '🫁 Pulmonary Function Tests', icon: '🫁', color: '#1abc9c', tests: ['Spirometry (FEV1, FVC, FEV1/FVC)', 'Bronchodilator reversibility test', 'Lung volumes (plethysmography)', 'Diffusing capacity (DLCO)', '6-minute walk test', 'Fractional exhaled nitric oxide (FeNO)', 'Methacholine challenge test', 'Maximal respiratory pressures (MIP/MEP)', 'Nocturnal oximetry'] },
  { code: 'END', name: '🔬 Endoscopy', icon: '🔬', color: '#2c3e50', tests: ['Upper GI endoscopy (EGD)', 'Colonoscopy', 'Sigmoidoscopy', 'Bronchoscopy', 'Cystoscopy', 'Hysteroscopy', 'Laparoscopy', 'Arthroscopy', 'ERCP', 'Capsule endoscopy', 'Enteroscopy', 'EUS'] },
  { code: 'NUC', name: '⚛️ Nuclear Medicine / PET', icon: '⚛️', color: '#16a085', tests: ['PET-CT (whole body, cardiac, brain)', 'Bone scan (Tc-99m)', 'Thyroid scan (I-123, Tc-99m)', 'Renal scan (DTPA, MAG3, DMSA)', 'V/Q scan (lung)', 'HIDA scan (gallbladder)', 'Myocardial perfusion scan (MIBI, Thallium)', 'Parathyroid scan (Sestamibi)', 'Octreotide scan', 'MIBG scan', 'Gallium scan', 'White cell scan', 'Gastric emptying scan', 'Meckel\'s scan'] },
  { code: 'SPL', name: '⭐ Special Tests', icon: '⭐', color: '#7f8c8d', tests: ['Sweat chloride test', 'Genetic testing (DNA/RNA sequencing)', 'Karyotype / FISH / Microarray', 'Single gene sequencing', 'NGS panel / Whole exome', 'NIPT', 'HLA typing', 'Paternity testing', 'CSF analysis', 'Synovial fluid analysis', 'Peritoneal fluid analysis', 'Pleural fluid analysis', 'Amniotic fluid analysis', 'Skin biopsy', 'Muscle biopsy', 'Nerve biopsy', 'Bone marrow aspirate & biopsy', 'Fine needle aspiration cytology (FNAC)', 'Pap smear', 'Semen analysis'] }
];

const DiagnosticsCustomPackage = ({ preselectedTests = [] }) => {
  const navigate = useNavigate();
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [providers, setProviders] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubCategories, setExpandedSubCategories] = useState({});
  const [visibleTests, setVisibleTests] = useState({});
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [homeCollectionOnly, setHomeCollectionOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState('');
  const [directSearchResults, setDirectSearchResults] = useState([]);
  const [showDirectResults, setShowDirectResults] = useState(false);
  
  // Booking modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    patient_name: '',
    patient_age: '',
    patient_gender: 'male',
    patient_phone: '',
    patient_email: '',
    appointment_date: '',
    home_collection_requested: false,
    home_address: ''
  });

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

  // Search effect - direct results
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

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (preselectedTests && preselectedTests.length > 0) {
      setSelectedTests(preselectedTests);
      handleCompareByName(preselectedTests);
    }
  }, [preselectedTests]);

  const toggleTest = (testName) => {
    let newSelected;
    if (selectedTests.includes(testName)) {
      newSelected = selectedTests.filter(t => t !== testName);
      setSelectedTests(newSelected);
      if (newSelected.length >= 2) {
        handleCompareByName(newSelected);
      } else {
        setProviders([]);
      }
    } else {
      newSelected = [...selectedTests, testName];
      setSelectedTests(newSelected);
      if (newSelected.length >= 2) {
        handleCompareByName(newSelected);
      }
    }
  };

  const handleCompareByName = async (testNames) => {
    if (testNames.length < 2) return;
    setComparing(true);
    try {
      const testsRes = await axios.get(`${API_URL}/diagnostics/tests`);
      const allTestsData = testsRes.data?.data || [];
      
      const testIds = [];
      testNames.forEach(name => {
        const found = allTestsData.find(t => t.test_name === name);
        if (found) testIds.push(found._id);
      });
      
      if (testIds.length < 2) {
        alert('Could not find test IDs for selected tests');
        setComparing(false);
        return;
      }
      
      const res = await axios.post(`${API_URL}/diagnostics/compare-package`, { 
        testIds,
        lat: userLocation?.lat,
        lng: userLocation?.lng
      });
      if (res.data.providers) {
        const sorted = [...res.data.providers].sort((a, b) => {
          const totalA = testNames.reduce((s, name) => s + (a.individual_prices[name] || 0), 0);
          const totalB = testNames.reduce((s, name) => s + (b.individual_prices[name] || 0), 0);
          return totalA - totalB;
        });
        setProviders(sorted);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setComparing(false);
    }
  };

  const openBookingModal = (provider) => {
    setSelectedProvider(provider);
    setShowBookingModal(true);
  };

  const handleBookingChange = (e) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProvider) {
      alert('No provider selected');
      return;
    }
    
    const total = selectedTests.reduce((sum, testName) => sum + (selectedProvider.individual_prices[testName] || 0), 0);
    
    alert(`Booking successful!\nProvider: ${selectedProvider.provider_name}\nTests: ${selectedTests.join(', ')}\nTotal: ₹${total}\nReference: CUST${Date.now()}`);
    setShowBookingModal(false);
    setSelectedProvider(null);
    setBookingForm({
      patient_name: '', patient_age: '', patient_gender: 'male', patient_phone: '',
      patient_email: '', appointment_date: '', home_collection_requested: false, home_address: ''
    });
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedProvider(null);
  };

  const toggleCategory = (code) => {
    setExpandedCategories(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleSubCategory = (mainCode, subName) => {
    const key = `${mainCode}_${subName}`;
    setExpandedSubCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const showMoreTests = (categoryCode) => {
    setVisibleTests(prev => ({
      ...prev,
      [categoryCode]: (prev[categoryCode] || 10) + 10
    }));
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

  // Get filtered categories for main view
  const getFilteredCategories = () => {
    if (!searchTerm || showDirectResults) return testCategories;
    
    const lowerSearch = searchTerm.toLowerCase();
    return testCategories.map(category => ({
      ...category,
      tests: category.tests.filter(test => test.toLowerCase().includes(lowerSearch))
    })).filter(cat => cat.tests.length > 0);
  };

  const filteredCategories = getFilteredCategories();

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate('/diagnostics-list')}>← Back</button>
      <h1>Build Custom Package</h1>
      <p>Select 2 or more tests from below to compare prices across labs.</p>

      {/* Search and Filter Bar - Same as Lab Tests */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <input 
            type="text" 
            placeholder="🔍 Search any test (e.g., MRI Brain, CBC, X-ray)..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={{ flex: 2, padding: '12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }} 
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
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input 
            type="number" 
            placeholder="💰 Max Price (₹)" 
            value={maxPrice} 
            onChange={(e) => setMaxPrice(e.target.value)} 
            style={{ width: '130px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} 
          />
          <input 
            type="number" 
            placeholder="📏 Max Distance (km)" 
            value={maxDistance} 
            onChange={(e) => setMaxDistance(e.target.value)} 
            style={{ width: '140px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} 
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'white', padding: '0 10px', borderRadius: '4px', height: '42px' }}>
            <input type="checkbox" checked={homeCollectionOnly} onChange={(e) => setHomeCollectionOnly(e.target.checked)} />
            🏠 Home Collection Only
          </label>
          <button onClick={() => setUseMyLocation(true)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📍 Use My Location</button>
          <button onClick={resetFilters} style={{ backgroundColor: '#6b7280', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset Filters</button>
        </div>
        
        {userLocation && <p style={{ fontSize: '12px', marginTop: '10px', color: '#10b981' }}>📍 Location detected</p>}
        {searchTerm && <p style={{ fontSize: '12px', marginTop: '10px' }}>Found {directSearchResults.length} tests matching "{searchTerm}"</p>}
      </div>

      {/* Direct Search Results */}
      {showDirectResults && searchTerm && (
        <div style={{ marginBottom: '20px' }}>
          <h3>🔍 Search Results ({directSearchResults.length})</h3>
          {directSearchResults.map((result, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'white', border: `1px solid ${result.color}`, borderRadius: '8px', marginBottom: '8px' }}>
              <div><strong>{result.testName}</strong> <span style={{ fontSize: '12px', color: '#6b7280' }}>{result.icon} {result.category}</span></div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={selectedTests.includes(result.testName)} onChange={() => toggleTest(result.testName)} />
                  Select
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categories View */}
      {!searchTerm && (
        <div>
          {filteredCategories.map(category => {
            const visibleCount = visibleTests[category.code] || 10;
            const hasMore = visibleCount < category.tests.length;
            const displayedTests = category.tests.slice(0, visibleCount);
            
            return (
              <div key={category.code} style={{ marginBottom: '20px', border: `1px solid ${category.color}`, borderRadius: '8px', overflow: 'hidden' }}>
                <div 
                  onClick={() => toggleCategory(category.code)} 
                  style={{ backgroundColor: category.color, color: 'white', padding: '12px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}
                >
                  <span>{category.icon} {category.name} ({category.tests.length} tests)</span>
                  <span>{expandedCategories[category.code] ? '▼' : '▶'}</span>
                </div>
                
                {expandedCategories[category.code] && (
                  <div style={{ backgroundColor: '#f9fafb', padding: '10px' }}>
                    <div style={{ padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {displayedTests.map(test => (
                        <label key={test} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedTests.includes(test)} 
                            onChange={() => toggleTest(test)} 
                          />
                          {test}
                        </label>
                      ))}
                    </div>
                    {hasMore && (
                      <div style={{ padding: '8px', textAlign: 'center', backgroundColor: '#f3f4f6' }}>
                        <button onClick={() => showMoreTests(category.code)} style={{ backgroundColor: '#6b7280', color: 'white', padding: '5px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          Show More... ({category.tests.length - visibleCount} more)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {comparing && <p style={{ marginTop: '20px' }}>Comparing...</p>}
      
      {providers.length > 0 && selectedTests.length >= 2 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Comparison Results - Cheapest Provider First</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Provider</th>
                  {selectedTests.map((test, idx) => (
                    <th key={idx} style={{ border: '1px solid #ddd', padding: '8px' }}>{test}</th>
                  ))}
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Total</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Rating</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Distance</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Action</th>
                </table>
              </thead>
              <tbody>
                {providers.map((provider, idx) => {
                  const total = selectedTests.reduce((sum, test) => sum + (provider.individual_prices[test] || 0), 0);
                  return (
                    <tr key={idx}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{provider.provider_name} {idx === 0 && '⭐'}</td>
                      {selectedTests.map((test, i) => (
                        <td key={i} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                          ₹{provider.individual_prices[test] || 'N/A'}
                        </td>
                      ))}
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}><strong>₹{total}</strong></td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>⭐ {provider.rating || 4.5}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{provider.distance || 'N/A'} km</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                        <button onClick={() => openBookingModal(provider)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          Book Now
                        </button>
                       </td>
                     </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Booking Modal */}
      {showBookingModal && selectedProvider && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2>Book Custom Package</h2>
            <p><strong>Provider:</strong> {selectedProvider.provider_name}</p>
            <p><strong>Tests:</strong> {selectedTests.join(', ')}</p>
            <p><strong>Total Amount:</strong> ₹{selectedTests.reduce((sum, test) => sum + (selectedProvider.individual_prices[test] || 0), 0)}</p>
            
            <form onSubmit={handleBookingSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Full Name *</label>
                <input type="text" name="patient_name" required value={bookingForm.patient_name} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Age *</label>
                  <input type="number" name="patient_age" required value={bookingForm.patient_age} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Gender *</label>
                  <select name="patient_gender" value={bookingForm.patient_gender} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Phone Number *</label>
                <input type="tel" name="patient_phone" required value={bookingForm.patient_phone} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                <input type="email" name="patient_email" value={bookingForm.patient_email} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Appointment Date *</label>
                <input type="date" name="appointment_date" required value={bookingForm.appointment_date} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>Confirm Booking</button>
                <button type="button" onClick={closeBookingModal} style={{ flex: 1, backgroundColor: '#6b7280', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsCustomPackage;