import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch,
  FaFilter,
  FaBook,
  FaVideo,
  FaPodcast,
  FaArticle,
  FaHeart,
  FaSmile,
  FaBrain,
  FaUserMd,
  FaClock,
  FaEye,
  FaThumbsUp,
  FaShare,
  FaBookmark,
  FaArrowRight,
  FaTags,
  FaCalendarAlt,
  FaNewspaper,
  FaHeadphones,
  FaPlayCircle,
  FaFileAlt,
  FaGlobe
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const MentalHealthResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [featuredResource, setFeaturedResource] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);

  const categories = [
    { id: 'all', label: 'All', icon: <FaBook />, color: 'gray' },
    { id: 'anxiety', label: 'Anxiety', icon: <FaBrain />, color: 'purple' },
    { id: 'depression', label: 'Depression', icon: <FaHeart />, color: 'blue' },
    { id: 'stress', label: 'Stress', icon: <FaSmile />, color: 'green' },
    { id: 'relationships', label: 'Relationships', icon: <FaUserMd />, color: 'pink' },
    { id: 'trauma', label: 'Trauma', icon: <FaBrain />, color: 'red' },
    { id: 'wellness', label: 'Wellness', icon: <FaHeart />, color: 'teal' },
    { id: 'mindfulness', label: 'Mindfulness', icon: <FaSmile />, color: 'indigo' },
    { id: 'grief', label: 'Grief', icon: <FaHeart />, color: 'gray' },
    { id: 'sleep', label: 'Sleep', icon: <FaClock />, color: 'indigo' }
  ];

  const resourceTypes = [
    { id: 'all', label: 'All Types', icon: <FaFileAlt /> },
    { id: 'article', label: 'Articles', icon: <FaNewspaper /> },
    { id: 'blog', label: 'Blogs', icon: <FaBook /> },
    { id: 'video', label: 'Videos', icon: <FaPlayCircle /> },
    { id: 'podcast', label: 'Podcasts', icon: <FaHeadphones /> },
    { id: 'guide', label: 'Guides', icon: <FaBook /> }
  ];

  useEffect(() => {
    fetchResources();
    fetchBookmarks();
  }, [selectedCategory, selectedType]);

  const fetchResources = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/mentalhealth/resources`,
        {
          params: {
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            type: selectedType !== 'all' ? selectedType : undefined,
            search: searchTerm || undefined
          }
        }
      );
      setResources(response.data.data || []);
      if (response.data.data?.length > 0) {
        setFeaturedResource(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      // Fallback mock data for demo
      setResources(getMockResources());
      setFeaturedResource(getMockResources()[0]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/mentalhealth/resources/bookmarks`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setBookmarks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleBookmark = async (resourceId) => {
    try {
      const isBookmarked = bookmarks.includes(resourceId);
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/mentalhealth/resources/bookmark`,
        { resourceId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      if (isBookmarked) {
        setBookmarks(bookmarks.filter(id => id !== resourceId));
      } else {
        setBookmarks([...bookmarks, resourceId]);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleShare = (resource) => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: `${window.location.origin}/mentalhealth/resources/${resource._id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/mentalhealth/resources/${resource._id}`);
      alert('Link copied to clipboard!');
    }
  };

  const getMockResources = () => [
    {
      _id: '1',
      title: 'Understanding Anxiety: Causes, Symptoms, and Treatment',
      description: 'Learn about the different types of anxiety disorders and how to manage them effectively with proven techniques.',
      category: 'anxiety',
      type: 'article',
      author: 'Dr. Sarah Johnson',
      authorTitle: 'Clinical Psychologist',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
      publishedDate: '2024-01-15',
      likes: 245,
      views: 1234,
      tags: ['anxiety', 'mental health', 'therapy']
    },
    {
      _id: '2',
      title: '10 Mindfulness Techniques for Daily Stress Relief',
      description: 'Simple and effective mindfulness practices you can incorporate into your daily routine for better mental health.',
      category: 'stress',
      type: 'blog',
      author: 'Dr. Michael Chen',
      authorTitle: 'Mindfulness Expert',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      publishedDate: '2024-01-12',
      likes: 189,
      views: 987,
      tags: ['mindfulness', 'stress', 'wellness']
    },
    {
      _id: '3',
      title: 'The Science of Depression: Understanding the Brain',
      description: 'A comprehensive look at how depression affects the brain and what treatments are available.',
      category: 'depression',
      type: 'video',
      author: 'Dr. Emily Davis',
      authorTitle: 'Psychiatrist',
      readTime: '15 min watch',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
      publishedDate: '2024-01-10',
      likes: 312,
      views: 2156,
      tags: ['depression', 'brain health', 'treatment']
    },
    {
      _id: '4',
      title: 'Building Healthy Relationships: Communication Strategies',
      description: 'Learn effective communication techniques to strengthen your relationships and build deeper connections.',
      category: 'relationships',
      type: 'guide',
      author: 'Dr. Lisa Martinez',
      authorTitle: 'Relationship Counselor',
      readTime: '12 min read',
      image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800',
      publishedDate: '2024-01-08',
      likes: 156,
      views: 876,
      tags: ['relationships', 'communication', 'counseling']
    },
    {
      _id: '5',
      title: 'Healing from Trauma: A Guide to Recovery',
      description: 'Understanding trauma and the journey towards healing and recovery with expert guidance.',
      category: 'trauma',
      type: 'podcast',
      author: 'Dr. Robert Kim',
      authorTitle: 'Trauma Specialist',
      readTime: '25 min listen',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
      publishedDate: '2024-01-05',
      likes: 278,
      views: 1567,
      tags: ['trauma', 'recovery', 'PTSD']
    }
  ];

  const getCategoryColor = (categoryId) => {
    const colors = {
      'anxiety': 'purple',
      'depression': 'blue',
      'stress': 'green',
      'relationships': 'pink',
      'trauma': 'red',
      'wellness': 'teal',
      'mindfulness': 'indigo',
      'grief': 'gray',
      'sleep': 'indigo'
    };
    return colors[categoryId] || 'gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-center"
          >
            Mental Health Resources
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl text-center mt-4 text-purple-100 max-w-2xl mx-auto"
          >
            Expert articles, videos, and guides to support your mental well-being journey
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mt-8"
          >
            <form onSubmit={handleSearch} className="flex shadow-lg rounded-lg overflow-hidden">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search resources by title, topic, or author..."
                  className="w-full px-6 py-4 text-gray-800 focus:outline-none"
                />
                <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                type="submit"
                className="bg-purple-700 px-8 py-4 hover:bg-purple-800 transition font-semibold"
              >
                Search
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center text-gray-600 mr-2">
              <FaFilter className="mr-2" />
              <span className="font-medium">Filters:</span>
            </div>
            
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm transition flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? `bg-${getCategoryColor(cat.id)}-600 text-white`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {resourceTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Featured Resource */}
        {featuredResource && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
          >
            <div className="md:flex">
              <div className="md:w-2/5">
                <img 
                  src={featuredResource.image} 
                  alt={featuredResource.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-3/5 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                    Featured
                  </span>
                  <span className={`bg-${getCategoryColor(featuredResource.category)}-100 text-${getCategoryColor(featuredResource.category)}-600 px-3 py-1 rounded-full text-xs font-medium`}>
                    {featuredResource.category}
                  </span>
                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
                    {featuredResource.type}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">{featuredResource.title}</h2>
                <p className="text-gray-600 mb-4">{featuredResource.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 flex-wrap">
                  <span>By {featuredResource.author}</span>
                  <span>•</span>
                  <span>{featuredResource.readTime}</span>
                  <span>•</span>
                  <span>{new Date(featuredResource.publishedDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <Link
                    to={`/mentalhealth/resources/${featuredResource._id}`}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition inline-flex items-center"
                  >
                    Read More <FaArrowRight className="ml-2" />
                  </Link>
                  <div className="flex items-center gap-3 text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaEye /> {featuredResource.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaThumbsUp /> {featuredResource.likes}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <motion.div
              key={resource._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group"
            >
              <div className="relative">
                <img 
                  src={resource.image} 
                  alt={resource.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`bg-${getCategoryColor(resource.category)}-600 bg-opacity-80 text-white px-3 py-1 rounded-full text-xs`}>
                    {resource.category}
                  </span>
                  <span className="bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-xs">
                    {resource.type}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-purple-600 transition">
                  <Link to={`/mentalhealth/resources/${resource._id}`}>
                    {resource.title}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {resource.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span>{resource.author}</span>
                  <span>•</span>
                  <span>{resource.readTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <span className="flex items-center gap-1">
                      <FaEye /> {resource.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaThumbsUp /> {resource.likes}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBookmark(resource._id)}
                      className={`transition ${bookmarks.includes(resource._id) ? 'text-purple-600' : 'text-gray-400 hover:text-purple-600'}`}
                    >
                      <FaBookmark />
                    </button>
                    <button
                      onClick={() => handleShare(resource)}
                      className="text-gray-400 hover:text-blue-600 transition"
                    >
                      <FaShare />
                    </button>
                    <Link
                      to={`/mentalhealth/resources/${resource._id}`}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                    >
                      Read →
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {resources.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800">No Resources Found</h3>
            <p className="text-gray-600 mt-2">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedType('all');
                fetchResources();
              }}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentalHealthResources;

