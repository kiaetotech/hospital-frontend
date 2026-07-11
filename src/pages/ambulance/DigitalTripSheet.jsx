import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripSheet } from '../../services/api';

const DigitalTripSheet = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTripSheet();
  }, [bookingId]);

  const fetchTripSheet = async () => {
    try {
      const res = await getTripSheet(bookingId);
      if (res.data?.success) {
        setTripData(res.data.data);
      } else {
        setError('Trip sheet not available yet');
      }
    } catch (err) {
      setError('Failed to load trip sheet');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} minutes`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading trip sheet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>📋 {error}</h2>
          <p style={styles.errorText}>Trip sheets are generated after the trip is completed.</p>
          <button onClick={() => navigate('/ambulance')} style={styles.backBtn}>
            ← Back to Ambulance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Print Button */}
      <div style={styles.noPrint}>
        <div style={styles.header}>
          <button onClick={() => navigate('/ambulance')} style={styles.backBtn}>← Back</button>
          <h1 style={styles.title}>📋 Trip Sheet</h1>
          <button onClick={handlePrint} style={styles.printBtn}>🖨️ Print</button>
        </div>
      </div>

      {/* Trip Sheet Document */}
      <div style={styles.document}>
        {/* Header */}
        <div style={styles.docHeader}>
          <div style={styles.logo}>
            <h2 style={styles.logoText}>🏥 HealthCare Hub</h2>
            <p style={styles.logoSub}>Ambulance Trip Sheet</p>
          </div>
          <div style={styles.docMeta}>
            <p style={styles.metaText}>Trip ID: {tripData?.tripSheetId || bookingId}</p>
            <p style={styles.metaText}>Booking ID: {tripData?.bookingId || bookingId}</p>
            <p style={styles.metaText}>Date: {formatDate(tripData?.generatedAt || tripData?.pickupTime)}</p>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Patient & Driver Info */}
        <div style={styles.infoGrid}>
          <div style={styles.infoBox}>
            <h4 style={styles.infoTitle}>👤 Patient Details</h4>
            <p style={styles.infoText}><strong>Name:</strong> {tripData?.patientName || 'N/A'}</p>
            <p style={styles.infoText}><strong>Pickup:</strong> {tripData?.pickupAddress || 'N/A'}</p>
            <p style={styles.infoText}><strong>Destination:</strong> {tripData?.hospitalDestination || 'N/A'}</p>
          </div>
          <div style={styles.infoBox}>
            <h4 style={styles.infoTitle}>🚑 Ambulance Details</h4>
            <p style={styles.infoText}><strong>Driver:</strong> {tripData?.driverName || 'N/A'}</p>
            <p style={styles.infoText}><strong>Vehicle:</strong> {tripData?.vehicleNumber || 'N/A'}</p>
            <p style={styles.infoText}><strong>Type:</strong> {tripData?.ambulanceType || 'N/A'}</p>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Trip Timeline */}
        <div style={styles.timeline}>
          <h4 style={styles.infoTitle}>⏱️ Trip Timeline</h4>
          <div style={styles.timelineRow}>
            <span style={styles.timelineDot}>🚑</span>
            <div style={styles.timelineContent}>
              <strong>Pickup Time</strong>
              <p>{formatDate(tripData?.pickupTime)}</p>
            </div>
          </div>
          <div style={styles.timelineLine} />
          <div style={styles.timelineRow}>
            <span style={styles.timelineDot}>🏥</span>
            <div style={styles.timelineContent}>
              <strong>Drop Time</strong>
              <p>{formatDate(tripData?.dropTime)}</p>
            </div>
          </div>
          <div style={styles.timelineRow}>
            <span style={styles.timelineDot}>📏</span>
            <div style={styles.timelineContent}>
              <strong>Distance:</strong> {tripData?.distance || 'N/A'} km
              <br /><strong>Duration:</strong> {formatDuration(tripData?.duration)}
            </div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Vitals */}
        {tripData?.vitals && (tripData.vitals.bloodPressure || tripData.vitals.spo2) && (
          <>
            <div style={styles.vitalsSection}>
              <h4 style={styles.infoTitle}>🩺 Vitals Recorded</h4>
              <div style={styles.vitalsGrid}>
                {tripData.vitals.bloodPressure && (
                  <div style={styles.vitalCard}>
                    <span style={styles.vitalIcon}>💓</span>
                    <strong>BP</strong>
                    <p>{tripData.vitals.bloodPressure}</p>
                  </div>
                )}
                {tripData.vitals.pulse && (
                  <div style={styles.vitalCard}>
                    <span style={styles.vitalIcon}>💗</span>
                    <strong>Pulse</strong>
                    <p>{tripData.vitals.pulse} bpm</p>
                  </div>
                )}
                {tripData.vitals.spo2 && (
                  <div style={styles.vitalCard}>
                    <span style={styles.vitalIcon}>🫁</span>
                    <strong>SpO2</strong>
                    <p>{tripData.vitals.spo2}%</p>
                  </div>
                )}
                {tripData.vitals.temperature && (
                  <div style={styles.vitalCard}>
                    <span style={styles.vitalIcon}>🌡️</span>
                    <strong>Temp</strong>
                    <p>{tripData.vitals.temperature}°C</p>
                  </div>
                )}
                {tripData.vitals.glucose && (
                  <div style={styles.vitalCard}>
                    <span style={styles.vitalIcon}>🩸</span>
                    <strong>Glucose</strong>
                    <p>{tripData.vitals.glucose} mg/dL</p>
                  </div>
                )}
              </div>
            </div>
            <div style={styles.divider} />
          </>
        )}

        {/* Oxygen & Medications */}
        <div style={styles.infoGrid}>
          <div style={styles.infoBox}>
            <h4 style={styles.infoTitle}>💊 Treatment Given</h4>
            <p style={styles.infoText}>
              <strong>Oxygen:</strong> {tripData?.oxygenAdministered ? `Yes (${tripData?.oxygenFlowRate || 'N/A'} L/min)` : 'No'}
            </p>
            {tripData?.medicationsGiven?.length > 0 ? (
              tripData.medicationsGiven.map((med, i) => (
                <p key={i} style={styles.infoText}>• {med.name} - {med.dosage}</p>
              ))
            ) : (
              <p style={styles.infoText}>No medications administered</p>
            )}
          </div>
          <div style={styles.infoBox}>
            <h4 style={styles.infoTitle}>📝 Notes</h4>
            <p style={styles.infoText}>{tripData?.driverNotes || tripData?.patientConditionDuringTransport || 'No notes recorded'}</p>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Fare Breakdown */}
        {tripData?.fareBreakdown && (
          <div style={styles.fareSection}>
            <h4 style={styles.infoTitle}>💰 Fare Breakdown</h4>
            <div style={styles.fareTable}>
              {tripData.fareBreakdown.baseFare > 0 && (
                <div style={styles.fareRow}>
                  <span>Base Fare</span>
                  <span>₹{tripData.fareBreakdown.baseFare}</span>
                </div>
              )}
              {tripData.fareBreakdown.distanceCharge > 0 && (
                <div style={styles.fareRow}>
                  <span>Distance Charge</span>
                  <span>₹{tripData.fareBreakdown.distanceCharge}</span>
                </div>
              )}
              {tripData.fareBreakdown.nightCharge > 0 && (
                <div style={styles.fareRow}>
                  <span>Night Charge</span>
                  <span>₹{tripData.fareBreakdown.nightCharge}</span>
                </div>
              )}
              {tripData.fareBreakdown.oxygenCharge > 0 && (
                <div style={styles.fareRow}>
                  <span>Oxygen Charge</span>
                  <span>₹{tripData.fareBreakdown.oxygenCharge}</span>
                </div>
              )}
              {tripData.fareBreakdown.surgeCharge > 0 && (
                <div style={styles.fareRow}>
                  <span>Surge Charge</span>
                  <span style={{ color: '#ff9800' }}>₹{tripData.fareBreakdown.surgeCharge}</span>
                </div>
              )}
              {tripData.fareBreakdown.platformFee > 0 && (
                <div style={styles.fareRow}>
                  <span>Platform Fee</span>
                  <span>₹{tripData.fareBreakdown.platformFee}</span>
                </div>
              )}
              {tripData.fareBreakdown.gst > 0 && (
                <div style={styles.fareRow}>
                  <span>GST ({tripData.fareBreakdown.gstPercentage || 5}%)</span>
                  <span>₹{tripData.fareBreakdown.gst}</span>
                </div>
              )}
              <div style={{ ...styles.fareRow, borderTop: '2px solid #e53935', marginTop: '8px', paddingTop: '8px' }}>
                <strong style={{ color: '#fff', fontSize: '16px' }}>Total</strong>
                <strong style={{ color: '#4caf50', fontSize: '18px' }}>₹{tripData.fareBreakdown.total || tripData.fareBreakdown.totalFare}</strong>
              </div>
            </div>
          </div>
        )}

        <div style={styles.divider} />

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>This is a computer-generated trip sheet.</p>
          <p style={styles.footerText}>Use this document for insurance claims.</p>
          <p style={styles.footerText}>HealthCare Hub — India's Trusted Healthcare Marketplace</p>
          <div style={styles.qrPlaceholder}>
            <div style={styles.qrBox}>
              <span style={styles.qrIcon}>📱</span>
              <p style={styles.qrText}>Scan to verify</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f0f1a',
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  loadingContainer: {
    textAlign: 'center',
    paddingTop: '100px'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #333',
    borderTopColor: '#e53935',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  loadingText: {
    color: '#aaa',
    fontSize: '16px'
  },
  errorContainer: {
    textAlign: 'center',
    paddingTop: '50px'
  },
  errorTitle: {
    color: '#ff9800',
    fontSize: '20px'
  },
  errorText: {
    color: '#ccc',
    fontSize: '14px',
    margin: '10px 0'
  },
  noPrint: {
    marginBottom: '20px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#e53935',
    fontSize: '14px',
    cursor: 'pointer'
  },
  title: {
    color: '#fff',
    fontSize: '20px',
    margin: 0
  },
  printBtn: {
    padding: '8px 16px',
    background: '#2196f3',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  document: {
    background: '#fff',
    borderRadius: '12px',
    padding: '30px',
    color: '#333',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
  },
  docHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  logo: {},
  logoText: {
    color: '#e53935',
    fontSize: '22px',
    margin: '0 0 4px 0'
  },
  logoSub: {
    color: '#666',
    fontSize: '14px',
    margin: 0
  },
  docMeta: {
    textAlign: 'right'
  },
  metaText: {
    color: '#666',
    fontSize: '12px',
    margin: '2px 0'
  },
  divider: {
    height: '2px',
    background: '#e0e0e0',
    margin: '20px 0'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  infoBox: {},
  infoTitle: {
    color: '#e53935',
    fontSize: '14px',
    margin: '0 0 10px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  infoText: {
    color: '#555',
    fontSize: '13px',
    margin: '4px 0',
    lineHeight: '1.5'
  },
  timeline: {
    marginBottom: '10px'
  },
  timelineRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '8px'
  },
  timelineDot: {
    fontSize: '20px',
    marginTop: '2px'
  },
  timelineLine: {
    width: '2px',
    height: '20px',
    background: '#e0e0e0',
    marginLeft: '9px',
    marginBottom: '8px'
  },
  timelineContent: {
    color: '#555',
    fontSize: '13px'
  },
  vitalsSection: {
    marginBottom: '10px'
  },
  vitalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '10px'
  },
  vitalCard: {
    background: '#f5f5f5',
    borderRadius: '8px',
    padding: '10px',
    textAlign: 'center'
  },
  vitalIcon: {
    fontSize: '24px',
    display: 'block',
    marginBottom: '4px'
  },
  fareSection: {},
  fareTable: {},
  fareRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid #eee',
    color: '#555',
    fontSize: '13px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '10px'
  },
  footerText: {
    color: '#999',
    fontSize: '11px',
    margin: '3px 0'
  },
  qrPlaceholder: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '15px'
  },
  qrBox: {
    border: '2px dashed #ddd',
    borderRadius: '8px',
    padding: '15px 30px',
    textAlign: 'center'
  },
  qrIcon: {
    fontSize: '30px'
  },
  qrText: {
    color: '#999',
    fontSize: '11px',
    margin: '5px 0 0 0'
  }
};

export default DigitalTripSheet;
