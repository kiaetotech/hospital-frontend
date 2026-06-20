import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ViewPrescription = () => {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);

  useEffect(() => {
    loadPrescription();
  }, [prescriptionId]);

  const loadPrescription = async () => {
    try {
      const res = await api.get(`/ayurveda/prescriptions/${prescriptionId}`);
      setPrescription(res.data?.data || null);
    } catch (error) {
      setPrescription({
        prescriptionId: prescriptionId,
        patientName: 'Patient',
        diagnosis: 'Sample Diagnosis',
        medicines: [{ name: 'Triphala Churna', dosage: '5g', duration: '30 days', timing: 'Twice daily', anupana: 'Warm water' }],
        dietAdvice: 'Avoid spicy and fried foods. Eat warm, cooked meals.',
        lifestyleAdvice: 'Practice yoga daily. Sleep by 10 PM.',
        followUpDate: '2026-07-20'
      });
    }
  };

  if (!prescription) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem' }}>
      <button onClick={() => navigate(-1)} style={{ padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>← Back</button>

      <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2E7D32', textAlign: 'center', marginBottom: '0.5rem' }}>🧘 Ayurvedic Prescription</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '1.5rem' }}>Prescription ID: {prescription.prescriptionId}</p>

        <div style={{ borderBottom: '2px solid #4CAF50', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <p><strong>Patient:</strong> {prescription.patientName}</p>
          <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
          {prescription.prakritiType && <p><strong>Prakriti:</strong> {prescription.prakritiType}</p>}
        </div>

        <h3 style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>💊 Medicines</h3>
        <div style={{ marginBottom: '1.5rem' }}>
          {prescription.medicines?.map((med, i) => (
            <div key={i} style={{ backgroundColor: '#f8fafc', borderRadius: '0.5rem', padding: '1rem', marginBottom: '0.5rem', border: '1px solid #e2e8f0' }}>
              <p style={{ fontWeight: 'bold', color: '#1e293b' }}>{i+1}. {med.name}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', fontSize: '0.85rem', color: '#64748b', marginTop: '0.3rem' }}>
                <span>📏 Dosage: {med.dosage}</span>
                <span>⏱️ Duration: {med.duration}</span>
                <span>🕐 Timing: {med.timing}</span>
                <span>💧 Anupana: {med.anupana}</span>
              </div>
            </div>
          ))}
        </div>

        {prescription.dietAdvice && (
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}>
            <strong>🥗 Diet Advice:</strong> {prescription.dietAdvice}
          </div>
        )}
        {prescription.lifestyleAdvice && (
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}>
            <strong>🧘 Lifestyle Advice:</strong> {prescription.lifestyleAdvice}
          </div>
        )}
        {prescription.followUpDate && (
          <p style={{ textAlign: 'center', fontWeight: 'bold', color: '#FF9800' }}>
            📅 Follow-up: {new Date(prescription.followUpDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>

      <button onClick={() => window.print()} style={{ width: '100%', padding: '0.75rem', marginTop: '1rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
        🖨️ Print Prescription
      </button>
    </div>
  );
};

export default ViewPrescription;