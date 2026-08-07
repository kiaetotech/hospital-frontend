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
  const [newVehicle, setNewVehicle] = useState({ vehicleNumber: '', type: 'basic' });
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', licenseNumber: '' });

  const token = localStorage.getItem('providerToken');
  const providerId = localStorage.getItem('providerId');

  const S = { input: { width:'100%', padding:'10px', marginBottom:'10px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px', boxSizing:'border-box' }, btn: { padding:'8px 18px', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer', fontSize:'14px' } };

  const sidebarItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' }, { id: 'profile', label: '🚑 Profile', icon: '🚑' }, { id: 'vehicles', label: '🚐 Vehicles', icon: '🚐' }, { id: 'drivers', label: '👨‍✈️ Drivers', icon: '👨‍✈️' }, { id: 'bookings', label: '📋 Bookings', icon: '📋' }, { id: 'corporate', label: '🏢 Corporate Plans', icon: '🏢' }, { id: 'reports', label: '📊 Reports', icon: '📊' }, { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
  ];

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!token) { navigate('/ambulance/login'); return; }
      if (activeTab === 'dashboard') {
        const [statsRes, bookingsRes] = await Promise.all([ambulanceApi.getStats(), ambulanceApi.getBookings({ limit: 5 })]);
        setStats(statsRes.data?.data || {}); setBookings(Array.isArray(bookingsRes.data?.data) ? bookingsRes.data.data : []);
      } else if (activeTab === 'bookings') {
        const res = await ambulanceApi.getBookings({ limit: 50 }); setBookings(Array.isArray(res.data?.data) ? res.data.data : []);
      } else if (activeTab === 'vehicles') {
        const res = await ambulanceApi.getVehicles(); setVehicles(Array.isArray(res.data?.data) ? res.data.data : []);
      } else if (activeTab === 'drivers') {
        const res = await ambulanceApi.getDrivers(); setDrivers(Array.isArray(res.data?.data) ? res.data.data : []);
      } else if (activeTab === 'profile') {
        const res = await ambulanceApi.getProfile(); setProfile(res.data?.data || {});
      }
    } catch (error) { if (error.response?.status === 401) { localStorage.clear(); navigate('/ambulance/login'); } }
    finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem('providerToken'); localStorage.removeItem('providerType'); navigate('/ambulance/login'); };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return (
        <div><ProviderStatsCards stats={stats} /><div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}><div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem' }}><h3 style={{ fontWeight:'bold', marginBottom:'1rem' }}>📋 Recent Bookings</h3>{bookings.length===0&&<p style={{color:'#6b7280'}}>No bookings yet</p>}{bookings.slice(0,5).map((b,i)=>(<div key={i} style={{padding:'0.5rem 0',borderBottom:'1px solid #e5e7eb'}}><div style={{display:'flex',justifyContent:'space-between'}}><span>{b.patientName||'Patient'}</span><span style={{padding:'0.15rem 0.5rem',borderRadius:'10px',fontSize:'0.7rem',backgroundColor:b.status==='en_route'?'#dbeafe':b.status==='completed'?'#dcfce7':'#fef3c7',color:b.status==='en_route'?'#1e40af':b.status==='completed'?'#166534':'#92400e'}}>{b.status||'pending'}</span></div><div style={{fontSize:'0.8rem',color:'#6b7280'}}>📍 {b.pickupLocation||'N/A'} → {b.dropLocation||'N/A'}</div></div>))}</div><div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem' }}><h3 style={{fontWeight:'bold',marginBottom:'1rem'}}>⚡ Quick Actions</h3><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}><button onClick={()=>setActiveTab('vehicles')} style={{padding:'0.75rem',backgroundColor:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',cursor:'pointer'}}>🚐 Vehicles</button><button onClick={()=>setActiveTab('drivers')} style={{padding:'0.75rem',backgroundColor:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',cursor:'pointer'}}>👨‍✈️ Drivers</button><button onClick={()=>setActiveTab('bookings')} style={{padding:'0.75rem',backgroundColor:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',cursor:'pointer'}}>📋 Bookings</button><button onClick={()=>setActiveTab('reports')} style={{padding:'0.75rem',backgroundColor:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',cursor:'pointer'}}>📊 Reports</button></div></div></div></div>
      );
      case 'vehicles': return (
        <div><div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}><h2 style={{ fontSize:'1.25rem', fontWeight:'bold' }}>🚐 Vehicles ({vehicles.length})</h2><button onClick={() => setShowVehicleForm(!showVehicleForm)} style={{ padding:'0.5rem 1rem', backgroundColor:'#2563eb', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer', fontWeight:'bold' }}>{showVehicleForm ? 'Cancel' : '➕ Add Vehicle'}</button></div>
        {showVehicleForm && (<div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', marginBottom:'1rem' }}><input placeholder="Vehicle Number *" value={newVehicle.vehicleNumber} onChange={e => setNewVehicle({...newVehicle, vehicleNumber: e.target.value})} style={S.input} /><select value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})} style={S.input}><option value="basic">Basic</option><option value="icu">ICU</option><option value="cardiac">Cardiac</option></select><button onClick={async()=>{if(!newVehicle.vehicleNumber)return alert('Required');await ambulanceApi.addVehicle(newVehicle);setNewVehicle({vehicleNumber:'',type:'basic'});setShowVehicleForm(false);const r=await ambulanceApi.getVehicles();setVehicles(Array.isArray(r.data?.data)?r.data.data:[]);}} style={{...S.btn,background:'#10b981',color:'white',marginTop:8}}>Save</button></div>)}
        {vehicles.length===0&&!showVehicleForm&&<p style={{color:'#6b7280',textAlign:'center',padding:'2rem'}}>No vehicles yet. Click + to add.</p>}
        <ProviderTable columns={[{key:'vehicleNumber',label:'Vehicle Number'},{key:'type',label:'Type'},{key:'driver',label:'Driver'},{key:'driverPhone',label:'Phone'},{key:'status',label:'Status',render:(s)=>(<span style={{padding:'0.15rem 0.5rem',borderRadius:'10px',fontSize:'0.7rem',backgroundColor:s==='available'?'#dcfce7':'#fef3c7',color:'#166534'}}>{s||'available'}</span>)}]} data={vehicles} loading={loading} /></div>
      );
      case 'drivers': return (
        <div><div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}><h2 style={{ fontSize:'1.25rem', fontWeight:'bold' }}>👨‍✈️ Drivers ({drivers.length})</h2><button onClick={() => setShowDriverForm(!showDriverForm)} style={{ padding:'0.5rem 1rem', backgroundColor:'#2563eb', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer', fontWeight:'bold' }}>{showDriverForm ? 'Cancel' : '➕ Add Driver'}</button></div>
        {showDriverForm && (<div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', marginBottom:'1rem' }}><input placeholder="Name *" value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} style={S.input} /><input placeholder="Phone *" value={newDriver.phone} onChange={e => setNewDriver({...newDriver, phone: e.target.value})} style={S.input} /><input placeholder="License" value={newDriver.licenseNumber} onChange={e => setNewDriver({...newDriver, licenseNumber: e.target.value})} style={S.input} /><button onClick={async()=>{if(!newDriver.name||!newDriver.phone)return alert('Required');await ambulanceApi.addDriver(newDriver);setNewDriver({name:'',phone:'',licenseNumber:''});setShowDriverForm(false);const r=await ambulanceApi.getDrivers();setDrivers(Array.isArray(r.data?.data)?r.data.data:[]);}} style={{...S.btn,background:'#10b981',color:'white',marginTop:8}}>Save</button></div>)}
        {drivers.length===0&&!showDriverForm&&<p style={{color:'#6b7280',textAlign:'center',padding:'2rem'}}>No drivers yet.</p>}
        <ProviderTable columns={[{key:'name',label:'Name'},{key:'phone',label:'Phone'},{key:'licenseNumber',label:'License'},{key:'status',label:'Status',render:(s)=>(<span style={{padding:'0.15rem 0.5rem',borderRadius:'10px',fontSize:'0.7rem',backgroundColor:s==='available'?'#dcfce7':'#fef3c7',color:'#166534'}}>{s||'available'}</span>)}]} data={drivers} loading={loading} /></div>
      );
      case 'bookings': return (
        <div><h2 style={{fontSize:'1.25rem',fontWeight:'bold',marginBottom:'1.5rem'}}>📋 Bookings</h2><div style={{marginBottom:'1rem',display:'flex',gap:'0.5rem'}}>{['all','pending','en_route','completed'].map(s=>(<button key={s} onClick={()=>setStatusFilter(s)} style={{padding:'0.25rem 1rem',backgroundColor:statusFilter===s?'#2563eb':'#e5e7eb',color:statusFilter===s?'white':'#4b5563',border:'none',borderRadius:'1rem',cursor:'pointer'}}>{s==='all'?'All':s==='en_route'?'En Route':s.charAt(0).toUpperCase()+s.slice(1)}</button>))}</div><ProviderTable columns={[{key:'bookingId',label:'ID'},{key:'patientName',label:'Patient'},{key:'pickupLocation',label:'Pickup'},{key:'dropLocation',label:'Drop'},{key:'status',label:'Status'}]} data={bookings.filter(b=>statusFilter==='all'||b.status===statusFilter)} loading={loading} /></div>
      );
      case 'corporate': return (<div><h2 style={{fontWeight:700,fontSize:'1.2rem',marginBottom:8}}>🏢 Corporate Plans</h2><p style={{color:'#64748b',marginBottom:16}}>Offer corporate ambulance retainers.</p><CorporatePlansTab providerType="ambulance" providerId={providerId} token={token} /></div>);
      case 'profile': return (<div><h2 style={{fontSize:'1.25rem',fontWeight:'bold',marginBottom:'1.5rem'}}>🚑 Profile</h2>{profile?<div style={{backgroundColor:'white',borderRadius:'0.75rem',padding:'1.5rem'}}><p><strong>Name:</strong> {profile.name||'N/A'}</p><p><strong>Email:</strong> {profile.email||'N/A'}</p><p><strong>Phone:</strong> {profile.phone||'N/A'}</p></div>:<p>Loading...</p>}</div>);
      case 'reports': return (<div><h2 style={{fontSize:'1.25rem',fontWeight:'bold',marginBottom:'1.5rem'}}>📊 Reports</h2><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1rem'}}><div style={{backgroundColor:'white',borderRadius:'0.75rem',padding:'1.5rem',textAlign:'center'}}><div style={{fontSize:'2rem',fontWeight:'bold',color:'#2563eb'}}>{stats.totalBookings||0}</div><div style={{color:'#6b7280'}}>Total</div></div><div style={{backgroundColor:'white',borderRadius:'0.75rem',padding:'1.5rem',textAlign:'center'}}><div style={{fontSize:'2rem',fontWeight:'bold',color:'#10b981'}}>{stats.activeBookings||0}</div><div style={{color:'#6b7280'}}>Active</div></div><div style={{backgroundColor:'white',borderRadius:'0.75rem',padding:'1.5rem',textAlign:'center'}}><div style={{fontSize:'2rem',fontWeight:'bold',color:'#f59e0b'}}>{vehicles.length||0}</div><div style={{color:'#6b7280'}}>Vehicles</div></div></div></div>);
      case 'settings': return (<div><h2 style={{fontSize:'1.25rem',fontWeight:'bold',marginBottom:'1.5rem'}}>⚙️ Settings</h2><div style={{backgroundColor:'white',borderRadius:'0.75rem',padding:'1.5rem'}}><p><strong>Type:</strong> Ambulance</p><p><strong>Status:</strong> Active</p><button onClick={handleLogout} style={{marginTop:'1rem',padding:'0.5rem 1.5rem',backgroundColor:'#ef4444',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer'}}>🚪 Logout</button></div></div>);
      default: return <div>Coming soon...</div>;
    }
  };

  return (<ProviderAuth providerType="ambulance"><ProviderDashboardLayout title="Ambulance Dashboard" icon="🚑" sidebarItems={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} userName={profile?.name||'Ambulance Admin'} userRole="Ambulance Service" logout={handleLogout}>{renderContent()}</ProviderDashboardLayout></ProviderAuth>);
};

export default AmbulanceDashboard;"// final fix" 
