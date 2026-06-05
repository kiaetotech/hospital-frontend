import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [showBooking, setShowBooking] = useState(false);
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    patient_name: '',
    patient_age: '',
    patient_gender: 'male',
    patient_phone: '',
    patient_email: '',
    appointment_date: '',
    appointment_time_slot: '',
    home_collection_requested: false,
    home_address: ''
  });

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  useEffect(() => {
    fetchPackageDetails();
  }, [id]);

  const fetchPackageDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/health-packages/${id}`);
      setPackageData(res.data.package);
    } catch (err) {
      setError('Failed to load package details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingChange = (e) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/health-packages/${id}/book`, bookingForm);
      alert(`Booking successful! Reference: ${res.data.booking_reference}`);
      setShowBooking(false);
      navigate('/my-bookings');
    } catch (err) {
      alert('Booking failed. Please try again.');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading package details...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!packageData) return <div style={{ padding: '40px', textAlign: 'center' }}>Package not found</div>;

  const testsList = packageData.tests_included_text ? packageData.tests_included_text.split(',').map(t => t.trim()) : [];
  const discountPercent = Math.round(((packageData.mrp - packageData.discounted_price) / packageData.mrp) * 100);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '20px', cursor: 'pointer' }}>← Back</button>

      {/* Package Header */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ flex: 2 }}>
            {packageData.is_popular && <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', display: 'inline-block', marginBottom: '12px' }}>🔥 Popular</span>}
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>{packageData.package_name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <span style={{ color: '#f59e0b' }}>⭐ {packageData.provider_id?.rating || 4.5} (128 reviews)</span>
              <span>🏥 {packageData.provider_id?.provider_name}</span>
              {packageData.provider_id?.is_nabl_accredited && <span style={{ color: '#10b981' }}>✓ NABL Accredited</span>}
            </div>
            <p style={{ color: '#4b5563', lineHeight: '1.6' }}>{packageData.package_description}</p>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'line-through' }}>₹{packageData.mrp}</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>₹{packageData.discounted_price}</div>
            <div style={{ fontSize: '14px', color: '#10b981' }}>{discountPercent}% OFF</div>
            <button 
              onClick={() => setShowBooking(true)}
              style={{ marginTop: '16px', backgroundColor: '#10b981', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', width: '100%' }}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('details')} style={{ padding: '12px 20px', fontSize: '16px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontWeight: 'bold', borderBottom: activeTab === 'details' ? '3px solid #10b981' : 'none', color: activeTab === 'details' ? '#10b981' : '#6b7280' }}>Package Details</button>
        <button onClick={() => setActiveTab('tests')} style={{ padding: '12px 20px', fontSize: '16px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontWeight: 'bold', borderBottom: activeTab === 'tests' ? '3px solid #10b981' : 'none', color: activeTab === 'tests' ? '#10b981' : '#6b7280' }}>Included Tests ({testsList.length})</button>
        <button onClick={() => setActiveTab('provider')} style={{ padding: '12px 20px', fontSize: '16px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontWeight: 'bold', borderBottom: activeTab === 'provider' ? '3px solid #10b981' : 'none', color: activeTab === 'provider' ? '#10b981' : '#6b7280' }}>Provider Info</button>
      </div>

      {/* Tab Content */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {activeTab === 'details' && (
          <div>
            <h3 style={{ marginTop: 0 }}>Package Highlights</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>🏠 {packageData.home_collection_available ? 'Home Collection Available' : 'Lab Visit Required'}</div>
              <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>⏱️ Report in {packageData.report_time_hours} hours</div>
              <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>👤 Suitable for {packageData.gender || 'All'}</div>
              {packageData.min_age && <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>📅 Age: {packageData.min_age}-{packageData.max_age} years</div>}
              {packageData.requires_fasting && <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>🌙 Fasting Required ({packageData.fasting_hours} hours)</div>}
            </div>
            <h3>What's Included</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>{testsList.length}+ lab tests</li>
              <li>Free home sample collection {packageData.home_collection_available ? '(available)' : '(not available)'}</li>
              <li>Online report access</li>
              <li>Doctor consultation if required</li>
            </ul>
          </div>
        )}

        {activeTab === 'tests' && (
          <div>
            <h3 style={{ marginTop: 0 }}>Complete Test List</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '8px' }}>
              {testsList.map((test, idx) => (
                <div key={idx} style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>🔬 {test}</div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'provider' && (
          <div>
            <h3 style={{ marginTop: 0 }}>About {packageData.provider_id?.provider_name}</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div><strong>⭐ Rating</strong><br/>{packageData.provider_id?.rating} ★</div>
              <div><strong>📍 Location</strong><br/>{packageData.provider_id?.city || 'Mumbai'}</div>
              <div><strong>🏥 Type</strong><br/>{packageData.provider_id?.provider_type || 'Lab'}</div>
              <div><strong>✓ Accreditation</strong><br/>{packageData.provider_id?.is_nabl_accredited ? 'NABL Accredited' : 'Not Accredited'}</div>
            </div>
            <p>{packageData.provider_id?.address_line1 || 'Address not available'}</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2>Book {packageData.package_name}</h2>
            <form onSubmit={handleBookingSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Full Name *</label>
                <input type="text" name="patient_name" required value={bookingForm.patient_name} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Age *</label>
                  <input type="number" name="patient_age" required value={bookingForm.patient_age} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Gender *</label>
                  <select name="patient_gender" value={bookingForm.patient_gender} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Phone Number *</label>
                <input type="tel" name="patient_phone" required value={bookingForm.patient_phone} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                <input type="email" name="patient_email" value={bookingForm.patient_email} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Appointment Date *</label>
                <input type="date" name="appointment_date" required value={bookingForm.appointment_date} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              {packageData.home_collection_available && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="checkbox" name="home_collection_requested" checked={bookingForm.home_collection_requested} onChange={(e) => setBookingForm({...bookingForm, home_collection_requested: e.target.checked})} />
                      Request Home Collection
                    </label>
                  </div>
                  {bookingForm.home_collection_requested && (
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px' }}>Home Address</label>
                      <textarea name="home_address" rows="3" value={bookingForm.home_address} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}></textarea>
                    </div>
                  )}
                </>
              )}
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>Confirm Booking</button>
                <button type="button" onClick={() => setShowBooking(false)} style={{ flex: 1, backgroundColor: '#6b7280', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageDetail;