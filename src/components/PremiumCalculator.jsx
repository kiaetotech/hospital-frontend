import React, { useState } from 'react';
import axios from 'axios';
import {
  IndianRupee,
  User,
  Users,
  Calendar,
  Heart,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

const PremiumCalculator = ({ defaultPlanId = null }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    planId: defaultPlanId || '',
    age: 30,
    sumInsured: '',
    membersCount: 1,
    isSmoker: false,
    gender: 'male'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(null);
    setResult(null);
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    
    if (!formData.planId) {
      setError('Please select a plan first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/insurance/calculate-premium', {
        planId: formData.planId,
        age: parseInt(formData.age),
        sumInsured: formData.sumInsured ? parseInt(formData.sumInsured) : undefined,
        membersCount: parseInt(formData.membersCount),
        isSmoker: formData.isSmoker
      });

      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError('Failed to calculate premium');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while calculating');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
        <IndianRupee className="w-5 h-5 text-blue-600" />
        Premium Calculator
      </h3>

      <form onSubmit={handleCalculate} className="space-y-4">
        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="w-4 h-4 inline mr-1" />
            Your Age (Years)
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min={18}
            max={80}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Male</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Female</span>
            </label>
          </div>
        </div>

        {/* Sum Insured */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Shield className="w-4 h-4 inline mr-1" />
            Desired Sum Insured (₹)
          </label>
          <input
            type="number"
            name="sumInsured"
            value={formData.sumInsured}
            onChange={handleChange}
            placeholder="e.g., 500000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-xs text-gray-400 mt-1">
            Leave blank to use plan's default sum insured
          </div>
        </div>

        {/* Members Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Users className="w-4 h-4 inline mr-1" />
            Number of Members (Family Floater)
          </label>
          <input
            type="number"
            name="membersCount"
            value={formData.membersCount}
            onChange={handleChange}
            min={1}
            max={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Smoker */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isSmoker"
            checked={formData.isSmoker}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <label className="text-sm text-gray-700 cursor-pointer">
            <Heart className="w-4 h-4 inline mr-1" />
            I am a smoker
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <IndianRupee className="w-5 h-5" />
              Calculate Premium
            </>
          )}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-xs text-gray-500">Total Premium</div>
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(result.totalPremium)}
                </div>
                <div className="text-xs text-gray-400">per year incl. GST</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <div className="text-xs text-gray-500">You Save</div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(result.discountAmount)}
                </div>
                <div className="text-xs text-gray-400">with online discount</div>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Base Premium</span>
              <span className="font-medium">{formatCurrency(result.basePremium)}</span>
            </div>
            {result.breakdown?.ageLoading > 0 && (
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Age Loading</span>
                <span className="font-medium text-orange-600">+{formatCurrency(result.breakdown.ageLoading)}</span>
              </div>
            )}
            {result.breakdown?.familyFloaterAdjustment > 0 && (
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Family Floater Adjustment</span>
                <span className="font-medium text-orange-600">+{formatCurrency(result.breakdown.familyFloaterAdjustment)}</span>
              </div>
            )}
            {result.discountAmount > 0 && (
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Discount ({result.discountPercentage || 0}%)</span>
                <span className="font-medium text-green-600">-{formatCurrency(result.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">GST ({result.gstRate || 18}%)</span>
              <span className="font-medium">+{formatCurrency(result.gstAmount)}</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-gray-800">
              <span>Total Premium</span>
              <span className="text-blue-600">{formatCurrency(result.totalPremium)}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-yellow-800">This is an estimate</div>
                <div className="text-xs text-yellow-700">
                  Final premium may vary based on medical history, lifestyle, and other factors.
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.href = `/insurance/apply/${formData.planId}`}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Apply for this Plan
          </button>
        </div>
      )}
    </div>
  );
};

export default PremiumCalculator;