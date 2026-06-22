import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderDashboardLayout from '../../components/ProviderDashboardLayout';
import ProviderStatsCards from '../../components/ProviderStatsCards';
import ProviderTable from '../../components/ProviderTable';
import { hospitalApi } from '../../services/providerApi';
import ProviderAuth from '../../components/ProviderAuth';

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [profile, setProfile] = useState(null);

  const sidebarItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'profile', label: '🏥 Profile', icon: '🏥' },
    { id: 'doctors', label: '👨‍⚕️ Doctors', icon: '👨‍⚕️' },
    { id: 'rooms', label: '🛏️ Rooms', icon: '🛏️' },
    { id: 'bookings', label: '📋 Bookings', icon: '📋' },
    { id: 'patients', label: '👨‍👩‍👧‍👦 Patients', icon: '👨‍👩‍👧‍👦' },
    { id: 'reports', label: '📊 Reports', icon: '📊' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
  ];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('providerToken');
      if (!token) {
        navigate('/hospital/login');
        return;
      }

      if (activeTab === 'dashboard') {
        const statsRes = await hospitalApi.getStats();
        setStats(statsRes.data.data);
      } else if (activeTab === 'doctors') {
        const doctorsRes = await hospitalApi.getDoctors();
        setDoctors(doctorsRes.data.data);
      } else if (activeTab === 'bookings') {
        const bookingsRes = await hospitalApi.getBookings();
        setBookings(bookingsRes.data.data);
      } else if (activeTab === 'patients') {
        const patientsRes = await hospitalApi.getPatients();
        setPatients(patientsRes.data.data);
      } else if (activeTab === 'profile') {
        const profileRes = await hospitalApi.getProfile();
        setProfile(profileRes.data.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        navigate('/hospital/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('providerToken');
    localStorage.removeItem('providerType');
    localStorage.removeItem('providerId');
    navigate('/hospital/login');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div>
            <ProviderStatsCards stats={stats} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Recent Bookings */}
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📋 Recent Bookings</h3>
                {bookings.length === 0 ? (
                  <p style={{ color: '#6b7280' }}>No recent bookings</p>
                ) : (
                  bookings.slice(0, 5).map((booking, index) => (
                    <div key={index} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{booking.patientName}</span>
                        <span style={{ 
                          padding: '0.15rem 0.5rem', 
                          borderRadius: '10px', 
                          fontSize: '0.7rem',
                          backgroundColor: booking.status === 'confirmed' ? '#dcfce7' : '#fef3c7',
                          color: booking.status === 'confirmed' ? '#166534' : '#92400e'
                        }}>
                          {booking.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Actions */}
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>⚡ Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setActiveTab('doctors')}
                    style={{ padding: '0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', cursor: 'pointer' }}
                  >
                    👨‍⚕️ Manage Doctors
                  </button>
                  <button 
                    onClick={() => setActiveTab('rooms')}
                    style={{ padding: '0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', cursor: 'pointer' }}
                  >
                    🛏️ Manage Rooms
                  </button>
                  <button 
                    onClick={() => setActiveTab('bookings')}
                    style={{ padding: '0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', cursor: 'pointer' }}
                  >
                    📋 View Bookings
                  </button>
                  <button 
                    onClick={() => setActiveTab('reports')}
                    style={{ padding: '0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', cursor: 'pointer' }}
                  >
                    📊 Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'doctors':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>👨‍⚕️ Doctors</h2>
              <button 
                onClick={() => alert('Add doctor functionality')}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ➕ Add Doctor
              </button>
            </div>
            <ProviderTable
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'specialization', label: 'Specialization' },
                { key: 'consultationFee', label: 'Fee (₹)' },
                { key: 'experience', label: 'Experience' },
                { key: 'rating', label: '⭐ Rating' }
              ]}
              data={doctors}
              onEdit={(row) => alert(`Edit: ${row.name}`)}
              onDelete={(row) => {
                if (window.confirm(`Delete ${row.name}?`)) {
                  alert('Deleted');
                }
              }}
              loading={loading}
            />
          </div>
        );

      case 'bookings':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>📋 Bookings</h2>
            <ProviderTable
              columns={[
                { key: 'bookingId', label: 'ID' },
                { key: 'patientName', label: 'Patient' },
                { key: 'doctorName', label: 'Doctor' },
                { key: 'date', label: 'Date' },
                { key: 'status', label: 'Status', render: (status) => (
                  <span style={{ 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '10px', 
                    fontSize: '0.7rem',
                    backgroundColor: status === 'confirmed' ? '#dcfce7' : status === 'pending' ? '#fef3c7' : '#fee2e2',
                    color: status === 'confirmed' ? '#166534' : status === 'pending' ? '#92400e' : '#dc2626'
                  }}>
                    {status}
                  </span>
                )}
              ]}
              data={bookings}
              onView={(row) => alert(`View: ${row.patientName}`)}
              loading={loading}
              emptyMessage="No bookings found"
            />
          </div>
        );

      case 'profile':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>🏥 Hospital Profile</h2>
            {profile ? (
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><strong>Name:</strong> {profile.name}</div>
                  <div><strong>Registration:</strong> {profile.registrationNumber}</div>
                  <div><strong>Email:</strong> {profile.email}</div>
                  <div><strong>Phone:</strong> {profile.phone}</div>
                  <div><strong>Address:</strong> {profile.address?.city}, {profile.address?.state}</div>
                  <div><strong>Status:</strong> 
                    <span style={{ 
                      padding: '0.15rem 0.5rem', 
                      borderRadius: '10px', 
                      fontSize: '0.7rem',
                      backgroundColor: profile.isVerified ? '#dcfce7' : '#fef3c7',
                      color: profile.isVerified ? '#166534' : '#92400e'
                    }}>
                      {profile.isVerified ? '✅ Verified' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        );

      default:
        return <div>Coming soon...</div>;
    }
  };

  return (
    <ProviderAuth providerType="hospital">
      <ProviderDashboardLayout
        title="Hospital Dashboard"
        icon="🏥"
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={profile?.name || 'Hospital Admin'}
        userRole="Hospital"
        logout={handleLogout}
      >
        {renderContent()}
      </ProviderDashboardLayout>
    </ProviderAuth>
  );
};

export default HospitalDashboard;