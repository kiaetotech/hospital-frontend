import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { FaSearch, FaUserMd, FaExclamationTriangle, FaLightbulb, FaArrowRight, FaBrain } from 'react-icons/fa';

const SymptomTriage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const commonSymptoms = [
    'Fever and headache', 'Chest pain', 'Skin rash', 'Stomach pain',
    'Back pain', 'Anxiety and stress', 'Cough and cold', 'Joint pain'
  ];

  // Auto-fill from URL params (from search bar)
  useEffect(() => {
    const q = searchParams.get('symptoms');
    if (q) {
      setSymptoms(q);
      // Auto-analyze after a short delay
      const timer = setTimeout(() => handleTriageWithText(q), 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleTriageWithText = async (text) => {
    if (!text || text.trim().length < 2) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('/online-doctor/triage', { symptoms: text.trim() });
      if (res.data?.success) {
        setResult(res.data.data);
      } else {
        setError(res.data?.message || 'Unable to analyze symptoms');
      }
    } catch (err) {
      console.error('Triage error:', err);
      setError('Error connecting to AI service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTriage = async () => {
    if (!symptoms.trim() || symptoms.trim().length < 2) {
      setError('Please describe your symptoms in more detail');
      return;
    }
    await handleTriageWithText(symptoms);
  };

  // Check if result uses new AI format or old format
  const isNewFormat = result && !result.recommendation;
  const recommendation = isNewFormat ? {
    specialty: result.specialty,
    confidence: result.confidence,
    estimatedUrgency: result.urgencyLevel,
    action: result.isEmergency ? result.action : `Book a ${result.specialty} consultation`
  } : result?.recommendation;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link to="/online-doctor" className="text-blue-600 hover:underline text-sm">← Back to Online Doctor</Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">🤖 AI Symptom Checker</h1>
          <p className="text-gray-500 text-sm mt-1">Not sure which doctor to see? Describe your symptoms and we'll help.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaSearch className="text-blue-600" /> Describe Your Symptoms
          </h3>
          
          <textarea
            value={symptoms}
            onChange={(e) => { setSymptoms(e.target.value); setError(''); }}
            placeholder="Example: I have had a headache for 3 days with mild fever and body pain..."
            rows={4}
            className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-400 resize-none text-sm"
          />

          {/* Common symptoms quick select */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 pt-1">Quick select:</span>
            {commonSymptoms.map((s) => (
              <button
                key={s}
                onClick={() => { setSymptoms(s); setError(''); }}
                className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-full text-xs transition"
              >
                {s}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-3 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          <button
            onClick={handleTriage}
            disabled={loading || !symptoms.trim()}
            className={`mt-4 w-full py-3.5 rounded-xl font-bold text-white transition shadow-lg flex items-center justify-center gap-2 ${
              loading || !symptoms.trim() 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>⏳ Analyzing with AI...</>
            ) : (
              <><FaBrain /> Analyze Symptoms</>
            )}
          </button>

          <p className="text-xs text-gray-400 mt-3 text-center">
            ⚠️ This is an AI-assisted tool. Always consult a qualified doctor for medical advice.
          </p>
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Emergency Warning */}
            {result.isEmergency && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FaExclamationTriangle className="text-red-600 text-2xl" />
                  <h3 className="font-bold text-red-800 text-lg">⚠️ Medical Emergency Detected</h3>
                </div>
                <p className="text-red-700 mb-2">{result.emergencyReason || recommendation?.action}</p>
                <button
                  onClick={() => navigate('/emergency-search')}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                >
                  🚨 Find Emergency Help Now
                </button>
              </div>
            )}

            {/* Recommendation */}
            {!result.isEmergency && recommendation && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">🏥</div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{recommendation.specialty}</h3>
                    <p className="text-gray-500 text-sm">
                      Confidence: {recommendation.confidence} • Method: {result.method || 'AI'}
                      {recommendation.estimatedUrgency && <> • Urgency: {recommendation.estimatedUrgency}</>}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{result.message || recommendation.action}</p>

                {/* Possible Conditions */}
                {result.possibleConditions?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Possible conditions:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.possibleConditions.map((c, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Health Tips */}
                {result.healthTips?.length > 0 && (
                  <div className="bg-yellow-50 rounded-xl p-4 mb-4">
                    <p className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                      <FaLightbulb /> Health Tips
                    </p>
                    <ul className="space-y-2">
                      {result.healthTips.map((tip, i) => (
                        <li key={i} className="text-sm text-yellow-700 flex items-start gap-2">
                          <span className="text-yellow-500 mt-1">•</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Tests */}
                {result.recommendedTests?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Recommended tests:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.recommendedTests.map((t, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">🧪 {t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Available Doctors */}
            {result.availableDoctors?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaUserMd className="text-blue-600" /> 
                  Available {recommendation?.specialty || result.specialty}s
                </h3>
                <div className="space-y-3">
                  {result.availableDoctors.slice(0, 4).map((doc) => (
                    <div
                      key={doc._id}
                      onClick={() => navigate(`/online-doctor/doctor/${doc._id}`)}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-blue-50 transition"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">👨‍⚕️</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800">Dr. {doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.specialization} • {doc.experience} yrs</p>
                        <p className="text-sm">
                          ⭐ {doc.ratingSummary?.averageRating?.toFixed(1) || 'New'} 
                          <span className="text-gray-400 ml-2">₹{doc.consultationFee}</span>
                        </p>
                      </div>
                      <FaArrowRight className="text-gray-400" />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate(`/online-doctor/search?specialty=${encodeURIComponent(recommendation?.specialty || result.specialty || 'General Medicine')}`)}
                  className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition"
                >
                  View All {(recommendation?.specialty || result.specialty || 'General Medicine')}s →
                </button>
              </div>
            )}

            {/* Additional Notes */}
            {result.additionalNotes && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-2">📝 Additional Notes</h3>
                <p className="text-sm text-gray-600">{result.additionalNotes}</p>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 text-center">
              {result.disclaimer || 'This is AI-assisted triage. Always consult a qualified doctor for accurate diagnosis.'}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default SymptomTriage;