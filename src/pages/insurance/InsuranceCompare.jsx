import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const InsuranceCompare = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    coverage: true,
    features: true,
    pricing: true,
    network: true,
    claim: true,
    addons: true
  });

  // Get plan IDs from URL
  const planIds = searchParams.getAll('ids');

  useEffect(() => {
    if (planIds.length > 0) {
      fetchComparisonPlans(planIds);
    } else {
      // Redirect to list if no plans selected
      navigate('/insurance/list');
    }
  }, [planIds]);

  const fetchComparisonPlans = async (ids) => {
    try {
      setLoading(true);
      const promises = ids.map(id => 
        axios.get(`/api/insurance/plans/${id}`)
      );
      const responses = await Promise.all(promises);
      const plansData = responses.map(res => res.data.data);
      setPlans(plansData);
      setComparison(plansData);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const response = await axios.get('/api/insurance/plans?limit=20');
      if (response.data.success) {
        const existingIds = comparison.map(p => p._id);
        const available = response.data.data.filter(p => !existingIds.includes(p._id));
        setAvailablePlans(available);
      }
    } catch (error) {
      console.error('Error fetching available plans:', error);
    }
  };

  const handleAddPlan = () => {
    setShowAddPlan(!showAddPlan);
    if (!showAddPlan) {
      fetchAvailablePlans();
    }
  };

  const handleSelectPlan = async (planId) => {
    try {
      const response = await axios.get(`/api/insurance/plans/${planId}`);
      if (response.data.success) {
        const newPlans = [...comparison, response.data.data];
        setComparison(newPlans);
        setShowAddPlan(false);
        // Update URL
        const ids = newPlans.map(p => p._id);
        navigate(`/insurance/compare?ids=${ids.join(',')}`);
      }
    } catch (error) {
      console.error('Error adding plan:', error);
    }
  };

  const handleRemovePlan = (planId) => {
    const newPlans = comparison.filter(p => p._id !== planId);
    setComparison(newPlans);
    if (newPlans.length === 0) {
      navigate('/insurance/list');
    } else {
      const ids = newPlans.map(p => p._id);
      navigate(`/insurance/compare?ids=${ids.join(',')}`);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getPlanTypeLabel = (type) => {
    const map = {
      'individual': 'Individual',
      'family_floater': 'Family Floater',
      'critical_illness': 'Critical Illness',
      'senior_citizen': 'Senior Citizen',
      'maternity': 'Maternity'
    };
    return map[type] || type;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem', textAlign: 'center' }}>
        <p>Loading comparison...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => navigate('/insurance/list')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ← Back to Plans
            </button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📊 Compare Plans
            </h1>
            <div style={{ width: '100px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        {/* Comparison Grid */}
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '800px' }}>
            {/* Header Row - Plan Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(comparison.length + 1, 5)}, 1fr)`, gap: '1rem', marginBottom: '1.5rem' }}>
              {comparison.map((plan) => (
                <div key={plan._id} style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  position: 'relative',
                  borderTop: '4px solid #2563eb'
                }}>
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemovePlan(plan._id)}
                    style={{ 
                      position: 'absolute', 
                      top: '8px', 
                      right: '8px',
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      borderRadius: '50%',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px'
                    }}
                  >
                    ✕
                  </button>

                  {/* Company logo */}
                  <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: '#dbeafe', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                      }}>
                        🏢
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {plan.companyId?.name || 'Insurance Company'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>
                          {getPlanTypeLabel(plan.planType)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan name */}
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>{plan.planName}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                      <span>⭐</span>
                      <span>{plan.rating || 0}</span>
                      <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>({plan.totalReviews || 0} reviews)</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ padding: '1rem', backgroundColor: '#eff6ff' }}>
                    <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>Starting from</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
                      {formatCurrency(plan.basePremium)}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#6b7280' }}>per year incl. GST</div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => navigate(`/insurance/plan/${plan._id}`)}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      backgroundColor: '#2563eb', 
                      color: 'white', 
                      border: 'none', 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }}
                  >
                    View Details
                  </button>
                </div>
              ))}

              {/* Add Plan Card */}
              {comparison.length < 4 && (
                <div 
                  onClick={handleAddPlan}
                  style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '2px dashed #d1d5db',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    minHeight: '300px'
                  }}
                >
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    ➕
                  </div>
                  <p style={{ fontWeight: 'bold' }}>Add Plan</p>
                  <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>Compare up to 4 plans</p>
                </div>
              )}
            </div>

            {/* Add Plan Dropdown */}
            {showAddPlan && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Select a plan to compare</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
                  {availablePlans.map((plan) => (
                    <button
                      key={plan._id}
                      onClick={() => handleSelectPlan(plan._id)}
                      style={{ 
                        padding: '0.75rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '8px',
                        background: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{plan.planName}</div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{plan.companyId?.name}</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(plan.basePremium)}</div>
                    </button>
                  ))}
                  {availablePlans.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '1rem' }}>No more plans available to compare</div>
                  )}
                </div>
                <button
                  onClick={() => setShowAddPlan(false)}
                  style={{ marginTop: '0.5rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Comparison Table - Sections */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              {/* Plan Type */}
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparison.length + 1}, 1fr)` }}>
                  <div style={{ fontWeight: 'bold', color: '#4b5563' }}>Plan Type</div>
                  {comparison.map((plan) => (
                    <div key={plan._id}>{getPlanTypeLabel(plan.planType)}</div>
                  ))}
                </div>
              </div>

              {/* Coverage Section */}
              <div style={{ borderBottom: '1px solid #f3f4f6' }}>
                <button
                  onClick={() => toggleSection('coverage')}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem 1rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  <span>🛡️ Coverage Details</span>
                  <span>{expandedSections.coverage ? '▲' : '▼'}</span>
                </button>
                {expandedSections.coverage && (
                  <div style={{ padding: '0.75rem 1rem' }}>
                    {/* Sum Insured */}
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparison.length + 1}, 1fr)`, padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Sum Insured</div>
                      {comparison.map((plan) => (
                        <div key={plan._id} style={{ fontWeight: 'bold' }}>{formatCurrency(plan.sumInsured?.default || 0)}</div>
                      ))}
                    </div>
                    {/* Room Rent Limit */}
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparison.length + 1}, 1fr)`, padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Room Rent Limit</div>
                      {comparison.map((plan) => (
                        <div key={plan._id} style={{ textTransform: 'capitalize' }}>{plan.roomRentLimit || 'Standard'}</div>
                      ))}
                    </div>
                    {/* ICU Coverage */}
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparison.length + 1}, 1fr)`, padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>ICU Coverage</div>
                      {comparison.map((plan) => (
                        <div key={plan._id}>{plan.icuCoverage ? '✅' : '❌'}</div>
                      ))}
                    </div>
                    {/* Daycare Coverage */}
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparison.length + 1}, 1fr)`, padding: '0.5rem 0' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Daycare Coverage</div>
                      {comparison.map((plan) => (
                        <div key={plan._id}>{plan.daycareCoverage ? '✅' : '❌'}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Features Section */}
              <div style={{ borderBottom: '1px solid #f3f4f6' }}>
                <button
                  onClick={() => toggleSection('features')}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem 1rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  <span>✨ Features & Benefits</span>
                  <span>{expandedSections.features ? '▲' : '▼'}</span>
                </button>
                {expandedSections.features && (
                  <div style={{ padding: '0.75rem 1rem' }}>
                    {comparison.map((plan) => (
                      <div key={plan._id} style={{ marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{plan.planName}</div>
                        <ul style={{ margin: '0.25rem 0', paddingLeft: '1.2rem' }}>
                          {(plan.features || []).slice(0, 5).map((feature, idx) => (
                            <li key={idx} style={{ fontSize: '0.875rem' }}>✅ {typeof feature === 'string' ? feature : feature.title}</li>
                          ))}
                          {(plan.features || []).length > 5 && (
                            <li style={{ fontSize: '0.875rem', color: '#2563eb' }}>+{plan.features.length - 5} more features</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Claim Process Section */}
              <div style={{ borderBottom: '1px solid #f3f4f6' }}>
                <button
                  onClick={() => toggleSection('claim')}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem 1rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  <span>🏆 Claim Process</span>
                  <span>{expandedSections.claim ? '▲' : '▼'}</span>
                </button>
                {expandedSections.claim && (
                  <div style={{ padding: '0.75rem 1rem' }}>
                    {/* Cashless */}
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparison.length + 1}, 1fr)`, padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Cashless Claim</div>
                      {comparison.map((plan) => (
                        <div key={plan._id}>{plan.claimProcess?.cashless ? '✅' : '❌'}</div>
                      ))}
                    </div>
                    {/* Claim Settlement Ratio */}
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparison.length + 1}, 1fr)`, padding: '0.5rem 0' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Claim Settlement Ratio</div>
                      {comparison.map((plan) => (
                        <div key={plan._id}>{plan.claimProcess?.claimSettlementRatio || 'N/A'}%</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA - Buy Now */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparison.length}, 1fr)`, gap: '1rem', marginTop: '1.5rem' }}>
              {comparison.map((plan) => (
                <button
                  key={plan._id}
                  onClick={() => navigate(`/insurance/apply/${plan._id}`)}
                  style={{ 
                    padding: '0.75rem', 
                    backgroundColor: '#2563eb', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  🛡️ Buy {plan.planName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceCompare;

