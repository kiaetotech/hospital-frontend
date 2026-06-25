// D:\hospital-frontend\src\pages\HomePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaHospital, FaAmbulance, FaShieldAlt, FaLeaf, FaSpa, 
  FaUserMd, FaMoneyBillWave, FaVideo, FaBuilding, FaFlask,
  FaBrain, FaSearch, FaPhoneAlt, FaUser, FaUserTie, FaLock,
  FaBars, FaTimes, FaChevronDown, FaStar, FaArrowRight,
  FaHeart, FaHands, FaSmile, FaUsers, FaQuoteLeft,
  FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube,
  FaApple, FaGooglePlay, FaMapMarkerAlt, FaEnvelope, FaPhone,
  FaClock, FaThumbsUp, FaAward, FaBookOpen,
  FaNewspaper, FaCalendarAlt, FaChevronRight, FaGlobe,
  FaArrowLeft, FaArrowRight as FaArrowRightIcon
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    const providerToken = localStorage.getItem('providerToken');
    const role = localStorage.getItem('userRole');
    
    if (token || adminToken || providerToken) {
      setIsLoggedIn(true);
      setUserRole(role || 'patient');
    }

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&loc=${encodeURIComponent(location)}`);
    }
  };

  const services = [
    { id: 'hospitals', icon: <FaHospital />, label: 'Hospitals', desc: '1,200+ Providers', color: 'blue', path: '/hospitals', badge: null },
    { id: 'ambulance', icon: <FaAmbulance />, label: 'Ambulance', desc: '500+ Vehicles', color: 'orange', path: '/ambulance', badge: 'Live Tracking' },
    { id: 'insurance', icon: <FaShieldAlt />, label: 'Health Insurance', desc: 'Compare & Buy', color: 'green', path: '/insurance', badge: '⭐ Trusted' },
    { id: 'homeopathy', icon: <FaLeaf />, label: 'Homeopathy', desc: '300+ Doctors', color: 'emerald', path: '/homeopathy', badge: 'NEW' },
    { id: 'ayurveda', icon: <FaSpa />, label: 'Ayurveda', desc: '450+ Doctors', color: 'purple', path: '/ayurveda', badge: 'NEW' },
    { id: 'caregiver', icon: <FaUserMd />, label: 'Caregiver', desc: '200+ Providers', color: 'pink', path: '/caregivers', badge: null },
    { id: 'emi', icon: <FaMoneyBillWave />, label: 'Health EMI', desc: '0% EMI', color: 'indigo', path: '/financing', badge: null },
    { id: 'online', icon: <FaVideo />, label: 'Online Doctor', desc: '24/7 Consult', color: 'teal', path: '/teleconsult', badge: null },
    { id: 'corporate', icon: <FaBuilding />, label: 'Corporate Health', desc: 'For 50+ Employees', color: 'slate', path: '/corporate', badge: 'LIVE' },
    { id: 'diagnostics', icon: <FaFlask />, label: 'Diagnostics', desc: '1,000+ Tests', color: 'cyan', path: '/diagnostics', badge: null },
    { id: 'mentalhealth', icon: <FaBrain />, label: 'Mental Health', desc: '150+ Therapists', color: 'violet', path: '/mentalhealth', badge: 'NEW' }
  ];

  const testimonials = [
    {
      name: 'Rajesh K.',
      location: 'Mumbai',
      rating: 5,
      text: 'Found the best hospital for my mother\'s surgery within minutes. The platform is a lifesaver!',
      icon: '👨‍💼'
    },
    {
      name: 'Priya M.',
      location: 'Delhi',
      rating: 5,
      text: 'Ambulance arrived in 5 minutes during emergency. The tracking feature gave us peace of mind.',
      icon: '👩‍💼'
    },
    {
      name: 'Aditya S.',
      location: 'Bangalore',
      rating: 5,
      text: 'Mental health counseling changed my life. I found the perfect therapist through this platform.',
      icon: '👨‍💻'
    },
    {
      name: 'Sunita R.',
      location: 'Pune',
      rating: 5,
      text: 'The health insurance comparison saved me ₹15,000 on my family policy. Highly recommended!',
      icon: '👩‍🏫'
    },
    {
      name: 'Vikram P.',
      location: 'Hyderabad',
      rating: 5,
      text: 'Booked a full body checkup for my parents. The process was smooth and results were quick.',
      icon: '👨‍💼'
    }
  ];

  const providerRoles = [
    { icon: '🧠', label: 'Therapist', path: '/mentalhealth/therapist/login' },
    { icon: '🏥', label: 'Hospital', path: '/hospital/login' },
    { icon: '🚑', label: 'Ambulance', path: '/ambulance/login' },
    { icon: '🏠', label: 'Caregiver', path: '/caregiver/login' },
    { icon: '🔬', label: 'Diagnostics Lab', path: '/diagnostics/login' },
    { icon: '💰', label: 'Lender', path: '/lender/login' },
    { icon: '🛡️', label: 'Insurance', path: '/insurance/company/login' },
    { icon: '🧘', label: 'Ayurveda Doctor', path: '/ayurveda/doctor/login' },
    { icon: '🌿', label: 'Homeopathy Doctor', path: '/homeopathy/doctor/login' },
    { icon: '🏢', label: 'Corporate HR', path: '/corporate/hr/login' }
  ];

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services', dropdown: true },
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Contact', path: '/contact' }
  ];

  const getColorClass = (color) => {
    const colors = {
      blue: 'text-blue-500 bg-blue-50 hover:bg-blue-100',
      orange: 'text-orange-500 bg-orange-50 hover:bg-orange-100',
      green: 'text-green-500 bg-green-50 hover:bg-green-100',
      emerald: 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100',
      purple: 'text-purple-500 bg-purple-50 hover:bg-purple-100',
      pink: 'text-pink-500 bg-pink-50 hover:bg-pink-100',
      indigo: 'text-indigo-500 bg-indigo-50 hover:bg-indigo-100',
      teal: 'text-teal-500 bg-teal-50 hover:bg-teal-100',
      slate: 'text-slate-500 bg-slate-50 hover:bg-slate-100',
      cyan: 'text-cyan-500 bg-cyan-50 hover:bg-cyan-100',
      violet: 'text-violet-500 bg-violet-50 hover:bg-violet-100'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============================================
          NAVIGATION BAR
      ============================================ */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div 
                onClick={() => navigate('/')} 
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  HealthCare Hub
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium text-sm transition">Home</Link>

              <div 
                className="relative"
                onMouseEnter={() => setShowServicesDropdown(true)}
                onMouseLeave={() => setShowServicesDropdown(false)}
              >
                <button className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium text-sm transition">
                  Services <FaChevronDown className="text-xs" />
                </button>
                {showServicesDropdown && (
                  <div className="absolute top-full left-0 mt-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                    {services.map((service) => (
                      <Link
                        key={service.id}
                        to={service.path}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition text-sm"
                      >
                        <span className={`text-${service.color}-500`}>{service.icon}</span>
                        <span>{service.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium text-sm transition">About</Link>
              <Link to="/blog" className="text-gray-700 hover:text-blue-600 font-medium text-sm transition">Blog</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium text-sm transition">Contact</Link>

              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                />
                <button 
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition"
                >
                  <FaSearch className="text-sm" />
                </button>
              </form>

              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
              >
                <FaUser /> Patient Login
              </Link>

              <div 
                className="relative"
                onMouseEnter={() => setShowProviderDropdown(true)}
                onMouseLeave={() => setShowProviderDropdown(false)}
              >
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
                  <FaUserTie /> Provider Login <FaChevronDown className="text-xs" />
                </button>
                {showProviderDropdown && (
                  <div className="absolute top-full right-0 mt-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                    <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                      Select Your Role
                    </p>
                    {providerRoles.map((role) => (
                      <Link
                        key={role.path}
                        to={role.path}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition text-sm"
                      >
                        <span>{role.icon}</span>
                        <span>{role.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/admin/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <FaLock /> Admin
              </Link>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                <Link to="/" className="block text-gray-700 hover:text-blue-600 font-medium">Home</Link>
                <div className="space-y-1">
                  <p className="text-gray-500 text-sm font-medium">Services</p>
                  {services.map((service) => (
                    <Link
                      key={service.id}
                      to={service.path}
                      className="block text-sm text-gray-600 hover:text-blue-600 pl-4 py-1"
                    >
                      {service.icon} {service.label}
                    </Link>
                  ))}
                </div>
                <Link to="/about" className="block text-gray-700 hover:text-blue-600 font-medium">About</Link>
                <Link to="/blog" className="block text-gray-700 hover:text-blue-600 font-medium">Blog</Link>
                <Link to="/contact" className="block text-gray-700 hover:text-blue-600 font-medium">Contact</Link>
                
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <Link to="/login" className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                    👤 Patient Login
                  </Link>
                  <div className="space-y-1">
                    <p className="text-gray-500 text-sm font-medium">Provider Login:</p>
                    {providerRoles.map((role) => (
                      <Link
                        key={role.path}
                        to={role.path}
                        className="block text-sm text-gray-600 hover:text-purple-600 pl-4 py-1"
                      >
                        {role.icon} {role.label}
                      </Link>
                    ))}
                  </div>
                  <Link to="/admin/login" className="block w-full text-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium">
                    🔑 Admin Login
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ============================================
          HERO BANNER
      ============================================ */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="bg-red-500 text-white text-xs font-bold px-4 py-1 rounded-full animate-pulse">
                🚨 Emergency?
              </span>
              <span className="text-white/80 text-sm">Need Help Now?</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-3">
              Your Health, Our Priority
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-6">
              India's Most Trusted Healthcare Marketplace
            </p>

            <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center bg-white rounded-lg overflow-hidden">
                <FaSearch className="text-gray-400 ml-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for Hospitals, Doctors, Services, Tests..."
                  className="w-full px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none"
                />
              </div>
              <div className="flex-1 flex items-center bg-white rounded-lg overflow-hidden">
                <FaMapMarkerAlt className="text-gray-400 ml-4" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter Location"
                  className="w-full px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <FaSearch /> Find Help Now
              </button>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mt-8">
              <div 
                onClick={() => navigate('/emergency-search')}
                className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl px-4 py-3 cursor-pointer transition"
              >
                <FaPhoneAlt className="text-red-400" />
                <span className="text-sm font-medium">🚨 Emergency</span>
              </div>
              <div 
                onClick={() => navigate('/my-bookings')}
                className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl px-4 py-3 cursor-pointer transition"
              >
                <FaCalendarAlt className="text-blue-300" />
                <span className="text-sm font-medium">📋 Book Now</span>
              </div>
              <div 
                onClick={() => navigate('/diagnostics')}
                className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl px-4 py-3 cursor-pointer transition"
              >
                <FaFlask className="text-green-300" />
                <span className="text-sm font-medium">💊 Lab Tests</span>
              </div>
              <div 
                onClick={() => navigate('/mentalhealth/crisis')}
                className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl px-4 py-3 cursor-pointer transition"
              >
                <FaHeart className="text-pink-300" />
                <span className="text-sm font-medium">📞 24/7 Helpline</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          SERVICES GRID
      ============================================ */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">💡 Choose Your Healthcare Service</h2>
          <p className="text-gray-500 mt-2">Compare, choose, book – all in minutes</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(service.path)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 text-center cursor-pointer border border-gray-100 group"
            >
              <div className={`text-3xl mb-2 ${service.color}-500 group-hover:scale-110 transition`}>
                {service.icon}
              </div>
              <h3 className="font-semibold text-sm text-gray-800">{service.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{service.desc}</p>
              {service.badge && (
                <span className={`text-xs inline-block mt-2 px-2 py-0.5 rounded-full ${
                  service.badge === 'NEW' ? 'bg-green-100 text-green-600' :
                  service.badge === '⭐ Trusted' ? 'bg-yellow-100 text-yellow-600' :
                  service.badge === 'Live Tracking' ? 'bg-blue-100 text-blue-600' :
                  service.badge === 'LIVE' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {service.badge}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================
          WHY CHOOSE US
      ============================================ */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">🌟 Why Choose HealthCare Hub?</h2>
            <p className="text-gray-500 mt-2">Trusted by millions of Indians</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <FaShieldAlt className="text-blue-600 text-3xl" />, title: 'Verified Providers', desc: 'Trusted healthcare partners with verified credentials' },
              { icon: <FaThumbsUp className="text-green-600 text-3xl" />, title: 'Best Price', desc: 'Compare and save money on healthcare services' },
              { icon: <FaClock className="text-purple-600 text-3xl" />, title: '24/7 Service', desc: 'Emergency support available around the clock' },
              { icon: <FaUsers className="text-orange-600 text-3xl" />, title: 'Easy Booking', desc: 'Book appointments in 60 seconds' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition"
              >
                <div className="flex justify-center mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          HEALTH INSIGHTS
      ============================================ */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">📰 Health Insights</h2>
            <p className="text-gray-500 mt-1">Expert articles to keep you informed</p>
          </div>
          <Link to="/blog" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View All <FaArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: '12 Coronavirus Myths and Facts', category: 'Coronavirus', author: 'Dr. Diana Borgio', image: '🦠' },
            { title: 'Eating Right to Build Immunity', category: 'Vitamins & Supplements', author: 'Dr. Diana Borgio', image: '🥗' },
            { title: 'Mental Health in the Digital Age', category: 'Mental Health', author: 'Dr. Sarah Johnson', image: '🧠' }
          ].map((article, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 cursor-pointer"
              onClick={() => navigate('/blog')}
            >
              <div className="h-40 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-6xl">
                {article.image}
              </div>
              <div className="p-5">
                <span className="text-xs text-blue-600 font-medium">{article.category}</span>
                <h3 className="font-bold text-gray-800 mt-2 mb-1">{article.title}</h3>
                <p className="text-xs text-gray-500">By {article.author}</p>
                <Link to="/blog" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mt-3">
                  Read More <FaArrowRight />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS
      ============================================ */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">💬 What Our Users Say</h2>
          <p className="text-white/80 mb-8">Real stories from real people</p>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
              >
                <div className="flex justify-center text-yellow-400 text-2xl mb-4">
                  {'⭐'.repeat(testimonials[currentTestimonial].rating)}
                </div>
                <p className="text-white text-lg md:text-xl mb-4">
                  "{testimonials[currentTestimonial].text}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">{testimonials[currentTestimonial].icon}</span>
                  <div className="text-left">
                    <p className="text-white font-bold">{testimonials[currentTestimonial].name}</p>
                    <p className="text-white/70 text-sm">{testimonials[currentTestimonial].location}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    index === currentTestimonial ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          APP DOWNLOAD
      ============================================ */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">📱 Download Our App</h2>
              <p className="text-gray-500 mt-2">
                Get the HealthCare Hub App. Book appointments, track health, get reminders, and more.
              </p>
              <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                <button className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition">
                  <FaApple className="text-2xl" />
                  <div className="text-left">
                    <p className="text-xs">Download on</p>
                    <p className="font-bold">App Store</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition">
                  <FaGooglePlay className="text-2xl" />
                  <div className="text-left">
                    <p className="text-xs">Get it on</p>
                    <p className="font-bold">Google Play</p>
                  </div>
                </button>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-7xl border-4 border-gray-200">
                📱
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER
      ============================================ */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-xl font-bold text-white">🏥 HealthCare Hub</h3>
              <p className="text-gray-400 text-sm mt-2">
                India's Most Trusted Healthcare Marketplace
              </p>
              <p className="text-gray-500 text-xs mt-4">© 2024 All Rights Reserved</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">For Patients</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/hospitals" className="hover:text-white transition">Find Doctors</Link></li>
                <li><Link to="/diagnostics" className="hover:text-white transition">Book Tests</Link></li>
                <li><Link to="/emergency-search" className="hover:text-white transition">Emergency</Link></li>
                <li><Link to="/my-bookings" className="hover:text-white transition">My Bookings</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">For Providers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/provider/choose-role" className="hover:text-white transition">Register</Link></li>
                <li><Link to="/provider/login" className="hover:text-white transition">Login</Link></li>
                <li><Link to="/provider/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">About Us</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-white transition">Our Story</Link></li>
                <li><Link to="/about#vision" className="hover:text-white transition">Vision & Mission</Link></li>
                <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-white transition">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Contact Us</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><FaPhone /> +91-XXXXXXXXXX</li>
                <li className="flex items-center gap-2"><FaEnvelope /> support@healthcarehub.com</li>
                <li className="flex items-center gap-2"><FaMapMarkerAlt /> Mumbai, India</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition"><FaFacebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><FaTwitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><FaInstagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><FaLinkedin size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><FaYoutube size={20} /></a>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition">Terms & Conditions</Link>
              <Link to="/refund" className="hover:text-white transition">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;