import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  LayoutDashboard, BookOpen, Users, LogOut, Monitor, Settings,
  CheckCircle, X, Plus, TrendingUp, IndianRupee, AlertCircle, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

// Simple reusable skeleton loader
const SkeletonCard = () => (
  <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid rgba(10,36,99,0.05)' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e2e8f0', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }} />
    <div style={{ width: '60%', height: '14px', borderRadius: '4px', background: '#e2e8f0', marginBottom: '0.75rem', animation: 'pulse 1.5s infinite' }} />
    <div style={{ width: '40%', height: '24px', borderRadius: '6px', background: '#cbd5e1', animation: 'pulse 1.5s infinite' }} />
  </div>
);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState('overview');
  const [data, setData] = useState(null);
  const [admissions, setAdmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingRefs, setPendingRefs] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({ name: '', category: 'computer', description: '', duration_months: '', fee: '', commission_percent: '10' });
  const [enrollModal, setEnrollModal] = useState(null); // { id, full_name, referrer_name, referrer_id }
  const [enrollCourseId, setEnrollCourseId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, adm, crs, usr, refs, wds] = await Promise.all([
        api.get('/dashboard/admin'),
        api.get('/admissions?limit=20'),
        api.get('/courses'),
        api.get('/users/students'),
        api.get('/users/pending-referrals'),
        api.get('/commissions/withdrawals?limit=50'),
      ]);
      setData(dash.data.data);
      setAdmissions(adm.data.data || []);
      setCourses(crs.data.data || []);
      setUsers(usr.data.data || []);
      setPendingRefs(refs.data.data || []);
      setWithdrawals(wds.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const approveAdmission = async (id) => {
    try {
      await api.patch(`/admissions/${id}/approve`);
      toast.success('Admission approved and commission generated!');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve admission.');
    }
  };

  const rejectAdmission = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try {
      await api.patch(`/admissions/${id}/reject`, { rejection_reason: reason });
      toast.success('Admission rejected.');
      loadData();
    } catch (err) {
      toast.error('Failed to reject admission.');
    }
  };

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', courseForm);
      setShowCourseForm(false);
      setCourseForm({ name: '', category: 'computer', description: '', duration_months: '', fee: '', commission_percent: '10' });
      toast.success('Course created successfully.');
      const res = await api.get('/courses');
      setCourses(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course.');
    }
  };

  const deleteCourse = async (id, name) => {
    if (!window.confirm(`Delete course "${name}"? This cannot be undone.`)) return;
    try {
      const res = await api.delete(`/courses/${id}`);
      toast.success(res.data.message);
      const cres = await api.get('/courses');
      setCourses(cres.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course.');
    }
  };

  const toggleCourseActive = async (c) => {
    try {
      await api.put(`/courses/${c.id}`, { ...c, is_active: !c.is_active });
      c.is_active ? toast.success('Course deactivated.') : toast.success('Course activated.');
      const res = await api.get('/courses');
      setCourses(res.data.data || []);
    } catch (err) {
      toast.error('Failed to update course status.');
    }
  };

  const quickEnrollApprove = async (e) => {
    e.preventDefault();
    if (!enrollCourseId) return;
    try {
      const res = await api.post('/admissions/admin-enroll-approve', {
        student_id: enrollModal.id,
        course_id: enrollCourseId,
        referrer_id: enrollModal.referrer_id,
      });
      toast.success(res.data.message);
      setEnrollModal(null);
      setEnrollCourseId('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve.');
    }
  };

  const updateWithdrawal = async (id, status) => {
    const notes = prompt(`Enter optional note for moving to ${status}:`, '');
    if (notes === null) return; // cancelled
    try {
      await api.patch(`/commissions/withdrawals/${id}/status`, { status, admin_notes: notes });
      toast.success(`Withdrawal marked as ${status}.`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update withdrawal.');
    }
  };

  const getStatusBadge = (status) => {
    let style = 'badge-pending';
    if (status === 'approved' || status === 'paid') style = 'badge-success';
    if (status === 'rejected') style = 'badge-error';
    return <span className={`badge ${style}`}>{status}</span>;
  };

  const stats = data?.admissions || {};
  const commStats = data?.commissions || {};
  const studentStats = data?.students || {};

  const links = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'admissions', label: 'Admissions', icon: BookOpen },
    { id: 'withdrawals', label: 'Withdrawals', icon: IndianRupee },
    { id: 'courses', label: 'Courses', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
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
            <div>
              <div style={{ color: 'white', fontWeight: '800', fontFamily: 'Outfit', fontSize: '0.95rem' }}>IGCIM Admin</div>
              <div style={{ color: '#00B4D8', fontSize: '0.6rem', letterSpacing: '0.05em' }}>{user?.role === 'super_admin' ? 'SUPER ADMIN' : 'CENTRE ADMIN'}</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '0.75rem', margin: '0.75rem', background: 'rgba(255,255,255,0.07)', borderRadius: '10px' }}>
          <div style={{ color: 'white', fontWeight: '600', fontSize: '0.85rem' }}>{user?.fullName}</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem' }}>{user?.systemId}</div>
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
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0A2463', fontFamily: 'Outfit' }}>
              {links.find(l => l.id === active)?.label || 'Dashboard'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>IGCIM Administration Panel</p>
          </div>
          <button onClick={loadData} disabled={loading} style={{ background: 'none', border: '1px solid rgba(10,36,99,0.12)', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', color: '#0A2463', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', opacity: loading ? 0.6 : 1 }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }`}</style>
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {/* === OVERVIEW === */}
            {active === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Total Admissions', value: stats.total || 0, icon: BookOpen, color: '#0A2463' },
                    { label: 'Pending Review', value: stats.pending || 0, icon: AlertCircle, color: '#f59e0b' },
                    { label: 'Approved', value: stats.approved || 0, icon: CheckCircle, color: '#10b981' },
                    { label: 'Total Commissions', value: `₹${parseFloat(commStats.total_commissions || 0).toLocaleString()}`, icon: IndianRupee, color: '#00B4D8' },
                    { label: 'Total Students', value: studentStats.total_students || 0, icon: Users, color: '#8b5cf6' },
                  ].map((s, i) => (
                    <motion.div key={i} className="stat-card" style={{ background: 'white' }} whileHover={{ y: -4 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                        <s.icon size={18} color={s.color} />
                      </div>
                      <div style={{ fontSize: '1.65rem', fontWeight: '800', color: s.color, fontFamily: 'Outfit', marginBottom: '0.2rem' }}>{s.value}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '500' }}>{s.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Admissions */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(10,36,99,0.06)', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontWeight: '700', color: '#0A2463', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                    Recent Admissions — Pending Action
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr><th>Student</th><th>Course</th><th>Fee</th><th>Mode</th><th>Referrer</th><th>Date</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {admissions.filter(a => a.status === 'pending').slice(0, 8).length === 0 ? (
                          <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No pending admissions.</td></tr>
                        ) : admissions.filter(a => a.status === 'pending').slice(0, 8).map(a => (
                          <tr key={a.id}>
                            <td>
                              <div style={{ fontWeight: '600', color: '#0A2463', fontSize: '0.875rem' }}>{a.student_name}</div>
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{a.student_mobile}</div>
                            </td>
                            <td style={{ fontSize: '0.875rem' }}>{a.course_name}</td>
                            <td style={{ fontWeight: '600', color: '#0A2463' }}>₹{parseFloat(a.snapshot_fee).toLocaleString()}</td>
                            <td><span className="badge badge-info">{a.admission_mode}</span></td>
                            <td style={{ fontSize: '0.8rem', color: '#00B4D8' }}>{a.referrer_name || '—'}</td>
                            <td style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button onClick={() => approveAdmission(a.id)} className="btn-success" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <CheckCircle size={13} /> Approve
                                </button>
                                <button onClick={() => rejectAdmission(a.id)} className="btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <X size={13} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* === ALL ADMISSIONS === */}
            {active === 'admissions' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(10,36,99,0.06)' }}>
                <h3 style={{ fontWeight: '700', color: '#0A2463', marginBottom: '1.25rem' }}>All Admissions</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Student</th><th>Course</th><th>Fee</th><th>Commission</th><th>Mode</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {admissions.map(a => (
                        <tr key={a.id}>
                          <td>
                            <div style={{ fontWeight: '600', color: '#0A2463', fontSize: '0.875rem' }}>{a.student_name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{a.student_mobile}</div>
                          </td>
                          <td>{a.course_name}</td>
                          <td style={{ fontWeight: '600' }}>₹{parseFloat(a.snapshot_fee).toLocaleString()}</td>
                          <td style={{ color: '#00B4D8' }}>{a.snapshot_commission_percent}%</td>
                          <td><span className="badge badge-info">{a.admission_mode}</span></td>
                          <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                          <td style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                          <td>
                            {a.status === 'pending' && (
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <button onClick={() => approveAdmission(a.id)} className="btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}>✓</button>
                                <button onClick={() => rejectAdmission(a.id)} className="btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}>✗</button>
                              </div>
                            )}
                            {a.status !== 'pending' && <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* === STUDENTS === */}
            {active === 'students' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Pending Referrals Card */}
                {pendingRefs.length > 0 && (
                  <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '2px solid rgba(245,158,11,0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertCircle size={18} color="#f59e0b" />
                      </div>
                      <div>
                        <h3 style={{ fontWeight: '700', color: '#92400e', fontSize: '0.95rem', fontFamily: 'Outfit' }}>Pending Referrals — Awaiting Approval</h3>
                        <p style={{ fontSize: '0.75rem', color: '#78716c' }}>These students registered via a referral code. Approving will confirm the referral and credit the referrer.</p>
                      </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table">
                        <thead>
                          <tr><th>Referred Student</th><th>Contact</th><th>Referred By</th><th>Enrollment Status</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                          {pendingRefs.map(r => (
                            <tr key={r.id}>
                              <td>
                                <div style={{ fontWeight: '600', color: '#0A2463' }}>{r.full_name}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>{r.system_id}</div>
                              </td>
                              <td>
                                <div style={{ fontSize: '0.8rem', color: '#334155' }}>{r.mobile}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{r.email}</div>
                              </td>
                              <td>
                                <div style={{ fontWeight: '600', color: '#0A2463', fontSize: '0.85rem' }}>{r.referrer_name}</div>
                                <div style={{ fontSize: '0.72rem', color: '#00B4D8', fontFamily: 'monospace' }}>{r.referrer_code}</div>
                              </td>
                              <td>
                                <span className={`badge badge-${r.latest_admission_status || 'info'}`}>
                                  {r.latest_admission_status ? r.latest_admission_status : 'No Enrollment Yet'}
                                </span>
                              </td>
                              <td>
                                <button
                                  onClick={() => { setEnrollModal(r); setEnrollCourseId(''); }}
                                  className="btn-success"
                                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                  <CheckCircle size={13} /> Quick Approve
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* All students table */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(10,36,99,0.06)' }}>
                  <h3 style={{ fontWeight: '700', color: '#0A2463', marginBottom: '1.25rem' }}>All Registered Students</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr><th>Name / ID</th><th>Contact Info</th><th>Referral Code</th><th>Referred By</th><th>Total Invited</th><th>Joined On</th></tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No students found.</td></tr>
                        ) : users.map(u => (
                          <tr key={u.id}>
                            <td>
                              <div style={{ fontWeight: '600', color: '#0A2463', fontSize: '0.875rem' }}>{u.full_name}</div>
                              <div style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.75rem' }}>{u.system_id}</div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.825rem', color: '#334155' }}>{u.mobile}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{u.email}</div>
                            </td>
                            <td><span className="badge badge-info" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{u.referral_code}</span></td>
                            <td style={{ color: '#0A2463', fontSize: '0.825rem', fontWeight: '500' }}>{u.referred_by_name || '—'}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ background: u.total_referrals > 0 ? '#d1fae5' : '#f1f5f9', color: u.total_referrals > 0 ? '#059669' : '#64748b', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                {u.total_referrals}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* === WITHDRAWALS === */}
            {active === 'withdrawals' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(10,36,99,0.06)' }}>
                <h3 style={{ fontWeight: '700', color: '#0A2463', marginBottom: '1.25rem' }}>Withdrawal Requests</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>STUDENT</th>
                        <th>AMOUNT</th>
                        <th>BANK INFO</th>
                        <th>STATUS</th>
                        <th>DATE</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No withdrawal requests found.</td></tr>
                      ) : (
                        withdrawals.map(w => (
                          <tr key={w.id}>
                            <td>
                              <div style={{ fontWeight: '600', color: '#0A2463' }}>{w.student_name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.student_system_id} | {w.mobile}</div>
                            </td>
                            <td style={{ fontWeight: '700', color: '#0A2463' }}>₹{parseFloat(w.amount).toLocaleString()}</td>
                            <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {w.upi_id && <div><strong>UPI:</strong> {w.upi_id}</div>}
                              {w.bank_account && <div><strong>A/C:</strong> {w.bank_account}</div>}
                              {w.bank_ifsc && <div><strong>IFSC:</strong> {w.bank_ifsc}</div>}
                            </td>
                            <td>{getStatusBadge(w.status)}</td>
                            <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(w.created_at).toLocaleDateString()}</td>
                            <td>
                              {w.status === 'pending' && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button onClick={() => updateWithdrawal(w.id, 'paid')} className="btn-accent" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: '#10b981', color: 'white', border: 'none' }}>Mark Paid</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* === COURSES === */}
            {active === 'courses' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button onClick={() => setShowCourseForm(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={16} /> Add Course
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {courses.map(c => (
                    <motion.div key={c.id} whileHover={{ y: -4 }}
                      style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: `1px solid ${c.is_active ? 'rgba(10,36,99,0.08)' : 'rgba(239,68,68,0.15)'}`, opacity: c.is_active ? 1 : 0.75 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{c.category}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.7rem', color: c.is_active ? '#10b981' : '#ef4444', fontWeight: '600' }}>{c.is_active ? '● Active' : '● Inactive'}</span>
                        </div>
                      </div>
                      <h3 style={{ fontWeight: '700', color: '#0A2463', marginBottom: '0.3rem' }}>{c.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', lineHeight: 1.5 }}>{c.description || 'No description'}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: '700', color: '#0A2463' }}>₹{parseFloat(c.fee).toLocaleString()}</span>
                        <span style={{ color: '#00B4D8', fontWeight: '600' }}>Commission: {c.commission_percent}%</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                        <button
                          onClick={() => toggleCourseActive(c)}
                          style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.72rem', border: `1px solid ${c.is_active ? '#fca5a5' : '#6ee7b7'}`, borderRadius: '8px', background: c.is_active ? '#fef2f2' : '#f0fdf4', color: c.is_active ? '#dc2626' : '#059669', cursor: 'pointer', fontWeight: '600' }}
                        >
                          {c.is_active ? '⊘ Deactivate' : '✓ Activate'}
                        </button>
                        <button
                          onClick={() => deleteCourse(c.id, c.name)}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', border: '1px solid #fca5a5', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: '600' }}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* === ANALYTICS === */}
            {active === 'analytics' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                  <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem' }}>
                    <h3 style={{ fontWeight: '700', color: '#0A2463', marginBottom: '1.25rem', fontSize: '0.95rem' }}>Monthly Commission Trend</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={data?.monthlyCommissions || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,36,99,0.06)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <Tooltip formatter={(v) => [`₹${v}`, 'Commission']} contentStyle={{ borderRadius: '10px' }} />
                        <Bar dataKey="amount" fill="#0A2463" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem' }}>
                    <h3 style={{ fontWeight: '700', color: '#0A2463', marginBottom: '1.25rem', fontSize: '0.95rem' }}>Monthly Admissions Count</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={data?.monthlyCommissions || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,36,99,0.06)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ borderRadius: '10px' }} />
                        <Line type="monotone" dataKey="count" stroke="#00B4D8" strokeWidth={2.5} dot={{ fill: '#00B4D8', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {[
                    { label: 'Approval Rate', value: `${stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%`, color: '#10b981' },
                    { label: 'Total Commissions', value: `₹${parseFloat(commStats.total_commissions || 0).toLocaleString()}`, color: '#0A2463' },
                    { label: 'Pending Commissions', value: commStats.pending_count || 0, color: '#f59e0b' },
                    { label: 'Active Courses', value: courses.filter(c => c.is_active).length, color: '#00B4D8' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid rgba(10,36,99,0.06)' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: s.color, fontFamily: 'Outfit', marginBottom: '0.25rem' }}>{s.value}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Add Course Modal */}
      {showCourseForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: '800', color: '#0A2463', fontFamily: 'Outfit' }}>Add New Course</h3>
              <button onClick={() => setShowCourseForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={createCourse}>
              {[
                { key: 'name', label: 'Course Name', type: 'text', placeholder: 'e.g. ADCA', required: true },
                { key: 'description', label: 'Description', type: 'text', placeholder: 'Short description' },
                { key: 'duration_months', label: 'Duration (months)', type: 'number', placeholder: '6' },
                { key: 'fee', label: 'Fee (₹)', type: 'number', placeholder: '8000', required: true },
                { key: 'commission_percent', label: 'Commission %', type: 'number', placeholder: '10', required: true },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '0.875rem' }}>
                  <label className="form-label">{f.label}</label>
                  <input type={f.type} className="form-input" placeholder={f.placeholder} required={f.required}
                    value={courseForm[f.key]} onChange={e => setCourseForm({ ...courseForm, [f.key]: e.target.value })} />
                </div>
              ))}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Category</label>
                <select className="form-input" value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}>
                  <option value="computer">Computer Course</option>
                  <option value="university">University Program</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowCourseForm(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create Course</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Quick Approve Modal */}
      {enrollModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: '800', color: '#0A2463', fontFamily: 'Outfit', fontSize: '1.1rem' }}>Quick Approve Referral</h3>
              <button onClick={() => setEnrollModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <div style={{ background: '#F0F4FF', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Referred Student</div>
              <div style={{ fontWeight: '700', color: '#0A2463', marginBottom: '0.5rem' }}>{enrollModal.full_name}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Referred By</div>
              <div style={{ fontWeight: '600', color: '#00B4D8' }}>{enrollModal.referrer_name} <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8' }}>({enrollModal.referrer_code})</span></div>
            </div>
            <form onSubmit={quickEnrollApprove}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Select Course to Enroll In *</label>
                {courses.length === 0 ? (
                  <p style={{ color: '#f59e0b', fontSize: '0.8rem' }}>⚠️ No courses available. Please add a course first.</p>
                ) : (
                  <select className="form-input" required value={enrollCourseId} onChange={e => setEnrollCourseId(e.target.value)}>
                    <option value="">Choose a course...</option>
                    {courses.filter(c => c.is_active).map(c => (
                      <option key={c.id} value={c.id}>{c.name} — ₹{parseFloat(c.fee).toLocaleString()} ({c.commission_percent}% commission)</option>
                    ))}
                  </select>
                )}
              </div>
              <div style={{ background: '#fef3c7', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#92400e' }}>
                ⚡ This will immediately enroll the student and credit the referrer's commission.
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setEnrollModal(null)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn-success" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem' }} disabled={!enrollCourseId}>
                  <CheckCircle size={15} /> Approve & Generate Commission
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
