import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const MentalHealthTherapists = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoMatch = searchParams.get('match');
  const [loading, setLoading] = useState(true);
  const [therapists, setTherapists] = useState([]);
  const [matchMode, setMatchMode] = useState(autoMatch === 'true');
  const [showMatchPanel, setShowMatchPanel] = useState(autoMatch === 'true');
  const [matchPrefs, setMatchPrefs] = useState({ language: '', gender: '', budget: '', concern: '' });
  const [matchedTherapists, setMatchedTherapists] = useState([]);
  
  const [filters, setFilters] = useState({
    city: '', specialization: '', minRating: '', maxPrice: '', consultationType: 'all'
  });

  useEffect(() => {
    fetchTherapists();
  }, [filters]);

  useEffect(() => {
    if (autoMatch === 'true') {
      setMatchMode(true);
      setShowMatchPanel(true);
      setTimeout(() => {
        document.getElementById('smart-match')?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    }
  }, [autoMatch]);

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.specialization) params.append('specializations', filters.specialization);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.consultationType && filters.consultationType !== 'all') params.append('consultationType', filters.consultationType);
      const res = await api.get(`/mentalhealth/therapists?${params.toString()}`);
      if (res.data.success) setTherapists(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSmartMatch = () => {
    let result = [...therapists];
    if (matchPrefs.language) result = result.filter(t => t.languages?.some(l => l.toLowerCase().includes(matchPrefs.language.toLowerCase())));
    if (matchPrefs.gender) result = result.filter(t => t.gender === matchPrefs.gender);
    if (matchPrefs.budget) result = result.filter(t => (t.pricing?.consultation || 500) <= parseInt(matchPrefs.budget));
    if (matchPrefs.concern) result = result.filter(t => t.specializations?.some(s => s.toLowerCase().includes(matchPrefs.concern.toLowerCase())));

    result = result.map(t => {
      let score = 0;
      if (matchPrefs.language && t.languages?.some(l => l.toLowerCase().includes(matchPrefs.language.toLowerCase()))) score += 3;
      if (matchPrefs.gender && t.gender === matchPrefs.gender) score += 2;
      if (matchPrefs.concern && t.specializations?.some(s => s.toLowerCase().includes(matchPrefs.concern.toLowerCase()))) score += 3;
      score += (t.rating || 0) * 1;
      return { ...t, matchScore: score };
    });

    result.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    setMatchedTherapists(result.slice(0, 5));
    setMatchMode(true);
  };

  const displayTherapists = matchMode ? matchedTherapists : therapists;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', padding: '20px', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/mentalhealth')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>← Back</button>
          <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>
            {autoMatch === 'true' ? '🎯 Smart Match' : '🧠 Find a Therapist'}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>

        {/* SMART MATCHING PANEL - Collapsible */}
        <div id="smart-match" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '12px' }}>
          <button onClick={() => setShowMatchPanel(!showMatchPanel)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
            <h3 style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', margin: 0 }}>
              🎯 Smart Matching — Find Your Perfect Therapist
              {matchMode && <span style={{ fontSize: '11px', color: '#059669', marginLeft: '8px', fontWeight: '600' }}>Active</span>}
            </h3>
            <span style={{ fontSize: '18px', color: '#7c3aed', fontWeight: '700' }}>{showMatchPanel ? '▲' : '▼'}</span>
          </button>
          
          {showMatchPanel && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Match by language, gender, budget & concern</span>
                <button onClick={() => { setMatchMode(false); setMatchPrefs({ language: '', gender: '', budget: '', concern: '' }); }}
                  style={{ fontSize: '11px', color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Clear</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '10px', marginTop: '8px' }}>
                <select value={matchPrefs.language} onChange={(e) => setMatchPrefs({ ...matchPrefs, language: e.target.value })} style={selectStyle}>
                  <option value="">🗣️ Language</option>
                  <option>Hindi</option><option>English</option><option>Tamil</option><option>Telugu</option><option>Bengali</option><option>Marathi</option>
                </select>
                <select value={matchPrefs.gender} onChange={(e) => setMatchPrefs({ ...matchPrefs, gender: e.target.value })} style={selectStyle}>
                  <option value="">👤 Gender</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
                <select value={matchPrefs.budget} onChange={(e) => setMatchPrefs({ ...matchPrefs, budget: e.target.value })} style={selectStyle}>
                  <option value="">💰 Budget</option>
                  <option value="500">Up to ₹500</option><option value="800">Up to ₹800</option><option value="1200">Up to ₹1200</option><option value="2000">Up to ₹2000</option>
                </select>
                <select value={matchPrefs.concern} onChange={(e) => setMatchPrefs({ ...matchPrefs, concern: e.target.value })} style={selectStyle}>
                  <option value="">🏥 Concern</option>
                  <option>Anxiety</option><option>Depression</option><option>Stress</option><option>Trauma</option><option>Relationship</option><option>Addiction</option>
                </select>
              </div>
              <button onClick={handleSmartMatch}
                style={{ width: '100%', padding: '10px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                🎯 Find My Match
              </button>
            </>
          )}
        </div>

        {/* Filters */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div><label style={{ fontSize: '10px', fontWeight: '600', color: '#64748b', display: 'block' }}>City</label>
            <input type="text" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} placeholder="Mumbai" style={inputStyle} /></div>
          <div><label style={{ fontSize: '10px', fontWeight: '600', color: '#64748b', display: 'block' }}>Specialty</label>
            <input type="text" value={filters.specialization} onChange={(e) => setFilters({ ...filters, specialization: e.target.value })} placeholder="Anxiety" style={inputStyle} /></div>
          <div><label style={{ fontSize: '10px', fontWeight: '600', color: '#64748b', display: 'block' }}>Rating</label>
            <input type="number" value={filters.minRating} onChange={(e) => setFilters({ ...filters, minRating: e.target.value })} placeholder="4.0" style={inputStyle} step="0.1" /></div>
          <div><label style={{ fontSize: '10px', fontWeight: '600', color: '#64748b', display: 'block' }}>Max Price</label>
            <input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} placeholder="1000" style={inputStyle} /></div>
          <button onClick={fetchTherapists} style={{ padding: '8px 20px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>Search</button>
        </div>

        {/* Results */}
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</p>
        ) : displayTherapists.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px' }}>
            <p style={{ color: '#64748b' }}>No therapists found. Try adjusting filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {displayTherapists.map((t) => (
              <div key={t._id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', borderTop: '3px solid #7c3aed', position: 'relative' }}>
                {t.matchScore !== undefined && (
                  <span style={{ position: 'absolute', top: '8px', right: '8px', background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700' }}>
                    {t.matchScore}/10 match
                  </span>
                )}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>👤</div>
                  <div>
                    <h4 style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b', margin: 0 }}>{t.name}</h4>
                    <p style={{ fontSize: '11px', color: '#7c3aed', margin: 0 }}>{t.specializations?.slice(0, 2).join(', ')}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', color: '#f59e0b', fontSize: '13px', fontWeight: '600' }}>⭐ {t.rating || 0}</div>
                </div>
                <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>{t.experience} yrs • {t.languages?.join(', ')}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', color: '#059669', fontSize: '15px' }}>₹{t.pricing?.consultation || 500}/session</span>
                  <button onClick={() => navigate(`/mentalhealth/therapist/${t._id}`)}
                    style={{ padding: '6px 16px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '11px' }}>
                    View Profile →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle = { padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', outline: 'none', width: '130px' };
const selectStyle = { padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', outline: 'none', width: '100%', background: 'white' };

export default MentalHealthTherapists;
