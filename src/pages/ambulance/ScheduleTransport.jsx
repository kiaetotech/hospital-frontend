import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { getNearbyAmbulances, scheduleTransport } from '../../services/api';

const ScheduleTransport = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  const [hospitalSearch, setHospitalSearch] = useState('');
  const [hospitalResults, setHospitalResults] = useState([]);
  const [showHospitalResults, setShowHospitalResults] = useState(false);

  // Prevent stale geocoding responses from overwriting a newer destination.
  const destinationGeocodeTimer = useRef(null);
  const geocodeRequestId = useRef(0);

  // ============================================
  // RESTORE VEHICLE SELECTION FROM SEARCH CARD
  // ============================================

  useEffect(() => {
    const providerId = searchParams.get('providerId') || '';
    const vehicleId = searchParams.get('vehicleId') || '';
    const type = searchParams.get('type') || 'basic';

    setForm(prev => ({
      ...prev,
      providerId: providerId || prev.providerId,
      vehicleId: vehicleId || prev.vehicleId,
      ambulanceType: type || prev.ambulanceType
    }));
  }, [searchParams]);

	  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/patient/profile', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.data?.data?.patientLocation?.lat) {
            setForm(prev => ({
              ...prev,
              pickupLat: String(res.data.data.patientLocation.lat),
              pickupLng: String(res.data.data.patientLocation.lng),
              pickupAddress: res.data.data.patientAddress?.line1 || 'Current Location'
            }));
          }
        })
        .catch(() => {});
    }
  }, []);

	  const geocodeAddress = async (address) => {
    const cleanAddress = String(address || '').trim();
    if (cleanAddress.length < 5) return null;

    const validCoords = (lat, lng) => (
      Number.isFinite(lat) && Number.isFinite(lng) &&
      lat >= 8 && lat <= 38 && lng >= 68 && lng <= 98
    );

    // Prefer Google when configured. If it is not configured or fails,
    // use the backend-independent OpenStreetMap/Nominatim fallback.
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;

    if (apiKey) {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanAddress + ', India')}&key=${apiKey}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'OK' && Array.isArray(data.results) && data.results.length) {
            const result = data.results.find(r =>
              Array.isArray(r.address_components) &&
              r.address_components.some(c => Array.isArray(c.types) && c.types.includes('country') && c.short_name === 'IN')
            ) || data.results[0];
            const lat = Number(result?.geometry?.location?.lat);
            const lng = Number(result?.geometry?.location?.lng);
            if (validCoords(lat, lng)) {
              return { lat, lng, formattedAddress: result.formatted_address || cleanAddress };
            }
          }
        }
      } catch (e) {
        console.warn('Google geocoding unavailable; trying fallback.', e);
      }
    }
      return null;

  // Extract coordinates from the hospital API regardless of whether the
  // backend returns location.lat/lng, latitude/longitude, GeoJSON coordinates,
  // or a nested coordinates object.
  const extractHospitalCoordinates = (hospital) => {
    if (!hospital || typeof hospital !== 'object') return null;

    const candidates = [
      {
        lat: hospital?.location?.lat,
        lng: hospital?.location?.lng
      },
      {
        lat: hospital?.location?.latitude,
        lng: hospital?.location?.longitude
      },
      {
        lat: hospital?.coordinates?.lat,
        lng: hospital?.coordinates?.lng
      },
      {
        lat: hospital?.coordinates?.latitude,
        lng: hospital?.coordinates?.longitude
      },
      {
        lat: hospital?.latitude,
        lng: hospital?.longitude
      },
      {
        lat: hospital?.lat,
        lng: hospital?.lng
      }
    ];

    for (const candidate of candidates) {
      const lat = Number(candidate.lat);
      const lng = Number(candidate.lng);

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= 8 &&
        lat <= 38 &&
        lng >= 68 &&
        lng <= 98
      ) {
        return { lat, lng };
      }
    }

    // GeoJSON: [longitude, latitude]
    const geoJson =
      hospital?.location?.coordinates ||
      hospital?.geometry?.coordinates ||
      hospital?.coordinates;

    if (Array.isArray(geoJson) && geoJson.length >= 2) {
      const lng = Number(geoJson[0]);
      const lat = Number(geoJson[1]);

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= 8 &&
        lat <= 38 &&
        lng >= 68 &&
        lng <= 98
      ) {
        return { lat, lng };
      }
    }

    return null;
  };

  const selectHospital = async (hospital) => {
    // Cancel any pending manual-address geocode before applying the hospital.
    if (destinationGeocodeTimer.current) {
      clearTimeout(destinationGeocodeTimer.current);
      destinationGeocodeTimer.current = null;
    }
    const requestId = ++geocodeRequestId.current;

    const name = hospital?.name || hospital?.hospitalName || '';
    const addressObject = hospital?.address || {};
    const addressParts = [
      addressObject?.line1,
      addressObject?.line2,
      addressObject?.area,
      addressObject?.city,
      addressObject?.state,
      addressObject?.pincode || addressObject?.zip
    ].filter(Boolean);

    const destinationAddress =
      addressParts.join(', ') ||
      hospital?.fullAddress ||
      hospital?.addressText ||
      name;

    setError('');
    setHospitalSearch(name);
    setShowHospitalResults(false);

    // First clear old coordinates so a previous hospital can never be reused.
    setForm(prev => ({
      ...prev,
      hospitalName: name,
      destinationAddress,
      destinationLat: '',
      destinationLng: ''
    }));
    setFareEstimate(null);

    // Best case: use coordinates already returned by the hospital API.
    const existingCoords = extractHospitalCoordinates(hospital);

    if (existingCoords) {
      setForm(prev => ({
        ...prev,
        hospitalName: name,
        destinationAddress,
        destinationLat: String(existingCoords.lat),
        destinationLng: String(existingCoords.lng)
      }));
      return;
    }

    // Fallback: geocode the complete hospital address.
    const coords = await geocodeAddress(destinationAddress);

    if (requestId !== geocodeRequestId.current) return;

    if (coords) {
      setForm(prev => ({
        ...prev,
        hospitalName: name,
        destinationAddress: coords.formattedAddress || destinationAddress,
        destinationLat: String(coords.lat),
        destinationLng: String(coords.lng)
      }));
    } else {
      setError(
        'Hospital found, but its location could not be verified. Please choose another hospital or use "Use Current Location".'
      );
    }
  };

  // ============================================
  // GET AVAILABLE AMBULANCES
  // ============================================

    useEffect(() => {
    if (form.pickupLat && form.pickupLng && !form.providerId) {
      fetchAvailableAmbulances();
    }
  }, [form.pickupLat, form.pickupLng, form.providerId]);

	  const searchHospital = async (query) => {
    if (!query || query.trim().length < 2) {
      setHospitalResults([]);
      return;
    }
    try {
      const response = await api.get('/hospitals/search', { params: { q: query, limit: 5 } });
      setHospitalResults(response.data?.data || response.data || []);
      setShowHospitalResults(true);
    } catch (e) {
      setHospitalResults([]);
    }
  };

  const fetchAvailableAmbulances = async () => {
    try {
      setLoadingAmbulances(true);
      setError('');

      const res = await getNearbyAmbulances({
          lat: form.pickupLat,
          lng: form.pickupLng,
          radius: 500,
          limit: 20,
          city: form.pickupAddress || undefined
        });

      const ambulances = res.data?.data || [];

      setAvailableAmbulances(ambulances);

      // If the patient arrived here from a search card, restore that exact vehicle.
      const requestedProviderId = searchParams.get('providerId');
      const requestedVehicleId = searchParams.get('vehicleId');
      const restored = requestedVehicleId
        ? ambulances.find(a => String(a.vehicleId) === String(requestedVehicleId) && (!requestedProviderId || String(a.providerId) === String(requestedProviderId)))
        : null;

      if (restored) {
        setSelectedAmbulance(restored);
        setForm(prev => ({
          ...prev,
          providerId: String(restored.providerId || ''),
          vehicleId: String(restored.vehicleId || ''),
          ambulanceType: restored.vehicleType || prev.ambulanceType
        }));
      }

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

    const pricing = ambulance.pricing || {};
    const baseFare = Number(pricing.baseFare ?? ambulance.baseFare);
    const perKmRate = Number(pricing.perKmRate ?? ambulance.perKmRate);
    const nightCharge = Number(pricing.nightCharge ?? ambulance.nightCharge ?? 0);

    const pickupLat = Number(form.pickupLat);
    const pickupLng = Number(form.pickupLng);
    const destinationLat = Number(form.destinationLat);
    const destinationLng = Number(form.destinationLng);

    if (
      !Number.isFinite(baseFare) ||
      !Number.isFinite(perKmRate) ||
      !Number.isFinite(pickupLat) ||
      !Number.isFinite(pickupLng) ||
      !Number.isFinite(destinationLat) ||
      !Number.isFinite(destinationLng) ||
      pickupLat < 8 || pickupLat > 38 ||
      destinationLat < 8 || destinationLat > 38 ||
      pickupLng < 68 || pickupLng > 98 ||
      destinationLng < 68 || destinationLng > 98
    ) {
      setFareEstimate(null);
      return;
    }

    const distance = calculateDistance(
      pickupLat,
      pickupLng,
      destinationLat,
      destinationLng
    );

    // Zero distance is not a valid ambulance trip for this screen.
    if (!Number.isFinite(distance) || distance <= 0 || distance > 1000) {
      setFareEstimate(null);
      return;
    }

    let appliedNightCharge = 0;

    if (form.scheduledTime) {
      const hour = Number(form.scheduledTime.split(':')[0]);

      if (
        (hour >= 22 || hour < 6) &&
        Number.isFinite(nightCharge) &&
        nightCharge >= 0
      ) {
        appliedNightCharge = nightCharge;
      }
    }

    const distanceCharge = distance * perKmRate;
    const total = baseFare + distanceCharge + appliedNightCharge;

    // Guard against obviously corrupt provider pricing producing absurd totals.
    if (!Number.isFinite(total) || total < 0 || total > 100000) {
      setFareEstimate(null);
      setError('The selected ambulance has invalid pricing. Please select another ambulance.');
      return;
    }

    setFareEstimate({
      baseFare,
      perKmRate,
      distanceKm: distance,
      distanceCharge,
      nightCharge: appliedNightCharge,
      total: Math.round(total * 100) / 100
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

    const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'destinationAddress') {
      // Any manual edit invalidates the previous destination coordinates.
      // This is critical: never calculate fare using coordinates from an old address.
      setFareEstimate(null);
      setError('');

      setForm(prev => ({
        ...prev,
        destinationAddress: value,
        destinationLat: '',
        destinationLng: ''
      }));

      if (destinationGeocodeTimer.current) {
        clearTimeout(destinationGeocodeTimer.current);
      }

      if (String(value).trim().length >= 5) {
        const requestId = ++geocodeRequestId.current;

        destinationGeocodeTimer.current = setTimeout(async () => {
          const coords = await geocodeAddress(value);

          if (requestId !== geocodeRequestId.current) return;

          if (coords) {
            setForm(prev => ({
              ...prev,
              destinationLat: String(coords.lat),
              destinationLng: String(coords.lng)
            }));
            setError('');
          } else {
            setError(
              'Could not verify this destination address. Please select a registered hospital or use Current Location.'
            );
          }
        }, 800);
      } else {
        ++geocodeRequestId.current;
      }
    }

    if (field === 'pickupAddress' && String(value).trim().length > 5) {
      // Pickup geocoding also uses a single cancellable timer.
      if (destinationGeocodeTimer.current) {
        clearTimeout(destinationGeocodeTimer.current);
      }

      const requestId = ++geocodeRequestId.current;

      destinationGeocodeTimer.current = setTimeout(async () => {
        const coords = await geocodeAddress(value);

        if (requestId !== geocodeRequestId.current) return;

        if (coords) {
          setForm(prev => ({
            ...prev,
            pickupLat: String(coords.lat),
            pickupLng: String(coords.lng)
          }));
        }
      }, 800);
    }

    if (field === 'pickupLat' || field === 'pickupLng') {
      setSelectedAmbulance(null);
      setFareEstimate(null);

      setForm(prev => ({
        ...prev,
        providerId: '',
        vehicleId: ''
      }));
    }
  };

  useEffect(() => {
    return () => {
      if (destinationGeocodeTimer.current) {
        clearTimeout(destinationGeocodeTimer.current);
      }
      geocodeRequestId.current += 1;
    };
  }, []);

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

	    const pickupLat = Number(form.pickupLat);
    const pickupLng = Number(form.pickupLng);
    const destinationLat = Number(form.destinationLat);
    const destinationLng = Number(form.destinationLng);

    const validIndiaCoordinate = (lat, lng) =>
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= 8 &&
      lat <= 38 &&
      lng >= 68 &&
      lng <= 98;

    if (!validIndiaCoordinate(pickupLat, pickupLng)) {
      setError(
        'Pickup location is not valid. Please use Current Location or enter a valid pickup address.'
      );

      setLoading(false);
      return;
    }

    if (!validIndiaCoordinate(destinationLat, destinationLng)) {
      setError(
        'Destination location is not verified. Please select a hospital from the search results, enter a valid address and wait for verification, or use Current Location.'
      );

      setLoading(false);
      return;
    }

    const tripDistance = calculateDistance(
      pickupLat,
      pickupLng,
      destinationLat,
      destinationLng
    );

    if (!Number.isFinite(tripDistance) || tripDistance <= 0 || tripDistance > 1000) {
      setError('Invalid trip distance. Please verify the pickup and destination locations.');
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

    // ------------------------------------------
    // SUBMIT EXACTLY THE SELECTED VEHICLE
    // ------------------------------------------

    try {
      const bookingData = {
        ...form,

        providerId:
          form.providerId,

        vehicleId:
          form.vehicleId
      };

      const res =
        await scheduleTransport(
          bookingData
        );

      if (res.data?.success) {
        const bookingId = res.data?.data?.bookingId || '';
        setSuccess(`Ambulance booking created successfully. Booking ID: ${bookingId}. Status: ${res.data?.data?.status || 'pending'}.`);
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
            placeholder="Search registered hospital..."
            value={hospitalSearch}
            onChange={(e) => {
              setHospitalSearch(e.target.value);
              searchHospital(e.target.value);
            }}
            style={styles.input}
          />
          
          {showHospitalResults && hospitalResults.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              {hospitalResults.map(h => (
                <button
                  key={h._id}
                  type="button"
                  onClick={() => selectHospital(h)}
                  style={{ width: '100%', padding: 10, background: '#1a1a2e', border: '1px solid #333', borderRadius: 6, color: '#fff', textAlign: 'left', cursor: 'pointer', marginBottom: 4 }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{h.address?.line1}, {h.address?.city}</div>
                </button>
              ))}
            </div>
          )}
          
          <input
            type="text"
            placeholder="Hospital Name (if not registered)"
            value={form.hospitalName}
            onChange={(e) => handleChange('hospitalName', e.target.value)}
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
            {form.providerId ? '✅ Selected Ambulance' : '🚑 Available Ambulances'}
          </h3>

          {form.providerId ? (
            <div style={{ padding: '12px', background: '#d1fae5', borderRadius: 8, color: '#065f46', fontSize: 13 }}>
              Ambulance selected. Fill details below to complete booking.
            </div>
          ) : !form.pickupLat || !form.pickupLng ? (
            <p style={styles.infoText}>Please select your pickup location first.</p>
          ) : loadingAmbulances ? (
            <p style={styles.infoText}>🔄 Finding ambulances...</p>
          ) : availableAmbulances.length === 0 ? (
            <div style={styles.warningBox}>
              <strong>No available ambulance found nearby.</strong>
              <button type="button" onClick={fetchAvailableAmbulances} style={styles.retryBtn}>🔄 Search Again</button>
            </div>
          ) : (
            <div>
              {availableAmbulances.map((ambulance, index) => {
                const isSelected = selectedAmbulance?.vehicleId === ambulance.vehicleId;
                return (
                  <button
                    key={ambulance.vehicleId || index}
                    type="button"
                    onClick={() => selectAmbulance(ambulance)}
                    style={{ ...styles.ambulanceCard, borderColor: isSelected ? '#e53935' : '#333', background: isSelected ? 'rgba(229,57,53,0.12)' : '#0f0f1a' }}
                  >
                    <strong>🚑 {ambulance.vehicleType || 'Ambulance'}</strong>
                    <div style={{ fontSize: 12, color: '#bbb' }}>Vehicle: {ambulance.vehicleNumber} | {ambulance.distance || 'N/A'} km</div>
                    <div style={{ fontSize: 12, color: '#4caf50' }}>₹{ambulance.baseFare || 500} + ₹{ambulance.perKmRate || 25}/km</div>
                  </button>
                );
              })}
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
                Final fare is calculated by
                the server using the selected
                provider's saved pricing.
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
            !form.vehicleId ||
            !Number.isFinite(Number(form.pickupLat)) ||
            !Number.isFinite(Number(form.pickupLng)) ||
            !Number.isFinite(Number(form.destinationLat)) ||
            !Number.isFinite(Number(form.destinationLng))
          }
          style={{
            ...styles.submitBtn,

            opacity:
              loading ||
              !form.providerId ||
              !form.vehicleId ||
              !Number.isFinite(Number(form.pickupLat)) ||
              !Number.isFinite(Number(form.pickupLng)) ||
              !Number.isFinite(Number(form.destinationLat)) ||
              !Number.isFinite(Number(form.destinationLng))
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
