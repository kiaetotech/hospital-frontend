import React from 'react';
import { useNavigate } from 'react-router-dom';

const Ambulance = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* EMERGENCY HERO */}
      <div style={styles.emergencyHero}>
        <button style={styles.emergencyBtn} onClick={() => navigate('/ambulance/emergency')}>
          <span style={styles.emergencyIcon}>🚨</span>
          <span style={styles.emergencyText}>EMERGENCY</span>
          <span style={styles.emergencySub}>Press for Immediate Ambulance</span>
        </button>
        <p style={styles.emergencyFallback}>Or call <strong style={{ color: '#fff', fontSize: '18px', display: 'block', marginTop: '4px' }}>108</strong> directly</p>
      </div>

      {/* QUICK BOOK */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeading}>Quick Book Ambulance</h2>
        <div style={styles.quickBookGrid}>
          <button style={{ ...styles.quickBookCard, borderColor: '#e53935', background: '#fff5f5' }} onClick={() => navigate('/ambulance/emergency')}>
            <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#e53935', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 700 }}>Priority</span>
            <span style={styles.cardIcon}>🚨</span>
            <span style={styles.cardTitle}>Emergency Now</span>
            <span style={styles.cardDesc}>Immediate dispatch to your location</span>
          </button>
          <button style={styles.quickBookCard} onClick={() => navigate('/ambulance/schedule')}>
            <span style={styles.cardIcon}>📅</span>
            <span style={styles.cardTitle}>Schedule Later</span>
            <span style={styles.cardDesc}>Book for a future date & time</span>
          </button>
        </div>
      </div>

      {/* AMBULANCE TYPES */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeading}>Select Ambulance Type</h2>
        <div style={styles.typesGrid}>
          {ambulanceTypes.map((type, i) => (
            <button key={i} style={styles.typeCard} onClick={() => navigate(`/ambulance/schedule?type=${type.value}`)}>
              <span style={styles.typeIcon}>{type.icon}</span>
              <span style={styles.typeName}>{type.name}</span>
              <span style={styles.typeDesc}>{type.desc}</span>
              <span style={styles.typePrice}>From ₹{type.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FIND HOSPITAL */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeading}>Find Destination Hospital</h2>
        <div style={styles.searchBox} onClick={() => navigate('/hospitals')}>
          <span>🔍</span>
          <span style={{ color: '#999', fontSize: '14px' }}>Search hospitals by name, city, or specialty...</span>
        </div>
        <div style={styles.nearbyGrid}>
          <button style={styles.nearbyBtn} onClick={() => navigate('/hospitals?emergency=true')}>🏥 Hospitals with Emergency</button>
          <button style={styles.nearbyBtn} onClick={() => navigate('/hospitals?beds_available=true')}>🛏️ Hospitals with Available Beds</button>
        </div>
      </div>

      {/* MANAGE */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeading}>Manage</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button style={styles.manageCard} onClick={() => navigate('/ambulance/emergency-contacts')}>
            <span style={{ fontSize: '28px', flexShrink: 0 }}>🛡️</span>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#222', display: 'block' }}>Emergency Contacts</span>
              <span style={{ fontSize: '11px', color: '#999', display: 'block', marginTop: '2px' }}>Add contacts & medical info shared during emergency</span>
            </div>
          </button>
          <button style={styles.manageCard} onClick={() => navigate('/my-bookings')}>
            <span style={{ fontSize: '28px', flexShrink: 0 }}>📋</span>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#222', display: 'block' }}>My Bookings</span>
              <span style={{ fontSize: '11px', color: '#999', display: 'block', marginTop: '2px' }}>Track active & past ambulance bookings</span>
            </div>
          </button>
          <button style={styles.manageCard} onClick={() => navigate('/ambulance/driver/app')}>
            <span style={{ fontSize: '28px', flexShrink: 0 }}>👨‍⚕️</span>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#222', display: 'block' }}>Driver App</span>
              <span style={{ fontSize: '11px', color: '#999', display: 'block', marginTop: '2px' }}>For ambulance drivers - accept emergencies</span>
            </div>
          </button>
        </div>
      </div>

      {/* PROVIDERS */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeading}>For Ambulance Providers</h2>
        <div style={styles.providerGrid}>
          <button style={styles.providerCard} onClick={() => navigate('/ambulance/register')}>📝 Register Your Fleet</button>
          <button style={styles.providerCard} onClick={() => navigate('/ambulance/login')}>🔐 Provider Login</button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '12px' }}>
        <p>⚠️ For life-threatening emergencies, always call <strong>108</strong> first.</p>
      </div>
    </div>
  );
};

const ambulanceTypes = [
  { icon: '🚑', name: 'Basic Life Support', desc: 'Oxygen, first aid, stretcher', price: '500', value: 'basic' },
  { icon: '❤️', name: 'Cardiac Ambulance', desc: 'Defibrillator, ECG monitor', price: '750', value: 'cardiac' },
  { icon: '🫁', name: 'Ventilator Ambulance', desc: 'ICU setup, ventilator', price: '900', value: 'ventilator' },
  { icon: '👶', name: 'Neonatal Ambulance', desc: 'Newborn & infant care', price: '1,000', value: 'neonatal' },
  { icon: '♿', name: 'Wheelchair Transport', desc: 'Non-emergency mobility', price: '400', value: 'wheelchair' },
];

const styles = {
  page: { minHeight: '100vh', background: '#f0f2f5', paddingBottom: '40px' },
  emergencyHero: { background: 'linear-gradient(180deg, #e53935 0%, #c62828 100%)', padding: '30px 20px 25px', textAlign: 'center' },
  emergencyBtn: { width: '100%', maxWidth: '360px', padding: '28px 20px', background: '#fff', color: '#e53935', border: 'none', borderRadius: '20px', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  emergencyIcon: { display: 'block', fontSize: '52px', marginBottom: '6px' },
  emergencyText: { display: 'block', fontSize: '26px', fontWeight: 900, letterSpacing: '3px', color: '#e53935' },
  emergencySub: { display: 'block', fontSize: '13px', color: '#888', marginTop: '4px' },
  emergencyFallback: { color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginTop: '14px' },
  section: { background: '#fff', margin: '14px 16px', padding: '18px', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionHeading: { fontSize: '17px', fontWeight: 700, color: '#222', margin: '0 0 14px 0' },
  quickBookGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  quickBookCard: { padding: '18px 14px', border: '2px solid #e8e8e8', borderRadius: '12px', background: '#fff', cursor: 'pointer', textAlign: 'center', position: 'relative' },
  cardIcon: { display: 'block', fontSize: '34px', marginBottom: '6px' },
  cardTitle: { display: 'block', fontSize: '14px', fontWeight: 700, color: '#222', marginBottom: '2px' },
  cardDesc: { display: 'block', fontSize: '11px', color: '#888' },
  typesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  typeCard: { padding: '14px 10px', border: '1px solid #eee', borderRadius: '10px', background: '#fff', cursor: 'pointer', textAlign: 'center' },
  typeIcon: { display: 'block', fontSize: '28px', marginBottom: '4px' },
  typeName: { display: 'block', fontSize: '13px', fontWeight: 700, color: '#333' },
  typeDesc: { display: 'block', fontSize: '10px', color: '#999', margin: '2px 0' },
  typePrice: { display: 'block', fontSize: '12px', fontWeight: 700, color: '#e53935', marginTop: '4px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', border: '2px solid #e0e0e0', borderRadius: '10px', cursor: 'pointer', background: '#fafafa' },
  nearbyGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' },
  nearbyBtn: { padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#444', textAlign: 'center' },
  manageCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: '1px solid #eee', borderRadius: '10px', background: '#fff', cursor: 'pointer', textAlign: 'left' },
  providerGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  providerCard: { padding: '16px', border: '2px dashed #ddd', borderRadius: '10px', background: '#fafafa', cursor: 'pointer', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#555' },
};

export default Ambulance;