import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  FaCalendarAlt, FaStar, FaRupeeSign, FaCheckCircle,
  FaWallet, FaHistory, FaChartBar, FaExclamationTriangle,
  FaUsers, FaHospital
} from 'react-icons/fa';

const HomeopathyCenterDashboard = () => {
  const navigate = useNavigate();
  const [center, setCenter] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');

  const token = localStorage.getItem('centerToken');
  const centerData = JSON.parse(localStorage.getItem('center') || '{}');
  const centerId = centerData.id || centerData._id;

  useEffect(() => {
    if (!token || !centerId) {
      navigate('/homeopathy/center/login', { replace: true });
      return;
    }
    loadAll(centerId);
  }, [navigate]);

  const loadAll = async (id) => {
    setLoading(true);
    setError('');
    try {
      const [centerRes, bookingsRes, earningsRes, settlementsRes] = await Promise.allSettled([
        api.get(`/homeopathy/centers/${id}`),
        api.get(`/homeopathy/bookings/center/${id}`),
        api.get(`/homeopathy/settlements/earnings/naturopathy_center/${id}`),
        api.get(`/homeopathy/settlements/history/naturopathy_center/${id}`)
      ]);

      if (centerRes.status === 'fulfilled' && centerRes.value.data?.success) {
        setCenter(centerRes.value.data.data);
      }
      if (bookingsRes.status === 'fulfilled' && bookingsRes.value.data?.success) {
        setBookings(bookingsRes.value.data.data || []);
      }
      if (earningsRes.status === 'fulfilled' && earningsRes.value.data?.success) {
        setEarnings(earningsRes.value.data.data);
      }
      if (settlementsRes.status === 'fulfilled' && settlementsRes.value.data?.success) {
        setSettlements(settlementsRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Load error:', err);
      setError('Some data failed to load');
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/homeopathy/bookings/center/complaints');
      if (res.data?.success) setComplaints(res.data.data || []);
    } catch (err) {
      console.error('Complaints error:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get('/homeopathy/bookings/center/reviews');
      if (res.data?.success) setReviews(res.data.data || []);
    } catch (err) {
      console.error('Reviews error:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'complaints') fetchComplaints();
    else if (activeTab === 'reviews') fetchReviews();
  }, [activeTab]);

  const handleStatus = async (bookingId, action, extra = {}) => {
    try {
      const res = await api.put(`/homeopathy/bookings/${bookingId}/status`, { action, ...extra });
      if (res.data?.success) await loadAll(centerId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleRespondToReview = async (bookingId) => {
    if (!responseText.trim() || responseText.trim().length < 3) return;
    try {
      await api.put(`/homeopathy/bookings/${bookingId}/review/respond`, { response: responseText });
      setRespondingTo(null);
      setResponseText('');
      fetchReviews();
    } catch (err) {
      alert('Failed to respond');
    }
  };

  const handleRespondToComplaint = async (bookingId, complaintId) => {
    if (!responseText.trim() || responseText.trim().length < 3) return;
    try {
      await api.put(`/homeopathy/bookings/${bookingId}/complaint/${complaintId}/respond`, { response: responseText });
      setRespondingTo(null);
      setResponseText('');
      fetchComplaints();
    } catch (err) {
      alert('Failed to respond');
    }
  };

  const handleResolveComplaint = async (bookingId, complaintId) => {
    if (!window.confirm('Mark this complaint as resolved?')) return;
    try {
      await api.put(`/homeopathy/bookings/${bookingId}/complaint/${complaintId}/resolve`, {});
      fetchComplaints();
    } catch (err) {
      alert('Failed to resolve');
    }
  };

  const handleRequestSettlement = async () => {
    try {
      await api.post('/homeopathy/settlements/request', {
        providerType: 'naturopathy_center',
        providerId: centerId
      });
      alert('Settlement requested!');
      loadAll(centerId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('centerToken');
    localStorage.removeItem('center');
    navigate('/homeopathy/center/login', { replace: true });
  };

  const filteredBookings = useMemo(() => {
    if (filter === 'all') return bookings;
    return bookings.filter(b => b.status === filter);
  }, [bookings, filter]);

  const stats = useMemo(() => {
    const paid = bookings.filter(b => b.paymentStatus === 'paid');
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      earnings: paid.reduce((sum, b) => sum + (b.providerEarning || 0), 0)
    };
  }, [bookings]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {center?.name?.charAt(0) || 'C'}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{center?.name || 'Center'}</h1>
                <p className="text-green-100 text-sm">{center?.type || 'Naturopathy Center'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <FaStar className="text-yellow-400" /> {center?.rating || 'New'}
              </span>
              <button onClick={handleLogout} className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30">Logout</button>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="max-w-7xl mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Bookings', value: stats.total, icon: FaCalendarAlt, color: 'bg-blue-500' },
            { label: 'Pending', value: stats.pending, icon: FaExclamationTriangle, color: 'bg-yellow-500' },
            { label: 'Confirmed', value: stats.confirmed, icon: FaCheckCircle, color: 'bg-green-500' },
            { label: 'Completed', value: stats.completed, icon: FaCheckCircle, color: 'bg-purple-500' },
            { label: 'Earnings', value: `₹${stats.earnings}`, icon: FaRupeeSign, color: 'bg-green-600' }
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-4">
              <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white mb-2`}>
                <s.icon />
              </div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-2 shadow overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: FaChartBar },
            { id: 'bookings', label: `Bookings (${bookings.length})`, icon: FaCalendarAlt },
            { id: 'reviews', label: `Reviews (${reviews.length})`, icon: FaStar },
            { id: 'complaints', label: `Complaints (${complaints.length})`, icon: FaExclamationTriangle },
            { id: 'settlements', label: 'Settlements', icon: FaHistory }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                activeTab === tab.id ? 'bg-green-600 text-white' : 'hover:bg-gray-100'
              }`}>
              <tab.icon /> {tab.label}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-semibold mb-4">Recent Bookings</h2>
            {bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bookings yet</p>
            ) : (
              bookings.slice(0, 5).map(b => (
                <div key={b._id} className="flex justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{b.patient?.name}</p>
                    <p className="text-xs text-gray-500">{b.package?.name} • {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : ''}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 h-fit">{b.status}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="font-semibold">Bookings ({filteredBookings.length})</h2>
              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                  <button key={s} onClick={() => setFilter(s)}
                    className={`px-3 py-1 rounded-full text-xs capitalize ${filter === s ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bookings found</p>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map(b => (
                  <div key={b._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <p className="font-semibold">{b.patient?.name}</p>
                        <p className="text-sm text-gray-500">{b.patient?.phone}</p>
                        <p className="text-sm text-gray-600 mt-1">{b.package?.name}</p>
                        <p className="text-xs text-gray-500">
                          {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{b.status}</span>
                        <p className="font-bold text-green-600 mt-1">₹{b.finalAmount}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {b.status === 'pending' && b.paymentStatus === 'paid' && (
                        <>
                          <button onClick={() => handleStatus(b.bookingId, 'accept')} className="px-3 py-1 bg-green-600 text-white rounded text-xs">Accept</button>
                          <button onClick={() => handleStatus(b.bookingId, 'reject', { reason: 'Unavailable' })} className="px-3 py-1 bg-red-600 text-white rounded text-xs">Reject</button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <>
                          <button onClick={() => handleStatus(b.bookingId, 'start')} className="px-3 py-1 bg-blue-600 text-white rounded text-xs">Start</button>
                          <button onClick={() => handleStatus(b.bookingId, 'no_show')} className="px-3 py-1 bg-gray-600 text-white rounded text-xs">No-show</button>
                        </>
                      )}
                      {b.status === 'in_progress' && (
                        <button onClick={() => handleStatus(b.bookingId, 'complete')} className="px-3 py-1 bg-purple-600 text-white rounded text-xs">Complete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-semibold mb-4">Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{r.patientName}</p>
                        <p className="text-xs text-gray-500">{r.packageName}</p>
                      </div>
                      <span className="text-yellow-500">⭐ {r.rating}/5</span>
                    </div>
                    {r.comment && <p className="text-sm text-gray-700 mb-2">{r.comment}</p>}
                    {r.centerResponse ? (
                      <div className="bg-green-50 p-2 rounded text-xs">
                        <p className="font-semibold text-green-700">Your response:</p>
                        <p>{r.centerResponse}</p>
                      </div>
                    ) : respondingTo === `r-${r.bookingId}` ? (
                      <div>
                        <textarea value={responseText} onChange={e => setResponseText(e.target.value)}
                          rows={2} className="w-full p-2 border rounded text-sm mt-2" />
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleRespondToReview(r.bookingId)} className="px-3 py-1 bg-green-600 text-white rounded text-xs">Submit</button>
                          <button onClick={() => { setRespondingTo(null); setResponseText(''); }} className="px-3 py-1 bg-gray-200 rounded text-xs">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setRespondingTo(`r-${r.bookingId}`); setResponseText(''); }}
                        className="text-green-600 text-xs font-medium">+ Respond</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Complaints */}
        {activeTab === 'complaints' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-semibold mb-4">Complaints ({complaints.length})</h2>
            {complaints.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No complaints</p>
            ) : (
              <div className="space-y-3">
                {complaints.map(c => (
                  <div key={c.complaintId} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{c.patientName}</p>
                        <p className="text-xs text-gray-500">{c.category} • Booking {c.bookingId}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">{c.status}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{c.description}</p>
                    {c.centerResponse ? (
                      <div className="bg-green-50 p-2 rounded text-xs">
                        <p className="font-semibold text-green-700">Your response:</p>
                        <p>{c.centerResponse}</p>
                      </div>
                    ) : respondingTo === c.complaintId ? (
                      <div>
                        <textarea value={responseText} onChange={e => setResponseText(e.target.value)}
                          rows={2} className="w-full p-2 border rounded text-sm" />
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleRespondToComplaint(c.bookingId, c.complaintId)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs">Submit</button>
                          <button onClick={() => { setRespondingTo(null); setResponseText(''); }}
                            className="px-3 py-1 bg-gray-200 rounded text-xs">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setRespondingTo(c.complaintId); setResponseText(''); }}
                        className="text-green-600 text-xs font-medium">+ Respond</button>
                    )}
                    {c.status !== 'resolved' && (
                      <button onClick={() => handleResolveComplaint(c.bookingId, c.complaintId)}
                        className="ml-3 text-purple-600 text-xs font-medium">✓ Mark Resolved</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settlements */}
        {activeTab === 'settlements' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Settlements</h2>
              <button onClick={handleRequestSettlement}
                disabled={!earnings?.pendingPayout}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  earnings?.pendingPayout ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500'
                }`}>
                {earnings?.pendingPayout ? `Request ₹${earnings.pendingPayout}` : 'No Pending Payout'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Total Earnings</p>
                <p className="font-bold text-green-600">₹{earnings?.totalEarnings || 0}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Pending</p>
                <p className="font-bold text-orange-600">₹{earnings?.pendingPayout || 0}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Commission</p>
                <p className="font-bold text-blue-600">₹{earnings?.totalCommission || 0}</p>
              </div>
            </div>

            {settlements.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">No settlements yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-gray-500">
                    <th className="text-left py-2">Payout ID</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Net</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map(s => (
                    <tr key={s.payoutId} className="border-b">
                      <td className="py-2">{s.payoutId}</td>
                      <td className="py-2">₹{s.amount}</td>
                      <td className="py-2 font-bold">₹{s.netAmount}</td>
                      <td className="py-2"><span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeopathyCenterDashboard;