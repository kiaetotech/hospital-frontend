import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const DiagnosticsCustomPackage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectIds = queryParams.get('preselect')?.split(',') || [];
  
  const [allTests, setAllTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [comparing, setComparing] = useState(false);
  const [providers, setProviders] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [useMyLocation, setUseMyLocation] = useState(false);
  
  // Search/filter for providers table
  const [providerSearchTerm, setProviderSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [homeCollectionFilter, setHomeCollectionFilter] = useState(false);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation && useMyLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {}
      );
    }
  }, [useMyLocation]);

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (preselectIds.length > 0 && allTests.length > 0) {
      const preselected = allTests.filter(t => preselectIds.includes(t._id));
      setSelectedTests(preselected);
      if (preselected.length >= 2) {
        handleCompare(preselected);
      }
    }
  }, [allTests, preselectIds]);

  const loadTests = async () => {
    try {
      const res = await api.get('/diagnostics/tests');
      if (res.data?.data) setAllTests(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTest = (test) => {
    let newSelected;
    if (selectedTests.find(t => t._id === test._id)) {
      newSelected = selectedTests.filter(t => t._id !== test._id);
      setSelectedTests(newSelected);
      if (newSelected.length >= 2) {
        handleCompare(newSelected);
      } else {
        setProviders([]);
      }
    } else {
      newSelected = [...selectedTests, test];
      setSelectedTests(newSelected);
      if (newSelected.length >= 2) {
        handleCompare(newSelected);
      }
    }
  };

  const handleCompare = async (tests = selectedTests) => {
    if (tests.length < 2) {
      alert('Please select at least 2 tests to compare');
      return;
    }
    
    setComparing(true);
    try {
      const testIds = tests.map(t => t._id);
      const res = await api.post('/diagnostics/compare-package', { 
        testIds,
        lat: userLocation?.lat,
        lng: userLocation?.lng
      });
      setProviders(res.data.providers || []);
    } catch (error) {
      console.error('Compare error:', error);
      alert('Error comparing packages. Please try again.');
    } finally {
      setComparing(false);
    }
  };

  const handleBook = (provider) => {
    const total = selectedTests.reduce((sum, test) => {
      return sum + (provider.individual_prices[test._id] || 0);
    }, 0);
    alert(`Booking package with ${provider.provider_name}\nTotal: ₹${total}\nProceeding to payment...`);
    // Navigate to payment page with booking details
    // navigate('/payment', { state: { provider, tests: selectedTests, total } });
  };

  // Filter and sort providers
  const getFilteredProviders = () => {
    let filtered = [...providers];
    
    // Search by provider name
    if (providerSearchTerm) {
      filtered = filtered.filter(p => 
        p.provider_name.toLowerCase().includes(providerSearchTerm.toLowerCase())
      );
    }
    
    // Filter by max price
    if (priceFilter) {
      filtered = filtered.filter(p => {
        const total = selectedTests.reduce((sum, test) => sum + (p.individual_prices[test._id] || 0), 0);
        return total <= parseInt(priceFilter);
      });
    }
    
    // Filter by min rating
    if (ratingFilter) {
      filtered = filtered.filter(p => p.rating >= parseFloat(ratingFilter));
    }
    
    // Filter by home collection
    if (homeCollectionFilter) {
      filtered = filtered.filter(p => p.home_collection === true);
    }
    
    // Sort by total price (lowest first)
    filtered.sort((a, b) => {
      const totalA = selectedTests.reduce((sum, test) => sum + (a.individual_prices[test._id] || 0), 0);
      const totalB = selectedTests.reduce((sum, test) => sum + (b.individual_prices[test._id] || 0), 0);
      return totalA - totalB;
    });
    
    return filtered;
  };

  const getUserLocation = () => {
    setUseMyLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          if (selectedTests.length >= 2) {
            handleCompare(selectedTests);
          }
        },
        () => alert('Unable to get location')
      );
    } else {
      alert('Geolocation not supported');
    }
  };

  const filteredTests = allTests.filter(test =>
    test.test_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProviders = getFilteredProviders();
  const cheapestProvider = filteredProviders[0];

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <button onClick={() => navigate('/diagnostics-list')} style={{ marginBottom: '1rem', cursor: 'pointer' }}>← Back to Tests</button>
      
      <h1>✨ Build Your Custom Package</h1>
      <p>Select multiple tests to compare prices across different labs. Cheapest provider appears first.</p>
      
      {/* Test Selection Area */}
      <div style={{ marginBottom: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
        <h3>Select Tests to Compare:</h3>
        <input
          type="text"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1rem' }}
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
          {filteredTests.map(test => (
            <label key={test._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!selectedTests.find(t => t._id === test._id)}
                onChange={() => toggleTest(test)}
              />
              <span>{test.test_name}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Selected Tests Summary */}
      {selectedTests.length > 0 && (
        <div style={{ backgroundColor: '#e0e7ff', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <strong>Selected Tests ({selectedTests.length}):</strong>
          {selectedTests.map(t => (
            <span key={t._id} style={{ display: 'inline-block', backgroundColor: '#3b82f6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', margin: '0.25rem', fontSize: '0.75rem' }}>
              {t.test_name}
              <button onClick={() => toggleTest(t)} style={{ background: 'none', border: 'none', color: 'white', marginLeft: '0.25rem', cursor: 'pointer' }}>×</button>
            </span>
          ))}
        </div>
      )}
      
      {/* Comparison Results */}
      {providers.length > 0 && selectedTests.length >= 2 && (
        <div>
          {/* Search/Filter Bar for Providers Table */}
          <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>🔍 Filter Labs</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Search lab name..."
                value={providerSearchTerm}
                onChange={(e) => setProviderSearchTerm(e.target.value)}
                style={{ flex: 2, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <input
                type="number"
                placeholder="Max Total Price (₹)"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="">All Ratings</option>
                <option value="4">4★ & above</option>
                <option value="4.5">4.5★ & above</option>
                <option value="4.8">4.8★ & above</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: 'white', borderRadius: '4px' }}>
                <input type="checkbox" checked={homeCollectionFilter} onChange={(e) => setHomeCollectionFilter(e.target.checked)} />
                Home Collection Only
              </label>
              <button onClick={getUserLocation} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                📍 Use My Location
              </button>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Showing {filteredProviders.length} of {providers.length} labs | Sorted by lowest total price
            </div>
          </div>
          
          {/* Best Option Banner */}
          {cheapestProvider && (
            <div style={{ backgroundColor: '#d1fae5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <h3>🏆 Best Value: {cheapestProvider.provider_name}</h3>
              <p>
                Total Price: ₹{selectedTests.reduce((sum, test) => sum + (cheapestProvider.individual_prices[test._id] || 0), 0)} | 
                Rating: ⭐ {cheapestProvider.rating} | 
                Distance: {cheapestProvider.distance ? `${cheapestProvider.distance} km` : 'N/A'} |
                Home Collection: {cheapestProvider.home_collection ? '✅ Yes' : '❌ No'}
              </p>
              <button onClick={() => handleBook(cheapestProvider)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Book This Package
              </button>
            </div>
          )}
          
          {/* Comparison Table - Providers as Columns */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '12px', border: '1px solid #ddd', minWidth: '150px', position: 'sticky', left: 0, backgroundColor: '#f3f4f6' }}>Test / Lab</th>
                  {filteredProviders.map((provider, idx) => (
                    <th key={idx} style={{ padding: '12px', border: '1px solid #ddd', minWidth: '150px', backgroundColor: idx === 0 ? '#d1fae5' : '#f3f4f6' }}>
                      {provider.provider_name}
                      {idx === 0 && <span style={{ display: 'block', fontSize: '0.75rem', color: '#10b981' }}>⭐ Cheapest</span>}
                    </th>
                  ))}
                </tr>
                <tr style={{ backgroundColor: '#e5e7eb' }}>
                  <th style={{ padding: '8px', border: '1px solid #ddd', position: 'sticky', left: 0, backgroundColor: '#e5e7eb' }}>Details</th>
                  {filteredProviders.map((provider, idx) => (
                    <th key={idx} style={{ padding: '8px', border: '1px solid #ddd', fontSize: '0.75rem' }}>
                      ⭐ {provider.rating} | {provider.distance ? `${provider.distance}km` : 'N/A'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price Row for each test */}
                {selectedTests.map(test => (
                  <tr key={test._id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', position: 'sticky', left: 0, backgroundColor: 'white' }}>
                      {test.test_name}
                    </td>
                    {filteredProviders.map((provider, idx) => (
                      <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', backgroundColor: idx === 0 ? '#f0fdf4' : 'white' }}>
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>₹{provider.individual_prices[test._id] || 'N/A'}</span>
                      </td>
                    ))}
                  </tr>
                ))}
                
                {/* Total Price Row */}
                <tr style={{ backgroundColor: '#fef3c7', fontWeight: 'bold' }}>
                  <td style={{ padding: '10px', border: '1px solid #ddd', position: 'sticky', left: 0, backgroundColor: '#fef3c7' }}>Total Price</td>
                  {filteredProviders.map((provider, idx) => {
                    const total = selectedTests.reduce((sum, test) => sum + (provider.individual_prices[test._id] || 0), 0);
                    return (
                      <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', backgroundColor: idx === 0 ? '#d1fae5' : '#fef3c7' }}>
                        <span style={{ fontSize: '1.1rem' }}>₹{total}</span>
                      </td>
                    );
                  })}
                </tr>
                
                {/* Features Row */}
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ddd', position: 'sticky', left: 0, backgroundColor: 'white' }}>Home Collection</td>
                  {filteredProviders.map((provider, idx) => (
                    <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {provider.home_collection ? '✅ Yes' : '❌ No'}
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ddd', position: 'sticky', left: 0, backgroundColor: 'white' }}>Report Time</td>
                  {filteredProviders.map((provider, idx) => (
                    <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {provider.report_time_hours || 24} hours
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ddd', position: 'sticky', left: 0, backgroundColor: 'white' }}>Total Reviews</td>
                  {filteredProviders.map((provider, idx) => (
                    <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {provider.total_reviews || 0} reviews
                    </td>
                  ))}
                </tr>
                
                {/* Action Row */}
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ddd', position: 'sticky', left: 0, backgroundColor: 'white' }}>Action</td>
                  {filteredProviders.map((provider, idx) => (
                    <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <button onClick={() => handleBook(provider)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Book Now
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {providers.length === 0 && selectedTests.length >= 2 && !comparing && (
        <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
          <p>No labs found that offer all selected tests. Try selecting different tests or adjusting your filters.</p>
        </div>
      )}
      
      {comparing && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading comparison data...</div>
      )}
    </div>
  );
};

export default DiagnosticsCustomPackage;