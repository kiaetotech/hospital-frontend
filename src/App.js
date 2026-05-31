import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HospitalsList from './pages/HospitalsList';
import BookOPD from './pages/BookOPD';
import BookAdmission from './pages/BookAdmission';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import Ambulance from './pages/Ambulance';
import ComingSoon from './pages/ComingSoon';
import HospitalSimpleDetails from './pages/HospitalSimpleDetails';
import EmergencySearch from './pages/EmergencySearch';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hospitals" element={<HospitalsList />} />
        <Route path="/hospital-info/:id" element={<HospitalSimpleDetails />} />
        <Route path="/emergency-search" element={<EmergencySearch />} />
        <Route path="/book-opd/:id" element={<BookOPD />} />
        <Route path="/book-admission/:id" element={<BookAdmission />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/ambulance" element={<Ambulance />} />
        <Route path="/insurance" element={<ComingSoon title="Health Insurance" />} />
        <Route path="/lab-tests" element={<ComingSoon title="Lab Tests" />} />
        <Route path="/preventive" element={<ComingSoon title="Preventive Checkups" />} />
        <Route path="/caregivers" element={<ComingSoon title="Caregiver Services" />} />
        <Route path="/financing" element={<ComingSoon title="Health Financing" />} />
        <Route path="/teleconsult" element={<ComingSoon title="Teleconsultation" />} />
        <Route path="/corporate" element={<ComingSoon title="Corporate Health" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;