import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const MentalHealthTherapistDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchTherapist();
  }, [id]);

  const fetchTherapist = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/mentalhealth/therapists/${id}`);
      if (res.data.success) {
        setTherapist(res.data.data);
        // Fetch slots
        const slotsRes = await axios.get(`/api/mentalhealth/therapists/${id}/slots`);
        if (slotsRes.data.success) {
          setSlots(slotsRes.data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching therapist:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>;
  }

  if (!therapist) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Therapist not found</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/mentalhealth/therapists')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🧠 Therapist Profile</h1>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>👤</div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{therapist.name}</h2>
                  <p style={{ color: '#6b7280' }}>{therapist.specializations?.join(' • ')}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                    ⭐ {therapist.rating || 0} ({therapist.totalReviews || 0} reviews)
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: 'bold' }}>About</h4>
                <p style={{ color: '#4b5563' }}>{therapist.about || 'No description available'}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div><strong>Experience:</strong> {therapist.experience} years</div>
                <div><strong>Languages:</strong> {therapist.languages?.join(', ')}</div>
                <div><strong>License:</strong> {therapist.licenseNumber}</div>
                <div><strong>Location:</strong> {therapist.address?.city}</div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: 'bold' }}>Consultation Types</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {therapist.consultationTypes?.video && <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>🎥 Video</span>}
                  {therapist.consultationTypes?.audio && <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>🎧 Audio</span>}
                  {therapist.consultationTypes?.text && <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>💬 Text</span>}
                  {therapist.consultationTypes?.anonymous && <span style={{ backgroundColor: '#ede9fe', color: '#5b21b6', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>🔒 Anonymous</span>}
                  {therapist.consultationTypes?.emergency && <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>🚨 Emergency</span>}
                </div>
              </div>
            </div>

            <div style={{ minWidth: '250px', flex: 0.5 }}>
              <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>💰 Pricing</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(therapist.pricing?.consultation || 500)}</div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>per session</div>
                {therapist.pricing?.packageDiscount > 0 && (
                  <div style={{ fontSize: '0.85rem', color: '#10b981' }}>💲 {therapist.pricing.packageDiscount}% off on packages</div>
                )}
                <button
                  onClick={() => navigate(`/mentalhealth/book/${therapist._id}`)}
                  style={{ width: '100%', marginTop: '1rem', padding: '10px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  📋 Book Session
                </button>
                {therapist.isEmergencyAvailable && (
                  <button
                    onClick={() => navigate('/mentalhealth/crisis')}
                    style={{ width: '100%', marginTop: '0.5rem', padding: '10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    🆘 Emergency Support
                  </button>
                )}
              </div>

              <div style={{ marginTop: '1rem', backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📅 Available Slots</h4>
                {slots.length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No slots available</p>
                ) : (
                  slots.map((slot, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        width: '100%',
                        padding: '6px 12px',
                        marginBottom: '4px',
                        backgroundColor: selectedSlot === slot ? '#8b5cf6' : '#f3f4f6',
                        color: selectedSlot === slot ? 'white' : '#1e293b',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      {slot.startTime} - {slot.endTime}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthTherapistDetail;
