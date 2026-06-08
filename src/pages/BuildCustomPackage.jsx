import React, { useState, useEffect } from 'react';

// All 16 Main Categories with their Tests (exactly from your working code)
const testCategories = [
  { 
    code: 'MRI', 
    name: '🧠 MRI', 
    icon: '🧠', 
    color: '#8e44ad',
    tests: ['MRI Brain', 'MRI Spine', 'MRI Joints', 'MRI Abdomen / MRCP', 'MRI Pelvis', 'MRI Cardiac', 'MRI Angiography (MRA)', 'MRI Breast', 'MRI Orbit / IAC', 'MRI Soft tissue', 'MR Venography (MRV)']
  },
  { 
    code: 'CT', 
    name: '📷 CT', 
    icon: '📷', 
    color: '#3498db',
    tests: ['CT Head', 'CT Chest', 'CT Abdomen + Pelvis', 'CT Angiography (CTA)', 'CT Spine', 'CT Facial bones / Sinus', 'CT Temporal bone', 'CT Urogram', 'CT Virtual colonoscopy', 'CT Perfusion', 'CT Guided biopsy']
  },
  { 
    code: 'XR', 
    name: '🦴 X-ray', 
    icon: '🦴', 
    color: '#e67e22',
    tests: ['Chest X-ray', 'X-ray Spine', 'X-ray Limbs', 'X-ray Legs', 'X-ray Pelvis / Hip', 'X-ray Shoulder', 'X-ray Skull', 'X-ray Sinus', 'X-ray Abdomen (KUB)', 'X-ray Joints', 'X-ray Dental (OPG)', 'X-ray Mammogram', 'X-ray Barium studies', 'X-ray DEXA']
  },
  { 
    code: 'USG', 
    name: '🔊 Ultrasound', 
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
    name: '🦠 Serology', 
    icon: '🦠', 
    color: '#9b59b6',
    tests: ['HIV (1+2)', 'HBsAg (Hepatitis B)', 'Anti-HBs, Anti-HBc', 'Hepatitis C antibody', 'Hepatitis A IgM', 'Hepatitis E IgM', 'Syphilis (VDRL, TPHA)', 'Dengue (NS1 antigen, IgM, IgG)', 'Chikungunya IgM/IgG', 'Malaria (rapid antigen, smear)', 'Typhoid (Widal, Typhidot)', 'Rheumatoid factor (RF)', 'Anti-CCP (ACPA)', 'ANA + ENA profile', 'Anti-dsDNA', 'ANCA (c-ANCA, p-ANCA)', 'Anti-phospholipid antibodies', 'Complement C3, C4', 'Serum protein electrophoresis (SPEP)', 'Quantitative immunoglobulins', 'Total IgE', 'RAST test', 'hs-CRP', 'Procalcitonin', 'Tumor markers (AFP, CEA, CA-125, CA 19-9, CA 15-3, PSA)']
  },
  { 
    code: 'HOR', 
    name: '⚖️ Hormones', 
    icon: '⚖️', 
    color: '#16a085',
    tests: ['Thyroid profile (TSH, Free T3, Free T4)', 'Cortisol (morning/evening)', 'ACTH', 'Prolactin', 'LH, FSH', 'Estradiol (E2)', 'Progesterone', 'Testosterone (total/free)', 'DHEA-S', 'Aldosterone / Renin ratio', 'Metanephrines', 'Parathyroid hormone (PTH)', 'Insulin, C-peptide', 'Growth hormone (GH) + IGF-1', 'Anti-Mullerian hormone (AMH)']
  },
  { 
    code: 'URN', 
    name: '💧 Urine', 
    icon: '💧', 
    color: '#2980b9',
    tests: ['Urinalysis (routine & microscopy)', 'Urine glucose, ketones', 'Urine protein (spot, 24-hour)', 'Urine microalbumin / creatinine ratio', 'Urine culture & sensitivity', 'Urine Gram stain', 'Urine pregnancy test (β-hCG)', 'Urine electrolytes (Na, K, Cl)', 'Urine osmolality', 'Urine creatinine', 'Urine urea nitrogen', 'Urine calcium (24-hour)', 'Urine uric acid', 'Urine porphobilinogen', 'Urine catecholamines / metanephrines', 'Urine cortisol (free)', 'Urine 5-HIAA', 'Urine drug screen', 'Urine Bence Jones protein']
  },
  { 
    code: 'STL', 
    name: '🧫 Stool', 
    icon: '🧫', 
    color: '#27ae60',
    tests: ['Stool routine & microscopy', 'Occult blood (FOBT / FIT)', 'Stool culture & sensitivity', 'Stool for ova, cyst, parasite', 'Stool antigen tests (Giardia, Cryptosporidium, H.pylori)', 'Stool PCR for pathogens', 'Calprotectin', 'Stool reducing substances', 'Stool fat (quantitative/qualitative)', 'Stool elastase', 'Stool pH']
  },
  { 
    code: 'ECG', 
    name: '❤️ ECG', 
    icon: '❤️', 
    color: '#e74c3c',
    tests: ['ECG (12-lead, resting)', 'Stress ECG (Treadmill test - TMT)', 'Holter monitoring (24/48-hour)', 'Event recorder', 'Signal-averaged ECG']
  },
  { 
    code: 'EEG', 
    name: '🧠 EEG', 
    icon: '🧠', 
    color: '#9b59b6',
    tests: ['Routine EEG', 'Sleep-deprived EEG', 'Video-EEG monitoring', 'Ambulatory EEG', 'Evoked potentials (VEP, BAER, SSEP)', 'Electromyography (EMG)', 'Nerve conduction studies (NCS)', 'Repetitive nerve stimulation']
  },
  { 
    code: 'PFT', 
    name: '🫁 PFT', 
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
    name: '⚛️ Nuclear', 
    icon: '⚛️', 
    color: '#16a085',
    tests: ['PET-CT (whole body, cardiac, brain)', 'Bone scan (Tc-99m)', 'Thyroid scan (I-123, Tc-99m)', 'Renal scan (DTPA, MAG3, DMSA)', 'V/Q scan (lung)', 'HIDA scan (gallbladder)', 'Myocardial perfusion scan (MIBI, Thallium)', 'Parathyroid scan (Sestamibi)', 'Octreotide scan', 'MIBG scan', 'Gallium scan', 'White cell scan', 'Gastric emptying scan', "Meckel's scan"]
  },
  { 
    code: 'SPL', 
    name: '⭐ Special', 
    icon: '⭐', 
    color: '#7f8c8d',
    tests: ['Sweat chloride test', 'Genetic testing (DNA/RNA sequencing)', 'Karyotype / FISH / Microarray', 'Single gene sequencing', 'NGS panel / Whole exome', 'NIPT', 'HLA typing', 'Paternity testing', 'CSF analysis', 'Synovial fluid analysis', 'Peritoneal fluid analysis', 'Pleural fluid analysis', 'Amniotic fluid analysis', 'Skin biopsy', 'Muscle biopsy', 'Nerve biopsy', 'Bone marrow aspirate & biopsy', 'Fine needle aspiration cytology (FNAC)', 'Pap smear', 'Semen analysis']
  }
];

// Comparison Component (exactly from your working code)
const ComparisonResults = ({ selectedTests, onBack, onBookNow }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockProviders = [
      { 
        provider_name: 'ABC Diagnostics', 
        rating: 4.5, 
        distance: '2.5 km', 
        home_collection: true,
        home_collection_available: true,
        report_time_hours: 24, 
        total_price: 0, 
        individual_prices: {} 
      },
      { 
        provider_name: 'HealthCare Diagnostics', 
        rating: 4.7, 
        distance: '3.8 km', 
        home_collection: true,
        home_collection_available: true,
        report_time_hours: 24, 
        total_price: 0, 
        individual_prices: {} 
      },
      { 
        provider_name: 'Metropolis Healthcare', 
        rating: 4.6, 
        distance: '5.2 km', 
        home_collection: true,
        home_collection_available: true,
        report_time_hours: 48, 
        total_price: 0, 
        individual_prices: {} 
      },
      { 
        provider_name: 'Dr Lal PathLabs', 
        rating: 4.8, 
        distance: '1.2 km', 
        home_collection: true,
        home_collection_available: true,
        report_time_hours: 24, 
        total_price: 0, 
        individual_prices: {} 
      },
      { 
        provider_name: 'Apollo Diagnostic', 
        rating: 4.9, 
        distance: '4.0 km', 
        home_collection: true,
        home_collection_available: true,
        report_time_hours: 12, 
        total_price: 0, 
        individual_prices: {} 
      }
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
      <button onClick={onBack} style={{ marginBottom: '20px', cursor: 'pointer', padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px' }}>← Back to Build Package</button>
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
                  <button 
                    onClick={() => onBookNow(p, selectedTests)} 
                    style={{ 
                      backgroundColor: idx === 0 ? '#10b981' : '#3b82f6', 
                      color: 'white', 
                      padding: '8px 16px', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Book Now
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Build Custom Package Component
const BuildCustomPackage = () => {
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
  const [visibleTestCount, setVisibleTestCount] = useState({});
  const [testsPerRow, setTestsPerRow] = useState(4);
  const [packageName, setPackageName] = useState('');
  
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
    alert(`✅ Custom Package Booking Confirmed!\n\n📦 Package: ${packageName || 'Custom Package'}\n🧪 Tests: ${bookingTests.join(', ')}\n🏥 Provider: ${bookingProvider.provider_name}\n💰 Total: ₹${total}\n👤 Name: ${bookingForm.patient_name}\n📞 Phone: ${bookingForm.patient_phone}\n📅 Date: ${bookingForm.appointment_date}\n\nWe will contact you shortly.`);
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

  const getFilteredCategories = () => {
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

  const showMoreTests = (categoryCode, currentCount, totalTests) => {
    const increment = testsPerRow * 2;
    const newCount = Math.min(currentCount + increment, totalTests);
    setVisibleTestCount(prev => ({ ...prev, [categoryCode]: newCount }));
  };

  const showAllTests = (categoryCode, totalTests) => {
    setVisibleTestCount(prev => ({ ...prev, [categoryCode]: totalTests }));
  };

  const showLessTests = (categoryCode, initialCount) => {
    setVisibleTestCount(prev => ({ ...prev, [categoryCode]: initialCount }));
  };

  if (showComparison) {
    return <ComparisonResults selectedTests={selectedTests} onBack={() => setShowComparison(false)} onBookNow={openBookingModal} />;
  }

  const filteredCategories = getFilteredCategories();
  const DEFAULT_VISIBLE_TESTS = 8;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '5px' }}>✨ Build Your Custom Package</h1>
          <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>Select multiple tests from 16+ categories to create your own health package</p>
        </div>
        {selectedTests.length > 0 && (
          <div style={{ backgroundColor: '#f0fdf4', padding: '8px 16px', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontWeight: 'bold', color: '#10b981' }}>{selectedTests.length} test(s) selected</span>
            <button 
              onClick={handleCompare}
              style={{ marginLeft: '12px', backgroundColor: '#10b981', color: 'white', padding: '4px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              Compare Now
            </button>
          </div>
        )}
      </div>

      {/* Package Name Input */}
      <div style={{ backgroundColor: '#fef3c7', padding: '12px 15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #fde68a' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px', fontSize: '14px' }}>📦 Package Name:</label>
        <input 
          type="text" 
          placeholder="e.g., My Annual Health Checkup" 
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', width: '250px', fontSize: '14px' }}
        />
        {packageName && <span style={{ marginLeft: '10px', fontSize: '12px', color: '#d97706' }}>✓ Package will be saved as "{packageName}"</span>}
      </div>
      
      {/* Search and Filters - Exactly from your working code */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="🔍 Search any test or category..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', marginBottom: '12px' }} 
        />
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <input type="text" placeholder="📍 City" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
          <select value={minRating} onChange={(e) => setMinRating(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }}>
            <option value="">⭐ Rating</option>
            <option value="4">4★+</option>
            <option value="4.5">4.5★+</option>
            <option value="4.8">4.8★+</option>
          </select>
          <select value={testsPerRow} onChange={(e) => setTestsPerRow(parseInt(e.target.value))} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }}>
            <option value="2">2 tests/row</option>
            <option value="3">3 tests/row</option>
            <option value="4">4 tests/row</option>
            <option value="5">5 tests/row</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="number" placeholder="💰 Max Price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: '110px', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
          <input type="number" placeholder="📏 Max Distance (km)" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} style={{ width: '120px', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'white', padding: '0 8px', borderRadius: '6px', height: '34px', fontSize: '13px' }}>
            <input type="checkbox" checked={homeCollectionOnly} onChange={(e) => setHomeCollectionOnly(e.target.checked)} /> 🏠 Home Collection
          </label>
          <button onClick={() => setUseMyLocation(true)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>📍 My Location</button>
          <button onClick={resetFilters} style={{ backgroundColor: '#6b7280', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Reset</button>
        </div>
        
        {userLocation && <p style={{ fontSize: '11px', marginTop: '8px', color: '#10b981' }}>📍 Location detected - showing nearby labs</p>}
        {searchTerm && <p style={{ fontSize: '12px', marginTop: '8px', color: '#6b7280' }}>Found {filteredCategories.reduce((sum, cat) => sum + cat.tests.length, 0)} tests in {filteredCategories.length} categories</p>}
      </div>

      {/* Selected Tests Summary Bar */}
      {selectedTests.length > 0 && (
        <div style={{ backgroundColor: '#e0f2fe', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 'bold' }}>📋 Selected for Package ({selectedTests.length}):</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
            {selectedTests.map(test => (
              <span key={test} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {test}
                <button onClick={() => toggleTest(test)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px', padding: '0 2px' }}>×</button>
              </span>
            ))}
          </div>
          <button 
            onClick={handleCompare}
            style={{ backgroundColor: '#10b981', color: 'white', padding: '6px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
          >
            Compare Prices ({selectedTests.length})
          </button>
        </div>
      )}

      {/* 16 Categories with Tests - Exactly from your working code */}
      <div>
        {filteredCategories.map(category => {
          const totalTests = category.tests.length;
          const visibleCount = visibleTestCount[category.code] || Math.min(DEFAULT_VISIBLE_TESTS, totalTests);
          const visibleTests = category.tests.slice(0, visibleCount);
          const remainingTests = totalTests - visibleCount;
          const hasMore = remainingTests > 0;
          
          const rows = [];
          for (let i = 0; i < visibleTests.length; i += testsPerRow) {
            rows.push(visibleTests.slice(i, i + testsPerRow));
          }
          
          return (
            <div key={category.code} style={{ marginBottom: '20px', border: `1px solid ${category.color}`, borderRadius: '10px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ 
                backgroundColor: category.color, 
                color: 'white', 
                padding: '10px 15px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '15px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{category.icon}</span>
                  <span>{category.name}</span>
                  <span style={{ fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '12px' }}>
                    {totalTests} tests
                  </span>
                </div>
                {visibleCount < totalTests && (
                  <div style={{ fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                    Showing {visibleCount}/{totalTests}
                  </div>
                )}
              </div>
              
              <div style={{ padding: '12px' }}>
                {rows.map((row, rowIndex) => (
                  <div key={rowIndex} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `repeat(${testsPerRow}, 1fr)`, 
                    gap: '10px',
                    marginBottom: rowIndex === rows.length - 1 ? '0' : '10px'
                  }}>
                    {row.map(test => (
                      <div key={test} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        backgroundColor: selectedTests.includes(test) ? '#f0fdf4' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}>
                        <span style={{ 
                          fontWeight: '500', 
                          fontSize: '13px',
                          color: '#1f2937',
                          flex: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }} title={test}>
                          {test}
                        </span>
                        
                        <input 
                          type="checkbox" 
                          checked={selectedTests.includes(test)} 
                          onChange={() => toggleTest(test)} 
                          style={{ width: '16px', height: '16px', cursor: 'pointer', margin: '0' }}
                          title="Select for package"
                        />
                        
                        <button 
                          onClick={() => handleDirectBook(test)} 
                          style={{ 
                            backgroundColor: '#10b981', 
                            color: 'white', 
                            padding: '4px 10px', 
                            border: 'none', 
                            borderRadius: '5px', 
                            cursor: 'pointer', 
                            fontSize: '11px',
                            fontWeight: '500',
                            whiteSpace: 'nowrap'
                          }}
                          title="Book this test"
                        >
                          📅 Book
                        </button>
                        
                        <button 
                          onClick={() => handleSingleCompare(test)} 
                          style={{ 
                            backgroundColor: '#3b82f6', 
                            color: 'white', 
                            padding: '4px 10px', 
                            border: 'none', 
                            borderRadius: '5px', 
                            cursor: 'pointer', 
                            fontSize: '11px',
                            fontWeight: '500',
                            whiteSpace: 'nowrap'
                          }}
                          title="Compare price across labs"
                        >
                          📊 Compare
                        </button>
                      </div>
                    ))}
                    {row.length < testsPerRow && Array(testsPerRow - row.length).fill(null).map((_, idx) => (
                      <div key={`empty-${idx}`} style={{ visibility: 'hidden' }} />
                    ))}
                  </div>
                ))}
                
                {hasMore && (
                  <div style={{ 
                    marginTop: '15px', 
                    padding: '12px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '8px', 
                    textAlign: 'center',
                    border: '1px dashed #d1d5db'
                  }}>
                    <div style={{ marginBottom: '8px', fontSize: '13px', color: '#6b7280' }}>
                      {remainingTests} more test{remainingTests > 1 ? 's' : ''} available in this category
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => showMoreTests(category.code, visibleCount, totalTests)}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '6px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        + Show More ({Math.min(testsPerRow * 2, remainingTests)} more)
                      </button>
                      <button
                        onClick={() => showAllTests(category.code, totalTests)}
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          padding: '6px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        Show All {totalTests} Tests
                      </button>
                    </div>
                  </div>
                )}
                
                {visibleCount === totalTests && totalTests > DEFAULT_VISIBLE_TESTS && (
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => showLessTests(category.code, DEFAULT_VISIBLE_TESTS)}
                      style={{
                        backgroundColor: '#6b7280',
                        color: 'white',
                        padding: '4px 12px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      Show Less
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fixed Compare Button - Exactly from your working code */}
      {selectedTests.length >= 2 && (
        <button 
          onClick={handleCompare} 
          style={{ 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px', 
            backgroundColor: '#10b981', 
            color: 'white', 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '40px', 
            cursor: 'pointer', 
            zIndex: 1000, 
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📊 Compare Package ({selectedTests.length} tests)
        </button>
      )}

      {/* Booking Modal - Exactly from your working code */}
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
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', maxWidth: '500px', width: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>📋 Book Custom Package</h2>
            <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
              <p><strong>📦 Package:</strong> {packageName || 'Custom Package'}</p>
              <p><strong>🏥 Provider:</strong> {bookingProvider.provider_name}</p>
              <p><strong>🧪 Tests:</strong> {bookingTests.join(', ')}</p>
              <p><strong>💰 Total:</strong> ₹{bookingTests.reduce((sum, test) => sum + (bookingProvider.individual_prices[test] || 0), 0)}</p>
              <p><strong>⭐ Rating:</strong> {bookingProvider.rating} ★</p>
              {bookingProvider.home_collection_available && <p><strong>🏠 Home Collection Available</strong></p>}
            </div>

            <form onSubmit={handleBookingSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>Full Name *</label>
                <input type="text" name="patient_name" required value={bookingForm.patient_name} onChange={handleBookingChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>Age *</label>
                  <input type="number" name="patient_age" required value={bookingForm.patient_age} onChange={handleBookingChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>Gender *</label>
                  <select name="patient_gender" value={bookingForm.patient_gender} onChange={handleBookingChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>Phone *</label>
                <input type="tel" name="patient_phone" required value={bookingForm.patient_phone} onChange={handleBookingChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>Email</label>
                <input type="email" name="patient_email" value={bookingForm.patient_email} onChange={handleBookingChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>Date *</label>
                <input type="date" name="appointment_date" required value={bookingForm.appointment_date} onChange={handleBookingChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
              </div>

              {bookingProvider.home_collection_available && (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <input type="checkbox" name="home_collection_requested" checked={bookingForm.home_collection_requested} onChange={(e) => setBookingForm({...bookingForm, home_collection_requested: e.target.checked})} />
                      🏠 Request Home Collection
                    </label>
                  </div>
                  {bookingForm.home_collection_requested && (
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>Home Address</label>
                      <textarea name="home_address" rows="2" value={bookingForm.home_address} onChange={handleBookingChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                    </div>
                  )}
                </>
              )}

              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>Confirm Booking</button>
                <button type="button" onClick={closeBookingModal} style={{ flex: 1, backgroundColor: '#6b7280', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildCustomPackage;