import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderDashboardLayout from '../../components/ProviderDashboardLayout';
import ProviderStatsCards from '../../components/ProviderStatsCards';
import ProviderTable from '../../components/ProviderTable';
import { hospitalApi } from '../../services/providerApi';
import ProviderAuth from '../../components/ProviderAuth';
import api from '../../services/api';
import { updateBedStatus, uploadDoctorsExcel, uploadHospitalDataExcel, downloadDoctorTemplate, updateHospitalProfile, updateHospitalSchemes, updateHospitalInsurance, updateHospitalFacilities, addDoctor, updateDoctor, removeDoctor, getHospitalDashboardStats, getHospitalBookings } from '../../services/api';

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [profile, setProfile] = useState(null);
  const [bedForm, setBedForm] = useState({ total: '', available: '', icu_available: '', ventilator_available: '', emergency_beds: '' });
  const [bedUpdateSuccess, setBedUpdateSuccess] = useState('');
  const [quickBedStatus, setQuickBedStatus] = useState('');
  const [schemesForm, setSchemesForm] = useState({ schemes_accepted: [], cashless_available: false, tpa_desk_available: false, insurance_accepted: [] });
  const [doctorForm, setDoctorForm] = useState({ name: '', specialization: '', qualification: '', experience: '', consultation_fee: '', languages: '', gender: 'Male', availability_days: '', morning_slots: '', evening_slots: '', max_patients: '20' });
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [uploadType, setUploadType] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
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
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'beds', label: 'Bed Management', icon: '🛏️' },
    { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { id: 'diseases', label: 'Diseases & Procedures', icon: '🦠' },
    { id: 'facilities', label: 'Facilities', icon: '🏗️' },
    { id: 'labtests', label: 'Lab Tests', icon: '🧪' },
    { id: 'packages', label: 'Health Packages', icon: '📦' },
    { id: 'ambulance', label: 'Ambulance Fleet', icon: '🚑' },
    { id: 'schemes', label: 'Schemes & Insurance', icon: '💠' },
    { id: 'bookings', label: 'Bookings', icon: '📋' },
    { id: 'profile', label: 'Profile', icon: '🏥' },
    { id: 'upload', label: 'Excel Upload', icon: '📤' },
    { id: 'whatsapp', label: 'WhatsApp Setup', icon: '💬' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  useEffect(() => { loadData(); fetchMedicalMasterData(); }, [activeTab]);

  const fetchMedicalMasterData = async () => { try { const r = await api.get('/hospitals/medical-data'); if (r.data?.data) setMedicalMasterData(r.data.data); } catch(e) {} };

  const loadData = async () => {
    setLoading(true);
    try {
      if (!localStorage.getItem('providerToken')) { navigate('/hospital/login'); return; }
      const pr = await hospitalApi.getProfile(); setProfile(pr.data.data); const p = pr.data.data;
      if (activeTab === 'dashboard') { const sr = await getHospitalDashboardStats(); setStats(sr.data.data); const br = await getHospitalBookings({ limit: 5 }); setBookings(br.data.data || []); }
      else if (activeTab === 'doctors') { const dr = await hospitalApi.getDoctors(); setDoctors(dr.data.data || []); }
      else if (activeTab === 'bookings') { const br = await getHospitalBookings({ limit: 50 }); setBookings(br.data.data || []); }
      else if (activeTab === 'facilities') setFacilitiesList(p?.facilities || []);
      else if (activeTab === 'labtests') setLabTests(p?.diagnostics?.tests || []);
      else if (activeTab === 'packages') setHealthPackages(p?.pricing?.health_packages || []);
      else if (activeTab === 'ambulance') setAmbulanceFleet(p?.ambulance_fleet || []);
      else if (activeTab === 'diseases') { setSelectedDiseases(p?.diseases_treated || []); setSelectedProcedures(p?.procedures_available || []); }
      if (p?.beds) setBedForm({ total: p.beds.total || '', available: p.beds.available || '', icu_available: p.beds.icu_available || '', ventilator_available: p.beds.ventilator_available || '', emergency_beds: p.beds.emergency_beds || '' });
      setSchemesForm({ schemes_accepted: p?.schemes_accepted || [], cashless_available: p?.cashless_available || false, tpa_desk_available: p?.tpa_desk_available || false, insurance_accepted: p?.insurance_accepted || [] });
    } catch(e) { if (e.response?.status === 401) navigate('/hospital/login'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem('providerToken'); localStorage.removeItem('providerType'); localStorage.removeItem('providerId'); navigate('/hospital/login'); };
  const handleBedUpdate = async (e) => { e.preventDefault(); setLoading(true); try { await updateBedStatus(localStorage.getItem('providerId'), { beds: { total: parseInt(bedForm.total), available: parseInt(bedForm.available), icu_available: parseInt(bedForm.icu_available), ventilator_available: parseInt(bedForm.ventilator_available), emergency_beds: parseInt(bedForm.emergency_beds) }, updateMethod: 'web_portal' }); setBedUpdateSuccess('✅ Updated!'); setTimeout(() => setBedUpdateSuccess(''), 5000); } catch(e) {} finally { setLoading(false); } };
  const quickUpdate = async (preset) => { const p = { almost_full: { available:5, icu:2, ventilator:1 }, half: { available:25, icu:8, ventilator:4 }, mostly: { available:50, icu:15, ventilator:8 } }; try { await updateBedStatus(localStorage.getItem('providerId'), { beds: p[preset], updateMethod: 'web_portal' }); setQuickBedStatus('✅'); setTimeout(() => setQuickBedStatus(''), 3000); loadData(); } catch(e) {} };
  const handleSchemeUpdate = async (e) => { e.preventDefault(); try { await updateHospitalSchemes(localStorage.getItem('providerId'), { schemes_accepted: schemesForm.schemes_accepted }); await updateHospitalInsurance(localStorage.getItem('providerId'), { insurance_accepted: schemesForm.insurance_accepted, cashless_available: schemesForm.cashless_available, tpa_desk_available: schemesForm.tpa_desk_available }); alert('✅ Saved'); } catch(e) {} };
  const handleAddDoctor = async (e) => { e.preventDefault(); try { const d = { name: doctorForm.name, specialization: doctorForm.specialization, qualification: doctorForm.qualification, experience: doctorForm.experience, consultation_fee: parseFloat(doctorForm.consultation_fee), languages: doctorForm.languages.split(',').map(l=>l.trim()), gender: doctorForm.gender, availability: { days: doctorForm.availability_days.split(',').map(d=>d.trim()), morning_slots: doctorForm.morning_slots, evening_slots: doctorForm.evening_slots, max_patients: parseInt(doctorForm.max_patients) } }; if(editingDoctor) await updateDoctor(localStorage.getItem('providerId'), editingDoctor._id, d); else await addDoctor(localStorage.getItem('providerId'), d); setShowDoctorForm(false); setEditingDoctor(null); loadData(); } catch(e) {} };
  const handleDownloadTemplate = async () => { try { const r = await downloadDoctorTemplate(); const u = window.URL.createObjectURL(new Blob([r.data])); const l = document.createElement('a'); l.href=u; l.setAttribute('download','doctor_template.xlsx'); document.body.appendChild(l); l.click(); l.remove(); } catch(e) {} };
  const handleExcelUpload = async (e) => { e.preventDefault(); if(!uploadFile) return; try { if(uploadType==='doctors') { const r = await uploadDoctorsExcel(localStorage.getItem('providerId'), uploadFile); setUploadMessage(`✅ ${r.data.message}`); } else { await uploadHospitalDataExcel(localStorage.getItem('providerId'), uploadFile); setUploadMessage('✅ Updated'); } setUploadFile(null); setTimeout(()=>setUploadMessage(''),5000); } catch(e) { setUploadMessage('❌ Failed'); } };
  const saveFacilities = async () => { try { await updateHospitalFacilities(localStorage.getItem('providerId'), { facilities: facilitiesList }); alert('✅ Saved'); } catch(e) {} };
  const saveLabTests = async () => { try { await api.put('/hospitals/provider/lab-tests', { tests: labTests }); alert('✅ Saved'); } catch(e) {} };
  const savePackages = async () => { try { await api.put('/hospitals/provider/packages', { packages: healthPackages }); alert('✅ Saved'); } catch(e) {} };
  const saveAmbulanceFleet = async () => { try { await api.put('/hospitals/provider/ambulance', { fleet: ambulanceFleet }); alert('✅ Saved'); } catch(e) {} };
  const saveDiseases = async () => { try { await api.put('/hospitals/provider/diseases', { diseases: selectedDiseases, procedures: selectedProcedures }); alert('✅ Saved'); } catch(e) {} };
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

  const availableSchemes = [{ value:'ayushman', label:'Ayushman Bharat' },{ value:'cghs', label:'CGHS' },{ value:'esi', label:'ESI' },{ value:'echs', label:'ECHS' },{ value:'state_scheme', label:'State Scheme' },{ value:'senior_citizen', label:'Senior Citizen' },{ value:'disability', label:'Disability' }];
  const commonInsurances = ['Star Health','ICICI Lombard','HDFC Ergo','Bajaj Allianz','Max Bupa','Religare Care','New India Assurance','Oriental Insurance','United India Insurance','National Insurance','Aditya Birla Health','ManipalCigna','Digit Health','SBI General','Tata AIG'];

  const btn = { padding:'0.5rem 1rem', backgroundColor:'#10b981', color:'white', border:'none', borderRadius:'0.375rem', cursor:'pointer', fontWeight:'bold', marginRight:'0.5rem' };
  const del = { padding:'0.25rem 0.5rem', backgroundColor:'#ef4444', color:'white', border:'none', borderRadius:'0.25rem', cursor:'pointer', fontSize:'0.75rem' };
  const inp = { width:'100%', padding:'0.6rem', border:'1px solid #d1d5db', borderRadius:'0.375rem', fontSize:'0.875rem', marginBottom:'0.5rem', boxSizing:'border-box' };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return (
        <div>
          <ProviderStatsCards stats={stats} />
          <div style={{ backgroundColor:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'0.75rem', padding:'1.5rem', margin:'1rem 0' }}><h3>⚡ Quick Bed Update</h3><p style={{ fontSize:'0.875rem', color:'#6b7280' }}>Current: {profile?.beds?.available||0} beds</p><div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}><button onClick={()=>quickUpdate('almost_full')} style={{ padding:'0.5rem 1rem', backgroundColor:'#fef2f2', border:'1px solid #fecaca', borderRadius:'0.5rem', cursor:'pointer' }}>🔴 Almost Full</button><button onClick={()=>quickUpdate('half')} style={{ padding:'0.5rem 1rem', backgroundColor:'#fef3c7', border:'1px solid #fde68a', borderRadius:'0.5rem', cursor:'pointer' }}>🟡 Half</button><button onClick={()=>quickUpdate('mostly')} style={{ padding:'0.5rem 1rem', backgroundColor:'#d1fae5', border:'1px solid #a7f3d0', borderRadius:'0.5rem', cursor:'pointer' }}>🟢 Mostly Available</button></div></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem' }}><h3>📋 Recent Bookings</h3>{bookings.length===0?<p style={{ color:'#888' }}>No bookings</p>:bookings.slice(0,5).map((b,i)=><div key={i} style={{ padding:'0.5rem 0', borderBottom:'1px solid #eee' }}><strong>{b.patientName}</strong> - {b.status}</div>)}</div>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem' }}><h3>⚡ Quick Actions</h3><div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}><button onClick={()=>setActiveTab('beds')} style={btn}>🛏️ Beds</button><button onClick={()=>setActiveTab('doctors')} style={btn}>👨‍⚕️ Doctors</button><button onClick={()=>setActiveTab('diseases')} style={btn}>🦠 Diseases</button><button onClick={()=>setActiveTab('upload')} style={btn}>📤 Upload</button></div></div>
          </div>
        </div>
      );

      case 'beds': return (
        <div><h2>🛏️ Bed Management</h2><div style={{ backgroundColor:'#eff6ff', padding:'1rem', borderRadius:'0.5rem', marginBottom:'1rem' }}><p>WhatsApp: <code>BEDS 350 AVL 45 ICU 12 VENT 5 ER OPEN</code></p></div><div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem' }}>{bedUpdateSuccess&&<div style={{ backgroundColor:'#d1fae5', padding:'0.5rem', borderRadius:'0.25rem', marginBottom:'1rem' }}>{bedUpdateSuccess}</div>}<form onSubmit={handleBedUpdate}><div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}><div><label>Total</label><input type="number" value={bedForm.total} onChange={e=>setBedForm({...bedForm,total:e.target.value})} style={inp} /></div><div><label>Available</label><input type="number" value={bedForm.available} onChange={e=>setBedForm({...bedForm,available:e.target.value})} style={inp} /></div><div><label>ICU</label><input type="number" value={bedForm.icu_available} onChange={e=>setBedForm({...bedForm,icu_available:e.target.value})} style={inp} /></div><div><label>Ventilators</label><input type="number" value={bedForm.ventilator_available} onChange={e=>setBedForm({...bedForm,ventilator_available:e.target.value})} style={inp} /></div><div><label>Emergency</label><input type="number" value={bedForm.emergency_beds} onChange={e=>setBedForm({...bedForm,emergency_beds:e.target.value})} style={inp} /></div></div><button type="submit" style={{ marginTop:'1rem', ...btn }}>Update</button></form></div></div>
      );

      case 'doctors': return (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}><h2>👨‍⚕️ Doctors ({doctors.length})</h2><div><button onClick={handleDownloadTemplate} style={{ ...btn, backgroundColor:'#6b7280' }}>📥 Template</button><button onClick={()=>{setShowDoctorForm(true);setEditingDoctor(null);}} style={btn}>➕ Add</button></div></div>
          {showDoctorForm && (
            <div style={{ backgroundColor:'#f9fafb', padding:'1rem', borderRadius:'0.5rem', marginBottom:'1rem' }}>
              <form onSubmit={handleAddDoctor}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                  <input placeholder="Name *" value={doctorForm.name} onChange={e=>setDoctorForm({...doctorForm,name:e.target.value})} style={inp} required />
                  <input placeholder="Specialization *" value={doctorForm.specialization} onChange={e=>setDoctorForm({...doctorForm,specialization:e.target.value})} style={inp} required />
                  <input placeholder="Qualification" value={doctorForm.qualification} onChange={e=>setDoctorForm({...doctorForm,qualification:e.target.value})} style={inp} />
                  <input placeholder="Experience" value={doctorForm.experience} onChange={e=>setDoctorForm({...doctorForm,experience:e.target.value})} style={inp} />
                  <input placeholder="Fee (₹)" type="number" value={doctorForm.consultation_fee} onChange={e=>setDoctorForm({...doctorForm,consultation_fee:e.target.value})} style={inp} />
                  <input placeholder="Languages" value={doctorForm.languages} onChange={e=>setDoctorForm({...doctorForm,languages:e.target.value})} style={inp} />
                  <select value={doctorForm.gender} onChange={e=>setDoctorForm({...doctorForm,gender:e.target.value})} style={inp}><option>Male</option><option>Female</option></select>
                  <input placeholder="Available Days" value={doctorForm.availability_days} onChange={e=>setDoctorForm({...doctorForm,availability_days:e.target.value})} style={inp} />
                  <input placeholder="Morning Slots" value={doctorForm.morning_slots} onChange={e=>setDoctorForm({...doctorForm,morning_slots:e.target.value})} style={inp} />
                  <input placeholder="Evening Slots" value={doctorForm.evening_slots} onChange={e=>setDoctorForm({...doctorForm,evening_slots:e.target.value})} style={inp} />
                  <input placeholder="Max Patients" type="number" value={doctorForm.max_patients} onChange={e=>setDoctorForm({...doctorForm,max_patients:e.target.value})} style={inp} />
                </div>
                <div style={{ marginTop:'0.5rem' }}><button type="submit" style={btn}>💾 Save</button><button type="button" onClick={()=>setShowDoctorForm(false)} style={{ ...btn, backgroundColor:'#6b7280' }}>Cancel</button></div>
              </form>
            </div>
          )}
          <ProviderTable columns={[{ key:'name', label:'Name' },{ key:'specialization', label:'Specialization' },{ key:'consultation_fee', label:'Fee' },{ key:'experience', label:'Exp' }]} data={doctors} onEdit={(r)=>{setDoctorForm({name:r.name||'',specialization:r.specialization||'',qualification:r.qualification||'',experience:r.experience||'',consultation_fee:r.consultation_fee||'',languages:r.languages?.join(', ')||'',gender:r.gender||'Male',availability_days:r.availability?.days?.join(', ')||'',morning_slots:r.availability?.morning_slots||'',evening_slots:r.availability?.evening_slots||'',max_patients:r.availability?.max_patients||'20'});setEditingDoctor(r);setShowDoctorForm(true);}} onDelete={async(r)=>{if(window.confirm('Delete?')){await removeDoctor(localStorage.getItem('providerId'),r._id);loadData();}}} loading={loading} />
        </div>
      );

      case 'diseases': return (
        <div><h2>🦠 Diseases & Procedures ({selectedDiseases.length} diseases, {selectedProcedures.length} procedures)</h2><div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}><div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem' }}><h3>Diseases</h3><input placeholder="Search..." value={diseaseSearch} onChange={e=>setDiseaseSearch(e.target.value)} style={inp} /><div style={{ maxHeight:'400px', overflowY:'auto' }}>{Object.entries(medicalMasterData.diseases||{}).map(([cat, diseases]) => { const f = diseases.filter(d=>!diseaseSearch||d.label.toLowerCase().includes(diseaseSearch.toLowerCase())); if(!f.length) return null; return <div key={cat}><h4 style={{ color:'#e53935', fontSize:'0.85rem' }}>{cat}</h4>{f.map(d=><label key={d.value} style={{ display:'flex',alignItems:'center',gap:'6px',padding:'2px 0',cursor:'pointer',fontSize:'0.8rem' }}><input type="checkbox" checked={selectedDiseases.includes(d.value)} onChange={()=>toggleDisease(d.value)} />{d.label}</label>)}</div>; })}</div></div><div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem' }}><h3>Procedures</h3><div style={{ maxHeight:'400px', overflowY:'auto' }}>{(medicalMasterData.procedures||[]).map(p=><label key={p.value} style={{ display:'flex',alignItems:'center',gap:'6px',padding:'2px 0',cursor:'pointer',fontSize:'0.8rem' }}><input type="checkbox" checked={selectedProcedures.includes(p.value)} onChange={()=>toggleProcedure(p.value)} />{p.label}</label>)}</div></div></div><button onClick={saveDiseases} style={{ marginTop:'1rem', ...btn, padding:'0.75rem 2rem' }}>💾 Save</button></div>
      );

      case 'facilities': return (
        <div><h2>🏗️ Facilities ({facilitiesList.length})</h2><button onClick={()=>setShowFacilityForm(true)} style={{ ...btn, marginBottom:'1rem' }}>+ Add</button>{showFacilityForm&&<div style={{ backgroundColor:'#f9fafb', padding:'1rem', borderRadius:'0.5rem', marginBottom:'1rem' }}><input placeholder="Name *" value={facilityForm.name} onChange={e=>setFacilityForm({...facilityForm,name:e.target.value})} style={inp} /><input placeholder="Category" value={facilityForm.category} onChange={e=>setFacilityForm({...facilityForm,category:e.target.value})} style={inp} /><input placeholder="Description" value={facilityForm.description} onChange={e=>setFacilityForm({...facilityForm,description:e.target.value})} style={inp} /><label style={{ display:'flex',alignItems:'center',gap:'8px' }}><input type="checkbox" checked={facilityForm.available_24x7} onChange={e=>setFacilityForm({...facilityForm,available_24x7:e.target.checked})} />24x7</label><button onClick={addFacility} style={btn}>Add</button><button onClick={()=>setShowFacilityForm(false)} style={{...btn,backgroundColor:'#6b7280'}}>Cancel</button></div>}<div style={{ backgroundColor:'white', borderRadius:'0.75rem' }}>{facilitiesList.length===0?<p style={{ padding:'2rem', textAlign:'center', color:'#888' }}>No facilities</p>:facilitiesList.map((f,i)=><div key={i} style={{ display:'flex',justifyContent:'space-between',padding:'0.75rem 1rem',borderBottom:'1px solid #eee' }}><div><strong>{f.name}</strong><span style={{ fontSize:'0.8rem',color:'#888',marginLeft:'8px' }}>{f.category}</span></div><button onClick={()=>removeFacility(i)} style={del}>✕</button></div>)}</div><button onClick={saveFacilities} style={{ marginTop:'1rem', ...btn, padding:'0.75rem 2rem' }}>💾 Save</button></div>
      );

      case 'labtests': return (
        <div><h2>🧪 Lab Tests ({labTests.length})</h2><button onClick={()=>setShowLabTestForm(true)} style={{ ...btn, marginBottom:'1rem' }}>+ Add</button>{showLabTestForm&&<div style={{ backgroundColor:'#f9fafb', padding:'1rem', borderRadius:'0.5rem', marginBottom:'1rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}><input placeholder="Name *" value={labTestForm.name} onChange={e=>setLabTestForm({...labTestForm,name:e.target.value})} style={inp} /><input placeholder="Category" value={labTestForm.category} onChange={e=>setLabTestForm({...labTestForm,category:e.target.value})} style={inp} /><input placeholder="Price" type="number" value={labTestForm.price} onChange={e=>setLabTestForm({...labTestForm,price:e.target.value})} style={inp} /><input placeholder="Report (hrs)" type="number" value={labTestForm.report_time} onChange={e=>setLabTestForm({...labTestForm,report_time:e.target.value})} style={inp} /><input placeholder="Sample" value={labTestForm.sample_type} onChange={e=>setLabTestForm({...labTestForm,sample_type:e.target.value})} style={inp} /><div><label style={{ display:'flex',alignItems:'center',gap:'8px',fontSize:'0.8rem' }}><input type="checkbox" checked={labTestForm.home_collection} onChange={e=>setLabTestForm({...labTestForm,home_collection:e.target.checked})} />Home</label><label style={{ display:'flex',alignItems:'center',gap:'8px',fontSize:'0.8rem' }}><input type="checkbox" checked={labTestForm.fasting_required} onChange={e=>setLabTestForm({...labTestForm,fasting_required:e.target.checked})} />Fasting</label></div><div><button onClick={addLabTest} style={btn}>Add</button><button onClick={()=>setShowLabTestForm(false)} style={{...btn,backgroundColor:'#6b7280'}}>Cancel</button></div></div>}<div style={{ backgroundColor:'white', borderRadius:'0.75rem' }}>{labTests.length===0?<p style={{ padding:'2rem', textAlign:'center', color:'#888' }}>No tests</p>:<table style={{ width:'100%', fontSize:'0.8rem', borderCollapse:'collapse' }}><thead><tr style={{ backgroundColor:'#f3f4f6' }}><th style={{ padding:'8px',textAlign:'left' }}>Test</th><th>Cat</th><th>Price</th><th>Home</th><th>Report</th><th></th></tr></thead><tbody>{labTests.map((t,i)=><tr key={i} style={{ borderBottom:'1px solid #eee' }}><td style={{ padding:'8px' }}><strong>{t.name}</strong></td><td style={{ padding:'8px',textAlign:'center' }}>{t.category}</td><td style={{ padding:'8px',textAlign:'center' }}>₹{t.price}</td><td style={{ padding:'8px',textAlign:'center' }}>{t.home_collection?'✅':'❌'}</td><td style={{ padding:'8px',textAlign:'center' }}>{t.report_time}h</td><td><button onClick={()=>removeLabTest(i)} style={del}>✕</button></td></tr>)}</tbody></table>}</div><button onClick={saveLabTests} style={{ marginTop:'1rem', ...btn, padding:'0.75rem 2rem' }}>💾 Save</button></div>
      );

      case 'packages': return (
        <div><h2>📦 Health Packages ({healthPackages.length})</h2><button onClick={()=>setShowPackageForm(true)} style={{ ...btn, marginBottom:'1rem' }}>+ Add</button>{showPackageForm&&<div style={{ backgroundColor:'#f9fafb', padding:'1rem', borderRadius:'0.5rem', marginBottom:'1rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}><input placeholder="Name *" value={packageForm.name} onChange={e=>setPackageForm({...packageForm,name:e.target.value})} style={inp} /><input placeholder="Tests (comma)" value={packageForm.included_tests} onChange={e=>setPackageForm({...packageForm,included_tests:e.target.value})} style={inp} /><input placeholder="Price" type="number" value={packageForm.price} onChange={e=>setPackageForm({...packageForm,price:e.target.value})} style={inp} /><input placeholder="Discount %" type="number" value={packageForm.discount} onChange={e=>setPackageForm({...packageForm,discount:e.target.value})} style={inp} /><select value={packageForm.for_gender} onChange={e=>setPackageForm({...packageForm,for_gender:e.target.value})} style={inp}><option>All</option><option>Male</option><option>Female</option></select><div><button onClick={addPackage} style={btn}>Add</button><button onClick={()=>setShowPackageForm(false)} style={{...btn,backgroundColor:'#6b7280'}}>Cancel</button></div></div>}<div style={{ display:'grid', gap:'0.5rem' }}>{healthPackages.length===0?<p style={{ padding:'2rem', textAlign:'center', color:'#888', backgroundColor:'white', borderRadius:'0.75rem' }}>No packages</p>:healthPackages.map((p,i)=><div key={i} style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1rem', display:'flex', justifyContent:'space-between' }}><div><strong>{p.name}</strong><div style={{ fontSize:'0.8rem',color:'#888' }}>{(p.included_tests||[]).join(', ')}</div><div>₹{p.price} {p.discount>0&&<span style={{ color:'#10b981' }}>({p.discount}% off)</span>}</div></div><button onClick={()=>removePackage(i)} style={del}>✕</button></div>)}</div><button onClick={savePackages} style={{ marginTop:'1rem', ...btn, padding:'0.75rem 2rem' }}>💾 Save</button></div>
      );

      case 'ambulance': return (
        <div><h2>🚑 Ambulance Fleet ({ambulanceFleet.length})</h2><button onClick={()=>setShowAmbulanceForm(true)} style={{ ...btn, marginBottom:'1rem' }}>+ Add</button>{showAmbulanceForm&&<div style={{ backgroundColor:'#f9fafb', padding:'1rem', borderRadius:'0.5rem', marginBottom:'1rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}><input placeholder="Vehicle No *" value={ambulanceForm.vehicle_number} onChange={e=>setAmbulanceForm({...ambulanceForm,vehicle_number:e.target.value})} style={inp} /><select value={ambulanceForm.type} onChange={e=>setAmbulanceForm({...ambulanceForm,type:e.target.value})} style={inp}><option value="basic">Basic</option><option value="cardiac">Cardiac</option><option value="ventilator">Ventilator</option><option value="neonatal">Neonatal</option><option value="wheelchair">Wheelchair</option></select><input placeholder="Driver Name" value={ambulanceForm.driver_name} onChange={e=>setAmbulanceForm({...ambulanceForm,driver_name:e.target.value})} style={inp} /><input placeholder="Driver Phone" value={ambulanceForm.driver_phone} onChange={e=>setAmbulanceForm({...ambulanceForm,driver_phone:e.target.value})} style={inp} /><input placeholder="Base Fare" type="number" value={ambulanceForm.base_fare} onChange={e=>setAmbulanceForm({...ambulanceForm,base_fare:e.target.value})} style={inp} /><input placeholder="Per KM" type="number" value={ambulanceForm.per_km} onChange={e=>setAmbulanceForm({...ambulanceForm,per_km:e.target.value})} style={inp} /><label><input type="checkbox" checked={ambulanceForm.available_24x7} onChange={e=>setAmbulanceForm({...ambulanceForm,available_24x7:e.target.checked})} />24x7</label><div><button onClick={addAmbulance} style={btn}>Add</button><button onClick={()=>setShowAmbulanceForm(false)} style={{...btn,backgroundColor:'#6b7280'}}>Cancel</button></div></div>}<div style={{ display:'grid', gap:'0.5rem' }}>{ambulanceFleet.length===0?<p style={{ padding:'2rem', textAlign:'center', color:'#888', backgroundColor:'white', borderRadius:'0.75rem' }}>No vehicles</p>:ambulanceFleet.map((v,i)=><div key={i} style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1rem', display:'flex', justifyContent:'space-between' }}><div><strong>{v.vehicle_number}</strong> - {v.type?.toUpperCase()}<div style={{ fontSize:'0.8rem',color:'#888' }}>Driver: {v.driver_name} ({v.driver_phone})</div><div>₹{v.base_fare} + ₹{v.per_km}/km</div></div><button onClick={()=>removeAmbulance(i)} style={del}>✕</button></div>)}</div><button onClick={saveAmbulanceFleet} style={{ marginTop:'1rem', ...btn, padding:'0.75rem 2rem' }}>💾 Save</button></div>
      );

      case 'schemes': return (
        <div><h2>💠 Schemes & Insurance</h2><form onSubmit={handleSchemeUpdate}><div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', marginBottom:'1rem' }}><h3>Government Schemes</h3><div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>{availableSchemes.map(s=><label key={s.value} style={{ display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer' }}><input type="checkbox" checked={schemesForm.schemes_accepted.includes(s.value)} onChange={e=>{if(e.target.checked) setSchemesForm({...schemesForm,schemes_accepted:[...schemesForm.schemes_accepted,s.value]}); else setSchemesForm({...schemesForm,schemes_accepted:schemesForm.schemes_accepted.filter(x=>x!==s.value)});}} />{s.label}</label>)}</div></div><div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', marginBottom:'1rem' }}><h3>Insurance Companies</h3><div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', maxHeight:'300px', overflowY:'auto' }}>{commonInsurances.map(ins=><label key={ins} style={{ display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer' }}><input type="checkbox" checked={schemesForm.insurance_accepted.includes(ins)} onChange={e=>{if(e.target.checked) setSchemesForm({...schemesForm,insurance_accepted:[...schemesForm.insurance_accepted,ins]}); else setSchemesForm({...schemesForm,insurance_accepted:schemesForm.insurance_accepted.filter(x=>x!==ins)});}} />{ins}</label>)}</div></div><div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', marginBottom:'1rem' }}><h3>Cashless & TPA</h3><div style={{ display:'flex', gap:'2rem' }}><label style={{ display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer' }}><input type="checkbox" checked={schemesForm.cashless_available} onChange={e=>setSchemesForm({...schemesForm,cashless_available:e.target.checked})} />💳 Cashless</label><label style={{ display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer' }}><input type="checkbox" checked={schemesForm.tpa_desk_available} onChange={e=>setSchemesForm({...schemesForm,tpa_desk_available:e.target.checked})} />🏧 TPA Desk</label></div></div><button type="submit" style={{ ...btn, padding:'0.75rem 2rem' }}>💾 Save</button></form></div>
      );

      case 'bookings': return (
        <div><h2>📋 Bookings</h2><ProviderTable columns={[{ key:'bookingId', label:'ID' },{ key:'patientName', label:'Patient' },{ key:'status', label:'Status' }]} data={bookings} loading={loading} emptyMessage="No bookings" /></div>
      );

      case 'profile': return (
        <div><h2>🏥 Profile</h2>{profile?<div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem' }}><p><strong>Name:</strong> {profile.name}</p><p><strong>Email:</strong> {profile.email||'N/A'}</p><p><strong>Phone:</strong> {profile.phone||'N/A'}</p><p><strong>City:</strong> {profile.address?.city}, {profile.address?.state}</p></div>:<p>Loading...</p>}</div>
      );

      case 'upload': return (
        <div>
          <h2>📤 Data Upload</h2>
          {uploadMessage&&<div style={{ backgroundColor:uploadMessage.includes('✅')?'#d1fae5':'#fee2e2', padding:'1rem', borderRadius:'0.5rem', marginBottom:'1rem' }}>{uploadMessage}</div>}
          <div style={{ backgroundColor:'#fef3c7', border:'3px solid #f59e0b', borderRadius:'1rem', padding:'2rem', marginBottom:'2rem', textAlign:'center' }}>
            <div style={{ fontSize:'3rem' }}>📥</div>
            <h3 style={{ color:'#92400e' }}>Complete Data Upload (Recommended)</h3>
            <p style={{ color:'#92400e', marginBottom:'1.5rem' }}>Download master Excel, fill ALL sheets, upload once. All data auto-populated.</p>
            <a href="https://hospital-backend-production-f1b1.up.railway.app/api/hospitals/provider/template/master/download" target="_blank" rel="noopener noreferrer" style={{ padding:'1rem 2rem', backgroundColor:'#f59e0b', color:'white', borderRadius:'0.75rem', textDecoration:'none', fontWeight:'bold', display:'inline-block' }}>📥 Download Master Template</a>
          </div>
          <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', marginBottom:'1.5rem' }}>
            <h3>📤 Upload Filled Master Excel</h3>
            <form onSubmit={async (e) => { e.preventDefault(); if(!uploadFile) return; setLoading(true); try { const fd = new FormData(); fd.append('file', uploadFile); const r = await api.post('/hospitals/provider/upload-complete', fd, { headers:{'Content-Type':'multipart/form-data'} }); setUploadMessage(`✅ ${r.data.message}`); setUploadFile(null); setTimeout(()=>{setUploadMessage('');loadData();},3000); } catch(e) { setUploadMessage('❌ Failed'); } finally { setLoading(false); } }}>
              <input type="file" accept=".xlsx,.xls" onChange={e=>setUploadFile(e.target.files[0])} style={{ display:'block', marginBottom:'1rem' }} />
              <button type="submit" disabled={loading||!uploadFile} style={{ padding:'0.75rem 2rem', backgroundColor:loading?'#d1d5db':'#10b981', color:'white', border:'none', borderRadius:'0.5rem', cursor:loading?'not-allowed':'pointer', fontWeight:'bold' }}>{loading?'Uploading...':'📤 Upload & Update All Data'}</button>
            </form>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem' }}><h3>👨‍⚕️ Doctors Only</h3><button onClick={handleDownloadTemplate} style={{ ...btn, backgroundColor:'#6b7280', marginBottom:'0.5rem' }}>📥 Template</button><form onSubmit={handleExcelUpload}><input type="file" onChange={e=>{setUploadFile(e.target.files[0]);setUploadType('doctors');}} style={{ display:'block', marginBottom:'0.5rem' }} /><button type="submit" disabled={loading||!uploadFile||uploadType!=='doctors'} style={btn}>📤 Upload</button></form></div>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem' }}><h3>📊 Beds & Pricing</h3><form onSubmit={handleExcelUpload}><input type="file" onChange={e=>{setUploadFile(e.target.files[0]);setUploadType('data');}} style={{ display:'block', marginBottom:'0.5rem' }} /><button type="submit" disabled={loading||!uploadFile||uploadType!=='data'} style={{...btn,backgroundColor:'#3b82f6'}}>📤 Upload</button></form></div>
          </div>
        </div>
      );

      case 'whatsapp': return (
        <div><h2>💬 WhatsApp Setup</h2><div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'2rem', textAlign:'center' }}><div style={{ fontSize:'3rem' }}>💬</div><h3>Update Beds via WhatsApp</h3><div style={{ backgroundColor:'#f0fdf4', padding:'1rem', borderRadius:'0.5rem', textAlign:'left' }}><p>Save: <strong>+91-XXXXXXXXXX</strong></p><p>Send: <code style={{ backgroundColor:'#1e293b', color:'#e2e8f0', padding:'0.5rem', borderRadius:'0.25rem', display:'inline-block' }}>BEDS 350 AVL 45 ICU 12 VENT 5 ER OPEN</code></p></div></div></div>
      );

      case 'settings': return (
        <div>
          <h2>⚙️ Settings</h2>
          <div style={{ display:'grid', gap:'1rem', maxWidth:'500px' }}>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem' }}>
              <h3 style={{ color:'#92400e' }}>⚠️ Deactivate Account</h3>
              <p style={{ fontSize:'0.875rem', color:'#888' }}>Hidden from search. Can reactivate later.</p>
              <button onClick={async()=>{if(window.confirm('Deactivate?')){try{await api.put('/hospitals/provider/deactivate',{reason:'Dashboard request'});handleLogout();}catch(e){}}}} style={{ padding:'0.75rem 1.5rem', backgroundColor:'#fef3c7', border:'2px solid #f59e0b', borderRadius:'0.5rem', cursor:'pointer', color:'#92400e', fontWeight:'bold' }}>⚠️ Deactivate</button>
            </div>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem' }}>
              <h3 style={{ color:'#dc2626' }}>🗑️ Delete Account</h3>
              <p style={{ fontSize:'0.875rem', color:'#888' }}>Permanent deletion. Data removed in 30 days.</p>
              <button onClick={async()=>{if(window.confirm('Delete permanently?')&&window.confirm('Are you sure?')){try{await api.delete('/hospitals/provider/delete');handleLogout();}catch(e){}}}} style={{ padding:'0.75rem 1.5rem', backgroundColor:'#fee2e2', border:'2px solid #ef4444', borderRadius:'0.5rem', cursor:'pointer', color:'#dc2626', fontWeight:'bold' }}>🗑️ Delete Permanently</button>
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
