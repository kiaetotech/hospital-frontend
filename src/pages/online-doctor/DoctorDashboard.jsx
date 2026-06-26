import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOnlineDoctorDashboard } from '../../services/api';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const token = localStorage.getItem('doctorToken');
    if (!token) {
      navigate('/online-doctor/login');
      return;
    }
    fetchDashboard();
  }, [navigate]);

  const fetchDashboard = async () => {
    try {
      const response = await getOnlineDoctorDashboard();
      setDashboard(response.data?.data);
    } catch (error) {
      console.error('Dashboard error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('doctorToken');
        localStorage.removeItem('doctorData');
        navigate('/online-doctor/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorData');
    navigate('/online-doctor/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">⏳</div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">👨‍⚕️</div>
            <h1 className="text-xl font-bold text-gray-800">Doctor Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/online-doctor')} className="text-gray-500 hover:text-gray-700 text-sm font-medium">Home</button>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-sm font-medium">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-3xl font-bold">{dashboard?.todayCount || 0}</p>
            <p className="text-white/80 text-sm">Today's Appointments</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-3xl font-bold">{dashboard?.totalConsultations || 0}</p>
            <p className="text-white/80 text-sm">Total Consultations</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-2xl mb-2">💰</div>
            <p className="text-3xl font-bold">₹{dashboard?.totalEarnings || 0}</p>
            <p className="text-white/80 text-sm">Total Earnings</p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-3xl font-bold">{dashboard?.commissionPercentage || 25}%</p>
            <p className="text-white/80 text-sm">Commission Rate</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b flex overflow-x-auto">
            {['overview', 'appointments', 'earnings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium text-sm capitalize whitespace-nowrap transition ${
                  activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">👋</div>
                <h3 className="text-xl font-bold text-gray-800">Welcome Back!</h3>
                <p className="text-gray-500 mt-2">Select a tab to view details</p>
                <div className="mt-6 inline-block bg-blue-50 rounded-2xl px-6 py-4">
                  <p className="text-sm text-gray-500">Your Commission Slab</p>
                  <p className="text-2xl font-bold text-blue-600">{(dashboard?.commissionSlab || 'DEFAULT').toUpperCase()}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {dashboard?.commissionSlab === 'diamond' && 'Top tier! Keep up the great work!'}
                    {dashboard?.commissionSlab === 'platinum' && 'Almost at the top! Just a few more.'}
                    {dashboard?.commissionSlab === 'gold' && 'Great progress! Keep growing.'}
                    {dashboard?.commissionSlab === 'silver' && 'Good start! More consultations will reduce your rate.'}
                    {dashboard?.commissionSlab === 'default' && 'Complete 50+ consultations with 4.2+ rating to unlock lower rates.'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Today's Appointments</h3>
                {dashboard?.todayBookings?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-500 text-sm border-b">
                          <th className="pb-3">Time</th>
                          <th className="pb-3">Patient</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.todayBookings.map((booking) => (
                          <tr key={booking._id} className="border-b">
                            <td className="py-3 font-medium">{booking.timeSlot}</td>
                            <td className="py-3">{booking.patientName}</td>
                            <td className="py-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📅</div>
                    <p className="text-gray-500">No appointments for today</p>
                    <p className="text-gray-400 text-sm mt-1">Check back later or update your availability</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'earnings' && (
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Earnings Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 rounded-2xl p-6 text-center">
                    <p className="text-gray-500 text-sm">Total Earnings</p>
                    <p className="text-3xl font-bold text-green-600">₹{dashboard?.totalEarnings || 0}</p>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-6 text-center">
                    <p className="text-gray-500 text-sm">Platform Commission Paid</p>
                    <p className="text-3xl font-bold text-blue-600">₹{dashboard?.platformCommissionPaid || 0}</p>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-6 text-center">
                    <p className="text-gray-500 text-sm">Completed Consultations</p>
                    <p className="text-3xl font-bold text-purple-600">{dashboard?.completedConsultations || 0}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <p className="text-gray-500 text-sm">Payouts are processed weekly</p>
                  <p className="text-gray-400 text-xs mt-1">Minimum payout amount: ₹500</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;