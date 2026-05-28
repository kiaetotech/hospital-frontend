import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const amount = queryParams.get('amount') || '500';
  const bookingType = queryParams.get('type') || 'opd';
  const hospitalName = queryParams.get('hospital') || 'Hospital';
  
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    
    // Load Razorpay script
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert('Failed to load payment gateway. Please try again.');
      setLoading(false);
      return;
    }
    
    try {
      // Create order
      const orderRes = await api.post('/payments/create-order', {
        amount: parseInt(amount),
        currency: 'INR',
        receipt: `${bookingType}_${Date.now()}`
      });
      
      const { order } = orderRes.data;
      
      const options = {
        key: 'rzp_test_xxxxxxxxxxxxx', // Replace with your Razorpay key
        amount: order.amount,
        currency: order.currency,
        name: 'KiaetoCare',
        description: `${bookingType.toUpperCase()} Booking - ${hospitalName}`,
        order_id: order.id,
        handler: function(response) {
          // Verify payment
          api.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          }).then(() => {
            alert('Payment successful! Booking confirmed.');
            navigate('/my-bookings');
          }).catch(() => {
            alert('Payment verification failed. Please contact support.');
          });
        },
        prefill: {
          name: 'Patient Name',
          email: 'patient@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#10b981'
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Payment Details</h2>
        
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
          <p><strong>Hospital:</strong> {hospitalName}</p>
          <p><strong>Booking Type:</strong> {bookingType.toUpperCase()}</p>
          <p><strong>Amount:</strong> ₹{amount}</p>
          <p style={{ fontSize: '0.875rem', color: '#10b981' }}>✨ 10% discount applied</p>
        </div>
        
        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: '#10b981',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Processing...' : 'Pay ₹' + amount}
        </button>
        
        <p style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem' }}>
          Secure payment via Razorpay
        </p>
      </div>
    </div>
  );
};

export default Payment;
