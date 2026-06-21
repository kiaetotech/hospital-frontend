import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeopathyHub = () => {
  const navigate = useNavigate();

  const services = [
    { id: 'doctors', icon: '👨‍⚕️', title: 'Find Homeopathy Doctor', subtitle: 'Classical & modern homeopathy', desc: 'Consult verified homeopathic practitioners. Online video or clinic visit.', route: '/homeopathy/doctors', color: '#7C3AED', stats: '100+ Doctors', cta: 'Find Doctor' },
    { id: 'naturopathy', icon: '🌿', title: 'Naturopathy Centers', subtitle: 'Drugless natural healing', desc: 'Book naturopathy treatments, detox programs & lifestyle coaching.', route: '/homeopathy/centers', color: '#059669', stats: '50+ Centers', cta: 'Explore Centers' },
    { id: 'pharmacy', icon: '💊', title: 'Homeopathy Pharmacy', subtitle: 'Order remedies online', desc: 'Order potentized remedies. Delivery OTP verified. Track your order live.', route: '/homeopathy/pharmacy', color: '#DC2626', stats: '10,000+ Remedies', cta: 'Order Medicine' },
    { id: 'consult', icon: '📞', title: 'Online Consultation', subtitle: 'Video/voice call', desc: 'Instant online consultation with homeopathy & naturopathy experts.', route: '/homeopathy/doctors?mode=online', color: '#2563EB', cta: 'Consult Now' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #059669 100%)', borderRadius: '1rem', padding: '3rem 2rem', textAlign: 'center', color: 'white', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>🌿 Homeopathy & Naturopathy</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, marginTop: '0.5rem' }}>Natural healing. Scientific approach. Verified practitioners.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => navigate('/homeopathy/doctors')} style={{ padding: '0.75rem 2rem', backgroundColor: 'white', color: '#7C3AED', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Find Doctor</button>
          <button onClick={() => navigate('/homeopathy/pharmacy')} style={{ padding: '0.75rem 2rem', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid white', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Order Medicine</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {services.map(s => (
          <div key={s.id} onClick={() => navigate(s.route)} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{s.icon}</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: s.color }}>{s.title}</h3>
            <p style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>{s.subtitle}</p>
            <p style={{ color: '#475569', margin: '0.5rem 0 1rem' }}>{s.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{s.stats}</span>
              <button style={{ backgroundColor: s.color, color: 'white', padding: '0.5rem 1.5rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>{s.cta} →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeopathyHub;