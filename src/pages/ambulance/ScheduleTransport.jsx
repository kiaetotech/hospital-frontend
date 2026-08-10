import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { scheduleTransport } from '../../services/api';

const ScheduleTransport = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingAmbulances, setLoadingAmbulances] = useState(false);

  const [availableAmbulances, setAvailableAmbulances] = useState([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);

  const [fareEstimate, setFareEstimate] = useState(null);

  const [form, setForm] = useState({
    patientName: '',
    patientPhone: '',
    patientAge: '',
    patientGender: 'male',

    pickupAddress: '',
    pickupLat: '',
    pickupLng: '',

    destinationAddress: '',
    destinationLat: '',
    destinationLng: '',

    hospitalName: '',

    ambulanceType: 'basic',

    // IMPORTANT:
    // These come from the provider/vehicle selected by patient.
    providerId: '',
    vehicleId: '',

    scheduledDate: '',
    scheduledTime: '10:00',

    requiresOxygen: false,
    requiresAttendant: false,
    mobilityType: 'walking',

    specialRequirements: '',

    isRecurring: false,
    recurringDays: []
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mobilityTypes = [
    { value: 'walking', label: '🚶 Walking' },
    { value: 'wheelchair', label: '♿ Wheelchair' },
    { value: 'stretcher', label: '🛏️ Stretcher' }
  ];

  const weekDays = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ];

  // ============================================
  // GET AVAILABLE AMBULANCES
  // ============================================

  useEffect(() => {
    if (
      form.pickupLat &&
      form.pickupLng
    ) {
      fetchAvailableAmbulances();
    }
  }, [form.pickupLat, form.pickupLng]);

  const fetchAvailableAmbulances = async () => {
    try {
      setLoadingAmbulances(true);
      console.log('SEARCHING with:', { lat: form.pickupLat, lng: form.pickupLng });
      setError('');

      const res = await api.get('/ambulance/search', {
    params: {
      lat: form.pickupLat,
      lng: form.pickupLng,
      radius: 25,
      type: form.ambulanceType || 'all',
      limit: 20
    }
  });

      const ambulances = res.data?.data || [];

      setAvailableAmbulances(ambulances);

      // Do not automatically choose a vehicle.
      // Patient must select the provider/vehicle.
      if (ambulances.length === 0) {
        setSelectedAmbulance(null);

        setForm(prev => ({
          ...prev,
          providerId: '',
          vehicleId: ''
        }));
      }

    } catch (err) {
      console.error(
        'Failed to load available ambulances:',
        err
      );

      setAvailableAmbulances([]);
      setSelectedAmbulance(null);

      setForm(prev => ({
        ...prev,
        providerId: '',
        vehicleId: ''
      }));

      setError(
        'Unable to load available ambulances. Please try again.'
      );
    } finally {
      setLoadingAmbulances(false);
    }
  };

  // ============================================
  // SELECT PROVIDER / VEHICLE
  // ============================================

  const selectAmbulance = (ambulance) => {
    setSelectedAmbulance(ambulance);

    setForm(prev => ({
      ...prev,

      providerId:
        ambulance.providerId || '',

      vehicleId:
        ambulance.vehicleId || '',

      ambulanceType:
        ambulance.vehicleType ||
        'basic'
    }));

    // Calculate displayed estimate using
    // PROVIDER'S actual saved pricing.
    calculateProviderFare(ambulance);
  };

  // ============================================
  // DISTANCE CALCULATION
  // ============================================

  const calculateDistance = (
    lat1,
    lng1,
    lat2,
    lng2
  ) => {
    if (
      !Number.isFinite(lat1) ||
      !Number.isFinite(lng1) ||
      !Number.isFinite(lat2) ||
      !Number.isFinite(lng2)
    ) {
      return 0;
    }

    const R = 6371;

    const dLat =
      (lat2 - lat1) *
      Math.PI /
      180;

    const dLng =
      (lng2 - lng1) *
      Math.PI /
      180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;

    return Math.round(
      R *
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      ) *
      100
    ) / 100;
  };

  // ============================================
  // PROVIDER FARE DISPLAY
  //
  // This is ONLY for displaying an estimate.
  // Backend remains the final source of truth.
  // ============================================

  const calculateProviderFare = (ambulance) => {
    if (!ambulance) {
      setFareEstimate(null);
      return;
    }

    // IMPORTANT:
    // Pricing must come from the selected provider/vehicle.
    // Never use frontend dummy/default prices.
    const pricing = ambulance.pricing || {};

    const baseFare = Number(
      pricing.baseFare ?? ambulance.baseFare
    );

    const perKmRate = Number(
      pricing.perKmRate ??
      ambulance.perKmRate ??
      ambulance.pricePerKm
    );

    const nightCharge = Number(
      pricing.nightCharge ??
      ambulance.nightCharge ??
      0
    );

    if (
      !Number.isFinite(baseFare) ||
      !Number.isFinite(perKmRate) ||
      baseFare < 0 ||
      perKmRate < 0
    ) {
      setFareEstimate(null);
      return;
    }

    const pickupLat =
      Number(form.pickupLat);

    const pickupLng =
      Number(form.pickupLng);

    const destinationLat =
      Number(form.destinationLat);

    const destinationLng =
      Number(form.destinationLng);

    // A reliable provider fare requires both pickup and destination
    // coordinates. Do not silently calculate a zero-distance fare.
    if (
      !Number.isFinite(pickupLat) ||
      !Number.isFinite(pickupLng) ||
      !Number.isFinite(destinationLat) ||
      !Number.isFinite(destinationLng)
    ) {
      setFareEstimate(null);
      return;
    }

    const distance =
      calculateDistance(
        pickupLat,
        pickupLng,
        destinationLat,
        destinationLng
      );

    let appliedNightCharge = 0;

    if (form.scheduledTime) {
      const hour =
        Number(
          form.scheduledTime
            .split(':')[0]
        );

      if (
        (hour >= 22 || hour < 6) &&
        Number.isFinite(nightCharge)
      ) {
        appliedNightCharge =
          nightCharge;
      }
    }

    const distanceCharge =
      distance * perKmRate;

    const total =
      baseFare +
      distanceCharge +
      appliedNightCharge;

    setFareEstimate({
      baseFare,
      perKmRate,
      distanceKm: distance,
      distanceCharge,
      nightCharge: appliedNightCharge,
      total:
        Math.round(total * 100) / 100
    });
  };

  // Recalculate displayed fare when
  // destination/time changes.
  useEffect(() => {
    if (selectedAmbulance) {
      calculateProviderFare(
        selectedAmbulance
      );
    }
  }, [
    form.destinationLat,
    form.destinationLng,
    form.scheduledTime
  ]);

  // ============================================
  // CURRENT LOCATION
  // ============================================

  const getCurrentLocation = (type) => {
    if (!navigator.geolocation) {
      setError(
        'Geolocation is not supported by your browser.'
      );
      return;
    }

    setError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat =
          pos.coords.latitude.toString();

        const lng =
          pos.coords.longitude.toString();

        if (type === 'pickup') {
          setForm(prev => ({
            ...prev,
            pickupLat: lat,
            pickupLng: lng,
            pickupAddress:
              'Current Location'
          }));
        } else {
          setForm(prev => ({
            ...prev,
            destinationLat: lat,
            destinationLng: lng
          }));
        }
      },

      () => {
        setError(
          'Unable to get your location.'
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  };

  // ============================================
  // FORM CHANGE
  // ============================================

  const handleChange = (
    field,
    value
  ) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));

    if (
      field === 'pickupLat' ||
      field === 'pickupLng'
    ) {
      setSelectedAmbulance(null);

      setFareEstimate(null);

      setForm(prev => ({
        ...prev,
        providerId: '',
        vehicleId: ''
      }));
    }
  };

  // ============================================
  // RECURRING DAYS
  // ============================================

  const toggleRecurringDay = (day) => {
    setForm(prev => ({
      ...prev,

      recurringDays:
        prev.recurringDays.includes(day)
          ? prev.recurringDays.filter(
              d => d !== day
            )
          : [
              ...prev.recurringDays,
              day
            ]
    }));
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    // ------------------------------------------
    // REQUIRED FIELDS
    // ------------------------------------------

    if (
      !form.patientName ||
      !form.patientPhone ||
      !form.scheduledDate
    ) {
      setError(
        'Please fill in all required patient and schedule fields.'
      );

      setLoading(false);
      return;
    }

    if (
      !form.pickupAddress
    ) {
      setError(
        'Please enter the pickup address.'
      );

      setLoading(false);
      return;
    }

    if (
      !form.destinationAddress
    ) {
      setError(
        'Please enter the destination address.'
      );

      setLoading(false);
      return;
    }

    if (
      !form.pickupLat ||
      !form.pickupLng ||
      !form.destinationLat ||
      !form.destinationLng
    ) {
      setError(
        'Please select valid pickup and destination locations before scheduling.'
      );

      setLoading(false);
      return;
    }

    // ------------------------------------------
    // PROVIDER / VEHICLE REQUIRED
    // ------------------------------------------

    if (!form.providerId) {
      setError(
        'Please select an available ambulance provider.'
      );

      setLoading(false);
      return;
    }

    if (!form.vehicleId) {
      setError(
        'Please select an ambulance vehicle.'
      );

      setLoading(false);
      return;
    }

    if (!selectedAmbulance) {
      setError(
        'Please select the ambulance whose pricing you want to use.'
      );

      setLoading(false);
      return;
    }

    // Provider pricing is required for a production booking.
    // The backend must independently validate the same pricing from DB.
    const selectedPricing = selectedAmbulance.pricing || {};
    const selectedBaseFare = Number(
      selectedPricing.baseFare ?? selectedAmbulance.baseFare
    );
    const selectedPerKmRate = Number(
      selectedPricing.perKmRate ??
      selectedAmbulance.perKmRate ??
      selectedAmbulance.pricePerKm
    );

    if (
      !Number.isFinite(selectedBaseFare) ||
      !Number.isFinite(selectedPerKmRate) ||
      selectedBaseFare < 0 ||
      selectedPerKmRate < 0
    ) {
      setError(
        'The selected ambulance provider has not configured valid pricing. Please choose another ambulance or ask the provider to update pricing.'
      );

      setLoading(false);
      return;
    }

    // ------------------------------------------
    // SUBMIT EXACTLY THE SELECTED VEHICLE
    // ------------------------------------------

    try {
      const bookingData = {
        ...form,

        providerId:
          form.providerId,

        vehicleId:
          form.vehicleId,

        // These are identifiers only. The backend must fetch the authoritative
        // provider/vehicle pricing from MongoDB and must not trust client prices.
        selectedProviderId:
          selectedAmbulance.providerId || form.providerId,

        selectedVehicleId:
          selectedAmbulance.vehicleId || form.vehicleId
      };

      const res =
        await scheduleTransport(
          bookingData
        );

      if (res.data?.success) {
  const bookingId = res.data?.data?.bookingId || '';

  setSuccess(
    'Ambulance scheduled successfully! Booking ID: ' + bookingId
  );

        setTimeout(() => {
          navigate('/ambulance');
        }, 2500);

      } else {
        setError(
          res.data?.error ||
          res.data?.message ||
          'Failed to schedule ambulance.'
        );
      }

    } catch (err) {
      console.error(
        'SCHEDULE TRANSPORT ERROR:',
        err
      );

      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to schedule transport. Please try again.'
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <button
          onClick={() =>
            navigate('/ambulance')
          }
          style={styles.backBtn}
        >
          ← Back
        </button>

        <h1 style={styles.title}>
          📅 Schedule Transport
        </h1>

        <div style={{ width: '50px' }} />
      </div>

      <p style={styles.subtitle}>
        Book a non-emergency ambulance in advance
      </p>

      <form
        onSubmit={handleSubmit}
        style={styles.form}
      >

        {/* =====================================
            PATIENT DETAILS
        ====================================== */}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            👤 Patient Details
          </h3>

          <input
            type="text"
            placeholder="Patient Name *"
            value={form.patientName}
            onChange={(e) =>
              handleChange(
                'patientName',
                e.target.value
              )
            }
            style={styles.input}
            required
          />

          <div style={styles.row}>
            <input
              type="tel"
              placeholder="Phone Number *"
              value={form.patientPhone}
              onChange={(e) =>
                handleChange(
                  'patientPhone',
                  e.target.value
                )
              }
              style={{
                ...styles.input,
                flex: 1
              }}
              required
            />

            <input
              type="number"
              placeholder="Age"
              value={form.patientAge}
              onChange={(e) =>
                handleChange(
                  'patientAge',
                  e.target.value
                )
              }
              style={{
                ...styles.input,
                width: '80px'
              }}
            />
          </div>

          <select
            value={form.patientGender}
            onChange={(e) =>
              handleChange(
                'patientGender',
                e.target.value
              )
            }
            style={styles.select}
          >
            <option value="male">
              Male
            </option>

            <option value="female">
              Female
            </option>

            <option value="other">
              Other
            </option>
          </select>
        </div>

        {/* =====================================
            PICKUP
        ====================================== */}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            📍 Pickup Location
          </h3>

          <input
            type="text"
            placeholder="Pickup Address *"
            value={form.pickupAddress}
            onChange={(e) =>
              handleChange(
                'pickupAddress',
                e.target.value
              )
            }
            style={styles.input}
            required
          />

          <button
            type="button"
            onClick={() =>
              getCurrentLocation(
                'pickup'
              )
            }
            style={styles.locationBtn}
          >
            📍 Use Current Location
          </button>

          {form.pickupLat && (
            <p style={styles.coords}>
              Coordinates:
              {' '}
              {form.pickupLat},
              {' '}
              {form.pickupLng}
            </p>
          )}
        </div>

        {/* =====================================
            DESTINATION
        ====================================== */}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            🏥 Destination
          </h3>

          <input
            type="text"
            placeholder="Hospital Name"
            value={form.hospitalName}
            onChange={(e) =>
              handleChange(
                'hospitalName',
                e.target.value
              )
            }
            style={styles.input}
          />

          <input
            type="text"
            placeholder="Destination Address *"
            value={form.destinationAddress}
            onChange={(e) =>
              handleChange(
                'destinationAddress',
                e.target.value
              )
            }
            style={styles.input}
            required
          />

                    <button
            type="button"
            onClick={() =>
              getCurrentLocation(
                'destination'
              )
            }
            style={styles.locationBtn}
          >
            📍 Use Current Location
          </button>

          <div style={styles.row}>
            <input
              type="text"
              placeholder="Latitude"
              value={form.destinationLat}
              onChange={(e) =>
                handleChange(
                  'destinationLat',
                  e.target.value
                )
              }
              style={{...styles.input, flex: 1}}
            />
            <input
              type="text"
              placeholder="Longitude"
              value={form.destinationLng}
              onChange={(e) =>
                handleChange(
                  'destinationLng',
                  e.target.value
                )
              }
              style={{...styles.input, flex: 1}}
            />
          </div>

          {form.destinationLat && (
            <p style={styles.coords}>
              Coordinates:
              {' '}
              {form.destinationLat},
              {' '}
              {form.destinationLng}
            </p>
          )}
        </div>

        {/* =====================================
            DATE & TIME
        ====================================== */}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            📅 Date & Time
          </h3>

          <div style={styles.row}>
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(e) =>
                handleChange(
                  'scheduledDate',
                  e.target.value
                )
              }
              style={{
                ...styles.input,
                flex: 1
              }}
              min={
                new Date()
                  .toISOString()
                  .split('T')[0]
              }
              required
            />

            <input
              type="time"
              value={form.scheduledTime}
              onChange={(e) =>
                handleChange(
                  'scheduledTime',
                  e.target.value
                )
              }
              style={{
                ...styles.input,
                width: '120px'
              }}
            />
          </div>
        </div>

        {/* =====================================
            AVAILABLE AMBULANCES
        ====================================== */}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            🚑 Available Ambulances
          </h3>

          {!form.pickupLat ||
          !form.pickupLng ? (
            <p style={styles.infoText}>
              Please select your pickup
              location first to find
              available ambulances.
            </p>
          ) : loadingAmbulances ? (
            <p style={styles.infoText}>
              🔄 Finding available
              ambulances near you...
            </p>
          ) : availableAmbulances.length === 0 ? (
            <div style={styles.warningBox}>
              <strong>
                No available ambulance
                found nearby.
              </strong>

              <p style={{ margin: '8px 0 0' }}>
                Please try again or choose
                Emergency Ambulance if this
                is an emergency.
              </p>

              <button
                type="button"
                onClick={
                  fetchAvailableAmbulances
                }
                style={styles.retryBtn}
              >
                🔄 Search Again
              </button>
            </div>
          ) : (
            <div>
              {availableAmbulances.map(
                (ambulance, index) => {

                  const isSelected =
                    selectedAmbulance?.vehicleId ===
                    ambulance.vehicleId;

                  const pricing =
                    ambulance.pricing || {};

                  return (
                    <button
                      key={
                        ambulance.vehicleId ||
                        ambulance.driverId ||
                        index
                      }
                      type="button"
                      onClick={() =>
                        selectAmbulance(
                          ambulance
                        )
                      }
                      style={{
                        ...styles.ambulanceCard,
                        borderColor:
                          isSelected
                            ? '#e53935'
                            : '#333',

                        background:
                          isSelected
                            ? 'rgba(229,57,53,0.12)'
                            : '#0f0f1a'
                      }}
                    >
                      <div
                        style={
                          styles.ambulanceHeader
                        }
                      >
                        <strong>
                          🚑{' '}
                          {ambulance.vehicleType ||
                            'Ambulance'}
                        </strong>

                        {isSelected && (
                          <span
                            style={
                              styles.selectedBadge
                            }
                          >
                            SELECTED
                          </span>
                        )}
                      </div>

                      <div
                        style={
                          styles.ambulanceDetails
                        }
                      >
                        <div>
                          <strong>
                            Vehicle:
                          </strong>{' '}
                          {ambulance.vehicleNumber ||
                            'Not available'}
                        </div>

                        <div>
                          <strong>
                            Driver:
                          </strong>{' '}
                          {ambulance.driverName ||
                            'Not assigned'}
                        </div>

                        <div>
                          <strong>
                            Distance:
                          </strong>{' '}
                          {ambulance.distance ??
                            'N/A'} km
                        </div>

                        <div>
                          <strong>
                            ETA:
                          </strong>{' '}
                          {ambulance.estimatedETA ??
                            'N/A'} min
                        </div>
                      </div>

                      {/* PROVIDER PRICE */}
                      <div
                        style={
                          styles.pricingBox
                        }
                      >
                        {Number.isFinite(
                          Number(
                            pricing.baseFare ??
                            ambulance.baseFare
                          )
                        ) &&
                        Number.isFinite(
                          Number(
                            pricing.perKmRate ??
                            ambulance.perKmRate ??
                            ambulance.pricePerKm
                          )
                        ) ? (
                          <>
                            <div>
                              Provider fare
                            </div>

                            <strong>
                              ₹
                              {Number(
                                pricing.baseFare ??
                                ambulance.baseFare
                              ).toFixed(2)}
                            </strong>

                            <div>
                              + ₹
                              {Number(
                                pricing.perKmRate ??
                                ambulance.perKmRate ??
                                ambulance.pricePerKm
                              ).toFixed(2)}
                              /km
                            </div>
                          </>
                        ) : (
                          <div style={{ color: '#ffb74d' }}>
                            Provider pricing unavailable
                          </div>
                        )}
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* =====================================
            REQUIREMENTS
        ====================================== */}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            ⚙️ Requirements
          </h3>

          <div style={styles.checkboxRow}>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={
                  form.requiresOxygen
                }
                onChange={(e) =>
                  handleChange(
                    'requiresOxygen',
                    e.target.checked
                  )
                }
              />

              🫁 Oxygen Support
            </label>

            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={
                  form.requiresAttendant
                }
                onChange={(e) =>
                  handleChange(
                    'requiresAttendant',
                    e.target.checked
                  )
                }
              />

              👨‍⚕️ Medical Attendant
            </label>
          </div>

          <select
            value={form.mobilityType}
            onChange={(e) =>
              handleChange(
                'mobilityType',
                e.target.value
              )
            }
            style={styles.select}
          >
            {mobilityTypes.map(
              mobility => (
                <option
                  key={mobility.value}
                  value={mobility.value}
                >
                  {mobility.label}
                </option>
              )
            )}
          </select>

          <textarea
            placeholder="Special requirements or instructions..."
            value={
              form.specialRequirements
            }
            onChange={(e) =>
              handleChange(
                'specialRequirements',
                e.target.value
              )
            }
            style={styles.textarea}
            rows={3}
          />
        </div>

        {/* =====================================
            RECURRING
        ====================================== */}

        <div style={styles.section}>
          <div style={styles.checkboxRow}>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={
                  form.isRecurring
                }
                onChange={(e) =>
                  handleChange(
                    'isRecurring',
                    e.target.checked
                  )
                }
              />

              🔄 Recurring booking
              {' '}
              (e.g. dialysis transport)
            </label>
          </div>

          {form.isRecurring && (
            <div
              style={
                styles.recurringDays
              }
            >
              {weekDays.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() =>
                    toggleRecurringDay(
                      day
                    )
                  }
                  style={{
                    ...styles.dayBtn,

                    background:
                      form.recurringDays.includes(
                        day
                      )
                        ? '#e53935'
                        : '#333',

                    color: '#fff'
                  }}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* =====================================
            FARE
        ====================================== */}

        {selectedAmbulance &&
          fareEstimate && (
            <div style={styles.fareCard}>
              <h3 style={styles.fareTitle}>
                💰 Fare Estimate
              </h3>

              <div style={styles.fareRow}>
                <span>
                  Base Fare
                </span>

                <strong>
                  ₹
                  {fareEstimate.baseFare.toFixed(
                    2
                  )}
                </strong>
              </div>

              <div style={styles.fareRowSmall}>
                <span>
                  Distance
                </span>

                <span>
                  {fareEstimate.distanceKm}
                  {' '}km
                </span>
              </div>

              <div style={styles.fareRowSmall}>
                <span>
                  Distance Charge
                </span>

                <span>
                  ₹
                  {fareEstimate.distanceCharge.toFixed(
                    2
                  )}
                </span>
              </div>

              {fareEstimate.nightCharge >
                0 && (
                <div style={styles.fareRowSmall}>
                  <span>
                    Night Charge
                  </span>

                  <span>
                    ₹
                    {fareEstimate.nightCharge.toFixed(
                      2
                    )}
                  </span>
                </div>
              )}

              <div
                style={{
                  ...styles.fareRow,
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop:
                    '1px solid #2e7d32'
                }}
              >
                <span>
                  Estimated Total
                </span>

                <strong>
                  ₹
                  {fareEstimate.total.toFixed(
                    2
                  )}
                </strong>
              </div>

              <p style={styles.fareNote}>
                Estimate uses the selected provider's
                saved vehicle pricing. The server
                revalidates the provider, vehicle,
                distance and final fare before booking.
              </p>
            </div>
          )}

        {/* =====================================
            ERROR / SUCCESS
        ====================================== */}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.success}>
            {success}
          </div>
        )}

        {/* =====================================
            SUBMIT
        ====================================== */}

        <button
          type="submit"
          disabled={
            loading ||
            !form.providerId ||
            !form.vehicleId
          }
          style={{
            ...styles.submitBtn,

            opacity:
              loading ||
              !form.providerId ||
              !form.vehicleId
                ? 0.5
                : 1
          }}
        >
          {loading
            ? '🔄 Scheduling...'
            : '📅 Schedule Ambulance'}
        </button>

        {!form.providerId &&
          availableAmbulances.length > 0 && (
            <p style={styles.selectionNote}>
              Please select an ambulance above
              before scheduling.
            </p>
          )}

      </form>
    </div>
  );
};

// ============================================
// STYLES
// ============================================

const styles = {

  page: {
    minHeight: '100vh',
    background: '#0f0f1a',
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px'
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
    fontSize: '20px',
    margin: 0
  },

  subtitle: {
    color: '#aaa',
    fontSize: '14px',
    marginBottom: '25px',
    textAlign: 'center'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },

  section: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '15px'
  },

  sectionTitle: {
    color: '#fff',
    fontSize: '16px',
    margin: '0 0 12px 0'
  },

  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #333',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#0f0f1a',
    color: '#fff',
    marginBottom: '10px',
    boxSizing: 'border-box'
  },

  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #333',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#0f0f1a',
    color: '#fff',
    marginBottom: '10px',
    boxSizing: 'border-box'
  },

  row: {
    display: 'flex',
    gap: '10px'
  },

  locationBtn: {
    width: '100%',
    padding: '10px',
    background: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    marginBottom: '10px'
  },

  coords: {
    color: '#4caf50',
    fontSize: '11px',
    margin: '0 0 5px 0'
  },

  infoText: {
    color: '#aaa',
    fontSize: '13px',
    lineHeight: 1.5
  },

  warningBox: {
    background: '#3b2f0b',
    border: '1px solid #806000',
    color: '#ffd54f',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
    lineHeight: 1.5
  },

  retryBtn: {
    marginTop: '10px',
    padding: '8px 12px',
    background: '#555',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },

  ambulanceCard: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '14px',
    border: '2px solid #333',
    borderRadius: '10px',
    marginBottom: '10px',
    color: '#fff',
    cursor: 'pointer'
  },

  ambulanceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    fontSize: '15px'
  },

  selectedBadge: {
    background: '#e53935',
    color: '#fff',
    padding: '4px 7px',
    borderRadius: '5px',
    fontSize: '9px',
    fontWeight: 'bold'
  },

  ambulanceDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
    color: '#bbb',
    fontSize: '12px'
  },

  pricingBox: {
    marginTop: '12px',
    paddingTop: '10px',
    borderTop: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#4caf50',
    fontSize: '13px'
  },

  checkboxRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '10px'
  },

  checkbox: {
    color: '#ccc',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },

  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #333',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#0f0f1a',
    color: '#fff',
    resize: 'vertical',
    boxSizing: 'border-box'
  },

  recurringDays: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '10px'
  },

  dayBtn: {
    padding: '8px 14px',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },

  fareCard: {
    background: '#1a3a1a',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '15px',
    border: '1px solid #2e7d32'
  },

  fareTitle: {
    color: '#4caf50',
    fontSize: '16px',
    margin: '0 0 10px 0'
  },

  fareRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#fff',
    fontSize: '18px'
  },

  fareRowSmall: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#bbb',
    fontSize: '13px',
    marginTop: '7px'
  },

  fareNote: {
    color: '#888',
    fontSize: '12px',
    margin: '10px 0 0 0',
    lineHeight: 1.4
  },

  selectionNote: {
    color: '#ffb74d',
    textAlign: 'center',
    fontSize: '12px',
    marginTop: '-5px'
  },

  error: {
    background: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '15px'
  },

  success: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '15px'
  },

  submitBtn: {
    width: '100%',
    padding: '16px',
    background: '#e53935',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default ScheduleTransport;