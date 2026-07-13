// components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{ background: '#0f172a', color: '#cbd5e1', padding: '40px 24px 20px', fontSize: '0.85rem' }}>
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
      <div>
        <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 12 }}>HealthCare Hub</h4>
        <p style={{ lineHeight: 1.7 }}>India's most comprehensive healthcare marketplace — 11 services, one platform.</p>
        <p style={{ marginTop: 8 }}>📧 support@healthcarehub.com</p>
        <p>📞 +91 9876543210</p>
      </div>
      <div>
        <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 12 }}>For Patients</h4>
        <Link to="/hospitals" style={linkStyle}>Find Hospitals</Link>
        <Link to="/ambulance" style={linkStyle}>Book Ambulance</Link>
        <Link to="/online-doctor" style={linkStyle}>Online Doctor</Link>
        <Link to="/diagnostics" style={linkStyle}>Lab Tests</Link>
        <Link to="/my-bookings" style={linkStyle}>My Bookings</Link>
      </div>
      <div>
        <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 12 }}>For Providers</h4>
        <Link to="/hospital/register" style={linkStyle}>Register Hospital</Link>
        <Link to="/ambulance/register" style={linkStyle}>Register Ambulance</Link>
        <Link to="/online-doctor/register" style={linkStyle}>Register as Doctor</Link>
        <Link to="/corporate" style={linkStyle}>Corporate Health</Link>
      </div>
      <div>
        <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 12 }}>Legal & Support</h4>
        <Link to="/terms" style={linkStyle}>Terms & Conditions</Link>
        <Link to="/privacy" style={linkStyle}>Privacy Policy</Link>
        <Link to="/refund" style={linkStyle}>Refund Policy</Link>
        <Link to="/disclaimer" style={linkStyle}>Medical Disclaimer</Link>
        <Link to="/grievance" style={linkStyle}>Grievance Redressal</Link>
        <Link to="/cancellation" style={linkStyle}>Cancellation Policy</Link>
      </div>
    </div>
    <div style={{ borderTop: '1px solid #334155', marginTop: 32, paddingTop: 16, textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
      © 2026 HealthCare Hub. All rights reserved. | ISO Certified | NABH Accredited | Data Secure
    </div>
  </footer>
);

const linkStyle = { display: 'block', color: '#94a3b8', textDecoration: 'none', padding: '4px 0', fontSize: '0.85rem' };

export default Footer;