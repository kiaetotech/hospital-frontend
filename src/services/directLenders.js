// Mock Direct lenders (with mortgage/collateral option)
export const directLenders = [
  {
    id: 'direct_1',
    name: 'HealthFin Secured',
    logo: '🏥',
    type: 'Secured (Mortgage)',
    minCibil: 650,
    maxLoan: 10000000,
    minLoan: 200000,
    interestRate: 9.5,
    tenure: [12, 24, 36, 48, 60, 72],
    processingFee: 1,
    approvalTime: '2-3 days',
    requiresCollateral: true,
    collateralTypes: ['Property', 'Fixed Deposit', 'Gold'],
    description: 'Lowest interest with property mortgage'
  },
  {
    id: 'direct_2',
    name: 'MedLoan Gold',
    logo: '⭐',
    type: 'Secured (Gold Loan)',
    minCibil: 600,
    maxLoan: 2500000,
    minLoan: 20000,
    interestRate: 10.5,
    tenure: [6, 12, 24, 36],
    processingFee: 0.5,
    approvalTime: 'Same day',
    requiresCollateral: true,
    collateralTypes: ['Gold', 'Jewelry'],
    description: 'Loan against gold - instant approval'
  },
  {
    id: 'direct_3',
    name: 'CareFirst Secured',
    logo: '🩺',
    type: 'Secured (FD/Property)',
    minCibil: 620,
    maxLoan: 7500000,
    minLoan: 50000,
    interestRate: 11,
    tenure: [12, 24, 36, 48],
    processingFee: 1.5,
    approvalTime: '3-5 days',
    requiresCollateral: true,
    collateralTypes: ['Property', 'Fixed Deposit', 'Vehicle'],
    description: 'Multiple collateral options available'
  }
];

