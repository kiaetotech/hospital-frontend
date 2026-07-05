import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { FaSearch, FaUserMd, FaExclamationTriangle, FaLightbulb, FaArrowRight } from 'react-icons/fa';

const SymptomTriage = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const commonSymptoms = [
    'Fever and headache', 'Chest pain', 'Skin rash', 'Stomach pain',
    'Back pain', 'Anxiety and stress', 'Cough and cold', 'Joint pain'
  ];

  const handleTriage = async () => {
    if (!symptoms.trim() || symptoms.trim().length < 3) {
      setError('Please describe your symptoms in more detail');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/online-doctor/triage', { symptoms });
      if (res.data?.success) {
        setResult(res.data.data);
      } else {
        setError(res.data?.message || 'Unable to analyze symptoms');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error analyzing symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                onClick={() => setSymptoms(s)}
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
              <>⏳ Analyzing symptoms...</>
            ) : (
              <><FaSearch /> Analyze Symptoms</>
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
                <p className="text-red-700 mb-4">{result.recommendation?.action}</p>
                <button
                  onClick={() => navigate('/emergency-search')}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                >
                  🚨 Find Emergency Help Now
                </button>
              </div>
            )}

            {/* Recommendation */}
            {!result.isEmergency && result.recommendation && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">🏥</div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{result.recommendation.specialty}</h3>
                    <p className="text-gray-500 text-sm">
                      Confidence: {result.recommendation.confidence} • 
                      Urgency: {result.recommendation.estimatedUrgency}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{result.message}</p>

                {/* All possible specialties */}
                {result.allPossibleSpecialties?.length > 1 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Other possible specialties:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.allPossibleSpecialties.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{s}</span>
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
              </div>
            )}

            {/* Available Doctors */}
            {result.availableDoctors?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaUserMd className="text-blue-600" /> 
                  Available {result.recommendation?.specialty}s ({result.doctorsCount}+)
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

                {result.searchUrl && (
                  <button
                    onClick={() => navigate(result.searchUrl)}
                    className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition"
                  >
                    View All {result.recommendation?.specialty}s →
                  </button>
                )}
              </div>
            )}

            {/* Matched Symptoms Detail */}
            {result.matches?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-3">📊 Analysis Details</h3>
                <div className="space-y-2">
                  {result.matches.map((match, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <span className="text-sm font-medium text-gray-700">{match.condition}</span>
                        <span className="text-xs text-gray-400 ml-2">→ {match.specialty}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        match.confidence === 'High' ? 'bg-green-100 text-green-700' :
                        match.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {match.confidence}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SymptomTriage;