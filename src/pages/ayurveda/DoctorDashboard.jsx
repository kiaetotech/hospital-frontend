import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [bookings] = useState([
    { bookingId:'AYB001',patientName:'Rahul Kumar',date:'2026-06-25',time:'10:00 AM',type:'online',fee:500,commission:75,earning:425,status:'confirmed' },
    { bookingId:'AYB002',patientName:'Priya Singh',date:'2026-06-26',time:'2:30 PM',type:'clinic',fee:500,commission:75,earning:425,status:'pending' },
  ]);

  useEffect(() => {
    const token = localStorage.getItem('ayurvedaDoctorToken');
    if (!token) navigate('/ayurveda/doctor/login');
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('ayurvedaDoctorToken');
    navigate('/ayurveda/doctor/login');
  };

  return (
    <div style={{ maxWidth:'1000px',margin:'0 auto',padding:'1.5rem' }}>
      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'1.5rem' }}>
        <h1 style={{ color:'#2E7D32' }}>Doctor Dashboard</h1>
        <button onClick={logout} style={{ padding:'0.5rem 1rem',backgroundColor:'#dc2626',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer' }}>Logout</button>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem' }}>
        {[{label:'Consultations',value:25,color:'#2196F3'},{label:'Earnings',value:'₹12,500',color:'#4CAF50'},{label:'Rating',value:'⭐4.5',color:'#FF9800'},{label:'Pending',value:'₹1,500',color:'#E91E63'}].map((s,i)=>(
          <div key={i} style={{ backgroundColor:'white',padding:'1rem',borderRadius:'0.5rem',borderTop:'4px solid '+s.color }}>
            <p style={{ fontSize:'1.5rem',fontWeight:'bold' }}>{s.value}</p>
            <p style={{ color:'#64748b' }}>{s.label}</p>
          </div>
        ))}
      </div>
      <h3 style={{ fontWeight:'bold',marginBottom:'1rem' }}>Recent Bookings</h3>
      <table style={{ width:'100%',borderCollapse:'collapse',backgroundColor:'white',borderRadius:'0.5rem' }}>
        <thead><tr>{['ID','Patient','Date','Time','Fee','Commission','Earning','Status'].map(h=><th key={h} style={{padding:'0.5rem',borderBottom:'2px solid #e2e8f0'}}>{h}</th>)}</tr></thead>
        <tbody>
          {bookings.map((b,i)=>(
            <tr key={i} style={{borderBottom:'1px solid #e2e8f0'}}>
              <td style={{padding:'0.5rem'}}>{b.bookingId}</td>
              <td style={{padding:'0.5rem'}}>{b.patientName}</td>
              <td style={{padding:'0.5rem'}}>{b.date}</td>
              <td style={{padding:'0.5rem'}}>{b.time}</td>
              <td style={{padding:'0.5rem'}}>₹{b.fee}</td>
              <td style={{padding:'0.5rem',color:'#dc2626'}}>₹{b.commission}</td>
              <td style={{padding:'0.5rem',color:'#2E7D32'}}>₹{b.earning}</td>
              <td style={{padding:'0.5rem'}}>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorDashboard;