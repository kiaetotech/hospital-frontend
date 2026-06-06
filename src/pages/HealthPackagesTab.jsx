import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PackageTypeFilter from '../components/PackageTypeFilter';
import SmartSuggestions from '../components/SmartSuggestions';
import NearbyPackages from '../components/NearbyPackages';
import { useNavigate } from 'react-router-dom';

const HealthPackagesTab = () => {
  const navigate = useNavigate();
  
  // Package state
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [homeCollectionOnly, setHomeCollectionOnly] = useState(false);
  const [minRating, setMinRating] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [packageType, setPackageType] = useState('');
  
  // Comparison states
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  
  // Location states
  const [userLocation, setUserLocation] = useState(null);
  const [useLocation, setUseLocation] = useState(false);
  
  // UI states
  const [expandedPackages, setExpandedPackages] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  
  // Booking modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
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

  // ========== LOAD PACKAGES ==========
  useEffect(() => {
    loadPackages();
  }, [packageType]);

  useEffect(() => {
    if (useLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => console.log('Location denied')
      );
    }
  }, [useLocation]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, minPrice, maxPrice, minRating, maxDistance, homeCollectionOnly, packages, userLocation]);

  // Clear booking modal when leaving comparison view
  useEffect(() => {
    if (!showCompare) {
      setShowBookingModal(false);
      setSelectedPackage(null);
    }
  }, [showCompare]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/health-packages`;
      if (packageType) {
        url = `${API_URL}/health-packages/by-type/${packageType}`;
      }
      const res = await axios.get(url);
      setPackages(res.data.packages || []);
      setFilteredPackages(res.data.packages || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  // ========== DISTANCE CALCULATION ==========
  const getDistance = (pkg) => {
    if (pkg.distance_km) return pkg.distance_km;
    if (pkg.distance) return pkg.distance;
    
    if (userLocation && pkg.provider_id?.location?.lat) {
      const lat1 = userLocation.lat;
      const lon1 = userLocation.lng;
      const lat2 = pkg.provider_id.location.lat;
      const lon2 = pkg.provider_id.location.lng;
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return (R * c).toFixed(1);
    }
    
    const idNum = parseInt(pkg._id?.slice(-4) || '1000', 16) || 1000;
    return (idNum % 15) + 1;
  };

  // ========== FILTER FUNCTIONS ==========
  const applyFilters = () => {
    let filtered = [...packages];
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.package_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (minPrice) filtered = filtered.filter(p => p.discounted_price >= parseFloat(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.discounted_price <= parseFloat(maxPrice));
    if (homeCollectionOnly) filtered = filtered.filter(p => p.home_collection_available === true);
    if (minRating) filtered = filtered.filter(p => (p.provider_id?.rating || 0) >= parseFloat(minRating));
    if (maxDistance) {
      filtered = filtered.filter(p => {
        const distance = parseFloat(getDistance(p));
        return distance <= parseFloat(maxDistance);
      });
    }
    setFilteredPackages(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setMaxDistance('');
    setHomeCollectionOnly(false);
    setPackageType('');
    setFilteredPackages(packages);
  };

  // ========== COMPARISON FUNCTIONS ==========
  const toggleSelect = (pkg) => {
    if (selectedPackages.find(p => p._id === pkg._id)) {
      setSelectedPackages(selectedPackages.filter(p => p._id !== pkg._id));
    } else if (selectedPackages.length < 4) {
      setSelectedPackages([...selectedPackages, pkg]);
    } else {
      alert('You can compare up to 4 packages');
    }
  };

  const handleCompare = () => {
    if (selectedPackages.length >= 2) {
      setShowCompare(true);
    } else {
      alert('Select at least 2 packages');
    }
  };

  const toggleExpand = (packageId) => {
    setExpandedPackages(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  const handleTypeSelect = (type) => {
    setPackageType(type);
  };

  // ========== BOOKING FUNCTIONS ==========
  const handleBookingChange = (e) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPackage) {
      alert('No package selected');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/health-packages/${selectedPackage._id}/book`, bookingForm);
      alert(`Booking successful! Reference: ${res.data.booking_reference}`);
      setShowBookingModal(false);
      setSelectedPackage(null);
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
    setSelectedPackage(null);
    setBookingForm({
      patient_name: '', patient_age: '', patient_gender: 'male', patient_phone: '',
      patient_email: '', appointment_date: '', home_collection_requested: false, home_address: ''
    });
  };

  // ========== COMPARISON VIEW ==========
  if (showCompare) {
    const sortedPackages = [...selectedPackages].sort((a, b) => a.discounted_price - b.discounted_price);
    return (
      <div>
        <button onClick={() => setShowCompare(false)} style={{ marginBottom: '20px', cursor: 'pointer' }}>← Back to Packages</button>
        <h3>Compare Packages</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Feature</th>
                {sortedPackages.map((p, idx) => (
                  <th key={idx} style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: idx === 0 ? '#d1fae5' : '#f3f4f6' }}>
                    {p.package_name}
                    {idx === 0 && <span style={{ display: 'block', fontSize: '11px', color: '#10b981' }}>⭐ Cheapest</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Price</td>
                {sortedPackages.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}><strong>₹{p.discounted_price}</strong> <span style={{ textDecoration: 'line-through' }}>₹{p.mrp}</span><tr>)}
              </tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Provider</td>
                {sortedPackages.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>{p.provider_id?.provider_name || 'N/A'}</td>)}
              </tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Rating</td>
                {sortedPackages.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>⭐ {p.provider_id?.rating || 4.5}</td>)}
              </tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Distance</td>
                {sortedPackages.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>{getDistance(p)} km</td>)}
              </tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Home Collection</td>
                {sortedPackages.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>{p.home_collection_available ? '✅ Yes' : '❌ No'}</td>)}
              </tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Report Time</td>
                {sortedPackages.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>{p.report_time_hours} hours</td>)}
              </tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Tests</td>
                {sortedPackages.map((p, i) => <td key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>{p.tests_included_text?.split(',').length || 0} tests</td>)}
              </tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Action</td>
                {sortedPackages.map((p, i) => (
                  <td key={i} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button 
                      onClick={() => {
                        alert('Booking: ' + p.package_name);
                        setSelectedPackage(p);
                        setShowBookingModal(true);
                      }} 
                      style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Book Now
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ========== MAIN RETURN ==========
  return (
    <div>
      <h2>🏥 Health Packages</h2>
      <p>Select packages to compare prices, features, and more. Current filter: {packageType || 'All'}</p>

      {/* Package Type Filter */}
      <PackageTypeFilter selectedType={packageType} onSelectType={handleTypeSelect} />

      {/* Smart Suggestions Button */}
      <button onClick={() => setShowSuggestions(!showSuggestions)} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px' }}>
        🤖 Smart Suggestions
      </button>

      {/* Nearby Packages Button */}
      <button onClick={() => setShowNearby(!showNearby)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px', marginLeft: '10px' }}>
        📍 Nearby Packages
      </button>

      {showSuggestions && <SmartSuggestions onSelectPackage={(pkg) => {
        alert('Booking: ' + pkg.package_name);
        setSelectedPackage(pkg);
        setShowBookingModal(true);
      }} />}
      {showNearby && <NearbyPackages onSelectPackage={(pkg) => {
        alert('Booking: ' + pkg.package_name);
        setSelectedPackage(pkg);
        setShowBookingModal(true);
      }} />}

      {/* Search and Filters */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
          <input type="text" placeholder="🔍 Search packages..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <button onClick={resetFilters} style={{ backgroundColor: '#ef4444', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
          <button onClick={() => setUseLocation(true)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📍 My Location</button>
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>💰 Min Price</label>
            <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>💰 Max Price</label>
            <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>⭐ Min Rating</label>
            <select value={minRating} onChange={(e) => setMinRating(e.target.value)} style={{ width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="">Any</option>
              <option value="4">4★ & above</option>
              <option value="4.5">4.5★ & above</option>
              <option value="4.8">4.8★ & above</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>📏 Max Distance</label>
            <input type="number" placeholder="Max km" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} style={{ width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input type="checkbox" checked={homeCollectionOnly} onChange={(e) => setHomeCollectionOnly(e.target.checked)} />
              🏠 Home Collection
            </label>
          </div>
        </div>
        
        <div style={{ fontSize: '12px', marginTop: '15px' }}>
          Found {filteredPackages.length} packages | {selectedPackages.length} selected
        </div>
      </div>

      {/* Compare Button */}
      {selectedPackages.length >= 2 && (
        <button onClick={handleCompare} style={{ position: 'fixed', bottom: 20, right: 20, backgroundColor: '#10b981', color: 'white', padding: '15px 30px', border: 'none', borderRadius: 50, cursor: 'pointer', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          Compare ({selectedPackages.length})
        </button>
      )}

      {/* Packages Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading packages...</div>
      ) : filteredPackages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>No packages found</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
          {filteredPackages.map(pkg => {
            const testsList = pkg.tests_included_text ? pkg.tests_included_text.split(',').map(t => t.trim()) : [];
            const isSelected = selectedPackages.some(p => p._id === pkg._id);
            const distance = getDistance(pkg);
            const isExpanded = expandedPackages[pkg._id] || false;
            return (
              <div key={pkg._id} style={{ border: `1px solid ${isSelected ? '#10b981' : '#ddd'}`, borderRadius: '12px', padding: '20px', backgroundColor: isSelected ? '#f0fdf4' : 'white' }}>
                {pkg.is_popular && <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>🔥 Popular</span>}
                <h3>{pkg.package_name}</h3>
                <p style={{ color: '#6b7280' }}>{pkg.package_description?.substring(0, 100)}...</p>
                <p>🏥 {pkg.provider_id?.provider_name}</p>
                <div><span style={{ textDecoration: 'line-through' }}>₹{pkg.mrp}</span> <strong style={{ fontSize: '24px', color: '#10b981' }}>₹{pkg.discounted_price}</strong></div>
                <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#6b7280' }}>
                  <span>⭐ {pkg.provider_id?.rating}</span>
                  <span>📏 {distance} km</span>
                  {pkg.home_collection_available && <span>🏠 Home</span>}
                  <span>⏱️ {pkg.report_time_hours}h</span>
                </div>
                <details open={isExpanded}>
                  <summary onClick={(e) => { e.preventDefault(); toggleExpand(pkg._id); }} style={{ cursor: 'pointer', color: '#3b82f6' }}>📋 Tests ({testsList.length})</summary>
                  <ul>{testsList.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </details>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(pkg)} /> Compare
                  </label>
                  <button onClick={() => navigate(`/package-detail/${pkg._id}`)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>View Details</button>
                  <button onClick={() => {
                    alert('Booking: ' + pkg.package_name);
                    setSelectedPackage(pkg);
                    setShowBookingModal(true);
                  }} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Book Now</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedPackage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2>Book {selectedPackage.package_name}</h2>
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
              {selectedPackage.home_collection_available && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="checkbox" name="home_collection_requested" checked={bookingForm.home_collection_requested} onChange={(e) => setBookingForm({...bookingForm, home_collection_requested: e.target.checked})} />
                      Request Home Collection
                    </label>
                  </div>
                  {bookingForm.home_collection_requested && (
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px' }}>Home Address</label>
                      <textarea name="home_address" rows="3" value={bookingForm.home_address} onChange={handleBookingChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                  )}
                </>
              )}
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

export default HealthPackagesTab;