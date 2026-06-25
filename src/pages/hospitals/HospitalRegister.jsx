import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderRegistrationLayout from '../../../components/ProviderRegistrationLayout';
import api from '../../../services/api';
import { sendOTP, verifyOTP } from '../../../services/api';

const HospitalRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    registrationNumber: '',
    type: 'multi_specialty',
    ownership: 'private',
    establishedYear: '',
    description: '',
    accreditations: [],
    
    // Step 2: Contact & Location
    email: '',
    phone: '',
    alternatePhone: '',
    emergencyPhone: '',
    website: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      country: 'India'
    },
    location: {
      lat: null,
      lng: null
    },
    
    // Step 3: Facilities & Technology
    facilities: [],
    technology: [],
    amenities: [],
    specialties: [],
    diseasesTreated: [],
    bedCount: 0,
    icuBeds: 0,
    ventilatorCount: 0,
    emergencyBeds: 0,
    emergencyServices: false,
    traumaCenter: false,
    strokeReady: false,
    cardiacEmergency: false,
    ambulanceAvailable: false,
    ambulanceCount: 0,
    labTestsAvailable: false,
    pharmacy24x7: false,
    
    // Step 4: OPD & Pricing
    opdTimings: { 
      morning: { start: '09:00', end: '13:00' },
      evening: { start: '17:00', end: '20:00' }
    },
    opdFee: {
      general: 0,
      specialist: 0,
      superSpecialist: 0
    },
    ipdPricing: {
      generalWard: 0,
      semiPrivate: 0,
      private: 0,
      deluxe: 0,
      icu: 0,
      icuWithVentilator: 0
    },
    onlineBookingDiscount: 10,
    
    // Step 5: Doctors
    doctors: [],
    
    // Step 6: Schemes & Insurance
    schemesAccepted: [],
    insuranceAccepted: [],
    cashlessAvailable: false,
    tpaDeskAvailable: false,
    reimbursementAccepted: true,
    tpaPartners: [],
    paymentMethods: ['Cash', 'Credit Card', 'Debit Card', 'UPI'],
    emiAvailable: false,
    emiPartners: [],
    
    // Step 7: Documents
    documents: [],
    
    // Step 8: Password & Verification
    password: '',
    confirmPassword: ''
  });

  const steps = [
    'Basic Info',
    'Contact & Location',
    'Facilities',
    'Pricing',
    'Doctors',
    'Schemes & Insurance',
    'Documents',
    'Verification'
  ];

  // Available options for multi-select
  const accreditationOptions = ['NABH', 'JCI', 'NABL', 'ISO'];
  
  const facilityOptions = [
    'ICU', 'NICU', 'PICU', 'Operation Theater', 'Cath Lab',
    'Dialysis Unit', 'Blood Bank', 'Laboratory', 'Radiology',
    'Pharmacy', 'Emergency Room', 'Isolation Ward', 'Burn Unit'
  ];
  
  const technologyOptions = [
    'MRI 3T', 'MRI 1.5T', 'CT 128 Slice', 'CT 64 Slice',
    'PET-CT', 'SPECT-CT', 'Digital X-Ray', 'Mammography',
    'DEXA Scan', 'Ultrasound 4D', 'Echocardiography',
    'EEG', 'EMG', 'Robotic Surgery', 'Gamma Knife',
    'Lithotripsy', 'C-Arm', 'Endoscopy Suite'
  ];
  
  const amenityOptions = [
    'WiFi', 'AC Rooms', 'TV', 'Cafeteria', 'Parking',
    'Wheelchair Access', 'Prayer Room', 'ATM', 'Attendant Stay',
    'Dietary Services', 'Laundry', 'International Patient Services'
  ];
  
  const specialtyOptions = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Oncology',
    'Gastroenterology', 'Nephrology', 'Urology', 'Pulmonology',
    'Endocrinology', 'Dermatology', 'ENT', 'Ophthalmology',
    'Psychiatry', 'Pediatrics', 'Gynecology', 'Obstetrics',
    'Neonatology', 'Geriatrics', 'Plastic Surgery', 'Dental',
    'Physiotherapy', 'Dietetics', 'Emergency Medicine'
  ];
  
  const schemeOptions = [
    { value: 'ayushman', label: 'Ayushman Bharat (PM-JAY)' },
    { value: 'cghs', label: 'CGHS' },
    { value: 'esi', label: 'ESI' },
    { value: 'echs', label: 'ECHS' },
    { value: 'state_scheme', label: 'State Health Scheme' },
    { value: 'senior_citizen', label: 'Senior Citizen Scheme' },
    { value: 'disability', label: 'Disability Scheme' }
  ];
  
  const commonInsurances = [
    'Star Health', 'ICICI Lombard', 'HDFC Ergo', 'Bajaj Allianz',
    'Max Bupa', 'Religare Care', 'New India Assurance', 'Oriental Insurance',
    'United India Insurance', 'National Insurance', 'Aditya Birla Health',
    'ManipalCigna', 'Digit Health', 'Acko General Insurance',
    'SBI General', 'Tata AIG', 'Royal Sundaram', 'IFFCO Tokio'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      } else if (parts.length === 3) {
        const [grandparent, parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [grandparent]: {
            ...prev[grandparent],
            [parent]: {
              ...prev[grandparent][parent],
              [child]: value
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleArrayAdd = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], item]
    }));
  };

  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  // OTP Functions
  const handleSendOTP = async () => {
    if (!formData.phone) {
      alert('Please enter phone number in Contact Details first');
      return;
    }
    setLoading(true);
    try {
      await sendOTP({ phone: formData.phone, type: 'registration' });
      setOtpSent(true);
      setResendTimer(30);
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      alert('Please enter valid OTP');
      return;
    }
    setLoading(true);
    try {
      await verifyOTP({ phone: formData.phone, otp, type: 'registration' });
      setOtpVerified(true);
      alert('✅ Phone verified successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (!otpVerified) {
      alert('Please verify your phone number with OTP');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/hospitals/register', {
        ...formData,
        otpVerified: true
      });
      
      if (response.data.success) {
        alert('✅ Registration submitted successfully! Please wait for verification. You will be notified via email/phone.');
        navigate('/hospital/login');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      // ============================================
      // STEP 0: BASIC INFORMATION
      // ============================================
      case 0:
        return (
          <div>
            <h3 style={sectionTitle}>🏥 Hospital Basic Information</h3>
            <div style={grid2Col}>
              <div>
                <label style={labelStyle}>Hospital Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} required placeholder="Enter hospital name" />
              </div>
              <div>
                <label style={labelStyle}>Registration Number *</label>
                <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} style={inputStyle} required placeholder="Medical council registration" />
              </div>
              <div>
                <label style={labelStyle}>Hospital Type *</label>
                <select name="type" value={formData.type} onChange={handleChange} style={inputStyle}>
                  <option value="multi_specialty">Multi-Specialty</option>
                  <option value="super_specialty">Super-Specialty</option>
                  <option value="single_specialty">Single Specialty</option>
                  <option value="general">General Hospital</option>
                  <option value="nursing_home">Nursing Home</option>
                  <option value="clinic">Clinic</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Ownership *</label>
                <select name="ownership" value={formData.ownership} onChange={handleChange} style={inputStyle}>
                  <option value="private">Private</option>
                  <option value="government">Government</option>
                  <option value="trust">Trust/Charitable</option>
                  <option value="corporate">Corporate Chain</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Established Year</label>
                <input type="number" name="establishedYear" value={formData.establishedYear} onChange={handleChange} style={inputStyle} placeholder="e.g., 1983" min="1900" max="2026" />
              </div>
            </div>
            
            {/* Accreditations */}
            <div style={{ marginTop: '1rem' }}>
              <label style={labelStyle}>Accreditations</label>
              <div style={checkboxGrid}>
                {accreditationOptions.map(acc => (
                  <label key={acc} style={checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.accreditations.includes(acc)}
                      onChange={() => handleMultiSelect('accreditations', acc)}
                    />
                    {acc}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder="Describe your hospital, facilities, specialties, and services..." />
            </div>
          </div>
        );

      // ============================================
      // STEP 1: CONTACT & LOCATION
      // ============================================
      case 1:
        return (
          <div>
            <h3 style={sectionTitle}>📞 Contact Details</h3>
            <div style={grid2Col}>
              <div>
                <label style={labelStyle}>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} required placeholder="hospital@example.com" />
              </div>
              <div>
                <label style={labelStyle}>Phone (for WhatsApp updates) *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} required placeholder="+91 9876543210" />
              </div>
              <div>
                <label style={labelStyle}>Alternate Phone</label>
                <input type="tel" name="alternatePhone" value={formData.alternatePhone} onChange={handleChange} style={inputStyle} placeholder="Alternate contact number" />
              </div>
              <div>
                <label style={labelStyle}>Emergency Phone</label>
                <input type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} style={inputStyle} placeholder="24x7 emergency number" />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleChange} style={inputStyle} placeholder="https://www.yourhospital.com" />
              </div>
            </div>

            <h3 style={{ ...sectionTitle, marginTop: '1.5rem' }}>📍 Address</h3>
            <div style={grid2Col}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Address Line 1 *</label>
                <input type="text" name="address.line1" value={formData.address.line1} onChange={handleChange} style={inputStyle} required placeholder="Building/Street" />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Address Line 2</label>
                <input type="text" name="address.line2" value={formData.address.line2} onChange={handleChange} style={inputStyle} placeholder="Area/Locality" />
              </div>
              <div>
                <label style={labelStyle}>City *</label>
                <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} style={inputStyle} required placeholder="City" />
              </div>
              <div>
                <label style={labelStyle}>State *</label>
                <input type="text" name="address.state" value={formData.address.state} onChange={handleChange} style={inputStyle} required placeholder="State" />
              </div>
              <div>
                <label style={labelStyle}>Pincode *</label>
                <input type="text" name="address.pincode" value={formData.address.pincode} onChange={handleChange} style={inputStyle} required placeholder="6-digit pincode" maxLength="6" />
              </div>
              <div>
                <label style={labelStyle}>Landmark</label>
                <input type="text" name="address.landmark" value={formData.address.landmark} onChange={handleChange} style={inputStyle} placeholder="Nearby landmark" />
              </div>
            </div>
          </div>
        );

      // ============================================
      // STEP 2: FACILITIES & TECHNOLOGY
      // ============================================
      case 2:
        return (
          <div>
            <h3 style={sectionTitle}>🏥 Facilities & Infrastructure</h3>
            
            {/* Bed Count */}
            <div style={{ ...grid2Col, marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Total Beds *</label>
                <input type="number" name="bedCount" value={formData.bedCount} onChange={handleChange} style={inputStyle} min="0" />
              </div>
              <div>
                <label style={labelStyle}>ICU Beds</label>
                <input type="number" name="icuBeds" value={formData.icuBeds} onChange={handleChange} style={inputStyle} min="0" />
              </div>
              <div>
                <label style={labelStyle}>Ventilators</label>
                <input type="number" name="ventilatorCount" value={formData.ventilatorCount} onChange={handleChange} style={inputStyle} min="0" />
              </div>
              <div>
                <label style={labelStyle}>Emergency Beds</label>
                <input type="number" name="emergencyBeds" value={formData.emergencyBeds} onChange={handleChange} style={inputStyle} min="0" />
              </div>
            </div>

            {/* Emergency & Critical Care */}
            <div style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🚨 Emergency & Critical Care</h4>
              <div style={checkboxGrid}>
                <label style={checkboxLabel}>
                  <input type="checkbox" name="emergencyServices" checked={formData.emergencyServices} onChange={handleChange} />
                  24x7 Emergency Services
                </label>
                <label style={checkboxLabel}>
                  <input type="checkbox" name="traumaCenter" checked={formData.traumaCenter} onChange={handleChange} />
                  Trauma Center
                </label>
                <label style={checkboxLabel}>
                  <input type="checkbox" name="strokeReady" checked={formData.strokeReady} onChange={handleChange} />
                  Stroke Ready
                </label>
                <label style={checkboxLabel}>
                  <input type="checkbox" name="cardiacEmergency" checked={formData.cardiacEmergency} onChange={handleChange} />
                  Cardiac Emergency
                </label>
              </div>
            </div>

            {/* Ambulance */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={checkboxLabel}>
                <input type="checkbox" name="ambulanceAvailable" checked={formData.ambulanceAvailable} onChange={handleChange} />
                Ambulance Available
              </label>
              {formData.ambulanceAvailable && (
                <input type="number" name="ambulanceCount" value={formData.ambulanceCount} onChange={handleChange} style={{ ...inputStyle, width: '100px', marginLeft: '1rem' }} placeholder="Count" min="1" />
              )}
            </div>

            {/* Facilities Multi-select */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Facilities</label>
              <div style={chipGrid}>
                {facilityOptions.map(fac => (
                  <span
                    key={fac}
                    onClick={() => handleMultiSelect('facilities', fac)}
                    style={{
                      ...chipStyle,
                      backgroundColor: formData.facilities.includes(fac) ? '#d1fae5' : '#f3f4f6',
                      border: formData.facilities.includes(fac) ? '2px solid #10b981' : '1px solid #e5e7eb',
                      color: formData.facilities.includes(fac) ? '#065f46' : '#374151'
                    }}
                  >
                    {formData.facilities.includes(fac) ? '✅ ' : ''}{fac}
                  </span>
                ))}
              </div>
            </div>

            {/* Technology Multi-select */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Technology & Equipment</label>
              <div style={chipGrid}>
                {technologyOptions.map(tech => (
                  <span
                    key={tech}
                    onClick={() => handleMultiSelect('technology', tech)}
                    style={{
                      ...chipStyle,
                      backgroundColor: formData.technology.includes(tech) ? '#eff6ff' : '#f3f4f6',
                      border: formData.technology.includes(tech) ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                      color: formData.technology.includes(tech) ? '#1e40af' : '#374151'
                    }}
                  >
                    {formData.technology.includes(tech) ? '✅ ' : ''}{tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Amenities Multi-select */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Amenities</label>
              <div style={chipGrid}>
                {amenityOptions.map(am => (
                  <span
                    key={am}
                    onClick={() => handleMultiSelect('amenities', am)}
                    style={{
                      ...chipStyle,
                      backgroundColor: formData.amenities.includes(am) ? '#fef3c7' : '#f3f4f6',
                      border: formData.amenities.includes(am) ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                      color: formData.amenities.includes(am) ? '#92400e' : '#374151'
                    }}
                  >
                    {formData.amenities.includes(am) ? '✅ ' : ''}{am}
                  </span>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Specialties</label>
              <div style={chipGrid}>
                {specialtyOptions.map(spec => (
                  <span
                    key={spec}
                    onClick={() => handleMultiSelect('specialties', spec)}
                    style={{
                      ...chipStyle,
                      backgroundColor: formData.specialties.includes(spec) ? '#f3e8ff' : '#f3f4f6',
                      border: formData.specialties.includes(spec) ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                      color: formData.specialties.includes(spec) ? '#5b21b6' : '#374151'
                    }}
                  >
                    {formData.specialties.includes(spec) ? '✅ ' : ''}{spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Other Services */}
            <div style={checkboxGrid}>
              <label style={checkboxLabel}>
                <input type="checkbox" name="labTestsAvailable" checked={formData.labTestsAvailable} onChange={handleChange} />
                In-house Lab Tests Available
              </label>
              <label style={checkboxLabel}>
                <input type="checkbox" name="pharmacy24x7" checked={formData.pharmacy24x7} onChange={handleChange} />
                Pharmacy 24x7
              </label>
            </div>
          </div>
        );

      // ============================================
      // STEP 3: OPD & PRICING
      // ============================================
      case 3:
        return (
          <div>
            <h3 style={sectionTitle}>⏰ OPD Timings</h3>
            <div style={grid2Col}>
              <div>
                <label style={labelStyle}>Morning Start</label>
                <input type="time" name="opdTimings.morning.start" value={formData.opdTimings.morning.start} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Morning End</label>
                <input type="time" name="opdTimings.morning.end" value={formData.opdTimings.morning.end} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Evening Start</label>
                <input type="time" name="opdTimings.evening.start" value={formData.opdTimings.evening.start} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Evening End</label>
                <input type="time" name="opdTimings.evening.end" value={formData.opdTimings.evening.end} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <h3 style={{ ...sectionTitle, marginTop: '1.5rem' }}>💰 OPD Consultation Fees (₹)</h3>
            <div style={grid2Col}>
              <div>
                <label style={labelStyle}>General Consultation</label>
                <input type="number" name="opdFee.general" value={formData.opdFee.general} onChange={handleChange} style={inputStyle} min="0" placeholder="₹" />
              </div>
              <div>
                <label style={labelStyle}>Specialist Consultation</label>
                <input type="number" name="opdFee.specialist" value={formData.opdFee.specialist} onChange={handleChange} style={inputStyle} min="0" placeholder="₹" />
              </div>
              <div>
                <label style={labelStyle}>Super Specialist</label>
                <input type="number" name="opdFee.superSpecialist" value={formData.opdFee.superSpecialist} onChange={handleChange} style={inputStyle} min="0" placeholder="₹" />
              </div>
              <div>
                <label style={labelStyle}>Online Booking Discount (%)</label>
                <input type="number" name="onlineBookingDiscount" value={formData.onlineBookingDiscount} onChange={handleChange} style={inputStyle} min="0" max="50" placeholder="%" />
              </div>
            </div>

            <h3 style={{ ...sectionTitle, marginTop: '1.5rem' }}>🏥 IPD Room Pricing (Per Day ₹)</h3>
            <div style={grid2Col}>
              <div>
                <label style={labelStyle}>General Ward</label>
                <input type="number" name="ipdPricing.generalWard" value={formData.ipdPricing.generalWard} onChange={handleChange} style={inputStyle} min="0" placeholder="₹" />
              </div>
              <div>
                <label style={labelStyle}>Semi-Private</label>
                <input type="number" name="ipdPricing.semiPrivate" value={formData.ipdPricing.semiPrivate} onChange={handleChange} style={inputStyle} min="0" placeholder="₹" />
              </div>
              <div>
                <label style={labelStyle}>Private Room</label>
                <input type="number" name="ipdPricing.private" value={formData.ipdPricing.private} onChange={handleChange} style={inputStyle} min="0" placeholder="₹" />
              </div>
              <div>
                <label style={labelStyle}>Deluxe Room</label>
                <input type="number" name="ipdPricing.deluxe" value={formData.ipdPricing.deluxe} onChange={handleChange} style={inputStyle} min="0" placeholder="₹" />
              </div>
              <div>
                <label style={labelStyle}>ICU (Per Day)</label>
                <input type="number" name="ipdPricing.icu" value={formData.ipdPricing.icu} onChange={handleChange} style={inputStyle} min="0" placeholder="₹" />
              </div>
              <div>
                <label style={labelStyle}>ICU with Ventilator</label>
                <input type="number" name="ipdPricing.icuWithVentilator" value={formData.ipdPricing.icuWithVentilator} onChange={handleChange} style={inputStyle} min="0" placeholder="₹" />
              </div>
            </div>
          </div>
        );

      // ============================================
      // STEP 4: DOCTORS
      // ============================================
      case 4:
        return (
          <div>
            <h3 style={sectionTitle}>👨‍⚕️ Doctors</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }}>
              Add doctors practicing at your hospital. You can add more later or upload via Excel.
            </p>
            
            <div style={grid4Col}>
              <input type="text" placeholder="Doctor Name *" id="docName" style={inputStyle} />
              <input type="text" placeholder="Specialization *" id="docSpecialization" style={inputStyle} />
              <input type="text" placeholder="Qualification" id="docQualification" style={inputStyle} />
              <input type="number" placeholder="Fee (₹)" id="docFee" style={inputStyle} />
              <input type="text" placeholder="Experience (e.g., 15 years)" id="docExperience" style={inputStyle} />
              <input type="text" placeholder="Languages (comma separated)" id="docLanguages" style={inputStyle} />
              <select id="docGender" style={inputStyle}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <button
                onClick={() => {
                  const name = document.getElementById('docName').value;
                  const specialization = document.getElementById('docSpecialization').value;
                  if (name && specialization) {
                    handleArrayAdd('doctors', {
                      name,
                      specialization,
                      qualification: document.getElementById('docQualification').value,
                      consultationFee: parseInt(document.getElementById('docFee').value) || 0,
                      experience: document.getElementById('docExperience').value,
                      languages: document.getElementById('docLanguages').value.split(',').map(l => l.trim()).filter(Boolean),
                      gender: document.getElementById('docGender').value
                    });
                    ['docName', 'docSpecialization', 'docQualification', 'docFee', 'docExperience', 'docLanguages'].forEach(id => {
                      document.getElementById(id).value = '';
                    });
                  }
                }}
                style={{ padding: '0.6rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ➕ Add Doctor
              </button>
            </div>

            {formData.doctors.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Added Doctors ({formData.doctors.length})</p>
                {formData.doctors.map((doc, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', marginBottom: '0.25rem' }}>
                    <div>
                      <strong>{doc.name}</strong> - {doc.specialization}
                      {doc.qualification && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}> ({doc.qualification})</span>}
                      <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>₹{doc.consultationFee}</span>
                    </div>
                    <button onClick={() => handleArrayRemove('doctors', index)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // ============================================
      // STEP 5: SCHEMES & INSURANCE
      // ============================================
      case 5:
        return (
          <div>
            <h3 style={sectionTitle}>💠 Government Schemes Accepted</h3>
            <div style={checkboxGrid}>
              {schemeOptions.map(scheme => (
                <label key={scheme.value} style={checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.schemesAccepted.includes(scheme.value)}
                    onChange={() => handleMultiSelect('schemesAccepted', scheme.value)}
                  />
                  {scheme.label}
                </label>
              ))}
            </div>

            <h3 style={{ ...sectionTitle, marginTop: '1.5rem' }}>🛡️ Insurance Accepted</h3>
            <p style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
              Select insurance companies you have tie-ups with
            </p>
            <div style={{ ...chipGrid, maxHeight: '200px', overflowY: 'auto' }}>
              {commonInsurances.map(ins => (
                <span
                  key={ins}
                  onClick={() => handleMultiSelect('insuranceAccepted', ins)}
                  style={{
                    ...chipStyle,
                    backgroundColor: formData.insuranceAccepted.includes(ins) ? '#eff6ff' : '#f3f4f6',
                    border: formData.insuranceAccepted.includes(ins) ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    color: formData.insuranceAccepted.includes(ins) ? '#1e40af' : '#374151'
                  }}
                >
                  {formData.insuranceAccepted.includes(ins) ? '✅ ' : ''}{ins}
                </span>
              ))}
            </div>

            <h3 style={{ ...sectionTitle, marginTop: '1.5rem' }}>💳 Payment & Cashless</h3>
            <div style={checkboxGrid}>
              <label style={checkboxLabel}>
                <input type="checkbox" name="cashlessAvailable" checked={formData.cashlessAvailable} onChange={handleChange} />
                Cashless Available
              </label>
              <label style={checkboxLabel}>
                <input type="checkbox" name="tpaDeskAvailable" checked={formData.tpaDeskAvailable} onChange={handleChange} />
                TPA Desk Available
              </label>
              <label style={checkboxLabel}>
                <input type="checkbox" name="reimbursementAccepted" checked={formData.reimbursementAccepted} onChange={handleChange} />
                Reimbursement Accepted
              </label>
              <label style={checkboxLabel}>
                <input type="checkbox" name="emiAvailable" checked={formData.emiAvailable} onChange={handleChange} />
                EMI Available
              </label>
            </div>
          </div>
        );

      // ============================================
      // STEP 6: DOCUMENTS
      // ============================================
      case 6:
        return (
          <div>
            <h3 style={sectionTitle}>📄 Documents Upload</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }}>
              Upload required documents for verification. Allowed: PDF, JPG, PNG (Max 5MB each)
            </p>
            
            <div style={grid1Col}>
              {[
                { label: 'Registration Certificate *', key: 'reg_cert' },
                { label: 'PAN Card', key: 'pan' },
                { label: 'GST Certificate', key: 'gst' },
                { label: 'NOC Certificate', key: 'noc' },
                { label: 'NABH/JCI Certificate (if applicable)', key: 'accreditation' },
                { label: 'Hospital Photos (Exterior)', key: 'photo_exterior' },
                { label: 'Hospital Photos (Interior)', key: 'photo_interior' }
              ].map((doc, idx) => (
                <div key={idx} style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    {doc.label}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={inputStyle}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleArrayAdd('documents', { type: doc.key, name: doc.label, file: file.name, size: file.size });
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            {formData.documents.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Uploaded Files ({formData.documents.length})</p>
                {formData.documents.map((doc, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.25rem', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    <span>📎 {doc.name} - {doc.file}</span>
                    <button onClick={() => handleArrayRemove('documents', index)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // ============================================
      // STEP 7: VERIFICATION & PASSWORD
      // ============================================
      case 7:
        return (
          <div>
            <h3 style={sectionTitle}>📱 Phone Verification</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }}>
              Verify your phone number: <strong>{formData.phone || 'Not provided'}</strong>
            </p>
            
            {!otpVerified ? (
              <div>
                {!otpSent ? (
                  <button
                    onClick={handleSendOTP}
                    disabled={loading || !formData.phone}
                    style={{ padding: '0.75rem 2rem', backgroundColor: formData.phone ? '#10b981' : '#d1d5db', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: formData.phone ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}
                  >
                    {loading ? 'Sending...' : '📱 Send OTP'}
                  </button>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength="6"
                        placeholder="Enter OTP"
                        style={{ ...inputStyle, width: '200px', textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.25rem' }}
                      />
                      <button
                        onClick={handleVerifyOTP}
                        disabled={loading}
                        style={{ padding: '0.6rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        {loading ? 'Verifying...' : '✅ Verify'}
                      </button>
                    </div>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : (
                        <button onClick={handleSendOTP} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>
                          📤 Resend OTP
                        </button>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ backgroundColor: '#d1fae5', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                ✅ Phone verified successfully!
              </div>
            )}

            <h3 style={{ ...sectionTitle, marginTop: '1.5rem' }}>🔑 Account Password</h3>
            <div style={grid2Col}>
              <div>
                <label style={labelStyle}>Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} style={inputStyle} required placeholder="Min 8 characters" minLength="8" />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password *</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={inputStyle} required placeholder="Re-enter password" />
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>❌ Passwords do not match</p>
                )}
              </div>
            </div>

            {/* Summary */}
            <div style={{ marginTop: '1.5rem', backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '0.5rem' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📋 Registration Summary</h4>
              <div style={{ fontSize: '0.8rem', display: 'grid', gap: '0.25rem' }}>
                <p>✅ Hospital: {formData.name || 'Not filled'}</p>
                <p>✅ Type: {formData.type} | Ownership: {formData.ownership}</p>
                <p>✅ Contact: {formData.phone || 'N/A'} | {formData.email || 'N/A'}</p>
                <p>✅ Beds: {formData.bedCount} | ICU: {formData.icuBeds} | Ventilators: {formData.ventilatorCount}</p>
                <p>✅ Specialties: {formData.specialties.length} | Doctors: {formData.doctors.length}</p>
                <p>✅ Schemes: {formData.schemesAccepted.length} | Insurance: {formData.insuranceAccepted.length}</p>
                <p>✅ Documents: {formData.documents.length} uploaded</p>
                <p>✅ Phone Verified: {otpVerified ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <ProviderRegistrationLayout
      title="Hospital Registration"
      subtitle="Register your hospital and start accepting patients online"
      icon="🏥"
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      loading={loading}
      onSubmit={handleSubmit}
    >
      {renderStep()}
    </ProviderRegistrationLayout>
  );
};

// ============================================
// STYLES
// ============================================

const sectionTitle = {
  fontWeight: 'bold',
  marginBottom: '1rem',
  fontSize: '1.1rem',
  color: '#1f2937'
};

const labelStyle = {
  display: 'block',
  fontWeight: 'bold',
  fontSize: '0.8rem',
  marginBottom: '0.25rem',
  color: '#374151'
};

const inputStyle = {
  width: '100%',
  padding: '0.6rem',
  borderRadius: '0.5rem',
  border: '1px solid #d1d5db',
  fontSize: '0.9rem',
  backgroundColor: 'white',
  outline: 'none',
  boxSizing: 'border-box'
};

const grid2Col = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem'
};

const grid4Col = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr',
  gap: '0.5rem',
  marginBottom: '1rem'
};

const grid1Col = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '0.75rem'
};

const checkboxGrid = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem'
};

const checkboxLabel = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  fontSize: '0.875rem'
};

const chipGrid = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem'
};

const chipStyle = {
  padding: '0.35rem 0.75rem',
  borderRadius: '9999px',
  fontSize: '0.8rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  userSelect: 'none'
};

export default HospitalRegister;