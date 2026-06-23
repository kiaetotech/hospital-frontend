import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TherapistDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalSessions: 0,
    totalRevenue: 0,
    pendingBookings: 0
  });
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('therapistToken');
    if (!token) {
      navigate('/mentalhealth/therapist/login');
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data for demo
      setStats({
        totalPatients: 45,
        totalSessions: 128,
        totalRevenue: 64000,
        pendingBookings: 3
      });
      setBookings([
        { id: 'BK001', patient: 'Anonymous', date: '2024-01-15', time: '10:00 AM', status: 'confirmed', type: 'video' },
        { id: 'BK002', patient: 'Priya S.', date: '2024-01-15', time: '2:00 PM', status: 'pending', type: 'audio' },
        { id: 'BK003', patient: 'Rahul K.', date: '2024-01-16', time: '11:00 AM', status: 'completed', type: 'video' }
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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
        padding: '1.5rem 2rem',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🧠 Therapist Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem('therapistToken');
            localStorage.removeItem('therapistId');
            navigate('/mentalhealth');
          }}
          style={{ padding: '0.5rem 1.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {['dashboard', 'bookings', 'patients', 'earnings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: activeTab === tab ? '#8b5cf6' : 'transparent',
                color: activeTab === tab ? 'white' : '#1e293b',
                border: activeTab === tab ? 'none' : '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 'bold' : 'normal'
              }}
            >
              {tab === 'dashboard' ? '📊 Dashboard' : tab === 'bookings' ? '📋 Bookings' : tab === 'patients' ? '👤 Patients' : '💰 Earnings'}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem' }}>Loading...</p>
        ) : activeTab === 'dashboard' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280' }}>👤 Total Patients</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.totalPatients}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280' }}>📋 Total Sessions</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{stats.totalSessions}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280' }}>💰 Revenue</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#f59e0b' }}>⏳ Pending Bookings</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pendingBookings}</p>
              </div>
            </div>

            {/* Recent Bookings */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📋 Recent Bookings</h3>
              {bookings.map((booking) => (
                <div key={booking.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{booking.patient}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{booking.date} at {booking.time} • {booking.type}</div>
                  </div>
                  <span style={{
                    padding: '0.2rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    backgroundColor: booking.status === 'confirmed' ? '#dbeafe' : booking.status === 'completed' ? '#dcfce7' : '#fef3c7',
                    color: booking.status === 'confirmed' ? '#1e40af' : booking.status === 'completed' ? '#166534' : '#92400e'
                  }}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TherapistDashboard;