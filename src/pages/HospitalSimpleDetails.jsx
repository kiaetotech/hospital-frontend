import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const HospitalSimpleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [hospitalStatus, setHospitalStatus] = useState(null);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const res = await api.get(`/hospitals/${id}`);
        setHospital(res.data.data);
        fetchStatus();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHospital();
  }, [id]);

  const fetchStatus = async () => {
    try {
      const res = await api.get(`/hospital-status/${id}`);
      if (res.data?.data) setHospitalStatus(res.data.data);
    } catch(e) {}
  };

  const statusConfig = {
    accepting: { icon: '🟢', label: 'Accepting Patients', color: '#10b981', bg: '#d1fae5' },
    limited: { icon: '🟡', label: 'Limited Availability', color: '#f59e0b', bg: '#fef3c7' },
    full: { icon: '🔴', label: 'Currently Full', color: '#ef4444', bg: '#fee2e2' },
    unknown: { icon: '❓', label: 'Call to Confirm', color: '#6b7280', bg: '#f3f4f6' }
  };
  const cfg = statusConfig[hospitalStatus?.status] || statusConfig.unknown;
  const isStale = hospitalStatus?.isStale !== false;

  const schemeDisplayNames = {
    'ayushman': 'Ayushman Bharat (PM-JAY)', 'cghs': 'CGHS', 'esi': 'ESI',
    'echs': 'ECHS', 'state_scheme': 'State Health Scheme', 'pmjay': 'PM-JAY',
    'rsby': 'RSBY', 'senior_citizen': 'Senior Citizen', 'disability': 'Disability Scheme'
  };

  const handleBookOPD = (doctor = null) => {
    const url = doctor ? `/book-opd/${hospital._id}?doctor=${encodeURIComponent(doctor.name)}` : `/book-opd/${hospital._id}`;
    navigate(url);
  };

  const handleBookAdmission = () => navigate(`/book-admission/${hospital._id}`);
  const handleBookAmbulance = () => navigate('/ambulance');

  // Get ALL room types hospital has
  const getAllRoomTypes = () => {
    const p = hospital?.pricing || {};
    const rooms = [];
    const bedCategories = hospital?.beds?.categories || {};
    
    if (p.general_bed_per_day) rooms.push({ name: 'General Ward', price: p.general_bed_per_day, beds: bedCategories.general_ward?.available || hospital?.beds?.available || 0, ac: 'Non-AC' });
    if (p.semi_private_per_day) rooms.push({ name: 'Semi-Private', price: p.semi_private_per_day, beds: bedCategories.semi_private?.available || 0, ac: 'AC' });
    if (p.private_per_day) rooms.push({ name: 'Private Room', price: p.private_per_day, beds: bedCategories.private?.available || 0, ac: 'AC' });
    if (p.deluxe_per_day) rooms.push({ name: 'Deluxe Room', price: p.deluxe_per_day, beds: bedCategories.deluxe?.available || 0, ac: 'AC' });
    if (p.suite_per_day) rooms.push({ name: 'Suite', price: p.suite_per_day, beds: bedCategories.suite?.available || 0, ac: 'AC' });
    if (p.icu_bed_per_day) rooms.push({ name: 'ICU', price: p.icu_bed_per_day, beds: hospital?.beds?.icu_available || 0, ac: 'AC' });
    if (p.nicu_per_day) rooms.push({ name: 'NICU', price: p.nicu_per_day, beds: 0, ac: 'AC' });
    if (p.emergency_bed_per_day) rooms.push({ name: 'Emergency', price: p.emergency_bed_per_day, beds: hospital?.beds?.emergency_beds || 0, ac: 'N/A' });
    
    // Add any custom bed categories
    Object.entries(bedCategories).forEach(([key, val]) => {
      if (val.price_per_day && !rooms.find(r => r.name.toLowerCase().includes(key.replace('_',' ')))) {
        rooms.push({ name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), price: val.price_per_day, beds: val.available || 0, ac: 'N/A' });
      }
    });
    
    return rooms;
  };

  const roomTypes = getAllRoomTypes();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏥</div><p>Loading...</p></div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem', textAlign: 'center' }}>
        <p>Hospital not found</p>
        <button onClick={() => navigate('/hospitals')} style={{ marginTop: '1rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>Back</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '80px' }}>
      
      {/* HEADER */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#3b82f6', marginBottom: '0.5rem' }}>← Back</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{hospital.name}</h1>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                {(hospital.accreditations || []).map(acc => <span key={acc} style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 'bold' }}>{acc}</span>)}
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '4px 0' }}>📍 {hospital.address?.city}, {hospital.address?.state}</p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                <span>⭐ {hospital.ratings?.average || 'N/A'} ({hospital.ratings?.count || 0})</span>
                <span>👨‍⚕️ {hospital.doctors?.length || 0} Doctors</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <a href={`tel:${hospital.contact?.emergency_phone || hospital.contact?.phone || ''}`} style={{ padding: '0.5rem 1rem', backgroundColor: '#fef3c7', color: '#92400e', border: '2px solid #f59e0b', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem' }}>📞 Call</a>
              <button onClick={() => handleBookOPD()} style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>📋 Book OPD</button>
              <button onClick={handleBookAdmission} style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>🏥 Book Admission</button>
              <button onClick={handleBookAmbulance} style={{ padding: '0.5rem 1rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>🚑 Ambulance</button>
            </div>
          </div>
        </div>
        
        {/* TABS */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', gap: 0, overflowX: 'auto' }}>
          {[
            { id: 'overview', label: '📋 Overview' },
            { id: 'rooms', label: '🛏️ Rooms & Pricing' },
            { id: 'doctors', label: '👨‍⚕️ Doctors' },
            { id: 'facilities', label: '🏗️ Facilities' },
            { id: 'lab', label: '🧪 Lab Tests' },
            { id: 'packages', label: '📦 Packages' },
            { id: 'ambulance', label: '🚑 Ambulance' },
            { id: 'insurance', label: '🛡️ Insurance' },
            { id: 'reviews', label: '⭐ Reviews' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '0.75rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: activeTab === tab.id ? 'bold' : 'normal', color: activeTab === tab.id ? '#3b82f6' : '#6b7280', borderBottom: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            
            {/* Status Bar */}
            <div style={{ backgroundColor: isStale ? '#fef3c7' : cfg.bg, padding: '1rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontWeight: 'bold', color: isStale ? '#92400e' : cfg.color, fontSize: '1rem' }}>{isStale ? '⚠️ Status Unverified' : `${cfg.icon} ${cfg.label}`}</span>
              {hospitalStatus?.updatedAt && <span style={{ fontSize: '0.8rem', color: '#888' }}>Updated: {new Date(hospitalStatus.updatedAt).toLocaleString('en-IN')}</span>}
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div style={statCard}><div style={statIcon}>⭐</div><div style={statValue}>{hospital.ratings?.average || 'N/A'}</div><div style={statLabel}>Rating</div></div>
              <div style={statCard}><div style={statIcon}>🛏️</div><div style={statValue}>{hospital.beds?.available || 0}</div><div style={statLabel}>Beds Available</div></div>
              <div style={statCard}><div style={statIcon}>👨‍⚕️</div><div style={statValue}>{hospital.doctors?.length || 0}</div><div style={statLabel}>Doctors</div></div>
              <div style={statCard}><div style={statIcon}>💰</div><div style={statValue}>₹{hospital.pricing?.consultation || 0}</div><div style={statLabel}>OPD Fee</div></div>
              <div style={statCard}><div style={statIcon}>🏗️</div><div style={statValue}>{(hospital.facilities || []).length}</div><div style={statLabel}>Facilities</div></div>
            </div>

            {/* Contact */}
            <div style={sectionStyle}>
              <h3 style={sectionTitle}>📍 Contact & Location</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p><strong>Address:</strong><br />{hospital.address?.street || ''} {hospital.address?.city}, {hospital.address?.state} - {hospital.address?.pincode || ''}</p>
                  {hospital.address?.landmark && <p><strong>Landmark:</strong> {hospital.address.landmark}</p>}
                </div>
                <div>
                  <p><strong>📞 Phone:</strong> {hospital.contact?.phone || 'N/A'}</p>
                  {hospital.contact?.emergency_phone && <p><strong>🚨 Emergency:</strong> {hospital.contact.emergency_phone}</p>}
                  <p><strong>📧 Email:</strong> {hospital.contact?.email || 'N/A'}</p>
                  {hospital.contact?.website && <p><strong>🌐 Website:</strong> {hospital.contact.website}</p>}
                </div>
              </div>
            </div>

            {/* Diseases & Procedures */}
            <div style={sectionStyle}>
              <h3 style={sectionTitle}>🦠 Diseases & Procedures</h3>
              {(hospital.diseases_treated || []).length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {hospital.diseases_treated.map((d, i) => <span key={i} style={tag}>{d.replace(/_/g, ' ')}</span>)}
                </div>
              ) : <p style={{ color: '#888' }}>Not specified</p>}
              {(hospital.procedures_available || []).length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Procedures:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {hospital.procedures_available.map((p, i) => <span key={i} style={{ ...tag, backgroundColor: '#eff6ff', color: '#1e40af' }}>{p.replace(/_/g, ' ')}</span>)}
                  </div>
                </div>
              )}
            </div>

            {/* Featured Review */}
            {hospital.featured_review?.text && (
              <div style={sectionStyle}>
                <h3 style={sectionTitle}>💬 What Patients Say</h3>
                <p style={{ fontStyle: 'italic' }}>"{hospital.featured_review.text}"</p>
                <p style={{ color: '#888', fontSize: '0.85rem' }}>- {hospital.featured_review.author}</p>
              </div>
            )}
          </div>
        )}

        {/* ROOMS & PRICING */}
        {activeTab === 'rooms' && (
          <div style={sectionStyle}>
            <h3 style={sectionTitle}>🛏️ All Room Types & Pricing</h3>
            {roomTypes.length === 0 ? (
              <p style={{ color: '#888' }}>No room pricing available</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {roomTypes.map((room, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong>{room.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '8px' }}>{room.ac}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.1rem' }}>₹{room.price}/day</div>
                      {room.beds > 0 && <div style={{ fontSize: '0.75rem', color: '#888' }}>🛏️ {room.beds} beds</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {hospital.pricing?.online_booking_discount > 0 && (
              <p style={{ marginTop: '1rem', color: '#10b981', fontWeight: 'bold' }}>
                🎉 {hospital.pricing.online_booking_discount}% discount on online booking
              </p>
            )}
          </div>
        )}

        {/* DOCTORS */}
        {activeTab === 'doctors' && (
          <div>
            <h2 style={{ marginBottom: '1rem' }}>👨‍⚕️ All Doctors ({hospital.doctors?.length || 0})</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {(hospital.doctors || []).map((doc, idx) => (
                <div key={idx} style={sectionStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3>{doc.name}</h3>
                      <p style={{ color: '#3b82f6' }}>{doc.specialization}</p>
                      <p style={{ fontSize: '0.85rem' }}>📜 {doc.qualification || 'N/A'} • 📅 {doc.experience || 'N/A'}</p>
                      {(doc.languages || []).length > 0 && <p style={{ fontSize: '0.85rem' }}>🗣️ {doc.languages.join(', ')}</p>}
                      <span>⭐ {doc.rating || 'N/A'} ({doc.reviewCount || 0})</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>₹{doc.consultation_fee}</div>
                      <button onClick={() => handleBookOPD(doc)} style={{ marginTop: '0.5rem', padding: '0.5rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>Book Appointment</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FACILITIES */}
        {activeTab === 'facilities' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={sectionStyle}>
              <h3 style={sectionTitle}>🏗️ All Facilities</h3>
              {(hospital.facilities || []).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem' }}>
                  {(hospital.facilities || []).map((f, i) => (
                    <div key={i} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{typeof f === 'string' ? f : f.name}</span>
                      {typeof f !== 'string' && f.available_24x7 && <span style={{ color: '#10b981', fontSize: '0.75rem' }}>🟢 24x7</span>}
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: '#888' }}>No facilities listed</p>}
            </div>
            <div style={sectionStyle}>
              <h3 style={sectionTitle}>📊 Quick Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>🧪 Lab: {hospital.lab_tests_available ? '✅ In-house' : '🔗 Partner'}</div>
                <div>💊 Pharmacy: {hospital.pharmacy_24x7 ? '✅ 24x7' : hospital.in_house_pharmacy ? '✅ Available' : '❌'}</div>
                <div>🚑 Ambulance: {hospital.ambulance_available ? `✅ ${hospital.ambulance_count || ''} Vehicles` : '❌'}</div>
                <div>🚨 ER: {hospital.has24x7ER ? '✅ 24/7' : '❌'}</div>
                {hospital.trauma_center && <div>🏥 Trauma Center: ✅</div>}
                {hospital.stroke_ready && <div>🧠 Stroke Ready: ✅</div>}
                {hospital.cardiac_emergency && <div>❤️ Cardiac Emergency: ✅</div>}
              </div>
            </div>
          </div>
        )}

        {/* LAB TESTS */}
        {activeTab === 'lab' && (
          <div style={sectionStyle}>
            <h3 style={sectionTitle}>🧪 Lab Tests Available</h3>
            {(hospital.diagnostics?.tests || []).length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead><tr style={{ backgroundColor: '#f3f4f6' }}><th style={{ padding: '8px', textAlign: 'left' }}>Test Name</th><th style={{ padding: '8px' }}>Category</th><th style={{ padding: '8px' }}>Price</th><th style={{ padding: '8px' }}>Home Collection</th><th style={{ padding: '8px' }}>Report Time</th></tr></thead>
                <tbody>
                  {(hospital.diagnostics.tests || []).map((t, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '8px' }}><strong>{t.name}</strong></td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{t.category}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>₹{t.price}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{t.home_collection ? '✅' : '❌'}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{t.report_time}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: '#888' }}>No lab tests listed</p>}
          </div>
        )}

        {/* HEALTH PACKAGES */}
        {activeTab === 'packages' && (
          <div style={sectionStyle}>
            <h3 style={sectionTitle}>📦 Health Packages</h3>
            {(hospital.pricing?.health_packages || []).length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {(hospital.pricing.health_packages || []).map((pkg, i) => (
                  <div key={i} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                    <h4>{pkg.name}</h4>
                    <div style={{ margin: '0.5rem 0' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>₹{pkg.price || pkg.discounted_price}</span>
                      {pkg.original_price && <span style={{ textDecoration: 'line-through', color: '#888', marginLeft: '8px', fontSize: '0.85rem' }}>₹{pkg.original_price}</span>}
                      {pkg.discount > 0 && <span style={{ color: '#10b981', marginLeft: '8px', fontSize: '0.8rem' }}>({pkg.discount}% off)</span>}
                    </div>
                    {(pkg.includes || pkg.included_tests || []).length > 0 && (
                      <ul style={{ fontSize: '0.85rem', paddingLeft: '1.25rem' }}>
                        {(pkg.includes || pkg.included_tests || []).map((item, j) => <li key={j}>{item}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : <p style={{ color: '#888' }}>No packages available</p>}
          </div>
        )}

        {/* AMBULANCE FLEET */}
        {activeTab === 'ambulance' && (
          <div style={sectionStyle}>
            <h3 style={sectionTitle}>🚑 Ambulance Fleet</h3>
            {(hospital.ambulance_fleet || []).length > 0 ? (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {(hospital.ambulance_fleet || []).map((v, i) => (
                  <div key={i} style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong>{v.vehicle_number}</strong> - {v.type?.toUpperCase()}
                      <div style={{ fontSize: '0.85rem', color: '#888' }}>Driver: {v.driver_name} ({v.driver_phone})</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold' }}>₹{v.base_fare} + ₹{v.per_km}/km</div>
                      {v.available_24x7 && <span style={{ color: '#10b981', fontSize: '0.75rem' }}>🟢 24x7</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: '#888' }}>No ambulance fleet listed</p>}
          </div>
        )}

        {/* INSURANCE */}
        {activeTab === 'insurance' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={sectionStyle}>
              <h3 style={sectionTitle}>💠 Government Schemes</h3>
              {(hospital.schemes_accepted || []).length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(hospital.schemes_accepted || []).map((s, i) => <span key={i} style={{ ...tag, backgroundColor: '#f0fdf4', color: '#065f46' }}>✅ {schemeDisplayNames[s] || s}</span>)}
                </div>
              ) : <p style={{ color: '#888' }}>None</p>}
            </div>
            <div style={sectionStyle}>
              <h3 style={sectionTitle}>🛡️ Insurance Partners</h3>
              {(hospital.insurance_accepted || []).length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(hospital.insurance_accepted || []).map((ins, i) => <span key={i} style={{ ...tag, backgroundColor: '#eff6ff', color: '#1e40af' }}>{ins}</span>)}
                </div>
              ) : <p style={{ color: '#888' }}>None</p>}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <span>💳 Cashless: {hospital.cashless_available ? '✅' : '❌'}</span>
                <span>🏧 TPA Desk: {hospital.tpa_desk_available ? '✅' : '❌'}</span>
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === 'reviews' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={sectionStyle}>
              <h3 style={sectionTitle}>⭐ Rating Breakdown</h3>
              {hospital.ratings?.breakdown && (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {Object.entries(hospital.ratings.breakdown).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ width: '150px', textTransform: 'capitalize', fontSize: '0.85rem' }}>{key.replace(/_/g, ' ')}:</span>
                      <div style={{ flex: 1, height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}><div style={{ width: `${(value/5)*100}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: '4px' }} /></div>
                      <span style={{ fontWeight: 'bold' }}>{value}/5</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={sectionStyle}>
              <h3 style={sectionTitle}>💬 Patient Reviews ({(hospital.reviews || []).length})</h3>
              {(hospital.reviews || []).length > 0 ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {(hospital.reviews || []).slice(0, 10).map((r, i) => (
                    <div key={i} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{r.patientName}</strong><span>⭐ {r.rating}</span></div>
                      <p style={{ marginTop: '0.5rem' }}>{r.review}</p>
                      <p style={{ fontSize: '0.75rem', color: '#888' }}>{new Date(r.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: '#888' }}>No reviews yet</p>}
            </div>
          </div>
        )}

      </div>

      {/* MOBILE BOTTOM BAR */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #e5e7eb', padding: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', zIndex: 100 }}>
        <button onClick={() => handleBookOPD()} style={bottomBtn('#10b981')}>📋 Book OPD</button>
        <button onClick={handleBookAdmission} style={bottomBtn('#3b82f6')}>🏥 Admission</button>
        {hospital.has24x7ER && <a href={`tel:${hospital.contact?.emergency_phone || hospital.contact?.phone}`} style={{ ...bottomBtn('#ef4444'), textDecoration: 'none', flex: '0 0 auto', padding: '0.75rem' }}>🚨</a>}
      </div>
    </div>
  );
};

const statCard = { backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };
const statIcon = { fontSize: '1.5rem' };
const statValue = { fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0' };
const statLabel = { color: '#888', fontSize: '0.8rem' };
const sectionStyle = { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };
const sectionTitle = { marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 'bold' };
const tag = { padding: '4px 10px', backgroundColor: '#f3e8ff', color: '#5b21b6', borderRadius: '9999px', fontSize: '0.75rem' };
const bottomBtn = (bg) => ({ backgroundColor: bg, color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold', flex: 1, maxWidth: '200px', fontSize: '0.9rem' });

export default HospitalSimpleDetails;

