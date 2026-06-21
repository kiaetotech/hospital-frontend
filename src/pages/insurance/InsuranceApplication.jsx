import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const InsuranceApplication = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    // Fetch plan details
    const fetchPlan = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch(`/api/insurance/plans/${planId}`);
        const data = await response.json();
        setPlan(data.data);
      } catch (error) {
        console.error('Error fetching plan:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading application...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Apply for Insurance</h1>
      <p>Application for: {plan?.planName || 'Plan'}</p>
      <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <p><strong>Plan:</strong> {plan?.planName}</p>
        <p><strong>Company:</strong> {plan?.companyId?.name}</p>
        <p><strong>Premium:</strong> ₹{plan?.basePremium}</p>
      </div>
      <button 
        onClick={() => navigate('/insurance/confirmation')}
        style={{ 
          padding: '12px 24px', 
          backgroundColor: '#2563eb', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px', 
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Proceed to Payment
      </button>
    </div>
  );
};

export default InsuranceApplication;