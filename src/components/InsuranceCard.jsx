import React from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Building,
  Shield,
  Clock,
  Users,
  TrendingUp,
  Heart,
  IndianRupee,
  CheckCircle,
  Award
} from 'lucide-react';

const InsuranceCard = ({ plan, featured = false, popular = false, viewMode = 'grid' }) => {
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

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* Badges */}
        <div className="relative">
          {(featured || popular) && (
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
              {featured && (
                <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Featured
                </span>
              )}
              {popular && !featured && (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Popular
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-5">
          {/* Company Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">
                {plan.companyId?.name || 'Insurance Company'}
              </div>
              <div className="text-xs text-gray-500">
                {getPlanTypeLabel(plan.planType)}
              </div>
            </div>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium text-gray-700">{plan.rating || 0}</span>
            </div>
          </div>

          {/* Plan Name */}
          <Link to={`/insurance/plan/${plan._id}`}>
            <h3 className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors line-clamp-1">
              {plan.planName}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {plan.shortDescription || plan.description || 'Comprehensive health insurance plan'}
          </p>

          {/* Key Features */}
          <div className="mt-3 flex flex-wrap gap-2">
            {(plan.features || []).slice(0, 3).map((feature, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3 text-green-500" />
                {feature.title.length > 15 ? feature.title.slice(0, 15) + '...' : feature.title}
              </span>
            ))}
          </div>

          {/* Price */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-gray-500">Starting from</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(plan.basePremium)}
                </div>
                <div className="text-xs text-gray-400">per year incl. GST</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Sum Insured</div>
                <div className="font-semibold text-gray-800">
                  {formatCurrency(plan.sumInsured?.default || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <Link
              to={`/insurance/plan/${plan._id}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
            >
              View Details
            </Link>
            <Link
              to={`/insurance/apply/${plan._id}`}
              className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-center py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
            >
              Buy Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left - Info */}
        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {plan.companyId?.name || 'Insurance Company'}
                </div>
                <div className="text-xs text-gray-500">
                  {getPlanTypeLabel(plan.planType)} • {plan.rating || 0}★
                </div>
              </div>
            </div>
            {(featured || popular) && (
              <div className="flex gap-1">
                {featured && (
                  <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Featured
                  </span>
                )}
                {popular && !featured && (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Popular
                  </span>
                )}
              </div>
            )}
          </div>

          <Link to={`/insurance/plan/${plan._id}`}>
            <h3 className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors mt-2">
              {plan.planName}
            </h3>
          </Link>

          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {plan.shortDescription || plan.description || 'Comprehensive health insurance plan'}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {(plan.features || []).slice(0, 4).map((feature, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3 text-green-500" />
                {feature.title.length > 20 ? feature.title.slice(0, 20) + '...' : feature.title}
              </span>
            ))}
          </div>
        </div>

        {/* Right - Price & Actions */}
        <div className="md:w-64 p-5 bg-gray-50 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-gray-100">
          <div className="text-center">
            <div className="text-xs text-gray-500">Starting from</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(plan.basePremium)}
            </div>
            <div className="text-xs text-gray-400">per year incl. GST</div>
            <div className="text-xs text-gray-500 mt-1">
              Sum Insured: {formatCurrency(plan.sumInsured?.default || 0)}
            </div>
          </div>

          <div className="mt-3 flex flex-col w-full gap-2">
            <Link
              to={`/insurance/plan/${plan._id}`}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
            >
              View Details
            </Link>
            <Link
              to={`/insurance/apply/${plan._id}`}
              className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-center py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
            >
              Buy Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceCard;

