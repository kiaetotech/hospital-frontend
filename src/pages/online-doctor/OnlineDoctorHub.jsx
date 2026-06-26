import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFeaturedOnlineDoctors } from '../../services/api';

const OnlineDoctorHub = () => {
  const navigate = useNavigate();
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [symptoms, setSymptoms] = useState('');
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);

  const specialties = [
    { name: 'General Physician', icon: '🩺', color: 'from-blue-400 to-blue-600' },
    { name: 'Dermatologist', icon: '🔬', color: 'from-green-400 to-green-600' },
    { name: 'Gynecologist', icon: '👩‍⚕️', color: 'from-pink-400 to-pink-600' },
    { name: 'Pediatrician', icon: '👶', color: 'from-yellow-400 to-yellow-600' },
    { name: 'Cardiologist', icon: '❤️', color: 'from-red-400 to-red-600' },
    { name: 'Neurologist', icon: '🧠', color: 'from-purple-400 to-purple-600' },
    { name: 'Orthopedic', icon: '🦴', color: 'from-orange-400 to-orange-600' },
    { name: 'ENT Specialist', icon: '👂', color: 'from-teal-400 to-teal-600' },
    { name: 'Psychiatrist', icon: '🧘', color: 'from-indigo-400 to-indigo-600' },
    { name: 'Gastroenterologist', icon: '🔍', color: 'from-cyan-400 to-cyan-600' },
    { name: 'Endocrinologist', icon: '💊', color: 'from-rose-400 to-rose-600' },
    { name: 'Nephrologist', icon: '🩸', color: 'from-amber-400 to-amber-600' },
  ];

  const symptomMap = {
    'fever': 'General Physician', 'cold': 'General Physician', 'cough': 'General Physician',
    'headache': 'Neurologist', 'skin rash': 'Dermatologist', 'acne': 'Dermatologist',
    'chest pain': 'Cardiologist', 'back pain': 'Orthopedic', 'joint pain': 'Orthopedic',
    'ear pain': 'ENT Specialist', 'throat': 'ENT Specialist', 'anxiety': 'Psychiatrist',
    'depression': 'Psychiatrist', 'stomach': 'Gastroenterologist', 'pregnancy': 'Gynecologist',
    'child fever': 'Pediatrician', 'diabetes': 'Endocrinologist', 'thyroid': 'Endocrinologist',
    'kidney': 'Nephrologist', 'urine': 'Nephrologist'
  };

  useEffect(() => {
    fetchFeaturedDoctors();
  }, []);

  const fetchFeaturedDoctors = async () => {
    try {
      const response = await getFeaturedOnlineDoctors();
      setFeaturedDoctors(response.data?.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/online-doctor/search?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/online-doctor/search');
    }
  };

  const handleSymptomCheck = useCallback(() => {
    if (!symptoms.trim()) return;
    const words = symptoms.toLowerCase().split(/[\s,]+/);
    let matchedSpecialty = null;
    
    for (const word of words) {
      if (symptomMap[word]) {
        matchedSpecialty = symptomMap[word];
        break;
      }
    }
    
    if (matchedSpecialty) {
      navigate(`/online-doctor/search?specialty=${encodeURIComponent(matchedSpecialty)}&q=${encodeURIComponent(symptoms)}`);
    } else {
      navigate(`/online-doctor/search?q=${encodeURIComponent(symptoms)}`);
    }
  }, [symptoms, navigate]);

  const handleInstantConsult = () => {
    navigate('/online-doctor/search?available=true&sort=rating');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="inline-block bg-white/20 rounded-full px-4 py-1 text-sm mb-6 backdrop-blur-sm">
            ⚡ 500+ Verified Doctors • 50,000+ Consultations • 4.6★ Rating
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Consult Top Doctors<br />
            <span className="text-yellow-300">in 5 Minutes</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            India's fastest growing teleconsultation platform. Video or audio consultation with verified doctors at your price.
          </p>
          
          {/* Search + Symptom Checker Toggle */}
          <div className="max-w-3xl mx-auto mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by specialty, doctor name, or symptom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-5 rounded-xl text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-yellow-300 shadow-lg"
                />
              </div>
              <button type="submit" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-8 py-5 rounded-xl font-bold text-lg transition shadow-lg">
                🔍
              </button>
            </form>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <button onClick={handleInstantConsult} className="bg-green-500 hover:bg-green-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg flex items-center gap-2">
              ⚡ Consult Now
            </button>
            <button onClick={() => setShowSymptomChecker(!showSymptomChecker)} className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg transition backdrop-blur-sm flex items-center gap-2">
              🤖 AI Symptom Check
            </button>
          </div>

          {/* AI Symptom Checker */}
          {showSymptomChecker && (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 text-gray-800 shadow-2xl animate-fadeIn">
              <h3 className="font-bold text-lg mb-3">🤖 AI Symptom Checker</h3>
              <p className="text-gray-500 mb-4 text-sm">Describe your symptoms. We'll suggest the right specialist.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder='e.g., "skin rash and itching since 3 days"'
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSymptomCheck()}
                  className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400"
                />
                <button onClick={handleSymptomCheck} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition">
                  Check
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3">Free tool • Helps you find the right doctor faster</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { value: '500+', label: 'Verified Doctors', icon: '👨‍⚕️' },
            { value: '50K+', label: 'Consultations Done', icon: '✅' },
            { value: '4.6', label: 'Average Rating', icon: '⭐' },
            { value: '3 min', label: 'Avg Wait Time', icon: '⚡' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Specialties Grid */}
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Consult by Specialty</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-16">
          {specialties.map((spec) => (
            <button
              key={spec.slug}
              onClick={() => navigate(`/online-doctor/search?specialty=${encodeURIComponent(spec.name)}`)}
              className={`bg-gradient-to-br ${spec.color} text-white rounded-2xl p-6 hover:scale-105 transition-transform shadow-md text-center`}
            >
              <div className="text-4xl mb-3">{spec.icon}</div>
              <p className="font-semibold text-sm">{spec.name}</p>
            </button>
          ))}
        </div>

        {/* Featured Doctors */}
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">⭐ Top Rated Doctors</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-5xl mb-4">⏳</div>
            <p className="text-gray-500">Loading doctors...</p>
          </div>
        ) : featuredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {featuredDoctors.map((doctor) => (
              <Link
                key={doctor._id}
                to={`/online-doctor/doctor/${doctor._id}`}
                className="bg-white rounded-2xl shadow-md p-8 hover:shadow-xl transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition">
                    👨‍⚕️
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Dr. {doctor.name}</h3>
                    <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-yellow-500 text-xl">⭐</span>
                  <span className="font-bold text-lg">{doctor.ratingSummary?.averageRating || 'New'}</span>
                  <span className="text-gray-400">({doctor.ratingSummary?.totalReviews || 0})</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-2xl font-bold text-green-600">₹{doctor.consultationFee}</span>
                  <span className="text-gray-500">{doctor.experience} yrs</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {doctor.languages?.slice(0, 3).map((lang) => (
                    <span key={lang} className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">{lang}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Featured doctors coming soon!</p>
        )}

        {/* Trust Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: '🔒', title: '100% Verified', desc: 'All doctors verified with MCI/State Medical Council. We check every credential.' },
            { icon: '💰', title: 'Transparent Pricing', desc: 'Doctor sets their fee. You see total price before booking. No hidden charges ever.' },
            { icon: '🛡️', title: 'Privacy First', desc: 'We don\'t store your medical history. Your health data belongs to you, always.' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Doctor CTA */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Are You a Doctor? 👨‍⚕️</h2>
          <p className="text-green-100 text-lg mb-8">Join 500+ doctors already consulting online. Set your own fee, your own hours. Pay only when you earn.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/online-doctor/register" className="bg-white text-green-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition shadow-lg">
              Register Now
            </Link>
            <Link to="/online-doctor/login" className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition">
              Doctor Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineDoctorHub;