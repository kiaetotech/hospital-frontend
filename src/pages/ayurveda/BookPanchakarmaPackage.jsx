import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createBooking } from '../../services/ayurvedaApi';
import { 
  FaBuilding, FaStar, FaCalendarAlt, FaUsers, FaRupeeSign,
  FaCheckCircle, FaArrowLeft, FaShieldAlt, FaClock, FaBed
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
    dietPreference: 'vegetarian'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
    const price = selectedPackage.discountPrice || selectedPackage.price;
    const gst = Math.round(price * 0.18);
    const total = price + gst;
    return { price, gst, total };
  }, [selectedPackage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.admissionDate) {
      setError('Please select admission date');
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
        prakritiType: formData.prakritiType
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6"
        >
          <FaArrowLeft /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Summary */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-green-700 to-green-600 p-6 text-white">
                <h1 className="text-2xl font-bold">{selectedPackage.name}</h1>
                <p className="text-green-100">{center.name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" /> {center.rating || 'New'}
                  </span>
                  <span>{selectedPackage.duration} Days</span>
                  <span>{center.address?.city}</span>
                </div>
              </div>
              <div className="p-4 bg-green-50">
                <div className="flex flex-wrap gap-2">
                  {selectedPackage.therapies?.map((therapy, i) => (
                    <span key={i} className="px-2 py-1 bg-white rounded-full text-xs">
                      {therapy}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-5">
              <h2 className="text-lg font-semibold">Patient Details</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    required
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    required
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.patientEmail}
                    onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Age</label>
                    <input
                      type="number"
                      value={formData.patientAge}
                      onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                      className="w-full p-2.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select
                      value={formData.patientGender}
                      onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                      className="w-full p-2.5 border rounded-lg"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-5">
                <h2 className="text-lg font-semibold mb-3">Booking Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Admission Date *</label>
                    <input
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-2.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prakriti Type</label>
                    <select
                      value={formData.prakritiType}
                      onChange={(e) => setFormData({ ...formData, prakritiType: e.target.value })}
                      className="w-full p-2.5 border rounded-lg"
                    >
                      <option value="">Not sure</option>
                      <option value="Vata">Vata</option>
                      <option value="Pitta">Pitta</option>
                      <option value="Kapha">Kapha</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-5">
                <h2 className="text-lg font-semibold mb-3">Medical Information</h2>
                <div>
                  <label className="block text-sm font-medium mb-1">Symptoms / Concern *</label>
                  <textarea
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    required
                    rows="3"
                    placeholder="Describe your health concern..."
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-gray-600">
                  I agree to the terms and conditions and understand this is a booking request.
                  Final confirmation will be provided by the center.
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
                  <span>₹{packageDetails?.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span>₹{packageDetails?.gst}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-2xl text-green-600">₹{packageDetails?.total}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : 'Proceed to Payment →'}
              </button>

              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <p className="flex items-center gap-1">
                  <FaShieldAlt className="text-green-600" /> Secure Booking
                </p>
                <p className="flex items-center gap-1">
                  <FaClock className="text-green-600" /> Free Cancellation up to 72 hours
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