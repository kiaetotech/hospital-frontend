import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  getDriverDashboard,
  toggleDriverAvailability,
  acceptEmergency,
  ambulanceTripStart,
  ambulancePatientOnboard,
  ambulanceArrivedHospital,
  ambulanceTripComplete,
  ambulanceUpdateLocation,
  getDriverTripHistory
} from '../../services/api';

const SOCKET_URL = 'https://hospital-backend-production-7d0f.up.railway.app';

const DriverApp = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [emergencyRequest, setEmergencyRequest] = useState(null);
  const [acceptTimer, setAcceptTimer] = useState(15);
  const [dashboard, setDashboard] = useState(null);
  const [location, setLocation] = useState(null);
  const [step, setStep] = useState('idle');
  const [otp, setOtp] = useState('');
  const [vitals, setVitals] = useState({ bloodPressure: '', pulse: '', spo2: '', temperature: '' });
  const [tripNotes, setTripNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [tripHistory, setTripHistory] = useState([]);
  const socketRef = useRef(null);
  const locationInterval = useRef(null);
  const timerInterval = useRef(null);
  const currentTripRef = useRef(null);
  const isOnlineRef = useRef(false);

  useEffect(() => {
    currentTripRef.current = currentTrip;
  }, [currentTrip]);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    fetchDashboard();
    connectSocket();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
        locationInterval.current = null;
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    };
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getDriverDashboard();
      if (res.data?.data) setDashboard(res.data.data);
    } catch (err) {}
  };

  const fetchTripHistory = async () => {
    try {
      const res = await getDriverTripHistory({ limit: 20 });
      if (res.data?.data) setTripHistory(res.data.data);
    } catch (err) {}
  };

  const connectSocket = () => {
    const token = localStorage.getItem('token');
    const socket = io(SOCKET_URL, { auth: { token, userType: 'ambulance_driver' }, transports: ['websocket'] });

    socket.on('connect', () => {
      const driverId = localStorage.getItem('driverId');
      if (driverId) {
        socket.emit('driver:register', {
          driverId,
          vehicleId: dashboard?.vehicleId || dashboard?.vehicle?._id || '',
          vehicleNumber: dashboard?.vehicleNumber || dashboard?.vehicle?.vehicleNumber || '',
          vehicleType: dashboard?.vehicleType || dashboard?.vehicle?.type || 'basic'
        });
      }
    });

    socket.on('emergency:new_request', (data) => {
      setEmergencyRequest(data);
      setStep('emergency_alert');
      startAcceptTimer();
    });

    socket.on('emergency:cancelled', () => {
      setEmergencyRequest(null);
      setCurrentTrip(null);
      setStep('idle');
      if (timerInterval.current) clearInterval(timerInterval.current);
    });

    socketRef.current = socket;
  };

  const startAcceptTimer = () => {
    setAcceptTimer(15);
    timerInterval.current = setInterval(() => {
      setAcceptTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval.current);
          rejectEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleToggleOnline = async () => {
    const nextOnline = !isOnline;
    try {
      await toggleDriverAvailability({ isAvailable: nextOnline });
      isOnlineRef.current = nextOnline;
      setIsOnline(nextOnline);
      await fetchDashboard();

      if (nextOnline) {
        startLocationTracking();
        socketRef.current?.emit('driver:register', {
          driverId: localStorage.getItem('driverId'),
          vehicleId: dashboard?.vehicleId || dashboard?.vehicle?._id || '',
          vehicleNumber: dashboard?.vehicleNumber || dashboard?.vehicle?.vehicleNumber || '',
          vehicleType: dashboard?.vehicleType || dashboard?.vehicle?.type || 'basic'
        });
      } else {
        stopLocationTracking();
      }
    } catch (err) {
      console.error('Availability update failed:', err);
      alert(err?.response?.data?.message || err?.message || 'Unable to change availability.');
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      alert('GPS is not supported by this browser.');
      return;
    }

    if (locationInterval.current) clearInterval(locationInterval.current);

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const loc = {
            lat: Number(pos.coords.latitude),
            lng: Number(pos.coords.longitude)
          };

          setLocation(loc);

          const driverId = localStorage.getItem('driverId');
          const trip = currentTripRef.current;

          if (!driverId) {
            console.error('driverId missing from localStorage. Cannot update ambulance location.');
            return;
          }

          const payload = {
            driverId,
            lat: loc.lat,
            lng: loc.lng,
            isAvailable: isOnlineRef.current,
            isOnTrip: Boolean(trip),
            tripId: trip?.bookingId || trip?._id || '',
            vehicleId: dashboard?.vehicleId || dashboard?.vehicle?._id || '',
            vehicleNumber: dashboard?.vehicleNumber || dashboard?.vehicle?.vehicleNumber || '',
            vehicleType: dashboard?.vehicleType || dashboard?.vehicle?.type || 'basic'
          };

          try {
            await ambulanceUpdateLocation(payload);

            socketRef.current?.emit('driver:location_update', payload);
          } catch (err) {
            console.error('Ambulance location update failed:', err?.response?.data || err?.message || err);
          }
        },
        (error) => {
          console.error('GPS error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );
    };

    sendLocation();
    locationInterval.current = setInterval(sendLocation, 5000);
  };

  const stopLocationTracking = () => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
    }
  };

  const handleAcceptEmergency = async () => {
    if (!emergencyRequest) return;
    clearInterval(timerInterval.current);

    try {
      await acceptEmergency(emergencyRequest.bookingId, {});
      currentTripRef.current = emergencyRequest;
      setCurrentTrip(emergencyRequest);
      setStep('accepted');
      socketRef.current?.emit('driver:accept_emergency', { bookingId: emergencyRequest.bookingId });
    } catch (err) {
      console.error('Accept emergency failed:', err?.response?.data || err?.message || err);
      alert(err?.response?.data?.message || err?.message || 'Unable to accept this emergency request.');
    }
  };

  const rejectEmergency = () => {
    clearInterval(timerInterval.current);
    socketRef.current?.emit('driver:reject_emergency', {
      bookingId: emergencyRequest?.bookingId,
      reason: 'Unable to accept'
    });
    setEmergencyRequest(null);
    setStep('idle');
  };

  const arrivedAtPickup = async () => {
    try {
      await ambulanceTripStart(currentTrip.bookingId);
      setStep('arrived_pickup');
      socketRef.current?.emit('driver:arrived_pickup', { bookingId: currentTrip.bookingId });
    } catch (err) {
      console.error('Trip start failed:', err?.response?.data || err?.message || err);
      alert(err?.response?.data?.message || err?.message || 'Unable to mark arrival.');
    }
  };

  const patientOnboard = async () => {
    if (!otp) return alert('Please enter OTP');
    try {
      await ambulancePatientOnboard(currentTrip.bookingId, { otp });
      setStep('onboard');
      socketRef.current?.emit('driver:patient_onboard', { bookingId: currentTrip.bookingId, otp });
    } catch (err) {
      console.error('Patient onboard failed:', err?.response?.data || err?.message || err);
      alert(err?.response?.data?.message || 'Invalid OTP or trip cannot be started.');
    }
  };

  const arrivedAtHospital = async () => {
    try {
      await ambulanceArrivedHospital(currentTrip.bookingId, { vitals });
      setStep('arrived_hospital');
      socketRef.current?.emit('driver:arrived_hospital', { bookingId: currentTrip.bookingId, vitals });
    } catch (err) {
      console.error('Hospital arrival failed:', err?.response?.data || err?.message || err);
      alert(err?.response?.data?.message || err?.message || 'Unable to mark hospital arrival.');
    }
  };

  const completeTrip = async () => {
    try {
      const distance = Number(
        currentTrip?.actualDistance ??
        currentTrip?.distance ??
        currentTrip?.tripDistance ??
        0
      );
      const duration = Number(
        currentTrip?.actualDuration ??
        currentTrip?.duration ??
        0
      );
      await ambulanceTripComplete(currentTrip.bookingId, {
        distance, duration,
        oxygenAdministered: false,
        vitals,
        notes: tripNotes
      });
      setStep('completed');
      socketRef.current?.emit('driver:trip_completed', {
        bookingId: currentTrip.bookingId,
        distance, duration, vitals, notes: tripNotes
      });
      setTimeout(() => {
        setCurrentTrip(null);
        setEmergencyRequest(null);
        setStep('idle');
        setOtp('');
        setVitals({ bloodPressure: '', pulse: '', spo2: '', temperature: '' });
        setTripNotes('');
        fetchDashboard();
      }, 3000);
    } catch (err) {
      console.error('Trip completion failed:', err?.response?.data || err?.message || err);
      alert(err?.response?.data?.message || err?.message || 'Unable to complete trip.');
    }
  };

  const getStatusColor = () => {
    const colors = {
      emergency_alert: '#e53935',
      accepted: '#2196f3',
      arrived_pickup: '#ff9800',
      onboard: '#9c27b0',
      arrived_hospital: '#4caf50',
      completed: '#4caf50'
    };
    return colors[step] || '#333';
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate('/ambulance')} style={styles.backBtn}>← Exit</button>
        <h1 style={styles.title}>🚑 Driver App</h1>
        <div style={styles.onlineIndicator}>
          <span style={{ ...styles.dot, background: isOnline ? '#4caf50' : '#e53935' }} />
          <span style={styles.onlineText}>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {!localStorage.getItem('driverId') && (
        <div style={styles.driverWarning}>
          ⚠️ Driver ID is missing. GPS location cannot be linked to the ambulance.
          Please log in again through the ambulance driver account.
        </div>
      )}

      {step === 'idle' && (
        <div style={styles.toggleSection}>
          <button
            onClick={handleToggleOnline}
            style={{ ...styles.toggleBtn, background: isOnline ? '#4caf50' : '#e53935' }}
          >
            {isOnline ? '🟢 Go Offline' : '🔴 Go Online'}
          </button>
          {!isOnline && <p style={styles.toggleHint}>Go online to receive emergency requests</p>}
        </div>
      )}

      {step === 'idle' && dashboard && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>📅</span>
            <strong style={styles.statValue}>{dashboard.todayTrips || 0}</strong>
            <span style={styles.statLabel}>Today</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>💰</span>
            <strong style={styles.statValue}>₹{dashboard.todayEarnings || 0}</strong>
            <span style={styles.statLabel}>Earnings</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>⭐</span>
            <strong style={styles.statValue}>{dashboard.rating || 'N/A'}</strong>
            <span style={styles.statLabel}>Rating</span>
          </div>
        </div>
      )}

      {step === 'emergency_alert' && emergencyRequest && (
        <div style={styles.alertCard}>
          <div style={styles.alertHeader}>
            <span style={styles.alertIcon}>🚨</span>
            <h2 style={styles.alertTitle}>EMERGENCY REQUEST</h2>
          </div>
          <div style={{ ...styles.timerBar, width: `${(acceptTimer / 15) * 100}%`, background: acceptTimer <= 5 ? '#e53935' : '#ff9800' }} />
          <p style={styles.timerText}>{acceptTimer}s remaining</p>
          <div style={styles.alertDetails}>
            <p><strong>Patient:</strong> {emergencyRequest.patientName}</p>
            <p><strong>Condition:</strong> {emergencyRequest.patientCondition}</p>
            <p><strong>Pickup:</strong> {emergencyRequest.pickupAddress}</p>
            <p><strong>Distance:</strong> {emergencyRequest.distance}km</p>
            <p><strong>Est. Fare:</strong> ₹{emergencyRequest.estimatedFare}</p>
          </div>
          <div style={styles.alertActions}>
            <button onClick={handleAcceptEmergency} style={styles.acceptBtn}>✅ Accept</button>
            <button onClick={rejectEmergency} style={styles.rejectBtn}>❌ Decline</button>
          </div>
        </div>
      )}

      {(step === 'accepted' || step === 'arrived_pickup' || step === 'onboard' || step === 'arrived_hospital') && (
        <div style={styles.tripCard}>
          <div style={{ ...styles.tripStatus, borderColor: getStatusColor() }}>
            <h3 style={{ color: getStatusColor(), margin: 0 }}>
              {step === 'accepted' && '🚗 Driving to pickup...'}
              {step === 'arrived_pickup' && '📍 Arrived at pickup'}
              {step === 'onboard' && '🏥 Heading to hospital'}
              {step === 'arrived_hospital' && '🏥 Arrived at hospital'}
            </h3>
          </div>

          <div style={styles.tripActions}>
            {step === 'accepted' && (
              <button onClick={arrivedAtPickup} style={styles.actionBtn}>📍 I've Arrived</button>
            )}

            {step === 'arrived_pickup' && (
              <>
                <input type="text" placeholder="Enter OTP from patient" value={otp} onChange={(e) => setOtp(e.target.value)} style={styles.otpInput} maxLength={4} />
                <button onClick={patientOnboard} style={styles.actionBtn}>✅ Confirm & Start Trip</button>
              </>
            )}

            {step === 'onboard' && (
              <>
                <div style={styles.vitalsForm}>
                  <h4 style={styles.vitalsTitle}>Record Vitals (Optional)</h4>
                  <div style={styles.vitalsGrid}>
                    <input placeholder="BP (120/80)" value={vitals.bloodPressure} onChange={(e) => setVitals(p => ({ ...p, bloodPressure: e.target.value }))} style={styles.vitalInput} />
                    <input placeholder="Pulse (72)" value={vitals.pulse} onChange={(e) => setVitals(p => ({ ...p, pulse: e.target.value }))} style={styles.vitalInput} />
                    <input placeholder="SpO2 (98)" value={vitals.spo2} onChange={(e) => setVitals(p => ({ ...p, spo2: e.target.value }))} style={styles.vitalInput} />
                    <input placeholder="Temp (98.6)" value={vitals.temperature} onChange={(e) => setVitals(p => ({ ...p, temperature: e.target.value }))} style={styles.vitalInput} />
                  </div>
                </div>
                <button onClick={arrivedAtHospital} style={styles.actionBtn}>🏥 Arrived at Hospital</button>
              </>
            )}

            {step === 'arrived_hospital' && (
              <>
                <textarea placeholder="Trip notes..." value={tripNotes} onChange={(e) => setTripNotes(e.target.value)} style={styles.textarea} rows={3} />
                <button onClick={completeTrip} style={{ ...styles.actionBtn, background: '#4caf50' }}>✅ Complete Trip</button>
              </>
            )}
          </div>
        </div>
      )}

      {step === 'completed' && (
        <div style={styles.completedCard}>
          <span style={styles.completedIcon}>✅</span>
          <h2 style={styles.completedTitle}>Trip Completed!</h2>
          <p style={styles.completedText}>Earnings added to your account</p>
        </div>
      )}

      {step === 'idle' && (
        <button onClick={() => { setShowHistory(!showHistory); if (!showHistory) fetchTripHistory(); }} style={styles.historyToggle}>
          📋 {showHistory ? 'Hide' : 'View'} Trip History
        </button>
      )}

      {showHistory && (
        <div style={styles.historySection}>
          {tripHistory.length === 0 ? (
            <p style={styles.emptyText}>No trips yet</p>
          ) : (
            tripHistory.map((trip, i) => (
              <div key={i} style={styles.historyCard}>
                <div style={styles.historyRow}>
                  <span style={styles.historyLabel}>📅 {new Date(trip.completedAt || trip.createdAt).toLocaleDateString('en-IN')}</span>
                  <span style={styles.historyValue}>₹{trip.fareBreakdown?.total || trip.finalAmount || 'N/A'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {location && (
        <div style={styles.locationFooter}>
          <span>📍 GPS Active</span>
          <span>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: '#0f0f1a', padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  backBtn: { background: 'none', border: 'none', color: '#e53935', fontSize: '14px', cursor: 'pointer' },
  title: { color: '#fff', fontSize: '20px', margin: 0 },
  onlineIndicator: { display: 'flex', alignItems: 'center', gap: '6px' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' },
  onlineText: { color: '#aaa', fontSize: '12px' },
  driverWarning: { background: '#3a1f00', color: '#ffcc80', border: '1px solid #8a5a00', borderRadius: '10px', padding: '12px', marginBottom: '15px', fontSize: '12px', lineHeight: 1.5 },
  toggleSection: { textAlign: 'center', marginBottom: '20px' },
  toggleBtn: { width: '100%', padding: '16px', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' },
  toggleHint: { color: '#888', fontSize: '12px', marginTop: '8px' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' },
  statCard: { background: '#1a1a2e', borderRadius: '12px', padding: '16px', textAlign: 'center' },
  statIcon: { fontSize: '24px', display: 'block', marginBottom: '6px' },
  statValue: { color: '#fff', fontSize: '20px', display: 'block' },
  statLabel: { color: '#888', fontSize: '11px' },
  alertCard: { background: '#1a0000', border: '2px solid #e53935', borderRadius: '16px', padding: '20px', marginBottom: '20px' },
  alertHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' },
  alertIcon: { fontSize: '40px' },
  alertTitle: { color: '#e53935', fontSize: '20px', margin: 0 },
  timerBar: { height: '4px', borderRadius: '2px', transition: 'width 1s linear', marginBottom: '5px' },
  timerText: { color: '#ff9800', fontSize: '14px', textAlign: 'center', margin: '5px 0 15px 0' },
  alertDetails: { color: '#ccc', fontSize: '14px', lineHeight: '1.8', marginBottom: '20px' },
  alertActions: { display: 'flex', gap: '10px' },
  acceptBtn: { flex: 1, padding: '14px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  rejectBtn: { flex: 1, padding: '14px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  tripCard: { background: '#1a1a2e', borderRadius: '16px', padding: '20px', marginBottom: '20px' },
  tripStatus: { border: '2px solid #333', borderRadius: '10px', padding: '16px', textAlign: 'center', marginBottom: '20px' },
  tripActions: { display: 'flex', flexDirection: 'column', gap: '10px' },
  actionBtn: { width: '100%', padding: '14px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  otpInput: { width: '100%', padding: '14px', border: '2px solid #333', borderRadius: '10px', fontSize: '20px', textAlign: 'center', letterSpacing: '10px', background: '#0f0f1a', color: '#fff', boxSizing: 'border-box' },
  vitalsForm: { marginBottom: '10px' },
  vitalsTitle: { color: '#ccc', fontSize: '14px', margin: '0 0 10px 0' },
  vitalsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  vitalInput: { padding: '10px', border: '1px solid #333', borderRadius: '8px', background: '#0f0f1a', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '12px', border: '1px solid #333', borderRadius: '8px', background: '#0f0f1a', color: '#fff', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' },
  completedCard: { background: '#1a3a1a', borderRadius: '16px', padding: '40px', textAlign: 'center', marginBottom: '20px' },
  completedIcon: { fontSize: '60px', display: 'block', marginBottom: '15px' },
  completedTitle: { color: '#4caf50', fontSize: '22px', margin: '0 0 10px 0' },
  completedText: { color: '#aaa', fontSize: '14px' },
  historyToggle: { width: '100%', padding: '12px', background: '#333', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', marginBottom: '15px' },
  historySection: {},
  emptyText: { color: '#888', textAlign: 'center', padding: '20px' },
  historyCard: { background: '#1a1a2e', borderRadius: '8px', padding: '12px', marginBottom: '8px' },
  historyRow: { display: 'flex', justifyContent: 'space-between' },
  historyLabel: { color: '#ccc', fontSize: '13px' },
  historyValue: { color: '#4caf50', fontSize: '14px', fontWeight: 'bold' },
  locationFooter: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1a1a2e', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', color: '#4caf50', fontSize: '12px', borderTop: '1px solid #333' }
};

export default DriverApp;
