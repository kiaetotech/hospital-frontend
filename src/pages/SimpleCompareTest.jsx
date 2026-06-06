import React, { useState } from 'react';

const SimpleCompareTest = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);

  const packages = [
    { id: 1, name: 'Full Body Checkup', price: 1299 },
    { id: 2, name: 'Cardiac Care', price: 999 }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Simple Compare Test</h2>
      <p>This is a test page to verify button clicks work</p>
      
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <th>Package</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {packages.map(pkg => (
            <tr key={pkg.id}>
              <td>{pkg.name}</td>
              <td>₹{pkg.price}</td>
              <td>
                <button
                  onClick={() => {
                    alert('Button clicked for: ' + pkg.name);
                    setSelectedPkg(pkg);
                    setShowModal(true);
                  }}
                  style={{ backgroundColor: 'green', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Book Now
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedPkg && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <h3>Booking: {selectedPkg.name}</h3>
          <p>Price: ₹{selectedPkg.price}</p>
          <button onClick={() => setShowModal(false)} style={{ backgroundColor: '#6b7280', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
        </div>
      )}
    </div>
  );
};

export default SimpleCompareTest;