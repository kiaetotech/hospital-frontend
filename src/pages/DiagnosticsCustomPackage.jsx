import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DiagnosticsCustomPackage = ({ preselectedTests = [] }) => {
  const navigate = useNavigate();
  const [allTests, setAllTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [providers, setProviders] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  
  // Booking modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    patient_name: '',
    patient_age: '',
    patient_gender: 'male',
    patient_phone: '',
    patient_email: '',
    appointment_date: '',
    home_collection_requested: false,
    home_address: ''
  });

  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => {}
      );
    }
    loadTests();
  }, []);

  useEffect(() => {
    if (preselectedTests && preselectedTests.length > 0) {
      setSelectedTests(preselectedTests);
      handleCompare(preselectedTests);
    }
  }, [preselectedTests]);

  const loadTests = async () => {
    try {
      const res = await axios.get(`${API_URL}/diagnostics/tests`);
      if (res.data?.data) setAllTests(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTest = (test) => {
    let newSelected;
    if (selectedTests.find(t => t._id === test._id)) {
      newSelected = selectedTests.filter(t => t._id !== test._id);
      setSelectedTests(newSelected);
      if (newSelected.length >= 2) handleCompare(newSelected);
      else setProviders([]);
    } else {
      newSelected = [...selectedTests, test];
      setSelectedTests(newSelected);
      if (newSelected.length >= 2) handleCompare(newSelected);
    }
  };

  const handleCompare = async (tests) => {
    if (tests.length < 2) return;
    setComparing(true);
    try {
      const testIds = tests.map(t => t._id);
      const res = await axios.post(`${API_URL}/diagnostics/compare-package`, { 
        testIds,
        lat: userLocation?.lat,
        lng: userLocation?.lng
      });
      if (res.data.providers) {
        const sorted = [...res.data.providers].sort((a, b) => {
          const totalA = tests.reduce((s, t) => s + (a.individual_prices[t._id] || 0), 0);
          const totalB = tests.reduce((s, t) => s + (b.individual_prices[t._id] || 0), 0);
          return totalA - totalB;
        });
        setProviders(sorted);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setComparing(false);
    }
  };

  // Booking functions
  const openBookingModal = (provider) => {
    setSelectedProvider(provider);
    setShowBookingModal(true);
  };

  const handleBookingChange = (e) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProvider) {
      alert('No provider selected');
      return;
    }
    
    const total = selectedTests.reduce((sum, test) => sum + (selectedProvider.individual_prices[test._id] || 0), 0);
    
    try {
      // First create a booking record
      const bookingData = {
        ...bookingForm,
        package_name: `Custom Package (${selectedTests.map(t => t.test_name).join(', ')})`,
        provider_name: selectedProvider.provider_name,
        total_amount: total,
        tests: selectedTests.map(t => ({ id: t._id, name: t.test_name, price: selectedProvider.individual_prices[t._id] }))
      };
      
      // Here you would call your booking API
      // const res = await axios.post(`${API_URL}/bookings/custom`, bookingData);
      
      alert(`Booking successful!\nProvider: ${selectedProvider.provider_name}\nTotal: ₹${total}\nReference: CUST${Date.now()}`);
      setShowBookingModal(false);
      setSelectedProvider(null);
      setBookingForm({
        patient_name: '', patient_age: '', patient_gender: 'male', patient_phone: '',
        patient_email: '', appointment_date: '', home_collection_requested: false, home_address: ''
      });
    } catch (err) {
      console.error('Booking error:', err);
      alert('Booking failed. Please try again.');
    }
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedProvider(null);
  };

  const filteredTests = allTests.filter(test =>
    test.test_name?.toLowerCase().includes('')
  );

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tests...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate('/diagnostics-list')}>← Back</button>
      <h1>Build Custom Package</h1>
      <p>Select 2 or more tests to compare prices.</p>
      
      <div style={{ marginBottom: '1rem', maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }}>
        {filteredTests.map(test => (
          <label key={test._id} style={{ display: 'block', padding: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!selectedTests.find(t => t._id === test._id)} onChange={() => toggleTest(test)} />
            {test.test_name}
          </label>
        ))}
      </div>
      
      {comparing && <p>Comparing...</p>}
      
      {providers.length > 0 && selectedTests.length >= 2 && (
        <div>
          <h2>Results - Cheapest Provider First</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Provider</th>
                  {selectedTests.map(test => (
                    <th key={test._id} style={{ border: '1px solid #ddd', padding: '8px' }}>{test.test_name}</th>
                  ))}
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Total</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Rating</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Distance</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider, idx) => {
                  const total = selectedTests.reduce((sum, test) => sum + (provider.individual_prices[test._id] || 0), 0);
                  return (
                    <tr key={idx}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{provider.provider_name} {idx === 0 && '⭐'}</td>
                      {selectedTests.map(test => (
                        <td key={test._id} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                          ₹{provider.individual_prices[test._id] || 'N/A'}
                        </td>
                      ))}
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}><strong>₹{total}</strong></td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>⭐ {provider.rating || 4.5}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{provider.distance || 'N/A'} km</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                        <button onClick={() => openBookingModal(provider)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          Book Now
                        </button>
                       </td>
                     </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Booking Modal */}
      {showBookingModal && selectedProvider && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2>Book Custom Package</h2>
            <p><strong>Provider:</strong> {selectedProvider.provider_name}</p>
            <p><strong>Tests:</strong> {selectedTests.map(t => t.test_name).join(', ')}</p>
            <p><strong>Total Amount:</strong> ₹{selectedTests.reduce((sum, test) => sum + (selectedProvider.individual_prices[test._id] || 0), 0)}</p>
            
            <form onSubmit={handleBookingSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Full Name *</label>
                <input type="text" name="patient_name" required value={bookingForm.patient_name} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Age *</label>
                  <input type="number" name="patient_age" required value={bookingForm.patient_age} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Gender *</label>
                  <select name="patient_gender" value={bookingForm.patient_gender} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Phone Number *</label>
                <input type="tel" name="patient_phone" required value={bookingForm.patient_phone} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                <input type="email" name="patient_email" value={bookingForm.patient_email} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Appointment Date *</label>
                <input type="date" name="appointment_date" required value={bookingForm.appointment_date} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>Confirm Booking</button>
                <button type="button" onClick={closeBookingModal} style={{ flex: 1, backgroundColor: '#6b7280', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsCustomPackage;