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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<HomePage />} />
        
        {/* Hospitals Tag */}
        <Route path="/hospitals" element={<HospitalsList />} />
        <Route path="/hospital-info/:id" element={<HospitalSimpleDetails />} />
        <Route path="/emergency-search" element={<EmergencySearch />} />
        
        {/* Booking Pages */}
        <Route path="/book-opd/:id" element={<BookOPD />} />
        <Route path="/book-admission/:id" element={<BookAdmission />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        
        {/* Ambulance Tag */}
        <Route path="/ambulance" element={<Ambulance />} />

	{/* caregiver Tag */}
	<Route path="/caregivers" element={<Caregivers />} />
	<Route path="/caregiver-profile/:id" element={<CaregiverProfile />} />
	<Route path="/book-caregiver/:id" element={<BookCaregiver />} />
	<Route path="/login" element={<Login />} />

	{/* diagnostics Tag */}
	<Route path="/diagnostics-list" element={<DiagnosticsList />} />
	<Route path="/diagnostics-compare-providers" element={<DiagnosticsCompareProviders />} />
	<Route path="/diagnostics-custom-package" element={<DiagnosticsCustomPackage />} />

        {/* Other Tags (Coming Soon) */}
        <Route path="/insurance" element={<ComingSoon title="Health Insurance" />} />
        <Route path="/lab-tests" element={<ComingSoon title="Lab Tests" />} />
        <Route path="/preventive" element={<ComingSoon title="Preventive Checkups" />} />
        <Route path="/financing" element={<ComingSoon title="Health Financing" />} />
        <Route path="/teleconsult" element={<ComingSoon title="Teleconsultation" />} />
        <Route path="/corporate" element={<ComingSoon title="Corporate Health" />} />
	<Route path="/admin/upload" element={<AdminUpload />} />
      </Routes>
    </BrowserRouter> //
  );
}

export default App;