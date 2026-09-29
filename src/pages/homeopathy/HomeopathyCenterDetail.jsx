import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import {
  FaStar, FaMapMarkerAlt, FaCheckCircle, FaCalendarAlt,
  FaClock, FaBed, FaArrowLeft, FaLeaf, FaUserMd
} from 'react-icons/fa';

const HomeopathyCenterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [center, setCenter] = useState(location.state?.center || null);
  const [loading, setLoading] = useState(!center);
  const [error, setError] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    if (!center) fetchCenter();
  }, [id]);

  const fetchCenter = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/homeopathy/centers/${id}`);
      if (res.data?.success) setCenter(res.data.data);
      else setError('Center not found');
    } catch (err) {
      setError('Failed to load center');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (pkg) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(`/login?redirect=/homeopathy/center/${id}`);
      return;
    }
    navigate(`/homeopathy/center/${id}/book/${pkg._id}`, {
      state: { center, package: pkg }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (error || !center) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Center not found'}</p>
          <button onClick={() => navigate('/homeopathy/centers')} className="px-6 py-2 bg-green-600 text-white rounded-lg">
            Back to Centers
          </button>
        </div>
      </div>
    );
  }

  const reviews = (center.reviews || []).filter(r => r.adminApproved !== false);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4">
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
            <div className="flex items-start gap-5 flex-wrap">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">🌿</div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{center.name}</h1>
                <p className="text-green-100 text-sm mt-1">{center.type || 'Naturopathy Center'}</p>
                <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" /> {center.rating || 'New'}
                    {center.totalReviews > 0 && <span className="text-green-100">({center.totalReviews})</span>}
                  </span>
                  {center.bedCount && (
                    <span className="flex items-center gap-1"><FaBed /> {center.bedCount} beds</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {(center.facilities || []).length > 0 && (
            <div className="p-4 bg-green-50 flex flex-wrap gap-2">
              {center.facilities.map((f, i) => (
                <span key={i} className="text-xs bg-white text-green-700 px-3 py-1 rounded-full font-medium">
                  ✓ {f}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {center.description && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h2 className="font-semibold mb-2 flex items-center gap-2"><FaLeaf className="text-green-600" /> About</h2>
            <p className="text-gray-700 text-sm leading-relaxed">{center.description}</p>
          </div>
        )}

        {/* Address */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="font-semibold mb-2 flex items-center gap-2"><FaMapMarkerAlt className="text-green-600" /> Location</h2>
          <p className="text-gray-700 text-sm">
            {[center.address?.line1, center.address?.area, center.address?.city, center.address?.state, center.address?.pincode].filter(Boolean).join(', ') || 'Address not available'}
          </p>
        </div>

        {/* Packages */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="font-semibold mb-4">Available Packages ({center.packages?.length || 0})</h2>
          {!center.packages || center.packages.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No packages available</p>
          ) : (
            <div className="space-y-3">
              {center.packages.map(pkg => {
                const price = pkg.discountPrice || pkg.price;
                const slotsLeft = (pkg.maxCapacity || 5) - (pkg.currentBookings || 0);
                const isFull = slotsLeft <= 0;

                return (
                  <div key={pkg._id} className="border rounded-lg p-4 hover:border-green-300 transition-colors">
                    <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                      <div className="flex-1 min-w-[200px]">
                        <h3 className="font-bold text-gray-800">{pkg.name}</h3>
                        {pkg.description && <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>}
                      </div>
                      <div className="text-right">
                        {pkg.discountPrice && pkg.discountPrice < pkg.price && (
                          <p className="text-xs text-gray-400 line-through">₹{pkg.price}</p>
                        )}
                        <p className="text-xl font-bold text-green-600">₹{price}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-2">
                      <span className="flex items-center gap-1"><FaCalendarAlt /> {pkg.duration} days</span>
                      {!isFull ? (
                        <span className="text-green-600 font-medium">{slotsLeft} slots left</span>
                      ) : (
                        <span className="text-red-600 font-medium">SOLD OUT</span>
                      )}
                    </div>

                    {(pkg.therapies || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {pkg.therapies.slice(0, 5).map((t, i) => (
                          <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleBook(pkg)}
                      disabled={isFull}
                      className={`w-full py-2 rounded-lg font-semibold text-sm ${
                        isFull ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isFull ? 'Sold Out' : `Book Package — ₹${price}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FaStar className="text-green-600" /> Patient Reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 10).map((r, i) => (
                <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{r.patientName || 'Patient'}</p>
                      <p className="text-xs text-gray-500">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : ''}
                      </p>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(n => (
                        <FaStar key={n} className={n <= r.rating ? 'text-yellow-400' : 'text-gray-300'} size={12} />
                      ))}
                    </div>
                  </div>
                  {r.review && <p className="text-sm text-gray-700">{r.review}</p>}
                  {r.packageName && <p className="text-xs text-gray-500 mt-1">Package: {r.packageName}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeopathyCenterDetail;