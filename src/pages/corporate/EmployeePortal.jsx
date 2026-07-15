import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Footer from '../../components/Footer';

const EmployeePortal = () => {
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingFor, setBookingFor] = useState('self');
  const [selectedDependent, setSelectedDependent] = useState('');
  const [bookingAmount, setBookingAmount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('employeeToken');
    if (!token) { navigate('/employee/login'); return; }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('employeeToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [profileRes, servicesRes, bookingsRes, txRes] = await Promise.all([
        api.get('/employee/profile', config),
        api.get('/employee/services', config),
        api.get('/employee/bookings', config),
        api.get('/employee/transactions', config)
      ]);
      if (profileRes.data.success) setProfile(profileRes.data);
      if (servicesRes.data.success) setServices(servicesRes.data.services || []);
      if (bookingsRes.data.success) setBookings(bookingsRes.data.bookings || []);
      if (txRes.data.success) setTransactions(txRes.data.transactions || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear();
        navigate('/employee/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/employee/login'); };

  const openBookingModal = (service) => {
    setSelectedService(service);
    setBookingFor('self');
    setSelectedDependent('');
    setBookingAmount(500); // Default — should come from service pricing
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.post('/employee/book', {
        serviceType: selectedService.type,
        amount: bookingAmount,
        bookingFor,
        dependentId: bookingFor === 'dependent' ? selectedDependent : null,
        bookingDetails: { name: selectedService.name, date: new Date().toISOString() }
      }, config);
      setShowBookingModal(false);
      fetchData();
      alert('Booking confirmed!');
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
          <p style={{ fontSize: '18px', color: '#666' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const dependents = profile?.employee?.dependents || [];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a237e, #283593)', color: 'white', padding: '24px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 4px 0' }}>👨‍💼 {profile?.employee?.name}</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '13px' }}>
              {profile?.corporate?.name} • {profile?.employee?.employeeId} • {profile?.employee?.department}
            </p>
          </div>
          <button onClick={handleLogout}
            style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <StatCard icon="💰" label="Wallet Balance" value={`₹${profile?.employee?.walletBalance || 0}`} color="#2e7d32" />
          <StatCard icon="🛡️" label="Coverage Used" value={`${profile?.employee?.benefitsUsed || 0} / ${profile?.employee?.benefitsLimit || 0}`} color="#1976d2" />
          <StatCard icon="👨‍👩‍👧‍👦" label="Dependents" value={dependents.length} color="#6a1b9a" />
          <StatCard icon="📋" label="Total Bookings" value={bookings.length} color="#e65100" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'white', borderRadius: '12px', padding: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flexWrap: 'wrap' }}>
          {[
            { key: 'dashboard', label: '🏠 Dashboard' },
            { key: 'services', label: '🏥 Services' },
            { key: 'bookings', label: '📋 Bookings' },
            { key: 'transactions', label: '💳 Transactions' },
            { key: 'dependents', label: '👨‍👩‍👧‍👦 Family' },
            { key: 'profile', label: '👤 Profile' }
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={tabStyle(activeTab === tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>🏢 Your Plan: {profile?.corporate?.planType}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {services.slice(0, 4).map((s, i) => (
                  <div key={i} style={{ padding: '12px', background: '#f8f9ff', borderRadius: '8px' }}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Coverage: {s.coverage?.percentage || 0}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>📋 Recent Bookings</h3>
              {bookings.slice(0, 5).map((b, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < bookings.slice(0, 5).length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>{b.bookingDetails?.name || b.serviceType}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
              {bookings.length === 0 && <p style={{ color: '#999', textAlign: 'center' }}>No bookings yet</p>}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {services.map((service, i) => (
              <div key={i} onClick={() => openBookingModal(service)}
                style={{ background: 'white', borderRadius: '12px', padding: '24px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
                <div style={{ fontSize: '44px', marginBottom: '12px' }}>{service.icon}</div>
                <div style={{ fontSize: '17px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>{service.name}</div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                  🛡️ {service.coverage?.percentage || 0}% covered up to ₹{service.coverage?.maxAmount || 0}
                </div>
                <div style={{ color: '#1976d2', fontWeight: '600', fontSize: '14px' }}>Book Now →</div>
              </div>
            ))}
            {services.length === 0 && <EmptyState icon="📭" text="No services enabled. Contact HR." />}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            {bookings.length === 0 ? <EmptyState icon="📋" text="No bookings yet." /> : (
              bookings.map((b, i) => (
                <div key={i} style={cardStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>{b.bookingDetails?.name || b.serviceType}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {b.bookingFor === 'dependent' && '👨‍👩‍👧‍👦 For: '}{new Date(b.createdAt).toLocaleDateString('en-IN')} • ₹{b.amount}
                      {b.coveredAmount > 0 && <span style={{ color: '#2e7d32' }}> (₹{b.coveredAmount} covered)</span>}
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#666' }}>Wallet Balance</div>
              <div style={{ fontSize: '30px', fontWeight: '700', color: '#2e7d32' }}>₹{profile?.employee?.walletBalance || 0}</div>
            </div>
            {transactions.length === 0 ? <EmptyState icon="💳" text="No transactions yet." /> : (
              transactions.map((tx, i) => (
                <div key={i} style={cardStyle}>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '15px' }}>{tx.description}</div>
                    <div style={{ fontSize: '13px', color: '#999' }}>{new Date(tx.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '16px', color: tx.type === 'debit' ? '#d32f2f' : '#2e7d32' }}>
                    {tx.type === 'debit' ? '−' : '+'}₹{tx.amount}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Dependents Tab */}
        {activeTab === 'dependents' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>👨‍👩‍👧‍👦 Family Members</h3>
            {dependents.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>👨‍👩‍👧‍👦</div>
                <p style={{ color: '#666', marginBottom: '8px' }}>No dependents added</p>
                <p style={{ fontSize: '13px', color: '#999' }}>Contact HR to add family members to your plan</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                {dependents.map((dep, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>{dep.relation === 'spouse' ? '💑' : dep.relation === 'child' ? '👶' : '👴'}</div>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>{dep.name}</div>
                    <div style={{ fontSize: '13px', color: '#666', textTransform: 'capitalize' }}>{dep.relation} • {dep.age} yrs</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>👤 Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Employee ID', value: profile?.employee?.employeeId },
                { label: 'Full Name', value: profile?.employee?.name },
                { label: 'Email', value: profile?.employee?.email },
                { label: 'Phone', value: profile?.employee?.phone },
                { label: 'Department', value: profile?.employee?.department },
                { label: 'Designation', value: profile?.employee?.designation },
                { label: 'Company', value: profile?.corporate?.name },
                { label: 'Plan Type', value: profile?.corporate?.planType, highlight: true }
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '15px', fontWeight: item.highlight ? '700' : '500', color: item.highlight ? '#1976d2' : '#1a1a1a' }}>
                    {item.value || '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '30px', maxWidth: '450px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{selectedService.icon} {selectedService.name}</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
              Coverage: {selectedService.coverage?.percentage || 0}% up to ₹{selectedService.coverage?.maxAmount || 0}
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Booking For</label>
              <select value={bookingFor} onChange={e => setBookingFor(e.target.value)} style={inputStyle}>
                <option value="self">🙋 Self</option>
                {dependents.map((dep, i) => (
                  <option key={i} value={dep._id || dep.name}>{dep.relation === 'spouse' ? '💑' : dep.relation === 'child' ? '👶' : '👴'} {dep.name} ({dep.relation})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Estimated Amount</label>
              <input type="number" value={bookingAmount} onChange={e => setBookingAmount(Number(e.target.value))} style={inputStyle} />
              <div style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
                You pay: ₹{(bookingAmount * (1 - (selectedService.coverage?.percentage || 0) / 100)).toFixed(0)} | 
                Company covers: ₹{(bookingAmount * (selectedService.coverage?.percentage || 0) / 100).toFixed(0)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowBookingModal(false)}
                style={{ flex: 1, padding: '12px', background: '#f5f5f5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
              <button onClick={handleConfirmBooking}
                style={{ flex: 1, padding: '12px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Confirm Booking</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

// Helper components
const StatCard = ({ icon, label, value, color }) => (
  <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{icon} {label}</div>
    <div style={{ fontSize: '24px', fontWeight: '700', color }}>{value}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    confirmed: { bg: '#e8f5e9', color: '#2e7d32' },
    completed: { bg: '#e3f2fd', color: '#1565c0' },
    cancelled: { bg: '#ffebee', color: '#c62828' },
    pending: { bg: '#fff3e0', color: '#e65100' }
  };
  const c = colors[status] || colors.pending;
  return <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: c.bg, color: c.color }}>{status}</span>;
};

const EmptyState = ({ icon, text }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
    <div style={{ fontSize: '48px', marginBottom: '12px' }}>{icon}</div>
    <p>{text}</p>
  </div>
);

const cardStyle = {
  background: 'white', borderRadius: '12px', padding: '16px 20px', marginBottom: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
};

const tabStyle = (active) => ({
  flex: 1, minWidth: '100px', padding: '12px 14px', border: 'none', borderRadius: '10px',
  fontSize: '13px', fontWeight: '500', cursor: 'pointer',
  background: active ? '#1976d2' : 'transparent', color: active ? 'white' : '#555'
});

const inputStyle = {
  width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: '8px',
  fontSize: '15px', outline: 'none', boxSizing: 'border-box'
};

const labelStyle = { display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '6px' };

export default EmployeePortal;