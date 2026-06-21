import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const BookHomeopathyConsult = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = location.state?.doctor || { _id:doctorId, name:'Doctor', fee:500 };

  const [form, setForm] = useState({ patientName:'', phone:'', date:'', time:'', mode:'online', symptoms:'' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const timeSlots = [];
  for (let h=6; h<=22; h++) for (let m=0; m<60; m+=30) {
    const ampm = h>=12?'PM':'AM';
    const dh = h>12?h-12:h;
    timeSlots.push(`${dh}:${m.toString().padStart(2,'0')} ${ampm}`);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1500);
  };

  if (success) {
    return (
      <div style={{ maxWidth:'500px',margin:'2rem auto',textAlign:'center' }}>
        <div style={{ fontSize:'4rem' }}>✅</div>
        <h1 style={{ color:'#059669' }}>Booking Confirmed!</h1>
        <p>Booking ID: HB{Date.now()}</p>
        <p>Doctor: {doctor.name}</p>
        <p>Date: {form.date} at {form.time}</p>
        <p>Mode: {form.mode==='online'?'💻 Online':'🏥 Clinic'}</p>
        <button onClick={()=>navigate('/homeopathy')} style={{ padding:'0.75rem 2rem',backgroundColor:'#7C3AED',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer',marginTop:'1rem' }}>Go to Home</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:'500px',margin:'0 auto',padding:'1.5rem' }}>
      <button onClick={()=>navigate(-1)} style={{ padding:'0.5rem 1rem',backgroundColor:'#f1f5f9',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold',marginBottom:'1rem' }}>← Back</button>
      <h1 style={{ color:'#7C3AED' }}>Book Consultation</h1>
      <div style={{ backgroundColor:'#ede9fe',padding:'1rem',borderRadius:'0.5rem',marginBottom:'1rem' }}>
        <p><strong>👨‍⚕️ {doctor.name}</strong></p>
        <p>{doctor.specialization} | ₹{doctor.fee}</p>
      </div>
      <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:'0.75rem' }}>
        <input required placeholder="Full Name" value={form.patientName} onChange={e=>setForm({...form,patientName:e.target.value})} style={inputStyle} />
        <input required placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={inputStyle} />
        <select value={form.mode} onChange={e=>setForm({...form,mode:e.target.value})} style={inputStyle}>
          <option value="online">💻 Online</option>
          <option value="clinic">🏥 Clinic Visit</option>
        </select>
        <input required type="date" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e=>setForm({...form,date:e.target.value})} style={inputStyle} />
        <select required value={form.time} onChange={e=>setForm({...form,time:e.target.value})} style={inputStyle}>
          <option value="">Select Time</option>
          {timeSlots.map(t=><option key={t}>{t}</option>)}
        </select>
        <textarea placeholder="Symptoms" value={form.symptoms} onChange={e=>setForm({...form,symptoms:e.target.value})} style={{...inputStyle,height:'60px'}} />
        <button type="submit" disabled={loading} style={{ padding:'1rem',backgroundColor:'#7C3AED',color:'white',border:'none',borderRadius:'0.5rem',fontWeight:'bold',fontSize:'1rem',cursor:'pointer' }}>
          {loading?'Processing...':`Confirm Booking - ₹${doctor.fee}`}
        </button>
      </form>
    </div>
  );
};

const inputStyle = { padding:'0.75rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0',fontSize:'1rem' };

export default BookHomeopathyConsult;