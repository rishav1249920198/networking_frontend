import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Monitor, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(0); // 0: email, 1: otp, 2: new password, 3: done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const sendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(1);
      toast.success('OTP sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Just move to next step (OTP verified server-side during reset)
      setStep(2);
    } catch (err) {
      setError('Invalid OTP.');
    } finally { setLoading(false); }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword: password });
      setStep(3);
      toast.success('Password reset successfully. You can now login.');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F4FF', padding: '2rem 1rem' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '420px', background: 'white', borderRadius: '24px', boxShadow: '0 8px 40px rgba(10,36,99,0.1)', padding: '2.5rem' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #0A2463, #00B4D8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Monitor size={18} color="white" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0A2463', fontFamily: 'Outfit, sans-serif' }}>IGCIM Computer Centre</div>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#dc2626' }}>
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.form key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={sendOTP}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0A2463', fontFamily: 'Outfit', marginBottom: '0.25rem' }}>Forgot Password</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.75rem' }}>Enter your registered email to receive an OTP</p>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="email" className="form-input" style={{ paddingLeft: '2.75rem' }} placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }} disabled={loading}>
                {loading ? <span className="spinner" style={{ width: '18px', height: '18px' }} /> : <>Send OTP <ArrowRight size={16} /></>}
              </button>
            </motion.form>
          )}

          {step === 1 && (
            <motion.form key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={verifyOTP}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0A2463', fontFamily: 'Outfit', marginBottom: '0.25rem' }}>Enter OTP</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.75rem' }}>6-digit OTP sent to <strong>{email}</strong></p>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">OTP Code</label>
                <input type="text" className="form-input" placeholder="000000" maxLength={6} value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem', fontWeight: '700' }} required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }} disabled={loading}>
                {loading ? <span className="spinner" style={{ width: '18px', height: '18px' }} /> : <>Verify <CheckCircle size={16} /></>}
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={resetPassword}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0A2463', fontFamily: 'Outfit', marginBottom: '0.25rem' }}>New Password</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.75rem' }}>Create a strong new password</p>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type={showPassword ? 'text' : 'password'} className="form-input" style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                    placeholder="Min. 8 characters" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }} disabled={loading}>
                {loading ? <span className="spinner" style={{ width: '18px', height: '18px' }} /> : <>Reset Password</>}
              </button>
            </motion.form>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle size={32} color="white" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0A2463', fontFamily: 'Outfit', marginBottom: '0.5rem' }}>Password Reset!</h2>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>Your password has been updated successfully.</p>
              <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}>
                Go to Login <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.8rem', textDecoration: 'none' }}>← Back to Login</Link>
      </motion.div>
    </div>
  );
}
