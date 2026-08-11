import React from 'react';

const LoanOfferCard = ({ lender, amount, onSelect, isSelected }) => {
  const emi = (amount * (lender.interestRate / 100 / 12) * Math.pow(1 + (lender.interestRate / 100 / 12), 12)) / (Math.pow(1 + (lender.interestRate / 100 / 12), 12) - 1);
  
  return (
    <div
      onClick={() => onSelect(lender)}
      style={{
        border: isSelected ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1rem',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#f3e8ff' : 'white'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{lender.logo}</span>
          <strong>{lender.name}</strong>
          <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: '#e5e7eb', borderRadius: '1rem' }}>
            {lender.type}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>{lender.interestRate}% p.a.</span>
          <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>{lender.approvalTime}</p>
        </div>
      </div>
      
      <div style={{ marginTop: '0.5rem' }}>
        <p style={{ fontSize: '0.875rem' }}>Loan: ₹{lender.minLoan.toLocaleString()} - ₹{lender.maxLoan.toLocaleString()}</p>
        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{lender.description}</p>
        {lender.requiresCollateral && (
          <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>🏠 Collateral Required: {lender.collateralTypes?.join(', ')}</span>
        )}
        {!lender.requiresCollateral && lender.interestRate === 0 && (
          <span style={{ fontSize: '0.7rem', color: '#10b981' }}>🔥 0% EMI Offer</span>
        )}
      </div>
      
      {isSelected && (
        <div style={{ marginTop: '0.75rem', padding: '0.5rem', backgroundColor: '#ecfdf5', borderRadius: '0.5rem' }}>
          <p style={{ fontSize: '0.875rem' }}>
            <strong>Estimated EMI (12 months):</strong> ₹{Math.round(emi).toLocaleString()}/month
          </p>
        </div>
      )}
    </div>
  );
};

export default LoanOfferCard;

