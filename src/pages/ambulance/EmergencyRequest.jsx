import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { emergencyDispatch, getSurgeCheck } from '../../services/api';

const EmergencyRequest = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [location, setLocation] = useState(null);
  const [triage, setTriage] = useState({
    isBreathing: true,
    isConscious: true,
    isBleeding: false,
    chiefComplaint: '',
    ageGroup: 'adult'
  });
  const [surge, setSurge] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          checkSurge(pos.coords.latitude, pos.coords.longitude);
        },
        () => setError('Unable to get location. Please enable GPS.')
      );
    } else {
      setError('Geolocation not supported on this device.');
    }
  };

  const checkSurge = async (lat, lng) => {
    try {
      const res = await getSurgeCheck({ lat, lng });
      if (res.data?.data) setSurge(res.data.data);
    } catch (err) {}
  };

  const handleHoldStart = () => {
    setHolding(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setHolding(false);
        setStep(1);
      }
    }, 150);
  };

  const handleHoldEnd = () => {
    setHolding(false);
    setHoldProgress(0);
  };

  const handleTriageChange = (field, value) => {
    setTriage(prev => ({ ...prev, [field]: value }));
  };

  const handleDispatch = async () => {
    if (!location) {
      setError('Location required for emergency dispatch');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await emergencyDispatch({
        patientName: 'Emergency Patient',
        patientPhone: localStorage.getItem('phone') || '',
        pickupLat: location.lat,
        pickupLng: location.lng,
        pickupAddress: 'Current GPS Location',
        patientCondition: triage,
        emergencyType: 'blitz'
      });

      if (res.data?.success) {
        setResult(res.data.data);
        setStep(2);
      } else {
        setError(res.data?.message || 'No ambulance available. Call 108.');
      }
    } catch (err) {
      setError('Dispatch failed. Please call 108 directly.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep0 = () => (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🚨 Emergency</h1>
        <p style={styles.subtitle}>Press and hold for 3 seconds to activate</p>
      </div>

      <div style={styles.buttonContainer}>
        <button
          onMouseDown={handleHoldStart}
          onMouseUp={handleHoldEnd}
          onMouseLeave={handleHoldEnd}
          onTouchStart={handleHoldStart}
          onTouchEnd={handleHoldEnd}
          style={{
            ...styles.emergencyButton,
            transform: holding ? 'scale(0.95)' : 'scale(1)',
            boxShadow: holding ? '0 0 60px rgba(229,57,53,0.8)' : '0 0 30px rgba(229,57,53,0.5)'
          }}
        >
          <div style={styles.buttonInner}>
            <span style={styles.buttonIcon}>🆘</span>
            <span style={styles.buttonText}>EMERGENCY</span>
            <span style={styles.buttonHint}>Press & Hold</span>
          </div>
          {holding && (
            <div style={{ ...styles.progressRing, width: `${holdProgress}%` }} />
          )}
        </button>
      </div>

      {surge?.surgeActive && (
        <div style={styles.surgeWarning}>
          ⚠️ High demand area. Surge pricing may apply.
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.info}>
        <p>📍 {location ? 'Location acquired' : 'Acquiring location...'}</p>
        <p>📞 If no response, call <strong>108</strong> directly</p>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Quick Assessment</h2>
        <p style={styles.subtitle}>Help us send the right ambulance</p>
      </div>

      <div style={styles.triageForm}>
        <div style={styles.triageGroup}>
          <label style={styles.label}>Is the patient breathing?</label>
          <div style={styles.toggleGroup}>
            <button
              onClick={() => handleTriageChange('isBreathing', true)}
              style={{ ...styles.toggleBtn, background: triage.isBreathing ? '#4caf50' : '#ddd', color: triage.isBreathing ? '#fff' : '#333' }}
            >Yes</button>
            <button
              onClick={() => handleTriageChange('isBreathing', false)}
              style={{ ...styles.toggleBtn, background: !triage.isBreathing ? '#e53935' : '#ddd', color: !triage.isBreathing ? '#fff' : '#333' }}
            >No</button>
          </div>
        </div>

        <div style={styles.triageGroup}>
          <label style={styles.label}>Is the patient conscious?</label>
          <div style={styles.toggleGroup}>
            <button
              onClick={() => handleTriageChange('isConscious', true)}
              style={{ ...styles.toggleBtn, background: triage.isConscious ? '#4caf50' : '#ddd', color: triage.isConscious ? '#fff' : '#333' }}
            >Yes</button>
            <button
              onClick={() => handleTriageChange('isConscious', false)}
              style={{ ...styles.toggleBtn, background: !triage.isConscious ? '#e53935' : '#ddd', color: !triage.isConscious ? '#fff' : '#333' }}
            >No</button>
          </div>
        </div>

        <div style={styles.triageGroup}>
          <label style={styles.label}>Active bleeding?</label>
          <div style={styles.toggleGroup}>
            <button
              onClick={() => handleTriageChange('isBleeding', true)}
              style={{ ...styles.toggleBtn, background: triage.isBleeding ? '#e53935' : '#ddd', color: triage.isBleeding ? '#fff' : '#333' }}
            >Yes</button>
            <button
              onClick={() => handleTriageChange('isBleeding', false)}
              style={{ ...styles.toggleBtn, background: !triage.isBleeding ? '#4caf50' : '#ddd', color: !triage.isBleeding ? '#fff' : '#333' }}
            >No</button>
          </div>
        </div>

        <div style={styles.triageGroup}>
          <label style={styles.label}>Chief complaint</label>
          <input
            type="text"
            value={triage.chiefComplaint}
            onChange={(e) => handleTriageChange('chiefComplaint', e.target.value)}
            placeholder="e.g., Chest pain, Accident, Breathing difficulty"
            style={styles.input}
          />
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <button
        onClick={handleDispatch}
        disabled={loading || !location}
        style={{ ...styles.dispatchBtn, opacity: loading ? 0.7 : 1 }}
      >
        {loading ? '🔄 Dispatching...' : '🚑 Dispatch Ambulance Now'}
      </button>

      <button onClick={() => setStep(0)} style={styles.backBtn}>← Back</button>
    </div>
  );

  const renderStep2 = () => (
    <div style={styles.container}>
      <div style={{ ...styles.header, background: '#e8f5e9' }}>
        <h2 style={{ ...styles.title, color: '#2e7d32' }}>✅ Ambulance Dispatched!</h2>
      </div>

      <div style={styles.resultCard}>
        <div style={styles.resultRow}>
          <span>🚑 Driver:</span>
          <strong>{result?.driver?.name || 'Assigned'}</strong>
        </div>
        <div style={styles.resultRow}>
          <span>📞 Contact:</span>
          <strong>{result?.driver?.phone || 'N/A'}</strong>
        </div>
        <div style={styles.resultRow}>
          <span>🚐 Vehicle:</span>
          <strong>{result?.driver?.vehicleNumber || 'N/A'}</strong>
        </div>
        <div style={styles.resultRow}>
          <span>⭐ Rating:</span>
          <strong>{result?.driver?.rating || 'N/A'}</strong>
        </div>
        <div style={styles.resultRow}>
          <span>🔢 OTP:</span>
          <strong style={{ fontSize: '24px', color: '#e53935' }}>{result?.tripOtp}</strong>
        </div>
      </div>

      <button
        onClick={() => navigate(`/ambulance/tracking/${result?.bookingId}`)}
        style={styles.trackBtn}
      >
        📍 Track Live Location
      </button>

      <div style={styles.info}>
        <p>Share OTP with driver on arrival</p>
        <p>Emergency contacts have been notified</p>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      {step === 0 && renderStep0()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  container: {
    maxWidth: '450px',
    width: '100%',
    textAlign: 'center'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    color: '#fff',
    fontSize: '28px',
    margin: '0 0 10px 0'
  },
  subtitle: {
    color: '#aaa',
    fontSize: '14px',
    margin: 0
  },
  buttonContainer: {
    margin: '30px 0'
  },
  emergencyButton: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    border: '4px solid #e53935',
    background: 'linear-gradient(135deg, #e53935, #c62828)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.2s',
    animation: 'pulse 2s infinite'
  },
  buttonInner: {
    position: 'relative',
    zIndex: 1
  },
  buttonIcon: {
    fontSize: '40px',
    display: 'block'
  },
  buttonText: {
    color: '#fff',
    fontSize: '22px',
    fontWeight: 'bold',
    display: 'block',
    marginTop: '5px'
  },
  buttonHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '12px',
    display: 'block',
    marginTop: '5px'
  },
  progressRing: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '4px',
    background: '#fff',
    transition: 'width 0.15s'
  },
  triageForm: {
    textAlign: 'left',
    marginBottom: '30px'
  },
  triageGroup: {
    marginBottom: '20px'
  },
  label: {
    color: '#ccc',
    fontSize: '14px',
    marginBottom: '8px',
    display: 'block'
  },
  toggleGroup: {
    display: 'flex',
    gap: '10px'
  },
  toggleBtn: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #444',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#16213e',
    color: '#fff',
    boxSizing: 'border-box'
  },
  dispatchBtn: {
    width: '100%',
    padding: '16px',
    background: '#e53935',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '10px'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#aaa',
    fontSize: '14px',
    cursor: 'pointer'
  },
  resultCard: {
    background: '#16213e',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px'
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #2a2a4a',
    color: '#ccc',
    fontSize: '14px'
  },
  trackBtn: {
    width: '100%',
    padding: '16px',
    background: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '15px'
  },
  info: {
    color: '#888',
    fontSize: '12px',
    marginTop: '15px'
  },
  surgeWarning: {
    background: '#fff3e0',
    color: '#e65100',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '15px'
  },
  error: {
    background: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '15px'
  }
};

export default EmergencyRequest;