import React, { useState, useEffect, useRef } from 'react';
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
  const [showVideo, setShowVideo] = useState(false);
  const [networkQuality, setNetworkQuality] = useState('good');
  const [waitTime, setWaitTime] = useState(0);
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  useEffect(() => {
    if (!booking) fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    let timer;
    if (status === 'waiting') {
      timer = setInterval(() => setWaitTime(prev => prev + 1), 10000);
    }
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    return () => {
      if (jitsiApiRef.current) jitsiApiRef.current.dispose();
    };
  }, []);

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

  const checkNetworkQuality = () => {
    if (navigator.connection) {
      const connection = navigator.connection;
      if (connection.downlink < 0.5) setNetworkQuality('poor');
      else if (connection.downlink < 2) setNetworkQuality('fair');
      else setNetworkQuality('good');
    }
  };

  const handleJoinCall = () => {
    checkNetworkQuality();
    setShowVideo(true);
    setStatus('in-call');

    setTimeout(() => {
      if (jitsiContainerRef.current && !jitsiApiRef.current) {
        const roomName = `HealthCareHub_${bookingId}`;
        const domain = 'meet.jit.si';
        const options = {
          roomName,
          parentNode: jitsiContainerRef.current,
          configOverrides: {
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverrides: {
            TOOLBAR_ALWAYS_VISIBLE: true,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          },
          userInfo: { displayName: booking?.patientName || 'Patient' }
        };

        if (window.JitsiMeetExternalAPI) {
          jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
          jitsiApiRef.current.addListener('readyToClose', () => handleEndCall());
        }
      }
    }, 1000);
  };

  const handleEndCall = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    setShowVideo(false);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showVideo && status === 'in-call' ? (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">👨‍⚕️</div>
              <span className="font-medium">{booking?.doctorName}</span>
              {networkQuality === 'poor' && <span className="text-red-400 text-xs">⚠️ Poor connection</span>}
            </div>
            <button onClick={handleEndCall} className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-medium transition">
              End Call
            </button>
          </div>
          <div ref={jitsiContainerRef} className="flex-1 bg-black"></div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 text-center">
              <div className="text-6xl mb-4">{status === 'waiting' ? '🕐' : '✅'}</div>
              <h1 className="text-2xl font-bold">
                {status === 'waiting' ? 'Virtual Waiting Room' : 'Consultation Completed'}
              </h1>
              <p className="text-indigo-100 mt-2">Booking: {booking?.bookingId || bookingId}</p>
            </div>

            <div className="p-8">
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

              {status === 'waiting' && (
                <div className="text-center">
                  <div className="animate-pulse bg-blue-50 rounded-2xl p-8 mb-8">
                    <p className="text-blue-700 text-lg font-semibold">Doctor will join shortly</p>
                    <p className="text-blue-500 text-sm mt-1">Estimated wait: 2-3 minutes</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-8 text-sm text-gray-500">
                    <div className="text-center"><div className="text-2xl mb-1">📶</div>Check internet</div>
                    <div className="text-center"><div className="text-2xl mb-1">🎤</div>Quiet environment</div>
                    <div className="text-center"><div className="text-2xl mb-1">💡</div>Good lighting</div>
                  </div>
                  <button onClick={handleJoinCall} className="bg-green-500 hover:bg-green-600 text-white px-10 py-5 rounded-2xl font-bold text-xl transition shadow-xl">
                    🎥 Start Video Consultation
                  </button>
                </div>
              )}

              {status === 'completed' && (
                <div>
                  <div className="bg-green-50 rounded-2xl p-6 mb-8 text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <h3 className="text-lg font-bold text-green-800">Consultation Completed</h3>
                  </div>

                  {/* Cross-tag actions */}
                  <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border">
                    <h3 className="font-bold text-gray-800 mb-4">What would you like to do?</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/online-doctor" className="bg-green-50 hover:bg-green-100 rounded-xl p-4 text-center transition">
                        <div className="text-2xl mb-1">💊</div>
                        <p className="text-sm font-medium text-green-700">Order Medicines</p>
                      </Link>
                      <Link to="/diagnostics" className="bg-blue-50 hover:bg-blue-100 rounded-xl p-4 text-center transition">
                        <div className="text-2xl mb-1">🔬</div>
                        <p className="text-sm font-medium text-blue-700">Book Lab Tests</p>
                      </Link>
                      <Link to={`/online-doctor/book/${booking?.doctorId}`} className="bg-purple-50 hover:bg-purple-100 rounded-xl p-4 text-center transition">
                        <div className="text-2xl mb-1">📅</div>
                        <p className="text-sm font-medium text-purple-700">Book Follow-up</p>
                      </Link>
                      <Link to="/ambulance" className="bg-red-50 hover:bg-red-100 rounded-xl p-4 text-center transition">
                        <div className="text-2xl mb-1">🚑</div>
                        <p className="text-sm font-medium text-red-700">Emergency</p>
                      </Link>
                    </div>
                  </div>

                  {!submitted ? (
                    <div className="border-2 rounded-2xl p-6">
                      <h3 className="font-bold text-gray-800 mb-4 text-center">Rate Your Doctor</h3>
                      <div className="flex justify-center gap-3 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} onClick={() => setRating(star)}
                            className={`text-5xl transition-transform hover:scale-125 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                        ))}
                      </div>
                      <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience (optional)" rows={3}
                        className="w-full border-2 rounded-xl px-5 py-4 mb-4 focus:outline-none focus:border-blue-400 resize-none" />
                      <button onClick={handleSubmitReview} disabled={rating === 0}
                        className={`w-full py-4 rounded-xl font-bold transition ${rating === 0 ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                        Submit Review
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-green-600 font-bold text-lg">✅ Thank you for your feedback!</div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <Link to="/online-doctor" className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition">Book Another</Link>
                    <Link to="/online-doctor/history" className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold transition">My Consultations</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoConsult;