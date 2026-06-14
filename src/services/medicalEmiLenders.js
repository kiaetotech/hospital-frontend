// Mock Medical EMI platforms (SaveIN, CarePay, QubeHealth)
export const medicalEmiLenders = [
  {
    id: 'medi_1',
    name: 'SaveIN + Trillionloans',
    logo: '💰',
    type: 'Medical EMI',
    minCibil: 650,
    maxLoan: 500000,
    minLoan: 10000,
    interestRate: 0,
    tenure: [3, 6, 9, 12],
    processingFee: 2,
    approvalTime: '2 minutes',
    requiresCollateral: false,
    description: '0% EMI on partner hospitals',
    partnerHospitals: true
  },
  {
    id: 'medi_2',
    name: 'CarePay (Careena AI)',
    logo: '🤖',
    type: 'Medical EMI',
    minCibil: 600,
    maxLoan: 1000000,
    minLoan: 10000,
    interestRate: 0,
    tenure: [6, 12, 18, 24],
    processingFee: 3,
    approvalTime: 'Instant',
    requiresCollateral: false,
    description: 'AI-based instant approval - up to ₹10L',
    partnerHospitals: false
  },
  {
    id: 'medi_3',
    name: 'QubeHealth',
    logo: '🧊',
    type: 'Medical EMI',
    minCibil: 650,
    maxLoan: 500000,
    minLoan: 5000,
    interestRate: 0,
    tenure: [6, 12],
    processingFee: 2.5,
    approvalTime: 'Instant',
    requiresCollateral: false,
    description: 'EMI at 0% interest on healthcare',
    partnerHospitals: true
  }
];