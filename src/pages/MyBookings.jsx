import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [phone, setPhone] = useState('');
  const [insurancePolicies, setInsurancePolicies] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showInsurance, setShowInsurance] = useState(false);

  // 🆕 New states for cancel & review
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    review: '',
    doctorRating: 5,
    staffRating: 5,
    cleanlinessRating: 5,
    waitTimeRating: 5
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  
  const [actionMessage, setActionMessage] = useState('');

  const [selectedBookings, setSelectedBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

	const toggleSelect = (bookingId) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId) 
        : [...prev, bookingId]
    );
  };

    const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to view your bookings');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        'https://hospital-backend-production-7d0f.up.railway.app/api/ambulance/my-bookings?limit=100&page=1',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(response.data?.data || response.data || []);
      setSearched(true);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
    setLoading(false);
  };

  // 🆕 Handle cancel booking
  const handleCancelBooking = (booking) => {
    setCancellingId(booking.bookingId);
    setCancelReason('');
    setShowCancelModal(true);
  };

  // 🆕 Confirm cancel
    const confirmCancel = async () => {
    setCancelLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `https://hospital-backend-production-7d0f.up.railway.app/api/ambulance/cancel-booking/${cancellingId}`,
        { reason: cancelReason || 'Cancelled by patient' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const refundInfo = res.data.data;
        setActionMessage(`✅ Booking cancelled! Refund: ₹${refundInfo?.refundAmount || 0} (${refundInfo?.refundPercentage || 0}%)`);
        
        // Refresh bookings using token
        const response = await axios.get(
          'https://hospital-backend-production-7d0f.up.railway.app/api/ambulance/my-bookings',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBookings(response.data?.data || response.data || []);
      }
      
      setShowCancelModal(false);
      setTimeout(() => setActionMessage(''), 5000);
    } catch (error) {
      alert(error.response?.data?.message || 'Cancellation failed');
    }
    setCancelLoading(false);
  };

  // 🆕 Handle open review modal
  const handleOpenReview = (booking) => {
    setSelectedBooking(booking);
    setReviewData({
      rating: 5,
      review: '',
      doctorRating: 5,
      staffRating: 5,
      cleanlinessRating: 5,
      waitTimeRating: 5
    });
    setShowReviewModal(true);
  };

  // 🆕 Submit review
  const submitReview = async () => {
    setReviewLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.post(
        `https://hospital-backend-production-7d0f.up.railway.app/api/ambulance/rate-trip/${selectedBooking.bookingId}`,
        {
          rating: reviewData.rating,
          review: reviewData.review,
          waitTimeRating: reviewData.waitTimeRating,
          valueForMoneyRating: reviewData.valueForMoneyRating
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setActionMessage(`✅ Rating submitted! Driver rating: ${res.data.data.driverAvgRating} ⭐`);
        fetchBookings();
      }

      setShowReviewModal(false);
      setTimeout(() => setActionMessage(''), 5000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
    setReviewLoading(false);
  };

  // 🆕 Check if booking can be cancelled
  const canCancel = (booking) => {
    const cancelableStatuses = ['pending', 'confirmed'];
    return cancelableStatuses.includes(booking.status) && booking.paymentStatus !== 'refunded';
  };

  // 🆕 Check if booking can be reviewed
  const canReview = (booking) => {
    return booking.status === 'completed' && !booking.review?.submittedAt;
  };

  // 🆕 Get refund eligibility text
  const getRefundInfo = (booking) => {
    if (!booking.appointmentDate) return null;
    const now = new Date();
    const appointmentTime = new Date(booking.appointmentDate);
    const hoursBefore = (appointmentTime - now) / (1000 * 60 * 60);
    
    if (hoursBefore > 24) return { text: '90% refund', color: '#10b981' };
    if (hoursBefore > 6) return { text: '50% refund', color: '#f59e0b' };
    if (hoursBefore > 2) return { text: '25% refund', color: '#f97316' };
    return { text: 'No refund', color: '#ef4444' };
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return '#10b981';
      case 'sample_collected': return '#8b5cf6';
      case 'processing': return '#3b82f6';
      case 'report_ready': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'policy_issued': return '#2563eb';
      case 'active': return '#10b981';
      case 'expired': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'confirmed': return 'Confirmed';
      case 'sample_collected': return 'Sample Collected';
      case 'processing': return 'Processing';
      case 'report_ready': return 'Report Ready';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'policy_issued': return 'Policy Issued';
      case 'active': return 'Active';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const getBookingTypeIcon = (type) => {
    switch(type) {
      case 'opd': return '🏥';
      case 'admission': return '🛏️';
      case 'ambulance': return '🚑';
      case 'labtest': return '🔬';
      case 'caregiver': return '🏠';
      case 'ayurveda_consultation': return '🧘';
      case 'homeopathy_consult': return '🌿';
      case 'homeopathy_medicine': return '💊';
      case 'insurance': return '🛡️';
      default: return '📋';
    }
  };

  const getBookingTypeLabel = (type) => {
    switch(type) {
      case 'opd': return 'OPD Consultation';
      case 'admission': return 'Hospital Admission';
      case 'ambulance': return 'Ambulance';
      case 'labtest': return 'Lab Test';
      case 'caregiver': return 'Caregiver';
      case 'ayurveda_consultation': return 'Ayurveda Consult';
      case 'homeopathy_consult': return 'Homeopathy Consult';
      case 'homeopathy_medicine': return 'Medicine Order';
      case 'insurance': return 'Insurance';
      default: return 'Booking';
    }
  };

  const viewTimeline = async (booking) => {
    setSelectedBooking(booking);
    setShowTimeline(true);
  };

  const handleRenewPolicy = (policyId) => {
    navigate(`/insurance/renew/${policyId}`);
  };

  const handleViewPolicy = (policyId) => {
    navigate(`/insurance/my-policies/${policyId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Star rating component
  const StarRating = ({ value, onChange, label }) => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem', fontSize: '0.875rem' }}>{label}</label>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => onChange && onChange(star)}
            style={{ 
              fontSize: '1.5rem', 
              cursor: onChange ? 'pointer' : 'default',
              color: star <= value ? '#f59e0b' : '#d1d5db'
            }}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );

  const filteredBookings = selectedType === 'all' 
    ? bookings 
    : bookings.filter(b => b.bookingType === selectedType);

  const labBookings = bookings.filter(b => b.bookingType === 'labtest');
  const hospitalBookings = bookings.filter(b => b.bookingType === 'opd' || b.bookingType === 'admission');
  const ambulanceBookings = bookings.filter(b => b.bookingType === 'ambulance');
  const insuranceBookings = bookings.filter(b => b.bookingType === 'insurance');
  const totalInsurancePolicies = insurancePolicies.length || insuranceBookings.length;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '5px' }}>📋 My Bookings</h1>
	      <button 
        onClick={async () => {
          if (confirm('Delete all cancelled bookings older than 30 days?')) {
            try {
              const token = localStorage.getItem('token');
              const res = await axios.post('https://hospital-backend-production-7d0f.up.railway.app/api/ambulance/cleanup-bookings', 
                { days: 30, status: 'cancelled' },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              alert(res.data?.message || 'Cleanup done');
              fetchBookings();
            } catch (e) { alert('Cleanup failed'); }
          }
        }}
        style={{ padding: '8px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, float: 'right' }}
      >
        🗑️ Delete Old Cancelled
      </button>
	      {selectedBookings.length > 0 && (
        <button 
          onClick={async () => {
            if (confirm(`Delete ${selectedBookings.length} selected bookings?`)) {
              try {
                const token = localStorage.getItem('token');
                await axios.post('https://hospital-backend-production-7d0f.up.railway.app/api/ambulance/delete-bookings', 
                  { bookingIds: selectedBookings },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                setSelectedBookings([]);
                fetchBookings();
              } catch (e) { alert('Delete failed'); }
            }
          }}
          style={{ padding: '8px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, float: 'right', marginLeft: 10 }}
        >
          🗑️ Delete Selected ({selectedBookings.length})
        </button>
      )}
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>View, cancel, and review all your bookings</p>
      
      {/* 🆕 Action Message */}
      {actionMessage && (
        <div style={{ 
          backgroundColor: actionMessage.includes('✅') ? '#d1fae5' : '#fee2e2',
          color: actionMessage.includes('✅') ? '#065f46' : '#dc2626',
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          {actionMessage}
        </div>
      )}

      <form onSubmit={fetchBookings} style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '16px' }}
            required
          />
          <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? 'Searching...' : 'View My Bookings'}
          </button>
        </div>
      </form>
      
      {searched && (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            <div style={{ backgroundColor: '#e0f2fe', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>🏥</div>
              <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{hospitalBookings.length}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Hospital</div>
            </div>
            <div style={{ backgroundColor: '#d1fae5', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>🔬</div>
              <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{labBookings.length}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Lab Tests</div>
            </div>
            <div style={{ backgroundColor: '#fed7aa', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>🚑</div>
              <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{ambulanceBookings.length}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Ambulance</div>
            </div>
            <div style={{ backgroundColor: '#bfdbfe', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '2px solid #2563eb' }}>
              <div style={{ fontSize: '24px' }}>🛡️</div>
              <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{totalInsurancePolicies}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Insurance</div>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setSelectedType('all')} style={{ padding: '8px 16px', backgroundColor: selectedType === 'all' ? '#3b82f6' : 'transparent', color: selectedType === 'all' ? 'white' : '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>All ({bookings.length + totalInsurancePolicies})</button>
            <button onClick={() => setSelectedType('opd')} style={{ padding: '8px 16px', backgroundColor: selectedType === 'opd' ? '#8b5cf6' : 'transparent', color: selectedType === 'opd' ? 'white' : '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>🏥 Hospital ({hospitalBookings.length})</button>
            <button onClick={() => setSelectedType('labtest')} style={{ padding: '8px 16px', backgroundColor: selectedType === 'labtest' ? '#10b981' : 'transparent', color: selectedType === 'labtest' ? 'white' : '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>🔬 Lab ({labBookings.length})</button>
            <button onClick={() => setSelectedType('ambulance')} style={{ padding: '8px 16px', backgroundColor: selectedType === 'ambulance' ? '#f59e0b' : 'transparent', color: selectedType === 'ambulance' ? 'white' : '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>🚑 Ambulance ({ambulanceBookings.length})</button>
            <button onClick={() => setSelectedType('insurance')} style={{ padding: '8px 16px', backgroundColor: selectedType === 'insurance' ? '#2563eb' : 'transparent', color: selectedType === 'insurance' ? 'white' : '#333', border: selectedType === 'insurance' ? 'none' : '1px solid #2563eb', borderRadius: '20px', cursor: 'pointer' }}>🛡️ Insurance ({totalInsurancePolicies})</button>
          </div>
          
          {/* Insurance Section (PRESERVED) */}
          {(selectedType === 'all' || selectedType === 'insurance') && insurancePolicies.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                <span>🛡️</span> My Insurance Policies
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {insurancePolicies.map((policy) => (
                  <div key={policy._id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${policy.status === 'active' ? '#10b981' : '#f59e0b'}`, border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '20px' }}>🛡️</span>
                        <strong style={{ fontSize: '16px' }}>{policy.policyName || 'Insurance Policy'}</strong>
                        <span style={{ padding: '2px 10px', borderRadius: '12px', backgroundColor: getStatusColor(policy.status), color: 'white', fontSize: '11px', fontWeight: 'bold', marginLeft: '8px' }}>{getStatusText(policy.status)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleViewPolicy(policy._id)} style={{ padding: '6px 14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>View</button>
                        {policy.status === 'active' && <button onClick={() => handleRenewPolicy(policy._id)} style={{ padding: '6px 14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Renew</button>}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                      <div><div style={{ fontSize: '11px', color: '#6b7280' }}>Sum Insured</div><div style={{ fontWeight: 'bold' }}>{formatCurrency(policy.sumInsured || 0)}</div></div>
                      <div><div style={{ fontSize: '11px', color: '#6b7280' }}>Premium</div><div style={{ fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(policy.premiumAmount || 0)}</div></div>
                      <div><div style={{ fontSize: '11px', color: '#6b7280' }}>Valid Till</div><div style={{ fontWeight: 'bold' }}>{policy.endDate ? new Date(policy.endDate).toLocaleDateString() : 'N/A'}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Bookings List */}
          {filteredBookings.length === 0 && selectedType !== 'insurance' ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '10px' }}>
              <p>No bookings found for this category.</p>
            </div>
          ) : filteredBookings.length > 0 && selectedType !== 'insurance' ? (
            <div>
              {filteredBookings.map(booking => {
                const refundInfo = getRefundInfo(booking);
                const isCancellable = canCancel(booking);
                const isReviewable = canReview(booking);
                
                return (
                <div key={booking._id} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '15px', marginBottom: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${getStatusColor(booking.status)}` }}>
	              
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '20px', marginRight: '8px' }}>{getBookingTypeIcon(booking.bookingType)}</span>
                      <strong style={{ fontSize: '16px' }}>{getBookingTypeLabel(booking.bookingType)}</strong>
                      {booking.bookingId && <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>ID: {booking.bookingId}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: getStatusColor(booking.status), color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                        {getStatusText(booking.status)}
                      </span>
                      {booking.bookingType === 'labtest' && (
                        <button onClick={() => viewTimeline(booking)} style={{ padding: '4px 8px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>
                          Track
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    {/* Booking details based on type */}
                    {booking.bookingType === 'labtest' ? (
                      <>
                        <p><strong>🔬 Lab:</strong> {booking.providerName}</p>
                        <p><strong>🧪 Tests:</strong> {booking.tests?.join(', ')}</p>
                        <p><strong>💰 Amount:</strong> ₹{booking.finalAmount}</p>
                        {booking.homeCollectionRequested && <p><strong>🏠 Home Collection:</strong> Yes</p>}
                      </>
                                        ) : booking.bookingType === 'ambulance' ? (
                      <>
                        <p><strong>🚑 Type:</strong> {booking.ambulanceType}</p>
                        <p><strong>📍 Pickup:</strong> {booking.pickupAddress}</p>
                        <p><strong>📍 Drop:</strong> {booking.dropAddress}</p>
                        <p><strong>💰 Amount:</strong> ₹{booking.finalAmount}</p>
                        {booking.driverName && <p><strong>🚑 Driver:</strong> {booking.driverName}</p>}
                        {booking.driverPhone && <p><strong>📞 Contact:</strong> {booking.driverPhone}</p>}
                        {booking.vehicleNumber && <p><strong>🚐 Vehicle:</strong> {booking.vehicleNumber}</p>}
                        {booking.tripOtp && (
                          <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#d1fae5', borderRadius: '6px', textAlign: 'center' }}>
                            <p style={{ fontSize: '12px', margin: '0 0 3px', color: '#065f46' }}>Share this OTP with driver:</p>
                            <strong style={{ fontSize: '20px', letterSpacing: '5px', color: '#065f46' }}>{booking.tripOtp}</strong>
                          </div>
                        )}
                      </>
                    ) : booking.bookingType === 'insurance' ? (
                      <>
                        <p><strong>🛡️ Insurance:</strong> {booking.insuranceCompanyName}</p>
                        <p><strong>📋 Plan:</strong> {booking.insurancePlanName}</p>
                        <p><strong>💰 Premium:</strong> ₹{booking.premiumAmount}</p>
                      </>
                    ) : (
                      <>
                        {booking.hospitalName && <p><strong>🏥 Hospital:</strong> {booking.hospitalName}</p>}
                        {booking.doctorName && <p><strong>👨‍⚕️ Doctor:</strong> {booking.doctorName}</p>}
                        {booking.timeSlot && <p><strong>⏰ Time:</strong> {booking.timeSlot}</p>}
                        {booking.roomType && <p><strong>🛏️ Room:</strong> {booking.roomType}</p>}
                        <p><strong>💰 Amount:</strong> ₹{booking.finalAmount}</p>
                        {booking.discount > 0 && <p><strong>🎉 Discount:</strong> ₹{booking.discount}</p>}
                      </>
                    )}
                    <p><strong>📅 Date:</strong> {new Date(booking.appointmentDate || booking.bookingDate).toLocaleDateString()}</p>
                    <p><strong>👤 Patient:</strong> {booking.patientName} ({booking.patientAge} yrs, {booking.patientGender})</p>
                    <p><strong>📞 Phone:</strong> {booking.patientPhone}</p>
                    {booking.paymentStatus && (
                      <p><strong>💳 Payment:</strong> <span style={{ color: booking.paymentStatus === 'paid' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{booking.paymentStatus.toUpperCase()}</span></p>
                    )}
                    
                    {/* 🆕 Review display */}
                    {booking.review?.submittedAt && (
                      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                        <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>⭐ Your Review</p>
                        <p style={{ margin: '0', fontSize: '14px' }}>"{booking.review.review}"</p>
                        <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                          <span>⭐ {booking.review.rating}/5</span>
                          {booking.review.doctorRating > 0 && <span>👨‍⚕️ {booking.review.doctorRating}/5</span>}
                        </div>
                      </div>
                    )}
                    
                                        {/* 🆕 Cancellation info */}
                    {booking.status === 'cancelled' && booking.cancellation && (
                      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                        <p style={{ fontWeight: 'bold', margin: '0 0 5px 0', color: '#dc2626' }}>❌ Cancelled</p>
                        <p style={{ margin: '0', fontSize: '13px' }}>Reason: {booking.cancellation.reason || 'N/A'}</p>
                        {booking.cancellation.refundAmount > 0 && (
                          <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#10b981' }}>
                            💰 Refund: ₹{booking.cancellation.refundAmount} ({booking.cancellation.refundPercentage}%)
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 🆕 Delete checkbox for cancelled bookings */}
                  {booking.status === 'cancelled' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0f0f0' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedBookings.includes(booking.bookingId)}
                        onChange={() => toggleSelect(booking.bookingId)}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12, color: '#666' }}>Select to delete permanently</span>
                    </div>
                  )}

                  {/* 🆕 Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
                    {isCancellable && (
                      <button
                        onClick={() => handleCancelBooking(booking)}
                        style={{ padding: '6px 14px', backgroundColor: '#fff', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        ❌ Cancel Booking
                      </button>
                    )}
                    {isReviewable && (
                      <button
                        onClick={() => handleOpenReview(booking)}
                        style={{ padding: '6px 14px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        ⭐ Write Review
                      </button>
                    )}
                    {isCancellable && refundInfo && (
                      <span style={{ fontSize: '11px', color: refundInfo.color, alignSelf: 'center' }}>
                        {refundInfo.text} if cancelled now
                      </span>
                    )}
                  </div>
                </div>
              )})}
            </div>
          ) : null}
        </>
      )}

      {/* Timeline Modal (PRESERVED) */}
      {showTimeline && selectedBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1002, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '15px' }}>Booking Status Timeline</h3>
            <p><strong>Booking ID:</strong> {selectedBooking.bookingId}</p>
            <div style={{ marginTop: '15px' }}>
              {(selectedBooking.statusHistory || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', marginBottom: '15px', paddingLeft: idx === 0 ? '0' : '20px', borderLeft: idx === 0 ? 'none' : '2px solid #e5e7eb' }}>
                  <div style={{ minWidth: '100px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold', color: getStatusColor(item.status) }}>{getStatusText(item.status)}</span>
                    {item.note && <p style={{ fontSize: '12px', color: '#6b7280', margin: '5px 0 0 0' }}>{item.note}</p>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowTimeline(false)} style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }}>Close</button>
          </div>
        </div>
      )}

      {/* 🆕 Cancel Modal */}
      {showCancelModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1003, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '450px', width: '90%' }}>
            <h3 style={{ marginBottom: '10px' }}>❌ Cancel Booking</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px' }}>
              Are you sure you want to cancel booking <strong>{cancellingId}</strong>?
            </p>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px', fontSize: '14px' }}>Reason (optional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Why are you cancelling?"
                rows="3"
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{ flex: 1, padding: '10px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelLoading}
                style={{ flex: 1, padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: cancelLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 Review Modal */}
      {showReviewModal && selectedBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1004, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '5px' }}>⭐ Write a Review</h3>
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '15px' }}>
              {selectedBooking.hospitalName && `Hospital: ${selectedBooking.hospitalName}`}
              {selectedBooking.doctorName && ` • Doctor: ${selectedBooking.doctorName}`}
            </p>

            <StarRating label="Overall Rating" value={reviewData.rating} onChange={(val) => setReviewData({...reviewData, rating: val})} />
            <StarRating label="Doctor Rating" value={reviewData.doctorRating} onChange={(val) => setReviewData({...reviewData, doctorRating: val})} />
            <StarRating label="Staff Behavior" value={reviewData.staffRating} onChange={(val) => setReviewData({...reviewData, staffRating: val})} />
            <StarRating label="Cleanliness" value={reviewData.cleanlinessRating} onChange={(val) => setReviewData({...reviewData, cleanlinessRating: val})} />
            <StarRating label="Wait Time" value={reviewData.waitTimeRating} onChange={(val) => setReviewData({...reviewData, waitTimeRating: val})} />

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px', fontSize: '14px' }}>Your Review</label>
              <textarea
                value={reviewData.review}
                onChange={(e) => setReviewData({...reviewData, review: e.target.value})}
                placeholder="Share your experience..."
                rows="4"
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowReviewModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancel
              </button>
              <button onClick={submitReview} disabled={reviewLoading} style={{ flex: 1, padding: '10px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: reviewLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                {reviewLoading ? 'Submitting...' : 'Submit Review ⭐'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;

