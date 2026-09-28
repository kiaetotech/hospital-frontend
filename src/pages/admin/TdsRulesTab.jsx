// src/pages/admin/TdsRulesTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  listTdsRules, createTdsRule, updateTdsRule, deactivateTdsRule,
  previewTds, SERVICE_TYPES, TDS_SECTIONS, SCOPE_TYPES
} from '../../services/adminTaxesApi';

const th = { padding: '0.75rem', textAlign: 'left', fontWeight: 700, color: '#1e293b', fontSize: '0.8rem' };
const td = { padding: '0.75rem', color: '#475569', fontSize: '0.85rem' };
const inputStyle = { padding: '0.6rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.9rem', width: '100%' };
const actionBtn = (bg) => ({
  padding: '0.3rem 0.6rem', background: bg, color: 'white', border: 'none',
  borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', marginRight: '0.3rem'
});

const TdsRulesTab = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listTdsRules(search ? { search } : {});
      setRules(res.data.data || []);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const addNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      serviceType: form.serviceType.value,
      section: form.section.value,
      ratePercent: Number(form.ratePercent.value || 0),
      thresholdPerFY: Number(form.thresholdPerFY.value || 0),
      scopeType: form.scopeType.value,
      scopeValue: form.scopeValue.value.trim() || null,
      priority: Number(form.priority.value || 0),
      effectiveFrom: form.effectiveFrom.value || new Date().toISOString(),
      effectiveUntil: form.effectiveUntil.value || null,
      notificationRef: form.notificationRef.value.trim(),
      changeReason: form.changeReason.value.trim() || 'Admin created via UI'
    };
    if (payload.scopeType !== 'global' && !payload.scopeValue) {
      addNotice('❌ Scope value required for non-global scope');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateTdsRule(editing._id, {
          ratePercent: payload.ratePercent,
          thresholdPerFY: payload.thresholdPerFY,
          section: payload.section,
          priority: payload.priority,
          changeReason: payload.changeReason
        });
        addNotice('✅ TDS rule updated');
      } else {
        await createTdsRule(payload);
        addNotice('✅ TDS rule created');
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

  const handleDeactivate = async (rule) => {
    if (!window.confirm(`Deactivate rule for "${rule.serviceType}"?`)) return;
    try {
      await deactivateTdsRule(rule._id);
      addNotice('✅ Rule deactivated');
      fetchRules();
    } catch (e) {
      addNotice('❌ ' + (e.response?.data?.error || e.message));
    }
  };

  const handlePreview = async (serviceType) => {
    setPreviewLoading(true);
    try {
      const res = await previewTds({ serviceType, payoutAmount: 10000 });
      setPreview({ serviceType, data: res.data.data });
    } catch (e) {
      addNotice('❌ Preview failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setPreviewLoading(false);
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

      <div style={{
        padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem',
        background: '#eff6ff', border: '1px solid #bfdbfe',
        color: '#1e40af', fontSize: '0.85rem'
      }}>
        💡 <strong>Default behavior:</strong> No rules = 0% TDS. Providers receive 100% of their earnings.
        Add rules only when required by law (§194J / §194C / §194H / §194-O).
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontWeight: 700, margin: 0 }}>💸 TDS Rules ({rules.length})</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="🔍 Search service type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.85rem', minWidth: 200 }}
            />
            <button
              onClick={fetchRules}
              style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
            >
              ↻ Refresh
            </button>
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
          <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
            No TDS rules configured. This is the default state — no TDS will be deducted at payout.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={th}>Service Type</th>
                <th style={th}>Scope</th>
                <th style={th}>Section</th>
                <th style={th}>Rate</th>
                <th style={th}>Threshold (₹/FY)</th>
                <th style={th}>Valid From</th>
                <th style={th}>Valid Until</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={td}><strong>{r.serviceType}</strong></td>
                  <td style={td}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700,
                      background: r.scopeType === 'provider' ? '#dbeafe' : r.scopeType === 'city' ? '#fef3c7' : r.scopeType === 'state' ? '#fce7f3' : '#f1f5f9',
                      color: r.scopeType === 'provider' ? '#1e40af' : r.scopeType === 'city' ? '#b45309' : r.scopeType === 'state' ? '#9d174d' : '#475569'
                    }}>
                      {r.scopeType || 'global'}{r.scopeValue ? `:${r.scopeValue}` : ''}
                    </span>
                  </td>
                  <td style={td}>§{r.section}</td>
                  <td style={td}>{r.ratePercent}%</td>
                  <td style={td}>₹{(r.thresholdPerFY || 0).toLocaleString()}</td>
                  <td style={td}>{r.effectiveFrom ? new Date(r.effectiveFrom).toLocaleDateString() : '—'}</td>
                  <td style={td}>{r.effectiveUntil ? new Date(r.effectiveUntil).toLocaleDateString() : <span style={{ color: '#94a3b8' }}>Never</span>}</td>
                  <td style={td}>
                    {r.isActive
                      ? <span style={{ color: '#059669', fontWeight: 600 }}>🟢 Active</span>
                      : <span style={{ color: '#dc2626' }}>🔴 Inactive</span>}
                  </td>
                  <td style={td}>
                    <button onClick={() => handlePreview(r.serviceType)} style={actionBtn('#f59e0b')} disabled={previewLoading}>
                      Preview
                    </button>
                    <button onClick={() => { setEditing(r); setShowModal(true); }} style={actionBtn('#3b82f6')}>Edit</button>
                    {r.isActive && (
                      <button onClick={() => handleDeactivate(r)} style={actionBtn('#dc2626')}>Deactivate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PREVIEW PANEL */}
      {preview && (
        <div style={{
          marginTop: '1rem', padding: '1rem', background: '#fffbeb',
          border: '1px solid #fde68a', borderRadius: 12
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>
                📊 Preview — {preview.serviceType} on ₹10,000 payout
              </h4>
              <div style={{ fontSize: '0.85rem', color: '#78350f' }}>
                <div><strong>TDS:</strong> ₹{preview.data.tds}</div>
                <div><strong>Section:</strong> §{preview.data.section}</div>
                <div><strong>Rate:</strong> {preview.data.ratePercent}%</div>
                <div><strong>Reason:</strong> {preview.data.reason}</div>
              </div>
            </div>
            <button
              onClick={() => setPreview(null)}
              style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
            >✕</button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem' }}>{editing ? '✏️ Edit TDS Rule' : '💸 Create TDS Rule'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {!editing && (
                <>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Service Type *</label>
                  <select name="serviceType" required style={inputStyle}>
                    {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Scope Type</label>
                  <select name="scopeType" defaultValue="global" style={inputStyle}>
                    {SCOPE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Scope Value (provider ID / city / state)</label>
                  <input name="scopeValue" placeholder="Leave blank for global" style={inputStyle} />
                </>
              )}

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Legal Section *</label>
              <select name="section" defaultValue={editing?.section || '194-O'} style={inputStyle}>
                {TDS_SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Rate (%) *</label>
              <input name="ratePercent" type="number" min="0" max="100" step="0.01" defaultValue={editing?.ratePercent ?? 0} required style={inputStyle} />

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Threshold (₹ per FY)</label>
              <input name="thresholdPerFY" type="number" min="0" defaultValue={editing?.thresholdPerFY ?? 0} style={inputStyle} />

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Priority</label>
              <input name="priority" type="number" defaultValue={editing?.priority ?? 0} style={inputStyle} />

              {!editing && (
                <>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Effective From</label>
                  <input name="effectiveFrom" type="date" defaultValue={new Date().toISOString().split('T')[0]} style={inputStyle} />

                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Effective Until (optional)</label>
                  <input name="effectiveUntil" type="date" style={inputStyle} />
                </>
              )}

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Notification Ref (CBDT circular etc.)</label>
              <input name="notificationRef" placeholder="e.g., CBDT Circular 12/2024" defaultValue={editing?.notificationRef || ''} style={inputStyle} />

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

export default TdsRulesTab;