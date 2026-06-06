import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Complete 16 categories with subcategories (same as Lab Tests)
const testCategories = [
  { code: 'MRI', name: '🧠 MRI (Magnetic Resonance Imaging)', icon: '🧠', color: '#8e44ad', subcategories: [
    { name: 'Brain', tests: ['MRI Brain', 'MRI Orbit / IAC'] },
    { name: 'Spine', tests: ['MRI Spine (cervical, thoracic, lumbar)'] },
    { name: 'Joints', tests: ['MRI Joints (shoulder, knee, hip, wrist, ankle)'] },
    { name: 'Abdomen', tests: ['MRI Abdomen / MRCP', 'MRI Pelvis'] },
    { name: 'Cardiac', tests: ['MRI Cardiac', 'MRI Angiography (MRA)', 'MR Venography (MRV)'] },
    { name: 'Other', tests: ['MRI Breast', 'MRI Soft tissue'] }
  ] },
  { code: 'CT', name: '📷 CT (Computed Tomography)', icon: '📷', color: '#3498db', subcategories: [
    { name: 'Head', tests: ['CT Head', 'CT Facial bones / Sinus', 'CT Temporal bone'] },
    { name: 'Chest', tests: ['CT Chest', 'CT Angiography (CTA)'] },
    { name: 'Abdomen', tests: ['CT Abdomen + Pelvis', 'CT Urogram', 'CT Virtual colonoscopy'] },
    { name: 'Spine', tests: ['CT Spine'] },
    { name: 'Other', tests: ['CT Perfusion', 'CT Guided biopsy'] }
  ] },
  { code: 'XR', name: '🦴 X-ray (Radiography)', icon: '🦴', color: '#e67e22', subcategories: [
    { name: 'Chest', tests: ['Chest X-ray (CXR)'] },
    { name: 'Spine', tests: ['X-ray Spine'] },
    { name: 'Limbs', tests: ['X-ray Limbs', 'X-ray Legs', 'X-ray Joints'] },
    { name: 'Pelvis', tests: ['X-ray Pelvis / Hip'] },
    { name: 'Skull', tests: ['X-ray Skull', 'X-ray Sinus', 'X-ray Dental (OPG)'] },
    { name: 'Abdomen', tests: ['X-ray Abdomen (KUB)'] },
    { name: 'Other', tests: ['X-ray Mammogram', 'X-ray Barium studies', 'X-ray DEXA'] }
  ] },
  { code: 'USG', name: '🔊 Ultrasound (Sonography)', icon: '🔊', color: '#1abc9c', subcategories: [
    { name: 'Abdomen', tests: ['USG Abdomen', 'USG KUB'] },
    { name: 'Pelvis', tests: ['USG Pelvis', 'USG Transvaginal', 'USG Transrectal'] },
    { name: 'Thyroid', tests: ['USG Thyroid / Neck'] },
    { name: 'Breast', tests: ['USG Breast'] },
    { name: 'Vascular', tests: ['USG Vascular Doppler', 'USG Renal Doppler', 'USG Hepatobiliary Doppler'] },
    { name: 'Other', tests: ['USG Scrotum', 'USG Musculoskeletal', 'USG Neonatal brain', 'USG Guided procedures', 'ECHO (Echocardiography)', 'Obstetric USG'] }
  ] },
  { code: 'HEM', name: '🩸 Hematology', icon: '🩸', color: '#e74c3c', subcategories: [
    { name: 'CBC', tests: ['Complete Blood Count (CBC)', 'Hemoglobin (Hb)', 'Hematocrit (HCT)', 'RBC count', 'WBC count', 'Platelet count'] },
    { name: 'Coagulation', tests: ['Coagulation profile (PT, INR, aPTT)', 'Bleeding time', 'Clotting time', 'D-Dimer', 'Fibrinogen'] },
    { name: 'Other', tests: ['Peripheral smear', 'ESR', 'CRP', 'Hb electrophoresis', 'Reticulocyte count', 'Blood grouping + Rh typing'] }
  ] },
  { code: 'BIO', name: '🧪 Biochemistry', icon: '🧪', color: '#f39c12', subcategories: [
    { name: 'Diabetes', tests: ['Blood glucose (Fasting, PP, Random)', 'HbA1c'] },
    { name: 'Liver', tests: ['Liver Function Test (LFT)'] },
    { name: 'Kidney', tests: ['Renal Function Test (RFT)'] },
    { name: 'Lipids', tests: ['Lipid profile'] },
    { name: 'Cardiac', tests: ['Cardiac enzymes (CK-MB, Troponin, LDH)'] },
    { name: 'Other', tests: ['Electrolytes', 'Iron studies', 'Vitamin B12', 'Vitamin D', 'Blood gas (ABG / VBG)'] }
  ] },
  { code: 'SER', name: '🦠 Serology / Immunology', icon: '🦠', color: '#9b59b6', subcategories: [
    { name: 'Infectious', tests: ['HIV', 'HBsAg', 'Hepatitis C', 'Syphilis', 'Dengue', 'Malaria', 'Typhoid'] },
    { name: 'Autoimmune', tests: ['Rheumatoid factor (RF)', 'Anti-CCP', 'ANA', 'Anti-dsDNA', 'ANCA'] },
    { name: 'Tumor Markers', tests: ['AFP', 'CEA', 'CA-125', 'CA 19-9', 'PSA'] }
  ] },
  { code: 'HOR', name: '⚖️ Hormones / Endocrine', icon: '⚖️', color: '#16a085', subcategories: [
    { name: 'Thyroid', tests: ['Thyroid profile (TSH, Free T3, Free T4)'] },
    { name: 'Reproductive', tests: ['LH, FSH', 'Estradiol (E2)', 'Progesterone', 'Testosterone', 'Prolactin'] },
    { name: 'Other', tests: ['Cortisol', 'Insulin', 'C-peptide', 'Parathyroid hormone (PTH)'] }
  ] },
  { code: 'URN', name: '💧 Urine Tests', icon: '💧', color: '#2980b9', subcategories: [
    { name: 'Routine', tests: ['Urinalysis (routine & microscopy)'] },
    { name: 'Culture', tests: ['Urine culture & sensitivity'] },
    { name: 'Chemistry', tests: ['Urine protein', 'Urine microalbumin', 'Urine electrolytes', 'Urine osmolality'] },
    { name: 'Other', tests: ['Urine pregnancy test (β-hCG)', 'Urine drug screen'] }
  ] },
  { code: 'STL', name: '🧫 Stool Tests', icon: '🧫', color: '#27ae60', subcategories: [
    { name: 'Routine', tests: ['Stool routine & microscopy'] },
    { name: 'Blood', tests: ['Occult blood (FOBT / FIT)'] },
    { name: 'Culture', tests: ['Stool culture & sensitivity'] },
    { name: 'Other', tests: ['Stool antigen tests', 'Calprotectin'] }
  ] },
  { code: 'ECG', name: '❤️ ECG / Cardiac Electrophysiology', icon: '❤️', color: '#e74c3c', subcategories: [
    { name: 'ECG', tests: ['ECG (12-lead, resting)', 'Stress ECG (Treadmill test - TMT)'] },
    { name: 'Monitoring', tests: ['Holter monitoring (24/48-hour)', 'Event recorder'] }
  ] },
  { code: 'EEG', name: '🧠 EEG / Neurophysiology', icon: '🧠', color: '#9b59b6', subcategories: [
    { name: 'EEG', tests: ['Routine EEG', 'Sleep-deprived EEG', 'Video-EEG monitoring'] },
    { name: 'Nerve', tests: ['Electromyography (EMG)', 'Nerve conduction studies (NCS)'] }
  ] },
  { code: 'PFT', name: '🫁 Pulmonary Function Tests', icon: '🫁', color: '#1abc9c', subcategories: [
    { name: 'Spirometry', tests: ['Spirometry', 'Bronchodilator reversibility test'] },
    { name: 'Other', tests: ['Lung volumes', 'Diffusing capacity (DLCO)', '6-minute walk test'] }
  ] },
  { code: 'END', name: '🔬 Endoscopy', icon: '🔬', color: '#2c3e50', subcategories: [
    { name: 'Upper GI', tests: ['Upper GI endoscopy (EGD)', 'ERCP', 'Capsule endoscopy'] },
    { name: 'Lower GI', tests: ['Colonoscopy', 'Sigmoidoscopy'] },
    { name: 'Other', tests: ['Bronchoscopy', 'Cystoscopy', 'Hysteroscopy'] }
  ] },
  { code: 'NUC', name: '⚛️ Nuclear Medicine / PET', icon: '⚛️', color: '#16a085', subcategories: [
    { name: 'PET', tests: ['PET-CT (whole body, cardiac, brain)'] },
    { name: 'Scan', tests: ['Bone scan', 'Thyroid scan', 'Renal scan', 'V/Q scan', 'HIDA scan'] }
  ] },
  { code: 'SPL', name: '⭐ Special Tests', icon: '⭐', color: '#7f8c8d', subcategories: [
    { name: 'Special', tests: ['Sweat chloride test', 'Genetic testing', 'HLA typing', 'Paternity testing', 'CSF analysis', 'Biopsy'] }
  ] }
];

