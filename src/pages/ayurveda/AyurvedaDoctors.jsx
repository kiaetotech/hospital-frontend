import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAyurvedaDoctors } from '../../services/ayurvedaApi';

const AyurvedaDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: '',
    experience: '',
    language: '',
    available: false
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await getAyurvedaDoctors(filters);
        setDoctors(response.data || []);
      } catch (error) {
        // Dummy data
        setDoctors([
          { _id: 'AYD001', name: 'Dr. Rajesh Sharma', specialization: 'Panchakarma', experience: 15, languages: ['Hindi', 'English'], rating: 4.8, consultationFee: 500, availableSlots: ['10:00 AM', '2:00 PM'], city: 'Mumbai' },
          { _id: 'AYD002', name: 'Dr. Priya Gupta', specialization: 'General Ayurveda', experience: 12, languages: ['Hindi', 'English', 'Marathi'], rating: 4.9, consultationFee: 400, availableSlots: ['11:00 AM', '4:00 PM'], city: 'Pune' },
          { _id: 'AYD003', name: 'Dr. Amit Verma', specialization: 'Kerala Ayurveda', experience: 20, languages: ['English', 'Malayalam'], rating: 4.7, consultationFee: 600, availableSlots: ['9:00 AM'], city: 'Kochi' },
          { _id: 'AYD004', name: 'Dr. Sunita Reddy', specialization: 'Ayurvedic Dermatology', experience: 10, languages: ['Telugu', 'English'], rating: 4.6, consultationFee: 350, availableSlots: ['3:00 PM', '5:00 PM'], city: 'Hyderabad' },
          { _id: 'AYD005', name: 'Dr. Karan Patel', specialization: 'Panchakarma', experience: 8, languages: ['Gujarati', 'Hindi', 'English'], rating: 4.5, consultationFee: 450, availableSlots: ['12:00 PM'], city: 'Ahmedabad' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [filters]);

  const specializations = ['Panchakarma', 'General Ayurveda', 'Kerala Ayurveda', 'Ayurvedic Dermatology', 'Rasayana Therapy'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b' }}>
        📞 Find Ayurvedic Doctor
      </h1>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        flexWrap: 'wrap', 
        marginBottom: '2rem',
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <select 
          style={filterStyle}
          onChange={(e) => setFilters({...filters, specialization: e.target.value})}
        >
          <option value="">All Specializations</option>
          {specializations.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
        
        <select 
          style={filterStyle}
          onChange={(e) => setFilters({...filters, experience: e.target.value})}
        >
          <option value="">Experience</option>
          <option value="5">5+ years</option>
          <option value="10">10+ years</option>
          <option value="15">15+ years</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input 
            type="checkbox" 
            checked={filters.available}
            onChange={(e) => setFilters({...filters, available: e.target.checked})}
          />
          <span>Available Today</span>
        </label>
      </div>

      {/* Doctor List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading doctors...</div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {doctors.map(doctor => (
            <div
              key={doctor._id}
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/ayurveda/doctor/${doctor._id}`)}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 2 }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  backgroundColor: '#e8f5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  👨‍⚕️
                </div>
                <div>
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1e293b' }}>{doctor.name}</h3>
                  <p style={{ color: '#4CAF50', fontSize: '0.9rem' }}>{doctor.specialization}</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    📅 {doctor.experience} years exp. | 📍 {doctor.city}
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    🗣️ {doctor.languages.join(', ')}
                  </p>
                </div>
              </div>
              
              <div style={{ textAlign: 'right', flex: 1 }}>
                <div style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>⭐ {doctor.rating}</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1e293b' }}>₹{doctor.consultationFee}</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>per consultation</div>
              </div>

              <div style={{ flex: 1 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/ayurveda/book/${doctor._id}`);
                  }}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Book Now
                </button>
                {doctor.availableSlots && (
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                    Available: {doctor.availableSlots[0]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const filterStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  fontSize: '0.9rem',
  minWidth: '200px'
};

export default AyurvedaDoctors;