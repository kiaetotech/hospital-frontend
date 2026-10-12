import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function InsuranceMyPolicies() {
  const [policies, setPolicies] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('active');

  useEffect(() => {
    load();
  }, [tab]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/insurance/my-policies', { params: { status: tab } });
      setPolicies(res.data.data || []);
      setSummary(res.data.meta?.summary || null);
    } catch (e) {
      setError(e.response?.data?.error?.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Insurance</h1>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Stat label="Total Policies" value={summary.totalPolicies} />
          <Stat label="Active" value={summary.activeCount} />
          <Stat label="Sum Insured" value={`₹${((summary.totalSumInsured || 0) / 100000).toFixed(1)}L`} />
          <Stat label="Premium Paid" value={`₹${(summary.totalPremiumPaid || 0).toLocaleString('en-IN')}`} />
        </div>
      )}

      <div className="flex gap-2 border-b mb-4">
        {['active', 'pending', 'expired', 'cancelled', 'all'].map(t => (
          <button key={t}
            className={`px-4 py-2 capitalize ${tab === t ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-600'}`}
            onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && policies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No {tab} policies.</p>
          <Link to="/insurance" className="text-blue-600">Browse plans →</Link>
        </div>
      )}

      <div className="space-y-4">
        {policies.map(p => (
          <div key={p._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{p.planId?.planName || p.policyName}</h3>
                <p className="text-gray-600 text-sm">{p.companyId?.companyName}</p>
                <p className="text-sm mt-1">Policy No: {p.policyNumber}</p>
                <p className="text-sm">₹{((p.sumInsured || 0) / 100000).toFixed(1)} L cover</p>
                <p className="text-sm text-gray-500">
                  Valid: {new Date(p.startDate).toLocaleDateString('en-IN')} →{' '}
                  {new Date(p.endDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-semibold ${
                p.status === 'active' ? 'bg-green-100 text-green-700' :
                p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>{p.status}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link to={`/insurance/my-policies/${p._id}`}
                className="px-3 py-1 border rounded text-sm">View</Link>
              <Link to={`/insurance/claims?policyId=${p._id}`}
                className="px-3 py-1 border rounded text-sm">File Claim</Link>
              {p.status === 'active' && (
                <Link to={`/insurance/my-policies/${p._id}`}
  		className="px-3 py-1 border rounded text-sm">Renew</Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border rounded-lg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-lg">{value}</p>
    </div>
  );
}