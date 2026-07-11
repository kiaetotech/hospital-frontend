import React, { useState } from 'react';

const AadhaarOTPVerification = ({ onVerified, onBack }) => {
  const [aadhaar, setAadhaar] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [aadhaarData, setAadhaarData] = useState(null);

  const handleSendOTP = () => {
    if (aadhaar.length !== 12) {
      alert('Enter valid 12-digit Aadhaar number');
      return;
    }
    setOtpSent(true);
    // Mock OTP sent
    alert(`OTP sent to mobile linked with Aadhaar ending with ${aadhaar.slice(-4)}`);
  };

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      alert('Enter 6-digit OTP');
      return;
    }
    setVerifying(true);
    
    // Mock verification
    setTimeout(() => {
      setVerified(true);
      setAadhaarData({
        name: 'Patient Name from Aadhaar',
        dob: '15/08/1985',
        gender: 'Male',
        aadhaarLast4: aadhaar.slice(-4)
      });
      onVerified({
        aadhaarNumber: aadhaar,
        aadhaarData: aadhaarData
      });
      setVerifying(false);
    }, 1500);
  };

  if (verified) {
    return (
      <div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '1.25rem' }}>✅</span>
            <strong style={{ marginLeft: '0.5rem' }}>Aadhaar Verified</strong>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Name: {aadhaarData?.name}<br />
              DOB: {aadhaarData?.dob}
            </p>
          </div>
          <button onClick={onBack} style={{ fontSize: '0.7rem', color: '#8b5cf6', background: 'none', border: 'none', cursor: 'pointer' }}>
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
      <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📱 Aadhaar Verification (eKYC)</h4>
      
      {!otpSent ? (
        <>
          <input
            type="text"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="Enter 12-digit Aadhaar number"
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.5rem' }}
          />
          <button
            onClick={handleSendOTP}
            style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
          >
            Send OTP
          </button>
        </>
      ) : (
        <>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            OTP sent to Aadhaar-registered mobile ending with ****{aadhaar.slice(-4)}
          </p>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit OTP"
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.5rem' }}
          />
          <button
            onClick={handleVerifyOTP}
            disabled={verifying}
            style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
          >
            {verifying ? 'Verifying...' : 'Verify OTP'}
          </button>
        </>
      )}
    </div>
  );
};

export default AadhaarOTPVerification;
