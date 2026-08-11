import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DoctorRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:'', phone:'', email:'', password:'', confirmPassword:'',
    specialization:'', experience:'', education:'', registrationNumber:'', registrationCouncil:'',
    clinicName:'', city:'', state:'', area:'', consultationFee:'',
    about:'', languages:[]
  });

  const cities = ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Jaipur','Lucknow','Kochi','Chandigarh','Indore','Bhopal','Nagpur','Surat','Patna','Guwahati','Dehradun','Goa'];
  const specializations = ['Classical Homeopathy','Clinical Homeopathy','Naturopathy','Yoga & Naturopathy','Diet Therapy','Acupuncture','Biochemic Medicine','Bach Flower Therapy'];
  const allLanguages = ['Hindi','English','Marathi','Gujarati','Bengali','Tamil','Telugu','Kannada','Malayalam','Punjabi','Odia'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { alert('Passwords do not match!'); return; }
    setLoading(true);
    try {
      await api.post('/homeopathy/doctor/register', form);
      alert('✅ Registration submitted! Admin will verify within 24-48 hours.');
      navigate('/homeopathy/doctor/login');
    } catch (error) {
      alert('Registration failed: ' + (error.response?.data?.error || error.message));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:'700px',margin:'0 auto',padding:'2rem' }}>
      <h1 style={{ fontSize:'2rem',fontWeight:'bold',color:'#7C3AED',textAlign:'center',marginBottom:'2rem' }}>🌿 Register as Homeopathy Doctor</h1>
      <div style={{ display:'flex',justifyContent:'center',gap:'0.5rem',marginBottom:'2rem' }}>
        {[1,2,3,4].map(s=>(<div key={s} onClick={()=>setStep(s)} style={{ width:'35px',height:'35px',borderRadius:'50%',backgroundColor:step>=s?'#7C3AED':'#e2e8f0',color:step>=s?'white':'#64748b',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold',cursor:'pointer' }}>{s}</div>))}
      </div>
      <form onSubmit={handleSubmit}>
        {step===1&&<div style={{ backgroundColor:'white',borderRadius:'1rem',padding:'2rem',boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}><h3 style={{ fontWeight:'bold',marginBottom:'1.5rem' }}>Step 1: Basic Info</h3><input required placeholder="Full Name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={inp} /><input required placeholder="Phone *" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={inp} /><input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={inp} /><input required type="password" placeholder="Password *" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={inp} /><input required type="password" placeholder="Confirm Password *" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} style={inp} /></div>}

        {step===2&&<div style={{ backgroundColor:'white',borderRadius:'1rem',padding:'2rem',boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}><h3 style={{ fontWeight:'bold',marginBottom:'1.5rem' }}>Step 2: Professional Details</h3><select required value={form.specialization} onChange={e=>setForm({...form,specialization:e.target.value})} style={inp}><option value="">Select Specialization *</option>{specializations.map(s=><option key={s}>{s}</option>)}</select><input required type="number" placeholder="Years of Experience *" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})} style={inp} /><input required placeholder="Education (e.g., BHMS, MD) *" value={form.education} onChange={e=>setForm({...form,education:e.target.value})} style={inp} /><input required placeholder="Registration Number *" value={form.registrationNumber} onChange={e=>setForm({...form,registrationNumber:e.target.value})} style={inp} /><input placeholder="Registration Council" value={form.registrationCouncil} onChange={e=>setForm({...form,registrationCouncil:e.target.value})} style={inp} /></div>}

        {step===3&&<div style={{ backgroundColor:'white',borderRadius:'1rem',padding:'2rem',boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}><h3 style={{ fontWeight:'bold',marginBottom:'1.5rem' }}>Step 3: Clinic & Languages</h3><input placeholder="Clinic Name" value={form.clinicName} onChange={e=>setForm({...form,clinicName:e.target.value})} style={inp} /><select required value={form.city} onChange={e=>setForm({...form,city:e.target.value})} style={inp}><option value="">Select City *</option>{cities.map(c=><option key={c}>{c}</option>)}</select><input placeholder="State" value={form.state} onChange={e=>setForm({...form,state:e.target.value})} style={inp} /><input placeholder="Area" value={form.area} onChange={e=>setForm({...form,area:e.target.value})} style={inp} /><input required type="number" placeholder="Consultation Fee (₹) *" value={form.consultationFee} onChange={e=>setForm({...form,consultationFee:e.target.value})} style={inp} /><div style={{ marginTop:'0.5rem' }}><label style={{ fontWeight:'bold' }}>Languages:</label><div style={{ display:'flex',flexWrap:'wrap',gap:'0.5rem',marginTop:'0.3rem' }}>{allLanguages.map(l=><label key={l} style={{ display:'flex',alignItems:'center',gap:'0.3rem',fontSize:'0.85rem' }}><input type="checkbox" checked={form.languages.includes(l)} onChange={e=>{if(e.target.checked) setForm({...form,languages:[...form.languages,l]}); else setForm({...form,languages:form.languages.filter(x=>x!==l)});}} />{l}</label>)}</div></div></div>}

        {step===4&&<div style={{ backgroundColor:'white',borderRadius:'1rem',padding:'2rem',boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}><h3 style={{ fontWeight:'bold',marginBottom:'1.5rem' }}>Step 4: Review & Submit</h3><div style={{ display:'flex',flexDirection:'column',gap:'0.5rem',fontSize:'0.9rem' }}>{[['Name',form.name],['Phone',form.phone],['Specialization',form.specialization],['Experience',form.experience+' years'],['Registration',form.registrationNumber],['City',form.city],['Fee','₹'+form.consultationFee]].map(([l,v],i)=>(<div key={i} style={{ display:'flex',justifyContent:'space-between',padding:'0.5rem 0',borderBottom:'1px solid #e2e8f0' }}><span style={{ color:'#64748b' }}>{l}</span><span style={{ fontWeight:'bold' }}>{v||'N/A'}</span></div>))}</div><p style={{ marginTop:'1rem',fontSize:'0.85rem',color:'#64748b' }}>⚠️ Your profile will be verified by admin before going live (24-48 hours).</p></div>}

        <div style={{ display:'flex',gap:'1rem',marginTop:'1.5rem' }}>
          {step>1&&<button type="button" onClick={()=>setStep(step-1)} style={{ flex:1,padding:'0.75rem',backgroundColor:'#e2e8f0',border:'none',borderRadius:'0.5rem',fontWeight:'bold',cursor:'pointer' }}>← Back</button>}
          {step<4?<button type="button" onClick={()=>setStep(step+1)} style={{ flex:1,padding:'0.75rem',backgroundColor:'#7C3AED',color:'white',border:'none',borderRadius:'0.5rem',fontWeight:'bold',cursor:'pointer' }}>Next →</button>:<button type="submit" disabled={loading} style={{ flex:1,padding:'0.75rem',backgroundColor:loading?'#a5b4fc':'#059669',color:'white',border:'none',borderRadius:'0.5rem',fontWeight:'bold',cursor:'pointer' }}>{loading?'Submitting...':'✅ Submit for Approval'}</button>}
        </div>
      </form>
    </div>
  );
};

const inp = { width:'100%',padding:'0.75rem',marginBottom:'0.75rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0',fontSize:'1rem',boxSizing:'border-box' };
export default DoctorRegistration;

