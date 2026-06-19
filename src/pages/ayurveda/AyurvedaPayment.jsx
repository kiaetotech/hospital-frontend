import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const AyurvedaPayment = () => {
  const { bookingType, bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [processing, setProcessing] = useState(false);

  const amount = bookingData.amount || bookingData.fee || 500;
  const commission = bookingData.commission || amount * 0.15;

  const handlePayment = async () => {
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      navigate(`/ayurveda/confirmation/${bookingId}`, {
        state: {
          ...bookingData,
          paymentStatus: 'success',
          paymentMethod,
          transactionId: 'TXN' + Date.now(),
          paidAt: new Date().toISOString()
        }
      });
    }, 2000);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b' }}>
        💳 Payment
      </h2>

      {/* Amount Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>Total Amount</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#FF9800' }}>
          ₹{amount.toLocaleString()}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Platform fee: ₹{commission.toLocaleString()} ({(commission/amount*100).toFixed(0)}%)
        </p>
      </div>

      {/* Payment Methods */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>Select Payment Method</h3>
        {[
          { id: 'online', label: '💳 Online Payment', desc: 'UPI, Credit/Debit Card, NetBanking' },
          { id: 'cod', label: '🏥 Pay at Center', desc: 'Pay when you arrive' },
        ].map(method => (
          <div
            key={method.id}
            onClick={() => setPaymentMethod(method.id)}
            style={{
              padding: '1rem',
              marginBottom: '0.5rem',
              borderRadius: '0.5rem',
              border: `2px solid ${paymentMethod === method.id ? '#FF9800' : '#e2e8f0'}`,
              cursor: 'pointer',
              backgroundColor: paymentMethod === method.id ? '#FFF3E0' : 'white'
            }}
          >
            <p style={{ fontWeight: 'bold' }}>{method.label}</p>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{method.desc}</p>
          </div>
        ))}
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={processing}
        style={{
          width: '100%',
          padding: '1rem',
          backgroundColor: processing ? '#e2e8f0' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          cursor: processing ? 'not-allowed' : 'pointer'
        }}
      >
        {processing ? '⏳ Processing...' : `💳 Pay ₹${amount.toLocaleString()}`}
      </button>
    </div>
  );
};

export default AyurvedaPayment;