import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const ProviderDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [provider, setProvider] = useState(null);
  const [activeTab, setActiveTab] = useState('login');
  const [myPrices, setMyPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerData, setRegisterData] = useState({
    providerName: '',
    email: '',
    password: '',
    phone: '',
    city: ''
  });
   
  const [profileData, setProfileData] = useState({
    address: '',
    pincode: '',
    latitude: '',
    longitude: ''
  });
  const [priceFile, setPriceFile] = useState(null);
  
  const API_URL = 'https://hospital-backend-production-8de3.up.railway.app/api';

  useEffect(() => {
    const token = localStorage.getItem('providerToken');
    if (token) {
      fetchProfile(token);
    }
  }, []);

  const fetchProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/provider-auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProvider(response.data);
      setIsLoggedIn(true);
      fetchMyPrices();
    } catch (error) {
      localStorage.removeItem('providerToken');
    }
  };

  const fetchMyPrices = async () => {
    const token = localStorage.getItem('providerToken');
    try {
      const response = await axios.get(`${API_URL}/upload/my-prices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyPrices(response.data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.post(`${API_URL}/provider-auth/login`, {
        email: loginEmail,
        password: loginPassword
      });
      localStorage.setItem('providerToken', response.data.token);
      setProvider(response.data.provider);
      setIsLoggedIn(true);
      fetchMyPrices();
      setMessage('✅ Login successful!');
    } catch (error) {
      setMessage(`❌ Login failed: ${error.response?.data?.error || error.message}`);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.post(`${API_URL}/provider-auth/register`, registerData);
      localStorage.setItem('providerToken', response.data.token);
      setProvider(response.data.provider);
      setIsLoggedIn(true);
      setMessage('✅ Registration successful!');
    } catch (error) {
      setMessage(`❌ Registration failed: ${error.response?.data?.error || error.message}`);
    }
    setLoading(false);
  };

  const handleLogout = () => {
  localStorage.removeItem('providerToken');
  setIsLoggedIn(false);
  setProvider(null);
  setMyPrices([]);
  setMessage(''); // Clear success message on logout
  setActiveTab('login'); // Reset to login tab
};

  const handlePriceUpload = async (e) => {
    e.preventDefault();
    if (!priceFile) {
      setMessage('Please select an Excel file');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', priceFile);
    const token = localStorage.getItem('providerToken');
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/upload/prices`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setMessage(`✅ ${response.data.message}`);
      fetchMyPrices();
      setPriceFile(null);
      document.getElementById('priceFile').value = '';
    } catch (error) {
      setMessage(`❌ Upload failed: ${error.response?.data?.error || error.message}`);
    }
    setLoading(false);
  };

  const downloadTemplate = () => {
    const template = [
      ['testName', 'price', 'discountedPrice', 'homeCollectionAvailable', 'reportTimeHours', 'city'],
      ['Complete Blood Count', 299, 249, 'Yes', 24, 'Mumbai'],
      ['HbA1c', 499, 399, 'Yes', 24, 'Mumbai'],
      ['Vitamin D', 1299, 999, 'Yes', 48, 'Mumbai']
    ];
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Price List');
    XLSX.writeFile(wb, 'price_template.xlsx');
  };

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center' }}>🏥 Lab Agency Portal</h1>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setActiveTab('login')} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: activeTab === 'login' ? '#10b981' : '#f3f4f6' }}>Login</button>
          <button onClick={() => setActiveTab('register')} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: activeTab === 'register' ? '#10b981' : '#f3f4f6' }}>Register</button>
        </div>
        
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
            <h2>Login</h2>
            <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px' }}>Login</button>
          </form>
        )}
        
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
            <h2>Register</h2>
            <input type="text" placeholder="Agency Name" value={registerData.providerName} onChange={(e) => setRegisterData({...registerData, providerName: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <input type="email" placeholder="Email" value={registerData.email} onChange={(e) => setRegisterData({...registerData, email: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <input type="password" placeholder="Password" value={registerData.password} onChange={(e) => setRegisterData({...registerData, password: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <input type="tel" placeholder="Phone" value={registerData.phone} onChange={(e) => setRegisterData({...registerData, phone: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <input type="text" placeholder="City" value={registerData.city} onChange={(e) => setRegisterData({...registerData, city: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px' }}>Register</button>
          </form>
        )}
        {message && <p style={{ marginTop: '10px' }}>{message}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>🏥 {provider?.providerName}</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px' }}>Logout</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
          <h2>📤 Upload Prices</h2>
          <button onClick={downloadTemplate} style={{ marginBottom: '10px', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px' }}>Download Template</button>
          <form onSubmit={handlePriceUpload}>
            <input type="file" id="priceFile" accept=".xlsx, .xls" onChange={(e) => setPriceFile(e.target.files[0])} style={{ marginBottom: '10px' }} />
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px' }}>Upload</button>
          </form>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
          <h2>📋 Your Prices</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '8px' }}>Test</th>
                <th style={{ padding: '8px' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {myPrices.slice(0, 10).map(price => (
                <tr key={price._id}>
                  <td style={{ padding: '8px' }}>{price.testName}</td>
                  <td style={{ padding: '8px' }}>₹{price.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {message && <p style={{ marginTop: '20px' }}>{message}</p>}
    </div>
  );
};

const geocodeAddress = async (address, city) => {
  try {
    const fullAddress = `${address}, ${city}`;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

const updateProfileWithAddress = async (e) => {
  e.preventDefault();
  setLoading(true);
  const location = await geocodeAddress(profileData.address, provider.city);
  
  if (location) {
    setProfileData({
      ...profileData,
      latitude: location.lat,
      longitude: location.lon
    });
    // Save to backend
    const token = localStorage.getItem('providerToken');
    await axios.put(`${API_URL}/provider-auth/profile`, {
      address: profileData.address,
      pincode: profileData.pincode,
      latitude: location.lat,
      longitude: location.lon
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMessage('✅ Address updated successfully!');
  } else {
    setMessage('❌ Could not find location for this address');
  }
  setLoading(false);
};

export default ProviderDashboard;