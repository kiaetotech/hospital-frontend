import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const InsurancePolicyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claim, setClaim] = useState({ amount: '', description: '', hospitalName: '', hospitalAddress: '', admissionDate: '' });
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');

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

  const submitClaim = async (e) => {
    e.preventDefault();
    setClaimSubmitting(true); setClaimMessage('');
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      const response = await axios.post('/api/insurance-claims/file', { policyId: policy._id, ...claim, amount: Number(claim.amount) }, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data?.success) { setClaimMessage('Claim submitted successfully.'); setShowClaimForm(false);
        const refreshed = await axios.get(`/api/insurance/my-policies/${policy._id}`); if (refreshed.data?.success) setPolicy(refreshed.data.data); setClaim({ amount: '', description: '', hospitalName: '', hospitalAddress: '', admissionDate: '' }); }
    } catch (error) { setClaimMessage(error.response?.data?.message || 'Unable to submit claim'); }
    finally { setClaimSubmitting(false); }
  };

  const downloadPolicy = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/insurance/download-policy/${policy._id}`, { responseType: 'blob', headers: { Authorization: `Bearer ${token}` } });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = `${policy.policyNumber}.pdf`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (error) { setClaimMessage(error.response?.data?.message || 'Unable to download policy document'); }
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

        {showClaimForm && (
          <form onSubmit={submitClaim} style={{ borderTop: '1px solid #e5e7eb', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>File a Claim</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <input required type="number" min="1" max={policy.sumInsured} placeholder="Claim amount (₹)" value={claim.amount} onChange={e => setClaim({ ...claim, amount: e.target.value })} />
              <input required placeholder="Hospital name" value={claim.hospitalName} onChange={e => setClaim({ ...claim, hospitalName: e.target.value })} />
              <input placeholder="Hospital address" value={claim.hospitalAddress} onChange={e => setClaim({ ...claim, hospitalAddress: e.target.value })} />
              <input required type="date" value={claim.admissionDate} onChange={e => setClaim({ ...claim, admissionDate: e.target.value })} />
              <textarea required placeholder="Describe the claim" value={claim.description} onChange={e => setClaim({ ...claim, description: e.target.value })} />
              <div style={{ display: 'flex', gap: '0.5rem' }}><button type="submit" disabled={claimSubmitting} style={{ padding: '0.5rem 1rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px' }}>{claimSubmitting ? 'Submitting...' : 'Submit Claim'}</button><button type="button" onClick={() => setShowClaimForm(false)} style={{ padding: '0.5rem 1rem' }}>Cancel</button></div>
              {claimMessage && <div style={{ color: '#92400e' }}>{claimMessage}</div>}
            </div>
          </form>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
          {policy.status === 'active' && (
            <button
              onClick={() => setShowClaimForm(true)}
              style={{ padding: '0.5rem 1.5rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              📋 File a Claim
            </button>
          )}
          <button
            onClick={downloadPolicy}
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

