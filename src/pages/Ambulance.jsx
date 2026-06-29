import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Ambulance = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/hospitals?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>🚑 Ambulance Services</h1>
        <p style={styles.heroSubtitle}>Emergency & Non-Emergency Medical Transport</p>
      </div>

      {/* Emergency Button - Most Prominent */}
      <div style={styles.emergencySection}>
        <button
          onClick={() => navigate('/ambulance/emergency')}
          style={styles.emergencyButton}
        >
          <span style={styles.emergencyIcon}>🚨</span>
          <span style={styles.emergencyText}>EMERGENCY</span>
          <span style={styles.emergencyHint}>Tap for immediate ambulance dispatch</span>
        </button>
        <p style={styles.emergencyNote}>
          For life-threatening emergencies, also call <strong>108</strong>
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div style={styles.quickActions}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <button onClick={() => navigate('/ambulance/schedule')} style={styles.actionCard}>
            <span style={styles.actionIcon}>📅</span>
            <span style={styles.actionLabel}>Schedule Transport</span>
            <span style={styles.actionDesc}>Book non-emergency ambulance in advance</span>
          </button>

          <button onClick={() => navigate('/ambulance/emergency-contacts')} style={styles.actionCard}>
            <span style={styles.actionIcon}>🛡️</span>
            <span style={styles.actionLabel}>Emergency Contacts</span>
            <span style={styles.actionDesc}>Manage contacts & medical info</span>
          </button>

          <button onClick={() => navigate('/my-bookings')} style={styles.actionCard}>
            <span style={styles.actionIcon}>📋</span>
            <span style={styles.actionLabel}>My Bookings</span>
            <span style={styles.actionDesc}>View active & past ambulance bookings</span>
          </button>

          <button onClick={() => navigate('/ambulance/driver/app')} style={styles.actionCard}>
            <span style={styles.actionIcon}>👨‍⚕️</span>
            <span style={styles.actionLabel}>Driver App</span>
            <span style={styles.actionDesc}>For ambulance drivers & providers</span>
          </button>
        </div>
      </div>

      {/* Ambulance Types */}
      <div style={styles.typesSection}>
        <h2 style={styles.sectionTitle}>Available Ambulance Types</h2>
        <div style={styles.typesGrid}>
          {ambulanceTypes.map((type, index) => (
            <div key={index} style={styles.typeCard}>
              <span style={styles.typeIcon}>{type.icon}</span>
              <h3 style={styles.typeName}>{type.name}</h3>
              <p style={styles.typeDesc}>{type.desc}</p>
              <span style={styles.typePrice}>From ₹{type.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search Hospital */}
      <div style={styles.searchSection}>
        <h2 style={styles.sectionTitle}>Find Destination Hospital</h2>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            placeholder="Search hospital by name, specialty, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchBtn}>🔍 Search</button>
        </form>
      </div>

      {/* Fare Estimate CTA */}
      <div style={styles.fareSection}>
        <h2 style={styles.sectionTitle}>💰 Fare Estimate</h2>
        <p style={styles.fareText}>Get an instant estimate before booking</p>
        <button onClick={() => navigate('/ambulance/schedule')} style={styles.fareBtn}>
          Calculate Fare
        </button>
      </div>

      {/* Info Cards */}
      <div style={styles.infoSection}>
        <div style={styles.infoCard}>
          <span style={styles.infoIcon}>⚡</span>
          <h3 style={styles.infoTitle}>Fast Response</h3>
          <p style={styles.infoText}>Average response time under 5 minutes in metro cities</p>
        </div>
        <div style={styles.infoCard}>
          <span style={styles.infoIcon}>💰</span>
          <h3 style={styles.infoTitle}>Transparent Pricing</h3>
          <p style={styles.infoText}>Know the fare before you book. No hidden charges.</p>
        </div>
        <div style={styles.infoCard}>
          <span style={styles.infoIcon}>🏥</span>
          <h3 style={styles.infoTitle}>Hospital Connected</h3>
          <p style={styles.infoText}>We alert the hospital ER before you arrive.</p>
        </div>
      </div>

      {/* Provider Section */}
      <div style={styles.providerSection}>
        <h2 style={styles.sectionTitle}>For Ambulance Providers</h2>
        <div style={styles.providerGrid}>
          <button onClick={() => navigate('/ambulance/register')} style={styles.providerCard}>
            <span style={styles.actionIcon}>📝</span>
            <span style={styles.actionLabel}>Register Fleet</span>
          </button>
          <button onClick={() => navigate('/ambulance/login')} style={styles.providerCard}>
            <span style={styles.actionIcon}>🔐</span>
            <span style={styles.actionLabel}>Provider Login</span>
          </button>
        </div>
      </div>

      {/* Footer Note */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          ⚠️ In case of life-threatening emergencies, always call <strong>108</strong> (National Ambulance) immediately.
        </p>
        <p style={styles.footerText}>
          Our service complements emergency response systems and helps you find the nearest available private ambulance.
        </p>
      </div>
    </div>
  );
};

const ambulanceTypes = [
  { icon: '🚑', name: 'Basic Life Support', desc: 'Standard ambulance with basic medical equipment', price: '500' },
  { icon: '❤️', name: 'Cardiac Ambulance', desc: 'Equipped with defibrillator & cardiac monitor', price: '750' },
  { icon: '🫁', name: 'Ventilator Ambulance', desc: 'Advanced life support with ventilator', price: '900' },
  { icon: '👶', name: 'Neonatal Ambulance', desc: 'Specialized for newborn & infant transport', price: '1,000' },
  { icon: '♿', name: 'Wheelchair Transport', desc: 'Non-emergency transport for mobility patients', price: '400' },
  { icon: '🚐', name: 'Mortuary Transport', desc: 'Dignified transport with refrigeration', price: '600' },
];

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f5',
    paddingBottom: '40px'
  },
  hero: {
    background: 'linear-gradient(135deg, #e53935, #c62828)',
    padding: '40px 20px',
    textAlign: 'center'
  },
  heroTitle: {
    color: '#fff',
    fontSize: '28px',
    margin: '0 0 8px 0'
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    margin: 0
  },
  emergencySection: {
    padding: '20px',
    textAlign: 'center',
    marginTop: '-20px'
  },
  emergencyButton: {
    width: '100%',
    maxWidth: '400px',
    padding: '30px',
    background: 'linear-gradient(135deg, #e53935, #c62828)',
    color: '#fff',
    border: '4px solid #fff',
    borderRadius: '20px',
    cursor: 'pointer',
    boxShadow: '0 8px 30px rgba(229,57,53,0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  emergencyIcon: {
    fontSize: '50px'
  },
  emergencyText: {
    fontSize: '24px',
    fontWeight: 'bold',
    letterSpacing: '2px'
  },
  emergencyHint: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)'
  },
  emergencyNote: {
    color: '#666',
    fontSize: '12px',
    marginTop: '10px'
  },
  quickActions: {
    padding: '0 20px',
    marginBottom: '30px'
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#333',
    margin: '0 0 15px 0'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  actionCard: {
    background: '#fff',
    padding: '20px 15px',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    cursor: 'pointer',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  actionIcon: {
    fontSize: '32px'
  },
  actionLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333'
  },
  actionDesc: {
    fontSize: '11px',
    color: '#888'
  },
  typesSection: {
    padding: '0 20px',
    marginBottom: '30px'
  },
  typesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  typeCard: {
    background: '#fff',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    textAlign: 'center'
  },
  typeIcon: {
    fontSize: '36px',
    display: 'block',
    marginBottom: '8px'
  },
  typeName: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 4px 0'
  },
  typeDesc: {
    fontSize: '11px',
    color: '#888',
    margin: '0 0 8px 0'
  },
  typePrice: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#e53935'
  },
  searchSection: {
    padding: '0 20px',
    marginBottom: '30px'
  },
  searchForm: {
    display: 'flex',
    gap: '10px'
  },
  searchInput: {
    flex: 1,
    padding: '14px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none'
  },
  searchBtn: {
    padding: '14px 20px',
    background: '#e53935',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  fareSection: {
    padding: '0 20px',
    marginBottom: '30px',
    textAlign: 'center'
  },
  fareText: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '12px'
  },
  fareBtn: {
    padding: '14px 40px',
    background: '#2196f3',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  infoSection: {
    padding: '0 20px',
    marginBottom: '30px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '10px'
  },
  infoCard: {
    background: '#fff',
    padding: '16px',
    borderRadius: '12px',
    textAlign: 'center'
  },
  infoIcon: {
    fontSize: '28px',
    display: 'block',
    marginBottom: '8px'
  },
  infoTitle: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 5px 0'
  },
  infoText: {
    fontSize: '11px',
    color: '#888',
    margin: 0,
    lineHeight: '1.4'
  },
  providerSection: {
    padding: '0 20px',
    marginBottom: '30px'
  },
  providerGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  providerCard: {
    background: '#fff',
    padding: '20px 15px',
    borderRadius: '12px',
    border: '2px dashed #e0e0e0',
    cursor: 'pointer',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  footer: {
    padding: '20px',
    textAlign: 'center'
  },
  footerText: {
    fontSize: '12px',
    color: '#999',
    margin: '5px 0',
    lineHeight: '1.5'
  }
};

export default Ambulance;