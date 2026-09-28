// src/pages/admin/TaxesAndFees.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaRupeeSign, FaFileInvoiceDollar } from 'react-icons/fa';
import TdsRulesTab from './TdsRulesTab';
import GstRulesTab from './GstRulesTab';

const TaxesAndFees = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('gst'); // default to GST (has data)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
        padding: '1.2rem 2rem', color: 'white',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>💰 Taxes & Fees</h1>
          <p style={{ opacity: 0.8, fontSize: '0.85rem', margin: '2px 0 0' }}>
            Admin-controlled TDS and GST rules across all 11 tags
          </p>
        </div>
        <button
          onClick={() => navigate('/admin')}
          style={{
            padding: '0.5rem 1rem', background: '#64748b', color: 'white',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            fontWeight: 600, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}
        >
          <FaArrowLeft /> Back to Admin
        </button>
      </div>

      {/* TABS */}
      <div style={{
        backgroundColor: 'white', padding: '0.75rem 2rem',
        display: 'flex', gap: '0.4rem',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        {[
          { id: 'gst', label: '🧾 GST Rules', icon: FaFileInvoiceDollar },
          { id: 'tds', label: '💸 TDS Rules', icon: FaRupeeSign },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.6rem 1.25rem', border: 'none', borderRadius: 8, cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: tab === t.id ? 700 : 400,
              background: tab === t.id ? '#2563eb' : 'transparent',
              color: tab === t.id ? 'white' : '#475569',
              display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}
          >
            <t.icon /> {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ padding: '1.5rem 2rem', maxWidth: 1400, margin: '0 auto' }}>
        {tab === 'gst' && <GstRulesTab />}
        {tab === 'tds' && <TdsRulesTab />}
      </div>
    </div>
  );
};

export default TaxesAndFees;