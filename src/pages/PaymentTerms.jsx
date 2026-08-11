import React from 'react';
import Footer from '../components/Footer';

const PaymentTerms = () => (
  <div style={{ minHeight:'100vh', background:'#fff' }}>
    <div style={{ maxWidth:800, margin:'0 auto', padding:'40px 24px', lineHeight:1.8, color:'#334155' }}>
      <h1 style={{ fontSize:'1.8rem', fontWeight:800, marginBottom:24 }}>Payment Terms</h1>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.88rem' }}>
          <thead><tr style={{ borderBottom:'2px solid #e2e8f0' }}><th style={th}>Service</th><th style={th}>Payment Method</th><th style={th}>Platform Fee</th><th style={th}>Timing</th></tr></thead>
          <tbody>
            {[
              ['OPD/Consultation','Online (UPI/Card/NetBanking)','₹30-80 based on amount','At booking'],
              ['Lab Tests','Online / Cash at center','Included in price','At booking or sample collection'],
              ['Ambulance','Online / Cash to driver','₹50','After trip completion'],
              ['Insurance','Online only','Included in premium','At policy purchase'],
              ['Health EMI','Online (auto-debit)','2-5% processing fee','At disbursement'],
              ['Corporate Wallet','Bank Transfer / UPI','No platform fee','Prepaid, deducted per use'],
            ].map((r,i)=>(<tr key={i} style={{ borderBottom:'1px solid #e5e7eb' }}><td style={td}><strong>{r[0]}</strong></td><td style={td}>{r[1]}</td><td style={td}>{r[2]}</td><td style={td}>{r[3]}</td></tr>))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop:24 }}>All payments processed through Razorpay (PCI-DSS compliant). Refunds per our Cancellation Policy. For payment issues: 📧 payments@healthcarehub.com</p>
    </div>
    <Footer />
  </div>
);

const th = { padding:'12px 14px', textAlign:'left', fontWeight:700, fontSize:'0.85rem' };
const td = { padding:'10px 14px', fontSize:'0.85rem' };

export default PaymentTerms;

