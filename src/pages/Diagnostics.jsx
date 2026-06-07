import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DiagnosticsCustomPackage from './DiagnosticsCustomPackage';
import HealthPackagesTab from './HealthPackagesTab';

// All 16 Main Categories with their Sub-Category Tests
const testCategories = [
  { 
    code: 'MRI', 
    name: '🧠 MRI (Magnetic Resonance Imaging)', 
    icon: '🧠', 
    color: '#8e44ad',
    tests: ['MRI Brain', 'MRI Spine', 'MRI Joints', 'MRI Abdomen / MRCP', 'MRI Pelvis', 'MRI Cardiac', 'MRI Angiography (MRA)', 'MRI Breast', 'MRI Orbit / IAC', 'MRI Soft tissue', 'MR Venography (MRV)']
  },
  { 
    code: 'CT', 
    name: '📷 CT (Computed Tomography)', 
    icon: '📷', 
    color: '#3498db',
    tests: ['CT Head', 'CT Chest', 'CT Abdomen + Pelvis', 'CT Angiography (CTA)', 'CT Spine', 'CT Facial bones / Sinus', 'CT Temporal bone', 'CT Urogram', 'CT Virtual colonoscopy', 'CT Perfusion', 'CT Guided biopsy']
  },
  { 
    code: 'XR', 
    name: '🦴 X-ray (Radiography)', 
    icon: '🦴', 
    color: '#e67e22',
    tests: ['Chest X-ray', 'X-ray Spine', 'X-ray Limbs', 'X-ray Legs', 'X-ray Pelvis / Hip', 'X-ray Shoulder', 'X-ray Skull', 'X-ray Sinus', 'X-ray Abdomen (KUB)', 'X-ray Joints', 'X-ray Dental (OPG)', 'X-ray Mammogram', 'X-ray Barium studies', 'X-ray DEXA']
  },
  { 
    code: 'USG', 
    name: '🔊 Ultrasound (Sonography)', 
    icon: '🔊', 
    color: '#1abc9c',
    tests: ['USG Abdomen', 'USG Pelvis', 'USG Transvaginal', 'USG Transrectal', 'USG Thyroid', 'USG Breast', 'USG Scrotum', 'USG Musculoskeletal', 'USG Vascular Doppler', 'USG Lower limb (DVT)', 'USG Upper limb', 'USG Renal Doppler', 'USG Hepatobiliary Doppler', 'USG Neonatal brain', 'USG KUB', 'USG Guided procedures', 'ECHO (Echocardiography)', 'Obstetric USG']
  },
  { 
    code: 'HEM', 
    name: '🩸 Hematology', 
    icon: '🩸', 
    color: '#e74c3c',
    tests: ['Complete Blood Count (CBC)', 'Hemoglobin (Hb)', 'Hematocrit (HCT)', 'RBC count', 'WBC count (TLC, DLC)', 'Platelet count', 'Peripheral smear', 'ESR', 'CRP', 'Coagulation profile (PT, INR, aPTT)', 'Bleeding time', 'Clotting time', 'D-Dimer', 'Fibrinogen', 'Hb electrophoresis', 'Reticulocyte count', 'Blood grouping + Rh typing']
  },
  { 
    code: 'BIO', 
    name: '🧪 Biochemistry', 
    icon: '🧪', 
    color: '#f39c12',
    tests: ['Blood glucose (Fasting, PP, Random)', 'HbA1c', 'Liver Function Test (LFT)', 'Renal Function Test (RFT)', 'Electrolytes (Na, K, Cl, Ca, Mg, P)', 'Lipid profile', 'Cardiac enzymes (CK-MB, Troponin, LDH)', 'Pancreatic enzymes (Amylase, Lipase)', 'Iron studies (Serum iron, TIBC, Ferritin)', 'Vitamin B12', 'Vitamin D', 'Folate', 'Homocysteine', 'Ammonia', 'Lactate', 'Blood gas (ABG / VBG)']
  },
  { 
    code: 'SER', 
    name: '🦠 Serology / Immunology', 
    icon: '🦠', 
    color: '#9b59b6',
    tests: ['HIV (1+2)', 'HBsAg (Hepatitis B)', 'Anti-HBs, Anti-HBc', 'Hepatitis C antibody', 'Hepatitis A IgM', 'Hepatitis E IgM', 'Syphilis (VDRL, TPHA)', 'Dengue (NS1 antigen, IgM, IgG)', 'Chikungunya IgM/IgG', 'Malaria (rapid antigen, smear)', 'Typhoid (Widal, Typhidot)', 'Rheumatoid factor (RF)', 'Anti-CCP (ACPA)', 'ANA + ENA profile', 'Anti-dsDNA', 'ANCA (c-ANCA, p-ANCA)', 'Anti-phospholipid antibodies', 'Complement C3, C4', 'Serum protein electrophoresis (SPEP)', 'Quantitative immunoglobulins', 'Total IgE', 'RAST test', 'hs-CRP', 'Procalcitonin', 'Tumor markers (AFP, CEA, CA-125, CA 19-9, CA 15-3, PSA)']
  },
  { 
    code: 'HOR', 
    name: '⚖️ Hormones / Endocrine', 
    icon: '⚖️', 
    color: '#16a085',
    tests: ['Thyroid profile (TSH, Free T3, Free T4)', 'Cortisol (morning/evening)', 'ACTH', 'Prolactin', 'LH, FSH', 'Estradiol (E2)', 'Progesterone', 'Testosterone (total/free)', 'DHEA-S', 'Aldosterone / Renin ratio', 'Metanephrines', 'Parathyroid hormone (PTH)', 'Insulin, C-peptide', 'Growth hormone (GH) + IGF-1', 'Anti-Mullerian hormone (AMH)']
  },
  { 
    code: 'URN', 
    name: '💧 Urine Tests', 
    icon: '💧', 
    color: '#2980b9',
    tests: ['Urinalysis (routine & microscopy)', 'Urine glucose, ketones', 'Urine protein (spot, 24-hour)', 'Urine microalbumin / creatinine ratio', 'Urine culture & sensitivity', 'Urine Gram stain', 'Urine pregnancy test (β-hCG)', 'Urine electrolytes (Na, K, Cl)', 'Urine osmolality', 'Urine creatinine', 'Urine urea nitrogen', 'Urine calcium (24-hour)', 'Urine uric acid', 'Urine porphobilinogen', 'Urine catecholamines / metanephrines', 'Urine cortisol (free)', 'Urine 5-HIAA', 'Urine drug screen', 'Urine Bence Jones protein']
  },
  { 
    code: 'STL', 
    name: '🧫 Stool Tests', 
    icon: '🧫', 
    color: '#27ae60',
    tests: ['Stool routine & microscopy', 'Occult blood (FOBT / FIT)', 'Stool culture & sensitivity', 'Stool for ova, cyst, parasite', 'Stool antigen tests (Giardia, Cryptosporidium, H.pylori)', 'Stool PCR for pathogens', 'Calprotectin', 'Stool reducing substances', 'Stool fat (quantitative/qualitative)', 'Stool elastase', 'Stool pH']
  },
  { 
    code: 'ECG', 
    name: '❤️ ECG / Cardiac Electrophysiology', 
    icon: '❤️', 
    color: '#e74c3c',
    tests: ['ECG (12-lead, resting)', 'Stress ECG (Treadmill test - TMT)', 'Holter monitoring (24/48-hour)', 'Event recorder', 'Signal-averaged ECG']
  },
  { 
    code: 'EEG', 
    name: '🧠 EEG / Neurophysiology', 
    icon: '🧠', 
    color: '#9b59b6',
    tests: ['Routine EEG', 'Sleep-deprived EEG', 'Video-EEG monitoring', 'Ambulatory EEG', 'Evoked potentials (VEP, BAER, SSEP)', 'Electromyography (EMG)', 'Nerve conduction studies (NCS)', 'Repetitive nerve stimulation']
  },
  { 
    code: 'PFT', 
    name: '🫁 Pulmonary Function Tests', 
    icon: '🫁', 
    color: '#1abc9c',
    tests: ['Spirometry (FEV1, FVC, FEV1/FVC)', 'Bronchodilator reversibility test', 'Lung volumes (plethysmography)', 'Diffusing capacity (DLCO)', '6-minute walk test', 'Fractional exhaled nitric oxide (FeNO)', 'Methacholine challenge test', 'Maximal respiratory pressures (MIP/MEP)', 'Nocturnal oximetry']
  },
  { 
    code: 'END', 
    name: '🔬 Endoscopy', 
    icon: '🔬', 
    color: '#2c3e50',
    tests: ['Upper GI endoscopy (EGD)', 'Colonoscopy', 'Sigmoidoscopy', 'Bronchoscopy', 'Cystoscopy', 'Hysteroscopy', 'Laparoscopy', 'Arthroscopy', 'ERCP', 'Capsule endoscopy', 'Enteroscopy', 'EUS']
  },
  { 
    code: 'NUC', 
    name: '⚛️ Nuclear Medicine / PET', 
    icon: '⚛️', 
    color: '#16a085',
    tests: ['PET-CT (whole body, cardiac, brain)', 'Bone scan (Tc-99m)', 'Thyroid scan (I-123, Tc-99m)', 'Renal scan (DTPA, MAG3, DMSA)', 'V/Q scan (lung)', 'HIDA scan (gallbladder)', 'Myocardial perfusion scan (MIBI, Thallium)', 'Parathyroid scan (Sestamibi)', 'Octreotide scan', 'MIBG scan', 'Gallium scan', 'White cell scan', 'Gastric emptying scan', 'Meckel\'s scan']
  },
  { 
    code: 'SPL', 
    name: '⭐ Special Tests', 
    icon: '⭐', 
    color: '#7f8c8d',
    tests: ['Sweat chloride test', 'Genetic testing (DNA/RNA sequencing)', 'Karyotype / FISH / Microarray', 'Single gene sequencing', 'NGS panel / Whole exome', 'NIPT', 'HLA typing', 'Paternity testing', 'CSF analysis', 'Synovial fluid analysis', 'Peritoneal fluid analysis', 'Pleural fluid analysis', 'Amniotic fluid analysis', 'Skin biopsy', 'Muscle biopsy', 'Nerve biopsy', 'Bone marrow aspirate & biopsy', 'Fine needle aspiration cytology (FNAC)', 'Pap smear', 'Semen analysis']
  }
];

