import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ComingSoon from './pages/ComingSoon';
import HospitalsList from './pages/HospitalsList';
import HospitalSimpleDetails from './pages/HospitalSimpleDetails';
import EmergencySearch from './pages/EmergencySearch';
import BookOPD from './pages/BookOPD';
import BookAdmission from './pages/BookAdmission';
import Payment from './pages/PaymentPage';
import MyBookings from './pages/MyBookings';
import Ambulance from './pages/Ambulance';
import Caregivers from './pages/Caregivers';
import CaregiverProfile from './pages/CaregiverProfile';
import BookCaregiver from './pages/BookCaregiver';
import Login from './pages/Login';
import AdminUpload from './pages/AdminUpload';
import TestAPI from './pages/TestAPI';
import DiagnosticsList from './pages/DiagnosticsList';
import DiagnosticsCompareProviders from './pages/DiagnosticsCompareProviders';
import DiagnosticsCustomPackage from './pages/DiagnosticsCustomPackage';
import Diagnostics from './pages/Diagnostics';
import HealthPackages from './pages/HealthPackages';
import HealthPackagesPage from './pages/HealthPackagesPage';
import PackageDetail from './pages/PackageDetail';
import SimpleCompareTest from './pages/SimpleCompareTest';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminPanel from './pages/AdminPanel';
import Financing from './pages/Financing';

// ============================================
// LENDER PORTAL IMPORTS
// ============================================
import LenderLogin from './pages/lender/LenderLogin';
import LenderDashboard from './pages/lender/LenderDashboard';
import LenderApplications from './pages/lender/LenderApplications';
import LenderApplicationDetail from './pages/lender/LenderApplicationDetail';

// ============================================
// ADMIN PANEL IMPORTS
// ============================================
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVerifyLenders from './pages/admin/AdminVerifyLenders';
import AdminCommission from './pages/admin/AdminCommission';

// ============================================
// CONTEXT PROVIDERS
// ============================================
import { LenderProvider } from './contexts/LenderContext';

function App() {
  return (
    <BrowserRouter>
      <LenderProvider>
        <Routes>
          {/* ============================================
              MAIN PAGES
          ============================================ */}
          <Route path="/" element={<HomePage />} />
          
          {/* ============================================
              HOSPITALS TAG
          ============================================ */}
          <Route path="/hospitals" element={<HospitalsList />} />
          <Route path="/hospital-info/:id" element={<HospitalSimpleDetails />} />
          <Route path="/emergency-search" element={<EmergencySearch />} />
          
          {/* ============================================
              BOOKING PAGES
          ============================================ */}
          <Route path="/book-opd/:id" element={<BookOPD />} />
          <Route path="/book-admission/:id" element={<BookAdmission />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          
          {/* ============================================
              AMBULANCE TAG
          ============================================ */}
          <Route path="/ambulance" element={<Ambulance />} />

          {/* ============================================
              CAREGIVER TAG
          ============================================ */}
          <Route path="/caregivers" element={<Caregivers />} />
          <Route path="/caregiver-profile/:id" element={<CaregiverProfile />} />
          <Route path="/book-caregiver/:id" element={<BookCaregiver />} />
          <Route path="/login" element={<Login />} />

          {/* ============================================
              DIAGNOSTICS TAG
          ============================================ */}
          <Route path="/diagnostics-list" element={<DiagnosticsList />} />
          <Route path="/diagnostics-compare-providers" element={<DiagnosticsCompareProviders />} />
          <Route path="/diagnostics-custom-package" element={<DiagnosticsCustomPackage />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="/health-packages" element={<HealthPackages />} />
          <Route path="/health-packages" element={<HealthPackagesPage />} />
          <Route path="/package-detail/:id" element={<PackageDetail />} />
          <Route path="/test-compare" element={<SimpleCompareTest />} />
          <Route path="/provider-dashboard" element={<ProviderDashboard />} />
          <Route path="/admin-panel" element={<AdminPanel />} />

          {/* ============================================
              HEALTH EMI / LOAN TAG
          ============================================ */}
          <Route path="/financing" element={<Financing />} />

          {/* ============================================
              LENDER PORTAL ROUTES
          ============================================ */}
          <Route path="/lender/login" element={<LenderLogin />} />
          <Route path="/lender/dashboard" element={<LenderDashboard />} />
          <Route path="/lender/applications" element={<LenderApplications />} />
          <Route path="/lender/applications/:id" element={<LenderApplicationDetail />} />

          {/* ============================================
              ADMIN PANEL ROUTES
          ============================================ */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/verify-lenders" element={<AdminVerifyLenders />} />
          <Route path="/admin/commission" element={<AdminCommission />} />

          {/* ============================================
              OTHER TAGS (Coming Soon)
          ============================================ */}
          <Route path="/insurance" element={<ComingSoon title="Health Insurance" />} />
          <Route path="/lab-tests" element={<ComingSoon title="Lab Tests" />} />
          <Route path="/preventive" element={<ComingSoon title="Preventive Checkups" />} />
          <Route path="/teleconsult" element={<ComingSoon title="Teleconsultation" />} />
          <Route path="/corporate" element={<ComingSoon title="Corporate Health" />} />
          <Route path="/admin/upload" element={<AdminUpload />} />
        </Routes>
      </LenderProvider>
    </BrowserRouter>
  );
}

export default App;