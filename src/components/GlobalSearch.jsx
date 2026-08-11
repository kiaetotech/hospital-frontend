import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  const debouncedSearch = useCallback((searchQuery) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length < 2) { setResults(null); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get(`/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
        if (response.data.success) { setResults(response.data); setShowDropdown(true); setSelectedIndex(-1); }
      } catch (error) { setResults(null); }
      finally { setLoading(false); }
    }, 300);
  }, []);

  useEffect(() => { debouncedSearch(query); return () => { if (debounceRef.current) clearTimeout(debounceRef.current); }; }, [query, debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showDropdown || !results) return;
    const flat = results.allResults || [];
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(p => p < flat.length - 1 ? p + 1 : 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(p => p > 0 ? p - 1 : flat.length - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); if (selectedIndex >= 0 && flat[selectedIndex]) { setShowDropdown(false); setQuery(''); navigate(flat[selectedIndex].link); } }
    else if (e.key === 'Escape') setShowDropdown(false);
  };

  const handleClick = (result) => { setShowDropdown(false); setQuery(''); navigate(result.link); };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: '24px', padding: '8px 16px', border: showDropdown ? '2px solid #1976d2' : '2px solid transparent' }}>
        <span style={{ color: '#666', marginRight: '10px', fontSize: '20px' }}>🔍</span>
        <input type="text" placeholder="Search hospitals, doctors, tests..." value={query}
          onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
          onFocus={() => results && setShowDropdown(true)}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '16px', color: '#333', padding: '8px 0' }} />
        {loading && <span style={{ color: '#1976d2', fontSize: '14px' }}>⟳</span>}
        {query && <button onClick={() => { setQuery(''); setResults(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '18px' }}>✕</button>}
      </div>
      {showDropdown && results && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: 'white', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxHeight: '500px', overflowY: 'auto', zIndex: 1000 }}>
          {results.tags?.length > 0 ? (
            <>
              {results.tags.map((tg, ti) => (
                <div key={ti} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ padding: '8px 20px', fontSize: '13px', fontWeight: '600', color: '#666', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{tg.tagIcon} {tg.tag}</span><span style={{ fontSize: '12px', color: '#999' }}>{tg.count}</span>
                  </div>
                  {results.results[tg.tag]?.map(r => {
                    const gi = results.allResults.indexOf(r);
                    return (
                      <div key={`${r._type}-${r._id}`} onClick={() => handleClick(r)} onMouseEnter={() => setSelectedIndex(gi)}
                        style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', cursor: 'pointer', borderLeft: gi === selectedIndex ? '3px solid #1976d2' : '3px solid transparent', background: gi === selectedIndex ? '#f8f9ff' : 'transparent' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', fontSize: '20px', flexShrink: 0 }}>
                          {r.image ? <img src={r.image} alt="" style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} /> : (r.tagIcon || '🏥')}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '15px', fontWeight: '500', color: '#1a1a1a', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name || r.testName || r.providerName || r.planName}</div>
                          <div style={{ fontSize: '13px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.subtitle}</div>
                          {r.rating && <div style={{ marginTop: '4px', color: '#ffc107', fontSize: '14px' }}>★ {r.rating?.toFixed(1)}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              {results.totalResults > 20 && (
                <div onClick={() => { setShowDropdown(false); navigate(`/search?q=${encodeURIComponent(query)}`); }}
                  style={{ padding: '14px 20px', textAlign: 'center', color: '#1976d2', fontWeight: '500', cursor: 'pointer', fontSize: '14px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
                  View all {results.totalResults} results →
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#999' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div><div>No results found</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

