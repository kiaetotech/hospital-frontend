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
import Ambulance from './pages/Ambulance';
import AmbulanceTracking from './pages/AmbulanceTracking';

// Add inside <Routes>:
<Route path="/ambulance" element={<Ambulance />} />
<Route path="/ambulance-tracking/:id" element={<AmbulanceTracking />} />
export default App;