import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Monitor, GraduationCap, Shield, Users, TrendingUp, CheckCircle,
  ArrowRight, Star, Phone, Mail, MapPin, Award, Zap, Lock,
  Facebook, Twitter, Instagram, Linkedin
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/client';

const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const stagger = { show: { transition: { staggerChildren: 0.15 } } };

export default function HomePage() {
  const [courses, setCourses] = useState({ computer: [], university: [] });

  useEffect(() => {
    // Fetch courses from API
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
    { icon: <TrendingUp size={28} />, title: 'Earn IGCIM Credits', desc: 'Earn branded IC credits for every successful admission through your code. High conversion rates.', color: '#F4A261' },
  ];

  const security = [
    { icon: <Lock size={24} />, title: 'OTP Verified Sign-up', desc: 'Every registration requires email OTP verification. No fake accounts possible.' },
    { icon: <CheckCircle size={24} />, title: 'Admin Approved Admissions', desc: 'No commission generated automatically. Every admission reviewed by admin.' },
    { icon: <TrendingUp size={24} />, title: 'Real-Time Dashboard', desc: 'Track every referral, admission status, and earnings live. Full transparency.' },
    { icon: <Zap size={24} />, title: 'Secure Payments', desc: 'Bank-level encryption. Payment proof uploaded and stored securely.' },
  ];

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      <Navbar />

      {/* ============ HERO SECTION ============ */}
      <section style={{
        minHeight: '100vh', background: 'linear-gradient(135deg, #0A2463 0%, #1a3a8f 40%, #00B4D8 100%)',
        display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden',
        paddingTop: 'clamp(80px, 15vh, 120px)', paddingBottom: 'clamp(3rem, 10vh, 6rem)'
      }}
        className="wave-bg">
        {/* Decor Blobs */}
        <div style={{ position: 'absolute', top: '10vh', right: '5%', width: 'clamp(200px, 40vw, 500px)', height: 'clamp(200px, 40vw, 500px)', borderRadius: '50%', background: 'rgba(0,180,216,0.15)', filter: 'blur(80px)', animation: 'float 6s ease-in-out infinite', zIndex: -1 }} />
        <div style={{ position: 'absolute', bottom: '-20vh', left: '-5%', width: 'clamp(150px, 30vw, 400px)', height: 'clamp(150px, 30vw, 400px)', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite reverse', zIndex: -1 }} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 var(--space-page)', width: '100%' }}>
          <motion.div variants={stagger} initial="hidden" animate="show">
            {/* NAAC Badge */}
            <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '999px', padding: '0.5rem 1.25rem', marginBottom: '2rem' }}>
              <Award size={16} color="#F4A261" />
              <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: '600' }}>ISO 9001:2015 Certified Institute</span>
            </motion.div>

            <motion.h1 variants={fadeUp} style={{ color: 'white', marginBottom: '1.5rem', textShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              Empowering{' '}
              <span className="gradient-text" style={{ filter: 'brightness(1.5)', color: '#00B4D8' }}>
                Education
              </span>
              {' '}&amp; Rewards
            </motion.h1>

            <motion.p variants={fadeUp} style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '600px' }}>
              Join IGCIM and refer students to earn Reward Points (IC) while they learn.
              The most trusted, secure and gamified computer education network in India.
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-accent" style={{ padding: '1rem 2.5rem', width: 'auto' }}>
                Join Free Now <ArrowRight size={18} />
              </Link>
              <Link to="/admission" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.95rem 2.5rem', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.3)', color: 'white', textDecoration: 'none', fontWeight: '600', fontSize: '1rem', transition: 'all 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                Apply Admission
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '2rem', marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              {[['10k+', 'Students'], ['₹5Cr+', 'Paid'], ['50+', 'Courses']].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', color: '#00B4D8', fontFamily: 'Outfit, sans-serif' }}>{val}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.075em' }}>{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:flex" style={{ justifyContent: 'center', perspective: '1000px' }}>
            <div style={{ width: '100%', maxWidth: '420px', background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '32px', padding: 'clamp(1.5rem, 4vw, 2.5rem)', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: 'var(--shadow-lg)', transform: 'rotateY(-5deg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.12)', borderRadius: '16px', padding: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #00B4D8, #0096BB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={22} color="white" />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: '800', fontSize: '1.4rem' }}>1,250 IC</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: '500' }}>Active Rewards</div>
                </div>
              </div>
              {[
                { label: '8 Fresh Referrals', color: '#0A2463' },
                { label: '3 Awaiting Approval', color: '#F4A261' },
                { label: '5 Verified Admissions', color: '#10b981' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600' }}>{item.label}</span>
                </div>
              ))}
              <div style={{ background: 'linear-gradient(135deg, rgba(0,180,216,0.25), rgba(0,180,216,0.1))', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(0,180,216,0.3)' }}>
                <CheckCircle size={18} color="#00B4D8" />
                <span style={{ color: '#00B4D8', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.025em' }}>CODE: IGCIM_PRO</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ COMPUTER COURSES ============ */}
      <section id="courses" style={{ padding: 'var(--space-section) var(--space-page)', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--accent)20', borderRadius: '12px' }}>
                <Monitor size={28} color="var(--primary)" />
              </div>
              <h2 style={{ color: 'var(--text-primary)' }}>Professional Computer Courses</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-body)', fontWeight: '500' }}>Industry-recognized certifications to kickstart your tech journey</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '2rem' }}>
            {courses.computer.length > 0 ? courses.computer.map((c, i) => (
              <motion.div key={c.id} variants={fadeUp}
                style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', transition: 'all 0.3s', cursor: 'pointer' }}
                whileHover={{ y: -6, boxShadow: 'var(--shadow)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `linear-gradient(135deg, ${['#0A2463','#00B4D8','#10b981'][i%3]}, ${['#1a3a8f','#48CAE4','#059669'][i%3]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Monitor size={22} color="white" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>{c.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>{c.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent)' }}>₹{(c.fee || 0).toLocaleString()}</span>
                  {c.duration_months && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.duration_months} months</span>}
                </div>

              </motion.div>
            )) : (
              <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <Monitor size={32} style={{ margin: '0 auto 1rem', color: 'var(--border)' }} />
                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No courses available currently.</p>
              </div>
            )}
          </motion.div>

          {/* University Programs */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginTop: '5rem', marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--accent)20', borderRadius: '12px' }}>
                <GraduationCap size={28} color="var(--primary)" />
              </div>
              <h2 style={{ color: 'var(--text-primary)' }}>Global University Programs</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-body)', fontWeight: '500' }}>Degree programs with global recognition and NAAC A+ accreditation</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '2rem' }}>
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
      <section id="how-it-works" style={{ padding: 'var(--space-section) var(--space-page)', background: 'var(--bg-card)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>How Referral Works</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7, fontSize: 'var(--font-body)' }}>Our transparent, multi-step process ensures you get rewarded for every successful admission.</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '2rem' }}>
            {howItWorks.map((item, i) => (
              <motion.div key={i} variants={fadeUp}
                style={{ textAlign: 'center', padding: '2rem 1.5rem', borderRadius: '20px', background: 'var(--bg)', border: '1px solid var(--border)', position: 'relative' }}
                whileHover={{ y: -5, background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '28px', height: '28px', borderRadius: '50%', background: item.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700' }}>{i + 1}</div>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: `${item.color}15`, border: `2px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: item.color }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ SECURITY SECTION ============ */}
      <section style={{ padding: 'var(--space-section) var(--space-page)', background: 'linear-gradient(135deg, #0A2463 0%, #1a3a8f 100%)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Secure &amp; Transparent System</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto', fontSize: 'var(--font-body)' }}>Your earnings and data are protected with industry-standard encryption and human-verified approvals.</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '2rem' }}>
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
      <footer style={{ background: 'linear-gradient(to bottom, #061647, #030a21)', padding: 'clamp(3rem, 10vw, 5rem) var(--space-page) 2rem', position: 'relative', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '3rem', marginBottom: '4rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #0A2463, #00B4D8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,180,216,0.3)' }}>
                  <Monitor size={20} color="white" />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: '800', fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', letterSpacing: '1px' }}>IGCIM</div>
                  <div style={{ color: '#00B4D8', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.5px' }}>COMPUTER CENTRE</div>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                Empowering students through quality education, recognized certifications, and a globally scalable referral earning system.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {[<Facebook size={18}/>, <Twitter size={18}/>, <Instagram size={18}/>, <Linkedin size={18}/>].map((icon, i) => (
                  <a key={i} href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', transition: 'all 0.3s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#00B4D8'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,180,216,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ color: 'white', fontWeight: '700', marginBottom: '1.5rem', fontSize: '1rem', fontFamily: 'Outfit' }}>Quick Links</h4>
              {[
                { name: 'Home', path: '/' },
                { name: 'Courses', path: '/#courses' },
                { name: 'How Referral Works', path: '/#how-it-works' },
                { name: 'Student Login', path: '/login' },
                { name: 'Register Free', path: '/register' }
              ].map(l => (
                <div key={l.name} style={{ marginBottom: '0.85rem' }}>
                  {l.path.startsWith('/#') ? (
                    <a href={l.path} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block', transition: 'all 0.3s ease' }}
                      onMouseEnter={e => { e.target.style.color = '#00B4D8'; e.target.style.transform = 'translateX(5px)'; }}
                      onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.6)'; e.target.style.transform = 'translateX(0)'; }}>
                      {l.name}
                    </a>
                  ) : (
                    <Link to={l.path} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block', transition: 'all 0.3s ease' }}
                      onMouseEnter={e => { e.target.style.color = '#00B4D8'; e.target.style.transform = 'translateX(5px)'; }}
                      onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.6)'; e.target.style.transform = 'translateX(0)'; }}>
                      {l.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div>
              <h4 style={{ color: 'white', fontWeight: '700', marginBottom: '1.5rem', fontSize: '1rem', fontFamily: 'Outfit' }}>Contact Us</h4>
              {[
                { icon: <Phone size={16} />, text: '+91 93390-28840' },
                { icon: <Mail size={16} />, text: 'info@igcim.com' },
                { icon: <MapPin size={16} />, text: 'IGCIM Computer Centre, India' },
              ].map(c => (
                <div key={c.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00B4D8', flexShrink: 0 }}>
                    {c.icon}
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: '4px', lineHeight: 1.5 }}>{c.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>© {new Date().getFullYear()} IGCIM Computer Centre. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['Privacy Policy', 'Terms of Service'].map(l => (
                <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#00B4D8'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
