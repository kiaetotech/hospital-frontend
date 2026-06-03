import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategorizedTests = ({ selectedTests, setSelectedTests, onCompare }) => {
  const [allTests, setAllTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  const categoryColors = {
    'BLD': { name: 'Blood Tests', icon: '🩸', color: '#e74c3c', subcategories: ['Hematology', 'Biochemistry', 'Hormones', 'Iron studies', 'Vitamins', 'Tumor markers', 'Serology/Immunology', 'Coagulation', 'Infection markers', 'Special'] },
    'IMG': { name: 'Medical Imaging', icon: '📷', color: '#3498db', subcategories: ['X-ray', 'CT', 'MRI', 'Ultrasound', 'Fluoroscopy', 'Mammography', 'DEXA', 'Angiography'] },
    'CRD': { name: 'Cardiac Diagnostics', icon: '❤️', color: '#e67e22', subcategories: ['ECG', 'Stress Test', 'Holter', 'Echocardiography', 'ABI', 'Event Recorder'] },
    'URN': { name: 'Urine Tests', icon: '💧', color: '#f39c12', subcategories: ['Routine', 'Culture', 'Chemistry', 'Hormones', 'Special'] },
    'STL': { name: 'Stool Tests', icon: '🧫', color: '#27ae60', subcategories: ['Routine', 'Occult blood', 'Culture', 'Parasites', 'Antigens', 'Special'] },
    'NEU': { name: 'Neurodiagnostics', icon: '🧠', color: '#9b59b6', subcategories: ['EEG', 'EMG', 'NCS', 'Evoked Potentials', 'Sleep Studies'] },
    'PFT': { name: 'Pulmonary Function', icon: '🫁', color: '#1abc9c', subcategories: ['Spirometry', 'Lung Volumes', 'DLCO', 'FeNO', 'Methacholine Challenge', '6-Minute Walk'] },
    'NM': { name: 'Nuclear Medicine', icon: '⚛️', color: '#16a085', subcategories: ['PET-CT', 'Bone Scan', 'Cardiac Nuclear', 'Thyroid Nuclear', 'Renal Nuclear', 'Lung Nuclear', 'GI Nuclear'] },
    'END': { name: 'Endoscopy', icon: '🔬', color: '#2c3e50', subcategories: ['Upper GI', 'Colonoscopy', 'Bronchoscopy', 'Cystoscopy', 'ERCP', 'Capsule Endoscopy'] },
    'CSF': { name: 'Body Fluids', icon: '💧', color: '#8e44ad', subcategories: ['CSF', 'Synovial Fluid', 'Ascitic Fluid', 'Pleural Fluid', 'Pericardial Fluid'] },
    'CYT': { name: 'Pathology/Biopsy', icon: '🔬', color: '#c0392b', subcategories: ['FNAC', 'Core Biopsy', 'Histopathology', 'IHC', 'Frozen Section', 'Cytology'] },
    'GEN': { name: 'Genetic Tests', icon: '🧬', color: '#2980b9', subcategories: ['Karyotype', 'FISH', 'NGS Panels', 'Whole Exome', 'NIPT', 'HLA Typing', 'PCR'] },
    'MIC': { name: 'Microbiology', icon: '🦠', color: '#d35400', subcategories: ['Blood Culture', 'Sputum Culture', 'Wound Culture', 'Genital Swab', 'BAL', 'TB Testing'] },
    'SPL': { name: 'Special Tests', icon: '⭐', color: '#7f8c8d', subcategories: ['Sweat Chloride', 'Newborn Screening', 'Toxicology', 'Heavy Metals', 'Drug Monitoring'] }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const res = await axios.get(`${API_URL}/diagnostics/tests`);
      if (res.data?.data) {
        setAllTests(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleTest = (test) => {
    if (selectedTests.find(t => t._id === test._id)) {
      setSelectedTests(selectedTests.filter(t => t._id !== test._id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const getCategoryColor = (categoryCode) => {
    return categoryColors[categoryCode]?.color || '#6b7280';
  };

  const getCategoryIcon = (categoryCode) => {
    return categoryColors[categoryCode]?.icon || '📋';
  };

  const getCategoryName = (categoryCode) => {
    return categoryColors[categoryCode]?.name || categoryCode;
  };

  // Group tests by major_category
  const groupedTests = allTests.reduce((acc, test) => {
    const cat = test.major_category || 'OTHER';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(test);
    return acc;
  }, {});

  const filteredGroups = {};
  Object.keys(groupedTests).forEach(cat => {
    filteredGroups[cat] = groupedTests[cat].filter(test =>
      test.test_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="🔍 Search any test (e.g., CBC, MRI, ECG, Thyroid)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '16px' }}
      />

      {Object.keys(filteredGroups).map(category => (
        filteredGroups[category].length > 0 && (
          <div key={category} style={{ marginBottom: '20px', border: `1px solid ${getCategoryColor(category)}`, borderRadius: '12px', overflow: 'hidden' }}>
            <div
              onClick={() => toggleCategory(category)}
              style={{
                backgroundColor: getCategoryColor(category),
                color: 'white',
                padding: '15px 20px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '18px'
              }}
            >
              <span>{getCategoryIcon(category)} {getCategoryName(category)} ({filteredGroups[category].length} tests)</span>
              <span>{expandedCategories[category] ? '▼' : '▶'}</span>
            </div>
            
            {expandedCategories[category] && (
              <div style={{ padding: '15px', backgroundColor: '#f9fafb' }}>
                {filteredGroups[category].map(test => (
                  <label key={test._id} style={{ display: 'flex', alignItems: 'center', padding: '8px', borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!selectedTests.find(t => t._id === test._id)}
                      onChange={() => toggleTest(test)}
                      style={{ marginRight: '10px', width: '18px', height: '18px' }}
                    />
                    <span style={{ flex: 1 }}>{test.test_name}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{test.sub_category || 'General'}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )
      ))}

      {selectedTests.length >= 2 && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
          <button
            onClick={onCompare}
            style={{ backgroundColor: '#10b981', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '50px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            Compare {selectedTests.length} Tests
          </button>
        </div>
      )}
    </div>
  );
};

export default CategorizedTests;