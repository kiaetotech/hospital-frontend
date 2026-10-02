import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API = 'https://hospital-backend-production-e2cf.up.railway.app/api';

// ─── Generic endpoint map per tag ───
// If a route doesn't exist on the backend yet, the request 404s and the UI
// shows a "Coming soon" message. When the backend route lands, no frontend change is needed.
const ENDPOINTS = {
  ambulance: {
    cancelQuote: (id) => ({ method: 'post', url: `${API}/ambulance/cancellation-quote/${id}`, body: {} }),
    cancel: (id, reason) => ({ method: 'put', url: `${API}/ambulance/cancel-booking/${id}`, body: { reason } }),
    review: (id, data) => ({ method: 'post', url: `${API}/ambulance/rate-trip/${id}`, body: { rating: data.rating, review: data.review, waitTimeRating: data.waitTimeRating, valueForMoneyRating: data.valueForMoneyRating } }),
    complaint: (id, data) => ({ method: 'post', url: `${API}/ambulance/complaints`, body: { bookingId: id, ...data } })
  },
  ayurveda: {
    cancelQuote: (id) => ({ method: 'get', url: `${API}/ayurveda/bookings/${id}/cancellation-quote` }),
    cancel: (id, reason) => ({ method: 'put', url: `${API}/ayurveda/bookings/${id}/cancel`, body: { reason } }),
    review: (id, data) => ({ method: 'post', url: `${API}/ayurveda/bookings/${id}/review`, body: { rating: data.rating, comment: data.review } }),
    complaint: (id, data) => ({ method: 'post', url: `${API}/ayurveda/bookings/${id}/complaint`, body: data })
  },
  homeopathy: {
    cancelQuote: (id) => ({ method: 'get', url: `${API}/homeopathy/bookings/${id}/cancellation-quote` }),
    cancel: (id, reason) => ({ method: 'put', url: `${API}/homeopathy/bookings/${id}/cancel`, body: { reason } }),
    review: (id, data) => ({ method: 'post', url: `${API}/homeopathy/bookings/${id}/review`, body: { rating: data.rating, comment: data.review } }),
    complaint: (id, data) => ({ method: 'post', url: `${API}/homeopathy/bookings/${id}/complaint`, body: data })
  },
  online_doctor: {
    cancelQuote: (id) => ({ method: 'get', url: `${API}/online-doctor/booking/${id}/cancellation-quote` }),
    cancel: (id, reason) => ({ method: 'put', url: `${API}/online-doctor/booking/${id}/cancel`, body: { reason } }),
    review: (id, data) => ({ method: 'post', url: `${API}/online-doctor/review`, body: { bookingId: id, rating: data.rating, comment: data.review } }),
    complaint: (id, data) => ({ method: 'post', url: `${API}/online-doctor/complaint`, body: { bookingId: id, ...data } })
  },
  mentalhealth: {
    cancelQuote: (id) => ({ method: 'get', url: `${API}/mentalhealth/booking/${id}/cancellation-quote` }),
    cancel: (id, reason) => ({ method: 'put', url: `${API}/mentalhealth/booking/${id}/cancel`, body: { reason } }),
    review: (id, data) => ({ method: 'post', url: `${API}/mentalhealth/booking/${id}/review`, body: { rating: data.rating, comment: data.review } }),
    complaint: (id, data) => ({ method: 'post', url: `${API}/mentalhealth/booking/${id}/complaint`, body: data })
  },
  caregiver: {
    cancelQuote: (id) => ({ method: 'get', url: `${API}/caregivers/bookings/${id}/cancellation-quote` }),
    cancel: (id, reason) => ({ method: 'put', url: `${API}/caregivers/bookings/${id}/cancel`, body: { reason } }),
    review: (id, data) => ({ method: 'post', url: `${API}/caregivers/bookings/${id}/review`, body: { rating: data.rating, comment: data.review } }),
    complaint: (id, data) => ({ method: 'post', url: `${API}/caregivers/bookings/${id}/complaint`, body: data })
  }
};

const getTagKey = (booking) => {
  if (!booking) return null;
  if (booking.bookingType === 'ambulance') return 'ambulance';
  if (booking.bookingType === 'ayurveda_consultation') return 'ayurveda';
  if (booking.bookingType === 'homeopathy_consult') return 'homeopathy';
  if (booking.bookingType === 'online_doctor') return 'online_doctor';
  if (booking.bookingType === 'mentalhealth') return 'mentalhealth';
  if (booking.bookingType === 'caregiver') return 'caregiver';
  return null;
};

const notSupported = () => {
  alert('This feature is coming soon for this service. Please contact support if you need help now.');
};

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

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5, review: '', doctorRating: 5, staffRating: 5, cleanlinessRating: 5, waitTimeRating: 5
  });
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintData, setComplaintData] = useState({ category: 'other', description: '', priority: 'medium' });
  const [reviewLoading, setReviewLoading] = useState(false);

  const [actionMessage, setActionMessage] = useState('');
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);

  useEffect(() => { fetchBookings(); }, []);

  const toggleSelect = (bookingId) => {
    setSelectedBookings(prev =>
      prev.includes(bookingId) ? prev.filter(id => id !== bookingId) : [...prev, bookingId]
    );
  };

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) { alert('Please login to view your bookings'); navigate('/login'); return; }
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    // Ambulance
    let ambulanceBookings = [];
    try {
      const r = await axios.get(`${API}/ambulance/my-bookings?limit=100&page=1`, { headers });
      ambulanceBookings = r.data?.data || r.data || [];
    } catch (e) { console.log('No ambulance bookings'); }

    // Ayurveda
    let ayurvedaBookings = [];
    try {
      const r = await axios.get(`${API}/ayurveda/bookings/my-bookings`, { headers });
      ayurvedaBookings = (r.data?.data || []).map(b => ({
        ...b,
        bookingType: 'ayurveda_consultation',
        patientName: b.patient?.name || 'Patient',
        patientPhone: b.patient?.phone || '',
        patientAge: b.patient?.age || null,
        patientGender: b.patient?.gender || '',
        appointmentDate: b.bookingDate,
        doctorName: b.type === 'panchakarma_package' ? (b.centerName || 'Center') : (b.doctorName || 'Ayurveda Doctor'),
        finalAmount: b.finalAmount,
        paymentStatus: b.paymentStatus,
        status: b.status
      }));
    } catch (e) { console.log('No ayurveda bookings'); }

    // Homeopathy
    let homeopathyBookings = [];
    try {
      const r = await axios.get(`${API}/homeopathy/bookings/my-bookings`, { headers });
      homeopathyBookings = (r.data?.data || []).map(b => ({
        ...b,
        bookingType: 'homeopathy_consult',
        patientName: b.patient?.name || 'Patient',
        patientPhone: b.patient?.phone || '',
        patientAge: b.patient?.age || null,
        patientGender: b.patient?.gender || '',
        appointmentDate: b.bookingDate,
        doctorName: b.type === 'naturopathy_center' ? (b.centerName || 'Center')
                  : b.type === 'homeopathy_medicine' ? (b.pharmacyName || 'Pharmacy')
                  : (b.doctorName || 'Homeopathy Doctor'),
        finalAmount: b.finalAmount,
        paymentStatus: b.paymentStatus,
        status: b.status
      }));
    } catch (e) { console.log('No homeopathy bookings'); }

    // Online Doctor
    let onlineDoctorBookings = [];
    try {
      const r = await axios.get(`${API}/online-doctor/my-bookings`, { headers });
      onlineDoctorBookings = (r.data?.data || []).map(b => ({
        ...b,
        bookingType: 'online_doctor',
        patientName: b.patientName || 'Patient',
        patientPhone: b.patientPhone || '',
        appointmentDate: b.appointmentDate,
        doctorName: b.doctorName || 'Online Doctor',
        finalAmount: b.finalAmount || b.amount,
        paymentStatus: b.paymentStatus,
        status: b.status
      }));
    } catch (e) { console.log('No online doctor bookings'); }

    // Mental Health
    let mentalHealthBookings = [];
    try {
      const r = await axios.get(`${API}/mentalhealth/my-bookings`, { headers });
      mentalHealthBookings = (r.data?.data || []).map(b => ({
        ...b,
        bookingType: 'mentalhealth',
        patientName: b.patientName || 'Patient',
        patientPhone: b.patientPhone || '',
        appointmentDate: b.scheduledDate,
        doctorName: b.therapistId?.name || 'Therapist',
        finalAmount: b.amount,
        paymentStatus: b.paymentStatus,
        status: b.status
      }));
    } catch (e) { console.log('No mental health bookings'); }

    // Caregiver
    let caregiverBookings = [];
    try {
      const r = await axios.get(`${API}/caregivers/my-bookings`, { headers });
      caregiverBookings = (r.data?.data || []).map(b => ({
        ...b,
        bookingType: 'caregiver',
        patientName: b.patientName || 'Patient',
        patientPhone: b.patientPhone || '',
        appointmentDate: b.date || b.startDate,
        doctorName: b.caregiverId?.fullName || 'Caregiver',
        finalAmount: b.totalAmount,
        paymentStatus: b.paymentStatus,
        status: b.status
      }));
    } catch (e) { console.log('No caregiver bookings'); }

    setBookings([
      ...ambulanceBookings, ...ayurvedaBookings, ...homeopathyBookings,
      ...onlineDoctorBookings, ...mentalHealthBookings, ...caregiverBookings
    ]);
    setSearched(true);

    try {
      const [ayuC, homeoC] = await Promise.allSettled([
        axios.get(`${API}/ayurveda/bookings/complaints/my`, { headers }),
        axios.get(`${API}/homeopathy/bookings/complaints/my`, { headers })
      ]);
      const all = [];
      if (ayuC.status === 'fulfilled' && ayuC.value.data.success) all.push(...(ayuC.value.data.data || []));
      if (homeoC.status === 'fulfilled' && homeoC.value.data.success) all.push(...(homeoC.value.data.data || []));
      setMyComplaints(all);
    } catch (e) { /* silent */ }

    setLoading(false);
  };

  const handleCancelBooking = (booking) => {
    setCancellingId(booking.bookingId);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    setCancelLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const booking = bookings.find(b => b.bookingId === cancellingId);
      const tag = getTagKey(booking);

      if (!tag || !ENDPOINTS[tag]) { notSupported(); setCancelLoading(false); setShowCancelModal(false); return; }

      const q = ENDPOINTS[tag].cancelQuote(cancellingId);
      let quoteRes;
      try {
        quoteRes = q.method === 'get' ? await axios.get(q.url, { headers }) : await axios.post(q.url, q.body || {}, { headers });
      } catch (e) {
        if (e.response?.status === 404) { notSupported(); setCancelLoading(false); setShowCancelModal(false); return; }
        throw e;
      }

      if (quoteRes.data?.success) {
        const quote = quoteRes.data.data;
        const confirmMsg = `Cancellation Fee: ₹${quote.cancellationFee}\nRefund: ₹${quote.refundAmount}\n\nConfirm cancellation?`;
        if (!window.confirm(confirmMsg)) { setCancelLoading(false); setShowCancelModal(false); return; }
      }

      const c = ENDPOINTS[tag].cancel(cancellingId, cancelReason || 'Cancelled by patient');
      let res;
      try {
        res = c.method === 'get' ? await axios.get(c.url, { headers })
            : c.method === 'put' ? await axios.put(c.url, c.body || {}, { headers })
            : await axios.post(c.url, c.body || {}, { headers });
      } catch (e) {
        if (e.response?.status === 404) { notSupported(); setCancelLoading(false); setShowCancelModal(false); return; }
        throw e;
      }

      if (res.data.success) {
        const ref = res.data.data;
        setActionMessage(`✅ Booking cancelled! Refund: ₹${ref?.refundAmount || 0} (${ref?.refundPercentage || 0}%)`);
        fetchBookings();
      }
      setShowCancelModal(false);
      setTimeout(() => setActionMessage(''), 5000);
    } catch (error) {
      console.error('Cancel error:', error);
      alert(error.response?.data?.message || 'Cancellation failed');
    }
    setCancelLoading(false);
  };

  const handleOpenReview = (booking) => {
    setSelectedBooking(booking);
    setReviewData({ rating: 5, review: '', doctorRating: 5, staffRating: 5, cleanlinessRating: 5, waitTimeRating: 5 });
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    setReviewLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const tag = getTagKey(selectedBooking);

      if (!tag || !ENDPOINTS[tag]) { notSupported(); setReviewLoading(false); setShowReviewModal(false); return; }

      const r = ENDPOINTS[tag].review(selectedBooking.bookingId, {
        rating: reviewData.rating,
        review: reviewData.review,
        waitTimeRating: reviewData.waitTimeRating,
        valueForMoneyRating: reviewData.valueForMoneyRating
      });

      let res;
      try {
        res = await axios.post(r.url, r.body || {}, { headers });
      } catch (e) {
        if (e.response?.status === 404) { notSupported(); setReviewLoading(false); setShowReviewModal(false); return; }
        throw e;
      }

      if (res.data.success) {
        setActionMessage('✅ Rating submitted successfully');
        fetchBookings();
      }
      setShowReviewModal(false);
      setTimeout(() => setActionMessage(''), 5000);
    } catch (error) {
      console.error('Review error:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    }
    setReviewLoading(false);
  };

  const submitComplaint = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const tag = getTagKey(selectedBooking);

      if (!tag || !ENDPOINTS[tag]) { notSupported(); return; }

      const c = ENDPOINTS[tag].complaint(selectedBooking.bookingId, complaintData);
      let res;
      try {
        res = await axios.post(c.url, c.body || {}, { headers });
      } catch (e) {
        if (e.response?.status === 404) { notSupported(); setShowComplaintModal(false); return; }
        throw e;
      }

      if (res.data.success) setActionMessage('✅ Complaint submitted successfully');
      setShowComplaintModal(false);
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit complaint');
    }
  };

  const canCancel = (booking) => ['pending', 'confirmed'].includes(booking.status) && booking.paymentStatus !== 'refunded';
  const canReview = (booking) => booking.status === 'completed' && !booking.review?.submittedAt;

  const getRefundInfo = (booking) => {
    if (!booking.appointmentDate) return null;
    const hoursBefore = (new Date(booking.appointmentDate) - new Date()) / (1000 * 60 * 60);
    if (hoursBefore > 24) return { text: '90% refund', color: '#10b981' };
    if (hoursBefore > 6) return { text: '50% refund', color: '#f59e0b' };
    if (hoursBefore > 2) return { text: '25% refund', color: '#f97316' };
    return { text: 'No refund', color: '#ef4444' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#10b981';
      case 'sample_collected': return '#8b5cf6';
      case 'processing': return '#3b82f6';
      case 'report_ready': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'policy_issued': return '#2563eb';
      case 'active': return '#10b981';
      case 'expired': return '#ef4444';
      case 'in_progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'no_show': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    const map = {
      confirmed: 'Confirmed', sample_collected: 'Sample Collected', processing: 'Processing',
      report_ready: 'Report Ready', completed: 'Completed', cancelled: 'Cancelled',
      policy_issued: 'Policy Issued', active: 'Active', expired: 'Expired',
      in_progress: 'In Progress', pending: 'Pending', no_show: 'No Show'
    };
    return map[status] || status;
  };

  const getBookingTypeIcon = (type) => {
    const map = {
      opd: '🏥', admission: '🛏️', ambulance: '🚑', labtest: '🔬', caregiver: '🏠',
      ayurveda_consultation: '🧘', homeopathy_consult: '🌿', homeopathy_medicine: '💊',
      online_doctor: '🩺', mentalhealth: '🧠', insurance: '🛡️'
    };
    return map[type] || '📋';
  };

  const getBookingTypeLabel = (type) => {
    const map = {
      opd: 'OPD Consultation', admission: 'Hospital Admission', ambulance: 'Ambulance',
      labtest: 'Lab Test', caregiver: 'Caregiver', ayurveda_consultation: 'Ayurveda Consult',
      homeopathy_consult: 'Homeopathy Consult', homeopathy_medicine: 'Medicine Order',
      online_doctor: 'Online Doctor', mentalhealth: 'Mental Health', insurance: 'Insurance'
    };
    return map[type] || 'Booking';
  };

  const viewTimeline = (booking) => { setSelectedBooking(booking); setShowTimeline(true); };
  const handleRenewPolicy = (policyId) => navigate(`/insurance/renew/${policyId}`);
  const handleViewPolicy = (policyId) => navigate(`/insurance/my-policies/${policyId}`);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  const StarRating = ({ value, onChange, label }) => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem', fontSize: '0.875rem' }}>{label}</label>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} onClick={() => onChange && onChange(star)}
            style={{ fontSize: '1.5rem', cursor: onChange ? 'pointer' : 'default', color: star <= value ? '#f59e0b' : '#d1d5db' }}>
            ★
          </span>
        ))}
      </div>
    </div>
  );

  const filteredBookings = selectedType === 'all' ? bookings : bookings.filter(b => b.bookingType === selectedType);
  const labBookings = bookings.filter(b => b.bookingType === 'labtest');
  const hospitalBookings = bookings.filter(b => b.bookingType === 'opd' || b.bookingType === 'admission');
  const ambulanceBookings = bookings.filter(b => b.bookingType === 'ambulance');
  const insuranceBookings = bookings.filter(b => b.bookingType === 'insurance');
  const totalInsurancePolicies = insurancePolicies.length || insuranceBookings.length;
  const ayurvedaCount = bookings.filter(b => b.bookingType === 'ayurveda_consultation').length;
  const homeopathyCount = bookings.filter(b => b.bookingType === 'homeopathy_consult').length;
  const onlineDoctorCount = bookings.filter(b => b.bookingType === 'online_doctor').length;
  const mentalHealthCount = bookings.filter(b => b.bookingType === 'mentalhealth').length;
  const caregiverCount = bookings.filter(b => b.bookingType === 'caregiver').length;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '5px' }}>📋 My Bookings</h1>
      <button
        onClick={async () => {
          if (confirm('Delete all cancelled bookings older than 30 days?')) {
            try {
              const token = localStorage.getItem('token');
              const res = await axios.post(`${API}/ambulance/cleanup-bookings`, { days: 30, status: 'cancelled' }, { headers: { Authorization: `Bearer ${token}` } });
              alert(res.data?.message || 'Cleanup done');
              fetchBookings();
            } catch (e) { alert('Cleanup failed'); }
          }
        }}
        style={{ padding: '8px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, float: 'right' }}
      >🗑️ Delete Old Cancelled</button>
      {selectedBookings.length > 0 && (
        <button
          onClick={async () => {
            if (confirm(`Delete ${selectedBookings.length} selected bookings?`)) {
              try {
                const token = localStorage.getItem('token');
                await axios.post(`${API}/ambulance/delete-bookings`, { bookingIds: selectedBookings }, { headers: { Authorization: `Bearer ${token}` } });
                setSelectedBookings([]);
                fetchBookings();
              } catch (e) { alert('Delete failed'); }
            }
          }}
          style={{ padding: '8px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, float: 'right', marginLeft: 10 }}
        >🗑️ Delete Selected ({selectedBookings.length})</button>
      )}
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>View, cancel, and review all your bookings</p>

      {actionMessage && (
        <div style={{
          backgroundColor: actionMessage.includes('✅') ? '#d1fae5' : '#fee2e2',
          color: actionMessage.includes('✅') ? '#065f46' : '#dc2626',
          padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontWeight: 'bold'
        }}>{actionMessage}</div>
      )}

      <form onSubmit={fetchBookings} style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input type="tel" placeholder="Enter your phone number" value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '16px' }} required />
          <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? 'Searching...' : 'View My Bookings'}
          </button>
        </div>
      </form>

      {searched && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '25px' }}>
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
            <div style={{ backgroundColor: '#d1fae5', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '2px solid #10b981' }}>
              <div style={{ fontSize: '24px' }}>🧘</div>
              <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{ayurvedaCount}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Ayurveda</div>
            </div>
            <div style={{ backgroundColor: '#d1fae5', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '2px solid #059669' }}>
              <div style={{ fontSize: '24px' }}>🌿</div>
              <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{homeopathyCount}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Homeopathy</div>
            </div>
            <div style={{ backgroundColor: '#dbeafe', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '2px solid #2563eb' }}>
              <div style={{ fontSize: '24px' }}>🩺</div>
              <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{onlineDoctorCount}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Online Dr</div>
            </div>
            <div style={{ backgroundColor: '#ede9fe', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '2px solid #7c3aed' }}>
              <div style={{ fontSize: '24px' }}>🧠</div>
              <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{mentalHealthCount}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Mental Health</div>
            </div>
            <div style={{ backgroundColor: '#cffafe', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '2px solid #0891b2' }}>
              <div style={{ fontSize: '24px' }}>🏠</div>
              <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{caregiverCount}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Caregiver</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setSelectedType('all')} style={{ padding: '8px 16px', backgroundColor: selectedType === 'all' ? '#3b82f6' : 'transparent', color: selectedType === 'all' ? 'white' : '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>All ({bookings.length + totalInsurancePolicies})</button>
            <button onClick={() => setSelectedType('opd')} style={{ padding: '8px 16px', backgroundColor: selectedType === 'opd' ? '#8b5cf6' : 'transparent', color: selectedType === 'opd' ? 'white' : '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>🏥 Hospital ({hospitalBookings.length})</button>
            <button onClick={() => setSelectedType('labtest')} style={{ padding: '8px 16px', backgroundColor: selectedType === 'labtest' ? '#10b981' : 'transparent', color: selectedType === 'labtest' ? 'white' : '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>🔬 Lab ({labBookings.length})</button>
            <button onClick={() => setSelectedType('ambulance')} style={{ padding: '8px 16px', backgroundColor: selectedType === 'ambulance' ? '#f59e0b' : 'transparent', color: selectedType === 'ambulance' ? 'white' : '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>🚑 Ambulance ({ambulanceBookings.length})</button>
            <button onClick={() => setSelectedType('insurance')} style={{ padding: '8px 16px', backgroundColor: selectedType === 'insurance' ? '#2563eb' : 'transparent', color: selectedType === 'insurance' ? 'white' : '#333', border: selectedType === 'insurance' ? 'none' : '1px solid #2563eb', borderRadius: '20px', cursor: 'pointer' }}>🛡️ Insurance ({totalInsurancePolicies})</button>
            <button onClick={() => setSelectedType('ayurveda_consultation')} style={{ padding: '8px 16px', backgroundColor: selectedType === 'ayurveda_consultation' ? '#10b981' : 'transparent', color: selectedType === 'ayurveda_consultation' ? 'white' : '#333', border: selectedType === 'ayurveda_consultation' ? 'none' : '1px solid #10b981', borderRadius: '20px', cursor: 'pointer' }}>🧘 Ayurveda ({ayurvedaCount})</button>
            <button onClick={() => setSelectedType('homeopathy_consult')} style={{ padding: '8px 16px', backgroundColor: selectedType === 'homeopathy_consult' ? '#059669' : 'transparent', color: selectedType === 'homeopathy_consult' ? 'white' : '#333', border: selectedType === 'homeopathy_consult' ? 'none' : '1px solid #059669', borderRadius: '20px', cursor: 'pointer' }}>🌿 Homeopathy ({homeopathyCount})</button>
            <button onClick={() => setSelectedType('online_doctor')} style={{ padding: '8px 16px', backgroundColor: selectedType === 'online_doctor' ? '#2563eb' : 'transparent', color: selectedType === 'online_doctor' ? 'white' : '#333', border: selectedType === 'online_doctor' ? 'none' : '1px solid #2563eb', borderRadius: '20px', cursor: 'pointer' }}>🩺 Online Dr ({onlineDoctorCount})</button>
            <button onClick={() => setSelectedType('mentalhealth')} style={{ padding: '8px 16px', backgroundColor: selectedType === 'mentalhealth' ? '#7c3aed' : 'transparent', color: selectedType === 'mentalhealth' ? 'white' : '#333', border: selectedType === 'mentalhealth' ? 'none' : '1px solid #7c3aed', borderRadius: '20px', cursor: 'pointer' }}>🧠 Mental Health ({mentalHealthCount})</button>
            <button onClick={() => setSelectedType('caregiver')} style={{ padding: '8px 16px', backgroundColor: selectedType === 'caregiver' ? '#0891b2' : 'transparent', color: selectedType === 'caregiver' ? 'white' : '#333', border: selectedType === 'caregiver' ? 'none' : '1px solid #0891b2', borderRadius: '20px', cursor: 'pointer' }}>🏠 Caregiver ({caregiverCount})</button>
          </div>

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

          {filteredBookings.length === 0 && selectedType !== 'insurance' ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '10px' }}>
              <p>No bookings found for this category.</p>
            </div>
          ) : filteredBookings.length > 0 && selectedType !== 'insurance' ? (
            <div>
              {filteredBookings.map(booking => {
                const refundInfo = getRefundInfo(booking);
                const isCancellable = canCancel(booking);
                return (
                  <div key={booking._id || booking.bookingId} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '15px', marginBottom: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${getStatusColor(booking.status)}` }}>
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
                          <button onClick={() => viewTimeline(booking)} style={{ padding: '4px 8px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>Track</button>
                        )}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
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
                          {booking.driverPhone && <p><strong>📞 Driver Contact:</strong> {booking.driverPhone}</p>}
                          {booking.vehicleNumber && <p><strong>🚐 Vehicle:</strong> {booking.vehicleNumber}</p>}
                          {booking.tripOtp && booking.status !== 'completed' && (
                            <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#d1fae5', borderRadius: '6px', textAlign: 'center' }}>
                              <p style={{ fontSize: '12px', margin: '0 0 3px', color: '#065f46' }}>Share this OTP with driver:</p>
                              <strong style={{ fontSize: '20px', letterSpacing: '5px', color: '#065f46' }}>{booking.tripOtp}</strong>
                            </div>
                          )}
                        </>
                      ) : booking.bookingType === 'ayurveda_consultation' ? (
                        <>
                          {booking.type === 'panchakarma_package' ? (
                            <>
                              {booking.centerName && <p><strong>🏨 Center:</strong> {booking.centerName}</p>}
                              {booking.package?.name && <p><strong>📦 Package:</strong> {booking.package.name}</p>}
                              {booking.package?.duration && <p><strong>⏱️ Duration:</strong> {booking.package.duration} days</p>}
                              <p><strong>💰 Amount:</strong> ₹{booking.finalAmount}</p>
                            </>
                          ) : (
                            <>
                              {booking.doctorName && <p><strong>👨‍⚕️ Doctor:</strong> {booking.doctorName}</p>}
                              {booking.doctorSpecialization && <p><strong>🌿 Specialty:</strong> {booking.doctorSpecialization}</p>}
                              {booking.consultationType && <p><strong>📹 Type:</strong> {booking.consultationType}</p>}
                              {booking.slotTime && <p><strong>⏰ Time:</strong> {booking.slotTime}</p>}
                              <p><strong>💰 Amount:</strong> ₹{booking.finalAmount}</p>
                            </>
                          )}
                        </>
                      ) : booking.bookingType === 'homeopathy_consult' ? (
                        <>
                          {booking.type === 'naturopathy_center' ? (
                            <>
                              {booking.centerName && <p><strong>🏨 Center:</strong> {booking.centerName}</p>}
                              {booking.package?.name && <p><strong>📦 Package:</strong> {booking.package.name}</p>}
                              {booking.package?.duration && <p><strong>⏱️ Duration:</strong> {booking.package.duration} days</p>}
                              <p><strong>💰 Amount:</strong> ₹{booking.finalAmount}</p>
                            </>
                          ) : booking.type === 'homeopathy_medicine' ? (
                            <>
                              {booking.pharmacyName && <p><strong>💊 Pharmacy:</strong> {booking.pharmacyName}</p>}
                              {booking.medicines?.length > 0 && <p><strong>🧪 Medicines:</strong> {booking.medicines.map(m => m.name).join(', ')}</p>}
                              {booking.deliveryAddress && <p><strong>📍 Delivery:</strong> {booking.deliveryAddress}</p>}
                              <p><strong>💰 Amount:</strong> ₹{booking.finalAmount}</p>
                            </>
                          ) : (
                            <>
                              {booking.doctorName && <p><strong>👨‍⚕️ Doctor:</strong> {booking.doctorName}</p>}
                              {booking.doctorSpecialization && <p><strong>🌿 Specialty:</strong> {booking.doctorSpecialization}</p>}
                              {booking.consultationType && <p><strong>📹 Type:</strong> {booking.consultationType}</p>}
                              {booking.slotTime && <p><strong>⏰ Time:</strong> {booking.slotTime}</p>}
                              <p><strong>💰 Amount:</strong> ₹{booking.finalAmount}</p>
                            </>
                          )}
                        </>
                      ) : booking.bookingType === 'online_doctor' ? (
                        <>
                          {booking.doctorName && <p><strong>🩺 Doctor:</strong> {booking.doctorName}</p>}
                          {booking.doctorSpecialization && <p><strong>Specialty:</strong> {booking.doctorSpecialization}</p>}
                          {booking.timeSlot && <p><strong>⏰ Time:</strong> {booking.timeSlot}</p>}
                          {booking.reason && <p><strong>📝 Symptoms:</strong> {booking.reason}</p>}
                          <p><strong>💰 Amount:</strong> ₹{booking.finalAmount || booking.amount || 0}</p>
                        </>
                      ) : booking.bookingType === 'mentalhealth' ? (
                        <>
                          {booking.therapistId?.name && <p><strong>🧠 Therapist:</strong> {booking.therapistId.name}</p>}
                          {booking.scheduledTime && <p><strong>⏰ Time:</strong> {booking.scheduledTime}</p>}
                          {booking.sessionType && <p><strong>📹 Type:</strong> {booking.sessionType}</p>}
                          <p><strong>💰 Amount:</strong> ₹{booking.amount || 0}</p>
                        </>
                      ) : booking.bookingType === 'caregiver' ? (
                        <>
                          {booking.caregiverId?.fullName && <p><strong>🏠 Caregiver:</strong> {booking.caregiverId.fullName}</p>}
                          {booking.startTime && <p><strong>⏰ Time:</strong> {booking.startTime} {booking.endTime ? `– ${booking.endTime}` : ''}</p>}
                          {booking.address && <p><strong>📍 Address:</strong> {booking.address}</p>}
                          <p><strong>💰 Amount:</strong> ₹{booking.totalAmount || 0}</p>
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
                      <p>
                        <strong>👤 Patient:</strong> {booking.patientName}
                        {(booking.patientAge || booking.patientGender) && (
                          <> ({booking.patientAge || '—'} yrs, {booking.patientGender || '—'})</>
                        )}
                      </p>
                      <p><strong>📞 Patient Contact:</strong> {booking.patientPhone}</p>
                                            {booking.paymentStatus && (
                        <p><strong>💳 Payment:</strong> <span style={{ color: booking.paymentStatus === 'paid' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{booking.paymentStatus.toUpperCase()}</span></p>
                      )}

                      {/* 🆕 Consultation OTP (only while active and not yet verified) */}
                      {booking.otp &&
                       booking.paymentStatus === 'paid' &&
                       !booking.otpVerified &&
                       ['pending', 'confirmed', 'in_progress'].includes(booking.status) && (
                        <div style={{
                          marginTop: '10px',
                          padding: '12px',
                          backgroundColor: '#fef9c3',
                          border: '2px dashed #f59e0b',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#92400e', fontWeight: 600 }}>
                            🔐 CONSULTATION OTP
                          </p>
                          <p style={{
                            margin: '4px 0',
                            fontSize: '28px',
                            letterSpacing: '8px',
                            fontWeight: 'bold',
                            color: '#92400e',
                            fontFamily: 'monospace'
                          }}>
                            {booking.otp}
                          </p>
                          <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#78350f' }}>
                            Share this with your {booking.bookingType === 'ayurveda_consultation'
                              ? 'Ayurveda doctor'
                              : booking.bookingType === 'homeopathy_consult'
                              ? 'Homeopathy doctor'
                              : 'provider'} at the time of consultation
                          </p>
                        </div>
                      )}

                      {booking.review && (booking.review.rating || booking.review.comment) && (
                        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                          <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>⭐ Your Review</p>
                          <p style={{ margin: '0', fontSize: '14px' }}>"{booking.review.comment || booking.review.review || ''}"</p>
                          <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                            <span>⭐ {booking.review.rating}/5</span>
                          </div>
                        </div>
                      )}

                      {myComplaints.filter(c => c.bookingId === booking.bookingId).length > 0 && (
                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {myComplaints.filter(c => c.bookingId === booking.bookingId).map(c => (
                            <div key={c.complaintId} style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                <div>
                                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>
                                    🚨 Complaint: {c.category?.replace(/_/g, ' ')}
                                  </p>
                                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#4b5563' }}>{c.description}</p>
                                </div>
                                <span style={{
                                  padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 700,
                                  backgroundColor: c.status === 'resolved' ? '#d1fae5' : c.status === 'in_review' ? '#dbeafe' : '#fef3c7',
                                  color: c.status === 'resolved' ? '#065f46' : c.status === 'in_review' ? '#1e40af' : '#92400e'
                                }}>{c.status.replace('_', ' ')}</span>
                              </div>
                              {c.centerResponse && (
                                <div style={{ marginTop: '6px', backgroundColor: '#fff', borderRadius: '6px', padding: '8px', borderLeft: '3px solid #10b981' }}>
                                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#065f46' }}>Response from center:</p>
                                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#374151' }}>{c.centerResponse}</p>
                                </div>
                              )}
                              {c.doctorResponse && (
                                <div style={{ marginTop: '6px', backgroundColor: '#fff', borderRadius: '6px', padding: '8px', borderLeft: '3px solid #10b981' }}>
                                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#065f46' }}>Response from doctor:</p>
                                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#374151' }}>{c.doctorResponse}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {booking.status === 'cancelled' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0f0f0' }}>
                          <input type="checkbox" checked={selectedBookings.includes(booking.bookingId)}
                            onChange={() => toggleSelect(booking.bookingId)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                          <span style={{ fontSize: 12, color: '#666' }}>Select to delete permanently</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
                        {isCancellable && getTagKey(booking) && (
                          <button onClick={() => handleCancelBooking(booking)}
                            style={{ padding: '6px 14px', backgroundColor: '#fff', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                            ❌ Cancel Booking
                          </button>
                        )}
                        {['confirmed', 'in_progress', 'completed'].includes(booking.status) && getTagKey(booking) && (
                          <button onClick={() => { setSelectedBooking(booking); setShowComplaintModal(true); }}
                            style={{ padding: '6px 14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                            🚨 Report Issue
                          </button>
                        )}
                        {(booking.status === 'completed' || booking.status === 'confirmed') &&
                         getTagKey(booking) &&
                         !(booking.review && (booking.review.rating || booking.review.comment)) && (
                          <button onClick={() => handleOpenReview(booking)}
                            style={{ padding: '6px 14px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                            ⭐ Write Review
                          </button>
                        )}
                        {isCancellable && refundInfo && (
                          <span style={{ fontSize: '11px', color: refundInfo.color, alignSelf: 'center' }}>{refundInfo.text} if cancelled now</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </>
      )}

      {showTimeline && selectedBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1002, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '15px' }}>Booking Status Timeline</h3>
            <p><strong>Booking ID:</strong> {selectedBooking.bookingId}</p>
            <div style={{ marginTop: '15px' }}>
              {(selectedBooking.statusHistory || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', marginBottom: '15px', paddingLeft: idx === 0 ? '0' : '20px', borderLeft: idx === 0 ? 'none' : '2px solid #e5e7eb' }}>
                  <div style={{ minWidth: '100px' }}><span style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(item.timestamp).toLocaleString()}</span></div>
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

      {showCancelModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1003, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '450px', width: '90%' }}>
            <h3 style={{ marginBottom: '10px' }}>❌ Cancel Booking</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px' }}>Are you sure you want to cancel booking <strong>{cancellingId}</strong>?</p>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px', fontSize: '14px' }}>Reason (optional)</label>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Why are you cancelling?" rows="3"
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowCancelModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Keep Booking</button>
              <button onClick={confirmCancel} disabled={cancelLoading}
                style={{ flex: 1, padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: cancelLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showComplaintModal && selectedBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1005, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ marginBottom: '10px' }}>🚨 Report Issue</h3>
            <select value={complaintData.category} onChange={e => setComplaintData({ ...complaintData, category: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
              <option value="service_quality">Service Quality</option>
              <option value="staff_behaviour">Staff Behaviour</option>
              <option value="late_arrival">Late Arrival</option>
              <option value="overcharging">Overcharging</option>
              <option value="medical_assistance">Medical Assistance Issue</option>
              <option value="facility_issue">Facility Issue</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="other">Other</option>
            </select>
            <textarea value={complaintData.description} onChange={e => setComplaintData({ ...complaintData, description: e.target.value })}
              placeholder="Describe the issue..." rows="4"
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
            <select value={complaintData.priority} onChange={e => setComplaintData({ ...complaintData, priority: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical</option>
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowComplaintModal(false)} style={{ flex: 1, padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitComplaint}
                style={{ flex: 1, padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Submit Complaint
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && selectedBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1004, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '5px' }}>⭐ Write a Review</h3>
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '15px' }}>
              {selectedBooking.hospitalName && `Hospital: ${selectedBooking.hospitalName}`}
              {selectedBooking.doctorName && ` • ${selectedBooking.doctorName}`}
            </p>
            <StarRating label="Overall Rating" value={reviewData.rating} onChange={(val) => setReviewData({ ...reviewData, rating: val })} />
            <StarRating label="Doctor Rating" value={reviewData.doctorRating} onChange={(val) => setReviewData({ ...reviewData, doctorRating: val })} />
            <StarRating label="Staff Behavior" value={reviewData.staffRating} onChange={(val) => setReviewData({ ...reviewData, staffRating: val })} />
            <StarRating label="Cleanliness" value={reviewData.cleanlinessRating} onChange={(val) => setReviewData({ ...reviewData, cleanlinessRating: val })} />
            <StarRating label="Wait Time" value={reviewData.waitTimeRating} onChange={(val) => setReviewData({ ...reviewData, waitTimeRating: val })} />
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px', fontSize: '14px' }}>Your Review</label>
              <textarea value={reviewData.review} onChange={(e) => setReviewData({ ...reviewData, review: e.target.value })}
                placeholder="Share your experience..." rows="4"
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowReviewModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
              <button onClick={submitReview} disabled={reviewLoading}
                style={{ flex: 1, padding: '10px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: reviewLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
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