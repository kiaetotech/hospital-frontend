import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const HospitalSimpleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const res = await api.get(`/hospitals/${id}`);
        setHospital(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHospital();
  }, [id]);

  const getBedUpdateBadge = (lastUpdated) => {
    if (!lastUpdated) return { text: 'Unknown', color: '#9ca3af', bg: '#f3f4f6' };
    const hours = (new Date() - new Date(lastUpdated)) / (1000 * 60 * 60);
    if (hours < 1) return { text: '🟢 Live Updated', color: '#10b981', bg: '#d1fae5' };
    if (hours < 4) return { text: '🟡 Updated Recently', color: '#f59e0b', bg: '#fef3c7' };
    if (hours < 12) return { text: '🟠 Updated Today', color: '#f97316', bg: '#ffedd5' };
    return { text: '🔴 May not be current', color: '#ef4444', bg: '#fee2e2' };
  };

  const getAvailabilityBadge = (status) => {
    switch(status) {
      case 'available': return { text: '🟢 Available Today', color: '#10b981', bg: '#d1fae5' };
      case 'limited': return { text: '🟡 Few Slots Left', color: '#f59e0b', bg: '#fef3c7' };
      case 'full': return { text: '🔴 Full Today', color: '#ef4444', bg: '#fee2e2' };
      case 'leave': return { text: '⚫ On Leave', color: '#6b7280', bg: '#f3f4f6' };
      default: return { text: 'Check Availability', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const schemeDisplayNames = {
    'ayushman': 'Ayushman Bharat (PM-JAY)',
    'cghs': 'CGHS',
    'esi': 'ESI',
    'echs': 'ECHS',
    'state_scheme': 'State Health Scheme',
    'pmjay': 'PM-JAY',
    'rsby': 'RSBY',
    'senior_citizen': 'Senior Citizen Scheme',
    'disability': 'Disability Scheme'
  };

  const handleBookOPD = (doctor = null) => {
    const url = doctor 
      ? `/book-opd/${hospital._id}?doctor=${doctor.name}`
      : `/book-opd/${hospital._id}`;
    navigate(url);
  };

  const handleBookAdmission = () => {
    navigate(`/book-admission/${hospital._id}`);
  };

  const handleBookAmbulance = () => {
    navigate('/ambulance');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏥</div>
          <p style={{ color: '#6b7280' }}>Loading hospital details...</p>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem', textAlign: 'center' }}>
        <p>Hospital not found</p>
        <button onClick={() => navigate('/hospitals')} style={{ marginTop: '1rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
          Back to Hospitals
        </button>
      </div>
    );
  }

  const bedBadge = getBedUpdateBadge(hospital.beds?.last_updated);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      
      {/* HEADER */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#3b82f6', marginRight: '1rem' }}>
              ← Back
            </button>
            <h1 style={{ display: 'inline', fontSize: '1.5rem', fontWeight: 'bold' }}>{hospital.name}</h1>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              {hospital.accreditations?.map(acc => (
                <span key={acc} style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  {acc}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => handleBookOPD()} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              📋 Book OPD
            </button>
            <button onClick={handleBookAdmission} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              🏥 Book Admission
            </button>
            <button onClick={handleBookAmbulance} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              🚑 Ambulance
            </button>
          </div>
        </div>
        
        {/* TABS */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', gap: '0', borderBottom: 'none' }}>
          {['overview', 'doctors', 'facilities', 'schemes', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                color: activeTab === tab ? '#3b82f6' : '#6b7280',
                borderBottom: activeTab === tab ? '3px solid #3b82f6' : '3px solid transparent',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'overview' ? '📋 Overview' : 
               tab === 'doctors' ? '👨‍⚕️ Doctors' :
               tab === 'facilities' ? '🏗️ Facilities' :
               tab === 'schemes' ? '💠 Schemes & Insurance' :
               '⭐ Reviews'}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            
            {/* Quick Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem' }}>⭐</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{hospital.ratings?.average || 'N/A'}</div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>({hospital.ratings?.count || 0} reviews)</div>
              </div>
              
              <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem' }}>🛏️</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{hospital.beds?.available || 0}</div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Beds Available</div>
                <div style={{ 
                  backgroundColor: bedBadge.bg, 
                  color: bedBadge.color, 
                  padding: '0.15rem 0.5rem', 
                  borderRadius: '9999px', 
                  fontSize: '0.65rem',
                  marginTop: '0.25rem',
                  display: 'inline-block'
                }}>
                  {bedBadge.text}
                </div>
              </div>
              
              <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem' }}>👨‍⚕️</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{hospital.doctors?.length || 0}</div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Doctors Available</div>
              </div>
              
              <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem' }}>💰</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{hospital.pricing?.consultation || 0}</div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>OPD Consultation</div>
              </div>
            </div>

            {/* Contact & Location */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>📍 Location & Contact</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p><strong>Address:</strong><br />{hospital.address?.street || ''} {hospital.address?.city}, {hospital.address?.state} - {hospital.address?.pincode || ''}</p>
                  {hospital.address?.landmark && <p><strong>Landmark:</strong> {hospital.address.landmark}</p>}
                </div>
                <div>
                  <p><strong>📞 Phone:</strong> {hospital.contact?.phone || 'N/A'}</p>
                  {hospital.contact?.emergency_phone && <p><strong>🚨 Emergency:</strong> {hospital.contact.emergency_phone}</p>}
                  <p><strong>📧 Email:</strong> {hospital.contact?.email || 'N/A'}</p>
                  {hospital.contact?.website && <p><strong>🌐 Website:</strong> {hospital.contact.website}</p>}
                </div>
              </div>
            </div>

            {/* Pricing Details */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>💰 Pricing</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '0.375rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>OPD Consultation</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>₹{hospital.pricing?.consultation}</div>
                  {hospital.pricing?.online_booking_discount > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                      Save {hospital.pricing.online_booking_discount}% online
                    </div>
                  )}
                </div>
                
                <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '0.375rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>ICU (Per Day)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>₹{hospital.pricing?.icu_bed_per_day}</div>
                </div>
                
                <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.375rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>General Ward (Per Day)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }}>₹{hospital.pricing?.general_bed_per_day}</div>
                </div>

                {hospital.pricing?.private_per_day && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '0.375rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Private Room (Per Day)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>₹{hospital.pricing.private_per_day}</div>
                  </div>
                )}
              </div>
              
              {/* Bed Categories */}
              {hospital.beds?.categories && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>🛏️ Bed Categories & Pricing</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {Object.entries(hospital.beds.categories).map(([key, value]) => (
                      value.price_per_day > 0 && (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem' }}>
                          <span style={{ textTransform: 'capitalize' }}>{key.replace('_', ' ')}</span>
                          <span style={{ fontWeight: 'bold' }}>₹{value.price_per_day}/day</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Offers */}
            {hospital.pricing?.offers?.length > 0 && (
              <div style={{ backgroundColor: '#fff7ed', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #fed7aa' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>🔥 Special Offers</h3>
                {hospital.pricing.offers.map((offer, idx) => (
                  <div key={idx} style={{ marginBottom: '0.5rem' }}>
                    <strong>{offer.title}</strong> - {offer.discount_percentage}% off
                    {offer.valid_till && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}> (Valid till {new Date(offer.valid_till).toLocaleDateString()})</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Health Packages */}
            {hospital.pricing?.health_packages?.length > 0 && (
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>📦 Health Packages</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  {hospital.pricing.health_packages.map((pkg, idx) => (
                    <div key={idx} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                      <h4>{pkg.name}</h4>
                      <div style={{ margin: '0.5rem 0' }}>
                        <span style={{ textDecoration: 'line-through', color: '#6b7280' }}>₹{pkg.original_price}</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981', marginLeft: '0.5rem' }}>₹{pkg.discounted_price}</span>
                      </div>
                      {pkg.includes?.length > 0 && (
                        <ul style={{ fontSize: '0.875rem', paddingLeft: '1.25rem' }}>
                          {pkg.includes.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Review */}
            {hospital.featured_review?.text && (
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>💬 What Patients Say</h3>
                <p style={{ fontStyle: 'italic', color: '#374151' }}>"{hospital.featured_review.text}"</p>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>- {hospital.featured_review.author}</p>
              </div>
            )}
          </div>
        )}

        {/* DOCTORS TAB */}
        {activeTab === 'doctors' && (
          <div>
            <h2 style={{ marginBottom: '1rem' }}>👨‍⚕️ Doctors ({hospital.doctors?.length || 0})</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {hospital.doctors?.map((doc, idx) => {
                const availBadge = getAvailabilityBadge(doc.availability?.status);
                return (
                  <div key={idx} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: '0.25rem' }}>{doc.name}</h3>
                      <p style={{ color: '#3b82f6', fontWeight: '500' }}>{doc.specialization}</p>
                      {doc.sub_specialization && <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Sub-specialty: {doc.sub_specialization}</p>}
                      <p style={{ fontSize: '0.875rem' }}>📜 {doc.qualification || 'N/A'}</p>
                      <p style={{ fontSize: '0.875rem' }}>📅 {doc.experience || 'N/A'} experience</p>
                      {doc.languages?.length > 0 && (
                        <p style={{ fontSize: '0.875rem' }}>🗣️ {doc.languages.join(', ')}</p>
                      )}
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <span>⭐ {doc.rating || 'N/A'}</span>
                        {doc.reviewCount > 0 && <span>({doc.reviewCount} reviews)</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>₹{doc.consultation_fee}</div>
                      <div style={{ 
                        backgroundColor: availBadge.bg, 
                        color: availBadge.color, 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.75rem',
                        display: 'inline-block',
                        margin: '0.5rem 0'
                      }}>
                        {availBadge.text}
                      </div>
                      {doc.availability?.slots_available > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {doc.availability.slots_available} slots
                        </div>
                      )}
                      <button 
                        onClick={() => handleBookOPD(doc)}
                        disabled={doc.availability?.status === 'leave' || doc.availability?.status === 'full'}
                        style={{ 
                          marginTop: '0.5rem',
                          backgroundColor: (doc.availability?.status === 'leave' || doc.availability?.status === 'full') ? '#d1d5db' : '#10b981', 
                          color: 'white', 
                          padding: '0.5rem 1.5rem', 
                          borderRadius: '0.375rem', 
                          border: 'none', 
                          cursor: (doc.availability?.status === 'leave' || doc.availability?.status === 'full') ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {doc.availability?.status === 'leave' ? 'On Leave' : 
                         doc.availability?.status === 'full' ? 'Booked Full' : 
                         'Select Doctor'}
                      </button>
                    </div>
                  </div>
                );
              })}
              {(!hospital.doctors || hospital.doctors.length === 0) && (
                <p style={{ color: '#6b7280' }}>No doctors listed yet.</p>
              )}
            </div>
          </div>
        )}

        {/* FACILITIES TAB */}
        {activeTab === 'facilities' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            
            {/* Technology */}
            {hospital.technology?.length > 0 && (
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>🔬 Technology & Equipment</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {hospital.technology.map((tech, idx) => (
                    <span key={idx} style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem' }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Operation Theaters */}
            {hospital.operation_theaters?.total > 0 && (
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>🏥 Operation Theaters</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{hospital.operation_theaters.total}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total OTs</div>
                  </div>
                  {hospital.operation_theaters.modular > 0 && (
                    <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{hospital.operation_theaters.modular}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Modular OTs</div>
                    </div>
                  )}
                  {hospital.operation_theaters.robotic && (
                    <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.375rem' }}>
                      <div style={{ fontSize: '2rem' }}>🤖</div>
                      <div style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 'bold' }}>Robotic Surgery</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amenities */}
            {hospital.amenities?.length > 0 && (
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>🎯 Amenities</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {hospital.amenities.map((amenity, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>✅</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Status */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>📊 Quick Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div>
                  <strong>🧪 Lab Tests:</strong> {hospital.lab_tests_available ? '✅ Available' : '🔗 Linked'}
                </div>
                <div>
                  <strong>💊 Pharmacy:</strong> {hospital.in_house_pharmacy ? (hospital.pharmacy_24x7 ? '✅ 24x7' : '✅ Available') : '❌ Not Available'}
                </div>
                <div>
                  <strong>🚑 Ambulance:</strong> {hospital.ambulance_available ? `✅ ${hospital.ambulance_count || ''} Vehicles` : '❌ Not Available'}
                </div>
                <div>
                  <strong>🚨 Emergency:</strong> {hospital.has24x7ER ? '✅ 24/7 Open' : '❌ Not Available'}
                </div>
                {hospital.trauma_center && <div><strong>🏥 Trauma Center:</strong> ✅ Yes</div>}
                {hospital.stroke_ready && <div><strong>🧠 Stroke Ready:</strong> ✅ Yes</div>}
                {hospital.cardiac_emergency && <div><strong>❤️ Cardiac Emergency:</strong> ✅ Yes</div>}
              </div>
            </div>
          </div>
        )}

        {/* SCHEMES & INSURANCE TAB */}
        {activeTab === 'schemes' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            
            {/* Government Schemes */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>💠 Government Schemes Accepted</h3>
              {hospital.schemes_accepted?.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
                  {hospital.schemes_accepted.map((scheme, idx) => (
                    <div key={idx} style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#f0fdf4', 
                      borderRadius: '0.375rem',
                      border: '1px solid #bbf7d0'
                    }}>
                      <span style={{ fontWeight: 'bold' }}>✅ {schemeDisplayNames[scheme] || scheme.toUpperCase()}</span>
                      {hospital.scheme_details?.find(s => s.scheme_name === scheme)?.beds_allocated > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          🛏️ {hospital.scheme_details.find(s => s.scheme_name === scheme).beds_allocated} beds allocated
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280' }}>No government schemes accepted.</p>
              )}
            </div>

            {/* Insurance Accepted */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>🛡️ Insurance Accepted</h3>
              {hospital.insurance_accepted?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {hospital.insurance_accepted.map((ins, idx) => (
                    <span key={idx} style={{ 
                      backgroundColor: '#eff6ff', 
                      color: '#1e40af', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.875rem' 
                    }}>
                      {ins}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280' }}>No insurance information available.</p>
              )}
            </div>

            {/* Cashless & TPA */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>💳 Payment & Cashless</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: hospital.cashless_available ? '#f0fdf4' : '#fef2f2', borderRadius: '0.375rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem' }}>{hospital.cashless_available ? '✅' : '❌'}</div>
                  <div style={{ fontWeight: 'bold' }}>Cashless Available</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: hospital.tpa_desk_available ? '#f0fdf4' : '#fef2f2', borderRadius: '0.375rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem' }}>{hospital.tpa_desk_available ? '✅' : '❌'}</div>
                  <div style={{ fontWeight: 'bold' }}>TPA Desk</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: hospital.reimbursement_accepted ? '#f0fdf4' : '#fef2f2', borderRadius: '0.375rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem' }}>{hospital.reimbursement_accepted ? '✅' : '❌'}</div>
                  <div style={{ fontWeight: 'bold' }}>Reimbursement</div>
                </div>
              </div>
              
              {hospital.tpa_partners?.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>TPA Partners:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {hospital.tpa_partners.map((tpa, idx) => (
                      <span key={idx} style={{ backgroundColor: '#fef3c7', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
                        {tpa}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {hospital.payment_methods?.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Payment Methods:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {hospital.payment_methods.map((method, idx) => (
                      <span key={idx} style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            
            {/* Rating Breakdown */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>⭐ Rating Breakdown</h3>
              {hospital.ratings?.breakdown && (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {Object.entries(hospital.ratings.breakdown).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ width: '180px', textTransform: 'capitalize', fontSize: '0.875rem' }}>
                        {key.replace('_', ' ')}:
                      </span>
                      <div style={{ flex: 1, height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${(value / 5) * 100}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: '4px' }}></div>
                      </div>
                      <span style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{value}/5</span>
                    </div>
                  ))}
                </div>
              )}
              {hospital.ratings?.avg_wait_time > 0 && (
                <p style={{ marginTop: '1rem' }}>
                  <strong>⏱️ Average Wait Time:</strong> {hospital.ratings.avg_wait_time} minutes
                </p>
              )}
            </div>

            {/* Recent Reviews */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>💬 Patient Reviews ({hospital.reviews?.length || 0})</h3>
              {hospital.reviews?.length > 0 ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {hospital.reviews.slice(0, 10).map((review, idx) => (
                    <div key={idx} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <strong>{review.patientName}</strong>
                          {review.verified && <span style={{ color: '#10b981', fontSize: '0.75rem', marginLeft: '0.5rem' }}>✅ Verified</span>}
                        </div>
                        <div>
                          <span>⭐ {review.rating}/5</span>
                          <span style={{ color: '#6b7280', fontSize: '0.75rem', marginLeft: '1rem' }}>
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {review.doctorName && <p style={{ fontSize: '0.875rem', color: '#3b82f6' }}>Doctor: {review.doctorName}</p>}
                      {review.treatment && <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Treatment: {review.treatment}</p>}
                      <p style={{ marginTop: '0.5rem' }}>{review.review}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280' }}>No reviews yet.</p>
              )}
            </div>
          </div>
        )}

      </div>

      {/* MOBILE BOTTOM BAR */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'white', 
        borderTop: '1px solid #e5e7eb', 
        padding: '1rem',
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center',
        zIndex: 100
      }}>
        <button onClick={() => handleBookOPD()} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold', flex: 1, maxWidth: '200px' }}>
          📋 Book OPD
        </button>
        <button onClick={handleBookAdmission} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold', flex: 1, maxWidth: '200px' }}>
          🏥 Book Admission
        </button>
        {hospital.has24x7ER && (
          <a href={`tel:${hospital.contact?.emergency_phone || hospital.contact?.phone}`} style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            🚨
          </a>
        )}
      </div>
    </div>
  );
};

export default HospitalSimpleDetails;