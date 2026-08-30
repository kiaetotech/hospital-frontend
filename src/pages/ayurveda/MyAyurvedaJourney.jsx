import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings } from '../../services/ayurvedaApi';
import { FaUser, FaUserPlus, FaCalendarAlt, FaChevronRight, FaHeartbeat, FaLeaf } from 'react-icons/fa';

const MyAyurvedaJourney = () => {
  const navigate = useNavigate();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeMember, setActiveMember] = useState('self');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '', age: '', gender: 'male', relation: 'spouse', phone: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load family members from localStorage
    const members = JSON.parse(localStorage.getItem('familyMembers') || '[]');
    setFamilyMembers(members);
    
    // Fetch bookings
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getMyBookings();
      if (response.data.success) {
        setBookings(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    if (newMember.name && newMember.phone) {
      const updatedMembers = [...familyMembers, { ...newMember, id: Date.now() }];
      setFamilyMembers(updatedMembers);
      localStorage.setItem('familyMembers', JSON.stringify(updatedMembers));
      setShowAddMember(false);
      setNewMember({ name: '', age: '', gender: 'male', relation: 'spouse', phone: '' });
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeMember === 'self') return true;
    return b.patient?.name === familyMembers.find(m => m.id === activeMember)?.name;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">My Ayurveda Journey</h1>

        {/* Family Members */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaUser /> Family Members
          </h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setActiveMember('self')}
              className={`px-4 py-3 rounded-lg border-2 text-center min-w-[100px] ${
                activeMember === 'self' ? 'border-green-600 bg-green-50' : 'border-gray-200'
              }`}
            >
              <FaUser className="mx-auto text-2xl mb-1" />
              <p className="text-sm font-medium">Self</p>
            </button>
            {familyMembers.map(member => (
              <button
                key={member.id}
                onClick={() => setActiveMember(member.id)}
                className={`px-4 py-3 rounded-lg border-2 text-center min-w-[100px] ${
                  activeMember === member.id ? 'border-green-600 bg-green-50' : 'border-gray-200'
                }`}
              >
                <FaUser className="mx-auto text-2xl mb-1" />
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-gray-500">{member.relation}</p>
              </button>
            ))}
            <button
              onClick={() => setShowAddMember(true)}
              className="px-4 py-3 rounded-lg border-2 border-dashed border-green-400 text-green-600 min-w-[100px]"
            >
              <FaUserPlus className="mx-auto text-2xl mb-1" />
              <p className="text-sm">Add Member</p>
            </button>
          </div>

          {/* Add Member Modal */}
          {showAddMember && (
            <div className="mt-4 p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={newMember.age}
                  onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                  className="p-2 border rounded"
                />
                <select
                  value={newMember.relation}
                  onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                  className="p-2 border rounded"
                >
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="child">Child</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
                <select
                  value={newMember.gender}
                  onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                  className="p-2 border rounded"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddMember}
                    className="flex-1 bg-green-600 text-white p-2 rounded"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddMember(false)}
                    className="flex-1 bg-gray-300 p-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Health Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaCalendarAlt /> Health Timeline
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <FaLeaf className="text-4xl text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No Ayurveda journey yet</p>
              <button
                onClick={() => navigate('/ayurveda/doctors')}
                className="mt-3 text-green-600 font-medium"
              >
                Start Your Journey →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-full bg-green-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                    <p className="font-medium">{booking.patient?.name}</p>
                    <p className="text-sm text-gray-600">
                      {booking.type === 'doctor_consultation' ? '👨‍⚕️ Doctor Consultation' : '🏥 Panchakarma'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {booking.status}
                    </p>
                  </div>
                  <FaChevronRight className="text-gray-400 mt-2" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => navigate('/ayurveda/doctors')}
            className="bg-green-600 text-white p-4 rounded-lg font-medium"
          >
            Book Doctor
          </button>
          <button
            onClick={() => navigate('/ayurveda/prakriti-quiz')}
            className="bg-white text-green-600 p-4 rounded-lg font-medium border border-green-600"
          >
            Take Prakriti Quiz
          </button>
          <button
            onClick={() => navigate('/ayurveda/wellness-programs')}
            className="bg-white text-green-600 p-4 rounded-lg font-medium border border-green-600"
          >
            Wellness Programs
          </button>
          <button
            onClick={() => navigate('/ayurveda/panchakarma-centers')}
            className="bg-white text-green-600 p-4 rounded-lg font-medium border border-green-600"
          >
            Panchakarma Centers
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAyurvedaJourney;