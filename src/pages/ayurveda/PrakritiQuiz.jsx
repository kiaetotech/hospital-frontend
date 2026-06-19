import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const questions = [
  { id: 1, q: 'What is your body frame?', options: ['Thin & lean', 'Medium built', 'Heavy & broad'] },
  { id: 2, q: 'How is your skin typically?', options: ['Dry & rough', 'Soft & sensitive', 'Oily & thick'] },
  { id: 3, q: 'How is your appetite?', options: ['Irregular & variable', 'Strong & sharp', 'Steady but slow'] },
  { id: 4, q: 'Your preferred climate?', options: ['Warm weather', 'Cool weather', 'Any weather'] },
  { id: 5, q: 'How is your sleep pattern?', options: ['Light & interrupted', 'Moderate (6-7 hrs)', 'Deep & heavy (8+ hrs)'] },
  { id: 6, q: 'Your natural body temperature?', options: ['Cold hands/feet', 'Warm most of the time', 'Cool & clammy'] },
  { id: 7, q: 'Speech pattern?', options: ['Fast & talkative', 'Sharp & precise', 'Slow & deliberate'] },
  { id: 8, q: 'Memory style?', options: ['Quick to learn, quick to forget', 'Sharp & clear memory', 'Slow to learn, never forgets'] },
  { id: 9, q: 'How do you handle stress?', options: ['Anxiety & worry', ['Anger & irritation', 'Frustration'], 'Calm & withdrawn'] },
  { id: 10, q: 'Digestion pattern?', options: ['Bloating & gas', 'Acidity & heartburn', 'Slow & heavy digestion'] },
  { id: 11, q: 'Hair type?', options: ['Dry & frizzy', 'Thin & greying early', 'Thick & oily'] },
  { id: 12, q: 'Voice quality?', options: ['Hoarse & cracking', 'Loud & clear', 'Soft & mellow'] },
  { id: 13, q: 'Perspiration?', options: ['Scanty sweating', 'Profuse sweating', 'Moderate sweating'] },
  { id: 14, q: 'Food preference?', options: ['Warm, cooked meals', 'Cold drinks & salads', 'Rich, heavy foods'] },
  { id: 15, q: 'Decision making?', options: ['Quick but often change', 'Decisive & firm', 'Slow & methodical'] }
];

const PrakritiQuiz = () => {
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleAnswer = (optionIdx) => {
    const newAnswers = { ...answers, [questions[currentQ].id]: optionIdx };
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers) => {
    let vata = 0, pitta = 0, kapha = 0;
    
    Object.values(finalAnswers).forEach(answer => {
      if (answer === 0) vata++;
      else if (answer === 1) pitta++;
      else kapha++;
    });

    const total = vata + pitta + kapha;
    const vataPer = Math.round((vata / total) * 100);
    const pittaPer = Math.round((pitta / total) * 100);
    const kaphaPer = Math.round((kapha / total) * 100);

    let dominant = 'Vata';
    let dominantDesc = 'Creative, energetic, lean body type. Prone to anxiety, dry skin, and irregular digestion.';
    let recommendations = [
      'Follow a warm, grounding diet',
      'Practice gentle yoga & meditation',
      'Maintain regular sleep schedule',
      'Oil massage (Abhyanga) recommended'
    ];

    if (pitta > vata && pitta > kapha) {
      dominant = 'Pitta';
      dominantDesc = 'Intelligent, focused, medium build. Prone to inflammation, acidity, and anger.';
      recommendations = [
        'Avoid spicy & fried foods',
        'Practice cooling pranayama',
        'Include sweet, bitter & astringent tastes',
        'Sheetali & Sheetkari breathing exercises'
      ];
    } else if (kapha > vata && kapha > pitta) {
      dominant = 'Kapha';
      dominantDesc = 'Calm, strong, heavy build. Prone to weight gain, lethargy, and congestion.';
      recommendations = [
        'Regular vigorous exercise',
        'Light, warm & dry foods',
        'Avoid heavy, oily foods',
        'Wake up early, avoid day naps'
      ];
    }

    setResult({ dominant, vata: vataPer, pitta: pittaPer, kapha: kaphaPer, dominantDesc, recommendations });
  };

  if (result) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2E7D32' }}>🧬 Your Prakriti Result</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Based on your responses</p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50', textAlign: 'center', marginBottom: '1.5rem' }}>
            {result.dominant} Dominant
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {['Vata', 'Pitta', 'Kapha'].map((dosha, i) => (
              <div key={dosha} style={{ textAlign: 'center', padding: '1rem', backgroundColor: i === 0 ? '#fff3e0' : i === 1 ? '#fce4ec' : '#e8f5e9', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{result[dosha.toLowerCase()]}%</div>
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{dosha}</div>
              </div>
            ))}
          </div>

          <p style={{ color: '#475569', marginBottom: '2rem', lineHeight: '1.8' }}>
            {result.dominantDesc}
          </p>

          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>🌿 Personalized Recommendations:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {result.recommendations.map((rec, i) => (
              <li key={i} style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', marginBottom: '0.5rem', borderRadius: '0.5rem' }}>
                ✅ {rec}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/ayurveda/doctors')}
            style={{
              backgroundColor: '#FF9800',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📞 Consult Ayurvedic Doctor
          </button>
          <button
            onClick={() => { setResult(null); setCurrentQ(0); setAnswers({}); }}
            style={{
              backgroundColor: 'white',
              color: '#4CAF50',
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              border: '2px solid #4CAF50',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔄 Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b', textAlign: 'center' }}>
        🧬 AI Prakriti Analysis
      </h1>
      <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem' }}>
        Question {currentQ + 1} of {questions.length}
      </p>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '2rem' }}>
        <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#4CAF50', borderRadius: '4px', transition: 'width 0.3s' }} />
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1e293b' }}>
          {questions[currentQ].q}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {questions[currentQ].options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              style={{
                padding: '1rem',
                backgroundColor: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '1rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4CAF50';
                e.currentTarget.style.backgroundColor = '#f0fdf4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrakritiQuiz;