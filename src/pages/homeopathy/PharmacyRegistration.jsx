import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PharmacyRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ businessName:'', phone:'', email:'', password:'', drugLicenseNumber:'', gstNumber:'', city:'', state:'', ownerName:'' });

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/homeopathy/pharmacy/register', form);
      alert('✅ Pharmacy registration submitted!');
      navigate('/homeopathy');
    } catch (error) { alert(error.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:'500px',margin:'2rem auto',padding:'2rem',backgroundColor:'white',borderRadius:'1rem' }}>
      <h1 style={{ color:'#dc2626',textAlign:'center' }}>💊 Register Pharmacy</h1>
      <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:'0.75rem',marginTop:'1rem' }}>
        {['businessName','phone','email','password','drugLicenseNumber','gstNumber','city','state','ownerName'].map(f=><input key={f} placeholder={f} value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})} style={{ padding:'0.75rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0' }} type={f==='password'?'password':'text'} />)}
        <button type="submit" disabled={loading} style={{ padding:'0.75rem',backgroundColor:'#dc2626',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold' }}>{loading?'Submitting...':'Register'}</button>
      </form>
    </div>
  );
};

export default PharmacyRegistration;