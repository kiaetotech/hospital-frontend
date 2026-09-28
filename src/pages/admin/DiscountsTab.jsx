// src/pages/admin/DiscountsTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  listDiscounts, createDiscount, updateDiscountFull, deleteDiscount, TAGS
} from '../../services/adminTaxesApi';

const th = { padding: '0.75rem', textAlign: 'left', fontWeight: 700, color: '#1e293b', fontSize: '0.8rem' };
const td = { padding: '0.75rem', color: '#475569', fontSize: '0.85rem' };
const inputStyle = { padding: '0.6rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.9rem', width: '100%' };
const actionBtn = (bg) => ({
  padding: '0.3rem 0.6rem', background: bg, color: 'white', border: 'none',
  borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', marginRight: '0.3rem'
});

const DiscountsTab = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      const res = await listDiscounts(params);
      let data = res.data.data || [];
      // Client-side tag filter (since applicableTags is an array)
      if (tagFilter) {
        data = data.filter(d => (d.applicableTags || []).some(t => t.startsWith(tagFilter.toLowerCase())));
      }
      setDiscounts(data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, [search, tagFilter]);

  useEffect(() => { fetchDiscounts(); }, [fetchDiscounts]);

  const addNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const applicableTags = Array.from(form.querySelectorAll('input[name="applicableTags"]:checked')).map(cb => cb.value);
    if (applicableTags.length === 0) {
      addNotice('❌ Select at least one service');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateDiscountFull(editing._id, {
          value: Number(form.value.value),
          maxDiscount: form.maxDiscount.value ? Number(form.maxDiscount.value) : null,
          validFrom: form.validFrom.value,
          validTill: form.validTill.value,
          applicableTags,
          isActive: form.isActive.checked
        });
        addNotice('✅ Discount updated');
      } else {
        await createDiscount({
          code: form.code.value,
          discountType: form.discountType.value,
          value: Number(form.value.value),
          maxDiscount: form.maxDiscount.value ? Number(form.maxDiscount.value) : undefined,
          validFrom: form.validFrom.value,
          validTill: form.validTill.value,
          applicableTags
        });
        addNotice('✅ Discount created');
      }
      setShowModal(false);
      setEditing(null);
      fetchDiscounts();
    } catch (e) {
      addNotice('❌ ' + (e.response?.data?.error || e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (d) => {
    try {
      await updateDiscountFull(d._id, { isActive: !d.isActive });
      addNotice('✅ Discount updated');
      fetchDiscounts();
    } catch (e) {
      addNotice('❌ ' + (e.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (d) => {
    if (!window.confirm(`Delete discount "${d.code}"?`)) return;
    try {
      await deleteDiscount(d._id);
      addNotice('✅ Discount deleted');
      fetchDiscounts();
    } catch (e) {
      addNotice('❌ ' + (e.response?.data?.error || e.message));
    }
  };

  const ALL_AYURVEDA_TAGS = [
    { id: 'ayurveda_consultation', label: '👨‍⚕️ Doctor Consultation' },
    { id: 'ayurveda_wellness_program', label: '💪 Wellness Program (Doctor)' },
    { id: 'ayurveda_panchakarma', label: '🧘 Panchakarma Package' },
    { id: 'ayurveda_home_therapy', label: '🏠 Home Therapy' },
    { id: 'ayurveda_all', label: '⭐ All Ayurveda Services' }
  ];

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
          <h2 style={{ fontWeight: 700, margin: 0 }}>🏷️ Discounts ({discounts.length})</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="🔍 Search by code..."
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
            <button onClick={fetchDiscounts} style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>↻</button>
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
            >
              + Create Discount
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
        ) : discounts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No discounts found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={th}>Code</th>
                <th style={th}>Value</th>
                <th style={th}>Max Discount</th>
                <th style={th}>Applies To</th>
                <th style={th}>Valid From</th>
                <th style={th}>Valid Till</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={td}><strong>{d.code}</strong></td>
                  <td style={td}>{d.value}{d.type === 'percentage' ? '%' : '₹'}</td>
                  <td style={td}>{d.maxDiscount ? `₹${d.maxDiscount}` : '—'}</td>
                  <td style={{ ...td, maxWidth: 220, fontSize: '0.75rem' }}>
                    {(d.applicableTags || []).slice(0, 3).join(', ')}
                    {(d.applicableTags || []).length > 3 ? ` +${d.applicableTags.length - 3}` : ''}
                  </td>
                  <td style={td}>{d.validFrom ? new Date(d.validFrom).toLocaleDateString() : '—'}</td>
                  <td style={td}>{d.validUntil ? new Date(d.validUntil).toLocaleDateString() : '—'}</td>
                  <td style={td}>
                    {d.isActive
                      ? <span style={{ color: '#059669', fontWeight: 600 }}>🟢 Active</span>
                      : <span style={{ color: '#dc2626' }}>🔴 Inactive</span>}
                  </td>
                  <td style={td}>
                    <button onClick={() => { setEditing(d); setShowModal(true); }} style={actionBtn('#3b82f6')}>Edit</button>
                    <button onClick={() => handleToggle(d)} style={actionBtn(d.isActive ? '#ef4444' : '#10b981')}>
                      {d.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(d)} style={actionBtn('#dc2626')}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem' }}>{editing ? `✏️ Edit Discount — ${editing.code}` : '🏷️ Create Discount'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {!editing && (
                <>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Code *</label>
                  <input name="code" placeholder="e.g., AYUR50" required style={inputStyle} />

                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Discount Type *</label>
                  <select name="discountType" required style={inputStyle}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </>
              )}

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Value *</label>
              <input name="value" type="number" required defaultValue={editing?.value} style={inputStyle} />

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Max Discount (₹, optional)</label>
              <input name="maxDiscount" type="number" defaultValue={editing?.maxDiscount || ''} style={inputStyle} />

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Valid From *</label>
              <input
                name="validFrom"
                type="date"
                required
                defaultValue={editing?.validFrom ? new Date(editing.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                style={inputStyle}
              />

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Valid Till *</label>
              <input
                name="validTill"
                type="date"
                required
                defaultValue={editing?.validUntil ? new Date(editing.validUntil).toISOString().split('T')[0] : ''}
                style={inputStyle}
              />

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Applies To (select at least one) *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {ALL_AYURVEDA_TAGS.map(opt => (
                    <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <input
                        type="checkbox"
                        name="applicableTags"
                        value={opt.id}
                        defaultChecked={editing ? (editing.applicableTags || []).includes(opt.id) : opt.id === 'ayurveda_consultation'}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {editing && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <input type="checkbox" name="isActive" defaultChecked={editing.isActive} />
                  Active
                </label>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '0.6rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                  {saving ? 'Saving...' : (editing ? 'Save Changes' : 'Create')}
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

export default DiscountsTab;