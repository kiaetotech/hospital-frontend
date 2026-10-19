// D:\hospital-frontend\src\pages\insurance\PlanBuilder.jsx
// ============================================
// POLICYBAZAAR-STYLE PLAN BUILDER — PRODUCTION COMPLETE
// All figures decided by insurer. No platform defaults.
// ============================================

import React, { useState } from 'react';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const TABS = [
  { id: 'basic', label: '1. Basic' },
  { id: 'coverage', label: '2. Coverage' },
  { id: 'grid', label: '3. Pricing Grid' },
  { id: 'loadings', label: '4. Loadings' },
  { id: 'riders', label: '5. Riders' },
  { id: 'options', label: '6. Options' },
  { id: 'commission', label: '7. Commission' },
  { id: 'compliance', label: '8. Compliance' },
  { id: 'review', label: '9. Review & Publish' },
];

const CATEGORIES = [
  { value: 'individual', label: 'Individual Health' },
  { value: 'family_floater', label: 'Family Floater' },
  { value: 'senior', label: 'Senior Citizen' },
  { value: 'maternity', label: 'Maternity' },
  { value: 'critical', label: 'Critical Illness' },
  { value: 'topup', label: 'Super Top-Up' },
];

const RIDER_CATALOG = [
  { code: 'maternity', name: 'Maternity Cover' },
  { code: 'opd', name: 'OPD Cover' },
  { code: 'critical_illness', name: 'Critical Illness Rider' },
  { code: 'hospital_cash', name: 'Hospital Daily Cash' },
  { code: 'personal_accident', name: 'Personal Accident' },
  { code: 'restoration_plus', name: 'Restoration Plus' },
  { code: 'worldwide_emergency', name: 'Worldwide Emergency' },
];

const emptyPlan = () => ({
  planName: '',
  planCategory: 'individual',
  description: '',
  uin: '',
  basePremium: 0,

  pricingGrid: { ageBands: [], sumInsuredTiers: [], prices: {} },

  habitLoadings: { smoker: 0, alcohol: 0, tobacco: 0, nonSmokerDiscount: 0 },
  bmiLoadings: [],
  pedLoadings: [],

  coPayOptions: [],
  deductibleOptions: [],
  riders: [],
  tenureDiscounts: [],
  zoneMultipliers: [],

  initialWaitingDays: 0,
  specificDiseaseWaiting: [],

  coverage: {
    roomRent: 'No Limit',
    icu: 'No Limit',
    preHospitalization: 60,
    postHospitalization: 180,
    dayCare: true,
    ambulance: true,
    ayush: true,
    psychiatric: true,
    restoration: true,
    maternity: false,
    opd: false,
    networkHospitals: 0,
  },

  waitingPeriods: { initial: 0, specificDiseases: 0, preExisting: 0, maternity: 0 },
  ncb: { applicable: false, percentage: 0 },

  cancellationPolicy: {
    freeLookDays: 15,
    freeLookRefundPercent: 100,
    freeLookAdminFee: 0,
    freeLookMedicalExamFee: 0,
    afterFreeLook: {
      refundType: 'pro_rata',
      refundPercent: 0,
      cancellationFee: 0,
      allowPartialRefund: true,
      claimsImpact: 'none',
      slabs: [],
    },
  },

  commissionPercent: 0,
  commissionVolumeTiers: [],

  irdaProductApprovalDoc: '',
  brochureUrl: '',
  termsConditionsUrl: '',

  features: [],
  inclusions: [],
  exclusions: [],
  isActive: false,
});

export default function PlanBuilder({ initialPlan, onSubmit, onCancel, submitting }) {
  const [tab, setTab] = useState('basic');
  const [plan, setPlan] = useState(initialPlan || emptyPlan());
  const [featureInput, setFeatureInput] = useState('');
  const [inclusionInput, setInclusionInput] = useState('');
  const [exclusionInput, setExclusionInput] = useState('');

  const set = (path, value) => {
    setPlan((p) => {
      const next = JSON.parse(JSON.stringify(p));
      const parts = path.split('.');
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const addItem = (field, value, setter) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setPlan((p) => ({ ...p, [field]: [...(p[field] || []), trimmed] }));
    setter('');
  };
  const removeItem = (field, idx) => {
    setPlan((p) => ({ ...p, [field]: p[field].filter((_, i) => i !== idx) }));
  };

  const validate = () => {
    const errs = [];
    if (!plan.planName.trim()) errs.push('Plan name is required');
    if (!plan.uin.trim()) errs.push('IRDAI UIN is required (mandatory for every product)');
    if (!plan.planCategory) errs.push('Plan category is required');
    const grid = plan.pricingGrid || {};
    if (!(grid.ageBands || []).length) errs.push('Add at least 1 age band in Pricing Grid');
    if (!(grid.sumInsuredTiers || []).length) errs.push('Add at least 1 sum insured tier');
    const expectedCells = (grid.ageBands?.length || 0) * (grid.sumInsuredTiers?.length || 0);
    const filledCells = Object.values(grid.prices || {}).filter((p) => p > 0).length;
    if (expectedCells > 0 && filledCells < expectedCells) {
      errs.push(`${expectedCells - filledCells} pricing cell(s) still empty — every cell must have a premium`);
    }
    return errs;
  };

  const submit = () => {
    const errs = validate();
    if (errs.length) {
      alert('Fix these issues before publishing:\n\n' + errs.map((e) => '• ' + e).join('\n'));
      return;
    }
    onSubmit(plan);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {initialPlan ? 'Edit Plan' : 'Create New Insurance Plan'}
          </h2>
          <button onClick={onCancel} className="text-white hover:text-blue-100 text-2xl leading-none">×</button>
        </div>

        <div className="border-b bg-slate-50 px-4 flex items-center gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 ${
                tab === t.id ? 'text-blue-600 border-blue-600' : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'basic' && <TabBasic plan={plan} set={set} />}
          {tab === 'coverage' && <TabCoverage plan={plan} set={set} />}
          {tab === 'grid' && <TabPricingGrid plan={plan} set={set} />}
          {tab === 'loadings' && <TabLoadings plan={plan} set={set} />}
          {tab === 'riders' && <TabRiders plan={plan} set={set} />}
          {tab === 'options' && <TabOptions plan={plan} set={set} />}
          {tab === 'commission' && <TabCommission plan={plan} set={set} />}
          {tab === 'compliance' && <TabCompliance plan={plan} set={set} />}
          {tab === 'review' && (
            <TabReview
              plan={plan}
              featureInput={featureInput} setFeatureInput={setFeatureInput}
              inclusionInput={inclusionInput} setInclusionInput={setInclusionInput}
              exclusionInput={exclusionInput} setExclusionInput={setExclusionInput}
              addItem={addItem} removeItem={removeItem}
            />
          )}
        </div>

        <div className="border-t px-6 py-4 flex justify-between bg-white">
          <button onClick={onCancel} className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-40"
          >
            {submitting ? 'Saving…' : '✅ Publish Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SHARED COMPONENTS
// ============================================
const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <div className="mb-6 bg-slate-50 rounded-lg p-5">
      <h4 className="font-semibold text-slate-800 text-sm mb-1">{title}</h4>
      {description && <p className="text-xs text-slate-500 mb-3">{description}</p>}
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm py-1 border-b border-slate-100 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

// ============================================
// TAB 1 — BASIC
// ============================================
function TabBasic({ plan, set }) {
  return (
    <div className="space-y-5">
      <h3 className="font-bold text-slate-800 text-lg">Basic Information</h3>
      <Field label="Plan Name *">
        <input value={plan.planName} onChange={(e) => set('planName', e.target.value)} className={inputClass} placeholder="e.g. Premium Health Plus" />
      </Field>
      <Field label="IRDAI UIN *" hint="Unique Identification Number issued by IRDAI for every approved product">
        <input value={plan.uin} onChange={(e) => set('uin', e.target.value)} className={inputClass} placeholder="e.g. SHAHLIP20131V0219" />
      </Field>
      <Field label="Plan Category *">
        <select value={plan.planCategory} onChange={(e) => set('planCategory', e.target.value)} className={inputClass}>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </Field>
      <Field label="Description">
        <textarea value={plan.description} onChange={(e) => set('description', e.target.value)} rows={3} className={inputClass} placeholder="Brief description of this plan" />
      </Field>
      <Field label="Base Premium Reference (₹/year)" hint="Optional internal reference. Real pricing goes in the Pricing Grid tab.">
        <input type="number" value={plan.basePremium} onChange={(e) => set('basePremium', parseInt(e.target.value) || 0)} className={inputClass} />
      </Field>
    </div>
  );
}

// ============================================
// TAB 2 — COVERAGE
// ============================================
function TabCoverage({ plan, set }) {
  return (
    <div className="space-y-5">
      <h3 className="font-bold text-slate-800 text-lg">Coverage Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Room Rent">
          <select value={plan.coverage.roomRent} onChange={(e) => set('coverage.roomRent', e.target.value)} className={inputClass}>
            <option>No Limit</option>
            <option>Single Private</option>
            <option>Twin Sharing</option>
            <option>1% of SI</option>
            <option>2% of SI</option>
          </select>
        </Field>
        <Field label="ICU">
          <select value={plan.coverage.icu} onChange={(e) => set('coverage.icu', e.target.value)} className={inputClass}>
            <option>No Limit</option>
            <option>Covered</option>
            <option>Not Covered</option>
          </select>
        </Field>
        <Field label="Pre-Hospitalization (days)">
          <input type="number" value={plan.coverage.preHospitalization} onChange={(e) => set('coverage.preHospitalization', parseInt(e.target.value) || 0)} className={inputClass} />
        </Field>
        <Field label="Post-Hospitalization (days)">
          <input type="number" value={plan.coverage.postHospitalization} onChange={(e) => set('coverage.postHospitalization', parseInt(e.target.value) || 0)} className={inputClass} />
        </Field>
        <Field label="Network Hospitals">
          <input type="number" value={plan.coverage.networkHospitals} onChange={(e) => set('coverage.networkHospitals', parseInt(e.target.value) || 0)} className={inputClass} placeholder="e.g. 12000" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2">
        {[
          ['dayCare', 'Day Care Procedures'],
          ['ambulance', 'Ambulance Cover'],
          ['ayush', 'AYUSH (Ayurveda/Homeopathy)'],
          ['psychiatric', 'Mental Health'],
          ['restoration', 'Restoration Benefit'],
          ['maternity', 'Maternity Cover'],
          ['opd', 'OPD Cover'],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={plan.coverage[key]} onChange={(e) => set('coverage.' + key, e.target.checked)} />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

// ============================================
// TAB 3 — PRICING GRID
// ============================================
function TabPricingGrid({ plan, set }) {
  const grid = plan.pricingGrid || { ageBands: [], sumInsuredTiers: [], prices: {} };
  const [newAgeMin, setNewAgeMin] = useState('');
  const [newAgeMax, setNewAgeMax] = useState('');
  const [newSI, setNewSI] = useState('');
  const [bulkPct, setBulkPct] = useState('');

  const priceKey = (a, b, si) => `${a}_${b}_${si}`;
  const getPrice = (a, b, si) => grid.prices?.[priceKey(a, b, si)] || 0;
  const setPrice = (a, b, si, v) => {
    const next = { ...(grid.prices || {}) };
    next[priceKey(a, b, si)] = parseInt(v) || 0;
    set('pricingGrid.prices', next);
  };

  const addAgeBand = () => {
    const min = parseInt(newAgeMin), max = parseInt(newAgeMax);
    if (!min || !max || max < min) { alert('Invalid age range'); return; }
    if (grid.ageBands.some((b) => b.ageMin === min && b.ageMax === max)) { alert('Duplicate age band'); return; }
    set('pricingGrid.ageBands', [...grid.ageBands, { ageMin: min, ageMax: max, label: `${min}-${max}` }].sort((a, b) => a.ageMin - b.ageMin));
    setNewAgeMin(''); setNewAgeMax('');
  };
  const removeAgeBand = (idx) => {
    if (!window.confirm('Remove this age band?')) return;
    const b = grid.ageBands[idx];
    const next = { ...grid.prices };
    grid.sumInsuredTiers.forEach((si) => { delete next[priceKey(b.ageMin, b.ageMax, si)]; });
    set('pricingGrid.prices', next);
    set('pricingGrid.ageBands', grid.ageBands.filter((_, i) => i !== idx));
  };
  const addSI = () => {
    const si = parseInt(newSI);
    if (!si || si <= 0) { alert('Invalid SI'); return; }
    if (grid.sumInsuredTiers.includes(si)) { alert('Duplicate'); return; }
    set('pricingGrid.sumInsuredTiers', [...grid.sumInsuredTiers, si].sort((a, b) => a - b));
    setNewSI('');
  };
  const removeSI = (idx) => {
    if (!window.confirm('Remove this SI tier?')) return;
    const si = grid.sumInsuredTiers[idx];
    const next = { ...grid.prices };
    grid.ageBands.forEach((b) => { delete next[priceKey(b.ageMin, b.ageMax, si)]; });
    set('pricingGrid.prices', next);
    set('pricingGrid.sumInsuredTiers', grid.sumInsuredTiers.filter((_, i) => i !== idx));
  };
  const applyBulk = () => {
    const pct = parseFloat(bulkPct);
    if (isNaN(pct)) { alert('Invalid %'); return; }
    if (!window.confirm(`Apply ${pct}% to all cells?`)) return;
    const next = { ...grid.prices };
    Object.keys(next).forEach((k) => { next[k] = Math.round(next[k] * (1 + pct / 100)); });
    set('pricingGrid.prices', next);
    setBulkPct('');
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-slate-800 text-lg">Pricing Grid</h3>
        <p className="text-xs text-slate-500 mt-1">
          Fill the yearly premium (₹) for each age band × sum insured combination. Every cell is your decision.
        </p>
      </div>

      <Section title="Age Bands" description="The age ranges you'll cover">
        <div className="flex gap-2 items-end flex-wrap">
          <div className="flex-1 min-w-[100px]">
            <label className="block text-xs text-slate-500 mb-1">Min Age</label>
            <input type="number" value={newAgeMin} onChange={(e) => setNewAgeMin(e.target.value)} className={inputClass} placeholder="18" />
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="block text-xs text-slate-500 mb-1">Max Age</label>
            <input type="number" value={newAgeMax} onChange={(e) => setNewAgeMax(e.target.value)} className={inputClass} placeholder="25" />
          </div>
          <button onClick={addAgeBand} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">+ Add Band</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {grid.ageBands.map((b, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-300 rounded-full text-xs font-semibold">
              {b.ageMin}-{b.ageMax}
              <button onClick={() => removeAgeBand(i)} className="text-red-500">×</button>
            </span>
          ))}
        </div>
      </Section>

      <Section title="Sum Insured Tiers" description="The coverage amounts you'll offer">
        <div className="flex gap-2 items-end flex-wrap">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-slate-500 mb-1">Sum Insured (₹)</label>
            <input type="number" value={newSI} onChange={(e) => setNewSI(e.target.value)} className={inputClass} placeholder="500000" />
          </div>
          <button onClick={addSI} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">+ Add Tier</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {grid.sumInsuredTiers.map((si, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-300 rounded-full text-xs font-semibold">
              {inr(si)}
              <button onClick={() => removeSI(i)} className="text-red-500">×</button>
            </span>
          ))}
        </div>
      </Section>

      <Section title="Bulk Actions">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">Apply % to all cells</label>
            <input type="number" value={bulkPct} onChange={(e) => setBulkPct(e.target.value)} className={inputClass} placeholder="+5 or -10" />
          </div>
          <button onClick={applyBulk} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold">Apply</button>
        </div>
      </Section>

      {grid.ageBands.length && grid.sumInsuredTiers.length ? (
        <div className="overflow-x-auto">
          <table className="border-collapse bg-white w-full">
            <thead>
              <tr>
                <th className="border border-slate-300 px-3 py-2 bg-slate-100 text-xs font-bold text-slate-700 sticky left-0">Age Band</th>
                {grid.sumInsuredTiers.map((si, i) => (
                  <th key={i} className="border border-slate-300 px-3 py-2 bg-slate-100 text-xs font-bold text-slate-700">{inr(si)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.ageBands.map((b, bi) => (
                <tr key={bi}>
                  <td className="border border-slate-300 px-3 py-2 bg-slate-50 text-xs font-bold sticky left-0">{b.ageMin}-{b.ageMax}</td>
                  {grid.sumInsuredTiers.map((si, sii) => (
                    <td key={sii} className="border border-slate-300 p-0">
                      <input
                        type="number"
                        value={getPrice(b.ageMin, b.ageMax, si) || ''}
                        onChange={(e) => setPrice(b.ageMin, b.ageMax, si, e.target.value)}
                        className="w-full px-2 py-2 text-xs text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="₹"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-slate-500 mt-2">
            {grid.ageBands.length * grid.sumInsuredTiers.length} cells total · {Object.values(grid.prices).filter((p) => p > 0).length} filled
          </p>
        </div>
      ) : (
        <div className="text-center p-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <p className="text-sm text-slate-500">Add at least 1 age band and 1 sum insured tier to see the grid</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// TAB 4 — LOADINGS
// ============================================
function TabLoadings({ plan, set }) {
  const habit = plan.habitLoadings || {};
  const bmi = plan.bmiLoadings || [];
  const ped = plan.pedLoadings || [];
  const [bmiMin, setBmiMin] = useState('');
  const [bmiMax, setBmiMax] = useState('');
  const [bmiPct, setBmiPct] = useState('');
  const [pedCond, setPedCond] = useState('');
  const [pedPct, setPedPct] = useState('');
  const [pedWait, setPedWait] = useState('');

  const addBMI = () => {
    const min = parseFloat(bmiMin), max = parseFloat(bmiMax), pct = parseFloat(bmiPct) || 0;
    if (isNaN(min) || isNaN(max) || max < min) { alert('Invalid BMI range'); return; }
    set('bmiLoadings', [...bmi, { minBMI: min, maxBMI: max, loadingPercent: pct }].sort((a, b) => a.minBMI - b.minBMI));
    setBmiMin(''); setBmiMax(''); setBmiPct('');
  };
  const removeBMI = (i) => set('bmiLoadings', bmi.filter((_, idx) => idx !== i));

  const addPED = () => {
    if (!pedCond.trim()) { alert('Condition name required'); return; }
    set('pedLoadings', [...ped, {
      condition: pedCond.trim(),
      loadingPercent: parseFloat(pedPct) || 0,
      waitingYears: parseInt(pedWait) || 0,
      rejected: false,
    }]);
    setPedCond(''); setPedPct(''); setPedWait('');
  };
  const removePED = (i) => set('pedLoadings', ped.filter((_, idx) => idx !== i));
  const toggleReject = (i) => {
    const next = [...ped];
    next[i] = { ...next[i], rejected: !next[i].rejected };
    set('pedLoadings', next);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-slate-800 text-lg">Pricing Loadings</h3>
      <p className="text-xs text-slate-500 -mt-3">
        All values default to 0. Only fill in if you charge surcharges.
      </p>

      <Section title="Habit Loadings (%)">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Smoker surcharge %">
            <input type="number" value={habit.smoker || 0} onChange={(e) => set('habitLoadings.smoker', parseFloat(e.target.value) || 0)} className={inputClass} />
          </Field>
          <Field label="Alcohol surcharge %">
            <input type="number" value={habit.alcohol || 0} onChange={(e) => set('habitLoadings.alcohol', parseFloat(e.target.value) || 0)} className={inputClass} />
          </Field>
          <Field label="Tobacco surcharge %">
            <input type="number" value={habit.tobacco || 0} onChange={(e) => set('habitLoadings.tobacco', parseFloat(e.target.value) || 0)} className={inputClass} />
          </Field>
          <Field label="Non-smoker discount %">
            <input type="number" value={habit.nonSmokerDiscount || 0} onChange={(e) => set('habitLoadings.nonSmokerDiscount', parseFloat(e.target.value) || 0)} className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="BMI Loadings">
        <div className="flex gap-2 items-end flex-wrap mb-3">
          <input type="number" value={bmiMin} onChange={(e) => setBmiMin(e.target.value)} className={`${inputClass} w-24`} placeholder="Min" step="0.1" />
          <input type="number" value={bmiMax} onChange={(e) => setBmiMax(e.target.value)} className={`${inputClass} w-24`} placeholder="Max" step="0.1" />
          <input type="number" value={bmiPct} onChange={(e) => setBmiPct(e.target.value)} className={`${inputClass} w-24`} placeholder="+%" />
          <button onClick={addBMI} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">+ Add</button>
        </div>
        {bmi.map((b, i) => (
          <div key={i} className="flex justify-between items-center bg-white p-2 rounded mb-1 text-sm">
            <span>BMI {b.minBMI}–{b.maxBMI} → +{b.loadingPercent}%</span>
            <button onClick={() => removeBMI(i)} className="text-red-500 text-xs">Remove</button>
          </div>
        ))}
      </Section>

      <Section title="Pre-Existing Disease (PED) Loadings">
        <div className="flex gap-2 items-end flex-wrap mb-3">
          <input value={pedCond} onChange={(e) => setPedCond(e.target.value)} className={`${inputClass} flex-1 min-w-[150px]`} placeholder="Condition (e.g. Diabetes)" />
          <input type="number" value={pedPct} onChange={(e) => setPedPct(e.target.value)} className={`${inputClass} w-24`} placeholder="+%" />
          <input type="number" value={pedWait} onChange={(e) => setPedWait(e.target.value)} className={`${inputClass} w-28`} placeholder="Wait yrs" />
          <button onClick={addPED} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">+ Add</button>
        </div>
        {ped.map((p, i) => (
          <div key={i} className="flex justify-between items-center bg-white p-2 rounded mb-1 text-sm gap-2 flex-wrap">
            <span className="font-semibold">{p.condition}</span>
            <span className="text-slate-500">+{p.loadingPercent}% · {p.waitingYears}y wait</span>
            <div className="flex gap-2">
              <button onClick={() => toggleReject(i)} className={`text-xs px-2 py-1 rounded ${p.rejected ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {p.rejected ? 'Rejected' : 'Reject?'}
              </button>
              <button onClick={() => removePED(i)} className="text-red-500 text-xs">Remove</button>
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}

// ============================================
// TAB 5 — RIDERS
// ============================================
function TabRiders({ plan, set }) {
  const riders = plan.riders || [];
  const riderMap = {};
  riders.forEach((r) => { riderMap[r.code] = r; });

  const toggleRider = (catalogItem) => {
    if (riderMap[catalogItem.code]) {
      set('riders', riders.filter((r) => r.code !== catalogItem.code));
    } else {
      set('riders', [...riders, { code: catalogItem.code, name: catalogItem.name, price: 0, description: '' }]);
    }
  };

  const updatePrice = (code, price) => {
    set('riders', riders.map((r) => r.code === code ? { ...r, price: parseFloat(price) || 0 } : r));
  };

  return (
    <div className="space-y-5">
      <h3 className="font-bold text-slate-800 text-lg">Riders / Add-Ons</h3>
      <p className="text-xs text-slate-500 -mt-3">Check the riders you want to offer, and enter your price for each.</p>

      <div className="space-y-2">
        {RIDER_CATALOG.map((item) => {
          const selected = !!riderMap[item.code];
          return (
            <div key={item.code} className={`flex items-center gap-3 p-3 rounded-lg ${selected ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-200'}`}>
              <input type="checkbox" checked={selected} onChange={() => toggleRider(item)} />
              <span className="flex-1 font-semibold text-sm">{item.name}</span>
              {selected && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">₹</span>
                  <input
                    type="number"
                    value={riderMap[item.code]?.price || 0}
                    onChange={(e) => updatePrice(item.code, e.target.value)}
                    className="w-32 border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                    placeholder="Price / year"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-500">
        {riders.length} rider(s) selected. Total add-on price: ₹{riders.reduce((s, r) => s + Number(r.price || 0), 0).toLocaleString('en-IN')}
      </p>
    </div>
  );
}

// ============================================
// TAB 6 — OPTIONS (co-pay, deductible, tenure, zone)
// ============================================
function TabOptions({ plan, set }) {
  const coPays = plan.coPayOptions || [];
  const deductibles = plan.deductibleOptions || [];
  const tenures = plan.tenureDiscounts || [];
  const zones = plan.zoneMultipliers || [];

  const [coPayInput, setCoPayInput] = useState('');
  const [dedInput, setDedInput] = useState('');
  const [tenInput, setTenInput] = useState('');
  const [zoneInput, setZoneInput] = useState('');

  const addCoPay = () => {
    const p = parseFloat(coPayInput);
    if (isNaN(p)) return;
    set('coPayOptions', [...coPays, { percent: p, priceImpact: 0 }]);
    setCoPayInput('');
  };
  const addDed = () => {
    const a = parseInt(dedInput);
    if (!a) return;
    set('deductibleOptions', [...deductibles, { amount: a, priceImpact: 0 }]);
    setDedInput('');
  };
  const addTenure = () => {
    const y = parseInt(tenInput);
    if (!y) return;
    set('tenureDiscounts', [...tenures, { years: y, discountPercent: 0 }]);
    setTenInput('');
  };
  const addZone = () => {
    const z = zoneInput.trim();
    if (!z) return;
    set('zoneMultipliers', [...zones, { zone: z, multiplier: 1 }]);
    setZoneInput('');
  };

  const updateItem = (field, idx, key, val) => {
    const list = [...(plan[field] || [])];
    list[idx] = { ...list[idx], [key]: parseFloat(val) || 0 };
    set(field, list);
  };
  const removeItem = (field, idx) => set(field, (plan[field] || []).filter((_, i) => i !== idx));

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-slate-800 text-lg">Options & Variants</h3>
      <p className="text-xs text-slate-500 -mt-3">Offer customers a choice. All fields start empty — add options you want to offer.</p>

      <Section title="Co-Pay Options (%)">
        <div className="flex gap-2 mb-3">
          <input type="number" value={coPayInput} onChange={(e) => setCoPayInput(e.target.value)} className={inputClass} placeholder="e.g. 10" />
          <button onClick={addCoPay} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">+ Add</button>
        </div>
        {coPays.map((c, i) => (
          <div key={i} className="flex gap-2 items-center mb-1">
            <span className="text-sm w-24">{c.percent}% co-pay</span>
            <span className="text-xs text-slate-500">→ price impact %</span>
            <input type="number" value={c.priceImpact} onChange={(e) => updateItem('coPayOptions', i, 'priceImpact', e.target.value)} className={inputClass} />
            <button onClick={() => removeItem('coPayOptions', i)} className="text-red-500 text-xs">Remove</button>
          </div>
        ))}
      </Section>

      <Section title="Deductible Options (₹)">
        <div className="flex gap-2 mb-3">
          <input type="number" value={dedInput} onChange={(e) => setDedInput(e.target.value)} className={inputClass} placeholder="e.g. 25000" />
          <button onClick={addDed} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">+ Add</button>
        </div>
        {deductibles.map((d, i) => (
          <div key={i} className="flex gap-2 items-center mb-1">
            <span className="text-sm w-32">₹{d.amount.toLocaleString('en-IN')}</span>
            <span className="text-xs text-slate-500">→ price impact %</span>
            <input type="number" value={d.priceImpact} onChange={(e) => updateItem('deductibleOptions', i, 'priceImpact', e.target.value)} className={inputClass} />
            <button onClick={() => removeItem('deductibleOptions', i)} className="text-red-500 text-xs">Remove</button>
          </div>
        ))}
      </Section>

      <Section title="Tenure Discounts">
        <div className="flex gap-2 mb-3">
          <input type="number" value={tenInput} onChange={(e) => setTenInput(e.target.value)} className={inputClass} placeholder="Years (1, 2, 3)" />
          <button onClick={addTenure} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">+ Add</button>
        </div>
        {tenures.map((t, i) => (
          <div key={i} className="flex gap-2 items-center mb-1">
            <span className="text-sm w-32">{t.years} year(s)</span>
            <span className="text-xs text-slate-500">→ discount %</span>
            <input type="number" value={t.discountPercent} onChange={(e) => updateItem('tenureDiscounts', i, 'discountPercent', e.target.value)} className={inputClass} />
            <button onClick={() => removeItem('tenureDiscounts', i)} className="text-red-500 text-xs">Remove</button>
          </div>
        ))}
      </Section>

      <Section title="Zone Multipliers">
        <div className="flex gap-2 mb-3">
          <input value={zoneInput} onChange={(e) => setZoneInput(e.target.value)} className={inputClass} placeholder="Zone name (e.g. Metro)" />
          <button onClick={addZone} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">+ Add</button>
        </div>
        {zones.map((z, i) => (
          <div key={i} className="flex gap-2 items-center mb-1">
            <span className="text-sm w-32">{z.zone}</span>
            <span className="text-xs text-slate-500">→ multiplier</span>
            <input type="number" value={z.multiplier} onChange={(e) => updateItem('zoneMultipliers', i, 'multiplier', e.target.value)} className={inputClass} step="0.01" />
            <button onClick={() => removeItem('zoneMultipliers', i)} className="text-red-500 text-xs">Remove</button>
          </div>
        ))}
      </Section>
    </div>
  );
}

// ============================================
// TAB 7 — COMMISSION
// ============================================
function TabCommission({ plan, set }) {
  const tiers = plan.commissionVolumeTiers || [];
  const [tierMin, setTierMin] = useState('');
  const [tierMax, setTierMax] = useState('');
  const [tierPct, setTierPct] = useState('');

  const addTier = () => {
    const min = parseInt(tierMin), max = parseInt(tierMax), pct = parseFloat(tierPct);
    if (!min || !max || isNaN(pct)) { alert('Fill all fields'); return; }
    set('commissionVolumeTiers', [...tiers, { minPolicies: min, maxPolicies: max, percent: pct }]);
    setTierMin(''); setTierMax(''); setTierPct('');
  };
  const removeTier = (i) => set('commissionVolumeTiers', tiers.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-slate-800 text-lg">Commission Structure</h3>
      <p className="text-xs text-slate-500 -mt-3">What % the platform takes per policy sold. Volume tiers optional.</p>

      <Section title="Base Commission">
        <Field label="Commission % per policy">
          <input type="number" min="0" max="100" step="0.1" value={plan.commissionPercent} onChange={(e) => set('commissionPercent', parseFloat(e.target.value) || 0)} className={inputClass} />
        </Field>
      </Section>

      <Section title="Volume Tiers (optional)">
        <p className="text-xs text-slate-500 mb-3">Pay a different rate based on how many policies are sold.</p>
        <div className="flex gap-2 items-end flex-wrap mb-3">
          <input type="number" value={tierMin} onChange={(e) => setTierMin(e.target.value)} className={`${inputClass} w-32`} placeholder="Min policies" />
          <input type="number" value={tierMax} onChange={(e) => setTierMax(e.target.value)} className={`${inputClass} w-32`} placeholder="Max policies" />
          <input type="number" value={tierPct} onChange={(e) => setTierPct(e.target.value)} className={`${inputClass} w-32`} placeholder="% rate" step="0.1" />
          <button onClick={addTier} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">+ Add Tier</button>
        </div>
        {tiers.map((t, i) => (
          <div key={i} className="flex justify-between items-center bg-white p-2 rounded mb-1 text-sm">
            <span>{t.minPolicies}–{t.maxPolicies} policies → {t.percent}%</span>
            <button onClick={() => removeTier(i)} className="text-red-500 text-xs">Remove</button>
          </div>
        ))}
      </Section>
    </div>
  );
}

// ============================================
// TAB 8 — COMPLIANCE
// ============================================
function TabCompliance({ plan, set }) {
  return (
    <div className="space-y-5">
      <h3 className="font-bold text-slate-800 text-lg">Compliance & Documents</h3>
      <p className="text-xs text-slate-500 -mt-3">Required for IRDAI compliance and policy issuance.</p>

      <Field label="IRDAI Product Approval Document URL">
        <input value={plan.irdaProductApprovalDoc} onChange={(e) => set('irdaProductApprovalDoc', e.target.value)} className={inputClass} placeholder="https://..." />
      </Field>
      <Field label="Brochure URL">
        <input value={plan.brochureUrl} onChange={(e) => set('brochureUrl', e.target.value)} className={inputClass} placeholder="https://..." />
      </Field>
      <Field label="Terms & Conditions URL">
        <input value={plan.termsConditionsUrl} onChange={(e) => set('termsConditionsUrl', e.target.value)} className={inputClass} placeholder="https://..." />
      </Field>
    </div>
  );
}

// ============================================
// TAB 9 — REVIEW
// ============================================
function TabReview({ plan, set, featureInput, setFeatureInput, inclusionInput, setInclusionInput, exclusionInput, setExclusionInput, addItem, removeItem }) {
  const grid = plan.pricingGrid || {};
  const filledCount = Object.values(grid.prices || {}).filter((p) => p > 0).length;
  const totalCount = (grid.ageBands?.length || 0) * (grid.sumInsuredTiers?.length || 0);

  return (
    <div className="space-y-5">
      <h3 className="font-bold text-slate-800 text-lg">Review Your Plan</h3>

      <Section title="Basic">
        <Row label="Plan Name" value={plan.planName || '—'} />
        <Row label="IRDAI UIN" value={plan.uin || '—'} />
        <Row label="Category" value={plan.planCategory} />
        <Row label="Description" value={plan.description || '—'} />
      </Section>

      <Section title="Pricing Grid">
        <Row label="Age Bands" value={`${grid.ageBands?.length || 0} bands`} />
        <Row label="Sum Insured Tiers" value={`${grid.sumInsuredTiers?.length || 0} tiers`} />
        <Row label="Pricing Cells" value={`${filledCount}/${totalCount} filled`} />
      </Section>

      <Section title="Loadings">
        <Row label="Smoker surcharge" value={`${plan.habitLoadings?.smoker || 0}%`} />
        <Row label="BMI ranges" value={`${plan.bmiLoadings?.length || 0}`} />
        <Row label="PED conditions" value={`${plan.pedLoadings?.length || 0}`} />
      </Section>

      <Section title="Riders">
        <Row label="Selected Riders" value={`${plan.riders?.length || 0}`} />
      </Section>

      <Section title="Commission">
        <Row label="Base Commission %" value={`${plan.commissionPercent || 0}%`} />
        <Row label="Volume Tiers" value={`${plan.commissionVolumeTiers?.length || 0}`} />
      </Section>

      <Section title="Features">
        <div className="space-y-2">
          <ListInput label="Features" items={plan.features} input={featureInput} setInput={setFeatureInput} onAdd={() => addItem('features', featureInput, setFeatureInput)} onRemove={(i) => removeItem('features', i)} placeholder="e.g. Unlimited room rent" />
          <ListInput label="Inclusions" items={plan.inclusions} input={inclusionInput} setInput={setInclusionInput} onAdd={() => addItem('inclusions', inclusionInput, setInclusionInput)} onRemove={(i) => removeItem('inclusions', i)} placeholder="e.g. Hospitalization covered" />
          <ListInput label="Exclusions" items={plan.exclusions} input={exclusionInput} setInput={setExclusionInput} onAdd={() => addItem('exclusions', exclusionInput, setExclusionInput)} onRemove={(i) => removeItem('exclusions', i)} placeholder="e.g. Cosmetic surgery" />
        </div>
      </Section>
    </div>
  );
}

function ListInput({ label, items, input, setInput, onAdd, onRemove, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} className={inputClass} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())} />
        <button type="button" onClick={onAdd} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-semibold">Add</button>
      </div>
      {(items || []).map((item, i) => (
        <div key={i} className="flex justify-between items-center bg-white rounded p-2 mb-1 text-sm">
          <span>{item}</span>
          <button onClick={() => onRemove(i)} className="text-red-500 text-xs">Remove</button>
        </div>
      ))}
    </div>
  );
}