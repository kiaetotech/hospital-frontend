// D:\hospital-frontend\src\pages\insurance\InsurancePlan.jsx
// ============================================
// INSURANCE PLAN — Evaluate + Buy
// Exports: PlanDetail, Quote
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaStar, FaCheck, FaTimes, FaArrowLeft, FaPlus, FaTrash,
  FaShieldAlt, FaCalculator, FaBalanceScale,
} from 'react-icons/fa';
import {
  getPlanDetail, getPlans, getQuote,
} from '../../services/insuranceMarketplaceApi';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const coverOf = (plan) => {
  if (!plan) return 0;
  if (plan.coverage?.sumInsured) return plan.coverage.sumInsured;
  if (typeof plan.sumInsured === 'object' && plan.sumInsured?.default) return plan.sumInsured.default;
  if (typeof plan.sumInsured === 'number') return plan.sumInsured;
  return 0;
};

const coverOptions = (plan) => {
  if (!plan) return [];
  if (plan.sumInsured?.options?.length) return plan.sumInsured.options;
  if (plan.coverage?.sumInsured) return [plan.coverage.sumInsured];
  return [];
};

// ============================================
// PLAN DETAIL — /insurance/plan/:id
// ============================================

export function PlanDetail() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  // Live quote state
  const [liveAge, setLiveAge] = useState(30);
  const [liveSI, setLiveSI] = useState(1000000);
  const [liveZone, setLiveZone] = useState('tier1');
  const [liveQuote, setLiveQuote] = useState(null);
  const [calculating, setCalculating] = useState(false);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getPlanDetail(id);
        if (!alive) return;
        setPlan(res?.data || null);

        if (res?.data?.planCategory) {
          const s = await getPlans({ planCategory: res.data.planCategory, limit: 3 });
          if (alive) setSimilar((s?.data || []).filter((p) => p._id !== id));
        }
      } catch (e) {
        console.warn(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);


  const calculateLivePremium = async () => {
    if (!plan) return;
    setCalculating(true);
    try {
      const res = await getQuote({
        planId: plan._id,
        age: liveAge,
        sumInsured: liveSI,
        zone: liveZone,
        habits: { smoker: false, alcohol: false, tobacco: false },
        bmi: 0,
        pedConditions: [],
      });
      const prem = res?.data?.premium;
      if (prem) {
        setLiveQuote({
          base: prem.breakdown?.basePremium || 0,
          gst: prem.gstAmount || 0,
          total: prem.totalPremium || 0,
          monthly: prem.monthlyPremium || 0,
        });
      }
    } catch (e) {
      console.warn('Live premium failed:', e.message);
    } finally {
      setCalculating(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading plan…</div>;
  if (!plan) return (
    <div className="text-center py-20">
      <p className="text-slate-500 mb-4">Plan not found.</p>
      <Link to="/insurance/search" className="text-blue-600 font-semibold">← Back to search</Link>
    </div>
  );

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'limits', label: 'Limits' },
    { id: 'waiting', label: 'Waiting Periods' },
    { id: 'hospitals', label: 'Hospitals' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link to="/insurance/search" className="text-sm text-slate-500 flex items-center gap-1 mb-4">
            <FaArrowLeft /> Back to search
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">
                {plan.companyId?.companyName || plan.companyId?.name || 'Insurance Co'}
              </div>
              <h1 className="text-2xl font-bold text-slate-800">{plan.planName}</h1>
              {plan.rating > 0 && (
                <div className="flex items-center gap-1 text-amber-500 text-sm mt-1">
                  <FaStar /> {plan.rating} rating
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Starting from</div>
              <div className="text-3xl font-bold text-blue-600">{inr(plan.basePremium)}</div>
              <div className="text-xs text-slate-400">Cover up to {inr(coverOf(plan))}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
  to={`/insurance/apply/${plan._id}`}
  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
>
  <FaCalculator /> Proceed to Buy
</Link>
            <Link
              to={`/insurance/search?category=${plan.planCategory || ''}`}
              className="border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 flex items-center gap-2"
            >
              <FaBalanceScale /> Compare
            </Link>
          </div>
        </div>
      </div>

	      {/* LIVE QUOTE PANEL */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="font-bold text-blue-900 text-sm mb-3">💰 Get Your Live Premium</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Your Age</label>
              <input
                type="number"
                value={liveAge}
                onChange={(e) => setLiveAge(Number(e.target.value))}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Sum Insured</label>
              <select
                value={liveSI}
                onChange={(e) => setLiveSI(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {[300000, 500000, 1000000, 2500000, 5000000, 10000000].map(si => (
                  <option key={si} value={si}>₹{si.toLocaleString('en-IN')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Zone</label>
              <select
                value={liveZone}
                onChange={(e) => setLiveZone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="metro">Metro</option>
                <option value="tier1">Tier 1</option>
                <option value="tier2">Tier 2</option>
                <option value="tier3">Tier 3</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={calculateLivePremium}
                disabled={calculating}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm disabled:opacity-50"
              >
                {calculating ? '🔄 Calculating…' : '💰 Check Premium'}
              </button>
            </div>
          </div>

          {liveQuote && liveQuote.total > 0 && (
            <div className="bg-white rounded-lg p-4 border border-blue-300 mt-3">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Base Premium</div>
                  <div className="text-lg font-bold text-slate-800">₹{liveQuote.base.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">GST (18%)</div>
                  <div className="text-lg font-bold text-slate-800">₹{liveQuote.gst.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Total</div>
                  <div className="text-xl font-bold text-emerald-600">₹{liveQuote.total.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-slate-400">≈ ₹{liveQuote.monthly.toLocaleString('en-IN')}/mo</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 flex overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition ${
                tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {tab === 'overview' && <OverviewTab plan={plan} />}
        {tab === 'benefits' && <BenefitsTab plan={plan} />}
        {tab === 'limits' && <LimitsTab plan={plan} />}
        {tab === 'waiting' && <WaitingTab plan={plan} />}
        {tab === 'hospitals' && <HospitalsTab plan={plan} />}
      </div>

      {/* SIMILAR */}
      {similar.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Similar Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {similar.map((p) => (
              <Link
                key={p._id}
                to={`/insurance/plan/${p._id}`}
                className="bg-white rounded-xl shadow p-5 hover:shadow-md transition"
              >
                <div className="text-xs text-slate-400">{p.companyId?.companyName || p.companyId?.name}</div>
                <div className="font-bold text-slate-800 mt-1">{p.planName}</div>
                <div className="text-blue-600 font-bold mt-3">{inr(p.basePremium)}<span className="text-xs text-slate-400 font-normal">/yr</span></div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewTab({ plan }) {
  return (
    <div className="space-y-8">
      {plan.description && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-slate-800 mb-3">About this plan</h3>
          <p className="text-slate-600 leading-relaxed">{plan.description}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-slate-800 mb-4">Coverage Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Sum Insured" value={inr(coverOf(plan))} />
          <StatBox label="Room Rent" value={plan.coverage?.roomRent || plan.roomRentLimit || '—'} />
          <StatBox label="ICU" value={plan.coverage?.icu || '—'} />
          <StatBox label="Pre-hospitalization" value={plan.coverage?.preHospitalization ? plan.coverage.preHospitalization + ' days' : '—'} />
          <StatBox label="Post-hospitalization" value={plan.coverage?.postHospitalization ? plan.coverage.postHospitalization + ' days' : '—'} />
          <StatBox label="Day Care" value={plan.coverage?.dayCare ? '✓' : '—'} />
          <StatBox label="Ambulance" value={plan.coverage?.ambulance ? '✓' : '—'} />
          <StatBox label="Restoration" value={plan.coverage?.restoration ? '✓' : '—'} />
        </div>
      </div>

      {plan.features?.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-slate-800 mb-4">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {plan.features.filter((f) => f.included).map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-700 text-sm">
                <FaCheck className="text-green-500" /> {f.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BenefitsTab({ plan }) {
  const benefits = plan.features?.filter((f) => f.included) || [];
  const exclusions = plan.exclusions || [];
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-slate-800 mb-4">What's Included</h3>
        {benefits.length === 0 ? (
          <p className="text-slate-500 text-sm">No specific benefits listed.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-700 text-sm">
                <FaCheck className="text-green-500" /> {b.title}
              </div>
            ))}
          </div>
        )}
      </div>

      {plan.addons?.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-slate-800 mb-4">Optional Add-ons</h3>
          <div className="space-y-2">
            {plan.addons.map((a, i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                <div>
                  <div className="font-semibold text-slate-700 text-sm">{a.name}</div>
                  {a.description && <div className="text-xs text-slate-400">{a.description}</div>}
                </div>
                <div className="text-blue-600 font-bold text-sm">+{inr(a.price)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {exclusions.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-slate-800 mb-4">Not Covered</h3>
          <div className="space-y-2">
            {exclusions.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-600 text-sm">
                <FaTimes className="text-red-400" /> {e}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LimitsTab({ plan }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-slate-800 mb-4">Coverage Limits</h3>
        <div className="space-y-3">
          <LimitRow label="Sum Insured" value={inr(coverOf(plan))} />
          <LimitRow label="Room Rent" value={plan.coverage?.roomRent || plan.roomRentLimit || '—'} />
          <LimitRow label="ICU" value={plan.coverage?.icu || '—'} />
          <LimitRow label="Co-pay" value={plan.limits?.coPay ? plan.limits.coPay + '%' : 'None'} />
          <LimitRow label="Deductible" value={inr(plan.limits?.deductible || 0)} />
          <LimitRow label="NCB" value={plan.ncb?.percentage ? plan.ncb.percentage + '% per year' : '—'} />
        </div>
      </div>
    </div>
  );
}

function WaitingTab({ plan }) {
  const w = plan.waitingPeriods || {};
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-slate-800 mb-4">Waiting Periods</h3>
      <div className="space-y-3">
        <LimitRow label="Initial" value={w.initial ? w.initial + ' days' : '—'} />
        <LimitRow label="Specific Diseases" value={w.specificDiseases ? w.specificDiseases + ' days' : '—'} />
        <LimitRow label="Pre-Existing Diseases" value={w.preExisting ? w.preExisting + ' days' : '—'} />
        {w.maternity > 0 && <LimitRow label="Maternity" value={w.maternity + ' days'} />}
      </div>
    </div>
  );
}

function HospitalsTab({ plan }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-slate-800 mb-4">Network Hospitals</h3>
      <div className="text-center py-8">
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {plan.networkHospitalCount ? plan.networkHospitalCount.toLocaleString('en-IN') + '+' : '—'}
        </div>
        <div className="text-slate-500 text-sm">Cashless hospitals</div>
        <p className="text-xs text-slate-400 mt-4 max-w-md mx-auto">
          Detailed network hospital search with map and filters will be added in a later release.
        </p>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="border border-slate-100 rounded-lg p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="font-bold text-slate-800 mt-1 text-sm">{value}</div>
    </div>
  );
}

function LimitRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="font-semibold text-slate-800 text-sm">{value}</span>
    </div>
  );
}

// ============================================
// QUOTE — /insurance/quote/:planId
// ============================================

export function Quote() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);

  const [members, setMembers] = useState([
    { relation: 'self', name: '', dob: '', age: 30, gender: 'male', smoker: false, preExisting: [] },
  ]);
  const [sumInsured, setSumInsured] = useState(500000);
  const [deductible, setDeductible] = useState(0);
  const [addonCodes, setAddonCodes] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPlanDetail(planId);
        const p = res?.data;
        setPlan(p);
        const opts = coverOptions(p);
        setSumInsured(opts[opts.length - 1] || 500000);
      } catch (e) {
        console.warn(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [planId]);

  const refreshQuote = useCallback(async () => {
    if (!plan) return;
    setQuoting(true);
    try {
      const primaryAge = members?.[0]?.age || 30;
const res = await getQuote({
  planId: plan._id,
  age: primaryAge,
  sumInsured,
  members,
  addonCodes,
  deductible,
  zone: 'tier1',
  habits: {
    smoker: members?.[0]?.smoker || false,
    alcohol: false,
    tobacco: false,
  },
  bmi: 0,
  pedConditions: [],
});
      const prem = res?.data?.premium;
setQuote(prem ? {
  base: prem.breakdown?.basePremium || 0,
  gst: prem.gstAmount || 0,
  total: prem.totalPremium || 0,
  monthly: prem.monthlyPremium || 0,
  addons: prem.breakdown?.ridersCost || 0,
  discount: prem.breakdown?.tenureDiscount || 0,
} : null);
    } catch (e) {
      console.warn('Quote failed:', e.message);
    } finally {
      setQuoting(false);
    }
  }, [plan, members, sumInsured, addonCodes, deductible]);

  useEffect(() => {
    const t = setTimeout(refreshQuote, 400);
    return () => clearTimeout(t);
  }, [refreshQuote]);

  const addMember = () => {
    setMembers((m) => [...m, { relation: 'spouse', name: '', dob: '', age: 30, gender: 'female', smoker: false, preExisting: [] }]);
  };

  const removeMember = (idx) => {
    setMembers((m) => m.filter((_, i) => i !== idx));
  };

  const updateMember = (idx, key, val) => {
    setMembers((m) => m.map((x, i) => (i === idx ? { ...x, [key]: val } : x)));
  };

  const toggleAddon = (code) => {
    setAddonCodes((c) => (c.includes(code) ? c.filter((x) => x !== code) : [...c, code]));
  };

  const onContinue = () => {
    const token = localStorage.getItem('patientToken') || localStorage.getItem('token');
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(`/insurance/quote/${planId}`)}`);
      return;
    }
    // P2.2 will build the apply stepper. For now, save to localStorage and redirect.
    localStorage.setItem('insuranceDraft', JSON.stringify({ planId, members, sumInsured, addonCodes, deductible }));
    navigate(`/insurance/apply/${planId}`);
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading…</div>;
  if (!plan) return <div className="text-center py-20 text-slate-500">Plan not found.</div>;

  const opts = coverOptions(plan);
  const addons = plan.addons || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Link to={`/insurance/plan/${plan._id}`} className="text-sm text-slate-500 flex items-center gap-1 mb-2">
            <FaArrowLeft /> Back to plan
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">{plan.planName}</h1>
          <p className="text-slate-500 text-sm">{plan.companyId?.companyName || plan.companyId?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* INPUTS */}
          <div className="md:col-span-2 space-y-6">
            {/* Members */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">Members to Insure</h3>
                <button onClick={addMember} className="text-sm text-blue-600 font-semibold flex items-center gap-1">
                  <FaPlus /> Add Member
                </button>
              </div>
              <div className="space-y-4">
                {members.map((m, i) => (
                  <div key={i} className="border border-slate-100 rounded-lg p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                    <select value={m.relation} onChange={(e) => updateMember(i, 'relation', e.target.value)} className="border rounded-lg px-2 py-2 text-sm">
                      <option value="self">Self</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child</option>
                      <option value="parent">Parent</option>
                    </select>
                    <input type="number" placeholder="Age" value={m.age} onChange={(e) => updateMember(i, 'age', parseInt(e.target.value) || 0)} className="border rounded-lg px-2 py-2 text-sm" />
                    <select value={m.gender} onChange={(e) => updateMember(i, 'gender', e.target.value)} className="border rounded-lg px-2 py-2 text-sm">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input type="checkbox" checked={m.smoker} onChange={(e) => updateMember(i, 'smoker', e.target.checked)} />
                      Smoker
                    </label>
                    {members.length > 1 && (
                      <button onClick={() => removeMember(i)} className="text-red-500 text-sm flex items-center gap-1 justify-end">
                        <FaTrash /> Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Coverage */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-slate-800 mb-4">Coverage Options</h3>
              {opts.length > 0 && (
                <div className="mb-4">
                  <label className="text-xs text-slate-500 font-semibold">Sum Insured</label>
                  <select value={sumInsured} onChange={(e) => setSumInsured(parseInt(e.target.value))} className="w-full border rounded-lg px-3 py-2 mt-1 text-sm">
                    {opts.map((o) => <option key={o} value={o}>{inr(o)}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs text-slate-500 font-semibold">Deductible</label>
                <select value={deductible} onChange={(e) => setDeductible(parseInt(e.target.value))} className="w-full border rounded-lg px-3 py-2 mt-1 text-sm">
                  <option value={0}>None</option>
                  <option value={10000}>₹10,000</option>
                  <option value={25000}>₹25,000</option>
                  <option value={50000}>₹50,000</option>
                </select>
              </div>
            </div>

            {/* Addons */}
            {addons.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-slate-800 mb-4">Add-ons</h3>
                <div className="space-y-2">
                  {addons.map((a) => (
                    <label key={a.code} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={addonCodes.includes(a.code)} onChange={() => toggleAddon(a.code)} />
                        <div>
                          <div className="font-semibold text-slate-700 text-sm">{a.name}</div>
                          {a.description && <div className="text-xs text-slate-400">{a.description}</div>}
                        </div>
                      </div>
                      <div className="text-blue-600 font-bold text-sm">+{inr(a.price)}</div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* LIVE QUOTE */}
          <aside className="md:col-span-1">
            <div className="bg-white rounded-xl shadow p-6 sticky top-20">
              <h3 className="font-bold text-slate-800 mb-4">Live Quote {quoting && <span className="text-xs text-slate-400 font-normal">updating…</span>}</h3>
              {!quote && <div className="text-slate-400 text-sm py-8 text-center">Enter details to see quote</div>}
              {quote && (
                <>
                  <QuoteRow label="Base Premium" value={inr(quote.base)} />
                  {quote.addons > 0 && <QuoteRow label="Add-ons" value={inr(quote.addons)} />}
                  {quote.discount > 0 && <QuoteRow label="Discount" value={'-' + inr(quote.discount)} />}
                  <QuoteRow label="GST (18%)" value={inr(quote.gst)} />
                  <div className="border-t border-slate-200 my-3" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Total</span>
                    <span className="text-2xl font-bold text-blue-600">{inr(quote.total)}</span>
                  </div>
                  {quote.monthly > 0 && (
                    <div className="text-xs text-slate-400 text-right">≈ {inr(quote.monthly)}/month</div>
                  )}
                  <button
                    onClick={onContinue}
                    className="w-full mt-5 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Continue to Buy
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function QuoteRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  );
}

export default { PlanDetail, Quote };