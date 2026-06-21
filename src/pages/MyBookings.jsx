import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const MyBookings = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [bookings, setBookings] = useState([]);
  const [insurancePolicies, setInsurancePolicies] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showInsurance, setShowInsurance] = useState(false);

  const fetchBookings = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    try {
      // Fetch regular bookings
      const response = await axios.get(`https://hospital-backend-production-8de3.up.railway.app/api/bookings/patient/${phone}`);
      setBookings(response.data);
      
      // Fetch insurance policies (using the same phone number)
      try {
        const insuranceResponse = await axios.get(`/api/insurance/my-policies`, {
          headers: {
            // If you have auth token, add it here
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (insuranceResponse.data.success) {
          setInsurancePolicies(insuranceResponse.data.data);
        }
      } catch (insuranceError) {
        console.log('Insurance policies not available or user not logged in');
        setInsurancePolicies([]);
      }
      
      setSearched(true);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Error fetching bookings. Please try again.');
    }
    setLoading(false);
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
      case 'insurance': return '🛡️';
      default: return '📋';
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

  // Filter bookings
  const filteredBookings = selectedType === 'all' 
    ? bookings 
    : bookings.filter(b => b.bookingType === selectedType);

  // Separate bookings by type
  const labBookings = bookings.filter(b => b.bookingType === 'labtest');
  const hospitalBookings = bookings.filter(b => b.bookingType === 'opd' || b.bookingType === 'admission');
  const ambulanceBookings = bookings.filter(b => b.bookingType === 'ambulance');
  const insuranceBookings = bookings.filter(b => b.bookingType === 'insurance');

  // Total count including insurance policies
  const totalInsurancePolicies = insurancePolicies.length || insuranceBookings.length;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '5px' }}>📋 My Bookings</h1>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>View all your hospital, ambulance, lab test, and insurance bookings</p>
      
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
              <div style={{ fontSize: '12px', color: '#666' }}>Hospital Bookings</div>
            </div>
            <div style={{ backgroundColor: '#d1fae5', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>🔬</div>
              <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{labBookings.length}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Lab Test Bookings</div>
            </div>
            <div style={{ backgroundColor: '#fed7aa', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>🚑</div>
              <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{ambulanceBookings.length}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Ambulance Bookings</div>
            </div>
            <div style={{ backgroundColor: '#bfdbfe', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '2px solid #2563eb' }}>
              <div style={{ fontSize: '24px' }}>🛡️</div>
              <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{totalInsurancePolicies}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Insurance Policies</div>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setSelectedType('all')} 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: selectedType === 'all' ? '#3b82f6' : 'transparent', 
                color: selectedType === 'all' ? 'white' : '#333', 
                border: 'none', 
                borderRadius: '20px', 
                cursor: 'pointer' 
              }}
            >
              All ({bookings.length + totalInsurancePolicies})
            </button>
            <button 
              onClick={() => setSelectedType('labtest')} 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: selectedType === 'labtest' ? '#10b981' : 'transparent', 
                color: selectedType === 'labtest' ? 'white' : '#333', 
                border: 'none', 
                borderRadius: '20px', 
                cursor: 'pointer' 
              }}
            >
              🔬 Lab Tests ({labBookings.length})
            </button>
            <button 
              onClick={() => setSelectedType('opd')} 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: selectedType === 'opd' ? '#8b5cf6' : 'transparent', 
                color: selectedType === 'opd' ? 'white' : '#333', 
                border: 'none', 
                borderRadius: '20px', 
                cursor: 'pointer' 
              }}
            >
              🏥 Hospital ({hospitalBookings.length})
            </button>
            <button 
              onClick={() => setSelectedType('ambulance')} 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: selectedType === 'ambulance' ? '#f59e0b' : 'transparent', 
                color: selectedType === 'ambulance' ? 'white' : '#333', 
                border: 'none', 
                borderRadius: '20px', 
                cursor: 'pointer' 
              }}
            >
              🚑 Ambulance ({ambulanceBookings.length})
            </button>
            <button 
              onClick={() => setSelectedType('insurance')} 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: selectedType === 'insurance' ? '#2563eb' : 'transparent', 
                color: selectedType === 'insurance' ? 'white' : '#333', 
                border: selectedType === 'insurance' ? 'none' : '1px solid #2563eb',
                borderRadius: '20px', 
                cursor: 'pointer' 
              }}
            >
              🛡️ Insurance ({totalInsurancePolicies})
            </button>
          </div>
          
          {/* Insurance Policies Section */}
          {(selectedType === 'all' || selectedType === 'insurance') && insurancePolicies.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛡️</span> My Insurance Policies
                <Link to="/insurance/list" style={{ fontSize: '14px', color: '#2563eb', marginLeft: '10px', fontWeight: 'normal' }}>
                  + Buy New Policy
                </Link>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {insurancePolicies.map((policy) => (
                  <div 
                    key={policy._id} 
                    style={{ 
                      backgroundColor: 'white', 
                      borderRadius: '12px', 
                      padding: '16px', 
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                      borderLeft: `4px solid ${policy.status === 'active' ? '#10b981' : policy.status === 'pending' ? '#f59e0b' : '#ef4444'}`,
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>🛡️</span>
                          <strong style={{ fontSize: '16px' }}>{policy.policyName || 'Insurance Policy'}</strong>
                          <span style={{ 
                            padding: '2px 10px', 
                            borderRadius: '12px', 
                            backgroundColor: getStatusColor(policy.status), 
                            color: 'white', 
                            fontSize: '11px', 
                            fontWeight: 'bold' 
                          }}>
                            {getStatusText(policy.status)}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                          {policy.companyId?.name || 'Insurance Company'} • Policy: {policy.policyNumber}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleViewPolicy(policy._id)}
                          style={{ 
                            padding: '6px 14px', 
                            backgroundColor: '#3b82f6', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer', 
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          View Details
                        </button>
                        {policy.status === 'active' && (
                          <button 
                            onClick={() => handleRenewPolicy(policy._id)}
                            style={{ 
                              padding: '6px 14px', 
                              backgroundColor: '#10b981', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            Renew
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Sum Insured</div>
                        <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{formatCurrency(policy.sumInsured || 0)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Premium</div>
                        <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#2563eb' }}>{formatCurrency(policy.premiumAmount || 0)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Valid Till</div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                          {policy.endDate ? new Date(policy.endDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Members</div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                          {policy.members ? policy.members.length + 1 : 1}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Regular Bookings */}
          {filteredBookings.length === 0 && selectedType !== 'insurance' ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '10px' }}>
              <p>No bookings found for this category.</p>
            </div>
          ) : filteredBookings.length > 0 && selectedType !== 'insurance' ? (
            <div>
              {filteredBookings.map(booking => (
                <div key={booking._id} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '15px', marginBottom: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${getStatusColor(booking.status)}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '20px', marginRight: '8px' }}>{getBookingTypeIcon(booking.bookingType)}</span>
                      <strong style={{ fontSize: '16px' }}>
                        {booking.bookingType === 'labtest' ? 'Lab Test' : 
                         booking.bookingType === 'ambulance' ? 'Ambulance' : 
                         booking.bookingType === 'admission' ? 'Hospital Admission' : 
                         booking.bookingType === 'insurance' ? 'Insurance Policy' :
                         'OPD Consultation'}
                      </strong>
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
                    {booking.bookingType === 'labtest' ? (
                      <>
                        <p><strong>🔬 Lab:</strong> {booking.providerName}</p>
                        <p><strong>🧪 Tests:</strong> {booking.tests?.join(', ')}</p>
                        <p><strong>💰 Amount:</strong> ₹{booking.finalAmount}</p>
                        {booking.homeCollectionRequested && <p><strong>🏠 Home Collection:</strong> Yes</p>}
                        {booking.estimatedReportTime && (
                          <p><strong>📄 Estimated Report:</strong> {new Date(booking.estimatedReportTime).toLocaleDateString()}</p>
                        )}
                      </>
                    ) : booking.bookingType === 'ambulance' ? (
                      <>
                        <p><strong>🚑 Ambulance Type:</strong> {booking.ambulanceType}</p>
                        <p><strong>📍 Pickup:</strong> {booking.pickupAddress}</p>
                        <p><strong>📍 Drop:</strong> {booking.dropAddress}</p>
                        <p><strong>💰 Amount:</strong> ₹{booking.finalAmount}</p>
                      </>
                    ) : booking.bookingType === 'insurance' ? (
                      <>
                        <p><strong>🛡️ Insurance:</strong> {booking.insuranceCompanyName}</p>
                        <p><strong>📋 Plan:</strong> {booking.insurancePlanName}</p>
                        <p><strong>💰 Premium:</strong> ₹{booking.premiumAmount}</p>
                        <p><strong>🏥 Sum Insured:</strong> ₹{booking.sumInsured}</p>
                        <p><strong>📅 Valid From:</strong> {new Date(booking.policyStartDate).toLocaleDateString()}</p>
                        <p><strong>📅 Valid Till:</strong> {new Date(booking.policyEndDate).toLocaleDateString()}</p>
                        {booking.insuranceMembers && booking.insuranceMembers.length > 0 && (
                          <p><strong>👨‍👩‍👧‍👦 Members:</strong> {booking.insuranceMembers.length + 1} members</p>
                        )}
                      </>
                    ) : (
                      <>
                        <p><strong>🏥 Hospital:</strong> {booking.hospitalName}</p>
                        {booking.doctorName && <p><strong>👨‍⚕️ Doctor:</strong> {booking.doctorName}</p>}
                        {booking.timeSlot && <p><strong>⏰ Time Slot:</strong> {booking.timeSlot}</p>}
                        <p><strong>💰 Amount:</strong> ₹{booking.finalAmount}</p>
                        {booking.discount > 0 && <p><strong>🎉 Discount:</strong> ₹{booking.discount}</p>}
                      </>
                    )}
                    <p><strong>📅 Date:</strong> {new Date(booking.appointmentDate || booking.bookingDate).toLocaleDateString()}</p>
                    <p><strong>👤 Patient:</strong> {booking.patientName} ({booking.patientAge} yrs, {booking.patientGender})</p>
                    <p><strong>📞 Phone:</strong> {booking.patientPhone}</p>
                    {booking.paymentStatus && (
                      <p><strong>💳 Payment:</strong> <span style={{ 
                        color: booking.paymentStatus === 'paid' ? '#10b981' : '#f59e0b',
                        fontWeight: 'bold'
                      }}>{booking.paymentStatus.toUpperCase()}</span></p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          
          {/* Message when no insurance policies */}
          {(selectedType === 'all' || selectedType === 'insurance') && insurancePolicies.length === 0 && bookings.filter(b => b.bookingType === 'insurance').length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f9fafb', borderRadius: '10px', marginTop: '15px' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛡️</div>
              <p style={{ color: '#6b7280' }}>No insurance policies found.</p>
              <Link to="/insurance/list" style={{ display: 'inline-block', marginTop: '10px', padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                Browse Insurance Plans →
              </Link>
            </div>
          )}
        </>
      )}

      {/* Timeline Modal */}
      {showTimeline && selectedBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1002, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '15px' }}>Booking Status Timeline</h3>
            <p><strong>Booking ID:</strong> {selectedBooking.bookingId}</p>
            <p><strong>Lab:</strong> {selectedBooking.providerName}</p>
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
    </div>
  );
};

export default MyBookings;