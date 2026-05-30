import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HospitalsList from './pages/HospitalsList';
import BookOPD from './pages/BookOPD';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hospitals" element={<HospitalsList />} />
        <Route path="/book-opd/:id" element={<BookOPD />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
