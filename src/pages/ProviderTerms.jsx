import React from 'react';
import Footer from '../components/Footer';

const ProviderTerms = () => (
  <div style={{ minHeight:'100vh', background:'#fff' }}>
    <div style={{ maxWidth:800, margin:'0 auto', padding:'40px 24px', lineHeight:1.8, color:'#334155' }}>
      <h1 style={{ fontSize:'1.8rem', fontWeight:800, marginBottom:8 }}>Provider Terms of Service</h1>
      <p style={{ color:'#64748b', marginBottom:32 }}>These terms govern your use of HealthCare Hub as a healthcare service provider. By registering, you agree to these terms.</p>

      {[
        { t:'1. Definitions', b:'"Provider" means any hospital, doctor, diagnostic lab, therapist, Ayurveda/homeopathy practitioner, ambulance service, caregiver, insurance company, or lender registered on HealthCare Hub. "Platform" means HealthCare Hub website and services.' },
        { t:'2. Provider Obligations', b:'Providers must: (a) Hold valid, current licenses/registrations (MCI, AYUSH, NABH, NABL, etc.); (b) Provide accurate information about services, pricing, and availability; (c) Maintain professional indemnity insurance; (d) Respond to bookings within the promised timeframe; (e) Not discriminate against patients; (f) Maintain patient confidentiality per applicable laws.' },
        { t:'3. Verification', b:'HealthCare Hub verifies provider credentials through document review. Approval is at our sole discretion. Verified status may be revoked if credentials expire or complaints are received. Providers must update credentials before expiry.' },
        { t:'4. Commission & Pricing', b:'Commission rates are set by HealthCare Hub and may vary by service type, provider performance, and volume. Current rates are available in your provider dashboard. Commission is deducted automatically from each transaction. Providers may set their own prices within platform guidelines.' },
        { t:'5. Patient Data & Privacy', b:'Providers may access patient data only for treatment purposes. Data must not be shared, sold, or used for marketing. All patient data must be handled per our Privacy Policy and applicable laws (IT Act, DPDP Act 2023). Breach of data privacy will result in immediate termination and legal action.' },
        { t:'6. Liability & Indemnity', b:'Providers are solely responsible for the medical services they provide. HealthCare Hub is a technology platform and not liable for medical outcomes. Providers agree to indemnify HealthCare Hub against any claims arising from their services. Providers must carry their own professional liability insurance.' },
        { t:'7. Service Standards', b:'Providers must maintain: (a) Minimum 4.0 rating; (b) Response time under 30 minutes for queries; (c) Accurate availability calendar; (d) Honest pricing with no hidden charges; (e) Professional conduct at all times.' },
        { t:'8. Termination', b:'Either party may terminate with 30 days notice. HealthCare Hub may immediately suspend/terminate for: fraud, patient harm, license expiry, data breach, rating below 3.0 sustained for 30 days, or violation of these terms.' },
        { t:'9. Intellectual Property', b:'Providers grant HealthCare Hub the right to display their name, logo, and service information on the platform for marketing purposes. Platform technology, branding, and patient data remain HealthCare Hub property.' },
        { t:'10. Dispute Resolution', b:'Disputes shall first be resolved through mutual discussion. Unresolved disputes shall be referred to arbitration per Indian Arbitration Act. Jurisdiction: [City], India.' },
        { t:'11. Corporate Plans', b:'Providers opting for corporate plans agree to: (a) Separate corporate pricing; (b) Bulk booking capability; (c) Dedicated point of contact; (d) SLA adherence for corporate clients; (e) Custom reporting requirements.' },
      ].map((s,i)=>(<div key={i} style={{ marginBottom:20 }}><h3 style={{ fontWeight:700, marginBottom:4 }}>{s.t}</h3><p>{s.b}</p></div>))}

      <div style={{ background:'#f0f9ff', padding:16, borderRadius:8, borderLeft:'4px solid #2563eb', marginTop:24 }}>
        <strong>Contact:</strong> 📧 provider.legal@healthcarehub.com<br/>
        By registering, you acknowledge that you have read, understood, and agree to these Provider Terms of Service.
      </div>
    </div>
    <Footer />
  </div>
);

export default ProviderTerms;
