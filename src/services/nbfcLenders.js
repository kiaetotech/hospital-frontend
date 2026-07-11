// Mock NBFC lenders (Bajaj, Hero FinCorp, SMFG, etc.)
export const nbfcLenders = [
  {
    id: 'nbfc_1',
    name: 'Bajaj Finserv',
    logo: '🏦',
    type: 'NBFC',
    minCibil: 725,
    maxLoan: 5500000,
    minLoan: 50000,
    interestRate: 10,
    tenure: [6, 12, 18, 24, 36, 48],
    processingFee: 1,
    approvalTime: '10 minutes',
    requiresCollateral: false,
    description: 'Instant digital loan for medical emergencies'
  },
  {
    id: 'nbfc_2',
    name: 'Hero FinCorp',
    logo: '🏍️',
    type: 'NBFC',
    minCibil: 700,
    maxLoan: 500000,
    minLoan: 50000,
    interestRate: 18,
    tenure: [6, 12, 24, 36],
    processingFee: 2,
    approvalTime: '10 minutes',
    requiresCollateral: false,
    description: 'Medical emergency loan - no collateral'
  },
  {
    id: 'nbfc_3',
    name: 'SMFG India Credit',
    logo: '🇮🇳',
    type: 'NBFC',
    minCibil: 700,
    maxLoan: 3000000,
    minLoan: 300000,
    interestRate: 13,
    tenure: [12, 24, 36, 48, 60],
    processingFee: 1.5,
    approvalTime: '24 hours',
    requiresCollateral: false,
    description: 'High-value personal loan for treatment'
  }
];
