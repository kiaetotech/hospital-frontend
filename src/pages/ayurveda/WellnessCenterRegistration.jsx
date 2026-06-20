import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const WellnessCenterRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: '',
    type: 'Wellness Center', description: '',
    city: '', state: '', area: '', pincode: '',
    bedCount: '', panchakarmaRooms: '', established: '',
    facilities: []
  });

  const facilityOptions = ['AC Rooms', 'Organic Food', 'Yoga Hall', 'Herbal Garden', 'WiFi', 'Swimming Pool', 'Library', 'Meditation Hall', 'Pickup/Drop', 'Beach Access', 'Mountain View', 'Luxury Rooms'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Kochi', 'Rishikesh', 'Dehradun', 'Haridwar', 'Goa', 'Mysore', 'Coimbatore', 'Trivandrum', 'Udaipur', 'Varanasi'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/ayurveda-centers/register', form);
      if (response.data.success) {
        alert('✅ Registration submitted! Admin will verify within 24-48 hours.');
        navigate('/ayurveda/center/login');
      }
    } catch (error) {
      alert('Registration failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF9800', textAlign: 'center', marginBottom: '2rem' }}>
        🏨 Register Your Wellness Center
      </h1>

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Center Information</h3>
        
        <input required placeholder="Center Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} />
        <input required placeholder="Phone Number *" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={inputStyle} />
        <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={inputStyle} />
        <input required type="password" placeholder="Password *" value={form.password} onChange={e => setForm({...form, password: e.target.value})} style={inputStyle} />
        <input required type="password" placeholder="Confirm Password *" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} style={inputStyle} />

        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={inputStyle}>
          <option value="Wellness Center">Wellness Center</option>
          <option value="Hospital">Hospital</option>
          <option value="Retreat">Retreat</option>
          <option value="Clinic">Clinic</option>
          <option value="Panchakarma Center">Panchakarma Center</option>
        </select>

        <textarea placeholder="Describe your center..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{...inputStyle, height: '80px'}} />

        <h3 style={{ fontWeight: 'bold', margin: '1.5rem 0 1rem' }}>Location</h3>
        <select required value={form.city} onChange={e => setForm({...form, city: e.target.value})} style={inputStyle}>
          <option value="">Select City *</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Area/Locality" value={form.area} onChange={e => setForm({...form, area: e.target.value})} style={inputStyle} />
        <input placeholder="State" value={form.state} onChange={e => setForm({...form, state: e.target.value})} style={inputStyle} />
        <input placeholder="Pincode" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} style={inputStyle} />

        <h3 style={{ fontWeight: 'bold', margin: '1.5rem 0 1rem' }}>Facilities</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          <input type="number" placeholder="Total Beds" value={form.bedCount} onChange={e => setForm({...form, bedCount: e.target.value})} style={inputStyle} />
          <input type="number" placeholder="Panchakarma Rooms" value={form.panchakarmaRooms} onChange={e => setForm({...form, panchakarmaRooms: e.target.value})} style={inputStyle} />
          <input type="number" placeholder="Established Year" value={form.established} onChange={e => setForm({...form, established: e.target.value})} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {facilityOptions.map(f => (
            <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={form.facilities.includes(f)}
                onChange={e => {
                  if (e.target.checked) setForm({...form, facilities: [...form.facilities, f]});
                  else setForm({...form, facilities: form.facilities.filter(x => x !== f)});
                }} />
              {f}
            </label>
          ))}
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '1rem', backgroundColor: loading ? '#ffe0b2' : '#FF9800', color: 'white',
          border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '1.5rem'
        }}>
          {loading ? 'Submitting...' : '✅ Submit for Verification'}
        </button>
      </form>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '0.75rem', marginBottom: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box' };

export default WellnessCenterRegistration;