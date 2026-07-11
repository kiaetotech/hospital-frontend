import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const InsuranceList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [totalPlans, setTotalPlans] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
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
  
  // User search criteria from URL
  const [userAge, setUserAge] = useState('');
  const [userPincode, setUserPincode] = useState('');
  const [selectedMembers, setSelectedMembers] = useState({});

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
    const age = searchParams.get('age');
    const pincode = searchParams.get('pincode');
    const members = searchParams.get('members');
    
    if (type) setFilters(prev => ({ ...prev, planType: type }));
    if (search) setFilters(prev => ({ ...prev, search }));
    if (sort) setFilters(prev => ({ ...prev, sortBy: sort }));
    if (age) setUserAge(age);
    if (pincode) setUserPincode(pincode);
    if (members) {
      try {
        setSelectedMembers(JSON.parse(members));
      } catch (e) {
        console.log('Error parsing members:', e);
      }
    }
  }, [searchParams]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage);
      queryParams.append('limit', 12);
      
      // Add search criteria from URL
      if (userAge) queryParams.append('age', userAge);
      if (userPincode) queryParams.append('pincode', userPincode);
      if (Object.keys(selectedMembers).length > 0) {
        queryParams.append('members', JSON.stringify(selectedMembers));
      }
      
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
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading insurance plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🛡️ Health Insurance Plans
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {totalPlans} plans available • Compare and choose the best
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search plans..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    style={{ 
                      padding: '8px 12px 8px 36px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      width: '200px',
                      outline: 'none'
                    }}
                  />
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
                </div>

                {/* View toggle */}
                <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{ 
                      padding: '6px 12px', 
                      backgroundColor: viewMode === 'grid' ? '#2563eb' : 'white',
                      color: viewMode === 'grid' ? 'white' : '#4b5563',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    ▦ Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{ 
                      padding: '6px 12px', 
                      backgroundColor: viewMode === 'list' ? '#2563eb' : 'white',
                      color: viewMode === 'list' ? 'white' : '#4b5563',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    ☰ List
                  </button>
                </div>

                {/* Filter toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '8px', 
                    border: '1px solid #d1d5db',
                    backgroundColor: showFilters || hasActiveFilters() ? '#2563eb' : 'white',
                    color: showFilters || hasActiveFilters() ? 'white' : '#4b5563',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  ⚙️ Filters
                  {hasActiveFilters() && (
                    <span style={{ 
                      backgroundColor: '#f59e0b', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: '20px', 
                      height: '20px', 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {Object.values(filters).filter(v => v !== '' && v !== 'all' && v !== 'popular').length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Search criteria banner */}
            {(userAge || userPincode || Object.keys(selectedMembers).length > 0) && (
              <div style={{ 
                backgroundColor: '#eff6ff', 
                padding: '0.75rem 1rem', 
                borderRadius: '8px',
                border: '1px solid #bfdbfe'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                  🎯 Showing plans for: 
                  {userAge && ` Age: ${userAge}`}
                  {userPincode && ` • Pincode: ${userPincode}`}
                  {Object.keys(selectedMembers).filter(k => selectedMembers[k]).length > 0 && 
                    ` • Members: ${Object.keys(selectedMembers).filter(k => selectedMembers[k]).join(', ')}`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Filters Sidebar */}
          {showFilters && (
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 'bold' }}>⚙️ Filters</h3>
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {/* Plan Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px' }}>Plan Type</label>
                  <select
                    value={filters.planType}
                    onChange={(e) => handleFilterChange('planType', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  >
                    {planTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Sum Insured */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px' }}>Sum Insured (₹)</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minSumInsured}
                      onChange={(e) => handleFilterChange('minSumInsured', e.target.value)}
                      style={{ width: '50%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxSumInsured}
                      onChange={(e) => handleFilterChange('maxSumInsured', e.target.value)}
                      style={{ width: '50%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                {/* Premium */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px' }}>Premium (₹)</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPremium}
                      onChange={(e) => handleFilterChange('minPremium', e.target.value)}
                      style={{ width: '50%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPremium}
                      onChange={(e) => handleFilterChange('maxPremium', e.target.value)}
                      style={{ width: '50%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                {/* Company */}
                {companies.length > 0 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px' }}>Insurance Company</label>
                    <select
                      value={filters.companyId}
                      onChange={(e) => handleFilterChange('companyId', e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    >
                      <option value="">All Companies</option>
                      {companies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.name || company.companyName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sort */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px' }}>Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Showing {plans.length} of {totalPlans} plans
            </p>
            {hasActiveFilters() && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Active filters:</span>
                {filters.planType && filters.planType !== 'all' && (
                  <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem' }}>
                    {planTypes.find(t => t.id === filters.planType)?.label}
                  </span>
                )}
                {filters.minSumInsured && (
                  <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem' }}>
                    ₹{filters.minSumInsured}+
                  </span>
                )}
                {filters.maxSumInsured && (
                  <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem' }}>
                    ₹{filters.maxSumInsured}-
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Plans Grid */}
          {plans.length > 0 ? (
            <div style={{ 
              display: viewMode === 'grid' 
                ? 'grid' 
                : 'flex',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              {plans.map((plan) => (
                <div key={plan._id} style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  padding: viewMode === 'grid' ? '1.5rem' : '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: viewMode === 'list' ? 'flex' : 'block',
                  gap: viewMode === 'list' ? '1rem' : '0',
                  alignItems: viewMode === 'list' ? 'center' : 'stretch',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}>
                  {/* Company Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      backgroundColor: '#dbeafe', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '1.25rem'
                    }}>
                      🏢
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                        {plan.companyId?.name || 'Insurance Company'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {plan.planType?.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                      <span>⭐</span>
                      <span>{plan.rating || 0}</span>
                    </div>
                  </div>

                  {/* Plan Name */}
                  <div onClick={() => navigate(`/insurance/plan/${plan._id}`)} style={{ cursor: 'pointer' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e3a5f' }}>
                      {plan.planName}
                    </h3>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '4px 0' }}>
                    {plan.shortDescription || plan.description || 'Comprehensive health insurance plan'}
                  </p>

                  {/* Features */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '8px 0' }}>
                    {(plan.features || []).slice(0, viewMode === 'grid' ? 3 : 5).map((feature, idx) => (
                      <span key={idx} style={{ 
                        fontSize: '0.65rem', 
                        backgroundColor: '#f3f4f6', 
                        padding: '2px 10px', 
                        borderRadius: '12px',
                        color: '#4b5563'
                      }}>
                        ✅ {typeof feature === 'string' ? feature.substring(0, 20) : feature.title?.substring(0, 20)}
                      </span>
                    ))}
                  </div>

                  {/* Price & Actions */}
                  <div style={{ 
                    display: viewMode === 'list' ? 'flex' : 'block',
                    justifyContent: viewMode === 'list' ? 'space-between' : 'flex-start',
                    alignItems: viewMode === 'list' ? 'center' : 'stretch',
                    marginTop: viewMode === 'grid' ? '1rem' : '0',
                    borderTop: viewMode === 'grid' ? '1px solid #e5e7eb' : 'none',
                    paddingTop: viewMode === 'grid' ? '1rem' : '0'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: viewMode === 'list' ? 'row' : 'column',
                      alignItems: viewMode === 'list' ? 'center' : 'flex-start',
                      gap: viewMode === 'list' ? '1rem' : '0'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Starting from</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                          ₹{plan.personalizedPremium ? plan.personalizedPremium.toLocaleString() : plan.basePremium?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>
                          {plan.monthlyPrice ? `₹${plan.monthlyPrice}/month` : 'per year incl. GST'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Sum Insured</div>
                        <div style={{ fontWeight: 'bold' }}>₹{plan.sumInsured?.default?.toLocaleString()}</div>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem',
                      marginTop: viewMode === 'grid' ? '0.75rem' : '0',
                      flex: viewMode === 'list' ? 1 : 'none',
                      justifyContent: viewMode === 'list' ? 'flex-end' : 'stretch'
                    }}>
                      <button 
                        onClick={() => navigate(`/insurance/plan/${plan._id}`)} 
                        style={{ 
                          flex: 1, 
                          padding: '8px 16px', 
                          backgroundColor: '#2563eb', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }}
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => navigate(`/insurance/apply/${plan._id}`)} 
                        style={{ 
                          flex: 1, 
                          padding: '8px 16px', 
                          backgroundColor: '#f59e0b', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }}
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>No Plans Found</h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>We couldn't find any plans matching your criteria.</p>
              <button
                onClick={clearFilters}
                style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ 
                  padding: '8px 16px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
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
                      style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '6px',
                        border: currentPage === page ? 'none' : '1px solid #d1d5db',
                        backgroundColor: currentPage === page ? '#2563eb' : 'white',
                        color: currentPage === page ? 'white' : '#4b5563',
                        cursor: 'pointer',
                        fontWeight: currentPage === page ? 'bold' : 'normal'
                      }}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} style={{ color: '#6b7280' }}>…</span>;
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ 
                  padding: '8px 16px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsuranceList;
