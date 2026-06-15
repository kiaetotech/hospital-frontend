const Lender = require('../models/Lender');

// ============================================
// LOCATION-BASED LENDER ASSIGNMENT
// ============================================

// Find nearest branch for a given lender and patient pincode
const findNearestBranch = async (lenderId, patientPincode) => {
  const lender = await Lender.findById(lenderId);
  if (!lender) return null;
  
  // If lender has branches, find the one matching pincode or nearest
  if (lender.branches && lender.branches.length > 0) {
    // First, try exact pincode match
    const exactMatch = lender.branches.find(b => b.pincode === patientPincode && b.isActive);
    if (exactMatch) return exactMatch;
    
    // Second, try district match
    // (We need to get district from pincode - use pincode API or pre-populated data)
    // For now, return first active branch
    const activeBranch = lender.branches.find(b => b.isActive);
    return activeBranch || null;
  }
  
  return null;
};

// Get available lenders for a patient based on location
const getAvailableLenders = async (patientPincode, patientCity, patientDistrict, patientState) => {
  const query = { status: 'active' };
  
  // Build location-based query
  const locationConditions = [];
  
  // 1. National lenders (serve all India)
  locationConditions.push({ lenderType: 'national' });
  
  // 2. Regional lenders (serve state)
  if (patientState) {
    locationConditions.push({ serviceStates: patientState });
  }
  
  // 3. Local lenders (serve district/city)
  if (patientDistrict) {
    locationConditions.push({ serviceDistricts: patientDistrict });
  }
  if (patientCity) {
    locationConditions.push({ serviceCities: patientCity });
  }
  
  // 4. Lenders who serve this specific pincode
  if (patientPincode) {
    locationConditions.push({ servicePincodes: patientPincode });
  }
  
  query.$or = locationConditions;
  
  const lenders = await Lender.find(query).select('-password');
  
  // For each lender, find the nearest branch
  const lendersWithBranches = await Promise.all(lenders.map(async (lender) => {
    const nearestBranch = await findNearestBranch(lender._id, patientPincode);
    return {
      ...lender.toObject(),
      nearestBranch,
      assignedBranchId: nearestBranch?.branchId || null,
      assignedBranchName: nearestBranch?.branchName || lender.registeredOffice?.city || 'Head Office'
    };
  }));
  
  return lendersWithBranches;
};

// Assign application to specific lender and branch
const assignApplicationToLender = async (application, patientPincode, patientCity, patientDistrict, patientState) => {
  const lender = await Lender.findById(application.lenderId);
  if (!lender) {
    throw new Error('Lender not found');
  }
  
  // Find the best branch for this patient
  let assignedBranch = null;
  let assignmentReason = '';
  
  // Priority 1: Exact pincode match
  if (lender.branches && lender.branches.length > 0) {
    assignedBranch = lender.branches.find(b => b.pincode === patientPincode && b.isActive);
    if (assignedBranch) {
      assignmentReason = 'exact_pincode_match';
    }
  }
  
  // Priority 2: District match (if pincode match not found)
  if (!assignedBranch && patientDistrict && lender.branches) {
    assignedBranch = lender.branches.find(b => b.district === patientDistrict && b.isActive);
    if (assignedBranch) {
      assignmentReason = 'district_match';
    }
  }
  
  // Priority 3: City match
  if (!assignedBranch && patientCity && lender.branches) {
    assignedBranch = lender.branches.find(b => b.city === patientCity && b.isActive);
    if (assignedBranch) {
      assignmentReason = 'city_match';
    }
  }
  
  // Priority 4: State match (use any active branch in that state)
  if (!assignedBranch && patientState && lender.branches) {
    assignedBranch = lender.branches.find(b => b.state === patientState && b.isActive);
    if (assignedBranch) {
      assignmentReason = 'state_match';
    }
  }
  
  // Priority 5: Use registered office or first branch
  if (!assignedBranch && lender.branches && lender.branches.length > 0) {
    assignedBranch = lender.branches.find(b => b.isActive) || lender.branches[0];
    assignmentReason = 'default_branch';
  }
  
  // Update application with assigned branch
  application.assignedBranchId = assignedBranch?.branchId || null;
  application.assignedBranchName = assignedBranch?.branchName || lender.registeredOffice?.city || 'Head Office';
  application.assignedBranchAddress = assignedBranch?.address || lender.registeredOffice?.address;
  application.assignedBranchPincode = assignedBranch?.pincode || lender.registeredOffice?.pincode;
  application.assignedBranchManager = assignedBranch?.managerName || '';
  application.assignmentReason = assignmentReason;
  application.assignedAt = new Date();
  
  await application.save();
  
  return application;
};

module.exports = {
  getAvailableLenders,
  assignApplicationToLender,
  findNearestBranch
};