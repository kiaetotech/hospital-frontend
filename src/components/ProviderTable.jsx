import React, { useState, useEffect, useMemo, useRef } from 'react';

/**
 * ProviderTable
 * ------------
 * Backwards-compatible table used across ALL provider dashboards.
 *
 * New optional props (opt-in — old usage still behaves exactly the same):
 *   - serverSide: boolean           -> skip internal filtering/pagination
 *   - externalSearch: string        -> controlled search query (serverSide mode)
 *   - onSearchChange: (q) => void   -> fires (debounced 400ms) when user types
 *   - pageSizeOptions: number[]     -> shows a page-size dropdown (default [10])
 *   - onExport: () => void          -> renders "Export CSV" button
 *   - enableRowSelect: boolean      -> shows checkbox column + bulk toolbar
 *   - onSelectionChange: (rows)=>{} -> called whenever selection changes
 *   - externalFilters: ReactNode    -> slot to render dropdowns above table
 *   - totalFromServer: number       -> total records (serverSide mode)
 *   - currentServerPage: number     -> current page (serverSide mode)
 *   - onPageChange: (page) => void  -> page change (serverSide mode)
 *   - onPageSizeChange: (size)=>{}  -> page size change (serverSide mode)
 *   - currentPageSize: number       -> current page size (serverSide mode)
 */
const ProviderTable = ({
  columns,
  data,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  loading,
  emptyMessage = 'No records found',

  // NEW (all optional)
  serverSide = false,
  externalSearch,
  onSearchChange,
  pageSizeOptions,
  onExport,
  enableRowSelect = false,
  onSelectionChange,
  externalFilters,
  totalFromServer,
  currentServerPage,
  onPageChange,
  onPageSizeChange,
  currentPageSize,
}) => {
  // ---------------------------------------------
  // Local state (used only when NOT serverSide)
  // ---------------------------------------------
  const [internalSearch, setInternalSearch] = useState('');
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(
    pageSizeOptions && pageSizeOptions.length ? pageSizeOptions[0] : 10
  );
  const [selectedIds, setSelectedIds] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState(externalSearch || '');

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(internalSearch), 400);
    return () => clearTimeout(t);
  }, [internalSearch]);

  // Notify parent of debounced search (serverSide mode)
  useEffect(() => {
    if (serverSide && onSearchChange && debouncedSearch !== externalSearch) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch]);

  // Reset selection when data changes
  useEffect(() => {
    setSelectedIds([]);
    if (onSelectionChange) onSelectionChange([]);
  }, [data]);

  // ---------------------------------------------
  // Data pipeline
  // ---------------------------------------------
  const filteredData = useMemo(() => {
    if (serverSide) return data; // backend already filtered
    if (!internalSearch) return data;
    const q = internalSearch.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        if (col.searchable === false) return false;
        const v = row[col.key];
        if (v === undefined || v === null) return false;
        return String(v).toLowerCase().includes(q);
      })
    );
  }, [data, internalSearch, columns, serverSide]);

  const pageSize = serverSide ? (currentPageSize || 10) : internalPageSize;
  const currentPage = serverSide ? (currentServerPage || 1) : internalPage;
  const totalRecords = serverSide
    ? (totalFromServer != null ? totalFromServer : data.length)
    : filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const paginatedData = useMemo(() => {
    if (serverSide) return data;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize, serverSide, data]);

  // ---------------------------------------------
  // Selection helpers
  // ---------------------------------------------
  const rowId = (row, idx) => row._id || row.id || `${idx}`;

  const toggleRow = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    setSelectedIds(next);
    if (onSelectionChange) {
      onSelectionChange(data.filter((r, i) => next.includes(rowId(r, i))));
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === paginatedData.length && paginatedData.length > 0) {
      setSelectedIds([]);
      if (onSelectionChange) onSelectionChange([]);
    } else {
      const ids = paginatedData.map((r, i) => rowId(r, i));
      setSelectedIds(ids);
      if (onSelectionChange) {
        onSelectionChange(data.filter((r, i) => ids.includes(rowId(r, i))));
      }
    }
  };

  // ---------------------------------------------
  // Page change helpers
  // ---------------------------------------------
  const goToPage = (p) => {
    const clamped = Math.max(1, Math.min(totalPages, p));
    if (serverSide && onPageChange) onPageChange(clamped);
    else setInternalPage(clamped);
  };

  const changePageSize = (size) => {
    if (serverSide && onPageSizeChange) onPageSizeChange(size);
    else setInternalPageSize(size);
    // reset to page 1
    if (serverSide && onPageChange) onPageChange(1);
    else setInternalPage(1);
  };

  // ---------------------------------------------
  // Loading state
  // ---------------------------------------------
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '0.75rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔄</div>
        <p>Loading...</p>
      </div>
    );
  }

  const hasActions = onView || onEdit || onDelete;

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>

      {/* Toolbar — search + external filters + export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          {/* Search box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              placeholder="🔍 Search..."
              value={serverSide ? (externalSearch || '') : internalSearch}
              onChange={(e) => {
                if (serverSide) {
                  // controlled input: still update debounce
                  setInternalSearch(e.target.value);
                } else {
                  setInternalSearch(e.target.value);
                }
              }}
              style={{
                width: '100%',
                padding: '0.5rem 1rem 0.5rem 2.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
          </div>

          {/* External filters slot (status dropdown, date range, etc.) */}
          {externalFilters}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Page size selector */}
          {pageSizeOptions && pageSizeOptions.length > 1 && (
            <select
              value={pageSize}
              onChange={(e) => changePageSize(parseInt(e.target.value))}
              style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.85rem', background: 'white', cursor: 'pointer' }}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
          )}

          {/* Export CSV */}
          {onExport && (
            <button
              onClick={onExport}
              style={{
                padding: '0.5rem 0.85rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              ⬇️ Export CSV
            </button>
          )}

          {/* Record count */}
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            Showing {paginatedData.length} of {totalRecords}
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {enableRowSelect && selectedIds.length > 0 && (
        <div style={{ marginBottom: '0.75rem', padding: '0.6rem 0.85rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600 }}>
            {selectedIds.length} selected
          </span>
          <button
            onClick={() => { setSelectedIds([]); if (onSelectionChange) onSelectionChange([]); }}
            style={{ background: 'transparent', border: 'none', color: '#1e40af', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              {enableRowSelect && (
                <th style={{ padding: '0.75rem', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && selectedIds.length === paginatedData.length}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  color: '#4b5563',
                  textTransform: 'uppercase'
                }}>
                  {col.label}
                </th>
              ))}
              {hasActions && (
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  color: '#4b5563',
                  textTransform: 'uppercase'
                }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0) + (enableRowSelect ? 1 : 0)} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const id = rowId(row, index);
                const isSelected = selectedIds.includes(id);
                return (
                  <tr
                    key={id}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background-color 0.2s',
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                    }}
                    onClick={() => onRowClick && onRowClick(row)}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {enableRowSelect && (
                      <td style={{ padding: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} style={{
                        padding: '0.75rem',
                        fontSize: '0.9rem',
                        color: '#1e293b'
                      }}>
                        {col.render
                          ? col.render(row[col.key], row)
                          : (row[col.key] !== undefined && row[col.key] !== null && row[col.key] !== '')
                            ? row[col.key]
                            : '-'}
                      </td>
                    ))}
                    {hasActions && (
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {onView && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onView(row); }}
                              style={{ padding: '0.25rem 0.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                            >
                              👁️
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                              style={{ padding: '0.25rem 0.5rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                            >
                              ✏️
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onDelete(row); }}
                              style={{ padding: '0.25rem 0.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            Page {currentPage} of {totalPages}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: currentPage === 1 ? '#e5e7eb' : '#2563eb',
                color: currentPage === 1 ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ←
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNumber = currentPage - 2 + i;
              if (pageNumber < 1) pageNumber = i + 1;
              if (pageNumber > totalPages) return null;
              return (
                <button
                  key={i}
                  onClick={() => goToPage(pageNumber)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: currentPage === pageNumber ? '#2563eb' : '#e5e7eb',
                    color: currentPage === pageNumber ? 'white' : '#4b5563',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: currentPage === totalPages ? '#e5e7eb' : '#2563eb',
                color: currentPage === totalPages ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderTable;