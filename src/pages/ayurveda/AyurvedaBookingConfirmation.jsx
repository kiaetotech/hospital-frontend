import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyBookingOtp, resendBookingOtp } from '../../services/ayurvedaApi';

const AyurvedaBookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking, doctor } = location.state || {};

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!booking) {
      navigate('/ayurveda/doctors');
      return;
    }

    // Auto-fill OTP if available (from create booking response)
    if (booking.otp) {
      setOtp(booking.otp);
    }

    // Resend timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [booking, navigate]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!otp || otp.length !== 4) {
        setError('Please enter a valid 4-digit OTP');
        setLoading(false);
        return;
      }

      const response = await verifyBookingOtp(booking.bookingId, otp);

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/my-bookings');
        }, 2000);
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try {
      const response = await resendBookingOtp(booking.bookingId);
      if (response.data.success) {
        setOtp(response.data.data.otp);
        setResendTimer(30);
        setCanResend(false);
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 text-white p-6 text-center">
            <div className="text-5xl mb-3">
              {success ? '✅' : '🔐'}
            </div>
            <h1 className="text-2xl font-bold">
              {success ? 'Booking Confirmed!' : 'Verify OTP'}
            </h1>
            <p className="text-green-100 mt-1">
              {success ? 'Your booking is confirmed' : 'Enter OTP to confirm your booking'}
            </p>
          </div>

          <div className="p-6">
            {success ? (
              <div className="text-center">
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="text-green-700 font-semibold">Booking ID: {booking.bookingId}</p>
                </div>
                <p className="text-gray-600 mb-4">Redirecting to your bookings...</p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="font-semibold text-blue-800 mb-2">📹 Video Consultation</p>
                <p className="text-sm text-gray-600 mb-2">
                  Your consultation will be via video call.
                </p>
                <a
                  href={`https://meet.google.com/${booking.bookingId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Join Video Call
                </a>
              </div>
	      </div>
            ) : (
              <>
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                {/* Booking Info */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-600">
                    OTP sent to your phone. Please enter the 4-digit code below.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Booking ID: <span className="font-medium">{booking.bookingId}</span>
                  </p>
                </div>

                {/* OTP Form */}
                <form onSubmit={handleVerifyOtp}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                      Enter 4-Digit OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                      maxLength="4"
                      className="w-full text-center text-3xl tracking-widest p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="____"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Verifying...' : 'Verify & Confirm Booking'}
                  </button>
                </form>

                {/* Resend OTP */}
                <div className="mt-4 text-center">
                  {canResend ? (
                    <button
                      onClick={handleResendOtp}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Resend OTP in {resendTimer} seconds
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Booking Details Summary */}
        {!success && (
          <div className="bg-white rounded-lg shadow-lg mt-4 p-4">
            <h3 className="font-semibold mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor</span>
                <span className="font-medium">{doctor?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">
                  {new Date(booking.booking?.bookingDate || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time</span>
                <span className="font-medium">{booking.booking?.slotTime || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-medium text-green-600">₹{booking.amount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AyurvedaBookingConfirmation;