import React from 'react';
import Footer from '../components/Footer';

const CancellationPolicy = () => (
  <div style={{ minHeight:'100vh', background:'#fff' }}>
    <div style={{ maxWidth:800, margin:'0 auto', padding:'40px 24px', lineHeight:1.8, color:'#334155' }}>
      <h1 style={{ fontSize:'1.8rem', fontWeight:800, marginBottom:8 }}>Cancellation & Refund Policy</h1>
      <p style={{ color:'#64748b', marginBottom:24 }}>Last Updated: July 2026</p>

      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.88rem' }}>
          <thead><tr style={{ borderBottom:'2px solid #e2e8f0' }}><th style={th}>Service</th><th style={th}>Cancellation Window</th><th style={th}>Refund</th><th style={th}>Conditions</th></tr></thead>
          <tbody>
            {[
              ['🏥 Hospital OPD','Up to 2 hours before','100% refund','No refund for no-show'],
              ['🏥 Hospital Admission','24 hours before admission','90% refund','Processing fee deducted'],
              ['🚑 Ambulance (Scheduled)','6 hours before pickup','100% refund','Emergency trips non-refundable'],
              ['🚑 Ambulance (Emergency)','Cannot cancel after dispatch','No refund','Trip sheet provided for insurance'],
              ['📱 Online Doctor','1 hour before consult','100% refund','Partial refund if doctor waited >10min'],
              ['🔬 Lab Tests','Before sample collection','100% refund','No refund after sample collected'],
              ['🔬 Health Package','24 hours before appointment','100% refund','Home collection: before phlebotomist arrival'],
              ['🧠 Therapy Session','12 hours before session','100% refund','Late cancel: 50% refund'],
              ['🧘 Ayurveda Consult','2 hours before','100% refund','Panchakarma: 48 hours notice'],
              ['🌿 Homeopathy Consult','2 hours before','100% refund','Pharmacy: no return on opened medicines'],
              ['🏠 Home Care','24 hours before shift','100% refund','After caregiver assigned: 50%'],
              ['🛡️ Insurance','Within 15 days (free look)','100% refund','After free look: per IRDAI rules'],
              ['💰 Health EMI','Before disbursement','Processing fee only','After disbursement: no cancellation'],
              ['🏢 Corporate Wallet','Anytime (unused balance)','100% refund','Used services not refundable'],
            ].map((r,i)=>(<tr key={i} style={{ borderBottom:'1px solid #e5e7eb' }}><td style={td}><strong>{r[0]}</strong></td><td style={td}>{r[1]}</td><td style={td}>{r[2]}</td><td style={td}>{r[3]}</td></tr>))}
          </tbody>
        </table>
      </div>

      <h3 style={{ fontWeight:700, marginTop:32 }}>Refund Process</h3>
      <p>Refunds initiated within 24 hours of cancellation. Amount credited to original payment method within 5-7 business days. Wallet refunds are instant.</p>

      <h3 style={{ fontWeight:700, marginTop:24 }}>Force Majeure</h3>
      <p>In case of natural disasters, government orders, or medical emergencies (with proof), cancellation charges may be waived at our discretion.</p>

      <h3 style={{ fontWeight:700, marginTop:24 }}>Contact</h3>
      <p>📧 refund@healthcarehub.com | 📞 +91 9876543210</p>
    </div>
    <Footer />
  </div>
);

const th = { padding:'12px 14px', textAlign:'left', fontWeight:700, fontSize:'0.85rem', color:'#374151' };
const td = { padding:'10px 14px', fontSize:'0.85rem' };

export default CancellationPolicy;