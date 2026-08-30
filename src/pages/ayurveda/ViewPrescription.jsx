import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { FaDownload, FaPrint, FaShare, FaArrowLeft, FaUserMd } from 'react-icons/fa';

const ViewPrescription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingId = location.state?.bookingId || location.pathname.split('/').pop();

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrescription();
  }, [bookingId]);

  const fetchPrescription = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/ayurveda/prescriptions/booking/${bookingId}`);
      if (response.data.success && response.data.data) {
        setPrescription(response.data.data);
      } else {
        setError('No prescription found');
      }
    } catch (err) {
      setError('Failed to load prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ayurveda Prescription',
          text: `Prescription for ${prescription?.patientName || 'Patient'}`,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      alert('Copy the prescription details to share');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 no-print"
        >
          <FaArrowLeft /> Back
        </button>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mb-4 no-print">
          <button onClick={handleDownloadPDF} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg">
            <FaDownload /> Download PDF
          </button>
          <button onClick={handleShare} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
            <FaShare /> Share
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-1 px-4 py-2 bg-gray-600 text-white rounded-lg">
            <FaPrint /> Print
          </button>
        </div>

        {/* Prescription Card */}
        <div className="bg-white rounded-xl shadow-lg p-8" id="prescription">
          {/* Header */}
          <div className="text-center border-b-2 border-green-600 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-green-700">HospitalHub Ayurveda</h1>
            <p className="text-sm text-gray-500">Digital Prescription</p>
          </div>

          {/* Doctor Info */}
          <div className="flex justify-between mb-6">
            <div>
              <p className="font-semibold text-lg">{prescription?.doctorName || 'Dr. Ayurveda'}</p>
              <p className="text-sm text-gray-600">{prescription?.doctorSpecialization || 'Ayurveda Specialist'}</p>
              <p className="text-xs text-gray-500">Reg. No: {prescription?.ayushRegNo || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Date: {new Date(prescription?.createdAt || Date.now()).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Prescription ID: {prescription?.prescriptionId || 'RX' + Date.now()}</p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="font-semibold mb-2">Patient Information</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>Name: {prescription?.patientName || 'N/A'}</p>
              <p>Age: {prescription?.patientAge || 'N/A'}</p>
              <p>Gender: {prescription?.patientGender || 'N/A'}</p>
              <p>Prakriti: {prescription?.prakritiType || 'Not assessed'}</p>
            </div>
          </div>

          {/* Diagnosis */}
          {prescription?.diagnosis && (
            <div className="mb-6">
              <h3 className="font-semibold text-green-700 mb-2">Diagnosis</h3>
              <p className="text-gray-700">{prescription.diagnosis}</p>
            </div>
          )}

          {/* Medicines */}
          <div className="mb-6">
            <h3 className="font-semibold text-green-700 mb-3">Medicines Prescribed</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-green-50">
                  <th className="border p-2 text-left text-sm">Medicine</th>
                  <th className="border p-2 text-left text-sm">Dosage</th>
                  <th className="border p-2 text-left text-sm">Duration</th>
                  <th className="border p-2 text-left text-sm">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {prescription?.medicines?.map((med, i) => (
                  <tr key={i}>
                    <td className="border p-2 text-sm">{med.name}</td>
                    <td className="border p-2 text-sm">{med.dosage}</td>
                    <td className="border p-2 text-sm">{med.duration}</td>
                    <td className="border p-2 text-sm">{med.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Advice */}
          {(prescription?.dietAdvice || prescription?.lifestyleAdvice) && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {prescription?.dietAdvice && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-700 mb-2">🥗 Diet Advice</h3>
                  <p className="text-sm text-gray-700">{prescription.dietAdvice}</p>
                </div>
              )}
              {prescription?.lifestyleAdvice && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-2">🧘 Lifestyle Advice</h3>
                  <p className="text-sm text-gray-700">{prescription.lifestyleAdvice}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-4 text-center">
            <p className="text-xs text-gray-500">
              This is a digitally generated prescription. Valid for 30 days from date of issue.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              For queries, contact: support@hospitalhub.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPrescription;