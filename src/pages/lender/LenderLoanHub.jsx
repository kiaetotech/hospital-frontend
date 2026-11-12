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
  loanUnderwriting,
  loanCollections,
  loanAnalytics,
  loanWebhooks,
  loanCompliance,
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
  // Underwriting state
  const [underwritingResult, setUnderwritingResult] = useState(null);
  const [underwritingLoading, setUnderwritingLoading] = useState(false);

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

  // Tab: Collections
  const [collectionsPortfolio, setCollectionsPortfolio] = useState(null);
  const [collectionsBucket, setCollectionsBucket] = useState('current');
  const [collectionsLoans, setCollectionsLoans] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  // Tab: Analytics
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);


  // Tab: Webhooks
  const [webhookSubs, setWebhookSubs] = useState([]);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookError, setWebhookError] = useState(null);
  const [newWebhookSecret, setNewWebhookSecret] = useState(null);
  const [webhookForm, setWebhookForm] = useState({
    subscriberName: '',
    endpointUrl: '',
    events: ['loan.approved', 'loan.disbursed'],
  });
  const [showWebhookForm, setShowWebhookForm] = useState(false);

  // Tab: Compliance
  const [aprForm, setAprForm] = useState({ principal: 50000, interestRate: 12, tenureMonths: 12, processingFee: 1000 });
  const [aprResult, setAprResult] = useState(null);
  const [aprLoading, setAprLoading] = useState(false);
  const [kfsApplicationId, setKfsApplicationId] = useState('');
  const [kfsResult, setKfsResult] = useState(null);
  const [kfsLoading, setKfsLoading] = useState(false);
  const [disclosuresApplicationId, setDisclosuresApplicationId] = useState('');
  const [disclosures, setDisclosures] = useState([]);
  const [disclosuresLoading, setDisclosuresLoading] = useState(false);
  const [complianceError, setComplianceError] = useState(null);

  // ============================================
  // AUTH GUARD
  // ============================================
  useEffect(() => {
    if (!lender) {
      navigate('/lender/login');
      return;
    }
  }, [lender, navigate]);


  // Auto-select application from URL param (?applicationId=APP_XXX)
  useEffect(() => {
    if (!lender) return;
    if (applications.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const urlAppId = params.get('applicationId');
    if (urlAppId) {
      const app = applications.find(a => a.applicationId === urlAppId);
      if (app) {
        setActiveTab('applications');
        handleSelectApplication(app);
      }
    }
   }, [lender, applications]);

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


  // Fetch Collections portfolio (called when collections tab opens)
  const fetchCollectionsPortfolio = useCallback(async () => {
    setCollectionsLoading(true);
    try {
      const res = await loanCollections.getPortfolio();
      setCollectionsPortfolio(res.data);
      return res.data;
    } catch (err) {
      setError('Failed to load collections: ' + (err.response?.data?.error || err.message));
      return null;
    } finally {
      setCollectionsLoading(false);
    }
  }, []);

  const fetchCollectionsBucket = useCallback(async (bucket) => {
    setCollectionsLoading(true);
    try {
      const res = await loanCollections.getByBucket(bucket, { limit: 100 });
      setCollectionsLoans(res.data.collections || []);
    } catch (err) {
      setError('Failed to load bucket: ' + (err.response?.data?.error || err.message));
    } finally {
      setCollectionsLoading(false);
    }
  }, []);


  // Fetch Analytics portfolio (called when analytics tab opens)
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const res = await loanAnalytics.getPortfolio();
      if (res.data?.disabled) {
        setAnalyticsError(res.data.message || 'Analytics not enabled on server. Set ANALYTICS_MODE=live.');
        setAnalyticsData(null);
      } else {
        setAnalyticsData(res.data);
        setAnalyticsError(null);
      }
    } catch (err) {
      setAnalyticsError('Failed to load analytics: ' + (err.response?.data?.error || err.message));
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);


  // Fetch Webhook subscriptions (called when webhooks tab opens)
  const fetchWebhooks = useCallback(async () => {
    setWebhookLoading(true);
    setWebhookError(null);
    try {
      const res = await loanWebhooks.list();
      setWebhookSubs(res.data.subscriptions || []);
    } catch (err) {
      setWebhookError('Failed to load webhooks: ' + (err.response?.data?.error || err.message));
    } finally {
      setWebhookLoading(false);
    }
  }, []);

  // Create webhook subscription
  const handleCreateWebhook = async (e) => {
    e.preventDefault();
    setWebhookError(null);
    try {
      const res = await loanWebhooks.create(webhookForm);
      setNewWebhookSecret({
        subscriptionId: res.data.subscriptionId,
        signingSecret: res.data.signingSecret,
      });
      setShowWebhookForm(false);
      setWebhookForm({ subscriberName: '', endpointUrl: '', events: ['loan.approved', 'loan.disbursed'] });
      await fetchWebhooks();
    } catch (err) {
      setWebhookError('Failed to create webhook: ' + (err.response?.data?.error || err.message));
    }
  };

  // Revoke webhook subscription
  const handleRevokeWebhook = async (subscriptionId) => {
    const reason = window.prompt('Reason for revoking this webhook?');
    if (!reason) return;
    try {
      await loanWebhooks.revoke(subscriptionId, reason);
      await fetchWebhooks();
    } catch (err) {
      alert('Failed to revoke: ' + (err.response?.data?.error || err.message));
    }
  };


  // Compliance: Calculate APR
  const handleCalculateApr = async (e) => {
    e.preventDefault();
    setAprLoading(true);
    setComplianceError(null);
    setAprResult(null);
    try {
      const res = await loanCompliance.calculateApr(aprForm);
      if (res.data?.disabled) {
        setComplianceError(res.data.message || 'Compliance not enabled. Set COMPLIANCE_MODE=live.');
      } else {
        setAprResult(res.data.apr || res.data);
      }
    } catch (err) {
      setComplianceError('Failed to calculate APR: ' + (err.response?.data?.error || err.message));
    } finally {
      setAprLoading(false);
    }
  };

  // Compliance: Generate KFS
  const handleGenerateKfs = async (applicationId) => {
    if (!applicationId) { alert('Select an application first'); return; }
    setKfsLoading(true);
    setComplianceError(null);
    setKfsResult(null);
    try {
      const res = await loanCompliance.generateKfs(applicationId);
      if (res.data?.disabled) {
        setComplianceError(res.data.message || 'Compliance not enabled.');
      } else {
        setKfsResult(res.data);
      }
    } catch (err) {
      setComplianceError('Failed to generate KFS: ' + (err.response?.data?.error || err.message));
    } finally {
      setKfsLoading(false);
    }
  };

  // Compliance: Load disclosures
  const handleLoadDisclosures = async (applicationId) => {
    if (!applicationId) return;
    setDisclosuresLoading(true);
    setComplianceError(null);
    setDisclosures([]);
    try {
      const res = await loanCompliance.listDisclosures(applicationId);
      setDisclosures(res.data.disclosures || []);
    } catch (err) {
      setComplianceError('Failed to load disclosures: ' + (err.response?.data?.error || err.message));
    } finally {
      setDisclosuresLoading(false);
    }
  };

  // Compliance: Copy KFS text
  const handleCopyKfs = () => {
    if (!kfsResult?.kfsText) return;
    navigator.clipboard.writeText(kfsResult.kfsText);
    alert('KFS copied to clipboard');
  };

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

  // Clear URL param when switching tabs
  const url = new URL(window.location.href);
  url.searchParams.delete('applicationId');
  window.history.replaceState({}, '', url.toString());

  // Fetch collections data when the collections tab opens (first time only)
  if (tab === 'collections' && !collectionsPortfolio) {
    fetchCollectionsPortfolio().then(() => fetchCollectionsBucket(collectionsBucket));
  }

    // Fetch analytics when the analytics tab opens (first time only)
  if (tab === 'analytics' && !analyticsData && !analyticsError) {
    fetchAnalytics();
  }

  // Fetch webhooks when the webhooks tab opens (first time only)
  if (tab === 'webhooks' && webhookSubs.length === 0 && !webhookError) {
    fetchWebhooks();
  }
};

  const handleSelectApplication = async (application) => {
    setSelectedApplication(application);
    setUnderwritingResult(null);  // reset when switching apps

// Update URL to reflect selected app (so refresh/share works)
  const url = new URL(window.location.href);
  url.searchParams.set('applicationId', application.applicationId);
  window.history.replaceState({}, '', url.toString());
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
  // UNDERWRITING HANDLER
  // ============================================
  const handleRunUnderwriting = async (applicationId) => {
    setUnderwritingLoading(true);
    setUnderwritingResult(null);
    try {
      const res = await loanUnderwriting.run(applicationId);
      setUnderwritingResult(res.data);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.code === 'UNDERWRITING_NOT_CONFIGURED') {
        alert('Underwriting engine not configured on server. Set UNDERWRITING_MODE=live on Render.');
      } else {
        alert('Underwriting failed: ' + (errData?.error || err.message));
      }
    } finally {
      setUnderwritingLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'submitted': '⏳ Submitted',
      'under_review': '🔍 Under Review',
      'document_pending': '📄 Document Pending',
      'offer_issued': '📄 Offer Issued',
      'offer_accepted': '✅ Offer Accepted',
      'agreement_pending': '✍️ Agreement Pending',
      'agreement_signed': '✍️ Agreement Signed',
      'pending_disbursal': '⏳ Pending Disbursal',
      'disbursed': '💰 Disbursed',
      'completed': '✅ Completed',
      'rejected': '❌ Rejected',
      'withdrawn': '↩️ Withdrawn',
      'cancelled': '⏹️ Cancelled',
      'approved': '👍 Approved',
    };
    return labels[status] || status;
  };

  // ============================================
  // STYLES
  // ============================================
  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
    statCard: {
      backgroundColor: 'white',
      padding: '0.75rem 1rem',
      borderRadius: '10px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
    },
    statLabel: {
      fontSize: '0.7rem',
      color: '#64748b',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '0.25rem',
    },
    statValue: {
      fontSize: '1.75rem',
      fontWeight: 800,
      color: '#1e293b',
      lineHeight: 1,
    },
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
      {/* STATS OVERVIEW (merged from LenderDashboard) */}
      <div style={{ padding: '1.5rem 2rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Applications</div>
              <div style={styles.statValue}>{appTotal}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Pending</div>
              <div style={{ ...styles.statValue, color: '#f59e0b' }}>
                {applications.filter(a => ['submitted', 'under_review', 'document_pending'].includes(a.status)).length}
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Approved</div>
              <div style={{ ...styles.statValue, color: '#10b981' }}>
                {applications.filter(a => ['approved', 'offer_issued', 'offer_accepted', 'agreement_pending', 'agreement_signed', 'pending_disbursal'].includes(a.status)).length}
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Disbursed</div>
              <div style={{ ...styles.statValue, color: '#06b6d4' }}>
                {applications.filter(a => ['disbursed', 'completed'].includes(a.status)).length}
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Disbursed</div>
              <div style={styles.statValue}>
                ₹{applications.filter(a => a.status === 'disbursed' || a.status === 'completed').reduce((sum, a) => sum + (a.disbursedAmount || a.sanctionedAmount || 0), 0).toLocaleString()}
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Commission Earned</div>
              <div style={{ ...styles.statValue, color: '#8b5cf6' }}>
                ₹{applications.filter(a => a.status === 'disbursed' || a.status === 'completed').reduce((sum, a) => sum + (a.platformCommission || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.tabsBar}>
         {[
          { id: 'products', label: `📦 Products (${products.length})` },
          { id: 'applications', label: `📋 Applications (${appTotal})` },
          { id: 'offers', label: '📄 Offers' },
          { id: 'agreements', label: '✍️ Agreements' },
          { id: 'disbursements', label: '💸 Disbursements' },
          { id: 'repayment', label: '💳 Repayment' },
          { id: 'collections', label: '📊 Collections' },
          { id: 'analytics', label: '📈 Analytics' },
	  { id: 'webhooks', label: '🔔 Webhooks' },
	  { id: 'compliance', label: '📋 Compliance' },
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <button
                      onClick={() => setSelectedApplication(null)}
                      style={{ ...styles.buttonSecondary, fontSize: '0.8rem', marginBottom: '0.5rem' }}
                    >
                      ← Back to List
                    </button>
                    <h2 style={styles.cardTitle}>
                      Application {selectedApplication.applicationId}
                    </h2>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#475569' }}>
                      Status: <span style={styles.statusBadge(selectedApplication.status)}>
                        {getStatusLabel(selectedApplication.status)}
                      </span>
                      {selectedApplication.submittedAt && (
                        <span style={{ marginLeft: '1rem' }}>
                          · Submitted: {new Date(selectedApplication.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                  <button onClick={() => setSelectedApplication(null)} style={styles.buttonSecondary}>Close</button>
                </div>

                {/* Patient + Loan Details (3-column merged view) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Patient Details</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Name:</strong> {selectedApplication.patientDetails?.fullName || 'N/A'}</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Phone:</strong> {selectedApplication.patientDetails?.phone || 'N/A'}</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Email:</strong> {selectedApplication.patientDetails?.email || 'N/A'}</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>PAN:</strong> {selectedApplication.patientDetails?.pan || 'N/A'}</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Aadhaar:</strong> {selectedApplication.patientDetails?.aadhaar || 'N/A'}</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Address:</strong> {selectedApplication.patientDetails?.address || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Loan Details</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Treatment:</strong> {selectedApplication.treatmentType || 'N/A'}</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Hospital:</strong> {selectedApplication.hospitalName || 'N/A'}</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Estimated:</strong> ₹{(selectedApplication.estimatedAmount || 0).toLocaleString()}</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Sanctioned:</strong> ₹{(selectedApplication.sanctionedAmount || 0).toLocaleString()}</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Tenure:</strong> {selectedApplication.tenure || 0} months</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Collateral:</strong> {selectedApplication.collateral ? 'Yes' : 'None'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Financial</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Interest Rate:</strong> {selectedApplication.interestRate || 0}%</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>EMI:</strong> ₹{(selectedApplication.emi || 0).toLocaleString()}</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Disbursed:</strong> ₹{(selectedApplication.disbursedAmount || 0).toLocaleString()}</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Patient Liability:</strong> ₹{(selectedApplication.patientLiability || 0).toLocaleString()}</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Linked Booking:</strong> {selectedApplication.linkedBookingId || 'N/A'}</div>
                  </div>
                </div>

                {/* Documents Viewer (from LenderApplicationDetail) */}
                {selectedApplication.documents && (
                  <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>📄 Documents</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                      {[
                        { key: 'tentativeEstimate', label: '🏥 Tentative Estimate' },
                        { key: 'panCard', label: '📇 PAN Card' },
                        { key: 'aadhaarCard', label: '🆔 Aadhaar Card' },
                        { key: 'salarySlip', label: '💰 Salary Slip' },
                        { key: 'bankStatement', label: '🏦 Bank Statement' },
                        { key: 'finalBill', label: '📄 Final Bill' },
                      ].map(doc => {
                        const url = selectedApplication.documents?.[doc.key];
                        return (
                          <div key={doc.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                            <span>{doc.label}:</span>
                            {url ? (
                              <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
                                ✅ View Document ↗
                              </a>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>❌ Not Uploaded</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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

                {/* UNDERWRITING ENGINE SECTION */}
                <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>🔍 Underwriting Engine</h4>
                    <button
                      onClick={() => handleRunUnderwriting(selectedApplication.applicationId)}
                      disabled={underwritingLoading}
                      style={{ ...styles.buttonPrimary, padding: '0.5rem 1rem', fontSize: '0.85rem', opacity: underwritingLoading ? 0.6 : 1, cursor: underwritingLoading ? 'not-allowed' : 'pointer' }}
                    >
                      {underwritingLoading ? 'Evaluating...' : 'Run Underwriting'}
                    </button>
                  </div>

                  {underwritingResult && (
                    <div>
                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          marginBottom: '0.75rem',
                          backgroundColor:
                            underwritingResult.decision === 'approve' ? '#d1fae5'
                            : underwritingResult.decision === 'reject' ? '#fee2e2'
                            : '#fef3c7',
                          color:
                            underwritingResult.decision === 'approve' ? '#065f46'
                            : underwritingResult.decision === 'reject' ? '#991b1b'
                            : '#92400e',
                        }}
                      >
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
                          {underwritingResult.decision === 'approve' ? '✅ APPROVED'
                           : underwritingResult.decision === 'reject' ? '❌ REJECTED'
                           : '⚠️ MANUAL REVIEW'}
                        </div>
                        <div style={{ fontSize: '0.8rem' }}>
                          Max eligible: ₹{(underwritingResult.maxEligibleAmount || 0).toLocaleString()}
                          {underwritingResult.decisionId && ` · ${underwritingResult.decisionId}`}
                        </div>
                      </div>

                      {underwritingResult.reasons && underwritingResult.reasons.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                            Reasons:
                          </div>
                          {underwritingResult.reasons.map((r, i) => (
                            <div
                              key={i}
                              style={{
                                padding: '0.4rem 0.75rem',
                                marginBottom: '0.35rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                backgroundColor:
                                  r.severity === 'block' ? '#fee2e2'
                                  : r.severity === 'warn' ? '#fef3c7'
                                  : '#dbeafe',
                                borderLeft: `3px solid ${
                                  r.severity === 'block' ? '#dc2626'
                                  : r.severity === 'warn' ? '#f59e0b'
                                  : '#3b82f6'
                                }`,
                              }}
                            >
                              <strong>{r.rule}:</strong> {r.message}
                            </div>
                          ))}
                        </div>
                      )}

                      {underwritingResult.decision === 'reject' && (
                        <div style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600, marginTop: '0.5rem' }}>
                          ⚠️ Offer issuance will be blocked by the underwriting gate
                        </div>
                      )}
                    </div>
                  )}

                  {!underwritingResult && !underwritingLoading && (
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                      Run the underwriting engine to evaluate against credit bureau, KYC, and rule-based criteria.
                    </p>
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
              <h2 style={styles.cardTitle}>Repayment / Mandates</h2>

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
                      {app.applicationId} - {app.patientDetails?.fullName} - Rs.{(app.sanctionedAmount || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              )}

              {selectedApplication && (
                <div>
                  <button
                    onClick={async () => {
                      try {
                        const res = await loanRepayment.getSchedule(selectedApplication.applicationId);
                        setLoanSchedule(res.data);
                      } catch (err) {
                        alert('Failed: ' + (err.response?.data?.error || err.message));
                      }
                    }}
                    style={{ ...styles.buttonPrimary, marginBottom: '1rem' }}
                  >
                    View EMI Schedule
                  </button>

                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Mandates ({applicationMandates.length})
                  </h3>

                  {applicationMandates.length === 0 ? (
                    <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      <p style={{ color: '#92400e', fontSize: '0.875rem', margin: '0 0 0.75rem' }}>
                        No mandates yet. Create eNACH / UPI Autopay mandate for EMI collection.
                      </p>
                      <form
                        onSubmit={async (e) => {
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
                        }}
                      >
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
                            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Max Amount (Rs.) *</label>
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
                  ) : (
                    <div>
                      {applicationMandates.map(mandate => (
                        <div key={mandate.mandateId} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem', backgroundColor: mandate.status === 'active' ? '#f0fdf4' : 'white' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong>{mandate.type ? mandate.type.toUpperCase() : 'MANDATE'}</strong>
                              <span style={{ marginLeft: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                ending {(mandate.accountNumber || '****').slice(-4)} - Rs.{(mandate.maxAmount || 0).toLocaleString()}/mo
                              </span>
                            </div>
                            <span style={styles.statusBadge(mandate.status === 'active' ? 'approved' : 'submitted')}>{mandate.status}</span>
                          </div>
                          {mandate.status === 'pending' && (
                            <button
                              onClick={async () => {
                                const providerId = window.prompt('Provider mandate ID (optional)?') || '';
                                try {
                                  await loanRepayment.activateMandate(mandate.mandateId, { providerMandateId: providerId });
                                  alert('Mandate activated');
                                  await handleSelectApplication(selectedApplication);
                                } catch (err) {
                                  alert('Failed: ' + (err.response?.data?.error || err.message));
                                }
                              }}
                              style={{ ...styles.buttonPrimary, marginTop: '0.5rem' }}
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {loanSchedule && (
                    <div style={{ marginTop: '1rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                        EMI Schedule - {loanSchedule.tenureMonths} months at {loanSchedule.interestRate}%
                      </h3>
                      <p style={{ marginBottom: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>
                        EMI: Rs.{(loanSchedule.emi || 0).toLocaleString()} - Total: Rs.{(loanSchedule.totalPayable || 0).toLocaleString()}
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
                                <td style={styles.td}>Rs.{(emi.emiAmount || 0).toLocaleString()}</td>
                                <td style={styles.td}>Rs.{(emi.principal || 0).toLocaleString()}</td>
                                <td style={styles.td}>Rs.{(emi.interest || 0).toLocaleString()}</td>
                                <td style={styles.td}>Rs.{(emi.closingBalance || 0).toLocaleString()}</td>
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

        {/* ============================================
            TAB 7: COLLECTIONS
            ============================================ */}
        {activeTab === 'collections' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📊 Collections Portfolio</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Loans grouped by days past due (DPD). Click a bucket to see individual loans.
              </p>

              {collectionsLoading && !collectionsPortfolio && (
                <p style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>Loading portfolio…</p>
              )}

              {collectionsPortfolio && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {['current', '30_plus', '60_plus', '90_plus', 'npa'].map(bucket => {
                      const bucketData = collectionsPortfolio.byBucket?.[bucket] || {};
                      const isActive = collectionsBucket === bucket;
                      const labelMap = {
                        current: 'CURRENT',
                        '30_plus': '30+ DPD',
                        '60_plus': '60+ DPD',
                        '90_plus': '90+ DPD',
                        npa: 'NPA',
                      };
                      return (
                        <div
                          key={bucket}
                          onClick={() => {
                            setCollectionsBucket(bucket);
                            fetchCollectionsBucket(bucket);
                          }}
                          style={{
                            padding: '1rem',
                            borderRadius: '10px',
                            border: isActive ? '2px solid #059669' : '1px solid #e2e8f0',
                            cursor: 'pointer',
                            backgroundColor: isActive ? '#ecfdf5' : 'white',
                          }}
                        >
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
                            {labelMap[bucket]}
                          </div>
                          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', lineHeight: 1, marginTop: '0.25rem' }}>
                            {bucketData.count || 0}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem' }}>
                            ₹{((bucketData.totalOverdue || 0) / 1000).toFixed(1)}K overdue
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                      Loans in {collectionsBucket.replace('_plus', '+ DPD').replace('_', ' ').toUpperCase()}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {collectionsLoans.length} loan{collectionsLoans.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {collectionsLoans.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>
                      No loans in this bucket.
                    </p>
                  ) : (
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Application ID</th>
                          <th style={styles.th}>DPD</th>
                          <th style={styles.th}>Overdue (₹)</th>
                          <th style={styles.th}>Bucket</th>
                          <th style={styles.th}>Status</th>
                          <th style={styles.th}>Pending Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {collectionsLoans.map(loan => (
                          <tr key={loan.collectionId || loan.applicationId}>
                            <td style={styles.td}><code>{loan.applicationId}</code></td>
                            <td style={styles.td}>{loan.dpd || 0}</td>
                            <td style={styles.td}>₹{(loan.totalOverdue || 0).toLocaleString()}</td>
                            <td style={styles.td}>{loan.bucket}</td>
                            <td style={styles.td}><span style={styles.statusBadge(loan.status)}>{loan.status}</span></td>
                            <td style={styles.td}>
                              {(loan.pendingActions || []).length > 0 ? (
                                <span style={{ fontSize: '0.8rem', color: '#92400e' }}>
                                  {loan.pendingActions.length} pending
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}

                  {!collectionsPortfolio && !collectionsLoading && (
                <button
                  onClick={() => fetchCollectionsPortfolio().then(() => fetchCollectionsBucket(collectionsBucket))}
                  style={styles.buttonPrimary}
                >
                  Load Collections
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============================================
            TAB 8: ANALYTICS
            ============================================ */}
        {activeTab === 'analytics' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📈 Portfolio Analytics</h2>

              {analyticsLoading && (
                <p style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>Loading analytics…</p>
              )}

              {analyticsError && (
                <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', color: '#92400e', fontSize: '0.9rem' }}>
                  ⚠️ {analyticsError}
                </div>
              )}

              {analyticsData && !analyticsError && (
                <>
                  {/* Portfolio Overview */}
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>Portfolio Overview</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={styles.statCard}>
                      <div style={styles.statLabel}>Total Applications</div>
                      <div style={styles.statValue}>{analyticsData.portfolio?.totalApplications || 0}</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statLabel}>Total Disbursed</div>
                      <div style={styles.statValue}>₹{(analyticsData.portfolio?.totalDisbursed || 0).toLocaleString()}</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statLabel}>Disbursed Count</div>
                      <div style={styles.statValue}>{analyticsData.portfolio?.disbursedCount || 0}</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statLabel}>Avg Loan Size</div>
                      <div style={styles.statValue}>₹{(analyticsData.portfolio?.avgLoanSize || 0).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* PAR Metrics */}
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>Portfolio at Risk (PAR)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {[
                      { key: 'par30', label: 'PAR 30', healthy: analyticsData.par?.interpretation?.par30_healthy, threshold: '<5%' },
                      { key: 'par60', label: 'PAR 60', healthy: analyticsData.par?.interpretation?.par60_healthy, threshold: '<3%' },
                      { key: 'par90', label: 'PAR 90', healthy: analyticsData.par?.interpretation?.par90_healthy, threshold: '<1%' },
                    ].map(({ key, label, healthy, threshold }) => (
                      <div
                        key={key}
                        style={{
                          ...styles.statCard,
                          borderLeft: `4px solid ${healthy ? '#10b981' : '#ef4444'}`,
                        }}
                      >
                        <div style={styles.statLabel}>{label} ({threshold})</div>
                        <div style={{ ...styles.statValue, color: healthy ? '#059669' : '#dc2626' }}>
                          {analyticsData.par?.[key] || 0}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                          {healthy ? '✅ Healthy' : '⚠️ Above threshold'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Collection Efficiency */}
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>Collection Efficiency</h3>
                  <div style={{ ...styles.statCard, marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={styles.statLabel}>Collection Efficiency</div>
                        <div style={styles.statValue}>{analyticsData.collectionEfficiency?.cePercent || 0}%</div>
                      </div>
                      <div>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.4rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            backgroundColor:
                              analyticsData.collectionEfficiency?.status === 'excellent' ? '#d1fae5'
                              : analyticsData.collectionEfficiency?.status === 'good' ? '#dbeafe'
                              : analyticsData.collectionEfficiency?.status === 'fair' ? '#fef3c7'
                              : '#fee2e2',
                            color:
                              analyticsData.collectionEfficiency?.status === 'excellent' ? '#065f46'
                              : analyticsData.collectionEfficiency?.status === 'good' ? '#1e40af'
                              : analyticsData.collectionEfficiency?.status === 'fair' ? '#92400e'
                              : '#991b1b',
                          }}
                        >
                          {analyticsData.collectionEfficiency?.status || 'n/a'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bucket Distribution */}
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>Bucket Distribution</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {['current', '30_plus', '60_plus', '90_plus', 'npa'].map(bucket => {
                      const b = analyticsData.buckets?.[bucket] || { count: 0, amount: 0 };
                      const labelMap = { current: 'CURRENT', '30_plus': '30+', '60_plus': '60+', '90_plus': '90+', npa: 'NPA' };
                      return (
                        <div key={bucket} style={{ ...styles.statCard, textAlign: 'center' }}>
                          <div style={styles.statLabel}>{labelMap[bucket]}</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{b.count}</div>
                          <div style={{ fontSize: '0.7rem', color: '#059669' }}>₹{((b.amount || 0) / 1000).toFixed(1)}K</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Approval + Underwriting Funnels */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={styles.card}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Approval Funnel</h4>
                      <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.8 }}>
                        <div>Submitted: <strong>{analyticsData.approvalFunnel?.submitted || 0}</strong></div>
                        <div>Approved: <strong style={{ color: '#059669' }}>{analyticsData.approvalFunnel?.approved || 0}</strong></div>
                        <div>Rejected: <strong style={{ color: '#dc2626' }}>{analyticsData.approvalFunnel?.rejected || 0}</strong></div>
                        <div>Approval Rate: <strong>{analyticsData.approvalFunnel?.approvalRate || 0}%</strong></div>
                      </div>
                    </div>
                    <div style={styles.card}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Underwriting Funnel</h4>
                      <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.8 }}>
                        <div>Total Decisions: <strong>{analyticsData.underwritingFunnel?.total || 0}</strong></div>
                        <div>Approve: <strong style={{ color: '#059669' }}>{analyticsData.underwritingFunnel?.approve || 0}</strong></div>
                        <div>Manual Review: <strong style={{ color: '#f59e0b' }}>{analyticsData.underwritingFunnel?.manual_review || 0}</strong></div>
                        <div>Reject: <strong style={{ color: '#dc2626' }}>{analyticsData.underwritingFunnel?.reject || 0}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Vintage Analysis */}
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>Vintage Analysis</h3>
                  {(analyticsData.vintage || []).length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem', textAlign: 'center' }}>No vintage data yet.</p>
                  ) : (
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Cohort Month</th>
                          <th style={styles.th}>Disbursed</th>
                          <th style={styles.th}>Overdue</th>
                          <th style={styles.th}>Overdue Rate</th>
                          <th style={styles.th}>NPA Count</th>
                          <th style={styles.th}>NPA Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.vintage.map(v => (
                          <tr key={v.month}>
                            <td style={styles.td}><strong>{v.month}</strong></td>
                            <td style={styles.td}>{v.disbursedCount}</td>
                            <td style={styles.td}>{v.overdueCount}</td>
                            <td style={styles.td}>{v.overdueRate}%</td>
                            <td style={styles.td}>{v.npaCount}</td>
                            <td style={styles.td}>{v.npaRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* Monthly Disbursements */}
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.5rem 0 0.75rem', color: '#1e293b' }}>Monthly Disbursements</h3>
                  {(analyticsData.monthlyDisbursements || []).length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem', textAlign: 'center' }}>No disbursement data yet.</p>
                  ) : (
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Month</th>
                          <th style={styles.th}>Count</th>
                          <th style={styles.th}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.monthlyDisbursements.map(m => (
                          <tr key={m.month}>
                            <td style={styles.td}><strong>{m.month}</strong></td>
                            <td style={styles.td}>{m.count}</td>
                            <td style={styles.td}>₹{(m.amount || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right' }}>
                    Generated: {analyticsData.generatedAt ? new Date(analyticsData.generatedAt).toLocaleString() : 'N/A'}
                  </div>
                </>
              )}

                            {!analyticsData && !analyticsLoading && !analyticsError && (
                <button onClick={fetchAnalytics} style={styles.buttonPrimary}>
                  Load Analytics
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============================================
            TAB 9: WEBHOOKS
            ============================================ */}
        {activeTab === 'webhooks' && (
          <div>
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={styles.cardTitle}>🔔 Webhook Subscriptions</h2>
                <button
                  onClick={() => { setShowWebhookForm(true); setNewWebhookSecret(null); }}
                  style={styles.buttonPrimary}
                >
                  + New Webhook Subscription
                </button>
              </div>

              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Subscribe to real-time loan events. We send signed POST requests to your HTTPS endpoint with an X-Kiaeto-Signature header.
              </p>

              {webhookLoading && (
                <p style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>Loading subscriptions…</p>
              )}

              {webhookError && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  ⚠️ {webhookError}
                </div>
              )}

              {newWebhookSecret && (
                <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <p style={{ fontWeight: 700, color: '#92400e', margin: '0 0 0.5rem' }}>
                    ⚠️ Save this signing secret now — it will not be shown again.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <code style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', flex: 1, wordBreak: 'break-all' }}>
                      {newWebhookSecret.signingSecret}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(newWebhookSecret.signingSecret);
                        alert('Signing secret copied to clipboard');
                      }}
                      style={styles.buttonPrimary}
                    >
                      Copy
                    </button>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#92400e', margin: '0.5rem 0 0' }}>
                    Subscription ID: {newWebhookSecret.subscriptionId}
                  </p>
                  <button
                    onClick={() => setNewWebhookSecret(null)}
                    style={{ ...styles.buttonSecondary, marginTop: '0.75rem' }}
                  >
                    I've saved it — dismiss
                  </button>
                </div>
              )}

              {showWebhookForm && (
                <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>New Subscription</h3>
                  <form onSubmit={handleCreateWebhook}>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                        Subscriber Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={webhookForm.subscriberName}
                        onChange={(e) => setWebhookForm({ ...webhookForm, subscriberName: e.target.value })}
                        placeholder="Hospital CRM"
                        style={styles.input}
                      />
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                        Endpoint URL (HTTPS only) *
                      </label>
                      <input
                        type="url"
                        required
                        value={webhookForm.endpointUrl}
                        onChange={(e) => setWebhookForm({ ...webhookForm, endpointUrl: e.target.value })}
                        placeholder="https://hospital.example.com/webhooks/loan"
                        style={styles.input}
                      />
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                        Events to receive
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.85rem' }}>
                        {[
                          'loan.approved',
                          'loan.disbursed',
                          'loan.rejected',
                          'loan.completed',
                          'loan.overdue_30',
                          'loan.overdue_60',
                          'loan.overdue_90',
                          'loan.npa',
                        ].map((event) => (
                          <label key={event} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={webhookForm.events.includes(event)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...webhookForm.events, event]
                                  : webhookForm.events.filter((x) => x !== event);
                                setWebhookForm({ ...webhookForm, events: updated });
                              }}
                            />
                            <span>{event}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" style={styles.buttonPrimary}>Create Subscription</button>
                      <button
                        type="button"
                        onClick={() => setShowWebhookForm(false)}
                        style={styles.buttonSecondary}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {!webhookLoading && webhookSubs.length === 0 && !showWebhookForm && !newWebhookSecret && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No webhook subscriptions yet.</p>
                  <p style={{ fontSize: '0.85rem' }}>Create one to receive real-time loan events.</p>
                </div>
              )}

              {webhookSubs.length > 0 && (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Endpoint</th>
                      <th style={styles.th}>Events</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Deliveries</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhookSubs.map((sub) => (
                      <tr key={sub.subscriptionId}>
                        <td style={styles.td}><strong>{sub.subscriberName}</strong></td>
                        <td style={styles.td}><code style={{ fontSize: '0.75rem' }}>{sub.endpointUrl}</code></td>
                        <td style={styles.td}>{(sub.events || []).length} events</td>
                        <td style={styles.td}>
                          <span style={styles.statusBadge(sub.status === 'active' ? 'approved' : 'cancelled')}>
                            {sub.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {sub.successfulDeliveries || 0} / {sub.totalDeliveries || 0}
                        </td>
                         <td style={styles.td}>
                          {sub.status === 'active' && (
                            <button
                              onClick={() => handleRevokeWebhook(sub.subscriptionId)}
                              style={styles.buttonDanger}
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ============================================
            TAB 10: COMPLIANCE (KFS + APR)
            ============================================ */}
        {activeTab === 'compliance' && (
          <div>
            {complianceError && (
              <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', color: '#92400e', fontSize: '0.9rem' }}>
                ⚠️ {complianceError}
              </div>
            )}

            {/* SECTION 1: APR Calculator */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📊 APR Calculator</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                RBI requires lenders to disclose the all-inclusive APR — not just nominal interest rate.
              </p>

              <form onSubmit={handleCalculateApr}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Principal (₹)</label>
                    <input
                      type="number"
                      value={aprForm.principal}
                      onChange={(e) => setAprForm({ ...aprForm, principal: parseFloat(e.target.value) || 0 })}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={aprForm.interestRate}
                      onChange={(e) => setAprForm({ ...aprForm, interestRate: parseFloat(e.target.value) || 0 })}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Tenure (months)</label>
                    <input
                      type="number"
                      value={aprForm.tenureMonths}
                      onChange={(e) => setAprForm({ ...aprForm, tenureMonths: parseInt(e.target.value) || 0 })}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Processing Fee (₹)</label>
                    <input
                      type="number"
                      value={aprForm.processingFee}
                      onChange={(e) => setAprForm({ ...aprForm, processingFee: parseFloat(e.target.value) || 0 })}
                      style={styles.input}
                    />
                  </div>
                </div>
                <button type="submit" disabled={aprLoading} style={styles.buttonPrimary}>
                  {aprLoading ? 'Calculating…' : 'Calculate APR'}
                </button>
              </form>

              {aprResult && (
                <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #10b981' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Nominal Rate</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>{aprResult.interestRate}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Effective APR</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>{aprResult.aprPercent}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Interest</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>₹{(aprResult.totalInterest || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Payable</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>₹{(aprResult.totalPayable || 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: KFS Generator */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📄 Key Fact Statement (KFS)</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                RBI-mandated disclosure that must be shown before loan signing. Includes all fees, APR, cooling-off period, and grievance details.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Application</label>
                  <select
                    value={kfsApplicationId}
                    onChange={(e) => setKfsApplicationId(e.target.value)}
                    style={styles.input}
                  >
                    <option value="">Select an application</option>
                    {applications.map(app => (
                      <option key={app.applicationId} value={app.applicationId}>
                        {app.applicationId} — {app.patientDetails?.fullName} — {app.status}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => handleGenerateKfs(kfsApplicationId)}
                  disabled={kfsLoading || !kfsApplicationId}
                  style={{ ...styles.buttonPrimary, opacity: (kfsLoading || !kfsApplicationId) ? 0.6 : 1 }}
                >
                  {kfsLoading ? 'Generating…' : 'Generate KFS'}
                </button>
              </div>

              {kfsResult && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Disclosure ID: <code>{kfsResult.disclosureId || 'n/a'}</code>
                      {kfsResult.kfs?.aprPercent != null && (
                        <span style={{ marginLeft: '1rem', color: '#dc2626', fontWeight: 700 }}>
                          APR: {kfsResult.kfs.aprPercent}%
                        </span>
                      )}
                    </div>
                    <button onClick={handleCopyKfs} style={styles.buttonSecondary}>Copy</button>
                  </div>
                  <pre style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem', lineHeight: 1.5, maxHeight: '400px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                    {kfsResult.kfsText || 'No KFS text generated'}
                  </pre>
                </div>
              )}
            </div>

            {/* SECTION 3: Disclosures History */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📚 Disclosure History</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Audit trail of all KFS/APR/consent disclosures generated for each application.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Application</label>
                  <select
                    value={disclosuresApplicationId}
                    onChange={(e) => {
                      setDisclosuresApplicationId(e.target.value);
                      handleLoadDisclosures(e.target.value);
                    }}
                    style={styles.input}
                  >
                    <option value="">Select an application</option>
                    {applications.map(app => (
                      <option key={app.applicationId} value={app.applicationId}>
                        {app.applicationId} — {app.patientDetails?.fullName} — {app.status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {disclosuresLoading && (
                <p style={{ color: '#64748b', padding: '1rem', textAlign: 'center' }}>Loading disclosures…</p>
              )}

              {!disclosuresLoading && disclosuresApplicationId && disclosures.length === 0 && (
                <p style={{ color: '#64748b', padding: '1rem', textAlign: 'center' }}>No disclosures generated for this application yet.</p>
              )}

              {disclosures.length > 0 && (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Disclosure ID</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Version</th>
                      <th style={styles.th}>Generated</th>
                      <th style={styles.th}>Accepted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disclosures.map(d => (
                      <tr key={d.disclosureId}>
                        <td style={styles.td}><code>{d.disclosureId}</code></td>
                        <td style={styles.td}>{d.disclosureType}</td>
                        <td style={styles.td}>{d.version}</td>
                        <td style={styles.td}>{d.generatedAt ? new Date(d.generatedAt).toLocaleDateString() : 'N/A'}</td>
                        <td style={styles.td}>
                          {d.accepted ? '✅ Accepted' : '❌ Not accepted'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LenderLoanHub;
