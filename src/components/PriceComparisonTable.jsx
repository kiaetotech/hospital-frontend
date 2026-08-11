// src/components/PriceComparisonTable.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PriceComparisonTable = ({ selectedTests, onBack, onBookNow, filters }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealPrices = async () => {
      setLoading(true);
      try {
        const requestBody = {
          testNames: selectedTests,
          city: filters?.city || 'All',
          minRating: filters?.minRating || '',
          maxPrice: filters?.maxPrice || '',
          homeCollectionOnly: filters?.homeCollectionOnly || false,
          maxDistance: filters?.maxDistance || '',
          userLat: filters?.userLat || null,
          userLng: filters?.userLng || null
        };
        
        const response = await axios.post('https://hospital-backend-production-7d0f.up.railway.app/api/tests/compare', requestBody);
        
        const providers = response.data.map(provider => ({
          provider_name: provider.providerName,
          rating: provider.rating,
          distance: provider.distance || 'Address not available',
          address: provider.address,
          home_collection: provider.homeCollectionAvailable,
          home_collection_available: provider.homeCollectionAvailable,
          report_time_hours: provider.reportTimeHours,
          total_price: provider.totalPrice,
          individual_prices: Object.fromEntries(
            Object.entries(provider.prices || {}).map(([test, data]) => [test, data.discountedPrice || data.price])
          )
        }));
        
        setProviders(providers);
      } catch (error) {
        console.error('Error fetching prices:', error);
        setProviders([]);
      }
      setLoading(false);
    };
    
    if (selectedTests.length > 0) {
      fetchRealPrices();
    }
  }, [selectedTests, filters]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading comparison data...</div>;

  if (providers.length === 0) {
    return (
      <div>
        <button onClick={onBack} style={{ marginBottom: '20px', cursor: 'pointer', padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px' }}>← Back</button>
        <h2>Price Comparison for Selected Tests</h2>
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '10px' }}>
          <p>No providers found matching your criteria.</p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Try adjusting your filters or select different tests.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: '20px', cursor: 'pointer', padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px' }}>← Back</button>
      <h2>Price Comparison for Selected Tests</h2>
      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Test / Provider</th>
              {providers.map((p, idx) => (
                <th key={idx} style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: idx === 0 ? '#d1fae5' : '#f3f4f6' }}>
                  {p.provider_name}
                  {idx === 0 && <span style={{ display: 'block', fontSize: '11px', color: '#10b981' }}>Cheapest</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: '#e5e7eb' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>Rating<\/td>
              {providers.map((p, idx) => (<td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.rating} ★<\/td>))}
            <\/tr>
            <tr style={{ backgroundColor: '#e5e7eb' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>Distance<\/td>
              {providers.map((p, idx) => (<td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.distance}<\/td>))}
            <\/tr>
            <tr style={{ backgroundColor: '#e5e7eb' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>Home Collection<\/td>
              {providers.map((p, idx) => (<td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.home_collection ? 'Yes' : 'No'}<\/td>))}
            <\/tr>
            <tr style={{ backgroundColor: '#e5e7eb' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>Report Time<\/td>
              {providers.map((p, idx) => (<td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.report_time_hours} hours<\/td>))}
            <\/tr>
            {selectedTests.map(test => (
              <tr key={test}>
                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{test}<\/td>
                {providers.map((p, idx) => (<td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Rs. {p.individual_prices[test]}<\/td>))}
              <\/tr>
            ))}
            <tr style={{ backgroundColor: '#fef3c7', fontWeight: 'bold' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Price<\/td>
              {providers.map((p, idx) => (<td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Rs. {p.total_price}<\/td>))}
             <\/tr>
             <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>Action<\/td>
              {providers.map((p, idx) => (
                <td key={idx} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  <button 
                    onClick={() => onBookNow(p, selectedTests)} 
                    style={{ backgroundColor: idx === 0 ? '#10b981' : '#3b82f6', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Book Now
                  </button>
                <\/td>
              ))}
             <\/tr>
          <\/tbody>
        <\/table>
      <\/div>
    <\/div>
  );
};

export default PriceComparisonTable;

