import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-f1b1.up.railway.app';
const ADMIN_KEY = 'admin_secret_key_2024';

const AdminDiscounts = () => {
  const navigate = useNavigate();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    description: '',
    applicableTags: [],
    minAmount: '',
    maxDiscount: '',
    validUntil: '',
    maxUses: '',
    isActive: true
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchDiscounts();
  }, [navigate]);

  const fetchDiscounts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/discounts/admin/all`, {
        headers: { 'X-Admin-Key': ADMIN_KEY }
      });
      const data = await response.json();
      if (data.success) {
        setDiscounts(data.discounts || []);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const url = editingDiscount 
        ? `${API_URL}/api/discounts/admin/${editingDiscount.code}`
        : `${API_URL}/api/discounts/admin/create`;
      
      const method = editingDiscount ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': ADMIN_KEY
        },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          type: formData.type,
          value: parseFloat(formData.value),
          description: formData.description,
          applicableTags: formData.applicableTags,
          minAmount: parseFloat(formData.minAmount) || 0,
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          validUntil: formData.validUntil || null,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setShowForm(false);
        setEditingDiscount(null);
        setFormData({
          code: '',
          type: 'percentage',
          value: '',
          description: '',
          applicableTags: [],
          minAmount: '',
          maxDiscount: '',
          validUntil: '',
          maxUses: '',
          isActive: true
        });
        fetchDiscounts();
        alert(data.message);
      } else {
        setError(data.message || 'Failed to save discount');
      }
    } catch (error) {
      setError('Error saving discount');
    }
  };

  const handleToggleStatus = async (code, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/discounts/admin/${code}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': ADMIN_KEY
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchDiscounts();
      }
    } catch (error) {
      console.error('Error toggling discount:', error);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`Delete discount ${code}?`)) return;
    
    try {
      const response = await fetch(`${API_URL}/api/discounts/admin/${code}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Key': ADMIN_KEY }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchDiscounts();
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
    }
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      description: discount.description || '',
      applicableTags: discount.applicableTags || [],
      minAmount: discount.minAmount || '',
      maxDiscount: discount.maxDiscount || '',
      validUntil: discount.validUntil ? discount.validUntil.split('T')[0] : '',
      maxUses: discount.maxUses || '',
      isActive: discount.isActive
    });
    setShowForm(true);
  };

  const availableTags = [
    'opd', 'admission', 'ambulance', 'labtest', 
    'health_package', 'caregiver', 'loan', 'general'
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem', textAlign: 'center' }}>
        <p>Loading discounts...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Discount Management</h1>
          <div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              style={{ backgroundColor: '#e5e7eb', color: '#374151', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', marginRight: '1rem' }}
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={() => { setEditingDiscount(null); setShowForm(true); }}
              style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
              + Add Discount
            </button>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', color: '#dc2626' }}>
            {error}
          </div>
        )}

        {showForm && (
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {editingDiscount ? 'Edit Discount' : 'Create New Discount'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="e.g., WELCOME10"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    required
                    disabled={!!editingDiscount}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Value *</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    placeholder="e.g., 10 for 10% or ₹100"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="e.g., 10% off on first booking"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Minimum Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({...formData, minAmount: e.target.value})}
                    placeholder="e.g., 500"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Max Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                    placeholder="e.g., 1000"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Valid Until</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Max Uses</label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                    placeholder="e.g., 100"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Applicable Tags</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {availableTags.map(tag => (
                      <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input
                          type="checkbox"
                          checked={formData.applicableTags.includes(tag)}
                          onChange={(e) => {
                            const newTags = e.target.checked
                              ? [...formData.applicableTags, tag]
                              : formData.applicableTags.filter(t => t !== tag);
                            setFormData({...formData, applicableTags: newTags});
                          }}
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  type="submit"
                  style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                >
                  {editingDiscount ? 'Update' : 'Create'} Discount
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingDiscount(null); }}
                  style={{ backgroundColor: '#e5e7eb', color: '#374151', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Code</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Value</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Tags</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Used</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    No discounts created yet
                  </td>
                </tr>
              ) : (
                discounts.map(discount => (
                  <tr key={discount.code} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{discount.code}</td>
                    <td style={{ padding: '0.75rem' }}>{discount.type}</td>
                    <td style={{ padding: '0.75rem' }}>
                      {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.75rem' }}>
                      {discount.applicableTags?.join(', ') || 'All'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {discount.usedCount || 0}{discount.maxUses ? ` / ${discount.maxUses}` : ''}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        backgroundColor: discount.isActive ? '#10b981' : '#ef4444',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem'
                      }}>
                        {discount.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => handleEdit(discount)}
                        style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem', marginRight: '0.25rem' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(discount.code, discount.isActive)}
                        style={{
                          backgroundColor: discount.isActive ? '#f59e0b' : '#10b981',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          marginRight: '0.25rem'
                        }}
                      >
                        {discount.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(discount.code)}
                        style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDiscounts;
