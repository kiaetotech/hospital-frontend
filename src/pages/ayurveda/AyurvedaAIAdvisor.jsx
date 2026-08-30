import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendedDoctors } from '../../services/ayurvedaApi';
import { FaRobot, FaUserMd, FaArrowLeft, FaSearch, FaStar } from 'react-icons/fa';

const AyurvedaAIAdvisor = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const symptomMapping = {
    'digestion': { specialty: 'General Ayurveda', message: 'Your symptoms suggest digestive imbalance. A General Ayurveda specialist can help.' },
    'acidity': { specialty: 'General Ayurveda', message: 'Acidity is often related to Pitta imbalance. Consult an Ayurveda physician.' },
    'constipation': { specialty: 'Panchakarma', message: 'Constipation may benefit from Panchakarma therapies like Basti.' },
    'joint pain': { specialty: 'Panchakarma', message: 'Joint pain responds well to Panchakarma treatments.' },
    'arthritis': { specialty: 'Panchakarma', message: 'Arthritis management through Panchakarma has shown good results.' },
    'skin': { specialty: 'Ayurvedic Dermatology', message: 'Skin issues often relate to dosha imbalance. An Ayurvedic dermatologist can help.' },
    'acne': { specialty: 'Ayurvedic Dermatology', message: 'Acne treatment in Ayurveda focuses on internal balance.' },
    'stress': { specialty: 'Kayachikitsa', message: 'Stress management through Ayurveda includes lifestyle and herbal support.' },
    'anxiety': { specialty: 'Kayachikitsa', message: 'Anxiety can be managed with Ayurvedic approaches.' },
    'sleep': { specialty: 'Kayachikitsa', message: 'Sleep issues often relate to Vata imbalance.' },
    'insomnia': { specialty: 'Kayachikitsa', message: 'Insomnia treatment in Ayurveda focuses on calming Vata.' },
    'weight': { specialty: 'Rasayana Therapy', message: 'Weight management through Ayurveda includes diet and lifestyle changes.' },
    'detox': { specialty: 'Panchakarma', message: 'Detoxification is best achieved through Panchakarma.' },
    'hair': { specialty: 'Ayurvedic Dermatology', message: 'Hair issues can be addressed with Ayurvedic treatments.' },
    'immunity': { specialty: 'Rasayana Therapy', message: 'Immunity boosting through Rasayana therapy.' }
  };

  const handleAnalyze = async () => {
    setError('');
    
    if (!symptoms || symptoms.trim().length < 3) {
      setError('Please describe your symptoms (at least 3 characters)');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Analyze symptoms
      const symptomsLower = symptoms.toLowerCase();
      let matchedSpecialty = null;
      let matchedMessage = '';

      for (const [keyword, data] of Object.entries(symptomMapping)) {
        if (symptomsLower.includes(keyword)) {
          matchedSpecialty = data.specialty;
          matchedMessage = data.message;
          break;
        }
      }

      if (!matchedSpecialty) {
        matchedSpecialty = 'General Ayurveda';
        matchedMessage = 'Based on your symptoms, a General Ayurveda consultation is recommended.';
      }

      // Get recommended doctors
      const lat = localStorage.getItem('userLat');
      const lng = localStorage.getItem('userLng');
      
      let doctors = [];
      if (lat && lng) {
        const response = await getRecommendedDoctors(lat, lng, symptoms);
        if (response.data.success) {
          doctors = response.data.data.recommendedDoctors || [];
        }
      }

      setResult({
        specialty: matchedSpecialty,
        message: matchedMessage,
        doctors: doctors,
        disclaimer: 'This is an AI-assisted recommendation tool and does not replace professional medical advice.'
      });
    } catch (err) {
      setError('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => navigate('/ayurveda')}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6"
        >
          <FaArrowLeft /> Back to Ayurveda
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white text-center">
            <FaRobot className="text-5xl mx-auto mb-3" />
            <h1 className="text-2xl font-bold">AI Ayurveda Advisor</h1>
            <p className="text-green-100 mt-1">Describe your symptoms, get specialist recommendations</p>
          </div>

          <div className="p-6">
            {/* Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Symptoms *
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows="4"
                placeholder="e.g., I have been experiencing joint pain and stiffness in the morning..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <FaSearch />
              {loading ? 'Analyzing...' : 'Get Recommendations'}
            </button>

            {/* Result */}
            {result && (
              <div className="mt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-green-800 mb-2">
                    Recommended Specialty: {result.specialty}
                  </h3>
                  <p className="text-sm text-gray-700">{result.message}</p>
                </div>

                {/* Recommended Doctors */}
                {result.doctors.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FaUserMd className="text-green-600" /> Recommended Doctors
                    </h4>
                    <div className="space-y-3">
                      {result.doctors.map((doctor, index) => (
                        <div key={index} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <p className="font-medium">{doctor.name}</p>
                            <p className="text-sm text-gray-600">{doctor.specialization}</p>
                            <p className="text-sm text-gray-500">
                              <FaStar className="inline text-yellow-400" /> {doctor.rating || 'New'} • ₹{doctor.consultationFee}
                            </p>
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

                {/* Browse All */}
                <button
                  onClick={() => navigate('/ayurveda/doctors')}
                  className="w-full mt-4 bg-white border border-green-600 text-green-600 py-2 rounded-lg font-medium"
                >
                  Browse All Doctors
                </button>

                {/* Disclaimer */}
                <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <p className="text-xs text-yellow-800">{result.disclaimer}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AyurvedaAIAdvisor;