import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminFinancing = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [lenders, setLenders] = useState([]);
  const [pendingLenders, setPendingLenders] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLender, setNewLender] = useState({
    businessName: '', email: '', phone: '', address: '',
    panNumber: '', gstNumber: '', maxLoanAmount: 0,
    interestRate: 0, tenure: 12, status: 'pending'
  });

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const res = await api.get('/lender/admin/stats');
        setStats(res.data?.data || {});
      } else if (tab === 'lenders') {
        const pendingRes = await api.get('/lender/admin/pending');
        setPendingLenders(pendingRes.data?.data || []);
        const allRes = await api.get('/lender');
        setLenders(allRes.data?.data || []);
      } else if (tab === 'applications') {
        const res = await api.get('/lender/admin/applications');
        setApplications(res.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      if (tab === 'dashboard') {
        setStats({ totalLenders: 3, pendingVerifications: 1, totalApplications: 8, approvedApplications: 3, totalDisbursed: 500000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyLender = async (id, status) => {
    try {
      await api.put(`/lender/admin/verify/${id}`, { status });
      alert(`Lender ${status}!`);
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const updateApplicationStatus = async (id, status) => {
    try {
      await api.put(`/lender/admin/applications/${id}`, { status });
      alert(`Application ${status}!`);
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const deleteLender = async (id) => {
    if (window.confirm('Are you sure you want to delete this lender?')) {
      try {
        await api.delete(`/lender/${id}`);
        alert('Lender deleted!');
        loadData();
      } catch (error) {
        alert('Failed: ' + error.message);
      }
    }
  };

  const handleAddLender = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lender', newLender);
      alert('Lender added successfully!');
      setShowAddModal(false);
      setNewLender({ businessName: '', email: '', phone: '', address: '', panNumber: '', gstNumber: '', maxLoanAmount: 0, interestRate: 0, tenure: 12, status: 'pending' });
      loadData();
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  const buttonStyles = {
    approve: { padding: '0.4rem 1rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
    reject: { padding: '0.4rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
    delete: { padding: '0.4rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', borderRadius: '1rem', padding: '2rem', color: 'white', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>💰 Financing Admin Panel</h1>
        <p style={{ opacity: 0.9 }}>Manage lenders, loan products, and applications</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'lenders', label: '🏦 Lenders' },
          { id: 'applications', label: '📋 Applications' },
          { id: 'reports', label: '📈 Reports' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '0.75rem 1.25rem', backgroundColor: tab === t.id ? '#10b981' : 'transparent', color: tab === t.id ? 'white' : '#1e293b', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>{t.label}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '3rem' }}><div style={{ fontSize: '2rem' }}>🔄</div><p>Loading...</p></div>}

      {tab === 'dashboard' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.3rem' }}>📊 Platform Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Lenders', value: stats.totalLenders || 0, color: '#10b981', icon: '🏦' },
              { label: 'Pending Verifications', value: stats.pendingVerifications || 0, color: '#ef4444', icon: '⏳' },
              { label: 'Total Applications', value: stats.totalApplications || 0, color: '#f59e0b', icon: '📋' },
              { label: 'Approved', value: stats.approvedApplications || 0, color: '#059669', icon: '✅' },
              { label: 'Disbursed', value: `₹${((stats.totalDisbursed || 0)).toLocaleString()}`, color: '#2563eb', icon: '💰' },
            ].map((stat, i) => (
              <div key={i} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: `4px solid ${stat.color}`, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{stat.label}</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>
          <button onClick={loadData} style={{ padding: '0.75rem 2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>🔄 Refresh</button>
        </div>
      )}

      {tab === 'lenders' && !loading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem' }}>🏦 Lenders ({lenders.length})</h2>
            <button onClick={() => setShowAddModal(true)} style={{ padding: '0.6rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>➕ Add Lender</button>
          </div>

          {pendingLenders.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#f59e0b' }}>⏳ Pending Verification ({pendingLenders.length})</h3>
              {pendingLenders.map(l => (
                <div key={l._id} style={{ backgroundColor: '#fffbeb', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem', border: '1px solid #fcd34d', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 'bold' }}>{l.businessName}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{l.email} | 📞 {l.phone}</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>💰 Max: ₹{l.maxLoanAmount?.toLocaleString()} | 📊 {l.interestRate}%</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={() => verifyLender(l._id, 'approved')} style={buttonStyles.approve}>✅ Approve</button>
                    <button onClick={() => verifyLender(l._id, 'rejected')} style={buttonStyles.reject}>❌ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {lenders.filter(l => l.status !== 'rejected').map(l => (
            <div key={l._id} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ fontWeight: 'bold' }}>{l.businessName}</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{l.email} | 📞 {l.phone}</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>💰 Max: ₹{l.maxLoanAmount?.toLocaleString()} | 📊 {l.interestRate}% | 📅 {l.tenure} months</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', backgroundColor: l.status === 'active' ? '#dcfce7' : '#fef3c7', color: l.status === 'active' ? '#166534' : '#92400e' }}>
                  {l.status === 'active' ? '🟢 Active' : '⏳ Pending'}
                </span>
                <button onClick={() => deleteLender(l._id)} style={buttonStyles.delete}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'applications' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem', marginBottom: '1.5rem' }}>📋 Loan Applications ({applications.length})</h2>
          {applications.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No applications</p>
          ) : (
            applications.map(a => (
              <div key={a._id} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 'bold' }}>{a.userId?.name || 'Unknown'}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>💰 ₹{a.amount?.toLocaleString()} | 📊 {a.interestRate}% | 📅 {a.tenure} months</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>🏦 {a.lenderId?.businessName || 'N/A'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', backgroundColor: a.status === 'approved' ? '#dcfce7' : a.status === 'pending' ? '#fef3c7' : '#fee2e2', color: a.status === 'approved' ? '#166534' : a.status === 'pending' ? '#92400e' : '#dc2626' }}>
                      {a.status === 'approved' ? '✅ Approved' : a.status === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                    </span>
                    {a.status === 'pending' && (
                      <>
                        <button onClick={() => updateApplicationStatus(a._id, 'approved')} style={buttonStyles.approve}>✅</button>
                        <button onClick={() => updateApplicationStatus(a._id, 'rejected')} style={buttonStyles.reject}>❌</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'reports' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem', marginBottom: '1rem' }}>📈 Financing Reports</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📅 Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Total Applications', value: stats.totalApplications || 0 },
                { label: 'Approved', value: stats.approvedApplications || 0 },
                { label: 'Disbursed', value: `₹${((stats.totalDisbursed || 0)).toLocaleString()}` },
                { label: 'Interest Earned', value: `₹${((stats.interestEarned || 0)).toLocaleString()}` },
              ].map((item, i) => (
                <div key={i} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{item.label}</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '500px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>➕ Add New Lender</h2>
            <form onSubmit={handleAddLender}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input type="text" placeholder="Business Name *" value={newLender.businessName} onChange={(e) => setNewLender({...newLender, businessName: e.target.value})} required style={inputStyle} />
                <input type="email" placeholder="Email *" value={newLender.email} onChange={(e) => setNewLender({...newLender, email: e.target.value})} required style={inputStyle} />
                <input type="tel" placeholder="Phone *" value={newLender.phone} onChange={(e) => setNewLender({...newLender, phone: e.target.value})} required style={inputStyle} />
                <input type="text" placeholder="Address" value={newLender.address} onChange={(e) => setNewLender({...newLender, address: e.target.value})} style={inputStyle} />
                <input type="text" placeholder="PAN Number" value={newLender.panNumber} onChange={(e) => setNewLender({...newLender, panNumber: e.target.value})} style={inputStyle} />
                <input type="text" placeholder="GST Number" value={newLender.gstNumber} onChange={(e) => setNewLender({...newLender, gstNumber: e.target.value})} style={inputStyle} />
                <input type="number" placeholder="Max Loan Amount (₹) *" value={newLender.maxLoanAmount} onChange={(e) => setNewLender({...newLender, maxLoanAmount: parseInt(e.target.value)})} required style={inputStyle} />
                <input type="number" placeholder="Interest Rate (%) *" value={newLender.interestRate} onChange={(e) => setNewLender({...newLender, interestRate: parseInt(e.target.value)})} required style={inputStyle} />
                <input type="number" placeholder="Tenure (months) *" value={newLender.tenure} onChange={(e) => setNewLender({...newLender, tenure: parseInt(e.target.value)})} required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ padding: '0.75rem 2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>✅ Add Lender</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.75rem 2rem', backgroundColor: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  padding: '0.6rem',
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  fontSize: '0.9rem',
  width: '100%',
  backgroundColor: 'white'
};

export default AdminFinancing;