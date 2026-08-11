import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const CompareHospitals = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hospitalIds = location.state?.hospitalIds || [];
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState({});

  useEffect(() => {
    if (hospitalIds.length === 0) {
      navigate('/hospitals');
      return;
    }
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const promises = hospitalIds.map(id => api.get(`/hospitals/${id}`));
      const results = await Promise.all(promises);
      setHospitals(results.map(r => r.data.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getBestTag = (hospitals, idx) => {
    if (hospitals.length < 2) return '';
    const h = hospitals[idx];
    const others = hospitals.filter((_, i) => i !== idx);
    
    const lowestOPD = Math.min(...hospitals.map(h => h.pricing?.opd_general || h.pricing?.consultation || 99999));
    if ((h.pricing?.opd_general || h.pricing?.consultation || 0) === lowestOPD) return '💰 Lowest Fee';
    
    const mostBeds = Math.max(...hospitals.map(h => h.beds?.available || 0));
    if ((h.beds?.available || 0) === mostBeds && mostBeds > 0) return '🛏️ Most Beds';
    
    const highestRating = Math.max(...hospitals.map(h => h.ratings?.average || 0));
    if ((h.ratings?.average || 0) === highestRating && highestRating > 0) return '⭐ Top Rated';
    
    const mostDoctors = Math.max(...hospitals.map(h => (h.doctors || []).length));
    if ((h.doctors || []).length === mostDoctors && mostDoctors > 0) return '👨‍⚕️ Most Doctors';
    
    const hasCashless = h.cashless_available && others.some(o => !o.cashless_available);
    if (hasCashless) return '💳 Cashless';
    
    return '';
  };

  const handleBookOPD = (hospitalId, doctorName) => {
    const url = doctorName ? `/book-opd/${hospitalId}?doctor=${encodeURIComponent(doctorName)}` : `/book-opd/${hospitalId}`;
    navigate(url);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading comparison...</div>;
  if (hospitals.length === 0) return <div style={{ padding: '2rem', textAlign: 'center' }}>No hospitals to compare</div>;

  const pricingFields = [
    { key: 'opd_general', label: 'General Physician', category: '💰 OPD Consultation' },
    { key: 'opd_specialist', label: 'Specialist', category: '💰 OPD Consultation' },
    { key: 'opd_super_specialist', label: 'Super Specialist', category: '💰 OPD Consultation' },
    { key: 'opd_online', label: 'Online Consult', category: '💰 OPD Consultation' },
    { key: 'opd_follow_up', label: 'Follow-up', category: '💰 OPD Consultation' },
    { key: 'ipd_general_ward', label: 'General Ward', category: '🏥 Admission/Day' },
    { key: 'ipd_semi_private', label: 'Semi-Private', category: '🏥 Admission/Day' },
    { key: 'ipd_private_room', label: 'Private Room', category: '🏥 Admission/Day' },
    { key: 'ipd_deluxe', label: 'Deluxe', category: '🏥 Admission/Day' },
    { key: 'ipd_icu', label: 'ICU', category: '🏥 Admission/Day' },
    { key: 'ipd_icu_ventilator', label: 'ICU+Ventilator', category: '🏥 Admission/Day' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem' }}>← Back to Results</button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1.5rem' }}>⚖️ Compare Hospitals</h1>

        {/* COMPARISON TABLE */}
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={thStyle}>Feature</th>
                {hospitals.map((h, i) => (
                  <th key={i} style={{ ...thStyle, backgroundColor: '#f0fdf4', minWidth: '200px' }}>
                    <div style={{ fontSize: '1rem', color: '#1e3a8a' }}>{h.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'normal' }}>{h.address?.city}, {h.address?.state}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* RATING */}
              <tr style={trStyle}>
                <td style={tdLabelStyle}>⭐ Rating</td>
                {hospitals.map((h, i) => (
                  <td key={i} style={tdValueStyle}>
                    ⭐ {h.ratings?.average || 'N/A'} ({h.ratings?.count || 0})
                  </td>
                ))}
              </tr>

              {/* ACCREDITATION */}
              <tr style={trStyle}>
                <td style={tdLabelStyle}>🏅 Accreditation</td>
                {hospitals.map((h, i) => (
                  <td key={i} style={tdValueStyle}>
                    {(h.accreditations || []).length > 0 
                      ? (h.accreditations || []).map((a, j) => (
                          <span key={j} style={{ ...badgeStyle, margin: '2px' }}>
                            {typeof a === 'string' ? a : (a.issuing_body || a.name || 'Accredited')}
                          </span>
                        ))
                      : <span style={{ color: '#9ca3af' }}>None</span>}
                  </td>
                ))}
              </tr>

              {/* PRICING SECTIONS */}
              {[...new Set(pricingFields.map(f => f.category))].map(category => (
                <React.Fragment key={category}>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <td colSpan={hospitals.length + 1} style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: '0.9rem', color: '#374151' }}>
                      {category}
                    </td>
                  </tr>
                  {pricingFields.filter(f => f.category === category).map(field => (
                    <tr key={field.key} style={trStyle}>
                      <td style={tdLabelStyle}>{field.label}</td>
                      {hospitals.map((h, i) => {
                        const price = h.pricing?.[field.key];
                        const allPrices = hospitals.map(hh => hh.pricing?.[field.key] || Infinity);
                        const isLowest = price && price === Math.min(...allPrices);
                        return (
                          <td key={i} style={{ ...tdValueStyle, color: isLowest ? '#10b981' : '#374151', fontWeight: isLowest ? 'bold' : 'normal' }}>
                            {price ? `₹${price}` : <span style={{ color: '#d1d5db' }}>—</span>}
                            {isLowest && <span style={{ fontSize: '0.65rem', color: '#10b981', marginLeft: '4px' }}>Lowest</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              {/* BEDS */}
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <td colSpan={hospitals.length + 1} style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: '0.9rem', color: '#374151' }}>🛏️ Beds Status</td>
              </tr>
              {['available', 'icu_available', 'ventilator_available'].map(key => (
                <tr key={key} style={trStyle}>
                  <td style={tdLabelStyle}>{key === 'available' ? 'Available' : key === 'icu_available' ? 'ICU' : 'Ventilator'}</td>
                  {hospitals.map((h, i) => {
                    const val = h.beds?.[key] || 0;
                    return (
                      <td key={i} style={tdValueStyle}>
                        {val} {key === 'available' ? (val > 10 ? '🟢' : val > 0 ? '🟡' : '🔴') : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* DOCTORS */}
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <td colSpan={hospitals.length + 1} style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: '0.9rem', color: '#374151' }}>👨‍⚕️ Doctors</td>
              </tr>
              <tr style={trStyle}>
                <td style={tdLabelStyle}>Total Doctors</td>
                {hospitals.map((h, i) => (
                  <td key={i} style={tdValueStyle}>{(h.doctors || []).length}</td>
                ))}
              </tr>

              {/* SCHEMES */}
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <td colSpan={hospitals.length + 1} style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: '0.9rem', color: '#374151' }}>💠 Schemes</td>
              </tr>
              {['ayushman', 'cghs', 'esi', 'echs'].map(scheme => (
                <tr key={scheme} style={trStyle}>
                  <td style={tdLabelStyle}>{scheme.toUpperCase()}</td>
                  {hospitals.map((h, i) => (
                    <td key={i} style={tdValueStyle}>
                      {(h.schemes_accepted || []).includes(scheme) ? '✅' : '❌'}
                    </td>
                  ))}
                </tr>
              ))}

              {/* INSURANCE */}
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <td colSpan={hospitals.length + 1} style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: '0.9rem', color: '#374151' }}>🛡️ Insurance</td>
              </tr>
              <tr style={trStyle}>
                <td style={tdLabelStyle}>Cashless</td>
                {hospitals.map((h, i) => <td key={i} style={tdValueStyle}>{h.cashless_available ? '✅' : '❌'}</td>)}
              </tr>
              <tr style={trStyle}>
                <td style={tdLabelStyle}>TPA Desk</td>
                {hospitals.map((h, i) => <td key={i} style={tdValueStyle}>{h.tpa_desk_available ? '✅' : '❌'}</td>)}
              </tr>

              {/* FACILITIES */}
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <td colSpan={hospitals.length + 1} style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: '0.9rem', color: '#374151' }}>🔬 Facilities</td>
              </tr>
              <tr style={trStyle}>
                <td style={tdLabelStyle}>Lab Tests</td>
                {hospitals.map((h, i) => <td key={i} style={tdValueStyle}>{h.lab_tests_available ? '✅' : '❌'}</td>)}
              </tr>
              <tr style={trStyle}>
                <td style={tdLabelStyle}>24/7 ER</td>
                {hospitals.map((h, i) => <td key={i} style={tdValueStyle}>{h.has24x7ER ? '✅' : '❌'}</td>)}
              </tr>

              {/* BEST FOR */}
              <tr style={{ backgroundColor: '#fef3c7' }}>
                <td style={{ ...tdLabelStyle, fontWeight: 'bold' }}>🏆 Best For</td>
                {hospitals.map((h, i) => (
                  <td key={i} style={{ ...tdValueStyle, fontWeight: 'bold', color: '#92400e' }}>
                    {getBestTag(hospitals, i) || '—'}
                  </td>
                ))}
              </tr>

              {/* BOOK BUTTONS */}
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <td style={{ ...tdLabelStyle, fontWeight: 'bold' }}>📋 Quick Book</td>
                {hospitals.map((h, i) => (
                  <td key={i} style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <select 
                        onChange={(e) => setSelectedDoctor(prev => ({ ...prev, [h._id]: e.target.value }))}
                        value={selectedDoctor[h._id] || ''}
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem', width: '100%' }}
                      >
                        <option value="">Select Doctor</option>
                        {(h.doctors || []).map((d, j) => (
                          <option key={j} value={d.name}>Dr. {d.name} - ₹{d.consultation_fee}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => handleBookOPD(h._id, selectedDoctor[h._id])}
                        style={{ padding: '8px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                      >
                        📋 Book OPD
                      </button>
                      <button 
                        onClick={() => navigate(`/book-admission/${h._id}`)}
                        style={{ padding: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                      >
                        🏥 Book Admission
                      </button>
                      <a 
                        href={`tel:${h.contact?.phone || ''}`}
                        style={{ padding: '8px', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center' }}
                      >
                        📞 Call
                      </a>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const thStyle = { padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#f9fafb' };
const trStyle = { borderBottom: '1px solid #f3f4f6' };
const tdLabelStyle = { padding: '10px 16px', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap', backgroundColor: '#fafafa', width: '180px' };
const tdValueStyle = { padding: '10px 16px', textAlign: 'center' };
const badgeStyle = { backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 'bold', display: 'inline-block' };

export default CompareHospitals;
