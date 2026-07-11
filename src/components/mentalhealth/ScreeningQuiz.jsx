import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaBrain, 
  FaHeart, 
  FaSmile,
  FaChartLine,
  FaFileAlt,
  FaDownload,
  FaShare
} from 'react-icons/fa';
import axios from 'axios';

const ScreeningQuiz = ({ 
  type = 'depression', 
  onComplete, 
  onCancel,
  userId,
  isAnonymous = false
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  // PHQ-9 Questions (Depression)
  const depressionQuestions = [
    {
      id: 1,
      text: 'Little interest or pleasure in doing things',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 2,
      text: 'Feeling down, depressed, or hopeless',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 3,
      text: 'Trouble falling or staying asleep, or sleeping too much',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 4,
      text: 'Feeling tired or having little energy',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 5,
      text: 'Poor appetite or overeating',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 6,
      text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 7,
      text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 8,
      text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 9,
      text: 'Thoughts that you would be better off dead or of hurting yourself in some way',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    }
  ];

  // GAD-7 Questions (Anxiety)
  const anxietyQuestions = [
    {
      id: 1,
      text: 'Feeling nervous, anxious or on edge',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 2,
      text: 'Not being able to stop or control worrying',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 3,
      text: 'Worrying too much about different things',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 4,
      text: 'Trouble relaxing',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 5,
      text: 'Being so restless that it is hard to sit still',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 6,
      text: 'Becoming easily annoyed or irritable',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 7,
      text: 'Feeling afraid as if something awful might happen',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    }
  ];

  const getQuizData = () => {
    const quizMap = {
      'depression': {
        title: 'Depression Screening (PHQ-9)',
        description: 'This 9-question screening test helps assess symptoms of depression.',
        icon: <FaHeart className="text-blue-500" />,
        questions: depressionQuestions,
        scoring: {
          '0-4': { severity: 'None-minimal', color: 'green', recommendation: 'No significant depressive symptoms detected.' },
          '5-9': { severity: 'Mild', color: 'yellow', recommendation: 'Mild depressive symptoms. Consider self-care and monitoring.' },
          '10-14': { severity: 'Moderate', color: 'orange', recommendation: 'Moderate depressive symptoms. Consider talking to a mental health professional.' },
          '15-19': { severity: 'Moderately severe', color: 'red', recommendation: 'Moderately severe depressive symptoms. Strongly recommend consulting a mental health professional.' },
          '20-27': { severity: 'Severe', color: 'darkred', recommendation: 'Severe depressive symptoms. Please seek immediate professional help.' }
        }
      },
      'anxiety': {
        title: 'Anxiety Screening (GAD-7)',
        description: 'This 7-question screening test helps assess symptoms of generalized anxiety disorder.',
        icon: <FaBrain className="text-purple-500" />,
        questions: anxietyQuestions,
        scoring: {
          '0-4': { severity: 'None-minimal', color: 'green', recommendation: 'No significant anxiety symptoms detected.' },
          '5-9': { severity: 'Mild', color: 'yellow', recommendation: 'Mild anxiety symptoms. Consider self-care and monitoring.' },
          '10-14': { severity: 'Moderate', color: 'orange', recommendation: 'Moderate anxiety symptoms. Consider talking to a mental health professional.' },
          '15-21': { severity: 'Severe', color: 'red', recommendation: 'Severe anxiety symptoms. Strongly recommend consulting a mental health professional.' }
        }
      },
      'stress': {
        title: 'Stress Assessment',
        description: 'This assessment helps evaluate your current stress levels.',
        icon: <FaSmile className="text-orange-500" />,
        questions: [
          {
            id: 1,
            text: 'How often do you feel overwhelmed by your daily responsibilities?',
            options: [
              { value: 0, label: 'Never' },
              { value: 1, label: 'Rarely' },
              { value: 2, label: 'Sometimes' },
              { value: 3, label: 'Often' },
              { value: 4, label: 'Always' }
            ]
          },
          {
            id: 2,
            text: 'How often do you have difficulty sleeping due to stress?',
            options: [
              { value: 0, label: 'Never' },
              { value: 1, label: 'Rarely' },
              { value: 2, label: 'Sometimes' },
              { value: 3, label: 'Often' },
              { value: 4, label: 'Always' }
            ]
          },
          {
            id: 3,
            text: 'How often do you feel irritable or short-tempered?',
            options: [
              { value: 0, label: 'Never' },
              { value: 1, label: 'Rarely' },
              { value: 2, label: 'Sometimes' },
              { value: 3, label: 'Often' },
              { value: 4, label: 'Always' }
            ]
          },
          {
            id: 4,
            text: 'How often do you feel like you cannot cope with everything you have to do?',
            options: [
              { value: 0, label: 'Never' },
              { value: 1, label: 'Rarely' },
              { value: 2, label: 'Sometimes' },
              { value: 3, label: 'Often' },
              { value: 4, label: 'Always' }
            ]
          },
          {
            id: 5,
            text: 'How often do you feel nervous or stressed?',
            options: [
              { value: 0, label: 'Never' },
              { value: 1, label: 'Rarely' },
              { value: 2, label: 'Sometimes' },
              { value: 3, label: 'Often' },
              { value: 4, label: 'Always' }
            ]
          }
        ],
        scoring: {
          '0-5': { severity: 'Low Stress', color: 'green', recommendation: 'You are managing stress well. Continue your current coping strategies.' },
          '6-10': { severity: 'Moderate Stress', color: 'yellow', recommendation: 'Some stress present. Consider stress management techniques.' },
          '11-15': { severity: 'High Stress', color: 'orange', recommendation: 'High stress levels. Consider professional support and stress reduction techniques.' },
          '16-20': { severity: 'Very High Stress', color: 'red', recommendation: 'Very high stress levels. Please seek professional help immediately.' }
        }
      }
    };
    return quizMap[type] || quizMap['depression'];
  };

  useEffect(() => {
    const data = getQuizData();
    setQuizData(data);
    setAnswers(new Array(data.questions.length).fill(-1));
    setLoading(false);
    setStartTime(Date.now());

    // Timer
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [type]);

  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (answers.some(a => a === -1)) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setLoading(true);
    try {
      const totalScore = answers.reduce((sum, val) => sum + val, 0);
      const result = calculateResult(totalScore);

      // Save to backend
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/mentalhealth/screening`,
        {
          type,
          answers,
          totalScore,
          result,
          isAnonymous,
          userId: isAnonymous ? null : userId,
          timeSpent
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setQuizData({ ...quizData, result, totalScore, screeningId: response.data.data._id });
      setShowResults(true);
      onComplete?.(response.data.data);
    } catch (err) {
      setError('Failed to save screening results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateResult = (totalScore) => {
    const scoring = quizData.scoring;
    let severity = '';
    let color = '';
    let recommendation = '';

    for (const [range, data] of Object.entries(scoring)) {
      const [min, max] = range.split('-').map(Number);
      if (totalScore >= min && totalScore <= max) {
        severity = data.severity;
        color = data.color;
        recommendation = data.recommendation;
        break;
      }
    }

    return { severity, color, recommendation, totalScore };
  };

  const handleDownloadReport = () => {
    // Generate PDF report
    window.open(
      `${process.env.REACT_APP_API_URL}/api/mentalhealth/screening/${quizData.screeningId}/report`,
      '_blank'
    );
  };

  const handleShareResult = () => {
    const text = `I just completed a ${quizData.title}. My score: ${quizData.totalScore}/${
      quizData.questions.length * 3
    } - ${quizData.result.severity}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Mental Health Screening Result',
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    }
  };

  if (loading && !quizData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading screening...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-500 text-4xl mb-3">⚠️</div>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (showResults) {
    const result = quizData.result;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-${result.color}-100 mb-4`}>
            {result.severity === 'None-minimal' || result.severity === 'Low Stress' ? (
              <FaSmile className={`text-4xl text-${result.color}-500`} />
            ) : result.severity === 'Mild' || result.severity === 'Moderate Stress' ? (
              <FaBrain className={`text-4xl text-${result.color}-500`} />
            ) : (
              <FaHeart className={`text-4xl text-${result.color}-500`} />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Screening Complete</h2>
          <p className="text-gray-600 mt-2">Here are your results</p>
        </div>

        <div className="space-y-6">
          <div className={`bg-${result.color}-50 border border-${result.color}-200 rounded-lg p-6 text-center`}>
            <p className="text-sm text-gray-600">Your Score</p>
            <p className={`text-4xl font-bold text-${result.color}-600`}>
              {result.totalScore}
            </p>
            <p className={`text-lg font-semibold text-${result.color}-600 mt-1`}>
              {result.severity}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-700 mb-2">Recommendation</h3>
            <p className="text-gray-600">{result.recommendation}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> This screening is not a diagnosis. Please consult a mental health professional for proper evaluation.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadReport}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <FaDownload /> Download Report
            </button>
            <button
              onClick={handleShareResult}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FaShare /> Share Results
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  const currentQ = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-600">
            {quizData.icon}
            <h2 className="text-xl font-semibold">{quizData.title}</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">{quizData.description}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FaClock /> {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Question {currentQuestion + 1} of {quizData.questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="mb-8"
        >
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {currentQ.text}
          </h3>
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${
                  answers[currentQuestion] === option.value
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="question"
                  value={option.value}
                  checked={answers[currentQuestion] === option.value}
                  onChange={() => handleAnswer(option.value)}
                  className="hidden"
                />
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  answers[currentQuestion] === option.value
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                }`}>
                  {answers[currentQuestion] === option.value && (
                    <FaCheck className="text-white text-xs" />
                  )}
                </div>
                <span className="ml-3 text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition ${
            currentQuestion === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaArrowLeft /> Previous
        </button>
        <button
          onClick={handleNext}
          disabled={answers[currentQuestion] === -1}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition ${
            answers[currentQuestion] === -1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
          }`}
        >
          {currentQuestion === quizData.questions.length - 1 ? (
            <>
              Submit <FaCheck />
            </>
          ) : (
            <>
              Next <FaArrowRight />
            </>
          )}
        </button>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 flex justify-center gap-1">
        {quizData.questions.map((_, index) => (
          <div
            key={index}
            className={`h-1 w-6 rounded-full ${
              index === currentQuestion
                ? 'bg-purple-500'
                : answers[index] !== -1
                ? 'bg-green-400'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ScreeningQuiz;
