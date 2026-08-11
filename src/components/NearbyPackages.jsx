import React, { useState } from 'react';
import axios from 'axios';

const NearbyPackages = ({ onSelectPackage }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(10);
  const [showNearby, setShowNearby] = useState(false);

  const API_URL = 'https://hospital-backend-production-7d0f.up.railway.app/api';

  const getNearbyPackages = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await axios.get(`${API_URL}/health-packages/nearby`, {
            params: { latitude, longitude, radius }
          });
          setPackages(res.data.packages || []);
          setShowNearby(true);
        } catch (error) {
          console.error('Error:', error);
          alert('Error finding nearby packages');
        } finally {
          setLoading(false);
        }
      },
      () => {
        alert('Unable to get location');
        setLoading(false);
      }
    );
  };

  return (
    <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#e0f2fe', borderRadius: '12px' }}>
      <h3>📍 Packages Near You</h3>
      <p>Find health packages from labs in your area</p>
      
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
        <label>Radius: {radius} km</label>
        <input
          type="range"
          min="1"
          max="50"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          style={{ width: '200px' }}
        />
        <button onClick={getNearbyPackages} disabled={loading} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Finding...' : 'Find Nearby Packages'}
        </button>
      </div>
      
      {showNearby && (
        <div>
          {packages.length === 0 ? (
            <p>No packages found within {radius} km</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
              {packages.map(pkg => (
                <div key={pkg._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: 'white' }}>
                  <h4>{pkg.package_name}</h4>
                  <p>{pkg.package_description?.substring(0, 80)}...</p>
                  <p><strong>Provider:</strong> {pkg.provider_id?.provider_name}</p>
                  <p><strong>Distance:</strong> {pkg.distance_km || 'N/A'} km</p>
                  <p><strong>Price:</strong> ₹{pkg.discounted_price}</p>
                  <button onClick={() => onSelectPackage(pkg)} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NearbyPackages;

