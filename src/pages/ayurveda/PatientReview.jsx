import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { submitBookingReview } from '../../services/ayurvedaApi';
import { FaStar, FaCheckCircle, FaTimesCircle, FaUserMd } from 'react-icons/fa';

const PatientReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [categories, setCategories] = useState({
    doctorKnowledge: 0,
    communication: 0,
    waitTime: 0,
    valueForMoney: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!booking) {
      navigate('/my-bookings');
    }
  }, [booking, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);

    try {
      const response = await submitBookingReview(booking.bookingId, rating, comment);
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/my-bookings');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Review Submitted!</h1>
          <p className="text-gray-600">Thank you for your feedback.</p>
          <p className="text-gray-500 mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
            <h1 className="text-2xl font-bold">Rate Your Experience</h1>
            <p className="text-green-100 mt-1">How was your Ayurveda consultation?</p>
          </div>

          <div className="p-6">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Booking Summary */}
            {booking && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FaUserMd className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold">{booking.doctorName || 'Doctor'}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Star Rating */}
            <div className="text-center mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-4xl transition-transform hover:scale-110"
                  >
                    <FaStar
                      className={
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>

            {/* Category Ratings */}
            <div className="space-y-4 mb-6">
              {[
                { key: 'doctorKnowledge', label: "Doctor's Knowledge" },
                { key: 'communication', label: 'Communication' },
                { key: 'waitTime', label: 'Wait Time' },
                { key: 'valueForMoney', label: 'Value for Money' }
              ].map(cat => (
                <div key={cat.key} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{cat.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCategories({ ...categories, [cat.key]: star })}
                        className="text-xl"
                      >
                        <FaStar
                          className={
                            star <= categories[cat.key]
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Write a Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                placeholder="Share your experience with the doctor..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>

            {/* Skip */}
            <button
              onClick={() => navigate('/my-bookings')}
              className="w-full mt-2 text-gray-500 py-2 text-sm hover:text-gray-700"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientReview;