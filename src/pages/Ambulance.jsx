import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNearbyAmbulances } from '../services/api';

const Ambulance = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [nearbyAmbulances, setNearbyAmbulances] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('name');
  const [selectedType, setSelectedType] = useState('basic');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try { setUser(JSON.parse(userData)); } catch(e) {}
    }
    getLocation();
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          fetchNearbyAmbulances(pos.coords.latitude, pos.coords.longitude);
        },
        () => {}
      );
    }
  };

  const fetchNearbyAmbulances = async (lat, lng) => {
    try {
      const res = await getNearbyAmbulances({ lat, lng, radius: 10 });
      if (res.data?.data) setNearbyAmbulances(res.data.data);
    } catch(err) {}
  };

  const handleSearch = () => {
    if (searchFilter === 'nearby' || searchFilter === 'rated') {
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

  const handleBookNow = () => {
    if (!user) {
      navigate('/login?redirect=/ambulance');
      return;
    }
    navigate(`/ambulance/schedule?type=${selectedType}`);
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f2f4f7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: '40px'
    }}>
      
      {/* ===== HEADER ===== */}
      <div style={{
        backgroundColor: '#fff',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        borderBottom: '1px solid #e8e8e8'
      }}>
        <button onClick={() => navigate('/')} style={{
          fontSize: '20px', background: 'none', border: 'none',
          cursor: 'pointer', padding: '4px 8px', color: '#333'
        }}>←</button>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Ambulance</h1>
        {user ? (
          <span style={{
            width: '32px', height: '32px', borderRadius: '50%',
            backgroundColor: '#e53935', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '14px'
          }}>{user.name?.charAt(0)?.toUpperCase()}</span>
        ) : (
          <button onClick={() => navigate('/login?redirect=/ambulance')} style={{
            padding: '6px 14px', backgroundColor: '#e53935', color: '#fff',
            border: 'none', borderRadius: '6px', fontSize: '12px',
            fontWeight: 600, cursor: 'pointer'
          }}>Login</button>
        )}
      </div>

      {/* ===== EMERGENCY SECTION ===== */}
      <div style={{
        background: 'linear-gradient(180deg, #c62828, #8e0000)',
        padding: '30px 20px', textAlign: 'center'
      }}>
        <button onClick={() => navigate('/ambulance/emergency')} style={{
          width: '100%', maxWidth: '300px', padding: '24px',
          backgroundColor: '#fff', border: 'none', borderRadius: '16px',
          cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
        }}>
          <span style={{ fontSize: '48px', display: 'block' }}>🚨</span>
          <span style={{
            fontSize: '20px', fontWeight: 900, color: '#c62828',
            letterSpacing: '2px', display: 'block', marginTop: '4px'
          }}>EMERGENCY</span>
          <span style={{ fontSize: '11px', color: '#888', display: 'block', marginTop: '2px' }}>
            Tap for immediate ambulance
          </span>
        </button>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '12px' }}>
          Or dial <strong style={{ color: '#fff', fontSize: '16px' }}>108</strong>
        </p>
      </div>

      {/* ===== SEARCH SECTION ===== */}
      <div style={{
        margin: '12px 14px', backgroundColor: '#fff',
        borderRadius: '14px', padding: '14px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder={placeholderText[searchFilter]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={['nearby', 'rated'].includes(searchFilter)}
            style={{
              flex: 1, padding: '12px', border: '2px solid #e0e0e0',
              borderRadius: '10px', fontSize: '14px', outline: 'none',
              backgroundColor: ['nearby', 'rated'].includes(searchFilter) ? '#f5f5f5' : '#fff'
            }}
          />
          <button onClick={handleSearch} style={{
            padding: '12px 18px', backgroundColor: '#e53935', color: '#fff',
            border: 'none', borderRadius: '10px', fontWeight: 700,
            fontSize: '14px', cursor: 'pointer'
          }}>Search</button>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {filterOptions.map(f => (
            <button
              key={f.value}
              onClick={() => handleFilterClick(f.value)}
              style={{
                padding: '6px 14px', borderRadius: '20px',
                border: `1px solid ${searchFilter === f.value ? '#e53935' : '#ddd'}`,
                backgroundColor: searchFilter === f.value ? '#fff5f5' : '#fff',
                color: searchFilter === f.value ? '#e53935' : '#555',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer'
              }}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* ===== NEARBY AMBULANCES ===== */}
      {nearbyAmbulances.length > 0 && (
        <div style={{
          margin: '0 14px 14px', backgroundColor: '#fff',
          borderRadius: '14px', padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#333', margin: '0 0 12px 0' }}>
            {nearbyAmbulances.length} ambulances available nearby
          </h3>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {nearbyAmbulances.slice(0, 5).map((amb, i) => (
              <div key={i} style={{
                minWidth: '120px', padding: '14px 10px',
                backgroundColor: '#fafafa', borderRadius: '12px',
                textAlign: 'center', flexShrink: 0, border: '1px solid #eee'
              }}>
                <span style={{ fontSize: '28px', display: 'block' }}>🚑</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#333', display: 'block', marginTop: '4px' }}>
                  {amb.vehicleType?.toUpperCase() || 'BASIC'}
                </span>
                <span style={{ fontSize: '10px', color: '#888', display: 'block', marginTop: '2px' }}>
                  {amb.distance}km • ~{amb.estimatedETA}min
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== SELECT TYPE ===== */}
      <div style={{
        margin: '0 14px 14px', backgroundColor: '#fff',
        borderRadius: '14px', padding: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#333', margin: '0 0 12px 0' }}>
          Select ambulance type
        </h3>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {ambulanceTypes.map((t, i) => (
            <button
              key={i}
              onClick={() => setSelectedType(t.value)}
              style={{
                minWidth: '95px', padding: '12px 8px', borderRadius: '12px',
                textAlign: 'center', cursor: 'pointer', flexShrink: 0,
                border: `2px solid ${selectedType === t.value ? '#e53935' : '#e8e8e8'}`,
                backgroundColor: selectedType === t.value ? '#fff5f5' : '#fff'
              }}
            >
              <span style={{ fontSize: '26px', display: 'block' }}>{t.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#333', display: 'block', marginTop: '4px' }}>{t.name}</span>
              <span style={{ fontSize: '9px', color: '#888', display: 'block', marginTop: '2px' }}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== BOOK BUTTON ===== */}
      <div style={{ margin: '0 14px 14px' }}>
        <button onClick={handleBookNow} style={{
          width: '100%', padding: '15px', backgroundColor: '#e53935',
          color: '#fff', border: 'none', borderRadius: '12px',
          fontSize: '15px', fontWeight: 700, cursor: 'pointer'
        }}>
          Book {ambulanceTypes.find(t => t.value === selectedType)?.name}
        </button>
      </div>

      {/* ===== MENU LINKS ===== */}
      <div style={{
        margin: '0 14px 14px', backgroundColor: '#fff',
        borderRadius: '14px', overflow: 'hidden'
      }}>
        <button onClick={() => navigate('/ambulance/emergency-contacts')} style={menuItemStyle}>
          <span>🛡️</span><span style={{ flex: 1, textAlign: 'left' }}>Emergency Contacts</span><span style={{ color: '#ccc' }}>›</span>
        </button>
        <button onClick={() => navigate('/my-bookings')} style={menuItemStyle}>
          <span>📋</span><span style={{ flex: 1, textAlign: 'left' }}>My Bookings</span><span style={{ color: '#ccc' }}>›</span>
        </button>
        <button onClick={() => navigate('/ambulance/schedule')} style={{ ...menuItemStyle, borderBottom: 'none' }}>
          <span>📅</span><span style={{ flex: 1, textAlign: 'left' }}>Schedule Transport</span><span style={{ color: '#ccc' }}>›</span>
        </button>
      </div>

      {/* ===== FOR DRIVERS ===== */}
      <div style={{
        margin: '0 14px 14px', backgroundColor: '#fff',
        borderRadius: '14px', padding: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#333', margin: '0 0 12px 0' }}>
          For Ambulance Drivers
        </h3>
        <button onClick={() => navigate('/ambulance/driver/app')} style={menuItemStyle}>
          <span>🌐</span><span style={{ flex: 1, textAlign: 'left' }}>Driver Web App</span><span style={{ color: '#ccc' }}>›</span>
        </button>
        <a href="https://play.google.com/store/apps" target="_blank" rel="noopener noreferrer" style={{ ...menuItemStyle, textDecoration: 'none', display: 'flex' }}>
          <span>📱</span><span style={{ flex: 1, textAlign: 'left' }}>Download Android App</span><span style={{ color: '#4caf50', fontSize: '11px', fontWeight: 600 }}>Play Store</span>
        </a>
        <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" style={{ ...menuItemStyle, textDecoration: 'none', display: 'flex' }}>
          <span>🍎</span><span style={{ flex: 1, textAlign: 'left' }}>Download iOS App</span><span style={{ color: '#4caf50', fontSize: '11px', fontWeight: 600 }}>App Store</span>
        </a>
        <button onClick={() => navigate('/ambulance/register')} style={menuItemStyle}>
          <span>📝</span><span style={{ flex: 1, textAlign: 'left' }}>Register Fleet</span><span style={{ color: '#ccc' }}>›</span>
        </button>
        <button onClick={() => navigate('/ambulance/login')} style={{ ...menuItemStyle, borderBottom: 'none' }}>
          <span>🔐</span><span style={{ flex: 1, textAlign: 'left' }}>Provider Login</span><span style={{ color: '#ccc' }}>›</span>
        </button>
      </div>

      {/* ===== FOOTER ===== */}
      <div style={{
        textAlign: 'center', padding: '16px', color: '#999',
        fontSize: '12px', borderTop: '1px solid #eee', margin: '0 14px'
      }}>
        <p style={{ margin: 0 }}>⚠️ For life-threatening emergencies, always call <strong style={{ color: '#e53935' }}>108</strong> first.</p>
      </div>
    </div>
  );
};

const menuItemStyle = {
  width: '100%', padding: '14px 16px', backgroundColor: '#fff',
  border: 'none', borderBottom: '1px solid #f0f0f0',
  display: 'flex', alignItems: 'center', gap: '12px',
  fontSize: '14px', color: '#333', cursor: 'pointer', textAlign: 'left'
};

export default Ambulance;
