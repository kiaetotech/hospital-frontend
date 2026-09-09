import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createBooking } from '../../services/ayurvedaApi';
import { 
  FaBuilding, FaStar, FaCalendarAlt, FaUsers, FaRupeeSign,
  FaCheckCircle, FaArrowLeft, FaShieldAlt, FaClock, FaBed,
  FaTag, FaInfoCircle, FaCheck
} from 'react-icons/fa';

const BookPanchakarmaPackage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const center = location.state?.center;
  const selectedPackage = location.state?.package;

  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    patientAge: '',
    patientGender: '',
    admissionDate: '',
    symptoms: '',
    medicalHistory: '',
    prakritiType: '',
    accommodation: 'included',
    dietPreference: 'vegetarian',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    if (!center || !selectedPackage) {
      navigate('/ayurveda/panchakarma-centers');
      return;
    }
    
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData) {
      setFormData(prev => ({
        ...prev,
        patientName: userData.name || '',
        patientPhone: userData.phone || '',
        patientEmail: userData.email || ''
      }));
    }
  }, [center, selectedPackage, navigate]);

  const packageDetails = useMemo(() => {
    if (!selectedPackage) return null;
    const baseAmount = selectedPackage.discountPrice || selectedPackage.price;
    const platformFee = 100;
    const discountAmount = couponApplied?.discountAmount || 0;
    const gstBase = baseAmount + platformFee - discountAmount;
    const gst = Math.round(gstBase * 0.18);
    const total = gstBase + gst;
    return { baseAmount, platformFee, discountAmount, gst, total };
  }, [selectedPackage, couponApplied]);

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponApplied(null);
    
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    try {
      const api = require('../../services/api').default;
      const response = await api.post('/discounts/validate', { 
        code: couponCode, 
        bookingType: 'ayurveda_panchakarma', 
        amount: packageDetails?.baseAmount || 0 
      });
      
      if (response.data.success) {
        setCouponApplied({ 
          code: couponCode.toUpperCase(), 
          discountAmount: response.data.data.discountAmount 
        });
      } else {
        setCouponError(response.data.message || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponError('Invalid coupon code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.admissionDate) {
      setError('Please select admission date');
      return;
    }
    if (!formData.patientName || !formData.patientPhone) {
      setError('Patient name and phone are required');
      return;
    }
    if (!acceptedTerms) {
      setError('Please accept terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const response = await createBooking({
        type: 'panchakarma_package',
        centerId: center._id,
        packageId: selectedPackage._id || selectedPackage.id,
        bookingDate: formData.admissionDate,
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        patientEmail: formData.patientEmail,
        patientAge: formData.patientAge,
        patientGender: formData.patientGender,
        symptoms: formData.symptoms,
        medicalHistory: formData.medicalHistory,
        prakritiType: formData.prakritiType,
        discountCode: couponApplied?.code || undefined
      });

      if (response.data.success) {
        navigate('/ayurveda/payment', {
          state: {
            bookingData: response.data.data,
            center: center,
            package: selectedPackage
          }
        });
      } else {
        setError(response.data.message || 'Failed to create booking');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!center || !selectedPackage) {
    return null;
  }

  const isPackageFull = selectedPackage.currentBookings >= selectedPackage.maxCapacity;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/ayurveda')} className="hover:text-green-600">Ayurveda</button>
          <span>›</span>
          <button onClick={() => navigate('/ayurveda/panchakarma-centers')} className="hover:text-green-600">Centers</button>
          <span>›</span>
          <button onClick={() => navigate(`/ayurveda/center/${center._id}`, { state: { center } })} className="hover:text-green-600">
            {center.name}
          </button>
          <span>›</span>
          <span className="font-medium">Book Package</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Summary Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-green-700 to-green-600 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold">{selectedPackage.name}</h1>
                    <p className="text-green-100 mt-1">{center.name}</p>
                  </div>
                  {selectedPackage.discountPrice && selectedPackage.discountPrice < selectedPackage.price && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {Math.round((1 - selectedPackage.discountPrice / selectedPackage.price) * 100)}% OFF
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" /> {center.rating || 'New'}
                    <span className="text-green-100">({center.totalReviews || 0})</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FaClock /> {selectedPackage.duration} Days
                  </span>
                  <span className="flex items-center gap-1">
                    <FaBuilding /> {center.address?.city}
                  </span>
                  {isPackageFull ? (
                    <span className="bg-red-500 px-2 py-1 rounded-full text-xs font-bold">SOLD OUT</span>
                  ) : (
                    <span className="bg-green-500 px-2 py-1 rounded-full text-xs font-bold">
                      {selectedPackage.maxCapacity - (selectedPackage.currentBookings || 0)} slots left
                    </span>
                  )}
                </div>
              </div>
              
              {/* Therapies */}
              {selectedPackage.therapies && selectedPackage.therapies.length > 0 && (
                <div className="px-6 py-4 border-b">
                  <p className="text-sm font-medium text-gray-700 mb-2">Therapies Included:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPackage.therapies.map((therapy, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                        <FaCheck /> {therapy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Inclusions */}
              {selectedPackage.inclusions && selectedPackage.inclusions.length > 0 && (
                <div className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Inclusions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPackage.inclusions.map((inclusion, i) => (
                      <span key={i} className="flex items-center gap-1 text-sm text-gray-600">
                        <FaCheckCircle className="text-green-600" /> {inclusion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Patient Details</h2>
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

              <div className="border-t pt-5">
                <h2 className="text-lg font-semibold mb-4">Booking Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Admission Date *</label>
                    <input
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      required
                      min={new Date().toISOString().split('T')[0]}
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
                      <option value="Vata-Pitta">Vata-Pitta</option>
                      <option value="Pitta-Kapha">Pitta-Kapha</option>
                      <option value="Vata-Kapha">Vata-Kapha</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-5">
                <h2 className="text-lg font-semibold mb-4">Medical Information</h2>
                <div>
                  <label className="block text-sm font-medium mb-1">Symptoms / Health Concern *</label>
                  <textarea
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    required
                    rows="3"
                    placeholder="Describe your health concern..."
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Coupon Code */}
              <div className="border-t pt-5">
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  <FaTag className="text-green-600" /> Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code (optional)"
                    className="flex-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-sm mt-1">{couponError}</p>}
                {couponApplied && (
                  <p className="text-green-600 text-sm mt-1">
                    ✅ {couponApplied.code} applied — Save ₹{couponApplied.discountAmount}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 border-t pt-5">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-gray-600">
                  I agree to the <span className="text-green-600">Terms & Conditions</span> and 
                  <span className="text-green-600"> Privacy Policy</span>. I understand this is a 
                  booking request and final confirmation will be provided by the center.
                </span>
              </div>
            </form>
          </div>

          {/* RIGHT: Price Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Price Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Package Price</span>
                  <span>₹{packageDetails?.baseAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee</span>
                  <span>₹{packageDetails?.platformFee}</span>
                </div>
                {packageDetails?.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({couponApplied?.code})</span>
                    <span>-₹{packageDetails?.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span>₹{packageDetails?.gst}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-2xl text-green-600">₹{packageDetails?.total?.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || isPackageFull}
                className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isPackageFull ? 'Package Full' : loading ? 'Processing...' : 'Proceed to Payment →'}
              </button>

              {/* Trust Badges */}
              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <p className="flex items-center gap-1">
                  <FaShieldAlt className="text-green-600" /> Secure Booking
                </p>
                <p className="flex items-center gap-1">
                  <FaClock className="text-green-600" /> Free Cancellation up to 72 hours
                </p>
                <p className="flex items-center gap-1">
                  <FaInfoCircle className="text-green-600" /> Full refund: 90% if cancelled >72 hours before admission
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPanchakarmaPackage;