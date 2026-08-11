import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HealthPackages = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [popularPackages, setPopularPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [comparisonData, setComparisonData] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    homeCollection: false
  });

  const API_URL = 'https://hospital-backend-production-7d0f.up.railway.app/api';

  useEffect(() => {
    loadPackages();
    loadPopularPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const res = await axios.get(`${API_URL}/health-packages`);
      setPackages(res.data.packages || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPopularPackages = async () => {
    try {
      const res = await axios.get(`${API_URL}/health-packages/popular`);
      setPopularPackages(res.data.packages || []);
    } catch (error) {
      console.error('Error loading popular packages:', error);
    }
  };

  const searchPackages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('query', searchTerm);
      if (filters.minPrice) params.append('min_price', filters.minPrice);
      if (filters.maxPrice) params.append('max_price', filters.maxPrice);
      if (filters.homeCollection) params.append('home_collection', 'true');
      
      const res = await axios.get(`${API_URL}/health-packages/search?${params.toString()}`);
      setPackages(res.data.packages || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePackageSelection = (pkg) => {
    if (selectedPackages.find(p => p._id === pkg._id)) {
      setSelectedPackages(selectedPackages.filter(p => p._id !== pkg._id));
    } else if (selectedPackages.length < 4) {
      setSelectedPackages([...selectedPackages, pkg]);
    } else {
      alert('You can compare up to 4 packages');
    }
  };

  const handleCompare = async () => {
    if (selectedPackages.length < 2) {
      alert('Please select at least 2 packages to compare');
      return;
    }
    
    try {
      const packageIds = selectedPackages.map(p => p._id);
      const res = await axios.post(`${API_URL}/health-packages/compare`, { package_ids: packageIds });
      setComparisonData(res.data.packages || []);
      setShowCompare(true);
    } catch (error) {
      console.error('Compare error:', error);
      alert('Error comparing packages');
    }
  };

  const handleBook = (pkg) => {
    navigate(`/book-health-package/${pkg._id}`, { state: { package: pkg } });
  };

  const resetFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', homeCollection: false });
    setSearchTerm('');
    loadPackages();
  };

  if (showCompare) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <button onClick={() => setShowCompare(false)} style={{ marginBottom: '20px', cursor: 'pointer' }}>← Back to Packages</button>
        <h2>Compare Health Packages</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Package</th>
                {comparisonData.map((pkg, idx) => (
                  <th key={idx} style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: idx === 0 ? '#d1fae5' : '#f3f4f6' }}>
                    {pkg.package_name}
                    {idx === 0 && <span style={{ display: 'block', fontSize: '11px', color: '#10b981' }}>⭐ Best Price</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Provider</td>{comparisonData.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>{p.provider_name}</td>)}</tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Price</td>{comparisonData.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}><strong>₹{p.discounted_price}</strong> <span style={{ textDecoration: 'line-through' }}>₹{p.mrp}</span></td>)}</tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Tests Count</td>{comparisonData.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>{p.tests_count} tests</td>)}</tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Rating</td>{comparisonData.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>⭐ {p.provider_rating}</td>)}</tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Home Collection</td>{comparisonData.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>{p.home_collection_available ? '✅ Yes' : '❌ No'}</td>)}</tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Report Time</td>{comparisonData.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>{p.report_time_hours} hours</td>)}</tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Action</td>{comparisonData.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}><button onClick={() => handleBook(p)} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Book</button></td>)}</tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>🏥 Health Packages</h1>
      <p>Choose from our curated health packages at discounted prices</p>

      {/* Search and Filter Bar */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <input type="text" placeholder="🔍 Search packages..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input type="number" placeholder="Min Price" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} style={{ width: '100px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input type="number" placeholder="Max Price" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} style={{ width: '100px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'white', padding: '0 10px', borderRadius: '4px' }}>
            <input type="checkbox" checked={filters.homeCollection} onChange={(e) => setFilters({...filters, homeCollection: e.target.checked})} />
            🏠 Home Collection
          </label>
          <button onClick={searchPackages} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Search</button>
          <button onClick={resetFilters} style={{ backgroundColor: '#6b7280', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
        </div>
      </div>

      {/* Popular Packages Section */}
      {popularPackages.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2>🔥 Popular Packages</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {popularPackages.map(pkg => (
              <PackageCard key={pkg._id} package={pkg} onSelect={() => togglePackageSelection(pkg)} isSelected={selectedPackages.some(p => p._id === pkg._id)} onBook={() => handleBook(pkg)} />
            ))}
          </div>
        </div>
      )}

      {/* All Packages Section */}
      <h2>📋 All Health Packages</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading packages...</div>
      ) : packages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>No packages found</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {packages.map(pkg => (
            <PackageCard key={pkg._id} package={pkg} onSelect={() => togglePackageSelection(pkg)} isSelected={selectedPackages.some(p => p._id === pkg._id)} onBook={() => handleBook(pkg)} />
          ))}
        </div>
      )}

      {/* Compare Button */}
      {selectedPackages.length >= 2 && (
        <button onClick={handleCompare} style={{ position: 'fixed', bottom: 20, right: 20, backgroundColor: '#10b981', color: 'white', padding: '15px 30px', border: 'none', borderRadius: 50, cursor: 'pointer', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          Compare Selected ({selectedPackages.length} Packages)
        </button>
      )}
    </div>
  );
};

// Package Card Component
const PackageCard = ({ package: pkg, onSelect, isSelected, onBook }) => {
  const [expanded, setExpanded] = useState(false);
  const testsList = pkg.tests_included_text ? pkg.tests_included_text.split(',').map(t => t.trim()) : [];

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', backgroundColor: isSelected ? '#d1fae5' : 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0' }}>{pkg.package_name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ color: '#f59e0b' }}>⭐ {pkg.provider_id?.rating || 4.5}</span>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>{pkg.provider_id?.provider_name}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through' }}>₹{pkg.mrp}</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>₹{pkg.discounted_price}</div>
          <div style={{ fontSize: '12px', color: '#10b981' }}>{pkg.discount_percentage}% OFF</div>
        </div>
      </div>

      <p style={{ color: '#6b7280', fontSize: '14px', margin: '10px 0' }}>{pkg.package_description?.substring(0, 100)}...</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        {testsList.slice(0, 6).map((test, i) => (
          <span key={i} style={{ backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{test}</span>
        ))}
        {testsList.length > 6 && <span style={{ fontSize: '12px', color: '#6b7280' }}>+{testsList.length - 6} more</span>}
      </div>

      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
        {pkg.home_collection_available && <span>🏠 Home Collection</span>}
        <span>⏱️ {pkg.report_time_hours} hours</span>
        <span>👤 {pkg.gender}</span>
        {pkg.min_age && <span>📅 {pkg.min_age}-{pkg.max_age} years</span>}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => onSelect()} style={{ flex: 1, backgroundColor: isSelected ? '#ef4444' : '#3b82f6', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          {isSelected ? 'Deselect' : 'Select to Compare'}
        </button>
        <button onClick={() => onBook()} style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Book Now
        </button>
      </div>

      {testsList.length > 6 && (
        <button onClick={() => setExpanded(!expanded)} style={{ marginTop: '10px', fontSize: '12px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
          {expanded ? 'Show less' : `+ Show all ${testsList.length} tests`}
        </button>
      )}

      {expanded && testsList.length > 6 && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
          {testsList.slice(6).map((test, i) => (
            <span key={i} style={{ display: 'inline-block', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', margin: '4px' }}>{test}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthPackages;

