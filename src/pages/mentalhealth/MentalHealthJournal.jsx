import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MentalHealthJournal = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'neutral' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      // For demo, use mock data if no API
      const mockEntries = [
        {
          _id: '1',
          title: 'Feeling Anxious Today',
          content: 'Had a panic attack this morning. Used breathing exercises to calm down.',
          mood: 'anxious',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '2',
          title: 'Good Progress',
          content: 'Therapy session went well. Feeling more hopeful about the future.',
          mood: 'happy',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          title: 'Sleep Issues',
          content: 'Couldn\'t sleep last night. Mind was racing with thoughts.',
          mood: 'tired',
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        }
      ];
      setEntries(mockEntries);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEntry.title || !newEntry.content) {
      alert('Please fill in title and content');
      return;
    }

    try {
      const entry = {
        _id: Date.now().toString(),
        ...newEntry,
        createdAt: new Date().toISOString()
      };
      setEntries([entry, ...entries]);
      setNewEntry({ title: '', content: '', mood: 'neutral' });
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setEntries(entries.filter(e => e._id !== id));
    }
  };

  const getMoodEmoji = (mood) => {
    const moods = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      angry: '😤',
      tired: '😴',
      neutral: '😐',
      grateful: '🙏',
      hopeful: '🌟'
    };
    return moods[mood] || '😐';
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: '#10b981',
      sad: '#6b7280',
      anxious: '#f59e0b',
      angry: '#ef4444',
      tired: '#8b5cf6',
      neutral: '#6b7280',
      grateful: '#10b981',
      hopeful: '#3b82f6'
    };
    return colors[mood] || '#6b7280';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        padding: '2rem',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>📝 My Journal</h1>
          <p style={{ opacity: 0.9 }}>Track your thoughts, feelings, and progress</p>
        </div>
        <button
          onClick={() => navigate('/mentalhealth')}
          style={{ padding: '0.5rem 1.5rem', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          ← Back to Hub
        </button>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* New Entry Form */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>✏️ New Journal Entry</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '0.75rem' }}>
              <input
                type="text"
                placeholder="Title"
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <textarea
                placeholder="How are you feeling today? Write your thoughts..."
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', marginRight: '0.5rem' }}>Mood:</label>
                <select
                  value={newEntry.mood}
                  onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                  style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                >
                  <option value="happy">😊 Happy</option>
                  <option value="sad">😢 Sad</option>
                  <option value="anxious">😰 Anxious</option>
                  <option value="angry">😤 Angry</option>
                  <option value="tired">😴 Tired</option>
                  <option value="neutral">😐 Neutral</option>
                  <option value="grateful">🙏 Grateful</option>
                  <option value="hopeful">🌟 Hopeful</option>
                </select>
              </div>
              <button
                type="submit"
                style={{ padding: '0.5rem 2rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                💾 Save Entry
              </button>
            </div>
          </form>
        </div>

        {/* Entries List */}
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading journal entries...</p>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '12px' }}>
            <p style={{ color: '#6b7280' }}>No journal entries yet. Start writing your thoughts!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {entries.map((entry) => (
              <div
                key={entry._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${getMoodColor(entry.mood)}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 'bold' }}>{entry.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span>{getMoodEmoji(entry.mood)}</span>
                      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      style={{ padding: '0.25rem 0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                <p style={{ color: '#4b5563', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{entry.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.6rem',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  fontSize: '0.95rem',
  backgroundColor: 'white',
  outline: 'none'
};

export default MentalHealthJournal;