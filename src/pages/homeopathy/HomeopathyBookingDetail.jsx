import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  FaCalendarAlt, FaClock, FaUserMd, FaStar, FaTimesCircle,
  FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaRupeeSign
} from 'react-icons/fa';

const HomeopathyBookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('service_quality');
  const [complaintDescription, setComplaintDescription] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchBooking();
  }, [bookingId, navigate]);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/homeopathy/bookings/${bookingId}`);
      if (res.data?.success) setBooking(res.data.data);
      else setError('Booking not found');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim() || cancelReason.trim().length < 5) {
      alert('Please provide a reason (min 5 characters)');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.put(`/homeopathy/bookings/${bookingId}/cancel`, {
        reason: cancelReason
      });
      if (res.data?.success) {
        alert(`Cancelled. Refund: ₹${res.data.data.refundAmount || 0}`);
        setShowCancelModal(false);
        fetchBooking();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReview = async () => {
    if (!reviewComment.trim() || reviewComment.trim().length < 3) {
      alert('Please write at least a few words');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.post(`/homeopathy/bookings/${bookingId}/review`, {
        rating,
        comment: reviewComment
      });
      if (res.data?.success) {
        alert('Thank you for your review!');
        setShowReviewModal(false);
        fetchBooking();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Review failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplaint = async () => {
    if (!complaintDescription.trim() || complaintDescription.trim().length < 10) {
      alert('Please describe your complaint (min 10 characters)');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.post(`/homeopathy/bookings/${bookingId}/complaint`, {
        category: complaintCategory,
        description: complaintDescription,
        priority: 'medium'
      });
      if (res.data?.success) {
        alert('Complaint submitted. Our team will contact you.');
        setShowComplaintModal(false);
        fetchBooking();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Complaint submission failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Booking not found'}</p>
          <button
            onClick={() => navigate('/homeopathy/my-bookings')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const canReview = booking.status === 'completed' && !booking.reviewed;
  const canComplain = ['completed', 'confirmed', 'in_progress'].includes(booking.status);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4"
        >
          <FaArrowLeft /> Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Booking ID</p>
              <p className="font-bold text-lg">#{booking.bookingId}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${
              booking.status === 'completed' ? 'bg-green-100 text-green-700' :
              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {booking.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-1">
                {booking.type === 'homeopathy_consult' ? 'Doctor' : 'Provider'}
              </p>
              <p className="font-semibold">
                {booking.type === 'homeopathy_consult' && `Dr ${booking.doctorName}`}
                {booking.type === 'naturopathy_center' && booking.centerName}
                {booking.type === 'homeopathy_medicine' && booking.pharmacyName}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Type</p>
              <p className="font-semibold capitalize">
                {booking.type?.replace(/_/g, ' ')}
              </p>
            </div>
            {booking.bookingDate && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Date</p>
                <p className="font-semibold flex items-center gap-1">
                  <FaCalendarAlt className="text-green-600" />
                  {new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
            )}
            {booking.slotTime && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Time</p>
                <p className="font-semibold flex items-center gap-1">
                  <FaClock className="text-green-600" /> {booking.slotTime}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-500 text-xs mb-1">Patient</p>
              <p className="font-semibold">{booking.patient?.name}</p>
              <p className="text-xs text-gray-500">{booking.patient?.phone}</p>
            </div>
          </div>
        </div>

        {/* Payment details */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FaRupeeSign className="text-green-600" /> Payment Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount</span>
              <span>₹{booking.amount}</span>
            </div>
            {booking.discount?.amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{booking.discount.amount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee</span>
              <span>₹{booking.platformFee || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">GST</span>
              <span>₹{booking.gstAmount || 0}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total</span>
              <span className="text-green-600">₹{booking.finalAmount}</span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-gray-500">Payment Status</span>
              <span className={`font-medium ${
                booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'
              }`}>
                {booking.paymentStatus === 'paid' ? '✅ Paid' : booking.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Review (if exists) */}
        {booking.review?.rating && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FaStar className="text-yellow-400" /> Your Review
            </h3>
            <div className="flex mb-2">
              {[1, 2, 3, 4, 5].map(i => (
                <FaStar key={i} className={i <= booking.review.rating ? 'text-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
            <p className="text-gray-700 text-sm">{booking.review.comment}</p>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <h3 className="font-semibold mb-3">Actions</h3>
          <div className="flex flex-wrap gap-3">
            {canReview && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold text-sm flex items-center gap-2"
              >
                <FaStar /> Leave a Review
              </button>
            )}
            {canComplain && (
              <button
                onClick={() => setShowComplaintModal(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold text-sm flex items-center gap-2"
              >
                <FaExclamationTriangle /> Raise Issue
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm flex items-center gap-2"
              >
                <FaTimesCircle /> Cancel Booking
              </button>
            )}
          </div>
        </div>

        {/* Modals */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="font-bold text-lg mb-3">Cancel Booking</h3>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Why are you cancelling? (min 5 characters)"
                rows={3}
                className="w-full p-3 border rounded-lg mb-4 text-sm"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold disabled:bg-red-300"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Cancel'}
                </button>
                <button
                  onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
                  className="flex-1 py-2 bg-gray-200 rounded-lg font-semibold"
                >
                  Keep Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {showReviewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="font-bold text-lg mb-3">Leave a Review</h3>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    onClick={() => setRating(i)}
                    className="bg-transparent border-none cursor-pointer p-0"
                  >
                    <FaStar className={`text-3xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
                className="w-full p-3 border rounded-lg mb-4 text-sm"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleReview}
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-yellow-500 text-white rounded-lg font-semibold disabled:bg-yellow-300"
                >
                  {actionLoading ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2 bg-gray-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showComplaintModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="font-bold text-lg mb-3">Raise an Issue</h3>
              <select
                value={complaintCategory}
                onChange={(e) => setComplaintCategory(e.target.value)}
                className="w-full p-3 border rounded-lg mb-3 text-sm"
              >
                <option value="service_quality">Service Quality</option>
                <option value="late_consultation">Late Consultation</option>
                <option value="wrong_medicine">Wrong Medicine</option>
                <option value="billing_issue">Billing Issue</option>
                <option value="staff_behaviour">Staff Behaviour</option>
                <option value="other">Other</option>
              </select>
              <textarea
                value={complaintDescription}
                onChange={(e) => setComplaintDescription(e.target.value)}
                placeholder="Describe your issue (min 10 characters)"
                rows={4}
                className="w-full p-3 border rounded-lg mb-4 text-sm"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleComplaint}
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg font-semibold disabled:bg-orange-300"
                >
                  {actionLoading ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  onClick={() => setShowComplaintModal(false)}
                  className="flex-1 py-2 bg-gray-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeopathyBookingDetail;