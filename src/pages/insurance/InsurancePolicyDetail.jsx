// D:\hospital-frontend\src\pages\insurance\InsurancePolicyDetail.jsx
// ============================================
// POLICY DETAIL — with Renewal + Servicing + Portability
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaShieldAlt, FaCheck, FaTimes, FaDownload, FaFileAlt, FaUserEdit,
  FaUserPlus, FaUserMinus, FaSync, FaRedo, FaExchangeAlt,
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-e2cf.up.railway.app';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const patientHeaders = () => {
  const t = localStorage.getItem('patientToken') || localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export default function InsurancePolicyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');

  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claim, setClaim] = useState({ amount: '', description: '', hospitalName: '', hospitalAddress: '', admissionDate: '' });
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');

  const [renewalQuote, setRenewalQuote] = useState(null);
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [serviceAction, setServiceAction] = useState('');
  const [servicePayload, setServicePayload] = useState({});
  const [serviceMessage, setServiceMessage] = useState('');

  const loadPolicy = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/api/insurance/my-policies/${id}`, { headers: patientHeaders() });
      const data = await r.json();
      if (data.success) setPolicy(data.data);
      else setError(data.message || 'Failed to load policy');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load Razorpay SDK on mount
  useEffect(() => {
    if (window.Razorpay) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try { document.body.removeChild(script); } catch (e) {}
    };
  }, []);

  useEffect(() => { loadPolicy(); }, [loadPolicy]);

  const loadRenewalQuote = async () => {
    setRenewalLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/insurance-policy-center/renewal-quote/${id}`, { headers: patientHeaders() });
      const data = await r.json();
      if (data.success) setRenewalQuote(data.data);
      else setError(data.error?.message || 'Failed to load quote');
    } catch (e) { setError(e.message); }
    finally { setRenewalLoading(false); }
  };

  useEffect(() => {
    if (tab === 'renewal' && !renewalQuote) loadRenewalQuote();
  }, [tab]);

  const submitClaim = async (e) => {
    e.preventDefault();
    setClaimSubmitting(true); setClaimMessage('');
    try {
      const r = await fetch(`${API_URL}/api/insurance/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...patientHeaders() },
        body: JSON.stringify({ policyId: policy._id, ...claim, amount: Number(claim.amount) }),
      });
      const data = await r.json();
      if (data.success) {
        setClaimMessage('✅ Claim submitted successfully.');
        setShowClaimForm(false);
        await loadPolicy();
      } else {
        setClaimMessage('❌ ' + (data.message || 'Failed'));
      }
    } catch (e) { setClaimMessage('❌ ' + e.message); }
    finally { setClaimSubmitting(false); }
  };

    const downloadPolicy = async () => {
    try {
      const r = await fetch(`${API_URL}/api/insurance/download-policy/${policy._id}`, { headers: patientHeaders() });
      if (!r.ok) throw new Error('Failed');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${policy.policyNumber}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { setClaimMessage('❌ Unable to download: ' + e.message); }
  };

  const downloadReceipt = async () => {
    try {
      const r = await fetch(`${API_URL}/api/insurance/download-receipt/${policy._id}`, { headers: patientHeaders() });
      if (!r.ok) throw new Error('Failed');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${policy.policyNumber}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { setClaimMessage('❌ Unable to download receipt: ' + e.message); }
  };

  const downloadMemberCard = async () => {
    try {
      const r = await fetch(`${API_URL}/api/insurance/download-member-card/${policy._id}`, { headers: patientHeaders() });
      if (!r.ok) throw new Error('Failed');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `card-${policy.policyNumber}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { setClaimMessage('❌ Unable to download member card: ' + e.message); }
  };

  const submitRenewal = async () => {
    setRenewalLoading(true);
    try {
      if (typeof window.Razorpay !== 'function') {
        throw new Error('Razorpay SDK not loaded. Please refresh.');
      }

      // 1) Create order
      const orderRes = await fetch(`${API_URL}/api/insurance-policy-center/renewal/create-order/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...patientHeaders() },
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error?.message || 'Order creation failed');

      const { orderId, amount, razorpayKey } = orderData.data;
      if (!razorpayKey) throw new Error('Razorpay not configured');

      // 2) Open Razorpay
      const options = {
        key: razorpayKey,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'HospitalHub Insurance',
        description: 'Policy Renewal — ' + policy.policyName,
        order_id: orderId,
        theme: { color: '#16a34a' },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_URL}/api/insurance-policy-center/renewal/verify-payment/${id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...patientHeaders() },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              setError(verifyData.error?.message || 'Verification failed');
              setRenewalLoading(false);
              return;
            }
            setPolicy(verifyData.data.policy);
            setRenewalQuote(null);
            setTab('overview');
            alert('✅ Policy renewed. New validity: ' + new Date(verifyData.data.policy.endDate).toLocaleDateString());
          } catch (e) {
            setError('Renewal verification failed: ' + e.message);
          } finally {
            setRenewalLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setRenewalLoading(false);
            setError('Renewal cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setError('Payment failed: ' + (resp.error?.description || 'Unknown'));
        setRenewalLoading(false);
      });
      rzp.open();
    } catch (e) {
      setError(e.message);
      setRenewalLoading(false);
    }
  };

  const submitService = async () => {
    setServiceMessage('');
    try {
      const r = await fetch(`${API_URL}/api/insurance-policy-center/service/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...patientHeaders() },
        body: JSON.stringify({ action: serviceAction, data: servicePayload }),
      });
      const data = await r.json();
      if (data.success) {
        setServiceMessage('✅ Done');
        setServiceAction('');
        setServicePayload({});
        await loadPolicy();
      } else {
        setServiceMessage('❌ ' + (data.error?.message || 'Failed'));
      }
    } catch (e) { setServiceMessage('❌ ' + e.message); }
  };

  const freeLookCancel = async () => {
    if (!window.confirm('Cancel this policy under free-look (within 15 days)? Full refund will be issued.')) return;
    try {
      const r = await fetch(`${API_URL}/api/insurance-policy-center/free-look-cancel/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...patientHeaders() },
        body: JSON.stringify({ reason: 'Customer free-look' }),
      });
      const data = await r.json();
      if (data.success) { alert('Policy cancelled. Refund: ' + inr(data.data.refundAmount)); await loadPolicy(); }
      else setServiceMessage('❌ ' + (data.error?.message || 'Failed'));
    } catch (e) { setServiceMessage('❌ ' + e.message); }
  };

  const requestPortability = async () => {
    const reason = window.prompt('Reason for portability:');
    if (!reason) return;
    try {
      const r = await fetch(`${API_URL}/api/insurance-policy-center/portability-request/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...patientHeaders() },
        body: JSON.stringify({ reason }),
      });
      const data = await r.json();
      if (data.success) setServiceMessage('✅ ' + data.data.message);
      else setServiceMessage('❌ ' + (data.error?.message || 'Failed'));
    } catch (e) { setServiceMessage('❌ ' + e.message); }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading policy…</div>;
  if (!policy) return (
    <div className="text-center py-20">
      <p className="text-slate-500 mb-4">{error || 'Policy not found'}</p>
      <button onClick={() => navigate('/insurance/my-policies')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">← My Policies</button>
    </div>
  );

  const daysToExpiry = policy.endDate ? Math.floor((new Date(policy.endDate) - Date.now()) / (24 * 60 * 60 * 1000)) : 0;
  const daysSinceStart = policy.startDate ? Math.floor((Date.now() - new Date(policy.startDate)) / (24 * 60 * 60 * 1000)) : 999;
  const withinFreeLook = daysSinceStart <= 15;

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'claims', label: 'Claims' },
    { id: 'documents', label: 'Documents' },
    { id: 'renewal', label: 'Renewal' },
    { id: 'servicing', label: 'Servicing' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button onClick={() => navigate('/insurance/my-policies')} className="text-sm text-slate-500 flex items-center gap-1 mb-3">← My Policies</button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase text-slate-400 font-semibold">{policy.companyId?.name}</div>
              <h1 className="text-2xl font-bold text-slate-800">{policy.policyName}</h1>
              <div className="text-sm text-slate-500">Policy No: {policy.policyNumber}</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${policy.status === 'active' ? 'bg-green-100 text-green-700' : policy.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
              {String(policy.status || '').toUpperCase()}
            </span>
          </div>
          {daysToExpiry > 0 && daysToExpiry <= 30 && (
            <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-sm">
              ⏰ Policy expires in {daysToExpiry} days. <button onClick={() => setTab('renewal')} className="font-bold underline">Renew now</button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3 font-semibold text-sm border-b-2 whitespace-nowrap ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">{error}</div>}

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Stat label="Sum Insured" value={inr(policy.sumInsured)} />
              <Stat label="Premium Paid" value={inr(policy.premiumAmount)} />
              <Stat label="Valid From" value={policy.startDate ? new Date(policy.startDate).toLocaleDateString() : '—'} />
              <Stat label="Valid Till" value={policy.endDate ? new Date(policy.endDate).toLocaleDateString() : '—'} />
            </div>
            {policy.nominee && (
              <>
                <h3 className="font-bold text-slate-800 mb-3">Nominee</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Row label="Name" value={policy.nominee.name} />
                  <Row label="Relation" value={policy.nominee.relation} />
                  <Row label="Contact" value={policy.nominee.contactNumber || '—'} />
                </div>
              </>
            )}
          </div>
        )}

        {/* MEMBERS */}
        {tab === 'members' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-slate-800 mb-4">Members ({(policy.members || []).length})</h3>
            {policy.primaryInsured?.name && (
              <div className="border-b py-3">
                <div className="font-semibold">{policy.primaryInsured.name} <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-2">Primary</span></div>
                <div className="text-sm text-slate-500">Age {policy.primaryInsured.age} · {policy.primaryInsured.gender}</div>
              </div>
            )}
            {(policy.members || []).map((m, i) => (
              <div key={i} className="border-b last:border-0 py-3">
                <div className="font-semibold">{m.name}</div>
                <div className="text-sm text-slate-500">{m.relation} · Age {m.age} · {m.gender}</div>
              </div>
            ))}
          </div>
        )}

                {/* CLAIMS */}
        {tab === 'claims' && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Claims History</h3>
              {policy.status === 'active' && (
                <button onClick={() => setShowClaimForm(true)} className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                  📋 File Claim
                </button>
              )}
            </div>
            {(!policy.claims || policy.claims.length === 0) && (
              <p className="text-slate-500 text-sm">No claims yet.</p>
            )}
            {(policy.claims || []).map((c, i) => (
              <ClaimCard
                key={i}
                claim={c}
                policyId={policy._id}
                onRefresh={loadPolicy}
              />
            ))}

            {showClaimForm && (
              <form onSubmit={submitClaim} className="mt-6 border-t pt-6 space-y-3">
                <h4 className="font-bold">File a Claim</h4>
                <input required type="number" placeholder="Amount (₹)" value={claim.amount} onChange={(e) => setClaim({ ...claim, amount: e.target.value })} className="w-full border rounded px-3 py-2" />
                <input required placeholder="Hospital name" value={claim.hospitalName} onChange={(e) => setClaim({ ...claim, hospitalName: e.target.value })} className="w-full border rounded px-3 py-2" />
                <input placeholder="Hospital address" value={claim.hospitalAddress} onChange={(e) => setClaim({ ...claim, hospitalAddress: e.target.value })} className="w-full border rounded px-3 py-2" />
                <input required type="date" value={claim.admissionDate} onChange={(e) => setClaim({ ...claim, admissionDate: e.target.value })} className="w-full border rounded px-3 py-2" />
                <textarea required placeholder="Describe the claim" value={claim.description} onChange={(e) => setClaim({ ...claim, description: e.target.value })} rows={3} className="w-full border rounded px-3 py-2" />
                <div className="flex gap-2">
                  <button type="submit" disabled={claimSubmitting} className="bg-amber-500 text-white px-4 py-2 rounded">{claimSubmitting ? 'Submitting…' : 'Submit'}</button>
                  <button type="button" onClick={() => setShowClaimForm(false)} className="px-4 py-2">Cancel</button>
                </div>
                {claimMessage && <div className="text-sm">{claimMessage}</div>}
              </form>
            )}
          </div>
        )}

        {/* DOCUMENTS */}
                {tab === 'documents' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-slate-800 mb-4">Documents</h3>
            <button onClick={downloadPolicy} className="flex items-center gap-3 py-3 border-b w-full text-left hover:bg-slate-50">
              <FaFileAlt className="text-blue-600" />
              <span className="text-sm font-semibold">Policy Certificate</span>
              <FaDownload className="ml-auto text-slate-400" />
            </button>
            <button onClick={downloadReceipt} className="flex items-center gap-3 py-3 border-b w-full text-left hover:bg-slate-50">
              <FaFileAlt className="text-green-600" />
              <span className="text-sm font-semibold">Premium Receipt</span>
              <FaDownload className="ml-auto text-slate-400" />
            </button>
            <button onClick={downloadMemberCard} className="flex items-center gap-3 py-3 border-b w-full text-left hover:bg-slate-50">
              <FaFileAlt className="text-purple-600" />
              <span className="text-sm font-semibold">Member Cards</span>
              <FaDownload className="ml-auto text-slate-400" />
            </button>
            <p className="text-xs text-slate-400 mt-4">More documents (schedule, T&C) coming soon.</p>
          </div>
        )}

        {/* RENEWAL */}
        {tab === 'renewal' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-slate-800 mb-4">Renew Policy</h3>
            {renewalLoading && <p className="text-slate-400">Loading quote…</p>}
            {renewalQuote && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <Row label="Current Cover" value={inr(renewalQuote.currentCover)} />
                  <Row label="Current Premium" value={inr(renewalQuote.currentPremium)} />
                  <Row label="Renewal Premium" value={inr(renewalQuote.renewalPremium)} />
                  <Row label="Expires On" value={new Date(renewalQuote.expiresAt).toLocaleDateString()} />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-slate-700">
                  Renewing extends the policy by 1 year from the current end date.
                </div>
                <button onClick={submitRenewal} disabled={renewalLoading} className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold">
                  {renewalLoading ? 'Processing…' : '✅ Renew Policy'}
                </button>
              </>
            )}
          </div>
        )}

        {/* SERVICING */}
        {tab === 'servicing' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-slate-800 mb-4">Policy Servicing</h3>
            {serviceMessage && <div className="bg-slate-50 border rounded p-3 mb-4 text-sm">{serviceMessage}</div>}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[
                { id: 'change_nominee', label: 'Change Nominee', icon: <FaUserEdit /> },
                { id: 'add_member', label: 'Add Member', icon: <FaUserPlus /> },
                { id: 'remove_member', label: 'Remove Member', icon: <FaUserMinus /> },
                { id: 'change_address', label: 'Change Address', icon: <FaSync /> },
                { id: 'endorsement', label: 'Endorsement', icon: <FaFileAlt /> },
              ].map((a) => (
                <button key={a.id} onClick={() => { setServiceAction(a.id); setServicePayload({}); }}
                  className={`p-4 rounded-lg border text-sm font-semibold flex flex-col items-center gap-2 ${serviceAction === a.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>

            {serviceAction === 'change_nominee' && (
              <div className="space-y-3 mb-4">
                <input placeholder="Name" onChange={(e) => setServicePayload((p) => ({ ...p, name: e.target.value }))} className="w-full border rounded px-3 py-2" />
                <select onChange={(e) => setServicePayload((p) => ({ ...p, relationship: e.target.value }))} className="w-full border rounded px-3 py-2">
                  <option value="">Select relationship</option>
                  <option value="spouse">Spouse</option><option value="child">Child</option>
                  <option value="parent">Parent</option><option value="sibling">Sibling</option><option value="other">Other</option>
                </select>
                <input placeholder="Phone" onChange={(e) => setServicePayload((p) => ({ ...p, phone: e.target.value }))} className="w-full border rounded px-3 py-2" />
              </div>
            )}

            {serviceAction === 'add_member' && (
              <div className="space-y-3 mb-4">
                <input placeholder="Name" onChange={(e) => setServicePayload((p) => ({ ...p, member: { ...p.member, name: e.target.value } }))} className="w-full border rounded px-3 py-2" />
                <select onChange={(e) => setServicePayload((p) => ({ ...p, member: { ...p.member, relation: e.target.value } }))} className="w-full border rounded px-3 py-2">
                  <option value="">Select relation</option>
                  <option value="spouse">Spouse</option><option value="child">Child</option>
                  <option value="parent">Parent</option><option value="parent_in_law">Parent-in-law</option>
                </select>
                <input type="number" placeholder="Age" onChange={(e) => setServicePayload((p) => ({ ...p, member: { ...p.member, age: parseInt(e.target.value) } }))} className="w-full border rounded px-3 py-2" />
                <select onChange={(e) => setServicePayload((p) => ({ ...p, member: { ...p.member, gender: e.target.value } }))} className="w-full border rounded px-3 py-2">
                  <option value="">Gender</option>
                  <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
            )}

            {serviceAction === 'remove_member' && (
              <div className="space-y-2 mb-4">
                {(policy.members || []).map((m) => (
                  <label key={m._id} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input type="radio" name="member" onChange={() => setServicePayload({ memberId: m._id })} />
                    <div><div className="font-semibold text-sm">{m.name}</div><div className="text-xs text-slate-500">{m.relation} · Age {m.age}</div></div>
                  </label>
                ))}
              </div>
            )}

            {serviceAction === 'change_address' && (
              <textarea placeholder="New address" onChange={(e) => setServicePayload({ address: e.target.value })} rows={3} className="w-full border rounded px-3 py-2 mb-4" />
            )}

            {serviceAction === 'endorsement' && (
              <div className="space-y-3 mb-4">
                <select onChange={(e) => setServicePayload((p) => ({ ...p, endorsementType: e.target.value }))} className="w-full border rounded px-3 py-2">
                  <option value="">Select type</option>
                  <option value="increase_cover">Increase cover</option>
                  <option value="add_addon">Add add-on</option>
                  <option value="other">Other</option>
                </select>
                <textarea placeholder="Notes" onChange={(e) => setServicePayload((p) => ({ ...p, notes: e.target.value }))} rows={3} className="w-full border rounded px-3 py-2" />
              </div>
            )}

            {serviceAction && (
              <button onClick={submitService} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold mb-6">Submit Request</button>
            )}
            {/* Cashless Pre-Auth */}
            {policy.status === 'active' && (
              <div className="border-t pt-6 mt-6">
                <h4 className="font-bold text-slate-800 mb-2">Cashless Pre-Authorization</h4>
                <p className="text-sm text-slate-500 mb-3">Request pre-authorization before hospital admission for cashless treatment.</p>
                <button
                  onClick={() => navigate(`/insurance/preauth/${id}`)}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Manage Pre-Auth Requests
                </button>
              </div>
            )}

            {/* Free-look */}
            {withinFreeLook && policy.status === 'active' && (
              <div className="border-t pt-6 mt-6">
                <h4 className="font-bold text-slate-800 mb-2">Free-look Cancellation</h4>
                <p className="text-sm text-slate-500 mb-3">Within 15 days of purchase, cancel for a full refund.</p>
                <button onClick={freeLookCancel} className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold">Cancel Policy</button>
              </div>
            )}

            {/* Portability */}
            {policy.status === 'active' && daysToExpiry >= 30 && (
              <div className="border-t pt-6 mt-6">
                <h4 className="font-bold text-slate-800 mb-2">Portability</h4>
                <p className="text-sm text-slate-500 mb-3">Move to a different insurer at renewal (IRDAI right).</p>
                <button onClick={requestPortability} className="bg-slate-700 text-white px-6 py-2 rounded-lg font-semibold">Request Portability</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border rounded-lg p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="font-bold text-slate-800 mt-1">{value}</div>
    </div>
  );
}
function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

// ============================================
// CLAIM CARD — SLA + Dispute + Receipt
// ============================================
function ClaimCard({ claim, policyId, onRefresh }) {
  const [sla, setSla] = React.useState(null);
  const [showDispute, setShowDispute] = React.useState(false);
  const [disputeReason, setDisputeReason] = React.useState('');
  const [disputing, setDisputing] = React.useState(false);
  const [msg, setMsg] = React.useState('');

    const claimId = claim._id;
  const claimNumber = claim.claimNumber || claim.claimId;
  const status = String(claim.status || '').toLowerCase();
  const lookupId = claimNumber || claimId;

  React.useEffect(() => {
    if (!lookupId) return;
    fetch(`${API_URL}/api/insurance-claims/${lookupId}/sla`, { headers: patientHeaders() })
      .then((r) => r.json())
      .then((d) => { if (d.success) setSla(d.data); })
      .catch(() => {});
  }, [lookupId]);

  const submitDispute = async () => {
    if (disputeReason.trim().length < 10) {
      setMsg('Please write at least 10 characters.');
      return;
    }
    setDisputing(true);
    setMsg('');
    try {
      const r = await fetch(`${API_URL}/api/insurance-claims/${lookupId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...patientHeaders() },
        body: JSON.stringify({ reason: disputeReason }),
      });
      const d = await r.json();
      if (d.success) {
        setMsg('✅ ' + d.message);
        setShowDispute(false);
        setDisputeReason('');
        if (onRefresh) await onRefresh();
      } else {
        setMsg('❌ ' + (d.message || 'Failed'));
      }
    } catch (e) {
      setMsg('❌ ' + e.message);
    } finally {
      setDisputing(false);
    }
  };

  const downloadReceipt = async () => {
    try {
      const r = await fetch(`${API_URL}/api/insurance-claims/${lookupId}/settlement-receipt`, { headers: patientHeaders() });
      if (!r.ok) throw new Error('Failed');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `settlement-${claimNumber}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setMsg('❌ Unable to download receipt: ' + e.message);
    }
  };

  const statusColor = {
    settled: 'bg-green-100 text-green-700',
    approved: 'bg-blue-100 text-blue-700',
    partially_settled: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-600',
    under_review: 'bg-blue-100 text-blue-700',
    submitted: 'bg-amber-100 text-amber-700',
    document_uploaded: 'bg-amber-100 text-amber-700',
    pending_verification: 'bg-amber-100 text-amber-700',
  }[status] || 'bg-slate-100 text-slate-600';

  return (
    <div className="border-b py-4 last:border-0">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-semibold text-slate-800">{claimNumber}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {claim.hospitalName} · {claim.admissionDate ? new Date(claim.admissionDate).toLocaleDateString() : ''}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded font-bold ${statusColor}`}>
          {status.replace(/_/g, ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mt-3 py-3 border-y border-slate-100">
        <div>
          <div className="text-xs text-slate-400">Claimed</div>
          <div className="font-bold text-slate-800">₹{Number(claim.amount || 0).toLocaleString('en-IN')}</div>
        </div>
        {claim.approvedAmount > 0 && (
          <div>
            <div className="text-xs text-slate-400">Approved</div>
            <div className="font-bold text-green-600">₹{Number(claim.approvedAmount).toLocaleString('en-IN')}</div>
          </div>
        )}
      </div>

      {sla && sla.isActive && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${sla.isOverdue ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
          <div className="font-semibold mb-1">
            {sla.isOverdue ? '⚠️ IRDAI SLA Breached' : '⏱️ IRDAI SLA Countdown'}
          </div>
          <div className="text-xs">{sla.message}</div>
          <div className="mt-2 bg-white rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${sla.isOverdue ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(100, (sla.daysSinceFiled / sla.slaDays) * 100)}%` }}
            />
          </div>
          <div className="text-xs mt-1">Filed {sla.daysSinceFiled} days ago · SLA 30 days</div>
        </div>
      )}

      {claim.isGrievance && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          🚨 Dispute raised on {claim.grievanceRaisedAt ? new Date(claim.grievanceRaisedAt).toLocaleDateString() : '—'} — awaiting insurer response
        </div>
      )}

      {msg && <div className="text-xs mt-2">{msg}</div>}

      <div className="flex flex-wrap gap-2 mt-3">
        {['rejected', 'partially_settled'].includes(status) && !claim.isGrievance && (
          <button
            onClick={() => setShowDispute(true)}
            className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold"
          >
            Dispute This Claim
          </button>
        )}
        {['settled', 'partially_settled'].includes(status) && (
          <button
            onClick={downloadReceipt}
            className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg font-semibold"
          >
            Download Settlement Receipt
          </button>
        )}
      </div>

      {showDispute && (
        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
          <div className="text-sm font-semibold text-slate-800 mb-2">Raise a dispute</div>
          <p className="text-xs text-slate-500 mb-2">Explain why you disagree. Insurer will respond within 15 days.</p>
          <textarea
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            rows={3}
            placeholder="I disagree because..."
            className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
          />
          <div className="flex gap-2">
            <button onClick={submitDispute} disabled={disputing} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              {disputing ? 'Submitting…' : 'Submit Dispute'}
            </button>
            <button onClick={() => setShowDispute(false)} className="px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}