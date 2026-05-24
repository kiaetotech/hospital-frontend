import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const HospitalsList = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [disease, setDisease] = useState('');
  const [insurance, setInsurance] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [bedRequired, setBedRequired] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHospitals, setTotalHospitals] = useState(0);
  const [expandedInsurance, setExpandedInsurance] = useState(null);
  const [expandedDoctors, setExpandedDoctors] = useState(null);

  const limit = 5; // Hospitals per page

  useEffect(() => {
    fetchHospitals();
  }, [city, disease, insurance, sortBy, bedRequired, page]);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (disease) params.append('disease', disease);
      if (insurance) params.append('insurance', insurance);
      if (sortBy) params.append('sort_by', sortBy);
      if (bedRequired) params.append('bed_required', 'true');
      params.append('page', page);
      params.append('limit', limit);
      
      const res = await api.get(`/hospitals/search?${params.toString()}`);
      setHospitals(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotalHospitals(res.data.pagination?.totalHospitals || 0);
    } catch (error) {
      console.error('Error:', error);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHospitals();
  };

  const getSubscriptionBadge = (hospital) => {
    const plan = hospital.subscription_plan || 'free';
    const badges = {
      platinum: { text: 'Platinum Partner', color: '#fbbf24', icon: '🏆', bg: '#fef3c7' },
      gold: { text: 'Gold Partner', color: '#eab308', icon: '⭐', bg: '#fef9c3' },
      silver: { text: 'Silver Partner', color: '#94a3b8', icon: '💎', bg: '#f1f5f9' },
      featured: { text: 'Featured', color: '#3b82f6', icon: '📌', bg: '#dbeafe' },
      free: { text: 'Standard', color: '#6b7280', icon: '🟢', bg: '#f3f4f6' }
    };
    return badges[plan] || badges.free;
  };

  const PaginationControls = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
      <button 
        onClick={() => setPage(page - 1)} 
        disabled={page === 1}
        style={{ padding: '0.5rem 1rem', backgroundColor: page === 1 ? '#e5e7eb' : '#3b82f6', color: page === 1 ? '#9ca3af' : 'white', border: 'none', borderRadius: '0.375rem', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
      >
        ◀ Previous
      </button>
      
      {[...Array(Math.min(totalPages, 5))].map((_, i) => {
        let pageNum;
        if (totalPages <= 5) {
          pageNum = i + 1;
        } else if (page <= 3) {
          pageNum = i + 1;
        } else if (page >= totalPages - 2) {
          pageNum = totalPages - 4 + i;
        } else {
          pageNum = page - 2 + i;
        }
        
        return (
          <button
            key={pageNum}
            onClick={() => setPage(pageNum)}
            style={{ padding: '0.5rem 1rem', backgroundColor: page === pageNum ? '#10b981' : '#e5e7eb', color: page === pageNum ? 'white' : '#374151', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
          >
            {pageNum}
          </button>
        );
      })}
      
      {totalPages > 5 && page < totalPages - 2 && <span style={{ padding: '0.5rem' }}>...</span>}
      
      <button 
        onClick={() => setPage(page + 1)} 
        disabled={page === totalPages}
        style={{ padding: '0.5rem 1rem', backgroundColor: page === totalPages ? '#e5e7eb' : '#3b82f6', color: page === totalPages ? '#9ca3af' : 'white', border: 'none', borderRadius: '0.375rem', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
      >
        Next ▶
      </button>
    </div>
  );

  // OPD Booking Handler
  const handleBookOPD = (hospital) => {
    navigate(`/book-opd/${hospital._id}`);
  };

  // Admission Booking Handler
  const handleBookAdmission = (hospital) => {
    navigate(`/book-admission/${hospital._id}`);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '0.5rem' }}>🏥 KiaetoCare Hospitals</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Find and compare hospitals by priority, price, and availability</p>
        
        {/* Search Filters */}
        <form onSubmit={handleSearch} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
            <input type="text" placeholder="Disease / Symptom" value={disease} onChange={(e) => setDisease(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
            <input type="text" placeholder="Insurance Provider" value={insurance} onChange={(e) => setInsurance(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
              <option value="priority">Sort by Priority (Paid First)</option>
              <option value="distance">Sort by Distance</option>
              <option value="price">Sort by Price (Low to High)</option>
              <option value="rating">Sort by Rating (High to Low)</option>
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={bedRequired} onChange={(e) => setBedRequired(e.target.checked)} />
              Show only hospitals with available beds
            </label>
            <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>🔍 Search</button>
          </div>
        </form>

        {/* Results Count */}
        {!loading && hospitals.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#6b7280' }}>
            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, totalHospitals)} of {totalHospitals} hospitals
          </div>
        )}

        {/* Hospital Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading hospitals...</div>
        ) : hospitals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
            <p>No hospitals found. Try different search criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {hospitals.map((hospital) => {
              const badge = getSubscriptionBadge(hospital);
              const discountPrice = hospital.pricing?.consultation ? Math.round(hospital.pricing.consultation * 0.9) : null;
              
              return (
                <div key={hospital._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  
                  {/* Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{hospital.name}</h2>
                      <span style={{ backgroundColor: badge.bg, color: badge.color, padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                        {badge.icon} {badge.text}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ color: '#fbbf24' }}>⭐</span>
                      <span style={{ fontWeight: 'bold' }}>{hospital.ratings?.average || 'N/A'}</span>
                      <span style={{ color: '#6b7280' }}>({hospital.ratings?.count || 0} reviews)</span>
                    </div>
                  </div>
                  
                  {/* Location */}
                  <p style={{ color: '#6b7280', marginBottom: '0.75rem' }}>
                    📍 {hospital.address?.city}, {hospital.address?.state}
                    {hospital.distance && ` • ${hospital.distance} km away`}
                  </p>
                  
                  {/* Doctors Section - Expandable */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div 
                      onClick={() => setExpandedDoctors(expandedDoctors === hospital._id ? null : hospital._id)} 
                      style={{ cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      🩺 Doctors ({hospital.doctors?.length || 0}) {expandedDoctors === hospital._id ? '▲' : '▼'}
                    </div>
                    {expandedDoctors === hospital._id && (
                      <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                        {hospital.doctors?.map(doc => (
                          <div key={doc._id} style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                            <strong>👨‍⚕️ {doc.name}</strong> - {doc.specialization}
                            <span style={{ float: 'right' }}>₹{doc.consultation_fee}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Pricing Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem', backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem' }}>
                    <div>
                      <strong>📋 OPD Consultation</strong><br />
                      {discountPrice && discountPrice < hospital.pricing?.consultation ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{hospital.pricing?.consultation}</span><br />
                          <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{discountPrice}</span>
                          <span style={{ fontSize: '0.75rem', color: '#10b981' }}> (Save ₹{hospital.pricing?.consultation - discountPrice})</span>
                        </>
                      ) : (
                        <span style={{ fontWeight: 'bold' }}>₹{hospital.pricing?.consultation}</span>
                      )}
                    </div>
                    <div>
                      <strong>🏥 Admission (per day)</strong><br />
                      ICU: ₹{hospital.pricing?.icu_bed_per_day || 'N/A'}<br />
                      General: ₹{hospital.pricing?.general_bed_per_day || 'N/A'}<br />
                      <span style={{ fontSize: '0.75rem', color: hospital.beds?.available > 0 ? '#10b981' : '#ef4444' }}>
                        🛏️ {hospital.beds?.available || 0} beds available
                      </span>
                    </div>
                    <div>
                      <strong>🛡️ Insurance Accepted</strong><br />
                      <div 
                        onClick={() => setExpandedInsurance(expandedInsurance === hospital._id ? null : hospital._id)} 
                        style={{ cursor: 'pointer', color: '#3b82f6' }}
                      >
                        {hospital.insurance_accepted?.slice(0, 2).join(', ')} 
                        {hospital.insurance_accepted?.length > 2 && ` +${hospital.insurance_accepted.length - 2} ▼`}
                      </div>
                      {expandedInsurance === hospital._id && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                          {hospital.insurance_accepted?.map(ins => (
                            <div key={ins}>✅ {ins}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <button onClick={() => handleBookOPD(hospital)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', flex: 1 }}>
                      📋 Book OPD
                    </button>
                    <button onClick={() => handleBookAdmission(hospital)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', flex: 1 }}>
                      🏥 Book Admission
                    </button>
                    <button onClick={() => navigate(`/hospitals/${hospital._id}`)} style={{ backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                      View Details
                    </button>
                  </div>
                  
                  {/* Badges Row */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {hospital.has24x7ER && <span style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>🚨 24/7 Emergency</span>}
                    {hospital.ambulance_available && <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>🚑 Ambulance</span>}
                    {discountPrice && <span style={{ backgroundColor: '#10b981', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>💰 10% Discount</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && hospitals.length > 0 && <PaginationControls />}
      </div>
    </div>
  );
};

export default HospitalsList;
