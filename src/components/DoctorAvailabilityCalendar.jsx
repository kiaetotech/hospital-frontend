import React, { useState } from 'react';

const DoctorAvailabilityCalendar = ({ availability, onSlotSelect, selectedDate, selectedSlot }) => {
  const [currentWeek, setCurrentWeek] = useState(0);

  const getNextDays = (weekOffset = 0) => {
    const days = [];
    const today = new Date();
    const startDay = new Date(today);
    startDay.setDate(today.getDate() + (weekOffset * 7));

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDay);
      date.setDate(startDay.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const days = getNextDays(currentWeek);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getSlotsForDate = (date) => {
    const dayName = fullDayNames[date.getDay()];
    const daySchedule = availability?.find(d => d.day === dayName && d.isAvailable);
    if (!daySchedule) return [];
    return daySchedule.slots?.filter(s => (s.currentBookings || 0) < (s.maxBookings || 5)) || [];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate === date.toISOString().split('T')[0];
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div>
      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentWeek(prev => prev - 1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition" disabled={currentWeek === 0}>
          ←
        </button>
        <span className="font-medium text-gray-700">
          {days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <button onClick={() => setCurrentWeek(prev => prev + 1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition">
          →
        </button>
      </div>

      {/* Day Selection */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {days.map((date, index) => {
          const dateStr = formatDate(date);
          const slots = getSlotsForDate(date);
          const hasSlots = slots.length > 0;
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

          return (
            <button
              key={dateStr}
              onClick={() => hasSlots && !isPast && onSlotSelect(dateStr, '')}
              disabled={!hasSlots || isPast}
              className={`p-3 rounded-xl text-center transition ${
                isSelected(date)
                  ? 'bg-blue-600 text-white shadow-lg'
                  : hasSlots && !isPast
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
            >
              <div className="text-xs font-medium">{dayNames[index]}</div>
              <div className="text-lg font-bold">{date.getDate()}</div>
              <div className="text-xs">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
              {isToday(date) && <div className="text-xs mt-1 font-bold text-green-500">Today</div>}
              {hasSlots && !isPast && <div className="text-xs mt-1 text-green-600">{slots.length} slots</div>}
            </button>
          );
        })}
      </div>

      {/* Slot Selection */}
      {selectedDate && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">
            Available slots for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
          </h4>
          {getSlotsForDate(new Date(selectedDate)).length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {getSlotsForDate(new Date(selectedDate)).map((slot) => (
                <button
                  key={slot.startTime}
                  onClick={() => onSlotSelect(selectedDate, slot.startTime)}
                  className={`p-3 rounded-xl text-center text-sm font-medium transition ${
                    selectedSlot === slot.startTime
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">No slots available for this date.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorAvailabilityCalendar;

