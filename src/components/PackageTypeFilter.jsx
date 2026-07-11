import React from 'react';

const packageTypes = [
  { value: 'basic', label: '📋 Basic', icon: '📋' },
  { value: 'executive', label: '💼 Executive', icon: '💼' },
  { value: 'fullbody', label: '🩺 Full Body', icon: '🩺' },
  { value: 'women', label: '👩 Women', icon: '👩' },
  { value: 'men', label: '👨 Men', icon: '👨' },
  { value: 'senior', label: '👴 Senior', icon: '👴' },
  { value: 'diabetes', label: '🩸 Diabetes', icon: '🩸' },
  { value: 'cardiac', label: '❤️ Cardiac', icon: '❤️' }
];

const PackageTypeFilter = ({ selectedType, onSelectType }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Package Type</label>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onSelectType('')}
          style={{
            padding: '8px 15px',
            backgroundColor: !selectedType ? '#10b981' : '#e5e7eb',
            color: !selectedType ? 'white' : '#374151',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          All
        </button>
        {packageTypes.map(type => (
          <button
            key={type.value}
            onClick={() => onSelectType(type.value)}
            style={{
              padding: '8px 15px',
              backgroundColor: selectedType === type.value ? '#10b981' : '#e5e7eb',
              color: selectedType === type.value ? 'white' : '#374151',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PackageTypeFilter;
