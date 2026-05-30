import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HospitalsList from './pages/HospitalsList';
import BookOPD from './pages/BookOPD';
import BookAdmission from './pages/BookAdmission';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hospitals" element={<HospitalsList />} />
        <Route path="/book-opd/:id" element={<BookOPD />} />
	<Route path="/book-admission/:id" element={<BookAdmission />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
