import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ThemeToggle from '../components/ThemeToggle';
import NotificationBell from '../components/NotificationBell';
import UnifiedIcon from '../components/UnifiedIcon';

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState('admissions');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admissions, setAdmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student_name: '', student_mobile: '', student_email: '', course_id: '', referral_code: '', payment_mode: 'cash', notes: '', payment_reference: '' });
  const [formMsg, setFormMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [adm, crs] = await Promise.all([
          api.get('/admissions?mode=offline'),
          api.get('/courses'),
        ]);
        setAdmissions(adm.data.data || []);
        setCourses(crs.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMsg('');
    try {
      await api.post('/admissions/offline', form);
      setFormMsg('✅ Admission submitted for admin approval.');
      setShowForm(false);
      const res = await api.get('/admissions?mode=offline');
      setAdmissions(res.data.data || []);
      setForm({ student_name: '', student_mobile: '', student_email: '', course_id: '', referral_code: '', payment_mode: 'cash', notes: '', payment_reference: '' });
    } catch (err) {
      setFormMsg('❌ ' + (err.response?.data?.message || 'Failed to submit.'));
    }
  };

  const links = [
    { id: 'admissions', label: 'Admissions', icon: 'Book' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', width: '100%', maxWidth: '100vw' }}>
      {/* Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 40 }}
            className="lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className="sidebar" style={{ transform: sidebarOpen ? 'translateX(0)' : undefined, width: 'var(--sidebar-width)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UnifiedIcon name="Monitor" size={18} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: '800', fontFamily: 'Outfit', fontSize: '0.95rem' }}>IGCIM Staff</div>
              <div style={{ color: '#00B4D8', fontSize: '0.6rem', letterSpacing: '0.05em' }}>OFFLINE COUNSELOR</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '1rem', margin: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          <div style={{ color: 'white', fontWeight: '600', fontSize: '0.85rem' }}>{user?.fullName}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>{user?.systemId}</div>
        </div>
        <nav style={{ flex: 1, padding: '0.5rem 0' }}>
          {links.map(({ id, label, icon: IconName }) => (
            <button key={id} onClick={() => { setActive(id); setSidebarOpen(false); }} className={`sidebar-link ${active === id ? 'active' : ''}`}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <UnifiedIcon name={IconName} size={17} /> {label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '1rem' }}>
          <button onClick={logout} className="sidebar-link logout" style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UnifiedIcon name="Logout" size={17} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content" style={{ flex: 1, minWidth: 0, background: 'var(--bg)', minHeight: '100vh' }}>
        <div style={{ padding: 'var(--space-page)' }}>
          {/* Top Bar */}
          <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', position: 'sticky', top: 0, zIndex: 30, borderRadius: '16px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '0.25rem', display: 'flex' }} className="lg:hidden">
                <UnifiedIcon name="Menu" size={22} />
              </button>
              <div>
                <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'Outfit', margin: 0 }}>Offline Admissions</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>Manage centre-walkin registrations</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ThemeToggle />
              <NotificationBell scope="admin" />
              <button onClick={() => { setShowForm(true); setFormMsg(''); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <UnifiedIcon name="Add" size={16} /> <span className="hidden sm:inline">New Admission</span>
              </button>
            </div>
          </div>

          {formMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: formMsg.includes('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '12px', padding: '0.875rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: formMsg.includes('✅') ? '#059669' : '#dc2626', border: `1px solid ${formMsg.includes('✅') ? '#10b98130' : '#ef444430'}`, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <UnifiedIcon name={formMsg.includes('✅') ? "TickCircle" : "Danger"} size={18} />
              {formMsg}
            </motion.div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-secondary)' }}>
              <div className="spinner" style={{ margin: '0 auto 1.5rem' }} />
              <p>Fetching admissions data...</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--border)' }}>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr><th>Student</th><th>Mobile</th><th>Course</th><th>Fee</th><th>Referral</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {admissions.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No offline admissions recorded yet.</td></tr>
                    ) : admissions.map(a => (
                      <tr key={a.id}>
                        <td>
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{a.student_name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{a.student_email || 'No email provided'}</div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{a.student_mobile}</td>
                        <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{a.course_name}</td>
                        <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{parseFloat(a.snapshot_fee).toLocaleString()}</td>
                        <td style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: '600' }}>{a.referrer_name || '—'}</td>
                        <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* New Admission Modal */}
      <AnimatePresence>
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '2rem', width: 'min(100%, 540px)', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ fontWeight: '900', color: 'var(--text-primary)', fontSize: '1.25rem', fontFamily: 'Outfit', margin: 0 }}>Register New Student</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>Centre-Walkin Offline Admission</p>
                </div>
                <button onClick={() => setShowForm(false)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <UnifiedIcon name="CloseCircle" size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label className="form-label">Student Full Name *</label>
                    <input type="text" className="form-input" placeholder="Enter full name" required
                      value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Mobile Number *</label>
                    <input type="tel" className="form-input" placeholder="+91 XXXXXXXXXX" required
                      value={form.student_mobile} onChange={e => setForm({ ...form, student_mobile: e.target.value })} />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Email Address (Recommended)</label>
                  <input type="email" className="form-input" placeholder="student@email.com"
                    value={form.student_email} onChange={e => setForm({ ...form, student_email: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label className="form-label">Course Selection *</label>
                    <select className="form-input" required value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })}>
                      <option value="">Select course...</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name} — ₹{parseFloat(c.fee).toLocaleString()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Referral Code</label>
                    <input type="text" className="form-input" placeholder="Optional: e.g. IGCIMX1"
                      value={form.referral_code} onChange={e => setForm({ ...form, referral_code: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label className="form-label">Payment Mode *</label>
                    <select className="form-input" value={form.payment_mode} onChange={e => setForm({ ...form, payment_mode: e.target.value })}>
                      {['cash', 'upi', 'bank_transfer', 'cheque'].map(m => <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Payment Ref / Receipt No.</label>
                    <input type="text" className="form-input" placeholder="Receipt ID"
                      value={form.payment_reference} onChange={e => setForm({ ...form, payment_reference: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="form-label">Internal Counselor Notes</label>
                  <textarea className="form-input" placeholder="Any additional notes..." rows={3} style={{ resize: 'none' }}
                    value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '0.875rem' }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '0.875rem', fontSize: '1rem' }}>Confirm & Submit</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
