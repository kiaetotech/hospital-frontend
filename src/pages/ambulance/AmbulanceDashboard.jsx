import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderDashboardLayout from '../../components/ProviderDashboardLayout';
import ProviderStatsCards from '../../components/ProviderStatsCards';
import ProviderTable from '../../components/ProviderTable';
import CorporatePlansTab from '../../components/CorporatePlansTab';
import { ambulanceApi } from '../../services/providerApi';
import ProviderAuth from '../../components/ProviderAuth';

const AmbulanceDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: '', type: 'basic', model: '', year: '',
    equipment: [], baseFare: '', perKmRate: '', nightCharge: '', waitingCharge: '',
    driverName: '', driverPhone: ''
  });
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', licenseNumber: '', experience: '' });
  const [equipmentInput, setEquipmentInput] = useState('');
  const [serviceAreas, setServiceAreas] = useState([]);
  const [areaInput, setAreaInput] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: '', phone: '', email: '', address: '', city: '',
    lat: '', lng: '',
    operatingHours: { open: '00:00', close: '23:59' },
    acceptsEmergency: true, acceptsScheduled: true, acceptsIntercity: false
  });

  const token = localStorage.getItem('providerToken');
  const providerId = localStorage.getItem('providerId');

  const S = { input: { width:'100%', padding:'10px', marginBottom:'10px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px', boxSizing:'border-box' }, btn: { padding:'8px 18px', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer', fontSize:'14px' }, label: { display:'block', fontSize:'12px', fontWeight:600, color:'#555', marginBottom:'4px' } };

  const ambulanceTypes = [
    { value: 'basic', label: 'Basic Life Support' },
    { value: 'cardiac', label: 'Cardiac' },
    { value: 'ventilator', label: 'Ventilator' },
    { value: 'neonatal', label: 'Neonatal' },
    { value: 'wheelchair', label: 'Wheelchair' }
  ];

  const sidebarItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'profile', label: '🏢 Profile', icon: '🏢' },
    { id: 'vehicles', label: '🚐 Vehicles', icon: '🚐' },
    { id: 'drivers', label: '👨‍✈️ Drivers', icon: '👨‍✈️' },
    { id: 'bookings', label: '📋 Bookings', icon: '📋' },
    { id: 'tracking', label: '📍 Live Tracking', icon: '📍' },
    { id: 'corporate', label: '🏢 Corporate Plans', icon: '🏢' },
    { id: 'reports', label: '📊 Reports', icon: '📊' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
  ];

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!token) { navigate('/ambulance/login'); return; }
      switch(activeTab) {
        case 'dashboard':
          const [statsRes, bookingsRes] = await Promise.all([ambulanceApi.getStats(), ambulanceApi.getBookings({ limit: 5 })]);
          setStats(statsRes.data?.data || {});
          setBookings(Array.isArray(bookingsRes.data?.data) ? bookingsRes.data.data : []);
          break;
        case 'bookings':
          const res = await ambulanceApi.getBookings({ limit: 50 });
          setBookings(Array.isArray(res.data?.data) ? res.data.data : []);
          break;
        case 'vehicles':
          const vRes = await ambulanceApi.getVehicles();
          setVehicles(Array.isArray(vRes.data?.data) ? vRes.data.data : []);
          break;
        case 'drivers':
          const dRes = await ambulanceApi.getDrivers();
          setDrivers(Array.isArray(dRes.data?.data) ? dRes.data.data : []);
          break;
        case 'profile':
          const pRes = await ambulanceApi.getProfile();
          const p = pRes.data?.data || {};
          setProfile(p);
          setProfileForm({
            name: p.name || '', phone: p.phone || '', email: p.email || '',
            address: p.ambulanceCompanyAddress?.address || '', city: p.ambulanceCompanyAddress?.city || '',
	    lat: p.ambulanceCompanyAddress?.coordinates?.lat || '', lng: p.ambulanceCompanyAddress?.coordinates?.lng || '',
            operatingHours: p.ambulanceSettings?.operatingHours || { open: '00:00', close: '23:59' },
            acceptsEmergency: p.ambulanceSettings?.acceptsEmergency !== false,
            acceptsScheduled: p.ambulanceSettings?.acceptsScheduled !== false,
            acceptsIntercity: p.ambulanceSettings?.acceptsIntercity || false
          });
          setServiceAreas(p.serviceAreas || []);
          setIsAvailable(p.isAvailable === true);
          break;
      }
    } catch (error) {
      if (error.response?.status === 401) { localStorage.clear(); navigate('/ambulance/login'); }
    } finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('providerToken');
    localStorage.removeItem('providerType');
    navigate('/ambulance/login');
  };

  const addEquipment = () => {
    if (equipmentInput.trim()) {
      setNewVehicle(prev => ({ ...prev, equipment: [...prev.equipment, equipmentInput.trim()] }));
      setEquipmentInput('');
    }
  };

  const addServiceArea = () => {
    if (areaInput.trim()) {
      setServiceAreas(prev => [...prev, areaInput.trim()]);
      setAreaInput('');
    }
  };

  const saveProfile = async () => {
    try {
      console.log('PROFILE SAVING:', JSON.stringify({ ...profileForm, serviceAreas, isAvailable }));
      await ambulanceApi.updateProfile({ ...profileForm, serviceAreas, isAvailable });
      if (profileForm.lat && profileForm.lng) {
        await ambulanceApi.updateLocation({ lat: parseFloat(profileForm.lat), lng: parseFloat(profileForm.lng) });
      }
      setProfile(prev => ({ ...prev, ...profileForm, serviceAreas, isAvailable }));
      alert('Profile updated!');
    } catch (err) { alert('Failed to update profile'); }
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return (
        <div>
          <ProviderStatsCards stats={stats} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginTop:'1.5rem' }}>
            <div style={cardStyle}>
              <h3 style={{ fontWeight:'bold', marginBottom:'1rem' }}>📋 Recent Bookings</h3>
              {bookings.length===0 && <p style={{color:'#6b7280'}}>No bookings yet</p>}
              {bookings.slice(0,5).map((b,i) => (
                <div key={i} style={{padding:'0.5rem 0',borderBottom:'1px solid #e5e7eb'}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span>{b.patientName||'Patient'}</span>
                    <span style={{padding:'0.15rem 0.5rem',borderRadius:'10px',fontSize:'0.7rem',backgroundColor:b.status==='en_route'?'#dbeafe':b.status==='completed'?'#dcfce7':'#fef3c7',color:b.status==='en_route'?'#1e40af':b.status==='completed'?'#166534':'#92400e'}}>{b.status||'pending'}</span>
                  </div>
                  <div style={{fontSize:'0.8rem',color:'#6b7280'}}>📍 {b.pickupLocation||'N/A'} → {b.dropLocation||'N/A'}</div>
                </div>
              ))}
            </div>
            <div style={cardStyle}>
              <h3 style={{fontWeight:'bold',marginBottom:'1rem'}}>⚡ Quick Actions</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
                <button onClick={()=>setActiveTab('vehicles')} style={quickBtnStyle}>🚐 Vehicles</button>
                <button onClick={()=>setActiveTab('drivers')} style={quickBtnStyle}>👨‍✈️ Drivers</button>
                <button onClick={()=>setActiveTab('bookings')} style={quickBtnStyle}>📋 Bookings</button>
                <button onClick={()=>setActiveTab('tracking')} style={quickBtnStyle}>📍 Tracking</button>
              </div>
            </div>
          </div>
        </div>
      );

      case 'profile': return (
        <div>
          <h2 style={{fontSize:'1.25rem',fontWeight:'bold',marginBottom:'1.5rem'}}>🏢 Company Profile</h2>
          <div style={cardStyle}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
              <div><label style={S.label}>Company Name *</label><input value={profileForm.name} onChange={e=>setProfileForm({...profileForm, name:e.target.value})} style={S.input} /></div>
              <div><label style={S.label}>Phone *</label><input value={profileForm.phone} onChange={e=>setProfileForm({...profileForm, phone:e.target.value})} style={S.input} /></div>
              <div><label style={S.label}>Email</label><input value={profileForm.email} onChange={e=>setProfileForm({...profileForm, email:e.target.value})} style={S.input} /></div>
              <div><label style={S.label}>City *</label><input value={profileForm.city} onChange={e=>setProfileForm({...profileForm, city:e.target.value})} style={S.input} placeholder="e.g. Mumbai" /></div>
	      <div><label style={S.label}>Latitude</label><input value={profileForm.lat} onChange={e=>setProfileForm({...profileForm, lat:e.target.value})} style={S.input} placeholder="e.g. 19.0760" /></div>
               <div><label style={S.label}>Longitude</label><input value={profileForm.lng} onChange={e=>setProfileForm({...profileForm, lng:e.target.value})} style={S.input} placeholder="e.g. 72.8777" /></div>
            </div>
            <div><label style={S.label}>Address</label><input value={profileForm.address} onChange={e=>setProfileForm({...profileForm, address:e.target.value})} style={S.input} /></div>
            
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
              <div><label style={S.label}>Operating Hours Open</label><input type="time" value={profileForm.operatingHours.open} onChange={e=>setProfileForm({...profileForm, operatingHours:{...profileForm.operatingHours, open:e.target.value}})} style={S.input} /></div>
              <div><label style={S.label}>Operating Hours Close</label><input type="time" value={profileForm.operatingHours.close} onChange={e=>setProfileForm({...profileForm, operatingHours:{...profileForm.operatingHours, close:e.target.value}})} style={S.input} /></div>
            </div>

            <div style={{display:'flex', gap:'16px', marginBottom:'12px'}}>
              <label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px'}}><input type="checkbox" checked={profileForm.acceptsEmergency} onChange={e=>setProfileForm({...profileForm, acceptsEmergency:e.target.checked})} /> Accept Emergency</label>
              <label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px'}}><input type="checkbox" checked={profileForm.acceptsScheduled} onChange={e=>setProfileForm({...profileForm, acceptsScheduled:e.target.checked})} /> Accept Scheduled</label>
              <label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px'}}><input type="checkbox" checked={profileForm.acceptsIntercity} onChange={e=>setProfileForm({...profileForm, acceptsIntercity:e.target.checked})} /> Intercity</label>
            </div>

            <div style={{marginBottom:'12px'}}>
              <label style={S.label}>Service Areas (cities)</label>
              <div style={{display:'flex',gap:'8px',marginBottom:'8px'}}>
                <input value={areaInput} onChange={e=>setAreaInput(e.target.value)} placeholder="Add city" style={{...S.input, flex:1, marginBottom:0}} />
                <button onClick={addServiceArea} style={{...S.btn, background:'#2196f3', color:'white'}}>Add</button>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                {serviceAreas.map((a,i)=>(
                  <span key={i} style={{padding:'4px 10px',background:'#e0e7ff',borderRadius:'12px',fontSize:'12px',display:'flex',alignItems:'center',gap:'4px'}}>
                    📍 {a} <span onClick={()=>setServiceAreas(prev=>prev.filter((_,idx)=>idx!==i))} style={{cursor:'pointer',color:'#e53935'}}>✕</span>
                  </span>
                ))}
              </div>
            </div>

            <div style={{marginBottom:'12px'}}>
              <label style={S.label}>Availability Status</label>
              <button onClick={()=>setIsAvailable(!isAvailable)} style={{
                padding:'10px 24px',border:'none',borderRadius:'8px',fontWeight:'bold',cursor:'pointer',
                background: isAvailable ? '#10b981' : '#ef4444', color:'white'
              }}>{isAvailable ? '🟢 Online - Accepting Trips' : '🔴 Offline - Not Accepting'}</button>
            </div>

            <button onClick={saveProfile} style={{...S.btn, background:'#2563eb', color:'white', padding:'12px 32px'}}>💾 Save Profile</button>
          </div>
        </div>
      );

      case 'vehicles': return (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
            <h2 style={{ fontSize:'1.25rem', fontWeight:'bold' }}>🚐 Vehicles ({vehicles.length})</h2>
            <button onClick={() => setShowVehicleForm(!showVehicleForm)} style={{ padding:'0.5rem 1rem', backgroundColor:'#2563eb', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer', fontWeight:'bold' }}>
              {showVehicleForm ? 'Cancel' : '➕ Add Vehicle'}
            </button>
          </div>
          {showVehicleForm && (
            <div style={cardStyle}>
              <h3 style={{fontWeight:'bold',marginBottom:'1rem'}}>Add New Vehicle</h3>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <div><label style={S.label}>Vehicle Number *</label><input value={newVehicle.vehicleNumber} onChange={e=>setNewVehicle({...newVehicle, vehicleNumber:e.target.value})} style={S.input} /></div>
                <div>
                  <label style={S.label}>Vehicle Type *</label>
                  <select value={newVehicle.type} onChange={e=>setNewVehicle({...newVehicle, type:e.target.value})} style={S.input}>
                    {ambulanceTypes.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div><label style={S.label}>Model</label><input value={newVehicle.model} onChange={e=>setNewVehicle({...newVehicle, model:e.target.value})} placeholder="e.g. Force Traveller" style={S.input} /></div>
                <div><label style={S.label}>Year</label><input value={newVehicle.year} onChange={e=>setNewVehicle({...newVehicle, year:e.target.value})} placeholder="e.g. 2024" style={S.input} /></div>
              </div>

              <div style={{marginBottom:'12px'}}>
                <label style={S.label}>Equipment</label>
                <div style={{display:'flex',gap:'8px',marginBottom:'8px'}}>
                  <input value={equipmentInput} onChange={e=>setEquipmentInput(e.target.value)} placeholder="e.g. Defibrillator, Ventilator" style={{...S.input, flex:1, marginBottom:0}} />
                  <button onClick={addEquipment} style={{...S.btn, background:'#2196f3', color:'white'}}>Add</button>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                  {newVehicle.equipment.map((eq,i)=>(
                    <span key={i} style={{padding:'4px 10px',background:'#fef3c7',borderRadius:'12px',fontSize:'12px',display:'flex',alignItems:'center',gap:'4px'}}>
                      🛠️ {eq} <span onClick={()=>setNewVehicle(prev=>({...prev, equipment:prev.equipment.filter((_,idx)=>idx!==i)}))} style={{cursor:'pointer',color:'#e53935'}}>✕</span>
                    </span>
                  ))}
                </div>
              </div>

              <h4 style={{fontWeight:'bold',marginBottom:'8px',marginTop:'12px'}}>💰 Pricing (₹)</h4>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <div><label style={S.label}>Base Fare *</label><input type="number" value={newVehicle.baseFare} onChange={e=>setNewVehicle({...newVehicle, baseFare:e.target.value})} placeholder="500" style={S.input} /></div>
                <div><label style={S.label}>Per KM Rate *</label><input type="number" value={newVehicle.perKmRate} onChange={e=>setNewVehicle({...newVehicle, perKmRate:e.target.value})} placeholder="25" style={S.input} /></div>
                <div><label style={S.label}>Night Charge</label><input type="number" value={newVehicle.nightCharge} onChange={e=>setNewVehicle({...newVehicle, nightCharge:e.target.value})} placeholder="200" style={S.input} /></div>
                <div><label style={S.label}>Waiting Charge</label><input type="number" value={newVehicle.waitingCharge} onChange={e=>setNewVehicle({...newVehicle, waitingCharge:e.target.value})} placeholder="100/hr" style={S.input} /></div>
              </div>

              <h4 style={{fontWeight:'bold',marginBottom:'8px',marginTop:'12px'}}>👨‍✈️ Assign Driver</h4>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <div><label style={S.label}>Driver Name</label><input value={newVehicle.driverName} onChange={e=>setNewVehicle({...newVehicle, driverName:e.target.value})} style={S.input} /></div>
                <div><label style={S.label}>Driver Phone</label><input value={newVehicle.driverPhone} onChange={e=>setNewVehicle({...newVehicle, driverPhone:e.target.value})} style={S.input} /></div>
              </div>

              <button onClick={async()=>{
    if(!newVehicle.vehicleNumber) return alert('Vehicle number required');
    if(!newVehicle.baseFare || !newVehicle.perKmRate) return alert('Base fare and per km rate required');
    await ambulanceApi.addVehicle({
      ...newVehicle,
      year: newVehicle.year ? parseInt(newVehicle.year) : undefined,
      baseFare: parseInt(newVehicle.baseFare) || 0,
      perKmRate: parseInt(newVehicle.perKmRate) || 0,
      nightCharge: parseInt(newVehicle.nightCharge) || 0,
      waitingCharge: parseInt(newVehicle.waitingCharge) || 0,
    });
    setNewVehicle({vehicleNumber:'',type:'basic',model:'',year:'',equipment:[],baseFare:'',perKmRate:'',nightCharge:'',waitingCharge:'',driverName:'',driverPhone:''});
    setShowVehicleForm(false);
    const r=await ambulanceApi.getVehicles();
    setVehicles(Array.isArray(r.data?.data)?r.data.data:[]);
}} style={{...S.btn,background:'#10b981',color:'white',marginTop:12,padding:'12px 24px'}}>💾 Save Vehicle</button>
            </div>
          )}
          {vehicles.length===0 && !showVehicleForm && <p style={{color:'#6b7280',textAlign:'center',padding:'2rem'}}>No vehicles yet. Click + to add.</p>}
          <ProviderTable 
            columns={[
              {key:'vehicleNumber',label:'Vehicle #'},
              {key:'type',label:'Type'},
              {key:'equipment',label:'Equipment', render: (eq) => (Array.isArray(eq) && eq.length > 0) ? eq.join(', ') : '-'},
              {key:'baseFare',label:'Base ₹', render: (v) => (v || v === 0) ? `₹${v}` : '-'},
              {key:'perKmRate',label:'/KM ₹', render: (v) => (v || v === 0) ? `₹${v}` : '-'},
              {key:'driver',label:'Driver'},
              {key:'status',label:'Status',render:(s)=>(<span style={{padding:'0.15rem 0.5rem',borderRadius:'10px',fontSize:'0.7rem',backgroundColor:s==='available'?'#dcfce7':'#fef3c7',color:'#166534'}}>{s||'available'}</span>)}
            ]} 
            data={vehicles} 
            loading={loading} 
          />
        </div>
      );

      case 'drivers': return (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
            <h2 style={{ fontSize:'1.25rem', fontWeight:'bold' }}>👨‍✈️ Drivers ({drivers.length})</h2>
            <button onClick={() => setShowDriverForm(!showDriverForm)} style={{ padding:'0.5rem 1rem', backgroundColor:'#2563eb', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer', fontWeight:'bold' }}>
              {showDriverForm ? 'Cancel' : '➕ Add Driver'}
            </button>
          </div>
          {showDriverForm && (
            <div style={cardStyle}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <div><label style={S.label}>Name *</label><input value={newDriver.name} onChange={e=>setNewDriver({...newDriver, name:e.target.value})} style={S.input} /></div>
                <div><label style={S.label}>Phone *</label><input value={newDriver.phone} onChange={e=>setNewDriver({...newDriver, phone:e.target.value})} style={S.input} /></div>
                <div><label style={S.label}>License Number</label><input value={newDriver.licenseNumber} onChange={e=>setNewDriver({...newDriver, licenseNumber:e.target.value})} style={S.input} /></div>
                <div><label style={S.label}>Experience (years)</label><input value={newDriver.experience} onChange={e=>setNewDriver({...newDriver, experience:e.target.value})} style={S.input} /></div>
              </div>
              <button onClick={async()=>{
                if(!newDriver.name||!newDriver.phone) return alert('Name and phone required');
                await ambulanceApi.addDriver(newDriver);
                setNewDriver({name:'',phone:'',licenseNumber:'',experience:''});
                setShowDriverForm(false);
                const r=await ambulanceApi.getDrivers();
                setDrivers(Array.isArray(r.data?.data)?r.data.data:[]);
              }} style={{...S.btn,background:'#10b981',color:'white',marginTop:8,padding:'12px 24px'}}>💾 Save Driver</button>
            </div>
          )}
          {drivers.length===0 && !showDriverForm && <p style={{color:'#6b7280',textAlign:'center',padding:'2rem'}}>No drivers yet.</p>}
          <ProviderTable 
            columns={[
              {key:'name',label:'Name'},
              {key:'phone',label:'Phone'},
              {key:'licenseNumber',label:'License'},
              {key:'experience',label:'Exp (yrs)', render: (v) => (v && v !== '') ? v : '-'},
              {key:'status',label:'Status',render:(s)=>(<span style={{padding:'0.15rem 0.5rem',borderRadius:'10px',fontSize:'0.7rem',backgroundColor:s==='available'?'#dcfce7':'#fef3c7',color:'#166534'}}>{s||'available'}</span>)}
            ]} 
            data={drivers} 
            loading={loading} 
          />
        </div>
      );

      case 'bookings': return (
        <div>
          <h2 style={{fontSize:'1.25rem',fontWeight:'bold',marginBottom:'1.5rem'}}>📋 Bookings</h2>
          <div style={{marginBottom:'1rem',display:'flex',gap:'0.5rem'}}>
            {['all','pending','en_route','completed','cancelled'].map(s=>(
              <button key={s} onClick={()=>setStatusFilter(s)} style={{
                padding:'0.25rem 1rem',borderRadius:'1rem',cursor:'pointer',border:'none',
                background:statusFilter===s?'#2563eb':'#e5e7eb',
                color:statusFilter===s?'white':'#4b5563'
              }}>{s==='all'?'All':s==='en_route'?'En Route':s.charAt(0).toUpperCase()+s.slice(1)}</button>
            ))}
          </div>
          <ProviderTable 
            columns={[
              {key:'bookingId',label:'ID'},
              {key:'patientName',label:'Patient'},
              {key:'pickupLocation',label:'Pickup'},
              {key:'dropLocation',label:'Drop'},
              {key:'vehicleType',label:'Type'},
              {key:'amount',label:'Amount'},
              {key:'status',label:'Status'}
            ]} 
            data={bookings.filter(b=>statusFilter==='all'||b.status===statusFilter)} 
            loading={loading} 
          />
        </div>
      );

      case 'tracking': return (
        <div>
          <h2 style={{fontSize:'1.25rem',fontWeight:'bold',marginBottom:'1.5rem'}}>📍 Live Tracking</h2>
          <div style={cardStyle}>
            <p style={{color:'#6b7280',marginBottom:'1rem'}}>Real-time GPS tracking for active trips. Drivers update location via the Driver App.</p>
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'8px',padding:'16px',marginBottom:'12px'}}>
              <h4 style={{fontWeight:'bold',marginBottom:'8px'}}>📱 Driver App Links</h4>
              <div style={{display:'flex',gap:'12px'}}>
                <a href="/ambulance/driver-app" style={{...S.btn,background:'#2563eb',color:'white',textDecoration:'none',display:'inline-block'}}>🌐 Web App</a>
                <span style={{...S.btn,background:'#6b7280',color:'white'}}>📱 Android (Coming soon)</span>
                <span style={{...S.btn,background:'#6b7280',color:'white'}}>🍎 iOS (Coming soon)</span>
              </div>
            </div>
            {bookings.filter(b=>b.status==='en_route'||b.status==='in_progress').length === 0 ? (
              <p style={{textAlign:'center',padding:'2rem',color:'#6b7280'}}>No active trips being tracked</p>
            ) : (
              bookings.filter(b=>b.status==='en_route'||b.status==='in_progress').map((b,i)=>(
                <div key={i} style={{background:'#f9fafb',padding:'12px',borderRadius:'8px',marginBottom:'8px'}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span><strong>{b.vehicleNumber}</strong> - {b.driverName}</span>
                    <span style={{color:'#10b981',fontWeight:'bold'}}>● Live</span>
                  </div>
                  <div style={{fontSize:'13px',color:'#6b7280'}}>📍 {b.currentLocation || 'Tracking...'} → 🏥 {b.dropLocation}</div>
                </div>
              ))
            )}
          </div>
        </div>
      );

      case 'corporate': return (
        <div><h2 style={{fontWeight:700,fontSize:'1.2rem',marginBottom:8}}>🏢 Corporate Plans</h2><p style={{color:'#64748b',marginBottom:16}}>Offer corporate ambulance retainers.</p><CorporatePlansTab providerType="ambulance" providerId={providerId} token={token} /></div>
      );

      case 'reports': return (
        <div>
          <h2 style={{fontSize:'1.25rem',fontWeight:'bold',marginBottom:'1.5rem'}}>📊 Reports</h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1rem'}}>
            <div style={{...cardStyle,textAlign:'center'}}><div style={{fontSize:'2rem',fontWeight:'bold',color:'#2563eb'}}>{stats.totalBookings||0}</div><div style={{color:'#6b7280'}}>Total Trips</div></div>
            <div style={{...cardStyle,textAlign:'center'}}><div style={{fontSize:'2rem',fontWeight:'bold',color:'#10b981'}}>{stats.activeBookings||0}</div><div style={{color:'#6b7280'}}>Active</div></div>
            <div style={{...cardStyle,textAlign:'center'}}><div style={{fontSize:'2rem',fontWeight:'bold',color:'#f59e0b'}}>{vehicles.length||0}</div><div style={{color:'#6b7280'}}>Vehicles</div></div>
          </div>
        </div>
      );

      case 'settings': return (
        <div>
          <h2 style={{fontSize:'1.25rem',fontWeight:'bold',marginBottom:'1.5rem'}}>⚙️ Settings</h2>
          <div style={cardStyle}>
            <p><strong>Provider Type:</strong> Ambulance</p>
            <p><strong>Account Status:</strong> Active</p>
            <p><strong>Verification:</strong> {profile?.ambulanceVerificationStatus || 'Pending'}</p>
            <button onClick={handleLogout} style={{marginTop:'1rem',padding:'0.5rem 1.5rem',backgroundColor:'#ef4444',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer'}}>🚪 Logout</button>
          </div>
        </div>
      );

      default: return <div>Coming soon...</div>;
    }
  };

  return (
    <ProviderAuth providerType="ambulance">
      <ProviderDashboardLayout 
        title="Ambulance Dashboard" 
        icon="🚑" 
        sidebarItems={sidebarItems} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userName={profile?.name||'Ambulance Admin'} 
        userRole="Ambulance Service" 
        logout={handleLogout}
      >
        {renderContent()}
      </ProviderDashboardLayout>
    </ProviderAuth>
  );
};

const cardStyle = { backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem' };
const quickBtnStyle = { padding:'0.75rem', backgroundColor:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'0.5rem', cursor:'pointer' };

export default AmbulanceDashboard;
