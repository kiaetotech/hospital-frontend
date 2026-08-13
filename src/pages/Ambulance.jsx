import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNearbyAmbulances, getPatientProfile, updatePatientProfile } from '../services/api';
import api from '../services/api';

const Ambulance = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);

  const [nearbyAmbulances, setNearbyAmbulances] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [nearbyError, setNearbyError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('name');
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');

  const [selectedType, setSelectedType] = useState('basic');
  const [patientProfile, setPatientProfile] = useState(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({ city: '', line1: '', state: '', pincode: '' });
  const [manualCity, setManualCity] = useState('');
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [showManualCityInput, setShowManualCityInput] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [fareEstimate, setFareEstimate] = useState(null);
  const [showFareModal, setShowFareModal] = useState(false);
  const [bookingStep, setBookingStep] = useState('search'); // search | confirm | booked
  const [bookings, setBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [sortBy, setSortBy] = useState('nearest');

  // ============================================================
  // LOAD USER + LOCATION
  // ============================================================

            useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === 'patient') {
          setUser(parsedUser);
          fetchPatientProfile();
          fetchMyBookings();
        } else {
          localStorage.clear();
        }
      } catch (error) {
        console.error('Unable to read saved user:', error);
      }
    }

    getLocation();
  }, []);

	  const fetchPatientProfile = async () => {
    try {
      const res = await getPatientProfile();
      if (res.data?.data) {
        setPatientProfile(res.data.data);
        setProfileForm({
          city: res.data.data.patientAddress?.city || '',
          line1: res.data.data.patientAddress?.line1 || '',
          state: res.data.data.patientAddress?.state || '',
          pincode: res.data.data.patientAddress?.pincode || ''
        });
        if (!location && res.data.data.patientLocation?.lat) {
          const loc = { lat: res.data.data.patientLocation.lat, lng: res.data.data.patientLocation.lng };
          setLocation(loc);
          fetchNearbyAmbulances(loc.lat, loc.lng);
        }
      }
    } catch (err) {}
  };

  const saveProfile = async () => {
    try {
      await updatePatientProfile({ patientAddress: profileForm });
      setPatientProfile(prev => ({ ...prev, patientAddress: profileForm }));
      setShowProfileEdit(false);
    } catch (err) { alert('Failed to save profile'); }
  };

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await api.get('/ambulance/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data?.data || []);
    } catch (err) {}
  };

    const handleCitySearch = async () => {
    const city = manualCity.trim();
    if (!city) {
      setNearbyError('Please enter a city.');
      return;
    }

    setSearchFilter('city');
    setSearchQuery(city);
    setSearchMessage(`Searching ambulances for ${city}...`);

    const lat = location?.lat || patientProfile?.patientLocation?.lat || 21.1458;
    const lng = location?.lng || patientProfile?.patientLocation?.lng || 79.0882;
    setLocation({ lat, lng });
    await fetchNearbyAmbulances(lat, lng, { radius: 500, search: true });
  };

  const calculateFare = (ambulance) => {
    if (!ambulance) return null;

    // Provider-entered pricing returned by the backend is authoritative.
    const pricing = ambulance.pricing || {};
    const baseFare = Number(pricing.baseFare ?? ambulance.baseFare);
    const perKmRate = Number(pricing.perKmRate ?? ambulance.perKmRate);
    const distance = Number(ambulance.distance);

    if (!Number.isFinite(baseFare) || !Number.isFinite(perKmRate)) {
      return null;
    }

    const safeDistance = Number.isFinite(distance) ? distance : 0;
    const nightCharge =
      Number(pricing.nightCharge ?? ambulance.nightCharge ?? 0) || 0;
    const waitingCharge =
      Number(pricing.waitingCharge ?? ambulance.waitingCharge ?? 0) || 0;
    const total = baseFare + safeDistance * perKmRate + nightCharge;

    return {
      baseFare,
      perKmRate,
      distance: safeDistance,
      nightCharge,
      waitingCharge,
      total: Math.round(total)
    };
  };

  const handleSelectAmbulance = (ambulance) => {
    setSelectedAmbulance(ambulance);
    const fare = calculateFare(ambulance);

    if (!fare) {
      setNearbyError('Fare information is not available for this ambulance.');
      return;
    }

    setNearbyError('');
    setFareEstimate(fare);
    setShowFareModal(true);
  };

  const handleBookAmbulance = () => {
    if (!user) {
      navigate('/login?redirect=/ambulance');
      return;
    }

    if (!selectedAmbulance?.providerId || !selectedAmbulance?.vehicleId) {
      setShowFareModal(false);
      setNearbyError(
        'This ambulance is missing its provider/vehicle assignment. Please refresh and select another ambulance.'
      );
      return;
    }

    setShowFareModal(false);

    const type = String(
      selectedAmbulance.vehicleType ||
      selectedAmbulance.type ||
      selectedType ||
      'basic'
    ).toLowerCase();

    const params = new URLSearchParams({
      type,
      providerId: String(selectedAmbulance.providerId),
      vehicleId: String(selectedAmbulance.vehicleId)
    });

    if (selectedAmbulance.vehicleNumber) {
      params.set('vehicleNumber', String(selectedAmbulance.vehicleNumber));
    }

    navigate(`/ambulance/schedule?${params.toString()}`);
  };

  // ============================================================
  // GET CURRENT LOCATION
  // ============================================================

  const getLocation = () => {
    if (!navigator.geolocation) {
      setNearbyError('Location services are not supported by this browser.');
      return;
    }

    setLoadingNearby(true);
    setNearbyError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const currentLocation = { lat, lng };

        setLocation(currentLocation);
        fetchNearbyAmbulances(lat, lng);
      },
            (error) => {
        console.error('Location error:', error);

        setLoadingNearby(false);
        setUseManualLocation(true);

        if (error.code === 1) {
          setNearbyError(
            'Location permission denied. Enter your city below to find ambulances.'
          );
        } else {
          setNearbyError(
            'Unable to get your location. Enter your city below or use Emergency.'
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  };

  // ============================================================
  // GET NEARBY AMBULANCES
  // ============================================================

  const fetchNearbyAmbulances = async (lat, lng, options = {}) => {
    try {
      setLoadingNearby(true);
      setSearching(Boolean(options.search));
      setNearbyError('');
      if (options.search) setSearchMessage('Searching ambulances...');

      if (
        !Number.isFinite(Number(lat)) ||
        !Number.isFinite(Number(lng))
      ) {
        throw new Error('Valid pickup coordinates are required.');
      }

      const params = {
        lat: Number(lat),
        lng: Number(lng),
        radius: Number(options.radius || 25),
        limit: 50
      };

      if (options.vehicleType) {
        params.vehicleType = String(options.vehicleType).toLowerCase();
      }

      const response = await getNearbyAmbulances(params);
      const data = response?.data?.data;

      if (Array.isArray(data)) {
        setNearbyAmbulances(data);
        setSearchMessage(
          data.length
            ? `${data.length} ambulance${data.length === 1 ? '' : 's'} found.`
            : 'No available ambulances found for this search.'
        );
      } else if (Array.isArray(response?.data)) {
        setNearbyAmbulances(response.data);
        setSearchMessage(
          response.data.length
            ? `${response.data.length} ambulances found.`
            : 'No available ambulances found for this search.'
        );
      } else {
        setNearbyAmbulances([]);
        setSearchMessage('No available ambulances found.');
      }
    } catch (error) {
      console.error('Nearby ambulance error:', error);

      setNearbyAmbulances([]);
      setSearchMessage('');
      setNearbyError(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to load nearby ambulances.'
      );
    } finally {
      setLoadingNearby(false);
      setSearching(false);
    }
  };

  // ============================================================
  // AMBULANCE TYPES
  // ============================================================

  const ambulanceTypes = [
    {
      icon: '🚑',
      name: 'Basic Life Support',
      shortName: 'Basic',
      desc: 'Oxygen, first aid, stretcher',
      value: 'basic'
    },
    {
      icon: '❤️',
      name: 'Cardiac',
      shortName: 'Cardiac',
      desc: 'Defibrillator, ECG monitor',
      value: 'cardiac'
    },
    {
      icon: '🫁',
      name: 'Ventilator',
      shortName: 'Ventilator',
      desc: 'ICU setup, ventilator',
      value: 'ventilator'
    },
    {
      icon: '👶',
      name: 'Neonatal',
      shortName: 'Neonatal',
      desc: 'Newborn & infant care',
      value: 'neonatal'
    },
    {
      icon: '♿',
      name: 'Wheelchair',
      shortName: 'Wheelchair',
      desc: 'Non-emergency transport',
      value: 'wheelchair'
    }
  ];

  // ============================================================
  // SEARCH FILTERS
  // ============================================================

  const filterOptions = [
    { value: 'name', label: 'Name' },
    { value: 'nearby', label: 'Nearby' },
    { value: 'rated', label: 'Top Rated' },
    { value: 'specialty', label: 'Specialty' },
    { value: 'city', label: 'City' }
  ];

  // ============================================================
  // FILTER NEARBY AMBULANCES LOCALLY
  // ============================================================

  const filteredAmbulances = useMemo(() => {
    let result = [...nearbyAmbulances];

    // Top rated
    if (searchFilter === 'rated') {
      result.sort(
        (a, b) =>
          Number(b.rating || b.providerRating || 0) -
          Number(a.rating || a.providerRating || 0)
      );
    }

    // Nearby = nearest first
    if (searchFilter === 'nearby') {
      result.sort(
        (a, b) =>
          Number(a.distance || 999999) -
          Number(b.distance || 999999)
      );
    }

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return result;
    }

    return result.filter((ambulance) => {
      const vehicleType = String(
        ambulance.vehicleType ||
        ambulance.type ||
        ''
      ).toLowerCase();

      const providerName = String(
        ambulance.providerName ||
        ambulance.companyName ||
        ambulance.name ||
        ''
      ).toLowerCase();

      const city = String(
        ambulance.city ||
        ''
      ).toLowerCase();

      const specialty = String(
        [
          ambulance.specialty,
          ambulance.services,
          ambulance.vehicleType,
          ambulance.type,
          Array.isArray(ambulance.equipment)
            ? ambulance.equipment.join(' ')
            : ambulance.equipment
        ]
          .filter(Boolean)
          .join(' ')
      ).toLowerCase();

      const vehicleNumber = String(
        ambulance.vehicleNumber || ''
      ).toLowerCase();

      if (searchFilter === 'city') {
        return city.includes(query);
      }

      if (searchFilter === 'specialty') {
        return specialty.includes(query);
      }

      return (
        providerName.includes(query) ||
        vehicleType.includes(query) ||
        vehicleNumber.includes(query) ||
        specialty.includes(query)
      );
    });
  }, [nearbyAmbulances, searchFilter, searchQuery]);

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = async () => {
    const query = searchQuery.trim();

        if (!location?.lat || !location?.lng) {
      const fallbackLat = patientProfile?.patientLocation?.lat || 21.1458;
      const fallbackLng = patientProfile?.patientLocation?.lng || 79.0882;
      setLocation({ lat: fallbackLat, lng: fallbackLng });
      await fetchNearbyAmbulances(fallbackLat, fallbackLng, { radius: 500, search: true });
      return;
    }
    
    if (
      !query &&
      searchFilter !== 'nearby' &&
      searchFilter !== 'rated'
    ) {
      setNearbyError('Enter a provider, city, or ambulance type to search.');
      return;
    }

    setNearbyError('');
    setSearchMessage('');

    const vehicleType =
      searchFilter === 'specialty'
        ? query.toLowerCase()
        : searchFilter === 'name' &&
          ambulanceTypes.some(type => type.value === query.toLowerCase())
          ? query.toLowerCase()
          : null;

    await fetchNearbyAmbulances(location.lat, location.lng, {
      radius: 25,
      search: true,
      vehicleType
    });

    if (searchFilter === 'nearby' || searchFilter === 'rated') {
      setSearchQuery('');
    }
  };

  // ============================================================
  // FILTER CLICK
  // ============================================================

    const handleFilterClick = async (filter) => {
    setSearchFilter(filter);
    setSearchQuery('');

    const lat = location?.lat || patientProfile?.patientLocation?.lat || 21.1458;
    const lng = location?.lng || patientProfile?.patientLocation?.lng || 79.0882;

    const options = { radius: 500, search: true };
    
    if (filter === 'specialty' && selectedType) {
      options.vehicleType = selectedType;
      setSearchQuery(selectedType);
    }
    
    await fetchNearbyAmbulances(lat, lng, options);
  };

  // ============================================================
  // BOOK SELECTED TYPE
  // ============================================================

  const handleBookNow = async () => {
    if (!user) {
      navigate('/login?redirect=/ambulance');
      return;
    }

    const matching = nearbyAmbulances.find(
      ambulance =>
        String(ambulance.vehicleType || ambulance.type || '').toLowerCase() ===
        String(selectedType).toLowerCase()
    );

    if (matching?.providerId && matching?.vehicleId) {
      handleSelectAmbulance(matching);
      return;
    }

    if (location?.lat !== undefined && location?.lng !== undefined) {
      await fetchNearbyAmbulances(location.lat, location.lng, {
        radius: 25,
        search: true,
        vehicleType: selectedType
      });
      setSearchFilter('specialty');
      setSearchQuery(selectedType);
      return;
    }

    setNearbyError('Please allow location access before booking an ambulance.');
  };

  // ============================================================
  // EMERGENCY
  // ============================================================

  const handleEmergency = () => {
    navigate('/ambulance/emergency');
  };

  // ============================================================
  // SELECT NEARBY AMBULANCE
  // ============================================================

  const handleNearbyAmbulance = (ambulance) => {
    if (!ambulance?.providerId || !ambulance?.vehicleId) {
      setNearbyError(
        'This ambulance cannot be booked because its provider/vehicle assignment is missing.'
      );
      return;
    }

    const type = String(
      ambulance.vehicleType || ambulance.type || selectedType || 'basic'
    ).toLowerCase();

    setSelectedType(type);
    handleSelectAmbulance(ambulance);
  };

  // ============================================================
  // REFRESH LOCATION / AMBULANCES
  // ============================================================

  const handleRefreshNearby = () => {
    if (location?.lat !== undefined && location?.lng !== undefined) {
      fetchNearbyAmbulances(location.lat, location.lng, { radius: 25 });
    } else {
      getLocation();
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const getAmbulanceType = (ambulance) => {
    return (
      ambulance?.vehicleType ||
      ambulance?.type ||
      'basic'
    )
      .toString()
      .replace(/_/g, ' ')
      .toUpperCase();
  };

  const getAmbulanceName = (ambulance) => {
    return (
      ambulance?.providerName ||
      ambulance?.companyName ||
      ambulance?.name ||
      'Ambulance Provider'
    );
  };

  const getRating = (ambulance) => {
    const rating =
      ambulance?.rating ??
      ambulance?.providerRating;

    return rating !== undefined && rating !== null
      ? Number(rating).toFixed(1)
      : '—';
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f2f4f7',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        paddingBottom: '40px'
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          backgroundColor: '#fff',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderBottom: '1px solid #e8e8e8'
        }}
      >
        <button
          onClick={() => navigate('/')}
          aria-label="Go back"
          style={{
            fontSize: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            color: '#333'
          }}
        >
          ←
        </button>

        <h1
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#1a1a1a',
            margin: 0
          }}
        >
          Ambulance
        </h1>

        {user ? (
          <div
            title={user.name || 'User'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#e53935',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px'
            }}
          >
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        ) : (
          <button
            onClick={() =>
              navigate('/login?redirect=/ambulance')
            }
            style={{
              padding: '6px 14px',
              backgroundColor: '#e53935',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        )}
      </div>

  {/* ======================================================
          PATIENT PROFILE CARD
      ====================================================== */}
      {user && (
        <div style={{ margin: '12px 14px', backgroundColor: '#fff', borderRadius: '14px', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    {!showProfileEdit ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>👤 {user.name || 'Patient'}</div>
                {patientProfile?.patientAddress?.city ? (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    📍 {patientProfile.patientAddress.city}{patientProfile.patientAddress.line1 ? ', ' + patientProfile.patientAddress.line1 : ''}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#e53935', marginTop: '4px' }}>⚠️ Add your city to find nearby ambulances</div>
                )}
              </div>
              <button onClick={() => setShowProfileEdit(true)} style={{ padding: '6px 14px', backgroundColor: '#e53935', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Edit Profile</button>
            </div>
          ) : (
            <div>
              <input placeholder="City *" value={profileForm.city} onChange={e => setProfileForm({...profileForm, city: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', marginBottom: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
              <input placeholder="Address" value={profileForm.line1} onChange={e => setProfileForm({...profileForm, line1: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', marginBottom: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input placeholder="State" value={profileForm.state} onChange={e => setProfileForm({...profileForm, state: e.target.value})} style={{ flex: 1, padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
                <input placeholder="Pincode" value={profileForm.pincode} onChange={e => setProfileForm({...profileForm, pincode: e.target.value})} style={{ flex: 1, padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button onClick={saveProfile} style={{ flex: 1, padding: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>💾 Save Profile</button>
                <button onClick={() => setShowProfileEdit(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              </div>
            </div>
          )}
          )}
        </div>
      )}

            {!user && (
        <div style={{ margin: '12px 14px', backgroundColor: '#fff', borderRadius: '14px', padding: '14px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <input placeholder="Enter your city to find ambulances" value={manualCity} onChange={e => setManualCity(e.target.value)} style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', marginBottom: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
          <button onClick={handleCitySearch} style={{ width: '100%', padding: '12px', backgroundColor: '#e53935', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>🔍 Find Ambulances</button>
          <p style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}><a href="/login?redirect=/ambulance" style={{ color: '#e53935' }}>Login</a> for full features</p>
        </div>
      )}

      {user && patientProfile && (
        <div style={{ margin: '12px 14px', backgroundColor: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#333' }}>👤 {user.name}</div>
            <div style={{ fontSize: 12, color: patientProfile?.patientAddress?.city ? '#666' : '#e53935', marginTop: 4 }}>
              📍 {patientProfile?.patientAddress?.city || 'Add your city'}
              {patientProfile?.patientAddress?.line1 ? `, ${patientProfile.patientAddress.line1}` : ''}
            </div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Logout</button>
        </div>
      )}
     
      {/* ======================================================
          EMERGENCY HERO
      ====================================================== */}

      <div
        style={{
          background:
            'linear-gradient(180deg, #c62828, #8e0000)',
          padding: '30px 20px',
          textAlign: 'center'
        }}
      >
        <button
          onClick={handleEmergency}
          aria-label="Emergency ambulance"
          style={{
            width: '100%',
            maxWidth: '360px',
            padding: '24px',
            backgroundColor: '#fff',
            border: 'none',
            borderRadius: '16px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}
        >
          <span
            style={{
              fontSize: '48px',
              display: 'block'
            }}
          >
            🚨
          </span>

          <span
            style={{
              fontSize: '20px',
              fontWeight: 900,
              color: '#c62828',
              letterSpacing: '2px',
              display: 'block',
              marginTop: '4px'
            }}
          >
            EMERGENCY
          </span>

          <span
            style={{
              fontSize: '11px',
              color: '#888',
              display: 'block',
              marginTop: '2px'
            }}
          >
            Tap for immediate ambulance
          </span>
        </button>

        <div
          style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '13px',
            marginTop: '12px'
          }}
        >
          Or call
          <a
            href="tel:108"
            style={{
              display: 'inline-block',
              marginLeft: '6px',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 800,
              textDecoration: 'underline'
            }}
          >
            108
          </a>
        </div>
      </div>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div
        style={{
          margin: '12px 14px',
          backgroundColor: '#fff',
          borderRadius: '14px',
          padding: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '10px'
          }}
        >
          <input
            type="text"
            placeholder={
              searchFilter === 'nearby'
                ? 'Showing nearby ambulances...'
                : searchFilter === 'rated'
                  ? 'Showing top rated ambulances...'
                  : searchFilter === 'specialty'
                    ? 'Search ambulance type/service...'
                    : searchFilter === 'city'
                      ? 'Search city...'
                      : 'Search ambulance provider...'
            }
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            disabled={
              searchFilter === 'nearby' ||
              searchFilter === 'rated'
            }
            style={{
              flex: 1,
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor:
                searchFilter === 'nearby' ||
                searchFilter === 'rated'
                  ? '#f5f5f5'
                  : '#fff'
            }}
          />

          <button
            onClick={handleSearch}
            style={{
              padding: '12px 18px',
              backgroundColor: '#e53935',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          {filterOptions.map((filter) => (
            <button
              key={filter.value}
              onClick={() =>
                handleFilterClick(filter.value)
              }
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border:
                  searchFilter === filter.value
                    ? '1px solid #e53935'
                    : '1px solid #ddd',
                backgroundColor:
                  searchFilter === filter.value
                    ? '#fff5f5'
                    : '#fff',
                color:
                  searchFilter === filter.value
                    ? '#e53935'
                    : '#555',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================
          NEARBY AMBULANCES
      ====================================================== */}

      <div
        style={{
          margin: '0 14px 14px',
          backgroundColor: '#fff',
          borderRadius: '14px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}
        >
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#333',
              margin: 0
            }}
          >
            🚑 Nearby Ambulances
          </h3>

          <button
            onClick={handleRefreshNearby}
            disabled={loadingNearby}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#e53935',
              fontWeight: 700,
              cursor: loadingNearby
                ? 'not-allowed'
                : 'pointer',
              fontSize: '12px'
            }}
          >
            {loadingNearby ? 'Loading...' : '↻ Refresh'}
          </button>
        </div>

        {nearbyError && (
          <div
            style={{
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '8px',
              backgroundColor: '#fff5f5',
              color: '#c62828',
              fontSize: '12px'
            }}
          >
            {nearbyError}
          </div>
        )}
        {searchMessage && !nearbyError && (
          <div
            style={{
              padding: '8px 10px',
              marginBottom: '10px',
              borderRadius: '8px',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              fontSize: '12px'
            }}
          >
            {searchMessage}
          </div>
        )}
	        {useManualLocation && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Enter your city"
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              style={{ flex: 1, padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '13px' }}
            />
            <button
              onClick={handleCitySearch}
              style={{ padding: '10px 16px', backgroundColor: '#e53935', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Search
            </button>
          </div>
        )}

        {loadingNearby && nearbyAmbulances.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              color: '#777',
              fontSize: '13px'
            }}
          >
            Finding ambulances near you...
          </div>
        )}

        {!loadingNearby &&
          filteredAmbulances.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '20px 10px',
                color: '#777',
                fontSize: '13px'
              }}
            >
              {nearbyAmbulances.length === 0
                ? 'No nearby ambulances found.'
                : 'No ambulances match your search.'}
            </div>
          )}

        {filteredAmbulances.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px'
            }}
          >
            {filteredAmbulances
              .slice(0, 10)
              .map((ambulance, index) => (
                <button
                  key={
                    ambulance._id ||
                    ambulance.id ||
                    ambulance.vehicleId ||
                    index
                  }
                                    onClick={() =>
                    handleSelectAmbulance(ambulance)
                  }
                  style={{
                    minWidth: '145px',
                    padding: '14px 10px',
                    backgroundColor: '#fafafa',
                    borderRadius: '12px',
                    textAlign: 'center',
                    flexShrink: 0,
                    border: '1px solid #eee',
                    cursor: 'pointer'
                  }}
                >
                  <span
                    style={{
                      fontSize: '28px',
                      display: 'block'
                    }}
                  >
                    🚑
                  </span>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#333',
                      display: 'block',
                      marginTop: '4px'
                    }}
                  >
                    {getAmbulanceType(ambulance)}
                  </span>

                  <span
                    style={{
                      fontSize: '11px',
                      color: '#555',
                      display: 'block',
                      marginTop: '5px',
                      fontWeight: 600
                    }}
                  >
                    {getAmbulanceName(ambulance)}
                  </span>

                  <span
                    style={{
                      fontSize: '10px',
                      color: '#888',
                      display: 'block',
                      marginTop: '4px'
                    }}
                  >
                    {ambulance.distance !== undefined
                      ? `${ambulance.distance} km`
                      : 'Distance unavailable'}
                  </span>

                  <span
                    style={{
                      fontSize: '10px',
                      color: '#e53935',
                      display: 'block',
                      marginTop: '3px',
                      fontWeight: 700
                    }}
                  >
                    ★ {getRating(ambulance)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompare(ambulance);
                    }}
                    style={{
                      marginTop: '8px',
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: compareList.some(c => c.vehicleId === ambulance.vehicleId) ? '2px solid #e53935' : '1px solid #ddd',
                      background: compareList.some(c => c.vehicleId === ambulance.vehicleId) ? '#fff5f5' : '#fff',
                      color: compareList.some(c => c.vehicleId === ambulance.vehicleId) ? '#e53935' : '#555',
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {compareList.some(c => c.vehicleId === ambulance.vehicleId) ? '✓ Added' : '+ Compare'}
                  </button>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* ======================================================
          SELECT AMBULANCE TYPE
      ====================================================== */}

      <div
        style={{
          margin: '0 14px 14px',
          backgroundColor: '#fff',
          borderRadius: '14px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#333',
            margin: '0 0 12px 0'
          }}
        >
          Select ambulance type
        </h3>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}
        >
          {ambulanceTypes.map((type) => (
            <button
              key={type.value}
              onClick={async () => {
                setSelectedType(type.value);
                setSearchFilter('specialty');
                setSearchQuery(type.value);

                if (location?.lat !== undefined && location?.lng !== undefined) {
                  await fetchNearbyAmbulances(location.lat, location.lng, {
                    radius: 25,
                    search: true,
                    vehicleType: type.value
                  });
                } else {
                  setNearbyError('Please allow location access to search this ambulance type.');
                  setUseManualLocation(true);
                }
              }}
              style={{
                minWidth: '110px',
                padding: '12px 8px',
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                border:
                  selectedType === type.value
                    ? '2px solid #e53935'
                    : '2px solid #e8e8e8',
                backgroundColor:
                  selectedType === type.value
                    ? '#fff5f5'
                    : '#fff'
              }}
            >
              <span
                style={{
                  fontSize: '26px',
                  display: 'block'
                }}
              >
                {type.icon}
              </span>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#333',
                  display: 'block',
                  marginTop: '4px'
                }}
              >
                {type.name}
              </span>

              <span
                style={{
                  fontSize: '9px',
                  color: '#888',
                  display: 'block',
                  marginTop: '2px'
                }}
              >
                {type.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================
          BOOK BUTTON
      ====================================================== */}

      <div style={{ margin: '0 14px 14px' }}>
        <button
          onClick={handleBookNow}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: '#e53935',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          🚑 Book{' '}
          {
            ambulanceTypes.find(
              (type) =>
                type.value === selectedType
            )?.name
          }
        </button>
      </div>

      {/* ======================================================
          PATIENT MENU
      ====================================================== */}

      <div
        style={{
          margin: '0 14px 14px',
          backgroundColor: '#fff',
          borderRadius: '14px',
          overflow: 'hidden'
        }}
      >
        <button
          onClick={() =>
            navigate('/ambulance/emergency-contacts')
          }
          style={menuItemStyle}
        >
          <span>🛡️</span>
          <span
            style={{
              flex: 1,
              textAlign: 'left'
            }}
          >
            Emergency Contacts
          </span>
          <span style={{ color: '#ccc' }}>›</span>
        </button>

        <button
          onClick={() =>
            navigate('/my-bookings')
          }
          style={menuItemStyle}
        >
          <span>📋</span>
          <span
            style={{
              flex: 1,
              textAlign: 'left'
            }}
          >
            My Bookings
          </span>
          <span style={{ color: '#ccc' }}>›</span>
        </button>

        <button
          onClick={() =>
            navigate('/ambulance/schedule')
          }
          style={{
            ...menuItemStyle,
            borderBottom: 'none'
          }}
        >
          <span>📅</span>
          <span
            style={{
              flex: 1,
              textAlign: 'left'
            }}
          >
            Schedule Transport
          </span>
          <span style={{ color: '#ccc' }}>›</span>
        </button>
      </div>

      {/* ======================================================
          MY BOOKINGS (Quick View)
      ====================================================== */}
      {user && bookings.length > 0 && (
        <div style={{ margin: '0 14px 14px', backgroundColor: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#333', margin: '0 0 12px 0' }}>📋 Upcoming Bookings</h3>
          {bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').slice(0, 3).map(booking => (
            <div key={booking._id} style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>🚑 {booking.ambulanceType?.toUpperCase()}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>📅 {new Date(booking.appointmentDate).toLocaleDateString()} | 📍 {booking.pickupAddress?.substring(0, 20)}</div>
              </div>
              <div>
                <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, backgroundColor: booking.status === 'confirmed' ? '#d1fae5' : '#fef3c7', color: booking.status === 'confirmed' ? '#065f46' : '#92400e' }}>
                  {booking.status?.toUpperCase()}
                </span>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#e53935', marginTop: '4px', textAlign: 'right' }}>₹{booking.finalAmount}</div>
              </div>
            </div>
          ))}
          <button onClick={() => navigate('/my-bookings')} style={{ width: '100%', padding: '10px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>
            View All Bookings →
          </button>
        </div>
      )}


      {/* ======================================================
          DRIVER / PROVIDER
      ====================================================== */}

      <div
        style={{
          margin: '0 14px 14px',
          backgroundColor: '#fff',
          borderRadius: '14px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#333',
            margin: '0 0 12px 0'
          }}
        >
          For Ambulance Drivers
        </h3>

        <button
          onClick={() =>
            navigate('/ambulance/driver/app')
          }
          style={menuItemStyle}
        >
          <span>🌐</span>
          <span
            style={{
              flex: 1,
              textAlign: 'left'
            }}
          >
            Driver Web App
          </span>
          <span style={{ color: '#ccc' }}>›</span>
        </button>

        <a
          href="https://play.google.com/store/apps"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...menuItemStyle,
            textDecoration: 'none',
            display: 'flex'
          }}
        >
          <span>📱</span>
          <span
            style={{
              flex: 1,
              textAlign: 'left'
            }}
          >
            Download Android App
          </span>
          <span
            style={{
              color: '#4caf50',
              fontSize: '11px',
              fontWeight: 600
            }}
          >
            Play Store
          </span>
        </a>

        <a
          href="https://apps.apple.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...menuItemStyle,
            textDecoration: 'none',
            display: 'flex'
          }}
        >
          <span>🍎</span>
          <span
            style={{
              flex: 1,
              textAlign: 'left'
            }}
          >
            Download iOS App
          </span>
          <span
            style={{
              color: '#4caf50',
              fontSize: '11px',
              fontWeight: 600
            }}
          >
            App Store
          </span>
        </a>

        <button
          onClick={() =>
            navigate('/ambulance/register')
          }
          style={menuItemStyle}
        >
          <span>📝</span>
          <span
            style={{
              flex: 1,
              textAlign: 'left'
            }}
          >
            Register Fleet
          </span>
          <span style={{ color: '#ccc' }}>›</span>
        </button>

        <button
          onClick={() =>
            navigate('/ambulance/login')
          }
          style={{
            ...menuItemStyle,
            borderBottom: 'none'
          }}
        >
          <span>🔐</span>
          <span
            style={{
              flex: 1,
              textAlign: 'left'
            }}
          >
            Provider Login
          </span>
          <span style={{ color: '#ccc' }}>›</span>
        </button>
      </div>

	      {showCompare && compareList.length >= 2 && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, width: '95%', maxWidth: 600, maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><h3 style={{ margin: 0 }}>Compare Ambulances</h3><button onClick={() => setShowCompare(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button></div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr><th style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #eee' }}>Feature</th>{compareList.map(a => <th key={a.vehicleId} style={{ textAlign: 'center', padding: 8, borderBottom: '2px solid #eee' }}>{(a.vehicleType || 'Basic').toUpperCase()}</th>)}</tr></thead>
              <tbody>
                <tr><td style={{ padding: 8, fontWeight: 600 }}>Provider</td>{compareList.map(a => <td key={a.vehicleId} style={{ textAlign: 'center', padding: 8 }}>{a.providerName}</td>)}</tr>
                <tr><td style={{ padding: 8, fontWeight: 600 }}>Base Fare</td>{compareList.map(a => <td key={a.vehicleId} style={{ textAlign: 'center', padding: 8, fontWeight: 700, color: '#e53935' }}>₹{a.baseFare || 500}</td>)}</tr>
                <tr><td style={{ padding: 8, fontWeight: 600 }}>Per KM</td>{compareList.map(a => <td key={a.vehicleId} style={{ textAlign: 'center', padding: 8 }}>₹{a.perKmRate || 25}</td>)}</tr>
                <tr><td style={{ padding: 8, fontWeight: 600 }}>Distance</td>{compareList.map(a => <td key={a.vehicleId} style={{ textAlign: 'center', padding: 8 }}>{a.distance || 'N/A'} km</td>)}</tr>
                <tr><td style={{ padding: 8, fontWeight: 600 }}>Equipment</td>{compareList.map(a => <td key={a.vehicleId} style={{ textAlign: 'center', padding: 8 }}>{a.equipment?.join(', ') || 'Basic'}</td>)}</tr>
                <tr><td style={{ padding: 8, fontWeight: 600 }}>Action</td>{compareList.map(a => <td key={a.vehicleId} style={{ textAlign: 'center', padding: 8 }}><button onClick={() => { setShowCompare(false); handleSelectAmbulance(a); }} style={{ padding: '8px 14px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Book</button></td>)}</tr>
              </tbody>
            </table>
            <button onClick={() => setCompareList([])} style={{ marginTop: 16, width: '100%', padding: 10, background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Clear Compare</button>
          </div>
        </div>
      )}

{/* ======================================================
          FARE ESTIMATE MODAL
      ====================================================== */}
      {showFareModal && selectedAmbulance && fareEstimate && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px 16px 0 0', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>💰 Fare Estimate</h3>
              <button onClick={() => setShowFareModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>🚑 {selectedAmbulance.vehicleType?.toUpperCase() || 'Ambulance'}</span>
                <span style={{ fontWeight: 700 }}>
                  {selectedAmbulance.providerName || selectedAmbulance.companyName || 'Ambulance Provider'}
                </span>
              </div>
              {selectedAmbulance.vehicleNumber && (
                <div style={{ fontSize: '12px', color: '#555', marginBottom: '8px' }}>
                  🚘 Vehicle: <strong>{selectedAmbulance.vehicleNumber}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#666' }}>
                <span>📍 Distance: {selectedAmbulance.distance || '~5'} km</span>
                <span>⏱ ETA: {selectedAmbulance.estimatedETA || '~10'} min</span>
              </div>
              {selectedAmbulance.equipment?.length > 0 && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  🛠️ {selectedAmbulance.equipment.join(', ')}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span>Base Fare</span>
                <span>₹{fareEstimate.baseFare}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span>Distance ({fareEstimate.distance} km × ₹{fareEstimate.perKmRate}/km)</span>
                <span>₹{fareEstimate.distance * fareEstimate.perKmRate}</span>
              </div>
              {fareEstimate.nightCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span>Night Charge</span>
                  <span>₹{fareEstimate.nightCharge}</span>
                </div>
              )}
              {fareEstimate.waitingCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '12px', color: '#777' }}>
                  <span>Waiting Charge</span>
                  <span>₹{fareEstimate.waitingCharge}/unit</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontWeight: 700, fontSize: '16px' }}>
                <span>Estimated Total</span>
                <span style={{ color: '#e53935' }}>₹{fareEstimate.total}</span>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#777', marginBottom: '10px', lineHeight: 1.4 }}>
              Final fare, availability, payment, cancellation and refund are confirmed by the booking service on the next step.
            </div>
            <button onClick={handleBookAmbulance} style={{ width: '100%', padding: '14px', backgroundColor: '#e53935', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginBottom: '8px' }}>
              🚑 Book Now - ₹{fareEstimate.total}
            </button>
            <button onClick={() => setShowFareModal(false)} style={{ width: '100%', padding: '12px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

	      {compareList.length > 0 && (
        <button onClick={() => setShowCompare(true)} style={{ position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)', padding: '12px 24px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 25, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(229,57,53,0.4)', zIndex: 90 }}>
          Compare ({compareList.length})
        </button>
      )}


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div
        style={{
          textAlign: 'center',
          padding: '16px',
          color: '#999',
          fontSize: '12px',
          borderTop: '1px solid #eee',
          margin: '0 14px'
        }}
      >
        <p style={{ margin: 0 }}>
          ⚠️ For life-threatening emergencies, always call{' '}
          <a
            href="tel:108"
            style={{
              color: '#e53935',
              fontWeight: 800,
              textDecoration: 'underline'
            }}
          >
            108
          </a>{' '}
          first.
        </p>
      </div>
    </div>
  );
};

// ============================================================
// COMMON MENU BUTTON STYLE
// ============================================================

const menuItemStyle = {
  width: '100%',
  padding: '14px 16px',
  backgroundColor: '#fff',
  border: 'none',
  borderBottom: '1px solid #f0f0f0',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '14px',
  color: '#333',
  cursor: 'pointer',
  textAlign: 'left'
};

export default Ambulance;