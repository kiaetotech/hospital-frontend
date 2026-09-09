import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPanchakarmaCenters } from '../../services/ayurvedaApi';
import { 
  FaStar, FaArrowLeft, FaCheckCircle, FaTimesCircle, 
  FaBed, FaUserMd, FaRupeeSign, FaTrophy, FaShieldAlt 
} from 'react-icons/fa';

const CompareCenters = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialCenters = location.state?.centers || [];
  
  const [allCenters, setAllCenters] = useState([]);
  const [selectedCenters, setSelectedCenters] = useState(initialCenters.slice(0, 3));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const response = await getPanchakarmaCenters();
      if (response.data.success) {
        setAllCenters(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load centers');
    } finally {
      setLoading(false);
    }
  };

  const toggleCenter = (center) => {
    if (selectedCenters.find(c => c._id === center._id)) {
      const updated = selectedCenters.filter(c => c._id !== center._id);
      setSelectedCenters(updated);
    } else if (selectedCenters.length < 3) {
      setSelectedCenters([...selectedCenters, center]);
    } else {
      alert('Maximum 3 centers for comparison');
    }
  };

  const getMinPackagePrice = (center) => {
    return Math.min(...(center.packages?.map(p => p.discountPrice || p.price) || [0]));
  };

  const getHighestRated = () => {
    if (selectedCenters.length === 0) return null;
    return selectedCenters.reduce((best, c) => 
      (c.rating || 0) > (best.rating || 0) ? c : best
    );
  };

  const getBestValue = () => {
    if (selectedCenters.length === 0) return null;
    return selectedCenters.reduce((best, c) => 
      getMinPackagePrice(c) < getMinPackagePrice(best) ? c : best
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FaStar key={i} className={i < fullStars ? 'text-yellow-400' : 'text-gray-300'} />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading comparison...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 transition-colors"
        >
          <FaArrowLeft /> Back to Centers
        </button>

        <h1 className="text-3xl font-bold mb-2">Compare Panchakarma Centers</h1>
        <p className="text-gray-500 mb-8">Compare up to 3 centers side by side</p>

        {/* Center Selection */}
        {allCenters.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="font-semibold mb-4">Add or Remove Centers (max 3)</h2>
            <div className="flex gap-2 flex-wrap">
              {allCenters.map(center => (
                <button
                  key={center._id}
                  onClick={() => toggleCenter(center)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedCenters.find(c => c._id === center._id)
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:border-green-300'
                  }`}
                >
                  {selectedCenters.find(c => c._id === center._id) ? '✓ ' : ''}
                  {center.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedCenters.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Centers Selected</h3>
            <p className="text-gray-500 mb-6">Select centers from the list above to compare</p>
            <button
              onClick={() => navigate('/ayurveda/panchakarma-centers')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Browse Centers
            </button>
          </div>
        ) : (
          <>
            {/* Badges */}
            {selectedCenters.length > 1 && (
              <div className="flex gap-4 mb-6 flex-wrap">
                {getHighestRated() && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 flex items-center gap-2">
                    <FaTrophy className="text-yellow-500" />
                    <span className="text-sm">
                      <strong>{getHighestRated().name}</strong> — Highest Rated
                    </span>
                  </div>
                )}
                {getBestValue() && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
                    <FaRupeeSign className="text-green-600" />
                    <span className="text-sm">
                      <strong>{getBestValue().name}</strong> — Best Value
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Comparison Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-600 to-green-500">
                    <th className="p-4 text-left text-white font-semibold w-48">Feature</th>
                    {selectedCenters.map(center => (
                      <th key={center._id} className="p-4 text-left text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <FaStar className="text-yellow-300" />
                          </div>
                          <div>
                            <p className="font-semibold">{center.name}</p>
                            <p className="text-xs text-green-100">{center.address?.city}</p>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Rating */}
                  <tr className="border-b">
                    <td className="p-4 font-medium text-gray-700">Rating</td>
                    {selectedCenters.map(center => (
                      <td key={center._id} className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(center.rating)}</div>
                          <span className="font-semibold">{center.rating || 'New'}</span>
                          <span className="text-gray-400 text-sm">({center.totalReviews || 0})</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Type */}
                  <tr className="border-b">
                    <td className="p-4 font-medium text-gray-700">Center Type</td>
                    {selectedCenters.map(center => (
                      <td key={center._id} className="p-4">{center.type || 'Wellness Center'}</td>
                    ))}
                  </tr>

                  {/* Starting Price */}
                  <tr className="border-b bg-green-50">
                    <td className="p-4 font-medium text-gray-700">Starting Price</td>
                    {selectedCenters.map(center => (
                      <td key={center._id} className="p-4">
                        <p className="text-xl font-bold text-green-600">₹{getMinPackagePrice(center).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">per package</p>
                      </td>
                    ))}
                  </tr>

                  {/* Packages */}
                  <tr className="border-b">
                    <td className="p-4 font-medium text-gray-700">Packages</td>
                    {selectedCenters.map(center => (
                      <td key={center._id} className="p-4">
                        <p className="font-semibold">{center.packages?.length || 0} packages</p>
                        <div className="mt-2 space-y-1">
                          {center.packages?.slice(0, 3).map(pkg => (
                            <p key={pkg._id} className="text-xs text-gray-600">
                              • {pkg.name} — {pkg.duration} days
                            </p>
                          ))}
                          {center.packages?.length > 3 && (
                            <p className="text-xs text-green-600">+{center.packages.length - 3} more</p>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Doctors */}
                  <tr className="border-b">
                    <td className="p-4 font-medium text-gray-700">Doctors</td>
                    {selectedCenters.map(center => (
                      <td key={center._id} className="p-4">
                        <span className="flex items-center gap-2">
                          <FaUserMd className="text-green-600" /> {center.doctorCount || 0}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Beds */}
                  <tr className="border-b">
                    <td className="p-4 font-medium text-gray-700">Beds</td>
                    {selectedCenters.map(center => (
                      <td key={center._id} className="p-4">
                        <span className="flex items-center gap-2">
                          <FaBed className="text-green-600" /> {center.bedCount || 'N/A'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Panchakarma Rooms */}
                  <tr className="border-b">
                    <td className="p-4 font-medium text-gray-700">Panchakarma Rooms</td>
                    {selectedCenters.map(center => (
                      <td key={center._id} className="p-4">{center.panchakarmaRooms || 'N/A'}</td>
                    ))}
                  </tr>

                  {/* Facilities */}
                  <tr className="border-b">
                    <td className="p-4 font-medium text-gray-700">Facilities</td>
                    {selectedCenters.map(center => (
                      <td key={center._id} className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {center.facilities?.map((facility, i) => (
                            <span key={i} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                              <FaCheckCircle /> {facility}
                            </span>
                          ))}
                          {(!center.facilities || center.facilities.length === 0) && (
                            <span className="text-gray-400 text-sm">No facilities listed</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Verified */}
                  <tr className="border-b">
                    <td className="p-4 font-medium text-gray-700">Verification</td>
                    {selectedCenters.map(center => (
                      <td key={center._id} className="p-4">
                        {center.verificationStatus === 'approved' || center.isActive ? (
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <FaShieldAlt /> AYUSH Verified
                          </span>
                        ) : (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Action Buttons */}
                  <tr className="border-b bg-gray-50">
                    <td className="p-4 font-medium text-gray-700">Action</td>
                    {selectedCenters.map(center => (
                      <td key={center._id} className="p-4">
                        <div className="space-y-2">
                          <button
                            onClick={() => navigate(`/ayurveda/center/${center._id}`, { state: { center } })}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            View Details
                          </button>
                          {center.packages && center.packages.length > 0 && (
                            <button
                              onClick={() => navigate(`/ayurveda/center/${center._id}/book/${center.packages[0]._id}`, { 
                                state: { center, package: center.packages[0] } 
                              })}
                              className="w-full border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                            >
                              Book Package
                            </button>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompareCenters;