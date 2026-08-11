import React, { useState } from 'react';
import axios from 'axios';

const SmartSuggestions = ({ onSelectPackage }) => {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const API_URL = 'https://hospital-backend-production-7d0f.up.railway.app/api';

  const getSuggestions = async () => {
    if (!age && !gender && !symptoms) {
      alert('Please enter at least age, gender, or symptoms');
      return;
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (age) params.append('age', age);
      if (gender) params.append('gender', gender);
      if (symptoms) params.append('symptoms', symptoms);
      
      const res = await axios.get(`${API_URL}/health-packages/suggest?${params.toString()}`);
      setSuggestions(res.data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      alert('Error getting suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px' }}>
      <h3>🤖 Smart Package Suggestions</h3>
      <p>Tell us about yourself to get personalized package recommendations</p>
      
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100px' }}
        />
        <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '120px' }}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input
          type="text"
          placeholder="Symptoms (e.g., fever, fatigue, chest pain)"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          style={{ flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button onClick={getSuggestions} disabled={loading} style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Loading...' : 'Get Suggestions'}
        </button>
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div>
          <h4>Recommended Packages for You</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
            {suggestions.map(pkg => (
              <div key={pkg._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: 'white' }}>
                <h4>{pkg.package_name}</h4>
                <p>{pkg.package_description?.substring(0, 80)}...</p>
                <p><strong>Provider:</strong> {pkg.provider_id?.provider_name}</p>
                <p><strong>Price:</strong> ₹{pkg.discounted_price}</p>
                {pkg.relevance_score > 0 && <p><strong>Match Score:</strong> {pkg.relevance_score}%</p>}
                <button onClick={() => onSelectPackage(pkg)} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSuggestions;
