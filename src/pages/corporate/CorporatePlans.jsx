import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CorporatePlans = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [filters, setFilters] = useState({
    minEmployees: '',
    maxEmployees: '',
    sort: ''
  });

  useEffect(() => {
    fetchPlans();
  }, [filters]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.minEmployees) params.append('minEmployees', filters.minEmployees);
      if (filters.maxEmployees) params.append('maxEmployees', filters.maxEmployees);
      if (filters.sort) params.append('sort', filters.sort);

      const res = await axios.get(`/api/corporate/plans?${params.toString()}`);
      if (res.data.success) setPlans(res.data.data);
    } catch (error) {
      console.error('Error fetching corporate plans:', error);
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/corporate')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🛡️ Group Health Insurance Plans</h1>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Min Employees</label>
            <input type="number" value={filters.minEmployees} onChange={(e) => setFilters({ ...filters, minEmployees: e.target.value })} style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', width: '100px' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Max Employees</label>
            <input type="number" value={filters.maxEmployees} onChange={(e) => setFilters({ ...filters, maxEmployees: e.target.value })} style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', width: '100px' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Sort By</label>
            <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
              <option value="">Popular</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
          <button onClick={fetchPlans} style={{ alignSelf: 'flex-end', padding: '8px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Apply</button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem' }}>Loading plans...</p>
        ) : plans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px' }}>
            <p style={{ color: '#6b7280' }}>No corporate plans available</p>
            <button onClick={() => navigate('/corporate/enroll')} style={{ marginTop: '1rem', padding: '10px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Enroll Your Company</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {plans.map((plan) => (
              <div key={plan._id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: '4px solid #2563eb' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{plan.planName}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{plan.companyName}</p>
                <div style={{ margin: '12px 0' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(plan.premiumPerEmployee)}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>per employee per year</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div><span style={{ color: '#6b7280', fontSize: '0.75rem' }}>Min Employees</span><br /><strong>{plan.employeeCount || 10}</strong></div>
                  <div><span style={{ color: '#6b7280', fontSize: '0.75rem' }}>Coverage</span><br /><strong>{formatCurrency(plan.coverageAmount)}</strong></div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => navigate(`/corporate/plan/${plan._id}`)} style={{ flex: 1, padding: '8px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>View Details</button>
                  <button onClick={() => navigate('/corporate/enroll', { state: { planId: plan._id } })} style={{ flex: 1, padding: '8px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Enroll</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CorporatePlans;

