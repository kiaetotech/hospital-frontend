// src/pages/admin/CommandCenter.jsx
import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';

const KPI_ROW_1 = [
  { key: 'patients', label: 'Patients / Users', value: '124,580', sub: 'Live platform users', color: '#2563eb' },
  { key: 'providers', label: 'Providers', value: '8,420', sub: 'Active + pending', color: '#7c3aed' },
  { key: 'visits', label: 'Page Visits', value: '8.4 L', sub: 'Last 30 days', color: '#0891b2' },
  { key: 'bookings', label: 'Bookings', value: '42,850', sub: '5.1% conversion', color: '#059669' },
];

const KPI_ROW_2 = [
  { key: 'revenue', label: 'Gross Revenue', value: '₹2.84 Cr', sub: 'Selected scope', color: '#dc2626' },
  { key: 'commission', label: 'Platform Commission', value: '₹42.6 L', sub: 'Configured rules', color: '#8b5cf6' },
  { key: 'earnings', label: 'Provider Earnings', value: '₹2.41 Cr', sub: 'Pre-settlement', color: '#10b981' },
  { key: 'settlements', label: 'Settlements', value: '₹31.2 L', sub: 'Pending payout', color: '#f59e0b' },
];

const KPICard = ({ kpi }) => (
  <div style={{
    backgroundColor: '#fff',
    border: '1px solid #e4e8f0',
    borderRadius: 13,
    padding: 16,
    boxShadow: '0 2px 8px rgba(23,32,51,0.035)',
    position: 'relative',
    borderTop: `3px solid ${kpi.color}`,
  }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7485' }}>{kpi.label}</div>
    <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6, color: kpi.color }}>{kpi.value}</div>
    {kpi.sub && <div style={{ fontSize: 12, color: '#687386', marginTop: 5 }}>{kpi.sub}</div>}
    <div style={{
      position: 'absolute', top: 10, right: 10, fontSize: 9, fontWeight: 700,
      color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: 6,
    }}>DEMO</div>
  </div>
);

const Placeholder = ({ title, description }) => (
  <div style={{
    backgroundColor: '#fff', border: '1px dashed #cbd5e1', borderRadius: 13,
    padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13,
  }}>
    <div style={{ fontSize: 24, marginBottom: 8 }}>🚧</div>
    <div style={{ fontWeight: 700, color: '#475569', marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 12 }}>{description}</div>
  </div>
);

const CommandCenter = () => {
  const [filters, setFilters] = useState({
    scope: 'PAN INDIA', state: 'All States', city: 'All Cities', tag: 'all', period: '30d',
  });

  return (
    <AdminLayout filters={filters} onFiltersChange={setFilters}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Command Center</div>
          <div style={{ fontSize: 12, color: '#687386', marginTop: 3 }}>
            Showing: <strong>{filters.scope}</strong>
            {filters.state !== 'All States' && <> • <strong>{filters.state}</strong></>}
            {filters.city !== 'All Cities' && <> • <strong>{filters.city}</strong></>}
            {' '}• period: <strong>{filters.period}</strong>
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
          Phase 1 — layout preview. Widgets in Session 2.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 18 }}>
        {KPI_ROW_1.map((kpi) => <KPICard key={kpi.key} kpi={kpi} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 24 }}>
        {KPI_ROW_2.map((kpi) => <KPICard key={kpi.key} kpi={kpi} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 14, marginBottom: 18 }}>
        <Placeholder title="Booking Conversion Funnel" description="Visits → Searches → Booking Started → Payment → Completed" />
        <Placeholder title="Finance / Profit" description="Gross Revenue · Commission · Refunds · GST · Settlements" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
        <Placeholder title="12 Tag Command Center" description="Per-tag cards: Visits · Bookings · Revenue · Conversion · [Open]" />
        <Placeholder title="Approval Center" description="Hospitals · Doctors · Labs · Lenders · Insurers · DietCare" />
      </div>
      <div style={{ marginBottom: 18 }}>
        <Placeholder title="AI Control Center" description="Operations · Finance · Growth · Security AI · Alerts · Human Queue" />
      </div>
      <div>
        <Placeholder title="Report Center" description="[Tag] [State] [City] [Provider] [Finance] [Conversion] · Generate · Export · Schedule" />
      </div>

      <div style={{
        marginTop: 24, padding: 12, backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe', borderRadius: 10, fontSize: 12, color: '#1e40af',
      }}>
        ℹ️ <strong>Phase 1 complete.</strong> Sidebar, header, filter bar, and 8 KPI cards are live.
      </div>
    </AdminLayout>
  );
};

export default CommandCenter;