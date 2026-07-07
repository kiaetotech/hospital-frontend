import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchOnlineDoctors } from '../../services/api';
import api from '../../services/api';

// ============================================
// MEDICAL MASTER DATA — Disease/Keyword → Specialty
// ============================================
const DISEASE_SPECIALTY_MAP = {
  // General
  'fever': 'General Physician', 'cold': 'General Physician', 'cough': 'General Physician',
  'flu': 'General Physician', 'headache': 'General Physician', 'body ache': 'General Physician',
  'weakness': 'General Physician', 'fatigue': 'General Physician', 'tired': 'General Physician',
  'sore throat': 'General Physician', 'infection': 'General Physician', 'viral': 'General Physician',
  'allergy': 'General Physician', 'throat': 'General Physician', 'pain': 'General Physician',
  'injury': 'General Physician', 'wound': 'General Physician', 'cut': 'General Physician',
  
  // Heart
  'chest pain': 'Cardiologist', 'heart': 'Cardiologist', 'bp': 'Cardiologist',
  'blood pressure': 'Cardiologist', 'palpitation': 'Cardiologist', 'cholesterol': 'Cardiologist',
  'angiogram': 'Cardiologist', 'hypertension': 'Cardiologist', 'arrhythmia': 'Cardiologist',
  'heart attack': 'Cardiologist', 'cardiac': 'Cardiologist', 'valve': 'Cardiologist',
  
  // Brain & Nerves
  'migraine': 'Neurologist', 'seizure': 'Neurologist', 'epilepsy': 'Neurologist',
  'paralysis': 'Neurologist', 'stroke': 'Neurologist', 'tremor': 'Neurologist',
  'parkinson': 'Neurologist', 'memory': 'Neurologist', 'numbness': 'Neurologist',
  'tingling': 'Neurologist', 'neuropathy': 'Neurologist', 'brain tumor': 'Neurologist',
  'multiple sclerosis': 'Neurologist', 'alzheimer': 'Neurologist', 'nerve': 'Neurologist',
  'brain': 'Neurologist',
  
  // Bones & Joints
  'fracture': 'Orthopedic', 'back pain': 'Orthopedic', 'knee pain': 'Orthopedic',
  'joint pain': 'Orthopedic', 'arthritis': 'Orthopedic', 'spine': 'Orthopedic',
  'neck pain': 'Orthopedic', 'shoulder': 'Orthopedic', 'sciatica': 'Orthopedic',
  'spondylitis': 'Orthopedic', 'gout': 'Orthopedic', 'osteoporosis': 'Orthopedic',
  'hip pain': 'Orthopedic', 'ankle': 'Orthopedic', 'wrist': 'Orthopedic',
  'knee replacement': 'Orthopedic', 'hip replacement': 'Orthopedic',
  'slip disc': 'Orthopedic', 'disc bulge': 'Orthopedic', 'carpal tunnel': 'Orthopedic',
  'finger': 'Orthopedic', 'hand': 'Orthopedic', 'elbow': 'Orthopedic', 'bone': 'Orthopedic',
  'fingure': 'Orthopedic', 'fingar': 'Orthopedic', 'fingure injury': 'Orthopedic',
  'hand injury': 'Orthopedic', 'finger injury': 'Orthopedic', 'finger pain': 'Orthopedic',
  
  // Skin
  'acne': 'Dermatologist', 'pimple': 'Dermatologist', 'eczema': 'Dermatologist',
  'psoriasis': 'Dermatologist', 'ringworm': 'Dermatologist', 'fungal': 'Dermatologist',
  'hair loss': 'Dermatologist', 'dandruff': 'Dermatologist', 'mole': 'Dermatologist',
  'melanoma': 'Dermatologist', 'skin rash': 'Dermatologist', 'itching': 'Dermatologist',
  'white patch': 'Dermatologist', 'dark spot': 'Dermatologist', 'vitiligo': 'Dermatologist',
  'urticaria': 'Dermatologist', 'warts': 'Dermatologist', 'scar': 'Dermatologist',
  'skin': 'Dermatologist', 'rash': 'Dermatologist',
  
  // Women
  'pregnancy': 'Gynecologist', 'pregnant': 'Gynecologist', 'period': 'Gynecologist',
  'menstrual': 'Gynecologist', 'pcos': 'Gynecologist', 'fibroids': 'Gynecologist',
  'menopause': 'Gynecologist', 'endometriosis': 'Gynecologist', 'infertility': 'Gynecologist',
  'ivf': 'Gynecologist', 'pap smear': 'Gynecologist', 'cervical': 'Gynecologist',
  'vaginal': 'Gynecologist', 'breast': 'Gynecologist', 'ovary': 'Gynecologist',
  'uterus': 'Gynecologist', 'hysterectomy': 'Gynecologist', 'c-section': 'Gynecologist',
  'women': 'Gynecologist',
  
  // Children
  'child': 'Pediatrician', 'baby': 'Pediatrician', 'infant': 'Pediatrician',
  'vaccination': 'Pediatrician', 'growth': 'Pediatrician', 'newborn': 'Pediatrician',
  'pediatric': 'Pediatrician', 'neonatal': 'Neonatologist', 'premature': 'Neonatologist',
  'kid': 'Pediatrician',
  
  // Stomach & Digestion
  'acidity': 'Gastroenterologist', 'gas': 'Gastroenterologist', 'bloating': 'Gastroenterologist',
  'constipation': 'Gastroenterologist', 'diarrhea': 'Gastroenterologist', 'jaundice': 'Gastroenterologist',
  'hepatitis': 'Gastroenterologist', 'ulcer': 'Gastroenterologist', 'hernia': 'Gastroenterologist',
  'appendicitis': 'Gastroenterologist', 'gallstones': 'Gastroenterologist', 'ibs': 'Gastroenterologist',
  'fatty liver': 'Gastroenterologist', 'cirrhosis': 'Gastroenterologist', 'gerd': 'Gastroenterologist',
  'stomach pain': 'Gastroenterologist', 'nausea': 'Gastroenterologist', 'vomiting': 'Gastroenterologist',
  'digestion': 'Gastroenterologist', 'liver': 'Gastroenterologist', 'pancreas': 'Gastroenterologist',
  'colon': 'Gastroenterologist', 'endoscopy': 'Gastroenterologist', 'colonoscopy': 'Gastroenterologist',
  'stomach': 'Gastroenterologist',
  
  // Lungs & Breathing
  'asthma': 'Pulmonologist', 'wheezing': 'Pulmonologist', 'bronchitis': 'Pulmonologist',
  'pneumonia': 'Pulmonologist', 'tuberculosis': 'Pulmonologist', 'tb': 'Pulmonologist',
  'copd': 'Pulmonologist', 'breathing': 'Pulmonologist', 'lung': 'Pulmonologist',
  'sleep apnea': 'Sleep Specialist', 'snoring': 'Sleep Specialist', 'insomnia': 'Sleep Specialist',
  'phlegm': 'Pulmonologist', 'chest congestion': 'Pulmonologist', 'respiratory': 'Pulmonologist',
  
  // Diabetes & Hormones
  'diabetes': 'Endocrinologist', 'sugar': 'Endocrinologist', 'thyroid': 'Endocrinologist',
  'weight gain': 'Endocrinologist', 'weight loss': 'Endocrinologist', 'obesity': 'Endocrinologist',
  'hba1c': 'Endocrinologist', 'glucose': 'Endocrinologist', 'insulin': 'Endocrinologist',
  'hormone': 'Endocrinologist', 'metabolism': 'Endocrinologist', 'goiter': 'Endocrinologist',
  
  // Kidney & Urinary
  'kidney stone': 'Urologist', 'urine': 'Urologist', 'burning urination': 'Urologist',
  'frequent urination': 'Urologist', 'prostate': 'Urologist', 'bladder': 'Urologist',
  'dialysis': 'Nephrologist', 'renal': 'Nephrologist', 'kidney failure': 'Nephrologist',
  'nephritis': 'Nephrologist', 'ckd': 'Nephrologist', 'creatinine': 'Nephrologist',
  'uti': 'Urologist', 'blood in urine': 'Urologist', 'incontinence': 'Urologist',
  'kidney': 'Nephrologist',
  
  // Eye
  'cataract': 'Ophthalmologist', 'glaucoma': 'Ophthalmologist', 'vision': 'Ophthalmologist',
  'blurry': 'Ophthalmologist', 'eye pain': 'Ophthalmologist', 'red eye': 'Ophthalmologist',
  'conjunctivitis': 'Ophthalmologist', 'lasik': 'Ophthalmologist', 'refraction': 'Ophthalmologist',
  'double vision': 'Ophthalmologist', 'dry eye': 'Ophthalmologist', 'retina': 'Ophthalmologist',
  'eye': 'Ophthalmologist',
  
  // ENT
  'ear pain': 'ENT Specialist', 'hearing': 'ENT Specialist', 'tinnitus': 'ENT Specialist',
  'sinus': 'ENT Specialist', 'tonsils': 'ENT Specialist', 'vertigo': 'ENT Specialist',
  'dizziness': 'ENT Specialist', 'nose bleed': 'ENT Specialist', 'ear discharge': 'ENT Specialist',
  'hoarseness': 'ENT Specialist', 'voice': 'ENT Specialist', 'adenoids': 'ENT Specialist',
  'ear': 'ENT Specialist', 'nose': 'ENT Specialist',
  
  // Dental
  'tooth': 'Dentist', 'teeth': 'Dentist', 'gum': 'Dentist', 'cavity': 'Dentist',
  'dental': 'Dentist', 'braces': 'Dentist', 'root canal': 'Dentist', 'wisdom tooth': 'Dentist',
  'jaw pain': 'Dentist', 'mouth ulcer': 'Dentist', 'bleeding gum': 'Dentist',
  'jaw': 'Dentist', 'mouth': 'Dentist',
  
  // Mental Health
  'anxiety': 'Psychiatrist', 'depression': 'Psychiatrist', 'stress': 'Psychiatrist',
  'insomnia': 'Psychiatrist', 'panic': 'Psychiatrist', 'ocd': 'Psychiatrist',
  'bipolar': 'Psychiatrist', 'schizophrenia': 'Psychiatrist', 'ptsd': 'Psychiatrist',
  'mood': 'Psychiatrist', 'phobia': 'Psychiatrist', 'eating disorder': 'Psychiatrist',
  'addiction': 'Addiction Psychiatrist', 'alcohol': 'Addiction Psychiatrist',
  'smoking': 'Addiction Psychiatrist', 'drug': 'Addiction Psychiatrist',
  'deaddiction': 'Addiction Psychiatrist', 'substance': 'Addiction Psychiatrist',
  
  // Cancer
  'cancer': 'Oncologist', 'tumor': 'Oncologist', 'lump': 'Oncologist',
  'chemotherapy': 'Oncologist', 'radiation': 'Oncologist', 'malignancy': 'Oncologist',
  'metastasis': 'Oncologist', 'biopsy': 'Oncologist', 'mammogram': 'Oncologist',
  
  // Blood
  'anemia': 'Hematologist', 'blood disorder': 'Hematologist', 'clotting': 'Hematologist',
  'leukemia': 'Hematologist', 'lymphoma': 'Hematologist', 'myeloma': 'Hematologist',
  'hemoglobin': 'Hematologist', 'platelet': 'Hematologist', 'thalassemia': 'Hematologist',
  'blood': 'Hematologist',
  
  // Infections
  'dengue': 'Infectious Disease', 'malaria': 'Infectious Disease', 'typhoid': 'Infectious Disease',
  'covid': 'Infectious Disease', 'chickenpox': 'Infectious Disease', 'hiv': 'Infectious Disease',
  'herpes': 'Infectious Disease', 'meningitis': 'Infectious Disease', 'sepsis': 'Infectious Disease',
  'chikungunya': 'Infectious Disease', 'leptospirosis': 'Infectious Disease',
  
  // Rheumatology
  'rheumatoid': 'Rheumatologist', 'lupus': 'Rheumatologist', 'fibromyalgia': 'Rheumatologist',
  'autoimmune': 'Rheumatologist', 'scleroderma': 'Rheumatologist', 'vasculitis': 'Rheumatologist',
  
  // Surgery
  'surgery': 'General Surgeon', 'appendicitis surgery': 'General Surgeon',
  'gallbladder removal': 'General Surgeon', 'hernia repair': 'General Surgeon',
  'thyroid surgery': 'General Surgeon', 'lipoma': 'General Surgeon',
  'plastic': 'Plastic Surgeon', 'cosmetic': 'Plastic Surgeon', 'liposuction': 'Plastic Surgeon',
  'rhinoplasty': 'Plastic Surgeon', 'facelift': 'Plastic Surgeon',
  
  // Other Specialties
  'diet': 'Nutritionist', 'nutrition': 'Nutritionist', 'weight loss diet': 'Nutritionist',
  'vitamin': 'Nutritionist', 'supplement': 'Nutritionist', 'meal plan': 'Nutritionist',
  'physiotherapy': 'Physiotherapist', 'rehab': 'Physiotherapist', 'physio': 'Physiotherapist',
  'sports injury': 'Sports Medicine', 'sprain': 'Sports Medicine', 'strain': 'Sports Medicine',
  'ayurveda': 'Ayurvedic Doctor', 'panchakarma': 'Ayurvedic Doctor', 'herbs': 'Ayurvedic Doctor',
  'homeopathy': 'Homeopathic Doctor', 'natural': 'Homeopathic Doctor',
  'sex': 'Sexologist', 'std': 'Sexologist', 'erectile': 'Sexologist', 'impotence': 'Sexologist',
  'xray': 'Radiologist', 'mri': 'Radiologist', 'ct scan': 'Radiologist',
  'ultrasound': 'Radiologist', 'imaging': 'Radiologist', 'mammography': 'Radiologist',
  'elderly': 'Geriatrician', 'dementia': 'Geriatrician', 'aging': 'Geriatrician',
  'speech': 'Speech Therapist', 'stammering': 'Speech Therapist', 'stuttering': 'Speech Therapist',
  'lab test': 'Pathologist', 'blood test': 'Pathologist', 'pathology': 'Pathologist',
  'occupational therapy': 'Occupational Therapist', 'disability': 'Occupational Therapist',
  'chiropractic': 'Chiropractor', 'posture': 'Chiropractor', 'spine alignment': 'Chiropractor',
  'chronic pain': 'Pain Management', 'nerve pain': 'Pain Management',
};

const DoctorSearch = () => {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiDetecting, setAiDetecting] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const urlQ = searchParams.get('q') || '';
  const urlSpecialty = searchParams.get('specialty') || '';

  // ============================================
  // Find specialty from keyword map (with partial matching)
  // ============================================
  const findSpecialtyFromKeyword = (query) => {
    if (!query) return '';
    const qLower = query.toLowerCase();
    const words = qLower.split(/\s+/);
    let bestMatch = '';
    let bestLen = 0;

    for (const word of words) {
      if (word.length < 3) continue;
      for (const [keyword, specialty] of Object.entries(DISEASE_SPECIALTY_MAP)) {
        if (keyword.includes(word) || word.includes(keyword)) {
          if (keyword.length > bestLen) {
            bestMatch = specialty;
            bestLen = keyword.length;
          }
        }
      }
    }
    return bestMatch;
  };

  // ============================================
  // AI fallback for unknown words
  // ============================================
  const detectSpecialtyFromAI = async (query) => {
    if (!query || query.trim().length < 3) return '';
    setAiDetecting(true);
    try {
      const res = await api.post('/online-doctor/triage', { 
        symptoms: `Patient problem: ${query}. What ONE medical specialist should treat this? Reply with specialty name only.` 
      });
      if (res.data?.success && res.data?.data?.specialty) {
        return res.data.data.specialty;
      }
    } catch (err) {
      console.log('AI detection skipped');
    } finally {
      setAiDetecting(false);
    }
    return '';
  };

  // ============================================
  // Initialize search from URL params
  // ============================================
  const [detectedSpecialty, setDetectedSpecialty] = useState(urlSpecialty);
  const [resultInfo, setResultInfo] = useState('');

