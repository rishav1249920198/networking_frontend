import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Monitor, GraduationCap, Shield, Users, TrendingUp, CheckCircle,
  ArrowRight, Star, Phone, Mail, MapPin, Award, Zap, Lock
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/client';

const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const stagger = { show: { transition: { staggerChildren: 0.15 } } };

export default function HomePage() {
  const [courses, setCourses] = useState({ computer: [], university: [] });

  useEffect(() => {
    // Prevent Vercel caching to ensure fresh DB courses are always fetched
    api.get('/courses/public', {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }).then(res => {
      if (res.data.success) {
        const dataArray = res.data.data || [];
        setCourses({
          computer: dataArray.filter(c => c.category === 'computer'),
          university: dataArray.filter(c => c.category === 'university'),
        });
      }
    }).catch(err => {
      console.error('Failed to load courses:', err);
      setCourses({ computer: [], university: [] });
    });
  }, []);

  const howItWorks = [
    { icon: <Users size={28} />, title: 'Share Referral Code', desc: 'Get your unique IGCIM referral code after registration and share it with friends and family.', color: '#0A2463' },
    { icon: <GraduationCap size={28} />, title: 'Admission', desc: 'Referred student enrolls online or offline using your code. Admission goes for review.', color: '#00B4D8' },
    { icon: <Shield size={28} />, title: 'Admin Approved', desc: 'Our admin team verifies the admission ensuring accuracy and transparency.', color: '#10b981' },
    { icon: <TrendingUp size={28} />, title: 'Earn Commission', desc: 'Commission is credited to your account only after admin approval. Withdraw anytime.', color: '#F4A261' },
  ];

  const security = [
    { icon: <Lock size={24} />, title: 'OTP Verified Sign-up', desc: 'Every registration requires email OTP verification. No fake accounts possible.' },
    { icon: <CheckCircle size={24} />, title: 'Admin Approved Admissions', desc: 'No commission generated automatically. Every admission reviewed by admin.' },
    { icon: <TrendingUp size={24} />, title: 'Real-Time Dashboard', desc: 'Track every referral, admission status, and earnings live. Full transparency.' },
    { icon: <Zap size={24} />, title: 'Secure Payments', desc: 'Bank-level encryption. Payment proof uploaded and stored securely.' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ============ HERO SECTION ============ */}
      <section style={{
        minHeight: '100vh', background: 'linear-gradient(135deg, #0A2463 0%, #1a3a8f 40%, #00B4D8 100%)',
        display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden',
        paddingTop: '72px',
      }}
        className="wave-bg">
        {/* Animated background orbs */}
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(0,180,216,0.15)', filter: 'blur(60px)', animation: 'float 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(50px)', animation: 'float 8s ease-in-out infinite reverse' }} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center" style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1.5rem' }}>
          <motion.div variants={stagger} initial="hidden" animate="show">
            {/* NAAC Badge */}
            <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '999px', padding: '0.4rem 1rem', marginBottom: '1.5rem' }}>
              <Award size={16} color="#F4A261" />
              <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: '600' }}>NAAC A+ Accredited Edition</span>
            </motion.div>

            <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '900', color: 'white', lineHeight: 1.15, fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem' }}>
              Empowering{' '}
              <span style={{ background: 'linear-gradient(135deg, #00B4D8, #48CAE4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Education
              </span>
              {' '}&amp; Earnings
            </motion.h1>

            <motion.p variants={fadeUp} style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, marginBottom: '2rem', maxWidth: '480px' }}>
              Join IGCIM and refer students to earn commissions while they learn.
              Trusted, secure and future-ready educational network.
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-accent" style={{ fontSize: '1rem', padding: '0.9rem 2rem' }}>
                Get Started <ArrowRight size={18} />
              </Link>
              <Link to="/admission" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.9rem 2rem', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.35)', color: 'white', textDecoration: 'none', fontWeight: '600', fontSize: '1rem', transition: 'all 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                Apply Admission
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              {[['500+', 'Students'], ['₹50L+', 'Commissions Paid'], ['20+', 'Courses']].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#00B4D8', fontFamily: 'Outfit, sans-serif' }}>{val}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="float-animation" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '380px', height: '320px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #00B4D8, #0096BB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={20} color="white" />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: '700', fontSize: '1.2rem' }}>₹12,500</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Total Earnings</div>
                </div>
              </div>
              {[
                { label: '8 Total Referrals', color: '#0A2463' },
                { label: '3 Pending', color: '#F4A261' },
                { label: '5 Approved', color: '#10b981' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', fontWeight: '500' }}>{item.label}</span>
                </div>
              ))}
              <div style={{ background: 'linear-gradient(135deg, rgba(0,180,216,0.25), rgba(0,180,216,0.1))', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} color="#00B4D8" />
                <span style={{ color: '#00B4D8', fontSize: '0.8rem', fontWeight: '600' }}>Referral Code: IGCIM1234</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ COMPUTER COURSES ============ */}
      <section id="courses" style={{ padding: '5rem 1.5rem', background: '#F0F4FF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Monitor size={24} color="#0A2463" />
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0A2463', fontFamily: 'Outfit, sans-serif' }}>Popular Computer Courses</h2>
            </div>
            <p style={{ color: '#64748b' }}>Professional certifications for a digital career</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {courses.computer.length > 0 ? courses.computer.map((c, i) => (
              <motion.div key={c.id} variants={fadeUp}
                style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(10,36,99,0.08)', transition: 'all 0.3s', cursor: 'pointer' }}
                whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(10,36,99,0.12)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `linear-gradient(135deg, ${['#0A2463','#00B4D8','#10b981'][i%3]}, ${['#1a3a8f','#48CAE4','#059669'][i%3]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Monitor size={22} color="white" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A2463', marginBottom: '0.35rem' }}>{c.name}</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>{c.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: '#00B4D8' }}>₹{(c.fee || 0).toLocaleString()}</span>
                  {c.duration_months && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.duration_months} months</span>}
                </div>

              </motion.div>
            )) : (
              <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px solid rgba(10,36,99,0.08)', color: '#64748b' }}>
                <Monitor size={32} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No courses available currently.</p>
              </div>
            )}
          </motion.div>

          {/* University Programs */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginTop: '4rem', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <GraduationCap size={24} color="#0A2463" />
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0A2463', fontFamily: 'Outfit, sans-serif' }}>University Programs</h2>
            </div>
            <p style={{ color: '#64748b' }}>Degree programs with recognition and accreditation</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {courses.university.length > 0 ? courses.university.map((c, i) => (
              <motion.div key={c.id} variants={fadeUp}
                style={{ background: 'linear-gradient(135deg, #0A2463, #1a3a8f)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,180,216,0.2)', cursor: 'pointer' }}
                whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(10,36,99,0.3)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,180,216,0.2)', border: '1px solid rgba(0,180,216,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <GraduationCap size={22} color="#00B4D8" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white', marginBottom: '0.35rem' }}>{c.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', lineHeight: 1.5 }}>{c.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: '#00B4D8' }}>₹{(c.fee || 0).toLocaleString()}/yr</span>
                  {c.duration_months && <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{c.duration_months/12} years</span>}
                </div>

              </motion.div>
            )) : (
              <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: 'linear-gradient(135deg, #0A2463, #1a3a8f)', borderRadius: '16px', border: '1px solid rgba(0,180,216,0.2)', color: 'rgba(255,255,255,0.7)' }}>
                <GraduationCap size={32} style={{ margin: '0 auto 1rem', color: 'rgba(255,255,255,0.3)' }} />
                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No courses available currently.</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" style={{ padding: '5rem 1.5rem', background: 'white' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '900', fontFamily: 'Outfit, sans-serif', color: '#0A2463', marginBottom: '1rem' }}>How Referral Works</h2>
            <p style={{ color: '#64748b', maxWidth: '550px', margin: '0 auto', lineHeight: 1.7 }}>A transparent, simple process. Share → Refer → Earn. Every step verified for accuracy.</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {howItWorks.map((item, i) => (
              <motion.div key={i} variants={fadeUp}
                style={{ textAlign: 'center', padding: '2rem 1.5rem', borderRadius: '20px', background: '#F0F4FF', border: '1px solid rgba(10,36,99,0.06)', position: 'relative' }}
                whileHover={{ y: -5, background: 'white', boxShadow: '0 12px 30px rgba(10,36,99,0.1)' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '28px', height: '28px', borderRadius: '50%', background: item.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700' }}>{i + 1}</div>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: `${item.color}15`, border: `2px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: item.color }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0A2463', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ SECURITY SECTION ============ */}
      <section style={{ padding: '5rem 1.5rem', background: 'linear-gradient(135deg, #0A2463 0%, #1a3a8f 100%)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '900', fontFamily: 'Outfit, sans-serif', color: 'white', marginBottom: '1rem' }}>Secure &amp; Transparent System</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '550px', margin: '0 auto' }}>Your earnings and data are protected at every step with industry-grade security.</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {security.map((item, i) => (
              <motion.div key={i} variants={fadeUp}
                style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '1.75rem' }}
                whileHover={{ background: 'rgba(255,255,255,0.12)', y: -4 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(0,180,216,0.2)', border: '1px solid rgba(0,180,216,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#00B4D8' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginTop: '4rem', padding: '3rem', background: 'rgba(0,180,216,0.12)', borderRadius: '24px', border: '1px solid rgba(0,180,216,0.25)' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>Ready to Start Earning?</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>Join thousands of students already earning through IGCIM referrals.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-accent" style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
                Register Free <ArrowRight size={18} />
              </Link>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.9rem 2.5rem', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.3)', color: 'white', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}>
                Already a Member?
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={{ background: '#061647', padding: '3rem 1.5rem 2rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #0A2463, #00B4D8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Monitor size={18} color="white" />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>IGCIM</div>
                  <div style={{ color: '#00B4D8', fontSize: '0.65rem', fontWeight: '600' }}>COMPUTER CENTRE</div>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.7 }}>Empowering students through quality education and a transparent referral-based earning system.</p>
            </div>

            {[
              {
                title: 'Quick Links',
                links: ['Home', 'Courses', 'How It Works', 'Login', 'Register'],
              },
              {
                title: 'Courses',
                links: ['ADCA', 'DCP', 'DWD', 'BCA', 'BBA'],
              },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ color: 'white', fontWeight: '700', marginBottom: '1rem', fontSize: '0.9rem' }}>{col.title}</h4>
                {col.links.map(l => (
                  <div key={l} style={{ marginBottom: '0.5rem' }}>
                    <a href="#" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#00B4D8'}
                      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>{l}</a>
                  </div>
                ))}
              </div>
            ))}

            <div>
              <h4 style={{ color: 'white', fontWeight: '700', marginBottom: '1rem', fontSize: '0.9rem' }}>Contact</h4>
              {[
                { icon: <Phone size={14} />, text: '+91 93390-28840' },
                { icon: <Mail size={14} />, text: 'info@igcim.com' },
                { icon: <MapPin size={14} />, text: 'IGCIM Computer Centre, India' },
              ].map(c => (
                <div key={c.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ color: '#00B4D8', marginTop: '2px', flexShrink: 0 }}>{c.icon}</div>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem' }}>{c.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>© {new Date().getFullYear()} IGCIM Computer Centre. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['Privacy Policy', 'Terms of Service'].map(l => (
                <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', textDecoration: 'none' }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
