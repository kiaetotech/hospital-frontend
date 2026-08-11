import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPhone, 
  FaPhoneAlt, 
  FaWhatsapp, 
  FaMessage, 
  FaHeart, 
  FaShieldAlt,
  FaClock,
  FaGlobe,
  FaBuilding,
  FaHands,
  FaUsers,
  FaUserMd,
  FaEnvelope,
  FaArrowRight,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaMapMarkerAlt
} from 'react-icons/fa';
import axios from 'axios';

const CrisisHelpline = ({ 
  showImmediate = true,
  onContactHelpline,
  onReportCrisis,
  userLocation
}) => {
  const [activeTab, setActiveTab] = useState('helplines');
  const [expandedHelpline, setExpandedHelpline] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userCrisis, setUserCrisis] = useState(null);
  const [showCrisisForm, setShowCrisisForm] = useState(false);
  const [crisisDetails, setCrisisDetails] = useState({
    type: '',
    description: '',
    severity: 'medium',
    isAnonymous: true,
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const helplines = [
    {
      id: '1',
      name: 'National Mental Health Helpline',
      number: '1800-599-0019',
      alternateNumber: '1800-599-0020',
      whatsapp: null,
      email: 'helpline@nmhh.gov.in',
      website: 'https://nmhh.gov.in',
      description: '24/7 national mental health helpline for all citizens.',
      hours: '24/7',
      languages: ['Hindi', 'English', 'Regional'],
      type: 'government',
      icon: <FaBuilding />
    },
    {
      id: '2',
      name: 'Vandrevala Foundation',
      number: '1800-233-3330',
      alternateNumber: '1800-233-3331',
      whatsapp: null,
      email: 'helpline@vandrevalafoundation.com',
      website: 'https://vandrevalafoundation.com',
      description: '24/7 mental health support for depression, anxiety, and suicide prevention.',
      hours: '24/7',
      languages: ['Hindi', 'English', 'Marathi', 'Gujarati'],
      type: 'ngo',
      icon: <FaHands />
    },
    {
      id: '3',
      name: 'iCall - Tata Institute',
      number: '022-2552-1111',
      alternateNumber: '9152-987-821',
      whatsapp: null,
      email: 'icall@tiss.edu',
      website: 'https://icallhelpline.org',
      description: 'Free, confidential, and professional mental health support.',
      hours: '8 AM - 10 PM, 7 days a week',
      languages: ['Hindi', 'English', 'Marathi', 'Gujarati', 'Kannada'],
      type: 'ngo',
      icon: <FaUsers />
    },
    {
      id: '4',
      name: 'Samaritans Mumbai',
      number: '022-6464-3267',
      alternateNumber: '022-6464-3268',
      whatsapp: null,
      email: 'helpline@samaritansmumbai.com',
      website: 'https://samaritansmumbai.com',
      description: 'Non-judgmental, confidential listening service for those in distress.',
      hours: '5 PM - 11 PM, 7 days a week',
      languages: ['English', 'Hindi', 'Marathi'],
      type: 'ngo',
      icon: <FaHeart />
    },
    {
      id: '5',
      name: 'AASRA',
      number: '022-2754-6669',
      alternateNumber: '022-2754-6668',
      whatsapp: null,
      email: 'aasrahelpline@yahoo.com',
      website: 'https://aasra.info',
      description: 'Suicide prevention helpline offering emotional support.',
      hours: '24/7',
      languages: ['Hindi', 'English', 'Marathi'],
      type: 'ngo',
      icon: <FaHeart />
    },
    {
      id: '6',
      name: 'KIRAN - Ministry of Social Justice',
      number: '1800-599-0019',
      alternateNumber: '1800-599-0020',
      whatsapp: null,
      email: 'kiran@msje.gov.in',
      website: 'https://kiran.gov.in',
      description: 'National mental health helpline by Government of India.',
      hours: '24/7',
      languages: ['Hindi', 'English', '13 Regional Languages'],
      type: 'government',
      icon: <FaBuilding />
    },
    {
      id: '7',
      name: 'Sneha Foundation',
      number: '044-2464-0050',
      alternateNumber: '044-2464-0060',
      whatsapp: null,
      email: 'sneha@vsnl.com',
      website: 'https://snehaindia.org',
      description: 'Emotional support and suicide prevention helpline.',
      hours: '24/7',
      languages: ['Tamil', 'English', 'Hindi'],
      type: 'ngo',
      icon: <FaHands />
    }
  ];

  const crisisTypes = [
    { id: 'suicidal_thoughts', label: 'Suicidal Thoughts', icon: '⚠️', severity: 'critical' },
    { id: 'self_harm', label: 'Self-Harm', icon: '✂️', severity: 'critical' },
    { id: 'panic_attack', label: 'Panic Attack', icon: '😰', severity: 'high' },
    { id: 'severe_anxiety', label: 'Severe Anxiety', icon: '😰', severity: 'high' },
    { id: 'trauma_trigger', label: 'Trauma Trigger', icon: '💔', severity: 'high' },
    { id: 'psychotic_episode', label: 'Psychotic Episode', icon: '🧠', severity: 'critical' },
    { id: 'substance_abuse', label: 'Substance Abuse', icon: '💊', severity: 'high' },
    { id: 'domestic_violence', label: 'Domestic Violence', icon: '🏠', severity: 'critical' },
    { id: 'grief_crisis', label: 'Grief Crisis', icon: '😢', severity: 'medium' },
    { id: 'relationship_crisis', label: 'Relationship Crisis', icon: '💔', severity: 'medium' },
    { id: 'financial_crisis', label: 'Financial Crisis', icon: '💰', severity: 'medium' },
    { id: 'other', label: 'Other Crisis', icon: '📌', severity: 'medium' }
  ];

  const filteredHelplines = helplines.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.languages.some(l => l.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCallHelpline = (number) => {
    window.location.href = `tel:${number}`;
    onContactHelpline?.(number);
  };

  const handleWhatsApp = (number) => {
    if (number) {
      window.open(`https://wa.me/${number.replace(/\s/g, '')}`, '_blank');
    }
  };

  const handleSubmitCrisis = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/mentalhealth/crisis`,
        {
          ...crisisDetails,
          location: userLocation || crisisDetails.location
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setSubmitted(true);
      setUserCrisis(response.data.data);
      onReportCrisis?.(response.data.data);
    } catch (error) {
      alert('Failed to submit crisis report. Please try again or call a helpline.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'low': 'green',
      'medium': 'yellow',
      'high': 'orange',
      'critical': 'red'
    };
    return colors[severity] || 'gray';
  };

  const getTypeIcon = (type) => {
    const found = crisisTypes.find(t => t.id === type);
    return found?.icon || '📌';
  };

  if (submitted && userCrisis) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
      >
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-gray-800">Crisis Reported</h3>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          Your crisis has been reported. Our team will review it shortly.
          {!crisisDetails.isAnonymous && ' We will reach out to you via your registered contact.'}
        </p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Reference ID: <span className="font-mono">{userCrisis._id?.slice(-8)}</span></p>
          <p className="mt-1">Priority: <span className={`font-semibold text-${getSeverityColor(userCrisis.severity)}-600`}>
            {userCrisis.severity?.toUpperCase()}
          </span></p>
        </div>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Report Another Crisis
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white bg-opacity-20 rounded-full">
            <FaPhoneAlt className="text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Crisis Helpline</h2>
            <p className="text-red-100">Immediate support available 24/7</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('helplines')}
          className={`flex-1 py-3 text-center font-medium transition ${
            activeTab === 'helplines'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FaPhone className="inline mr-2" /> Helplines
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 py-3 text-center font-medium transition ${
            activeTab === 'report'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FaShieldAlt className="inline mr-2" /> Report Crisis
        </button>
      </div>

      <div className="p-6">
        {/* Helplines Tab */}
        {activeTab === 'helplines' && (
          <div>
            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search helplines by name, language, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Helplines List */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {filteredHelplines.map((helpline) => (
                <motion.div
                  key={helpline.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          helpline.type === 'government' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {helpline.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{helpline.name}</h4>
                          <p className="text-sm text-gray-500">{helpline.description}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {helpline.languages.slice(0, 3).map((lang) => (
                              <span key={lang} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                {lang}
                              </span>
                            ))}
                            {helpline.languages.length > 3 && (
                              <span className="text-xs text-gray-400">+{helpline.languages.length - 3}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                            <FaClock /> {helpline.hours}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedHelpline(
                          expandedHelpline === helpline.id ? null : helpline.id
                        )}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedHelpline === helpline.id ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedHelpline === helpline.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-gray-100 space-y-3"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <button
                              onClick={() => handleCallHelpline(helpline.number)}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                              <FaPhone /> Call {helpline.number}
                            </button>
                            {helpline.alternateNumber && (
                              <button
                                onClick={() => handleCallHelpline(helpline.alternateNumber)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                              >
                                <FaPhone /> Alt: {helpline.alternateNumber}
                              </button>
                            )}
                            {helpline.whatsapp && (
                              <button
                                onClick={() => handleWhatsApp(helpline.whatsapp)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                              >
                                <FaWhatsapp /> WhatsApp
                              </button>
                            )}
                            {helpline.email && (
                              <button
                                onClick={() => window.location.href = `mailto:${helpline.email}`}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                              >
                                <FaEnvelope /> Email
                              </button>
                            )}
                          </div>
                          {helpline.website && (
                            <button
                              onClick={() => window.open(helpline.website, '_blank')}
                              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                            >
                              Visit Website <FaArrowRight className="text-xs" />
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Report Crisis Tab */}
        {activeTab === 'report' && (
          <div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <span>If you are in immediate danger, please call 100 (Police) or 108 (Emergency) immediately. This form is for non-emergency crisis reporting.</span>
              </p>
            </div>

            <form onSubmit={handleSubmitCrisis} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type of Crisis <span className="text-red-500">*</span>
                </label>
                <select
                  value={crisisDetails.type}
                  onChange={(e) => setCrisisDetails({ 
                    ...crisisDetails, 
                    type: e.target.value,
                    severity: crisisTypes.find(t => t.id === e.target.value)?.severity || 'medium'
                  })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select crisis type...</option>
                  {crisisTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.label} ({type.severity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={crisisDetails.description}
                  onChange={(e) => setCrisisDetails({ ...crisisDetails, description: e.target.value })}
                  required
                  rows={4}
                  placeholder="Please describe your situation in detail..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={crisisDetails.location}
                  onChange={(e) => setCrisisDetails({ ...crisisDetails, location: e.target.value })}
                  placeholder="City, State, or Address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  checked={crisisDetails.isAnonymous}
                  onChange={(e) => setCrisisDetails({ ...crisisDetails, isAnonymous: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <label htmlFor="isAnonymous" className="text-sm text-gray-700">
                  Report Anonymously (Your identity will be hidden)
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Crisis Report'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrisisHelpline;

