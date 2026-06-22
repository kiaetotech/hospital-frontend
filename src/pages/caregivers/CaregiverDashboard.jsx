import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderDashboardLayout from '../../components/ProviderDashboardLayout';
import ProviderStatsCards from '../../components/ProviderStatsCards';
import ProviderTable from '../../components/ProviderTable';
import { caregiverApi } from '../../services/providerApi';
import ProviderAuth from '../../components/ProviderAuth';

const CaregiverDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [profile, setProfile] = useState(null);

  const sidebarItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'profile', label: '👤 Profile', icon: '👤' },
    { id: 'services', label: '📋 Services', icon: '📋' },
    { id: 'bookings', label: '📅 Bookings', icon: '📅' },
    { id: 'clients', label: '👨‍👩‍👧‍👦 Clients', icon: '👨‍👩‍👧‍👦' },
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
      if (!token) { navigate('/caregiver/login'); return; }

      if (activeTab === 'dashboard') {
        const statsRes = await caregiverApi.getStats();
        setStats(statsRes.data.data);
        setBookings([
          { bookingId: 'CG-001', clientName: 'Sita Devi', service: 'Elder Care', date: '2024-01-15', status: 'completed' },
          { bookingId: 'CG-002', clientName: 'Rahul Sharma', service: 'Patient Care', date: '2024-01-14', status: 'active' }
        ]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('providerToken');
    localStorage.removeItem('providerType');
    localStorage.removeItem('providerId');
    navigate('/caregiver/login');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div>
            <ProviderStatsCards stats={stats} />
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📅 Recent Bookings</h3>
              {bookings.map((booking, index) => (
                <div key={index} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{booking.clientName} - {booking.service}</span>
                    <span style={{ 
                      padding: '0.15rem 0.5rem', 
                      borderRadius: '10px', 
                      fontSize: '0.7rem',
                      backgroundColor: booking.status === 'active' ? '#dbeafe' : '#dcfce7',
                      color: booking.status === 'active' ? '#1e40af' : '#166534'
                    }}>
                      {booking.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{booking.date}</div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Coming soon...</div>;
    }
  };

  return (
    <ProviderAuth providerType="caregiver">
      <ProviderDashboardLayout
        title="Caregiver Dashboard"
        icon="🏠"
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={profile?.name || 'Caregiver'}
        userRole="Caregiver"
        logout={handleLogout}
      >
        {renderContent()}
      </ProviderDashboardLayout>
    </ProviderAuth>
  );
};

export default CaregiverDashboard;