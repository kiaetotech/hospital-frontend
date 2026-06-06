import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DiagnosticsCustomPackage = ({ preselectedTests = [] }) => {
  const navigate = useNavigate();
  const [allTests, setAllTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [providers, setProviders] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [homeCollectionOnly, setHomeCollectionOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState('');
  const [directSearchResults, setDirectSearchResults] = useState([]);
  const [showDirectResults, setShowDirectResults] = useState(false);
  
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

  useEffect(() => {
    if (useMyLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => alert('Unable to get location')
      );
    }
  }, [useMyLocation]);

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (preselectedTests && preselectedTests.length > 0) {
      setSelectedTests(preselectedTests);
      handleCompare(preselectedTests);
    }
  }, [preselectedTests]);

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
        results.push({ testName: test.test_name, testId: test._id });
      }
    });
    setDirectSearchResults(results);
    setShowDirectResults(true);
  }, [searchTerm, allTests]);

  const loadTests = async () => {
    try {
      const res = await axios.get(`${API_URL}/diagnostics/tests`);
      if (res.data?.data) setAllTests(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
  };

  const filteredTests = allTests.filter(test => {
    let match = true;
    if (searchTerm && !test.test_name?.toLowerCase().includes(searchTerm.toLowerCase())) match = false;
    return match;
  });

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate('/diagnostics-list')}>← Back</button>
      <h1>Build Custom Package</h1>
      <p>Select 2 or more tests to compare prices across labs.</p>

      {/* Search and Filter Bar */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <input type="text" placeholder="🔍 Search tests..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 2, padding: '12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }} />
          <input type="text" placeholder="📍 City" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <select value={minRating} onChange={(e) => setMinRating(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
            <option value="">⭐ Rating</option>
            <option value="4">4★ & above</option>
            <option value="4.5">4.5★ & above</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="number" placeholder="💰 Max Price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: '130px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input type="number" placeholder="📏 Max Distance" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} style={{ width: '140px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'white', padding: '0 10px', borderRadius: '4px', height: '42px' }}>
            <input type="checkbox" checked={homeCollectionOnly} onChange={(e) => setHomeCollectionOnly(e.target.checked)} />
            🏠 Home Collection
          </label>
          <button onClick={() => setUseMyLocation(true)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📍 My Location</button>
          <button onClick={resetFilters} style={{ backgroundColor: '#6b7280', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
        </div>
        {userLocation && <p style={{ fontSize: '12px', marginTop: '10px', color: '#10b981' }}>📍 Location detected</p>}
      </div>

      {/* Search Results */}
      {showDirectResults && searchTerm && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Search Results ({directSearchResults.length})</h3>
          {directSearchResults.map((result, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '8px' }}>
              <span><strong>{result.testName}</strong></span>
              <label><input type="checkbox" checked={selectedTests.some(t => t.name === result.testName)} onChange={() => toggleTest(result.testName, result.testId)} /> Select</label>
            </div>
          ))}
        </div>
      )}

      {/* All Tests List */}
      {!searchTerm && (
        <div style={{ marginBottom: '1rem', maxHeight: '500px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }}>
          {filteredTests.map(test => (
            <label key={test._id} style={{ display: 'block', padding: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={selectedTests.some(t => t.name === test.test_name)} onChange={() => toggleTest(test.test_name, test._id)} />
              {test.test_name}
            </label>
          ))}
        </div>
      )}
      
      {comparing && <p>Comparing...</p>}
      
      {providers.length > 0 && selectedTests.length >= 2 && (
        <div>
          <h2>Results - Cheapest Provider First</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Provider</th>
                  {selectedTests.map((test, idx) => (
                    <th key={idx} style={{ border: '1px solid #ddd', padding: '8px' }}>{test.name}</th>
                  ))}
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Total</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider, idx) => {
                  const total = selectedTests.reduce((sum, test) => sum + (provider.individual_prices[test.name] || 0), 0);
                  return (
                    <tr key={idx}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{provider.provider_name} {idx === 0 && '⭐'}</td>
                      {selectedTests.map((test, i) => (
                        <td key={i} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                          ₹{provider.individual_prices[test.name] || 'N/A'}
                        </td>
                      ))}
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}><strong>₹{total}</strong></td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                        <button onClick={() => openBookingModal(provider)} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          Book
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
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%' }}>
            <h2>Book Custom Package</h2>
            <p><strong>Provider:</strong> {selectedProvider.provider_name}</p>
            <p><strong>Total:</strong> ₹{selectedTests.reduce((sum, test) => sum + (selectedProvider.individual_prices[test.name] || 0), 0)}</p>
            <form onSubmit={handleBookingSubmit}>
              <div><label>Full Name *</label><input type="text" name="patient_name" required value={bookingForm.patient_name} onChange={handleBookingChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} /></div>
              <div><label>Phone *</label><input type="tel" name="patient_phone" required value={bookingForm.patient_phone} onChange={handleBookingChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} /></div>
              <div><label>Date *</label><input type="date" name="appointment_date" required value={bookingForm.appointment_date} onChange={handleBookingChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} /></div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Confirm</button>
                <button type="button" onClick={closeBookingModal} style={{ flex: 1, backgroundColor: '#6b7280', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsCustomPackage;