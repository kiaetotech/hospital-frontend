import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();

  const [featuredHospitals, setFeaturedHospitals] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [companyInfo, setCompanyInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [hospitalsRes, testimonialsRes, companyRes] = await Promise.all([
          api.get('/hospitals/featured?limit=3'),
          api.get('/testimonials'),
          api.get('/company/info'),
        ]);
        setFeaturedHospitals(hospitalsRes.data.data || []);
        setTestimonials(testimonialsRes.data.data || []);
        setCompanyInfo(companyRes.data.data || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim() || query.trim()) {
      navigate(`/search?city=${encodeURIComponent(city)}&q=${encodeURIComponent(query)}`);
    }
  };

  const serviceTags = [
    { name: 'Hospitals', icon: 'fas fa-hospital-user', color: 'bg-blue-50', textColor: 'text-primary', path: '/hospitals', desc: 'Compare price, rating, beds & insurance' },
    { name: 'Ambulance', icon: 'fas fa-ambulance', color: 'bg-red-50', textColor: 'text-red-600', path: '/ambulance', desc: 'Live tracking, instant ETA' },
    { name: 'Health Insurance', icon: 'fas fa-shield-alt', color: 'bg-orange-50', textColor: 'text-amber-600', path: '/insurance', desc: 'Compare plans & buy online' },
    { name: 'Lab Tests', icon: 'fas fa-microscope', color: 'bg-purple-50', textColor: 'text-purple-700', path: '/lab-tests', desc: 'Price, home collection, reports' },
    { name: 'Preventive', icon: 'fas fa-heartbeat', color: 'bg-emerald-50', textColor: 'text-emerald-600', path: '/preventive', desc: 'Full body, cardiac, wellness' },
    { name: 'Caregiver', icon: 'fas fa-hand-holding-heart', color: 'bg-pink-50', textColor: 'text-pink-600', path: '/caregivers', desc: 'Elder care, nursing at home' },
    { name: 'Health EMI', icon: 'fas fa-rupee-sign', color: 'bg-indigo-50', textColor: 'text-indigo-700', path: '/financing', desc: 'No-cost EMI for treatments' },
    { name: 'Online Doctor', icon: 'fas fa-video', color: 'bg-sky-50', textColor: 'text-sky-600', path: '/teleconsult', desc: 'Video consult, prescription' },
    { name: 'Corporate', icon: 'fas fa-building', color: 'bg-gray-100', textColor: 'text-gray-700', path: '/corporate', desc: 'Employee wellness plans' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="gradient-bg text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">Compare & book healthcare services<br /> all in one place</h1>
          <p className="text-lg md:text-xl mt-4 opacity-90 max-w-3xl mx-auto">Hospitals, ambulances, lab tests, insurance, caregivers – transparent comparison, real patient reviews, instant booking.</p>
          
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl mt-12 p-5 md:p-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <i className="fas fa-map-marker-alt absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input type="text" placeholder="City or location" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-800" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="flex-1 relative">
                <i className="fas fa-stethoscope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input type="text" placeholder="Disease, test, doctor, service..." className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-800" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <button type="submit" className="bg-secondary text-white px-8 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition shadow-md flex items-center justify-center gap-2"><i className="fas fa-search"></i> Search</button>
            </div>
          </form>
        </div>
      </section>

      {/* 9 Service Tags */}
      <section className="py-16 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Healthcare services at your fingertips</h2>
            <p className="text-gray-500 mt-2 text-lg">Compare, choose, book – all in minutes</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {serviceTags.map((tag, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 shadow-md text-center service-card cursor-pointer" onClick={() => navigate(tag.path)}>
                <div className={`service-icon mx-auto ${tag.color}`}><i className={`${tag.icon} text-2xl ${tag.textColor}`}></i></div>
                <h3 className="font-bold text-lg mt-3">{tag.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{tag.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hospitals */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div><h2 className="text-3xl font-bold text-gray-800">Top-rated hospitals near you</h2><p className="text-gray-500 mt-1">Based on patient feedback and quality</p></div>
            <button className="text-primary font-semibold border border-primary px-4 py-2 rounded-full hover:bg-primary hover:text-white transition" onClick={() => navigate('/hospitals')}>View all <i className="fas fa-arrow-right ml-1"></i></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {featuredHospitals.map((hospital) => (
              <div key={hospital._id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer" onClick={() => navigate(`/hospitals/${hospital._id}`)}>
                <img src={hospital.image || 'https://placehold.co/600x200/e2e8f0/1e293b?text=Hospital'} alt={hospital.name} className="w-full h-36 object-cover" />
                <div className="p-4">
                  <h3 className="font-bold text-xl">{hospital.name}</h3>
                  <div className="flex items-center mt-1">{[...Array(5)].map((_, i) => <i key={i} className={`fas fa-star ${i < Math.floor(hospital.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}`}></i>)}<span className="ml-2 text-sm text-gray-600">{hospital.rating || 4.0} ({hospital.reviewCount || 100} reviews)</span></div>
                  <p className="text-gray-500 text-sm mt-2">{hospital.specialties?.join(', ') || 'Multi-specialty'}</p>
                  <button className="mt-3 w-full border border-secondary text-secondary py-2 rounded-lg font-semibold hover:bg-secondary hover:text-white transition">Compare & Book</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div><h4 className="text-white font-semibold mb-4">For Patients</h4><ul className="space-y-2 text-sm"><li>Find Hospitals</li><li>Health Insurance</li><li>Lab Tests</li><li>Online Doctor</li></ul></div>
            <div><h4 className="text-white font-semibold mb-4">For Providers</h4><ul className="space-y-2 text-sm"><li>List your service</li><li>Provider dashboard</li><li>Partner with us</li></ul></div>
            <div><h4 className="text-white font-semibold mb-4">Company</h4><ul className="space-y-2 text-sm"><li>About us</li><li>Careers</li><li>Contact</li></ul></div>
            <div><h4 className="text-white font-semibold mb-4">Legal</h4><ul className="space-y-2 text-sm"><li>Terms of use</li><li>Privacy policy</li><li>Refund policy</li></ul></div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 text-sm text-center">© 2025 MediConnect – Your Health, Our Bridge. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;