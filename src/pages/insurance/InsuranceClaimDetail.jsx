// D:\hospital-frontend\src\pages\insurance\InsuranceClaimDetail.jsx
// ============================================
// INSURANCE CLAIM DETAIL — full claim view with timeline
// Route: /insurance/claims/:policyId/:claimId
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaCheckCircle, FaClock, FaTimesCircle, FaFileAlt,
  FaDownload, FaUpload, FaRupeeSign, FaHospital, FaCalendarAlt,
} from 'react-icons/fa';
import api from '../../services/api';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const STATUS_STEPS = [
  { key: 'submitted', label: 'Submitted', icon: FaFileAlt },
  { key: 'under_review', label: 'Under Review', icon: FaClock },
  { key: 'approved', label: 'Approved', icon: FaCheckCircle },
  { key: 'settled', label: 'Settled', icon: FaRupeeSign },
];

const STATUS_COLORS = {
  submitted: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  under_review: 'bg-blue-100 text-blue-800 border-blue-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  settled: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  partially_settled: 'bg-teal-100 text-teal-800 border-teal-300',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
};

export default function InsuranceClaimDetail() {
  const { policyId, claimId } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState('bill');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/insurance/claims/${policyId}/${claimId}`);
      setClaim(res.data?.data || res.data?.claim || res.data);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.error?.message || 'Failed to load claim');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (policyId && claimId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policyId, claimId]);

  const cancelClaim = async () => {
    if (!window.confirm('Are you sure you want to cancel this claim? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      await api.put(`/insurance/claims/${claimId}/cancel`);
      await load();
    } catch (e) {
      alert('Cancel failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setActionLoading(false);
    }
  };

  const uploadDocument = async () => {
    if (!uploadFile) {
      alert('Please select a file first');
      return;
    }
    if (uploadFile.size > 10 * 1024 * 1024) {
      alert('File too large. Max 10 MB.');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('documentType', uploadType);
      await api.post(`/insurance/claims/${claimId}/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowUploadModal(false);
      setUploadFile(null);
      await load();
    } catch (e) {
      alert('Upload failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-slate-500">Loading claim…</p>
        </div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-md">
          <FaTimesCircle className="text-5xl text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Claim Not Found</h2>
          <p className="text-slate-500 mt-2">{error || 'The claim you are looking for does not exist.'}</p>
          <Link
            to="/insurance/claims"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold"
          >
            ← Back to Claims
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === claim.status);
  const isRejected = claim.status === 'rejected';
  const isSettled = claim.status === 'settled' || claim.status === 'partially_settled';
  const isCancelled = claim.status === 'cancelled';

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/insurance/claims')}
            className="text-slate-600 hover:text-slate-900 text-sm font-semibold flex items-center gap-2 mb-3"
          >
            <FaArrowLeft /> Back to My Claims
          </button>
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Claim {claim.claimNumber || claimId.slice(-8)}</h1>
              <p className="text-slate-500 text-sm mt-1">
                Submitted on {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold border ${STATUS_COLORS[claim.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
              {claim.status?.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Timeline / Progress */}
        {!isRejected && !isCancelled && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="font-bold text-slate-800 mb-4">Claim Progress</h2>
            <div className="flex justify-between items-center">
              {STATUS_STEPS.map((step, idx) => {
                const isDone = currentStepIndex >= idx || isSettled;
                const isCurrent = currentStepIndex === idx;
                const Icon = step.icon;
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                          isDone ? 'bg-green-500 text-white' : isCurrent ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        <Icon />
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          isDone ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`h-1 flex-1 mx-1 ${isDone && currentStepIndex > idx ? 'bg-green-500' : 'bg-slate-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {isRejected && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <FaTimesCircle className="text-red-600 text-2xl flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-800">Claim Rejected</h3>
                {claim.rejectedReason && (
                  <p className="text-red-700 text-sm mt-1"><strong>Reason:</strong> {claim.rejectedReason}</p>
                )}
                {claim.rejectedAt && (
                  <p className="text-red-600 text-xs mt-1">
                    Rejected on {new Date(claim.rejectedAt).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-gray-800">Claim Cancelled</h3>
            {claim.cancellationReason && <p className="text-gray-600 text-sm mt-1">{claim.cancellationReason}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column — main details */}
          <div className="md:col-span-2 space-y-6">
            {/* Claim Summary */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-bold text-slate-800 mb-4">Claim Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Hospital</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-2">
                    <FaHospital className="text-slate-400" /> {claim.hospitalName || '—'}
                  </p>
                  {claim.hospitalAddress && <p className="text-xs text-slate-500 mt-1">{claim.hospitalAddress}</p>}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Claim Amount</p>
                  <p className="font-bold text-2xl text-slate-800">{inr(claim.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Admission Date</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-2">
                    <FaCalendarAlt className="text-slate-400" />
                    {claim.admissionDate ? new Date(claim.admissionDate).toLocaleDateString('en-IN') : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Claim Type</p>
                  <p className="font-semibold text-slate-800 capitalize">{claim.claimType?.replace(/_/g, ' ') || '—'}</p>
                </div>
              </div>
              {claim.description && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Description</p>
                  <p className="text-sm text-slate-700">{claim.description}</p>
                </div>
              )}
            </div>

            {/* Approved / Settlement Details */}
            {(claim.approvedAmount > 0 || isSettled) && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h2 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <FaCheckCircle /> Approved & Settlement
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-green-700">Approved Amount</p>
                    <p className="font-bold text-xl text-green-800">{inr(claim.approvedAmount || claim.amount)}</p>
                  </div>
                  {claim.settlementAmount && (
                    <div>
                      <p className="text-xs text-green-700">Settlement Amount</p>
                      <p className="font-bold text-xl text-green-800">{inr(claim.settlementAmount)}</p>
                    </div>
                  )}
                  {claim.approvedAt && (
                    <div>
                      <p className="text-xs text-green-700">Approved On</p>
                      <p className="font-semibold text-green-800">{new Date(claim.approvedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  )}
                  {claim.settlementDate && (
                    <div>
                      <p className="text-xs text-green-700">Settled On</p>
                      <p className="font-semibold text-green-800">{new Date(claim.settlementDate).toLocaleDateString('en-IN')}</p>
                    </div>
                  )}
                </div>
                {claim.settlementReference && (
                  <p className="text-xs text-green-600 mt-3">
                    <strong>Reference:</strong> {claim.settlementReference}
                  </p>
                )}
              </div>
            )}

            {/* Documents */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-slate-800">Documents ({claim.documents?.length || 0})</h2>
                {!isRejected && !isCancelled && !isSettled && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-1"
                  >
                    <FaUpload className="text-xs" /> Upload
                  </button>
                )}
              </div>
              {(!claim.documents || claim.documents.length === 0) ? (
                <p className="text-slate-400 text-sm text-center py-6">
                  No documents uploaded yet.
                  {!isRejected && !isCancelled && !isSettled && ' Click Upload to add bills, discharge summary, or reports.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {claim.documents.map((doc, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FaFileAlt className="text-blue-600" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {doc.name || doc.type || `Document ${i + 1}`}
                          </p>
                          {doc.uploadedAt && (
                            <p className="text-xs text-slate-500">
                              {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                            </p>
                          )}
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <FaDownload /> View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timeline / History */}
            {claim.timeline && claim.timeline.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="font-bold text-slate-800 mb-4">Claim History</h2>
                <div className="space-y-3">
                  {claim.timeline.map((entry, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{entry.status?.replace(/_/g, ' ')}</p>
                        {entry.note && <p className="text-xs text-slate-600">{entry.note}</p>}
                        {entry.createdAt && (
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(entry.createdAt).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insurer Communication */}
            {claim.insurerCommunication && claim.insurerCommunication.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h2 className="font-bold text-blue-800 mb-3">Messages from Insurer</h2>
                <div className="space-y-2">
                  {claim.insurerCommunication.map((msg, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg">
                      <p className="text-sm text-slate-700">{msg.message || msg.text}</p>
                      {msg.createdAt && (
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(msg.createdAt).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column — sidebar */}
          <div className="space-y-6">
            {/* Policy Info */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-bold text-slate-800 mb-3">Policy Details</h2>
              {claim.policyId ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Policy Number</p>
                    <p className="font-mono font-semibold text-slate-800">{claim.policyId.policyNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Plan</p>
                    <p className="font-semibold text-slate-800">{claim.policyId.policyName || '—'}</p>
                  </div>
                  <Link
                    to={`/insurance/my-policies/${claim.policyId._id}`}
                    className="inline-block mt-2 text-blue-600 text-sm font-semibold hover:underline"
                  >
                    View Full Policy →
                  </Link>
                </div>
              ) : (
                <p className="text-slate-400 text-sm">Policy details not available</p>
              )}
            </div>

            {/* Company Info */}
            {claim.companyId && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="font-bold text-slate-800 mb-3">Insurance Company</h2>
                <p className="font-semibold text-slate-800">{claim.companyId.companyName || claim.companyId.name || '—'}</p>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-bold text-slate-800 mb-3">Actions</h2>
              <div className="space-y-2">
                {!isRejected && !isCancelled && !isSettled && !['approved', 'settled'].includes(claim.status) && (
                  <button
                    onClick={cancelClaim}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-50 disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing…' : 'Cancel Claim'}
                  </button>
                )}
                {isRejected && (
                  <Link
                    to={`/insurance/claims/${policyId}/${claimId}/appeal`}
                    className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm text-center"
                  >
                    Appeal Rejection
                  </Link>
                )}
                <Link
                  to="/insurance/claims"
                  className="block w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold text-sm text-center hover:bg-slate-50"
                >
                  ← Back to Claims
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Upload Document</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Document Type</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="bill">Hospital Bill</option>
                    <option value="discharge">Discharge Summary</option>
                    <option value="report">Medical Report</option>
                    <option value="prescription">Prescription</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">File (PDF or Image, max 10 MB)</label>
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                  {uploadFile && (
                    <p className="text-xs text-slate-500 mt-1">
                      {uploadFile.name} ({Math.round(uploadFile.size / 1024)} KB)
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={uploadDocument}
                  disabled={uploading || !uploadFile}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm disabled:opacity-50"
                >
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
                <button
                  onClick={() => { setShowUploadModal(false); setUploadFile(null); }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}