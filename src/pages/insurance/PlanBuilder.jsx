// D:\hospital-frontend\src\pages\insurance\PlanBuilder.jsx
// ============================================
// MULTI-STEP PLAN BUILDER
// Steps: Basic → Coverage → Waiting → Limits → Cancellation → Benefits → Review
// ============================================

import React, { useState } from 'react';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const STEPS = [
  { id: 1, label: 'Basic' },
  { id: 2, label: 'Coverage' },
  { id: 3, label: 'Waiting' },
  { id: 4, label: 'Limits' },
  { id: 5, label: 'Cancellation' },
  { id: 6, label: 'Benefits' },
  { id: 7, label: 'Review' },
];

const CATEGORIES = [
  { value: 'individual', label: 'Individual' },
  { value: 'family_floater', label: 'Family Floater' },
  { value: 'senior', label: 'Senior Citizen' },
  { value: 'maternity', label: 'Maternity' },
  { value: 'critical', label: 'Critical Illness' },
  { value: 'topup', label: 'Super Top-Up' },
];

export default function PlanBuilder({ initialPlan, onSubmit, onCancel, submitting }) {
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState(initialPlan || {
    planName: '',
    planCategory: 'individual',
    planType: 'individual',
    description: '',
    basePremium: 15000,

    coverage: {
      sumInsured: 500000,
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
    },

    waitingPeriods: {
      initial: 30,
      specificDiseases: 730,
      preExisting: 1095,
      maternity: 0,
    },

    limits: {
      deductible: 0,
      coPay: 0,
    },

    ncb: { applicable: true, percentage: 50, maxPercentage: 100 },

    cancellationPolicy: {
      freeLookDays: 15,
      freeLookRefundPercent: 100,
      freeLookAdminFee: 500,
      freeLookMedicalExamFee: 0,
      afterFreeLook: {
        refundType: 'pro_rata',
        refundPercent: 80,
        cancellationFee: 500,
        allowPartialRefund: true,
        claimsImpact: 'none',
        slabs: [],
      },
    },

    features: [],
    inclusions: [],
    exclusions: [],
    addons: [],
    isActive: true,
  });

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

  const canProceed = () => {
    if (step === 1) return plan.planName.trim() && plan.planCategory && plan.basePremium > 0;
    if (step === 2) return plan.coverage.sumInsured > 0;
    if (step === 5) {
      const cp = plan.cancellationPolicy;
      if (!cp.afterFreeLook.refundType) return false;
      if (cp.afterFreeLook.refundType === 'slab' && (!cp.afterFreeLook.slabs || cp.afterFreeLook.slabs.length === 0)) return false;
      return true;
    }
    return true;
  };

  const next = () => canProceed() && setStep((s) => Math.min(7, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = () => onSubmit(plan);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {initialPlan ? 'Edit Plan' : 'Create New Plan'}
          </h2>
          <button onClick={onCancel} className="text-white hover:text-blue-100 text-2xl leading-none">×</button>
        </div>

        {/* Step indicator */}
        <div className="border-b bg-slate-50 px-6 py-3 flex items-center justify-between overflow-x-auto">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > s.id ? 'bg-green-500 text-white'
                    : step === s.id ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className={`text-xs font-semibold hidden md:inline ${step === s.id ? 'text-blue-600' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${step > s.id ? 'bg-green-500' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="p-6">
          {step === 1 && <Step1Basic plan={plan} set={set} />}
          {step === 2 && <Step2Coverage plan={plan} set={set} />}
          {step === 3 && <Step3Waiting plan={plan} set={set} />}
          {step === 4 && <Step4Limits plan={plan} set={set} />}
          {step === 5 && <Step5Cancellation plan={plan} set={set} />}
          {step === 6 && (
            <Step6Benefits
              plan={plan}
              set={set}
              featureInput={featureInput} setFeatureInput={setFeatureInput}
              inclusionInput={inclusionInput} setInclusionInput={setInclusionInput}
              exclusionInput={exclusionInput} setExclusionInput={setExclusionInput}
              addItem={addItem} removeItem={removeItem}
            />
          )}
          {step === 7 && <Step7Review plan={plan} />}
        </div>

        <div className="border-t px-6 py-4 flex justify-between">
          <button
            onClick={step === 1 ? onCancel : back}
            className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          {step < 7 ? (
            <button
              onClick={next}
              disabled={!canProceed()}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-40"
            >
              {submitting ? 'Saving…' : '✅ Save Plan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 1 — BASIC
// ============================================
function Step1Basic({ plan, set }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 text-lg">Basic Information</h3>
      <Field label="Plan Name *">
        <input value={plan.planName} onChange={(e) => set('planName', e.target.value)} className="inp" placeholder="e.g. Premium Health Plus" />
      </Field>
      <Field label="Plan Category *">
        <select value={plan.planCategory} onChange={(e) => set('planCategory', e.target.value)} className="inp">
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </Field>
      <Field label="Description">
        <textarea value={plan.description} onChange={(e) => set('description', e.target.value)} rows={3} className="inp" placeholder="Brief description of this plan" />
      </Field>
      <Field label="Base Premium (₹/year) *">
        <input type="number" value={plan.basePremium} onChange={(e) => set('basePremium', parseInt(e.target.value) || 0)} className="inp" />
      </Field>
      <style>{`.inp { width: 100%; border: 1px solid #d1d5db; border-radius: 8px; padding: 0.6rem 0.75rem; font-size: 0.9rem; }`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

// ============================================
// STEP 2 — COVERAGE
// ============================================
function Step2Coverage({ plan, set }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 text-lg">Coverage</h3>
      <Field label="Sum Insured (₹) *">
        <input type="number" value={plan.coverage.sumInsured} onChange={(e) => set('coverage.sumInsured', parseInt(e.target.value) || 0)} className="inp" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Room Rent">
          <select value={plan.coverage.roomRent} onChange={(e) => set('coverage.roomRent', e.target.value)} className="inp">
            <option>No Limit</option>
            <option>Single Private</option>
            <option>Twin Sharing</option>
            <option>1% SI</option>
            <option>2% SI</option>
          </select>
        </Field>
        <Field label="ICU">
          <select value={plan.coverage.icu} onChange={(e) => set('coverage.icu', e.target.value)} className="inp">
            <option>No Limit</option>
            <option>Covered</option>
            <option>Not Covered</option>
          </select>
        </Field>
        <Field label="Pre-Hospitalization (days)">
          <input type="number" value={plan.coverage.preHospitalization} onChange={(e) => set('coverage.preHospitalization', parseInt(e.target.value) || 0)} className="inp" />
        </Field>
        <Field label="Post-Hospitalization (days)">
          <input type="number" value={plan.coverage.postHospitalization} onChange={(e) => set('coverage.postHospitalization', parseInt(e.target.value) || 0)} className="inp" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2">
        {[
          ['dayCare', 'Day Care'],
          ['ambulance', 'Ambulance'],
          ['ayush', 'AYUSH'],
          ['psychiatric', 'Mental Health'],
          ['restoration', 'Restoration'],
          ['maternity', 'Maternity'],
          ['opd', 'OPD'],
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
// STEP 3 — WAITING PERIODS
// ============================================
function Step3Waiting({ plan, set }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 text-lg">Waiting Periods</h3>
      <Field label="Initial Waiting Period (days)">
        <input type="number" value={plan.waitingPeriods.initial} onChange={(e) => set('waitingPeriods.initial', parseInt(e.target.value) || 0)} className="inp" />
      </Field>
      <Field label="Specific Diseases (days)">
        <input type="number" value={plan.waitingPeriods.specificDiseases} onChange={(e) => set('waitingPeriods.specificDiseases', parseInt(e.target.value) || 0)} className="inp" />
      </Field>
      <Field label="Pre-Existing Diseases (days)">
        <input type="number" value={plan.waitingPeriods.preExisting} onChange={(e) => set('waitingPeriods.preExisting', parseInt(e.target.value) || 0)} className="inp" />
      </Field>
      <Field label="Maternity Waiting (days, 0 = not covered)">
        <input type="number" value={plan.waitingPeriods.maternity} onChange={(e) => set('waitingPeriods.maternity', parseInt(e.target.value) || 0)} className="inp" />
      </Field>
    </div>
  );
}

// ============================================
// STEP 4 — LIMITS
// ============================================
function Step4Limits({ plan, set }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 text-lg">Limits & Deductions</h3>
      <Field label="Deductible (₹)">
        <input type="number" value={plan.limits.deductible} onChange={(e) => set('limits.deductible', parseInt(e.target.value) || 0)} className="inp" />
      </Field>
      <Field label="Co-pay (%)">
        <input type="number" value={plan.limits.coPay} onChange={(e) => set('limits.coPay', parseInt(e.target.value) || 0)} className="inp" />
      </Field>
      <div className="grid grid-cols-2 gap-4 pt-2">
        <Field label="NCB Applicable">
          <select value={plan.ncb.applicable ? 'yes' : 'no'} onChange={(e) => set('ncb.applicable', e.target.value === 'yes')} className="inp">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </Field>
        <Field label="NCB % per year">
          <input type="number" value={plan.ncb.percentage} onChange={(e) => set('ncb.percentage', parseInt(e.target.value) || 0)} className="inp" />
        </Field>
      </div>
    </div>
  );
}

// ============================================
// STEP 5 — CANCELLATION
// ============================================
function Step5Cancellation({ plan, set }) {
  const cp = plan.cancellationPolicy;
  const after = cp.afterFreeLook;
  const [slabUpto, setSlabUpto] = useState('');
  const [slabPercent, setSlabPercent] = useState('');

  const addSlab = () => {
    const u = parseInt(slabUpto), p = parseInt(slabPercent);
    if (!u || p == null || p < 0 || p > 100) return;
    set('cancellationPolicy.afterFreeLook.slabs', [...(after.slabs || []), { uptoMonths: u, percent: p }]);
    setSlabUpto(''); setSlabPercent('');
  };
  const removeSlab = (i) => {
    set('cancellationPolicy.afterFreeLook.slabs', after.slabs.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-slate-800 text-lg">Cancellation Policy</h3>
        <p className="text-xs text-slate-500 mt-1">
          IRDAI mandates a free-look period of at least 15 days with a near-full refund. After that, you decide the terms.
        </p>
      </div>

      {/* Free-look */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-bold text-blue-800 mb-3">Free-Look Period (IRDAI Mandate)</h4>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Free-Look Days (min 15)">
            <input type="number" min="15" value={cp.freeLookDays} onChange={(e) => set('cancellationPolicy.freeLookDays', parseInt(e.target.value) || 15)} className="inp" />
          </Field>
          <Field label="Free-Look Refund %">
            <input type="number" min="0" max="100" value={cp.freeLookRefundPercent} onChange={(e) => set('cancellationPolicy.freeLookRefundPercent', parseInt(e.target.value) || 100)} className="inp" />
          </Field>
          <Field label="Admin Fee (₹)">
            <input type="number" value={cp.freeLookAdminFee} onChange={(e) => set('cancellationPolicy.freeLookAdminFee', parseInt(e.target.value) || 0)} className="inp" />
          </Field>
          <Field label="Medical Exam Fee (₹)">
            <input type="number" value={cp.freeLookMedicalExamFee} onChange={(e) => set('cancellationPolicy.freeLookMedicalExamFee', parseInt(e.target.value) || 0)} className="inp" />
          </Field>
        </div>
      </div>

      {/* After free-look */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-bold text-amber-800 mb-3">After Free-Look (Your Choice)</h4>
        <Field label="Refund Type *">
          <select value={after.refundType} onChange={(e) => set('cancellationPolicy.afterFreeLook.refundType', e.target.value)} className="inp">
            <option value="pro_rata">Pro-rata (based on unused days)</option>
            <option value="slab">Slab-based (percentage by month range)</option>
            <option value="none">No refund</option>
          </select>
        </Field>

        {after.refundType === 'pro_rata' && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="Refund % of Pro-rata">
              <input type="number" min="0" max="100" value={after.refundPercent} onChange={(e) => set('cancellationPolicy.afterFreeLook.refundPercent', parseInt(e.target.value) || 0)} className="inp" />
            </Field>
            <Field label="Cancellation Fee (₹)">
              <input type="number" value={after.cancellationFee} onChange={(e) => set('cancellationPolicy.afterFreeLook.cancellationFee', parseInt(e.target.value) || 0)} className="inp" />
            </Field>
          </div>
        )}

        {after.refundType === 'slab' && (
          <div className="mt-3">
            <p className="text-xs text-amber-700 mb-2">Add slabs (e.g. up to 3 months = 75%, up to 6 months = 50%, etc.)</p>
            <div className="flex gap-2 mb-2">
              <input type="number" placeholder="Upto months" value={slabUpto} onChange={(e) => setSlabUpto(e.target.value)} className="inp flex-1" />
              <input type="number" placeholder="Refund %" value={slabPercent} onChange={(e) => setSlabPercent(e.target.value)} className="inp flex-1" />
              <button type="button" onClick={addSlab} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold">Add</button>
            </div>
            {(after.slabs || []).map((s, i) => (
              <div key={i} className="flex justify-between items-center bg-white rounded p-2 mb-1 text-sm">
                <span>Up to {s.uptoMonths} months → {s.percent}% refund</span>
                <button onClick={() => removeSlab(i)} className="text-red-500 text-xs">Remove</button>
              </div>
            ))}
            <Field label="Cancellation Fee (₹)">
              <input type="number" value={after.cancellationFee} onChange={(e) => set('cancellationPolicy.afterFreeLook.cancellationFee', parseInt(e.target.value) || 0)} className="inp mt-2" />
            </Field>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-3">
          <Field label="Partial Refund Allowed">
            <select value={after.allowPartialRefund ? 'yes' : 'no'} onChange={(e) => set('cancellationPolicy.afterFreeLook.allowPartialRefund', e.target.value === 'yes')} className="inp">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </Field>
          <Field label="Claims Impact on Refund">
            <select value={after.claimsImpact} onChange={(e) => set('cancellationPolicy.afterFreeLook.claimsImpact', e.target.value)} className="inp">
              <option value="none">No impact</option>
              <option value="reduce_refund">Reduce refund by 50%</option>
              <option value="zero_refund">Zero refund</option>
            </select>
          </Field>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 6 — BENEFITS
// ============================================
function Step6Benefits({ plan, set, featureInput, setFeatureInput, inclusionInput, setInclusionInput, exclusionInput, setExclusionInput, addItem, removeItem }) {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-slate-800 text-lg">Benefits & Features</h3>

      <ListInput label="Features" items={plan.features} input={featureInput} setInput={setFeatureInput} onAdd={() => addItem('features', featureInput, setFeatureInput)} onRemove={(i) => removeItem('features', i)} placeholder="e.g. Unlimited room rent" />

      <ListInput label="Inclusions" items={plan.inclusions} input={inclusionInput} setInput={setInclusionInput} onAdd={() => addItem('inclusions', inclusionInput, setInclusionInput)} onRemove={(i) => removeItem('inclusions', i)} placeholder="e.g. Hospitalization expenses" />

      <ListInput label="Exclusions" items={plan.exclusions} input={exclusionInput} setInput={setExclusionInput} onAdd={() => addItem('exclusions', exclusionInput, setExclusionInput)} onRemove={(i) => removeItem('exclusions', i)} placeholder="e.g. Cosmetic surgery" />
    </div>
  );
}

function ListInput({ label, items, input, setInput, onAdd, onRemove, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} className="inp flex-1" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())} />
        <button type="button" onClick={onAdd} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-semibold">Add</button>
      </div>
      {(items || []).map((item, i) => (
        <div key={i} className="flex justify-between items-center bg-slate-50 rounded p-2 mb-1 text-sm">
          <span>{item}</span>
          <button onClick={() => onRemove(i)} className="text-red-500 text-xs">Remove</button>
        </div>
      ))}
    </div>
  );
}

// ============================================
// STEP 7 — REVIEW
// ============================================
function Step7Review({ plan }) {
  const cp = plan.cancellationPolicy;
  const after = cp.afterFreeLook;
  return (
    <div className="space-y-5">
      <h3 className="font-bold text-slate-800 text-lg">Review Your Plan</h3>

      <Section title="Basic">
        <Row label="Plan Name" value={plan.planName} />
        <Row label="Category" value={plan.planCategory} />
        <Row label="Base Premium" value={inr(plan.basePremium)} />
      </Section>

      <Section title="Coverage">
        <Row label="Sum Insured" value={inr(plan.coverage.sumInsured)} />
        <Row label="Room Rent" value={plan.coverage.roomRent} />
        <Row label="ICU" value={plan.coverage.icu} />
        <Row label="AYUSH" value={plan.coverage.ayush ? 'Yes' : 'No'} />
        <Row label="Maternity" value={plan.coverage.maternity ? 'Yes' : 'No'} />
      </Section>

      <Section title="Waiting Periods">
        <Row label="Initial" value={`${plan.waitingPeriods.initial} days`} />
        <Row label="Pre-existing" value={`${plan.waitingPeriods.preExisting} days`} />
      </Section>

      <Section title="Cancellation Policy">
        <Row label="Free-Look" value={`${cp.freeLookDays} days @ ${cp.freeLookRefundPercent}%`} />
        <Row label="Admin Fee" value={inr(cp.freeLookAdminFee)} />
        <Row label="After Free-Look" value={after.refundType} />
        {after.refundType === 'pro_rata' && <Row label="Pro-rata Refund %" value={`${after.refundPercent}%`} />}
        {after.refundType === 'slab' && <Row label="Slabs" value={(after.slabs || []).map((s) => `≤${s.uptoMonths}m: ${s.percent}%`).join(', ')} />}
        <Row label="Cancellation Fee" value={inr(after.cancellationFee)} />
        <Row label="Claims Impact" value={after.claimsImpact} />
      </Section>

      <Section title="Features">
        {plan.features.length === 0 ? <p className="text-sm text-slate-400">None</p> :
          plan.features.map((f, i) => <div key={i} className="text-sm text-slate-700">• {f}</div>)}
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <h4 className="font-semibold text-slate-700 text-sm mb-2">{title}</h4>
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