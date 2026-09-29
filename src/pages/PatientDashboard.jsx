import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { getPatientProfile } from '../services/api';
import {
  FaSearch, FaMapMarkerAlt, FaBell, FaUser,
  FaAmbulance, FaUserMd, FaHospital, FaFlask,
  FaLeaf, FaSeedling, FaBrain, FaHome,
  FaShieldAlt, FaCreditCard, FaBuilding, FaUtensils,
  FaCalendarAlt, FaUserCircle, FaUsers, FaFileAlt,
  FaHeartbeat, FaWallet, FaStar, FaBookmark, FaBalanceScale,
  FaIdCard, FaChevronRight, FaLock
} from 'react-icons/fa';

// ============================================
// SERVICE CARDS (11 total)
// ============================================
const SERVICE_CARDS = [
  { icon: FaHospital,   name: 'Find Hospitals',          desc: 'Search verified hospitals near you',       route: '/hospitals',     color: '#2563eb', bg: '#eff6ff' },
  { icon: FaAmbulance,  name: 'Book Ambulance',          desc: 'Emergency & scheduled transport',          route: '/ambulance',     color: '#dc2626', bg: '#fef2f2', badge: '24/7' },
  { icon: FaUserMd,     name: 'Online Doctor',           desc: 'Video consults with MBBS/MD',              route: '/online-doctor', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: FaFlask,      name: 'Lab Tests & Diagnostics', desc: 'Book tests, home collection',              route: '/diagnostics',   color: '#059669', bg: '#ecfdf5' },
  { icon: FaLeaf,       name: 'Ayurveda & Wellness',     desc: 'Panchakarma, doctors, products',           route: '/ayurveda',      color: '#059669', bg: '#ecfdf5' },
  { icon: FaSeedling,   name: 'Homeopathy Care',         desc: 'Consult homeopaths, order remedies',       route: '/homeopathy',    color: '#7c3aed', bg: '#f5f3ff' },
  { icon: FaBrain,      name: 'Mental Wellness',         desc: 'Therapists, screening, chat',              route: '/mentalhealth',  color: '#0891b2', bg: '#ecfeff' },
  { icon: FaHome,       name: 'Home Care / Caregiver',   desc: 'Trained caregivers at home',               route: '/caregivers',    color: '#ea580c', bg: '#fff7ed' },
  { icon: FaShieldAlt,  name: 'Health Insurance',        desc: 'Compare & buy health plans',               route: '/insurance',     color: '#2563eb', bg: '#eff6ff' },
  { icon: FaCreditCard, name: 'Health EMI / Loan',       desc: '0% EMI on treatments',                     route: '/financing',     color: '#7c3aed', bg: '#f5f3ff' },
  { icon: FaBuilding,   name: 'Corporate Health',        desc: 'Employee wellness programs',                route: '/corporate',     color: '#059669', bg: '#ecfdf5' },
  { icon: FaUtensils,   name: 'DietCare',                desc: 'Personalized Indian meal planning',         route: '/dietcare',      color: '#ea580c', bg: '#fff7ed', badge: 'Soon', disabled: true }
];

// ============================================
// QUICK ACTIONS
// ============================================
const QUICK_ACTIONS = [
  { icon: FaAmbulance, label: 'Emergency\nAmbulance', route: '/ambulance/emergency', color: '#dc2626', bg: '#fef2f2', highlight: true },
  { icon: FaUserMd,    label: 'Find\nDoctor',         route: '/online-doctor',       color: '#7c3aed', bg: '#f5f3ff' },
  { icon: FaHospital,  label: 'Find\nHospitals',      route: '/hospitals',           color: '#2563eb', bg: '#eff6ff' },
  { icon: FaFlask,     label: 'Lab\nTests',           route: '/diagnostics',         color: '#059669', bg: '#ecfdf5' }
];

// ============================================
// RECOMMENDED PILLS
// ============================================
const RECOMMENDED_PILLS = [
  { label: 'Hospitals',     route: '/hospitals' },
  { label: 'Doctors',       route: '/online-doctor' },
  { label: 'Diagnostics',   route: '/diagnostics' },
  { label: 'Home Care',     route: '/caregivers' },
  { label: 'DietCare',      route: '/dietcare', disabled: true }
];

// ============================================
// MAIN
// ============================================
const PatientDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [allBookings, setAllBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [insuranceCount, setInsuranceCount] = useState(0);
  const [loanCount, setLoanCount] = useState(0);
  const [familyCount, setFamilyCount] = useState(0);

  // ============================================
  // AUTH GUARD
  // ============================================
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login?redirect=/dashboard');
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'patient') {
        localStorage.clear();
        navigate('/login?redirect=/dashboard');
        return;
      }
      setUser(parsedUser);
      setAuthChecked(true);
    } catch (err) {
      console.error('Unable to read saved user:', err);
      localStorage.clear();
      navigate('/login?redirect=/dashboard');
    }
  }, [navigate]);

  // ============================================
  // FRESH PROFILE
  // ============================================
  useEffect(() => {
    if (!authChecked) return;
    getPatientProfile()
      .then(res => { if (res.data?.data) setProfile(res.data.data); })
      .catch(() => {});
  }, [authChecked]);

  // ============================================
  // FAMILY COUNT
  // ============================================
  useEffect(() => {
    try {
      const profiles = JSON.parse(localStorage.getItem('patientProfiles') || '[]');
      setFamilyCount(Array.isArray(profiles) ? profiles.length : 0);
    } catch { setFamilyCount(0); }
  }, []);

  // ============================================
  // AGGREGATE BOOKINGS
  // ============================================
  useEffect(() => {
    if (!authChecked) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };
    const safeFetch = async (url) => {
      try {
        const res = await api.get(url, { headers });
        return res.data;
      } catch (err) {
        console.log(`[dashboard] silent fail: ${url}`);
        return null;
      }
    };

    const loadAll = async () => {
      setBookingsLoading(true);

      const [ambulance, ayurveda, homeopathy, insurance, loans] = await Promise.all([
        safeFetch('/ambulance/my-bookings?limit=50'),
        safeFetch('/ayurveda/bookings/my-bookings'),
        safeFetch('/homeopathy/bookings/my-bookings'),
        safeFetch('/insurance/my-policies'),
        safeFetch('/loan/patient/applications')
      ]);

      const normalized = [];

      const ambList = ambulance?.data || ambulance || [];
      if (Array.isArray(ambList)) {
        ambList.forEach(b => normalized.push({
          _id: b._id, bookingId: b.bookingId, tag: 'ambulance', icon: '🚑',
          title: b.ambulanceType ? `Ambulance (${b.ambulanceType})` : 'Ambulance',
          subtitle: b.dropAddress || b.pickupAddress || 'Emergency transport',
          date: b.appointmentDate || b.createdAt, slotTime: null,
          amount: b.finalAmount, status: b.status, paymentStatus: b.paymentStatus,
          href: `/ambulance/tracking/${b.bookingId}`
        }));
      }

      const ayurList = ayurveda?.data || [];
      if (Array.isArray(ayurList)) {
        ayurList.forEach(b => normalized.push({
          _id: b._id, bookingId: b.bookingId, tag: 'ayurveda', icon: '🧘',
          title: b.type === 'panchakarma_package' ? (b.centerName || 'Panchakarma') : `Dr ${b.doctorName || 'Ayurveda'}`,
          subtitle: b.type?.replace(/_/g, ' ') || 'Ayurveda consultation',
          date: b.bookingDate, slotTime: b.slotTime,
          amount: b.finalAmount, status: b.status, paymentStatus: b.paymentStatus, href: null
        }));
      }

      const homeoList = homeopathy?.data || [];
      if (Array.isArray(homeoList)) {
        homeoList.forEach(b => {
          let title = 'Homeopathy';
          let icon = '🌿';
          if (b.type === 'homeopathy_consult')       { title = `Dr ${b.doctorName || 'Homeopathy'}`; icon = '🌿'; }
          else if (b.type === 'homeopathy_medicine') { title = b.pharmacyName || 'Medicine Order'; icon = '💊'; }
          else if (b.type === 'naturopathy_center')  { title = b.centerName || 'Naturopathy Center'; icon = '🏨'; }

          normalized.push({
            _id: b._id, bookingId: b.bookingId, tag: 'homeopathy', icon, title,
            subtitle: b.type?.replace(/_/g, ' ') || 'Homeopathy',
            date: b.bookingDate, slotTime: b.slotTime,
            amount: b.finalAmount, status: b.status, paymentStatus: b.paymentStatus,
            href: `/homeopathy/booking/${b.bookingId}`
          });
        });
      }

      const now = new Date();
      normalized.sort((a, b) => {
        const aDate = a.date ? new Date(a.date) : new Date(0);
        const bDate = b.date ? new Date(b.date) : new Date(0);
        const aF = aDate >= now, bF = bDate >= now;
        if (aF && !bF) return -1;
        if (!aF && bF) return 1;
        return bDate - aDate;
      });

      setAllBookings(normalized);
      setBookingsLoading(false);

      const insList = insurance?.data || [];
      setInsuranceCount(Array.isArray(insList) ? insList.length : 0);

      const loanList = loans?.data || loans || [];
      setLoanCount(Array.isArray(loanList) ? loanList.length : 0);
    };

    loadAll();
  }, [authChecked]);

  // ============================================
  // SEARCH
  // ============================================
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const upcomingBookings = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return allBookings
      .filter(b => b.date && new Date(b.date) >= now && !['cancelled', 'no_show'].includes(b.status))
      .slice(0, 5);
  }, [allBookings]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  const displayName = profile?.name || user?.name || 'Patient';
  const firstName = displayName.split(' ')[0];
  const city = profile?.patientAddress?.city || user?.city || 'Set location';

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">

      {/* ========== HEADER ========== */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="font-bold text-lg text-green-600 flex items-center gap-1 flex-shrink-0">
            🏥 <span className="hidden sm:inline">HospitalHub</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search healthcare..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </form>

          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/profile')} className="hidden lg:flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 px-2 py-1 rounded">
              <FaMapMarkerAlt /> {city}
            </button>
            <button onClick={() => navigate('/my-bookings')} className="p-2 rounded hover:bg-gray-100 relative" aria-label="Notifications">
              <FaBell className="text-gray-600" />
            </button>
            <button onClick={() => navigate('/profile')} className="flex items-center gap-2 p-1 rounded hover:bg-gray-100">
              <FaUserCircle className="text-gray-600 text-xl" />
              <span className="hidden sm:inline text-sm font-medium text-gray-700">{firstName}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6">

        {/* ========== WELCOME ========== */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Hello, {firstName} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your healthcare in one place</p>
        </div>

        {/* ========== UNIVERSAL SEARCH ========== */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-5 md:p-6 text-white mb-6 shadow-lg">
          <h2 className="text-lg md:text-xl font-bold mb-1">🔎 What healthcare service do you need?</h2>
          <p className="text-green-100 text-sm mb-4">Search hospitals, doctors, labs, ambulance, insurance, etc.</p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Search healthcare services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 outline-none text-sm"
            />
            <button type="submit" className="px-6 py-3 bg-white text-green-600 rounded-lg font-bold hover:bg-green-50 transition-colors text-sm">
              Search
            </button>
          </form>
        </div>

        {/* ========== QUICK ACTIONS ========== */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-500 tracking-wider mb-3">QUICK ACTIONS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.route)}
                className="p-4 rounded-xl text-left transition-all hover:shadow-lg active:scale-[0.98]"
                style={{ backgroundColor: action.bg, border: action.highlight ? '2px solid #dc2626' : '1px solid transparent' }}
              >
                <action.icon className="text-2xl mb-2" style={{ color: action.color }} />
                <div className="text-sm font-bold text-gray-800 whitespace-pre-line leading-tight">{action.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ========== ALL SERVICES ========== */}
        <div className="mb-8" id="services">
          <h2 className="text-xs font-bold text-gray-500 tracking-wider mb-3">ALL HOSPITALHUB SERVICES</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {SERVICE_CARDS.map((card, i) => (
              <ServiceCard key={i} card={card} onClick={() => !card.disabled && navigate(card.route)} />
            ))}
          </div>
        </div>

        {/* ========== MY HEALTHCARE + UPCOMING BOOKINGS ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FaIdCard className="text-green-600" /> MY HEALTHCARE
            </h3>
            <div className="space-y-1">
              <HealthLink icon={FaUserCircle} label="Health Profile" onClick={() => navigate('/profile')} />
              <HealthLink icon={FaUsers} label={`Family Members${familyCount ? ` (${familyCount})` : ''}`} onClick={() => navigate('/profile')} />
              <HealthLink icon={FaFileAlt} label="Prescriptions" disabled />
              <HealthLink icon={FaFlask} label="Lab Reports" disabled />
              <HealthLink icon={FaHeartbeat} label="Health Records" disabled />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FaCalendarAlt className="text-green-600" /> UPCOMING BOOKINGS
            </h3>

            {bookingsLoading ? (
              <div className="py-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="py-4 text-center text-sm text-gray-500">
                No upcoming bookings.{' '}
                <button onClick={() => navigate('/hospitals')} className="text-green-600 font-bold bg-transparent border-none cursor-pointer">
                  Book one →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingBookings.map((b, i) => (
                  <button
                    key={i}
                    onClick={() => b.href ? navigate(b.href) : navigate('/my-bookings')}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <span className="text-xl flex-shrink-0">{b.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{b.title}</div>
                      <div className="text-xs text-gray-500">
                        {formatBookingDate(b.date)} {b.slotTime ? `• ${b.slotTime}` : ''}
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400 text-xs" />
                  </button>
                ))}
              </div>
            )}

            <button onClick={() => navigate('/my-bookings')} className="w-full mt-3 py-2 text-sm font-bold text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              View All Bookings →
            </button>
          </div>
        </div>

        {/* ========== PAYMENTS & FINANCE + MY SERVICES ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FaWallet className="text-green-600" /> PAYMENTS & FINANCE
            </h3>
            <div className="space-y-1">
              <HealthLink icon={FaWallet} label="Recent Payments" onClick={() => navigate('/my-bookings')} />
              <HealthLink icon={FaWallet} label="Pending Payments" onClick={() => navigate('/my-bookings')} />
              <HealthLink icon={FaBalanceScale} label="Refund Status" onClick={() => navigate('/my-bookings')} />
              <HealthLink icon={FaCreditCard} label={`EMI / Loan Status${loanCount ? ` (${loanCount})` : ''}`} onClick={() => navigate('/financing')} />
              <HealthLink icon={FaShieldAlt} label={`Insurance Policies${insuranceCount ? ` (${insuranceCount})` : ''}`} onClick={() => navigate('/insurance')} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FaHeartbeat className="text-green-600" /> MY SERVICES
            </h3>
            <div className="space-y-1">
              <HealthLink icon={FaStar} label="Saved Providers" disabled />
              <HealthLink icon={FaBookmark} label="Saved Services" disabled />
              <HealthLink icon={FaBalanceScale} label="Compare" onClick={() => navigate('/hospitals')} />
              <HealthLink icon={FaIdCard} label="Memberships" disabled />
            </div>
          </div>
        </div>

        {/* ========== HEALTHCARE JOURNEY ========== */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-8">
          <h3 className="font-bold text-gray-800 mb-4 tracking-wider text-xs">HEALTHCARE JOURNEY</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm mb-3">
            <JourneyPill label="Hospital" color="blue" />
            <span className="text-gray-400">→</span>
            <JourneyPill label="Doctor" color="purple" />
            <span className="text-gray-400">→</span>
            <JourneyPill label="Diagnostics" color="green" />
            <span className="text-gray-400">→</span>
            <JourneyPill label="Prescription" color="orange" />
            <span className="text-gray-400">→</span>
            <JourneyPill label="Follow-up" color="cyan" />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
            <JourneyPill label="Insurance / EMI" color="blue" />
            <span className="text-gray-400">→</span>
            <JourneyPill label="Payment" color="purple" />
            <span className="text-gray-400">→</span>
            <JourneyPill label="Treatment" color="green" />
            <span className="text-gray-400">→</span>
            <JourneyPill label="Home Care" color="orange" />
            <span className="text-gray-400">→</span>
            <JourneyPill label="DietCare" color="orange" disabled />
          </div>
        </div>

        {/* ========== DIETCARE ========== */}
        <div className="bg-gradient-to-r from-orange-50 to-white border-2 border-orange-200 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="text-4xl">🥗</div>
            <div className="flex-1 min-w-[200px]">
              <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                DIETCARE
                <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">SOON</span>
              </h3>
              <p className="text-sm text-gray-600 mb-3">Personalized Indian meal planning</p>
              <div className="flex gap-2 flex-wrap">
                <button disabled className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-200 text-gray-400 text-sm font-bold cursor-not-allowed">
                  <FaLock className="text-xs" /> View My Plan
                </button>
                <button disabled className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-bold cursor-not-allowed opacity-60">
                  <FaLock className="text-xs" /> Start DietCare
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========== RECOMMENDED ========== */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-3 text-xs tracking-wider">RECOMMENDED FOR YOU</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {RECOMMENDED_PILLS.map((r, i) => (
              <button
                key={i}
                disabled={r.disabled}
                onClick={() => !r.disabled && navigate(r.route)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  r.disabled
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-green-500 hover:text-green-600'
                }`}
              >
                {r.disabled && <FaLock className="text-[10px]" />}
                {r.label}
                {r.disabled && <span className="text-[9px] text-orange-500 font-bold">SOON</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ========== RECENT ACTIVITY ========== */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-8">
          <h3 className="font-bold text-gray-800 mb-3 text-xs tracking-wider">RECENT ACTIVITY</h3>
          {bookingsLoading ? (
            <div className="py-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
            </div>
          ) : allBookings.length === 0 ? (
            <p className="text-sm text-gray-500 py-3">No activity yet. Start by booking a service above.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {allBookings.slice(0, 5).map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                  <span className="flex-1 truncate">
                    {b.icon} {b.title} — {humanStatus(b.status)}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatBookingDate(b.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ========== MOBILE BOTTOM NAV ========== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30">
        <div className="grid grid-cols-5">
          <BottomNav icon={FaHome}        label="Home"     active onClick={() => navigate('/dashboard')} />
          <BottomNav icon={FaHospital}    label="Services" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} />
          <BottomNav icon={FaCalendarAlt} label="Bookings" onClick={() => navigate('/my-bookings')} />
          <BottomNav icon={FaHeartbeat}   label="Health"   onClick={() => navigate('/profile')} />
          <BottomNav icon={FaWallet}      label="Payments" onClick={() => navigate('/my-bookings')} />
        </div>
      </div>
    </div>
  );
};

// ============================================
// SUBCOMPONENTS
// ============================================
const ServiceCard = ({ card, onClick }) => (
  <button
    onClick={onClick}
    disabled={card.disabled}
    className={`relative p-4 rounded-xl text-left transition-all ${
      card.disabled
        ? 'cursor-not-allowed opacity-60'
        : 'hover:shadow-lg active:scale-[0.98]'
    }`}
    style={{
      backgroundColor: card.disabled ? '#f3f4f6' : card.bg,
      border: `1.5px solid ${card.disabled ? '#e5e7eb' : card.color + '20'}`
    }}
  >
    {card.badge && (
      <span className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${
        card.disabled ? 'bg-orange-400 text-white' : 'bg-orange-500 text-white'
      }`}>
        {card.badge}
      </span>
    )}
    <div className="relative inline-block mb-2">
      <card.icon className="text-2xl" style={{ color: card.disabled ? '#94a3b8' : card.color }} />
      {card.disabled && (
        <FaLock className="absolute -bottom-1 -right-2 text-[10px] text-gray-400" />
      )}
    </div>
    <div className={`text-sm font-bold mb-1 leading-tight ${card.disabled ? 'text-gray-400' : 'text-gray-800'}`}>
      {card.name}
    </div>
    <div className={`text-xs leading-tight ${card.disabled ? 'text-gray-400' : 'text-gray-500'}`}>
      {card.desc}
    </div>
  </button>
);

const HealthLink = ({ icon: Icon, label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
      disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'
    }`}
  >
    <Icon className="text-gray-400 text-sm flex-shrink-0" />
    <span className={`flex-1 text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</span>
    {disabled ? (
      <span className="flex items-center gap-1">
        <FaLock className="text-gray-300 text-[10px]" />
        <span className="text-[9px] text-orange-500 font-bold">SOON</span>
      </span>
    ) : (
      <FaChevronRight className="text-gray-300 text-xs" />
    )}
  </button>
);

const BottomNav = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-0.5 py-2 text-[10px] ${
      active ? 'text-green-600' : 'text-gray-500'
    }`}
  >
    <Icon className="text-base" />
    <span>{label}</span>
  </button>
);

const JourneyPill = ({ label, color, disabled }) => {
  const colorMap = {
    blue:   'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    green:  'bg-green-50 text-green-700',
    orange: 'bg-orange-50 text-orange-700',
    cyan:   'bg-cyan-50 text-cyan-700'
  };
  return (
    <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-medium ${
      disabled ? 'bg-gray-100 text-gray-400' : colorMap[color]
    }`}>
      {disabled && <FaLock className="text-[9px]" />}
      {label}
    </span>
  );
};

// ============================================
// HELPERS
// ============================================
const formatBookingDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const humanStatus = (status) => {
  if (!status) return '';
  const map = {
    pending: 'pending', confirmed: 'confirmed',
    in_progress: 'in progress', completed: 'completed',
    cancelled: 'cancelled', no_show: 'no show', rescheduled: 'rescheduled'
  };
  return map[status] || status;
};

export default PatientDashboard;