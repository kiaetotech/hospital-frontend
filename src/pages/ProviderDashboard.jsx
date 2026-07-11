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
    city: '',
    address: '',
    pincode: ''
  });
  
  const [profileForm, setProfileForm] = useState({
    address: '',
    pincode: '',
    phone: ''
  });
  
  const [priceFile, setPriceFile] = useState(null);
  
  const API_URL = 'https://hospital-backend-production-f1b1.up.railway.app/api';

  // Geocoding function
  const geocodeAddress = async (address, city) => {
    try {
      if (!address || !city) return null;
      const fullAddress = `${address}, ${city}, India`;
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
      setProfileForm({
        address: response.data.address || '',
        pincode: response.data.pincode || '',
        phone: response.data.phone || ''
      });
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
      // Geocode address to get coordinates
      const location = await geocodeAddress(registerData.address, registerData.city);
      
      const response = await axios.post(`${API_URL}/provider-auth/register`, {
        providerName: registerData.providerName,
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone,
        city: registerData.city,
        address: registerData.address,
        pincode: registerData.pincode,
        latitude: location?.lat || null,
        longitude: location?.lon || null
      });
      
      localStorage.setItem('providerToken', response.data.token);
      setProvider(response.data.provider);
      setIsLoggedIn(true);
      setMessage(location ? '✅ Registration successful! Location detected.' : '✅ Registration successful! Please update your address for distance calculation.');
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
    setMessage('');
    setActiveTab('login');
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

  const updateProfileWithAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('providerToken');
      
      // Geocode address to get coordinates
      const location = await geocodeAddress(profileForm.address, provider?.city);
      
      const updateData = {
        address: profileForm.address,
        pincode: profileForm.pincode,
        phone: profileForm.phone
      };
      
      if (location) {
        updateData.latitude = location.lat;
        updateData.longitude = location.lon;
      }
      
      const response = await axios.put(`${API_URL}/provider-auth/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProvider(response.data.provider);
        setMessage(location ? '✅ Address updated with location!' : '⚠️ Address saved but location not found. Please check address.');
      } else {
        setMessage('✅ Profile updated successfully!');
      }
    } catch (error) {
      setMessage(`❌ Update failed: ${error.response?.data?.error || error.message}`);
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
          <button onClick={() => setActiveTab('login')} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: activeTab === 'login' ? '#10b981' : '#f3f4f6', border: 'none', borderRadius: '5px' }}>Login</button>
          <button onClick={() => setActiveTab('register')} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: activeTab === 'register' ? '#10b981' : '#f3f4f6', border: 'none', borderRadius: '5px' }}>Register</button>
        </div>
        
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2>Login</h2>
            <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
            <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{loading ? 'Logging in...' : 'Login'}</button>
          </form>
        )}
        
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2>Register</h2>
            <input type="text" placeholder="Agency Name" value={registerData.providerName} onChange={(e) => setRegisterData({...registerData, providerName: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
            <input type="email" placeholder="Email" value={registerData.email} onChange={(e) => setRegisterData({...registerData, email: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
            <input type="password" placeholder="Password" value={registerData.password} onChange={(e) => setRegisterData({...registerData, password: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
            <input type="tel" placeholder="Phone" value={registerData.phone} onChange={(e) => setRegisterData({...registerData, phone: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
            <input type="text" placeholder="City" value={registerData.city} onChange={(e) => setRegisterData({...registerData, city: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
            <input type="text" placeholder="Street Address" value={registerData.address} onChange={(e) => setRegisterData({...registerData, address: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
            <input type="text" placeholder="Pincode" value={registerData.pincode} onChange={(e) => setRegisterData({...registerData, pincode: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
              📍 Your address helps patients find labs near them.
            </p>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{loading ? 'Registering...' : 'Register'}</button>
          </form>
        )}
        {message && <p style={{ marginTop: '10px', padding: '10px', backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2', borderRadius: '5px' }}>{message}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🏥 {provider?.providerName}</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Upload Prices Section */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2>📤 Upload Prices</h2>
          <button onClick={downloadTemplate} style={{ marginBottom: '10px', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>📥 Download Template</button>
          <form onSubmit={handlePriceUpload}>
            <input type="file" id="priceFile" accept=".xlsx, .xls" onChange={(e) => setPriceFile(e.target.files[0])} style={{ marginBottom: '10px', width: '100%' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{loading ? 'Uploading...' : 'Upload Prices'}</button>
          </form>
        </div>
        
        {/* Profile & Address Section */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2>📍 Your Location (For Distance Calculation)</h2>
          <form onSubmit={updateProfileWithAddress}>
            <input 
              type="text" 
              placeholder="Street Address" 
              value={profileForm.address} 
              onChange={(e) => setProfileForm({...profileForm, address: e.target.value})} 
              required
              style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }} 
            />
            <input 
              type="text" 
              placeholder="Pincode" 
              value={profileForm.pincode} 
              onChange={(e) => setProfileForm({...profileForm, pincode: e.target.value})} 
              style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }} 
            />
            <input 
              type="tel" 
              placeholder="Phone Number" 
              value={profileForm.phone} 
              onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} 
              style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }} 
            />
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
              📍 Your address helps patients find labs near them. Distance is calculated automatically.
            </p>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px 20px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              {loading ? 'Updating...' : 'Update Address'}
            </button>
          </form>
          {provider?.latitude && provider?.longitude && (
            <p style={{ fontSize: '12px', color: '#10b981', marginTop: '10px' }}>✅ Location coordinates saved! Patients can find you.</p>
          )}
          {(!provider?.latitude || !provider?.longitude) && provider?.address && (
            <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '10px' }}>
              ⚠️ Location not geocoded. Click "Update Address" to fix.
            </p>
          )}
        </div>
      </div>
      
      {/* Your Prices Table */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2>📋 Your Prices ({myPrices.length} tests)</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Test Name</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Price (₹)</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Discounted (₹)</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Home Collection</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>City</th>
               </tr>
            </thead>
            <tbody>
              {myPrices.length > 0 ? (
                myPrices.map(price => (
                  <tr key={price._id}>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{price.testName}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>₹{price.price}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>₹{price.discountedPrice}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{price.homeCollectionAvailable ? '✅ Yes' : '❌ No'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{price.city}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No prices uploaded yet. Download template and upload your price list.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {message && (
        <p style={{ marginTop: '20px', padding: '10px', backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2', borderRadius: '5px' }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ProviderDashboard;