useEffect(() => {
    const initSearch = async () => {
      let specialty = urlSpecialty;

      if (urlQ && !urlSpecialty) {
        // Try keyword map first (instant)
        specialty = findSpecialtyFromKeyword(urlQ);

        // ALWAYS verify with AI for better accuracy
        const aiSpecialty = await detectSpecialtyFromAI(urlQ);
        if (aiSpecialty) {
          specialty = aiSpecialty; // AI overrides keyword map
        }

        if (specialty) {
          setResultInfo(`Showing ${specialty}s for "${urlQ}"`);
        } else {
          setResultInfo(`Search results for "${urlQ}"`);
        }
      } else if (urlSpecialty) {
        setResultInfo(`Showing ${urlSpecialty}s`);
      }

      setDetectedSpecialty(specialty);
      setFilters(prev => ({
        ...prev,
        q: urlQ,
        specialty: specialty || ''
      }));
    };

    initSearch();
  }, [urlQ, urlSpecialty]);

  const [filters, setFilters] = useState({
    q: urlQ,
    specialty: detectedSpecialty || '',
    language: '',
    gender: '',
    minExperience: '',
    maxFee: '',
    minRating: '',
    available: searchParams.get('available') || '',
    sort: 'rating',
    page: 1,
  });

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.specialty) params.specialty = filters.specialty;
      if (filters.q) params.search = filters.q;
      if (filters.language) params.language = filters.language;
      if (filters.gender) params.gender = filters.gender;
      if (filters.minExperience) params.minExperience = filters.minExperience;
      if (filters.maxFee) params.maxFee = filters.maxFee;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.available) params.available = filters.available;
      if (filters.sort) params.sort = filters.sort;
      params.page = filters.page;
      params.limit = 10;

      const response = await searchOnlineDoctors(params);
      setDoctors(response.data?.data || []);
      setPagination(response.data?.pagination || { page: 1, total: 0, pages: 1 });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ q: '', specialty: '', language: '', gender: '', minExperience: '', maxFee: '', minRating: '', available: '', sort: 'rating', page: 1 });
    setResultInfo('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/online-doctor" className="text-blue-600 hover:underline text-sm">← Back</Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">Find a Doctor</h1>
          {resultInfo && (
            <p className="text-sm text-green-600 font-medium mt-1">
              {resultInfo}
              {aiDetecting && <span className="text-blue-500 ml-2">(AI analyzing...)</span>}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-20">
              <h3 className="font-bold text-gray-800 mb-4 flex justify-between">
                Filters
                <button onClick={clearFilters} className="text-blue-500 text-sm font-normal">Clear All</button>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Search</label>
                  <input type="text" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })} placeholder="Doctor name, disease..." className="w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Specialty</label>
                  <input type="text" value={filters.specialty} onChange={(e) => setFilters({ ...filters, specialty: e.target.value, page: 1 })} placeholder="e.g., Dermatologist" className="w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Language</label>
                  <select value={filters.language} onChange={(e) => setFilters({ ...filters, language: e.target.value, page: 1 })} className="w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none">
                    <option value="">All</option>
                    <option>Hindi</option><option>English</option><option>Tamil</option><option>Telugu</option>
                    <option>Bengali</option><option>Marathi</option><option>Gujarati</option><option>Kannada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                  <select value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value, page: 1 })} className="w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none">
                    <option value="">Any</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Max Fee (₹)</label>
                  <input type="number" value={filters.maxFee} onChange={(e) => setFilters({ ...filters, maxFee: e.target.value, page: 1 })} placeholder="e.g., 1000" className="w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Min Experience</label>
                  <input type="number" value={filters.minExperience} onChange={(e) => setFilters({ ...filters, minExperience: e.target.value, page: 1 })} placeholder="e.g., 5 years" className="w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none" />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={filters.available === 'true'} onChange={(e) => setFilters({ ...filters, available: e.target.checked ? 'true' : '', page: 1 })} className="w-4 h-4 text-blue-600" />
                  Available Now Only
                </label>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <p className="text-gray-600 font-medium">{pagination.total} doctor{pagination.total !== 1 ? 's' : ''} found</p>
              <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })} className="border-2 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-blue-400 focus:outline-none">
                <option value="rating">Sort: Highest Rated</option>
                <option value="fee_low">Sort: Fee (Low to High)</option>
                <option value="fee_high">Sort: Fee (High to Low)</option>
                <option value="experience">Sort: Most Experienced</option>
                <option value="reviews">Sort: Most Reviews</option>
              </select>
            </div>

            {loading || aiDetecting ? (
              <div className="text-center py-20">
                <div className="animate-spin text-6xl mb-4">⏳</div>
                <p className="text-gray-500">{aiDetecting ? 'AI analyzing your search...' : 'Searching best doctors for you...'}</p>
              </div>
            ) : doctors.length > 0 ? (
              <div className="space-y-4">
                {doctors.map((doctor) => (
                  <Link key={doctor._id} to={`/online-doctor/doctor/${doctor._id}`} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition block">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 mx-auto sm:mx-0">👨‍⚕️</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">Dr. {doctor.name}</h3>
                          <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">₹{doctor.consultationFee}</p>
                          <p className="text-xs text-gray-400">{doctor.consultationDuration} mins</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                        <span className="font-medium">{doctor.qualification}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{doctor.experience} yrs exp</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-yellow-500 font-bold">⭐ {doctor.ratingSummary?.averageRating || 'New'}</span>
                        <span className="text-gray-400">({doctor.ratingSummary?.totalReviews || 0})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {doctor.languages?.map((lang) => (
                          <span key={lang} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-medium">{lang}</span>
                        ))}
                      </div>
                      {doctor.hospitalAffiliation?.mentioned && (
                        <p className="text-sm text-gray-400 mt-2">🏥 {doctor.hospitalAffiliation.hospitalName}, {doctor.hospitalAffiliation.city}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg">No doctors found</p>
                <p className="text-gray-400">Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="mt-4 text-blue-600 hover:underline">Clear all filters</button>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setFilters({ ...filters, page })}
                    className={`w-10 h-10 rounded-xl font-medium transition ${
                      filters.page === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSearch;