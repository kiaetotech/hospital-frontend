import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PackageTypeFilter from '../components/PackageTypeFilter';
import SmartSuggestions from '../components/SmartSuggestions';
import NearbyPackages from '../components/NearbyPackages';
import { useNavigate } from 'react-router-dom';

const HealthPackagesTab = () => {
  const navigate = useNavigate();
  
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [homeCollectionOnly, setHomeCollectionOnly] = useState(false);
  const [minRating, setMinRating] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [packageType, setPackageType] = useState('');
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [useLocation, setUseLocation] = useState(false);
  const [expandedPackages, setExpandedPackages] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
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

  const getDistance = (pkg) => {
    if (pkg.distance_km) return pkg.distance_km;
    if (pkg.distance) return pkg.distance;
    
    if (userLocation && pkg.provider_id && pkg.provider_id.location && pkg.provider_id.location.lat) {
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
    
    const idNum = parseInt(pkg._id ? pkg._id.slice(-4) : '1000', 16) || 1000;
    return (idNum % 15) + 1;
  };

  const applyFilters = () => {
    let filtered = [...packages];
    if (searchTerm) {
      filtered = filtered.filter(function(p) {
        return (p.package_name && p.package_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
               (p.package_description && p.package_description.toLowerCase().includes(searchTerm.toLowerCase()));
      });
    }
    if (minPrice) {
      filtered = filtered.filter(function(p) { return p.discounted_price >= parseFloat(minPrice); });
    }
    if (maxPrice) {
      filtered = filtered.filter(function(p) { return p.discounted_price <= parseFloat(maxPrice); });
    }
    if (homeCollectionOnly) {
      filtered = filtered.filter(function(p) { return p.home_collection_available === true; });
    }
    if (minRating) {
      filtered = filtered.filter(function(p) { return (p.provider_id && p.provider_id.rating) ? p.provider_id.rating >= parseFloat(minRating) : 0 >= parseFloat(minRating); });
    }
    if (maxDistance) {
      filtered = filtered.filter(function(p) {
        var distance = parseFloat(getDistance(p));
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

  const toggleSelect = (pkg) => {
    var found = false;
    for (var i = 0; i < selectedPackages.length; i++) {
      if (selectedPackages[i]._id === pkg._id) {
        found = true;
        break;
      }
    }
    if (found) {
      var newSelected = [];
      for (var j = 0; j < selectedPackages.length; j++) {
        if (selectedPackages[j]._id !== pkg._id) {
          newSelected.push(selectedPackages[j]);
        }
      }
      setSelectedPackages(newSelected);
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
    var current = expandedPackages[packageId] || false;
    var newState = {};
    newState[packageId] = !current;
    setExpandedPackages(Object.assign({}, expandedPackages, newState));
  };

  const handleTypeSelect = (type) => {
    setPackageType(type);
  };

  const handleBookingChange = (e) => {
    var newForm = Object.assign({}, bookingForm);
    newForm[e.target.name] = e.target.value;
    setBookingForm(newForm);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPackage) {
      alert('No package selected');
      return;
    }
    try {
      const res = await axios.post(API_URL + '/health-packages/' + selectedPackage._id + '/book', bookingForm);
      alert('Booking successful! Reference: ' + res.data.booking_reference);
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
    var sortedPackages = [...selectedPackages];
    sortedPackages.sort(function(a, b) { return a.discounted_price - b.discounted_price; });
    
    return React.createElement('div', null,
      React.createElement('button', { onClick: function() { setShowCompare(false); }, style: { marginBottom: '20px', cursor: 'pointer' } }, '← Back to Packages'),
      React.createElement('h3', null, 'Compare Packages'),
      React.createElement('div', { style: { overflowX: 'auto' } },
        React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' } },
          React.createElement('thead', null,
            React.createElement('tr', { style: { backgroundColor: '#f3f4f6' } },
              React.createElement('th', { style: { padding: '12px', border: '1px solid #ddd' } }, 'Feature'),
              sortedPackages.map(function(p, idx) {
                return React.createElement('th', { key: idx, style: { padding: '12px', border: '1px solid #ddd', backgroundColor: idx === 0 ? '#d1fae5' : '#f3f4f6' } },
                  p.package_name,
                  idx === 0 ? React.createElement('span', { style: { display: 'block', fontSize: '11px', color: '#10b981' } }, '⭐ Cheapest') : null
                );
              })
            )
          ),
          React.createElement('tbody', null,
            React.createElement('tr', null,
              React.createElement('td', { style: { padding: '10px', border: '1px solid #ddd' } }, 'Price'),
              sortedPackages.map(function(p, i) {
                return React.createElement('td', { key: i, style: { padding: '10px', border: '1px solid #ddd' } }, React.createElement('strong', null, '₹', p.discounted_price));
              })
            ),
            React.createElement('tr', null,
              React.createElement('td', { style: { padding: '10px', border: '1px solid #ddd' } }, 'Provider'),
              sortedPackages.map(function(p, i) {
                return React.createElement('td', { key: i, style: { padding: '10px', border: '1px solid #ddd' } }, p.provider_id ? p.provider_id.provider_name : 'N/A');
              })
            ),
            React.createElement('tr', null,
              React.createElement('td', { style: { padding: '10px', border: '1px solid #ddd' } }, 'Rating'),
              sortedPackages.map(function(p, i) {
                return React.createElement('td', { key: i, style: { padding: '10px', border: '1px solid #ddd' } }, '⭐ ', p.provider_id ? p.provider_id.rating : 4.5);
              })
            ),
            React.createElement('tr', null,
              React.createElement('td', { style: { padding: '10px', border: '1px solid #ddd' } }, 'Distance'),
              sortedPackages.map(function(p, i) {
                return React.createElement('td', { key: i, style: { padding: '10px', border: '1px solid #ddd' } }, getDistance(p), ' km');
              })
            ),
            React.createElement('tr', null,
              React.createElement('td', { style: { padding: '10px', border: '1px solid #ddd' } }, 'Home Collection'),
              sortedPackages.map(function(p, i) {
                return React.createElement('td', { key: i, style: { padding: '10px', border: '1px solid #ddd' } }, p.home_collection_available ? '✅ Yes' : '❌ No');
              })
            ),
            React.createElement('tr', null,
              React.createElement('td', { style: { padding: '10px', border: '1px solid #ddd' } }, 'Report Time'),
              sortedPackages.map(function(p, i) {
                return React.createElement('td', { key: i, style: { padding: '10px', border: '1px solid #ddd' } }, p.report_time_hours, ' hours');
              })
            ),
            React.createElement('tr', null,
              React.createElement('td', { style: { padding: '10px', border: '1px solid #ddd' } }, 'Tests'),
              sortedPackages.map(function(p, i) {
                var testCount = p.tests_included_text ? p.tests_included_text.split(',').length : 0;
                return React.createElement('td', { key: i, style: { padding: '10px', border: '1px solid #ddd' } }, testCount, ' tests');
              })
            ),
            React.createElement('tr', null,
              React.createElement('td', { style: { padding: '10px', border: '1px solid #ddd' } }, 'Action'),
              sortedPackages.map(function(p, i) {
                var currentPackage = p;
                return React.createElement('td', { key: i, style: { padding: '10px', border: '1px solid #ddd', textAlign: 'center' } },
                  React.createElement('button', {
                    onClick: function() { 
                      alert('Booking: ' + currentPackage.package_name);
                      setSelectedPackage(currentPackage);
                      setShowBookingModal(true);
                    },
                    style: { backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }
                  }, 'Book Now')
                );
              })
            )
          )
        )
      )
    );
  }

  // ========== MAIN RETURN ==========
  return React.createElement('div', null,
    React.createElement('h2', null, '🏥 Health Packages'),
    React.createElement('p', null, 'Select packages to compare prices, features, and more. Current filter: ', packageType || 'All'),
    React.createElement(PackageTypeFilter, { selectedType: packageType, onSelectType: handleTypeSelect }),
    React.createElement('button', { onClick: function() { setShowSuggestions(!showSuggestions); }, style: { backgroundColor: '#8b5cf6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px' } }, '🤖 Smart Suggestions'),
    React.createElement('button', { onClick: function() { setShowNearby(!showNearby); }, style: { backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px', marginLeft: '10px' } }, '📍 Nearby Packages'),
    showSuggestions && React.createElement(SmartSuggestions, { onSelectPackage: function(pkg) { setSelectedPackage(pkg); setShowBookingModal(true); } }),
    showNearby && React.createElement(NearbyPackages, { onSelectPackage: function(pkg) { setSelectedPackage(pkg); setShowBookingModal(true); } }),
    React.createElement('div', { style: { backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' } },
      React.createElement('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' } },
        React.createElement('input', { type: 'text', placeholder: '🔍 Search packages...', value: searchTerm, onChange: function(e) { setSearchTerm(e.target.value); }, style: { flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' } }),
        React.createElement('button', { onClick: resetFilters, style: { backgroundColor: '#ef4444', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' } }, 'Reset'),
        React.createElement('button', { onClick: function() { setUseLocation(true); }, style: { backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' } }, '📍 My Location')
      ),
      React.createElement('div', { style: { display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' } },
        React.createElement('div', null, React.createElement('label', { style: { fontSize: '12px' } }, '💰 Min Price'), React.createElement('input', { type: 'number', placeholder: 'Min', value: minPrice, onChange: function(e) { setMinPrice(e.target.value); }, style: { width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' } })),
        React.createElement('div', null, React.createElement('label', { style: { fontSize: '12px' } }, '💰 Max Price'), React.createElement('input', { type: 'number', placeholder: 'Max', value: maxPrice, onChange: function(e) { setMaxPrice(e.target.value); }, style: { width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' } })),
        React.createElement('div', null, React.createElement('label', { style: { fontSize: '12px' } }, '⭐ Min Rating'), React.createElement('select', { value: minRating, onChange: function(e) { setMinRating(e.target.value); }, style: { width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' } },
          React.createElement('option', { value: '' }, 'Any'),
          React.createElement('option', { value: '4' }, '4★ & above'),
          React.createElement('option', { value: '4.5' }, '4.5★ & above'),
          React.createElement('option', { value: '4.8' }, '4.8★ & above')
        )),
        React.createElement('div', null, React.createElement('label', { style: { fontSize: '12px' } }, '📏 Max Distance'), React.createElement('input', { type: 'number', placeholder: 'Max km', value: maxDistance, onChange: function(e) { setMaxDistance(e.target.value); }, style: { width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' } })),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center' } }, React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '5px' } }, React.createElement('input', { type: 'checkbox', checked: homeCollectionOnly, onChange: function(e) { setHomeCollectionOnly(e.target.checked); } }), ' 🏠 Home Collection'))
      ),
      React.createElement('div', { style: { fontSize: '12px', marginTop: '15px' } }, 'Found ', filteredPackages.length, ' packages | ', selectedPackages.length, ' selected')
    ),
    selectedPackages.length >= 2 && React.createElement('button', { onClick: handleCompare, style: { position: 'fixed', bottom: 20, right: 20, backgroundColor: '#10b981', color: 'white', padding: '15px 30px', border: 'none', borderRadius: 50, cursor: 'pointer', zIndex: 1000 } }, 'Compare (', selectedPackages.length, ')'),
    loading ? React.createElement('div', null, 'Loading packages...') : (filteredPackages.length === 0 ? React.createElement('div', null, 'No packages found') :
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' } },
        filteredPackages.map(function(pkg) {
          var testsList = pkg.tests_included_text ? pkg.tests_included_text.split(',').map(function(t) { return t.trim(); }) : [];
          var isSelected = false;
          for (var s = 0; s < selectedPackages.length; s++) {
            if (selectedPackages[s]._id === pkg._id) {
              isSelected = true;
              break;
            }
          }
          var distance = getDistance(pkg);
          var isExpanded = expandedPackages[pkg._id] || false;
          return React.createElement('div', { key: pkg._id, style: { border: '1px solid ' + (isSelected ? '#10b981' : '#ddd'), borderRadius: '12px', padding: '20px', backgroundColor: isSelected ? '#f0fdf4' : 'white' } },
            pkg.is_popular && React.createElement('span', { style: { backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', display: 'inline-block', marginBottom: '10px' } }, '🔥 Popular'),
            React.createElement('h3', null, pkg.package_name),
            React.createElement('p', { style: { color: '#6b7280' } }, pkg.package_description ? pkg.package_description.substring(0, 100) : '', '...'),
            React.createElement('p', null, '🏥 ', pkg.provider_id ? pkg.provider_id.provider_name : 'N/A'),
            React.createElement('div', null, React.createElement('span', { style: { textDecoration: 'line-through' } }, '₹', pkg.mrp), React.createElement('strong', { style: { fontSize: '24px', color: '#10b981', marginLeft: '10px' } }, '₹', pkg.discounted_price)),
            React.createElement('div', { style: { display: 'flex', gap: '10px', fontSize: '12px' } },
              React.createElement('span', null, '⭐ ', pkg.provider_id ? pkg.provider_id.rating : 4.5),
              React.createElement('span', null, '📏 ', distance, ' km'),
              pkg.home_collection_available && React.createElement('span', null, '🏠 Home'),
              React.createElement('span', null, '⏱️ ', pkg.report_time_hours, 'h')
            ),
            React.createElement('details', { open: isExpanded },
              React.createElement('summary', { onClick: function(e) { e.preventDefault(); toggleExpand(pkg._id); }, style: { cursor: 'pointer', color: '#3b82f6' } }, '📋 Tests (', testsList.length, ')'),
              React.createElement('ul', null, testsList.map(function(t, i) { return React.createElement('li', { key: i }, t); }))
            ),
            React.createElement('div', { style: { display: 'flex', gap: '10px', marginTop: '10px' } },
              React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '5px' } }, React.createElement('input', { type: 'checkbox', checked: isSelected, onChange: function() { toggleSelect(pkg); } }), ' Compare'),
              React.createElement('button', { onClick: function() { navigate('/package-detail/' + pkg._id); }, style: { backgroundColor: '#3b82f6', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' } }, 'View Details'),
              React.createElement('button', { onClick: function() { setSelectedPackage(pkg); setShowBookingModal(true); }, style: { backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' } }, 'Book Now')
            )
          );
        })
      )
    ),
    // DEBUG DIV - Shows current modal state
    React.createElement('div', { style: { backgroundColor: 'yellow', padding: '10px', margin: '10px', border: '1px solid black', position: 'fixed', bottom: '10px', left: '10px', zIndex: 9999 } },
      'DEBUG: showBookingModal = ', String(showBookingModal), ', selectedPackage = ', selectedPackage ? selectedPackage.package_name : 'null'
    ),
    showBookingModal && selectedPackage && React.createElement('div', { style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      React.createElement('div', { style: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' } },
        React.createElement('h2', null, 'Book ', selectedPackage.package_name),
        React.createElement('form', { onSubmit: handleBookingSubmit },
          React.createElement('div', { style: { marginBottom: '15px' } }, React.createElement('label', { style: { display: 'block', marginBottom: '5px' } }, 'Full Name *'), React.createElement('input', { type: 'text', name: 'patient_name', required: true, value: bookingForm.patient_name, onChange: handleBookingChange, style: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' } })),
          React.createElement('div', { style: { display: 'flex', gap: '15px', marginBottom: '15px' } },
            React.createElement('div', { style: { flex: 1 } }, React.createElement('label', { style: { display: 'block', marginBottom: '5px' } }, 'Age *'), React.createElement('input', { type: 'number', name: 'patient_age', required: true, value: bookingForm.patient_age, onChange: handleBookingChange, style: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' } })),
            React.createElement('div', { style: { flex: 1 } }, React.createElement('label', { style: { display: 'block', marginBottom: '5px' } }, 'Gender *'), React.createElement('select', { name: 'patient_gender', value: bookingForm.patient_gender, onChange: handleBookingChange, style: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' } },
              React.createElement('option', { value: 'male' }, 'Male'),
              React.createElement('option', { value: 'female' }, 'Female'),
              React.createElement('option', { value: 'other' }, 'Other')
            ))
          ),
          React.createElement('div', { style: { marginBottom: '15px' } }, React.createElement('label', { style: { display: 'block', marginBottom: '5px' } }, 'Phone Number *'), React.createElement('input', { type: 'tel', name: 'patient_phone', required: true, value: bookingForm.patient_phone, onChange: handleBookingChange, style: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' } })),
          React.createElement('div', { style: { marginBottom: '15px' } }, React.createElement('label', { style: { display: 'block', marginBottom: '5px' } }, 'Email'), React.createElement('input', { type: 'email', name: 'patient_email', value: bookingForm.patient_email, onChange: handleBookingChange, style: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' } })),
          React.createElement('div', { style: { marginBottom: '15px' } }, React.createElement('label', { style: { display: 'block', marginBottom: '5px' } }, 'Appointment Date *'), React.createElement('input', { type: 'date', name: 'appointment_date', required: true, value: bookingForm.appointment_date, onChange: handleBookingChange, style: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' } })),
          selectedPackage.home_collection_available && React.createElement('div', null,
            React.createElement('div', { style: { marginBottom: '15px' } }, React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, React.createElement('input', { type: 'checkbox', name: 'home_collection_requested', checked: bookingForm.home_collection_requested, onChange: function(e) { setBookingForm(Object.assign({}, bookingForm, { home_collection_requested: e.target.checked })); } }), ' Request Home Collection')),
            bookingForm.home_collection_requested && React.createElement('div', { style: { marginBottom: '15px' } }, React.createElement('label', { style: { display: 'block', marginBottom: '5px' } }, 'Home Address'), React.createElement('textarea', { name: 'home_address', rows: 3, value: bookingForm.home_address, onChange: handleBookingChange, style: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' } }))
          ),
          React.createElement('div', { style: { marginTop: '20px', display: 'flex', gap: '10px' } },
            React.createElement('button', { type: 'submit', style: { flex: 1, backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' } }, 'Confirm Booking'),
            React.createElement('button', { type: 'button', onClick: closeBookingModal, style: { flex: 1, backgroundColor: '#6b7280', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' } }, 'Cancel')
          )
        )
      )
    )
  );
};

export default HealthPackagesTab;