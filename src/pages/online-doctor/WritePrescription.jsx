import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOnlineConsultById } from '../../services/api';
import api from '../../services/api';

const WritePrescription = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', instructions: '' }]);
  const [tests, setTests] = useState([]);
  const [advice, setAdvice] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await getOnlineConsultById(bookingId);
      setBooking(response.data?.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '', instructions: '' }]);
  };

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const addTest = () => {
    setTests([...tests, { testName: '', instructions: '' }]);
  };

  const removeTest = (index) => {
    setTests(tests.filter((_, i) => i !== index));
  };

  const updateTest = (index, field, value) => {
    const updated = [...tests];
    updated[index][field] = value;
    setTests(updated);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('doctorToken');
      await api.post('/online-doctor/prescription', {
        bookingId,
        medicines: medicines.filter(m => m.name),
        tests: tests.filter(t => t.testName),
        advice,
        followUpDate: followUp
      }, { headers: { Authorization: `Bearer ${token}` } });

      await api.put(`/online-doctor/booking/${bookingId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/online-doctor/dashboard');
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin text-5xl">⏳</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Write Prescription</h1>
          <p className="text-gray-500 text-sm">Booking: {booking?.bookingId} | Patient: {booking?.patientName}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Medicines */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">💊 Medicines</h3>
            <button onClick={addMedicine} className="text-blue-600 hover:text-blue-700 font-medium text-sm">+ Add Medicine</button>
          </div>
          {medicines.map((med, index) => (
            <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-4 bg-gray-50 rounded-xl">
              <input value={med.name} onChange={(e) => updateMedicine(index, 'name', e.target.value)} placeholder="Medicine name" className="border rounded-xl px-3 py-2 text-sm" />
              <input value={med.dosage} onChange={(e) => updateMedicine(index, 'dosage', e.target.value)} placeholder="Dosage (e.g., 500mg)" className="border rounded-xl px-3 py-2 text-sm" />
              <input value={med.duration} onChange={(e) => updateMedicine(index, 'duration', e.target.value)} placeholder="Duration (e.g., 5 days)" className="border rounded-xl px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <input value={med.instructions} onChange={(e) => updateMedicine(index, 'instructions', e.target.value)} placeholder="Instructions" className="border rounded-xl px-3 py-2 text-sm flex-1" />
                {medicines.length > 1 && (
                  <button onClick={() => removeMedicine(index)} className="text-red-500 hover:text-red-700 px-2">✕</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tests */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">🔬 Lab Tests</h3>
            <button onClick={addTest} className="text-blue-600 hover:text-blue-700 font-medium text-sm">+ Add Test</button>
          </div>
          {tests.map((test, index) => (
            <div key={index} className="flex gap-3 mb-3 p-4 bg-gray-50 rounded-xl">
              <input value={test.testName} onChange={(e) => updateTest(index, 'testName', e.target.value)} placeholder="Test name" className="border rounded-xl px-3 py-2 text-sm flex-1" />
              <input value={test.instructions} onChange={(e) => updateTest(index, 'instructions', e.target.value)} placeholder="Instructions" className="border rounded-xl px-3 py-2 text-sm flex-1" />
              <button onClick={() => removeTest(index)} className="text-red-500 hover:text-red-700 px-2">✕</button>
            </div>
          ))}
        </div>

        {/* Advice */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">📝 Doctor's Advice</h3>
          <textarea value={advice} onChange={(e) => setAdvice(e.target.value)} placeholder="General advice, precautions, diet recommendations..." rows={4}
            className="w-full border-2 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-400 resize-none" />
        </div>

        {/* Follow-up */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">📅 Follow-up</h3>
          <input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)}
            className="border-2 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400" />
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={saving}
          className={`w-full py-4 rounded-2xl font-bold text-xl text-white transition shadow-lg ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}>
          {saving ? '⏳ Saving...' : '✅ Complete Consultation & Save Prescription'}
        </button>
      </div>
    </div>
  );
};

export default WritePrescription;