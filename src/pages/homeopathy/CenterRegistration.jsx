import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CenterRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', phone:'', email:'', password:'', type:'Naturopathy Center', description:'', city:'', state:'' });

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/homeopathy/center/register', form);
      alert('✅ Registration submitted!');
      navigate('/homeopathy');
    } catch (error) { alert(error.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:'500px',margin:'2rem auto',padding:'2rem',backgroundColor:'white',borderRadius:'1rem' }}>
      <h1 style={{ color:'#059669',textAlign:'center' }}>🏨 Register Naturopathy Center</h1>
      <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:'0.75rem',marginTop:'1rem' }}>
        {['name','phone','email','password','city','state'].map(f=><input key={f} placeholder={f} value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})} style={{ padding:'0.75rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0' }} type={f==='password'?'password':'text'} />)}
        <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{ padding:'0.75rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0',height:'60px' }} />
        <button type="submit" disabled={loading} style={{ padding:'0.75rem',backgroundColor:'#059669',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold' }}>{loading?'Submitting...':'Register'}</button>
      </form>
    </div>
  );
};

export default CenterRegistration;