// D:\hospital-frontend\src\pages\insurance\InsurerExtendedTabs.jsx
// ============================================
// INSURER EXTENDED TABS
// Renewals • Complaints • Reviews • Network Hospitals • KYC
// ============================================

import React, { useState, useEffect } from 'react';
import {
  FaExclamationTriangle, FaStar, FaHospital, FaIdCard, FaSync, FaTrash, FaPlus,
} from 'react-icons/fa';

const API = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-e2d5.up.railway.app';

const insurerHeaders = () => {
  const t = localStorage.getItem('providerToken');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

// ============================================
// RENEWALS TAB
// ============================================
export function RenewalsTab() {
  const [data, setData] = useState({ expiring: [], expired: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/insurance/company/renewals?days=${days}`, { headers: insurerHeaders() });
      const d = await r.json();
      if (d.success) setData(d.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [days]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">🔄 Renewals Management</h2>
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600">Expiring in next</label>
          <select value={days} onChange={(e) => setDays(parseInt(e.target.value))} className="border rounded-lg px-3 py-1.5 text-sm">
            <option value={7}>7 days</option>
            <option value={15}>15 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
          <button onClick={load} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Stat label="Expiring Soon" value={data.counts.expiring || 0} color="orange" />
        <Stat label="Already Expired" value={data.counts.expired || 0} color="red" />
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-bold mb-3 text-orange-600">⏰ Expiring in next {days} days ({data.expiring.length})</h3>
        {loading && <p className="text-gray-400 text-sm">Loading…</p>}
        {!loading && data.expiring.length === 0 && <p className="text-gray-500 text-sm py-4">No policies expiring soon.</p>}
        {data.expiring.map((p) => (
          <div key={p._id} className="border-b last:border-0 py-3">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold text-sm">{p.policyNumber}</div>
                <div className="text-xs text-gray-500">{p.userId?.name} · {p.userId?.phone}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Expires</div>
                <div className="text-sm font-bold text-orange-600">
                  {new Date(p.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-3 text-red-600">⚠️ Already Expired ({data.expired.length})</h3>
        {!loading && data.expired.length === 0 && <p className="text-gray-500 text-sm py-4">No expired policies.</p>}
        {data.expired.map((p) => (
          <div key={p._id} className="border-b last:border-0 py-3">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold text-sm">{p.policyNumber}</div>
                <div className="text-xs text-gray-500">{p.userId?.name}</div>
              </div>
              <div className="text-xs text-gray-500">
                Expired {new Date(p.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// COMPLAINTS TAB
// ============================================
export function ComplaintsTab() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const r = await fetch(`${API}/api/insurance/company/complaints${params}`, { headers: insurerHeaders() });
      const d = await r.json();
      if (d.success) setComplaints(d.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const respond = async (id) => {
    if (responseText.trim().length < 3) { alert('Response too short'); return; }
    try {
      const r = await fetch(`${API}/api/insurance/company/complaints/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...insurerHeaders() },
        body: JSON.stringify({ message: responseText }),
      });
      const d = await r.json();
      if (d.success) { setRespondingTo(null); setResponseText(''); load(); }
      else alert(d.message || 'Failed');
    } catch (e) { alert(e.message); }
  };

  const resolve = async (id) => {
    if (!window.confirm('Mark this complaint as resolved?')) return;
    try {
      const r = await fetch(`${API}/api/insurance/company/complaints/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...insurerHeaders() },
        body: JSON.stringify({ resolutionNote: 'Resolved by insurer' }),
      });
      const d = await r.json();
      if (d.success) load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">🚨 Complaints ({complaints.length})</h2>
        <div className="flex gap-2">
          {['all', 'open', 'in_progress', 'resolved', 'escalated'].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-gray-400">Loading…</p>}
      {!loading && complaints.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FaExclamationTriangle className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No complaints</p>
        </div>
      )}

      <div className="space-y-4">
        {complaints.map((c) => (
          <div key={c._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold">{c.category?.replace(/_/g, ' ')}</div>
                <div className="text-xs text-gray-500">
                  Policy: {c.policyId?.policyNumber || '—'}
                </div>
              </div>
              <StatusPill status={c.status} />
            </div>

            <div className="bg-gray-50 rounded p-3 mb-3 text-sm">{c.description}</div>

            {c.responses && c.responses.length > 0 && (
              <div className="mb-3">
                {c.responses.map((r, i) => (
                  <div key={i} className={`p-2 rounded mb-1 text-xs ${r.from === 'insurer' ? 'bg-blue-50 border-l-2 border-blue-400' : 'bg-gray-50'}`}>
                    <strong>{r.from}:</strong> {r.message}
                  </div>
                ))}
              </div>
            )}

            {respondingTo === c._id ? (
              <div>
                <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} rows={3} placeholder="Write your response…" className="w-full border rounded p-2 text-sm mb-2" />
                <div className="flex gap-2">
                  <button onClick={() => respond(c._id)} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm">Submit</button>
                  <button onClick={() => { setRespondingTo(null); setResponseText(''); }} className="px-4 py-1.5 bg-gray-200 rounded-lg text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                {c.status !== 'resolved' && (
                  <>
                    <button onClick={() => { setRespondingTo(c._id); setResponseText(''); }} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Respond</button>
                    <button onClick={() => resolve(c._id)} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm">✓ Resolve</button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// REVIEWS TAB
// ============================================
export function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [averageRating, setAverageRating] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/insurance/company/reviews`, { headers: insurerHeaders() });
      const d = await r.json();
      if (d.success) {
        setReviews(d.data || []);
        setAverageRating(d.meta?.averageRating || 0);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const respond = async (policyId) => {
    if (responseText.trim().length < 3) { alert('Response too short'); return; }
    try {
      const r = await fetch(`${API}/api/insurance/company/reviews/${policyId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...insurerHeaders() },
        body: JSON.stringify({ message: responseText }),
      });
      const d = await r.json();
      if (d.success) { setRespondingTo(null); setResponseText(''); load(); }
    } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">⭐ Reviews ({reviews.length})</h2>
        {averageRating > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-500">⭐ {averageRating}</div>
            <div className="text-xs text-gray-500">Average Rating</div>
          </div>
        )}
      </div>

      {loading && <p className="text-gray-400">Loading…</p>}
      {!loading && reviews.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FaStar className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No reviews yet</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((r, i) => (
          <div key={`${r.policyId}_${i}`} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold">{r.policyNumber}</div>
                <div className="text-xs text-gray-500">{r.policyName}</div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <FaStar key={n} className={n <= r.rating ? 'text-amber-500' : 'text-gray-300'} />
                ))}
              </div>
            </div>

            {r.comment && <div className="bg-gray-50 rounded p-3 mb-3 text-sm italic">"{r.comment}"</div>}

            {r.insurerResponse ? (
              <div className="bg-blue-50 border-l-2 border-blue-400 p-2 text-xs">
                <strong>Your response:</strong> {r.insurerResponse}
              </div>
            ) : respondingTo === r.policyId ? (
              <div>
                <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} rows={2} placeholder="Thank the customer or address feedback…" className="w-full border rounded p-2 text-sm mb-2" />
                <div className="flex gap-2">
                  <button onClick={() => respond(r.policyId)} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm">Submit</button>
                  <button onClick={() => { setRespondingTo(null); setResponseText(''); }} className="px-4 py-1.5 bg-gray-200 rounded-lg text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setRespondingTo(r.policyId); setResponseText(''); }} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm">+ Respond</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// NETWORK HOSPITALS TAB
// ============================================
export function NetworkHospitalsTab() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ hospitalName: '', address: '', city: '', state: '', pincode: '', specialty: '', cashless: true });

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/insurance/company/network-hospitals`, { headers: insurerHeaders() });
      const d = await r.json();
      if (d.success) setHospitals(d.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.hospitalName || !form.city) { alert('Hospital name and city required'); return; }
    try {
      const r = await fetch(`${API}/api/insurance/company/network-hospitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...insurerHeaders() },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.success) {
        setHospitals(d.data);
        setForm({ hospitalName: '', address: '', city: '', state: '', pincode: '', specialty: '', cashless: true });
        setShowForm(false);
      }
    } catch (e) { alert(e.message); }
  };

  const remove = async (idx) => {
    if (!window.confirm('Remove this hospital from network?')) return;
    try {
      const r = await fetch(`${API}/api/insurance/company/network-hospitals/${idx}`, {
        method: 'DELETE',
        headers: insurerHeaders(),
      });
      const d = await r.json();
      if (d.success) setHospitals(d.data);
    } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">🏥 Network Hospitals ({hospitals.length})</h2>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
          <FaPlus /> Add Hospital
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="font-bold mb-3">Add Network Hospital</h3>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Hospital Name *" value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })} className="border rounded px-3 py-2 text-sm col-span-2" />
            <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="border rounded px-3 py-2 text-sm col-span-2" />
            <input placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <input placeholder="Specialty" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm col-span-2">
              <input type="checkbox" checked={form.cashless} onChange={(e) => setForm({ ...form, cashless: e.target.checked })} />
              Cashless facility available
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={add} className="px-5 py-2 bg-green-600 text-white rounded-lg">Add</button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 bg-gray-200 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {loading && <p className="text-gray-400">Loading…</p>}
      {!loading && hospitals.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FaHospital className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No network hospitals added yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {hospitals.map((h, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{h.hospitalName} {h.cashless && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">Cashless</span>}</div>
              <div className="text-xs text-gray-500">{h.address}, {h.city}, {h.state} {h.pincode}</div>
              {h.specialty && <div className="text-xs text-gray-500">Specialty: {h.specialty}</div>}
            </div>
            <button onClick={() => remove(i)} className="text-red-500 hover:text-red-700 p-2">
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// KYC TAB
// ============================================
export function KycTab() {
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState({
    irdaCertificate: null,
    gstCertificate: null,
    panCard: null,
    bankProof: null,
    registrationCertificate: null
  });
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/insurance/company/my-kyc`, { headers: insurerHeaders() });
      const d = await r.json();
      if (d.success && d.data) {
        setKyc(d.data);
        setPanNumber(d.data.panNumber || '');
        setGstNumber(d.data.gstNumber || '');
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleFileChange = (field, file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMessage('❌ File too large. Max 10 MB.');
      return;
    }
    setFiles(prev => ({ ...prev, [field]: file }));
    setMessage('');
  };

  const submit = async () => {
    // Require at least 3 core docs (IRDAI, GST, PAN) — or existing docs already on file
    const existingUrls = (kyc?.documents || []).reduce((acc, d) => {
      if (d.type) acc[d.type] = d.url;
      return acc;
    }, {});

    const hasIrda = files.irdaCertificate || existingUrls.irda_certificate;
    const hasGst = files.gstCertificate || existingUrls.gst_certificate;
    const hasPan = files.panCard || existingUrls.pan_card;

    if (!hasIrda || !hasGst || !hasPan) {
      setMessage('❌ IRDAI Certificate, GST Certificate, and PAN Card are required.');
      return;
    }

    setSaving(true); setMessage('');
    try {
      const fd = new FormData();
      Object.entries(files).forEach(([key, file]) => {
        if (file) fd.append(key, file);
      });
      if (panNumber) fd.append('panNumber', panNumber);
      if (gstNumber) fd.append('gstNumber', gstNumber);

      const r = await fetch(`${API}/api/insurance/company/kyc/update`, {
        method: 'POST',
        headers: insurerHeaders(),   // NOTE: do NOT set Content-Type; browser sets multipart boundary
        body: fd
      });
      const d = await r.json();
      if (d.success) {
        setMessage('✅ KYC uploaded. Admin will verify within 24 hours.');
        setFiles({ irdaCertificate: null, gstCertificate: null, panCard: null, bankProof: null, registrationCertificate: null });
        await load();
      } else {
        setMessage('❌ ' + (d.message || 'Failed'));
      }
    } catch (e) {
      setMessage('❌ ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400">Loading…</p>;

  const kycStatus = kyc?.kycStatus || 'not_submitted';
  const isVerified = kycStatus === 'verified';
  const isSubmitted = kycStatus === 'submitted' || kycStatus === 'pending';
  const isRejected = kycStatus === 'rejected';
  const isNotSubmitted = kycStatus === 'not_submitted';

  const kycStatusStyles = {
    verified: 'bg-green-100 text-green-700',
    submitted: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
    not_submitted: 'bg-slate-100 text-slate-600',
  }[kycStatus] || 'bg-slate-100 text-slate-600';

  const existingDocs = kyc?.documents || [];
  const existingByType = existingDocs.reduce((acc, d) => {
    if (d.type) acc[d.type] = d;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-bold">📋 KYC Documents</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${kycStatusStyles}`}>
          KYC: {kycStatus.replace(/_/g, ' ').toUpperCase()}
        </span>
      </div>

      {isVerified && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 border-l-4 border-green-500">
          <p className="font-bold text-green-700">✅ KYC Verified</p>
          <p className="text-sm text-green-600 mt-1">
            Verified on {kyc.kycVerifiedAt ? new Date(kyc.kycVerifiedAt).toLocaleDateString('en-IN') : 'recently'}.
          </p>
        </div>
      )}

      {isSubmitted && (
        <div className="mb-4 p-4 rounded-lg bg-blue-50 border-l-4 border-blue-500">
          <p className="font-bold text-blue-700">⏳ KYC Under Review</p>
          <p className="text-sm text-blue-600 mt-1">
            Submitted on {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString('en-IN') : 'recently'}.
            Admin will review within 24 hours.
          </p>
        </div>
      )}

      {isRejected && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border-l-4 border-red-500">
          <p className="font-bold text-red-700">❌ KYC Rejected</p>
          {kyc.kycNotes && (
            <p className="text-sm text-red-600 mt-1"><strong>Reason:</strong> {kyc.kycNotes}</p>
          )}
          <p className="text-sm text-red-500 mt-2">Please re-upload corrected documents below.</p>
        </div>
      )}

      {isNotSubmitted && (
        <div className="mb-4 p-4 rounded-lg bg-amber-50 border-l-4 border-amber-500">
          <p className="font-bold text-amber-700">📝 KYC Required</p>
          <p className="text-sm text-amber-600 mt-1">
            Upload your KYC documents to start issuing policies.
          </p>
        </div>
      )}

      {message && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${message.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm text-gray-500 mb-5">
          Upload PDF or image files (max 10 MB each). Admin will verify within 24 hours.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FileUploadField
            label="IRDAI Certificate *"
            existingUrl={existingByType.irda_certificate?.url}
            file={files.irdaCertificate}
            onChange={f => handleFileChange('irdaCertificate', f)}
          />
          <FileUploadField
            label="GST Certificate *"
            existingUrl={existingByType.gst_certificate?.url}
            file={files.gstCertificate}
            onChange={f => handleFileChange('gstCertificate', f)}
          />
          <FileUploadField
            label="PAN Card *"
            existingUrl={existingByType.pan_card?.url}
            file={files.panCard}
            onChange={f => handleFileChange('panCard', f)}
          />
          <FileUploadField
            label="Bank Proof"
            hint="Cancelled cheque or bank statement"
            existingUrl={existingByType.bank_proof?.url}
            file={files.bankProof}
            onChange={f => handleFileChange('bankProof', f)}
          />
          <FileUploadField
            label="Registration Certificate"
            existingUrl={existingByType.registration_certificate?.url}
            file={files.registrationCertificate}
            onChange={f => handleFileChange('registrationCertificate', f)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">PAN Number</label>
            <input
              value={panNumber}
              onChange={e => setPanNumber(e.target.value.toUpperCase())}
              placeholder="ABCIN1234A"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">GST Number</label>
            <input
              value={gstNumber}
              onChange={e => setGstNumber(e.target.value)}
              placeholder="27ABCIN1234A1Z5"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={saving}
          className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-blue-700"
        >
          {saving ? 'Uploading…' : isSubmitted || isVerified ? 'Update KYC' : 'Submit for Verification'}
        </button>
      </div>
    </div>
  );
}
function KycField({ label, value, onChange, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="https://..."
      />
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function DocLink({ label, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
    >
      📄 {label} ↗
    </a>
  );
}

function FileUploadField({ label, file, onChange, existingUrl, hint }) {
  const inputId = `file-${label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={inputId} className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
        onChange={e => onChange(e.target.files?.[0] || null)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
      />
      {file && (
        <p className="text-xs text-slate-600 mt-1">
          📎 {file.name} ({Math.round(file.size / 1024)} KB)
        </p>
      )}
      {!file && existingUrl && (
        <p className="text-xs mt-1">
          <a href={existingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            📎 View current file ↗
          </a>
        </p>
      )}
      {hint && !file && !existingUrl && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// ============================================
// SHARED HELPERS
// ============================================
function Stat({ label, value, color }) {
  const colorMap = { orange: 'text-orange-600', red: 'text-red-600', blue: 'text-blue-600' };
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-bold ${colorMap[color] || ''}`}>{value}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const colors = {
    open: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    escalated: 'bg-red-100 text-red-700',
  };
  return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}