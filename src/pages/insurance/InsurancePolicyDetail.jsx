import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const InsurancePolicyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await axios.get(`/api/insurance/my-policies/${id}`);
        if (response.data.success) {
          setPolicy(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching policy:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem', textAlign: 'center' }}>
        <p>Loading policy details...</p>
      </div>
    );
  }

  if (!policy) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Policy Not Found</h2>
          <button
            onClick={() => navigate('/my-bookings')}
            style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <button
        onClick={() => navigate('/my-bookings')}
        style={{ marginBottom: '1.5rem', padding: '8px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
      >
        ← Back to My Bookings
      </button>

      <h1 style={{ fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🛡️ Policy Details
      </h1>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Policy Number</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{policy.policyNumber}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Status</div>
            <div>
              <span style={{ 
                padding: '0.25rem 0.75rem', 
                borderRadius: '20px',
                backgroundColor: policy.status === 'active' ? '#d1fae5' : '#fef3c7',
                color: policy.status === 'active' ? '#065f46' : '#92400e',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>
                {policy.status?.toUpperCase() || 'PENDING'}
              </span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Plan Name</div>
            <div style={{ fontWeight: 'bold' }}>{policy.policyName}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Company</div>
            <div style={{ fontWeight: 'bold' }}>{policy.companyId?.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Sum Insured</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{formatCurrency(policy.sumInsured)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Premium</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#2563eb' }}>{formatCurrency(policy.premiumAmount)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Valid From</div>
            <div>{policy.startDate ? new Date(policy.startDate).toLocaleDateString() : 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Valid Till</div>
            <div>{policy.endDate ? new Date(policy.endDate).toLocaleDateString() : 'N/A'}</div>
          </div>
        </div>

        {/* Members */}
        {policy.members && policy.members.length > 0 && (
          <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>👨‍👩‍👧‍👦 Members Covered</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <div style={{ fontWeight: 'bold' }}>{policy.primaryInsured?.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Primary (Age {policy.primaryInsured?.age})</div>
              </div>
              {policy.members.map((member, idx) => (
                <div key={idx} style={{ padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 'bold' }}>{member.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{member.relation} (Age {member.age})</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claims */}
        {policy.claims && policy.claims.length > 0 && (
          <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📋 Claims History</h3>
            {policy.claims.map((claim, idx) => (
              <div key={idx} style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '6px', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>Claim ID:</strong> {claim.claimId}
                  </div>
                  <div>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '12px',
                      backgroundColor: claim.status === 'settled' ? '#d1fae5' : '#fef3c7',
                      color: claim.status === 'settled' ? '#065f46' : '#92400e',
                      fontSize: '0.75rem'
                    }}>
                      {claim.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Amount: {formatCurrency(claim.amount)} • Date: {new Date(claim.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
          {policy.status === 'active' && (
            <button
              onClick={() => navigate(`/insurance/claims/submit/${policy._id}`)}
              style={{ padding: '0.5rem 1.5rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              📋 File a Claim
            </button>
          )}
          <button
            onClick={() => window.open(policy.policyDocumentUrl, '_blank')}
            style={{ padding: '0.5rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            📄 Download Policy
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsurancePolicyDetail;
