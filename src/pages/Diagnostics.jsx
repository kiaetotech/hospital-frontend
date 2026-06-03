import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DiagnosticsCustomPackage from './DiagnosticsCustomPackage';

// ALL 12 MAIN CATEGORIES WITH FULL SUBCATEGORIES
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
      { name: 'Serology/Immunology', tests: ['HIV', 'HBsAg', 'Anti-HCV', 'Syphilis', 'Dengue', 'Malaria', 'Typhoid', 'Rheumatoid Factor', 'ANA', 'Anti-dsDNA', 'ANCA', 'Anti-CCP'] },
      { name: 'Infection Markers', tests: ['Procalcitonin', 'hs-CRP', 'Beta-D-glucan', 'Galactomannan'] },
      { name: 'Special', tests: ['Therapeutic Drug Monitoring', 'Heavy Metals', 'Toxicology Screen', 'Newborn Screen', 'G6PD', 'Sickle Cell Test'] }
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
      { name: 'Ultrasound', tests: ['USG Abdomen', 'USG Pelvis', 'USG Thyroid', 'USG Scrotum', 'Doppler Studies', 'Echocardiography', 'Obstetric USG'] },
      { name: 'Fluoroscopy', tests: ['Barium Swallow', 'Barium Meal', 'Barium Enema', 'ERCP'] }
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
      { name: 'Chemistry', tests: ['Urine Protein', 'Urine Microalbumin/Creatinine Ratio', 'Urine Electrolytes', 'Urine Osmolality', 'Urine Creatinine', 'Urine Urea', 'Urine Calcium', 'Urine Uric Acid'] },
      { name: 'Hormones', tests: ['Urine Pregnancy Test', 'Urine Cortisol', 'Urine Catecholamines', 'Urine Metanephrines', 'Urine 5-HIAA'] },
      { name: 'Special', tests: ['Urine Bence Jones Protein', 'Urine Porphobilinogen', 'Urine Drug Screen', 'Urine Heavy Metals', 'Urine PCR'] }
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
      { name: 'Parasites', tests: ['Ova/Cyst Examination', 'Giardia', 'Cryptosporidium'] },
      { name: 'Antigens', tests: ['H.pylori Stool Antigen'] },
      { name: 'Special', tests: ['Calprotectin', 'Stool Fat', 'Stool Elastase', 'Stool Reducing Substances', 'Stool pH', 'Stool PCR'] }
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
      { name: 'Other', tests: ['FeNO', 'Methacholine Challenge', '6-Minute Walk Test', 'Maximal Respiratory Pressures', 'Nocturnal Oximetry'] }
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
      { name: 'Thyroid Nuclear', tests: ['Thyroid Uptake and Scan'] },
      { name: 'Renal Nuclear', tests: ['DTPA Scan', 'MAG3 Scan', 'DMSA Scan'] },
      { name: 'Lung Nuclear', tests: ['V/Q Scan'] },
      { name: 'GI Nuclear', tests: ['HIDA Scan', 'Gastric Emptying Scan', 'Meckel Scan'] }
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
      { name: 'Other', tests: ['Bronchoscopy', 'Cystoscopy', 'Hysteroscopy', 'Laparoscopy', 'Arthroscopy', 'EUS'] }
    ]
  },
  {
    code: 'CYT',
    name: '🔬 Pathology/Biopsy',
    color: '#c0392b',
    icon: '🔬',
    subcategories: [
      { name: 'Exfoliative Cytology', tests: ['Pap Smear', 'Urine Cytology', 'Sputum Cytology', 'Pleural Fluid Cytology', 'Peritoneal Fluid Cytology'] },
      { name: 'FNAC', tests: ['Thyroid FNAC', 'Lymph Node FNAC', 'Breast FNAC', 'Lung FNAC', 'Liver FNAC', 'Prostate FNAC'] },
      { name: 'Core Biopsy', tests: ['Breast Biopsy', 'Liver Biopsy', 'Kidney Biopsy', 'Prostate Biopsy', 'Lung Biopsy', 'Bone Marrow Biopsy'] },
      { name: 'Histopathology', tests: ['Excisional Biopsy', 'Incisional Biopsy', 'Frozen Section', 'IHC', 'Electron Microscopy', 'Immunofluorescence'] }
    ]
  },
  {
    code: 'GEN',
    name: '🧬 Genetic Tests',
    color: '#2980b9',
    icon: '🧬',
    subcategories: [
      { name: 'Chromosome Analysis', tests: ['Karyotype', 'FISH', 'Chromosomal Microarray'] },
      { name: 'Sequencing', tests: ['Single Gene Sequencing', 'Gene Panel (NGS)', 'Whole Exome Sequencing', 'Whole Genome Sequencing'] },
      { name: 'Prenatal', tests: ['NIPT', 'Amniocentesis', 'CVS'] },
      { name: 'Other', tests: ['HLA Typing', 'Paternity Testing', 'Pharmacogenetics', 'Viral Load PCR', 'Bacterial PCR'] }
    ]
  },
  {
    code: 'SPL',
    name: '⭐ Special Tests',
    color: '#7f8c8d',
    icon: '⭐',
    subcategories: [
      { name: 'Other', tests: ['Sweat Chloride Test', 'Newborn Screening', 'Toxicology Screen', 'Heavy Metals', 'Therapeutic Drug Monitoring', 'Paternity Testing', 'Sleep Studies', 'Skin Prick Test', 'Patch Testing'] }
    ]
  }
];

// Health Packages Data
const healthPackages = [
  { id: 1, name: 'Full Body Checkup', provider: 'ABC Diagnostics', description: 'Complete health checkup with 65+ tests', mrp: 2500, price: 1299, homeCollection: true, reportTime: '24 hours', popular: true, tests: ['Complete Blood Count', 'Liver Function Test', 'Kidney Function Test', 'Lipid Profile', 'Blood Sugar Fasting'] },
  { id: 2, name: 'Cardiac Care Package', provider: 'ABC Diagnostics', description: 'Heart health checkup with lipid profile, ECG, and more', mrp: 1800, price: 999, homeCollection: true, reportTime: '12 hours', popular: true, tests: ['Lipid Profile', 'ECG 12-lead', 'Troponin', 'Stress ECG'] },
  { id: 3, name: 'Diabetes Profile', provider: 'HealthCare Diagnostics', description: 'Complete diabetes screening with HbA1c, fasting, post meal', mrp: 1200, price: 699, homeCollection: true, reportTime: '8 hours', popular: true, tests: ['Glucose Fasting', 'HbA1c', 'Blood Sugar Post Meal', 'Insulin'] },
  { id: 4, name: 'Women Health Package', provider: 'ABC Diagnostics', description: 'Comprehensive health checkup for women', mrp: 2200, price: 1199, homeCollection: true, reportTime: '24 hours', popular: false, tests: ['Pap Smear', 'Complete Blood Count', 'Thyroid Profile', 'Vitamin D'] },
  { id: 5, name: 'Senior Citizen Package', provider: 'ABC Diagnostics', description: 'Health checkup for elderly with age-specific tests', mrp: 2000, price: 1099, homeCollection: true, reportTime: '24 hours', popular: false, tests: ['Complete Blood Count', 'Kidney Function Test', 'Liver Function Test', 'Vitamin B12', 'Vitamin D'] },
  { id: 6, name: 'Liver Profile', provider: 'ABC Diagnostics', description: 'Complete liver function tests', mrp: 1500, price: 799, homeCollection: true, reportTime: '8 hours', popular: false, tests: ['Liver Function Test', 'PT/INR', 'AFP'] },
  { id: 7, name: 'Thyroid Package', provider: 'HealthCare Diagnostics', description: 'Complete thyroid function assessment', mrp: 899, price: 599, homeCollection: true, reportTime: '8 hours', popular: false, tests: ['TSH', 'T3', 'T4', 'Anti-TPO'] }
];

