import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLender } from '../../contexts/LenderContext';
import { lenderApplications } from '../../services/lenderApi';

const LenderApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lender } = useLender();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionData, setActionData] = useState({});

  useEffect(() => {
    if (!lender) {
      navigate('/lender/login');
      return;
    }
    fetchApplication();
  }, [lender, navigate, id]);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const response = await lenderApplications.getById(id);
      setApplication(response.data);
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (actionType === 'approve') {
        await lenderApplications.updateStatus(id, {
          status: 'approved',
          sanctionedAmount: actionData.amount || application.estimatedAmount,
          tenure: actionData.tenure || 12,
          interestRate: actionData.rate || 10,
          note: actionData.note || 'Approved by lender'
        });
        alert('✅ Loan approved successfully!');
      } else if (actionType === 'reject') {
        await lenderApplications.updateStatus(id, {
          status: 'rejected',
          note: actionData.note || 'Rejected by lender'
        });
        alert('❌ Loan rejected.');
      } else if (actionType === 'document') {
        await lenderApplications.requestDocument(id, {
          documentType: actionData.documentType,
          description: actionData.description
        });
        alert('📄 Document request sent to patient.');
      } else if (actionType === 'disburse') {
        await lenderApplications.disburse(id, {
          transactionId: actionData.transactionId || 'TXN' + Date.now(),
          utrNumber: actionData.utrNumber || 'UTR' + Date.now()
        });
        alert('💰 Loan disbursed successfully!');
      }
      setShowActionModal(false);
      fetchApplication();
    } catch (error) {
      alert('Action failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (type, defaultData = {}) => {
    setActionType(type);
    setActionData(defaultData);
    setShowActionModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'submitted': '#f59e0b',
      'under_review': '#8b5cf6',
      'approved': '#10b981',
      'rejected': '#ef4444',
      'disbursed': '#06b6d4',
      'document_pending': '#f97316'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'submitted': '⏳ Submitted',
      'under_review': '🔍 Under Review',
      'approved': '👍 Approved',
      'rejected': '❌ Rejected',
      'disbursed': '💰 Disbursed',
      'document_pending': '📄 Document Pending'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem', textAlign: 'center' }}>
        <p>Loading application details...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem', textAlign: 'center' }}>
        <p>Application not found</p>
        <button onClick={() => navigate('/lender/applications')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
          Back to Applications
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate('/lender/applications')}
            style={{ backgroundColor: '#e5e7eb', color: '#374151', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
          >
            ← Back
          </button>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Application ID: {application.applicationId}</span>
        </div>

        {/* Status Badge */}
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 'bold' }}>Status: </span>
            <span style={{ 
              backgroundColor: getStatusColor(application.status),
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem'
            }}>
              {getStatusLabel(application.status)}
            </span>
          </div>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Submitted: {new Date(application.submittedAt).toLocaleDateString()}</span>
        </div>

        {/* Patient Details */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Patient Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <p><strong>Name:</strong> {application.patientDetails?.fullName || 'N/A'}</p>
            <p><strong>Phone:</strong> {application.patientDetails?.phone || 'N/A'}</p>
            <p><strong>Email:</strong> {application.patientDetails?.email || 'N/A'}</p>
            <p><strong>PAN:</strong> {application.patientDetails?.pan || 'N/A'}</p>
            <p><strong>Aadhaar:</strong> {application.patientDetails?.aadhaar || 'N/A'}</p>
            <p><strong>Address:</strong> {application.patientDetails?.address || 'N/A'}</p>
          </div>
        </div>

        {/* Loan Details */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Loan Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <p><strong>Treatment:</strong> {application.treatmentType || 'N/A'}</p>
            <p><strong>Hospital:</strong> {application.hospitalName || 'N/A'}</p>
            <p><strong>Estimated Amount:</strong> ₹{(application.estimatedAmount || 0).toLocaleString()}</p>
            <p><strong>Sanctioned Amount:</strong> ₹{(application.sanctionedAmount || 0).toLocaleString()}</p>
            <p><strong>Tenure:</strong> {application.tenure || 'N/A'} months</p>
            <p><strong>Interest Rate:</strong> {application.interestRate || 'N/A'}%</p>
            <p><strong>EMI:</strong> ₹{(application.emi || 0).toLocaleString()}/month</p>
            <p><strong>Collateral:</strong> {application.collateral?.type || 'None'}</p>
          </div>
        </div>

        {/* Documents */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Documents</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <p><strong>Tentative Estimate:</strong> {application.documents?.tentativeEstimate ? '✅ Uploaded' : '❌ Not Uploaded'}</p>
            <p><strong>PAN Card:</strong> {application.documents?.panCard ? '✅ Uploaded' : '❌ Not Uploaded'}</p>
            <p><strong>Aadhaar Card:</strong> {application.documents?.aadhaarCard ? '✅ Uploaded' : '❌ Not Uploaded'}</p>
            <p><strong>Salary Slip:</strong> {application.documents?.salarySlip ? '✅ Uploaded' : '❌ Not Uploaded'}</p>
            <p><strong>Bank Statement:</strong> {application.documents?.bankStatement ? '✅ Uploaded' : '❌ Not Uploaded'}</p>
            <p><strong>Final Bill:</strong> {application.documents?.finalBill ? '✅ Uploaded' : '⏳ Pending'}</p>
          </div>
        </div>

        {/* Actions */}
        {application.status !== 'rejected' && application.status !== 'disbursed' && (
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Actions</h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => openActionModal('approve', { amount: application.estimatedAmount, tenure: 12, rate: 10 })}
                style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                ✅ Approve
              </button>
              <button
                onClick={() => openActionModal('reject', {})}
                style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                ❌ Reject
              </button>
              <button
                onClick={() => openActionModal('document', {})}
                style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                📄 Request Documents
              </button>
              {application.status === 'approved' && application.documents?.finalBill && (
                <button
                  onClick={() => openActionModal('disburse', {})}
                  style={{ backgroundColor: '#06b6d4', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                >
                  💰 Disburse
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
              {actionType === 'approve' && 'Approve Loan'}
              {actionType === 'reject' && 'Reject Loan'}
              {actionType === 'document' && 'Request Documents'}
              {actionType === 'disburse' && 'Disburse Loan'}
            </h3>
            
            {actionType === 'approve' && (
              <>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>Sanctioned Amount (₹)</label>
                  <input type="number" value={actionData.amount || ''} onChange={(e) => setActionData({...actionData, amount: parseFloat(e.target.value)})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>Tenure (months)</label>
                  <input type="number" value={actionData.tenure || ''} onChange={(e) => setActionData({...actionData, tenure: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>Interest Rate (%)</label>
                  <input type="number" value={actionData.rate || ''} onChange={(e) => setActionData({...actionData, rate: parseFloat(e.target.value)})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>Note</label>
                  <textarea value={actionData.note || ''} onChange={(e) => setActionData({...actionData, note: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} rows="2" />
                </div>
              </>
            )}
            
            {actionType === 'reject' && (
              <div style={{ marginBottom: '0.75rem' }}>
                <label>Reason for Rejection</label>
                <textarea value={actionData.note || ''} onChange={(e) => setActionData({...actionData, note: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} rows="3" />
              </div>
            )}
            
            {actionType === 'document' && (
              <>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>Document Type</label>
                  <select value={actionData.documentType || ''} onChange={(e) => setActionData({...actionData, documentType: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                    <option value="">Select</option>
                    <option value="Salary Slip">Salary Slip</option>
                    <option value="Bank Statement">Bank Statement</option>
                    <option value="Property Deed">Property Deed</option>
                    <option value="Gold Valuation">Gold Valuation</option>
                    <option value="Income Tax Return">Income Tax Return</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>Description</label>
                  <textarea value={actionData.description || ''} onChange={(e) => setActionData({...actionData, description: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} rows="2" />
                </div>
              </>
            )}
            
            {actionType === 'disburse' && (
              <>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>Disbursal Amount (₹)</label>
                  <input type="number" value={actionData.amount || application.sanctionedAmount || ''} onChange={(e) => setActionData({...actionData, amount: parseFloat(e.target.value)})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>UTR Number</label>
                  <input type="text" value={actionData.utrNumber || ''} onChange={(e) => setActionData({...actionData, utrNumber: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
                </div>
              </>
            )}
            
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                style={{ flex: 1, backgroundColor: '#8b5cf6', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.7 : 1 }}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowActionModal(false)}
                style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LenderApplicationDetail;
