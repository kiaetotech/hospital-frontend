import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderDashboardLayout from '../../components/ProviderDashboardLayout';
import ProviderStatsCards from '../../components/ProviderStatsCards';
import ProviderTable from '../../components/ProviderTable';
import { diagnosticsApi } from '../../services/providerApi';
import ProviderAuth from '../../components/ProviderAuth';

const DiagnosticsDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [tests, setTests] = useState([]);
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);

  const sidebarItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'profile', label: '🔬 Lab Profile', icon: '🔬' },
    { id: 'tests', label: '🧪 Tests', icon: '🧪' },
    { id: 'packages', label: '📦 Packages', icon: '📦' },
    { id: 'bookings', label: '📋 Bookings', icon: '📋' },
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
        navigate('/diagnostics/login');
        return;
      }

      if (activeTab === 'dashboard') {
        const statsRes = await diagnosticsApi.getStats();
        setStats(statsRes.data.data || {
          totalTests: 50,
          totalPackages: 12,
          totalBookings: 85,
          pendingBookings: 10,
          totalRevenue: 125000,
          rating: 4.6
        });
        
        setBookings([
          { bookingId: 'DIA-001', patientName: 'Rajesh Kumar', testName: 'CBC', date: '2024-01-15', status: 'completed' },
          { bookingId: 'DIA-002', patientName: 'Priya Sharma', testName: 'Lipid Profile', date: '2024-01-14', status: 'pending' }
        ]);
      } else if (activeTab === 'tests') {
        const testsRes = await diagnosticsApi.getTests();
        setTests(testsRes.data.data || [
          { _id: '1', name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 500, isActive: true },
          { _id: '2', name: 'Lipid Profile', category: 'Biochemistry', price: 600, isActive: true },
          { _id: '3', name: 'Liver Function Test', category: 'Biochemistry', price: 800, isActive: true }
        ]);
      } else if (activeTab === 'packages') {
        const packagesRes = await diagnosticsApi.getPackages();
        setPackages(packagesRes.data.data || [
          { _id: '1', name: 'Full Body Checkup', tests: ['CBC', 'Lipid Profile', 'LFT'], price: 1500, discount: 20 },
          { _id: '2', name: 'Heart Health Package', tests: ['Lipid Profile', 'ECG'], price: 2000, discount: 15 }
        ]);
      } else if (activeTab === 'profile') {
        const profileRes = await diagnosticsApi.getProfile();
        setProfile(profileRes.data.data || { name: 'Thyrocare Labs', email: 'info@thyrocare.com' });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        navigate('/diagnostics/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('providerToken');
    localStorage.removeItem('providerType');
    localStorage.removeItem('providerId');
    navigate('/diagnostics/login');
  };

  const handleDeleteTest = async (id) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await diagnosticsApi.deleteTest(id);
        alert('Test deleted!');
        loadData();
      } catch (error) {
        alert('Failed to delete test: ' + error.message);
      }
    }
  };

  const handleDeletePackage = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await diagnosticsApi.deletePackage(id);
        alert('Package deleted!');
        loadData();
      } catch (error) {
        alert('Failed to delete package: ' + error.message);
      }
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div>
            <ProviderStatsCards stats={stats} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📋 Recent Bookings</h3>
                {bookings.slice(0, 5).map((booking, index) => (
                  <div key={index} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{booking.patientName} - {booking.testName}</span>
                      <span style={{ 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '10px', 
                        fontSize: '0.7rem',
                        backgroundColor: booking.status === 'completed' ? '#dcfce7' : '#fef3c7',
                        color: booking.status === 'completed' ? '#166534' : '#92400e'
                      }}>
                        {booking.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{booking.date}</div>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>⚡ Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button onClick={() => setActiveTab('tests')} style={{ padding: '0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', cursor: 'pointer' }}>🧪 Add Test</button>
                  <button onClick={() => setActiveTab('packages')} style={{ padding: '0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', cursor: 'pointer' }}>📦 Add Package</button>
                  <button onClick={() => setActiveTab('bookings')} style={{ padding: '0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', cursor: 'pointer' }}>📋 View Bookings</button>
                  <button onClick={() => setActiveTab('reports')} style={{ padding: '0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', cursor: 'pointer' }}>📊 Reports</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tests':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>🧪 Tests</h2>
              <button style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>➕ Add Test</button>
            </div>
            <ProviderTable
              columns={[
                { key: 'name', label: 'Test Name' },
                { key: 'category', label: 'Category' },
                { key: 'price', label: 'Price (₹)', render: (val) => val?.toLocaleString() || '-' },
                { key: 'isActive', label: 'Status', render: (val) => (
                  <span style={{ 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '10px', 
                    fontSize: '0.7rem',
                    backgroundColor: val ? '#dcfce7' : '#fee2e2',
                    color: val ? '#166534' : '#dc2626'
                  }}>
                    {val ? '🟢 Active' : '🔴 Inactive'}
                  </span>
                )}
              ]}
              data={tests}
              loading={loading}
              onEdit={(row) => alert(`Edit: ${row.name}`)}
              onDelete={(row) => handleDeleteTest(row._id)}
              emptyMessage="No tests added yet"
            />
          </div>
        );

      case 'packages':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>📦 Health Packages</h2>
              <button style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>➕ Add Package</button>
            </div>
            <ProviderTable
              columns={[
                { key: 'name', label: 'Package Name' },
                { key: 'tests', label: 'Tests', render: (val) => val?.length || 0 },
                { key: 'price', label: 'Price (₹)', render: (val) => val?.toLocaleString() || '-' },
                { key: 'discount', label: 'Discount (%)', render: (val) => val || '0' }
              ]}
              data={packages}
              loading={loading}
              onEdit={(row) => alert(`Edit: ${row.name}`)}
              onDelete={(row) => handleDeletePackage(row._id)}
              emptyMessage="No packages created yet"
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
                { key: 'testName', label: 'Test/Package' },
                { key: 'date', label: 'Date' },
                { key: 'status', label: 'Status', render: (val) => (
                  <span style={{ 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '10px', 
                    fontSize: '0.7rem',
                    backgroundColor: val === 'completed' ? '#dcfce7' : val === 'pending' ? '#fef3c7' : '#fee2e2',
                    color: val === 'completed' ? '#166534' : val === 'pending' ? '#92400e' : '#dc2626'
                  }}>
                    {val}
                  </span>
                )}
              ]}
              data={bookings}
              loading={loading}
              onView={(row) => alert(`View booking: ${row.bookingId}`)}
              emptyMessage="No bookings yet"
            />
          </div>
        );

      case 'profile':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>🔬 Lab Profile</h2>
            {profile ? (
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><strong>Lab Name:</strong> {profile.name || 'N/A'}</div>
                  <div><strong>Email:</strong> {profile.email || 'N/A'}</div>
                  <div><strong>Phone:</strong> {profile.phone || 'N/A'}</div>
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

      case 'reports':
        return (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>📊 Reports</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📅 Daily Report</h3>
                <button style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Generate</button>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📆 Monthly Report</h3>
                <button style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Generate</button>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Coming soon...</div>;
    }
  };

  return (
    <ProviderAuth providerType="diagnostics">
      <ProviderDashboardLayout
        title="Diagnostics Dashboard"
        icon="🔬"
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={profile?.name || 'Lab Admin'}
        userRole="Diagnostics Lab"
        logout={handleLogout}
      >
        {renderContent()}
      </ProviderDashboardLayout>
    </ProviderAuth>
  );
};

export default DiagnosticsDashboard;
