import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import UnifiedIcon from '../components/UnifiedIcon';

const STEPS = ['Details', 'Verify OTP', 'Done'];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', referral_code: '' });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email: form.email, otp });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      await api.post('/auth/resend-otp', { email: form.email, purpose: 'register' });
      setError('New OTP sent to your email.');
    } catch (err) {
      setError('Failed to resend OTP.');
    }
  };

  const inputStyle = { paddingLeft: '2.75rem' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 'var(--space-page)', paddingTop: 'clamp(5.5rem, 12vh, 7rem)' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: 'min(100%, 520px)', margin: '0 auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: 'var(--shadow-lg)', padding: 'var(--space-card)', overflow: 'hidden' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #0A2463, #00B4D8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UnifiedIcon name="Monitor" size={18} color="white" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>IGCIM Computer Centre</div>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2.5rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: i < STEPS.length - 1 ? 1 : 'none', display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: i <= step ? 'linear-gradient(135deg, #0A2463, #00B4D8)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s', flexShrink: 0, boxShadow: i === step ? '0 0 15px rgba(0,180,216,0.3)' : 'none' }}>
                  {i < step ? <UnifiedIcon name="TickCircle" size={16} color="white" /> : <span style={{ color: i === step ? 'white' : '#94a3b8', fontSize: '0.8rem', fontWeight: '800' }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: i <= step ? 'var(--primary)' : '#94a3b8', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: '2px', background: i < step ? 'var(--accent)' : '#e2e8f0', margin: '0 0.5rem', marginTop: '-20px', transition: 'all 0.4s' }} />}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: error.includes('sent') ? '#d1fae5' : '#fee2e2', border: `1px solid ${error.includes('sent') ? '#6ee7b7' : '#fecaca'}`, borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: error.includes('sent') ? '#059669' : '#dc2626' }}>
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.form key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleRegister}>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Create Account</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>Join our network and start your future today</p>

              {[
                { key: 'name', label: 'Full Name', icon: 'User', type: 'text', placeholder: 'Your full name', required: true },
                { key: 'email', label: 'Email', icon: 'Direct', type: 'email', placeholder: 'your@email.com', required: true },
                { key: 'mobile', label: 'Mobile Number', icon: 'Call', type: 'tel', placeholder: '+91 XXXXXXXXXX', required: true },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">{field.label}</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}><UnifiedIcon name={field.icon} size={16} /></div>
                    <input type={field.type} className="form-input" style={inputStyle} placeholder={field.placeholder} required={field.required}
                      value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} />
                  </div>
                </div>
              ))}

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                    <UnifiedIcon name="Lock" size={16} />
                  </div>
                  <input type={showPassword ? 'text' : 'password'} className="form-input" style={{ ...inputStyle, paddingRight: '2.75rem' }}
                    placeholder="Min. 8 characters" minLength={8} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                    <UnifiedIcon name={showPassword ? 'EyeSlash' : 'Eye'} size={16} />
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label className="form-label">Referral Code <span style={{ color: '#94a3b8', fontWeight: '400' }}>(Optional)</span></label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                    <UnifiedIcon name="Key" size={16} />
                  </div>
                  <input type="text" className="form-input" style={inputStyle} placeholder="e.g. IGCIMA1B2"
                    value={form.referral_code} onChange={e => setForm({ ...form, referral_code: e.target.value.toUpperCase() })} />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={loading}>
                {loading ? <span className="spinner" style={{ width: '18px', height: '18px' }} /> : <>Register <UnifiedIcon name="ArrowRight" size={18} /></>}
              </button>

              <p style={{ textAlign: 'center', marginTop: '1.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
              </p>
            </motion.form>
          )}

          {step === 1 && (
            <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerifyOTP}>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Verify Email</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Enter the 6-digit OTP sent to <strong>{form.email}</strong>
              </p>

              <div style={{ marginBottom: '2rem' }}>
                <label className="form-label">OTP Code</label>
                <input type="text" className="form-input" placeholder="000000" maxLength={6} value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.75rem', fontWeight: '800' }} required />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={loading}>
                {loading ? <span className="spinner" style={{ width: '18px', height: '18px' }} /> : <>Verify OTP <UnifiedIcon name="TickCircle" size={18} /></>}
              </button>

              <button type="button" onClick={resendOTP} style={{ display: 'block', width: '100%', marginTop: '1.25rem', padding: '0.8rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
                Resend OTP
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
                <UnifiedIcon lib="lordicon" name="lupuorrc" size={40} color="white" trigger="hover" />
              </div>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Registration Complete!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.7 }}>Your account is now active. Log in to start your learning journey.</p>
              <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                Go to Login <UnifiedIcon name="ArrowRight" size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
