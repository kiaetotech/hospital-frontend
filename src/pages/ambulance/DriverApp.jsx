import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../services/api';
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
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });
  const [socketStatus, setSocketStatus] = useState('connecting');
  const [emergencyCount, setEmergencyCount] = useState(0);
  const [scheduledRequest, setScheduledRequest] = useState(null);
  const [activeScheduledTrip, setActiveScheduledTrip] = useState(null);
  const [scheduledOtp, setScheduledOtp] = useState('');
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
    if (!sessionStorage.getItem('driverId')) {
      navigate('/ambulance/driver/login');
      return;
    }
    fetchDashboard();
    fetchTripHistory();
    connectSocket();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (locationInterval.current) clearInterval(locationInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  const fetchDashboard = async () => {
    try {
      const driverId = sessionStorage.getItem('driverId');
      const res = await getDriverDashboard(driverId ? { driverId } : {});
      if (res.data?.data) {
        setDashboard(res.data.data);
        setEarnings({
  today: res.data.data.stats?.todayEarnings || 0,
  week: res.data.data.stats?.weekEarnings || 0,
  month: res.data.data.stats?.monthEarnings || 0
});
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
  };

  const fetchTripHistory = async () => {
    try {
      const driverId = sessionStorage.getItem('driverId');
      const res = await getDriverTripHistory({ limit: 10, ...(driverId ? { driverId } : {}) });
      if (res.data?.data) setTripHistory(res.data.data);
    } catch (err) {
      console.error('Trip history fetch error:', err);
    }
  };

  const playEmergencySound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'square';
      gainNode.gain.value = 0.3;
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 2000);
    } catch (e) {
      console.log('Sound alert failed:', e);
    }
  };

	const playScheduledSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.2;
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 800);
  } catch (e) {
    console.log('Scheduled sound failed:', e);
  }
};

  const connectSocket = () => {
    const token = sessionStorage.getItem('token');
    const socket = io(SOCKET_URL, { 
  auth: { token, userType: 'ambulance_driver' }, 
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

    socket.on('connect', () => {
      setSocketStatus('connected');
      const driverId = sessionStorage.getItem('driverId');
      if (driverId) {
        socket.emit('driver:register', {
          driverId,
          vehicleId: dashboard?.vehicleId || '',
          vehicleNumber: dashboard?.vehicleNumber || '',
          vehicleType: dashboard?.vehicleType || 'basic'
        });
      }
    });

    socket.on('disconnect', () => {
      setSocketStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setSocketStatus('error');
    });

    socket.on('driver:registered', (data) => {
      console.log('Driver registered on socket:', data);
    });

	socket.on('scheduled:new_request', (data) => {
  console.log('📅 SCHEDULED TRIP REQUEST:', data);
  setScheduledRequest(data);
  setStep('scheduled_alert');
  playScheduledSound();
  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
});

    socket.on('emergency:new_request', (data) => {
      console.log('🚨 EMERGENCY REQUEST RECEIVED:', data);
      setEmergencyRequest(data);
      setEmergencyCount(prev => prev + 1);
      setStep('emergency_alert');
      startAcceptTimer();
      playEmergencySound();
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
    });

    socket.on('emergency:cancelled', () => {
      setEmergencyRequest(null);
      setCurrentTrip(null);
      setStep('idle');
      if (timerInterval.current) clearInterval(timerInterval.current);
    });

    socket.on('driver:accept_confirmed', (data) => {
      setStep('accepted');
    });

    socketRef.current = socket;
  };

  const startAcceptTimer = () => {
    setAcceptTimer(15);
    if (timerInterval.current) clearInterval(timerInterval.current);
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
      const driverId = sessionStorage.getItem('driverId');
      await toggleDriverAvailability({ driverId, isAvailable: nextOnline });
      isOnlineRef.current = nextOnline;
      setIsOnline(nextOnline);
      
      if (nextOnline) {
        startLocationTracking();
      } else {
        stopLocationTracking();
      }
    } catch (err) {
      console.error('Availability update failed:', err);
      alert('Unable to change availability. Please try again.');
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

          const driverId = sessionStorage.getItem('driverId');
          if (!driverId) return;

          const payload = {
            driverId,
            lat: loc.lat,
            lng: loc.lng,
            isAvailable: isOnlineRef.current,
            isOnTrip: Boolean(currentTripRef.current),
            tripId: currentTripRef.current?.bookingId || '',
            vehicleId: dashboard?.vehicleId || '',
            vehicleNumber: dashboard?.vehicleNumber || '',
            vehicleType: dashboard?.vehicleType || 'basic'
          };

          try {
            await ambulanceUpdateLocation(payload);
            socketRef.current?.emit('driver:location_update', payload);
          } catch (err) {
            console.error('Location update failed:', err);
          }
        },
        (error) => {
          console.error('GPS error:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    };

    sendLocation();
    locationInterval.current = setInterval(sendLocation, 15000);
  };

  const stopLocationTracking = () => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
    }
  };

	const handleAcceptScheduled = async () => {
  if (!scheduledRequest) return;
  try {
    await api.post(`/ambulance/accept-scheduled/${scheduledRequest.bookingId}`);
    setActiveScheduledTrip(scheduledRequest);
    setScheduledRequest(null);
    setStep('scheduled_active');
    fetchTripHistory();
  } catch (err) {
    alert('Unable to accept trip');
  }
};

const handleDeclineScheduled = async () => {
  if (!scheduledRequest) return;
  try {
    await api.post(`/ambulance/decline-scheduled/${scheduledRequest.bookingId}`);
    setScheduledRequest(null);
    setStep('idle');
  } catch (err) {
    alert('Unable to decline trip');
  }
};

  const handleAcceptEmergency = async () => {
    if (!emergencyRequest) return;
    if (timerInterval.current) clearInterval(timerInterval.current);

    try {
      const driverId = sessionStorage.getItem('driverId');
      await acceptEmergency(emergencyRequest.bookingId, { driverId });
      currentTripRef.current = emergencyRequest;
      setCurrentTrip(emergencyRequest);
      setStep('accepted');
      socketRef.current?.emit('driver:accept_emergency', { bookingId: emergencyRequest.bookingId });
    } catch (err) {
      console.error('Accept emergency failed:', err);
      alert('Unable to accept this emergency request.');
    }
  };

  const rejectEmergency = () => {
    if (timerInterval.current) clearInterval(timerInterval.current);
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
    } catch (err) {
      alert('Unable to mark arrival.');
    }
  };

  const patientOnboard = async () => {
    if (!otp) return alert('Please enter OTP');
    try {
      await ambulancePatientOnboard(currentTrip.bookingId, { otp });
      setStep('onboard');
    } catch (err) {
      alert('Invalid OTP or trip cannot be started.');
    }
  };

  const arrivedAtHospital = async () => {
    try {
      await ambulanceArrivedHospital(currentTrip.bookingId, { vitals });
      setStep('arrived_hospital');
    } catch (err) {
      alert('Unable to mark hospital arrival.');
    }
  };

  const completeTrip = async () => {
    try {
      await ambulanceTripComplete(currentTrip.bookingId, {
        distance: currentTrip?.distance || 5,
        duration: currentTrip?.duration || 15,
        vitals,
        notes: tripNotes
      });
      setStep('completed');
      setTimeout(() => {
        setCurrentTrip(null);
        setEmergencyRequest(null);
        setStep('idle');
        setOtp('');
        setVitals({ bloodPressure: '', pulse: '', spo2: '', temperature: '' });
        setTripNotes('');
        fetchDashboard();
        fetchTripHistory();
      }, 3000);
    } catch (err) {
      alert('Unable to complete trip.');
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
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => {
  sessionStorage.clear();
  navigate('/ambulance/driver/login');
}} style={styles.backBtn}>← Exit</button>
        <h1 style={styles.title}>🚑 Driver App</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {emergencyCount > 0 && step === 'idle' && (
            <span style={styles.emergencyBadge}>{emergencyCount}</span>
          )}
          <div style={styles.onlineIndicator}>
            <span style={{ ...styles.dot, background: socketStatus === 'connected' ? '#4caf50' : socketStatus === 'error' ? '#e53935' : '#ff9800' }} />
            <span style={styles.onlineText}>{socketStatus === 'connected' ? 'Connected' : socketStatus === 'error' ? 'Error' : 'Connecting...'}</span>
          </div>
          <div style={styles.onlineIndicator}>
            <span style={{ ...styles.dot, background: isOnline ? '#4caf50' : '#e53935' }} />
            <span style={styles.onlineText}>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

	{/* Scheduled Trip Alert */}
{step === 'scheduled_alert' && scheduledRequest && (
  <div style={styles.scheduledBanner}>
    <div style={styles.scheduledBannerContent}>
      <span style={styles.scheduledIcon}>📅</span>
      <div style={styles.scheduledInfo}>
        <strong style={styles.scheduledTitle}>New Scheduled Trip</strong>
        <span style={styles.scheduledText}>
          {scheduledRequest.patientName} • {scheduledRequest.pickupAddress}
        </span>
        <span style={styles.scheduledFare}>₹{scheduledRequest.amount}</span>
      </div>
      <div style={styles.scheduledActions}>
        <button onClick={handleAcceptScheduled} style={styles.scheduledAccept}>Accept</button>
        <button onClick={handleDeclineScheduled} style={styles.scheduledDecline}>Decline</button>
      </div>
    </div>
    <p style={styles.scheduledTimer}>Respond within 5 minutes</p>
  </div>
)}

      {/* Emergency Alert Overlay */}
      {step === 'emergency_alert' && emergencyRequest && (
        <div style={styles.alertOverlay}>
          <div style={styles.alertCard}>
            <div style={styles.alertHeader}>
              <span style={styles.alertIcon}>🚨</span>
              <h2 style={styles.alertTitle}>EMERGENCY REQUEST</h2>
            </div>
            <div style={{ ...styles.timerBar, width: `${(acceptTimer / 15) * 100}%`, background: acceptTimer <= 5 ? '#e53935' : '#ff9800' }} />
            <p style={styles.timerText}>{acceptTimer}s remaining</p>
            <div style={styles.alertDetails}>
              <p><strong>Patient:</strong> {emergencyRequest.patientName}</p>
              <p><strong>Condition:</strong> {emergencyRequest.patientCondition || 'Emergency'}</p>
              <p><strong>Pickup:</strong> {emergencyRequest.pickupAddress}</p>
              <p><strong>Distance:</strong> {emergencyRequest.distance || 'N/A'} km</p>
              <p><strong>Est. Fare:</strong> ₹{emergencyRequest.estimatedFare || 0}</p>
            </div>
            <div style={styles.alertActions}>
              <button onClick={handleAcceptEmergency} style={styles.acceptBtn}>✅ Accept</button>
              <button onClick={rejectEmergency} style={styles.rejectBtn}>❌ Decline</button>
            </div>
          </div>
        </div>
      )}

      {/* Idle State - Dashboard */}
      {step === 'idle' && (
        <>
          {/* Driver Info Card */}
          <div style={styles.infoCard}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>👤 Driver</span>
              <span style={styles.infoValue}>{dashboard?.driverName || sessionStorage.getItem('driverName') || 'N/A'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>🚙 Vehicle</span>
              <span style={styles.infoValue}>{dashboard?.vehicleNumber || 'N/A'} ({dashboard?.vehicleType || 'basic'})</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>⭐ Rating</span>
              <span style={styles.infoValue}>{dashboard?.stats?.rating || 'N/A'} ({dashboard?.stats?.totalRatings || 0} ratings)</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>📞 Phone</span>
              <span style={styles.infoValue}>{sessionStorage.getItem('driverPhone') || 'N/A'}</span>
            </div>
          </div>

          {/* Earnings Summary */}
          <div style={styles.earningsCard}>
            <div style={styles.earningsRow}>
              <span style={styles.earningsLabel}>💰 Today's Earnings</span>
              <span style={styles.earningsValue}>₹{earnings.today || 0}</span>
            </div>
            <div style={styles.earningsRow}>
              <span style={styles.earningsLabel}>📅 This Week</span>
              <span style={styles.earningsValue}>₹{earnings.week || 0}</span>
            </div>
            <div style={styles.earningsRow}>
              <span style={styles.earningsLabel}>📆 This Month</span>
              <span style={styles.earningsValue}>₹{earnings.month || 0}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statIcon}>🚑</span>
              <strong style={styles.statValue}>{dashboard?.stats?.todayTrips || 0}</strong>
              <span style={styles.statLabel}>Today's Trips</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statIcon}>✅</span>
              <strong style={styles.statValue}>{dashboard?.stats?.totalTrips || tripHistory?.length || 0}</strong>
              <span style={styles.statLabel}>Total Trips</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statIcon}>⭐</span>
              <strong style={styles.statValue}>{dashboard?.stats?.rating || 'N/A'}</strong>
              <span style={styles.statLabel}>Rating</span>
            </div>
          </div>

          {/* Toggle Online Button */}
          <button
            onClick={handleToggleOnline}
            style={{ ...styles.toggleBtn, background: isOnline ? '#e53935' : '#4caf50' }}
          >
            {isOnline ? '🔴 Go Offline' : '🟢 Go Online'}
          </button>
          {!isOnline && <p style={styles.toggleHint}>Go online to receive emergency requests</p>}

          {/* Recent Trips */}
          <button 
            onClick={() => { setShowHistory(!showHistory); if (!showHistory) fetchTripHistory(); }} 
            style={styles.historyToggle}
          >
            📋 {showHistory ? 'Hide' : 'View'} Trip History
          </button>

          {showHistory && (
            <div style={styles.historySection}>
              {tripHistory.length === 0 ? (
                <p style={styles.emptyText}>No trips completed yet</p>
              ) : (
                tripHistory.map((trip, i) => (
                  <div key={i} style={styles.historyCard}>
                    <div style={styles.historyRow}>
                      <span style={styles.historyLabel}>📅 {new Date(trip.completedAt || trip.createdAt).toLocaleDateString('en-IN')}</span>
                      <span style={styles.historyValue}>₹{trip.finalAmount || trip.fareBreakdown?.total || 'N/A'}</span>
                    </div>
                    <div style={styles.historyRow}>
                      <span style={styles.historySubLabel}>{trip.patientName || 'Patient'}</span>
                      <span style={styles.historySubValue}>{trip.status || 'completed'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Active Trip States */}
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
                <input 
                  type="text" 
                  placeholder="Enter OTP from patient" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                  style={styles.otpInput} 
                  maxLength={4} 
                />
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
                <textarea 
                  placeholder="Trip notes..." 
                  value={tripNotes} 
                  onChange={(e) => setTripNotes(e.target.value)} 
                  style={styles.textarea} 
                  rows={3} 
                />
                <button onClick={completeTrip} style={{ ...styles.actionBtn, background: '#4caf50' }}>✅ Complete Trip</button>
              </>
            )}
          </div>
        </div>
      )}

	{step === 'scheduled_active' && activeScheduledTrip && (
  <div style={styles.tripCard}>
    <div style={styles.tripStatus}>
      <h3 style={{ color: '#4caf50', margin: 0 }}>📅 Scheduled Trip Active</h3>
      <p style={{ color: '#ccc', fontSize: '13px', margin: '10px 0' }}>
        Patient: {activeScheduledTrip.patientName}<br/>
        Pickup: {activeScheduledTrip.pickupAddress}<br/>
        Drop: {activeScheduledTrip.dropAddress}
      </p>
    </div>
    <div style={styles.tripActions}>
      <button onClick={async () => {
        await api.post(`/ambulance/start-scheduled/${activeScheduledTrip.bookingId}`);
        setStep('scheduled_arrived');
      }} style={styles.actionBtn}>📍 I've Arrived</button>
    </div>
  </div>
)}

{step === 'scheduled_arrived' && activeScheduledTrip && (
  <div style={styles.tripCard}>
    <input 
      type="text" 
      placeholder="Enter OTP" 
      value={scheduledOtp} 
      onChange={(e) => setScheduledOtp(e.target.value)}
      style={styles.otpInput}
      maxLength={4}
    />
    <button onClick={async () => {
      try {
        await api.post(`/ambulance/patient-onboard-scheduled/${activeScheduledTrip.bookingId}`, { otp: scheduledOtp });
        setStep('scheduled_onboard');
      } catch (err) {
        alert('Invalid OTP');
      }
    }} style={styles.actionBtn}>✅ Start Trip</button>
  </div>
)}

{step === 'scheduled_onboard' && activeScheduledTrip && (
  <div style={styles.tripCard}>
    <button onClick={async () => {
      try {
        await api.post(`/ambulance/complete-scheduled/${activeScheduledTrip.bookingId}`, { distance: 5, duration: 15 });
        setStep('completed');
        setTimeout(() => {
          setActiveScheduledTrip(null);
          setStep('idle');
          fetchDashboard();
          fetchTripHistory();
        }, 3000);
      } catch (err) {
        alert('Unable to complete trip');
      }
    }} style={{ ...styles.actionBtn, background: '#4caf50' }}>✅ Complete Trip</button>
  </div>
)}

      {/* Completed State */}
      {step === 'completed' && (
        <div style={styles.completedCard}>
          <span style={styles.completedIcon}>✅</span>
          <h2 style={styles.completedTitle}>Trip Completed!</h2>
          <p style={styles.completedText}>Earnings added to your account</p>
        </div>
      )}

      {/* GPS Footer */}
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
  page: { 
    minHeight: '100vh', 
    background: '#0f0f1a', 
    padding: '20px 20px 70px', 
    maxWidth: '500px', 
    margin: '0 auto', 
    fontFamily: 'Arial, sans-serif' 
  },
  header: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: '20px' 
  },
  backBtn: { 
    background: 'none', 
    border: 'none', 
    color: '#e53935', 
    fontSize: '14px', 
    cursor: 'pointer' 
  },
  title: { 
    color: '#fff', 
    fontSize: '18px', 
    margin: 0 
  },
  emergencyBadge: {
    background: '#e53935',
    color: '#fff',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    animation: 'pulse 1s infinite'
  },
  onlineIndicator: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '4px' 
  },
  dot: { 
    width: '8px', 
    height: '8px', 
    borderRadius: '50%', 
    display: 'inline-block' 
  },
  onlineText: { 
    color: '#aaa', 
    fontSize: '10px' 
  },
  infoCard: { 
    background: '#1a1a2e', 
    borderRadius: '12px', 
    padding: '16px', 
    marginBottom: '15px' 
  },
  infoRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginBottom: '8px' 
  },
  infoLabel: { 
    color: '#888', 
    fontSize: '13px' 
  },
  infoValue: { 
    color: '#fff', 
    fontSize: '14px', 
    fontWeight: 'bold' 
  },
  earningsCard: { 
    background: '#1a2e1a', 
    borderRadius: '12px', 
    padding: '16px', 
    marginBottom: '15px' 
  },
  earningsRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginBottom: '8px' 
  },
  earningsLabel: { 
    color: '#aaa', 
    fontSize: '13px' 
  },
  earningsValue: { 
    color: '#4caf50', 
    fontSize: '14px', 
    fontWeight: 'bold' 
  },
  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr 1fr', 
    gap: '10px', 
    marginBottom: '20px' 
  },
  statCard: { 
    background: '#1a1a2e', 
    borderRadius: '12px', 
    padding: '16px', 
    textAlign: 'center' 
  },
  statIcon: { 
    fontSize: '24px', 
    display: 'block', 
    marginBottom: '6px' 
  },
  statValue: { 
    color: '#fff', 
    fontSize: '20px', 
    display: 'block' 
  },
  statLabel: { 
    color: '#888', 
    fontSize: '11px' 
  },
  toggleBtn: { 
    width: '100%', 
    padding: '16px', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '12px', 
    fontSize: '18px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    marginBottom: '10px' 
  },
  toggleHint: { 
    color: '#888', 
    fontSize: '12px', 
    textAlign: 'center', 
    marginTop: '0' 
  },
  historyToggle: { 
    width: '100%', 
    padding: '12px', 
    background: '#333', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '10px', 
    fontSize: '14px', 
    cursor: 'pointer', 
    marginBottom: '15px' 
  },
  historySection: {},
  emptyText: { 
    color: '#888', 
    textAlign: 'center', 
    padding: '20px' 
  },
  historyCard: { 
    background: '#1a1a2e', 
    borderRadius: '8px', 
    padding: '12px', 
    marginBottom: '8px' 
  },
  historyRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginBottom: '4px' 
  },
  historyLabel: { 
    color: '#ccc', 
    fontSize: '13px' 
  },
  historyValue: { 
    color: '#4caf50', 
    fontSize: '14px', 
    fontWeight: 'bold' 
  },
  historySubLabel: { 
    color: '#888', 
    fontSize: '11px' 
  },
  historySubValue: { 
    color: '#aaa', 
    fontSize: '11px' 
  },
  alertOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  alertCard: { 
    background: '#1a0000', 
    border: '2px solid #e53935', 
    borderRadius: '16px', 
    padding: '20px', 
    width: '100%',
    maxWidth: '450px'
  },
  alertHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    marginBottom: '15px' 
  },
  alertIcon: { 
    fontSize: '40px' 
  },
  alertTitle: { 
    color: '#e53935', 
    fontSize: '20px', 
    margin: 0 
  },
  timerBar: { 
    height: '4px', 
    borderRadius: '2px', 
    transition: 'width 1s linear', 
    marginBottom: '5px' 
  },
  timerText: { 
    color: '#ff9800', 
    fontSize: '14px', 
    textAlign: 'center', 
    margin: '5px 0 15px 0' 
  },
  alertDetails: { 
    color: '#ccc', 
    fontSize: '14px', 
    lineHeight: '1.8', 
    marginBottom: '20px' 
  },
  alertActions: { 
    display: 'flex', 
    gap: '10px' 
  },
  acceptBtn: { 
    flex: 1, 
    padding: '14px', 
    background: '#4caf50', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '10px', 
    fontSize: '16px', 
    fontWeight: 'bold', 
    cursor: 'pointer' 
  },
  rejectBtn: { 
    flex: 1, 
    padding: '14px', 
    background: '#e53935', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '10px', 
    fontSize: '16px', 
    fontWeight: 'bold', 
    cursor: 'pointer' 
  },
  tripCard: { 
    background: '#1a1a2e', 
    borderRadius: '16px', 
    padding: '20px', 
    marginBottom: '20px' 
  },
  tripStatus: { 
    border: '2px solid #333', 
    borderRadius: '10px', 
    padding: '16px', 
    textAlign: 'center', 
    marginBottom: '20px' 
  },
  tripActions: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px' 
  },
  actionBtn: { 
    width: '100%', 
    padding: '14px', 
    background: '#2196f3', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '10px', 
    fontSize: '16px', 
    fontWeight: 'bold', 
    cursor: 'pointer' 
  },
  otpInput: { 
    width: '100%', 
    padding: '14px', 
    border: '2px solid #333', 
    borderRadius: '10px', 
    fontSize: '20px', 
    textAlign: 'center', 
    letterSpacing: '10px', 
    background: '#0f0f1a', 
    color: '#fff', 
    boxSizing: 'border-box' 
  },
  vitalsForm: { 
    marginBottom: '10px' 
  },
  vitalsTitle: { 
    color: '#ccc', 
    fontSize: '14px', 
    margin: '0 0 10px 0' 
  },
  vitalsGrid: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '8px' 
  },
  vitalInput: { 
    padding: '10px', 
    border: '1px solid #333', 
    borderRadius: '8px', 
    background: '#0f0f1a', 
    color: '#fff', 
    fontSize: '14px', 
    boxSizing: 'border-box' 
  },
  textarea: { 
    width: '100%', 
    padding: '12px', 
    border: '1px solid #333', 
    borderRadius: '8px', 
    background: '#0f0f1a', 
    color: '#fff', 
    fontSize: '14px', 
    resize: 'vertical', 
    boxSizing: 'border-box' 
  },
  completedCard: { 
    background: '#1a3a1a', 
    borderRadius: '16px', 
    padding: '40px', 
    textAlign: 'center', 
    marginBottom: '20px' 
  },
  completedIcon: { 
    fontSize: '60px', 
    display: 'block', 
    marginBottom: '15px' 
  },
  completedTitle: { 
    color: '#4caf50', 
    fontSize: '22px', 
    margin: '0 0 10px 0' 
  },
  completedText: { 
    color: '#aaa', 
    fontSize: '14px' 
  },
    locationFooter: { 
    position: 'fixed', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    background: '#1a1a2e', 
    padding: '10px 20px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    color: '#4caf50', 
    fontSize: '12px', 
    borderTop: '1px solid #333', 
    zIndex: 100 
  },

  scheduledBanner: {
    background: '#1a2e3a',
    border: '2px solid #4caf50',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '15px'
  },
  scheduledBannerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  scheduledIcon: { fontSize: '30px' },
  scheduledInfo: { flex: 1 },
  scheduledTitle: { color: '#4caf50', fontSize: '14px', display: 'block' },
  scheduledText: { color: '#ccc', fontSize: '12px', display: 'block' },
  scheduledFare: { color: '#4caf50', fontSize: '14px', fontWeight: 'bold' },
  scheduledActions: { display: 'flex', flexDirection: 'column', gap: '6px' },
  scheduledAccept: { background: '#4caf50', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', cursor: 'pointer' },
  scheduledDecline: { background: '#e53935', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', cursor: 'pointer' },
  scheduledTimer: { color: '#888', fontSize: '11px', textAlign: 'center', marginTop: '8px' }
};

export default DriverApp;