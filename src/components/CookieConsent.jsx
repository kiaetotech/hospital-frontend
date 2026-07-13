import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [show, setShow] = useState(false);
  useEffect(() => { if (!localStorage.getItem('cookieConsent')) setShow(true); }, []);
  if (!show) return null;

  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#0f172a', color:'#fff', padding:'16px 24px', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, fontSize:'0.85rem' }}>
      <span>🍪 We use cookies to improve your experience. By continuing, you agree to our <a href="/privacy" style={{ color:'#60a5fa' }}>Privacy Policy</a>.</span>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={()=>{ localStorage.setItem('cookieConsent','accepted'); setShow(false); }} style={{ padding:'8px 20px', background:'#2563eb', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontWeight:700 }}>Accept</button>
        <button onClick={()=>{ localStorage.setItem('cookieConsent','rejected'); setShow(false); }} style={{ padding:'8px 20px', background:'#334155', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>Reject</button>
      </div>
    </div>
  );
};

export default CookieConsent;