import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../services/api';
import {
  FaStar, FaMapMarkerAlt, FaBed, FaBuilding, FaShieldAlt,
  FaUserMd, FaClock, FaCheckCircle, FaTimes, FaChevronRight,
  FaBookmark, FaRegBookmark, FaCalendarCheck, FaSpa,
  FaLeaf, FaUtensils, FaPlane, FaTrain,
  FaArrowLeft, FaStarHalfAlt, FaQuoteLeft,
  FaChevronDown, FaChevronUp, FaMapPin, FaAward,
  FaCheck, FaBan
} from 'react-icons/fa';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'packages', label: 'Packages' },
  { id: 'doctors', label: 'Doctors' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'policies', label: 'Policies' }
];

const PanchakarmaCenterDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [center, setCenter] = useState(location.state?.center || null);
  const [loading, setLoading] = useState(!center);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    fetchCenter();
    try {
      const saved = JSON.parse(localStorage.getItem('savedAyurvedaCenters') || '[]');
      setIsSaved(saved.includes(id));
    } catch {}
  }, [id]);

  const fetchCenter = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/ayurveda/centers/${id}`);
      if (response.data.success) {
        setCenter(response.data.data);
        if (response.data.data.packages?.length > 0) {
          setSelectedPackage(response.data.data.packages[0]);
        }
      } else {
        setError('Center not found');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load center');
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('savedAyurvedaCenters') || '[]');
      const updated = isSaved ? saved.filter(x => x !== id) : [...saved, id];
      localStorage.setItem('savedAyurvedaCenters', JSON.stringify(updated));
      setIsSaved(!isSaved);
    } catch {}
  };

  const handleBookPackage = (pkg) => {
    navigate(`/ayurveda/center/${center._id}/book/${pkg._id}`, {
      state: { center, package: pkg }
    });
  };

  const renderStars = (rating = 0, size = '') => {
    return [1, 2, 3, 4, 5].map(i => {
      if (i <= Math.floor(rating)) return <FaStar key={i} className={`text-yellow-400 ${size}`} />;
      if (i - rating < 1 && i - rating > 0) return <FaStarHalfAlt key={i} className={`text-yellow-400 ${size}`} />;
      return <FaStar key={i} className={`text-gray-300 ${size}`} />;
    });
  };

  const getActivePackages = () => (center?.packages || []).filter(p => p.isActive !== false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !center) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Center Not Found</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate('/ayurveda/panchakarma-centers')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
          >
            Browse Centers
          </button>
        </div>
      </div>
    );
  }

  const packages = getActivePackages();
  const minPrice = packages.length
    ? Math.min(...packages.map(p => p.discountPrice || p.price))
    : 0;
  const hasRating = (center.totalReviews || 0) > 0;
  const isVerified = center.verificationStatus === 'approved';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <div className="relative">
        <div className="h-80 bg-gradient-to-br from-green-700 to-green-500 overflow-hidden">
          {center.coverPhoto ? (
            <img src={center.coverPhoto} alt={center.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaBuilding className="text-white text-9xl opacity-20" />
            </div>
          )}
        </div>

        <div className="absolute top-4 left-4 right-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-white/95 backdrop-blur px-4 py-2 rounded-lg shadow flex items-center gap-2 text-gray-700 hover:bg-white text-sm font-medium"
            >
              <FaArrowLeft /> Back
            </button>
            <button
              onClick={toggleSave}
              className={`bg-white/95 backdrop-blur p-3 rounded-lg shadow hover:bg-white transition ${
                isSaved ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {isSaved ? <FaBookmark /> : <FaRegBookmark />}
            </button>
          </div>
        </div>

        {isVerified && (
          <div className="absolute bottom-4 left-4">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                <FaShieldAlt className="text-green-600 text-sm" />
                <span className="text-xs font-semibold text-green-700">AYUSH Verified</span>
              </div>
            </div>
          </div>
        )}

        {center.photos && center.photos.length > 0 && (
          <div className="absolute bottom-4 right-4">
            <span className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow flex items-center gap-2 text-sm font-medium text-gray-700">
              📷 {center.photos.length} photos
            </span>
          </div>
        )}
      </div>

      {/* CENTER HEADER */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start gap-6 flex-wrap">
            <div className="flex-1 min-w-[280px]">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{center.name}</h1>
              {center.tagline && (
                <p className="text-gray-600 italic mb-2">{center.tagline}</p>
              )}
              <p className="text-gray-500 flex items-center gap-1 mb-3">
                <FaMapMarkerAlt /> {center.address?.area && `${center.address.area}, `}
                {center.address?.city}, {center.address?.state}
                {center.established && (
                  <span className="ml-3 text-gray-400">· Established {center.established}</span>
                )}
              </p>

              <div className="flex items-center gap-5 flex-wrap text-sm">
                {hasRating ? (
                  <span className="flex items-center gap-1.5">
                    <div className="flex">{renderStars(center.rating)}</div>
                    <span className="font-semibold text-gray-700">{center.rating.toFixed(1)}</span>
                    <span className="text-gray-400">({center.totalReviews} reviews)</span>
                  </span>
                ) : (
                  <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">New Center</span>
                )}

                {center.bedCount > 0 && (
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <FaBed /> {center.bedCount} Beds
                  </span>
                )}
                {center.doctorCount > 0 && (
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <FaUserMd /> {center.doctorCount} Doctors
                  </span>
                )}
                {center.panchakarmaRooms > 0 && (
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <FaSpa /> {center.panchakarmaRooms} Therapy Rooms
                  </span>
                )}
              </div>

              {(center.distanceFromAirport || center.distanceFromRailway) && (
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  {center.distanceFromAirport && (
                    <span className="flex items-center gap-1">
                      <FaPlane /> {center.distanceFromAirport} km from airport
                    </span>
                  )}
                  {center.distanceFromRailway && (
                    <span className="flex items-center gap-1">
                      <FaTrain /> {center.distanceFromRailway} km from railway
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="text-right">
              {packages.length > 0 && (
                <>
                  <p className="text-sm text-gray-500">Starting from</p>
                  <p className="text-3xl font-bold text-green-600">₹{minPrice.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mb-3">per program</p>
                </>
              )}
              {packages.length > 0 && (
                <button
                  onClick={() => handleBookPackage(selectedPackage || packages[0])}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 text-sm shadow-sm"
                >
                  Book Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PHOTO GALLERY */}
      {center.photos && center.photos.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Photo Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {center.photos.slice(0, 8).map((photo, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 cursor-pointer transition"
                  onClick={() => window.open(photo, '_blank')}
                >
                  <img
                    src={photo}
                    alt={`${center.name} - ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 font-medium text-sm border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN */}
          <div className="lg:col-span-2 space-y-6">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                {center.description && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">About {center.name}</h2>
                    <p className="text-gray-600 whitespace-pre-line">{center.description}</p>
                  </div>
                )}

                {/* Location & Directions */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Location & Directions</h2>
                  <div className="flex items-start gap-3 mb-4">
                    <FaMapMarkerAlt className="text-green-600 text-lg mt-1 flex-shrink-0" />
                    <div className="text-gray-700">
                      <p className="font-medium">{center.name}</p>
                      {center.address?.street && <p>{center.address.street}</p>}
                      {center.address?.area && <p>{center.address.area}</p>}
                      <p>
                        {center.address?.city}, {center.address?.state}
                        {center.address?.pincode && ` - ${center.address.pincode}`}
                      </p>
                    </div>
                  </div>

                  {(center.nearestAirport || center.nearestRailway) && (
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 flex-wrap">
                      {center.nearestAirport && (
                        <span className="flex items-center gap-1.5">
                          <FaPlane className="text-green-600" />
                          {center.nearestAirport}
                          {center.distanceFromAirport && ` (${center.distanceFromAirport} km)`}
                        </span>
                      )}
                      {center.nearestRailway && (
                        <span className="flex items-center gap-1.5">
                          <FaTrain className="text-green-600" />
                          {center.nearestRailway}
                          {center.distanceFromRailway && ` (${center.distanceFromRailway} km)`}
                        </span>
                      )}
                    </div>
                  )}

                  {center.googleMapsUrl && (
                    <a
                      href={center.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 text-sm"
                    >
                      <FaMapPin /> Open in Google Maps
                    </a>
                  )}
                </div>

                {center.facilities?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Facilities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {center.facilities.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-gray-700">
                          <FaCheckCircle className="text-green-600 flex-shrink-0" /> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {center.accreditations?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Accreditations</h2>
                    <div className="space-y-3">
                      {center.accreditations.map((a, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                          <FaAward className="text-green-600 text-xl mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-800">{a.name}</p>
                            {a.number && <p className="text-xs text-gray-500">No: {a.number}</p>}
                            {a.issuedBy && <p className="text-xs text-gray-500">Issued by: {a.issuedBy}</p>}
                          </div>
                          {a.verified && (
                            <span className="ml-auto text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Verified</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!center.description && center.facilities?.length === 0 && !center.accreditations?.length && (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <FaBuilding className="text-5xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Center is updating their profile. Check back soon.</p>
                  </div>
                )}
              </>
            )}

            {/* PACKAGES TAB */}
            {activeTab === 'packages' && (
              <>
                {packages.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <FaSpa className="text-5xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No packages available</h3>
                    <p className="text-gray-500 text-sm">Check back later or contact the center directly.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {packages.map(pkg => {
                      const hasDiscount = pkg.discountPrice && pkg.discountPrice < pkg.price;
                      const slotsLeft = pkg.maxCapacity
                        ? pkg.maxCapacity - (pkg.currentBookings || 0)
                        : null;
                      const isSoldOut = slotsLeft !== null && slotsLeft <= 0;

                      return (
                        <div key={pkg._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                          <div className="flex justify-between items-start gap-4 flex-wrap mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-800">{pkg.name}</h3>
                              {pkg.shortDescription && (
                                <p className="text-sm text-gray-500 mt-1">{pkg.shortDescription}</p>
                              )}
                            </div>
                            {hasDiscount && (
                              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                                {Math.round((1 - pkg.discountPrice / pkg.price) * 100)}% OFF
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 flex-wrap">
                            <span className="flex items-center gap-1"><FaClock /> {pkg.duration} Days</span>
                            {slotsLeft !== null && (
                              <span className={`flex items-center gap-1 ${isSoldOut ? 'text-red-600' : slotsLeft <= 5 ? 'text-orange-600' : 'text-gray-600'}`}>
                                <FaCheckCircle /> {isSoldOut ? 'Sold Out' : `${slotsLeft} slots left`}
                              </span>
                            )}
                          </div>

                          {pkg.inclusions?.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-semibold text-gray-500 mb-2">INCLUDED</p>
                              <div className="grid grid-cols-2 gap-1.5">
                                {pkg.inclusions.map((inc, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-sm text-gray-700">
                                    <FaCheck className="text-green-600 text-xs" /> {inc}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {pkg.exclusions?.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-semibold text-gray-500 mb-2">NOT INCLUDED</p>
                              <div className="grid grid-cols-2 gap-1.5">
                                {pkg.exclusions.map((exc, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <FaBan className="text-gray-400 text-xs" /> {exc}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {pkg.therapies?.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-semibold text-gray-500 mb-2">THERAPIES</p>
                              <div className="flex flex-wrap gap-1.5">
                                {pkg.therapies.map((t, i) => (
                                  <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {pkg.programSchedule?.length > 0 && (
                            <div className="mb-4 border-t pt-4">
                              <button
                                onClick={() => setExpandedDay(expandedDay === pkg._id ? null : pkg._id)}
                                className="text-green-600 font-medium text-sm flex items-center gap-1"
                              >
                                {expandedDay === pkg._id ? 'Hide' : 'View'} day-by-day program
                                {expandedDay === pkg._id ? <FaChevronUp /> : <FaChevronDown />}
                              </button>
                              {expandedDay === pkg._id && (
                                <div className="mt-3 space-y-3">
                                  {pkg.programSchedule.map((day, i) => (
                                    <div key={i} className="flex gap-3">
                                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-green-700">
                                        {day.day}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-800">{day.title}</p>
                                        {day.description && (
                                          <p className="text-sm text-gray-500">{day.description}</p>
                                        )}
                                        {day.therapies?.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {day.therapies.map((t, j) => (
                                              <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                {t}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex justify-between items-center border-t pt-4">
                            <div>
                              {hasDiscount ? (
                                <>
                                  <p className="text-2xl font-bold text-green-600">₹{pkg.discountPrice.toLocaleString()}</p>
                                  <p className="text-sm text-gray-400 line-through">₹{pkg.price.toLocaleString()}</p>
                                </>
                              ) : (
                                <p className="text-2xl font-bold text-green-600">₹{pkg.price.toLocaleString()}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleBookPackage(pkg)}
                              disabled={isSoldOut}
                              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {isSoldOut ? 'Sold Out' : 'Book Now'} <FaChevronRight />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* DOCTORS TAB */}
            {activeTab === 'doctors' && (
              <>
                {(!center.doctors || center.doctors.length === 0) ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <FaUserMd className="text-5xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No doctors listed</h3>
                    <p className="text-gray-500 text-sm">Contact the center for doctor details.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {center.doctors.map(doc => (
                      <div key={doc._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex gap-4 flex-wrap">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                            {doc.name?.charAt(0) || 'D'}
                          </div>
                          <div className="flex-1 min-w-[200px]">
                            <h3 className="text-lg font-bold text-gray-800">{doc.name}</h3>
                            <p className="text-green-600 font-medium text-sm">{doc.specialization}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 flex-wrap">
                              {doc.experience && <span>{doc.experience} years experience</span>}
                              {doc.rating > 0 && (
                                <span className="flex items-center gap-1">
                                  <FaStar className="text-yellow-400" /> {doc.rating} ({doc.totalReviews || 0})
                                </span>
                              )}
                              {doc.consultationFee && (
                                <span className="font-semibold text-gray-800">₹{doc.consultationFee} / consult</span>
                              )}
                            </div>
                            {doc.education && (
                              <p className="text-xs text-gray-500 mt-2">{doc.education}</p>
                            )}
                            {doc.languages?.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                Languages: {doc.languages.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                        {doc.about && (
                          <p className="text-sm text-gray-600 mt-3 pl-20">{doc.about}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <>
                {(!center.reviews || center.reviews.length === 0) ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <FaQuoteLeft className="text-5xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No reviews yet</h3>
                    <p className="text-gray-500 text-sm">Be the first to review after your stay.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hasRating && center.ratingBreakdown && (
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-6 flex-wrap">
                          <div className="text-center">
                            <p className="text-5xl font-bold text-green-600">{center.rating.toFixed(1)}</p>
                            <div className="flex justify-center mt-1">{renderStars(center.rating)}</div>
                            <p className="text-sm text-gray-500 mt-1">{center.totalReviews} reviews</p>
                          </div>
                          <div className="flex-1 min-w-[200px] space-y-2">
                            {[
                              { key: 'treatment', label: 'Treatment' },
                              { key: 'accommodation', label: 'Accommodation' },
                              { key: 'food', label: 'Food' },
                              { key: 'staff', label: 'Staff' }
                            ].map(cat => {
                              const val = center.ratingBreakdown[cat.key] || 0;
                              return (
                                <div key={cat.key} className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600 w-28">{cat.label}</span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-green-600 h-full rounded-full"
                                      style={{ width: `${(val / 5) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700 w-8">{val.toFixed(1)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {center.reviews.map((review, i) => (
                      <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-semibold text-green-700">
                              {review.patientName?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{review.patientName || 'Patient'}</p>
                              {review.verified && (
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                  <FaCheckCircle /> Verified Visit
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <p className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {review.packageName && (
                          <p className="text-xs text-gray-500 mb-2">Package: {review.packageName}</p>
                        )}
                        <p className="text-gray-700">{review.review}</p>
                        {review.providerResponse?.text && (
                          <div className="mt-4 pl-4 border-l-4 border-green-200 bg-green-50 p-3 rounded">
                            <p className="text-xs font-semibold text-green-700 mb-1">Response from {center.name}</p>
                            <p className="text-sm text-gray-700">{review.providerResponse.text}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* POLICIES TAB */}
            {activeTab === 'policies' && (
              <div className="space-y-4">
                {center.policies?.cancellation && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Cancellation Policy</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <strong>Free cancellation:</strong> Up to {center.policies.cancellation.freeUntilDays || 7} days before check-in
                      </p>
                      {center.policies.cancellation.partialRefundUntilDays && (
                        <p>
                          <strong>{center.policies.cancellation.partialRefundPercent || 50}% refund:</strong> Up to {center.policies.cancellation.partialRefundUntilDays} days before check-in
                        </p>
                      )}
                      <p>
                        <strong>No refund:</strong> Within {center.policies.cancellation.noRefundAfterDays || 2} days of check-in
                      </p>
                    </div>
                  </div>
                )}

                {center.policies?.checkInTime && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Check-in / Check-out</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Check-in</p>
                        <p className="font-medium">{center.policies.checkInTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Check-out</p>
                        <p className="font-medium">{center.policies.checkOutTime}</p>
                      </div>
                    </div>
                  </div>
                )}

                {center.policies?.medicalEligibility?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Medical Eligibility</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {center.policies.medicalEligibility.map((m, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" /> {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {center.policies?.companionPolicy && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Companion Policy</h3>
                    <p className="text-sm text-gray-700">{center.policies.companionPolicy}</p>
                  </div>
                )}

                {!center.policies && (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <p className="text-gray-500">No policy information available.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Booking</h3>
              {packages.length > 0 ? (
                <>
                  <select
                    value={selectedPackage?._id || ''}
                    onChange={e => setSelectedPackage(packages.find(p => p._id === e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 focus:ring-2 focus:ring-green-500"
                  >
                    {packages.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} · {p.duration}d · ₹{(p.discountPrice || p.price).toLocaleString()}
                      </option>
                    ))}
                  </select>

                  {selectedPackage && (
                    <>
                      <div className="bg-green-50 rounded-lg p-3 mb-3">
                        <p className="text-xs text-gray-600 mb-1">Selected package</p>
                        <p className="font-semibold text-gray-800">{selectedPackage.name}</p>
                        <p className="text-sm text-gray-600">{selectedPackage.duration} days</p>
                        <p className="text-xl font-bold text-green-600 mt-2">
                          ₹{(selectedPackage.discountPrice || selectedPackage.price).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => handleBookPackage(selectedPackage)}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 mb-2"
                      >
                        Book This Package
                      </button>
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No packages available</p>
              )}

              <div className="mt-4 pt-4 border-t space-y-2 text-xs text-gray-500">
                <p className="flex items-center gap-2">
                  <FaShieldAlt className="text-green-600" /> Secure booking
                </p>
                <p className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-600" /> Free cancellation available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanchakarmaCenterDetail;