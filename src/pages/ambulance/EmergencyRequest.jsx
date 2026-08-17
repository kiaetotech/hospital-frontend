import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { emergencyDispatch, getSurgeCheck } from '../../services/api';

const HOLD_DURATION = 3000;
const HOLD_INTERVAL = 50;

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
    ageGroup: 'adult',
    patientPhone: ''
  });

  const [surge, setSurge] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // ============================================================
  // HOLD TIMER REFS
  // ============================================================

  const holdTimerRef = useRef(null);
  const holdStartRef = useRef(null);
  const dispatchStartedRef = useRef(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  // ============================================================
  // GET LOCATION ON PAGE LOAD
  // ============================================================

  useEffect(() => {
    getCurrentLocation();

    return () => {
      stopHoldTimer();
    };
  }, []);

  // ============================================================
  // LOCATION
  // ============================================================

  const getCurrentLocation = () => {
    setError('');

    if (!navigator.geolocation) {
      setError(
        'Geolocation not supported on this device. Please call 108.'
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setLocation({
          lat,
          lng
        });

        checkSurge(lat, lng);
      },
      (geoError) => {
        console.error('Location error:', geoError);

        if (geoError?.code === 1) {
          setError(
            'Location permission denied. Please enable GPS or call 108.'
          );
        } else if (geoError?.code === 2) {
          setError(
            'Unable to determine your location. Please enable GPS or call 108.'
          );
        } else if (geoError?.code === 3) {
          setError(
            'Location request timed out. Please try again or call 108.'
          );
        } else {
          setError(
            'Unable to get location. Please enable GPS or call 108.'
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    );
  };

  // ============================================================
  // SURGE CHECK
  // ============================================================

  const checkSurge = async (lat, lng) => {
    try {
      const res = await getSurgeCheck({
        lat,
        lng
      });

      if (res?.data?.data) {
        setSurge(res.data.data);
      }
    } catch (err) {
      // Surge information is optional.
      // Do not stop emergency functionality if this fails.
      console.warn(
        'Surge check unavailable:',
        err
      );
    }
  };

  // ============================================================
  // HOLD TIMER CLEANUP
  // ============================================================

  const stopHoldTimer = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    holdStartRef.current = null;
  };

  // ============================================================
  // EMERGENCY HOLD START
  // ============================================================

  const handleHoldStart = (event) => {
    if (event) {
      event.preventDefault();
    }

    if (loading || step !== 0) {
      return;
    }

    if (holdTimerRef.current) {
      return;
    }

    setError('');
    setHolding(true);
    setHoldProgress(0);

    holdStartRef.current = Date.now();

    holdTimerRef.current = setInterval(() => {
      if (!holdStartRef.current) {
        return;
      }

      const elapsed =
        Date.now() - holdStartRef.current;

      const progress = Math.min(
        100,
        Math.round(
          (elapsed / HOLD_DURATION) * 100
        )
      );

      setHoldProgress(progress);

      if (elapsed >= HOLD_DURATION) {
        stopHoldTimer();

        setHolding(false);
        setHoldProgress(100);

        // Move to assessment only after the
        // full 3-second hold is completed.
        setStep(1);
      }
    }, HOLD_INTERVAL);
  };

  // ============================================================
  // EMERGENCY HOLD END
  // ============================================================

  const handleHoldEnd = (event) => {
    if (event) {
      event.preventDefault();
    }

    const completed =
      holdProgress >= 100;

    stopHoldTimer();

    setHolding(false);

    if (!completed && step === 0) {
      setHoldProgress(0);
    }
  };

  const handleClickFallback = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      setStep(1);
    }
  };

  // ============================================================
  // TRIAGE CHANGE
  // ============================================================

  const handleTriageChange = (field, value) => {
    setTriage((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // ============================================================
  // GET PATIENT PHONE
  // ============================================================

  const getPatientPhone = () => {
    const possibleKeys = [
      'phone',
      'userPhone',
      'patientPhone',
      'mobile',
      'userMobile'
    ];

    for (const key of possibleKeys) {
      const value =
        localStorage.getItem(key);

      if (
        value &&
        String(value).trim()
      ) {
        return String(value).trim();
      }
    }

    // Check saved user object as fallback.
    const userRaw =
      localStorage.getItem('user');

    if (userRaw) {
      try {
        const user =
          JSON.parse(userRaw);

        const phone =
          user?.phone ||
          user?.mobile ||
          user?.patientPhone;

        if (phone) {
          return String(phone).trim();
        }
      } catch (parseError) {
        console.warn(
          'Unable to read saved user:',
          parseError
        );
      }
    }

    return '';
  };

  // ============================================================
  // EMERGENCY DISPATCH
  // ============================================================

  const handleDispatch = async () => {
    // Prevent duplicate submissions.
    if (
      dispatchStartedRef.current ||
      loading
    ) {
      return;
    }

    if (!location) {
      setError(
        'Location required for emergency dispatch. Please enable GPS or call 108.'
      );
      return;
    }

    dispatchStartedRef.current = true;

    setLoading(true);
    setError('');

    try {
         const patientPhone =
        triage.patientPhone ||
        getPatientPhone();
	      
	if (!patientPhone) {
        setError('Patient phone number is required for emergency dispatch.');
        dispatchStartedRef.current = false;
        setLoading(false);
        return;
      }

      const payload = {
        patientName: 'Emergency Patient',
        patientPhone: patientPhone,
        pickupLat: location.lat,
        pickupLng: location.lng,
        pickupAddress: 'Current GPS Location',
        patientCondition: triage,
        emergencyType: 'blitz'
      };

      console.log(
        '🚨 Emergency dispatch request:',
        payload
      );

      const res =
        await emergencyDispatch(payload);

      console.log(
        '🚨 Emergency dispatch response:',
        res?.data
      );

      if (res?.data?.success) {
        const dispatchResult =
          res.data.data;

        if (!dispatchResult) {
          throw new Error(
            'Emergency dispatch succeeded but no booking information was returned.'
          );
        }

        setResult(dispatchResult);
        setStep(2);
      } else {
        setError(
          res?.data?.message ||
          'No ambulance available. Call 108.'
        );

        dispatchStartedRef.current = false;
      }
    } catch (err) {
      console.error(
        '❌ EMERGENCY DISPATCH ERROR:',
        err
      );

      console.error(
        'Server response:',
        err?.response?.data
      );

      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error;

      setError(
        serverMessage ||
        'Dispatch failed. Please call 108 directly.'
      );

      dispatchStartedRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CALL 108
  // ============================================================

  const call108 = () => {
    window.location.href = 'tel:108';
  };

  // ============================================================
  // STEP 0 - EMERGENCY ACTIVATION
  // ============================================================

  const renderStep0 = () => (
    <div style={styles.container}>

      <div style={styles.header}>
        <h1 style={styles.title}>
          🚨 Emergency
        </h1>

        <p style={styles.subtitle}>
          Press and hold for 3 seconds to activate
        </p>
      </div>

      <div style={styles.buttonContainer}>
        <button
          type="button"
          onPointerDown={handleHoldStart}
	  onClick={handleClickFallback}
          onPointerUp={handleHoldEnd}
          onPointerCancel={handleHoldEnd}
           
          disabled={loading}
          aria-label="Press and hold for emergency ambulance"
          style={{
            ...styles.emergencyButton,

            transform: holding
              ? 'scale(0.95)'
              : 'scale(1)',

            boxShadow: holding
              ? '0 0 60px rgba(229,57,53,0.8)'
              : '0 0 30px rgba(229,57,53,0.5)',

            opacity: loading
              ? 0.7
              : 1
          }}
        >
          <div style={styles.buttonInner}>

            <span style={styles.buttonIcon}>
              🆘
            </span>

            <span style={styles.buttonText}>
              EMERGENCY
            </span>

            <span style={styles.buttonHint}>
              {holding
                ? `${holdProgress}%`
                : 'Press & Hold'}
            </span>

          </div>

          {holding && (
            <div
              style={{
                ...styles.progressRing,
                width: `${holdProgress}%`
              }}
            />
          )}
        </button>
      </div>

      {surge?.surgeActive && (
        <div style={styles.surgeWarning}>
          ⚠️ High demand area. Surge pricing may apply.
        </div>
      )}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <div style={styles.info}>

        <p>
          📍{' '}
          {location
            ? 'Location acquired'
            : 'Acquiring location...'}
        </p>

        <p>
          📞 If no response, call{' '}
          <a
            href="tel:108"
            style={styles.call108}
          >
            108
          </a>{' '}
          directly
        </p>

      </div>

	 <button
        type="button"
        onClick={() => setStep(1)}
        style={{
          marginTop: '20px',
          padding: '12px 20px',
          background: 'none',
          border: '1px solid #e53935',
          borderRadius: '8px',
          color: '#e53935',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Can't hold? Tap here for emergency
      </button>

      <button
        type="button"
        onClick={call108}
        style={styles.callButton}
      >
        📞 Call 108
      </button>

      <button
        type="button"
        onClick={call108}
        style={styles.callButton}
      >
        📞 Call 108
      </button>

      <button
        type="button"
        onClick={() =>
          navigate('/ambulance')
        }
        style={styles.homeButton}
      >
        ← Back to Ambulance
      </button>

    </div>
  );

  // ============================================================
  // STEP 1 - QUICK ASSESSMENT
  // ============================================================

  const renderStep1 = () => (
    <div style={styles.container}>

      <div style={styles.header}>
        <h2 style={styles.title}>
          Quick Assessment
        </h2>

        <p style={styles.subtitle}>
          Help us send the right ambulance
        </p>
      </div>

      <div style={styles.triageForm}>

        {/* BREATHING */}

        <div style={styles.triageGroup}>

          <label style={styles.label}>
            Is the patient breathing?
          </label>

          <div style={styles.toggleGroup}>

            <button
              type="button"
              onClick={() =>
                handleTriageChange(
                  'isBreathing',
                  true
                )
              }
              style={{
                ...styles.toggleBtn,
                background:
                  triage.isBreathing
                    ? '#4caf50'
                    : '#ddd',
                color:
                  triage.isBreathing
                    ? '#fff'
                    : '#333'
              }}
            >
              Yes
            </button>

            <button
              type="button"
              onClick={() =>
                handleTriageChange(
                  'isBreathing',
                  false
                )
              }
              style={{
                ...styles.toggleBtn,
                background:
                  !triage.isBreathing
                    ? '#e53935'
                    : '#ddd',
                color:
                  !triage.isBreathing
                    ? '#fff'
                    : '#333'
              }}
            >
              No
            </button>

          </div>
        </div>

        {/* CONSCIOUS */}

        <div style={styles.triageGroup}>

          <label style={styles.label}>
            Is the patient conscious?
          </label>

          <div style={styles.toggleGroup}>

            <button
              type="button"
              onClick={() =>
                handleTriageChange(
                  'isConscious',
                  true
                )
              }
              style={{
                ...styles.toggleBtn,
                background:
                  triage.isConscious
                    ? '#4caf50'
                    : '#ddd',
                color:
                  triage.isConscious
                    ? '#fff'
                    : '#333'
              }}
            >
              Yes
            </button>

            <button
              type="button"
              onClick={() =>
                handleTriageChange(
                  'isConscious',
                  false
                )
              }
              style={{
                ...styles.toggleBtn,
                background:
                  !triage.isConscious
                    ? '#e53935'
                    : '#ddd',
                color:
                  !triage.isConscious
                    ? '#fff'
                    : '#333'
              }}
            >
              No
            </button>

          </div>
        </div>

        {/* BLEEDING */}

        <div style={styles.triageGroup}>

          <label style={styles.label}>
            Active bleeding?
          </label>

          <div style={styles.toggleGroup}>

            <button
              type="button"
              onClick={() =>
                handleTriageChange(
                  'isBleeding',
                  true
                )
              }
              style={{
                ...styles.toggleBtn,
                background:
                  triage.isBleeding
                    ? '#e53935'
                    : '#ddd',
                color:
                  triage.isBleeding
                    ? '#fff'
                    : '#333'
              }}
            >
              Yes
            </button>

            <button
              type="button"
              onClick={() =>
                handleTriageChange(
                  'isBleeding',
                  false
                )
              }
              style={{
                ...styles.toggleBtn,
                background:
                  !triage.isBleeding
                    ? '#4caf50'
                    : '#ddd',
                color:
                  !triage.isBleeding
                    ? '#fff'
                    : '#333'
              }}
            >
              No
            </button>

          </div>
        </div>

        {/* CHIEF COMPLAINT */}

        <div style={styles.triageGroup}>

          <label style={styles.label}>
            Chief complaint
          </label>

          <input
            type="text"
            value={triage.chiefComplaint}
            onChange={(e) =>
              handleTriageChange(
                'chiefComplaint',
                e.target.value
              )
            }
            placeholder="e.g., Chest pain, Accident, Breathing difficulty"
            style={styles.input}
          />

        </div>

      </div>

	      <div style={styles.triageGroup}>
        <label style={styles.label}>
          Patient Phone Number *
        </label>
        <input
          type="tel"
          value={triage.patientPhone}
          onChange={(e) =>
            handleTriageChange(
              'patientPhone',
              e.target.value
            )
          }
          placeholder="Enter phone number for emergency contact"
          style={styles.input}
        />
      </div> 

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleDispatch}
        disabled={
          loading ||
          !location
        }
        style={{
          ...styles.dispatchBtn,
          opacity:
            loading || !location
              ? 0.6
              : 1,
          cursor:
            loading || !location
              ? 'not-allowed'
              : 'pointer'
        }}
      >
        {loading
          ? '🔄 Dispatching...'
          : '🚑 Dispatch Ambulance Now'}
      </button>

      <button
        type="button"
        onClick={() => {
          if (!loading) {
            setError('');
            setStep(0);
          }
        }}
        disabled={loading}
        style={{
          ...styles.backBtn,
          opacity: loading
            ? 0.5
            : 1
        }}
      >
        ← Back
      </button>

      <button
        type="button"
        onClick={call108}
        style={styles.callButton}
      >
        📞 Call 108 Instead
      </button>

    </div>
  );

  // ============================================================
  // STEP 2 - DISPATCH RESULT
  // ============================================================

  const renderStep2 = () => {

    const bookingId =
      result?.bookingId ||
      result?.booking?._id ||
      result?.booking?.id;

    return (
      <div style={styles.container}>

        <div
          style={{
            ...styles.header,
            background: '#e8f5e9',
            padding: '20px',
            borderRadius: '12px'
          }}
        >
          <h2
            style={{
              ...styles.title,
              color: '#2e7d32'
            }}
          >
            ✅ Ambulance Dispatched!
          </h2>

          <p
            style={{
              color: '#555',
              margin: 0
            }}
          >
            Your emergency request has been accepted.
          </p>
        </div>

        <div style={styles.resultCard}>

          <div style={styles.resultRow}>
            <span>🚑 Driver:</span>

            <strong>
              {result?.driver?.name ||
                'Assigned'}
            </strong>
          </div>

          <div style={styles.resultRow}>
            <span>📞 Contact:</span>

            {result?.driver?.phone ? (
              <a
                href={`tel:${result.driver.phone}`}
                style={styles.phoneLink}
              >
                {result.driver.phone}
              </a>
            ) : (
              <strong>
                N/A
              </strong>
            )}
          </div>

          <div style={styles.resultRow}>
            <span>🚐 Vehicle:</span>

            <strong>
              {result?.driver?.vehicleNumber ||
                'N/A'}
            </strong>
          </div>

          <div style={styles.resultRow}>
            <span>⭐ Rating:</span>

            <strong>
              {result?.driver?.rating ||
                'N/A'}
            </strong>
          </div>

          <div style={styles.resultRow}>
            <span>🔢 OTP:</span>

            <strong
              style={{
                fontSize: '24px',
                color: '#e53935'
              }}
            >
              {result?.tripOtp ||
                'N/A'}
            </strong>
          </div>

        </div>

        {bookingId ? (
          <button
            type="button"
            onClick={() =>
              navigate(
                `/ambulance/tracking/${bookingId}`
              )
            }
            style={styles.trackBtn}
          >
            📍 Track Live Location
          </button>
        ) : (
          <div style={styles.error}>
            Booking ID was not returned by the server.
            Please call 108 if immediate assistance is required.
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            navigate('/')
          }
          style={styles.homeButton}
        >
          🏠 Go Home
        </button>

        <div style={styles.info}>

          <p>
            Share OTP with driver on arrival.
          </p>

          <p>
            Emergency contacts have been notified.
          </p>

        </div>

        <button
          type="button"
          onClick={call108}
          style={styles.callButton}
        >
          📞 Call 108
        </button>

      </div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <div style={styles.page}>

      {step === 0 &&
        renderStep0()}

      {step === 1 &&
        renderStep1()}

      {step === 2 &&
        renderStep2()}

    </div>
  );
};

// ============================================================
// STYLES
// ============================================================

const styles = {

  page: {
    minHeight: '100vh',
    background: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box'
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
    background:
      'linear-gradient(135deg, #e53935, #c62828)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.2s',
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none'
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
    transition: 'width 0.05s linear'
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
    boxSizing: 'border-box',
    outline: 'none'
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
    cursor: 'pointer',
    padding: '10px'
  },

  callButton: {
    width: '100%',
    padding: '13px',
    background: '#fff',
    color: '#c62828',
    border: '2px solid #e53935',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '12px'
  },

  call108: {
    color: '#ff5252',
    fontSize: '18px',
    fontWeight: '900',
    textDecoration: 'underline'
  },

  homeButton: {
    width: '100%',
    padding: '13px',
    background: '#444',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
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
    alignItems: 'center',
    gap: '12px',
    padding: '10px 0',
    borderBottom: '1px solid #2a2a4a',
    color: '#ccc',
    fontSize: '14px'
  },

  phoneLink: {
    color: '#64b5f6',
    fontWeight: 'bold',
    textDecoration: 'underline'
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

