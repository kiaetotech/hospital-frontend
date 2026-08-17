import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GlobalSearch from './components/GlobalSearch';
import AIControlCenter from './ai-control-center/App';
import ComingSoon from './pages/ComingSoon';
import SearchResultsPage from './pages/SearchResultsPage';
import HospitalsList from './pages/HospitalsList';
import HospitalSimpleDetails from './pages/HospitalSimpleDetails';
import CompareHospitals from './pages/CompareHospitals';
import EmergencySearch from './pages/EmergencySearch';
import BookOPD from './pages/BookOPD';
import BookAdmission from './pages/BookAdmission';
import Payment from './pages/payment';
import MyBookings from './pages/MyBookings';
import Ambulance from './pages/Ambulance';
import PatientProfile from './pages/PatientProfile';
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
import Disclaimer from './pages/Disclaimer';
import Grievance from './pages/Grievance';
import CancellationPolicy from './pages/CancellationPolicy';
import ProviderTerms from './pages/ProviderTerms';
import DataRetention from './pages/DataRetention';
import PaymentTerms from './pages/PaymentTerms';

// ============================================
// AYURVEDA MODULE IMPORTS
// ============================================
import AyurvedaHub from './pages/ayurveda/AyurvedaHub';
import AyurvedaDoctors from './pages/ayurveda/AyurvedaDoctors';
import AyurvedaDoctorProfile from './pages/ayurveda/AyurvedaDoctorProfile';
import AyurvedaAdvancedSearch from './pages/ayurveda/AyurvedaAdvancedSearch';
import PanchakarmaCenters from './pages/ayurveda/PanchakarmaCenters';
import PanchakarmaCenterDetail from './pages/ayurveda/PanchakarmaCenterDetail';
import BookPanchakarmaPackage from './pages/ayurveda/BookPanchakarmaPackage';
import PrakritiQuiz from './pages/ayurveda/PrakritiQuiz';
import BookAyurvedaConsult from './pages/ayurveda/BookAyurvedaConsult';
import AyurvedaPayment from './pages/ayurveda/AyurvedaPayment';
import AyurvedaBookingConfirmation from './pages/ayurveda/AyurvedaBookingConfirmation';
import WellnessCenterRegistration from './pages/ayurveda/WellnessCenterRegistration';
import WellnessCenterLogin from './pages/ayurveda/WellnessCenterLogin';
import WellnessCenterDashboard from './pages/ayurveda/WellnessCenterDashboard';
import PatientReview from './pages/ayurveda/PatientReview';
import DoctorRegistration from './pages/ayurveda/DoctorRegistration';
import DoctorLogin from './pages/ayurveda/DoctorLogin';
import DoctorDashboard from './pages/ayurveda/DoctorDashboard';
import WritePrescription from './pages/ayurveda/WritePrescription';
import ViewPrescription from './pages/ayurveda/ViewPrescription';
import PrakritiCommerce from './pages/ayurveda/PrakritiCommerce';
import PanchakarmaTracker from './pages/ayurveda/PanchakarmaTracker';
import SeasonalWellness from './pages/ayurveda/SeasonalWellness';

// ============================================
// HOMEOPATHY & NATUROPATHY MODULE IMPORTS
// ============================================
import HomeopathyHub from './pages/homeopathy/HomeopathyHub';
import HomeopathyDoctors from './pages/homeopathy/HomeopathyDoctors';
import HomeopathyPharmacy from './pages/homeopathy/HomeopathyPharmacy';
import BookHomeopathyConsult from './pages/homeopathy/BookHomeopathyConsult';
import HomeoDoctorRegistration from './pages/homeopathy/DoctorRegistration';
import HomeoDoctorLogin from './pages/homeopathy/DoctorLogin';
import HomeoDoctorDashboard from './pages/homeopathy/DoctorDashboard';
import HomeoCenterRegistration from './pages/homeopathy/CenterRegistration';
import HomeoPharmacyRegistration from './pages/homeopathy/PharmacyRegistration';
import NaturopathyCenters from './pages/homeopathy/NaturopathyCenters';
import RemedyMatcher from './pages/homeopathy/RemedyMatcher';

// ============================================
// LEGAL PAGES
// ============================================
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';

// ============================================
// LENDER PORTAL IMPORTS
// ============================================
import LenderLogin from './pages/lender/LenderLogin';
import LenderDashboard from './pages/lender/LenderDashboard';
import LenderApplications from './pages/lender/LenderApplications';
import LenderApplicationDetail from './pages/lender/LenderApplicationDetail';
import LenderRegister from './pages/lender/LenderRegister';

// ============================================
// ADMIN PANEL IMPORTS
// ============================================
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVerifyLenders from './pages/admin/AdminVerifyLenders';
import AdminCommission from './pages/admin/AdminCommission';
import AdminDiscounts from './pages/admin/AdminDiscounts';
import AyurvedaAdminPanel from './pages/admin/AyurvedaAdminPanel';
import AdminFinancialDashboard from './pages/admin/AdminFinancialDashboard';
import HomeopathyAdminPanel from './pages/admin/HomeopathyAdminPanel';
import AdminMentalHealth from './pages/admin/AdminMentalHealth';
import AdminCorporate from './pages/admin/AdminCorporate';

// ============================================
// NEW ADMIN PANEL IMPORTS
// ============================================
import AdminHospitals from './pages/admin/AdminHospitals';
import AdminAmbulance from './pages/admin/AdminAmbulance';
import AdminCaregivers from './pages/admin/AdminCaregivers';
import AdminDiagnostics from './pages/admin/AdminDiagnostics';
import AdminFinancing from './pages/admin/AdminFinancing';
import AdminUsers from './pages/admin/AdminUsers';
import AdminInsuranceClaims from './pages/admin/AdminInsuranceClaims';
import AdminOnlineDoctor from './pages/admin/AdminOnlineDoctor';

// ============================================
// INSURANCE MODULE IMPORTS
// ============================================
import InsuranceHub from './pages/insurance/InsuranceHub';
import InsuranceList from './pages/insurance/InsuranceList';
import InsuranceCompare from './pages/insurance/InsuranceCompare';
import InsuranceDetail from './pages/insurance/InsuranceDetail';
import InsuranceApplication from './pages/insurance/InsuranceApplication';
import InsuranceConfirmation from './pages/insurance/InsuranceConfirmation';
import InsurancePolicyDetail from './pages/insurance/InsurancePolicyDetail';
import InsuranceCompanyRegister from './pages/insurance/InsuranceCompanyRegister';
import InsuranceCompanyLogin from './pages/insurance/InsuranceCompanyLogin';
import InsuranceCompanyDashboard from './pages/insurance/InsuranceCompanyDashboard';

// ============================================
// CORPORATE MODULE IMPORTS
// ============================================
import CorporateHub from './pages/corporate/CorporateHub';
import CorporatePlans from './pages/corporate/CorporatePlans';
import CorporatePlanDetail from './pages/corporate/CorporatePlanDetail';
import CorporateEnrollment from './pages/corporate/CorporateEnrollment';
import CorporateHRLogin from './pages/corporate/CorporateHRLogin';
import CorporateHRDashboard from './pages/corporate/CorporateHRDashboard';
import CorporateCheckups from './pages/corporate/CorporateCheckups';
import CorporateWellness from './pages/corporate/CorporateWellness';
import EmployeeLogin from './pages/corporate/EmployeeLogin';
import EmployeePortal from './pages/corporate/EmployeePortal';
import CompanyRegister from './pages/corporate/CompanyRegister';

// ============================================
// PROVIDER REGISTRATION IMPORTS
// ============================================
import HospitalRegister from './pages/hospitals/HospitalRegister';
import HospitalLogin from './pages/hospitals/HospitalLogin';
import HospitalDashboard from './pages/hospitals/HospitalDashboard';
import AmbulanceRegister from './pages/ambulance/AmbulanceRegister';
import AmbulanceLogin from './pages/ambulance/AmbulanceLogin';
import AmbulanceDashboard from './pages/ambulance/AmbulanceDashboard';
import CaregiverRegister from './pages/caregivers/CaregiverRegister';
import CaregiverLogin from './pages/caregivers/CaregiverLogin';
import CaregiverDashboard from './pages/caregivers/CaregiverDashboard';
import DiagnosticsRegister from './pages/diagnostics/DiagnosticsRegister';
import DiagnosticsLogin from './pages/diagnostics/DiagnosticsLogin';
import DiagnosticsDashboard from './pages/diagnostics/DiagnosticsDashboard';

// ============================================
// MENTAL HEALTH & COUNSELING IMPORTS
// ============================================
import MentalHealthHub from './pages/mentalhealth/MentalHealthHub';
import MentalHealthTherapists from './pages/mentalhealth/MentalHealthTherapists';
import MentalHealthTherapistDetail from './pages/mentalhealth/MentalHealthTherapistDetail';
import MentalHealthBooking from './pages/mentalhealth/MentalHealthBooking';
import MentalHealthPayment from './pages/mentalhealth/MentalHealthPayment';
import MentalHealthConfirmation from './pages/mentalhealth/MentalHealthConfirmation';
import MentalHealthScreening from './pages/mentalhealth/MentalHealthScreening';
import MentalHealthChat from './pages/mentalhealth/MentalHealthChat';
import MentalHealthJournal from './pages/mentalhealth/MentalHealthJournal';
import MentalHealthResources from './pages/mentalhealth/MentalHealthResources';
import MentalHealthCrisis from './pages/mentalhealth/MentalHealthCrisis';
import MentalHealthCorporate from './pages/mentalhealth/MentalHealthCorporate';
import TherapistRegister from './pages/mentalhealth/TherapistRegister';
import TherapistLogin from './pages/mentalhealth/TherapistLogin';
import TherapistDashboard from './pages/mentalhealth/TherapistDashboard';
import TherapistEarnings from './pages/mentalhealth/TherapistEarnings';

// ============================================
// ONLINE DOCTOR MODULE IMPORTS
// ============================================
import OnlineDoctorHub from './pages/online-doctor/OnlineDoctorHub';
import DoctorSearch from './pages/online-doctor/DoctorSearch';
import DoctorProfile from './pages/online-doctor/DoctorProfile';
import BookOnlineConsult from './pages/online-doctor/BookOnlineConsult';
import VideoConsult from './pages/online-doctor/VideoConsult';
import OnlineDoctorRegister from './pages/online-doctor/DoctorRegister';
import OnlineDoctorLogin from './pages/online-doctor/DoctorLogin';
import OnlineDoctorDashboard from './pages/online-doctor/DoctorDashboard';
import ConsultHistory from './pages/online-doctor/ConsultHistory';
import ResetPassword from './pages/online-doctor/ResetPassword';
import SymptomTriage from './pages/online-doctor/SymptomTriage';

// ============================================
// 🚑 AMBULANCE BLITZ RESPONSE IMPORTS (NEW)
// ============================================
import EmergencyRequest from './pages/ambulance/EmergencyRequest';
import LiveTracking from './pages/ambulance/LiveTracking';
import ScheduleTransport from './pages/ambulance/ScheduleTransport';
import DriverApp from './pages/ambulance/DriverApp';
import EmergencyContacts from './pages/ambulance/EmergencyContacts';
import DigitalTripSheet from './pages/ambulance/DigitalTripSheet';

// ============================================
// CONTEXT PROVIDERS
// ============================================
import { LenderProvider } from './contexts/LenderContext';

function App() {
  return (
    <BrowserRouter>
      <LenderProvider>
        <Routes>
          {/* MAIN PAGE */}
          <Route path="/" element={<HomePage />} />
	  <Route path="/search" element={<SearchResultsPage />} />
	  <Route path="/disclaimer" element={<Disclaimer />} />
	  <Route path="/grievance" element={<Grievance />} />
	  <Route path="/cancellation" element={<CancellationPolicy />} />
	  <Route path="/provider-terms" element={<ProviderTerms />} />
	  <Route path="/data-retention" element={<DataRetention />} />
	  <Route path="/payment-terms" element={<PaymentTerms />} />

          {/* HOSPITALS TAG */}
          <Route path="/hospitals" element={<HospitalsList />} />
          <Route path="/hospital-info/:id" element={<HospitalSimpleDetails />} />
	  <Route path="/compare-hospitals" element={<CompareHospitals />} />
          <Route path="/emergency-search" element={<EmergencySearch />} />
          <Route path="/book-opd/:id" element={<BookOPD />} />
          <Route path="/book-admission/:id" element={<BookAdmission />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/my-bookings" element={<MyBookings />} />

          {/* 🚑 AMBULANCE TAG (ENHANCED) */}
          <Route path="/ambulance" element={<Ambulance />} />
          <Route path="/profile" element={<PatientProfile />} />
          <Route path="/ambulance/emergency" element={<EmergencyRequest />} />
          <Route path="/ambulance/tracking/:bookingId" element={<LiveTracking />} />
          <Route path="/ambulance/schedule" element={<ScheduleTransport />} />
          <Route path="/ambulance/driver/app" element={<DriverApp />} />
          <Route path="/ambulance/emergency-contacts" element={<EmergencyContacts />} />
          <Route path="/ambulance/trip-sheet/:bookingId" element={<DigitalTripSheet />} />
          <Route path="/ambulance/register" element={<AmbulanceRegister />} />
          <Route path="/ambulance/login" element={<AmbulanceLogin />} />
          <Route path="/ambulance/dashboard" element={<AmbulanceDashboard />} />

          {/* AYURVEDA TAG */}
          <Route path="/ayurveda" element={<AyurvedaHub />} />
          <Route path="/ayurveda/search" element={<AyurvedaAdvancedSearch />} />
          <Route path="/ayurveda/doctors" element={<AyurvedaDoctors />} />
          <Route path="/ayurveda/doctor/:id" element={<AyurvedaDoctorProfile />} />
          <Route path="/ayurveda/centers" element={<PanchakarmaCenters />} />
          <Route path="/ayurveda/center/:id" element={<PanchakarmaCenterDetail />} />
          <Route path="/ayurveda/center/:centerId/book/:packageId" element={<BookPanchakarmaPackage />} />
          <Route path="/ayurveda/prakriti" element={<PrakritiQuiz />} />
          <Route path="/ayurveda/book/:doctorId" element={<BookAyurvedaConsult />} />
          <Route path="/ayurveda/payment/:bookingType/:bookingId" element={<AyurvedaPayment />} />
          <Route path="/ayurveda/confirmation/:bookingId" element={<AyurvedaBookingConfirmation />} />
          <Route path="/ayurveda/center/register" element={<WellnessCenterRegistration />} />
          <Route path="/ayurveda/center/login" element={<WellnessCenterLogin />} />
          <Route path="/ayurveda/center/dashboard" element={<WellnessCenterDashboard />} />
          <Route path="/ayurveda/review/:bookingId" element={<PatientReview />} />
          <Route path="/ayurveda/doctor/register" element={<DoctorRegistration />} />
          <Route path="/ayurveda/doctor/login" element={<DoctorLogin />} />
          <Route path="/ayurveda/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/ayurveda/prescription/write/:bookingId" element={<WritePrescription />} />
          <Route path="/ayurveda/prescription/:prescriptionId" element={<ViewPrescription />} />
	  <Route path="/ayurveda/commerce" element={<PrakritiCommerce />} />
	  <Route path="/ayurveda/panchakarma-tracker" element={<PanchakarmaTracker />} />
	  <Route path="/ayurveda/panchakarma-tracker/:bookingId" element={<PanchakarmaTracker />} />
	  <Route path="/ayurveda/seasonal-wellness" element={<SeasonalWellness />} />

          {/* HOMEOPATHY TAG */}
          <Route path="/homeopathy" element={<HomeopathyHub />} />
          <Route path="/homeopathy/doctors" element={<HomeopathyDoctors />} />
          <Route path="/homeopathy/pharmacy" element={<HomeopathyPharmacy />} />
          <Route path="/homeopathy/book/:doctorId" element={<BookHomeopathyConsult />} />
          <Route path="/homeopathy/doctor/register" element={<HomeoDoctorRegistration />} />
          <Route path="/homeopathy/doctor/login" element={<HomeoDoctorLogin />} />
          <Route path="/homeopathy/doctor/dashboard" element={<HomeoDoctorDashboard />} />
          <Route path="/homeopathy/center/register" element={<HomeoCenterRegistration />} />
          <Route path="/homeopathy/pharmacy/register" element={<HomeoPharmacyRegistration />} />
          <Route path="/homeopathy/centers" element={<NaturopathyCenters />} />
	  <Route path="/homeopathy/remedy-matcher" element={<RemedyMatcher />} />

          {/* LEGAL PAGES */}
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund" element={<RefundPolicy />} />

          {/* CAREGIVER TAG */}
          <Route path="/caregivers" element={<Caregivers />} />
          <Route path="/caregiver-profile/:id" element={<CaregiverProfile />} />
          <Route path="/book-caregiver/:id" element={<BookCaregiver />} />
          <Route path="/login" element={<Login />} />

          {/* DIAGNOSTICS TAG */}
          <Route path="/diagnostics-list" element={<DiagnosticsList />} />
          <Route path="/diagnostics-compare-providers" element={<DiagnosticsCompareProviders />} />
          <Route path="/diagnostics-custom-package" element={<DiagnosticsCustomPackage />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="/health-packages" element={<HealthPackages />} />
          <Route path="/package-detail/:id" element={<PackageDetail />} />
          <Route path="/test-compare" element={<SimpleCompareTest />} />
          <Route path="/provider-dashboard" element={<ProviderDashboard />} />
          <Route path="/admin-panel" element={<AdminPanel />} />

          {/* HEALTH EMI / LOAN TAG */}
          <Route path="/financing" element={<Financing />} />

          {/* LENDER PORTAL */}
          <Route path="/lender/login" element={<LenderLogin />} />
          <Route path="/lender/dashboard" element={<LenderDashboard />} />
          <Route path="/lender/applications" element={<LenderApplications />} />
          <Route path="/lender/applications/:id" element={<LenderApplicationDetail />} />
          <Route path="/lender/register" element={<LenderRegister />} />

          {/* ADMIN PANEL */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/verify-lenders" element={<AdminVerifyLenders />} />
          <Route path="/admin/commission" element={<AdminCommission />} />
          <Route path="/admin/discounts" element={<AdminDiscounts />} />
          <Route path="/admin/ayurveda" element={<AyurvedaAdminPanel />} />
          <Route path="/admin/finance" element={<AdminFinancialDashboard />} />
          <Route path="/admin/homeopathy" element={<HomeopathyAdminPanel />} />
          <Route path="/admin/hospitals" element={<AdminHospitals />} />
          <Route path="/admin/ambulance" element={<AdminAmbulance />} />
          <Route path="/admin/caregivers" element={<AdminCaregivers />} />
          <Route path="/admin/diagnostics" element={<AdminDiagnostics />} />
          <Route path="/admin/financing" element={<AdminFinancing />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/insurance-claims" element={<AdminInsuranceClaims />} />
          <Route path="/admin/mentalhealth" element={<AdminMentalHealth />} />
          <Route path="/admin/corporate" element={<AdminCorporate />} />
          <Route path="/admin/online-doctor" element={<AdminOnlineDoctor />} />

          {/* INSURANCE TAG */}
          <Route path="/insurance" element={<InsuranceHub />} />
          <Route path="/insurance/list" element={<InsuranceList />} />
          <Route path="/insurance/compare" element={<InsuranceCompare />} />
          <Route path="/insurance/plan/:id" element={<InsuranceDetail />} />
          <Route path="/insurance/apply/:planId" element={<InsuranceApplication />} />
          <Route path="/insurance/confirmation" element={<InsuranceConfirmation />} />
          <Route path="/insurance/my-policies/:id" element={<InsurancePolicyDetail />} />
          <Route path="/insurance/company/register" element={<InsuranceCompanyRegister />} />
          <Route path="/insurance/company/login" element={<InsuranceCompanyLogin />} />
          <Route path="/insurance/company/dashboard" element={<InsuranceCompanyDashboard />} />

          {/* CORPORATE TAG */}
          <Route path="/corporate" element={<CorporateHub />} />
          <Route path="/corporate/plans" element={<CorporatePlans />} />
          <Route path="/corporate/plan/:id" element={<CorporatePlanDetail />} />
          <Route path="/corporate/enroll" element={<CorporateEnrollment />} />
          <Route path="/corporate/hr/login" element={<CorporateHRLogin />} />
          <Route path="/corporate/hr/dashboard" element={<CorporateHRDashboard />} />
          <Route path="/corporate/checkups" element={<CorporateCheckups />} />
          <Route path="/corporate/wellness" element={<CorporateWellness />} />
          <Route path="/corporate/employee/login" element={<EmployeeLogin />} />
          <Route path="/corporate/employee/dashboard" element={<EmployeePortal />} />
	  <Route path="/employee/login" element={<EmployeeLogin />} />
	  <Route path="/employee/dashboard" element={<EmployeePortal />} />
	  <Route path="/corporate/register" element={<CompanyRegister />} />
	  <Route path="/employee/login" element={<EmployeeLogin />} />
	  <Route path="/employee/dashboard" element={<EmployeePortal />} />

          {/* PROVIDER REGISTRATION */}
          <Route path="/hospital/register" element={<HospitalRegister />} />
          <Route path="/hospital/login" element={<HospitalLogin />} />
          <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
          <Route path="/caregiver/register" element={<CaregiverRegister />} />
          <Route path="/caregiver/login" element={<CaregiverLogin />} />
          <Route path="/caregiver/dashboard" element={<CaregiverDashboard />} />
          <Route path="/diagnostics/register" element={<DiagnosticsRegister />} />
          <Route path="/diagnostics/login" element={<DiagnosticsLogin />} />
          <Route path="/diagnostics/dashboard" element={<DiagnosticsDashboard />} />

          {/* MENTAL HEALTH TAG */}
          <Route path="/mentalhealth" element={<MentalHealthHub />} />
          <Route path="/mentalhealth/therapists" element={<MentalHealthTherapists />} />
          <Route path="/mentalhealth/therapist/:id" element={<MentalHealthTherapistDetail />} />
          <Route path="/mentalhealth/book/:id" element={<MentalHealthBooking />} />
          <Route path="/mentalhealth/payment" element={<MentalHealthPayment />} />
          <Route path="/mentalhealth/confirmation" element={<MentalHealthConfirmation />} />
          <Route path="/mentalhealth/screening/:type" element={<MentalHealthScreening />} />
          <Route path="/mentalhealth/chat" element={<MentalHealthChat />} />
          <Route path="/mentalhealth/journal" element={<MentalHealthJournal />} />
          <Route path="/mentalhealth/resources" element={<MentalHealthResources />} />
          <Route path="/mentalhealth/crisis" element={<MentalHealthCrisis />} />
          <Route path="/mentalhealth/corporate" element={<MentalHealthCorporate />} />
          <Route path="/mentalhealth/therapist/register" element={<TherapistRegister />} />
          <Route path="/mentalhealth/therapist/login" element={<TherapistLogin />} />
          <Route path="/mentalhealth/therapist/dashboard" element={<TherapistDashboard />} />
          <Route path="/mentalhealth/therapist/earnings" element={<TherapistEarnings />} />

          {/* ONLINE DOCTOR TAG */}
          <Route path="/online-doctor" element={<OnlineDoctorHub />} />
          <Route path="/online-doctor/search" element={<DoctorSearch />} />
          <Route path="/online-doctor/doctor/:id" element={<DoctorProfile />} />
          <Route path="/online-doctor/book/:doctorId" element={<BookOnlineConsult />} />
          <Route path="/online-doctor/consult/:bookingId" element={<VideoConsult />} />
          <Route path="/online-doctor/register" element={<OnlineDoctorRegister />} />
          <Route path="/online-doctor/login" element={<OnlineDoctorLogin />} />
          <Route path="/online-doctor/dashboard" element={<OnlineDoctorDashboard />} />
          <Route path="/online-doctor/history" element={<ConsultHistory />} />
          <Route path="/online-doctor/reset-password/:token" element={<ResetPassword />} />
	  <Route path="/online-doctor/triage" element={<SymptomTriage />} />

          {/* OLD ROUTES - Redirected */}
          <Route path="/teleconsult" element={<OnlineDoctorHub />} />

	  {/* AI CONTROL CENTER */}
	  <Route path="/ai-control-center" element={<AIControlCenter />} />

          {/* OTHER */}
          <Route path="/lab-tests" element={<ComingSoon title="Lab Tests" />} />
          <Route path="/admin/upload" element={<AdminUpload />} />
        </Routes>
      </LenderProvider>
    </BrowserRouter>
  );
}

export default App;// force redeploy v3  

 
// force kiaeto deploy 
// force new build v10 
// force clean build v99 
// force v2  
// force deploy v99 
// trigger  

