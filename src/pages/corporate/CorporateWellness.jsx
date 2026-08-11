import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CorporateWellness = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('packages');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [employeeCount, setEmployeeCount] = useState(10);
  const [filters, setFilters] = useState({
    city: '',
    specialization: '',
    minRating: '',
    source: 'all' // ayurveda, homeopathy, all
  });

  useEffect(() => {
    fetchData();
  }, [filters, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.minRating) params.append('minRating', filters.minRating);

      if (activeTab === 'packages' || activeTab === 'all') {
        const res = await axios.get(`/api/ayurveda/corporate/wellness?${params.toString()}`);
        if (res.data.success) {
          setPackages(res.data.data);
        }
        // Also fetch homeopathy packages
        const homeoRes = await axios.get(`/api/homeopathy/corporate/wellness?${params.toString()}`);
        if (homeoRes.data.success) {
          setPackages(prev => [...prev, ...homeoRes.data.data]);
        }
      }

      if (activeTab === 'workshops' || activeTab === 'all') {
        const res = await axios.get(`/api/ayurveda/corporate/workshops?${params.toString()}`);
        if (res.data.success) {
          setWorkshops(res.data.data);
        }
        const homeoRes = await axios.get(`/api/homeopathy/corporate/workshops?${params.toString()}`);
        if (homeoRes.data.success) {
          setWorkshops(prev => [...prev, ...homeoRes.data.data]);
        }
      }

      if (activeTab === 'doctors' || activeTab === 'all') {
        const res = await axios.get(`/api/ayurveda/corporate/doctors?${params.toString()}`);
        if (res.data.success) {
          setDoctors(res.data.data);
        }
        const homeoRes = await axios.get(`/api/homeopathy/corporate/doctors?${params.toString()}`);
        if (homeoRes.data.success) {
          setDoctors(prev => [...prev, ...homeoRes.data.data]);
        }
      }

    } catch (error) {
      console.error('Error fetching corporate wellness:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (item) => {
    setSelectedItem(item);
    setEmployeeCount(item.minEmployees || 10);
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

      const endpoint = item.doctorId ? '/api/ayurveda/corporate/book' : '/api/homeopathy/corporate/book';
      const res = await axios.post(endpoint, {
        packageId: selectedItem._id,
        doctorId: selectedItem.doctorId,
        employeeIds: [],
        scheduledDate: new Date().toISOString(),
        address: ''
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert(`✅ Corporate wellness booked for ${res.data.data.employeeCount} employees!`);
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
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        padding: '3rem 2rem',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🌿 Corporate Wellness</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Wellness programs, workshops, and consultations for your employees</p>
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
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Min Rating</label>
            <input
              type="number"
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
              placeholder="e.g., 4.0"
              style={inputStyle}
              step="0.1"
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Type</label>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              style={inputStyle}
            >
              <option value="all">All</option>
              <option value="ayurveda">Ayurveda</option>
              <option value="homeopathy">Homeopathy</option>
            </select>
          </div>
          <button
            onClick={fetchData}
            style={{ padding: '0.6rem 1.5rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Search
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {['packages', 'workshops', 'doctors'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: activeTab === tab ? '#8b5cf6' : 'transparent',
                color: activeTab === tab ? 'white' : '#1e293b',
                border: activeTab === tab ? 'none' : '1px solid #e5e7eb',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 'bold' : 'normal'
              }}
            >
              {tab === 'packages' ? '📦 Wellness Packages' : tab === 'workshops' ? '🎯 Workshops' : '👨‍⚕️ Doctors'}
              <span style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }}>
                ({tab === 'packages' ? packages.length : tab === 'workshops' ? workshops.length : doctors.length})
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem' }}>Loading...</p>
        ) : activeTab === 'packages' && packages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px' }}>
            <p style={{ color: '#6b7280' }}>No corporate wellness packages available</p>
          </div>
        ) : activeTab === 'workshops' && workshops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px' }}>
            <p style={{ color: '#6b7280' }}>No corporate workshops available</p>
          </div>
        ) : activeTab === 'doctors' && doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px' }}>
            <p style={{ color: '#6b7280' }}>No doctors available for corporate wellness</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {(activeTab === 'packages' ? packages : activeTab === 'workshops' ? workshops : doctors).map((item) => (
              <div key={item._id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderTop: `4px solid ${item.doctorId ? '#8b5cf6' : '#7C3AED'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{item.name}</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                      {item.doctorName || 'Wellness Program'}
                      {item.specialization && ` • ${item.specialization}`}
                    </p>
                    {item.doctorCity && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>📍 {item.doctorCity}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                    ⭐ {item.doctorRating || 0}
                  </div>
                </div>

                <div style={{ margin: '12px 0' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                    {formatCurrency(item.pricePerEmployee || item.price || 1000)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {item.duration || 'per employee'}
                  </div>
                  {item.discount > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>💲 {item.discount}% off</div>
                  )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1rem' }}>
                  {(item.includes || item.benefits || []).slice(0, 3).map((benefit, i) => (
                    <span key={i} style={{ fontSize: '0.65rem', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '10px' }}>✅ {benefit}</span>
                  ))}
                </div>

                <button
                  onClick={() => handleBookNow(item)}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  📋 Book Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedItem && (
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
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📋 Book Corporate Wellness</h2>
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Program:</strong> {selectedItem.name}</p>
              <p><strong>Provider:</strong> {selectedItem.doctorName || 'Wellness Program'}</p>
              <p><strong>Price:</strong> {formatCurrency(selectedItem.pricePerEmployee || selectedItem.price || 1000)} per employee</p>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Number of Employees</label>
              <input
                type="number"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                min={selectedItem.minEmployees || 10}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Min: {selectedItem.minEmployees || 10} employees
              </p>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2563eb', marginTop: '0.5rem' }}>
                Total: {formatCurrency((selectedItem.pricePerEmployee || selectedItem.price || 1000) * employeeCount)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button
                onClick={handleBooking}
                style={{ flex: 1, padding: '0.75rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
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

export default CorporateWellness;

