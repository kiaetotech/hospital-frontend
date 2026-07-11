import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCaregiverById } from '../services/api';

const CaregiverProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [caregiver, setCaregiver] = useState(location.state?.caregiver || null);
  const [loading, setLoading] = useState(!caregiver);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    // If caregiver data came from navigation state, use it
    // Otherwise fetch from API
    if (!caregiver && id) {
      fetchCaregiverDetails();
    }
  }, [id]);

  const fetchCaregiverDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getCaregiverById(id);
      if (response.data.success) {
        setCaregiver(response.data.data);
      } else {
        setError('Caregiver not found');
      }
    } catch (err) {
      setError('Failed to load caregiver details');
      console.error('Fetch caregiver error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <span style={{ color: '#f59e0b', letterSpacing: '2px' }}>
        {'★'.repeat(full)}
        {half ? '½' : ''}
        <span style={{ color: '#d1d5db' }}>{'★'.repeat(empty)}</span>
      </span>
    );
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CG';
  };

  const getServiceTypeBadge = (type) => {
    if (type === 'personal') return { icon: '🩺', text: 'Personal Care', color: '#dbeafe', textColor: '#1e40af' };
    if (type === 'skilled') return { icon: '💉', text: 'Skilled Nursing', color: '#fce7f3', textColor: '#9d174d' };
    return { icon: '🤝', text: 'Both', color: '#d1fae5', textColor: '#065f46' };
  };

  const getVerificationBadge = (status) => {
    if (status === 'cleared') return { text: '✓ Background Verified', color: '#d1fae5', textColor: '#065f46' };
    if (status === 'pending') return { text: '⏳ Verification Pending', color: '#fef3c7', textColor: '#92400e' };
    return { text: '⚠️ Not Verified', color: '#fee2e2', textColor: '#991b1b' };
  };

  // Loading State
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '1rem', 
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            animation: 'pulse 1.5s infinite'
          }}>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#e2e8f0' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: '32px', backgroundColor: '#e2e8f0', borderRadius: '0.5rem', width: '40%', marginBottom: '1rem' }} />
                <div style={{ height: '20px', backgroundColor: '#e2e8f0', borderRadius: '0.5rem', width: '30%', marginBottom: '0.5rem' }} />
                <div style={{ height: '20px', backgroundColor: '#e2e8f0', borderRadius: '0.5rem', width: '50%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !caregiver) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
            {error || 'Caregiver Not Found'}
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            We couldn't load this caregiver's profile. They may have been removed or the link is invalid.
          </p>
          <button 
            onClick={() => navigate('/caregivers')}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            ← Back to Caregivers
          </button>
        </div>
      </div>
    );
  }

  const badge = getServiceTypeBadge(caregiver.serviceType);
  const verifyBadge = getVerificationBadge(caregiver.backgroundCheckStatus);
  const hourlyRate = caregiver.pricing?.personal?.hourly || caregiver.pricing?.skilled?.hourly || 'N/A';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        padding: '2rem',
        color: 'white'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}
          >
            ← Back to Search
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '900px', margin: '-60px auto 2rem', padding: '0 1rem' }}>
        {/* Profile Header Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {/* Avatar */}
            {caregiver.photo && caregiver.photo !== 'https://placehold.co/400x400/e2e8f0/1e293b?text=Caregiver' ? (
              <img 
                src={caregiver.photo} 
                alt={caregiver.fullName}
                style={{
                  width: '130px',
                  height: '130px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
            ) : (
              <div style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                border: '4px solid #e2e8f0'
              }}>
                {getInitials(caregiver.fullName)}
              </div>
            )}
            
            <div style={{ flex: 1, minWidth: '250px' }}>
              {/* Name + Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                  {caregiver.fullName}
                </h1>
                {caregiver.isVerified && (
                  <span style={{
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    padding: '0.2rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    ✓ Verified
                  </span>
                )}
              </div>
              
              {/* Rating */}
              <div style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>
                {getRatingStars(caregiver.ratings?.average || 0)}
                <span style={{ color: '#64748b', marginLeft: '0.5rem', fontWeight: '500' }}>
                  {caregiver.ratings?.average?.toFixed(1) || '0.0'} ({caregiver.ratings?.count || caregiver.totalReviews || 0} reviews)
                </span>
              </div>
              
              {/* Service Type + Experience */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: badge.color,
                  color: badge.textColor,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}>
                  {badge.icon} {badge.text}
                </span>
                <span style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}>
                  📅 {caregiver.experienceYears} years exp
                </span>
              </div>
              
              {/* Location */}
              <p style={{ color: '#64748b', margin: '0 0 0.25rem', fontSize: '0.9rem' }}>
                📍 {caregiver.location?.city}, {caregiver.location?.state} 
                {caregiver.distance && ` • ${caregiver.distance} km away`}
              </p>
              
              {/* Background Check */}
              <span style={{
                display: 'inline-block',
                backgroundColor: verifyBadge.color,
                color: verifyBadge.textColor,
                padding: '0.2rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '500',
                marginTop: '0.25rem'
              }}>
                {verifyBadge.text}
              </span>
            </div>

            {/* Price + CTA */}
            <div style={{ 
              textAlign: 'center',
              padding: '1.5rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '1rem',
              minWidth: '180px',
              border: '2px solid #bbf7d0'
            }}>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Starting from</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', margin: '0 0 0.5rem' }}>
                ₹{hourlyRate}
                <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>/hour</span>
              </p>
              {caregiver.pricing?.personal?.daily && (
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem' }}>
                  ₹{caregiver.pricing.personal.daily}/day • ₹{caregiver.pricing.personal.monthly}/month
                </p>
              )}
              <button 
                onClick={() => navigate(`/book-caregiver/${caregiver._id}`, { state: { caregiver } })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Tabs + Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #e2e8f0',
            overflowX: 'auto'
          }}>
            {[
              { key: 'about', label: '📋 About', icon: '📋' },
              { key: 'skills', label: '🎯 Skills', icon: '🎯' },
              { key: 'certifications', label: '📜 Certifications', icon: '📜' },
              { key: 'availability', label: '📅 Availability', icon: '📅' },
              { key: 'pricing', label: '💰 Pricing', icon: '💰' },
              { key: 'reviews', label: '⭐ Reviews', icon: '⭐' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '1rem 1.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? '3px solid #3b82f6' : '3px solid transparent',
                  color: activeTab === tab.key ? '#1e40af' : '#64748b',
                  fontWeight: activeTab === tab.key ? '600' : '400',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '2rem' }}>
            {activeTab === 'about' && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                  About {caregiver.fullName}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  <InfoCard icon="👤" label="Gender" value={caregiver.gender?.charAt(0).toUpperCase() + caregiver.gender?.slice(1)} />
                  <InfoCard icon="📞" label="Phone" value={caregiver.phone} />
                  <InfoCard icon="📧" label="Email" value={caregiver.email} />
                  <InfoCard icon="📍" label="City" value={caregiver.location?.city} />
                  <InfoCard icon="🗺️" label="State" value={caregiver.location?.state} />
                  <InfoCard icon="📮" label="Pincode" value={caregiver.location?.pincode} />
                  <InfoCard icon="🎂" label="Experience" value={`${caregiver.experienceYears} years`} />
                  <InfoCard icon="🗣️" label="Languages" value={caregiver.languages?.join(', ') || 'Not specified'} />
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                  Specializations & Skills
                </h3>
                {caregiver.specializations?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {caregiver.specializations.map((skill, i) => (
                      <span key={i} style={{
                        backgroundColor: '#eff6ff',
                        color: '#1e40af',
                        padding: '0.5rem 1rem',
                        borderRadius: '2rem',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        border: '1px solid #bfdbfe'
                      }}>
                        🎯 {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No specializations listed" />
                )}
              </div>
            )}

            {activeTab === 'certifications' && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                  Certifications & License
                </h3>
                {caregiver.licenseNumber && (
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem',
                    border: '1px solid #bbf7d0'
                  }}>
                    <p style={{ fontWeight: '600', color: '#065f46', marginBottom: '0.5rem' }}>📜 License Details</p>
                    <p style={{ color: '#374151', margin: '0.25rem 0', fontSize: '0.9rem' }}>
                      <strong>Number:</strong> {caregiver.licenseNumber}
                    </p>
                    {caregiver.licenseIssuingAuthority && (
                      <p style={{ color: '#374151', margin: '0.25rem 0', fontSize: '0.9rem' }}>
                        <strong>Issuing Authority:</strong> {caregiver.licenseIssuingAuthority}
                      </p>
                    )}
                    {caregiver.licenseExpiryDate && (
                      <p style={{ color: '#374151', margin: '0.25rem 0', fontSize: '0.9rem' }}>
                        <strong>Expiry:</strong> {new Date(caregiver.licenseExpiryDate).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                )}
                {caregiver.certifications?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {caregiver.certifications.map((cert, i) => (
                      <span key={i} style={{
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        padding: '0.5rem 1rem',
                        borderRadius: '2rem',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        border: '1px solid #fcd34d'
                      }}>
                        🏅 {cert}
                      </span>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No certifications listed" />
                )}
              </div>
            )}

            {activeTab === 'availability' && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                  Availability
                </h3>
                {caregiver.availability?.recurring?.length > 0 ? (
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {caregiver.availability.recurring.map((slot, i) => (
                      <div key={i} style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '0.5rem',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontWeight: '500', color: '#374151' }}>
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][slot.dayOfWeek]}
                        </span>
                        <span style={{ color: '#64748b' }}>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Availability schedule not set" />
                )}
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.75rem', border: '1px solid #bbf7d0' }}>
                  <p style={{ color: '#065f46', fontWeight: '500', fontSize: '0.9rem' }}>
                    📍 Travel Radius: Up to {caregiver.location?.travelRadius || 10} km
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                  Pricing Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {caregiver.pricing?.personal && (
                    <div style={{
                      padding: '1.5rem',
                      backgroundColor: '#eff6ff',
                      borderRadius: '0.75rem',
                      border: '1px solid #bfdbfe',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem' }}>🩺 Personal Care</p>
                      {caregiver.pricing.personal.hourly && (
                        <PriceRow label="Hourly" value={`₹${caregiver.pricing.personal.hourly}`} />
                      )}
                      {caregiver.pricing.personal.daily && (
                        <PriceRow label="Daily (8hrs)" value={`₹${caregiver.pricing.personal.daily}`} />
                      )}
                      {caregiver.pricing.personal.monthly && (
                        <PriceRow label="Monthly" value={`₹${caregiver.pricing.personal.monthly}`} />
                      )}
                      {caregiver.pricing.personal.overnight && (
                        <PriceRow label="Overnight" value={`₹${caregiver.pricing.personal.overnight}`} />
                      )}
                    </div>
                  )}
                  {caregiver.pricing?.skilled && (
                    <div style={{
                      padding: '1.5rem',
                      backgroundColor: '#fdf2f8',
                      borderRadius: '0.75rem',
                      border: '1px solid #fbcfe8',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontWeight: '600', color: '#9d174d', marginBottom: '0.75rem' }}>💉 Skilled Nursing</p>
                      {caregiver.pricing.skilled.hourly && (
                        <PriceRow label="Hourly" value={`₹${caregiver.pricing.skilled.hourly}`} />
                      )}
                      {caregiver.pricing.skilled.daily && (
                        <PriceRow label="Daily (8hrs)" value={`₹${caregiver.pricing.skilled.daily}`} />
                      )}
                      {caregiver.pricing.skilled.monthly && (
                        <PriceRow label="Monthly" value={`₹${caregiver.pricing.skilled.monthly}`} />
                      )}
                      {caregiver.pricing.skilled.overnight && (
                        <PriceRow label="Overnight" value={`₹${caregiver.pricing.skilled.overnight}`} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                  Reviews ({caregiver.ratings?.count || caregiver.totalReviews || 0})
                </h3>
                {caregiver.reviews?.length > 0 ? (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {caregiver.reviews.filter(r => r.isPublic !== false).map((review, i) => (
                      <div key={i} style={{
                        padding: '1rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '0.75rem',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '600', color: '#374151' }}>
                            {review.userId?.name || 'Anonymous'}
                          </span>
                          <span style={{ color: '#f59e0b' }}>
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </span>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                          {review.comment}
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.5rem 0 0' }}>
                          {new Date(review.date).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No reviews yet" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1.5rem',
          backgroundColor: '#1e3a8a',
          borderRadius: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <p style={{ color: 'white', fontWeight: '600', fontSize: '1.1rem', margin: 0 }}>
              Ready to book {caregiver.fullName}?
            </p>
            <p style={{ color: '#93c5fd', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
              Starting at ₹{hourlyRate}/hour
            </p>
          </div>
          <button 
            onClick={() => navigate(`/book-caregiver/${caregiver._id}`, { state: { caregiver } })}
            style={{
              padding: '0.75rem 2.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            Book Now →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

// Helper Components
const InfoCard = ({ icon, label, value }) => (
  <div style={{
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.75rem',
    border: '1px solid #e2e8f0'
  }}>
    <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0 0 0.25rem', fontWeight: '600' }}>
      {icon} {label}
    </p>
    <p style={{ color: '#1e293b', fontWeight: '500', margin: 0, fontSize: '0.95rem' }}>
      {value || 'N/A'}
    </p>
  </div>
);

const PriceRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{label}</span>
    <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{value}</span>
  </div>
);

const EmptyState = ({ message }) => (
  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
    <p style={{ fontSize: '0.9rem' }}>{message}</p>
  </div>
);

export default CaregiverProfile;
