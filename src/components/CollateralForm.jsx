import React, { useState } from 'react';

const CollateralForm = ({ onCollateralSubmit }) => {
  const [collateral, setCollateral] = useState({
    type: '',
    estimatedValue: '',
    description: '',
    documentsUploaded: false
  });

  const collateralTypes = ['Property / Land', 'Gold / Jewelry', 'Fixed Deposit', 'Vehicle', 'Other Assets'];

  const handleSubmit = () => {
    if (!collateral.type || !collateral.estimatedValue) {
      alert('Please select collateral type and enter value');
      return;
    }
    onCollateralSubmit(collateral);
  };

  return (
    <div style={{ marginBottom: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
      <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>🏠 Collateral / Mortgage Details (Required for Secured Loans)</h4>
      
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Collateral Type *</label>
        <select
          value={collateral.type}
          onChange={(e) => setCollateral({...collateral, type: e.target.value})}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
        >
          <option value="">Select type</option>
          {collateralTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Estimated Value (₹) *</label>
        <input
          type="number"
          value={collateral.estimatedValue}
          onChange={(e) => setCollateral({...collateral, estimatedValue: e.target.value})}
          placeholder="Enter market value"
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
        />
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Description / Location</label>
        <textarea
          value={collateral.description}
          onChange={(e) => setCollateral({...collateral, description: e.target.value})}
          rows="2"
          placeholder="Add details (location, property number, etc.)"
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }}
        />
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={collateral.documentsUploaded}
            onChange={(e) => setCollateral({...collateral, documentsUploaded: e.target.checked})}
          />
          <span style={{ fontSize: '0.875rem' }}>I confirm that I have valid documents for this collateral (e.g., property deed, gold valuation, FD certificate)</span>
        </label>
      </div>

      <button
        onClick={handleSubmit}
        style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
      >
        Confirm Collateral Details
      </button>
    </div>
  );
};

export default CollateralForm;

