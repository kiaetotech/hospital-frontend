import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MentalHealthCrisis = () => {
  const navigate = useNavigate();
  const [showHelplines, setShowHelplines] = useState(true);

  const helplines = [
    { name: 'National Mental Health Helpline', number: '988', description: '24/7 support' },
    { name: 'Vandrevala Foundation', number: '1860-266-2345', description: '24/7 support' },
    { name: 'iCall Helpline', number: '022-2552-1111', description: 'Available 8 AM - 10 PM' },
    { name: 'Snehi Helpline', number: '044-2464-0050', description: 'Available 24/7' },
    { name: 'Jeevan Aastha', number: '1800-233-3330', description: 'Available 24/7' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ backgroundColor: '#dc2626', padding: '2rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>🆘 Crisis Support</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>You are not alone. Help is available 24/7.</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        {showHelplines && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📞 Emergency Helplines</h2>
            {helplines.map((helpline, i) => (
              <div key={i} style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{helpline.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{helpline.description}</div>
                  </div>
                  <a href={`tel:${helpline.number}`} style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                    📞 {helpline.number}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🆘 What to Do in a Crisis</h2>
          <ol style={{ paddingLeft: '1.2rem', lineHeight: '1.8' }}>
            <li>Call a crisis helpline immediately</li>
            <li>Talk to someone you trust</li>
            <li>Go to your nearest emergency room</li>
            <li>Practice deep breathing exercises</li>
            <li>Stay in a safe environment</li>
          </ol>
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
            <p style={{ color: '#dc2626', fontWeight: 'bold' }}>If you or someone you know is in immediate danger, call 112 or go to your nearest emergency room.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button
            onClick={() => navigate('/mentalhealth/therapists')}
            style={{ flex: 1, padding: '12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            👤 Find a Therapist
          </button>
          <button
            onClick={() => navigate('/mentalhealth')}
            style={{ flex: 1, padding: '12px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            ← Back to Hub
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthCrisis;