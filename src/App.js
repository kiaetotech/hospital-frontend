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
        
        {/* Other Tags (Coming Soon) */}
        <Route path="/insurance" element={<ComingSoon title="Health Insurance" />} />
        <Route path="/lab-tests" element={<ComingSoon title="Lab Tests" />} />
        <Route path="/preventive" element={<ComingSoon title="Preventive Checkups" />} />
        <Route path="/caregivers" element={<ComingSoon title="Caregiver Services" />} />
        <Route path="/financing" element={<ComingSoon title="Health Financing" />} />
        <Route path="/teleconsult" element={<ComingSoon title="Teleconsultation" />} />
        <Route path="/corporate" element={<ComingSoon title="Corporate Health" />} />
      </Routes>
    </BrowserRouter> //
  );
}

export default App;