import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getDoctorById } from '../../services/onlineDoctorApi';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('about');

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    try {
      const response = await getDoctorById(id);
      setDoctor(response.data?.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">⏳</div>
          <p className="text-gray-500">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-xl text-gray-600">Doctor not found</p>
          <Link to="/online-doctor" className="text-blue-600 hover:underline mt-2 block">Back to Online Doctor</Link>
        </div>
      </div>
    );
  }

  const platformFee = doctor.consultationFee <= 500 ? 30 : doctor.consultationFee <= 1000 ? 50 : 80;
  const total = doctor.consultationFee + platformFee;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <Link to="/online-doctor/search" className="text-blue-600 hover:underline text-sm">← Back to Search</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center text-5xl flex-shrink-0 shadow-lg">
                {doctor.gender === 'Female' ? '👩‍⚕️' : '👨‍⚕️'}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">Dr. {doctor.name}</h1>
                  {doctor.verificationStatus === 'verified' && (
                    <span className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-xs font-bold">✓ VERIFIED</span>
                  )}
                </div>
                <p className="text-xl text-blue-100">{doctor.specialization}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    ⭐ {doctor.ratingSummary?.averageRating || 'New'} ({doctor.ratingSummary?.totalReviews || 0} reviews)
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    📅 {doctor.experience} Years Exp
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    🎓 {doctor.qualification}
                  </span>
                </div>
                <p className="text-sm text-blue-200 mt-2">Reg. No: {doctor.registrationNumber} | {doctor.medicalCouncil || 'MCI'}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b flex overflow-x-auto">
            {['about', 'availability', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-4 font-medium text-sm transition capitalize whitespace-nowrap ${
                  selectedTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content + Booking Card */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {selectedTab === 'about' && (
                  <div className="space-y-6">
                    {doctor.about && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">About</h3>
                        <p className="text-gray-600 leading-relaxed">{doctor.about}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Qualification</h3>
                      <p className="text-gray-600 font-medium">{doctor.qualification}</p>
                      {doctor.subSpecialization && (
                        <p className="text-gray-500 text-sm mt-1">Sub-specialization: {doctor.subSpecialization}</p>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Languages Spoken</h3>
                      <div className="flex flex-wrap gap-2">
                        {doctor.languages?.map((lang) => (
                          <span key={lang} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium">{lang}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Consultation Modes</h3>
                      <div className="flex gap-4">
                        {doctor.consultationModes?.video && (
                          <span className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">🎥 Video Call</span>
                        )}
                        {doctor.consultationModes?.audio && (
                          <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">📞 Audio Call</span>
                        )}
                      </div>
                    </div>
                    {doctor.hospitalAffiliation?.mentioned && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Hospital Affiliation</h3>
                        <p className="text-gray-600">🏥 {doctor.hospitalAffiliation.hospitalName}, {doctor.hospitalAffiliation.city}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Performance</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <p className="text-2xl font-bold text-blue-600">{doctor.stats?.completedConsultations || 0}</p>
                          <p className="text-xs text-gray-500">Consultations</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <p className="text-2xl font-bold text-green-600">{doctor.ratingSummary?.averageRating || 'New'}</p>
                          <p className="text-xs text-gray-500">Rating</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <p className="text-2xl font-bold text-purple-600">{doctor.commissionSlab === 'default' ? 'Standard' : doctor.commissionSlab?.toUpperCase()}</p>
                          <p className="text-xs text-gray-500">Tier</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'availability' && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Availability</h3>
                    {doctor.availability?.length > 0 ? (
                      <div className="space-y-3">
                        {doctor.availability.map((day) => (
                          <div key={day.day} className={`rounded-xl p-4 ${day.isAvailable ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-700">{day.day}</span>
                              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                                day.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                              }`}>
                                {day.isAvailable ? 'Available' : 'Not Available'}
                              </span>
                            </div>
                            {day.isAvailable && day.slots?.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {day.slots.map((slot, idx) => (
                                  <span key={idx} className="bg-white text-gray-600 px-3 py-1 rounded-lg text-xs border">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Availability not set yet. Please check back.</p>
                    )}
                  </div>
                )}

                {selectedTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Patient Reviews ({doctor.ratingSummary?.totalReviews || 0})
                    </h3>
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">⭐</div>
                      <p>Reviews will appear here after consultations.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Card */}
              <div>
                <div className="bg-gray-50 rounded-2xl p-6 sticky top-24 border-2 border-gray-100">
                  <div className="text-center mb-6">
                    <p className="text-4xl font-bold text-green-600">₹{doctor.consultationFee}</p>
                    <p className="text-gray-500 text-sm">{doctor.consultationDuration} minutes consultation</p>
                  </div>

                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Consultation Fee</span>
                      <span className="font-medium">₹{doctor.consultationFee}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Platform Fee</span>
                      <span className="font-medium">₹{platformFee}</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between font-bold text-lg text-gray-800">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/online-doctor/book/${doctor._id}`)}
                    disabled={!doctor.isAvailable}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg ${
                      doctor.isAvailable
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {doctor.isAvailable ? '📅 Book Consultation' : 'Currently Unavailable'}
                  </button>

                  {doctor.isAvailable && (
                    <button
                      onClick={() => navigate(`/online-doctor/book/${doctor._id}?instant=true`)}
                      className="w-full mt-3 py-3 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                    >
                      ⚡ Instant Consult
                    </button>
                  )}

                  <div className="mt-4 text-center text-xs text-gray-400">
                    <p>🔒 Secure payment via Razorpay</p>
                    <p>↩️ Free cancellation before 2 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;