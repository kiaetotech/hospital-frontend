import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CorporateCheckups = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [employeeCount, setEmployeeCount] = useState(10);
  const [filters, setFilters] = useState({
    city: '',
    minEmployees: '',
    sort: 'rating'
  });

  useEffect(() => {
    fetchPackages();
    fetchProviders();
  }, [filters]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.minEmployees) params.append('minEmployees', filters.minEmployees);
      if (filters.sort) params.append('sort', filters.sort);
      
      const res = await axios.get(`/api/diagnostics/corporate/packages?${params.toString()}`);
      if (res.data.success) {
        setPackages(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching corporate checkups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await axios.get('/api/diagnostics/corporate/providers');
      if (res.data.success) {
        setProviders(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const handleBookNow = (pkg) => {
    setSelectedPackage(pkg);
    setEmployeeCount(pkg.minEmployees || 10);
    setShowBookingModal(true);
  };

  const handleBooking = async () => {
    try {
      const token = localStorage.getItem('corporateToken');
      if (!token) {
        alert('Please login as HR to book');
        navigate('/corporate/hr/login');
        return;
      }

      const res = await axios.post('/api/diagnostics/corporate/book', {
        packageId: selectedPackage._id,
        providerId: selectedPackage.providerId,
        employeeIds: [], // Will be selected from employee list
        scheduledDate: new Date().toISOString(),
        address: ''
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert(`✅ Corporate checkup booked for ${res.data.data.employeeCount} employees!`);
        setShowBookingModal(false);
      }
    } catch (error) {
      alert('Booking failed: ' + error.response?.data?.message || 'Please try again');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        padding: '3rem 2rem',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🏥 Corporate Health Checkups</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Bulk health checkup packages for your employees</p>
      </div>

      {/* Filters */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'flex-end'
        }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>City</label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="e.g., Mumbai"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Min Employees</label>
            <input
              type="number"
              value={filters.minEmployees}
              onChange={(e) => setFilters({ ...filters, minEmployees: e.target.value })}
              placeholder="e.g., 10"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              style={inputStyle}
            >
              <option value="rating">Highest Rated</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
          <button
            onClick={fetchPackages}
            style={{ padding: '0.6rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Search
          </button>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem' }}>Loading packages...</p>
        ) : packages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px' }}>
            <p style={{ color: '#6b7280' }}>No corporate checkup packages available</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {packages.map((pkg) => (
              <div key={pkg._id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderTop: '4px solid #06b6d4'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{pkg.name}</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>🏢 {pkg.providerName}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>📍 {pkg.providerCity}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                    ⭐ {pkg.providerRating || 0}
                  </div>
                </div>

                <div style={{ margin: '12px 0' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                    {formatCurrency(pkg.pricePerEmployee)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>per employee</div>
                  {pkg.discount > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>💲 {pkg.discount}% off</div>
                  )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1rem' }}>
                  {(pkg.includes || []).slice(0, 4).map((item, i) => (
                    <span key={i} style={{ fontSize: '0.65rem', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '10px' }}>✅ {item}</span>
                  ))}
                  {(pkg.includes || []).length > 4 && (
                    <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>+{pkg.includes.length - 4} more</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleBookNow(pkg)}
                    style={{ flex: 1, padding: '8px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    📋 Book Now
                  </button>
                  <button
                    onClick={() => navigate('/corporate/hr/login')}
                    style={{ padding: '8px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    👤 HR Login
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedPackage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '95%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📋 Book Corporate Checkup</h2>
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Package:</strong> {selectedPackage.name}</p>
              <p><strong>Provider:</strong> {selectedPackage.providerName}</p>
              <p><strong>Price:</strong> {formatCurrency(selectedPackage.pricePerEmployee)} per employee</p>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Number of Employees</label>
              <input
                type="number"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                min={selectedPackage.minEmployees || 10}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Min: {selectedPackage.minEmployees || 10} employees
              </p>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2563eb', marginTop: '0.5rem' }}>
                Total: {formatCurrency(selectedPackage.pricePerEmployee * employeeCount)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button
                onClick={handleBooking}
                style={{ flex: 1, padding: '0.75rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✅ Confirm Booking
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: '#e5e7eb', color: '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: '200px',
  padding: '0.6rem',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  fontSize: '0.9rem',
  backgroundColor: 'white',
  outline: 'none'
};

export default CorporateCheckups;
