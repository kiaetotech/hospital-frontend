import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLender } from '../../contexts/LenderContext';
import { lenderApplications } from '../../services/lenderApi';

const LenderApplications = () => {
  const navigate = useNavigate();
  const { lender } = useLender();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', page: 1, limit: 20 });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!lender) {
      navigate('/lender/login');
      return;
    }
    fetchApplications();
  }, [lender, navigate, filters]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await lenderApplications.getAll(filters);
      setApplications(response.data.applications || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem', textAlign: 'center' }}>
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Applications</h1>
          <button
            onClick={() => navigate('/lender/dashboard')}
            style={{ backgroundColor: '#e5e7eb', color: '#374151', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Filters */}
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '0.875rem', marginRight: '0.5rem' }}>Status:</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
              >
                <option value="all">All</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="disbursed">Disbursed</option>
                <option value="document_pending">Document Pending</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', marginRight: '0.5rem' }}>Per Page:</label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total: {total} applications</span>
          </div>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', overflowX: 'auto' }}>
          {applications.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No applications found</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Application ID</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Patient</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Amount</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Treatment</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.applicationId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{app.applicationId}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{app.patientDetails?.fullName || 'N/A'}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>₹{(app.estimatedAmount || app.requestedAmount || 0).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{app.treatmentType || 'N/A'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        backgroundColor: getStatusColor(app.status),
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem'
                      }}>
                        {getStatusLabel(app.status)}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => navigate(`/lender/applications/${app.applicationId}`)}
                        style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button
              onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
              disabled={filters.page === 1}
              style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', cursor: filters.page === 1 ? 'not-allowed' : 'pointer', opacity: filters.page === 1 ? 0.5 : 1 }}
            >
              Previous
            </button>
            <span style={{ padding: '0.5rem 1rem' }}>Page {filters.page} of {totalPages}</span>
            <button
              onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
              disabled={filters.page === totalPages}
              style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', cursor: filters.page === totalPages ? 'not-allowed' : 'pointer', opacity: filters.page === totalPages ? 0.5 : 1 }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LenderApplications;