import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOnlineConsultations } from '../../services/api';

const ConsultHistory = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchConsultations(); }, []);

  const fetchConsultations = async () => {
    try {
      const response = await getOnlineConsultations();
      setConsultations(response.data?.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConsultations = consultations.filter(c => filter === 'all' ? true : c.status === filter);

  const getStatusBadge = (status) => {
    const styles = { pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/online-doctor" className="text-blue-600 hover:underline text-sm">← Back</Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">My Consultations</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'completed', 'confirmed', 'cancelled'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium text-sm capitalize transition whitespace-nowrap ${filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              {f} ({consultations.filter(c => f === 'all' ? true : c.status === f).length})
            </button>
          ))}
        </div>

        {filteredConsultations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-500 text-lg">No consultations found</p>
            <Link to="/online-doctor" className="text-blue-600 hover:underline mt-2 inline-block">Book a consultation</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConsultations.map((consult) => (
              <div key={consult._id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl">👨‍⚕️</div>
                    <div>
                      <h3 className="font-bold text-gray-800">{consult.doctorName}</h3>
                      <p className="text-gray-500 text-sm">{consult.doctorSpecialization}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        📅 {new Date(consult.appointmentDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} at {consult.timeSlot}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(consult.status)}`}>{consult.status}</span>
                    <span className="text-sm font-bold text-gray-700">₹{consult.finalAmount || consult.originalAmount}</span>
                    {consult.status === 'completed' && (
                      <Link to={`/online-doctor/doctor/${consult.doctorId}`} className="text-blue-600 text-sm hover:underline">Book Again →</Link>
                    )}
                    {consult.status === 'confirmed' && (
                      <Link to={`/online-doctor/consult/${consult._id}`} className="text-green-600 text-sm hover:underline">Join Call →</Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultHistory;
