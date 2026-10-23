// D:\hospital-frontend\src\pages\lender\LenderLoanHub.jsx
// ============================================
// LENDER LOAN HUB — Task 18 Part 2 (Part A of 2)
// ============================================
// Tabbed interface: Products, Applications, Offers, Agreements, Disbursements, Repayment
// Uses loan v2 API endpoints via services/lenderApi.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLender } from '../../contexts/LenderContext';
import {
  loanProducts,
  loanOffers,
  loanAgreements,
  loanDisbursements,
  loanRepayment,
  lenderApplications,
} from '../../services/lenderApi';

// ============================================
// MAIN COMPONENT
// ============================================
const LenderLoanHub = () => {
  const navigate = useNavigate();
  const { lender } = useLender();
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab: Products
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Tab: Applications
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [appFilters, setAppFilters] = useState({ status: 'all', page: 1, limit: 20 });
  const [appTotalPages, setAppTotalPages] = useState(1);
  const [appTotal, setAppTotal] = useState(0);

  // Tab: Offers
  const [applicationOffers, setApplicationOffers] = useState([]);
  const [showOfferForm, setShowOfferForm] = useState(false);

  // Tab: Agreements
  const [applicationAgreements, setApplicationAgreements] = useState([]);

  // Tab: Disbursements
  const [applicationDisbursements, setApplicationDisbursements] = useState([]);
  const [showDisbursementForm, setShowDisbursementForm] = useState(false);

  // Tab: Repayment
  const [applicationMandates, setApplicationMandates] = useState([]);
  const [loanSchedule, setLoanSchedule] = useState(null);

  // ============================================
  // AUTH GUARD
  // ============================================
  useEffect(() => {
    if (!lender) {
      navigate('/lender/login');
      return;
    }
  }, [lender, navigate]);

  // ============================================
  // FETCHERS
  // ============================================
  const fetchProducts = useCallback(async () => {
    try {
      const res = await loanProducts.list();
      setProducts(res.data.products || []);
    } catch (err) {
      setError('Failed to load products: ' + (err.response?.data?.error || err.message));
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await lenderApplications.getAll(appFilters);
      setApplications(res.data.applications || []);
      setAppTotalPages(res.data.totalPages || 1);
      setAppTotal(res.data.total || 0);
    } catch (err) {
      setError('Failed to load applications: ' + (err.response?.data?.error || err.message));
    }
  }, [appFilters]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchApplications()]);
      setLoading(false);
    })();
  }, [fetchProducts, fetchApplications]);

  // ============================================
  // TAB HANDLERS
  // ============================================
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSelectedApplication(null);
  };

  const handleSelectApplication = async (application) => {
    setSelectedApplication(application);
    try {
      const [offersRes, agreementsRes, disbsRes, mandatesRes] = await Promise.all([
        loanOffers.listByApplication(application.applicationId).catch(() => ({ data: { offers: [] } })),
        loanAgreements.listByApplication(application.applicationId).catch(() => ({ data: { agreements: [] } })),
        loanDisbursements.listByApplication(application.applicationId).catch(() => ({ data: { disbursements: [] } })),
        loanRepayment.listMandates(application.applicationId).catch(() => ({ data: { mandates: [] } })),
      ]);
      setApplicationOffers(offersRes.data.offers || []);
      setApplicationAgreements(agreementsRes.data.agreements || []);
      setApplicationDisbursements(disbsRes.data.disbursements || []);
      setApplicationMandates(mandatesRes.data.mandates || []);
    } catch (err) {
      // Silent fail
    }
  };

  // ============================================
  // PRODUCT CRUD HANDLERS
  // ============================================
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setError('');
    const form = e.target;
    const payload = {
      productCode: form.productCode.value.trim(),
      productName: form.productName.value.trim(),
      productCategory: form.productCategory.value,
      description: form.description.value.trim(),
      minAmount: parseFloat(form.minAmount.value),
      maxAmount: parseFloat(form.maxAmount.value),
      interestRate: parseFloat(form.interestRate.value),
      minTenureMonths: parseInt(form.minTenureMonths.value),
      maxTenureMonths: parseInt(form.maxTenureMonths.value),
      processingFeeType: form.processingFeeType.value,
      processingFeePercent: parseFloat(form.processingFeePercent.value) || 0,
      processingFeeFixed: parseFloat(form.processingFeeFixed.value) || 0,
      minCibilScore: parseInt(form.minCibilScore.value) || 650,
      approvalTimeHours: parseInt(form.approvalTimeHours.value) || 24,
    };

    try {
      if (editingProduct) {
        await loanProducts.update(editingProduct.productId, payload);
        alert('Product updated');
      } else {
        await loanProducts.create(payload);
        alert('Product draft created');
      }
      setShowProductForm(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed: ' + err.message);
    }
  };

  const handleActivateProduct = async (productId) => {
    if (!window.confirm('Activate this product? It will be visible to patients.')) return;
    try {
      await loanProducts.activate(productId);
      alert('Product activated');
      await fetchProducts();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeactivateProduct = async (productId) => {
    const reason = window.prompt('Reason for deactivation?');
    if (!reason) return;
    try {
      await loanProducts.deactivate(productId, { reason, force: true });
      alert('Product deactivated');
      await fetchProducts();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleVersionProduct = async (productId) => {
    const newRate = window.prompt('New interest rate (%)? Leave blank to keep current.');
    try {
      const updates = newRate ? { interestRate: parseFloat(newRate) } : {};
      await loanProducts.version(productId, updates);
      alert('New version created as draft');
      await fetchProducts();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  // ============================================
  // APPLICATION UNDERWRITE HANDLERS
  // ============================================
  const handleUpdateStatus = async (applicationId, status, extraData = {}) => {
    try {
      await lenderApplications.updateStatus(applicationId, { status, ...extraData });
      alert(`Application ${status}`);
      await fetchApplications();
      setSelectedApplication(null);
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  // ============================================
  // STYLES
  // ============================================
  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
    header: { background: 'linear-gradient(135deg, #0f766e, #059669)', color: 'white', padding: '1.5rem 2rem' },
    headerTitle: { fontSize: '1.75rem', fontWeight: 800, margin: 0 },
    headerSubtitle: { opacity: 0.9, fontSize: '0.9rem', marginTop: '4px' },
    tabsBar: { backgroundColor: 'white', padding: '0.75rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 100 },
    tabButton: (isActive) => ({ padding: '0.6rem 1.25rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: isActive ? 700 : 500, background: isActive ? '#059669' : 'transparent', color: isActive ? 'white' : '#475569', whiteSpace: 'nowrap' }),
    content: { padding: '2rem', maxWidth: '1400px', margin: '0 auto' },
    card: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
    cardTitle: { fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' },
    input: { width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', marginBottom: '0.75rem' },
    buttonPrimary: { padding: '0.75rem 1.5rem', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' },
    buttonSecondary: { padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', fontSize: '0.85rem' },
    buttonDanger: { padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', fontSize: '0.85rem' },
    errorBox: { background: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
    th: { textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' },
    td: { padding: '0.75rem', borderBottom: '1px solid #f1f5f9', color: '#475569' },
    statusBadge: (status) => {
      const colors = {
        draft: { bg: '#f1f5f9', color: '#64748b' },
        active: { bg: '#d1fae5', color: '#065f46' },
        inactive: { bg: '#f1f5f9', color: '#64748b' },
        suspended: { bg: '#fee2e2', color: '#991b1b' },
        submitted: { bg: '#dbeafe', color: '#1e40af' },
        under_review: { bg: '#fef3c7', color: '#92400e' },
        document_pending: { bg: '#fed7aa', color: '#9a3412' },
        offer_issued: { bg: '#dbeafe', color: '#1e40af' },
        offer_accepted: { bg: '#d1fae5', color: '#065f46' },
        approved: { bg: '#d1fae5', color: '#065f46' },
        pending_disbursal: { bg: '#fef3c7', color: '#92400e' },
        disbursed: { bg: '#d1fae5', color: '#065f46' },
        completed: { bg: '#d1fae5', color: '#065f46' },
        rejected: { bg: '#fee2e2', color: '#991b1b' },
        withdrawn: { bg: '#f1f5f9', color: '#64748b' },
        cancelled: { bg: '#f1f5f9', color: '#64748b' },
        agreement_pending: { bg: '#ede9fe', color: '#5b21b6' },
        agreement_signed: { bg: '#d1fae5', color: '#065f46' },
      };
      const c = colors[status] || { bg: '#f1f5f9', color: '#64748b' };
      return { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, background: c.bg, color: c.color };
    },
  };

  if (!lender) return null;

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>🏦 Lender Loan Hub</h1>
          <p style={styles.headerSubtitle}>Loading...</p>
        </div>
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={styles.headerTitle}>🏦 Lender Loan Hub</h1>
            <p style={styles.headerSubtitle}>{lender?.businessName} · Manage products, applications, offers, agreements, disbursements</p>
          </div>
          <button onClick={() => navigate('/lender/dashboard')} style={{ ...styles.buttonSecondary, background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={styles.tabsBar}>
        {[
          { id: 'products', label: `📦 Products (${products.length})` },
          { id: 'applications', label: `📋 Applications (${appTotal})` },
          { id: 'offers', label: '📄 Offers' },
          { id: 'agreements', label: '✍️ Agreements' },
          { id: 'disbursements', label: '💸 Disbursements' },
          { id: 'repayment', label: '💳 Repayment' },
        ].map(tab => (
          <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={styles.tabButton(activeTab === tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={styles.content}>
        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        {/* ============================================
            TAB 1: PRODUCTS
            ============================================ */}
        {activeTab === 'products' && (
          <div>
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={styles.cardTitle}>📦 Loan Products ({products.length})</h2>
                <button
                  onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
                  style={styles.buttonPrimary}
                >
                  + New Product
                </button>
              </div>

              {products.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                  No products yet. Create your first loan product to start accepting applications.
                </p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Code</th>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>Amount Range</th>
                      <th style={styles.th}>Interest</th>
                      <th style={styles.th}>Tenure</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.productId}>
                        <td style={styles.td}><code>{p.productCode}</code></td>
                        <td style={styles.td}><strong>{p.productName}</strong></td>
                        <td style={styles.td}>{p.productCategory?.replace(/_/g, ' ')}</td>
                        <td style={styles.td}>₹{(p.minAmount || 0).toLocaleString()} – ₹{(p.maxAmount || 0).toLocaleString()}</td>
                        <td style={styles.td}>{p.interestRate}%</td>
                        <td style={styles.td}>{p.minTenureMonths}–{p.maxTenureMonths}m</td>
                        <td style={styles.td}><span style={styles.statusBadge(p.status)}>{p.status}</span></td>
                        <td style={styles.td}>
                          {p.status === 'draft' && (
                            <>
                              <button onClick={() => { setEditingProduct(p); setShowProductForm(true); }} style={{ ...styles.buttonSecondary, marginRight: '0.25rem' }}>Edit</button>
                              <button onClick={() => handleActivateProduct(p.productId)} style={{ ...styles.buttonPrimary, padding: '0.4rem 0.75rem', fontSize: '0.8rem', marginRight: '0.25rem' }}>Activate</button>
                            </>
                          )}
                          {p.status === 'active' && (
                            <>
                              <button onClick={() => handleVersionProduct(p.productId)} style={{ ...styles.buttonSecondary, marginRight: '0.25rem' }}>Version</button>
                              <button onClick={() => handleDeactivateProduct(p.productId)} style={styles.buttonDanger}>Deactivate</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Product Form Modal */}
            {showProductForm && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>
                  {editingProduct ? `Edit Product: ${editingProduct.productName}` : 'Create New Product'}
                  <button onClick={() => { setShowProductForm(false); setEditingProduct(null); }} style={{ ...styles.buttonSecondary, float: 'right' }}>Cancel</button>
                </h2>
                <form onSubmit={handleCreateProduct}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Product Code *</label>
                      <input name="productCode" required defaultValue={editingProduct?.productCode || ''} placeholder="MED-EMI-001" style={styles.input} disabled={!!editingProduct} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Product Name *</label>
                      <input name="productName" required defaultValue={editingProduct?.productName || ''} placeholder="Medical Loan Standard" style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Category *</label>
                      <select name="productCategory" required defaultValue={editingProduct?.productCategory || 'medical_loan'} style={styles.input}>
                        <option value="medical_loan">Medical Loan</option>
                        <option value="surgery_financing">Surgery Financing</option>
                        <option value="diagnostic_emi">Diagnostic EMI</option>
                        <option value="treatment_loan">Treatment Loan</option>
                        <option value="no_cost_emi">No-Cost EMI</option>
                        <option value="corporate_loan">Corporate Loan</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Description</label>
                      <input name="description" defaultValue={editingProduct?.description || ''} style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Min Amount (₹) *</label>
                      <input name="minAmount" type="number" required defaultValue={editingProduct?.minAmount || 50000} style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Max Amount (₹) *</label>
                      <input name="maxAmount" type="number" required defaultValue={editingProduct?.maxAmount || 500000} style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Interest Rate (%) *</label>
                      <input name="interestRate" type="number" step="0.1" required defaultValue={editingProduct?.interestRate || 12} style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Min Tenure (months) *</label>
                      <input name="minTenureMonths" type="number" required defaultValue={editingProduct?.minTenureMonths || 6} style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Max Tenure (months) *</label>
                      <input name="maxTenureMonths" type="number" required defaultValue={editingProduct?.maxTenureMonths || 36} style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Processing Fee Type</label>
                      <select name="processingFeeType" defaultValue={editingProduct?.processingFeeType || 'percentage'} style={styles.input}>
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Processing Fee (%)</label>
                      <input name="processingFeePercent" type="number" step="0.1" defaultValue={editingProduct?.processingFeePercent || 2} style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Processing Fee Fixed (₹)</label>
                      <input name="processingFeeFixed" type="number" defaultValue={editingProduct?.processingFeeFixed || 0} style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Min CIBIL Score</label>
                      <input name="minCibilScore" type="number" defaultValue={editingProduct?.minCibilScore || 650} style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Approval Time (hours)</label>
                      <input name="approvalTimeHours" type="number" defaultValue={editingProduct?.approvalTimeHours || 24} style={styles.input} />
                    </div>
                  </div>
                  <button type="submit" style={styles.buttonPrimary}>
                    {editingProduct ? 'Save Changes' : 'Create Draft'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ============================================
            TAB 2: APPLICATIONS
            ============================================ */}
        {activeTab === 'applications' && (
          <div>
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={styles.cardTitle}>📋 Applications ({appTotal})</h2>
                <select
                  value={appFilters.status}
                  onChange={(e) => setAppFilters({ ...appFilters, status: e.target.value, page: 1 })}
                  style={{ ...styles.input, width: 'auto', marginBottom: 0 }}
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="document_pending">Document Pending</option>
                  <option value="offer_issued">Offer Issued</option>
                  <option value="approved">Approved</option>
                  <option value="disbursed">Disbursed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {applications.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No applications match your filter.</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Application ID</th>
                      <th style={styles.th}>Patient</th>
                      <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Treatment</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Submitted</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app.applicationId}>
                        <td style={styles.td}><code>{app.applicationId}</code></td>
                        <td style={styles.td}>{app.patientDetails?.fullName || 'N/A'}</td>
                        <td style={styles.td}>₹{(app.estimatedAmount || 0).toLocaleString()}</td>
                        <td style={styles.td}>{app.treatmentType || 'N/A'}</td>
                        <td style={styles.td}><span style={styles.statusBadge(app.status)}>{app.status}</span></td>
                        <td style={styles.td}>{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}</td>
                        <td style={styles.td}>
                          <button onClick={() => handleSelectApplication(app)} style={styles.buttonSecondary}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {appTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  <button onClick={() => setAppFilters({ ...appFilters, page: Math.max(1, appFilters.page - 1) })} disabled={appFilters.page === 1} style={styles.buttonSecondary}>Prev</button>
                  <span style={{ padding: '0.5rem 1rem' }}>Page {appFilters.page} of {appTotalPages}</span>
                  <button onClick={() => setAppFilters({ ...appFilters, page: Math.min(appTotalPages, appFilters.page + 1) })} disabled={appFilters.page === appTotalPages} style={styles.buttonSecondary}>Next</button>
                </div>
              )}
            </div>

            {/* Application Detail */}
            {selectedApplication && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>
                  Application {selectedApplication.applicationId}
                  <button onClick={() => setSelectedApplication(null)} style={{ ...styles.buttonSecondary, float: 'right' }}>Close</button>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  <div><strong>Patient:</strong> {selectedApplication.patientDetails?.fullName}</div>
                  <div><strong>Phone:</strong> {selectedApplication.patientDetails?.phone}</div>
                  <div><strong>Treatment:</strong> {selectedApplication.treatmentType}</div>
                  <div><strong>Hospital:</strong> {selectedApplication.hospitalName}</div>
                  <div><strong>Estimated:</strong> ₹{(selectedApplication.estimatedAmount || 0).toLocaleString()}</div>
                  <div><strong>Status:</strong> <span style={styles.statusBadge(selectedApplication.status)}>{selectedApplication.status}</span></div>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Underwrite</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedApplication.status === 'submitted' && (
                    <button onClick={() => handleUpdateStatus(selectedApplication.applicationId, 'under_review', { note: 'Moved to review' })} style={styles.buttonPrimary}>
                      → Under Review
                    </button>
                  )}
                  {['submitted', 'under_review', 'document_pending'].includes(selectedApplication.status) && (
                    <button onClick={() => {
                      const sanction = parseFloat(window.prompt('Sanctioned amount (₹)?') || '0');
                      const tenure = parseInt(window.prompt('Tenure (months)?') || '12');
                      const rate = parseFloat(window.prompt('Interest rate (%)?') || '12');
                      if (!sanction || !tenure || !rate) return;
                      handleUpdateStatus(selectedApplication.applicationId, 'approved', { sanctionedAmount: sanction, tenure, interestRate: rate, note: 'Approved' });
                    }} style={{ ...styles.buttonPrimary, background: '#10b981' }}>
                      ✅ Approve
                    </button>
                  )}
                  {!['disbursed', 'rejected', 'withdrawn', 'cancelled', 'completed'].includes(selectedApplication.status) && (
                    <button onClick={() => {
                      const reason = window.prompt('Rejection reason?');
                      if (!reason) return;
                      handleUpdateStatus(selectedApplication.applicationId, 'rejected', { note: reason });
                    }} style={styles.buttonDanger}>
                      ❌ Reject
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================
            TAB 3: OFFERS
            ============================================ */}
        {activeTab === 'offers' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📄 Offers</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Select an application to view or issue offers
              </p>

              {applications.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                  No applications yet. Underwrite applications first.
                </p>
              ) : (
                <select
                  onChange={(e) => {
                    const app = applications.find(a => a.applicationId === e.target.value);
                    if (app) handleSelectApplication(app);
                  }}
                  style={{ ...styles.input, marginBottom: '1rem' }}
                  defaultValue=""
                >
                  <option value="" disabled>Select application</option>
                  {applications.map(app => (
                    <option key={app.applicationId} value={app.applicationId}>
                      {app.applicationId} — {app.patientDetails?.fullName} — {app.status}
                    </option>
                  ))}
                </select>
              )}

              {selectedApplication && ['under_review', 'document_pending', 'offer_declined', 'offer_expired'].includes(selectedApplication.status) && (
                <div style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Issue New Offer</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    try {
                      await loanOffers.issue({
                        applicationId: selectedApplication.applicationId,
                        sanctionedAmount: parseFloat(form.sanctionedAmount.value),
                        interestRate: parseFloat(form.interestRate.value),
                        tenureMonths: parseInt(form.tenureMonths.value),
                        processingFee: parseFloat(form.processingFee.value) || 0,
                        validUntilDays: parseInt(form.validUntilDays.value) || 7,
                        notes: form.notes.value || '',
                      });
                      alert('Offer issued');
                      await handleSelectApplication(selectedApplication);
                    } catch (err) {
                      alert('Failed: ' + (err.response?.data?.error || err.message));
                    }
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Sanctioned Amount (₹) *</label>
                        <input name="sanctionedAmount" type="number" required defaultValue={selectedApplication.estimatedAmount} style={styles.input} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Interest Rate (%) *</label>
                        <input name="interestRate" type="number" step="0.1" required defaultValue="12" style={styles.input} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Tenure (months) *</label>
                        <input name="tenureMonths" type="number" required defaultValue={selectedApplication.requestedTenure || 12} style={styles.input} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Processing Fee (₹)</label>
                        <input name="processingFee" type="number" defaultValue="0" style={styles.input} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Valid For (days)</label>
                        <input name="validUntilDays" type="number" defaultValue="7" style={styles.input} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Notes</label>
                        <input name="notes" style={styles.input} />
                      </div>
                    </div>
                    <button type="submit" style={styles.buttonPrimary}>📄 Issue Offer</button>
                  </form>
                </div>
              )}

              {selectedApplication && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Offers ({applicationOffers.length})
                  </h3>
                  {applicationOffers.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem' }}>No offers yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {applicationOffers.map(offer => (
                        <div key={offer.offerId} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: offer.status === 'issued' ? '#f0f9ff' : 'white' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div>
                              <strong style={{ fontSize: '1.1rem' }}>₹{(offer.sanctionedAmount || 0).toLocaleString()}</strong>
                              <span style={{ marginLeft: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                @ {offer.interestRate}% × {offer.tenureMonths}m · v{offer.version || 1}
                              </span>
                            </div>
                            <span style={styles.statusBadge(offer.status)}>{offer.status}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                            <div><strong>EMI:</strong> ₹{(offer.emi || 0).toLocaleString()}</div>
                            <div><strong>Processing Fee:</strong> ₹{(offer.processingFee || 0).toLocaleString()}</div>
                            <div><strong>Total Payable:</strong> ₹{(offer.totalPayable || 0).toLocaleString()}</div>
                            <div><strong>Valid Until:</strong> {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : 'N/A'}</div>
                            <div><strong>Issued:</strong> {offer.issuedAt ? new Date(offer.issuedAt).toLocaleDateString() : 'N/A'}</div>
                          </div>
                          {offer.status === 'issued' && (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <button onClick={async () => {
                                try {
                                  await loanOffers.withdraw(offer.offerId, { reason: 'Withdrawn by lender' });
                                  alert('Offer withdrawn');
                                  await handleSelectApplication(selectedApplication);
                                } catch (err) {
                                  alert('Failed: ' + (err.response?.data?.error || err.message));
                                }
                              }} style={styles.buttonDanger}>Withdraw</button>
                              <button onClick={async () => {
                                const newRate = window.prompt('New interest rate (%)?');
                                if (!newRate) return;
                                try {
                                  await loanOffers.version(offer.offerId, { interestRate: parseFloat(newRate) });
                                  alert('New version issued');
                                  await handleSelectApplication(selectedApplication);
                                } catch (err) {
                                  alert('Failed: ' + (err.response?.data?.error || err.message));
                                }
                              }} style={styles.buttonSecondary}>Revise Rate</button>
                              <button onClick={async () => {
                                if (!window.confirm('Mark as expired?')) return;
                                try {
                                  await loanOffers.expire(offer.offerId);
                                  alert('Offer expired');
                                  await handleSelectApplication(selectedApplication);
                                } catch (err) {
                                  alert('Failed: ' + (err.response?.data?.error || err.message));
                                }
                              }} style={styles.buttonSecondary}>Expire</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================
            TAB 4: AGREEMENTS
            ============================================ */}
        {activeTab === 'agreements' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>✍️ Agreements</h2>

              {applications.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No applications yet.</p>
              ) : (
                <select
                  onChange={(e) => {
                    const app = applications.find(a => a.applicationId === e.target.value);
                    if (app) handleSelectApplication(app);
                  }}
                  style={{ ...styles.input, marginBottom: '1rem' }}
                  defaultValue=""
                >
                  <option value="" disabled>Select application</option>
                  {applications.map(app => (
                    <option key={app.applicationId} value={app.applicationId}>
                      {app.applicationId} — {app.patientDetails?.fullName} — {app.status}
                    </option>
                  ))}
                </select>
              )}

              {selectedApplication && ['offer_accepted', 'agreement_pending'].includes(selectedApplication.status) && (
                <div style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Initiate Agreement</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    const acceptedOffer = applicationOffers.find(o => o.status === 'accepted');
                    if (!acceptedOffer) {
                      alert('No accepted offer found. Patient must accept an offer first.');
                      return;
                    }
                    try {
                      await loanAgreements.initiate({
                        applicationId: selectedApplication.applicationId,
                        offerId: acceptedOffer.offerId,
                        esignProvider: form.esignProvider.value,
                        expiresInDays: parseInt(form.expiresInDays.value) || 14,
                      });
                      alert('Agreement initiated');
                      await handleSelectApplication(selectedApplication);
                    } catch (err) {
                      alert('Failed: ' + (err.response?.data?.error || err.message));
                    }
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>eSign Provider</label>
                        <select name="esignProvider" defaultValue="manual" style={styles.input}>
                          <option value="manual">Manual (recommended for now)</option>
                          <option value="digio">Digio</option>
                          <option value="leegality">Leegality</option>
                          <option value="nsdl">NSDL</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Expires In (days)</label>
                        <input name="expiresInDays" type="number" defaultValue="14" style={styles.input} />
                      </div>
                    </div>
                    <button type="submit" style={styles.buttonPrimary}>Initiate Agreement</button>
                  </form>
                </div>
              )}

              {selectedApplication && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Agreements ({applicationAgreements.length})
                  </h3>
                  {applicationAgreements.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem' }}>No agreements yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {applicationAgreements.map(agreement => (
                        <div key={agreement.agreementId} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: agreement.status === 'signed' ? '#f0fdf4' : 'white' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div>
                              <strong>Agreement {agreement.agreementId}</strong>
                              <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#64748b' }}>Offer: {agreement.offerId} · Provider: {agreement.esignProvider}</p>
                            </div>
                            <span style={styles.statusBadge(agreement.status)}>{agreement.status}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                            <div><strong>Lender Signed:</strong> {agreement.signedByLender ? '✅' : '⏳'}</div>
                            <div><strong>Patient Signed:</strong> {agreement.signedByPatient ? '✅' : '⏳'}</div>
                            <div><strong>Initiated:</strong> {agreement.initiatedAt ? new Date(agreement.initiatedAt).toLocaleDateString() : 'N/A'}</div>
                            <div><strong>Expires:</strong> {agreement.expiresAt ? new Date(agreement.expiresAt).toLocaleDateString() : 'N/A'}</div>
                          </div>
                          {!agreement.signedByLender && ['pending', 'initiated'].includes(agreement.status) && (
                            <button onClick={async () => {
                              const name = window.prompt('Your name (lender signatory)?');
                              if (!name) return;
                              try {
                                await loanAgreements.sign ? null : null;
                                // Sign via backend — need to add to lenderApi
                                const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://hospital-backend-ilhi.onrender.com'}/api/loan/v2/agreements/${agreement.agreementId}/sign`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('lenderToken')}` },
                                  body: JSON.stringify({ signerRole: 'lender', signatoryName: name }),
                                });
                                const data = await res.json();
                                if (data.success) {
                                  alert('Lender signature recorded');
                                  await handleSelectApplication(selectedApplication);
                                } else {
                                  alert('Failed: ' + data.error);
                                }
                              } catch (err) {
                                alert('Failed: ' + err.message);
                              }
                            }} style={styles.buttonPrimary}>✍️ Sign as Lender</button>
                          )}
                          {agreement.status === 'signed' && (
                            <p style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 600, margin: '0.5rem 0 0' }}>✅ Fully signed — ready for disbursement</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================
            TAB 5: DISBURSEMENTS
            ============================================ */}
        {activeTab === 'disbursements' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>💸 Disbursements</h2>

              {applications.filter(a => ['agreement_signed', 'pending_disbursal', 'disbursed'].includes(a.status)).length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                  No applications ready for disbursement. Sign agreements first.
                </p>
              ) : (
                <select
                  onChange={(e) => {
                    const app = applications.find(a => a.applicationId === e.target.value);
                    if (app) handleSelectApplication(app);
                  }}
                  style={{ ...styles.input, marginBottom: '1rem' }}
                  defaultValue=""
                >
                  <option value="" disabled>Select application</option>
                  {applications.filter(a => ['agreement_signed', 'pending_disbursal', 'disbursed'].includes(a.status)).map(app => (
                    <option key={app.applicationId} value={app.applicationId}>
                      {app.applicationId} — {app.patientDetails?.fullName} — {app.status}
                    </option>
                  ))}
                </select>
              )}

              {selectedApplication && selectedApplication.status === 'agreement_signed' && (
                <div style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Initiate Disbursement</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    const signedAgreement = applicationAgreements.find(a => a.status === 'signed');
                    if (!signedAgreement) {
                      alert('No signed agreement found');
                      return;
                    }
                    try {
                      await loanDisbursements.initiate({
                        applicationId: selectedApplication.applicationId,
                        agreementId: signedAgreement.agreementId,
                        amount: parseFloat(form.amount.value),
                        mode: form.mode.value,
                        utrNumber: form.utrNumber.value.trim(),
                        beneficiaryType: form.beneficiaryType.value,
                        beneficiaryName: form.beneficiaryName.value.trim(),
                        beneficiaryAccount: form.beneficiaryAccount.value.trim(),
                        beneficiaryIfsc: form.beneficiaryIfsc.value.trim(),
                      });
                      alert('Disbursement initiated');
                      await handleSelectApplication(selectedApplication);
                    } catch (err) {
                      alert('Failed: ' + (err.response?.data?.error || err.message));
                    }
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Amount (₹) *</label>
                        <input name="amount" type="number" required defaultValue={selectedApplication.sanctionedAmount || 0} style={styles.input} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Mode *</label>
                        <select name="mode" required defaultValue="neft" style={styles.input}>
                          <option value="neft">NEFT</option>
                          <option value="rtgs">RTGS</option>
                          <option value="imps">IMPS</option>
                          <option value="upi">UPI</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="cheque">Cheque</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>UTR Number *</label>
                        <input name="utrNumber" required placeholder="min 6 chars" style={styles.input} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Beneficiary Type</label>
                        <select name="beneficiaryType" defaultValue="hospital" style={styles.input}>
                          <option value="hospital">Hospital</option>
                          <option value="patient">Patient</option>
                          <option value="provider">Provider</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Beneficiary Name *</label>
                        <input name="beneficiaryName" required defaultValue={selectedApplication.hospitalName || ''} style={styles.input} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Account Number</label>
                        <input name="beneficiaryAccount" style={styles.input} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>IFSC</label>
                        <input name="beneficiaryIfsc" style={styles.input} />
                      </div>
                    </div>
                    <button type="submit" style={styles.buttonPrimary}>💸 Initiate Disbursement</button>
                  </form>
                </div>
              )}

              {selectedApplication && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Disbursements ({applicationDisbursements.length})
                  </h3>
                  {applicationDisbursements.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem' }}>No disbursements yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {applicationDisbursements.map(disb => (
                        <div key={disb.disbursementId} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: disb.status === 'reconciled' ? '#f0fdf4' : 'white' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div>
                              <strong>₹{(disb.amount || 0).toLocaleString()}</strong>
                              <span style={{ marginLeft: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                · {disb.mode} · UTR: {disb.utrNumber}
                              </span>
                            </div>
                            <span style={styles.statusBadge(disb.status)}>{disb.status}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                            <div><strong>Beneficiary:</strong> {disb.beneficiaryName}</div>
                            <div><strong>Type:</strong> {disb.beneficiaryType}</div>
                            <div><strong>Initiated:</strong> {disb.initiatedAt ? new Date(disb.initiatedAt).toLocaleDateString() : 'N/A'}</div>
                            <div><strong>Confirmed:</strong> {disb.confirmedAt ? new Date(disb.confirmedAt).toLocaleDateString() : 'Pending'}</div>
                          </div>
                          {disb.status === 'initiated' && (
                            <button onClick={async () => {
                              const bankRef = window.prompt('Bank reference (optional)?') || '';
                              try {
                                const res = await loanDisbursements.confirm(disb.disbursementId, { bankReference: bankRef });
                                alert(`Confirmed. Commission: ₹${res.data.commission?.commissionAmount || 0}`);
                                await handleSelectApplication(selectedApplication);
                              } catch (err) {
                                alert('Failed: ' + (err.response?.data?.error || err.message));
                              }
                            }} style={styles.buttonPrimary}>Confirm Money Sent</button>
                          )}
                          {disb.status === 'confirmed' && (
                            <button onClick={async () => {
                              const url = window.prompt('Bank statement URL (optional)?') || '';
                              try {
                                await loanDisbursements.reconcile(disb.disbursementId, { bankStatementUrl: url });
                                alert('Reconciled');
                                await handleSelectApplication(selectedApplication);
                              } catch (err) {
                                alert('Failed: ' + (err.response?.data?.error || err.message));
                              }
                            }} style={styles.buttonSecondary}>Reconcile</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================
            TAB 6: REPAYMENT
            ============================================ */}
        {activeTab === 'repayment' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>💳 Repayment / Mandates</h2>

              {applications.filter(a => ['disbursed', 'completed'].includes(a.status)).length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                  No disbursed loans yet. Confirm disbursements first.
                </p>
              ) : (
                <select
                  onChange={(e) => {
                    const app = applications.find(a => a.applicationId === e.target.value);
                    if (app) handleSelectApplication(app);
                  }}
                  style={{ ...styles.input, marginBottom: '1rem' }}
                  defaultValue=""
                >
                  <option value="" disabled>Select application</option>
                  {applications.filter(a => ['disbursed', 'completed'].includes(a.status)).map(app => (
                    <option key={app.applicationId} value={app.applicationId}>
                      {app.applicationId} — {app.patientDetails?.fullName} — ₹{(app.sanctionedAmount || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              )}

              {selectedApplication && (
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={async () => {
                      try {
                        const res = await loanRepayment.getSchedule(selectedApplication.applicationId);
                        setLoanSchedule(res.data);
                      } catch (err) {
                        alert('Failed: ' + (err.response?.data?.error || err.message));
                      }
                    }} style={styles.buttonPrimary}>📊 View EMI Schedule</button>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Mandates ({applicationMandates.length})
                  </h3>
                  {applicationMandates.length === 0 ? (
                    <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderRadius: '8px' }}>
                      <p style={{ color: '#92400e', fontSize: '0.875rem', margin: '0 0 0.75rem' }}>
                        No mandates yet. Create eNACH / UPI Autopay mandate for EMI collection.
                      </p>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target;
                        try {
                          await loanRepayment.createMandate({
                            applicationId: selectedApplication.applicationId,
                            type: form.type.value,
                            accountHolderName: form.accountHolderName.value,
                            accountNumber: form.accountNumber.value,
                            ifsc: form.ifsc.value.toUpperCase(),
                            bankName: form.bankName.value,
                            maxAmount: parseFloat(form.maxAmount.value),
                            frequency: form.frequency.value,
                            startDate: form.startDate.value,
                            endDate: form.endDate.value,
                            provider: 'manual',
                          });
                          alert('Mandate created');
                          await handleSelectApplication(selectedApplication);
                        } catch (err) {
                          alert('Failed: ' + (err.response?.data?.error || err.message));
                        }
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Type *</label>
                            <select name="type" required defaultValue="enach" style={styles.input}>
                              <option value="enach">eNACH</option>
                              <option value="upi_autopay">UPI Autopay</option>
                              <option value="nach_debit">NACH Debit</option>
                              <option value="ecs">ECS</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Frequency</label>
                            <select name="frequency" defaultValue="monthly" style={styles.input}>
                              <option value="monthly">Monthly</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="half_yearly">Half Yearly</option>
                              <option value="yearly">Yearly</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Account Holder *</label>
                            <input name="accountHolderName" required style={styles.input} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Account Number *</label>
                            <input name="accountNumber" required minLength="6" style={styles.input} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>IFSC *</label>
                            <input name="ifsc" required minLength="11" maxLength="11" style={styles.input} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Bank Name</label>
                            <input name="bankName" style={styles.input} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Max Amount (₹) *</label>
                            <input name="maxAmount" type="number" required defaultValue={selectedApplication.emi || 0} style={styles.input} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Start Date *</label>
                            <input name="startDate" type="date" required style={styles.input} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>End Date *</label>
                            <input name="endDate" type="date" required style={styles.input} />
                          </div>
                        </div>
                        <button type="submit" style={styles.buttonPrimary}>Create Mandate</button>
                      </form>
                    </div>
                  )}

                  {applicationMandates.map(mandate => (
                    <div key={mandate.mandateId} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem', backgroundColor: mandate.status === 'active' ? '#f0fdf4' : 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{mandate.type.toUpperCase()}</strong>
                          <span style={{ marginLeft: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                            · {mandate.accountNumber?.slice(-4).padStart(mandate.accountNumber.length, '*')} · ₹{(mandate.maxAmount || 0).toLocaleString()}/mo
                          </span>
                        </div>
                        <span style={styles.statusBadge(mandate.status === 'active' ? 'approved' : 'submitted')}>{mandate.status}</span>
                      </div>
                      {mandate.status === 'pending' && (
                        <button onClick={async () => {
                          const providerId = window.prompt('Provider mandate ID (optional)?') || '';
                          try {
                            await loanRepayment.activateMandate(mandate.mandateId, { providerMandateId: providerId });
                            alert('Mandate activated');
                            await handleSelectApplication(selectedApplication);
                          } catch (err) {
                            alert('Failed: ' + (err.response?.data?.error || err.message));
                          }
                        }} style={{ ...styles.buttonPrimary, marginTop: '0.5rem' }}>Activate</button>
                      )}
                    </div>
                  ))}

                  {loanSchedule && (
                    <div style={{ marginTop: '1rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                        EMI Schedule — {loanSchedule.tenureMonths} months @ {loanSchedule.interestRate}%
                      </h3>
                      <p style={{ marginBottom: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>
                        EMI: ₹{(loanSchedule.emi || 0).toLocaleString()} · Total: ₹{(loanSchedule.totalPayable || 0).toLocaleString()} · Interest: ₹{(loanSchedule.totalInterest || 0).toLocaleString()}
                      </p>
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.th}>#</th>
                              <th style={styles.th}>Due</th>
                              <th style={styles.th}>EMI</th>
                              <th style={styles.th}>Principal</th>
                              <th style={styles.th}>Interest</th>
                              <th style={styles.th}>Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(loanSchedule.schedule || []).map(emi => (
                              <tr key={emi.emiNumber}>
                                <td style={styles.td}>{emi.emiNumber}</td>
                                <td style={styles.td}>{new Date(emi.dueDate).toLocaleDateString()}</td>
                                <td style={styles.td}>₹{(emi.emiAmount || 0).toLocaleString()}</td>
                                <td style={styles.td}>₹{(emi.principal || 0).toLocaleString()}</td>
                                <td style={styles.td}>₹{(emi.interest || 0).toLocaleString()}</td>
                                <td style={styles.td}>₹{(emi.closingBalance || 0).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LenderLoanHub;