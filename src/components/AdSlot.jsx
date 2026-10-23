// D:\hospital-frontend\src\components\AdSlot.jsx
// ============================================
// UNIVERSAL AD SLOT COMPONENT
// Drop into ANY page — auto-fetches and renders ads
// Auto-tracks impressions + clicks via /api/ads
//
// Usage:
//   <AdSlot placement="homepage_banner" providerType="insurance" limit={3} />
//   <AdSlot placement="search_top" limit={2} />
//   <AdSlot placement="mobile_feed" variant="compact" />
// ============================================

import React, { useEffect, useRef, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-ilhi.onrender.com';

// ---------------------------------------------
// Session-scoped frequency capping
// Each campaign shows max 3 impressions per browser session
// ---------------------------------------------
const CAP_KEY = 'adSlot_impression_caps';
const MAX_PER_CAMPAIGN = 3;

const getCaps = () => {
  try { return JSON.parse(sessionStorage.getItem(CAP_KEY) || '{}'); }
  catch { return {}; }
};
const setCaps = (caps) => {
  try { sessionStorage.setItem(CAP_KEY, JSON.stringify(caps)); } catch {}
};
const isCapped = (id) => (getCaps()[id] || 0) >= MAX_PER_CAMPAIGN;
const bumpCap = (id) => {
  const caps = getCaps();
  caps[id] = (caps[id] || 0) + 1;
  setCaps(caps);
};

// ---------------------------------------------
// Variant → visual style
// ---------------------------------------------
const VARIANT_STYLES = {
  default:  { padding: '1rem 1.25rem', radius: '0.75rem', imageHeight: 120, layout: 'vertical' },
  compact:  { padding: '0.65rem 0.9rem', radius: '0.5rem', imageHeight: 60, layout: 'horizontal' },
  banner:   { padding: '1.25rem 1.5rem', radius: '1rem', imageHeight: 180, layout: 'horizontal' },
  minimal:  { padding: '0.5rem 0.85rem', radius: '0.4rem', imageHeight: 0, layout: 'horizontal' },
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function AdSlot({
  placement = 'homepage_banner',
  providerType,
  state,
  city,
  limit = 3,
  variant = 'default',
  accentColor,
  onAdClick,
  className = '',
  style,
}) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const seenRef = useRef(new Set());

  // ---------------------------------------------
  // Fetch ads
  // ---------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const fetchAds = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ placement, limit: String(limit) });
        if (providerType) params.append('providerType', providerType);
        if (state) params.append('state', state);
        if (city) params.append('city', city);

        const r = await fetch(`${API_BASE}/api/ads/active?${params.toString()}`);
        const d = await r.json();
        if (cancelled) return;

        if (d.success) {
          // Apply frequency capping
          const filtered = (d.data || []).filter((ad) => !isCapped(ad._id));
          setAds(filtered);
        } else {
          setError(d.message || 'Failed to load ads');
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAds();
    return () => { cancelled = true; };
  }, [placement, providerType, state, city, limit]);

  // ---------------------------------------------
  // Track impression when ad enters viewport
  // ---------------------------------------------
  useEffect(() => {
    if (ads.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-ad-id');
          if (!id || seenRef.current.has(id)) return;
          seenRef.current.add(id);
          bumpCap(id);
          // Fire-and-forget impression
          fetch(`${API_BASE}/api/ads/impression`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: id }),
          }).catch(() => {});
        }
      });
    }, { threshold: 0.5 });

    const nodes = document.querySelectorAll(`[data-ad-slot="${placement}-${providerType || 'all'}"]`);
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [ads, placement, providerType]);

  // ---------------------------------------------
  // Track click
  // ---------------------------------------------
  const handleClick = (ad) => {
    fetch(`${API_BASE}/api/ads/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: ad._id, providerType: ad.providerType }),
    }).catch(() => {});

    if (onAdClick) onAdClick(ad);

    const url = ad.creative?.ctaUrl || '/';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ---------------------------------------------
  // Render
  // ---------------------------------------------
  if (loading) return null;
  if (error || ads.length === 0) return null;

  const vs = VARIANT_STYLES[variant] || VARIANT_STYLES.default;

  return (
    <div
      className={`ad-slot-root ${className}`}
      style={{ display: 'grid', gap: '0.75rem', margin: '1rem 0', ...(style || {}) }}
    >
      {ads.map((ad) => (
        <AdCard
          key={ad._id}
          ad={ad}
          variant={variant}
          vs={vs}
          accentColor={accentColor || ad.creative?.accentColor || '#1565C0'}
          slotId={`${placement}-${providerType || 'all'}`}
          onClick={() => handleClick(ad)}
        />
      ))}
    </div>
  );
}

// ============================================
// AD CARD
// ============================================
function AdCard({ ad, variant, vs, accentColor, slotId, onClick }) {
  const c = ad.creative || {};
  const horizontal = vs.layout === 'horizontal';

  return (
    <div
      data-ad-id={ad._id}
      data-ad-slot={slotId}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      style={{
        background: 'white',
        borderRadius: vs.radius,
        padding: vs.padding,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        border: `1px solid ${accentColor}22`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        display: horizontal ? 'flex' : 'block',
        gap: '1rem',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.10)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Sponsored badge */}
      <span style={{
        position: 'absolute',
        top: '0.5rem',
        right: '0.6rem',
        fontSize: '0.6rem',
        fontWeight: 700,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        background: '#f8fafc',
        padding: '0.1rem 0.4rem',
        borderRadius: '999px',
      }}>
        Sponsored
      </span>

      {/* Image */}
      {vs.imageHeight > 0 && c.imageUrl && (
        <div
          style={{
            width: horizontal ? '120px' : '100%',
            height: horizontal ? '80px' : `${vs.imageHeight}px`,
            borderRadius: '0.5rem',
            overflow: 'hidden',
            flexShrink: 0,
            background: '#f1f5f9',
          }}
        >
          <img
            src={c.imageUrl}
            alt={c.headline || 'Ad'}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Provider label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
          {ad.providerLogo && (
            <img
              src={ad.providerLogo}
              alt=""
              style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: accentColor,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}>
            {ad.providerName || 'Sponsored'}
          </span>
        </div>

        {/* Headline */}
        <div style={{
          fontSize: horizontal ? '0.9rem' : '1rem',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: '0.25rem',
          lineHeight: 1.35,
        }}>
          {c.headline || 'Discover more'}
        </div>

        {/* Body */}
        {c.bodyText && (
          <div style={{
            fontSize: '0.82rem',
            color: '#475569',
            marginBottom: '0.65rem',
            lineHeight: 1.5,
            display: horizontal ? '-webkit-box' : 'block',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {c.bodyText}
          </div>
        )}

        {/* CTA */}
        <button
          type="button"
          style={{
            padding: '0.4rem 0.9rem',
            background: accentColor,
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          {c.ctaText || 'Learn More'} →
        </button>
      </div>
    </div>
  );
}