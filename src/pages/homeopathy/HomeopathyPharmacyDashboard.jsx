import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  FaBox, FaRupeeSign, FaCheckCircle, FaHistory,
  FaWallet, FaExclamationTriangle, FaTruck, FaIdCard
} from 'react-icons/fa';
import KycUploadForm from '../../components/KycUploadForm';

const HomeopathyPharmacyDashboard = () => {
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState(null);
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const token = localStorage.getItem('pharmacyToken');
  const pharmacyData = JSON.parse(localStorage.getItem('pharmacy') || '{}');
  const pharmacyId = pharmacyData.id || pharmacyData._id;

  useEffect(() => {
    if (!token || !pharmacyId) {
      navigate('/homeopathy/pharmacy/login', { replace: true });
      return;
    }
    loadAll(pharmacyId);
  }, [navigate]);

  const loadAll = async (id) => {
    setLoading(true);
    try {
      const [phRes, ordersRes, earningsRes, settlementsRes] = await Promise.allSettled([
        api.get('/homeopathy/pharmacies'),
        api.get(`/homeopathy/bookings/pharmacy/${id}`),
        api.get(`/homeopathy/settlements/earnings/pharmacy/${id}`),
        api.get(`/homeopathy/settlements/history/pharmacy/${id}`)
      ]);

      if (phRes.status === 'fulfilled' && phRes.value.data?.success) {
        const found = (phRes.value.data.data || []).find(p => p._id === id);
        if (found) setPharmacy(found);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data?.success) {
        setOrders(ordersRes.value.data.data || []);
      }
      if (earningsRes.status === 'fulfilled' && earningsRes.value.data?.success) {
        setEarnings(earningsRes.value.data.data);
      }
      if (settlementsRes.status === 'fulfilled' && settlementsRes.value.data?.success) {
        setSettlements(settlementsRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDelivery = async (bookingId, newStatus) => {
    try {
      // Uses the generic status endpoint but with a delivery-specific action
      // (adjust if your backend has a dedicated delivery endpoint)
      await api.put(`/homeopathy/bookings/${bookingId}/status`, {
        action: 'complete',
        deliveryStatus: newStatus
      });
      loadAll(pharmacyId);
    } catch (err) {
      alert('Failed to update');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pharmacyToken');
    localStorage.removeItem('pharmacy');
    navigate('/homeopathy/pharmacy/login', { replace: true });
  };

  const handleRequestSettlement = async () => {
    try {
      await api.post('/homeopathy/settlements/request', {
        providerType: 'pharmacy',
        providerId: pharmacyId
      });
      alert('Settlement requested!');
      loadAll(pharmacyId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter(o => o.status === filter);
  }, [orders, filter]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">💊</div>
            <div>
              <h1 className="text-2xl font-bold">{pharmacy?.businessName || 'Pharmacy'}</h1>
              <p className="text-red-100 text-sm">{pharmacy?.address?.city}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30">Logout</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: orders.length, icon: FaBox, color: 'bg-blue-500' },
            { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: FaExclamationTriangle, color: 'bg-yellow-500' },
            { label: 'Delivered', value: orders.filter(o => o.deliveryStatus === 'delivered').length, icon: FaTruck, color: 'bg-green-500' },
            { label: 'Earnings', value: `₹${earnings?.totalEarnings || 0}`, icon: FaRupeeSign, color: 'bg-red-600' }
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-4">
              <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white mb-2`}>
                <s.icon />
              </div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-2 shadow overflow-x-auto">
           {[
            { id: 'overview', label: 'Overview' },
            { id: 'orders', label: `Orders (${orders.length})` },
            { id: 'settlements', label: 'Settlements' },
            { id: 'kyc', label: 'KYC' }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === t.id ? 'bg-red-600 text-white' : 'hover:bg-gray-100'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-semibold mb-4">Recent Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            ) : (
              orders.slice(0, 5).map(o => (
                <div key={o._id} className="flex justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{o.patient?.name}</p>
                    <p className="text-xs text-gray-500">
                      {o.medicines?.length || 0} items • {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">{o.deliveryStatus || o.status}</span>
                    <p className="font-bold text-sm mt-1">₹{o.finalAmount}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="font-semibold">Orders ({filtered.length})</h2>
              <div className="flex gap-2">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                  <button key={s} onClick={() => setFilter(s)}
                    className={`px-3 py-1 rounded-full text-xs capitalize ${filter === s ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {filtered.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders found</p>
            ) : (
              <div className="space-y-3">
                {filtered.map(o => (
                  <div key={o._id} className="border rounded-lg p-4">
                    <div className="flex justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-semibold">{o.patient?.name}</p>
                        <p className="text-sm text-gray-500">{o.patient?.phone}</p>
                        <p className="text-xs text-gray-500 mt-1">{o.deliveryAddress}</p>
                        <p className="text-xs text-gray-400 mt-1">Order: {o.bookingId}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">{o.deliveryStatus || o.status}</span>
                        <p className="font-bold text-red-600 mt-1">₹{o.finalAmount}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-600">
                      <p className="font-semibold mb-1">Medicines:</p>
                      {(o.medicines || []).map((m, i) => (
                        <p key={i}>• {m.name} {m.potency} × {m.quantity} — ₹{m.price}</p>
                      ))}
                    </div>
                    {o.status !== 'completed' && (
                      <div className="mt-3 flex gap-2">
                        {o.deliveryStatus === 'processing' && (
                          <button onClick={() => handleUpdateDelivery(o.bookingId, 'shipped')}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs">Mark Shipped</button>
                        )}
                        {o.deliveryStatus === 'shipped' && (
                          <button onClick={() => handleUpdateDelivery(o.bookingId, 'delivered')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs">Mark Delivered</button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settlements' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Settlements</h2>
              <button onClick={handleRequestSettlement}
                disabled={!earnings?.pendingPayout}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  earnings?.pendingPayout ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                {earnings?.pendingPayout ? `Request ₹${earnings.pendingPayout}` : 'No Pending Payout'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Total Earnings</p>
                <p className="font-bold text-green-600">₹{earnings?.totalEarnings || 0}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Pending</p>
                <p className="font-bold text-orange-600">₹{earnings?.pendingPayout || 0}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Commission</p>
                <p className="font-bold text-blue-600">₹{earnings?.totalCommission || 0}</p>
              </div>
            </div>

            {settlements.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">No settlements yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-gray-500">
                    <th className="text-left py-2">Payout ID</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Net</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map(s => (
                    <tr key={s.payoutId} className="border-b">
                      <td className="py-2">{s.payoutId}</td>
                      <td className="py-2">₹{s.amount}</td>
                      <td className="py-2 font-bold">₹{s.netAmount}</td>
                      <td className="py-2"><span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'kyc' && (
          <KycUploadForm
            providerType="pharmacy"
            providerId={pharmacyId}
            token={token}
          />
        )}
      </div>
    </div>
  );
};

export default HomeopathyPharmacyDashboard;