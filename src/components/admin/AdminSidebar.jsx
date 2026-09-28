// src/components/admin/AdminSidebar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHome, FaUsers, FaHospital, FaAmbulance, FaUserMd, FaFlask,
  FaLeaf, FaSeedling, FaBrain, FaHome as FaHome2, FaShieldAlt,
  FaCreditCard, FaBuilding, FaRupeeSign, FaChartBar, FaRobot,
  FaClipboardList, FaTag, FaFileAlt, FaCog, FaChevronDown,
  FaChevronRight, FaBars, FaTimes,
} from 'react-icons/fa';

const SECTIONS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: FaHome,
    items: [
      { label: 'Command Center', path: '/admin/command-center' },
      { label: 'Live Operations', path: '/admin/live' },
      { label: 'Classic Dashboard', path: '/admin' },
    ],
  },
  {
    key: 'users',
    label: 'Users',
    icon: FaUsers,
    items: [
      { label: 'Patients', path: '/admin/users?type=patient' },
      { label: 'Providers', path: '/admin/users?type=provider' },
      { label: 'Corporate Users', path: '/admin/users?type=corporate' },
      { label: 'All Users', path: '/admin/users' },
    ],
  },
  {
    key: 'services',
    label: 'Services',
    icon: FaHospital,
    items: [
      { label: 'Hospitals', path: '/admin/hospitals', icon: FaHospital },
      { label: 'Ambulance', path: '/admin/ambulance', icon: FaAmbulance },
      { label: 'Online Doctor', path: '/admin/online-doctor', icon: FaUserMd },
      { label: 'Diagnostics', path: '/admin/diagnostics', icon: FaFlask },
      { label: 'Ayurveda', path: '/admin/ayurveda', icon: FaLeaf },
      { label: 'Homeopathy', path: '/admin/homeopathy', icon: FaSeedling },
      { label: 'Mental Health', path: '/admin/mentalhealth', icon: FaBrain },
      { label: 'Caregivers', path: '/admin/caregivers', icon: FaHome2 },
      { label: 'Insurance', path: '/admin/insurance', icon: FaShieldAlt },
      { label: 'Health EMI / Loan', path: '/admin/lenders', icon: FaCreditCard },
      { label: 'Corporate Health', path: '/admin/corporate', icon: FaBuilding },
      // DietCare placeholder — add when tag is built
      { label: 'DietCare (soon)', path: '/admin/dietcare', disabled: true },
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    icon: FaRupeeSign,
    items: [
      { label: 'Commission Rules', path: '/admin/taxes?tab=commission' },
      { label: 'GST Rules', path: '/admin/taxes?tab=gst' },
      { label: 'TDS Rules', path: '/admin/taxes?tab=tds' },
      { label: 'Discounts', path: '/admin/taxes?tab=discounts' },
      { label: 'Payouts', path: '/admin/payouts' },
      { label: 'Settlements', path: '/admin/ayurveda' },
      { label: 'Finance Overview', path: '/admin/finance' },
    ],
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: FaChartBar,
    items: [
      { label: 'Tag-wise', path: '/admin/reports/tag-wise', disabled: true },
      { label: 'State-wise', path: '/admin/reports/state-wise', disabled: true },
      { label: 'City-wise', path: '/admin/reports/city-wise', disabled: true },
      { label: 'Provider-wise', path: '/admin/reports/provider-wise', disabled: true },
      { label: 'Conversion', path: '/admin/reports/conversion', disabled: true },
    ],
  },
  {
    key: 'ai',
    label: 'AI',
    icon: FaRobot,
    items: [
      { label: 'AI Control Center', path: '/ai-control-center' },
      { label: 'Agents', path: '/ai-control-center?view=agents' },
      { label: 'Alerts', path: '/ai-control-center?view=alerts' },
      { label: 'Human Queue', path: '/ai-control-center?view=queue' },
      { label: 'Audit Log', path: '/ai-control-center?view=audit' },
    ],
  },
  {
    key: 'operations',
    label: 'Operations',
    icon: FaClipboardList,
    items: [
      { label: 'Bookings', path: '/admin/bookings', disabled: true },
      { label: 'Complaints', path: '/admin/complaints', disabled: true },
      { label: 'Reviews', path: '/admin/reviews', disabled: true },
      { label: 'Cancellations', path: '/admin/cancellations', disabled: true },
    ],
  },
  {
    key: 'marketplace',
    label: 'Marketplace',
    icon: FaTag,
    items: [
      { label: 'Discounts', path: '/admin/taxes?tab=discounts' },
      { label: 'Coupons', path: '/admin/taxes?tab=discounts' },
      { label: 'Featured Providers', path: '/admin/featured', disabled: true },
      { label: 'Campaigns', path: '/admin/campaigns', disabled: true },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: FaFileAlt,
    items: [
      { label: 'Report Generator', path: '/admin/reports', disabled: true },
      { label: 'Financial', path: '/admin/reports/financial', disabled: true },
      { label: 'Tag-wise', path: '/admin/reports/tag-wise', disabled: true },
      { label: 'Scheduled Reports', path: '/admin/reports/scheduled', disabled: true },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: FaCog,
    items: [
      { label: 'Platform Settings', path: '/admin/settings' },
      { label: 'Bulk Upload', path: '/admin/upload' },
    ],
  },
];

const AdminSidebar = ({ collapsed, onToggle, currentPath }) => {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState({
    dashboard: true,
    services: false,
    finance: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path) => {
    if (!path) return false;
    const cleanPath = path.split('?')[0];
    return currentPath === cleanPath || currentPath.startsWith(cleanPath + '/');
  };

  const handleItemClick = (item) => {
    if (item.disabled) return;
    navigate(item.path);
  };

  return (
    <aside style={{
      width: collapsed ? 64 : 240,
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      flexShrink: 0,
      borderRight: '1px solid #1e293b',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* LOGO + TOGGLE */}
      <div style={{
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #1e293b',
      }}>
        {!collapsed && (
          <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: 0.5 }}>
            🏥 HospitalHub
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: 16,
            padding: 6,
            display: 'flex',
            alignItems: 'center',
          }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      {/* SECTIONS */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {SECTIONS.map((section) => {
          const SectionIcon = section.icon;
          const isOpen = openSections[section.key];
          const hasActiveChild = section.items.some((item) => isActive(item.path));

          return (
            <div key={section.key}>
              <button
                onClick={() => toggleSection(section.key)}
                style={{
                  width: '100%',
                  padding: collapsed ? '12px 0' : '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: hasActiveChild ? '#fff' : '#cbd5e1',
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                title={collapsed ? section.label : ''}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <SectionIcon size={15} />
                  {!collapsed && <span>{section.label}</span>}
                </div>
                {!collapsed && (
                  isOpen ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />
                )}
              </button>

              {isOpen && !collapsed && (
                <div style={{ paddingBottom: 4 }}>
                  {section.items.map((item, idx) => {
                    const active = isActive(item.path);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleItemClick(item)}
                        disabled={item.disabled}
                        style={{
                          width: '100%',
                          padding: '8px 16px 8px 42px',
                          background: active ? '#1e293b' : 'transparent',
                          border: 'none',
                          color: item.disabled
                            ? '#475569'
                            : active
                            ? '#60a5fa'
                            : '#94a3b8',
                          fontSize: 12.5,
                          textAlign: 'left',
                          cursor: item.disabled ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontWeight: active ? 700 : 500,
                          borderLeft: active ? '3px solid #60a5fa' : '3px solid transparent',
                          paddingLeft: 39,
                        }}
                        title={item.disabled ? 'Coming soon' : ''}
                      >
                        {item.label}
                        {item.disabled && (
                          <span style={{ fontSize: 9, opacity: 0.6, fontStyle: 'italic' }}>
                            soon
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* VERSION */}
      <div style={{
        padding: 12,
        borderTop: '1px solid #1e293b',
        fontSize: 10,
        color: '#64748b',
        textAlign: collapsed ? 'center' : 'left',
      }}>
        {collapsed ? 'v2.0' : 'Admin v2.0 • Command Center'}
      </div>
    </aside>
  );
};

export default AdminSidebar;