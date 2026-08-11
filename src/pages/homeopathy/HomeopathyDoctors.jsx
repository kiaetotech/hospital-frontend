import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const HomeopathyDoctors = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ city: '', specialization: '', minRating: '', maxFee: '', mode: 'all', sortBy: 'rating' });
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cities = ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Jaipur','Lucknow','Kochi','Chandigarh','Indore','Bhopal','Nagpur','Surat','Patna','Guwahati','Dehradun','Goa','Rishikesh','Haridwar','Varanasi','Mysore','Coimbatore','Trivandrum'];
  const specializations = ['Classical Homeopathy','Clinical Homeopathy','Naturopathy','Yoga & Naturopathy','Diet Therapy','Acupuncture','Biochemic Medicine','Bach Flower Therapy'];

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/homeopathy/doctors');
      if (res.data?.success && res.data?.data?.length > 0) {
        setDoctors(res.data.data);
        setFilteredDoctors(res.data.data);
      } else {
        setDoctors([]);
        setFilteredDoctors([]);
        setError('No doctors available yet.');
      }
    } catch (err) {
      console.error('Error:', err);
      setDoctors([]);
      setFilteredDoctors([]);
      setError('Unable to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...doctors];
    if (searchTerm) { const t = searchTerm.toLowerCase(); result = result.filter(d => (d.name||'').toLowerCase().includes(t) || (d.specialization||'').toLowerCase().includes(t) || (d.city||'').toLowerCase().includes(t)); }
    if (filters.city) result = result.filter(d => (d.city||d.address?.city) === filters.city);
    if (filters.specialization) result = result.filter(d => d.specialization === filters.specialization);
    if (filters.minRating) result = result.filter(d => (d.rating||0) >= parseFloat(filters.minRating));
    if (filters.maxFee) result = result.filter(d => (d.fee||d.consultationFee||0) <= parseInt(filters.maxFee));
    if (filters.mode === 'online') result = result.filter(d => d.modes?.online || d.consultationTypes?.online);
    if (filters.mode === 'clinic') result = result.filter(d => d.modes?.clinic || d.consultationTypes?.clinic);
    if (filters.sortBy === 'rating') result.sort((a,b) => (b.rating||0) - (a.rating||0));
    else if (filters.sortBy === 'fee-low') result.sort((a,b) => (a.fee||a.consultationFee||0) - (b.fee||b.consultationFee||0));
    else if (filters.sortBy === 'fee-high') result.sort((a,b) => (b.fee||b.consultationFee||0) - (a.fee||a.consultationFee||0));
    else if (filters.sortBy === 'experience') result.sort((a,b) => (b.experience||0) - (a.experience||0));
    setFilteredDoctors(result);
  }, [searchTerm, filters, doctors]);

  const clearAll = () => { setSearchTerm(''); setFilters({ city: '', specialization: '', minRating: '', maxFee: '', mode: 'all', sortBy: 'rating' }); };

  const handleBook = (e, doctor, mode) => {
    e.stopPropagation();
    navigate(`/homeopathy/book/${doctor._id}`, { state: { doctor, consultationType: mode } });
  };

  return (
    <div style={{ maxWidth:'1200px',margin:'0 auto',padding:'1rem',fontFamily:'system-ui, sans-serif' }}>
      <div style={{ display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1rem',flexWrap:'wrap' }}>
        <button onClick={()=>navigate('/homeopathy')} style={{ padding:'8px 16px',background:'#f1f5f9',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'600',fontSize:'13px' }}>← Back</button>
        <h1 style={{ fontSize:'22px',fontWeight:'800',color:'#7c3aed',margin:0 }}>👨‍⚕️ Homeopathy Doctors {!loading&&`(${filteredDoctors.length})`}</h1>
      </div>

      <div style={{ background:'white',borderRadius:'12px',padding:'16px',boxShadow:'0 1px 6px rgba(0,0,0,0.04)',marginBottom:'12px' }}>
        <input placeholder="🔍 Search doctor, city, specialization..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
          style={{ width:'100%',padding:'10px 14px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',marginBottom:'10px',outline:'none' }} />
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))',gap:'8px',alignItems:'end' }}>
          <select value={filters.city} onChange={e=>setFilters({...filters,city:e.target.value})} style={s}><option value="">📍 All Cities</option>{cities.map(c=><option key={c}>{c}</option>)}</select>
          <select value={filters.specialization} onChange={e=>setFilters({...filters,specialization:e.target.value})} style={s}><option value="">🏥 All Specializations</option>{specializations.map(sp=><option key={sp}>{sp}</option>)}</select>
          <select value={filters.minRating} onChange={e=>setFilters({...filters,minRating:e.target.value})} style={s}><option value="">⭐ Any Rating</option><option value="4.5">4.5+</option><option value="4.0">4.0+</option></select>
          <select value={filters.maxFee} onChange={e=>setFilters({...filters,maxFee:e.target.value})} style={s}><option value="">💰 Any Fee</option><option value="300">Up to ₹300</option><option value="500">Up to ₹500</option><option value="700">Up to ₹700</option></select>
          <select value={filters.mode} onChange={e=>setFilters({...filters,mode:e.target.value})} style={s}><option value="all">📞 All Modes</option><option value="online">💻 Online</option><option value="clinic">🏥 Clinic</option></select>
          <select value={filters.sortBy} onChange={e=>setFilters({...filters,sortBy:e.target.value})} style={s}><option value="rating">Top Rated</option><option value="fee-low">Fee: Low-High</option><option value="experience">Most Experienced</option></select>
          <button onClick={clearAll} style={{ padding:'8px',background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'600',fontSize:'12px' }}>🔄 Clear</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center',padding:'60px 0',color:'#64748b' }}>Loading doctors...</div>
      ) : error ? (
        <div style={{ textAlign:'center',padding:'60px 20px',background:'white',borderRadius:'12px' }}>
          <p style={{ color:'#64748b' }}>{error}</p>
          <button onClick={()=>navigate('/homeopathy/doctor/register')} style={{ marginTop:'12px',padding:'10px 24px',background:'#7c3aed',color:'white',border:'none',borderRadius:'8px',fontWeight:'700',cursor:'pointer',fontSize:'13px' }}>Register as Homeopath →</button>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div style={{ textAlign:'center',padding:'40px',background:'white',borderRadius:'12px' }}>
          <p style={{ color:'#64748b' }}>No doctors match your filters</p>
          <button onClick={clearAll} style={{ marginTop:'10px',color:'#7c3aed',fontWeight:'600',background:'none',border:'none',cursor:'pointer' }}>Clear filters</button>
        </div>
      ) : (
        <div style={{ display:'grid',gap:'10px' }}>
          {filteredDoctors.map((d,i)=>(
            <div key={d._id} onClick={()=>navigate(`/homeopathy/doctor/${d._id}`,{state:{doctor:d}})}
              style={{ background:'white',borderRadius:'12px',padding:'16px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',cursor:'pointer',border:'1px solid #e2e8f0',transition:'box-shadow 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
              onMouseLeave={e=>e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)'}>
              <div style={{ display:'flex',gap:'12px',flexWrap:'wrap' }}>
                <div style={{ width:'56px',height:'56px',borderRadius:'12px',background:'linear-gradient(135deg,#7c3aed,#059669)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'22px',flexShrink:0 }}>👨‍⚕️</div>
                <div style={{ flex:1,minWidth:'200px' }}>
                  <div style={{ display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:'8px' }}>
                    <div>
                      <h3 style={{ fontWeight:'700',fontSize:'15px',color:'#1e293b',margin:0 }}>{d.name}</h3>
                      <p style={{ color:'#7c3aed',fontWeight:'600',fontSize:'12px',margin:'2px 0' }}>{d.specialization}</p>
                      <p style={{ color:'#64748b',fontSize:'11px',margin:0 }}>{d.city||d.address?.city}{d.area?`, ${d.area}`:''}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ fontSize:'18px',fontWeight:'800',color:'#1e293b',margin:0 }}>₹{d.fee||d.consultationFee||0}</p>
                      <p style={{ fontSize:'11px',color:'#64748b',margin:0 }}>⭐ {d.rating||'New'} • {d.experience||0}yrs</p>
                    </div>
                  </div>
                  <div style={{ display:'flex',gap:'8px',marginTop:'8px',flexWrap:'wrap' }}>
                    {(d.modes?.online||d.consultationTypes?.online) && <button onClick={(e)=>handleBook(e,d,'online')} style={{ padding:'6px 14px',background:'#7c3aed',color:'white',border:'none',borderRadius:'6px',fontWeight:'600',fontSize:'11px',cursor:'pointer' }}>💻 Online</button>}
                    {(d.modes?.clinic||d.consultationTypes?.clinic) && <button onClick={(e)=>handleBook(e,d,'clinic')} style={{ padding:'6px 14px',background:'#059669',color:'white',border:'none',borderRadius:'6px',fontWeight:'600',fontSize:'11px',cursor:'pointer' }}>🏥 Clinic</button>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const s = { padding:'8px 10px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'12px',backgroundColor:'white',outline:'none' };
export default HomeopathyDoctors;

