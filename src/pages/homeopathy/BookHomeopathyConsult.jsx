import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const BookHomeopathyConsult = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = location.state?.doctor || { _id: doctorId, name: 'Doctor', fee: 500, specialization: '', clinicName: '' };
  const consultationType = location.state?.consultationType || 'online';

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ patientName: '', phone: '', email: '', date: '', time: '', symptoms: '', age: '', gender: '' });
  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  const timeSlots = [];
  for (let h = 6; h <= 22; h++) for (let m = 0; m < 60; m += 30) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const dh = h > 12 ? h - 12 : h;
    timeSlots.push(`${dh}:${m.toString().padStart(2, '0')} ${ampm}`);
  }

  const today = new Date().toISOString().split('T')[0];
  const fee = doctor.fee || 500;
  const platformFee = Math.round(fee * 0.15);
  const discountAmount = discountInfo?.discountAmount || 0;
  const gst = Math.round((fee - discountAmount) * 0.18);
  const finalAmount = fee - discountAmount + gst;

  const validateDiscount = () => {
    const codes = { HOMEO20: { discountAmount: Math.round(fee * 0.2) }, FIRST100: { discountAmount: 100 }, NATURO15: { discountAmount: Math.round(fee * 0.15) } };
    const code = discountCode.toUpperCase();
    if (codes[code]) { setDiscountInfo(codes[code]); alert(`✅ Discount applied! Save ₹${codes[code].discountAmount}`); }
    else { alert('Invalid code'); setDiscountCode(''); }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (!form.patientName || !form.phone || !form.date || !form.time) { alert('Fill all required fields'); return; }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      const bookingId = 'HMB' + Date.now();
      const data = {
        bookingId, doctorId: doctor._id, doctorName: doctor.name, consultationType,
        patientName: form.patientName, phone: form.phone, email: form.email,
        date: form.date, time: form.time, symptoms: form.symptoms,
        fee, discountAmount, gst, platformFee, finalAmount,
        paymentMethod: 'razorpay', paymentId: 'PAY' + Date.now(),
        paymentStatus: 'paid', paidAt: new Date().toISOString(),
        clinicName: doctor.clinicName, specialization: doctor.specialization
      };
      setBookingData(data);
      setStep(3);
      setLoading(false);
      window.scrollTo(0, 0);
    }, 2000);
  };

  if (step === 3 && bookingData) {
    return (
      <div style={{ maxWidth:'600px',margin:'0 auto',padding:'2rem',textAlign:'center' }}>
        <div style={{ fontSize:'5rem' }}>✅</div>
        <h1 style={{ color:'#059669' }}>Booking Confirmed!</h1>
        <p style={{ color:'#64748b' }}>Confirmation sent to {bookingData.phone}</p>
        <div style={{ backgroundColor:'white',borderRadius:'1rem',padding:'1.5rem',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',textAlign:'left',margin:'1.5rem 0' }}>
          {[['Booking ID',bookingData.bookingId],['Doctor',bookingData.doctorName],['Type',bookingData.consultationType==='online'?'💻 Online':'🏥 Clinic'],['Patient',bookingData.patientName],['Date',new Date(bookingData.date).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})],['Time',bookingData.time],['Fee','₹'+bookingData.fee],['Discount','-₹'+bookingData.discountAmount],['GST','₹'+bookingData.gst],['Platform Fee','₹'+bookingData.platformFee],['Total Paid','₹'+bookingData.finalAmount]].map(([l,v],i)=>(<div key={i} style={{ display:'flex',justifyContent:'space-between',padding:'0.5rem 0',borderBottom:'1px solid #e2e8f0' }}><span style={{ color:'#64748b' }}>{l}</span><span style={{ fontWeight:'bold' }}>{v}</span></div>))}
        </div>
        <div style={{ display:'flex',gap:'1rem',justifyContent:'center' }}>
          <button onClick={()=>navigate('/homeopathy')} style={{ padding:'0.75rem 2rem',backgroundColor:'#7C3AED',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold' }}>🏠 Home</button>
          <button onClick={()=>navigate('/homeopathy/doctors')} style={{ padding:'0.75rem 2rem',backgroundColor:'#059669',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold' }}>🔍 Find More</button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ maxWidth:'600px',margin:'0 auto',padding:'1.5rem' }}>
        <button onClick={()=>setStep(1)} style={{ padding:'0.5rem 1rem',backgroundColor:'#f1f5f9',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold',marginBottom:'1rem' }}>← Back</button>
        <h1 style={{ fontSize:'1.5rem',fontWeight:'bold',color:'#1e293b',marginBottom:'1rem' }}>💳 Payment</h1>
        <div style={{ backgroundColor:'white',borderRadius:'1rem',padding:'1.5rem',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',marginBottom:'1rem' }}>
          <h3 style={{ fontWeight:'bold',marginBottom:'1rem' }}>Order Summary</h3>
          <div style={{ display:'flex',justifyContent:'space-between',padding:'0.3rem 0',color:'#64748b' }}><span>Consultation Fee</span><span>₹{fee}</span></div>
          {discountAmount>0&&<div style={{ display:'flex',justifyContent:'space-between',padding:'0.3rem 0',color:'#059669' }}><span>Discount</span><span>-₹{discountAmount}</span></div>}
          <div style={{ display:'flex',justifyContent:'space-between',padding:'0.3rem 0',color:'#64748b' }}><span>Platform Fee (15%)</span><span>₹{platformFee}</span></div>
          <div style={{ display:'flex',justifyContent:'space-between',padding:'0.3rem 0',color:'#64748b' }}><span>GST (18%)</span><span>₹{gst}</span></div>
          <hr /><div style={{ display:'flex',justifyContent:'space-between',padding:'0.5rem 0',fontWeight:'bold',fontSize:'1.2rem' }}><span>Total</span><span style={{ color:'#7C3AED' }}>₹{finalAmount}</span></div>
        </div>
        <div style={{ backgroundColor:'#f8fafc',borderRadius:'0.5rem',padding:'1rem',marginBottom:'1rem',fontSize:'0.9rem' }}>
          <p><strong>Patient:</strong> {form.patientName}</p><p><strong>Date:</strong> {new Date(form.date).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</p><p><strong>Time:</strong> {form.time}</p><p><strong>Doctor:</strong> {doctor.name}</p>
        </div>
        <button onClick={handlePayment} disabled={loading} style={{ width:'100%',padding:'1rem',backgroundColor:loading?'#a5b4fc':'#7C3AED',color:'white',border:'none',borderRadius:'0.5rem',fontWeight:'bold',fontSize:'1.1rem',cursor:'pointer' }}>{loading?'⏳ Processing...':`💳 Pay ₹${finalAmount}`}</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:'600px',margin:'0 auto',padding:'1.5rem' }}>
      <button onClick={()=>navigate(-1)} style={{ padding:'0.5rem 1rem',backgroundColor:'#f1f5f9',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold',marginBottom:'1rem' }}>← Back</button>
      <div style={{ display:'flex',justifyContent:'center',gap:'2rem',marginBottom:'1.5rem' }}>
        {[1,2,3].map(s=>(<div key={s} style={{ textAlign:'center' }}><div style={{ width:'35px',height:'35px',borderRadius:'50%',backgroundColor:step>=s?'#7C3AED':'#e2e8f0',color:step>=s?'white':'#64748b',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold',margin:'0 auto 0.3rem' }}>{step>s?'✓':s}</div><span style={{ fontSize:'0.75rem',color:step>=s?'#7C3AED':'#64748b' }}>{s===1?'Details':s===2?'Payment':'Confirm'}</span></div>))}
      </div>
      <h1 style={{ fontSize:'1.5rem',fontWeight:'bold',color:'#1e293b',marginBottom:'1rem' }}>📞 Book {consultationType==='online'?'Online':'Clinic'} Consultation</h1>
      <div style={{ backgroundColor:'#ede9fe',borderRadius:'0.75rem',padding:'1rem',marginBottom:'1.5rem' }}>
        <p style={{ fontWeight:'bold' }}>👨‍⚕️ {doctor.name}</p>
        <p style={{ color:'#7C3AED',fontSize:'0.9rem' }}>{doctor.specialization}</p>
        {doctor.clinicName&&<p style={{ color:'#64748b',fontSize:'0.85rem' }}>🏥 {doctor.clinicName}</p>}
        <p style={{ fontWeight:'bold',color:'#7C3AED',marginTop:'0.5rem' }}>Fee: ₹{fee}</p>
      </div>
      <form onSubmit={handleContinue} style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
        <input required placeholder="Full Name *" value={form.patientName} onChange={e=>setForm({...form,patientName:e.target.value})} style={inp} />
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem' }}><input required placeholder="Phone *" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={inp} /><input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={inp} /></div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem' }}><input placeholder="Age" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} style={inp} /><select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} style={inp}><option value="">Gender</option><option>Male</option><option>Female</option><option>Other</option></select></div>
        <div><label style={{ fontWeight:'bold',display:'block',marginBottom:'0.3rem',fontSize:'0.9rem' }}>📅 Date *</label><input required type="date" value={form.date} min={today} onChange={e=>setForm({...form,date:e.target.value})} style={inp} /></div>
        <div><label style={{ fontWeight:'bold',display:'block',marginBottom:'0.3rem',fontSize:'0.9rem' }}>🕐 Time *</label><select required value={form.time} onChange={e=>setForm({...form,time:e.target.value})} style={inp}><option value="">Select Time</option>{timeSlots.map(t=><option key={t}>{t}</option>)}</select></div>
        <div><label style={{ fontWeight:'bold',display:'block',marginBottom:'0.3rem',fontSize:'0.9rem' }}>🏷️ Discount Code</label><div style={{ display:'flex',gap:'0.5rem' }}><input placeholder="e.g. HOMEO20" value={discountCode} onChange={e=>setDiscountCode(e.target.value.toUpperCase())} style={{...inp,flex:1}} /><button type="button" onClick={validateDiscount} style={{ padding:'0.75rem 1.5rem',backgroundColor:discountInfo?'#059669':'#7C3AED',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer' }}>{discountInfo?'✅':'Apply'}</button></div>{discountInfo&&<p style={{ color:'#059669',fontSize:'0.85rem',marginTop:'0.3rem' }}>✅ {discountCode}: Save ₹{discountInfo.discountAmount}</p>}</div>
        <textarea placeholder="Describe your symptoms / health concerns..." value={form.symptoms} onChange={e=>setForm({...form,symptoms:e.target.value})} style={{...inp,height:'80px',resize:'vertical'}} />
        <button type="submit" style={{ padding:'1rem',backgroundColor:'#7C3AED',color:'white',border:'none',borderRadius:'0.5rem',fontWeight:'bold',fontSize:'1rem',cursor:'pointer' }}>Continue to Payment → ₹{finalAmount}</button>
      </form>
    </div>
  );
};

const inp = { padding:'0.75rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0',fontSize:'1rem',width:'100%',boxSizing:'border-box' };
export default BookHomeopathyConsult;