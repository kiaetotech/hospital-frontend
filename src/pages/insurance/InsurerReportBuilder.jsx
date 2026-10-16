// D:\hospital-frontend\src\pages\insurance\InsurerReportBuilder.jsx
// ============================================
// CUSTOM REPORT BUILDER
// Insurers select report type, group-by, filters → live preview → CSV
// ============================================

import React, { useState, useMemo } from 'react';
import { insuranceApi } from '../../services/providerApi';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-e2d5.up.railway.app';
const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const REPORT_TYPES = [
  { value: 'policies', label: '📄 Policies Report',     desc: 'Premium, sum insured, policy counts' },
  { value: 'claims',   label: '📋 Claims Report',       desc: 'Claim amounts, approved, settled' },
  { value: 'revenue',  label: '💰 Revenue Report',      desc: 'Premium, commission, TDS, GST, payout' },
];

const GROUP_BY_OPTIONS = {
  policies: [
    { value: 'month',  label: 'By Month' },
    { value: 'status', label: 'By Status' },
    { value: 'plan',   label: 'By Plan' },
    { value: 'city',   label: 'By City' },
    { value: 'total',  label: 'Total (no grouping)' },
  ],
  claims: [
    { value: 'month',    label: 'By Month' },
    { value: 'status',   label: 'By Status' },
    { value: 'hospital', label: 'By Hospital' },
    { value: 'total',    label: 'Total (no grouping)' },
  ],
  revenue: [
    { value: 'month', label: 'By Month' },
    { value: 'total', label: 'Total (no grouping)' },
  ],
};

const COLUMN_MAP = {
  policies: [
    { key: 'group',           label: 'Group' },
    { key: 'count',           label: 'Policies', align: 'right' },
    { key: 'totalPremium',    label: 'Premium', format: 'money', align: 'right' },
    { key: 'totalSumInsured', label: 'Sum Insured', format: 'money', align: 'right' },
    { key: 'avgPremium',      label: 'Avg Premium', format: 'money', align: 'right' },
  ],
  claims: [
    { key: 'group',        label: 'Group' },
    { key: 'count',        label: 'Claims', align: 'right' },
    { key: 'totalAmount',  label: 'Claim Amount', format: 'money', align: 'right' },
    { key: 'totalApproved', label: 'Approved', format: 'money', align: 'right' },
    { key: 'totalSettled', label: 'Settled', format: 'money', align: 'right' },
  ],
  revenue: [
    { key: 'group',            label: 'Group' },
    { key: 'count',            label: 'Policies', align: 'right' },
    { key: 'totalPremium',     label: 'Premium', format: 'money', align: 'right' },
    { key: 'totalCommission',  label: 'Commission', format: 'money', align: 'right' },
    { key: 'totalTds',         label: 'TDS (5%)', format: 'money', align: 'right' },
    { key: 'totalGst',         label: 'GST (18%)', format: 'money', align: 'right' },
    { key: 'totalPayout',      label: 'Net Payout', format: 'money', align: 'right' },
  ],
};

export default function InsurerReportBuilder() {
  const [reportType, setReportType] = useState('policies');
  const [groupBy, setGroupBy] = useState('month');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    search: '',
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  // When reportType changes, reset groupBy to first option
  const onReportTypeChange = (val) => {
    setReportType(val);
    setGroupBy(GROUP_BY_OPTIONS[val][0].value);
    setRows([]);
    setGenerated(false);
  };

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('providerToken');
      const r = await fetch(`${API_BASE}/api/insurance/company/reports/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          reportType,
          groupBy,
          filters: {
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
            status: filters.status !== 'all' ? filters.status : undefined,
            search: filters.search || undefined,
          },
        }),
      });
      const d = await r.json();
      if (d.success) {
        setRows(d.data?.rows || []);
        setGenerated(true);
      } else {
        setError(d.message || 'Failed to generate report');
      }
    } catch (e) {
      setError(e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const columns = COLUMN_MAP[reportType] || [];

  const summary = useMemo(() => {
    if (!rows.length) return null;
    const total = { count: 0 };
    columns.forEach((col) => {
      if (col.key !== 'group' && col.align === 'right') total[col.key] = 0;
    });
    rows.forEach((r) => {
      columns.forEach((col) => {
        if (col.key !== 'group' && col.align === 'right') {
          total[col.key] += Number(r[col.key] || 0);
        }
      });
    });
    // avgPremium should be recomputed
    if (reportType === 'policies') {
      total.avgPremium = total.count > 0 ? Math.round(total.totalPremium / total.count) : 0;
    }
    return total;
  }, [rows, columns, reportType]);

  const exportCsv = () => {
    if (!rows.length) return;
    const header = columns.map((c) => c.label).join(',');
    const body = rows
      .map((r) => columns.map((c) => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const csv = header + '\n' + body;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${reportType}-${groupBy}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputStyle = {
    width: '100%',
    padding: '0.55rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '0.85rem',
    background: 'white',
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>📊 Custom Report Builder</h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
          Choose report type, grouping, and filters → generate → export CSV
        </p>
      </div>

      {/* Report type picker */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {REPORT_TYPES.map((rt) => (
          <button
            key={rt.value}
            onClick={() => onReportTypeChange(rt.value)}
            style={{
              padding: '1rem',
              textAlign: 'left',
              background: reportType === rt.value ? '#eff6ff' : 'white',
              border: `2px solid ${reportType === rt.value ? '#1565C0' : '#e2e8f0'}`,
              borderRadius: '0.75rem',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: reportType === rt.value ? '#1565C0' : '#0f172a' }}>
              {rt.label}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              {rt.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.75rem',
        alignItems: 'end',
      }}>
        <div>
          <label style={labelStyle}>Group By</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            style={inputStyle}
          >
            {(GROUP_BY_OPTIONS[reportType] || []).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>From Date</label>
          <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>To Date</label>
          <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} style={inputStyle} />
        </div>
        {reportType === 'policies' && (
          <div>
            <label style={labelStyle}>Status</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} style={inputStyle}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}
        {reportType === 'claims' && (
          <div>
            <label style={labelStyle}>Status</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} style={inputStyle}>
              <option value="all">All</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="settled">Settled</option>
            </select>
          </div>
        )}
        {reportType === 'policies' && (
          <div>
            <label style={labelStyle}>Search (customer/policy)</label>
            <input type="text" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Name, email, phone…" style={inputStyle} />
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={generate}
            disabled={loading}
            style={{ padding: '0.6rem 1.25rem', background: '#1565C0', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: loading ? 'wait' : 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
          >
            {loading ? 'Generating…' : '⚡ Generate Report'}
          </button>
          <button
            onClick={exportCsv}
            disabled={!rows.length}
            style={{ padding: '0.6rem 1rem', background: rows.length ? '#10b981' : '#e2e8f0', color: rows.length ? 'white' : '#94a3b8', border: 'none', borderRadius: '0.5rem', cursor: rows.length ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '0.85rem' }}
          >
            ⬇️ Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Preview */}
      {!generated && !loading && (
        <div style={{ background: 'white', borderRadius: '0.85rem', padding: '3rem', textAlign: 'center', color: '#94a3b8', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
            Configure your report and click <strong>Generate Report</strong>
          </div>
        </div>
      )}

      {generated && (
        <div style={{ background: 'white', borderRadius: '0.85rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
              {rows.length} row{rows.length === 1 ? '' : 's'}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {REPORT_TYPES.find(r => r.value === reportType)?.label}
            </span>
          </div>

          {rows.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No data for the selected filters</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {columns.map((col) => (
                      <th key={col.key} style={{ padding: '0.7rem 0.9rem', textAlign: col.align || 'left', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '2px solid #e2e8f0' }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {columns.map((col) => (
                        <td key={col.key} style={{ padding: '0.7rem 0.9rem', textAlign: col.align || 'left', fontSize: '0.85rem', color: '#1e293b' }}>
                          {col.format === 'money' ? inr(row[col.key]) : row[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                {summary && rows.length > 1 && (
                  <tfoot>
                    <tr style={{ background: '#eff6ff', fontWeight: 800 }}>
                      {columns.map((col) => (
                        <td key={col.key} style={{ padding: '0.7rem 0.9rem', textAlign: col.align || 'left', fontSize: '0.85rem', color: '#1e40af' }}>
                          {col.key === 'group' ? 'TOTAL' : col.format === 'money' ? inr(summary[col.key]) : summary[col.key]}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      )}

      {/* Info footer */}
      <div style={{ marginTop: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
        <strong style={{ color: '#0f172a' }}>💡 Tips</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>Group by <strong>month</strong> for trend analysis.</li>
          <li>Group by <strong>plan</strong> to see which plan sells best.</li>
          <li>Group by <strong>city</strong> for geographic insights.</li>
          <li>Use the <strong>date range</strong> filter to focus on a period.</li>
          <li>Export CSV to open in Excel or share with your team.</li>
        </ul>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' };