import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const InsuranceDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    coverage: true,
    features: true,
    inclusions: true,
    exclusions: true,
    addons: true,
    network: true,
    claim: true,
    tax: true,
    documents: true
  });

  useEffect(() => {
    fetchPlanDetails();
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/insurance/plans/${id}`);
      if (response.data.success) {
        setPlan(response.data.data);
      } else {
        setError('Failed to load plan details');
      }
    } catch (error) {
      console.error('Error fetching plan details:', error);
      setError('Error loading plan details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPlanTypeLabel = (type) => {
    const map = {
      'individual': 'Individual',
      'family_floater': 'Family Floater',
      'critical_illness': 'Critical Illness',
      'senior_citizen': 'Senior Citizen',
      'maternity': 'Maternity',
      'personal_accident': 'Personal Accident',
      'travel': 'Travel Insurance'
    };
    return map[type] || type;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading plan details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Plan Not Found</h2>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 1rem' }}>{error || 'The plan you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/insurance/list')}
            style={{ padding: '0.5rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Browse Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* ============================================
          HEADER
          ============================================ */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => navigate(-1)}
                style={{ color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}
              >
                ←
              </button>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{plan.planName}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280', flexWrap: 'wrap' }}>
                  <span>{plan.companyId?.name || 'Insurance Company'}</span>
                  <span>•</span>
                  <span>{getPlanTypeLabel(plan.planType)}</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                    ⭐ {plan.rating || 0}
                    {plan.totalReviews > 0 && <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>({plan.totalReviews} reviews)</span>}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(`/insurance/compare?ids=${plan._id}`)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '8px', background: 'white', cursor: 'pointer', fontWeight: '500' }}
              >
                📊 Compare
              </button>
              <button
                onClick={() => navigate(`/insurance/apply/${plan._id}`)}
                style={{ padding: '0.5rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                🛡️ Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* ============================================
              QUICK STATS BAR
              ============================================ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Sum Insured</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatCurrency(plan.sumInsured?.default || 0)}</div>
              {plan.sumInsured?.min && plan.sumInsured?.max && (
                <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>Min: {formatCurrency(plan.sumInsured.min)} • Max: {formatCurrency(plan.sumInsured.max)}</div>
              )}
            </div>
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Premium</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(plan.basePremium)}</div>
              <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>per year incl. GST</div>
              {plan.discountPercentage > 0 && (
                <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 'bold' }}>{plan.discountPercentage}% OFF</div>
              )}
            </div>
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Plan Type</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{getPlanTypeLabel(plan.planType)}</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Rating</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }}>⭐ {plan.rating || 0}</div>
              <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>{plan.totalReviews || 0} reviews</div>
            </div>
          </div>

          {/* ============================================
              OVERVIEW SECTION
              ============================================ */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <button
              onClick={() => toggleSection('overview')}
              style={{ 
                width: '100%', 
                padding: '1rem 1.5rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                borderBottom: expandedSections.overview ? '1px solid #f3f4f6' : 'none'
              }}
            >
              <span>📋 Overview</span>
              <span>{expandedSections.overview ? '▲' : '▼'}</span>
            </button>
            {expandedSections.overview && (
              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                  {plan.description || 'No description available for this plan.'}
                </p>
                {plan.shortDescription && (
                  <p style={{ color: '#6b7280', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    {plan.shortDescription}
                  </p>
                )}
                {plan.keyHighlights && plan.keyHighlights.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                    {plan.keyHighlights.map((highlight, idx) => (
                      <span key={idx} style={{ padding: '0.25rem 0.75rem', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '20px', fontSize: '0.75rem' }}>
                        ⭐ {highlight}
                      </span>
                    ))}
                  </div>
                )}
                {plan.tags && plan.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {plan.tags.map((tag, idx) => (
                      <span key={idx} style={{ padding: '0.25rem 0.75rem', backgroundColor: '#f3f4f6', color: '#4b5563', borderRadius: '20px', fontSize: '0.75rem' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ============================================
              COVERAGE DETAILS
              ============================================ */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <button
              onClick={() => toggleSection('coverage')}
              style={{ 
                width: '100%', 
                padding: '1rem 1.5rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                borderBottom: expandedSections.coverage ? '1px solid #f3f4f6' : 'none'
              }}
            >
              <span>🛡️ Coverage Details</span>
              <span>{expandedSections.coverage ? '▲' : '▼'}</span>
            </button>
            {expandedSections.coverage && (
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Sum Insured</div>
                    <div style={{ fontWeight: 'bold' }}>{formatCurrency(plan.sumInsured?.default || 0)}</div>
                    <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>Min: {formatCurrency(plan.sumInsured?.min || 0)} • Max: {formatCurrency(plan.sumInsured?.max || 0)}</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Room Rent Limit</div>
                    <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{plan.roomRentLimit || 'Standard'}</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>ICU Coverage</div>
                    <div style={{ fontWeight: 'bold' }}>{plan.icuCoverage ? '✅ Yes' : '❌ No'}</div>
                    {plan.icuLimit && <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>{plan.icuLimit}% of sum insured</div>}
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Daycare Coverage</div>
                    <div style={{ fontWeight: 'bold' }}>{plan.daycareCoverage ? '✅ Yes' : '❌ No'}</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Ambulance Coverage</div>
                    <div style={{ fontWeight: 'bold' }}>{plan.ambulanceCoverage ? '✅ Yes' : '❌ No'}</div>
                    {plan.ambulanceLimit && <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>₹{plan.ambulanceLimit}</div>}
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Domiciliary Coverage</div>
                    <div style={{ fontWeight: 'bold' }}>{plan.domiciliaryCoverage ? '✅ Yes' : '❌ No'}</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Hospitalization Coverage</div>
                    <div style={{ fontWeight: 'bold' }}>{plan.hospitalizationCoverage ? '✅ Yes' : '❌ No'}</div>
                    {plan.preHospitalizationDays && <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>Pre: {plan.preHospitalizationDays} days</div>}
                    {plan.postHospitalizationDays && <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>Post: {plan.postHospitalizationDays} days</div>}
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Pre-existing Waiting</div>
                    <div style={{ fontWeight: 'bold' }}>{plan.preExistingWaiting || 48} months</div>
                    {plan.preExistingWaiting && <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>{plan.preExistingWaiting > 0 ? 'Standard waiting period' : 'No waiting period'}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================
              FEATURES & BENEFITS
              ============================================ */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <button
              onClick={() => toggleSection('features')}
              style={{ 
                width: '100%', 
                padding: '1rem 1.5rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                borderBottom: expandedSections.features ? '1px solid #f3f4f6' : 'none'
              }}
            >
              <span>✨ Features & Benefits</span>
              <span>{expandedSections.features ? '▲' : '▼'}</span>
            </button>
            {expandedSections.features && (
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                  {(plan.features || []).map((feature, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '0.75rem', 
                      padding: '0.75rem', 
                      backgroundColor: '#f9fafb', 
                      borderRadius: '8px',
                      border: feature.included !== false ? '1px solid #d1fae5' : '1px solid #fee2e2'
                    }}>
                      <span style={{ fontSize: '1.25rem' }}>{feature.included !== false ? '✅' : '❌'}</span>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{typeof feature === 'string' ? feature : feature.title}</div>
                        {typeof feature !== 'string' && feature.description && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{feature.description}</div>
                        )}
                        {typeof feature !== 'string' && feature.category && (
                          <div style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: '0.25rem' }}>Category: {feature.category}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {(plan.features || []).length === 0 && (
                  <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>No features listed for this plan.</p>
                )}
              </div>
            )}
          </div>

          {/* ============================================
              INCLUSIONS & EXCLUSIONS
              ============================================ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Inclusions */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <button
                onClick={() => toggleSection('inclusions')}
                style={{ 
                  width: '100%', 
                  padding: '1rem 1.5rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  borderBottom: expandedSections.inclusions ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <span style={{ color: '#10b981' }}>✅ Inclusions</span>
                <span>{expandedSections.inclusions ? '▲' : '▼'}</span>
              </button>
              {expandedSections.inclusions && (
                <div style={{ padding: '1.5rem' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    {(plan.inclusions || []).map((item, idx) => (
                      <li key={idx} style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{item}</li>
                    ))}
                  </ul>
                  {(plan.inclusions || []).length === 0 && (
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>No inclusions listed.</p>
                  )}
                </div>
              )}
            </div>

            {/* Exclusions */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <button
                onClick={() => toggleSection('exclusions')}
                style={{ 
                  width: '100%', 
                  padding: '1rem 1.5rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  borderBottom: expandedSections.exclusions ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <span style={{ color: '#dc2626' }}>❌ Exclusions</span>
                <span>{expandedSections.exclusions ? '▲' : '▼'}</span>
              </button>
              {expandedSections.exclusions && (
                <div style={{ padding: '1.5rem' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    {(plan.exclusions || []).map((item, idx) => (
                      <li key={idx} style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{item}</li>
                    ))}
                  </ul>
                  {(plan.exclusions || []).length === 0 && (
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>No exclusions listed.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ============================================
              ADD-ONS / RIDERS
              ============================================ */}
          {(plan.addons || []).length > 0 && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <button
                onClick={() => toggleSection('addons')}
                style={{ 
                  width: '100%', 
                  padding: '1rem 1.5rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  borderBottom: expandedSections.addons ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <span>➕ Add-ons / Riders</span>
                <span>{expandedSections.addons ? '▲' : '▼'}</span>
              </button>
              {expandedSections.addons && (
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                    {(plan.addons || []).map((addon, idx) => (
                      <div key={idx} style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{addon.name}</div>
                            {addon.description && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{addon.description}</div>}
                          </div>
                          <div style={{ fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(addon.price || 0)}</div>
                        </div>
                        {addon.coverage && (
                          <div style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: '0.25rem' }}>Coverage: {addon.coverage}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================
              NETWORK HOSPITALS
              ============================================ */}
          {(plan.networkHospitals && plan.networkHospitals.length > 0) || plan.totalNetworkHospitals > 0 ? (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <button
                onClick={() => toggleSection('network')}
                style={{ 
                  width: '100%', 
                  padding: '1rem 1.5rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  borderBottom: expandedSections.network ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <span>🏥 Network Hospitals</span>
                <span>{expandedSections.network ? '▲' : '▼'}</span>
              </button>
              {expandedSections.network && (
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Network Hospitals</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{plan.totalNetworkHospitals || plan.networkHospitals?.length || 0}</div>
                  </div>
                  {(plan.networkHospitals || []).length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                      {plan.networkHospitals.map((hospital, idx) => (
                        <div key={idx} style={{ padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{hospital.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{hospital.city}, {hospital.state}</div>
                          {hospital.address && <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>{hospital.address}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>No network hospitals listed for this plan.</p>
                  )}
                  {(plan.networkHospitals || []).length > 10 && (
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#2563eb', marginTop: '0.5rem' }}>
                      +{(plan.networkHospitals || []).length - 10} more hospitals
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : null}

          {/* ============================================
              CLAIM PROCESS
              ============================================ */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <button
              onClick={() => toggleSection('claim')}
              style={{ 
                width: '100%', 
                padding: '1rem 1.5rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                borderBottom: expandedSections.claim ? '1px solid #f3f4f6' : 'none'
              }}
            >
              <span>🏆 Claim Process</span>
              <span>{expandedSections.claim ? '▲' : '▼'}</span>
            </button>
            {expandedSections.claim && (
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Cashless Claim</div>
                    <div style={{ fontWeight: 'bold' }}>{plan.claimProcess?.cashless ? '✅ Available' : '❌ Not Available'}</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Claim Settlement Ratio</div>
                    <div style={{ fontWeight: 'bold' }}>{plan.claimProcess?.claimSettlementRatio || 'N/A'}%</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Avg. Settlement Time</div>
                    <div style={{ fontWeight: 'bold' }}>{plan.claimProcess?.averageSettlementTime || 'Standard'}</div>
                  </div>
                </div>

                {plan.claimProcess?.processDescription && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Process Description</div>
                    <p style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.25rem' }}>{plan.claimProcess.processDescription}</p>
                  </div>
                )}

                {(plan.claimProcess?.requiredDocuments || []).length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Required Documents</div>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                      {plan.claimProcess.requiredDocuments.map((doc, idx) => (
                        <li key={idx} style={{ fontSize: '0.875rem', color: '#4b5563' }}>📄 {doc}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {plan.claimProcess?.claimIntimationNumber && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    Claim Intimation Number: <strong>{plan.claimProcess.claimIntimationNumber}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ============================================
              TAX BENEFITS
              ============================================ */}
          {(plan.taxBenefits || []).length > 0 && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <button
                onClick={() => toggleSection('tax')}
                style={{ 
                  width: '100%', 
                  padding: '1rem 1.5rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  borderBottom: expandedSections.tax ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <span>💰 Tax Benefits</span>
                <span>{expandedSections.tax ? '▲' : '▼'}</span>
              </button>
              {expandedSections.tax && (
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                    {(plan.taxBenefits || []).map((tax, idx) => (
                      <div key={idx} style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                        <div style={{ fontWeight: 'bold' }}>Section {tax.section}</div>
                        <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>{tax.description}</div>
                        {tax.maxAmount && (
                          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold', marginTop: '0.25rem' }}>
                            Up to ₹{tax.maxAmount.toLocaleString()} deduction
                          </div>
                        )}
                        {tax.eligibility && (
                          <div style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: '0.25rem' }}>Eligibility: {tax.eligibility}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================
              DOCUMENTS
              ============================================ */}
          {(plan.brochureUrl || plan.policyWordingsUrl || plan.proposalFormUrl || plan.claimFormUrl) && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <button
                onClick={() => toggleSection('documents')}
                style={{ 
                  width: '100%', 
                  padding: '1rem 1.5rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  borderBottom: expandedSections.documents ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <span>📄 Documents</span>
                <span>{expandedSections.documents ? '▲' : '▼'}</span>
              </button>
              {expandedSections.documents && (
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {plan.brochureUrl && (
                      <a href={plan.brochureUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📄 Brochure
                      </a>
                    )}
                    {plan.policyWordingsUrl && (
                      <a href={plan.policyWordingsUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📜 Policy Wordings
                      </a>
                    )}
                    {plan.proposalFormUrl && (
                      <a href={plan.proposalFormUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📝 Proposal Form
                      </a>
                    )}
                    {plan.claimFormUrl && (
                      <a href={plan.claimFormUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📋 Claim Form
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================
              COMPANY INFO
              ============================================ */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>🏢 Insurance Company</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Company Name</div>
                <div style={{ fontWeight: 'bold' }}>{plan.companyId?.name || 'N/A'}</div>
              </div>
              {plan.companyId?.email && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Email</div>
                  <div>{plan.companyId.email}</div>
                </div>
              )}
              {plan.companyId?.phone && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Phone</div>
                  <div>{plan.companyId.phone}</div>
                </div>
              )}
              {plan.companyId?.website && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Website</div>
                  <a href={plan.companyId.website} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                    Visit Website →
                  </a>
                </div>
              )}
              {plan.companyId?.address && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Address</div>
                  <div style={{ fontSize: '0.875rem' }}>{plan.companyId.address}</div>
                </div>
              )}
              {plan.companyId?.isVerified && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Verification Status</div>
                  <div style={{ color: '#10b981', fontWeight: 'bold' }}>✅ Verified</div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================
              CTA - FLOATING BOTTOM BAR
              ============================================ */}
          <div style={{ 
            position: 'sticky', 
            bottom: 0, 
            backgroundColor: 'white', 
            borderTop: '1px solid #e5e7eb',
            padding: '1rem',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            zIndex: 20
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Starting from</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(plan.basePremium)}</div>
              <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>per year incl. GST</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(`/insurance/compare?ids=${plan._id}`)}
                style={{ padding: '0.6rem 1.5rem', border: '1px solid #2563eb', borderRadius: '8px', background: 'white', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}
              >
                📊 Compare
              </button>
              <button
                onClick={() => navigate(`/insurance/apply/${plan._id}`)}
                style={{ padding: '0.6rem 2rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
              >
                🛡️ Apply Now
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InsuranceDetail;