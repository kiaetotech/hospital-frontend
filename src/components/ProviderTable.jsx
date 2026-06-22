import React, { useState } from 'react';

const ProviderTable = ({
  columns,
  data,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  loading,
  emptyMessage = 'No records found'
}) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter data based on search
  const filteredData = data.filter(row => {
    if (!search) return true;
    return Object.values(row).some(value =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });

  // Paginate data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '0.75rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔄</div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      {/* Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ position: 'relative', width: '250px' }}>
          <input
            type="text"
            placeholder="🔍 Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
          Showing {paginatedData.length} of {filteredData.length} records
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
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
              {(onView || onEdit || onDelete) && (
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
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => onRowClick && onRowClick(row)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {columns.map((col) => (
                    <td key={col.key} style={{
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      color: '#1e293b'
                    }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key] || '-'}
                    </td>
                  ))}
                  {(onView || onEdit || onDelete) && (
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            Page {currentPage} of {totalPages}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                  onClick={() => setCurrentPage(pageNumber)}
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
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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