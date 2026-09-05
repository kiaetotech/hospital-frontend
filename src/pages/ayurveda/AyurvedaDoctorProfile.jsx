import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAyurvedaDoctorById } from '../../services/ayurvedaApi';
import { FaStar, FaUserMd, FaArrowLeft, FaVideo, FaBuilding, FaHome, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';

const AyurvedaDoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getAyurvedaDoctorById(id);
        if (response.data?.success && response.data.data) {
          setDoctor(response.data.data);
        } else {
          setDoctor(response.data);
        }
      } catch (err) {
        setError('Failed to load doctor details');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">{error || 'Doctor not found'}</p>
          <button onClick={() => navigate('/ayurveda/doctors')} className="mt-4 text-green-600">
            Browse Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/ayurveda/doctors')}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6"
        >
          <FaArrowLeft /> Back to Doctors
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                {doctor.name?.charAt(0) || <FaUserMd />}
              </div>
              <div>
                    <h1 className="text-2xl font-bold">{doctor.name}</h1>
                    <p className="text-green-100">{doctor.specialization}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" /> {doctor.rating || 'New'} ({doctor.totalReviews || 0})
                      </span>
                      <span>{doctor.experience} years exp.</span>
                  {doctor.verificationStatus === 'approved' && (
                    <span className="flex items-center gap-1">
                      <FaShieldAlt /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Types */}
          <div className="p-4 bg-green-50 flex items-center gap-4 text-sm">
            {doctor.consultationTypes?.online && (
              <span className="flex items-center gap-1">
                <FaVideo className="text-green-600" /> Online
              </span>
            )}
            {doctor.consultationTypes?.clinic && (
              <span className="flex items-center gap-1">
                <FaBuilding className="text-green-600" /> Clinic
              </span>
            )}
            {doctor.consultationTypes?.homeVisit && (
              <span className="flex items-center gap-1">
                <FaHome className="text-green-600" /> Home Visit
              </span>
            )}
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            {/* About */}
            {doctor.about && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">About</h3>
                <p className="text-gray-600">{doctor.about}</p>
              </div>
            )}

            {/* Education & Registration */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Education & Registration</h3>
              <p className="text-gray-600">{doctor.education}</p>
              <p className="text-sm text-gray-500">AYUSH Reg: {doctor.ayushRegNo}</p>
              <p className="text-sm text-gray-500">
                {doctor.address?.city}, {doctor.address?.state}
              </p>
            </div>

            {/* Languages */}
             {doctor.languages && doctor.languages.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Wellness Center */}
            {doctor.wellnessCenter?.name && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Clinic / Center</h3>
                <p className="text-gray-600">{doctor.wellnessCenter.name}</p>
                <p className="text-sm text-gray-500">{doctor.wellnessCenter.type}</p>
              </div>
            )}

            {/* Fee & Booking */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Consultation Fee</h3>
              <p className="text-3xl font-bold text-green-600">₹{doctor.consultationFee}</p>
              <p className="text-sm text-gray-500 mt-1">
                Platform fee ₹30 + GST 18% applies
              </p>
            </div>

            {/* Book Button */}
            <button
              onClick={() => navigate(`/ayurveda/book/${doctor._id || doctor.id}`, { state: { doctor } })}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Book Consultation Now →
            </button>

            {/* Trust Badges */}
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FaCheckCircle className="text-green-600" /> Verified Doctor
              </span>
              <span className="flex items-center gap-1">
                <FaShieldAlt className="text-green-600" /> Secure Booking
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AyurvedaDoctorProfile;