// D:\hospital-frontend\src\pages\insurance\InsurancePreAuth.jsx
// ============================================
// CASH-LESS PRE-AUTHORIZATION
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft, FaHospital, FaFileAlt, FaCheckCircle, FaTimesCircle,
  FaClock, FaExclamationTriangle, FaPlus,
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-e2d5.up.railway.app';
const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const patientHeaders = () => {
  const t = localStorage.getItem('patientToken') || localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export default function InsurancePreAuth() {
  const { policyId } = useParams();
  const navigate = useNavigate();

  const [policy, setPolicy] = useState(null);
  const [preauths, setPreauths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    hospitalName: '',
    hospitalAddress: '',
    admissionDate: '',
    admissionType: 'planned',
    diagnosis: '',
    treatment: '',
    estimatedCost: '',
    requestedAmount: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const policyRes = await fetch(`${API_URL}/api/insurance/my-policies/${policyId}`, { headers: patientHeaders() });
      const policyData = await policyRes.json();
      if (policyData.success) setPolicy(policyData.data);

      const preauthRes = await fetch(`${API_URL}/api/insurance-preauth/policy/${policyId}`, { headers: patientHeaders() });
      const preauthData = await preauthRes.json();
      if (preauthData.success) setPreauths(preauthData.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [policyId]);

  const submitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true); setMessage('');
    try {
      const r = await fetch(`${API_URL}/api/insurance-preauth/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...patientHeaders() },
        body: JSON.stringify({
          policyId,
          ...form,
          estimatedCost: Number(form.estimatedCost),
          requestedAmount: Number(form.requestedAmount),
        }),
      });
      const data = await r.json();
      if (data.success) {
        setMessage('✅ Pre-auth submitted. The insurer will review within 24 hours.');
        setShowForm(false);
        setForm({
          hospitalName: '', hospitalAddress: '', admissionDate: '',
          admissionType: 'planned', diagnosis: '', treatment: '',
          estimatedCost: '', requestedAmount: '',
        });
        await loadData();
      } else {
        setMessage('❌ ' + (data.error?.message || 'Failed'));
      }
    } catch (e) {
      setMessage('❌ ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const respondToQuery = async (id) => {
    const response = window.prompt('Enter your response to the insurer query:');
    if (!response) return;
    try {
      const r = await fetch(`${API_URL}/api/insurance-preauth/${id}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...patientHeaders() },
        body: JSON.stringify({ response }),
      });
      const data = await r.json();
      if (data.success) {
        setMessage('✅ Response submitted');
        await loadData();
      } else {
        setMessage('❌ ' + (data.error?.message || 'Failed'));
      }
    } catch (e) {
      setMessage('❌ ' + e.message);
    }
  };

  const cancelPreAuth = async (id) => {
    if (!window.confirm('Cancel this pre-auth request?')) return;
    try {
      const r = await fetch(`${API_URL}/api/insurance-preauth/${id}/cancel`, {
        method: 'POST',
        headers: patientHeaders(),
      });
      const data = await r.json();
      if (data.success) {
        setMessage('✅ Pre-auth cancelled');
        await loadData();
      } else {
        setMessage('❌ ' + (data.error?.message || 'Failed'));
      }
    } catch (e) {
      setMessage('❌ ' + e.message);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading…</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to={`/insurance/my-policies/${policyId}`} className="text-sm text-slate-500 flex items-center gap-1 mb-3">
            <FaArrowLeft /> Back to policy
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Cashless Pre-Authorization</h1>
              <p className="text-slate-500 text-sm mt-1">
                {policy?.policyName} — Policy No: {policy?.policyNumber}
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700"
            >
              <FaPlus /> New Pre-Auth
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">{error}</div>}
        {message && <div className="bg-slate-50 border rounded-lg p-3 mb-6 text-sm">{message}</div>}

        {showForm && (
          <form onSubmit={submitForm} className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="font-bold text-slate-800 mb-4">New Pre-Authorization Request</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Hospital Name *</label>
                <input required value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Hospital Address</label>
                <input value={form.hospitalAddress} onChange={(e) => setForm({ ...form, hospitalAddress: e.target.value })} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Admission Date *</label>
                <input type="date" required value={form.admissionDate} onChange={(e) => setForm({ ...form, admissionDate: e.target.value })} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Admission Type</label>
                <select value={form.admissionType} onChange={(e) => setForm({ ...form, admissionType: e.target.value })} className="w-full border rounded px-3 py-2">
                  <option value="planned">Planned</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Diagnosis</label>
                <input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Treatment</label>
                <input value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Estimated Cost (₹) *</label>
                <input type="number" required value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Requested Amount (₹) *</label>
                <input type="number" required value={form.requestedAmount} onChange={(e) => setForm({ ...form, requestedAmount: e.target.value })} className="w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">
                {submitting ? 'Submitting…' : 'Submit Pre-Auth'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-lg">Cancel</button>
            </div>
          </form>
        )}

        <h3 className="font-bold text-slate-800 mb-4">Pre-Auth History ({preauths.length})</h3>

        {preauths.length === 0 && (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <FaHospital className="text-5xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No pre-auth requests yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {preauths.map((pa) => <PreAuthCard key={pa._id} preauth={pa} onRespond={respondToQuery} onCancel={cancelPreAuth} />)}
        </div>
      </div>
    </div>
  );
}

function PreAuthCard({ preauth, onRespond, onCancel }) {
  const status = String(preauth.status || '').toLowerCase();

  const statusStyles = {
    submitted: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <FaClock />, label: 'Submitted' },
    under_review: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <FaClock />, label: 'Under Review' },
    query_raised: { bg: 'bg-orange-100', text: 'text-orange-700', icon: <FaExclamationTriangle />, label: 'Query Raised' },
    approved: { bg: 'bg-green-100', text: 'text-green-700', icon: <FaCheckCircle />, label: 'Approved' },
    partially_approved: { bg: 'bg-green-100', text: 'text-green-700', icon: <FaCheckCircle />, label: 'Partially Approved' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: <FaTimesCircle />, label: 'Rejected' },
    expired: { bg: 'bg-slate-100', text: 'text-slate-600', icon: <FaClock />, label: 'Expired' },
  }[status] || { bg: 'bg-slate-100', text: 'text-slate-600', icon: <FaFileAlt />, label: status };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="font-bold text-slate-800">{preauth.preAuthNumber}</div>
          <div className="text-sm text-slate-500">{preauth.hospitalName}</div>
          <div className="text-xs text-slate-400 mt-1">
            Admission: {preauth.admissionDate ? new Date(preauth.admissionDate).toLocaleDateString() : '—'}
          </div>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-bold ${statusStyles.bg} ${statusStyles.text} flex items-center gap-1`}>
          {statusStyles.icon} {statusStyles.label}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-y border-slate-100">
        <Field label="Estimated Cost" value={inr(preauth.estimatedCost)} />
        <Field label="Requested" value={inr(preauth.requestedAmount)} />
        {preauth.approvedAmount > 0 && <Field label="Approved" value={inr(preauth.approvedAmount)} highlight />}
      </div>

      {preauth.queryMessage && (
        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
          <div className="font-semibold text-orange-800 mb-1">Insurer Query:</div>
          <div className="text-orange-700">{preauth.queryMessage}</div>
          {preauth.queryResponse && (
            <div className="mt-2 pt-2 border-t border-orange-200 text-xs text-orange-600">
              Your response: {preauth.queryResponse}
            </div>
          )}
        </div>
      )}

      {preauth.rejectionReason && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
          <div className="font-semibold text-red-800 mb-1">Rejection Reason:</div>
          <div className="text-red-700">{preauth.rejectionReason}</div>
        </div>
      )}

      {status === 'approved' && preauth.validUntil && (
        <div className="mt-3 text-xs text-green-700">
          ✅ Valid until {new Date(preauth.validUntil).toLocaleDateString()}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        {status === 'query_raised' && (
          <button onClick={() => onRespond(preauth._id)} className="text-xs px-3 py-1.5 bg-orange-600 text-white rounded-lg font-semibold">
            Respond to Query
          </button>
        )}
        {['submitted', 'under_review', 'query_raised'].includes(status) && (
          <button onClick={() => onCancel(preauth._id)} className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-lg font-semibold">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, highlight }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`font-bold ${highlight ? 'text-green-600' : 'text-slate-800'}`}>{value}</div>
    </div>
  );
}