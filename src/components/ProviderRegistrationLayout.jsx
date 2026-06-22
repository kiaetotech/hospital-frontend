import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProviderRegistrationLayout = ({
  title,
  subtitle,
  icon,
  steps,
  currentStep,
  onStepChange,
  children,
  onSubmit,
  loading
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          borderRadius: '1rem',
          padding: '2rem',
          color: 'white',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{icon}</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{title}</h1>
          <p style={{ opacity: 0.9 }}>{subtitle}</p>
        </div>

        {/* Stepper */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          position: 'relative'
        }}>
          {steps.map((step, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: index <= currentStep ? '#2563eb' : '#e5e7eb',
                color: index <= currentStep ? 'white' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1rem',
                transition: 'all 0.3s',
                zIndex: 2,
                position: 'relative'
              }}>
                {index + 1}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: index <= currentStep ? '#2563eb' : '#6b7280',
                marginTop: '0.5rem',
                textAlign: 'center',
                fontWeight: index <= currentStep ? 'bold' : 'normal'
              }}>
                {step}
              </div>
              {index < steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: `${(index + 1) * (100 / steps.length) - 50}%`,
                  right: `${(index + 2) * (100 / steps.length) - 50}%`,
                  height: '2px',
                  backgroundColor: index < currentStep ? '#2563eb' : '#e5e7eb',
                  zIndex: 1
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          {children}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={() => onStepChange(currentStep - 1)}
              disabled={currentStep === 0}
              style={{
                padding: '0.6rem 1.5rem',
                backgroundColor: currentStep === 0 ? '#e5e7eb' : '#6b7280',
                color: currentStep === 0 ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              ← Previous
            </button>
            <button
              onClick={() => onStepChange(currentStep + 1)}
              style={{
                padding: '0.6rem 2rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              disabled={loading}
            >
              {loading ? 'Processing...' : currentStep === steps.length - 1 ? '✅ Submit Registration' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegistrationLayout;