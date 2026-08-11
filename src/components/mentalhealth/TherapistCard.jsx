import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaStar, 
  FaUserMd, 
  FaVideo, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaClock, 
  FaHeart, 
  FaBookmark,
  FaShieldAlt,
  FaCheckCircle,
  FaGraduationCap,
  FaBriefcase
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const TherapistCard = ({ therapist, onBookmark, onFavorite, onBook }) => {
  const {
    _id,
    name,
    profileImage,
    specialization,
    experience,
    consultationFee,
    averageRating,
    totalReviews,
    consultationMode,
    location,
    isVerified,
    isAcceptingPatients,
    bio,
    availability,
    sessionDuration,
    languages
  } = therapist;

  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getModeIcon = (mode) => {
    const icons = {
      'video': <FaVideo className="text-blue-500" />,
      'phone': <FaPhone className="text-green-500" />,
      'in-person': <FaUserMd className="text-purple-500" />,
      'chat': <FaUserMd className="text-orange-500" />
    };
    return icons[mode] || <FaUserMd className="text-gray-400" />;
  };

  const getModeLabel = (mode) => {
    const labels = {
      'video': 'Video',
      'phone': 'Phone',
      'in-person': 'In-Person',
      'chat': 'Chat'
    };
    return labels[mode] || mode;
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark?.(_id);
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onFavorite?.(_id);
  };

  const handleBook = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onBook?.(_id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Profile Image */}
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                  {getInitials(name)}
                </div>
              )}
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white">
                  <FaCheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-800 text-lg">{name}</h3>
                {isAcceptingPatients ? (
                  <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Available
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                    Unavailable
                  </span>
                )}
                {isVerified && (
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FaShieldAlt className="text-xs" /> Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{specialization?.join(', ')}</p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <div className="flex items-center">
                  <FaStar className="text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700 ml-1">
                    {averageRating?.toFixed(1) || 'New'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">({totalReviews || 0} reviews)</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <FaBriefcase className="text-xs" /> {experience} years
                </span>
                {languages?.length > 0 && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <FaGraduationCap className="text-xs" /> {languages.slice(0, 2).join(', ')}
                      {languages.length > 2 && ` +${languages.length - 2}`}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1">
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-full hover:bg-gray-100 transition ${
                isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <FaHeart className={isFavorited ? 'fill-current' : ''} />
            </button>
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full hover:bg-gray-100 transition ${
                isBookmarked ? 'text-purple-500' : 'text-gray-400 hover:text-purple-500'
              }`}
            >
              <FaBookmark className={isBookmarked ? 'fill-current' : ''} />
            </button>
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{bio}</p>
        )}

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* Consultation Modes */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Available Modes</p>
            <div className="flex flex-wrap gap-1">
              {consultationMode?.slice(0, 3).map((mode, index) => (
                <span key={index} className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full border border-gray-200">
                  {getModeIcon(mode)}
                  {getModeLabel(mode)}
                </span>
              ))}
              {consultationMode?.length > 3 && (
                <span className="text-xs text-gray-400">+{consultationMode.length - 3}</span>
              )}
            </div>
          </div>

          {/* Session Details */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Session</p>
            <p className="text-sm text-gray-700">
              {sessionDuration || 60} min • {formatCurrency(consultationFee)}
            </p>
          </div>
        </div>

        {/* Location */}
        {location && (
          <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
            <FaMapMarkerAlt className="text-gray-400" />
            <span>{location.city}, {location.state}</span>
          </div>
        )}

        {/* Availability */}
        {availability?.day && (
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <FaClock className="text-gray-400" />
            <span>Available: {availability.day}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Consultation Fee</p>
            <p className="font-bold text-gray-800">{formatCurrency(consultationFee)}</p>
            <p className="text-xs text-gray-400">per session</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleBook}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition font-medium text-sm flex items-center gap-2"
            >
              Book Now
            </button>
            <Link
              to={`/mentalhealth/therapist/${_id}`}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* Hover Effect - Quick Actions */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 backdrop-blur-sm p-4 border-t border-gray-100 flex justify-center gap-4"
          >
            <button className="text-sm text-gray-600 hover:text-purple-600 transition">
              <FaUserMd className="inline mr-1" /> View Availability
            </button>
            <button className="text-sm text-gray-600 hover:text-blue-600 transition">
              <FaClock className="inline mr-1" /> Quick Book
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TherapistCard;

