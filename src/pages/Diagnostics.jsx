import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Diagnostics = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tests');
  const [tests, setTests] = useState([]);
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedTests, setSelectedTests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
    if (activeTab === 'tests') {
      fetchTests();
    } else {
      fetchPackages();
    }
  }, [activeTab, searchQuery, selectedCategory, priceRange, currentPage]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/diagnostics/categories');
      setCategories(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);
      params.append('page', currentPage);
      
      const res = await api.get(`/diagnostics/tests?${params.toString()}`);
      setTests(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      params.append('page', currentPage);
      
      const res = await api.get(`/diagnostics/packages?${params.toString()}`);
      setPackages(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTestSelection = (testId) => {
    if (selectedTests.includes(testId)) {
      setSelectedTests(selectedTests.filter(id => id !== testId));
    } else if (selectedTests.length < 4) {
      setSelectedTests([...selectedTests, testId]);
    } else {
      alert('You can compare up to 4 tests');
    }
  };

  const handleCompare = () => {
    if (selectedTests.length < 2) {
      alert('Please select at least 2 tests to compare');
      return;
    }
    navigate(`/diagnostics-compare?ids=${selectedTests.join(',')}`);
  };

  const handleBookTest = (test) => {
    const discountedPrice = Math.round(test.min_price * 0.9);
    navigate('/diagnostics-booking', {
      state: {
        itemType: 'test',
        itemId: test._id,
        itemName: test.test_name,
        originalPrice: test.min_price,
        discountedPrice: discountedPrice
      }
    });
  };

  const handleBookPackage = (pkg) => {
    const discountedPrice = Math.round(pkg.discounted_price * 0.9);
    navigate('/diagnostics-booking', {
      state: {
        itemType: 'package',
        itemId: pkg._id,
        itemName: pkg.package_name,
        originalPrice: pkg.discounted_price,
        discountedPrice: discountedPrice
      }
    });
  };

  const handleCustomPackage = () => {
    navigate('/diagnostics-custom');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a' }}>🔬 Diagnostics</h1>
        <p style={{ marginBottom: '1rem' }}>Book lab tests and health checkup packages at 10% discount</p>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
          <button onClick={() => { setActiveTab('tests'); setSelectedTests([]); setCurrentPage(1); }} style={{ padding: '0.5rem 1rem', borderBottom: activeTab === 'tests' ? '2px solid #10b981' : 'none', color: activeTab === 'tests' ? '#10b981' : '#6b7280', background: 'none', cursor: 'pointer' }}>🧪 Lab Tests</button>
          <button onClick={() => { setActiveTab('packages'); setCurrentPage(1); }} style={{ padding: '0.5rem 1rem', borderBottom: activeTab === 'packages' ? '2px solid #10b981' : 'none', color: activeTab === 'packages' ? '#10b981' : '#6b7280', background: 'none', cursor: 'pointer' }}>📦 Preventive Packages</button>
          <button onClick={handleCustomPackage} style={{ padding: '0.5rem 1rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>✨ Build Your Own Package</button>
        </div>

        {/* Filters */}
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="text" placeholder="Search tests or packages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 2, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat.category_code} value={cat.category_code}>{cat.category_name}</option>)}
          </select>
          <input type="number" placeholder="Min Price" value={priceRange.min} onChange={(e) => setPriceRange({...priceRange, min: e.target.value})} style={{ width: '120px', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          <input type="number" placeholder="Max Price" value={priceRange.max} onChange={(e) => setPriceRange({...priceRange, max: e.target.value})} style={{ width: '120px', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          <button onClick={activeTab === 'tests' ? fetchTests : fetchPackages} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Apply</button>
        </div>

        {/* Compare Button */}
        {activeTab === 'tests' && selectedTests.length >= 2 && (
          <button onClick={handleCompare} style={{ marginBottom: '1rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Compare Selected ({selectedTests.length})</button>
        )}

        {/* Results Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : activeTab === 'tests' && tests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>No tests found</div>
        ) : activeTab === 'packages' && packages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>No packages found</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
            {activeTab === 'tests' && tests.map(test => {
              const discountedPrice = Math.round(test.min_price * 0.9);
              return (
                <div key={test._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>{test.test_name}</h3>
                    <input type="checkbox" checked={selectedTests.includes(test._id)} onChange={() => toggleTestSelection(test._id)} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{test.major_category_name}</p>
                  <p style={{ marginTop: '0.5rem' }}><span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{test.min_price}</span> <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹{discountedPrice}</span> <span style={{ fontSize: '0.7rem', color: '#10b981' }}>(Save 10%)</span></p>
                  <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>🏥 {test.provider_count} labs offering this test</p>
                  {test.requires_fasting && <p style={{ fontSize: '0.7rem', color: '#f59e0b' }}>⏰ Fasting required</p>}
                  <button onClick={() => handleBookTest(test)} style={{ width: '100%', marginTop: '0.5rem', backgroundColor: '#10b981', color: 'white', padding: '0.4rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Book Now</button>
                </div>
              );
            })}
            {activeTab === 'packages' && packages.map(pkg => {
              const discountedPrice = Math.round(pkg.discounted_price * 0.9);
              const discountPercent = Math.round((pkg.mrp - pkg.discounted_price) / pkg.mrp * 100);
              return (
                <div key={pkg._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>{pkg.package_name}</h3>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>🏥 {pkg.provider_id?.provider_name}</p>
                  <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>⭐ {pkg.provider_id?.rating || 'N/A'} ({pkg.provider_id?.total_reviews || 0} reviews)</p>
                  <p style={{ marginTop: '0.5rem' }}><span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{pkg.mrp}</span> <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹{discountedPrice}</span> <span style={{ fontSize: '0.7rem', color: '#10b981' }}>(Save {discountPercent}%)</span></p>
                  <button onClick={() => handleBookPackage(pkg)} style={{ width: '100%', marginTop: '0.5rem', backgroundColor: '#10b981', color: 'white', padding: '0.4rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Book Now</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '0.5rem 1rem', backgroundColor: currentPage === 1 ? '#ccc' : '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '0.5rem 1rem', backgroundColor: currentPage === totalPages ? '#ccc' : '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diagnostics;