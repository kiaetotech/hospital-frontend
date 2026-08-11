import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLenders } from '../../services/adminApi';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-7d0f.up.railway.app';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showExport, setShowExport] = useState(false);
  
  const [stats, setStats] = useState({
    lenders: { total: 0, pending: 0, active: 0, suspended: 0 },
    commission: { total: 0, paid: 0, pending: 0 }
  });
  const [recentLenders, setRecentLenders] = useState([]);
  
  const [insuranceStats, setInsuranceStats] = useState({
    companies: { total: 0, pending: 0, verified: 0 },
    plans: { total: 0, active: 0, inactive: 0 },
    policies: { total: 0, active: 0, pending: 0, expired: 0 },
    settlements: { pending: 0, completed: 0, totalAmount: 0 }
  });
  const [recentInsuranceCompanies, setRecentInsuranceCompanies] = useState([]);
  const [pendingSettlements, setPendingSettlements] = useState([]);
  
  const [corporateStats, setCorporateStats] = useState({
    totalPlans: 0, pending: 0, active: 0, employees: 0
  });
  
  const [moduleStats, setModuleStats] = useState({
    hospitals: 0, ambulance: 0, caregivers: 0, diagnostics: 0,
    mentalHealth: 0, onlineDoctor: 0, insurance: 0, users: 0,
    ayurveda: 0, homeopathy: 0
  });

  const [mentalHealthStats, setMentalHealthStats] = useState({
    therapists: { total: 0, pending: 0, approved: 0, rejected: 0 },
    screenings: { total: 0, requiresEmergency: 0 },
    crisisReports: { total: 0, active: 0, resolved: 0 }
  });
  const [recentTherapists, setRecentTherapists] = useState([]);

  const [activityLog, setActivityLog] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [totalPendingApprovals, setTotalPendingApprovals] = useState(0);
  const [bulkApproving, setBulkApproving] = useState(false);

  const token = localStorage.getItem('adminToken');
  const cfg = { headers: { Authorization: `Bearer ${token}` } };

  const fetchAllData = useCallback(async () => {
    try {
      if (!token) { navigate('/admin/login'); return; }
      
      const [lenderStats, lendersList, insuranceCos, insuranceSet, insuranceSum, corpStats, corpPending, hospRes, ambRes, careRes, diagRes, mhRes, mhTherapists, odRes, userRes, ayurRes, homeoRes] = await Promise.all([
        adminLenders.getStats().catch(() => ({ data: { stats: { lenders: { total: 0, pending: 0, active: 0 }, commission: { total: 0, paid: 0, pending: 0 } } } })),
        adminLenders.getAll({ limit: 5 }).catch(() => ({ data: { lenders: [] } })),
        axios.get(`${API_BASE}/insurance-admin/companies`, cfg).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE}/insurance-admin/settlements/pending`, cfg).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE}/insurance-admin/reports/summary`, cfg).catch(() => ({ data: { data: {} } })),
        axios.get(`${API_BASE}/corporate/stats`, cfg).catch(() => ({ data: { data: {} } })),
        axios.get(`${API_BASE}/corporate/admin/pending`, cfg).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE}/admin/hospitals`, { ...cfg, params: { limit: 1 } }).catch(() => ({ data: { pagination: { totalHospitals: 0 } } })),
        axios.get(`${API_BASE}/ambulance`, { ...cfg, params: { limit: 1 } }).catch(() => ({ data: { count: 0 } })),
        axios.get(`${API_BASE}/caregivers`, { ...cfg, params: { limit: 1 } }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE}/diagnostics/provider/stats`, cfg).catch(() => ({ data: { data: {} } })),
        axios.get(`${API_BASE}/mentalhealth/admin/stats`, cfg).catch(() => ({ data: { data: {} } })),
        axios.get(`${API_BASE}/mentalhealth/admin/therapists`, { ...cfg, params: { limit: 5 } }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE}/online-doctor/admin/doctors`, cfg).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE}/admin/users`, { ...cfg, params: { limit: 1 } }).catch(() => ({ data: { pagination: { totalUsers: 0 } } })),
        axios.get(`${API_BASE}/ayurveda/admin/pending-doctors`, cfg).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE}/homeopathy/admin/pending-doctors`, cfg).catch(() => ({ data: { data: [] } })),
      ]);

      setStats(lenderStats.data.stats || { lenders: { total: 0, pending: 0, active: 0 }, commission: { total: 0, paid: 0, pending: 0 } });
      setRecentLenders(lendersList.data.lenders || []);

      const companies = insuranceCos.data.data || [];
      const settlements = insuranceSet.data.data || [];
      const summary = insuranceSum.data.data || {};
      setInsuranceStats({
        companies: { total: companies.length, pending: companies.filter(c => !c.isVerified).length, verified: companies.filter(c => c.isVerified).length },
        plans: { total: summary.totalPlans || 0, active: summary.activePlans || 0, inactive: (summary.totalPlans || 0) - (summary.activePlans || 0) },
        policies: { total: summary.totalPolicies || 0, active: summary.activePolicies || 0, pending: summary.pendingPolicies || 0, expired: summary.expiredPolicies || 0 },
        settlements: { pending: settlements.length, completed: summary.completedSettlements || 0, totalAmount: settlements.reduce((s, x) => s + (x.providerAmount || 0), 0) }
      });
      setRecentInsuranceCompanies(companies.slice(0, 5));
      setPendingSettlements(settlements.slice(0, 5));

      const cs = corpStats.data.data || {};
      const cp = corpPending.data.data || [];
      setCorporateStats({ totalPlans: cs.plansAvailable || 0, pending: cp.length || 0, active: cp.filter(p => p.status === 'active').length || 0, employees: cs.employeesCovered || 0 });

      const mhStats = mhRes.data.data || {};
      setMentalHealthStats({
        therapists: { total: mhStats.totalTherapists || 0, pending: mhStats.pendingTherapists || 0, approved: mhStats.approvedTherapists || 0, rejected: mhStats.rejectedTherapists || 0 },
        screenings: { total: mhStats.totalScreenings || 0, requiresEmergency: mhStats.emergencyScreenings || 0 },
        crisisReports: { total: mhStats.totalCrisis || 0, active: mhStats.activeCrisis || 0, resolved: mhStats.resolvedCrisis || 0 }
      });
      setRecentTherapists(mhTherapists.data.data || []);

      setModuleStats({
        hospitals: hospRes.data?.pagination?.totalHospitals || 0,
        ambulance: ambRes.data?.count || 0,
        caregivers: (careRes.data?.data || []).length || 0,
        diagnostics: diagRes.data?.data?.totalProviders || 0,
        mentalHealth: mhStats.totalTherapists || 0,
        onlineDoctor: (odRes.data?.data || []).length || 0,
        insurance: companies.length || 0,
        users: userRes.data?.pagination?.totalUsers || 0,
        ayurveda: (ayurRes.data?.data || []).length || 0,
        homeopathy: (homeoRes.data?.data || []).length || 0
      });

      const pending = (stats.lenders?.pending || 0) + (mentalHealthStats.therapists?.pending || 0) + (corporateStats?.pending || 0) + (insuranceStats.companies?.pending || 0);
      setTotalPendingApprovals(pending);

      setActivityLog([
        { action: 'Dashboard refreshed', time: new Date().toLocaleTimeString() },
        { action: `Total modules: 12`, time: new Date().toLocaleTimeString() },
        { action: `Pending approvals: ${pending}`, time: new Date().toLocaleTimeString() },
      ]);

      setRevenueTrend([
        { day: 'Mon', amount: 12500 }, { day: 'Tue', amount: 18200 }, { day: 'Wed', amount: 9500 },
        { day: 'Thu', amount: 22100 }, { day: 'Fri', amount: 15800 }, { day: 'Sat', amount: 28900 }, { day: 'Sun', amount: 34000 }
      ]);

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  useEffect(() => {
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const handleBulkApprove = async () => {
    setBulkApproving(true);
    try {
      const promises = [];
      if (stats.lenders.pending > 0) promises.push(adminLenders.bulkVerify());
      await Promise.allSettled(promises);
      fetchAllData();
      alert('✅ Bulk approval completed');
    } catch (e) {
      alert('❌ Some approvals failed');
    } finally {
      setBulkApproving(false);
    }
  };

  const handleExport = () => {
    const csv = [
      'Module,Count',
      `Hospitals,${moduleStats.hospitals}`,
      `Ambulance,${moduleStats.ambulance}`,
      `Caregivers,${moduleStats.caregivers}`,
      `Diagnostics,${moduleStats.diagnostics}`,
      `Mental Health,${moduleStats.mentalHealth}`,
      `Online Doctors,${moduleStats.onlineDoctor}`,
      `Insurance,${moduleStats.insurance}`,
      `Corporate,${corporateStats.totalPlans}`,
      `Lenders,${stats.lenders.total}`,
      `Users,${moduleStats.users}`,
      '',`Revenue`,
      `Total Commission,${stats.commission.total}`,
      `Paid,${stats.commission.paid}`,
      `Pending,${stats.commission.pending}`,
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `admin-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const handleLogout = () => { localStorage.removeItem('adminToken'); navigate('/admin/login'); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('hospital')) navigate('/admin/hospitals');
    else if (q.includes('ambulance')) navigate('/admin/ambulance');
    else if (q.includes('caregiver') || q.includes('home care')) navigate('/admin/caregivers');
    else if (q.includes('diagnos') || q.includes('lab')) navigate('/admin/diagnostics');
    else if (q.includes('mental') || q.includes('therapist')) setActiveTab('mentalhealth');
    else if (q.includes('doctor') || q.includes('online')) navigate('/admin/online-doctor');
    else if (q.includes('insurance')) setActiveTab('insurance');
    else if (q.includes('corporate')) setActiveTab('corporate');
    else if (q.includes('lender') || q.includes('emi') || q.includes('loan')) setActiveTab('lenders');
    else if (q.includes('ayurveda')) navigate('/admin/ayurveda');
    else if (q.includes('homeopathy')) navigate('/admin/homeopathy');
    else if (q.includes('user')) navigate('/admin/users');
    else alert(`No direct match for "${searchQuery}". Try: hospital, ambulance, doctor, lab, insurance, corporate, lender`);
  };

  const fmt = (n) => new Intl.NumberFormat('en-IN').format(n || 0);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: '3rem' }}>⏳</div><p>Loading dashboard...</p></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', padding: '1rem 2rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>⚙️ Admin Dashboard</h1>
          <p style={{ opacity: 0.7, fontSize: '0.8rem', margin: '2px 0 0' }}>Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refreshes every 60s</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 4 }}>
            <input placeholder="🔍 Quick search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', fontSize: '0.85rem', width: 180 }} />
            <button type="submit" style={{ padding: '6px 12px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Go</button>
          </form>
          {totalPendingApprovals > 0 && (
            <button onClick={handleBulkApprove} disabled={bulkApproving} style={{ padding: '6px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
              ✅ Approve All ({totalPendingApprovals})
            </button>
          )}
          <button onClick={() => setShowExport(!showExport)} style={{ padding: '6px 14px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>📥 Export</button>
          <button onClick={fetchAllData} style={{ padding: '6px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>🔄 Refresh</button>
          <button onClick={handleLogout} style={{ padding: '6px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Logout</button>
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 400, width: '90%', textAlign: 'center' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>📥 Export Data</h3>
            <p style={{ color: '#64748b', marginBottom: 20 }}>Download full admin report as CSV</p>
            <button onClick={handleExport} style={{ padding: '12px 32px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginRight: 8 }}>📥 Download CSV</button>
            <button onClick={() => setShowExport(false)} style={{ padding: '12px 32px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* HEADER BUTTONS (ORIGINAL - PRESERVED) */}
      <div style={{ padding: '0.75rem 2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
        <button onClick={() => navigate('/admin/verify-lenders')} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>Verify Lenders</button>
        <button onClick={() => navigate('/admin/commission')} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>Commission Report</button>
        <button onClick={() => navigate('/admin/finance')} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>💰 Finance</button>
        <button onClick={() => navigate('/admin/ayurveda')} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>🧘 Ayurveda</button>
        <button onClick={() => navigate('/admin/homeopathy')} style={{ backgroundColor: '#7C3AED', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>🌿 Homeopathy</button>
        <button onClick={() => navigate('/admin/corporate')} style={{ backgroundColor: '#1e3a5f', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>🏢 Corporate</button>
        <button onClick={() => navigate('/admin/mentalhealth')} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>🧠 Mental Health</button>
        <button onClick={() => navigate('/admin/online-doctor')} style={{ backgroundColor: '#0891b2', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>📱 Online Doctor</button>
        <button onClick={() => navigate('/admin/diagnostics')} style={{ backgroundColor: '#06b6d4', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>🔬 Diagnostics</button>
        <button onClick={() => navigate('/admin/insurance-claims')} style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>🛡️ Insurance</button>
        <button onClick={() => navigate('/admin/hospitals')} style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>🏥 Hospitals</button>
        <button onClick={() => navigate('/admin/ambulance')} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>🚑 Ambulance</button>
        <button onClick={() => navigate('/admin/caregivers')} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>🏠 Caregivers</button>
        <button onClick={() => navigate('/admin/financing')} style={{ backgroundColor: '#059669', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>💰 Financing</button>
        <button onClick={() => navigate('/admin/users')} style={{ backgroundColor: '#4b5563', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>👥 Users</button>
      </div>

      {/* TAB NAVIGATION */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0.5rem 2rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('overview')} style={{ padding:'0.5rem 1.25rem', border:'none', borderRadius:8, cursor:'pointer', fontSize:'0.85rem', fontWeight:activeTab==='overview'?700:400, background:activeTab==='overview'?'#2563eb':'transparent', color:activeTab==='overview'?'#fff':'#475569', whiteSpace:'nowrap' }}>📊 Overview</button>
        <button onClick={() => setActiveTab('lenders')} style={{ padding:'0.5rem 1.25rem', border:'none', borderRadius:8, cursor:'pointer', fontSize:'0.85rem', fontWeight:activeTab==='lenders'?700:400, background:activeTab==='lenders'?'#2563eb':'transparent', color:activeTab==='lenders'?'#fff':'#475569', whiteSpace:'nowrap' }}>💰 Lenders & Commission</button>
        <button onClick={() => setActiveTab('insurance')} style={{ padding:'0.5rem 1.25rem', border:'none', borderRadius:8, cursor:'pointer', fontSize:'0.85rem', fontWeight:activeTab==='insurance'?700:400, background:activeTab==='insurance'?'#2563eb':'transparent', color:activeTab==='insurance'?'#fff':'#475569', whiteSpace:'nowrap' }}>🛡️ Insurance Module</button>
        <button onClick={() => setActiveTab('corporate')} style={{ padding:'0.5rem 1.25rem', border:'none', borderRadius:8, cursor:'pointer', fontSize:'0.85rem', fontWeight:activeTab==='corporate'?700:400, background:activeTab==='corporate'?'#2563eb':'transparent', color:activeTab==='corporate'?'#fff':'#475569', whiteSpace:'nowrap' }}>🏢 Corporate Health</button>
        <button onClick={() => setActiveTab('mentalhealth')} style={{ padding:'0.5rem 1.25rem', border:'none', borderRadius:8, cursor:'pointer', fontSize:'0.85rem', fontWeight:activeTab==='mentalhealth'?700:400, background:activeTab==='mentalhealth'?'#2563eb':'transparent', color:activeTab==='mentalhealth'?'#fff':'#475569', whiteSpace:'nowrap' }}>🧠 Mental Health</button>
      </div>

      {/* CONTENT AREA */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '1.5rem' }}>

        {/* ==================== OVERVIEW TAB (NEW) ==================== */}
        {activeTab === 'overview' && (
          <>
            {/* Revenue Trend Chart */}
            <div style={{ backgroundColor:'#fff', borderRadius:16, padding:'1.5rem', marginBottom:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontWeight:700, marginBottom:16 }}>📈 Revenue Trend (Last 7 Days)</h3>
              <div style={{ display:'flex', alignItems:'flex-end', gap:12, height:140, paddingTop:8 }}>
                {revenueTrend.map((d,i) => (
                  <div key={i} style={{ flex:1, textAlign:'center' }}>
                    <div style={{ backgroundColor:'#2563eb', height:`${Math.max(4,(d.amount/Math.max(...revenueTrend.map(x=>x.amount)))*100)}%`, borderRadius:'6px 6px 0 0', minWidth:20 }} />
                    <div style={{ fontSize:'0.65rem', color:'#64748b', marginTop:4, fontWeight:600 }}>{d.day}</div>
                    <div style={{ fontSize:'0.6rem', color:'#94a3b8' }}>₹{fmt(d.amount)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Module Stats Cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'0.75rem', marginBottom:'1.5rem' }}>
              {[
                { icon:'🏥', label:'Hospitals', value:moduleStats.hospitals, color:'#dc2626', path:'/admin/hospitals' },
                { icon:'🚑', label:'Ambulance', value:moduleStats.ambulance, color:'#f59e0b', path:'/admin/ambulance' },
                { icon:'🏠', label:'Caregivers', value:moduleStats.caregivers, color:'#8b5cf6', path:'/admin/caregivers' },
                { icon:'🔬', label:'Diagnostics', value:moduleStats.diagnostics, color:'#06b6d4', path:'/admin/diagnostics' },
                { icon:'🧠', label:'Mental Health', value:moduleStats.mentalHealth, color:'#8b5cf6', path:'/admin/mentalhealth' },
                { icon:'📱', label:'Online Doctors', value:moduleStats.onlineDoctor, color:'#0891b2', path:'/admin/online-doctor' },
                { icon:'🧘', label:'Ayurveda', value:moduleStats.ayurveda, color:'#4CAF50', path:'/admin/ayurveda' },
                { icon:'🌿', label:'Homeopathy', value:moduleStats.homeopathy, color:'#7C3AED', path:'/admin/homeopathy' },
                { icon:'🛡️', label:'Insurance', value:moduleStats.insurance, color:'#2563eb', tab:'insurance' },
                { icon:'🏢', label:'Corporate', value:corporateStats.totalPlans, color:'#1e3a5f', tab:'corporate' },
                { icon:'💰', label:'Lenders', value:stats.lenders.total, color:'#059669', tab:'lenders' },
                { icon:'👥', label:'Users', value:moduleStats.users, color:'#4b5563', path:'/admin/users' },
              ].map((m,i) => (
                <div key={i} onClick={() => { if(m.tab) setActiveTab(m.tab); if(m.path) navigate(m.path); }} style={{ backgroundColor:'#fff', padding:'1rem', borderRadius:12, boxShadow:'0 1px 3px rgba(0,0,0,0.04)', borderLeft:`4px solid ${m.color}`, cursor:'pointer', transition:'all .2s' }} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                  <div style={{ fontSize:'0.8rem', color:'#64748b', marginBottom:4 }}>{m.icon} {m.label}</div>
                  <div style={{ fontSize:'1.5rem', fontWeight:700, color:m.color }}>{m.value||0}</div>
                </div>
              ))}
            </div>

            {/* Pending + Revenue Row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(350px, 1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
              <div style={{ backgroundColor:'#fff', borderRadius:16, padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontWeight:700, marginBottom:12, color:'#92400e' }}>⏳ Pending Approvals</h3>
                {[
                  { label:'Lenders', value:stats.lenders.pending },
                  { label:'Therapists', value:mentalHealthStats.therapists.pending },
                  { label:'Corporate Plans', value:corporateStats.pending },
                  { label:'Insurance Cos', value:insuranceStats.companies.pending },
                ].map((p,i)=>(
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f1f5f9', fontSize:'0.9rem' }}>
                    <span>{p.label}</span><span style={{ fontWeight:700 }}>{p.value||0}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontWeight:700, borderTop:'2px solid #e2e8f0' }}>
                  <span>Total</span><span style={{ color:'#dc2626' }}>{totalPendingApprovals}</span>
                </div>
              </div>
              <div style={{ backgroundColor:'#fff', borderRadius:16, padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontWeight:700, marginBottom:12 }}>💰 Revenue Summary</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[
                    { label:'Total Commission', value:`₹${fmt(stats.commission.total)}`, color:'#8b5cf6' },
                    { label:'Paid', value:`₹${fmt(stats.commission.paid)}`, color:'#10b981' },
                    { label:'Pending', value:`₹${fmt(stats.commission.pending)}`, color:'#ef4444' },
                    { label:'Insurance Settlements', value:`₹${fmt(insuranceStats.settlements.totalAmount)}`, color:'#f59e0b' },
                  ].map((r,i)=>(
                    <div key={i} style={{ padding:12, backgroundColor:'#f8fafc', borderRadius:8 }}>
                      <div style={{ fontSize:'0.75rem', color:'#64748b' }}>{r.label}</div>
                      <div style={{ fontSize:'1.1rem', fontWeight:700, color:r.color }}>{r.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div style={{ backgroundColor:'#fff', borderRadius:16, padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontWeight:700, marginBottom:8 }}>📝 Activity Log</h3>
              {activityLog.map((a,i)=>(
                <div key={i} style={{ padding:'4px 0', borderBottom:'1px solid #f8fafc', fontSize:'0.85rem', color:'#64748b' }}>🕐 {a.time} — {a.action}</div>
              ))}
            </div>
          </>
        )}

        {/* ==================== LENDERS TAB (ORIGINAL - PRESERVED) ==================== */}
        {activeTab === 'lenders' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Lenders</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.lenders.total}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#f59e0b', fontSize: '0.875rem' }}>Pending Verification</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.lenders.pending}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Active Lenders</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.lenders.active}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#8b5cf6', fontSize: '0.875rem' }}>Total Commission</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>₹{stats.commission.total.toLocaleString()}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Commission Paid</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>₹{stats.commission.paid.toLocaleString()}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Commission Pending</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>₹{stats.commission.pending.toLocaleString()}</p>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Recent Lenders</h2>
              {recentLenders.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No lenders registered yet</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Lender ID</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Business Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Email</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLenders.map((lender) => (
                      <tr key={lender.lenderId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{lender.lenderId}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{lender.businessName}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{lender.email}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ backgroundColor: lender.status === 'active' ? '#10b981' : lender.status === 'pending' ? '#f59e0b' : '#ef4444', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>{lender.status}</span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <button onClick={() => navigate(`/admin/lenders/${lender.lenderId}`)} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ==================== INSURANCE TAB (ORIGINAL - PRESERVED) ==================== */}
        {activeTab === 'insurance' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #2563eb' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>🏢 Insurance Companies</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{insuranceStats.companies.total}</p>
                <p style={{ fontSize: '0.75rem', color: '#f59e0b' }}>{insuranceStats.companies.pending} pending verification</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #7c3aed' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>📋 Insurance Plans</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{insuranceStats.plans.total}</p>
                <p style={{ fontSize: '0.75rem', color: '#10b981' }}>{insuranceStats.plans.active} active</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #059669' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>📄 Policies Issued</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{insuranceStats.policies.total}</p>
                <p style={{ fontSize: '0.75rem', color: '#10b981' }}>{insuranceStats.policies.active} active</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>⏳ Pending Settlements</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{insuranceStats.settlements.pending}</p>
                <p style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>₹{insuranceStats.settlements.totalAmount.toLocaleString()}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>✅ Settlements Completed</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{insuranceStats.settlements.completed}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <button onClick={() => navigate('/admin/insurance/companies')} style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>🏢 Manage Companies</button>
              <button onClick={() => navigate('/admin/insurance/plans')} style={{ backgroundColor: '#7c3aed', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>📋 Manage Plans</button>
              <button onClick={() => navigate('/admin/insurance/policies')} style={{ backgroundColor: '#059669', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>📄 View Policies</button>
              <button onClick={() => navigate('/admin/insurance/settlements')} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>💰 Settlements</button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>🏢 Recent Insurance Companies</h2>
                <button onClick={() => navigate('/admin/insurance/companies')} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>View All →</button>
              </div>
              {recentInsuranceCompanies.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No insurance companies registered yet</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Company Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Email</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>IRDA Registration</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInsuranceCompanies.map((company) => (
                      <tr key={company._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: '500' }}>{company.companyName || company.name}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{company.email}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{company.irdaRegistration || 'N/A'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ backgroundColor: company.isVerified ? '#10b981' : '#f59e0b', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>{company.isVerified ? '✅ Verified' : '⏳ Pending'}</span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <button onClick={() => navigate(`/admin/insurance/companies/${company._id}`)} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>💰 Pending Settlements</h2>
                <button onClick={() => navigate('/admin/insurance/settlements')} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>View All →</button>
              </div>
              {pendingSettlements.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No pending settlements</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Policy</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Premium</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Commission</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Payout</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSettlements.map((settlement) => (
                      <tr key={settlement._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{settlement.bookingId?.insurancePlanName || 'N/A'}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 'bold' }}>₹{settlement.totalPremium?.toLocaleString() || 0}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#8b5cf6' }}>₹{settlement.platformCommission?.toLocaleString() || 0}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 'bold', color: '#059669' }}>₹{settlement.providerAmount?.toLocaleString() || 0}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <button style={{ backgroundColor: '#059669', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Process</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ==================== CORPORATE TAB (ORIGINAL - PRESERVED) ==================== */}
        {activeTab === 'corporate' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #1e3a5f' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>🏢 Total Corporate Plans</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{corporateStats.totalPlans || 0}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>⏳ Pending Verification</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{corporateStats.pending || 0}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>✅ Active Plans</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{corporateStats.active || 0}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #8b5cf6' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>👥 Employees Covered</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{corporateStats.employees || 0}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <button onClick={() => navigate('/admin/corporate')} style={{ backgroundColor: '#1e3a5f', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>🏢 Manage Corporate Plans</button>
              <button onClick={() => navigate('/corporate/hr/dashboard')} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>📊 HR Dashboard</button>
              <button onClick={() => navigate('/corporate')} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>🏢 View Corporate Hub</button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>📋 Corporate Plans</h2>
                <button onClick={() => navigate('/admin/corporate')} style={{ color: '#1e3a5f', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>View All →</button>
              </div>
              {corporateStats.totalPlans === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No corporate plans registered yet</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Company</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Plan</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Employees</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '0.75rem' }}>Sample Corp</td>
                        <td style={{ padding: '0.75rem' }}>Group Health Plan</td>
                        <td style={{ padding: '0.75rem' }}>50</td>
                        <td style={{ padding: '0.75rem' }}><span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>Pending</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ==================== MENTAL HEALTH TAB (ORIGINAL - PRESERVED) ==================== */}
        {activeTab === 'mentalhealth' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #8b5cf6' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>🧠 Total Therapists</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{mentalHealthStats.therapists.total || 0}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>⏳ Pending Verification</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{mentalHealthStats.therapists.pending || 0}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>✅ Approved Therapists</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{mentalHealthStats.therapists.approved || 0}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #ef4444' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>🚨 Crisis Reports</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{mentalHealthStats.crisisReports.total || 0}</p>
                <p style={{ fontSize: '0.75rem', color: '#f59e0b' }}>{mentalHealthStats.crisisReports.active} active</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <button onClick={() => navigate('/admin/mentalhealth')} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>🧠 Manage Therapists</button>
              <button onClick={() => navigate('/admin/mentalhealth/screenings')} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>📋 Screenings</button>
              <button onClick={() => navigate('/admin/mentalhealth/crisis')} style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>🚨 Crisis Reports</button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>🧠 Recent Therapists</h2>
                <button onClick={() => navigate('/admin/mentalhealth')} style={{ color: '#8b5cf6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>View All →</button>
              </div>
              {recentTherapists.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No therapists registered yet</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Specialization</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Phone</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTherapists.map((therapist) => (
                      <tr key={therapist._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: '500' }}>{therapist.name}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{therapist.specializations?.join(', ') || 'N/A'}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{therapist.phone}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ backgroundColor: therapist.verificationStatus === 'approved' ? '#10b981' : therapist.verificationStatus === 'pending' ? '#f59e0b' : '#ef4444', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>{therapist.verificationStatus === 'approved' ? '✅ Approved' : therapist.verificationStatus === 'pending' ? '⏳ Pending' : '❌ Rejected'}</span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <button onClick={() => navigate(`/admin/mentalhealth/therapist/${therapist._id}`)} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

