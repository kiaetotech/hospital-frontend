import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import CorporatePlansTab from '../../components/CorporatePlansTab';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [doctor, setDoctor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');
  const [respondTo, setRespondTo] = useState(null);
  const [responseText, setResponseText] = useState('');

  const token = localStorage.getItem('providerToken');
  const providerId = localStorage.getItem('providerId');

  useEffect(() => {
    if (!token || !providerId) {
      navigate('/homeopathy/doctor/login');
      return;
    }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [d, b, r, c, e, s] = await Promise.allSettled([
        api.get(`/homeopathy/doctors/${providerId}`),
        api.get(`/homeopathy/bookings/doctor/${providerId}`),
        api.get('/homeopathy/bookings/doctor/reviews'),
        api.get('/homeopathy/bookings/doctor/complaints'),
        api.get(`/homeopathy/settlements/earnings/homeopathy_doctor/${providerId}`),
        api.get(`/homeopathy/settlements/history/homeopathy_doctor/${providerId}`)
      ]);

      if (d.status === 'fulfilled') setDoctor(d.value.data?.data || d.value.data);
      if (b.status === 'fulfilled') setBookings(b.value.data?.data || []);
      if (r.status === 'fulfilled') setReviews(r.value.data?.data || []);
      if (c.status === 'fulfilled') setComplaints(c.value.data?.data || []);
      if (e.status === 'fulfilled') setEarnings(e.value.data?.data || null);
      if (s.status === 'fulfilled') setSettlements(s.value.data?.data || []);
    } catch (err) {
      console.error('Load error:', err);
      setMessage('Some data failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusAction = async (bookingId, action, extra = {}) => {
    setActionLoading(bookingId);
    try {
      await api.put(`/homeopathy/bookings/${bookingId}/status`, { action, ...extra });
      await loadAll();
      setMessage(`Booking ${action}ed successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Action failed');
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async () => {
    if (!doctor) return;
    const newStatus = doctor.currentStatus === 'online' ? 'offline' : 'online';
    try {
      await api.post('/homeopathy/doctor/toggle-availability-status', {
        doctorId: providerId,
        status: newStatus,
        consultationMode: doctor.currentConsultationMode || 'video'
      });
      setDoctor({ ...doctor, currentStatus: newStatus, isAvailable: newStatus === 'online' });
      setMessage(`You are now ${newStatus}`);
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setMessage('Failed to toggle status');
    }
  };

  const handleDoctorRespondToReview = async (bookingId) => {
    if (responseText.trim().length < 3) return;
    try {
      await api.put(`/homeopathy/bookings/${bookingId}/review/doctor-respond`, {
        response: responseText.trim()
      });
      setRespondTo(null);
      setResponseText('');
      await loadAll();
      setMessage('Response submitted');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setMessage('Failed to submit response');
    }
  };

  const handleDoctorRespondToComplaint = async (bookingId, complaintId) => {
    if (responseText.trim().length < 3) return;
    try {
      await api.put(
        `/homeopathy/bookings/${bookingId}/complaint/${complaintId}/doctor-respond`,
        { response: responseText.trim() }
      );
      setRespondTo(null);
      setResponseText('');
      await loadAll();
      setMessage('Response submitted');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setMessage('Failed to respond');
    }
  };

  const handleRequestSettlement = async () => {
    try {
      await api.post('/homeopathy/settlements/request', {
        providerType: 'homeopathy_doctor',
        providerId
      });
      await loadAll();
      setMessage('Settlement requested successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to request settlement');
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('providerToken');
    localStorage.removeItem('providerId');
    localStorage.removeItem('providerType');
    navigate('/homeopathy/doctor/login');
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading dashboard...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'bookings', label: `📋 Bookings (${bookings.length})` },
    { id: 'reviews', label: `⭐ Reviews (${reviews.length})` },
    { id: 'complaints', label: `🚨 Complaints (${complaints.length})` },
    { id: 'earnings', label: '💰 Earnings' },
    { id: 'corporate', label: '🏢 Corporate Plans' }
  ];

  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ color: '#7C3AED', margin: 0 }}>🌿 Welcome, {doctor?.name || 'Doctor'}</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            {doctor?.specialization} • {doctor?.address?.city}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={handleToggleStatus}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: doctor?.currentStatus === 'online' ? '#059669' : '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem'
            }}>
            {doctor?.currentStatus === 'online' ? '🟢 Online' : '⚫ Offline'}
          </button>
          <button
            onClick={handleLogout}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            Logout
          </button>
        </div>
      </div>

      {message && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ede9fe', borderRadius: '0.5rem', marginBottom: '1rem', color: '#7C3AED', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1.1rem',
              backgroundColor: activeTab === tab.id ? '#7C3AED' : '#f3f4f6',
              color: activeTab === tab.id ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Consultations', value: doctor?.stats?.totalConsultations || 0, color: '#7C3AED' },
              { label: 'Total Earnings', value: `₹${earnings?.totalEarnings || 0}`, color: '#059669' },
              { label: 'Rating', value: doctor?.rating ? `⭐ ${doctor.rating}` : 'New', color: '#f59e0b' },
              { label: 'Pending Payout', value: `₹${earnings?.pendingPayout || 0}`, color: '#dc2626' }
            ].map((s, i) => (
              <div key={i} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', borderTop: `4px solid ${s.color}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>{s.value}</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 'bold', margin: 0 }}>Recent Bookings</h3>
            <button onClick={() => setActiveTab('bookings')} style={{ background: 'none', border: 'none', color: '#7C3AED', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
              View All →
            </button>
          </div>
          {bookings.length === 0 ? (
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <p style={{ color: '#64748b' }}>No bookings yet.</p>
            </div>
          ) : (
            <BookingsTable
              bookings={bookings.slice(0, 5)}
              onAction={handleStatusAction}
              actionLoading={actionLoading}
            />
          )}
        </>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <Pill label={`${bookings.length} Total`} color="#7C3AED" />
            <Pill label={`${pendingBookings} Pending`} color="#f59e0b" />
            <Pill label={`${completedBookings} Completed`} color="#059669" />
          </div>
          {bookings.length === 0 ? (
            <Empty message="No bookings yet." />
          ) : (
            <BookingsTable
              bookings={bookings}
              onAction={handleStatusAction}
              actionLoading={actionLoading}
            />
          )}
        </>
      )}

      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <>
          {reviews.length === 0 ? (
            <Empty message="No reviews yet." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reviews.map((r, i) => (
                <div key={i} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>{r.patientName}</p>
                      <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.15rem 0 0' }}>Booking {r.bookingId}</p>
                    </div>
                    <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>⭐ {r.rating}/5</span>
                  </div>
                  <p style={{ color: '#334155', fontSize: '0.9rem', margin: '0.5rem 0' }}>{r.comment}</p>
                  {r.doctorResponse ? (
                    <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
                      <p style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 'bold', margin: 0 }}>Your response:</p>
                      <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0.25rem 0 0' }}>{r.doctorResponse}</p>
                    </div>
                  ) : (
                    <>
                      {respondTo === `r-${r.bookingId}` ? (
                        <div style={{ marginTop: '0.75rem' }}>
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Write your response..."
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }}
                            rows={3}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button
                              onClick={() => handleDoctorRespondToReview(r.bookingId)}
                              style={{ padding: '0.5rem 1rem', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                              Submit
                            </button>
                            <button
                              onClick={() => { setRespondTo(null); setResponseText(''); }}
                              style={{ padding: '0.5rem 1rem', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setRespondTo(`r-${r.bookingId}`); setResponseText(''); }}
                          style={{ padding: '0.4rem 0.9rem', backgroundColor: '#ede9fe', color: '#7C3AED', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                          Respond
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* COMPLAINTS TAB */}
      {activeTab === 'complaints' && (
        <>
          {complaints.length === 0 ? (
            <Empty message="No complaints. 🎉" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {complaints.map((c, i) => (
                <div key={i} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>{c.patientName} • {c.category}</p>
                      <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.15rem 0 0' }}>Booking {c.bookingId}</p>
                    </div>
                    <PriorityBadge priority={c.priority} status={c.status} />
                  </div>
                  <p style={{ color: '#334155', fontSize: '0.9rem', margin: '0.5rem 0' }}>{c.description}</p>
                  {c.adminResponse && (
                    <div style={{ backgroundColor: '#fef3c7', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
                      <p style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 'bold', margin: 0 }}>Admin response:</p>
                      <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0.25rem 0 0' }}>{c.adminResponse}</p>
                    </div>
                  )}
                  {c.doctorResponse ? (
                    <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
                      <p style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 'bold', margin: 0 }}>Your response:</p>
                      <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0.25rem 0 0' }}>{c.doctorResponse}</p>
                    </div>
                  ) : (
                    <>
                      {respondTo === `c-${c.complaintId}` ? (
                        <div style={{ marginTop: '0.75rem' }}>
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Write your response..."
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }}
                            rows={3}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button
                              onClick={() => handleDoctorRespondToComplaint(c.bookingId, c.complaintId)}
                              style={{ padding: '0.5rem 1rem', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                              Submit
                            </button>
                            <button
                              onClick={() => { setRespondTo(null); setResponseText(''); }}
                              style={{ padding: '0.5rem 1rem', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setRespondTo(`c-${c.complaintId}`); setResponseText(''); }}
                          style={{ padding: '0.4rem 0.9rem', backgroundColor: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                          Respond
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* EARNINGS TAB */}
      {activeTab === 'earnings' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <KpiCard label="Total Earnings" value={`₹${earnings?.totalEarnings || 0}`} color="#059669" />
            <KpiCard label="Pending Payout" value={`₹${earnings?.pendingPayout || 0}`} color="#f59e0b" />
            <KpiCard label="Commission Paid" value={`₹${earnings?.totalCommission || 0}`} color="#dc2626" />
            <KpiCard label="Total Bookings" value={earnings?.totalBookings || 0} color="#7C3AED" />
          </div>

          {earnings?.pendingPayout > 0 && (
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <p style={{ fontWeight: 'bold', margin: 0, color: '#059669' }}>₹{earnings.pendingPayout} ready to settle</p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0' }}>Request a payout to your registered bank account</p>
              </div>
              <button
                onClick={handleRequestSettlement}
                style={{ padding: '0.6rem 1.25rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Request Settlement
              </button>
            </div>
          )}

          <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Settlement History</h3>
          {settlements.length === 0 ? (
            <Empty message="No settlements yet." />
          ) : (
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    {['Payout ID', 'Amount', 'TDS', 'Net', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {settlements.map(s => (
                    <tr key={s._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem' }}>{s.payoutId}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem' }}>₹{s.amount}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem', color: '#dc2626' }}>₹{s.tdsDeducted || 0}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#059669' }}>₹{s.netAmount}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}><StatusBadge status={s.status} /></td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', color: '#64748b' }}>{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* CORPORATE TAB */}
      {activeTab === 'corporate' && (
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>🏢 Corporate Plans</h2>
          <p style={{ color: '#64748b', marginBottom: 16 }}>Offer corporate homeopathy wellness packages to companies.</p>
          <CorporatePlansTab providerType="homeopathy" providerId={providerId} token={token} />
        </div>
      )}
    </div>
  );
};

// ============================================
// SUBCOMPONENTS
// ============================================

const BookingsTable = ({ bookings, onAction, actionLoading }) => (
  <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
      <thead>
        <tr style={{ backgroundColor: '#f8fafc' }}>
          {['Booking ID', 'Patient', 'Date', 'Slot', 'Fee', 'Your Earning', 'Status', 'Actions'].map(h => (
            <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bookings.map(b => (
          <tr key={b._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
            <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', fontWeight: 'bold' }}>{b.bookingId}</td>
            <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem' }}>{b.patient?.name || '—'}</td>
            <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem' }}>{b.bookingDate ? new Date(b.bookingDate).toLocaleDateString('en-IN') : '—'}</td>
            <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem' }}>{b.slotTime || '—'}</td>
            <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem' }}>₹{b.amount}</td>
            <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem', color: '#059669', fontWeight: 'bold' }}>₹{b.providerEarning}</td>
            <td style={{ padding: '0.6rem 0.75rem' }}><BookingStatusBadge status={b.status} /></td>
            <td style={{ padding: '0.6rem 0.75rem' }}>
              <BookingActions booking={b} onAction={onAction} loading={actionLoading === b.bookingId} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const BookingActions = ({ booking, onAction, loading }) => {
  if (booking.status === 'pending' && booking.paymentStatus === 'paid') {
    return (
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <MiniBtn color="#059669" disabled={loading} onClick={() => onAction(booking.bookingId, 'accept')}>Accept</MiniBtn>
        <MiniBtn color="#dc2626" disabled={loading} onClick={() => onAction(booking.bookingId, 'reject', { reason: 'Not available' })}>Reject</MiniBtn>
      </div>
    );
  }
  if (booking.status === 'confirmed') {
    return (
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <MiniBtn color="#7C3AED" disabled={loading} onClick={() => onAction(booking.bookingId, 'start')}>Start</MiniBtn>
        <MiniBtn color="#64748b" disabled={loading} onClick={() => onAction(booking.bookingId, 'no_show')}>No-show</MiniBtn>
      </div>
    );
  }
  if (booking.status === 'in_progress') {
    return <MiniBtn color="#059669" disabled={loading} onClick={() => onAction(booking.bookingId, 'complete')}>Complete</MiniBtn>;
  }
  return <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>—</span>;
};

const MiniBtn = ({ color, onClick, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: '0.35rem 0.7rem',
      backgroundColor: color,
      color: 'white',
      border: 'none',
      borderRadius: '0.35rem',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      opacity: disabled ? 0.5 : 1
    }}>
    {children}
  </button>
);

const BookingStatusBadge = ({ status }) => {
  const colors = {
    pending: { bg: '#fef3c7', color: '#92400e' },
    confirmed: { bg: '#dbeafe', color: '#1e40af' },
    in_progress: { bg: '#ede9fe', color: '#5b21b6' },
    completed: { bg: '#ecfdf5', color: '#059669' },
    cancelled: { bg: '#fee2e2', color: '#991b1b' },
    no_show: { bg: '#f3f4f6', color: '#6b7280' },
    rescheduled: { bg: '#fef3c7', color: '#92400e' }
  };
  const s = colors[status] || colors.pending;
  return (
    <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: s.bg, color: s.color, fontSize: '0.7rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
      {status.replace('_', ' ')}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    pending: { bg: '#fef3c7', color: '#92400e' },
    requested: { bg: '#dbeafe', color: '#1e40af' },
    approved: { bg: '#ede9fe', color: '#5b21b6' },
    paid: { bg: '#ecfdf5', color: '#059669' },
    rejected: { bg: '#fee2e2', color: '#991b1b' },
    processing: { bg: '#fef3c7', color: '#92400e' }
  };
  const s = colors[status] || colors.pending;
  return (
    <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: s.bg, color: s.color, fontSize: '0.7rem', fontWeight: 'bold' }}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority, status }) => (
  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
    <span style={{
      padding: '2px 8px',
      borderRadius: '10px',
      backgroundColor: priority === 'critical' ? '#fee2e2' : priority === 'high' ? '#fef3c7' : '#f3f4f6',
      color: priority === 'critical' ? '#991b1b' : priority === 'high' ? '#92400e' : '#374151',
      fontSize: '0.7rem',
      fontWeight: 'bold'
    }}>
      {priority}
    </span>
    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{status.replace('_', ' ')}</span>
  </div>
);

const KpiCard = ({ label, value, color }) => (
  <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', borderTop: `4px solid ${color}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
    <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>{value}</p>
    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{label}</p>
  </div>
);

const Pill = ({ label, color }) => (
  <span style={{ padding: '0.3rem 0.8rem', backgroundColor: color, color: 'white', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
    {label}
  </span>
);

const Empty = ({ message }) => (
  <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
    <p style={{ color: '#64748b', margin: 0 }}>{message}</p>
  </div>
);

export default DoctorDashboard;