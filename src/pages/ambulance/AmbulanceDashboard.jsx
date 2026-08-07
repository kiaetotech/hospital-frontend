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
  const [profile, setProfile] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const token = localStorage.getItem('providerToken');
  const providerId = localStorage.getItem('providerId');

  const sidebarItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'profile', label: '🚑 Profile', icon: '🚑' },
    { id: 'vehicles', label: '🚐 Vehicles', icon: '🚐' },
    { id: 'drivers', label: '👨‍✈️ Drivers', icon: '👨‍✈️' },
    { id: 'bookings', label: '📋 Bookings', icon: '📋' },
    { id: 'corporate', label: '🏢 Corporate Plans', icon: '🏢' },
    { id: 'reports', label: '📊 Reports', icon: '📊' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
  ];

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!token) { navigate('/ambulance/login'); return; }
      
      if (activeTab === 'dashboard') {
        const [statsRes, bookingsRes] = await Promise.all([
          ambulanceApi.getStats(),
          ambulanceApi.getBookings({ limit: 5 })
        ]);
        setStats(statsRes.data?.data || {});
        setBookings(bookingsRes.data?.data || []);
      } else if (activeTab === 'bookings') {
        const bookingsRes = await ambulanceApi.getBookings({ limit: 50 });
        setBookings(bookingsRes.data?.data || []);
      } else if (activeTab === 'vehicles') {
        const vehiclesRes = await ambulanceApi.getVehicles();
        setVehicles(vehiclesRes.data?.data || []);
      } else if (activeTab === 'profile') {
        const profileRes = await ambulanceApi.getProfile();
        setProfile(profileRes.data?.data || {});
      }
    } catch (error) {
      if (error.response?.status === 401) { localStorage.clear(); navigate('/ambulance/login'); }
    } finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('providerToken'); localStorage.removeItem('providerType'); localStorage.removeItem('providerId');
    navigate('/ambulance/login');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return (
        <div>
          <ProviderStatsCards stats={stats} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontWeight:'bold', marginBottom:'1rem' }}>📋 Recent Bookings</h3>
              {bookings.length === 0 && <p style={{ color: '#6b7280' }}>No bookings yet</p>}
              {bookings.slice(0, 5).map((booking, index) => (
                <div key={index} style={{ padding:'0.5rem 0', borderBottom:'1px solid #e5e7eb' }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span>{booking.patientName || 'Patient'}</span>
                    <span style={{ padding:'0.15rem 0.5rem', borderRadius:'10px', fontSize:'0.7rem', backgroundColor: booking.status==='en_route'?'#dbeafe':booking.status==='completed'?'#dcfce7':'#fef3c7', color: booking.status==='en_route'?'#1e40af':booking.status==='completed'?'#166534':'#92400e' }}>{booking.status || 'pending'}</span>
                  </div>
                  <div style={{ fontSize:'0.8rem', color:'#6b7280' }}>📍 {booking.pickupLocation || booking.pickupAddress || 'N/A'} → {booking.dropLocation || 'N/A'}</div>
                </div>
              ))}
            </div>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontWeight:'bold', marginBottom:'1rem' }}>⚡ Quick Actions</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                <button onClick={()=>setActiveTab('vehicles')} style={{ padding:'0.75rem', backgroundColor:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'0.5rem', cursor:'pointer' }}>🚐 Vehicles</button>
                <button onClick={()=>setActiveTab('drivers')} style={{ padding:'0.75rem', backgroundColor:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'0.5rem', cursor:'pointer' }}>👨‍✈️ Drivers</button>
                <button onClick={()=>setActiveTab('bookings')} style={{ padding:'0.75rem', backgroundColor:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'0.5rem', cursor:'pointer' }}>📋 Bookings</button>
                <button onClick={()=>setActiveTab('reports')} style={{ padding:'0.75rem', backgroundColor:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'0.5rem', cursor:'pointer' }}>📊 Reports</button>
              </div>
            </div>
          </div>
        </div>
      );

      case 'vehicles': return (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
            <h2 style={{ fontSize:'1.25rem', fontWeight:'bold' }}>🚐 Vehicles</h2>
            <button onClick={() => alert('Add Vehicle form coming soon')} style={{ padding:'0.5rem 1rem', backgroundColor:'#2563eb', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer', fontWeight:'bold' }}>➕ Add Vehicle</button>
          </div>
          {vehicles.length === 0 && <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No vehicles added yet. Click "+ Add Vehicle" to register your first ambulance.</p>}
          <ProviderTable columns={[{ key:'vehicleNumber', label:'Vehicle Number' },{ key:'type', label:'Type' },{ key:'driver', label:'Driver' },{ key:'status', label:'Status', render:(s)=>(<span style={{ padding:'0.15rem 0.5rem', borderRadius:'10px', fontSize:'0.7rem', backgroundColor:s==='available'?'#dcfce7':s==='on_duty'?'#dbeafe':'#fef3c7', color:s==='available'?'#166534':s==='on_duty'?'#1e40af':'#92400e' }}>{s||'available'}</span>)}]} data={vehicles} loading={loading} />
        </div>
      );

      case 'bookings': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1.5rem' }}>📋 Bookings</h2>
          <div style={{ marginBottom:'1rem', display:'flex', gap:'0.5rem' }}>
            <button onClick={()=>setStatusFilter('all')} style={{ padding:'0.25rem 1rem', backgroundColor:statusFilter==='all'?'#2563eb':'#e5e7eb', color:statusFilter==='all'?'white':'#4b5563', border:'none', borderRadius:'1rem', cursor:'pointer' }}>All</button>
            <button onClick={()=>setStatusFilter('pending')} style={{ padding:'0.25rem 1rem', backgroundColor:statusFilter==='pending'?'#f59e0b':'#e5e7eb', color:statusFilter==='pending'?'white':'#4b5563', border:'none', borderRadius:'1rem', cursor:'pointer' }}>Pending</button>
            <button onClick={()=>setStatusFilter('en_route')} style={{ padding:'0.25rem 1rem', backgroundColor:statusFilter==='en_route'?'#3b82f6':'#e5e7eb', color:statusFilter==='en_route'?'white':'#4b5563', border:'none', borderRadius:'1rem', cursor:'pointer' }}>En Route</button>
            <button onClick={()=>setStatusFilter('completed')} style={{ padding:'0.25rem 1rem', backgroundColor:statusFilter==='completed'?'#10b981':'#e5e7eb', color:statusFilter==='completed'?'white':'#4b5563', border:'none', borderRadius:'1rem', cursor:'pointer' }}>Completed</button>
          </div>
          {bookings.length === 0 && <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No bookings found</p>}
          <ProviderTable columns={[{ key:'bookingId', label:'ID' },{ key:'patientName', label:'Patient' },{ key:'pickupLocation', label:'Pickup' },{ key:'dropLocation', label:'Drop' },{ key:'status', label:'Status' }]} data={bookings.filter(b=>statusFilter==='all'||b.status===statusFilter)} loading={loading} />
        </div>
      );

      case 'corporate': return (
        <div>
          <h2 style={{ fontWeight:700, fontSize:'1.2rem', marginBottom:8 }}>🏢 Corporate Plans</h2>
          <p style={{ color:'#64748b', marginBottom:16 }}>Offer corporate ambulance retainers and emergency coverage to companies.</p>
          <CorporatePlansTab providerType="ambulance" providerId={providerId} token={token} />
        </div>
      );

      case 'profile': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1.5rem' }}>🚑 Profile</h2>
          {profile ? <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem' }}><p><strong>Name:</strong> {profile.name||'N/A'}</p><p><strong>Email:</strong> {profile.email||'N/A'}</p><p><strong>Phone:</strong> {profile.phone||'N/A'}</p></div> : <p>Loading...</p>}
        </div>
      );

      case 'reports': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1.5rem' }}>📊 Reports</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', textAlign:'center' }}>
              <div style={{ fontSize:'2rem', fontWeight:'bold', color:'#2563eb' }}>{stats.totalBookings || 0}</div>
              <div style={{ color:'#6b7280' }}>Total Bookings</div>
            </div>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', textAlign:'center' }}>
              <div style={{ fontSize:'2rem', fontWeight:'bold', color:'#10b981' }}>{stats.activeBookings || 0}</div>
              <div style={{ color:'#6b7280' }}>Active</div>
            </div>
            <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem', textAlign:'center' }}>
              <div style={{ fontSize:'2rem', fontWeight:'bold', color:'#f59e0b' }}>{vehicles.length || 0}</div>
              <div style={{ color:'#6b7280' }}>Vehicles</div>
            </div>
          </div>
        </div>
      );

      case 'drivers': return (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
            <h2 style={{ fontSize:'1.25rem', fontWeight:'bold' }}>👨‍✈️ Drivers</h2>
            <button onClick={() => alert('Add Driver form coming soon')} style={{ padding:'0.5rem 1rem', backgroundColor:'#2563eb', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer', fontWeight:'bold' }}>➕ Add Driver</button>
          </div>
          <ProviderTable 
            columns={[
              { key:'name', label:'Driver Name' },
              { key:'phone', label:'Phone' },
              { key:'licenseNumber', label:'License' },
              { key:'status', label:'Status', render:(s) => (<span style={{ padding:'0.15rem 0.5rem', borderRadius:'10px', fontSize:'0.7rem', backgroundColor:s==='available'?'#dcfce7':'#fef3c7', color:s==='available'?'#166534':'#92400e' }}>{s||'available'}</span>)}
            ]} 
            data={vehicles.map(v => ({ name: v.driver || 'Unassigned', phone: v.driverPhone || '-', licenseNumber: v.driverLicense || '-', status: v.status }))} 
            loading={loading} 
          />
        </div>
      );

      case 'settings': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1.5rem' }}>⚙️ Settings</h2>
          <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem' }}>
            <p><strong>Provider Type:</strong> Ambulance</p>
            <p><strong>Account Status:</strong> Active</p>
            <p><strong>Member Since:</strong> {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</p>
            <button onClick={handleLogout} style={{ marginTop:'1rem', padding:'0.5rem 1.5rem', backgroundColor:'#ef4444', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer' }}>🚪 Logout</button>
          </div>
        </div>
      );

      default: return <div>Coming soon...</div>;
    }
  };

  return (
    <ProviderAuth providerType="ambulance">
      <ProviderDashboardLayout title="Ambulance Dashboard" icon="🚑" sidebarItems={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} userName={profile?.name||'Ambulance Admin'} userRole="Ambulance Service" logout={handleLogout}>
        {renderContent()}
      </ProviderDashboardLayout>
    </ProviderAuth>
  );
};

export default AmbulanceDashboard;"// deploy fix" 
