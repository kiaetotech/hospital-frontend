import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HospitalsList from './pages/HospitalsList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hospitals" element={<HospitalsList />} />
	<Route path="/book-opd/:id" element={<BookOPD />} />
	<Route path="/book-admission/:id" element={<BookAdmission />} />
	<Route path="/ambulance" element={<Ambulance />} />
	<Route path="/payment" element={<Payment />} />
	<Route path="/my-bookings" element={<MyBookings />} />
	<Route path="/hospital-info/:id" element={<HospitalSimpleDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;