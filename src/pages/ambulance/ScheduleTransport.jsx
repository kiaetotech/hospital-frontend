import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scheduleTransport, getAmbulanceFareEstimate } from '../../services/api';

const ScheduleTransport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fareEstimate, setFareEstimate] = useState(null);
  const [form, setForm] = useState({
    patientName: '',
    patientPhone: '',
    patientAge: '',
    patientGender: 'male',
    pickupAddress: '',
    pickupLat: '',
    pickupLng: '',
    destinationAddress: '',
    destinationLat: '',
    destinationLng: '',
    hospitalName: '',
    ambulanceType: 'basic',
    scheduledDate: '',
    scheduledTime: '10:00',
    requiresOxygen: false,
    requiresAttendant: false,
    mobilityType: 'walking',
    specialRequirements: '',
    isRecurring: false,
    recurringDays: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const ambulanceTypes = [
    { value: 'basic', label: '🚑 Basic Life Support', price: '₹500 base' },
    { value: 'cardiac', label: '❤️ Cardiac Ambulance', price: '₹750 base' },
    { value: 'ventilator', label: '🫁 Ventilator Ambulance', price: '₹900 base' },
    { value: 'neonatal', label: '👶 Neonatal Ambulance', price: '₹1000 base' },
    { value: 'wheelchair', label: '♿ Wheelchair Transport', price: '₹400 base' }
  ];

  const mobilityTypes = [
    { value: 'walking', label: '🚶 Walking' },
    { value: 'wheelchair', label: '♿ Wheelchair' },
    { value: 'stretcher', label: '🛏️ Stretcher' }
  ];

  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    if (form.pickupLat && form.pickupLng && form.destinationLat && form.destinationLng) {
      fetchFareEstimate();
    }
  }, [form.ambulanceType, form.pickupLat, form.destinationLat]);

  const fetchFareEstimate = async () => {
    try {
      const dist = calculateDistance(
        parseFloat(form.pickupLat), parseFloat(form.pickupLng),
        parseFloat(form.destinationLat), parseFloat(form.destinationLng)
      );
      const res = await getAmbulanceFareEstimate({
        distance: dist,
        ambulanceType: form.ambulanceType,
        isEmergency: 'false'
      });
      if (res.data?.data) {
        setFareEstimate(res.data.data);
      }
    } catch (err) {}
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  };

  const getCurrentLocation = (type) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (type === 'pickup') {
            setForm(prev => ({
              ...prev,
              pickupLat: pos.coords.latitude.toString(),
              pickupLng: pos.coords.longitude.toString(),
              pickupAddress: 'Current Location'
            }));
          } else {
            setForm(prev => ({
              ...prev,
              destinationLat: pos.coords.latitude.toString(),
              destinationLng: pos.coords.longitude.toString()
            }));
          }
        },
        () => setError('Unable to get location')
      );
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleRecurringDay = (day) => {
    setForm(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!form.patientName || !form.patientPhone || !form.scheduledDate) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const res = await scheduleTransport(form);
      if (res.data?.success) {
        setSuccess(`Ambulance scheduled! Booking ID: ${res.data.data.bookingId}`);
        setTimeout(() => navigate('/ambulance'), 2000);
      } else {
        setError(res.data?.error || 'Failed to schedule');
      }
    } catch (err) {
      setError('Failed to schedule transport. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/ambulance')} style={styles.backBtn}>← Back</button>
        <h1 style={styles.title}>📅 Schedule Transport</h1>
        <div style={{ width: '50px' }} />
      </div>

      <p style={styles.subtitle}>Book a non-emergency ambulance in advance</p>

      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Patient Details */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>👤 Patient Details</h3>
          <input
            type="text"
            placeholder="Patient Name *"
            value={form.patientName}
            onChange={(e) => handleChange('patientName', e.target.value)}
            style={styles.input}
            required
          />
          <div style={styles.row}>
            <input
              type="tel"
              placeholder="Phone Number *"
              value={form.patientPhone}
              onChange={(e) => handleChange('patientPhone', e.target.value)}
              style={{ ...styles.input, flex: 1 }}
              required
            />
            <input
              type="number"
              placeholder="Age"
              value={form.patientAge}
              onChange={(e) => handleChange('patientAge', e.target.value)}
              style={{ ...styles.input, width: '80px' }}
            />
          </div>
          <select
            value={form.patientGender}
            onChange={(e) => handleChange('patientGender', e.target.value)}
            style={styles.select}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Pickup Location */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📍 Pickup Location</h3>
          <input
            type="text"
            placeholder="Pickup Address"
            value={form.pickupAddress}
            onChange={(e) => handleChange('pickupAddress', e.target.value)}
            style={styles.input}
          />
          <button type="button" onClick={() => getCurrentLocation('pickup')} style={styles.locationBtn}>
            📍 Use Current Location
          </button>
          {form.pickupLat && (
            <p style={styles.coords}>Coordinates: {form.pickupLat}, {form.pickupLng}</p>
          )}
        </div>

        {/* Destination */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🏥 Destination</h3>
          <input
            type="text"
            placeholder="Hospital Name"
            value={form.hospitalName}
            onChange={(e) => handleChange('hospitalName', e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Destination Address"
            value={form.destinationAddress}
            onChange={(e) => handleChange('destinationAddress', e.target.value)}
            style={styles.input}
          />
          <button type="button" onClick={() => getCurrentLocation('destination')} style={styles.locationBtn}>
            📍 Use Current Location
          </button>
        </div>

        {/* Schedule */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📅 Date & Time</h3>
          <div style={styles.row}>
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(e) => handleChange('scheduledDate', e.target.value)}
              style={{ ...styles.input, flex: 1 }}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <input
              type="time"
              value={form.scheduledTime}
              onChange={(e) => handleChange('scheduledTime', e.target.value)}
              style={{ ...styles.input, width: '120px' }}
            />
          </div>
        </div>

        {/* Ambulance Type */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🚑 Ambulance Type</h3>
          {ambulanceTypes.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleChange('ambulanceType', type.value)}
              style={{
                ...styles.typeBtn,
                borderColor: form.ambulanceType === type.value ? '#e53935' : '#333',
                background: form.ambulanceType === type.value ? 'rgba(229,57,53,0.1)' : 'transparent'
              }}
            >
              <span>{type.label}</span>
              <span style={styles.typePrice}>{type.price}</span>
            </button>
          ))}
        </div>

        {/* Special Requirements */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>⚙️ Requirements</h3>
          <div style={styles.checkboxRow}>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.requiresOxygen}
                onChange={(e) => handleChange('requiresOxygen', e.target.checked)}
              />
              🫁 Oxygen Support
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.requiresAttendant}
                onChange={(e) => handleChange('requiresAttendant', e.target.checked)}
              />
              👨‍⚕️ Medical Attendant
            </label>
          </div>
          <select
            value={form.mobilityType}
            onChange={(e) => handleChange('mobilityType', e.target.value)}
            style={styles.select}
          >
            {mobilityTypes.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <textarea
            placeholder="Special requirements or instructions..."
            value={form.specialRequirements}
            onChange={(e) => handleChange('specialRequirements', e.target.value)}
            style={styles.textarea}
            rows={3}
          />
        </div>

        {/* Recurring */}
        <div style={styles.section}>
          <div style={styles.checkboxRow}>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={(e) => handleChange('isRecurring', e.target.checked)}
              />
              🔁 Recurring booking (e.g., dialysis transport)
            </label>
          </div>
          {form.isRecurring && (
            <div style={styles.recurringDays}>
              {weekDays.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleRecurringDay(day)}
                  style={{
                    ...styles.dayBtn,
                    background: form.recurringDays.includes(day) ? '#e53935' : '#333',
                    color: '#fff'
                  }}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Fare Estimate */}
        {fareEstimate && (
          <div style={styles.fareCard}>
            <h3 style={styles.fareTitle}>💰 Fare Estimate</h3>
            <div style={styles.fareRow}>
              <span>Total</span>
              <strong>₹{fareEstimate.total || fareEstimate.fareBreakdown?.total || 'N/A'}</strong>
            </div>
            <p style={styles.fareNote}>Platform fee: ₹50 | Includes GST</p>
          </div>
        )}

        {/* Error / Success */}
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {/* Submit */}
        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? '🔄 Scheduling...' : '📅 Schedule Ambulance'}
        </button>
      </form>
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
    fontSize: '14px',
    marginBottom: '25px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  section: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '15px'
  },
  sectionTitle: {
    color: '#fff',
    fontSize: '16px',
    margin: '0 0 12px 0'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #333',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#0f0f1a',
    color: '#fff',
    marginBottom: '10px',
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
    marginBottom: '10px',
    boxSizing: 'border-box'
  },
  row: {
    display: 'flex',
    gap: '10px'
  },
  locationBtn: {
    width: '100%',
    padding: '10px',
    background: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    marginBottom: '10px'
  },
  coords: {
    color: '#4caf50',
    fontSize: '11px',
    margin: '0 0 5px 0'
  },
  typeBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '12px',
    border: '2px solid #333',
    borderRadius: '8px',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    marginBottom: '8px',
    fontSize: '14px'
  },
  typePrice: {
    color: '#aaa',
    fontSize: '12px'
  },
  checkboxRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '10px'
  },
  checkbox: {
    color: '#ccc',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #333',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#0f0f1a',
    color: '#fff',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  recurringDays: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '10px'
  },
  dayBtn: {
    padding: '8px 14px',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  fareCard: {
    background: '#1a3a1a',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '15px',
    border: '1px solid #2e7d32'
  },
  fareTitle: {
    color: '#4caf50',
    fontSize: '16px',
    margin: '0 0 10px 0'
  },
  fareRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#fff',
    fontSize: '18px'
  },
  fareNote: {
    color: '#888',
    fontSize: '12px',
    margin: '8px 0 0 0'
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
  submitBtn: {
    width: '100%',
    padding: '16px',
    background: '#e53935',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default ScheduleTransport;
