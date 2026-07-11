import React from 'react';

const ProviderStatsCards = ({ stats }) => {
  const statConfigs = [
    { key: 'totalBookings', label: '📋 Total Bookings', color: '#2563eb' },
    { key: 'pendingBookings', label: '⏳ Pending', color: '#f59e0b' },
    { key: 'completedBookings', label: '✅ Completed', color: '#10b981' },
    { key: 'totalRevenue', label: '💰 Total Revenue', color: '#059669', currency: true },
    { key: 'commission', label: '💸 Commission', color: '#8b5cf6', currency: true },
    { key: 'rating', label: '⭐ Rating', color: '#f59e0b' },
    { key: 'totalPatients', label: '👨‍👩‍👧‍👦 Total Patients', color: '#6b7280' },
    { key: 'activeStaff', label: '👨‍⚕️ Active Staff', color: '#10b981' }
  ];

  const visibleStats = statConfigs.filter(stat => stats[stat.key] !== undefined);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${visibleStats.length > 4 ? '200px' : '250px'}, 1fr))`,
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      {visibleStats.map((stat) => (
        <div key={stat.key} style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          borderLeft: `4px solid ${stat.color}`
        }}>
          <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>{stat.label}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: stat.color }}>
            {stat.currency ? '₹' : ''}
            {typeof stats[stat.key] === 'number' 
              ? (stat.currency ? stats[stat.key].toLocaleString() : stats[stat.key]) 
              : stats[stat.key] || '0'}
            {stat.key === 'rating' ? ` / 5.0` : ''}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ProviderStatsCards;
