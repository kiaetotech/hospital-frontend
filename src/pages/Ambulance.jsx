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
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [searchFilter, setSearchFilter] = useState('name');
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');

  const [selectedType, setSelectedType] = useState('bls');
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
    api.get('/ambulance/cities')
      .then(res => {
        setCities(res.data?.data || []);
        const savedCity = patientProfile?.patientAddress?.city;
        if (savedCity) setSelectedCity(savedCity);
      })
      .catch(() => {});
  }, [patientProfile]);

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
  setSearchMessage(`Searching ambulances in ${city}...`);
  setLoadingNearby(true);
  
  try {
    const response = await api.get('/ambulance/search', {
      params: { city, limit: 50 }
    });
    
    const data = response?.data?.data;
    if (Array.isArray(data) && data.length > 0) {
      setNearbyAmbulances(data);
      setNearbyError('');
      setSearchMessage(`${data.length} ambulances found in ${city}`);
    } else {
      setNearbyAmbulances([]);
      setNearbyError(`No ambulances found in ${city}`);
    }
  } catch (err) {
    setNearbyError('Search failed. Please try again.');
  } finally {
    setLoadingNearby(false);
  }
};

	  const toggleCompare = (ambulance) => {
    setCompareList(prev => {
      const exists = prev.find(a => a.vehicleId === ambulance.vehicleId);
      if (exists) return prev.filter(a => a.vehicleId !== ambulance.vehicleId);
      if (prev.length >= 3) return prev;
      return [...prev, ambulance];
    });
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
    
    const baseFare = Number(ambulance.baseFare || 0);
    const perKmRate = Number(ambulance.perKmRate || 0);
    
    if (!baseFare || !perKmRate) {
      setNearbyError('Pricing not available for this ambulance.');
      return;
    }
    
    setNearbyError('');
    setFareEstimate({ baseFare, perKmRate });
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
        params.type = String(options.vehicleType).toLowerCase();
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
    { icon: '🚑', name: 'BLS (Basic)', shortName: 'BLS', desc: 'Oxygen, first aid, stretcher', value: 'bls' },
    { icon: '🚨', name: 'ALS (Advanced)', shortName: 'ALS', desc: 'Advanced life support', value: 'als' },
    { icon: '❤️', name: 'Cardiac', shortName: 'Cardiac', desc: 'Defibrillator, ECG monitor', value: 'cardiac' },
    { icon: '🫁', name: 'Ventilator/ICU', shortName: 'ICU', desc: 'ICU setup, ventilator', value: 'ventilator' },
    { icon: '👶', name: 'Neonatal', shortName: 'Neonatal', desc: 'Newborn & infant care', value: 'neonatal' },
    { icon: '✈️', name: 'Air Ambulance', shortName: 'Air', desc: 'Aircraft transport', value: 'air' },
    { icon: '🏍️', name: 'Bike Ambulance', shortName: 'Bike', desc: 'Quick response', value: 'bike' },
    { icon: '⚰️', name: 'Mortuary Van', shortName: 'Mortuary', desc: 'Deceased transport', value: 'mortuary' },
    { icon: '♿', name: 'Patient Transport', shortName: 'PTV', desc: 'Non-emergency transport', value: 'ptv' },
    { icon: '♿', name: 'Wheelchair', shortName: 'Wheelchair', desc: 'Wheelchair accessible', value: 'wheelchair' }
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
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate('/profile')} style={{ padding: '8px 14px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit Profile</button>
            <button onClick={() => { localStorage.clear(); navigate('/'); }} style={{ padding: '8px 14px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Logout</button>
          </div>
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
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              if (e.target.value) {
                fetchNearbyAmbulances(
                  location?.lat || 21.1458,
                  location?.lng || 79.0882,
                  { radius: 500, search: true, city: e.target.value }
                );
              }
            }}
            style={{
              flex: 1,
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: '#fff'
            }}
          >
            <option value="">Select City</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
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
               			 : `No ambulances found for "${searchQuery}". Try a different city or type.`}
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
                    radius: 500,
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
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, width: '95%', maxWidth: 700, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>⚖️ Compare Ambulances</h3>
              <button onClick={() => setShowCompare(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            
            {/* Sort buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 15, flexWrap: 'wrap' }}>
              <button onClick={() => setCompareList([...compareList].sort((a,b) => (a.baseFare||0) - (b.baseFare||0)))} style={sortBtnStyle}>💰 Cheapest First</button>
              <button onClick={() => setCompareList([...compareList].sort((a,b) => (a.distance||999) - (b.distance||999)))} style={sortBtnStyle}>📍 Nearest First</button>
              <button onClick={() => setCompareList([...compareList].sort((a,b) => (b.rating||0) - (a.rating||0)))} style={sortBtnStyle}>⭐ Top Rated</button>
              <button onClick={() => setCompareList([...compareList].sort((a,b) => (a.estimatedETA||999) - (b.estimatedETA||999)))} style={sortBtnStyle}>⏱ Fastest ETA</button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '2px solid #eee', position: 'sticky', top: 0, background: '#fff' }}>Feature</th>
                  {compareList.map(a => (
                    <th key={a.vehicleId} style={{ textAlign: 'center', padding: 10, borderBottom: '2px solid #eee', position: 'sticky', top: 0, background: '#fff' }}>
                      {(a.vehicleType || 'Basic').toUpperCase()}
                      {(a.baseFare || 0) === Math.min(...compareList.map(x => x.baseFare || 0)) && (
                        <span style={{ display: 'block', fontSize: 9, background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: 8, marginTop: 3 }}>BEST PRICE</span>
                      )}
                      {(a.distance || 0) === Math.min(...compareList.map(x => x.distance || 999)) && (
                        <span style={{ display: 'block', fontSize: 9, background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: 8, marginTop: 3 }}>NEAREST</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Provider</td>
                  {compareList.map(a => <td key={a.vehicleId} style={{...tdStyle, textAlign: 'center'}}>{a.providerName}</td>)}
                </tr>
                <tr>
                  <td style={tdStyle}>💰 Base Fare</td>
                  {compareList.map(a => <td key={a.vehicleId} style={{...tdStyle, textAlign: 'center', fontWeight: 700, color: '#e53935'}}>₹{a.baseFare || 0}</td>)}
                </tr>
                <tr>
                  <td style={tdStyle}>📏 Per KM</td>
                  {compareList.map(a => <td key={a.vehicleId} style={{...tdStyle, textAlign: 'center'}}>₹{a.perKmRate || 0}</td>)}
                </tr>
                <tr>
                  <td style={tdStyle}>📍 Distance</td>
                  {compareList.map(a => <td key={a.vehicleId} style={{...tdStyle, textAlign: 'center'}}>{a.distance || 'N/A'} km</td>)}
                </tr>
                <tr>
                  <td style={tdStyle}>⏱ ETA</td>
                  {compareList.map(a => <td key={a.vehicleId} style={{...tdStyle, textAlign: 'center'}}>{a.estimatedETA || 'N/A'} min</td>)}
                </tr>
                <tr>
                  <td style={tdStyle}>⭐ Rating</td>
                  {compareList.map(a => <td key={a.vehicleId} style={{...tdStyle, textAlign: 'center'}}>{a.rating || 'New'}</td>)}
                </tr>
                <tr>
                  <td style={tdStyle}>🛠️ Equipment</td>
                  {compareList.map(a => <td key={a.vehicleId} style={{...tdStyle, textAlign: 'center'}}>{a.equipment?.length > 0 ? a.equipment.map(e => '• ' + e).join('\n') : 'Basic'}</td>)}
                </tr>
                <tr>
                  <td style={tdStyle}>🌙 Night Charge</td>
                  {compareList.map(a => <td key={a.vehicleId} style={{...tdStyle, textAlign: 'center'}}>₹{a.nightCharge || 0}</td>)}
                </tr>
                <tr>
                  <td style={tdStyle}>🚐 Vehicle No.</td>
                  {compareList.map(a => <td key={a.vehicleId} style={{...tdStyle, textAlign: 'center'}}>{a.vehicleNumber}</td>)}
                </tr>
                <tr>
                  <td style={tdStyle}>Action</td>
                  {compareList.map(a => (
                    <td key={a.vehicleId} style={{...tdStyle, textAlign: 'center'}}>
                      <button onClick={() => { setShowCompare(false); handleSelectAmbulance(a); }} style={{ padding: '8px 14px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 11 }}>
                        Book Now
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <button onClick={() => setCompareList([])} style={{ marginTop: 16, width: '100%', padding: 12, background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
              Clear Compare
            </button>
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
                <span>Per KM Rate</span>
                <span>₹{fareEstimate.perKmRate}/km</span>
              </div>
              <div style={{ padding: '12px', background: '#fef3c7', borderRadius: 8, marginTop: 10, fontSize: 12, color: '#92400e' }}>
                📍 Final fare calculated after entering pickup & destination on next step
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#777', marginBottom: '10px', lineHeight: 1.4 }}>
              Final fare, availability, payment, cancellation and refund are confirmed by the booking service on the next step.
            </div>
            <button onClick={handleBookAmbulance} style={{ width: '100%', padding: '14px', backgroundColor: '#e53935', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginBottom: '8px' }}>
              			🚑 Continue to Booking →
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
const sortBtnStyle = {
  padding: '6px 12px',
  borderRadius: 20,
  border: '1px solid #ddd',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 600
};

const tdStyle = {
  padding: 10,
  borderBottom: '1px solid #f0f0f0',
  fontWeight: 500
};

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