const ComparisonResults = ({ selectedTests, onBack, onBookNow }) => {
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

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading comparison data...</div>;

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: '20px', cursor: 'pointer', padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px' }}>← Back to All Tests</button>
      <h2>📊 Price Comparison for Selected Tests</h2>
      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Test / Provider</th>
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
              {providers.map((p, idx) => (<td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.rating} ★</td>))}
            </tr>
            <tr style={{ backgroundColor: '#e5e7eb' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>📏 Distance</td>
              {providers.map((p, idx) => (<td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.distance}</td>))}
            </tr>
            <tr style={{ backgroundColor: '#e5e7eb' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>🏠 Home Collection</td>
              {providers.map((p, idx) => (<td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.home_collection ? '✅ Yes' : '❌ No'}</td>))}
            </tr>
            <tr style={{ backgroundColor: '#e5e7eb' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>⏱️ Report Time</td>
              {providers.map((p, idx) => (<td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.report_time_hours} hours</td>))}
            </tr>
            {selectedTests.map(test => (
              <tr key={test}>
                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{test}</td>
                {providers.map((p, idx) => (<td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>₹{p.individual_prices[test]}</td>))}
              </tr>
            ))}
            <tr style={{ backgroundColor: '#fef3c7', fontWeight: 'bold' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>💰 Total Price</td>
              {providers.map((p, idx) => (<td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>₹{p.total_price}</td>))}
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>📅 Action</td>
              {providers.map((p, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  <button onClick={() => onBookNow(p, selectedTests)} style={{ backgroundColor: idx === 0 ? '#10b981' : '#3b82f6', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Book Now</button>
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
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Pagination per category
  const [currentPage, setCurrentPage] = useState({});
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Booking Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingProvider, setBookingProvider] = useState(null);
  const [bookingTests, setBookingTests] = useState([]);
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

  useEffect(() => {
    if (useMyLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => alert('Unable to get your location')
      );
    }
  }, [useMyLocation]);

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
      alert('Please select at least 2 tests to compare prices');
    }
  };

  const handleSingleCompare = (testName) => {
    setSelectedTests([testName]);
    setShowComparison(true);
  };

  const openBookingModal = (provider, tests) => {
    setBookingProvider(provider);
    setBookingTests(tests);
    setShowBookingModal(true);
  };

  const handleDirectBook = (testName) => {
    const mockProvider = {
      provider_name: 'ABC Diagnostics',
      rating: 4.5,
      individual_prices: { [testName]: Math.floor(Math.random() * 300) + 100 },
      home_collection_available: true
    };
    openBookingModal(mockProvider, [testName]);
  };

  const handleBookingChange = (e) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const total = bookingTests.reduce((sum, test) => sum + (bookingProvider.individual_prices[test] || 0), 0);
    alert(`✅ Booking Confirmed!\n\n🧪 Test: ${bookingTests.join(', ')}\n🏥 Provider: ${bookingProvider.provider_name}\n💰 Total: ₹${total}\n👤 Name: ${bookingForm.patient_name}\n📞 Phone: ${bookingForm.patient_phone}\n📅 Date: ${bookingForm.appointment_date}\n\nWe will contact you shortly.`);
    setShowBookingModal(false);
    setBookingProvider(null);
    setBookingTests([]);
    setBookingForm({
      patient_name: '', patient_age: '', patient_gender: 'male', patient_phone: '',
      patient_email: '', appointment_date: '', home_collection_requested: false, home_address: ''
    });
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setBookingProvider(null);
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

  const toggleCategory = (categoryCode) => {
    setExpandedCategories(prev => ({ ...prev, [categoryCode]: !prev[categoryCode] }));
  };

  // Filter tests based on search
  const getFilteredTests = () => {
    if (!searchTerm.trim()) return testCategories;
    
    const lowerSearch = searchTerm.toLowerCase();
    return testCategories.map(category => ({
      ...category,
      tests: category.tests.filter(test => 
        test.toLowerCase().includes(lowerSearch) || 
        category.name.toLowerCase().includes(lowerSearch)
      )
    })).filter(category => category.tests.length > 0);
  };

  // Pagination functions
  const getPaginatedTests = (tests, categoryCode) => {
    const page = currentPage[categoryCode] || 1;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return tests.slice(start, end);
  };

  const getTotalPages = (totalTests) => {
    return Math.ceil(totalTests / itemsPerPage);
  };

  const goToPage = (categoryCode, pageNum, totalPages) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(prev => ({ ...prev, [categoryCode]: pageNum }));
    }
  };

  if (showComparison) {
    return <ComparisonResults selectedTests={selectedTests} onBack={() => setShowComparison(false)} onBookNow={openBookingModal} />;
  }

  const filteredCategories = getFilteredTests();
  const tabStyle = { padding: '10px 20px', fontSize: '16px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontWeight: 'bold', marginRight: '10px' };
  const activeTabStyle = { ...tabStyle, borderBottom: '3px solid #10b981', color: '#10b981' };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>🔬 Diagnostics Lab Tests</h1>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>Browse all tests, compare prices, and book with best providers</p>
      
      {/* Tab Navigation */}
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '20px', display: 'flex', flexWrap: 'wrap' }}>
        <button onClick={() => { setActiveTab('labtests'); setShowComparison(false); }} style={activeTab === 'labtests' ? activeTabStyle : tabStyle}>📋 All Lab Tests (16 Categories)</button>
        <button onClick={() => setActiveTab('packages')} style={activeTab === 'packages' ? activeTabStyle : tabStyle}>🏥 Health Packages</button>
        <button onClick={() => setActiveTab('custom')} style={activeTab === 'custom' ? activeTabStyle : tabStyle}>✨ Build Custom Package</button>
      </div>

      {activeTab === 'labtests' && (
        <div>
          {/* Search and Filter Bar */}
          <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '12px', marginBottom: '25px' }}>
            <input 
              type="text" 
              placeholder="🔍 Search any test or category..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={{ width: '100%', padding: '14px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '16px', marginBottom: '15px' }} 
            />
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <input type="text" placeholder="📍 City" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
              <select value={minRating} onChange={(e) => setMinRating(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}>
                <option value="">⭐ Min Rating</option>
                <option value="4">4★ & above</option>
                <option value="4.5">4.5★ & above</option>
                <option value="4.8">4.8★ & above</option>
              </select>
              <select value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value))} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}>
                <option value="5">Show 5 per page</option>
                <option value="10">Show 10 per page</option>
                <option value="20">Show 20 per page</option>
                <option value="50">Show 50 per page</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="number" placeholder="💰 Max Price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: '130px', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
              <input type="number" placeholder="📏 Max Distance (km)" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} style={{ width: '150px', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'white', padding: '0 10px', borderRadius: '6px', height: '42px' }}>
                <input type="checkbox" checked={homeCollectionOnly} onChange={(e) => setHomeCollectionOnly(e.target.checked)} /> 🏠 Home Collection Only
              </label>
              <button onClick={() => setUseMyLocation(true)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>📍 Use My Location</button>
              <button onClick={resetFilters} style={{ backgroundColor: '#6b7280', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Reset All Filters</button>
            </div>
            
            {userLocation && <p style={{ fontSize: '12px', marginTop: '10px', color: '#10b981' }}>📍 Location detected: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>}
            {searchTerm && <p style={{ fontSize: '13px', marginTop: '10px', color: '#6b7280' }}>Found {filteredCategories.reduce((sum, cat) => sum + cat.tests.length, 0)} tests matching "{searchTerm}"</p>}
          </div>

          {/* All 16 Main Categories - Each as a Collapsible Box */}
          <div>
            {filteredCategories.map(category => {
              const isExpanded = expandedCategories[category.code];
              const totalTests = category.tests.length;
              const totalPages = getTotalPages(totalTests);
              const currentPageNum = currentPage[category.code] || 1;
              const paginatedTests = getPaginatedTests(category.tests, category.code);
              
              return (
                <div key={category.code} style={{ marginBottom: '20px', border: `2px solid ${category.color}`, borderRadius: '12px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  {/* Main Category Header - Click to Expand/Collapse */}
                  <div 
                    onClick={() => toggleCategory(category.code)} 
                    style={{ 
                      backgroundColor: category.color, 
                      color: 'white', 
                      padding: '16px 20px', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>{category.icon}</span>
                      <span>{category.name}</span>
                      <span style={{ fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '20px' }}>
                        {totalTests} tests
                      </span>
                    </div>
                    <span style={{ fontSize: '24px' }}>{isExpanded ? '▼' : '▶'}</span>
                  </div>
                  
                  {/* Category Content - Shows when expanded */}
                  {isExpanded && (
                    <div style={{ padding: '15px' }}>
                      {/* Tests Table */}
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                              <th style={{ padding: '12px', textAlign: 'left', width: '50%' }}>Test Name</th>
                              <th style={{ padding: '12px', textAlign: 'center', width: '15%' }}>Select</th>
                              <th style={{ padding: '12px', textAlign: 'center', width: '15%' }}>Book</th>
                              <th style={{ padding: '12px', textAlign: 'center', width: '20%' }}>Compare</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedTests.map((test, idx) => (
                              <tr key={test} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{test}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={selectedTests.includes(test)} 
                                    onChange={() => toggleTest(test)} 
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                  />
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                  <button 
                                    onClick={() => handleDirectBook(test)} 
                                    style={{ backgroundColor: '#10b981', color: 'white', padding: '6px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                                  >
                                    Book Now
                                  </button>
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                  <button 
                                    onClick={() => handleSingleCompare(test)} 
                                    style={{ backgroundColor: '#3b82f6', color: 'white', padding: '6px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                                  >
                                    Compare Price
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div style={{ padding: '15px', backgroundColor: '#f9fafb', marginTop: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <button 
                            onClick={() => goToPage(category.code, 1, totalPages)}
                            disabled={currentPageNum === 1}
                            style={{ 
                              padding: '8px 14px', 
                              backgroundColor: currentPageNum === 1 ? '#e5e7eb' : '#3b82f6', 
                              color: currentPageNum === 1 ? '#9ca3af' : 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: currentPageNum === 1 ? 'not-allowed' : 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            ⏮ First
                          </button>
                          <button 
                            onClick={() => goToPage(category.code, currentPageNum - 1, totalPages)}
                            disabled={currentPageNum === 1}
                            style={{ 
                              padding: '8px 14px', 
                              backgroundColor: currentPageNum === 1 ? '#e5e7eb' : '#3b82f6', 
                              color: currentPageNum === 1 ? '#9ca3af' : 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: currentPageNum === 1 ? 'not-allowed' : 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            ◀ Previous
                          </button>
                          <span style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', fontWeight: 'bold' }}>
                            Page {currentPageNum} / {totalPages}
                          </span>
                          <button 
                            onClick={() => goToPage(category.code, currentPageNum + 1, totalPages)}
                            disabled={currentPageNum === totalPages}
                            style={{ 
                              padding: '8px 14px', 
                              backgroundColor: currentPageNum === totalPages ? '#e5e7eb' : '#3b82f6', 
                              color: currentPageNum === totalPages ? '#9ca3af' : 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: currentPageNum === totalPages ? 'not-allowed' : 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            Next ▶
                          </button>
                          <button 
                            onClick={() => goToPage(category.code, totalPages, totalPages)}
                            disabled={currentPageNum === totalPages}
                            style={{ 
                              padding: '8px 14px', 
                              backgroundColor: currentPageNum === totalPages ? '#e5e7eb' : '#3b82f6', 
                              color: currentPageNum === totalPages ? '#9ca3af' : 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: currentPageNum === totalPages ? 'not-allowed' : 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            Last ⏭
                          </button>
                        </div>
                      )}
                      
                      {/* Showing info */}
                      <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '10px' }}>
                        Showing {((currentPageNum - 1) * itemsPerPage) + 1} to {Math.min(currentPageNum * itemsPerPage, totalTests)} of {totalTests} tests
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Floating Compare Button */}
          {selectedTests.length >= 2 && (
            <button 
              onClick={handleCompare} 
              style={{ 
                position: 'fixed', 
                bottom: '30px', 
                right: '30px', 
                backgroundColor: '#10b981', 
                color: 'white', 
                padding: '14px 28px', 
                border: 'none', 
                borderRadius: '50px', 
                cursor: 'pointer', 
                zIndex: 1000, 
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📊 Compare Selected ({selectedTests.length} Tests)
            </button>
          )}
        </div>
      )}

      {activeTab === 'packages' && <HealthPackagesTab />}
      {activeTab === 'custom' && <DiagnosticsCustomPackage />}

      {/* Booking Modal */}
      {showBookingModal && bookingProvider && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          zIndex: 1002, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '550px', width: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '15px' }}>📋 Book Lab Test{bookingTests.length > 1 ? 's' : ''}</h2>
            <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <p><strong>🏥 Provider:</strong> {bookingProvider.provider_name}</p>
              <p><strong>🧪 Test{bookingTests.length > 1 ? 's' : ''}:</strong> {bookingTests.join(', ')}</p>
              <p><strong>💰 Total Amount:</strong> ₹{bookingTests.reduce((sum, test) => sum + (bookingProvider.individual_prices[test] || 0), 0)}</p>
              <p><strong>⭐ Rating:</strong> {bookingProvider.rating} ★</p>
              {bookingProvider.home_collection_available && <p><strong>🏠 Home Collection Available</strong></p>}
            </div>

            <form onSubmit={handleBookingSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name *</label>
                <input type="text" name="patient_name" required value={bookingForm.patient_name} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Age *</label>
                  <input type="number" name="patient_age" required value={bookingForm.patient_age} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Gender *</label>
                  <select name="patient_gender" value={bookingForm.patient_gender} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone Number *</label>
                <input type="tel" name="patient_phone" required value={bookingForm.patient_phone} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
                <input type="email" name="patient_email" value={bookingForm.patient_email} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Appointment Date *</label>
                <input type="date" name="appointment_date" required value={bookingForm.appointment_date} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
              </div>

              {bookingProvider.home_collection_available && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="checkbox" name="home_collection_requested" checked={bookingForm.home_collection_requested} onChange={(e) => setBookingForm({...bookingForm, home_collection_requested: e.target.checked})} />
                      🏠 Request Home Collection
                    </label>
                  </div>
                  {bookingForm.home_collection_requested && (
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Home Address</label>
                      <textarea name="home_address" rows="2" value={bookingForm.home_address} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
                    </div>
                  )}
                </>
              )}

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>Confirm Booking</button>
                <button type="button" onClick={closeBookingModal} style={{ flex: 1, backgroundColor: '#6b7280', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnostics;