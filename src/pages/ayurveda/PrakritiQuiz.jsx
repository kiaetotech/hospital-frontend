import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAyurvedaDoctors } from '../../services/ayurvedaApi';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaUserMd, FaDownload } from 'react-icons/fa';

const PrakritiQuiz = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const questions = [
    {
      id: 'bodyType',
      question: 'What is your body frame?',
      options: [
        { text: 'Thin, light, slender', dosha: 'Vata', score: 2 },
        { text: 'Medium, muscular', dosha: 'Pitta', score: 2 },
        { text: 'Large, well-built', dosha: 'Kapha', score: 2 }
      ]
    },
    {
      id: 'weight',
      question: 'How is your weight tendency?',
      options: [
        { text: 'Hard to gain weight', dosha: 'Vata', score: 2 },
        { text: 'Easy to gain/lose', dosha: 'Pitta', score: 2 },
        { text: 'Easy to gain, hard to lose', dosha: 'Kapha', score: 2 }
      ]
    },
    {
      id: 'skin',
      question: 'How is your skin type?',
      options: [
        { text: 'Dry, rough, cool', dosha: 'Vata', score: 2 },
        { text: 'Oily, warm, sensitive', dosha: 'Pitta', score: 2 },
        { text: 'Smooth, moist, cool', dosha: 'Kapha', score: 2 }
      ]
    },
    {
      id: 'hair',
      question: 'How is your hair?',
      options: [
        { text: 'Dry, thin, frizzy', dosha: 'Vata', score: 2 },
        { text: 'Oily, premature greying', dosha: 'Pitta', score: 2 },
        { text: 'Thick, shiny, wavy', dosha: 'Kapha', score: 2 }
      ]
    },
    {
      id: 'appetite',
      question: 'How is your appetite?',
      options: [
        { text: 'Irregular, variable', dosha: 'Vata', score: 2 },
        { text: 'Strong, can\'t skip meals', dosha: 'Pitta', score: 2 },
        { text: 'Steady but can skip meals', dosha: 'Kapha', score: 2 }
      ]
    },
    {
      id: 'digestion',
      question: 'How is your digestion?',
      options: [
        { text: 'Gas, bloating, irregular', dosha: 'Vata', score: 2 },
        { text: 'Acidity, heartburn', dosha: 'Pitta', score: 2 },
        { text: 'Slow, heavy feeling', dosha: 'Kapha', score: 2 }
      ]
    },
    {
      id: 'bowelMovement',
      question: 'How is your bowel movement?',
      options: [
        { text: 'Dry, constipated', dosha: 'Vata', score: 2 },
        { text: 'Loose, frequent', dosha: 'Pitta', score: 2 },
        { text: 'Regular, well-formed', dosha: 'Kapha', score: 2 }
      ]
    },
    {
      id: 'sleep',
      question: 'How is your sleep pattern?',
      options: [
        { text: 'Light, easily disturbed', dosha: 'Vata', score: 2 },
        { text: 'Moderate, can manage', dosha: 'Pitta', score: 2 },
        { text: 'Deep, heavy sleeper', dosha: 'Kapha', score: 2 }
      ]
    },
    {
      id: 'temperature',
      question: 'How do you feel about temperature?',
      options: [
        { text: 'Prefer warm weather', dosha: 'Vata', score: 2 },
        { text: 'Prefer cool weather', dosha: 'Pitta', score: 2 },
        { text: 'Comfortable in most weather', dosha: 'Kapha', score: 2 }
      ]
    },
    {
      id: 'mind',
      question: 'How is your mental activity?',
      options: [
        { text: 'Quick, restless, creative', dosha: 'Vata', score: 2 },
        { text: 'Sharp, focused, analytical', dosha: 'Pitta', score: 2 },
        { text: 'Calm, steady, peaceful', dosha: 'Kapha', score: 2 }
      ]
    },
    {
      id: 'stress',
      question: 'How do you respond to stress?',
      options: [
        { text: 'Anxiety, worry, fear', dosha: 'Vata', score: 2 },
        { text: 'Irritability, anger', dosha: 'Pitta', score: 2 },
        { text: 'Withdrawal, lethargy', dosha: 'Kapha', score: 2 }
      ]
    },
    {
      id: 'activity',
      question: 'What is your activity level?',
      options: [
        { text: 'Always moving, restless', dosha: 'Vata', score: 2 },
        { text: 'Active with purpose', dosha: 'Pitta', score: 2 },
        { text: 'Slow, relaxed', dosha: 'Kapha', score: 2 }
      ]
    }
  ];

  const handleAnswer = async (questionId, dosha, score) => {
    const updatedAnswers = { ...answers, [questionId]: { dosha, score } };
    setAnswers(updatedAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      calculateResult(updatedAnswers);
    }
  };

  const calculateResult = async (finalAnswers) => {
    setLoading(true);
    
    const doshaScores = { Vata: 0, Pitta: 0, Kapha: 0 };
    
    Object.values(finalAnswers).forEach(answer => {
      doshaScores[answer.dosha] += answer.score;
    });

    const total = doshaScores.Vata + doshaScores.Pitta + doshaScores.Kapha;
    
    const resultData = {
      vata: Math.round((doshaScores.Vata / total) * 100),
      pitta: Math.round((doshaScores.Pitta / total) * 100),
      kapha: Math.round((doshaScores.Kapha / total) * 100),
      dominantDosha: Object.keys(doshaScores).reduce((a, b) => doshaScores[a] > doshaScores[b] ? a : b)
    };

    setResult(resultData);

    // Save to backend
    try {
      const api = require('../../services/api').default;
      await api.post('/ayurveda/prakriti', {
        answers: Object.values(finalAnswers).map(a => a.dosha === 'Vata' ? 0 : a.dosha === 'Pitta' ? 1 : 2),
        result: resultData
      });
    } catch (err) {
      console.log('Failed to save result');
    }

    // Get recommended doctors
    try {
      const response = await getAyurvedaDoctors({ available: true });
      if (response.data.success) {
        setRecommendedDoctors(response.data.data.slice(0, 3));
      }
    } catch (err) {
      console.log('Failed to load doctors');
    }

    setLoading(false);
  };

  const handleDownloadReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Result Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white text-center">
              <FaCheckCircle className="text-5xl mx-auto mb-3" />
              <h1 className="text-2xl font-bold">Your Prakriti Assessment</h1>
              <p className="text-green-100 mt-1">Your Ayurvedic Wellness Profile</p>
            </div>

            <div className="p-6">
              {/* Dominant Dosha */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  Your Dominant Dosha: <span className="text-green-600">{result.dominantDosha}</span>
                </h2>
                <p className="text-gray-600">Based on your responses, here's your constitution analysis</p>
              </div>

              {/* Dosha Scores */}
              <div className="space-y-4 mb-8">
                {[
                  { name: 'Vata', value: result.vata, color: 'bg-blue-500', desc: 'Movement & Creativity' },
                  { name: 'Pitta', value: result.pitta, color: 'bg-red-500', desc: 'Metabolism & Transformation' },
                  { name: 'Kapha', value: result.kapha, color: 'bg-green-500', desc: 'Structure & Stability' }
                ].map(dosha => (
                  <div key={dosha.name}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{dosha.name} ({dosha.desc})</span>
                      <span className="font-bold">{dosha.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`${dosha.color} h-4 rounded-full transition-all duration-1000`}
                        style={{ width: `${dosha.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Disclaimer:</strong> This is an educational wellness assessment tool and does not 
                  replace professional medical evaluation. Consult an Ayurveda doctor for personalized advice.
                </p>
              </div>

              {/* Recommended Doctors */}
              {recommendedDoctors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FaUserMd className="text-green-600" /> Recommended Ayurveda Doctors
                  </h3>
                  <div className="space-y-3">
                    {recommendedDoctors.map((doctor) => (
                      <div key={doctor._id} className="flex items-center justify-between border rounded-lg p-3">
                        <div>
                          <p className="font-medium">{doctor.name}</p>
                          <p className="text-sm text-gray-600">{doctor.specialization}</p>
                          <p className="text-sm text-gray-500">₹{doctor.consultationFee}</p>
                        </div>
                        <button
                          onClick={() => navigate('/ayurveda/book-consultation', { state: { doctor } })}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                        >
                          Book Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/ayurveda/doctors')}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold"
                >
                  Browse All Doctors
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <FaDownload /> Download Report
                </button>
              </div>

              <button
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  setStep(0);
                }}
                className="w-full mt-3 text-gray-500 py-2 text-sm"
              >
                Retake Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {step + 1} of {questions.length}</span>
            <span>{Math.round((step / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${(step / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-xl font-bold mb-4">{questions[step].question}</h1>
          <div className="space-y-3">
            {questions[step].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(questions[step].id, option.dosha, option.score)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg text-left hover:border-green-500 hover:bg-green-50 transition-all"
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrakritiQuiz;