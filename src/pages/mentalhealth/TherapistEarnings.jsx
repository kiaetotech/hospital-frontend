import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaWallet,
  FaChartLine,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaDownload,
  FaCalendarAlt,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaCreditCard,
  FaUniversity,
  FaMobileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

const TherapistEarnings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    bankName: '',
    upiId: ''
  });
  const [payoutAmount, setPayoutAmount] = useState('');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch overview
      const overviewRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/mentalhealth/earnings/overview`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setOverview(overviewRes.data.data);

      // Fetch transactions
      const transactionsRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/mentalhealth/payout/wallet/transactions`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTransactions(transactionsRes.data.data.transactions || []);

      // Fetch payout history
      const payoutRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/mentalhealth/payout/payout/history`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPayoutHistory(payoutRes.data.data.payouts || []);

      // Fetch monthly earnings
      if (overviewRes.data.data.monthlyEarnings) {
        setMonthlyEarnings(overviewRes.data.data.monthlyEarnings);
      }

      // Fetch bank details
      const walletRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/mentalhealth/payout/wallet/summary`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (walletRes.data.data.bankDetails) {
        setBankDetails(walletRes.data.data.bankDetails);
      }
    } catch (err) {
      setError('Failed to load earnings data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(payoutAmount) > (overview?.wallet?.balance || 0)) {
      alert('Insufficient balance');
      return;
    }

    setProcessing(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/mentalhealth/payout/payout/request`,
        {
          amount: parseFloat(payoutAmount),
          method: 'bank_transfer'
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      alert('Payout request submitted successfully!');
      setShowPayoutModal(false);
      setPayoutAmount('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to request payout');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateBankDetails = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/mentalhealth/payout/wallet/bank-details`,
        bankDetails,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Bank details updated successfully!');
      setShowBankDetails(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update bank details');
    }
  };

  const handleDownloadReport = async () => {
    try {
      window.open(
        `${process.env.REACT_APP_API_URL}/api/mentalhealth/earnings/report/export`,
        '_blank'
      );
    } catch (err) {
      alert('Failed to download report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading earnings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800">Error</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Available Balance',
      value: `₹${overview?.wallet?.balance?.toFixed(2) || 0}`,
      icon: <FaWallet className="text-blue-500" />,
      color: 'blue'
    },
    {
      label: 'Pending Earnings',
      value: `₹${overview?.wallet?.pendingBalance?.toFixed(2) || 0}`,
      icon: <FaClock className="text-yellow-500" />,
      color: 'yellow'
    },
    {
      label: 'Total Earned',
      value: `₹${overview?.wallet?.totalEarned?.toFixed(2) || 0}`,
      icon: <FaChartLine className="text-green-500" />,
      color: 'green'
    },
    {
      label: 'Total Sessions',
      value: overview?.bookings?.totalSessions || 0,
      icon: <FaMoneyBillWave className="text-purple-500" />,
      color: 'purple'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'yellow',
      'processing': 'blue',
      'completed': 'green',
      'failed': 'red',
      'cancelled': 'gray'
    };
    return colors[status] || 'gray';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'processing': 'Processing',
      'completed': 'Completed',
      'failed': 'Failed',
      'cancelled': 'Cancelled',
      'refunded': 'Refunded'
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'credit': 'Credit',
      'debit': 'Debit',
      'hold': 'Hold',
      'release': 'Release'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Earnings Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your earnings and manage payouts</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowBankDetails(!showBankDetails)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <FaUniversity /> Bank Details
            </button>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaDownload /> Export
            </button>
            <button
              onClick={() => setShowPayoutModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FaMoneyBillWave /> Request Payout
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

        {/* Monthly Earnings Chart */}
        {monthlyEarnings.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Earnings</h2>
            <div className="overflow-x-auto">
              <div className="flex gap-4 min-w-[500px]">
                {monthlyEarnings.map((month, index) => (
                  <div key={index} className="flex-1">
                    <div className="relative">
                      <div
                        className="bg-purple-500 rounded-t"
                        style={{
                          height: `${(month.earnings / Math.max(...monthlyEarnings.map(m => m.earnings))) * 200}px`,
                          minHeight: '20px'
                        }}
                      />
                    </div>
                    <p className="text-xs text-center text-gray-600 mt-2">{month.month}</p>
                    <p className="text-xs text-center font-semibold text-gray-800">
                      ₹{month.earnings.toFixed(0)}
                    </p>
                    <p className="text-xs text-center text-gray-400">{month.sessions} sessions</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transactions & Payout History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h2>
            {transactions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {transactions.slice(0, 10).map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {tx.type === 'credit' ? (
                        <FaArrowUp className="text-green-500" />
                      ) : (
                        <FaArrowDown className="text-red-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{getTypeLabel(tx.type)}</p>
                        <p className="text-xs text-gray-500">{tx.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount?.toFixed(2) || 0}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-${getStatusColor(tx.status)}-100 text-${getStatusColor(tx.status)}-600`}>
                        {getStatusLabel(tx.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payout History */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payout History</h2>
            {payoutHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No payouts yet</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {payoutHistory.slice(0, 10).map((payout, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">₹{payout.amount?.toFixed(2) || 0}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(payout.requestedAt), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(payout.status)}-100 text-${getStatusColor(payout.status)}-600`}>
                        {getStatusLabel(payout.status)}
                      </span>
                      {payout.razorpayResponse?.utr && (
                        <p className="text-xs text-gray-400 mt-1">UTR: {payout.razorpayResponse.utr}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bank Details Modal */}
        {showBankDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Bank Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountHolderName}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bankDetails.ifscCode}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="IFSC0001234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="State Bank of India"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UPI ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={bankDetails.upiId}
                    onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="john@upi"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdateBankDetails}
                  className="flex-1 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Save Details
                </button>
                <button
                  onClick={() => setShowBankDetails(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payout Modal */}
        {showPayoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Request Payout</h2>
              <p className="text-gray-600 mb-4">
                Available Balance: <span className="font-bold text-green-600">₹{overview?.wallet?.balance?.toFixed(2) || 0}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter amount"
                  min="1"
                  max={overview?.wallet?.balance || 0}
                />
                <p className="text-xs text-gray-400 mt-1">Minimum payout: ₹500</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleRequestPayout}
                  disabled={processing}
                  className={`flex-1 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition ${
                    processing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {processing ? <FaSpinner className="animate-spin inline mr-2" /> : null}
                  {processing ? 'Processing...' : 'Request Payout'}
                </button>
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistEarnings;