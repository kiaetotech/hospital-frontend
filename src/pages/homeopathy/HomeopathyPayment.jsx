import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaLock, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const HomeopathyPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state?.bookingData;
  const doctor = location.state?.doctor;
  const consultationType = location.state?.consultationType || 'online';

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('review'); // review | otp | success
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingData) {
      navigate('/homeopathy/doctors', { replace: true });
    }
  }, [bookingData, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const loadRazorpayScript = () => {
    return new Promise(resolve => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    setError('');
    setLoading(true);

    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) {
        setError('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      const options = {
        key: bookingData.razorpayKeyId,
        amount: Math.round(bookingData.amount * 100),
        currency: 'INR',
        name: 'KiaetoCare',
        description: `Homeopathy Consultation — ${doctor?.name || 'Doctor'}`,
        order_id: bookingData.razorpayOrderId,
        prefill: {
          name: userData.name || '',
          email: userData.email || '',
          contact: userData.phone || ''
        },
        theme: { color: '#059669' },
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/homeopathy/bookings/verify-payment', {
              bookingId: bookingData.bookingId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            if (verifyRes.data?.success) {
              setStep('otp');
            } else {
              setError('Payment verification failed: ' + (verifyRes.data?.message || 'Unknown'));
            }
          } catch (err) {
            console.error('Verify error:', err);
            setError(err.response?.data?.message || 'Payment verification failed. Contact support.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || err.message || 'Payment failed');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setOtpError('Enter the 4-digit OTP');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await api.post('/homeopathy/bookings/verify-otp', {
        bookingId: bookingData.bookingId,
        otp
      });
      if (res.data?.success) {
        setStep('success');
      } else {
        setOtpError(res.data?.message || 'Invalid OTP');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await api.post('/homeopathy/bookings/resend-otp', { bookingId: bookingData.bookingId });
      setResendCooldown(30);
      setOtpError('');
    } catch (err) {
      setOtpError('Failed to resend OTP');
    }
  };

  if (!bookingData) return null;

  // SUCCESS
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 text-sm mb-6">
            Confirmation sent to your registered phone
          </p>
          <div className="bg-green-50 rounded-xl p-4 text-left text-sm mb-6">
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-gray-600">Booking ID</span>
              <span className="font-bold">{bookingData.bookingId}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-gray-600">Doctor</span>
              <span className="font-bold">{doctor?.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-gray-600">Type</span>
              <span className="font-bold">
                {consultationType === 'online' ? '💻 Online' : '🏥 Clinic'}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-bold text-green-600">₹{bookingData.amount}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/homeopathy/my-bookings')}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            >
              My Bookings
            </button>
            <button
              onClick={() => navigate('/homeopathy')}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // OTP
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Verify OTP</h1>
          <p className="text-gray-600 text-sm mb-2">
            Enter the 4-digit OTP sent to your phone
          </p>
          <p className="text-green-600 text-xs font-semibold mb-6">
            Booking {bookingData.bookingId} • Paid ₹{bookingData.amount}
          </p>

          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            placeholder="----"
            className="w-full py-4 text-3xl tracking-[1rem] text-center border-2 rounded-xl focus:border-green-500 outline-none mb-4"
          />

          {otpError && (
            <p className="text-red-600 text-sm mb-3">{otpError}</p>
          )}

          <button
            onClick={handleVerifyOtp}
            disabled={otpLoading || otp.length < 4}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-base disabled:bg-green-300"
          >
            {otpLoading ? 'Verifying...' : 'Confirm Booking'}
          </button>

          <button
            onClick={handleResendOtp}
            disabled={resendCooldown > 0}
            className={`mt-4 text-sm font-semibold bg-transparent border-none ${
              resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 cursor-pointer'
            }`}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    );
  }

  // REVIEW
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <FaLock className="text-green-600 text-2xl" />
          <h1 className="text-xl font-bold">Secure Payment</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
            <FaTimesCircle /> {error}
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <div className="flex justify-between py-1.5 text-sm border-b">
            <span className="text-gray-600">Booking ID</span>
            <span className="font-semibold">{bookingData.bookingId}</span>
          </div>
          <div className="flex justify-between py-1.5 text-sm border-b">
            <span className="text-gray-600">Doctor</span>
            <span className="font-semibold">{doctor?.name}</span>
          </div>
          <div className="flex justify-between py-1.5 text-sm border-b">
            <span className="text-gray-600">Consultation Type</span>
            <span className="font-semibold">
              {consultationType === 'online' ? '💻 Online' : '🏥 Clinic'}
            </span>
          </div>
          <div className="flex justify-between py-3 text-lg">
            <span className="font-bold">Amount</span>
            <span className="font-bold text-green-600">₹{bookingData.amount}</span>
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold text-base hover:bg-green-700 disabled:bg-green-300 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" /> Processing...
            </>
          ) : (
            `Pay ₹${bookingData.amount}`
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          🔒 Secure payment via Razorpay
        </p>
      </div>
    </div>
  );
};

export default HomeopathyPayment;