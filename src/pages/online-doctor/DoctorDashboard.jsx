import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOnlineDoctorDashboard } from '../../services/api';
import api from '../../services/api';
import { uploadFile } from '../../services/api';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('doctorToken');
    if (!token) { navigate('/online-doctor/login'); return; }
    fetchDashboard();
  }, [navigate]);

  const fetchDashboard = async () => {
    try {
      const response = await getOnlineDoctorDashboard();
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

  const handleDocumentUpload = async (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      try {
        const response = await uploadFile(file, 'doctor-documents');
        const url = response.data?.url;
        const token = localStorage.getItem('doctorToken');
        await api.put('/online-doctor/doctor/documents', { documents: { [type]: url } }, { headers: { Authorization: `Bearer ${token}` } });
        alert('Document uploaded!');
        fetchDashboard();
      } catch (error) {
        alert('Upload failed');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorData');
    navigate('/online-doctor/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">👨‍⚕️</div>
            <h1 className="text-xl font-bold text-gray-800">Doctor Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/online-doctor')} className="text-gray-500 hover:text-gray-700 text-sm">Home</button>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-sm">Logout</button>
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
            {['overview', 'appointments', 'earnings', 'documents'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium text-sm capitalize whitespace-nowrap transition ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
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
                    {dashboard?.commissionSlab === 'default' && 'Complete 50+ consultations with 4.2+ rating for Silver (22%)'}
                    {dashboard?.commissionSlab === 'silver' && 'Complete 200+ consultations with 4.5+ rating for Gold (20%)'}
                    {dashboard?.commissionSlab === 'gold' && 'Complete 500+ consultations with 4.8+ rating for Platinum (15%)'}
                    {dashboard?.commissionSlab === 'platinum' && 'Complete 1000+ consultations with 4.9+ rating for Diamond (12%)'}
                    {dashboard?.commissionSlab === 'diamond' && '🏆 You are at the highest tier!'}
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
                      <thead><tr className="text-left text-gray-500 text-sm border-b"><th className="pb-3">Time</th><th className="pb-3">Patient</th><th className="pb-3">Status</th></tr></thead>
                      <tbody>
                        {dashboard.todayBookings.map((b) => (
                          <tr key={b._id} className="border-b">
                            <td className="py-3 font-medium">{b.timeSlot}</td>
                            <td className="py-3">{b.patientName}</td>
                            <td className="py-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${b.status === 'completed' ? 'bg-green-100 text-green-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span>
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
              <div>
                <h3 className="font-bold text-gray-800 mb-6">Earnings Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-green-50 rounded-2xl p-6 text-center">
                    <p className="text-gray-500 text-sm">Total Earnings</p>
                    <p className="text-3xl font-bold text-green-600">₹{dashboard?.totalEarnings || 0}</p>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-6 text-center">
                    <p className="text-gray-500 text-sm">Platform Commission</p>
                    <p className="text-3xl font-bold text-blue-600">₹{dashboard?.platformCommissionPaid || 0}</p>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-6 text-center">
                    <p className="text-gray-500 text-sm">Net Earnings</p>
                    <p className="text-3xl font-bold text-purple-600">₹{(dashboard?.totalEarnings || 0) - (dashboard?.platformCommissionPaid || 0)}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <p className="text-sm text-gray-500">Payouts processed every Monday • Minimum ₹500</p>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Upload Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'registrationCert', label: 'Registration Certificate', icon: '📄' },
                    { key: 'degreeCert', label: 'Degree Certificate', icon: '🎓' },
                    { key: 'idProof', label: 'ID Proof', icon: '🆔' },
                    { key: 'photo', label: 'Profile Photo', icon: '📸' },
                    { key: 'panCard', label: 'PAN Card', icon: '💳' },
                  ].map((doc) => (
                    <button key={doc.key} onClick={() => handleDocumentUpload(doc.key)} disabled={uploading}
                      className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 text-center transition border-2 border-dashed border-gray-300">
                      <div className="text-3xl mb-2">{doc.icon}</div>
                      <p className="font-medium text-gray-700">{doc.label}</p>
                      <p className="text-xs text-gray-400 mt-1">Click to upload</p>
                    </button>
                  ))}
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