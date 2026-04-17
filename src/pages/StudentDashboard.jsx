import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Users, TrendingUp, DollarSign, Clock, LogOut, Monitor, LayoutDashboard,
  BookOpen, Link2, Wallet, Settings, Menu, X, Copy, CheckCircle, IndianRupee, Plus, Layout, Trophy, Coins,
  AlertCircle, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import Leaderboard from '../components/Leaderboard';
import toast from 'react-hot-toast';
import Tree from 'react-d3-tree';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import NotificationBell from '../components/NotificationBell';
import ThemeToggle from '../components/ThemeToggle';
import ICIcon from '../components/ICIcon';
import LoginCalendar from '../components/LoginCalendar';


const Sidebar = ({ active, setActive, sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'referrals', label: 'My Referrals', icon: Users },
    { id: 'tree', label: 'Referral Tree', icon: Link2 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'earnings', label: 'Earnings', icon: Wallet },
    { id: 'profile', label: 'My Profile', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 40 }} className="lg:hidden" />
        )}
      </AnimatePresence>

      <aside className="sidebar" style={{ transform: sidebarOpen ? 'translateX(0)' : undefined, width: 'var(--sidebar-width)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {/* Logo */}
        <div style={{ padding: 'var(--space-card)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Monitor size={20} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: '800', fontFamily: 'Outfit', fontSize: '1rem' }}>IGCIM</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', letterSpacing: '0.08em' }} className="hidden xs:block">COMPUTER CENTRE</div>
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
  const { user, logout, updateUser } = useAuth();
  const [active, setActive] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [referralTree, setReferralTree] = useState(null);
  const [admissions, setAdmissions] = useState([]);
  const [copied, setCopied] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', upi_id: '' });
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);

  const [settings, setSettings] = useState({ ic_conversion_rate: '1.0' });
  const [profileForm, setProfileForm] = useState({ full_name: '', education: '', address: '', bio: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tree Centering Logic
  const treeContainerRef = useRef(null);
  const [treeTranslate, setTreeTranslate] = useState({ x: 200, y: 80 });
  const [treeDims, setTreeDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (active !== 'tree' || !treeContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setTreeDims({ width, height });
          setTreeTranslate({ x: width / 2, y: 80 });
        }
      }
    });

    observer.observe(treeContainerRef.current);
    return () => observer.disconnect();
  }, [active, referralTree]);

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      // Parallel fetch for speed
      const [dash, statsRes, earn, refs, tree, withdrawalsRes, settingsRes, bonusesRes, profileRes, commsRes] = await Promise.all([
        api.get('/dashboard/student'),
        api.get('/dashboard/stats'),
        api.get('/commissions/summary'),
        api.get('/referrals/stats'),
        api.get('/referrals/tree'),
        api.get('/commissions/withdrawals?limit=50'),
        api.get('/settings'),
        api.get('/users/bonuses'),
        api.get('/users/profile'),
        api.get(`/commissions?page=${page}&limit=5`)
      ]);

      setData(dash.data.data);
      setStats(statsRes.data.data);
      setEarnings(earn.data.data);
      setReferralStats(refs.data.data);
      setReferralTree(tree.data.data);
      setWithdrawals(withdrawalsRes.data.data || []);
      setBonuses(bonusesRes.data.data || []);
      setCommissions(commsRes.data.data || []);
      if (commsRes.data.pagination) {
        setTotalPages(Math.ceil(commsRes.data.pagination.total / commsRes.data.pagination.limit));
      }
      if (settingsRes) setSettings(settingsRes.data.data || { ic_conversion_rate: '1.0' });
      
      const currentProfile = profileRes.data.data || {};
      if (active !== 'profile') {
        setProfileForm({
          full_name: currentProfile.full_name || '',
          education: currentProfile.education || '',
          address: currentProfile.address || '',
          bio: currentProfile.bio || ''
        });
      }
    } catch (err) {
      console.error('Critical Dashboard Fetch Failure:', err);
      // Determine what exactly failed for better user feedback
      const errorMsg = err.response?.data?.message || 'Connection lost. Retrying...';
      setError('Dashboard unavailable. Please check your connection.');
      toast.error(errorMsg);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [active, page]); // Re-create if active tab or page changes

  // Auto-refresh on tab change or window focus
  useEffect(() => {
    loadData();

    const onFocus = () => loadData(false);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadData, active]);

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

  const conversionRate = stats?.total_referrals > 0 ? Math.round(((stats.total_admissions || 0) / stats.total_referrals) * 100) : 0;
  const funnelData = [
    { name: 'Total Referrals', value: stats?.total_referrals || 0, fill: '#6366f1' },
    { name: 'Pending Leads', value: stats?.total_leads || 0, fill: '#f59e0b' },
    { name: 'Approved', value: stats?.total_admissions || 0, fill: '#10b981' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', width: '100%', maxWidth: '100vw' }}>
      <Sidebar active={active} setActive={setActive} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="main-content">
        {/* Top bar */}
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', position: 'sticky', top: 0, zIndex: 30, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '0.25rem' }} className="lg:hidden">
              <Menu size={22} />
            </button>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'Outfit' }}>
                {active === 'dashboard' ? 'Dashboard' : active === 'referrals' ? 'My Referrals' : active === 'tree' ? 'Referral Tree' : active === 'leaderboard' ? 'Leaderboard' : active === 'earnings' ? 'Earnings' : active.charAt(0).toUpperCase() + active.slice(1)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }} className="hidden sm:block">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => setShowCalendar(true)} 
              className="btn-primary" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.45rem 0.875rem', 
                fontSize: '0.75rem', 
                background: 'linear-gradient(135deg, #10b981, #059669)', 
                border: 'none', 
                borderRadius: '10px', 
                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' 
              }}
            >
              📅 Daily Rewards
            </button>
            <ThemeToggle />
            <NotificationBell scope="student" />
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }} className="hidden lg:flex">
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>{user?.referralCode}</span>
              <button onClick={copyReferralCode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#10b981' : 'var(--accent)', display: 'flex', alignItems: 'center' }}>
                {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
              </button>
            </div>
            <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)' }} className="lg:hidden">
              <Menu size={20} />
            </button>
          </div>
        </div>

        <div style={{ padding: 'var(--space-page)' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', borderColor: 'var(--border)', borderTopColor: 'var(--text-primary)' }} />
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <AlertCircle size={40} color="var(--danger)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Oops! Something went wrong</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
              <button onClick={() => window.location.reload()} className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                <RefreshCw size={16} /> Retry Now
              </button>
            </div>
          ) : (
            <>
              {active === 'dashboard' && (
                <>
                  {/* Stat Cards */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    {[
                      { label: 'Total Referrals', value: stats?.total_referrals || 0, icon: Users, color: 'var(--primary)', sub: 'Registered students' },
                      { label: 'Leads (Pending)', value: stats?.total_leads || 0, icon: Clock, color: 'var(--warning)', sub: `Pending Approval` },
                      { label: 'Total Reward Points', value: (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                          <ICIcon size={24} /> {parseFloat((stats?.total_commission || 0) / (settings.ic_conversion_rate || 1)).toLocaleString()}
                        </div>
                      ), icon: Coins, color: '#F4A261', sub: `Earnings (IC)`, gold: true },
                    ].map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <motion.div key={i} className="stat-card" style={{ background: s.gold ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'var(--bg-card)' }}
                          whileHover={{ y: -4 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: s.gold ? 'rgba(255,255,255,0.15)' : `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon size={20} color={s.gold ? '#F4A261' : s.color} />
                            </div>
                          </div>
                          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: s.gold ? 'white' : 'var(--text-primary)', fontFamily: 'Outfit', marginBottom: '0.25rem' }}>{s.value}</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: s.gold ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)', marginBottom: '0.2rem' }}>{s.label}</div>
                          <div style={{ fontSize: '0.72rem', color: s.gold ? 'rgba(255,255,255,0.55)' : 'var(--text-secondary)' }}>{s.sub}</div>
                        </motion.div>
                      );
                    })}
                  </motion.div>

                  {/* Charts Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                      style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Referral Funnel</h3>
                        <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '800' }}>{conversionRate}% Conversion</span>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                          <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontWeight: 600 }} axisLine={false} tickLine={false} width={100} />
                          <Tooltip
                            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-primary)' }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                            labelStyle={{ color: 'var(--text-secondary)', fontWeight: 700 }}
                          />
                          <Bar dataKey="value" name="Count" radius={[0, 8, 8, 0]} maxBarSize={22}>
                            {funnelData.map((entry, idx) => (
                              <Cell key={idx} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Monthly Earnings</h3>
                        <span style={{ fontSize: '0.75rem', color: '#00B4D8', fontWeight: '600' }}>Last 7 months</span>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={earnings?.monthly || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                          <Tooltip content={(props) => {
                            if (props.active && props.payload && props.payload.length) {
                              return (
                                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                                  <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{props.label}</div>
                                  <div style={{ color: '#00B4D8', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <ICIcon size={12} /> {props.payload[0].value}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }} />
                          <Line type="monotone" dataKey="amount" stroke="#00B4D8" strokeWidth={2.5} dot={{ fill: '#00B4D8', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Referral Growth</h3>
                        <span style={{ fontSize: '0.75rem', color: '#00B4D8', fontWeight: '600' }}>Last 7 months</span>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={referralStats?.monthly || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                          <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                          <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.8rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                          <Bar dataKey="count" fill="#3b82f6" radius={[5, 5, 0, 0]} maxBarSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </div>

                  {/* New Full Width Summary Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                      style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Recent Referrals</h3>
                        <button onClick={() => setActive('referrals')} className="btn-outline" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>View All</button>
                      </div>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead>
                            <tr><th>Name</th><th>System ID</th><th>Status</th><th>Date</th></tr>
                          </thead>
                          <tbody>
                            {(referralStats?.recent || []).length === 0 ? (
                              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No referrals yet. Share your code!</td></tr>
                            ) : (
                              (referralStats?.recent || []).slice(0, 5).map(r => (
                                <tr key={r.id}>
                                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{r.full_name}</td>
                                  <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{r.system_id}</td>
                                  <td>{getStatusBadge(r.admission_status || 'pending')}</td>
                                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  </div>
                </>
              )}

              {/* === LEADERBOARD === */}
              {active === 'leaderboard' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Leaderboard />
                </motion.div>
              )}

              {active === 'referrals' && (
                <>
                  {/* Referral Specific Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                      { label: 'Total Referrals', value: stats?.total_referrals || 0, icon: Users, color: 'var(--text-primary)' },
                      { label: 'Pending Approval', value: stats?.total_leads || 0, icon: Clock, color: '#f59e0b' },
                      { label: 'Approved Admissions', value: stats?.total_admissions || 0, icon: CheckCircle, color: '#10b981' },
                    ].map((s, i) => (
                      <div key={i} className="stat-card" style={{ background: 'var(--bg-card)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <s.icon size={20} color={s.color} />
                          </div>
                          <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: s.color, fontFamily: 'Outfit' }}>{s.value}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{s.label}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Full width Table */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden' }}>
                    <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Full Referral List</h3>
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Student Name</th>
                            <th>Contact Info</th>
                            <th>System ID</th>
                            <th>Status</th>
                            <th>Date Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                            { (referralStats?.recent || []).length === 0 ? (
                              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>No referrals found.</td></tr>
                            ) : referralStats.recent.map(r => (
                            <tr key={r.id}>
                              <td>
                                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{r.full_name}</div>
                                <div style={{ fontSize: '0.7rem', color: '#00B4D8' }}>ID: {r.system_id}</div>
                              </td>
                              <td>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{r.mobile || '—'}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{r.email || '—'}</div>
                              </td>
                              <td style={{ fontFamily: 'monospace' }}>{r.system_id}</td>
                              <td>{getStatusBadge(r.admission_status || 'pending')}</td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>


                  {/* Security notice */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    style={{ marginTop: '1.25rem', background: 'linear-gradient(135deg, var(--text-primary), #1a3a8f)', borderRadius: '16px', padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
                  style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden', height: '500px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem', flexShrink: 0 }}>Referral Network Tree</h3>
                  {referralTree ? (
                    <div ref={treeContainerRef} style={{ flex: 1, minHeight: 0, width: '100%', position: 'relative' }}>
                      {treeDims.width > 0 && (
                        <Tree
                          data={toTreeData(referralTree)}
                          orientation="vertical"
                          translate={treeTranslate}
                          dimensions={treeDims}
                          pathFunc="step"
                          renderCustomNodeElement={({ nodeDatum, toggleNode }) => (
                            <g>
                              <circle r="12" fill={nodeDatum.children?.length > 0 ? "#3b82f6" : "#10b981"} onClick={toggleNode} stroke="var(--bg-card)" strokeWidth="2" style={{ cursor: 'pointer' }} />
                              <text fill="var(--text-primary)" strokeWidth="0" x="18" dy="4" fontSize="13px" fontWeight="700">
                                {nodeDatum.name}
                              </text>
                              {nodeDatum.attributes?.ID && (
                                <text fill="var(--text-secondary)" x="18" dy="18" fontSize="11px">
                                  ID: {nodeDatum.attributes.ID}
                                </text>
                              )}
                            </g>
                          )}
                        />
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%', color: 'var(--text-secondary)' }}>
                      No referral data yet. Start sharing your code!
                    </div>
                  )}
                </motion.div>
              )}



              {/* Earnings */}
              {active === 'earnings' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', minWidth: 0, overflow: 'hidden' }}>
                    <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Commission History</h3>
                    <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Total Earned (IC)', value: (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <ICIcon size={24} /> {parseFloat((earnings?.summary?.total_earnings || 0) / (settings.ic_conversion_rate || 1)).toLocaleString()}
                            </div>
                          ), color: '#3b82f6' },
                          { label: 'Current Balance (IC)', value: (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <ICIcon size={24} /> {parseFloat((earnings?.summary?.pending_earnings || 0) / (settings.ic_conversion_rate || 1)).toLocaleString()}
                            </div>
                          ), color: '#00B4D8' },
                          { label: 'Current Balance (₹)', value: `₹${parseFloat(earnings?.summary?.pending_earnings || 0).toLocaleString()}`, color: '#10b981' },
                          { label: 'Processing (IC)', value: (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <ICIcon size={24} /> {parseFloat((earnings?.summary?.processing_earnings || 0) / (settings.ic_conversion_rate || 1)).toLocaleString()}
                            </div>
                          ), color: '#f59e0b' },
                          { label: 'Paid Out (IC)', value: (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <ICIcon size={24} /> {parseFloat((earnings?.summary?.paid_earnings || 0) / (settings.ic_conversion_rate || 1)).toLocaleString()}
                            </div>
                          ), color: '#ef4444' },
                          { label: 'Commission Tier', value: (() => {
                            const adm = stats?.total_admissions || 0;
                            let currentTier = 'Standard';
                            let nextTier = 'Silver';
                            let max = 5;
                            let percent = (adm / max) * 100;
                            if (adm >= 15) { currentTier = 'Platinum (+0.35%)'; nextTier = 'Max'; max = 15; percent = 100; }
                            else if (adm >= 10) { currentTier = 'Gold (+0.20%)'; nextTier = 'Platinum'; max = 15; percent = ((adm - 10) / 5) * 100; }
                            else if (adm >= 5) { currentTier = 'Silver (+0.10%)'; nextTier = 'Gold'; max = 10; percent = ((adm - 5) / 5) * 100; }
                            
                            return (
                              <div style={{ width: '100%', minWidth: '150px' }}>
                                <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                  {currentTier}
                                </div>
                                {adm < 15 && (
                                  <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                    <motion.div 
                                      initial={{ width: 0 }} 
                                      animate={{ width: `${percent}%` }} 
                                      style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #c084fc)', borderRadius: '4px' }} 
                                    />
                                  </div>
                                )}
                                {adm < 15 && (
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>
                                    {adm} / {max} for {nextTier}
                                  </div>
                                )}
                              </div>
                            );
                          })(), color: '#8b5cf6' },
                        ].map(s => (
                          <div key={s.label} style={s.label === 'Commission Tier' ? { gridColumn: '1 / -1', maxWidth: '300px', marginTop: '4px' } : {}}>
                            <div style={s.label !== 'Commission Tier' ? { fontSize: '1.5rem', fontWeight: '800', color: s.color, fontFamily: 'Outfit' } : {}}>{s.value}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button 
                        onClick={() => {
                          if ((stats?.total_admissions || 0) < 1) {
                            toast.error('You need at least 1 successful admission to request withdrawal.');
                            return;
                          }
                          setWithdrawModal(true);
                        }} 
                        className="btn-primary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', opacity: (stats?.total_admissions || 0) < 1 ? 0.6 : 1 }}
                      >
                        <Wallet size={16} /> Request Withdrawal
                      </button>
                      {(stats?.total_admissions || 0) < 1 && (
                        <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '600' }}>
                          ⚠️ Unlock withdrawals after your first successful admission
                        </span>
                      )}
                    </div>
                    
                    <div style={{ marginTop: '2.5rem' }}>
                      <h4 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Commission History</h4>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead>
                            <tr><th>Admission</th><th>Course Fee</th><th>Earned (IC)</th><th>Status</th><th>Date</th></tr>
                          </thead>
                          <tbody>
                            {commissions.length === 0 ? (
                              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No commissions earned yet.</td></tr>
                            ) : commissions.map(c => (
                              <tr key={c.id}>
                                <td>
                                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{c.student_name}</div>
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{c.course_name}</div>
                                </td>
                                <td>₹{parseFloat(c.snapshot_fee).toLocaleString()}</td>
                                <td style={{ fontWeight: '700', color: '#10b981' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <ICIcon size={14} /> {parseFloat(c.amount / (settings.ic_conversion_rate || 1)).toLocaleString()}
                                  </div>
                                </td>
                                <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                          <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="btn-outline" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChevronLeft size={16} />
                          </button>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Page {page} of {totalPages}</span>
                          <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="btn-outline" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '2.5rem' }}>
                      <h4 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Reward & milestone History</h4>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead>
                            <tr><th>Reward Type</th><th>Amount</th><th>Date</th></tr>
                          </thead>
                          <tbody>
                            {bonuses.length === 0 ? (
                              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No milestone rewards yet.</td></tr>
                            ) : bonuses.map(b => (
                              <tr key={b.id}>
                                <td style={{ fontWeight: '600', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                                  {b.bonus_type.replace(/_/g, ' ')}
                                </td>
                                <td style={{ fontWeight: '700', color: '#10b981' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <ICIcon size={14} /> {parseFloat(b.amount / (settings.ic_conversion_rate || 1)).toLocaleString()}
                                  </div>
                                </td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(b.created_at).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div style={{ marginTop: '2.5rem' }}>
                      <h4 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Withdrawal History</h4>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead>
                            <tr><th>Amount</th><th>Status</th><th>Date</th><th>Receipt</th></tr>
                          </thead>
                          <tbody>
                            {withdrawals.length === 0 ? (
                              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No withdrawals yet.</td></tr>
                            ) : withdrawals.map(w => (
                              <tr key={w.id}>
                                <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <ICIcon size={14} /> {parseFloat(w.amount / (settings.ic_conversion_rate || 1)).toLocaleString()}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>₹{parseFloat(w.inr_amount).toLocaleString()}</div>
                                </td>
                                <td>{getStatusBadge(w.status)}</td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(w.created_at).toLocaleDateString()}</td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Clock size={12} style={{ color: w.status === 'paid' ? '#10b981' : '#f59e0b' }} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: '500', color: w.status === 'paid' ? '#10b981' : 'var(--text-secondary)' }}>
                                      {w.status === 'paid' ? 'Processed' : 'Awaiting Payout'}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Settings */}
              {active === 'settings' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                  {/* Profile Info */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '1.25rem', fontFamily: 'Outfit' }}>👤 My Profile</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                      {[
                        { label: 'Full Name', value: user?.fullName },
                        { label: 'Email Address', value: user?.email },
                        { label: 'Mobile', value: user?.mobile },
                        { label: 'System ID', value: user?.systemId },
                        { label: 'Role', value: user?.role?.replace('_', ' ').toUpperCase() },
                        { label: 'Referral Code', value: user?.referralCode },
                      ].map(field => (
                        <div key={field.label} style={{ background: 'var(--bg)', borderRadius: '10px', padding: '0.875rem 1rem', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>{field.label}</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{field.value || '—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Change Password */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>🔐 Change Password</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Reset your password securely using OTP sent to your email.</p>
                    <a href="/forgot-password" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', textDecoration: 'none', fontSize: '0.875rem' }}>
                      🔑 Reset Password via OTP
                    </a>
                  </div>

                  {/* Share Referral */}
                  <div style={{ background: 'linear-gradient(135deg, var(--text-primary), #1a3a8f)', borderRadius: '16px', padding: '1.5rem' }}>
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
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <h3 style={{ fontWeight: '700', color: '#dc2626', fontSize: '1rem', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>🚪 Sign Out</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>You will be signed out and redirected to the login page.</p>
                    <button onClick={logout} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '0.625rem 1.25rem', color: '#dc2626', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Profile */}
              {active === 'profile' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Users size={32} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'Outfit', color: 'var(--text-primary)' }}>Personal Profile</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Complete your profile to earn a one-time reward of 1.5 IC (₹1.50).</p>
                      </div>
                    </div>



                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      setProfileLoading(true);
                      try {
                        const res = await api.patch('/users/profile', profileForm);
                        toast.success(res.data.message);
                        
                        // 1. Optimistic Context Sync (Instant Name Change)
                        if (res.data.updatedUser) {
                          updateUser(res.data.updatedUser);
                        }

                        // 2. Optimistic Stats Patch (Instant +₹1.50 = 1.5 IC)
                        if (res.data.bonus_granted) {
                          setStats(prev => ({
                            ...prev,
                            total_commission: (prev.total_commission || 0) + 1.50
                          }));
                          toast.success('🎁 +1.5 IC Profile Bonus Credited!');
                        }

                        // 3. Force LocalStorage Sync & Background fetch
                        localStorage.setItem('igcim_user', JSON.stringify({ ...user, ...res.data.updatedUser }));
                        await loadData(false);
                      } catch (err) {
                        toast.error(err.response?.data?.message || 'Update failed');
                      } finally {
                        setProfileLoading(false);
                      }
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                        <div>
                          <label className="form-label">Full Name</label>
                          <input type="text" className="form-input" required value={profileForm.full_name} onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })} />
                        </div>
                        <div>
                          <label className="form-label">Qualification / Education</label>
                          <input type="text" className="form-input" placeholder="e.g. BCA Student" value={profileForm.education} onChange={e => setProfileForm({ ...profileForm, education: e.target.value })} />
                        </div>
                      </div>

                      <div>
                        <label className="form-label">Full Address</label>
                        <textarea className="form-input" rows={3} placeholder="Complete postal address" value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} style={{ resize: 'none' }}></textarea>
                      </div>

                      <div>
                        <label className="form-label">Personal Bio / Experience</label>
                        <textarea className="form-input" rows={3} placeholder="Tell us about yourself..." value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} style={{ resize: 'none' }}></textarea>
                      </div>

                      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" disabled={profileLoading} className="btn-primary" style={{ padding: '0.75rem 2rem', height: 'auto' }}>
                          {profileLoading ? 'Saving...' : (user?.profileCompleted ? 'Save Changes' : 'Update & Claim Bonus')}
                        </button>
                      </div>
                    </form>
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
            style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '2rem', width: 'min(95%, 420px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.1rem', fontFamily: 'Outfit' }}>Withdraw Funds</h3>
              <button onClick={() => setWithdrawModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const icAmount = parseFloat(withdrawForm.amount);
              const maxAmount = parseFloat((earnings?.summary?.pending_earnings || 0) / (settings.ic_conversion_rate || 1));
              
              if (icAmount < 100) {
                toast.error('Minimum withdrawal amount is 100 IC.');
                return;
              }
              if (icAmount > maxAmount) {
                toast.error(`You only have ${maxAmount.toLocaleString()} IC available to withdraw.`);
                return;
              }

              setWithdrawLoading(true);
              try {
                await api.post('/commissions/withdraw', withdrawForm);
                setWithdrawModal(false);
                setWithdrawForm({ amount: '', upi_id: '' });
                toast.success('Withdrawal request submitted!');
                
                // Full refresh to update "Balance IC" instantly
                await loadData(false);
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to submit request');
              } finally {
                setWithdrawLoading(false);
              }
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Amount (IC Credits)</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
                    <ICIcon size={18} />
                  </div>
                  <input type="number" className="form-input" style={{ paddingLeft: '3rem' }} placeholder="Enter points (Min: 100)" required
                    value={withdrawForm.amount} onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} />
                </div>
                {withdrawForm.amount && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>
                     = ₹{parseFloat(withdrawForm.amount).toLocaleString()} (1 IC = ₹1)
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">UPI ID</label>
                <input type="text" className="form-input" placeholder="your@upi" required
                  value={withdrawForm.upi_id} onChange={e => setWithdrawForm({ ...withdrawForm, upi_id: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setWithdrawModal(false)} className="btn-outline" disabled={withdrawLoading} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={withdrawLoading} style={{ flex: 1, justifyContent: 'center' }}>
                  {withdrawLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      <LoginCalendar 
        isOpen={showCalendar} 
        onClose={() => setShowCalendar(false)} 
        onCheckInSuccess={() => loadData(false)}
      />
    </div>
  );
}
