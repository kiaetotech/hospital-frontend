import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyBookingPayment } from '../../services/ayurvedaApi';

const AyurvedaPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingData, doctor } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!bookingData) {
      navigate('/ayurveda/doctors');
      return;
    }
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [bookingData, navigate]);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_SuIxiczJNstm0k',
        amount: bookingData.amount * 100,
        currency: 'INR',
        name: 'HospitalHub',
        description: `Ayurveda Consultation - ${doctor?.name || 'Booking'}`,
        order_id: bookingData.razorpayOrderId,
        handler: async (response) => {
          try {
            const verifyResponse = await verifyBookingPayment({
              bookingId: bookingData.bookingId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              setPaymentSuccess(true);
              setTimeout(() => {
                navigate(`/ayurveda/confirmation/${bookingData.bookingId}`, {
  state: {
    booking: verifyResponse.data.data,
    doctor: doctor
  }
});
              }, 1500);
            }
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
        prefill: {
          name: bookingData.booking?.patient?.name || '',
          email: bookingData.booking?.patient?.email || '',
          contact: bookingData.booking?.patient?.phone || ''
        },
        theme: {
          color: '#16a34a'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment cancelled. You can retry.');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError('Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  if (!bookingData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 text-white p-6">
            <h1 className="text-2xl font-bold">Complete Payment</h1>
            <p className="text-green-100 mt-1">Secure payment via Razorpay</p>
          </div>

          <div className="p-6">
            {/* Success Message */}
            {paymentSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-semibold">Payment Successful!</p>
                    <p className="text-sm">Redirecting to confirmation...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Booking Summary */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID</span>
                  <span className="font-medium">{bookingData.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor</span>
                  <span className="font-medium">{doctor?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultation Type</span>
                  <span className="font-medium capitalize">{bookingData.booking?.consultationType || 'Online'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="font-medium">
                    {new Date(bookingData.booking?.bookingDate).toLocaleDateString()} at {bookingData.booking?.slotTime}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold">Total Amount</span>
                  <span className="font-bold text-green-600 text-2xl">₹{bookingData.amount}</span>
                </div>
              </div>
            </div>

            {/* OTP Info */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> After payment, you'll receive an OTP to confirm your booking.
                Keep it ready for the next step.
              </p>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Opening Payment...
                </span>
              ) : (
                'Pay Now with Razorpay'
              )}
            </button>

            {/* Payment Methods */}
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>💳 Cards</span>
              <span>📱 UPI</span>
              <span>🏦 Net Banking</span>
              <span>💰 Wallets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AyurvedaPayment;