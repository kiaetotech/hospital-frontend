// D:\hospital-frontend\src\pages\insurance\InsuranceMarketplace.jsx
// ============================================
// INSURANCE MARKETPLACE — Browse experience
// Exports: Hub, Search, Compare
// ============================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaSearch, FaShieldAlt, FaCalculator, FaFileAlt, FaBalanceScale,
  FaStar, FaCheck, FaTimes, FaMapMarkerAlt, FaArrowRight, FaFilter,
} from 'react-icons/fa';
import { getPlans, comparePlans, getQuoteAll } from '../../services/insuranceMarketplaceApi';

// ============================================
// SHARED HELPERS
// ============================================

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const coverOf = (plan) => {
  if (!plan) return 0;
  if (plan.coverage?.sumInsured) return plan.coverage.sumInsured;
  if (typeof plan.sumInsured === 'object' && plan.sumInsured?.default) return plan.sumInsured.default;
  if (typeof plan.sumInsured === 'number') return plan.sumInsured;
  return 0;
};

const roomRentOf = (plan) => {
  if (!plan) return '—';
  if (plan.coverage?.roomRent) return plan.coverage.roomRent;
  const map = {
    no_limit: 'No Limit',
    single: 'Single Private',
    twin_sharing: 'Twin Sharing',
    shared: 'Twin Sharing',
  };
  return map[plan.roomRentLimit] || plan.roomRentLimit || '—';
};

const categoryLabel = (c) => ({
  individual: 'Individual',
  family_floater: 'Family Floater',
  senior: 'Senior Citizen',
  maternity: 'Maternity',
  critical: 'Critical Illness',
  topup: 'Super Top-Up',
}[c] || c || 'Health');

const CATEGORIES = [
  { key: 'individual', label: 'Individual', icon: '👤' },
  { key: 'family_floater', label: 'Family Floater', icon: '👨‍👩‍👧' },
  { key: 'senior', label: 'Senior Citizen', icon: '🧓' },
  { key: 'maternity', label: 'Maternity', icon: '👶' },
  { key: 'critical', label: 'Critical Illness', icon: '❤️' },
  { key: 'topup', label: 'Super Top-Up', icon: '➕' },
];

// ============================================
// HUB — /insurance
// ============================================

export function Hub() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [featRes, popRes] = await Promise.all([
          getPlans({ limit: 6, sort: 'recommended' }),
          getPlans({ limit: 6, sort: 'recommended' }),
        ]);
        if (!alive) return;
        setFeatured(featRes?.data || []);
        setPopular(popRes?.data || []);
      } catch (e) {
        console.warn('Hub load error:', e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/insurance/search?q=${encodeURIComponent(q)}` : '/insurance/search');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-4">
            <FaShieldAlt className="text-4xl" />
            <h1 className="text-3xl md:text-4xl font-bold">Health Insurance Marketplace</h1>
          </div>
          <p className="text-lg text-blue-100 mb-8">
            Compare • Calculate Premium • Buy • Manage • Claim
          </p>

          <form onSubmit={onSearch} className="max-w-3xl">
            <div className="bg-white rounded-xl shadow-lg flex items-center overflow-hidden">
              <FaSearch className="text-slate-400 text-lg ml-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search insurance plans, companies, coverage..."
                className="flex-1 px-4 py-4 outline-none text-slate-800"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-4 font-semibold hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickCard icon={<FaBalanceScale />} label="Compare Plans" to="/insurance/search" />
          <QuickCard icon={<FaCalculator />} label="Calculate Premium" to="/insurance/search" />
          <QuickCard icon={<FaFileAlt />} label="My Policies" to="/insurance/my-policies" />
          <QuickCard icon={<FaShieldAlt />} label="File Claim" to="/insurance/claims" />
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Explore by Need</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              to={`/insurance/search?category=${c.key}`}
              className="bg-white rounded-xl p-6 text-center shadow hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="text-3xl mb-2">{c.icon}</div>
              <div className="font-semibold text-slate-700 text-sm">{c.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* FEATURED */}
      {featured.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">⭐ Featured Plans</h2>
            <Link to="/insurance/search" className="text-blue-600 font-semibold flex items-center gap-1">
              View all <FaArrowRight className="text-sm" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.slice(0, 3).map((p) => <PlanCard key={p._id} plan={p} />)}
          </div>
        </div>
      )}

      {/* POPULAR */}
      {popular.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Popular Health Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popular.slice(0, 6).map((p) => <PlanCard key={p._id} plan={p} />)}
          </div>
        </div>
      )}

      {!loading && featured.length === 0 && popular.length === 0 && (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <FaShieldAlt className="text-5xl text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No plans available yet</h3>
          <p className="text-slate-500">
            Insurance plans will appear here once insurers publish them on the platform.
          </p>
        </div>
      )}

      {/* TRUST BADGES */}
      <div className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <TrustBadge title="10,000+" subtitle="Cashless Hospitals" />
          <TrustBadge title="IRDAI" subtitle="Registered Insurers" />
          <TrustBadge title="24×7" subtitle="Claim Support" />
          <TrustBadge title="100%" subtitle="Secure Payments" />
        </div>
      </div>
    </div>
  );
}

function QuickCard({ icon, label, to }) {
  return (
    <Link
      to={to}
      className="bg-white rounded-xl p-6 shadow hover:shadow-md hover:-translate-y-0.5 transition flex flex-col items-center gap-3 text-center"
    >
      <div className="text-3xl text-blue-600">{icon}</div>
      <div className="font-semibold text-slate-700 text-sm">{label}</div>
    </Link>
  );
}

function TrustBadge({ title, subtitle }) {
  return (
    <div>
      <div className="text-2xl font-bold text-blue-600">{title}</div>
      <div className="text-sm text-slate-500 mt-1">{subtitle}</div>
    </div>
  );
}

function PlanCard({ plan }) {
  const cover = coverOf(plan);
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
            {plan.companyId?.companyName || plan.companyId?.name || 'Insurance Co'}
          </div>
          <div className="font-bold text-slate-800 mt-1">{plan.planName}</div>
        </div>
        {plan.rating > 0 && (
          <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
            <FaStar /> {plan.rating}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 my-3">
        <div>
          <div className="text-xs text-slate-400">Cover</div>
          <div className="font-bold text-slate-800">{inr(cover)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Room Rent</div>
          <div className="font-bold text-slate-800">{roomRentOf(plan)}</div>
        </div>
      </div>

      <ul className="text-sm text-slate-600 space-y-1.5 mb-4 flex-1">
        <FeatureLine on={plan.coverage?.restoration} label="Automatic Restore" />
        <FeatureLine on={plan.coverage?.ayush} label="AYUSH Covered" />
        <FeatureLine on={plan.coverage?.maternity} label="Maternity" />
        <FeatureLine on={plan.coverage?.opd} label="OPD" />
      </ul>

      <div className="mb-4">
        <div className="text-xs text-slate-400">Starting from</div>
        <div className="text-2xl font-bold text-blue-600">
          {inr(plan.basePremium)}<span className="text-sm text-slate-400 font-normal">/year</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          to={`/insurance/plan/${plan._id}`}
          className="flex-1 text-center border border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
        >
          View
        </Link>
        <Link
  to={`/insurance/apply/${plan._id}`}
  className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
>
  Buy Now
</Link>
      </div>
    </div>
  );
}

function FeatureLine({ on, label }) {
  if (!on) return null;
  return (
    <li className="flex items-center gap-2">
      <FaCheck className="text-green-500 text-xs" /> {label}
    </li>
  );
}

// ============================================
// SEARCH — /insurance/search
// ============================================

export function Search() {
  const [params, setParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [compareIds, setCompareIds] = useState([]);

  const [filters, setFilters] = useState({
    q: params.get('q') || '',
    category: params.get('category') || '',
    companyId: '',
    minCover: '',
    maxCover: '',
    maternity: false,
    opd: false,
    ayush: false,
    mentalHealth: false,
    cashless: false,
    pincode: '',
    sort: 'recommended',
  });

  // Live quote inputs
  const [quoteInputs, setQuoteInputs] = useState({
    age: 30,
    sumInsured: 500000,
    zone: 'tier1',
    habits: { smoker: false, alcohol: false, tobacco: false },
    bmi: 0,
    pedConditions: [],
    showPanel: true,
  });
  const [liveQuotes, setLiveQuotes] = useState({});       // planId → premium object
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = {
        page,
        limit: 12,
        sort: filters.sort,
      };
      if (filters.q) query.search = filters.q;
      if (filters.category) query.planCategory = filters.category;
      if (filters.minCover) query.minCover = filters.minCover;
      if (filters.maxCover) query.maxCover = filters.maxCover;
      if (filters.maternity) query.maternity = 'true';
      if (filters.opd) query.opd = 'true';
      if (filters.ayush) query.ayush = 'true';
      if (filters.mentalHealth) query.mentalHealth = 'true';
      if (filters.cashless) query.cashless = 'true';
      if (filters.pincode) query.pincode = filters.pincode;

      const res = await getPlans(query);
      setPlans(res?.data || []);
      setTotal(res?.meta?.pagination?.total || 0);
    } catch (e) {
      console.warn('Search error:', e.message);
      setPlans([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  const fetchLiveQuotes = async () => {
    setQuoting(true);
    setQuoteError(null);
    try {
      const res = await getQuoteAll({
        age: Number(quoteInputs.age),
        sumInsured: Number(quoteInputs.sumInsured),
        zone: quoteInputs.zone,
        habits: quoteInputs.habits,
        bmi: Number(quoteInputs.bmi) || 0,
        pedConditions: quoteInputs.pedConditions,
        category: filters.category || undefined,
        sort: filters.sort,
        page: 1,
        limit: 100,
      });
      const map = {};
      (res?.data || []).forEach((q) => { map[q.planId] = q; });
      setLiveQuotes(map);
    } catch (e) {
      setQuoteError(e.response?.data?.message || e.message || 'Failed to get quotes');
      setLiveQuotes({});
    } finally {
      setQuoting(false);
    }
  };

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const goCompare = () => {
    if (compareIds.length < 2) return;
    window.location.href = `/insurance/compare?planIds=${compareIds.join(',')}`;
  };

  const update = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4 flex-wrap">
          <div className="text-lg font-bold text-slate-800">
            Health Insurance Plans <span className="text-slate-400 font-normal text-sm ml-2">{total} Plans</span>
          </div>
          <select
            value={filters.sort}
            onChange={(e) => update('sort', e.target.value)}
            className="ml-auto border rounded-lg px-3 py-2 text-sm"
          >
            <option value="recommended">Recommended</option>
            <option value="premium_low">Premium: Low → High</option>
            <option value="premium_high">Premium: High → Low</option>
            <option value="cover_high">Cover: High → Low</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* FILTERS */}
        <aside className="md:col-span-1">
          <div className="bg-white rounded-xl shadow p-5 sticky top-20">
            <div className="flex items-center gap-2 font-bold text-slate-800 mb-4">
              <FaFilter /> Filters
            </div>

            <FilterGroup label="Search">
              <input
                type="text"
                value={filters.q}
                onChange={(e) => update('q', e.target.value)}
                placeholder="Plan name or company"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </FilterGroup>

            <FilterGroup label="Category">
              <select
                value={filters.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label="Cover Amount">
              <select
                value={filters.minCover}
                onChange={(e) => update('minCover', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Any</option>
                <option value="300000">₹3L+</option>
                <option value="500000">₹5L+</option>
                <option value="1000000">₹10L+</option>
                <option value="2500000">₹25L+</option>
                <option value="5000000">₹50L+</option>
              </select>
            </FilterGroup>

            <FilterGroup label="Features">
              <Check label="Maternity" on={filters.maternity} onChange={(v) => update('maternity', v)} />
              <Check label="OPD" on={filters.opd} onChange={(v) => update('opd', v)} />
              <Check label="AYUSH" on={filters.ayush} onChange={(v) => update('ayush', v)} />
              <Check label="Mental Health" on={filters.mentalHealth} onChange={(v) => update('mentalHealth', v)} />
              <Check label="Cashless (5k+ hospitals)" on={filters.cashless} onChange={(v) => update('cashless', v)} />
            </FilterGroup>

            <FilterGroup label="Pincode">
              <input
                type="text"
                value={filters.pincode}
                onChange={(e) => update('pincode', e.target.value)}
                placeholder="e.g. 440001"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </FilterGroup>

            <button
              onClick={() => setFilters({
                q: '', category: '', companyId: '', minCover: '', maxCover: '',
                maternity: false, opd: false, ayush: false, mentalHealth: false,
                cashless: false, pincode: '', sort: 'recommended',
              })}
              className="w-full mt-2 text-slate-500 text-sm hover:text-slate-700"
            >
              Reset Filters
            </button>
          </div>
        </aside>

        {/* RESULTS */}
        <main className="md:col-span-3">
          {compareIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-center justify-between">
              <div className="text-sm text-slate-700">
                <strong>{compareIds.length}</strong> plan{compareIds.length > 1 ? 's' : ''} selected to compare
                {compareIds.length < 2 && ' (select at least 2)'}
              </div>
              <button
                onClick={goCompare}
                disabled={compareIds.length < 2}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-40"
              >
                Compare Now
              </button>
            </div>
          )}

          {loading && <div className="text-center py-16 text-slate-400">Loading plans…</div>}

          {!loading && plans.length === 0 && (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <FaShieldAlt className="text-5xl text-slate-300 mx-auto mb-4" />
              <h3 className="font-bold text-slate-700 mb-2">No plans match your filters</h3>
              <p className="text-slate-500 text-sm">Try widening the filters or removing some constraints.</p>
            </div>
          )}

          {!loading && plans.length > 0 && (
            <div className="space-y-4">
              {plans.map((p) => (
                <SearchResultCard
                  key={p._id}
                  plan={p}
                  selected={compareIds.includes(p._id)}
                  onToggleCompare={() => toggleCompare(p._id)}
                />
              ))}
            </div>
          )}

          {total > 12 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-40"
              >
                Prev
              </button>
              <span className="px-4 py-2 text-slate-600">Page {page}</span>
              <button
                disabled={page * 12 >= total}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="mb-5">
      <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">{label}</div>
      {children}
    </div>
  );
}

function Check({ label, on, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700 py-1 cursor-pointer">
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function SearchResultCard({ plan, selected, onToggleCompare }) {
  const cover = coverOf(plan);
  return (
    <div className={`bg-white rounded-xl shadow p-5 grid grid-cols-1 md:grid-cols-12 gap-4 ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="md:col-span-5">
        <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">
          {plan.companyId?.companyName || plan.companyId?.name || 'Insurance Co'}
        </div>
        <div className="font-bold text-slate-800 mb-2">{plan.planName}</div>
        {plan.rating > 0 && (
          <div className="flex items-center gap-1 text-amber-500 text-sm mb-2">
            <FaStar /> {plan.rating}
          </div>
        )}
        <div className="text-xs text-slate-500">{categoryLabel(plan.planCategory || plan.planType)}</div>
      </div>

      <div className="md:col-span-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-xs text-slate-400">Cover</div>
          <div className="font-bold text-slate-800">{inr(cover)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Room Rent</div>
          <div className="font-bold text-slate-800">{roomRentOf(plan)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Restore</div>
          <div className="text-slate-700">{plan.coverage?.restoration ? '✓' : '—'}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Maternity</div>
          <div className="text-slate-700">{plan.coverage?.maternity ? '✓' : '—'}</div>
        </div>
      </div>

      <div className="md:col-span-3 flex flex-col items-end justify-between">
        <div className="text-right mb-3">
          <div className="text-xs text-slate-400">Premium from</div>
          <div className="text-2xl font-bold text-blue-600">{inr(plan.basePremium)}</div>
          <div className="text-xs text-slate-400">/year</div>
        </div>
        <div className="flex gap-2 w-full">
          <button
            onClick={onToggleCompare}
            className={`flex-1 text-sm py-2 rounded-lg font-semibold border ${selected ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
          >
            {selected ? 'Selected' : 'Compare'}
          </button>
          <Link
            to={`/insurance/plan/${plan._id}`}
            className="flex-1 text-center text-sm bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPARE — /insurance/compare?planIds=a,b,c
// ============================================

export function Compare() {
  const [params] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const ids = useMemo(() => {
    const raw = params.get('planIds') || '';
    return raw.split(',').filter(Boolean).slice(0, 3);
  }, [params]);

  useEffect(() => {
    if (ids.length < 2) { setLoading(false); return; }
    (async () => {
      try {
        const res = await comparePlans(ids);
        setData(res?.data || null);
      } catch (e) {
        console.warn('Compare error:', e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [ids]);

  if (loading) return <div className="text-center py-20 text-slate-400">Loading comparison…</div>;

  if (ids.length < 2) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <FaBalanceScale className="text-5xl text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Select at least 2 plans to compare</h2>
        <Link to="/insurance/search" className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
          Browse Plans
        </Link>
      </div>
    );
  }

  const plans = data?.plans || [];
  const diffs = data?.differences || [];
  const differing = diffs.filter((d) => d.differs);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Compare Plans</h1>

        {/* Comparison table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-500 w-1/4">Feature</th>
                {plans.map((p) => (
                  <th key={p._id} className="text-left px-4 py-3 text-sm">
                    <div className="font-bold text-slate-800">{p.planName}</div>
                    <div className="text-xs text-slate-400 font-normal">
                      {p.companyId?.companyName || p.companyId?.name || '—'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="Premium (annual)" values={plans.map((p) => inr(p.basePremium))} bold />
              <Row label="Sum Insured" values={plans.map((p) => inr(coverOf(p)))} bold />
              <Row label="Room Rent" values={plans.map((p) => roomRentOf(p))} />
              <Row label="ICU" values={plans.map((p) => p.coverage?.icu || '—')} />
              <Row label="Restore" values={plans.map((p) => yesno(p.coverage?.restoration))} />
              <Row label="AYUSH" values={plans.map((p) => yesno(p.coverage?.ayush))} />
              <Row label="Mental Health" values={plans.map((p) => yesno(p.coverage?.psychiatric))} />
              <Row label="OPD" values={plans.map((p) => yesno(p.coverage?.opd))} />
              <Row label="Maternity" values={plans.map((p) => yesno(p.coverage?.maternity))} />
              <Row label="NCB" values={plans.map((p) => (p.ncb?.percentage ? p.ncb.percentage + '%' : '—'))} />
              <Row label="PED Waiting" values={plans.map((p) => (p.waitingPeriods?.preExisting ? p.waitingPeriods.preExisting + ' days' : '—'))} />
              <Row label="Network Hospitals" values={plans.map((p) => p.networkHospitalCount ? p.networkHospitalCount.toLocaleString('en-IN') + '+' : '—')} />
              <Row label="Co-pay" values={plans.map((p) => (p.limits?.coPay ? p.limits.coPay + '%' : 'None'))} />
              <Row label="Deductible" values={plans.map((p) => inr(p.limits?.deductible || 0))} />
              <tr>
                <td className="px-4 py-4"></td>
                {plans.map((p) => (
                  <td key={p._id} className="px-4 py-4">
                    <Link
                      to={`/insurance/quote/${p._id}`}
                      className="block text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Buy
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Why differs */}
        {differing.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-800 mb-3">Why these plans differ</h2>
            <div className="bg-white rounded-xl shadow p-5 space-y-2">
              {differing.map((d) => (
                <div key={d.path} className="text-sm text-slate-600">
                  <strong className="text-slate-800">{d.label}:</strong>{' '}
                  {d.values.map((v, i) => (
                    <span key={i}>
                      {plans[i]?.planName} → {formatValue(v)}{i < d.values.length - 1 ? '  •  ' : ''}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, values, bold }) {
  return (
    <tr className="border-t border-slate-100">
      <td className="px-4 py-3 text-sm text-slate-500 font-semibold">{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`px-4 py-3 text-sm ${bold ? 'font-bold text-slate-800' : 'text-slate-700'}`}>{v}</td>
      ))}
    </tr>
  );
}

const yesno = (v) => (v ? '✓' : '—');
const formatValue = (v) => {
  if (v === true) return '✓';
  if (v === false) return '—';
  if (v == null) return '—';
  return String(v);
};

export default { Hub, Search, Compare };