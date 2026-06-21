import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ============================================
// EXISTING PAGES (PRESERVED)
// ============================================
import HomePage from './pages/HomePage';
import ComingSoon from './pages/ComingSoon';
import HospitalsList from './pages/HospitalsList';
import HospitalSimpleDetails from './pages/HospitalSimpleDetails';
import EmergencySearch from './pages/EmergencySearch';
import BookOPD from './pages/BookOPD';
import BookAdmission from './pages/BookAdmission';
import Ambulance from './pages/Ambulance';
import Caregivers from './pages/Caregivers';
import CaregiverProfile from './pages/CaregiverProfile';
import BookCaregiver from './pages/BookCaregiver';
import Diagnostics from './pages/diagnostics/Diagnostics';
import DiagnosticsList from './pages/diagnostics/DiagnosticsList';
import DiagnosticsCompareProviders from './pages/diagnostics/DiagnosticsCompareProviders';
import DiagnosticsCustomPackage from './pages/diagnostics/DiagnosticsCustomPackage';
import HealthPackages from './pages/diagnostics/HealthPackages';
import HealthPackagesPage from './pages/diagnostics/HealthPackagesPage';
import PackageDetail from './pages/diagnostics/PackageDetail';
import SimpleCompareTest from './pages/diagnostics/SimpleCompareTest';
import ProviderDashboard from './pages/diagnostics/ProviderDashboard';
import Financing from './pages/Financing';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import AdminUpload from './pages/AdminUpload';
import TestAPI from './pages/TestAPI';

// ============================================
// AYURVEDA PAGES (PRESERVED)
// ============================================
import AyurvedaHub from './pages/ayurveda/AyurvedaHub';
import AyurvedaDoctors from './pages/ayurveda/AyurvedaDoctors';
import AyurvedaDoctorProfile from './pages/ayurveda/AyurvedaDoctorProfile';
import AyurvedaAdvancedSearch from './pages/ayurveda/AyurvedaAdvancedSearch';
import AyurvedaPayment from './pages/ayurveda/AyurvedaPayment';
import AyurvedaBookingConfirmation from './pages/ayurveda/AyurvedaBookingConfirmation';
import BookAyurvedaConsult from './pages/ayurveda/BookAyurvedaConsult';
import PanchakarmaCenters from './pages/ayurveda/PanchakarmaCenters';
import PanchakarmaCenterDetail from './pages/ayurveda/PanchakarmaCenterDetail';
import BookPanchakarmaPackage from './pages/ayurveda/BookPanchakarmaPackage';
import PrakritiQuiz from './pages/ayurveda/PrakritiQuiz';
import DoctorRegistration from './pages/ayurveda/DoctorRegistration';
import DoctorLogin from './pages/ayurveda/DoctorLogin';
import DoctorDashboard from './pages/ayurveda/DoctorDashboard';
import WellnessCenterRegistration from './pages/ayurveda/WellnessCenterRegistration';
import WellnessCenterLogin from './pages/ayurveda/WellnessCenterLogin';
import WellnessCenterDashboard from './pages/ayurveda/WellnessCenterDashboard';
import WritePrescription from './pages/ayurveda/WritePrescription';
import ViewPrescription from './pages/ayurveda/ViewPrescription';
import PatientReview from './pages/ayurveda/PatientReview';

// ============================================
// HOMEOPATHY PAGES (PRESERVED)
// ============================================
import HomeopathyHub from './pages/homeopathy/HomeopathyHub';
import HomeopathyDoctors from './pages/homeopathy/HomeopathyDoctors';
import HomeopathyPharmacy from './pages/homeopathy/HomeopathyPharmacy';
import NaturopathyCenters from './pages/homeopathy/NaturopathyCenters';
import BookHomeopathyConsult from './pages/homeopathy/BookHomeopathyConsult';
import HomeopathyDoctorRegistration from './pages/homeopathy/DoctorRegistration';
import HomeopathyDoctorLogin from './pages/homeopathy/DoctorLogin';
import HomeopathyDoctorDashboard from './pages/homeopathy/DoctorDashboard';
import HomeopathyCenterRegistration from './pages/homeopathy/CenterRegistration';
import HomeopathyPharmacyRegistration from './pages/homeopathy/PharmacyRegistration';

// ============================================
// ADMIN PAGES (PRESERVED)
// ============================================
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVerifyLenders from './pages/admin/AdminVerifyLenders';
import AdminCommission from './pages/admin/AdminCommission';
import AdminDiscounts from './pages/admin/AdminDiscounts';
import AdminFinancialDashboard from './pages/admin/AdminFinancialDashboard';
import AyurvedaAdminPanel from './pages/admin/AyurvedaAdminPanel';
import HomeopathyAdminPanel from './pages/admin/HomeopathyAdminPanel';

// ============================================
// LENDER PAGES (PRESERVED)
// ============================================
import LenderLogin from './pages/lender/LenderLogin';
import LenderDashboard from './pages/lender/LenderDashboard';
import LenderApplications from './pages/lender/LenderApplications';
import LenderApplicationDetail from './pages/lender/LenderApplicationDetail';

// ============================================
// 🆕 INSURANCE PAGES (ADDED)
// ============================================
import InsuranceHub from './pages/insurance/InsuranceHub';
import InsuranceList from './pages/insurance/InsuranceList';
import InsuranceCompare from './pages/insurance/InsuranceCompare';
import InsuranceDetail from './pages/insurance/InsuranceDetail';
import InsuranceApplication from './pages/insurance/InsuranceApplication';
import InsuranceConfirmation from './pages/insurance/InsuranceConfirmation';
import InsurancePolicyDetail from './pages/insurance/InsurancePolicyDetail';

// ============================================
// TERMS & POLICIES (PRESERVED)
// ============================================
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ============================================
            MAIN PAGE (PRESERVED)
            ============================================ */}
        <Route path="/" element={<HomePage />} />

        {/* ============================================
            HOSPITALS TAG (PRESERVED)
            ============================================ */}
        <Route path="/hospitals" element={<HospitalsList />} />
        <Route path="/hospitals/:id" element={<HospitalSimpleDetails />} />
        <Route path="/emergency" element={<EmergencySearch />} />
        <Route path="/book-opd/:hospitalId" element={<BookOPD />} />
        <Route path="/book-admission/:hospitalId" element={<BookAdmission />} />

        {/* ============================================
            AMBULANCE TAG (PRESERVED)
            ============================================ */}
        <Route path="/ambulance" element={<Ambulance />} />

        {/* ============================================
            CAREGIVER TAG (PRESERVED)
            ============================================ */}
        <Route path="/caregivers" element={<Caregivers />} />
        <Route path="/caregivers/:id" element={<CaregiverProfile />} />
        <Route path="/book-caregiver/:id" element={<BookCaregiver />} />

        {/* ============================================
            DIAGNOSTICS TAG (PRESERVED)
            ============================================ */}
        <Route path="/diagnostics" element={<Diagnostics />} />
        <Route path="/diagnostics-list" element={<DiagnosticsList />} />
        <Route path="/diagnostics-compare" element={<DiagnosticsCompareProviders />} />
        <Route path="/diagnostics-custom-package" element={<DiagnosticsCustomPackage />} />
        <Route path="/health-packages" element={<HealthPackages />} />
        <Route path="/health-packages-page" element={<HealthPackagesPage />} />
        <Route path="/package-detail/:id" element={<PackageDetail />} />
        <Route path="/simple-compare" element={<SimpleCompareTest />} />
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />

        {/* ============================================
            HEALTH EMI / FINANCING TAG (PRESERVED)
            ============================================ */}
        <Route path="/financing" element={<Financing />} />

        {/* ============================================
            AYURVEDA TAG (PRESERVED)
            ============================================ */}
        <Route path="/ayurveda" element={<AyurvedaHub />} />
        <Route path="/ayurveda/doctors" element={<AyurvedaDoctors />} />
        <Route path="/ayurveda/doctors/:id" element={<AyurvedaDoctorProfile />} />
        <Route path="/ayurveda/search" element={<AyurvedaAdvancedSearch />} />
        <Route path="/ayurveda/payment" element={<AyurvedaPayment />} />
        <Route path="/ayurveda/confirmation" element={<AyurvedaBookingConfirmation />} />
        <Route path="/ayurveda/book-consult/:doctorId" element={<BookAyurvedaConsult />} />
        <Route path="/ayurveda/panchakarma" element={<PanchakarmaCenters />} />
        <Route path="/ayurveda/panchakarma/:id" element={<PanchakarmaCenterDetail />} />
        <Route path="/ayurveda/book-panchakarma/:centerId" element={<BookPanchakarmaPackage />} />
        <Route path="/ayurveda/prakriti-quiz" element={<PrakritiQuiz />} />
        <Route path="/ayurveda/doctor/register" element={<DoctorRegistration />} />
        <Route path="/ayurveda/doctor/login" element={<DoctorLogin />} />
        <Route path="/ayurveda/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/ayurveda/wellness/register" element={<WellnessCenterRegistration />} />
        <Route path="/ayurveda/wellness/login" element={<WellnessCenterLogin />} />
        <Route path="/ayurveda/wellness/dashboard" element={<WellnessCenterDashboard />} />
        <Route path="/ayurveda/prescription/write" element={<WritePrescription />} />
        <Route path="/ayurveda/prescription/view/:id" element={<ViewPrescription />} />
        <Route path="/ayurveda/review/:id" element={<PatientReview />} />

        {/* ============================================
            HOMEOPATHY TAG (PRESERVED)
            ============================================ */}
        <Route path="/homeopathy" element={<HomeopathyHub />} />
        <Route path="/homeopathy/doctors" element={<HomeopathyDoctors />} />
        <Route path="/homeopathy/pharmacy" element={<HomeopathyPharmacy />} />
        <Route path="/homeopathy/naturopathy" element={<NaturopathyCenters />} />
        <Route path="/homeopathy/book-consult/:doctorId" element={<BookHomeopathyConsult />} />
        <Route path="/homeopathy/doctor/register" element={<HomeopathyDoctorRegistration />} />
        <Route path="/homeopathy/doctor/login" element={<HomeopathyDoctorLogin />} />
        <Route path="/homeopathy/doctor/dashboard" element={<HomeopathyDoctorDashboard />} />
        <Route path="/homeopathy/center/register" element={<HomeopathyCenterRegistration />} />
        <Route path="/homeopathy/pharmacy/register" element={<HomeopathyPharmacyRegistration />} />

        {/* ============================================
            INSURANCE TAG (ADDED)
            ============================================ */}
        <Route path="/insurance" element={<InsuranceHub />} />
        <Route path="/insurance/list" element={<InsuranceList />} />
        <Route path="/insurance/compare" element={<InsuranceCompare />} />
        <Route path="/insurance/plan/:id" element={<InsuranceDetail />} />
        <Route path="/insurance/apply/:planId" element={<InsuranceApplication />} />
        <Route path="/insurance/confirmation" element={<InsuranceConfirmation />} />
        <Route path="/insurance/my-policies/:id" element={<InsurancePolicyDetail />} />

        {/* ============================================
            OTHER TAGS (PRESERVED)
            ============================================ */}
        <Route path="/lab-tests" element={<ComingSoon title="Lab Tests" />} />
        <Route path="/preventive" element={<ComingSoon title="Preventive Checkups" />} />
        <Route path="/teleconsult" element={<ComingSoon title="Teleconsultation" />} />
        <Route path="/corporate" element={<ComingSoon title="Corporate Health" />} />

        {/* ============================================
            SHARED PAGES (PRESERVED)
            ============================================ */}
        <Route path="/payment" element={<Payment />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-upload" element={<AdminUpload />} />
        <Route path="/test-api" element={<TestAPI />} />

        {/* ============================================
            ADMIN PAGES (PRESERVED)
            ============================================ */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/verify-lenders" element={<AdminVerifyLenders />} />
        <Route path="/admin/commission" element={<AdminCommission />} />
        <Route path="/admin/discounts" element={<AdminDiscounts />} />
        <Route path="/admin/financial" element={<AdminFinancialDashboard />} />
        <Route path="/admin/ayurveda" element={<AyurvedaAdminPanel />} />
        <Route path="/admin/homeopathy" element={<HomeopathyAdminPanel />} />

        {/* ============================================
            LENDER PAGES (PRESERVED)
            ============================================ */}
        <Route path="/lender/login" element={<LenderLogin />} />
        <Route path="/lender/dashboard" element={<LenderDashboard />} />
        <Route path="/lender/applications" element={<LenderApplications />} />
        <Route path="/lender/applications/:id" element={<LenderApplicationDetail />} />

        {/* ============================================
            TERMS & POLICIES (PRESERVED)
            ============================================ */}
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund" element={<RefundPolicy />} />

        {/* ============================================
            FALLBACK ROUTE (PRESERVED)
            ============================================ */}
        <Route path="*" element={<ComingSoon title="Page Not Found" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;