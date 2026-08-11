import React from 'react';
import Footer from '../components/Footer';

const DataRetention = () => (
  <div style={{ minHeight:'100vh', background:'#fff' }}>
    <div style={{ maxWidth:800, margin:'0 auto', padding:'40px 24px', lineHeight:1.8, color:'#334155' }}>
      <h1 style={{ fontSize:'1.8rem', fontWeight:800, marginBottom:24 }}>Data Retention Policy</h1>

      {[
        { t:'What We Collect', b:'Personal data: name, phone, email, age, gender. Health data: medical history, prescriptions, lab reports, consultation notes. Usage data: bookings, payments, provider interactions.' },
        { t:'How Long We Keep It', b:'Active accounts: Data retained while account is active. Inactive accounts (no login for 3 years): Data anonymized or deleted. Booking records: 7 years (legal requirement). Payment records: 10 years (tax compliance). Medical records: Per medical council guidelines.' },
        { t:'Your Rights (DPDP Act 2023)', b:'Right to access your data. Right to correct inaccurate data. Right to delete your data (subject to legal retention requirements). Right to withdraw consent. Right to data portability. Right to grievance redressal.' },
        { t:'How to Delete Your Data', b:'Go to Profile → Settings → Delete Account. Alternatively, email privacy@healthcarehub.com with subject "Data Deletion Request". We will respond within 7 working days. Some data may be retained for legal compliance.' },
        { t:'Data Storage', b:'All data is stored on servers located in India. We use MongoDB Atlas with encryption at rest. Backups are encrypted. Data is never transferred outside India without explicit consent.' },
      ].map((s,i)=>(<div key={i} style={{ marginBottom:20 }}><h3 style={{ fontWeight:700 }}>{s.t}</h3><p>{s.b}</p></div>))}
    </div>
    <Footer />
  </div>
);

export default DataRetention;

