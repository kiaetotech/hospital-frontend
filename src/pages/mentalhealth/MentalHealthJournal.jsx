import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MentalHealthJournal = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'neutral', moodScore: 5 });
  const [loading, setLoading] = useState(true);
  const [moodTrend, setMoodTrend] = useState(null);
  const [crisisAlert, setCrisisAlert] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-8de3.up.railway.app/api';

  useEffect(() => {
    loadEntries();
    loadMoodTrend();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const mockEntries = [
        { _id: '1', title: 'Feeling Anxious Today', content: 'Had a panic attack this morning. Used breathing exercises to calm down.', mood: 'anxious', moodScore: 3, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { _id: '2', title: 'Good Progress', content: 'Therapy session went well. Feeling more hopeful about the future.', mood: 'happy', moodScore: 8, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { _id: '3', title: 'Sleep Issues', content: 'Couldn\'t sleep last night. Mind was racing with thoughts.', mood: 'tired', moodScore: 4, createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() }
      ];
      setEntries(mockEntries);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoodTrend = async () => {
    try {
      const scores = [7, 6, 5, 4, 5, 6, 7];
      setMoodTrend({ trend: 'stable', averageScore: 5.7, data: scores.map((s, i) => ({ date: new Date(Date.now() - (6-i)*86400000).toISOString(), score: s })) });
    } catch (error) {
      console.error('Error loading mood trend:', error);
    }
  };

  // ============================================
  // 🆕 SAVE WITH MOOD ANALYSIS
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEntry.title || !newEntry.content) {
      alert('Please fill in title and content');
      return;
    }

    // Crisis detection
    const lower = newEntry.content.toLowerCase();
    const crisisWords = ['suicidal', 'kill myself', 'end my life', 'want to die', 'self harm', 'no reason to live'];
    if (crisisWords.some(w => lower.includes(w))) {
      setCrisisAlert({
        message: 'We noticed concerning words in your entry. You are not alone. Please reach out for support.',
        helplines: ['iCall: +91-9152987821', 'AASRA: +91-9820466726']
      });
    }

    const entry = {
      _id: Date.now().toString(),
      ...newEntry,
      createdAt: new Date().toISOString()
    };
    setEntries([entry, ...entries]);
    setNewEntry({ title: '', content: '', mood: 'neutral', moodScore: 5 });
    setCrisisAlert(null);
    loadMoodTrend();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure?')) {
      setEntries(entries.filter(e => e._id !== id));
    }
  };

  const getMoodEmoji = (mood) => {
    const m = { happy: '😊', sad: '😢', anxious: '😰', angry: '😤', tired: '😴', neutral: '😐', grateful: '🙏', hopeful: '🌟' };
    return m[mood] || '😐';
  };

  const getMoodColor = (mood) => {
    const c = { happy: '#10b981', sad: '#6b7280', anxious: '#f59e0b', angry: '#ef4444', tired: '#8b5cf6', neutral: '#6b7280', grateful: '#10b981', hopeful: '#3b82f6' };
    return c[mood] || '#6b7280';
  };

  const moodEmojis = [
    { score: 2, emoji: '😢', label: 'Terrible' },
    { score: 4, emoji: '😟', label: 'Bad' },
    { score: 6, emoji: '😐', label: 'Okay' },
    { score: 8, emoji: '😊', label: 'Good' },
    { score: 10, emoji: '🥳', label: 'Great' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', padding: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>📝 My Journal</h1>
          <p style={{ opacity: 0.85, fontSize: '13px', margin: '2px 0 0' }}>Track your thoughts, feelings, and progress</p>
        </div>
        <button onClick={() => navigate('/mentalhealth')} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>← Back</button>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>

        {/* 🆕 MOOD TREND CHART */}
        {moodTrend && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', margin: 0 }}>📊 Weekly Mood Trend</h3>
              <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '12px',
                background: moodTrend.trend === 'improving' ? '#ecfdf5' : moodTrend.trend === 'declining' ? '#fef2f2' : '#f1f5f9',
                color: moodTrend.trend === 'improving' ? '#065f46' : moodTrend.trend === 'declining' ? '#991b1b' : '#475569' }}>
                {moodTrend.trend === 'improving' ? '📈 Improving' : moodTrend.trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'end', gap: '6px', height: '80px' }}>
              {moodTrend.data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{d.score}</span>
                  <div style={{ width: '100%', height: `${d.score * 8}px`, background: d.score >= 7 ? '#10b981' : d.score >= 5 ? '#f59e0b' : '#ef4444', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} />
                  <span style={{ fontSize: '9px', color: '#94a3b8' }}>{new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
              Average: <strong>{moodTrend.averageScore}/10</strong>
            </p>
          </div>
        )}

        {/* 🆕 CRISIS ALERT */}
        {crisisAlert && (
          <div style={{ backgroundColor: '#fef2f2', border: '2px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <h3 style={{ color: '#dc2626', fontWeight: '700', fontSize: '15px', margin: '0 0 6px' }}>🚨 We're Here For You</h3>
            <p style={{ color: '#991b1b', fontSize: '13px', margin: '0 0 8px' }}>{crisisAlert.message}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {crisisAlert.helplines.map((h, i) => (
                <span key={i} style={{ background: '#dc2626', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{h}</span>
              ))}
            </div>
          </div>
        )}

        {/* 🆕 QUICK MOOD CHECK */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '16px' }}>
          <h3 style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', marginBottom: '10px' }}>How are you feeling right now?</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
            {moodEmojis.map((m) => (
              <button key={m.score} onClick={() => setNewEntry({ ...newEntry, moodScore: m.score, mood: m.score <= 2 ? 'terrible' : m.score <= 4 ? 'sad' : m.score <= 6 ? 'neutral' : m.score <= 8 ? 'happy' : 'great' })}
                style={{ flex: 1, padding: '10px 6px', background: newEntry.moodScore === m.score ? '#ede9fe' : '#f8fafc', border: newEntry.moodScore === m.score ? '2px solid #7c3aed' : '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                <div style={{ fontSize: '24px' }}>{m.emoji}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{m.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* New Entry Form */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
          <h3 style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', marginBottom: '12px' }}>✏️ New Journal Entry</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Title" value={newEntry.title} onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '10px', outline: 'none' }} required />
            <textarea placeholder="How are you feeling today? Write your thoughts..." value={newEntry.content} onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', minHeight: '100px', resize: 'vertical', marginBottom: '10px', outline: 'none' }} required />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={newEntry.mood} onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }}>
                <option value="happy">😊 Happy</option><option value="sad">😢 Sad</option><option value="anxious">😰 Anxious</option>
                <option value="angry">😤 Angry</option><option value="tired">😴 Tired</option><option value="neutral">😐 Neutral</option>
                <option value="grateful">🙏 Grateful</option><option value="hopeful">🌟 Hopeful</option>
              </select>
              <button type="submit" style={{ padding: '10px 24px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                💾 Save Entry
              </button>
            </div>
          </form>
        </div>

        {/* Entries */}
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</p>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px' }}>
            <p style={{ color: '#64748b' }}>No journal entries yet. Start writing!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {entries.map((entry) => (
              <div key={entry._id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', borderLeft: `3px solid ${getMoodColor(entry.mood)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b', margin: 0 }}>{entry.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span>{getMoodEmoji(entry.mood)}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(entry.createdAt).toLocaleDateString()} • {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {entry.moodScore && <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600' }}>Score: {entry.moodScore}/10</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(entry._id)} style={{ padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                </div>
                <p style={{ color: '#475569', fontSize: '13px', marginTop: '8px', whiteSpace: 'pre-wrap' }}>{entry.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentalHealthJournal;