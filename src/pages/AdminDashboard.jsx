import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  LayoutDashboard, BookOpen, Users, LogOut, Monitor, Settings,
  CheckCircle, X, Plus, TrendingUp, IndianRupee, AlertCircle, RefreshCw, Menu, Trophy, Target
} from 'lucide-react';
import Leaderboard from '../components/Leaderboard';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import NotificationBell from '../components/NotificationBell';
import ThemeToggle from '../components/ThemeToggle';
import ICIcon from '../components/ICIcon';
import { Coins } from 'lucide-react';

// Simple reusable skeleton loader
const SkeletonCard = () => (
  <div style={{ background: 'var(--bg-card)', borderRadius: '14px', padding: '1.5rem', border: '1px solid var(--border)' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--border)', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }} />
    <div style={{ width: '60%', height: '14px', borderRadius: '4px', background: 'var(--border)', marginBottom: '0.75rem', animation: 'pulse 1.5s infinite' }} />
    <div style={{ width: '40%', height: '24px', borderRadius: '6px', background: 'var(--border)', animation: 'pulse 1.5s infinite' }} />
  </div>
);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState('overview');
  const [data, setData] = useState(null);
  const [admissions, setAdmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Real users list (for management)
  const [pendingRefs, setPendingRefs] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({ name: '', category: 'computer', description: '', duration_months: '', fee: '', commission_percent: '10', commission_ic: '' });
  const [editingCourse, setEditingCourse] = useState(null); 
  const [enrollModal, setEnrollModal] = useState(null); 
  const [enrollCourseId, setEnrollCourseId] = useState('');
  const [settings, setSettings] = useState({ ic_conversion_rate: '1.0' });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const isSuperOrAdmin = ['super_admin', 'admin', 'co-admin'].includes(user?.role);
      const reqs = [
        api.get('/dashboard/admin'),
        api.get('/admissions?limit=20'),
        api.get('/courses'),
        api.get('/users/students'),
        api.get('/users/pending-referrals'),
        api.get('/commissions/withdrawals?limit=50'),
        api.get('/settings'),
      ];
      if (isSuperOrAdmin) reqs.push(api.get('/users'));

      const results = await Promise.allSettled(reqs);
      
      // Map results to state, logging any failures
      results.forEach((res, i) => {
        if (res.status === 'rejected') {
          console.error(`Admin Fetch Error (${i}):`, res.reason);
        }
      });

      if (results[0].status === 'fulfilled') setData(results[0].value.data.data);
      if (results[1].status === 'fulfilled') setAdmissions(results[1].value.data.data || []);
      if (results[2].status === 'fulfilled') setCourses(results[2].value.data.data || []);
      if (results[3].status === 'fulfilled') setUsers(results[3].value.data.data || []);
      if (results[4].status === 'fulfilled') setPendingRefs(results[4].value.data.data || []);
      if (results[5].status === 'fulfilled') setWithdrawals(results[5].value.data.data || []);
      if (results[6].status === 'fulfilled') setSettings(results[6].value.data.data || { ic_conversion_rate: '1.0' });
      if (isSuperOrAdmin && results[7]?.status === 'fulfilled') {
        setAllUsers(results[7].value.data.data || []);
      }

      // If critical overview data failed, trigger error state
      if (results[0].status === 'rejected') {
        throw new Error('Critical dashboard data failed to load');
      }

    } catch (e) { 
      console.error('Admin Load Error:', e);
      const msg = e.response?.data?.message || 'Data sync failed. Please refresh.';
      setError(msg);
      toast.error(msg);
    } finally { 
      if (showLoading) setLoading(false); 
    }
  }, [user?.role]); // Only recreate if user role changes

  // Auto-refresh on tab change or window focus
  useEffect(() => { 
    loadData();

    const onFocus = () => loadData(false);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadData, active]);

  const approveAdmission = async (id) => {
    try {
      await api.patch(`/admissions/${id}/approve`);
      toast.success('Admission approved and commission generated!');
      await loadData(false);
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
      await loadData(false);
    } catch (err) {
      toast.error('Failed to reject admission.');
    }
  };

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        // UPDATE EXISTING
        await api.put(`/courses/${editingCourse.id}`, courseForm);
        toast.success('Course updated successfully.');
      } else {
        // CREATE NEW
        await api.post('/courses', courseForm);
        toast.success('Course created successfully.');
      }
      
      setShowCourseForm(false);
      setEditingCourse(null);
      setCourseForm({ name: '', category: 'computer', description: '', duration_months: '', fee: '', commission_percent: '10', commission_ic: '' });
      
      await loadData(false);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${editingCourse ? 'update' : 'create'} course.`);
    }
  };

  const handleEditCourseClick = (c) => {
    setEditingCourse(c);
    setCourseForm({
      name: c.name,
      category: c.category,
      description: c.description || '',
      duration_months: c.duration_months || '',
      fee: c.fee,
      commission_percent: c.commission_percent,
      commission_ic: c.commission_ic || ''
    });
    setShowCourseForm(true);
  };

  const toggleCourseActive = async (c) => {
    try {
      await api.put(`/courses/${c.id}`, { ...c, is_active: !c.is_active });
      c.is_active ? toast.success('Course deactivated.') : toast.success('Course activated.');
      await loadData(false);
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

  const updateSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      await api.put('/settings', settings);
      toast.success('Reward settings updated.');
      await loadData(false); // Refresh after update
    } catch (err) {
      toast.error('Failed to update settings.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const promoteDemoteUser = async (id, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      await api.put(`/users/${id}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}.`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`WARNING: Are you absolutely sure you want to delete ${name}?\nThis action cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully.');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
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
    { id: 'students', label: 'Referrals & Leads', icon: Users },
    { id: 'admissions', label: 'Admissions', icon: BookOpen },
    { id: 'withdrawals', label: 'Withdrawals', icon: IndianRupee },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'courses', label: 'Courses', icon: Settings },
  ];

  if (user?.role === 'super_admin' || user?.role === 'admin') {
    links.splice(links.length - 1, 0, { id: 'reward_settings', label: 'Reward Config', icon: Coins });
  }

  if (['super_admin', 'admin'].includes(user?.role)) {
    links.push({ id: 'analytics', label: 'Analytics', icon: TrendingUp });
    links.push({ id: 'users', label: 'User Management', icon: Users });
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              <Monitor size={18} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: '800', fontFamily: 'Outfit', fontSize: '0.95rem' }}>IGCIM Admin</div>
              <div style={{ color: '#00B4D8', fontSize: '0.6rem', letterSpacing: '0.05em' }}>{user?.role === 'super_admin' ? 'SUPER ADMIN' : 'CENTRE ADMIN'}</div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden block" style={{ background: 'none', border: 'none', color: 'white', marginLeft: 'auto', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>
        <div style={{ padding: '1.25rem', margin: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
          <div style={{ color: 'white', fontWeight: '600', fontSize: '0.85rem' }}>{user?.fullName}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>{user?.systemId}</div>
        </div>
        <nav style={{ flex: 1, padding: '0.5rem 0' }}>
          {links.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActive(id); setSidebarOpen(false); }} className={`sidebar-link ${active === id ? 'active' : ''}`}
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

      <main className="main-content" style={{ flex: 1, minWidth: 0, background: 'var(--bg)', minHeight: '100vh' }}>
        <div style={{ padding: 'var(--space-page)' }}>
        {/* Top bar */}
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', position: 'sticky', top: 0, zIndex: 30, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '0.25rem' }} className="lg:hidden">
              <Menu size={22} />
            </button>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'Outfit' }}>
                {active === 'overview' ? 'Overview' : active.charAt(0).toUpperCase() + active.slice(1)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }} className="hidden sm:block">Admin Management</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {user?.role === 'co-admin' && (
              <button onClick={() => window.location.href = '/dashboard/student'} className="btn-outline hidden md:flex" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                👤 Student
              </button>
            )}
            <ThemeToggle />
            <NotificationBell scope="admin" />
            <button onClick={loadData} disabled={loading} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', opacity: loading ? 0.6 : 1 }}>
              <RefreshCw size={12} className={loading ? 'spin' : ''} /> <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }`}</style>
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
           <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
             <AlertCircle size={40} color="var(--danger)" style={{ marginBottom: '1rem' }} />
             <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Admin Data Error</h3>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
             <button onClick={() => loadData()} className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
               <RefreshCw size={16} /> Try Refreshing
             </button>
           </div>
        ) : (
          <>
            {/* === OVERVIEW === */}
            {active === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  {[
                    { label: 'Total Admissions', value: stats.total || 0, icon: BookOpen, color: 'var(--primary)' },
                    { label: 'Conversion Rate', value: `${data?.conversionRate || 0}%`, icon: Target, color: 'var(--accent)' },
                    { label: 'Approved', value: stats.approved || 0, icon: CheckCircle, color: '#10b981' },
                    { label: 'Total Earnings', value: (
                      <span>
                        <ICIcon size={22} /> {parseFloat((commStats.total_commissions || 0) / (settings.ic_conversion_rate || 1)).toLocaleString()}
                      </span>
                    ), icon: Coins, color: 'var(--accent)' },
                    { label: 'Total Students', value: studentStats.total_students || 0, icon: Users, color: '#8b5cf6' },
                  ].map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <motion.div key={i} className="stat-card" style={{ background: 'var(--bg-card)', padding: '1.75rem' }} whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                            <Icon size={22} color={s.color} />
                          </div>
                          <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '900', color: 'var(--text-primary)', fontFamily: 'Outfit', marginBottom: '0.25rem', lineHeight: 1 }}>{s.value}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.01em' }}>{s.label}</div>
                        </motion.div>
                      );
                    })}
                </div>

                {/* === CHARTS === */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '1.25rem', marginBottom: '1.5rem', width: '100%', minWidth: 0 }}>
                  {/* Revenue vs Commission Chart */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Revenue vs Commission Margin</h3>
                      <span style={{ fontSize: '0.75rem', color: '#00B4D8', fontWeight: '600' }}>Last 6 months</span>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={data?.monthlyMetrics || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                        <Tooltip
                          formatter={(value) => `₹${parseFloat(value).toLocaleString()}`}
                          contentStyle={{ borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.8rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                          itemStyle={{ color: 'var(--text-primary)' }}
                          labelStyle={{ color: 'var(--text-secondary)', fontWeight: 700 }}
                        />
                        <Area type="monotone" dataKey="revenue_collected" name="Gross Revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                        <Area type="monotone" dataKey="commission_paid" name="Commission Paid" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorComm)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Course Popularity Chart */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Popular Courses</h3>
                      <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: '600' }}>By Enrollments</span>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={data?.popularCourses || []} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                        <defs>
                          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-secondary)', angle: -30, textAnchor: 'end' }} axisLine={false} tickLine={false} interval={0} />
                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.8rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                          itemStyle={{ color: 'var(--text-primary)' }}
                          labelStyle={{ color: 'var(--text-secondary)', fontWeight: 700 }}
                        />
                        <Bar dataKey="count" name="Enrollments" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginBottom: '1.5rem', width: '100%', minWidth: 0 }}>
                  {/* Recent Admissions */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
                    <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>Recent Admission Activity</h3>
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr><th>Student</th><th>Course</th><th>Fee</th><th>Mode</th><th>Status</th><th>Referrer</th><th>Date</th></tr>
                        </thead>
                        <tbody>
                          {admissions.slice(0, 10).length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No recent admissions.</td></tr>
                          ) : admissions.slice(0, 10).map(a => (
                            <tr key={a.id}>
                              <td>
                                <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem' }}>{a.student_name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{a.student_mobile}</div>
                              </td>
                              <td style={{ fontSize: '0.875rem' }}>{a.course_name}</td>
                              <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>₹{parseFloat(a.snapshot_fee).toLocaleString()}</td>
                              <td><span className="badge badge-info">{a.admission_mode}</span></td>
                              <td>{getStatusBadge(a.status)}</td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{a.referrer_name || '—'}</td>
                              <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* === LEADERBOARD === */}
            {active === 'leaderboard' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Leaderboard />
              </motion.div>
            )}

            {/* === ALL ADMISSIONS === */}
            {active === 'admissions' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden' }}>
                <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>All Admissions</h3>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr><th>Student</th><th>Course</th><th>Fee</th><th>Referrer</th><th>Reward</th><th>Mode</th><th>Status</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {admissions.map(a => (
                        <tr key={a.id}>
                          <td>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem' }}>{a.student_name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{a.student_mobile}</div>
                          </td>
                          <td>{a.course_name}</td>
                          <td style={{ fontWeight: '600' }}>₹{parseFloat(a.snapshot_fee).toLocaleString()}</td>
                          <td style={{ color: '#00B4D8', fontSize: '0.8rem' }}>{a.referrer_name || '—'}</td>
                          <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                            {a.referrer_name ? (
                              <>
                                <ICIcon size={14} /> {a.snapshot_commission_ic || (parseFloat(a.snapshot_fee * a.snapshot_commission_percent / 100 / (settings.ic_conversion_rate || 1)).toFixed(2))}
                              </>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)', fontWeight: '400' }}>—</span>
                            )}
                          </td>
                          <td><span className="badge badge-info">{a.admission_mode}</span></td>
                          <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                          <td>
                            {a.status === 'pending' && (
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <button onClick={() => approveAdmission(a.id)} className="btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}>✓</button>
                                <button onClick={() => rejectAdmission(a.id)} className="btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}>✗</button>
                              </div>
                            )}
                            {a.status !== 'pending' && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* === REWARD SETTINGS === */}
            {active === 'reward_settings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '600px' }}>
                <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '2rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'var(--accent)15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Coins size={24} color="var(--accent)" />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'Outfit' }}>Reward Configuration</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Manage IGCIM Credits (IC) system and conversion rates.</p>
                    </div>
                  </div>

                  <form onSubmit={updateSettings}>
                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>IC to INR Conversion Rate</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--text-primary)', zIndex: 10 }}>
                             <ICIcon size={18} />
                             <span style={{ marginLeft: '0.5rem', fontWeight: 'bold', fontSize: '1rem' }}>1 IC = ₹</span>
                          </div>
                          <input 
                            type="number" 
                            step="0.01"
                            className="form-input" 
                            style={{ paddingLeft: '7.5rem', fontWeight: '700', fontSize: '1.1rem' }}
                            value={settings.ic_conversion_rate} 
                            onChange={e => setSettings({ ...settings, ic_conversion_rate: e.target.value })} 
                            required 
                          />
                        </div>
                      </div>
                      <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        This rate defines how many Indian Rupees (₹) a student receives for each IGCIM Credit (IC) during withdrawal. 
                        <strong> Current:</strong> 1 IC = ₹{parseFloat(settings.ic_conversion_rate).toLocaleString()}.
                      </p>
                    </div>

                    <div style={{ background: 'var(--bg)50', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', border: '1px dashed var(--border)' }}>
                       <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Note regarding Course Commissions</h4>
                       <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                         You can set specific IC rewards for each course in the <strong>Courses</strong> tab. If no specific IC is set, the system will calculate it based on the course's commission percentage.
                       </p>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={settingsLoading}>
                      {settingsLoading ? 'Saving...' : 'Save Configuration'}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* === STUDENTS === */}
            {active === 'students' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Pending Referrals Card */}
                {pendingRefs.length > 0 && (
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '2px solid var(--accent)40', minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent)20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertCircle size={18} color="var(--accent)" />
                      </div>
                      <div>
                        <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem', fontFamily: 'Outfit' }}>Pending Referrals — Awaiting Approval</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>These students registered via a referral code. Approving will confirm the referral and credit the referrer.</p>
                      </div>
                    </div>
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr><th>Referred Student</th><th>Contact</th><th>Referred By</th><th>Enrollment Status</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                          {pendingRefs.map(r => (
                            <tr key={r.id}>
                              <td>
                                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{r.full_name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{r.system_id}</div>
                              </td>
                              <td>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{r.mobile}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{r.email}</div>
                              </td>
                              <td>
                                <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{r.referrer_name}</div>
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
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden' }}>
                  <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>All Registered Students</h3>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr><th>Name / ID</th><th>Contact Info</th><th>Referral Code</th><th>Referred By</th><th>Total Invited</th><th>Joined On</th></tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No students found.</td></tr>
                        ) : users.map(u => (
                          <tr key={u.id}>
                            <td>
                              <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem' }}>{u.full_name}</div>
                              <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{u.system_id}</div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.825rem', color: 'var(--text-primary)' }}>{u.mobile}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                            </td>
                            <td><span className="badge badge-info" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{u.referral_code}</span></td>
                            <td style={{ color: 'var(--text-primary)', fontSize: '0.825rem', fontWeight: '500' }}>{u.referred_by_name || '—'}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ background: u.total_referrals > 0 ? '#d1fae5' : '#f1f5f9', color: u.total_referrals > 0 ? '#059669' : 'var(--text-secondary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                {u.total_referrals}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden' }}>
                <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Withdrawal Requests</h3>
                <div className="table-responsive">
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
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No withdrawal requests found.</td></tr>
                      ) : (
                        withdrawals.map(w => (
                          <tr key={w.id}>
                            <td>
                              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{w.student_name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{w.student_system_id} | {w.mobile}</div>
                            </td>
                             <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                               <ICIcon size={16} /> {parseFloat(w.amount / (settings.ic_conversion_rate || 1)).toLocaleString()}
                               <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>₹{parseFloat(w.inr_amount).toLocaleString()}</div>
                             </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {w.upi_id && <div><strong>UPI:</strong> {w.upi_id}</div>}
                              {w.bank_account && <div><strong>A/C:</strong> {w.bank_account}</div>}
                              {w.bank_ifsc && <div><strong>IFSC:</strong> {w.bank_ifsc}</div>}
                            </td>
                            <td>{getStatusBadge(w.status)}</td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(w.created_at).toLocaleDateString()}</td>
                            <td>
                              {w.status === 'pending' && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button onClick={() => updateWithdrawal(w.id, 'paid')} className="btn-accent" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Mark Paid</button>
                                  <button onClick={() => updateWithdrawal(w.id, 'rejected')} className="btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Reject</button>
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

            {/* === USER MANAGEMENT === */}
            {active === 'users' && ['super_admin', 'admin'].includes(user?.role) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden' }}>
                <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>System User Management</h3>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr><th>Name / ID</th><th>Contact Info</th><th>Role</th><th>Joined On</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {allUsers.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No users found.</td></tr>
                      ) : allUsers.map(u => (
                        <tr key={u.id}>
                          <td>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem' }}>{u.full_name}</div>
                            <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{u.system_id}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.825rem', color: 'var(--text-primary)' }}>{u.mobile}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                          </td>
                          <td>
                            <span className={`badge ${u.role === 'co-admin' ? 'badge-info' : u.role === 'admin' || u.role === 'super_admin' ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '0.75rem' }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                          <td>
                            {/* Actions purely for student <-> co-admin flipping and student deletion */}
                            {['student', 'co-admin'].includes(u.role) && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  {u.role === 'student' ? (
                                    <button onClick={() => promoteDemoteUser(u.id, 'co-admin')} className="btn-success" style={{ padding: '0.4rem 0.6rem', fontSize: '0.7rem' }}>🚀 Promote</button>
                                  ) : (
                                    <button onClick={() => promoteDemoteUser(u.id, 'student')} className="btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.7rem' }}>⬇️ Demote</button>
                                  )}
                                </div>
                            )}
                            {!['student', 'co-admin'].includes(u.role) && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Protected Core User</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* === COURSES === */}
            {active === 'courses' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button onClick={() => { setEditingCourse(null); setCourseForm({ name: '', category: 'computer', description: '', duration_months: '', fee: '', commission_percent: '10' }); setShowCourseForm(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={16} /> Add Course
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {courses.map(c => (
                    <motion.div key={c.id} whileHover={{ y: -4 }}
                      style={{ background: 'var(--bg-card)', borderRadius: '14px', padding: '1.25rem', border: `1px solid ${c.is_active ? 'var(--border)' : 'rgba(239,68,68,0.15)'}`, opacity: c.is_active ? 1 : 0.75 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{c.category}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.7rem', color: c.is_active ? '#10b981' : '#ef4444', fontWeight: '600' }}>{c.is_active ? '● Active' : '● Inactive'}</span>
                        </div>
                      </div>
                      <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>{c.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{c.description || 'No description'}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{parseFloat(c.fee).toLocaleString()}</span>
                        <span style={{ color: '#00B4D8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          Reward: <ICIcon size={14} /> {parseFloat((c.commission_ic || (c.fee * c.commission_percent / 100)) / (settings.ic_conversion_rate || 1)).toFixed(2)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                        <button
                          onClick={() => handleEditCourseClick(c)}
                          style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.72rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '600' }}
                        >
                          ✎ Edit
                        </button>
                        <button
                          onClick={() => toggleCourseActive(c)}
                          style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.72rem', border: `1px solid ${c.is_active ? '#fca5a5' : '#6ee7b7'}`, borderRadius: '8px', background: c.is_active ? '#fef2f2' : '#f0fdf4', color: c.is_active ? '#dc2626' : '#059669', cursor: 'pointer', fontWeight: '600' }}
                        >
                          {c.is_active ? '⊘ Deactivate' : '✓ Activate'}
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
                
                {/* Margin Area Chart */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Revenue vs Commission Margin</h3>
                    <span style={{ fontSize: '0.75rem', color: '#00B4D8', fontWeight: '600' }}>Last 6 months</span>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={data?.monthlyMetrics || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip formatter={(value) => `₹${parseFloat(value).toLocaleString()}`} contentStyle={{ borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.8rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                      <Area type="monotone" dataKey="revenue_collected" name="Gross Revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                      <Area type="monotone" dataKey="commission_paid" name="Commission Paid" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorComm)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
                  {/* Course Popularity PieChart */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                    <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>Course Popularity</h3>
                    <ResponsiveContainer width="100%" height={260} style={{ flex: 1 }}>
                      <PieChart>
                        <Pie
                          data={data?.popularCourses || []}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                          paddingAngle={4} dataKey="count" nameKey="name"
                          label={false}
                        >
                          {(data?.popularCourses || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#00B4D8', '#10b981', '#f59e0b', '#8b5cf6'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [`${value} Admissions`, props.payload.name]} contentStyle={{ borderRadius: '10px', fontSize: '0.8rem', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {[
                    { label: 'Total Admissions', value: stats.total || 0, color: '#10b981' },
                    { label: 'Total Commissions', value: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ICIcon size={20} /> {parseFloat((commStats.total_commissions || 0) / (settings.ic_conversion_rate || 1)).toLocaleString()}
                      </div>
                    ), color: 'var(--text-primary)' },
                    { label: 'Pending Credits', value: commStats.pending_count || 0, color: '#f59e0b' },
                    { label: 'Active Courses', value: courses.filter(c => c.is_active).length, color: '#00B4D8' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', borderRadius: '14px', padding: '1.25rem', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: s.color, fontFamily: 'Outfit', marginBottom: '0.25rem' }}>{s.value}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              </motion.div>
            )}
          </>
        )}
        </div>
      </main>

      {/* Add Course Modal */}
      {showCourseForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '1.5rem', width: 'min(95%, 460px)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'Outfit' }}>{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
              <button onClick={() => setShowCourseForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>
            <form onSubmit={createCourse}>
              {[
                { key: 'name', label: 'Course Name', type: 'text', placeholder: 'e.g. ADCA', required: true },
                { key: 'description', label: 'Description', type: 'text', placeholder: 'Short description' },
                { key: 'duration_months', label: 'Duration (months)', type: 'number', placeholder: '6' },
                { key: 'fee', label: 'Fee (₹)', type: 'number', placeholder: '8000', required: true },
                { key: 'commission_percent', label: 'Default Commission %', type: 'number', placeholder: '10', required: true },
                { key: 'commission_ic', label: 'Fixed IC Reward (Overrides %)', type: 'number', placeholder: '500' },
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
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{editingCourse ? 'Save Changes' : 'Create Course'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Quick Approve Modal */}
      {enrollModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '2rem', width: 'min(95%, 440px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'Outfit', fontSize: '1.1rem' }}>Quick Approve Referral</h3>
              <button onClick={() => setEnrollModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>
            <div style={{ background: '#F0F4FF', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Referred Student</div>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{enrollModal.full_name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Referred By</div>
              <div style={{ fontWeight: '600', color: '#00B4D8' }}>{enrollModal.referrer_name} <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({enrollModal.referrer_code})</span></div>
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
