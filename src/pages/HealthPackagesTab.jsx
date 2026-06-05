import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HealthPackagesTab = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [homeCollectionOnly, setHomeCollectionOnly] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [useLocation, setUseLocation] = useState(false);
  const [expandedPackages, setExpandedPackages] = useState({});
  const [minRating, setMinRating] = useState('');
  const [maxDistance, setMaxDistance] = useState('');

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    if (useLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => console.log('Location denied')
      );
    }
  }, [useLocation]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, minPrice, maxPrice, minRating, maxDistance, homeCollectionOnly, packages, userLocation]);

  const loadPackages = async () => {
    try {
      const res = await axios.get(`${API_URL}/health-packages`);
      setPackages(res.data.packages || []);
      setFilteredPackages(res.data.packages || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDistance = (pkg) => {
    if (!userLocation || !pkg.provider_id?.location?.lat) {
      return Math.floor(Math.random() * 15) + 1;
    }
    const lat1 = userLocation.lat;
    const lon1 = userLocation.lng;
    const lat2 = pkg.provider_id.location.lat;
    const lon2 = pkg.provider_id.location.lng;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const applyFilters = () => {
    let filtered = [...packages];
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.package_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (minPrice) filtered = filtered.filter(p => p.discounted_price >= parseFloat(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.discounted_price <= parseFloat(maxPrice));
    if (homeCollectionOnly) filtered = filtered.filter(p => p.home_collection_available === true);
    if (minRating) filtered = filtered.filter(p => (p.provider_id?.rating || 0) >= parseFloat(minRating));
    if (maxDistance) {
      filtered = filtered.filter(p => {
        const distance = parseFloat(getDistance(p));
        return distance <= parseFloat(maxDistance);
      });
    }
    setFilteredPackages(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setMaxDistance('');
    setHomeCollectionOnly(false);
    setFilteredPackages(packages);
  };

  const toggleSelect = (pkg) => {
    if (selectedPackages.find(p => p._id === pkg._id)) {
      setSelectedPackages(selectedPackages.filter(p => p._id !== pkg._id));
    } else if (selectedPackages.length < 4) {
      setSelectedPackages([...selectedPackages, pkg]);
    } else {
      alert('You can compare up to 4 packages');
    }
  };

  const handleCompare = () => {
    if (selectedPackages.length >= 2) {
      setShowCompare(true);
    } else {
      alert('Select at least 2 packages');
    }
  };

  const toggleExpand = (packageId) => {
    setExpandedPackages(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  if (showCompare) {
    const sortedPackages = [...selectedPackages].sort((a, b) => a.discounted_price - b.discounted_price);
    return (
      <div>
        <button onClick={() => setShowCompare(false)}>← Back to Packages</button>
        <h3>Compare Packages</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr>
              <th>Feature</th>
              {sortedPackages.map((p, idx) => (
                <th key={idx}>{p.package_name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Price</td>
              {sortedPackages.map((p, i) => <td key={i}>₹{p.discounted_price}</td>)}
            </tr>
            <tr>
              <td>Provider</td>
              {sortedPackages.map((p, i) => <td key={i}>{p.provider_id?.provider_name}</td>)}
            </tr>
            <tr>
              <td>Rating</td>
              {sortedPackages.map((p, i) => <td key={i}>⭐ {p.provider_id?.rating}</td>)}
            </tr>
            <tr>
              <td>Distance</td>
              {sortedPackages.map((p, i) => <td key={i}>{getDistance(p)} km</td>)}
            </tr>
            <tr>
              <td>Home Collection</td>
              {sortedPackages.map((p, i) => <td key={i}>{p.home_collection_available ? 'Yes' : 'No'}</td>)}
            </tr>
            <tr>
              <td>Report Time</td>
              {sortedPackages.map((p, i) => <td key={i}>{p.report_time_hours} hrs</td>)}
            </tr>
            <tr>
              <td>Action</td>
              {sortedPackages.map((p, i) => <td key={i}><button onClick={() => alert(`Booking ${p.package_name}`)}>Book</button></td>)}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <h2>🏥 Health Packages</h2>
      <p>Select packages to compare prices, features, and more</p>

      <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
          <input type="text" placeholder="🔍 Search packages..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <button onClick={resetFilters} style={{ backgroundColor: '#ef4444', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
          <button onClick={() => setUseLocation(true)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📍 My Location</button>
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '12px' }}>💰 Min Price</label>
            <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px' }}>💰 Max Price</label>
            <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px' }}>⭐ Min Rating</label>
            <select value={minRating} onChange={(e) => setMinRating(e.target.value)} style={{ width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="">Any</option>
              <option value="4">4★ & above</option>
              <option value="4.5">4.5★ & above</option>
              <option value="4.8">4.8★ & above</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px' }}>📏 Max Distance</label>
            <input type="number" placeholder="Max km" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} style={{ width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input type="checkbox" checked={homeCollectionOnly} onChange={(e) => setHomeCollectionOnly(e.target.checked)} />
              🏠 Home Collection
            </label>
          </div>
        </div>
        
        <div style={{ fontSize: '12px', marginTop: '15px' }}>
          Found {filteredPackages.length} packages | {selectedPackages.length} selected
        </div>
      </div>

      {selectedPackages.length >= 2 && (
        <button onClick={handleCompare} style={{ position: 'fixed', bottom: 20, right: 20, backgroundColor: '#10b981', color: 'white', padding: '15px 30px', border: 'none', borderRadius: 50, cursor: 'pointer', zIndex: 1000 }}>
          Compare ({selectedPackages.length})
        </button>
      )}

      {loading ? (
        <div>Loading packages...</div>
      ) : filteredPackages.length === 0 ? (
        <div>No packages found</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
          {filteredPackages.map(pkg => {
            const testsList = pkg.tests_included_text ? pkg.tests_included_text.split(',').map(t => t.trim()) : [];
            const isSelected = selectedPackages.some(p => p._id === pkg._id);
            const distance = getDistance(pkg);
            const isExpanded = expandedPackages[pkg._id] || false;
            return (
              <div key={pkg._id} style={{ border: `1px solid ${isSelected ? '#10b981' : '#ddd'}`, borderRadius: '12px', padding: '20px', backgroundColor: isSelected ? '#f0fdf4' : 'white' }}>
                {pkg.is_popular && <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>🔥 Popular</span>}
                <h3>{pkg.package_name}</h3>
                <p>{pkg.package_description?.substring(0, 100)}...</p>
                <p>🏥 {pkg.provider_id?.provider_name}</p>
                <div><span style={{ textDecoration: 'line-through' }}>₹{pkg.mrp}</span> <strong style={{ fontSize: '24px', color: '#10b981' }}>₹{pkg.discounted_price}</strong></div>
                <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                  <span>⭐ {pkg.provider_id?.rating}</span>
                  <span>📏 {distance} km</span>
                  {pkg.home_collection_available && <span>🏠 Home</span>}
                  <span>⏱️ {pkg.report_time_hours}h</span>
                </div>
                <details open={isExpanded}>
                  <summary onClick={(e) => { e.preventDefault(); toggleExpand(pkg._id); }} style={{ cursor: 'pointer', color: '#3b82f6' }}>📋 Tests ({testsList.length})</summary>
                  <ul>{testsList.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </details>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <label><input type="checkbox" checked={isSelected} onChange={() => toggleSelect(pkg)} /> Compare</label>
                  <button onClick={() => alert(`Booking ${pkg.package_name}`)} style={{ backgroundColor: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Book</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HealthPackagesTab;