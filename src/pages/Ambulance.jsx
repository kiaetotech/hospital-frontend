import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNearbyAmbulances, getHospitals } from '../services/api';

const Ambulance = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [nearbyAmbulances, setNearbyAmbulances] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('name');
  const [selectedType, setSelectedType] = useState('basic');
  const [showNearbyHospitals, setShowNearbyHospitals] = useState(false);

  useEffect(() => {
    checkUserLogin();
    getUserLocation();
  }, []);

  const checkUserLogin = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try { setUser(JSON.parse(userData)); } catch(e) {}
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          loadNearbyAmbulances(pos.coords.latitude, pos.coords.longitude);
        },
        () => setNearbyAmbulances([])
      );
    }
  };

  const loadNearbyAmbulances = async (lat, lng) => {
    try {
      const res = await getNearbyAmbulances({ lat, lng, radius: 10 });
      if (res.data?.data) setNearbyAmbulances(res.data.data);
    } catch(err) {
      setNearbyAmbulances([]);
    }
  };

  const executeSearch = () => {
    if (['nearby', 'rated'].includes(searchFilter)) {
      const params = new URLSearchParams();
      if (searchFilter === 'nearby') params.append('emergency', 'true');
      if (searchFilter === 'rated') { params.append('min_rating', '4'); params.append('sort', 'rating'); }
      navigate(`/hospitals?${params.toString()}`);
      return;
    }
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams();
    const paramMap = { name: 'q', city: 'city', specialty: 'specialty' };
    params.append(paramMap[searchFilter] || 'q', searchQuery);
    navigate(`/hospitals?${params.toString()}`);
  };

  const handleFilterClick = (filter) => {
    setSearchFilter(filter);
    setSearchQuery('');
    if (filter === 'nearby') navigate('/hospitals?emergency=true');
    else if (filter === 'rated') navigate('/hospitals?min_rating=4&sort=rating');
  };

  const startBooking = () => {
    if (!user) {
      navigate('/login?redirect=/ambulance');
      return;
    }
    navigate(`/ambulance/schedule?type=${selectedType}`);
  };

  const startEmergency = () => {
    navigate('/ambulance/emergency');
  };

  const ambulanceTypes = [
    { icon: '🚑', name: 'Basic Life Support', desc: 'Oxygen, first aid, stretcher', value: 'basic' },
    { icon: '❤️', name: 'Cardiac', desc: 'Defibrillator, ECG monitor', value: 'cardiac' },
    { icon: '🫁', name: 'Ventilator', desc: 'ICU setup, ventilator', value: 'ventilator' },
    { icon: '👶', name: 'Neonatal', desc: 'Newborn & infant care', value: 'neonatal' },
    { icon: '♿', name: 'Wheelchair', desc: 'Non-emergency transport', value: 'wheelchair' },
  ];

  const filterOptions = [
    { value: 'name', label: 'Name' },
    { value: 'nearby', label: 'Nearby' },
    { value: 'rated', label: 'Top Rated' },
    { value: 'specialty', label: 'Specialty' },
    { value: 'city', label: 'City' },
  ];

  const placeholderText = {
    name: 'Search hospital name...',
    nearby: 'Showing nearby hospitals...',
    rated: 'Showing top rated hospitals...',
    specialty: 'Search by specialty (e.g., Cardiology)...',
    city: 'Search by city (e.g., Mumbai)...',
  };

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>←</button>
        <h1 style={styles.headerTitle}>Ambulance</h1>
        {user ? (
          <span style={styles.userBadge}>{user.name?.charAt(0)?.toUpperCase()}</span>
        ) : (
          <button onClick={() => navigate('/login?redirect=/ambulance')} style={styles.loginBtn}>Login</button>
        )}
      </div>

      {/* EMERGENCY SECTION */}
      <div style={styles.emergencySection}>
        <button onClick={startEmergency} style={styles.emergencyBtn}>
          <span style={styles.emergencyIcon}>🚨</span>
          <span style={styles.emergencyLabel}>EMERGENCY</span>
          <span style={styles.emergencyHint}>Tap for immediate ambulance</span>
        </button>
        <p style={styles.emergencyNote}>Or dial <strong>108</strong></p>
      </div>

      {/* SEARCH SECTION */}
      <div style={styles.searchSection}>
        <div style={styles.searchRow}>
          <input
            type="text"
            placeholder={placeholderText[searchFilter]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
            disabled={['nearby', 'rated'].includes(searchFilter)}
            style={styles.searchInput}
          />
          <button onClick={executeSearch} style={styles.searchBtn}>Search</button>
        </div>
        <div style={styles.filterRow}>
          {filterOptions.map(f => (
            <button
              key={f.value}
              onClick={() => handleFilterClick(f.value)}
              style={{
                ...styles.filterBtn,
                backgroundColor: searchFilter === f.value ? '#e53935' : '#fff',
                color: searchFilter === f.value ? '#fff' : '#555',
                borderColor: searchFilter === f.value ? '#e53935' : '#ddd'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* NEARBY AMBULANCES */}
      {nearbyAmbulances.length > 0 && (
        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>{nearbyAmbulances.length} ambulances available nearby</h3>
          <div style={styles.horizontalScroll}>
            {nearbyAmbulances.slice(0, 5).map((amb, i) => (
              <div key={i} style={styles.ambulanceCard}>
                <span style={styles.ambulanceIcon}>🚑</span>
                <span style={styles.ambulanceType}>{amb.vehicleType?.toUpperCase() || 'BASIC'}</span>
                <span style={styles.ambulanceMeta}>{amb.distance}km • ~{amb.estimatedETA}min</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SELECT TYPE */}
      <div style={styles.sectionCard}>
        <h3 style={styles.sectionTitle}>Select ambulance type</h3>
        <div style={styles.horizontalScroll}>
          {ambulanceTypes.map((t, i) => (
            <button
              key={i}
              onClick={() => setSelectedType(t.value)}
              style={{
                ...styles.typeCard,
                borderColor: selectedType === t.value ? '#e53935' : '#e8e8e8',
                backgroundColor: selectedType === t.value ? '#fff5f5' : '#fff'
              }}
            >
              <span style={styles.typeIcon}>{t.icon}</span>
              <span style={styles.typeName}>{t.name}</span>
              <span style={styles.typeDesc}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* BOOK BUTTON */}
      <button onClick={startBooking} style={styles.bookBtn}>
        Book {ambulanceTypes.find(t => t.value === selectedType)?.name}
      </button>

      {/* MENU LINKS */}
      <div style={styles.menuSection}>
        <button onClick={() => navigate('/ambulance/emergency-contacts')} style={styles.menuItem}>
          <span>🛡️</span><span>Emergency Contacts</span><span style={styles.arrow}>›</span>
        </button>
        <button onClick={() => navigate('/my-bookings')} style={styles.menuItem}>
          <span>📋</span><span>My Bookings</span><span style={styles.arrow}>›</span>
        </button>
        <button onClick={() => navigate('/ambulance/schedule')} style={styles.menuItem}>
          <span>📅</span><span>Schedule Transport</span><span style={styles.arrow}>›</span>
        </button>
      </div>

      {/* FOR DRIVERS */}
      <div style={styles.sectionCard}>
        <h3 style={styles.sectionTitle}>For Ambulance Drivers</h3>
        <button onClick={() => navigate('/ambulance/driver/app')} style={styles.menuItem}>
          <span>🌐</span><span>Driver Web App</span><span style={styles.arrow}>›</span>
        </button>
        <a href="https://play.google.com/store/apps" target="_blank" rel="noopener noreferrer" style={styles.storeLink}>
          <span>📱</span><span>Download for Android</span><span style={styles.storeBadge}>Play Store</span>
        </a>
        <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" style={styles.storeLink}>
          <span>🍎</span><span>Download for iOS</span><span style={styles.storeBadge}>App Store</span>
        </a>
        <button onClick={() => navigate('/ambulance/register')} style={styles.menuItem}>
          <span>📝</span><span>Register Fleet</span><span style={styles.arrow}>›</span>
        </button>
        <button onClick={() => navigate('/ambulance/login')} style={styles.menuItem}>
          <span>🔐</span><span>Provider Login</span><span style={styles.arrow}>›</span>
        </button>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <p>⚠️ For life-threatening emergencies, always call <strong>108</strong> first.</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f2f4f7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    paddingBottom: '40px'
  },
  header: {
    backgroundColor: '#fff',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    borderBottom: '1px solid #e8e8e8'
  },
  backBtn: {
    fontSize: '20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    color: '#333'
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1a1a1a',
    margin: 0
  },
  userBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#e53935',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '14px'
  },
  loginBtn: {
    padding: '6px 14px',
    backgroundColor: '#e53935',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  emergencySection: {
    background: 'linear-gradient(180deg, #c62828, #8e0000)',
    padding: '30px 20px',
    textAlign: 'center'
  },
  emergencyBtn: {
    width: '100%',
    maxWidth: '300px',
    padding: '24px',
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
  },
  emergencyIcon: {
    fontSize: '48px',
    display: 'block'
  },
  emergencyLabel: {
    fontSize: '20px',
    fontWeight: 900,
    color: '#c62828',
    letterSpacing: '2px',
    display: 'block',
    marginTop: '4px'
  },
  emergencyHint: {
    fontSize: '11px',
    color: '#888',
    display: 'block',
    marginTop: '2px'
  },
  emergencyNote: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    marginTop: '12px'
  },
  searchSection: {
    margin: '12px 14px',
    backgroundColor: '#fff',
    borderRadius: '14px',
    padding: '14px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  searchRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '10px'
  },
  searchInput: {
    flex: 1,
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none'
  },
  searchBtn: {
    padding: '12px 18px',
    backgroundColor: '#e53935',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '14px',
    cursor: 'pointer'
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  filterBtn: {
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid #ddd',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  sectionCard: {
    margin: '0 14px 14px',
    backgroundColor: '#fff',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#333',
    margin: '0 0 12px 0'
  },
  horizontalScroll: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px'
  },
  ambulanceCard: {
    minWidth: '120px',
    padding: '14px 10px',
    backgroundColor: '#fafafa',
    borderRadius: '12px',
    textAlign: 'center',
    flexShrink: 0,
    border: '1px solid #eee'
  },
  ambulanceIcon: {
    fontSize: '28px',
    display: 'block'
  },
  ambulanceType: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#333',
    display: 'block',
    marginTop: '4px'
  },
  ambulanceMeta: {
    fontSize: '10px',
    color: '#888',
    display: 'block',
    marginTop: '2px'
  },
  typeCard: {
    minWidth: '95px',
    padding: '12px 8px',
    borderRadius: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    border: '2px solid #e8e8e8'
  },
  typeIcon: {
    fontSize: '26px',
    display: 'block'
  },
  typeName: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#333',
    display: 'block',
    marginTop: '4px'
  },
  typeDesc: {
    fontSize: '9px',
    color: '#888',
    display: 'block',
    marginTop: '2px'
  },
  bookBtn: {
    margin: '0 14px 14px',
    width: 'calc(100% - 28px)',
    padding: '15px',
    backgroundColor: '#e53935',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  menuSection: {
    margin: '0 14px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    backgroundColor: '#fff',
    borderRadius: '14px',
    overflow: 'hidden'
  },
  menuItem: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#fff',
    border: 'none',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#333',
    cursor: 'pointer',
    textAlign: 'left'
  },
  arrow: {
    marginLeft: 'auto',
    color: '#ccc',
    fontSize: '18px'
  },
  storeLink: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#333',
    textDecoration: 'none'
  },
  storeBadge: {
    marginLeft: 'auto',
    color: '#4caf50',
    fontSize: '11px',
    fontWeight: 600
  },
  footer: {
    textAlign: 'center',
    padding: '16px',
    color: '#999',
    fontSize: '12px',
    borderTop: '1px solid #eee',
    margin: '0 14px'
  }
};

export default Ambulance;