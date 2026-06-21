import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const InsurancePolicyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    // Fetch policy details
    const fetchPolicy = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch(`/api/insurance/my-policies/${id}`);
        const data = await response.json();
        setPolicy(data.data);
      } catch (error) {
        console.error('Error fetching policy:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading policy...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Policy Details</h1>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><strong>Policy Number:</strong> {policy?.policyNumber || 'N/A'}</div>
          <div><strong>Status:</strong> <span style={{ color: '#10b981' }}>{policy?.status || 'Active'}</span></div>
          <div><strong>Plan Name:</strong> {policy?.policyName || 'N/A'}</div>
          <div><strong>Sum Insured:</strong> ₹{policy?.sumInsured?.toLocaleString() || 'N/A'}</div>
          <div><strong>Premium:</strong> ₹{policy?.premiumAmount?.toLocaleString() || 'N/A'}</div>
          <div><strong>Valid Till:</strong> {policy?.endDate ? new Date(policy.endDate).toLocaleDateString() : 'N/A'}</div>
        </div>
      </div>
      <button 
        onClick={() => navigate('/my-bookings')}
        style={{ 
          marginTop: '1.5rem',
          padding: '12px 24px', 
          backgroundColor: '#2563eb', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px', 
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Back to My Policies
      </button>
    </div>
  );
};

export default InsurancePolicyDetail;