import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import axios from 'axios';
import {
  FaSearch, FaFilter, FaDownload, FaSync, FaArrowLeft,
  FaUserMd, FaBuilding, FaCalendarAlt, FaTag, FaRupeeSign,
  FaEye, FaCheck, FaTimes, FaBan, FaChartBar, FaBell,
  FaChevronLeft, FaChevronRight, FaExclamationTriangle, FaStar
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const API_BASE = 'https://hospital-backend-production-7d0f.up.railway.app';
const ADMIN_KEY = 'admin_secret_key_2024_hospitalhub_production_secure';

const AyurvedaAdminPanel = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  
  const [allDoctors, setAllDoctors] = useState([]);
  const [allCenters, setAllCenters] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [bulkSelected, setBulkSelected] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [stats, setStats] = useState({
    totalDoctors: 0, totalCenters: 0, totalBookings: 0,
    totalRevenue: 0, pendingDoctors: 0, pendingCenters: 0,
    activeDiscounts: 0, completedBookings: 0, cancelledBookings: 0,
    totalCommission: 0, pendingPayouts: 0
  });

  const [revenueData, setRevenueData] = useState([]);
  const [bookingTypeData, setBookingTypeData] = useState([]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
            const [
        doctorsRes, centersRes, pendingDocRes, pendingCenterRes,
        bookingsRes, discountsRes, settlementsRes, programsRes,
        productsRes, reviewsRes, complaintsRes
        ] = await Promise.all([
        api.get('/ayurveda/doctors'),
        api.get('/ayurveda/centers'),
        api.get('/ayurveda/admin/pending-doctors'),
        api.get('/ayurveda-centers/admin/pending'),
        api.get('/ayurveda/bookings/admin/all').catch(() => ({ data: { data: [] } })),
        api.get('/ayurveda/discounts').catch(() => ({ data: { data: [] } })),
        api.get('/ayurveda/settlements/admin/pending').catch(() => ({ data: { data: [] } })),
        api.get('/ayurveda/wellness-programs').catch(() => ({ data: { data: [] } })),
        api.get('/ayurveda/products').catch(() => ({ data: { data: [] } })),
        api.get('/ayurveda/reviews/all').catch(() => ({ data: { data: [] } })),
        api.get('/ayurveda/complaints/all').catch(() => ({ data: { data: [] } }))
      ]);

      const doctors = doctorsRes.data?.data || [];
      const centers = centersRes.data?.data || [];
      const pendingDocs = pendingDocRes.data?.data || [];
      const pendingCents = pendingCenterRes.data?.data || [];
      const bookings = bookingsRes.data?.data || [];
      const disc = discountsRes.data?.data || [];
      const settles = settlementsRes.data?.data || [];
      const progs = programsRes.data?.data || [];
      const prods = productsRes.data?.data || [];
      const revs = reviewsRes.data?.data || [];
      const comps = complaintsRes.data?.data || [];

      setAllDoctors([...doctors, ...pendingDocs]);
      setAllCenters([...centers, ...pendingCents]);
      setAllBookings(bookings);
      setDiscounts(disc);
      setSettlements(settles);
      setPrograms(progs);
      setProducts(prods);
      setReviews(revs);
      setComplaints(comps);

      const totalRevenue = bookings.filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.finalAmount || 0), 0);
      const totalCommission = bookings.filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.platformCommission || 0), 0);

      setStats({
        totalDoctors: doctors.length,
        totalCenters: centers.length,
        totalBookings: bookings.length,
        totalRevenue,
        pendingDoctors: pendingDocs.length,
        pendingCenters: pendingCents.length,
        activeDiscounts: disc.filter(d => d.isActive).length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
        totalCommission,
        pendingPayouts: settles.length
      });

      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayBookings = bookings.filter(b => 
          new Date(b.createdAt).toISOString().split('T')[0] === dateStr && 
          b.paymentStatus === 'paid'
        );
        last7Days.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: dayBookings.reduce((s, b) => s + (b.finalAmount || 0), 0),
          bookings: dayBookings.length
        });
      }
      setRevenueData(last7Days);

      const typeMap = {};
      bookings.forEach(b => {
        const type = b.type || 'unknown';
        typeMap[type] = (typeMap[type] || 0) + 1;
      });
      setBookingTypeData(Object.entries(typeMap).map(([name, value]) => ({ name, value })));

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchAllData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchAllData]);

  const addNotification = (message, type = 'info') => {
    const notif = { id: Date.now(), message, type, time: new Date().toLocaleTimeString() };
    setNotifications(prev => [notif, ...prev].slice(0, 20));
  };

  const verifyDoctor = async (id, status, reason = '') => {
    try {
      await api.put(`/ayurveda/admin/verify-doctor/${id}`, { status, rejectionReason: reason });
      setShowRejectModal(null);
      setRejectionReason('');
      fetchAllData();
      addNotification(`Doctor ${status}`, 'success');
    } catch (error) {
      addNotification(`Failed: ${error.message}`, 'error');
    }
  };

  const verifyCenter = async (id, status) => {
    try {
      await axios.put(`${API_BASE}/api/ayurveda-centers/admin/verify/${id}`, 
        { status }, 
        { headers: { 'X-Admin-Key': ADMIN_KEY } }
      );
      fetchAllData();
      addNotification(`Center ${status}`, 'success');
    } catch (error) {
      addNotification(`Failed: ${error.message}`, 'error');
    }
  };

  const suspendDoctor = async (id) => {
    if (window.confirm('Suspend this doctor?')) {
      await verifyDoctor(id, 'suspended');
    }
  };

  const processRefund = async (bookingId) => {
    try {
      await api.post(`/ayurveda/bookings/${bookingId}/refund`, { reason: refundReason });
      setShowRefundModal(null);
      setRefundReason('');
      fetchAllData();
      addNotification('Refund processed', 'success');
    } catch (error) {
      addNotification('Refund failed: ' + error.message, 'error');
    }
  };

  const bulkApproveDoctors = async () => {
    if (bulkSelected.length === 0) return;
    if (!window.confirm(`Approve ${bulkSelected.length} doctors?`)) return;
    
    for (const id of bulkSelected) {
      await verifyDoctor(id, 'approved');
    }
    setBulkSelected([]);
    fetchAllData();
  };

  const toggleDiscount = async (id, isActive) => {
    try {
      await api.put(`/ayurveda/discounts/${id}`, { isActive: !isActive });
      fetchAllData();
      addNotification('Discount updated', 'success');
    } catch (error) {
      addNotification('Failed: ' + error.message, 'error');
    }
  };

  const approveSettlement = async (payoutId) => {
    try {
      await api.put(`/ayurveda/settlements/admin/approve/${payoutId}`, {}, {
        headers: { 'X-Admin-Key': ADMIN_KEY }
      });
      fetchAllData();
      addNotification('Settlement approved', 'success');
    } catch (error) {
      addNotification('Failed: ' + error.message, 'error');
    }
  };

  const createDiscount = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      await api.post('/ayurveda/discounts', {
        code: form.code.value,
        discountType: form.discountType.value,
        value: Number(form.value.value),
        maxDiscount: form.maxDiscount.value ? Number(form.maxDiscount.value) : undefined,
        validFrom: form.validFrom.value,
        validTill: form.validTill.value
      });
      setShowDiscountModal(false);
      fetchAllData();
      addNotification('Discount created', 'success');
    } catch (error) {
      addNotification('Failed: ' + error.message, 'error');
    }
  };

  const handleExport = (type) => {
    let data = [];
    let filename = '';
    
    if (type === 'doctors') {
      data = allDoctors.map(d => ({
        Name: d.name, Specialty: d.specialization, Phone: d.phone,
        Email: d.email, City: d.address?.city, Fee: d.consultationFee, Status: d.verificationStatus
      }));
      filename = 'doctors-export.csv';
    } else if (type === 'centers') {
      data = allCenters.map(c => ({
        Name: c.name, Type: c.type, City: c.address?.city, Phone: c.phone, Status: c.verificationStatus
      }));
      filename = 'centers-export.csv';
    } else if (type === 'bookings') {
      data = allBookings.map(b => ({
        BookingID: b.bookingId, Patient: b.patient?.name, Doctor: b.doctorName,
        Amount: b.finalAmount, Payment: b.paymentStatus, Status: b.status
      }));
      filename = 'bookings-export.csv';
    }

    const csv = data.length > 0 ? 
      [Object.keys(data[0]).join(','), ...data.map(row => Object.values(row).join(','))].join('\n') : '';
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDoctors = useMemo(() => {
    let result = allDoctors;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.name?.toLowerCase().includes(q) || 
        d.specialization?.toLowerCase().includes(q) ||
        d.phone?.includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(d => d.verificationStatus === statusFilter);
    }
    return result;
  }, [allDoctors, searchQuery, statusFilter]);

  const filteredCenters = useMemo(() => {
    let result = allCenters;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name?.toLowerCase().includes(q));
    }
    return result;
  }, [allCenters, searchQuery]);

  const filteredBookings = useMemo(() => {
    let result = allBookings;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.bookingId?.toLowerCase().includes(q) || 
        b.patient?.name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(b => b.status === statusFilter || b.paymentStatus === statusFilter);
    }
    if (dateRange.from) {
      result = result.filter(b => new Date(b.createdAt) >= new Date(dateRange.from));
    }
    if (dateRange.to) {
      result = result.filter(b => new Date(b.createdAt) <= new Date(dateRange.to));
    }
    return result;
  }, [allBookings, searchQuery, statusFilter, dateRange]);

  const paginatedDoctors = filteredDoctors.slice((page - 1) * perPage, page * perPage);
  const paginatedCenters = filteredCenters.slice((page - 1) * perPage, page * perPage);
  const paginatedBookings = filteredBookings.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(Math.max(filteredDoctors.length, filteredCenters.length, filteredBookings.length) / perPage);

  const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>🧘</div>
          <p style={{ fontWeight: 600, color: '#64748b' }}>Loading Ayurveda Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #064e3b, #047857)', padding: '1.2rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>🧘 Ayurveda Admin Panel</h1>
          <p style={{ opacity: 0.8, fontSize: '0.85rem', margin: '2px 0 0' }}>
            Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setShowNotifications(!showNotifications)} style={headerBtn('#f59e0b')}>
            <FaBell /> {notifications.length > 0 && `(${notifications.length})`}
          </button>
          <button onClick={() => setShowExport(true)} style={headerBtn('#8b5cf6')}>
            <FaDownload /> Export
          </button>
          <button onClick={() => setAutoRefresh(!autoRefresh)} style={headerBtn(autoRefresh ? '#10b981' : '#ef4444')}>
            <FaSync /> {autoRefresh ? 'Auto ON' : 'Auto OFF'}
          </button>
          <button onClick={fetchAllData} style={headerBtn('#3b82f6')}>
            <FaSync /> Refresh
          </button>
          <button onClick={() => navigate('/admin')} style={headerBtn('#64748b')}>
            <FaArrowLeft /> Back
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS PANEL */}
      {showNotifications && (
        <div style={{ position: 'absolute', right: '2rem', top: '4.5rem', width: 350, maxHeight: 400, overflowY: 'auto', backgroundColor: 'white', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.2)', zIndex: 1000 }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 700 }}>🔔 Notifications</div>
          {notifications.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No notifications</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.8rem', color: n.type === 'success' ? '#059669' : n.type === 'error' ? '#dc2626' : '#475569' }}>
                <div>{n.message}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{n.time}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TABS */}
      <div style={{ backgroundColor: 'white', padding: '0.75rem 2rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
        {[
          { id: 'overview', label: '📊 Overview', icon: FaChartBar },
          { id: 'doctors', label: `👨‍⚕️ Doctors (${stats.totalDoctors})`, icon: FaUserMd },
          { id: 'centers', label: `🏨 Centers (${stats.totalCenters})`, icon: FaBuilding },
          { id: 'bookings', label: `📋 Bookings (${stats.totalBookings})`, icon: FaCalendarAlt },
          { id: 'discounts', label: `🏷️ Discounts (${stats.activeDiscounts})`, icon: FaTag },
          { id: 'settlements', label: `💰 Settlements (${stats.pendingPayouts})`, icon: FaRupeeSign },
          { id: 'pending', label: `⏳ Pending (${stats.pendingDoctors + stats.pendingCenters})`, icon: FaExclamationTriangle },
          { id: 'programs', label: '💪 Programs', icon: FaTag },
          { id: 'products', label: '🌿 Products', icon: FaTag },
          { id: 'reviews', label: '⭐ Reviews', icon: FaStar },
          { id: 'complaints', label: '🚨 Complaints', icon: FaExclamationTriangle },
        ].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setPage(1); }}
            style={{
              padding: '0.6rem 1.25rem', border: 'none', borderRadius: 8, cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: tab === t.id ? 700 : 400,
              background: tab === t.id ? '#059669' : 'transparent',
              color: tab === t.id ? 'white' : '#475569',
              display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap'
            }}>
            <t.icon /> {t.label}
          </button>
        ))}
      </div>

      {/* SEARCH & FILTER */}
      <div style={{ padding: '1rem 2rem', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="🔍 Search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.9rem', flex: 1, minWidth: 200 }}
        />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.9rem' }}>
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="paid">Paid</option>
        </select>
        {tab === 'bookings' && (
          <>
            <input type="date" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})}
              style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid #d1d5db' }} />
            <span style={{ color: '#64748b' }}>to</span>
            <input type="date" value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})}
              style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid #d1d5db' }} />
          </>
        )}
      </div>

      {/* CONTENT */}
      <div style={{ padding: '1.5rem 2rem', maxWidth: 1400, margin: '0 auto' }}>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Doctors', value: stats.totalDoctors, color: '#4CAF50', icon: '👨‍⚕️' },
                { label: 'Total Centers', value: stats.totalCenters, color: '#2196F3', icon: '🏨' },
                { label: 'Total Bookings', value: stats.totalBookings, color: '#9C27B0', icon: '📋' },
                { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, color: '#E91E63', icon: '💰' },
                { label: 'Commission', value: `₹${stats.totalCommission.toLocaleString()}`, color: '#F59E0B', icon: '💸' },
                { label: 'Pending', value: stats.pendingDoctors + stats.pendingCenters, color: '#FF9800', icon: '⏳' },
                { label: 'Completed', value: stats.completedBookings, color: '#10B981', icon: '✅' },
                { label: 'Cancelled', value: stats.cancelledBookings, color: '#EF4444', icon: '❌' },
              ].map((s, i) => (
                <div key={i} style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}`, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>📈 Revenue Trend (7 Days)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#059669" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>📊 Booking Types</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={bookingTypeData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                      {bookingTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {(stats.pendingDoctors + stats.pendingCenters) > 0 && (
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ color: '#92400e', fontWeight: 700, margin: '0 0 0.5rem' }}>⏳ Pending Approvals</h3>
                {allDoctors.filter(d => d.verificationStatus === 'pending').slice(0, 3).map(d => (
                  <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0' }}>
                    <span>👨‍⚕️ {d.name} - {d.specialization}</span>
                    <button onClick={() => setTab('pending')} style={{ color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Review →</button>
                  </div>
                ))}
                {allCenters.filter(c => c.verificationStatus === 'pending').slice(0, 3).map(c => (
                  <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0' }}>
                    <span>🏨 {c.name} - {c.type}</span>
                    <button onClick={() => setTab('pending')} style={{ color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Review →</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>📋 Recent Bookings</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={th}>Booking ID</th>
                    <th style={th}>Patient</th>
                    <th style={th}>Doctor</th>
                    <th style={th}>Amount</th>
                    <th style={th}>Payment</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.slice(0, 5).map(b => (
                    <tr key={b.bookingId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={td}>{b.bookingId}</td>
                      <td style={td}>{b.patient?.name}</td>
                      <td style={td}>{b.doctorName}</td>
                      <td style={td}>₹{b.finalAmount}</td>
                      <td style={td}>{b.paymentStatus}</td>
                      <td style={td}>{b.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* DOCTORS TAB */}
        {tab === 'doctors' && (
          <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontWeight: 700, margin: 0 }}>👨‍⚕️ Doctors ({filteredDoctors.length})</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleExport('doctors')} style={actionBtn('#8b5cf6')}><FaDownload /> Export</button>
                {bulkSelected.length > 0 && (
                  <button onClick={bulkApproveDoctors} style={actionBtn('#10b981')}>✅ Approve Selected ({bulkSelected.length})</button>
                )}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={th}><input type="checkbox" onChange={e => {
                    if (e.target.checked) setBulkSelected(filteredDoctors.filter(d => d.verificationStatus === 'pending').map(d => d._id));
                    else setBulkSelected([]);
                  }} /></th>
                  <th style={th}>Name</th>
                  <th style={th}>Specialty</th>
                  <th style={th}>Phone</th>
                  <th style={th}>City</th>
                  <th style={th}>Fee</th>
                  <th style={th}>Status</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDoctors.map(d => (
                  <tr key={d._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={td}>
                      {d.verificationStatus === 'pending' && (
                        <input type="checkbox" checked={bulkSelected.includes(d._id)}
                          onChange={e => {
                            if (e.target.checked) setBulkSelected([...bulkSelected, d._id]);
                            else setBulkSelected(bulkSelected.filter(id => id !== d._id));
                          }} />
                      )}
                    </td>
                    <td style={td}><strong>{d.name}</strong></td>
                    <td style={td}>{d.specialization}</td>
                    <td style={td}>{d.phone}</td>
                    <td style={td}>{d.address?.city}</td>
                    <td style={td}>₹{d.consultationFee}</td>
                    <td style={td}><span style={statusBadge(d.verificationStatus)}>{d.verificationStatus}</span></td>
                    <td style={td}>
                      <button onClick={() => setSelectedDoctor(d)} style={actionBtn('#3b82f6')}><FaEye /></button>
                      {d.verificationStatus === 'pending' && (
                        <>
                          <button onClick={() => verifyDoctor(d._id, 'approved')} style={actionBtn('#10b981')}><FaCheck /></button>
                          <button onClick={() => setShowRejectModal(d._id)} style={actionBtn('#ef4444')}><FaTimes /></button>
                        </>
                      )}
                      {d.verificationStatus === 'approved' && (
                        <button onClick={() => suspendDoctor(d._id)} style={actionBtn('#f59e0b')}><FaBan /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={pageBtn}><FaChevronLeft /></button>
                <span style={{ padding: '0.4rem 1rem', fontWeight: 600 }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={pageBtn}><FaChevronRight /></button>
              </div>
            )}
          </div>
        )}

        {/* CENTERS TAB */}
        {tab === 'centers' && (
          <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 700, margin: 0 }}>🏨 Centers ({filteredCenters.length})</h2>
              <button onClick={() => handleExport('centers')} style={actionBtn('#8b5cf6')}><FaDownload /> Export</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={th}>Name</th>
                  <th style={th}>Type</th>
                  <th style={th}>City</th>
                  <th style={th}>Phone</th>
                  <th style={th}>Status</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCenters.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={td}><strong>{c.name}</strong></td>
                    <td style={td}>{c.type}</td>
                    <td style={td}>{c.address?.city}</td>
                    <td style={td}>{c.phone}</td>
                    <td style={td}><span style={statusBadge(c.verificationStatus)}>{c.verificationStatus}</span></td>
                    <td style={td}>
                      <button onClick={() => setSelectedCenter(c)} style={actionBtn('#3b82f6')}><FaEye /></button>
                      {c.verificationStatus === 'pending' && (
                        <>
                          <button onClick={() => verifyCenter(c._id, 'approved')} style={actionBtn('#10b981')}><FaCheck /></button>
                          <button onClick={() => verifyCenter(c._id, 'rejected')} style={actionBtn('#ef4444')}><FaTimes /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {tab === 'bookings' && (
          <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 700, margin: 0 }}>📋 Bookings ({filteredBookings.length})</h2>
              <button onClick={() => handleExport('bookings')} style={actionBtn('#8b5cf6')}><FaDownload /> Export</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={th}>Booking ID</th>
                  <th style={th}>Patient</th>
                  <th style={th}>Doctor/Center</th>
                  <th style={th}>Amount</th>
                  <th style={th}>Payment</th>
                  <th style={th}>Status</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map(b => (
                  <tr key={b.bookingId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={td}>{b.bookingId}</td>
                    <td style={td}>{b.patient?.name}</td>
                    <td style={td}>{b.doctorName || b.centerName}</td>
                    <td style={td}>₹{b.finalAmount}</td>
                    <td style={td}>{b.paymentStatus}</td>
                    <td style={td}>{b.status}</td>
                    <td style={td}>
                      <button onClick={() => setSelectedBooking(b)} style={actionBtn('#3b82f6')}><FaEye /></button>
                      {b.paymentStatus === 'paid' && b.status !== 'completed' && b.status !== 'cancelled' && (
                        <button onClick={() => setShowRefundModal(b.bookingId)} style={actionBtn('#ef4444')}>Refund</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DISCOUNTS TAB */}
        {tab === 'discounts' && (
          <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 700, margin: 0 }}>🏷️ Discounts ({discounts.length})</h2>
              <button onClick={() => setShowDiscountModal(true)} style={{ padding: '0.5rem 1rem', background: '#059669', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>+ Create Discount</button>
            </div>
            {discounts.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No discounts created</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={th}>Code</th>
                    <th style={th}>Value</th>
                    <th style={th}>Used</th>
                    <th style={th}>Valid Till</th>
                    <th style={th}>Status</th>
                    <th style={th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map(d => (
                    <tr key={d._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={td}><strong>{d.code}</strong></td>
                      <td style={td}>{d.value}{d.discountType === 'percentage' ? '%' : '₹'}</td>
                      <td style={td}>{d.usedCount || 0}</td>
                      <td style={td}>{d.validTill ? new Date(d.validTill).toLocaleDateString() : 'N/A'}</td>
                      <td style={td}>{d.isActive ? '🟢 Active' : '🔴 Inactive'}</td>
                      <td style={td}>
                        <button onClick={() => toggleDiscount(d._id, d.isActive)} style={actionBtn(d.isActive ? '#ef4444' : '#10b981')}>
                          {d.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SETTLEMENTS TAB */}
        {tab === 'settlements' && (
          <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>💰 Pending Settlements ({settlements.length})</h2>
            {settlements.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No pending settlements</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={th}>Payout ID</th>
                    <th style={th}>Provider</th>
                    <th style={th}>Amount</th>
                    <th style={th}>Status</th>
                    <th style={th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map(s => (
                    <tr key={s.payoutId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={td}>{s.payoutId}</td>
                      <td style={td}>{s.providerName}</td>
                      <td style={td}>₹{s.amount}</td>
                      <td style={td}>{s.status}</td>
                      <td style={td}>
                        <button onClick={() => approveSettlement(s.payoutId)} style={actionBtn('#10b981')}>Approve</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* PROGRAMS TAB */}
        {tab === 'programs' && (
          <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>💪 Wellness Programs ({programs.length})</h2>
            {programs.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No programs found</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={th}>Name</th>
                    <th style={th}>Doctor</th>
                    <th style={th}>Category</th>
                    <th style={th}>Price</th>
                    <th style={th}>Duration</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map(p => (
                    <tr key={p._id || p.name} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={td}><strong>{p.name}</strong></td>
                      <td style={td}>{p.doctorName || 'N/A'}</td>
                      <td style={td}>{p.category?.replace(/_/g, ' ')}</td>
                      <td style={td}>₹{p.price}</td>
                      <td style={td}>{p.duration}</td>
                      <td style={td}>{p.isActive ? '🟢 Active' : '🔴 Inactive'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>🌿 Products ({products.length})</h2>
            {products.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No products found</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={th}>Name</th>
                    <th style={th}>Category</th>
                    <th style={th}>Price</th>
                    <th style={th}>Stock</th>
                    <th style={th}>Prakriti</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={td}><strong>{p.name}</strong></td>
                      <td style={td}>{p.category}</td>
                      <td style={td}>₹{p.discountPrice || p.price}</td>
                      <td style={td}>{p.stock || 0}</td>
                      <td style={td}>{p.prakritiType?.join(', ') || 'All'}</td>
                      <td style={td}>{p.isActive ? '🟢 Active' : '🔴 Inactive'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* REVIEWS TAB */}
        {tab === 'reviews' && (
          <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>⭐ Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No reviews found</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={th}>Patient</th>
                    <th style={th}>Doctor</th>
                    <th style={th}>Rating</th>
                    <th style={th}>Review</th>
                    <th style={th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(r => (
                    <tr key={r._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={td}>{r.patientName || 'N/A'}</td>
                      <td style={td}>{r.doctorName || 'N/A'}</td>
                      <td style={td}>⭐ {r.rating}/5</td>
                      <td style={td}>{r.comment || r.review || 'N/A'}</td>
                      <td style={td}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* COMPLAINTS TAB */}
        {tab === 'complaints' && (
          <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>🚨 Complaints ({complaints.length})</h2>
            {complaints.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No complaints found</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={th}>Booking</th>
                    <th style={th}>Patient</th>
                    <th style={th}>Category</th>
                    <th style={th}>Description</th>
                    <th style={th}>Priority</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={td}>{c.bookingId || 'N/A'}</td>
                      <td style={td}>{c.patientName || 'N/A'}</td>
                      <td style={td}>{c.category || 'N/A'}</td>
                      <td style={td}>{c.description || 'N/A'}</td>
                      <td style={td}>{c.priority || 'medium'}</td>
                      <td style={td}>{c.status || 'pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* PENDING TAB */}
        {tab === 'pending' && (
          <div>
            <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>⏳ Pending Approvals</h2>
            {allDoctors.filter(d => d.verificationStatus === 'pending').map(d => (
              <div key={d._id} style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.2rem', marginBottom: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <strong>👨‍⚕️ {d.name}</strong>
                    <p style={{ margin: '2px 0', color: '#64748b', fontSize: '0.85rem' }}>{d.specialization} • {d.address?.city} • {d.phone}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => setSelectedDoctor(d)} style={actionBtn('#3b82f6')}>View Details</button>
                    <button onClick={() => verifyDoctor(d._id, 'approved')} style={actionBtn('#10b981')}>✅ Approve</button>
                    <button onClick={() => setShowRejectModal(d._id)} style={actionBtn('#ef4444')}>❌ Reject</button>
                  </div>
                </div>
              </div>
            ))}
            {allCenters.filter(c => c.verificationStatus === 'pending').map(c => (
              <div key={c._id} style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.2rem', marginBottom: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <strong>🏨 {c.name}</strong>
                    <p style={{ margin: '2px 0', color: '#64748b', fontSize: '0.85rem' }}>{c.type} • {c.address?.city} • {c.phone}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => verifyCenter(c._id, 'approved')} style={actionBtn('#10b981')}>✅ Approve</button>
                    <button onClick={() => verifyCenter(c._id, 'rejected')} style={actionBtn('#ef4444')}>❌ Reject</button>
                  </div>
                </div>
              </div>
            ))}
            {allDoctors.filter(d => d.verificationStatus === 'pending').length === 0 && allCenters.filter(c => c.verificationStatus === 'pending').length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: 12 }}>
                <div style={{ fontSize: '3rem' }}>✅</div>
                <p style={{ color: '#64748b' }}>All caught up! No pending approvals.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DOCTOR DETAILS MODAL */}
      {selectedDoctor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 16, maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>👨‍⚕️ Doctor Details</h3>
              <button onClick={() => setSelectedDoctor(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #059669, #047857)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem' }}>
                {selectedDoctor.name?.charAt(0)}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedDoctor.name}</h4>
                <p style={{ color: '#059669', fontWeight: 600, margin: '2px 0' }}>{selectedDoctor.specialization}</p>
                <span style={statusBadge(selectedDoctor.verificationStatus)}>{selectedDoctor.verificationStatus}</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div><strong>Phone:</strong> {selectedDoctor.phone}</div>
              <div><strong>Email:</strong> {selectedDoctor.email}</div>
              <div><strong>City:</strong> {selectedDoctor.address?.city}, {selectedDoctor.address?.state}</div>
              <div><strong>Experience:</strong> {selectedDoctor.experience} years</div>
              <div><strong>Fee:</strong> ₹{selectedDoctor.consultationFee}</div>
              <div><strong>AYUSH Reg:</strong> {selectedDoctor.ayushRegNo}</div>
              <div><strong>Education:</strong> {selectedDoctor.education}</div>
              <div><strong>Rating:</strong> ⭐ {selectedDoctor.rating || 'New'}</div>
            </div>
            {selectedDoctor.documents && (
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 8, marginBottom: '1rem' }}>
                <h5 style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>📄 Documents</h5>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedDoctor.documents.ayushCertificate && (
                    <a href={selectedDoctor.documents.ayushCertificate} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#3b82f6' }}>AYUSH Certificate</a>
                  )}
                  {selectedDoctor.documents.idProof && (
                    <a href={selectedDoctor.documents.idProof} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#3b82f6' }}>ID Proof</a>
                  )}
                  {selectedDoctor.documents.degreeCertificate && (
                    <a href={selectedDoctor.documents.degreeCertificate} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#3b82f6' }}>Degree</a>
                  )}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {selectedDoctor.verificationStatus === 'pending' && (
                <>
                  <button onClick={() => verifyDoctor(selectedDoctor._id, 'approved')} style={{ flex: 1, padding: '0.6rem', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>✅ Approve</button>
                  <button onClick={() => setShowRejectModal(selectedDoctor._id)} style={{ flex: 1, padding: '0.6rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>❌ Reject</button>
                </>
              )}
              <button onClick={() => setSelectedDoctor(null)} style={{ flex: 1, padding: '0.6rem', background: '#e2e8f0', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CENTER DETAILS MODAL */}
      {selectedCenter && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 16, maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>🏨 Center Details</h3>
              <button onClick={() => setSelectedCenter(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div><strong>Name:</strong> {selectedCenter.name}</div>
              <div><strong>Type:</strong> {selectedCenter.type}</div>
              <div><strong>Phone:</strong> {selectedCenter.phone}</div>
              <div><strong>Email:</strong> {selectedCenter.email}</div>
              <div><strong>City:</strong> {selectedCenter.address?.city}</div>
              <div><strong>Beds:</strong> {selectedCenter.bedCount || 'N/A'}</div>
              <div><strong>Panchakarma Rooms:</strong> {selectedCenter.panchakarmaRooms || 'N/A'}</div>
              <div><strong>Doctors:</strong> {selectedCenter.doctorCount || 'N/A'}</div>
            </div>
            {selectedCenter.packages && selectedCenter.packages.length > 0 && (
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 8, marginBottom: '1rem' }}>
                <h5 style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>📦 Packages</h5>
                {selectedCenter.packages.map((pkg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>{pkg.name}</span>
                    <span>₹{pkg.discountPrice || pkg.price} • {pkg.duration} days</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {selectedCenter.verificationStatus === 'pending' && (
                <>
                  <button onClick={() => verifyCenter(selectedCenter._id, 'approved')} style={{ flex: 1, padding: '0.6rem', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>✅ Approve</button>
                  <button onClick={() => verifyCenter(selectedCenter._id, 'rejected')} style={{ flex: 1, padding: '0.6rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>❌ Reject</button>
                </>
              )}
              <button onClick={() => setSelectedCenter(null)} style={{ flex: 1, padding: '0.6rem', background: '#e2e8f0', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 16, maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>📋 Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div><strong>Booking ID:</strong> {selectedBooking.bookingId}</div>
              <div><strong>Type:</strong> {selectedBooking.type}</div>
              <div><strong>Patient:</strong> {selectedBooking.patient?.name}</div>
              <div><strong>Phone:</strong> {selectedBooking.patient?.phone}</div>
              <div><strong>Doctor:</strong> {selectedBooking.doctorName}</div>
              <div><strong>Amount:</strong> ₹{selectedBooking.finalAmount}</div>
              <div><strong>Payment:</strong> {selectedBooking.paymentStatus}</div>
              <div><strong>Status:</strong> {selectedBooking.status}</div>
              <div><strong>Date:</strong> {new Date(selectedBooking.bookingDate).toLocaleDateString()}</div>
              <div><strong>Commission:</strong> ₹{selectedBooking.platformCommission}</div>
              <div><strong>Provider Earning:</strong> ₹{selectedBooking.providerEarning}</div>
              <div><strong>OTP Verified:</strong> {selectedBooking.otpVerified ? '✅ Yes' : '❌ No'}</div>
            </div>
            <button onClick={() => setSelectedBooking(null)} style={{ width: '100%', padding: '0.6rem', background: '#e2e8f0', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', maxWidth: 400, width: '90%' }}>
            <h3 style={{ margin: '0 0 1rem' }}>❌ Reject</h3>
            <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..." rows="3"
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #d1d5db' }} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button onClick={() => verifyDoctor(showRejectModal, 'rejected', rejectionReason)} style={{ flex: 1, padding: '0.6rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Confirm Reject</button>
              <button onClick={() => { setShowRejectModal(null); setRejectionReason(''); }} style={{ flex: 1, padding: '0.6rem', background: '#e2e8f0', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {showRefundModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', maxWidth: 400, width: '90%' }}>
            <h3 style={{ margin: '0 0 1rem' }}>💰 Process Refund</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Booking: {showRefundModal}</p>
            <textarea value={refundReason} onChange={e => setRefundReason(e.target.value)}
              placeholder="Reason for refund..." rows="3"
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #d1d5db' }} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button onClick={() => processRefund(showRefundModal)} style={{ flex: 1, padding: '0.6rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Confirm Refund</button>
              <button onClick={() => { setShowRefundModal(null); setRefundReason(''); }} style={{ flex: 1, padding: '0.6rem', background: '#e2e8f0', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {showExport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', maxWidth: 400, width: '90%' }}>
            <h3 style={{ margin: '0 0 1rem' }}>📥 Export Data</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={() => { handleExport('doctors'); setShowExport(false); }} style={{ padding: '0.75rem', background: '#059669', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>👨‍⚕️ Export Doctors</button>
              <button onClick={() => { handleExport('centers'); setShowExport(false); }} style={{ padding: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>🏨 Export Centers</button>
              <button onClick={() => { handleExport('bookings'); setShowExport(false); }} style={{ padding: '0.75rem', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>📋 Export Bookings</button>
              <button onClick={() => setShowExport(false)} style={{ padding: '0.75rem', background: '#e2e8f0', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DISCOUNT MODAL */}
      {showDiscountModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem' }}>🏷️ Create Discount</h3>
            <form onSubmit={createDiscount} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input name="code" placeholder="Code (e.g., AYUR50)" required style={inputStyle} />
              <select name="discountType" required style={inputStyle}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
              <input name="value" type="number" placeholder="Value" required style={inputStyle} />
              <input name="maxDiscount" type="number" placeholder="Max Discount (optional)" style={inputStyle} />
              <input name="validFrom" type="date" required style={inputStyle} />
              <input name="validTill" type="date" required style={inputStyle} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', background: '#059669', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Create</button>
                <button type="button" onClick={() => setShowDiscountModal(false)} style={{ flex: 1, padding: '0.6rem', background: '#e2e8f0', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const headerBtn = (bg) => ({
  padding: '0.5rem 1rem', background: bg, color: 'white', border: 'none',
  borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
  display: 'flex', alignItems: 'center', gap: '0.4rem'
});

const actionBtn = (bg) => ({
  padding: '0.3rem 0.6rem', background: bg, color: 'white', border: 'none',
  borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', marginRight: '0.3rem'
});

const statusBadge = (status) => ({
  padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
  background: status === 'approved' ? '#e8f5e9' : status === 'pending' ? '#fff3e0' : status === 'suspended' ? '#fee2e2' : '#f1f5f9',
  color: status === 'approved' ? '#2E7D32' : status === 'pending' ? '#e65100' : status === 'suspended' ? '#dc2626' : '#64748b'
});

const th = { padding: '0.75rem', textAlign: 'left', fontWeight: 700, color: '#1e293b', fontSize: '0.8rem' };
const td = { padding: '0.75rem', color: '#475569' };
const pageBtn = { padding: '0.4rem 0.8rem', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' };
const inputStyle = { padding: '0.6rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.9rem', width: '100%' };

export default AyurvedaAdminPanel;