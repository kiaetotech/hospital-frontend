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

  // ============================================
  // 🆕 FEE SETTINGS STATE
  // ============================================
  const [feeSettings, setFeeSettings] = useState({
    consultationFee: 500,
    followUpFee: 200,
    followUpWindowDays: 7,
    freeFollowUps: 1,
    emergencyConsultFee: 800,
    consultationDuration: 15,
    packagePrice: 0
  });
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeMessage, setFeeMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('doctorToken');
    if (!token) { navigate('/online-doctor/login'); return; }
    fetchDashboard();
    fetchFeeSettings(); // 🆕 Fetch fee settings
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

  // ============================================
  // 🆕 FEE SETTINGS FUNCTIONS
  // ============================================
  const fetchFeeSettings = async () => {
    try {
      const token = localStorage.getItem('doctorToken');
      const res = await api.get('/online-doctor/fee-settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success && res.data?.data) {
        setFeeSettings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching fee settings:', err);
    }
  };

  const handleFeeChange = (field, value) => {
    setFeeSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveFeeSettings = async () => {
    setFeeLoading(true);
    setFeeMessage('');
    try {
      const token = localStorage.getItem('doctorToken');
      const res = await api.put('/online-doctor/fee-settings', feeSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setFeeMessage('✅ Fee settings saved successfully!');
        setTimeout(() => setFeeMessage(''), 3000);
      } else {
        setFeeMessage('❌ ' + (res.data?.message || 'Error saving'));
      }
    } catch (err) {
      setFeeMessage('❌ Error saving settings');
    } finally {
      setFeeLoading(false);
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
        await api.put('/online-doctor/doctor/documents', 
          { documents: { [type]: url } }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
      {/* Header */}
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
            { label: 'Commission Rate', value: `${dashboard?.commissionPercentage || 20}%`, icon: '📊', color: 'from-orange-400 to-orange-600' },
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
            {['overview', 'appointments', 'fees', 'earnings', 'documents', 'analytics'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium text-sm capitalize whitespace-nowrap transition ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab === 'fees' ? '💰 Fee Settings' : tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">👋</div>
                <h3 className="text-xl font-bold text-gray-800">Welcome Back!</h3>
                <p className="text-gray-500 mt-2">Select a tab to view details</p>
                <div className="mt-6 inline-block bg-blue-50 rounded-2xl px-6 py-4">
                  <p className="text-sm text-gray-500">Your Commission Slab</p>
                  <p className="text-2xl font-bold text-blue-600">{(dashboard?.commissionSlab || 'DEFAULT').toUpperCase()}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {dashboard?.commissionSlab === 'default' && 'Complete 50+ consultations with 4.2+ rating for Silver (20%)'}
                    {dashboard?.commissionSlab === 'silver' && 'Complete 200+ consultations with 4.5+ rating for Gold (18%)'}
                    {dashboard?.commissionSlab === 'gold' && 'Complete 500+ consultations with 4.8+ rating for Platinum (15%)'}
                    {dashboard?.commissionSlab === 'platinum' && 'Complete 1000+ consultations with 4.9+ rating for Diamond (12%)'}
                    {dashboard?.commissionSlab === 'diamond' && '🏆 You are at the highest tier!'}
                  </p>
                </div>
              </div>
            )}

            {/* APPOINTMENTS TAB */}
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

            {/* ============================================ */}
            {/* 🆕 FEE SETTINGS TAB */}
            {/* ============================================ */}
            {activeTab === 'fees' && (
              <div>
                <h3 className="font-bold text-gray-800 mb-1">💰 Fee Settings</h3>
                <p className="text-gray-500 text-sm mb-6">Set your consultation fees. Patients will see these prices.</p>

                {/* Message */}
                {feeMessage && (
                  <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${feeMessage.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {feeMessage}
                  </div>
                )}

                {/* Commission Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-semibold text-blue-800 text-sm">Platform Commission: {dashboard?.commissionPercentage || 20}%</p>
                    <p className="text-blue-600 text-xs">Tier: {(dashboard?.commissionSlab || 'default').toUpperCase()} • Higher ratings = Lower commission</p>
                  </div>
                </div>

                {/* Consultation Fees */}
                <div className="bg-white border rounded-xl p-5 mb-4">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">💬 Consultation Fees</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Consultation Fee (₹)</label>
                      <input type="number" value={feeSettings.consultationFee} onChange={(e) => handleFeeChange('consultationFee', Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" min="0" />
                      <p className="text-xs text-gray-400 mt-1">Standard video consultation</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Follow-up Fee (₹)</label>
                      <input type="number" value={feeSettings.followUpFee} onChange={(e) => handleFeeChange('followUpFee', Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" min="0" />
                      <p className="text-xs text-gray-400 mt-1">Discounted rate for repeat patients</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Emergency Fee (₹)</label>
                      <input type="number" value={feeSettings.emergencyConsultFee} onChange={(e) => handleFeeChange('emergencyConsultFee', Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" min="0" />
                      <p className="text-xs text-gray-400 mt-1">Priority queue, faster response</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Package Price (₹) <span className="text-gray-400">— Optional</span></label>
                      <input type="number" value={feeSettings.packagePrice} onChange={(e) => handleFeeChange('packagePrice', Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" min="0" placeholder="0 = No package" />
                      <p className="text-xs text-gray-400 mt-1">
                        {feeSettings.packagePrice > 0 
                          ? `Bundle saves ₹${feeSettings.consultationFee + feeSettings.followUpFee - feeSettings.packagePrice}`
                          : 'Set to offer Consult + Follow-up bundle'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Follow-up Policy */}
                <div className="bg-white border rounded-xl p-5 mb-4">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">🔄 Follow-up Policy</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Follow-up Window (Days)</label>
                      <input type="number" value={feeSettings.followUpWindowDays} onChange={(e) => handleFeeChange('followUpWindowDays', Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" min="1" max="30" />
                      <p className="text-xs text-gray-400 mt-1">Patient gets follow-up rate within {feeSettings.followUpWindowDays} days</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Free Follow-ups Per Patient</label>
                      <input type="number" value={feeSettings.freeFollowUps} onChange={(e) => handleFeeChange('freeFollowUps', Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" min="0" max="5" />
                      <p className="text-xs text-gray-400 mt-1">
                        {feeSettings.freeFollowUps === 0 ? 'No free follow-ups' : `${feeSettings.freeFollowUps} free follow-up(s) per patient`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-white border rounded-xl p-5 mb-4">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">⏱️ Duration</h4>
                  <div className="max-w-xs">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Consultation Duration (Minutes)</label>
                    <input type="number" value={feeSettings.consultationDuration} onChange={(e) => handleFeeChange('consultationDuration', Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" min="5" max="60" step="5" />
                    <p className="text-xs text-gray-400 mt-1">5-60 minutes</p>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">👁️ Patient Will See</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Consultation</p>
                      <p className="text-lg font-bold text-gray-800">₹{feeSettings.consultationFee}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Follow-up</p>
                      <p className="text-lg font-bold text-green-600">{feeSettings.followUpFee > 0 ? `₹${feeSettings.followUpFee}` : 'FREE'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Emergency</p>
                      <p className="text-lg font-bold text-red-600">₹{feeSettings.emergencyConsultFee}</p>
                    </div>
                    {feeSettings.packagePrice > 0 && (
                      <div className="bg-white rounded-lg p-3 text-center border-2 border-green-500">
                        <p className="text-xs text-gray-500">Package</p>
                        <p className="text-lg font-bold text-green-600">₹{feeSettings.packagePrice}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <button onClick={saveFeeSettings} disabled={feeLoading}
                  className={`px-6 py-3 rounded-xl text-white font-semibold text-sm ${feeLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {feeLoading ? 'Saving...' : '💾 Save Fee Settings'}
                </button>
              </div>
            )}

            {/* EARNINGS TAB */}
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

            {/* DOCUMENTS TAB */}
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

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div>
                <h3 className="font-bold text-gray-800 mb-6">Performance Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-xl p-4 text-center border">
                    <p className="text-2xl font-bold text-green-600">{dashboard?.todayCount || 0}</p>
                    <p className="text-xs text-gray-500">Today's Bookings</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center border">
                    <p className="text-2xl font-bold text-blue-600">{dashboard?.totalConsultations || 0}</p>
                    <p className="text-xs text-gray-500">Total Consultations</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center border">
                    <p className="text-2xl font-bold text-purple-600">{dashboard?.completedConsultations || 0}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center border">
                    <p className="text-2xl font-bold text-orange-600">₹{dashboard?.totalEarnings || 0}</p>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="font-semibold text-gray-700 mb-4">Commission Progress</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Current Tier</span>
                      <span className="font-bold text-blue-600">{(dashboard?.commissionSlab || 'default').toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Current Rate</span>
                      <span className="font-bold">{dashboard?.commissionPercentage || 20}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Next Tier</span>
                      <span className="font-bold text-green-600">
                        {dashboard?.commissionSlab === 'default' && 'Silver (20%) - Need 50+ consults & 4.2+ rating'}
                        {dashboard?.commissionSlab === 'silver' && 'Gold (18%) - Need 200+ consults & 4.5+ rating'}
                        {dashboard?.commissionSlab === 'gold' && 'Platinum (15%) - Need 500+ consults & 4.8+ rating'}
                        {dashboard?.commissionSlab === 'platinum' && 'Diamond (12%) - Need 1000+ consults & 4.9+ rating'}
                        {dashboard?.commissionSlab === 'diamond' && '🏆 Maximum tier achieved!'}
                      </span>
                    </div>
                  </div>
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
