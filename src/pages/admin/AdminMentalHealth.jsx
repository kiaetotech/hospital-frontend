import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminMentalHealth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [therapists, setTherapists] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [stats, setStats] = useState({
    therapists: { total: 0, pending: 0, approved: 0, rejected: 0 },
    bookings: { total: 0, pending: 0, completed: 0 },
    screenings: { total: 0, crisis: 0 }
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (activeTab === 'therapists') {
        const res = await axios.get('/api/mentalhealth/admin/therapists', config);
        setTherapists(res.data.data || []);
      } else if (activeTab === 'bookings') {
        const res = await axios.get('/api/mentalhealth/admin/bookings', config);
        setBookings(res.data.data || []);
      } else if (activeTab === 'screenings') {
        const res = await axios.get('/api/mentalhealth/admin/screenings', config);
        setScreenings(res.data.data || []);
      } else if (activeTab === 'dashboard') {
        const res = await axios.get('/api/mentalhealth/admin/dashboard', config);
        const data = res.data.data || {};
        // ✅ FIXED: Properly map nested data
        setStats({
          therapists: {
            total: data.therapists?.total || 0,
            pending: data.therapists?.pending || 0,
            approved: data.therapists?.approved || 0,
            rejected: data.therapists?.rejected || 0
          },
          bookings: {
            total: data.bookings?.total || 0,
            pending: data.bookings?.pending || 0,
            completed: data.bookings?.completed || 0
          },
          screenings: {
            total: data.screenings?.total || 0,
            crisis: data.screenings?.crisis || 0
          }
        });
      }
    } catch (error) {
      console.error('Error loading mental health data:', error);
      setTherapists([]);
      setBookings([]);
      setScreenings([]);
    } finally {
      setLoading(false);
    }
  };

  const verifyTherapist = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/mentalhealth/admin/therapists/${id}/verify`, { status }, config);
      alert(`Therapist ${status}!`);
      loadData();
      setShowModal(false);
    } catch (error) {
      alert('Failed to verify therapist: ' + error.message);
    }
  };

  const suspendTherapist = async (id, isActive) => {
    if (window.confirm(`Are you sure you want to ${isActive ? 'activate' : 'suspend'} this therapist?`)) {
      try {
        const token = localStorage.getItem('adminToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.put(`/api/mentalhealth/admin/therapists/${id}/suspend`, { isActive }, config);
        alert(`Therapist ${isActive ? 'activated' : 'suspended'}!`);
        loadData();
      } catch (error) {
        alert('Failed to update therapist status: ' + error.message);
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { backgroundColor: '#fef3c7', color: '#92400e' },
      approved: { backgroundColor: '#dcfce7', color: '#166534' },
      rejected: { backgroundColor: '#fee2e2', color: '#dc2626' },
      suspended: { backgroundColor: '#fee2e2', color: '#dc2626' },
      completed: { backgroundColor: '#dcfce7', color: '#166534' },
      cancelled: { backgroundColor: '#fee2e2', color: '#dc2626' }
    };
    const style = styles[status] || styles.pending;
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        backgroundColor: style.backgroundColor,
        color: style.color,
        fontWeight: 'bold'
      }}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🧠 Mental Health Admin</h1>
        <p style={{ opacity: 0.9 }}>Manage therapists, bookings, and screenings</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {['dashboard', 'therapists', 'bookings', 'screenings'].map((tab) => (
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
            {tab === 'dashboard' ? '📊 Dashboard' : tab === 'therapists' ? '👤 Therapists' : tab === 'bookings' ? '📋 Bookings' : '📝 Screenings'}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #8b5cf6' }}>
              <p style={{ color: '#6b7280' }}>Total Therapists</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.therapists?.total || 0}</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
              <p style={{ color: '#6b7280' }}>Pending Verification</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.therapists?.pending || 0}</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
              <p style={{ color: '#6b7280' }}>Approved Therapists</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.therapists?.approved || 0}</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #2563eb' }}>
              <p style={{ color: '#6b7280' }}>Total Bookings</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{stats.bookings?.total || 0}</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
              <p style={{ color: '#6b7280' }}>Pending Bookings</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.bookings?.pending || 0}</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #dc2626' }}>
              <p style={{ color: '#6b7280' }}>Crisis Screenings</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>{stats.screenings?.crisis || 0}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'therapists' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontWeight: 'bold' }}>👤 Therapists ({therapists?.length || 0})</h2>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Pending: {therapists?.filter(t => t.verificationStatus === 'pending')?.length || 0}
            </span>
          </div>
          {!therapists || therapists.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No therapists found</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {therapists.map((therapist) => (
                <div key={therapist._id} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${therapist.verificationStatus === 'approved' ? '#10b981' : therapist.verificationStatus === 'pending' ? '#f59e0b' : '#dc2626'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 'bold' }}>{therapist.name}</h4>
                      <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>📞 {therapist.phone}</p>
                      <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>📋 {therapist.licenseNumber}</p>
                      <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>🎯 {therapist.specializations?.slice(0, 3).join(', ') || 'N/A'}</p>
                      <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>⭐ {therapist.rating || 0} • {therapist.experience || 0} years</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <div>{getStatusBadge(therapist.verificationStatus)}</div>
                      {therapist.verificationStatus === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => verifyTherapist(therapist._id, 'approved')} style={{ padding: '0.25rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✅ Approve</button>
                          <button onClick={() => verifyTherapist(therapist._id, 'rejected')} style={{ padding: '0.25rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>❌ Reject</button>
                        </div>
                      )}
                      {therapist.verificationStatus === 'approved' && (
                        <button onClick={() => suspendTherapist(therapist._id, false)} style={{ padding: '0.25rem 1rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>⏸️ Suspend</button>
                      )}
                      {therapist.verificationStatus === 'suspended' && (
                        <button onClick={() => suspendTherapist(therapist._id, true)} style={{ padding: '0.25rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>▶️ Activate</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📋 Bookings ({bookings?.length || 0})</h2>
          {!bookings || bookings.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No bookings found</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Therapist</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Patient</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>{booking.therapistId?.name || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{booking.patientId?.name || 'Anonymous'}</td>
                      <td style={{ padding: '12px' }}>{new Date(booking.scheduledDate).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>{getStatusBadge(booking.status)}</td>
                      <td style={{ padding: '12px' }}>{booking.bookingType || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'screenings' && (
        <div>
          <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📝 Screenings ({screenings?.length || 0})</h2>
          {!screenings || screenings.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No screenings found</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Score</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Severity</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Crisis</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {screenings.map((screening) => (
                    <tr key={screening._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>{screening.screeningType || 'N/A'}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>
                        {screening.screeningType === 'depression' ? screening.depressionTotal : screening.anxietyTotal || 0}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '10px',
                          fontSize: '0.7rem',
                          backgroundColor: screening.depressionSeverity === 'severe' || screening.anxietySeverity === 'severe' ? '#fee2e2' : screening.depressionSeverity === 'moderate' || screening.anxietySeverity === 'moderate' ? '#fef3c7' : '#dcfce7',
                          color: screening.depressionSeverity === 'severe' || screening.anxietySeverity === 'severe' ? '#dc2626' : screening.depressionSeverity === 'moderate' || screening.anxietySeverity === 'moderate' ? '#92400e' : '#166534'
                        }}>
                          {screening.depressionSeverity || screening.anxietySeverity || 'Unknown'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {screening.requiresEmergency ? '🚨 Yes' : '✅ No'}
                      </td>
                      <td style={{ padding: '12px' }}>{new Date(screening.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminMentalHealth;

