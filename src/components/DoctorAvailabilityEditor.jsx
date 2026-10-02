import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaPlus, FaTrash, FaSave, FaCopy } from 'react-icons/fa';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_OPTIONS = (() => {
  const out = [];
  for (let t = 6 * 60; t <= 23 * 60 + 45; t += 15) {
    let h = Math.floor(t / 60);
    const m = t % 60;
    const ap = h >= 12 ? 'PM' : 'AM';
    let h12 = h % 12 === 0 ? 12 : h % 12;
    out.push(`${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ap}`);
  }
  return out;
})();

const DEFAULT_SESSION = { start: '09:00 AM', end: '01:00 PM' };

const emptyWeek = () =>
  DAYS.map(day => ({
    day,
    active: false,
    sessions: [{ ...DEFAULT_SESSION }],
    slotDuration: 20,
    maxPerSlot: 1
  }));

const DoctorAvailabilityEditor = ({ doctorId, endpoint = 'homeopathy' }) => {
  const [week, setWeek] = useState(emptyWeek());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/${endpoint}/doctor/${doctorId}/availability`);
        const saved = res.data?.data?.availability || [];
        if (Array.isArray(saved) && saved.length) {
          const wk = emptyWeek();
          saved.forEach(d => {
            const idx = wk.findIndex(x => x.day === d.day);
            if (idx >= 0 && d.slots?.length) {
              wk[idx].active = true;
              const sorted = [...d.slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
              wk[idx].sessions = [{ start: sorted[0].startTime, end: sorted[sorted.length - 1].endTime }];
              wk[idx].slotDuration = 20;
              wk[idx].maxPerSlot = sorted[0].maxBookings || 1;
            }
          });
          setWeek(wk);
        }
      } catch (err) {
        console.error('Load availability failed:', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [doctorId, endpoint]);

  const update = (day, patch) =>
    setWeek(prev => prev.map(d => (d.day === day ? { ...d, ...patch } : d)));

  const updateSession = (day, idx, field, val) =>
    setWeek(prev =>
      prev.map(d => {
        if (d.day !== day) return d;
        const sessions = [...d.sessions];
        sessions[idx] = { ...sessions[idx], [field]: val };
        return { ...d, sessions };
      })
    );

  const addSession = (day) =>
    setWeek(prev =>
      prev.map(d => (d.day === day ? { ...d, sessions: [...d.sessions, { ...DEFAULT_SESSION }] } : d))
    );

  const removeSession = (day, idx) =>
    setWeek(prev =>
      prev.map(d =>
        d.day === day ? { ...d, sessions: d.sessions.filter((_, i) => i !== idx) } : d
      )
    );

  const copyToWeekdays = (sourceDay) => {
    const src = week.find(d => d.day === sourceDay);
    if (!src) return;
    setWeek(prev =>
      prev.map(d =>
        ['Monday','Tuesday','Wednesday','Thursday','Friday'].includes(d.day)
          ? { ...d, sessions: src.sessions.map(s => ({ ...s })), slotDuration: src.slotDuration, maxPerSlot: src.maxPerSlot, active: true }
          : d
      )
    );
    setSuccess('Copied to Mon–Fri');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    for (const d of week) {
      if (!d.active) continue;
      if (!d.sessions.length) {
        setError(`${d.day}: add at least one session`);
        return;
      }
      for (const s of d.sessions) {
        if (!s.start || !s.end) {
          setError(`${d.day}: session missing start or end`);
          return;
        }
        const toMin = (t) => {
          const m = String(t).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
          if (!m) return 0;
          let h = parseInt(m[1], 10);
          if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
          if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
          return h * 60 + parseInt(m[2], 10);
        };
        if (toMin(s.end) <= toMin(s.start)) {
          setError(`${d.day}: end time must be after start time`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const res = await api.post(`/${endpoint}/doctor/availability/build`, {
        doctorId,
        weekly: week
      });
      if (res.data?.success) {
        setSuccess(`Saved — ${res.data.data.totalSlots} slots generated across the week`);
      } else {
        setError(res.data?.error || 'Save failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-500 mt-3">Loading availability...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-start flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-lg font-semibold">Weekly Schedule</h2>
          <p className="text-sm text-gray-500">
            Set your consulting hours. Slots are generated automatically.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white font-medium ${
            saving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          <FaSave /> {saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {week.map(d => (
          <div
            key={d.day}
            className={`border rounded-lg p-4 ${d.active ? 'border-green-300 bg-green-50/30' : 'border-gray-200 bg-gray-50/50'}`}
          >
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={d.active}
                  onChange={(e) => update(d.day, { active: e.target.checked })}
                  className="w-5 h-5 accent-green-600"
                />
                <span className="font-semibold text-base">{d.day}</span>
              </label>

              {d.active && (
                <div className="flex gap-3 text-xs">
                  <button
                    onClick={() => copyToWeekdays(d.day)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <FaCopy /> Apply to Mon–Fri
                  </button>
                  <button
                    onClick={() => addSession(d.day)}
                    className="flex items-center gap-1 text-green-600 hover:text-green-800 font-medium"
                  >
                    <FaPlus /> Add Session
                  </button>
                </div>
              )}
            </div>

            {d.active && (
              <>
                <div className="space-y-2 mb-3">
                  {d.sessions.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 flex-wrap bg-white p-2 rounded border">
                      <span className="text-xs font-semibold text-gray-500 min-w-[60px]">
                        Session {idx + 1}
                      </span>
                      <select
                        value={s.start}
                        onChange={(e) => updateSession(d.day, idx, 'start', e.target.value)}
                        className="px-2 py-1.5 border rounded text-sm"
                      >
                        {TIME_OPTIONS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <span className="text-gray-400 text-sm">to</span>
                      <select
                        value={s.end}
                        onChange={(e) => updateSession(d.day, idx, 'end', e.target.value)}
                        className="px-2 py-1.5 border rounded text-sm"
                      >
                        {TIME_OPTIONS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      {d.sessions.length > 1 && (
                        <button
                          onClick={() => removeSession(d.day, idx)}
                          className="text-red-500 hover:text-red-700 ml-auto"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded border">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Slot duration
                    </label>
                    <select
                      value={d.slotDuration}
                      onChange={(e) => update(d.day, { slotDuration: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={20}>20 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Max patients per slot
                    </label>
                    <select
                      value={d.maxPerSlot}
                      onChange={(e) => update(d.day, { maxPerSlot: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    >
                      <option value={1}>1 (one-on-one)</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>Example:</strong> Session 09:00 AM – 01:00 PM with 20-min slots = 12 bookable slots.
        Add a second session for evening hours. Patients see exactly what you configure.
      </div>
    </div>
  );
};

export default DoctorAvailabilityEditor;