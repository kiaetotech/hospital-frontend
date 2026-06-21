import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Shield, 
  TrendingUp, 
  Users, 
  Award, 
  Clock, 
  CheckCircle,
  ChevronRight,
  Star,
  Building,
  Heart,
  Family,
  User,
  Baby,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Globe,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import axios from 'axios';
import InsuranceCard from '../../components/InsuranceCard';
import PremiumCalculator from '../../components/PremiumCalculator';

const InsuranceHub = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featuredPlans, setFeaturedPlans] = useState([]);
  const [popularPlans, setPopularPlans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanType, setSelectedPlanType] = useState('all');
  const [showCalculator, setShowCalculator] = useState(false);
  const [stats, setStats] = useState({
    totalPlans: 0,
    totalCompanies: 0,
    policiesIssued: 0,
    claimSettlementRate: 0
  });

  // Plan types for filtering
  const planTypes = [
    { id: 'all', label: 'All Plans', icon: Shield },
    { id: 'individual', label: 'Individual', icon: User },
    { id: 'family_floater', label: 'Family Floater', icon: Family },
    { id: 'critical_illness', label: 'Critical Illness', icon: AlertCircle },
    { id: 'senior_citizen', label: 'Senior Citizen', icon: Users },
    { id: 'maternity', label: 'Maternity', icon: Baby }
  ];

  // Fetch data on load
  useEffect(() => {
    fetchInsuranceData();
  }, []);

  const fetchInsuranceData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured plans
      const featuredRes = await axios.get('/api/insurance/plans?isFeatured=true&limit=6');
      if (featuredRes.data.success) {
        setFeaturedPlans(featuredRes.data.data);
      }

      // Fetch popular plans
      const popularRes = await axios.get('/api/insurance/plans?limit=8&sort=popular');
      if (popularRes.data.success) {
        setPopularPlans(popularRes.data.data);
      }

      // Fetch stats
      const statsRes = await axios.get('/api/insurance/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

    } catch (error) {
      console.error('Error fetching insurance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/insurance/list?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handlePlanTypeClick = (typeId) => {
    if (typeId === 'all') {
      navigate('/insurance/list');
    } else {
      navigate(`/insurance/list?type=${typeId}`);
    }
  };

  const handleViewAllPlans = () => {
    navigate('/insurance/list');
  };

  const handleViewAllPopular = () => {
    navigate('/insurance/list?sort=popular');
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="bg-blue-600 h-[400px] w-full"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-xl h-32"></div>
              ))}
            </div>
            <div className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <div className="h-8 w-48 bg-gray-200 rounded"></div>
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-xl h-64"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-yellow-400" />
              <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">
                India's Trusted Health Insurance Marketplace
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Compare & Buy Health Insurance
              <span className="text-yellow-400 block">Plans That Protect Your Family</span>
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Compare 50+ health insurance plans from top insurers. Get the best coverage at the lowest premium. Save up to 40% on your policy.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative flex items-center bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search plans by name, coverage, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 font-semibold transition-colors duration-200"
                >
                  Search Plans
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.totalPlans}+</div>
                <div className="text-blue-200 text-sm">Insurance Plans</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.totalCompanies}+</div>
                <div className="text-blue-200 text-sm">Insurance Companies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.policiesIssued}+</div>
                <div className="text-blue-200 text-sm">Policies Issued</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.claimSettlementRate}%</div>
                <div className="text-blue-200 text-sm">Claim Settlement Ratio</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          PLAN TYPES QUICK ACCESS
          ============================================ */}
      <section className="container mx-auto px-4 py-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {planTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => handlePlanTypeClick(type.id)}
                className="bg-white rounded-xl shadow-md hover:shadow-lg p-4 text-center transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{type.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ============================================
          FEATURED PLANS
          ============================================ */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              ⭐ Featured Plans
            </h2>
            <p className="text-gray-600">Most popular and highly rated insurance plans</p>
          </div>
          <button
            onClick={handleViewAllPlans}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {featuredPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPlans.map((plan) => (
              <InsuranceCard key={plan._id} plan={plan} featured />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No featured plans available</p>
          </div>
        )}
      </section>

      {/* ============================================
          PREMIUM CALCULATOR
          ============================================ */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                💰 Calculate Your Premium
              </h2>
              <p className="text-gray-600 mb-6">
                Get an instant estimate of your health insurance premium. Enter your details and see how much you can save.
              </p>
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center gap-2"
              >
                {showCalculator ? 'Hide Calculator' : 'Try Premium Calculator'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center w-full max-w-sm">
                <div className="text-4xl font-bold text-blue-600 mb-2">₹ 500</div>
                <div className="text-gray-500 text-sm">Average Monthly Premium</div>
                <div className="flex justify-center gap-4 mt-4 text-sm">
                  <div>
                    <span className="text-gray-500">Min</span>
                    <div className="font-semibold">₹ 200</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Max</span>
                    <div className="font-semibold">₹ 2,000</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showCalculator && (
            <div className="mt-8 max-w-3xl mx-auto">
              <PremiumCalculator />
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          POPULAR PLANS
          ============================================ */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              🔥 Most Popular Plans
            </h2>
            <p className="text-gray-600">Trusted by thousands of customers</p>
          </div>
          <button
            onClick={handleViewAllPopular}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {popularPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularPlans.map((plan) => (
              <InsuranceCard key={plan._id} plan={plan} popular />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No popular plans available</p>
          </div>
        )}
      </section>

      {/* ============================================
          WHY CHOOSE US
          ============================================ */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose Our Insurance Marketplace?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Trusted Platform</h3>
              <p className="text-gray-600 text-sm">Compare plans from 20+ IRDAI approved insurance companies</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Best Prices</h3>
              <p className="text-gray-600 text-sm">Get the lowest premiums with exclusive online discounts</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Quick Process</h3>
              <p className="text-gray-600 text-sm">Get policy issued in minutes. No medical tests required for some plans</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Expert Support</h3>
              <p className="text-gray-600 text-sm">Dedicated claims assistance and 24/7 customer support</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          TRUST INDICATORS
          ============================================ */}
      <section className="bg-gray-50 py-12 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="font-bold text-gray-800">50,000+</div>
                <div className="text-xs text-gray-500">Happy Customers</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-gray-800">20+</div>
                <div className="text-xs text-gray-500">Insurance Partners</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="font-bold text-gray-800">4.8/5</div>
                <div className="text-xs text-gray-500">Average Rating</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="font-bold text-gray-800">95%</div>
                <div className="text-xs text-gray-500">Claim Settlement</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Protect Your Health?
          </h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Get the best health insurance plan tailored to your needs. Compare, choose, and buy in minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/insurance/list"
              className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center justify-center gap-2"
            >
              Compare Plans Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/insurance/plans"
              className="bg-transparent border-2 border-white hover:bg-white/10 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center justify-center gap-2"
            >
              Explore All Plans
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER SECTION
          ============================================ */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4">About Us</h4>
              <p className="text-sm">
                India's leading health insurance marketplace. We help you compare and buy the best health insurance plans from top insurers.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <a href="#" className="hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Globe className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/insurance/list" className="hover:text-white transition-colors">All Plans</Link></li>
                <li><Link to="/insurance/compare" className="hover:text-white transition-colors">Compare Plans</Link></li>
                <li><Link to="/my-policies" className="hover:text-white transition-colors">My Policies</Link></li>
                <li><Link to="/insurance/claims" className="hover:text-white transition-colors">Claim Assistance</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+91 1800-123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>insurance@yourplatform.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Mumbai, India</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Your Platform. All rights reserved. | Insurance is a subject matter of solicitation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InsuranceHub;