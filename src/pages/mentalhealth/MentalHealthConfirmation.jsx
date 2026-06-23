import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  FaCheckCircle, 
  FaCalendarAlt, 
  FaClock, 
  FaUserMd, 
  FaVideo, 
  FaPhone, 
  FaEnvelope,
  FaDownload,
  FaShare,
  FaWhatsapp,
  FaPrint,
  FaArrowLeft,
  FaHome,
  FaThumbsUp,
  FaComments,
  FaCalendarPlus
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';

const MentalHealthConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const bookingId = new URLSearchParams(location.search).get('bookingId');
    if (bookingId) {
      fetchBookingDetails(bookingId);
    } else {
      setError('No booking found');
      setLoading(false);
    }
  }, [location]);

  const fetchBookingDetails = async (bookingId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/mentalhealth/booking/${bookingId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setBooking(response.data.data);
    } catch (err) {
      setError('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    window.open(
      `${process.env.REACT_APP_API_URL}/api/mentalhealth/invoice/${booking?._id}`,
      '_blank'
    );
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `I've booked a therapy session with ${booking?.therapist?.name} on ${format(new Date(booking?.date), 'PPP')}`;
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      email: `mailto:?subject=Therapy Booking&body=${encodeURIComponent(text)}`
    };
    
    window.open(shareUrls[platform], '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800">Booking Not Found</h2>
          <p className="text-gray-600 mt-2">{error || 'Unable to find your booking'}</p>
          <Link to="/mentalhealth" className="mt-4 inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            Browse Therapists
          </Link>
        </div>
      </div>
    );
  }

  const sessionModes = {
    'video': { icon: <FaVideo className="text-blue-500" />, label: 'Video Call' },
    'phone': { icon: <FaPhone className="text-green-500" />, label: 'Phone Call' },
    'in-person': { icon: <FaUserMd className="text-purple-500" />, label: 'In-Person' }
  };

  const sessionMode = sessionModes[booking.mode] || sessionModes['video'];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <FaCheckCircle className="text-5xl text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Booking Confirmed! 🎉</h1>
          <p className="text-gray-600 mt-2">Your therapy session has been successfully booked.</p>
        </motion.div>

        {/* Booking Details Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
            <h2 className="text-white font-semibold text-lg">Booking Details</h2>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Therapist Info */}
            <div className="flex items-start space-x-4">
              {booking.therapist?.profileImage ? (
                <img 
                  src={booking.therapist.profileImage} 
                  alt={booking.therapist.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                  {booking.therapist?.name?.charAt(0) || 'T'}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{booking.therapist?.name}</h3>
                <p className="text-gray-600 text-sm">{booking.therapist?.specialization?.join(', ')}</p>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm text-gray-600 ml-1">{booking.therapist?.averageRating?.toFixed(1) || 'New'}</span>
                  <span className="text-sm text-gray-400 ml-2">({booking.therapist?.totalReviews || 0} reviews)</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Session Date</p>
                <p className="font-medium text-gray-800 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-500" />
                  {format(new Date(booking.date), 'PPP')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Session Time</p>
                <p className="font-medium text-gray-800 flex items-center">
                  <FaClock className="mr-2 text-blue-500" />
                  {booking.timeSlot} ({booking.duration || 60} min)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Session Mode</p>
                <p className="font-medium text-gray-800 flex items-center">
                  {sessionMode.icon}
                  <span className="ml-2">{sessionMode.label}</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="font-medium text-gray-800">₹{booking.amount}</p>
              </div>
            </div>

            {/* Booking ID */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="font-mono text-sm text-gray-800">{booking._id}</p>
            </div>
          </div>
        </motion.div>

        {/* Important Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6"
        >
          <h3 className="font-semibold text-blue-800 mb-3">📋 What to Expect</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              You'll receive a confirmation email and SMS with session details
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              {booking.mode === 'video' ? 'A video call link will be sent 15 mins before the session' : 
               booking.mode === 'phone' ? 'The therapist will call you at the scheduled time' :
               'Please arrive 10 minutes early for your in-person session'}
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              You can reschedule or cancel up to 24 hours before the session
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Your session is confidential and secure
            </li>
          </ul>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
        >
          <Link
            to={`/mentalhealth/journal?bookingId=${booking._id}`}
            className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 transition group"
          >
            <FaComments className="text-2xl text-purple-400 group-hover:text-purple-600 mb-2" />
            <span className="text-sm text-gray-600 group-hover:text-gray-800">Journal</span>
          </Link>
          <Link
            to={`/mentalhealth/screening`}
            className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition group"
          >
            <FaThumbsUp className="text-2xl text-blue-400 group-hover:text-blue-600 mb-2" />
            <span className="text-sm text-gray-600 group-hover:text-gray-800">Check-in</span>
          </Link>
          <button
            onClick={() => navigate(`/mentalhealth/therapist/${booking.therapist?._id}`)}
            className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 transition group"
          >
            <FaUserMd className="text-2xl text-green-400 group-hover:text-green-600 mb-2" />
            <span className="text-sm text-gray-600 group-hover:text-gray-800">View Therapist</span>
          </button>
          <button
            onClick={() => navigate(`/mentalhealth/booking/reschedule/${booking._id}`)}
            className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-300 transition group"
          >
            <FaCalendarPlus className="text-2xl text-orange-400 group-hover:text-orange-600 mb-2" />
            <span className="text-sm text-gray-600 group-hover:text-gray-800">Reschedule</span>
          </button>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3"
        >
          <button
            onClick={handleDownloadInvoice}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <FaDownload /> Download Invoice
          </button>
          
          <button
            onClick={() => handleShare('whatsapp')}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            <FaWhatsapp /> Share
          </button>
          
          <button
            onClick={handlePrint}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            <FaPrint /> Print
          </button>
        </motion.div>

        {/* Navigation */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <Link
            to="/mentalhealth/therapists"
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 transition"
          >
            <FaArrowLeft /> Browse More Therapists
          </Link>
          <Link
            to="/mentalhealth"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition"
          >
            <FaHome /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthConfirmation;