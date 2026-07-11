import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  FaLock, FaShieldAlt, FaCreditCard, FaWallet, 
  FaGooglePay, FaPaypal, FaArrowLeft, FaCheckCircle,
  FaSpinner, FaLockOpen
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const MentalHealthPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('razorpay');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('orderId');
    const bookingId = params.get('bookingId');
    const amount = params.get('amount');

    if (!orderId || !bookingId) {
      setError('Invalid payment request');
      return;
    }

    setPaymentDetails({
      orderId,
      bookingId,
      amount: parseFloat(amount) || 0
    });
  }, [location]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      if (selectedMethod === 'razorpay') {
        await handleRazorpayPayment();
      } else if (selectedMethod === 'wallet') {
        await handleWalletPayment();
      } else if (selectedMethod === 'upi') {
        await handleUPIPayment();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = () => {
    return new Promise((resolve, reject) => {
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: paymentDetails.amount * 100,
        currency: 'INR',
        name: 'Mental Health Consultation',
        description: 'Therapy Session Payment',
        image: '/logo.png',
        order_id: paymentDetails.orderId,
        handler: function (response) {
          // Payment successful - verify on backend
          verifyPayment(response);
          resolve(response);
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
          contact: localStorage.getItem('userPhone') || ''
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            reject(new Error('Payment cancelled'));
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });
  };

  const verifyPayment = async (response) => {
    try {
      const verification = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payment/verify`,
        {
          orderId: paymentDetails.orderId,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          bookingId: paymentDetails.bookingId
        }
      );

      if (verification.data.success) {
        navigate(`/mentalhealth/confirmation?bookingId=${paymentDetails.bookingId}`);
      } else {
        setError('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      setError('Payment verification failed. Please contact support.');
    }
  };

  const handleWalletPayment = async () => {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/payment/wallet`,
      {
        bookingId: paymentDetails.bookingId,
        amount: paymentDetails.amount
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    );

    if (response.data.success) {
      navigate(`/mentalhealth/confirmation?bookingId=${paymentDetails.bookingId}`);
    } else {
      throw new Error(response.data.message || 'Wallet payment failed');
    }
  };

  const handleUPIPayment = async () => {
    // Generate UPI payment link or QR code
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/payment/upi`,
      {
        bookingId: paymentDetails.bookingId,
        amount: paymentDetails.amount
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    );

    if (response.data.upiLink) {
      window.open(response.data.upiLink, '_blank');
      // Poll for payment status
      await pollPaymentStatus();
    } else {
      throw new Error('UPI payment generation failed');
    }
  };

  const pollPaymentStatus = async () => {
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/payment/status/${paymentDetails.bookingId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.status === 'completed') {
        navigate(`/mentalhealth/confirmation?bookingId=${paymentDetails.bookingId}`);
        return;
      } else if (response.data.status === 'failed') {
        throw new Error('UPI payment failed');
      }
      
      attempts++;
    }

    throw new Error('Payment timeout. Please check payment status later.');
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => setError(null)}
                className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
              >
                Try Again
              </button>
              <Link
                to="/mentalhealth"
                className="block w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    { id: 'razorpay', label: 'Credit/Debit Card', icon: <FaCreditCard />, description: 'Visa, Mastercard, Rupay' },
    { id: 'upi', label: 'UPI', icon: <FaGooglePay />, description: 'Google Pay, PhonePe, Paytm' },
    { id: 'wallet', label: 'Wallet', icon: <FaWallet />, description: 'Pay using your wallet balance' },
    { id: 'paypal', label: 'PayPal', icon: <FaPaypal />, description: 'International payments' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <FaLockOpen className="text-3xl text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Complete Payment</h1>
          <p className="text-gray-600 mt-2">Secure payment for your therapy session</p>
        </motion.div>

        {/* Payment Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="font-semibold text-gray-800 text-lg mb-4">Payment Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Consultation Fee</span>
              <span className="font-medium">₹{paymentDetails.amount}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Platform Fee</span>
              <span className="font-medium">₹0</span>
            </div>
            <div className="flex justify-between py-2 font-bold">
              <span className="text-gray-800">Total Amount</span>
              <span className="text-2xl text-purple-600">₹{paymentDetails.amount}</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="font-semibold text-gray-800 text-lg mb-4">Select Payment Method</h2>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${
                  selectedMethod === method.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="hidden"
                />
                <div className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedMethod === method.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {method.icon}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-800">{method.label}</p>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                </div>
                {selectedMethod === method.id && (
                  <FaCheckCircle className="text-purple-500 text-xl" />
                )}
              </label>
            ))}
          </div>
        </motion.div>

        {/* Security & Trust */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-6"
        >
          <span className="flex items-center gap-2">
            <FaLock className="text-green-500" /> Secure Payment
          </span>
          <span className="flex items-center gap-2">
            <FaShieldAlt className="text-blue-500" /> 256-bit SSL
          </span>
        </motion.div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handlePayment}
          disabled={isProcessing || !paymentDetails}
          className={`w-full py-4 rounded-xl font-semibold text-white transition flex items-center justify-center ${
            isProcessing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          }`}
        >
          {isProcessing ? (
            <>
              <FaSpinner className="animate-spin mr-3" />
              Processing...
            </>
          ) : (
            `Pay ₹${paymentDetails.amount} Securely`
          )}
        </motion.button>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            to={`/mentalhealth/book/${paymentDetails.bookingId}`}
            className="text-gray-500 hover:text-gray-700 transition flex items-center justify-center gap-2"
          >
            <FaArrowLeft /> Back to Booking
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthPayment;
