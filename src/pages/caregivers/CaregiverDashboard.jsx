import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderDashboardLayout from '../../components/ProviderDashboardLayout';
import ProviderStatsCards from '../../components/ProviderStatsCards';
import CorporatePlansTab from '../../components/CorporatePlansTab';
import { caregiverApi } from '../../services/providerApi';
import { getCaregiverDashboard, toggleCaregiverAvailability } from '../../services/api';

const CaregiverDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [profile, setProfile] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);

  const token = localStorage.getItem('caregiverToken');
  const providerId = localStorage.getItem('providerId') || localStorage.getItem('caregiverId');

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'bookings', label: 'Bookings', icon: '📅' },
    { id: 'earnings', label: 'Earnings', icon: '💰' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'availability', label: 'Availability', icon: '🕒' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'corporate', label: 'Corporate Plans', icon: '🏢' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('caregiverToken');
      if (!token) {
        navigate('/caregiver/login');
        return;
      }

      const response = await getCaregiverDashboard();
      if (response.data.success) {
        const { profile: caregiverProfile, stats: dashboardStats, recentBookings: bookings } = response.data.data;
        
        setProfile(caregiverProfile);
        setIsAvailable(caregiverProfile.isActive);
        setRecentBookings(bookings || []);
        
        setStats({
          totalBookings: dashboardStats?.totalBookings || 0,
          pendingBookings: dashboardStats?.pendingRequests || 0,
          completedBookings: dashboardStats?.completedBookings || 0,
          totalRevenue: dashboardStats?.totalEarnings || 0,
          rating: dashboardStats?.averageRating || 0,
          totalPatients: dashboardStats?.totalReviews || 0
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('caregiverToken');
        navigate('/caregiver/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const response = await toggleCaregiverAvailability({ isActive: !isAvailable });
      if (response.data.success) {
        setIsAvailable(!isAvailable);
      }
    } catch (error) {
      console.error('Toggle availability error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('caregiverToken');
    localStorage.removeItem('caregiverData');
    navigate('/caregiver/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            {/* Availability Toggle */}
            <div style={{
              backgroundColor: isAvailable ? '#f0fdf4' : '#fef2f2',
              borderRadius: '0.75rem',
              padding: '1rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              border: `2px solid ${isAvailable ? '#bbf7d0' : '#fecaca'}`
            }}>
              <div>
                <p style={{ fontWeight: '600', color: isAvailable ? '#065f46' : '#991b1b', margin: 0 }}>
                  {isAvailable ? '🟢 You are Online' : '🔴 You are Offline'}
                </p>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                  {isAvailable 
                    ? 'Patients can find and book you' 
                    : 'You are hidden from search results'}
                </p>
              </div>
              <button
                onClick={handleToggleAvailability}
                style={{
                  padding: '0.6rem 1.5rem',
                  backgroundColor: isAvailable ? '#ef4444' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {isAvailable ? 'Go Offline' : 'Go Online'}
              </button>
            </div>

            {/* Stats Cards */}
            <ProviderStatsCards stats={stats} />

            {/* Recent Bookings */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>
                  📅 Recent Bookings
                </h3>
                <button
                  onClick={() => setActiveTab('bookings')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  View All →
                </button>
              </div>

              {recentBookings.length > 0 ? (
                <div>
                  {recentBookings.slice(0, 5).map((booking, index) => (
                    <div
                      key={booking._id || index}
                      style={{
                        padding: '0.75rem 0',
                        borderBottom: index < recentBookings.length - 1 ? '1px solid #f1f5f9' : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '500', color: '#1e293b', margin: 0, fontSize: '0.9rem' }}>
                          Booking #{booking.bookingId || booking._id?.slice(-8)}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
                          {booking.serviceType} • {new Date(booking.startDate || booking.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <span style={{
                        padding: '0.2rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: 
                          booking.status === 'completed' ? '#d1fae5' :
                          booking.status === 'in-progress' ? '#dbeafe' :
                          booking.status === 'pending' ? '#fef3c7' : '#f1f5f9',
                        color:
                          booking.status === 'completed' ? '#065f46' :
                          booking.status === 'in-progress' ? '#1e40af' :
                          booking.status === 'pending' ? '#92400e' : '#64748b'
                      }}>
                        {booking.status?.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                  <p>No bookings yet</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>📅 All Bookings</h3>
              {recentBookings.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem', color: '#64748b' }}>Booking ID</th>
                        <th style={{ padding: '0.75rem', color: '#64748b' }}>Service</th>
                        <th style={{ padding: '0.75rem', color: '#64748b' }}>Date</th>
                        <th style={{ padding: '0.75rem', color: '#64748b' }}>Amount</th>
                        <th style={{ padding: '0.75rem', color: '#64748b' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((booking, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                            {booking.bookingId || booking._id?.slice(-8)}
                          </td>
                          <td style={{ padding: '0.75rem' }}>{booking.serviceType || 'N/A'}</td>
                          <td style={{ padding: '0.75rem' }}>
                            {new Date(booking.startDate || booking.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                            ₹{booking.totalAmount || 0}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor: 
                                booking.status === 'completed' ? '#d1fae5' :
                                booking.status === 'in-progress' ? '#dbeafe' :
                                booking.status === 'pending' ? '#fef3c7' : '#f1f5f9',
                              color:
                                booking.status === 'completed' ? '#065f46' :
                                booking.status === 'in-progress' ? '#1e40af' :
                                booking.status === 'pending' ? '#92400e' : '#64748b'
                            }}>
                              {booking.status?.replace('-', ' ').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📋</div>
                  <p>No bookings found</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1.5rem' }}>👤 My Profile</h3>
              
              {profile ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                  <ProfileField label="Full Name" value={profile.fullName} />
                  <ProfileField label="Email" value={profile.email} />
                  <ProfileField label="Phone" value={profile.phone} />
                  <ProfileField label="Gender" value={profile.gender} />
                  <ProfileField label="Experience" value={`${profile.experienceYears || 0} years`} />
                  <ProfileField label="Service Type" value={profile.serviceType} />
                  <ProfileField label="City" value={profile.location?.city} />
                  <ProfileField label="State" value={profile.location?.state} />
                  <ProfileField label="Verification" value={profile.isVerified ? '✅ Verified' : '⏳ Pending'} />
                  <ProfileField label="Background Check" value={profile.backgroundCheckStatus} />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  <p>Loading profile...</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'earnings':
        return (
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>💰 Earnings Overview</h3>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#059669', marginBottom: '0.5rem' }}>
                ₹{stats.totalRevenue?.toLocaleString() || '0'}
              </div>
              <p style={{ color: '#64748b' }}>Total Earnings</p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '0.5rem'
                }}>
                  <p style={{ color: '#065f46', fontWeight: '600', fontSize: '0.9rem' }}>Completed</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                    {stats.completedBookings || 0}
                  </p>
                </div>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#eff6ff',
                  borderRadius: '0.5rem'
                }}>
                  <p style={{ color: '#1e40af', fontWeight: '600', fontSize: '0.9rem' }}>Total Bookings</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {stats.totalBookings || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>⭐ Reviews & Ratings</h3>
              <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {stats.rating?.toFixed(1) || '0.0'}
              </div>
              <div style={{ color: '#f59e0b', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                {'★'.repeat(Math.floor(stats.rating || 0))}{'☆'.repeat(5 - Math.floor(stats.rating || 0))}
              </div>
              <p style={{ color: '#64748b' }}>
                Based on {stats.totalPatients || 0} reviews
              </p>
            </div>
          </div>
        );

      case 'availability':
        return (
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>🕒 Availability Settings</h3>
              <div style={{
                backgroundColor: isAvailable ? '#f0fdf4' : '#fef2f2',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                textAlign: 'center',
                border: `2px solid ${isAvailable ? '#bbf7d0' : '#fecaca'}`
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                  {isAvailable ? '🟢' : '🔴'}
                </div>
                <p style={{ fontWeight: '600', fontSize: '1.1rem', color: isAvailable ? '#065f46' : '#991b1b' }}>
                  {isAvailable ? 'You are currently Online' : 'You are currently Offline'}
                </p>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                  {isAvailable ? 'Patients can find and book your services' : 'You are hidden from patient search results'}
                </p>
                <button
                  onClick={handleToggleAvailability}
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: isAvailable ? '#ef4444' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  {isAvailable ? 'Go Offline' : 'Go Online'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'corporate':
        return (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>🏢 Corporate Plans</h2>
            <p style={{ color: '#64748b', marginBottom: 16 }}>Offer corporate elder care and home care packages to companies.</p>
            <CorporatePlansTab providerType="caregivers" providerId={providerId} token={token} />
          </div>
        );

      case 'settings':
        return (
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>⚙️ Settings</h3>
              <p style={{ color: '#64748b' }}>Settings coming soon.</p>
            </div>
          </div>
        );

      default:
        return (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '3rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
            <h3 style={{ color: '#1e293b' }}>Coming Soon</h3>
            <p style={{ color: '#64748b' }}>This section is under development.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <ProviderDashboardLayout
      title="Caregiver Portal"
      icon="🏠"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userName={profile?.fullName || 'Caregiver'}
      userRole={`${profile?.serviceType || 'Home Care'} Provider`}
      logout={handleLogout}
    >
      {renderContent()}
    </ProviderDashboardLayout>
  );
};

// Helper component
const ProfileField = ({ label, value }) => (
  <div style={{
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0'
  }}>
    <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', margin: '0 0 0.25rem' }}>
      {label}
    </p>
    <p style={{ color: '#1e293b', fontWeight: '500', margin: 0, fontSize: '0.9rem' }}>
      {value || 'N/A'}
    </p>
  </div>
);

export default CaregiverDashboard;
