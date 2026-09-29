import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  FaShoppingCart, FaArrowLeft, FaCheckCircle, FaTrash, FaLock
} from 'react-icons/fa';

const HomeopathyCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialCart = location.state?.cart || [];
  const [cart, setCart] = useState(initialCart);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [form, setForm] = useState({ patientName: '', phone: '', email: '' });
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?redirect=/homeopathy/pharmacy');
      return;
    }
  }, [navigate]);

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
    if (cart.length === 0) return;

    // Group by pharmacy — support single-pharmacy order for now
    const firstPharmacyId = cart[0]?.pharmacyId;
    const samePharmacy = cart.every(item => item.pharmacyId === firstPharmacyId);

    if (!samePharmacy) {
      setError('Please order from one pharmacy at a time. Remove items from other pharmacies.');
      return;
    }

    const amount = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

    setPricingLoading(true);
    api.post('/homeopathy/bookings/pricing-preview', {
      bookingType: 'homeopathy_medicine',
      amount,
      discountAmount: 0,
      providerId: firstPharmacyId,
      providerModel: 'Pharmacy'
    })
      .then(res => { if (res.data?.success) setPricing(res.data.data); })
      .catch(err => console.error('Pricing error:', err))
      .finally(() => setPricingLoading(false));
  }, [cart]);

  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, qty) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, parseInt(qty) || 1);
    setCart(newCart);
  };

  const handleOrder = async () => {
    setError('');

    if (cart.length === 0) { setError('Cart is empty'); return; }
    if (!deliveryAddress.trim()) { setError('Please enter delivery address'); return; }
    if (!form.patientName || !form.phone) { setError('Name and phone required'); return; }

    setLoading(true);
    try {
      const firstPharmacyId = cart[0]?.pharmacyId;

      const medicines = cart.map(item => ({
        name: item.name,
        potency: item.potency || '',
        quantity: item.quantity || 1,
        price: item.price || 0
      }));

      const res = await api.post('/homeopathy/bookings/create', {
        type: 'homeopathy_medicine',
        pharmacyId: firstPharmacyId,
        bookingDate: new Date().toISOString(),
        slotTime: 'N/A',
        deliveryAddress: deliveryAddress.trim(),
        medicines,
        patientName: form.patientName,
        patientPhone: form.phone,
        patientEmail: form.email
      });

      if (res.data?.success) {
        navigate('/homeopathy/payment', {
          state: {
            bookingData: res.data.data,
            doctor: { name: cart[0]?.pharmacyName || 'Pharmacy' },
            consultationType: 'medicine'
          }
        });
      } else {
        setError(res.data?.message || 'Order failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <div className="text-5xl mb-3">🛒</div>
          <h2 className="text-xl font-bold mb-2">Cart is empty</h2>
          <p className="text-sm text-gray-500 mb-4">Add medicines to your cart first</p>
          <button onClick={() => navigate('/homeopathy/pharmacy')} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold">
            Browse Pharmacy
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const finalTotal = pricing?.total || subtotal;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-red-600 mb-4">
          <FaArrowLeft /> Back to Pharmacy
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-5">💊 Checkout</h1>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left */}
          <div className="lg:col-span-2 space-y-4">
            {/* Cart */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaShoppingCart className="text-red-600" /> Items ({cart.length})
              </h2>
              <div className="space-y-3">
                {cart.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="text-2xl">💊</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.potency} • {item.pharmacyName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || 1}
                        onChange={e => updateQuantity(i, e.target.value)}
                        className="w-14 p-1 border rounded text-center text-sm"
                      />
                      <span className="font-bold text-sm min-w-[60px] text-right">
                        ₹{(item.price || 0) * (item.quantity || 1)}
                      </span>
                      <button onClick={() => removeItem(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Patient */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-3">Contact Details</h2>
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
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-sm" />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-3">Delivery Address</h2>
              <textarea
                required
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                rows={3}
                placeholder="Enter full address with landmark and pincode"
                className="w-full p-2.5 border rounded-lg text-sm resize-vertical"
              />
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-4">
              <h3 className="font-bold text-gray-800 mb-3">Order Summary</h3>
              {pricingLoading ? (
                <p className="text-sm text-gray-500">Calculating...</p>
              ) : pricing ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₹{pricing.baseAmount}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Platform Fee</span><span>₹{pricing.platformFee}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">GST ({pricing.gstPercentage}%)</span><span>₹{pricing.gstAmount}</span></div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">₹{pricing.total}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Pricing not configured</p>
              )}

              <button
                onClick={handleOrder}
                disabled={loading || !pricing}
                className="w-full mt-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-300"
              >
                {loading ? 'Creating order...' : `Pay ₹${finalTotal}`}
              </button>

              <p className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                <FaLock /> Secure payment • OTP verified delivery
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeopathyCheckout;