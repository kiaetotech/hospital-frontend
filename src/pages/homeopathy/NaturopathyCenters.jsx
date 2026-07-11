import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaMapMarkerAlt, FaCheckCircle, FaLeaf, FaCalendarAlt, FaIndianRupee } from 'react-icons/fa';
import api from '../../services/api';

const NaturopathyCenters = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchCenters(); }, []);

  const fetchCenters = async () => {
    try {
      const res = await api.get('/homeopathy/naturopathy');
      if (res.data?.success && res.data?.data?.length > 0) {
        setCenters(res.data.data);
        setFilteredCenters(res.data.data);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm) { setFilteredCenters(centers); return; }
    const t = searchTerm.toLowerCase();
    setFilteredCenters(centers.filter(c => 
      (c.name||'').toLowerCase().includes(t) || 
      (c.location||c.address?.city||'').toLowerCase().includes(t) ||
      (c.type||'').toLowerCase().includes(t)
    ));
  }, [searchTerm, centers]);

  return (
    <div style={{ minHeight:'100vh',backgroundColor:'#f8fafc',fontFamily:'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#059669,#047857)',padding:'20px',color:'white' }}>
        <div style={{ maxWidth:'1100px',margin:'0 auto',display:'flex',alignItems:'center',gap:'12px' }}>
          <button onClick={()=>navigate('/homeopathy')} style={{ background:'rgba(255,255,255,0.15)',border:'none',color:'white',padding:'6px 12px',borderRadius:'6px',cursor:'pointer',fontSize:'14px' }}>← Back</button>
          <h1 style={{ fontSize:'20px',fontWeight:'800',margin:0 }}>🌿 Naturopathy Centers</h1>
        </div>
      </div>

      <div style={{ maxWidth:'1100px',margin:'0 auto',padding:'16px' }}>
        {/* Search */}
        <div style={{ display:'flex',alignItems:'center',background:'white',borderRadius:'10px',padding:'0 14px',border:'1px solid #e2e8f0',marginBottom:'14px' }}>
          <span style={{ fontSize:'16px',marginRight:'8px' }}>🔍</span>
          <input placeholder="Search centers by name, location, or type..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
            style={{ width:'100%',padding:'12px 10px',border:'none',outline:'none',fontSize:'14px' }} />
        </div>

        <p style={{ color:'#64748b',fontSize:'13px',marginBottom:'14px' }}>{filteredCenters.length} center{filteredCenters.length!==1?'s':''} available</p>

        {loading ? (
          <div style={{ textAlign:'center',padding:'40px',color:'#64748b' }}>Loading centers...</div>
        ) : filteredCenters.length === 0 ? (
          <div style={{ textAlign:'center',padding:'40px',background:'white',borderRadius:'12px' }}>
            <p style={{ color:'#64748b' }}>No centers found</p>
          </div>
        ) : (
          <div style={{ display:'grid',gap:'12px' }}>
            {filteredCenters.map((center,i) => (
              <motion.div key={center._id||i} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.04 }}
                onClick={()=>navigate(`/homeopathy/center/${center._id}`,{state:{center}})}
                style={{ background:'white',borderRadius:'12px',padding:'16px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',border:'1px solid #e2e8f0',cursor:'pointer',transition:'box-shadow 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
                onMouseLeave={e=>e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)'}>
                <div style={{ display:'flex',gap:'12px',flexWrap:'wrap' }}>
                  <div style={{ width:'56px',height:'56px',borderRadius:'12px',background:'linear-gradient(135deg,#059669,#047857)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'22px',flexShrink:0 }}>🌿</div>
                  <div style={{ flex:1,minWidth:'200px' }}>
                    <div style={{ display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:'8px' }}>
                      <div>
                        <h3 style={{ fontWeight:'700',fontSize:'15px',color:'#1e293b',margin:0 }}>{center.name}</h3>
                        <p style={{ color:'#059669',fontWeight:'600',fontSize:'12px',margin:'2px 0' }}>{center.type||'Naturopathy Center'}</p>
                        <p style={{ color:'#64748b',fontSize:'11px',margin:0,display:'flex',alignItems:'center',gap:'4px' }}>
                          <FaMapMarkerAlt size={10} /> {center.location||center.address?.city||'India'}
                          <span style={{ marginLeft:'8px',color:'#f59e0b',fontWeight:'600' }}>⭐ {center.rating||'New'}</span>
                        </p>
                      </div>
                    </div>
                    <p style={{ color:'#475569',fontSize:'12px',margin:'6px 0' }}>{center.description}</p>
                    {(center.facilities||center.features) && (
                      <div style={{ display:'flex',flexWrap:'wrap',gap:'4px',marginBottom:'8px' }}>
                        {(center.facilities||center.features).slice(0,4).map((f,j)=>(
                          <span key={j} style={{ padding:'3px 8px',background:'#ecfdf5',color:'#059669',borderRadius:'12px',fontSize:'10px',fontWeight:'600',display:'flex',alignItems:'center',gap:'3px' }}>
                            <FaCheckCircle size={8} /> {f}
                          </span>
                        ))}
                      </div>
                    )}
                    {(center.packages||center.plans) && (
                      <div style={{ display:'flex',gap:'8px',flexWrap:'wrap' }}>
                        {(center.packages||center.plans).slice(0,2).map((pkg,j)=>(
                          <div key={j} style={{ background:'#f8fafc',borderRadius:'8px',padding:'6px 10px',fontSize:'11px' }}>
                            <span style={{ fontWeight:'600',color:'#1e293b' }}>{pkg.name}</span>
                            <span style={{ color:'#64748b',marginLeft:'6px' }}>📅 {pkg.duration||pkg.days}d</span>
                            <span style={{ color:'#059669',fontWeight:'700',marginLeft:'6px' }}>₹{(pkg.price||0).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button onClick={(e)=>{e.stopPropagation();navigate(`/homeopathy/center/${center._id}`,{state:{center}});}}
                      style={{ padding:'7px 16px',background:'#059669',color:'white',border:'none',borderRadius:'6px',fontWeight:'600',fontSize:'11px',cursor:'pointer',marginTop:'8px' }}>
                      View Details →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NaturopathyCenters;
