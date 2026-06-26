import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorDashboard, updateDoctorAvailability } from '../../services/onlineDoctorApi';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const token = localStorage.getItem('doctorToken');
    if (!token) { navigate('/online-doctor/login'); return; }
    fetchDashboard();
  }, [navigate]);

  const fetchDashboard = async () => {
    try {
      const response = await getDoctorDashboard();
      setDashboard(response.data?.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('doctorToken');
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
          {[
            { label: "Today's Appointments", value: dashboard?.todayCount || 0, icon: '📅', color: 'from-blue-400 to-blue-600' },
            { label: 'Total Consultations', value: dashboard?.totalConsultations || 0, icon: '✅', color: 'from-green-400 to-green-600' },
            { label: 'Total Earnings', value: `₹${dashboard?.totalEarnings || 0}`, icon: '💰', color: 'from-purple-400 to-purple-600' },
            { label: 'Commission Rate', value: `${dashboard?.commissionPercentage || 25}%`, icon: '📊', color: 'from-orange-400 to-orange-600' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg`}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-white/80 text-sm">{stat.label}</p>
            </div>
          ))}
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
                <p className="text-sm text-gray-400 mt-1">Commission Slab: <span className="font-bold text-blue-600">{dashboard?.commissionSlab?.toUpperCase() || 'DEFAULT'}</span></p>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Today's Appointments</h3>
                {dashboard?.todayBookings?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="text-left text-gray-500 text-sm border-b"><th className="pb-3">Time</th><th className="pb-3">Patient</th><th className="pb-3">Status</th></tr></thead>
                      <tbody>
                        {dashboard.todayBookings.map((b) => (
                          <tr key={b._id} className="border-b">
                            <td className="py-3 font-medium">{b.timeSlot}</td>
                            <td className="py-3">{b.patientName}</td>
                            <td className="py-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                b.status === 'completed' ? 'bg-green-100 text-green-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>{b.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No appointments for today</p>
                )}
              </div>
            )}

            {activeTab === 'earnings' && (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">💰</div>
                <p className="text-3xl font-bold text-gray-800">₹{dashboard?.totalEarnings || 0}</p>
                <p className="text-gray-500">Total Earnings</p>
                <p className="text-sm text-gray-400 mt-2">Platform Commission Paid: ₹{dashboard?.platformCommissionPaid || 0}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;