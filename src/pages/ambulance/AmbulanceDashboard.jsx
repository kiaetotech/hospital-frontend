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
        const statsRes = await ambulanceApi.getStats();
        setStats(statsRes.data.data);
        setBookings([
          { bookingId: 'AMB-001', patientName: 'Rajesh Kumar', pickupLocation: 'Connaught Place, Delhi', dropLocation: 'Apollo Hospital, Delhi', status: 'en_route' },
          { bookingId: 'AMB-002', patientName: 'Priya Sharma', pickupLocation: 'Noida Sector 62', dropLocation: 'Fortis Hospital, Noida', status: 'completed' },
          { bookingId: 'AMB-003', patientName: 'Amit Singh', pickupLocation: 'Gurugram Cyber City', dropLocation: 'Medanta Hospital, Gurugram', status: 'pending' }
        ]);
      } else if (activeTab === 'vehicles') {
        const vehiclesRes = await ambulanceApi.getVehicles();
        setVehicles(vehiclesRes.data.data || [
          { vehicleNumber: 'DL-01-AB-1234', type: 'ICU', driver: 'Raj Singh', status: 'available' },
          { vehicleNumber: 'DL-02-CD-5678', type: 'Basic', driver: 'Sunil Kumar', status: 'on_duty' }
        ]);
      } else if (activeTab === 'profile') {
        const profileRes = await ambulanceApi.getProfile();
        setProfile(profileRes.data.data || { name: 'ABC Ambulance Services', email: 'info@abcambulance.com' });
      }
    } catch (error) {
      if (error.response?.status === 401) navigate('/ambulance/login');
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
              {bookings.map((booking, index) => (
                <div key={index} style={{ padding:'0.5rem 0', borderBottom:'1px solid #e5e7eb' }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span>{booking.patientName}</span>
                    <span style={{ padding:'0.15rem 0.5rem', borderRadius:'10px', fontSize:'0.7rem', backgroundColor: booking.status==='en_route'?'#dbeafe':booking.status==='completed'?'#dcfce7':'#fef3c7', color: booking.status==='en_route'?'#1e40af':booking.status==='completed'?'#166534':'#92400e' }}>{booking.status}</span>
                  </div>
                  <div style={{ fontSize:'0.8rem', color:'#6b7280' }}>📍 {booking.pickupLocation} → {booking.dropLocation}</div>
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
            <button style={{ padding:'0.5rem 1rem', backgroundColor:'#2563eb', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer', fontWeight:'bold' }}>➕ Add Vehicle</button>
          </div>
          <ProviderTable columns={[{ key:'vehicleNumber', label:'Vehicle Number' },{ key:'type', label:'Type' },{ key:'driver', label:'Driver' },{ key:'status', label:'Status', render:(s)=>(<span style={{ padding:'0.15rem 0.5rem', borderRadius:'10px', fontSize:'0.7rem', backgroundColor:s==='available'?'#dcfce7':s==='on_duty'?'#dbeafe':'#fef3c7', color:s==='available'?'#166534':s==='on_duty'?'#1e40af':'#92400e' }}>{s}</span>)}]} data={vehicles} loading={loading} onEdit={(row)=>alert(`Edit: ${row.vehicleNumber}`)} onDelete={(row)=>{if(window.confirm(`Delete ${row.vehicleNumber}?`)) alert('Deleted')}} />
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
          <ProviderTable columns={[{ key:'bookingId', label:'ID' },{ key:'patientName', label:'Patient' },{ key:'pickupLocation', label:'Pickup' },{ key:'dropLocation', label:'Drop' },{ key:'status', label:'Status' }]} data={bookings.filter(b=>statusFilter==='all'||b.status===statusFilter)} loading={loading} onView={(row)=>alert(`View: ${row.bookingId}`)} />
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
          {profile ? <div style={{ backgroundColor:'white', borderRadius:'0.75rem', padding:'1.5rem' }}><p><strong>Name:</strong> {profile.name||'N/A'}</p><p><strong>Email:</strong> {profile.email||'N/A'}</p></div> : <p>Loading...</p>}
        </div>
      );

      case 'reports': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1.5rem' }}>📊 Reports</h2>
          <p>Reports coming soon.</p>
        </div>
      );

      case 'drivers': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1.5rem' }}>👨‍✈️ Drivers</h2>
          <p>Driver management coming soon.</p>
        </div>
      );

      case 'settings': return (
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1.5rem' }}>⚙️ Settings</h2>
          <p>Settings coming soon.</p>
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

export default AmbulanceDashboard;