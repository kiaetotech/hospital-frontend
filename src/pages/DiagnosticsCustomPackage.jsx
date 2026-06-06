import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DiagnosticsCustomPackage = ({ preselectedTests = [] }) => {
  const navigate = useNavigate();
  const [allTests, setAllTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [providers, setProviders] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  
  // Filter states (same as Lab Tests)
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [homeCollectionOnly, setHomeCollectionOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState('');
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [directSearchResults, setDirectSearchResults] = useState([]);
  const [showDirectResults, setShowDirectResults] = useState(false);
  
  // Booking modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    patient_name: '',
    patient_age: '',
    patient_gender: 'male',
    patient_phone: '',
    patient_email: '',
    appointment_date: '',
    home_collection_requested: false,
    home_address: ''
  });

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  // Get user location
  useEffect(() => {
    if (useMyLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => alert('Unable to get location')
      );
    }
  }, [useMyLocation]);

  // Load tests
  useEffect(() => {
    loadTests();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [searchTerm, cityFilter, minRating, maxPrice, homeCollectionOnly, maxDistance, allTests]);

  // Search effect - direct results
  useEffect(() => {
    if (!searchTerm.trim()) {
      setShowDirectResults(false);
      setDirectSearchResults([]);
      return;
    }
    const lowerSearch = searchTerm.toLowerCase();
    const results = [];
    allTests.forEach(test => {
      if (test.test_name && test.test_name.toLowerCase().includes(lowerSearch)) {
        results.push({ testName: test.test_name, testId: test._id, category: test.major_category_name || 'Lab Test' });
      }
    });
    setDirectSearchResults(results);
    setShowDirectResults(true);
  }, [searchTerm, allTests]);

  useEffect(() => {
    if (preselectedTests && preselectedTests.length > 0) {
      setSelectedTests(preselectedTests.map(t => ({ name: t, id: t._id || t })));
      handleCompareByName(preselectedTests);
    }
  }, [preselectedTests]);

  const loadTests = async () => {
    try {
      const res = await axios.get(`${API_URL}/diagnostics/tests`);
      if (res.data?.data) {
        setAllTests(res.data.data);
        setFilteredTests(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allTests];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(test => 
        test.test_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // City filter (mock - would come from API)
    if (cityFilter) {
      filtered = filtered.filter(test => 
        test.major_category_name?.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }
    
    // Rating filter (mock)
    if (minRating) {
      filtered = filtered.filter(() => true);
    }
    
    // Price filter (mock)
    if (maxPrice) {
      filtered = filtered.filter(() => true);
    }
    
    // Home collection filter (mock)
    if (homeCollectionOnly) {
      filtered = filtered.filter(() => true);
    }
    
    // Distance filter (mock)
    if (maxDistance) {
      filtered = filtered.filter(() => true);
    }
    
    setFilteredTests(filtered);
  };

  const toggleTest = (testName, testId) => {
    let newSelected;
    if (selectedTests.find(t => t.name === testName)) {
      newSelected = selectedTests.filter(t => t.name !== testName);
      setSelectedTests(newSelected);
      if (newSelected.length >= 2) {
        handleCompare(newSelected);
      } else {
        setProviders([]);
      }
    } else {
      newSelected = [...selectedTests, { name: testName, id: testId }];
      setSelectedTests(newSelected);
      if (newSelected.length >= 2) {
        handleCompare(newSelected);
      }
    }
  };

  const handleCompare = async (tests) => {
    if (tests.length < 2) return;
    setComparing(true);
    try {
      const testIds = tests.map(t => t.id);
      const res = await axios.post(`${API_URL}/diagnostics/compare-package`, { 
        testIds,
        lat: userLocation?.lat,
        lng: userLocation?.lng
      });
      if (res.data.providers) {
        const sorted = [...res.data.providers].sort((a, b) => {
          const totalA = tests.reduce((s, t) => s + (a.individual_prices[t.name] || 0), 0);
          const totalB = tests.reduce((s, t) => s + (b.individual_prices[t.name] || 0), 0);
          return totalA - totalB;
        });
        setProviders(sorted);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setComparing(false);
    }
  };

  const handleCompareByName = async (testNames) => {
    if (testNames.length < 2) return;
    setComparing(true);
    try {
      const testsRes = await axios.get(`${API_URL}/diagnostics/tests`);
      const allTestsData = testsRes.data?.data || [];
      
      const testIds = [];
      testNames.forEach(name => {
        const found = allTestsData.find(t => t.test_name === name);
        if (found) testIds.push(found._id);
      });
      
      if (testIds.length < 2) return;
      
      const res = await axios.post(`${API_URL}/diagnostics/compare-package`, { 
        testIds,
        lat: userLocation?.lat,
        lng: userLocation?.lng
      });
      if (res.data.providers) {
        const sorted = [...res.data.providers].sort((a, b) => {
          const totalA = testNames.reduce((s, name) => s + (a.individual_prices[name] || 0), 0);
          const totalB = testNames.reduce((s, name) => s + (b.individual_prices[name] || 0), 0);
          return totalA - totalB;
        });
        setProviders(sorted);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setComparing(false);
    }
  };

  const openBookingModal = (provider) => {
    setSelectedProvider(provider);
    setShowBookingModal(true);
  };

  const handleBookingChange = (e) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProvider) return;
    const total = selectedTests.reduce((sum, test) => sum + (selectedProvider.individual_prices[test.name] || 0), 0);
    alert(`Booking successful!\nProvider: ${selectedProvider.provider_name}\nTotal: ₹${total}`);
    setShowBookingModal(false);
    setSelectedProvider(null);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedProvider(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCityFilter('');
    setMinRating('');
    setMaxPrice('');
    setHomeCollectionOnly(false);
    setMaxDistance('');
    setUseMyLocation(false);
    setFilteredTests(allTests);
  };

  const getDistance = (provider) => {
    if (!userLocation || !provider.location?.lat) {
      return Math.floor(Math.random() * 15) + 1;
    }
    const lat1 = userLocation.lat;
    const lon1 = userLocation.lng;
    const lat2 = provider.location.lat;
    const lon2 = provider.location.lng;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate('/diagnostics-list')}>← Back</button>
      <h1>Build Custom Package</h1>
      <p>Select 2 or more tests to compare prices across labs.</p>

      {/* Search and Filter Bar - Same as Lab Tests */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <input 
            type="text" 
            placeholder="🔍 Search any test (e.g., MRI Brain, CBC, X-ray)..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={{ flex: 2, padding: '12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }} 
          />
          <input 
            type="text" 
            placeholder="📍 City (e.g., Mumbai, Delhi)" 
            value={cityFilter} 
            onChange={(e) => setCityFilter(e.target.value)} 
            style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} 
          />
          <select value={minRating} onChange={(e) => setMinRating(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
            <option value="">⭐ Rating (Any)</option>
            <option value="4">4★ & above</option>
            <option value="4.5">4.5★ & above</option>
            <option value="4.8">4.8★ & above</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input 
            type="number" 
            placeholder="💰 Max Price (₹)" 
            value={maxPrice} 
            onChange={(e) => setMaxPrice(e.target.value)} 
            style={{ width: '130px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} 
          />
          <input 
            type="number" 
            placeholder="📏 Max Distance (km)" 
            value={maxDistance} 
            onChange={(e) => setMaxDistance(e.target.value)} 
            style={{ width: '140px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} 
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'white', padding: '0 10px', borderRadius: '4px', height: '42px' }}>
            <input type="checkbox" checked={homeCollectionOnly} onChange={(e) => setHomeCollectionOnly(e.target.checked)} />
            🏠 Home Collection Only
          </label>
          <button onClick={() => setUseMyLocation(true)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📍 Use My Location</button>
          <button onClick={resetFilters} style={{ backgroundColor: '#6b7280', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset Filters</button>
        </div>
        
        {userLocation && <p style={{ fontSize: '12px', marginTop: '10px', color: '#10b981' }}>📍 Location detected: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>}
        {searchTerm && <p style={{ fontSize: '12px', marginTop: '10px' }}>Found {directSearchResults.length} tests matching "{searchTerm}"</p>}
      </div>

      {/* Direct Search Results */}
      {showDirectResults && searchTerm && (
        <div style={{ marginBottom: '20px' }}>
          <h3>🔍 Search Results ({directSearchResults.length})</h3>
          {directSearchResults.map((result, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '8px' }}>
              <div><strong>{result.testName}</strong> <span style={{ fontSize: '12px', color: '#6b7280' }}>{result.category}</span></div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={selectedTests.some(t => t.name === result.testName)} onChange={() => toggleTest(result.testName, result.testId)} />
                  Select
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Tests List - Filtered */}
      {!searchTerm && (
        <div style={{ marginBottom: '1rem', maxHeight: '500px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }}>
          <p>Total tests: {filteredTests.length} | Selected: {selectedTests.length}</p>
          {filteredTests.map(test => (
            <label key={test._id} style={{ display: 'block', padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
              <input type="checkbox" checked={selectedTests.some(t => t.name === test.test_name)} onChange={() => toggleTest(test.test_name, test._id)} />
              {test.test_name}
              <span style={{ fontSize: '11px', color: '#888', marginLeft: '10px' }}>{test.major_category_name}</span>
            </label>
          ))}
        </div>
      )}
      
      {comparing && <p style={{ marginTop: '20px' }}>Comparing...</p>}
      
      {providers.length > 0 && selectedTests.length >= 2 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Comparison Results - Cheapest Provider First</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Provider</th>
                  {selectedTests.map((test, idx) => (
                    <th key={idx} style={{ border: '1px solid #ddd', padding: '8px' }}>{test.name}</th>
                  ))}
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Total</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Rating</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Distance</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Home Coll.</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Action</th>
                </table>
              </thead>
              <tbody>
                {providers.map((provider, idx) => {
                  const total = selectedTests.reduce((sum, test) => sum + (provider.individual_prices[test.name] || 0), 0);
                  const distance = getDistance(provider);
                  return (
                    <tr key={idx}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{provider.provider_name} {idx === 0 && '⭐'}</td>
                      {selectedTests.map((test, i) => (
                        <td key={i} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                          ₹{provider.individual_prices[test.name] || 'N/A'}
                        </td>
                      ))}
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}><strong>₹{total}</strong></td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>⭐ {provider.rating || 4.5}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{distance} km</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{provider.home_collection ? '✅' : '❌'}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                        <button onClick={() => openBookingModal(provider)} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          Book Now
                        </button>
                      </td>
                     </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedProvider && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2>Book Custom Package</h2>
            <p><strong>Provider:</strong> {selectedProvider.provider_name}</p>
            <p><strong>Tests:</strong> {selectedTests.map(t => t.name).join(', ')}</p>
            <p><strong>Total Amount:</strong> ₹{selectedTests.reduce((sum, test) => sum + (selectedProvider.individual_prices[test.name] || 0), 0)}</p>
            
            <form onSubmit={handleBookingSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Full Name *</label>
                <input type="text" name="patient_name" required value={bookingForm.patient_name} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Age *</label>
                  <input type="number" name="patient_age" required value={bookingForm.patient_age} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Gender *</label>
                  <select name="patient_gender" value={bookingForm.patient_gender} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Phone Number *</label>
                <input type="tel" name="patient_phone" required value={bookingForm.patient_phone} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                <input type="email" name="patient_email" value={bookingForm.patient_email} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Appointment Date *</label>
                <input type="date" name="appointment_date" required value={bookingForm.appointment_date} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              {selectedProvider.home_collection_available && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" name="home_collection_requested" checked={bookingForm.home_collection_requested} onChange={(e) => setBookingForm({...bookingForm, home_collection_requested: e.target.checked})} />
                    Request Home Collection
                  </label>
                </div>
              )}
              {bookingForm.home_collection_requested && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Home Address</label>
                  <textarea name="home_address" rows="3" value={bookingForm.home_address} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
              )}
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>Confirm Booking</button>
                <button type="button" onClick={closeBookingModal} style={{ flex: 1, backgroundColor: '#6b7280', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsCustomPackage;