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
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [medicineCart, setMedicineCart] = useState([]);
  
    const { lender } = useLender();

  // Check for loan data from session storage
  useEffect(() => {
    const storedLoan = sessionStorage.getItem('healthEmiLoan');
    const storedMedicines = sessionStorage.getItem('homeopathyMedicineCart');
    if (storedMedicines && bookingType === 'homeopathy_medicine') {
      try { setMedicineCart(JSON.parse(storedMedicines)); } catch { sessionStorage.removeItem('homeopathyMedicineCart'); }
    }
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
    if (bookingType === 'homeopathy_medicine' && !deliveryAddress.trim()) {
      alert('Please enter a delivery address.');
      return;
    }
    setLoading(true);

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert('Failed to load payment gateway. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const bookingId = queryParams.get('bookingId') || '';
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      let order;
      let key_id;
      let insurancePayment = false;
      const existingOrderId = queryParams.get('orderId');
      if (bookingType === 'insurance') {
        if (!bookingId || !existingOrderId) throw new Error('Insurance payment order is missing. Please restart the application.');
        const keyResponse = await api.get('/insurance/health');
        key_id = keyResponse.data?.data?.razorpayKey || undefined;
        // The secure public key is returned by the insurance application response; use the stored value when available.
        key_id = key_id || localStorage.getItem('razorpayKey');
        if (!key_id) throw new Error('Payment gateway configuration is unavailable');
        order = { id: existingOrderId, amount: Math.round(Number(amountParam) * 100), currency: 'INR' };
        insurancePayment = true;
      } else {
        const orderRes = await api.post('/payment/create-order', {
          amount: parseInt(amountParam),
          currency: 'INR',
          bookingId,
          bookingType,
          patientName: userData.name || 'Patient',
          patientPhone: userData.phone || '',
          patientEmail: userData.email || '',
          userId: userData.id || '',
          medicines: medicineCart.map(item => ({ medicineId: item._id || item.id, name: item.name, potency: item.potency, quantity: 1, price: Number(item.price || 0), pharmacyId: item.pharmacyId })),
          deliveryAddress: bookingType === 'homeopathy_medicine' ? deliveryAddress.trim() : ''
        });
        if (!orderRes.data?.success) throw new Error(orderRes.data?.message || 'Failed to create order');
        ({ order, key_id } = orderRes.data);
      }

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'HospitalHub',
        description: `${bookingType.toUpperCase()} Booking - ${hospitalName}`,
        order_id: order.id,
        handler: async function(response) {
          setLoading(true);
          try {
            const verifyRes = insurancePayment
              ? await api.post('/insurance/verify-payment', { bookingId, orderId: response.razorpay_order_id, paymentId: response.razorpay_payment_id, signature: response.razorpay_signature })
              : await api.post('/payment/verify', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingId: queryParams.get('bookingId') || '', bookingType,
                  patientName: userData.name || 'Patient', patientPhone: userData.phone || '', patientEmail: userData.email || '', userId: userData.id || 'guest',
                  totalAmount: parseInt(amountParam), finalAmount: parseInt(amountParam),
                  medicines: medicineCart.map(item => ({ medicineId: item._id || item.id, name: item.name, potency: item.potency, quantity: 1, price: Number(item.price || 0), pharmacyId: item.pharmacyId })),
                  deliveryAddress: bookingType === 'homeopathy_medicine' ? deliveryAddress.trim() : ''
                });

            if (verifyRes.data?.success) {
              alert('✅ Payment successful! Booking confirmed.');
              sessionStorage.removeItem('homeopathyMedicineCart');
              navigate('/my-bookings');
            } else {
              throw new Error(verifyRes.data?.message || 'Verification failed');
            }
          } catch (verifyError) {
            console.error('Verify error:', verifyError);
            alert('Payment verification failed. Please contact support.');
          }
          setLoading(false);
        },
        prefill: {
          name: userData.name || 'Patient',
          email: userData.email || '',
          contact: (userData.phone || '').replace('+91', '')
        },
        theme: {
          color: '#e53935'
        },
        modal: {
          ondismiss: () => {
            alert('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoanPayment = () => {
    if (!loanData?.applicationId) {
      alert('A valid loan application is required. No payment or approval was created.');
      return;
    }
    sessionStorage.removeItem('healthEmiLoan');
    navigate('/financing');
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
        
        {bookingType === 'homeopathy_medicine' && paymentMethod === 'direct' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Delivery Address</label>
            <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} rows={3} required placeholder="Enter complete delivery address" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
        )}

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

