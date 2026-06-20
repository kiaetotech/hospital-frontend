echo import React, { useState } from 'react'; > DoctorRegistration.jsx
echo import { useNavigate } from 'react-router-dom'; >> DoctorRegistration.jsx
echo import api from '../../services/api'; >> DoctorRegistration.jsx
echo const DoctorRegistration = () => { >> DoctorRegistration.jsx
echo   const navigate = useNavigate(); >> DoctorRegistration.jsx
echo   const [loading, setLoading] = useState(false); >> DoctorRegistration.jsx
echo   const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', specialization: '', experience: '', education: '', ayushRegNo: '', city: '', consultationFee: '', clinicName: '' }); >> DoctorRegistration.jsx
echo   const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); try { await api.post('/ayurveda/doctor/register', form); alert('Registration submitted!'); navigate('/ayurveda/doctor/login'); } catch (error) { alert(error.response?.data?.error || 'Failed'); } finally { setLoading(false); } }; >> DoctorRegistration.jsx
echo   return (React.createElement('div', { style: { maxWidth: '500px', margin: '2rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '1rem' } }, >> DoctorRegistration.jsx
echo     React.createElement('h1', { style: { color: '#2E7D32', textAlign: 'center' } }, '🧘 Doctor Registration'), >> DoctorRegistration.jsx
echo     React.createElement('form', { onSubmit: handleSubmit }, >> DoctorRegistration.jsx
echo       ['name','phone','email','password','specialization','experience','education','ayushRegNo','city','consultationFee','clinicName'].map(f => >> DoctorRegistration.jsx
echo         React.createElement('input', { key: f, placeholder: f, value: form[f], onChange: e => setForm({...form, [f]: e.target.value}), style: { width:'100%',padding:'0.75rem',marginBottom:'0.5rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0' }, type: f==='password'?'password':'text' }) >> DoctorRegistration.jsx
echo       ), >> DoctorRegistration.jsx
echo       React.createElement('button', { type:'submit', disabled:loading, style: { width:'100%',padding:'0.75rem',backgroundColor:'#4CAF50',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer' } }, loading?'Submitting...':'Register') >> DoctorRegistration.jsx
echo     ) >> DoctorRegistration.jsx
echo   )); >> DoctorRegistration.jsx
echo }; >> DoctorRegistration.jsx
echo export default DoctorRegistration; >> DoctorRegistration.jsx