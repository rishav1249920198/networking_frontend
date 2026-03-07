import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function PublicAdmissionPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [form, setForm] = useState({
    student_name: '',
    student_mobile: '',
    student_email: '',
    address: '',
    course_id: '',
    referral_code: '',
    payment_mode: 'cash',
    payment_reference: '',
    payment_proof: null
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (form[key]) formData.append(key, form[key]);
    });

    try {
      await api.post('/admissions/public', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit admission request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F4FF' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', maxWidth: '400px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0A2463', marginBottom: '1rem', fontFamily: 'Outfit' }}>Success!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Your admission request has been submitted successfully. Our team will contact you shortly.</p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>Return to Home</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F0F4FF 0%, #e2e8f0 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ background: 'white', padding: '1rem 2rem', boxShadow: '0 2px 10px rgba(10,36,99,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #0A2463, #00B4D8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Monitor size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: '800', color: '#0A2463', fontFamily: 'Outfit', fontSize: '1.2rem', lineHeight: 1 }}>IGCIM</div>
            <div style={{ fontSize: '0.65rem', color: '#00B4D8', fontWeight: '700', letterSpacing: '0.05em' }}>COMPUTER CENTRE</div>
          </div>
        </Link>
        <Link to="/login" className="btn-outline" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Student Login</Link>
      </header>

      {/* Main Form Area */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: '24px', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '640px', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #0A2463, #1a3a8f)', padding: '2rem', color: 'white', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', fontFamily: 'Outfit', marginBottom: '0.5rem' }}>Online Admission</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Fill out the application below to secure your seat</p>
          </div>
          
          <div style={{ padding: '2.5rem' }}>
            {errorMsg && (
              <div style={{ background: '#fee2e2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '12px', color: '#dc2626', display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem' }}>
                <AlertCircle size={18} /> <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{errorMsg}</span>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>Loading courses...</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ flex: '1 1 250px' }}>
                    <label className="form-label">Full Name *</label>
                    <input type="text" className="form-input" required value={form.student_name} onChange={e => setForm({...form, student_name: e.target.value})} placeholder="John Doe" />
                  </div>
                  <div style={{ flex: '1 1 250px' }}>
                    <label className="form-label">Mobile Number *</label>
                    <input type="tel" className="form-input" required value={form.student_mobile} onChange={e => setForm({...form, student_mobile: e.target.value})} placeholder="+91 XXXXXXXXXX" />
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ flex: '1 1 250px' }}>
                    <label className="form-label">Email Address *</label>
                    <input type="email" className="form-input" required value={form.student_email} onChange={e => setForm({...form, student_email: e.target.value})} placeholder="johndoe@email.com" />
                  </div>
                  <div style={{ flex: '1 1 250px' }}>
                    <label className="form-label">Referral Code (Optional)</label>
                    <input type="text" className="form-input" value={form.referral_code} onChange={e => setForm({...form, referral_code: e.target.value.toUpperCase()})} placeholder="e.g. IGCIMA1B2" />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Full Address *</label>
                  <textarea className="form-input" required rows="2" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Enter your complete address"></textarea>
                </div>

                <div style={{ marginBottom: '2rem', borderTop: '1px solid rgba(10,36,99,0.08)', paddingTop: '1.5rem' }}>
                  <label className="form-label">Select Course *</label>
                  <select className="form-input" required value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})} style={{ fontWeight: '600', color: '#0A2463' }}>
                    <option value="">-- Choose a course --</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (Fee: ₹{parseFloat(c.fee).toLocaleString()})</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ flex: '1 1 250px' }}>
                     <label className="form-label">Payment Mode</label>
                     <select className="form-input" value={form.payment_mode} onChange={e => setForm({...form, payment_mode: e.target.value})}>
                       <option value="upi">UPI / Online</option>
                       <option value="bank_transfer">Bank Transfer</option>
                       <option value="cash">Cash at branch</option>
                     </select>
                  </div>
                  {form.payment_mode !== 'cash' && (
                    <div style={{ flex: '1 1 250px' }}>
                      <label className="form-label">Transaction Reference *</label>
                      <input type="text" className="form-input" required value={form.payment_reference} onChange={e => setForm({...form, payment_reference: e.target.value})} placeholder="Trxn ID / Ref No" />
                    </div>
                  )}
                </div>

                <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.05rem', marginTop: '1rem' }}>
                  {submitting ? <div className="spinner" style={{ width: '20px', height: '20px' }} /> : <><FileText size={20} /> Submit Application</>}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
