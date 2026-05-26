import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const HospitalSimpleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const res = await api.get(`/hospitals/${id}`);
        setHospital(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHospital();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>← Back</button>
        
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{hospital.name}</h1>
        
        <p><strong>Address:</strong> {hospital.address?.street}, {hospital.address?.city}, {hospital.address?.state}</p>
        <p><strong>Email:</strong> {hospital.contact?.email || 'N/A'}</p>
        <p><strong>Phone:</strong> {hospital.contact?.phone || 'N/A'}</p>
      </div>
    </div>
  );
};

export default HospitalSimpleDetails;