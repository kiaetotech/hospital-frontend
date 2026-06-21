import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NaturopathyCenters = () => {
  const navigate = useNavigate();

  const centers = [
    { _id:'NC001', name:'Prakriti Nature Cure Center', location:'Rishikesh, Uttarakhand', rating:4.8, reviews:95, type:'Naturopathy Center', facilities:['Yoga Hall','Organic Food','AC Rooms','Mountain View'], packages:[{name:'7-Day Detox',price:18000,duration:7},{name:'14-Day Rejuvenation',price:32000,duration:14}], description:'Authentic naturopathy treatments in the Himalayas.' },
    { _id:'NC002', name:'Jeevan Shakti Wellness Retreat', location:'Kochi, Kerala', rating:4.7, reviews:78, type:'Yoga Retreat', facilities:['Beach Access','Meditation Hall','Ayurvedic Spa','Pool'], packages:[{name:'5-Day Yoga & Diet',price:12000,duration:5},{name:'10-Day Complete Wellness',price:25000,duration:10}], description:'Combining yoga, naturopathy and diet therapy.' },
    { _id:'NC003', name:'Swasthya Nature Cure Hospital', location:'Pune, Maharashtra', rating:4.6, reviews:62, type:'Wellness Resort', facilities:['Luxury Rooms','Organic Restaurant','Gym','Spa'], packages:[{name:'3-Day Weekend',price:8000,duration:3},{name:'21-Day Transformation',price:45000,duration:21}], description:'Modern naturopathy with traditional wisdom.' },
    { _id:'NC004', name:'Dharti Diet & Wellness Clinic', location:'Bangalore, Karnataka', rating:4.5, reviews:45, type:'Diet Clinic', facilities:['Diet Consultation','Cooking Classes','Health Checkup'], packages:[{name:'1-Month Diet Plan',price:5000,duration:30},{name:'3-Month Program',price:12000,duration:90}], description:'Scientific diet therapy for lifestyle diseases.' },
  ];

  return (
    <div style={{ maxWidth:'1200px',margin:'0 auto',padding:'1.5rem' }}>
      <button onClick={()=>navigate('/homeopathy')} style={{ padding:'0.5rem 1rem',backgroundColor:'#f1f5f9',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold',marginBottom:'1rem' }}>← Back to Hub</button>
      <h1 style={{ fontSize:'2rem',fontWeight:'bold',color:'#059669',marginBottom:'0.5rem' }}>🌿 Naturopathy Centers</h1>
      <p style={{ color:'#64748b',marginBottom:'1.5rem' }}>{centers.length} centers available for natural healing</p>

      <div style={{ display:'grid',gap:'1.5rem' }}>
        {centers.map(center=>(
          <div key={center._id} style={{ backgroundColor:'white',borderRadius:'1rem',padding:'1.5rem',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',border:'1px solid #e2e8f0',cursor:'pointer' }} onClick={()=>navigate(`/homeopathy/center/${center._id}`,{state:{center}})}>
            <div style={{ display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem' }}>
              <div style={{ flex:1 }}>
                <h2 style={{ fontSize:'1.3rem',fontWeight:'bold',color:'#1e293b' }}>{center.name}</h2>
                <p style={{ color:'#059669',fontWeight:'bold',fontSize:'0.9rem' }}>{center.type}</p>
                <p style={{ color:'#64748b' }}>📍 {center.location} | ⭐ {center.rating} ({center.reviews} reviews)</p>
                <p style={{ color:'#475569',marginTop:'0.5rem' }}>{center.description}</p>
                <div style={{ display:'flex',flexWrap:'wrap',gap:'0.5rem',marginTop:'0.5rem' }}>
                  {center.facilities.map((f,i)=>(<span key={i} style={{ padding:'4px 10px',backgroundColor:'#e8f5e9',color:'#059669',borderRadius:'20px',fontSize:'0.75rem' }}>✅ {f}</span>))}
                </div>
              </div>
              <div style={{ minWidth:'200px' }}>
                <h4 style={{ fontWeight:'bold',marginBottom:'0.5rem' }}>Packages:</h4>
                {center.packages.map((pkg,i)=>(<div key={i} style={{ padding:'0.5rem',marginBottom:'0.3rem',backgroundColor:'#f8fafc',borderRadius:'0.5rem' }}><p style={{ fontWeight:'bold',fontSize:'0.9rem' }}>{pkg.name}</p><p style={{ color:'#64748b',fontSize:'0.8rem' }}>📅 {pkg.duration} days | 💰 ₹{pkg.price.toLocaleString()}</p></div>))}
                <button style={{ width:'100%',padding:'0.5rem',marginTop:'0.5rem',backgroundColor:'#059669',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold' }}>Book Now →</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NaturopathyCenters;