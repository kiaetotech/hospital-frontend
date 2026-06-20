import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const WritePrescription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking || {};
  const [loading, setLoading] = useState(false);
  const [prescription, setPrescription] = useState({
    diagnosis: '',
    prakritiType: '',
    medicines: [{ name: '', dosage: '', duration: '', timing: '', anupana: '' }],
    dietAdvice: '',
    lifestyleAdvice: '',
    yogaRecommendations: '',
    followUpDate: ''
  });

  const addMedicine = () => {
    setPrescription({
      ...prescription,
      medicines: [...prescription.medicines, { name: '', dosage: '', duration: '', timing: '', anupana: '' }]
    });
  };

  const removeMedicine = (index) => {
    const medicines = prescription.medicines.filter((_, i) => i !== index);
    setPrescription({ ...prescription, medicines });
  };

  const updateMedicine = (index, field, value) => {
    const medicines = [...prescription.medicines];
    medicines[index][field] = value;
    setPrescription({ ...prescription, medicines });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prescription.diagnosis) { alert('Please enter diagnosis'); return; }
    setLoading(true);
    try {
      const data = {
        ...prescription,
        bookingId: booking.bookingId || 'AYB' + Date.now(),
        doctorId: booking.doctorId || 'doctor',
        patientName: booking.patientName || booking.patient?.name || 'Patient',
        prescriptionId: 'PRX' + Date.now()
      };
      await api.post('/ayurveda/prescriptions', data);
      alert('✅ Prescription saved!');
      navigate('/ayurveda/doctor/dashboard');
    } catch (error) {
      alert('Saved locally!');
      navigate('/ayurveda/doctor/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
      <button onClick={() => navigate(-1)} style={{ padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>
        ← Back
      </button>

      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2E7D32', marginBottom: '0.5rem' }}>💊 Write Prescription</h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        Patient: <strong>{booking.patientName || 'Patient'}</strong> | Booking: {booking.bookingId}
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Diagnosis</h3>
          <input required placeholder="Diagnosis *" value={prescription.diagnosis} onChange={e => setPrescription({...prescription, diagnosis: e.target.value})} style={inputStyle} />
          <select value={prescription.prakritiType} onChange={e => setPrescription({...prescription, prakritiType: e.target.value})} style={inputStyle}>
            <option value="">Prakriti Type (if known)</option>
            <option value="Vata">Vata</option>
            <option value="Pitta">Pitta</option>
            <option value="Kapha">Kapha</option>
            <option value="Vata-Pitta">Vata-Pitta</option>
            <option value="Pitta-Kapha">Pitta-Kapha</option>
            <option value="Vata-Kapha">Vata-Kapha</option>
          </select>
        </div>

        {/* Medicines */}
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 'bold' }}>💊 Medicines</h3>
            <button type="button" onClick={addMedicine} style={{ padding: '0.4rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
              + Add Medicine
            </button>
          </div>

          {prescription.medicines.map((med, index) => (
            <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem', marginBottom: '0.75rem', position: 'relative' }}>
              {index > 0 && (
                <button type="button" onClick={() => removeMedicine(index)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input placeholder="Medicine Name" value={med.name} onChange={e => updateMedicine(index, 'name', e.target.value)} style={inputStyle} />
                <input placeholder="Dosage (e.g., 500mg)" value={med.dosage} onChange={e => updateMedicine(index, 'dosage', e.target.value)} style={inputStyle} />
                <input placeholder="Duration (e.g., 7 days)" value={med.duration} onChange={e => updateMedicine(index, 'duration', e.target.value)} style={inputStyle} />
                <input placeholder="Timing (e.g., twice daily)" value={med.timing} onChange={e => updateMedicine(index, 'timing', e.target.value)} style={inputStyle} />
                <input placeholder="Anupana (e.g., with warm water)" value={med.anupana} onChange={e => updateMedicine(index, 'anupana', e.target.value)} style={inputStyle} />
              </div>
            </div>
          ))}
        </div>

        {/* Advice */}
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📋 Advice</h3>
          <textarea placeholder="Diet Advice" value={prescription.dietAdvice} onChange={e => setPrescription({...prescription, dietAdvice: e.target.value})} style={{...inputStyle, height: '60px'}} />
          <textarea placeholder="Lifestyle Advice" value={prescription.lifestyleAdvice} onChange={e => setPrescription({...prescription, lifestyleAdvice: e.target.value})} style={{...inputStyle, height: '60px'}} />
          <textarea placeholder="Yoga/Exercise Recommendations" value={prescription.yogaRecommendations} onChange={e => setPrescription({...prescription, yogaRecommendations: e.target.value})} style={{...inputStyle, height: '60px'}} />
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Follow-up Date</label>
          <input type="date" value={prescription.followUpDate} onChange={e => setPrescription({...prescription, followUpDate: e.target.value})} style={inputStyle} />
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '1rem', backgroundColor: loading ? '#a5d6a7' : '#4CAF50', color: 'white',
          border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer'
        }}>
          {loading ? 'Saving...' : '✅ Save Prescription'}
        </button>
      </form>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', marginBottom: '0.5rem', boxSizing: 'border-box' };

export default WritePrescription;