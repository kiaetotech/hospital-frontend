// src/components/admin/AdminFilterBar.jsx
import React, { useState, useEffect } from 'react';
import { FaFilter, FaRedo } from 'react-icons/fa';

const STATES = [
  'All States',
  'Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'Telangana',
  'Tamil Nadu', 'Uttar Pradesh', 'West Bengal', 'Rajasthan',
  'Madhya Pradesh', 'Punjab', 'Haryana', 'Kerala', 'Bihar',
];

const CITIES = [
  'All Cities',
  'Mumbai', 'Nagpur', 'Pune', 'Delhi', 'Bengaluru', 'Hyderabad',
  'Chennai', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Lucknow', 'Indore',
];

const TAGS = [
  { value: 'all', label: 'All Tags' },
  { value: 'hospitals', label: 'Hospitals' },
  { value: 'ambulance', label: 'Ambulance' },
  { value: 'doctor', label: 'Online Doctor' },
  { value: 'diagnostics', label: 'Diagnostics' },
  { value: 'ayurveda', label: 'Ayurveda' },
  { value: 'homeopathy', label: 'Homeopathy' },
  { value: 'mental', label: 'Mental Health' },
  { value: 'homecare', label: 'Caregivers' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'loan', label: 'Health EMI / Loan' },
  { value: 'corporate', label: 'Corporate Health' },
  { value: 'dietcare', label: 'DietCare', disabled: true },
];

const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'mtd', label: 'This Month' },
  { value: 'qtd', label: 'This Quarter' },
  { value: 'fy', label: 'Financial Year' },
];

const AdminFilterBar = ({ filters, onChange }) => {
  const [localFilters, setLocalFilters] = useState({
    scope: 'PAN INDIA',
    state: 'All States',
    city: 'All Cities',
    tag: 'all',
    period: '30d',
  });

  // Sync from parent if provided
  useEffect(() => {
    if (filters) setLocalFilters((prev) => ({ ...prev, ...filters }));
  }, [filters]);

  const update = (key, value) => {
    const next = { ...localFilters, [key]: value };
    setLocalFilters(next);
    if (typeof onChange === 'function') onChange(next);
  };

  const reset = () => {
    const def = {
      scope: 'PAN INDIA',
      state: 'All States',
      city: 'All Cities',
      tag: 'all',
      period: '30d',
    };
    setLocalFilters(def);
    if (typeof onChange === 'function') onChange(def);
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      borderBottom: '1px solid #e5e9f2',
      padding: '12px 22px',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 10,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: '#687386',
        display: 'flex', alignItems: 'center', gap: 6, marginRight: 6,
      }}>
        <FaFilter size={10} /> FILTERS
      </div>

      <select
        value={localFilters.state}
        onChange={(e) => update('state', e.target.value)}
        style={selectStyle}
      >
        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select
        value={localFilters.city}
        onChange={(e) => update('city', e.target.value)}
        style={selectStyle}
      >
        {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <select
        value={localFilters.tag}
        onChange={(e) => update('tag', e.target.value)}
        style={selectStyle}
      >
        {TAGS.map((t) => (
          <option key={t.value} value={t.value} disabled={t.disabled}>
            {t.label}{t.disabled ? ' (soon)' : ''}
          </option>
        ))}
      </select>

      <select
        value={localFilters.period}
        onChange={(e) => update('period', e.target.value)}
        style={selectStyle}
      >
        {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>

      <button
        onClick={reset}
        style={{
          marginLeft: 'auto',
          padding: '8px 12px',
          border: '1px solid #dce2ed',
          background: '#fff',
          borderRadius: 8,
          fontSize: 12,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontWeight: 600,
          color: '#475569',
        }}
        title="Reset filters"
      >
        <FaRedo size={10} /> Reset
      </button>
    </div>
  );
};

const selectStyle = {
  border: '1px solid #dce2ed',
  background: '#fff',
  borderRadius: 9,
  padding: '8px 12px',
  color: '#25304a',
  fontSize: 12.5,
  cursor: 'pointer',
  minWidth: 130,
};

export default AdminFilterBar;