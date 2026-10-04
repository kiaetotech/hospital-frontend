import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../../services/api';
import {
  FaVideo, FaBuilding, FaStar, FaClock, FaShieldAlt, FaTag,
  FaUser, FaCalendarAlt, FaChevronRight, FaCheckCircle,
  FaTimesCircle, FaInfoCircle, FaUserPlus, FaHeartbeat
} from 'react-icons/fa';

const BookHomeopathyConsult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { doctorId: paramDoctorId } = useParams();
  const doctorId = location.state?.doctorId || location.state?.doctor?._id || paramDoctorId;

  const [doctor, setDoctor] = useState(location.state?.doctor || null);
  const [loading, setLoading] = useState(!doctor);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [consultationType, setConsultationType] = useState(location.state?.consultationType || 'online');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [patientProfiles, setPatientProfiles] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('self');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '', age: '', gender: 'male', phone: '', relation: 'self'
  });

  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    patientAge: '',
    patientGender: '',
    symptoms: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    duration: '',
    previousTreatment: '',
    diet: '',
    sleep: '',
    stress: ''
  });

  const [fees, setFees] = useState({
    consultationFee: 0,
    platformFee: 0,
    discountAmount: 0,
    discountedFee: 0,
    gst: 0,
    total: 0
  });

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

  // Fetch doctor
  useEffect(() => {
    const fetchDoctor = async () => {
      if (doctorId && !doctor) {
        try {
          const res = await api.get(`/homeopathy/doctors/${doctorId}`);
          if (res.data?.success) setDoctor(res.data.data);
        } catch (err) {
          setError('Failed to load doctor details');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDoctor();
  }, [doctorId, doctor]);

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(`/login?redirect=/homeopathy/book/${doctorId}`);
    }
  }, [doctorId, navigate]);

  // Patient profiles + prefill from user
  useEffect(() => {
    const profiles = JSON.parse(localStorage.getItem('patientProfiles') || '[]');
    setPatientProfiles(profiles);

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

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate || !doctorId) {
      setAvailableSlots([]);
      return;
    }
    setSlotsLoading(true);
    api.get(`/homeopathy/doctor/${doctorId}/slots?date=${selectedDate}`)
      .then(res => {
        const slots = res.data?.data?.slots || [];
        setAvailableSlots(
          slots.filter(s => s.available !== false).map(s => ({ time: s.startTime }))
        );
      })
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, doctorId]);

  // Pricing preview
  useEffect(() => {
    const consultationFee = doctor?.consultationFee || 0;
    if (!consultationFee) return;

    const discountAmount = couponApplied?.discountAmount || 0;

    api.post('/homeopathy/bookings/pricing-preview', {
      bookingType: 'homeopathy_consult',
      amount: consultationFee,
      discountAmount,
      providerId: doctorId,
      providerModel: 'HomeopathyDoctor',
      city: doctor?.address?.city,
      state: doctor?.address?.state
    })
      .then(res => {
        if (res.data?.success) {
          const p = res.data.data;
          setFees({
            consultationFee: p.baseAmount,
            platformFee: p.platformFee,
            discountAmount: p.discountAmount,
            discountedFee: p.discountedFee,
            gst: p.gstAmount,
            total: p.total
          });
        }
      })
      .catch(err => {
        console.error('Pricing preview failed:', err);
      });
  }, [doctor, couponApplied, doctorId]);

    const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponApplied(null);

    const consultationFee = doctor?.consultationFee || 0;
    if (!consultationFee) {
      setCouponError('Doctor consultation fee missing');
      return;
    }

    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

        try {
      const token = localStorage.getItem('token');
      const code = couponCode.trim().toUpperCase();

      // 1. Validate + compute the discount on the server
      const validateRes = await api.post('/discounts/validate', {
        code,
        bookingType: 'homeopathy_consult',
        amount: consultationFee
      });

      if (!validateRes.data?.success) {
        setCouponApplied(null);
        setCouponError(validateRes.data?.message || 'Invalid coupon code');
        return;
      }

      const discountAmount = validateRes.data.discountAmount || 0;
      setCouponApplied({ code, discountAmount });
      setCouponError('');

      // 2. Refresh the fee summary with the discount applied
      const previewRes = await api.post('/homeopathy/bookings/pricing-preview', {
        bookingType: 'homeopathy_consult',
        amount: consultationFee,
        discountAmount,
        providerId: doctor?._id || null,
        providerModel: 'HomeopathyDoctor',
        city: doctor?.address?.city || null,
        state: doctor?.address?.state || null
      });

      if (previewRes.data?.success) {
        const p = previewRes.data.data;
        setFees({
          consultationFee: p.baseAmount || consultationFee,
          platformFee: p.platformFee || 0,
          discountAmount: p.discountAmount || discountAmount,
          discountedFee: p.discountedFee || (consultationFee - discountAmount),
          gst: p.gstAmount || 0,
          total: p.total || 0
        });
      }
    } catch (err) {
      setCouponApplied(null);
      setCouponError(err.response?.data?.message || 'Unable to validate coupon');
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
      const res = await api.post('/homeopathy/bookings/create', {
        type: 'homeopathy_consult',
        doctorId: doctor._id,
        consultationType,
        bookingDate: selectedDate,
        slotTime: selectedSlot.time,
        symptoms: formData.symptoms,
        medicalHistory: formData.medicalHistory,
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        patientEmail: formData.patientEmail,
        patientAge: formData.patientAge,
        patientGender: formData.patientGender,
        discountCode: couponApplied?.code
      });

      if (res.data?.success) {
        navigate('/homeopathy/payment', {
          state: {
            bookingData: res.data.data,
            doctor,
            consultationType
          }
        });
      } else {
        setError(res.data?.message || 'Failed to create booking');
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
          <button
            onClick={() => navigate('/homeopathy/doctors')}
            className="mt-4 text-green-600"
          >
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
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 flex-wrap">
          <button onClick={() => navigate('/homeopathy')} className="hover:text-green-600">Homeopathy</button>
          <FaChevronRight className="text-xs" />
          <button onClick={() => navigate('/homeopathy/doctors')} className="hover:text-green-600">Doctors</button>
          <FaChevronRight className="text-xs" />
          <span className="font-medium">Book Consultation</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
            <FaTimesCircle /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Form */}
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
                    <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                      <span className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" /> {doctor.rating || 'New'}
                      </span>
                      <span>{doctor.experience || 0} years exp.</span>
                      {doctor.verifiedKyc && (
                        <span className="flex items-center gap-1"><FaShieldAlt /> Verified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 flex items-center gap-4 text-sm flex-wrap">
                {doctor.consultationTypes?.online && (
                  <span className="flex items-center gap-1"><FaVideo className="text-green-600" /> Online</span>
                )}
                {doctor.consultationTypes?.clinic && (
                  <span className="flex items-center gap-1"><FaBuilding className="text-green-600" /> Clinic</span>
                )}
                {doctor.address?.city && (
                  <span className="flex items-center gap-1 text-gray-600">📍 {doctor.address.city}</span>
                )}
              </div>
            </div>

            {/* Consultation Type */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Select Consultation Type</h2>
              <div className="grid grid-cols-2 gap-3">
                {doctor.consultationTypes?.online && (
                  <button
                    type="button"
                    onClick={() => setConsultationType('online')}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      consultationType === 'online'
                        ? 'border-green-600 bg-green-50 shadow-lg'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <FaVideo className={`mx-auto text-2xl mb-2 ${consultationType === 'online' ? 'text-green-600' : 'text-gray-400'}`} />
                    <p className="font-medium">Video Consult</p>
                    <p className="text-xs text-gray-500">15-30 min</p>
                  </button>
                )}
                {doctor.consultationTypes?.clinic && (
                  <button
                    type="button"
                    onClick={() => setConsultationType('clinic')}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      consultationType === 'clinic'
                        ? 'border-green-600 bg-green-50 shadow-lg'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <FaBuilding className={`mx-auto text-2xl mb-2 ${consultationType === 'clinic' ? 'text-green-600' : 'text-gray-400'}`} />
                    <p className="font-medium">Clinic Visit</p>
                    <p className="text-xs text-gray-500">In-person</p>
                  </button>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-green-600" /> Select Date
              </h2>
              <div className="grid grid-cols-7 gap-2">
                {nextDays.map(day => (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => { setSelectedDate(day.date); setSelectedSlot(null); }}
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

            {/* Time slot */}
            {selectedDate && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaClock className="text-green-600" /> Select Time Slot
                </h2>
                {slotsLoading ? (
                  <p className="text-gray-500 text-sm py-4">Loading available slots...</p>
                ) : availableSlots.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    No slots available for this date. Please pick another day.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSlots.map(slot => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-lg border-2 text-center transition-all text-sm ${
                          selectedSlot?.time === slot.time
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <p className="font-medium">{slot.time}</p>
                      </button>
                    ))}
                  </div>
                )}
                {selectedSlot && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2 text-sm">
                    <FaInfoCircle className="text-green-600" />
                    <span>Slot selected: {selectedSlot.time}</span>
                  </div>
                )}
              </div>
            )}

            {/* Patient details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaUser className="text-green-600" /> Patient Details
              </h2>

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
                    {patientProfiles.map(profile => (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => { setSelectedPatient(profile.id); handleSelectPatient(profile.id); }}
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
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    required
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
  			required
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

            {/* Medical details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaHeartbeat className="text-green-600" /> Medical Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Symptoms *</label>
                  <textarea
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    rows="3"
                    placeholder="Describe your symptoms..."
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration of Symptoms</label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full p-2.5 border rounded-lg"
                    >
                      <option value="">Select duration</option>
                      <option value="less_than_week">Less than a week</option>
                      <option value="1_4_weeks">1-4 weeks</option>
                      <option value="1_6_months">1-6 months</option>
                      <option value="6_12_months">6-12 months</option>
                      <option value="over_1_year">Over 1 year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Previous Treatment</label>
                    <select
                      value={formData.previousTreatment}
                      onChange={(e) => setFormData({ ...formData, previousTreatment: e.target.value })}
                      className="w-full p-2.5 border rounded-lg"
                    >
                      <option value="">Select</option>
                      <option value="none">None</option>
                      <option value="allopathy">Allopathy</option>
                      <option value="homeopathy">Homeopathy</option>
                      <option value="ayurveda">Ayurveda</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Diet Preference</label>
                    <select
                      value={formData.diet}
                      onChange={(e) => setFormData({ ...formData, diet: e.target.value })}
                      className="w-full p-2.5 border rounded-lg"
                    >
                      <option value="">Select</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="non_vegetarian">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sleep Pattern</label>
                    <select
                      value={formData.sleep}
                      onChange={(e) => setFormData({ ...formData, sleep: e.target.value })}
                      className="w-full p-2.5 border rounded-lg"
                    >
                      <option value="">Select</option>
                      <option value="good">Good (7-8 hrs)</option>
                      <option value="fair">Fair (5-6 hrs)</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Stress Level</label>
                    <select
                      value={formData.stress}
                      onChange={(e) => setFormData({ ...formData, stress: e.target.value })}
                      className="w-full p-2.5 border rounded-lg"
                    >
                      <option value="">Select</option>
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Allergies</label>
                    <input
                      type="text"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      placeholder="Any known allergies"
                      className="w-full p-2.5 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <button
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="w-full flex items-center justify-between font-semibold"
              >
                <span className="flex items-center gap-2">
                  <FaTag className="text-green-600" /> Have a coupon code?
                </span>
                <span className="text-green-600">{showAdvancedOptions ? '−' : '+'}</span>
              </button>
              {showAdvancedOptions && (
                <div className="mt-4">
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
                  {couponError && <p className="text-yellow-600 text-sm mt-1">{couponError}</p>}
                  {couponApplied && (
                    <p className="text-green-600 text-sm mt-1">
                      ✅ {couponApplied.code} applied — Save ₹{couponApplied.discountAmount}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Fee summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Fee Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span>₹{fees.consultationFee}</span>
                </div>
                {fees.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discount</span>
                    <span>-₹{fees.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee</span>
                  <span>₹{fees.platformFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST</span>
                  <span>₹{fees.gst}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-2xl text-green-600">₹{fees.total}</span>
                </div>
              </div>

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

              <button
                type="button"
                onClick={handleSubmit}
                disabled={bookingLoading || !fees.total}
                className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {bookingLoading ? 'Creating booking...' : 'Proceed to Payment →'}
              </button>

              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <p className="flex items-center gap-1"><FaShieldAlt className="text-green-600" /> 100% Secure Payment</p>
                <p className="flex items-center gap-1"><FaCheckCircle className="text-green-600" /> Verified Doctor</p>
                <p className="flex items-center gap-1"><FaClock className="text-green-600" /> Free Rescheduling (up to 2 times)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookHomeopathyConsult;