import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderDashboardLayout from '../../../components/ProviderDashboardLayout';
import ProviderStatsCards from '../../../components/ProviderStatsCards';
import ProviderTable from '../../../components/ProviderTable';
import { hospitalApi } from '../../../services/providerApi';
import ProviderAuth from '../../../components/ProviderAuth';
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
} from '../../../services/api';

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [profile, setProfile] = useState(null);
  
  // 🆕 New state for bed management
  const [bedForm, setBedForm] = useState({
    total: '',
    available: '',
    icu_available: '',
    ventilator_available: '',
    emergency_beds: ''
  });
  const [bedUpdateSuccess, setBedUpdateSuccess] = useState('');
  
  // 🆕 New state for schemes & insurance
  const [schemesForm, setSchemesForm] = useState({
    schemes_accepted: [],
    cashless_available: false,
    tpa_desk_available: false,
    insurance_accepted: []
  });
  
  // 🆕 New state for doctor form
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialization: '',
    qualification: '',
    experience: '',
    consultation_fee: '',
    languages: '',
    gender: 'Male',
    availability_days: '',
    morning_slots: '',
    evening_slots: '',
    max_patients: '20'
  });
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  
  // 🆕 New state for Excel upload
  const [uploadType, setUploadType] = useState(''); // 'doctors' or 'data'
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  
  // 🆕 Quick bed update (30 second method)
  const [quickBedStatus, setQuickBedStatus] = useState('');

  const sidebarItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'beds', label: '🛏️ Bed Management', icon: '🛏️' },
    { id: 'doctors', label: '👨‍⚕️ Doctors', icon: '👨‍⚕️' },
    { id: 'schemes', label: '💠 Schemes & Insurance', icon: '💠' },
    { id: 'bookings', label: '📋 Bookings', icon: '📋' },
    { id: 'profile', label: '🏥 Profile', icon: '🏥' },
    { id: 'upload', label: '📤 Excel Upload', icon: '📤' },
    { id: 'whatsapp', label: '💬 WhatsApp Setup', icon: '💬' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
  ];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('providerToken');
      if (!token) {
        navigate('/hospital/login');
        return;
      }

      if (activeTab === 'dashboard') {
        const statsRes = await getHospitalDashboardStats();
        setStats(statsRes.data.data);
        
        // Also load recent bookings
        const bookingsRes = await getHospitalBookings({ limit: 5 });
        setBookings(bookingsRes.data.data || []);
        
        // Load profile for bed form
        const profileRes = await hospitalApi.getProfile();
        setProfile(profileRes.data.data);
        
        // Set bed form defaults
        if (profileRes.data.data?.beds) {
          setBedForm({
            total: profileRes.data.data.beds.total || '',
            available: profileRes.data.data.beds.available || '',
            icu_available: profileRes.data.data.beds.icu_available || '',
            ventilator_available: profileRes.data.data.beds.ventilator_available || '',
            emergency_beds: profileRes.data.data.beds.emergency_beds || ''
          });
        }
        
        // Set schemes form defaults
        setSchemesForm({
          schemes_accepted: profileRes.data.data?.schemes_accepted || [],
          cashless_available: profileRes.data.data?.cashless_available || false,
          tpa_desk_available: profileRes.data.data?.tpa_desk_available || false,
          insurance_accepted: profileRes.data.data?.insurance_accepted || []
        });
        
      } else if (activeTab === 'doctors') {
        const doctorsRes = await hospitalApi.getDoctors();
        setDoctors(doctorsRes.data.data || []);
      } else if (activeTab === 'bookings') {
        const bookingsRes = await getHospitalBookings({ limit: 50 });
        setBookings(bookingsRes.data.data || []);
      } else if (activeTab === 'profile') {
        const profileRes = await hospitalApi.getProfile();
        setProfile(profileRes.data.data);
      } else if (activeTab === 'beds') {
        const profileRes = await hospitalApi.getProfile();
        setProfile(profileRes.data.data);
        if (profileRes.data.data?.beds) {
          setBedForm({
            total: profileRes.data.data.beds.total || '',
            available: profileRes.data.data.beds.available || '',
            icu_available: profileRes.data.data.beds.icu_available || '',
            ventilator_available: profileRes.data.data.beds.ventilator_available || '',
            emergency_beds: profileRes.data.data.beds.emergency_beds || ''
          });
        }
      } else if (activeTab === 'schemes') {
        const profileRes = await hospitalApi.getProfile();
        setProfile(profileRes.data.data);
        setSchemesForm({
          schemes_accepted: profileRes.data.data?.schemes_accepted || [],
          cashless_available: profileRes.data.data?.cashless_available || false,
          tpa_desk_available: profileRes.data.data?.tpa_desk_available || false,
          insurance_accepted: profileRes.data.data?.insurance_accepted || []
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        navigate('/hospital/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Handle bed update
  const handleBedUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const hospitalId = localStorage.getItem('providerId');
      await updateBedStatus(hospitalId, {
        beds: {
          total: parseInt(bedForm.total),
          available: parseInt(bedForm.available),
          icu_available: parseInt(bedForm.icu_available),
          ventilator_available: parseInt(bedForm.ventilator_available),
          emergency_beds: parseInt(bedForm.emergency_beds)
        },
        updateMethod: 'web_portal'
      });
      
      setBedUpdateSuccess('✅ Bed status updated successfully! Auto-expires in 4 hours.');
      setTimeout(() => setBedUpdateSuccess(''), 5000);
    } catch (error) {
      alert('Failed to update bed status');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Quick bed update preset
  const quickUpdate = async (preset) => {
    const presets = {
      'almost_full': { available: 5, icu: 2, ventilator: 1 },
      'half': { available: 25, icu: 8, ventilator: 4 },
      'mostly': { available: 50, icu: 15, ventilator: 8 }
    };
    
    const data = presets[preset];
    try {
      const hospitalId = localStorage.getItem('providerId');
      await updateBedStatus(hospitalId, {
        beds: {
          available: data.available,
          icu_available: data.icu,
          ventilator_available: data.ventilator
        },
        updateMethod: 'web_portal'
      });
      setQuickBedStatus('✅ Updated!');
      setTimeout(() => setQuickBedStatus(''), 3000);
      loadData();
    } catch (error) {
      alert('Quick update failed');
    }
  };

  // 🆕 Handle scheme update
  const handleSchemeUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const hospitalId = localStorage.getItem('providerId');
      await updateHospitalSchemes(hospitalId, {
        schemes_accepted: schemesForm.schemes_accepted
      });
      await updateHospitalInsurance(hospitalId, {
        insurance_accepted: schemesForm.insurance_accepted,
        cashless_available: schemesForm.cashless_available,
        tpa_desk_available: schemesForm.tpa_desk_available
      });
      alert('✅ Schemes & Insurance updated!');
    } catch (error) {
      alert('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Handle add doctor
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const hospitalId = localStorage.getItem('providerId');
      const doctorData = {
        name: doctorForm.name,
        specialization: doctorForm.specialization,
        qualification: doctorForm.qualification,
        experience: doctorForm.experience,
        consultation_fee: parseFloat(doctorForm.consultation_fee),
        languages: doctorForm.languages.split(',').map(l => l.trim()),
        gender: doctorForm.gender,
        availability: {
          days: doctorForm.availability_days.split(',').map(d => d.trim()),
          morning_slots: doctorForm.morning_slots,
          evening_slots: doctorForm.evening_slots,
          max_patients: parseInt(doctorForm.max_patients)
        }
      };
      
      if (editingDoctor) {
        await updateDoctor(hospitalId, editingDoctor._id, doctorData);
      } else {
        await addDoctor(hospitalId, doctorData);
      }
      
      setShowDoctorForm(false);
      setEditingDoctor(null);
      setDoctorForm({
        name: '', specialization: '', qualification: '', experience: '',
        consultation_fee: '', languages: '', gender: 'Male',
        availability_days: '', morning_slots: '', evening_slots: '', max_patients: '20'
      });
      loadData();
      alert('✅ Doctor saved!');
    } catch (error) {
      alert('Failed to save doctor');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Handle Excel upload
  const handleExcelUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a file');
      return;
    }
    setLoading(true);
    try {
      const hospitalId = localStorage.getItem('providerId');
      if (uploadType === 'doctors') {
        const res = await uploadDoctorsExcel(hospitalId, uploadFile);
        setUploadMessage(`✅ ${res.data.message}`);
      } else if (uploadType === 'data') {
        const res = await uploadHospitalDataExcel(hospitalId, uploadFile);
        setUploadMessage('✅ Hospital data updated!');
      }
      setUploadFile(null);
      setTimeout(() => setUploadMessage(''), 5000);
    } catch (error) {
      setUploadMessage('❌ Upload failed. Check file format.');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Download template
  const handleDownloadTemplate = async () => {
    try {
      const res = await downloadDoctorTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'doctor_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download template');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('providerToken');
    localStorage.removeItem('providerType');
    localStorage.removeItem('providerId');
    navigate('/hospital/login');
  };

  // 🆕 Available schemes list
  const availableSchemes = [
    { value: 'ayushman', label: 'Ayushman Bharat (PM-JAY)' },
    { value: 'cghs', label: 'CGHS' },
    { value: 'esi', label: 'ESI' },
    { value: 'echs', label: 'ECHS' },
    { value: 'state_scheme', label: 'State Health Scheme' },
    { value: 'senior_citizen', label: 'Senior Citizen Scheme' },
    { value: 'disability', label: 'Disability Scheme' }
  ];

  // 🆕 Common insurance companies
  const commonInsurances = [
    'Star Health', 'ICICI Lombard', 'HDFC Ergo', 'Bajaj Allianz',
    'Max Bupa', 'Religare Care', 'New India Assurance', 'Oriental Insurance',
    'United India Insurance', 'National Insurance', 'Aditya Birla Health',
    'ManipalCigna', 'Digit Health', 'Acko General Insurance',
    'SBI General', 'Tata AIG', 'Royal Sundaram', 'IFFCO Tokio'
  ];

  const renderContent = () => {
    switch(activeTab) {
      // ============================================
      // DASHBOARD TAB
      // ============================================
      case 'dashboard':
        return (
          <div>
            <ProviderStatsCards stats={stats} />
            
            {/* 🆕 Quick Bed Update Section */}
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>⚡ Quick Bed Update (30 seconds)</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                Current: {profile?.beds?.available || 0} beds available • Last updated: {profile?.beds?.last_updated ? new Date(profile.beds.last_updated).toLocaleString() : 'Never'}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => quickUpdate('almost_full')} style={{ padding: '0.5rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', cursor: 'pointer' }}>
                  🔴 Almost Full (0-10 beds)
                </button>
                <button onClick={() => quickUpdate('half')} style={{ padding: '0.5rem 1rem', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '0.5rem', cursor: 'pointer' }}>
                  🟡 Half Available (10-30 beds)
                </button>
                <button onClick={() => quickUpdate('mostly')} style={{ padding: '0.5rem 1rem', backgroundColor: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '0.5rem', cursor: 'pointer' }}>
                  🟢 Mostly Available (30+ beds)
                </button>
              </div>
              {quickBedStatus && <p style={{ marginTop: '0.5rem', color: '#10b981', fontWeight: 'bold' }}>{quickBedStatus}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Recent Bookings */}
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📋 Recent Bookings</h3>
                {bookings.length === 0 ? (
                  <p style={{ color: '#6b7280' }}>No recent bookings</p>
                ) : (
                  bookings.slice(0, 5).map((booking, index) => (
                    <div key={index} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{booking.patientName}</span>
                        <span style={{ 
                          padding: '0.15rem 0.5rem', 
                          borderRadius: '10px', 
                          fontSize: '0.7rem',
                          backgroundColor: booking.status === 'confirmed' ? '#dcfce7' : '#fef3c7',
                          color: booking.status === 'confirmed' ? '#166534' : '#92400e'
                        }}>
                          {booking.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Actions */}
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>⚡ Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button onClick={() => setActiveTab('beds')} style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', cursor: 'pointer' }}>
                    🛏️ Update Beds
                  </button>
                  <button onClick={() => setActiveTab('doctors')} style={{ padding: '0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', cursor: 'pointer' }}>
                    👨‍⚕️ Manage Doctors
                  </button>
                  <button onClick={() => setActiveTab('schemes')} style={{ padding: '0.75rem', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '0.5rem', cursor: 'pointer' }}>
                    💠 Update Schemes
                  </button>
                  <button onClick={() => setActiveTab('upload')} style={{ padding: '0.75rem', backgroundColor: '#f3e8ff', border: '1px solid #d8b4fe', borderRadius: '0.5rem', cursor: 'pointer' }}>
                    📤 Excel Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      // ============================================
      // 🆕 BED MANAGEMENT TAB
      // ============================================
      case 'beds':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>🛏️ Bed Management</h2>
            
            {/* WhatsApp Instructions */}
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>💬 Update via WhatsApp</h4>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Send WhatsApp to <strong>+91-XXXXXXXXXX</strong>:</p>
              <code style={{ backgroundColor: '#1e293b', color: '#e2e8f0', padding: '0.75rem', borderRadius: '0.5rem', display: 'block', fontSize: '0.875rem' }}>
                BEDS 350 AVL 45 ICU 12 VENT 5 ER OPEN
              </code>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Format: BEDS [total] AVL [available] ICU [icu_beds] VENT [ventilators] ER [OPEN/CLOSED]
              </p>
            </div>

            {/* Bed Update Form */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Update Bed Status</h3>
              {bedUpdateSuccess && (
                <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                  {bedUpdateSuccess}
                </div>
              )}
              <form onSubmit={handleBedUpdate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Total Beds</label>
                    <input type="number" value={bedForm.total} onChange={(e) => setBedForm({...bedForm, total: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Available Beds</label>
                    <input type="number" value={bedForm.available} onChange={(e) => setBedForm({...bedForm, available: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>ICU Available</label>
                    <input type="number" value={bedForm.icu_available} onChange={(e) => setBedForm({...bedForm, icu_available: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Ventilators Available</label>
                    <input type="number" value={bedForm.ventilator_available} onChange={(e) => setBedForm({...bedForm, ventilator_available: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Emergency Beds</label>
                    <input type="number" value={bedForm.emergency_beds} onChange={(e) => setBedForm({...bedForm, emergency_beds: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '0.75rem 2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  {loading ? 'Updating...' : '📤 Update Bed Status'}
                </button>
              </form>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                ⚠️ Manual updates auto-expire after 4 hours. Update regularly for better visibility.
              </p>
            </div>
          </div>
        );

      // ============================================
      // 🆕 SCHEMES & INSURANCE TAB
      // ============================================
      case 'schemes':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>💠 Schemes & Insurance</h2>
            
            <form onSubmit={handleSchemeUpdate}>
              {/* Government Schemes */}
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Government Schemes Accepted</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {availableSchemes.map(scheme => (
                    <label key={scheme.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={schemesForm.schemes_accepted.includes(scheme.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSchemesForm({
                              ...schemesForm,
                              schemes_accepted: [...schemesForm.schemes_accepted, scheme.value]
                            });
                          } else {
                            setSchemesForm({
                              ...schemesForm,
                              schemes_accepted: schemesForm.schemes_accepted.filter(s => s !== scheme.value)
                            });
                          }
                        }}
                      />
                      <span style={{ fontSize: '0.875rem' }}>{scheme.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Insurance Companies */}
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🛡️ Insurance Companies Accepted</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {commonInsurances.map(ins => (
                    <label key={ins} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={schemesForm.insurance_accepted.includes(ins)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSchemesForm({
                              ...schemesForm,
                              insurance_accepted: [...schemesForm.insurance_accepted, ins]
                            });
                          } else {
                            setSchemesForm({
                              ...schemesForm,
                              insurance_accepted: schemesForm.insurance_accepted.filter(i => i !== ins)
                            });
                          }
                        }}
                      />
                      <span style={{ fontSize: '0.875rem' }}>{ins}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cashless & TPA */}
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>💳 Cashless & TPA</h3>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={schemesForm.cashless_available}
                      onChange={(e) => setSchemesForm({...schemesForm, cashless_available: e.target.checked})}
                    />
                    <span>💳 Cashless Available</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={schemesForm.tpa_desk_available}
                      onChange={(e) => setSchemesForm({...schemesForm, tpa_desk_available: e.target.checked})}
                    />
                    <span>🏧 TPA Desk Available</span>
                  </label>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ padding: '0.75rem 2rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                {loading ? 'Saving...' : '💾 Save Schemes & Insurance'}
              </button>
            </form>
          </div>
        );

      // ============================================
      // DOCTORS TAB (Enhanced)
      // ============================================
      case 'doctors':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>👨‍⚕️ Doctors ({doctors.length})</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleDownloadTemplate} style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer' }}>
                  📥 Download Template
                </button>
                <button onClick={() => { setShowDoctorForm(true); setEditingDoctor(null); }} style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  ➕ Add Doctor
                </button>
              </div>
            </div>

            {/* Add/Edit Doctor Form */}
            {showDoctorForm && (
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h3>
                <form onSubmit={handleAddDoctor}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Name *</label>
                      <input type="text" required value={doctorForm.name} onChange={(e) => setDoctorForm({...doctorForm, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Specialization *</label>
                      <input type="text" required value={doctorForm.specialization} onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Qualification</label>
                      <input type="text" value={doctorForm.qualification} onChange={(e) => setDoctorForm({...doctorForm, qualification: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Experience</label>
                      <input type="text" value={doctorForm.experience} onChange={(e) => setDoctorForm({...doctorForm, experience: e.target.value})} placeholder="e.g., 15 years" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Consultation Fee (₹) *</label>
                      <input type="number" required value={doctorForm.consultation_fee} onChange={(e) => setDoctorForm({...doctorForm, consultation_fee: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Languages (comma separated)</label>
                      <input type="text" value={doctorForm.languages} onChange={(e) => setDoctorForm({...doctorForm, languages: e.target.value})} placeholder="English, Hindi, Bengali" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Gender</label>
                      <select value={doctorForm.gender} onChange={(e) => setDoctorForm({...doctorForm, gender: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Available Days (comma separated)</label>
                      <input type="text" value={doctorForm.availability_days} onChange={(e) => setDoctorForm({...doctorForm, availability_days: e.target.value})} placeholder="Mon, Tue, Wed, Thu, Fri" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Morning Slots</label>
                      <input type="text" value={doctorForm.morning_slots} onChange={(e) => setDoctorForm({...doctorForm, morning_slots: e.target.value})} placeholder="09:00-13:00" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Evening Slots</label>
                      <input type="text" value={doctorForm.evening_slots} onChange={(e) => setDoctorForm({...doctorForm, evening_slots: e.target.value})} placeholder="17:00-20:00" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Max Patients/Day</label>
                      <input type="number" value={doctorForm.max_patients} onChange={(e) => setDoctorForm({...doctorForm, max_patients: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                      {loading ? 'Saving...' : '💾 Save Doctor'}
                    </button>
                    <button type="button" onClick={() => setShowDoctorForm(false)} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Doctors Table */}
            <ProviderTable
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'specialization', label: 'Specialization' },
                { key: 'consultation_fee', label: 'Fee (₹)' },
                { key: 'experience', label: 'Experience' },
                { 
                  key: 'availability', 
                  label: 'Status',
                  render: (availability) => (
                    <span style={{ 
                      padding: '0.15rem 0.5rem', 
                      borderRadius: '10px', 
                      fontSize: '0.7rem',
                      backgroundColor: availability?.status === 'available' ? '#dcfce7' : 
                                     availability?.status === 'limited' ? '#fef3c7' : '#fee2e2',
                      color: availability?.status === 'available' ? '#166534' : 
                            availability?.status === 'limited' ? '#92400e' : '#dc2626'
                    }}>
                      {availability?.status || 'N/A'}
                    </span>
                  )
                }
              ]}
              data={doctors}
              onEdit={(row) => {
                setDoctorForm({
                  name: row.name || '',
                  specialization: row.specialization || '',
                  qualification: row.qualification || '',
                  experience: row.experience || '',
                  consultation_fee: row.consultation_fee || '',
                  languages: row.languages?.join(', ') || '',
                  gender: row.gender || 'Male',
                  availability_days: row.availability?.days?.join(', ') || '',
                  morning_slots: row.availability?.morning_slots || '',
                  evening_slots: row.availability?.evening_slots || '',
                  max_patients: row.availability?.max_patients || '20'
                });
                setEditingDoctor(row);
                setShowDoctorForm(true);
              }}
              onDelete={async (row) => {
                if (window.confirm(`Delete ${row.name}?`)) {
                  try {
                    const hospitalId = localStorage.getItem('providerId');
                    await removeDoctor(hospitalId, row._id);
                    loadData();
                    alert('Doctor removed');
                  } catch (error) {
                    alert('Failed to delete');
                  }
                }
              }}
              loading={loading}
            />
          </div>
        );

      // ============================================
      // 🆕 EXCEL UPLOAD TAB
      // ============================================
      case 'upload':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>📤 Excel Upload</h2>
            
            {uploadMessage && (
              <div style={{ 
                backgroundColor: uploadMessage.includes('✅') ? '#d1fae5' : '#fee2e2',
                color: uploadMessage.includes('✅') ? '#065f46' : '#dc2626',
                padding: '1rem', 
                borderRadius: '0.5rem', 
                marginBottom: '1rem' 
              }}>
                {uploadMessage}
              </div>
            )}

            {/* Upload Doctors */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>👨‍⚕️ Upload Doctors (Excel)</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                Download template, fill it, and upload. All existing doctors will be replaced.
              </p>
              <button onClick={handleDownloadTemplate} style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
                📥 Download Doctor Template
              </button>
              <form onSubmit={handleExcelUpload}>
                <input 
                  type="file" 
                  accept=".xlsx,.xls" 
                  onChange={(e) => {
                    setUploadFile(e.target.files[0]);
                    setUploadType('doctors');
                  }} 
                  style={{ marginBottom: '0.5rem', display: 'block' }}
                />
                <button type="submit" disabled={loading || !uploadFile || uploadType !== 'doctors'} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  {loading ? 'Uploading...' : '📤 Upload Doctors'}
                </button>
              </form>
            </div>

            {/* Upload Data */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📊 Upload Beds & Pricing (Excel)</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                Upload Excel with columns: Total Beds, Available Beds, ICU Beds, OPD Fee, ICU Per Day, General Ward
              </p>
              <form onSubmit={handleExcelUpload}>
                <input 
                  type="file" 
                  accept=".xlsx,.xls" 
                  onChange={(e) => {
                    setUploadFile(e.target.files[0]);
                    setUploadType('data');
                  }} 
                  style={{ marginBottom: '0.5rem', display: 'block' }}
                />
                <button type="submit" disabled={loading || !uploadFile || uploadType !== 'data'} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  {loading ? 'Uploading...' : '📤 Upload Data'}
                </button>
              </form>
            </div>
          </div>
        );

      // ============================================
      // 🆕 WHATSAPP SETUP TAB
      // ============================================
      case 'whatsapp':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>💬 WhatsApp Update Setup</h2>
            
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <h3 style={{ marginBottom: '1rem' }}>Update Beds via WhatsApp</h3>
              
              <div style={{ backgroundColor: '#f0fdf4', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Step 1: Save this number</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '1rem' }}>+91-XXXXXXXXXX</p>
                
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Step 2: Send this message format</p>
                <div style={{ backgroundColor: '#1e293b', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  BEDS 350 AVL 45 ICU 12 VENT 5 ER OPEN
                </div>
                
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Step 3: Breakdown</p>
                <table style={{ width: '100%', fontSize: '0.875rem' }}>
                  <tbody>
                    <tr><td style={{ padding: '0.25rem' }}><code>BEDS 350</code></td><td>= Total beds in hospital</td></tr>
                    <tr><td style={{ padding: '0.25rem' }}><code>AVL 45</code></td><td>= Currently available beds</td></tr>
                    <tr><td style={{ padding: '0.25rem' }}><code>ICU 12</code></td><td>= Available ICU beds</td></tr>
                    <tr><td style={{ padding: '0.25rem' }}><code>VENT 5</code></td><td>= Available ventilators</td></tr>
                    <tr><td style={{ padding: '0.25rem' }}><code>ER OPEN</code></td><td>= Emergency status (OPEN/CLOSED)</td></tr>
                  </tbody>
                </table>
              </div>

              <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '0.5rem', textAlign: 'left' }}>
                <strong>📌 Tips:</strong>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                  <li>Update every 4 hours for best visibility</li>
                  <li>You'll receive auto-reminders if not updated</li>
                  <li>Active hospitals rank higher in search results</li>
                  <li>Only numbers, no decimals needed</li>
                </ul>
              </div>
            </div>
          </div>
        );

      // ============================================
      // BOOKINGS TAB (PRESERVED)
      // ============================================
      case 'bookings':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>📋 Bookings</h2>
            <ProviderTable
              columns={[
                { key: 'bookingId', label: 'ID' },
                { key: 'patientName', label: 'Patient' },
                { key: 'doctorName', label: 'Doctor' },
                { key: 'date', label: 'Date' },
                { key: 'status', label: 'Status', render: (status) => (
                  <span style={{ 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '10px', 
                    fontSize: '0.7rem',
                    backgroundColor: status === 'confirmed' ? '#dcfce7' : status === 'pending' ? '#fef3c7' : '#fee2e2',
                    color: status === 'confirmed' ? '#166534' : status === 'pending' ? '#92400e' : '#dc2626'
                  }}>
                    {status}
                  </span>
                )}
              ]}
              data={bookings}
              onView={(row) => alert(`View: ${row.patientName}`)}
              loading={loading}
              emptyMessage="No bookings found"
            />
          </div>
        );

      // ============================================
      // PROFILE TAB (PRESERVED)
      // ============================================
      case 'profile':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>🏥 Hospital Profile</h2>
            {profile ? (
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><strong>Name:</strong> {profile.name}</div>
                  <div><strong>Registration:</strong> {profile.registrationNumber || 'N/A'}</div>
                  <div><strong>Email:</strong> {profile.email || 'N/A'}</div>
                  <div><strong>Phone:</strong> {profile.phone || 'N/A'}</div>
                  <div><strong>Address:</strong> {profile.address?.city}, {profile.address?.state}</div>
                  <div><strong>Subscription:</strong> 
                    <span style={{ 
                      padding: '0.15rem 0.5rem', 
                      borderRadius: '10px', 
                      fontSize: '0.7rem',
                      backgroundColor: profile.subscription_plan === 'platinum' ? '#fef3c7' : '#f3f4f6',
                      color: profile.subscription_plan === 'platinum' ? '#92400e' : '#374151',
                      marginLeft: '0.5rem'
                    }}>
                      {profile.subscription_plan || 'Free'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        );

      default:
        return <div>Coming soon...</div>;
    }
  };

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
        {renderContent()}
      </ProviderDashboardLayout>
    </ProviderAuth>
  );
};

export default HospitalDashboard;