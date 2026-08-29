import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createBooking, getAyurvedaDoctorById } from '../../services/ayurvedaApi';
import { 
  FaVideo, FaBuilding, FaHome, FaStar, FaClock, 
  FaShieldAlt, FaTag, FaUser, FaCalendarAlt, 
  FaChevronRight, FaCheckCircle, FaTimesCircle,
  FaInfoCircle, FaPhone, FaEnvelope, FaUserPlus
} from 'react-icons/fa';

const BookAyurvedaConsult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const doctorId = location.state?.doctorId || location.state?.doctor?._id;

  const [doctor, setDoctor] = useState(location.state?.doctor || null);
  const [loading, setLoading] = useState(!doctor);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Advanced State
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [consultationType, setConsultationType] = useState('online');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [cancellationProtection, setCancellationProtection] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('self');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [showReferral, setShowReferral] = useState(false);
  const [queuePosition, setQueuePosition] = useState(null);
  const [waitTime, setWaitTime] = useState(null);

  // Patient Profiles (from localStorage)
  const [patientProfiles, setPatientProfiles] = useState([]);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '', age: '', gender: 'male', phone: '', relation: 'self'
  });

  // Form Data
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    patientAge: '',
    patientGender: '',
    symptoms: '',
    medicalHistory: '',
    prakritiType: '',
    allergies: '',
    currentMedications: ''
  });

  // Generated Slots
  const timeSlots = useMemo(() => [
    { time: '09:00 AM', type: 'morning', available: true, peak: false },
    { time: '09:30 AM', type: 'morning', available: true, peak: false },
    { time: '10:00 AM', type: 'morning', available: true, peak: false },
    { time: '10:30 AM', type: 'morning', available: true, peak: false },
    { time: '11:00 AM', type: 'morning', available: true, peak: false },
    { time: '11:30 AM', type: 'morning', available: true, peak: false },
    { time: '12:00 PM', type: 'afternoon', available: true, peak: false },
    { time: '02:00 PM', type: 'afternoon', available: true, peak: false },
    { time: '02:30 PM', type: 'afternoon', available: true, peak: false },
    { time: '03:00 PM', type: 'afternoon', available: true, peak: false },
    { time: '04:00 PM', type: 'evening', available: true, peak: true },
    { time: '05:00 PM', type: 'evening', available: true, peak: true },
    { time: '06:00 PM', type: 'evening', available: true, peak: true },
    { time: '07:00 PM', type: 'evening', available: true, peak: true },
  ], []);

  // Next 7 days
  const nextDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    return days;
  }, []);

  // Fetch doctor details if not in state
  useEffect(() => {
    const fetchDoctor = async () => {
      if (doctorId && !doctor) {
        try {
          const response = await getAyurvedaDoctorById(doctorId);
          if (response.data.success) {
            setDoctor(response.data.data);
          }
        } catch (err) {
          setError('Failed to load doctor details');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDoctor();
  }, [doctorId, doctor]);

  // Load patient profiles
  useEffect(() => {
    const profiles = JSON.parse(localStorage.getItem('patientProfiles') || '[]');
    setPatientProfiles(profiles);
    
    // Pre-fill self data
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData) {
      setFormData(prev => ({
        ...prev,
        patientName: userData.name || '',
        patientPhone: userData.phone || '',
        patientEmail: userData.email || ''
      }));
    }
  }, []);

  // Calculate fees
  const fees = useMemo(() => {
    const consultationFee = doctor?.consultationFee || 0;
    const platformFee = consultationType === 'home' ? 50 : 30;
    const peakCharge = selectedSlot?.peak ? 50 : 0;
    const cancellationProtectionFee = cancellationProtection ? 29 : 0;
    const discountAmount = couponApplied?.discountAmount || 0;
    
    const subtotal = consultationFee + platformFee + peakCharge + cancellationProtectionFee;
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst - discountAmount;
    
    return { consultationFee, platformFee, peakCharge, cancellationProtectionFee, discountAmount, subtotal, gst, total };
  }, [doctor, consultationType, selectedSlot, cancellationProtection, couponApplied]);

  // Estimate wait time
  useEffect(() => {
    if (selectedDate && selectedSlot) {
      const hour = parseInt(selectedSlot.time);
      const isPeak = selectedSlot.peak;
      const estimatedWait = isPeak ? 20 + Math.floor(Math.random() * 15) : 5 + Math.floor(Math.random() * 10);
      const queuePos = isPeak ? 4 + Math.floor(Math.random() * 5) : 1 + Math.floor(Math.random() * 3);
      setWaitTime(estimatedWait);
      setQueuePosition(queuePos);
    }
  }, [selectedDate, selectedSlot]);

  const handleApplyCoupon = () => {
    setCouponError('');
    // Mock coupon validation - in production, call API
    const validCoupons = {
      'AYUR10': { discountPercentage: 10, maxDiscount: 200 },
      'WELLNESS20': { discountPercentage: 20, maxDiscount: 500 },
      'FIRST50': { discountPercentage: 50, maxDiscount: 300 }
    };
    
    const coupon = validCoupons[couponCode.toUpperCase()];
    if (coupon) {
      const discountAmount = Math.min(
        Math.round(fees.subtotal * coupon.discountPercentage / 100),
        coupon.maxDiscount
      );
      setCouponApplied({ code: couponCode.toUpperCase(), discountAmount });
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const handleAddPatient = () => {
    if (newPatient.name && newPatient.phone) {
      const updatedProfiles = [...patientProfiles, { ...newPatient, id: Date.now() }];
      setPatientProfiles(updatedProfiles);
      localStorage.setItem('patientProfiles', JSON.stringify(updatedProfiles));
      setShowAddPatient(false);
      setNewPatient({ name: '', age: '', gender: 'male', phone: '', relation: 'self' });
    }
  };

  const handleSelectPatient = (profileId) => {
    const profile = patientProfiles.find(p => p.id === profileId);
    if (profile) {
      setFormData(prev => ({
        ...prev,
        patientName: profile.name,
        patientPhone: profile.phone,
        patientAge: profile.age,
        patientGender: profile.gender
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }
    if (!formData.patientName || !formData.patientPhone) {
      setError('Patient name and phone are required');
      return;
    }
    if (!acceptedTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setBookingLoading(true);

    try {
      const response = await createBooking({
        type: 'doctor_consultation',
        doctorId: doctor._id,
        consultationType,
        bookingDate: selectedDate,
        slotTime: selectedSlot.time,
        symptoms: formData.symptoms,
        medicalHistory: formData.medicalHistory,
        prakritiType: formData.prakritiType,
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        patientEmail: formData.patientEmail,
        patientAge: formData.patientAge,
        patientGender: formData.patientGender,
        discountCode: couponApplied?.code,
        cancellationProtection,
        referralCode: referralCode || undefined
      });

      if (response.data.success) {
        navigate('/ayurveda/payment', {
          state: {
            bookingData: response.data.data,
            doctor: doctor
          }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Doctor not found</p>
          <button onClick={() => navigate('/ayurveda/doctors')} className="mt-4 text-green-600">
            Browse Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/ayurveda')} className="hover:text-green-600">Ayurveda</button>
          <FaChevronRight className="text-xs" />
          <button onClick={() => navigate('/ayurveda/doctors')} className="hover:text-green-600">Doctors</button>
          <FaChevronRight className="text-xs" />
          <span className="font-medium">Book Consultation</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
            <FaTimesCircle />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Doctor Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                    {doctor.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{doctor.name}</h1>
                    <p className="text-green-100">{doctor.specialization}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" /> {doctor.rating || 'New'}
                      </span>
                      <span>{doctor.experience} years exp.</span>
                      <span className="flex items-center gap-1">
                        <FaShieldAlt /> Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <FaVideo className="text-green-600" /> {doctor.consultationTypes?.online ? 'Online' : 'No Online'}
                </span>
                <span className="flex items-center gap-1">
                  <FaBuilding className="text-green-600" /> {doctor.consultationTypes?.clinic ? 'Clinic' : 'No Clinic'}
                </span>
                <span className="flex items-center gap-1">
                  <FaHome className="text-green-600" /> {doctor.consultationTypes?.homeVisit ? 'Home Visit' : 'No Home'}
                </span>
              </div>
            </div>

            {/* Consultation Type */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Select Consultation Type</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'online', icon: FaVideo, label: 'Video Consult', desc: '15-30 min' },
                  { type: 'clinic', icon: FaBuilding, label: 'Clinic Visit', desc: 'In-person' },
                  { type: 'home', icon: FaHome, label: 'Home Visit', desc: 'At your home' }
                ].map(({ type, icon: Icon, label, desc }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setConsultationType(type)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      consultationType === type
                        ? 'border-green-600 bg-green-50 shadow-lg'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <Icon className={`mx-auto text-2xl mb-2 ${consultationType === type ? 'text-green-600' : 'text-gray-400'}`} />
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-green-600" /> Select Date
              </h2>
              <div className="grid grid-cols-7 gap-2">
                {nextDays.map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDate(day.date)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      selectedDate === day.date
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    } ${day.isWeekend ? 'bg-orange-50' : ''}`}
                  >
                    <p className="text-xs text-gray-500">{day.dayName}</p>
                    <p className="text-lg font-bold">{day.dayNumber}</p>
                    <p className="text-xs text-gray-500">{day.month}</p>
                    {day.isToday && <p className="text-xs text-green-600 font-medium">Today</p>}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaClock className="text-green-600" /> Select Time Slot
                </h2>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        selectedSlot?.time === slot.time
                          ? 'border-green-600 bg-green-50'
                          : slot.available
                          ? 'border-gray-200 hover:border-green-300'
                          : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <p className="font-medium text-sm">{slot.time}</p>
                      {slot.peak && (
                        <p className="text-xs text-orange-500">Peak +₹50</p>
                      )}
                    </button>
                  ))}
                </div>
                {selectedSlot && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2 text-sm">
                    <FaInfoCircle className="text-blue-600" />
                    <span>
                      Est. wait: {waitTime} min • Queue: {queuePosition} patient(s) ahead
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Patient Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaUser className="text-green-600" /> Patient Details
              </h2>

              {/* Patient Profiles */}
              {patientProfiles.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Book for</label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedPatient('self')}
                      className={`px-3 py-2 rounded-lg border ${selectedPatient === 'self' ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}
                    >
                      Self
                    </button>
                    {patientProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => {
                          setSelectedPatient(profile.id);
                          handleSelectPatient(profile.id);
                        }}
                        className={`px-3 py-2 rounded-lg border ${selectedPatient === profile.id ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}
                      >
                        {profile.name} ({profile.relation})
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowAddPatient(true)}
                      className="px-3 py-2 rounded-lg border border-dashed border-green-400 text-green-600 flex items-center gap-1"
                    >
                      <FaUserPlus /> Add
                    </button>
                  </div>
                </div>
              )}

              {/* Add Patient Modal */}
              {showAddPatient && (
                <div className="mb-4 p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                      className="p-2 border rounded"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                      className="p-2 border rounded"
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                      className="p-2 border rounded"
                    />
                    <select
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                      className="p-2 border rounded"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <select
                      value={newPatient.relation}
                      onChange={(e) => setNewPatient({ ...newPatient, relation: e.target.value })}
                      className="p-2 border rounded"
                    >
                      <option value="self">Self</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddPatient}
                        className="flex-1 bg-green-600 text-white p-2 rounded"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddPatient(false)}
                        className="flex-1 bg-gray-300 p-2 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    required
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                    required
                    pattern="[0-9]{10}"
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.patientEmail}
                    onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Age</label>
                    <input
                      type="number"
                      value={formData.patientAge}
                      onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select
                      value={formData.patientGender}
                      onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Medical Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Symptoms *</label>
                  <textarea
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    required
                    rows="3"
                    placeholder="Describe your symptoms..."
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prakriti Type</label>
                  <select
                    value={formData.prakritiType}
                    onChange={(e) => setFormData({ ...formData, prakritiType: e.target.value })}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Not sure</option>
                    <option value="Vata">Vata</option>
                    <option value="Pitta">Pitta</option>
                    <option value="Kapha">Kapha</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <button
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="w-full flex items-center justify-between font-semibold"
              >
                <span>Advanced Options</span>
                <span className="text-green-600">{showAdvancedOptions ? '−' : '+'}</span>
              </button>
              {showAdvancedOptions && (
                <div className="mt-4 space-y-4">
                  {/* Coupon Code */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                      <FaTag className="text-green-600" /> Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 p-2.5 border rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-sm mt-1">{couponError}</p>}
                    {couponApplied && (
                      <p className="text-green-600 text-sm mt-1">
                        ✅ {couponApplied.code} applied - Save ₹{couponApplied.discountAmount}
                      </p>
                    )}
                  </div>

                  {/* Cancellation Protection */}
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      checked={cancellationProtection}
                      onChange={(e) => setCancellationProtection(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <p className="font-medium">Cancellation Protection</p>
                      <p className="text-sm text-gray-500">Get full refund anytime for ₹29</p>
                    </div>
                  </div>

                  {/* Referral */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowReferral(!showReferral)}
                      className="text-green-600 text-sm"
                    >
                      Have a referral code?
                    </button>
                    {showReferral && (
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        placeholder="Enter referral code"
                        className="w-full mt-2 p-2.5 border rounded-lg"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Fee Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Fee Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span>₹{fees.consultationFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee</span>
                  <span>₹{fees.platformFee}</span>
                </div>
                {fees.peakCharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peak Hour Charge</span>
                    <span className="text-orange-500">₹{fees.peakCharge}</span>
                  </div>
                )}
                {cancellationProtection && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cancellation Protection</span>
                    <span>₹{fees.cancellationProtectionFee}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span>₹{fees.gst}</span>
                </div>
                {fees.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{fees.discountAmount}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-2xl text-green-600">₹{fees.total}</span>
                </div>
              </div>

              {/* Terms */}
              <div className="mt-4">
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-gray-600">
                    I agree to the <span className="text-green-600">Terms & Conditions</span> and 
                    <span className="text-green-600"> Privacy Policy</span>
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={bookingLoading}
                className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {bookingLoading ? 'Processing...' : 'Proceed to Payment →'}
              </button>

              {/* Trust Badges */}
              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <p className="flex items-center gap-1">
                  <FaShieldAlt className="text-green-600" /> 100% Secure Payment
                </p>
                <p className="flex items-center gap-1">
                  <FaCheckCircle className="text-green-600" /> Verified Doctor
                </p>
                <p className="flex items-center gap-1">
                  <FaClock className="text-green-600" /> Free Rescheduling (up to 2 times)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAyurvedaConsult;