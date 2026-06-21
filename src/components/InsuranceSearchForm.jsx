import React, { useState } from 'react';

const InsuranceSearchForm = ({ onSearch }) => {
  const [members, setMembers] = useState({
    self: true,
    wife: false,
    son: false,
    daughter: false,
    father: false,
    mother: false
  });
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [showMore, setShowMore] = useState(false);

  const handleMemberToggle = (member) => {
    setMembers(prev => ({ ...prev, [member]: !prev[member] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ members, age, phone, pincode });
    }
  };

  // Count selected members
  const selectedCount = Object.values(members).filter(v => v).length;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h3 style={{ 
        fontSize: '1.25rem', 
        fontWeight: 'bold', 
        marginBottom: '0.5rem',
        color: '#1e293b'
      }}>
        🛡️ Get Your Family the Health Cover
      </h3>
      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Select members you want to insure
      </p>
      
      {/* Members Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
          gap: '0.5rem'
        }}>
          {['self', 'wife', 'son', 'daughter'].map((member) => (
            <label key={member} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              backgroundColor: members[member] ? '#eff6ff' : 'transparent',
              border: members[member] ? '2px solid #2563eb' : '1px solid transparent'
            }}>
              <input
                type="checkbox"
                checked={members[member]}
                onChange={() => handleMemberToggle(member)}
                style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: members[member] ? 'bold' : 'normal' }}>
                {member.charAt(0).toUpperCase() + member.slice(1)}
              </span>
            </label>
          ))}
        </div>

        {/* More Members - Collapsible */}
        <button
          onClick={() => setShowMore(!showMore)}
          style={{
            marginTop: '0.5rem',
            color: '#2563eb',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}
        >
          {showMore ? '▲ Less members' : '▼ More members'}
        </button>

        {showMore && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
            gap: '0.5rem',
            marginTop: '0.5rem'
          }}>
            {['father', 'mother'].map((member) => (
              <label key={member} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '8px',
                backgroundColor: members[member] ? '#eff6ff' : 'transparent',
                border: members[member] ? '2px solid #2563eb' : '1px solid transparent'
              }}>
                <input
                  type="checkbox"
                  checked={members[member]}
                  onChange={() => handleMemberToggle(member)}
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: members[member] ? 'bold' : 'normal' }}>
                  {member.charAt(0).toUpperCase() + member.slice(1)}
                </span>
              </label>
            ))}
          </div>
        )}

        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
          {selectedCount} member{selectedCount > 1 ? 's' : ''} selected
        </div>
      </div>

      {/* Age, Phone, Pincode */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.8rem', 
            fontWeight: 'bold', 
            marginBottom: '4px',
            color: '#4b5563'
          }}>
            Age of eldest member
          </label>
          <input
            type="number"
            placeholder="e.g., 30"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              border: '1px solid #d1d5db', 
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.8rem', 
            fontWeight: 'bold', 
            marginBottom: '4px',
            color: '#4b5563'
          }}>
            Phone Number
          </label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              padding: '10px 8px', 
              backgroundColor: '#f3f4f6', 
              border: '1px solid #d1d5db',
              borderRight: 'none',
              borderRadius: '8px 0 0 8px',
              fontSize: '0.9rem',
              color: '#4b5563'
            }}>
              +91
            </span>
            <input
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '0 8px 8px 0',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
        </div>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.8rem', 
            fontWeight: 'bold', 
            marginBottom: '4px',
            color: '#4b5563'
          }}>
            Pincode
          </label>
          <input
            type="text"
            placeholder="110001"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              border: '1px solid #d1d5db', 
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          cursor: 'pointer',
          transition: 'background-color 0.2s, transform 0.1s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        🔍 Check Prices →
      </button>

      <div style={{ 
        marginTop: '1rem', 
        fontSize: '0.7rem', 
        color: '#9ca3af', 
        textAlign: 'center'
      }}>
        By clicking "Check Prices", you agree to our Privacy Policy & Terms of Use
      </div>
    </div>
  );
};

export default InsuranceSearchForm;