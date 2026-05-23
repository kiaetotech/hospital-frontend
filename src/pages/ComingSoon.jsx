import React from 'react';
import { Link } from 'react-router-dom';

const ComingSoon = ({ title }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f3f4f6' 
    }}>
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#1e3a8a', 
          marginBottom: '1rem' 
        }}>
          {title || 'Coming Soon'}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          This feature is under development.
        </p>
        <Link 
          to="/" 
          style={{ 
            backgroundColor: '#10b981', 
            color: 'white', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '0.5rem', 
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
