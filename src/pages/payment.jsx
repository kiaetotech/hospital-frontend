import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useLender } from '../contexts/LenderContext';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const amountParam = queryParams.get('amount') || '500';
  const bookingType = queryParams.get('type') || 'opd';
  const hospitalName = queryParams.get('hospital') || 'Hospital';
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('direct'); // 'direct' or 'loan'
  const [loanData, setLoanData] = useState(null);
  
    const { lender } = useLender();

  // Check for loan data from session storage
  useEffect(() => {
    const storedLoan = sessionStorage.getItem('healthEmiLoan');
    if (storedLoan) {
      const loan = JSON.parse(storedLoan);
      setLoanData(loan);
      setPaymentMethod('loan');
    }
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDirectPayment = async () => {
    setLoading(true);
    
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert('Failed to load payment gateway. Please try again.');
      setLoading(false);
      return;
    }
    
    try {
      const orderRes = await api.post('/payment/create-order', {
        amount: parseInt(amountParam),
        currency: 'INR',
        receipt: `${bookingType}_${Date.now()}`
      });
      
      const { order } = orderRes.data;
      
      const options = {
        key: orderRes.data.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'KiaetoCare',
        description: `${bookingType.toUpperCase()} Booking - ${hospitalName}`,
        order_id: order.id,
        handler: function(response) {
          api.post('/payment/verify', {
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

  const handleLoanPayment = () => {
    if (!loanData) {
      alert('Loan application not found. Please apply for loan again.');
      return;
    }
    
    // Mock loan disbursal
    setLoading(true);
    
    // Simulate API call for loan confirmation
    setTimeout(() => {
      // Store booking with loan info
      const bookingRecord = {
        id: `BOOK_${Date.now()}`,
        type: bookingType,
        hospital: hospitalName,
        amount: amountParam,
        paymentMethod: 'loan',
        loanDetails: loanData,
        date: new Date().toISOString()
      };
      
      const existingBookings = JSON.parse(localStorage.getItem('kiaeto_bookings') || '[]');
      existingBookings.push(bookingRecord);
      localStorage.setItem('kiaeto_bookings', JSON.stringify(existingBookings));
      
      // Clear loan data from session
      sessionStorage.removeItem('healthEmiLoan');
      
      alert(`✅ Loan Approved!\n\nLender: ${loanData.lender}\nLoan Amount: ₹${loanData.amount}\nEMI: ₹${loanData.emi}/month for ${loanData.tenure} months\n\nHospital will confirm your booking.`);
      navigate('/my-bookings');
      setLoading(false);
    }, 1500);
  };

  const handlePayment = () => {
    if (paymentMethod === 'direct') {
      handleDirectPayment();
    } else {
      handleLoanPayment();
    }
  };

  // Calculate discounted amount for loan (if any)
  const displayAmount = paymentMethod === 'loan' && loanData 
    ? loanData.amount 
    : parseInt(amountParam);
    
  const discountText = paymentMethod === 'loan' && loanData 
    ? '✨ 0% EMI (Loan option selected)'
    : '✨ 10% discount applied';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Payment Details</h2>
        
        {/* Payment Method Toggle */}
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
          <button
            onClick={() => setPaymentMethod('direct')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: paymentMethod === 'direct' ? '2px solid #10b981' : '1px solid #e5e7eb',
              backgroundColor: paymentMethod === 'direct' ? '#ecfdf5' : 'white',
              cursor: 'pointer',
              flex: 1
            }}
          >
            💳 Direct Payment
          </button>
          <button
            onClick={() => {
              if (!loanData) {
                alert('Please apply for Health EMI from the hospital or diagnostics page first.');
                return;
              }
              setPaymentMethod('loan');
            }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: paymentMethod === 'loan' ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
              backgroundColor: paymentMethod === 'loan' ? '#f3e8ff' : 'white',
              cursor: loanData ? 'pointer' : 'not-allowed',
              opacity: loanData ? 1 : 0.5,
              flex: 1
            }}
            disabled={!loanData}
          >
            💳 Health EMI (Loan)
          </button>
        </div>
        
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
          <p><strong>Hospital:</strong> {hospitalName}</p>
          <p><strong>Booking Type:</strong> {bookingType.toUpperCase()}</p>
          {paymentMethod === 'loan' && loanData ? (
            <>
              <p><strong>Loan Amount:</strong> ₹{loanData.amount.toLocaleString()}</p>
              <p><strong>Lender:</strong> {loanData.lender}</p>
              <p><strong>EMI:</strong> ₹{loanData.emi}/month for {loanData.tenure} months</p>
              <p><strong>Interest Rate:</strong> {loanData.interestRate}% p.a.</p>
            </>
          ) : (
            <p><strong>Amount:</strong> ₹{amountParam}</p>
          )}
          <p style={{ fontSize: '0.875rem', color: paymentMethod === 'loan' ? '#8b5cf6' : '#10b981' }}>
            {discountText}
          </p>
        </div>
        
        {paymentMethod === 'loan' && !loanData && (
          <div style={{ backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
            ⚠️ No loan application found. Please go back and apply for Health EMI.
          </div>
        )}
        
        <button
          onClick={handlePayment}
          disabled={loading || (paymentMethod === 'loan' && !loanData)}
          style={{
            width: '100%',
            backgroundColor: paymentMethod === 'loan' ? '#8b5cf6' : '#10b981',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontWeight: 'bold',
            cursor: (loading || (paymentMethod === 'loan' && !loanData)) ? 'not-allowed' : 'pointer',
            opacity: (loading || (paymentMethod === 'loan' && !loanData)) ? 0.7 : 1
          }}
        >
          {loading ? 'Processing...' : (
            paymentMethod === 'loan' 
              ? `Confirm Loan & Book (EMI ₹${loanData?.emi || 0}/month)`
              : `Pay ₹${amountParam}`
          )}
        </button>
        
        <p style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem' }}>
          {paymentMethod === 'loan' 
            ? 'Lender will pay hospital directly. You pay EMI to lender.' 
            : 'Secure payment via Razorpay'}
        </p>
      </div>
    </div>
  );
};

export default Payment;

