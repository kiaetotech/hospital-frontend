import React, { useState, useEffect } from 'react';
import { getPendingOnlineDoctors, verifyOnlineDoctor, getAllOnlineDoctors } from '../../services/api';

const AdminOnlineDoctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => { fetchDoctors(); }, [activeTab]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = activeTab === 'pending' ? await getPendingOnlineDoctors() : await getAllOnlineDoctors();
      setDoctors(response.data?.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (doctorId) => {
    try {
      await verifyOnlineDoctor(doctorId, { status: 'verified' });
      fetchDoctors();
      setSelectedDoctor(null);
    } catch (error) {
      alert('Verification failed');
    }
  };

  const handleReject = async (doctorId) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    try {
      await verifyOnlineDoctor(doctorId, { status: 'rejected', rejectionReason: reason });
      fetchDoctors();
      setSelectedDoctor(null);
    } catch (error) {
      alert('Rejection failed');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      documents_uploaded: 'bg-blue-100 text-blue-700',
      verified: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      suspended: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📱 Online Doctor Verification</h1>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>
              🕐 Pending ({doctors.filter(d => d.verificationStatus !== 'verified').length})
            </button>
            <button onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>
              📋 All ({doctors.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin text-4xl">⏳</div></div>
        ) : doctors.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500">No doctors found</div>
        ) : (
          <div className="grid gap-4">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">👨‍⚕️</div>
                    <div>
                      <h3 className="font-bold text-gray-800">Dr. {doctor.name}</h3>
                      <p className="text-gray-500 text-sm">{doctor.specialization} • {doctor.qualification}</p>
                      <p className="text-gray-400 text-xs mt-1">📧 {doctor.email} • 📱 {doctor.phone}</p>
                      <p className="text-gray-400 text-xs">🪪 Reg: {doctor.registrationNumber} • 💰 Fee: ₹{doctor.consultationFee} • 📅 Exp: {doctor.experience} yrs</p>
                      <p className="text-gray-400 text-xs">🗣️ {doctor.languages?.join(', ') || 'N/A'} • 👤 {doctor.gender}</p>
                      {doctor.about && <p className="text-gray-500 text-xs mt-1 italic">"{doctor.about.substring(0, 100)}..."</p>}
                      {doctor.rejectionReason && (
                        <p className="text-red-500 text-xs mt-1">❌ Rejected: {doctor.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(doctor.verificationStatus)}`}>
                      {doctor.verificationStatus.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">Joined: {new Date(doctor.createdAt).toLocaleDateString()}</span>
                    {(doctor.verificationStatus === 'pending' || doctor.verificationStatus === 'documents_uploaded') && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleVerify(doctor._id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                          ✅ Approve
                        </button>
                        <button onClick={() => handleReject(doctor._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                          ❌ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents Section */}
                {doctor.documents && (doctor.documents.registrationCert || doctor.documents.degreeCert || doctor.documents.idProof) && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-600 mb-2">📄 Uploaded Documents</p>
                    <div className="flex flex-wrap gap-3">
                      {doctor.documents.registrationCert && (
                        <a href={doctor.documents.registrationCert} target="_blank" rel="noreferrer"
                          className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-100">Registration Certificate</a>
                      )}
                      {doctor.documents.degreeCert && (
                        <a href={doctor.documents.degreeCert} target="_blank" rel="noreferrer"
                          className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-100">Degree Certificate</a>
                      )}
                      {doctor.documents.idProof && (
                        <a href={doctor.documents.idProof} target="_blank" rel="noreferrer"
                          className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-100">ID Proof</a>
                      )}
                      {doctor.documents.photo && (
                        <a href={doctor.documents.photo} target="_blank" rel="noreferrer"
                          className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-100">Photo</a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOnlineDoctor;