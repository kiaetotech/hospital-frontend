import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBrain, FaSearch, FaUserMd, FaStar } from 'react-icons/fa';
import api from '../../services/api';

const RemedyMatcher = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMatch = async () => {
    if (!symptoms.trim() || symptoms.trim().length < 3) {
      setError('Please describe your symptoms in detail');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('/homeopathy/remedy-match', { symptoms: symptoms.trim() });
      if (res.data?.success) setResult(res.data.data);
      else setError(res.data?.message || 'Unable to match remedies');
    } catch (err) {
      setError('Error connecting to AI service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh',backgroundColor:'#f8fafc',fontFamily:'system-ui, sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#7c3aed,#059669)',padding:'20px',color:'white' }}>
        <div style={{ maxWidth:'800px',margin:'0 auto',display:'flex',alignItems:'center',gap:'12px' }}>
          <Link to="/homeopathy" style={{ color:'white',fontSize:'14px',textDecoration:'none' }}>← Back</Link>
          <h1 style={{ fontSize:'20px',fontWeight:'800',margin:0 }}>🌿 Remedy Matcher AI</h1>
        </div>
      </div>

      <div style={{ maxWidth:'800px',margin:'0 auto',padding:'20px' }}>
        <div style={{ background:'white',borderRadius:'14px',padding:'20px',boxShadow:'0 1px 6px rgba(0,0,0,0.04)',marginBottom:'16px' }}>
          <h3 style={{ fontWeight:'700',fontSize:'15px',color:'#1e293b',marginBottom:'4px' }}>Describe Your Symptoms</h3>
          <p style={{ fontSize:'12px',color:'#64748b',marginBottom:'12px' }}>AI will suggest homeopathic remedies based on your symptoms</p>
          <textarea value={symptoms} onChange={e=>{setSymptoms(e.target.value);setError('');}}
            placeholder="Example: Severe throbbing headache on right side, worse with light and noise, better with pressure..."
            rows={3} style={{ width:'100%',padding:'12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'13px',resize:'vertical',outline:'none',marginBottom:'10px' }} />
          {error && <p style={{ color:'#dc2626',fontSize:'12px',marginBottom:'8px' }}>{error}</p>}
          <button onClick={handleMatch} disabled={loading}
            style={{ width:'100%',padding:'12px',background:loading?'#94a3b8':'#7c3aed',color:'white',border:'none',borderRadius:'8px',fontWeight:'700',cursor:loading?'not-allowed':'pointer',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px' }}>
            <FaBrain /> {loading ? 'Analyzing with AI...' : 'Find Matching Remedies'}
          </button>
        </div>

        {result && (
          <>
            <div style={{ background:'white',borderRadius:'14px',padding:'20px',boxShadow:'0 1px 6px rgba(0,0,0,0.04)',marginBottom:'16px' }}>
              <h3 style={{ fontWeight:'700',fontSize:'15px',color:'#1e293b',marginBottom:'12px' }}>💊 Suggested Remedies</h3>
              <div style={{ display:'grid',gap:'10px' }}>
                {result.remedies?.map((r,i)=>(
                  <div key={i} style={{ background:'#f5f3ff',borderRadius:'10px',padding:'14px',border:'1px solid #ede9fe' }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                      <div>
                        <h4 style={{ fontWeight:'700',fontSize:'14px',color:'#7c3aed',margin:0 }}>{r.name} {r.potency}</h4>
                        <p style={{ fontSize:'12px',color:'#64748b',margin:'4px 0 0' }}>{r.reason}</p>
                      </div>
                      <span style={{ background:r.confidence==='High'?'#ecfdf5':'#fffbeb',color:r.confidence==='High'?'#059669':'#f59e0b',padding:'3px 10px',borderRadius:'10px',fontSize:'10px',fontWeight:'700' }}>
                        {r.confidence}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background:'#fef2f2',borderRadius:'8px',padding:'12px',marginTop:'12px' }}>
                <p style={{ color:'#dc2626',fontSize:'11px',margin:0,fontWeight:'600' }}>⚠️ {result.disclaimer}</p>
              </div>
            </div>

            {result.availableDoctors?.length > 0 && (
              <div style={{ background:'white',borderRadius:'14px',padding:'20px',boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontWeight:'700',fontSize:'15px',color:'#1e293b',marginBottom:'12px' }}>👨‍⚕️ Consult a Homeopath</h3>
                <div style={{ display:'grid',gap:'8px' }}>
                  {result.availableDoctors.slice(0,3).map(d=>(
                    <div key={d._id} onClick={()=>navigate(`/homeopathy/doctor/${d._id}`)}
                      style={{ display:'flex',alignItems:'center',gap:'10px',padding:'12px',background:'#f8fafc',borderRadius:'10px',cursor:'pointer',border:'1px solid #e2e8f0' }}>
                      <div style={{ width:'40px',height:'40px',borderRadius:'8px',background:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'18px',flexShrink:0 }}>👨‍⚕️</div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontWeight:'600',fontSize:'13px',color:'#1e293b',margin:0 }}>Dr. {d.name}</p>
                        <p style={{ fontSize:'11px',color:'#64748b',margin:0 }}>{d.specialization} • ⭐ {d.rating||'New'} • ₹{d.consultationFee}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>navigate('/homeopathy/doctors')}
                  style={{ width:'100%',marginTop:'12px',padding:'10px',background:'#059669',color:'white',border:'none',borderRadius:'8px',fontWeight:'700',cursor:'pointer',fontSize:'13px' }}>
                  View All Homeopaths →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RemedyMatcher;