const Diagnostics = () => {
  const [activeTab, setActiveTab] = useState('labtests');
  const [selectedTests, setSelectedTests] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [expandedMainCat, setExpandedMainCat] = useState({});
  const [expandedSubCat, setExpandedSubCat] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [providerPrices, setProviderPrices] = useState({});

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  // Load provider prices from database
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
            provider: test.provider_name || 'Multiple'
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

  if (showCompare) {
    return <DiagnosticsCustomPackage preselectedTests={selectedTests} />;
  }

  const tabStyle = { padding: '10px 20px', fontSize: '16px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontWeight: 'bold', marginRight: '10px' };
  const activeTabStyle = { ...tabStyle, borderBottom: '3px solid #10b981', color: '#10b981' };

  // Filter categories based on search term
  const getFilteredCategories = () => {
    if (!searchTerm.trim()) {
      return testCategories;
    }
    
    const lowerSearch = searchTerm.toLowerCase();
    return testCategories.map(category => {
      const filteredSubs = category.subcategories.map(sub => ({
        ...sub,
        tests: sub.tests.filter(test => test.toLowerCase().includes(lowerSearch))
      })).filter(sub => sub.tests.length > 0);
      
      if (filteredSubs.length > 0) {
        return { ...category, subcategories: filteredSubs };
      }
      return null;
    }).filter(cat => cat !== null);
  };

  const filteredCategories = getFilteredCategories();
  const totalTests = testCategories.reduce((sum, cat) => sum + cat.subcategories.reduce((s, sub) => s + sub.tests.length, 0), 0);
  const filteredCount = filteredCategories.reduce((sum, cat) => sum + cat.subcategories.reduce((s, sub) => s + sub.tests.length, 0), 0);

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
          {/* Search Bar */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="🔍 Search any test (e.g., CBC, MRI, ECG, Thyroid, X-ray, Blood Test)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '16px' }}
            />
            {searchTerm && (
              <p style={{ marginTop: '5px', fontSize: '12px', color: '#6b7280' }}>
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
                          {sub.tests.map(test => (
                            <div key={test} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={selectedTests.includes(test)} onChange={() => toggleTest(test)} />
                                <span>{test}</span>
                              </label>
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                {providerPrices[test] && (
                                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹{providerPrices[test].price}</span>
                                )}
                                <button 
                                  onClick={() => handleSingleTestCompare(test)}
                                  style={{ backgroundColor: '#3b82f6', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                >
                                  Compare Prices
                                </button>
                              </div>
                            </div>
                          ))}
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
          <p>Choose from our curated health packages at discounted prices</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {healthPackages.map(pkg => (
              <div key={pkg.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                {pkg.popular && <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', marginBottom: '10px', display: 'inline-block' }}>🔥 Popular</span>}
                <h3 style={{ margin: '10px 0' }}>{pkg.name}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '10px' }}>{pkg.description}</p>
                <p style={{ fontSize: '14px', color: '#4b5563' }}>🏥 {pkg.provider}</p>
                <div style={{ margin: '10px 0' }}>
                  <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{pkg.mrp}</span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginLeft: '10px' }}>₹{pkg.price}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '12px', color: '#6b7280' }}>
                  <span>🏠 {pkg.homeCollection ? 'Home Collection Available' : 'Lab Visit Required'}</span>
                  <span>⏱️ {pkg.reportTime}</span>
                </div>
                <details style={{ marginTop: '10px', fontSize: '12px' }}>
                  <summary style={{ cursor: 'pointer', color: '#3b82f6' }}>Included Tests ({pkg.tests.length})</summary>
                  <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                    {pkg.tests.map(test => <li key={test}>{test}</li>)}
                  </ul>
                </details>
                <button onClick={() => alert(`Booking ${pkg.name} with ${pkg.provider}\nPrice: ₹${pkg.price}`)} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', marginTop: '10px' }}>
                  Book Now
                </button>
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