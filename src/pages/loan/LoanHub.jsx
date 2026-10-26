// D:\hospital-frontend\src\pages\loan\LoanHub.jsx
// ============================================
// PATIENT LOAN HUB — Task 18 Part 1
// ============================================
// Tabbed interface: Apply, My Applications, Offers, Agreements, My Loans, Refunds
// Uses loan v2 API endpoints + existing patient data

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  loanProducts,
  loanOffers,
  loanAgreements,
  loanDisbursements,
  loanRepayment,
  loanRefunds,
} from '../../services/lenderApi';
import { patientOffers, patientAgreements } from '../../services/loanApi';
import api from '../../services/api';

// ============================================
// MAIN COMPONENT
// ============================================
const LoanHub = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('apply');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab: Apply
  const [availableLenders, setAvailableLenders] = useState([]);
  const [selectedLender, setSelectedLender] = useState(null);
  const [lenderProducts, setLenderProducts] = useState([]);

  // Tab: My Applications
  const [myApplications, setMyApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Tab: Offers
  const [applicationOffers, setApplicationOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);

  // Tab: Agreements
  const [applicationAgreements, setApplicationAgreements] = useState([]);

  // Tab: My Loans
  const [loanSchedule, setLoanSchedule] = useState(null);

  // Tab: Refunds
  const [applicationRefunds, setApplicationRefunds] = useState([]);

  // ============================================
  // FETCHERS
  // ============================================
  const fetchMyApplications = useCallback(async () => {
    try {
      const res = await api.get('/loan/patient/applications');
      setMyApplications(res.data.applications || []);
    } catch (err) {
      setError('Failed to load applications: ' + (err.response?.data?.error || err.message));
    }
  }, []);

  const fetchAvailableLenders = useCallback(async () => {
    try {
      const res = await api.get('/loan/patient/partners');
      setAvailableLenders(res.data.lenders || res.data.data || []);
    } catch (err) {
      setError('Failed to load lenders: ' + (err.response?.data?.error || err.message));
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchMyApplications(), fetchAvailableLenders()]);
      setLoading(false);
    })();
  }, [fetchMyApplications, fetchAvailableLenders]);

  // ============================================
  // TAB HANDLERS
  // ============================================
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSelectedApplication(null);
    setSelectedOffer(null);
  };

    const handleSelectLender = async (lender) => {
    setSelectedLender(lender);
    try {
      // Fetch active v2 products for this lender (public endpoint, no auth required)
      const res = await api.get('/loan/v2/products/public', {
        params: { lenderId: lender.lenderId || lender._id },
      });
      const v2Products = res.data?.products || [];
      if (v2Products.length > 0) {
        setLenderProducts(v2Products);
      } else {
        // Fallback: legacy embedded products from Lender model
        setLenderProducts(lender.loanProducts || []);
      }
    } catch (err) {
      console.warn('[LoanHub] v2 products fetch failed, falling back to legacy:', err.message);
      setLenderProducts(lender.loanProducts || []);
    }
  };

  const handleSelectApplication = async (application) => {
    setSelectedApplication(application);
    // Preload offers + agreements + refunds for this application
    try {
      const [offersRes, agreementsRes, refundsRes] = await Promise.all([
        loanOffers.listByApplication(application.applicationId).catch(() => ({ data: { offers: [] } })),
        loanAgreements.listByApplication(application.applicationId).catch(() => ({ data: { agreements: [] } })),
        loanRefunds.listByApplication(application.applicationId).catch(() => ({ data: { refunds: [] } })),
      ]);
      setApplicationOffers(offersRes.data.offers || []);
      setApplicationAgreements(agreementsRes.data.agreements || []);
      setApplicationRefunds(refundsRes.data.refunds || []);
    } catch (err) {
      // Silently fail — user can refresh
    }
  };

  // ============================================
  // SUBMIT APPLICATION (Tab: Apply)
  // ============================================
    const submitApplication = async (e) => {
    e.preventDefault();
    setError('');
    const form = e.target;

    // Detect selected product (from v2 fetch or legacy)
    const productIdField = form.querySelector('[name="productId"]');
    const productId = productIdField?.value || '';

    const formData = {
      treatmentType: form.treatmentType.value,
      hospitalName: form.hospitalName.value,
      hospitalAddress: form.hospitalAddress.value,
      estimatedAmount: parseFloat(form.estimatedAmount.value),
      lenderId: form.lenderId.value,
      bookingId: form.bookingId.value,
      tenure: parseInt(form.tenure.value),
      productId: productId || undefined,
      patientLocation: {
        pincode: form.pincode.value,
        city: form.city.value,
        state: form.state.value,
      },
    };

    try {
      const res = await api.post('/loan/patient/applications', formData);
      alert('Application submitted! ID: ' + res.data.applicationId);
      await fetchMyApplications();
      setActiveTab('applications');
    } catch (err) {
      setError(err.response?.data?.error || 'Submit failed: ' + err.message);
    }
  };

  // ============================================
  // STYLES
  // ============================================
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    header: {
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      color: 'white',
      padding: '1.5rem 2rem',
    },
    headerTitle: {
      fontSize: '1.75rem',
      fontWeight: 800,
      margin: 0,
    },
    headerSubtitle: {
      opacity: 0.9,
      fontSize: '0.9rem',
      marginTop: '4px',
    },
    tabsBar: {
      backgroundColor: 'white',
      padding: '0.75rem 2rem',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      gap: '0.4rem',
      flexWrap: 'wrap',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    tabButton: (isActive) => ({
      padding: '0.6rem 1.25rem',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: isActive ? 700 : 500,
      background: isActive ? '#4f46e5' : 'transparent',
      color: isActive ? 'white' : '#475569',
      whiteSpace: 'nowrap',
    }),
    content: {
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: 700,
      marginBottom: '1rem',
      color: '#1e293b',
    },
    input: {
      width: '100%',
      padding: '0.6rem',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '0.9rem',
      marginBottom: '0.75rem',
    },
    buttonPrimary: {
      padding: '0.75rem 1.5rem',
      background: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
    buttonSecondary: {
      padding: '0.5rem 1rem',
      background: '#f1f5f9',
      color: '#475569',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 500,
      cursor: 'pointer',
      fontSize: '0.85rem',
    },
    errorBox: {
      background: '#fee2e2',
      color: '#991b1b',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      fontSize: '0.9rem',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.875rem',
    },
    th: {
      textAlign: 'left',
      padding: '0.75rem',
      borderBottom: '2px solid #e2e8f0',
      color: '#64748b',
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
    },
    td: {
      padding: '0.75rem',
      borderBottom: '1px solid #f1f5f9',
      color: '#475569',
    },
    statusBadge: (status) => {
      const colors = {
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
      return {
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '0.7rem',
        fontWeight: 600,
        background: c.bg,
        color: c.color,
      };
    },
  };

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>💰 Health EMI / Loan</h1>
          <p style={styles.headerSubtitle}>Loading...</p>
        </div>
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Loading your loan hub...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>💰 Health EMI / Loan</h1>
        <p style={styles.headerSubtitle}>
          Apply · Track · Manage your healthcare financing
        </p>
      </div>

      {/* TABS */}
      <div style={styles.tabsBar}>
        {[
          { id: 'apply', label: '🔍 Apply for Loan' },
          { id: 'applications', label: `📋 My Applications (${myApplications.length})` },
          { id: 'offers', label: '📄 Offers' },
          { id: 'agreements', label: '✍️ Agreements' },
          { id: 'loans', label: '💳 My Loans' },
          { id: 'refunds', label: '💸 Refunds' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={styles.tabButton(activeTab === tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={styles.content}>
        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        {/* ============================================
            TAB 1: APPLY
            ============================================ */}
        {activeTab === 'apply' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Step 1 — Select a Lender</h2>
              {availableLenders.length === 0 ? (
                <p style={{ color: '#64748b' }}>No lenders available in your area yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {availableLenders.map(lender => (
                    <div
                      key={lender._id || lender.lenderId}
                      onClick={() => handleSelectLender(lender)}
                      style={{
                        border: selectedLender?._id === lender._id ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '1rem',
                        cursor: 'pointer',
                        backgroundColor: selectedLender?._id === lender._id ? '#eef2ff' : 'white',
                      }}
                    >
                      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#1e293b' }}>
                        {lender.businessName}
                      </h3>
                      <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: '#64748b' }}>
                        {lender.lenderType} · {lender.registeredOffice?.city || 'Pan India'}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>
                        Commission: {lender.commissionRate || 2}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedLender && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Step 2 — Application Details</h2>
                <form onSubmit={submitApplication}>
                  <input type="hidden" name="lenderId" value={selectedLender._id} />
                  {/* Product selection (v2 products fetched on lender select) */}
                  {selectedLender && lenderProducts.length > 0 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                        Loan Product *
                      </label>
                      <select name="productId" required style={styles.input}>
                        <option value="">-- Select Product --</option>
                        {lenderProducts.map((p) => (
                          <option key={p.productId || p._id} value={p.productId || p._id}>
                            {p.productName} — ₹{(p.minAmount || 0).toLocaleString()} to ₹{(p.maxAmount || 0).toLocaleString()} @ {p.interestRate}% for {p.minTenureMonths}-{p.maxTenureMonths} months
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Treatment Type</label>
                      <input name="treatmentType" required placeholder="e.g., surgery, chemotherapy" style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Estimated Amount (₹)</label>
                      <input name="estimatedAmount" type="number" min="1000" required placeholder="50000" style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Hospital Name</label>
                      <input name="hospitalName" required placeholder="Apollo Hospital" style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Hospital Address</label>
                      <input name="hospitalAddress" required placeholder="Full address" style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Booking ID *</label>
                      <input name="bookingId" required placeholder="Your HospitalHub booking reference" style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Tenure (months)</label>
                      <input name="tenure" type="number" min="3" max="60" defaultValue="12" required style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Pincode</label>
                      <input name="pincode" required style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>City</label>
                      <input name="city" required style={styles.input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>State</label>
                      <input name="state" required style={styles.input} />
                    </div>
                  </div>

                  <button type="submit" style={styles.buttonPrimary}>
                    Submit Application
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ============================================
            TAB 2: MY APPLICATIONS
            ============================================ */}
        {activeTab === 'applications' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>My Applications ({myApplications.length})</h2>
              {myApplications.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                  No applications yet. Start one from the Apply tab.
                </p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Application ID</th>
                      <th style={styles.th}>Treatment</th>
                      <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Submitted</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myApplications.map(app => (
                      <tr key={app.applicationId}>
                        <td style={styles.td}><code>{app.applicationId}</code></td>
                        <td style={styles.td}>{app.treatmentType || 'N/A'}</td>
                        <td style={styles.td}>₹{(app.estimatedAmount || 0).toLocaleString()}</td>
                        <td style={styles.td}>
                          <span style={styles.statusBadge(app.status)}>{app.status}</span>
                        </td>
                        <td style={styles.td}>
                          {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => handleSelectApplication(app)}
                            style={styles.buttonSecondary}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {selectedApplication && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>
                  Application {selectedApplication.applicationId}
                  <button onClick={() => setSelectedApplication(null)} style={{ ...styles.buttonSecondary, float: 'right' }}>
                    Close
                  </button>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div><strong>Treatment:</strong> {selectedApplication.treatmentType || 'N/A'}</div>
                  <div><strong>Hospital:</strong> {selectedApplication.hospitalName || 'N/A'}</div>
                  <div><strong>Estimated:</strong> ₹{(selectedApplication.estimatedAmount || 0).toLocaleString()}</div>
                  <div><strong>Sanctioned:</strong> ₹{(selectedApplication.sanctionedAmount || 0).toLocaleString()}</div>
                  <div><strong>Tenure:</strong> {selectedApplication.tenure || 'N/A'} months</div>
                  <div><strong>Interest:</strong> {selectedApplication.interestRate || 'N/A'}%</div>
                  <div><strong>EMI:</strong> ₹{(selectedApplication.emi || 0).toLocaleString()}</div>
                  <div><strong>Status:</strong> <span style={styles.statusBadge(selectedApplication.status)}>{selectedApplication.status}</span></div>
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
              <h2 style={styles.cardTitle}>📄 My Offers</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Select an application to view offers
              </p>
              {myApplications.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                  No applications yet. Start one from the Apply tab.
                </p>
              ) : (
                <div>
                  <select
                    onChange={(e) => {
                      const app = myApplications.find(a => a.applicationId === e.target.value);
                      if (app) handleSelectApplication(app);
                    }}
                    style={{ ...styles.input, marginBottom: '1rem' }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select application</option>
                    {myApplications.map(app => (
                      <option key={app.applicationId} value={app.applicationId}>
                        {app.applicationId} — {app.treatmentType} — ₹{(app.estimatedAmount || 0).toLocaleString()}
                      </option>
                    ))}
                  </select>

                  {selectedApplication && (
                    <div>
                      {applicationOffers.length === 0 ? (
                        <p style={{ color: '#64748b', padding: '1rem' }}>No offers yet for this application.</p>
                      ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                          {applicationOffers.map(offer => (
                            <div
                              key={offer.offerId}
                              style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '1rem',
                                backgroundColor: offer.status === 'issued' ? '#f0f9ff' : 'white',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <div>
                                  <strong style={{ fontSize: '1.1rem' }}>
                                    ₹{(offer.sanctionedAmount || 0).toLocaleString()}
                                  </strong>
                                  <span style={{ marginLeft: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                    @ {offer.interestRate}% × {offer.tenureMonths} months
                                  </span>
                                </div>
                                <span style={styles.statusBadge(offer.status)}>{offer.status}</span>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                                <div><strong>EMI:</strong> ₹{(offer.emi || 0).toLocaleString()}/month</div>
                                <div><strong>Processing Fee:</strong> ₹{(offer.processingFee || 0).toLocaleString()}</div>
                                <div><strong>Version:</strong> v{offer.version || 1}</div>
                                <div><strong>Valid Until:</strong> {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : 'N/A'}</div>
                                <div><strong>Total Payable:</strong> ₹{(offer.totalPayable || 0).toLocaleString()}</div>
                                <div><strong>Issued:</strong> {offer.issuedAt ? new Date(offer.issuedAt).toLocaleDateString() : 'N/A'}</div>
                              </div>
                              {offer.status === 'issued' && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    onClick={async () => {
                                      if (!window.confirm(`Accept offer of ₹${offer.sanctionedAmount.toLocaleString()}?`)) return;
                                      try {
                                        await patientOffers.accept(offer.offerId);
                                        alert('Offer accepted! Next: sign agreement.');
                                        await handleSelectApplication(selectedApplication);
                                      } catch (err) {
                                        alert('Failed: ' + (err.response?.data?.error || err.message));
                                      }
                                    }}
                                    style={{ ...styles.buttonPrimary, padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                  >
                                    ✅ Accept Offer
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const reason = window.prompt('Reason for declining?');
                                      if (!reason) return;
                                      try {
                                        await patientOffers.decline(offer.offerId, { reason });
                                        alert('Offer declined.');
                                        await handleSelectApplication(selectedApplication);
                                      } catch (err) {
                                        alert('Failed: ' + (err.response?.data?.error || err.message));
                                      }
                                    }}
                                    style={{ ...styles.buttonSecondary, background: '#fee2e2', color: '#991b1b' }}
                                  >
                                    ❌ Decline
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
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
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Select an application to view and sign agreements
              </p>
              {myApplications.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                  No applications yet.
                </p>
              ) : (
                <div>
                  <select
                    onChange={(e) => {
                      const app = myApplications.find(a => a.applicationId === e.target.value);
                      if (app) handleSelectApplication(app);
                    }}
                    style={{ ...styles.input, marginBottom: '1rem' }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select application</option>
                    {myApplications.map(app => (
                      <option key={app.applicationId} value={app.applicationId}>
                        {app.applicationId} — {app.status}
                      </option>
                    ))}
                  </select>

                  {selectedApplication && (
                    <div>
                      {applicationAgreements.length === 0 ? (
                        <p style={{ color: '#64748b', padding: '1rem' }}>No agreements yet. Accept an offer first.</p>
                      ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                          {applicationAgreements.map(agreement => (
                            <div
                              key={agreement.agreementId}
                              style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '1rem',
                                backgroundColor: agreement.status === 'signed' ? '#f0fdf4' : 'white',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <div>
                                  <strong style={{ fontSize: '1rem' }}>Agreement {agreement.agreementId}</strong>
                                  <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#64748b' }}>
                                    Offer: {agreement.offerId} · Provider: {agreement.esignProvider}
                                  </p>
                                </div>
                                <span style={styles.statusBadge(agreement.status)}>{agreement.status}</span>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                                <div><strong>Lender Signed:</strong> {agreement.signedByLender ? '✅' : '⏳'}</div>
                                <div><strong>Patient Signed:</strong> {agreement.signedByPatient ? '✅' : '⏳'}</div>
                                <div><strong>Initiated:</strong> {agreement.initiatedAt ? new Date(agreement.initiatedAt).toLocaleDateString() : 'N/A'}</div>
                                <div><strong>Expires:</strong> {agreement.expiresAt ? new Date(agreement.expiresAt).toLocaleDateString() : 'N/A'}</div>
                              </div>
                              {!agreement.signedByPatient && ['pending', 'initiated'].includes(agreement.status) && (
                                <button
                                  onClick={async () => {
                                    const name = window.prompt('Enter your full name to sign:');
                                    if (!name) return;
                                    try {
                                      await patientAgreements.sign(agreement.agreementId, {
                                        signerRole: 'patient',
                                        signatoryName: name,
                                      });
                                      alert('Agreement signed!');
                                      await handleSelectApplication(selectedApplication);
                                    } catch (err) {
                                      alert('Failed: ' + (err.response?.data?.error || err.message));
                                    }
                                  }}
                                  style={{ ...styles.buttonPrimary, padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                >
                                  ✍️ Sign Agreement
                                </button>
                              )}
                              {agreement.status === 'signed' && (
                                <p style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 600, margin: '0.5rem 0 0' }}>
                                  ✅ Fully signed — ready for disbursement
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================
            TAB 5: MY LOANS (EMI Schedule)
            ============================================ */}
        {activeTab === 'loans' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>💳 My Loans</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                View EMI schedule for disbursed loans
              </p>
              {myApplications.filter(a => ['disbursed', 'completed'].includes(a.status)).length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                  No disbursed loans yet.
                </p>
              ) : (
                <div>
                  <select
                    onChange={async (e) => {
                      const app = myApplications.find(a => a.applicationId === e.target.value);
                      if (!app) return;
                      setSelectedApplication(app);
                      try {
                        const res = await loanRepayment.getSchedule(app.applicationId);
                        setLoanSchedule(res.data);
                      } catch (err) {
                        setLoanSchedule(null);
                        alert('Failed to load schedule: ' + (err.response?.data?.error || err.message));
                      }
                    }}
                    style={{ ...styles.input, marginBottom: '1rem' }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a loan</option>
                    {myApplications.filter(a => ['disbursed', 'completed'].includes(a.status)).map(app => (
                      <option key={app.applicationId} value={app.applicationId}>
                        {app.applicationId} — ₹{(app.sanctionedAmount || 0).toLocaleString()}
                      </option>
                    ))}
                  </select>

                  {loanSchedule && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                        <div><strong>Loan Amount:</strong><br />₹{(loanSchedule.sanctionedAmount || 0).toLocaleString()}</div>
                        <div><strong>Interest Rate:</strong><br />{loanSchedule.interestRate}% p.a.</div>
                        <div><strong>Tenure:</strong><br />{loanSchedule.tenureMonths} months</div>
                        <div><strong>Monthly EMI:</strong><br />₹{(loanSchedule.emi || 0).toLocaleString()}</div>
                      </div>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>EMI #</th>
                            <th style={styles.th}>Due Date</th>
                            <th style={styles.th}>EMI Amount</th>
                            <th style={styles.th}>Principal</th>
                            <th style={styles.th}>Interest</th>
                            <th style={styles.th}>Balance</th>
                            <th style={styles.th}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(loanSchedule.schedule || []).map(emi => (
                            <tr key={emi.emiNumber}>
                              <td style={styles.td}>#{emi.emiNumber}</td>
                              <td style={styles.td}>{new Date(emi.dueDate).toLocaleDateString()}</td>
                              <td style={styles.td}>₹{(emi.emiAmount || 0).toLocaleString()}</td>
                              <td style={styles.td}>₹{(emi.principal || 0).toLocaleString()}</td>
                              <td style={styles.td}>₹{(emi.interest || 0).toLocaleString()}</td>
                              <td style={styles.td}>₹{(emi.closingBalance || 0).toLocaleString()}</td>
                              <td style={styles.td}>
                                <span style={styles.statusBadge(emi.status === 'due' ? 'submitted' : 'approved')}>
                                  {emi.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================
            TAB 6: REFUNDS
            ============================================ */}
        {activeTab === 'refunds' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>💸 Refunds</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Request refund for eligible loans
              </p>
              {myApplications.filter(a => ['disbursed', 'pending_disbursal', 'agreement_signed'].includes(a.status)).length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                  No eligible loans for refund.
                </p>
              ) : (
                <div>
                  <select
                    onChange={(e) => {
                      const app = myApplications.find(a => a.applicationId === e.target.value);
                      if (app) handleSelectApplication(app);
                    }}
                    style={{ ...styles.input, marginBottom: '1rem' }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select application</option>
                    {myApplications.filter(a => ['disbursed', 'pending_disbursal', 'agreement_signed'].includes(a.status)).map(app => (
                      <option key={app.applicationId} value={app.applicationId}>
                        {app.applicationId} — ₹{(app.sanctionedAmount || 0).toLocaleString()}
                      </option>
                    ))}
                  </select>

                  {selectedApplication && applicationRefunds.length === 0 && (
                    <div style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      <p style={{ margin: '0 0 0.75rem', color: '#92400e', fontSize: '0.875rem' }}>
                        ⚠️ To request a refund, please contact support with your application ID. Refund requests are reviewed by the lender.
                      </p>
                      <button
                        onClick={() => alert('Contact support at support@hospitalhub.in with your application ID')}
                        style={styles.buttonPrimary}
                      >
                        📧 Contact Support
                      </button>
                    </div>
                  )}

                  {selectedApplication && applicationRefunds.length > 0 && (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {applicationRefunds.map(refund => (
                        <div
                          key={refund.transactionId}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '1rem',
                            backgroundColor: refund.status === 'refunded' ? '#f0fdf4' : 'white',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div>
                              <strong>Refund {refund.transactionId}</strong>
                              <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#64748b' }}>
                                {refund.refund?.reason || 'N/A'}
                              </p>
                            </div>
                            <span style={styles.statusBadge(refund.status)}>{refund.status}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                            <div><strong>Amount:</strong> ₹{(refund.amount || 0).toLocaleString()}</div>
                            <div><strong>Type:</strong> {refund.refund?.refundType || 'N/A'}</div>
                            <div><strong>Initiated:</strong> {refund.refund?.initiatedAt ? new Date(refund.refund.initiatedAt).toLocaleDateString() : 'N/A'}</div>
                            <div><strong>Processed:</strong> {refund.refundedAt ? new Date(refund.refundedAt).toLocaleDateString() : 'Pending'}</div>
                          </div>
                        </div>
                      ))}
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

export default LoanHub;