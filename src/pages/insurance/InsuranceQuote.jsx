import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function InsuranceQuote() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const planId = params.get('planId');

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    pincode: '',
    city: '',
    sumInsured: 1000000,
    deductible: 0,
    members: [
      { relation: 'self', age: 30, gender: 'male', isSmoker: false }
    ],
    couponCode: ''
  });

  useEffect(() => {
    if (!planId) { navigate('/insurance/list'); return; }
    api.get(`/insurance/plans/${planId}`)
      .then(r => setPlan(r.data.data))
      .catch(e => setError(e.response?.data?.error?.message || 'Failed to load plan'))
      .finally(() => setLoading(false));
  }, [planId, navigate]);

  const updateMember = (idx, field, value) => {
    const next = [...form.members];
    next[idx][field] = value;
    setForm({ ...form, members: next });
  };

  const addMember = () => {
    setForm({
      ...form,
      members: [...form.members, { relation: 'spouse', age: 30, gender: 'female', isSmoker: false }]
    });
  };

  const removeMember = (idx) => {
    setForm({ ...form, members: form.members.filter((_, i) => i !== idx) });
  };

  const calculate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/insurance/quote', {
        planId,
        members: form.members,
        sumInsured: Number(form.sumInsured),
        deductible: Number(form.deductible),
        couponCode: form.couponCode || null
      });
      setQuote(res.data.data);
    } catch (e) {
      setError(e.response?.data?.error?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const proceedToApply = () => {
    navigate(`/insurance/apply/${planId}`, { state: { quote, form } });
  };

  if (loading && !plan) return <div className="p-8">Loading…</div>;
  if (error && !plan) return <div className="p-8 text-red-600">{error}</div>;
  if (!plan) return null;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Calculate Premium</h1>
      <p className="text-gray-600 mb-6">{plan.planName} — {plan.companyId?.companyName}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: form */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Location</h2>
            <input className="w-full border p-2 rounded mb-2" placeholder="Pincode"
              value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="City"
              value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Sum Insured</h2>
            <select className="w-full border p-2 rounded"
              value={form.sumInsured} onChange={e => setForm({ ...form, sumInsured: Number(e.target.value) })}>
              {(plan.sumInsured?.options || [500000, 1000000, 2000000, 5000000]).map(v => (
                <option key={v} value={v}>₹{(v / 100000).toFixed(1)} L</option>
              ))}
            </select>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold">Members</h2>
              <button className="text-sm text-blue-600" onClick={addMember}>+ Add</button>
            </div>
            {form.members.map((m, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select className="border p-2 rounded flex-1"
                  value={m.relation} onChange={e => updateMember(idx, 'relation', e.target.value)}>
                  <option value="self">Self</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                </select>
                <input type="number" className="border p-2 rounded w-20" placeholder="Age"
                  value={m.age} onChange={e => updateMember(idx, 'age', Number(e.target.value))} />
                {idx > 0 && (
                  <button className="text-red-600 px-2" onClick={() => removeMember(idx)}>×</button>
                )}
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Coupon</h2>
            <input className="w-full border p-2 rounded" placeholder="Try HEALTH10"
              value={form.couponCode} onChange={e => setForm({ ...form, couponCode: e.target.value })} />
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
            onClick={calculate} disabled={loading}>
            {loading ? 'Calculating…' : 'Calculate Premium'}
          </button>
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>

        {/* Right: quote */}
        <div className="lg:sticky lg:top-6 h-fit">
          <div className="border rounded-lg p-4 bg-gray-50">
            <h2 className="font-semibold mb-3">Live Quote</h2>
            {!quote ? (
              <p className="text-gray-500 text-sm">Fill the form and calculate.</p>
            ) : (
              <>
                <Row label="Base Premium" value={quote.breakdown.basePremium} />
                {quote.breakdown.addonTotal > 0 && <Row label="Add-ons" value={quote.breakdown.addonTotal} />}
                {quote.breakdown.discountAmount > 0 && (
                  <Row label={`Discount (${quote.breakdown.discountCode})`} value={-quote.breakdown.discountAmount} />
                )}
                <Row label="GST" value={quote.breakdown.gstAmount} />
                <hr className="my-2" />
                <Row label="Final Premium" value={quote.breakdown.totalPremium} bold />
                <p className="text-sm text-gray-600 mt-1">₹{quote.breakdown.monthlyPremium}/month</p>
                <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold mt-4"
                  onClick={proceedToApply}>
                  Continue
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  const cls = bold ? 'font-bold' : '';
  return (
    <div className={`flex justify-between py-1 ${cls}`}>
      <span>{label}</span>
      <span>₹{Math.abs(value).toLocaleString('en-IN')}</span>
    </div>
  );
}