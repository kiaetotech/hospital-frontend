import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategorizedTests = ({ selectedTests, setSelectedTests, onCompare }) => {
  const [allTests, setAllTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  // Category definitions with subcategories
  const categoryConfig = {
    'BLD': { 
      name: 'Blood Tests', 
      icon: '🩸', 
      color: '#e74c3c',
      subcategories: ['Hematology', 'Biochemistry', 'Hormones', 'Iron studies', 'Vitamins', 'Tumor markers', 'Serology/Immunology', 'Coagulation', 'Infection markers', 'Special']
    },
    'IMG': { 
      name: 'Medical Imaging', 
      icon: '📷', 
      color: '#3498db',
      subcategories: ['X-ray', 'CT', 'MRI', 'Ultrasound', 'Fluoroscopy', 'Mammography', 'DEXA', 'Angiography']
    },
    'CRD': { 
      name: 'Cardiac Diagnostics', 
      icon: '❤️', 
      color: '#e67e22',
      subcategories: ['ECG', 'Stress Test', 'Holter', 'Echocardiography', 'ABI', 'Event Recorder']
    },
    'URN': { 
      name: 'Urine Tests', 
      icon: '💧', 
      color: '#f39c12',
      subcategories: ['Routine', 'Culture', 'Chemistry', 'Hormones', 'Special']
    },
    'STL': { 
      name: 'Stool Tests', 
      icon: '🧫', 
      color: '#27ae60',
      subcategories: ['Routine', 'Occult blood', 'Culture', 'Parasites', 'Antigens', 'Special']
    },
    'NEU': { 
      name: 'Neurodiagnostics', 
      icon: '🧠', 
      color: '#9b59b6',
      subcategories: ['EEG', 'EMG', 'NCS', 'Evoked Potentials', 'Sleep Studies']
    },
    'PFT': { 
      name: 'Pulmonary Function', 
      icon: '🫁', 
      color: '#1abc9c',
      subcategories: ['Spirometry', 'Lung Volumes', 'DLCO', 'FeNO', 'Methacholine Challenge', '6-Minute Walk']
    },
    'NM': { 
      name: 'Nuclear Medicine', 
      icon: '⚛️', 
      color: '#16a085',
      subcategories: ['PET-CT', 'Bone Scan', 'Cardiac Nuclear', 'Thyroid Nuclear', 'Renal Nuclear', 'Lung Nuclear', 'GI Nuclear']
    },
    'END': { 
      name: 'Endoscopy', 
      icon: '🔬', 
      color: '#2c3e50',
      subcategories: ['Upper GI', 'Colonoscopy', 'Bronchoscopy', 'Cystoscopy', 'ERCP', 'Capsule Endoscopy']
    },
    'CSF': { 
      name: 'Body Fluids', 
      icon: '💧', 
      color: '#8e44ad',
      subcategories: ['CSF', 'Synovial Fluid', 'Ascitic Fluid', 'Pleural Fluid', 'Pericardial Fluid']
    },
    'CYT': { 
      name: 'Pathology/Biopsy', 
      icon: '🔬', 
      color: '#c0392b',
      subcategories: ['FNAC', 'Core Biopsy', 'Histopathology', 'IHC', 'Frozen Section', 'Cytology']
    },
    'GEN': { 
      name: 'Genetic Tests', 
      icon: '🧬', 
      color: '#2980b9',
      subcategories: ['Karyotype', 'FISH', 'NGS Panels', 'Whole Exome', 'NIPT', 'HLA Typing', 'PCR']
    },
    'MIC': { 
      name: 'Microbiology', 
      icon: '🦠', 
      color: '#d35400',
      subcategories: ['Blood Culture', 'Sputum Culture', 'Wound Culture', 'Genital Swab', 'BAL', 'TB Testing']
    },
    'SPL': { 
      name: 'Special Tests', 
      icon: '⭐', 
      color: '#7f8c8d',
      subcategories: ['Sweat Chloride', 'Newborn Screening', 'Toxicology', 'Heavy Metals', 'Drug Monitoring']
    }
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

  const toggleSubcategory = (category, subcategory) => {
    const key = `${category}_${subcategory}`;
    setExpandedSubcategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleTest = (test) => {
    if (selectedTests.find(t => t._id === test._id)) {
      setSelectedTests(selectedTests.filter(t => t._id !== test._id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const getCategoryInfo = (categoryCode) => {
    return categoryConfig[categoryCode] || { name: categoryCode, icon: '📋', color: '#6b7280', subcategories: [] };
  };

  // Group tests by major_category and sub_category
  const groupedTests = allTests.reduce((acc, test) => {
    const cat = test.major_category || 'OTHER';
    const subcat = test.sub_category || 'General';
    if (!acc[cat]) acc[cat] = {};
    if (!acc[cat][subcat]) acc[cat][subcat] = [];
    acc[cat][subcat].push(test);
    return acc;
  }, {});

  // Filter by search term
  const filteredGroups = {};
  Object.keys(groupedTests).forEach(cat => {
    filteredGroups[cat] = {};
    Object.keys(groupedTests[cat]).forEach(subcat => {
      const filteredTests = groupedTests[cat][subcat].filter(test =>
        test.test_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredTests.length > 0) {
        filteredGroups[cat][subcat] = filteredTests;
      }
    });
  });

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Search any test (e.g., CBC, MRI, ECG, Thyroid)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '16px' }}
        />
      </div>

      <p style={{ marginBottom: '15px', color: '#6b7280' }}>
        Select 2 or more tests to compare prices across labs
      </p>

      {Object.keys(filteredGroups).map(category => {
        const catInfo = getCategoryInfo(category);
        const hasTests = Object.keys(filteredGroups[category]).length > 0;
        if (!hasTests) return null;

        return (
          <div key={category} style={{ marginBottom: '20px', border: `1px solid ${catInfo.color}`, borderRadius: '12px', overflow: 'hidden' }}>
            {/* Main Category Header */}
            <div
              onClick={() => toggleCategory(category)}
              style={{
                backgroundColor: catInfo.color,
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
              <span>{catInfo.icon} {catInfo.name}</span>
              <span>{expandedCategories[category] ? '▼' : '▶'}</span>
            </div>
            
            {/* Subcategories */}
            {expandedCategories[category] && (
              <div style={{ backgroundColor: '#f9fafb' }}>
                {Object.keys(filteredGroups[category]).map(subcategory => (
                  <div key={subcategory} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    {/* Subcategory Header */}
                    <div
                      onClick={() => toggleSubcategory(category, subcategory)}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: '#f3f4f6',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        color: '#4b5563'
                      }}
                    >
                      <span>📂 {subcategory} ({filteredGroups[category][subcategory].length} tests)</span>
                      <span>{expandedSubcategories[`${category}_${subcategory}`] ? '▼' : '▶'}</span>
                    </div>
                    
                    {/* Tests under subcategory */}
                    {expandedSubcategories[`${category}_${subcategory}`] && (
                      <div style={{ padding: '10px 20px' }}>
                        {filteredGroups[category][subcategory].map(test => (
                          <label key={test._id} style={{ display: 'flex', alignItems: 'center', padding: '8px', borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={!!selectedTests.find(t => t._id === test._id)}
                              onChange={() => toggleTest(test)}
                              style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ flex: 1, fontSize: '14px' }}>{test.test_name}</span>
                            {test.requires_fasting === 'Yes' && (
                              <span style={{ fontSize: '11px', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px', color: '#92400e' }}>Fasting Required</span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Fixed Compare Button */}
      {selectedTests.length >= 2 && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
          <button
            onClick={onCompare}
            style={{ 
              backgroundColor: '#10b981', 
              color: 'white', 
              padding: '15px 30px', 
              border: 'none', 
              borderRadius: '50px', 
              fontSize: '16px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🔬 Compare {selectedTests.length} Tests
          </button>
        </div>
      )}
    </div>
  );
};

export default CategorizedTests;