import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function InsuranceClaims() {
  const [claims, setClaims] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');

  useEffect(() => {
    load();
  }, [status, type]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/insurance/claims/my-claims', { params: { status, type } });
      setClaims(res.data.data || []);
      setSummary(res.data.meta?.summary || null);
    } catch (e) {
      setError(e.response?.data?.error?.message || 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s) => {
    if (['approved', 'settled'].includes(s)) return 'bg-green-100 text-green-700';
    if (s === 'rejected') return 'bg-red-100 text-red-700';
    if (['submitted', 'under_review', 'pending_verification'].includes(s)) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Claims</h1>

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Stat label="Total Claims" value={summary.totalClaims} />
          <Stat label="Pending" value={summary.pendingCount} />
          <Stat label="Settled" value={summary.settledCount} />
        </div>
      )}

      <div className="flex gap-4 mb-4">
        <div>
          <label className="text-xs text-gray-500 block">Status</label>
          <select className="border p-2 rounded" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="settled">Settled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block">Type</label>
          <select className="border p-2 rounded" value={type} onChange={e => setType(e.target.value)}>
            <option value="all">All</option>
            <option value="cashless">Cashless</option>
            <option value="reimbursement">Reimbursement</option>
          </select>
        </div>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && claims.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No claims found.</p>
          <Link to="/insurance/my-policies" className="text-blue-600">Go to My Policies →</Link>
        </div>
      )}

      <div className="space-y-4">
        {claims.map(c => (
          <div key={c._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-mono text-xs text-gray-500">{c.claimNumber}</p>
                <h3 className="font-semibold">{c.policyId?.policyName || 'Policy'}</h3>
                <p className="text-sm text-gray-600">{c.companyId?.companyName}</p>
                <p className="text-sm mt-1">Hospital: {c.hospitalName}</p>
                <p className="text-sm">Amount: ₹{(c.amount || 0).toLocaleString('en-IN')}</p>
                {c.approvedAmount > 0 && (
                  <p className="text-sm text-green-600">Approved: ₹{c.approvedAmount.toLocaleString('en-IN')}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded text-xs font-semibold ${statusColor(c.status)}`}>
                {c.status?.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex gap-2 mt-3">
              <Link to={`/insurance/claims/${c._id}`}
                className="px-3 py-1 border rounded text-sm">View</Link>
              {c.status === 'rejected' && (
                <Link to={`/insurance/claims/${c._id}/appeal`}
                  className="px-3 py-1 border rounded text-sm text-blue-600">Appeal</Link>
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