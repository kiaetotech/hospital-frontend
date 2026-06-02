import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Diagnostics = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tests');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const itemsPerPage = 10;

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [useMyLocation, setUseMyLocation] = useState(false);

  // Fetch categories on load
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch items when filters change
  useEffect(() => {
    fetchItems();
  }, [activeTab, searchQuery, selectedCategory, minPrice, maxPrice, cityFilter, useMyLocation, userLocation, currentPage]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/diagnostics/categories');
      if (res.data.data) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories
      setCategories([
        { category_code: 'BLD', category_name: 'Blood Tests' },
        { category_code: 'IMG', category_name: 'Medical Imaging' },
        { category_code: 'CRD', category_name: 'Cardiac Diagnostics' }
      ]);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setUseMyLocation(true);
          setCityFilter('');
          setCurrentPage(1);
        },
        () => alert('Unable to get location. Please check permissions.')
      );
    } else {
      alert('Geolocation not supported by your browser');
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'tests' ? '/diagnostics/tests' : '/diagnostics/packages';
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (cityFilter) params.append('city', cityFilter);
      if (useMyLocation && userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
      }
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      
      const res = await api.get(`${endpoint}?${params.toString()}`);
      setItems(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else if (selectedItems.length < 4) {
      setSelectedItems([...selectedItems, id]);
    } else {
      alert('You can compare up to 4 items');
    }
  };

  const handleCompare = () => {
    if (selectedItems.length < 2) {
      alert('Please select at least 2 items to compare');
      return;
    }
    const type = activeTab === 'tests' ? 'tests' : 'packages';
    navigate(`/diagnostics-compare?type=${type}&ids=${selectedItems.join(',')}`);
  };

  const handleBook = (item) => {
    const originalPrice = item.min_price || item.discounted_price || item.price || 0;
    const discountedPrice = Math.round(originalPrice * 0.9);
    navigate('/diagnostics-booking', {
      state: {
        itemType: activeTab === 'tests' ? 'test' : 'package',
        itemId: item._id,
        itemName: item.test_name || item.package_name,
        originalPrice: originalPrice,
        discountedPrice: discountedPrice
      }
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setCityFilter('');
    setUseMyLocation(false);
    setUserLocation(null);
    setCurrentPage(1);
  };

  const getDiscountPercent = (originalPrice) => {
    if (!originalPrice) return 0;
    const discounted = originalPrice * 0.9;
    return Math.round(((originalPrice - discounted) / originalPrice) * 100);
  };

  if (loading && items.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading diagnostics data...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a' }}>🔬 Diagnostics</h1>
        <p style={{ marginBottom: '1rem' }}>Book lab tests and health checkup packages at 10% discount</p>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <button
            onClick={() => { setActiveTab('tests'); setSelectedItems([]); setCurrentPage(1); }}
            style={{ padding: '0.5rem 1rem', borderBottom: activeTab === 'tests' ? '2px solid #10b981' : 'none', color: activeTab === 'tests' ? '#10b981' : '#6b7280', background: 'none', cursor: 'pointer' }}
          >
            🧪 Lab Tests
          </button>
          <button
            onClick={() => { setActiveTab('packages'); setSelectedItems([]); setCurrentPage(1); }}
            style={{ padding: '0.5rem 1rem', borderBottom: activeTab === 'packages' ? '2px solid #10b981' : 'none', color: activeTab === 'packages' ? '#10b981' : '#6b7280', background: 'none', cursor: 'pointer' }}
          >
            📦 Preventive Packages
          </button>
          <button
            onClick={() => navigate('/diagnostics-custom')}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
          >
            ✨ Build Your Own Package
          </button>
        </div>

        {/* Location Search Row */}
        <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by city (e.g., Mumbai, Delhi)..."
            value={cityFilter}
            onChange={(e) => { setCityFilter(e.target.value); setUseMyLocation(false); setCurrentPage(1); }}
            style={{ flex: 2, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}
          />
          <button
            onClick={getUserLocation}
            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
          >
            📍 Use My Location
          </button>
          {useMyLocation && userLocation && (
            <span style={{ fontSize: '0.75rem', color: '#10b981' }}>📍 Using your location</span>
          )}
        </div>

        {/* Filters Row */}
        <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search tests or packages..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ flex: 2, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.category_code} value={cat.category_code}>{cat.category_name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
            style={{ width: '100px', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
            style={{ width: '100px', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}
          />
          <button
            onClick={() => { setCurrentPage(1); fetchItems(); }}
            style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
          >
            Apply
          </button>
          <button
            onClick={resetFilters}
            style={{ backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
          >
            Reset
          </button>
        </div>

        {/* Compare Button */}
        {selectedItems.length >= 2 && (
          <button
            onClick={handleCompare}
            style={{ marginBottom: '1rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
          >
            Compare Selected ({selectedItems.length})
          </button>
        )}

        {/* Items Grid */}
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
            <p>No items found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {items.map(item => {
              const originalPrice = item.min_price || item.discounted_price || item.price || 0;
              const discountedPrice = Math.round(originalPrice * 0.9);
              const saving = originalPrice - discountedPrice;
              const providerCount = item.provider_count || 0;
              const discountPercent = originalPrice > 0 ? Math.round((saving / originalPrice) * 100) : 0;
              
              return (
                <div key={item._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>{item.test_name || item.package_name}</h3>
                    <input type="checkbox" checked={selectedItems.includes(item._id)} onChange={() => toggleSelect(item._id)} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{item.major_category_name || 'Health Package'}</p>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.875rem' }}>₹{originalPrice}</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem', marginLeft: '0.5rem' }}>₹{discountedPrice}</span>
                    <span style={{ fontSize: '0.7rem', color: '#10b981', marginLeft: '0.25rem' }}>(Save {discountPercent}%)</span>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.25rem' }}>🏥 {providerCount} {providerCount === 1 ? 'lab' : 'labs'} offering this test</p>
                  {item.requires_fasting && <p style={{ fontSize: '0.7rem', color: '#f59e0b' }}>⏰ Fasting required</p>}
                  <button
                    onClick={() => handleBook(item)}
                    style={{ width: '100%', marginTop: '0.75rem', backgroundColor: '#10b981', color: 'white', padding: '0.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                  >
                    Book Now
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '0.5rem 1rem', backgroundColor: currentPage === 1 ? '#ccc' : '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '0.5rem 1rem', backgroundColor: currentPage === totalPages ? '#ccc' : '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diagnostics;