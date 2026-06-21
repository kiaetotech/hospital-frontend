import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  X,
  Star,
  Building,
  TrendingUp,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Heart,
  Users,
  User,
  Baby,
  Calendar,
  IndianRupee,
  SortAsc,
  SortDesc,
  Grid,
  List,
  MapPin
} from 'lucide-react';
import axios from 'axios';
import InsuranceCard from '../../components/InsuranceCard';

const InsuranceList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [totalPlans, setTotalPlans] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    planType: searchParams.get('type') || 'all',
    minSumInsured: '',
    maxSumInsured: '',
    minPremium: '',
    maxPremium: '',
    companyId: '',
    sortBy: searchParams.get('sort') || 'popular',
    search: searchParams.get('search') || ''
  });

  // Companies list for filter
  const [companies, setCompanies] = useState([]);

  // Plan types
  const planTypes = [
    { id: 'all', label: 'All Plans' },
    { id: 'individual', label: 'Individual' },
    { id: 'family_floater', label: 'Family Floater' },
    { id: 'critical_illness', label: 'Critical Illness' },
    { id: 'senior_citizen', label: 'Senior Citizen' },
    { id: 'maternity', label: 'Maternity' }
  ];

  // Sort options
  const sortOptions = [
    { id: 'popular', label: 'Most Popular' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'price_low', label: 'Price: Low to High' },
    { id: 'price_high', label: 'Price: High to Low' },
    { id: 'sum_insured', label: 'Highest Coverage' },
    { id: 'newest', label: 'Newest First' }
  ];

  // Fetch plans on load and filter change
  useEffect(() => {
    fetchPlans();
    fetchCompanies();
  }, [filters, currentPage]);

  // Update filters from URL params
  useEffect(() => {
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    
    if (type) setFilters(prev => ({ ...prev, planType: type }));
    if (search) setFilters(prev => ({ ...prev, search }));
    if (sort) setFilters(prev => ({ ...prev, sortBy: sort }));
  }, [searchParams]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage);
      queryParams.append('limit', 12);
      
      if (filters.planType && filters.planType !== 'all') {
        queryParams.append('planType', filters.planType);
      }
      if (filters.minSumInsured) {
        queryParams.append('minSumInsured', filters.minSumInsured);
      }
      if (filters.maxSumInsured) {
        queryParams.append('maxSumInsured', filters.maxSumInsured);
      }
      if (filters.minPremium) {
        queryParams.append('minPremium', filters.minPremium);
      }
      if (filters.maxPremium) {
        queryParams.append('maxPremium', filters.maxPremium);
      }
      if (filters.companyId) {
        queryParams.append('companyId', filters.companyId);
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      if (filters.sortBy && filters.sortBy !== 'popular') {
        queryParams.append('sort', filters.sortBy);
      }

      const response = await axios.get(`/api/insurance/plans?${queryParams.toString()}`);
      
      if (response.data.success) {
        setPlans(response.data.data);
        setTotalPlans(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/api/insurance/companies');
      if (response.data.success) {
        setCompanies(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      planType: 'all',
      minSumInsured: '',
      maxSumInsured: '',
      minPremium: '',
      maxPremium: '',
      companyId: '',
      sortBy: 'popular',
      search: ''
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => 
      value !== '' && value !== 'all' && value !== 'popular'
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-12 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="flex gap-4 mb-6">
              <div className="h-10 w-32 bg-gray-200 rounded"></div>
              <div className="h-10 w-32 bg-gray-200 rounded"></div>
              <div className="h-10 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-xl h-64"></div>
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Health Insurance Plans
              </h1>
              <p className="text-sm text-gray-500">
                {totalPlans} plans available • Compare and choose the best
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* View toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters || hasActiveFilters()
                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters() && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {Object.values(filters).filter(v => v !== '' && v !== 'all' && v !== 'popular').length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ============================================
              FILTERS SIDEBAR
              ============================================ */}
          {showFilters && (
            <div className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </h3>
                  {hasActiveFilters() && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Plan Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Type
                  </label>
                  <div className="space-y-2">
                    {planTypes.map((type) => (
                      <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="planType"
                          value={type.id}
                          checked={filters.planType === type.id}
                          onChange={(e) => handleFilterChange('planType', e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sum Insured */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sum Insured (₹)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minSumInsured}
                      onChange={(e) => handleFilterChange('minSumInsured', e.target.value)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxSumInsured}
                      onChange={(e) => handleFilterChange('maxSumInsured', e.target.value)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Premium */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Premium (₹)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPremium}
                      onChange={(e) => handleFilterChange('minPremium', e.target.value)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPremium}
                      onChange={(e) => handleFilterChange('maxPremium', e.target.value)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Company */}
                {companies.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance Company
                    </label>
                    <select
                      value={filters.companyId}
                      onChange={(e) => handleFilterChange('companyId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Companies</option>
                      {companies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Apply Filters Button */}
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors duration-200"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* ============================================
              PLANS GRID
              ============================================ */}
          <div className="flex-1">
            {/* Results count */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">
                Showing {plans.length} of {totalPlans} plans
              </p>
              {hasActiveFilters() && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {filters.planType && filters.planType !== 'all' && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                      {planTypes.find(t => t.id === filters.planType)?.label}
                    </span>
                  )}
                  {filters.minSumInsured && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                      ₹{filters.minSumInsured}+
                    </span>
                  )}
                  {filters.maxSumInsured && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                      ₹{filters.maxSumInsured}-
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Plans Display */}
            {plans.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {plans.map((plan) => (
                  <InsuranceCard key={plan._id} plan={plan} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Plans Found</h3>
                  <p className="text-gray-500 mb-4">
                    We couldn't find any plans matching your criteria.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="text-gray-400">…</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceList;