import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaCalendarAlt, FaClock, FaUserMd, FaChevronRight, FaTimesCircle } from 'react-icons/fa';

const HomeopathyMyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?redirect=/homeopathy/my-bookings');
      return;
    }
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/homeopathy/bookings/my-bookings', { params: { limit: 50 } });
      if (res.data?.success) setBookings(res.data.data || []);
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusColor = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      no_show: 'bg-gray-100 text-gray-700',
      rescheduled: 'bg-orange-100 text-orange-700'
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
          <button
            onClick={() => navigate('/homeopathy/doctors')}
            className="text-green-600 font-semibold text-sm"
          >
            + New Booking
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <FaTimesCircle /> {error}
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === t.id ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-500 mb-4">No bookings found</p>
            <button
              onClick={() => navigate('/homeopathy/doctors')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold"
            >
              Find a Doctor
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(b => (
              <div
                key={b._id}
                onClick={() => navigate(`/homeopathy/booking/${b.bookingId}`)}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {b.type === 'homeopathy_consult' && `Dr ${b.doctorName}`}
                      {b.type === 'naturopathy_center' && b.centerName}
                      {b.type === 'homeopathy_medicine' && b.pharmacyName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">#{b.bookingId}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(b.status)}`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                  {b.bookingDate && (
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt /> {new Date(b.bookingDate).toLocaleDateString('en-IN')}
                    </span>
                  )}
                  {b.slotTime && (
                    <span className="flex items-center gap-1">
                      <FaClock /> {b.slotTime}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <FaUserMd /> {b.consultationType || 'online'}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <span className={`text-xs font-medium ${
                    b.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'
                  }`}>
                    {b.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Payment Pending'}
                  </span>
                  <span className="font-bold text-green-600">₹{b.finalAmount}</span>
                </div>

                <div className="flex justify-end mt-2">
                  <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                    View Details <FaChevronRight className="text-xs" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeopathyMyBookings;