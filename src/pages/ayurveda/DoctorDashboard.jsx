import api from '../../services/api';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getDoctorBookings, 
  updateBookingStatus, 
  getProviderEarnings, 
  requestSettlement,
  getSettlementHistory 
} from '../../services/ayurvedaApi';
import {
  FaCalendarAlt, FaStar, FaRupeeSign, FaUsers,
  FaVideo, FaBuilding, FaHome, FaClock, FaCheckCircle,
  FaTimesCircle, FaChevronDown, FaChevronUp, FaWallet,
  FaHistory, FaChartBar, FaUserMd, FaPhone, FaEnvelope
} from 'react-icons/fa';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    medicines: [{ name: '', dosage: '', duration: '', instructions: '' }],
    dietAdvice: '',
    lifestyleAdvice: '',
    followUpDate: '',
    followUpRequired: false
  });
  const [availability, setAvailability] = useState([]);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [wellnessPrograms, setWellnessPrograms] = useState([]);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [programForm, setProgramForm] = useState({
    name: '',
    description: '',
    category: 'general_wellness',
    price: '',
    duration: '30 days',
    includes: [],
    isActive: true
  });
  const [onlineStatus, setOnlineStatus] = useState('offline');
  const [consultationMode, setConsultationMode] = useState('video');

  useEffect(() => {
    const doctorData = JSON.parse(localStorage.getItem('doctor') || '{}');
    const doctorId = doctorData.id || doctorData._id;
    if (!doctorId) {
      navigate('/ayurveda/doctor-login');
      return;
    }
    setDoctor({ ...doctorData, id: doctorId });
    fetchDashboardData(doctorId);
    fetchAvailability(doctorId);
    fetchWellnessPrograms(doctorId);
  }, [navigate]);

  const fetchDashboardData = async (doctorId) => {
    setLoading(true);
    try {
      const [bookingsRes, earningsRes, settlementsRes] = await Promise.all([
        getDoctorBookings(doctorId),
        getProviderEarnings('ayurveda_doctor', doctorId),
        getSettlementHistory('ayurveda_doctor', doctorId)
      ]);

      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data || []);
      }
      if (earningsRes.data.success) {
        setEarnings(earningsRes.data.data);
      }
      if (settlementsRes.data.success) {
        setSettlements(settlementsRes.data.data || []);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (doctorId) => {
    try {
      const response = await api.get(`/ayurveda/doctor/${doctorId || doctor.id}/availability`);
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
      const response = await api.put('/ayurveda/doctor/availability', {
        doctorId: doctor.id,
        availability: availability.filter(a => a && a.day)
      });
      if (response.data.success) {
        alert('Availability saved successfully!');
      }
    } catch (err) {
      alert('Failed to save availability');
    } finally {
      setSavingAvailability(false);
    }
  };

  const fetchWellnessPrograms = async (doctorId) => {
    try {
      const response = await api.get(`/ayurveda/doctor/${doctorId || doctor.id}/wellness-programs`);
      if (response.data.success) {
        setWellnessPrograms(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load programs:', err.message);
    }
  };

  const handleSaveProgram = async () => {
    try {
      const response = await api.post('/ayurveda/doctor/wellness-program', {
        doctorId: doctor.id,
        program: {
          ...programForm,
          price: parseInt(programForm.price)
        }
      });
      if (response.data.success) {
        alert('Program added successfully!');
        setShowProgramModal(false);
        setProgramForm({
          name: '',
          description: '',
          category: 'general_wellness',
          price: '',
          duration: '30 days',
          includes: [],
          isActive: true
        });
        fetchWellnessPrograms(doctor.id);
      }
    } catch (err) {
      alert('Failed to save program');
    }
  };

  const handleToggleStatus = async (status, mode) => {
    try {
      const response = await api.post('/ayurveda/doctor/toggle-availability-status', {
        doctorId: doctor.id,
        status,
        consultationMode: mode
      });
      if (response.data.success) {
        setOnlineStatus(status);
        setConsultationMode(mode);
        alert(`Status updated: ${status.replace('_', ' ')}`);
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleStatusUpdate = async (bookingId, action) => {
    try {
      const response = await updateBookingStatus(bookingId, action);
      if (response.data.success) {
        fetchDashboardData(doctor.id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCompleteConsultation = async (bookingId) => {
    try {
      const response = await updateBookingStatus(bookingId, 'complete', prescriptionData);
      if (response.data.success) {
        setShowPrescriptionModal(false);
        setPrescriptionData({
          diagnosis: '',
          medicines: [{ name: '', dosage: '', duration: '', instructions: '' }],
          dietAdvice: '',
          lifestyleAdvice: '',
          followUpDate: '',
          followUpRequired: false
        });
        fetchDashboardData(doctor.id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete consultation');
    }
  };

  const handleRequestSettlement = async () => {
    try {
      const response = await requestSettlement('ayurveda_doctor', doctor.id);
      if (response.data.success) {
        alert('Settlement requested successfully!');
        fetchDashboardData(doctor.id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request settlement');
    }
  };

  const filteredBookings = useMemo(() => {
    if (filter === 'all') return bookings;
    return bookings.filter(b => b.status === filter);
  }, [bookings, filter]);

    const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayBookings = bookings.filter(b => 
      new Date(b.bookingDate).toDateString() === today
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
  }, [bookings, earnings, doctor]);

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
                <p className="text-green-100">{doctor?.specialization || 'Ayurveda Doctor'}</p>
              </div>
            </div>
            {/* Online/Offline Toggle */}
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
                onClick={() => {
                  localStorage.removeItem('doctor');
                  localStorage.removeItem('token');
                  navigate('/ayurveda/doctor-login');
                }}
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
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-2 shadow overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: FaChartBar },
            { id: 'bookings', label: 'Bookings', icon: FaCalendarAlt },
            { id: 'availability', label: 'Availability', icon: FaClock },
            { id: 'programs', label: 'Programs', icon: FaChartBar },
            { id: 'earnings', label: 'Earnings', icon: FaWallet },
            { id: 'settlements', label: 'Settlements', icon: FaHistory }
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

        {/* Overview Tab */}
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
                    ? Math.round((bookings.filter(b => b.status === 'completed').length / bookings.filter(b => b.paymentStatus === 'paid').length) * 100) 
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
                        {new Date(booking.bookingDate).toLocaleDateString()} at {booking.slotTime}
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

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Bookings ({filteredBookings.length})</h2>
              <div className="flex gap-2">
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
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{booking.patient?.name}</p>
                        <p className="text-sm text-gray-600">{booking.patient?.phone}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.bookingDate).toLocaleDateString()} at {booking.slotTime}
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

                    <div className="mt-3 flex gap-2">
                        {booking.status === 'pending' && booking.otpVerified && (
                        <button
                          onClick={() => handleStatusUpdate(booking.bookingId, 'accept')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                        >
                          Accept
                        </button>
                      )}
                      {booking.status === 'pending' && !booking.otpVerified && (
                        <span className="text-xs text-orange-500">
                          Waiting for patient OTP verification
                        </span>
                      )}
                          <a
                            href={`https://meet.google.com/${booking.bookingId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                          >
                            📹 Join Video
                          </a>
                      {booking.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking.bookingId, 'start')}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                          >
                            Start Consultation
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.bookingId, 'no_show')}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                          >
                            No Show
                          </button>
                        </>
                      )}
                      {booking.status === 'completed' && booking.prescription?.followUpDate && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          📅 Follow-up: {new Date(booking.prescription.followUpDate).toLocaleDateString()}
                        </div>
                      )}
                      {booking.status === 'in_progress' && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowPrescriptionModal(true);
                          }}
                          className="px-3 py-1 bg-purple-600 text-white rounded text-sm"
                        >
                          Complete & Prescribe
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Manage Availability</h2>
            
            <div className="space-y-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, dayIndex) => {
                const dayData = availability[dayIndex];
                const isActive = dayData && dayData.day === day;
                
                return (
                  <div key={day} className={`border rounded-lg p-4 ${isActive ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => {
                          const updated = [...availability];
                          if (updated[dayIndex]) {
                            updated.splice(dayIndex, 1);
                          } else {
                            updated[dayIndex] = { day, slots: [] };
                          }
                          setAvailability(updated);
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
                            const updated = [...availability];
                            updated[dayIndex].slots.push({
                              startTime: '09:00 AM',
                              endTime: '10:00 AM',
                              maxBookings: 5,
                              currentBookings: 0
                            });
                            setAvailability(updated);
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
                          <div key={slotIndex} className="flex items-center gap-2">
                            <select
                              value={slot.startTime || '09:00 AM'}
                              onChange={(e) => {
                                const updated = [...availability];
                                updated[dayIndex].slots[slotIndex].startTime = e.target.value;
                                setAvailability(updated);
                              }}
                              className="p-2 border rounded text-sm"
                            >
                              {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'].map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <span className="text-sm">to</span>
                            <select
                              value={slot.endTime || '10:00 AM'}
                              onChange={(e) => {
                                const updated = [...availability];
                                updated[dayIndex].slots[slotIndex].endTime = e.target.value;
                                setAvailability(updated);
                              }}
                              className="p-2 border rounded text-sm"
                            >
                              {['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'].map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={slot.maxBookings || 1}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                const updated = [...availability];
                                updated[dayIndex].slots[slotIndex].maxBookings = val;
                                setAvailability(updated);
                              }}
                              min="1"
                              max="20"
                              className="p-2 border rounded w-20 text-sm"
                            />
                            <button
                              onClick={() => {
                                const updated = [...availability];
                                updated[dayIndex].slots.splice(slotIndex, 1);
                                setAvailability(updated);
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

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Wellness Programs ({wellnessPrograms.length})</h2>
              <button
                onClick={() => setShowProgramModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                + Add Program
              </button>
            </div>

            {wellnessPrograms.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No programs yet. Create your first wellness program to attract more patients.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wellnessPrograms.map((program, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{program.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        program.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {program.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{program.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">{program.category?.replace(/_/g, ' ')}</span>
                      <span className="text-gray-500">{program.duration}</span>
                    </div>
                    <div className="mt-3 flex justify-between items-center border-t pt-3">
                      <p className="font-bold text-green-600">₹{program.price}</p>
                      <p className="text-xs text-gray-500">
                        {program.totalBookings || 0} bookings
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Earnings Overview</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
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
              disabled={!earnings?.pendingPayout}
              className="bg-green-600 text-white px-6 py-2 rounded-lg disabled:bg-gray-400"
            >
              Request Settlement
            </button>
          </div>
        )}

        {/* Settlements Tab */}
        {activeTab === 'settlements' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Settlement History</h2>
            {settlements.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No settlements yet</p>
            ) : (
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
                    <tr key={s.payoutId} className="border-b">
                      <td className="py-2">{s.payoutId}</td>
                      <td className="py-2">₹{s.amount}</td>
                      <td className="py-2">₹{s.tdsDeducted || 0}</td>
                      <td className="py-2 font-semibold">₹{s.netAmount}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          s.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-2">{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Program Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add Wellness Program</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Program Name *</label>
                  <input
                    type="text"
                    value={programForm.name}
                    onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                    placeholder="e.g., 30-Day Digestive Wellness"
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={programForm.description}
                    onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                    rows="3"
                    placeholder="Describe your program..."
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={programForm.category}
                      onChange={(e) => setProgramForm({ ...programForm, category: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="digestive_wellness">Digestive Wellness</option>
                      <option value="stress_sleep">Stress & Sleep</option>
                      <option value="joint_mobility">Joint & Mobility</option>
                      <option value="skin_hair">Skin & Hair</option>
                      <option value="womens_wellness">Women's Wellness</option>
                      <option value="weight_management">Weight Management</option>
                      <option value="general_wellness">General Wellness</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration</label>
                    <select
                      value={programForm.duration}
                      onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="15 days">15 Days</option>
                      <option value="30 days">30 Days</option>
                      <option value="45 days">45 Days</option>
                      <option value="60 days">60 Days</option>
                      <option value="90 days">90 Days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={programForm.price}
                    onChange={(e) => setProgramForm({ ...programForm, price: e.target.value })}
                    placeholder="e.g., 5000"
                    min="500"
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">What's Included (comma separated)</label>
                  <input
                    type="text"
                    value={programForm.includes?.join(', ')}
                    onChange={(e) => setProgramForm({ 
                      ...programForm, 
                      includes: e.target.value.split(',').map(i => i.trim()) 
                    })}
                    placeholder="2 consultations, diet plan, follow-ups"
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProgram}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                  >
                    Save Program
                  </button>
                  <button
                    onClick={() => setShowProgramModal(false)}
                    className="flex-1 bg-gray-300 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Complete Consultation & Write Prescription</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Diagnosis</label>
                  <input
                    type="text"
                    value={prescriptionData.diagnosis}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="e.g., Vata imbalance causing joint pain"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Medicines</label>
                  {prescriptionData.medicines.map((med, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Medicine name"
                        value={med.name}
                        onChange={(e) => {
                          const medicines = [...prescriptionData.medicines];
                          medicines[index].name = e.target.value;
                          setPrescriptionData({ ...prescriptionData, medicines });
                        }}
                        className="p-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={(e) => {
                          const medicines = [...prescriptionData.medicines];
                          medicines[index].dosage = e.target.value;
                          setPrescriptionData({ ...prescriptionData, medicines });
                        }}
                        className="p-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) => {
                          const medicines = [...prescriptionData.medicines];
                          medicines[index].duration = e.target.value;
                          setPrescriptionData({ ...prescriptionData, medicines });
                        }}
                        className="p-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Instructions"
                        value={med.instructions}
                        onChange={(e) => {
                          const medicines = [...prescriptionData.medicines];
                          medicines[index].instructions = e.target.value;
                          setPrescriptionData({ ...prescriptionData, medicines });
                        }}
                        className="p-2 border rounded"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPrescriptionData({
                      ...prescriptionData,
                      medicines: [...prescriptionData.medicines, { name: '', dosage: '', duration: '', instructions: '' }]
                    })}
                    className="text-green-600 text-sm mt-1"
                  >
                    + Add Medicine
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Diet Advice</label>
                  <textarea
                    value={prescriptionData.dietAdvice}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, dietAdvice: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Lifestyle Advice</label>
                  <textarea
                    value={prescriptionData.lifestyleAdvice}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, lifestyleAdvice: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={prescriptionData.followUpDate}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, followUpDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Follow-up Required</label>
                  <select
                    value={prescriptionData.followUpRequired}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, followUpRequired: e.target.value === 'true' })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="false">No follow-up needed</option>
                    <option value="true">Follow-up required</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleCompleteConsultation(selectedBooking.bookingId)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                  >
                    Complete & Save Prescription
                  </button>
                  <button
                    onClick={() => setShowPrescriptionModal(false)}
                    className="flex-1 bg-gray-300 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;