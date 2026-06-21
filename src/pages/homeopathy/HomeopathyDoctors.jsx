import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeopathyDoctors = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ city: '', specialization: '', minRating: '', maxFee: '', mode: 'all', sortBy: 'rating' });
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const cities = ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Jaipur','Lucknow','Kochi','Chandigarh','Indore','Bhopal','Nagpur','Surat','Patna','Guwahati','Dehradun','Goa','Rishikesh','Haridwar','Varanasi','Mysore','Coimbatore','Trivandrum'];
  const specializations = ['Classical Homeopathy','Clinical Homeopathy','Naturopathy','Yoga & Naturopathy','Diet Therapy','Acupuncture','Biochemic Medicine','Bach Flower Therapy'];

  const doctors = [
    { _id:'HD001', name:'Dr. Sunil Mehta', specialization:'Classical Homeopathy', experience:18, rating:4.9, reviews:210, fee:600, city:'Mumbai', area:'Dadar', languages:['Hindi','English','Marathi'], available:true, modes:{online:true,clinic:true}, education:'BHMS, MD (Homeopathy)', clinicName:'Mehta Homeopathy Clinic' },
    { _id:'HD002', name:'Dr. Anjali Desai', specialization:'Clinical Homeopathy', experience:12, rating:4.7, reviews:145, fee:450, city:'Delhi', area:'Hauz Khas', languages:['Hindi','English'], available:true, modes:{online:true,clinic:true}, education:'BHMS, PG Diploma', clinicName:'Desai Homeopathy Center' },
    { _id:'HD003', name:'Dr. Prakash Nair', specialization:'Naturopathy', experience:20, rating:4.8, reviews:180, fee:700, city:'Kochi', area:'Fort Kochi', languages:['Malayalam','English'], available:true, modes:{online:true,clinic:true}, education:'BNYS, MD (Naturopathy)', clinicName:'Nair Nature Cure Center' },
    { _id:'HD004', name:'Dr. Ritika Sharma', specialization:'Yoga & Naturopathy', experience:8, rating:4.5, reviews:67, fee:400, city:'Rishikesh', area:'Tapovan', languages:['Hindi','English'], available:true, modes:{online:false,clinic:true}, education:'BNYS, Yoga Therapist', clinicName:'Sharma Wellness Retreat' },
    { _id:'HD005', name:'Dr. Vikas Gupta', specialization:'Classical Homeopathy', experience:15, rating:4.8, reviews:156, fee:500, city:'Bangalore', area:'Koramangala', languages:['Kannada','English','Hindi'], available:true, modes:{online:true,clinic:true}, education:'BHMS, MD', clinicName:'Gupta Homeopathy' },
    { _id:'HD006', name:'Dr. Meera Patel', specialization:'Diet Therapy', experience:10, rating:4.6, reviews:89, fee:350, city:'Ahmedabad', area:'Navrangpura', languages:['Gujarati','Hindi','English'], available:false, modes:{online:true,clinic:true}, education:'BHMS, Diploma Dietetics', clinicName:'Patel Diet Clinic' },
    { _id:'HD007', name:'Dr. Rajat Kapoor', specialization:'Clinical Homeopathy', experience:22, rating:4.9, reviews:250, fee:800, city:'Delhi', area:'Lajpat Nagar', languages:['Hindi','English','Punjabi'], available:true, modes:{online:true,clinic:true}, education:'BHMS, MD, PhD', clinicName:'Kapoor Homeopathy Hospital' },
    { _id:'HD008', name:'Dr. Kavita Iyer', specialization:'Naturopathy', experience:14, rating:4.7, reviews:120, fee:550, city:'Chennai', area:'Adyar', languages:['Tamil','English'], available:true, modes:{online:true,clinic:true}, education:'BNYS, MSc Yoga', clinicName:'Iyer Nature Cure' },
  ];

  useEffect(() => {
    let result = [...doctors];
    if (searchTerm) { const t = searchTerm.toLowerCase(); result = result.filter(d => d.name.toLowerCase().includes(t) || d.specialization.toLowerCase().includes(t) || d.city.toLowerCase().includes(t) || d.clinicName.toLowerCase().includes(t)); }
    if (filters.city) result = result.filter(d => d.city === filters.city);
    if (filters.specialization) result = result.filter(d => d.specialization === filters.specialization);
    if (filters.minRating) result = result.filter(d => d.rating >= parseFloat(filters.minRating));
    if (filters.maxFee) result = result.filter(d => d.fee <= parseInt(filters.maxFee));
    if (filters.mode === 'online') result = result.filter(d => d.modes.online);
    if (filters.mode === 'clinic') result = result.filter(d => d.modes.clinic);
    if (filters.sortBy === 'rating') result.sort((a,b) => b.rating - a.rating);
    else if (filters.sortBy === 'fee-low') result.sort((a,b) => a.fee - b.fee);
    else if (filters.sortBy === 'fee-high') result.sort((a,b) => b.fee - a.fee);
    else if (filters.sortBy === 'experience') result.sort((a,b) => b.experience - a.experience);
    setFilteredDoctors(result);
  }, [searchTerm, filters]);

  const handleBook = (e, doctor, mode) => {
    e.stopPropagation();
    navigate(`/homeopathy/book/${doctor._id}`, { state: { doctor, consultationType: mode } });
  };

  return (
    <div style={{ maxWidth:'1300px',margin:'0 auto',padding:'1rem' }}>
      <button onClick={()=>navigate('/homeopathy')} style={{ padding:'0.5rem 1rem',backgroundColor:'#f1f5f9',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold',marginBottom:'1rem' }}>← Back to Hub</button>
      <h1 style={{ fontSize:'1.8rem',fontWeight:'bold',color:'#7C3AED',marginBottom:'0.5rem' }}>👨‍⚕️ Find Homeopathy & Naturopathy Doctors</h1>
      <p style={{ color:'#64748b',marginBottom:'1rem' }}>{filteredDoctors.length} doctors available</p>

      <input placeholder="🔍 Search doctor, city, specialization, clinic..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{ width:'100%',padding:'0.75rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0',marginBottom:'1rem',fontSize:'1rem' }} />

      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))',gap:'0.5rem',marginBottom:'1rem' }}>
        <select value={filters.city} onChange={e=>setFilters({...filters,city:e.target.value})} style={s}><option value="">📍 All Cities</option>{cities.map(c=><option key={c}>{c}</option>)}</select>
        <select value={filters.specialization} onChange={e=>setFilters({...filters,specialization:e.target.value})} style={s}><option value="">🏥 All Specializations</option>{specializations.map(sp=><option key={sp}>{sp}</option>)}</select>
        <select value={filters.minRating} onChange={e=>setFilters({...filters,minRating:e.target.value})} style={s}><option value="">⭐ Any Rating</option><option value="4.5">4.5+</option><option value="4.0">4.0+</option></select>
        <select value={filters.maxFee} onChange={e=>setFilters({...filters,maxFee:e.target.value})} style={s}><option value="">💰 Any Fee</option><option value="300">Up to ₹300</option><option value="500">Up to ₹500</option><option value="700">Up to ₹700</option></select>
        <select value={filters.mode} onChange={e=>setFilters({...filters,mode:e.target.value})} style={s}><option value="all">📞 All Modes</option><option value="online">💻 Online Only</option><option value="clinic">🏥 Clinic Only</option></select>
        <select value={filters.sortBy} onChange={e=>setFilters({...filters,sortBy:e.target.value})} style={s}><option value="rating">📊 Top Rated</option><option value="fee-low">💰 Fee: Low-High</option><option value="experience">🎓 Most Experienced</option></select>
      </div>

      <div style={{ display:'grid',gap:'1rem' }}>
        {filteredDoctors.map((d,i)=>(
          <div key={d._id} onClick={()=>navigate(`/homeopathy/doctor/${d._id}`,{state:{doctor:d}})} style={{ backgroundColor:'white',borderRadius:'1rem',padding:'1.5rem',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',cursor:'pointer',display:'flex',gap:'1rem',flexWrap:'wrap',border:i===0&&filters.sortBy==='rating'?'2px solid #7C3AED':'1px solid #e2e8f0' }}>
            {i===0&&filters.sortBy==='rating'&&<span style={{ position:'absolute',top:'-8px',left:'-8px',backgroundColor:'#7C3AED',color:'white',padding:'4px 12px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:'bold' }}>🏆 Top Rated</span>}
            <div style={{ width:'70px',height:'70px',borderRadius:'50%',backgroundColor:'#ede9fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',flexShrink:0 }}>👨‍⚕️</div>
            <div style={{ flex:1,minWidth:'200px' }}>
              <div style={{ display:'flex',justifyContent:'space-between',flexWrap:'wrap' }}>
                <div>
                  <h3 style={{ fontWeight:'bold',fontSize:'1.2rem' }}>{d.name}</h3>
                  <p style={{ color:'#7C3AED',fontWeight:'bold',fontSize:'0.9rem' }}>{d.specialization}</p>
                  <p style={{ color:'#64748b',fontSize:'0.85rem' }}>🏥 {d.clinicName} | 📍 {d.city}, {d.area}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  {d.available?<span style={{ backgroundColor:'#e8f5e9',color:'#2E7D32',padding:'4px 10px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:'bold' }}>🟢 Available</span>:<span style={{ backgroundColor:'#fff3e0',color:'#E65100',padding:'4px 10px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:'bold' }}>🟡 Busy</span>}
                </div>
              </div>
              <div style={{ display:'flex',gap:'1rem',marginTop:'0.3rem',color:'#64748b',fontSize:'0.85rem',flexWrap:'wrap' }}>
                <span>⭐ {d.rating} ({d.reviews})</span><span>📅 {d.experience}yrs</span><span>🗣️ {d.languages.join(', ')}</span>
              </div>
              <div style={{ display:'flex',gap:'0.5rem',marginTop:'0.5rem' }}>
                {d.modes.online&&<span style={{ padding:'2px 8px',backgroundColor:'#e3f2fd',borderRadius:'10px',fontSize:'0.75rem',color:'#1565C0' }}>💻 Online</span>}
                {d.modes.clinic&&<span style={{ padding:'2px 8px',backgroundColor:'#e8f5e9',borderRadius:'10px',fontSize:'0.75rem',color:'#2E7D32' }}>🏥 Clinic</span>}
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'1rem',borderTop:'1px solid #e2e8f0',paddingTop:'1rem' }}>
                <span style={{ fontWeight:'bold',fontSize:'1.2rem' }}>₹{d.fee}<span style={{ color:'#64748b',fontSize:'0.85rem' }}>/consult</span></span>
                <div style={{ display:'flex',gap:'0.5rem' }}>
                  {d.modes.online&&<button onClick={(e)=>handleBook(e,d,'online')} style={{ padding:'0.5rem 1rem',backgroundColor:'#7C3AED',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold',fontSize:'0.85rem' }}>💻 Online</button>}
                  {d.modes.clinic&&<button onClick={(e)=>handleBook(e,d,'clinic')} style={{ padding:'0.5rem 1rem',backgroundColor:'#059669',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold',fontSize:'0.85rem' }}>🏥 Clinic</button>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const s = { padding:'0.5rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0',fontSize:'0.85rem',backgroundColor:'white' };
export default HomeopathyDoctors;