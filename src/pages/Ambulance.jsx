import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNearbyAmbulances } from '../services/api';

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
    }

    getLocation();
  }, []);

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

        if (error.code === 1) {
          setNearbyError(
            'Location permission denied. Please allow location access to find nearby ambulances.'
          );
        } else {
          setNearbyError(
            'Unable to get your location. You can still use Emergency or Schedule Transport.'
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

      const response = await getNearbyAmbulances({
        lat,
        lng,
        radius: 10
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

    navigate(`/ambulance/schedule?type=${selectedType}`);
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
    const type =
      ambulance.vehicleType ||
      ambulance.type ||
      selectedType ||
      'basic';

    setSelectedType(String(type).toLowerCase());

    navigate(
      `/ambulance/schedule?type=${encodeURIComponent(
        String(type).toLowerCase()
      )}`
    );
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