import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SeasonalWellness = () => {
  const navigate = useNavigate();
  
  const currentSeason = getCurrentSeason();
  
  const seasons = {
    'Spring': {
      icon: '🌸', name: 'Vasant Ritu',
      dosha: 'Kapha aggravates',
      tips: ['Light meals', 'Morning exercise', 'Honey + warm water'],
      therapies: ['Vamana (Therapeutic Vomiting)', 'Nasya (Nasal Therapy)'],
      products: ['Trikatu Churna', 'Ginger Tea', 'Neem Capsules'],
      color: 'from-pink-500 to-rose-500'
    },
    'Summer': {
      icon: '☀️', name: 'Grishma Ritu',
      dosha: 'Pitta aggravates',
      tips: ['Cool foods', 'Coconut water', 'Avoid spicy food'],
      therapies: ['Virechana (Purgation)', 'Sheetali Pranayama'],
      products: ['Amla Juice', 'Sandalwood Paste', 'Rose Water'],
      color: 'from-yellow-500 to-orange-500'
    },
    'Monsoon': {
      icon: '🌧️', name: 'Varsha Ritu',
      dosha: 'Vata aggravates',
      tips: ['Warm soups', 'Ginger tea', 'Avoid raw food'],
      therapies: ['Basti (Enema Therapy)', 'Abhyanga (Oil Massage)'],
      products: ['Dashmool Kwath', 'Mahanarayan Oil', 'Chyawanprash'],
      color: 'from-blue-500 to-indigo-500'
    },
    'Autumn': {
      icon: '🍂', name: 'Sharad Ritu',
      dosha: 'Pitta pacifies',
      tips: ['Light diet', 'Moon bathing', 'Avoid sour food'],
      therapies: ['Virechana', 'Raktamokshana'],
      products: ['Shatavari', 'Aloe Vera Juice', 'Brahmi'],
      color: 'from-orange-500 to-amber-500'
    },
    'Winter': {
      icon: '❄️', name: 'Hemant Ritu',
      dosha: 'Vata-Kapha balance',
      tips: ['Heavy nourishing food', 'Oil massage daily', 'Warm milk'],
      therapies: ['Abhyanga', 'Swedana (Steam Therapy)', 'Shirodhara'],
      products: ['Ashwagandha', 'Sesame Oil', 'Dates & Nuts'],
      color: 'from-purple-500 to-violet-500'
    }
  };

  const season = seasons[currentSeason];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className={`bg-gradient-to-r ${season.color} text-white`}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link to="/ayurveda" className="text-white/80 hover:text-white text-sm">← Back</Link>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-5xl">{season.icon}</span>
            <div>
              <h1 className="text-3xl font-bold">{season.name}</h1>
              <p className="text-white/80">{currentSeason} Season • {season.dosha}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Diet Tips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🥗 Diet Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {season.tips.map((tip, i) => (
              <div key={i} className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-sm text-green-800">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recommended Therapies */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">💆 Recommended Therapies</h2>
          <div className="space-y-3">
            {season.therapies.map((therapy, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                <span className="font-medium text-gray-700">{therapy}</span>
                <button 
                  onClick={() => navigate('/ayurveda/centers')}
                  className="text-amber-600 text-sm font-medium hover:underline"
                >
                  Book Now →
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Wellness Products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🌿 Seasonal Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {season.products.map((product, i) => (
              <div key={i} className="bg-orange-50 rounded-xl p-4 text-center">
                <p className="font-medium text-gray-700">{product}</p>
                <button 
                  onClick={() => navigate('/ayurveda/commerce')}
                  className="mt-2 text-orange-600 text-sm hover:underline"
                >
                  Shop Now →
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className={`bg-gradient-to-r ${season.color} rounded-2xl p-8 text-white text-center`}>
          <h3 className="text-xl font-bold mb-2">Want a personalized plan?</h3>
          <p className="mb-4 text-white/80">Consult an Ayurvedic doctor for season-specific guidance</p>
          <button
            onClick={() => navigate('/ayurveda/doctors')}
            className="px-6 py-3 bg-white text-gray-800 rounded-xl font-bold hover:bg-gray-100 transition"
          >
            Book Consultation →
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 6) return 'Summer';
  if (month >= 7 && month <= 8) return 'Monsoon';
  if (month >= 9 && month <= 10) return 'Autumn';
  return 'Winter';
};

export default SeasonalWellness;