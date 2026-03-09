import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Menu, X, Sun, Moon, ChevronRight, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

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
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(10,36,99,0.08)' : 'none',
        boxShadow: scrolled ? '0 4px 20px rgba(10,36,99,0.08)' : 'none',
        transition: 'all 0.4s',
        padding: '0 0',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #0A2463, #00B4D8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Monitor size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0A2463', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1 }}>IGCIM</div>
            <div style={{ fontSize: '0.65rem', color: '#00B4D8', fontWeight: '600', letterSpacing: '0.05em' }}>COMPUTER CENTRE</div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={{ gap: '0.25rem', alignItems: 'center' }} className="hidden md:flex">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} style={{ padding: '0.5rem 1rem', borderRadius: '8px', color: '#0A2463', fontWeight: '500', fontSize: '0.9rem', textDecoration: 'none', transition: 'all 0.25s' }}
              onMouseEnter={e => { e.target.style.background = 'rgba(10,36,99,0.06)'; e.target.style.color = '#00B4D8'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#0A2463'; }}>
              {l.label}
            </a>
          ))}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => setDark(d => !d)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid rgba(10,36,99,0.12)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A2463' }}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button onClick={() => navigate('/dashboard')} className="btn-accent" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Dashboard
              </button>
              <button onClick={logout} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <LogIn size={15} /> Login
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <UserPlus size={15} /> Register
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(o => !o)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid rgba(10,36,99,0.12)', background: 'transparent', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', color: '#0A2463' }} className="flex md:hidden">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ background: 'white', borderTop: '1px solid rgba(10,36,99,0.08)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navLinks.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} style={{ padding: '0.75rem', borderRadius: '10px', color: '#0A2463', fontWeight: '500', textDecoration: 'none', display: 'block' }}>
                {l.label}
              </a>
            ))}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Link to="/login" className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '0.65rem' }}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.65rem' }}>Register</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
