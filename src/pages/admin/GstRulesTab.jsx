// src/pages/admin/GstRulesTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  listGstRules, createGstRule, updateGstRule, deactivateGstRule,
  previewGst, seedGstDefaults, SERVICE_TYPES, SCOPE_TYPES, CHARGE_TO_OPTIONS
} from '../../services/adminTaxesApi';

const th = { padding: '0.75rem', textAlign: 'left', fontWeight: 700, color: '#1e293b', fontSize: '0.8rem' };
const td = { padding: '0.75rem', color: '#475569', fontSize: '0.85rem' };
const inputStyle = { padding: '0.6rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.9rem', width: '100%' };
const actionBtn = (bg) => ({
  padding: '0.3rem 0.6rem', background: bg, color: 'white', border: 'none',
  borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', marginRight: '0.3rem'
});

const GstRulesTab = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listGstRules(search ? { search } : {});
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

  const handleSeed = async () => {
    if (!window.confirm('Seed default 18% GST rules for all service types?\n\nExisting rules will not be touched.')) return;
    try {
      const res = await seedGstDefaults();
      addNotice(`✅ Seeded: ${res.data.count} service types`);
      fetchRules();
    } catch (e) {
      addNotice('❌ Seed failed: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      serviceType: form.serviceType.value,
      ratePercent: Number(form.ratePercent.value || 0),
      hsnSacCode: form.hsnSacCode.value.trim(),
      chargeTo: form.chargeTo.value,
      isExempt: form.isExempt.checked,
      exemptionReason: form.exemptionReason?.value.trim() || '',
      scopeType: form.scopeType.value,
      scopeValue: form.scopeValue.value.trim() || null,
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
        await updateGstRule(editing._id, {
          ratePercent: payload.ratePercent,
          hsnSacCode: payload.hsnSacCode,
          chargeTo: payload.chargeTo,
          isExempt: payload.isExempt,
          changeReason: payload.changeReason
        });
        addNotice('✅ GST rule updated');
      } else {
        await createGstRule(payload);
        addNotice('✅ GST rule created');
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
      await deactivateGstRule(rule._id);
      addNotice('✅ Rule deactivated');
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
          <h2 style={{ fontWeight: 700, margin: 0 }}>🧾 GST Rules ({rules.length})</h2>
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
              onClick={handleSeed}
              style={{ padding: '0.5rem 1rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
            >
              🌱 Seed Defaults
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
            No GST rules yet. Click <strong>🌱 Seed Defaults</strong> to create 18% rules for all service types.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={th}>Service Type</th>
                <th style={th}>Rate</th>
                <th style={th}>HSN/SAC</th>
                <th style={th}>Charge To</th>
                <th style={th}>Exempt</th>
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
                  <td style={td}>{r.ratePercent}%</td>
                  <td style={td}>{r.hsnSacCode || '—'}</td>
                  <td style={td}>{r.chargeTo}</td>
                  <td style={td}>{r.isExempt ? '✅ Yes' : '—'}</td>
                  <td style={td}>{r.effectiveFrom ? new Date(r.effectiveFrom).toLocaleDateString() : '—'}</td>
                  <td style={td}>{r.effectiveUntil ? new Date(r.effectiveUntil).toLocaleDateString() : <span style={{ color: '#94a3b8' }}>Never</span>}</td>
                  <td style={td}>
                    {r.isActive
                      ? <span style={{ color: '#059669', fontWeight: 600 }}>🟢 Active</span>
                      : <span style={{ color: '#dc2626' }}>🔴 Inactive</span>}
                  </td>
                  <td style={td}>
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

      {/* MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem' }}>{editing ? '✏️ Edit GST Rule' : '🧾 Create GST Rule'}</h3>
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

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>GST Rate (%) *</label>
              <input name="ratePercent" type="number" min="0" max="28" step="0.5" defaultValue={editing?.ratePercent ?? 18} required style={inputStyle} />

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>HSN / SAC Code</label>
              <input name="hsnSacCode" placeholder="e.g., 999312" defaultValue={editing?.hsnSacCode || ''} style={inputStyle} />

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Charge To</label>
              <select name="chargeTo" defaultValue={editing?.chargeTo || 'patient'} style={inputStyle}>
                {CHARGE_TO_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <input type="checkbox" name="isExempt" defaultChecked={editing?.isExempt} />
                Exempt from GST
              </label>

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Exemption Reason</label>
              <input name="exemptionReason" placeholder="Only if exempt" defaultValue={editing?.exemptionReason || ''} style={inputStyle} />

              {!editing && (
                <>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Effective From</label>
                  <input name="effectiveFrom" type="date" defaultValue={new Date().toISOString().split('T')[0]} style={inputStyle} />

                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Effective Until (optional)</label>
                  <input name="effectiveUntil" type="date" style={inputStyle} />
                </>
              )}

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Notification Ref (CBIC circular etc.)</label>
              <input name="notificationRef" placeholder="e.g., CBIC 123/2024" defaultValue={editing?.notificationRef || ''} style={inputStyle} />

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

export default GstRulesTab;