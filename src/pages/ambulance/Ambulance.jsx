.ambulance-page {
  min-height: 100vh;
  background: #f0f2f5;
  padding-bottom: 40px;
}

/* ============================================ */
/* EMERGENCY HERO */
/* ============================================ */
.emergency-hero {
  background: linear-gradient(180deg, #e53935 0%, #c62828 100%);
  padding: 30px 20px 25px;
  text-align: center;
}

.emergency-btn {
  width: 100%;
  max-width: 360px;
  padding: 28px 20px;
  background: #fff;
  color: #e53935;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  transition: transform 0.2s;
}

.emergency-btn:active {
  transform: scale(0.96);
}

.emergency-btn-icon {
  display: block;
  font-size: 52px;
  margin-bottom: 6px;
}

.emergency-btn-text {
  display: block;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 3px;
  color: #e53935;
}

.emergency-btn-sub {
  display: block;
  font-size: 13px;
  color: #888;
  margin-top: 4px;
}

.emergency-fallback {
  color: rgba(255,255,255,0.75);
  font-size: 13px;
  margin-top: 14px;
}

.emergency-fallback strong {
  color: #fff;
  font-size: 18px;
  display: block;
  margin-top: 4px;
}

/* ============================================ */
/* SECTIONS */
/* ============================================ */
.section-heading {
  font-size: 17px;
  font-weight: 700;
  color: #222;
  margin: 0 0 14px 0;
}

.quick-book-section,
.types-section,
.search-section,
.manage-section,
.provider-section {
  background: #fff;
  margin: 14px 16px;
  padding: 18px;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

/* ============================================ */
/* QUICK BOOK */
/* ============================================ */
.quick-book-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.quick-book-card {
  padding: 18px 14px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.quick-book-card:hover {
  border-color: #e53935;
  background: #fff5f5;
}

.emergency-card {
  border-color: #e53935;
  background: #fff5f5;
  position: relative;
}

.card-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e53935;
  color: #fff;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
}

.card-icon {
  display: block;
  font-size: 34px;
  margin-bottom: 6px;
}

.card-title {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #222;
  margin-bottom: 2px;
}

.card-desc {
  display: block;
  font-size: 11px;
  color: #888;
}

/* ============================================ */
/* AMBULANCE TYPES */
/* ============================================ */
.types-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.type-card {
  padding: 14px 10px;
  border: 1px solid #eee;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.type-card:hover {
  border-color: #e53935;
  background: #fafafa;
}

.type-icon {
  display: block;
  font-size: 28px;
  margin-bottom: 4px;
}

.type-name {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #333;
}

.type-desc {
  display: block;
  font-size: 10px;
  color: #999;
  margin: 2px 0;
}

.type-price {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #e53935;
  margin-top: 4px;
}

/* ============================================ */
/* SEARCH */
/* ============================================ */
.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  background: #fafafa;
  transition: border-color 0.2s;
}

.search-box:hover {
  border-color: #e53935;
}

.search-icon {
  font-size: 18px;
}

.search-text {
  color: #999;
  font-size: 14px;
}

.nearby-hospitals {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}

.nearby-btn {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #444;
  text-align: center;
}

/* ============================================ */
/* MANAGE */
/* ============================================ */
.manage-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.manage-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #eee;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  text-align: left;
}

.manage-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.manage-title {
  font-size: 14px;
  font-weight: 700;
  color: #222;
  display: block;
}

.manage-desc {
  font-size: 11px;
  color: #999;
  display: block;
  margin-top: 2px;
}

/* ============================================ */
/* PROVIDER */
/* ============================================ */
.provider-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.provider-card {
  padding: 16px;
  border: 2px dashed #ddd;
  border-radius: 10px;
  background: #fafafa;
  cursor: pointer;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

/* ============================================ */
/* FOOTER */
/* ============================================ */
.ambulance-footer {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 12px;
}