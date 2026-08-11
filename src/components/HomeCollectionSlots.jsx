import React, { useState } from 'react';

const HomeCollectionSlots = ({ onSelectSlot, selectedSlot }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(selectedSlot || '');

  const today = new Date();
  const dates = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const timeSlots = [
    { label: 'Morning', slots: ['06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00'] },
    { label: 'Afternoon', slots: ['11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00'] },
    { label: 'Evening', slots: ['16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00'] },
  ];

  const handleSelect = (date, time) => {
    setSelectedDate(date);
    setSelectedTime(time);
    onSelectSlot && onSelectSlot({ date, time });
  };

  return (
    <div style={{ marginTop: 16 }}>
      <label style={{ display: 'block', fontWeight: 700, marginBottom: 8, fontSize: '0.9rem' }}>🏠 Select Home Collection Slot</label>
      
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {dates.map(date => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: selectedDate === date ? '2px solid #2563eb' : '1px solid #e2e8f0',
              background: selectedDate === date ? '#eff6ff' : '#fff',
              color: selectedDate === date ? '#2563eb' : '#475569',
              fontWeight: selectedDate === date ? 700 : 400,
              fontSize: '0.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </button>
        ))}
      </div>

      {selectedDate && (
        <div>
          {timeSlots.map(group => (
            <div key={group.label} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: 6 }}>{group.label}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {group.slots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => handleSelect(selectedDate, slot)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 6,
                      border: selectedTime === slot ? '2px solid #10b981' : '1px solid #e2e8f0',
                      background: selectedTime === slot ? '#ecfdf5' : '#fff',
                      color: selectedTime === slot ? '#059669' : '#475569',
                      fontWeight: selectedTime === slot ? 700 : 400,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDate && selectedTime && (
        <div style={{ marginTop: 10, padding: 10, background: '#ecfdf5', borderRadius: 8, fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
          ✅ Collection scheduled: {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} at {selectedTime}
        </div>
      )}
    </div>
  );
};

export default HomeCollectionSlots;

