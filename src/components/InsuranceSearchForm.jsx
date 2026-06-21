import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InsuranceSearchForm = ({ onSearch }) => {
  const navigate = useNavigate();
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
  const [errors, setErrors] = useState({});

  const handleMemberToggle = (member) => {
    setMembers(prev => ({ ...prev, [member]: !prev[member] }));
    // Clear error when user interacts
    if (errors.members) {
      setErrors(prev => ({ ...prev, members: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate age
    if (!age) {
      newErrors.age = 'Age is required';
    } else if (parseInt(age) < 18) {
      newErrors.age = 'Age must be 18 or above';
    } else if (parseInt(age) > 80) {
      newErrors.age = 'Age must be 80 or below';
    }
    
    // Validate phone
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(phone)) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }
    
    // Validate pincode
    if (!pincode) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(pincode)) {
      newErrors.pincode = 'Enter a valid 6-digit pincode';
    }
    
    // Validate members
    const selectedCount = Object.values(members).filter(v => v).length;
    if (selectedCount === 0) {
      newErrors.members = 'Select at least one member';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('members', JSON.stringify(members));
    params.append('age', age);
    params.append('phone', phone);
    params.append('pincode', pincode);
    
    // If onSearch prop is provided, use it (for parent component)
    if (onSearch) {
      onSearch({ members, age, phone, pincode });
    } else {
      // Otherwise navigate directly
      navigate(`/insurance/list?${params.toString()}`);
    }
  };

  // Count selected members
  const selectedCount = Object.values(members).filter(v => v).length;

  // Get member display name
  const getMemberLabel = (member) => {
    const labels = {
      self: 'Self',
      wife: 'Wife',
      son: 'Son',
      daughter: 'Daughter',
      father: 'Father',
      mother: 'Mother'
    };
    return labels[member] || member;
  };

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
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: members[member] ? '#eff6ff' : 'transparent',
              border: members[member] ? '2px solid #2563eb' : '1px solid #e5e7eb',
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={members[member]}
                onChange={() => handleMemberToggle(member)}
                style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
              />
              <span style={{ 
                fontSize: '0.9rem', 
                fontWeight: members[member] ? 'bold' : 'normal',
                color: members[member] ? '#1e293b' : '#4b5563'
              }}>
                {getMemberLabel(member)}
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
            fontWeight: 'bold',
            padding: '0.25rem 0'
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
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: members[member] ? '#eff6ff' : 'transparent',
                border: members[member] ? '2px solid #2563eb' : '1px solid #e5e7eb',
                transition: 'all 0.2s'
              }}>
                <input
                  type="checkbox"
                  checked={members[member]}
                  onChange={() => handleMemberToggle(member)}
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                />
                <span style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: members[member] ? 'bold' : 'normal',
                  color: members[member] ? '#1e293b' : '#4b5563'
                }}>
                  {getMemberLabel(member)}
                </span>
              </label>
            ))}
          </div>
        )}

        <div style={{ 
          marginTop: '0.5rem', 
          fontSize: '0.8rem', 
          color: errors.members ? '#dc2626' : '#6b7280'
        }}>
          {errors.members || `${selectedCount} member${selectedCount > 1 ? 's' : ''} selected`}
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
            Age of eldest member *
          </label>
          <input
            type="number"
            placeholder="e.g., 30"
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              if (errors.age) setErrors(prev => ({ ...prev, age: '' }));
            }}
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              border: errors.age ? '2px solid #dc2626' : '1px solid #d1d5db', 
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = errors.age ? '#dc2626' : '#d1d5db'}
          />
          {errors.age && (
            <div style={{ fontSize: '0.7rem', color: '#dc2626', marginTop: '4px' }}>
              {errors.age}
            </div>
          )}
        </div>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.8rem', 
            fontWeight: 'bold', 
            marginBottom: '4px',
            color: '#4b5563'
          }}>
            Phone Number *
          </label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              padding: '10px 8px', 
              backgroundColor: '#f3f4f6', 
              border: errors.phone ? '2px solid #dc2626' : '1px solid #d1d5db',
              borderRight: 'none',
              borderRadius: '8px 0 0 8px',
              fontSize: '0.9rem',
              color: '#4b5563',
              borderColor: errors.phone ? '#dc2626' : '#d1d5db'
            }}>
              +91
            </span>
            <input
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
              }}
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                border: errors.phone ? '2px solid #dc2626' : '1px solid #d1d5db', 
                borderRadius: '0 8px 8px 0',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = errors.phone ? '#dc2626' : '#d1d5db'}
            />
          </div>
          {errors.phone && (
            <div style={{ fontSize: '0.7rem', color: '#dc2626', marginTop: '4px' }}>
              {errors.phone}
            </div>
          )}
        </div>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.8rem', 
            fontWeight: 'bold', 
            marginBottom: '4px',
            color: '#4b5563'
          }}>
            Pincode *
          </label>
          <input
            type="text"
            placeholder="110001"
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value);
              if (errors.pincode) setErrors(prev => ({ ...prev, pincode: '' }));
            }}
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              border: errors.pincode ? '2px solid #dc2626' : '1px solid #d1d5db', 
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = errors.pincode ? '#dc2626' : '#d1d5db'}
          />
          {errors.pincode && (
            <div style={{ fontSize: '0.7rem', color: '#dc2626', marginTop: '4px' }}>
              {errors.pincode}
            </div>
          )}
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