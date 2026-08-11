import React from 'react';

const AIDisclaimer = ({ feature }) => (
  <div style={{ background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:8, padding:'10px 14px', fontSize:'0.78rem', color:'#0369a1', display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
    <span>🤖</span>
    <span>This {feature || 'feature'} uses AI. Results are informational and not a substitute for professional medical advice. <a href="/disclaimer" style={{ color:'#0369a1', fontWeight:700 }}>Learn more</a></span>
  </div>
);

export default AIDisclaimer;
