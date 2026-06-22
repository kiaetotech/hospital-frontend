import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const CorporatePlanDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlanDetails();
  }, [id]);

  const fetchPlanDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/corporate/plans/${id}`);
      if (res.data.success) {
        setPlan(res.data.data);
      } else {
        setError('Plan not found');
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      setError('Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <p>Loading plan details...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Plan Not Found</h2>
          <p style={{ color: '#6b7280' }}>{error || 'The plan you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/corporate/plans')} style={{ marginTop: '1rem', padding: '10px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Browse Plans</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/corporate/plans')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>📋 Plan Details</h1>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {/* Plan Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{plan.planName}</h2>
              <p style={{ color: '#6b7280' }}>{plan.companyName}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ padding: '2px 10px', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '12px', fontSize: '0.75rem' }}>{plan.planType}</span>
                <span style={{ padding: '2px 10px', backgroundColor: plan.status === 'active' ? '#dcfce7' : '#fef3c7', color: plan.status === 'active' ? '#166534' : '#92400e', borderRadius: '12px', fontSize: '0.75rem' }}>
                  {plan.status}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Starting from</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(plan.premiumPerEmployee)}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>per employee per year</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Total Premium</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatCurrency(plan.totalPremium)}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Employees</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{plan.employeeCount || 0}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Coverage</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatCurrency(plan.coverageAmount)}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Valid Till</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{plan.endDate ? new Date(plan.endDate).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>

          {/* Features */}
          {plan.features && plan.features.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>✨ Features</h3>
              <ul style={{ paddingLeft: '1.2rem' }}>
                {plan.features.map((f, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>✅ {f}</li>)}
              </ul>
            </div>
          )}

          {/* Inclusions & Exclusions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {plan.inclusions && plan.inclusions.length > 0 && (
              <div>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#10b981' }}>✅ Inclusions</h3>
                <ul style={{ paddingLeft: '1.2rem' }}>
                  {plan.inclusions.map((item, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>)}
                </ul>
              </div>
            )}
            {plan.exclusions && plan.exclusions.length > 0 && (
              <div>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#dc2626' }}>❌ Exclusions</h3>
                <ul style={{ paddingLeft: '1.2rem' }}>
                  {plan.exclusions.map((item, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Benefits */}
          {plan.benefits && plan.benefits.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🎁 Benefits</h3>
              {plan.benefits.map((b, i) => (
                <div key={i} style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '6px', marginBottom: '0.25rem' }}>
                  <strong>{b.name}</strong> - {b.description} {b.limit && `(Limit: ${formatCurrency(b.limit)})`}
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/corporate/enroll', { state: { planId: plan._id } })}
              style={{ padding: '10px 32px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🏢 Enroll Your Company
            </button>
            <button
              onClick={() => navigate('/corporate/plans')}
              style={{ padding: '10px 32px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ← Browse More Plans
            </button>
            <button
              onClick={() => window.print()}
              style={{ padding: '10px 32px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🖨️ Print Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporatePlanDetail;