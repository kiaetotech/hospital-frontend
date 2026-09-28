// src/pages/admin/CommissionRulesTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  listCommissionRules, createCommissionRule, updateCommissionRule, deleteCommissionRule,
  SERVICE_TYPES, SCOPE_TYPES, TAGS
} from '../../services/adminTaxesApi';

const th = { padding: '0.75rem', textAlign: 'left', fontWeight: 700, color: '#1e293b', fontSize: '0.8rem' };
const td = { padding: '0.75rem', color: '#475569', fontSize: '0.85rem' };
const inputStyle = { padding: '0.6rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.9rem', width: '100%' };
const actionBtn = (bg) => ({
  padding: '0.3rem 0.6rem', background: bg, color: 'white', border: 'none',
  borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', marginRight: '0.3rem'
});

const CommissionRulesTab = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const availableServices = tagFilter
    ? TAGS[tagFilter] || []
    : SERVICE_TYPES;

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (serviceFilter) params.serviceType = serviceFilter;
      if (scopeFilter) params.scopeType = scopeFilter;
      if (search) params.search = search;
      const res = await listCommissionRules(params);
      setRules(res.data.data || []);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, [search, serviceFilter, scopeFilter]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  // When tag changes, clear service filter if service not in that tag
  useEffect(() => {
    if (tagFilter && serviceFilter && !TAGS[tagFilter].includes(serviceFilter)) {
      setServiceFilter('');
    }
  }, [tagFilter, serviceFilter]);

  const addNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      scopeType: form.scopeType.value,
      scopeValue: form.scopeValue.value.trim() || null,
      scopeState: form.scopeState?.value.trim() || null,
      serviceType: form.serviceType.value,
      commissionType: form.commissionType.value,
      percentageRate: Number(form.percentageRate.value || 0),
      fixedAmount: Number(form.fixedAmount.value || 0),
      priority: Number(form.priority.value || 0),
      effectiveFrom: form.effectiveFrom.value || new Date().toISOString(),
      effectiveUntil: form.effectiveUntil.value || null,
      changeReason: form.changeReason.value.trim() || 'Admin created via Taxes & Fees'
    };

    if (payload.scopeType !== 'global' && !payload.scopeValue) {
      addNotice('❌ Scope value required for non-global scope');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateCommissionRule(editing._id, {
          percentageRate: payload.percentageRate,
          fixedAmount: payload.fixedAmount,
          priority: payload.priority,
          changeReason: payload.changeReason
        });
        addNotice('✅ Commission rule updated');
      } else {
        await createCommissionRule(payload);
        addNotice('✅ Commission rule created');
      }
      setShowModal(false);
      setEditing(null);
      fetchRules();
    } catch (e) {
      addNotice('❌ ' + (e.response?.data?.error || e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rule) => {
    if (!window.confirm(`Delete rule for "${rule.serviceType}"? This cannot be undone.`)) return;
    try {
      await deleteCommissionRule(rule._id);
      addNotice('✅ Rule deleted');
      fetchRules();
    } catch (e) {
      addNotice('❌ ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div>
      {notice && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem',
          background: notice.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${notice.startsWith('✅') ? '#86efac' : '#fecaca'}`,
          color: notice.startsWith('✅') ? '#166534' : '#991b1b', fontSize: '0.9rem'
        }}>
          {notice}
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontWeight: 700, margin: 0 }}>💰 Commission Rules ({rules.length})</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="🔍 Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.85rem', minWidth: 180 }}
            />
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.85rem' }}
            >
              <option value="">All Tags</option>
              {Object.keys(TAGS).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.85rem' }}
            >
              <option value="">All Services</option>
              {availableServices.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.85rem' }}
            >
              <option value="">All Scopes</option>
              {SCOPE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={fetchRules} style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>↻</button>
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
            >
              + Add Rule
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Loading...</p>
        ) : rules.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No commission rules found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={th}>Scope</th>
                <th style={th}>Target</th>
                <th style={th}>Service</th>
                <th style={th}>Rate</th>
                <th style={th}>Priority</th>
                <th style={th}>Valid From</th>
                <th style={th}>Valid Until</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={td}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700,
                      background: r.scopeType === 'provider' ? '#dbeafe' : r.scopeType === 'city' ? '#fef3c7' : r.scopeType === 'state' ? '#fce7f3' : '#f1f5f9',
                      color: r.scopeType === 'provider' ? '#1e40af' : r.scopeType === 'city' ? '#b45309' : r.scopeType === 'state' ? '#9d174d' : '#475569'
                    }}>
                      {r.scopeType || 'global'}
                    </span>
                  </td>
                  <td style={td}>{r.scopeValue || '—'}</td>
                  <td style={td}>{r.serviceType}</td>
                  <td style={td}>
                    {r.commissionType === 'fixed' ? `₹${r.fixedAmount}` : `${r.percentageRate}%`}
                  </td>
                  <td style={td}>{r.priority || 0}</td>
                  <td style={td}>{r.effectiveFrom ? new Date(r.effectiveFrom).toLocaleDateString() : '—'}</td>
                  <td style={td}>{r.effectiveUntil ? new Date(r.effectiveUntil).toLocaleDateString() : <span style={{ color: '#94a3b8' }}>Never</span>}</td>
                  <td style={td}>
                    {r.isActive ? <span style={{ color: '#059669', fontWeight: 600 }}>🟢 Active</span> : <span style={{ color: '#dc2626' }}>🔴 Inactive</span>}
                  </td>
                  <td style={td}>
                    <button onClick={() => { setEditing(r); setShowModal(true); }} style={actionBtn('#3b82f6')}>Edit</button>
                    <button onClick={() => handleDelete(r)} style={actionBtn('#dc2626')}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem' }}>{editing ? '✏️ Edit Commission Rule' : '💰 Create Commission Rule'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {!editing && (
                <>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Service Type *</label>
                  <select name="serviceType" required style={inputStyle} defaultValue={serviceFilter}>
                    {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Scope Type *</label>
                  <select name="scopeType" defaultValue="global" style={inputStyle}>
                    {SCOPE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Scope Value (provider ID / city / state)</label>
                  <input name="scopeValue" placeholder="Leave blank for global" style={inputStyle} />

                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Scope State (optional)</label>
                  <input name="scopeState" placeholder="State (optional)" style={inputStyle} />

                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Commission Type *</label>
                  <select name="commissionType" defaultValue="percentage" style={inputStyle}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>

                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Effective From</label>
                  <input name="effectiveFrom" type="date" defaultValue={new Date().toISOString().split('T')[0]} style={inputStyle} />

                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Effective Until (optional)</label>
                  <input name="effectiveUntil" type="date" style={inputStyle} />
                </>
              )}

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Percentage Rate (%)</label>
              <input name="percentageRate" type="number" min="0" max="50" step="0.1" defaultValue={editing?.percentageRate ?? 20} style={inputStyle} />

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Fixed Amount (₹)</label>
              <input name="fixedAmount" type="number" min="0" defaultValue={editing?.fixedAmount ?? 0} style={inputStyle} />

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Priority</label>
              <input name="priority" type="number" defaultValue={editing?.priority ?? 0} style={inputStyle} />

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Reason *</label>
              <textarea name="changeReason" required rows="2" placeholder="Why is this change being made?" style={inputStyle} />

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '0.6rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                  {saving ? 'Saving...' : (editing ? 'Save Changes' : 'Create Rule')}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setEditing(null); }} style={{ flex: 1, padding: '0.6rem', background: '#e2e8f0', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionRulesTab;