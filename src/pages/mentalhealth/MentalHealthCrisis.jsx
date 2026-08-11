import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MentalHealthCrisis = () => {
  const navigate = useNavigate();
  const [showHelplines, setShowHelplines] = useState(true);
  const [message, setMessage] = useState('');
  const [alertSent, setAlertSent] = useState(false);

  const helplines = [
    { name: 'National Mental Health Helpline', number: '988', description: '24/7 support' },
    { name: 'Vandrevala Foundation', number: '1860-266-2345', description: '24/7 support' },
    { name: 'iCall Helpline', number: '022-2552-1111', description: '8 AM - 10 PM' },
    { name: 'Snehi Helpline', number: '044-2464-0050', description: '24/7' },
    { name: 'Jeevan Aastha', number: '1800-233-3330', description: '24/7' }
  ];

  // 🆕 Send crisis alert
  const handleSendAlert = async () => {
    try {
      await api.post('/mentalhealth/crisis-alert', {
        message: message || 'Crisis alert triggered',
        userId: localStorage.getItem('userId'),
      });
      setAlertSent(true);
      setTimeout(() => setAlertSent(false), 5000);
    } catch (err) {
      console.error('Alert error:', err);
    }
  };

  // 🆕 Quick self-check keywords
  const handleSelfCheck = (text) => {
    const crisisWords = ['suicidal', 'kill myself', 'end my life', 'want to die', 'self harm', 'no reason'];
    return crisisWords.some(w => text.toLowerCase().includes(w));
  };

  const isCrisis = handleSelfCheck(message);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', padding: '28px 20px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 4px' }}>🆘 Crisis Support</h1>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>You are not alone. Help is available 24/7.</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>

        {/* 🆕 CRISIS SELF-CHECK */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '14px' }}>
          <h3 style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', marginBottom: '8px' }}>💬 How are you feeling?</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe how you're feeling right now..."
            rows={3}
            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', resize: 'vertical', outline: 'none', marginBottom: '10px' }}
          />
          {isCrisis && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
              <p style={{ color: '#dc2626', fontWeight: '700', fontSize: '13px', margin: '0 0 4px' }}>⚠️ We're concerned about you</p>
              <p style={{ color: '#991b1b', fontSize: '12px', margin: 0 }}>Please reach out immediately. You deserve support.</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSendAlert}
              style={{ flex: 1, padding: '10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
              🚨 Send Alert
            </button>
            <button onClick={() => { setMessage(''); }}
              style={{ padding: '10px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
              Clear
            </button>
          </div>
          {alertSent && (
            <p style={{ color: '#059669', fontSize: '12px', fontWeight: '600', marginTop: '8px', textAlign: 'center' }}>
              ✅ Alert sent. Help will reach out to you.
            </p>
          )}
        </div>

        {/* Helplines */}
        {showHelplines && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '14px' }}>
            <h2 style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', marginBottom: '10px' }}>📞 Emergency Helplines</h2>
            {helplines.map((helpline, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < helplines.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>{helpline.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{helpline.description}</div>
                </div>
                <a href={`tel:${helpline.number}`} style={{ padding: '6px 14px', backgroundColor: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  📞 {helpline.number}
                </a>
              </div>
            ))}
          </div>
        )}

        {/* What to Do */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '14px' }}>
          <h2 style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', marginBottom: '8px' }}>🆘 What to Do in a Crisis</h2>
          <ol style={{ paddingLeft: '18px', lineHeight: '1.8', fontSize: '13px', color: '#475569', margin: 0 }}>
            <li>Call a crisis helpline immediately</li>
            <li>Talk to someone you trust</li>
            <li>Go to your nearest emergency room</li>
            <li>Practice deep breathing: Inhale 4s, hold 4s, exhale 4s</li>
            <li>Stay in a safe environment</li>
          </ol>
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
            <p style={{ color: '#dc2626', fontWeight: '600', fontSize: '12px', margin: 0 }}>🚨 In immediate danger? Call 112 or go to nearest ER.</p>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate('/mentalhealth/therapists')}
            style={{ flex: 1, padding: '12px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
            👤 Find a Therapist
          </button>
          <button onClick={() => navigate('/mentalhealth')}
            style={{ flex: 1, padding: '12px', background: '#475569', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
            ← Back to Hub
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthCrisis;

