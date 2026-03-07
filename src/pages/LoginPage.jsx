import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Monitor, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'student') navigate('/dashboard/student');
      else if (user.role === 'staff') navigate('/dashboard/staff');
      else navigate('/dashboard/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0A2463 0%, #1a3a8f 60%, #00B4D8 100%)' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: 'white' }} className="hidden lg:flex">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Monitor size={26} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', fontFamily: 'Outfit, sans-serif' }}>IGCIM</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>COMPUTER CENTRE</div>
            </div>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'Outfit, sans-serif', marginBottom: '1rem', lineHeight: 1.2 }}>Welcome Back!</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '380px', lineHeight: 1.75, marginBottom: '2.5rem' }}>
            Log in to access your dashboard, track referrals, and manage your earnings in real-time.
          </p>
          {[
            'Real-time referral tracking',
            'Instant commission updates',
            'Secure OTP-verified account',
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,180,216,0.3)', border: '1px solid #00B4D8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#00B4D8', fontSize: '0.75rem', fontWeight: '700' }}>✓</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{item}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div style={{ flex: '1 1 480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'white', maxWidth: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ width: '100%', maxWidth: '400px' }}>
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #0A2463, #00B4D8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Monitor size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0A2463', fontFamily: 'Outfit, sans-serif' }}>IGCIM</div>
              <div style={{ fontSize: '0.6rem', color: '#00B4D8', fontWeight: '600' }}>COMPUTER CENTRE</div>
            </div>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0A2463', fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>Sign In</h1>
          <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>Enter your credentials to access your account</p>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>
              <AlertCircle size={18} color="#dc2626" />
              <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="email" className="form-input" style={{ paddingLeft: '2.75rem' }} placeholder="your@email.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type={showPassword ? 'text' : 'password'} className="form-input" style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  placeholder="Enter password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
              <Link to="/forgot-password" style={{ color: '#00B4D8', fontSize: '0.875rem', fontWeight: '600', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '0.9rem' }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: '18px', height: '18px' }} /> : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.75rem', color: '#64748b', fontSize: '0.9rem' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: '#0A2463', fontWeight: '700', textDecoration: 'none' }}>Create Account</Link>
          </p>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', color: '#94a3b8', fontSize: '0.8rem', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
