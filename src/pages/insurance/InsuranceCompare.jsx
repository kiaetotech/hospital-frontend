import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  X,
  Plus,
  Minus,
  Star,
  Shield,
  Building,
  Users,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  Heart,
  TrendingUp,
  IndianRupee,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import axios from 'axios';

const InsuranceCompare = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    coverage: true,
    features: true,
    pricing: true,
    network: true,
    claim: true,
    addons: true
  });

  // Get plan IDs from URL
  const planIds = searchParams.getAll('ids');

  useEffect(() => {
    if (planIds.length > 0) {
      fetchComparisonPlans(planIds);
    } else {
      // Redirect to list if no plans selected
      navigate('/insurance/list');
    }
  }, [planIds]);

  const fetchComparisonPlans = async (ids) => {
    try {
      setLoading(true);
      const promises = ids.map(id => 
        axios.get(`/api/insurance/plans/${id}`)
      );
      const responses = await Promise.all(promises);
      const plansData = responses.map(res => res.data.data);
      setPlans(plansData);
      setComparison(plansData);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const response = await axios.get('/api/insurance/plans?limit=20');
      if (response.data.success) {
        const existingIds = comparison.map(p => p._id);
        const available = response.data.data.filter(p => !existingIds.includes(p._id));
        setAvailablePlans(available);
      }
    } catch (error) {
      console.error('Error fetching available plans:', error);
    }
  };

  const handleAddPlan = () => {
    setShowAddPlan(!showAddPlan);
    if (!showAddPlan) {
      fetchAvailablePlans();
    }
  };

  const handleSelectPlan = async (planId) => {
    try {
      const response = await axios.get(`/api/insurance/plans/${planId}`);
      if (response.data.success) {
        const newPlans = [...comparison, response.data.data];
        setComparison(newPlans);
        setShowAddPlan(false);
        // Update URL
        const ids = newPlans.map(p => p._id);
        navigate(`/insurance/compare?ids=${ids.join(',')}`);
      }
    } catch (error) {
      console.error('Error adding plan:', error);
    }
  };

  const handleRemovePlan = (planId) => {
    const newPlans = comparison.filter(p => p._id !== planId);
    setComparison(newPlans);
    if (newPlans.length === 0) {
      navigate('/insurance/list');
    } else {
      const ids = newPlans.map(p => p._id);
      navigate(`/insurance/compare?ids=${ids.join(',')}`);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/insurance/list')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Plans</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Compare Plans
            </h1>
            <div className="w-24"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row - Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {comparison.map((plan) => (
                <div key={plan._id} className="bg-white rounded-xl shadow-lg overflow-hidden relative">
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemovePlan(plan._id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Company logo */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">
                          {plan.companyId?.name || 'Insurance Company'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getPlanTypeLabel(plan.planType)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan name */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">
                      {plan.planName}
                    </h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium text-gray-700">
                        {plan.rating || 0}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({plan.totalReviews || 0} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="p-4 bg-blue-50">
                    <div className="text-sm text-gray-600">Starting from</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(plan.basePremium)}
                    </div>
                    <div className="text-xs text-gray-500">per year incl. GST</div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => navigate(`/insurance/plan/${plan._id}`)}
                    className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200"
                  >
                    View Details
                  </button>
                </div>
              ))}

              {/* Add Plan Card */}
              {comparison.length < 4 && (
                <div 
                  className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer flex flex-col items-center justify-center p-6 min-h-[300px]"
                  onClick={handleAddPlan}
                >
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                    <Plus className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-gray-600 font-medium">Add Plan</p>
                  <p className="text-xs text-gray-400">Compare up to 4 plans</p>
                </div>
              )}
            </div>

            {/* Add Plan Dropdown */}
            {showAddPlan && (
              <div className="mb-6 p-4 bg-white rounded-xl shadow-lg">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Select a plan to compare
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availablePlans.map((plan) => (
                    <button
                      key={plan._id}
                      onClick={() => handleSelectPlan(plan._id)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="font-medium text-sm text-gray-800">
                        {plan.planName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {plan.companyId?.name}
                      </div>
                      <div className="text-sm font-semibold text-blue-600 mt-1">
                        {formatCurrency(plan.basePremium)}
                      </div>
                    </button>
                  ))}
                  {availablePlans.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-4">
                      No more plans available to compare
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowAddPlan(false)}
                  className="mt-3 text-sm text-red-600 hover:text-red-700"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* ============================================
                COMPARISON TABLE - SECTIONS
                ============================================ */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Plan Type */}
              <div className="p-4 border-b border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="font-semibold text-gray-700">Plan Type</div>
                  {comparison.map((plan) => (
                    <div key={plan._id} className="text-gray-600">
                      {getPlanTypeLabel(plan.planType)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Coverage Section */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSection('coverage')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
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
                    {/* Sum Insured */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-sm text-gray-500">Sum Insured</div>
                      {comparison.map((plan) => (
                        <div key={plan._id} className="font-medium text-gray-800">
                          {formatCurrency(plan.sumInsured?.default || 0)}
                        </div>
                      ))}
                    </div>

                    {/* Room Rent Limit */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-sm text-gray-500">Room Rent Limit</div>
                      {comparison.map((plan) => (
                        <div key={plan._id} className="text-gray-600 capitalize">
                          {plan.roomRentLimit || 'Standard'}
                        </div>
                      ))}
                    </div>

                    {/* ICU Coverage */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-sm text-gray-500">ICU Coverage</div>
                      {comparison.map((plan) => (
                        <div key={plan._id} className="text-gray-600">
                          {plan.icuCoverage ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <X className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Daycare Coverage */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-sm text-gray-500">Daycare Coverage</div>
                      {comparison.map((plan) => (
                        <div key={plan._id} className="text-gray-600">
                          {plan.daycareCoverage ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <X className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pre-existing Waiting */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-sm text-gray-500">Pre-existing Waiting</div>
                      {comparison.map((plan) => (
                        <div key={plan._id} className="text-gray-600">
                          {plan.preExistingWaiting || 48} months
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Features Section */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSection('features')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
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
                  <div className="p-4 space-y-3">
                    {comparison.map((plan) => (
                      <div key={plan._id} className="space-y-1">
                        <div className="font-medium text-gray-700">{plan.planName}</div>
                        <ul className="space-y-1">
                          {(plan.features || []).slice(0, 5).map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <Check className="w-4 h-4 text-green-600" />
                              {feature.title}
                            </li>
                          ))}
                          {(plan.features || []).length > 5 && (
                            <li className="text-sm text-blue-600">
                              +{plan.features.length - 5} more features
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Network Hospitals */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSection('network')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-sm text-gray-500">Total Network</div>
                      {comparison.map((plan) => (
                        <div key={plan._id} className="font-medium text-gray-800">
                          {plan.totalNetworkHospitals || plan.networkHospitals?.length || 0} hospitals
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Claim Process */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSection('claim')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
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
                  <div className="p-4 space-y-3">
                    {/* Cashless */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-sm text-gray-500">Cashless Claim</div>
                      {comparison.map((plan) => (
                        <div key={plan._id} className="text-gray-600">
                          {plan.claimProcess?.cashless ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <X className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Claim Settlement Ratio */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-sm text-gray-500">Claim Settlement Ratio</div>
                      {comparison.map((plan) => (
                        <div key={plan._id} className="text-gray-600">
                          {plan.claimProcess?.claimSettlementRatio || 'N/A'}%
                        </div>
                      ))}
                    </div>

                    {/* Average Settlement Time */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-sm text-gray-500">Avg. Settlement Time</div>
                      {comparison.map((plan) => (
                        <div key={plan._id} className="text-gray-600">
                          {plan.claimProcess?.averageSettlementTime || 'Standard'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add-ons */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSection('addons')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
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
                  <div className="p-4 space-y-3">
                    {comparison.map((plan) => (
                      <div key={plan._id}>
                        <div className="font-medium text-gray-700">{plan.planName}</div>
                        {(plan.addons || []).length > 0 ? (
                          <ul className="space-y-1 mt-1">
                            {plan.addons.map((addon, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-green-600" />
                                {addon.name} - {formatCurrency(addon.price || 0)}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-400">No add-ons available</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CTA - Buy Now */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              {comparison.map((plan) => (
                <button
                  key={plan._id}
                  onClick={() => navigate(`/insurance/apply/${plan._id}`)}
                  className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Buy {plan.planName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceCompare;