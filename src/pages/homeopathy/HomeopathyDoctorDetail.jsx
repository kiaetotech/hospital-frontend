import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import {
  FaStar, FaMapMarkerAlt, FaCheckCircle, FaVideo, FaBuilding,
  FaClock, FaGraduationCap, FaLanguage, FaUserMd, FaShieldAlt,
  FaCalendarAlt, FaArrowLeft, FaBriefcaseMedical
} from 'react-icons/fa';

const HomeopathyDoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [doctor, setDoctor] = useState(location.state?.doctor || null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(!doctor);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    setLoading(true);
    setError('');
    try {
      const [docRes, revRes] = await Promise.allSettled([
        api.get(`/homeopathy/doctors/${id}`),
        api.get(`/homeopathy/doctor/${id}/reviews`)
      ]);

      if (docRes.status === 'fulfilled' && docRes.value.data?.success) {
        setDoctor(docRes.value.data.data);
      } else {
        setError('Doctor not found');
      }

      if (revRes.status === 'fulfilled' && revRes.value.data?.success) {
        setReviews(revRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Doctor fetch error:', err);
      setError('Failed to load doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (mode) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(`/login?redirect=/homeopathy/book/${id}`);
      return;
    }
    navigate(`/homeopathy/book/${id}`, {
      state: { doctor, consultationType: mode }
    });
  };

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
          <p className="text-xl text-gray-600 mb-4">{error || 'Doctor not found'}</p>
          <button
            onClick={() => navigate('/homeopathy/doctors')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg"
          >
            Browse Doctors
          </button>
        </div>
      </div>
    );
  }

  const averageRating = doctor.rating || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
      {/* Back button */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600"
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
            <div className="flex items-start gap-5">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold flex-shrink-0">
                {doctor.name?.charAt(0) || 'D'}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{doctor.name}</h1>
                <p className="text-green-100">{doctor.specialization}</p>
                <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" /> {averageRating || 'New'}
                    {doctor.totalReviews > 0 && <span className="text-green-100">({doctor.totalReviews})</span>}
                  </span>
                  <span>{doctor.experience || 0} yrs exp.</span>
                  {doctor.verifiedKyc && (
                    <span className="flex items-center gap-1">
                      <FaShieldAlt /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Consultation modes */}
          <div className="p-4 bg-green-50 flex items-center gap-4 text-sm flex-wrap">
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
            {doctor.address?.city && (
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt className="text-green-600" /> {doctor.address.city}
                {doctor.address.state && `, ${doctor.address.state}`}
              </span>
            )}
          </div>
        </div>

        {/* About */}
        {doctor.about && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FaUserMd className="text-green-600" /> About
            </h2>
            <p className="text-gray-700 leading-relaxed">{doctor.about}</p>
          </div>
        )}

        {/* Qualifications */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaBriefcaseMedical className="text-green-600" /> Professional Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {doctor.education && (
              <div className="flex items-start gap-2">
                <FaGraduationCap className="text-green-600 mt-1" />
                <div>
                  <p className="text-gray-500 text-xs">Education</p>
                  <p className="font-medium">{doctor.education}</p>
                </div>
              </div>
            )}
            {doctor.registrationNumber && (
              <div>
                <p className="text-gray-500 text-xs">Registration No.</p>
                <p className="font-medium">{doctor.registrationNumber}</p>
              </div>
            )}
            {doctor.registrationCouncil && (
              <div>
                <p className="text-gray-500 text-xs">Council</p>
                <p className="font-medium">{doctor.registrationCouncil}</p>
              </div>
            )}
            {doctor.languages?.length > 0 && (
              <div className="flex items-start gap-2">
                <FaLanguage className="text-green-600 mt-1" />
                <div>
                  <p className="text-gray-500 text-xs">Languages</p>
                  <p className="font-medium">{doctor.languages.join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FaStar className="text-green-600" /> Patient Reviews ({reviews.length})
            </h2>
            {averageRating > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-600">{averageRating}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(i => (
                    <FaStar
                      key={i}
                      className={i <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 10).map((r, idx) => (
                <div key={idx} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{r.patientName || 'Patient'}</p>
                      <p className="text-xs text-gray-500">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : ''}
                      </p>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(i => (
                        <FaStar
                          key={i}
                          className={i <= r.rating ? 'text-yellow-400' : 'text-gray-300'}
                          size={12}
                        />
                      ))}
                    </div>
                  </div>
                  {r.review && <p className="text-gray-700 text-sm">{r.review}</p>}
                  {r.doctorResponse && (
                    <div className="mt-2 ml-4 pl-3 border-l-2 border-green-300">
                      <p className="text-xs text-green-700 font-semibold">Doctor's response:</p>
                      <p className="text-sm text-gray-600">{r.doctorResponse}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fee */}
        <div className="bg-gradient-to-r from-green-50 to-white border-2 border-green-200 rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Consultation Fee</p>
              <p className="text-3xl font-bold text-green-600">₹{doctor.consultationFee || 0}</p>
            </div>
            <FaCheckCircle className="text-green-600 text-4xl" />
          </div>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg lg:hidden">
        <div className="flex gap-3 max-w-4xl mx-auto">
          {doctor.consultationTypes?.online && (
            <button
              onClick={() => handleBook('online')}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <FaVideo /> Book Online
            </button>
          )}
          {doctor.consultationTypes?.clinic && (
            <button
              onClick={() => handleBook('clinic')}
              className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <FaBuilding /> Clinic Visit
            </button>
          )}
        </div>
      </div>

      {/* Desktop CTA */}
      <div className="hidden lg:block max-w-4xl mx-auto px-4 pb-6">
        <div className="flex gap-3">
          {doctor.consultationTypes?.online && (
            <button
              onClick={() => handleBook('online')}
              className="flex-1 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
            >
              <FaVideo /> Book Online Consultation
            </button>
          )}
          {doctor.consultationTypes?.clinic && (
            <button
              onClick={() => handleBook('clinic')}
              className="flex-1 py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
            >
              <FaBuilding /> Book Clinic Visit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeopathyDoctorDetail;