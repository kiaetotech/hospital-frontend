import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmergencyContacts, updateEmergencyContacts } from '../../services/api';

const EmergencyContacts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [medicalInfo, setMedicalInfo] = useState({
    bloodGroup: '',
    allergies: [],
    chronicConditions: [],
    currentMedications: [],
    isOrganDonor: false
  });
  const [insuranceInfo, setInsuranceInfo] = useState({
    provider: '',
    policyNumber: '',
    tpaProvider: ''
  });
  const [ambulancePrefs, setAmbulancePrefs] = useState({
    preferredAmbulanceType: 'any',
    requiresOxygen: false,
    requiresStretcher: false,
    specialInstructions: '',
    buildingInfo: { floor: '', hasElevator: true, accessNotes: '' }
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await getEmergencyContacts();
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        if (data.contacts?.length > 0) setContacts(data.contacts);
        if (data.medicalInfo) setMedicalInfo(prev => ({ ...prev, ...data.medicalInfo }));
        if (data.insuranceInfo) setInsuranceInfo(prev => ({ ...prev, ...data.insuranceInfo }));
        if (data.ambulancePreferences) setAmbulancePrefs(prev => ({ ...prev, ...data.ambulancePreferences }));
      }
    } catch (err) {
      setError('Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  const addContact = () => {
    setContacts(prev => [...prev, {
      name: '',
      phone: '',
      relationship: 'family',
      priority: prev.length + 1,
      isEmergencyContact: true,
      available24x7: true
    }]);
  };

  const removeContact = (index) => {
    setContacts(prev => prev.filter((_, i) => i !== index));
  };

  const updateContact = (index, field, value) => {
    setContacts(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await updateEmergencyContacts({
        contacts,
        medicalInfo,
        insuranceInfo,
        ambulancePreferences: ambulancePrefs
      });

      if (res.data?.success) {
        setMessage('Emergency contacts saved successfully!');
      } else {
        setError(res.data?.error || 'Failed to save');
      }
    } catch (err) {
      setError('Failed to save emergency contacts');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <p style={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/ambulance')} style={styles.backBtn}>← Back</button>
        <h1 style={styles.title}>🛡️ Emergency Contacts</h1>
        <div style={{ width: '50px' }} />
      </div>
      <p style={styles.subtitle}>This information is shared during emergencies to help first responders</p>

      {/* Emergency Contacts */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>👥 Emergency Contacts</h3>
          <button onClick={addContact} style={styles.addBtn}>+ Add Contact</button>
        </div>

        {contacts.length === 0 && (
          <p style={styles.emptyText}>No emergency contacts added yet. Add at least one.</p>
        )}

        {contacts.map((contact, index) => (
          <div key={index} style={styles.contactCard}>
            <div style={styles.contactHeader}>
              <span style={styles.contactNumber}>#{contact.priority || index + 1}</span>
              <button onClick={() => removeContact(index)} style={styles.removeBtn}>✕</button>
            </div>
            <input
              type="text"
              placeholder="Full Name *"
              value={contact.name}
              onChange={(e) => updateContact(index, 'name', e.target.value)}
              style={styles.input}
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              value={contact.phone}
              onChange={(e) => updateContact(index, 'phone', e.target.value)}
              style={styles.input}
            />
            <select
              value={contact.relationship}
              onChange={(e) => updateContact(index, 'relationship', e.target.value)}
              style={styles.select}
            >
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="child">Child</option>
              <option value="sibling">Sibling</option>
              <option value="relative">Relative</option>
              <option value="friend">Friend</option>
              <option value="neighbor">Neighbor</option>
              <option value="caregiver">Caregiver</option>
              <option value="other">Other</option>
            </select>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={contact.available24x7}
                onChange={(e) => updateContact(index, 'available24x7', e.target.checked)}
              />
              Available 24/7
            </label>
          </div>
        ))}
      </div>

      {/* Medical Information */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🩺 Medical Information</h3>

        <select
          value={medicalInfo.bloodGroup}
          onChange={(e) => setMedicalInfo(prev => ({ ...prev, bloodGroup: e.target.value }))}
          style={styles.select}
        >
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>

        <input
          type="text"
          placeholder="Allergies (comma separated) e.g., Penicillin, Peanuts"
          value={medicalInfo.allergies?.join(', ')}
          onChange={(e) => setMedicalInfo(prev => ({ ...prev, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Chronic Conditions (comma separated)"
          value={medicalInfo.chronicConditions?.join(', ')}
          onChange={(e) => setMedicalInfo(prev => ({ ...prev, chronicConditions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Current Medications (comma separated)"
          value={medicalInfo.currentMedications?.join(', ')}
          onChange={(e) => setMedicalInfo(prev => ({ ...prev, currentMedications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
          style={styles.input}
        />

        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={medicalInfo.isOrganDonor}
            onChange={(e) => setMedicalInfo(prev => ({ ...prev, isOrganDonor: e.target.checked }))}
          />
          🫀 I am an organ donor
        </label>
      </div>

      {/* Insurance Information */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🛡️ Insurance (Optional)</h3>
        <input
          type="text"
          placeholder="Insurance Provider"
          value={insuranceInfo.provider}
          onChange={(e) => setInsuranceInfo(prev => ({ ...prev, provider: e.target.value }))}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Policy Number"
          value={insuranceInfo.policyNumber}
          onChange={(e) => setInsuranceInfo(prev => ({ ...prev, policyNumber: e.target.value }))}
          style={styles.input}
        />
      </div>

      {/* Ambulance Preferences */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🚑 Ambulance Preferences</h3>
        <select
          value={ambulancePrefs.preferredAmbulanceType}
          onChange={(e) => setAmbulancePrefs(prev => ({ ...prev, preferredAmbulanceType: e.target.value }))}
          style={styles.select}
        >
          <option value="any">Any Type</option>
          <option value="basic">Basic Life Support</option>
          <option value="cardiac">Cardiac</option>
          <option value="ventilator">Ventilator</option>
          <option value="neonatal">Neonatal</option>
          <option value="wheelchair">Wheelchair Accessible</option>
        </select>

        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={ambulancePrefs.requiresOxygen}
            onChange={(e) => setAmbulancePrefs(prev => ({ ...prev, requiresOxygen: e.target.checked }))}
          />
          🫁 Requires Oxygen
        </label>

        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={ambulancePrefs.requiresStretcher}
            onChange={(e) => setAmbulancePrefs(prev => ({ ...prev, requiresStretcher: e.target.checked }))}
          />
          🛏️ Requires Stretcher
        </label>

        <input
          type="text"
          placeholder="Special Instructions for Ambulance Crew"
          value={ambulancePrefs.specialInstructions}
          onChange={(e) => setAmbulancePrefs(prev => ({ ...prev, specialInstructions: e.target.value }))}
          style={styles.input}
        />

        <h4 style={styles.subSectionTitle}>🏢 Building Access</h4>
        <div style={styles.row}>
          <input
            type="number"
            placeholder="Floor #"
            value={ambulancePrefs.buildingInfo?.floor}
            onChange={(e) => setAmbulancePrefs(prev => ({ ...prev, buildingInfo: { ...prev.buildingInfo, floor: e.target.value } }))}
            style={{ ...styles.input, flex: 1 }}
          />
          <label style={{ ...styles.checkbox, flex: 1 }}>
            <input
              type="checkbox"
              checked={ambulancePrefs.buildingInfo?.hasElevator}
              onChange={(e) => setAmbulancePrefs(prev => ({ ...prev, buildingInfo: { ...prev.buildingInfo, hasElevator: e.target.checked } }))}
            />
            Has Elevator
          </label>
        </div>
        <input
          type="text"
          placeholder="Access Notes (e.g., Narrow staircase, Service elevator only)"
          value={ambulancePrefs.buildingInfo?.accessNotes}
          onChange={(e) => setAmbulancePrefs(prev => ({ ...prev, buildingInfo: { ...prev.buildingInfo, accessNotes: e.target.value } }))}
          style={styles.input}
        />
      </div>

      {/* Messages */}
      {error && <div style={styles.error}>{error}</div>}
      {message && <div style={styles.success}>{message}</div>}

      {/* Save Button */}
      <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
        {saving ? '💾 Saving...' : '💾 Save Emergency Profile'}
      </button>

      <p style={styles.disclaimer}>
        ⚠️ This information will be shared with emergency responders and hospitals during an emergency.
      </p>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f0f1a',
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto'
  },
  loadingContainer: {
    textAlign: 'center',
    paddingTop: '100px'
  },
  loadingText: {
    color: '#aaa',
    fontSize: '16px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#e53935',
    fontSize: '14px',
    cursor: 'pointer'
  },
  title: {
    color: '#fff',
    fontSize: '20px',
    margin: 0
  },
  subtitle: {
    color: '#aaa',
    fontSize: '13px',
    marginBottom: '25px',
    textAlign: 'center',
    lineHeight: '1.5'
  },
  section: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '15px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  sectionTitle: {
    color: '#fff',
    fontSize: '16px',
    margin: '0 0 12px 0'
  },
  subSectionTitle: {
    color: '#ccc',
    fontSize: '14px',
    margin: '12px 0 8px 0'
  },
  addBtn: {
    padding: '8px 16px',
    background: '#e53935',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  emptyText: {
    color: '#888',
    fontSize: '14px',
    textAlign: 'center',
    padding: '20px'
  },
  contactCard: {
    background: '#0f0f1a',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '10px'
  },
  contactHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  contactNumber: {
    background: '#e53935',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#e53935',
    fontSize: '18px',
    cursor: 'pointer'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #333',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#0f0f1a',
    color: '#fff',
    marginBottom: '8px',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #333',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#0f0f1a',
    color: '#fff',
    marginBottom: '8px',
    boxSizing: 'border-box'
  },
  row: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  checkbox: {
    color: '#ccc',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    marginBottom: '8px'
  },
  error: {
    background: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '15px'
  },
  success: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '15px'
  },
  saveBtn: {
    width: '100%',
    padding: '16px',
    background: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '15px'
  },
  disclaimer: {
    color: '#888',
    fontSize: '12px',
    textAlign: 'center',
    lineHeight: '1.5'
  }
};

export default EmergencyContacts;
