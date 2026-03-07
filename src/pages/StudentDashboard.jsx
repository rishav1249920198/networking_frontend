import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Users, TrendingUp, DollarSign, Clock, LogOut, Monitor, LayoutDashboard,
  BookOpen, Link2, Wallet, Settings, Menu, X, Copy, CheckCircle, IndianRupee, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import Tree from 'react-d3-tree';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const Sidebar = ({ active, setActive, sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'referrals', label: 'My Referrals', icon: Users },
    { id: 'tree', label: 'Referral Tree', icon: Link2 },
    { id: 'admissions', label: 'Admissions', icon: BookOpen },
    { id: 'earnings', label: 'Earnings', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, display: 'none' }} className="md:hidden block" />
      )}
      <aside className="sidebar" style={{ transform: sidebarOpen ? 'translateX(0)' : undefined }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Monitor size={20} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: '800', fontFamily: 'Outfit', fontSize: '1rem' }}>IGCIM</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', letterSpacing: '0.08em' }}>COMPUTER CENTRE</div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div style={{ padding: '1.25rem', margin: '0.75rem', background: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #00B4D8, #0096BB)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '1rem' }}>{user?.fullName?.[0]}</span>
          </div>
          <div style={{ color: 'white', fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.15rem' }}>{user?.fullName}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>{user?.systemId}</div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '0.5rem 0' }}>
          {links.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActive(id); setSidebarOpen(false); }}
              className={`sidebar-link ${active === id ? 'active' : ''}`}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem' }}>
          <button onClick={logout} className="sidebar-link" style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', color: '#fca5a5' }}>
            <LogOut size={18} /> Logout
          </button>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', textAlign: 'center', marginTop: '0.75rem' }}>+91 93390-28840</div>
        </div>
      </aside>
    </>
  );
};

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [referralTree, setReferralTree] = useState(null);
  const [admissions, setAdmissions] = useState([]);
  const [copied, setCopied] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', upi_id: '' });
  
  // Admission Modal State
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [admissionForm, setAdmissionForm] = useState({
    course_id: '', payment_mode: 'upi', payment_reference: '', payment_proof: null
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, earn, refs, tree, adms, crs] = await Promise.all([
          api.get('/dashboard/student'),
          api.get('/commissions/summary'),
          api.get('/referrals/stats'),
          api.get('/referrals/tree'),
          api.get('/admissions?limit=50'),
          api.get('/courses') // public list
        ]);
        setData(dash.data.data);
        setEarnings(earn.data.data);
        setReferralStats(refs.data.data);
        setReferralTree(tree.data.data);
        setAdmissions(adms.data.data || []);
        setCourses(crs.data.data || []);
      } catch (err) {
        console.error('Dashboard load error', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user?.referralCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user?.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert referral tree to react-d3-tree format
  const toTreeData = (node) => ({
    name: node.full_name || node.root?.full_name || 'You',
    attributes: { ID: node.system_id || node.root?.system_id },
    children: (node.children || []).map(toTreeData),
  });

  const getStatusBadge = (status) => (
    <span className={`badge badge-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
  );

  const stat = data?.referrals || {};
  const earn = data?.earnings || {};

  const handleAdmissionSubmit = async (e) => {
    e.preventDefault();
    if (!admissionForm.course_id || !admissionForm.payment_reference) {
      return toast.error("Please fill required fields (Course & Txn Reference)");
    }
    
    // Construct FormData
    const formData = new FormData();
    formData.append('course_id', admissionForm.course_id);
    formData.append('payment_mode', admissionForm.payment_mode);
    formData.append('payment_reference', admissionForm.payment_reference);
    formData.append('student_name', user?.fullName || '');
    formData.append('student_mobile', user?.mobile || '');
    formData.append('student_email', user?.email || '');
    if (user?.referralCode) formData.append('referral_code', user?.referralCode);
    if (admissionForm.payment_proof) formData.append('payment_receipt', admissionForm.payment_proof);

    try {
      const res = await api.post('/admissions/online', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message || 'Admission submitted!');
      setShowAdmissionModal(false);
      setAdmissionForm({ course_id: '', payment_mode: 'upi', payment_reference: '', payment_proof: null });
      
      // reload admissions
      const admRes = await api.get('/admissions?limit=50');
      setAdmissions(admRes.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit admission');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F4FF' }}>
      <Sidebar active={active} setActive={setActive} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="main-content">
        {/* Top bar */}
        <div style={{ background: 'white', borderBottom: '1px solid rgba(10,36,99,0.08)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0A2463', padding: '0.25rem' }}>
              <Menu size={22} />
            </button>
            <div>
              <div style={{ fontWeight: '700', color: '#0A2463', fontSize: '1rem', fontFamily: 'Outfit' }}>
                {active === 'dashboard' ? 'Dashboard' : active === 'referrals' ? 'My Referrals' : active === 'tree' ? 'Referral Tree' : active === 'earnings' ? 'Earnings' : active.charAt(0).toUpperCase() + active.slice(1)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Welcome back, {user?.fullName?.split(' ')[0]}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#F0F4FF', border: '1px solid rgba(10,36,99,0.1)', borderRadius: '10px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>Code:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0A2463' }}>{user?.referralCode}</span>
              <button onClick={copyReferralCode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#10b981' : '#00B4D8', display: 'flex', alignItems: 'center' }}>
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', borderColor: 'rgba(10,36,99,0.2)', borderTopColor: '#0A2463' }} />
            </div>
          ) : (
            <>
              {(active === 'dashboard' || active === 'referrals') && (
                <>
                  {/* Stat Cards */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                      { label: 'Total Referrals', value: stat.total || 0, icon: Users, color: '#0A2463', sub: 'Registered students' },
                      { label: 'Pending', value: stat.pending || 0, icon: Clock, color: '#f59e0b', sub: `Pending ₹${((stat.pending || 0) * 600).toLocaleString()}` },
                      { label: 'Approved', value: stat.approved || 0, icon: CheckCircle, color: '#10b981', sub: `Earned ₹${((stat.approved || 0) * 1200).toLocaleString()}` },
                      { label: 'Total Earnings', value: `₹${parseFloat(earn.total_earnings || 0).toLocaleString()}`, icon: IndianRupee, color: '#F4A261', sub: `Available: ₹${parseFloat(earn.pending_earnings || 0).toLocaleString()}`, gold: true },
                    ].map((s, i) => (
                      <motion.div key={i} className="stat-card" style={{ background: s.gold ? 'linear-gradient(135deg, #0A2463, #1a3a8f)' : 'white' }}
                        whileHover={{ y: -4 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: s.gold ? 'rgba(255,255,255,0.15)' : `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <s.icon size={20} color={s.gold ? '#F4A261' : s.color} />
                          </div>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '800', color: s.gold ? 'white' : s.color, fontFamily: 'Outfit', marginBottom: '0.25rem' }}>{s.value}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: s.gold ? 'rgba(255,255,255,0.9)' : '#374151', marginBottom: '0.2rem' }}>{s.label}</div>
                        <div style={{ fontSize: '0.72rem', color: s.gold ? 'rgba(255,255,255,0.55)' : '#94a3b8' }}>{s.sub}</div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Charts Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(10,36,99,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontWeight: '700', color: '#0A2463', fontSize: '0.95rem' }}>Monthly Earnings</h3>
                        <span style={{ fontSize: '0.75rem', color: '#00B4D8', fontWeight: '600' }}>Last 7 months</span>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={earnings?.monthly || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,36,99,0.06)" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <Tooltip formatter={(v) => [`₹${v}`, 'Earnings']} contentStyle={{ borderRadius: '10px', border: '1px solid rgba(10,36,99,0.1)' }} />
                          <Line type="monotone" dataKey="amount" stroke="#00B4D8" strokeWidth={2.5} dot={{ fill: '#00B4D8', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(10,36,99,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontWeight: '700', color: '#0A2463', fontSize: '0.95rem' }}>Referral Growth</h3>
                        <span style={{ fontSize: '0.75rem', color: '#00B4D8', fontWeight: '600' }}>Last 7 months</span>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={referralStats?.monthly || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,36,99,0.06)" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid rgba(10,36,99,0.1)' }} />
                          <Bar dataKey="count" fill="#0A2463" radius={[5, 5, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </div>

                  {/* Bottom Row: Referrals table + Earnings Overview */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
                    {/* Referrals Table */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                      style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(10,36,99,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontWeight: '700', color: '#0A2463', fontSize: '0.95rem' }}>My Referrals</h3>
                        <button className="btn-outline" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>View All</button>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>System ID</th>
                              <th>Status</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(referralStats?.recent || []).length === 0 ? (
                              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No referrals yet. Share your code!</td></tr>
                            ) : (
                              referralStats.recent.map(r => (
                                <tr key={r.id}>
                                  <td style={{ fontWeight: '600', color: '#0A2463' }}>{r.full_name}</td>
                                  <td style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.8rem' }}>{r.system_id}</td>
                                  <td>{getStatusBadge(r.admission_status || 'pending')}</td>
                                  <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>

                    {/* Earnings Overview */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                      style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(10,36,99,0.06)', height: 'fit-content' }}>
                      <h3 style={{ fontWeight: '700', color: '#0A2463', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Earnings Overview</h3>
                      {[
                        { label: 'Referral Code', value: user?.referralCode, copy: true },
                        { label: 'Available Balance', value: `₹${parseFloat(earn.pending_earnings || 0).toLocaleString()}`, color: '#00B4D8' },
                        { label: 'Processing Payouts', value: `₹${parseFloat(earn.processing_earnings || 0).toLocaleString()}`, color: '#f59e0b' },
                        { label: 'Total Withdrawn', value: `₹${parseFloat(earn.paid_earnings || 0).toLocaleString()}`, color: '#10b981' },
                      ].map(item => (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(10,36,99,0.06)' }}>
                          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>{item.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: item.color || '#0A2463' }}>{item.value}</span>
                            {item.copy && (
                              <button onClick={copyReferralLink} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00B4D8', fontSize: '0.75rem', fontWeight: '600' }}>
                                {copied ? '✓' : 'Copy'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button onClick={() => setWithdrawModal(true)} className="btn-accent" style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', padding: '0.75rem', fontSize: '0.875rem' }}>
                        <Wallet size={16} /> Withdraw Funds
                      </button>
                    </motion.div>
                  </div>

                  {/* Security notice */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    style={{ marginTop: '1.25rem', background: 'linear-gradient(135deg, #0A2463, #1a3a8f)', borderRadius: '16px', padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {[
                      { icon: '🔐', title: 'OTP Verified', sub: 'Sign-up' },
                      { icon: '✅', title: 'Admin Approved', sub: 'Admissions' },
                      { icon: '📊', title: 'Real Time', sub: 'Dashboard' },
                    ].map(item => (
                      <div key={item.title} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '1.75rem' }}>{item.icon}</span>
                        <div>
                          <div style={{ color: 'white', fontWeight: '700', fontSize: '0.9rem' }}>{item.title}</div>
                          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>{item.sub}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </>
              )}

              {/* Referral Tree */}
              {active === 'tree' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(10,36,99,0.06)', height: '500px' }}>
                  <h3 style={{ fontWeight: '700', color: '#0A2463', marginBottom: '1rem' }}>Referral Network Tree</h3>
                  {referralTree ? (
                    <Tree
                      data={toTreeData(referralTree)}
                      orientation="vertical"
                      translate={{ x: 400, y: 80 }}
                      styles={{
                        nodes: { node: { circle: { fill: '#0A2463' }, name: { fill: '#0A2463', fontSize: 12 } }, leafNode: { circle: { fill: '#00B4D8' }, name: { fill: '#00B4D8', fontSize: 11 } } },
                        links: { stroke: '#00B4D8' },
                      }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%', color: '#94a3b8' }}>
                      No referral data yet. Start sharing your code!
                    </div>
                  )}
                </motion.div>
              )}

              {/* Admissions */}
              {active === 'admissions' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(10,36,99,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontWeight: '700', color: '#0A2463' }}>My Admissions</h3>
                    <button onClick={() => setShowAdmissionModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                      <Plus size={16} /> Apply for Course
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr><th>Course</th><th>Fee</th><th>Status</th><th>Mode</th><th>Date</th></tr>
                      </thead>
                      <tbody>
                        {admissions.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No admissions found.</td></tr>
                        ) : admissions.map(a => (
                          <tr key={a.id}>
                            <td style={{ fontWeight: '600', color: '#0A2463' }}>{a.course_name}</td>
                            <td>₹{parseFloat(a.snapshot_fee).toLocaleString()}</td>
                            <td>{getStatusBadge(a.status)}</td>
                            <td><span className="badge badge-info">{a.admission_mode || 'offline'}</span></td>
                            <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Earnings */}
              {active === 'earnings' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem' }}>
                    <h3 style={{ fontWeight: '700', color: '#0A2463', marginBottom: '1.25rem' }}>Commission History</h3>
                    <div style={{ background: '#F0F4FF', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Total Earned', value: `₹${parseFloat(earn.total_earnings || 0).toLocaleString()}`, color: '#0A2463' },
                          { label: 'Available', value: `₹${parseFloat(earn.pending_earnings || 0).toLocaleString()}`, color: '#00B4D8' },
                          { label: 'Processing', value: `₹${parseFloat(earn.processing_earnings || 0).toLocaleString()}`, color: '#f59e0b' },
                          { label: 'Withdrawn', value: `₹${parseFloat(earn.paid_earnings || 0).toLocaleString()}`, color: '#10b981' },
                        ].map(s => (
                          <div key={s.label}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: s.color, fontFamily: 'Outfit' }}>{s.value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setWithdrawModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                      <Wallet size={16} /> Request Withdrawal
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Settings */}
              {active === 'settings' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                  {/* Profile Info */}
                  <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(10,36,99,0.06)' }}>
                    <h3 style={{ fontWeight: '700', color: '#0A2463', fontSize: '1rem', marginBottom: '1.25rem', fontFamily: 'Outfit' }}>👤 My Profile</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                      {[
                        { label: 'Full Name', value: user?.fullName },
                        { label: 'Email Address', value: user?.email },
                        { label: 'Mobile', value: user?.mobile },
                        { label: 'System ID', value: user?.systemId },
                        { label: 'Role', value: user?.role?.replace('_', ' ').toUpperCase() },
                        { label: 'Referral Code', value: user?.referralCode },
                      ].map(field => (
                        <div key={field.label} style={{ background: '#F8FAFF', borderRadius: '10px', padding: '0.875rem 1rem', border: '1px solid rgba(10,36,99,0.07)' }}>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>{field.label}</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0A2463' }}>{field.value || '—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Change Password */}
                  <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(10,36,99,0.06)' }}>
                    <h3 style={{ fontWeight: '700', color: '#0A2463', fontSize: '1rem', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>🔐 Change Password</h3>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem' }}>Reset your password securely using OTP sent to your email.</p>
                    <a href="/forgot-password" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', textDecoration: 'none', fontSize: '0.875rem' }}>
                      🔑 Reset Password via OTP
                    </a>
                  </div>

                  {/* Share Referral */}
                  <div style={{ background: 'linear-gradient(135deg, #0A2463, #1a3a8f)', borderRadius: '16px', padding: '1.5rem' }}>
                    <h3 style={{ fontWeight: '700', color: 'white', fontSize: '1rem', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>🔗 Share Your Referral Link</h3>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem' }}>Share this link to earn commission when friends enroll.</p>
                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {window.location.origin}/register?ref={user?.referralCode}
                      </span>
                      <button onClick={copyReferralLink} className="btn-accent" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {copied ? '✓ Copied!' : <><Copy size={14} /> Copy Link</>}
                      </button>
                    </div>
                  </div>

                  {/* Logout */}
                  <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <h3 style={{ fontWeight: '700', color: '#dc2626', fontSize: '1rem', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>🚪 Sign Out</h3>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem' }}>You will be signed out and redirected to the login page.</p>
                    <button onClick={logout} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '0.625rem 1.25rem', color: '#dc2626', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Withdraw Modal */}
      {withdrawModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: '800', color: '#0A2463', fontSize: '1.1rem', fontFamily: 'Outfit' }}>Withdraw Funds</h3>
              <button onClick={() => setWithdrawModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.post('/commissions/withdraw', withdrawForm);
                setWithdrawModal(false);
                alert('Withdrawal request submitted!');
              } catch (err) {
                alert(err.response?.data?.message || 'Failed to submit request');
              }
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Amount (₹)</label>
                <input type="number" className="form-input" placeholder="Enter amount" min={1} max={parseFloat(earn?.pending_earnings || 0)} required
                  value={withdrawForm.amount} onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">UPI ID</label>
                <input type="text" className="form-input" placeholder="your@upi" required
                  value={withdrawForm.upi_id} onChange={e => setWithdrawForm({ ...withdrawForm, upi_id: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setWithdrawModal(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Submit Request</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* OVERLAYS/MODALS MUST BE OUTSIDE MAIN CONTENT */}
      {showAdmissionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,36,99,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(10,36,99,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFF' }}>
              <h3 style={{ fontWeight: '800', color: '#0A2463', fontSize: '1.2rem', fontFamily: 'Outfit' }}>Online Admission</h3>
              <button onClick={() => setShowAdmissionModal(false)} style={{ background: 'white', border: '1px solid #e2e8f0', width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAdmissionSubmit} style={{ padding: '1.5rem' }}>
              
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>Select Course <span style={{ color: 'red' }}>*</span></label>
                <select className="form-input" required value={admissionForm.course_id} onChange={e => setAdmissionForm({ ...admissionForm, course_id: e.target.value })}>
                  <option value="">-- Choose a Course --</option>
                  {courses.filter(c => c.is_active).map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Fee: ₹{c.fee})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>Payment Mode</label>
                  <select className="form-input" value={admissionForm.payment_mode} onChange={e => setAdmissionForm({ ...admissionForm, payment_mode: e.target.value })}>
                    <option value="upi">UPI</option>
                    <option value="netbanking">Net Banking</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>Txn Reference ID <span style={{ color: 'red' }}>*</span></label>
                  <input type="text" className="form-input" required placeholder="UTR / Ref No." value={admissionForm.payment_reference} onChange={e => setAdmissionForm({ ...admissionForm, payment_reference: e.target.value })} />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>Payment Receipt Image (Optional)</label>
                <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <input type="file" accept="image/*" onChange={e => setAdmissionForm({ ...admissionForm, payment_proof: e.target.files[0] })} style={{ fontSize: '0.8rem', color: '#64748b' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setShowAdmissionModal(false)} className="btn-outline" style={{ flex: 1, padding: '0.75rem' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2, padding: '0.75rem' }}>Submit Admission</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
