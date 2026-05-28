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
      </Routes>
    </BrowserRouter>
  );
}

export default App;