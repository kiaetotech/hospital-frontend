import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActiveEmergency } from '../../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL =
  'https://hospital-backend-production-7d0f.up.railway.app';

const REFRESH_INTERVAL = 5000;

const LiveTracking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const mountedRef = useRef(true);

  // ============================================================
  // COMPONENT LIFECYCLE
  // ============================================================

  useEffect(() => {
    mountedRef.current = true;

    if (!bookingId) {
      setError('Booking ID is missing.');
      setLoading(false);
      return;
    }

    fetchBookingDetails();
    connectWebSocket();

    // Keep API data refreshed as a fallback in case
    // WebSocket events are delayed or disconnected.
    refreshTimerRef.current = setInterval(() => {
      fetchBookingDetails(true);
    }, REFRESH_INTERVAL);

    return () => {
      mountedRef.current = false;

      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      disconnectWebSocket();
    };
  }, [bookingId]);

  // ============================================================
  // FETCH BOOKING DETAILS
  // ============================================================

  const fetchBookingDetails = useCallback(
    async (silent = false) => {
      if (!bookingId) {
        return;
      }

      try {
        if (!silent) {
          setLoading(true);
        }

        const res =
          await getActiveEmergency(bookingId);

        if (!mountedRef.current) {
          return;
        }

        if (res?.data?.success) {
          const data = res.data.data;

          if (!data) {
            setError(
              'Booking information was not returned by the server.'
            );
            return;
          }

          setBooking((previous) => {
            /*
             * Preserve existing driver information if a later
             * API response temporarily does not contain it.
             */
            if (
              previous?.driver &&
              !data.driver
            ) {
              return {
                ...data,
                driver: previous.driver
              };
            }

            return data;
          });

          if (data.status) {
            setStatus(data.status);
          }

          if (data.driver?.location) {
            const location =
              normalizeLocation(
                data.driver.location
              );

            if (location) {
              setDriverLocation(location);
            }
          }

          setLastUpdated(new Date());
          setError('');
        } else {
          setError(
            res?.data?.message ||
            'Unable to load tracking information.'
          );
        }
      } catch (err) {
        console.error(
          'LIVE TRACKING FETCH ERROR:',
          err
        );

        console.error(
          'Response:',
          err?.response?.data
        );

        if (!mountedRef.current) {
          return;
        }

        /*
         * Do not immediately destroy an already-loaded tracking
         * screen because of a temporary 500/network error.
         */
        if (!booking) {
          setError(
            err?.response?.data?.message ||
            'Unable to load tracking information.'
          );
        }
      } finally {
        if (
          mountedRef.current &&
          !silent
        ) {
          setLoading(false);
        }
      }
    },
    [bookingId, booking]
  );

  // ============================================================
  // NORMALIZE LOCATION
  // ============================================================

  const normalizeLocation = (location) => {
    if (!location) {
      return null;
    }

    /*
     * Standard:
     * { lat, lng }
     */
    if (
      location.lat !== undefined &&
      location.lng !== undefined
    ) {
      const lat = Number(location.lat);
      const lng = Number(location.lng);

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      ) {
        return { lat, lng };
      }
    }

    /*
     * GeoJSON:
     * { coordinates: [lng, lat] }
     */
    if (
      Array.isArray(location.coordinates) &&
      location.coordinates.length >= 2
    ) {
      const lng =
        Number(location.coordinates[0]);
      const lat =
        Number(location.coordinates[1]);

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      ) {
        return { lat, lng };
      }
    }

    return null;
  };

  // ============================================================
  // WEBSOCKET CONNECTION
  // ============================================================

  const connectWebSocket = () => {
    if (!bookingId) {
      return;
    }

    /*
     * Prevent duplicate Socket.IO connections.
     */
    disconnectWebSocket();

    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('userToken');

    const socketOptions = {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000
    };

    /*
     * Only send auth token when one exists.
     * This keeps the connection usable for public
     * tracking configurations as well.
     */
    if (token) {
      socketOptions.auth = { token };
    }

    const socket =
      io(SOCKET_URL, socketOptions);

    socketRef.current = socket;

    // ========================================================
    // CONNECT
    // ========================================================

    socket.on('connect', () => {
      console.log(
        '✅ Live tracking Socket.IO connected:',
        socket.id
      );

      if (!mountedRef.current) {
        return;
      }

      setSocketConnected(true);

      socket.emit(
        'patient:track',
        { bookingId },
        (acknowledgement) => {
          if (acknowledgement) {
            console.log(
              'Patient tracking acknowledgement:',
              acknowledgement
            );
          }
        }
      );
    });

    // ========================================================
    // DISCONNECT
    // ========================================================

    socket.on('disconnect', (reason) => {
      console.warn(
        '⚠️ Live tracking Socket.IO disconnected:',
        reason
      );

      if (mountedRef.current) {
        setSocketConnected(false);
      }
    });

    // ========================================================
    // CONNECTION ERROR
    // ========================================================

    socket.on('connect_error', (socketError) => {
      console.error(
        '❌ Live tracking Socket.IO connection error:',
        socketError
      );

      if (mountedRef.current) {
        setSocketConnected(false);
      }

      /*
       * API polling remains active, so a temporary WebSocket
       * problem does not completely stop tracking.
       */
    });

    // ========================================================
    // DRIVER LOCATION
    // ========================================================

    socket.on(
      'driver:location_updated',
      (data) => {
        if (!mountedRef.current || !data) {
          return;
        }

        const newLocation =
          normalizeLocation(data);

        if (!newLocation) {
          console.warn(
            'Invalid driver location received:',
            data
          );
          return;
        }

        /*
         * IMPORTANT:
         * Calculate/update location using the new coordinates.
         * Do not rely on stale React state from the previous
         * render.
         */
        setDriverLocation(newLocation);

        setBooking((previous) => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,
            driver: {
              ...(previous.driver || {}),
              location: newLocation
            }
          };
        });

        /*
         * If the backend provides ETA, use it.
         * Otherwise we leave ETA unchanged because we cannot
         * safely calculate patient distance without a known
         * patient coordinate.
         */
        if (
          data.eta !== undefined &&
          data.eta !== null
        ) {
          const numericEta =
            Number(data.eta);

          if (
            Number.isFinite(numericEta)
          ) {
            setEta(
              Math.max(
                0,
                Math.round(numericEta)
              )
            );
          }
        }

        setLastUpdated(new Date());
      }
    );

    // ========================================================
    // DRIVER ACCEPTED
    // ========================================================

    socket.on(
      'emergency:driver_accepted',
      (data) => {
        console.log(
          '🚑 Driver accepted emergency:',
          data
        );

        if (!mountedRef.current) {
          return;
        }

        setStatus('driver_assigned');

        setBooking((previous) => ({
          ...(previous || {}),
          status: 'driver_assigned',
          driver: {
            ...(previous?.driver || {}),
            ...(data || {})
          }
        }));
      }
    );

    // ========================================================
    // DRIVER EN ROUTE
    // ========================================================

    socket.on(
      'emergency:driver_en_route',
      (data) => {
        console.log(
          '🚑 Driver en route:',
          data
        );

        if (!mountedRef.current) {
          return;
        }

        setStatus('driver_en_route');

        setBooking((previous) => ({
          ...(previous || {}),
          status: 'driver_en_route'
        }));
      }
    );

    // ========================================================
    // DRIVER ARRIVED
    // ========================================================

    socket.on(
      'emergency:driver_arrived',
      (data) => {
        console.log(
          '📍 Driver arrived:',
          data
        );

        if (!mountedRef.current) {
          return;
        }

        setStatus('driver_arrived');

        setBooking((previous) => ({
          ...(previous || {}),
          status: 'driver_arrived'
        }));
      }
    );

    // ========================================================
    // PATIENT ONBOARD
    // ========================================================

    socket.on(
      'emergency:patient_onboard',
      (data) => {
        console.log(
          '🚑 Patient onboard:',
          data
        );

        if (!mountedRef.current) {
          return;
        }

        setStatus('patient_onboard');

        setBooking((previous) => ({
          ...(previous || {}),
          status: 'patient_onboard'
        }));
      }
    );

    // ========================================================
    // ARRIVED HOSPITAL
    // ========================================================

    socket.on(
      'emergency:arrived_hospital',
      (data) => {
        console.log(
          '🏥 Arrived hospital:',
          data
        );

        if (!mountedRef.current) {
          return;
        }

        setStatus('arrived_hospital');

        setBooking((previous) => ({
          ...(previous || {}),
          status: 'arrived_hospital'
        }));
      }
    );

    // ========================================================
    // TRIP COMPLETED
    // ========================================================

    socket.on(
      'emergency:trip_completed',
      (data) => {
        console.log(
          '✅ Emergency trip completed:',
          data
        );

        if (!mountedRef.current) {
          return;
        }

        setStatus('completed');

        setBooking((previous) => ({
          ...(previous || {}),
          status: 'completed'
        }));

        setEta(null);
      }
    );

    // ========================================================
    // CANCELLED
    // ========================================================

    socket.on(
      'emergency:cancelled',
      (data) => {
        console.log(
          '❌ Emergency cancelled:',
          data
        );

        if (!mountedRef.current) {
          return;
        }

        setStatus('cancelled');

        setBooking((previous) => ({
          ...(previous || {}),
          status: 'cancelled'
        }));

        setEta(null);
      }
    );
  };

  // ============================================================
  // DISCONNECT WEBSOCKET
  // ============================================================

  const disconnectWebSocket = () => {
    const socket =
      socketRef.current;

    if (!socket) {
      return;
    }

    try {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');

      socket.off(
        'driver:location_updated'
      );

      socket.off(
        'emergency:driver_accepted'
      );

      socket.off(
        'emergency:driver_en_route'
      );

      socket.off(
        'emergency:driver_arrived'
      );

      socket.off(
        'emergency:patient_onboard'
      );

      socket.off(
        'emergency:arrived_hospital'
      );

      socket.off(
        'emergency:trip_completed'
      );

      socket.off(
        'emergency:cancelled'
      );

      socket.disconnect();
    } catch (err) {
      console.warn(
        'Socket cleanup error:',
        err
      );
    }

    socketRef.current = null;
  };

  // ============================================================
  // DISTANCE CALCULATION
  // ============================================================

  const calculateDistance = (
    lat1,
    lng1,
    lat2,
    lng2
  ) => {
    const nLat1 = Number(lat1);
    const nLng1 = Number(lng1);
    const nLat2 = Number(lat2);
    const nLng2 = Number(lng2);

    if (
      !Number.isFinite(nLat1) ||
      !Number.isFinite(nLng1) ||
      !Number.isFinite(nLat2) ||
      !Number.isFinite(nLng2)
    ) {
      return null;
    }

    const R = 6371;

    const dLat =
      (nLat2 - nLat1) *
      Math.PI /
      180;

    const dLng =
      (nLng2 - nLng1) *
      Math.PI /
      180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(
        nLat1 * Math.PI / 180
      ) *
        Math.cos(
          nLat2 * Math.PI / 180
        ) *
        Math.sin(dLng / 2) ** 2;

    const distance =
      R *
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return Math.round(
      distance * 10
    ) / 10;
  };

  // ============================================================
  // STATUS TEXT
  // ============================================================

  const getStatusText = () => {
    const statusMap = {
      pending:
        '🔍 Searching for nearby ambulances...',

      driver_assigned:
        '✅ Driver assigned - On the way!',

      driver_en_route:
        '🚑 Ambulance is on the way',

      driver_arrived:
        '📍 Ambulance has arrived at your location',

      patient_onboard:
        '🚑 Heading to hospital',

      arrived_hospital:
        '🏥 Arrived at hospital',

      completed:
        '✅ Trip completed',

      cancelled:
        '❌ Emergency booking cancelled',

      no_driver_found:
        '⚠️ No ambulance available'
    };

    return (
      statusMap[status] ||
      'Processing emergency request...'
    );
  };

  // ============================================================
  // STATUS COLOR
  // ============================================================

  const getStatusColor = () => {
    const colorMap = {
      pending: '#2196f3',
      driver_assigned: '#4caf50',
      driver_en_route: '#2196f3',
      driver_arrived: '#ff9800',
      patient_onboard: '#9c27b0',
      arrived_hospital: '#4caf50',
      completed: '#4caf50',
      cancelled: '#e53935',
      no_driver_found: '#e53935'
    };

    return (
      colorMap[status] ||
      '#2196f3'
    );
  };

  // ============================================================
  // STATUS ICON
  // ============================================================

  const getStatusIcon = () => {
    const iconMap = {
      pending: '🔍',
      driver_assigned: '🚑',
      driver_en_route: '🚑',
      driver_arrived: '📍',
      patient_onboard: '🚑',
      arrived_hospital: '🏥',
      completed: '✅',
      cancelled: '❌',
      no_driver_found: '⚠️'
    };

    return (
      iconMap[status] ||
      '🔄'
    );
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const handleManualRefresh = async () => {
    await fetchBookingDetails();
  };

  // ============================================================
  // CANCEL HANDLER
  // ============================================================

  const handleCancel = () => {
    /*
     * IMPORTANT:
     * The existing frontend file did not contain a confirmed
     * backend cancellation API. Therefore this button must NOT
     * falsely claim that the booking was cancelled.
     *
     * We only navigate away after confirmation.
     * The backend/socket remains the source of truth for the
     * actual booking status.
     */

    const confirmed = window.confirm(
      'Leave live tracking? Your emergency booking will not be cancelled by this button.'
    );

    if (confirmed) {
      navigate('/ambulance');
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>

          <div style={styles.spinner} />

          <p style={styles.loadingText}>
            Loading tracking information...
          </p>

        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error && !booking) {
    return (
      <div style={styles.page}>

        <div style={styles.errorContainer}>

          <h2 style={styles.errorTitle}>
            ⚠️ Error
          </h2>

          <p style={styles.errorText}>
            {error}
          </p>

          <button
            type="button"
            onClick={handleManualRefresh}
            style={styles.retryButton}
          >
            🔄 Try Again
          </button>

          <button
            type="button"
            onClick={() =>
              navigate('/ambulance')
            }
            style={styles.backButton}
          >
            ← Back to Ambulance
          </button>

          <a
            href="tel:108"
            style={styles.emergencyCallButton}
          >
            📞 Call 108
          </a>

        </div>

      </div>
    );
  }

  // ============================================================
  // MAIN TRACKING SCREEN
  // ============================================================

  return (
    <div style={styles.page}>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div style={styles.header}>

        <button
          type="button"
          onClick={() =>
            navigate('/ambulance')
          }
          style={styles.headerBack}
        >
          ← Back
        </button>

        <h1 style={styles.headerTitle}>
          Live Tracking
        </h1>

        <button
          type="button"
          onClick={handleManualRefresh}
          style={styles.refreshButton}
          title="Refresh tracking"
          aria-label="Refresh tracking"
        >
          🔄
        </button>

      </div>

      {/* ======================================================
          CONNECTION STATUS
      ====================================================== */}

      <div
        style={{
          ...styles.connectionBanner,
          background:
            socketConnected
              ? '#0f3d2e'
              : '#3d2f0f',
          color:
            socketConnected
              ? '#81c784'
              : '#ffcc80'
        }}
      >
        <span>
          {socketConnected
            ? '🟢 Live connection active'
            : '🟡 Reconnecting / using automatic refresh'}
        </span>

        {lastUpdated && (
          <span style={styles.updatedText}>
            Updated{' '}
            {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* ======================================================
          STATUS BANNER
      ====================================================== */}

      <div
        style={{
          ...styles.statusBanner,
          borderColor:
            getStatusColor()
        }}
      >

        <span style={styles.statusIcon}>
          {getStatusIcon()}
        </span>

        <div style={styles.statusContent}>

          <h2
            style={{
              ...styles.statusTitle,
              color:
                getStatusColor()
            }}
          >
            {getStatusText()}
          </h2>

          {eta !== null && (
            <p style={styles.etaText}>
              Estimated arrival: {eta} minutes
            </p>
          )}

        </div>

      </div>

      {/* ======================================================
          GENERAL ERROR WHILE DATA EXISTS
      ====================================================== */}

      {error && booking && (
        <div style={styles.warningBanner}>
          ⚠️ {error}
        </div>
      )}

      {/* ======================================================
          MAP / TRACKING AREA
      ====================================================== */}

      <div
        style={styles.mapContainer}
      >

        <div
          style={styles.mapPlaceholder}
        >

          <div style={styles.mapGrid}>
            {[...Array(20)].map(
              (_, index) => (
                <div
                  key={index}
                  style={styles.mapLine}
                />
              )
            )}
          </div>

          {driverLocation ? (
            <div style={styles.mapContent}>

              <div
                style={styles.ambulanceMarker}
              >
                <span
                  style={styles.markerIcon}
                >
                  🚑
                </span>

                <div
                  style={styles.markerPulse}
                />
              </div>

              <div
                style={styles.routeLine}
              />

              <div
                style={styles.patientMarker}
              >
                <span
                  style={styles.markerIcon}
                >
                  📍
                </span>
              </div>

              <div
                style={styles.mapLabel}
              >
                Ambulance
              </div>

              <div
                style={{
                  ...styles.mapLabel,
                  left: 'auto',
                  right: '30px'
                }}
              >
                Your Location
              </div>

            </div>
          ) : (
            <div
              style={styles.mapWaiting}
            >

              <div
                style={styles.radar}
              />

              <p
                style={styles.mapWaitingText}
              >
                {status === 'pending'
                  ? 'Searching for ambulance...'
                  : 'Acquiring ambulance location...'}
              </p>

            </div>
          )}

        </div>
      </div>

      {/* ======================================================
          DRIVER INFO
      ====================================================== */}

      {booking?.driver && (
        <div style={styles.driverCard}>

          <h3 style={styles.cardTitle}>
            🚑 Ambulance & Driver
          </h3>

          <div style={styles.driverRow}>
            <span style={styles.driverLabel}>
              👨‍✈️ Driver
            </span>

            <span style={styles.driverValue}>
              {booking.driver.name ||
                'N/A'}
            </span>
          </div>

          <div style={styles.driverRow}>
            <span style={styles.driverLabel}>
              📞 Contact
            </span>

            <span style={styles.driverValue}>

              {booking.driver.phone ? (
                <a
                  href={`tel:${booking.driver.phone}`}
                  style={styles.phoneLink}
                >
                  {booking.driver.phone}
                </a>
              ) : (
                'N/A'
              )}

            </span>
          </div>

          <div style={styles.driverRow}>
            <span style={styles.driverLabel}>
              🚐 Vehicle
            </span>

            <span style={styles.driverValue}>
              {booking.driver.vehicleNumber ||
                booking.driver.vehicle ||
                'N/A'}
            </span>
          </div>

          <div style={styles.driverRow}>
            <span style={styles.driverLabel}>
              ⭐ Rating
            </span>

            <span style={styles.driverValue}>
              {booking.driver.rating !== undefined &&
              booking.driver.rating !== null
                ? booking.driver.rating
                : 'N/A'}
            </span>
          </div>

          {driverLocation && (
            <div style={styles.locationRow}>
              📍 Driver GPS:
              <span style={styles.locationValue}>
                {driverLocation.lat.toFixed(6)},
                {' '}
                {driverLocation.lng.toFixed(6)}
              </span>
            </div>
          )}

        </div>
      )}

      {/* ======================================================
          HOSPITAL INFO
      ====================================================== */}

      {booking?.hospital && (
        <div style={styles.hospitalCard}>

          <h3 style={styles.cardTitle}>
            🏥 Destination
          </h3>

          <p style={styles.cardText}>
            {booking.hospital.hospitalName ||
              'Nearest Hospital'}
          </p>

          {booking.hospital
            .bedAvailability && (
            <div style={styles.bedInfo}>

              <span
                style={styles.bedBadge}
              >
                🛏️ General:{' '}
                {booking.hospital
                  .bedAvailability
                  .general || 0}
              </span>

              <span
                style={styles.bedBadge}
              >
                🏥 ICU:{' '}
                {booking.hospital
                  .bedAvailability
                  .icu || 0}
              </span>

            </div>
          )}

        </div>
      )}

      {/* ======================================================
          OTP
      ====================================================== */}

      {booking &&
        status === 'driver_arrived' && (
          <div style={styles.otpCard}>

            <h3 style={styles.otpTitle}>
              🔢 Share this OTP with driver
            </h3>

            <div style={styles.otpDisplay}>
              {booking.tripOtp ||
                '----'}
            </div>

            <p style={styles.otpWarning}>
              Only share this OTP with the
              assigned ambulance driver.
            </p>

          </div>
        )}

      {/* ======================================================
          COMPLETED MESSAGE
      ====================================================== */}

      {status === 'completed' && (
        <div style={styles.completedCard}>

          <div style={styles.completedIcon}>
            ✅
          </div>

          <h3 style={styles.completedTitle}>
            Trip Completed
          </h3>

          <p style={styles.completedText}>
            The ambulance trip has been completed.
          </p>

        </div>
      )}

      {/* ======================================================
          CANCELLED MESSAGE
      ====================================================== */}

      {status === 'cancelled' && (
        <div style={styles.cancelledCard}>

          <div style={styles.cancelledIcon}>
            ❌
          </div>

          <h3 style={styles.cancelledTitle}>
            Booking Cancelled
          </h3>

          <p style={styles.cancelledText}>
            This emergency booking has been cancelled.
          </p>

        </div>
      )}

      {/* ======================================================
          NO DRIVER
      ====================================================== */}

      {status === 'no_driver_found' && (
        <div style={styles.noDriverCard}>

          <div style={styles.noDriverIcon}>
            ⚠️
          </div>

          <h3 style={styles.noDriverTitle}>
            No Ambulance Available
          </h3>

          <p style={styles.noDriverText}>
            We could not find an available ambulance.
          </p>

          <a
            href="tel:108"
            style={styles.emergencyCallButton}
          >
            📞 Call 108
          </a>

        </div>
      )}

      {/* ======================================================
          ACTION BUTTONS
      ====================================================== */}

      <div style={styles.actions}>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/ambulance/trip-sheet/${bookingId}`
            )
          }
          style={{
            ...styles.actionBtn,
            opacity:
              status === 'completed'
                ? 1
                : 0.5,
            cursor:
              status === 'completed'
                ? 'pointer'
                : 'not-allowed'
          }}
          disabled={
            status !== 'completed'
          }
        >
          📋 View Trip Sheet
        </button>

        <button
          type="button"
          onClick={handleCancel}
          style={{
            ...styles.actionBtn,
            background: '#e53935'
          }}
          disabled={[
            'completed',
            'cancelled',
            'arrived_hospital'
          ].includes(status)}
        >
          ← Leave Tracking
        </button>

      </div>

      {/* ======================================================
          EMERGENCY PHONE
      ====================================================== */}

      {![
        'completed',
        'cancelled'
      ].includes(status) && (
        <a
          href="tel:108"
          style={styles.bottomEmergencyButton}
        >
          📞 Call 108 for Emergency Assistance
        </a>
      )}

    </div>
  );
};

// ============================================================
// STYLES
// ============================================================

const styles = {

  page: {
    minHeight: '100vh',
    background: '#0f0f1a',
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto',
    boxSizing: 'border-box'
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
    margin: '10px 0 20px'
  },

  backButton: {
    display: 'block',
    width: '100%',
    padding: '12px 24px',
    background: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '12px'
  },

  retryButton: {
    display: 'block',
    width: '100%',
    padding: '12px 24px',
    background: '#2196f3',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '20px'
  },

  emergencyCallButton: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px 18px',
    background: '#e53935',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    marginTop: '12px'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },

  headerBack: {
    background: 'none',
    border: 'none',
    color: '#e53935',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '8px 0'
  },

  headerTitle: {
    color: '#fff',
    fontSize: '20px',
    margin: 0
  },

  refreshButton: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#1a1a2e',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '16px'
  },

  connectionBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    borderRadius: '8px',
    padding: '8px 10px',
    marginBottom: '12px',
    fontSize: '11px'
  },

  updatedText: {
    opacity: 0.8
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
    fontSize: '32px',
    flexShrink: 0
  },

  statusContent: {
    flex: 1
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

  warningBanner: {
    background: '#3d2f0f',
    color: '#ffcc80',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '12px',
    marginBottom: '15px'
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
    background:
      'linear-gradient(135deg, #1a1a2e, #16213e)'
  },

  mapGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },

  mapLine: {
    borderBottom:
      '1px solid rgba(255,255,255,0.05)',
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
    position: 'relative',
    zIndex: 2
  },

  markerIcon: {
    fontSize: '36px',
    position: 'relative',
    zIndex: 2
  },

  markerPulse: {
    position: 'absolute',
    top: '-5px',
    left: '-5px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background:
      'rgba(229,57,53,0.3)',
    animation:
      'pulse 2s infinite'
  },

  routeLine: {
    flex: 1,
    height: '3px',
    background:
      'linear-gradient(90deg, #e53935, #4caf50)',
    margin: '0 10px'
  },

  patientMarker: {
    position: 'relative',
    zIndex: 2
  },

  mapLabel: {
    position: 'absolute',
    bottom: '10px',
    left: '30px',
    color: '#fff',
    fontSize: '12px',
    background:
      'rgba(0,0,0,0.7)',
    padding: '4px 8px',
    borderRadius: '4px'
  },

  mapWaiting: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform:
      'translate(-50%, -50%)',
    textAlign: 'center',
    width: '90%'
  },

  radar: {
    width: '80px',
    height: '80px',
    border:
      '3px solid rgba(229,57,53,0.5)',
    borderRadius: '50%',
    animation:
      'radar 2s infinite',
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
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    borderBottom:
      '1px solid #2a2a4a'
  },

  driverLabel: {
    color: '#aaa',
    fontSize: '14px'
  },

  driverValue: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'right'
  },

  locationRow: {
    color: '#aaa',
    fontSize: '12px',
    paddingTop: '12px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px'
  },

  locationValue: {
    color: '#81c784',
    fontFamily:
      'monospace'
  },

  phoneLink: {
    color: '#4caf50',
    textDecoration: 'none',
    fontWeight: 'bold'
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
    marginTop: '10px',
    flexWrap: 'wrap'
  },

  bedBadge: {
    background: '#2a2a4a',
    color: '#ccc',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px'
  },

  otpCard: {
    background:
      'linear-gradient(135deg, #e53935, #c62828)',
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

  otpWarning: {
    color:
      'rgba(255,255,255,0.8)',
    fontSize: '11px',
    margin:
      '10px 0 0 0'
  },

  completedCard: {
    background: '#0f3d2e',
    border:
      '1px solid #4caf50',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '20px'
  },

  completedIcon: {
    fontSize: '40px'
  },

  completedTitle: {
    color: '#81c784',
    margin:
      '8px 0'
  },

  completedText: {
    color: '#aaa',
    fontSize: '13px',
    margin: 0
  },

  cancelledCard: {
    background: '#3d1515',
    border:
      '1px solid #e53935',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '20px'
  },

  cancelledIcon: {
    fontSize: '40px'
  },

  cancelledTitle: {
    color: '#ef9a9a',
    margin:
      '8px 0'
  },

  cancelledText: {
    color: '#aaa',
    fontSize: '13px',
    margin: 0
  },

  noDriverCard: {
    background: '#3d2f0f',
    border:
      '1px solid #ff9800',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '20px'
  },

  noDriverIcon: {
    fontSize: '40px'
  },

  noDriverTitle: {
    color: '#ffcc80',
    margin:
      '8px 0'
  },

  noDriverText: {
    color: '#aaa',
    fontSize: '13px',
    margin: 0
  },

  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
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
  },

  bottomEmergencyButton: {
    display: 'block',
    textAlign: 'center',
    padding: '13px',
    background: '#e53935',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    marginTop: '15px'
  }
};

export default LiveTracking;

