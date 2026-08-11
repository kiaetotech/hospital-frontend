import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const BulkEmployeeUpload = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
      setError('Please upload Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setFile(selectedFile);
    setError('');

    // Preview data
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        setPreview(jsonData.slice(0, 5));
      } catch (err) {
        setError('Failed to read file. Please check format.');
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('corporateToken');
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };

      const res = await axios.post('/api/corporate/hr/bulk-upload', formData, config);
      if (res.data.success) {
        alert(`✅ ${res.data.data.count} employees uploaded successfully!`);
        if (onUploadComplete) onUploadComplete();
        setFile(null);
        setPreview([]);
        document.getElementById('file-input').value = '';
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      ['Name', 'Email', 'Phone', 'Department', 'Designation', 'Date of Birth', 'Gender'],
      ['John Doe', 'john@company.com', '9876543210', 'Engineering', 'Developer', '1990-01-01', 'Male']
    ];
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, 'employee_template.xlsx');
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📤 Bulk Employee Upload</h3>
      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>Upload Excel or CSV file with employee details</p>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          id="file-input"
          type="file"
          onChange={handleFileUpload}
          accept=".xlsx,.xls,.csv"
          style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        />
        <button
          onClick={downloadTemplate}
          style={{ padding: '8px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          📄 Download Template
        </button>
      </div>

      {file && (
        <div style={{ marginTop: '1rem' }}>
          <p><strong>File:</strong> {file.name}</p>
          <button
            onClick={handleUpload}
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '8px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Uploading...' : '📤 Upload'}
          </button>
        </div>
      )}

      {preview.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Preview (first 5 rows):</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  {Object.keys(preview[0]).map((key) => (
                    <th key={key} style={{ padding: '0.5rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j} style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkEmployeeUpload;

