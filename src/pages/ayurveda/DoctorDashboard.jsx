echo import React, { useState, useEffect } from 'react'; > DoctorDashboard.jsx
echo import { useNavigate } from 'react-router-dom'; >> DoctorDashboard.jsx
echo import api from '../../services/api'; >> DoctorDashboard.jsx
echo const DoctorDashboard = () => { >> DoctorDashboard.jsx
echo   const navigate = useNavigate(); >> DoctorDashboard.jsx
echo   const [doctor, setDoctor] = useState(null); >> DoctorDashboard.jsx
echo   const [bookings, setBookings] = useState([]); >> DoctorDashboard.jsx
echo   const [stats, setStats] = useState({ totalConsultations:0, totalEarnings:0, rating:0, pendingPayout:0 }); >> DoctorDashboard.jsx
echo   useEffect(() => { const token = localStorage.getItem('ayurvedaDoctorToken'); if (!token) { navigate('/ayurveda/doctor/login'); return; } setDoctor(JSON.parse(localStorage.getItem('ayurvedaDoctor')||'{}')); loadData(); }, []); >> DoctorDashboard.jsx
echo   const loadData = async () => { try { const [bRes, sRes] = await Promise.all([api.get('/ayurveda/doctors'), api.get('/ayurveda/doctor/stats/123')]); setBookings(bRes.data?.data?.slice(0,5)||[]); setStats(sRes.data?.data||stats); } catch(e) { setBookings([{bookingId:'AYB001',patientName:'Patient',date:new Date().toISOString(),time:'10:00 AM',type:'online',fee:500,commission:75,earning:425,status:'confirmed'}]); setStats({totalConsultations:25,totalEarnings:12500,rating:4.5,pendingPayout:1500}); } }; >> DoctorDashboard.jsx
echo   const logout = () => { localStorage.removeItem('ayurvedaDoctorToken'); navigate('/ayurveda/doctor/login'); }; >> DoctorDashboard.jsx
echo   return (React.createElement('div', { style: { maxWidth:'1000px',margin:'0 auto',padding:'1.5rem' } }, >> DoctorDashboard.jsx
echo     React.createElement('div', { style: { display:'flex',justifyContent:'space-between',marginBottom:'1.5rem' } }, >> DoctorDashboard.jsx
echo       React.createElement('h1', { style: { color:'#2E7D32' } }, '🧘 Doctor Dashboard - ', doctor?.name), >> DoctorDashboard.jsx
echo       React.createElement('button', { onClick:logout, style: { padding:'0.5rem 1rem',backgroundColor:'#dc2626',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer' } }, 'Logout') >> DoctorDashboard.jsx
echo     ), >> DoctorDashboard.jsx
echo     React.createElement('div', { style: { display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem' } }, >> DoctorDashboard.jsx
echo       [{label:'Consultations',value:stats.totalConsultations,color:'#2196F3'},{label:'Earnings',value:'₹'+stats.totalEarnings,color:'#4CAF50'},{label:'Rating',value:'⭐'+stats.rating,color:'#FF9800'},{label:'Pending Payout',value:'₹'+stats.pendingPayout,color:'#E91E63'}].map((s,i)=>React.createElement('div',{key:i,style:{backgroundColor:'white',padding:'1rem',borderRadius:'0.5rem',borderTop:'4px solid '+s.color}},React.createElement('p',{style:{fontSize:'1.5rem',fontWeight:'bold'}},s.value),React.createElement('p',{style:{color:'#64748b'}},s.label))) >> DoctorDashboard.jsx
echo     ), >> DoctorDashboard.jsx
echo     React.createElement('h3', { style: { fontWeight:'bold',marginBottom:'1rem' } }, 'Recent Bookings'), >> DoctorDashboard.jsx
echo     React.createElement('table', { style: { width:'100%',borderCollapse:'collapse',backgroundColor:'white',borderRadius:'0.5rem' } }, >> DoctorDashboard.jsx
echo       React.createElement('thead', null, React.createElement('tr', null, ['ID','Patient','Date','Time','Fee','Commission','Earning','Status'].map(h=>React.createElement('th',{key:h,style:{padding:'0.5rem',borderBottom:'2px solid #e2e8f0'}},h)))), >> DoctorDashboard.jsx
echo       React.createElement('tbody', null, bookings.map((b,i)=>React.createElement('tr',{key:i,style:{borderBottom:'1px solid #e2e8f0'}}, >> DoctorDashboard.jsx
echo         [b.bookingId,b.patientName,new Date(b.date).toLocaleDateString(),b.time,'₹'+b.fee,'₹'+b.commission,'₹'+b.earning,b.status].map((v,j)=>React.createElement('td',{key:j,style:{padding:'0.5rem'}},v)) >> DoctorDashboard.jsx
echo       ))) >> DoctorDashboard.jsx
echo     ) >> DoctorDashboard.jsx
echo   )); >> DoctorDashboard.jsx
echo }; >> DoctorDashboard.jsx
echo export default DoctorDashboard; >> DoctorDashboard.jsx