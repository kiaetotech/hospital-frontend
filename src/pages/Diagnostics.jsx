import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DiagnosticsCustomPackage from './DiagnosticsCustomPackage';
import HealthPackagesTab from './HealthPackagesTab';

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

const ComparisonResults = ({ selectedTests, onBack }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    patient_name: '', patient_age: '', patient_gender: 'male', patient_phone: '',
    patient_email: '', appointment_date: '', home_collection_requested: false, home_address: ''
  });

  useEffect(() => {
    const mockProviders = [
      { provider_name: 'ABC Diagnostics', rating: 4.5, distance: '2.5 km', home_collection: true, report_time_hours: 24, total_price: 0, individual_prices: {}, _id: '1' },
      { provider_name: 'HealthCare Diagnostics', rating: 4.7, distance: '3.8 km', home_collection: true, report_time_hours: 24, total_price: 0, individual_prices: {}, _id: '2' },
      { provider_name: 'Metropolis Healthcare', rating: 4.6, distance: '5.2 km', home_collection: true, report_time_hours: 48, total_price: 0, individual_prices: {}, _id: '3' },
      { provider_name: 'Dr Lal PathLabs', rating: 4.8, distance: '1.2 km', home_collection: true, report_time_hours: 24, total_price: 0, individual_prices: {}, _id: '4' },
      { provider_name: 'Apollo Diagnostic', rating: 4.9, distance: '4.0 km', home_collection: true, report_time_hours: 12, total_price: 0, individual_prices: {}, _id: '5' }
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

  const openBookingModal = (provider) => {
    setSelectedProvider(provider);
    setShowBookingModal(true);
  };

  const handleBookingChange = (e) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedProvider) return;
    const total = selectedTests.reduce((sum, test) => sum + (selectedProvider.individual_prices[test] || 0), 0);
    alert(`Booking successful!\nProvider: ${selectedProvider.provider_name}\nTests: ${selectedTests.join(', ')}\nTotal: ₹${total}`);
    setShowBookingModal(false);
    setSelectedProvider(null);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedProvider(null);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return React.createElement('div', null,
    React.createElement('button', { onClick: onBack, style: { marginBottom: '20px', cursor: 'pointer' } }, '← Back'),
    React.createElement('h2', null, 'Comparison Results'),
    React.createElement('div', { style: { overflowX: 'auto' } },
      React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' } },
        React.createElement('thead', null,
          React.createElement('tr', { style: { backgroundColor: '#f3f4f6' } },
            React.createElement('th', { style: { padding: '12px', border: '1px solid #ddd' } }, 'Test / Provider'),
            providers.map(function(p, idx) {
              return React.createElement('th', { key: idx, style: { padding: '12px', border: '1px solid #ddd', backgroundColor: idx === 0 ? '#d1fae5' : '#f3f4f6' } },
                p.provider_name,
                idx === 0 ? React.createElement('span', { style: { display: 'block', fontSize: '11px', color: '#10b981' } }, '⭐ Cheapest') : null
              );
            })
          )
        ),
        React.createElement('tbody', null,
          React.createElement('tr', { style: { backgroundColor: '#e5e7eb' } },
            React.createElement('td', { style: { padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' } }, '⭐ Rating'),
            providers.map(function(p, idx) {
              return React.createElement('td', { key: idx, style: { padding: '10px', border: '1px solid #ddd', textAlign: 'center' } }, p.rating, ' ★');
            })
          ),
          React.createElement('tr', { style: { backgroundColor: '#e5e7eb' } },
            React.createElement('td', { style: { padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' } }, '📏 Distance'),
            providers.map(function(p, idx) {
              return React.createElement('td', { key: idx, style: { padding: '10px', border: '1px solid #ddd', textAlign: 'center' } }, p.distance);
            })
          ),
          React.createElement('tr', { style: { backgroundColor: '#e5e7eb' } },
            React.createElement('td', { style: { padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' } }, '🏠 Home Collection'),
            providers.map(function(p, idx) {
              return React.createElement('td', { key: idx, style: { padding: '10px', border: '1px solid #ddd', textAlign: 'center' } }, p.home_collection ? '✅ Yes' : '❌ No');
            })
          ),
          React.createElement('tr', { style: { backgroundColor: '#e5e7eb' } },
            React.createElement('td', { style: { padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' } }, '⏱️ Report Time'),
            providers.map(function(p, idx) {
              return React.createElement('td', { key: idx, style: { padding: '10px', border: '1px solid #ddd', textAlign: 'center' } }, p.report_time_hours, ' hours');
            })
          ),
          selectedTests.map(function(test) {
            return React.createElement('tr', { key: test },
              React.createElement('td', { style: { padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' } }, test),
              providers.map(function(p, idx) {
                return React.createElement('td', { key: idx, style: { padding: '10px', border: '1px solid #ddd', textAlign: 'center' } }, '₹', p.individual_prices[test]);
              })
            );
          }),
          React.createElement('tr', { style: { backgroundColor: '#fef3c7', fontWeight: 'bold' } },
            React.createElement('td', { style: { padding: '10px', border: '1px solid #ddd' } }, '💰 Total Price'),
            providers.map(function(p, idx) {
              return React.createElement('td', { key: idx, style: { padding: '10px', border: '1px solid #ddd', textAlign: 'center' } }, '₹', p.total_price);
            })
          ),
          React.createElement('tr', null,
            React.createElement('td', { style: { padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' } }, '📅 Action'),
            providers.map(function(p, idx) {
              return React.createElement('td', { key: idx, style: { padding: '10px', border: '1px solid #ddd', textAlign: 'center' } },
                React.createElement('button', { onClick: function() { openBookingModal(p); }, style: { backgroundColor: idx === 0 ? '#10b981' : '#3b82f6', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' } }, 'Book')
              );
            })
          )
        )
      )
    ),
    showBookingModal && selectedProvider && React.createElement('div', { style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      React.createElement('div', { style: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%' } },
        React.createElement('h2', null, 'Book Lab Tests'),
        React.createElement('p', null, React.createElement('strong', null, 'Provider: '), selectedProvider.provider_name),
        React.createElement('p', null, React.createElement('strong', null, 'Tests: '), selectedTests.join(', ')),
        React.createElement('p', null, React.createElement('strong', null, 'Total: '), '₹', selectedTests.reduce(function(sum, test) { return sum + (selectedProvider.individual_prices[test] || 0); }, 0)),
        React.createElement('form', { onSubmit: handleBookingSubmit },
          React.createElement('div', null, React.createElement('label', null, 'Full Name *'), React.createElement('input', { type: 'text', name: 'patient_name', required: true, onChange: handleBookingChange, style: { width: '100%', padding: '8px', marginBottom: '10px' } })),
          React.createElement('div', null, React.createElement('label', null, 'Phone *'), React.createElement('input', { type: 'tel', name: 'patient_phone', required: true, onChange: handleBookingChange, style: { width: '100%', padding: '8px', marginBottom: '10px' } })),
          React.createElement('div', null, React.createElement('label', null, 'Date *'), React.createElement('input', { type: 'date', name: 'appointment_date', required: true, onChange: handleBookingChange, style: { width: '100%', padding: '8px', marginBottom: '10px' } })),
          React.createElement('div', { style: { marginTop: '20px', display: 'flex', gap: '10px' } },
            React.createElement('button', { type: 'submit', style: { flex: 1, backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer' } }, 'Confirm'),
            React.createElement('button', { type: 'button', onClick: closeBookingModal, style: { flex: 1, backgroundColor: '#6b7280', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer' } }, 'Cancel')
          )
        )
      )
    )
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
  const [visibleTests, setVisibleTests] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    if (useMyLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(position) { setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); },
        function() { alert('Unable to get location'); }
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
    testCategories.forEach(function(category) {
      category.tests.forEach(function(test) {
        if (test.toLowerCase().includes(lowerSearch)) {
          results.push({ testName: test, category: category.name, icon: category.icon, color: category.color });
        }
      });
    });
    setDirectSearchResults(results);
    setShowDirectResults(true);
  }, [searchTerm]);

  const toggleTest = function(testName) {
    if (selectedTests.includes(testName)) {
      setSelectedTests(selectedTests.filter(function(t) { return t !== testName; }));
    } else {
      setSelectedTests([...selectedTests, testName]);
    }
  };

  const handleCompare = function() {
    if (selectedTests.length >= 2) {
      setShowComparison(true);
    } else {
      alert('Select at least 2 tests');
    }
  };

  const handleSingleCompare = function(testName) {
    setSelectedTests([testName]);
    setShowComparison(true);
  };

  const handleSingleBook = function(testName) {
    setSelectedTests([testName]);
    setShowComparison(true);
  };

  const resetFilters = function() {
    setCityFilter('');
    setMinRating('');
    setMaxPrice('');
    setHomeCollectionOnly(false);
    setMaxDistance('');
    setUseMyLocation(false);
    setSearchTerm('');
  };

  const showMoreTests = function(categoryCode) {
    setVisibleTests(function(prev) {
      const currentCount = prev[categoryCode] || 10;
      var newState = {};
      newState[categoryCode] = currentCount + 10;
      return Object.assign({}, prev, newState);
    });
  };

  if (showComparison) {
    return React.createElement(ComparisonResults, { selectedTests: selectedTests, onBack: function() { setShowComparison(false); } });
  }

  const tabStyle = { padding: '10px 20px', fontSize: '16px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontWeight: 'bold', marginRight: '10px' };
  const activeTabStyle = Object.assign({}, tabStyle, { borderBottom: '3px solid #10b981', color: '#10b981' });

  return React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '20px' } },
    React.createElement('h1', null, '🔬 Diagnostics'),
    React.createElement('div', { style: { borderBottom: '1px solid #e5e7eb', marginBottom: '20px' } },
      React.createElement('button', { onClick: function() { setActiveTab('labtests'); setShowComparison(false); }, style: activeTab === 'labtests' ? activeTabStyle : tabStyle }, '📋 Lab Tests'),
      React.createElement('button', { onClick: function() { setActiveTab('packages'); }, style: activeTab === 'packages' ? activeTabStyle : tabStyle }, '🏥 Health Packages'),
      React.createElement('button', { onClick: function() { setActiveTab('custom'); }, style: activeTab === 'custom' ? activeTabStyle : tabStyle }, '✨ Build Custom Package')
    ),
    activeTab === 'labtests' && React.createElement('div', null,
      React.createElement('div', { style: { backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' } },
        React.createElement('input', { type: 'text', placeholder: '🔍 Search any test...', value: searchTerm, onChange: function(e) { setSearchTerm(e.target.value); }, style: { width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px', marginBottom: '10px' } }),
        React.createElement('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' } },
          React.createElement('input', { type: 'text', placeholder: '📍 City', value: cityFilter, onChange: function(e) { setCityFilter(e.target.value); }, style: { flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' } }),
          React.createElement('select', { value: minRating, onChange: function(e) { setMinRating(e.target.value); }, style: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px' } },
            React.createElement('option', { value: '' }, '⭐ Rating (Any)'),
            React.createElement('option', { value: '4' }, '4★ & above'),
            React.createElement('option', { value: '4.5' }, '4.5★ & above'),
            React.createElement('option', { value: '4.8' }, '4.8★ & above')
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' } },
          React.createElement('input', { type: 'number', placeholder: '💰 Max Price', value: maxPrice, onChange: function(e) { setMaxPrice(e.target.value); }, style: { width: '130px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' } }),
          React.createElement('input', { type: 'number', placeholder: '📏 Max Distance', value: maxDistance, onChange: function(e) { setMaxDistance(e.target.value); }, style: { width: '140px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' } }),
          React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'white', padding: '0 10px', borderRadius: '4px', height: '42px' } },
            React.createElement('input', { type: 'checkbox', checked: homeCollectionOnly, onChange: function(e) { setHomeCollectionOnly(e.target.checked); } }),
            ' 🏠 Home Collection Only'
          ),
          React.createElement('button', { onClick: function() { setUseMyLocation(true); }, style: { backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' } }, '📍 Use My Location'),
          React.createElement('button', { onClick: resetFilters, style: { backgroundColor: '#6b7280', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' } }, 'Reset Filters')
        ),
        userLocation && React.createElement('p', { style: { fontSize: '12px', marginTop: '10px', color: '#10b981' } }, '📍 Location detected'),
        searchTerm && React.createElement('p', { style: { fontSize: '12px', marginTop: '10px' } }, 'Found ', directSearchResults.length, ' tests matching "', searchTerm, '"')
      ),
      showDirectResults && searchTerm && React.createElement('div', { style: { marginBottom: '20px' } },
        React.createElement('h3', null, '🔍 Search Results (', directSearchResults.length, ')'),
        directSearchResults.map(function(result, idx) {
          return React.createElement('div', { key: idx, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'white', border: '1px solid ' + result.color, borderRadius: '8px', marginBottom: '8px' } },
            React.createElement('div', null, React.createElement('strong', null, result.testName), ' ', React.createElement('span', { style: { fontSize: '12px', color: '#6b7280' } }, result.icon, ' ', result.category)),
            React.createElement('div', { style: { display: 'flex', gap: '10px' } },
              React.createElement('label', null, React.createElement('input', { type: 'checkbox', checked: selectedTests.includes(result.testName), onChange: function() { toggleTest(result.testName); } }), ' Select'),
              React.createElement('button', { onClick: function() { handleSingleCompare(result.testName); }, style: { backgroundColor: '#3b82f6', color: 'white', padding: '5px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' } }, 'Compare'),
              React.createElement('button', { onClick: function() { handleSingleBook(result.testName); }, style: { backgroundColor: '#10b981', color: 'white', padding: '5px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' } }, 'Book')
            )
          );
        })
      ),
      !searchTerm && React.createElement('div', null,
        testCategories.map(function(category) {
          var visibleCount = visibleTests[category.code] || 10;
          var hasMore = visibleCount < category.tests.length;
          var displayedTests = category.tests.slice(0, visibleCount);
          return React.createElement('div', { key: category.code, style: { marginBottom: '20px', border: '1px solid ' + category.color, borderRadius: '8px', overflow: 'hidden' } },
            React.createElement('div', { onClick: function() { 
              setExpandedCategories(function(prev) {
                var newState = {};
                newState[category.code] = !prev[category.code];
                return Object.assign({}, prev, newState);
              });
            }, style: { backgroundColor: category.color, color: 'white', padding: '12px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' } },
              React.createElement('span', null, category.icon, ' ', category.name, ' (', category.tests.length, ' tests)'),
              React.createElement('span', null, expandedCategories[category.code] ? '▼' : '▶')
            ),
            expandedCategories[category.code] && React.createElement('div', { style: { backgroundColor: '#f9fafb', padding: '10px' } },
              React.createElement('div', { style: { padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' } },
                displayedTests.map(function(test) {
                  return React.createElement('div', { key: test, style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' } },
                    React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '5px', flex: 1 } },
                      React.createElement('input', { type: 'checkbox', checked: selectedTests.includes(test), onChange: function() { toggleTest(test); } }),
                      ' ', test
                    ),
                    React.createElement('button', { onClick: function() { handleSingleCompare(test); }, style: { backgroundColor: '#3b82f6', color: 'white', padding: '4px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' } }, 'Compare'),
                    React.createElement('button', { onClick: function() { handleSingleBook(test); }, style: { backgroundColor: '#10b981', color: 'white', padding: '4px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' } }, 'Book')
                  );
                })
              ),
              hasMore && React.createElement('div', { style: { padding: '8px', textAlign: 'center', backgroundColor: '#f3f4f6' } },
                React.createElement('button', { onClick: function() { showMoreTests(category.code); }, style: { backgroundColor: '#6b7280', color: 'white', padding: '5px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' } }, 'Show More... (', category.tests.length - visibleCount, ' more)')
              )
            )
          );
        })
      ),
      selectedTests.length >= 2 && React.createElement('button', { onClick: handleCompare, style: { position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#10b981', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '50px', cursor: 'pointer', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } }, 'Compare Selected (', selectedTests.length, ' Tests)')
    ),
    activeTab === 'packages' && React.createElement(HealthPackagesTab, null),
    activeTab === 'custom' && React.createElement(DiagnosticsCustomPackage, null)
  );
};

export default Diagnostics;