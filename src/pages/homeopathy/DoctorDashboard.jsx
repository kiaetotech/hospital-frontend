import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import CorporatePlansTab from '../../components/CorporatePlansTab';
import {
  FaCalendarAlt, FaStar, FaRupeeSign, FaUsers,
  FaVideo, FaClock, FaCheckCircle, FaTimesCircle,
  FaWallet, FaHistory, FaChartBar, FaExclamationTriangle
} from 'react-icons/fa';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [otpInput, setOtpInput] = useState('');
  const [onlineStatus, setOnlineStatus] = useState('offline');
  const [consultationMode, setConsultationMode] = useState('video');
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [availability, setAvailability] = useState([]);
  const [savingAvailability, setSavingAvailability] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('doctorToken');
    const doctorData = JSON.parse(localStorage.getItem('doctor') || '{}');
    const doctorId = doctorData.id || doctorData._id;

    if (!token || !doctorId) {
      navigate('/homeopathy/doctor/login', { replace: true });
      return;
    }

    setDoctor({ ...doctorData, id: doctorId });
    fetchDashboardData(doctorId);
    fetchAvailability(doctorId);
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'complaints') fetchComplaints();
    else if (activeTab === 'reviews') fetchReviews();
  }, [activeTab]);

  const fetchAvailability = async (doctorId) => {
    try {
      const response = await api.get(`/homeopathy/doctor/${doctorId || doctor.id}/availability`);
      if (response.data.success) {
        setAvailability(response.data.data.availability || []);
      }
    } catch (err) {
      console.error('Failed to load availability:', err.message);
    }
  };

  const handleSaveAvailability = async () => {
    setSavingAvailability(true);
    try {
      const response = await api.put('/homeopathy/doctor/availability', {
        doctorId: doctor.id,
        availability: availability.filter(a => a && a.day)
      });
      if (response.data.success) {
        alert('Availability saved successfully!');
      } else {
        alert(response.data.error || 'Failed to save availability');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save availability');
    } finally {
      setSavingAvailability(false);
    }
  };

    const fetchDashboardData = async (doctorId) => {
    setLoading(true);
    setError('');
    try {
      const [docRes, bookingsRes, earningsRes, settlementsRes] = await Promise.allSettled([
        api.get(`/homeopathy/doctors/${doctorId}`),
        api.get(`/homeopathy/bookings/doctor/${doctorId}`),
        api.get(`/homeopathy/settlements/earnings/homeopathy_doctor/${doctorId}`),
        api.get(`/homeopathy/settlements/history/homeopathy_doctor/${doctorId}`)
      ]);

      // Doctor profile
      if (docRes.status === 'fulfilled' && docRes.value.data?.success) {
        const d = docRes.value.data.data;
        setDoctor(prev => ({ ...prev, ...d, id: d._id }));
        setOnlineStatus(d.currentStatus || 'offline');
        setConsultationMode(d.currentConsultationMode || 'video');
      }

      // Bookings — always works
      let paidBookings = [];
      if (bookingsRes.status === 'fulfilled' && bookingsRes.value.data?.success) {
        const bks = bookingsRes.value.data.data || [];
        setBookings(bks);
        paidBookings = bks.filter(b => b.paymentStatus === 'paid');
      }

      // Earnings — compute locally from bookings (no settlement API needed)
      const computedEarnings = {
        totalBookings: paidBookings.length,
        totalEarnings: paidBookings.reduce((s, b) => s + (b.providerEarning || 0), 0),
        totalCommission: paidBookings.reduce((s, b) => s + (b.platformCommission || 0), 0),
        pendingPayout: paidBookings
          .filter(b => b.commissionPayoutStatus === 'pending')
          .reduce((s, b) => s + (b.providerEarning || 0), 0)
      };

      // Prefer backend earnings if it succeeded, else use computed
      if (earningsRes.status === 'fulfilled' && earningsRes.value.data?.success) {
        setEarnings(earningsRes.value.data.data);
      } else {
        console.warn('Earnings API failed (403) — using computed fallback');
        setEarnings(computedEarnings);
      }

      // Settlements — empty array if API fails
      if (settlementsRes.status === 'fulfilled' && settlementsRes.value.data?.success) {
        setSettlements(settlementsRes.value.data.data || []);
      } else {
        setSettlements([]);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const res = await api.get('/homeopathy/bookings/doctor/complaints');
      if (res.data?.success) setComplaints(res.data.data || []);
    } catch (err) {
      console.error('Complaints error:', err);
    } finally {
      setComplaintsLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await api.get('/homeopathy/bookings/doctor/reviews');
      if (res.data?.success) setReviews(res.data.data || []);
    } catch (err) {
      console.error('Reviews error:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, action, extra = {}) => {
    try {
      const res = await api.put(`/homeopathy/bookings/${bookingId}/status`, { action, ...extra });
      if (res.data?.success) {
        await fetchDashboardData(doctor.id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleStartWithOtp = async (bookingId) => {
    if (!otpInput || otpInput.length !== 4) {
      alert('Please enter the 4-digit OTP from patient');
      return;
    }
    try {
      const res = await api.put(`/homeopathy/bookings/${bookingId}/status`, { action: 'start' });
      if (res.data?.success) {
        setOtpInput('');
        await fetchDashboardData(doctor.id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleToggleStatus = async (status, mode) => {
    try {
      const res = await api.post('/homeopathy/doctor/toggle-availability-status', {
        doctorId: doctor.id,
        status,
        consultationMode: mode
      });
      if (res.data?.success) {
        setOnlineStatus(status);
        setConsultationMode(mode);
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleRespondToComplaint = async (bookingId, complaintId) => {
    if (!responseText.trim() || responseText.trim().length < 3) {
      alert('Response must be at least 3 characters');
      return;
    }
    try {
      const res = await api.put(
        `/homeopathy/bookings/${bookingId}/complaint/${complaintId}/doctor-respond`,
        { response: responseText }
      );
      if (res.data?.success) {
        setRespondingTo(null);
        setResponseText('');
        fetchComplaints();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to respond');
    }
  };

  const handleResolveComplaint = async (bookingId, complaintId) => {
    if (!window.confirm('Mark this complaint as resolved?')) return;
    try {
      const res = await api.put(
        `/homeopathy/bookings/${bookingId}/complaint/${complaintId}/doctor-resolve`,
        {}
      );
      if (res.data?.success) fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve');
    }
  };

  const handleRespondToReview = async (bookingId) => {
    if (!responseText.trim() || responseText.trim().length < 3) {
      alert('Response must be at least 3 characters');
      return;
    }
    try {
      const res = await api.put(
        `/homeopathy/bookings/${bookingId}/review/doctor-respond`,
        { response: responseText }
      );
      if (res.data?.success) {
        setRespondingTo(null);
        setResponseText('');
        fetchReviews();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to respond');
    }
  };

  const handleRequestSettlement = async () => {
    try {
      const res = await api.post('/homeopathy/settlements/request', {
        providerType: 'homeopathy_doctor',
        providerId: doctor.id
      });
      if (res.data?.success) {
        alert('Settlement requested successfully!');
        fetchDashboardData(doctor.id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request settlement');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('doctor');
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('providerType');
    navigate('/homeopathy/doctor/login', { replace: true });
  };

  const filteredBookings = useMemo(() => {
    if (filter === 'all') return bookings;
    return bookings.filter(b => b.status === filter);
  }, [bookings, filter]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayBookings = bookings.filter(b =>
      b.bookingDate && new Date(b.bookingDate).toDateString() === today
    );
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const pendingBookings = bookings.filter(b =>
      b.status === 'pending' && b.paymentStatus === 'paid'
    );
    const paidBookings = bookings.filter(b => b.paymentStatus === 'paid');
    const totalPaidAmount = paidBookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0);
    const pendingPayoutAmount = paidBookings
      .filter(b => b.commissionPayoutStatus === 'pending')
      .reduce((sum, b) => sum + (b.providerEarning || 0), 0);

    return {
      todayCount: todayBookings.length,
      completedCount: completedBookings.length,
      pendingCount: pendingBookings.length,
      totalEarnings: totalPaidAmount,
      pendingPayout: pendingPayoutAmount,
      averageRating: doctor?.rating || 0
    };
  }, [bookings, doctor]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {doctor?.name?.charAt(0) || 'D'}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{doctor?.name || 'Doctor'}</h1>
                <p className="text-green-100">{doctor?.specialization || 'Homeopathy Doctor'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleStatus('online', 'video')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  onlineStatus === 'online' ? 'bg-white text-green-700' : 'bg-white/20'
                }`}
              >
                🟢 Online
              </button>
              <button
                onClick={() => handleToggleStatus('in_clinic', 'clinic')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  onlineStatus === 'in_clinic' ? 'bg-white text-green-700' : 'bg-white/20'
                }`}
              >
                🏥 In Clinic
              </button>
              <button
                onClick={() => handleToggleStatus('offline', 'none')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  onlineStatus === 'offline' ? 'bg-white text-green-700' : 'bg-white/20'
                }`}
              >
                ⚫ Offline
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <FaStar className="text-yellow-400" /> {doctor?.rating || 'New'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: "Today's Bookings", value: stats.todayCount, icon: FaCalendarAlt, color: 'bg-blue-500' },
            { label: 'Completed', value: stats.completedCount, icon: FaCheckCircle, color: 'bg-green-500' },
            { label: 'Pending', value: stats.pendingCount, icon: FaClock, color: 'bg-yellow-500' },
            { label: 'Total Earnings', value: `₹${stats.totalEarnings}`, icon: FaRupeeSign, color: 'bg-purple-500' },
            { label: 'Pending Payout', value: `₹${stats.pendingPayout}`, icon: FaWallet, color: 'bg-orange-500' },
            { label: 'Rating', value: stats.averageRating || 'New', icon: FaStar, color: 'bg-pink-500' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-4">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white mb-2`}>
                <stat.icon />
              </div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-2 shadow overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: FaChartBar },
            { id: 'bookings', label: 'Bookings', icon: FaCalendarAlt },
            { id: 'availability', label: 'Availability', icon: FaClock },
            { id: 'complaints', label: 'Complaints', icon: FaExclamationTriangle },
            { id: 'reviews', label: 'Reviews', icon: FaStar },
            { id: 'earnings', label: 'Earnings', icon: FaWallet },
            { id: 'settlements', label: 'Settlements', icon: FaHistory },
            { id: 'corporate', label: 'Corporate Plans', icon: FaUsers }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-green-600 text-white' : 'hover:bg-gray-100'
              }`}
            >
              <tab.icon /> {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-md p-4">
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4">
                <p className="text-sm text-gray-500">Paid Bookings</p>
                <p className="text-2xl font-bold">
                  {bookings.filter(b => b.paymentStatus === 'paid').length}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4">
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {bookings.filter(b => b.paymentStatus === 'paid').length > 0
                    ? Math.round((bookings.filter(b => b.status === 'completed').length /
                        bookings.filter(b => b.paymentStatus === 'paid').length) * 100)
                    : 0}%
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
              {bookings.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No bookings yet</p>
              ) : (
                bookings.slice(0, 5).map(booking => (
                  <div key={booking.bookingId} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">{booking.patient?.name}</p>
                      <p className="text-sm text-gray-600">
                        {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : '—'} at {booking.slotTime || '—'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <h2 className="text-lg font-semibold">Bookings ({filteredBookings.length})</h2>
              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1 rounded-full text-sm capitalize ${
                      filter === status ? 'bg-green-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No bookings found</p>
              ) : (
                filteredBookings.map(booking => (
                  <div key={booking.bookingId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div>
                        <p className="font-semibold">{booking.patient?.name}</p>
                        <p className="text-sm text-gray-600">{booking.patient?.phone}</p>
                        <p className="text-sm text-gray-600">
                          {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : '—'} at {booking.slotTime || '—'}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">{booking.consultationType}</p>
                        <p className="text-sm">
                          {booking.otpVerified ? (
                            <span className="text-green-600">✅ OTP Verified</span>
                          ) : (
                            <span className="text-orange-500">⏳ OTP Pending</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          booking.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                        <p className="mt-2 font-bold text-green-600">₹{booking.finalAmount}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2 flex-wrap items-center">
                      {booking.status === 'pending' && booking.paymentStatus === 'paid' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking.bookingId, 'accept')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                          >
                            Accept Booking
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.bookingId, 'reject', { reason: 'Not available' })}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {booking.status === 'confirmed' && (
                        <>
                          <input
                            type="text"
                            placeholder="Enter patient OTP"
                            maxLength="4"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="px-2 py-1 border rounded text-sm w-36"
                          />
                          <button
                            onClick={() => handleStartWithOtp(booking.bookingId)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                          >
                            Verify OTP & Start
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.bookingId, 'no_show')}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                          >
                            No Show
                          </button>
                        </>
                      )}

                      {booking.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.bookingId, 'complete')}
                          className="px-3 py-1 bg-purple-600 text-white rounded text-sm"
                        >
                          Complete Consultation
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

	        {/* Availability */}
        {activeTab === 'availability' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Manage Availability</h2>

            <div className="space-y-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, dayIndex) => {
                const dayData = availability.find(a => a.day === day);
                const isActive = !!dayData;

                return (
                  <div key={day} className={`border rounded-lg p-4 ${isActive ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => {
                          if (isActive) {
                            setAvailability(prev => prev.filter(a => a.day !== day));
                          } else {
                            setAvailability(prev => [...prev, { day, slots: [] }]);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          isActive ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {day}
                      </button>
                      {isActive && (
                        <button
                          onClick={() => {
                            setAvailability(prev =>
                              prev.map(a =>
                                a.day === day
                                  ? { ...a, slots: [...a.slots, { startTime: '09:00 AM', endTime: '10:00 AM', maxBookings: 5, currentBookings: 0 }] }
                                  : a
                              )
                            );
                          }}
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          + Add Slot
                        </button>
                      )}
                    </div>

                    {isActive && dayData.slots.length > 0 && (
                      <div className="space-y-2">
                        {dayData.slots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="flex items-center gap-2 flex-wrap">
                            <select
                              value={slot.startTime || '09:00 AM'}
                              onChange={(e) => {
                                setAvailability(prev =>
                                  prev.map(a => {
                                    if (a.day !== day) return a;
                                    const slots = [...a.slots];
                                    slots[slotIndex] = { ...slots[slotIndex], startTime: e.target.value };
                                    return { ...a, slots };
                                  })
                                );
                              }}
                              className="p-2 border rounded text-sm"
                            >
                              {['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM'].map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <span className="text-sm">to</span>
                            <select
                              value={slot.endTime || '10:00 AM'}
                              onChange={(e) => {
                                setAvailability(prev =>
                                  prev.map(a => {
                                    if (a.day !== day) return a;
                                    const slots = [...a.slots];
                                    slots[slotIndex] = { ...slots[slotIndex], endTime: e.target.value };
                                    return { ...a, slots };
                                  })
                                );
                              }}
                              className="p-2 border rounded text-sm"
                            >
                              {['10:00 AM','11:00 AM','12:00 PM','01:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM','07:00 PM'].map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={slot.maxBookings || 1}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                setAvailability(prev =>
                                  prev.map(a => {
                                    if (a.day !== day) return a;
                                    const slots = [...a.slots];
                                    slots[slotIndex] = { ...slots[slotIndex], maxBookings: val };
                                    return { ...a, slots };
                                  })
                                );
                              }}
                              min="1"
                              max="20"
                              className="p-2 border rounded w-20 text-sm"
                            />
                            <button
                              onClick={() => {
                                setAvailability(prev =>
                                  prev.map(a =>
                                    a.day === day ? { ...a, slots: a.slots.filter((_, i) => i !== slotIndex) } : a
                                  )
                                );
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleSaveAvailability}
              disabled={savingAvailability}
              className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
            >
              {savingAvailability ? 'Saving...' : 'Save Availability'}
            </button>
          </div>
        )}


        {/* Complaints */}
        {activeTab === 'complaints' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Complaints ({complaints.length})</h2>
              <button onClick={fetchComplaints} className="text-green-600 text-sm font-medium">
                ↻ Refresh
              </button>
            </div>

            {complaintsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-3">Loading complaints...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-12">
                <FaExclamationTriangle className="text-5xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No complaints found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map(c => (
                  <div key={c.complaintId} className={`border rounded-lg p-4 ${
                    c.status === 'resolved' ? 'border-green-200 bg-green-50' :
                    c.status === 'rejected' ? 'border-red-200 bg-red-50' :
                    'border-yellow-200 bg-yellow-50'
                  }`}>
                    <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                      <div>
                        <p className="font-semibold">{c.patientName}</p>
                        <p className="text-sm text-gray-600">Booking: {c.bookingId}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          Type: {c.bookingType?.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          c.status === 'in_review' ? 'bg-blue-100 text-blue-700' :
                          c.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {c.status.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded p-3 mb-3">
                      <p className="text-xs text-gray-500 uppercase mb-1">{c.category?.replace(/_/g, ' ')}</p>
                      <p className="text-gray-800">{c.description}</p>
                      {c.priority && (
                        <p className="text-xs mt-2">
                          Priority:{' '}
                          <span className={`font-medium ${
                            c.priority === 'critical' ? 'text-red-600' :
                            c.priority === 'high' ? 'text-orange-600' : 'text-gray-600'
                          }`}>
                            {c.priority}
                          </span>
                        </p>
                      )}
                    </div>

                    {c.doctorResponse ? (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Your Response:</p>
                        <p className="text-sm text-gray-700">{c.doctorResponse}</p>
                      </div>
                    ) : (
                      <>
                        {respondingTo === c.complaintId ? (
                          <div className="mb-3">
                            <textarea
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              placeholder="Write your response to the patient..."
                              rows="3"
                              className="w-full p-2 border rounded-lg text-sm"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleRespondToComplaint(c.bookingId, c.complaintId)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
                              >
                                Submit Response
                              </button>
                              <button
                                onClick={() => { setRespondingTo(null); setResponseText(''); }}
                                className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setRespondingTo(c.complaintId); setResponseText(''); }}
                            className="text-green-600 text-sm font-medium"
                          >
                            + Respond
                          </button>
                        )}
                      </>
                    )}

                    {c.status !== 'resolved' && c.status !== 'rejected' && (
                      <div className="mt-3 pt-3 border-t flex justify-end">
                        <button
                          onClick={() => handleResolveComplaint(c.bookingId, c.complaintId)}
                          className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-medium"
                        >
                          ✓ Mark Resolved
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Reviews ({reviews.length})</h2>
              <button onClick={fetchReviews} className="text-green-600 text-sm font-medium">
                ↻ Refresh
              </button>
            </div>

            {reviewsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-3">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <FaStar className="text-5xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r, idx) => (
                  <div key={`${r.bookingId}_${idx}`} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                      <div>
                        <p className="font-semibold">{r.patientName}</p>
                        <p className="text-sm text-gray-600">Booking: {r.bookingId}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          {[1, 2, 3, 4, 5].map(i => (
                            <FaStar key={i} className={i <= r.rating ? 'text-yellow-400' : 'text-gray-300'} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {r.comment && (
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <p className="text-gray-700 italic">"{r.comment}"</p>
                      </div>
                    )}

                    {r.doctorResponse ? (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Your Response:</p>
                        <p className="text-sm text-gray-700">{r.doctorResponse}</p>
                      </div>
                    ) : (
                      <>
                        {respondingTo === `review_${r.bookingId}` ? (
                          <div>
                            <textarea
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              placeholder="Thank the patient or address their feedback..."
                              rows="2"
                              className="w-full p-2 border rounded-lg text-sm"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleRespondToReview(r.bookingId)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
                              >
                                Submit Response
                              </button>
                              <button
                                onClick={() => { setRespondingTo(null); setResponseText(''); }}
                                className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setRespondingTo(`review_${r.bookingId}`); setResponseText(''); }}
                            className="text-green-600 text-sm font-medium"
                          >
                            + Respond
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Earnings */}
        {activeTab === 'earnings' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Earnings Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">₹{earnings?.totalEarnings || 0}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Commission</p>
                <p className="text-2xl font-bold text-blue-600">₹{earnings?.totalCommission || 0}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Pending Payout</p>
                <p className="text-2xl font-bold text-orange-600">₹{earnings?.pendingPayout || 0}</p>
              </div>
            </div>
            <button
              onClick={handleRequestSettlement}
              disabled={!earnings || earnings.pendingPayout <= 0}
              className={`px-6 py-2 rounded-lg text-white font-medium ${
                earnings?.pendingPayout > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {earnings?.pendingPayout > 0 ? 'Request Settlement' : 'No Pending Payout'}
            </button>
          </div>
        )}

        {/* Settlements */}
        {activeTab === 'settlements' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Settlement History</h2>
            {settlements.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No settlements yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Payout ID</th>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">TDS</th>
                      <th className="text-left py-2">Net Amount</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements.map(s => (
                      <tr key={s._id || s.payoutId} className="border-b">
                        <td className="py-2 text-sm">{s.payoutId}</td>
                        <td className="py-2 text-sm">₹{s.amount}</td>
                        <td className="py-2 text-sm">₹{s.tdsDeducted || 0}</td>
                        <td className="py-2 font-semibold text-sm">₹{s.netAmount}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            s.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-2 text-sm">{new Date(s.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Corporate Plans */}
        {activeTab === 'corporate' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2">🏢 Corporate Plans</h2>
            <p className="text-gray-500 text-sm mb-4">
              Offer corporate homeopathy wellness packages to companies.
            </p>
            <CorporatePlansTab
              providerType="homeopathy"
              providerId={doctor.id}
              token={localStorage.getItem('doctorToken')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;