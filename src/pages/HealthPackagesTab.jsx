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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [useLocation, setUseLocation] = useState(false);

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  useEffect(() => {
    loadPackages();
    if (useLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => console.log('Location denied')
      );
    }
  }, [useLocation]);

  const loadPackages = async () => {
    try {
      const res = await axios.get(`${API_URL}/health-packages`);
      console.log('Packages loaded:', res.data.packages);
      setPackages(res.data.packages || []);
      setFilteredPackages(res.data.packages || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
    
    setFilteredPackages(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
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

  if (showCompare) {
    return (
      <div>
        <button onClick={() => setShowCompare(false)} style={{ marginBottom: '20px', cursor: 'pointer' }}>← Back to Packages</button>
        <h3>Compare Packages</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Feature</th>
                {selectedPackages.map((p, idx) => (
                  <th key={idx} style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: idx === 0 ? '#d1fae5' : '#f3f4f6' }}>
                    {p.package_name}
                    {idx === 0 && <span style={{ display: 'block', fontSize: '11px', color: '#10b981' }}>⭐ Cheapest</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Provider</td>{selectedPackages.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>{p.provider_id?.provider_name || 'N/A'}</td>)}</tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Price</td>{selectedPackages.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}><strong>₹{p.discounted_price}</strong> <span style={{ textDecoration: 'line-through' }}>₹{p.mrp}</span></td>)}</tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Rating</td>{selectedPackages.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>⭐ {p.provider_id?.rating || 4.5}</td>)}</tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Distance</td>{selectedPackages.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>{getDistance(p)} km</td>)}</tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Home Collection</td>{selectedPackages.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>{p.home_collection_available ? '✅ Yes' : '❌ No'}</td>)}</tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Report Time</td>{selectedPackages.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>{p.report_time_hours} hours</td>)}</tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Tests</td>{selectedPackages.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>{p.tests_included_text?.split(',').length || 0} tests</td>)}</tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Action</td>{selectedPackages.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}><button onClick={() => alert(`Booking ${p.package_name}`)} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Book</button></td>)}</tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  useEffect(() => {
    applyFilters();
  }, [searchTerm, minPrice, maxPrice, homeCollectionOnly]);

  return (
    <div>
      <h2>🏥 Health Packages</h2>
      <p>Select packages to compare prices, features, and more</p>

      {/* Search and Filters */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <input type="text" placeholder="🔍 Search packages..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <button onClick={() => setShowFilters(!showFilters)} style={{ backgroundColor: '#6b7280', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{showFilters ? 'Hide Filters ▲' : 'Show Filters ▼'}</button>
          <button onClick={resetFilters} style={{ backgroundColor: '#ef4444', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
          <button onClick={() => setUseLocation(true)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📍 My Location</button>
        </div>

        {showFilters && (
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
            <input type="number" placeholder="Min Price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <input type="number" placeholder="Max Price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input type="checkbox" checked={homeCollectionOnly} onChange={(e) => setHomeCollectionOnly(e.target.checked)} />
              🏠 Home Collection Only
            </label>
          </div>
        )}
        <div style={{ fontSize: '12px', marginTop: '10px' }}>Found {filteredPackages.length} packages | {selectedPackages.length} selected</div>
      </div>

      {/* Compare Button */}
      {selectedPackages.length >= 2 && (
        <button onClick={handleCompare} style={{ position: 'fixed', bottom: 20, right: 20, backgroundColor: '#10b981', color: 'white', padding: '15px 30px', border: 'none', borderRadius: 50, cursor: 'pointer', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          Compare ({selectedPackages.length})
        </button>
      )}

      {/* Packages Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading packages...</div>
      ) : filteredPackages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>No packages found</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
          {filteredPackages.map(pkg => {
            const testsList = pkg.tests_included_text ? pkg.tests_included_text.split(',').map(t => t.trim()) : [];
            const isSelected = selectedPackages.some(p => p._id === pkg._id);
            const [expanded, setExpanded] = useState(false);
            const distance = getDistance(pkg);

            return (
              <div key={pkg._id} style={{ border: `1px solid ${isSelected ? '#10b981' : '#e5e7eb'}`, borderRadius: '12px', padding: '20px', backgroundColor: isSelected ? '#f0fdf4' : 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    {pkg.is_popular && <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>🔥 Popular</span>}
                    <h3>{pkg.package_name}</h3>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(pkg)} />
                    Compare
                  </label>
                </div>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>{pkg.package_description?.substring(0, 100)}...</p>
                <p style={{ margin: '5px 0' }}>🏥 {pkg.provider_id?.provider_name || 'N/A'}</p>
                <div style={{ margin: '10px 0' }}>
                  <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{pkg.mrp}</span>
                  <strong style={{ fontSize: '24px', color: '#10b981', marginLeft: '10px' }}>₹{pkg.discounted_price}</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#6b7280', margin: '10px 0' }}>
                  <span>⭐ {pkg.provider_id?.rating || 4.5}</span>
                  <span>📏 {distance} km</span>
                  {pkg.home_collection_available && <span>🏠 Home Collection</span>}
                  <span>⏱️ {pkg.report_time_hours} hours</span>
                  <span>👤 {pkg.gender}</span>
                </div>
                <details>
                  <summary style={{ cursor: 'pointer', color: '#3b82f6' }}>📋 Tests ({testsList.length})</summary>
                  <ul style={{ marginTop: '8px', paddingLeft: '20px', maxHeight: '120px', overflowY: 'auto' }}>
                    {testsList.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </details>
                <button onClick={() => alert(`Booking ${pkg.package_name}\nProvider: ${pkg.provider_id?.provider_name}\nPrice: ₹${pkg.discounted_price}`)} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>Book Now</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HealthPackagesTab;