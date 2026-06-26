import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchDoctors } from '../../services/onlineDoctorApi';

const DoctorSearch = () => {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    specialty: searchParams.get('specialty') || '',
    language: '',
    gender: '',
    minExperience: '',
    maxFee: '',
    minRating: '',
    available: searchParams.get('available') || '',
    sort: 'rating',
    page: 1,
  });

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.q) params.specialty = filters.q;
      if (filters.specialty) params.specialty = filters.specialty;
      if (filters.language) params.language = filters.language;
      if (filters.gender) params.gender = filters.gender;
      if (filters.minExperience) params.minExperience = filters.minExperience;
      if (filters.maxFee) params.maxFee = filters.maxFee;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.available) params.available = filters.available;
      if (filters.sort) params.sort = filters.sort;
      params.page = filters.page;

      const response = await searchDoctors(params);
      setDoctors(response.data?.data || []);
      setPagination(response.data?.pagination || { page: 1, total: 0, pages: 1 });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ q: '', specialty: '', language: '', gender: '', minExperience: '', maxFee: '', minRating: '', available: '', sort: 'rating', page: 1 });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/online-doctor" className="text-blue-600 hover:underline text-sm">← Back</Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">Find a Doctor</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-20">
              <h3 className="font-bold text-gray-800 mb-4 flex justify-between">
                Filters
                <button onClick={clearFilters} className="text-blue-500 text-sm font-normal">Clear All</button>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Specialty</label>
                  <input type="text" value={filters.specialty} onChange={(e) => setFilters({ ...filters, specialty: e.target.value, page: 1 })} placeholder="e.g., Dermatologist" className="w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Language</label>
                  <select value={filters.language} onChange={(e) => setFilters({ ...filters, language: e.target.value, page: 1 })} className="w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none">
                    <option value="">All</option>
                    <option>Hindi</option><option>English</option><option>Tamil</option><option>Telugu</option>
                    <option>Bengali</option><option>Marathi</option><option>Gujarati</option><option>Kannada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                  <select value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value, page: 1 })} className="w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none">
                    <option value="">Any</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Max Fee (₹)</label>
                  <input type="number" value={filters.maxFee} onChange={(e) => setFilters({ ...filters, maxFee: e.target.value, page: 1 })} placeholder="e.g., 1000" className="w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Min Experience</label>
                  <input type="number" value={filters.minExperience} onChange={(e) => setFilters({ ...filters, minExperience: e.target.value, page: 1 })} placeholder="e.g., 5 years" className="w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none" />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={filters.available === 'true'} onChange={(e) => setFilters({ ...filters, available: e.target.checked ? 'true' : '', page: 1 })} className="w-4 h-4 text-blue-600" />
                  Available Now Only
                </label>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <p className="text-gray-600 font-medium">{pagination.total} doctor{pagination.total !== 1 ? 's' : ''} found</p>
              <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })} className="border-2 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-blue-400 focus:outline-none">
                <option value="rating">Sort: Highest Rated</option>
                <option value="fee_low">Sort: Fee (Low to High)</option>
                <option value="fee_high">Sort: Fee (High to Low)</option>
                <option value="experience">Sort: Most Experienced</option>
                <option value="reviews">Sort: Most Reviews</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin text-6xl mb-4">⏳</div>
                <p className="text-gray-500">Searching best doctors for you...</p>
              </div>
            ) : doctors.length > 0 ? (
              <div className="space-y-4">
                {doctors.map((doctor) => (
                  <Link key={doctor._id} to={`/online-doctor/doctor/${doctor._id}`} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition block">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 mx-auto sm:mx-0">👨‍⚕️</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">Dr. {doctor.name}</h3>
                          <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">₹{doctor.consultationFee}</p>
                          <p className="text-xs text-gray-400">{doctor.consultationDuration} mins</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                        <span className="font-medium">{doctor.qualification}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{doctor.experience} yrs exp</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-yellow-500 font-bold">⭐ {doctor.ratingSummary?.averageRating || 'New'}</span>
                        <span className="text-gray-400">({doctor.ratingSummary?.totalReviews || 0})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {doctor.languages?.map((lang) => (
                          <span key={lang} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-medium">{lang}</span>
                        ))}
                      </div>
                      {doctor.hospitalAffiliation?.mentioned && (
                        <p className="text-sm text-gray-400 mt-2">🏥 {doctor.hospitalAffiliation.hospitalName}, {doctor.hospitalAffiliation.city}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg">No doctors found</p>
                <p className="text-gray-400">Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="mt-4 text-blue-600 hover:underline">Clear all filters</button>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setFilters({ ...filters, page })}
                    className={`w-10 h-10 rounded-xl font-medium transition ${
                      filters.page === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSearch;