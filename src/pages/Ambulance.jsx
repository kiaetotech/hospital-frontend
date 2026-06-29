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
  const [bookingStep, setBookingStep] = useState('hub');
  const [selectedType, setSelectedType] = useState('basic');
  const [form, setForm] = useState({
    patientName: '', patientPhone: '', patientAge: '',
    pickupAddress: '', destination: '',
    scheduledDate: '', scheduledTime: '10:00',
    requiresOxygen: false, requiresAttendant: false
  });
  const [fareEstimate, setFareEstimate] = useState(null);
  const [error, setError] = useState('');

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
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams();
    if (searchFilter === 'name') params.append('q', searchQuery);
    else if (searchFilter === 'city') params.append('city', searchQuery);
    else if (searchFilter === 'specialty') params.append('specialty', searchQuery);
    else if (searchFilter === 'nearby') params.append('emergency', 'true');
    else if (searchFilter === 'rated') params.append('min_rating', '4');
    navigate(`/hospitals?${params.toString()}`);
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/login?redirect=/ambulance');
      return;
    }
    navigate(`/ambulance/schedule?type=${selectedType}`);
  };

  const isLoggedIn = !!user;

  const ambulanceTypes = [
    { icon: '🚑', name: 'Basic Life Support', desc: 'Oxygen, first aid, stretcher', value: 'basic' },
    { icon: '❤️', name: 'Cardiac', desc: 'Defibrillator, ECG monitor', value: 'cardiac' },
    { icon: '🫁', name: 'Ventilator', desc: 'ICU setup, ventilator', value: 'ventilator' },
    { icon: '👶', name: 'Neonatal', desc: 'Newborn & infant care', value: 'neonatal' },
    { icon: '♿', name: 'Wheelchair', desc: 'Non-emergency transport', value: 'wheelchair' },
  ];

  const searchFilters = [
    { value: 'name', label: '🏥 Name' },
    { value: 'nearby', label: '📍 Nearby' },
    { value: 'rated', label: '⭐ Top Rated' },
    { value: 'specialty', label: '🔬 Specialty' },
    { value: 'city', label: '🏙️ City' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* ===== TOP BAR ===== */}
      <div style={{ background: '#fff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8e8e8' }}>
        <h1 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#1a1a1a' }}>🚑 Ambulance</h1>
        {isLoggedIn ? (
          <span style={{ fontSize: '13px', color: '#555', fontWeight: 600 }}>👤 {user?.name?.split(' ')[0]}</span>
        ) : (
          <button onClick={() => navigate('/login?redirect=/ambulance')} style={loginBtnStyle}>Patient Login</button>
        )}
      </div>

      {/* ===== EMERGENCY HERO ===== */}
      <div style={{ background: 'linear-gradient(180deg, #c62828 0%, #8e0000 100%)', padding: '28px 20px', textAlign: 'center' }}>
        <button onClick={() => navigate('/ambulance/emergency')} style={emergencyBtnStyle}>
          <span style={{ display: 'block', fontSize: '48px' }}>🚨</span>
          <span style={{ display: 'block', fontSize: '22px', fontWeight: 900, color: '#c62828', letterSpacing: '2px', marginTop: '6px' }}>EMERGENCY</span>
          <span style={{ display: 'block', fontSize: '11px', color: '#888', marginTop: '3px' }}>Press for immediate ambulance dispatch</span>
        </button>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '12px' }}>
          For life-threatening emergencies, call <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>108</span>
        </p>
      </div>

      {/* ===== SEARCH BAR ===== */}
      <div style={{ margin: '16px', background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder={searchFilter === 'nearby' ? 'Showing nearby hospitals...' : searchFilter === 'rated' ? 'Showing top rated hospitals...' : 'Search hospitals...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={searchFilter === 'nearby' || searchFilter === 'rated'}
            style={{
              flex: 1, padding: '13px 16px', border: '2px solid #e0e0e0', borderRadius: '10px',
              fontSize: '14px', outline: 'none', background: searchFilter === 'nearby' || searchFilter === 'rated' ? '#f5f5f5' : '#fff'
            }}
          />
          <button onClick={handleSearch} style={{
            padding: '13px 20px', background: '#e53935', color: '#fff', border: 'none',
            borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer'
          }}>🔍</button>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {searchFilters.map(f => (
            <button
              key={f.value}
              onClick={() => {
                setSearchFilter(f.value);
                if (f.value === 'nearby' || f.value === 'rated') {
                  const params = new URLSearchParams();
                  if (f.value === 'nearby') params.append('emergency', 'true');
                  if (f.value === 'rated') params.append('min_rating', '4');
                  navigate(`/hospitals?${params.toString()}`);
                }
              }}
              style={{
                padding: '7px 14px', borderRadius: '20px', border: searchFilter === f.value ? '2px solid #e53935' : '1px solid #ddd',
                background: searchFilter === f.value ? '#fff5f5' : '#fff', color: searchFilter === f.value ? '#e53935' : '#555',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== NEARBY AMBULANCES ===== */}
      <div style={{ margin: '0 16px 16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#333', marginBottom: '10px' }}>
          📍 {nearbyAmbulances.length > 0 ? `${nearbyAmbulances.length} Ambulances Available Nearby` : 'Searching nearby ambulances...'}
        </h3>
        {nearbyAmbulances.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            {nearbyAmbulances.slice(0, 5).map((amb, i) => (
              <div key={i} style={{
                minWidth: '140px', background: '#fff', padding: '12px', borderRadius: '12px',
                border: '1px solid #e8e8e8', textAlign: 'center', flexShrink: 0
              }}>
                <span style={{ fontSize: '28px', display: 'block' }}>🚑</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#333', display: 'block', marginTop: '4px' }}>{amb.vehicleType?.toUpperCase() || 'BASIC'}</span>
                <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>{amb.distance}km • {amb.estimatedETA} min</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== SELECT AMBULANCE TYPE ===== */}
      <div style={{ margin: '0 16px 16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#333', marginBottom: '10px' }}>Select Ambulance Type</h3>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {ambulanceTypes.map((t, i) => (
            <button
              key={i}
              onClick={() => setSelectedType(t.value)}
              style={{
                minWidth: '110px', padding: '14px 12px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                border: selectedType === t.value ? '2px solid #e53935' : '1px solid #e0e0e0',
                background: selectedType === t.value ? '#fff5f5' : '#fff', flexShrink: 0
              }}
            >
              <span style={{ fontSize: '30px', display: 'block' }}>{t.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#333', display: 'block', marginTop: '4px' }}>{t.name}</span>
              <span style={{ fontSize: '10px', color: '#888', display: 'block', marginTop: '2px' }}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== ACTION BUTTONS ===== */}
      <div style={{ margin: '0 16px 16px' }}>
        <button onClick={handleBookNow} style={actionBtnStyle}>
          📅 Book {ambulanceTypes.find(t => t.value === selectedType)?.name} Ambulance
        </button>
      </div>

      {/* ===== QUICK LINKS ===== */}
      <div style={{ margin: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button onClick={() => navigate('/ambulance/emergency-contacts')} style={linkBtnStyle}>
          <span style={{ fontSize: '18px' }}>🛡️</span>
          <span style={{ flex: 1, textAlign: 'left' }}>Emergency Contacts</span>
          <span style={{ color: '#ccc' }}>›</span>
        </button>
        <button onClick={() => navigate('/my-bookings')} style={linkBtnStyle}>
          <span style={{ fontSize: '18px' }}>📋</span>
          <span style={{ flex: 1, textAlign: 'left' }}>My Bookings</span>
          <span style={{ color: '#ccc' }}>›</span>
        </button>
        <button onClick={() => navigate('/ambulance/schedule')} style={linkBtnStyle}>
          <span style={{ fontSize: '18px' }}>📅</span>
          <span style={{ flex: 1, textAlign: 'left' }}>Schedule Transport</span>
          <span style={{ color: '#ccc' }}>›</span>
        </button>
        <button onClick={() => navigate('/ambulance/driver/app')} style={linkBtnStyle}>
          <span style={{ fontSize: '18px' }}>👨‍⚕️</span>
          <span style={{ flex: 1, textAlign: 'left' }}>Driver App</span>
          <span style={{ color: '#ccc' }}>›</span>
        </button>
        <button onClick={() => navigate('/ambulance/login')} style={linkBtnStyle}>
          <span style={{ fontSize: '18px' }}>🔐</span>
          <span style={{ flex: 1, textAlign: 'left' }}>Provider Login</span>
          <span style={{ color: '#ccc' }}>›</span>
        </button>
      </div>

      {/* ===== FOOTER ===== */}
      <div style={{ textAlign: 'center', padding: '20px', color: '#aaa', fontSize: '11px', borderTop: '1px solid #eee', margin: '0 16px' }}>
        <p>⚠️ For life-threatening emergencies, always call <strong style={{ color: '#e53935' }}>108</strong> first.</p>
      </div>
    </div>
  );
};

const loginBtnStyle = {
  padding: '8px 18px', background: '#e53935', color: '#fff', border: 'none',
  borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700
};

const emergencyBtnStyle = {
  width: '100%', maxWidth: '320px', padding: '24px 20px', background: '#fff',
  border: 'none', borderRadius: '18px', cursor: 'pointer',
  boxShadow: '0 6px 24px rgba(0,0,0,0.25)'
};

const actionBtnStyle = {
  width: '100%', padding: '16px', background: '#e53935', color: '#fff',
  border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer'
};

const linkBtnStyle = {
  width: '100%', padding: '14px 16px', background: '#fff', border: '1px solid #eee',
  borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px',
  fontSize: '14px', fontWeight: 600, color: '#333', cursor: 'pointer'
};

const inputStyle = {
  width: '100%', padding: '13px', border: '1px solid #ddd', borderRadius: '8px',
  fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box', outline: 'none'
};

export default Ambulance;