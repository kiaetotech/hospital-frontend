import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AyurvedaAdminPanel = () => {
  const [tab, setTab] = useState('pending');
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [pendingCenters, setPendingCenters] = useState([]);
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [stats, setStats] = useState({});
  const [discounts, setDiscounts] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'pending') {
        const [docRes, centerRes] = await Promise.all([
          api.get('/ayurveda/admin/pending-doctors'),
          api.get('/ayurveda/admin/pending-centers')
        ]);
        setPendingDoctors(docRes.data?.data || []);
        setPendingCenters(centerRes.data?.data || []);
      } else if (tab === 'approved') {
        const res = await api.get('/ayurveda/admin/approved-doctors');
        setApprovedDoctors(res.data?.data || []);
      } else if (tab === 'stats') {
        const res = await api.get('/ayurveda/admin/stats');
        setStats(res.data?.data || {});
      } else if (tab === 'discounts') {
        const res = await api.get('/ayurveda/discounts');
        setDiscounts(res.data?.data || []);
      } else if (tab === 'commissions') {
        const res = await api.get('/ayurveda/admin/commissions');
        setCommissions(res.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyDoctor = async (id, status, reason = '') => {
    try {
      await api.put(`/ayurveda/admin/verify-doctor/${id}`, { 
        status, 
        rejectionReason: reason 
      });
      setShowRejectModal(null);
      setRejectionReason('');
      loadData();
      alert(`Doctor ${status} successfully!`);
    } catch (error) {
      alert('Failed to update: ' + error.message);
    }
  };

  const verifyCenter = async (id, status) => {
    try {
      await api.put(`/ayurveda/admin/verify-center/${id}`, { status });
      loadData();
      alert(`Center ${status} successfully!`);
    } catch (error) {
      alert('Failed to update: ' + error.message);
    }
  };

  const suspendDoctor = async (id) => {
    if (window.confirm('Are you sure you want to suspend this doctor?')) {
      try {
        await api.put(`/ayurveda/admin/verify-doctor/${id}`, { status: 'suspended' });
        loadData();
        alert('Doctor suspended!');
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const createDiscount = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      code: form.code.value,
      discountType: form.discountType.value,
      value: Number(form.value.value),
      maxDiscount: form.maxDiscount.value ? Number(form.maxDiscount.value) : undefined,
      minOrderAmount: form.minOrderAmount.value ? Number(form.minOrderAmount.value) : 0,
      applicableFor: Array.from(form.applicableFor.selectedOptions).map(o => o.value),
      validFrom: form.validFrom.value,
      validTill: form.validTill.value,
      newUsersOnly: form.newUsersOnly.checked,
      adminId: 'admin'
    };

    try {
      await api.post('/ayurveda/discounts', data);
      loadData();
      alert('✅ Discount created successfully!');
      form.reset();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const toggleDiscount = async (id, isActive) => {
    try {
      await api.put(`/ayurveda/discounts/${id}`, { isActive: !isActive });
      loadData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const triggerPayout = async () => {
    if (window.confirm('Process commission payouts to all doctors/centers?')) {
      try {
        await api.post('/ayurveda/admin/trigger-payouts');
        alert('Payouts processed!');
        loadData();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          🧘 Ayurveda Admin Panel
        </h1>
        <p style={{ opacity: 0.9 }}>
          Manage doctors, centers, verifications, discounts & commissions
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        backgroundColor: 'white',
        padding: '0.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        {[
          { id: 'pending', label: '⏳ Pending Verifications', icon: '⏳' },
          { id: 'approved', label: '✅ Approved Doctors', icon: '✅' },
          { id: 'stats', label: '📊 Statistics', icon: '📊' },
          { id: 'discounts', label: '🏷️ Discounts & Coupons', icon: '🏷️' },
          { id: 'commissions', label: '💰 Commissions & Payouts', icon: '💰' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: tab === t.id ? '#4CAF50' : 'transparent',
              color: tab === t.id ? 'white' : '#1e293b',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem' }}>🔄</div>
          <p>Loading...</p>
        </div>
      )}

      {/* ============================================ */}
      {/* PENDING VERIFICATIONS TAB */}
      {/* ============================================ */}
      {tab === 'pending' && !loading && (
        <div>
          {/* Pending Doctors */}
          <h2 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#e65100', fontSize: '1.3rem' }}>
            ⏳ Pending Doctor Verifications ({pendingDoctors.length})
          </h2>
          
          {pendingDoctors.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              backgroundColor: 'white',
              borderRadius: '1rem',
              marginBottom: '2rem',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <p>No pending doctor verifications!</p>
            </div>
          ) : (
            pendingDoctors.map(doctor => (
              <div key={doctor._id} style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1e293b' }}>
                      👨‍⚕️ {doctor.name}
                    </h3>
                    <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>{doctor.specialization}</p>
                    <p>📍 {doctor.address?.city}, {doctor.address?.state}</p>
                    <p>📞 {doctor.phone} | ✉️ {doctor.email}</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      🏥 {doctor.wellnessCenter?.name || 'No clinic info'}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      📋 AYUSH Reg: {doctor.ayushRegNo}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      🎓 {doctor.education} | 📅 {doctor.experience} years exp
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      💰 Consultation Fee: ₹{doctor.consultationFee}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      Registered: {new Date(doctor.createdAt).toLocaleDateString()}
                    </p>
                    
                    {/* Documents */}
                    {doctor.documents && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#1e293b' }}>📄 Documents:</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {doctor.documents.ayushCertificate && (
                            <a href={doctor.documents.ayushCertificate} target="_blank" rel="noreferrer"
                              style={{ fontSize: '0.75rem', color: '#2196F3', textDecoration: 'underline' }}>
                              AYUSH Cert
                            </a>
                          )}
                          {doctor.documents.idProof && (
                            <a href={doctor.documents.idProof} target="_blank" rel="noreferrer"
                              style={{ fontSize: '0.75rem', color: '#2196F3', textDecoration: 'underline' }}>
                              ID Proof
                            </a>
                          )}
                          {doctor.documents.degreeCertificate && (
                            <a href={doctor.documents.degreeCertificate} target="_blank" rel="noreferrer"
                              style={{ fontSize: '0.75rem', color: '#2196F3', textDecoration: 'underline' }}>
                              Degree
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      onClick={() => verifyDoctor(doctor._id, 'approved')}
                      style={{
                        padding: '0.75rem 2rem',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        minWidth: '150px'
                      }}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => setShowRejectModal(doctor._id)}
                      style={{
                        padding: '0.75rem 2rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>

                {/* Reject Modal */}
                {showRejectModal === doctor._id && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#fef2f2',
                    borderRadius: '0.5rem',
                    border: '1px solid #fecaca'
                  }}>
                    <p style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: '0.5rem' }}>
                      Reason for Rejection:
                    </p>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #e2e8f0',
                        minHeight: '60px',
                        marginBottom: '0.5rem'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => verifyDoctor(doctor._id, 'rejected', rejectionReason)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => { setShowRejectModal(null); setRejectionReason(''); }}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#e2e8f0',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Pending Centers */}
          <h2 style={{ fontWeight: 'bold', margin: '2rem 0 1rem', color: '#e65100', fontSize: '1.3rem' }}>
            🏨 Pending Center Verifications ({pendingCenters.length})
          </h2>
          
          {pendingCenters.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              backgroundColor: 'white',
              borderRadius: '1rem',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <p>No pending center verifications!</p>
            </div>
          ) : (
            pendingCenters.map(center => (
              <div key={center._id} style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontWeight: 'bold' }}>🏨 {center.name}</h3>
                    <p>📍 {center.address?.city}</p>
                    <p>📞 {center.phone}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => verifyCenter(center._id, 'approved')}
                      style={{ padding: '0.5rem 1.5rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                      ✅ Approve
                    </button>
                    <button onClick={() => verifyCenter(center._id, 'rejected')}
                      style={{ padding: '0.5rem 1.5rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                      ❌ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* APPROVED DOCTORS TAB */}
      {/* ============================================ */}
      {tab === 'approved' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#2E7D32', fontSize: '1.3rem' }}>
            ✅ Approved Doctors ({approvedDoctors.length})
          </h2>
          
          {approvedDoctors.map(doctor => (
            <div key={doctor._id} style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h3 style={{ fontWeight: 'bold' }}>👨‍⚕️ {doctor.name}</h3>
                <p style={{ color: '#4CAF50' }}>{doctor.specialization}</p>
                <p style={{ color: '#64748b' }}>⭐ {doctor.rating} | 📞 {doctor.phone}</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  💰 ₹{doctor.consultationFee} | Commission: {doctor.subscription?.commissionRate?.firstConsult || 15}%
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{
                  padding: '4px 12px',
                  backgroundColor: '#e8f5e9',
                  color: '#2E7D32',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {doctor.stats?.totalConsultations || 0} Consults
                </span>
                <button onClick={() => suspendDoctor(doctor._id)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#fff3e0',
                    color: '#e65100',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                  ⚠️ Suspend
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================ */}
      {/* STATISTICS TAB */}
      {/* ============================================ */}
      {tab === 'stats' && !loading && (
        <div>
          <h2 style={{ fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.3rem' }}>
            📊 Platform Statistics
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Doctors', value: stats.totalDoctors || 0, color: '#4CAF50', icon: '👨‍⚕️' },
              { label: 'Pending Verifications', value: stats.pendingVerifications || 0, color: '#FF9800', icon: '⏳' },
              { label: 'Total Centers', value: stats.totalCenters || 0, color: '#2196F3', icon: '🏨' },
              { label: 'Total Bookings', value: stats.totalBookings || 0, color: '#9C27B0', icon: '📋' },
              { label: 'Commission Earned', value: `₹${((stats.totalCommissionEarned || 0)).toLocaleString()}`, color: '#E91E63', icon: '💰' },
              { label: 'Active Discounts', value: stats.activeDiscounts || 0, color: '#00BCD4', icon: '🏷️' },
            ].map((stat, i) => (
              <div key={i} style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderTop: `4px solid ${stat.color}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{stat.label}</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>
          
          <button onClick={loadData} style={{
            padding: '0.75rem 2rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            🔄 Refresh Statistics
          </button>
        </div>
      )}

      {/* ============================================ */}
      {/* DISCOUNTS & COUPONS TAB */}
      {/* ============================================ */}
      {tab === 'discounts' && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          
          {/* Create Discount Form */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b', fontSize: '1.2rem' }}>
              🏷️ Create New Discount
            </h3>
            <form onSubmit={createDiscount}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input name="code" placeholder="Discount Code (e.g., AYUR50)" required 
                  style={inputStyle} maxLength={10} />
                
                <select name="discountType" required style={inputStyle}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
                
                <input name="value" type="number" placeholder="Value (e.g., 20 for 20%)" required style={inputStyle} />
                <input name="maxDiscount" type="number" placeholder="Max Discount Amount (optional)" style={inputStyle} />
                <input name="minOrderAmount" type="number" placeholder="Min Order Amount (optional)" style={inputStyle} />
                
                <select name="applicableFor" multiple required style={{...inputStyle, height: '80px'}}>
                  <option value="all">All Services</option>
                  <option value="doctor_consultation">Doctor Consultation</option>
                  <option value="panchakarma_package">Panchakarma Package</option>
                  <option value="home_therapy">Home Therapy</option>
                </select>
                
                <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Valid From:</label>
                <input name="validFrom" type="date" required style={inputStyle} />
                
                <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Valid Till:</label>
                <input name="validTill" type="date" required style={inputStyle} />
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <input name="newUsersOnly" type="checkbox" />
                  New Users Only
                </label>
                
                <button type="submit" style={{
                  padding: '0.75rem',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}>
                  ✅ Create Discount
                </button>
              </div>
            </form>
          </div>

          {/* Active Discounts List */}
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b', fontSize: '1.2rem' }}>
              📋 Active Discounts ({discounts.length})
            </h3>
            
            {discounts.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                backgroundColor: 'white',
                borderRadius: '1rem',
                color: '#64748b'
              }}>
                <p>No discounts created yet</p>
              </div>
            ) : (
              discounts.map(discount => (
                <div key={discount._id} style={{
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '0.75rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div>
                    <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#FF9800' }}>
                      {discount.code}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {discount.discountType === 'percentage' ? `${discount.value}% OFF` : `₹${discount.value} OFF`}
                      {discount.maxDiscount && ` (Max ₹${discount.maxDiscount})`}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      Valid: {new Date(discount.validFrom).toLocaleDateString()} - {new Date(discount.validTill).toLocaleDateString()}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      Used: {discount.usedCount || 0} {discount.usageLimit ? `/ ${discount.usageLimit}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleDiscount(discount._id, discount.isActive)}
                    style={{
                      padding: '0.4rem 1rem',
                      backgroundColor: discount.isActive ? '#e8f5e9' : '#fee2e2',
                      color: discount.isActive ? '#2E7D32' : '#dc2626',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}
                  >
                    {discount.isActive ? '🟢 Active' : '🔴 Inactive'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* COMMISSIONS & PAYOUTS TAB */}
      {/* ============================================ */}
      {tab === 'commissions' && !loading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.3rem' }}>
              💰 Commission & Payouts
            </h2>
            <button onClick={triggerPayout} style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}>
              💸 Process Payouts
            </button>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Commission Rules</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'First Consultation', rate: '15%' },
                { label: 'Repeat Consultation', rate: '5%' },
                { label: 'Panchakarma Package', rate: '20%' },
                { label: 'Home Therapy', rate: '15%' },
                { label: 'Medicine Order', rate: '10%' },
              ].map((rule, i) => (
                <div key={i} style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{rule.label}</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>{rule.rate}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Commissions Table */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflowX: 'auto'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Recent Transactions</h3>
            {commissions.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No transactions yet</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={thStyle}>Booking ID</th>
                    <th style={thStyle}>Patient</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Commission</th>
                    <th style={thStyle}>Provider Earning</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={tdStyle}>{c.bookingId}</td>
                      <td style={tdStyle}>{c.patient?.name}</td>
                      <td style={tdStyle}>{c.type}</td>
                      <td style={tdStyle}>₹{c.finalAmount}</td>
                      <td style={{...tdStyle, color: '#e65100'}}>₹{c.platformCommission}</td>
                      <td style={{...tdStyle, color: '#2E7D32'}}>₹{c.providerEarning}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          backgroundColor: c.commissionPayoutStatus === 'paid' ? '#e8f5e9' : '#fff3e0',
                          color: c.commissionPayoutStatus === 'paid' ? '#2E7D32' : '#e65100'
                        }}>
                          {c.commissionPayoutStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
  width: '100%'
};

const thStyle = {
  padding: '0.75rem',
  textAlign: 'left',
  fontWeight: 'bold',
  color: '#1e293b',
  borderBottom: '2px solid #e2e8f0'
};

const tdStyle = {
  padding: '0.75rem',
  color: '#475569'
};

export default AyurvedaAdminPanel;

