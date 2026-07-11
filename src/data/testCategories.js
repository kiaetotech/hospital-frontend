export const testCategories = [
  {
    code: 'BLD',
    name: 'Blood Tests',
    icon: '🩸',
    color: '#e74c3c',
    subcategories: [
      { name: 'Hematology', tests: ['Complete Blood Count', 'Hemoglobin', 'White Blood Cell Count', 'Platelet Count', 'ESR', 'CRP', 'Peripheral Smear', 'Hb Electrophoresis', 'Reticulocyte Count'] },
      { name: 'Coagulation', tests: ['PT/INR', 'aPTT', 'D-Dimer', 'Fibrinogen'] },
      { name: 'Biochemistry', tests: ['Glucose Fasting', 'HbA1c', 'Liver Function Test', 'Kidney Function Test', 'Electrolytes', 'Calcium', 'Magnesium', 'Phosphate', 'Uric Acid', 'Lipid Profile', 'Amylase', 'Lipase', 'LDH', 'Troponin', 'CK-MB'] },
      { name: 'Iron Studies', tests: ['Serum Iron', 'TIBC', 'Ferritin', 'Transferrin Saturation'] },
      { name: 'Vitamins', tests: ['Vitamin B12', 'Vitamin D', 'Folate'] },
      { name: 'Hormones', tests: ['TSH', 'T3', 'T4', 'Cortisol', 'Prolactin', 'LH', 'FSH', 'Estradiol', 'Progesterone', 'Testosterone', 'PTH', 'Insulin'] },
      { name: 'Tumor Markers', tests: ['AFP', 'CEA', 'CA-125', 'CA 19-9', 'PSA'] },
      { name: 'Serology/Immunology', tests: ['HIV Test', 'HBsAg', 'Anti-HCV', 'Dengue Test', 'Malaria Test', 'Rheumatoid Factor', 'ANA'] }
    ]
  },
  {
    code: 'IMG',
    name: 'Medical Imaging',
    icon: '📷',
    color: '#3498db',
    subcategories: [
      { name: 'X-ray', tests: ['Chest X-ray', 'Limb X-ray', 'Spine X-ray', 'KUB', 'Mammogram', 'DEXA', 'OPG'] },
      { name: 'CT', tests: ['CT Head', 'CT Chest', 'CT Abdomen/Pelvis', 'CT Spine', 'CT Angiography'] },
      { name: 'MRI', tests: ['MRI Brain', 'MRI Spine', 'MRI Joints', 'MRI Abdomen', 'MRI Breast'] },
      { name: 'Ultrasound', tests: ['USG Abdomen', 'USG Pelvis', 'USG Thyroid', 'USG Scrotum', 'Doppler Studies', 'Echocardiography', 'Obstetric USG'] }
    ]
  },
  {
    code: 'CRD',
    name: 'Cardiac Diagnostics',
    icon: '❤️',
    color: '#e67e22',
    subcategories: [
      { name: 'ECG', tests: ['ECG 12-lead', 'Stress ECG (TMT)', 'Holter Monitor', 'Event Recorder'] },
      { name: 'Vascular', tests: ['Ankle-Brachial Index', 'Pulse Volume Recording'] }
    ]
  },
  {
    code: 'URN',
    name: 'Urine Tests',
    icon: '💧',
    color: '#f39c12',
    subcategories: [
      { name: 'Routine', tests: ['Urinalysis', 'Urine Glucose', 'Urine Ketones'] },
      { name: 'Culture', tests: ['Urine Culture & Sensitivity', 'Urine AFB'] },
      { name: 'Chemistry', tests: ['Urine Protein', 'Urine Microalbumin', 'Urine Electrolytes', 'Urine Osmolality'] },
      { name: 'Hormones', tests: ['Urine Pregnancy Test', 'Urine Cortisol'] }
    ]
  },
  {
    code: 'STL',
    name: 'Stool Tests',
    icon: '🧫',
    color: '#27ae60',
    subcategories: [
      { name: 'Routine', tests: ['Stool Routine', 'Stool Microscopy'] },
      { name: 'Occult Blood', tests: ['FOBT', 'FIT'] },
      { name: 'Culture', tests: ['Stool Culture & Sensitivity'] },
      { name: 'Parasites', tests: ['Ova/Cyst Examination'] }
    ]
  },
  {
    code: 'NEU',
    name: 'Neurodiagnostics',
    icon: '🧠',
    color: '#9b59b6',
    subcategories: [
      { name: 'EEG', tests: ['Routine EEG', 'Sleep Deprived EEG', 'Video EEG', 'Ambulatory EEG'] },
      { name: 'Nerve Studies', tests: ['EMG', 'Nerve Conduction Studies', 'Repetitive Nerve Stimulation'] },
      { name: 'Evoked Potentials', tests: ['VEP', 'BAER', 'SSEP'] }
    ]
  },
  {
    code: 'PFT',
    name: 'Pulmonary Function',
    icon: '🫁',
    color: '#1abc9c',
    subcategories: [
      { name: 'Spirometry', tests: ['Spirometry', 'Bronchodilator Reversibility'] },
      { name: 'Lung Volumes', tests: ['Lung Volumes', 'Diffusing Capacity (DLCO)'] },
      { name: 'Other', tests: ['FeNO', 'Methacholine Challenge', '6-Minute Walk Test'] }
    ]
  },
  {
    code: 'END',
    name: 'Endoscopy',
    icon: '🔬',
    color: '#2c3e50',
    subcategories: [
      { name: 'Upper GI', tests: ['EGD', 'ERCP', 'Capsule Endoscopy'] },
      { name: 'Lower GI', tests: ['Colonoscopy', 'Sigmoidoscopy'] },
      { name: 'Other', tests: ['Bronchoscopy', 'Cystoscopy', 'Hysteroscopy'] }
    ]
  },
  {
    code: 'CYT',
    name: 'Pathology/Biopsy',
    icon: '🔬',
    color: '#c0392b',
    subcategories: [
      { name: 'Cytology', tests: ['Pap Smear', 'Urine Cytology', 'Sputum Cytology'] },
      { name: 'FNAC', tests: ['Thyroid FNAC', 'Lymph Node FNAC', 'Breast FNAC'] },
      { name: 'Biopsy', tests: ['Core Needle Biopsy', 'Excisional Biopsy', 'Histopathology'] }
    ]
  },
  {
    code: 'GEN',
    name: 'Genetic Tests',
    icon: '🧬',
    color: '#2980b9',
    subcategories: [
      { name: 'Chromosome', tests: ['Karyotype', 'FISH', 'Chromosomal Microarray'] },
      { name: 'Sequencing', tests: ['Single Gene Sequencing', 'Gene Panel (NGS)', 'Whole Exome Sequencing'] },
      { name: 'Other', tests: ['NIPT', 'HLA Typing', 'Paternity Testing'] }
    ]
  },
  {
    code: 'MIC',
    name: 'Microbiology',
    icon: '🦠',
    color: '#d35400',
    subcategories: [
      { name: 'Cultures', tests: ['Blood Culture', 'Sputum Culture', 'Wound Culture', 'Throat Swab'] },
      { name: 'Molecular', tests: ['TB GeneXpert', 'COVID-19 PCR', 'Chlamydia/Gonorrhea PCR'] }
    ]
  },
  {
    code: 'SPL',
    name: 'Special Tests',
    icon: '⭐',
    color: '#7f8c8d',
    subcategories: [
      { name: 'Other', tests: ['Sweat Chloride Test', 'Newborn Screening', 'Toxicology Screen', 'Heavy Metals', 'Therapeutic Drug Monitoring'] }
    ]
  }
];
