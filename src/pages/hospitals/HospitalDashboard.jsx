import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import ProviderDashboardLayout from '../../components/ProviderDashboardLayout';
import ProviderStatsCards from '../../components/ProviderStatsCards';
import ProviderTable from '../../components/ProviderTable';
import { hospitalApi } from '../../services/providerApi';
import ProviderAuth from '../../components/ProviderAuth';
import CorporatePlansTab from '../../components/CorporatePlansTab';
import api from '../../services/api';

const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY || '';

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [profile, setProfile] = useState(null);

  // Bed form
  const [bedForm, setBedForm] = useState({
  total: '', available: '',
  general_ward: '', twin_sharing: '', single_room: '', deluxe: '',
  super_deluxe: '', suite: '', maternity: '', post_op: '',
  icu_available: '', ventilator_available: '', nicu_beds: '', picu_beds: '', hdu_beds: '',
  emergency_beds: '', isolation_beds: '', day_care_beds: ''
});

  // OPD Pricing
  const [opdPricing, setOpdPricing] = useState({
    general: '', specialist: '', super_specialist: '',
    emergency: '', follow_up: '', online: ''
  });

  // IPD Pricing
  const [ipdPricing, setIpdPricing] = useState({
    general_ward: '', semi_private: '', private_room: '', deluxe: '',
    super_deluxe: '', suite: '', icu: '', icu_ventilator: '',
    nicu: '', picu: '', hdu: '', isolation: '', day_care: ''
  });

  // Location
  const [location, setLocation] = useState({ lat: '', lng: '', address: '' });
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });

  // Online Services
  const [onlineServices, setOnlineServices] = useState({
    enabled: false, consultation_fee: '', follow_up_fee: '',
    emergency_fee: '', video_consult: true, chat_consult: false
  });

  // Accreditations
  const [accreditations, setAccreditations] = useState([]);
  const [accreditationForm, setAccreditationForm] = useState({
    type: 'NABH', certificate_number: '', valid_until: '', issuing_body: ''
  });

  // Gallery
  const [gallery, setGallery] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Documents
  const [documents, setDocuments] = useState([]);

  // Lab Catalog
  const [labTests, setLabTests] = useState([]);
  const [labSearch, setLabSearch] = useState('');
  const [labCategory, setLabCategory] = useState('All');
  const [labCategories, setLabCategories] = useState([]);

  // Schemes & Insurance
  const [schemesForm, setSchemesForm] = useState({
    schemes_accepted: [], insurance_accepted: [],
    cashless_available: false, tpa_desk_available: false,
    reimbursement_accepted: true, emi_available: false
  });

  // Forms visibility
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    name: '', specialization: '', qualification: '', experience: '',
    consultation_fee: '', languages: '', gender: 'Male',
    availability_days: '', morning_slots: '', evening_slots: '', max_patients: '20'
  });

  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [facilitiesList, setFacilitiesList] = useState([]);
  const [facilityForm, setFacilityForm] = useState({ name: '', category: '', available_24x7: false, description: '' });
  const [showFacilityForm, setShowFacilityForm] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [medicalMasterData, setMedicalMasterData] = useState({ specialties: [], diseases: {}, procedures: [] });
  const [healthPackages, setHealthPackages] = useState([]);
  const [packageForm, setPackageForm] = useState({
    name: '', included_tests: '', price: '', discount: '', for_gender: 'All', valid_days: '365'
  });
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [ambulanceFleet, setAmbulanceFleet] = useState([]);
  const [ambulanceForm, setAmbulanceForm] = useState({
    vehicle_number: '', type: 'basic', driver_name: '', driver_phone: '',
    base_fare: '', per_km: '', available_24x7: true
  });
  const [showAmbulanceForm, setShowAmbulanceForm] = useState(false);
  const [quickBedStatus, setQuickBedStatus] = useState('');

  const providerId = localStorage.getItem('providerId');

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'beds', label: 'Bed Management', icon: '🛏️' },
    { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { id: 'specialties', label: 'Specialties', icon: '🔬' },
    { id: 'diseases', label: 'Diseases', icon: '🦠' },
    { id: 'facilities', label: 'Facilities', icon: '🏗️' },
    { id: 'labcatalog', label: 'Lab Catalog', icon: '🧪' },
    { id: 'packages', label: 'Packages', icon: '📦' },
    { id: 'opdpricing', label: 'OPD Pricing', icon: '💵' },
    { id: 'ipdpricing', label: 'IPD Pricing', icon: '💰' },
    { id: 'ambulance', label: 'Ambulance', icon: '🚑' },
    { id: 'schemes', label: 'Schemes', icon: '💠' },
    { id: 'insurance', label: 'Insurance', icon: '🛡️' },
    { id: 'accreditations', label: 'Accreditations', icon: '🏅' },
    { id: 'onlineservices', label: 'Online Services', icon: '🌐' },
    { id: 'location', label: 'Location', icon: '📍' },
    { id: 'gallery', label: 'Gallery', icon: '🖼️' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'corporate', label: 'Corporate Plans', icon: '🏢' },
    { id: 'upload', label: 'Bulk Upload', icon: '📤' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  // ... PART 2 continues with useEffect and handlers
  useEffect(() => { loadData(); fetchMedicalMasterData(); fetchLabCatalog(); }, [activeTab]);

  const fetchMedicalMasterData = async () => {
    try { const r = await api.get('/hospitals/medical-data'); if (r.data?.data) setMedicalMasterData(r.data.data); } catch(e) {}
  };

  const fetchLabCatalog = async () => {
    try {
      const r = await api.get('/diagnostics/tests/master');
      if (r.data?.data) {
        setLabTests(r.data.data);
        const cats = [...new Set(r.data.data.map(t => t.main_category))];
        setLabCategories(cats);
      }
    } catch(e) {}
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (!localStorage.getItem('providerToken')) { navigate('/hospital/login'); return; }
      const pr = await hospitalApi.getProfile();
      const p = pr.data.data;
      setProfile(p);

      if (activeTab === 'dashboard') {
        try { const sr = await api.get(`/hospitals/provider/${providerId}/stats`); setStats(sr.data.data); } catch(e) {}
        try { const br = await api.get(`/hospitals/provider/${providerId}/bookings?limit=5`); setBookings(br.data.data || []); } catch(e) {}
      }
      if (activeTab === 'doctors') {
        try { const dr = await api.get(`/hospitals/provider/${providerId}/doctors`); setDoctors(dr.data.data || []); } catch(e) {}
      }
      if (activeTab === 'bookings') {
        try { const br = await api.get(`/hospitals/provider/${providerId}/bookings?limit=50`); setBookings(br.data.data || []); } catch(e) {}
      }

      // Load saved data
      if (p?.beds) setBedForm({
  	total: p.beds.total || '', available: p.beds.available || '',
  	general_ward: p.beds.general_ward || '', twin_sharing: p.beds.twin_sharing || '',
  	single_room: p.beds.single_room || '', deluxe: p.beds.deluxe || '',
  	super_deluxe: p.beds.super_deluxe || '', suite: p.beds.suite || '',
  	maternity: p.beds.maternity || '', post_op: p.beds.post_op || '',
  	icu_available: p.beds.icu_available || '', ventilator_available: p.beds.ventilator_available || '',
  	nicu_beds: p.beds.nicu_beds || '', picu_beds: p.beds.picu_beds || '',
  	hdu_beds: p.beds.hdu_beds || '',
 	emergency_beds: p.beds.emergency_beds || '', isolation_beds: p.beds.isolation_beds || '',
  	day_care_beds: p.beds.day_care_beds || ''
      });
      if (p?.opd_pricing) setOpdPricing(p.opd_pricing);
      if (p?.ipd_pricing) setIpdPricing(p.ipd_pricing);
      if (p?.location) {
        setLocation({ lat: p.location.lat || '', lng: p.location.lng || '', address: p.location.address || '' });
        if (p.location.lat && p.location.lng) setMapCenter({ lat: p.location.lat, lng: p.location.lng });
      }
      if (p?.online_services) setOnlineServices(p.online_services);
      if (p?.accreditations) setAccreditations(p.accreditations);
      if (p?.gallery) setGallery(p.gallery);
      if (p?.documents) setDocuments(p.documents);
      if (p?.specialties) setSelectedSpecialties(p.specialties);
      if (p?.diseases_treated) setSelectedDiseases(p.diseases_treated);
      if (p?.procedures_available) setSelectedProcedures(p.procedures_available);
      if (p?.facilities) setFacilitiesList(p.facilities);
      if (p?.health_packages) setHealthPackages(p.health_packages);
      if (p?.ambulance_fleet) setAmbulanceFleet(p.ambulance_fleet);
      setSchemesForm({
        schemes_accepted: p?.schemes_accepted || [],
        insurance_accepted: p?.insurance_accepted || [],
        cashless_available: p?.cashless_available || false,
        tpa_desk_available: p?.tpa_desk_available || false,
        reimbursement_accepted: p?.reimbursement_accepted !== false,
        emi_available: p?.emi_available || false
      });
    } catch(e) {
      if (e.response?.status === 401) { localStorage.clear(); navigate('/hospital/login'); }
    } finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/hospital/login'); };

  // Save helper
  const saveProfile = async (data) => {
    try {
      const token = localStorage.getItem('providerToken');
      await api.put('/hospitals/provider/profile', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Saved successfully');
      loadData();
    } catch(e) { alert('❌ Failed to save'); }
  };

  // Bed handlers
  const handleBedUpdate = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('providerToken');
  const providerId = localStorage.getItem('providerId');
  try {
    await api.put(`/hospitals/provider/${providerId}/beds`, 
      { beds: bedForm, updateMethod: 'web_portal' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert('✅ Beds updated successfully');
    loadData();
  } catch(e) {
    alert('❌ Failed to update beds');
  }
};
  const quickUpdate = async (preset) => {
  const presets = {
    almost_full: { available: 5, icu_available: 2, ventilator_available: 1, emergency_beds: 1, general_ward: 0 },
    half: { available: 25, icu_available: 8, ventilator_available: 4, emergency_beds: 5, general_ward: 10 },
    mostly: { available: 50, icu_available: 15, ventilator_available: 8, emergency_beds: 10, general_ward: 30 }
    };
    try {
      await api.put(`/hospitals/provider/${providerId}/beds`, { beds: presets[preset], updateMethod: 'web_portal' });
      setQuickBedStatus('✅ Updated!');
      setTimeout(() => setQuickBedStatus(''), 3000);
      loadData();
    } catch(e) {}
  };

  /// Doctor handlers
const handleAddDoctor = async (e) => {
    e.preventDefault();
    const d = {
      name: doctorForm.name, specialization: doctorForm.specialization,
      qualification: doctorForm.qualification, experience: doctorForm.experience,
      consultation_fee: parseFloat(doctorForm.consultation_fee) || 0,
      languages: doctorForm.languages.split(',').map(l => l.trim()).filter(Boolean),
      gender: doctorForm.gender,
      availability_days: doctorForm.availability_days,
      morning_slots: doctorForm.morning_slots,
      evening_slots: doctorForm.evening_slots,
      max_patients_per_day: parseInt(doctorForm.max_patients) || 20
    };
    const token = localStorage.getItem('providerToken');
    try {
      if (editingDoctor) {
        await api.put(`/hospitals/provider/doctors/${editingDoctor._id}`, d, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('✅ Doctor updated successfully');
      } else {
        await api.post('/hospitals/provider/doctors', d, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('✅ Doctor added successfully');
      }
      setShowDoctorForm(false);
      setEditingDoctor(null);
      setDoctorForm({ name: '', specialization: '', qualification: '', experience: '', consultation_fee: '', languages: '', gender: 'Male', availability_days: '', morning_slots: '', evening_slots: '', max_patients: '20' });
      loadData();
    } catch(e) {
      alert('❌ Failed to save doctor');
    }
};

const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      const token = localStorage.getItem('providerToken');
      await api.delete(`/hospitals/provider/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadData();
    } catch(e) {}
};

  // Lab test pricing handler
  const updateLabPrice = async (testId, field, value) => {
    setLabTests(prev => prev.map(t => t._id === testId ? { ...t, [field]: value } : t));
  };

  const saveLabPrices = async () => {
    const priced = labTests.filter(t => t.hospital_price).map(t => ({
      test_id: t._id, price: t.hospital_price,
      home_collection: t.home_collection || false,
      fasting_required: t.fasting_required || false
    }));
    try {
      await api.put(`/hospitals/provider/${providerId}/lab-prices`, { tests: priced });
      alert(`✅ ${priced.length} test prices saved`);
    } catch(e) { alert('❌ Failed'); }
  };

  // Location handler
  const handleMapClick = useCallback((e) => {
    setLocation({ ...location, lat: e.latLng.lat(), lng: e.latLng.lng() });
  }, [location]);

  const saveLocation = () => saveProfile({ location });

  // Gallery handlers
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('type', 'gallery');
      const r = await api.post(`/hospitals/provider/${providerId}/upload-image`, fd);
      setGallery([...gallery, r.data.url]);
    } catch(e) { alert('Upload failed'); }
    finally { setUploadingImage(false); }
  };

  const removeImage = (index) => {
    setGallery(gallery.filter((_, i) => i !== index));
    saveProfile({ gallery: gallery.filter((_, i) => i !== index) });
  };

  // Document handlers
  const handleDocUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('type', type);
      const r = await api.post(`/hospitals/provider/${providerId}/upload-document`, fd);
      setDocuments([...documents.filter(d => d.type !== type), { type, name: type, url: r.data.url }]);
    } catch(e) { alert('Upload failed'); }
  };

  // Accreditation
  const addAccreditation = () => {
    if (!accreditationForm.certificate_number) return;
    setAccreditations([...accreditations, { ...accreditationForm }]);
    setAccreditationForm({ type: 'NABH', certificate_number: '', valid_until: '', issuing_body: '' });
  };
  const saveAccreditations = () => saveProfile({ accreditations });

  // Schemes
  const toggleScheme = (v) => {
    setSchemesForm(prev => ({
      ...prev,
      schemes_accepted: prev.schemes_accepted.includes(v)
        ? prev.schemes_accepted.filter(x => x !== v)
        : [...prev.schemes_accepted, v]
    }));
  };
  const toggleInsurance = (v) => {
    setSchemesForm(prev => ({
      ...prev,
      insurance_accepted: prev.insurance_accepted.includes(v)
        ? prev.insurance_accepted.filter(x => x !== v)
        : [...prev.insurance_accepted, v]
    }));
  };
  const saveSchemes = () => saveProfile(schemesForm);

  // Packages
  const addPackage = () => {
    if (!packageForm.name) return;
    setHealthPackages([...healthPackages, {
      ...packageForm,
      price: parseInt(packageForm.price) || 0,
      discount: parseInt(packageForm.discount) || 0,
      included_tests: packageForm.included_tests.split(',').map(t => t.trim()).filter(Boolean)
    }]);
    setPackageForm({ name: '', included_tests: '', price: '', discount: '', for_gender: 'All', valid_days: '365' });
    setShowPackageForm(false);
  };
  const savePackages = () => saveProfile({ health_packages: healthPackages });

  // Ambulance
  const addAmbulance = () => {
    if (!ambulanceForm.vehicle_number) return;
    setAmbulanceFleet([...ambulanceFleet, { ...ambulanceForm, base_fare: parseInt(ambulanceForm.base_fare) || 0, per_km: parseInt(ambulanceForm.per_km) || 0 }]);
    setAmbulanceForm({ vehicle_number: '', type: 'basic', driver_name: '', driver_phone: '', base_fare: '', per_km: '', available_24x7: true });
    setShowAmbulanceForm(false);
  };
  const saveAmbulance = () => saveProfile({ ambulance_fleet: ambulanceFleet });

  // Facilities
  const addFacility = () => {
    if (!facilityForm.name) return;
    setFacilitiesList([...facilitiesList, { ...facilityForm }]);
    setFacilityForm({ name: '', category: '', available_24x7: false, description: '' });
    setShowFacilityForm(false);
  };
  const saveFacilities = () => saveProfile({ facilities: facilitiesList });

  // Online Services
  const saveOnlineServices = () => saveProfile({ online_services: onlineServices });

  // Excel upload
  const handleMasterUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setLoading(true);
    try {
      const fd = new FormData(); fd.append('file', uploadFile);
      const r = await api.post(`/hospitals/provider/${providerId}/upload-master`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadMessage(`✅ ${r.data.message}`);
      setUploadFile(null);
      setTimeout(() => { setUploadMessage(''); loadData(); }, 3000);
    } catch(e) { setUploadMessage('❌ Upload failed'); }
    finally { setLoading(false); }
  };

  const handleDownloadTemplate = () => {
    window.open(`${api.defaults.baseURL}/hospitals/provider/${providerId}/template/master/download`, '_blank');
  };

  const availableSchemes = [
    { value: 'ayushman', label: 'Ayushman Bharat (PM-JAY)' },
    { value: 'cghs', label: 'CGHS' }, { value: 'esi', label: 'ESI' },
    { value: 'echs', label: 'ECHS' }, { value: 'state_scheme', label: 'State Health Scheme' }
  ];
  const commonInsurances = [
    'Star Health', 'ICICI Lombard', 'HDFC Ergo', 'Bajaj Allianz', 'Max Bupa',
    'Religare Care', 'New India Assurance', 'Oriental Insurance', 'United India Insurance',
    'Aditya Birla Health', 'ManipalCigna', 'Digit Health', 'SBI General', 'Tata AIG'
  ];
  const accreditationTypes = ['NABH', 'JCI', 'NABL', 'ISO 9001', 'ISO 15189', 'NABH Nursing Excellence'];

  const specialtyOptions = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Gastroenterology',
    'Nephrology', 'Urology', 'Pulmonology', 'Endocrinology', 'Dermatology',
    'ENT', 'Ophthalmology', 'Psychiatry', 'Pediatrics', 'Gynecology',
    'Neonatology', 'Plastic Surgery', 'Dental', 'Physiotherapy', 'Emergency Medicine'
  ];

  const btn = { padding: '0.5rem 1rem', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 'bold', marginRight: '0.5rem' };
  const btnGreen = { ...btn, backgroundColor: '#10b981' };
  const btnRed = { ...btn, backgroundColor: '#ef4444' };
  const btnGray = { ...btn, backgroundColor: '#6b7280' };
  const del = { padding: '0.25rem 0.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' };
  const inp = { width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', marginBottom: '0.5rem', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontWeight: '600', fontSize: '0.8rem', marginBottom: '0.25rem', color: '#374151' };

  // ... PART 3 continues with renderContent
  const renderContent = () => {
    switch(activeTab) {
      // ============================================
      // DASHBOARD
      // ============================================
      case 'dashboard': return (
        <div>
          <ProviderStatsCards stats={stats} />
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '1.5rem', margin: '1rem 0' }}>
            <h3>⚡ Quick Bed Update</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button onClick={() => quickUpdate('almost_full')} style={{ padding: '0.5rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', cursor: 'pointer' }}>🔴 Almost Full</button>
              <button onClick={() => quickUpdate('half')} style={{ padding: '0.5rem 1rem', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '0.5rem', cursor: 'pointer' }}>🟡 Half</button>
              <button onClick={() => quickUpdate('mostly')} style={{ padding: '0.5rem 1rem', backgroundColor: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '0.5rem', cursor: 'pointer' }}>🟢 Mostly Available</button>
            </div>
            {quickBedStatus && <p style={{ color: '#10b981', marginTop: '0.5rem' }}>{quickBedStatus}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <h3>📋 Recent Bookings</h3>
              {bookings.length === 0 ? <p style={{ color: '#888' }}>No bookings</p> :
                bookings.slice(0, 5).map((b, i) => (
                  <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                    <strong>{b.patientName || 'Patient'}</strong> - <span style={{ color: b.status === 'confirmed' ? '#10b981' : '#f59e0b' }}>{b.status}</span>
                  </div>
                ))
              }
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <h3>⚡ Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {['beds','doctors','labcatalog','opdpricing','ipdpricing','location','gallery','upload'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} style={btn}>{sidebarItems.find(s => s.id === t)?.icon} {sidebarItems.find(s => s.id === t)?.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

      // ============================================
      // BED MANAGEMENT
      // ============================================
      // REPLACE the entire 'beds' case in HospitalDashboard.jsx

case 'beds': return (
  <div>
    <h2>🛏️ Bed Management</h2>
    <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
      <strong>WhatsApp update format:</strong> <code>BEDS 350 AVL 45 ICU 12 VENT 5 ER OPEN</code>
    </div>
    <form onSubmit={handleBedUpdate}>
      
      {/* General Beds */}
      <h3 style={{ marginBottom: '0.75rem', color: '#1a237e' }}>🏨 General Beds</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          ['Total Beds', 'total'],
          ['Available', 'available'],
          ['General Ward', 'general_ward'],
          ['Twin Sharing', 'twin_sharing'],
          ['Single Room', 'single_room'],
          ['Deluxe', 'deluxe'],
          ['Super Deluxe', 'super_deluxe'],
          ['Suite', 'suite'],
          ['Maternity', 'maternity'],
          ['Post-Op', 'post_op']
        ].map(([label, key]) => (
          <div key={key}>
            <label style={labelStyle}>{label}</label>
            <input type="number" value={bedForm[key] || ''} onChange={e => setBedForm({...bedForm, [key]: e.target.value})} style={inp} min="0" />
          </div>
        ))}
      </div>

      {/* Critical Care */}
      <h3 style={{ marginBottom: '0.75rem', color: '#c62828' }}>🫀 Critical Care</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          ['ICU', 'icu_available'],
          ['ICU + Ventilator', 'ventilator_available'],
          ['NICU', 'nicu_beds'],
          ['PICU', 'picu_beds'],
          ['HDU', 'hdu_beds']
        ].map(([label, key]) => (
          <div key={key}>
            <label style={labelStyle}>{label}</label>
            <input type="number" value={bedForm[key] || ''} onChange={e => setBedForm({...bedForm, [key]: e.target.value})} style={inp} min="0" />
          </div>
        ))}
      </div>

      {/* Special Purpose */}
      <h3 style={{ marginBottom: '0.75rem', color: '#e65100' }}>🏥 Special Purpose</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          ['Emergency', 'emergency_beds'],
          ['Isolation', 'isolation_beds'],
          ['Day Care', 'day_care_beds']
        ].map(([label, key]) => (
          <div key={key}>
            <label style={labelStyle}>{label}</label>
            <input type="number" value={bedForm[key] || ''} onChange={e => setBedForm({...bedForm, [key]: e.target.value})} style={inp} min="0" />
          </div>
        ))}
      </div>

      <button type="submit" style={{ marginTop: '1rem', ...btnGreen, padding: '0.75rem 2rem', fontSize: '1rem' }}>💾 Update All Beds</button>
    </form>
  </div>
);

      // ============================================
      // DOCTORS
      // ============================================
      case 'doctors': return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2>👨‍⚕️ Doctors ({doctors.length})</h2>
            <div>
              <button onClick={handleDownloadTemplate} style={btnGray}>📥 Template</button>
              <button onClick={() => { setShowDoctorForm(true); setEditingDoctor(null); }} style={btnGreen}>➕ Add Doctor</button>
            </div>
          </div>
          {showDoctorForm && (
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              <form onSubmit={handleAddDoctor}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <input placeholder="Name *" value={doctorForm.name} onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} style={inp} required />
                  <input placeholder="Specialization *" value={doctorForm.specialization} onChange={e => setDoctorForm({...doctorForm, specialization: e.target.value})} style={inp} required />
                  <input placeholder="Qualification" value={doctorForm.qualification} onChange={e => setDoctorForm({...doctorForm, qualification: e.target.value})} style={inp} />
                  <input placeholder="Experience" value={doctorForm.experience} onChange={e => setDoctorForm({...doctorForm, experience: e.target.value})} style={inp} />
                  <input placeholder="Fee (₹)" type="number" value={doctorForm.consultation_fee} onChange={e => setDoctorForm({...doctorForm, consultation_fee: e.target.value})} style={inp} />
                  <input placeholder="Languages" value={doctorForm.languages} onChange={e => setDoctorForm({...doctorForm, languages: e.target.value})} style={inp} />
                  <select value={doctorForm.gender} onChange={e => setDoctorForm({...doctorForm, gender: e.target.value})} style={inp}>
                    <option>Male</option><option>Female</option>
                  </select>
                  <input placeholder="Days (Mon,Tue)" value={doctorForm.availability_days} onChange={e => setDoctorForm({...doctorForm, availability_days: e.target.value})} style={inp} />
                  <input placeholder="Morning (9AM-1PM)" value={doctorForm.morning_slots} onChange={e => setDoctorForm({...doctorForm, morning_slots: e.target.value})} style={inp} />
                  <input placeholder="Evening (5PM-8PM)" value={doctorForm.evening_slots} onChange={e => setDoctorForm({...doctorForm, evening_slots: e.target.value})} style={inp} />
                  <input placeholder="Max Patients" type="number" value={doctorForm.max_patients} onChange={e => setDoctorForm({...doctorForm, max_patients: e.target.value})} style={inp} />
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <button type="submit" style={btnGreen}>💾 Save</button>
                  <button type="button" onClick={() => setShowDoctorForm(false)} style={btnGray}>Cancel</button>
                </div>
              </form>
            </div>
          )}
          <ProviderTable
            columns={[{ key: 'name', label: 'Name' }, { key: 'specialization', label: 'Specialization' }, { key: 'consultation_fee', label: 'Fee' }, { key: 'experience', label: 'Exp' }]}
            data={doctors}
            onEdit={(r) => {
              setDoctorForm({
                name: r.name || '', specialization: r.specialization || '',
                qualification: r.qualification || '', experience: r.experience || '',
                consultation_fee: r.consultation_fee || '', languages: (r.languages || []).join(', '),
                gender: r.gender || 'Male', availability_days: (r.availability?.days || []).join(', '),
                morning_slots: r.availability?.morning_slots || '', evening_slots: r.availability?.evening_slots || '',
                max_patients: r.availability?.max_patients || '20'
              });
              setEditingDoctor(r); setShowDoctorForm(true);
            }}
            onDelete={(r) => handleDeleteDoctor(r._id)}
            loading={loading}
          />
        </div>
      );

      // ============================================
      // SPECIALTIES
      // ============================================
      case 'specialties': return (
        <div>
          <h2>🔬 Specialties ({selectedSpecialties.length})</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {specialtyOptions.map(s => (
              <span key={s} onClick={() => setSelectedSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '2rem', cursor: 'pointer', fontSize: '0.85rem',
                  backgroundColor: selectedSpecialties.includes(s) ? '#dbeafe' : '#f3f4f6',
                  border: selectedSpecialties.includes(s) ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  color: selectedSpecialties.includes(s) ? '#1e40af' : '#374151'
                }}>
                {selectedSpecialties.includes(s) ? '✅ ' : ''}{s}
              </span>
            ))}
          </div>
          <button onClick={() => saveProfile({ specialties: selectedSpecialties })} style={{ ...btnGreen, padding: '0.75rem 2rem' }}>💾 Save</button>
        </div>
      );

      // ============================================
      // DISEASES
      // ============================================
      case 'diseases': return (
        <div>
          <h2>🦠 Diseases & Procedures</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <h3>Diseases Treated</h3>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {Object.entries(medicalMasterData.diseases || {}).map(([cat, diseases]) => (
                  <div key={cat}>
                    <h4 style={{ color: '#e53935', fontSize: '0.85rem' }}>{cat}</h4>
                    {diseases.map(d => (
                      <label key={d.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0', cursor: 'pointer', fontSize: '0.8rem' }}>
                        <input type="checkbox" checked={selectedDiseases.includes(d.value)} onChange={() => setSelectedDiseases(prev => prev.includes(d.value) ? prev.filter(x => x !== d.value) : [...prev, d.value])} />
                        {d.label}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <h3>Procedures Available</h3>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {(medicalMasterData.procedures || []).map(p => (
                  <label key={p.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0', cursor: 'pointer', fontSize: '0.8rem' }}>
                    <input type="checkbox" checked={selectedProcedures.includes(p.value)} onChange={() => setSelectedProcedures(prev => prev.includes(p.value) ? prev.filter(x => x !== p.value) : [...prev, p.value])} />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => saveProfile({ diseases_treated: selectedDiseases, procedures_available: selectedProcedures })} style={{ marginTop: '1rem', ...btnGreen, padding: '0.75rem 2rem' }}>💾 Save</button>
        </div>
      );

      // ============================================
      // FACILITIES
      // ============================================
      case 'facilities': return (
        <div>
          <h2>🏗️ Facilities ({facilitiesList.length})</h2>
          <button onClick={() => setShowFacilityForm(true)} style={{ ...btnGreen, marginBottom: '1rem' }}>+ Add Facility</button>
          {showFacilityForm && (
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              <input placeholder="Name *" value={facilityForm.name} onChange={e => setFacilityForm({...facilityForm, name: e.target.value})} style={inp} />
              <input placeholder="Category" value={facilityForm.category} onChange={e => setFacilityForm({...facilityForm, category: e.target.value})} style={inp} />
              <input placeholder="Description" value={facilityForm.description} onChange={e => setFacilityForm({...facilityForm, description: e.target.value})} style={inp} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={facilityForm.available_24x7} onChange={e => setFacilityForm({...facilityForm, available_24x7: e.target.checked})} /> 24x7 Available
              </label>
              <div style={{ marginTop: '0.5rem' }}>
                <button onClick={addFacility} style={btnGreen}>Add</button>
                <button onClick={() => setShowFacilityForm(false)} style={btnGray}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem' }}>
            {facilitiesList.length === 0 ? <p style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No facilities</p> :
              facilitiesList.map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid #eee' }}>
                  <div><strong>{f.name}</strong> {f.category && <span style={{ fontSize: '0.8rem', color: '#888' }}>({f.category})</span>} {f.available_24x7 && '🕐24x7'}</div>
                  <button onClick={() => setFacilitiesList(facilitiesList.filter((_, idx) => idx !== i))} style={del}>✕</button>
                </div>
              ))
            }
          </div>
          <button onClick={saveFacilities} style={{ marginTop: '1rem', ...btnGreen, padding: '0.75rem 2rem' }}>💾 Save</button>
        </div>
      );

      // ============================================
      // LAB CATALOG (1624 tests)
      // ============================================
      case 'labcatalog': return (
        <div>
          <h2>🧪 Lab Test Catalog ({labTests.length} tests)</h2>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>Enter your hospital price for each test. Leave blank to skip.</p>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input placeholder="Search test..." value={labSearch} onChange={e => setLabSearch(e.target.value)}
              style={{ ...inp, width: '300px', marginBottom: 0 }} />
            <select value={labCategory} onChange={e => setLabCategory(e.target.value)} style={{ ...inp, width: '200px', marginBottom: 0 }}>
              <option value="All">All Categories</option>
              {labCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={saveLabPrices} style={{ ...btnGreen, padding: '0.6rem 1.5rem' }}>💾 Save All Prices</button>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', overflow: 'auto', maxHeight: '500px' }}>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Test Name</th>
                  <th style={{ padding: '10px' }}>Category</th>
                  <th style={{ padding: '10px' }}>Sub Category</th>
                  <th style={{ padding: '10px', width: '120px' }}>Your Price (₹)</th>
                  <th style={{ padding: '10px' }}>Home Collection</th>
                  <th style={{ padding: '10px' }}>Fasting</th>
                </tr>
              </thead>
              <tbody>
                {labTests
                  .filter(t => (labCategory === 'All' || t.main_category === labCategory) && (!labSearch || t.test_name?.toLowerCase().includes(labSearch.toLowerCase())))
                  .slice(0, 200)
                  .map(t => (
                    <tr key={t._id || t.test_code} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px' }}><strong>{t.test_name}</strong></td>
                      <td style={{ padding: '8px', textAlign: 'center', fontSize: '0.75rem' }}>{t.main_category}</td>
                      <td style={{ padding: '8px', textAlign: 'center', fontSize: '0.7rem', color: '#888' }}>{t.sub_category}</td>
                      <td style={{ padding: '4px' }}>
                        <input type="number" placeholder="₹" value={t.hospital_price || ''}
                          onChange={e => updateLabPrice(t._id, 'hospital_price', e.target.value)}
                          style={{ ...inp, marginBottom: 0, textAlign: 'center' }} />
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <input type="checkbox" checked={t.home_collection || false} onChange={e => updateLabPrice(t._id, 'home_collection', e.target.checked)} />
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <input type="checkbox" checked={t.fasting_required || false} onChange={e => updateLabPrice(t._id, 'fasting_required', e.target.checked)} />
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>Showing 200 tests. Use search to find specific tests. All 1624 tests available.</p>
        </div>
      );

      // ============================================
      // PACKAGES
      // ============================================
      case 'packages': return (
        <div>
          <h2>📦 Health Packages ({healthPackages.length})</h2>
          <button onClick={() => setShowPackageForm(true)} style={{ ...btnGreen, marginBottom: '1rem' }}>+ Add Package</button>
          {showPackageForm && (
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input placeholder="Package Name *" value={packageForm.name} onChange={e => setPackageForm({...packageForm, name: e.target.value})} style={inp} />
              <input placeholder="Tests (comma separated)" value={packageForm.included_tests} onChange={e => setPackageForm({...packageForm, included_tests: e.target.value})} style={inp} />
              <input placeholder="Price (₹)" type="number" value={packageForm.price} onChange={e => setPackageForm({...packageForm, price: e.target.value})} style={inp} />
              <input placeholder="Discount %" type="number" value={packageForm.discount} onChange={e => setPackageForm({...packageForm, discount: e.target.value})} style={inp} />
              <select value={packageForm.for_gender} onChange={e => setPackageForm({...packageForm, for_gender: e.target.value})} style={inp}><option>All</option><option>Male</option><option>Female</option></select>
              <div><button onClick={addPackage} style={btnGreen}>Add</button><button onClick={() => setShowPackageForm(false)} style={btnGray}>Cancel</button></div>
            </div>
          )}
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {healthPackages.map((p, i) => (
              <div key={i} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{p.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>{(p.included_tests || []).join(', ')}</div>
                  <div>₹{p.price} {p.discount > 0 && <span style={{ color: '#10b981' }}>({p.discount}% off)</span>}</div>
                </div>
                <button onClick={() => { setHealthPackages(healthPackages.filter((_, idx) => idx !== i)); }} style={del}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={savePackages} style={{ marginTop: '1rem', ...btnGreen, padding: '0.75rem 2rem' }}>💾 Save</button>
        </div>
      );

      // ============================================
      // OPD PRICING
      // ============================================
      case 'opdpricing': return (
        <div>
          <h2>💵 OPD Consultation Fees</h2>
          <form onSubmit={(e) => { e.preventDefault(); saveProfile({ opd_pricing: opdPricing }); }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                ['General (MBBS)', 'general'], ['Specialist (MD/MS)', 'specialist'],
                ['Super Specialist (DM/MCh)', 'super_specialist'], ['Emergency', 'emergency'],
                ['Follow-up (7 days)', 'follow_up'], ['Online Consultation', 'online']
              ].map(([label, key]) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input type="number" value={opdPricing[key]} onChange={e => setOpdPricing({...opdPricing, [key]: e.target.value})} style={inp} placeholder="₹" min="0" />
                </div>
              ))}
            </div>
            <button type="submit" style={{ marginTop: '1rem', ...btnGreen, padding: '0.75rem 2rem' }}>💾 Save</button>
          </form>
        </div>
      );

      // ============================================
      // IPD PRICING
      // ============================================
      case 'ipdpricing': return (
        <div>
          <h2>💰 IPD Room Pricing (Per Day)</h2>
          <form onSubmit={(e) => { e.preventDefault(); saveProfile({ ipd_pricing: ipdPricing }); }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                ['General Ward', 'general_ward'], ['Semi-Private', 'semi_private'],
                ['Private Room', 'private_room'], ['Deluxe', 'deluxe'],
                ['Super Deluxe', 'super_deluxe'], ['Suite', 'suite'],
                ['ICU', 'icu'], ['ICU + Ventilator', 'icu_ventilator'],
                ['NICU', 'nicu'], ['PICU', 'picu'],
                ['HDU', 'hdu'], ['Isolation Room', 'isolation'],
                ['Day Care', 'day_care']
              ].map(([label, key]) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input type="number" value={ipdPricing[key]} onChange={e => setIpdPricing({...ipdPricing, [key]: e.target.value})} style={inp} placeholder="₹ per day" min="0" />
                </div>
              ))}
            </div>
            <button type="submit" style={{ marginTop: '1rem', ...btnGreen, padding: '0.75rem 2rem' }}>💾 Save</button>
          </form>
        </div>
      );

      // ============================================
      // AMBULANCE
      // ============================================
      case 'ambulance': return (
        <div>
          <h2>🚑 Ambulance Fleet ({ambulanceFleet.length})</h2>
          <button onClick={() => setShowAmbulanceForm(true)} style={{ ...btnGreen, marginBottom: '1rem' }}>+ Add Vehicle</button>
          {showAmbulanceForm && (
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input placeholder="Vehicle No *" value={ambulanceForm.vehicle_number} onChange={e => setAmbulanceForm({...ambulanceForm, vehicle_number: e.target.value})} style={inp} />
              <select value={ambulanceForm.type} onChange={e => setAmbulanceForm({...ambulanceForm, type: e.target.value})} style={inp}>
                <option value="basic">Basic</option><option value="cardiac">Cardiac</option>
                <option value="ventilator">Ventilator</option><option value="neonatal">Neonatal</option>
                <option value="wheelchair">Wheelchair</option>
              </select>
              <input placeholder="Driver Name" value={ambulanceForm.driver_name} onChange={e => setAmbulanceForm({...ambulanceForm, driver_name: e.target.value})} style={inp} />
              <input placeholder="Driver Phone" value={ambulanceForm.driver_phone} onChange={e => setAmbulanceForm({...ambulanceForm, driver_phone: e.target.value})} style={inp} />
              <input placeholder="Base Fare (₹)" type="number" value={ambulanceForm.base_fare} onChange={e => setAmbulanceForm({...ambulanceForm, base_fare: e.target.value})} style={inp} />
              <input placeholder="Per KM (₹)" type="number" value={ambulanceForm.per_km} onChange={e => setAmbulanceForm({...ambulanceForm, per_km: e.target.value})} style={inp} />
              <label><input type="checkbox" checked={ambulanceForm.available_24x7} onChange={e => setAmbulanceForm({...ambulanceForm, available_24x7: e.target.checked})} /> 24x7</label>
              <div><button onClick={addAmbulance} style={btnGreen}>Add</button><button onClick={() => setShowAmbulanceForm(false)} style={btnGray}>Cancel</button></div>
            </div>
          )}
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {ambulanceFleet.map((v, i) => (
              <div key={i} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{v.vehicle_number}</strong> - {v.type?.toUpperCase()}
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>Driver: {v.driver_name} ({v.driver_phone})</div>
                  <div>₹{v.base_fare} + ₹{v.per_km}/km</div>
                </div>
                <button onClick={() => setAmbulanceFleet(ambulanceFleet.filter((_, idx) => idx !== i))} style={del}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={saveAmbulance} style={{ marginTop: '1rem', ...btnGreen, padding: '0.75rem 2rem' }}>💾 Save</button>
        </div>
      );

      // ... PART 4 continues with tabs 12-22
      // ============================================
      // SCHEMES
      // ============================================
      case 'schemes': return (
        <div>
          <h2>💠 Government Schemes</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {availableSchemes.map(s => (
              <label key={s.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 1rem', backgroundColor: schemesForm.schemes_accepted.includes(s.value) ? '#dbeafe' : '#f3f4f6', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={schemesForm.schemes_accepted.includes(s.value)} onChange={() => toggleScheme(s.value)} />
                {s.label}
              </label>
            ))}
          </div>
          <button onClick={saveSchemes} style={{ ...btnGreen, padding: '0.75rem 2rem' }}>💾 Save Schemes</button>
        </div>
      );

      // ============================================
      // INSURANCE
      // ============================================
      case 'insurance': return (
        <div>
          <h2>🛡️ Insurance & Cashless</h2>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={schemesForm.cashless_available} onChange={e => setSchemesForm({...schemesForm, cashless_available: e.target.checked})} /> 💳 Cashless Available
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={schemesForm.tpa_desk_available} onChange={e => setSchemesForm({...schemesForm, tpa_desk_available: e.target.checked})} /> 🏧 TPA Desk
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={schemesForm.reimbursement_accepted} onChange={e => setSchemesForm({...schemesForm, reimbursement_accepted: e.target.checked})} /> 📄 Reimbursement
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={schemesForm.emi_available} onChange={e => setSchemesForm({...schemesForm, emi_available: e.target.checked})} /> 💰 EMI Available
            </label>
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Insurance Partners</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {commonInsurances.map(ins => (
              <span key={ins} onClick={() => toggleInsurance(ins)}
                style={{
                  padding: '0.4rem 0.8rem', borderRadius: '2rem', cursor: 'pointer', fontSize: '0.8rem',
                  backgroundColor: schemesForm.insurance_accepted.includes(ins) ? '#d1fae5' : '#f3f4f6',
                  border: schemesForm.insurance_accepted.includes(ins) ? '2px solid #10b981' : '1px solid #e5e7eb',
                  color: schemesForm.insurance_accepted.includes(ins) ? '#065f46' : '#374151'
                }}>
                {schemesForm.insurance_accepted.includes(ins) ? '✅ ' : ''}{ins}
              </span>
            ))}
          </div>
          <button onClick={saveSchemes} style={{ ...btnGreen, padding: '0.75rem 2rem' }}>💾 Save Insurance</button>
        </div>
      );

      // ============================================
      // ACCREDITATIONS
      // ============================================
      case 'accreditations': return (
        <div>
          <h2>🏅 Accreditations</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
            <select value={accreditationForm.type} onChange={e => setAccreditationForm({...accreditationForm, type: e.target.value})} style={inp}>
              {accreditationTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="Certificate Number *" value={accreditationForm.certificate_number} onChange={e => setAccreditationForm({...accreditationForm, certificate_number: e.target.value})} style={inp} />
            <input placeholder="Issuing Body" value={accreditationForm.issuing_body} onChange={e => setAccreditationForm({...accreditationForm, issuing_body: e.target.value})} style={inp} />
            <input type="date" placeholder="Valid Until" value={accreditationForm.valid_until} onChange={e => setAccreditationForm({...accreditationForm, valid_until: e.target.value})} style={inp} />
            <div><button onClick={addAccreditation} style={btnGreen}>+ Add</button></div>
          </div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {accreditations.map((a, i) => (
              <div key={i} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb' }}>
                <div>
                  <strong>🏅 {a.type}</strong> — {a.certificate_number}
                  {a.valid_until && <span style={{ fontSize: '0.8rem', color: '#888' }}> | Valid until: {a.valid_until}</span>}
                  {a.issuing_body && <span style={{ fontSize: '0.8rem', color: '#888' }}> | {a.issuing_body}</span>}
                </div>
                <button onClick={() => setAccreditations(accreditations.filter((_, idx) => idx !== i))} style={del}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={saveAccreditations} style={{ marginTop: '1rem', ...btnGreen, padding: '0.75rem 2rem' }}>💾 Save</button>
        </div>
      );

      // ============================================
      // ONLINE SERVICES
      // ============================================
      case 'onlineservices': return (
        <div>
          <h2>🌐 Online Consultation Services</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', marginBottom: '1rem' }}>
              <input type="checkbox" checked={onlineServices.enabled} onChange={e => setOnlineServices({...onlineServices, enabled: e.target.checked})}
                style={{ width: '20px', height: '20px' }} />
              Enable Online Consultation for this Hospital
            </label>
            {onlineServices.enabled && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Consultation Fee (₹)</label>
                  <input type="number" value={onlineServices.consultation_fee} onChange={e => setOnlineServices({...onlineServices, consultation_fee: e.target.value})} style={inp} />
                </div>
                <div>
                  <label style={labelStyle}>Follow-up Fee (₹)</label>
                  <input type="number" value={onlineServices.follow_up_fee} onChange={e => setOnlineServices({...onlineServices, follow_up_fee: e.target.value})} style={inp} />
                </div>
                <div>
                  <label style={labelStyle}>Emergency Fee (₹)</label>
                  <input type="number" value={onlineServices.emergency_fee} onChange={e => setOnlineServices({...onlineServices, emergency_fee: e.target.value})} style={inp} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={onlineServices.video_consult} onChange={e => setOnlineServices({...onlineServices, video_consult: e.target.checked})} /> Video Consult
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={onlineServices.chat_consult} onChange={e => setOnlineServices({...onlineServices, chat_consult: e.target.checked})} /> Chat Consult
                </label>
              </div>
            )}
          </div>
          <button onClick={saveOnlineServices} style={{ ...btnGreen, padding: '0.75rem 2rem' }}>💾 Save</button>
        </div>
      );

      // ============================================
      // LOCATION
      // ============================================
      case 'location': return (
        <div>
          <h2>📍 Hospital Location</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Latitude</label>
              <input type="text" value={location.lat} onChange={e => setLocation({...location, lat: e.target.value})} style={inp} placeholder="e.g. 19.0760" />
            </div>
            <div>
              <label style={labelStyle}>Longitude</label>
              <input type="text" value={location.lng} onChange={e => setLocation({...location, lng: e.target.value})} style={inp} placeholder="e.g. 72.8777" />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Address</label>
            <input type="text" value={location.address} onChange={e => setLocation({...location, address: e.target.value})} style={inp} placeholder="Full address" />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <button onClick={() => setShowMapPicker(!showMapPicker)} style={btn}>
              🗺️ {showMapPicker ? 'Hide Map' : 'Open Map Picker'}
            </button>
            {location.lat && location.lng && (
              <a href={`https://www.google.com/maps?q=${location.lat},${location.lng}`} target="_blank" rel="noopener noreferrer"
                style={{ marginLeft: '1rem', color: '#1976d2', textDecoration: 'none', fontWeight: '500' }}>
                📍 Preview on Google Maps
              </a>
            )}
          </div>
          {showMapPicker && GOOGLE_MAPS_KEY && (
            <div style={{ height: '400px', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '1rem' }}>
              <LoadScript googleMapsApiKey={GOOGLE_MAPS_KEY}>
                <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={mapCenter} zoom={12} onClick={handleMapClick}>
                  {location.lat && location.lng && <Marker position={{ lat: parseFloat(location.lat), lng: parseFloat(location.lng) }} />}
                </GoogleMap>
              </LoadScript>
            </div>
          )}
          {showMapPicker && !GOOGLE_MAPS_KEY && (
            <div style={{ padding: '2rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', textAlign: 'center', marginBottom: '1rem' }}>
              ⚠️ Google Maps API key not configured. Add REACT_APP_GOOGLE_MAPS_KEY to .env
            </div>
          )}
          <button onClick={saveLocation} style={{ ...btnGreen, padding: '0.75rem 2rem' }}>💾 Save Location</button>
        </div>
      );

      // ============================================
      // GALLERY
      // ============================================
      case 'gallery': return (
        <div>
          <h2>🖼️ Hospital Gallery ({gallery.length} photos)</h2>
          <div style={{ marginBottom: '1rem' }}>
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} style={{ display: 'block', marginBottom: '0.5rem' }} />
            {uploadingImage && <p style={{ color: '#888' }}>Uploading...</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {gallery.map((url, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', height: '150px' }}>
                <img src={url} alt={`Hospital ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => removeImage(i)}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '16px' }}>✕</button>
              </div>
            ))}
            {gallery.length === 0 && <p style={{ color: '#888', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>No photos uploaded. Upload exterior and interior photos.</p>}
          </div>
        </div>
      );

      // ============================================
      // DOCUMENTS
      // ============================================
      case 'documents': return (
        <div>
          <h2>📄 Documents</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {[
              { label: 'Registration Certificate *', type: 'reg_cert' },
              { label: 'PAN Card', type: 'pan' },
              { label: 'GST Certificate', type: 'gst' },
              { label: 'NOC Certificate', type: 'noc' },
              { label: 'Accreditation Certificate', type: 'accreditation' },
              { label: 'Hospital Exterior Photo', type: 'photo_exterior' },
              { label: 'Hospital Interior Photo', type: 'photo_interior' }
            ].map(doc => {
              const existing = documents.find(d => d.type === doc.type);
              return (
                <div key={doc.type} style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{doc.label}</strong>
                    {existing && <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>✅ Uploaded</span>}
                  </div>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleDocUpload(e, doc.type)} />
                </div>
              );
            })}
          </div>
        </div>
      );

      // ============================================
      // CORPORATE PLANS
      // ============================================
      case 'corporate': return (
        <div>
          <h2>🏢 Corporate Health Plans</h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Offer corporate healthcare packages to companies. Get bulk bookings and higher revenue.</p>
          <CorporatePlansTab providerType="hospitals" providerId={providerId} token={localStorage.getItem('providerToken')} />
        </div>
      );

      // ============================================
      // BULK UPLOAD
      // ============================================
      case 'upload': return (
        <div>
          <h2>📤 Bulk Data Upload</h2>
          {uploadMessage && (
            <div style={{ backgroundColor: uploadMessage.includes('✅') ? '#d1fae5' : '#fee2e2', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{uploadMessage}</div>
          )}
          <div style={{ backgroundColor: '#fef3c7', border: '3px solid #f59e0b', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem' }}>📥</div>
            <h3 style={{ color: '#92400e' }}>Download Master Template</h3>
            <p style={{ color: '#92400e', marginBottom: '1.5rem' }}>Complete Excel with all sheets: Doctors, Beds, Lab Tests, Pricing, Packages & more.</p>
            <button onClick={handleDownloadTemplate} style={{ padding: '1rem 2rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>📥 Download Master Template</button>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem' }}>
            <h3>📤 Upload Filled Excel</h3>
            <form onSubmit={handleMasterUpload}>
              <input type="file" accept=".xlsx,.xls" onChange={e => setUploadFile(e.target.files[0])} style={{ display: 'block', marginBottom: '1rem' }} />
              <button type="submit" disabled={loading || !uploadFile} style={{ padding: '0.75rem 2rem', backgroundColor: loading || !uploadFile ? '#d1d5db' : '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: loading || !uploadFile ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                {loading ? 'Uploading...' : '📤 Upload & Update All Data'}
              </button>
            </form>
          </div>
        </div>
      );

      // ============================================
      // WHATSAPP
      // ============================================
      case 'whatsapp': return (
        <div>
          <h2>💬 WhatsApp Bed Update</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <h3>Update Beds via WhatsApp</h3>
            <div style={{ backgroundColor: '#f0fdf4', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'left', marginTop: '1rem' }}>
              <p><strong>1. Save this number:</strong> <code style={{ backgroundColor: '#1e293b', color: '#e2e8f0', padding: '0.3rem 0.6rem', borderRadius: '0.25rem' }}>+91-XXXXXXXXXX</code></p>
              <p><strong>2. Send message:</strong></p>
              <code style={{ backgroundColor: '#1e293b', color: '#10b981', padding: '0.5rem', borderRadius: '0.25rem', display: 'block', fontSize: '0.9rem' }}>
                BEDS 350 AVL 45 ICU 12 VENT 5 ER OPEN
              </code>
              <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>Updates instantly. Free of cost. 1 second.</p>
            </div>
          </div>
        </div>
      );

      // ============================================
      // SETTINGS
      // ============================================
      case 'settings': return (
        <div>
          <h2>⚙️ Settings</h2>
          <div style={{ display: 'grid', gap: '1rem', maxWidth: '500px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <h3 style={{ color: '#92400e' }}>⚠️ Deactivate Account</h3>
              <p style={{ fontSize: '0.875rem', color: '#888' }}>Hidden from search. Can reactivate later.</p>
              <button onClick={async () => { if (window.confirm('Deactivate?')) { try { await api.put(`/hospitals/provider/${providerId}/deactivate`, { reason: 'Dashboard request' }); handleLogout(); } catch(e) {} } }}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '0.5rem', cursor: 'pointer', color: '#92400e', fontWeight: 'bold' }}>⚠️ Deactivate</button>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <h3 style={{ color: '#dc2626' }}>🗑️ Delete Account</h3>
              <p style={{ fontSize: '0.875rem', color: '#888' }}>Permanent deletion. Data removed in 30 days.</p>
              <button onClick={async () => { if (window.confirm('Delete?') && window.confirm('Are you sure?')) { try { await api.delete(`/hospitals/provider/${providerId}`); handleLogout(); } catch(e) {} } }}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: '#fee2e2', border: '2px solid #ef4444', borderRadius: '0.5rem', cursor: 'pointer', color: '#dc2626', fontWeight: 'bold' }}>🗑️ Delete Permanently</button>
            </div>
          </div>
        </div>
      );

      default: return <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Select a tab from the sidebar</div>;
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <ProviderAuth providerType="hospital">
      <ProviderDashboardLayout
        title="Hospital Dashboard"
        icon="🏥"
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={profile?.name || 'Hospital Admin'}
        userRole="Hospital"
        logout={handleLogout}
      >
        {loading && activeTab === 'dashboard' ? <div style={{ textAlign: 'center', padding: '3rem' }}>🔄 Loading...</div> : renderContent()}
      </ProviderDashboardLayout>
    </ProviderAuth>
  );
};

export default HospitalDashboard;