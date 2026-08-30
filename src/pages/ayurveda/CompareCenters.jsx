import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPanchakarmaCenters } from '../../services/ayurvedaApi';
import { FaStar, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const CompareCenters = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialCenters = location.state?.centers || [];
  
  const [allCenters, setAllCenters] = useState([]);
  const [selectedCenters, setSelectedCenters] = useState(initialCenters.slice(0, 3));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const response = await getPanchakarmaCenters();
      if (response.data.success) {
        setAllCenters(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load centers');
    } finally {
      setLoading(false);
    }
  };

  const toggleCenter = (center) => {
    if (selectedCenters.find(c => c._id === center._id)) {
      setSelectedCenters(selectedCenters.filter(c => c._id !== center._id));
    } else if (selectedCenters.length < 3) {
      setSelectedCenters([...selectedCenters, center]);
    } else {
      alert('Maximum 3 centers for comparison');
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
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6"
        >
          <FaArrowLeft /> Back
        </button>

        <h1 className="text-2xl font-bold mb-6">Compare Panchakarma Centers</h1>

        {/* Center Selection */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h2 className="font-semibold mb-3">Select Centers (max 3)</h2>
          <div className="flex gap-2 flex-wrap">
            {allCenters.slice(0, 10).map(center => (
              <button
                key={center._id}
                onClick={() => toggleCenter(center)}
                className={`px-3 py-2 rounded-lg border ${
                  selectedCenters.find(c => c._id === center._id)
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                {center.name}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        {selectedCenters.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left">Feature</th>
                  {selectedCenters.map(center => (
                    <th key={center._id} className="p-3 text-left">
                      <p className="font-semibold">{center.name}</p>
                      <p className="text-sm text-gray-500">{center.address?.city}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3 font-medium">Rating</td>
                  {selectedCenters.map(center => (
                    <td key={center._id} className="p-3">
                      <span className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" /> {center.rating || 'New'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">Type</td>
                  {selectedCenters.map(center => (
                    <td key={center._id} className="p-3">{center.type || 'Wellness Center'}</td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">Packages</td>
                  {selectedCenters.map(center => (
                    <td key={center._id} className="p-3">{center.packages?.length || 0}</td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">Panchakarma Rooms</td>
                  {selectedCenters.map(center => (
                    <td key={center._id} className="p-3">{center.panchakarmaRooms || 'N/A'}</td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">Facilities</td>
                  {selectedCenters.map(center => (
                    <td key={center._id} className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {center.facilities?.slice(0, 5).map((facility, i) => (
                          <span key={i} className="px-2 py-1 bg-green-50 rounded-full text-xs">
                            {facility}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">Action</td>
                  {selectedCenters.map(center => (
                    <td key={center._id} className="p-3">
                      <button
                        onClick={() => navigate('/ayurveda/panchakarma-center-detail', { state: { center } })}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareCenters;