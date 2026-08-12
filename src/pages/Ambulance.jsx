import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getNearbyAmbulances, getPatientProfile, updatePatientProfile } from '../services/api';

const Ambulance = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);

  const [nearbyAmbulances, setNearbyAmbulances] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [nearbyError, setNearbyError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('name');

  const [selectedType, setSelectedType] = useState('basic');
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [showBookingPanel, setShowBookingPanel] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    patientName: '',
    patientPhone: '',
    destinationAddress: '',
    scheduledDate: '',
    scheduledTime: '',
    couponCode: '',
    notes: ''
  });
  const [patientProfile, setPatientProfile] = useState(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({ city: '', line1: '', state: '', pincode: '' });
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [manualCity, setManualCity] = useState('');

  // ============================================================
  // LOAD USER + LOCATION
  // ============================================================

    useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Unable to read saved user:', error);
      }
      fetchPatientProfile();
    }

    getLocation();
    loadAmbulanceBookings();
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
        }
      }
    } catch (err) {}
  };

  const loadAmbulanceBookings = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) return;
    try {
      setLoadingBookings(true);
      const response = await api.get('/ambulance/my-bookings', {
        params: { page: 1, limit: 20 }
      });
      setBookingHistory(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error('Ambulance booking history error:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const updateBookingField = (field, value) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    try {
      await updatePatientProfile({ patientAddress: profileForm });
      setPatientProfile(prev => ({ ...prev, patientAddress: profileForm }));
      setShowProfileEdit(false);
    } catch (err) { alert('Failed to save profile'); }
  };

  const handleCitySearch = () => {
    if (manualCity.trim()) {
      setSearchFilter('city');
      setSearchQuery(manualCity.trim());
    }
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

  const fetchNearbyAmbulances = async (lat, lng) => {
    try {
      setLoadingNearby(true);
      setNearbyError('');

      const response = await api.get('/ambulance/nearby-ambulances', {
        params: {
          lat,
          lng,
          radius: 25,
          limit: 20,
          ...(selectedType ? { vehicleType: selectedType } : {})
        }
      });

      const data = response?.data?.data;

      if (Array.isArray(data)) {
        setNearbyAmbulances(data);
      } else if (Array.isArray(response?.data)) {
        setNearbyAmbulances(response.data);
      } else {
        setNearbyAmbulances([]);
      }
    } catch (error) {
      console.error('Nearby ambulance error:', error);

      setNearbyAmbulances([]);
      setNearbyError(
        error?.response?.data?.message ||
        'Unable to load nearby ambulances.'
      );
    } finally {
      setLoadingNearby(false);
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
        ambulance.specialty ||
        ambulance.services ||
        ambulance.vehicleType ||
        ''
      ).toLowerCase();

      if (searchFilter === 'city') {
        return city.includes(query);
      }

      if (searchFilter === 'specialty') {
        return specialty.includes(query);
      }

      return (
        providerName.includes(query) ||
        vehicleType.includes(query)
      );
    });
  }, [nearbyAmbulances, searchFilter, searchQuery]);

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = () => {
    const query = searchQuery.trim();

    if (
      !query &&
      searchFilter !== 'nearby' &&
      searchFilter !== 'rated'
    ) {
      return;
    }

    // Search is intentionally kept on the ambulance page.
    // We do NOT redirect to the hospital search page.
    if (searchFilter === 'nearby' || searchFilter === 'rated') {
      setSearchQuery('');
    }
  };

  // ============================================================
  // FILTER CLICK
  // ============================================================

  const handleFilterClick = (filter) => {
    setSearchFilter(filter);

    if (filter === 'nearby' || filter === 'rated') {
      setSearchQuery('');
    }
  };

  // ============================================================
  // BOOK SELECTED TYPE
  // ============================================================

  const handleBookNow = () => {
    if (!user) {
      navigate('/login?redirect=/ambulance');
      return;
    }
    if (selectedAmbulance?.providerId && selectedAmbulance?.vehicleId) {
      openBookingPanel(selectedAmbulance);
      return;
    }
    navigate(`/ambulance/schedule?type=${encodeURIComponent(selectedType)}`);
  };

  const openBookingPanel = (ambulance) => {
    if (!user) {
      navigate('/login?redirect=/ambulance');
      return;
    }
    setSelectedAmbulance(ambulance);
    setBookingError('');
    setShowBookingPanel(true);
    setBookingForm(prev => ({
      ...prev,
      patientName: prev.patientName || user?.name || patientProfile?.name || '',
      patientPhone: prev.patientPhone || user?.phone || patientProfile?.phone || ''
    }));
  };

  const continueSelectedBooking = () => {
    if (!selectedAmbulance?.providerId || !selectedAmbulance?.vehicleId) {
      setBookingError('Please select a valid available ambulance.');
      return;
    }
    if (!bookingForm.patientName.trim() || !bookingForm.patientPhone.trim()) {
      setBookingError('Patient name and phone are required.');
      return;
    }
    if (!bookingForm.destinationAddress.trim()) {
      setBookingError('Destination address is required.');
      return;
    }
    if (!bookingForm.scheduledDate || !bookingForm.scheduledTime) {
      setBookingError('Please select pickup date and time.');
      return;
    }

    const params = new URLSearchParams({
      providerId: String(selectedAmbulance.providerId),
      vehicleId: String(selectedAmbulance.vehicleId),
      vehicleType: String(selectedAmbulance.vehicleType || selectedAmbulance.type || selectedType || 'basic'),
      date: bookingForm.scheduledDate,
      time: bookingForm.scheduledTime,
      destination: bookingForm.destinationAddress,
      couponCode: bookingForm.couponCode || ''
    });

    navigate(`/ambulance/schedule?${params.toString()}`);
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
    const type = String(
      ambulance?.vehicleType || ambulance?.type || selectedType || 'basic'
    ).toLowerCase();

    setSelectedType(type);
    openBookingPanel(ambulance);
  };

  // ============================================================
  // REFRESH LOCATION / AMBULANCES
  // ============================================================

  const handleRefreshNearby = () => {
    if (location?.lat && location?.lng) {
      fetchNearbyAmbulances(location.lat, location.lng);
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
          PATIENT PROFILE / LOCATION
      ====================================================== */}
      {user && (
        <div style={{ margin: '12px 14px', backgroundColor: '#fff', borderRadius: '14px', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {!showProfileEdit ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>📍 {patientProfile?.patientAddress?.city || 'Set your city'}</span>
                  {patientProfile?.patientAddress?.line1 && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>{patientProfile.patientAddress.line1}</p>}
                </div>
                <button onClick={() => setShowProfileEdit(true)} style={{ padding: '6px 12px', backgroundColor: '#e53935', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Edit</button>
              </div>
            </div>
          ) : (
            <div>
              <input placeholder="City" value={profileForm.city} onChange={e => setProfileForm({...profileForm, city: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '8px', fontSize: '13px' }} />
              <input placeholder="Address" value={profileForm.line1} onChange={e => setProfileForm({...profileForm, line1: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '8px', fontSize: '13px' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input placeholder="State" value={profileForm.state} onChange={e => setProfileForm({...profileForm, state: e.target.value})} style={{ flex: 1, padding: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px' }} />
                <input placeholder="Pincode" value={profileForm.pincode} onChange={e => setProfileForm({...profileForm, pincode: e.target.value})} style={{ flex: 1, padding: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={saveProfile} style={{ flex: 1, padding: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save</button>
                <button onClick={() => setShowProfileEdit(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {!user && (
        <div style={{ margin: '12px 14px', backgroundColor: '#fff', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
          <input placeholder="Enter your city to find ambulances" value={manualCity} onChange={e => setManualCity(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '8px', fontSize: '13px' }} />
          <button onClick={handleCitySearch} style={{ width: '100%', padding: '10px', backgroundColor: '#e53935', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>🔍 Find Ambulances</button>
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
            Search
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
              onClick={() => {
                setSearchFilter('city');
                setSearchQuery(manualCity.trim());
              }}
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
                    handleNearbyAmbulance(ambulance)
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
                </button>
              ))}
          </div>
        )}
      </div>

      {/* ======================================================
          SELECTED VEHICLE / BOOKING PANEL
          Existing patient UI is preserved; this is additive.
      ====================================================== */}
      {showBookingPanel && selectedAmbulance && (
        <div style={{
          margin: '0 14px 14px', backgroundColor: '#fff',
          borderRadius: '14px', padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '2px solid #e53935'
        }}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
            <div>
              <h3 style={{margin:0,fontSize:'16px'}}>🚑 Selected Ambulance</h3>
              <div style={{marginTop:'4px',color:'#555',fontSize:'12px'}}>
                {selectedAmbulance.providerName || 'Ambulance Provider'} · {selectedAmbulance.vehicleNumber || 'Vehicle'}
              </div>
            </div>
            <button onClick={() => {setSelectedAmbulance(null);setShowBookingPanel(false);setBookingError('');}}
              style={{border:'none',background:'#f3f4f6',borderRadius:'8px',padding:'7px 10px',cursor:'pointer'}}>Close</button>
          </div>

          <div style={{background:'#f8fafc',borderRadius:'10px',padding:'10px',fontSize:'12px',lineHeight:1.7,marginBottom:'12px'}}>
            <div><b>Type:</b> {getAmbulanceType(selectedAmbulance)}</div>
            <div><b>Distance:</b> {selectedAmbulance.distance ?? '—'} km · <b>ETA:</b> {selectedAmbulance.estimatedETA || '—'} min</div>
            <div>
              <b>Base:</b> ₹{Number(selectedAmbulance.pricing?.baseFare ?? selectedAmbulance.baseFare ?? 0).toLocaleString('en-IN')}
              {' · '}
              <b>Per km:</b> ₹{Number(selectedAmbulance.pricing?.perKmRate ?? selectedAmbulance.perKmRate ?? 0).toLocaleString('en-IN')}
            </div>
            {selectedAmbulance.driverName && <div><b>Driver:</b> {selectedAmbulance.driverName}</div>}
          </div>

          {bookingError && <div style={{background:'#fff5f5',color:'#b91c1c',borderRadius:'8px',padding:'9px',fontSize:'12px',marginBottom:'10px'}}>{bookingError}</div>}

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'8px'}}>
            <input placeholder="Patient name" value={bookingForm.patientName} onChange={e=>updateBookingField('patientName',e.target.value)} style={{padding:'10px',border:'1px solid #ddd',borderRadius:'8px'}} />
            <input placeholder="Patient phone" value={bookingForm.patientPhone} onChange={e=>updateBookingField('patientPhone',e.target.value)} style={{padding:'10px',border:'1px solid #ddd',borderRadius:'8px'}} />
            <input type="date" value={bookingForm.scheduledDate} onChange={e=>updateBookingField('scheduledDate',e.target.value)} style={{padding:'10px',border:'1px solid #ddd',borderRadius:'8px'}} />
            <input type="time" value={bookingForm.scheduledTime} onChange={e=>updateBookingField('scheduledTime',e.target.value)} style={{padding:'10px',border:'1px solid #ddd',borderRadius:'8px'}} />
            <input placeholder="Destination / hospital" value={bookingForm.destinationAddress} onChange={e=>updateBookingField('destinationAddress',e.target.value)} style={{padding:'10px',border:'1px solid #ddd',borderRadius:'8px',gridColumn:'1 / -1'}} />
            <input placeholder="Coupon code (optional)" value={bookingForm.couponCode} onChange={e=>updateBookingField('couponCode',e.target.value)} style={{padding:'10px',border:'1px solid #ddd',borderRadius:'8px'}} />
            <input placeholder="Special requirement (optional)" value={bookingForm.notes} onChange={e=>updateBookingField('notes',e.target.value)} style={{padding:'10px',border:'1px solid #ddd',borderRadius:'8px'}} />
          </div>

          <div style={{marginTop:'10px',background:'#fffbea',padding:'9px',borderRadius:'8px',color:'#854d0e',fontSize:'11px'}}>
            Final fare, discount, availability, payment verification and refund calculations remain backend-authoritative.
          </div>

          <button onClick={continueSelectedBooking} style={{width:'100%',marginTop:'12px',padding:'13px',background:'#e53935',color:'#fff',border:'none',borderRadius:'10px',fontWeight:700,cursor:'pointer'}}>
            Continue to Booking & Payment →
          </button>
        </div>
      )}

      {/* ======================================================
          BOOKING HISTORY SUMMARY
      ====================================================== */}
      {user && (
        <div style={{margin:'0 14px 14px',backgroundColor:'#fff',borderRadius:'14px',padding:'14px',boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3 style={{margin:0,fontSize:'15px',fontWeight:700}}>📋 Recent Ambulance Bookings</h3>
            <button onClick={loadAmbulanceBookings} disabled={loadingBookings} style={{border:'none',background:'transparent',color:'#e53935',fontWeight:700,cursor:'pointer',fontSize:'12px'}}>
              {loadingBookings ? 'Loading...' : '↻ Refresh'}
            </button>
          </div>

          {!loadingBookings && bookingHistory.length === 0 && (
            <div style={{marginTop:'10px',color:'#777',fontSize:'12px'}}>No ambulance bookings yet.</div>
          )}

          {bookingHistory.slice(0,3).map((booking,index)=>(
            <div key={booking.bookingId || booking._id || index} style={{marginTop:'10px',padding:'10px',background:'#fafafa',borderRadius:'9px',fontSize:'12px'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <b>{booking.bookingId || 'Ambulance booking'}</b>
                <b>{booking.status || 'pending'}</b>
              </div>
              <div style={{marginTop:'4px',color:'#666',lineHeight:1.6}}>
                {booking.vehicleNumber && <>🚑 {booking.vehicleNumber}<br/></>}
                {booking.appointmentDate && <>📅 {booking.appointmentDate}<br/></>}
                {booking.destinationAddress && <>📍 {booking.destinationAddress}<br/></>}
                {booking.paymentStatus && <>💳 Payment: {booking.paymentStatus}<br/></>}
                {booking.refundStatus && <>↩️ Refund: {booking.refundStatus}</>}
              </div>
            </div>
          ))}

          {bookingHistory.length > 0 && (
            <button onClick={()=>navigate('/my-bookings')} style={{width:'100%',marginTop:'10px',padding:'10px',background:'#f3f4f6',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:600}}>
              View All Bookings →
            </button>
          )}
        </div>
      )}

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
              onClick={() =>
                setSelectedType(type.value)
              }
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

