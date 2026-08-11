import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaMoneyBillWave,
  FaChartLine,
  FaDownload,
  FaFilter,
  FaCalendarAlt,
  FaSearch,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaArrowLeft,
  FaFileInvoice,
  FaUserMd,
  FaBuilding,
  FaRupeeSign
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import axios from 'axios';

const AdminInsuranceClaims = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [selectedClaim, setSelectedClaim] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchClaims();
  }, [filters]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/insurance-admin/claims`,
        {
          params: {
            status: filters.status !== 'all' ? filters.status : undefined,
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
            search: filters.search || undefined
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setClaims(response.data.data.claims || []);
      setSummary(response.data.data.summary);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      window.open(
        `${process.env.REACT_APP_API_URL}/api/insurance-admin/claims/export?${new URLSearchParams(filters).toString()}`,
        '_blank'
      );
    } catch (error) {
      alert('Failed to export report');
    }
  };

  const handleUpdateStatus = async (claimId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/insurance-admin/claims/${claimId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Claim status updated successfully!');
      fetchClaims();
    } catch (error) {
      alert('Failed to update claim status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading claims...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Claims',
      value: summary?.totalClaims || 0,
      icon: <FaFileInvoice className="text-blue-500" />,
      color: 'blue'
    },
    {
      label: 'Pending',
      value: summary?.pending || 0,
      icon: <FaClock className="text-yellow-500" />,
      color: 'yellow'
    },
    {
      label: 'Approved',
      value: summary?.approved || 0,
      icon: <FaCheckCircle className="text-green-500" />,
      color: 'green'
    },
    {
      label: 'Settled Amount',
      value: `₹${summary?.totalSettled?.toLocaleString() || 0}`,
      icon: <FaRupeeSign className="text-purple-500" />,
      color: 'purple'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'yellow',
      'under_review': 'blue',
      'approved': 'green',
      'rejected': 'red',
      'settled': 'green',
      'partially_settled': 'orange'
    };
    return colors[status] || 'gray';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'under_review': 'Under Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'settled': 'Settled',
      'partially_settled': 'Partially Settled'
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Insurance Claims</h1>
            <p className="text-gray-600 mt-1">Manage and track insurance claims</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <FaDownload /> Export Report
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              <FaArrowLeft /> Back
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-sm p-6 border-t-4 border-${stat.color}-500`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm font-medium">{stat.label}</span>
                <span className={`text-${stat.color}-500 text-xl`}>{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="settled">Settled</option>
                <option value="partially_settled">Partially Settled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by policy or customer..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Policy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                      No claims found
                    </td>
                  </tr>
                ) : (
                  claims.map((claim, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedClaim(claim)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                        {claim.claimNumber || claim._id?.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {claim.policyId?.policyNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {claim.userId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                        ₹{claim.claimAmount?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(claim.createdAt), 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(claim.status)}-100 text-${getStatusColor(claim.status)}-600`}>
                          {getStatusLabel(claim.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {claim.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(claim._id, 'under_review')}
                              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                            >
                              Review
                            </button>
                          )}
                          {claim.status === 'under_review' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(claim._id, 'approved')}
                                className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(claim._id, 'rejected')}
                                className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {claim.status === 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(claim._id, 'settled')}
                              className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded hover:bg-purple-200"
                            >
                              Settle
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInsuranceClaims;

