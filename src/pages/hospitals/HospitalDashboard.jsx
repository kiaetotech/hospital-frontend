import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderDashboardLayout from '../../components/ProviderDashboardLayout';
import ProviderStatsCards from '../../components/ProviderStatsCards';
import ProviderTable from '../../components/ProviderTable';
import { hospitalApi } from '../../services/providerApi';
import ProviderAuth from '../../components/ProviderAuth';
import api from '../../services/api';
import { 
  updateBedStatus, 
  uploadDoctorsExcel, 
  uploadHospitalDataExcel,
  downloadDoctorTemplate,
  updateHospitalProfile,
  updateHospitalSchemes,
  updateHospitalInsurance,
  updateHospitalFacilities,
  addDoctor,
  updateDoctor,
  removeDoctor,
  getHospitalDashboardStats,
  getHospitalBookings
} from '../../services/api';

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [profile, setProfile] = useState(null);
  
  const [bedForm, setBedForm] = useState({ total: '', available: '', icu_available: '', ventilator_available: '', emergency_beds: '' });
  const [bedUpdateSuccess, setBedUpdateSuccess] = useState('');
  const [schemesForm, setSchemesForm] = useState({ schemes_accepted: [], cashless_available: false, tpa_desk_available: false, insurance_accepted: [] });
  const [doctorForm, setDoctorForm] = useState({ name: '', specialization: '', qualification: '', experience: '', consultation_fee: '', languages: '', gender: 'Male', availability_days: '', morning_slots: '', evening_slots: '', max_patients: '20' });
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [uploadType, setUploadType] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [quickBedStatus, setQuickBedStatus] = useState('');

  // NEW STATE for advanced tabs
  const [facilitiesList, setFacilitiesList] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [healthPackages, setHealthPackages] = useState([]);
  const [ambulanceFleet, setAmbulanceFleet] = useState([]);
  const [medicalMasterData, setMedicalMasterData] = useState({ specialties: [], diseases: {}, procedures: [] });
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [diseaseSearch, setDiseaseSearch] = useState('');
  const [facilityForm, setFacilityForm] = useState({ name: '', category: '', available_24x7: false, description: '' });
  const [labTestForm, setLabTestForm] = useState({ name: '', category: '', price: '', home_collection: false, fasting_required: false, report_time: '24', sample_type: 'Blood' });
  const [packageForm, setPackageForm] = useState({ name: '', included_tests: '', price: '', discount: '', for_gender: 'All', valid_days: '365' });
  const [ambulanceForm, setAmbulanceForm] = useState({ vehicle_number: '', type: 'basic', driver_name: '', driver_phone: '', base_fare: '', per_km: '', available_24x7: true });
  const [showFacilityForm, setShowFacilityForm] = useState(false);
  const [showLabTestForm, setShowLabTestForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [showAmbulanceForm, setShowAmbulanceForm] = useState(false);

  const sidebarItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'beds', label: '🛏️ Bed Management', icon: '🛏️' },
    { id: 'doctors', label: '👨‍⚕️ Doctors', icon: '👨‍⚕️' },
    { id: 'diseases', label: '🦠 Diseases & Procedures', icon: '🦠' },
    { id: 'facilities', label: '🏗️ Facilities', icon: '🏗️' },
    { id: 'labtests', label: '🧪 Lab Tests', icon: '🧪' },
    { id: 'packages', label: '📦 Health Packages', icon: '📦' },
    { id: 'ambulance', label: '🚑 Ambulance Fleet', icon: '🚑' },
    { id: 'schemes', label: '💠 Schemes & Insurance', icon: '💠' },
    { id: 'bookings', label: '📋 Bookings', icon: '📋' },
    { id: 'profile', label: '🏥 Profile', icon: '🏥' },
    { id: 'upload', label: '📤 Excel Upload', icon: '📤' },
    { id: 'whatsapp', label: '💬 WhatsApp Setup', icon: '💬' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
  ];

  useEffect(() => { loadData(); fetchMedicalMasterData(); }, [activeTab]);

  const fetchMedicalMasterData = async () => {
    try { const res = await api.get('/hospitals/medical-data'); if (res.data?.data) setMedicalMasterData(res.data.data); } catch(e) {}
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('providerToken');
      if (!token) { navigate('/hospital/login'); return; }

      if (activeTab === 'dashboard') {
        const statsRes = await getHospitalDashboardStats(); setStats(statsRes.data.data);
        const bookingsRes = await getHospitalBookings({ limit: 5 }); setBookings(bookingsRes.data.data || []);
        const profileRes = await hospitalApi.getProfile(); setProfile(profileRes.data.data);
        if (profileRes.data.data?.beds) setBedForm({ total: profileRes.data.data.beds.total || '', available: profileRes.data.data.beds.available || '', icu_available: profileRes.data.data.beds.icu_available || '', ventilator_available: profileRes.data.data.beds.ventilator_available || '', emergency_beds: profileRes.data.data.beds.emergency_beds || '' });
        setSchemesForm({ schemes_accepted: profileRes.data.data?.schemes_accepted || [], cashless_available: profileRes.data.data?.cashless_available || false, tpa_desk_available: profileRes.data.data?.tpa_desk_available || false, insurance_accepted: profileRes.data.data?.insurance_accepted || [] });
      } else if (activeTab === 'doctors') {
        const doctorsRes = await hospitalApi.getDoctors(); setDoctors(doctorsRes.data.data || []);
      } else if (activeTab === 'bookings') {
        const bookingsRes = await getHospitalBookings({ limit: 50 }); setBookings(bookingsRes.data.data || []);
      } else if (activeTab === 'profile' || activeTab === 'beds' || activeTab === 'schemes') {
        const profileRes = await hospitalApi.getProfile(); setProfile(profileRes.data.data);
        if (profileRes.data.data?.beds) setBedForm({ total: profileRes.data.data.beds.total || '', available: profileRes.data.data.beds.available || '', icu_available: profileRes.data.data.beds.icu_available || '', ventilator_available: profileRes.data.data.beds.ventilator_available || '', emergency_beds: profileRes.data.data.beds.emergency_beds || '' });
        setSchemesForm({ schemes_accepted: profileRes.data.data?.schemes_accepted || [], cashless_available: profileRes.data.data?.cashless_available || false, tpa_desk_available: profileRes.data.data?.tpa_desk_available || false, insurance_accepted: profileRes.data.data?.insurance_accepted || [] });
      } else if (activeTab === 'facilities') { setFacilitiesList(profile?.facilities || []);
      } else if (activeTab === 'labtests') { setLabTests(profile?.diagnostics?.tests || []);
      } else if (activeTab === 'packages') { setHealthPackages(profile?.pricing?.health_packages || []);
      } else if (activeTab === 'ambulance') { setAmbulanceFleet(profile?.ambulance_fleet || []);
      } else if (activeTab === 'diseases') { setSelectedDiseases(profile?.diseases_treated || []); setSelectedProcedures(profile?.procedures_available || []); }
    } catch (error) { if (error.response?.status === 401) navigate('/hospital/login'); }
    finally { setLoading(false); }
  };

  // SAVE HANDLERS
  const saveFacilities = async () => { try { await updateHospitalFacilities(localStorage.getItem('providerId'), { facilities: facilitiesList }); alert('✅ Saved!'); } catch(e) { alert('Failed'); } };
  const saveLabTests = async () => { try { await api.put('/hospitals/provider/lab-tests', { tests: labTests }); alert('✅ Saved!'); } catch(e) { alert('Failed'); } };
  const savePackages = async () => { try { await api.put('/hospitals/provider/packages', { packages: healthPackages }); alert('✅ Saved!'); } catch(e) { alert('Failed'); } };
  const saveAmbulanceFleet = async () => { try { await api.put('/hospitals/provider/ambulance', { fleet: ambulanceFleet }); alert('✅ Saved!'); } catch(e) { alert('Failed'); } };
  const saveDiseases = async () => { try { await api.put('/hospitals/provider/diseases', { diseases: selectedDiseases, procedures: selectedProcedures }); alert('✅ Saved!'); } catch(e) { alert('Failed'); } };

  const toggleDisease = (v) => setSelectedDiseases(p => p.includes(v) ? p.filter(d => d !== v) : [...p, v]);
  const toggleProcedure = (v) => setSelectedProcedures(p => p.includes(v) ? p.filter(d => d !== v) : [...p, v]);
  const addFacility = () => { if(!facilityForm.name) return; setFacilitiesList([...facilitiesList, {...facilityForm}]); setFacilityForm({ name:'', category:'', available_24x7:false, description:'' }); setShowFacilityForm(false); };
  const removeFacility = (i) => setFacilitiesList(facilitiesList.filter((_,idx) => idx !== i));
  const addLabTest = () => { if(!labTestForm.name) return; setLabTests([...labTests, {...labTestForm, price: parseInt(labTestForm.price)||0}]); setLabTestForm({ name:'', category:'', price:'', home_collection:false, fasting_required:false, report_time:'24', sample_type:'Blood' }); setShowLabTestForm(false); };
  const removeLabTest = (i) => setLabTests(labTests.filter((_,idx) => idx !== i));
  const addPackage = () => { if(!packageForm.name) return; setHealthPackages([...healthPackages, {...packageForm, price: parseInt(packageForm.price)||0, discount: parseInt(packageForm.discount)||0, included_tests: packageForm.included_tests.split(',').map(t=>t.trim())}]); setPackageForm({ name:'', included_tests:'', price:'', discount:'', for_gender:'All', valid_days:'365' }); setShowPackageForm(false); };
  const removePackage = (i) => setHealthPackages(healthPackages.filter((_,idx) => idx !== i));
  const addAmbulance = () => { if(!ambulanceForm.vehicle_number) return; setAmbulanceFleet([...ambulanceFleet, {...ambulanceForm, base_fare: parseInt(ambulanceForm.base_fare)||0, per_km: parseInt(ambulanceForm.per_km)||0}]); setAmbulanceForm({ vehicle_number:'', type:'basic', driver_name:'', driver_phone:'', base_fare:'', per_km:'', available_24x7:true }); setShowAmbulanceForm(false); };
  const removeAmbulance = (i) => setAmbulanceFleet(ambulanceFleet.filter((_,idx) => idx !== i));

  // EXISTING HANDLERS
  const handleBedUpdate = async (e) => { e.preventDefault(); setLoading(true); try { await updateBedStatus(localStorage.getItem('providerId'), { beds: { total: parseInt(bedForm.total), available: parseInt(bedForm.available), icu_available: parseInt(bedForm.icu_available), ventilator_available: parseInt(bedForm.ventilator_available), emergency_beds: parseInt(bedForm.emergency_beds) }, updateMethod: 'web_portal' }); setBedUpdateSuccess('✅ Updated! Auto-expires in 4 hours.'); setTimeout(() => setBedUpdateSuccess(''), 5000); } catch(e) { alert('Failed'); } finally { setLoading(false); } };
  const quickUpdate = async (preset) => { const p = { almost_full: { available:5, icu:2, ventilator:1 }, half: { available:25, icu:8, ventilator:4 }, mostly: { available:50, icu:15, ventilator:8 } }; try { await updateBedStatus(localStorage.getItem('providerId'), { beds: { available: p[preset].available, icu_available: p[preset].icu, ventilator_available: p[preset].ventilator }, updateMethod: 'web_portal' }); setQuickBedStatus('✅ Updated!'); setTimeout(() => setQuickBedStatus(''), 3000); loadData(); } catch(e) { alert('Failed'); } };
  const handleSchemeUpdate = async (e) => { e.preventDefault(); setLoading(true); try { await updateHospitalSchemes(localStorage.getItem('providerId'), { schemes_accepted: schemesForm.schemes_accepted }); await updateHospitalInsurance(localStorage.getItem('providerId'), { insurance_accepted: schemesForm.insurance_accepted, cashless_available: schemesForm.cashless_available, tpa_desk_available: schemesForm.tpa_desk_available }); alert('✅ Updated!'); } catch(e) { alert('Failed'); } finally { setLoading(false); } };
  const handleAddDoctor = async (e) => { e.preventDefault(); setLoading(true); try { const d = { name: doctorForm.name, specialization: doctorForm.specialization, qualification: doctorForm.qualification, experience: doctorForm.experience, consultation_fee: parseFloat(doctorForm.consultation_fee), languages: doctorForm.languages.split(',').map(l=>l.trim()), gender: doctorForm.gender, availability: { days: doctorForm.availability_days.split(',').map(d=>d.trim()), morning_slots: doctorForm.morning_slots, evening_slots: doctorForm.evening_slots, max_patients: parseInt(doctorForm.max_patients) } }; if(editingDoctor) await updateDoctor(localStorage.getItem('providerId'), editingDoctor._id, d); else await addDoctor(localStorage.getItem('providerId'), d); setShowDoctorForm(false); setEditingDoctor(null); setDoctorForm({ name:'', specialization:'', qualification:'', experience:'', consultation_fee:'', languages:'', gender:'Male', availability_days:'', morning_slots:'', evening_slots:'', max_patients:'20' }); loadData(); alert('✅ Saved!'); } catch(e) { alert('Failed'); } finally { setLoading(false); } };
  const handleExcelUpload = async (e) => { e.preventDefault(); if(!uploadFile) return; setLoading(true); try { if(uploadType==='doctors') { const r = await uploadDoctorsExcel(localStorage.getItem('providerId'), uploadFile); setUploadMessage(`✅ ${r.data.message}`); } else { await uploadHospitalDataExcel(localStorage.getItem('providerId'), uploadFile); setUploadMessage('✅ Updated!'); } setUploadFile(null); setTimeout(()=>setUploadMessage(''),5000); } catch(e) { setUploadMessage('❌ Failed'); } finally { setLoading(false); } };
  const handleDownloadTemplate = async () => { try { const r = await downloadDoctorTemplate(); const u = window.URL.createObjectURL(new Blob([r.data])); const l = document.createElement('a'); l.href=u; l.setAttribute('download','doctor_template.xlsx'); document.body.appendChild(l); l.click(); l.remove(); } catch(e) { alert('Failed'); } };
  const handleLogout = () => { localStorage.removeItem('providerToken'); localStorage.removeItem('providerType'); localStorage.removeItem('providerId'); navigate('/hospital/login'); };

  const availableSchemes = [{ value:'ayushman', label:'Ayushman Bharat (PM-JAY)' },{ value:'cghs', label:'CGHS' },{ value:'esi', label:'ESI' },{ value:'echs', label:'ECHS' },{ value:'state_scheme', label:'State Health Scheme' },{ value:'senior_citizen', label:'Senior Citizen Scheme' },{ value:'disability', label:'Disability Scheme' }];
  const commonInsurances = ['Star Health','ICICI Lombard','HDFC Ergo','Bajaj Allianz','Max Bupa','Religare Care','New India Assurance','Oriental Insurance','United India Insurance','National Insurance','Aditya Birla Health','ManipalCigna','Digit Health','Acko General Insurance','SBI General','Tata AIG','Royal Sundaram','IFFCO Tokio'];

  const btn = { padding:'0.5rem 1rem', backgroundColor:'#10b981', color:'white', border:'none', borderRadius:'0.375rem', cursor:'pointer', fontWeight:'bold', marginRight:'0.5rem' };
  const del = { padding:'0.25rem 0.5rem', backgroundColor:'#ef4444', color:'white', border:'none', borderRadius:'0.25rem', cursor:'pointer', fontSize:'0.75rem' };
  const inp = { width:'100%', padding:'0.6rem', border:'1px solid #d1d5db', borderRadius:'0.375rem', fontSize:'0.875rem', marginBottom:'0.5rem', boxSizing:'border-box' };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return (
        <div>
          <ProviderStatsCards stats={stats} />
          <div style={{ backgroundColor:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'0.75rem', padding:'1.5rem', marginBottom:'1.5rem', marginTop:'1rem' }}>
            <h3 style={{ fontWeight:'bold', marginBottom:'0.5rem' }}>⚡ Quick Bed Update</h3>
            <p style={{ fontSize:'0.875rem', color:'#6b7280', marginBottom:'1rem' }}>Current: {profile?.beds?.available||0} beds available</p>
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
              <button onClick={()=>quickUpdate('almost_full')} style={{ padding:'0.5rem 1rem', backgroundColor:'#fef2f2', border:'1px solid #fecaca', borderRadius:'0.5rem', cursor:'pointer' }}>🔴 Almost Full</button>
              <button onClick={()=>quickUpdate('half')} style={{ padding:'0.5rem 1rem', backgroundColor:'#fef3c7', border:'1px solid #fde68a', borderRadius:'0.5rem', cursor:'pointer' }}>🟡 Half Available</button>
              <button onClick={()=>quickUpdate('mostly')} style={{ padding:'0.5rem 1rem', backgroundColor:'#d1fae5', border:'1px solid #a7f3d0', borderRadius:'0.5rem', cursor:'pointer' }}>🟢 Mostly Available</button>
            </div>
            {quickBedStatus && <p style={{ marginTop:'0.5rem', color:'#10b981', fontWeight:'bold' }}>{quickBedStatus}</p>}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}><h3 style={{ fontWeight:'bold', marginBottom:'1rem' }}>📋 Recent Bookings</h3>{bookings.length===0?<p style={{ color:'#6b7280' }}>No bookings</p>:bookings.slice(0,5).map((b,i)=><div key={i} style={{ padding:'0.5rem 0', borderBottom:'1px solid #e5e7eb' }}><div style={{ display:'flex', justifyContent:'space-between' }}><span>{b.patientName}</span><span style={{ padding:'0.15rem 0.5rem', borderRadius:'10px', fontSize:'0.7rem', backgroundColor:b.status==='confirmed'?'#dcfce7':'#fef3c7', color:b.status==='confirmed'?'#166534':'#92400e' }}>{b.status}</span></div><div style={{ fontSize:'0.8rem', color:'#6b7280' }}>{new Date(b.createdAt).toLocaleDateString()}</div></div>)}</div>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}><h3 style={{ fontWeight:'bold', marginBottom:'1rem' }}>⚡ Quick Actions</h3><div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}><button onClick={()=>setActiveTab('beds')} style={btn}>🛏️ Beds</button><button onClick={()=>setActiveTab('doctors')} style={btn}>👨‍⚕️ Doctors</button><button onClick={()=>setActiveTab('diseases')} style={btn}>🦠 Diseases</button><button onClick={()=>setActiveTab('upload')} style={btn}>📤 Upload</button></div></div>
          </div>
        </div>
      );

      case 'beds': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1rem' }}>🛏️ Bed Management</h2>
          <div style={{ backgroundColor:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'0.75rem', padding:'1.5rem', marginBottom:'1.5rem' }}><h4 style={{ fontWeight:'bold' }}>💬 WhatsApp Update</h4><p style={{ fontSize:'0.875rem' }}>Send to <strong>+91-XXXXXXXXXX</strong>:</p><code style={{ backgroundColor:'#1e293b', color:'#e2e8f0', padding:'0.75rem', borderRadius:'0.5rem', display:'block', fontSize:'0.875rem' }}>BEDS 350 AVL 45 ICU 12 VENT 5 ER OPEN</code></div>
          <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
            {bedUpdateSuccess && <div style={{ backgroundColor:'#d1fae5', color:'#065f46', padding:'0.75rem', borderRadius:'0.5rem', marginBottom:'1rem' }}>{bedUpdateSuccess}</div>}
            <form onSubmit={handleBedUpdate}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                <div><label>Total</label><input type="number" value={bedForm.total} onChange={e=>setBedForm({...bedForm,total:e.target.value})} style={inp} /></div>
                <div><label>Available</label><input type="number" value={bedForm.available} onChange={e=>setBedForm({...bedForm,available:e.target.value})} style={inp} /></div>
                <div><label>ICU</label><input type="number" value={bedForm.icu_available} onChange={e=>setBedForm({...bedForm,icu_available:e.target.value})} style={inp} /></div>
                <div><label>Ventilators</label><input type="number" value={bedForm.ventilator_available} onChange={e=>setBedForm({...bedForm,ventilator_available:e.target.value})} style={inp} /></div>
                <div><label>Emergency</label><input type="number" value={bedForm.emergency_beds} onChange={e=>setBedForm({...bedForm,emergency_beds:e.target.value})} style={inp} /></div>
              </div>
              <button type="submit" disabled={loading} style={{ marginTop:'1rem', ...btn, padding:'0.75rem 2rem' }}>{loading?'Updating...':'📤 Update'}</button>
            </form>
          </div>
        </div>
      );

      case 'doctors': return (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}><h2 style={{ fontSize:'1.25rem', fontWeight:'bold' }}>👨‍⚕️ Doctors ({doctors.length})</h2><div style={{ display:'flex', gap:'0.5rem' }}><button onClick={handleDownloadTemplate} style={{ ...btn, backgroundColor:'#6b7280' }}>📥 Template</button><button onClick={()=>{setShowDoctorForm(true);setEditingDoctor(null);}} style={btn}>➕ Add</button></div></div>
          {showDoctorForm && (
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', marginBottom:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontWeight:'bold', marginBottom:'1rem' }}>{editingDoctor?'Edit':'Add'} Doctor</h3>
              <form onSubmit={handleAddDoctor}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                  <div><label>Name *</label><input required value={doctorForm.name} onChange={e=>setDoctorForm({...doctorForm,name:e.target.value})} style={inp} /></div>
                  <div><label>Specialization *</label><input required value={doctorForm.specialization} onChange={e=>setDoctorForm({...doctorForm,specialization:e.target.value})} style={inp} /></div>
                  <div><label>Qualification</label><input value={doctorForm.qualification} onChange={e=>setDoctorForm({...doctorForm,qualification:e.target.value})} style={inp} /></div>
                  <div><label>Experience</label><input value={doctorForm.experience} onChange={e=>setDoctorForm({...doctorForm,experience:e.target.value})} style={inp} /></div>
                  <div><label>Fee (₹) *</label><input type="number" required value={doctorForm.consultation_fee} onChange={e=>setDoctorForm({...doctorForm,consultation_fee:e.target.value})} style={inp} /></div>
                  <div><label>Languages</label><input value={doctorForm.languages} onChange={e=>setDoctorForm({...doctorForm,languages:e.target.value})} style={inp} /></div>
                  <div><label>Gender</label><select value={doctorForm.gender} onChange={e=>setDoctorForm({...doctorForm,gender:e.target.value})} style={inp}><option>Male</option><option>Female</option></select></div>
                  <div><label>Available Days</label><input value={doctorForm.availability_days} onChange={e=>setDoctorForm({...doctorForm,availability_days:e.target.value})} style={inp} /></div>
                  <div><label>Morning Slots</label><input value={doctorForm.morning_slots} onChange={e=>setDoctorForm({...doctorForm,morning_slots:e.target.value})} style={inp} /></div>
                  <div><label>Evening Slots</label><input value={doctorForm.evening_slots} onChange={e=>setDoctorForm({...doctorForm,evening_slots:e.target.value})} style={inp} /></div>
                  <div><label>Max Patients/Day</label><input type="number" value={doctorForm.max_patients} onChange={e=>setDoctorForm({...doctorForm,max_patients:e.target.value})} style={inp} /></div>
                </div>
                <div style={{ marginTop:'1rem', display:'flex', gap:'0.5rem' }}><button type="submit" disabled={loading} style={btn}>💾 Save</button><button type="button" onClick={()=>setShowDoctorForm(false)} style={{ ...btn, backgroundColor:'#6b7280' }}>Cancel</button></div>
              </form>
            </div>
          )}
          <ProviderTable columns={[{ key:'name', label:'Name' },{ key:'specialization', label:'Specialization' },{ key:'consultation_fee', label:'Fee' },{ key:'experience', label:'Exp' },{ key:'availability', label:'Status', render:(a)=><span style={{ padding:'0.15rem 0.5rem', borderRadius:'10px', fontSize:'0.7rem', backgroundColor:a?.status==='available'?'#dcfce7':'#fef3c7', color:a?.status==='available'?'#166534':'#92400e' }}>{a?.status||'N/A'}</span> }]} data={doctors} onEdit={(r)=>{setDoctorForm({name:r.name||'',specialization:r.specialization||'',qualification:r.qualification||'',experience:r.experience||'',consultation_fee:r.consultation_fee||'',languages:r.languages?.join(', ')||'',gender:r.gender||'Male',availability_days:r.availability?.days?.join(', ')||'',morning_slots:r.availability?.morning_slots||'',evening_slots:r.availability?.evening_slots||'',max_patients:r.availability?.max_patients||'20'});setEditingDoctor(r);setShowDoctorForm(true);}} onDelete={async(r)=>{if(window.confirm('Delete?')){await removeDoctor(localStorage.getItem('providerId'),r._id);loadData();}}} loading={loading} />
        </div>
      );

      // NEW TABS
      case 'diseases': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1rem' }}>🦠 Diseases & Procedures ({selectedDiseases.length} diseases, {selectedProcedures.length} procedures)</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontWeight:'bold', marginBottom:'0.5rem' }}>Diseases Treated</h3>
              <input placeholder="🔍 Search diseases..." value={diseaseSearch} onChange={e=>setDiseaseSearch(e.target.value)} style={inp} />
              <div style={{ maxHeight:'400px', overflowY:'auto' }}>
                {Object.entries(medicalMasterData.diseases||{}).map(([cat, diseases]) => {
                  const filtered = diseases.filter(d=>!diseaseSearch||d.label.toLowerCase().includes(diseaseSearch.toLowerCase())||cat.toLowerCase().includes(diseaseSearch.toLowerCase()));
                  if(!filtered.length) return null;
                  return <div key={cat} style={{ marginBottom:'0.75rem' }}><h4 style={{ fontSize:'0.8rem', color:'#e53935', fontWeight:'bold' }}>{cat}</h4>{filtered.map(d=><label key={d.value} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'3px 0', cursor:'pointer', fontSize:'0.8rem' }}><input type="checkbox" checked={selectedDiseases.includes(d.value)} onChange={()=>toggleDisease(d.value)} />{d.label}</label>)}</div>;
                })}
              </div>
            </div>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontWeight:'bold', marginBottom:'0.5rem' }}>Procedures</h3>
              <div style={{ maxHeight:'400px', overflowY:'auto' }}>{(medicalMasterData.procedures||[]).map(p=><label key={p.value} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'3px 0', cursor:'pointer', fontSize:'0.8rem' }}><input type="checkbox" checked={selectedProcedures.includes(p.value)} onChange={()=>toggleProcedure(p.value)} />{p.label}</label>)}</div>
            </div>
          </div>
          <button onClick={saveDiseases} style={{ marginTop:'1rem', ...btn, padding:'0.75rem 2rem' }}>💾 Save</button>
        </div>
      );

      case 'facilities': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1rem' }}>🏗️ Facilities ({facilitiesList.length})</h2>
          <button onClick={()=>setShowFacilityForm(true)} style={{ ...btn, marginBottom:'1rem' }}>+ Add Facility</button>
          {showFacilityForm && <div style={{ backgroundColor:'#f9fafb', padding:'1rem', borderRadius:'0.5rem', marginBottom:'1rem' }}><input placeholder="Name *" value={facilityForm.name} onChange={e=>setFacilityForm({...facilityForm,name:e.target.value})} style={inp} /><input placeholder="Category" value={facilityForm.category} onChange={e=>setFacilityForm({...facilityForm,category:e.target.value})} style={inp} /><input placeholder="Description" value={facilityForm.description} onChange={e=>setFacilityForm({...facilityForm,description:e.target.value})} style={inp} /><label style={{ display:'flex',alignItems:'center',gap:'8px',marginBottom:'0.5rem' }}><input type="checkbox" checked={facilityForm.available_24x7} onChange={e=>setFacilityForm({...facilityForm,available_24x7:e.target.checked})} />24x7</label><button onClick={addFacility} style={btn}>Add</button><button onClick={()=>setShowFacilityForm(false)} style={{...btn,backgroundColor:'#6b7280'}}>Cancel</button></div>}
          <div style={{ backgroundColor:'white', borderRadius:'0.75rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>{facilitiesList.length===0?<p style={{ padding:'2rem', textAlign:'center', color:'#6b7280' }}>No facilities</p>:facilitiesList.map((f,i)=><div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem 1rem',borderBottom:'1px solid #e5e7eb' }}><div><strong>{f.name}</strong><span style={{ fontSize:'0.8rem',color:'#6b7280',marginLeft:'8px' }}>{f.category}</span>{f.available_24x7&&<span style={{ fontSize:'0.7rem',color:'#10b981',marginLeft:'8px' }}>🟢24x7</span>}</div><button onClick={()=>removeFacility(i)} style={del}>✕</button></div>)}</div>
          <button onClick={saveFacilities} style={{ marginTop:'1rem', ...btn, padding:'0.75rem 2rem' }}>💾 Save</button>
        </div>
      );

      case 'labtests': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1rem' }}>🧪 Lab Tests ({labTests.length})</h2>
          <button onClick={()=>setShowLabTestForm(true)} style={{ ...btn, marginBottom:'1rem' }}>+ Add Test</button>
          {showLabTestForm && <div style={{ backgroundColor:'#f9fafb', padding:'1rem', borderRadius:'0.5rem', marginBottom:'1rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}><input placeholder="Name *" value={labTestForm.name} onChange={e=>setLabTestForm({...labTestForm,name:e.target.value})} style={inp} /><input placeholder="Category" value={labTestForm.category} onChange={e=>setLabTestForm({...labTestForm,category:e.target.value})} style={inp} /><input placeholder="Price" type="number" value={labTestForm.price} onChange={e=>setLabTestForm({...labTestForm,price:e.target.value})} style={inp} /><input placeholder="Report (hrs)" type="number" value={labTestForm.report_time} onChange={e=>setLabTestForm({...labTestForm,report_time:e.target.value})} style={inp} /><input placeholder="Sample" value={labTestForm.sample_type} onChange={e=>setLabTestForm({...labTestForm,sample_type:e.target.value})} style={inp} /><div><label style={{ display:'flex',alignItems:'center',gap:'8px',fontSize:'0.8rem' }}><input type="checkbox" checked={labTestForm.home_collection} onChange={e=>setLabTestForm({...labTestForm,home_collection:e.target.checked})} />Home Collection</label><label style={{ display:'flex',alignItems:'center',gap:'8px',fontSize:'0.8rem' }}><input type="checkbox" checked={labTestForm.fasting_required} onChange={e=>setLabTestForm({...labTestForm,fasting_required:e.target.checked})} />Fasting</label></div><div><button onClick={addLabTest} style={btn}>Add</button><button onClick={()=>setShowLabTestForm(false)} style={{...btn,backgroundColor:'#6b7280'}}>Cancel</button></div></div>}
          <div style={{ backgroundColor:'white', borderRadius:'0.75rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>{labTests.length===0?<p style={{ padding:'2rem', textAlign:'center', color:'#6b7280' }}>No tests</p>:<table style={{ width:'100%', fontSize:'0.8rem', borderCollapse:'collapse' }}><thead><tr style={{ backgroundColor:'#f3f4f6' }}><th style={{ padding:'8px',textAlign:'left' }}>Test</th><th>Cat</th><th>Price</th><th>Home</th><th>Report</th><th></th></tr></thead><tbody>{labTests.map((t,i)=><tr key={i} style={{ borderBottom:'1px solid #e5e7eb' }}><td style={{ padding:'8px' }}><strong>{t.name}</strong></td><td style={{ padding:'8px',textAlign:'center' }}>{t.category}</td><td style={{ padding:'8px',textAlign:'center' }}>₹{t.price}</td><td style={{ padding:'8px',textAlign:'center' }}>{t.home_collection?'✅':'❌'}</td><td style={{ padding:'8px',textAlign:'center' }}>{t.report_time}h</td><td style={{ padding:'8px',textAlign:'center' }}><button onClick={()=>removeLabTest(i)} style={del}>✕</button></td></tr>)}</tbody></table>}</div>
          <button onClick={saveLabTests} style={{ marginTop:'1rem', ...btn, padding:'0.75rem 2rem' }}>💾 Save</button>
        </div>
      );

      case 'packages': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1rem' }}>📦 Health Packages ({healthPackages.length})</h2>
          <button onClick={()=>setShowPackageForm(true)} style={{ ...btn, marginBottom:'1rem' }}>+ Add Package</button>
          {showPackageForm && <div style={{ backgroundColor:'#f9fafb', padding:'1rem', borderRadius:'0.5rem', marginBottom:'1rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}><input placeholder="Name *" value={packageForm.name} onChange={e=>setPackageForm({...packageForm,name:e.target.value})} style={inp} /><input placeholder="Tests (comma)" value={packageForm.included_tests} onChange={e=>setPackageForm({...packageForm,included_tests:e.target.value})} style={inp} /><input placeholder="Price" type="number" value={packageForm.price} onChange={e=>setPackageForm({...packageForm,price:e.target.value})} style={inp} /><input placeholder="Discount %" type="number" value={packageForm.discount} onChange={e=>setPackageForm({...packageForm,discount:e.target.value})} style={inp} /><select value={packageForm.for_gender} onChange={e=>setPackageForm({...packageForm,for_gender:e.target.value})} style={inp}><option>All</option><option>Male</option><option>Female</option></select><div><button onClick={addPackage} style={btn}>Add</button><button onClick={()=>setShowPackageForm(false)} style={{...btn,backgroundColor:'#6b7280'}}>Cancel</button></div></div>}
          <div style={{ display:'grid', gap:'0.5rem' }}>{healthPackages.length===0?<p style={{ padding:'2rem', textAlign:'center', color:'#6b7280', backgroundColor:'white', borderRadius:'0.75rem' }}>No packages</p>:healthPackages.map((p,i)=><div key={i} style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1rem', display:'flex', justifyContent:'space-between', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}><div><strong>{p.name}</strong><div style={{ fontSize:'0.8rem', color:'#6b7280' }}>{(p.included_tests||[]).join(', ')}</div><div>₹{p.price} {p.discount>0&&<span style={{ color:'#10b981' }}>({p.discount}% off)</span>}</div></div><button onClick={()=>removePackage(i)} style={del}>✕</button></div>)}</div>
          <button onClick={savePackages} style={{ marginTop:'1rem', ...btn, padding:'0.75rem 2rem' }}>💾 Save</button>
        </div>
      );

      case 'ambulance': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1rem' }}>🚑 Ambulance Fleet ({ambulanceFleet.length})</h2>
          <button onClick={()=>setShowAmbulanceForm(true)} style={{ ...btn, marginBottom:'1rem' }}>+ Add Vehicle</button>
          {showAmbulanceForm && <div style={{ backgroundColor:'#f9fafb', padding:'1rem', borderRadius:'0.5rem', marginBottom:'1rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}><input placeholder="Vehicle No *" value={ambulanceForm.vehicle_number} onChange={e=>setAmbulanceForm({...ambulanceForm,vehicle_number:e.target.value})} style={inp} /><select value={ambulanceForm.type} onChange={e=>setAmbulanceForm({...ambulanceForm,type:e.target.value})} style={inp}><option value="basic">Basic</option><option value="cardiac">Cardiac</option><option value="ventilator">Ventilator</option><option value="neonatal">Neonatal</option><option value="wheelchair">Wheelchair</option></select><input placeholder="Driver Name" value={ambulanceForm.driver_name} onChange={e=>setAmbulanceForm({...ambulanceForm,driver_name:e.target.value})} style={inp} /><input placeholder="Driver Phone" value={ambulanceForm.driver_phone} onChange={e=>setAmbulanceForm({...ambulanceForm,driver_phone:e.target.value})} style={inp} /><input placeholder="Base Fare" type="number" value={ambulanceForm.base_fare} onChange={e=>setAmbulanceForm({...ambulanceForm,base_fare:e.target.value})} style={inp} /><input placeholder="Per KM" type="number" value={ambulanceForm.per_km} onChange={e=>setAmbulanceForm({...ambulanceForm,per_km:e.target.value})} style={inp} /><label style={{ display:'flex',alignItems:'center',gap:'8px' }}><input type="checkbox" checked={ambulanceForm.available_24x7} onChange={e=>setAmbulanceForm({...ambulanceForm,available_24x7:e.target.checked})} />24x7</label><div><button onClick={addAmbulance} style={btn}>Add</button><button onClick={()=>setShowAmbulanceForm(false)} style={{...btn,backgroundColor:'#6b7280'}}>Cancel</button></div></div>}
          <div style={{ display:'grid', gap:'0.5rem' }}>{ambulanceFleet.length===0?<p style={{ padding:'2rem', textAlign:'center', color:'#6b7280', backgroundColor:'white', borderRadius:'0.75rem' }}>No vehicles</p>:ambulanceFleet.map((v,i)=><div key={i} style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1rem', display:'flex', justifyContent:'space-between', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}><div><strong>{v.vehicle_number}</strong> - {v.type?.toUpperCase()}<div style={{ fontSize:'0.8rem',color:'#6b7280' }}>Driver: {v.driver_name} ({v.driver_phone})</div><div>₹{v.base_fare} + ₹{v.per_km}/km {v.available_24x7?'🟢24x7':''}</div></div><button onClick={()=>removeAmbulance(i)} style={del}>✕</button></div>)}</div>
          <button onClick={saveAmbulanceFleet} style={{ marginTop:'1rem', ...btn, padding:'0.75rem 2rem' }}>💾 Save</button>
        </div>
      );

      case 'schemes': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1rem' }}>💠 Schemes & Insurance</h2>
          <form onSubmit={handleSchemeUpdate}>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', marginBottom:'1.5rem' }}><h3 style={{ fontWeight:'bold', marginBottom:'1rem' }}>Government Schemes</h3><div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>{availableSchemes.map(s=><label key={s.value} style={{ display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer' }}><input type="checkbox" checked={schemesForm.schemes_accepted.includes(s.value)} onChange={e=>{if(e.target.checked) setSchemesForm({...schemesForm,schemes_accepted:[...schemesForm.schemes_accepted,s.value]}); else setSchemesForm({...schemesForm,schemes_accepted:schemesForm.schemes_accepted.filter(x=>x!==s.value)});}} /><span style={{ fontSize:'0.875rem' }}>{s.label}</span></label>)}</div></div>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', marginBottom:'1.5rem' }}><h3 style={{ fontWeight:'bold', marginBottom:'1rem' }}>Insurance Companies</h3><div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', maxHeight:'300px', overflowY:'auto' }}>{commonInsurances.map(ins=><label key={ins} style={{ display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer' }}><input type="checkbox" checked={schemesForm.insurance_accepted.includes(ins)} onChange={e=>{if(e.target.checked) setSchemesForm({...schemesForm,insurance_accepted:[...schemesForm.insurance_accepted,ins]}); else setSchemesForm({...schemesForm,insurance_accepted:schemesForm.insurance_accepted.filter(x=>x!==ins)});}} /><span style={{ fontSize:'0.875rem' }}>{ins}</span></label>)}</div></div>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', marginBottom:'1.5rem' }}><h3 style={{ fontWeight:'bold', marginBottom:'1rem' }}>Cashless & TPA</h3><div style={{ display:'flex', gap:'2rem' }}><label style={{ display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer' }}><input type="checkbox" checked={schemesForm.cashless_available} onChange={e=>setSchemesForm({...schemesForm,cashless_available:e.target.checked})} />💳 Cashless</label><label style={{ display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer' }}><input type="checkbox" checked={schemesForm.tpa_desk_available} onChange={e=>setSchemesForm({...schemesForm,tpa_desk_available:e.target.checked})} />🏧 TPA Desk</label></div></div>
            <button type="submit" disabled={loading} style={{ ...btn, padding:'0.75rem 2rem' }}>💾 Save</button>
          </form>
        </div>
      );

      case 'bookings': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1.5rem' }}>📋 Bookings</h2>
          <ProviderTable columns={[{ key:'bookingId', label:'ID' },{ key:'patientName', label:'Patient' },{ key:'doctorName', label:'Doctor' },{ key:'date', label:'Date' },{ key:'status', label:'Status', render:(s)=><span style={{ padding:'0.15rem 0.5rem', borderRadius:'10px', fontSize:'0.7rem', backgroundColor:s==='confirmed'?'#dcfce7':s==='pending'?'#fef3c7':'#fee2e2', color:s==='confirmed'?'#166534':s==='pending'?'#92400e':'#dc2626' }}>{s}</span> }]} data={bookings} loading={loading} emptyMessage="No bookings" />
        </div>
      );

      case 'profile': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1.5rem' }}>🏥 Hospital Profile</h2>
          {profile?<div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}><div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}><div><strong>Name:</strong> {profile.name}</div><div><strong>Email:</strong> {profile.email||'N/A'}</div><div><strong>Phone:</strong> {profile.phone||'N/A'}</div><div><strong>City:</strong> {profile.address?.city}, {profile.address?.state}</div><div><strong>Plan:</strong> <span style={{ padding:'0.15rem 0.5rem', borderRadius:'10px', fontSize:'0.7rem', backgroundColor:profile.subscription_plan==='platinum'?'#fef3c7':'#f3f4f6' }}>{profile.subscription_plan||'Free'}</span></div></div></div>:<p>Loading...</p>}
        </div>
      );

      case 'upload': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1rem' }}>📤 Excel Upload</h2>
          {uploadMessage&&<div style={{ backgroundColor:uploadMessage.includes('✅')?'#d1fae5':'#fee2e2', color:uploadMessage.includes('✅')?'#065f46':'#dc2626', padding:'1rem', borderRadius:'0.5rem', marginBottom:'1rem' }}>{uploadMessage}</div>}
          <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', marginBottom:'1.5rem' }}><h3>👨‍⚕️ Upload Doctors</h3><button onClick={handleDownloadTemplate} style={{ ...btn, backgroundColor:'#6b7280', marginBottom:'1rem' }}>📥 Template</button><form onSubmit={handleExcelUpload}><input type="file" accept=".xlsx,.xls" onChange={e=>{setUploadFile(e.target.files[0]);setUploadType('doctors');}} style={{ display:'block', marginBottom:'0.5rem' }} /><button type="submit" disabled={loading||!uploadFile||uploadType!=='doctors'} style={btn}>📤 Upload</button></form></div>
          <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}><h3>📊 Upload Beds & Pricing</h3><form onSubmit={handleExcelUpload}><input type="file" accept=".xlsx,.xls" onChange={e=>{setUploadFile(e.target.files[0]);setUploadType('data');}} style={{ display:'block', marginBottom:'0.5rem' }} /><button type="submit" disabled={loading||!uploadFile||uploadType!=='data'} style={{...btn,backgroundColor:'#3b82f6'}}>📤 Upload</button></form></div>
        </div>
      );

      case 'whatsapp': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1rem' }}>💬 WhatsApp Setup</h2>
          <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'2rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', textAlign:'center' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>💬</div>
            <h3>Update Beds via WhatsApp</h3>
            <div style={{ backgroundColor:'#f0fdf4', padding:'1.5rem', borderRadius:'0.75rem', marginBottom:'1.5rem', textAlign:'left' }}>
              <p><strong>Step 1:</strong> Save <strong>+91-XXXXXXXXXX</strong></p>
              <p><strong>Step 2:</strong> Send: <code style={{ backgroundColor:'#1e293b', color:'#e2e8f0', padding:'0.5rem', borderRadius:'0.25rem', display:'inline-block', marginTop:'0.25rem' }}>BEDS 350 AVL 45 ICU 12 VENT 5 ER OPEN</code></p>
            </div>
          </div>
        </div>
      );

      default: return <div>Coming soon...</div>;
    }
  };

  return (
    <ProviderAuth providerType="hospital">
      <ProviderDashboardLayout title="Hospital Dashboard" icon="🏥" sidebarItems={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} userName={profile?.name||'Hospital Admin'} userRole="Hospital" logout={handleLogout}>
        {renderContent()}
      </ProviderDashboardLayout>
    </ProviderAuth>
  );
};

export default HospitalDashboard;