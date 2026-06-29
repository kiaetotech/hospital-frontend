import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Ambulance.css';

const Ambulance = () => {
  const navigate = useNavigate();

  return (
    <div className="ambulance-page">
      {/* ============================================ */}
      {/* PRIORITY 1: EMERGENCY BUTTON - ALWAYS VISIBLE */}
      {/* ============================================ */}
      <div className="emergency-hero">
        <button className="emergency-btn" onClick={() => navigate('/ambulance/emergency')}>
          <span className="emergency-btn-icon">🚨</span>
          <span className="emergency-btn-text">EMERGENCY</span>
          <span className="emergency-btn-sub">Press for Immediate Ambulance</span>
        </button>
        <p className="emergency-fallback">Or call <strong>108</strong> directly</p>
      </div>

      {/* ============================================ */}
      {/* PRIORITY 2: QUICK BOOKING FORM */}
      {/* ============================================ */}
      <div className="quick-book-section">
        <h2 className="section-heading">Quick Book Ambulance</h2>
        <div className="quick-book-grid">
          <button className="quick-book-card emergency-card" onClick={() => navigate('/ambulance/emergency')}>
            <span className="card-icon">🚨</span>
            <span className="card-title">Emergency Now</span>
            <span className="card-desc">Immediate dispatch to your location</span>
            <span className="card-badge">Priority</span>
          </button>
          <button className="quick-book-card" onClick={() => navigate('/ambulance/schedule')}>
            <span className="card-icon">📅</span>
            <span className="card-title">Schedule Later</span>
            <span className="card-desc">Book for a future date & time</span>
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* PRIORITY 3: SELECT AMBULANCE TYPE */}
      {/* ============================================ */}
      <div className="types-section">
        <h2 className="section-heading">Select Ambulance Type</h2>
        <div className="types-grid">
          <button className="type-card" onClick={() => navigate('/ambulance/schedule?type=basic')}>
            <span className="type-icon">🚑</span>
            <span className="type-name">Basic Life Support</span>
            <span className="type-desc">Oxygen, first aid, stretcher</span>
            <span className="type-price">From ₹500</span>
          </button>
          <button className="type-card" onClick={() => navigate('/ambulance/schedule?type=cardiac')}>
            <span className="type-icon">❤️</span>
            <span className="type-name">Cardiac Ambulance</span>
            <span className="type-desc">Defibrillator, ECG monitor</span>
            <span className="type-price">From ₹750</span>
          </button>
          <button className="type-card" onClick={() => navigate('/ambulance/schedule?type=ventilator')}>
            <span className="type-icon">🫁</span>
            <span className="type-name">Ventilator Ambulance</span>
            <span className="type-desc">ICU setup, ventilator</span>
            <span className="type-price">From ₹900</span>
          </button>
          <button className="type-card" onClick={() => navigate('/ambulance/schedule?type=neonatal')}>
            <span className="type-icon">👶</span>
            <span className="type-name">Neonatal Ambulance</span>
            <span className="type-desc">Newborn & infant care</span>
            <span className="type-price">From ₹1,000</span>
          </button>
          <button className="type-card" onClick={() => navigate('/ambulance/schedule?type=wheelchair')}>
            <span className="type-icon">♿</span>
            <span className="type-name">Wheelchair Transport</span>
            <span className="type-desc">Non-emergency mobility</span>
            <span className="type-price">From ₹400</span>
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* PRIORITY 4: FIND HOSPITAL */}
      {/* ============================================ */}
      <div className="search-section">
        <h2 className="section-heading">Find Destination Hospital</h2>
        <div className="search-box" onClick={() => navigate('/hospitals')}>
          <span className="search-icon">🔍</span>
          <span className="search-text">Search hospitals by name, city, or specialty...</span>
        </div>
        <div className="nearby-hospitals">
          <button className="nearby-btn" onClick={() => navigate('/hospitals?emergency=true')}>
            🏥 Hospitals with Emergency
          </button>
          <button className="nearby-btn" onClick={() => navigate('/hospitals?beds_available=true')}>
            🛏️ Hospitals with Available Beds
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* PRIORITY 5: MANAGE PROFILE */}
      {/* ============================================ */}
      <div className="manage-section">
        <h2 className="section-heading">Manage</h2>
        <div className="manage-grid">
          <button className="manage-card" onClick={() => navigate('/ambulance/emergency-contacts')}>
            <span className="manage-icon">🛡️</span>
            <span className="manage-title">Emergency Contacts</span>
            <span className="manage-desc">Add contacts & medical info shared during emergency</span>
          </button>
          <button className="manage-card" onClick={() => navigate('/my-bookings')}>
            <span className="manage-icon">📋</span>
            <span className="manage-title">My Bookings</span>
            <span className="manage-desc">Track active & past ambulance bookings</span>
          </button>
          <button className="manage-card" onClick={() => navigate('/ambulance/driver/app')}>
            <span className="manage-icon">👨‍⚕️</span>
            <span className="manage-title">Driver App</span>
            <span className="manage-desc">For ambulance drivers - accept emergencies</span>
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* PRIORITY 6: FOR PROVIDERS */}
      {/* ============================================ */}
      <div className="provider-section">
        <h2 className="section-heading">For Ambulance Providers</h2>
        <div className="provider-grid">
          <button className="provider-card" onClick={() => navigate('/ambulance/register')}>
            <span>📝 Register Your Fleet</span>
          </button>
          <button className="provider-card" onClick={() => navigate('/ambulance/login')}>
            <span>🔐 Provider Login</span>
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <div className="ambulance-footer">
        <p>⚠️ For life-threatening emergencies, always call <strong>108</strong> first.</p>
      </div>
    </div>
  );
};

export default Ambulance;