// D:\hospital-frontend\src\pages\insurance\InsuranceApply.jsx
// ============================================
// INSURANCE APPLY — 6-step wizard + success view
// Exports: ApplyWizard, ApplySuccess
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  FaCheck, FaArrowLeft, FaArrowRight, FaPlus, FaTrash,
  FaTimes, FaCheckCircle, FaShieldAlt,
} from 'react-icons/fa';
import {
  getPlanDetail, startApply, savePersonal, saveMembers, saveMedical,
  saveNominee, getReview,
} from '../../services/insuranceMarketplaceApi';

const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-backend-ilhi.onrender.com';
const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const STEPS = [
  { id: 1, label: 'Personal' },
  { id: 2, label: 'Members' },
  { id: 3, label: 'Medical' },
  { id: 4, label: 'Nominee' },
  { id: 5, label: 'Review' },
  { id: 6, label: 'Payment' },
];

// ============================================
// SUCCESS VIEW
// ============================================
export function ApplySuccess() {
  const [params] = useSearchParams();
  const policyId = params.get('policyId');
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    if (!policyId) return;
    const token = localStorage.getItem('patientToken') || localStorage.getItem('token');
    fetch(`${API_URL}/api/insurance/my-policies/${policyId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((res) => setPolicy(res?.data || res?.policy || null))
      .catch(() => {});
  }, [policyId]);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Application Submitted</h1>
          <p className="text-slate-500 mb-6">
            Your policy has been created. Confirmation sent on email and SMS.
          </p>

          {policy && (
            <div className="bg-slate-50 rounded-xl p-6 text-left mb-6">
              <div className="flex items-center gap-2 text-slate-700 mb-4">
                <FaShieldAlt className="text-blue-600" />
                <strong>{policy.policyName || policy.planId?.planName}</strong>
              </div>
              <div className="space-y-2 text-sm">
                <Row label="Policy Number" value={policy.policyNumber || policyId} />
                <Row label="Sum Insured" value={inr(policy.sumInsured)} />
                <Row label="Premium" value={inr(policy.totalAmount || policy.premiumAmount)} />
                <Row label="Status" value={policy.status || 'Pending'} />
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-xl p-4 text-left mb-6">
            <div className="text-sm font-semibold text-slate-700 mb-2">What's next?</div>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>✅ Payment received</li>
              <li>✅ Proposal submitted</li>
              <li>⏳ Underwriting in progress</li>
              <li>⏳ Policy issuance within 48 hours</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/insurance/my-policies" className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
              View My Policies
            </Link>
            <Link to="/" className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-50">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// APPLY WIZARD
// ============================================
export function ApplyWizard() {
  // ---- Hooks (declare once) ----
  const navigate = useNavigate();
  const { planId } = useParams();
  const [params] = useSearchParams();

  // ---- Auth guard ----
  React.useEffect(() => {
    const token =
      localStorage.getItem('patientToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('adminToken');
    if (!token) {
      alert('Please log in to continue with your application.');
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`, { replace: true });
    }
  }, [navigate]);

  // ---- State ----
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [personal, setPersonal] = useState({
    fullName: '', dob: '', gender: 'male', mobile: '', email: '',
    address: '', city: '', state: '', pincode: '', panNumber: '',
  });

  const [members, setMembers] = useState([
    { relation: 'self', name: '', dob: '', age: 30, gender: 'male', smoker: false, preExisting: [] },
  ]);

  const [medical, setMedical] = useState({
    conditions: [], otherCondition: '', hospitalizedLast4Years: false,
    hospitalizationDetails: '', currentMedications: false, medicationDetails: '', consentGiven: false,
  });

  const [nominee, setNominee] = useState({
    name: '', relationship: 'spouse', dob: '', share: 100, phone: '',
  });

  const [review, setReview] = useState(null);

  // Load Razorpay SDK on page mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try { document.body.removeChild(script); } catch (e) {}
    };
  }, []);

  // Load plan + create proposal
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const planRes = await getPlanDetail(planId);
        if (!alive) return;
        setPlan(planRes?.data || null);

        const propRes = await startApply(planId);
        if (!alive) return;
        setProposal(propRes?.data);

        const draftRaw = localStorage.getItem('insuranceDraft');
        if (draftRaw) {
          const draft = JSON.parse(draftRaw);
          if (draft.members) setMembers(draft.members);
        }
      } catch (e) {
        setError(e.response?.data?.error?.message || e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [planId]);

  const next = () => setStep((s) => Math.min(6, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const submitPersonal = async () => {
    if (!personal.fullName || !personal.dob || !personal.mobile || !personal.email) {
      setError('Full name, DOB, mobile, and email are required'); return;
    }
    setSaving(true); setError('');
    try { await savePersonal(proposal._id, personal); next(); }
    catch (e) { setError(e.response?.data?.error?.message || e.message); }
    finally { setSaving(false); }
  };

  const submitMembers = async () => {
    for (const m of members) {
      if (!m.name || !m.dob) { setError('All members need name and DOB'); return; }
    }
    setSaving(true); setError('');
    try {
      await saveMembers(proposal._id, {
        members,
        sumInsured: plan.coverage?.sumInsured || 500000,
      });
      next();
    } catch (e) { setError(e.response?.data?.error?.message || e.message); }
    finally { setSaving(false); }
  };

  const submitMedical = async () => {
    if (!medical.consentGiven) { setError('Please confirm the declaration'); return; }
    setSaving(true); setError('');
    try { await saveMedical(proposal._id, medical); next(); }
    catch (e) { setError(e.response?.data?.error?.message || e.message); }
    finally { setSaving(false); }
  };

  const submitNominee = async () => {
    if (!nominee.name || !nominee.relationship) { setError('Nominee name & relationship required'); return; }
    setSaving(true); setError('');
    try { await saveNominee(proposal._id, nominee); next(); }
    catch (e) { setError(e.response?.data?.error?.message || e.message); }
    finally { setSaving(false); }
  };

  const loadReview = useCallback(async () => {
    try {
      const r = await getReview(proposal._id);
      setReview(r?.data);
    } catch (e) {
      setError(e.response?.data?.error?.message || e.message);
    }
  }, [proposal]);

  useEffect(() => {
    if (step === 5 && proposal) loadReview();
  }, [step, proposal, loadReview]);

  const submitPayment = async () => {
    setSaving(true); setError('');
    try {
      const API = process.env.REACT_APP_API_URL || 'https://hospital-backend-ilhi.onrender.com';
      const token = localStorage.getItem('patientToken') || localStorage.getItem('token') || '';

      if (typeof window.Razorpay !== 'function') {
        throw new Error('Razorpay SDK not loaded. Please refresh the page.');
      }

      // 1) Create Razorpay order
      const orderRes = await fetch(`${API}/api/insurance-marketplace/apply/${proposal._id}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error?.message || 'Order creation failed');

      const { orderId, amount, razorpayKey } = orderData.data;
      if (!razorpayKey) throw new Error('Razorpay is not configured');

      // 2) Open Razorpay Checkout
      const options = {
        key: razorpayKey,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'HospitalHub Insurance',
        description: plan.planName,
        order_id: orderId,
        prefill: {
          name: personal.fullName || '',
          email: personal.email || '',
          contact: personal.mobile || '',
        },
        theme: { color: '#2563eb' },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API}/api/insurance-marketplace/apply/${proposal._id}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              setError(verifyData.error?.message || 'Payment verification failed');
              setSaving(false);
              return;
            }
            localStorage.removeItem('insuranceDraft');
            navigate(`/insurance/apply/success?policyId=${verifyData.data.policy._id}`);
          } catch (e) {
            setError('Payment verification failed: ' + e.message);
            setSaving(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSaving(false);
            setError('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setError('Payment failed: ' + (resp.error?.description || 'Unknown error'));
        setSaving(false);
      });
      rzp.open();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading…</div>;
  if (!plan) return <div className="text-center py-20 text-slate-500">Plan not found</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to={`/insurance/plan/${planId}`} className="text-sm text-slate-500 flex items-center gap-1 mb-3">
            <FaArrowLeft /> Back to plan
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Insurance Application</h1>
          <p className="text-slate-500 text-sm">{plan.planName} — {plan.companyId?.companyName || 'Insurance Co'}</p>
        </div>
      </div>

      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between overflow-x-auto">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step > s.id ? 'bg-green-500 text-white'
                    : step === s.id ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  {step > s.id ? <FaCheck /> : s.id}
                </div>
                <span className={`text-sm font-semibold hidden md:inline ${step === s.id ? 'text-blue-600' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 flex items-start gap-2">
            <FaTimes className="mt-1" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {step === 1 && <PersonalStep data={personal} setData={setPersonal} onNext={submitPersonal} saving={saving} />}
        {step === 2 && <MembersStep members={members} setMembers={setMembers} onNext={submitMembers} onBack={back} saving={saving} maxMembers={plan.maxMembers || 6} />}
        {step === 3 && <MedicalStep data={medical} setData={setMedical} onNext={submitMedical} onBack={back} saving={saving} />}
        {step === 4 && <NomineeStep data={nominee} setData={setNominee} onNext={submitNominee} onBack={back} saving={saving} />}
        {step === 5 && <ReviewStep plan={plan} proposal={proposal} review={review} onNext={() => setStep(6)} onBack={back} />}
        {step === 6 && <PaymentStep review={review} onPay={submitPayment} onBack={back} saving={saving} />}
      </div>

      <style>{`
        .inp { width:100%; border:1px solid #d1d5db; border-radius:8px; padding:0.6rem 0.75rem; font-size:0.9rem; }
        .inp:focus { outline:2px solid #3b82f6; border-color:#3b82f6; }
        .btn-p { display:inline-flex; align-items:center; gap:0.5rem; background:#2563eb; color:white; padding:0.7rem 1.5rem; border-radius:8px; font-weight:600; }
        .btn-p:disabled { opacity:0.5; }
        .btn-s { display:inline-flex; align-items:center; gap:0.5rem; background:#e2e8f0; color:#1e293b; padding:0.7rem 1.5rem; border-radius:8px; font-weight:600; }
      `}</style>
    </div>
  );
}

// ============================================
// STEP COMPONENTS
// ============================================
function PersonalStep({ data, setData, onNext, saving }) {
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <F label="Full Name *"><input value={data.fullName} onChange={(e) => set('fullName', e.target.value)} className="inp" /></F>
        <F label="Date of Birth *"><input type="date" value={data.dob} onChange={(e) => set('dob', e.target.value)} className="inp" /></F>
        <F label="Gender *">
          <select value={data.gender} onChange={(e) => set('gender', e.target.value)} className="inp">
            <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
          </select>
        </F>
        <F label="Mobile *"><input value={data.mobile} onChange={(e) => set('mobile', e.target.value)} className="inp" /></F>
        <F label="Email *"><input type="email" value={data.email} onChange={(e) => set('email', e.target.value)} className="inp" /></F>
        <F label="PAN (optional)"><input value={data.panNumber} onChange={(e) => set('panNumber', e.target.value.toUpperCase())} className="inp" /></F>
        <F label="Address" span><input value={data.address} onChange={(e) => set('address', e.target.value)} className="inp" /></F>
        <F label="City"><input value={data.city} onChange={(e) => set('city', e.target.value)} className="inp" /></F>
        <F label="State"><input value={data.state} onChange={(e) => set('state', e.target.value)} className="inp" /></F>
        <F label="Pincode"><input value={data.pincode} onChange={(e) => set('pincode', e.target.value)} className="inp" /></F>
      </div>
      <div className="flex justify-end mt-6">
        <button onClick={onNext} disabled={saving} className="btn-p">{saving ? 'Saving…' : 'Save & Continue'} <FaArrowRight /></button>
      </div>
    </div>
  );
}

function F({ label, children, span }) {
  return (
    <div className={span ? 'md:col-span-2' : ''}>
      <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function MembersStep({ members, setMembers, onNext, onBack, saving, maxMembers }) {
  const add = () => {
    if (members.length >= maxMembers) return;
    setMembers((m) => [...m, { relation: 'spouse', name: '', dob: '', age: 30, gender: 'female', smoker: false, preExisting: [] }]);
  };
  const rm = (i) => setMembers((m) => m.filter((_, x) => x !== i));
  const up = (i, k, v) => setMembers((m) => m.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const age = (dob) => dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-2">Members to Insure</h2>
      <p className="text-sm text-slate-500 mb-4">Add family members (max {maxMembers}).</p>
      <div className="space-y-4">
        {members.map((m, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select value={m.relation} onChange={(e) => up(i, 'relation', e.target.value)} className="inp">
                <option value="self">Self</option><option value="spouse">Spouse</option>
                <option value="child">Child</option><option value="parent">Parent</option>
                <option value="parent_in_law">Parent-in-law</option>
              </select>
              <input value={m.name} onChange={(e) => up(i, 'name', e.target.value)} placeholder="Name" className="inp" />
              <input type="date" value={m.dob} onChange={(e) => { up(i, 'dob', e.target.value); up(i, 'age', age(e.target.value)); }} className="inp" />
              <select value={m.gender} onChange={(e) => up(i, 'gender', e.target.value)} className="inp">
                <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-center gap-6 mt-3 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={m.smoker} onChange={(e) => up(i, 'smoker', e.target.checked)} /> Smoker</label>
              <span className="text-slate-500">Age: {m.age || '—'}</span>
              {i > 0 && <button onClick={() => rm(i)} className="ml-auto text-red-500 flex items-center gap-1"><FaTrash /> Remove</button>}
            </div>
          </div>
        ))}
      </div>
      {members.length < maxMembers && (
        <button onClick={add} className="mt-4 text-blue-600 font-semibold text-sm flex items-center gap-1"><FaPlus /> Add Member</button>
      )}
      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="btn-s">← Back</button>
        <button onClick={onNext} disabled={saving} className="btn-p">{saving ? 'Saving…' : 'Save & Continue'} <FaArrowRight /></button>
      </div>
    </div>
  );
}

const CONDITIONS = ['diabetes', 'hypertension', 'heart_disease', 'thyroid', 'asthma', 'cancer', 'kidney_disease', 'liver_disease', 'epilepsy', 'other'];

function MedicalStep({ data, setData, onNext, onBack, saving }) {
  const toggle = (c) => setData((d) => ({
    ...d,
    conditions: d.conditions.includes(c) ? d.conditions.filter((x) => x !== c) : [...d.conditions, c],
  }));
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-2">Medical Declaration</h2>
      <p className="text-sm text-slate-500 mb-6">Disclose any pre-existing conditions.</p>
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">Existing Conditions</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CONDITIONS.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
              <input type="checkbox" checked={data.conditions.includes(c)} onChange={() => toggle(c)} />
              {c.replace('_', ' ')}
            </label>
          ))}
        </div>
      </div>
      {data.conditions.includes('other') && (
        <input value={data.otherCondition} onChange={(e) => set('otherCondition', e.target.value)} placeholder="Other condition details" className="inp mb-6" />
      )}
      <div className="space-y-3 mb-6">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.hospitalizedLast4Years} onChange={(e) => set('hospitalizedLast4Years', e.target.checked)} /> Hospitalized in last 4 years?</label>
        {data.hospitalizedLast4Years && <input value={data.hospitalizationDetails} onChange={(e) => set('hospitalizationDetails', e.target.value)} placeholder="Brief details" className="inp" />}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.currentMedications} onChange={(e) => set('currentMedications', e.target.checked)} /> Currently taking medications?</label>
        {data.currentMedications && <input value={data.medicationDetails} onChange={(e) => set('medicationDetails', e.target.value)} placeholder="Brief details" className="inp" />}
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={data.consentGiven} onChange={(e) => set('consentGiven', e.target.checked)} className="mt-1" />
          <span>I confirm the information provided is accurate.</span>
        </label>
      </div>
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-s">← Back</button>
        <button onClick={onNext} disabled={saving} className="btn-p">{saving ? 'Saving…' : 'Save & Continue'} <FaArrowRight /></button>
      </div>
    </div>
  );
}

function NomineeStep({ data, setData, onNext, onBack, saving }) {
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Nominee Details</h2>
      <p className="text-sm text-slate-500 mb-6">Person who receives the claim amount.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <F label="Name *"><input value={data.name} onChange={(e) => set('name', e.target.value)} className="inp" /></F>
        <F label="Relationship *">
          <select value={data.relationship} onChange={(e) => set('relationship', e.target.value)} className="inp">
            <option value="spouse">Spouse</option><option value="child">Child</option>
            <option value="parent">Parent</option><option value="sibling">Sibling</option><option value="other">Other</option>
          </select>
        </F>
        <F label="Date of Birth"><input type="date" value={data.dob} onChange={(e) => set('dob', e.target.value)} className="inp" /></F>
        <F label="Phone"><input value={data.phone} onChange={(e) => set('phone', e.target.value)} className="inp" /></F>
        <F label="Share (%)"><input type="number" value={data.share} onChange={(e) => set('share', parseInt(e.target.value) || 100)} className="inp" /></F>
      </div>
      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="btn-s">← Back</button>
        <button onClick={onNext} disabled={saving} className="btn-p">{saving ? 'Saving…' : 'Save & Continue'} <FaArrowRight /></button>
      </div>
    </div>
  );
}

function ReviewStep({ plan, proposal, review, onNext, onBack }) {
  // Premium engine returns { base, gst, addons, discount, total } — flat shape.
  // Also unwrap nested wrappers if backend wraps differently.
  let rawP = review?.premium || proposal?.premium || {};
  if (rawP?.premium) rawP = rawP.premium;
  if (rawP?.data) rawP = rawP.data;

  const p = {
    base: rawP.base || rawP.breakdown?.basePremium || 0,
    gst: rawP.gst || rawP.gstAmount || 0,
    total: rawP.total || rawP.totalPremium || 0,
    addons: rawP.addons || rawP.breakdown?.ridersCost || 0,
    discount: rawP.discount || rawP.breakdown?.tenureDiscount || 0,
  };

  console.log('FINAL rawP:', rawP, 'FINAL p:', p);

  return (
   <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Review Your Application</h2>
        <R label="Plan" value={plan.planName} />
        <R label="Insurer" value={plan.companyId?.companyName || '—'} />
        <R label="Sum Insured" value={inr(plan.coverage?.sumInsured || proposal?.sumInsured)} />
        <R label="Members" value={`${review?.proposal?.members?.length || proposal?.members?.length || 0}`} />
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-slate-800 mb-4">Premium Breakdown</h3>
        <R label="Base Premium" value={inr(p.base)} />
        {p.addons > 0 && <R label="Add-ons" value={inr(p.addons)} />}
        {p.discount > 0 && <R label="Discount" value={'-' + inr(p.discount)} />}
        <R label="GST (18%)" value={inr(p.gst)} />
        <div className="border-t pt-3 mt-3 flex items-center justify-between font-bold">
          <span>Total</span><span className="text-blue-600 text-xl">{inr(p.total)}</span>
        </div>
      </div>
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-s">← Back</button>
        <button onClick={onNext} className="btn-p">Continue to Payment <FaArrowRight /></button>
      </div>
    </div>
  );
}

function R({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="font-semibold text-slate-800 text-sm">{value}</span>
    </div>
  );
}

function PaymentStep({ review, onPay, onBack, saving }) {
  const p = review?.premium || {};
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Payment</h2>
      <div className="text-center mb-6">
        <div className="text-sm text-slate-500">Total amount</div>
        <div className="text-4xl font-bold text-blue-600 my-2">{inr(p.total)}</div>
        <div className="text-xs text-slate-400">Secure payment via Razorpay</div>
      </div>
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-s">← Back</button>
        <button onClick={onPay} disabled={saving} className="btn-p">{saving ? 'Processing…' : 'Pay Securely'}</button>
      </div>
    </div>
  );
}

// ============================================
// SHARED HELPERS
// ============================================
function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

// ============================================
// DEFAULT EXPORT (both components)
// ============================================
export default ApplyWizard;