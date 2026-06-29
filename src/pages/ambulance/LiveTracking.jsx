import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActiveEmergency } from '../../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://hospital-backend-production-8de3.up.railway.app';

const LiveTracking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchBookingDetails();
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const res = await getActiveEmergency(bookingId);
      if (res.data?.success) {
        const data = res.data.data;
        setBooking(data);
        setStatus(data.status);
        if (data.driver?.location) {
          setDriverLocation(data.driver.location);
        }
      }
    } catch (err) {
      setError('Unable to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });

    socket.on('connect', () => {
      socket.emit('patient:track', { bookingId });
    });

    socket.on('driver:location_updated', (data) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
      if (data.lat && driverLocation) {
        const dist = calculateDistance(data.lat, data.lng, driverLocation.lat, driverLocation.lng);
        setEta(Math.round(dist * 2));
      }
    });

    socket.on('emergency:driver_accepted', (data) => {
      setStatus('driver_assigned');
      setBooking(prev => ({ ...prev, driver: data }));
    });

    socket.on('emergency:driver_arrived', () => {
      setStatus('driver_arrived');
    });

    socket.on('emergency:patient_onboard', () => {
      setStatus('patient_onboard');
    });

    socket.on('emergency:arrived_hospital', () => {
      setStatus('arrived_hospital');
    });

    socket.on('emergency:trip_completed', () => {
      setStatus('completed');
    });

    socket.on('emergency:cancelled', () => {
      setStatus('cancelled');
    });

    socketRef.current = socket;
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  };

  const getStatusText = () => {
    const statusMap = {
      pending: '🔍 Searching for nearby ambulances...',
      driver_assigned: '✅ Driver assigned - On the way!',
      driver_en_route: '🚑 Ambulance is on the way',
      driver_arrived: '📍 Ambulance has arrived at your location',
      patient_onboard: '🏥 Heading to hospital',
      arrived_hospital: '🏥 Arrived at hospital',
      completed: '✅ Trip completed',
      cancelled: '❌ Cancelled',
      no_driver_found: '⚠️ No ambulance available'
    };
    return statusMap[status] || 'Processing...';
  };

  const getStatusColor = () => {
    const colorMap = {
      driver_assigned: '#4caf50',
      driver_en_route: '#2196f3',
      driver_arrived: '#ff9800',
      patient_onboard: '#9c27b0',
      arrived_hospital: '#4caf50',
      completed: '#4caf50',
      cancelled: '#e53935',
      no_driver_found: '#e53935'
    };
    return colorMap[status] || '#2196f3';
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>⚠️ Error</h2>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => navigate('/ambulance')} style={styles.backButton}>
            ← Back to Ambulance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/ambulance')} style={styles.headerBack}>
          ← Back
        </button>
        <h1 style={styles.headerTitle}>Live Tracking</h1>
        <div style={styles.headerSpacer} />
      </div>

      {/* Status Banner */}
      <div style={{ ...styles.statusBanner, borderColor: getStatusColor() }}>
        <span style={styles.statusIcon}>
          {status === 'driver_assigned' ? '🚑' : status === 'driver_arrived' ? '📍' : status === 'patient_onboard' ? '🏥' : '🔍'}
        </span>
        <div>
          <h2 style={{ ...styles.statusTitle, color: getStatusColor() }}>{getStatusText()}</h2>
          {eta && <p style={styles.etaText}>ETA: {eta} minutes</p>}
        </div>
      </div>

      {/* Map Placeholder */}
      <div style={styles.mapContainer} ref={mapRef}>
        <div style={styles.mapPlaceholder}>
          <div style={styles.mapGrid}>
            {[...Array(20)].map((_, i) => (
              <div key={i} style={styles.mapLine} />
            ))}
          </div>
          {driverLocation ? (
            <div style={styles.mapContent}>
              <div style={styles.ambulanceMarker}>
                <span style={styles.markerIcon}>🚑</span>
                <div style={styles.markerPulse} />
              </div>
              <div style={styles.routeLine} />
              <div style={styles.patientMarker}>
                <span style={styles.markerIcon}>📍</span>
              </div>
              <div style={styles.mapLabel}>Ambulance</div>
              <div style={{ ...styles.mapLabel, left: 'auto', right: '30px' }}>Your Location</div>
            </div>
          ) : (
            <div style={styles.mapWaiting}>
              <div style={styles.radar} />
              <p style={styles.mapWaitingText}>Acquiring ambulance location...</p>
            </div>
          )}
        </div>
      </div>

      {/* Driver Info Card */}
      {booking?.driver && (
        <div style={styles.driverCard}>
          <div style={styles.driverRow}>
            <span style={styles.driverLabel}>🚑 Driver</span>
            <span style={styles.driverValue}>{booking.driver.name || 'N/A'}</span>
          </div>
          <div style={styles.driverRow}>
            <span style={styles.driverLabel}>📞 Contact</span>
            <span style={styles.driverValue}>
              <a href={`tel:${booking.driver.phone}`} style={styles.phoneLink}>
                {booking.driver.phone || 'N/A'}
              </a>
            </span>
          </div>
          <div style={styles.driverRow}>
            <span style={styles.driverLabel}>🚐 Vehicle</span>
            <span style={styles.driverValue}>{booking.driver.vehicleNumber || 'N/A'}</span>
          </div>
          <div style={styles.driverRow}>
            <span style={styles.driverLabel}>⭐ Rating</span>
            <span style={styles.driverValue}>{booking.driver.rating || 'N/A'}</span>
          </div>
        </div>
      )}

      {/* Hospital Info */}
      {booking?.hospital && (
        <div style={styles.hospitalCard}>
          <h3 style={styles.cardTitle}>🏥 Destination</h3>
          <p style={styles.cardText}>{booking.hospital.hospitalName || 'Nearest Hospital'}</p>
          {booking.hospital.bedAvailability && (
            <div style={styles.bedInfo}>
              <span style={styles.bedBadge}>🛏️ General: {booking.hospital.bedAvailability.general || 0}</span>
              <span style={styles.bedBadge}>🏥 ICU: {booking.hospital.bedAvailability.icu || 0}</span>
            </div>
          )}
        </div>
      )}

      {/* OTP Display */}
      {booking && status === 'driver_arrived' && (
        <div style={styles.otpCard}>
          <h3 style={styles.otpTitle}>🔢 Share this OTP with driver</h3>
          <div style={styles.otpDisplay}>{booking.tripOtp || booking.tripOtp || '----'}</div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={styles.actions}>
        <button
          onClick={() => navigate(`/ambulance/trip-sheet/${bookingId}`)}
          style={styles.actionBtn}
          disabled={status !== 'completed'}
        >
          📋 View Trip Sheet
        </button>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to cancel this emergency?')) {
              navigate('/ambulance');
            }
          }}
          style={{ ...styles.actionBtn, background: '#e53935' }}
          disabled={['completed', 'cancelled', 'arrived_hospital'].includes(status)}
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f0f1a',
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto'
  },
  loadingContainer: {
    textAlign: 'center',
    paddingTop: '100px'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #333',
    borderTopColor: '#e53935',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  loadingText: {
    color: '#aaa',
    fontSize: '16px'
  },
  errorContainer: {
    textAlign: 'center',
    paddingTop: '50px'
  },
  errorTitle: {
    color: '#e53935',
    fontSize: '24px'
  },
  errorText: {
    color: '#ccc',
    fontSize: '14px',
    margin: '10px 0'
  },
  backButton: {
    padding: '12px 24px',
    background: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '20px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px'
  },
  headerBack: {
    background: 'none',
    border: 'none',
    color: '#e53935',
    fontSize: '14px',
    cursor: 'pointer'
  },
  headerTitle: {
    color: '#fff',
    fontSize: '20px',
    margin: 0
  },
  headerSpacer: {
    width: '50px'
  },
  statusBanner: {
    background: '#1a1a2e',
    border: '2px solid #2196f3',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  statusIcon: {
    fontSize: '32px'
  },
  statusTitle: {
    fontSize: '16px',
    margin: '0 0 4px 0'
  },
  etaText: {
    color: '#aaa',
    fontSize: '14px',
    margin: 0
  },
  mapContainer: {
    height: '300px',
    background: '#1a1a2e',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '20px',
    position: 'relative'
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    position: 'relative',
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)'
  },
  mapGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  mapLine: {
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    height: '5%'
  },
  mapContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '30px'
  },
  ambulanceMarker: {
    position: 'relative'
  },
  markerIcon: {
    fontSize: '36px'
  },
  markerPulse: {
    position: 'absolute',
    top: '-5px',
    left: '-5px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'rgba(229,57,53,0.3)',
    animation: 'pulse 2s infinite'
  },
  routeLine: {
    flex: 1,
    height: '3px',
    background: 'linear-gradient(90deg, #e53935, #4caf50)',
    margin: '0 10px'
  },
  patientMarker: {
    position: 'relative'
  },
  mapLabel: {
    position: 'absolute',
    bottom: '10px',
    left: '30px',
    color: '#fff',
    fontSize: '12px',
    background: 'rgba(0,0,0,0.7)',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  mapWaiting: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center'
  },
  radar: {
    width: '80px',
    height: '80px',
    border: '3px solid rgba(229,57,53,0.5)',
    borderRadius: '50%',
    animation: 'radar 2s infinite',
    margin: '0 auto 15px'
  },
  mapWaitingText: {
    color: '#aaa',
    fontSize: '14px'
  },
  driverCard: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px'
  },
  driverRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #2a2a4a'
  },
  driverLabel: {
    color: '#aaa',
    fontSize: '14px'
  },
  driverValue: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  phoneLink: {
    color: '#4caf50',
    textDecoration: 'none'
  },
  hospitalCard: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px'
  },
  cardTitle: {
    color: '#fff',
    fontSize: '16px',
    margin: '0 0 8px 0'
  },
  cardText: {
    color: '#ccc',
    fontSize: '14px',
    margin: 0
  },
  bedInfo: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  bedBadge: {
    background: '#2a2a4a',
    color: '#ccc',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px'
  },
  otpCard: {
    background: 'linear-gradient(135deg, #e53935, #c62828)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '20px'
  },
  otpTitle: {
    color: '#fff',
    fontSize: '14px',
    margin: '0 0 10px 0'
  },
  otpDisplay: {
    color: '#fff',
    fontSize: '36px',
    fontWeight: 'bold',
    letterSpacing: '8px'
  },
  actions: {
    display: 'flex',
    gap: '10px'
  },
  actionBtn: {
    flex: 1,
    padding: '14px',
    background: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    cursor: 'pointer'
  }
};

export default LiveTracking;