import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import {
  FaCalendarAlt, FaClock, FaStar, FaCheckCircle, FaLock, FaArrowLeft
} from 'react-icons/fa';

const BookNaturopathyPackage = () => {
  const { centerId, packageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateCenter = location.state?.center;
  const statePackage = location.state?.package;

  const [center, setCenter] = useState(stateCenter || null);
  const [pkg, setPkg] = useState(statePackage || null);
  const [loading, setLoading] = useState(!stateCenter || !statePackage);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [form, setForm] = useState({
    patientName: '', phone: '', email: '', age: '', gender: '',
    admissionDate: '', symptoms: '', medicalHistory: '', allergies: ''
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(`/login?redirect=/homeopathy/center/${centerId}/book/${packageId}`);
      return;
    }
  }, [navigate, centerId, packageId]);

  // Fetch if missing
  useEffect(() => {
    if (center && pkg) return;
    (async () => {
      try {
        const res = await api.get(`/homeopathy/centers/${centerId}`);
        if (res.data?.success) {
          setCenter(res.data.data);
          const found = res.data.data.packages?.find(p => p._id === packageId);
          setPkg(found);
        }
      } catch (err) {
        setError('Failed to load center');
      } finally {
        setLoading(false);
      }
    })();
  }, [center, pkg, centerId, packageId]);

  // Prefill from user
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData) {
      setForm(prev => ({
        ...prev,
        patientName: userData.name || '',
        phone: userData.phone || '',
        email: userData.email || ''
      }));
    }
  }, []);

  // Pricing preview
  useEffect(() => {
    if (!pkg) return;
    const amount = pkg.discountPrice || pkg.price;
    setPricingLoading(true);
    api.post('/homeopathy/bookings/pricing-preview', {
      bookingType: 'naturopathy_center',
      amount,
      discountAmount: 0,
      providerId: centerId,
      providerModel: 'NaturopathyCenter',
      city: center?.address?.city,
      state: center?.address?.state
    })
      .then(res => { if (res.data?.success) setPricing(res.data.data); })
      .catch(err => console.error('Pricing preview error:', err))
      .finally(() => setPricingLoading(false));
    }, [pkg, center, centerId]);

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponApplied(null);

    if (!discountCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    if (!pkg) return;

    const amount = pkg.discountPrice || pkg.price;
    setCouponLoading(true);

    try {
      // 1. Validate + compute discount
      const validateRes = await api.post('/discounts/validate', {
        code: discountCode.trim().toUpperCase(),
        bookingType: 'naturopathy_center',
        amount
      });

      if (!validateRes.data?.success) {
        setCouponError(validateRes.data?.message || 'Invalid coupon code');
        return;
      }

      const discountAmount = validateRes.data.discountAmount || 0;
      setCouponApplied({ code: discountCode.trim().toUpperCase(), discountAmount });
      setCouponError('');

      // 2. Refresh pricing with discount applied
      const previewRes = await api.post('/homeopathy/bookings/pricing-preview', {
        bookingType: 'naturopathy_center',
        amount,
        discountAmount,
        providerId: centerId,
        providerModel: 'NaturopathyCenter',
        city: center?.address?.city,
        state: center?.address?.state
      });

      if (previewRes.data?.success) {
        setPricing(previewRes.data.data);
      }
    } catch (err) {
      setCouponApplied(null);
      setCouponError(err.response?.data?.message || 'Unable to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.admissionDate) { setError('Please select admission date'); return; }
    if (!form.patientName || !form.phone) { setError('Name and phone are required'); return; }
    if (!acceptedTerms) { setError('Please accept terms'); return; }

    setBookingLoading(true);
    try {
      const res = await api.post('/homeopathy/bookings/create', {
        type: 'naturopathy_center',
        centerId,
        packageId,
        bookingDate: form.admissionDate,
        slotTime: '09:00 AM',
        symptoms: form.symptoms,
        medicalHistory: form.medicalHistory,
        patientName: form.patientName,
        patientPhone: form.phone,
        patientEmail: form.email,
        patientAge: form.age,
        patientGender: form.gender,
        discountCode: couponApplied?.code || undefined
      });

      if (res.data?.success) {
        navigate('/homeopathy/payment', {
          state: {
            bookingData: res.data.data,
            doctor: { name: center?.name },
            consultationType: 'center'
          }
        });
      } else {
        setError(res.data?.message || 'Booking failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" /></div>;
  }

  if (error && (!center || !pkg)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Package not found'}</p>
          <button onClick={() => navigate('/homeopathy/centers')} className="px-6 py-2 bg-green-600 text-white rounded-lg">Browse Centers</button>
        </div>
      </div>
    );
  }

  const price = pkg.discountPrice || pkg.price;
  const finalTotal = pricing?.total || price;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4">
          <FaArrowLeft /> Back
        </button>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left — Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Package summary */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-500 p-5 text-white">
                <h1 className="text-xl font-bold">{pkg.name}</h1>
                <p className="text-green-100 text-sm mt-1">{center.name}</p>
                <div className="flex items-center gap-3 mt-3 text-sm flex-wrap">
                  <span className="flex items-center gap-1"><FaStar className="text-yellow-400" /> {center.rating || 'New'}</span>
                  <span className="flex items-center gap-1"><FaCalendarAlt /> {pkg.duration} days</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-5 space-y-4">
              <h2 className="font-bold text-gray-800">Patient Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                  <input required value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone *</label>
                  <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full p-2.5 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Age</label>
                    <input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })}
                      className="w-full p-2.5 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
                    <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                      className="w-full p-2.5 border rounded-lg text-sm">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h2 className="font-bold text-gray-800 mb-3">Booking Details</h2>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Admission Date *</label>
                  <input required type="date" min={today} value={form.admissionDate} onChange={e => setForm({ ...form, admissionDate: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-sm" />
                </div>
              </div>

              <div className="border-t pt-4">
                <h2 className="font-bold text-gray-800 mb-3">Medical Information</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Symptoms / Health Concern</label>
                    <textarea value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })}
                      rows={3} className="w-full p-2.5 border rounded-lg text-sm" placeholder="Describe your health concern..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Known Allergies</label>
                    <input value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })}
                      className="w-full p-2.5 border rounded-lg text-sm" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                               <label className="block text-xs font-semibold text-gray-600 mb-1">Coupon Code (optional)</label>
                <div className="flex gap-2">
                  <input
                    value={discountCode}
                    onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setCouponError(''); }}
                    placeholder="Enter code"
                    className="flex-1 p-2.5 border rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !discountCode.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold disabled:bg-gray-300"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
                {couponApplied && (
                  <p className="text-xs text-green-600 mt-1 font-semibold">
                    ✅ {couponApplied.code} applied — Save ₹{couponApplied.discountAmount}
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <label className="flex items-start gap-2 text-xs text-gray-600">
                  <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-0.5" />
                  <span>I agree to the <span className="text-green-600 font-semibold">Terms & Conditions</span> and <span className="text-green-600 font-semibold">Privacy Policy</span>. Booking is confirmed by the center.</span>
                </label>
              </div>
            </form>
          </div>

          {/* Right — Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-4">
              <h3 className="font-bold text-gray-800 mb-4">Price Summary</h3>
              {pricingLoading ? (
                <p className="text-sm text-gray-500">Calculating...</p>
              ) : pricing ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Package</span><span>₹{pricing.baseAmount}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Platform Fee</span><span>₹{pricing.platformFee}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">GST</span><span>₹{pricing.gstAmount}</span></div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">₹{pricing.total}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Pricing not configured. Contact support.</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={bookingLoading || !pricing || !acceptedTerms}
                className="w-full mt-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {bookingLoading ? 'Creating booking...' : `Proceed to Payment — ₹${finalTotal}`}
              </button>

              <div className="mt-4 space-y-1.5 text-xs text-gray-500">
                <p className="flex items-center gap-2"><FaCheckCircle className="text-green-600" /> Secure payment</p>
                <p className="flex items-center gap-2"><FaCheckCircle className="text-green-600" /> Verified center</p>
                <p className="flex items-center gap-2"><FaLock className="text-green-600" /> Free cancellation per policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookNaturopathyPackage;