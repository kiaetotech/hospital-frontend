import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const MentalHealthScreening = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const [error, setError] = useState('');

  const getQuestions = () => {
    if (type === 'depression') {
      return [
        'Little interest or pleasure in doing things?',
        'Feeling down, depressed, or hopeless?',
        'Trouble falling or staying asleep?',
        'Feeling tired or having little energy?',
        'Poor appetite or overeating?',
        'Feeling bad about yourself?',
        'Trouble concentrating on things?',
        'Moving or speaking so slowly?',
        'Thoughts that you would be better off dead?'
      ];
    } else if (type === 'anxiety') {
      return [
        'Feeling nervous, anxious or on edge?',
        'Not being able to stop or control worrying?',
        'Worrying too much about different things?',
        'Trouble relaxing?',
        'Being so restless that it is hard to sit still?',
        'Becoming easily annoyed or irritable?',
        'Feeling afraid as if something awful might happen?'
      ];
    }
    return [];
  };

  const questions = getQuestions();

  // ✅ FIXED: Ensure answers array is properly initialized
  const handleAnswer = (score) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = score;
    setAnswers(newAnswers);

    // If this is the last question, submit the screening
    if (currentQuestion === questions.length - 1) {
      // ✅ Check if all questions are answered
      const allAnswered = newAnswers.every(a => a !== undefined && a !== null);
      if (allAnswered) {
        submitScreening(newAnswers);
      } else {
        setError('Please answer all questions before submitting.');
      }
    } else {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // ✅ FIXED: Accept answers as parameter to ensure data is current
  const submitScreening = async (finalAnswers) => {
    // If finalAnswers not provided, use the state
    const answersToSubmit = finalAnswers || answers;
    
    // Check if all answers are filled
    const allAnswered = answersToSubmit.every(a => a !== undefined && a !== null);
    if (!allAnswered) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Submitting screening:', {
        screeningType: type,
        answers: answersToSubmit,
        isAnonymous: isAnonymous
      });

      const res = await axios.post('/api/mentalhealth/screening', {
        screeningType: type,
        answers: answersToSubmit,
        isAnonymous: isAnonymous
      });

      console.log('Screening response:', res.data);

      if (res.data.success) {
        setResult(res.data.data);
        setStep(3);
        if (res.data.data.requiresEmergency) {
          setShowCrisis(true);
        }
      } else {
        setError(res.data.message || 'Error submitting screening');
      }
    } catch (error) {
      console.error('Error submitting screening:', error);
      setError(error.response?.data?.message || error.message || 'Error submitting screening. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'minimal': '#10b981',
      'mild': '#f59e0b',
      'moderate': '#f97316',
      'moderately_severe': '#ef4444',
      'severe': '#dc2626'
    };
    return colors[severity] || '#6b7280';
  };

  // Step 1: Welcome
  if (step === 1) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '500px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            🧠 {type === 'depression' ? 'Depression' : 'Anxiety'} Screening
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            This is a {type === 'depression' ? 'PHQ-9' : 'GAD-7'} screening test. It takes about 2 minutes.
          </p>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
              Stay Anonymous (results will not be saved)
            </label>
          </div>
          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '6px', marginBottom: '1rem', color: '#dc2626' }}>
              {error}
            </div>
          )}
          <button
            onClick={() => setStep(2)}
            style={{ width: '100%', padding: '12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Start Screening →
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Questions
  if (step === 2) {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '500px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6b7280' }}>
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px', marginTop: '0.25rem' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#8b5cf6', borderRadius: '2px' }}></div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{question}</h2>

          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '6px', marginBottom: '1rem', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Not at all', score: 0 },
              { label: 'Several days', score: 1 },
              { label: 'More than half the days', score: 2 },
              { label: 'Nearly every day', score: 3 }
            ].map((option) => (
              <button
                key={option.score}
                onClick={() => handleAnswer(option.score)}
                style={{
                  padding: '12px 16px',
                  backgroundColor: answers[currentQuestion] === option.score ? '#ede9fe' : 'transparent',
                  border: answers[currentQuestion] === option.score ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (answers[currentQuestion] !== option.score) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (answers[currentQuestion] !== option.score) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                disabled={loading}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button
              onClick={() => {
                if (currentQuestion > 0) {
                  setCurrentQuestion(currentQuestion - 1);
                  const newAnswers = [...answers];
                  newAnswers[currentQuestion - 1] = undefined;
                  setAnswers(newAnswers);
                  setError('');
                }
              }}
              style={{ padding: '8px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              disabled={currentQuestion === 0 || loading}
            >
              ← Back
            </button>
            <button
              onClick={() => {
                setStep(1);
                setAnswers([]);
                setCurrentQuestion(0);
                setError('');
              }}
              style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', color: '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
          
          {loading && (
            <div style={{ textAlign: 'center', marginTop: '1rem', color: '#8b5cf6' }}>
              Submitting your answers...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 3: Results
  if (step === 3 && result) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '500px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>📊 Your Results</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            {type === 'depression' ? 'Depression' : 'Anxiety'} Screening Results
          </p>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: getSeverityColor(result.severity) }}>
              {result.score}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: getSeverityColor(result.severity) }}>
              {result.severity.toUpperCase()}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Score</div>
          </div>

          {result.recommendations && result.recommendations.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Recommendations</h4>
              {result.recommendations.map((rec, i) => (
                <div key={i} style={{ padding: '8px', backgroundColor: '#f9fafb', borderRadius: '6px', marginBottom: '0.25rem' }}>
                  {rec.description}
                </div>
              ))}
            </div>
          )}

          {showCrisis && (
            <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px', marginBottom: '1rem' }}>
              <h4 style={{ fontWeight: 'bold', color: '#dc2626' }}>🚨 Immediate Support Needed</h4>
              <p style={{ fontSize: '0.9rem' }}>Please contact a mental health professional immediately.</p>
              <p style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 'bold' }}>Crisis Helpline: 988</p>
              <button
                onClick={() => navigate('/mentalhealth/crisis')}
                style={{ marginTop: '0.5rem', padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                🆘 Get Help Now
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                setStep(1);
                setAnswers([]);
                setCurrentQuestion(0);
                setResult(null);
                setShowCrisis(false);
                setError('');
              }}
              style={{ flex: 1, padding: '10px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🔄 Retake Test
            </button>
            <button
              onClick={() => navigate('/mentalhealth/therapists')}
              style={{ flex: 1, padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              👤 Find Therapist
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MentalHealthScreening;