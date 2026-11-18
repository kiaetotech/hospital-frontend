// D:\hospital-frontend\src\pages\CreditScoreSimulator.jsx
// ============================================
// PUBLIC CREDIT SCORE SIMULATOR
// ============================================
// Standalone top-of-funnel educational page.
// User enters basic financial info → gets estimated CIBIL range + improvement tips.
// NOT a real bureau pull — this is an educational estimate only.
// CTA links to /healthcare-emi-calculator and /financing.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ============================================
// SCORING HEURISTIC (transparent, deterministic)
// ============================================
// Base = 650 (mid-range). Each factor adds/subtracts points. Clamped 300-900.
// This is an ESTIMATE for educational purposes only — NOT a real CIBIL score.
const computeEstimatedScore = ({ income, existingEmi, age, employment, utilization }) => {
  let score = 650;
  const reasons = [];

  // --- FOIR (Fixed Obligation to Income Ratio) ---
  const emiRatio = income > 0 ? existingEmi / income : 1;
  if (emiRatio <= 0.2) {
    score += 70;
    reasons.push({ factor: 'Low existing EMI burden (FOIR ≤ 20%)', impact: +70, type: 'good' });
  } else if (emiRatio <= 0.4) {
    score += 30;
    reasons.push({ factor: 'Moderate EMI burden (FOIR ≤ 40%)', impact: +30, type: 'neutral' });
  } else if (emiRatio <= 0.6) {
    score -= 30;
    reasons.push({ factor: 'High EMI burden (FOIR > 40%)', impact: -30, type: 'bad' });
  } else {
    score -= 80;
    reasons.push({ factor: 'Very high EMI burden (FOIR > 60%)', impact: -80, type: 'bad' });
  }

  // --- Credit card utilization ---
  if (utilization <= 30) {
    score += 50;
    reasons.push({ factor: 'Healthy credit utilization (≤30%)', impact: +50, type: 'good' });
  } else if (utilization <= 50) {
    score += 10;
    reasons.push({ factor: 'Moderate utilization (30-50%)', impact: +10, type: 'neutral' });
  } else if (utilization <= 75) {
    score -= 40;
    reasons.push({ factor: 'High utilization (50-75%)', impact: -40, type: 'bad' });
  } else {
    score -= 70;
    reasons.push({ factor: 'Very high utilization (>75%)', impact: -70, type: 'bad' });
  }

  // --- Employment ---
  if (employment === 'salaried') {
    score += 40;
    reasons.push({ factor: 'Salaried (stable income)', impact: +40, type: 'good' });
  } else if (employment === 'business') {
    score += 20;
    reasons.push({ factor: 'Business owner (stable but variable)', impact: +20, type: 'neutral' });
  } else if (employment === 'self-employed') {
    score += 10;
    reasons.push({ factor: 'Self-employed', impact: +10, type: 'neutral' });
  } else if (employment === 'student') {
    score -= 30;
    reasons.push({ factor: 'Student (limited credit history)', impact: -30, type: 'bad' });
  } else if (employment === 'unemployed') {
    score -= 80;
    reasons.push({ factor: 'Unemployed (no income)', impact: -80, type: 'bad' });
  }

  // --- Age ---
  if (age >= 25 && age <= 55) {
    score += 30;
    reasons.push({ factor: 'Prime earning age (25-55)', impact: +30, type: 'good' });
  } else if (age >= 21 && age < 25) {
    score += 5;
    reasons.push({ factor: 'Early career (21-24)', impact: +5, type: 'neutral' });
  } else if (age > 55 && age <= 65) {
    score -= 10;
    reasons.push({ factor: 'Late career (55-65)', impact: -10, type: 'neutral' });
  } else if (age > 65) {
    score -= 30;
    reasons.push({ factor: 'Post-retirement (65+)', impact: -30, type: 'bad' });
  }

  // --- Income band bonus ---
  if (income >= 100000) {
    score += 40;
    reasons.push({ factor: 'High income (₹1L+/month)', impact: +40, type: 'good' });
  } else if (income >= 50000) {
    score += 20;
    reasons.push({ factor: 'Above-average income', impact: +20, type: 'good' });
  } else if (income > 0 && income < 20000) {
    score -= 20;
    reasons.push({ factor: 'Low income (<₹20K/month)', impact: -20, type: 'bad' });
  }

  score = Math.max(300, Math.min(900, score));
  return {
    score,
    lower: Math.max(300, score - 20),
    upper: Math.min(900, score + 20),
    reasons,
  };
};

const getScoreBand = (score) => {
  if (score >= 750) return { label: 'Excellent', color: '#059669', bg: '#d1fae5', emoji: '🌟', desc: 'Best rates and highest loan amounts.' };
  if (score >= 700) return { label: 'Good', color: '#0891b2', bg: '#cffafe', emoji: '✅', desc: 'Competitive rates available.' };
  if (score >= 650) return { label: 'Fair', color: '#d97706', bg: '#fef3c7', emoji: '⚠️', desc: 'Some options, rates may be higher.' };
  if (score >= 550) return { label: 'Poor', color: '#dc2626', bg: '#fee2e2', emoji: '❌', desc: 'Limited options. Improving will help.' };
  return { label: 'Very Poor', color: '#991b1b', bg: '#fecaca', emoji: '🚫', desc: 'Most lenders reject. Focus on rebuilding.' };
};

const getPersonalizedTips = (inputs, reasons) => {
  const tips = [];
  const bad = reasons.filter((r) => r.type === 'bad');
  if (bad.some((f) => /FOIR|EMI burden/.test(f.factor))) {
    tips.push('Pay down existing EMIs first — reducing FOIR below 40% can boost your score substantially.');
  }
  if (bad.some((f) => /utilization/.test(f.factor))) {
    tips.push('Reduce credit card utilization below 30% of your limit — visible within 1-2 billing cycles.');
  }
  if (bad.some((f) => /Student|Unemployed/.test(f.factor))) {
    tips.push('Consider a co-applicant with stable income (parent/spouse) to strengthen your application.');
  }
  if (bad.some((f) => /Post-retirement/.test(f.factor))) {
    tips.push('Joint applications with an earning family member help for post-retirement borrowers.');
  }
  if (bad.some((f) => /Low income/.test(f.factor))) {
    tips.push('Increase your documented income where possible — it directly impacts eligibility.');
  }
  tips.push('Pay all EMIs and credit card bills on time — payment history is 35% of your CIBIL score.');
  tips.push('Avoid multiple loan applications in a short period — each hard inquiry lowers your score temporarily.');
  tips.push('Keep your oldest credit card open — credit history length is 15% of your score.');
  return tips.slice(0, 5);
};

export default function CreditScoreSimulator() {
  const [inputs, setInputs] = useState({
    income: '', existingEmi: '', age: '', employment: '', utilization: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleCalculate = () => {
    const income = Number(inputs.income);
    const existingEmi = Number(inputs.existingEmi) || 0;
    const age = Number(inputs.age);
    const utilization = Number(inputs.utilization) || 0;
    if (!income || income <= 0) return setError('Please enter your monthly income.');
    if (!age || age < 18 || age > 100) return setError('Please enter a valid age (18-100).');
    if (!inputs.employment) return setError('Please select your employment type.');
    if (utilization < 0 || utilization > 100) return setError('Credit utilization must be between 0 and 100.');
    setResult(computeEstimatedScore({ income, existingEmi, age, employment: inputs.employment, utilization }));
  };

  const handleReset = () => {
    setInputs({ income: '', existingEmi: '', age: '', employment: '', utilization: '' });
    setResult(null);
    setError('');
  };

  const band = result ? getScoreBand(result.score) : null;
  const tips = result ? getPersonalizedTips(inputs, result.reasons) : [];

  const s = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)', padding: '2rem 1rem' },
    wrapper: { maxWidth: '900px', margin: '0 auto' },
    header: { textAlign: 'center', marginBottom: '2rem' },
    title: { fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' },
    subtitle: { fontSize: '1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' },
    card: { background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '1.5rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' },
    label: { display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' },
    input: { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
    select: { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', background: 'white', boxSizing: 'border-box' },
    button: { padding: '0.875rem 2rem', background: '#059669', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', marginTop: '1.5rem', width: '100%' },
    buttonSecondary: { padding: '0.875rem 2rem', background: 'transparent', color: '#059669', border: '1.5px solid #059669', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', marginTop: '1rem', width: '100%' },
    error: { padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.875rem', marginTop: '1rem' },
    scoreCard: { textAlign: 'center', padding: '2rem', borderRadius: '16px', background: band?.bg || '#f1f5f9', marginBottom: '1.5rem' },
    scoreEmoji: { fontSize: '3rem', marginBottom: '0.5rem' },
    scoreLabel: { fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
    scoreNumber: { fontSize: '3rem', fontWeight: 800, color: band?.color || '#0f172a', lineHeight: 1.1 },
    scoreBand: { fontSize: '1.25rem', fontWeight: 700, color: band?.color || '#0f172a', marginTop: '0.5rem' },
    scoreDesc: { fontSize: '0.95rem', color: '#475569', marginTop: '0.75rem' },
    reasonItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' },
    tipItem: { padding: '0.75rem 1rem', background: '#f8fafc', borderLeft: '4px solid #059669', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.9rem', color: '#334155' },
    cta: { display: 'inline-block', padding: '0.875rem 2rem', background: '#059669', color: 'white', textDecoration: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, marginTop: '1rem', marginRight: '0.5rem' },
    disclaimer: { fontSize: '0.8rem', color: '#64748b', textAlign: 'center', marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' },
  };

  return (
    <div style={s.container}>
      <div style={s.wrapper}>
        <div style={s.header}>
          <h1 style={s.title}>💳 Credit Score Simulator</h1>
          <p style={s.subtitle}>Estimate your CIBIL score range based on income, existing EMIs, and credit habits. Know your eligibility before applying.</p>
        </div>

        {!result && (
          <div style={s.card}>
            <div style={s.grid}>
              <div><label style={s.label}>Monthly Income (₹) *</label><input type="number" placeholder="e.g. 50000" value={inputs.income} onChange={(e) => handleChange('income', e.target.value)} style={s.input} /></div>
              <div><label style={s.label}>Existing Monthly EMIs (₹)</label><input type="number" placeholder="0 if none" value={inputs.existingEmi} onChange={(e) => handleChange('existingEmi', e.target.value)} style={s.input} /></div>
              <div><label style={s.label}>Age *</label><input type="number" placeholder="e.g. 30" value={inputs.age} onChange={(e) => handleChange('age', e.target.value)} style={s.input} /></div>
              <div><label style={s.label}>Employment Type *</label>
                <select value={inputs.employment} onChange={(e) => handleChange('employment', e.target.value)} style={s.select}>
                  <option value="">Select...</option>
                  <option value="salaried">Salaried</option>
                  <option value="self-employed">Self-employed</option>
                  <option value="business">Business owner</option>
                  <option value="student">Student</option>
                  <option value="unemployed">Currently unemployed</option>
                </select>
              </div>
              <div><label style={s.label}>Credit Card Utilization (%)</label><input type="number" placeholder="e.g. 25" min="0" max="100" value={inputs.utilization} onChange={(e) => handleChange('utilization', e.target.value)} style={s.input} /></div>
            </div>
            {error && <div style={s.error}>{error}</div>}
            <button style={s.button} onClick={handleCalculate}>🔮 Estimate My Credit Score</button>
          </div>
        )}

        {result && (
          <>
            <div style={s.scoreCard}>
              <div style={s.scoreEmoji}>{band?.emoji}</div>
              <div style={s.scoreLabel}>Estimated CIBIL Range</div>
              <div style={s.scoreNumber}>{result.lower} – {result.upper}</div>
              <div style={s.scoreBand}>{band?.label}</div>
              <div style={s.scoreDesc}>{band?.desc}</div>
            </div>

            <div style={s.card}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>📊 What's influencing your estimate</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0 0' }}>
                {result.reasons.map((r, i) => (
                  <li key={i} style={s.reasonItem}>
                    <span style={{ color: '#334155' }}>{r.factor}</span>
                    <span style={{ color: r.type === 'good' ? '#059669' : r.type === 'bad' ? '#dc2626' : '#d97706', fontWeight: 700 }}>{r.impact > 0 ? '+' : ''}{r.impact} pts</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={s.card}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>💡 How to improve your score</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0 0' }}>
                {tips.map((tip, i) => (<li key={i} style={s.tipItem}>{tip}</li>))}
              </ul>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/healthcare-emi-calculator" style={s.cta}>Check Loan Eligibility →</Link>
              <Link to="/financing" style={{ ...s.cta, background: 'transparent', color: '#059669', border: '1.5px solid #059669' }}>Apply for Loan</Link>
              <button style={s.buttonSecondary} onClick={handleReset}>← Recalculate</button>
            </div>
          </>
        )}

        <div style={s.disclaimer}>
          ⚠️ <strong>Disclaimer:</strong> This is an educational estimate, not your actual CIBIL score. Actual scores from CIBIL, Experian, or CRIF use complex models including payment history, credit mix, and other factors. For your real score, check <a href="https://www.cibil.com/freecibilscore" target="_blank" rel="noopener noreferrer" style={{ color: '#059669' }}>CIBIL.com</a>.
        </div>
      </div>
    </div>
  );
}