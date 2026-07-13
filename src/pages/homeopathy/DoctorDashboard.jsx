import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CorporatePlansTab from '../../components/CorporatePlansTab';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings] = useState([
    { bookingId:'HMB001',patientName:'Rahul Kumar',date:'2026-06-25',time:'10:00 AM',type:'online',fee:600,commission:90,earning:510,status:'confirmed' },
    { bookingId:'HMB002',patientName:'Priya Singh',date:'2026-06-26',time:'2:30 PM',type:'clinic',fee:600,commission:90,earning:510,status:'pending' },
  ]);

  const token = localStorage.getItem('homeoDoctorToken');
  const providerId = localStorage.getItem('providerId') || localStorage.getItem('homeoDoctorId');

  useEffect(() => {
    if (!token) navigate('/homeopathy/doctor/login');
  }, [navigate]);

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'corporate', label: '🏢 Corporate Plans' },
  ];

  return (
    <div style={{ maxWidth:'1000px',margin:'0 auto',padding:'1.5rem' }}>
      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'1.5rem' }}>
        <h1 style={{ color:'#7C3AED' }}>🌿 Doctor Dashboard</h1>
        <button onClick={()=>{localStorage.removeItem('homeoDoctorToken');navigate('/homeopathy/doctor/login');}} style={{ padding:'0.5rem 1rem',backgroundColor:'#dc2626',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer' }}>Logout</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding:'0.5rem 1.25rem', backgroundColor: activeTab===tab.id ? '#7C3AED' : '#f3f4f6', color: activeTab===tab.id ? 'white' : '#374151', border:'none', borderRadius:'0.5rem', cursor:'pointer', fontWeight: activeTab===tab.id ? 'bold' : 'normal' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem' }}>
            {[{label:'Consultations',value:32,color:'#7C3AED'},{label:'Earnings',value:'₹16,000',color:'#059669'},{label:'Rating',value:'⭐4.8',color:'#f59e0b'},{label:'Pending',value:'₹2,500',color:'#dc2626'}].map((s,i)=>(<div key={i} style={{ backgroundColor:'white',padding:'1rem',borderRadius:'0.5rem',borderTop:'4px solid '+s.color }}><p style={{ fontSize:'1.5rem',fontWeight:'bold' }}>{s.value}</p><p style={{ color:'#64748b' }}>{s.label}</p></div>))}
          </div>
          <h3 style={{ fontWeight:'bold',marginBottom:'1rem' }}>Recent Bookings</h3>
          <table style={{ width:'100%',borderCollapse:'collapse',backgroundColor:'white',borderRadius:'0.5rem' }}>
            <thead><tr style={{ backgroundColor:'#f8fafc' }}>{['ID','Patient','Date','Time','Fee','Commission','Earning','Status'].map(h=><th key={h} style={{ padding:'0.75rem',textAlign:'left' }}>{h}</th>)}</tr></thead>
            <tbody>{bookings.map((b,i)=>(<tr key={i} style={{ borderBottom:'1px solid #e2e8f0' }}><td style={{ padding:'0.75rem' }}>{b.bookingId}</td><td style={{ padding:'0.75rem' }}>{b.patientName}</td><td style={{ padding:'0.75rem' }}>{b.date}</td><td style={{ padding:'0.75rem' }}>{b.time}</td><td style={{ padding:'0.75rem' }}>₹{b.fee}</td><td style={{ padding:'0.75rem',color:'#dc2626' }}>₹{b.commission}</td><td style={{ padding:'0.75rem',color:'#059669' }}>₹{b.earning}</td><td style={{ padding:'0.75rem' }}><span style={{ padding:'2px 8px',borderRadius:'10px',backgroundColor:b.status==='confirmed'?'#e8f5e9':'#fff3e0',color:b.status==='confirmed'?'#059669':'#e65100',fontSize:'0.8rem' }}>{b.status}</span></td></tr>))}</tbody>
          </table>
        </>
      )}

      {activeTab === 'corporate' && (
        <div>
          <h2 style={{ fontWeight:700, fontSize:'1.2rem', marginBottom:8 }}>🏢 Corporate Plans</h2>
          <p style={{ color:'#64748b', marginBottom:16 }}>Offer corporate homeopathy wellness packages to companies.</p>
          <CorporatePlansTab providerType="homeopathy" providerId={providerId} token={token} />
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;