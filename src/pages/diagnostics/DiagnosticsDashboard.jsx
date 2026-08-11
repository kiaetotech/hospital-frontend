import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderDashboardLayout from '../../components/ProviderDashboardLayout';
import ProviderStatsCards from '../../components/ProviderStatsCards';
import ProviderTable from '../../components/ProviderTable';
import CorporatePlansTab from '../../components/CorporatePlansTab';
import ProviderAuth from '../../components/ProviderAuth';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-7d0f.up.railway.app';

const DiagnosticsDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [tests, setTests] = useState([]);
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [testForm, setTestForm] = useState({ name: '', category: '', price: '', home_collection: false, fasting_required: false, report_time: '24', sample_type: 'Blood' });
  const [packageForm, setPackageForm] = useState({ name: '', included_tests: '', price: '', discount: '', description: '' });

  const token = localStorage.getItem('providerToken');
  const providerId = localStorage.getItem('providerId');
  const cfg = { headers: { Authorization: `Bearer ${token}` } };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'tests', label: 'Tests', icon: '🧪' },
    { id: 'packages', label: 'Packages', icon: '📦' },
    { id: 'bookings', label: 'Bookings', icon: '📋' },
    { id: 'corporate', label: 'Corporate Plans', icon: '🏢' },
    { id: 'upload', label: 'Excel Upload', icon: '📤' },
    { id: 'profile', label: 'Profile', icon: '🔬' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!token) { navigate('/diagnostics/login'); return; }
      if (activeTab === 'dashboard') {
        const [sr, br] = await Promise.all([
          axios.get(`${API_BASE}/api/diagnostics/provider/stats`, cfg),
          axios.get(`${API_BASE}/api/diagnostics/provider/bookings?limit=5`, cfg)
        ]);
        if (sr.data?.success) setStats(sr.data.data);
        if (br.data?.success) setBookings(br.data.data);
      } else if (activeTab === 'tests') {
        const r = await axios.get(`${API_BASE}/api/diagnostics/provider/tests`, cfg);
        if (r.data?.success) setTests(r.data.data);
      } else if (activeTab === 'packages') {
        const r = await axios.get(`${API_BASE}/api/diagnostics/provider/packages`, cfg);
        if (r.data?.success) setPackages(r.data.data);
      } else if (activeTab === 'bookings') {
        const r = await axios.get(`${API_BASE}/api/diagnostics/provider/bookings?limit=50`, cfg);
        if (r.data?.success) setBookings(r.data.data);
      } else if (activeTab === 'profile') {
        const r = await axios.get(`${API_BASE}/api/diagnostics/provider/profile`, cfg);
        if (r.data?.success) setProfile(r.data.data);
      }
    } catch (e) {
      if (e.response?.status === 401) navigate('/diagnostics/login');
    } finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('providerToken'); localStorage.removeItem('providerType'); localStorage.removeItem('providerId');
    navigate('/diagnostics/login');
  };

  const addTest = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/diagnostics/provider/tests`, { ...testForm, price: Number(testForm.price) }, cfg);
      setShowTestForm(false); setTestForm({ name: '', category: '', price: '', home_collection: false, fasting_required: false, report_time: '24', sample_type: 'Blood' });
      loadData();
    } catch (e) { alert('Failed: ' + (e.response?.data?.message || e.message)); }
  };

  const addPackage = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/diagnostics/provider/packages`, { ...packageForm, price: Number(packageForm.price), discount: Number(packageForm.discount), included_tests: packageForm.included_tests.split(',').map(t => t.trim()) }, cfg);
      setShowPackageForm(false); setPackageForm({ name: '', included_tests: '', price: '', discount: '', description: '' });
      loadData();
    } catch (e) { alert('Failed: ' + (e.response?.data?.message || e.message)); }
  };

  const deleteTest = async (id) => {
    if (!window.confirm('Delete this test?')) return;
    try { await axios.delete(`${API_BASE}/api/diagnostics/provider/tests/${id}`, cfg); loadData(); } catch (e) { alert('Failed'); }
  };

  const deletePackage = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    try { await axios.delete(`${API_BASE}/api/diagnostics/provider/packages/${id}`, cfg); loadData(); } catch (e) { alert('Failed'); }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    try {
      const r = await axios.post(`${API_BASE}/api/diagnostics/upload/tests`, fd, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } });
      setUploadMessage(`✅ ${r.data.message || 'Uploaded'}`); loadData();
    } catch (e) { setUploadMessage('❌ Upload failed'); }
  };

  const inp = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.85rem', marginBottom: 8, boxSizing: 'border-box' };
  const btn = { padding: '8px 18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' };
  const btnDanger = { ...btn, backgroundColor: '#ef4444' };
  const card = { backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16 };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return (
        <div>
          <ProviderStatsCards stats={stats} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={card}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>📋 Recent Bookings</h3>
              {bookings.length === 0 ? <p style={{ color: '#64748b' }}>No bookings</p> : bookings.slice(0, 5).map((b, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>{b.patientName} — {b.testName || b.packageName}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700, background: b.status === 'completed' ? '#dcfce7' : '#fef3c7', color: b.status === 'completed' ? '#166534' : '#92400e' }}>{b.status}</span>
                </div>
              ))}
            </div>
            <div style={card}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>⚡ Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button onClick={() => setActiveTab('tests')} style={btn}>🧪 Manage Tests</button>
                <button onClick={() => setActiveTab('packages')} style={btn}>📦 Manage Packages</button>
                <button onClick={() => setActiveTab('upload')} style={btn}>📤 Excel Upload</button>
                <button onClick={() => setActiveTab('corporate')} style={{ ...btn, backgroundColor: '#8b5cf6' }}>🏢 Corporate</button>
              </div>
            </div>
          </div>
        </div>
      );

      case 'tests': return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>🧪 Tests ({tests.length})</h2>
            <button onClick={() => setShowTestForm(!showTestForm)} style={btn}>{showTestForm ? 'Cancel' : '+ Add Test'}</button>
          </div>
          {showTestForm && (
            <form onSubmit={addTest} style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input placeholder="Test Name *" value={testForm.name} onChange={e => setTestForm({...testForm, name: e.target.value})} style={inp} required />
              <input placeholder="Category" value={testForm.category} onChange={e => setTestForm({...testForm, category: e.target.value})} style={inp} />
              <input placeholder="Price (₹)" type="number" value={testForm.price} onChange={e => setTestForm({...testForm, price: e.target.value})} style={inp} />
              <input placeholder="Report Time (hrs)" type="number" value={testForm.report_time} onChange={e => setTestForm({...testForm, report_time: e.target.value})} style={inp} />
              <input placeholder="Sample Type" value={testForm.sample_type} onChange={e => setTestForm({...testForm, sample_type: e.target.value})} style={inp} />
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem' }}><input type="checkbox" checked={testForm.home_collection} onChange={e => setTestForm({...testForm, home_collection: e.target.checked})} /> Home Collection</label>
                <label style={{ fontSize: '0.85rem' }}><input type="checkbox" checked={testForm.fasting_required} onChange={e => setTestForm({...testForm, fasting_required: e.target.checked})} /> Fasting Required</label>
              </div>
              <div style={{ gridColumn: 'span 2' }}><button type="submit" style={btn}>💾 Save Test</button></div>
            </form>
          )}
          {tests.length === 0 ? <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>No tests added</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead><tr style={{ borderBottom: '2px solid #e2e8f0' }}><th style={th}>Name</th><th style={th}>Category</th><th style={th}>Price</th><th style={th}>Home</th><th style={th}>Report</th><th style={th}>Action</th></tr></thead>
                <tbody>{tests.map(t => (
                  <tr key={t._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={td}>{t.name}</td><td style={td}>{t.category}</td><td style={td}>₹{t.price}</td>
                    <td style={td}>{t.home_collection ? '✅' : '❌'}</td><td style={td}>{t.report_time}h</td>
                    <td style={td}><button onClick={() => deleteTest(t._id)} style={btnDanger}>✕</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      );

      case 'packages': return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>📦 Packages ({packages.length})</h2>
            <button onClick={() => setShowPackageForm(!showPackageForm)} style={btn}>{showPackageForm ? 'Cancel' : '+ Add Package'}</button>
          </div>
          {showPackageForm && (
            <form onSubmit={addPackage} style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input placeholder="Package Name *" value={packageForm.name} onChange={e => setPackageForm({...packageForm, name: e.target.value})} style={inp} required />
              <input placeholder="Tests (comma separated)" value={packageForm.included_tests} onChange={e => setPackageForm({...packageForm, included_tests: e.target.value})} style={inp} />
              <input placeholder="Price (₹)" type="number" value={packageForm.price} onChange={e => setPackageForm({...packageForm, price: e.target.value})} style={inp} />
              <input placeholder="Discount %" type="number" value={packageForm.discount} onChange={e => setPackageForm({...packageForm, discount: e.target.value})} style={inp} />
              <input placeholder="Description" value={packageForm.description} onChange={e => setPackageForm({...packageForm, description: e.target.value})} style={{...inp, gridColumn: 'span 2'}} />
              <div style={{ gridColumn: 'span 2' }}><button type="submit" style={btn}>💾 Save Package</button></div>
            </form>
          )}
          {packages.length === 0 ? <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>No packages</p> : (
            <div style={{ display: 'grid', gap: 12 }}>
              {packages.map(p => (
                <div key={p._id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{p.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{(p.included_tests || p.tests || []).join(', ')}</div>
                    <div>₹{p.price} {p.discount > 0 && <span style={{ color: '#10b981' }}>({p.discount}% off)</span>}</div>
                  </div>
                  <button onClick={() => deletePackage(p._id)} style={btnDanger}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      );

      case 'bookings': return (
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>📋 Bookings ({bookings.length})</h2>
          {bookings.length === 0 ? <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>No bookings yet</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead><tr style={{ borderBottom: '2px solid #e2e8f0' }}><th style={th}>ID</th><th style={th}>Patient</th><th style={th}>Test/Package</th><th style={th}>Date</th><th style={th}>Status</th></tr></thead>
                <tbody>{bookings.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={td}>{b.bookingId || b._id?.slice(-6)}</td><td style={td}>{b.patientName}</td><td style={td}>{b.testName || b.packageName || '—'}</td>
                    <td style={td}>{new Date(b.createdAt || b.date).toLocaleDateString('en-IN')}</td>
                    <td style={td}><span style={{ padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700, background: b.status === 'completed' ? '#dcfce7' : '#fef3c7', color: b.status === 'completed' ? '#166534' : '#92400e' }}>{b.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      );

      case 'corporate': return (
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>🏢 Corporate Health Plans</h2>
          <p style={{ color: '#64748b', marginBottom: 16 }}>Offer corporate diagnostic packages to companies.</p>
          <CorporatePlansTab providerType="diagnostics" providerId={providerId} token={token} />
        </div>
      );

      case 'upload': return (
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>📤 Excel Upload</h2>
          {uploadMessage && <div style={{ padding: 10, borderRadius: 6, marginBottom: 12, background: uploadMessage.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: uploadMessage.startsWith('✅') ? '#166534' : '#dc2626' }}>{uploadMessage}</div>}
          <div style={card}>
            <p style={{ marginBottom: 12, color: '#64748b' }}>Upload an Excel file with your tests. Format: name, category, price, home_collection (true/false), fasting_required (true/false), report_time (hours), sample_type</p>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelUpload} style={{ padding: 10, border: '2px dashed #d1d5db', borderRadius: 8, width: '100%', cursor: 'pointer' }} />
          </div>
        </div>
      );

      case 'profile': return (
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>🔬 Lab Profile</h2>
          {profile ? (
            <div style={card}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.9rem' }}>
                <div><strong>Name:</strong> {profile.provider_name || profile.name || 'N/A'}</div>
                <div><strong>Email:</strong> {profile.email || 'N/A'}</div>
                <div><strong>Phone:</strong> {profile.phone || 'N/A'}</div>
                <div><strong>City:</strong> {profile.city || 'N/A'}</div>
                <div><strong>NABL:</strong> {profile.is_nabl_accredited ? '✅ Yes' : '❌ No'}</div>
                <div><strong>Home Collection:</strong> {profile.is_home_collection_available ? '✅ Yes' : '❌ No'}</div>
                <div><strong>Status:</strong> <span style={{ padding: '2px 10px', borderRadius: 10, fontSize: '0.8rem', background: profile.is_active ? '#dcfce7' : '#fee2e2', color: profile.is_active ? '#166534' : '#dc2626' }}>{profile.is_active ? 'Active' : 'Inactive'}</span></div>
                <div><strong>Rating:</strong> ⭐ {profile.rating || 'N/A'}</div>
              </div>
            </div>
          ) : <p style={{ color: '#64748b' }}>Loading...</p>}
        </div>
      );

      case 'settings': return (
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>⚙️ Settings</h2>
          <div style={card}>
            <h3 style={{ color: '#dc2626', marginBottom: 8 }}>🗑️ Delete Account</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 12 }}>Permanent deletion. All data removed.</p>
            <button onClick={() => { if (window.confirm('Delete permanently?')) { handleLogout(); } }} style={btnDanger}>Delete Account</button>
          </div>
        </div>
      );

      default: return <div>Coming soon...</div>;
    }
  };

  return (
    <ProviderAuth providerType="diagnostics">
      <ProviderDashboardLayout title="Diagnostics Dashboard" icon="🔬" sidebarItems={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} userName={profile?.provider_name || profile?.name || 'Lab Admin'} userRole="Diagnostics Lab" logout={handleLogout}>
        {renderContent()}
      </ProviderDashboardLayout>
    </ProviderAuth>
  );
};

const th = { padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: '0.8rem', color: '#64748b' };
const td = { padding: '10px 12px', fontSize: '0.85rem' };

export default DiagnosticsDashboard;
