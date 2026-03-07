import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, Users, LogOut, Monitor, Menu, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState('admissions');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admissions, setAdmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student_name: '', student_mobile: '', student_email: '', course_id: '', referral_code: '', payment_mode: 'cash', notes: '' });
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
    } catch (err) {
      setFormMsg('❌ ' + (err.response?.data?.message || 'Failed to submit.'));
    }
  };

  const links = [
    { id: 'admissions', label: 'Admissions', icon: BookOpen },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F4FF' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Monitor size={18} color="white" />
            </div>
            <div style={{ color: 'white', fontWeight: '800', fontFamily: 'Outfit', fontSize: '0.95rem' }}>IGCIM Staff</div>
          </div>
        </div>
        <div style={{ padding: '0.75rem', margin: '0.75rem', background: 'rgba(255,255,255,0.07)', borderRadius: '10px' }}>
          <div style={{ color: 'white', fontWeight: '600', fontSize: '0.85rem' }}>{user?.fullName}</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem' }}>Staff · {user?.systemId}</div>
        </div>
        <nav style={{ flex: 1, padding: '0.5rem 0' }}>
          {links.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActive(id)} className={`sidebar-link ${active === id ? 'active' : ''}`}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '1rem' }}>
          <button onClick={logout} className="sidebar-link" style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', color: '#fca5a5' }}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0A2463', fontFamily: 'Outfit' }}>Offline Admissions</h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Enter and manage offline admissions</p>
          </div>
          <button onClick={() => { setShowForm(true); setFormMsg(''); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> New Admission
          </button>
        </div>

        {formMsg && (
          <div style={{ background: formMsg.includes('✅') ? '#d1fae5' : '#fee2e2', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: formMsg.includes('✅') ? '#059669' : '#dc2626' }}>
            {formMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading admissions...</div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(10,36,99,0.06)' }}>
            <table className="data-table">
              <thead>
                <tr><th>Student</th><th>Mobile</th><th>Course</th><th>Fee</th><th>Referral</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {admissions.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No offline admissions yet.</td></tr>
                ) : admissions.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: '600', color: '#0A2463' }}>{a.student_name}</td>
                    <td style={{ color: '#64748b' }}>{a.student_mobile}</td>
                    <td>{a.course_name}</td>
                    <td>₹{parseFloat(a.snapshot_fee).toLocaleString()}</td>
                    <td style={{ color: '#00B4D8', fontSize: '0.8rem' }}>{a.referrer_name || '—'}</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                    <td style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </main>

      {/* New Admission Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: '800', color: '#0A2463', fontSize: '1.1rem', fontFamily: 'Outfit' }}>New Offline Admission</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              {[
                { key: 'student_name', label: 'Student Full Name', type: 'text', placeholder: 'Full name', required: true },
                { key: 'student_mobile', label: 'Mobile Number', type: 'tel', placeholder: '+91 XXXXXXXXXX', required: true },
                { key: 'student_email', label: 'Email (Optional)', type: 'email', placeholder: 'student@email.com' },
                { key: 'referral_code', label: 'Referral Code (Optional)', type: 'text', placeholder: 'IGCIMA1B2' },
                { key: 'payment_reference', label: 'Payment Reference', type: 'text', placeholder: 'Receipt/Transaction ID' },
                { key: 'notes', label: 'Notes', type: 'text', placeholder: 'Any additional notes' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '1rem' }}>
                  <label className="form-label">{f.label}</label>
                  <input type={f.type} className="form-input" placeholder={f.placeholder} required={f.required}
                    value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Course *</label>
                <select className="form-input" required value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })}>
                  <option value="">Select course...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name} — ₹{c.fee}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Payment Mode *</label>
                <select className="form-input" value={form.payment_mode} onChange={e => setForm({ ...form, payment_mode: e.target.value })}>
                  {['cash', 'upi', 'bank_transfer', 'cheque'].map(m => <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Submit Admission</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
