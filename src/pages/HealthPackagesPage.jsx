import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HealthPackagesPage = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', homeCollection: false });

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const res = await axios.get(`${API_URL}/health-packages`);
      setPackages(res.data.packages || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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

  const resetFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', homeCollection: false });
    setSearchTerm('');
    loadPackages();
  };

  const handleBook = (pkg) => {
    alert(`Booking ${pkg.package_name}\nProvider: ${pkg.provider_id?.provider_name}\nPrice: ₹${pkg.discounted_price}`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '20px', cursor: 'pointer' }}>← Back</button>
      <h1>🏥 Health Packages</h1>
      <p>Choose from our curated health packages at discounted prices</p>

      {/* Search Bar */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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

      {/* Packages Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading packages...</div>
      ) : packages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>No packages found</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {packages.map(pkg => {
            const testsList = pkg.tests_included_text ? pkg.tests_included_text.split(',').map(t => t.trim()) : [];
            return (
              <div key={pkg._id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                {pkg.is_popular && <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', display: 'inline-block', marginBottom: '10px' }}>🔥 Popular</span>}
                <h3>{pkg.package_name}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>{pkg.package_description?.substring(0, 100)}...</p>
                <p style={{ fontSize: '14px', color: '#4b5563' }}>🏥 {pkg.provider_id?.provider_name}</p>
                <div style={{ margin: '10px 0' }}>
                  <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{pkg.mrp}</span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginLeft: '10px' }}>₹{pkg.discounted_price}</span>
                  <span style={{ fontSize: '12px', color: '#10b981', marginLeft: '10px' }}>({pkg.discount_percentage}% OFF)</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
                  {pkg.home_collection_available && <span>🏠 Home Collection</span>}
                  <span>⏱️ {pkg.report_time_hours} hours</span>
                  <span>👤 {pkg.gender}</span>
                </div>
                <details style={{ fontSize: '12px' }}>
                  <summary style={{ cursor: 'pointer', color: '#3b82f6' }}>Included Tests ({testsList.length})</summary>
                  <ul style={{ marginTop: '5px', paddingLeft: '20px', maxHeight: '150px', overflowY: 'auto' }}>
                    {testsList.map((test, i) => <li key={i}>{test}</li>)}
                  </ul>
                </details>
                <button onClick={() => handleBook(pkg)} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}>Book Now</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HealthPackagesPage;