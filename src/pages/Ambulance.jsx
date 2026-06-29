import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNearbyAmbulances, getAmbulanceFareEstimate } from '../services/api';

const Ambulance = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [nearbyAmbulances, setNearbyAmbulances] = useState([]);
  const [bookingStep, setBookingStep] = useState('hub');
  const [selectedType, setSelectedType] = useState('basic');
  const [form, setForm] = useState({ patientName: '', patientPhone: '', patientAge: '', pickupAddress: '', destination: '', scheduledDate: '', scheduledTime: '10:00', requiresOxygen: false });
  const [fareEstimate, setFareEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
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
        () => setError('Location access needed for nearby ambulances')
      );
    }
  };

  const fetchNearbyAmbulances = async (lat, lng) => {
    try {
      const res = await getNearbyAmbulances({ lat, lng, radius: 10 });
      if (res.data?.data) setNearbyAmbulances(res.data.data);
    } catch(err) {}
  };

  const fetchFare = async () => {
    try {
      const res = await getAmbulanceFareEstimate({ distance: 10, ambulanceType: selectedType, isEmergency: 'false' });
      if (res.data?.data) setFareEstimate(res.data.data);
    } catch(err) {}
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/login?redirect=/ambulance');
      return;
    }
    setBookingStep('book');
    fetchFare();
  };

  const handleSubmitBooking = async () => {
    if (!form.patientName || !form.patientPhone || !form.pickupAddress || !form.scheduledDate) {
      setError('Please fill all required fields');
      return;
    }
    navigate('/payment', { 
      state: { 
        bookingType: 'ambulance',
        amount: fareEstimate?.total || 500,
        bookingData: { ...form, ambulanceType: selectedType, emergencyType: 'scheduled' }
      } 
    });
  };

  const isLoggedIn = !!user;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
      
      {/* ===== HEADER ===== */}
      <div style={{ background: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <h1 style={{ margin: 0, fontSize: '20px', color: '#e53935' }}>🚑 Ambulance</h1>
        {isLoggedIn ? (
          <span style={{ fontSize: '14px', color: '#333' }}>👤 {user?.name || 'User'}</span>
        ) : (
          <button onClick={() => navigate('/login?redirect=/ambulance')} style={{ padding: '8px 16px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Login</button>
        )}
      </div>

      {/* ===== HUB VIEW ===== */}
      {bookingStep === 'hub' && (
        <>
          {/* EMERGENCY BUTTON */}
          <div style={{ background: 'linear-gradient(180deg, #d32f2f, #b71c1c)', padding: '30px 20px', textAlign: 'center' }}>
            <button onClick={() => navigate('/ambulance/emergency')} style={{ width: '100%', maxWidth: '350px', padding: '30px', background: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
              <span style={{ display: 'block', fontSize: '50px' }}>🚨</span>
              <span style={{ display: 'block', fontSize: '24px', fontWeight: 900, color: '#e53935', letterSpacing: '2px', marginTop: '8px' }}>EMERGENCY</span>
              <span style={{ display: 'block', fontSize: '12px', color: '#888', marginTop: '4px' }}>Tap for immediate ambulance dispatch</span>
            </button>
            <p style={{ color: '#fff', fontSize: '14px', marginTop: '14px' }}>Or dial <strong style={{ fontSize: '20px' }}>108</strong></p>
          </div>

          {/* NEARBY AMBULANCES */}
          <div style={{ margin: '16px' }}>
            <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>📍 {nearbyAmbulances.length} Ambulances Nearby</h3>
            {nearbyAmbulances.slice(0, 3).map((amb, i) => (
              <div key={i} style={{ background: '#fff', padding: '14px', borderRadius: '10px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee' }}>
                <div>
                  <strong>{amb.vehicleType?.toUpperCase() || 'Basic'} Ambulance</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>{amb.distance}km away • ETA {amb.estimatedETA} min</p>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#4caf50' }}>⭐ {amb.rating || '4.5'}</span>
              </div>
            ))}
          </div>

          {/* AMBULANCE TYPES */}
          <div style={{ margin: '16px' }}>
            <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>Select Ambulance Type</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[{ icon: '🚑', name: 'Basic', price: 500, value: 'basic' }, { icon: '❤️', name: 'Cardiac', price: 750, value: 'cardiac' }, { icon: '🫁', name: 'Ventilator', price: 900, value: 'ventilator' }, { icon: '👶', name: 'Neonatal', price: 1000, value: 'neonatal' }].map((t, i) => (
                <div key={i} onClick={() => { setSelectedType(t.value); fetchFare(); }} style={{ padding: '14px', border: selectedType === t.value ? '2px solid #e53935' : '1px solid #eee', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', background: selectedType === t.value ? '#fff5f5' : '#fff' }}>
                  <span style={{ fontSize: '30px', display: 'block' }}>{t.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginTop: '4px' }}>{t.name}</span>
                  <span style={{ fontSize: '12px', color: '#e53935', fontWeight: 700, display: 'block', marginTop: '2px' }}>₹{t.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BOOK NOW BUTTON */}
          <div style={{ margin: '16px', display: 'flex', gap: '10px' }}>
            <button onClick={handleBookNow} style={{ flex: 1, padding: '16px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>📅 Book {selectedType.toUpperCase()} Ambulance</button>
            <button onClick={() => navigate('/ambulance/emergency-contacts')} style={{ padding: '16px', background: '#fff', border: '2px solid #e53935', borderRadius: '10px', color: '#e53935', fontWeight: 700, cursor: 'pointer' }}>🛡️</button>
          </div>

          {/* QUICK LINKS */}
          <div style={{ margin: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button onClick={() => navigate('/my-bookings')} style={{ padding: '14px', background: '#fff', border: '1px solid #eee', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}>📋 My Bookings</button>
            <button onClick={() => navigate('/ambulance/schedule')} style={{ padding: '14px', background: '#fff', border: '1px solid #eee', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}>📅 Schedule</button>
            <button onClick={() => navigate('/ambulance/driver/app')} style={{ padding: '14px', background: '#fff', border: '1px solid #eee', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}>👨‍⚕️ Driver App</button>
            <button onClick={() => navigate('/hospitals')} style={{ padding: '14px', background: '#fff', border: '1px solid #eee', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}>🏥 Hospitals</button>
          </div>
        </>
      )}

      {/* ===== BOOKING FORM ===== */}
      {bookingStep === 'book' && (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
          <button onClick={() => setBookingStep('hub')} style={{ background: 'none', border: 'none', color: '#e53935', fontSize: '14px', cursor: 'pointer', marginBottom: '15px' }}>← Back</button>
          
          <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Book {selectedType.toUpperCase()} Ambulance</h2>

          {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

          <input placeholder="Patient Name *" value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} style={inputStyle} />
          <input placeholder="Phone Number *" type="tel" value={form.patientPhone} onChange={e => setForm({...form, patientPhone: e.target.value})} style={inputStyle} />
          <input placeholder="Age" type="number" value={form.patientAge} onChange={e => setForm({...form, patientAge: e.target.value})} style={inputStyle} />
          <input placeholder="Pickup Address *" value={form.pickupAddress} onChange={e => setForm({...form, pickupAddress: e.target.value})} style={inputStyle} />
          <input placeholder="Destination Hospital" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} style={inputStyle} />
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <input type="date" value={form.scheduledDate} onChange={e => setForm({...form, scheduledDate: e.target.value})} style={{...inputStyle, flex: 1}} min={new Date().toISOString().split('T')[0]} />
            <input type="time" value={form.scheduledTime} onChange={e => setForm({...form, scheduledTime: e.target.value})} style={{...inputStyle, width: '120px'}} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', fontSize: '14px', color: '#555' }}>
            <input type="checkbox" checked={form.requiresOxygen} onChange={e => setForm({...form, requiresOxygen: e.target.checked})} />
            Requires Oxygen Support
          </label>

          {fareEstimate && (
            <div style={{ background: '#e8f5e9', padding: '14px', borderRadius: '10px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px' }}>
                <span>Estimated Total</span>
                <span style={{ color: '#2e7d32' }}>₹{fareEstimate.total || fareEstimate.fareBreakdown?.total || '500'}</span>
              </div>
              <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0' }}>Includes GST & platform fee</p>
            </div>
          )}

          <button onClick={handleSubmitBooking} style={{ width: '100%', padding: '16px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
            💳 Proceed to Payment - ₹{fareEstimate?.total || 500}
          </button>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  marginBottom: '12px',
  boxSizing: 'border-box',
  outline: 'none'
};

export default Ambulance;