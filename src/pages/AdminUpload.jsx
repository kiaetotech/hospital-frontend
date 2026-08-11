import React, { useState } from 'react';
import api from '../services/api';

const AdminUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/diagnostics/upload/full', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(res.data.message || 'Upload successful!');
    } catch (error) {
      setMessage('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Upload Diagnostics Data</h1>
        <p style={{ marginBottom: '1rem', color: '#6b7280' }}>Upload Excel file with sheets: Categories, Providers, Tests, Pricing, Packages</p>
        
        <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files[0])} style={{ marginBottom: '1rem', display: 'block' }} />
        
        <button onClick={handleUpload} disabled={loading} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
        
        {message && <p style={{ marginTop: '1rem', color: message.includes('failed') ? '#dc2626' : '#10b981' }}>{message}</p>}
      </div>
    </div>
  );
};

export default AdminUpload;

