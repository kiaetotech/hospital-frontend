import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Shield,
  Building,
  Users,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  Heart,
  TrendingUp,
  IndianRupee,
  Calendar,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Plus,
  Minus,
  AlertCircle,
  Info,
  Phone,
  Mail,
  MapPin,
  Globe,
  Share2,
  Bookmark,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import PremiumCalculator from '../../components/PremiumCalculator';

const InsuranceDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    coverage: true,
    features: true,
    inclusions: true,
    exclusions: true,
    addons: true,
    network: true,
    claim: true,
    tax: true
  });

  useEffect(() => {
    fetchPlanDetails();
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/insurance/plans/${id}`);
      if (response.data.success) {
        setPlan(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching plan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleAddon = (addon) => {
    setSelectedAddons(prev => {
      if (prev.includes(addon._id)) {
        return prev.filter(id => id !== addon._id);
      } else {
        return [...prev, addon._id];
      }
    });
  };

  const handleBuyNow = () => {
    if (!plan) return;
    navigate(`/insurance/apply/${plan._id}`);
  };

  const handleCompare = () => {
    if (!plan) return;
    navigate(`/insurance/compare?ids=${plan._id}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPlanTypeLabel = (type) => {
    const map = {
      'individual': 'Individual',
      'family_floater': 'Family Floater',
      'critical_illness': 'Critical Illness',
      'senior_citizen': 'Senior Citizen',
      'maternity': 'Maternity'
    };
    return map[type] || type;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
            <div className="bg-white rounded-xl p-6">
              <div className="flex gap-6">
                <div className="flex-1">
                  <div className="h-10 w-64 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
                <div className="w-80">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Plan Not Found</h2>
          <p className="text-gray-500 mt-2">The plan you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/insurance/list')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{plan.planName}</h1>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">
                    {plan.companyId?.name || 'Insurance Company'}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">{getPlanTypeLabel(plan.planType)}</span>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-gray-700">{plan.rating || 0}</span>
                    <span className="text-gray-400">
                      ({plan.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCompare}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Compare
              </button>
              <button
                onClick={() => {/* Share functionality */}}
                className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {/* Bookmark functionality */}}
                className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ============================================
              MAIN CONTENT
              ============================================ */}
          <div className="flex-1">
            {/* Overview Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  About {plan.planName}
                </h2>
                <p className="text-gray-600">{plan.description || 'No description available'}</p>
                {plan.keyHighlights && plan.keyHighlights.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {plan.keyHighlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
                <div className="p-4 text-center">
                  <div className="text-sm text-gray-500">Sum Insured</div>
                  <div className="font-bold text-gray-800">
                    {formatCurrency(plan.sumInsured?.default || 0)}
                  </div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-sm text-gray-500">Premium</div>
                  <div className="font-bold text-blue-600">
                    {formatCurrency(plan.basePremium)}
                  </div>
                  <div className="text-xs text-gray-400">per year</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-sm text-gray-500">Plan Type</div>
                  <div className="font-bold text-gray-800">
                    {getPlanTypeLabel(plan.planType)}
                  </div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-sm text-gray-500">Rating</div>
                  <div className="flex items-center justify-center gap-1 text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-bold text-gray-800">{plan.rating || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coverage Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <button
                onClick={() => toggleSection('coverage')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Coverage Details
                </span>
                {expandedSections.coverage ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSections.coverage && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Sum Insured</div>
                      <div className="font-medium text-gray-800">
                        {formatCurrency(plan.sumInsured?.default || 0)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Min: {formatCurrency(plan.sumInsured?.min || 0)} • Max: {formatCurrency(plan.sumInsured?.max || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Room Rent Limit</div>
                      <div className="font-medium text-gray-800 capitalize">
                        {plan.roomRentLimit || 'Standard'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">ICU Coverage</div>
                      <div className="font-medium text-gray-800">
                        {plan.icuCoverage ? 'Yes' : 'No'}
                        {plan.icuLimit && ` (${plan.icuLimit}% of sum insured)`}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Daycare Coverage</div>
                      <div className="font-medium text-gray-800">
                        {plan.daycareCoverage ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Ambulance Coverage</div>
                      <div className="font-medium text-gray-800">
                        {plan.ambulanceCoverage ? 'Yes' : 'No'}
                        {plan.ambulanceLimit && ` (₹${plan.ambulanceLimit})`}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Pre-existing Waiting</div>
                      <div className="font-medium text-gray-800">
                        {plan.preExistingWaiting || 48} months
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Features Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <button
                onClick={() => toggleSection('features')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                  Features & Benefits
                </span>
                {expandedSections.features ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSections.features && (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(plan.features || []).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        {feature.included ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-medium text-gray-800">{feature.title}</div>
                          {feature.description && (
                            <div className="text-sm text-gray-500">{feature.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {(plan.features || []).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No features listed</p>
                  )}
                </div>
              )}
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Inclusions */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection('inclusions')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <span className="font-semibold text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Inclusions
                  </span>
                  {expandedSections.inclusions ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.inclusions && (
                  <div className="p-4">
                    <ul className="space-y-2">
                      {(plan.inclusions || []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    {(plan.inclusions || []).length === 0 && (
                      <p className="text-gray-500 text-center py-4">No inclusions listed</p>
                    )}
                  </div>
                )}
              </div>

              {/* Exclusions */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection('exclusions')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <span className="font-semibold text-red-700 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Exclusions
                  </span>
                  {expandedSections.exclusions ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.exclusions && (
                  <div className="p-4">
                    <ul className="space-y-2">
                      {(plan.exclusions || []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    {(plan.exclusions || []).length === 0 && (
                      <p className="text-gray-500 text-center py-4">No exclusions listed</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Add-ons */}
            {(plan.addons || []).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <button
                  onClick={() => toggleSection('addons')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <span className="font-semibold text-gray-800 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-orange-600" />
                    Add-ons / Riders
                  </span>
                  {expandedSections.addons ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.addons && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.addons.map((addon, idx) => (
                        <div
                          key={idx}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedAddons.includes(addon._id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => toggleAddon(addon)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-gray-800">{addon.name}</div>
                              <div className="text-sm text-gray-500">{addon.description}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-blue-600">
                                {formatCurrency(addon.price || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Network Hospitals */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <button
                onClick={() => toggleSection('network')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  <Building className="w-5 h-5 text-green-600" />
                  Network Hospitals
                </span>
                {expandedSections.network ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSections.network && (
                <div className="p-4">
                  <div className="mb-4">
                    <div className="text-sm text-gray-500">Total Network Hospitals</div>
                    <div className="font-bold text-2xl text-gray-800">
                      {plan.totalNetworkHospitals || plan.networkHospitals?.length || 0}
                    </div>
                  </div>
                  {(plan.networkHospitals || []).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {plan.networkHospitals.slice(0, 10).map((hospital, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-800">{hospital.name}</div>
                            <div className="text-xs text-gray-500">
                              {hospital.city}, {hospital.state}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No network hospitals listed</p>
                  )}
                  {(plan.networkHospitals || []).length > 10 && (
                    <p className="text-center text-sm text-blue-600 mt-4">
                      +{(plan.networkHospitals || []).length - 10} more hospitals
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Claim Process */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <button
                onClick={() => toggleSection('claim')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Claim Process
                </span>
                {expandedSections.claim ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSections.claim && (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Cashless Claim</div>
                      <div className="font-semibold text-gray-800">
                        {plan.claimProcess?.cashless ? 'Available' : 'Not Available'}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Claim Settlement Ratio</div>
                      <div className="font-semibold text-gray-800">
                        {plan.claimProcess?.claimSettlementRatio || 'N/A'}%
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Avg. Settlement Time</div>
                      <div className="font-semibold text-gray-800">
                        {plan.claimProcess?.averageSettlementTime || 'Standard'}
                      </div>
                    </div>
                  </div>

                  {plan.claimProcess?.processDescription && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Process Description</div>
                      <p className="text-sm text-gray-600">{plan.claimProcess.processDescription}</p>
                    </div>
                  )}

                  {(plan.claimProcess?.requiredDocuments || []).length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Required Documents</div>
                      <ul className="space-y-1">
                        {plan.claimProcess.requiredDocuments.map((doc, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tax Benefits */}
            {(plan.taxBenefits || []).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <button
                  onClick={() => toggleSection('tax')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <span className="font-semibold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Tax Benefits
                  </span>
                  {expandedSections.tax ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.tax && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.taxBenefits.map((tax, idx) => (
                        <div key={idx} className="p-4 bg-green-50 rounded-lg">
                          <div className="font-semibold text-gray-800">Section {tax.section}</div>
                          <div className="text-sm text-gray-600">{tax.description}</div>
                          {tax.maxAmount && (
                            <div className="text-sm text-green-700 font-medium mt-1">
                              Up to ₹{tax.maxAmount} deduction
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ============================================
              SIDEBAR - BUY / CALCULATOR
              ============================================ */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Price Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center border-b border-gray-100 pb-4 mb-4">
                  <div className="text-sm text-gray-500">Starting Premium</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(plan.basePremium)}
                  </div>
                  <div className="text-xs text-gray-400">per year (incl. GST)</div>
                  {plan.discountPercentage > 0 && (
                    <div className="mt-2 inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                      {plan.discountPercentage}% OFF
                    </div>
                  )}
                </div>

                <button
                  onClick={handleBuyNow}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Buy Now
                </button>

                <button
                  onClick={handleCompare}
                  className="w-full mt-3 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2.5 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Compare with Other Plans
                </button>

                <div className="mt-4 text-center text-xs text-gray-400">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Policy issued in minutes
                </div>
              </div>

              {/* Premium Calculator Toggle */}
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="w-full bg-white border border-gray-200 hover:border-blue-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <IndianRupee className="w-5 h-5" />
                Calculate Your Premium
                {showCalculator ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showCalculator && (
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <PremiumCalculator defaultPlanId={plan._id} />
                </div>
              )}

              {/* Company Info */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {plan.companyId?.name || 'Insurance Company'}
                    </div>
                    <div className="text-xs text-gray-500">Insurance Provider</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {plan.companyId?.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {plan.companyId.email}
                    </div>
                  )}
                  {plan.companyId?.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {plan.companyId.phone}
                    </div>
                  )}
                  {plan.companyId?.website && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe className="w-4 h-4" />
                      <a href={plan.companyId.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-around">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-xs text-gray-500">IRDAI Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-xs text-gray-500">Trusted Platform</div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="text-xs text-gray-500">4.8 Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceDetail;