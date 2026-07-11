import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAyurvedaDoctorById } from '../../services/ayurvedaApi';

const AyurvedaDoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await getAyurvedaDoctorById(id);
        setDoctor(response.data);
      } catch (error) {
        // Dummy data fallback
        setDoctor({
          _id: id,
          name: 'Dr. Rajesh Sharma',
          specialization: 'Panchakarma Specialist',
          experience: 15,
          rating: 4.8,
          consultationFee: 500,
          languages: ['Hindi', 'English'],
          city: 'Mumbai',
          ayushRegNo: 'AYUSH-MH-2018-00123',
          education: 'BAMS, MD (Panchakarma)',
          about: 'Experienced Ayurvedic practitioner with expertise in Panchakarma therapies.',
          availableSlots: ['10:00 AM', '2:00 PM', '5:00 PM']
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) return <div style={{textAlign: 'center', padding: '3rem'}}>Loading...</div>;
  if (!doctor) return <div style={{textAlign: 'center', padding: '3rem'}}>Doctor not found</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
            👨‍⚕️
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{doctor.name}</h1>
            <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>{doctor.specialization}</p>
            <p>⭐ {doctor.rating} | 📅 {doctor.experience} years</p>
            <p>📍 {doctor.city} | 🗣️ {doctor.languages.join(', ')}</p>
          </div>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>About</h3>
          <p style={{ color: '#475569' }}>{doctor.about}</p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Education & Registration</h3>
          <p>{doctor.education}</p>
          <p style={{ color: '#64748b' }}>AYUSH Reg: {doctor.ayushRegNo}</p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Consultation Fee</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>₹{doctor.consultationFee}</p>
        </div>
        
        <button 
          onClick={() => navigate(`/ayurveda/book/${doctor._id}`)}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: 'pointer'
          }}
        >
          Book Consultation Now
        </button>
      </div>
    </div>
  );
};

export default AyurvedaDoctorProfile;
