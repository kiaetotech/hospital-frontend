import React from 'react';
import Footer from '../components/Footer';

const Grievance = () => (
  <div style={{ minHeight:'100vh', background:'#fff' }}>
    <div style={{ maxWidth:800, margin:'0 auto', padding:'40px 24px' }}>
      <h1 style={{ fontSize:'1.8rem', fontWeight:800, marginBottom:8 }}>Grievance Redressal</h1>
      <p style={{ color:'#64748b', marginBottom:32 }}>We are committed to resolving your concerns promptly and fairly.</p>

      <div style={{ lineHeight:1.8, color:'#334155' }}>
        <h3 style={{ fontWeight:700, marginBottom:12 }}>Level 1: Customer Support</h3>
        <div style={{ background:'#f8fafc', padding:16, borderRadius:8, marginBottom:24 }}>
          <p>📧 support@healthcarehub.com</p>
          <p>📞 +91 9876543210 (Mon-Sat, 9AM-7PM)</p>
          <p>💬 Live Chat: Available on website and app</p>
          <p>⏱ Response Time: Within 24 hours</p>
        </div>

        <h3 style={{ fontWeight:700, marginBottom:12 }}>Level 2: Grievance Officer</h3>
        <div style={{ background:'#f8fafc', padding:16, borderRadius:8, marginBottom:24 }}>
          <p><strong>Name:</strong> [Grievance Officer Name]</p>
          <p>📧 grievance@healthcarehub.com</p>
          <p>📞 +91 XXXXXXXXXX</p>
          <p>🏢 HealthCare Hub, [Registered Office Address], India</p>
          <p>⏱ Response Time: Within 7 working days</p>
        </div>

        <h3 style={{ fontWeight:700, marginBottom:12 }}>Level 3: Regulatory Bodies</h3>
        <p>If unresolved after 30 days, you may approach:</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:16, marginTop:12 }}>
          {[
            { title:'Consumer Disputes', body:'National Consumer Helpline: 1800-11-4000 / 14404\nOnline: consumerhelpline.gov.in' },
            { title:'Insurance (IRDAI)', body:'IRDAI Grievance Call Centre: 155255 / 1800-425-4732\nOnline: igms.irda.gov.in' },
            { title:'Banking/EMI (RBI)', body:'RBI Ombudsman: cms.rbi.org.in\nComplaint email: crpc@rbi.org.in' },
            { title:'Data Privacy', body:'Data Protection Board of India\nEmail: dpb@india.gov.in' },
            { title:'Medical Negligence', body:'National Medical Commission\nEmail: nmc@nmc.org.in\nState Medical Council' },
            { title:'Pharmacy/Drugs', body:'CDSCO: cdsco.gov.in\nState Drug Controller' },
          ].map((r,i)=>(<div key={i} style={{ background:'#f8fafc', padding:14, borderRadius:8, border:'1px solid #e2e8f0' }}><strong>{r.title}</strong><p style={{ fontSize:'0.85rem', whiteSpace:'pre-line', marginTop:4 }}>{r.body}</p></div>))}
        </div>

        <h3 style={{ fontWeight:700, marginTop:24, marginBottom:12 }}>Service-Specific Escalation</h3>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' }}>
            <thead><tr style={{ borderBottom:'2px solid #e2e8f0' }}><th style={th}>Service</th><th style={th}>Issue Type</th><th style={th}>Escalation Contact</th></tr></thead>
            <tbody>
              {[
                ['🏥 Hospitals','Bed availability, OPD issues','hospital.support@healthcarehub.com'],
                ['🚑 Ambulance','Emergency dispatch, fare dispute','ambulance.support@healthcarehub.com'],
                ['📱 Online Doctor','Consultation, prescription','onlinedoctor@healthcarehub.com'],
                ['🔬 Lab Tests','Report delay, incorrect results','labsupport@healthcarehub.com'],
                ['🧠 Mental Wellness','Therapist issue, crisis','mentalhealth@healthcarehub.com'],
                ['🧘 Ayurveda','Treatment, Panchakarma','ayurveda@healthcarehub.com'],
                ['🌿 Homeopathy','Remedy, consultation','homeopathy@healthcarehub.com'],
                ['🏠 Home Care','Caregiver issue, billing','homecare@healthcarehub.com'],
                ['🛡️ Insurance','Claim rejection, policy','insurance@healthcarehub.com'],
                ['💰 Health EMI','Loan application, repayment','emi@healthcarehub.com'],
                ['🏢 Corporate','Employee issue, wallet','corporate@healthcarehub.com'],
              ].map((r,i)=>(<tr key={i} style={{ borderBottom:'1px solid #e5e7eb' }}><td style={td}>{r[0]}</td><td style={td}>{r[1]}</td><td style={td}>{r[2]}</td></tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

const th = { padding:'12px 14px', textAlign:'left', fontWeight:700, fontSize:'0.85rem', color:'#374151' };
const td = { padding:'10px 14px', fontSize:'0.85rem' };

export default Grievance;
