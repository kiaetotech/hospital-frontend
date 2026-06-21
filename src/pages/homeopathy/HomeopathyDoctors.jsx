import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeopathyDoctors = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ city: '', specialization: '', mode: 'all' });
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const cities = ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Jaipur','Lucknow','Kochi','Chandigarh','Indore','Bhopal','Nagpur','Surat','Patna','Guwahati','Dehradun','Goa'];
  const specializations = ['Classical Homeopathy','Clinical Homeopathy','Naturopathy','Yoga & Naturopathy','Diet Therapy','Acupuncture'];

  const doctors = [
    { _id:'HD001', name:'Dr. Sunil Mehta', specialization:'Classical Homeopathy', experience:18, rating:4.9, reviews:210, fee:600, city:'Mumbai', area:'Dadar', languages:['Hindi','English','Marathi'], available:true, modes:{online:true,clinic:true} },
    { _id:'HD002', name:'Dr. Anjali Desai', specialization:'Clinical Homeopathy', experience:12, rating:4.7, reviews:145, fee:450, city:'Delhi', area:'Hauz Khas', languages:['Hindi','English'], available:true, modes:{online:true,clinic:true} },
    { _id:'HD003', name:'Dr. Prakash Nair', specialization:'Naturopathy', experience:20, rating:4.8, reviews:180, fee:700, city:'Kochi', area:'Fort Kochi', languages:['Malayalam','English'], available:true, modes:{online:true,clinic:true} },
    { _id:'HD004', name:'Dr. Ritika Sharma', specialization:'Yoga & Naturopathy', experience:8, rating:4.5, reviews:67, fee:400, city:'Rishikesh', area:'Tapovan', languages:['Hindi','English'], available:true, modes:{online:false,clinic:true} },
    { _id:'HD005', name:'Dr. Vikas Gupta', specialization:'Classical Homeopathy', experience:15, rating:4.8, reviews:156, fee:500, city:'Bangalore', area:'Koramangala', languages:['Kannada','English','Hindi'], available:true, modes:{online:true,clinic:true} },
    { _id:'HD006', name:'Dr. Meera Patel', specialization:'Diet Therapy', experience:10, rating:4.6, reviews:89, fee:350, city:'Ahmedabad', area:'Navrangpura', languages:['Gujarati','Hindi','English'], available:false, modes:{online:true,clinic:true} },
    { _id:'HD007', name:'Dr. Rajat Kapoor', specialization:'Clinical Homeopathy', experience:22, rating:4.9, reviews:250, fee:800, city:'Delhi', area:'Lajpat Nagar', languages:['Hindi','English','Punjabi'], available:true, modes:{online:true,clinic:true} },
    { _id:'HD008', name:'Dr. Kavita Iyer', specialization:'Naturopathy', experience:14, rating:4.7, reviews:120, city:'Chennai', area:'Adyar', languages:['Tamil','English'], available:true, modes:{online:true,clinic:true} },
  ];

  useEffect(() => {
    let result = [...doctors];
    if (searchTerm) { const t = searchTerm.toLowerCase(); result = result.filter(d => d.name.toLowerCase().includes(t) || d.specialization.toLowerCase().includes(t) || d.city.toLowerCase().includes(t)); }
    if (filters.city) result = result.filter(d => d.city === filters.city);
    if (filters.specialization) result = result.filter(d => d.specialization === filters.specialization);
    if (filters.mode === 'online') result = result.filter(d => d.modes.online);
    if (filters.mode === 'clinic') result = result.filter(d => d.modes.clinic);
    result.sort((a,b) => b.rating - a.rating);
    setFilteredDoctors(result);
  }, [searchTerm, filters]);

  return (
    <div style={{ maxWidth:'1200px',margin:'0 auto',padding:'1rem' }}>
      <button onClick={()=>navigate('/homeopathy')} style={{ padding:'0.5rem 1rem',backgroundColor:'#f1f5f9',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold',marginBottom:'1rem' }}>← Back</button>
      <h1 style={{ fontSize:'1.8rem',fontWeight:'bold',color:'#7C3AED',marginBottom:'1rem' }}>👨‍⚕️ Find Homeopathy & Naturopathy Doctors ({filteredDoctors.length})</h1>

      <input placeholder="🔍 Search doctor, city, specialization..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{ width:'100%',padding:'0.75rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0',marginBottom:'1rem' }} />

      <div style={{ display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'1rem' }}>
        <select value={filters.city} onChange={e=>setFilters({...filters,city:e.target.value})} style={selectStyle}><option value="">All Cities</option>{cities.map(c=><option key={c}>{c}</option>)}</select>
        <select value={filters.specialization} onChange={e=>setFilters({...filters,specialization:e.target.value})} style={selectStyle}><option value="">All Specializations</option>{specializations.map(s=><option key={s}>{s}</option>)}</select>
        <select value={filters.mode} onChange={e=>setFilters({...filters,mode:e.target.value})} style={selectStyle}><option value="all">All Modes</option><option value="online">Online Only</option><option value="clinic">Clinic Only</option></select>
      </div>

      <div style={{ display:'grid',gap:'1rem' }}>
        {filteredDoctors.map(d=>(
          <div key={d._id} onClick={()=>navigate(`/homeopathy/doctor/${d._id}`,{state:{doctor:d}})} style={{ backgroundColor:'white',borderRadius:'1rem',padding:'1.5rem',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',cursor:'pointer',display:'flex',gap:'1rem',flexWrap:'wrap' }}>
            <div style={{ width:'60px',height:'60px',borderRadius:'50%',backgroundColor:'#ede9fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem' }}>👨‍⚕️</div>
            <div style={{ flex:1 }}>
              <h3 style={{ fontWeight:'bold' }}>{d.name}</h3>
              <p style={{ color:'#7C3AED',fontWeight:'bold' }}>{d.specialization}</p>
              <p style={{ color:'#64748b',fontSize:'0.85rem' }}>📍 {d.city} | ⭐{d.rating} ({d.reviews}) | {d.experience}yrs</p>
              <div style={{ display:'flex',gap:'0.5rem',marginTop:'0.5rem' }}>
                {d.modes.online && <span style={{ padding:'2px 8px',backgroundColor:'#e3f2fd',borderRadius:'10px',fontSize:'0.75rem',color:'#1565C0' }}>💻 Online</span>}
                {d.modes.clinic && <span style={{ padding:'2px 8px',backgroundColor:'#e8f5e9',borderRadius:'10px',fontSize:'0.75rem',color:'#2E7D32' }}>🏥 Clinic</span>}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ fontWeight:'bold',fontSize:'1.2rem' }}>₹{d.fee}</p>
              <button onClick={(e)=>{e.stopPropagation();navigate(`/homeopathy/book/${d._id}`,{state:{doctor:d}})}} style={{ padding:'0.5rem 1.5rem',backgroundColor:'#7C3AED',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold' }}>Book Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const selectStyle = { padding:'0.5rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0' };

export default HomeopathyDoctors;