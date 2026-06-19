import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AyurvedaDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    specialization: '',
    minRating: '',
    maxFee: '',
    sortBy: 'rating'
  });

  // All Indian Cities (Pan India)
  const allCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune',
    'Jaipur', 'Lucknow', 'Kochi', 'Chandigarh', 'Indore', 'Bhopal', 'Nagpur', 'Surat',
    'Vadodara', 'Patna', 'Guwahati', 'Bhubaneswar', 'Dehradun', 'Rishikesh', 'Haridwar',
    'Varanasi', 'Agra', 'Udaipur', 'Jodhpur', 'Goa', 'Mysore', 'Coimbatore', 'Trivandrum',
    'Visakhapatnam', 'Raipur', 'Ranchi', 'Ludhiana', 'Amritsar', 'Nashik', 'Aurangabad',
    'Mangalore', 'Madurai', 'Tirupati', 'Shimla', 'Manali', 'Dharamshala',
    'Pushkar', 'Ajmer', 'Allahabad', 'Kanpur', 'Rajkot', 'Jammu', 'Srinagar'
  ].sort();

  const specializations = [
    'Panchakarma', 'General Ayurveda', 'Kerala Ayurveda', 'Ayurvedic Dermatology',
    'Kayachikitsa', 'Rasayana Therapy', 'Shalya Tantra', 'Prasuti & Stri Roga',
    'Bal Roga', 'Swasthavritta'
  ];

  // Dummy Doctor Database (Pan India)
  const allDoctors = [
    {
      _id: 'AYD001',
      name: 'Dr. Rajesh Sharma',
      specialization: 'Panchakarma',
      experience: 15,
      rating: 4.8,
      reviews: 124,
      consultationFee: 500,
      languages: ['Hindi', 'English'],
      city: 'Mumbai',
      area: 'Andheri West',
      address: 'Sharma Ayurvedic Clinic, Near Andheri Station',
      coordinates: { lat: 19.1136, lng: 72.8697 },
      consultationTypes: { online: true, clinic: true },
      education: 'BAMS, MD (Panchakarma) - Gujarat Ayurved University',
      about: '15+ years experience in authentic Panchakarma therapies. Specialized in chronic disease management through detoxification.',
      available: true,
      nextAvailable: 'Today 2:00 PM',
      wellnessCenter: 'Sharma Ayurvedic Clinic'
    },
    {
      _id: 'AYD002',
      name: 'Dr. Priya Gupta',
      specialization: 'General Ayurveda',
      experience: 12,
      rating: 4.9,
      reviews: 98,
      consultationFee: 400,
      languages: ['Hindi', 'English', 'Marathi'],
      city: 'Mumbai',
      area: 'Bandra',
      address: 'Gupta Ayurveda Center, Bandra West',
      coordinates: { lat: 19.0596, lng: 72.8295 },
      consultationTypes: { online: true, clinic: true },
      education: 'BAMS, MD (Kayachikitsa) - Pune University',
      about: 'Holistic Ayurvedic physician focusing on lifestyle disorders, women health, and preventive care.',
      available: true,
      nextAvailable: 'Today 4:00 PM',
      wellnessCenter: 'Gupta Ayurveda Center'
    },
    {
      _id: 'AYD003',
      name: 'Dr. Amit Verma',
      specialization: 'Kerala Ayurveda',
      experience: 20,
      rating: 4.7,
      reviews: 156,
      consultationFee: 600,
      languages: ['English', 'Malayalam', 'Hindi'],
      city: 'Kochi',
      area: 'Fort Kochi',
      address: 'Verma Kerala Ayurveda, Fort Kochi',
      coordinates: { lat: 9.9652, lng: 76.2421 },
      consultationTypes: { online: true, clinic: true },
      education: 'BAMS, MD (Ayurveda), PhD - Kerala University',
      about: 'Renowned Kerala Ayurveda practitioner with expertise in authentic Panchakarma and Rasayana therapies.',
      available: false,
      nextAvailable: 'Tomorrow 9:00 AM',
      wellnessCenter: 'Kerala Ayurveda Hospital'
    },
    {
      _id: 'AYD004',
      name: 'Dr. Sunita Reddy',
      specialization: 'Ayurvedic Dermatology',
      experience: 10,
      rating: 4.6,
      reviews: 72,
      consultationFee: 350,
      languages: ['Telugu', 'English', 'Hindi'],
      city: 'Hyderabad',
      area: 'Banjara Hills',
      address: 'Reddy Skin & Ayurveda Clinic, Road No 12',
      coordinates: { lat: 17.4156, lng: 78.4347 },
      consultationTypes: { online: true, clinic: true },
      education: 'BAMS, Diploma in Dermatology - Hyderabad University',
      about: 'Specialized in treating skin disorders through Ayurvedic herbs and therapies.',
      available: true,
      nextAvailable: 'Today 3:00 PM',
      wellnessCenter: 'Reddy Ayurvedic Skin Clinic'
    },
    {
      _id: 'AYD005',
      name: 'Dr. Karan Patel',
      specialization: 'Panchakarma',
      experience: 8,
      rating: 4.5,
      reviews: 45,
      consultationFee: 450,
      languages: ['Gujarati', 'Hindi', 'English'],
      city: 'Ahmedabad',
      area: 'SG Highway',
      address: 'Patel Panchakarma Center, SG Highway',
      coordinates: { lat: 23.0225, lng: 72.5714 },
      consultationTypes: { online: true, clinic: true },
      education: 'BAMS, MD (Panchakarma) - Gujarat Ayurved University',
      about: 'Young and dynamic Panchakarma specialist focusing on modern lifestyle diseases.',
      available: true,
      nextAvailable: 'Today 12:00 PM',
      wellnessCenter: 'Patel Panchakarma Center'
    },
    {
      _id: 'AYD006',
      name: 'Dr. Meera Nair',
      specialization: 'Kayachikitsa',
      experience: 14,
      rating: 4.8,
      reviews: 89,
      consultationFee: 550,
      languages: ['Malayalam', 'English', 'Tamil'],
      city: 'Kochi',
      area: 'Edappally',
      address: 'Nair Ayurveda Wellness, Edappally',
      coordinates: { lat: 10.0253, lng: 76.3086 },
      consultationTypes: { online: true, clinic: true },
      education: 'BAMS, MD (Kayachikitsa) - Kerala University',
      about: 'Expert in internal medicine and chronic disease management through Ayurveda.',
      available: true,
      nextAvailable: 'Today 5:00 PM',
      wellnessCenter: 'Nair Ayurveda Wellness Center'
    },
    {
      _id: 'AYD007',
      name: 'Dr. Vikram Singh',
      specialization: 'Rasayana Therapy',
      experience: 18,
      rating: 4.9,
      reviews: 134,
      consultationFee: 700,
      languages: ['Hindi', 'English'],
      city: 'Delhi',
      area: 'Hauz Khas',
      address: 'Singh Rasayana Clinic, Hauz Khas Village',
      coordinates: { lat: 28.5494, lng: 77.2001 },
      consultationTypes: { online: true, clinic: true },
      education: 'BAMS, MD (Rasayana) - BHU Varanasi',
      about: 'Specialist in rejuvenation therapy and anti-aging treatments with 18 years experience.',
      available: true,
      nextAvailable: 'Today 11:00 AM',
      wellnessCenter: 'Dhanvantari Rasayana Center'
    },
    {
      _id: 'AYD008',
      name: 'Dr. Ananya Das',
      specialization: 'General Ayurveda',
      experience: 9,
      rating: 4.4,
      reviews: 56,
      consultationFee: 300,
      languages: ['Bengali', 'English', 'Hindi'],
      city: 'Kolkata',
      area: 'Salt Lake',
      address: 'Das Ayurvedic Clinic, Salt Lake Sector 5',
      coordinates: { lat: 22.5726, lng: 88.3639 },
      consultationTypes: { online: true, clinic: true },
      education: 'BAMS - Calcutta University',
      about: 'Compassionate Ayurvedic doctor focusing on family health and preventive care.',
      available: true,
      nextAvailable: 'Today 1:00 PM',
      wellnessCenter: 'Das Family Ayurveda Clinic'
    },
    {
      _id: 'AYD009',
      name: 'Dr. Suresh Menon',
      specialization: 'Panchakarma',
      experience: 22,
      rating: 4.9,
      reviews: 210,
      consultationFee: 800,
      languages: ['Malayalam', 'English', 'Tamil', 'Hindi'],
      city: 'Mumbai',
      area: 'Juhu',
      address: 'Menon Ayurveda Hospital, Juhu Beach',
      coordinates: { lat: 19.1075, lng: 72.8263 },
      consultationTypes: { online: true, clinic: true },
      education: 'BAMS, MD, PhD (Panchakarma) - Kerala & Mumbai University',
      about: '40+ years of combined Ayurvedic legacy. Expert in classical Panchakarma procedures.',
      available: false,
      nextAvailable: 'Monday 10:00 AM',
      wellnessCenter: 'Menon Ayurveda Hospital & Research Center'
    },
    {
      _id: 'AYD010',
      name: 'Dr. Pooja Thakur',
      specialization: 'Ayurvedic Dermatology',
      experience: 7,
      rating: 4.3,
      reviews: 38,
      consultationFee: 350,
      languages: ['Hindi', 'English', 'Punjabi'],
      city: 'Delhi',
      area: 'Lajpat Nagar',
      address: 'Thakur Skin & Ayurveda Clinic',
      coordinates: { lat: 28.5715, lng: 77.2434 },
      consultationTypes: { online: true, clinic: true },
      education: 'BAMS, PG Diploma (Dermatology) - Delhi University',
      about: 'Modern approach to Ayurvedic dermatology for acne, eczema, and psoriasis.',
      available: true,
      nextAvailable: 'Today 6:00 PM',
      wellnessCenter: 'Thakur Ayurvedic Skin Care'
    },
    {
      _id: 'AYD011',
      name: 'Dr. Ramesh Iyer',
      specialization: 'General Ayurveda',
      experience: 16,
      rating: 4.7,
      reviews: 92,
      consultationFee: 500,
      languages: ['Tamil', 'English', 'Kannada'],
      city: 'Bangalore',
      area: 'Koramangala',
      address: 'Iyer Ayurveda Clinic, Koramangala 5th Block',
      coordinates: { lat: 12.9352, lng: 77.6245 },
      consultationTypes: { online: true, clinic: true },
      education: 'BAMS, MD - Bangalore University',
      about: 'Experienced Ayurvedic physician specializing in lifestyle disorders and stress management.',
      available: true,
      nextAvailable: 'Today 10:00 AM',
      wellnessCenter: 'Iyer Ayurveda Clinic'
    },
    {
      _id: 'AYD012',
      name: 'Dr. Kavita Joshi',
      specialization: 'Prasuti & Stri Roga',
      experience: 11,
      rating: 4.8,
      reviews: 67,
      consultationFee: 450,
      languages: ['Hindi', 'English'],
      city: 'Jaipur',
      area: 'Malviya Nagar',
      address: 'Joshi Women Wellness Center, Malviya Nagar',
      coordinates: { lat: 26.9124, lng: 75.7873 },
      consultationTypes: { online: true, clinic: true },
      education: 'BAMS, MD (Prasuti Tantra) - Jaipur University',
      about: 'Specialized in women health, fertility, and prenatal/postnatal Ayurvedic care.',
      available: true,
      nextAvailable: 'Today 2:30 PM',
      wellnessCenter: 'Joshi Women Wellness Center'
    },
    {
      _id: 'AYD013',
      name: 'Dr. Deepak Nambiar',
      specialization: 'Kerala Ayurveda',
      experience: 25,
      rating: 4.9,
      reviews: 180,
      consultationFee: 900,
      languages: ['Malayalam', 'English', 'Tamil'],
      city: 'Trivandrum',
      area: 'Kovalam',
      address: 'Nambiar Heritage Ayurveda, Kovalam Beach Road',
      coordinates: { lat: 8.5241, lng: 76.9366 },
      consultationTypes: { online: true, clinic: true },
      education: 'BAMS, MD (Ayurveda) - Kerala University, 25+ years',
      about: 'Fifth generation Ayurvedic practitioner. Specialized in traditional Kerala therapies.',
      available: true,
      nextAvailable: 'Today 9:00 AM',
      wellnessCenter: 'Nambiar Heritage Ayurveda'
    },
    {
      _id: 'AYD014',
      name: 'Dr. Neha Sharma',
      specialization: 'Swasthavritta',
      experience: 6,
      rating: 4.2,
      reviews: 28,
      consultationFee: 300,
      languages: ['Hindi', 'English'],
      city: 'Dehradun',
      area: 'Rajpur Road',
      address: 'Sharma Wellness Clinic, Rajpur Road',
      coordinates: { lat: 30.3165, lng: 78.0322 },
      consultationTypes: { online: true, clinic: true },
      education: 'BAMS, Diploma in Yoga & Naturopathy',
      about: 'Focus on preventive healthcare, lifestyle modification, and stress management.',
      available: true,
      nextAvailable: 'Today 4:00 PM',
      wellnessCenter: 'Sharma Wellness Clinic'
    },
    {
      _id: 'AYD015',
      name: 'Dr. Arjun Patil',
      specialization: 'Panchakarma',
      experience: 13,
      rating: 4.6,
      reviews: 78,
      consultationFee: 550,
      languages: ['Marathi', 'Hindi', 'English'],
      city: 'Pune',
      area: 'Kothrud',
      address: 'Patil Panchakarma Hospital, Kothrud',
      coordinates: { lat: 18.5204, lng: 73.8567 },
      consultationTypes: { online: true, clinic: true },
      education: 'BAMS, MD (Panchakarma) - Pune University',
      about: 'Expert in therapeutic Panchakarma with modern diagnostic approach.',
      available: true,
      nextAvailable: 'Today 1:30 PM',
      wellnessCenter: 'Patil Panchakarma Hospital'
    }
  ];

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Default to center of India if denied
          setUserLocation({ lat: 20.5937, lng: 78.9629 });
        }
      );
    } else {
      setUserLocation({ lat: 20.5937, lng: 78.9629 });
    }
    setDoctors(allDoctors);
    setFilteredDoctors(allDoctors);
    setLoading(false);
  }, []);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round((R * c) * 10) / 10;
  };

  // Apply all filters and sorting
  useEffect(() => {
    let result = [...allDoctors];

    // Search by name, city, specialization, wellness center
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(term) ||
        d.specialization.toLowerCase().includes(term) ||
        d.city.toLowerCase().includes(term) ||
        d.area.toLowerCase().includes(term) ||
        d.wellnessCenter.toLowerCase().includes(term) ||
        d.languages.some(l => l.toLowerCase().includes(term))
      );
    }

    // City filter
    if (filters.city) {
      result = result.filter(d => d.city === filters.city);
    }

    // Specialization filter
    if (filters.specialization) {
      result = result.filter(d => d.specialization === filters.specialization);
    }

    // Minimum rating filter
    if (filters.minRating) {
      result = result.filter(d => d.rating >= parseFloat(filters.minRating));
    }

    // Maximum fee filter
    if (filters.maxFee) {
      result = result.filter(d => d.consultationFee <= parseInt(filters.maxFee));
    }

    // Add distance if user location available
    if (userLocation) {
      result = result.map(d => ({
        ...d,
        distance: calculateDistance(
          userLocation.lat, userLocation.lng,
          d.coordinates.lat, d.coordinates.lng
        )
      }));
    }

    // Sorting
    switch(filters.sortBy) {
      case 'distance':
        result.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        break;
      case 'fee-low':
        result.sort((a, b) => a.consultationFee - b.consultationFee);
        break;
      case 'fee-high':
        result.sort((a, b) => b.consultationFee - a.consultationFee);
        break;
      case 'experience':
        result.sort((a, b) => b.experience - a.experience);
        break;
      case 'rating':
      default:
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    setFilteredDoctors(result);
  }, [searchTerm, filters, userLocation]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      city: '',
      specialization: '',
      minRating: '',
      maxFee: '',
      sortBy: 'rating'
    });
  };

  // Navigate to booking with doctor data
  const handleBookNow = (e, doctor, type) => {
    e.stopPropagation();
    navigate(`/ayurveda/book/${doctor._id}`, { 
      state: { 
        doctor: doctor,
        consultationType: type,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        fee: doctor.consultationFee,
        wellnessCenter: doctor.wellnessCenter
      } 
    });
  };

  // Navigate to doctor profile
  const handleViewProfile = (doctor) => {
    navigate(`/ayurveda/doctor/${doctor._id}`, { state: { doctor } });
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1rem' }}>
      
      {/* Header with Back Button */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem', 
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => navigate('/ayurveda')} 
          style={{
            padding: '0.5rem 1rem', 
            backgroundColor: '#f1f5f9', 
            border: 'none',
            borderRadius: '0.5rem', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          ← Back to Hub
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
          👨‍⚕️ Find Ayurvedic Doctors ({filteredDoctors.length})
        </h1>
      </div>

      {/* Search Bar */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '1rem'
      }}>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="🔍 Search by doctor name, city, specialization, wellness center..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              fontSize: '1rem',
              color: '#1e293b'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '0.75rem',
          alignItems: 'end'
        }}>
          {/* City Filter */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '0.2rem' }}>
              📍 City
            </label>
            <select
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
              style={selectStyle}
            >
              <option value="">All Cities</option>
              {allCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Specialization Filter */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '0.2rem' }}>
              🏥 Specialization
            </label>
            <select
              value={filters.specialization}
              onChange={(e) => setFilters({...filters, specialization: e.target.value})}
              style={selectStyle}
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '0.2rem' }}>
              ⭐ Min Rating
            </label>
            <select
              value={filters.minRating}
              onChange={(e) => setFilters({...filters, minRating: e.target.value})}
              style={selectStyle}
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ ⭐</option>
              <option value="4.0">4.0+ ⭐</option>
              <option value="3.5">3.5+ ⭐</option>
            </select>
          </div>

          {/* Fee Filter */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '0.2rem' }}>
              💰 Max Fee
            </label>
            <select
              value={filters.maxFee}
              onChange={(e) => setFilters({...filters, maxFee: e.target.value})}
              style={selectStyle}
            >
              <option value="">Any Fee</option>
              <option value="300">Up to ₹300</option>
              <option value="500">Up to ₹500</option>
              <option value="700">Up to ₹700</option>
              <option value="1000">Up to ₹1000</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '0.2rem' }}>
              📊 Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              style={selectStyle}
            >
              <option value="rating">Top Rated</option>
              <option value="distance">Nearest First</option>
              <option value="fee-low">Fee: Low to High</option>
              <option value="fee-high">Fee: High to Low</option>
              <option value="experience">Most Experienced</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div>
            <button
              onClick={clearAllFilters}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                height: '38px'
              }}
            >
              🔄 Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.city || filters.specialization || filters.minRating || filters.maxFee || searchTerm) && (
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          flexWrap: 'wrap', 
          marginBottom: '1rem',
          alignItems: 'center'
        }}>
          <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>Active Filters:</span>
          {filters.city && (
            <span style={activeFilterTag} onClick={() => setFilters({...filters, city: ''})}>
              📍 {filters.city} ✕
            </span>
          )}
          {filters.specialization && (
            <span style={activeFilterTag} onClick={() => setFilters({...filters, specialization: ''})}>
              🏥 {filters.specialization} ✕
            </span>
          )}
          {filters.minRating && (
            <span style={activeFilterTag} onClick={() => setFilters({...filters, minRating: ''})}>
              ⭐ {filters.minRating}+ ✕
            </span>
          )}
          {filters.maxFee && (
            <span style={activeFilterTag} onClick={() => setFilters({...filters, maxFee: ''})}>
              💰 ≤₹{filters.maxFee} ✕
            </span>
          )}
          {searchTerm && (
            <span style={activeFilterTag} onClick={() => setSearchTerm('')}>
              🔍 "{searchTerm}" ✕
            </span>
          )}
        </div>
      )}

      {/* Results Count */}
      <p style={{ color: '#64748b', marginBottom: '1rem', fontWeight: 'bold' }}>
        Showing <span style={{ color: '#4CAF50', fontSize: '1.1rem' }}>{filteredDoctors.length}</span> doctors
        {filters.city && ` in ${filters.city}`}
        {filters.specialization && ` • ${filters.specialization}`}
      </p>

      {/* Doctor List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
          <p style={{ color: '#64748b' }}>Loading doctors...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '0.5rem' }}>
            No doctors found
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Try adjusting your filters or search criteria
          </p>
          <button
            onClick={clearAllFilters}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredDoctors.map((doctor, index) => (
            <div
              key={doctor._id}
              onClick={() => handleViewProfile(doctor)}
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                border: index === 0 && filters.sortBy === 'rating' ? '2px solid #4CAF50' : '1px solid #e2e8f0',
                transition: 'box-shadow 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
            >
              {/* Top Rated Badge */}
              {index === 0 && filters.sortBy === 'rating' && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '-8px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  zIndex: 1
                }}>
                  🏆 Top Rated
                </span>
              )}

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Doctor Avatar */}
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  backgroundColor: index % 2 === 0 ? '#e8f5e9' : '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  flexShrink: 0
                }}>
                  {index % 2 === 0 ? '👨‍⚕️' : '👩‍⚕️'}
                </div>

                {/* Doctor Info */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1e293b', marginBottom: '0.2rem' }}>
                        {doctor.name}
                      </h3>
                      <p style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                        {doctor.specialization}
                      </p>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                        🏥 {doctor.wellnessCenter}
                      </p>
                    </div>

                    {/* Distance & Availability */}
                    <div style={{ textAlign: 'right' }}>
                      {doctor.distance !== undefined && (
                        <div style={{
                          backgroundColor: doctor.distance <= 10 ? '#e8f5e9' : '#e3f2fd',
                          color: doctor.distance <= 10 ? '#2E7D32' : '#1565C0',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          marginBottom: '0.3rem',
                          display: 'inline-block'
                        }}>
                          📍 {doctor.distance} km
                        </div>
                      )}
                      <div style={{
                        backgroundColor: doctor.available ? '#e8f5e9' : '#fff3e0',
                        color: doctor.available ? '#2E7D32' : '#E65100',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        marginTop: '0.3rem'
                      }}>
                        {doctor.available ? '🟢 Available' : '🟡 ' + doctor.nextAvailable}
                      </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    marginTop: '0.5rem',
                    flexWrap: 'wrap',
                    color: '#64748b',
                    fontSize: '0.85rem'
                  }}>
                    <span>⭐ {doctor.rating} ({doctor.reviews} reviews)</span>
                    <span>📅 {doctor.experience} yrs exp</span>
                    <span>📍 {doctor.city}, {doctor.area}</span>
                    <span>🗣️ {doctor.languages.join(', ')}</span>
                  </div>

                  {/* Consultation Types */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {doctor.consultationTypes.online && (
                      <span style={{ 
                        padding: '2px 8px', 
                        backgroundColor: '#e3f2fd', 
                        borderRadius: '10px', 
                        fontSize: '0.75rem', 
                        color: '#1565C0' 
                      }}>
                        💻 Online
                      </span>
                    )}
                    {doctor.consultationTypes.clinic && (
                      <span style={{ 
                        padding: '2px 8px', 
                        backgroundColor: '#e8f5e9', 
                        borderRadius: '10px', 
                        fontSize: '0.75rem', 
                        color: '#2E7D32' 
                      }}>
                        🏥 Clinic
                      </span>
                    )}
                  </div>

                  {/* Fee & Action Buttons */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '1rem',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div>
                      <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.2rem' }}>
                        ₹{doctor.consultationFee}
                      </span>
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}> /consultation</span>
                    </div>

                    {/* Online/Clinic Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {doctor.consultationTypes.online && (
                        <button
                          onClick={(e) => handleBookNow(e, doctor, 'online')}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          💻 Online
                        </button>
                      )}
                      {doctor.consultationTypes.clinic && (
                        <button
                          onClick={(e) => handleBookNow(e, doctor, 'clinic')}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          🏥 Clinic
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const selectStyle = {
  width: '100%',
  padding: '0.5rem',
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  fontSize: '0.9rem',
  backgroundColor: 'white',
  color: '#1e293b',
  height: '38px'
};

const activeFilterTag = {
  padding: '4px 12px',
  backgroundColor: '#e8f5e9',
  color: '#2E7D32',
  borderRadius: '20px',
  fontSize: '0.8rem',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default AyurvedaDoctors;