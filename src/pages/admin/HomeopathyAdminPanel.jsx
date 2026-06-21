import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const HomeopathyAdminPanel = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('doctors');
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [pendingCenters, setPendingCenters] = useState([]);
  const [pendingPharmacies, setPendingPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { navigate('/admin/login'); return; }
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'doctors') {
        const res = await api.get('/homeopathy/admin/pending-doctors');
        setPendingDoctors(res.data?.data || []);
      } else if (tab === 'centers') {
        const res = await api.get('/homeopathy/admin/pending-centers');
        setPendingCenters(res.data?.data || []);
      } else if (tab === 'pharmacies') {
        const res = await api.get('/homeopathy/admin/pending-pharmacies');
        setPendingPharmacies(res.data?.data || []);
      }
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const verifyDoctor = async (id, status) => {
    try { await api.put(`/homeopathy/admin/verify-doctor/${id}`, { status }); alert(`Doctor ${status}!`); loadData(); }
    catch (e) { alert('Failed'); }
  };

  const verifyCenter = async (id, status) => {
    try { await api.put(`/homeopathy/admin/verify-center/${id}`, { status }); alert(`Center ${status}!`); loadData(); }
    catch (e) { alert('Failed'); }
  };

  const verifyPharmacy = async (id, status) => {
    try { await api.put(`/homeopathy/admin/verify-pharmacy/${id}`, { status }); alert(`Pharmacy ${status}!`); loadData(); }
    catch (e) { alert('Failed'); }
  };

  return (
    <div style={{ maxWidth:'1200px',margin:'0 auto',padding:'1.5rem' }}>
      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'2rem' }}>
        <h1 style={{ color:'#7C3AED' }}>🌿 Homeopathy Admin Panel</h1>
        <button onClick={()=>navigate('/admin/dashboard')} style={{ padding:'0.5rem 1rem',backgroundColor:'#e2e8f0',border:'none',borderRadius:'0.5rem',cursor:'pointer' }}>← Back</button>
      </div>

      <div style={{ display:'flex',gap:'0.5rem',marginBottom:'2rem' }}>
        {['doctors','centers','pharmacies'].map(t=>(<button key={t} onClick={()=>setTab(t)} style={{ padding:'0.5rem 1.5rem',borderRadius:'0.5rem',border:'none',fontWeight:'bold',cursor:'pointer',backgroundColor:tab===t?'#7C3AED':'#e2e8f0',color:tab===t?'white':'#1e293b' }}>{t==='doctors'?'👨‍⚕️ Doctors':t==='centers'?'🏨 Centers':'💊 Pharmacies'}</button>))}
      </div>

      {loading && <p>Loading...</p>}

      {tab==='doctors'&&pendingDoctors.map(d=>(<div key={d._id} style={{ backgroundColor:'white',borderRadius:'1rem',padding:'1.5rem',marginBottom:'1rem',boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}><div style={{ display:'flex',justifyContent:'space-between',flexWrap:'wrap' }}><div><h3 style={{ fontWeight:'bold' }}>{d.name}</h3><p style={{ color:'#7C3AED' }}>{d.specialization}</p><p>📍 {d.address?.city} | 📞 {d.phone}</p><p>Reg: {d.registrationNumber} | Exp: {d.experience}yrs | Fee: ₹{d.consultationFee}</p></div><div style={{ display:'flex',gap:'0.5rem',alignItems:'center' }}><button onClick={()=>verifyDoctor(d._id,'approved')} style={{ padding:'0.5rem 1.5rem',backgroundColor:'#059669',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold' }}>✅ Approve</button><button onClick={()=>verifyDoctor(d._id,'rejected')} style={{ padding:'0.5rem 1.5rem',backgroundColor:'#dc2626',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold' }}>❌ Reject</button></div></div></div>))}

      {tab==='centers'&&pendingCenters.map(c=>(<div key={c._id} style={{ backgroundColor:'white',borderRadius:'1rem',padding:'1.5rem',marginBottom:'1rem',boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}><div style={{ display:'flex',justifyContent:'space-between',flexWrap:'wrap' }}><div><h3 style={{ fontWeight:'bold' }}>{c.name}</h3><p>{c.type} | 📍 {c.address?.city} | 📞 {c.phone}</p></div><div style={{ display:'flex',gap:'0.5rem',alignItems:'center' }}><button onClick={()=>verifyCenter(c._id,'approved')} style={{ padding:'0.5rem 1.5rem',backgroundColor:'#059669',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer' }}>✅ Approve</button><button onClick={()=>verifyCenter(c._id,'rejected')} style={{ padding:'0.5rem 1.5rem',backgroundColor:'#dc2626',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer' }}>❌ Reject</button></div></div></div>))}

      {tab==='pharmacies'&&pendingPharmacies.map(p=>(<div key={p._id} style={{ backgroundColor:'white',borderRadius:'1rem',padding:'1.5rem',marginBottom:'1rem',boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}><div style={{ display:'flex',justifyContent:'space-between',flexWrap:'wrap' }}><div><h3 style={{ fontWeight:'bold' }}>{p.businessName}</h3><p>📍 {p.address?.city} | 📞 {p.phone}</p><p>License: {p.drugLicenseNumber} | GST: {p.gstNumber}</p></div><div style={{ display:'flex',gap:'0.5rem',alignItems:'center' }}><button onClick={()=>verifyPharmacy(p._id,'approved')} style={{ padding:'0.5rem 1.5rem',backgroundColor:'#059669',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer' }}>✅ Approve</button><button onClick={()=>verifyPharmacy(p._id,'rejected')} style={{ padding:'0.5rem 1.5rem',backgroundColor:'#dc2626',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer' }}>❌ Reject</button></div></div></div>))}

      {!loading&&tab==='doctors'&&pendingDoctors.length===0&&<p style={{ textAlign:'center',padding:'2rem',color:'#64748b' }}>No pending doctor verifications ✅</p>}
      {!loading&&tab==='centers'&&pendingCenters.length===0&&<p style={{ textAlign:'center',padding:'2rem',color:'#64748b' }}>No pending center verifications ✅</p>}
      {!loading&&tab==='pharmacies'&&pendingPharmacies.length===0&&<p style={{ textAlign:'center',padding:'2rem',color:'#64748b' }}>No pending pharmacy verifications ✅</p>}
    </div>
  );
};

export default HomeopathyAdminPanel;