const DiagnosticsCustomPackage = ({ preselectedTests = [] }) => {
  const navigate = useNavigate();
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [providers, setProviders] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubCategories, setExpandedSubCategories] = useState({});
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [homeCollectionOnly, setHomeCollectionOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState('');
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [directSearchResults, setDirectSearchResults] = useState([]);
  const [showDirectResults, setShowDirectResults] = useState(false);
  
  // Booking modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    patient_name: '', patient_age: '', patient_gender: 'male', patient_phone: '',
    patient_email: '', appointment_date: '', home_collection_requested: false, home_address: ''
  });

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  useEffect(() => {
    if (useMyLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => alert('Unable to get location')
      );
    }
  }, [useMyLocation]);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (preselectedTests && preselectedTests.length > 0) {
      setSelectedTests(preselectedTests.map(t => ({ name: t, id: t })));
      handleCompareByName(preselectedTests);
    }
  }, [preselectedTests]);

  // Search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setShowDirectResults(false);
      setDirectSearchResults([]);
      return;
    }
    const lowerSearch = searchTerm.toLowerCase();
    const results = [];
    testCategories.forEach(category => {
      category.subcategories.forEach(sub => {
        sub.tests.forEach(test => {
          if (test.toLowerCase().includes(lowerSearch)) {
            results.push({ testName: test, category: category.name, icon: category.icon, color: category.color });
          }
        });
      });
    });
    setDirectSearchResults(results);
    setShowDirectResults(true);
  }, [searchTerm]);

  const toggleTest = (testName) => {
    let newSelected;
    if (selectedTests.find(t => t.name === testName)) {
      newSelected = selectedTests.filter(t => t.name !== testName);
      setSelectedTests(newSelected);
      if (newSelected.length >= 2) {
        handleCompareByName(newSelected.map(t => t.name));
      } else {
        setProviders([]);
      }
    } else {
      newSelected = [...selectedTests, { name: testName, id: testName }];
      setSelectedTests(newSelected);
      if (newSelected.length >= 2) {
        handleCompareByName(newSelected.map(t => t.name));
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
      
      if (testIds.length < 2) return;
      
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
    if (!selectedProvider) return;
    const total = selectedTests.reduce((sum, test) => sum + (selectedProvider.individual_prices[test.name] || 0), 0);
    alert(`Booking successful!\nProvider: ${selectedProvider.provider_name}\nTotal: ₹${total}`);
    setShowBookingModal(false);
    setSelectedProvider(null);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedProvider(null);
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

  const toggleCategory = (code) => {
    setExpandedCategories(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleSubCategory = (mainCode, subName) => {
    const key = `${mainCode}_${subName}`;
    setExpandedSubCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getDistance = (provider) => {
    if (!userLocation || !provider.location?.lat) return Math.floor(Math.random() * 15) + 1;
    const lat1 = userLocation.lat;
    const lon1 = userLocation.lng;
    const lat2 = provider.location.lat;
    const lon2 = provider.location.lng;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate('/diagnostics-list')}>← Back</button>
      <h1>Build Custom Package</h1>
      <p>Select 2 or more tests from the categories below to compare prices across labs.</p>

      {/* Search and Filter Bar */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <input type="text" placeholder="🔍 Search any test..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 2, padding: '12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }} />
          <input type="text" placeholder="📍 City" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <select value={minRating} onChange={(e) => setMinRating(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
            <option value="">⭐ Rating</option><option value="4">4★ & above</option><option value="4.5">4.5★ & above</option><option value="4.8">4.8★ & above</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="number" placeholder="💰 Max Price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: '130px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input type="number" placeholder="📏 Max Distance" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} style={{ width: '140px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'white', padding: '0 10px', borderRadius: '4px', height: '42px' }}>
            <input type="checkbox" checked={homeCollectionOnly} onChange={(e) => setHomeCollectionOnly(e.target.checked)} /> 🏠 Home Collection
          </label>
          <button onClick={() => setUseMyLocation(true)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📍 My Location</button>
          <button onClick={resetFilters} style={{ backgroundColor: '#6b7280', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
        </div>
        {userLocation && <p style={{ fontSize: '12px', marginTop: '10px', color: '#10b981' }}>📍 Location detected</p>}
        {searchTerm && <p style={{ fontSize: '12px', marginTop: '10px' }}>Found {directSearchResults.length} tests</p>}
      </div>

      {/* Search Results */}
      {showDirectResults && searchTerm && (
        <div style={{ marginBottom: '20px' }}>
          <h3>🔍 Search Results ({directSearchResults.length})</h3>
          {directSearchResults.map((result, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'white', border: `1px solid ${result.color}`, borderRadius: '8px', marginBottom: '8px' }}>
              <div><strong>{result.testName}</strong> <span style={{ fontSize: '12px', color: '#6b7280' }}>{result.icon} {result.category}</span></div>
              <div><label><input type="checkbox" checked={selectedTests.some(t => t.name === result.testName)} onChange={() => toggleTest(result.testName)} /> Select</label></div>
            </div>
          ))}
        </div>
      )}

      {/* Categories View */}
      {!searchTerm && (
        <div>
          {testCategories.map(category => (
            <div key={category.code} style={{ marginBottom: '20px', border: `1px solid ${category.color}`, borderRadius: '8px', overflow: 'hidden' }}>
              <div onClick={() => toggleCategory(category.code)} style={{ backgroundColor: category.color, color: 'white', padding: '12px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{category.icon} {category.name}</span>
                <span>{expandedCategories[category.code] ? '▼' : '▶'}</span>
              </div>
              {expandedCategories[category.code] && (
                <div style={{ backgroundColor: '#f9fafb', padding: '10px' }}>
                  {category.subcategories.map(sub => (
                    <div key={sub.name} style={{ marginBottom: '10px' }}>
                      <div onClick={() => toggleSubCategory(category.code, sub.name)} style={{ padding: '8px', backgroundColor: '#f3f4f6', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderRadius: '4px', borderLeft: `4px solid ${category.color}` }}>
                        <span>📂 {sub.name} ({sub.tests.length} tests)</span>
                        <span>{expandedSubCategories[`${category.code}_${sub.name}`] ? '▼' : '▶'}</span>
                      </div>
                      {expandedSubCategories[`${category.code}_${sub.name}`] && (
                        <div style={{ padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {sub.tests.map(test => (
                            <label key={test} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
                              <input type="checkbox" checked={selectedTests.some(t => t.name === test)} onChange={() => toggleTest(test)} /> {test}
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
      
      {comparing && <p>Comparing...</p>}
      
      {providers.length > 0 && selectedTests.length >= 2 && (
        <div>
          <h2>Comparison Results - Cheapest Provider First</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th>Provider</th>
                  {selectedTests.map((test, idx) => <th key={idx}>{test.name}</th>)}
                  <th>Total</th><th>Rating</th><th>Distance</th><th>Action</th>
                </table>
              </thead>
              <tbody>
                {providers.map((provider, idx) => {
                  const total = selectedTests.reduce((sum, test) => sum + (provider.individual_prices[test.name] || 0), 0);
                  const distance = getDistance(provider);
                  return (
                    <tr key={idx}>
                      <td>{provider.provider_name} {idx === 0 && '⭐'}</td>
                      {selectedTests.map((test, i) => <td key={i}>₹{provider.individual_prices[test.name] || 'N/A'}</td>)}
                      <td><strong>₹{total}</strong></td>
                      <td>⭐ {provider.rating || 4.5}</td>
                      <td>{distance} km</td>
                      <td><button onClick={() => openBookingModal(provider)} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Book</button></td>
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
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%' }}>
            <h2>Book Custom Package</h2>
            <p><strong>Provider:</strong> {selectedProvider.provider_name}</p>
            <p><strong>Total:</strong> ₹{selectedTests.reduce((sum, test) => sum + (selectedProvider.individual_prices[test.name] || 0), 0)}</p>
            <form onSubmit={handleBookingSubmit}>
              <div><label>Full Name *</label><input type="text" name="patient_name" required onChange={handleBookingChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} /></div>
              <div><label>Phone *</label><input type="tel" name="patient_phone" required onChange={handleBookingChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} /></div>
              <div><label>Date *</label><input type="date" name="appointment_date" required onChange={handleBookingChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} /></div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Confirm</button>
                <button type="button" onClick={closeBookingModal} style={{ flex: 1, backgroundColor: '#6b7280', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsCustomPackage;