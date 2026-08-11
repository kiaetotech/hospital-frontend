import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const AdminPanel = () => {
  const [tests, setTests] = useState([]);
  const [providers, setProviders] = useState([]);
  const [activeTab, setActiveTab] = useState('tests');
  const [testFile, setTestFile] = useState(null);
  const [message, setMessage] = useState('');
  
  const API_URL = 'https://hospital-backend-production-7d0f.up.railway.app/api';

  useEffect(() => {
    fetchTests();
    fetchProviders();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await axios.get(`${API_URL}/tests/all`);
      setTests(response.data.tests || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await axios.get(`${API_URL}/provider-auth/providers`);
      setProviders(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleTestUpload = async (e) => {
    e.preventDefault();
    if (!testFile) return;
    
    const formData = new FormData();
    formData.append('file', testFile);
    
    try {
      const response = await axios.post(`${API_URL}/upload/tests`, formData);
      setMessage(`✅ ${response.data.message}`);
      fetchTests();
    } catch (error) {
      setMessage(`❌ Upload failed`);
    }
  };

  const downloadTemplate = () => {
    const template = [
      ['testName', 'category', 'subCategory', 'description'],
      ['New Test', 'Category', 'SubCategory', 'Description here']
    ];
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tests');
    XLSX.writeFile(wb, 'tests_template.xlsx');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>👑 Admin Panel</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('tests')} style={{ padding: '10px 20px', backgroundColor: activeTab === 'tests' ? '#10b981' : '#f3f4f6' }}>Tests ({tests.length})</button>
        <button onClick={() => setActiveTab('providers')} style={{ padding: '10px 20px', backgroundColor: activeTab === 'providers' ? '#10b981' : '#f3f4f6' }}>Providers ({providers.length})</button>
      </div>
      
      {activeTab === 'tests' && (
        <div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
            <h3>Upload Tests</h3>
            <button onClick={downloadTemplate} style={{ marginBottom: '10px', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px' }}>Download Template</button>
            <form onSubmit={handleTestUpload}>
              <input type="file" accept=".xlsx, .xls" onChange={(e) => setTestFile(e.target.files[0])} />
              <button type="submit" style={{ marginLeft: '10px', padding: '8px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px' }}>Upload</button>
            </form>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Test Name</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Category</th>
              </tr>
            </thead>
            <tbody>
              {tests.slice(0, 50).map(test => (
                <tr key={test._id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{test.testName}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{test.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {activeTab === 'providers' && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Provider</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>City</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Verified</th>
            </tr>
          </thead>
          <tbody>
            {providers.map(provider => (
              <tr key={provider._id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{provider.providerName}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{provider.email}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{provider.city || '-'}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{provider.isVerified ? '✅' : '⏳'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {message && <p style={{ marginTop: '20px' }}>{message}</p>}
    </div>
  );
};

export default AdminPanel;

