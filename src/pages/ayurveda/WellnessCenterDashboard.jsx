import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  getCenterBookings,
  updateBookingStatus,
  getProviderEarnings,
  requestSettlement,
  getSettlementHistory,
  getPanchakarmaCenterById
} from '../../services/ayurvedaApi';
import {
  FaCalendarAlt, FaStar, FaRupeeSign,
  FaBuilding, FaClock, FaCheckCircle,
  FaWallet, FaHistory, FaChartBar, FaBed, FaBox,
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaShieldAlt,
  FaSpa, FaUserMd, FaCheck, FaAward
} from 'react-icons/fa';

const TABS = [
  { id: 'overview', label: 'Overview', icon: FaChartBar },
  { id: 'bookings', label: 'Bookings', icon: FaCalendarAlt },
  { id: 'packages', label: 'Packages', icon: FaBox },
  { id: 'rooms', label: 'Rooms', icon: FaBed },
  { id: 'policies', label: 'Policies', icon: FaShieldAlt },
  { id: 'profile', label: 'Profile', icon: FaBuilding },
  { id: 'earnings', label: 'Earnings', icon: FaWallet },
  { id: 'settlements', label: 'Settlements', icon: FaHistory }
];

const WellnessCenterDashboard = () => {
  const navigate = useNavigate();
  const [center, setCenter] = useState(null);
  const [fullCenter, setFullCenter] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [packages, setPackages] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Package modal
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageForm, setPackageForm] = useState({
    name: '', duration: '', price: '', discountPrice: '',
    description: '', shortDescription: '', therapies: [],
    inclusions: [], exclusions: [], maxCapacity: 10, isActive: true
  });

  // Room modal
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({
    name: '', type: 'Standard', pricePerNight: '', capacity: 1,
    totalRooms: 1, amenities: [], description: ''
  });

  // Policies form
  const [policiesForm, setPoliciesForm] = useState({
    freeUntilDays: 7, partialRefundUntilDays: 3, partialRefundPercent: 50,
    noRefundAfterDays: 2, depositRequired: false, depositPercent: 25,
    checkInTime: '14:00', checkOutTime: '11:00',
    companionPolicy: '', medicalEligibility: [], ageRestrictions: ''
  });

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '', tagline: '', description: '', established: '',
    facilities: [], photos: [], coverPhoto: '',
    bedCount: '', panchakarmaRooms: '', doctorCount: '', staffCount: '',
    nearestAirport: '', nearestRailway: '',
    distanceFromAirport: '', distanceFromRailway: '',
    googleMapsUrl: '',
    contact: { primaryPhone: '', secondaryPhone: '', whatsapp: '', email: '', website: '' },
    dietaryAccommodations: []
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const centerData = JSON.parse(localStorage.getItem('center') || '{}');
    if (!centerData.id) {
      navigate('/ayurveda/wellness-center-login');
      return;
    }
    setCenter(centerData);
    fetchDashboardData(centerData.id);
  }, [navigate]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getToken = () => localStorage.getItem('token') || '';

  const fetchDashboardData = async (centerId) => {
    setLoading(true);
    try {
      const [bookingsRes, earningsRes, settlementsRes, centerRes] = await Promise.all([
        getCenterBookings(centerId).catch(() => ({ data: { success: false } })),
        getProviderEarnings('wellness_center', centerId).catch(() => ({ data: { success: false } })),
        getSettlementHistory('wellness_center', centerId).catch(() => ({ data: { success: false } })),
        api.get(`/ayurveda/centers/${centerId}`).catch(() => ({ data: { success: false } }))
      ]);

      if (bookingsRes.data.success) setBookings(bookingsRes.data.data || []);
      if (earningsRes.data.success) setEarnings(earningsRes.data.data);
      if (settlementsRes.data.success) setSettlements(settlementsRes.data.data || []);

      if (centerRes.data.success) {
        const c = centerRes.data.data;
        setFullCenter(c);
        setPackages(c.packages || []);
        setRoomTypes(c.roomTypes || []);

        // Fill profile form
        setProfileForm({
          name: c.name || '',
          tagline: c.tagline || '',
          description: c.description || '',
          established: c.established || '',
          facilities: c.facilities || [],
          photos: c.photos || [],
          coverPhoto: c.coverPhoto || '',
          bedCount: c.bedCount || '',
          panchakarmaRooms: c.panchakarmaRooms || '',
          doctorCount: c.doctorCount || '',
          staffCount: c.staffCount || '',
          nearestAirport: c.nearestAirport || '',
          nearestRailway: c.nearestRailway || '',
          distanceFromAirport: c.distanceFromAirport || '',
          distanceFromRailway: c.distanceFromRailway || '',
          googleMapsUrl: c.googleMapsUrl || '',
          contact: {
            primaryPhone: c.contact?.primaryPhone || c.phone || '',
            secondaryPhone: c.contact?.secondaryPhone || '',
            whatsapp: c.contact?.whatsapp || c.phone || '',
            email: c.contact?.email || c.email || '',
            website: c.contact?.website || ''
          },
          dietaryAccommodations: c.dietaryAccommodations || []
        });

        // Fill policies form
        if (c.policies) {
          setPoliciesForm({
            freeUntilDays: c.policies.cancellation?.freeUntilDays || 7,
            partialRefundUntilDays: c.policies.cancellation?.partialRefundUntilDays || 3,
            partialRefundPercent: c.policies.cancellation?.partialRefundPercent || 50,
            noRefundAfterDays: c.policies.cancellation?.noRefundAfterDays || 2,
            depositRequired: c.policies.deposit?.required || false,
            depositPercent: c.policies.deposit?.percent || 25,
            checkInTime: c.policies.checkInTime || '14:00',
            checkOutTime: c.policies.checkOutTime || '11:00',
            companionPolicy: c.policies.companionPolicy || '',
            medicalEligibility: c.policies.medicalEligibility || [],
            ageRestrictions: c.policies.ageRestrictions || ''
          });
        }
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // PACKAGE CRUD
  // ============================================
  const openPackageModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setPackageForm({
        name: pkg.name || '',
        duration: pkg.duration || '',
        price: pkg.price || '',
        discountPrice: pkg.discountPrice || '',
        description: pkg.description || '',
        shortDescription: pkg.shortDescription || '',
        therapies: pkg.therapies || [],
        inclusions: pkg.inclusions || [],
        exclusions: pkg.exclusions || [],
        maxCapacity: pkg.maxCapacity || 10,
        isActive: pkg.isActive !== false
      });
    } else {
      setEditingPackage(null);
      setPackageForm({
        name: '', duration: '', price: '', discountPrice: '',
        description: '', shortDescription: '', therapies: [],
        inclusions: [], exclusions: [], maxCapacity: 10, isActive: true
      });
    }
    setShowPackageModal(true);
  };

  const handleSavePackage = async () => {
    if (!packageForm.name || !packageForm.duration || !packageForm.price) {
      showToast('Name, duration, and price are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: packageForm.name,
        duration: parseInt(packageForm.duration),
        price: parseInt(packageForm.price),
        discountPrice: packageForm.discountPrice ? parseInt(packageForm.discountPrice) : undefined,
        description: packageForm.description,
        shortDescription: packageForm.shortDescription,
        therapies: packageForm.therapies,
        inclusions: packageForm.inclusions,
        exclusions: packageForm.exclusions,
        maxCapacity: parseInt(packageForm.maxCapacity) || 10,
        isActive: packageForm.isActive
      };

      let response;
      if (editingPackage) {
        response = await api.put(
          `/ayurveda-centers/packages/${center.id}/${editingPackage._id}`,
          payload,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
      } else {
        response = await api.post(
          `/ayurveda-centers/packages/${center.id}`,
          payload,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
      }

      if (response.data.success) {
        showToast(editingPackage ? 'Package updated' : 'Package added');
        setShowPackageModal(false);
        fetchDashboardData(center.id);
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save package', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePackage = async (pkgId) => {
    if (!window.confirm('Delete this package?')) return;
    try {
      await api.delete(`/ayurveda-centers/packages/${center.id}/${pkgId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      showToast('Package deleted');
      fetchDashboardData(center.id);
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  // ============================================
  // ROOM CRUD
  // ============================================
  const handleSaveRoom = async () => {
    if (!roomForm.name || !roomForm.pricePerNight) {
      showToast('Name and price required', 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post(
        `/ayurveda-centers/${center.id}/rooms`,
        roomForm,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (response.data.success) {
        showToast('Room added');
        setShowRoomModal(false);
        setRoomForm({
          name: '', type: 'Standard', pricePerNight: '', capacity: 1,
          totalRooms: 1, amenities: [], description: ''
        });
        fetchDashboardData(center.id);
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add room', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room type?')) return;
    try {
      await api.delete(`/ayurveda-centers/${center.id}/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      showToast('Room deleted');
      fetchDashboardData(center.id);
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  // ============================================
  // PROFILE SAVE
  // ============================================
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await api.put(
        `/ayurveda-centers/${center.id}/profile`,
        profileForm,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (response.data.success) {
        showToast('Profile updated');
        fetchDashboardData(center.id);
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // POLICIES SAVE
  // ============================================
  const handleSavePolicies = async () => {
    setSaving(true);
    try {
      const payload = {
        cancellation: {
          freeUntilDays: parseInt(policiesForm.freeUntilDays),
          partialRefundUntilDays: parseInt(policiesForm.partialRefundUntilDays),
          partialRefundPercent: parseInt(policiesForm.partialRefundPercent),
          noRefundAfterDays: parseInt(policiesForm.noRefundAfterDays)
        },
        deposit: {
          required: policiesForm.depositRequired,
          percent: parseInt(policiesForm.depositPercent)
        },
        checkInTime: policiesForm.checkInTime,
        checkOutTime: policiesForm.checkOutTime,
        companionPolicy: policiesForm.companionPolicy,
        medicalEligibility: policiesForm.medicalEligibility,
        ageRestrictions: policiesForm.ageRestrictions
      };

      const response = await api.put(
        `/ayurveda-centers/${center.id}/policies`,
        payload,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (response.data.success) {
        showToast('Policies updated');
        fetchDashboardData(center.id);
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save policies', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // BOOKING STATUS
  // ============================================
  const handleStatusUpdate = async (bookingId, action) => {
    try {
      if (action === 'reject') {
        if (!window.confirm('Reject booking? Patient will be refunded.')) return;
      }
      const response = await updateBookingStatus(bookingId, action);
      if (response.data.success) {
        showToast(`Booking ${action}ed`);
        fetchDashboardData(center.id);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update', 'error');
    }
  };

  const handleRequestSettlement = async () => {
    try {
      const response = await requestSettlement('wellness_center', center.id);
      if (response.data.success) {
        showToast('Settlement requested');
        fetchDashboardData(center.id);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to request', 'error');
    }
  };

  // ============================================
  // COMPUTED
  // ============================================
  const filteredBookings = useMemo(() => {
    if (filter === 'all') return bookings;
    return bookings.filter(b => b.status === filter);
  }, [bookings, filter]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayBookings = bookings.filter(b => new Date(b.bookingDate).toDateString() === today);
    const activeBookings = bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status));
    const completedBookings = bookings.filter(b => b.status === 'completed');
    return {
      todayCount: todayBookings.length,
      activeCount: activeBookings.length,
      completedCount: completedBookings.length,
      totalEarnings: earnings?.totalEarnings || 0,
      pendingPayout: earnings?.pendingPayout || 0,
      packageCount: packages.length,
      roomCount: roomTypes.length,
      averageRating: fullCenter?.rating || 0
    };
  }, [bookings, earnings, packages, roomTypes, fullCenter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-600'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                <FaBuilding />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{center?.name || 'Wellness Center'}</h1>
                <p className="text-green-100">{center?.type || 'Panchakarma Center'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {fullCenter?.verificationStatus === 'approved' && (
                <span className="flex items-center gap-1 bg-green-500 px-3 py-1 rounded-full text-sm">
                  <FaShieldAlt /> Verified
                </span>
              )}
              <button
                onClick={() => {
                  localStorage.removeItem('center');
                  localStorage.removeItem('token');
                  navigate('/ayurveda/wellness-center-login');
                }}
                className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: "Today", value: stats.todayCount, icon: FaCalendarAlt, color: 'bg-blue-500' },
            { label: 'Active', value: stats.activeCount, icon: FaClock, color: 'bg-yellow-500' },
            { label: 'Completed', value: stats.completedCount, icon: FaCheckCircle, color: 'bg-green-500' },
            { label: 'Packages', value: stats.packageCount, icon: FaBox, color: 'bg-purple-500' },
            { label: 'Rooms', value: stats.roomCount, icon: FaBed, color: 'bg-pink-500' },
            { label: 'Earnings', value: `₹${stats.totalEarnings}`, icon: FaRupeeSign, color: 'bg-indigo-500' },
            { label: 'Payout', value: `₹${stats.pendingPayout}`, icon: FaWallet, color: 'bg-orange-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-4">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white mb-2`}>
                <stat.icon />
              </div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-lg font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-2 shadow overflow-x-auto">
          {TABS.map(tab => (
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

        {/* ========== OVERVIEW ========== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => openPackageModal()}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg"
              >
                <FaPlus className="text-3xl text-blue-600 mx-auto mb-2" />
                <p className="font-semibold">Add Package</p>
              </button>
              <button
                onClick={() => setShowRoomModal(true)}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg"
              >
                <FaBed className="text-3xl text-purple-600 mx-auto mb-2" />
                <p className="font-semibold">Add Room</p>
              </button>
              <button
                onClick={() => setActiveTab('policies')}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg"
              >
                <FaShieldAlt className="text-3xl text-green-600 mx-auto mb-2" />
                <p className="font-semibold">Policies</p>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg"
              >
                <FaBuilding className="text-3xl text-orange-600 mx-auto mb-2" />
                <p className="font-semibold">Edit Profile</p>
              </button>
            </div>

            {/* Completion checklist */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Setup Checklist</h2>
              <div className="space-y-3">
                {[
                  { label: 'Profile complete (description, contact)', done: !!profileForm.description && !!profileForm.contact?.primaryPhone },
                  { label: 'At least 1 package', done: packages.length > 0 },
                  { label: 'At least 1 room type', done: roomTypes.length > 0 },
                  { label: 'Policies configured', done: !!policiesForm.checkInTime },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.done ? (
                      <FaCheckCircle className="text-green-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className={item.done ? 'text-gray-500 line-through' : 'text-gray-800'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
              {bookings.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No bookings yet</p>
              ) : (
                bookings.slice(0, 5).map(booking => (
                  <div key={booking.bookingId} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">{booking.patient?.name}</p>
                      <p className="text-sm text-gray-600">{booking.package?.name || 'Consultation'}</p>
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

        {/* ========== BOOKINGS ========== */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <h2 className="text-lg font-semibold">Bookings ({filteredBookings.length})</h2>
              <div className="flex gap-2 overflow-x-auto">
                {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1 rounded-full text-sm capitalize whitespace-nowrap ${
                      filter === status ? 'bg-green-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No bookings</p>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map(booking => (
                  <div key={booking.bookingId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-semibold">{booking.patient?.name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {booking.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">📞 {booking.patient?.phone}</p>
                        <p className="text-sm text-gray-600">📅 {new Date(booking.bookingDate).toLocaleDateString()}</p>
                        {booking.package && (
                          <p className="text-sm text-gray-600">📦 {booking.package.name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{booking.finalAmount}</p>
                        <p className="text-xs text-gray-500">Your Earning: ₹{booking.providerEarning}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2 border-t pt-3 flex-wrap">
                      {booking.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatusUpdate(booking.bookingId, 'accept')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Accept</button>
                          <button onClick={() => handleStatusUpdate(booking.bookingId, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Reject</button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button onClick={() => handleStatusUpdate(booking.bookingId, 'start')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Start Treatment</button>
                      )}
                      {booking.status === 'in_progress' && (
                        <button onClick={() => handleStatusUpdate(booking.bookingId, 'complete')}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">Complete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== PACKAGES ========== */}
        {activeTab === 'packages' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Packages ({packages.length})</h2>
              <button onClick={() => openPackageModal()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <FaPlus /> Add Package
              </button>
            </div>

            {packages.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No packages. Click "Add Package" to start.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {packages.map(pkg => (
                  <div key={pkg._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{pkg.name}</h3>
                      <div className="flex gap-2">
                        <button onClick={() => openPackageModal(pkg)} className="text-blue-600 p-1">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDeletePackage(pkg._id)} className="text-red-600 p-1">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{pkg.duration} days · Max {pkg.maxCapacity}</p>
                    {pkg.therapies?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {pkg.therapies.slice(0, 4).map((t, i) => (
                          <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-end border-t pt-2">
                      <div>
                        <p className="font-bold text-green-600">₹{pkg.discountPrice || pkg.price}</p>
                        {pkg.discountPrice && <p className="text-xs text-gray-400 line-through">₹{pkg.price}</p>}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        pkg.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {pkg.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== ROOMS ========== */}
        {activeTab === 'rooms' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Room Types ({roomTypes.length})</h2>
              <button onClick={() => setShowRoomModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <FaPlus /> Add Room
              </button>
            </div>

            {roomTypes.length === 0 ? (
              <div className="text-center py-12">
                <FaBed className="text-5xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No rooms added yet</p>
                <p className="text-sm text-gray-400 mt-1">Add room types so patients can select accommodation</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomTypes.map(room => (
                  <div key={room._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{room.name}</h3>
                      <button onClick={() => handleDeleteRoom(room._id)} className="text-red-600 p-1">
                        <FaTrash />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{room.type} · Capacity {room.capacity}</p>
                    <p className="text-lg font-bold text-green-600">₹{room.pricePerNight}<span className="text-xs text-gray-500">/night</span></p>
                    {room.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {room.amenities.slice(0, 3).map((a, i) => (
                          <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== POLICIES ========== */}
        {activeTab === 'policies' && (
          <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl">
            <h2 className="text-lg font-semibold mb-6">Cancellation & Booking Policies</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Cancellation Policy</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Free cancellation (days before)</label>
                    <input type="number" value={policiesForm.freeUntilDays}
                      onChange={e => setPoliciesForm({...policiesForm, freeUntilDays: e.target.value})}
                      className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Partial refund (days before)</label>
                    <input type="number" value={policiesForm.partialRefundUntilDays}
                      onChange={e => setPoliciesForm({...policiesForm, partialRefundUntilDays: e.target.value})}
                      className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Partial refund percent</label>
                    <input type="number" value={policiesForm.partialRefundPercent}
                      onChange={e => setPoliciesForm({...policiesForm, partialRefundPercent: e.target.value})}
                      className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">No refund (within days)</label>
                    <input type="number" value={policiesForm.noRefundAfterDays}
                      onChange={e => setPoliciesForm({...policiesForm, noRefundAfterDays: e.target.value})}
                      className="w-full p-2 border rounded" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Check-in / Check-out</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Check-in time</label>
                    <input type="time" value={policiesForm.checkInTime}
                      onChange={e => setPoliciesForm({...policiesForm, checkInTime: e.target.value})}
                      className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Check-out time</label>
                    <input type="time" value={policiesForm.checkOutTime}
                      onChange={e => setPoliciesForm({...policiesForm, checkOutTime: e.target.value})}
                      className="w-full p-2 border rounded" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Companion Policy</label>
                <textarea value={policiesForm.companionPolicy}
                  onChange={e => setPoliciesForm({...policiesForm, companionPolicy: e.target.value})}
                  rows="2" placeholder="e.g., One companion allowed per patient"
                  className="w-full p-2 border rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age Restrictions</label>
                <input type="text" value={policiesForm.ageRestrictions}
                  onChange={e => setPoliciesForm({...policiesForm, ageRestrictions: e.target.value})}
                  placeholder="e.g., Minimum age 18 years"
                  className="w-full p-2 border rounded" />
              </div>

              <button onClick={handleSavePolicies} disabled={saving}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2">
                <FaSave /> {saving ? 'Saving...' : 'Save Policies'}
              </button>
            </div>
          </div>
        )}

        {/* ========== PROFILE ========== */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl">
            <h2 className="text-lg font-semibold mb-6">Center Profile</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Center Name *</label>
                  <input type="text" value={profileForm.name}
                    onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Established Year</label>
                  <input type="number" value={profileForm.established}
                    onChange={e => setProfileForm({...profileForm, established: e.target.value})}
                    className="w-full p-2 border rounded" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tagline</label>
                <input type="text" value={profileForm.tagline}
                  onChange={e => setProfileForm({...profileForm, tagline: e.target.value})}
                  placeholder="e.g., Authentic Kerala Panchakarma since 1995"
                  className="w-full p-2 border rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={profileForm.description}
                  onChange={e => setProfileForm({...profileForm, description: e.target.value})}
                  rows="5" maxLength="2000"
                  className="w-full p-2 border rounded" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cover Photo URL</label>
                  <input type="url" value={profileForm.coverPhoto}
                    onChange={e => setProfileForm({...profileForm, coverPhoto: e.target.value})}
                    placeholder="https://..."
                    className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Google Maps URL</label>
                  <input type="url" value={profileForm.googleMapsUrl}
                    onChange={e => setProfileForm({...profileForm, googleMapsUrl: e.target.value})}
                    className="w-full p-2 border rounded" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input type="tel" placeholder="Primary Phone" value={profileForm.contact.primaryPhone}
                    onChange={e => setProfileForm({...profileForm, contact: {...profileForm.contact, primaryPhone: e.target.value}})}
                    className="p-2 border rounded" />
                  <input type="tel" placeholder="WhatsApp" value={profileForm.contact.whatsapp}
                    onChange={e => setProfileForm({...profileForm, contact: {...profileForm.contact, whatsapp: e.target.value}})}
                    className="p-2 border rounded" />
                  <input type="email" placeholder="Email" value={profileForm.contact.email}
                    onChange={e => setProfileForm({...profileForm, contact: {...profileForm.contact, email: e.target.value}})}
                    className="p-2 border rounded" />
                  <input type="url" placeholder="Website" value={profileForm.contact.website}
                    onChange={e => setProfileForm({...profileForm, contact: {...profileForm.contact, website: e.target.value}})}
                    className="p-2 border rounded" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Facilities</h3>
                <input type="text" value={profileForm.facilities.join(', ')}
                  onChange={e => setProfileForm({...profileForm, facilities: e.target.value.split(',').map(f => f.trim()).filter(Boolean)})}
                  placeholder="AC Rooms, Yoga Hall, Organic Food (comma separated)"
                  className="w-full p-2 border rounded" />
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Capacity & Staff</h3>
                <div className="grid grid-cols-4 gap-4">
                  <input type="number" placeholder="Beds" value={profileForm.bedCount}
                    onChange={e => setProfileForm({...profileForm, bedCount: e.target.value})}
                    className="p-2 border rounded" />
                  <input type="number" placeholder="Therapy Rooms" value={profileForm.panchakarmaRooms}
                    onChange={e => setProfileForm({...profileForm, panchakarmaRooms: e.target.value})}
                    className="p-2 border rounded" />
                  <input type="number" placeholder="Doctors" value={profileForm.doctorCount}
                    onChange={e => setProfileForm({...profileForm, doctorCount: e.target.value})}
                    className="p-2 border rounded" />
                  <input type="number" placeholder="Staff" value={profileForm.staffCount}
                    onChange={e => setProfileForm({...profileForm, staffCount: e.target.value})}
                    className="p-2 border rounded" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Location Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Nearest Airport" value={profileForm.nearestAirport}
                    onChange={e => setProfileForm({...profileForm, nearestAirport: e.target.value})}
                    className="p-2 border rounded" />
                  <input type="number" placeholder="Distance from airport (km)" value={profileForm.distanceFromAirport}
                    onChange={e => setProfileForm({...profileForm, distanceFromAirport: e.target.value})}
                    className="p-2 border rounded" />
                  <input type="text" placeholder="Nearest Railway Station" value={profileForm.nearestRailway}
                    onChange={e => setProfileForm({...profileForm, nearestRailway: e.target.value})}
                    className="p-2 border rounded" />
                  <input type="number" placeholder="Distance from railway (km)" value={profileForm.distanceFromRailway}
                    onChange={e => setProfileForm({...profileForm, distanceFromRailway: e.target.value})}
                    className="p-2 border rounded" />
                </div>
              </div>

              <button onClick={handleSaveProfile} disabled={saving}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2">
                <FaSave /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}

        {/* ========== EARNINGS ========== */}
        {activeTab === 'earnings' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Earnings Overview</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">₹{earnings?.totalEarnings || 0}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Commission Paid</p>
                <p className="text-2xl font-bold text-blue-600">₹{earnings?.totalCommission || 0}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Pending Payout</p>
                <p className="text-2xl font-bold text-orange-600">₹{earnings?.pendingPayout || 0}</p>
              </div>
            </div>
            <button onClick={handleRequestSettlement} disabled={!earnings?.pendingPayout}
              className="bg-green-600 text-white px-6 py-2 rounded-lg disabled:bg-gray-400">
              Request Settlement
            </button>
          </div>
        )}

        {/* ========== SETTLEMENTS ========== */}
        {activeTab === 'settlements' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Settlement History</h2>
            {settlements.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No settlements yet</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-gray-600">
                    <th className="py-2">Payout ID</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Net</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map(s => (
                    <tr key={s.payoutId} className="border-b">
                      <td className="py-2">{s.payoutId}</td>
                      <td className="py-2">₹{s.amount}</td>
                      <td className="py-2 font-semibold">₹{s.netAmount}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          s.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{s.status}</span>
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

      {/* ========== PACKAGE MODAL ========== */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{editingPackage ? 'Edit Package' : 'Add New Package'}</h2>
                <button onClick={() => setShowPackageModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <input type="text" placeholder="Package name *" value={packageForm.name}
                  onChange={e => setPackageForm({...packageForm, name: e.target.value})}
                  className="w-full p-3 border rounded-lg" />

                <input type="text" placeholder="Short description" value={packageForm.shortDescription}
                  onChange={e => setPackageForm({...packageForm, shortDescription: e.target.value})}
                  className="w-full p-3 border rounded-lg" />

                <div className="grid grid-cols-3 gap-3">
                  <input type="number" placeholder="Duration (days) *" value={packageForm.duration}
                    onChange={e => setPackageForm({...packageForm, duration: e.target.value})}
                    className="p-3 border rounded-lg" />
                  <input type="number" placeholder="Price ₹ *" value={packageForm.price}
                    onChange={e => setPackageForm({...packageForm, price: e.target.value})}
                    className="p-3 border rounded-lg" />
                  <input type="number" placeholder="Discount ₹" value={packageForm.discountPrice}
                    onChange={e => setPackageForm({...packageForm, discountPrice: e.target.value})}
                    className="p-3 border rounded-lg" />
                </div>

                <input type="number" placeholder="Max capacity" value={packageForm.maxCapacity}
                  onChange={e => setPackageForm({...packageForm, maxCapacity: e.target.value})}
                  className="w-full p-3 border rounded-lg" />

                <textarea placeholder="Description" value={packageForm.description}
                  onChange={e => setPackageForm({...packageForm, description: e.target.value})}
                  rows="3" className="w-full p-3 border rounded-lg" />

                <input type="text" placeholder="Therapies (comma separated)"
                  value={packageForm.therapies.join(', ')}
                  onChange={e => setPackageForm({...packageForm, therapies: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                  className="w-full p-3 border rounded-lg" />

                <input type="text" placeholder="Inclusions (comma separated)"
                  value={packageForm.inclusions.join(', ')}
                  onChange={e => setPackageForm({...packageForm, inclusions: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                  className="w-full p-3 border rounded-lg" />

                <input type="text" placeholder="Exclusions (comma separated)"
                  value={packageForm.exclusions.join(', ')}
                  onChange={e => setPackageForm({...packageForm, exclusions: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                  className="w-full p-3 border rounded-lg" />

                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={packageForm.isActive}
                    onChange={e => setPackageForm({...packageForm, isActive: e.target.checked})} />
                  <span className="text-sm">Active (visible to patients)</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button onClick={handleSavePackage} disabled={saving}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400">
                    {saving ? 'Saving...' : (editingPackage ? 'Update' : 'Add Package')}
                  </button>
                  <button onClick={() => setShowPackageModal(false)}
                    className="flex-1 bg-gray-200 py-3 rounded-lg">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== ROOM MODAL ========== */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add Room Type</h2>
                <button onClick={() => setShowRoomModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <input type="text" placeholder="Room name (e.g., Deluxe Single) *" value={roomForm.name}
                  onChange={e => setRoomForm({...roomForm, name: e.target.value})}
                  className="w-full p-3 border rounded-lg" />

                <select value={roomForm.type} onChange={e => setRoomForm({...roomForm, type: e.target.value})}
                  className="w-full p-3 border rounded-lg">
                  <option>Standard</option>
                  <option>Deluxe</option>
                  <option>Single</option>
                  <option>Double</option>
                  <option>Twin Sharing</option>
                  <option>Suite</option>
                </select>

                <div className="grid grid-cols-3 gap-3">
                  <input type="number" placeholder="Price/night ₹ *" value={roomForm.pricePerNight}
                    onChange={e => setRoomForm({...roomForm, pricePerNight: e.target.value})}
                    className="p-3 border rounded-lg" />
                  <input type="number" placeholder="Capacity" value={roomForm.capacity}
                    onChange={e => setRoomForm({...roomForm, capacity: e.target.value})}
                    className="p-3 border rounded-lg" />
                  <input type="number" placeholder="Total rooms" value={roomForm.totalRooms}
                    onChange={e => setRoomForm({...roomForm, totalRooms: e.target.value})}
                    className="p-3 border rounded-lg" />
                </div>

                <input type="text" placeholder="Amenities (comma separated)"
                  value={roomForm.amenities.join(', ')}
                  onChange={e => setRoomForm({...roomForm, amenities: e.target.value.split(',').map(a => a.trim()).filter(Boolean)})}
                  className="w-full p-3 border rounded-lg" />

                <textarea placeholder="Description" value={roomForm.description}
                  onChange={e => setRoomForm({...roomForm, description: e.target.value})}
                  rows="2" className="w-full p-3 border rounded-lg" />

                <div className="flex gap-3 pt-2">
                  <button onClick={handleSaveRoom} disabled={saving}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400">
                    {saving ? 'Saving...' : 'Add Room'}
                  </button>
                  <button onClick={() => setShowRoomModal(false)}
                    className="flex-1 bg-gray-200 py-3 rounded-lg">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessCenterDashboard;