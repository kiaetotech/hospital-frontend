import React from 'react';
import Footer from '../components/Footer';

const Disclaimer = () => (
  <div style={{ minHeight: '100vh', background: '#fff' }}>
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>Medical Disclaimer</h1>
      
      <div style={{ lineHeight: 1.8, color: '#334155' }}>
        <p><strong>Last Updated:</strong> July 2026</p>
        
        <h3 style={{ marginTop: 24, fontWeight: 700 }}>1. Platform Nature</h3>
        <p>HealthCare Hub is a technology platform that connects patients with healthcare providers. We do not provide medical advice, diagnosis, or treatment. All medical services are provided by independent, registered healthcare professionals.</p>
        
        <h3 style={{ marginTop: 24, fontWeight: 700 }}>2. No Doctor-Patient Relationship</h3>
        <p>Using this platform does not create a doctor-patient relationship with HealthCare Hub. The relationship is solely between you and the healthcare provider you choose to consult.</p>
        
        <h3 style={{ marginTop: 24, fontWeight: 700 }}>3. Emergency Disclaimer</h3>
        <p style={{ background: '#fef3c7', padding: 16, borderRadius: 8, borderLeft: '4px solid #f59e0b' }}>
          ⚠️ <strong>IN CASE OF MEDICAL EMERGENCY:</strong> Do not use this platform. Call 108 (Ambulance) or visit your nearest hospital emergency room immediately. Our platform is for non-emergency consultations only.
        </p>
        
        <h3 style={{ marginTop: 24, fontWeight: 700 }}>4. AI-Assisted Features</h3>
        <p>Some features use AI (Artificial Intelligence) for symptom analysis and remedy suggestions. These are informational tools only and do not replace professional medical judgment. Always consult a qualified doctor before taking any action based on AI suggestions.</p>
        
        <h3 style={{ marginTop: 24, fontWeight: 700 }}>5. Alternative Medicine</h3>
        <p>Ayurveda, Homeopathy, and Naturopathy services are offered by registered AYUSH practitioners. These are complementary systems of medicine. Results may vary. Consult your primary physician before starting any alternative treatment.</p>
        
        <h3 style={{ marginTop: 24, fontWeight: 700 }}>6. Lab Test Results</h3>
        <p>Lab test results provided through our platform are for informational purposes. Always discuss results with your doctor for proper interpretation and diagnosis.</p>
        
        <h3 style={{ marginTop: 24, fontWeight: 700 }}>7. Mental Health Services</h3>
        <p>Our mental wellness services provide counseling and therapy support. They are not a substitute for emergency psychiatric care. If you're experiencing suicidal thoughts, please call the 24/7 helpline: 9152987821 (iCall) or 1800-599-0019 (KIRAN).</p>
        
        <h3 style={{ marginTop: 24, fontWeight: 700 }}>8. No Guarantees</h3>
        <p>HealthCare Hub does not guarantee specific outcomes from any treatment, consultation, or service availed through our platform.</p>
        
        <h3 style={{ marginTop: 24, fontWeight: 700 }}>9. Limitation of Liability</h3>
        <p>HealthCare Hub shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of our platform or services provided by third-party providers.</p>
        
        <h3 style={{ marginTop: 24, fontWeight: 700 }}>10. Contact</h3>
        <p>For questions about this disclaimer: 📧 legal@healthcarehub.com</p>
      </div>
    </div>
    <Footer />
  </div>
);

export default Disclaimer;
