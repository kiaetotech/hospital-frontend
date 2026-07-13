import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-f1b1.up.railway.app';

const CorporatePlansTab = ({ providerType, providerId, token }) => {
  const [servesCorporate, setServesCorporate] = useState(false);
  const [packages, setPackages] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('packages');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    packageName: '', packageType: 'health_checkup', description: '',
    servicesIncluded: '', pricePerEmployee: '', discountedPricePerEmployee: '',
    minEmployees: 10, validityDays: 365, availableCities: '', slaTerms: ''
  });

  const cfg = { headers: { Authorization: `Bearer ${token}` } };

  // API path per provider type
  const apiPath = {
    hospitals: 'hospitals', onlineDoctors: 'online-doctor', diagnostics: 'diagnostics',
    mentalHealth: 'mentalhealth/therapist', ayurveda: 'ayurveda', homeopathy: 'homeopathy',
    caregivers: 'caregivers', ambulance: 'ambulance'
  }[providerType] || providerType;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pkgRes, enqRes] = await Promise.all([
        axios.get(`${API_BASE}/api/${apiPath}/corporate/packages`, { ...cfg, params: { [providerType === 'hospitals' ? 'hospitalId' : providerType === 'ambulance' ? 'ambulanceId' : providerType === 'diagnostics' ? 'providerId' : 'doctorId']: providerId } }),
        axios.get(`${API_BASE}/api/${apiPath}/corporate/enquiries`, { ...cfg, params: { [providerType === 'hospitals' ? 'hospitalId' : providerType === 'ambulance' ? 'ambulanceId' : providerType === 'diagnostics' ? 'providerId' : 'doctorId']: providerId } })
      ]);
      if (pkgRes.data?.success) { setPackages(pkgRes.data.data.packages || []); setServesCorporate(pkgRes.data.data.servesCorporate); }
      if (enqRes.data?.success) setEnquiries(enqRes.data.data);
    } catch (e) { console.log('Load error:', e.message); }
    finally { setLoading(false); }
  };

  const toggleCorporate = async () => {
    try {
      const body = { [providerType === 'hospitals' ? 'hospitalId' : providerType === 'ambulance' ? 'ambulanceId' : providerType === 'diagnostics' ? 'providerId' : 'doctorId']: providerId, enable: !servesCorporate };
      await axios.put(`${API_BASE}/api/${apiPath}/corporate/toggle`, body, cfg);
      setServesCorporate(!servesCorporate);
      setMessage(`✅ Corporate ${!servesCorporate ? 'enabled' : 'disabled'}`);
    } catch (e) { setMessage('❌ Failed to toggle'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.packageName || !form.pricePerEmployee) return setMessage('❌ Name and price required');
    try {
      const body = {
        [providerType === 'hospitals' ? 'hospitalId' : providerType === 'ambulance' ? 'ambulanceId' : providerType === 'diagnostics' ? 'providerId' : 'doctorId']: providerId,
        ...form, servicesIncluded: form.servicesIncluded.split(',').map(s => s.trim()).filter(Boolean),
        availableCities: form.availableCities.split(',').map(s => s.trim()).filter(Boolean),
        pricePerEmployee: Number(form.pricePerEmployee),
        discountedPricePerEmployee: form.discountedPricePerEmployee ? Number(form.discountedPricePerEmployee) : undefined,
        minEmployees: Number(form.minEmployees), validityDays: Number(form.validityDays)
      };
      await axios.post(`${API_BASE}/api/${apiPath}/corporate/packages`, body, cfg);
      setMessage('✅ Package created');
      setShowForm(false);
      setForm({ packageName:'', packageType:'health_checkup', description:'', servicesIncluded:'', pricePerEmployee:'', discountedPricePerEmployee:'', minEmployees:10, validityDays:365, availableCities:'', slaTerms:'' });
      loadData();
    } catch (e) { setMessage('❌ ' + (e.response?.data?.message || 'Failed')); }
  };

  const togglePackageStatus = async (pkgId, currentStatus) => {
    try {
      const body = {
        [providerType === 'hospitals' ? 'hospitalId' : providerType === 'ambulance' ? 'ambulanceId' : providerType === 'diagnostics' ? 'providerId' : 'doctorId']: providerId,
        isActive: !currentStatus
      };
      await axios.put(`${API_BASE}/api/${apiPath}/corporate/packages/${pkgId}`, body, cfg);
      loadData();
    } catch (e) { setMessage('❌ Failed'); }
  };

  const updateEnquiry = async (enqId, status) => {
    try {
      const body = { [providerType === 'hospitals' ? 'hospitalId' : providerType === 'ambulance' ? 'ambulanceId' : providerType === 'diagnostics' ? 'providerId' : 'doctorId']: providerId, status };
      await axios.put(`${API_BASE}/api/${apiPath}/corporate/enquiries/${enqId}`, body, cfg);
      loadData();
    } catch (e) { setMessage('❌ Failed'); }
  };

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>⏳ Loading corporate plans...</div>;

  const fmt = (n) => n ? '₹' + Number(n).toLocaleString('en-IN') : '₹0';
  const S = {
    toggle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, background: servesCorporate ? '#ecfdf5' : '#fef3c7', borderRadius: 12, marginBottom: 20, border: servesCorporate ? '1px solid #a7f3d0' : '1px solid #fcd34d' },
    btn: { padding: '8px 18px', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' },
    card: { background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0', marginBottom: 12 },
    tab: (a) => ({ padding: '8px 18px', border: 'none', borderRadius: 6, background: a ? '#2563eb' : '#f1f5f9', color: a ? '#fff' : '#475569', fontWeight: a ? 700 : 400, cursor: 'pointer', fontSize: '0.85rem', marginRight: 6 }),
    input: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' },
  };

  return (
    <div style={{ padding: '0 0 24px' }}>
      {message && <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, background: message.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: message.startsWith('✅') ? '#166534' : '#dc2626', fontWeight: 500, fontSize: '0.9rem' }}>{message} <span onClick={() => setMessage('')} style={{ float: 'right', cursor: 'pointer' }}>×</span></div>}

      {/* Toggle */}
      <div style={S.toggle}>
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 4 }}>🏢 Corporate Clients</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{servesCorporate ? 'You are visible to corporate HR teams. They can browse and book your packages.' : 'Enable to offer corporate healthcare packages to companies.'}</p>
        </div>
        <button onClick={toggleCorporate} style={{ ...S.btn, background: servesCorporate ? '#ef4444' : '#10b981', color: '#fff', padding: '10px 24px' }}>
          {servesCorporate ? 'Disable' : 'Enable Corporate'}
        </button>
      </div>

      {/* Tabs */}
      {servesCorporate && (
        <>
          <div style={{ marginBottom: 20 }}>
            {['packages','enquiries'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={S.tab(activeTab === t)}>
                {t === 'packages' ? '📦 Packages' : '📩 Enquiries'} {t === 'enquiries' && enquiries.length > 0 && `(${enquiries.length})`}
              </button>
            ))}
          </div>

          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700 }}>My Corporate Packages ({packages.length})</h3>
                <button onClick={() => setShowForm(!showForm)} style={{ ...S.btn, background: '#2563eb', color: '#fff' }}>{showForm ? 'Cancel' : '+ New Package'}</button>
              </div>

              {showForm && (
                <form onSubmit={handleSubmit} style={{ ...S.card, marginBottom: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ gridColumn: 'span 2' }}><label style={lbl}>Package Name *</label><input value={form.packageName} onChange={e => setForm({...form, packageName: e.target.value})} style={S.input} placeholder="e.g. Employee Health Checkup" /></div>
                    <div><label style={lbl}>Type</label><select value={form.packageType} onChange={e => setForm({...form, packageType: e.target.value})} style={S.input}><option value="health_checkup">Health Checkup</option><option value="opd_subscription">OPD Subscription</option><option value="teleconsult_package">Teleconsult</option><option value="wellness_program">Wellness Program</option><option value="diagnostic_package">Diagnostic</option><option value="custom">Custom</option></select></div>
                    <div><label style={lbl}>Price/Employee (₹) *</label><input type="number" value={form.pricePerEmployee} onChange={e => setForm({...form, pricePerEmployee: e.target.value})} style={S.input} /></div>
                    <div><label style={lbl}>Discounted Price (₹)</label><input type="number" value={form.discountedPricePerEmployee} onChange={e => setForm({...form, discountedPricePerEmployee: e.target.value})} style={S.input} /></div>
                    <div><label style={lbl}>Min Employees</label><input type="number" value={form.minEmployees} onChange={e => setForm({...form, minEmployees: e.target.value})} style={S.input} /></div>
                    <div><label style={lbl}>Validity (Days)</label><input type="number" value={form.validityDays} onChange={e => setForm({...form, validityDays: e.target.value})} style={S.input} /></div>
                    <div><label style={lbl}>Cities (comma separated)</label><input value={form.availableCities} onChange={e => setForm({...form, availableCities: e.target.value})} style={S.input} placeholder="Mumbai, Delhi, Bangalore" /></div>
                    <div><label style={lbl}>Services Included (comma separated)</label><input value={form.servicesIncluded} onChange={e => setForm({...form, servicesIncluded: e.target.value})} style={S.input} placeholder="CBC, Lipid Profile, Doctor Consult" /></div>
                    <div style={{ gridColumn: 'span 2' }}><label style={lbl}>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{...S.input, height:60}} /></div>
                    <div style={{ gridColumn: 'span 2' }}><label style={lbl}>SLA Terms</label><input value={form.slaTerms} onChange={e => setForm({...form, slaTerms: e.target.value})} style={S.input} placeholder="e.g. Reports delivered within 24 hours" /></div>
                  </div>
                  <button type="submit" style={{...S.btn, background:'#10b981', color:'#fff', padding:'10px 28px', marginTop:12}}>Create Package</button>
                </form>
              )}

              {packages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>📦 No corporate packages yet. Create your first package above.</div>
              ) : (
                packages.map(pkg => (
                  <div key={pkg._id} style={{...S.card, opacity: pkg.isActive ? 1 : 0.6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <h4 style={{ fontWeight: 700 }}>{pkg.packageName || pkg.name}</h4>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>{pkg.description}</div>
                        <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: '0.85rem' }}>
                          <span><strong>{fmt(pkg.pricePerEmployee)}</strong>/employee</span>
                          {pkg.discountedPricePerEmployee && <span style={{ color: '#059669' }}>Discounted: {fmt(pkg.discountedPricePerEmployee)}</span>}
                          <span>Min: {pkg.minEmployees} emp</span>
                          <span>Valid: {pkg.validityDays}d</span>
                        </div>
                        {pkg.servicesIncluded?.length > 0 && <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>{pkg.servicesIncluded.map((s,i) => <span key={i} style={{ background:'#f1f5f9', padding:'2px 8px', borderRadius:12, fontSize:'0.75rem' }}>{s}</span>)}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => togglePackageStatus(pkg._id, pkg.isActive)} style={{...S.btn, background: pkg.isActive ? '#f59e0b' : '#10b981', color: '#fff', fontSize: '0.75rem' }}>
                          {pkg.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Enquiries Tab */}
          {activeTab === 'enquiries' && (
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>📩 Corporate Enquiries ({enquiries.length})</h3>
              {enquiries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No enquiries yet. Enquiries appear when companies show interest in your packages.</div>
              ) : (
                enquiries.map(enq => (
                  <div key={enq._id} style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <h4 style={{ fontWeight: 700 }}>{enq.companyName}</h4>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{enq.contactPerson} · {enq.email} · {enq.phone}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>👥 {enq.employeeCount} employees · {enq.requirements || 'No specific requirements'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700, background: enq.status === 'new' ? '#fef3c7' : enq.status === 'converted' ? '#dcfce7' : '#f1f5f9', color: enq.status === 'new' ? '#92400e' : enq.status === 'converted' ? '#166534' : '#475569' }}>{enq.status}</span>
                        <select value={enq.status} onChange={e => updateEnquiry(enq._id, e.target.value)} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: '0.8rem' }}>
                          <option value="new">New</option><option value="contacted">Contacted</option><option value="negotiating">Negotiating</option><option value="converted">Converted</option><option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const lbl = { display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: 4, color: '#374151' };

export default CorporatePlansTab;