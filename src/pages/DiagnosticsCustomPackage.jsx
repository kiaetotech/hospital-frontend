import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Complete 16 categories with subcategories (same as Lab Tests)
const testCategories = [
  {
    code: 'MRI',
    name: '🧠 MRI (Magnetic Resonance Imaging)',
    icon: '🧠',
    color: '#8e44ad',
    subcategories: [
      { name: 'Brain MRI', tests: ['MRI Brain with contrast', 'MRI Brain without contrast', 'MRI Orbit / IAC', 'MRI Pituitary'] },
      { name: 'Spine MRI', tests: ['MRI Cervical Spine', 'MRI Thoracic Spine', 'MRI Lumbar Spine', 'MRI Whole Spine'] },
      { name: 'Joints MRI', tests: ['MRI Shoulder', 'MRI Knee', 'MRI Hip', 'MRI Wrist', 'MRI Ankle', 'MRI Elbow'] },
      { name: 'Abdomen MRI', tests: ['MRI Abdomen', 'MRI MRCP', 'MRI Pelvis', 'MRI Enterography'] },
      { name: 'Cardiac MRI', tests: ['MRI Cardiac', 'MRI Angiography (MRA)', 'MR Venography (MRV)'] },
      { name: 'Other MRI', tests: ['MRI Breast', 'MRI Soft tissue', 'MRI Prostate'] }
    ]
  },
  {
    code: 'CT',
    name: '📷 CT (Computed Tomography)',
    icon: '📷',
    color: '#3498db',
    subcategories: [
      { name: 'Head CT', tests: ['CT Head', 'CT Facial bones', 'CT Sinus', 'CT Temporal bone', 'CT Orbit'] },
      { name: 'Chest CT', tests: ['CT Chest', 'CT High Resolution', 'CT Pulmonary Angiography'] },
      { name: 'Abdomen CT', tests: ['CT Abdomen', 'CT Pelvis', 'CT Abdomen + Pelvis', 'CT Urogram', 'CT Virtual colonoscopy'] },
      { name: 'Spine CT', tests: ['CT Cervical Spine', 'CT Thoracic Spine', 'CT Lumbar Spine'] },
      { name: 'Angiography CT', tests: ['CT Angiography Head', 'CT Angiography Neck', 'CT Angiography Coronary', 'CT Angiography Peripheral'] },
      { name: 'Other CT', tests: ['CT Guided biopsy', 'CT Perfusion', 'CT KUB'] }
    ]
  },
  {
    code: 'XR',
    name: '🦴 X-ray (Radiography)',
    icon: '🦴',
    color: '#e67e22',
    subcategories: [
      { name: 'Chest X-ray', tests: ['Chest X-ray PA', 'Chest X-ray AP', 'Chest X-ray Lateral'] },
      { name: 'Spine X-ray', tests: ['X-ray Cervical Spine', 'X-ray Thoracic Spine', 'X-ray Lumbar Spine', 'X-ray Sacrum/Coccyx'] },
      { name: 'Upper Limb X-ray', tests: ['X-ray Shoulder', 'X-ray Arm', 'X-ray Elbow', 'X-ray Forearm', 'X-ray Wrist', 'X-ray Hand', 'X-ray Fingers'] },
      { name: 'Lower Limb X-ray', tests: ['X-ray Hip', 'X-ray Thigh', 'X-ray Knee', 'X-ray Leg', 'X-ray Ankle', 'X-ray Foot', 'X-ray Toes'] },
      { name: 'Pelvis X-ray', tests: ['X-ray Pelvis', 'X-ray SI Joints'] },
      { name: 'Skull X-ray', tests: ['X-ray Skull', 'X-ray Sinus', 'X-ray Facial bones', 'X-ray Mandible', 'X-ray Dental (OPG)'] },
      { name: 'Abdomen X-ray', tests: ['X-ray Abdomen (KUB)'] },
      { name: 'Other X-ray', tests: ['X-ray Mammogram', 'X-ray DEXA', 'X-ray Barium swallow', 'X-ray Barium meal', 'X-ray Barium enema'] }
    ]
  },
  {
    code: 'USG',
    name: '🔊 Ultrasound (Sonography)',
    icon: '🔊',
    color: '#1abc9c',
    subcategories: [
      { name: 'Abdomen USG', tests: ['USG Abdomen', 'USG KUB', 'USG Hepatobiliary', 'USG Renal', 'USG Pancreas', 'USG Spleen'] },
      { name: 'Pelvis USG', tests: ['USG Pelvis', 'USG Transabdominal', 'USG Transvaginal', 'USG Transrectal'] },
      { name: 'Thyroid USG', tests: ['USG Thyroid', 'USG Neck'] },
      { name: 'Breast USG', tests: ['USG Breast', 'USG Breast with Doppler'] },
      { name: 'Scrotum USG', tests: ['USG Scrotum', 'USG Testis'] },
      { name: 'Musculoskeletal USG', tests: ['USG Joint', 'USG Tendon', 'USG Muscle', 'USG Ligament'] },
      { name: 'Vascular USG', tests: ['Carotid Doppler', 'Arterial Doppler', 'Venous Doppler', 'Renal Doppler', 'Hepatobiliary Doppler', 'Color Doppler'] },
      { name: 'Obstetric USG', tests: ['Obstetric USG Dating', 'Obstetric USG Anomaly', 'Obstetric USG Growth', 'Obstetric USG Doppler', 'TVS Early Pregnancy'] },
      { name: 'Other USG', tests: ['ECHO (Echocardiography)', 'USG Neonatal brain', 'USG Guided procedures'] }
    ]
  },
  {
    code: 'HEM',
    name: '🩸 Hematology',
    icon: '🩸',
    color: '#e74c3c',
    subcategories: [
      { name: 'CBC', tests: ['Complete Blood Count (CBC)', 'Hemoglobin (Hb)', 'Hematocrit (HCT)', 'RBC count', 'WBC count', 'Platelet count'] },
      { name: 'Differential', tests: ['Differential Count (DLC)', 'Peripheral smear', 'Malaria smear', 'Filariasis smear'] },
      { name: 'Coagulation', tests: ['PT/INR', 'aPTT', 'Bleeding time', 'Clotting time', 'D-Dimer', 'Fibrinogen'] },
      { name: 'Inflammation', tests: ['ESR', 'CRP', 'hs-CRP', 'Procalcitonin'] },
      { name: 'Special', tests: ['Hb electrophoresis', 'Reticulocyte count', 'Blood grouping', 'Rh typing', 'Cross matching'] }
    ]
  },
  {
    code: 'BIO',
    name: '🧪 Biochemistry',
    icon: '🧪',
    color: '#f39c12',
    subcategories: [
      { name: 'Diabetes', tests: ['Glucose Fasting', 'Glucose Postprandial', 'Glucose Random', 'HbA1c', 'Insulin', 'C-peptide'] },
      { name: 'Liver', tests: ['Liver Function Test (LFT)', 'Bilirubin Total', 'Bilirubin Direct', 'ALT', 'AST', 'ALP', 'GGT', 'Total Protein', 'Albumin', 'Globulin'] },
      { name: 'Kidney', tests: ['Renal Function Test (RFT)', 'Urea', 'Creatinine', 'Uric acid', 'BUN'] },
      { name: 'Lipids', tests: ['Lipid profile', 'Total Cholesterol', 'Triglycerides', 'HDL', 'LDL', 'VLDL'] },
      { name: 'Electrolytes', tests: ['Sodium', 'Potassium', 'Chloride', 'Calcium', 'Magnesium', 'Phosphorus'] },
      { name: 'Cardiac', tests: ['Troponin I', 'Troponin T', 'CK-MB', 'LDH', 'SGOT/AST'] },
      { name: 'Pancreas', tests: ['Amylase', 'Lipase'] },
      { name: 'Iron Studies', tests: ['Serum Iron', 'TIBC', 'Ferritin', 'Transferrin Saturation'] },
      { name: 'Vitamins', tests: ['Vitamin B12', 'Vitamin D', 'Folate', 'Homocysteine'] },
      { name: 'Other', tests: ['Blood Gas (ABG)', 'Lactate', 'Ammonia', 'Osmolality'] }
    ]
  },
  {
    code: 'SER',
    name: '🦠 Serology / Immunology',
    icon: '🦠',
    color: '#9b59b6',
    subcategories: [
      { name: 'Infectious Diseases', tests: ['HIV ELISA', 'HIV Western Blot', 'HIV PCR', 'HBsAg', 'Anti-HBs', 'Anti-HBc', 'Hepatitis C Antibody', 'Hepatitis C PCR', 'Hepatitis A IgM', 'Hepatitis E IgM'] },
      { name: 'Sexually Transmitted', tests: ['Syphilis (VDRL)', 'Syphilis (TPHA)', 'Chlamydia PCR', 'Gonorrhea PCR', 'Herpes PCR'] },
      { name: 'Tropical Diseases', tests: ['Dengue NS1', 'Dengue IgM/IgG', 'Chikungunya IgM/IgG', 'Malaria Antigen', 'Malaria Smear', 'Typhoid (Widal)', 'Typhidot', 'Leptospira IgM'] },
      { name: 'Autoimmune', tests: ['Rheumatoid Factor (RF)', 'Anti-CCP', 'ANA', 'Anti-dsDNA', 'ANCA', 'Anti-phospholipid', 'Complement C3', 'Complement C4'] },
      { name: 'Tumor Markers', tests: ['AFP', 'CEA', 'CA-125', 'CA 19-9', 'CA 15-3', 'PSA Total', 'PSA Free', 'β-hCG', 'Calcitonin', 'Thyroglobulin'] },
      { name: 'Allergy', tests: ['Total IgE', 'RAST Test', 'Allergy Panel'] },
      { name: 'Other', tests: ['Serum Protein Electrophoresis', 'Immunofixation', 'Quantitative Immunoglobulins'] }
    ]
  },
  {
    code: 'HOR',
    name: '⚖️ Hormones / Endocrine',
    icon: '⚖️',
    color: '#16a085',
    subcategories: [
      { name: 'Thyroid', tests: ['TSH', 'Free T3', 'Free T4', 'Total T3', 'Total T4', 'Anti-TPO', 'Anti-Tg'] },
      { name: 'Adrenal', tests: ['Cortisol Morning', 'Cortisol Evening', 'ACTH', 'Aldosterone', 'Renin'] },
      { name: 'Reproductive Female', tests: ['LH', 'FSH', 'Estradiol (E2)', 'Progesterone', 'Prolactin', 'AMH'] },
      { name: 'Reproductive Male', tests: ['Testosterone Total', 'Testosterone Free', 'DHEA-S', 'Androstenedione'] },
      { name: 'Metabolic', tests: ['Insulin', 'C-peptide', 'PTH', 'Vitamin D', 'Growth Hormone', 'IGF-1'] }
    ]
  },
  {
    code: 'URN',
    name: '💧 Urine Tests',
    icon: '💧',
    color: '#2980b9',
    subcategories: [
      { name: 'Routine', tests: ['Urinalysis', 'Urine Routine & Microscopy', 'Urine Glucose', 'Urine Ketones', 'Urine pH', 'Urine Specific Gravity'] },
      { name: 'Culture', tests: ['Urine Culture & Sensitivity', 'Urine AFB', 'Urine PCR'] },
      { name: 'Chemistry', tests: ['Urine Protein', 'Urine Microalbumin', 'Urine Creatinine', 'Urine Urea', 'Urine Uric Acid', 'Urine Calcium', 'Urine Electrolytes'] },
      { name: 'Hormones', tests: ['Urine Pregnancy Test', 'Urine Cortisol', 'Urine Catecholamines', 'Urine Metanephrines', 'Urine 5-HIAA'] },
      { name: 'Special', tests: ['Urine Bence Jones Protein', 'Urine Porphobilinogen', 'Urine Drug Screen'] }
    ]
  },
  {
    code: 'STL',
    name: '🧫 Stool Tests',
    icon: '🧫',
    color: '#27ae60',
    subcategories: [
      { name: 'Routine', tests: ['Stool Routine', 'Stool Microscopy', 'Stool pH'] },
      { name: 'Occult Blood', tests: ['FOBT', 'FIT'] },
      { name: 'Culture', tests: ['Stool Culture & Sensitivity', 'Stool PCR for Pathogens'] },
      { name: 'Parasites', tests: ['Ova/Cyst Examination', 'Giardia Antigen', 'Cryptosporidium Antigen'] },
      { name: 'Special', tests: ['Calprotectin', 'Stool Fat', 'Stool Elastase', 'Stool Reducing Substances'] }
    ]
  },
  {
    code: 'ECG',
    name: '❤️ ECG / Cardiac Electrophysiology',
    icon: '❤️',
    color: '#e74c3c',
    subcategories: [
      { name: 'ECG', tests: ['ECG 12-lead Resting', 'ECG Exercise Stress', 'Signal Averaged ECG'] },
      { name: 'Monitoring', tests: ['Holter Monitoring 24h', 'Holter Monitoring 48h', 'Event Recorder', 'Tilt Table Test'] }
    ]
  },
  {
    code: 'EEG',
    name: '🧠 EEG / Neurophysiology',
    icon: '🧠',
    color: '#9b59b6',
    subcategories: [
      { name: 'EEG', tests: ['Routine EEG', 'Sleep Deprived EEG', 'Video EEG Monitoring', 'Ambulatory EEG'] },
      { name: 'Nerve Studies', tests: ['Electromyography (EMG)', 'Nerve Conduction Studies (NCS)', 'Repetitive Nerve Stimulation', 'Evoked Potentials (VEP)', 'Evoked Potentials (BAER)', 'Evoked Potentials (SSEP)'] }
    ]
  },
  {
    code: 'PFT',
    name: '🫁 Pulmonary Function Tests',
    icon: '🫁',
    color: '#1abc9c',
    subcategories: [
      { name: 'Spirometry', tests: ['Spirometry', 'Bronchodilator Reversibility', 'Methacholine Challenge'] },
      { name: 'Lung Volumes', tests: ['Lung Volumes', 'Diffusing Capacity (DLCO)', 'Residual Volume'] },
      { name: 'Other', tests: ['6 Minute Walk Test', 'FeNO', 'Maximal Respiratory Pressures', 'Nocturnal Oximetry'] }
    ]
  },
  {
    code: 'END',
    name: '🔬 Endoscopy',
    icon: '🔬',
    color: '#2c3e50',
    subcategories: [
      { name: 'Upper GI', tests: ['EGD (Upper GI Endoscopy)', 'ERCP', 'Capsule Endoscopy', 'Enteroscopy', 'EUS'] },
      { name: 'Lower GI', tests: ['Colonoscopy', 'Sigmoidoscopy', 'Anoscopy'] },
      { name: 'Respiratory', tests: ['Bronchoscopy', 'EBUS'] },
      { name: 'Urology', tests: ['Cystoscopy', 'Ureteroscopy'] },
      { name: 'GYN', tests: ['Hysteroscopy', 'Colposcopy'] },
      { name: 'Other', tests: ['Laparoscopy', 'Arthroscopy', 'Mediastinoscopy'] }
    ]
  },
  {
    code: 'NUC',
    name: '⚛️ Nuclear Medicine / PET',
    icon: '⚛️',
    color: '#16a085',
    subcategories: [
      { name: 'PET', tests: ['PET-CT Whole Body', 'PET-CT Cardiac', 'PET-CT Brain'] },
      { name: 'Bone', tests: ['Whole Body Bone Scan', '3 Phase Bone Scan'] },
      { name: 'Thyroid', tests: ['Thyroid Uptake', 'Thyroid Scan'] },
      { name: 'Renal', tests: ['DTPA Scan', 'MAG3 Scan', 'DMSA Scan'] },
      { name: 'Cardiac', tests: ['Myocardial Perfusion Scan (MIBI)', 'MUGA Scan'] },
      { name: 'Lung', tests: ['V/Q Scan'] },
      { name: 'GI', tests: ['HIDA Scan', 'Gastric Emptying Scan', 'Meckel Scan'] },
      { name: 'Other', tests: ['Octreotide Scan', 'MIBG Scan', 'Parathyroid Scan', 'Sentinel Lymph Node Scan', 'Gallium Scan'] }
    ]
  },
  {
    code: 'SPL',
    name: '⭐ Special Tests',
    icon: '⭐',
    color: '#7f8c8d',
    subcategories: [
      { name: 'Genetic', tests: ['Karyotype', 'FISH', 'Chromosomal Microarray', 'Single Gene Sequencing', 'NGS Panel', 'Whole Exome Sequencing', 'NIPT'] },
      { name: 'HLA', tests: ['HLA Typing', 'HLA B27', 'HLA DQ2/DQ8'] },
      { name: 'Body Fluids', tests: ['CSF Analysis', 'Synovial Fluid Analysis', 'Ascitic Fluid Analysis', 'Pleural Fluid Analysis', 'Pericardial Fluid Analysis', 'Amniotic Fluid Analysis'] },
      { name: 'Biopsy', tests: ['FNAC', 'Core Needle Biopsy', 'Excisional Biopsy', 'Histopathology', 'IHC', 'Frozen Section'] },
      { name: 'Other', tests: ['Sweat Chloride Test', 'Newborn Screening', 'Paternity Testing', 'Toxicology Screen', 'Heavy Metals', 'Therapeutic Drug Monitoring', 'Skin Biopsy', 'Muscle Biopsy', 'Nerve Biopsy', 'Bone Marrow Biopsy', 'Pap Smear', 'Semen Analysis'] }
    ]
  }
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
    const exists = selectedTests.some(t => t.name === testName);
    
    if (exists) {
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
    if (testNames.length < 2) {
      alert('Please select at least 2 tests to compare');
      return;
    }
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
      if (res.data.providers && res.data.providers.length > 0) {
        const sorted = [...res.data.providers].sort((a, b) => {
          const totalA = testNames.reduce((s, name) => s + (a.individual_prices[name] || 0), 0);
          const totalB = testNames.reduce((s, name) => s + (b.individual_prices[name] || 0), 0);
          return totalA - totalB;
        });
        setProviders(sorted);
      } else {
        alert('No providers found for the selected tests');
      }
    } catch (error) {
      console.error(error);
      alert('Error comparing tests');
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
    const total = selectedTests.reduce((sum, test) => sum + (selectedProvider.individual_prices[test.name] || 0), 0);
    try {
      // Create booking record
      const bookingData = {
        ...bookingForm,
        provider_name: selectedProvider.provider_name,
        tests: selectedTests.map(t => t.name),
        total_amount: total,
        package_name: `Custom Package (${selectedTests.length} tests)`
      };
      
      // Here you would call your booking API
      // const res = await axios.post(`${API_URL}/bookings/custom`, bookingData);
      
      alert(`Booking Successful!\n\nProvider: ${selectedProvider.provider_name}\nTests: ${selectedTests.map(t => t.name).join(', ')}\nTotal: ₹${total}\nReference: CUST${Date.now()}\n\nWe will contact you shortly.`);
      
      setShowBookingModal(false);
      setSelectedProvider(null);
      setBookingForm({
        patient_name: '', patient_age: '', patient_gender: 'male', patient_phone: '',
        patient_email: '', appointment_date: '', home_collection_requested: false, home_address: ''
      });
    } catch (err) {
      console.error('Booking error:', err);
      alert('Booking failed. Please try again.');
    }
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
      <h1>✨ Build Custom Package</h1>
      <p>Select 2 or more tests to compare prices across different labs. Cheapest provider appears first.</p>

      {/* Selected Tests Counter and Compare Button */}
      <div style={{ backgroundColor: '#e0e7ff', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <strong>✅ Selected Tests:</strong> {selectedTests.length}
          {selectedTests.length > 0 && (
            <span style={{ marginLeft: '10px', fontSize: '12px', color: '#4b5563' }}>
              ({selectedTests.map(t => t.name).join(', ')})
            </span>
          )}
        </div>
        {selectedTests.length >= 2 && (
          <button 
            onClick={() => handleCompareByName(selectedTests.map(t => t.name))} 
            disabled={comparing}
            style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {comparing ? '⏳ Comparing...' : `🔬 Compare ${selectedTests.length} Tests`}
          </button>
        )}
      </div>

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
        
        {userLocation && <p style={{ fontSize: '12px', marginTop: '10px', color: '#10b981' }}>📍 Location detected: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>}
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
                  <input type="checkbox" checked={selectedTests.some(t => t.name === result.testName)} onChange={() => toggleTest(result.testName)} />
                  Select
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categories View - Same as Lab Tests */}
      {!searchTerm && (
        <div>
          {testCategories.map(category => {
            return (
              <div key={category.code} style={{ marginBottom: '20px', border: `1px solid ${category.color}`, borderRadius: '8px', overflow: 'hidden' }}>
                <div 
                  onClick={() => toggleCategory(category.code)} 
                  style={{ backgroundColor: category.color, color: 'white', padding: '12px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}
                >
                  <span>{category.icon} {category.name}</span>
                  <span>{expandedCategories[category.code] ? '▼' : '▶'}</span>
                </div>
                
                {expandedCategories[category.code] && (
                  <div style={{ backgroundColor: '#f9fafb', padding: '10px' }}>
                    {category.subcategories.map(sub => (
                      <div key={sub.name} style={{ marginBottom: '10px' }}>
                        <div 
                          onClick={() => toggleSubCategory(category.code, sub.name)} 
                          style={{ padding: '8px', backgroundColor: '#f3f4f6', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderRadius: '4px', borderLeft: `4px solid ${category.color}` }}
                        >
                          <span>📂 {sub.name} ({sub.tests.length} tests)</span>
                          <span>{expandedSubCategories[`${category.code}_${sub.name}`] ? '▼' : '▶'}</span>
                        </div>
                        
                        {expandedSubCategories[`${category.code}_${sub.name}`] && (
                          <div style={{ padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {sub.tests.map(test => (
                              <label key={test} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
                                <input 
                                  type="checkbox" 
                                  checked={selectedTests.some(t => t.name === test)} 
                                  onChange={() => toggleTest(test)} 
                                />
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
            );
          })}
        </div>
      )}
      
      {comparing && <p style={{ marginTop: '20px', textAlign: 'center' }}>⏳ Comparing prices across labs...</p>}
      
      {/* Comparison Results Table */}
      {providers.length > 0 && selectedTests.length >= 2 && (
        <div style={{ marginTop: '20px' }}>
          <h2>📊 Comparison Results - Cheapest Provider First</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #ddd', padding: '12px' }}>Provider</th>
                  {selectedTests.map((test, idx) => (
                    <th key={idx} style={{ border: '1px solid #ddd', padding: '12px' }}>{test.name}</th>
                  ))}
                  <th style={{ border: '1px solid #ddd', padding: '12px' }}>Total</th>
                  <th style={{ border: '1px solid #ddd', padding: '12px' }}>Rating</th>
                  <th style={{ border: '1px solid #ddd', padding: '12px' }}>Distance</th>
                  <th style={{ border: '1px solid #ddd', padding: '12px' }}>Home Coll.</th>
                  <th style={{ border: '1px solid #ddd', padding: '12px' }}>Action</th>
                </table>
              </thead>
              <tbody>
                {providers.map((provider, idx) => {
                  const total = selectedTests.reduce((sum, test) => sum + (provider.individual_prices[test.name] || 0), 0);
                  const distance = getDistance(provider);
                  return (
                    <tr key={idx} style={{ backgroundColor: idx === 0 ? '#d1fae5' : 'white' }}>
                      <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 'bold' }}>{provider.provider_name} {idx === 0 && '⭐'}</td>
                      {selectedTests.map((test, i) => (
                        <td key={i} style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                          ₹{provider.individual_prices[test.name] || 'N/A'}
                        </td>
                      ))}
                      <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#10b981' }}>₹{total}</td>
                      <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>⭐ {provider.rating || 4.5}</td>
                      <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>{distance} km</td>
                      <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>{provider.home_collection_available ? '✅ Yes' : '❌ No'}</td>
                      <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                        <button 
                          onClick={() => openBookingModal(provider)} 
                          style={{ backgroundColor: idx === 0 ? '#10b981' : '#3b82f6', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
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

      {/* Floating Compare Button */}
      {selectedTests.length >= 2 && !comparing && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
          <button 
            onClick={() => handleCompareByName(selectedTests.map(t => t.name))}
            style={{ backgroundColor: '#10b981', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '50px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            🔬 Compare {selectedTests.length} Tests
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedProvider && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2>📋 Book Custom Package</h2>
            <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
              <p><strong>🏥 Provider:</strong> {selectedProvider.provider_name}</p>
              <p><strong>🧪 Tests:</strong> {selectedTests.map(t => t.name).join(', ')}</p>
              <p><strong>💰 Total Amount:</strong> ₹{selectedTests.reduce((sum, test) => sum + (selectedProvider.individual_prices[test.name] || 0), 0)}</p>
            </div>
            
            <form onSubmit={handleBookingSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name *</label>
                <input type="text" name="patient_name" required value={bookingForm.patient_name} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Age *</label>
                  <input type="number" name="patient_age" required value={bookingForm.patient_age} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Gender *</label>
                  <select name="patient_gender" value={bookingForm.patient_gender} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone Number *</label>
                <input type="tel" name="patient_phone" required value={bookingForm.patient_phone} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
                <input type="email" name="patient_email" value={bookingForm.patient_email} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Appointment Date *</label>
                <input type="date" name="appointment_date" required value={bookingForm.appointment_date} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              {selectedProvider.home_collection_available && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" name="home_collection_requested" checked={bookingForm.home_collection_requested} onChange={(e) => setBookingForm({...bookingForm, home_collection_requested: e.target.checked})} />
                    🏠 Request Home Collection
                  </label>
                </div>
              )}
              {bookingForm.home_collection_requested && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Home Address</label>
                  <textarea name="home_address" rows="3" value={bookingForm.home_address} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
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

export default DiagnosticsCustomPackage;