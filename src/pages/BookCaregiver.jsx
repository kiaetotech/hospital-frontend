import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookCaregiver = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { caregiver } = location.state || {};
  const [durationType, setDurationType] = useState('hourly'); // hourly, daily, weekly, monthly, yearly
  const [durationValue, setDurationValue] = useState(4);
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: '',
    patientPhone: '',
    serviceAddress: '',
    startDate: '',
    startTime: '',
    endDate: '',
    requirements: '',
    recurringWeekly: false,
    recurringDays: []
  });

  if (!caregiver) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>No caregiver selected. <button onClick={() => navigate('/caregivers')}>Back to Caregivers</button></div>;
  }

  const hourlyRate = caregiver.pricing?.personal?.hourly || caregiver.pricing?.skilled?.hourly || 300;
  const dailyRate = hourlyRate * 8;
  const weeklyRate = dailyRate * 5;
  const monthlyRate = weeklyRate * 4;
  const yearlyRate = monthlyRate * 12;

  const getTotalAmount = () => {
    switch (durationType) {
      case 'hourly': return hourlyRate * durationValue;
      case 'daily': return dailyRate * durationValue;
      case 'weekly': return weeklyRate * durationValue;
      case 'monthly': return monthlyRate * durationValue;
      case 'yearly': return yearlyRate * durationValue;
      default: return hourlyRate * 4;
    }
  };

  const totalAmount = getTotalAmount();
  const platformFee = Math.min(totalAmount * 0.05, 500);
  const finalAmount = totalAmount + platformFee;

  const getDurationLabel = () => {
    switch (durationType) {
      case 'hourly': return `${durationValue} hour(s)`;
      case 'daily': return `${durationValue} day(s)`;
      case 'weekly': return `${durationValue} week(s)`;
      case 'monthly': return `${durationValue} month(s)`;
      case 'yearly': return `${durationValue} year(s)`;
      default: return '';
    }
  };

  const getRateText = () => {
    switch (durationType) {
      case 'hourly': return `₹${hourlyRate}/hour`;
      case 'daily': return `₹${dailyRate}/day (8 hours)`;
      case 'weekly': return `₹${weeklyRate}/week (5 days)`;
      case 'monthly': return `₹${monthlyRate}/month (20 days)`;
      case 'yearly': return `₹${yearlyRate}/year (240 days)`;
      default: return '';
    }
  };

  const getMaxValue = () => {
    switch (durationType) {
      case 'hourly': return 24;
      case 'daily': return 30;
      case 'weekly': return 52;
      case 'monthly': return 12;
      case 'yearly': return 5;
      default: return 24;
    }
  };

  const getMinValue = () => {
    switch (durationType) {
      case 'hourly': return 1;
      case 'daily': return 1;
      case 'weekly': return 1;
      case 'monthly': return 1;
      case 'yearly': return 1;
      default: return 1;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.patientPhone || !formData.serviceAddress || !formData.startDate) {
      alert('Please fill all required fields');
      return;
    }
    
    const bookingData = {
      bookingType: 'caregiver',
      caregiverName: caregiver.fullName,
      caregiverId: caregiver._id,
      patientName: formData.patientName,
      patientAge: formData.patientAge,
      patientGender: formData.patientGender,
      patientPhone: formData.patientPhone,
      serviceAddress: formData.serviceAddress,
      startDate: formData.startDate,
      startTime: formData.startTime,
      endDate: formData.endDate,
      durationType: durationType,
      durationValue: durationValue,
      originalAmount: totalAmount,
      platformFee: platformFee,
      finalAmount: finalAmount,
      requirements: formData.requirements,
      recurringWeekly: formData.recurringWeekly,
      recurringDays: formData.recurringDays
    };
    navigate('/payment', { state: { bookingData } });
  };

  const weekDays = [
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' }
  ];

  const toggleRecurringDay = (day) => {
    if (formData.recurringDays.includes(day)) {
      setFormData({ ...formData, recurringDays: formData.recurringDays.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, recurringDays: [...formData.recurringDays, day] });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Book {caregiver.fullName}</h2>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>⭐ {caregiver.ratings.average} ({caregiver.ratings.count} reviews) • {caregiver.experienceYears} years exp</p>
        
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
          <p><strong>Specializations:</strong> {caregiver.specializations.join(', ')}</p>
          <p><strong>Hourly:</strong> ₹{hourlyRate}/hour | <strong>Daily (8h):</strong> ₹{dailyRate} | <strong>Weekly (5d):</strong> ₹{weeklyRate}</p>
          <p><strong>Monthly (20d):</strong> ₹{monthlyRate} | <strong>Yearly (240d):</strong> ₹{yearlyRate}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Duration Type Selection */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Select Booking Duration *</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => { setDurationType('hourly'); setDurationValue(4); }} style={{ padding: '0.5rem 1rem', backgroundColor: durationType === 'hourly' ? '#10b981' : '#e5e7eb', color: durationType === 'hourly' ? 'white' : 'black', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Hourly</button>
              <button type="button" onClick={() => { setDurationType('daily'); setDurationValue(1); }} style={{ padding: '0.5rem 1rem', backgroundColor: durationType === 'daily' ? '#10b981' : '#e5e7eb', color: durationType === 'daily' ? 'white' : 'black', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Daily</button>
              <button type="button" onClick={() => { setDurationType('weekly'); setDurationValue(1); }} style={{ padding: '0.5rem 1rem', backgroundColor: durationType === 'weekly' ? '#10b981' : '#e5e7eb', color: durationType === 'weekly' ? 'white' : 'black', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Weekly</button>
              <button type="button" onClick={() => { setDurationType('monthly'); setDurationValue(1); }} style={{ padding: '0.5rem 1rem', backgroundColor: durationType === 'monthly' ? '#10b981' : '#e5e7eb', color: durationType === 'monthly' ? 'white' : 'black', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Monthly</button>
              <button type="button" onClick={() => { setDurationType('yearly'); setDurationValue(1); }} style={{ padding: '0.5rem 1rem', backgroundColor: durationType === 'yearly' ? '#10b981' : '#e5e7eb', color: durationType === 'yearly' ? 'white' : 'black', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Yearly</button>
            </div>
          </div>

          {/* Duration Value */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {durationType === 'hourly' ? 'Number of Hours' : durationType === 'daily' ? 'Number of Days' : durationType === 'weekly' ? 'Number of Weeks' : durationType === 'monthly' ? 'Number of Months' : 'Number of Years'} *
            </label>
            <input type="number" value={durationValue} onChange={(e) => setDurationValue(parseInt(e.target.value))} min={getMinValue()} max={getMaxValue()} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{getRateText()}</p>
          </div>

          {/* Rest of the form - patient details */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Patient Name *</label>
            <input type="text" value={formData.patientName} onChange={(e) => setFormData({...formData, patientName: e.target.value})} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Patient Age</label>
            <input type="number" value={formData.patientAge} onChange={(e) => setFormData({...formData, patientAge: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Patient Gender</label>
            <select value={formData.patientGender} onChange={(e) => setFormData({...formData, patientGender: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Phone Number *</label>
            <input type="tel" value={formData.patientPhone} onChange={(e) => setFormData({...formData, patientPhone: e.target.value})} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Service Address *</label>
            <textarea value={formData.serviceAddress} onChange={(e) => setFormData({...formData, serviceAddress: e.target.value})} rows="2" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Start Date *</label>
            <input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Start Time</label>
            <input type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>

          {(durationType === 'weekly' || durationType === 'monthly' || durationType === 'yearly') && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>End Date (optional)</label>
              <input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={formData.recurringWeekly} onChange={(e) => setFormData({...formData, recurringWeekly: e.target.checked})} />
              <span style={{ fontWeight: 'bold' }}>Recurring Weekly (same days every week)</span>
            </label>
          </div>

          {formData.recurringWeekly && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Select Days of Week</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {weekDays.map(day => (
                  <button type="button" key={day.key} onClick={() => toggleRecurringDay(day.key)} style={{ padding: '0.5rem 0.75rem', backgroundColor: formData.recurringDays.includes(day.key) ? '#10b981' : '#e5e7eb', color: formData.recurringDays.includes(day.key) ? 'white' : 'black', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Special Requirements / Medical Notes</label>
            <textarea value={formData.requirements} onChange={(e) => setFormData({...formData, requirements: e.target.value})} rows="2" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          </div>
          
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <p><strong>Service Charges:</strong> ₹{totalAmount} ({getDurationLabel()} @ {getRateText()})</p>
            <p><strong>Platform Fee (5%):</strong> ₹{platformFee}</p>
            <p><strong style={{ color: '#10b981' }}>Total Payable:</strong> ₹{finalAmount}</p>
          </div>
          
          <button type="submit" style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Proceed to Payment - ₹{finalAmount}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookCaregiver;