import React, { useState } from 'react';
import DiagnosticsCustomPackage from './DiagnosticsCustomPackage';

// ALL 12 MAIN CATEGORIES WITH SUBCATEGORIES
const testCategories = [
  {
    code: 'BLD',
    name: '🩸 Blood Tests',
    color: '#e74c3c',
    icon: '🩸',
    subcategories: [
      { name: 'Hematology', tests: ['Complete Blood Count', 'Hemoglobin', 'White Blood Cell Count', 'Platelet Count', 'ESR', 'CRP'] },
      { name: 'Coagulation', tests: ['PT/INR', 'aPTT', 'D-Dimer', 'Fibrinogen'] },
      { name: 'Biochemistry', tests: ['Glucose Fasting', 'HbA1c', 'Liver Function Test', 'Kidney Function Test', 'Electrolytes', 'Lipid Profile'] },
      { name: 'Iron Studies', tests: ['Serum Iron', 'TIBC', 'Ferritin'] },
      { name: 'Vitamins', tests: ['Vitamin B12', 'Vitamin D', 'Folate'] },
      { name: 'Hormones', tests: ['TSH', 'T3', 'T4', 'Cortisol', 'Testosterone', 'Estradiol', 'Progesterone'] },
      { name: 'Tumor Markers', tests: ['AFP', 'CEA', 'CA-125', 'PSA'] },
      { name: 'Serology', tests: ['HIV', 'HBsAg', 'Dengue', 'Malaria', 'Rheumatoid Factor', 'ANA'] }
    ]
  },
  {
    code: 'IMG',
    name: '📷 Medical Imaging',
    color: '#3498db',
    icon: '📷',
    subcategories: [
      { name: 'X-ray', tests: ['Chest X-ray', 'Limb X-ray', 'Spine X-ray', 'Mammogram', 'DEXA'] },
      { name: 'CT Scan', tests: ['CT Head', 'CT Chest', 'CT Abdomen', 'CT Spine', 'CT Angiography'] },
      { name: 'MRI', tests: ['MRI Brain', 'MRI Spine', 'MRI Joints', 'MRI Abdomen', 'MRI Breast'] },
      { name: 'Ultrasound', tests: ['USG Abdomen', 'USG Pelvis', 'USG Thyroid', 'Doppler Studies', 'Echocardiography'] },
      { name: 'Fluoroscopy', tests: ['Barium Swallow', 'Barium Enema', 'ERCP'] }
    ]
  },
  {
    code: 'CRD',
    name: '❤️ Cardiac Diagnostics',
    color: '#e67e22',
    icon: '❤️',
    subcategories: [
      { name: 'ECG', tests: ['ECG 12-lead', 'Stress ECG (TMT)', 'Holter Monitor', 'Event Recorder'] },
      { name: 'Echocardiography', tests: ['2D Echo', 'Stress Echo', 'Transesophageal Echo'] },
      { name: 'Vascular', tests: ['Ankle-Brachial Index', 'Carotid Doppler'] }
    ]
  },
  {
    code: 'URN',
    name: '💧 Urine Tests',
    color: '#f39c12',
    icon: '💧',
    subcategories: [
      { name: 'Routine', tests: ['Urinalysis', 'Urine Glucose', 'Urine Ketones'] },
      { name: 'Culture', tests: ['Urine Culture & Sensitivity'] },
      { name: 'Chemistry', tests: ['Urine Protein', 'Urine Microalbumin', 'Urine Electrolytes'] },
      { name: 'Hormones', tests: ['Urine Pregnancy Test', 'Urine Cortisol'] }
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
      { name: 'Parasites', tests: ['Ova/Cyst Examination'] }
    ]
  },
  {
    code: 'NEU',
    name: '🧠 Neurodiagnostics',
    color: '#9b59b6',
    icon: '🧠',
    subcategories: [
      { name: 'EEG', tests: ['Routine EEG', 'Sleep Deprived EEG', 'Video EEG'] },
      { name: 'Nerve Studies', tests: ['EMG', 'Nerve Conduction Studies', 'Repetitive Nerve Stimulation'] },
      { name: 'Evoked Potentials', tests: ['VEP', 'BAER', 'SSEP'] }
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
      { name: 'Bone Scan', tests: ['Whole Body Bone Scan'] },
      { name: 'Thyroid', tests: ['Thyroid Uptake & Scan'] }
    ]
  },
  {
    code: 'END',
    name: '🔬 Endoscopy',
    color: '#2c3e50',
    icon: '🔬',
    subcategories: [
      { name: 'Upper GI', tests: ['EGD', 'ERCP', 'Capsule Endoscopy'] },
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
      { name: 'Cytology', tests: ['Pap Smear', 'Urine Cytology', 'Sputum Cytology'] },
      { name: 'FNAC', tests: ['Thyroid FNAC', 'Lymph Node FNAC', 'Breast FNAC'] },
      { name: 'Biopsy', tests: ['Core Needle Biopsy', 'Excisional Biopsy', 'Histopathology'] }
    ]
  },
  {
    code: 'GEN',
    name: '🧬 Genetic Tests',
    color: '#2980b9',
    icon: '🧬',
    subcategories: [
      { name: 'Chromosome', tests: ['Karyotype', 'FISH', 'Chromosomal Microarray'] },
      { name: 'Sequencing', tests: ['Single Gene Sequencing', 'NGS Panel', 'Whole Exome Sequencing'] },
      { name: 'Other', tests: ['NIPT', 'HLA Typing', 'Paternity Testing'] }
    ]
  },
  {
    code: 'SPL',
    name: '⭐ Special Tests',
    color: '#7f8c8d',
    icon: '⭐',
    subcategories: [
      { name: 'Other', tests: ['Sweat Chloride Test', 'Newborn Screening', 'Toxicology Screen', 'Heavy Metals', 'Therapeutic Drug Monitoring'] }
    ]
  }
];

const Diagnostics = () => {
  const [activeTab, setActiveTab] = useState('labtests');
  const [selectedTests, setSelectedTests] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [expandedMainCat, setExpandedMainCat] = useState({});
  const [expandedSubCat, setExpandedSubCat] = useState({});

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

  const handleCompare = () => {
    if (selectedTests.length >= 2) {
      setShowCompare(true);
    } else {
      alert('Select at least 2 tests');
    }
  };

  if (showCompare) {
    return <DiagnosticsCustomPackage preselectedTests={selectedTests} />;
  }

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
          <p>Select 2 or more tests to compare. Total: {testCategories.reduce((sum, cat) => sum + cat.subcategories.reduce((s, sub) => s + sub.tests.length, 0), 0)} tests</p>
          
          {testCategories.map(category => (
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
                        <div style={{ padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {sub.tests.map(test => (
                            <label key={test} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '220px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={selectedTests.includes(test)} onChange={() => toggleTest(test)} />
                              {test}
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

      {activeTab === 'packages' && <div><h2>Health Packages</h2><p>Full Body Checkup, Cardiac Care, Diabetes Profile - Coming Soon</p></div>}
      {activeTab === 'custom' && <DiagnosticsCustomPackage />}

      {selectedTests.length >= 2 && (
        <button onClick={handleCompare} style={{ position: 'fixed', bottom: 20, right: 20, backgroundColor: '#10b981', color: 'white', padding: '15px 30px', border: 'none', borderRadius: 50, cursor: 'pointer', zIndex: 1000 }}>
          Compare {selectedTests.length} Tests
        </button>
      )}
    </div>
  );
};

export default Diagnostics;