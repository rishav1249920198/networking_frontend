import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import UnifiedIcon from './UnifiedIcon';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '#courses' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Apply Admission', href: '/admission' },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'var(--glass)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        boxShadow: scrolled ? 'var(--shadow)' : 'none',
        transition: 'all 0.4s',
        padding: '0 0',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #0A2463, #00B4D8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UnifiedIcon name="Monitor" size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1 }}>IGCIM</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: '600', letterSpacing: '0.05em' }} className="hidden xs:block">COMPUTER CENTRE</div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={{ gap: '0.75rem', alignItems: 'center' }} className="hidden lg:flex">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} style={{ padding: '0.5rem 1rem', borderRadius: '10px', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.85rem', textDecoration: 'none', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.target.style.background = 'var(--accent)20'; e.target.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-primary)'; }}>
              {l.label}
            </a>
          ))}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />

          {isAuthenticated ? (
            <div style={{ gap: '0.5rem', alignItems: 'center' }} className="hidden lg:flex">
              <button onClick={() => navigate('/dashboard')} className="btn-accent" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Dashboard
              </button>
              <button onClick={logout} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ gap: '0.4rem', alignItems: 'center' }} className="flex">
              <Link to="/login" className="btn-outline" style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', gap: '0.4rem' }}>
                <UnifiedIcon name="Login" size={15} /> <span className="hidden sm:inline">Login</span>
              </Link>
              <Link to="/register" className="btn-primary hidden xs:flex" style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', gap: '0.4rem' }}>
                <UnifiedIcon name="UserAdd" size={15} /> <span className="hidden sm:inline">Register</span>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(o => !o)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }} className="flex lg:hidden">
            {mobileOpen ? <UnifiedIcon name="CloseCircle" size={18} /> : <UnifiedIcon name="Menu" size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navLinks.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} style={{ padding: '0.75rem', borderRadius: '10px', color: 'var(--text-primary)', fontWeight: '500', textDecoration: 'none', display: 'block' }}>
                {l.label}
              </a>
            ))}
            {isAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="btn-accent" style={{ justifyContent: 'center', padding: '0.75rem' }}>Dashboard</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)', fontWeight: '600', cursor: 'pointer' }}>Logout</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '0.65rem' }}>Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.65rem' }}>Register</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
