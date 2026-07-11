import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const CorporateEnrollment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const planId = location.state?.planId;

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    companyGST: '',
    companyPAN: '',
    employeeCount: '',
    hrName: '',
    hrEmail: '',
    hrPhone: '',
    planName: '',
    planType: 'group_health',
    coverageAmount: '',
    premiumPerEmployee: '',
    startDate: '',
    employees: [{ name: '', email: '', phone: '', department: '', designation: '' }]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmployeeChange = (index, field, value) => {
    const updated = [...formData.employees];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, employees: updated }));
  };

  const addEmployee = () => {
    setFormData(prev => ({
      ...prev,
      employees: [...prev.employees, { name: '', email: '', phone: '', department: '', designation: '' }]
    }));
  };

  const removeEmployee = (index) => {
    if (formData.employees.length > 1) {
      setFormData(prev => ({
        ...prev,
        employees: prev.employees.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to continue');
        navigate('/login');
        return;
      }

      const res = await axios.post('/api/corporate/register', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert('✅ Corporate plan submitted successfully! Our team will verify it.');
        navigate('/corporate');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting corporate plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', borderRadius: '1rem', padding: '2rem', color: 'white', marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>🏢 Enroll Your Company</h1>
          <p style={{ opacity: 0.9 }}>Get corporate health plan for your employees</p>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {/* Progress Steps */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            {['Company Details', 'Plan Details', 'Employees'].map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: step > i ? '#10b981' : step === i + 1 ? '#2563eb' : '#e5e7eb',
                  color: step > i || step === i + 1 ? 'white' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: step === i + 1 ? 'bold' : 'normal' }}>{label}</span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Company Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Company Name *</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>GST Number</label>
                  <input type="text" name="companyGST" value={formData.companyGST} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>PAN Number *</label>
                  <input type="text" name="companyPAN" value={formData.companyPAN} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Number of Employees *</label>
                  <input type="number" name="employeeCount" value={formData.employeeCount} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>HR Contact Name *</label>
                  <input type="text" name="hrName" value={formData.hrName} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>HR Email *</label>
                  <input type="email" name="hrEmail" value={formData.hrEmail} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>HR Phone *</label>
                  <input type="tel" name="hrPhone" value={formData.hrPhone} onChange={handleChange} style={inputStyle} required />
                </div>
              </div>
              <button onClick={() => setStep(2)} style={{ marginTop: '1.5rem', padding: '10px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Next →</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Plan Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Plan Name *</label>
                  <input type="text" name="planName" value={formData.planName} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Plan Type</label>
                  <select name="planType" value={formData.planType} onChange={handleChange} style={inputStyle}>
                    <option value="group_health">Group Health</option>
                    <option value="group_wellness">Group Wellness</option>
                    <option value="group_insurance">Group Insurance</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Coverage Amount (₹) *</label>
                  <input type="number" name="coverageAmount" value={formData.coverageAmount} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Premium per Employee (₹) *</label>
                  <input type="number" name="premiumPerEmployee" value={formData.premiumPerEmployee} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Start Date *</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} style={inputStyle} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button onClick={() => setStep(1)} style={{ padding: '10px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>← Back</button>
                <button onClick={() => setStep(3)} style={{ padding: '10px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Next →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Employee Details</h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Add at least 1 employee (you can add more later)</p>

              {formData.employees.map((emp, index) => (
                <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>Employee {index + 1}</strong>
                    {formData.employees.length > 1 && <button onClick={() => removeEmployee(index)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input type="text" placeholder="Name *" value={emp.name} onChange={(e) => handleEmployeeChange(index, 'name', e.target.value)} style={inputStyle} required />
                    <input type="email" placeholder="Email *" value={emp.email} onChange={(e) => handleEmployeeChange(index, 'email', e.target.value)} style={inputStyle} required />
                    <input type="tel" placeholder="Phone *" value={emp.phone} onChange={(e) => handleEmployeeChange(index, 'phone', e.target.value)} style={inputStyle} required />
                    <input type="text" placeholder="Department" value={emp.department} onChange={(e) => handleEmployeeChange(index, 'department', e.target.value)} style={inputStyle} />
                    <input type="text" placeholder="Designation" value={emp.designation} onChange={(e) => handleEmployeeChange(index, 'designation', e.target.value)} style={inputStyle} />
                  </div>
                </div>
              ))}

              <button onClick={addEmployee} style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '1rem' }}>➕ Add Employee</button>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={() => setStep(2)} style={{ padding: '10px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>← Back</button>
                <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {loading ? 'Submitting...' : '✅ Submit for Verification'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  fontSize: '0.9rem',
  backgroundColor: 'white',
  outline: 'none'
};

export default CorporateEnrollment;
