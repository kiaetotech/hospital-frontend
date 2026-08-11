import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLenders } from '../../services/adminApi';

const AdminVerifyLenders = () => {
  const navigate = useNavigate();
  const [pendingLenders, setPendingLenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLender, setSelectedLender] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchPendingLenders();
  }, [navigate]);

  const fetchPendingLenders = async () => {
    setLoading(true);
    try {
      const response = await adminLenders.getPending();
      setPendingLenders(response.data.lenders || []);
    } catch (error) {
      console.error('Error fetching pending lenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (lenderId, status) => {
    setActionLoading(true);
    try {
      await adminLenders.verify(lenderId, {
        status: status,
        commissionRate: 2.5,
        adminNote: status === 'active' ? 'Verified by admin' : 'Rejected by admin',
        rejectionReason: status === 'rejected' ? rejectReason : ''
      });
      alert(`Lender ${status} successfully!`);
      setShowDetail(false);
      setSelectedLender(null);
      fetchPendingLenders();
    } catch (error) {
      alert('Action failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const viewDetails = (lender) => {
    setSelectedLender(lender);
    setShowDetail(true);
    setRejectReason('');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem', textAlign: 'center' }}>
        <p>Loading pending lenders...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Verify Lenders</h1>
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={{ backgroundColor: '#e5e7eb', color: '#374151', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {pendingLenders.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>🎉 No Pending Lenders</h2>
            <p style={{ color: '#6b7280' }}>All lenders have been verified.</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Lender ID</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Business Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Email</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Type</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingLenders.map((lender) => (
                  <tr key={lender.lenderId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{lender.lenderId}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{lender.businessName}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{lender.email}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      <span style={{ 
                        backgroundColor: lender.lenderType === 'national' ? '#10b981' : lender.lenderType === 'regional' ? '#8b5cf6' : '#f59e0b',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem'
                      }}>
                        {lender.lenderType || 'regional'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => viewDetails(lender)}
                        style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedLender && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Lender Details</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Lender ID:</strong> {selectedLender.lenderId}</p>
              <p><strong>Business Name:</strong> {selectedLender.businessName}</p>
              <p><strong>Registration Number:</strong> {selectedLender.registrationNumber}</p>
              <p><strong>Email:</strong> {selectedLender.email}</p>
              <p><strong>Phone:</strong> {selectedLender.phone}</p>
              <p><strong>Type:</strong> {selectedLender.lenderType || 'regional'}</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Registered Office</h3>
              <p>{selectedLender.registeredOffice?.address}, {selectedLender.registeredOffice?.city}, {selectedLender.registeredOffice?.state} - {selectedLender.registeredOffice?.pincode}</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Branches ({selectedLender.branches?.length || 0})</h3>
              {selectedLender.branches?.map((branch, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem 0' }}>
                  <p><strong>{branch.branchName}</strong></p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{branch.address}, {branch.city} - {branch.pincode}</p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Manager: {branch.managerName || 'N/A'}</p>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Loan Products</h3>
              {selectedLender.loanProducts?.map((product, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem 0' }}>
                  <p><strong>{product.productName}</strong></p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>₹{product.minAmount?.toLocaleString()} - ₹{product.maxAmount?.toLocaleString()} | {product.interestRate}% p.a.</p>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Rejection Reason (if rejecting)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                rows="2"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => handleVerify(selectedLender.lenderId, 'active')}
                disabled={actionLoading}
                style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.7 : 1 }}
              >
                ✅ Approve
              </button>
              <button
                onClick={() => {
                  if (!rejectReason) {
                    alert('Please enter a rejection reason');
                    return;
                  }
                  handleVerify(selectedLender.lenderId, 'rejected');
                }}
                disabled={actionLoading}
                style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.7 : 1 }}
              >
                ❌ Reject
              </button>
              <button
                onClick={() => setShowDetail(false)}
                style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerifyLenders;

