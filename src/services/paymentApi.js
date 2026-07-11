// D:\hospital-frontend\src\services\paymentApi.js

// ============================================
// PAYMENT API SERVICE - For ALL Tags
// ============================================

const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-f1b1.up.railway.app';

// ============================================
// HELPER: Get auth token
// ============================================

const getAuthToken = () => {
  return localStorage.getItem('patientToken') || localStorage.getItem('lenderToken') || '';
};

// ============================================
// HELPER: API request function
// ============================================

const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || data.error || 'API request failed');
  }
  
  return data;
};

// ============================================
// 1. CREATE RAZORPAY ORDER
// ============================================

export const createOrder = async (paymentData) => {
  try {
    const response = await apiRequest('/api/payment/create-order-v2', {
      method: 'POST',
      body: JSON.stringify({
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        bookingId: paymentData.bookingId,
        bookingType: paymentData.bookingType || 'general',
        userId: paymentData.userId,
        patientName: paymentData.patientName,
        patientPhone: paymentData.patientPhone,
        patientEmail: paymentData.patientEmail,
        discountCode: paymentData.discountCode,
        discountAmount: paymentData.discountAmount || 0,
        finalAmount: paymentData.finalAmount,
        ...paymentData.extra
      })
    });
    return response;
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
};

// ============================================
// 2. CREATE ORDER FOR SPECIFIC TAGS
// ============================================

// Hospital OPD
export const createOrderOPD = (data) => {
  return createOrder({
    ...data,
    bookingType: 'opd'
  });
};

// Hospital Admission
export const createOrderAdmission = (data) => {
  return createOrder({
    ...data,
    bookingType: 'admission'
  });
};

// Ambulance
export const createOrderAmbulance = (data) => {
  return createOrder({
    ...data,
    bookingType: 'ambulance'
  });
};

// Caregiver
export const createOrderCaregiver = (data) => {
  return createOrder({
    ...data,
    bookingType: 'caregiver'
  });
};

// Lab Test
export const createOrderLabTest = (data) => {
  return createOrder({
    ...data,
    bookingType: 'labtest'
  });
};

// Health Package
export const createOrderHealthPackage = (data) => {
  return createOrder({
    ...data,
    bookingType: 'health_package'
  });
};

// Loan Application
export const createOrderLoan = (data) => {
  return createOrder({
    ...data,
    bookingType: 'loan'
  });
};

// ============================================
// 3. VERIFY PAYMENT
// ============================================

export const verifyPayment = async (paymentData) => {
  try {
    const response = await apiRequest('/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        bookingId: paymentData.bookingId,
        bookingType: paymentData.bookingType || 'general',
        patientName: paymentData.patientName,
        patientAge: paymentData.patientAge,
        patientGender: paymentData.patientGender,
        patientPhone: paymentData.patientPhone,
        patientEmail: paymentData.patientEmail,
        totalAmount: paymentData.totalAmount,
        appointmentDate: paymentData.appointmentDate,
        // Hospital specific
        hospitalName: paymentData.hospitalName,
        doctorName: paymentData.doctorName,
        timeSlot: paymentData.timeSlot,
        // Ambulance specific
        ambulanceType: paymentData.ambulanceType,
        pickupAddress: paymentData.pickupAddress,
        dropAddress: paymentData.dropAddress,
        // Lab Test specific
        tests: paymentData.tests,
        providerName: paymentData.providerName,
        homeCollectionRequested: paymentData.homeCollectionRequested,
        homeAddress: paymentData.homeAddress,
        // Caregiver specific
        caregiverName: paymentData.caregiverName,
        serviceType: paymentData.serviceType,
        // Loan specific
        loanApplicationId: paymentData.loanApplicationId,
        // Payment method
        paymentMethod: paymentData.paymentMethod || 'card',
        userId: paymentData.userId
      })
    });
    return response;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

// ============================================
// 4. VERIFY PAYMENT FOR SPECIFIC TAGS
// ============================================

export const verifyOPDPayment = (data) => {
  return verifyPayment({ ...data, bookingType: 'opd' });
};

export const verifyAdmissionPayment = (data) => {
  return verifyPayment({ ...data, bookingType: 'admission' });
};

export const verifyAmbulancePayment = (data) => {
  return verifyPayment({ ...data, bookingType: 'ambulance' });
};

export const verifyCaregiverPayment = (data) => {
  return verifyPayment({ ...data, bookingType: 'caregiver' });
};

export const verifyLabTestPayment = (data) => {
  return verifyPayment({ ...data, bookingType: 'labtest' });
};

export const verifyHealthPackagePayment = (data) => {
  return verifyPayment({ ...data, bookingType: 'health_package' });
};

export const verifyLoanPayment = (data) => {
  return verifyPayment({ ...data, bookingType: 'loan' });
};

// ============================================
// 5. GET PAYMENT STATUS
// ============================================

export const getPaymentStatus = async (bookingId) => {
  try {
    const response = await apiRequest(`/api/payment/status/${bookingId}`, {
      method: 'GET'
    });
    return response;
  } catch (error) {
    console.error('Get payment status error:', error);
    throw error;
  }
};

// ============================================
// 6. PROCESS REFUND
// ============================================

export const processRefund = async (paymentId, amount, reason) => {
  try {
    const response = await apiRequest(`/api/payment/refund/${paymentId}`, {
      method: 'POST',
      body: JSON.stringify({
        amount: amount,
        reason: reason || 'Customer request'
      })
    });
    return response;
  } catch (error) {
    console.error('Refund error:', error);
    throw error;
  }
};

// ============================================
// 7. CALCULATE DISCOUNT
// ============================================

export const calculateDiscount = async (amount, discountCode, bookingType) => {
  try {
    const response = await apiRequest('/api/payment/calculate-discount', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        discountCode,
        bookingType: bookingType || 'general'
      })
    });
    return response;
  } catch (error) {
    console.error('Discount calculation error:', error);
    throw error;
  }
};

// ============================================
// 8. GET TRANSACTION DETAILS
// ============================================

export const getTransaction = async (transactionId) => {
  try {
    const response = await apiRequest(`/api/payment/transaction/${transactionId}`, {
      method: 'GET'
    });
    return response;
  } catch (error) {
    console.error('Get transaction error:', error);
    throw error;
  }
};

// ============================================
// 9. GET TRANSACTION BY ORDER ID
// ============================================

export const getTransactionByOrder = async (orderId) => {
  try {
    const response = await apiRequest(`/api/payment/transaction/order/${orderId}`, {
      method: 'GET'
    });
    return response;
  } catch (error) {
    console.error('Get transaction by order error:', error);
    throw error;
  }
};

// ============================================
// 10. INITIATE PAYMENT (Complete Flow)
// ============================================

export const initiatePayment = async (paymentData) => {
  try {
    // Step 1: Create order
    const orderResponse = await createOrder(paymentData);
    
    if (!orderResponse.success) {
      throw new Error(orderResponse.message || 'Failed to create order');
    }
    
    const { order, key_id } = orderResponse;
    
    // Step 2: Return Razorpay options
    return {
      success: true,
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      key_id: key_id || process.env.REACT_APP_RAZORPAY_KEY_ID,
      transactionId: orderResponse.transactionId,
      orderData: order,
      // Razorpay checkout options
      options: {
        key: key_id || process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'KiaetoCare',
        description: `Payment for ${paymentData.bookingType || 'booking'}`,
        order_id: order.id,
        prefill: {
          name: paymentData.patientName || '',
          email: paymentData.patientEmail || '',
          contact: paymentData.patientPhone || ''
        },
        theme: {
          color: '#8b5cf6'
        }
      }
    };
  } catch (error) {
    console.error('Initiate payment error:', error);
    throw error;
  }
};

// ============================================
// 11. COMPLETE PAYMENT (After Razorpay Success)
// ============================================

export const completePayment = async (responseData, bookingData) => {
  try {
    const verifyResponse = await verifyPayment({
      razorpay_order_id: responseData.razorpay_order_id,
      razorpay_payment_id: responseData.razorpay_payment_id,
      razorpay_signature: responseData.razorpay_signature,
      ...bookingData
    });
    
    return verifyResponse;
  } catch (error) {
    console.error('Complete payment error:', error);
    throw error;
  }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================

export default {
  createOrder,
  createOrderOPD,
  createOrderAdmission,
  createOrderAmbulance,
  createOrderCaregiver,
  createOrderLabTest,
  createOrderHealthPackage,
  createOrderLoan,
  verifyPayment,
  verifyOPDPayment,
  verifyAdmissionPayment,
  verifyAmbulancePayment,
  verifyCaregiverPayment,
  verifyLabTestPayment,
  verifyHealthPackagePayment,
  verifyLoanPayment,
  getPaymentStatus,
  processRefund,
  calculateDiscount,
  getTransaction,
  getTransactionByOrder,
  initiatePayment,
  completePayment
};
