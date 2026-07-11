import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DoctorRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '',
    specialization: '', experience: '', education: '', ayushRegNo: '',
    city: '', consultationFee: '', clinicName: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/ayurveda/doctor/register', form);
      alert('Registration submitted! Awaiting verification.');
      navigate('/ayurveda/doctor/login');
    } catch (error) {
      alert(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '1rem' }}>
      <h1 style={{ color: '#2E7D32', textAlign: 'center' }}>Doctor Registration</h1>
      <form onSubmit={handleSubmit}>
        {['name','phone','email','password','specialization','experience','education','ayushRegNo','city','consultationFee','clinicName'].map(f => (
          <input key={f} placeholder={f} value={form[f]} onChange={e => setForm({...form, [f]: e.target.value})}
            style={{ width:'100%',padding:'0.5rem',marginBottom:'0.5rem',borderRadius:'0.3rem',border:'1px solid #ccc' }}
            type={f === 'password' ? 'password' : 'text'} />
        ))}
        <button type="submit" disabled={loading}
          style={{ width:'100%',padding:'0.75rem',backgroundColor:'#4CAF50',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer' }}>
          {loading ? 'Submitting...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default DoctorRegistration;
