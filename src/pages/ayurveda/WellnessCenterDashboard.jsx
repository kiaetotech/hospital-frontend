import React, { useState, useEffect, useMemo } from 'react';
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
  FaCalendarAlt, FaStar, FaRupeeSign, FaUsers,
  FaBuilding, FaClock, FaCheckCircle, FaTimesCircle,
  FaWallet, FaHistory, FaChartBar, FaBed, FaBox,
  FaChevronDown, FaChevronUp, FaPlus, FaEdit, FaTrash
} from 'react-icons/fa';

const WellnessCenterDashboard = () => {
  const navigate = useNavigate();
  const [center, setCenter] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [packages, setPackages] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageForm, setPackageForm] = useState({
    name: '',
    duration: '',
    price: '',
    discountPrice: '',
    description: '',
    therapies: [],
    inclusions: [],
    maxCapacity: ''
  });

  useEffect(() => {
    const centerData = JSON.parse(localStorage.getItem('center') || '{}');
    if (!centerData.id) {
      navigate('/ayurveda/wellness-center-login');
      return;
    }
    setCenter(centerData);
    fetchDashboardData(centerData.id);
  }, [navigate]);

  const fetchDashboardData = async (centerId) => {
    setLoading(true);
    try {
      const [bookingsRes, earningsRes, settlementsRes, centerRes] = await Promise.all([
        getCenterBookings(centerId),
        getProviderEarnings('wellness_center', centerId),
        getSettlementHistory('wellness_center', centerId),
        getPanchakarmaCenterById(centerId)
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
      if (centerRes.data.success) {
        setPackages(centerRes.data.data.packages || []);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

    const handleStatusUpdate = async (bookingId, action) => {
    try {
      if (action === 'reject') {
        if (!window.confirm('Are you sure you want to reject this booking? The patient will be refunded.')) {
          return;
        }
      }
      const response = await updateBookingStatus(bookingId, action);
      if (response.data.success) {
        alert(`Booking ${action}ed successfully!`);
        fetchDashboardData(center.id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleRequestSettlement = async () => {
    try {
      const response = await requestSettlement('wellness_center', center.id);
      if (response.data.success) {
        alert('Settlement requested successfully!');
        fetchDashboardData(center.id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request settlement');
    }
  };

  const handleSavePackage = async () => {
    try {
      // In production, call API to save package
      setShowPackageModal(false);
      setEditingPackage(null);
      setPackageForm({
        name: '',
        duration: '',
        price: '',
        discountPrice: '',
        description: '',
        therapies: [],
        inclusions: [],
        maxCapacity: ''
      });
      fetchDashboardData(center.id);
    } catch (err) {
      alert('Failed to save package');
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
    const activeBookings = bookings.filter(b => 
      ['confirmed', 'in_progress'].includes(b.status)
    );
    const completedBookings = bookings.filter(b => b.status === 'completed');

    return {
      todayCount: todayBookings.length,
      activeCount: activeBookings.length,
      completedCount: completedBookings.length,
      totalEarnings: earnings?.totalEarnings || 0,
      pendingPayout: earnings?.pendingPayout || 0,
      packageCount: packages.length,
      averageRating: center?.rating || 0,
      occupancyRate: 75 // Calculate from active bookings / capacity
    };
  }, [bookings, earnings, packages, center]);

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
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
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
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <FaStar className="text-yellow-400" /> {center?.rating || 'New'}
              </span>
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

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: "Today's Bookings", value: stats.todayCount, icon: FaCalendarAlt, color: 'bg-blue-500' },
            { label: 'Active', value: stats.activeCount, icon: FaClock, color: 'bg-yellow-500' },
            { label: 'Completed', value: stats.completedCount, icon: FaCheckCircle, color: 'bg-green-500' },
            { label: 'Packages', value: stats.packageCount, icon: FaBox, color: 'bg-purple-500' },
            { label: 'Total Earnings', value: `₹${stats.totalEarnings}`, icon: FaRupeeSign, color: 'bg-indigo-500' },
            { label: 'Pending Payout', value: `₹${stats.pendingPayout}`, icon: FaWallet, color: 'bg-orange-500' },
            { label: 'Rating', value: stats.averageRating || 'New', icon: FaStar, color: 'bg-pink-500' },
            { label: 'Occupancy', value: `${stats.occupancyRate}%`, icon: FaBed, color: 'bg-teal-500' }
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
            { id: 'packages', label: 'Packages', icon: FaBox },
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
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('bookings')}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
              >
                <FaCalendarAlt className="text-3xl text-green-600 mx-auto mb-2" />
                <p className="font-semibold">Manage Bookings</p>
              </button>
              <button
                onClick={() => {
                  setEditingPackage(null);
                  setShowPackageModal(true);
                }}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
              >
                <FaPlus className="text-3xl text-blue-600 mx-auto mb-2" />
                <p className="font-semibold">Add Package</p>
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
              >
                <FaWallet className="text-3xl text-purple-600 mx-auto mb-2" />
                <p className="font-semibold">View Earnings</p>
              </button>
              <button
                onClick={handleRequestSettlement}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
              >
                <FaRupeeSign className="text-3xl text-orange-600 mx-auto mb-2" />
                <p className="font-semibold">Request Settlement</p>
              </button>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
              {bookings.slice(0, 5).map(booking => (
                <div key={booking.bookingId} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{booking.patient?.name}</p>
                    <p className="text-sm text-gray-600">{booking.package?.name || 'Consultation'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

                {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
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

            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-xl font-bold text-blue-600">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600">Active</p>
                <p className="text-xl font-bold text-yellow-600">
                  {bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status)).length}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600">Completed</p>
                <p className="text-xl font-bold text-green-600">
                  {bookings.filter(b => b.status === 'completed').length}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600">Cancelled</p>
                <p className="text-xl font-bold text-red-600">
                  {bookings.filter(b => b.status === 'cancelled').length}
                </p>
              </div>
            </div>

            {/* Booking Cards */}
            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No bookings found</p>
              ) : (
                filteredBookings.map(booking => (
                  <div key={booking.bookingId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{booking.patient?.name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            booking.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            booking.status === 'confirmed' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {booking.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          📞 {booking.patient?.phone}
                        </p>
                        <p className="text-sm text-gray-600">
                          📅 {new Date(booking.bookingDate).toLocaleDateString()}
                        </p>
                        {booking.package && (
                          <p className="text-sm text-gray-600">
                            📦 {booking.package.name} ({booking.package.duration} days)
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{booking.finalAmount}</p>
                        <p className="text-xs text-gray-500">
                          Commission: ₹{booking.platformCommission}
                        </p>
                        <p className="text-xs text-gray-500">
                          Your Earning: ₹{booking.providerEarning}
                        </p>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                        booking.paymentStatus === 'refunded' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        Payment: {booking.paymentStatus}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex gap-2 border-t pt-3">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking.bookingId, 'accept')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
                          >
                            ✓ Accept Booking
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.bookingId, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
                          >
                            ✕ Reject
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.bookingId, 'start')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                        >
                          ▶ Start Treatment
                        </button>
                      )}
                      {booking.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.bookingId, 'complete')}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium"
                        >
                          ✓ Complete Treatment
                        </button>
                      )}
                      {booking.status === 'completed' && (
                        <span className="text-sm text-green-600 font-medium">
                          ✓ Treatment completed successfully
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Packages ({packages.length})</h2>
              <button
                onClick={() => {
                  setEditingPackage(null);
                  setShowPackageModal(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaPlus /> Add Package
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{pkg.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPackage(pkg);
                          setPackageForm(pkg);
                          setShowPackageModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <FaEdit />
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                  <div className="space-y-1 text-sm">
                    <p>Duration: {pkg.duration} days</p>
                    <p>Price: ₹{pkg.price}</p>
                    {pkg.discountPrice && (
                      <p className="text-green-600">Discount: ₹{pkg.discountPrice}</p>
                    )}
                    <p>Capacity: {pkg.currentBookings}/{pkg.maxCapacity}</p>
                  </div>
                  {pkg.therapies && pkg.therapies.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Therapies:</p>
                      <div className="flex flex-wrap gap-1">
                        {pkg.therapies.map((therapy, i) => (
                          <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                            {therapy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
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

      {/* Package Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingPackage ? 'Edit Package' : 'Add New Package'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Package Name *</label>
                  <input
                    type="text"
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="e.g., 7-Day Panchakarma Detox"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (Days) *</label>
                    <input
                      type="number"
                      value={packageForm.duration}
                      onChange={(e) => setPackageForm({ ...packageForm, duration: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Capacity *</label>
                    <input
                      type="number"
                      value={packageForm.maxCapacity}
                      onChange={(e) => setPackageForm({ ...packageForm, maxCapacity: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      value={packageForm.price}
                      onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Price (₹)</label>
                    <input
                      type="number"
                      value={packageForm.discountPrice}
                      onChange={(e) => setPackageForm({ ...packageForm, discountPrice: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={packageForm.description}
                    onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Therapies (comma separated)</label>
                  <input
                    type="text"
                    value={packageForm.therapies?.join(', ')}
                    onChange={(e) => setPackageForm({ 
                      ...packageForm, 
                      therapies: e.target.value.split(',').map(t => t.trim()) 
                    })}
                    className="w-full p-2 border rounded"
                    placeholder="Abhyanga, Shirodhara, Basti"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Inclusions (comma separated)</label>
                  <input
                    type="text"
                    value={packageForm.inclusions?.join(', ')}
                    onChange={(e) => setPackageForm({ 
                      ...packageForm, 
                      inclusions: e.target.value.split(',').map(i => i.trim()) 
                    })}
                    className="w-full p-2 border rounded"
                    placeholder="Accommodation, Meals, Yoga"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSavePackage}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                  >
                    {editingPackage ? 'Update Package' : 'Add Package'}
                  </button>
                  <button
                    onClick={() => setShowPackageModal(false)}
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

export default WellnessCenterDashboard;