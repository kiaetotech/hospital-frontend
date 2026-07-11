import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const WellnessCenterDashboard = () => {
  const navigate = useNavigate();
  const [center, setCenter] = useState(null);
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0, rating: 0, pendingPayout: 0 });
  const [tab, setTab] = useState('packages');
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [newPackage, setNewPackage] = useState({ name: '', duration: '', price: '', description: '', therapies: '', inclusions: '' });

  useEffect(() => {
    const token = localStorage.getItem('centerToken');
    if (!token) { navigate('/ayurveda/center/login'); return; }
    const centerData = JSON.parse(localStorage.getItem('centerData') || '{}');
    setCenter(centerData);
    loadDashboard(centerData.id);
  }, [navigate]);

  const loadDashboard = async (centerId) => {
    try {
      const response = await api.get(`/ayurveda-centers/dashboard/${centerId}`);
      if (response.data.success) {
        const data = response.data.data;
        setPackages(data.packages || []);
        setStats({
          totalBookings: data.stats?.totalBookings || 0,
          totalRevenue: data.stats?.totalRevenue || 0,
          rating: data.rating || 0,
          pendingPayout: data.stats?.pendingPayout || 0
        });
      }
    } catch (error) {
      // Dummy data
      setPackages([
        { _id: '1', name: '7-Day Panchakarma', duration: 7, price: 25000, description: 'Complete detox program', therapies: ['Abhyanga', 'Shirodhara'], inclusions: ['Stay', 'Food'], isActive: true },
        { _id: '2', name: '14-Day Rejuvenation', duration: 14, price: 45000, description: 'Full rejuvenation', therapies: ['Full Panchakarma', 'Yoga'], inclusions: ['Luxury Stay', 'Organic Food'], isActive: true },
      ]);
      setBookings([
        { _id: '1', bookingId: 'AYB001', patientName: 'Rahul Kumar', packageName: '7-Day Panchakarma', date: '2026-06-25', amount: 25000, status: 'confirmed' },
        { _id: '2', bookingId: 'AYB002', patientName: 'Priya Singh', packageName: '14-Day Rejuvenation', date: '2026-06-28', amount: 45000, status: 'pending' },
      ]);
    }
  };

  const addPackage = async () => {
    try {
      const response = await api.post(`/ayurveda-centers/packages/${center.id}`, {
        ...newPackage,
        duration: parseInt(newPackage.duration),
        price: parseInt(newPackage.price),
        therapies: newPackage.therapies.split(',').map(t => t.trim()),
        inclusions: newPackage.inclusions.split(',').map(i => i.trim())
      });
      if (response.data.success) {
        setPackages(response.data.data);
        setShowPackageForm(false);
        setNewPackage({ name: '', duration: '', price: '', description: '', therapies: '', inclusions: '' });
        alert('Package added!');
      }
    } catch (error) {
      // Add locally
      const localPackage = {
        _id: Date.now().toString(),
        ...newPackage,
        duration: parseInt(newPackage.duration),
        price: parseInt(newPackage.price),
        therapies: newPackage.therapies.split(',').map(t => t.trim()),
        inclusions: newPackage.inclusions.split(',').map(i => i.trim()),
        isActive: true
      };
      setPackages([...packages, localPackage]);
      setShowPackageForm(false);
      setNewPackage({ name: '', duration: '', price: '', description: '', therapies: '', inclusions: '' });
    }
  };

  const togglePackageStatus = async (packageId) => {
    const updatedPackages = packages.map(p => 
      p._id === packageId ? { ...p, isActive: !p.isActive } : p
    );
    setPackages(updatedPackages);
  };

  const logout = () => {
    localStorage.removeItem('centerToken');
    localStorage.removeItem('centerData');
    navigate('/ayurveda/center/login');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#FF9800' }}>🏨 {center?.name || 'Center'} Dashboard</h1>
        <button onClick={logout} style={{ padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Logout</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Bookings', value: stats.totalBookings, icon: '📋', color: '#2196F3' },
          { label: 'Revenue', value: `₹${stats.totalRevenue}`, icon: '💰', color: '#4CAF50' },
          { label: 'Rating', value: `⭐ ${stats.rating}`, icon: '⭐', color: '#FF9800' },
          { label: 'Pending Payout', value: `₹${stats.pendingPayout}`, icon: '💸', color: '#E91E63' },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontSize: '2rem' }}>{s.icon}</div>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{s.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['packages', 'bookings'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer',
            backgroundColor: tab === t ? '#FF9800' : '#e2e8f0', color: tab === t ? 'white' : '#1e293b'
          }}>
            {t === 'packages' ? '📦 Packages' : '📋 Bookings'}
          </button>
        ))}
        <button onClick={() => setShowPackageForm(true)} style={{
          padding: '0.5rem 1.5rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer'
        }}>
          + Add Package
        </button>
      </div>

      {/* Add Package Form */}
      {showPackageForm && (
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Add New Package</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input placeholder="Package Name" value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} style={inputStyle} />
            <input placeholder="Duration (days)" type="number" value={newPackage.duration} onChange={e => setNewPackage({...newPackage, duration: e.target.value})} style={inputStyle} />
            <input placeholder="Price (₹)" type="number" value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: e.target.value})} style={inputStyle} />
            <input placeholder="Therapies (comma separated)" value={newPackage.therapies} onChange={e => setNewPackage({...newPackage, therapies: e.target.value})} style={inputStyle} />
            <input placeholder="Inclusions (comma separated)" value={newPackage.inclusions} onChange={e => setNewPackage({...newPackage, inclusions: e.target.value})} style={inputStyle} />
            <textarea placeholder="Description" value={newPackage.description} onChange={e => setNewPackage({...newPackage, description: e.target.value})} style={{...inputStyle, gridColumn: 'span 2', height: '60px'}} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button onClick={addPackage} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Save</button>
            <button onClick={() => setShowPackageForm(false)} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Packages List */}
      {tab === 'packages' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {packages.map(pkg => (
            <div key={pkg._id} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: pkg.isActive ? '1px solid #e2e8f0' : '1px solid #fecaca' }}>
              <h3 style={{ fontWeight: 'bold', color: '#1e293b' }}>{pkg.name}</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>📅 {pkg.duration} Days | 💰 ₹{pkg.price}</p>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{pkg.description}</p>
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => togglePackageStatus(pkg._id)} style={{
                  padding: '0.3rem 0.8rem', borderRadius: '0.3rem', border: 'none', cursor: 'pointer', fontSize: '0.8rem',
                  backgroundColor: pkg.isActive ? '#fee2e2' : '#e8f5e9', color: pkg.isActive ? '#dc2626' : '#2E7D32'
                }}>
                  {pkg.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bookings */}
      {tab === 'bookings' && (
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Booking ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Patient</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Package</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem' }}>{b.bookingId}</td>
                  <td style={{ padding: '0.75rem' }}>{b.patientName}</td>
                  <td style={{ padding: '0.75rem' }}>{b.packageName}</td>
                  <td style={{ padding: '0.75rem' }}>{new Date(b.date).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem' }}>₹{b.amount}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: b.status === 'confirmed' ? '#e8f5e9' : '#fff3e0', color: b.status === 'confirmed' ? '#2E7D32' : '#e65100', fontSize: '0.8rem' }}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const inputStyle = { padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' };

export default WellnessCenterDashboard;
