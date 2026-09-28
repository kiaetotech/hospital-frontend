// src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopBar from '../components/admin/AdminTopBar';
import AdminFilterBar from '../components/admin/AdminFilterBar';

const AdminLayout = ({ children, filters = null, onFiltersChange = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    try {
      const data = localStorage.getItem('adminData');
      if (data) setAdminData(JSON.parse(data));
    } catch (e) {}
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f7fb',
      display: 'flex',
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      color: '#172033',
    }}>
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        currentPath={location.pathname}
      />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AdminTopBar adminData={adminData} />
        <AdminFilterBar filters={filters} onChange={onFiltersChange} />
        <main style={{ flex: 1, padding: '22px', maxWidth: 1600, width: '100%', margin: '0 auto' }}>
          {children}
        </main>
        <div style={{
          padding: '20px 22px',
          color: '#7a8495',
          fontSize: 11,
          borderTop: '1px solid #e5e9f2',
          backgroundColor: '#fff',
        }}>
          HospitalHub Admin Command Center • {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;