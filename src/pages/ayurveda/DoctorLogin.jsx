echo import React, { useState } from 'react'; > DoctorLogin.jsx
echo import { useNavigate } from 'react-router-dom'; >> DoctorLogin.jsx
echo import api from '../../services/api'; >> DoctorLogin.jsx
echo const DoctorLogin = () => { >> DoctorLogin.jsx
echo   const navigate = useNavigate(); >> DoctorLogin.jsx
echo   const [phone, setPhone] = useState(''); >> DoctorLogin.jsx
echo   const [password, setPassword] = useState(''); >> DoctorLogin.jsx
echo   const [loading, setLoading] = useState(false); >> DoctorLogin.jsx
echo   const handleLogin = async (e) => { e.preventDefault(); setLoading(true); try { const res = await api.post('/ayurveda/doctor/login', { phone, password }); if (res.data.success) { localStorage.setItem('ayurvedaDoctorToken', res.data.token); localStorage.setItem('ayurvedaDoctor', JSON.stringify(res.data.doctor)); navigate('/ayurveda/doctor/dashboard'); } } catch (error) { alert(error.response?.data?.error || 'Login failed'); } finally { setLoading(false); } }; >> DoctorLogin.jsx
echo   return (React.createElement('div', { style: { maxWidth:'400px',margin:'3rem auto',padding:'2rem' } }, >> DoctorLogin.jsx
echo     React.createElement('h1', { style: { textAlign:'center',color:'#2E7D32' } }, '🧘 Doctor Login'), >> DoctorLogin.jsx
echo     React.createElement('form', { onSubmit: handleLogin }, >> DoctorLogin.jsx
echo       React.createElement('input', { placeholder:'Phone', value:phone, onChange:e=>setPhone(e.target.value), style: { width:'100%',padding:'0.75rem',marginBottom:'0.5rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0' } }), >> DoctorLogin.jsx
echo       React.createElement('input', { type:'password', placeholder:'Password', value:password, onChange:e=>setPassword(e.target.value), style: { width:'100%',padding:'0.75rem',marginBottom:'0.5rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0' } }), >> DoctorLogin.jsx
echo       React.createElement('button', { type:'submit', disabled:loading, style: { width:'100%',padding:'0.75rem',backgroundColor:'#4CAF50',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer' } }, loading?'Logging in...':'Login') >> DoctorLogin.jsx
echo     ), >> DoctorLogin.jsx
echo     React.createElement('p', { style: { textAlign:'center',marginTop:'1rem' } }, 'New? ', React.createElement('span', { onClick:()=>navigate('/ayurveda/doctor/register'), style: { color:'#4CAF50',cursor:'pointer' } }, 'Register')) >> DoctorLogin.jsx
echo   )); >> DoctorLogin.jsx
echo }; >> DoctorLogin.jsx
echo export default DoctorLogin; >> DoctorLogin.jsx