import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Footer from '../components/Footer';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    api.get(`/search?q=${encodeURIComponent(query)}&limit=50`)
      .then(r => setResults(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px 20px', fontSize: '18px', color: '#666' }}>🔍 Searching...</div>;

  return (
    <div>
      <div style={{ maxWidth: '900px', margin: '80px auto 40px', padding: '0 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>Results for "{query}"</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>{results?.totalResults || 0} results across {results?.tags?.length || 0} categories</p>
        {results?.tags?.map((tg, i) => (
          <div key={i} style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', paddingBottom: '12px', borderBottom: '2px solid #e3f2fd', display: 'flex', gap: '10px' }}>
              {tg.tagIcon} {tg.tag} <span style={{ fontSize: '14px', color: '#999', fontWeight: '400' }}>({tg.count})</span>
            </h2>
            {results.results[tg.tag]?.map(r => (
              <div key={`${r._type}-${r._id}`} onClick={() => navigate(r.link)}
                style={{ display: 'flex', alignItems: 'center', padding: '16px', background: 'white', borderRadius: '12px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', fontSize: '24px', flexShrink: 0 }}>
                  {r.image ? <img src={r.image} alt="" style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} /> : (r.tagIcon || '🏥')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '17px', fontWeight: '500', marginBottom: '4px' }}>{r.name || r.testName || r.providerName}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{r.subtitle}</div>
                  {r.rating && <div style={{ marginTop: '6px', color: '#ffc107', fontSize: '14px' }}>★ {r.rating?.toFixed(1)}</div>}
                </div>
                <span style={{ color: '#1976d2', fontWeight: '500' }}>View →</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default SearchResultsPage;

