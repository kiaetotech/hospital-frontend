import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-f1b1.up.railway.app';

const CorporateHRDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalEmployees: 0, activeEmployees: 0, walletBalance: 0,
    utilization: {}, recentBookings: [], planStatus: 'pending',
    planName: 'No active plan', departmentBreakdown: {},
    monthlySpend: [], wellnessScores: []
  });
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState('');

  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [empForm, setEmpForm] = useState({ name: '', email: '', phone: '', department: '', designation: '', employeeId: '' });

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [bulkService, setBulkService] = useState('');
  const [bulkProvider, setBulkProvider] = useState('');

  const token = localStorage.getItem('corporateToken') || localStorage.getItem('hrToken');
  const cfg = { headers: { Authorization: `Bearer ${token}` } };

  const loadAll = async () => {
    setLoading(true);
    try {
      if (!token) { navigate('/corporate/hr/login'); return; }
      const [dash, emp] = await Promise.all([
        axios.get(`${API_BASE}/api/corporate/hr/dashboard`, cfg),
        axios.get(`${API_BASE}/api/corporate/hr/employees`, cfg)
      ]);
      if (dash.data?.success) setStats(dash.data.data);
      if (emp.data?.success) setEmployees(emp.data.data);
    } catch (e) {
      if (e.response?.status === 401) { localStorage.clear(); navigate('/corporate/hr/login'); }
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const handleTopup = async () => {
    if (!topupAmount || topupAmount <= 0) return setMessage('❌ Enter a valid amount');
    try {
      const res = await axios.post(`${API_BASE}/api/corporate/hr/wallet/topup`, { amount: Number(topupAmount) }, cfg);
      if (res.data?.success) {
        setMessage(`✅ ₹${topupAmount} added to wallet`);
        setStats(prev => ({ ...prev, walletBalance: res.data.data.balance }));
        setShowTopup(false); setTopupAmount('');
      }
    } catch (e) { setMessage('❌ Top-up failed'); }
  };

  const handleAddEmployee = async () => {
    if (!empForm.name || !empForm.email || !empForm.phone) return setMessage('❌ Name, email and phone are required');
    try {
      await axios.post(`${API_BASE}/api/corporate/hr/employees`, { employees: [empForm] }, cfg);
      setMessage('✅ Employee added');
      setShowAddEmployee(false);
      setEmpForm({ name: '', email: '', phone: '', department: '', designation: '', employeeId: '' });
      loadAll();
    } catch (e) { setMessage('❌ ' + (e.response?.data?.message || 'Failed')); }
  };

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
  
  const badge = (s) => {
    const m = { active: '#dcfce7,#166534', pending: '#fef3c7,#92400e', cancelled: '#fee2e2,#dc2626', completed: '#dcfce7,#166534', confirmed: '#dbeafe,#1e40af' };
    const [bg, c] = (m[s] || '#f3f4f6,#374151').split(',');
    return <span style={{ padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', backgroundColor: bg, color: c, fontWeight: 'bold' }}>{s?.toUpperCase()}</span>;
  };

  const toggleSelect = (id) => setSelectedEmployees(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  
  const submitBulk = async () => {
    if (!bulkService || selectedEmployees.length === 0) return setMessage('❌ Select service and employees');
    try {
      await axios.post(`${API_BASE}/api/corporate/hr/bulk-book`, { employeeIds: selectedEmployees, serviceType: bulkService, providerId: bulkProvider }, cfg);
      setMessage(`✅ Bulk booking for ${selectedEmployees.length} employees`);
      setSelectedEmployees([]); loadAll();
    } catch (e) { setMessage('❌ ' + (e.response?.data?.message || 'Failed')); }
  };

  const downloadTemplate = () => {
    const csv = 'Name,Email,Phone,Department,Designation,Employee ID\nJohn Doe,john@company.com,9876543210,Engineering,Manager,EMP001\nJane Smith,jane@company.com,9876543211,HR,Director,EMP002';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'employee_template.csv'; a.click();
  };

  const handleBulkUpload = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const txt = await f.text();
    const lines = txt.split('\n').filter(l => l.trim());
    const heads = lines[0].split(',').map(h => h.trim().toLowerCase());
    const emps = lines.slice(1).map(l => {
      const vals = l.split(',').map(v => v.trim());
      const obj = {}; heads.forEach((h, i) => obj[h] = vals[i] || ''); return obj;
    }).filter(x => x.name && x.email);
    try {
      await axios.post(`${API_BASE}/api/corporate/hr/employees`, { employees: emps }, cfg);
      setMessage(`✅ ${emps.length} employees uploaded`); loadAll();
    } catch (err) { setMessage('❌ Upload failed'); }
  };

  if (loading) return <div style={styles.loader}><div style={{ fontSize: '3rem' }}>⏳</div><p>Loading dashboard…</p></div>;

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>🏢 HR Dashboard</h1>
          <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>{stats.planName} {badge(stats.planStatus)}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={styles.walletBadge}><span>💰</span>{fmt(stats.walletBalance)}</div>
          <button onClick={() => setShowTopup(true)} style={{ padding: '6px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>+ Top Up</button>
          <button onClick={() => { localStorage.clear(); navigate('/corporate'); }} style={styles.btnDanger}>Logout</button>
        </div>
      </div>

      <div style={styles.tabBar}>
        {['📊 Overview','👥 Employees','📤 Bulk Upload','🎯 Bulk Book','📋 Bookings','💰 Tax','📊 Reports'].map((t, i) => {
          const ids = ['dashboard','employees','bulk','bulkbook','bookings','tax','reports'];
          return <button key={ids[i]} onClick={() => setActiveTab(ids[i])} style={{ ...styles.tab, backgroundColor: activeTab === ids[i] ? '#2563eb' : 'transparent', color: activeTab === ids[i] ? '#fff' : '#374151', fontWeight: activeTab === ids[i] ? 700 : 400 }}>{t}</button>;
        })}
      </div>

      {message && <div style={{ ...styles.toast, backgroundColor: message.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: message.startsWith('✅') ? '#166534' : '#dc2626' }}>{message}<span onClick={() => setMessage('')} style={{ float: 'right', cursor: 'pointer' }}>×</span></div>}

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '1.5rem' }}>

        {activeTab === 'dashboard' && (
          <>
            <div style={styles.kpiGrid}>
              <KPI icon="👥" label="Total Employees" value={stats.totalEmployees} color="#2563eb" />
              <KPI icon="✅" label="Active" value={stats.activeEmployees} color="#10b981" />
              <KPI icon="💰" label="Wallet" value={fmt(stats.walletBalance)} color="#8b5cf6" />
              <KPI icon="📋" label="Bookings" value={stats.recentBookings?.length || 0} color="#f59e0b" />
            </div>
            <div style={styles.row2col}>
              <div style={styles.card}><h3 style={styles.cardTitle}>📊 Service Utilization</h3>{Object.keys(stats.utilization || {}).length === 0 ? <Empty text="No usage yet" /> : <div style={styles.chipGrid}>{Object.entries(stats.utilization).map(([k, v]) => <Chip key={k} label={k} value={v} />)}</div>}</div>
              <div style={styles.card}><h3 style={styles.cardTitle}>🏢 By Department</h3>{Object.keys(stats.departmentBreakdown || {}).length === 0 ? <Empty text="No data" /> : <div style={styles.chipGrid}>{Object.entries(stats.departmentBreakdown).map(([k, v]) => <Chip key={k} label={k} value={v} />)}</div>}</div>
            </div>
            <div style={styles.card}><div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 style={styles.cardTitle}>🕐 Recent Bookings</h3><button onClick={() => setActiveTab('bookings')} style={styles.link}>View All →</button></div>{stats.recentBookings?.length > 0 ? <Table data={stats.recentBookings.slice(0, 5)} cols={['employeeName','serviceType','amount','status']} fmt={fmt} badge={badge} /> : <Empty text="No bookings yet" />}</div>
          </>
        )}

        {activeTab === 'employees' && (
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <h2 style={{ fontWeight: 700 }}>👥 All Employees ({employees.length})</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowAddEmployee(!showAddEmployee)} style={styles.btnPrimary}>+ Add Employee</button>
                <button onClick={() => setActiveTab('bulk')} style={{ ...styles.btnPrimary, backgroundColor: '#6b7280' }}>📤 Bulk Upload</button>
              </div>
            </div>
            {showAddEmployee && (
              <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: 10, marginBottom: 16, border: '1px solid #e5e7eb' }}>
                <h4 style={{ fontWeight: 700, marginBottom: 12 }}>➕ Add New Employee</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <input placeholder="Full Name *" value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} style={styles.input} />
                  <input placeholder="Email *" value={empForm.email} onChange={e => setEmpForm({...empForm, email: e.target.value})} style={styles.input} />
                  <input placeholder="Phone *" value={empForm.phone} onChange={e => setEmpForm({...empForm, phone: e.target.value})} style={styles.input} />
                  <input placeholder="Department" value={empForm.department} onChange={e => setEmpForm({...empForm, department: e.target.value})} style={styles.input} />
                  <input placeholder="Designation" value={empForm.designation} onChange={e => setEmpForm({...empForm, designation: e.target.value})} style={styles.input} />
                  <input placeholder="Employee ID" value={empForm.employeeId} onChange={e => setEmpForm({...empForm, employeeId: e.target.value})} style={styles.input} />
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                  <button onClick={handleAddEmployee} style={styles.btnSuccess}>💾 Save Employee</button>
                  <button onClick={() => setShowAddEmployee(false)} style={{ ...styles.btnDanger, backgroundColor: '#6b7280' }}>Cancel</button>
                </div>
              </div>
            )}
            {employees.length === 0 ? <Empty text="No employees" /> : <Table data={employees} cols={['name','email','phone','department','designation']} statusCol="isActive" badge={badge} fmt={fmt} />}
          </div>
        )}

        {activeTab === 'bulk' && (
          <div style={styles.card}>
            <h2 style={{ fontWeight: 700, marginBottom: 8 }}>📤 Bulk Employee Upload</h2>
            <p style={{ color: '#6b7280', marginBottom: 12 }}>Download the template, fill employee details, and upload the CSV.</p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <button onClick={downloadTemplate} style={{ ...styles.btnPrimary, backgroundColor: '#6b7280' }}>📥 Download Template</button>
            </div>
            <p style={{ color: '#6b7280', marginBottom: 16, fontSize: '0.85rem' }}>CSV format: name, email, phone, department, designation, employeeId</p>
            <input type="file" accept=".csv" onChange={handleBulkUpload} style={{ padding: 10, border: '2px dashed #d1d5db', borderRadius: 10, width: '100%', cursor: 'pointer' }} />
          </div>
        )}

        {activeTab === 'bulkbook' && (
          <div style={styles.card}>
            <h2 style={{ fontWeight: 700, marginBottom: 8 }}>🎯 Bulk Booking</h2>
            <p style={{ color: '#6b7280', marginBottom: 16 }}>Select employees and book the same service for everyone</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <select value={bulkService} onChange={e => setBulkService(e.target.value)} style={styles.select}>
                <option value="">Select Service</option>
                <option value="online_consult">Online Doctor</option>
                <option value="lab_test">Lab Test</option>
                <option value="mental_wellness">Mental Wellness</option>
                <option value="ayurveda">Ayurveda</option>
                <option value="homeopathy">Homeopathy</option>
                <option value="health_checkup">Health Checkup</option>
              </select>
              <input placeholder="Provider ID (optional)" value={bulkProvider} onChange={e => setBulkProvider(e.target.value)} style={styles.input} />
              <button onClick={submitBulk} style={styles.btnPrimary}>Book for {selectedEmployees.length} employees</button>
            </div>
            {employees.length === 0 ? <Empty text="No employees" /> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead><tr style={{ borderBottom: '2px solid #e5e7eb' }}><th style={th}>Select</th><th style={th}>Name</th><th style={th}>Email</th><th style={th}>Department</th></tr></thead>
                  <tbody>{employees.map(e => (
                    <tr key={e._id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: selectedEmployees.includes(e._id) ? '#eff6ff' : 'transparent' }}>
                      <td style={td}><input type="checkbox" checked={selectedEmployees.includes(e._id)} onChange={() => toggleSelect(e._id)} /></td>
                      <td style={td}>{e.name}</td><td style={td}>{e.email}</td><td style={td}>{e.department || '-'}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div style={styles.card}><h2 style={{ fontWeight: 700, marginBottom: 16 }}>📋 Bookings & Usage</h2>{stats.recentBookings?.length > 0 ? <Table data={stats.recentBookings} cols={['employeeName','serviceType','providerName','amount','status']} fmt={fmt} badge={badge} dateCol="createdAt" /> : <Empty text="No bookings yet" />}</div>
        )}

        {activeTab === 'tax' && (
          <div style={styles.card}>
            <h2 style={{ fontWeight: 700, marginBottom: 16 }}>💰 Tax Savings Calculator</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, maxWidth: 400 }}>
              <div><label style={lbl}>Annual Premium (₹)</label><input id="prem" type="number" placeholder="15000" style={styles.input} /></div>
              <div><label style={lbl}>Tax Slab (%)</label><select id="slab" style={styles.select}><option value="5">5%</option><option value="10">10%</option><option value="20">20%</option><option value="30">30%</option></select></div>
            </div>
            <button onClick={() => { const p = +document.getElementById('prem').value; const s = +document.getElementById('slab').value; if (!p) return alert('Enter premium'); alert(`💰 Tax Savings: ₹${((p * s) / 100).toFixed(2)} per year`); }} style={styles.btnSuccess}>Calculate Savings</button>
          </div>
        )}

        {activeTab === 'reports' && (
          <div style={styles.card}>
            <h2 style={{ fontWeight: 700, marginBottom: 16 }}>📊 Reports & Exports</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {[{ icon: '👥', title: 'Employee Report', desc: 'Full employee list with status' },{ icon: '💰', title: 'Financial Summary', desc: 'Spend, wallet, utilization' },{ icon: '📋', title: 'Bookings Report', desc: 'All bookings with dates and amounts' },{ icon: '📈', title: 'Monthly Analytics', desc: 'Month-wise spend trends' }].map((r, i) => (
                <div key={i} style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '2rem' }}>{r.icon}</div>
                  <h4 style={{ fontWeight: 700, margin: '8px 0' }}>{r.title}</h4>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: 12 }}>{r.desc}</p>
                  <button onClick={() => setMessage('✅ Report download started')} style={styles.btnPrimary}>📥 Export</button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {showTopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, maxWidth: 420, width: '90%' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 6 }}>💰 Top Up Wallet</h3>
            <input type="number" placeholder="Enter amount" value={topupAmount} onChange={e => setTopupAmount(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: 10, fontSize: '1.1rem', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }} autoFocus />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleTopup} disabled={!topupAmount || topupAmount <= 0} style={{ flex: 1, padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', opacity: (!topupAmount || topupAmount <= 0) ? 0.6 : 1 }}>✅ Add Funds</button>
              <button onClick={() => { setShowTopup(false); setTopupAmount(''); }} style={{ flex: 1, padding: '12px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const KPI = ({ icon, label, value, color }) => (
  <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}` }}>
    <div style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: 6 }}>{icon} {label}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: 700, color }}>{value}</div>
  </div>
);

const Chip = ({ label, value }) => (
  <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 8, minWidth: 90 }}>
    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#2563eb' }}>{value}</div>
    <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'capitalize' }}>{label.replace(/([A-Z])/g, ' $1')}</div>
  </div>
);

const Empty = ({ text }) => <p style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>{text}</p>;

const Table = ({ data, cols, fmt, badge, dateCol, statusCol }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
      <thead><tr style={{ borderBottom: '2px solid #e5e7eb' }}>{cols.map(c => <th key={c} style={th}>{c.replace(/([A-Z])/g, ' $1').toUpperCase()}</th>)}</tr></thead>
      <tbody>{data.map((row, i) => (
        <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
          {cols.map(c => <td key={c} style={td}>{c === 'amount' ? fmt(row[c]||row.finalAmount||0) : c === 'status' ? badge(row[c]) : dateCol && c === dateCol ? new Date(row[c]).toLocaleDateString('en-IN') : statusCol && c === statusCol ? badge(row[c]?'active':'inactive') : row[c] || '-'}</td>)}
        </tr>
      ))}</tbody>
    </table>
  </div>
);

const th = { padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280', fontWeight: 700, whiteSpace: 'nowrap' };
const td = { padding: '0.75rem' };
const lbl = { fontWeight: 700, fontSize: '0.85rem', marginBottom: 4, display: 'block' };

const styles = {
  wrap: { minHeight: '100vh', backgroundColor: '#f3f4f6' },
  header: { background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '1.5rem 2rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  walletBadge: { padding: '0.5rem 1.25rem', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 6 },
  tabBar: { backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0.5rem 2rem', display: 'flex', gap: 4, flexWrap: 'wrap', overflowX: 'auto' },
  tab: { padding: '0.6rem 1.25rem', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  row2col: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '1.5rem' },
  cardTitle: { fontWeight: 700, marginBottom: '1rem' },
  chipGrid: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  btnPrimary: { padding: '0.6rem 1.25rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' },
  btnDanger: { padding: '0.5rem 1.25rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
  btnSuccess: { padding: '0.75rem 2rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
  link: { color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 },
  input: { width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' },
  select: { width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', backgroundColor: '#fff' },
  toast: { padding: '0.75rem 1.25rem', borderRadius: 10, marginBottom: '1rem', fontWeight: 500, maxWidth: 800, margin: '0 auto 1rem' },
  loader: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }
};

export default CorporateHRDashboard;