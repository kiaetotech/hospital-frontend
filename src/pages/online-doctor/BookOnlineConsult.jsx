import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getDoctorById, bookConsultation } from '../../services/onlineDoctorApi';

const BookOnlineConsult = () => {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [mode, setMode] = useState('video');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  const isInstant = searchParams.get('instant') === 'true';

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (isInstant && doctor) {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
    }
  }, [isInstant, doctor]);

  const fetchDoctor = async () => {
    try {
      const response = await getDoctorById(doctorId);
      setDoctor(response.data?.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const getDayName = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });

  const getAvailableSlots = () => {
    if (!selectedDate || !doctor?.availability) return [];
    const dayName = getDayName(selectedDate);
    const daySchedule = doctor.availability.find(d => d.day === dayName && d.isAvailable);
    return daySchedule?.slots?.filter(s => (s.currentBookings || 0) < (s.maxBookings || 5)) || [];
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      setError('Please select date and time slot');
      return;
    }

    setBooking(true);
    setError('');
    try {
      const response = await bookConsultation({
        doctorId,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        symptoms,
        mode
      });

      const bookingData = response.data?.data;
      navigate(`/online-doctor/consult/${bookingData.bookingId}`, {
        state: { booking: bookingData }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin text-5xl">⏳</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Doctor not found</p>
      </div>
    );
  }

  const slots = getAvailableSlots();
  const platformFee = doctor.consultationFee <= 500 ? 30 : doctor.consultationFee <= 1000 ? 50 : 80;
  const total = doctor.consultationFee + platformFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link to={`/online-doctor/doctor/${doctorId}`} className="text-blue-600 hover:underline text-sm">← Back</Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">Book Consultation</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Doctor Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">👨‍⚕️</div>
          <div>
            <h3 className="font-bold text-gray-800">Dr. {doctor.name}</h3>
            <p className="text-gray-500 text-sm">{doctor.specialization} • {doctor.experience} yrs</p>
            <p className="text-green-600 font-bold">₹{doctor.consultationFee}</p>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Consultation Mode</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode('video')}
              className={`p-5 rounded-2xl border-2 transition text-center ${
                mode === 'video' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-4xl mb-2">🎥</div>
              <div className="font-bold text-gray-700">Video Call</div>
              <div className="text-xs text-gray-400 mt-1">Face-to-face consultation</div>
            </button>
            <button
              onClick={() => setMode('audio')}
              className={`p-5 rounded-2xl border-2 transition text-center ${
                mode === 'audio' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-4xl mb-2">📞</div>
              <div className="font-bold text-gray-700">Audio Only</div>
              <div className="text-xs text-gray-400 mt-1">Voice consultation</div>
            </button>
          </div>
        </div>

        {/* Date Selection */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Select Date</h3>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {getNext7Days().map((date) => {
              const dayName = getDayName(date);
              const isAvailable = doctor.availability?.some(d => d.day === dayName && d.isAvailable);
              const today = new Date().toISOString().split('T')[0];
              const isToday = date === today;
              return (
                <button
                  key={date}
                  onClick={() => { setSelectedDate(date); setSelectedSlot(''); }}
                  disabled={!isAvailable}
                  className={`p-3 rounded-2xl text-center transition ${
                    selectedDate === date
                      ? 'bg-blue-600 text-white shadow-lg'
                      : isAvailable
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <div className="text-xs font-bold">{dayName.substring(0, 3)}</div>
                  <div className="text-lg font-bold">{new Date(date).getDate()}</div>
                  <div className="text-xs">{new Date(date).toLocaleDateString('en-US', { month: 'short' })}</div>
                  {isToday && <div className="text-xs mt-1 font-bold text-green-500">Today</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot Selection */}
        {selectedDate && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Select Time Slot</h3>
            {slots.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot.startTime}
                    onClick={() => setSelectedSlot(slot.startTime)}
                    className={`p-4 rounded-2xl text-center font-medium transition ${
                      selectedSlot === slot.startTime
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No slots available for this date. Try another date.</p>
            )}
          </div>
        )}

        {/* Symptoms */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-3">Describe Your Symptoms (Optional)</h3>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Briefly describe what you're experiencing. This helps the doctor prepare for your consultation."
            rows={4}
            className="w-full border-2 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-400 resize-none"
          />
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Payment Summary</h3>
          <div className="space-y-3 text-gray-600 mb-6">
            <div className="flex justify-between"><span>Consultation Fee</span><span className="font-medium">₹{doctor.consultationFee}</span></div>
            <div className="flex justify-between"><span>Platform Fee</span><span className="font-medium">₹{platformFee}</span></div>
            <hr />
            <div className="flex justify-between font-bold text-xl text-gray-800"><span>Total</span><span>₹{total}</span></div>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm">{error}</div>}

          <button
            onClick={handleBook}
            disabled={!selectedDate || !selectedSlot || booking}
            className={`w-full py-4 rounded-2xl font-bold text-xl transition shadow-lg ${
              !selectedDate || !selectedSlot || booking
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {booking ? '⏳ Processing...' : `Confirm & Pay ₹${total}`}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            🔒 Secured by Razorpay • Cancel free up to 2 hours before
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookOnlineConsult;