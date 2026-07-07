import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaShoppingCart, FaStar, FaLeaf, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const PrakritiCommerce = () => {
  const navigate = useNavigate();
  const [prakritiType, setPrakritiType] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchPrakritiAndProducts();
  }, []);

  const fetchPrakritiAndProducts = async () => {
    try {
      // Get user's Prakriti from localStorage or API
      const savedPrakriti = localStorage.getItem('prakritiResult');
      if (savedPrakriti) {
        const parsed = JSON.parse(savedPrakriti);
        setPrakritiType(parsed.dominantDosha || parsed.type);
      }

      // Fetch products
      const res = await api.get('/ayurveda/products');
      if (res.data?.success) {
        setProducts(res.data.data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const prakritiProducts = prakritiType 
    ? products.filter(p => p.prakritiType?.some(t => t.includes(prakritiType) || t === 'All'))
    : [];

  const categories = ['all', 'oil', 'tea', 'supplement', 'herb', 'churna', 'tablet', 'syrup', 'cream'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Link to="/ayurveda" className="text-white/80 hover:text-white text-sm">← Back to Ayurveda</Link>
          <h1 className="text-3xl font-bold mt-2">🌿 Prakriti Wellness Store</h1>
          <p className="text-white/80 mt-2">Personalized products based on your body type</p>
          
          {prakritiType && (
            <div className="mt-4 bg-white/20 backdrop-blur rounded-xl p-4 inline-block">
              <p className="text-sm">Your Prakriti</p>
              <p className="text-2xl font-bold">{prakritiType}</p>
              <button onClick={() => navigate('/ayurveda/prakriti')} className="text-xs underline mt-1">
                Re-take Quiz
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Personalized Section */}
        {prakritiProducts.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaLeaf className="text-green-600" /> Recommended for {prakritiType} Type
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {prakritiProducts.slice(0, 4).map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* All Products with Category Filter */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">All Products</h2>
          
          {/* Category Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  activeCategory === cat 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
                }`}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading products...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredProducts.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Not sure what you need?</h3>
          <p className="mb-4 text-white/80">Consult an Ayurvedic doctor for personalized recommendations</p>
          <button
            onClick={() => navigate('/ayurveda/doctors')}
            className="px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-gray-100 transition"
          >
            Book Consultation →
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer"
  >
    <div className="h-40 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center text-5xl">
      {product.images?.[0] ? (
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
      ) : (
        <span>{getProductEmoji(product.category)}</span>
      )}
    </div>
    <div className="p-4">
      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
        {product.category}
      </span>
      <h3 className="font-semibold text-gray-800 mt-2 text-sm">{product.name}</h3>
      <div className="flex items-center gap-1 mt-1">
        <FaStar className="text-yellow-400 text-xs" />
        <span className="text-xs text-gray-500">{product.rating || 'New'}</span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div>
          {product.discountPrice ? (
            <>
              <span className="font-bold text-green-600">₹{product.discountPrice}</span>
              <span className="text-xs text-gray-400 line-through ml-1">₹{product.price}</span>
            </>
          ) : (
            <span className="font-bold text-gray-800">₹{product.price}</span>
          )}
        </div>
        <button className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-600 hover:text-white transition">
          <FaShoppingCart size={12} />
        </button>
      </div>
    </div>
  </motion.div>
);

const getProductEmoji = (category) => {
  const map = {
    oil: '🧴', tea: '🍵', supplement: '💊', herb: '🌿',
    churna: '🟤', tablet: '💊', syrup: '🥤', cream: '🧴'
  };
  return map[category] || '🌿';
};

export default PrakritiCommerce;