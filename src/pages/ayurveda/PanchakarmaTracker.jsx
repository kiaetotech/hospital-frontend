import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { FaCheckCircle, FaCircle, FaCalendarAlt, FaNotesMedical } from 'react-icons/fa';
import { motion } from 'framer-motion';

const PanchakarmaTracker = () => {
  const { bookingId } = useParams();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [bookingId]);

  const fetchProgress = async () => {
    try {
      const res = await api.get(`/ayurveda/panchakarma-progress/${bookingId}`);
      if (res.data?.success) setProgress(res.data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!progress) return <div className="text-center py-20">No progress data found</div>;

  const progressPercent = Math.round((progress.currentDay / progress.totalDays) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link to="/ayurveda" className="text-white/80 hover:text-white text-sm">← Back</Link>
          <h1 className="text-2xl font-bold mt-2">🔄 Panchakarma Journey</h1>
          <p className="text-white/80">{progress.packageName} • {progress.totalDays} Days</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Day {progress.currentDay} of {progress.totalDays}</span>
            <span className="text-sm font-bold text-green-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
            />
          </div>
        </div>

        {/* Phase Status */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Pre-Treatment', done: progress.preTreatment?.snehana, icon: '🛁' },
            { label: 'Main Therapy', done: progress.mainTherapy?.startDay, icon: '💆' },
            { label: 'Post-Treatment', done: progress.postTreatment?.diet, icon: '🥗' },
          ].map((phase, i) => (
            <div key={i} className={`rounded-xl p-4 text-center ${phase.done ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="text-2xl mb-1">{phase.icon}</div>
              <p className="text-xs font-medium">{phase.label}</p>
              {phase.done ? <FaCheckCircle className="text-green-500 mx-auto mt-1" /> : <FaCircle className="text-gray-300 mx-auto mt-1" />}
            </div>
          ))}
        </div>

        {/* Daily Logs */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-green-600" /> Daily Progress
          </h3>
          <div className="space-y-3">
            {progress.dailyLogs?.map((log, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700 text-sm">
                  {log.day}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.therapy || `Day ${log.day} Therapy`}</p>
                  <p className="text-xs text-gray-500">{new Date(log.date).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${log.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {log.completed ? 'Done' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Notes */}
        {progress.doctorNotes?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaNotesMedical className="text-blue-600" /> Doctor's Notes
            </h3>
            {progress.doctorNotes.map((note, i) => (
              <div key={i} className="p-3 bg-blue-50 rounded-xl mb-2">
                <p className="text-sm text-gray-700">{note.note}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(note.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PanchakarmaTracker;