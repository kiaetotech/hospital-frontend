import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getOnlineConsultById, submitOnlineReview } from '../../services/api';

const VideoConsult = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [status, setStatus] = useState('waiting');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(!location.state?.booking);

  useEffect(() => {
    if (!booking) fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await getOnlineConsultById(bookingId);
      setBooking(response.data?.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCall = () => {
    setStatus('in-call');
    const roomName = `HealthCareHub_${bookingId}`;
    window.open(`https://meet.jit.si/${roomName}`, '_blank', 'width=1024,height=768');
  };

  const handleEndCall = () => {
    setStatus('completed');
  };

  const handleSubmitReview = async () => {
    if (rating === 0) return;
    try {
      await submitOnlineReview({ bookingId, rating, comment });
      setSubmitted(true);
    } catch (error) {
      console.error('Review error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin text-5xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 text-center">
            <div className="text-6xl mb-4">
              {status === 'waiting' ? '🕐' : status === 'in-call' ? '🎥' : '✅'}
            </div>
            <h1 className="text-2xl font-bold">
              {status === 'waiting' ? 'Virtual Waiting Room' : status === 'in-call' ? 'Consultation in Progress' : 'Consultation Completed'}
            </h1>
            <p className="text-indigo-100 mt-2">Booking: {booking?.bookingId || bookingId}</p>
          </div>

          <div className="p-8">
            {/* Doctor Info */}
            <div className="flex items-center gap-5 mb-8 p-5 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-2xl">👨‍⚕️</div>
              <div>
                <h3 className="font-bold text-gray-800">{booking?.doctorName}</h3>
                <p className="text-gray-500 text-sm">{booking?.doctorSpecialization}</p>
                {booking?.appointmentDate && (
                  <p className="text-sm text-gray-400">
                    {new Date(booking.appointmentDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })} at {booking.timeSlot}
                  </p>
                )}
              </div>
            </div>

            {/* Waiting Room */}
            {status === 'waiting' && (
              <div className="text-center">
                <div className="animate-pulse bg-blue-50 rounded-2xl p-8 mb-8">
                  <p className="text-blue-700 text-lg font-semibold">Estimated wait: 2-3 minutes</p>
                  <p className="text-blue-500 text-sm mt-1">Your doctor will join shortly</p>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8 text-sm text-gray-500">
                  <div className="text-center">📶 Check internet</div>
                  <div className="text-center">🎤 Test microphone</div>
                  <div className="text-center">📷 Test camera</div>
                </div>
                <button onClick={handleJoinCall} className="bg-green-500 hover:bg-green-600 text-white px-10 py-5 rounded-2xl font-bold text-xl transition shadow-xl">
                  🎥 Join Video Call Now
                </button>
                <p className="text-xs text-gray-400 mt-4">A new window will open with your video consultation</p>
              </div>
            )}

            {/* In Call */}
            {status === 'in-call' && (
              <div className="text-center">
                <div className="bg-green-50 rounded-2xl p-8 mb-8">
                  <p className="text-green-700 text-lg font-semibold">Consultation window is open</p>
                  <p className="text-green-500 text-sm mt-1">You can close the video window when done</p>
                </div>
                <button onClick={handleEndCall} className="bg-red-500 hover:bg-red-600 text-white px-10 py-4 rounded-2xl font-bold transition shadow-lg">
                  End Consultation
                </button>
              </div>
            )}

            {/* Completed */}
            {status === 'completed' && (
              <div>
                <div className="bg-green-50 rounded-2xl p-6 mb-8 text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <h3 className="text-lg font-bold text-green-800">Consultation Completed Successfully</h3>
                  <p className="text-green-600 text-sm mt-1">Your prescription has been saved</p>
                </div>

                {!submitted ? (
                  <div className="border-2 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-800 mb-4 text-center">Rate Your Experience</h3>
                    <div className="flex justify-center gap-3 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`text-5xl transition-transform hover:scale-110 ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this doctor (optional)"
                      rows={3}
                      className="w-full border-2 rounded-xl px-5 py-4 mb-4 focus:outline-none focus:border-blue-400 resize-none"
                    />
                    <button
                      onClick={handleSubmitReview}
                      disabled={rating === 0}
                      className={`w-full py-4 rounded-xl font-bold transition ${
                        rating === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Submit Review
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-green-600 font-bold text-lg">
                    ✅ Thank you for your feedback!
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <Link to="/online-doctor" className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition">
                    Back to Online Doctor
                  </Link>
                  <Link to="/my-bookings" className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold transition">
                    My Bookings
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConsult;