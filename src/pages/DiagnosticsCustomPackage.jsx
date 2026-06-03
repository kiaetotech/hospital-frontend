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
  const [sortBy, setSortBy] = useState('price');
  const [filters, setFilters] = useState({
    maxPrice: '',
    minRating: '',
    homeCollectionOnly: false
  });
  const [userLocation, setUserLocation] = useState(null);
  const [useMyLocation, setUseMyLocation] = useState(false);

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
    if (selectedTests.find(t => t._id === test._id)) {
      setSelectedTests(selectedTests.filter(t => t._id !== test._id));
      setProviders([]);
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handleCompare = async () => {
    if (selectedTests.length < 2) {
      alert('Please select at least 2 tests to compare');
      return;
    }
    
    setComparing(true);
    try {
      const testIds = selectedTests.map(t => t._id);
      const res = await api.post('/diagnostics/compare-package', { 
        testIds,
        lat: userLocation?.lat,
        lng: userLocation?.lng
      });
      setProviders(res.data.providers || []);
    } catch (error) {
      console.error('Compare error:', error);
      alert('Error comparing packages');
    } finally {
      setComparing(false);
    }
  };

  const handleBook = (provider) => {
    const total = selectedTests.reduce((sum, test) => {
      return sum + (provider.individual_prices[test._id] || 0);
    }, 0);
    alert(`Booking package with ${provider.provider_name}\nTotal: ₹${total}\nProceeding to payment...`);
  };

  // Apply filters and sorting to providers
  const getFilteredAndSortedProviders = () => {
    let filtered = [...providers];
    
    // Apply filters
    if (filters.maxPrice) {
      filtered = filtered.filter(p => {
        const total = selectedTests.reduce((sum, test) => sum + (p.individual_prices[test._id] || 0), 0);
        return total <= parseInt(filters.maxPrice);
      });
    }
    if (filters.minRating) {
      filtered = filtered.filter(p => p.rating >= parseFloat(filters.minRating));
    }
    if (filters.homeCollectionOnly) {
      filtered = filtered.filter(p => p.home_collection === true);
    }
    
    // Apply sorting
    if (sortBy === 'price') {
      filtered.sort((a, b) => {
        const totalA = selectedTests.reduce((sum, test) => sum + (a.individual_prices[test._id] || 0), 0);
        const totalB = selectedTests.reduce((sum, test) => sum + (b.individual_prices[test._id] || 0), 0);
        return totalA - totalB;
      });
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'distance') {
      filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    } else if (sortBy === 'homeCollection') {
      filtered.sort((a, b) => (b.home_collection ? 1 : 0) - (a.home_collection ? 1 : 0));
    }
    
    return filtered;
  };

  const getUserLocation = () => {
    setUseMyLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
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

  const sortedProviders = getFilteredAndSortedProviders();
  const bestProvider = sortedProviders[0];

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <button onClick={() => navigate('/diagnostics-list')} style={{ marginBottom: '1rem', cursor: 'pointer' }}>← Back to Tests</button>
      
      <h1>✨ Build Your Custom Package</h1>
      <p>Select multiple tests to compare prices across different labs.</p>
      
      {/* Test Selection Area */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1rem' }}
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', padding: '0.5rem', borderRadius: '8px' }}>
          {filteredTests.map(test => (
            <label key={test._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem' }}>
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
          {selectedTests.length >= 2 && (
            <button onClick={handleCompare} disabled={comparing} style={{ marginLeft: '0.5rem', backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
              {comparing ? 'Comparing...' : `Compare Prices (${selectedTests.length} tests)`}
            </button>
          )}
        </div>
      )}
      
      {/* Filters and Sort Section */}
      {providers.length > 0 && (
        <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Filter & Sort Results</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div>
              <label>Max Price: </label>
              <input type="number" placeholder="Any" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} style={{ width: '100px', padding: '0.25rem' }} />
            </div>
            <div>
              <label>Min Rating: </label>
              <select value={filters.minRating} onChange={(e) => setFilters({...filters, minRating: e.target.value})} style={{ padding: '0.25rem' }}>
                <option value="">Any</option>
                <option value="4">4★ & up</option>
                <option value="4.5">4.5★ & up</option>
                <option value="4.8">4.8★ & up</option>
              </select>
            </div>
            <div>
              <label>
                <input type="checkbox" checked={filters.homeCollectionOnly} onChange={(e) => setFilters({...filters, homeCollectionOnly: e.target.checked})} />
                Home Collection Only
              </label>
            </div>
            <div>
              <button onClick={getUserLocation} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                📍 Use My Location
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span><strong>Sort by:</strong></span>
            <button onClick={() => setSortBy('price')} style={{ backgroundColor: sortBy === 'price' ? '#10b981' : '#e5e7eb', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Price (Low to High)</button>
            <button onClick={() => setSortBy('rating')} style={{ backgroundColor: sortBy === 'rating' ? '#10b981' : '#e5e7eb', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Rating (High to Low)</button>
            <button onClick={() => setSortBy('distance')} style={{ backgroundColor: sortBy === 'distance' ? '#10b981' : '#e5e7eb', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Distance (Nearest First)</button>
            <button onClick={() => setSortBy('homeCollection')} style={{ backgroundColor: sortBy === 'homeCollection' ? '#10b981' : '#e5e7eb', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Home Collection Available</button>
          </div>
        </div>
      )}
      
      {/* Comparison Table */}
      {providers.length > 0 && (
        <div>
          {/* Best Option Banner */}
          {bestProvider && (
            <div style={{ backgroundColor: '#d1fae5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <h3>🏆 Best Option: {bestProvider.provider_name}</h3>
              <p>
                Total Price: ₹{selectedTests.reduce((sum, test) => sum + (bestProvider.individual_prices[test._id] || 0), 0)} | 
                Rating: ⭐ {bestProvider.rating} | 
                Distance: {bestProvider.distance ? `${bestProvider.distance} km` : 'N/A'} |
                Home Collection: {bestProvider.home_collection ? '✅ Yes' : '❌ No'}
              </p>
              <button onClick={() => handleBook(bestProvider)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Book This Package
              </button>
            </div>
          )}
          
          {/* Comparison Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '12px', border: '1px solid #ddd', minWidth: '150px' }}>Provider / Test</th>
                  {selectedTests.map(test => (
                    <th key={test._id} style={{ padding: '12px', border: '1px solid #ddd', minWidth: '120px' }}>{test.test_name}</th>
                  ))}
                  <th style={{ padding: '12px', border: '1px solid #ddd', minWidth: '100px' }}>Total</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', minWidth: '100px' }}>Rating</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', minWidth: '100px' }}>Distance</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', minWidth: '100px' }}>Home Coll.</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', minWidth: '100px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedProviders.map((provider, idx) => {
                  const total = selectedTests.reduce((sum, test) => sum + (provider.individual_prices[test._id] || 0), 0);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                        {provider.provider_name}
                      </td>
                      {selectedTests.map(test => (
                        <td key={test._id} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                          ₹{provider.individual_prices[test._id] || 'N/A'}
                        </td>
                      ))}
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: '#10b981' }}>
                        ₹{total}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                        ⭐ {provider.rating} ({provider.total_reviews})
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                        {provider.distance ? `${provider.distance} km` : 'N/A'}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                        {provider.home_collection ? '✅ Yes' : '❌ No'}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                        <button onClick={() => handleBook(provider)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
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
      
      {providers.length === 0 && selectedTests.length >= 2 && !comparing && (
        <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
          <p>No labs found that offer all selected tests. Try selecting different tests or check your filters.</p>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsCustomPackage;