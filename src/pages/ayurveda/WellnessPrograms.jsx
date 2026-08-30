import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAyurvedaDoctors } from '../../services/ayurvedaApi';
import api from '../../services/api';
import { FaStar, FaRupeeSign, FaClock, FaUserMd, FaArrowLeft, FaFilter } from 'react-icons/fa';

const WellnessPrograms = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'default',
    minPrice: '',
    maxPrice: ''
  });

  const categories = [
    'digestive_wellness',
    'stress_sleep',
    'joint_mobility',
    'skin_hair',
    'womens_wellness',
    'weight_management',
    'general_wellness'
  ];

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ayurveda/wellness-programs');
      if (response.data.success) {
        setPrograms(response.data.data || []);
      }
    } catch (err) {
      setError('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.sortBy !== 'default') params.append('sortBy', filters.sortBy);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      
      const response = await api.get(`/ayurveda/wellness-programs?${params.toString()}`);
      if (response.data.success) {
        setPrograms(response.data.data || []);
      }
    } catch (err) {
      setError('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/ayurveda')}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6"
        >
          <FaArrowLeft /> Back to Ayurveda
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Ayurveda Wellness Programs</h1>
          <p className="text-gray-600 mt-2">Structured programs designed by Ayurveda doctors for your holistic wellness</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg"
            >
              <option value="default">Sort By</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="Min Price (₹)"
              className="p-2 border rounded-lg"
            />
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="Max Price (₹)"
              className="p-2 border rounded-lg"
            />
          </div>
          <button
            onClick={applyFilters}
            className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <FaFilter /> Apply Filters
          </button>
        </div>

        {/* Programs Grid */}
        {programs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No wellness programs found</p>
            <p className="text-gray-400">Check back later for new programs</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 text-white">
                  <h3 className="font-semibold text-lg">{program.name}</h3>
                  <p className="text-green-100 text-sm">{program.category?.replace(/_/g, ' ')}</p>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <span className="flex items-center gap-1 text-sm">
                      <FaClock className="text-gray-400" /> {program.duration}
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <FaStar className="text-yellow-400" /> {program.doctorRating || 'New'}
                    </span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{program.doctorName}</p>
                        <p className="text-xs text-gray-500">{program.doctorSpecialization}</p>
                      </div>
                      <p className="font-bold text-green-600 text-xl">₹{program.price}</p>
                    </div>
                    <button
                      onClick={() => navigate('/ayurveda/book-consultation', { 
                        state: { 
                          doctor: { _id: program.doctorId, name: program.doctorName },
                          wellnessProgram: program 
                        } 
                      })}
                      className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
                    >
                      Book Program
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Disclaimer:</strong> Wellness programs are designed and delivered by independent Ayurveda doctors.
            HospitalHub only facilitates booking and does not provide medical services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WellnessPrograms;